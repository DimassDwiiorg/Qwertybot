import React from 'react';
import { Sparkles, ExternalLink, Mail, ArrowLeft, X, Code, ShieldCheck, Bot } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose, isStandalone = false }) => {
  if (!isOpen) return null;

  return (
    <div
      className={
        isStandalone
          ? 'min-h-screen w-full bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] flex flex-col'
          : 'fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto animate-fade-in'
      }
    >
      <div
        className={
          isStandalone
            ? 'w-full max-w-4xl mx-auto px-4 py-8 sm:px-8 flex-1 flex flex-col'
            : 'relative w-full max-w-3xl max-h-[90vh] bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] rounded-3xl border border-[#E5E3DB] dark:border-[#27272A] shadow-2xl flex flex-col overflow-hidden'
        }
      >
        {/* Header Modal */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E3DB] dark:border-[#27272A] bg-white/80 dark:bg-[#202023]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center border border-[#DA7756]/20 shadow-xs">
              <Bot size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                  Tentang qwertybot (Bot Qwerty)
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-[#DA7756]/10 text-[#DA7756] border border-[#DA7756]/20">
                  Resmi
                </span>
              </div>
              <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                Profil Pemilik (Owner) &amp; Pengembang: Dimas Dwi Syahputra
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isStandalone ? (
              <a
                href="/"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EDEAE3] dark:bg-[#27272A] hover:bg-[#E5E3DB] dark:hover:bg-[#323236] text-xs font-medium text-[#23201D] dark:text-[#F4F4F5] transition"
              >
                <ArrowLeft size={14} />
                <span>Kembali ke Chat</span>
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
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 overflow-y-auto text-sm leading-relaxed text-[#524D48] dark:text-[#D4D4D8]">
          {/* Card Profil Pemilik / Owner */}
          <section className="p-5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#DA7756] to-[#E25C37] text-white flex items-center justify-center font-bold text-2xl shadow-md shrink-0">
                DD
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-lg font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Dimas Dwi Syahputra
                  </h2>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Owner &amp; Lead Developer
                  </span>
                </div>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A] mt-0.5">
                  Dikenal juga dengan nama panggilan <strong className="text-[#DA7756]">Dimas</strong> • Kreator &amp; Pemilik qwertybot
                </p>
                <div className="flex items-center gap-3 mt-2.5 flex-wrap text-xs">
                  <a
                    href="https://github.com/DimassDwiiorg"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 font-medium text-[#DA7756] hover:underline"
                  >
                    <Code size={13} />
                    <span>github.com/DimassDwiiorg</span>
                    <ExternalLink size={10} />
                  </a>
                  <a
                    href="mailto:dimassdwisyah@gmail.com"
                    className="flex items-center gap-1.5 font-medium text-[#65605B] dark:text-[#A1A1AA] hover:text-[#DA7756] transition"
                  >
                    <Mail size={13} />
                    <span>dimassdwisyah@gmail.com</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E5E3DB]/60 dark:border-[#27272A]/80 text-xs sm:text-sm text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
              <p>
                <strong>Dimas Dwi Syahputra</strong> adalah pengembang perangkat lunak (software engineer) dan AI developer asal Indonesia yang merancang, membangun, dan memiliki platform asisten AI <strong>qwertybot</strong> (dikenal juga sebagai <strong>bot qwerty</strong>). Seluruh arsitektur frontend, backend, desain antarmuka Claude-style, integrasi multimodal, dan infrastruktur server VPS dikembangkan secara mandiri oleh Dimas.
              </p>
            </div>
          </section>

          {/* Apa itu qwertybot / Bot Qwerty */}
          <section className="space-y-3">
            <h3 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
              <Sparkles size={16} className="text-[#DA7756]" />
              <span>Apa itu qwertybot (Bot Qwerty)?</span>
            </h3>
            <p>
              <strong>qwertybot</strong> (atau sering dicari pengguna sebagai <strong>bot qwerty</strong> atau <strong>qwerty bot</strong>) adalah platform asisten kecerdasan buatan (AI) interaktif multimodal yang dirancang untuk membantu produktivitas, penulisan kode pemrograman, riset data, serta analisis visual dan audio.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  💻 Live Artifacts Code Preview
                </h4>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                  Generator kode HTML, SVG, dan React dengan preview live interaktif seketika di peramban web.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  🎙️ Pemahaman Voice Note (VN)
                </h4>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                  Dukungan pesan suara langsung melalui mic browser, dilengkapi fitur Text-to-Speech bahasa Indonesia.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  📄 Analisis Dokumen &amp; Foto
                </h4>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                  Membaca berkas PDF, skrip kode sumber, file teks, serta mendeskripsikan foto atau tangkapan layar.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs text-[#23201D] dark:text-[#F4F4F5] mb-1">
                  🧠 Memori Kode Sesi (Session Code)
                </h4>
                <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                  Simpan riwayat percakapan dengan Session Code unik untuk dibuka kembali di perangkat mana pun.
                </p>
              </div>
            </div>
          </section>

          {/* Pertanyaan yang Sering Diajukan (FAQ Mesin Pencari) */}
          <section className="space-y-3 pt-2">
            <h3 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
              <ShieldCheck size={16} className="text-[#DA7756]" />
              <span>Pertanyaan yang Sering Ditanyakan (FAQ)</span>
            </h3>

            <div className="space-y-2.5">
              <div className="p-4 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs sm:text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Siapa Dimas? Siapa Dimas Dwi Syahputra?
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] mt-1.5 leading-relaxed">
                  Dimas Dwi Syahputra (biasa disapa Dimas) adalah pemilik (owner), perancang, dan pembuat dari situs web qwertybot (bot qwerty). Ia adalah pengembang perangkat lunak yang berfokus pada kecerdasan buatan dan aplikasi web modern.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs sm:text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Apa perbedaan antara qwertybot dan bot qwerty?
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] mt-1.5 leading-relaxed">
                  Kedua nama tersebut merujuk pada platform yang sama di domain resmi <strong>https://qwertybot.biz.id</strong>. Pengguna sering mencari dengan variasi kata kunci <em>bot qwerty</em>, <em>qwerty bot</em>, maupun <em>qwertybot ai</em>.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                <h4 className="font-semibold text-xs sm:text-sm text-[#23201D] dark:text-[#F4F4F5]">
                  Apakah bot qwerty gratis untuk digunakan?
                </h4>
                <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] mt-1.5 leading-relaxed">
                  Ya, qwertybot dapat diakses gratis oleh masyarakat umum dengan kuota pesan harian berkala serta opsi login Google untuk mendapatkan tambahan bonus kuota percakapan.
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#202023]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span className="flex items-center gap-1">
            <span>&copy; 2026 qwertybot • Dibuat oleh Dimas Dwi Syahputra</span>
          </span>
          {!isStandalone && (
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-[#FAF9F5] dark:text-[#18181B] font-semibold text-xs hover:opacity-90 transition"
            >
              Tutup
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
export default AboutModal;
