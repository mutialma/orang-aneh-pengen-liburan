import { NodePOI } from "./Registry";
import { haversineKm } from "./Algorithms";

// =========================================================================
// TIPE STATE UNTUK BFS
// =========================================================================
interface BFSState {
  location:        NodePOI;
  time:            number;       // menit dari 00:00
  visited:         Set<string>;
  budgetUsed:      number;
  path:            NodePOI[];    // jejak rute yang sudah dilalui
  depth:           number;       // level kedalaman dari start
}

// =========================================================================
// HARD CONSTRAINTS — sama dengan A* dan UCS supaya perbandingan fair
// =========================================================================
function passesConstraintsBFS(
  poi:                NodePOI,
  state:              BFSState,
  withFamily:         boolean,
  distanceFromLastKm: number,
  dailyDistanceSoFar: number
): boolean {
  const hour = Math.floor(state.time / 60);
  if (hour < (poi.openHour  ?? 8))                  return false; // jam buka
  if (hour > (poi.closeHour ?? 21))                 return false; // jam tutup
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; // maks 50 km/hari
  if (withFamily && !poi.familyFriendly)            return false; // family filter
  if (state.visited.has(poi.id))                    return false; // sudah dikunjungi
  return true;
}

// =========================================================================
// MODUL BFS — Breadth First Search per hari
//
// PERBEDAAN UTAMA vs A* dan UCS:
//
// A*  → f(n) = h(n) - g(n)
//       Prioritaskan node dengan FITNESS SCORE TERTINGGI
//       Pakai heuristik → "cerdas", tahu ke mana harusnya pergi
//       Beam width = 8 → 8 jalur terbaik berjalan paralel
//
// UCS → f(n) = g(n) saja
//       Prioritaskan node dengan BIAYA TERENDAH
//       Tidak pakai heuristik → greedy termurah
//       Priority queue berdasarkan cost
//
// BFS → tidak ada f(n), tidak ada prioritas
//       Eksplorasi LEVEL DEMI LEVEL (semua tetangga dulu, baru lebih jauh)
//       Tidak peduli biaya, tidak peduli skor
//       Queue biasa (FIFO — First In First Out)
//       Menjamin jalur dengan JUMLAH LANGKAH TERSEDIKIT
//       TIDAK menjamin jalur termurah atau terbaik
//
// Analogi:
//   A*  = Wisatawan cerdas — pilih yang paling seru & worth it
//   UCS = Wisatawan hemat — pilih yang paling murah
//   BFS = Wisatawan random — coba semua kemungkinan level per level,
//         ambil yang pertama ditemukan
//
// Kompleksitas:
//   A*  → O(b^d) tapi dipangkas pakai heuristik → lebih cepat
//   UCS → O(b^(C/ε)) dimana C=biaya optimal, ε=biaya minimum
//   BFS → O(b^d) tanpa pemangkasan → paling banyak eksplorasi
//         b = branching factor (jumlah POI)
//         d = kedalaman (maxActivities)
// =========================================================================
export interface BFSResult {
  route:           NodePOI[];
  totalCost:       number;
  totalSteps:      number;       // jumlah langkah (depth)
  nodesExplored:   number;       // total node yang dievaluasi
  executionTimeMs: number;       // waktu eksekusi dalam milidetik
}

export function bfsSearchDay(
  startPOI:      NodePOI,
  candidates:    NodePOI[],
  dailyBudget:   number,
  withFamily:    boolean,
  maxActivities: number
): BFSResult {
  const startTime = performance.now();
  let nodesExplored = 0;

  // ── Queue FIFO — BFS pakai queue biasa, bukan priority queue ──
  const queue: BFSState[] = [{
    location:  startPOI,
    time:      8 * 60,   // mulai 08:00
    visited:   new Set([startPOI.id]),
    budgetUsed: 0,
    path:      [],
    depth:     0,
  }];

  // Simpan semua jalur lengkap yang berhasil ditemukan
  const completedPaths: BFSState[] = [];
  let dailyDistanceSoFar = 0;

  while (queue.length > 0) {
    // ── Dequeue dari depan (FIFO) ──
    const current = queue.shift()!;

    // Sudah mencapai kedalaman maksimal — simpan sebagai hasil
    if (current.depth >= maxActivities) {
      if (current.path.length > 0) {
        completedPaths.push(current);
      }
      continue;
    }

    let hasChild = false;

    for (const poi of candidates) {
      nodesExplored++;

      const distKm = haversineKm(current.location, poi);
      if (!passesConstraintsBFS(poi, current, withFamily, distKm, dailyDistanceSoFar)) continue;

      const travelMinutes = (distKm / 40) * 60;
      const newTime       = current.time + travelMinutes + 90;
      const newBudget     = current.budgetUsed + poi.cost;

      if (newBudget > dailyBudget) continue;

      hasChild = true;

      // ── BFS: enqueue semua tetangga valid tanpa prioritas ──
      // Tidak ada sorting, tidak ada evaluasi skor — masuk antrian begitu saja
      queue.push({
        location:   poi,
        time:       newTime,
        visited:    new Set([...current.visited, poi.id]),
        budgetUsed: newBudget,
        path:       [...current.path, poi],
        depth:      current.depth + 1,
      });
    }

    // Kalau tidak punya child tapi sudah punya path → simpan sebagai leaf
    if (!hasChild && current.path.length > 0) {
      completedPaths.push(current);
    }
  }

  const executionTimeMs = performance.now() - startTime;

  // ── BFS tidak punya "terbaik" secara natural ──
  // Dari semua jalur yang ditemukan, kita pilih yang path-nya terpanjang
  // (= paling banyak aktivitas) sebagai proxy "hasil terbaik"
  // Ini bedanya dengan A* yang langsung tahu mana yang terbaik
  completedPaths.sort((a, b) => b.path.length - a.path.length || a.budgetUsed - b.budgetUsed);
  const best = completedPaths[0] ?? null;

  if (best && best.path.length > 1) {
    dailyDistanceSoFar = haversineKm(startPOI, best.path[best.path.length - 1]);
  }

  return {
    route:           best?.path ?? [],
    totalCost:       best?.budgetUsed ?? 0,
    totalSteps:      best?.depth ?? 0,
    nodesExplored,
    executionTimeMs,
  };
}