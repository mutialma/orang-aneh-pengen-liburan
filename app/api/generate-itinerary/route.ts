import { NextResponse } from "next/server";
import { CITY_REGISTRY, NodePOI }          from "@/lib/Registry";
import { formulaHash, haversineDistance, weightedScore, beamSearchDay, cosineSimilarity } from "@/lib/Algorithms";
import { estimateTotalCost, calcCostBreakdown }                                           from "@/lib/weightedScore/estimator";
import { getTransportMode, fetchRealTransportPrice }                                      from "@/lib/weightedScore/transport";
import { fetchOpenTripMapPOIs }                                                           from "@/lib/estimateTransportCost/poi";

// =========================================================================
// UTILS
// =========================================================================
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

function formatDateLocal(date: Date): string {
  const d     = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day   = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${month}-${day}`;
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
    const withFamily   = (preferences ?? []).includes("Keluarga");
    const prefArray    = preferences ?? [];
    const checkinDate  = formatDateLocal(new Date(Date.now() + 10 * 86400000));
    const checkoutDate = formatDateLocal(new Date(Date.now() + (10 + Math.max(1, totalDays - 1)) * 86400000));

    const shuffledCities = Object.keys(CITY_REGISTRY)
      .sort(() => 0.5 - Math.random())
      .slice(0, 5);

    // ===================================================================
    // STEP 1 — Fetch Hotel dari Booking.com
    // ===================================================================
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
              tags:          [...prefArray, idx % 2 === 0 ? "Solo Trip" : "Healing", "API Data"],
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

    // ===================================================================
    // STEP 2 — Modul 1: Hash Indexing
    // ===================================================================
    const hashBuckets: Record<number, any[]> = {};
    rawAccommodations.forEach(item => {
      const bucket = formulaHash(item.name);
      if (!hashBuckets[bucket]) hashBuckets[bucket] = [];
      hashBuckets[bucket].push(item);
    });
    const indexedItems = Object.values(hashBuckets).flat();

    // ===================================================================
    // STEP 3 — Modul 2: Weighted Scoring + filter budget
    // ===================================================================
    const origin = CITY_REGISTRY[originCity] ?? CITY_REGISTRY["Surabaya"];

    const scoredItems = indexedItems.map(item => {
      const distance      = haversineDistance(origin.lat, origin.lon, item.lat, item.lon);
      const grandTotalEst = estimateTotalCost(item, distance, totalDays); // konsisten dgn output

      const nBudget = budget >= grandTotalEst ? 1 : Math.max(0, 1 - (grandTotalEst - budget) / budget);
      const nTag    = prefArray.length > 0
        ? item.tags.filter((t: string) => prefArray.includes(t)).length / prefArray.length
        : 0.5;
      const nDist   = 1 / (1 + distance / 600);

      return {
        ...item,
        finalScore: weightedScore(nBudget, nTag, nDist),
        distanceKm: distance,
        grandTotalEst,
        nBudget, nTag, nDist,
      };
    });

    // Hard filter: hanya yang masuk budget
    const affordableItems = scoredItems.filter(item => item.grandTotalEst <= budget);

    console.log("[DEBUG] Budget:", budget);
    console.log("[DEBUG] scoredItems:", scoredItems.map(i => ({ name: i.name, city: i.city, grandTotalEst: i.grandTotalEst })));
    console.log("[DEBUG] affordableItems:", affordableItems.length);

    // Kalau tidak ada yang muat → kembalikan error dengan saran
    if (affordableItems.length === 0) {
      const cheapest      = [...scoredItems].sort((a, b) => a.grandTotalEst - b.grandTotalEst)[0];
      const minBudgetNeeded = cheapest?.grandTotalEst ?? 0;

      return NextResponse.json({
        success:       false,
        errorType:     "BUDGET_TOO_LOW",
        error:         `Budget Rp${Number(budget).toLocaleString("id-ID")} tidak cukup untuk perjalanan ${duration}. Tidak ada destinasi yang ditemukan.`,
        suggestion:    `Naikkan budget minimal menjadi Rp${minBudgetNeeded.toLocaleString("id-ID")} untuk mendapatkan rekomendasi.`,
        minBudgetNeeded,
      }, { status: 422 });
    }

    const primarySelection = [...affordableItems].sort((a, b) => b.finalScore - a.finalScore)[0];

    // ===================================================================
    // STEP 4 — Hitung biaya aktual
    // ===================================================================
    const transport     = getTransportMode(primarySelection.distanceKm);
    const transportCost = Math.floor(
      await fetchRealTransportPrice(transport.mode, originCity, primarySelection.city, checkinDate, API_KEY, primarySelection.distanceKm)
    );
    const { hotelCost, foodCost, ticketCost } = calcCostBreakdown(primarySelection, transportCost, totalDays);

    // ===================================================================
    // STEP 5 — Modul 3: Fetch POI + A* Itinerary
    // ===================================================================
    const realPOIs = await fetchOpenTripMapPOIs(
      primarySelection.city,
      primarySelection.lat,
      primarySelection.lon,
      prefArray
    );

    const hotelNode: NodePOI = {
      id:             "start",
      name:           `Hotel: ${primarySelection.name}`,
      lat:            primarySelection.lat,
      lon:            primarySelection.lon,
      type:           "Hotel",
      cost:           0,
      icon:           "🏨",
      rating:         primarySelection.rating ?? 4.0,
      isPopular:      true,
      familyFriendly: true,
      openHour:       0,
      closeHour:      24,
    };

    const dailyBudget  = Math.max(0, Math.floor((budget - transportCost - hotelCost) / totalDays));
    const maxActivitas = 3;
    const actualItinerary: any[] = [];

    for (let day = 1; day <= totalDays; day++) {
      // Beam Search per hari — sesuai diagram
      const routeHari = beamSearchDay(
        hotelNode, realPOIs, prefArray, dailyBudget, withFamily, maxActivitas
      );

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

    // ===================================================================
    // STEP 6 — Modul 4: Cosine Similarity untuk alternatif
    // ===================================================================
    const mainVec = [primarySelection.nBudget, primarySelection.nTag, primarySelection.nDist];
    const sortedAlternatives = scoredItems
      .filter(d => d.id !== primarySelection.id)
      .map(item => ({
        ...item,
        similarityScore: cosineSimilarity(mainVec, [item.nBudget, item.nTag, item.nDist]),
      }))
      .sort((a, b) => b.similarityScore - a.similarityScore);

    const mapToAlt = (d: any, label: string) => ({
      id:            d.id,
      name:          d.name,
      city:          d.city,
      province:      d.province,
      image:         d.icon,
      distanceLabel: `${Math.round(d.distanceKm)} km (${Math.round(d.similarityScore * 100)}% Mirip)`,
      estimatedCost: { [duration]: Math.floor(d.totalBaseCost + transportCost + foodCost + ticketCost) },
      badges:        [label, `⭐ ${d.rating}`, d.city],
    });

    return NextResponse.json({
      success: true,
      data: {
        durationKey: duration,
        main: {
          id:            primarySelection.id,
          name:          primarySelection.name,
          city:          primarySelection.city,
          province:      primarySelection.province,
          image:         primarySelection.icon,
          distanceLabel: `Jarak: ${Math.round(primarySelection.distanceKm)} km | Transport: ${transport.mode}`,
          estimatedCost: { [duration]: transportCost + hotelCost + foodCost + ticketCost },
          transportCost, hotelCost, foodCost, ticketCost,
          badges:        [`⭐ Rating: ${primarySelection.rating}`, transport.mode, ...primarySelection.tags],
          hiddenGems:    realPOIs.map(p => p.name).slice(0, 3),
          itinerary:     { [duration]: actualItinerary },
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