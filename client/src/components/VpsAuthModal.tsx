import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Lock, Unlock, Terminal, X, Eye, EyeOff, Loader2, Play } from 'lucide-react';
import { apiUrl } from '../utils/api.js';

interface VpsAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  isUnlocked: boolean;
  userEmail?: string;
  onVerifySuccess: (token: string) => void;
  onLock: () => void;
  adminToken?: string | null;
}

export const VpsAuthModal: React.FC<VpsAuthModalProps> = ({
  isOpen,
  onClose,
  isUnlocked,
  userEmail,
  onVerifySuccess,
  onLock,
  adminToken
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Quick command runner di modal
  const [testCmd, setTestCmd] = useState('pm2 status');
  const [cmdRunning, setCmdRunning] = useState(false);
  const [cmdOutput, setCmdOutput] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setErrorMsg('Masukkan password VPS Anda.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch(apiUrl('/api/admin/verify'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: userEmail || 'dimassdwisyah@gmail.com',
          password: password.trim()
        })
      });

      const data = await res.json();
      if (res.ok && data.success && data.token) {
        onVerifySuccess(data.token);
        setPassword('');
      } else {
        setErrorMsg(data.error || 'Password VPS tidak cocok. Verifikasi gagal.');
      }
    } catch (err: any) {
      setErrorMsg('Gagal menghubungi server: ' + (err.message || 'Koneksi error'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunCommand = async () => {
    if (!testCmd.trim() || !adminToken) return;
    setCmdRunning(true);
    setCmdOutput(null);

    try {
      const res = await fetch(apiUrl('/api/admin/exec'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-token': adminToken
        },
        body: JSON.stringify({
          email: userEmail,
          command: testCmd.trim()
        })
      });

      const data = await res.json();
      if (data.success) {
        setCmdOutput(data.stdout || '(Tidak ada output)');
      } else {
        setCmdOutput(`Error: ${data.stderr || data.error || 'Perintah gagal'}`);
      }
    } catch (err: any) {
      setCmdOutput(`Exception: ${err.message}`);
    } finally {
      setCmdRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg bg-[#FAF9F5] dark:bg-[#1C1C1E] border border-[#E5E3DB] dark:border-[#2C2C2E] rounded-3xl shadow-2xl overflow-hidden text-[#23201D] dark:text-[#F4F4F5]">
        {/* Header */}
        <div className="px-6 pt-6 pb-4 flex items-center justify-between border-b border-[#E5E3DB] dark:border-[#2C2C2E]">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl ${isUnlocked ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' : 'bg-[#DA7756]/10 text-[#DA7756]'}`}>
              {isUnlocked ? <ShieldCheck size={24} /> : <ShieldAlert size={24} />}
            </div>
            <div>
              <h3 className="font-semibold text-base leading-tight">
                {isUnlocked ? 'Akses Server VPS Aktif' : 'Verifikasi Keamanan Owner'}
              </h3>
              <p className="text-xs text-[#8C8782] dark:text-[#A1A1AA] mt-0.5">
                Pengenalan Akun & Verifikasi 2 Tahap
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C8782] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 space-y-4">
          {/* Info Status Email */}
          <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 flex items-center justify-between">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-[#8C8782] dark:text-[#71717A] font-semibold">
                Tahap 1: Pengenalan Email Owner
              </p>
              <p className="text-xs font-mono font-medium text-[#23201D] dark:text-[#F4F4F5] mt-0.5">
                {userEmail || 'dimassdwisyah@gmail.com'}
              </p>
            </div>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              Terverifikasi
            </span>
          </div>

          {!isUnlocked ? (
            /* Form Input Password VPS */
            <form onSubmit={handleVerify} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-medium text-[#65605B] dark:text-[#A1A1AA] mb-1.5">
                  Tahap 2: Masukkan Password VPS
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan password VPS Anda..."
                    autoFocus
                    className="w-full px-4 py-2.5 pr-10 text-sm rounded-xl bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] focus:outline-none focus:ring-2 focus:ring-[#DA7756] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C8782] hover:text-[#23201D] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <p className="text-[11px] text-[#8C8782] dark:text-[#71717A] mt-1.5 leading-relaxed">
                  Password diperlukan untuk membuka hak eksekusi shell, modifikasi berkas kode, dan kemampuan self-update otomatis qwertybot di server.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 text-xs font-medium rounded-xl border border-[#E5E3DB] dark:border-[#3F3F46] hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isLoading || !password.trim()}
                  className="flex-1 py-2.5 text-xs font-semibold rounded-xl bg-[#DA7756] hover:bg-[#DA7756]/90 disabled:opacity-50 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Memverifikasi...</span>
                    </>
                  ) : (
                    <>
                      <Unlock size={14} />
                      <span>Buka Akses VPS</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Panel Status Saat Unlocked */
            <div className="space-y-4 pt-1">
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs">
                  <ShieldCheck size={16} />
                  <span>Sesi VPS Terbuka & Aktif</span>
                </div>
                <p className="text-[11px] text-[#65605B] dark:text-[#A1A1AA] mt-1">
                  qwertybot kini dapat mengeksekusi perintah terminal, membaca file projek, mengedit kode, dan me-reload aplikasi secara otonom saat Anda memerintahkannya di chat.
                </p>
              </div>

              {/* Mini Terminal / Quick Tester */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-medium text-[#65605B] dark:text-[#A1A1AA]">
                  <Terminal size={14} />
                  <span>Uji Perintah Cepat di VPS:</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={testCmd}
                    onChange={(e) => setTestCmd(e.target.value)}
                    placeholder="misal: pm2 status, git status, uptime..."
                    className="flex-1 px-3 py-1.5 text-xs font-mono rounded-xl bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#3F3F46] focus:outline-none focus:ring-1 focus:ring-[#DA7756]"
                  />
                  <button
                    type="button"
                    onClick={handleRunCommand}
                    disabled={cmdRunning}
                    className="px-3 py-1.5 text-xs font-medium rounded-xl bg-black/5 dark:bg-white/10 hover:bg-black/10 dark:hover:bg-white/15 flex items-center gap-1 transition-colors"
                  >
                    {cmdRunning ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />}
                    <span>Jalankan</span>
                  </button>
                </div>
                {cmdOutput && (
                  <pre className="p-2.5 rounded-xl bg-[#18181B] text-[#10B981] font-mono text-[10px] max-h-36 overflow-auto whitespace-pre-wrap">
                    {cmdOutput}
                  </pre>
                )}
              </div>

              <div className="flex items-center gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={onLock}
                  className="flex-1 py-2 text-xs font-medium rounded-xl border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Lock size={13} />
                  <span>Kunci Akses (Lock)</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2 text-xs font-semibold rounded-xl bg-[#DA7756] hover:bg-[#DA7756]/90 text-white transition-colors"
                >
                  Selesai
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
