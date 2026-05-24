import { NodePOI, BeamState } from "@/lib/Registry";

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
// MODUL 3A — h(n): Fitness Score
// 0.25 pref + 0.20 vibe + 0.20 budget + 0.15 rating + 0.10 pop + 0.10 fam
// =========================================================================
export function fitnessScore(
  poi: NodePOI,
  preferences: string[],
  dailyBudget: number,
  withFamily: boolean
): number {
  const pref   = preferences.includes(poi.type) ? 1 : 0;
  const vibe   = (preferences.includes("Healing")   && poi.vibe === "healing")   ? 1
               : (preferences.includes("Adventure") && poi.vibe === "adventure") ? 1
               : 0;
  const budget = dailyBudget > 0 ? Math.max(0, 1 - poi.cost / dailyBudget) : 0;
  const rating = (poi.rating ?? 0) / 5;
  const pop    = poi.isPopular ? 1 : 0;
  const fam    = withFamily ? (poi.familyFriendly ? 1 : 0) : 1;

  return (
    0.25 * pref   +
    0.20 * vibe   +
    0.20 * budget +
    0.15 * rating +
    0.10 * pop    +
    0.10 * fam
  );
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
// MODUL 3C — Beam Search per hari
// State: (lokasi, waktu, visited, budget) | Beam width = 8
// f(n) = h(n) - normalized g(n)
// =========================================================================
const BEAM_WIDTH = 8;

export function beamSearchDay(
  startPOI: NodePOI,
  candidates: NodePOI[],
  preferences: string[],
  dailyBudget: number,
  withFamily: boolean,
  maxActivities: number
): NodePOI[] {
  let beams: BeamState[] = [{
    location:   startPOI,
    time:       8 * 60, // mulai 08:00
    visited:    new Set([startPOI.id]),
    budgetUsed: 0,
    score:      0,
  }];

  const result: NodePOI[] = [];
  let dailyDistanceSoFar  = 0;

  for (let step = 0; step < maxActivities; step++) {
    const nextBeams: BeamState[] = [];

    for (const state of beams) {
      for (const poi of candidates) {
        const distKm = haversineKm(state.location, poi);
        if (!passesConstraints(poi, state, withFamily, distKm, dailyDistanceSoFar)) continue;

        const travelMinutes = (distKm / 40) * 60; // asumsi 40 km/h
        const newTime       = state.time + travelMinutes + 90; // +90 menit kunjungan
        const newBudget     = state.budgetUsed + poi.cost;     // g(n) kumulatif

        if (newBudget > dailyBudget) continue;

        // f(n) = h(n) - normalized g(n)
        const h = fitnessScore(poi, preferences, dailyBudget, withFamily);
        const g = dailyBudget > 0 ? newBudget / dailyBudget : 0;
        const f = h - g;

        nextBeams.push({
          location:   poi,
          time:       newTime,
          visited:    new Set([...state.visited, poi.id]),
          budgetUsed: newBudget,
          score:      state.score + f,
        });
      }
    }

    nextBeams.sort((a, b) => b.score - a.score);
    beams = nextBeams.slice(0, BEAM_WIDTH);
    if (beams.length === 0) break;

    const best = beams[0].location;
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