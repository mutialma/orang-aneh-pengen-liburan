import { NextResponse } from "next/server";

// =========================================================================
// REGISTRY DATABASE
// =========================================================================
const CITY_REGISTRY: Record<string, {
  lat: number; lon: number; province: string; iata: string;
  station: string; bookingId: string; destType: string; taLocationId: string
}> = {
  "Surabaya":   { lat: -7.2575,  lon: 112.7521, province: "Jawa Timur",  iata: "SUB", station: "SGU",  bookingId: "-2698521", destType: "city",   taLocationId: "297710" },
  "Jakarta":    { lat: -6.2088,  lon: 106.8456, province: "DKI Jakarta", iata: "CGK", station: "GMR",  bookingId: "-2679652", destType: "city",   taLocationId: "297715" },
  "Banyuwangi": { lat: -8.2192,  lon: 114.3691, province: "Jawa Timur",  iata: "BWX", station: "BW",   bookingId: "-2671874", destType: "city",   taLocationId: "311044" },
  "Yogyakarta": { lat: -7.7956,  lon: 110.3695, province: "DIY",         iata: "YIA", station: "YK",   bookingId: "-2703546", destType: "city",   taLocationId: "297725" },
  "Bandung":    { lat: -6.9175,  lon: 107.6191, province: "Jawa Barat",  iata: "BDO", station: "BD",   bookingId: "-2671576", destType: "city",   taLocationId: "297704" },
  "Bali":       { lat: -8.4095,  lon: 115.1889, province: "Bali",        iata: "DPS", station: "NONE", bookingId: "-2671493", destType: "region", taLocationId: "469404" },
  "Malang":     { lat: -7.9666,  lon: 112.6326, province: "Jawa Timur",  iata: "MLG", station: "ML",   bookingId: "-2686817", destType: "city",   taLocationId: "297702" },
  "Lombok":     { lat: -8.6529,  lon: 116.3249, province: "NTB",         iata: "LOP", station: "NONE", bookingId: "-2683072", destType: "region", taLocationId: "574872" },
};

// =========================================================================
// UTILITIES
// =========================================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getTransportMode(distanceKm: number): { mode: string; icon: string; station: string; modeReturnIcon: string } {
  if (distanceKm < 100)  return { mode: "Mobil / Travel Darat",      icon: "🚗", station: "Pool Travel",           modeReturnIcon: "🚘" };
  if (distanceKm <= 450) return { mode: "Kereta Api / Bus Executive", icon: "🚆", station: "Stasiun / Terminal",    modeReturnIcon: "🚉" };
  return                        { mode: "Pesawat Terbang",            icon: "🛫", station: "Bandara Keberangkatan", modeReturnIcon: "🛬" };
}

function formatDateLocal(date: Date): string {
  const d     = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
}

async function fetchRealTransportPrice(
  mode: string, originCity: string, destCity: string,
  date: string, API_KEY: string, distanceKm: number
): Promise<number> {
  try {
    const origin = CITY_REGISTRY[originCity];
    const dest   = CITY_REGISTRY[destCity];
    if (mode.includes("Pesawat") && origin?.iata && dest?.iata && dest.iata !== "NONE") {
      const url = `https://skyscanner44.p.rapidapi.com/search?adults=1&origin=${origin.iata}&destination=${dest.iata}&departureDate=${date}`;
      const res = await fetch(url, {
        headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": "skyscanner44.p.rapidapi.com" },
      });
      const data = await res.json();
      if (data?.itineraries?.[0]?.pricing_options?.[0]?.price?.amount) {
        return data.itineraries[0].pricing_options[0].price.amount * 2;
      }
    }
    if (mode.includes("Pesawat")) return (1200000 + distanceKm * 600) * 2;
    if (mode.includes("Kereta"))  return (250000  + distanceKm * 400) * 2;
    return                               (150000  + distanceKm * 800) * 2;
  } catch {
    return (150000 + distanceKm * 800) * 2;
  }
}

// =========================================================================
// TYPES
// =========================================================================
type NodePOI = {
  id: string; name: string; lat: number; lon: number;
  type: string; cost: number; icon: string;
  rating?: number; isPopular?: boolean; familyFriendly?: boolean;
  vibe?: string; openHour?: number; closeHour?: number;
};

interface BeamState {
  location: NodePOI;
  time: number;        // menit dari 00:00
  visited: Set<string>;
  budgetUsed: number;
  score: number;
}

// =========================================================================
// TRIPADVISOR POI FETCH
// =========================================================================
async function fetchOpenTripMapPOIs(
  cityName: string,
  hotelLat: number,
  hotelLon: number,
  preferences: string[]
): Promise<NodePOI[]> {
  const mainPref = preferences?.[0] ?? "Wisata";

  const kindsMap: Record<string, string> = {
    Gunung: "natural", Pantai: "beaches", Kuliner: "restaurants",
    Budaya: "cultural", Wisata: "interesting_places",
  };
  const iconMap: Record<string, string> = {
    Gunung: "⛰️", Kuliner: "🍽️", Pantai: "🏖️", Budaya: "🏛️", Wisata: "📸",
  };

  const kinds   = kindsMap[mainPref] ?? "interesting_places";
  const poiIcon = iconMap[mainPref]  ?? "📸";
  const OTM_KEY = process.env.OPENTRIPMAP_KEY;

  const fallback = (): NodePOI[] => [
    { id: "poi1", name: `Destinasi ${mainPref} ${cityName}`,          lat: hotelLat + 0.015, lon: hotelLon - 0.010, type: mainPref, cost: 50000,  icon: poiIcon, rating: 4.0, isPopular: true,  familyFriendly: true },
    { id: "poi2", name: `Eksplorasi ${mainPref} Sekitar ${cityName}`, lat: hotelLat + 0.020, lon: hotelLon + 0.005, type: mainPref, cost: 75000,  icon: "🗺️",   rating: 3.8, isPopular: false, familyFriendly: true },
    { id: "poi3", name: `Pusat Oleh-oleh Khas ${cityName}`,           lat: hotelLat - 0.010, lon: hotelLon + 0.020, type: "Belanja", cost: 150000, icon: "🛍️",   rating: 4.2, isPopular: true,  familyFriendly: true },
  ];

  if (!OTM_KEY) return fallback();

  try {
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon=${hotelLon}&lat=${hotelLat}&kinds=${kinds}&limit=5&format=json&apikey=${OTM_KEY}`;
    const res = await fetch(url);
    if (!res.ok) return fallback();

    const list: any[] = await res.json();
    if (!Array.isArray(list) || list.length === 0) return fallback();

    const nodes: NodePOI[] = list
      .filter(p => p?.point?.lat && p?.point?.lon && p?.name)
      .slice(0, 3)
      .map((p, idx) => ({
        id:            `otm-${idx}`,
        name:          p.name,
        lat:           p.point.lat,
        lon:           p.point.lon,
        type:          mainPref,
        cost:          75000,
        icon:          poiIcon,
        rating:        p.rate ? Math.min(5, p.rate / 2) : 4.0,
        isPopular:     (p.rate ?? 0) > 5,
        familyFriendly: true,
        openHour:      8,
        closeHour:     21,
      }));

    return nodes.length > 0 ? nodes : fallback();
  } catch {
    return fallback();
  }
}

// =========================================================================
// CORE ALGORITHMS
// =========================================================================

// MODUL 1 — Hash Indexing
function formulaHash(str: string, M = 200): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) sum += str.charCodeAt(i) * (i + 1);
  return sum % M;
}

// Helper — Haversine Distance (km)
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R    = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a    =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)) * 1.25;
}

// Helper — Haversine antara dua NodePOI
function haversineKm(a: NodePOI, b: NodePOI): number {
  return haversineDistance(a.lat, a.lon, b.lat, b.lon);
}

// MODUL 3A — h(n): Fitness Score (sesuai gambar)
function fitnessScore(
  poi: NodePOI,
  preferences: string[],
  dailyBudget: number,
  withFamily: boolean
): number {
  const pref   = preferences.includes(poi.type) ? 1 : 0;                        // 0.25
  const vibe   = preferences.includes("Healing") && poi.vibe === "healing"
               ? 1 : preferences.includes("Adventure") && poi.vibe === "adventure"
               ? 1 : 0;                                                           // 0.20
  const budget = dailyBudget > 0
               ? Math.max(0, 1 - poi.cost / dailyBudget)
               : 0;                                                               // 0.20
  const rating = (poi.rating ?? 0) / 5;                                          // 0.15
  const pop    = poi.isPopular ? 1 : 0;                                          // 0.10
  const fam    = withFamily ? (poi.familyFriendly ? 1 : 0) : 1;                 // 0.10

  return (
    0.25 * pref   +
    0.20 * vibe   +
    0.20 * budget +
    0.15 * rating +
    0.10 * pop    +
    0.10 * fam
  );
}

// MODUL 3B — Hard Constraints Filter (sesuai gambar)
function passesConstraints(
  poi: NodePOI,
  state: BeamState,
  withFamily: boolean,
  distanceFromLastKm: number,
  dailyDistanceSoFar: number
): boolean {
  const currentHour = Math.floor(state.time / 60);
  if (currentHour < (poi.openHour ?? 8))  return false;  // jam operasional
  if (currentHour > (poi.closeHour ?? 21)) return false; // jam operasional
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; // maks 50 km/hari
  if (withFamily && !poi.familyFriendly) return false;   // family filter
  if (state.visited.has(poi.id)) return false;            // sudah dikunjungi
  return true;
}

// MODUL 3C — Beam Search per hari (sesuai gambar, beam width = 8)
const BEAM_WIDTH = 8;

function beamSearchDay(
  startPOI: NodePOI,
  candidates: NodePOI[],
  preferences: string[],
  dailyBudget: number,
  withFamily: boolean,
  maxActivities: number
): NodePOI[] {
  let beams: BeamState[] = [{
    location:   startPOI,
    time:       8 * 60,  // mulai 08:00
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

        const travelMinutes = (distKm / 40) * 60; // 40 km/h
        const newTime       = state.time + travelMinutes + 90; // +90 menit kunjungan
        const newBudget     = state.budgetUsed + poi.cost;    // g(n) kumulatif

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

// MODUL 4 — Cosine Similarity
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot   += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  return normA === 0 || normB === 0 ? 0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// =========================================================================
// MAIN ROUTE HANDLER
// =========================================================================
export async function POST(req: Request) {
  console.log("\n================ MULAI GENERATE ITINERARY ================");

  try {
    const body = await req.json();
    const { budget, duration, preferences, originCity } = body;
    const API_KEY = process.env.RAPIDAPI_KEY;

    if (!API_KEY) {
      return NextResponse.json({ success: false, error: "API Key RapidAPI belum di-setting!" }, { status: 401 });
    }

    const totalDays    = duration === "2D1N" ? 2 : duration === "3D2N" ? 3 : duration === "Custom" ? 4 : 1;
    const withFamily   = preferences?.includes("Family") ?? false;
    const checkinDate  = formatDateLocal(new Date(Date.now() + 10 * 86400000));
    const checkoutDate = formatDateLocal(new Date(Date.now() + (10 + Math.max(1, totalDays - 1)) * 86400000));
    const shuffledCities = Object.keys(CITY_REGISTRY).sort(() => 0.5 - Math.random()).slice(0, 5);

    // =====================================================================
    // STEP 1 — Booking.com Hotel Fetch
    // =====================================================================
    const rawAccommodations: any[] = [];

    for (const cityName of shuffledCities) {
      const cityData = CITY_REGISTRY[cityName];
      if (!cityData?.bookingId) continue;

      const params = new URLSearchParams({
        checkin_date: checkinDate, checkout_date: checkoutDate,
        dest_id: cityData.bookingId, dest_type: cityData.destType,
        adults_number: "1", room_number: "1",
        order_by: "popularity", units: "metric",
        locale: "en-gb", filter_by_currency: "IDR",
      });

      try {
        const res = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/search?${params}`, {
          headers: { "X-RapidAPI-Key": API_KEY, "X-RapidAPI-Host": "booking-com.p.rapidapi.com" },
        });
        if (!res.ok) { await delay(1000); continue; }

        const data = await res.json();
        if (data.result?.length > 0) {
          data.result.slice(0, 4).forEach((item: any, idx: number) => {
            const realTotalPrice = item.min_total_price ?? 150000 * totalDays;
            const realCostPerDay = Math.floor(realTotalPrice / Math.max(1, totalDays - 1));
            rawAccommodations.push({
              id:            item.hotel_id ?? `api-${cityName}-${idx}`,
              name:          item.hotel_name ?? "Hotel Tidak Diketahui",
              city:          cityName,
              province:      cityData.province,
              tags:          [...(preferences ?? []), idx % 2 === 0 ? "Solo Trip" : "Healing", "API Data"],
              costPerDay:    realCostPerDay,
              totalBaseCost: realTotalPrice,
              rating:        item.review_score ?? 4.0,
              lat:           item.latitude  ?? cityData.lat,
              lon:           item.longitude ?? cityData.lon,
              icon:          realCostPerDay > 1000000 ? "🏨" : "🏡",
            });
          });
        }
      } catch (e) {
        console.error(`[Booking] Gagal: ${cityName}`, e);
      }
      await delay(1000);
    }

    // =====================================================================
    // STEP 2 — Modul 1 & 2: Hash + Weighted Scoring
    // =====================================================================
    const hashBuckets: Record<number, any[]> = {};
    rawAccommodations.forEach(item => {
      const bucket = formulaHash(item.name);
      if (!hashBuckets[bucket]) hashBuckets[bucket] = [];
      hashBuckets[bucket].push(item);
    });
    const indexedItems = Object.values(hashBuckets).flat();

    const origin    = CITY_REGISTRY[originCity] ?? CITY_REGISTRY["Surabaya"];
    const prefArray = preferences ?? [];
    const w1 = 0.5, w2 = 0.3, w3 = 0.2;

    // ✅ SESUDAH — pakai fungsi helper yang sama persis dengan perhitungan aktual
function estimateTransportCost(distanceKm: number): number {
  if (distanceKm < 100)  return (150000 + distanceKm * 800) * 2;
  if (distanceKm <= 450) return (250000 + distanceKm * 400) * 2;
  return                        (1200000 + distanceKm * 600) * 2;
}

function estimateTotalCost(item: any, distanceKm: number, totalDays: number): number {
  const hotel     = item.costPerDay * Math.max(0, totalDays - 1);
  const transport = estimateTransportCost(distanceKm);
  const food      = Math.floor((150000 + item.costPerDay * 0.05) * totalDays);
  const ticket    = Math.floor((100000 + item.costPerDay * 0.05) * totalDays);
  return hotel + transport + food + ticket;
}


// Di scoredItems:
const scoredItems = indexedItems.map(item => {
  const distance      = haversineDistance(origin.lat, origin.lon, item.lat, item.lon);
  const grandTotalEst = estimateTotalCost(item, distance, totalDays); // ← wajib ada fungsi ini

  const nBudget = budget >= grandTotalEst ? 1 : Math.max(0, 1 - (grandTotalEst - budget) / budget);
  const nTag    = prefArray.length > 0
    ? item.tags.filter((t: string) => prefArray.includes(t)).length / prefArray.length
    : 0.5;
  const nDist   = 1 / (1 + distance / 600);

  return {
    ...item,
    finalScore: w1 * nBudget + w2 * nTag + w3 * nDist,
    distanceKm: distance,
    grandTotalEst,  // ← WAJIB ADA INI
    nBudget, nTag, nDist,
  };
});

// Filter pakai grandTotalEst
const affordableItems = scoredItems.filter(item => item.grandTotalEst <= budget);

console.log("[DEBUG] Budget user:", budget);
console.log("[DEBUG] scoredItems grandTotalEst:", scoredItems.map(i => ({
  name: i.name, city: i.city, grandTotalEst: i.grandTotalEst
})));
console.log("[DEBUG] affordableItems count:", affordableItems.length);

// Kalau tidak ada satupun yang muat → tolak, kasih pesan ke user
if (affordableItems.length === 0) {
  const cheapestOption = scoredItems.sort((a, b) => a.grandTotalEst - b.grandTotalEst)[0];
  const minBudgetNeeded = cheapestOption?.grandTotalEst ?? 0;

  return NextResponse.json({
    success: false,
    errorType: "BUDGET_TOO_LOW",
    error: `Budget Rp${budget.toLocaleString("id-ID")} tidak cukup untuk perjalanan ${duration}. Tidak ada destinasi yang ditemukan dalam range budget kamu.`,
    suggestion: `Naikkan budget minimal menjadi Rp${minBudgetNeeded.toLocaleString("id-ID")} untuk bisa mendapatkan rekomendasi.`,
    minBudgetNeeded,
  }, { status: 422 });
}

const primarySelection = affordableItems.sort((a, b) => b.finalScore - a.finalScore)[0];

    const transport     = getTransportMode(primarySelection.distanceKm);
    const transportCost = Math.floor(await fetchRealTransportPrice(transport.mode, originCity, primarySelection.city, checkinDate, API_KEY, primarySelection.distanceKm));
    const hotelCost     = Math.floor(primarySelection.costPerDay * Math.max(0, totalDays - 1));
    const foodCost      = Math.floor((150000 + primarySelection.costPerDay * 0.05) * totalDays);
    const ticketCost    = Math.floor((100000 + primarySelection.costPerDay * 0.05) * totalDays);

    // =====================================================================
    // STEP 3 — Modul 3: Fetch POI + Beam Search Itinerary
    // =====================================================================

    // ✅ Fetch POI dulu — ini yang sebelumnya hilang
    const realPOIs = await fetchOpenTripMapPOIs(
      primarySelection.city,
      primarySelection.lat,
      primarySelection.lon,
      prefArray
    );

    // Node hotel sebagai titik start
    const hotelNode: NodePOI = {
      id:   "start",
      name: `Hotel: ${primarySelection.name}`,
      lat:  primarySelection.lat,
      lon:  primarySelection.lon,
      type: "Hotel",
      cost: 0,
      icon: "🏨",
      rating:        primarySelection.rating ?? 4.0,
      isPopular:     true,
      familyFriendly: true,
      openHour:      0,
      closeHour:     24,
    };

    const dailyBudget  = Math.floor((budget - transportCost - hotelCost) / totalDays);
    const maxActivitas = 3; // maks aktivitas per hari (hard constraint intensitas)

    const actualItinerary: any[] = [];

    for (let day = 1; day <= totalDays; day++) {
      // ✅ Beam search per hari — filter hard constraints sebelum eksplorasi
      const routeHari = beamSearchDay(
        hotelNode,
        realPOIs,
        prefArray,
        dailyBudget,
        withFamily,
        maxActivitas
      );

      // Susun jadwal hari ini
      if (day === 1) {
        actualItinerary.push({
          time: "08:00", icon: transport.icon,
          activity: `${transport.icon} Berangkat dari ${originCity} via ${transport.mode}`,
          location: transport.station,
          cost: Math.floor(transportCost / 2),
        });
        if (totalDays > 1) {
          actualItinerary.push({
            time: "14:00", icon: "🏨",
            activity: `🏨 Check-in di ${primarySelection.name}`,
            location: primarySelection.city,
            cost: hotelCost,
          });
        }
      } else {
        actualItinerary.push({
          time: "08:00", icon: "🍳",
          activity: `🍳 Sarapan di ${primarySelection.name}`,
          location: primarySelection.city,
          cost: Math.floor(foodCost / (totalDays * 3)),
        });
      }

      // Ambil POI hasil beam search untuk hari ini
      const midActivity = routeHari[0] ?? realPOIs[0];
      const eveActivity = routeHari[1] ?? realPOIs[1] ?? midActivity;

      actualItinerary.push(
        { time: "11:00", icon: midActivity.icon, activity: midActivity.name, location: `Sekitar ${primarySelection.city}`, cost: midActivity.cost },
        { time: "18:00", icon: eveActivity.icon, activity: eveActivity.name, location: `Sekitar ${primarySelection.city}`, cost: eveActivity.cost },
      );

      if (day === totalDays) {
        const lastPOI = routeHari[2] ?? realPOIs[realPOIs.length - 1] ?? eveActivity;
        actualItinerary.push(
          { time: "14:00", icon: lastPOI.icon, activity: lastPOI.name, location: `Sekitar ${primarySelection.city}`, cost: lastPOI.cost },
          { time: "20:00", icon: "🏠", activity: `${transport.modeReturnIcon} Pulang ke ${originCity} via ${transport.mode}`, location: "Rumah", cost: Math.floor(transportCost / 2) },
        );
      }
    }

    // =====================================================================
    // STEP 4 — Modul 4: Cosine Similarity untuk alternatif
    // =====================================================================
    const mainVec = [primarySelection.nBudget, primarySelection.nTag, primarySelection.nDist];
    const sortedAlternatives = scoredItems
      .filter(d => d.id !== primarySelection.id)
      .map(item => ({
        ...item,
        similarityScore: cosineSimilarity(mainVec, [item.nBudget, item.nTag, item.nDist]),
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore);

    const mapToAlt = (d: any, label: string) => ({
      id: d.id, name: d.name, city: d.city, province: d.province, image: d.icon,
      distanceLabel:  `${Math.round(d.distanceKm)} km (${Math.round(d.similarityScore * 100)}% Mirip)`,
      estimatedCost:  { [duration]: Math.floor(d.totalBaseCost + transportCost + foodCost + ticketCost) },
      badges:         [label, `⭐ ${d.rating}`, d.city],
    });

    return NextResponse.json({
      success: true,
      data: {
        durationKey: duration,
        main: {
          id:             primarySelection.id,
          name:           primarySelection.name,
          city:           primarySelection.city,
          province:       primarySelection.province,
          image:          primarySelection.icon,
          distanceLabel:  `Jarak: ${Math.round(primarySelection.distanceKm)} km | Transport: ${transport.mode}`,
          estimatedCost:  { [duration]: transportCost + hotelCost + foodCost + ticketCost },
          transportCost, hotelCost, foodCost, ticketCost,
          badges:         [`⭐ Rating: ${primarySelection.rating}`, transport.mode, ...primarySelection.tags],
          hiddenGems:     realPOIs.map(p => p.name).slice(0, 3),
          itinerary:      { [duration]: actualItinerary },
        },
        alternatives: sortedAlternatives.slice(0, 3).map(d => mapToAlt(d, "Kecocokan Tinggi")),
        cheaper:      sortedAlternatives.filter(d => d.totalBaseCost < primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlt(d, "Opsi Hemat")),
        pricier:      sortedAlternatives.filter(d => d.totalBaseCost > primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlt(d, "Opsi Premium")),
      },
    });

  } catch (error) {
    console.error("🚨 FATAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Sistem gagal memproses." }, { status: 500 });
  }
}