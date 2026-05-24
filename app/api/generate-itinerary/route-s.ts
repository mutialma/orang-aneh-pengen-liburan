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
// UTILITIES
// =========================================================================
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const straightDistance = R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
  return straightDistance * 1.25; 
}

function getTransportMode(distanceKm: number): { mode: string, icon: string, station: string, modeReturnIcon: string } {
  if (distanceKm < 100) return { mode: "Mobil / Travel Darat", icon: "🚗", station: "Pool Travel", modeReturnIcon: "🚘" };
  if (distanceKm >= 100 && distanceKm <= 450) return { mode: "Kereta Api / Bus Executive", icon: "🚆", station: "Stasiun / Terminal", modeReturnIcon: "🚉" };
  return { mode: "Pesawat Terbang", icon: "🛫", station: "Bandara Keberangkatan", modeReturnIcon: "🛬" };
}

function djb2Hash(str: string, tableSize: number = 200): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) hash = (hash * 33) ^ str.charCodeAt(i);
  return Math.abs(hash) % tableSize;
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
    console.log("[LOG DETEKTIF] API Transportasi error/limit, pakai harga estimasi.");
    return (150000 + (distanceKm * 800)) * 2; 
  }
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
      console.log("[LOG DETEKTIF ERROR] API Key belum disetting di .env!");
      return NextResponse.json({ success: false, error: "API Key RapidAPI belum di-setting!" }, { status: 401 });
    }

    let totalDays = 1;
    if (duration === "2D1N") totalDays = 2;
    if (duration === "3D2N") totalDays = 3;
    if (duration === "Custom") totalDays = 4;

    let rawAccommodations: any[] = [];
    const allCities = Object.keys(CITY_REGISTRY);
    const shuffledCities = allCities.sort(() => 0.5 - Math.random()).slice(0, 2);
    
    console.log(`[LOG DETEKTIF 2] Mencari data untuk kota: ${shuffledCities.join(", ")}`);

     
    const targetCheckin = new Date();
    targetCheckin.setDate(targetCheckin.getDate() + 10); 
    const checkinDate = formatDateLocal(targetCheckin);

    const targetCheckout = new Date(targetCheckin);
    targetCheckout.setDate(targetCheckout.getDate() + Math.max(1, totalDays - 1));
    const checkoutDate = formatDateLocal(targetCheckout);

    console.log(`[LOG DETEKTIF DATE CHECK] Check-in: ${checkinDate} | Check-out: ${checkoutDate}`);

    // =========================================================================
    // STEP 1: API FETCHING
    // =========================================================================
    let successCount = 0;

    try {
      for (let i = 0; i < shuffledCities.length; i++) {
        const cityName = shuffledCities[i];
        const cityData = CITY_REGISTRY[cityName];
        const destId = cityData?.bookingId;
        const destType = cityData?.destType || "city";

        if (destId) {
          console.log(`[LOG DETEKTIF 3] Fetching API Booking untuk kota: ${cityName} (ID: ${destId}, Type: ${destType})...`);
          
          
          const queryParams = new URLSearchParams({
            checkin_date: checkinDate,
            checkout_date: checkoutDate,
            dest_id: destId,
            dest_type: destType,
            adults_number: "1",
            room_number: "1",
            order_by: "popularity",       
            units: "metric",              
            locale: "en-gb",              
            filter_by_currency: "IDR"
          });

          const searchUrl = `https://booking-com.p.rapidapi.com/v1/hotels/search?${queryParams.toString()}`;
          
          const res = await fetch(searchUrl, {
            headers: { 
              'X-RapidAPI-Key': API_KEY, 
              'X-RapidAPI-Host': 'booking-com.p.rapidapi.com' 
            }
          });
          
          console.log(`[LOG DETEKTIF 4] Status Response ${cityName}: ${res.status} ${res.statusText}`);

          if (!res.ok) {
            console.log(`[LOG DETEKTIF 5] ❌ API Gagal / Kena Limit! Status: ${res.status}. Lanjut coba kota berikutnya.`);
            continue; 
          }
          
          const data = await res.json();
          successCount++;
          
          if (data.result && data.result.length > 0) {
            console.log(`[LOG DETEKTIF 6] ✅ Dapet ${data.result.length} hotel dari ${cityName}`);
            data.result.slice(0, 4).forEach((item: any, idx: number) => {
              const realTotalPrice = item.min_total_price || (150000 * totalDays); 
              const realCostPerDay = Math.floor(realTotalPrice / Math.max(1, (totalDays - 1)));
              
              rawAccommodations.push({
                id: item.hotel_id || `api-${i}-${idx}`,
                name: item.hotel_name,
                city: cityName,
                province: cityData?.province || "Indonesia",
                tags: [...(preferences || []), idx % 2 === 0 ? "Solo Trip" : "Healing", "API Data"],
                costPerDay: realCostPerDay, 
                totalBaseCost: realTotalPrice, 
                rating: item.review_score || parseFloat((3.5 + (idx % 15) * 0.1).toFixed(1)),
                lat: item.latitude || cityData?.lat,
                lon: item.longitude || cityData?.lon,
                icon: realCostPerDay > 1000000 ? "🏨" : "🏡"
              });
            });
          } else {
             console.log(`[LOG DETEKTIF 6] ⚠️ Result kosong dari API untuk ${cityName}`);
          }

          if (i < shuffledCities.length - 1) {
            console.log(`[LOG DETEKTIF 7] Delay 1.5 detik agar aman dari limit...`);
            await delay(1500); 
          }
        }
      }
    } catch (err) {
      console.error("[LOG DETEKTIF ERROR] Gagal saat fetch API:", err);
    }

    // =========================================================================
    // STEP 2: CEK HASIL API & LOGGING
    // =========================================================================
    console.log(`[LOG DETEKTIF 8] Total data akomodasi dari API: ${rawAccommodations.length}`);

    if (successCount === 0) {
      console.log("🚨 [LOG DETEKTIF 9] SEMUA KOTA GAGAL DI-FETCH DARI API.");
      return NextResponse.json({ 
        success: false, 
        error: "Gagal memanggil API Booking.com untuk semua kota pilihan akibat kesalahan validasi data (422) atau limit kuota." 
      }, { status: 429 });
    }

    if (rawAccommodations.length === 0) {
      console.log("🚨 [LOG DETEKTIF 9] API SUKSES DIPANGGIL TAPI DATANYA KOSONG!");
      return NextResponse.json({ 
        success: false, 
        error: "API berhasil dipanggil, tapi tidak ada penginapan yang tersedia di tanggal tersebut." 
      }, { status: 404 });
    }

    // =========================================================================
    // STEP 3: SCORING & ITINERARY GENERATION
    // =========================================================================
    console.log("[LOG DETEKTIF 11] Memulai Scoring...");
    const hashBuckets: Record<number, any[]> = {};
    rawAccommodations.forEach(item => {
      const bucketId = djb2Hash(item.name);
      if (!hashBuckets[bucketId]) hashBuckets[bucketId] = [];
      hashBuckets[bucketId].push(item);
    });
    const indexedItems = Object.values(hashBuckets).flat();

    const origin = CITY_REGISTRY[originCity] || CITY_REGISTRY["Surabaya"];

    const scoredItems = indexedItems.map(item => {
      const distance = haversineDistance(origin.lat, origin.lon, item.lat, item.lon);
      
      const nights = Math.max(0, totalDays - 1);
      const estimatedHotelCost = item.costPerDay * nights;
      const estimatedTransport = distance * 800 * 2; 
      const estimatedFoodAndTicket = 300000 * totalDays; 
      const grandTotalEstimate = estimatedHotelCost + estimatedTransport + estimatedFoodAndTicket;

      const remainingBudget = budget - grandTotalEstimate;
      let bScore = 0;
      if (remainingBudget >= 0) {
         bScore = 1; 
      } else {
         bScore = Math.max(0, 1 - (Math.abs(remainingBudget) / budget)) * 0.1; 
      }
      
      const prefArray = preferences || [];
      const matchCount = item.tags.filter((t: string) => prefArray.includes(t)).length;
      const tScore = prefArray.length > 0 ? matchCount / prefArray.length : 0.5;
      
      const dScore = 1 / (1 + (distance / 600));
      const rScore = (item.rating - 3.0) / (5.0 - 3.0);
      
      const finalScore = (0.50 * bScore) + (0.20 * tScore) + (0.10 * dScore) + (0.20 * rScore);

      return { ...item, finalScore, distanceKm: distance };
    });

    const sortedResult = scoredItems.sort((a, b) => b.finalScore - a.finalScore);
    const primarySelection = sortedResult[0];

    if (!primarySelection) {
      console.log("[LOG DETEKTIF ERROR] primarySelection kosong!");
      throw new Error("Gagal menentukan destinasi utama.");
    }

    console.log(`[LOG DETEKTIF 12] Pemenang Destinasi: ${primarySelection.name} (${primarySelection.city})`);

    const transport = getTransportMode(primarySelection.distanceKm);

    const realTransportCost = await fetchRealTransportPrice(
      transport.mode, 
      originCity, 
      primarySelection.city, 
      checkinDate, 
      API_KEY, 
      primarySelection.distanceKm
    );

    const transportCost = Math.floor(realTransportCost);
    const nights = Math.max(0, totalDays - 1);
    const hotelCost = Math.floor(primarySelection.costPerDay * nights);
    const foodCost = Math.floor((150000 + (primarySelection.costPerDay * 0.05)) * totalDays);
    const ticketCost = Math.floor((100000 + (primarySelection.costPerDay * 0.05)) * totalDays);

    const totalAllocated = transportCost + hotelCost + foodCost + ticketCost;

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

      actualItinerary.push(
        { time: "10:00", activity: `📸 Wisata ${primarySelection.tags[0] || "Lokal"}`, location: `Kawasan ${primarySelection.city}`, cost: Math.floor(ticketCost / totalDays), icon: "📸" },
        { time: "19:00", activity: `🍽️ Makan Malam Populer (Rating ⭐${primarySelection.rating})`, location: `Pusat Kota ${primarySelection.city}`, cost: Math.floor(foodCost / (totalDays * 2)), icon: "🍽️" }
      );

      if (day === totalDays) {
        actualItinerary.push(
          { time: "16:00", activity: `🛍️ Beli Oleh-oleh Khas ${primarySelection.province}`, location: `Pusat Oleh-oleh`, cost: 150000, icon: "🛍️" },
          { time: "20:00", activity: `${transport.modeReturnIcon} Perjalanan pulang ke ${originCity} via ${transport.mode}`, location: "Rumah", cost: Math.floor(transportCost / 2), icon: "🏠" }
        );
      }
    }

    const sideItems = sortedResult.filter(d => d.id !== primarySelection.id);
    const mapToAlternativeFormat = (d: any, label: string) => ({
      id: d.id, name: d.name, city: d.city, province: d.province, image: d.icon,
      distanceLabel: `${Math.round(d.distanceKm)} km via ${getTransportMode(d.distanceKm).mode}`, 
      estimatedCost: { [duration]: Math.floor(d.totalBaseCost + realTransportCost + foodCost + ticketCost) }, 
      badges: [label, `⭐ ${d.rating}`, d.city]
    });

    const alternatives = sideItems.slice(0, 3).map(d => mapToAlternativeFormat(d, "Kecocokan Tinggi"));
    const cheaper = sideItems.filter(d => d.totalBaseCost < primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlternativeFormat(d, "Opsi Hemat"));
    const pricier = sideItems.filter(d => d.totalBaseCost > primarySelection.totalBaseCost).slice(0, 3).map(d => mapToAlternativeFormat(d, "Opsi Premium"));

    console.log("[LOG DETEKTIF 13] SUKSES! Mengirim data ke Frontend.");
    
    return NextResponse.json({
      success: true,
      data: {
        durationKey: duration,
        main: {
          id: primarySelection.id, name: primarySelection.name, city: primarySelection.city, province: primarySelection.province, image: primarySelection.icon,
          distanceLabel: `Jarak: ${Math.round(primarySelection.distanceKm)} km | Transport: ${transport.mode}`,
          estimatedCost: { [duration]: totalAllocated },
          transportCost, hotelCost, foodCost, ticketCost,
          badges: [`⭐ Rating: ${primarySelection.rating}`, transport.mode, ...primarySelection.tags],
          hiddenGems: [`Jalur wisata ${primarySelection.city}`, `Spot favorit lokal`],
          itinerary: { [duration]: actualItinerary }
        },
        alternatives, cheaper, pricier
      }
    });

  } catch (error) {
    console.error("🚨 [LOG DETEKTIF FATAL ERROR] Terjadi kegagalan di sistem utama:", error);
    return NextResponse.json({ success: false, error: "Sistem gagal memproses rekomendasi. Periksa console terminal." }, { status: 500 });
  }
}