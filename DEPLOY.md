# Deployment Coolify — Undangan Ubay & Nindi

Deployment memakai Dockerfile standalone Next.js dan PostgreSQL. Tidak ada `DATA_DIR`, `guests.json`, auth admin, atau database file lokal.

## Topologi

```text
Browser -> Coolify web container -> PostgreSQL service
              |-- /api/health  (liveness, tanpa query DB)
              `-- /api/ready   (readiness, SELECT 1 + migration version)
```

Coolify harus mengarahkan traffic berdasarkan `/api/ready`. Liveness tetap hidup saat database sedang diperbaiki agar container tidak masuk restart loop.

## Provisioning

1. Buat PostgreSQL service di Coolify untuk project yang sama.
2. Buat application dari repository ini dengan **Build Pack: Dockerfile**.
3. Exposed port: `3000`.
4. Domain: `https://ubaynindi.love` dengan HTTPS/Let's Encrypt.
5. Set environment variables berikut pada application.

| Variable | Wajib | Contoh |
|---|---:|---|
| `APP_ORIGIN` | Ya | `https://ubaynindi.love` |
| `APP_ALLOWED_ORIGINS` | Jika perlu | `https://www.ubaynindi.love` bila apex dan `www` sama-sama aktif |
| `DATABASE_URL` | Ya | Connection string dari PostgreSQL Coolify |
| `RATE_LIMIT_HMAC_SECRET` | Ya | Secret random minimal 32 karakter |
| `SITE_URL` | Disarankan | `https://ubaynindi.love` |
| `TELEGRAM_BOT_TOKEN` | Jika bot dipakai | Token dari BotFather. Jangan dicatat di repo atau log |
| `TELEGRAM_ADMIN_IDS` | Jika bot dipakai | ID numerik admin, pisahkan dengan koma. Dapat dari perintah `/id` |
| `TRUSTED_PROXY_HEADER` | Tunda | Kosong sampai proxy test lulus |
| `TRUSTED_PROXY_VERIFIED` | Tunda | `false` |
| `PORT` | Tidak | `3000` |
| `HOSTNAME` | Tidak | `0.0.0.0` |

Jangan menaruh `DATABASE_URL`, HMAC secret, atau password PostgreSQL di source code, image build args, client bundle, atau log.

## Release flow

1. Buat backup PostgreSQL.
2. Deploy image baru. Entrypoint menjalankan `node scripts/migrate.mjs` sebelum `node server.js`.
3. Jika migration gagal atau checksum berubah, container berhenti dan traffic tidak boleh dialihkan.
4. Cek:

```bash
curl -i https://ubaynindi.love/api/health
curl -i https://ubaynindi.love/api/ready
```

5. Smoke-test `/`, `/?side=pria`, `/admin`, submit guestbook, baca dari browser kedua, dan refresh.

Migration bersifat versioned, checksum-validated, transactional, dan memakai PostgreSQL advisory lock sehingga replica concurrent tidak menjalankan schema change bersamaan.

## Trusted proxy verification

Sebelum mengisi `TRUSTED_PROXY_HEADER` dan mengubah `TRUSTED_PROXY_VERIFIED=true`:

1. Pada staging, kirim POST dengan header client-address palsu.
2. Pastikan Coolify mengganti header tersebut dengan nilai proxy sebenarnya.
3. Ulangi dari beberapa client dan cek rate limit tidak bisa dilewati dengan header buatan.
4. Jika belum terbukti, biarkan kedua variable kosong/false. API memakai global limit dan mencatat peringatan teredaksi satu kali.

## Backup dan restore drill

Lakukan selama undangan aktif dan sebelum deploy:

```bash
pg_dump "$DATABASE_URL" --format=custom --file=guestbook-backup.dump
createdb ubaynindi_restore_test
pg_restore --dbname=ubaynindi_restore_test guestbook-backup.dump
```

Uji satu entry dapat dibaca setelah restore, lalu hapus database disposable. Simpan backup minimal 90 hari setelah acara sebelum retention cleanup disetujui pemilik.

## Owner operations

Perintah berikut hanya dijalankan pada shell terproteksi, bukan melalui `/admin`:

```bash
npm run guestbook:list
npm run guestbook:export
npm run guestbook:delete -- <exact-uuid>
npm run guestbook:delete -- <exact-uuid> --confirm <exact-uuid>
npm run telegram:webhook
```

`telegram:webhook` memasang `POST /api/telegram/webhook` di `APP_ORIGIN`. Entrypoint container juga mencoba memasangnya saat token dan origin HTTPS ada; kegagalan Telegram tidak menghentikan situs. Perintah bot: `/list`, `/list 2`, `/hapus <awalan-id>`, dan `/id`. Hapus dari bot tetap membutuhkan tombol konfirmasi. Hanya chat pribadi milik ID di `TELEGRAM_ADMIN_IDS` yang dapat melihat atau menghapus ucapan.

Delete selalu menampilkan preview terlebih dahulu. Penghapusan irreversible; recovery hanya melalui backup PostgreSQL.

## Rollback

- Jika masalah hanya pada UI/API, rollback application image dan pertahankan schema additive.
- Jangan rollback ke `localStorage` atau image yang tidak memahami migration baru tanpa smoke test.
- Jika migration gagal sebelum readiness, perbaiki checksum/statement atau restore backup sesuai runbook; jangan menghapus tabel manual.
- Setelah rollback, uji `/api/ready`, baca entry lama, dan submit idempotent retry.

## Local Docker verification

```bash
docker compose up --build
```

Compose menjalankan PostgreSQL pada service `db`, menunggu health check, lalu menjalankan migration web. Untuk database test terisolasi:

```bash
docker compose -f docker-compose.test.yml up -d --wait
$env:TEST_DATABASE_URL = "postgres://ubaynindi_test:ubaynindi_test@127.0.0.1:55432/ubaynindi_test"
npm run test:integration
```

## Troubleshooting

| Gejala | Tindakan |
|---|---|
| `/api/health` 503 | Container belum listen; cek startup log dan port 3000 |
| `/api/ready` 503 | Cek `DATABASE_URL`, network PostgreSQL, dan migration log |
| Migration checksum mismatch | Jangan lanjut deploy; pulihkan file migration yang benar atau jalankan recovery runbook |
| Guestbook 503 | Invitation tetap dapat dibaca; pulihkan PostgreSQL lalu gunakan retry |
| Semua kiriman 429 | Cek global bucket, abuse, dan konfigurasi proxy; jangan mematikan validasi secara permanen |
| Preview WhatsApp lama | Pastikan `SITE_URL`/`APP_ORIGIN` benar dan kirim ulang URL baru |
