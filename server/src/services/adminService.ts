import crypto from 'crypto';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { config } from '../config.js';

const execAsync = promisify(exec);

interface AdminSession {
  email: string;
  expiresAt: number;
}

export class AdminService {
  private activeTokens: Map<string, AdminSession> = new Map();

  /**
   * Verifikasi 2 tahap:
   * 1. Email harus sesuai email owner (dimassdwisyah@gmail.com)
   * 2. Password harus sesuai password VPS
   */
  public verifyCredentials(email: string, password: string): { success: boolean; token?: string; expiresAt?: number; error?: string } {
    const normalizedEmail = (email || '').trim().toLowerCase();
    const targetEmail = config.admin.ownerEmail;

    if (normalizedEmail !== targetEmail) {
      return {
        success: false,
        error: `Akses Ditolak: Hanya akun owner resmi (${targetEmail}) yang diizinkan mengakses fitur kontrol VPS.`
      };
    }

    if (!password || password.trim() !== config.admin.vpsPassword) {
      return {
        success: false,
        error: 'Password VPS tidak valid. Verifikasi tahap 2 gagal.'
      };
    }

    // Bersihkan token kadaluarsa
    this.cleanExpiredTokens();

    // Buat token sesi aman
    const token = `owner_${crypto.randomUUID()}_${crypto.randomBytes(16).toString('hex')}`;
    const expiresAt = Date.now() + config.admin.tokenExpiryHours * 60 * 60 * 1000;

    this.activeTokens.set(token, {
      email: normalizedEmail,
      expiresAt
    });

    console.log(`[AdminService] Sesi VPS dibuka untuk ${normalizedEmail} hingga ${new Date(expiresAt).toISOString()}`);

    return {
      success: true,
      token,
      expiresAt
    };
  }

  /**
   * Cek apakah token admin valid dan belum kadaluarsa
   */
  public validateToken(token?: string, email?: string): boolean {
    if (!token) return false;
    const session = this.activeTokens.get(token);
    if (!session) return false;

    if (Date.now() > session.expiresAt) {
      this.activeTokens.delete(token);
      return false;
    }

    if (email) {
      const normalizedEmail = email.trim().toLowerCase();
      if (normalizedEmail !== session.email) {
        return false;
      }
    }

    return true;
  }

  /**
   * Kunci kembali / cabut token admin
   */
  public revokeToken(token?: string): boolean {
    if (!token) return false;
    return this.activeTokens.delete(token);
  }

  private cleanExpiredTokens() {
    const now = Date.now();
    for (const [token, session] of this.activeTokens.entries()) {
      if (now > session.expiresAt) {
        this.activeTokens.delete(token);
      }
    }
  }

  /**
   * Memvalidasi dan menormalisasi path file agar tetap berada di dalam folder projek
   */
  private resolveSafeProjectPath(relPath: string): string {
    const normalized = path.normalize(relPath).replace(/^[/\\]+/, '');
    const fullPath = path.resolve(process.cwd(), normalized);
    const rootPath = path.resolve(process.cwd());

    if (!fullPath.startsWith(rootPath)) {
      throw new Error(`Akses path file ditolak: ${relPath} berada di luar direktori projek.`);
    }

    return fullPath;
  }

  /**
   * Menjalankan perintah bash/terminal di VPS
   */
  public async executeCommand(command: string): Promise<{ success: boolean; stdout: string; stderr: string; message?: string }> {
    const trimmed = (command || '').trim();
    if (!trimmed) {
      return { success: false, stdout: '', stderr: 'Perintah kosong.', message: 'Perintah kosong' };
    }

    console.log(`[AdminService] Menjalankan perintah di VPS: "${trimmed}"`);

    try {
      const { stdout, stderr } = await execAsync(trimmed, {
        cwd: process.cwd(),
        timeout: 90000, // 90 detik
        maxBuffer: 10 * 1024 * 1024,
        env: { ...process.env, LANG: 'en_US.UTF-8' }
      });

      return {
        success: true,
        stdout: stdout || '(Tidak ada output teks)',
        stderr: stderr || ''
      };
    } catch (err: any) {
      return {
        success: false,
        stdout: err.stdout || '',
        stderr: err.stderr || err.message,
        message: err.message
      };
    }
  }

  /**
   * Membaca isi berkas projek di VPS
   */
  public async readProjectFile(relPath: string): Promise<{ success: boolean; content?: string; error?: string }> {
    try {
      const safePath = this.resolveSafeProjectPath(relPath);
      if (!fs.existsSync(safePath)) {
        return { success: false, error: `Berkas tidak ditemukan: ${relPath}` };
      }

      const stat = fs.statSync(safePath);
      if (stat.isDirectory()) {
        const files = fs.readdirSync(safePath);
        return {
          success: true,
          content: `[Direktori: ${relPath}]\n` + files.map(f => `- ${f}`).join('\n')
        };
      }

      if (stat.size > 2 * 1024 * 1024) {
        return { success: false, error: `Berkas terlalu besar (>2MB): ${relPath}` };
      }

      const content = fs.readFileSync(safePath, 'utf-8');
      return { success: true, content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Menulis atau memperbarui berkas projek di VPS
   */
  public async writeProjectFile(relPath: string, content: string): Promise<{ success: boolean; error?: string }> {
    try {
      const safePath = this.resolveSafeProjectPath(relPath);
      const parentDir = path.dirname(safePath);

      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      fs.writeFileSync(safePath, content, 'utf-8');
      console.log(`[AdminService] Berkas berhasil diperbarui: ${relPath}`);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  /**
   * Menjalankan build projek dan me-reload proses PM2 di VPS
   */
  public async rebuildAndReload(reason?: string): Promise<{ success: boolean; buildOutput: string; error?: string }> {
    console.log(`[AdminService] Memulai proses rebuild & reload VPS. Alasan: ${reason || 'Self-update'}`);

    try {
      // 1. Eksekusi npm run build
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: process.cwd(),
        timeout: 120000, // 2 menit
        maxBuffer: 10 * 1024 * 1024
      });

      const buildOutput = stdout + (stderr ? `\nWarning: ${stderr}` : '');

      // 2. Jadwalkan PM2 reload 2.5 detik kemudian agar respon ke user selesai dikirimkan
      setTimeout(() => {
        console.log('[AdminService] Memulai PM2 reload...');
        exec('pm2 reload qwertybot || pm2 restart qwertybot', { cwd: process.cwd() }, (err, out, serr) => {
          if (err) {
            console.error('[AdminService] Gagal me-reload PM2:', err);
          } else {
            console.log('[AdminService] PM2 berhasil di-reload:', out || serr);
          }
        });
      }, 2500);

      return {
        success: true,
        buildOutput: buildOutput.slice(-2000) // 2000 karakter terakhir
      };
    } catch (err: any) {
      console.error('[AdminService] Rebuild gagal:', err);
      return {
        success: false,
        buildOutput: err.stdout || '',
        error: `Build error: ${err.stderr || err.message}`
      };
    }
  }
}

export const adminService = new AdminService();
