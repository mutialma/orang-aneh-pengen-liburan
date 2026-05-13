"use client";
import { useState } from "react";
import { Search, Filter, MapPin, Star } from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge, Stars } from "@/components/ui/cards";
import { destinations, PREFERENCES } from "@/data/destinations";
import { fmt } from "@/lib/utils";

export default function DestinationsPage() {
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("Semua");

  const tags = ["Semua", ...PREFERENCES];

  const filtered = destinations.filter((d) => {
    const matchSearch =
      search === "" ||
      d.name.toLowerCase().includes(search.toLowerCase()) ||
      d.city.toLowerCase().includes(search.toLowerCase());
    const matchTag = activeTag === "Semua" || d.tags.includes(activeTag);
    return matchSearch && matchTag;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      {/* Header */}
      <section className="py-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-sky-200">
          <MapPin size={12} /> {destinations.length} Destinasi Pilihan
        </div>
        <h1 className="font-display text-4xl font-black text-gray-900 mb-3">
          Semua <span className="gradient-text">Destinasi</span>
        </h1>
        <p className="text-gray-500 max-w-md mx-auto text-sm">
          Jelajahi semua pilihan destinasi wisata terbaik di Indonesia sesuai selera dan budgetmu.
        </p>
      </section>

      {/* Filters */}
      <section className="px-4 pb-6 max-w-6xl mx-auto">
        {/* Search */}
        <div className="relative mb-4 max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari destinasi atau kota..."
            className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 bg-white focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition"
          />
        </div>

        {/* Tag filter */}
        <div className="flex gap-2 flex-wrap">
          {tags.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTag(t)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                activeTag === t
                  ? "gradient-bg text-white border-transparent"
                  : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="px-4 pb-16 max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">🔍</div>
            <p className="text-gray-400 font-semibold">Tidak ada destinasi yang cocok.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((dest) => {
              const cost = dest.estimatedCost["2D1N"] || Object.values(dest.estimatedCost)[0];
              return (
                <div
                  key={dest.id}
                  className="bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer overflow-hidden"
                >
                  {/* Image area */}
                  <div className="bg-gradient-to-br from-sky-50 to-emerald-50 h-32 flex items-center justify-center text-6xl">
                    {dest.image}
                  </div>
                  <div className="p-4">
                    <div className="flex gap-1 flex-wrap mb-2">
                      {dest.badges.slice(0, 2).map((b) => (
                        <Badge key={b} label={b} />
                      ))}
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 leading-tight mb-0.5">{dest.name}</h3>
                    <p className="text-xs text-gray-400 mb-2">
                      <MapPin size={10} className="inline mr-0.5" />
                      {dest.city}, {dest.province}
                    </p>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{dest.matchReason}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-black text-sky-600 text-sm">{fmt(cost)}</div>
                        <div className="text-xs text-gray-400">2D1N</div>
                      </div>
                      <Stars rating={dest.rating} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="px-4 pb-16 text-center">
        <div className="max-w-md mx-auto bg-gradient-to-br from-sky-500 to-cyan-400 rounded-3xl p-8 text-white">
          <div className="text-4xl mb-3">✨</div>
          <h2 className="font-display font-black text-2xl mb-2">Mau Rekomendasi Personal?</h2>
          <p className="text-sky-100 text-sm mb-5">
            Gunakan Planner AI kami untuk mendapat rekomendasi berdasarkan budget dan preferensimu.
          </p>
          <Link
            href="/planner"
            className="inline-flex items-center gap-2 bg-white text-sky-600 font-bold px-6 py-3 rounded-2xl hover:bg-sky-50 transition"
          >
            Buka Planner AI →
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
