import { NodePOI } from "@/lib/Registry";

const KINDS_MAP: Record<string, string> = {
  Gunung: "natural", Pantai: "beaches", Kuliner: "restaurants",
  Budaya: "cultural", Wisata: "interesting_places",
};

const ICON_MAP: Record<string, string> = {
  Gunung: "⛰️", Kuliner: "🍽️", Pantai: "🏖️", Budaya: "🏛️", Wisata: "📸",
};

// =========================================================================
// FETCH POI dari OpenTripMap (dengan fallback)
// =========================================================================
export async function fetchOpenTripMapPOIs(
  cityName: string,
  hotelLat: number,
  hotelLon: number,
  preferences: string[]
): Promise<NodePOI[]> {
  const mainPref = preferences?.[0] ?? "Wisata";
  const kinds    = KINDS_MAP[mainPref] ?? "interesting_places";
  const poiIcon  = ICON_MAP[mainPref]  ?? "📸";
  const OTM_KEY  = process.env.OPENTRIPMAP_KEY;

  const fallback = (): NodePOI[] => [
    {
      id: "poi1", name: `Destinasi ${mainPref} ${cityName}`,
      lat: hotelLat + 0.015, lon: hotelLon - 0.010,
      type: mainPref, cost: 50000, icon: poiIcon,
      rating: 4.0, isPopular: true, familyFriendly: true,
      openHour: 8, closeHour: 21,
    },
    {
      id: "poi2", name: `Eksplorasi ${mainPref} Sekitar ${cityName}`,
      lat: hotelLat + 0.020, lon: hotelLon + 0.005,
      type: mainPref, cost: 75000, icon: "🗺️",
      rating: 3.8, isPopular: false, familyFriendly: true,
      openHour: 8, closeHour: 21,
    },
    {
      id: "poi3", name: `Pusat Oleh-oleh Khas ${cityName}`,
      lat: hotelLat - 0.010, lon: hotelLon + 0.020,
      type: "Belanja", cost: 150000, icon: "🛍️",
      rating: 4.2, isPopular: true, familyFriendly: true,
      openHour: 9, closeHour: 21,
    },
  ];

  if (!OTM_KEY) {
    console.warn("[POI] OPENTRIPMAP_KEY tidak ditemukan, pakai fallback");
    return fallback();
  }

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
        id:             `otm-${idx}`,
        name:           p.name,
        lat:            p.point.lat,
        lon:            p.point.lon,
        type:           mainPref,
        cost:           75000,
        icon:           poiIcon,
        rating:         p.rate ? Math.min(5, p.rate / 2) : 4.0,
        isPopular:      (p.rate ?? 0) > 5,
        familyFriendly: true,
        openHour:       8,
        closeHour:      21,
      }));

    return nodes.length > 0 ? nodes : fallback();
  } catch {
    return fallback();
  }
}