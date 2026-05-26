import { NodePOI, BeamState } from "./registry";

// =========================================================================
// MODUL 1 — Hash Indexing
// =========================================================================
export function formulaHash(str: string, M = 200): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i) * (i + 1);
  return sum % M;
}

// =========================================================================
// HELPER — Haversine Distance (km)
// =========================================================================
export function haversineDistance(
  lat1: number, lon1: number,
  lat2: number, lon2: number
): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25;
}

export function haversineKm(a: NodePOI, b: NodePOI): number {
  return haversineDistance(a.lat, a.lon, b.lat, b.lon);
}

// =========================================================================
// MODUL 3B — Hard Constraints Filter
// Jam operasional, maks 50 km/hari, family, sudah dikunjungi
// =========================================================================
export function passesConstraints(
  poi: NodePOI,
  state: BFSState,
  withFamily: boolean,
  distanceFromLastKm: number,
  dailyDistanceSoFar: number
): boolean {
  const hour = Math.floor(state.time / 60);
  if (hour < (poi.openHour  ?? 8))  return false; // jam buka
  if (hour > (poi.closeHour ?? 21)) return false; // jam tutup
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; // maks 50 km/hari
  if (withFamily && !poi.familyFriendly) return false;            // family filter
  if (state.visited.has(poi.id)) return false;                    // sudah dikunjungi
  return true;
}

// =========================================================================
// MODUL 3C — BFS per hari
// BFS: ekspansi level per level (step = 1 aktivitas).
// Tidak ada scoring/cost — semua node yang valid di-expand rata.
// Dari semua state di level terakhir, pilih path terpanjang (maks aktivitas).
// Jika ada tie, pilih path dengan budget terpakai paling kecil.
// =========================================================================

interface BFSState {
  location:   NodePOI;
  time:       number;
  visited:    Set<string>;
  budgetUsed: number;
  path:       NodePOI[]; // rekam jalur untuk backtrack
}

export function bfsDay(
  startPOI: NodePOI,
  candidates: NodePOI[],
  dailyBudget: number,
  withFamily: boolean,
  maxActivities: number
): NodePOI[] {
  // Queue BFS: level 0 = state awal
  const queue: BFSState[] = [{
    location:   startPOI,
    time:       8 * 60, // mulai 08:00
    visited:    new Set([startPOI.id]),
    budgetUsed: 0,
    path:       [],
  }];

  let bestPath: NodePOI[]  = [];
  let dailyDistanceSoFar   = 0;

  // BFS level per level, tiap level = 1 langkah aktivitas
  let currentLevel = queue;

  for (let step = 0; step < maxActivities; step++) {
    const nextLevel: BFSState[] = [];

    for (const state of currentLevel) {
      for (const poi of candidates) {
        const distKm        = haversineKm(state.location, poi);
        const travelMinutes = (distKm / 40) * 60; // asumsi 40 km/h

        if (!passesConstraints(poi, state, withFamily, distKm, dailyDistanceSoFar)) continue;

        const newBudget = state.budgetUsed + poi.cost;
        if (newBudget > dailyBudget) continue;

        const newTime = state.time + travelMinutes + 90; // +90 menit kunjungan

        nextLevel.push({
          location:   poi,
          time:       newTime,
          visited:    new Set([...state.visited, poi.id]),
          budgetUsed: newBudget,
          path:       [...state.path, poi],
        });
      }
    }

    if (nextLevel.length === 0) break;

    // Update dailyDistanceSoFar dari best state di level ini
    // (ambil node pertama sebagai representasi — BFS tidak membedakan cost)
    const repPrev = currentLevel[0].location;
    const repNext = nextLevel[0].location;
    dailyDistanceSoFar += haversineKm(repPrev, repNext);

    // Simpan path terbaik di level ini:
    // tie-breaking: budget terpakai paling kecil
    nextLevel.sort((a, b) => a.budgetUsed - b.budgetUsed);
    bestPath = nextLevel[0].path;

    currentLevel = nextLevel;
  }

  return bestPath;
}

// =========================================================================
// MODUL 4 — Cosine Similarity
// =========================================================================
export function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// =========================================================================
// MODUL 2 — Weighted Scoring (untuk pilih hotel/kota tujuan)
// w1*nBudget + w2*nTag + w3*nDist
// =========================================================================
export function weightedScore(
  nBudget: number,
  nTag: number,
  nDist: number,
  w1 = 0.5, w2 = 0.3, w3 = 0.2
): number {
  return w1 * nBudget + w2 * nTag + w3 * nDist;
}
