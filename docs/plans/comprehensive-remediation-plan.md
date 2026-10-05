<!-- /autoplan restore point: "C:\\Users\\user\\.gstack\\projects\\ubay887-ubaynindi\\main-autoplan-restore-20261005-171539.md" -->
## Implementation plan
# Implementation Plan: Pemulihan Menyeluruh Undangan Digital

Status: IMPLEMENTED — LOCAL VERIFICATION COMPLETE
Branch: `main`
Design input: `docs/designs/wedding-invitation-hardening.md`
Baseline audit: 2026-10-05

## Objective

Menyelesaikan perubahan yang sedang berjalan dan menghasilkan undangan digital pribadi yang modern, menarik, mudah dibaca, predictable, ringan, mobile-first, dan memiliki fallback yang berguna pada browser/perangkat lama. RSVP dan ucapan harus tersimpan di PostgreSQL, langsung terlihat secara publik, serta tidak mengembalikan autentikasi ke halaman `/admin` yang hanya dipakai untuk membuat tautan undangan.

## Non-negotiable outcomes

- Visual botanical-gold tetap memiliki karakter modern; optimasi tidak boleh mengubah produk menjadi halaman generik.
- Informasi inti terlihat cepat dan tidak menunggu animasi panjang.
- RSVP/ucapan tersimpan terpusat, terlihat lintas perangkat, dan bertahan setelah restart/deploy.
- `/admin` tetap publik, tanpa auth, hanya sebagai generator tautan `?side=...&to=...`.
- Data guestbook tidak dapat dibaca atau dihapus melalui `/admin`.
- Tidak ada lagi ketergantungan pada guest short code, `guests.json`, `DATA_DIR`, atau auth admin lama.
- Fresh Docker build, migration database kosong, lint, build, tests, dan browser smoke tests harus lulus sebelum deploy.

## Success metrics

- Invitation mobile Lighthouse: Performance ≥90, Accessibility ≥95, Best Practices ≥95.
- LCP ≤2.5 s, TBT ≤150 ms, CLS ≤0.05 pada profil mobile lab yang sama dengan baseline.
- Initial transfer ≤350 KiB tanpa audio; audio tetap `preload="none"` dan aset aktif diperkecil bila kualitas masih layak.
- Tidak ada horizontal overflow pada viewport 320, 360, 390, dan 430 px.
- Kontrol utama memiliki area target minimal 44×44 CSS px.
- Konten dan fungsi inti tetap usable pada 200% text zoom dan `prefers-reduced-motion`.
- Target full experience: Browserslist proyek. Browser lebih tua mendapat graceful fallback, bukan blank/blocked screen.
- RSVP yang dibuat di browser A terlihat di browser B dan tetap ada setelah restart container.
- API menolak payload berlebih, input invalid, honeypot, rate-limit abuse, origin tidak sah, dan body terlalu besar.
- Raw IP tidak disimpan; secret database tidak masuk client bundle, respons API, atau log.

## Workstream 0: Preserve current work and establish baselines

### Tasks

1. Catat seluruh modified/deleted/untracked files saat ini dan jangan reset perubahan yang sudah disetujui.
2. Simpan hasil audit dan angka Lighthouse sebagai baseline pembanding.
3. Jalankan `npm run lint` dan `npm run build` sebelum perubahan baru untuk memastikan baseline tetap hijau.
4. Tambahkan daftar route dan asset yang sengaja dihapus agar regression test dapat memastikan endpoint lama tetap `404`.

### Exit criteria

- Baseline reproducible dan dirty worktree dipahami.
- Tidak ada perubahan pengguna yang tertimpa.

## Workstream 1: Remove deployment blockers and obsolete guest state

### Files

- `Dockerfile`
- `docker-entrypoint.sh`
- `docker-compose.yml`
- `.env.example`
- `README.md`
- `DEPLOY.md`
- `PANDUAN.md`

### Tasks

1. Hapus `DATA_DIR`, `data.seed`, seed-copy, dan bootstrap `guests.json` dari image serta entrypoint.
2. Pastikan standalone image hanya menyalin output runtime, static assets, public assets, migration files, dan maintenance scripts yang benar-benar diperlukan.
3. Ubah production startup menjadi migration idempotent lalu `node server.js`; dokumentasi tidak lagi menyarankan `next start` untuk standalone image.
4. Tambahkan application health endpoint dan database readiness check terpisah agar Coolify tidak menganggap app siap sebelum PostgreSQL dapat diakses.
5. Buktikan clean Docker build dari Git checkout, bukan dari worktree yang kebetulan masih mempunyai folder `data/`.

### Verification

- `docker build --no-cache` berhasil dari clean checkout/context.
- Container start tanpa `data/guests.json`.
- Health hidup saat server siap; readiness gagal dengan respons aman bila database terputus.

## Workstream 2: Add durable PostgreSQL guestbook

### New architecture

```text
Wishes UI
  ├─ GET /api/guestbook?cursor=&limit=20
  └─ POST /api/guestbook
          ├─ same-origin/body-size checks
          ├─ schema normalization + honeypot + elapsed-time check
          ├─ PostgreSQL-backed per-client/global rate limit
          └─ INSERT guestbook_entries
                     |
                     └─ PostgreSQL service in Coolify

Owner operations
  └─ server-only maintenance script -> list/delete/export by entry UUID
```

### Schema

`guestbook_entries`

- `id uuid primary key`
- `submission_key uuid not null unique` untuk idempotency retry/double-tap.
- `guest_name varchar(80) not null`
- `attendance` constrained to `hadir | tidak_hadir | ragu`
- `guest_count smallint null` constrained to `1..10`; wajib hanya ketika `attendance = hadir`.
- `message varchar(500) not null`
- `created_at timestamptz not null default now()`
- index `(created_at desc, id desc)` untuk cursor pagination yang stabil.

`submission_limits`

- key berupa HMAC harian dari trusted client address, bukan raw IP.
- window start, request count, dan expiry.
- unique key mengizinkan atomic upsert untuk concurrent submissions.
- reserved global key memberi global burst cap saat distributed abuse terjadi.

`schema_migrations`

- version, checksum, applied timestamp.

### Data access and migrations

1. Gunakan `pg`/node-postgres `Pool` di modul `server-only`; paket ini didukung sebagai external package oleh Next.js 16 dan tidak boleh masuk client bundle.
2. Tambahkan migration SQL versioned dan runner Node kecil berbasis `pg`; runner memvalidasi checksum dan idempotent, sementara migration gagal menghentikan startup sebelum server menerima traffic.
3. Gunakan prepared/parameterized queries saja.
4. Batasi connection pool sesuai kapasitas PostgreSQL Coolify dan tutup pool dengan benar pada script one-shot.
5. Tambahkan command server-only untuk list, delete, dan export JSON/CSV berdasarkan UUID tanpa membuat dashboard publik baru.

### Public API contract

`GET /api/guestbook`

- Default 20 item, maksimum 50.
- Cursor opaque berdasarkan `(created_at, id)`; urutan stabil newest-first.
- Response hanya field publik dan `nextCursor`.
- Dynamic/no-store atau revalidation eksplisit agar entry baru tidak tertahan cache.
- Database outage menghasilkan status 503 dan pesan ramah tanpa detail koneksi.

`POST /api/guestbook`

- Content-Type harus JSON dan body dibatasi sebelum parse besar.
- Baca `ReadableStream` secara inkremental dan batalkan request setelah 4 KiB; `Content-Length` hanya pre-check, bukan satu-satunya kontrol.
- Origin/host harus sesuai deployment origin ketika header tersedia.
- Trim, Unicode normalization, collapse whitespace, dan enum validation.
- `guest_name` 1–80 karakter atau nilai normalisasi `Anonim`; `message` 1–500 karakter; `guest_count` 1–10 hanya untuk kehadiran `hadir`.
- Hidden honeypot harus kosong; elapsed submit terlalu cepat ditolak generik.
- Rate limit dilakukan secara atomic di PostgreSQL: per-client dan global.
- Client key memakai header yang benar-benar ditetapkan trusted reverse proxy; jangan percaya arbitrary `x-forwarded-for` dari internet.
- IP diproses menjadi daily HMAC dengan server secret dan tidak pernah disimpan/log mentah.
- `Idempotency-Key` UUID wajib; key yang sama mengembalikan entry yang sama tanpa insert kedua.
- Respons 201 mengembalikan entry publik yang baru dibuat; replay idempotent mengembalikan 200.

### Retention and operations

- Backup PostgreSQL harian selama undangan aktif.
- Lakukan backup/restore drill dengan database disposable sebelum produksi.
- Default retention: ekspor dan simpan backup 90 hari setelah acara, lalu hapus service/database bila sudah disetujui pemilik.
- Dokumentasikan command delete/export dan cara memulihkan backup.

### Verification

- Empty-database migration, repeat migration, and rollback-from-backup tests.
- Concurrent submissions tidak membuat counter salah atau data duplikat.
- Retry dengan `Idempotency-Key` yang sama tidak membuat RSVP ganda.
- Browser A submit, browser B membaca, container restart, data tetap ada.
- SQL injection payload diperlakukan sebagai string biasa.

## Workstream 3: Replace local-only Wishes UI

### Files

- `src/components/invitation/Wishes.tsx`
- new server/client guestbook modules and API route

### Tasks

1. Hapus source-of-truth `localStorage`; server menjadi sumber data tunggal.
2. Muat halaman pertama setelah invitation dibuka atau section mendekati viewport, bukan pada initial cover render.
3. Tampilkan state loading, empty, success, inline validation, retryable error, offline/database unavailable, dan load-more.
4. Setelah POST sukses, prepend response server dan reset form. Jangan tampilkan data sebelum server menerima submission sebagai durable.
5. Pertahankan pilihan jumlah tamu dan mode anonim. Gunakan jumlah tepat 1–10 agar data terpusat dapat dipakai sebagai estimasi hadir; sembunyikan field saat tidak hadir/ragu.
6. Buat satu `Idempotency-Key` per percobaan submission, nonaktifkan tombol selama request, dan gunakan key yang sama saat retry sampai server mengonfirmasi sukses.
7. Poll 30–60 detik hanya saat section pernah terlihat dan tab aktif; hentikan saat `document.hidden` atau save-data aktif.
8. Gunakan string rendering React biasa; dilarang `dangerouslySetInnerHTML`.
9. Pertahankan copy bahwa pesan langsung tampil. Tambahkan catatan singkat bahwa kiriman publik dan dapat dibaca semua pengunjung.
10. Pastikan form tetap dapat digunakan dengan keyboard, screen reader, reduced motion, serta viewport 320 px.

### Degraded behavior

- Database/API gagal: informasi acara lain tetap berfungsi; guestbook menampilkan retry dan tidak memblokir scroll.
- JavaScript terbatas: fallback statis masih menampilkan pasangan, waktu, lokasi, dan kontak; guestbook boleh tidak interaktif.
- Polling gagal: entry pengirim tetap tampil dari response POST; pengunjung lain melihat setelah refresh.

## Workstream 4: Remove unused dynamic OG and close security gaps

### Files

- `src/app/api/og/route.tsx`
- `src/lib/rate-limit.ts`
- metadata/static OG configuration

### Tasks

1. Cari semua caller/import endpoint dynamic OG.
2. Jika tidak ada caller, hapus route dan limiter lama; pertahankan static `opengraph-image`/PNG yang sudah dipakai WhatsApp.
3. Regression test memastikan metadata woman/pria tetap mengarah ke static image yang benar.
4. Tambahkan security headers/CSP regression test; pertahankan `'unsafe-inline'` hanya jika masih dibutuhkan dan dokumentasikan alasannya.
5. Pastikan guestbook limiter baru bounded dan PostgreSQL-backed, bukan process-global Map.
6. Jalankan dependency audit dan review client bundle agar `DATABASE_URL`, HMAC secret, dan detail error tidak bocor.

### Exit criteria

- Tidak ada unused dynamic image renderer yang dapat dipakai untuk resource abuse.
- Tidak ada unbounded in-memory map atau kepercayaan langsung pada spoofable forwarding header.

## Workstream 5: Modern, predictable, mobile-first UI

### Cover and visual hierarchy

1. Pertahankan identitas botanical-gold dan visual hierarchy yang ada.
2. Hapus delay berantai sampai 1.1 detik untuk nama/tanggal/CTA; critical cover content tampil segera atau ≤300 ms.
3. Gunakan motion sebagai enhancement singkat, bukan syarat visibility.
4. Pada `prefers-reduced-motion`, hilangkan parallax/confetti/transisi non-esensial dan pastikan layout final langsung terlihat.
5. Uji nama tamu 1, 40, dan 80 karakter tanpa clipping atau layout rusak.

### Accessibility and predictability

1. Tambahkan `<main>` pada admin dan audit landmarks invitation.
2. Target penting minimal 44×44 px; focus indicator jelas; urutan tab mengikuti visual order.
3. Kontras teks biasa ≥4.5:1 dan teks besar ≥3:1 pada seluruh botanical background.
4. Zoom 200% tanpa hilang fungsi; 320 px tanpa horizontal overflow.
5. Label tombol menyatakan aksi dengan konsisten; posisi tombol share didokumentasikan sesuai UI aktual.
6. Ubah URL preview admin dari `break-all` menjadi wrapping/truncation yang rapi, sambil mempertahankan tombol copy sebagai aksi utama.
7. Pindahkan `LocationMap` state update dari render ke effect atau derived state agar tidak memicu render loop laten.

### Compatibility boundary

1. Catat bahwa Next.js 16 default support adalah Chrome/Edge/Firefox 111+ dan Safari 16.4+.
2. Browserslist proyek tetap menargetkan Chrome/Android 90, Samsung 15, iOS/Safari 15 untuk aplikasi sendiri; audit fitur pihak ketiga terhadap target ini.
3. Polyfill hanya API yang benar-benar dipakai dan terbukti hilang, melalui `instrumentation-client.ts`; jangan menambah bundle-wide polyfill tanpa evidence.
4. Tambahkan `<noscript>`/fallback server-rendered untuk informasi acara inti.
5. Uji dengan Playwright Chromium/WebKit dan satu perangkat Android lama nyata bila tersedia.

## Workstream 6: Load and runtime optimization

### Image/LCP

1. Pastikan hanya satu image kandidat LCP menggunakan Next.js 16 `preload`, bukan deprecated `priority`.
2. Pastikan URL LCP discoverable dari initial HTML dan memiliki `sizes` yang sesuai viewport.
3. Audit seluruh image untuk width/height, responsive `sizes`, kualitas, format, lazy loading below-fold, dan duplicate downloads.
4. Bandingkan apakah `couple-card-gold.png` tetap kandidat LCP terbaik atau dapat diganti elemen teks/asset yang lebih ringan tanpa kehilangan desain.

### JavaScript and interactions

1. Hapus proactive import opened-experience dari immediate mount.
2. Warm bundle saat browser idle setelah first paint atau saat user menunjukkan intent pada CTA; hormati save-data dan sediakan fallback bila `requestIdleCallback` tidak ada.
3. Lazy-load map/Leaflet hanya ketika section mendekati viewport atau user memilih lokasi.
4. Audit Motion imports dan shared primitives untuk menghindari client boundary yang terlalu lebar.
5. Jangan menjadikan opening interaction bergantung pada network request yang belum selesai.

### Audio and assets

1. Pertahankan `preload="none"` dan mulai audio hanya setelah explicit user gesture.
2. Encode musik aktif pada bitrate/format yang lebih kecil setelah A/B quality check; target praktis ≤1.2 MB bila durasi memungkinkan.
3. Hapus `public/music/bgm.mp3` lama setelah memastikan tidak ada reference.
4. Tambahkan fallback jika audio decode/play ditolak browser.

### Verification

- Bundle/resource comparison before/after.
- Lighthouse invitation/admin pada profile dan viewport yang sama.
- Network waterfall memastikan LCP early/high priority dan audio tidak ikut initial load.
- CPU-throttled open flow memastikan CTA tetap responsif.

## Workstream 7: Automated test and quality gates

### Unit tests

- Invite-side parsing and defaults.
- Guest-name normalization and URL serialization.
- WhatsApp message formatting and URL encoding.
- Guestbook schema boundaries and Unicode handling.
- Guest-count conditional validation, anonymous normalization, dan idempotency-key reuse.
- Cursor encode/decode and stable pagination.
- HMAC client-key derivation without raw IP output.
- Rate-limit window/reset/global cap logic.

### API integration tests

- GET empty/list/pagination/order.
- POST valid/invalid/content-type/body-size/origin/honeypot/min-time.
- POST stream yang melampaui 4 KiB dibatalkan walaupun `Content-Length` hilang atau palsu.
- Idempotency replay mengembalikan entry yang sama tanpa duplikasi.
- Concurrent rate limit behavior.
- Database unavailable and migration mismatch.
- HTML/script payload stored/rendered only as text.

### Browser E2E smoke tests

- Woman/pria direct links and default side.
- Guest personalization with spaces, Unicode, long names, and absent `to`.
- Open invitation, reduced motion, keyboard flow, share API fallback, map fallback, audio failure.
- Guestbook submit, cross-context read, refresh persistence, error/retry, load more.
- Admin generator/copy/WhatsApp link and malformed input.
- Viewports 320/390/430, zoom 200%, WebKit and Chromium.
- Removed auth, short-code, guest JSON, and dynamic OG routes return expected not-found behavior.

### CI/release gates

1. `npm run lint`
2. Type check if not already guaranteed by build.
3. Unit and integration tests against ephemeral PostgreSQL.
4. `npm run build`
5. Playwright smoke suite against production build.
6. Clean Docker build and startup migration.
7. Lighthouse budget comparison; regression beyond agreed threshold blocks release.

## Workstream 8: Documentation and operational handoff

### Documents

- `README.md`: local development, test commands, architecture summary, supported browser boundary.
- `PANDUAN.md`: correct share-button location, link generator flow, guestbook behavior, owner deletion/export.
- `DEPLOY.md`: Coolify PostgreSQL, secrets, migration, standalone startup, health/readiness, backup/restore, rollback.
- `.env.example`: names only for `DATABASE_URL`, trusted proxy configuration, and HMAC secret; no real secrets.

### Required runbooks

- First deploy against empty database.
- Migration failure and rollback.
- Database outage behavior.
- Delete abusive guestbook entry by UUID.
- Export guestbook and post-event retention cleanup.
- Backup restore drill.

## Recommended execution order

```text
0 Baseline and preserve work
        |
1 Deployment cleanup + clean Docker proof
        |
2 PostgreSQL schema/migrations/API/security controls
        |
3 Server-backed Wishes UI
        |
4 Remove obsolete OG/rate-limit paths
        |
5 UI/accessibility/compatibility fixes
        |
6 Performance and asset optimization
        |
7 Full automated verification
        |
8 Documentation, backup drill, staged deploy
```

Workstreams 5 and 6 may run in parallel after the guestbook API contract is stable. Documentation is updated alongside each workstream, then verified again at Workstream 8.

## Deployment and rollback strategy

1. Provision disposable/staging PostgreSQL and run migrations.
2. Deploy application with guestbook feature enabled only after readiness succeeds.
3. Run smoke tests and cross-browser checks against staging.
4. Create database backup immediately before production deployment.
5. Deploy production and verify cover, links, maps, share, audio, guestbook submit/read, health, and logs.
6. Rollback application image independently if UI/API regresses; keep additive schema intact.
7. For migration failure, stop release before traffic, restore prior backup only when migration is destructive. Initial schema should be additive and rollback-safe.
8. Do not roll back to localStorage as source of truth. During database outage, disable submission with a clear retry state while the rest of the invitation remains usable.

## Explicitly not in scope

- Reintroducing admin login or guest short codes.
- A public/private moderation dashboard.
- WebSocket/SSE realtime guestbook.
- Multi-tenant wedding templates, billing, analytics platform, or invitation CMS.
- Guaranteeing identical behavior on unsupported/obsolete browsers; the promise is graceful fallback.
- Rewriting the established visual identity or every invitation section.

## Completion definition

The work is complete only when all success metrics pass, guestbook data survives restart and restore, obsolete state paths are gone, clean Docker deployment is proven, docs match the actual UI/runtime, and automated tests cover the primary happy paths plus failure/abuse paths.

<!-- autoplan-accepted:ceo -->
- Preserve the current anonymous submission mode and attendance-dependent guest count; store an exact integer from 1 through 10 only when attendance is `hadir`.
- Require a client-generated UUID `Idempotency-Key`, persist it as a unique `submission_key`, reuse it for retries, and return the existing public entry without a duplicate insert.
- Enforce a 4 KiB request-body maximum by reading and cancelling the stream incrementally; use `Content-Length` only as an early rejection hint.
- Use server-only `pg` Pool access, versioned SQL migrations with checksums, parameterized queries, bounded connections, and startup failure before readiness when migration fails.
- Trust a client-address header only after Coolify proxy behavior is verified by a spoofing test; store only daily HMAC-derived rate-limit keys and never raw addresses.
- Tell visitors next to submit that guestbook posts appear immediately and are public to all invitation visitors.
- Keep operations proportionate: redacted structured logs, health/readiness endpoints, Coolify alerts, daily backup, restore drill, and server-only list/export/delete commands; do not build a public moderation dashboard.
- Preserve the modern botanical-gold identity while making critical cover content visible immediately or within 300 ms and providing readable static fallback when optional JavaScript fails.
<!-- /autoplan-accepted:ceo -->

<!-- autoplan-accepted:design -->
- Use this information hierarchy for the invitation: cover first shows couple names, wedding date, personalized addressee, then one primary `Buka Undangan` action; opened content orders event essentials (date/countdown, ceremony/reception, location) before supporting story/dress/gift content, then RSVP and closing. Section navigation is secondary and must never cover the primary action or form controls.
- Treat the invitation as an EXPERIENCE surface and `/admin` as an OPERATE surface. Preserve Cormorant Infant for display, Pinyon Script only for short ceremonial accents, Nunito Sans for body/control text, and the existing cream/emerald/gold CSS variables. Do not introduce a new visual language, generic SaaS cards, decorative gradients, glassmorphism, or repeated entrance animations.
- Make the cover one full-viewport composition with one botanical-couple visual anchor. Couple names remain the loudest text; body text is at least 16 px, line length stays readable, text never sits on an uncontrolled busy image area, and the primary button is visually unmistakable. Critical text starts visible; at most one coordinated ease-out entrance completes within 300 ms.
- Use this guestbook state contract:
  | State | What the visitor sees | Primary action |
  |---|---|---|
  | Loading first page | 3 lightweight skeleton rows with fixed height; form remains usable | None |
  | Empty | Warm copy: `Belum ada ucapan. Jadilah yang pertama.` | Focus `Tulis ucapan` |
  | Validation error | Field-specific text below the field; focus moves to first invalid field | Correct field |
  | Submitting | Button label `Mengirim…`, spinner, controls retained, double-submit disabled | Wait |
  | Success | New durable entry appears first and a polite live-region confirmation is announced | Send another only after reset |
  | Rate limited | Neutral wait message without blame or internal detail | Try again after stated delay |
  | Offline/API unavailable | Existing entries remain; compact status panel says data belum dapat dimuat/dikirim | `Coba lagi` |
  | Partial/poll failure | Current list remains, no blocking toast, refresh status stays subtle | Manual refresh |
  | Loading more | Inline row after the list; existing entries do not jump | None |
  | End of list | Quiet `Semua ucapan sudah ditampilkan` text | None |
- Use this emotional journey: (1) arrival feels personally welcomed through the addressee and clear couple identity; (2) opening feels ceremonial but immediate, with motion never withholding content; (3) scanning feels calm because date, venue, and directions are easy to find; (4) responding feels safe because public visibility, anonymous mode, attendance, and guest count are explicit; (5) completion feels acknowledged through a durable visible post; (6) later return feels familiar because hierarchy and control positions stay stable.
- On mobile 320–479 px use one column, 16 px minimum side gutters, no clipped fixed controls, and full-width form actions where that improves tapping. At 480–767 px retain one reading column with larger gutters. At 768 px and above allow paired event/location layouts only when reading order and 200% zoom remain intact. Cap invitation reading content near 42rem and utility/admin form content near 48rem.
- Use visible persistent labels for every field, help/error text linked with `aria-describedby`, `aria-live=polite` for submit/load results, semantic `main` and section headings, keyboard-operable native controls, visible palette-derived focus rings, and 44×44 px minimum primary targets. Do not auto-focus on page load or move focus on background polling.
- Keep `/admin` a calm utility page: title and one-sentence purpose first, side and guest-name inputs second, generated URL third, then `Salin tautan` as primary and WhatsApp as secondary. Long URLs wrap at safe boundaries inside a selectable region and never create horizontal overflow.
- Theme browser-level details from the established palette: text selection, caret, focus outline, link underline offset, and visited links. Use tabular numerals for countdown/date-like values and avoid gray secondary text on emerald surfaces; tint it from the same hue while meeting contrast.
- Design-review verification must include screenshot comparisons at 320, 390, 430, 768, and 1280 px; 200% text zoom; keyboard-only flow; reduced motion; high-contrast/forced-colors sanity; long/Unicode guest names; all guestbook states; and no horizontal overflow or layout shift when errors and entries appear.
<!-- /autoplan-accepted:design -->

<!-- autoplan-accepted:dx -->
- Define the developer persona as the solo owner/maintainer using Codex, local Node tooling, Docker, PostgreSQL, and Coolify; optimize for safe repeatable maintenance rather than public SDK adoption.
- Set the fresh-start clock from a clean clone with Node and Docker already installed to a healthy local invitation with migrated PostgreSQL and one verified guestbook write/read. Target under 10 minutes and no more than five copy-paste commands; automated Codex execution should finish materially faster but is not the human TTHW measurement.
- Provide exact package scripts with stable names: `dev`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `build`, `db:migrate`, `db:status`, `guestbook:list`, `guestbook:export`, and `guestbook:delete`. Every documented command must exist and be exercised in CI or a smoke check.
- Make `.env.example` self-explanatory with required/optional labels, safe placeholder shapes, and comments for `DATABASE_URL`, `RATE_LIMIT_HMAC_SECRET`, `TRUSTED_PROXY_HEADER`, `APP_ORIGIN`, and pool sizing. Add fail-fast server-side environment validation naming the missing key and the exact local/deploy document section to follow, without printing values.
- Add one copy-paste local quick start: `npm ci`; start only the PostgreSQL service through Docker Compose; copy `.env.example` to `.env.local` and fill required placeholders; run `npm run db:migrate`; run `npm run dev`. Show expected readiness output and a curl/browser guestbook verification.
- Standardize public API errors as safe JSON with stable `code`, human-readable `message`, optional field errors, and optional `retryAfter`; keep internal cause/stack only in redacted server logs correlated by a request ID. Document status/code mappings for validation, oversized body, origin rejection, rate limit, database unavailable, and unexpected failure.
- Migration tooling must print current/applied versions, elapsed time, and a clear no-op result; checksum mismatch or failed statement must exit nonzero with the migration filename, safe cause, and recovery command/runbook reference. Never continue startup after a failed migration.
- Owner commands must default to read-only or require an exact UUID. `guestbook:delete -- <uuid>` first displays the selected public fields and requires an explicit `--confirm <uuid>` on a second command; export writes a timestamped file and reports record count/path. Documentation must warn that deletion is irreversible but database backup remains the recovery path.
- Structure docs by task: README quick start and command table; DEPLOY Coolify provisioning/secrets/readiness/rollback; PANDUAN link generation and guestbook owner tasks; runbooks for migration failure, database outage, backup restore, abusive-entry deletion, export, and retention cleanup. Cross-link commands instead of duplicating divergent instructions.
- CI must prove documentation and tooling remain truthful by running clean install, lint, typecheck, unit/integration tests, build, migration twice against empty PostgreSQL, production smoke, and command `--help`/usage checks. A release fails when a documented command is missing or a required environment key is undocumented.
- After implementation, measure the fresh-clone TTHW and run the owner journey without undocumented knowledge; target 8/10 or better DX and record any remaining manual Coolify steps in DEPLOY rather than hiding them.
<!-- /autoplan-accepted:dx -->

<!-- autoplan-accepted:eng -->
- Run all database code in explicit Node.js runtime server modules. Use one lazily initialized process-wide `pg.Pool` with production defaults `max=5`, bounded connection/idle/query/statement timeouts, application name, TLS controlled by the connection URL, and no per-request pool creation or shutdown.
- Serialize migrations across concurrent replicas with a PostgreSQL advisory lock held on one dedicated client for the entire migration transaction. Validate every applied checksum before new work, apply each pending migration transactionally, release the lock in `finally`, and fail readiness/startup on timeout or error.
- Generate public entry UUIDs in server application code so the schema needs no PostgreSQL extension. Store normalized guest text and validate length by Unicode code points in application code plus database `char_length`/check constraints as defense in depth.
- Make POST idempotency and rate limiting one transaction: attempt the unique `submission_key` insert first; on conflict return the committed existing entry without consuming another limit; for a new row atomically claim both per-client and global limit buckets; rollback the inserted row and counters on any denial/error; commit only after all invariants pass. Test concurrent identical and distinct keys.
- Model rate-limit buckets with `(scope, client_key, window_start)` uniqueness, `count`, and `expires_at`; update counts with one conditional upsert and `RETURNING`, index expiry, and add a daily bounded cleanup command. A failed cleanup must not block submissions, but a failed limit transaction must fail closed with a generic retry response.
- Require POST `Origin` to exactly match configured `APP_ORIGIN`; do not fall back to request `Host`. In production, accept the configured client-address header only after a staging test proves the Coolify proxy overwrites inbound spoofed values. Until verified, use the global limit only and emit one redacted degraded-security warning.
- Encode pagination cursors as versioned base64url JSON containing an ISO timestamp and UUID; decode with strict shape/version/length validation. Query with `WHERE (created_at,id) < ($1,$2) ORDER BY created_at DESC,id DESC LIMIT $3+1`, return at most the requested cap, and never interpolate cursor values.
- Separate `/api/health` liveness from `/api/ready` readiness: liveness proves the Node process can serve without querying PostgreSQL; readiness performs a short-timeout `SELECT 1` and verifies the latest migration version. Coolify routes traffic only on readiness, while liveness prevents a DB outage from causing restart loops.
- Organize server code into narrow modules: `env`, `db/pool`, `db/migrate`, `guestbook/schema`, `guestbook/repository`, `guestbook/rate-limit`, `guestbook/cursor`, `api/errors`, and route handlers. Keep React components unaware of SQL and keep owner scripts importing the same repository contract.
- Use Vitest for pure unit tests and Node/PostgreSQL integration tests, and Playwright for browser flows. Integration tests use an isolated Docker Compose PostgreSQL database with migration-per-suite and deterministic cleanup; tests may not point at a non-test `DATABASE_URL`.
- Gate release on the exact execution path used in production: fresh migration, repeated no-op migration, standalone `node server.js`, liveness/readiness, API contract, two-browser persistence, restart persistence, and additive-schema rollback to the previous application image.
- Bound runtime work: GET limit 1–50 and one indexed query; POST body 4 KiB and constant query count; polling only when visible and not save-data; pool queue/timeouts surface 503 rather than hanging. Capture p95 API duration and pool-timeout counts in structured logs without adding a monitoring platform.
- Treat secret scanning and privacy as release gates: scan `.next`, standalone output, source maps, container history, and logs for configured secret markers; never log guest name/message, raw IP, full personalized URLs, database URLs, request bodies, or idempotency keys.
<!-- /autoplan-accepted:eng -->
## Review record

<!-- autoplan-accepted:ceo -->
- Preserve the current anonymous submission mode and attendance-dependent guest count; store an exact integer from 1 through 10 only when attendance is `hadir`.
- Require a client-generated UUID `Idempotency-Key`, persist it as a unique `submission_key`, reuse it for retries, and return the existing public entry without a duplicate insert.
- Enforce a 4 KiB request-body maximum by reading and cancelling the stream incrementally; use `Content-Length` only as an early rejection hint.
- Use server-only `pg` Pool access, versioned SQL migrations with checksums, parameterized queries, bounded connections, and startup failure before readiness when migration fails.
- Trust a client-address header only after Coolify proxy behavior is verified by a spoofing test; store only daily HMAC-derived rate-limit keys and never raw addresses.
- Tell visitors next to submit that guestbook posts appear immediately and are public to all invitation visitors.
- Keep operations proportionate: redacted structured logs, health/readiness endpoints, Coolify alerts, daily backup, restore drill, and server-only list/export/delete commands; do not build a public moderation dashboard.
- Preserve the modern botanical-gold identity while making critical cover content visible immediately or within 300 ms and providing readable static fallback when optional JavaScript fails.
<!-- /autoplan-accepted:ceo -->

### Phase 1 — CEO review

Mode: **SELECTIVE EXPANSION**. The product remains a private, single-event invitation; expansion is accepted only where it prevents data loss, duplicate submissions, abuse, or deployment failure.

#### Product thesis and premise challenge

The invitation's value is not the number of features. It is a calm, trustworthy path from opening a personal link to understanding the event and optionally responding. The correct target is therefore a polished static-first invitation with one durable interactive subsystem (guestbook), not a miniature invitation platform.

The plan preserves the strongest existing assets: botanical-gold identity, direct `?side=&to=` links, static event content, WhatsApp sharing, and the established invitation sections. It removes accidental infrastructure: admin auth, guest codes, JSON guest storage, dynamic OG rendering, and process-memory rate limiting.

#### Decision ledger

| Decision | Status | Rationale |
|---|---|---|
| Personal/single-event product | User-approved | Avoids multi-tenant and CMS complexity. |
| Modern botanical-gold, readable, light, mobile-first | User-approved | Keeps emotional character while prioritizing clarity. |
| Public, immediate guestbook | User-approved | Messages are shared without moderation queue. |
| PostgreSQL on Coolify | User-approved | Durable across devices, restarts, and deploys. |
| Public `/admin` link generator without auth | User-approved | It contains no protected data or privileged operations. |
| Preserve anonymous and guest-count behavior | Auto-approved, in blast radius | Prevents regression from the current form. |
| Exact guest count 1–10 | Auto-approved, close approach | More useful and unambiguous than the current `3+`; compact UI keeps friction low. |
| Idempotency key and streamed 4 KiB body cap | Auto-approved, in blast radius | Prevents duplicate writes and memory abuse. |
| Structured logs, readiness, backup/restore runbook | Auto-approved, in blast radius | Minimum viable operations for durable public data. |
| Moderation dashboard, realtime sockets, analytics, multi-tenancy | Deferred/not in scope | High complexity with little value for a personal invitation. |

#### What already exists

- Working App Router invitation shell with direct side/name query parameters.
- Distinct closed/opened invitation experiences, botanical visual assets, audio control, maps, sharing, countdown, and guestbook UI.
- Public admin link generator already moving away from auth and short codes.
- Static social artwork is sufficient for WhatsApp; dynamic OG has no proven caller.
- Docker standalone deployment foundation and Coolify-oriented documentation.

#### Dream-state delta

The dream state is a link that opens instantly on a modest phone, exposes event essentials without waiting for animation, works even when optional JavaScript fails, and accepts a durable RSVP exactly once. The current delta is concentrated in four areas: deployment still references deleted JSON state; guestbook data is local-only; the opening path delays content and eagerly loads code; and verification/operations are mostly manual. The proposed work directly closes those gaps without changing the product category.

#### Review sections

1. **Architecture:** Approve a static-first Next.js application plus one Node-runtime guestbook boundary. Use `pg` with a small connection pool, versioned SQL, server-only modules, and no ORM unless implementation evidence shows it is necessary. Keep `/admin` isolated from guestbook operations.
2. **Error and rescue:** Invitation content must survive guestbook, map, audio, share, and animation failures. API errors are typed into retryable validation/rate-limit/unavailable states; no silent localStorage fallback. Startup migration failures prevent readiness rather than serving a half-working API.
3. **Security:** Treat all guestbook fields and forwarding headers as untrusted. Require same-origin JSON POST, bounded streamed body, schema validation, honeypot/min-time heuristics, PostgreSQL-atomic client/global limits, parameterized SQL, redacted logs, and secret-only server modules. Confirm Coolify's trusted proxy behavior with a spoofing test.
4. **Data flow and edge cases:** Preserve anonymous submissions and attendance-dependent guest count. Stable `(created_at,id)` cursors prevent skips on equal timestamps. One client-generated UUID is reused through retries so network ambiguity cannot duplicate an entry. Unicode and long names are normalized and length-checked after normalization.
5. **Code quality:** Extract narrow server modules for env validation, pool access, validation, cursor encoding, client-key derivation, and repository queries. Keep UI state local to `Wishes`; fix render-time state mutation in `LocationMap`. Delete obsolete code instead of maintaining compatibility wrappers.
6. **Tests:** Add focused unit/API/browser coverage and a real ephemeral PostgreSQL integration path. Regression tests prove removed auth/code/OG routes stay absent. Every failure state gets at least one contract test; core visitor flow gets Chromium and WebKit smoke coverage.
7. **Performance:** Make cover text and CTA immediately visible, preload only the true LCP image, defer opened bundle/map/guestbook, and never preload audio. Measure with the same mobile Lighthouse profile and retain visual quality through asset A/B checks.
8. **Observability:** Emit structured events for migration, DB availability, guestbook read/write outcome, rate-limit decisions, and request duration without names, messages, raw IPs, URLs containing guest names, or secrets. Use health/readiness and Coolify logs/alerts; do not build a custom dashboard.
9. **Deployment:** Prove a clean-context image build, empty DB migration, repeated migration, staging smoke, backup/restore, and application rollback. Schema changes for this release are additive; old image rollback must tolerate them.
10. **Long-term trajectory:** Prefer boring, removable infrastructure. PostgreSQL can remain the only persistent service; avoid queues, websockets, moderation UI, analytics, and generalized template systems until a real need appears.
11. **Design and UX:** Keep a premium modern cover but cap entrance motion at about 300 ms, preserve visible hierarchy, use large tap targets and clear focus states, and make public-posting consent explicit near submit. Unsupported browsers receive readable event information rather than a compatibility promise the framework cannot guarantee.

#### System architecture

```text
Visitor browser
  |-- server-rendered event content and static assets
  |-- GET/POST /api/guestbook -- validation/idempotency/rate limits -- PostgreSQL
  |-- optional lazy map provider
  `-- optional user-initiated audio

Public /admin
  `-- builds direct invitation URL only (no data access, no privileged API)

Owner shell/Coolify
  `-- migration + list/export/delete scripts -- PostgreSQL backups
```

#### Submission state and rescue flow

```text
idle -> validating -> submitting -> committed -> visible
          |              |             |
          v              v             `-- reset form and rotate idempotency key
      inline errors   retryable error
                          |
                          `-- retry with the same key -> same committed row

DB unavailable -> guestbook unavailable panel + retry; invitation stays usable
rate limited   -> polite wait state; submitted content is not echoed
offline        -> no optimistic durable claim; retain form fields locally in memory
```

#### Error and rescue registry

| Failure | User-visible behavior | Detection/operation | Recovery |
|---|---|---|---|
| Migration/checksum failure | App not ready | Startup log + readiness failure | Fix migration or restore backup, then restart. |
| PostgreSQL unavailable | Guestbook retry panel only | 503 + structured DB-unavailable event | Restore DB; retry without redeploy when possible. |
| Ambiguous POST timeout | Form retains values | Client timeout | Retry same idempotency key. |
| Invalid/oversize input | Inline/generic validation | 400/413 metric | Correct input; no write. |
| Rate limit/honeypot | Polite generic rejection | 429/400 redacted event | Wait; investigate sustained global limit. |
| Map/audio/share failure | Native fallback action | Browser error/fallback test | Open map link, mute audio, copy link. |
| Opened bundle fails | Core event fallback remains | error boundary/browser log | Reload; static essentials remain visible. |

#### Failure modes registry

| Risk | Prevention | Verification |
|---|---|---|
| Fresh Docker build references deleted data | Remove seed/data copy paths | Build from clean checkout. |
| Duplicate RSVP after retry/double tap | Unique `submission_key`, disabled submit | Concurrent/replay integration test. |
| Spoofed client IP bypasses limit | Trust only verified proxy-set address | Direct spoof test in staging. |
| Oversize chunked JSON consumes memory | Incremental 4 KiB stream cap | Missing/false `Content-Length` tests. |
| Same-timestamp pagination skips rows | Composite cursor/index | Pagination fixture test. |
| Client bundle leaks secrets | `server-only`, bundle audit | Build artifact scan. |
| UI becomes generic after optimization | Visual baseline and review | Screenshot comparison at target widths. |
| Old-browser blank screen | SSR essentials and `<noscript>` | constrained/browser compatibility smoke. |

#### Scope expansion decisions

Accepted additions are limited to preserving `guest_count` and anonymous posts, exact count validation, request idempotency, streamed size enforcement, public-post notice, structured redacted logging, and backup/restore verification. They are all adjacent safeguards required for the already-approved public durable guestbook. Moderation, realtime transport, analytics, user accounts, and platformization remain excluded.

#### Implementation tasks

| ID | Priority | Component | Deliverable | Depends on |
|---|---|---|---|---|
| T1 | P0 | Baseline | Preserve dirty work; capture build/Lighthouse/routes/assets baseline | — |
| T2 | P0 | Deploy | Remove JSON bootstrap and prove clean standalone Docker image | T1 |
| T3 | P0 | Database | Add `pg`, env validation, schema, migrations, runner, readiness | T2 |
| T4 | P0 | API/security | Build list/create contracts, cursors, idempotency, stream cap, limits | T3 |
| T5 | P0 | Guestbook UI | Replace localStorage with durable states, count/anonymous behavior, consent | T4 |
| T6 | P1 | Cleanup | Remove dynamic OG/old limiter/assets; add header/secret checks | T4 |
| T7 | P1 | UX/accessibility | Cover timing, landmarks, targets, focus, wrapping, map state fix | T5 |
| T8 | P1 | Performance | LCP preload, deferred bundles/map, compressed audio | T7 |
| T9 | P0 | Verification | Unit, integration, E2E, Docker, Lighthouse gates | T2–T8 |
| T10 | P1 | Operations/docs | Coolify config, backup/restore, delete/export, accurate guides | T3–T9 |

#### CEO completion summary

The plan is viable and appropriately scoped after adding preservation of existing guest-count/anonymous behavior, idempotent writes, a hard streamed body limit, explicit `pg` migration strategy, public-post consent, and proportionate operations. No CEO-level product decision remains unresolved. Independent outside review was attempted but unavailable because the local Claude Code connection was refused; no native subagent runtime was exposed. Those missing voices are recorded rather than simulated.

<!-- autoplan-accepted:design -->
- Use this information hierarchy for the invitation: cover first shows couple names, wedding date, personalized addressee, then one primary `Buka Undangan` action; opened content orders event essentials (date/countdown, ceremony/reception, location) before supporting story/dress/gift content, then RSVP and closing. Section navigation is secondary and must never cover the primary action or form controls.
- Treat the invitation as an EXPERIENCE surface and `/admin` as an OPERATE surface. Preserve Cormorant Infant for display, Pinyon Script only for short ceremonial accents, Nunito Sans for body/control text, and the existing cream/emerald/gold CSS variables. Do not introduce a new visual language, generic SaaS cards, decorative gradients, glassmorphism, or repeated entrance animations.
- Make the cover one full-viewport composition with one botanical-couple visual anchor. Couple names remain the loudest text; body text is at least 16 px, line length stays readable, text never sits on an uncontrolled busy image area, and the primary button is visually unmistakable. Critical text starts visible; at most one coordinated ease-out entrance completes within 300 ms.
- Use this guestbook state contract:
  | State | What the visitor sees | Primary action |
  |---|---|---|
  | Loading first page | 3 lightweight skeleton rows with fixed height; form remains usable | None |
  | Empty | Warm copy: `Belum ada ucapan. Jadilah yang pertama.` | Focus `Tulis ucapan` |
  | Validation error | Field-specific text below the field; focus moves to first invalid field | Correct field |
  | Submitting | Button label `Mengirim…`, spinner, controls retained, double-submit disabled | Wait |
  | Success | New durable entry appears first and a polite live-region confirmation is announced | Send another only after reset |
  | Rate limited | Neutral wait message without blame or internal detail | Try again after stated delay |
  | Offline/API unavailable | Existing entries remain; compact status panel says data belum dapat dimuat/dikirim | `Coba lagi` |
  | Partial/poll failure | Current list remains, no blocking toast, refresh status stays subtle | Manual refresh |
  | Loading more | Inline row after the list; existing entries do not jump | None |
  | End of list | Quiet `Semua ucapan sudah ditampilkan` text | None |
- Use this emotional journey: (1) arrival feels personally welcomed through the addressee and clear couple identity; (2) opening feels ceremonial but immediate, with motion never withholding content; (3) scanning feels calm because date, venue, and directions are easy to find; (4) responding feels safe because public visibility, anonymous mode, attendance, and guest count are explicit; (5) completion feels acknowledged through a durable visible post; (6) later return feels familiar because hierarchy and control positions stay stable.
- On mobile 320–479 px use one column, 16 px minimum side gutters, no clipped fixed controls, and full-width form actions where that improves tapping. At 480–767 px retain one reading column with larger gutters. At 768 px and above allow paired event/location layouts only when reading order and 200% zoom remain intact. Cap invitation reading content near 42rem and utility/admin form content near 48rem.
- Use visible persistent labels for every field, help/error text linked with `aria-describedby`, `aria-live=polite` for submit/load results, semantic `main` and section headings, keyboard-operable native controls, visible palette-derived focus rings, and 44×44 px minimum primary targets. Do not auto-focus on page load or move focus on background polling.
- Keep `/admin` a calm utility page: title and one-sentence purpose first, side and guest-name inputs second, generated URL third, then `Salin tautan` as primary and WhatsApp as secondary. Long URLs wrap at safe boundaries inside a selectable region and never create horizontal overflow.
- Theme browser-level details from the established palette: text selection, caret, focus outline, link underline offset, and visited links. Use tabular numerals for countdown/date-like values and avoid gray secondary text on emerald surfaces; tint it from the same hue while meeting contrast.
- Design-review verification must include screenshot comparisons at 320, 390, 430, 768, and 1280 px; 200% text zoom; keyboard-only flow; reduced motion; high-contrast/forced-colors sanity; long/Unicode guest names; all guestbook states; and no horizontal overflow or layout shift when errors and entries appear.
<!-- /autoplan-accepted:design -->

### Phase 2 — Design review

#### System audit and leverage

- UI scope: invitation cover/opened journey, section navigation, guestbook form/list, map/audio/share fallbacks, and public admin link generator.
- No `DESIGN.md` exists. The plan therefore treats `src/app/globals.css`, the three fonts configured in `src/app/layout.tsx`, and existing invitation primitives as the current design vocabulary.
- Existing identity is specific enough to reuse: cream/emerald/gold palette, botanical artwork, Cormorant Infant display type, Pinyon Script accents, Nunito Sans body type, ornament primitives, and a single-column invitation rhythm.
- The gstack designer binary was unavailable, so no mockup was generated or approved. Review stayed text-only; implementation must use current screenshots as visual baselines.

#### Seven-pass scorecard

| Pass | Before | After | Review result |
|---|---:|---:|---|
| 1. Information architecture | 7/10 | 9/10 | Added first/second/third hierarchy for cover, opened invitation, guestbook, and admin. |
| 2. Interaction states | 7/10 | 9/10 | Added user-visible loading, empty, validation, submit, success, rate-limit, outage, partial, load-more, and end states. |
| 3. Journey/emotional arc | 6/10 | 9/10 | Added six-step arc from personal welcome to confident return visit. |
| 4. AI-slop risk | 8/10 | 9/10 | Classified invitation as EXPERIENCE and admin as OPERATE; forbids generic card/grid/gradient treatments and limits authored motion to one moment. |
| 5. Design-system alignment | 6/10 | 8/10 | No formal `DESIGN.md`, but the accepted plan binds implementation to existing type, palette, and ornament vocabulary. |
| 6. Responsive/accessibility | 8/10 | 9/10 | Added intentional viewport behavior, width caps, form semantics, focus/live-region rules, and verification matrix. |
| 7. Unresolved decisions | — | — | 0 unresolved; all additions implement the user's already-approved modern, readable, light, mobile-first direction. |

Overall design score: **6/10 → 8/10** (lowest rated pass). A future `DESIGN.md` would make token governance stronger, but it is not required to implement this single-event product safely.

#### Information architecture

```text
Invitation URL
  -> Cover: couple -> date -> addressee -> Buka Undangan
  -> Essentials: hero/countdown -> events -> location
  -> Story/support: couple -> story -> verse -> dress -> gift/notes
  -> Response: RSVP + public wishes
  -> Closing

/admin
  -> purpose -> side/name inputs -> generated URL -> copy -> WhatsApp
```

#### Journey storyboard

| Step | Visitor does | Intended feeling | Design support |
|---|---|---|---|
| 1 | Opens personal link | Recognized | Addressee plus couple/date visible without delay. |
| 2 | Opens invitation | Ceremonial, not blocked | One short authored transition; content starts visible. |
| 3 | Scans essentials | Oriented | Date, event, venue, directions precede secondary sections. |
| 4 | Reads optional story | Connected | Botanical rhythm and restrained sections, not repeated cards. |
| 5 | Sends RSVP/wish | Informed and safe | Public notice, anonymous choice, exact guest count, clear states. |
| 6 | Sees post/returns | Reassured | Durable entry appears first; stable hierarchy on revisit. |

#### Litmus checks

| Check | Result | Evidence/constraint |
|---|---|---|
| Brand unmistakable on first screen | Yes | Couple names, date, personalized addressee, botanical-gold visual. |
| One strong visual anchor | Yes | Existing couple-card botanical artwork; only one LCP candidate. |
| Scannable by headings | Yes, after hierarchy spec | Essentials precede story/support and response. |
| Each section has one job | Yes | Existing section model retained; no new mixed-purpose dashboard. |
| Cards are necessary | Conditional | Cards only for bounded event/form/list interactions, never default decoration. |
| Motion improves hierarchy | Yes, after constraint | One ≤300 ms entrance; content visible by default. |
| Premium without decorative shadows | Yes | Typography, artwork, spacing, and palette carry identity. |

Hard rejections triggered: **none in the accepted direction**. Outside design voices were unavailable: Claude Code had already failed with connection refusal and no native subagent tool exists, so no cross-model score is claimed.

#### Design implementation tasks

- [ ] **D1 (P1, human ~4h / Codex ~20m)** — Cover/layout — apply the specified first-screen hierarchy and ≤300 ms visible-default motion; verify long names and reduced motion.
- [ ] **D2 (P1, human ~5h / Codex ~25m)** — Guestbook — implement every state in the state contract with stable layout and accessible announcements.
- [ ] **D3 (P1, human ~4h / Codex ~20m)** — Responsive/a11y — implement viewport rules, width caps, labels, focus, targets, landmarks, and 200% zoom behavior.
- [ ] **D4 (P2, human ~2h / Codex ~10m)** — Admin — enforce utility hierarchy, selectable safe URL wrapping, and primary/secondary action order.
- [ ] **D5 (P2, human ~2h / Codex ~10m)** — Browser surfaces — theme selection/caret/focus/visited links and preserve contrast on emerald surfaces.
- [ ] **D6 (P1, human ~5h / Codex ~30m)** — Visual QA — capture and compare target viewport/state screenshots against the current botanical-gold baseline.

Design NOT in scope: a new brand direction, redesigned invitation sections, public moderation UI, or generated mockups. No `TODOS.md` deferral is needed; accepted design work is included directly in implementation tasks.

<!-- autoplan-accepted:dx -->
- Define the developer persona as the solo owner/maintainer using Codex, local Node tooling, Docker, PostgreSQL, and Coolify; optimize for safe repeatable maintenance rather than public SDK adoption.
- Set the fresh-start clock from a clean clone with Node and Docker already installed to a healthy local invitation with migrated PostgreSQL and one verified guestbook write/read. Target under 10 minutes and no more than five copy-paste commands; automated Codex execution should finish materially faster but is not the human TTHW measurement.
- Provide exact package scripts with stable names: `dev`, `lint`, `typecheck`, `test`, `test:integration`, `test:e2e`, `build`, `db:migrate`, `db:status`, `guestbook:list`, `guestbook:export`, and `guestbook:delete`. Every documented command must exist and be exercised in CI or a smoke check.
- Make `.env.example` self-explanatory with required/optional labels, safe placeholder shapes, and comments for `DATABASE_URL`, `RATE_LIMIT_HMAC_SECRET`, `TRUSTED_PROXY_HEADER`, `APP_ORIGIN`, and pool sizing. Add fail-fast server-side environment validation naming the missing key and the exact local/deploy document section to follow, without printing values.
- Add one copy-paste local quick start: `npm ci`; start only the PostgreSQL service through Docker Compose; copy `.env.example` to `.env.local` and fill required placeholders; run `npm run db:migrate`; run `npm run dev`. Show expected readiness output and a curl/browser guestbook verification.
- Standardize public API errors as safe JSON with stable `code`, human-readable `message`, optional field errors, and optional `retryAfter`; keep internal cause/stack only in redacted server logs correlated by a request ID. Document status/code mappings for validation, oversized body, origin rejection, rate limit, database unavailable, and unexpected failure.
- Migration tooling must print current/applied versions, elapsed time, and a clear no-op result; checksum mismatch or failed statement must exit nonzero with the migration filename, safe cause, and recovery command/runbook reference. Never continue startup after a failed migration.
- Owner commands must default to read-only or require an exact UUID. `guestbook:delete -- <uuid>` first displays the selected public fields and requires an explicit `--confirm <uuid>` on a second command; export writes a timestamped file and reports record count/path. Documentation must warn that deletion is irreversible but database backup remains the recovery path.
- Structure docs by task: README quick start and command table; DEPLOY Coolify provisioning/secrets/readiness/rollback; PANDUAN link generation and guestbook owner tasks; runbooks for migration failure, database outage, backup restore, abusive-entry deletion, export, and retention cleanup. Cross-link commands instead of duplicating divergent instructions.
- CI must prove documentation and tooling remain truthful by running clean install, lint, typecheck, unit/integration tests, build, migration twice against empty PostgreSQL, production smoke, and command `--help`/usage checks. A release fails when a documented command is missing or a required environment key is undocumented.
- After implementation, measure the fresh-clone TTHW and run the owner journey without undocumented knowledge; target 8/10 or better DX and record any remaining manual Coolify steps in DEPLOY rather than hiding them.
<!-- /autoplan-accepted:dx -->

### Phase 2.5 — DX review

Mode: **DX POLISH**. Product type: internal personal web app with a small HTTP API and owner maintenance commands, not a public developer platform.

#### Persona and empathy narrative

The maintainer is one person working with Codex. They can run npm and Docker commands but should not need to remember the shape of a connection string, infer whether migrations ran, or edit database rows by hand. Today the docs span local use and Coolify deployment, while the proposed PostgreSQL path introduces secrets, startup ordering, backups, and recovery. The stressful moment is not writing code; it is deploying shortly before the event and wondering whether a green container actually means guest responses are durable. The plan now makes each step observable: environment validation names what is missing, migration output says exactly what happened, readiness distinguishes app from database health, and owner commands show their target before deletion. A successful first run ends with a visible RSVP written to PostgreSQL and read back after refresh. A successful deploy ends with a restore drill, not merely a healthy homepage.

#### Journey and TTHW

| Stage | Maintainer does | Main friction addressed | Planned status |
|---|---|---|---|
| Discover | Reads README architecture/requirements | PostgreSQL and standalone mode could be implicit | Explicit prerequisites and topology |
| Install | `npm ci`, starts local DB | Too many inferred services/env values | Five-command quick start |
| First useful result | Migrates, starts app, writes/reads RSVP | Server-up can hide DB failure | Readiness plus verification step |
| Real usage | Generates links and deploys to Coolify | Docs could drift from actual scripts | Command table and task-based docs |
| Debug | Reads stable error code/request ID | Raw framework/DB errors are unclear or unsafe | Safe public envelope + redacted logs |
| Upgrade | Runs migration/status and deploy checklist | Migration ambiguity risks data | Version/checksum/no-op output and rollback runbook |

Fresh-start target: **under 10 minutes** from clean clone (prerequisites installed) to a successful local guestbook write/read. The magical moment is one command-visible migration followed by a browser RSVP that persists after refresh; no new hosted tooling is needed.

#### Eight-pass scorecard

| DX pass | Before | After | Result |
|---|---:|---:|---|
| 1. Getting started | 5/10 | 8/10 | Exact quick-start boundary, commands, expected result, and time target. |
| 2. API/command design | 7/10 | 9/10 | Stable scripts, safe error envelope, sensible read-only defaults. |
| 3. Errors/debugging | 6/10 | 9/10 | Problem/cause/action output, request IDs, redacted internal logs. |
| 4. Documentation/learning | 6/10 | 9/10 | Task-based ownership across README/DEPLOY/PANDUAN and cross-links. |
| 5. Upgrade/migrations | 7/10 | 9/10 | Version/checksum/status/no-op output and nonzero failure behavior. |
| 6. Environment/tooling | 6/10 | 8/10 | Required env contract, validation, local PostgreSQL, CI truth checks. |
| 7. Community/ecosystem | 8/10 | 8/10 | Not a community product; standard Node/PostgreSQL/Coolify tools suffice. |
| 8. Measurement/feedback | 5/10 | 8/10 | Fresh-clone TTHW and post-implementation owner-journey measurement. |

Overall DX score: **5/10 → 8/10**. TTHW: **unknown/unbounded → target <10 minutes**. Competitive benchmarking is intentionally not used because this is a private app and unlike-for-like public SDK onboarding would be misleading.

#### Three critical error traces

| Path | Public/terminal result | Cause visibility | Recovery |
|---|---|---|---|
| Missing `DATABASE_URL` | Startup exits with named key and doc pointer | Value never printed | Configure local/Coolify secret, restart |
| Migration checksum/failure | Nonzero exit with migration filename and safe reason | Full details stay in protected log | Follow migration rollback/repair runbook |
| Guestbook database outage | API 503 with `GUESTBOOK_UNAVAILABLE` and request ID | Visitor sees no connection detail | Invitation stays usable; operator checks readiness/logs, restores DB |

#### DX implementation tasks

- [ ] **X1 (P1, human ~3h / Codex ~20m)** — Tooling — add and verify the stable package-script command surface.
- [ ] **X2 (P1, human ~4h / Codex ~25m)** — Environment — add documented env contract and fail-fast redacted validation.
- [ ] **X3 (P1, human ~4h / Codex ~25m)** — Errors — implement stable API error codes, request IDs, and safe terminal diagnostics.
- [ ] **X4 (P1, human ~4h / Codex ~25m)** — Migrations — implement status/checksum/no-op output and recovery references.
- [ ] **X5 (P1, human ~4h / Codex ~25m)** — Owner operations — implement safe list/export/two-step delete command UX.
- [ ] **X6 (P2, human ~4h / Codex ~30m)** — Documentation — write one quick start, command table, task-based runbooks, and cross-links.
- [ ] **X7 (P1, human ~5h / Codex ~30m)** — CI/DX verification — run clean-start truth checks and measure fresh-clone TTHW after implementation.

DX NOT in scope: public SDKs, interactive API playground, package publishing, community/support infrastructure, or a custom deployment control plane. No unresolved DX decision remains.

<!-- autoplan-accepted:eng -->
- Run all database code in explicit Node.js runtime server modules. Use one lazily initialized process-wide `pg.Pool` with production defaults `max=5`, bounded connection/idle/query/statement timeouts, application name, TLS controlled by the connection URL, and no per-request pool creation or shutdown.
- Serialize migrations across concurrent replicas with a PostgreSQL advisory lock held on one dedicated client for the entire migration transaction. Validate every applied checksum before new work, apply each pending migration transactionally, release the lock in `finally`, and fail readiness/startup on timeout or error.
- Generate public entry UUIDs in server application code so the schema needs no PostgreSQL extension. Store normalized guest text and validate length by Unicode code points in application code plus database `char_length`/check constraints as defense in depth.
- Make POST idempotency and rate limiting one transaction: attempt the unique `submission_key` insert first; on conflict return the committed existing entry without consuming another limit; for a new row atomically claim both per-client and global limit buckets; rollback the inserted row and counters on any denial/error; commit only after all invariants pass. Test concurrent identical and distinct keys.
- Model rate-limit buckets with `(scope, client_key, window_start)` uniqueness, `count`, and `expires_at`; update counts with one conditional upsert and `RETURNING`, index expiry, and add a daily bounded cleanup command. A failed cleanup must not block submissions, but a failed limit transaction must fail closed with a generic retry response.
- Require POST `Origin` to exactly match configured `APP_ORIGIN`; do not fall back to request `Host`. In production, accept the configured client-address header only after a staging test proves the Coolify proxy overwrites inbound spoofed values. Until verified, use the global limit only and emit one redacted degraded-security warning.
- Encode pagination cursors as versioned base64url JSON containing an ISO timestamp and UUID; decode with strict shape/version/length validation. Query with `WHERE (created_at,id) < ($1,$2) ORDER BY created_at DESC,id DESC LIMIT $3+1`, return at most the requested cap, and never interpolate cursor values.
- Separate `/api/health` liveness from `/api/ready` readiness: liveness proves the Node process can serve without querying PostgreSQL; readiness performs a short-timeout `SELECT 1` and verifies the latest migration version. Coolify routes traffic only on readiness, while liveness prevents a DB outage from causing restart loops.
- Organize server code into narrow modules: `env`, `db/pool`, `db/migrate`, `guestbook/schema`, `guestbook/repository`, `guestbook/rate-limit`, `guestbook/cursor`, `api/errors`, and route handlers. Keep React components unaware of SQL and keep owner scripts importing the same repository contract.
- Use Vitest for pure unit tests and Node/PostgreSQL integration tests, and Playwright for browser flows. Integration tests use an isolated Docker Compose PostgreSQL database with migration-per-suite and deterministic cleanup; tests may not point at a non-test `DATABASE_URL`.
- Gate release on the exact execution path used in production: fresh migration, repeated no-op migration, standalone `node server.js`, liveness/readiness, API contract, two-browser persistence, restart persistence, and additive-schema rollback to the previous application image.
- Bound runtime work: GET limit 1–50 and one indexed query; POST body 4 KiB and constant query count; polling only when visible and not save-data; pool queue/timeouts surface 503 rather than hanging. Capture p95 API duration and pool-timeout counts in structured logs without adding a monitoring platform.
- Treat secret scanning and privacy as release gates: scan `.next`, standalone output, source maps, container history, and logs for configured secret markers; never log guest name/message, raw IP, full personalized URLs, database URLs, request bodies, or idempotency keys.
<!-- /autoplan-accepted:eng -->

### Phase 3 — Engineering review

Mode: **FULL_REVIEW**; scope accepted as-is. The plan spans more than eight files, but its existing workstream boundaries are smaller and safer than merging database, UI, deployment, and verification concerns. No feature cut preserves the approved durable guestbook outcome.

#### Architecture review

The final shape has three boundaries: static/server-rendered invitation content, a Node-only guestbook service boundary, and owner-only shell operations. `/admin` remains a pure browser URL composer with no privilege. PostgreSQL is the sole mutable source of truth.

```text
Browser
  GET invitation/static assets --------------------------> Next.js render/static
  GET /api/guestbook -> cursor validation -> repository -> indexed PostgreSQL read
  POST /api/guestbook
       -> 4 KiB stream cap -> origin/schema/honeypot
       -> derive HMAC client key or global-only degraded mode
       -> BEGIN
          -> INSERT submission key (conflict => existing response)
          -> atomic client/global limit claims
          -> COMMIT durable entry (denial/error => ROLLBACK)
       -> safe response + request ID

Startup: advisory migration lock -> checksum/versioned SQL -> readiness
Owner: list/export/two-step delete scripts -> shared repository -> PostgreSQL
```

Architecture findings resolved in-plan: migration concurrency, pool lifecycle, transactional idempotency/rate limits, trusted-proxy fallback, cursor contract, and liveness/readiness separation.

#### Code-quality review

- Use one validation/schema contract on both route and repository boundaries; database constraints remain defense in depth.
- Keep route handlers thin and map domain results to stable response codes in one error helper.
- Reuse the repository from API and owner scripts; do not share browser formatting code with server persistence merely because field names overlap.
- Remove obsolete auth/code/JSON/OG modules and imports completely; no compatibility adapters.
- Treat `LocationMap` render-time mutation and current eager opened-bundle import as separate root-cause fixes.

No speculative shared-library extraction is approved beyond the server contracts named above; existing client URL/name hooks keep their different browser responsibilities.

#### Test coverage diagram

```text
CODE PATHS                                      USER FLOWS
Guestbook GET                                   Invitation open [E2E]
  |- valid first page [integration]               |- woman/pria/default/Unicode name
  |- valid cursor/next page [integration]          |- visible-default/reduced-motion
  |- invalid cursor [unit+integration]              `- optional bundle failure fallback
  `- DB timeout -> safe 503 [integration]

Guestbook POST                                  RSVP [E2E, two contexts]
  |- content-type/body/origin guards [integration] |- validation and anonymous mode
  |- Unicode normalization/bounds [unit]           |- hadir count 1/10 boundaries
  |- honeypot/min-time [unit+integration]           |- double tap + timeout retry
  |- new key + allowed limits [integration]         |- durable visible success
  |- same key replay/concurrency [integration]      `- offline/503/429 recovery
  |- distinct concurrent keys/limits [integration]
  `- SQL error rollback [integration]

Migration/startup                               Deployment [integration/smoke]
  |- empty/apply/no-op/checksum [integration]       |- clean image + node server.js
  |- two concurrent runners/advisory lock            |- liveness without DB
  `- failure blocks readiness                        |- readiness with version/DB
                                                     `- restart and old-image rollback

Admin/share/map/audio [unit+E2E]
  |- direct URL encoding and WhatsApp format
  |- copy/share fallback
  `- lazy map and audio-decode fallback
```

Each listed test protects an observable contract: duplicate prevention, public API safety, data durability, rollback, or visitor recovery. Smoke-only render assertions do not count as coverage. Tests to retire: any tests tied only to deleted admin-auth, guest-code, JSON guest, or dynamic-OG behavior after their replacement regression assertions exist.

#### Performance review

- Database paths are constant-query-count and bounded by pool/query/statement timeouts; cursor index prevents offset scans.
- Rate-limit cleanup is out of the request critical path and bounded by expiry index/batch size.
- The first viewport avoids database, map, and audio requests; guestbook fetch waits until open/near viewport.
- One LCP image is preloaded, opened/map bundles are deferred, and audio stays gesture-triggered with no preload.
- Performance acceptance uses the original Lighthouse profile and includes resource, query-count, and slow-DB checks. Expected production scale is personal-event traffic; exact requests/second remain unknown until measured.

#### Failure-mode registry

| Failure | Containment | Required proof |
|---|---|---|
| Two replicas migrate together | Advisory lock + checksum | Concurrent migration integration test |
| Pool exhaustion/slow query | Bounded pool and timeouts | Forced saturation returns bounded 503 |
| Same POST retried concurrently | Unique key in one transaction | Exactly one row, same response identity |
| Rate-limit claim fails after insert | Transaction rollback | No row/counter partial commit |
| Proxy header spoofed | Verified overwrite or global-only mode | Staging spoof test |
| Cursor malformed/oversized | Strict decoder and query params | 400 without DB detail |
| DB outage | Readiness fails; liveness and invitation survive | Fault-injection smoke test |
| Old image after additive migration | Backward-compatible schema | Rollback smoke against migrated DB |
| Secret/PII leakage | Redaction and artifact/log scan | CI scan with synthetic canary secrets |

Critical gaps remaining: **0**. Engineering findings mapped into the plan: **13**, all resolved as implementation requirements; unresolved decisions: **0**. Outside voice remains unavailable because Claude Code connection was refused and no native subagent tool is exposed.

#### Engineering implementation tasks

- [ ] **E1 (P0)** — Build server-only env, pool, migration lock/checksum, liveness, and readiness foundation.
- [ ] **E2 (P0)** — Implement schema/indexes, versioned cursor, repository, transactional idempotency/rate limit, and cleanup.
- [ ] **E3 (P0)** — Implement thin API handlers with streamed body cap, exact origin, proxy-degraded mode, and safe errors/logging.
- [ ] **E4 (P0)** — Replace guestbook UI source of truth and implement retry/idempotency/state/accessibility contracts.
- [ ] **E5 (P1)** — Complete obsolete-path deletion, UI bug fixes, lazy loading, LCP, and audio asset optimization.
- [ ] **E6 (P0)** — Add Vitest/Playwright plus isolated PostgreSQL fixtures and the critical-path matrix above.
- [ ] **E7 (P0)** — Prove clean standalone image, concurrent/no-op migrations, restart durability, backup restore, and old-image rollback.
- [ ] **E8 (P1)** — Finish command UX, docs/runbooks, secret/PII scans, TTHW measurement, and staged Coolify verification.

Execution order remains E1 → E2 → E3 → E4, then E5 and owner-doc work may proceed in parallel, followed by E6/E7 release gates and final E8 handoff.

#### Engineering completion summary

The architecture is implementation-ready: PostgreSQL is the only mutable source of truth, database work is confined to Node-only modules, writes have one transactional idempotency/rate-limit boundary, pagination is bounded and indexed, and deployment readiness is distinct from liveness. The saved engineering test plan covers affected routes, value-bearing critical paths, edge cases, tests to retire, and production-path release gates. Thirteen engineering findings are now explicit implementation requirements; zero critical gaps and zero unresolved engineering decisions remain.

### Final-gate reconciliation

#### What already exists and remains reusable

The current invitation shell, botanical-gold visual assets and typography, direct `side`/`to` query model, static event content, map/audio/share affordances, standalone Next.js foundation, and public admin generator remain the base. The work removes or replaces only stale auth/code/JSON/dynamic-OG/localStorage paths and fixes identified rendering, accessibility, security, deployment, and performance defects.

#### Review completion summaries

- **CEO:** Scope remains a private single-event invitation. Eight adjacent safeguards were accepted because they directly protect the approved public durable guestbook; platform features stay excluded.
- **Design:** Seven dimensions were reviewed; the plan moved from 6/10 to 8/10 by specifying hierarchy, complete states, responsive behavior, accessible interactions, and visual-regression checks while preserving the established identity.
- **DX:** Eight dimensions were reviewed; the plan moved from 5/10 to 8/10 with a target fresh-clone TTHW under 10 minutes, stable commands, truthful environment/docs, safe diagnostics, and owner runbooks.
- **Engineering:** Thirteen findings were mapped into concrete requirements and a saved test plan. Critical gaps: 0. Unresolved decisions: 0.

#### Voice coverage and consensus

| Phase | Primary host review | Outside Claude Code | Native subagent | Findings/score | Consensus |
|---|---|---|---|---|---|
| CEO | Completed in Codex | Unavailable: connection refused | Unavailable | 8 safeguards accepted | N/A; voice coverage missing |
| Design | Completed in Codex | Unavailable | Unavailable | 6/10 → 8/10 | N/A; voice coverage missing |
| DX | Completed in Codex | Unavailable | Unavailable | 5/10 → 8/10, TTHW target <10 min | N/A; voice coverage missing |
| Engineering | Completed in Codex | Unavailable | Unavailable | 13 mapped, 0 critical/unresolved | N/A; voice coverage missing |

No external or native-subagent agreement is claimed. Missing voices are a review-coverage limitation, not an unresolved product or architecture decision.

#### Cross-phase themes

- **Durability and truthful recovery:** CEO, DX, and Engineering independently require migrated PostgreSQL, observable readiness, backup/restore proof, and no misleading local success.
- **Bounded public input:** CEO and Engineering require streamed size limits, validation, idempotency, transactional rate limits, verified proxy trust, safe errors, and privacy-safe logs.
- **Immediate but graceful experience:** CEO and Design require visible critical content, explicit public-post consent, predictable states, reduced motion, and failure isolation; Engineering and performance review bind these to lazy loading and production tests.
- **Operational truth:** DX and Engineering require documented commands to match CI, standalone startup, migrations, owner maintenance, and Coolify behavior.

#### Explicit exclusions confirmed at final gate

No admin authentication, guest short codes, moderation dashboard, realtime transport, multi-tenant/CMS/billing platform, custom observability platform, or complete redesign is introduced. Compatibility means a readable graceful fallback outside the supported target, not identical behavior on every obsolete browser.

<!-- AUTONOMOUS DECISION LOG -->
## Decision Audit Trail

| # | Phase | Decision | Classification | Principle | Rationale | Rejected |
|---:|---|---|---|---|---|---|
| 1 | CEO | Keep the product private and single-event | User choice | Solve the actual problem | Platform scope adds no value for this invitation | Multi-tenant/CMS product |
| 2 | CEO | Keep `/admin` public and utility-only | User choice | Least privilege by design | Link composition is not privileged and exposes no stored data | Reintroducing admin auth |
| 3 | CEO | Show guestbook entries publicly and immediately | User choice | Honor explicit intent | Public shared wishes are the desired experience | Moderation queue/private list |
| 4 | Design | Preserve a modern botanical-gold identity | User taste | Preserve product character | Clarity and speed should not flatten the invitation into a generic page | Visual rewrite/generic SaaS styling |
| 5 | CEO | Preserve anonymous mode and attendance-dependent count | Auto-decided | Preserve accepted behavior | Existing form behavior is within the requested change radius | Silent feature removal |
| 6 | CEO | Store exact guest count 1–10 | Auto-decided | Prefer unambiguous data | Exact counts are more useful than `3+` and remain compact | Bucketed count labels |
| 7 | CEO | Require client UUID idempotency keys | Auto-decided | Prevent duplicate durable writes | Retries and double taps must resolve to one entry | Optimistic client-only dedupe |
| 8 | CEO | Enforce an incremental 4 KiB body cap | Auto-decided | Bound untrusted work | `Content-Length` alone cannot protect chunked uploads | Header-only size check |
| 9 | CEO | Verify proxy overwrite before trusting client address | Auto-decided | Do not trust ambient headers | Forwarded values are spoofable without a proven proxy boundary | Blind `x-forwarded-for` trust |
| 10 | CEO | Use proportionate logs, backup, restore, and owner scripts | Auto-decided | Boring reliable operations | Durable public data needs recovery without a dashboard | No recovery plan/custom ops platform |
| 11 | Design | Make critical cover content visible within 300 ms | Auto-decided | Content before choreography | The invitation should feel ceremonial without withholding its purpose | 1.1 s staged reveal |
| 12 | Design | Define one complete guestbook state contract | Auto-decided | Every async state is designed | Loading, validation, outage, retry, pagination, and success must remain stable | Ad-hoc toasts/spinners |
| 13 | Design | Bind layout to mobile-first viewport and zoom rules | Auto-decided | Smallest useful screen first | Predictability on 320 px and 200% zoom is an explicit requirement | Desktop-first shrink-down |
| 14 | Design | Keep invitation and admin as EXPERIENCE/OPERATE surfaces | Auto-decided | Match visual treatment to purpose | Emotional invitation and utility generator need different hierarchy within one palette | One generic component aesthetic |
| 15 | DX | Standardize the npm command surface | Auto-decided | Make the paved path executable | Owner and CI should invoke the same named operations | Undocumented one-off commands |
| 16 | DX | Fail fast on invalid environment without printing values | Auto-decided | Errors should state action safely | Missing deployment configuration must be obvious without leaking secrets | Late opaque runtime failures |
| 17 | DX | Use stable safe API errors and request IDs | Auto-decided | Separate public recovery from internal diagnosis | Visitors need actionable states while logs retain redacted causes | Raw framework/database errors |
| 18 | DX | Require safe two-step deletion and timestamped export | Auto-decided | Destructive owner actions need a preview | Public admin must not gain moderation privilege | Public delete UI/direct ad-hoc SQL |
| 19 | Engineering | Use one bounded process-wide `pg.Pool` | Auto-decided | Bound scarce resources | Per-request pools can exhaust PostgreSQL and complicate shutdown | Pool per request |
| 20 | Engineering | Serialize checksum migrations with an advisory lock | Auto-decided | Deployment must be replica-safe | Concurrent Coolify replicas cannot race schema changes | Unlocked startup migration |
| 21 | Engineering | Put insert, idempotency, and both limits in one transaction | Auto-decided | Commit invariants atomically | A denied or failed request must leave neither a row nor partial counters | Separate best-effort operations |
| 22 | Engineering | Use strict versioned keyset cursors | Auto-decided | Keep reads stable and bounded | Composite ordering avoids skips and offset degradation | Offset pagination/unvalidated cursor |
| 23 | Engineering | Split process liveness from database readiness | Auto-decided | Report the right failure domain | DB outages should stop traffic without causing restart loops | One ambiguous health endpoint |
| 24 | Engineering | Test against isolated PostgreSQL and the production standalone path | Auto-decided | Test what ships | Mocks alone cannot prove migrations, concurrency, durability, or rollback | Unit-only verification |
| 25 | Engineering | Make privacy/artifact scans release gates | Auto-decided | Secrets and guest content stay server-side | Build output, image history, and logs are common leak paths | Source review alone |
| 26 | Cross-phase | Defer realtime, moderation, analytics, and platformization | Auto-decided | Complexity must earn its place | None is needed for the approved personal invitation outcome | Scope expansion |

## GSTACK REVIEW REPORT

| Review | Trigger | Why | Runs | Status | Findings |
|--------|---------|-----|------|--------|----------|
| CEO Review | `/plan-ceo-review` via `/autoplan` | Scope & strategy | 1 | CLEAR | 8 adjacent safeguards accepted, platform expansion deferred |
| Outside Review | Claude Code | Independent second opinion | 1 attempt | UNAVAILABLE | Connection refused; no native subagent runtime exposed |
| Eng Review | `/plan-eng-review` via `/autoplan` | Architecture & tests (required) | 1 | CLEAR | 13 findings mapped to requirements; 0 critical gaps, 0 unresolved |
| Design Review | `/plan-design-review` via `/autoplan` | UI/UX gaps | 1 | CLEAR | score 6/10 → 8/10, 10 design requirements added |
| DX Review | `/plan-devex-review` via `/autoplan` | Developer/owner operations | 1 | CLEAR | score 5/10 → 8/10, TTHW unknown → target <10 min |

**OUTSIDE COVERAGE:** Claude Code CEO/design coverage unavailable due connection refusal; native subagent unavailable. Primary reviews continue with missing voice coverage recorded.

**VERDICT:** CEO + DESIGN + DX + ENG CLEARED. The plan is ready for explicit user approval before implementation; no application source code changed during planning.

NO UNRESOLVED DECISIONS
