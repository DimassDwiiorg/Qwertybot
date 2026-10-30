import React, { useState } from 'react';
import {
  Bot,
  Code,
  Layers,
  Zap,
  ExternalLink,
  Mail,
  ArrowLeft,
  X,
  Globe,
  Terminal,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, isStandalone = false }) => {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!isOpen) return null;

  const faqs = [
    {
      q: 'Siapa yang membuat website qwertybot?',
      a: 'Website ini dibuat dan dikembangkan sendiri oleh Dimas Dwi Syahputra (biasa dipanggil Dimas). Dari desain antarmuka, arsitektur kode frontend/backend, integrasi Gemini AI, sampai setup server VPS semuanya dikerjakan secara mandiri.'
    },
    {
      q: 'Kenapa kadang disebut bot qwerty?',
      a: 'Nama aslinya adalah qwertybot (terinspirasi dari susunan tombol keyboard QWERTY). Tapi di pencarian dan percakapan sehari-hari, banyak yang menyebutnya terbalik menjadi "bot qwerty" atau "qwerty bot". Semuanya merujuk ke platform yang sama di domain resmi https://qwertybot.biz.id.'
    },
    {
      q: 'Teknologi apa saja yang digunakan?',
      a: 'Frontend dibangun menggunakan React, TypeScript, dan Tailwind CSS. Backend menggunakan Node.js dan Express yang di-host langsung di server VPS Linux pribadi. Untuk mesin AI-nya terhubung ke Gemini API dengan dukungan model cepat hingga tingkat penalaran tinggi.'
    },
    {
      q: 'Apakah bisa digunakan gratis?',
      a: 'Bisa. Pengunjung dapat langsung mencoba chat secara gratis dengan kuota harian. Jika login menggunakan akun Google, Anda mendapatkan bonus kuota obrolan tambahan.'
    }
  ];

  return (
    <div
      className={
        isStandalone
          ? 'min-h-screen w-full bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] flex flex-col font-sans selection:bg-[#FDE68A] dark:selection:bg-[#78350F]'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-black/65 backdrop-blur-md overflow-y-auto animate-fade-in font-sans selection:bg-[#FDE68A] dark:selection:bg-[#78350F]'
      }
    >
      <div
        className={
          isStandalone
            ? 'w-full max-w-4xl mx-auto px-4 py-8 sm:px-8 flex-1 flex flex-col'
            : 'relative w-full max-w-3xl max-h-[92vh] bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] rounded-3xl border border-[#E5E3DB] dark:border-[#27272A] shadow-2xl flex flex-col overflow-hidden'
        }
      >
        {/* Navigation Bar Header */}
        <header className="flex items-center justify-between px-6 py-4 sm:px-8 border-b border-[#E5E3DB] dark:border-[#27272A] bg-white/80 dark:bg-[#1F1F23]/80 backdrop-blur-md sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center border border-[#DA7756]/20 shadow-xs">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                  qwertybot
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#DA7756]/10 text-[#DA7756] border border-[#DA7756]/20">
                  Bot Qwerty
                </span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A]">
                Tentang projek &amp; profil pengembang
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isStandalone ? (
              <a
                href="/"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-white dark:text-[#18181B] text-xs font-medium hover:opacity-90 transition shadow-xs"
              >
                <ArrowLeft size={14} />
                <span>Buka Chat</span>
              </a>
            ) : (
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-[#8C8782] hover:text-[#23201D] dark:text-[#71717A] dark:hover:text-[#F4F4F5] hover:bg-[#EDEAE3] dark:hover:bg-[#27272A] transition"
                title="Tutup Halaman Tentang"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-8 text-sm leading-relaxed text-[#4A4641] dark:text-[#D4D4D8]">
          {/* Hero Section Singkat & Lugas */}
          <section className="space-y-2 pt-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#DA7756]/10 text-[#DA7756] text-xs font-medium">
              <Sparkles size={12} />
              <span>Projek Independen</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
              Asisten AI Cepat, Multimodal &amp; Nyaman untuk Ngoding
            </h1>
            <p className="text-xs sm:text-sm text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
              qwertybot (atau bot qwerty) adalah aplikasi asisten AI yang dibangun untuk membantu kebutuhan sehari-hari: dari utak-atik kode dengan live preview, baca berkas dan gambar, sampai kirim pesan suara tanpa ribet.
            </p>
          </section>

          {/* Kartu Profil Pembuat (Dimas Dwi Syahputra) */}
          <section className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#DA7756] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-sm">
                DS
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-base sm:text-lg font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Dimas Dwi Syahputra
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Pembuat &amp; Pemilik qwertybot
                  </span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] mt-0.5">
                  Biasa dipanggil <strong>Dimas</strong> • Developer di balik qwertybot.biz.id
                </p>
              </div>
            </div>

            {/* Tulisan asli personal dari pengembang (bukan corporate speak) */}
            <div className="text-xs sm:text-sm text-[#524D48] dark:text-[#C4C4C8] leading-relaxed bg-[#FAF9F5] dark:bg-[#18181B] p-4 rounded-xl border border-[#E5E3DB]/80 dark:border-[#27272A]">
              "Projek ini saya mulai karena pengen punya asisten AI yang simpel, gak bertele-tele, dan fiturnya beneran berguna pas ngoding atau ngerjain tugas: hasil web bisa langsung di-preview di tempat, bisa kirim VN suara pas lagi males ngetik, dan responnya responsif. Seluruh sistem dari tampilan, backend, hingga server VPS saya bangun sendiri."
            </div>

            {/* Tautan Kontak & Portfolio */}
            <div className="flex items-center gap-2.5 flex-wrap text-xs pt-1">
              <a
                href="https://github.com/DimassDwiiorg"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A] text-[#23201D] dark:text-[#F4F4F5] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition font-medium"
              >
                <Code size={13} className="text-[#DA7756]" />
                <span>github.com/DimassDwiiorg</span>
                <ExternalLink size={10} className="opacity-50" />
              </a>

              <a
                href="mailto:dimassdwisyah@gmail.com"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A] text-[#23201D] dark:text-[#F4F4F5] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition font-medium"
              >
                <Mail size={13} className="text-[#DA7756]" />
                <span>dimassdwisyah@gmail.com</span>
              </a>

              <span className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB]/60 dark:border-[#27272A]/60 text-[#8C8782] dark:text-[#71717A] text-[11px] font-mono">
                <Terminal size={11} />
                <span>Linux VPS</span>
              </span>
            </div>
          </section>

          {/* Fitur Utama */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#23201D] dark:text-[#F4F4F5]">
              Fitur yang Tersedia
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                  <Code size={15} className="text-[#DA7756]" />
                  <span>Live Preview Web (Artifacts)</span>
                </div>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Bikin kode HTML, Tailwind, atau komponen React langsung bisa dicoba hasilnya di layar tanpa harus copy-paste ke editor lain.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                  <Zap size={15} className="text-blue-500" />
                  <span>Voice Note &amp; Analisis Berkas</span>
                </div>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Bisa kirim rekaman suara langsung lewat mic kalau lagi malas ngetik, plus upload PDF dan foto untuk dibedah isinya.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                  <Globe size={15} className="text-emerald-500" />
                  <span>Cari Info Web Terkini</span>
                </div>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Bot bisa menelusuri web lewat DuckDuckGo dan membaca isi tautan artikel untuk mencari fakta atau berita baru.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                  <Layers size={15} className="text-purple-500" />
                  <span>Kode Sesi (Session Code)</span>
                </div>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Tiap obrolan punya kode sesi unik. Bisa disimpan dan dibuka lagi di HP atau komputer lain tanpa kehilangan isi obrolan.
                </p>
              </div>
            </div>
          </section>

          {/* Pertanyaan yang Sering Ditanyakan */}
          <section className="space-y-3">
            <h3 className="text-sm font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-1.5">
              <HelpCircle size={15} className="text-[#DA7756]" />
              <span>Pertanyaan Umum</span>
            </h3>

            <div className="space-y-2">
              {faqs.map((faq, idx) => {
                const isOpen = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-[#E5E3DB] dark:border-[#27272A] bg-white dark:bg-[#202024] overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpen ? null : idx)}
                      className="w-full p-3.5 text-left flex items-center justify-between gap-3 text-xs sm:text-sm font-medium text-[#23201D] dark:text-[#F4F4F5] hover:bg-black/2 dark:hover:bg-white/2 transition"
                    >
                      <span>{faq.q}</span>
                      <span className="text-[#8C8782] text-xs font-mono shrink-0">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-3.5 pb-3.5 pt-1 text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed border-t border-[#E5E3DB]/60 dark:border-[#27272A]/60">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer Sederhana */}
        <footer className="px-6 py-3.5 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#1F1F23]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span>© 2026 qwertybot by Dimas Dwi Syahputra</span>
          <div className="flex items-center gap-3">
            <a href="/privacy" className="hover:text-[#DA7756] transition">Privasi</a>
            <span>•</span>
            <a href="/terms" className="hover:text-[#DA7756] transition">Ketentuan</a>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default AboutModal;
