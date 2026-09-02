# NodeJS API Kong Modern PoC

Modern Node.js API Gateway PoC with Kong OSS, DB-less declarative config, Docker Compose, and plugin examples.

Modernisasi dari PoC **NodeJS-API-KONG** tahun 2018 menjadi baseline belajar ulang Kong Gateway untuk kebutuhan API gateway, microservice transition, dan pilot enterprise/non-core workload.

- Artikel awal: https://medium.com/@far3ns/kong-the-microservice-api-gateway-526c4ca0cfa6
- Repo awal: https://github.com/faren/NodeJS-API-KONG

Versi ini sengaja dibuat sebagai baseline belajar ulang Kong Gateway modern:

- Node.js 22
- Express 5
- Docker Compose
- Kong Gateway OSS 3.9.3
- DB-less declarative configuration
- Plugin demo: correlation-id, rate-limiting, request-size-limiting, prometheus, key-auth, ACL

## GitHub Description

Gunakan ini untuk field **About / Description** di GitHub:

```text
Modern Node.js API Gateway PoC with Kong OSS, DB-less declarative config, Docker Compose, and plugin examples.
```

## Kenapa Berubah dari Versi 2018

PoC 2018 memakai:

- `node:carbon`
- Express 4.16
- `body-parser`
- Kong dengan PostgreSQL
- konfigurasi via Admin API/Postman collection

PoC modern ini memakai DB-less mode supaya semua konfigurasi gateway ada di `kong/kong.yml`. Ini lebih enak untuk belajar ulang, code review, GitOps, dan CI/CD.

## Menjalankan

```bash
docker compose up --build
```

PoC ini memakai image OSS `kong/kong:3.9.3`. Jika ingin mengeksplor Kong Gateway Enterprise/Konnect packaging, ganti image ke `kong/kong-gateway:<version>` dan ikuti kebutuhan lisensi sesuai dokumentasi Kong.

Kong akan expose:

- Proxy: http://localhost:8000
- Admin API lokal: http://localhost:8001
- Status API: http://localhost:8100

API Node.js juga dibuka langsung untuk pembanding:

- API langsung: http://localhost:10000

## Test API Langsung

```bash
curl http://localhost:10000/health
curl http://localhost:10000/api/v1/customers
curl http://localhost:10000/api/v1/customers/5
curl http://localhost:10000/api/v1/clients
curl http://localhost:10000/api/v1/clients/1
```

## Test Lewat Kong

Public route:

```bash
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/customers
curl http://localhost:8000/api/v1/customers/5
curl http://localhost:8000/api/v1/clients
curl http://localhost:8000/api/v1/clients/1
```

Secured route tanpa API key akan ditolak:

```bash
curl -i http://localhost:8000/secure/api/v1/customers
```

Secured route dengan API key:

```bash
curl -i http://localhost:8000/secure/api/v1/customers \
  -H "apikey: internal-demo-key"
```

## Cek Kong

```bash
curl http://localhost:8001
curl http://localhost:8001/services
curl http://localhost:8001/routes
curl http://localhost:8001/plugins
curl http://localhost:8001/consumers
```

Metrics Prometheus:

```bash
curl http://localhost:8001/metrics
```

## Catatan Production

Setup ini untuk belajar dan pilot lokal. Untuk environment production/core workload, minimal perlu dibahas lagi:

- hybrid mode atau Konnect
- TLS/mTLS
- SSO/RBAC/audit log
- secret management
- centralized logging
- Prometheus/Grafana/OpenTelemetry
- rate limiting dengan backend Redis
- multi-node gateway
- CI/CD dengan declarative config validation
- environment separation dev/staging/prod
