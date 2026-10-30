import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  Code,
  Layers,
  Zap,
  ExternalLink,
  Mail,
  ArrowLeft,
  X,
  Globe,
  Terminal,
  HelpCircle
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
      q: 'Siapa sosok di balik pembuatan website qwertybot?',
      a: 'qwertybot (dikenal juga sebagai Bot Qwerty) dirancang, dikembangkan, dan dimiliki secara mandiri oleh Dimas Dwi Syahputra (biasa disapa Dimas). Seluruh arsitektur kode frontend React/TypeScript, backend Express, integrasi model AI Gemini, hingga pengelolaan infrastruktur server VPS dikerjakan oleh beliau.'
    },
    {
      q: 'Mengapa platform ini memiliki variasi nama bot qwerty dan qwertybot?',
      a: 'qwertybot adalah identitas resmi platform yang terinspirasi dari tata letak keyboard standar (QWERTY), merepresentasikan kecepatan dan kepraktisan input. Pengguna di Indonesia sering menyebutnya sebagai "bot qwerty" atau "qwerty bot". Keduanya merujuk pada platform yang sama di domain resmi https://qwertybot.biz.id.'
    },
    {
      q: 'Teknologi kecerdasan buatan apa yang menjadi motor penggerak?',
      a: 'qwertybot menggunakan inti multimodal Google Gemini (mulai dari versi 3.5 Lite hingga 5.0 Pro) yang dioptimasi dengan arsitektur streaming latensi rendah, dilengkapi kemampuan live sandboxed code artifacts (ala Anthropic Claude), pemrosesan pesan audio Voice Note, dan pencarian web aktual via DuckDuckGo.'
    },
    {
      q: 'Apakah qwertybot aman dan gratis untuk digunakan publik?',
      a: 'Ya, platform ini menyediakan kuota harian gratis bagi setiap pengunjung tanpa perlu kartu kredit. Privasi pengguna sangat dijaga: percakapan Anda tidak pernah dijual atau digunakan untuk melatih model periklanan komersial pihak ketiga.'
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
            ? 'w-full max-w-5xl mx-auto px-4 py-8 sm:px-8 flex-1 flex flex-col'
            : 'relative w-full max-w-4xl max-h-[92vh] bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] rounded-3xl border border-[#E5E3DB] dark:border-[#27272A] shadow-2xl flex flex-col overflow-hidden'
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
                <span className="font-serif font-bold text-base tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                  qwertybot
                </span>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#DA7756]/10 text-[#DA7756] border border-[#DA7756]/20">
                  Bot Qwerty
                </span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A]">
                Tentang Platform &amp; Profil Pemilik Resmi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {isStandalone ? (
              <a
                href="/"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-white dark:text-[#18181B] text-xs font-semibold hover:opacity-90 transition shadow-xs"
              >
                <ArrowLeft size={14} />
                <span>Buka Studio AI</span>
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
        <div className="flex-1 overflow-y-auto px-6 py-8 sm:px-8 space-y-12 leading-relaxed text-[#4A4641] dark:text-[#D4D4D8]">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto space-y-4 pt-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DA7756]/10 border border-[#DA7756]/25 text-[#DA7756] text-xs font-semibold">
              <Sparkles size={13} />
              <span>Inovasi Kecerdasan Buatan Indonesia</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-medium tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
              Mendefinisikan Ulang Produktivitas dengan AI Multimodal Terbuka.
            </h1>
            <p className="text-sm sm:text-base text-[#65605B] dark:text-[#A1A1AA] leading-relaxed max-w-2xl mx-auto">
              <strong>qwertybot</strong> (atau <strong>bot qwerty</strong>) adalah asisten AI multimodal cerdas karya <strong>Dimas Dwi Syahputra</strong> yang memadukan eksekusi kode interaktif (live artifacts), pemrosesan pesan suara, analisis berkas mendalam, dan estetika minimalis elegan ala Claude.
            </p>
          </section>

          {/* Profil Pemilik & Arsitek Sistem (Dimas Dwi Syahputra) */}
          <section className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-white to-[#FAF7F2] dark:from-[#202024] dark:to-[#1A1A1D] border border-[#E5E3DB] dark:border-[#2B2B30] shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#DA7756]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Avatar Initial Ring */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-[#DA7756] to-[#F09375] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-lg shadow-[#DA7756]/25 shrink-0 border-2 border-white dark:border-[#27272A]">
                DS
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                    Dimas Dwi Syahputra
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Owner &amp; Lead AI Developer
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-[#8C8782] dark:text-[#71717A]">
                  Dikenal sebagai <strong className="text-[#DA7756]">Dimas</strong> • Pendiri, Pengembang Kode &amp; Arsitek Infrastruktur Tunggal qwertybot
                </p>

                <p className="text-xs sm:text-sm text-[#524D48] dark:text-[#C4C4C8] pt-1 leading-relaxed">
                  "Visi saya dalam membangun qwertybot adalah menghadirkan asisten kecerdasan buatan kelas dunia yang bebas dari kerumitan, menghormati privasi data, dan memberikan alat produktivitas terlengkap—mulai dari live preview koding hingga transkripsi pesan suara—secara cuma-cuma untuk komunitas pengembang dan pelajar Indonesia."
                </p>

                {/* Badges Stack & Kontak */}
                <div className="pt-3 flex items-center gap-3 flex-wrap text-xs">
                  <a
                    href="https://github.com/DimassDwiiorg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#38383D] text-[#23201D] dark:text-[#F4F4F5] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition font-medium shadow-2xs"
                  >
                    <Code size={13} className="text-[#DA7756]" />
                    <span>GitHub: @DimassDwiiorg</span>
                    <ExternalLink size={10} className="opacity-60" />
                  </a>

                  <a
                    href="mailto:dimassdwisyah@gmail.com"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-[#27272A] border border-[#E5E3DB] dark:border-[#38383D] text-[#23201D] dark:text-[#F4F4F5] hover:text-[#DA7756] dark:hover:text-[#DA7756] transition font-medium shadow-2xs"
                  >
                    <Mail size={13} className="text-[#DA7756]" />
                    <span>dimassdwisyah@gmail.com</span>
                  </a>

                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF9F5] dark:bg-[#1E1E22] text-[#8C8782] dark:text-[#71717A] text-[11px] font-mono">
                    <Terminal size={12} />
                    <span>VPS Linux Engine</span>
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* 4 Pilar Teknologi (Bento Grid) */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-serif font-bold text-[#23201D] dark:text-[#F4F4F5]">
                  Arsitektur &amp; Fitur Unggulan
                </h3>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                  Dirancang dari nol dengan teknologi web modern untuk keandalan maksimal
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-2 hover:border-[#DA7756]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center">
                  <Code size={18} />
                </div>
                <h4 className="font-semibold text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Live Code Artifacts Sandbox
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Menghasilkan halaman web interaktif HTML, CSS Tailwind, dan visual SVG yang dapat langsung di-preview di sandbox terisolasi tanpa reload.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-2 hover:border-[#DA7756]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                  <Zap size={18} />
                </div>
                <h4 className="font-semibold text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Audio Voice Note &amp; Visual OCR
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Mendengarkan rekaman suara mikrofon, membaca tangkapan layar visual, membedah naskah PDF tebal, serta dilengkapi pembaca suara TTS bahasa Indonesia.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-2 hover:border-[#DA7756]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                  <Globe size={18} />
                </div>
                <h4 className="font-semibold text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Riset Web Aktual (Autonomous Agent)
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Kemampuan menelusuri internet secara otomatis melalui DuckDuckGo dan membaca isi artikel web untuk menyajikan fakta dan berita terkini.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-2 hover:border-[#DA7756]/40 transition">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                  <Layers size={18} />
                </div>
                <h4 className="font-semibold text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Memori Kode Sesi (Session Code)
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                  Setiap percakapan memiliki token sesi unik sehingga Anda dapat melanjutkan obrolan kapan saja lintas peramban tanpa kehilangan konteks diskusi.
                </p>
              </div>
            </div>
          </section>

          {/* Pertanyaan Umum (FAQ Accordion Berkelas) */}
          <section className="space-y-4">
            <div>
              <h3 className="text-lg font-serif font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                <HelpCircle size={18} className="text-[#DA7756]" />
                <span>Pertanyaan yang Sering Diajukan</span>
              </h3>
              <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                Informasi seputar identitas pembuat, variasi penamaan, dan legalitas
              </p>
            </div>

            <div className="space-y-2.5">
              {faqs.map((faq, idx) => {
                const isOpenFaq = activeFaq === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-[#E5E3DB] dark:border-[#27272A] bg-white dark:bg-[#202024] overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setActiveFaq(isOpenFaq ? null : idx)}
                      className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-black/2 dark:hover:bg-white/2 transition"
                    >
                      <span className="font-semibold text-xs sm:text-sm text-[#23201D] dark:text-[#F4F4F5]">
                        {faq.q}
                      </span>
                      <span className="w-6 h-6 rounded-lg bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#8C8782] shrink-0 text-xs">
                        {isOpenFaq ? '−' : '+'}
                      </span>
                    </button>
                    {isOpenFaq && (
                      <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-[#65605B] dark:text-[#A1A1AA] leading-relaxed border-t border-[#E5E3DB]/60 dark:border-[#27272A]/80 pt-3">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Call to Action Banner */}
          <section className="p-6 sm:p-8 rounded-3xl bg-[#DA7756]/10 border border-[#DA7756]/20 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="space-y-1">
              <h4 className="font-serif font-bold text-base sm:text-lg text-[#23201D] dark:text-[#F4F4F5]">
                Siap menjelajahi kecerdasan buatan masa depan?
              </h4>
              <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                Mulai interaksi pertama Anda bersama qwertybot tanpa biaya sekarang juga.
              </p>
            </div>
            {isStandalone ? (
              <a
                href="/"
                className="px-5 py-2.5 rounded-xl bg-[#DA7756] hover:bg-[#C86646] text-white text-xs font-semibold shadow-md shadow-[#DA7756]/25 transition whitespace-nowrap"
              >
                Mulai Mengobrol
              </a>
            ) : (
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#DA7756] hover:bg-[#C86646] text-white text-xs font-semibold shadow-md shadow-[#DA7756]/25 transition whitespace-nowrap"
              >
                Mulai Mengobrol
              </button>
            )}
          </section>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#1F1F23]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span>© 2026 qwertybot • Diciptakan &amp; Dimiliki oleh Dimas Dwi Syahputra</span>
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
