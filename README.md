# Anikarta Jeopardy

Aplikasi permainan kuis tebak lagu dan musik interaktif berbasis web dengan format permainan ala Jeopardy. Aplikasi ini dirancang untuk kebutuhan panggung acara (stage event), kuis komunitas, dan hiburan interaktif dengan pemandu acara (host). Dilengkapi antarmuka modular, visual bergaya JRPG / Visual Novel, pemutar media terintegrasi, papan skor langsung, serta panel administrasi penuh untuk pengelolaan konten soal dan kustomisasi tema.

---

## Daftar Isi

1. [Ringkasan Sistem](#ringkasan-sistem)
2. [Fitur Utama](#fitur-utama)
3. [Struktur Direktori](#struktur-direktori)
4. [Teknologi yang Digunakan](#teknologi-yang-digunakan)
5. [Instalasi dan Cara Menjalankan](#instalasi-dan-cara-menjalankan)
6. [Panduan Penggunaan](#panduan-penggunaan)
   - [Setup dan Papan Utama (index.html)](#setup-dan-papan-utama-indexhtml)
   - [Kuis Penonton (audience.html)](#kuis-penonton-audiencehtml)
   - [Panel Administrasi (admin.html)](#panel-administrasi-adminhtml)
7. [Struktur Data dan Penyimpanan](#struktur-data-dan-penyimpanan)
8. [Aset Media](#aset-media)

---

## Ringkasan Sistem

Sistem Anikarta Jeopardy terdiri dari tiga antarmuka web utama:

- **Halaman Permainan Utama (`index.html`)**: Papan permainan bergaya Jeopardy berisikan kategori dan kartu poin, panel interaksi pemandu acara (Host Modal) untuk memutar cuplikan audio/video dan membuka jawaban, serta papan skor live yang mengurutkan tim secara dinamis.
- **Halaman Kuis Penonton (`audience.html`)**: Antarmuka terpisah berisikan 20 nomor kuis interaktif yang ditujukan khusus untuk sesi permainan bersama audiens.
- **Halaman Administrasi (`admin.html`)**: Dasbor manajemen konten (CRUD) untuk menambah, mengubah, dan menghapus kategori, soal, babak tiebreaker, serta kuis penonton tanpa perlu menyentuh kode program. Mendukung pula kustomisasi branding (nama acara, logo, warna aksen, warna kategori, dan tipografi).

---

## Fitur Utama

- **Papan Jeopardy Dinamis**: Menampilkan grid kategori dan nilai poin yang dapat disesuaikan. Kartu otomatis terkunci dan berubah status setelah dimainkan.
- **Manajemen Tim Fleksibel**: Mendukung konfigurasi 2 hingga 6 tim dengan penamaan dan palet warna unik untuk setiap tim.
- **Panel Pemandu Acara (Host Control)**: Modal kontrol yang mencakup pemutar audio/video kustom, tombol buka jawaban (reveal), serta tombol distribusi poin langsung ke tim yang menjawab benar.
- **Papan Skor Langsung (Live Scoreboard)**: Papan peringkat dinamis yang otomatis mengurutkan posisi tim berdasarkan perolehan skor terkini menggunakan animasi transisi posisi (GSAP Flip).
- **Babak Penentuan (Tiebreaker)**: Modul soal khusus untuk menyelesaikan situasi skor imbang antar tim sebelum pengumuman pemenang.
- **Podium & Leaderboard Akhir**: Tampilan rekap peringkat akhir dengan animasi podium saat semua soal pada papan telah selesai dimainkan.
- **Kuis Penonton Terpisah**: Papan kuis mandiri dengan penomoran 1 hingga 20 untuk interaksi penonton tanpa memengaruhi skor tim utama.
- **Panel Tema dan Branding Terpusat**: Pengaturan judul kuis, logo acara, palet warna antarmuka, warna spesifik kartu per poin, dan pemilihan font (Google Fonts / lokal).
- **Persistensi Data Ganda**: Menggunakan `localStorage` browser untuk menyimpan progres dan konfigurasi secara langsung, serta mendukung ekspor dan impor berkas konfigurasi `data.js`.

---

## Struktur Direktori

```
anikarta-jeopardy/
|-- index.html                 # Halaman utama permainan Jeopardy
|-- audience.html              # Halaman kuis penonton
|-- admin.html                 # Panel administrasi dan kustomisasi
|-- data.js                    # Data awal dan fallback permainan
|-- cara-kerja.md              # Dokumentasi alur kerja dan fungsi teknis
|-- audio/                     # Direktori penyimpanan berkas suara (.mp3, dsb.)
|   `-- .gitkeep
|-- fonts/                     # Direktori berkas font lokal
|   `-- ZillaSlab-Bold.ttf
|-- css/
|   |-- variables.css          # Variabel CSS (token warna, font, dimensi)
|   |-- base.css               # Gaya dasar, reset, dan komponen tombol
|   |-- game.css               # Tata letak papan Jeopardy dan papan skor
|   |-- modals.css             # Desain modal host, setup, tiebreaker, dan podium
|   |-- audience.css           # Gaya antarmuka kuis penonton
|   `-- admin.css              # Gaya antarmuka dasbor admin
`-- js/
    |-- core/
    |   |-- state.js           # State terpusat (tim, soal aktif, konfigurasi)
    |   `-- storage.js         # Abstraksi sinkronisasi LocalStorage & data awal
    |-- game/
    |   |-- board.js           # Rendering grid kategori dan kartu soal
    |   |-- modals.js          # Pengendali alur modal host, setup, dan tiebreaker
    |   |-- scoreboard.js      # Rendering dan animasi papan skor tim
    |   |-- ui.js              # Utilitas antarmuka dan pembaruan badge progres
    |   `-- main.js            # Inisialisasi utama halaman game
    |-- audience/
    |   `-- main.js            # Logika dan interaksi halaman kuis penonton
    `-- admin/
        |-- questions.js       # CRUD kategori, soal, tiebreaker, dan penonton
        |-- theme.js           # Pengaturan branding, palet warna, dan tipografi
        |-- export-import.js   # Mekanisme ekspor dan impor konfigurasi
        `-- main.js            # Inisialisasi utama panel admin
```

---

## Teknologi yang Digunakan

- **HTML5 & CSS3**: Struktur semantik dengan CSS Custom Properties (Variables) untuk sistem tema dinamis.
- **JavaScript (ES6 Modules)**: Logika terstruktur berbasis modul modular tanpa ketergantungan framework eksternal.
- **GreenSock Animation Platform (GSAP)**:
  - GSAP Core untuk animasi mikro pada antarmuka.
  - GSAP Flip Plugin untuk transisi pergeseran posisi tim pada papan skor secara mulus.
- **Web Storage API (LocalStorage)**: Penyimpanan status permainan dan perubahan data di browser klien.

---

## Instalasi dan Cara Menjalankan

Aplikasi ini murni berjalan di sisi klien (client-side) tanpa memerlukan build tool atau instalasi runtime tambahan. Karena menggunakan fitur JavaScript ES Modules (`type="module"`), aplikasi disarankan dijalankan melalui local web server untuk menghindari pembatasan kebijakan CORS protokol `file://`.

### Menggunakan VS Code Live Server
1. Buka folder proyek ini di Visual Studio Code.
2. Pasang ekstensi **Live Server**.
3. Klik kanan pada berkas `index.html` dan pilih **Open with Live Server**.

### Menggunakan Python
Jalankan perintah berikut di terminal pada direktori proyek:

```bash
# Python 3
python -m http.server 8000
```
Buka peramban di `http://localhost:8000`.

### Menggunakan Node.js (npx serve / http-server)
```bash
npx serve .
```

---

## Panduan Penggunaan

### Setup dan Papan Utama (`index.html`)
1. Buka `index.html`. Pada saat pertama kali dibuka, formulir **Persiapan Panggung** akan muncul.
2. Tentukan jumlah tim peserta (2 hingga 6 tim).
3. Masukkan nama masing-masing tim dan pilih warna identitas tim.
4. Klik **Mulai Permainan** untuk merender papan Jeopardy.
5. Host memilih kartu poin berdasarkan kategori yang diinginkan tim.
6. Pada modal host:
   - Tekan tombol putar pada pemutar audio untuk memutar potongan lagu.
   - Tekan tombol **Buka Jawaban** untuk mengungkap judul lagu dan nama artis.
   - Klik tombol nama tim yang berhasil menjawab dengan benar untuk menambahkan poin. Poin akan langsung dihitung dan posisi papan skor diperbarui secara otomatis.
   - Tutup modal untuk menandai kartu soal telah selesai dimainkan.
7. Jika semua soal telah selesai dimainkan, modal peringkat akhir (Leaderboard) akan otomatis terbuka dan menampilkan tim pemenang.

### Kuis Penonton (`audience.html`)
1. Akses `audience.html` melalui tombol navigasi atas atau langsung dari peramban.
2. Terdapat 20 kartu pertanyaan bernomor. Klik kartu yang dipilih penonton.
3. Putar audio atau putar video melalui pemutar media kustom.
4. Buka jawaban untuk memverifikasi tebakan penonton.
5. Tutup modal untuk menandai kartu telah digunakan. Progres akan tercatat pada indikator di bagian navigasi atas.

### Panel Administrasi (`admin.html`)
1. Buka `admin.html`.
2. **Kelola Soal**:
   - Tambah kategori baru dengan menekan tombol **Tambah Kategori**.
   - Tambah atau edit pertanyaan pada tiap kolom kategori. Tentukan nilai poin, judul jawaban, artis, path berkas audio, dan video (opsional).
   - Kelola daftar soal **Babak Tiebreaker** dan **Kuis Penonton** pada tab terkait.
3. **Kustomisasi Tema**:
   - Atur Judul Acara dan URL Logo.
   - Sesuaikan palet warna antarmuka (warna latar, warna kartu per tingkat poin, dan warna pembatas).
   - Tentukan font heading dan font body (mendukung Google Fonts).
   - Simpan pengaturan tema untuk langsung menerapkannya pada seluruh halaman permainan.
4. **Ekspor dan Impor**:
   - Gunakan fitur ekspor untuk mengunduh berkas `data.js` baru jika ingin menjadikan data terkini sebagai fallback permanen di repositori.
   - Gunakan fitur impor JSON untuk memulihkan konfigurasi soal yang pernah disimpan sebelumnya.

---

## Struktur Data dan Penyimpanan

Struktur data default didefinisikan pada berkas `data.js` dengan format objek JavaScript:

```javascript
export const GAME_DATA = [
  {
    category: "Pop 2000s",
    questions: [
      {
        id: "c1p100",
        points: 100,
        audio: "audio/c1_100.mp3",
        title: "Toxic",
        artist: "Britney Spears",
        video: ""
      }
      // ... pertanyaan lainnya
    ]
  }
  // ... kategori lainnya
];
```

Ketika perubahan dilakukan melalui panel Admin, aplikasi menyimpan objek data ke `localStorage` dengan kunci `jeopardyData`. Saat halaman dimuat, sistem akan memprioritaskan data dari `localStorage`. Jika tidak ditemukan, sistem akan memuat data default dari `data.js`.

---

## Aset Media

- **Direktori Berkas Suara (`audio/`)**: Simpan berkas audio lagu pada direktori `audio/` dengan format yang didukung peramban modern (seperti `.mp3`, `.m4a`, atau `.ogg`).
- Berkas aset media berukuran besar dan gambar latar belakang yang bersifat lokal tidak disertakan dalam pelacakan repositori Git (dikecualikan melalui konfigurasi `.gitignore`).
