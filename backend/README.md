# Backend LabOps FIK

NestJS API untuk LabOps FIK. Untuk menjalankan seluruh sistem, ikuti [README utama](../README.md).

## Development

Prasyarat: Node.js 22, PostgreSQL, dan konfigurasi database/autentikasi. Lihat [panduan deployment](../docs/DEPLOYMENT_LAN.md).

```bash
npm ci
npm run start:dev
```

API berjalan di http://localhost:3000.

## Database

Jalankan migration secara manual untuk backend lokal:

```bash
npm run typeorm:run
```

Container Docker menjalankan migration otomatis saat start.

## Pemeriksaan

```bash
npm test -- --runInBand
npm run test:e2e
npm run build
```