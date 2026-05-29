# 🏗️ Arsitektur Sistem — Liburan Pintar

Dokumen ini menjelaskan arsitektur teknis, alur data, dan detail implementasi setiap modul AI dalam sistem **Liburan Pintar**.

---

## Daftar Isi

- [Arsitektur Tingkat Tinggi](#arsitektur-tingkat-tinggi)
- [Alur Data (Data Flow)](#alur-data-data-flow)
- [Modul 1: Hash Indexing](#modul-1-hash-indexing)
- [Modul 2: Weighted Scoring](#modul-2-weighted-scoring)
- [Modul 3: Pathfinding & Itinerary Planning](#modul-3-pathfinding--itinerary-planning)
  - [3A: Fitness Score — Heuristic h(n)](#3a-fitness-score--heuristic-hn)
  - [3B: Hard Constraints Filter](#3b-hard-constraints-filter)
  - [3C: Beam Search](#3c-beam-search)
  - [Varian: Uniform Cost Search (UCS)](#varian-uniform-cost-search-ucs)
  - [Varian: A* Search](#varian-a-search)
- [Modul 4: Cosine Similarity](#modul-4-cosine-similarity)
- [Helper: Haversine Distance](#helper-haversine-distance)
- [Integrasi API Eksternal](#integrasi-api-eksternal)
- [Sistem Autentikasi](#sistem-autentikasi)
- [Narasi Itinerary](#narasi-itinerary)

---

## Arsitektur Tingkat Tinggi

```
┌──────────────────────────────────────────────────────────────┐
│                         CLIENT                                │
│                    (Next.js React App)                         │
│                                                               │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────┐  │
│  │  Landing  │  │  Planner │  │  Destina │  │   Dashboard  │  │
│  │  Page     │  │  (AI)    │  │  -tions  │  │  (Protected) │  │
│  └──────────┘  └────┬─────┘  └──────────┘  └──────────────┘  │
│                     │                                         │
└─────────────────────┼─────────────────────────────────────────┘
                      │ POST /api/generate-itinerary
                      ▼
┌──────────────────────────────────────────────────────────────┐
│                      SERVER (API Routes)                      │
│                                                               │
│  ┌────────────────────────────────────────────────────────┐   │
│  │              AI PIPELINE ORCHESTRATOR                   │   │
│  │                (route.ts / route-s.ts)                  │   │
│  │                                                        │   │
│  │  1. Fetch hotel data (Booking.com API)                 │   │
│  │  2. Hash Indexing → bucket distribution                │   │
│  │  3. Weighted Scoring → ranking + budget filter         │   │
│  │  4. Fetch POI (OpenTripMap API)                        │   │
│  │  5. Beam Search / UCS → daily itinerary                │   │
│  │  6. Cosine Similarity → alternatives                   │   │
│  │  7. Transport pricing (Skyscanner API / fallback)      │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌────────────────┐  ┌────────────────┐                       │
│  │  Auth Routes   │  │  Log Click     │                       │
│  │  (JWT+PBKDF2)  │  │  (Analytics)   │                       │
│  └────────────────┘  └────────────────┘                       │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                          │
│                                                               │
│  ┌──────────┐  ┌──────────────┐  ┌─────────────────────┐     │
│  │ Booking  │  │ OpenTripMap  │  │ Skyscanner           │     │
│  │ .com API │  │ API          │  │ (RapidAPI)           │     │
│  └──────────┘  └──────────────┘  └─────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                    PostgreSQL (Prisma ORM)                     │
│  ┌──────────┐  ┌─────────────────────┐                        │
│  │  User    │  │  DestinationClick   │                        │
│  └──────────┘  └─────────────────────┘                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Alur Data (Data Flow)

Ketika user menekan tombol "Generate Itinerary", berikut alur prosesnya:

```
User Input
    │
    ▼
[1] Fetch hotel dari 5 kota random (Booking.com API, maks 4 hotel/kota)
    │
    ▼
[2] Hash Indexing — distribusi ke bucket untuk O(1) lookup
    │
    ▼
[3] Weighted Scoring — hitung skor setiap akomodasi
    │   ├── nBudget = grandTotalEst <= budget ? 1 : max(0, 1 - overflow/budget)
    │   ├── nTag    = matchingTags / totalPreferences
    │   └── nDist   = 1 / (1 + distance/600)
    │
    ▼
[4] Hard Budget Filter — eliminasi yang melebihi budget
    │
    ▼
[5] Pilih destinasi utama (skor tertinggi)
    │
    ▼
[6] Hitung transport — mode otomatis berdasarkan jarak:
    │   ├── < 100 km  → Mobil / Travel Darat
    │   ├── 100-450 km → Kereta Api / Bus Executive
    │   └── > 450 km  → Pesawat Terbang
    │
    ▼
[7] Fetch POI — OpenTripMap API (radius 15 km dari hotel)
    │
    ▼
[8] Beam Search — susun itinerary per hari (maks 3 aktivitas/hari)
    │
    ▼
[9] Cosine Similarity — cari alternatif destinasi mirip
    │
    ▼
[10] Return JSON response (main + alternatives + cheaper + pricier)
```

---

## Modul 1: Hash Indexing

**File:** `lib/Algorithms.ts` → `formulaHash()`

### Tujuan
Mengindeks akomodasi ke dalam bucket untuk pencarian cepat dan potensi deduplikasi.

### Algoritma

```typescript
function formulaHash(str: string, M = 200): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    sum += str.charCodeAt(i) * (i + 1);
  }
  return sum % M;
}
```

### Penjelasan
- Menggunakan **character-weighted hashing**: setiap karakter dikalikan posisinya (1-indexed)
- Modulo `M = 200` untuk membatasi jumlah bucket
- Memberikan distribusi yang lebih baik dibanding simple sum karena posisi karakter diperhitungkan
- **Kompleksitas:** O(n) dimana n = panjang string

### Contoh
```
"Hotel Bali"
h = (H×1 + o×2 + t×3 + e×4 + l×5 + ×6 + B×7 + a×8 + l×9 + i×10) mod 200
h = (72 + 222 + 348 + 404 + 540 + 192 + 462 + 776 + 972 + 1050) mod 200
h = 5038 mod 200 = 38
```

---

## Modul 2: Weighted Scoring

**File:** `lib/Algorithms.ts` → `weightedScore()`  
**File:** `lib/weightedScore/estimator.ts` → `estimateTotalCost()`

### Tujuan
Memberikan ranking kepada setiap akomodasi berdasarkan tiga kriteria terbobot.

### Formula

```
score = 0.5 × nBudget + 0.3 × nTag + 0.2 × nDist
```

### Komponen Normalisasi

| Komponen | Formula | Keterangan |
|----------|---------|------------|
| `nBudget` | `grandTotal ≤ budget ? 1 : max(0, 1 − (grandTotal − budget)/budget)` | Semakin di dalam budget → skor semakin tinggi |
| `nTag` | `matchingTags / totalPreferences` | Kesesuaian preferensi user |
| `nDist` | `1 / (1 + distance/600)` | Sigmoid-like: jarak lebih dekat → skor lebih tinggi |

### Estimasi Biaya Total (untuk nBudget)

```
grandTotal = hotelCost + transportCost + foodCost + ticketCost

hotelCost     = costPerDay × (totalDays − 1)
transportCost = f(distance)  // lihat tabel mode transport
foodCost      = (150.000 + costPerDay × 0.05) × totalDays
ticketCost    = (100.000 + costPerDay × 0.05) × totalDays
```

---

## Modul 3: Pathfinding & Itinerary Planning

### 3A: Fitness Score — Heuristic h(n)

**File:** `lib/Algorithms.ts` → `fitnessScore()`

Menghitung seberapa "bagus" suatu POI untuk dikunjungi oleh user.

```
h(n) = 0.25×pref + 0.20×vibe + 0.20×budget + 0.15×rating + 0.10×pop + 0.10×fam
```

| Komponen | Bobot | Logika |
|----------|-------|--------|
| `pref` | 0.25 | 1 jika tipe POI ada di preferensi user, 0 jika tidak |
| `vibe` | 0.20 | 1 jika vibe POI cocok (Healing/Adventure), 0 jika tidak |
| `budget` | 0.20 | `max(0, 1 − cost/dailyBudget)` — semakin murah semakin baik |
| `rating` | 0.15 | `rating / 5` — normalisasi rating ke [0, 1] |
| `pop` | 0.10 | 1 jika populer, 0 jika tidak |
| `fam` | 0.10 | 1 jika family-friendly (atau user tanpa keluarga), 0 jika tidak |

### 3B: Hard Constraints Filter

**File:** `lib/Algorithms.ts` → `passesConstraints()`

POI **langsung dieliminasi** jika gagal memenuhi salah satu constraint:

```
✗ Jam saat ini < jam buka POI          → REJECT
✗ Jam saat ini > jam tutup POI         → REJECT
✗ Jarak kumulatif hari ini + jarak ke POI > 50 km  → REJECT
✗ User bawa keluarga & POI tidak family-friendly    → REJECT
✗ POI sudah dikunjungi di hari yang sama            → REJECT
```

### 3C: Beam Search

**File:** `lib/Algorithms.ts` → `beamSearchDay()`

Algoritma pencarian yang menyimpan `k` state terbaik di setiap level (beam width = 8).

#### State Representation

```typescript
interface BeamState {
  location: NodePOI;     // POI terakhir dikunjungi
  time: number;          // waktu dalam menit (mulai 08:00 = 480)
  visited: Set<string>;  // set POI yang sudah dikunjungi
  budgetUsed: number;    // akumulasi biaya g(n)
  score: number;         // akumulasi f(n)
}
```

#### Evaluation Function

```
f(n) = h(n) − g(n)/budget

h(n) = fitnessScore(POI)           // seberapa bagus POI ini
g(n) = cumulativeBudgetUsed/budget  // seberapa mahal (normalized)
```

> Beam Search memaksimalkan f(n), sehingga POI yang bagus DAN murah mendapat prioritas.

#### Asumsi Operasional

| Parameter | Nilai |
|-----------|-------|
| Kecepatan rata-rata | 40 km/jam |
| Durasi kunjungan per POI | 90 menit |
| Jam mulai hari | 08:00 |
| Maks jarak per hari | 50 km |
| Beam width | 8 |

### Varian: Uniform Cost Search (UCS)

**File:** `lib/algorithms_ucs.ts` → `ucsDay()`

Alternatif dari Beam Search yang **murni berbasis cost aktual** (tanpa heuristic).

#### Perbedaan dengan Beam Search

| Aspek | Beam Search | UCS |
|-------|------------|-----|
| Evaluation | `f(n) = h(n) − g(n)/budget` | `g(n) = cost kumulatif` |
| Heuristic | ✅ Ada (fitnessScore) | ❌ Tidak ada |
| Sorting | Descending (skor tinggi = baik) | Ascending (cost rendah = baik) |
| Optimality | Approximate (greedy) | Optimal (cost minimum) |

#### Cost Function UCS

```
g(n) = 0.5 × normBudget + 0.3 × normDist + 0.2 × normTime

normBudget = newBudgetUsed / dailyBudget        (capped at 1.0)
normDist   = min(distKm / 50, 1)                (referensi 50 km/hari)
normTime   = min(travelMinutes / 120, 1)        (referensi 2 jam)
```

### Varian: A* Search

**File:** `lib/a-star.ts` → `findOptimalRouteAStar()`

Pencarian rute optimal dari lokasi awal ke lokasi tujuan melalui graph destinasi.

#### Evaluation Function

```
f(n) = g(n) + h(n)

g(n) = jarak kumulatif aktual dari start ke node n (Haversine)
h(n) = jarak estimasi dari node n ke goal (Haversine)
```

> Haversine bersifat **admissible** (tidak pernah overestimate jarak sebenarnya), sehingga A* dijamin menemukan path optimal.

#### Struktur Data

```typescript
interface AStarNode {
  location: LocationNode;
  gCost: number;          // jarak aktual dari start
  hCost: number;          // estimasi jarak ke goal
  fCost: number;          // gCost + hCost
  parent: AStarNode | null;
}
```

#### Algoritma

1. Inisialisasi `openSet` dengan start node
2. Loop: ambil node dengan `fCost` terendah
3. Jika node = goal → reconstruct path via parent pointers
4. Untuk setiap neighbor:
   - Hitung `tentativeG = current.gCost + distance(current, neighbor)`
   - Jika neighbor belum ada di openSet → tambahkan
   - Jika tentativeG < neighbor.gCost → update cost & parent
5. Jika openSet kosong → return empty (no path)

---

## Modul 4: Cosine Similarity

**File:** `lib/Algorithms.ts` → `cosineSimilarity()`

### Tujuan
Mencari destinasi alternatif yang paling mirip dengan destinasi utama.

### Formula

```
similarity(A, B) = (A · B) / (‖A‖ × ‖B‖)

dimana:
  A · B  = Σ(Aᵢ × Bᵢ)       (dot product)
  ‖A‖    = √Σ(Aᵢ²)           (Euclidean norm)
```

### Vektor Fitur

Setiap destinasi direpresentasikan sebagai vektor 3 dimensi:

```
V = [nBudget, nTag, nDist]
```

### Penggunaan di Pipeline

1. Hitung vektor fitur destinasi utama (`mainVec`)
2. Untuk setiap destinasi lain, hitung cosine similarity dengan `mainVec`
3. Urutkan descending berdasarkan similarity score
4. Ambil top-3 sebagai `alternatives`
5. Filter terpisah untuk `cheaper` (harga < utama) dan `pricier` (harga > utama)

---

## Helper: Haversine Distance

**File:** `lib/Algorithms.ts` dan `lib/haversine.ts`

Menghitung jarak "as the crow flies" antara dua koordinat GPS (latitude, longitude).

### Formula

```
a = sin²(Δlat/2) + cos(lat₁) × cos(lat₂) × sin²(Δlon/2)
c = 2 × atan2(√a, √(1−a))
d = R × c × correction_factor

R = 6371 km (radius bumi)
correction_factor = 1.25 (koreksi untuk jalan yang berkelok)
```

> **Catatan:** File `haversine.ts` menyediakan versi tanpa correction factor (untuk A*), sementara `Algorithms.ts` menggunakan faktor 1.25 (untuk Beam Search/UCS, karena kita mengestimasi jarak jalan, bukan jarak udara).

---

## Integrasi API Eksternal

### 1. Booking.com (via RapidAPI)

| Aspek | Detail |
|-------|--------|
| Endpoint | `booking-com.p.rapidapi.com/v1/hotels/search` |
| Data | Nama hotel, harga per malam, rating, koordinat |
| Rate limiting | 1 detik delay antar request per kota |
| Fallback | Tidak ada fallback — jika gagal, kota dilewati |

### 2. OpenTripMap

| Aspek | Detail |
|-------|--------|
| Endpoint | `api.opentripmap.com/0.1/en/places/radius` |
| Data | Nama POI, koordinat, rating |
| Radius | 15 km dari hotel |
| Fallback | POI dummy berdasarkan preferensi user |
| Kategori mapping | Gunung→natural, Pantai→beaches, Kuliner→restaurants, Budaya→cultural |

### 3. Skyscanner (via RapidAPI)

| Aspek | Detail |
|-------|--------|
| Endpoint | `skyscanner44.p.rapidapi.com/search` |
| Data | Harga tiket pesawat (PP) |
| Fallback | Estimasi harga berdasarkan jarak (lihat tabel transport) |

### Estimasi Biaya Transport (Fallback)

| Mode | Kondisi | Formula (PP) |
|------|---------|--------------|
| Mobil/Travel | < 100 km | `(150.000 + jarak × 800) × 2` |
| Kereta/Bus | 100–450 km | `(250.000 + jarak × 400) × 2` |
| Pesawat | > 450 km | `(1.200.000 + jarak × 600) × 2` |

---

## Sistem Autentikasi

**File:** `lib/auth-utils.ts`, `lib/auth-context.tsx`, `app/middleware.ts`

### Alur Registrasi

```
1. User submit form register (name, email, password)
2. Server: hashPassword(password) → PBKDF2(SHA-256, 100k iter, 128-bit salt)
3. Server: simpan ke PostgreSQL → User { name, email, password_hash }
4. Otomatis login setelah registrasi berhasil
```

### Alur Login

```
1. User submit form login (email, password)
2. Server: ambil user dari DB berdasarkan email
3. Server: verifyPassword(input, storedHash) → PBKDF2 + timingSafeEqual
4. Jika cocok: generateSessionToken(email) → SHA-256(email|timestamp|nonce)
5. Set HttpOnly cookie: session_token = "email|signature"
6. Client: simpan user ke React Context
```

### Protected Routes

```
middleware.ts:
  if (path.startsWith('/dashboard') && !cookie.session_token)
    → redirect to /login
```

---

## Narasi Itinerary

**File:** `lib/itinerary-narrator.ts`

Modul ini mengubah hasil algoritmik menjadi **narasi bahasa Indonesia santai** yang mudah dibaca user. Fitur:

- Opening bervariasi (dipilih pseudo-random berdasarkan seed)
- Deskripsi khusus per vibe (healing, adventure, family, romantis, solo, kuliner)
- Deskripsi intensitas (santai, normal, padat)
- Narasi per hari (urutan POI, rekomendasi makan, jarak tempuh)
- Summary (total biaya, sisa budget, jarak kumulatif)
- Info lodging dan breakdown biaya
- Closing yang personal sesuai vibe
- Warning jika ada anomali

---

*Terakhir diperbarui: Mei 2026*
