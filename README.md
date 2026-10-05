# Undangan Digital — Ubay & Nindi

Undangan pernikahan personal berbasis Next.js App Router, TypeScript, Tailwind CSS, dan PostgreSQL. Identitas visual botanical-gold dipertahankan, sementara halaman dibuat static-first, mobile-first, ringan, dan tetap berguna saat fitur opsional gagal.

Panduan keluarga: [PANDUAN.md](./PANDUAN.md) · Deployment Coolify: [DEPLOY.md](./DEPLOY.md)

## Fitur utama

- Dua sisi acara: `?side=wanita` dan `?side=pria`.
- Link personal langsung: `?side=...&to=Nama%20Tamu`; tidak ada short code.
- `/admin` publik tanpa auth, hanya membuat link undangan dan teks WhatsApp.
- RSVP dan ucapan tersimpan terpusat di PostgreSQL, langsung terlihat semua pengunjung.
- Guestbook memiliki validasi, idempotency retry, rate limit berbasis database, pagination cursor, dan graceful error state.
- Audio hanya dimulai setelah interaksi tamu; peta dan guestbook ditunda sampai dibutuhkan.

## Mulai lokal

Prasyarat: Node.js 20+, Docker Desktop, dan npm.

```bash
npm ci
docker compose up -d db
Copy-Item .env.example .env.local
# Isi DATABASE_URL, APP_ORIGIN, dan RATE_LIMIT_HMAC_SECRET di .env.local
npm run db:migrate
npm run dev
```

Buka `http://localhost:3000` dan generator di `http://localhost:3000/admin`.

Kontrak environment:

| Variable | Wajib | Kegunaan |
|---|---:|---|
| `APP_ORIGIN` | Ya | Origin yang diizinkan untuk POST guestbook, tanpa slash akhir |
| `DATABASE_URL` | Ya | Connection string PostgreSQL |
| `RATE_LIMIT_HMAC_SECRET` | Ya | Secret minimal 32 karakter untuk key rate limit harian |
| `TRUSTED_PROXY_HEADER` | Tidak | Header client address dari proxy yang sudah diverifikasi |
| `TRUSTED_PROXY_VERIFIED` | Tidak | Set `true` hanya setelah uji spoofing Coolify lulus |
| `SITE_URL` | Tidak | Fallback metadata dan link generator |

## Command surface

| Command | Fungsi |
|---|---|
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm run test` | Unit tests |
| `npm run test:integration` | Integration suite yang memakai test database eksplisit |
| `npm run test:e2e` | Browser smoke tests |
| `npm run build` | Production build standalone |
| `npm run start` | Menjalankan `node server.js` dari standalone build |
| `npm run db:migrate` | Apply migration dan no-op check |
| `npm run db:status` | Status migration |
| `npm run guestbook:list` | List entry dari owner shell |
| `npm run guestbook:export` | Export timestamped JSON |
| `npm run guestbook:delete -- <uuid>` | Preview entry; hapus hanya dengan `--confirm <uuid>` |
| `npm run guestbook:cleanup` | Hapus bucket rate-limit yang sudah kedaluwarsa |

## Data undangan

Konten ada di [`src/config/wedding.ts`](./src/config/wedding.ts): nama pasangan, acara, lokasi, rekening, teks, dan path musik. Musik aktif berada di `public/music/wedding-bgm.mp3` dan tetap `preload="none"`.

## PostgreSQL guestbook

Migration ada di `migrations/`. API publik:

- `GET /api/guestbook?limit=20&cursor=...`
- `POST /api/guestbook` dengan JSON dan header `Idempotency-Key` UUID.
- `GET /api/health` hanya memeriksa proses Node.
- `GET /api/ready` memeriksa PostgreSQL dan versi migration.

Guestbook membatasi body request 4 KiB, menolak origin yang tidak sesuai, tidak menyimpan raw IP, dan tidak menulis nama/ucapan ke log. Detail operasional ada di [DEPLOY.md](./DEPLOY.md).

## Quality gates

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

Sebelum production, jalankan migration pada database disposable, cek `/api/health` dan `/api/ready`, uji dua browser, restart container, backup/restore, dan rollback image sesuai [DEPLOY.md](./DEPLOY.md).
