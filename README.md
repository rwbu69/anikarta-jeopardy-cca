# CCA ANIKARTA - Anime Song Jeopardy

Aplikasi kuis tebak lagu anime dan musik interaktif berbasis web dengan format permainan ala **Jeopardy**, dirancang khusus untuk panggung acara anime festival, kuis komunitas, dan hiburan panggung berkelas.

Aplikasi ini dibangun menggunakan arsitektur modern berbasis **Vite + React 19 + TypeScript + Zustand** dengan bahasa desain **"Cozy Pastel Pop"** yang imut, manis, berimbang visual, dan bebas clutter.

---

## Maskot Resmi Anikarta

Aplikasi ini terintegrasi secara penuh dengan maskot resmi Anikarta (`public/mascot.webp`) sebagai pemandu visual novel interaktif di sepanjang alur permainan:

- **Peran & Karakter Interaktif**:
  - **Pemandu Sesi Tebak Lagu**: Mendampingi peserta dan host dengan dialog visual novel bersuara hangat saat lagu sedang diputar.
  - **Penyambut Persiapan Tim**: Menyapa operator pada dialog awal konfigurasi panggung.
  - **Penghormatan Podium Juara**: Memberikan ucapan selamat kepada para pemenang di akhir permainan.
  - **Identitas Navbar**: Avatar maskot hadir di sudut kiri atas bilah navigasi dengan mikro-animasi sentuh responsif.
- **Varian Komponen Maskot (`Mascot.tsx`)**:
  - `companion`: Format penuh dengan balon percakapan visual novel berlatar belakang lembut.
  - `avatar`: Format bundar kompak untuk header dan navigasi panggung.
  - `podium`: Format selebrasi pemenang pada modal hasil akhir.
  - `compact`: Format mini untuk dialog ringkas tanpa mengganggu area jawaban.
- **Kustomisasi Penuh dari Panel Admin**:
  - Kehadiran maskot di setiap area (Navbar, Modal Soal, Layar Proyektor Panggung, dan Formulir Setup) dapat diaktifkan atau dinonaktifkan secara independen sesuai kebutuhan acara.

---

## Fitur Utama

- **Bahasa Desain Cozy Pastel Pop & Bebas Clutter**:
  - Palet warna lembut 5 Tingkatan Permen: Strawberry Milk (100), Peach Sorbet (200), Honey Butter (300), Matcha Chiffon (400), dan Ramune Soda (500).
  - Kontur lembut *Pillowy Soft* tanpa garis hitam tebal kaku.
  - Papan skor mengambang (*Floating Marshmallow Dock*) yang lapang di bagian bawah layar.
- **Peringkat Berbasis Angka Murni**:
  - Menggantikan metafora trofi dan medali dengan lencana angka murni (1, 2, 3...) bergaya pastel pop yang objektif dan mudah dibaca dari kejauhan.
- **Arsitektur Komponen Modular (`src/components/ui/`)**:
  - Komponen tombol terstandarisasi (`Button.tsx`) dengan kunci warna kontras tinggi pada seluruh state (normal, hover, active, disabled).
  - Lencana peringkat modular (`RankBadge.tsx`).
  - Sistem skala spacing harmonis (4px/8px) yang konsisten di seluruh halaman dan modal.
- **Sistem Efek Suara Web Audio API (Synthesizer Tanpa Latensi)**:
  - Menghasilkan nada secara prosedural tanpa ketergantungan file MP3 eksternal.
  - **Dinonaktifkan secara bawaan (*Mute by default*)** agar tidak memicu suara mendadak di panggung sebelum operator siap.
  - Pilihan 3 profil suara: *Arcade Synth* (8-bit ceria), *Classic Gameshow* (bel meja TV), dan *Minimal Acoustic* (marimba lembut).
- **Alur Modal Soal 2 Fase (Progressive Disclosure)**:
  - **Fase 1 (Mendengarkan)**: Pemutar cuplikan audio, timer telur imut, dialog maskot pendamping, dan tombol "Buka Jawaban Lagu".
  - **Fase 2 (Penilaian)**: Judul lagu, artis, dan catatan trivia terungkap dalam panel hijau matcha, disertai tombol pemberian poin ke tim yang berhasil menjawab.
- **Dukungan Layar Ganda Proyektor Panggung (Stage View)**:
  - Tampilan khusus proyektor panggung (`?view=stage` atau tab **Stage**) yang bersih dari tombol host dan jawaban lagu.
  - Sinkronisasi instan antar-jendela browser secara realtime menggunakan `BroadcastChannel API`.
- **Panel Manajemen Admin Terpadu**:
  - Manajemen penuh Kategori Soal, Babak Tie-Breaker, dan Kuis Penonton.
  - Pengaturan volume SFX, pemilihan profil suara, dan pengaturan sakelar visibilitas maskot.
  - Cadangan data lengkap dengan fitur Ekspor dan Impor berkas JSON.

---

## Teknologi yang Digunakan

- **Runtime & Build Tool**: Node.js & Vite 8
- **Framework & Bahasa**: React 19 & TypeScript
- **State Management & Sinkronisasi**: Zustand + BroadcastChannel API
- **Ikonografi Fungsional**: Lucide React
- **Efek Selebrasi**: Canvas Confetti
- **Audio Engine**: Native Web Audio API & HTML5 Audio Element Controller
- **Styling**: Vanilla CSS3 dengan CSS Spacing & Color Design Tokens

---

## Cara Menjalankan Aplikasi

### 1. Instalasi Dependensi
```bash
npm install
```

### 2. Menjalankan Server Pengembangan Lokal
```bash
npm run dev
```
Akses aplikasi melalui peramban di `http://localhost:5173`.

### 3. Membangun Paket Produksi
```bash
npm run build
```
Hasil kompilasi siap dipublikasikan di folder `dist/`.

---

## Panduan Penggunaan Layar Panggung (Dual-Screen Setup)

1. **Layar Host / Laptop Operator**:
   - Buka `http://localhost:5173/` di browser utama.
   - Konfigurasikan nama dan warna tim pada modal persiapan awal.
   - Gunakan tab **Host** untuk memantau kunci jawaban, mengontrol durasi timer, dan mencatat perolehan poin.
2. **Layar Proyektor Peserta (Stage Display)**:
   - Klik tombol **Buka Layar Panggung di Tab Baru** pada bilah navigasi kanan atas, atau akses langsung `http://localhost:5173/?view=stage`.
   - Geser jendela tersebut ke layar proyektor eksternal dan aktifkan mode layar penuh (tombol `F11`).
   - Layar proyektor akan memperbarui status kartu, skor, dan timer secara otomatis tanpa membocorkan jawaban.

---

## Struktur Direktori Proyek

```
anikarta-jeopardy/
├── public/                    # Aset statis (mascot.webp, audio sample)
├── src/
│   ├── components/
│   │   ├── board/             # BoardGrid & Category Headers
│   │   ├── common/            # Navbar, Mascot (Mascot.tsx)
│   │   ├── modals/            # SetupModal, HostQuestionModal, LeaderboardModal, TiebreakerModal
│   │   ├── scoreboard/        # Floating Scoreboard Dock
│   │   └── ui/                # Button, RankBadge (Komponen UI Modular)
│   ├── data/                  # Data bawaan kuis (defaultData.ts)
│   ├── lib/                   # Sound Engine Web Audio API
│   ├── store/                 # Zustand store & sinkronisasi multi-screen
│   ├── types/                 # Definisi tipe TypeScript
│   ├── views/                 # StageView, HostView, AudienceQuizView, AdminView
│   ├── App.tsx                # Komponen root & perutean tampilan
│   ├── index.css              # Sistem desain Cozy Pastel Pop & Spacing Tokens
│   └── main.tsx               # Titik masuk React
├── package.json
├── tsconfig.json
└── vite.config.ts
```
