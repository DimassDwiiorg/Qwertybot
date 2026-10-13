import { Request, Response } from 'express';
import { adminService } from '../services/adminService.js';
import { config } from '../config.js';

export const verifyVps = (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email dan password VPS diperlukan.'
      });
    }

    const result = adminService.verifyCredentials(String(email), String(password));

    if (!result.success) {
      return res.status(401).json(result);
    }

    return res.json({
      success: true,
      token: result.token,
      expiresAt: result.expiresAt,
      message: 'Verifikasi keamanan 2 tahap berhasil. Akses VPS diaktifkan.'
    });
  } catch (err: any) {
    console.error('[AdminController verifyVps]', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal memverifikasi akses VPS.' });
  }
};

export const getAdminStatus = (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-admin-token'] || req.query.token || '').toString();
    const email = (req.query.email || '').toString();

    const isUnlocked = adminService.validateToken(token, email || undefined);

    return res.json({
      success: true,
      isUnlocked,
      ownerEmail: config.admin.ownerEmail
    });
  } catch (err: any) {
    console.error('[AdminController getAdminStatus]', err);
    return res.status(500).json({ success: false, error: 'Gagal mengecek status admin.' });
  }
};

export const lockAdmin = (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-admin-token'] || req.body.token || '').toString();
    adminService.revokeToken(token);

    return res.json({
      success: true,
      message: 'Akses VPS berhasil dikunci kembali.'
    });
  } catch (err: any) {
    console.error('[AdminController lockAdmin]', err);
    return res.status(500).json({ success: false, error: 'Gagal mengunci akses admin.' });
  }
};

export const executeAdminCommand = async (req: Request, res: Response) => {
  try {
    const token = (req.headers['x-admin-token'] || req.body.token || '').toString();
    const email = (req.body.email || '').toString();
    const command = (req.body.command || '').toString();

    if (!adminService.validateToken(token, email || undefined)) {
      return res.status(403).json({
        success: false,
        error: 'Akses ditolak: Token admin tidak valid atau sudah kadaluarsa.'
      });
    }

    const result = await adminService.executeCommand(command);
    return res.json({
      success: result.success,
      stdout: result.stdout,
      stderr: result.stderr
    });
  } catch (err: any) {
    console.error('[AdminController executeAdminCommand]', err);
    return res.status(500).json({ success: false, error: err.message || 'Gagal mengeksekusi perintah.' });
  }
};
