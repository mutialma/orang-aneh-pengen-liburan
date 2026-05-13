import Link from "next/link";
import {
  Compass, ArrowRight, Sparkles, CheckCircle, Star,
  MapPin, Wallet, Clock, Users, Zap, TrendingUp,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge, Stars } from "@/components/ui/cards";
import { destinations, savingTips } from "@/data/destinations";
import { fmt } from "@/lib/utils";

const HOW_IT_WORKS = [
  { step: "01", icon: "💰", title: "Masukkan Budget", desc: "Tentukan anggaran totalmu, dari hemat sampai premium." },
  { step: "02", icon: "✨", title: "Pilih Preferensi", desc: "Pantai, gunung, kuliner, healing — pilih yang kamu suka." },
  { step: "03", icon: "🤖", title: "AI Rekomendasikan", desc: "Dapat destinasi + itinerary + estimasi biaya instan." },
  { step: "04", icon: "🗺️", title: "Berangkat!", desc: "Simpan rencana dan nikmati perjalananmu." },
];

const STATS = [
  { value: "50K+", label: "Traveler Puas" },
  { value: "100+", label: "Destinasi Dikurasi" },
  { value: "98%", label: "Akurasi Budget" },
  { value: "4.9", label: "Rating Rata-rata" },
];

export default function HomePage() {
  const featured = destinations.slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden pt-16 pb-20 px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-sky-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto relative text-center">
          <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6 border border-sky-200">
            <Sparkles size={12} /> AI-Powered Travel Planner Indonesia
          </div>
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 leading-tight mb-5">
            Liburan sesuai<br />
            <span className="gradient-text">budget</span>, tanpa ribet.
          </h1>
          <p className="text-gray-500 text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            AI bantu cari destinasi terbaik berdasarkan budget, lokasi, dan preferensimu. Dapat itinerary dan estimasi biaya langsung.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/planner"
              className="flex items-center gap-2 gradient-bg text-white font-black px-7 py-4 rounded-2xl hover:opacity-90 transition shadow-xl shadow-sky-200 text-sm"
            >
              <Sparkles size={16} /> Mulai Rencanakan Gratis
            </Link>
            <Link
              href="/destinations"
              className="flex items-center gap-2 bg-white text-gray-700 font-bold px-7 py-4 rounded-2xl hover:shadow-md transition border border-gray-200 text-sm"
            >
              <MapPin size={16} /> Lihat Destinasi
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="bg-white/70 backdrop-blur rounded-2xl p-4 border border-white/80 shadow-sm">
                <div className="font-display font-black text-2xl gradient-text">{s.value}</div>
                <div className="text-xs text-gray-500 font-medium mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-black text-gray-900 mb-2">Cara Kerja 🪄</h2>
            <p className="text-gray-400 text-sm">Rencanakan liburan impianmu dalam 4 langkah mudah</p>
          </div>
          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((h) => (
              <div key={h.step} className="text-center">
                <div className="w-16 h-16 bg-sky-50 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {h.icon}
                </div>
                <div className="text-xs font-bold text-sky-400 mb-1">{h.step}</div>
                <h3 className="font-bold text-gray-900 mb-2">{h.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-black text-gray-900 mb-1">Destinasi Populer 🏆</h2>
              <p className="text-gray-400 text-sm">Pilihan terfavorit traveler Indonesia</p>
            </div>
            <Link href="/destinations" className="text-sky-600 font-bold text-sm hover:underline flex items-center gap-1">
              Lihat semua <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {featured.map((dest) => {
              const cost = dest.estimatedCost["2D1N"] || Object.values(dest.estimatedCost)[0];
              return (
                <div key={dest.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all overflow-hidden">
                  <div className="bg-gradient-to-br from-sky-50 to-emerald-50 h-40 flex items-center justify-center text-7xl">
                    {dest.image}
                  </div>
                  <div className="p-5">
                    <div className="flex gap-1 mb-2 flex-wrap">
                      {dest.badges.map((b) => <Badge key={b} label={b} />)}
                    </div>
                    <h3 className="font-bold text-gray-900 mb-1">{dest.name}</h3>
                    <p className="text-xs text-gray-400 mb-3">{dest.city} · {dest.distanceLabel}</p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-4 line-clamp-2">{dest.matchReason}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-sky-600">{fmt(cost)}</div>
                        <div className="text-xs text-gray-400">2D1N</div>
                      </div>
                      <Stars rating={dest.rating} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Tips */}
      <section className="py-16 px-4 bg-white border-y border-gray-100">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl font-black text-gray-900 mb-2">Tips Hemat Liburan 🪙</h2>
            <p className="text-gray-400 text-sm">Kumpulan tips dari ribuan traveler Indonesia</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
            {savingTips.map((t, i) => (
              <div key={i} className="bg-gradient-to-br from-sky-50 to-white rounded-3xl p-4 border border-sky-100 hover:shadow-md transition text-center">
                <div className="text-2xl mb-2">{t.icon}</div>
                <p className="text-xs text-gray-600 leading-relaxed">{t.tip}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-6">
            <Link href="/tips" className="inline-flex items-center gap-2 text-sky-600 font-bold text-sm hover:underline">
              Lihat semua tips <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="gradient-bg rounded-3xl p-12">
            <div className="text-5xl mb-4">✈️</div>
            <h2 className="font-display font-black text-3xl text-white mb-3">
              Siap Liburan Pintar?
            </h2>
            <p className="text-sky-100 mb-7 leading-relaxed">
              Bergabung dengan 50.000+ traveler Indonesia yang sudah merencanakan liburan impian mereka.
            </p>
            <Link
              href="/login?tab=register"
              className="inline-flex items-center gap-2 bg-white text-sky-600 font-black px-8 py-4 rounded-2xl hover:bg-sky-50 transition shadow-lg text-sm"
            >
              Daftar Gratis Sekarang <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
