export type NodePOI = {
  id: string; name: string; lat: number; lon: number;
  type: string; cost: number; icon: string;
  rating?: number; isPopular?: boolean; familyFriendly?: boolean;
  vibe?: string; openHour?: number; closeHour?: number;
};

export interface BeamState {
  location: NodePOI;
  time: number;       
  visited: Set<string>;
  budgetUsed: number;
  score: number;
}

export interface CityData {
  lat: number; lon: number; province: string; iata: string;
  station: string; bookingId: string; destType: string; taLocationId: string;
}


export const CITY_REGISTRY: Record<string, CityData> = {
  "Surabaya":   { lat: -7.2575,  lon: 112.7521, province: "Jawa Timur",  iata: "SUB", station: "SGU",  bookingId: "-2698521", destType: "city",   taLocationId: "297710" },
  "Jakarta":    { lat: -6.2088,  lon: 106.8456, province: "DKI Jakarta", iata: "CGK", station: "GMR",  bookingId: "-2679652", destType: "city",   taLocationId: "297715" },
  "Banyuwangi": { lat: -8.2192,  lon: 114.3691, province: "Jawa Timur",  iata: "BWX", station: "BW",   bookingId: "-2671874", destType: "city",   taLocationId: "311044" },
  "Yogyakarta": { lat: -7.7956,  lon: 110.3695, province: "DIY",         iata: "YIA", station: "YK",   bookingId: "-2703546", destType: "city",   taLocationId: "297725" },
  "Bandung":    { lat: -6.9175,  lon: 107.6191, province: "Jawa Barat",  iata: "BDO", station: "BD",   bookingId: "-2671576", destType: "city",   taLocationId: "297704" },
  "Bali":       { lat: -8.4095,  lon: 115.1889, province: "Bali",        iata: "DPS", station: "NONE", bookingId: "-2671493", destType: "region", taLocationId: "469404" },
  "Malang":     { lat: -7.9666,  lon: 112.6326, province: "Jawa Timur",  iata: "MLG", station: "ML",   bookingId: "-2686817", destType: "city",   taLocationId: "297702" },
  "Lombok":     { lat: -8.6529,  lon: 116.3249, province: "NTB",         iata: "LOP", station: "NONE", bookingId: "-2683072", destType: "region", taLocationId: "574872" },
};