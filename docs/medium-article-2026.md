# Kong API Gateway Revisited: Modernisasi PoC 2018 ke Kong Gateway OSS 3.9.3

Pada tahun 2018 saya pernah membuat PoC sederhana mengenai Kong sebagai Microservice API Gateway. Waktu itu saya menggunakan Node.js API sederhana, Docker, PostgreSQL, Kong, dan konfigurasi melalui Admin API/Postman.

Tulisan lamanya masih ada di sini:

- Kong - The Microservice API Gateway: https://medium.com/@far3ns/kong-the-microservice-api-gateway-526c4ca0cfa6
- Kong - OAuth 2.0 Plugin: https://medium.com/@far3ns/kong-oauth-2-0-plugin-38faf938a468
- Repo PoC lama: https://github.com/faren/NodeJS-API-KONG

Delapan tahun kemudian, ecosystem Kong sudah banyak berubah. Konsep dasarnya masih sama, tetapi cara deployment, cara konfigurasi, dan pola operasionalnya sudah jauh lebih modern. Karena itu saya mencoba melakukan modernisasi PoC lama tersebut menggunakan stack yang lebih relevan untuk hari ini.

Repo modernisasi:

https://github.com/faren/NodeJS-API-KONG

## Apa yang Ingin Dibuktikan

PoC ini bukan bertujuan membuat aplikasi Node.js yang kompleks. Backend API-nya tetap sengaja dibuat sederhana supaya fokus pembelajaran tetap berada di Kong Gateway.

Yang ingin dibuktikan:

- Kong bisa menjadi API Gateway di depan backend service.
- Service dan Route bisa didefinisikan secara deklaratif.
- Plugin dapat dipasang tanpa mengubah kode backend.
- Kong dapat menjalankan policy seperti rate limit, API key, ACL, correlation id, dan metrics.
- Konfigurasi gateway bisa disimpan sebagai file sehingga lebih mudah masuk ke Git, code review, dan CI/CD.

## Perbandingan dengan PoC 2018

PoC 2018 menggunakan:

- Node.js image `node:carbon`
- Express 4
- `body-parser`
- Kong dengan PostgreSQL
- Konfigurasi melalui Admin API/Postman collection

PoC versi baru menggunakan:

- Node.js 22
- Express 5
- Docker Compose
- Kong Gateway OSS 3.9.3
- DB-less declarative configuration
- Konfigurasi Kong dalam `kong/kong.yml`
- Automated test menggunakan `node:test` dan `supertest`

Perubahan paling penting adalah perpindahan dari konfigurasi imperative via Admin API menjadi declarative configuration.

## Arsitektur Sederhana

Alurnya seperti ini:

```text
Client / curl
  -> Kong Gateway :8000
  -> Node.js API :10000
  -> Kong Gateway
  -> Client
```

Jika akses langsung ke backend:

```bash
curl http://localhost:10000/api/v1/customers
```

Jika akses melalui Kong:

```bash
curl http://localhost:8000/api/v1/customers
```

Response body-nya sama, tetapi response dari Kong memiliki header tambahan seperti:

```text
Server: kong/3.9.3
Via: 1.1 kong/3.9.3
X-Kong-Upstream-Latency
X-Kong-Proxy-Latency
X-Request-Id
X-RateLimit-...
```

Header tersebut menunjukkan bahwa request sudah melewati Kong Gateway.

## Konsep Utama Kong

Untuk mulai belajar ulang Kong, ada tiga konsep utama yang perlu dipegang terlebih dahulu.

### Service

Service adalah backend atau upstream API yang akan dituju oleh Kong.

Contoh:

```yaml
services:
  - name: nodejs-api
    url: http://api:10000
```

Artinya Kong mengenal backend bernama `nodejs-api` dengan alamat `http://api:10000`.

Dalam konteks Docker Compose, `api` adalah nama service container Node.js.

### Route

Route adalah aturan path, host, atau method yang digunakan Kong untuk menentukan request harus diteruskan ke Service mana.

Contoh:

```yaml
routes:
  - name: customers-v1-public
    paths:
      - /api/v1/customers
    strip_path: false
```

Artinya request ke:

```text
http://localhost:8000/api/v1/customers
```

akan diteruskan ke backend:

```text
http://api:10000/api/v1/customers
```

### Plugin

Plugin adalah fitur tambahan di Kong Gateway. Dengan plugin, kita bisa menambahkan policy tanpa mengubah kode backend.

Contoh plugin yang digunakan dalam PoC ini:

- `correlation-id`
- `rate-limiting`
- `request-size-limiting`
- `prometheus`
- `key-auth`
- `acl`

Contoh konfigurasi global plugin:

```yaml
plugins:
  - name: correlation-id
    config:
      header_name: X-Request-Id
      generator: uuid
      echo_downstream: true

  - name: rate-limiting
    config:
      minute: 60
      policy: local
```

Dengan konfigurasi ini, Kong akan menambahkan request id dan membatasi request per menit.

## Menjalankan PoC

Clone repo:

```bash
git clone https://github.com/faren/NodeJS-API-KONG.git
cd NodeJS-API-KONG
```

Jalankan stack:

```bash
docker compose up --build
```

Kong akan expose beberapa port:

- Proxy: http://localhost:8000
- Admin API lokal: http://localhost:8001
- Status API: http://localhost:8100

Backend Node.js juga dibuka langsung untuk pembanding:

- API langsung: http://localhost:10000

## Test Public Route

Request langsung ke Node.js API:

```bash
curl http://localhost:10000/api/v1/customers
```

Request melalui Kong:

```bash
curl -i http://localhost:8000/api/v1/customers
```

Jika berhasil, response akan berisi data customers dan header dari Kong.

## Test Secured Route

PoC ini juga menyediakan route secured dengan plugin `key-auth` dan `acl`.

Tanpa API key:

```bash
curl -i http://localhost:8000/secure/api/v1/customers
```

Hasilnya:

```text
HTTP/1.1 401 Unauthorized
```

Dengan API key:

```bash
curl -i http://localhost:8000/secure/api/v1/customers \
  -H "apikey: internal-demo-key"
```

Hasilnya:

```text
HTTP/1.1 200 OK
```

Ini menunjukkan Kong dapat memvalidasi consumer sebelum request diteruskan ke backend.

## Consumer dan ACL

Di Kong, Consumer merepresentasikan pengguna aplikasi, partner, sistem internal, atau client yang mengakses API.

Contoh:

```yaml
consumers:
  - username: bpjs-internal-app
    keyauth_credentials:
      - key: internal-demo-key
    acls:
      - group: internal-apps
```

Artinya ada consumer bernama `bpjs-internal-app` yang memiliki API key `internal-demo-key` dan masuk ke group ACL `internal-apps`.

Route secured hanya mengizinkan consumer dari group tersebut.

## Metrics

PoC ini juga mengaktifkan plugin Prometheus.

Metrics bisa dicek dengan:

```bash
curl http://localhost:8001/metrics
```

Dalam production, metrics ini dapat dikirim ke Prometheus dan divisualisasikan di Grafana.

## Kenapa DB-less?

Pada PoC lama, Kong menggunakan PostgreSQL sebagai datastore. Cara itu masih valid untuk banyak kebutuhan, tetapi untuk belajar ulang dan PoC modern, DB-less mode lebih sederhana.

Dengan DB-less mode:

- Tidak perlu menjalankan database.
- Konfigurasi disimpan dalam file.
- Perubahan bisa direview di Git.
- Cocok untuk belajar declarative configuration.
- Cocok untuk memperkenalkan pola GitOps.

Namun DB-less bukan jawaban untuk semua skenario. Untuk environment enterprise atau core workload, perlu dipertimbangkan mode lain seperti traditional mode, hybrid mode, atau Kong Konnect.

## Catatan untuk Skala Enterprise

Untuk skala organisasi besar, API Gateway bukan hanya masalah routing. Yang lebih penting adalah operating model.

Hal-hal yang perlu dipikirkan:

- Bagaimana service didaftarkan?
- Siapa yang boleh mengubah route dan plugin?
- Bagaimana approval konfigurasi production?
- Bagaimana audit log perubahan?
- Bagaimana integrasi dengan IAM atau SSO?
- Bagaimana monitoring, logging, dan tracing?
- Bagaimana rate limit antar channel atau partner?
- Bagaimana disaster recovery?
- Bagaimana strategi migrasi dari legacy ke microservice?

Pada skala seperti ini, Kong dapat menjadi enabler untuk transisi microservice secara bertahap. Backend lama bisa tetap berjalan, sementara API baru atau microservice baru dapat diperkenalkan sedikit demi sedikit di belakang gateway.

## Penutup

Setelah delapan tahun, konsep dasar Kong masih terasa familiar: Service, Route, Consumer, dan Plugin. Tetapi cara mengelolanya sudah lebih matang.

Jika dulu PoC cukup membuktikan bahwa Kong bisa meneruskan request ke Node.js API, versi modern ini mulai memperkenalkan pola yang lebih dekat dengan kebutuhan production:

- declarative configuration
- plugin-based policy
- API key dan ACL
- rate limit
- correlation id
- metrics
- automated test
- Docker Compose based local environment

PoC ini adalah langkah awal untuk belajar ulang Kong Gateway secara bertahap sebelum masuk ke topik yang lebih serius seperti OIDC/JWT, OpenAPI, decK, Redis-backed rate limiting, observability stack, Kubernetes Ingress Controller, hybrid mode, dan Kong Konnect.

