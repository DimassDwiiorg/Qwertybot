import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { db } from './db.js';
import { Session, ChatMessage, AttachmentMeta } from '../types/index.js';

function generateSessionCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'QW-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(crypto.randomInt(chars.length));
  }
  return code;
}

class SessionStore {
  /**
   * Mengambil daftar ringkasan sesi.
   * Jika ownerId ditentukan, HANYA mengambil sesi milik akun tersebut.
   */
  public getAll(ownerId?: string): Session[] {
    let rows: any[];
    if (ownerId && ownerId.trim()) {
      rows = db.prepare('SELECT * FROM sessions WHERE owner_id = ? ORDER BY updated_at DESC').all(ownerId.trim());
    } else {
      rows = db.prepare('SELECT * FROM sessions ORDER BY updated_at DESC').all();
    }

    // Ambil jumlah pesan per sesi
    const countStmt = db.prepare('SELECT COUNT(*) as count FROM messages WHERE session_id = ?');

    return rows.map((r: any) => ({
      id: r.id,
      ownerId: r.owner_id || undefined,
      sessionCode: r.session_code,
      title: r.title,
      createdAt: r.created_at,
      updatedAt: r.updated_at,
      messages: new Array((countStmt.get(r.id) as any)?.count || 0) // placeholder message count
    }));
  }

  /**
   * Mengambil detail sesi lengkap beserta seluruh riwayat pesannya
   */
  public getByIdOrCode(query: string): Session | undefined {
    const trimmed = query.trim().toUpperCase();
    const row = db.prepare('SELECT * FROM sessions WHERE id = ? OR session_code = ?').get(query.trim(), trimmed) as any;
    if (!row) return undefined;

    const messageRows = db.prepare('SELECT * FROM messages WHERE session_id = ? ORDER BY timestamp ASC').all(row.id) as any[];

    const messages: ChatMessage[] = messageRows.map((m: any) => {
      let attachments: AttachmentMeta[] | undefined = undefined;
      if (m.attachments) {
        try {
          attachments = JSON.parse(m.attachments);
        } catch {
          attachments = undefined;
        }
      }
      return {
        id: m.id,
        role: m.role,
        content: m.content || '',
        timestamp: m.timestamp,
        attachments
      };
    });

    return {
      id: row.id,
      ownerId: row.owner_id || undefined,
      sessionCode: row.session_code,
      title: row.title,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      messages
    };
  }

  /**
   * Membuat sesi baru dengan menautkan ownerId akun (Google sub/email atau guest ID)
   */
  public createSession(ownerId?: string, title?: string, customCode?: string): Session {
    let sessionCode = customCode?.trim().toUpperCase();
    if (!sessionCode || this.getByIdOrCode(sessionCode)) {
      sessionCode = generateSessionCode();
    }

    const session: Session = {
      id: uuidv4(),
      ownerId: ownerId?.trim() || undefined,
      sessionCode,
      title: title?.trim().slice(0, 100) || 'Percakapan Baru',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: []
    };

    db.prepare(`
      INSERT INTO sessions (id, owner_id, session_code, title, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      session.id,
      session.ownerId || null,
      session.sessionCode,
      session.title,
      session.createdAt,
      session.updatedAt
    );

    return session;
  }

  /**
   * Menambahkan pesan baru ke dalam sesi dan memperbarui judul & waktu
   */
  public addMessage(sessionId: string, message: ChatMessage): Session | undefined {
    const session = this.getByIdOrCode(sessionId);
    if (!session) return undefined;

    db.prepare(`
      INSERT INTO messages (id, session_id, role, content, attachments, timestamp)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      message.id,
      sessionId,
      message.role,
      message.content || '',
      message.attachments ? JSON.stringify(message.attachments) : null,
      message.timestamp
    );

    const now = Date.now();
    let newTitle = session.title;
    if (session.title === 'Percakapan Baru' && message.role === 'user' && message.content.trim()) {
      newTitle = message.content.trim().slice(0, 36) + (message.content.length > 36 ? '...' : '');
    }

    db.prepare(`
      UPDATE sessions
      SET title = ?, updated_at = ?
      WHERE id = ?
    `).run(newTitle, now, sessionId);

    session.messages.push(message);
    session.title = newTitle;
    session.updatedAt = now;
    return session;
  }

  /**
   * Memperbarui judul sesi
   */
  public updateTitle(sessionId: string, newTitle: string): Session | undefined {
    const session = this.getByIdOrCode(sessionId);
    if (!session) return undefined;

    const trimmedTitle = newTitle.trim().slice(0, 100) || session.title;
    const now = Date.now();

    db.prepare(`
      UPDATE sessions
      SET title = ?, updated_at = ?
      WHERE id = ?
    `).run(trimmedTitle, now, sessionId);

    session.title = trimmedTitle;
    session.updatedAt = now;
    return session;
  }

  /**
   * Menghapus sesi beserta seluruh pesannya (CASCADE di SQLite)
   */
  public deleteSession(sessionId: string): boolean {
    const result = db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
    return result.changes > 0;
  }

  /**
   * Menautkan sesi-sesi tanpa owner (legacy) ke akun pengguna
   */
  public claimLegacySessions(ownerId: string, sessionIds: string[]): void {
    if (!ownerId || !sessionIds.length) return;
    const cleanIds = sessionIds.filter(id => typeof id === 'string' && id.trim().length > 0);
    if (!cleanIds.length) return;
    const placeholders = cleanIds.map(() => '?').join(',');
    db.prepare(`UPDATE sessions SET owner_id = ? WHERE (owner_id IS NULL OR owner_id = '') AND id IN (${placeholders})`).run(ownerId.trim(), ...cleanIds);
  }

  /**
   * Mengupdate owner sesi jika belum memiliki owner atau berstatus guest
   */
  public updateOwner(sessionId: string, ownerId: string): void {
    db.prepare(`UPDATE sessions SET owner_id = ? WHERE id = ? AND (owner_id IS NULL OR owner_id = '' OR owner_id LIKE 'guest_%')`).run(ownerId.trim(), sessionId);
  }
}

export const sessionStore = new SessionStore();
