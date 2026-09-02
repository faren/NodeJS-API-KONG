# Upgrade Notes from 2018 PoC

## Application

- `index.js` dipindah ke `src/server.js`.
- `node:carbon` diganti ke `node:22-alpine`.
- `body-parser` dihapus karena Express sudah punya `express.json()`.
- Lookup `/:id` diperbaiki dari akses array index menjadi pencarian berdasarkan field `id`.
- Ditambahkan `/health` untuk health check container dan gateway.
- Ditambahkan `helmet` dan `morgan` sebagai baseline security header dan access logging.

## Kong

- PostgreSQL tidak dipakai di baseline modern ini.
- Kong jalan dengan `KONG_DATABASE=off`.
- Semua Service, Route, Plugin, Consumer, credential, dan ACL ditulis declarative di `kong/kong.yml`.
- Admin API hanya bind ke `127.0.0.1:8001` dari host melalui Docker Compose.
- Docker image dipin ke `kong/kong:3.9.3` sebagai image OSS terbaru yang tersedia di Docker Hub saat upgrade ini dibuat.

## Next Upgrade Candidate

- Tambahkan OpenAPI spec.
- Tambahkan test endpoint dan contract test.
- Tambahkan decK untuk workflow traditional/hybrid mode.
- Tambahkan Redis-backed rate limiting untuk simulasi multi-node.
- Tambahkan OIDC/JWT flow untuk simulasi enterprise IAM.
- Tambahkan observability stack: Prometheus, Grafana, OpenTelemetry collector.
