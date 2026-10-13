import { Request, Response } from 'express';
import { sessionStore } from '../services/sessionStore.js';
import { Session } from '../types/index.js';

export const getSessions = (req: Request, res: Response) => {
  try {
    const ownerId = (req.query.ownerId as string || '').trim();
    const idsQuery = req.query.ids as string | undefined;
    let list: Session[] = [];

    // Jika ada session IDs dari local/device dan ownerId, klaim sesi legacy yang belum punya owner
    if (ownerId && idsQuery && idsQuery.trim()) {
      const allowedIds = idsQuery.split(',').map(s => s.trim()).filter(Boolean);
      if (allowedIds.length > 0) {
        sessionStore.claimLegacySessions(ownerId, allowedIds);
      }
    }

    // Jika ada ownerId, ambil seluruh sesi milik akun tersebut dari database SQLite
    if (ownerId) {
      list = sessionStore.getAll(ownerId);
    } else if (idsQuery && idsQuery.trim()) {
      // Jika mode guest tanpa ownerId, ambil sesi berdasarkan daftar ID sesi perangkat
      const allowedIds = new Set(idsQuery.split(',').map(s => s.trim()).filter(Boolean));
      if (allowedIds.size > 0) {
        list = sessionStore.getAll().filter(s => allowedIds.has(s.id));
      }
    }

    const formattedList = list.map(s => ({
      id: s.id,
      ownerId: s.ownerId,
      sessionCode: s.sessionCode,
      title: s.title,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      messageCount: s.messages.length
    }));

    res.json({ success: true, sessions: formattedList });
  } catch (err: any) {
    console.error('[SessionController getSessions]', err);
    res.status(500).json({ success: false, error: 'Gagal mengambil riwayat sesi.' });
  }
};

export const getSessionByIdOrCode = (req: Request, res: Response) => {
  try {
    const { query } = req.params;
    const session = sessionStore.getByIdOrCode(query);
    if (!session) {
      return res.status(404).json({ success: false, error: 'Sesi percakapan tidak ditemukan.' });
    }
    res.json({ success: true, session });
  } catch (err: any) {
    console.error('[SessionController getSessionByIdOrCode]', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat memuat sesi.' });
  }
};

export const createNewSession = (req: Request, res: Response) => {
  try {
    const { title, ownerId } = req.body;
    const session = sessionStore.createSession(
      typeof ownerId === 'string' ? ownerId.trim() : undefined,
      typeof title === 'string' ? title.slice(0, 100) : undefined
    );
    res.json({ success: true, session });
  } catch (err: any) {
    console.error('[SessionController createNewSession]', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat membuat sesi baru.' });
  }
};

export const updateSessionTitle = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    if (typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Judul tidak boleh kosong.' });
    }
    const session = sessionStore.updateTitle(id, title.trim().slice(0, 100));
    if (!session) {
      return res.status(404).json({ success: false, error: 'Sesi tidak ditemukan.' });
    }
    res.json({ success: true, session });
  } catch (err: any) {
    console.error('[SessionController updateSessionTitle]', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat memperbarui judul sesi.' });
  }
};

export const deleteSession = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ok = sessionStore.deleteSession(id);
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Sesi tidak ditemukan.' });
    }
    res.json({ success: true, message: 'Sesi berhasil dihapus.' });
  } catch (err: any) {
    console.error('[SessionController deleteSession]', err);
    res.status(500).json({ success: false, error: 'Terjadi kesalahan saat menghapus sesi.' });
  }
};
