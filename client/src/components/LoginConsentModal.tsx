import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Lock,
  CheckCircle2,
  ArrowDown,
  X,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { QuotaInfo, ThemePreference } from '../types/index.js';

interface LoginConsentModalProps {
  isOpen: boolean;
  onClose: () => void;
  quota?: QuotaInfo | null;
  preference: ThemePreference;
}

export const LoginConsentModal: React.FC<LoginConsentModalProps> = ({
  isOpen,
  onClose,
  quota,
  preference
}) => {
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [shakeNotice, setShakeNotice] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const googleBtnContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset state saat modal dibuka
  useEffect(() => {
    if (isOpen) {
      setHasScrolledToBottom(false);
      setScrollProgress(0);
      setIsAgreed(false);
      setShakeNotice(false);
    }
  }, [isOpen]);

  // Handler Scroll untuk mendeteksi posisi hingga mentok ke bawah
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const totalScrollable = scrollHeight - clientHeight;

    if (totalScrollable <= 0) {
      setScrollProgress(100);
      setHasScrolledToBottom(true);
      return;
    }

    const currentProgress = Math.min(100, Math.max(0, Math.round((scrollTop / totalScrollable) * 100)));
    setScrollProgress(currentProgress);

    // Toleransi 15px dari batas paling bawah
    if (scrollTop + clientHeight >= scrollHeight - 15) {
      setHasScrolledToBottom(true);
    }
  };

  // IntersectionObserver pada elemen sentinel di paling bawah sebagai verifikasi cadangan
  useEffect(() => {
    if (!isOpen) return;
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0]?.isIntersecting) {
          setHasScrolledToBottom(true);
          setScrollProgress(100);
        }
      },
      {
        root: scrollContainerRef.current,
        threshold: 0.8
      }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [isOpen]);

  // Render tombol Google Sign-In begitu pengguna menyetujui ketentuan
  const renderGoogleButton = useCallback(() => {
    if (typeof window === 'undefined' || !window.google?.accounts?.id) return;
    const el = document.getElementById('google-btn-consent-modal');
    if (!el) return;

    try {
      el.innerHTML = '';
      window.google.accounts.id.renderButton(el, {
        type: 'standard',
        shape: 'pill',
        theme: preference === 'dark' ? 'filled_black' : 'outline',
        text: 'signin_with',
        size: 'large',
        width: 280,
        logo_alignment: 'left'
      });
    } catch (err) {
      console.warn('Gagal merender tombol Google di modal consent:', err);
    }
  }, [preference]);

  useEffect(() => {
    if (isOpen && isAgreed) {
      // Berikan delay kecil untuk memastikan DOM container telah terpasang
      const timer = setTimeout(() => {
        renderGoogleButton();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isAgreed, renderGoogleButton]);

  const handleCheckboxClick = () => {
    if (!hasScrolledToBottom) {
      setShakeNotice(true);
      setTimeout(() => setShakeNotice(false), 800);
      return;
    }
    setIsAgreed(prev => !prev);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-md overflow-y-auto animate-fade-in font-sans">
      <div className="relative w-full max-w-xl bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] rounded-3xl border border-[#E5E3DB] dark:border-[#27272A] shadow-2xl overflow-hidden flex flex-col">
        {/* Header Modal */}
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-[#E5E3DB] dark:border-[#27272A] bg-white/80 dark:bg-[#202023]/80 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center shrink-0 border border-[#DA7756]/20 shadow-xs">
              <Lock size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                Batas Kuota Tamu Habis
              </h2>
              <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                Masuk untuk mendapatkan bonus kuota (+15%) &amp; lanjut mengobrol
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#8C8782] hover:text-[#23201D] dark:text-[#71717A] dark:hover:text-[#F4F4F5] hover:bg-[#EDEAE3] dark:hover:bg-[#27272A] transition"
            title="Tutup Modal"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-6 space-y-4 text-xs sm:text-sm">
          {/* Status Kuota Box */}
          <div className="p-3.5 rounded-2xl bg-[#DA7756]/10 border border-[#DA7756]/20 text-[#23201D] dark:text-[#F4F4F5] flex items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="font-semibold text-xs block text-[#DA7756]">
                Kuota Pesan Tamu Telah Terpakai
              </span>
              <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                Tamu memiliki batas {quota?.maxQuota || 20} pesan. Masuk dengan Google untuk membuka kuota tambahan dan menyimpan riwayat percakapan.
              </p>
            </div>
            <div className="shrink-0 px-2.5 py-1 rounded-xl bg-white dark:bg-[#202024] border border-[#DA7756]/30 text-center font-mono font-bold text-xs text-[#DA7756]">
              {quota?.usedCount || 20}/{quota?.maxQuota || 20}
            </div>
          </div>

          {/* Instruksi Wajib Scroll */}
          <div className="flex items-center justify-between text-xs text-[#65605B] dark:text-[#A1A1AA] px-1">
            <span className="font-medium flex items-center gap-1.5">
              <FileText size={13} className="text-[#DA7756]" />
              <span>Kebijakan Privasi &amp; Ketentuan Layanan:</span>
            </span>
            <span className={`font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full ${
              hasScrolledToBottom
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                : 'bg-black/5 dark:bg-white/5 text-[#8C8782]'
            }`}>
              {scrollProgress}% {hasScrolledToBottom ? 'Selesai Dibaca' : 'Terbaca'}
            </span>
          </div>

          {/* Scrollable Privacy Policy Container */}
          <div className={`rounded-2xl border ${
            shakeNotice ? 'border-red-500 ring-2 ring-red-500/20' : 'border-[#E5E3DB] dark:border-[#27272A]'
          } bg-white dark:bg-[#1E1E22] overflow-hidden transition-all shadow-xs`}>
            {/* Progress Bar Indikator */}
            <div className="w-full h-1 bg-black/5 dark:bg-white/5 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  hasScrolledToBottom ? 'bg-emerald-500' : 'bg-[#DA7756]'
                }`}
                style={{ width: `${scrollProgress}%` }}
              />
            </div>

            {/* Kontainer Teks yang Wajib Di-Scroll sampai Bawah */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="max-h-56 sm:max-h-64 overflow-y-auto p-4 sm:p-5 text-xs text-[#524D48] dark:text-[#D4D4D8] space-y-3 leading-relaxed"
            >
              <div className="font-bold text-[#23201D] dark:text-[#F4F4F5] border-b border-[#E5E3DB]/70 dark:border-[#27272A] pb-2">
                Ringkasan Persetujuan Privasi Pengguna qwertybot
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">1. Pengelola Layanan</strong>
                Situs web https://qwertybot.biz.id dibuat dan dikelola secara mandiri oleh Dimas Dwi Syahputra ("Pengembang").
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">2. Data Autentikasi Google (OAuth)</strong>
                Ketika Anda masuk menggunakan Google Sign-In, sistem hanya menerima data profil dasar publik berupa Nama, Alamat Email, dan Foto Profil untuk verifikasi akun dan kuota. Kami tidak pernah meminta, mengakses, atau menyimpan kata sandi Google Anda.
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">3. Tidak Menjual Data Pribadi</strong>
                Kami menjamin bahwa pesan obrolan, pertanyaan, dokumen yang Anda unggah, maupun identitas email Anda tidak akan pernah dijual, disewakan, atau dibagikan kepada broker data pihak ketiga atau pengiklan mana pun.
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">4. Berkas &amp; Isolasi Sandbox</strong>
                File gambar, dokumen PDF, dan rekaman audio voice note yang Anda kirimkan hanya diproses untuk menghasilkan balasan AI pada sesi yang sedang aktif dan diberi nama acak kriptografis (UUID).
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">5. Hak Menghapus Percakapan</strong>
                Anda memiliki hak penuh untuk mengekspor atau menghapus percakapan kapan saja melalui tombol hapus di bilah samping, serta meminta penutupan riwayat akun ke email: dimassdwisyah@gmail.com.
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">6. Penafian Kecerdasan Buatan (AI Disclaimer)</strong>
                Seluruh output teks atau kode yang dihasilkan oleh qwertybot bersifat murni referensial. Pengembang dibebaskan dari segala tuntutan atas kerusakan teknis atau keputusan penting yang didasarkan pada balasan bot.
              </div>

              <div>
                <strong className="text-[#23201D] dark:text-[#F4F4F5] block mb-0.5">7. Larangan Penggunaan</strong>
                Dilarang menggunakan bot ini untuk pembuatan malware, exploit peretasan, doxxing, pelecehan, penyebaran pornografi anak, atau upaya sabotase server.
              </div>

              {/* Sentinel elemen paling bawah */}
              <div
                ref={sentinelRef}
                className="pt-2 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5"
              >
                <CheckCircle2 size={14} />
                <span>Akhir dokumen: Anda telah mencapai baris paling bawah.</span>
              </div>
            </div>

            {/* Hint Bar Status Scroll di Bawah Box */}
            <div className={`p-2.5 px-4 text-[11px] border-t flex items-center justify-between ${
              hasScrolledToBottom
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400 font-medium'
                : 'bg-black/2 dark:bg-white/2 border-[#E5E3DB]/70 dark:border-[#27272A] text-[#8C8782] dark:text-[#71717A]'
            }`}>
              {hasScrolledToBottom ? (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 size={13} className="text-emerald-500" />
                  <span>Ketentuan telah dibaca lengkap. Silakan centang persetujuan di bawah.</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 animate-pulse">
                  <ArrowDown size={13} className="text-[#DA7756]" />
                  <span>Gulir teks sampai baris terakhir untuk membuka persetujuan...</span>
                </div>
              )}
            </div>
          </div>

          {/* Checkbox Persetujuan (Hanya bisa dicentang jika sudah scroll mentok) */}
          <div
            onClick={handleCheckboxClick}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
              isAgreed
                ? 'bg-emerald-500/10 border-emerald-500/30 text-[#23201D] dark:text-[#F4F4F5]'
                : hasScrolledToBottom
                ? 'bg-white dark:bg-[#202024] border-[#DA7756]/40 hover:border-[#DA7756]'
                : 'bg-black/5 dark:bg-white/5 border-transparent opacity-60 cursor-not-allowed'
            }`}
          >
            <input
              type="checkbox"
              id="privacy-agree-checkbox"
              checked={isAgreed}
              onChange={() => {}}
              disabled={!hasScrolledToBottom}
              className="mt-0.5 w-4 h-4 rounded text-[#DA7756] focus:ring-[#DA7756] border-gray-300 dark:border-gray-600 shrink-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <label
              htmlFor="privacy-agree-checkbox"
              className="text-xs leading-relaxed select-none cursor-pointer"
            >
              Saya telah membaca, memahami, dan menyetujui seluruh <strong>Kebijakan Privasi</strong> dan <strong>Ketentuan Layanan</strong> qwertybot.
            </label>
          </div>

          {shakeNotice && !hasScrolledToBottom && (
            <div className="text-xs text-red-500 font-medium flex items-center gap-1.5 animate-bounce px-1">
              <AlertCircle size={14} />
              <span>Harap gulir kotak dokumen privasi di atas sampai paling bawah terlebih dahulu.</span>
            </div>
          )}

          {/* Area Tombol Login Google */}
          <div className="pt-2">
            {isAgreed ? (
              <div className="flex flex-col items-center justify-center gap-2 p-3 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs animate-fade-in">
                <span className="text-[11px] text-[#8C8782] dark:text-[#71717A] flex items-center gap-1">
                  <Sparkles size={12} className="text-[#DA7756]" />
                  <span>Persetujuan terverifikasi. Masuk dengan Google sekarang:</span>
                </span>
                <div id="google-btn-consent-modal" ref={googleBtnContainerRef} className="flex justify-center min-h-[44px]" />
              </div>
            ) : (
              <div className="p-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-[#E5E3DB] dark:border-[#27272A] text-center text-xs text-[#8C8782] dark:text-[#71717A] flex items-center justify-center gap-2">
                <Lock size={14} />
                <span>Tombol Masuk dengan Google akan terbuka setelah Anda menggulir &amp; mencentang persetujuan di atas.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#202023]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span>Reset otomatis kuota tamu: {quota?.formattedResetTime || '3 hari'}</span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-[#F4F4F5] hover:underline"
          >
            Tutup sementara
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginConsentModal;
