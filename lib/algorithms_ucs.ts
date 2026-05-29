import { NodePOI } from "./Registry";
import { haversineKm } from "./Algorithms";

// =========================================================================
// TIPE STATE UNTUK UCS
// Sama persis dengan BeamState di A* supaya perbandingan fair
// =========================================================================
interface UCSState {
  location:          NodePOI;
  time:              number;       // menit dari 00:00
  visited:           Set<string>;
  budgetUsed:        number;
  cumulativeCost:    number;       // g(n) murni — UCS hanya pakai ini
  path:              NodePOI[];    // jejak rute yang sudah dilalui
}

// =========================================================================
// HARD CONSTRAINTS — sama dengan A* supaya perbandingan fair
// =========================================================================
function passesConstraintsUCS(
  poi:                  NodePOI,
  state:                UCSState,
  withFamily:           boolean,
  distanceFromLastKm:   number,
  dailyDistanceSoFar:   number
): boolean {
  const hour = Math.floor(state.time / 60);
  if (hour < (poi.openHour  ?? 8))  return false; // jam buka
  if (hour > (poi.closeHour ?? 21)) return false; // jam tutup
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; // maks 50 km/hari
  if (withFamily && !poi.familyFriendly)            return false; // family filter
  if (state.visited.has(poi.id))                    return false; // sudah dikunjungi
  return true;
}

// =========================================================================
// MODUL UCS — Uniform Cost Search per hari
//
// PERBEDAAN UTAMA vs A*:
//
// A*  → f(n) = h(n) - g(n)
//       Pilih node dengan SKOR FITNESS TERTINGGI dikurangi biaya
//       Pakai heuristik (fitness score) untuk "tebak" node terbaik
//       Beam width = 8 → jalan 8 jalur sekaligus
//
// UCS → f(n) = g(n) saja
//       Pilih node dengan BIAYA KUMULATIF TERENDAH
//       Tidak pakai heuristik sama sekali — murni cari yang termurah
//       Priority queue → selalu expand node termurah duluan
//
// Analogi:
//   A*  = Wisatawan yang cari tempat paling seru & terjangkau
//   UCS = Wisatawan yang cari tempat paling murah tanpa peduli serunya
// =========================================================================
export interface UCSResult {
  route:             NodePOI[];
  totalCost:         number;
  nodesExplored:     number;       // berapa node yang dievaluasi
  executionTimeMs:   number;       // waktu eksekusi dalam milidetik
}

export function ucsSearchDay(
  startPOI:      NodePOI,
  candidates:    NodePOI[],
  dailyBudget:   number,
  withFamily:    boolean,
  maxActivities: number
): UCSResult {
  const startTime = performance.now();
  let nodesExplored = 0;

  // Priority Queue sederhana — diurutkan berdasarkan cumulativeCost (g(n)) ASC
  // UCS selalu expand node dengan cost TERENDAH duluan
  let frontier: UCSState[] = [{
    location:       startPOI,
    time:           8 * 60,      // mulai 08:00
    visited:        new Set([startPOI.id]),
    budgetUsed:     0,
    cumulativeCost: 0,           // g(n) = 0 di awal
    path:           [],
  }];

  let bestState: UCSState | null = null;
  let dailyDistanceSoFar = 0;

  // UCS expand sampai maxActivities terpenuhi atau frontier kosong
  for (let step = 0; step < maxActivities; step++) {
    if (frontier.length === 0) break;

    // ── Sort by g(n) ASC — UCS selalu ambil yang termurah ──
    frontier.sort((a, b) => a.cumulativeCost - b.cumulativeCost);

    const current = frontier[0];
    frontier = frontier.slice(1); // pop node terbaik

    const nextStates: UCSState[] = [];

    for (const poi of candidates) {
      nodesExplored++;

      const distKm = haversineKm(current.location, poi);
      if (!passesConstraintsUCS(poi, current, withFamily, distKm, dailyDistanceSoFar)) continue;

      const travelMinutes = (distKm / 40) * 60;
      const newTime       = current.time + travelMinutes + 90;
      const newBudget     = current.budgetUsed + poi.cost;

      if (newBudget > dailyBudget) continue;

      // ── UCS: cost = biaya kumulatif saja, tidak ada heuristik ──
      const newCumulativeCost = current.cumulativeCost + poi.cost;

      nextStates.push({
        location:       poi,
        time:           newTime,
        visited:        new Set([...current.visited, poi.id]),
        budgetUsed:     newBudget,
        cumulativeCost: newCumulativeCost,
        path:           [...current.path, poi],
      });
    }

    if (nextStates.length === 0) break;

    // UCS: pilih yang biayanya paling rendah (bukan fitness tertinggi)
    nextStates.sort((a, b) => a.cumulativeCost - b.cumulativeCost);
    bestState = nextStates[0];

    dailyDistanceSoFar += haversineKm(
      current.path.length > 0
        ? current.path[current.path.length - 1]
        : startPOI,
      bestState.location
    );

    // Masukkan semua state ke frontier untuk step berikutnya
    frontier.push(...nextStates);
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    route:           bestState?.path ?? [],
    totalCost:       bestState?.budgetUsed ?? 0,
    nodesExplored,
    executionTimeMs,
  };
}