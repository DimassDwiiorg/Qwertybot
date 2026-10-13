import { db } from './db.js';
import { config } from '../config.js';
import { QuotaInfo } from '../types/index.js';

export function formatResetTime(msRemaining: number): string {
  if (msRemaining <= 0) return 'segera';
  const totalMinutes = Math.ceil(msRemaining / (60 * 1000));
  const days = Math.floor(totalMinutes / (24 * 60));
  const hours = Math.floor((totalMinutes % (24 * 60)) / 60);
  const minutes = totalMinutes % 60;

  const parts: string[] = [];
  if (days > 0) parts.push(`${days} hari`);
  if (hours > 0) parts.push(`${hours} jam`);
  if (days === 0 && minutes > 0) parts.push(`${minutes} menit`);

  return parts.join(' ') || '1 menit';
}

class QuotaService {
  private getCooldownMs(): number {
    return (config.quota?.cooldownDays || 3) * 24 * 60 * 60 * 1000;
  }

  private getMaxQuota(isLoggedIn: boolean): number {
    const guestLimit = config.quota?.guestLimit || 20;
    const bonusPercent = config.quota?.loginBonusPercent || 15;
    if (isLoggedIn) {
      // Tambahan 15% untuk user login (20 * 1.15 = 23)
      return Math.round(guestLimit * (1 + bonusPercent / 100));
    }
    return guestLimit;
  }

  /**
   * Mengambil status kuota pengguna saat ini
   */
  public getQuota(id: string, isLoggedIn: boolean, isOwner?: boolean): QuotaInfo {
    if (isOwner) {
      const row = db.prepare('SELECT used_count FROM quotas WHERE id = ?').get(id) as any;
      const usedCount = row ? row.used_count : 0;
      return {
        isLoggedIn: true,
        isOwner: true,
        isUnlimited: true,
        maxQuota: 999999,
        usedCount,
        remaining: 999999,
        resetAt: 0,
        resetInSeconds: 0,
        isExhausted: false,
        formattedResetTime: 'Unlimited'
      };
    }

    const now = Date.now();
    const cooldownMs = this.getCooldownMs();
    const maxQuota = this.getMaxQuota(isLoggedIn);

    const row = db.prepare('SELECT * FROM quotas WHERE id = ?').get(id) as any;

    if (!row) {
      // Inisialisasi kuota baru untuk identifier ini
      const periodStart = now;
      const resetAt = now + cooldownMs;

      db.prepare(`
        INSERT INTO quotas (id, identifier_type, is_logged_in, used_count, max_quota, period_start, reset_at, exhausted_at)
        VALUES (?, ?, ?, 0, ?, ?, ?, NULL)
      `).run(
        id,
        isLoggedIn ? 'user' : 'ip',
        isLoggedIn ? 1 : 0,
        maxQuota,
        periodStart,
        resetAt
      );

      return {
        isLoggedIn,
        maxQuota,
        usedCount: 0,
        remaining: maxQuota,
        resetAt,
        resetInSeconds: Math.max(0, Math.ceil((resetAt - now) / 1000)),
        isExhausted: false,
        formattedResetTime: formatResetTime(resetAt - now)
      };
    }

    // Periksa apakah masa tunggu 3 hari telah berakhir
    if (now >= row.reset_at) {
      const periodStart = now;
      const resetAt = now + cooldownMs;

      db.prepare(`
        UPDATE quotas
        SET used_count = 0,
            max_quota = ?,
            is_logged_in = ?,
            period_start = ?,
            reset_at = ?,
            exhausted_at = NULL
        WHERE id = ?
      `).run(
        maxQuota,
        isLoggedIn ? 1 : 0,
        periodStart,
        resetAt,
        id
      );

      return {
        isLoggedIn,
        maxQuota,
        usedCount: 0,
        remaining: maxQuota,
        resetAt,
        resetInSeconds: Math.max(0, Math.ceil((resetAt - now) / 1000)),
        isExhausted: false,
        formattedResetTime: formatResetTime(resetAt - now)
      };
    }

    // Jika status login berubah (misal user baru login dan kuota naik ke 23)
    if (row.is_logged_in !== (isLoggedIn ? 1 : 0) || row.max_quota !== maxQuota) {
      db.prepare(`
        UPDATE quotas
        SET is_logged_in = ?,
            max_quota = ?
        WHERE id = ?
      `).run(isLoggedIn ? 1 : 0, maxQuota, id);
      row.max_quota = maxQuota;
      row.is_logged_in = isLoggedIn ? 1 : 0;
    }

    const remaining = Math.max(0, row.max_quota - row.used_count);
    const isExhausted = remaining <= 0;
    const diffMs = Math.max(0, row.reset_at - now);

    return {
      isLoggedIn,
      maxQuota: row.max_quota,
      usedCount: row.used_count,
      remaining,
      resetAt: row.reset_at,
      resetInSeconds: Math.ceil(diffMs / 1000),
      isExhausted,
      formattedResetTime: formatResetTime(diffMs)
    };
  }

  /**
   * Mengonsumsi 1 kuota saat pengguna mengirim prompt ke AI
   */
  public consumeQuota(id: string, isLoggedIn: boolean, isOwner?: boolean): { success: boolean; quota: QuotaInfo; error?: string } {
    if (isOwner) {
      const row = db.prepare('SELECT used_count FROM quotas WHERE id = ?').get(id) as any;
      const now = Date.now();
      const newUsed = (row ? row.used_count : 0) + 1;

      try {
        db.prepare(`
          INSERT INTO quotas (id, identifier_type, is_logged_in, used_count, max_quota, period_start, reset_at, exhausted_at)
          VALUES (?, 'owner', 1, ?, 999999, ?, 0, NULL)
          ON CONFLICT(id) DO UPDATE SET used_count = ?
        `).run(id, newUsed, now, newUsed);
      } catch (err) {
        console.warn('[QuotaService] Gagal merekam usage owner:', err);
      }

      return {
        success: true,
        quota: {
          isLoggedIn: true,
          isOwner: true,
          isUnlimited: true,
          maxQuota: 999999,
          usedCount: newUsed,
          remaining: 999999,
          resetAt: 0,
          resetInSeconds: 0,
          isExhausted: false,
          formattedResetTime: 'Unlimited'
        }
      };
    }

    const current = this.getQuota(id, isLoggedIn, false);

    if (current.isExhausted) {
      const waitStr = current.formattedResetTime;
      const loginHint = !isLoggedIn ? ' Atau Anda dapat login dengan Google untuk mendapatkan tambahan kuota +15%.' : '';
      return {
        success: false,
        quota: current,
        error: `Batas kuota pesan AI Anda telah habis (${current.usedCount}/${current.maxQuota} pesan). Anda harus menunggu ${waitStr} untuk reset kuota.${loginHint}`
      };
    }

    const now = Date.now();
    const cooldownMs = this.getCooldownMs();
    const newUsed = current.usedCount + 1;
    const isNowExhausted = newUsed >= current.maxQuota;

    // Jika pesan ini menyebabkan kuota habis, set reset_at tepat 3 hari ke depan dari saat kuota habis
    let resetAt = current.resetAt;
    let exhaustedAt: number | null = null;
    if (isNowExhausted) {
      resetAt = now + cooldownMs;
      exhaustedAt = now;
    }

    db.prepare(`
      UPDATE quotas
      SET used_count = ?,
          reset_at = ?,
          exhausted_at = CASE WHEN exhausted_at IS NULL AND ? IS NOT NULL THEN ? ELSE exhausted_at END
      WHERE id = ?
    `).run(newUsed, resetAt, exhaustedAt, exhaustedAt, id);

    const remaining = Math.max(0, current.maxQuota - newUsed);
    const diffMs = Math.max(0, resetAt - now);

    const updatedQuota: QuotaInfo = {
      isLoggedIn,
      maxQuota: current.maxQuota,
      usedCount: newUsed,
      remaining,
      resetAt,
      resetInSeconds: Math.ceil(diffMs / 1000),
      isExhausted: isNowExhausted,
      formattedResetTime: formatResetTime(diffMs)
    };

    return {
      success: true,
      quota: updatedQuota
    };
  }

  /**
   * Mengembalikan kuota jika panggilan API Gemini gagal
   */
  public refundQuota(id: string): void {
    try {
      const row = db.prepare('SELECT used_count FROM quotas WHERE id = ?').get(id) as any;
      if (row && row.used_count > 0) {
        db.prepare('UPDATE quotas SET used_count = used_count - 1 WHERE id = ?').run(id);
      }
    } catch (err) {
      console.warn('[QuotaService] Gagal me-refund kuota:', err);
    }
  }
}

export const quotaService = new QuotaService();
