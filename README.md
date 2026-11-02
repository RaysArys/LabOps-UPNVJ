# LabOps UPNVJ

Aplikasi operasional laboratorium dengan frontend Vue, API NestJS, PostgreSQL, Keycloak, dan Mailpit.

## Jalankan

Prasyarat: Docker Engine/Desktop dan Docker Compose v2.

```bash
docker compose up -d --build
docker compose ps
```

Buka aplikasi setelah backend dan Keycloak siap:

| Layanan | Alamat |
|---|---|
| Aplikasi | http://localhost:3001 |
| API | http://localhost:3000 |
| Keycloak | http://localhost:8080 |
| Mailpit | http://localhost:8025 |

Login memakai akun pada [docs/AKUN_UJI.md](docs/AKUN_UJI.md). Atur port dan alamat LAN melalui `.env`; ikuti [panduan deployment](docs/DEPLOYMENT_LAN.md).

## Autentikasi Lokal

Mode default menggunakan Keycloak. Untuk development lokal, atur di `.env`:

```env
AUTH_STRATEGY=local
ALLOW_TRIAL_SEED=true
TRIAL_PASSWORD=<password-uji>
```

Terapkan dengan membuat ulang frontend dan backend:

```bash
docker compose up -d --build --force-recreate backend frontend
```

Gunakan email akun uji dan `TRIAL_PASSWORD` untuk login. Jangan aktifkan `ALLOW_TRIAL_SEED` di production.

## Tes

Jalankan unit test backend dari PowerShell:

```powershell
cd backend
npm.cmd test -- --runInBand
npm.cmd test -- --runInBand --coverage
```

Perintah kedua membuat laporan HTML di `backend/coverage/lcov-report/index.html`. Untuk langkah black-box, skenario uji, dan format pencatatan hasil, lihat [panduan pengujian](docs/TESTING.md). Unit test ini bukan pengganti pengujian manual seluruh alur aplikasi.

## Catatan

Untuk deployment LAN, ikuti [docs/DEPLOYMENT_LAN.md](docs/DEPLOYMENT_LAN.md). Ini environment trial, bukan production; siapkan HTTPS, pengelolaan secret, backup, monitoring, dan SMTP sebelum go-live.
