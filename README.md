# Undangan Digital — Ubay & Nindi

**Panduan pemakaian (bagikan link, dua sisi, admin, cek sebelum kirim):** [PANDUAN.md](./PANDUAN.md)

Undangan pernikahan digital lightweight dengan **Next.js (App Router) + TypeScript + Tailwind CSS**.

Tema: *Islamic elegant* — cream, emerald, aksen emas. Satu website, **dua sisi undangan** (pihak wanita / pihak pria).

## Dua sisi

| | Pihak wanita | Pihak pria |
|---|---|---|
| Link | `/?side=wanita` | `/?side=pria` |
| Tanggal | Sabtu, 10 Oktober 2026 | Minggu, 11 Oktober 2026 |
| Acara | Akad 07:00 + Resepsi 12:00 | Resepsi 12:00 |
| Lokasi | Kediaman mempelai wanita, Mojodadi | Kediaman mempelai pria, Bicak |

Tanpa `?side=`, default **wanita**.

## Link tamu

Tiga pola, prioritas dari kiri:

1. **Shortcode** `/?c=2489` — nama + sisi dari `data/guests.json` (tidak bisa diganti di URL)
2. **Nama ringan** `/?side=pria&to=Bapak+Andi` — personalisasi tanpa database
3. **Master** `/?side=wanita` atau `/?side=pria` — “Tamu Undangan”

Contoh data yang sudah ada:

```
/?c=8497   → umar, sisi wanita
/?c=2489   → nazar, sisi pria
```

## Mulai

```bash
npm install
npm run dev
```

- Undangan: [http://localhost:3000](http://localhost:3000)
- Admin generator: [http://localhost:3000/admin](http://localhost:3000/admin) (password lokal `ubay2026` jika `ADMIN_PASSWORD` belum di-set)

## Konfigurasi

Semua data undangan: `src/config/wedding.ts`

- Nama mempelai & orang tua
- Jadwal / lokasi / maps per sisi
- Love story, rekening, teks intro/closing, path musik

Nomor rekening, love story final, dan pin maps wanita bisa diisi belakangan.

## Admin

`/admin` membuat shortcode (6 digit baru; kode 4 digit lama tetap valid) dan teks WhatsApp.

Di **Coolify / VPS**, pasang volume ke `/app/data` agar tamu dari `/admin` persist. Lihat [DEPLOY.md](./DEPLOY.md).

Production: set `ADMIN_PASSWORD` dan `SITE_URL` di environment Coolify. Jangan andalkan default lokal.

## RSVP / ucapan

Form ucapan tersimpan di `localStorage` perangkat tamu — bukan daftar kehadiran terpusat. Untuk hitungan tamu nyata, pakai WhatsApp atau Google Form (menyusul).

## Musik

```
public/music/bgm.mp3
```

Disarankan MP3 kecil (≤ 1–2 MB).

## Deploy (Coolify / VPS)

Tidak memakai Vercel. Ikuti **[DEPLOY.md](./DEPLOY.md)**:

- Build Pack **Dockerfile**, port **3000**
- Env: `ADMIN_PASSWORD`, `SITE_URL`
- Persistent storage: `/app/data`

Lokal: `npm run build && npm start`, atau `docker compose up`.

## TODO data

- [ ] Isi nomor rekening asli di `gifts.accounts`
- [ ] Lengkapi `mapsUrl` akad (opsional, pin pasti)
- [ ] Ganti teks love story dengan kisah asli
- [ ] Set `ADMIN_PASSWORD` + `SITE_URL=https://ubaynindi.love` di Coolify
- [ ] Pasang volume `/app/data`
