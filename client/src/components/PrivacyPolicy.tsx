import React, { useState } from 'react';
import { Shield, Lock, AlertTriangle, ArrowLeft, X, ExternalLink, Mail, CheckCircle2, Scale } from 'lucide-react';

interface PrivacyPolicyProps {
  isOpen: boolean;
  onClose: () => void;
  isStandalone?: boolean;
}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({ isOpen, onClose, isStandalone = false }) => {
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy');

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
            ? 'w-full max-w-5xl mx-auto px-4 py-8 sm:px-8 flex-1 flex flex-col'
            : 'relative w-full max-w-4xl max-h-[90vh] bg-[#FAF9F5] dark:bg-[#18181B] text-[#23201D] dark:text-[#F4F4F5] rounded-3xl border border-[#E5E3DB] dark:border-[#27272A] shadow-2xl flex flex-col overflow-hidden'
        }
      >
        {/* Header Modal / Page */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E3DB] dark:border-[#27272A] bg-white/80 dark:bg-[#202023]/80 backdrop-blur-md sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#DA7756]/10 text-[#DA7756] flex items-center justify-center border border-[#DA7756]/20 shadow-xs">
              <Shield size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold tracking-tight text-[#23201D] dark:text-[#F4F4F5]">
                  Kebijakan Privasi & Ketentuan Layanan
                </h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Resmi & Sah
                </span>
              </div>
              <p className="text-xs text-[#8C8782] dark:text-[#71717A]">
                qwertybot.biz.id • Terakhir Diperbarui: 11 Oktober 2026
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
                title="Tutup Kebijakan Privasi"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 px-6 pt-4 pb-2 border-b border-[#E5E3DB]/70 dark:border-[#27272A]/70 bg-[#FAF9F5] dark:bg-[#18181B]">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'privacy'
                ? 'bg-[#DA7756] text-white shadow-md shadow-[#DA7756]/20'
                : 'bg-white dark:bg-[#202023] text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-[#F4F4F5] border border-[#E5E3DB] dark:border-[#27272A]'
            }`}
          >
            <Lock size={14} />
            <span>1. Kebijakan Privasi (Privacy Policy)</span>
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'terms'
                ? 'bg-[#DA7756] text-white shadow-md shadow-[#DA7756]/20'
                : 'bg-white dark:bg-[#202023] text-[#65605B] dark:text-[#A1A1AA] hover:text-[#23201D] dark:hover:text-[#F4F4F5] border border-[#E5E3DB] dark:border-[#27272A]'
            }`}
          >
            <Scale size={14} />
            <span>2. Ketentuan Layanan (Terms of Service)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-8 text-sm leading-relaxed text-[#4A4641] dark:text-[#D4D4D8]">
          {/* Quick Notice Banner */}
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs flex gap-3">
            <AlertTriangle size={18} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-semibold block mb-0.5">Pemberitahuan Penting untuk Seluruh Pengguna:</span>
              Dokumen ini mengikat secara hukum antara Anda ("Pengguna") dan Dimas Dwi Syahputra ("Pengembang/Pemilik qwertybot"). Dengan menggunakan situs web <strong>https://qwertybot.biz.id</strong>, Anda menyetujui seluruh ketentuan privasi, pembatasan tanggung jawab kecerdasan buatan, dan aturan hukum di bawah ini.
            </div>
          </div>

          {activeTab === 'privacy' ? (
            /* TAB 1: KEBIJAKAN PRIVASI */
            <div className="space-y-7">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">1</span>
                  Identitas Pengembang & Ruang Lingkup Layanan
                </h2>
                <p>
                  Situs web <strong>qwertybot</strong> (dapat diakses di <a href="https://qwertybot.biz.id" className="text-[#DA7756] underline" target="_blank" rel="noreferrer">https://qwertybot.biz.id</a>) adalah platform asisten kecerdasan buatan mandiri yang dirancang, dibuat, dan dikelola secara resmi oleh <strong>Dimas Dwi Syahputra</strong> ("Kami", "Penyedia Layanan").
                </p>
                <p>
                  Kebijakan Privasi ini menerangkan bagaimana kami mengumpulkan, menggunakan, menyimpan, memproses, dan melindungi data pribadi Anda saat menggunakan platform ini, sesuai dengan ketentuan perundang-undangan Republik Indonesia, khususnya <strong>Undang-Undang Republik Indonesia Nomor 27 Tahun 2022 tentang Pelindungan Data Pribadi (UU PDP)</strong> dan <strong>Undang-Undang Informasi dan Transaksi Elektronik (UU ITE)</strong>.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">2</span>
                  Data yang Kami Kumpulkan & Cara Pengumpulannya
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                    <div className="font-semibold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2 mb-1 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Data Autentikasi Google (OAuth)
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                      Ketika Anda memilih masuk menggunakan Google Sign-In, kami hanya menerima profil publik berupa: <strong>Nama Lengkap</strong>, <strong>Alamat Email</strong>, dan <strong>URL Foto Profil</strong>. Kami <u>TIDAK PERNAH</u> memiliki akses atau menyimpan kata sandi (password) Google Anda.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                    <div className="font-semibold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2 mb-1 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Konten Pesan & Berkas yang Diunggah
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                      Prompt teks, kode, dokumen (PDF/TXT), gambar, atau berkas audio suara yang Anda masukkan diproses semata-mata untuk menghasilkan respon jawaban AI dan disimpan dalam sesi lokal obrolan Anda.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                    <div className="font-semibold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2 mb-1 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Data Teknis & Log Koneksi
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                      Informasi teknis seperti Alamat IP (*Internet Protocol*), peramban (*User-Agent*), dan stempel waktu dicatat sementara untuk keperluan keamanan server, pencegahan spam/DDoS, serta penegakan batas laju (*rate limiting*).
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A]">
                    <div className="font-semibold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2 mb-1 text-xs">
                      <CheckCircle2 size={15} className="text-emerald-500" />
                      Penyimpanan Lokal (Local Storage)
                    </div>
                    <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
                      Kami menggunakan penyimpanan lokal browser untuk mengingat preferensi antarmuka Anda (mode gelap/terang, model AI yang dipilih, dan status sesi aktif) tanpa menggunakan pelacak iklan pihak ketiga.
                    </p>
                  </div>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">3</span>
                  Komitmen Tegas: Tidak Menjual Data Pribadi
                </h2>
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-xs">
                  <strong>Jaminan Privasi:</strong> Kami <strong>TIDAK PERNAH</strong> dan <strong>TIDAK AKAN PERNAH</strong> menjual, menyewakan, memperdagangkan, atau membagikan data pribadi maupun percakapan Anda kepada perusahaan periklanan, pialang data (*data broker*), atau pihak ketiga mana pun untuk tujuan komersial atau penargetan iklan.
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">4</span>
                  Integrasi Layanan Pihak Ketiga Tepercaya
                </h2>
                <p>Untuk menjalankan fitur-fitur pada qwertybot, sistem kami terhubung dengan penyedia infrastruktur tepercaya berikut:</p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                  <li>
                    <strong>Google LLC (Google Generative AI & Google Identity):</strong> Digunakan untuk pemrosesan Large Language Model (Gemini API) serta sistem login Google Sign-In. Penggunaan data tunduk pada <em>Google API Services User Data Policy</em> dan <em>Google Privacy Policy</em>.
                  </li>
                  <li>
                    <strong>Cloudflare, Inc.:</strong> Digunakan sebagai penyedia jaringan pengiriman konten, sertifikat keamanan SSL/TLS terenkripsi, proteksi Denial-of-Service, serta tunneling aman ke server.
                  </li>
                  <li>
                    <strong>Pollinations AI:</strong> Layanan terpisah yang digunakan untuk menghasilkan gambar visual berkualitas tinggi jika Pengguna meminta pembuatan ilustrasi atau karya seni melalui prompt gambar.
                  </li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">5</span>
                  Hak Pengguna & Penghapusan Data (Data Retention)
                </h2>
                <p>
                  Sesuai dengan ketentuan perundang-undangan perlindungan data pribadi, Anda memiliki hak penuh untuk:
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                  <li>Menghapus riwayat percakapan Anda secara mandiri kapan saja melalui tombol ikon tempat sampah di bilah samping (Sidebar).</li>
                  <li>Melakukan ekspor percakapan ke dalam format Markdown (.md) atau Teks (.txt) sebelum menghapusnya.</li>
                  <li>
                    Meminta penghapusan permanen atas seluruh akun dan catatan yang terkait dengan email Anda dengan mengirimkan permohonan ke email resmi kami: <a href="mailto:dimassdwisyah@gmail.com" className="text-[#DA7756] font-medium underline">dimassdwisyah@gmail.com</a>.
                  </li>
                </ul>
              </section>
            </div>
          ) : (
            /* TAB 2: KETENTUAN LAYANAN */
            <div className="space-y-7">
              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">1</span>
                  Pernyataan Penafian Kecerdasan Buatan (AI Legal Disclaimer)
                </h2>
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs space-y-2">
                  <div className="font-bold flex items-center gap-2">
                    <AlertTriangle size={15} />
                    PERINGATAN RESMI MENGENAI KONTEN KECERDASAN BUATAN:
                  </div>
                  <p>
                    1. <strong>Bukan Nasihat Hukum, Medis, atau Finansial:</strong> Semua jawaban, saran, teks, maupun kalkulasi yang dihasilkan oleh qwertybot bersifat murni eksperimental dan informatif. Konten tersebut <u>BUKAN</u> merupakan nasihat hukum resmi, diagnosis medis/kesehatan, nasihat investasi keuangan, ataupun rekomendasi keteknikan bersertifikat.
                  </p>
                  <p>
                    2. <strong>Potensi Halusinasi & Ketidakakuratan:</strong> Model AI dapat berhalusinasi atau memberikan fakta/sintaks yang keliru, usang, atau tidak tepat. Anda bertanggung jawab secara mandiri untuk menguji, memverifikasi, dan memastikan kebenaran output AI sebelum menggunakannya dalam proyek nyata atau mengambil keputusan penting.
                  </p>
                  <p>
                    3. <strong>Penafian Tanggung Jawab Kerusakan:</strong> Pengembang (Dimas Dwi Syahputra) dibebaskan sepenuhnya dari segala tanggung jawab atas kerugian finansial, kerusakan kode, kegagalan sistem produksi, kehilangan data, atau sanksi hukum apa pun yang diakibatkan oleh penggunaan saran atau script dari qwertybot.
                  </p>
                </div>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">2</span>
                  Kebijakan Penggunaan yang Dilarang (Prohibited Uses)
                </h2>
                <p>Pengguna dilarang keras memanfaatkan layanan qwertybot untuk aktivitas:</p>
                <div className="space-y-1.5 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Kejahatan Siber & Malware:</strong> Membuat skrip peretasan, ransomware, exploit zero-day, phishing, virus, bypass keamanan, atau otomasi penyerangan infrastruktur pihak mana pun.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Konten Ilegal & Berbahaya:</strong> Menghasilkan materi pornografi anak (CSAM), ujaran kebencian, hasutan terorisme, pembuatan senjata/senyawa kimia berbahaya, atau diskriminasi SARA.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Pelecehan & Pelanggaran Privasi:</strong> Menggunakan platform untuk menguntit, melecehkan, menyebarkan data pribadi orang lain (doxxing), atau mencemarkan nama baik.</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] flex items-start gap-2">
                    <span className="text-rose-500 font-bold">•</span>
                    <span><strong>Manipulasi Sistem & Kuota:</strong> Melakukan eksploitasi bug sistem, manipulasi token, atau serangan DoS/DDoS pada server qwertybot.biz.id.</span>
                  </div>
                </div>
                <p className="text-xs text-rose-600 dark:text-rose-400 font-medium pt-1">
                  * Pelanggaran berat terhadap ketentuan di atas akan mengakibatkan pemblokiran akun/IP seketika tanpa peringatan dan berpotensi dilaporkan kepada aparat penegak hukum yang berwenang.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">3</span>
                  Hak Kekayaan Intelektual (Intellectual Property)
                </h2>
                <p>
                  Seluruh desain grafis, antarmuka pengguna (UI/UX), arsitektur server, logo qwertybot, dan kode pemrograman aplikasi adalah karya cipta resmi milik <strong>Dimas Dwi Syahputra</strong> dan dilindungi oleh Undang-Undang Hak Cipta Republik Indonesia.
                </p>
                <p>
                  Pengguna memegang hak cipta penuh atas teks atau berkas asli yang diunggah ke platform. Hasil output teks/kode yang digenerasikan oleh AI dapat digunakan secara bebas oleh Pengguna untuk kepentingan pribadi maupun profesional, dengan ketentuan Pengguna menanggung sendiri segala risiko hak cipta pihak ketiga bila ada.
                </p>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">4</span>
                  Ganti Rugi & Pembebasan Hukum (Indemnification)
                </h2>
                <p>
                  Pengguna setuju untuk membela, mengganti rugi, dan membebaskan Pengembang (Dimas Dwi Syahputra), pemilik domain, dan penyedia server dari segala tuntutan hukum, klaim kerugian, denda, gugatan pihak ketiga, maupun biaya penasihat hukum yang timbul dari:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs text-[#65605B] dark:text-[#A1A1AA]">
                  <li>Penyalahgunaan layanan qwertybot oleh Pengguna.</li>
                  <li>Pelanggaran Pengguna terhadap isi Kebijakan Privasi dan Ketentuan Layanan ini.</li>
                  <li>Pelanggaran hak pihak ketiga, termasuk namun tidak terbatas pada hak cipta, paten, rahasia dagang, atau hak privasi orang lain.</li>
                </ul>
              </section>

              <section className="space-y-2">
                <h2 className="text-base font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-[#DA7756]/15 text-[#DA7756] inline-flex items-center justify-center text-xs">5</span>
                  Hukum yang Mengatur & Penyelesaian Sengketa
                </h2>
                <p>
                  Ketentuan Layanan ini diatur oleh dan ditafsirkan sesuai dengan hukum yang berlaku di <strong>Negara Kesatuan Republik Indonesia</strong>. Segala perselisihan atau sengketa yang timbul akan diupayakan untuk diselesaikan secara musyawarah mufakat terlebih dahulu, dan bila tidak tercapai kata sepakat, akan diselesaikan melalui yurisdiksi pengadilan di wilayah hukum Republik Indonesia.
                </p>
              </section>
            </div>
          )}

          {/* Section Kontak Resmi */}
          <section className="p-5 rounded-2xl bg-white dark:bg-[#202023] border border-[#E5E3DB] dark:border-[#27272A] space-y-3">
            <h3 className="text-sm font-bold text-[#23201D] dark:text-[#F4F4F5] flex items-center gap-2">
              <Mail size={16} className="text-[#DA7756]" />
              Kontak Resmi Pengembang & Pusat Bantuan
            </h3>
            <p className="text-xs text-[#65605B] dark:text-[#A1A1AA]">
              Bila Anda memiliki pertanyaan mengenai Ketentuan ini, ingin mengajukan permohonan penghapusan data, atau membutuhkan klarifikasi legal, silakan hubungi kami secara langsung:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Pengembang & Pemilik:</span>
                <span className="font-semibold text-[#23201D] dark:text-[#F4F4F5]">Dimas Dwi Syahputra</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Email Resmi:</span>
                <a href="mailto:dimassdwisyah@gmail.com" className="font-semibold text-[#DA7756] hover:underline">
                  dimassdwisyah@gmail.com
                </a>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Domain Resmi:</span>
                <span className="font-semibold text-[#23201D] dark:text-[#F4F4F5]">https://qwertybot.biz.id</span>
              </div>
              <div className="p-2.5 rounded-xl bg-[#FAF9F5] dark:bg-[#18181B] border border-[#E5E3DB] dark:border-[#27272A]">
                <span className="text-[#8C8782] dark:text-[#71717A] block text-[11px]">Portofolio / GitHub:</span>
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

        {/* Footer Modal */}
        <div className="px-6 py-4 border-t border-[#E5E3DB] dark:border-[#27272A] bg-white/60 dark:bg-[#202023]/60 flex items-center justify-between text-xs text-[#8C8782] dark:text-[#71717A]">
          <span>© 2026 qwertybot by Dimas Dwi Syahputra. All rights reserved.</span>
          {!isStandalone && (
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#23201D] dark:bg-[#F4F4F5] text-white dark:text-[#18181B] font-medium hover:opacity-90 transition"
            >
              Saya Mengerti & Setuju
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
