# 🌴 Liburan Pintar — AI-Powered Travel Planner

> **Sistem Rekomendasi Perjalanan Cerdas** yang menggabungkan beberapa algoritma Kecerdasan Artifisial (Hash Indexing, Weighted Scoring, Beam Search, A*, UCS, dan Cosine Similarity) untuk menghasilkan itinerary liburan yang optimal berdasarkan budget, preferensi, dan lokasi pengguna.


---

## 📑 Daftar Isi

- [Overview](#-overview)
- [Pipeline Algoritma AI](#-pipeline-algoritma-ai)
- [Tech Stack](#-tech-stack)
- [Prasyarat](#-prasyarat)
- [Instalasi & Menjalankan](#-instalasi--menjalankan)
- [Environment Variables](#-environment-variables)
- [Struktur Proyek](#-struktur-proyek)
- [Fitur Aplikasi](#-fitur-aplikasi)
- [API Endpoints](#-api-endpoints)
- [Skema Database](#-skema-database)
- [Keamanan](#-keamanan)
- [Lisensi](#-lisensi)

---

## 🔭 Overview

**Liburan Pintar** adalah aplikasi web berbasis Next.js yang membantu pengguna merencanakan liburan secara otomatis. Pengguna cukup memasukkan:

| Input | Contoh |
|-------|--------|
| 💰 Budget total | Rp 3.000.000 |
| 📅 Durasi perjalanan | 2D1N, 3D2N, Custom |
| 🏙️ Kota asal | Surabaya, Jakarta, Bandung, ... |
| ❤️ Preferensi | Gunung, Pantai, Kuliner, Budaya, Keluarga |

Sistem kemudian menjalankan **pipeline 6 modul AI** untuk menghasilkan:
- ✅ Rekomendasi destinasi & hotel terbaik (dengan data real-time dari Booking.com API)
- ✅ Itinerary harian lengkap dengan estimasi waktu & biaya
- ✅ Alternatif destinasi berdasarkan kemiripan (Cosine Similarity)
- ✅ Breakdown biaya: transport, hotel, makan, tiket

---

## 🧠 Pipeline Algoritma AI

Berikut urutan modul AI yang digunakan dari input hingga output:

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USER INPUT                                   │
│  budget, durasi, kota asal, preferensi                              │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 1 — Hash Indexing                                            │
│  Mengindeks akomodasi ke dalam hash bucket menggunakan              │
│  character-weighted hash: h(s) = Σ(charCode × (i+1)) mod M         │
│  Tujuan: akses O(1) untuk lookup dan deduplikasi                    │
│  📄 lib/Algorithms.ts → formulaHash()                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 2 — Weighted Scoring                                         │
│  Menghitung skor destinasi:                                         │
│  score = w₁·nBudget + w₂·nTag + w₃·nDist                           │
│         (0.5)         (0.3)      (0.2)                              │
│  Hard filter: eliminasi destinasi yang melebihi budget              │
│  📄 lib/Algorithms.ts → weightedScore()                             │
│  📄 lib/weightedScore/estimator.ts → estimateTotalCost()            │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 3 — Beam Search (Itinerary per Hari)                         │
│                                                                     │
│  3A. Fitness Score h(n):                                            │
│      0.25·pref + 0.20·vibe + 0.20·budget + 0.15·rating             │
│      + 0.10·popularity + 0.10·familyFriendly                       │
│                                                                     │
│  3B. Hard Constraints Filter:                                       │
│      - Jam operasional (openHour–closeHour)                         │
│      - Maks 50 km/hari (Haversine + faktor 1.25)                   │
│      - Family-friendly filter                                       │
│      - Tidak boleh mengunjungi POI yang sama                        │
│                                                                     │
│  3C. Beam Search (width = 8):                                       │
│      f(n) = h(n) − g(n)/budget                                     │
│      Ekspansi per step, simpan top-8 beam, pilih rute terbaik      │
│  📄 lib/Algorithms.ts → beamSearchDay()                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 3 (Varian UCS) — Uniform Cost Search                        │
│  Alternatif dari Beam Search yang murni berbasis cost aktual:       │
│  g(n) = w_budget·normBudget + w_dist·normDist + w_time·normTime    │
│  Prioritas: cost kumulatif terendah (ascending sort)                │
│  📄 lib/algorithms_ucs.ts → ucsDay()                               │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 3 (Varian A*) — A* Search                                   │
│  Pencarian rute optimal antar lokasi:                               │
│  f(n) = g(n) + h(n)                                                │
│  g(n) = jarak aktual kumulatif (Haversine)                          │
│  h(n) = jarak heuristik ke tujuan (Haversine)                      │
│  📄 lib/a-star.ts → findOptimalRouteAStar()                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│  MODUL 4 — Cosine Similarity                                       │
│  Mencari alternatif destinasi yang mirip:                           │
│  sim(A,B) = (A·B) / (‖A‖ × ‖B‖)                                   │
│  Vektor fitur: [nBudget, nTag, nDist]                               │
│  📄 lib/Algorithms.ts → cosineSimilarity()                          │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         OUTPUT                                      │
│  Rekomendasi utama + itinerary + alternatif + breakdown biaya       │
└─────────────────────────────────────────────────────────────────────┘
```

### Ringkasan Formula

| Modul | Algoritma | Formula / Mekanisme |
|-------|-----------|---------------------|
| 1 | Hash Indexing | `h(s) = Σ charCode(s[i]) × (i+1) mod M` |
| 2 | Weighted Scoring | `0.5·nBudget + 0.3·nTag + 0.2·nDist` |
| 3A | Fitness Score | `0.25·pref + 0.20·vibe + 0.20·budget + 0.15·rating + 0.10·pop + 0.10·fam` |
| 3B | Constraints | Jam buka, ≤50 km/hari, family-safe, no revisit |
| 3C | Beam Search | `f(n) = h(n) − g(n)/budget`, beam width = 8 |
| 3 (UCS) | Uniform Cost Search | `g(n) = 0.5·normBudget + 0.3·normDist + 0.2·normTime` |
| 3 (A*) | A* Search | `f(n) = g(n) + h(n)`, Haversine heuristic |
| 4 | Cosine Similarity | `cos(θ) = (A·B) / (‖A‖‖B‖)` |

### Helper: Haversine Distance

Digunakan oleh semua modul untuk menghitung jarak antar koordinat (km):

```
d = R × 2 × atan2(√a, √(1−a)) × faktor_koreksi
a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlon/2)
R = 6371 km, faktor_koreksi = 1.25 (koreksi jalan berliku)
```

---

## 🛠️ Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| **Framework** | [Next.js 14](https://nextjs.org/) — App Router |
| **Bahasa** | [TypeScript](https://www.typescriptlang.org/) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) |
| **ORM** | [Prisma 7](https://www.prisma.io/) + PostgreSQL |
| **Autentikasi** | JWT + PBKDF2 (SHA-256, 100k iterasi) + Session Cookie |
| **Icons** | [lucide-react](https://lucide.dev/) |
| **State Management** | React Context API |
| **API Eksternal** | Booking.com (RapidAPI), Skyscanner (RapidAPI), OpenTripMap |

---

## 📋 Prasyarat

Pastikan sudah terinstal di mesin lokal:

- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- **PostgreSQL** ≥ 14.x (running di `localhost:5432`)

---

## 🚀 Instalasi & Menjalankan

```bash
# 1. Clone repository
git clone <repository-url>
cd orang-aneh-pengen-liburan

# 2. Install dependencies
npm install

# 3. Setup database
#    Pastikan PostgreSQL berjalan, lalu buat database:
#    CREATE DATABASE plenger;

# 4. Konfigurasi environment variables
#    Salin .env.example menjadi .env dan isi dengan nilai yang sesuai
cp .env.example .env

# 5. Jalankan Prisma migration
npx prisma generate
npx prisma db push

# 6. Jalankan development server
npm run dev
```

Buka **http://localhost:3000** di browser.

---

## 🔐 Environment Variables

Buat file `.env` di root project dengan variabel berikut:

```env
# Database PostgreSQL
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/plenger?schema=public"

# Secret untuk JWT session token
JWT_SECRET="<random-hex-string-64-chars>"

# RapidAPI Key (Booking.com & Skyscanner)
RAPIDAPI_KEY="<your-rapidapi-key>"

# OpenTripMap API Key (untuk fetch POI/destinasi)
OPENTRIPMAP_KEY="<your-opentripmap-key>"
```

> ⚠️ **Penting:** Jangan pernah commit file `.env` ke repository. Pastikan `.env` sudah ada di `.gitignore`.

---

## 📁 Struktur Proyek

```
orang-aneh-pengen-liburan/
│
├── app/                              # Next.js App Router
│   ├── layout.tsx                    # Root layout + AuthProvider wrapper
│   ├── globals.css                   # Global styles (Tailwind)
│   ├── page.tsx                      # 🏠 Landing page + featured destinations
│   ├── middleware.ts                 # Route protection (JWT cookie check)
│   │
│   ├── login/
│   │   └── page.tsx                  # 🔑 Login & Register form
│   │
│   ├── dashboard/
│   │   └── page.tsx                  # 📊 Dashboard (protected route)
│   │
│   ├── planner/
│   │   └── page.tsx                  # 🤖 AI Planner — form input + hasil rekomendasi
│   │
│   ├── destinations/
│   │   └── page.tsx                  # 🗺️ Browse & filter destinasi
│   │
│   ├── tips/
│   │   └── page.tsx                  # 💡 Tips hemat perjalanan
│   │
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts        # POST /api/auth/login
│       │   ├── register/route.ts     # POST /api/auth/register
│       │   └── me/route.ts           # GET  /api/auth/me (session check)
│       │
│       ├── generate-itinerary/
│       │   ├── route.ts              # POST — Pipeline utama (Beam Search)
│       │   └── route-s.ts            # POST — Pipeline alternatif (UCS)
│       │
│       └── log-click/                # POST — Tracking klik destinasi
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx                # Navigasi + user avatar + logout
│   │   └── Footer.tsx                # Footer
│   └── ui/
│       └── cards.tsx                 # Badge, Stars, DestCard, SkeletonCard
│
├── data/
│   ├── destinations.ts               # Data destinasi statis + tips + konstanta
│   └── pois.ts                       # Data Points of Interest (POI) lokal
│
├── lib/
│   ├── Algorithms.ts                 # ⭐ MODUL 1-4: Hash, Weighted, Beam, Cosine
│   ├── algorithms_ucs.ts            # ⭐ Varian UCS dari pipeline itinerary
│   ├── a-star.ts                     # ⭐ A* Search untuk rute optimal
│   ├── Registry.ts                   # Type definitions + City Registry (8 kota)
│   ├── haversine.ts                  # Haversine distance (untuk A*)
│   ├── itinerary-narrator.ts         # Narasi itinerary bahasa Indonesia santai
│   ├── auth-context.tsx              # React Context: login/register/logout
│   ├── auth-utils.ts                 # PBKDF2 hashing + session token generation
│   ├── prisma.ts                     # Prisma client singleton
│   ├── utils.ts                      # Helper: formatRupiah, parseItineraryDays
│   │
│   ├── estimateTransportCost/
│   │   └── poi.ts                    # Fetch POI dari OpenTripMap API
│   │
│   └── weightedScore/
│       ├── estimator.ts              # Estimasi & breakdown biaya total
│       └── transport.ts              # Mode transport + harga (Skyscanner/fallback)
│
├── prisma/
│   └── schema.prisma                 # Skema database: User, DestinationClick
│
├── prisma.config.ts                  # Konfigurasi Prisma adapter (pg)
├── next.config.mjs                   # Konfigurasi Next.js
├── tailwind.config.js                # Konfigurasi Tailwind CSS
├── tsconfig.json                     # Konfigurasi TypeScript
├── package.json                      # Dependencies & scripts
└── .gitignore
```

---

## ✨ Fitur Aplikasi

| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| 🏠 Beranda | `/` | Landing page dengan featured destinations dan CTA |
| 🔑 Login / Register | `/login` | Autentikasi dengan PBKDF2 hashing + JWT cookie |
| 📊 Dashboard | `/dashboard` | Statistik perjalanan + rencana tersimpan *(protected)* |
| 🤖 AI Planner | `/planner` | Input preferensi → pipeline AI → itinerary + rekomendasi |
| 🗺️ Destinasi | `/destinations` | Browse, search, dan filter destinasi wisata |
| 💡 Tips Hemat | `/tips` | Tips dan trik perjalanan hemat |

### Kota yang Didukung

| Kota | Provinsi | Kode Bandara |
|------|----------|-------------|
| Surabaya | Jawa Timur | SUB |
| Jakarta | DKI Jakarta | CGK |
| Banyuwangi | Jawa Timur | BWX |
| Yogyakarta | DIY | YIA |
| Bandung | Jawa Barat | BDO |
| Bali | Bali | DPS |
| Malang | Jawa Timur | MLG |
| Lombok | NTB | LOP |

---

## 🔌 API Endpoints

### Autentikasi

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/auth/register` | Registrasi user baru (name, email, password) |
| `POST` | `/api/auth/login` | Login → set `session_token` cookie |
| `GET` | `/api/auth/me` | Cek session aktif, return user data |
| `POST` | `/api/auth/logout` | Hapus session cookie |

### Itinerary Generator

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/generate-itinerary` | Pipeline utama (Beam Search) |

**Request Body:**

```json
{
  "budget": 3000000,
  "duration": "2D1N",
  "preferences": ["Pantai", "Kuliner"],
  "originCity": "Surabaya"
}
```

**Response (success):**

```json
{
  "success": true,
  "data": {
    "durationKey": "2D1N",
    "main": {
      "id": "...",
      "name": "Hotel XYZ",
      "city": "Bali",
      "province": "Bali",
      "distanceLabel": "Jarak: 412 km | Transport: Pesawat Terbang",
      "estimatedCost": { "2D1N": 2850000 },
      "transportCost": 1200000,
      "hotelCost": 500000,
      "foodCost": 350000,
      "ticketCost": 200000,
      "badges": ["⭐ Rating: 8.5", "Pesawat Terbang", "Pantai"],
      "hiddenGems": ["Pantai Nusa Dua", "Tanah Lot", "Uluwatu"],
      "itinerary": { "2D1N": [...] }
    },
    "alternatives": [...],
    "cheaper": [...],
    "pricier": [...]
  }
}
```

### Tracking

| Method | Endpoint | Deskripsi |
|--------|----------|-----------|
| `POST` | `/api/log-click` | Catat klik pada destinasi (untuk analitik) |

---

## 🗄️ Skema Database

Menggunakan **PostgreSQL** via **Prisma ORM**.

```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String                        // PBKDF2 hash (iterations:salt:hash)
  createdAt DateTime @default(now())
}

model DestinationClick {
  id              String   @id @default(uuid())
  destinationId   String   @unique          // ID hotel dari Booking.com API
  destinationName String
  clickCount      Int      @default(1)
  updatedAt       DateTime @updatedAt
}
```

---

## 🔒 Keamanan

| Aspek | Implementasi |
|-------|-------------|
| **Password Hashing** | PBKDF2 (SHA-256, 100.000 iterasi, 128-bit salt, 512-bit key) |
| **Timing Attack Prevention** | `crypto.timingSafeEqual()` untuk verifikasi password |
| **Session Token** | SHA-256 HMAC dari email + timestamp + nonce |
| **Protected Routes** | Middleware Next.js — redirect ke `/login` jika tidak ada cookie `session_token` |
| **Secrets** | Semua API key & secret disimpan di `.env` (tidak di-commit) |

---

## 📜 Lisensi

Proyek ini dibuat untuk keperluan akademik (UAS Konsep Dasar Kecerdasan Artifisial, Semester 2).

---

<p align="center">
  Dibuat dengan ❤️ oleh <strong>Kelompok PLENGER</strong>
</p>