// ============================================================
// POI (Point of Interest) Database
// 5 region: Bandung, Yogyakarta, Bali (Ubud/Seminyak), Malang, Bogor
// Setiap POI punya koordinat untuk Haversine distance
// ============================================================

export type Category =
  | "alam" | "pantai" | "gunung" | "kuliner" | "kafe"
  | "budaya" | "belanja" | "wisata-kota" | "religi"
  | "hiking" | "rafting" | "edukasi" | "hidden-gem"
  | "spa" | "penginapan";

export type Vibe = "healing" | "adventure" | "family" | "romantis" | "solo" | "kuliner-trip";

export type FoodType = "halal" | "vegetarian" | "vegan" | "seafood" | "lokal" | "kafe" | "fine-dining";

export interface POI {
  id: string;
  name: string;
  region: string;          // "Bandung", "Yogyakarta", dll
  area: string;            // sub-area: "Lembang", "Ubud", "Kota Tua", dst
  lat: number;
  lon: number;
  categories: Category[];
  vibes: Vibe[];
  /** Harga tiket masuk per orang. 0 = gratis */
  ticketPrice: number;
  /** Estimasi durasi kunjungan ideal dalam menit */
  visitDuration: number;
  /** Jam buka 24h. open=8 berarti buka jam 08:00 */
  openHour: number;
  closeHour: number;
  /** true = buka 24 jam, abaikan openHour/closeHour */
  alwaysOpen?: boolean;
  rating: number;          // 0..5
  popularity: "mainstream" | "hidden-gem" | "balanced";
  familyFriendly: boolean;
  /** deskripsi singkat untuk narator */
  blurb: string;
  /** alasan kenapa cocok (template untuk narator) */
  highlights: string[];
  icon: string;
}

export interface Restaurant {
  id: string;
  name: string;
  region: string;
  area: string;
  lat: number;
  lon: number;
  foodTypes: FoodType[];
  /** harga rata-rata per orang dalam Rupiah */
  pricePerPerson: number;
  rating: number;
  signature: string;       // menu andalan
  blurb: string;
}

export interface Lodging {
  id: string;
  name: string;
  region: string;
  area: string;
  lat: number;
  lon: number;
  /** Harga per malam per kamar */
  pricePerNight: number;
  rating: number;
  type: "homestay" | "hotel" | "villa" | "resort" | "hostel";
  vibes: Vibe[];
  blurb: string;
}

// ============================================================
// POIs — 60+ tempat
// ============================================================
export const POIS: POI[] = [
  // ===== BANDUNG REGION =====
  {
    id: "bdg-kawah-putih", name: "Kawah Putih", region: "Bandung", area: "Ciwidey",
    lat: -7.1660, lon: 107.4019, categories: ["alam", "gunung"], vibes: ["healing", "family"],
    ticketPrice: 85000, visitDuration: 150, openHour: 7, closeHour: 16,
    rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Danau kawah belerang hijau toska dengan tebing kapur putih yang fotogenik.",
    highlights: ["pemandangan kawah unik", "udara sejuk 18°C", "spot foto ikonik"],
    icon: "🏔️",
  },
  {
    id: "bdg-tangkuban", name: "Gunung Tangkuban Perahu", region: "Bandung", area: "Lembang",
    lat: -6.7593, lon: 107.6094, categories: ["alam", "gunung"], vibes: ["adventure", "family"],
    ticketPrice: 30000, visitDuration: 120, openHour: 7, closeHour: 17,
    rating: 4.4, popularity: "mainstream", familyFriendly: true,
    blurb: "Gunung legendaris dengan kawah aktif yang bisa diakses langsung dari parkiran.",
    highlights: ["legenda Sangkuriang", "akses mudah", "kawah aktif"],
    icon: "🌋",
  },
  {
    id: "bdg-farmhouse", name: "Farmhouse Lembang", region: "Bandung", area: "Lembang",
    lat: -6.8232, lon: 107.6065, categories: ["wisata-kota", "kafe"], vibes: ["family", "romantis"],
    ticketPrice: 35000, visitDuration: 120, openHour: 9, closeHour: 21,
    rating: 4.3, popularity: "mainstream", familyFriendly: true,
    blurb: "Tema desa Eropa dengan kebun bunga, peternakan mini, dan kafe instagramable.",
    highlights: ["spot foto Eropa", "ada peternakan kelinci", "ramah anak"],
    icon: "🏡",
  },
  {
    id: "bdg-cikondang", name: "Kampung Adat Cikondang", region: "Bandung", area: "Pangalengan",
    lat: -7.1925, lon: 107.5680, categories: ["budaya", "hidden-gem"], vibes: ["healing", "solo"],
    ticketPrice: 15000, visitDuration: 90, openHour: 8, closeHour: 16,
    rating: 4.5, popularity: "hidden-gem", familyFriendly: true,
    blurb: "Desa adat tradisional Sunda yang masih lestari, jauh dari keramaian.",
    highlights: ["budaya Sunda otentik", "sepi turis", "rumah panggung adat"],
    icon: "🏘️",
  },
  {
    id: "bdg-curug-cimahi", name: "Curug Cimahi (Pelangi)", region: "Bandung", area: "Lembang",
    lat: -6.7822, lon: 107.5618, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure", "healing"], ticketPrice: 20000, visitDuration: 120,
    openHour: 8, closeHour: 17, rating: 4.4, popularity: "balanced", familyFriendly: true,
    blurb: "Air terjun 87m dengan trekking ringan menembus hutan pinus.",
    highlights: ["air terjun tinggi", "trekking ringan 15 menit", "udara segar pinus"],
    icon: "💦",
  },
  {
    id: "bdg-dago-dream", name: "Dago Dreampark", region: "Bandung", area: "Dago",
    lat: -6.8385, lon: 107.6298, categories: ["wisata-kota"], vibes: ["family"],
    ticketPrice: 25000, visitDuration: 180, openHour: 9, closeHour: 18,
    rating: 4.2, popularity: "mainstream", familyFriendly: true,
    blurb: "Taman tematik dengan flying fox, ATV, dan rumah Hobbit.",
    highlights: ["banyak wahana", "cocok anak-anak", "harga terjangkau"],
    icon: "🎢",
  },
  {
    id: "bdg-floating", name: "Floating Market Lembang", region: "Bandung", area: "Lembang",
    lat: -6.8205, lon: 107.6173, categories: ["kuliner", "wisata-kota"], vibes: ["family", "kuliner-trip"],
    ticketPrice: 30000, visitDuration: 150, openHour: 9, closeHour: 19,
    rating: 4.3, popularity: "mainstream", familyFriendly: true,
    blurb: "Pasar terapung dengan jajanan tradisional Sunda di atas perahu.",
    highlights: ["jajanan Sunda variatif", "spot foto unik", "ada taman bermain"],
    icon: "🛶",
  },
  {
    id: "bdg-tebing-keraton", name: "Tebing Keraton", region: "Bandung", area: "Dago Atas",
    lat: -6.8285, lon: 107.6539, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure", "romantis"], ticketPrice: 15000, visitDuration: 90,
    openHour: 5, closeHour: 17, rating: 4.4, popularity: "hidden-gem", familyFriendly: false,
    blurb: "Tebing batu di tepi hutan dengan view sunrise lautan kabut.",
    highlights: ["sunrise spektakuler", "view 360 derajat", "hidden gem fotografer"],
    icon: "⛰️",
  },

  // ===== YOGYAKARTA REGION =====
  {
    id: "yog-borobudur", name: "Candi Borobudur", region: "Yogyakarta", area: "Magelang",
    lat: -7.6079, lon: 110.2038, categories: ["budaya", "religi"], vibes: ["family", "solo"],
    ticketPrice: 50000, visitDuration: 180, openHour: 6, closeHour: 17,
    rating: 4.8, popularity: "mainstream", familyFriendly: true,
    blurb: "Candi Buddha terbesar di dunia, warisan UNESCO dengan 504 stupa.",
    highlights: ["warisan UNESCO", "sunrise tour ikonik", "sejarah abad ke-9"],
    icon: "🛕",
  },
  {
    id: "yog-prambanan", name: "Candi Prambanan", region: "Yogyakarta", area: "Sleman",
    lat: -7.7520, lon: 110.4915, categories: ["budaya", "religi"], vibes: ["family", "solo"],
    ticketPrice: 50000, visitDuration: 150, openHour: 6, closeHour: 17,
    rating: 4.7, popularity: "mainstream", familyFriendly: true,
    blurb: "Candi Hindu megah dengan pertunjukan Ramayana di malam hari.",
    highlights: ["candi Hindu tertinggi", "Ramayana ballet malam", "kompleks luas"],
    icon: "🛕",
  },
  {
    id: "yog-malioboro", name: "Jalan Malioboro", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.7926, lon: 110.3656, categories: ["belanja", "kuliner", "wisata-kota"],
    vibes: ["family", "kuliner-trip"], ticketPrice: 0, visitDuration: 180,
    openHour: 0, closeHour: 24, alwaysOpen: true,
    rating: 4.5, popularity: "mainstream", familyFriendly: true,
    blurb: "Jalan ikonik Yogya, surga belanja batik dan kuliner kaki lima.",
    highlights: ["batik & oleh-oleh", "gudeg legendaris", "live music angklung"],
    icon: "🛍️",
  },
  {
    id: "yog-pinus-mangunan", name: "Hutan Pinus Mangunan", region: "Yogyakarta", area: "Bantul",
    lat: -7.9286, lon: 110.4250, categories: ["alam", "hidden-gem"], vibes: ["healing", "romantis"],
    ticketPrice: 5000, visitDuration: 90, openHour: 6, closeHour: 18,
    rating: 4.5, popularity: "balanced", familyFriendly: true,
    blurb: "Hutan pinus dengan panggung kayu dan ayunan menghadap lembah.",
    highlights: ["udara sejuk pinus", "spot foto ayunan", "tarif sangat murah"],
    icon: "🌲",
  },
  {
    id: "yog-jomblang", name: "Goa Jomblang", region: "Yogyakarta", area: "Gunung Kidul",
    lat: -8.0319, lon: 110.6383, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure", "solo"], ticketPrice: 450000, visitDuration: 240,
    openHour: 7, closeHour: 15, rating: 4.9, popularity: "hidden-gem", familyFriendly: false,
    blurb: "Goa vertikal dengan 'cahaya surga' tembus dari celah atas. Wajib reservasi.",
    highlights: ["cahaya surga ikonik", "vertical caving 60m", "pengalaman langka"],
    icon: "🕳️",
  },
  {
    id: "yog-pantai-timang", name: "Pantai Timang", region: "Yogyakarta", area: "Gunung Kidul",
    lat: -8.1873, lon: 110.6362, categories: ["pantai", "hiking"], vibes: ["adventure"],
    ticketPrice: 15000, visitDuration: 180, openHour: 6, closeHour: 18,
    rating: 4.6, popularity: "balanced", familyFriendly: false,
    blurb: "Pantai dengan gondola kayu legendaris menuju pulau karang.",
    highlights: ["gondola kayu manual", "pulau karang lobster", "ombak Samudra Hindia"],
    icon: "🏝️",
  },
  {
    id: "yog-tamansari", name: "Taman Sari", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.8104, lon: 110.3593, categories: ["budaya"], vibes: ["family", "solo"],
    ticketPrice: 15000, visitDuration: 90, openHour: 9, closeHour: 15,
    rating: 4.4, popularity: "mainstream", familyFriendly: true,
    blurb: "Bekas taman air keraton dengan lorong rahasia bawah tanah.",
    highlights: ["arsitektur Jawa-Eropa", "underground passage", "instagramable"],
    icon: "🏛️",
  },
  {
    id: "yog-keraton", name: "Keraton Yogyakarta", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.8053, lon: 110.3642, categories: ["budaya", "religi"], vibes: ["family", "solo"],
    ticketPrice: 15000, visitDuration: 120, openHour: 9, closeHour: 14,
    rating: 4.5, popularity: "mainstream", familyFriendly: true,
    blurb: "Istana sultan yang masih ditinggali, pusat budaya Jawa kontemporer.",
    highlights: ["pertunjukan gamelan", "abdi dalem otentik", "museum kerajaan"],
    icon: "👑",
  },
  {
    id: "yog-merapi-jeep", name: "Lava Tour Merapi", region: "Yogyakarta", area: "Sleman",
    lat: -7.5407, lon: 110.4457, categories: ["alam", "gunung", "rafting"],
    vibes: ["adventure"], ticketPrice: 350000, visitDuration: 180,
    openHour: 7, closeHour: 16, rating: 4.7, popularity: "mainstream", familyFriendly: true,
    blurb: "Jeep tour menyusuri jejak letusan Merapi 2010 dan bunker tua.",
    highlights: ["jeep offroad", "museum Sisa Hartaku", "bunker Kaliadem"],
    icon: "🚙",
  },

  // ===== BALI REGION =====
  {
    id: "bli-tanah-lot", name: "Tanah Lot", region: "Bali", area: "Tabanan",
    lat: -8.6212, lon: 115.0868, categories: ["pantai", "religi", "budaya"],
    vibes: ["romantis", "family"], ticketPrice: 75000, visitDuration: 120,
    openHour: 7, closeHour: 19, rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Pura ikonik di atas karang lepas pantai dengan sunset paling fotogenik di Bali.",
    highlights: ["sunset legendaris", "pura di batu karang", "ular suci"],
    icon: "🕊️",
  },
  {
    id: "bli-ubud-monkey", name: "Ubud Monkey Forest", region: "Bali", area: "Ubud",
    lat: -8.5188, lon: 115.2585, categories: ["alam"], vibes: ["family", "solo"],
    ticketPrice: 80000, visitDuration: 90, openHour: 9, closeHour: 17,
    rating: 4.3, popularity: "mainstream", familyFriendly: true,
    blurb: "Hutan suci di tengah Ubud dengan ratusan monyet ekor panjang.",
    highlights: ["hutan tropis di kota", "pura tua", "jembatan kayu"],
    icon: "🐒",
  },
  {
    id: "bli-tegalalang", name: "Tegallalang Rice Terrace", region: "Bali", area: "Ubud",
    lat: -8.4322, lon: 115.2783, categories: ["alam", "kafe"], vibes: ["healing", "romantis"],
    ticketPrice: 25000, visitDuration: 90, openHour: 8, closeHour: 18,
    rating: 4.5, popularity: "mainstream", familyFriendly: true,
    blurb: "Sawah terasering ikonik Ubud, banyak kafe view sawah & swing.",
    highlights: ["terasering UNESCO", "Bali swing", "kafe instagrammable"],
    icon: "🌾",
  },
  {
    id: "bli-pantai-kuta", name: "Pantai Kuta", region: "Bali", area: "Kuta",
    lat: -8.7188, lon: 115.1683, categories: ["pantai"], vibes: ["family", "kuliner-trip"],
    ticketPrice: 0, visitDuration: 180, openHour: 0, closeHour: 24, alwaysOpen: true,
    rating: 4.3, popularity: "mainstream", familyFriendly: true,
    blurb: "Pantai pasir putih legendaris dengan ombak ideal untuk pemula surfing.",
    highlights: ["sunset ramai meriah", "lesson surfing pemula", "deretan restoran"],
    icon: "🏖️",
  },
  {
    id: "bli-pantai-padang", name: "Pantai Padang-Padang", region: "Bali", area: "Uluwatu",
    lat: -8.8113, lon: 115.1080, categories: ["pantai", "hidden-gem"],
    vibes: ["romantis", "solo"], ticketPrice: 15000, visitDuration: 120,
    openHour: 7, closeHour: 19, rating: 4.5, popularity: "balanced", familyFriendly: true,
    blurb: "Pantai tersembunyi yang diakses lewat celah karang, tenang dan cantik.",
    highlights: ["akses lewat goa karang", "lebih sepi dari Kuta", "ombak surfer"],
    icon: "🏝️",
  },
  {
    id: "bli-uluwatu", name: "Pura Uluwatu & Kecak", region: "Bali", area: "Uluwatu",
    lat: -8.8290, lon: 115.0848, categories: ["religi", "budaya"], vibes: ["romantis", "family"],
    ticketPrice: 50000, visitDuration: 150, openHour: 9, closeHour: 19,
    rating: 4.7, popularity: "mainstream", familyFriendly: true,
    blurb: "Pura di puncak tebing dengan pertunjukan tari Kecak saat sunset.",
    highlights: ["tari Kecak ikonik", "view tebing 70m", "sunset kuil"],
    icon: "🔥",
  },
  {
    id: "bli-tirta-empul", name: "Tirta Empul", region: "Bali", area: "Tampaksiring",
    lat: -8.4156, lon: 115.3148, categories: ["religi", "budaya", "spa"],
    vibes: ["healing", "solo"], ticketPrice: 50000, visitDuration: 120,
    openHour: 9, closeHour: 17, rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Pura sumber air suci untuk ritual penyucian (melukat).",
    highlights: ["ritual melukat otentik", "kolam mata air abadi", "sejarah abad ke-10"],
    icon: "💧",
  },
  {
    id: "bli-sekumpul", name: "Air Terjun Sekumpul", region: "Bali", area: "Buleleng",
    lat: -8.1672, lon: 115.1985, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure", "healing"], ticketPrice: 125000, visitDuration: 240,
    openHour: 7, closeHour: 16, rating: 4.8, popularity: "hidden-gem", familyFriendly: false,
    blurb: "Tujuh air terjun bertingkat di hutan tropis Bali utara.",
    highlights: ["7 air terjun sekaligus", "trekking 1 jam", "salah satu terindah di Bali"],
    icon: "🌊",
  },
  {
    id: "bli-seminyak-beach", name: "Pantai Seminyak", region: "Bali", area: "Seminyak",
    lat: -8.6905, lon: 115.1622, categories: ["pantai", "kafe"], vibes: ["romantis", "solo"],
    ticketPrice: 0, visitDuration: 150, openHour: 0, closeHour: 24, alwaysOpen: true,
    rating: 4.4, popularity: "mainstream", familyFriendly: true,
    blurb: "Pantai elit Bali dengan beach club dan sunset bar berkelas.",
    highlights: ["beach club mewah", "sunset cocktail", "vibe kelas atas"],
    icon: "🍹",
  },

  // ===== MALANG REGION =====
  {
    id: "mlg-bromo", name: "Gunung Bromo", region: "Malang", area: "Probolinggo",
    lat: -7.9425, lon: 112.9530, categories: ["alam", "gunung", "hiking"],
    vibes: ["adventure", "romantis"], ticketPrice: 320000, visitDuration: 360,
    openHour: 3, closeHour: 17, rating: 4.8, popularity: "mainstream", familyFriendly: true,
    blurb: "Sunrise di Penanjakan dengan view kawah aktif & lautan pasir luas.",
    highlights: ["sunrise di atas awan", "lautan pasir Tengger", "kawah berasap"],
    icon: "🌅",
  },
  {
    id: "mlg-batu-jatim", name: "Jatim Park 1", region: "Malang", area: "Batu",
    lat: -7.8754, lon: 112.5240, categories: ["wisata-kota", "edukasi"],
    vibes: ["family"], ticketPrice: 100000, visitDuration: 240,
    openHour: 8, closeHour: 17, rating: 4.4, popularity: "mainstream", familyFriendly: true,
    blurb: "Taman tematik dengan 60+ wahana edukasi dan permainan.",
    highlights: ["wahana edukasi sains", "ada museum binatang", "all-in-one ticket"],
    icon: "🎡",
  },
  {
    id: "mlg-coban-rondo", name: "Coban Rondo", region: "Malang", area: "Pujon",
    lat: -7.8867, lon: 112.4677, categories: ["alam", "hiking"], vibes: ["family", "healing"],
    ticketPrice: 35000, visitDuration: 120, openHour: 7, closeHour: 17,
    rating: 4.4, popularity: "mainstream", familyFriendly: true,
    blurb: "Air terjun 84m yang mudah diakses, sekitarnya ada taman labirin.",
    highlights: ["akses gampang dari parkiran", "labirin keluarga", "udara dingin"],
    icon: "💧",
  },
  {
    id: "mlg-tumpak-sewu", name: "Air Terjun Tumpak Sewu", region: "Malang", area: "Lumajang",
    lat: -8.2306, lon: 112.9117, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure"], ticketPrice: 25000, visitDuration: 300,
    openHour: 6, closeHour: 16, rating: 4.9, popularity: "hidden-gem", familyFriendly: false,
    blurb: "Tirai air raksasa setengah lingkaran, dijuluki 'Niagara Indonesia'.",
    highlights: ["pemandangan langka", "trekking ke dasar 1 jam", "ribuan curahan air"],
    icon: "🌊",
  },
  {
    id: "mlg-museum-angkut", name: "Museum Angkut", region: "Malang", area: "Batu",
    lat: -7.8857, lon: 112.5174, categories: ["edukasi", "wisata-kota"],
    vibes: ["family"], ticketPrice: 120000, visitDuration: 180,
    openHour: 12, closeHour: 20, rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Museum transportasi raksasa dengan diorama 7 kawasan dunia.",
    highlights: ["300+ kendaraan klasik", "set film Hollywood", "instagramable"],
    icon: "🚗",
  },
  {
    id: "mlg-paralayang", name: "Paralayang Batu", region: "Malang", area: "Batu",
    lat: -7.8650, lon: 112.5012, categories: ["alam", "hiking"], vibes: ["adventure", "romantis"],
    ticketPrice: 10000, visitDuration: 90, openHour: 7, closeHour: 18,
    rating: 4.5, popularity: "balanced", familyFriendly: true,
    blurb: "Bukit lepas landas paralayang dengan view kota Batu dari ketinggian.",
    highlights: ["paralayang tandem opsi", "view 270 derajat", "sunset point"],
    icon: "🪂",
  },
  {
    id: "mlg-kampung-warna", name: "Kampung Warna-Warni Jodipan", region: "Malang", area: "Kota Malang",
    lat: -7.9826, lon: 112.6356, categories: ["wisata-kota", "hidden-gem"],
    vibes: ["family", "solo"], ticketPrice: 5000, visitDuration: 60,
    openHour: 7, closeHour: 18, rating: 4.3, popularity: "balanced", familyFriendly: true,
    blurb: "Kampung kumuh yang disulap jadi galeri mural warna-warni.",
    highlights: ["mural seluruh kampung", "tiket sangat murah", "spot foto unik"],
    icon: "🎨",
  },

  // ===== BOGOR REGION =====
  {
    id: "bgr-kebun-raya", name: "Kebun Raya Bogor", region: "Bogor", area: "Pusat Kota",
    lat: -6.5972, lon: 106.7990, categories: ["alam", "edukasi"],
    vibes: ["healing", "family"], ticketPrice: 30000, visitDuration: 180,
    openHour: 7, closeHour: 17, rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Kebun raya tertua di Asia Tenggara dengan 15.000+ spesies tanaman.",
    highlights: ["taman luas berhektar", "rafflesia & bunga bangkai", "spot piknik"],
    icon: "🌳",
  },
  {
    id: "bgr-puncak-pass", name: "Puncak Pass", region: "Bogor", area: "Puncak",
    lat: -6.7038, lon: 106.9870, categories: ["alam", "gunung", "kafe"],
    vibes: ["healing", "romantis"], ticketPrice: 0, visitDuration: 120,
    openHour: 0, closeHour: 24, alwaysOpen: true,
    rating: 4.3, popularity: "mainstream", familyFriendly: true,
    blurb: "Jalur ikonik dengan kebun teh, kafe view, dan udara sejuk.",
    highlights: ["kebun teh Gunung Mas", "puluhan kafe view", "macet weekend"],
    icon: "🍵",
  },
  {
    id: "bgr-curug-cikaso", name: "Curug Cikaso (lokal Bogor)", region: "Bogor", area: "Sukabumi",
    lat: -7.0383, lon: 106.6628, categories: ["alam", "hiking", "hidden-gem"],
    vibes: ["adventure"], ticketPrice: 20000, visitDuration: 180,
    openHour: 7, closeHour: 17, rating: 4.5, popularity: "hidden-gem", familyFriendly: false,
    blurb: "Tiga air terjun paralel di tebing yang sama, naik perahu kecil ke dasar.",
    highlights: ["tiga aliran sekaligus", "naik perahu menuju ke air terjun", "kolam jernih"],
    icon: "💦",
  },
  {
    id: "bgr-taman-safari", name: "Taman Safari Bogor", region: "Bogor", area: "Cisarua",
    lat: -6.7188, lon: 106.9526, categories: ["wisata-kota", "edukasi"],
    vibes: ["family"], ticketPrice: 220000, visitDuration: 300,
    openHour: 9, closeHour: 17, rating: 4.6, popularity: "mainstream", familyFriendly: true,
    blurb: "Kebun binatang drive-through dengan 2.500+ satwa.",
    highlights: ["drive-through safari", "pertunjukan satwa", "wahana keluarga lengkap"],
    icon: "🦁",
  },
  {
    id: "bgr-gunung-pancar", name: "Gunung Pancar", region: "Bogor", area: "Sentul",
    lat: -6.5818, lon: 106.8835, categories: ["alam", "hiking", "spa"],
    vibes: ["healing", "adventure"], ticketPrice: 25000, visitDuration: 180,
    openHour: 6, closeHour: 18, rating: 4.4, popularity: "balanced", familyFriendly: true,
    blurb: "Hutan pinus + pemandian air panas alami di kaki gunung.",
    highlights: ["hutan pinus rindang", "kolam air panas", "akses mudah dari Sentul"],
    icon: "♨️",
  },
];

// ============================================================
// RESTAURANTS — minimal 2-3 per region
// ============================================================
export const RESTAURANTS: Restaurant[] = [
  // Bandung
  {
    id: "r-bdg-sundamuda", name: "Sunda Mudah", region: "Bandung", area: "Lembang",
    lat: -6.8174, lon: 107.6076, foodTypes: ["lokal", "halal"], pricePerPerson: 45000,
    rating: 4.5, signature: "nasi liwet komplit",
    blurb: "Warung Sunda otentik dengan view kebun teh.",
  },
  {
    id: "r-bdg-lawangwangi", name: "Lawangwangi Creative Space", region: "Bandung", area: "Dago",
    lat: -6.8410, lon: 107.6358, foodTypes: ["kafe", "halal"], pricePerPerson: 75000,
    rating: 4.6, signature: "pasta & coffee art",
    blurb: "Galeri seni kontemporer + kafe view kota Bandung.",
  },
  {
    id: "r-bdg-warung-talaga", name: "Warung Talaga", region: "Bandung", area: "Ciwidey",
    lat: -7.1432, lon: 107.4128, foodTypes: ["lokal", "halal"], pricePerPerson: 30000,
    rating: 4.4, signature: "ikan bakar gurame",
    blurb: "Warung pinggir danau, terkenal ikan bakar segarnya.",
  },
  // Yogyakarta
  {
    id: "r-yog-gudegyu", name: "Gudeg Yu Djum", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.7900, lon: 110.3640, foodTypes: ["lokal", "halal"], pricePerPerson: 35000,
    rating: 4.5, signature: "gudeg basah komplit",
    blurb: "Gudeg legendaris sejak 1950, wajib coba di Yogya.",
  },
  {
    id: "r-yog-sate-klatak", name: "Sate Klatak Pak Pong", region: "Yogyakarta", area: "Bantul",
    lat: -7.8625, lon: 110.3475, foodTypes: ["lokal", "halal"], pricePerPerson: 40000,
    rating: 4.7, signature: "sate klatak kambing muda",
    blurb: "Sate kambing tusuk jeruji besi yang viral.",
  },
  {
    id: "r-yog-milas", name: "Milas Vegetarian", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.8253, lon: 110.3651, foodTypes: ["vegetarian", "vegan"], pricePerPerson: 60000,
    rating: 4.6, signature: "tempe gembus & sayur lodeh",
    blurb: "Vegetarian Indonesia rasa rumahan, ada workshop.",
  },
  // Bali
  {
    id: "r-bli-warung-babi", name: "Warung Babi Guling Ibu Oka", region: "Bali", area: "Ubud",
    lat: -8.5070, lon: 115.2625, foodTypes: ["lokal"], pricePerPerson: 75000,
    rating: 4.5, signature: "babi guling khas Ubud",
    blurb: "Babi guling legendaris di pusat Ubud, ramai sejak buka.",
  },
  {
    id: "r-bli-warung-pulau", name: "Warung Pulau Kelapa", region: "Bali", area: "Seminyak",
    lat: -8.6810, lon: 115.1565, foodTypes: ["lokal", "halal", "seafood"], pricePerPerson: 90000,
    rating: 4.6, signature: "nasi campur Bali halal",
    blurb: "Warung halal dengan menu Bali otentik dan suasana Joglo.",
  },
  {
    id: "r-bli-bumbu-bali", name: "Bumbu Bali Tanjung Benoa", region: "Bali", area: "Nusa Dua",
    lat: -8.7745, lon: 115.2255, foodTypes: ["lokal", "halal", "fine-dining"], pricePerPerson: 250000,
    rating: 4.8, signature: "rijsttafel Bali",
    blurb: "Fine dining masakan Bali otentik dengan koki cooking class.",
  },
  // Malang
  {
    id: "r-mlg-bakso-president", name: "Bakso President", region: "Malang", area: "Kota Malang",
    lat: -7.9810, lon: 112.6355, foodTypes: ["lokal", "halal"], pricePerPerson: 30000,
    rating: 4.5, signature: "bakso urat jumbo",
    blurb: "Bakso legendaris Malang pinggir rel kereta, antrian panjang.",
  },
  {
    id: "r-mlg-omah-kedhaton", name: "Omah Kedhaton", region: "Malang", area: "Batu",
    lat: -7.8730, lon: 112.5285, foodTypes: ["lokal", "halal", "fine-dining"], pricePerPerson: 120000,
    rating: 4.7, signature: "ayam goreng kremes",
    blurb: "Resto Jawa klasik dengan setting joglo dan kolam koi.",
  },
  // Bogor
  {
    id: "r-bgr-momoiro", name: "Momoiro Ramen", region: "Bogor", area: "Pusat Kota",
    lat: -6.5959, lon: 106.7975, foodTypes: ["halal", "kafe"], pricePerPerson: 65000,
    rating: 4.5, signature: "ramen halal pedas",
    blurb: "Ramen halal kekinian dekat Kebun Raya.",
  },
  {
    id: "r-bgr-laksa-bogor", name: "Laksa Pak Inin", region: "Bogor", area: "Pusat Kota",
    lat: -6.6020, lon: 106.7888, foodTypes: ["lokal", "halal"], pricePerPerson: 25000,
    rating: 4.6, signature: "laksa khas Bogor",
    blurb: "Laksa kuah santan khas Bogor, harga merakyat.",
  },
  {
    id: "r-bgr-warung-puncak", name: "Warung Sunda Puncak", region: "Bogor", area: "Puncak",
    lat: -6.7027, lon: 106.9847, foodTypes: ["lokal", "halal"], pricePerPerson: 55000,
    rating: 4.4, signature: "ikan gurame + nasi tutug",
    blurb: "Warung view kebun teh, langganan keluarga di Puncak.",
  },
];

// ============================================================
// LODGINGS
// ============================================================
export const LODGINGS: Lodging[] = [
  // Bandung
  {
    id: "l-bdg-villa-istana", name: "Villa Istana Bunga", region: "Bandung", area: "Lembang",
    lat: -6.8195, lon: 107.6047, pricePerNight: 1200000, rating: 4.5,
    type: "villa", vibes: ["family", "romantis"],
    blurb: "Vila keluarga dengan kolam pribadi dekat Lembang.",
  },
  {
    id: "l-bdg-glamp-trizara", name: "Trizara Resorts (Glamping)", region: "Bandung", area: "Lembang",
    lat: -6.7950, lon: 107.6320, pricePerNight: 850000, rating: 4.7,
    type: "resort", vibes: ["healing", "adventure", "romantis"],
    blurb: "Glamping tenda mewah dengan view gunung & sungai.",
  },
  {
    id: "l-bdg-hostel-pinisi", name: "Pinisi Hostel Dago", region: "Bandung", area: "Dago",
    lat: -6.8810, lon: 107.6135, pricePerNight: 180000, rating: 4.3,
    type: "hostel", vibes: ["solo"],
    blurb: "Hostel backpacker dengan rooftop, dekat Dago.",
  },
  // Yogyakarta
  {
    id: "l-yog-greenhost", name: "Greenhost Boutique Hotel", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.8048, lon: 110.3623, pricePerNight: 550000, rating: 4.5,
    type: "hotel", vibes: ["solo", "kuliner-trip"],
    blurb: "Hotel boutique dengan kebun hidroponik di pusat Yogya.",
  },
  {
    id: "l-yog-omah-jawa", name: "Omah Jawa Homestay", region: "Yogyakarta", area: "Pusat Kota",
    lat: -7.7997, lon: 110.3580, pricePerNight: 280000, rating: 4.6,
    type: "homestay", vibes: ["solo", "family"],
    blurb: "Homestay joglo tradisional, suasana kampung Jawa.",
  },
  {
    id: "l-yog-plataran", name: "Plataran Borobudur Resort", region: "Yogyakarta", area: "Magelang",
    lat: -7.6116, lon: 110.1979, pricePerNight: 2500000, rating: 4.8,
    type: "resort", vibes: ["romantis", "healing"],
    blurb: "Resort mewah view Borobudur dari kamar.",
  },
  // Bali
  {
    id: "l-bli-ubud-jungle", name: "Ubud Jungle Villa", region: "Bali", area: "Ubud",
    lat: -8.5240, lon: 115.2620, pricePerNight: 1500000, rating: 4.7,
    type: "villa", vibes: ["healing", "romantis"],
    blurb: "Vila private pool di tengah hutan tropis Ubud.",
  },
  {
    id: "l-bli-seminyak-hotel", name: "Seminyak Beach Hotel", region: "Bali", area: "Seminyak",
    lat: -8.6925, lon: 115.1640, pricePerNight: 1100000, rating: 4.5,
    type: "hotel", vibes: ["romantis", "kuliner-trip"],
    blurb: "Hotel dekat pantai Seminyak dengan beach club partner.",
  },
  {
    id: "l-bli-kuta-hostel", name: "Kuta Backpacker House", region: "Bali", area: "Kuta",
    lat: -8.7205, lon: 115.1695, pricePerNight: 150000, rating: 4.2,
    type: "hostel", vibes: ["solo"],
    blurb: "Dorm murah 5 menit jalan ke Pantai Kuta.",
  },
  // Malang
  {
    id: "l-mlg-batu-villa", name: "Batu Resort Villa", region: "Malang", area: "Batu",
    lat: -7.8765, lon: 112.5260, pricePerNight: 850000, rating: 4.5,
    type: "villa", vibes: ["family"],
    blurb: "Vila keluarga 3 kamar dengan dapur lengkap di Batu.",
  },
  {
    id: "l-mlg-bromo-cottage", name: "Cemara Indah Bromo", region: "Malang", area: "Probolinggo",
    lat: -7.9418, lon: 112.9521, pricePerNight: 650000, rating: 4.4,
    type: "hotel", vibes: ["adventure", "romantis"],
    blurb: "Hotel paling dekat ke view point Bromo, pickup jeep.",
  },
  // Bogor
  {
    id: "l-bgr-puncak-villa", name: "Puncak Tea Garden Villa", region: "Bogor", area: "Puncak",
    lat: -6.7022, lon: 106.9888, pricePerNight: 950000, rating: 4.4,
    type: "villa", vibes: ["family", "healing"],
    blurb: "Vila view kebun teh dengan perapian, langganan keluarga.",
  },
  {
    id: "l-bgr-aston", name: "Aston Bogor Hotel & Resort", region: "Bogor", area: "Pusat Kota",
    lat: -6.5712, lon: 106.8298, pricePerNight: 720000, rating: 4.5,
    type: "hotel", vibes: ["family", "kuliner-trip"],
    blurb: "Hotel keluarga dengan waterpark, dekat Sentul.",
  },
];

// ============================================================
// HELPERS
// ============================================================

/** Daftar region yang punya data lengkap */
export const SUPPORTED_REGIONS = Array.from(new Set(POIS.map((p) => p.region))).sort();

export const CATEGORIES_LIST: { value: Category; label: string; icon: string }[] = [
  { value: "alam",       label: "Alam",         icon: "🌿" },
  { value: "pantai",     label: "Pantai",       icon: "🏖️" },
  { value: "gunung",     label: "Gunung",       icon: "⛰️" },
  { value: "kuliner",    label: "Kuliner",      icon: "🍜" },
  { value: "kafe",       label: "Kafe",         icon: "☕" },
  { value: "budaya",     label: "Budaya",       icon: "🎭" },
  { value: "belanja",    label: "Belanja",      icon: "🛍️" },
  { value: "wisata-kota", label: "Wisata Kota", icon: "🏙️" },
  { value: "religi",     label: "Religi",       icon: "🕊️" },
  { value: "hiking",     label: "Hiking",       icon: "🥾" },
  { value: "edukasi",    label: "Edukasi",      icon: "📚" },
  { value: "hidden-gem", label: "Hidden Gem",   icon: "💎" },
];

export const VIBES_LIST: { value: Vibe; label: string; icon: string; description: string }[] = [
  { value: "healing",      label: "Healing",       icon: "🧘", description: "Tenang, alam, cafe estetik" },
  { value: "adventure",    label: "Adventure",     icon: "🪂", description: "Hiking, jeep, rafting, camping" },
  { value: "family",       label: "Family",        icon: "👨‍👩‍👧", description: "Ramah anak, edukatif" },
  { value: "romantis",     label: "Romantis",      icon: "💑", description: "Sunset, fine dining, view bagus" },
  { value: "solo",         label: "Solo Trip",     icon: "🎒", description: "Eksplorasi mandiri, hemat" },
  { value: "kuliner-trip", label: "Kuliner Trip",  icon: "🍴", description: "Wisata makan, pasar tradisional" },
];

export const FOODS_LIST: { value: FoodType; label: string }[] = [
  { value: "halal",       label: "Halal" },
  { value: "vegetarian",  label: "Vegetarian" },
  { value: "vegan",       label: "Vegan" },
  { value: "seafood",     label: "Seafood" },
  { value: "lokal",       label: "Masakan Lokal" },
  { value: "kafe",        label: "Kafe / Western" },
  { value: "fine-dining", label: "Fine Dining" },
];

export const TRANSPORTS = [
  { value: "mobil-pribadi", label: "🚗 Mobil Pribadi",  speedKmh: 50 },
  { value: "motor",         label: "🏍️ Motor",          speedKmh: 40 },
  { value: "rental-mobil",  label: "🚙 Rental Mobil",   speedKmh: 50 },
  { value: "umum",          label: "🚌 Transportasi Umum", speedKmh: 25 },
] as const;

export const INTENSITIES = [
  { value: "santai", label: "🧘 Santai",  maxActivitiesPerDay: 3, minRestBufferMin: 60 },
  { value: "normal", label: "🚶 Normal",  maxActivitiesPerDay: 4, minRestBufferMin: 30 },
  { value: "padat",  label: "⚡ Padat",   maxActivitiesPerDay: 6, minRestBufferMin: 15 },
] as const;
