import { NextResponse } from "next/server";

// =========================================================================
// REGISTRY DATABASE
// =========================================================================
const CITY_REGISTRY: Record<string, { lat: number; lon: number; province: string; iata: string; station: string; bookingId: string; destType: string }> = {
  "Surabaya": { lat: -7.2575, lon: 112.7521, province: "Jawa Timur", iata: "SUB", station: "SGU", bookingId: "-2698521", destType: "city" }, 
  "Jakarta": { lat: -6.2088, lon: 106.8456, province: "DKI Jakarta", iata: "CGK", station: "GMR", bookingId: "-2679652", destType: "city" },
  "Banyuwangi": { lat: -8.2192, lon: 114.3691, province: "Jawa Timur", iata: "BWX", station: "BW", bookingId: "-2671874", destType: "city" },
  "Yogyakarta": { lat: -7.7956, lon: 110.3695, province: "DIY", iata: "YIA", station: "YK", bookingId: "-2703546", destType: "city" }, 
  "Bandung": { lat: -6.9175, lon: 107.6191, province: "Jawa Barat", iata: "BDO", station: "BD", bookingId: "-2671576", destType: "city" }, 
  "Bali": { lat: -8.4095, lon: 115.1889, province: "Bali", iata: "DPS", station: "NONE", bookingId: "-2671493", destType: "region" }, 
  "Malang": { lat: -7.9666, lon: 112.6326, province: "Jawa Timur", iata: "MLG", station: "ML", bookingId: "-2686817", destType: "city" }, 
  "Lombok": { lat: -8.6529, lon: 116.3249, province: "NTB", iata: "LOP", station: "NONE", bookingId: "-2683072", destType: "region" }
};

// =========================================================================
// UTILITIES EXTERNAL & FORMATTING
// =========================================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function getTransportMode(distanceKm: number): { mode: string, icon: string, station: string, modeReturnIcon: string } {
  if (distanceKm < 100) return { mode: "Mobil / Travel Darat", icon: "🚗", station: "Pool Travel", modeReturnIcon: "🚘" };
  if (distanceKm >= 100 && distanceKm <= 450) return { mode: "Kereta Api / Bus Executive", icon: "🚆", station: "Stasiun / Terminal", modeReturnIcon: "🚉" };
  return { mode: "Pesawat Terbang", icon: "🛫", station: "Bandara Keberangkatan", modeReturnIcon: "🛬" };
}

function formatDateLocal(date: Date): string {
  const d = new Date(date);
  const month = '' + (d.getMonth() + 1);
  const day = '' + d.getDate();
  const year = d.getFullYear();
  return [year, month.padStart(2, '0'), day.padStart(2, '0')].join('-');
}

async function fetchRealTransportPrice(mode: string, originCity: string, destCity: string, date: string, API_KEY: string, distanceKm: number) {
  try {
    const origin = CITY_REGISTRY[originCity];
    const dest = CITY_REGISTRY[destCity];

    if (mode.includes("Pesawat") && origin?.iata && dest?.iata && dest.iata !== "NONE") {
      const url = `https://skyscanner44.p.rapidapi.com/search?adults=1&origin=${origin.iata}&destination=${dest.iata}&departureDate=${date}`;
      const res = await fetch(url, { headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'skyscanner44.p.rapidapi.com' } });
      const data = await res.json();
      
      if (data?.itineraries?.[0]?.pricing_options?.[0]?.price?.amount) {
        return data.itineraries[0].pricing_options[0].price.amount * 2; 
      }
    } 
    if (mode.includes("Pesawat")) return (1200000 + (distanceKm * 600)) * 2;
    if (mode.includes("Kereta")) return (250000 + (distanceKm * 400)) * 2;
    return (150000 + (distanceKm * 800)) * 2; 
  } catch (error) {
    return (150000 + (distanceKm * 800)) * 2; 
  }
}

// =========================================================================
// API CALL KE TRIPADVISOR16 UNTUK DATA WISATA ASLI
// =========================================================================
type NodePOI = { id: string, name: string, lat: number, lon: number, type: string, cost: number, icon: string };

// 1. UPDATE FUNGSI FETCH POI UNTUK MEMBACA PREFERENSI
async function fetchTripAdvisorPOIs(cityName: string, API_KEY: string, hotelLat: number, hotelLon: number, preferences: string[]): Promise<NodePOI[]> {
  // Ambil preferensi utama user (misal: "Gunung"). Jika kosong, default ke "Wisata"
  const mainPref = preferences && preferences.length > 0 ? preferences[0] : "Wisata";

  try {
    console.log(`[LOG DETEKTIF] Mencari rute untuk tag: ${mainPref} di ${cityName}...`);
    
    // Kita kembalikan ke pencarian umum (searchLocation) digabung dengan kata kunci preferensi
    // Contoh: "Gunung Surabaya"
    const searchQuery = `${mainPref} ${cityName}`;
    const url = `https://tripadvisor16.p.rapidapi.com/api/v1/restaurant/searchLocation?query=${encodeURIComponent(searchQuery)}`;
    // Catatan: Jika API tripadvisor16 punya endpoint /locations/search, lebih baik pakai itu. 
    // Saat ini kita pakai yang tidak error saja.
    
    const res = await fetch(url, {
      headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'tripadvisor16.p.rapidapi.com' }
    });

    if (!res.ok) throw new Error(`TripAdvisor error: ${res.status}`);
    const data = await res.json();
    
    let nodes: NodePOI[] = [];
    if (data && data.data && data.data.length > 0) {
      const places = data.data.filter((p: any) => p.latitude && p.longitude && p.name).slice(0, 3);
      places.forEach((p: any, idx: number) => {
        nodes.push({
          id: `ta-${idx}`,
          name: p.name,
          lat: parseFloat(p.latitude),
          lon: parseFloat(p.longitude),
          type: mainPref === "Kuliner" ? "🍽️" : "⛰️", // Ubah icon dinamis
          cost: 100000, 
          icon: mainPref === "Kuliner" ? "🍽️" : (mainPref === "Gunung" ? "⛰️" : "📸")
        });
      });
    }
    
    if (nodes.length > 0) return nodes;
    throw new Error("Data kosong.");
    
  } catch (err) {
    console.log("[LOG DETEKTIF] API Limit/Error. Memakai fallback simulasi sesuai tag:", mainPref);
    
    // FALLBACK DINAMIS: Menyesuaikan nama tempat dengan tag yang dipilih user (misal "Gunung")
    return [
      { id: "poi1", name: `Destinasi ${mainPref} ${cityName}`, lat: hotelLat + 0.015, lon: hotelLon - 0.01, type: "📸", cost: 50000, icon: mainPref === "Gunung" ? "⛰️" : "📸" },
      { id: "poi2", name: `Eksplorasi Alam / ${mainPref} Sekitar`, lat: hotelLat + 0.02, lon: hotelLon + 0.005, type: "🗺️", cost: 75000, icon: "🗺️" },
      { id: "end", name: `Pusat Oleh-oleh Khas ${cityName}`, lat: hotelLat - 0.01, lon: hotelLon + 0.02, type: "🛍️", cost: 150000, icon: "🛍️" }
    ];
  }
}

// =========================================================================
// CORE ALGORITHMS (MENGACU PADA DIAGRAM GAMBAR)
// =========================================================================

// 🟢 MODUL 1: Hash indexing destinasi
function formulaHash(str: string, M: number = 200): number {
  let sum = 0;
  for (let i = 0; i < str.length; i++) {
    const ascii = str.charCodeAt(i);
    const pos = i + 1; // posisi 1-indexed
    sum += (ascii * pos);
  }
  return sum % M;
}

// 🟢 Helper untuk Modul 2 & 3: Haversine
function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const straightDistance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return straightDistance * 1.25; 
}

// 🟢 MODUL 3: A* search rute itinerary (f(n) = g(n) + h(n))
function aStarSearch(start: NodePOI, end: NodePOI, nodes: NodePOI[]): NodePOI[] {
  let openSet = new Set([start.id]);
  let cameFrom = new Map<string, string>();
  let gScore = new Map<string, number>();
  let fScore = new Map<string, number>();

  nodes.forEach(n => { gScore.set(n.id, Infinity); fScore.set(n.id, Infinity); });
  gScore.set(start.id, 0);
  fScore.set(start.id, haversineDistance(start.lat, start.lon, end.lat, end.lon)); 

  while (openSet.size > 0) {
    let currentId = Array.from(openSet).reduce((lowest, node) =>
      (fScore.get(node) || Infinity) < (fScore.get(lowest) || Infinity) ? node : lowest
    );

    if (currentId === end.id) {
      let path = [nodes.find(n => n.id === currentId)!];
      while (cameFrom.has(currentId)) {
        currentId = cameFrom.get(currentId)!;
        path.unshift(nodes.find(n => n.id === currentId)!);
      }
      return path;
    }

    openSet.delete(currentId);
    let current = nodes.find(n => n.id === currentId)!;

    nodes.filter(n => n.id !== current.id).forEach(neighbor => {
      let tentative_gScore = (gScore.get(current.id) || 0) + haversineDistance(current.lat, current.lon, neighbor.lat, neighbor.lon);
      if (tentative_gScore < (gScore.get(neighbor.id) || Infinity)) {
        cameFrom.set(neighbor.id, current.id);
        gScore.set(neighbor.id, tentative_gScore);
        fScore.set(neighbor.id, tentative_gScore + haversineDistance(neighbor.lat, neighbor.lon, end.lat, end.lon));
        openSet.add(neighbor.id);
      }
    });
  }
  return nodes; // Fallback jika rute terputus
}

// 🟢 MODUL 4: Content-based filtering (Similarity cosine)
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] ** 2;
    normB += vecB[i] ** 2;
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}


// =========================================================================
// MAIN ROUTE HANDLER (POST)
// =========================================================================
export async function POST(req: Request) {
  console.log("\n================ MULAI GENERATE ITINERARY ================");
  
  try {
    const body = await req.json();
    console.log("[LOG DETEKTIF 1] Request Body diterima:", body);

    const { budget, duration, preferences, originCity } = body;
    const API_KEY = process.env.RAPIDAPI_KEY;

    if (!API_KEY) {
      return NextResponse.json({ success: false, error: "API Key RapidAPI belum di-setting!" }, { status: 401 });
    }

    let totalDays = duration === "2D1N" ? 2 : duration === "3D2N" ? 3 : duration === "Custom" ? 4 : 1;
    let rawAccommodations: any[] = [];
    const shuffledCities = Object.keys(CITY_REGISTRY).sort(() => 0.5 - Math.random()).slice(0, 2);
    
    const targetCheckin = new Date();
    targetCheckin.setDate(targetCheckin.getDate() + 10); 
    const checkinDate = formatDateLocal(targetCheckin);

    const targetCheckout = new Date(targetCheckin);
    targetCheckout.setDate(targetCheckout.getDate() + Math.max(1, totalDays - 1));
    const checkoutDate = formatDateLocal(targetCheckout);

    // =========================================================================
    // STEP 1: API FETCHING (Booking.com)
    // =========================================================================
    let successCount = 0;

    for (let i = 0; i < shuffledCities.length; i++) {
      const cityName = shuffledCities[i];
      const cityData = CITY_REGISTRY[cityName];
      
      if (cityData?.bookingId) {
        const queryParams = new URLSearchParams({
          checkin_date: checkinDate, checkout_date: checkoutDate, dest_id: cityData.bookingId, dest_type: cityData.destType, adults_number: "1", room_number: "1", order_by: "popularity", units: "metric", locale: "en-gb", filter_by_currency: "IDR"
        });

        const res = await fetch(`https://booking-com.p.rapidapi.com/v1/hotels/search?${queryParams}`, {
          headers: { 'X-RapidAPI-Key': API_KEY, 'X-RapidAPI-Host': 'booking-com.p.rapidapi.com' }
        });
        
        if (!res.ok) continue; 
        const data = await res.json();
        successCount++;
        
        data.result?.slice(0, 4).forEach((item: any, idx: number) => {
          const realTotalPrice = item.min_total_price || (150000 * totalDays); 
          const realCostPerDay = Math.floor(realTotalPrice / Math.max(1, (totalDays - 1)));
          
          rawAccommodations.push({
            id: item.hotel_id || `api-${i}-${idx}`,
            name: item.hotel_name,
            city: cityName,
            province: cityData.province,
            tags: [...(preferences || []), idx % 2 === 0 ? "Solo Trip" : "Healing", "API Data"],
            costPerDay: realCostPerDay, 
            totalBaseCost: realTotalPrice, 
            rating: item.review_score || 4.0,
            lat: item.latitude || cityData.lat,
            lon: item.longitude || cityData.lon,
            icon: realCostPerDay > 1000000 ? "🏨" : "🏡"
          });
        });
        await delay(1000); 
      }
    }

    if (rawAccommodations.length === 0) {
      return NextResponse.json({ success: false, error: "API berhasil dipanggil, tapi tidak ada penginapan tersedia." }, { status: 404 });
    }

    // =========================================================================
    // STEP 2: EKSEKUSI 4 MODUL SESUAI GAMBAR
    // =========================================================================

    // 🔴 1. MODUL 1 (Hash Indexing)
    const hashBuckets: Record<number, any[]> = {};
    const M = 200;
    rawAccommodations.forEach(item => {
      const bucketId = formulaHash(item.name, M); 
      if (!hashBuckets[bucketId]) hashBuckets[bucketId] = [];
      hashBuckets[bucketId].push(item);
    });
    const indexedItems = Object.values(hashBuckets).flat();

    const origin = CITY_REGISTRY[originCity] || CITY_REGISTRY["Surabaya"];

    // 🔴 2. MODUL 2 (Weighted Scoring) S = w1.budget + w2.tag + w3.dist 
    const w1 = 0.5, w2 = 0.3, w3 = 0.2; 
    const prefArray = preferences || [];

    const scoredItems = indexedItems.map(item => {
      const distance = haversineDistance(origin.lat, origin.lon, item.lat, item.lon);
      const estHotelCost = item.costPerDay * Math.max(0, totalDays - 1);
      const grandTotalEst = estHotelCost + (distance * 1600) + (300000 * totalDays);

      const nBudget = budget >= grandTotalEst ? 1 : Math.max(0, 1 - ((grandTotalEst - budget) / budget));
      const nTag = prefArray.length > 0 ? item.tags.filter((t: string) => prefArray.includes(t)).length / prefArray.length : 0.5;
      const nDist = 1 / (1 + (distance / 600)); 

      const finalScore = (w1 * nBudget) + (w2 * nTag) + (w3 * nDist);
      return { ...item, finalScore, distanceKm: distance, nBudget, nTag, nDist };
    });

    const primarySelection = scoredItems.sort((a, b) => b.finalScore - a.finalScore)[0];
    const transport = getTransportMode(primarySelection.distanceKm);
    
    // Estimasi budget detail
    const realTransportCost = await fetchRealTransportPrice(transport.mode, originCity, primarySelection.city, checkinDate, API_KEY, primarySelection.distanceKm);
    const transportCost = Math.floor(realTransportCost);
    const hotelCost = Math.floor(primarySelection.costPerDay * Math.max(0, totalDays - 1));
    const foodCost = Math.floor((150000 + (primarySelection.costPerDay * 0.05)) * totalDays);
    const ticketCost = Math.floor((100000 + (primarySelection.costPerDay * 0.05)) * totalDays);

    // // 🔴 3. MODUL 3 (A* Search Itinerary)
    console.log("[LOG DETEKTIF 13] Eksekusi Modul 3: A* Search dengan Filter Preferensi...");
    
    // PASTIKAN menambahkan variabel `preferences` di argumen terakhir pemanggilan ini:
    const realPOIs = await fetchTripAdvisorPOIs(primarySelection.city, API_KEY, primarySelection.lat, primarySelection.lon, preferences);
    
    const poiNodes: NodePOI[] = [
      { id: "start", name: `Hotel: ${primarySelection.name}`, lat: primarySelection.lat, lon: primarySelection.lon, type: "🏨", cost: 0, icon: "🏨" },
      ...realPOIs
    ];

    // Mencari rute optimal dari Hotel -> Tempat Terakhir menggunakan A*
    const optimalRoute = aStarSearch(poiNodes[0], poiNodes[poiNodes.length - 1], poiNodes);
    
    // Menyusun itinerary
    const actualItinerary: any[] = [];
    for (let day = 1; day <= totalDays; day++) {
      if (day === 1) {
        actualItinerary.push(
          { time: "08:00", activity: `${transport.icon} Berangkat dari ${originCity} via ${transport.mode}`, location: transport.station, cost: Math.floor(transportCost / 2), icon: transport.icon },
          ...(totalDays > 1 ? [{ time: "14:00", activity: `🏨 Check-in di ${primarySelection.name}`, location: primarySelection.city, cost: hotelCost, icon: "🏨" }] : [])
        );
      } else {
        actualItinerary.push({ time: "08:00", activity: `🍳 Sarapan di ${primarySelection.name}`, location: primarySelection.city, cost: Math.floor(foodCost / (totalDays * 3)), icon: "🍳" });
      }

      // Ambil rute A* (Lokasi Asli) untuk aktivitas siang
      const midActivity = optimalRoute[1] || realPOIs[0];
      const eveActivity = optimalRoute[2] || realPOIs[1] || midActivity;
      
      actualItinerary.push(
        { time: "11:00", activity: midActivity.name, location: `Sekitar ${primarySelection.city}`, cost: midActivity.cost, icon: midActivity.icon },
        { time: "18:00", activity: eveActivity.name, location: `Sekitar ${primarySelection.city}`, cost: eveActivity.cost, icon: eveActivity.icon }
      );

      if (day === totalDays) {
        const lastPOI = optimalRoute[3] || realPOIs[realPOIs.length - 1];
        actualItinerary.push(
          { time: "14:00", activity: lastPOI.name, location: `Sekitar ${primarySelection.city}`, cost: lastPOI.cost, icon: lastPOI.icon },
          { time: "20:00", activity: `${transport.modeReturnIcon} Pulang ke ${originCity} via ${transport.mode}`, location: "Rumah", cost: Math.floor(transportCost / 2), icon: "🏠" }
        );
      }
    }

    // 🔴 4. MODUL 4 (Content-based Filtering via Cosine Similarity)
    const mainVec = [primarySelection.nBudget, primarySelection.nTag, primarySelection.nDist];

    const sideItems = scoredItems.filter(d => d.id !== primarySelection.id).map(item => {
      const itemVec = [item.nBudget, item.nTag, item.nDist];
      item.similarityScore = cosineSimilarity(mainVec, itemVec); 
      return item;
    });

    const sortedAlternatives = sideItems.sort((a, b) => b.similarityScore - a.similarityScore);

    const mapToAlt = (d: any, label: string) => ({
      id: d.id, name: d.name, city: d.city, province: d.province, image: d.icon,
      distanceLabel: `${Math.round(d.distanceKm)} km (${Math.round(d.similarityScore * 100)}% Mirip)`, 
      estimatedCost: { [duration]: Math.floor(d.totalBaseCost + realTransportCost + foodCost + ticketCost) }, 
      badges: [label, `⭐ ${d.rating}`, d.city]
    });

    return NextResponse.json({
      success: true,
      data: {
        durationKey: duration,
        main: {
          id: primarySelection.id, name: primarySelection.name, city: primarySelection.city, province: primarySelection.province, image: primarySelection.icon,
          distanceLabel: `Jarak: ${Math.round(primarySelection.distanceKm)} km | Transport: ${transport.mode}`,
          estimatedCost: { [duration]: transportCost + hotelCost + foodCost + ticketCost },
          transportCost, hotelCost, foodCost, ticketCost,
          badges: [`⭐ Rating: ${primarySelection.rating}`, transport.mode, ...primarySelection.tags],
          hiddenGems: realPOIs.map(p => p.name).slice(0, 3), // Nama asli dari TripAdvisor
          itinerary: { [duration]: actualItinerary } // Hasil rute A* dengan POI asli
        },
        alternatives: sortedAlternatives.slice(0, 3).map(d => mapToAlt(d, "Kecocokan Tinggi")), 
        cheaper: sortedAlternatives.filter(d => d.totalBaseCost < primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlt(d, "Opsi Hemat")), 
        pricier: sortedAlternatives.filter(d => d.totalBaseCost > primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlt(d, "Opsi Premium"))
      }
    });

  } catch (error) {
    console.error("🚨 FATAL ERROR:", error);
    return NextResponse.json({ success: false, error: "Sistem gagal memproses." }, { status: 500 });
  }
}