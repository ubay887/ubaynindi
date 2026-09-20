# Deploy di Coolify — ubaynindi.love

Repo: [github.com/ubay887/ubaynindi](https://github.com/ubay887/ubaynindi)  
Domain: **https://ubaynindi.love**  
Build Pack: **Dockerfile** · port **3000** · branch **`master`**

Ini **bukan** Vercel. Data tamu dari `/admin` disimpan di volume VPS.

## 0. DNS (sebelum atau bersamaan dengan Coolify)

Di registrar domain `ubaynindi.love`, A record ke **IP VPS Coolify**:

| Type | Name | Value |
|---|---|---|
| A | `@` | IP VPS |
| A | `www` | IP VPS (opsional) |

Jangan pakai CNAME di apex kalau registrar tidak mendukung. Tunggu DNS propagate (bisa 5 menit–beberapa jam).

## 1. Buat aplikasi di Coolify

1. **Projects** → project → **+ New** → **Resource**
2. **Private Repository** (GitHub App) atau **Public Repository**
3. URL: `https://github.com/ubay887/ubaynindi`
4. Branch: **`master`**
5. **Build Pack:** **Dockerfile** (jangan Nixpacks)
6. **Dockerfile Location:** `/Dockerfile`
7. **Ports Exposes:** `3000`
8. **Domains:** `ubaynindi.love`  
   Centang HTTPS / Let’s Encrypt.  
   Boleh tambah `www.ubaynindi.love` dan redirect ke apex.

App sudah listen `0.0.0.0:3000` (`HOSTNAME` di Dockerfile).

## 2. Environment variables

**Configuration → Environment Variables:**

| Nama | Wajib | Isi |
|---|---|---|
| `ADMIN_PASSWORD` | Ya | Password kuat, **bukan** `ubay2026` |
| `SITE_URL` | Ya | `https://ubaynindi.love` (tanpa slash di akhir) |
| `DATA_DIR` | Tidak | default `/app/data` |
| `PORT` | Tidak | `3000` |

`SITE_URL` dipakai OG WhatsApp, metadata, dan link yang disalin di `/admin`. Harus sama dengan domain tamu.

Cadangan di kode: `src/config/wedding.ts` → `meta.siteUrl` sudah `https://ubaynindi.love`. Env Coolify tetap wajib.

## 3. Persistent storage (wajib untuk admin)

Tanpa ini, daftar tamu **hilang setiap deploy**.

**Configuration → Persistent Storage → Add → Volume Mount:**

| Field | Isi |
|---|---|
| Name | `guests-data` |
| Destination Path | `/app/data` |

Source Path kosong (kecuali bind folder host).

Deploy pertama: volume kosong → container menyalin `data/guests.json` seed (umar / nazar). Deploy berikutnya: file di volume **tidak** ditimpa.

## 4. Deploy

Klik **Deploy**. Build beberapa menit (Next.js + image).

Cek:

- https://ubaynindi.love/ — cover wanita (default)
- https://ubaynindi.love/?side=pria — sisi pria
- https://ubaynindi.love/admin — login dengan `ADMIN_PASSWORD`
- Tambah tamu uji di admin → **Redeploy** → tamu masih ada

Kalau admin error “Tidak bisa menulis data tamu”: volume `/app/data` belum terpasang atau tidak writable.

## 5. Link yang dibagikan

```
https://ubaynindi.love/?side=wanita
https://ubaynindi.love/?side=pria
https://ubaynindi.love/?side=wanita&to=Bapak+Andi
https://ubaynindi.love/?c=8497
https://ubaynindi.love/admin
```

Panduan keluarga: [PANDUAN.md](./PANDUAN.md).

## 6. Update undangan (rekening, teks, dll.)

1. Edit di laptop
2. `git push` ke `master`
3. Coolify auto-deploy (webhook Git), atau **Deploy** manual

Daftar tamu di volume **tidak** terhapus.

## 7. Backup tamu

- `/admin` → **Unduh JSON**
- Atau isi volume Docker `guests-data` di VPS

Simpan JSON di luar server.

## 8. Tes Docker di laptop (opsional)

```bash
docker compose build
ADMIN_PASSWORD=rahasia SITE_URL=http://localhost:3000 docker compose up
```

Buka http://localhost:3000

## Troubleshooting

| Gejala | Perbaikan |
|---|---|
| 502 / gateway | Port Exposes bukan `3000` |
| Build OOM | Naikkan RAM VPS (2 GB lebih nyaman) |
| HTTPS gagal | A record belum ke IP VPS; tunggu Let’s Encrypt |
| OG WhatsApp salah / domain lama | `SITE_URL` harus `https://ubaynindi.love`; redeploy; kirim link ke chat sendiri lagi |
| Tamu admin hilang | Volume `/app/data` belum ada |
| Cover lama setelah push | Hard refresh; tunggu deploy selesai |
| Login admin 503 | `ADMIN_PASSWORD` belum di-set |
