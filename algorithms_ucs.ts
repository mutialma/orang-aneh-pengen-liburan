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
// MODUL 3A — Cost Function g(n) untuk UCS
// UCS tidak menggunakan heuristic h(n). Semua keputusan berbasis cost aktual.
// cost(n) = normalizedBudget + normalizedDistance + normalizedTime
// =========================================================================
export function ucsCost(
  poi: NodePOI,
  distKm: number,
  travelMinutes: number,
  newBudgetUsed: number,
  dailyBudget: number,
  wBudget = 0.5,
  wDist   = 0.3,
  wTime   = 0.2
): number {
  const normalizedBudget = dailyBudget > 0 ? newBudgetUsed / dailyBudget : 0;
  const normalizedDist   = Math.min(distKm / 50, 1);        // maks referensi 50 km/hari
  const normalizedTime   = Math.min(travelMinutes / 120, 1); // maks referensi 120 menit
  return wBudget * normalizedBudget + wDist * normalizedDist + wTime * normalizedTime;
}

// =========================================================================
// MODUL 3B — Hard Constraints Filter
// Jam operasional, maks 50 km/hari, family, sudah dikunjungi
// =========================================================================
export function passesConstraints(
  poi: NodePOI,
  state: BeamState,
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
// MODUL 3C — UCS per hari
// UCS = ekspansi berdasarkan g(n) kumulatif terendah (priority queue).
// Tidak ada h(n) — murni cost aktual.
// Beam width dipertahankan untuk efisiensi memori (UCS terbatas).
// =========================================================================
const BEAM_WIDTH = 8;

interface UCSState {
  location:          NodePOI;
  time:              number;
  visited:           Set<string>;
  budgetUsed:        number;
  cumulativeCost:    number; // g(n) kumulatif — satu-satunya penentu prioritas
}

export function ucsDay(
  startPOI: NodePOI,
  candidates: NodePOI[],
  preferences: string[],          // dipakai hanya untuk filter opsional, bukan scoring
  dailyBudget: number,
  withFamily: boolean,
  maxActivities: number
): NodePOI[] {
  // Priority queue sederhana: array diurutkan ascending berdasarkan cumulativeCost
  let frontier: UCSState[] = [{
    location:       startPOI,
    time:           8 * 60, // mulai 08:00
    visited:        new Set([startPOI.id]),
    budgetUsed:     0,
    cumulativeCost: 0,
  }];

  const result: NodePOI[]  = [];
  let dailyDistanceSoFar   = 0;

  for (let step = 0; step < maxActivities; step++) {
    const nextFrontier: UCSState[] = [];

    for (const state of frontier) {
      for (const poi of candidates) {
        const distKm        = haversineKm(state.location, poi);
        const travelMinutes = (distKm / 40) * 60; // asumsi 40 km/h

        // Bungkus UCSState sementara agar passesConstraints bisa dipakai
        const beamProxy: BeamState = {
          location:   state.location,
          time:       state.time,
          visited:    state.visited,
          budgetUsed: state.budgetUsed,
          score:      state.cumulativeCost,
        };

        if (!passesConstraints(poi, beamProxy, withFamily, distKm, dailyDistanceSoFar)) continue;

        const newTime      = state.time + travelMinutes + 90; // +90 menit kunjungan
        const newBudget    = state.budgetUsed + poi.cost;

        if (newBudget > dailyBudget) continue;

        // g(n): cost aktual kumulatif — UCS tidak menambah h(n)
        const stepCost     = ucsCost(poi, distKm, travelMinutes, newBudget, dailyBudget);
        const newCost      = state.cumulativeCost + stepCost;

        nextFrontier.push({
          location:       poi,
          time:           newTime,
          visited:        new Set([...state.visited, poi.id]),
          budgetUsed:     newBudget,
          cumulativeCost: newCost,
        });
      }
    }

    // UCS: urutkan ascending (cost terendah = prioritas tertinggi)
    nextFrontier.sort((a, b) => a.cumulativeCost - b.cumulativeCost);
    frontier = nextFrontier.slice(0, BEAM_WIDTH);
    if (frontier.length === 0) break;

    const best = frontier[0].location;
    dailyDistanceSoFar += haversineKm(
      result.length > 0 ? result[result.length - 1] : startPOI,
      best
    );
    result.push(best);
  }

  return result;
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
