# Undangan Digital — Ubay & Nindi

Undangan pernikahan digital lightweight dengan **Next.js (App Router) + TypeScript + Tailwind CSS**.

Tema: *Islamic elegant* — soft sage green, cream, gold accent. Dioptimalkan agar ringan di HP jadul.

## Fitur

- Cover dengan nama tamu dinamis (`?to=Nama+Tamu`)
- Tombol **Buka Undangan** + musik latar
- Countdown ke akad + simpan ke Google Calendar
- Profil mempelai (Ubay & Nindi)
- Detail Akad & Resepsi + Google Maps
- Love story timeline
- Amplop digital (salin no. rekening)
- Ucapan & doa + konfirmasi kehadiran (tersimpan di `localStorage`)
- Closing

## Mulai

```bash
npm install
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000) atau coba:

```
http://localhost:3000/?to=Bapak+Andi+dan+Keluarga
```

## Konfigurasi utama

Semua data undangan ada di:

```
src/config/wedding.ts
```

Edit di sana:

- Nama mempelai & orang tua
- Jadwal akad/resepsi & maps
- Love story
- Rekening amplop digital
- Teks intro / closing
- Path musik

Tipe data: `src/types/wedding.ts`

## Musik

Letakkan file audio di:

```
public/music/bgm.mp3
```

Disarankan file MP3 kecil (≤ 1–2 MB).

## Struktur

```
src/
  app/                 # App Router (layout, page, styles)
  components/
    invitation/        # Section undangan
    ui/                # Button, Section, Ornament
  config/wedding.ts    # Single source of truth
  hooks/               # countdown, guest name, audio
  lib/utils.ts
  types/wedding.ts
public/music/          # BGM
```

## Catatan performa

- Hanya 2 Google Fonts (`Cormorant Garamond` + `Source Sans 3`)
- Animasi CSS ringan (tanpa Lottie / video background)
- Ornamen SVG inline
- Tidak ada dependency UI berat

## Deploy

```bash
npm run build
npm start
```

Atau deploy ke Vercel. Setelah live, ganti `meta.siteUrl` di `wedding.ts`.

## TODO data

- [ ] Isi nomor rekening asli di `gifts.accounts`
- [ ] Lengkapi `mapsUrl` untuk akad (opsional)
- [ ] Ganti teks love story dengan kisah asli
- [ ] Tambah `public/music/bgm.mp3`
