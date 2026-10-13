# 🤖 qwertybot - Claude-Style Multimodal AI Website

Website asisten AI interaktif bernama **qwertybot** dengan antarmuka elegan terinspirasi dari **Claude AI**, ditenagai oleh **Google Gemini API** (Interactions & Multimodal), dibangun menggunakan **Fullstack TypeScript**.

---

## ✨ Fitur Utama

1. **Desain Antarmuka Khas Claude**:
   - Layout minimalis, estetika palet warna hangat (warm cream & warm dark).
   - Sidebar riwayat obrolan yang dapat dilipat (*collapsible*).
   - Render Markdown lengkap (tabel, heading, kutipan, dan syntax highlighting kode dengan tombol **Salin Kode**).
   - Indikator respon mengetik bergaya Claude.

2. **Tema Adaptif Perangkat (Auto Dark / Light Mode)**:
   - Secara otomatis mendeteksi mode gelap / terang perangkat Anda (`prefers-color-scheme`).
   - Berubah seketika jika perangkat beralih antara tema gelap dan terang tanpa perlu refresh.
   - Dilengkapi juga opsi manual di sidebar (*Sistem / Terang / Gelap*).

3. **Multimodal Penuh**:
   - **Membaca Gambar**: Mendukung format PNG, JPG, WEBP, GIF untuk analisis visual.
   - **Membaca File & Dokumen**: Mendukung PDF, TXT, JSON, CSV, Markdown, dan berbagai file kode sumber (`.js`, `.ts`, `.py`, `.html`, `.css`, dll).
   - **Mendengarkan Voice Note (VN)**: Dilengkapi fitur perekam suara langsung dari mikrofon browser dengan indikator visual waktu rekaman, serta pemutar audio interaktif.

4. **Sistem Sesi & Memori Percakapan (Session Code)**:
   - Setiap percakapan memiliki **Session Code** unik (contoh: `QW-84920`).
   - Riwayat percakapan tersimpan secara persisten di server (`data/sessions.json` / SQLite).
   - **qwertybot** mengingat seluruh konteks obrolan sebelumnya di sesi yang sama.
   - Anda dapat menyalin kode sesi atau membuka kembali obrolan lama kapan saja menggunakan fitur **"Buka via Session Code"**.
   - **🔍 Pencarian Cepat Riwayat**: Filter obrolan lama secara instan via search bar sidebar.
   - **✏️ Rename Judul Sesi**: Ubah judul percakapan secara inline dengan satu klik tombol pensil.

5. **⚡ Claude-Style Live Artifacts (Preview Interaktif)**:
   - Kode HTML, SVG, dan JavaScript dapat langsung dipratinjau dalam modal **Live Sandboxed Preview**.
   - Dilengkapi switch ukuran layar responsif: **Desktop (100%)**, **Tablet (768px)**, dan **Mobile (390px)**.
   - Opsi unduh langsung kode/dokumen (`.html`, `.svg`, `.js`) dan tombol buka di tab peramban baru.

6. **🔊 Text-to-Speech (TTS) Suara Alami**:
   - Dengarkan respon qwertybot dibacakan secara alami dengan Web Speech API bawaan peramban (tanpa memotong kuota API).
   - Dilengkapi pembersih sintaksis Markdown otomatis agar intonasi suara tetap mengalir enak didengar.

7. **💡 Interaktivitas Pesan & Ekspor**:
   - **📋 Salin Respon Lengkap**: Salin seluruh jawaban bot dengan satu kali klik.
   - **🔄 Coba Lagi (Regenerate)**: Minta bot menjawab ulang prompt terakhir dengan variasi baru.
   - **💡 Smart Follow-up Chips**: Saran pertanyaan lanjutan kontekstual di bawah jawaban bot.
   - **📄 Ekspor Percakapan**: Unduh seluruh riwayat obrolan ke format **Markdown (`.md`)** atau **Plain Text (`.txt`)**.

---

## 🛠️ Arsitektur Teknologi

- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, React Markdown.
- **Backend**: Node.js v24, Express, TypeScript, Multer, TSX.
- **AI Core**: Google Gemini API via official endpoint (`gemini-3.8-flash` & fallback cerdas `gemini-3.5-flash`).

---

## 🚀 Cara Menjalankan

### 1. Jalankan Mode Pengembangan (Frontend & Backend Bersamaan):
```bash
npm run dev
```
Aplikasi akan aktif di:
- **Frontend (Vite HMR)**: `http://localhost:5173`
- **Backend (Express API)**: `http://localhost:5000`

### 2. Jalankan Mode Produksi Langsung:
```bash
npm start
```
Buka peramban Anda di:
👉 **`http://localhost:5000`**

---

## ⚙️ Konfigurasi Environment (`.env`)

File `.env` di direktori utama:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

---

## 📁 Struktur Direktori

```
ai/
├── plan.md                       # Rencana & spesifikasi arsitektur
├── README.md                     # Dokumentasi panduan
├── .env                          # Konfigurasi environment & API Key
├── package.json                  # Dependensi root & script orkestrasi
├── server/                       # Backend TypeScript
│   ├── src/
│   │   ├── index.ts              # Entry point Express
│   │   ├── config.ts             # Konfigurasi model Gemini & persona qwertybot
│   │   ├── controllers/
│   │   │   ├── chatController.ts # Handler pesan teks, file, dan audio VN
│   │   │   └── sessionController.ts # Handler sesi & pencarian kode sesi
│   │   ├── services/
│   │   │   ├── geminiService.ts  # Integrasi Gemini multimodal & memori
│   │   │   └── sessionStore.ts   # Persistensi data sesi & JSON storage
│   │   └── types/
│   │       └── index.ts          # Type definition backend
│   └── tsconfig.json
├── client/                       # Frontend React + TypeScript
│   ├── src/
│   │   ├── App.tsx               # Komponen utama
│   │   ├── index.css             # Tema warna Claude
│   │   ├── hooks/
│   │   │   ├── useTheme.ts       # Deteksi tema sistem perangkat
│   │   │   └── useAudioRecorder.ts # Perekaman mic VN browser
│   │   └── components/
│   │       ├── Sidebar.tsx       # Sidebar sesi & session code
│   │       ├── ChatFeed.tsx      # Tampilan pesan & markdown
│   │       ├── MessageInput.tsx  # Kotak input, upload file & rekam VN
│   │       ├── AudioPlayer.tsx   # Pemutar audio VN interaktif
│   │       └── AttachmentPreview.tsx
│   ├── vite.config.ts
│   └── tailwind.config.js
├── data/
│   └── sessions.json             # Penyimpanan lokal data sesi obrolan
└── uploads/                      # Penyimpanan sementara file & rekaman VN
```
