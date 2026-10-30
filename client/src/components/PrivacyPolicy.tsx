import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  Lock,
  AlertTriangle,
  ArrowLeft,
  X,
  ExternalLink,
  Mail,
  Scale,
  FileText,
  Server,
  UserCheck,
  Ban
} from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
  isOpen,
  onClose,
  isStandalone = false
}) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

  if (!isOpen) return null;

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
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-base tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                  qwertybot
                </span>
                <span className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Privasi &amp; Ketentuan
                </span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A]">
                Ketentuan layanan dan perlindungan data pengguna
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
                title="Tutup Kebijakan Privasi"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </header>

        {/* Tab Switcher */}
        <nav className="flex items-center gap-2 px-6 pt-4 pb-3 sm:px-8 border-b border-[#E5E3DB]/70 dark:border-[#27272A]/70 bg-[#FAF9F5] dark:bg-[#18181B]">
          <button
            type="button"
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#DA7756] text-white shadow-md shadow-[#DA7756]/20'
                : 'bg-white dark:bg-[#202023] text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-[#F4F4F5] border border-[#E5E3DB] dark:border-[#27272A]'
            }`}
          >
            <Lock size={14} />
            <span>1. Kebijakan Privasi</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'terms'
                ? 'bg-[#DA7756] text-white shadow-md shadow-[#DA7756]/20'
                : 'bg-white dark:bg-[#202023] text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-[#F4F4F5] border border-[#E5E3DB] dark:border-[#27272A]'
            }`}
          >
            <Scale size={14} />
            <span>2. Ketentuan Layanan</span>
          </button>
        </nav>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 space-y-8 leading-relaxed text-[#4A4641] dark:text-[#D4D4D8]">
          {/* Trust Highlights Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                <ShieldCheck size={16} className="text-emerald-500" />
                <span>Tidak Menjual Data</span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                Obrolan dan data Anda tidak pernah dijual atau diserahkan ke pihak pengiklan mana pun.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                <Server size={16} className="text-[#DA7756]" />
                <span>Penyimpanan Aman</span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                File upload diproteksi dengan penamaan acak dan hanya bisa diakses saat sesi chat Anda aktif.
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] shadow-2xs space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                <Scale size={16} className="text-blue-500" />
                <span>Kontrol Penuh Pengguna</span>
              </div>
              <p className="text-[11px] text-[#8C8782] dark:text-[#71717A] leading-relaxed">
                Anda bebas menghapus riwayat atau mengekspor isi percakapan kapan saja tanpa halangan.
              </p>
            </div>
          </div>

          {activeTab === 'privacy' ? (
            /* TAB 1: KEBIJAKAN PRIVASI */
            <div className="space-y-8">
              {/* Section 1 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    01
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Identitas Pengembang &amp; Ruang Lingkup Layanan
                  </h2>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-2 text-xs sm:text-sm">
                  <p>
                    Platform asisten kecerdasan buatan <strong>qwertybot</strong> (dikenal juga sebagai <strong>bot qwerty</strong> yang beralamat resmi di <a href="https://qwertybot.biz.id" target="_blank" rel="noreferrer" className="text-[#DA7756] underline font-medium">https://qwertybot.biz.id</a>) dirancang, dibuat, dan dikelola secara mandiri oleh <strong>Dimas Dwi Syahputra</strong> ("Pengembang", "Pemilik Layanan").
                  </p>
                  <p className="text-[#65605B] dark:text-[#A1A1AA]">
                    Dokumen ini menjelaskan komitmen kami dalam melindungi privasi Anda saat berinteraksi dengan model kecerdasan buatan, sesuai dengan ketentuan <strong>UU RI No. 27 Tahun 2022 (UU PDP)</strong> dan <strong>Undang-Undang Informasi dan Transaksi Elektronik (UU ITE)</strong>.
                  </p>
                </div>
              </section>

              {/* Section 2 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    02
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Data yang Dikumpulkan &amp; Tujuan Pemrosesannya
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                      <UserCheck size={15} className="text-emerald-500" />
                      <span>Autentikasi Google Sign-In (OAuth)</span>
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                      Kami hanya menerima nama, alamat email, dan URL foto profil publik untuk sinkronisasi riwayat obrolan dan pemberian kuota bonus. Kami tidak pernah meminta atau menyimpan kata sandi akun Google Anda.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                      <FileText size={15} className="text-[#DA7756]" />
                      <span>Pesan Obrolan &amp; Berkas Lampiran</span>
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                      Teks, dokumen PDF, foto, dan audio suara yang Anda unggah hanya diproses untuk menghasilkan respon jawaban AI saat sesi aktif dan disimpan secara lokal di perangkat Anda.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                      <Server size={15} className="text-blue-500" />
                      <span>Log Keamanan &amp; Alamat IP</span>
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                      Alamat IP dan data teknis browser dicatat sementara oleh sistem firewall dan rate limiter untuk mencegah serangan DDoS, spamming, dan melindungi stabilitas server VPS.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1.5">
                    <div className="flex items-center gap-2 text-xs font-semibold text-[#23201D] dark:text-[#F4F4F5]">
                      <Lock size={15} className="text-purple-500" />
                      <span>Penyimpanan Lokal (Local Storage)</span>
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA] leading-relaxed">
                      Preferensi tema (gelap/terang) dan pilihan model disimpan langsung di browser lokal Anda tanpa menggunakan cookie pihak ketiga pelacak periklanan.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    03
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Layanan Infrastruktur Tepercaya
                  </h2>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-2.5 text-xs sm:text-sm">
                  <p className="text-[#65605B] dark:text-[#A1A1AA]">
                    Untuk memberikan keandalan kelas industri, sistem kami terintegrasi dengan penyedia terpercaya:
                  </p>
                  <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                    <li><strong>Google LLC (Gemini API &amp; Google Identity):</strong> Pemrosesan model kecerdasan buatan dan verifikasi identitas pengguna secara aman.</li>
                    <li><strong>Cloudflare Inc.:</strong> Jaringan pengiriman konten (CDN), sertifikat enkripsi SSL/TLS, dan proteksi serangan bot web.</li>
                    <li><strong>Pollinations AI:</strong> Layanan pembuatan karya visual berkualitas tinggi saat Anda meminta pembuatan gambar dari teks.</li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    04
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Hak Kendali &amp; Penghapusan Data Anda
                  </h2>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-2 text-xs sm:text-sm">
                  <p>Anda memiliki kedaulatan mutlak atas data Anda di qwertybot:</p>
                  <ul className="list-disc pl-5 space-y-1 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                    <li>Menghapus sesi obrolan secara mandiri melalui tombol tempat sampah di bilah samping kapan saja.</li>
                    <li>Mengekspor seluruh riwayat percakapan Anda ke dalam format Markdown (.md) atau Teks (.txt) sebelum menghapusnya.</li>
                    <li>Mengajukan permohonan penghapusan riwayat akun secara permanen dengan mengirimkan email ke <a href="mailto:dimassdwisyah@gmail.com" className="text-[#DA7756] underline font-medium">dimassdwisyah@gmail.com</a>.</li>
                  </ul>
                </div>
              </section>
            </div>
          ) : (
            /* TAB 2: KETENTUAN LAYANAN */
            <div className="space-y-8">
              {/* Terms 1: AI Disclaimer */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-600 font-bold text-xs inline-flex items-center justify-center">
                    01
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Penafian Tanggung Jawab Kecerdasan Buatan (AI Legal Disclaimer)
                  </h2>
                </div>

                <div className="p-4 sm:p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 space-y-2.5 text-xs sm:text-sm">
                  <div className="flex items-center gap-2 font-bold text-rose-700 dark:text-rose-300">
                    <AlertTriangle size={16} />
                    <span>Perhatian Penting Mengenai Output AI:</span>
                  </div>
                  <p className="leading-relaxed">
                    1. <strong>Bukan Nasihat Medis, Hukum, atau Finansial:</strong> Semua jawaban yang dihasilkan qwertybot bersifat murni referensial dan eksperimental. Konten tersebut bukan diagnosis medis resmi, advis investasi finansial, ataupun nasihat hukum bersertifikat.
                  </p>
                  <p className="leading-relaxed">
                    2. <strong>Potensi Ketidakakuratan:</strong> Model bahasa besar (LLM) dapat berhalusinasi atau memberikan fakta yang tidak presisi. Anda bertanggung jawab secara mandiri untuk menguji kode dan memverifikasi kebenaran setiap informasi sebelum diterapkan.
                  </p>
                  <p className="leading-relaxed">
                    3. <strong>Bebas Tanggung Jawab Kerusakan:</strong> Pengembang (Dimas Dwi Syahputra) dibebaskan dari segala tuntutan atas kerusakan sistem, kegagalan produksi, atau kerugian materiil akibat penggunaan saran atau skrip dari qwertybot.
                  </p>
                </div>
              </section>

              {/* Terms 2: Prohibited Uses */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    02
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Kebijakan Penggunaan yang Dilarang
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                    <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                      <Ban size={14} /> Kejahatan Siber &amp; Malware
                    </span>
                    <p className="text-[#65605B] dark:text-[#A1A1AA]">
                      Dilarang membuat skrip exploit, virus, ransomware, phishing, atau alat peretasan yang merusak sistem komputer pihak mana pun.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                    <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                      <Ban size={14} /> Konten Berbahaya &amp; Ilegal
                    </span>
                    <p className="text-[#65605B] dark:text-[#A1A1AA]">
                      Dilarang menyebarkan materi pornografi anak (CSAM), hasutan terorisme, pembuatan senjata/zat beracun, serta ujaran diskriminasi SARA.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                    <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                      <Ban size={14} /> Doxxing &amp; Pelecehan
                    </span>
                    <p className="text-[#65605B] dark:text-[#A1A1AA]">
                      Dilarang mempublikasikan data pribadi orang lain tanpa izin atau melakukan pelecehan serta pencemaran nama baik.
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-1">
                    <span className="font-semibold text-rose-500 flex items-center gap-1.5">
                      <Ban size={14} /> Manipulasi Server
                    </span>
                    <p className="text-[#65605B] dark:text-[#A1A1AA]">
                      Dilarang mencoba membobol terminal VPS, memanipulasi token autentikasi, atau melakukan serangan Denial-of-Service (DoS).
                    </p>
                  </div>
                </div>
              </section>

              {/* Terms 3: Hak Kekayaan Intelektual */}
              <section className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-[#DA7756]/15 text-[#DA7756] font-bold text-xs inline-flex items-center justify-center">
                    03
                  </span>
                  <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5]">
                    Hak Kekayaan Intelektual &amp; Yurisdiksi Hukum
                  </h2>
                </div>
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-2 text-xs sm:text-sm">
                  <p>
                    Seluruh desain antarmuka, tata letak grafis, logo, arsitektur kode sumber, dan merek qwertybot adalah hak cipta resmi milik <strong>Dimas Dwi Syahputra</strong> dan dilindungi hukum Hak Cipta Republik Indonesia.
                  </p>
                  <p className="text-[#65605B] dark:text-[#A1A1AA]">
                    Ketentuan ini diatur dan ditafsirkan berdasarkan hukum <strong>Negara Kesatuan Republik Indonesia</strong>. Segala perselisihan akan diselesaikan melalui musyawarah mufakat atau melalui yurisdiksi pengadilan di Indonesia.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* Section Kontak Resmi Pengembang */}
          <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#202024] border border-[#E5E3DB] dark:border-[#27272A] space-y-3.5">
            <div className="flex items-center gap-2 text-sm font-bold text-[#23201D] dark:text-[#F4F4F5]">
              <Mail size={16} className="text-[#DA7756]" />
              <span>Pusat Bantuan Hukum &amp; Kontak Resmi</span>
            </div>
            <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
              Bila Anda memerlukan klarifikasi legal, permohonan audit, atau pertanyaan terkait privasi, hubungi kami:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Pengembang &amp; Pemilik:</span>
                <span className="font-semibold text-[#23201D] dark:text-[#F4F4F5]">Dimas Dwi Syahputra</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Email Resmi:</span>
                <a href="mailto:dimassdwisyah@gmail.com" className="font-semibold text-[#DA7756] hover:underline">
                  dimassdwisyah@gmail.com
                </a>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Domain Resmi:</span>
                <span className="font-semibold text-[#23201D] dark:text-[#F4F4F5]">https://qwertybot.biz.id</span>
              </div>

              <div className="p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">GitHub Profil:</span>
                <a
                  href="https://github.com/DimassDwiiorg"
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-[#DA7756] hover:underline flex items-center gap-1"
                >
                  github.com/DimassDwiiorg <ExternalLink size={11} />
                </a>
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="px-6 py-4 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#1F1F23]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span>© 2026 qwertybot by Dimas Dwi Syahputra. All rights reserved.</span>
          {!isStandalone && (
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-white dark:text-[#18181B] font-medium hover:opacity-90 transition text-xs"
            >
              Saya Mengerti &amp; Setuju
            </button>
          )}
        </footer>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
