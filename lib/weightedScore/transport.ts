import { CITY_REGISTRY } from "@/lib/Registry";

// =========================================================================
// TRANSPORT MODE
// =========================================================================
export function getTransportMode(distanceKm: number): {
  mode: string; icon: string; station: string; modeReturnIcon: string;
} {
  if (distanceKm < 100)  return { mode: "Mobil / Travel Darat",      icon: "🚗", station: "Pool Travel",           modeReturnIcon: "🚘" };
  if (distanceKm <= 450) return { mode: "Kereta Api / Bus Executive", icon: "🚆", station: "Stasiun / Terminal",    modeReturnIcon: "🚉" };
  return                        { mode: "Pesawat Terbang",            icon: "🛫", station: "Bandara Keberangkatan", modeReturnIcon: "🛬" };
}

// =========================================================================
// REAL TRANSPORT PRICE (dengan fallback)
// =========================================================================
export async function fetchRealTransportPrice(
  mode: string,
  originCity: string,
  destCity: string,
  date: string,
  API_KEY: string,
  distanceKm: number
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

    return estimateTransportCost(distanceKm, mode);
  } catch {
    return estimateTransportCost(distanceKm, mode);
  }
}

// =========================================================================
// ESTIMASI TRANSPORT (fallback, konsisten dengan scoring)
// =========================================================================
export function estimateTransportCost(distanceKm: number, mode?: string): number {
  if (mode?.includes("Pesawat") || distanceKm > 450) return (1200000 + distanceKm * 600) * 2;
  if (mode?.includes("Kereta")  || distanceKm > 100) return (250000  + distanceKm * 400) * 2;
  return (150000 + distanceKm * 800) * 2;
}