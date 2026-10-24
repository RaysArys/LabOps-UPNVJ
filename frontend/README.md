# Frontend LabOps FIK

Vue 3, Vite, dan TypeScript. Untuk menjalankan seluruh sistem, ikuti [README utama](../README.md).

## Development

Prasyarat: Node.js 22 dan backend yang sudah berjalan.

```bash
npm ci
npm run dev
```

Buka http://localhost:3001. Atur autentikasi dan URL service melalui `.env` lokal atau konfigurasi runtime Docker.

## Pemeriksaan

```bash
npm run typecheck
npm run build
```

Build produksi tersedia di `dist/`. Untuk mengganti foto login, ganti `public/lab-photo.jpg`.
