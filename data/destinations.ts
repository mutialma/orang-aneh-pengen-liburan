export type BudgetCategory = "hemat" | "standar" | "premium";

export type ItineraryItem = {
  time: string;
  activity: string;
  location: string;
  cost: number;
  icon: string;
};

export type Destination = {
  id: number;
  name: string;
  city: string;
  province: string;
  type: string;
  tags: string[];
  budgetCategory: BudgetCategory[];
  estimatedCost: Record<string, number>;
  transportCost: number;
  hotelCost: number;
  foodCost: number;
  ticketCost: number;
  distanceLabel: string;
  distance: number;
  matchReason: string;
  rating: number;
  reviewCount: number;
  badges: string[];
  image: string;
  hiddenGems: string[];
  itinerary: Record<string, ItineraryItem[]>;
};

export const destinations: Destination[] = [
  {
    id: 1, name: "Kawah Putih & Bandung City", city: "Bandung", province: "Jawa Barat",
    type: "Alam + Kota", tags: ["Alam", "Kuliner", "Wisata Kota", "Healing"],
    budgetCategory: ["hemat", "standar"],
    estimatedCost: { "1 Hari": 350000, "2D1N": 650000, "3D2N": 950000 },
    transportCost: 120000, hotelCost: 200000, foodCost: 150000, ticketCost: 80000,
    distanceLabel: "3–4 jam dari Jakarta", distance: 150,
    matchReason: "Destinasi favorit keluarga dengan pemandangan kawah dan kuliner trendi",
    rating: 4.7, reviewCount: 12400,
    badges: ["Populer", "Hemat"],
    image: "🏔️",
    hiddenGems: ["Curug Cimahi — air terjun sepi di balik hutan pinus", "Pasar Gasibu — jajanan lokal murah meriah pagi hari", "Kampung Adat Cikondang — desa tradisional tersembunyi"],
    itinerary: {
      "1 Hari": [
        { time: "07:00", activity: "Berangkat dari Jakarta via tol Cipularang", location: "Jakarta", cost: 120000, icon: "🚗" },
        { time: "10:30", activity: "Sarapan di warung soto Bandung", location: "Bandung Kota", cost: 25000, icon: "🍜" },
        { time: "11:30", activity: "Eksplorasi Kawah Putih Ciwidey", location: "Kawah Putih", cost: 30000, icon: "🌋" },
        { time: "14:00", activity: "Makan siang dengan view kebun teh", location: "Rancabali", cost: 40000, icon: "☕" },
        { time: "15:30", activity: "Factory Outlet & belanja oleh-oleh", location: "Jl. Riau / Dago", cost: 200000, icon: "🛍️" },
        { time: "18:00", activity: "Kuliner malam Jl. Braga", location: "Braga", cost: 60000, icon: "🌆" },
        { time: "21:00", activity: "Kembali ke Jakarta", location: "Bandung → Jakarta", cost: 120000, icon: "🚗" },
      ],
      "2D1N": [
        { time: "07:00", activity: "Berangkat dari Jakarta", location: "Jakarta", cost: 120000, icon: "🚗" },
        { time: "10:30", activity: "Check-in penginapan di Lembang", location: "Lembang", cost: 200000, icon: "🏨" },
        { time: "12:00", activity: "Makan siang kuliner Sunda", location: "Bandung", cost: 40000, icon: "🍚" },
        { time: "14:00", activity: "Kawah Putih & Situ Patenggang", location: "Ciwidey", cost: 50000, icon: "🌊" },
        { time: "19:00", activity: "Dinner BBQ Kampung Daun", location: "Lembang", cost: 80000, icon: "🔥" },
        { time: "08:00", activity: "Sarapan & Farm to Table breakfast", location: "Lembang", cost: 35000, icon: "🌿" },
        { time: "10:00", activity: "Tangkuban Perahu", location: "Tangkuban Perahu", cost: 30000, icon: "🌋" },
        { time: "13:00", activity: "Belanja Factory Outlet", location: "Dago", cost: 200000, icon: "🛍️" },
        { time: "16:00", activity: "Pulang ke Jakarta", location: "Bandung → Jakarta", cost: 120000, icon: "🚗" },
      ]
    }
  },
  {
    id: 2, name: "Yogyakarta Cultural Trip", city: "Yogyakarta", province: "DIY",
    type: "Budaya + Alam", tags: ["Kuliner", "Wisata Kota", "Keluarga", "Hidden Gem"],
    budgetCategory: ["standar", "premium"],
    estimatedCost: { "1 Hari": 500000, "2D1N": 900000, "3D2N": 1500000 },
    transportCost: 250000, hotelCost: 350000, foodCost: 200000, ticketCost: 100000,
    distanceLabel: "8 jam darat / 1 jam pesawat", distance: 560,
    matchReason: "Kota budaya dengan street food legendaris, candi megah, dan pantai selatan",
    rating: 4.8, reviewCount: 34200,
    badges: ["Populer", "Keluarga"],
    image: "🏛️",
    hiddenGems: ["Bukit Bintang — spot malam terbaik lihat Jogja dari atas", "Warung Bu Ageng — masakan rumahan asli Jawa", "Pantai Timang — pantai berbatu dramatis dengan gondola"],
    itinerary: {
      "2D1N": [
        { time: "06:00", activity: "Naik kereta Argo Lawu dari Jakarta", location: "Stasiun Gambir", cost: 250000, icon: "🚂" },
        { time: "13:30", activity: "Tiba Jogja, check-in hotel Malioboro", location: "Malioboro", cost: 350000, icon: "🏨" },
        { time: "15:00", activity: "Kraton Yogyakarta & Museum", location: "Kraton", cost: 15000, icon: "👑" },
        { time: "18:00", activity: "Sunset di Benteng Vredeburg", location: "Vredeburg", cost: 3000, icon: "🌅" },
        { time: "19:30", activity: "Kuliner malam Gudeg Wijilan", location: "Wijilan", cost: 35000, icon: "🍲" },
        { time: "05:00", activity: "Sunrise di Candi Borobudur", location: "Magelang", cost: 50000, icon: "☀️" },
        { time: "09:00", activity: "Prambanan + Museum", location: "Prambanan", cost: 50000, icon: "🕌" },
        { time: "13:00", activity: "Makan siang Warung Sate Klatak", location: "Bantul", cost: 40000, icon: "🥩" },
        { time: "16:00", activity: "Belanja batik Pasar Beringharjo", location: "Malioboro", cost: 200000, icon: "👘" },
        { time: "20:00", activity: "Naik KA balik ke Jakarta", location: "Stasiun Tugu", cost: 250000, icon: "🚂" },
      ]
    }
  },
  {
    id: 3, name: "Bali Island Escape", city: "Bali", province: "Bali",
    type: "Pantai + Spa", tags: ["Pantai", "Healing", "Solo Trip", "Hidden Gem"],
    budgetCategory: ["standar", "premium"],
    estimatedCost: { "2D1N": 2000000, "3D2N": 3500000, "5D4N": 5500000 },
    transportCost: 800000, hotelCost: 1200000, foodCost: 600000, ticketCost: 300000,
    distanceLabel: "2.5 jam pesawat", distance: 1175,
    matchReason: "Surga tropis dunia dengan pantai memukau, spa murah, dan sunset terbaik",
    rating: 4.9, reviewCount: 89600,
    badges: ["Populer", "Premium"],
    image: "🌴",
    hiddenGems: ["Pantai Nyang Nyang — pantai tersembunyi tanpa turis massal", "Warung Babi Guling Ibu Oka II — cabang tersembunyi lebih sepi", "Pura Lempuyang — spot foto Gates of Heaven yang genuine"],
    itinerary: {
      "3D2N": [
        { time: "06:00", activity: "Flight dari Jakarta ke Denpasar", location: "CGK → DPS", cost: 800000, icon: "✈️" },
        { time: "09:00", activity: "Check-in villa/resort di Seminyak", location: "Seminyak", cost: 1200000, icon: "🏨" },
        { time: "11:00", activity: "Pantai Seminyak & Coffee", location: "Seminyak Beach", cost: 50000, icon: "☕" },
        { time: "14:00", activity: "Spa tradisional Bali", location: "Spa Ubud", cost: 150000, icon: "💆" },
        { time: "18:00", activity: "Sunset di Pura Tanah Lot", location: "Tanah Lot", cost: 60000, icon: "🌅" },
        { time: "20:00", activity: "Seafood dinner di Jimbaran Bay", location: "Jimbaran", cost: 200000, icon: "🦞" },
        { time: "08:00", activity: "Tour Ubud — Rice Terrace & Monkey Forest", location: "Ubud", cost: 200000, icon: "🌾" },
        { time: "13:00", activity: "Kelas memasak masakan Bali", location: "Ubud", cost: 250000, icon: "👨‍🍳" },
        { time: "17:00", activity: "Kintamani — danau & gunung Batur", location: "Kintamani", cost: 30000, icon: "🌋" },
        { time: "08:00", activity: "Snorkeling di Blue Lagoon", location: "Padangbai", cost: 150000, icon: "🤿" },
        { time: "14:00", activity: "Belanja oleh-oleh Sukawati", location: "Sukawati", cost: 300000, icon: "🛍️" },
        { time: "19:00", activity: "Flight pulang", location: "DPS → CGK", cost: 800000, icon: "✈️" },
      ]
    }
  },
  {
    id: 4, name: "Malang Apple Town", city: "Malang", province: "Jawa Timur",
    type: "Kota + Alam", tags: ["Kuliner", "Alam", "Keluarga", "Wisata Kota"],
    budgetCategory: ["hemat", "standar"],
    estimatedCost: { "1 Hari": 300000, "2D1N": 550000, "3D2N": 800000 },
    transportCost: 150000, hotelCost: 180000, foodCost: 120000, ticketCost: 70000,
    distanceLabel: "10 jam darat / 1h15m pesawat", distance: 800,
    matchReason: "Kota apel yang sejuk, pantai cantik Malang Selatan, dan kuliner unik",
    rating: 4.5, reviewCount: 15600,
    badges: ["Hemat", "Keluarga"],
    image: "🍎",
    hiddenGems: ["Pantai Tiga Warna — pantai sertifikat snorkeling unik", "Pasar Apung Selecta — sarapan seru", "Coban Rais — air terjun swing kekinian"],
    itinerary: {
      "2D1N": [
        { time: "05:00", activity: "Bus dari Surabaya / flight dari Jakarta", location: "Jakarta/Surabaya", cost: 150000, icon: "🚌" },
        { time: "10:00", activity: "Check-in homestay kota", location: "Malang Kota", cost: 180000, icon: "🏠" },
        { time: "12:00", activity: "Bakso malang & es krim apel", location: "Alun-alun", cost: 30000, icon: "🍜" },
        { time: "14:00", activity: "Jatim Park 1 / Batu Secret Zoo", location: "Batu", cost: 120000, icon: "🦁" },
        { time: "18:00", activity: "Dinner di alun-alun Batu", location: "Batu", cost: 40000, icon: "🌃" },
        { time: "07:00", activity: "Petik apel langsung di kebun", location: "Petung", cost: 25000, icon: "🍎" },
        { time: "10:00", activity: "Coban Rondo waterfall", location: "Pujon", cost: 20000, icon: "💦" },
        { time: "13:00", activity: "Makan siang ikan bakar Pantai Balekambang", location: "Balekambang", cost: 50000, icon: "🐟" },
        { time: "17:00", activity: "Berangkat pulang", location: "Malang", cost: 150000, icon: "🚌" },
      ]
    }
  },
  {
    id: 5, name: "Bogor Weekend Retreat", city: "Bogor", province: "Jawa Barat",
    type: "Alam + Refresh", tags: ["Alam", "Healing", "Keluarga", "Hemat"],
    budgetCategory: ["hemat"],
    estimatedCost: { "1 Hari": 200000, "2D1N": 400000 },
    transportCost: 60000, hotelCost: 150000, foodCost: 100000, ticketCost: 40000,
    distanceLabel: "1–1.5 jam dari Jakarta", distance: 60,
    matchReason: "Kota hujan terdekat dari Jakarta dengan kebun raya legendaris",
    rating: 4.3, reviewCount: 8900,
    badges: ["Dekat", "Hemat"],
    image: "🌿",
    hiddenGems: ["Kampung Wisata Cinangneng — agrowisata tersembunyi", "Curug Cilember — 7 curug mini yang sepi", "Warung Nasi Uduk Bejo — sarapan legendaris murah"],
    itinerary: {
      "1 Hari": [
        { time: "07:00", activity: "Berangkat dari Jakarta (KRL/Bus)", location: "Jakarta", cost: 60000, icon: "🚃" },
        { time: "09:00", activity: "Kebun Raya Bogor", location: "Kebun Raya", cost: 30000, icon: "🌳" },
        { time: "12:00", activity: "Makan siang Soto Kuning khas Bogor", location: "Jl. Suryakencana", cost: 25000, icon: "🍜" },
        { time: "13:30", activity: "Istana Bogor (lihat dari luar)", location: "Istana Bogor", cost: 0, icon: "🏰" },
        { time: "15:00", activity: "Taman Safari Indonesia", location: "Cisarua", cost: 150000, icon: "🦒" },
        { time: "18:30", activity: "Mie ayam + Es krim Bogor", location: "Kota Bogor", cost: 30000, icon: "🍦" },
        { time: "20:00", activity: "Kembali ke Jakarta", location: "Bogor → Jakarta", cost: 60000, icon: "🚃" },
      ]
    }
  },
  {
    id: 6, name: "Dieng Plateau Magic", city: "Dieng", province: "Jawa Tengah",
    type: "Alam Pegunungan", tags: ["Alam", "Hidden Gem", "Healing", "Gunung"],
    budgetCategory: ["hemat", "standar"],
    estimatedCost: { "2D1N": 700000, "3D2N": 1100000 },
    transportCost: 200000, hotelCost: 200000, foodCost: 150000, ticketCost: 100000,
    distanceLabel: "6 jam dari Jakarta", distance: 350,
    matchReason: "Surga tersembunyi di atas awan — dataran tinggi misterius dan megah",
    rating: 4.6, reviewCount: 7200,
    badges: ["Hidden Gem", "Alam"],
    image: "🌄",
    hiddenGems: ["Telaga Cebong — danau mini di puncak desa Sembungan", "Bukit Scooter — offroad mewah ala Eropa", "Warung kopi jin — kafe misterius dengan view awan"],
    itinerary: {
      "2D1N": [
        { time: "22:00", activity: "Berangkat malam dari Jakarta", location: "Jakarta", cost: 200000, icon: "🚌" },
        { time: "06:00", activity: "Tiba Dieng — sunrise di Bukit Sikunir", location: "Sikunir", cost: 15000, icon: "☀️" },
        { time: "09:00", activity: "Sarapan carica & mie ongklok khas Dieng", location: "Dieng", cost: 25000, icon: "🍜" },
        { time: "10:00", activity: "Candi Arjuna & Telaga Warna", location: "Dieng Plateau", cost: 60000, icon: "🏛️" },
        { time: "13:00", activity: "Kawah Sikidang", location: "Sikidang", cost: 20000, icon: "🌋" },
        { time: "15:00", activity: "Check-in homestay", location: "Dieng Village", cost: 200000, icon: "🏡" },
        { time: "18:00", activity: "Dinner & bonfire di homestay", location: "Dieng", cost: 50000, icon: "🔥" },
        { time: "05:00", activity: "Sunrise kedua di Bukit Teletubbies", location: "Prau", cost: 10000, icon: "🌅" },
        { time: "10:00", activity: "Belanja oleh-oleh keripik carica", location: "Pasar Dieng", cost: 100000, icon: "🛍️" },
        { time: "13:00", activity: "Kembali ke Jakarta", location: "Dieng → Jakarta", cost: 200000, icon: "🚌" },
      ]
    }
  },
  {
    id: 7, name: "Anyer Beach Weekend", city: "Anyer", province: "Banten",
    type: "Pantai", tags: ["Pantai", "Keluarga", "Healing", "Solo Trip"],
    budgetCategory: ["hemat", "standar"],
    estimatedCost: { "1 Hari": 250000, "2D1N": 500000 },
    transportCost: 80000, hotelCost: 250000, foodCost: 100000, ticketCost: 30000,
    distanceLabel: "2.5 jam dari Jakarta", distance: 130,
    matchReason: "Pantai paling dekat dari Jakarta dengan sunset Selat Sunda yang indah",
    rating: 4.2, reviewCount: 11300,
    badges: ["Dekat", "Pantai"],
    image: "🌊",
    hiddenGems: ["Pantai Karang Bolong — pantai batu karang unik yang sepi", "Tanjung Lesung — resort mewah alternatif yang lebih sepi", "Mercusuar Anyer — naik ke atas lihat 360 derajat"],
    itinerary: {
      "2D1N": [
        { time: "07:00", activity: "Berangkat dari Jakarta via tol", location: "Jakarta", cost: 80000, icon: "🚗" },
        { time: "09:30", activity: "Tiba & check-in penginapan pinggir pantai", location: "Anyer", cost: 250000, icon: "🏖️" },
        { time: "11:00", activity: "Main di pantai & snorkeling", location: "Anyer Beach", cost: 30000, icon: "🤿" },
        { time: "13:00", activity: "Makan ikan bakar segar di warung", location: "Anyer", cost: 50000, icon: "🐟" },
        { time: "16:00", activity: "Sunset cruise mini atau naik perahu", location: "Anyer Laut", cost: 50000, icon: "⛵" },
        { time: "19:00", activity: "BBQ di pinggir pantai", location: "Penginapan", cost: 75000, icon: "🔥" },
        { time: "07:00", activity: "Sarapan + surfing/bodyboard", location: "Anyer", cost: 30000, icon: "🏄" },
        { time: "11:00", activity: "Mercusuar Anyer & Carita", location: "Carita", cost: 20000, icon: "🗼" },
        { time: "14:00", activity: "Pulang ke Jakarta", location: "Anyer → Jakarta", cost: 80000, icon: "🚗" },
      ]
    }
  },
  {
    id: 8, name: "Pangandaran Paradise", city: "Pangandaran", province: "Jawa Barat",
    type: "Pantai + Alam", tags: ["Pantai", "Alam", "Keluarga", "Solo Trip"],
    budgetCategory: ["standar"],
    estimatedCost: { "2D1N": 800000, "3D2N": 1300000 },
    transportCost: 250000, hotelCost: 300000, foodCost: 150000, ticketCost: 80000,
    distanceLabel: "5 jam dari Bandung", distance: 290,
    matchReason: "Pantai Jawa Barat terbaik dengan cagar alam, snorkeling, dan seafood segar",
    rating: 4.4, reviewCount: 9800,
    badges: ["Populer", "Pantai"],
    image: "🏝️",
    hiddenGems: ["Pantai Batu Karas — surfing spot tersembunyi", "Green Canyon / Cukang Taneuh — sungai hijau dramatis", "Warung Bu Entin — nasi liwet + ikan asin terenak"],
    itinerary: {
      "2D1N": [
        { time: "06:00", activity: "Berangkat dari Bandung / Jakarta", location: "Bandung/Jakarta", cost: 250000, icon: "🚌" },
        { time: "11:00", activity: "Check-in penginapan", location: "Pangandaran", cost: 300000, icon: "🏨" },
        { time: "12:00", activity: "Seafood lunch segar", location: "Pangandaran", cost: 60000, icon: "🦐" },
        { time: "14:00", activity: "Cagar Alam Pangandaran", location: "Cagar Alam", cost: 30000, icon: "🌿" },
        { time: "17:00", activity: "Sunset di Pantai Barat", location: "Pantai Barat", cost: 0, icon: "🌅" },
        { time: "20:00", activity: "Night market seafood", location: "Pangandaran", cost: 60000, icon: "🌙" },
        { time: "07:00", activity: "Snorkeling di Pantai Timur", location: "Pantai Timur", cost: 50000, icon: "🤿" },
        { time: "10:00", activity: "Green Canyon boat trip", location: "Cijulang", cost: 150000, icon: "🚣" },
        { time: "14:00", activity: "Pulang", location: "Pangandaran", cost: 250000, icon: "🚌" },
      ]
    }
  }
];

export const upgradeTips = [
  { from: 500000, to: 800000, message: "Tambah Rp300rb bisa dapat hotel bintang 3 lebih dekat ke pantai dengan sarapan gratis." },
  { from: 800000, to: 1200000, message: "Tambah Rp400rb bisa dapat vila dengan kolam renang pribadi dan shuttle gratis." },
  { from: 1200000, to: 1800000, message: "Tambah Rp600rb bisa dapat penginapan resort + spa gratis + breakfast buffet." },
  { from: 200000, to: 350000, message: "Tambah Rp150rb bisa upgrade transport ke travel AC dengan jadwal lebih fleksibel." },
];

export const savingTips = [
  { icon: "📅", tip: "Pergi di weekday, harga hotel bisa lebih murah 30–50%" },
  { icon: "🎫", tip: "Beli tiket tempat wisata online lewat Traveloka / Klook lebih hemat" },
  { icon: "🚌", tip: "Gunakan transportasi umum / KRL untuk kota-kota terdekat" },
  { icon: "🕐", tip: "Book hotel minimal H-7 untuk dapat early bird rate terbaik" },
  { icon: "🍽️", tip: "Makan di warung lokal, kualitas sama tapi harga 40% lebih murah" },
  { icon: "⛽", tip: "Cari promo voucher bensin / toll cashback dari dompet digital" },
];

export const PREFERENCES = [
  "Pantai", "Gunung", "Kuliner", "Staycation", "Alam",
  "Hidden Gem", "Keluarga", "Solo Trip", "Healing", "Wisata Kota"
];

export const DURATIONS = ["1 Hari", "2D1N", "3D2N", "Custom"];
