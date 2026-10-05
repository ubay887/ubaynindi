# Panduan Keluarga — Undangan Ubay & Nindi

Dokumen ini untuk mempelai dan keluarga. Tidak perlu memahami kode.

## Link acara

| | Pihak wanita | Pihak pria |
|---|---|---|
| Link master | `https://ubaynindi.love/?side=wanita` | `https://ubaynindi.love/?side=pria` |
| Hari | Sabtu, 10 Oktober 2026 | Minggu, 11 Oktober 2026 |
| Acara | Akad 07:00 · Resepsi 12:00 | Resepsi 12:00 |
| Tempat | Kediaman mempelai wanita | Kediaman mempelai pria |

Tanpa `side`, undangan menggunakan pihak wanita.

## Membuat link personal

Buka `https://ubaynindi.love/admin`, atau tulis langsung:

```text
https://ubaynindi.love/?side=wanita&to=Bapak%20Andi%20dan%20Keluarga
https://ubaynindi.love/?side=pria&to=Keluarga%20Besar
```

Halaman `/admin` tidak memakai login, tidak membuat short code, dan tidak menyimpan daftar tamu di server. Nama berada langsung di URL sehingga link tetap dapat dibagikan. Daftar hasil generator hanya ada selama halaman admin terbuka.

Langkah:

1. Isi nama tamu.
2. Pilih pihak wanita atau pria.
3. Pilih **Buat link & salin**.
4. Gunakan **Salin teks WA** atau tombol WhatsApp.

## Format WhatsApp

Teks generator sudah memakai format WhatsApp yang sopan dan mudah dibaca:

```text
Assalamu’alaikum Warahmatullahi Wabarakatuh

Kepada Yth. *Bapak Andi dan Keluarga*

Dengan hormat, kami mengundang Bapak/Ibu/Saudara/i untuk hadir dan memberikan doa restu pada acara pernikahan kami:

💍 *Ubay & Nindi*

📅 *Akad & Resepsi* — Sabtu, 10 Oktober 2026
• *Akad Nikah:* 07:00 WIB
• *Resepsi:* 12:00 WIB – selesai

📍 *Kediaman Mempelai Wanita*
Dsn. Bakalan RT.02 RW.01, Ds. Mojodadi, Kec. Kemlagi, Kab. Mojokerto

🔗 *Undangan digital:*
https://ubaynindi.love/?side=wanita&to=Bapak%20Andi%20dan%20Keluarga

Kehadiran dan doa restu Bapak/Ibu/Saudara/i akan menjadi kebahagiaan bagi kami.

Wassalamu’alaikum Warahmatullahi Wabarakatuh
```

Jika nama atau gelar kurang tepat, mohon buat ulang link dari generator.

## RSVP dan ucapan

Ucapan dan konfirmasi kehadiran tersimpan di PostgreSQL dan langsung terlihat oleh semua pengunjung undangan. Tamu dapat memilih:

- hadir, tidak hadir, atau belum pasti;
- jumlah tamu tepat 1–10 jika hadir;
- nama asli atau Anonim.

Form menyimpan kiriman secara durable sebelum menampilkannya. Jika jaringan/database sedang bermasalah, data tetap tertahan di formulir dan tersedia tombol **Coba lagi**. Pengiriman ulang aman karena sistem memakai idempotency key.

Catatan penting: ucapan bersifat publik dan dapat dibaca semua pengunjung. Owner tidak menghapusnya dari `/admin`; penghapusan dilakukan melalui shell server dengan UUID setelah preview.

## Yang dilihat tamu

Setelah **Buka Undangan**, tamu melihat hero, ayat, pasangan, countdown, acara, kisah, lokasi, hadiah, RSVP, dan penutup. Peta dimuat ketika mendekati bagian lokasi. Musik hanya dimulai setelah interaksi dan dapat dimatikan.

## Checklist sebelum membagikan

- [ ] `/?side=wanita` menampilkan 10 Oktober dan lokasi wanita.
- [ ] `/?side=pria` menampilkan 11 Oktober dan lokasi pria.
- [ ] Link `?side=...&to=...` menampilkan nama yang benar.
- [ ] Tombol peta, Maps, Waze, kalender, dan share berfungsi.
- [ ] Nomor rekening dan data acara sudah final.
- [ ] Guestbook dapat dibaca setelah refresh dari browser lain.
- [ ] Preview WhatsApp sudah dicek di chat sendiri.
- [ ] `/api/health` dan `/api/ready` berstatus baik setelah deploy.

## Konten yang diubah pemilik

Edit [`src/config/wedding.ts`](./src/config/wedding.ts) untuk nama, jadwal, lokasi, rekening, teks, dan path musik. Jangan menaruh secret database atau HMAC di file ini.

Deployment dan backup: [DEPLOY.md](./DEPLOY.md).
