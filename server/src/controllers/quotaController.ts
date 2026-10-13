import { Request, Response } from 'express';
import { quotaService } from '../services/quotaService.js';
import { config } from '../config.js';

export function resolveQuotaIdentifier(req: Request): { id: string; isLoggedIn: boolean; isOwner: boolean } {
  const ownerId = (req.query.ownerId || req.body.ownerId || '').toString().trim();
  const userEmail = (req.query.userEmail || req.body.userEmail || req.headers['x-user-email'] || '').toString().trim().toLowerCase();
  const isLoggedInFlag = (req.query.isLoggedIn || req.body.isLoggedIn || '').toString().trim() === 'true';

  const isOwner = Boolean(userEmail && userEmail === config.admin.ownerEmail);
  const isLoggedIn = isOwner || ((isLoggedInFlag || !!userEmail) && !!ownerId && !ownerId.startsWith('guest_'));

  if (isOwner) {
    return { id: `owner:${userEmail}`, isLoggedIn: true, isOwner: true };
  }

  if (isLoggedIn) {
    return { id: `user:${ownerId}`, isLoggedIn: true, isOwner: false };
  }

  // Pengguna tamu (guest): batasi berdasarkan alamat IP publik / proxy
  const rawIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() || req.ip || req.socket.remoteAddress || '127.0.0.1';
  const cleanIp = rawIp.replace(/^.*:/, '') || '127.0.0.1';
  return { id: `ip:${cleanIp}`, isLoggedIn: false, isOwner: false };
}

export const getQuota = (req: Request, res: Response) => {
  try {
    const { id, isLoggedIn, isOwner } = resolveQuotaIdentifier(req);
    const quota = quotaService.getQuota(id, isLoggedIn, isOwner);
    res.json({ success: true, quota });
  } catch (err: any) {
    console.error('[QuotaController getQuota]', err);
    res.status(500).json({ success: false, error: 'Gagal memuat status kuota AI.' });
  }
};
