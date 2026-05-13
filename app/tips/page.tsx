import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { savingTips } from "@/data/destinations";
import { Zap, TrendingUp, Star } from "lucide-react";
import Link from "next/link";

const EXTRA_TIPS = [
  { category: "Transport", icon: "🚗", tips: ["Gunakan KRL / bus umum untuk kota dekat Jakarta", "Cari promo Traveloka / Tiket.com H-30 untuk pesawat", "Sharing taksi online bisa hemat 40% vs solo ride", "Sewa motor di destinasi jauh lebih murah dari taksi"] },
  { category: "Akomodasi", icon: "🏨", tips: ["Pesan weekend di luar peak season (libur nasional)", "Bandingkan Agoda, Booking.com, dan Traveloka sebelum pesan", "Homestay lokal biasanya 50% lebih murah dari hotel", "Tentukan cancel policy sebelum booking"] },
  { category: "Kuliner", icon: "🍽️", tips: ["Warung lokal = kualitas sama, harga 40% lebih murah", "Hindari restoran di area turis utama, cari yang agak masuk", "Pasar tradisional pagi adalah surga sarapan murah", "Bawa camilan sendiri untuk perjalanan panjang"] },
  { category: "Wisata", icon: "🎫", tips: ["Beli tiket online di Klook / Traveloka lebih hemat 20%", "Masuk jam pagi = lebih sepi + cahaya foto lebih bagus", "Kartu pelajar / mahasiswa sering dapat diskon", "Cek Google Maps Reviews untuk tau jam ramai"] },
];

export default function TipsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      {/* Header */}
      <section className="py-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-emerald-200">
          <Zap size={12} /> Tips dari 10.000+ Traveler Indonesia
        </div>
        <h1 className="font-display text-4xl font-black text-gray-900 mb-3">
          Tips Hemat <span className="gradient-text">Liburan</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Kumpulan tips terbaik agar liburanmu lebih hemat tanpa mengorbankan kenyamanan.
        </p>
      </section>

      {/* Quick Tips */}
      <section className="px-4 pb-8 max-w-6xl mx-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-5 text-center">⚡ Tips Kilat</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
          {savingTips.map((t, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-4 border border-sky-100 hover:shadow-md transition text-center"
            >
              <div className="text-2xl mb-2">{t.icon}</div>
              <p className="text-xs text-gray-600 leading-relaxed">{t.tip}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category tips */}
      <section className="px-4 pb-12 max-w-6xl mx-auto">
        <h2 className="font-display font-black text-xl text-gray-900 mb-6 text-center">📚 Tips Lengkap per Kategori</h2>
        <div className="grid sm:grid-cols-2 gap-6">
          {EXTRA_TIPS.map((cat) => (
            <div key={cat.category} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center text-2xl">
                  {cat.icon}
                </div>
                <h3 className="font-display font-black text-lg text-gray-900">{cat.category}</h3>
              </div>
              <ul className="space-y-3">
                {cat.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600">
                    <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                    <span className="leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-16">
        <div className="max-w-xl mx-auto gradient-bg rounded-3xl p-8 text-center text-white">
          <Star size={32} className="mx-auto mb-3 opacity-80" />
          <h2 className="font-display font-black text-2xl mb-2">Terapkan Tips dengan Planner AI</h2>
          <p className="text-sky-100 text-sm mb-5">
            Rekomendasi otomatis sudah memasukkan semua tips hemat ini ke dalam itinerary.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 bg-white text-sky-600 font-bold px-6 py-3 rounded-2xl hover:bg-sky-50 transition"
          >
            Coba Planner Gratis →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
