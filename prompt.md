# Prompt: Restyle ke JRPG / Visual Novel — Summer Love Music Quiz

## Konteks
Implementasi sebelumnya (dari prompt refactor & fitur) sudah jalan secara fungsional, tapi styling yang dihasilkan mengarah ke **neo-brutalism** — ini bukan arah yang saya mau. Prompt ini khusus untuk mengoreksi arah visual saja, tanpa mengubah logika/fitur yang sudah berjalan.

Sebelum menulis kode apa pun, ikuti alur kerja bertahap berikut, dan **jangan lanjut ke tahap berikutnya sebelum saya menyetujui tahap sebelumnya**:

1. **Audit** — telusuri seluruh styling yang ada saat ini (`style.css` dan CSS inline/tambahan lain yang mungkin ditulis di iterasi sebelumnya), identifikasi secara spesifik elemen mana saja yang membentuk kesan neo-brutalism (border, shadow, tipografi, warna) dan di file/selector mana letaknya.
2. **Deep dive** — untuk setiap elemen UI utama (papan kategori, host modal/dialogue box, scoreboard, leaderboard, setup modal, theme editor admin), jelaskan pendekatan restyle konkret ke arah JRPG/Visual Novel, dan bagaimana cara memastikan sistem theme (warna/font dari admin panel) tetap kompatibel dengan gaya baru ini.
3. **Implementation plan** — rencana perubahan CSS/struktur (termasuk apakah perlu markup tambahan untuk elemen dekoratif seperti frame/corner-clip), urutan pengerjaan per komponen.
4. **Execution** — baru menulis kode setelah rencana di atas saya setujui.

Seluruh dokumen di tahap Audit, Deep Dive, dan Implementation Plan ditulis dalam **Bahasa Indonesia**.

---

## Yang Harus Dihapus/Dihindari: Neo-Brutalism
Hapus/hindari ciri-ciri berikut di seluruh aplikasi:
- Border hitam tebal (2–4px solid black) di sekeliling hampir semua elemen (card, tombol, modal, dll).
- Drop shadow keras/offset tanpa blur, seperti `box-shadow: 4px 4px 0px #000`.
- Warna flat, saturated, kontras kasar tanpa gradasi/nuansa.
- Tipografi mono/grotesque yang sengaja terlihat "kasar" atau "unstyled".
- Layout yang sengaja terlihat mentah/asal sebagai gaya.

---

## Arah Visual Baru: JRPG / Visual Novel

### Elemen UI yang perlu direstyle
- **Host modal / area reveal jawaban → dialogue box**: ganti jadi panel bergaya text box dialog visual novel — frame berlapis (border ganda tipis, bukan satu garis tebal solid), sudut dipotong (corner-clip) atau ornamen kecil di pojok, semi-transparan/blur ringan di atas background, bukan modal putih polos dengan border tebal.
- **Nama tim (di scoreboard, host modal, leaderboard) → name plate**: elemen kecil berbingkai/bertekstur untuk menampilkan nama tim, mirip name tag karakter di VN, bukan sekadar teks/chip flat.
- **Scoreboard & leaderboard → HUD panel**: didesain seperti panel status/HP bar di JRPG, dengan frame dekoratif dan hierarki visual yang jelas antara tim teratas dan lainnya — bukan card generik yang cuma dibedakan urutan.
- **Papan kategori/grid poin**: pertimbangkan treatment seperti menu/command list ala JRPG (misalnya frame kotak dengan aksen sudut) untuk tiap sel, alih-alih grid kotak polos.
- **Setup modal & theme editor admin**: tetap fungsional dan jelas untuk dipakai (prioritaskan usability di sini), tapi framing visualnya (border, panel) mengikuti bahasa desain yang sama supaya konsisten dengan tampilan utama game.

### Tipografi
Cari pasangan font yang lebih spesifik ke nuansa judul game/anime — font display yang punya karakter tebal/dramatis tapi tetap terbaca untuk heading & judul kategori, dipasangkan dengan font body yang bersih dan nyaman dibaca untuk teks dialog/deskripsi panjang. Jelaskan opsi yang dipertimbangkan dan alasan pemilihan akhirnya di tahap Deep Dive.

### Warna
Base palette tetap **teal, pink, dan hitam** (sejalan dengan brief sebelumnya dan default theme di admin panel), tapi diterapkan dengan sensibilitas VN/JRPG — misalnya gradasi halus untuk memberi kedalaman pada panel/frame, bukan warna flat rata seperti neo-brutalism. Gradient/aksen dekoratif boleh dipakai selama jadi elemen signature yang disengaja (bukan wash tempelan di background setiap card).

### Motion
Kalau ada animasi, ambil inspirasi dari transisi visual novel: dialogue box yang "muncul"/slide dari tepi layar, teks yang muncul bertahap ala typewriter saat jawaban dibuka. Pakai di momen penting saja (reveal jawaban, munculnya leaderboard akhir), jangan ditaburkan di semua elemen sebagai hover/entrance effect generik.

---

## Batasan
- Jangan mengubah logika/fungsi yang sudah berjalan (scoring, tie-breaker, autoplay webm/audio, dsb.) — murni restyle visual.
- Sistem theme di admin panel (poin modularitas dari prompt sebelumnya) harus tetap berfungsi: warna/font/logo tetap bisa diganti dari admin tanpa sentuh kode, hanya saja sekarang harus cocok dengan bahasa desain JRPG/VN, bukan neo-brutalism.
- Sertakan referensi konkret (nama game/genre visual novel/JRPG yang jadi acuan gaya) di tahap Deep Dive, supaya arah desainnya jelas dan bisa saya cek sebelum lanjut ke implementasi.