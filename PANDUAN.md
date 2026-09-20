# Panduan penggunaan — Undangan Ubay & Nindi

Dokumen ini untuk **mempelai dan keluarga** yang akan membagikan undangan. Tidak perlu memahami kode.

Satu website, **dua undangan**: pihak wanita dan pihak pria berbeda hari dan lokasi.

Deploy di **VPS sendiri lewat Coolify** (bukan Vercel). Langkah server: [DEPLOY.md](./DEPLOY.md).

Di bawah, ganti `https://DOMAIN-KAMU` dengan domain yang kamu pasang di Coolify.

---

## 1. Ringkasan cepat

| | Pihak wanita | Pihak pria |
|---|---|---|
| **Link master** | `https://DOMAIN-KAMU/?side=wanita` | `https://DOMAIN-KAMU/?side=pria` |
| **Hari** | Sabtu, 10 Oktober 2026 | Minggu, 11 Oktober 2026 |
| **Acara** | Akad 07:00 · Resepsi 12:00 | Resepsi 12:00 |
| **Tempat** | Kediaman mempelai wanita, Mojodadi, Kemlagi | Kediaman mempelai pria, Bicak, Trowulan |

Tanpa `?side=` di URL, undangan default ke **pihak wanita**.

Tamu membuka cover → **Buka Undangan** → musik, jadwal, peta, amplop, dan ucapan.

---

## 2. Tiga cara membuat link

Prioritas jika beberapa parameter dipakai bersamaan: **kode (`c`) menang**, lalu nama (`to`), lalu sisi (`side`).

### A. Link master (paling sederhana)

Bagikan satu link ke seluruh tamu satu sisi.

```
https://DOMAIN-KAMU/?side=wanita
https://DOMAIN-KAMU/?side=pria
```

Nama di cover: **Tamu Undangan**. Cukup untuk grup WhatsApp besar.

### B. Nama di URL (tanpa admin)

Untuk sapaan personal, tanpa daftar tamu.

```
https://DOMAIN-KAMU/?side=wanita&to=Bapak+Andi+dan+Keluarga
https://DOMAIN-KAMU/?side=pria&to=Keluarga+Besar+Khoirin
```

Aturan `to=`:

- Ganti spasi dengan `+` atau `%20`
- Jangan pakai karakter aneh (`&`, `#`) di nama; tulis “dan” biasa
- Tamu **bisa** mengubah nama di URL. Tidak apa-apa untuk undangan biasa

Contoh:

| Nama tampilan | Potongan URL |
|---|---|
| Ibu Suminah | `to=Ibu+Suminah` |
| Bapak Edi & Keluarga | `to=Bapak+Edi+dan+Keluarga` |
| Keluarga Besar | `to=Keluarga+Besar` |

### C. Shortcode (nama + sisi terkunci)

Format: `https://DOMAIN-KAMU/?c=8497`

- Nama dan sisi diambil dari `data/guests.json`
- Tamu tidak bisa ganti ke acara sisi lain lewat URL
- Kode lama 4 digit tetap valid; kode baru dari admin 6 digit

Contoh yang sudah ada:

| Kode | Nama | Sisi | Link |
|---|---|---|---|
| `8497` | umar | wanita | `/?c=8497` |
| `2489` | nazar | pria | `/?c=2489` |

Pilih **A** jika ingin cepat. Pilih **B** jika ingin nama di cover. Pilih **C** jika daftar tamu panjang dan sisi tidak boleh tertukar.

---

## 3. Cara bagikan ke tamu

### Langkah keluarga wanita

1. Pakai link `?side=wanita` (atau shortcode sisi wanita).
2. Kirim via WhatsApp ke tamu pihak mempelai wanita.
3. Preview WhatsApp menampilkan judul, tanggal **10 Oktober**, dan nama jika pakai `c=` atau `to=`.
4. Minta tamu buka di HP, ketuk **Buka Undangan**.

### Langkah keluarga pria

Sama, dengan `?side=pria` atau shortcode sisi pria. Yang tampil: **11 Oktober**, Bicak, resepsi saja (tanpa akad).

### Teks WhatsApp (contoh)

Bisa disalin dari admin (**Salin teks WA**) atau ketik manual:

```
Assalamu’alaikum Warahmatullahi Wabarakatuh

Kepada Yth. *Bapak Andi dan Keluarga*

Tanpa mengurangi rasa hormat, kami mengundang untuk menghadiri:

*Ubay & Nindi*
*Akad & Resepsi*
Sabtu, 10 Oktober 2026
Akad Nikah: 07:00 WIB
Resepsi: 12:00 WIB – selesai
Kediaman Mempelai Wanita

Undangan digital:
https://DOMAIN-KAMU/?side=wanita&to=Bapak+Andi+dan+Keluarga
```

Untuk pihak pria, ganti judul acara, tanggal, lokasi, dan link `?side=pria`.

Di dalam undangan ada tombol **Bagikan** (kiri bawah) — WhatsApp, salin tautan, atau share native HP.

---

## 4. Generator admin (`/admin`)

Alamat lokal: [http://localhost:3000/admin](http://localhost:3000/admin)

Alamat live: `https://DOMAIN-KAMU/admin`

Di Coolify, pasang **Persistent Storage** ke `/app/data` (lihat [DEPLOY.md](./DEPLOY.md)). Setelah itu, tamu yang dibuat di `/admin` **langsung tersimpan** di VPS, tidak hilang saat redeploy.

### Password

| Lingkungan | Password |
|---|---|
| `npm run dev` di laptop | `ubay2026` jika `ADMIN_PASSWORD` belum di-set |
| Production (Coolify) | Wajib env `ADMIN_PASSWORD` |

Jangan bagikan password admin ke tamu.

### Membuat undangan

1. Buka `/admin` (lokal atau domain live) → masuk.
2. Isi **Nama tamu**.
3. Pilih **Pihak Wanita** atau **Pihak Pria** — ini yang menentukan tanggal & lokasi.
4. Shortcode opsional (4–8 angka). Kosongkan agar otomatis 6 digit.
5. **Buat shortcode & salin link**.
6. **Salin teks WA** untuk paste ke chat.
7. Filter **Wanita / Pria** untuk cek daftar.
8. **Unduh JSON** sebagai cadangan.

Tanpa volume `/app/data`, data tamu hanya ada di dalam container dan hilang saat deploy ulang.

### Menghapus tamu

Tombol **Hapus** di daftar. Dengan volume Coolify, penghapusan langsung permanen di server.

---

## 5. Yang dilihat tamu

Urutan setelah **Buka Undangan**:

1. Hero + countdown ke acara sisi itu (jam **WIB**)
2. Ayat
3. Mempelai
4. Save the date + simpan Google Calendar
5. Rangkaian acara (hanya sisi undangan itu)
6. Love story
7. Peta + salin alamat + Google Maps + Waze
8. Amplop digital (rekening; nomor sementara boleh 0000000000 dulu)
9. Ucapan & konfirmasi kehadiran
10. Penutup

Navigasi: dock bawah di HP, titik di kiri di desktop. Musik bisa dimatikan (kanan bawah).

---

## 6. Ucapan & RSVP — penting

Form **Ucapan & Doa** tersimpan di **HP tamu itu sendiri** (`localStorage`), bukan di server.

Akibatnya:

- Mempelai **tidak** melihat daftar hadir terpusat
- Angka “hadir” hanya di perangkat pengirim
- Jangan dipakai untuk hitungan kursi / katering

Konfirmasi kehadiran yang bisa dihitung: WhatsApp ke mempelai, atau Google Form (bisa ditautkan nanti di catatan tamu).

---

## 7. Mengisi data undangan

Semua teks, jadwal, rekening, dan maps ada di satu file:

```
src/config/wedding.ts
```

Yang biasa diubah:

| Bagian | Isi |
|---|---|
| `meta.siteUrl` | Cadangan URL publik (lebih baik set env `SITE_URL` di Coolify) |
| `couple` | Nama lengkap, sapaan, orang tua |
| `events` | Tanggal, jam, alamat, `mapsUrl`, `lat` / `lng` |
| `loveStory` | Kisah (boleh menyusul) |
| `gifts.accounts` | Nomor rekening asli (sekarang placeholder) |
| `verse` / `intro` / `closing` | Teks |
| `audio.src` | Path musik |
| `dressCode.enabled` / `notes.enabled` | `true` jika ingin menampilkan |

Musik: taruh file di `public/music/bgm.mp3` (disarankan ≤ 1–2 MB).

Gambar cover/hero: `public/ornaments/cover-bg.jpg` dan `hero-bg.jpg`.

Setelah edit, jalankan `npm run dev` untuk cek, lalu deploy.

---

## 8. Cek sebelum dibagikan ke tamu

- [ ] Buka `/?side=wanita` — tanggal 10 Okt, Mojodadi, akad + resepsi
- [ ] Buka `/?side=pria` — tanggal 11 Okt, Bicak, resepsi saja
- [ ] Buka satu `/?c=…` — nama benar, sisi tidak tertukar
- [ ] Buka `/?side=pria&to=Nama+Uji` — nama di cover
- [ ] Kode salah (`/?c=1111`) — tetap bisa dibuka sebagai Tamu Undangan
- [ ] **Simpan Tanggal** membuka Google Calendar di hari yang benar
- [ ] Peta / Maps / Waze mengarah ke lokasi sisi itu
- [ ] Nomor rekening sudah asli (atau jangan bagikan amplop dulu)
- [ ] Preview WhatsApp (kirim ke chat sendiri) menampilkan kartu undangan
- [ ] Domain Coolify + `SITE_URL` sama dengan link yang dibagikan
- [ ] Production: `ADMIN_PASSWORD` sudah di-set di Coolify
- [ ] Volume `/app/data` terpasang (jika pakai shortcode admin)

---

## 9. Menjalankan di komputer

```bash
npm install
npm run dev
```

| Halaman | Alamat |
|---|---|
| Undangan | http://localhost:3000 |
| Wanita | http://localhost:3000/?side=wanita |
| Pria | http://localhost:3000/?side=pria |
| Shortcode | http://localhost:3000/?c=8497 |
| Admin | http://localhost:3000/admin |

Build produksi lokal:

```bash
npm run build
npm start
```

Deploy ke VPS: **Coolify + Dockerfile** — langkah lengkap di [DEPLOY.md](./DEPLOY.md). Env wajib: `ADMIN_PASSWORD`, `SITE_URL`. Volume: `/app/data`.

---

## 10. Pertanyaan umum

**Tamu pihak pria melihat akad 10 Oktober?**  
Link-nya `?side=wanita` atau tanpa `side`. Kirim ulang `?side=pria` atau shortcode sisi pria.

**Nama di cover salah?**  
Untuk `?to=`, buat link baru. Untuk `?c=`, ubah/hapus di `/admin` (live, jika volume terpasang) atau edit `data/guests.json`.

**Bisa satu orang diundang ke kedua hari?**  
Ya. Kirim **dua link** (wanita dan pria), atau buat dua shortcode. Satu link hanya menampilkan satu sisi.

**Perlu admin?**  
Tidak, jika cukup dua link master atau `?to=`. Admin berguna jika tamu banyak dan sisi harus terkunci.

**Kenapa tamu baru dari `/admin` di situs live hilang?**  
Volume Coolify `/app/data` belum dipasang. Ikuti [DEPLOY.md](./DEPLOY.md) bagian Persistent Storage.

**Musik tidak bunyi?**  
Browser memblokir autoplay. Tamu ketuk **Buka Undangan** dulu; jika masih diam, tombol musik kanan bawah.

---

## 11. File terkait

| File | Kegunaan |
|---|---|
| `src/config/wedding.ts` | Semua konten undangan |
| `data/guests.json` | Seed daftar shortcode (disalin ke volume saat first boot) |
| `public/music/bgm.mp3` | Musik latar |
| `public/ornaments/` | Gambar cover & hero |
| `Dockerfile` | Image production untuk Coolify |
| `DEPLOY.md` | Langkah deploy VPS + Coolify |
| `.env.example` | `ADMIN_PASSWORD`, `SITE_URL` |
| `README.md` | Ringkasan teknis proyek |
