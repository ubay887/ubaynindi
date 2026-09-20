# Deploy di VPS sendiri (Coolify)

Undangan ini **bukan** untuk Vercel. Target: VPS + [Coolify](https://coolify.io), Docker standalone, data tamu di volume agar `/admin` bisa menambah shortcode tanpa commit ulang.

## Yang kamu siapkan

- VPS (1 vCPU / 1 GB RAM cukup; 2 GB lebih nyaman saat build)
- Coolify terpasang, domain mengarah ke VPS (A record)
- Repo Git (GitHub/GitLab) yang berisi proyek ini
- Password admin yang kuat

## 1. Di Coolify — buat aplikasi

1. **Projects** → pilih project → **+ New** → **Resource**
2. **Public Repository** atau **Private Repository** (GitHub App / Deploy Key)
3. Paste URL repo, branch `master` (atau `main`)
4. **Build Pack:** **Dockerfile** (jangan Nixpacks)
5. **Dockerfile Location:** `/Dockerfile`
6. **Ports Exposes:** `3000`
7. Domain: misal `undangan.namadomain.com` (HTTPS biarkan Coolify + Let’s Encrypt)

Server harus listen `0.0.0.0:3000` — sudah di-set di `Dockerfile` (`HOSTNAME=0.0.0.0`).

## 2. Environment variables

**Configuration → Environment Variables:**

| Nama | Wajib | Contoh |
|---|---|---|
| `ADMIN_PASSWORD` | Ya | password kuat, bukan `ubay2026` |
| `SITE_URL` | Ya | `https://undangan.namadomain.com` (tanpa slash di akhir) |
| `DATA_DIR` | Tidak | default `/app/data` |
| `PORT` | Tidak | `3000` |

`SITE_URL` dipakai untuk Open Graph, link di admin, dan metadata. Harus sama dengan domain yang dibagikan ke tamu.

Boleh juga ubah cadangan di `src/config/wedding.ts` → `meta.siteUrl`, tapi env `SITE_URL` mengalahkan itu.

## 3. Persistent storage (penting untuk admin)

Tanpa volume, daftar tamu **hilang setiap deploy**.

**Configuration → Persistent Storage → Add → Volume Mount:**

| Field | Isi |
|---|---|
| Name | `guests-data` |
| Destination Path | `/app/data` |

Jangan isi Source Path kecuali kamu mau bind ke folder host tertentu.

Deploy pertama: jika volume kosong, container menyalin `data/guests.json` dari image (umar / nazar) ke volume. Deploy berikutnya: file di volume **tidak** ditimpa.

## 4. Deploy

Klik **Deploy**. Build memakan beberapa menit (Next.js + image).

Cek:

- `https://undangan.namadomain.com/` — cover undangan
- `https://undangan.namadomain.com/?side=pria` — sisi pria
- `https://undangan.namadomain.com/admin` — login dengan `ADMIN_PASSWORD`
- Tambah tamu uji di admin → refresh → masih ada setelah **Redeploy**

Kalau admin error “Tidak bisa menulis data tamu”: volume `/app/data` belum terpasang atau tidak writable. Pasang ulang storage, lalu redeploy.

## 5. Setelah live — link yang dibagikan

Ganti domain di bawah dengan milikmu.

```
https://undangan.namadomain.com/?side=wanita
https://undangan.namadomain.com/?side=pria
https://undangan.namadomain.com/?side=wanita&to=Bapak+Andi
https://undangan.namadomain.com/?c=8497
```

Panduan lengkap link & dua sisi: [PANDUAN.md](./PANDUAN.md).

## 6. Update undangan (rekening, teks, dll.)

1. Edit `src/config/wedding.ts` di laptop
2. Push ke Git
3. Coolify auto-deploy (kalau webhook Git aktif), atau **Deploy** manual

Daftar tamu di volume **tidak** terhapus. Jangan mount volume ke path lain.

## 7. Backup tamu

- Di `/admin` → **Unduh JSON**
- Atau di VPS: isi volume Docker `guests-data`

Simpan file JSON di luar server.

## 8. Tes Docker di laptop (opsional)

```bash
docker compose build
ADMIN_PASSWORD=rahasia SITE_URL=http://localhost:3000 docker compose up
```

Buka http://localhost:3000

## 9. Nixpacks (tidak disarankan)

Kalau Coolify terlanjur Nixpacks:

- Port `3000`
- Start: `npm run start` (setelah build)
- Tetap pasang volume ke folder data di dalam container (sering `/app/data`)
- `output: "standalone"` di `next.config.ts` tetap aman; `next start` masih jalan

Lebih stabil: **Build Pack = Dockerfile**.

## Troubleshooting

| Gejala | Perbaikan |
|---|---|
| 502 / gateway | Port Exposes bukan `3000`, atau app listen localhost saja |
| Build OOM | Naikkan RAM VPS, atau build di laptop lalu push image (jarang perlu) |
| HTTPS gagal | DNS A record belum ke IP VPS; tunggu Let’s Encrypt |
| OG WhatsApp salah domain | `SITE_URL` belum di-set / masih URL lama; redeploy |
| Tamu admin hilang | Volume `/app/data` belum ada |
| Cover lama setelah push | Hard refresh; Coolify deploy belum selesai |
