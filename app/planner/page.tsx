"use client";
import { useState, useRef } from "react";
import {
  Wallet, Compass, Sparkles, Clock, Search, TrendingUp, Zap,
  ChevronDown, Leaf, Waves, Mountain, Utensils, Home, Users,
  User, Heart, Globe, Loader2, CheckCircle, ChevronRight,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Badge, Stars, SkeletonCard, DestCard } from "@/components/ui/cards";
import { filterDestinations, fmt, parseItineraryDays, getItineraryForDuration } from "@/lib/utils";
import { PREFERENCES, DURATIONS, savingTips, upgradeTips } from "@/data/destinations";

const PREF_ICONS: Record<string, React.FC<{ size?: number; className?: string }>> = {
  Pantai: Waves, Gunung: Mountain, Kuliner: Utensils, Staycation: Home,
  Alam: Leaf, "Hidden Gem": Sparkles, Keluarga: Users, "Solo Trip": User,
  Healing: Heart, "Wisata Kota": Globe,
};

export default function PlannerPage() {
  const [budget, setBudget] = useState(1500000);
  const [budgetInput, setBudgetInput] = useState("1500000");
  const [budgetCategory, setBudgetCategory] = useState("standar");
  const [preferences, setPreferences] = useState<string[]>([]);
  const [duration, setDuration] = useState("2D1N");
  const [results, setResults] = useState<ReturnType<typeof filterDestinations> | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("terbaik");
  const [itineraryOpen, setItineraryOpen] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const budgetPresets: Record<string, number> = { hemat: 500000, standar: 1500000, premium: 3500000 };

  const togglePref = (p: string) =>
    setPreferences((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const handleBudgetCategory = (cat: string) => {
    setBudgetCategory(cat);
    setBudget(budgetPresets[cat]);
    setBudgetInput(String(budgetPresets[cat]));
  };

  const handleSearch = () => {
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const r = filterDestinations(budget, preferences, duration);
      setResults(r);
      setLoading(false);
      setActiveTab("terbaik");
      setItineraryOpen(false);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 1600);
  };

  const itineraryDays = results ? parseItineraryDays(
    getItineraryForDuration(results.main, results.durationKey)
  ) : [];

  const currentTabDests = results
    ? activeTab === "terbaik" ? results.alternatives
      : activeTab === "murah" ? results.cheaper
      : results.pricier
    : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      {/* Hero */}
      <section className="py-12 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-4 border border-sky-200">
          <Sparkles size={12} /> AI-Powered Travel Planner
        </div>
        <h1 className="font-display text-4xl md:text-5xl font-black text-gray-900 mb-3">
          Rencanakan <span className="gradient-text">Liburanmu</span>
        </h1>
        <p className="text-gray-500 max-w-lg mx-auto text-sm leading-relaxed">
          Masukkan budget, durasi, dan preferensimu. AI kami akan merekomendasikan destinasi + itinerary terbaik.
        </p>
      </section>

      {/* Planner Form */}
      <section className="px-4 pb-8" id="planner">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="gradient-bg px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Compass size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white">Perencana Liburan</h2>
              <p className="text-sky-100 text-xs">Isi form di bawah dan dapatkan rekomendasi instan</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Budget */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Wallet size={16} className="text-sky-500" /> Budget Total Liburan
              </label>
              <div className="flex gap-2 mb-3">
                {["hemat", "standar", "premium"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleBudgetCategory(cat)}
                    className={`flex-1 py-2 rounded-xl text-xs font-bold capitalize transition border ${
                      budgetCategory === cat
                        ? "gradient-bg text-white border-transparent shadow-md shadow-sky-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={(e) => {
                    setBudgetInput(e.target.value);
                    setBudget(parseInt(e.target.value) || 0);
                  }}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm font-semibold transition"
                  placeholder="1500000"
                />
              </div>
              <p className="text-xs text-gray-400 mt-1.5">
                Budget kamu: <span className="font-bold text-sky-600">{fmt(budget)}</span>
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Clock size={16} className="text-sky-500" /> Durasi Perjalanan
              </label>
              <div className="flex gap-2 flex-wrap">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDuration(d)}
                    className={`px-4 py-2 rounded-xl text-sm font-bold transition border ${
                      duration === d
                        ? "gradient-bg text-white border-transparent shadow-md shadow-sky-200"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>

            {/* Preferences */}
            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Sparkles size={16} className="text-sky-500" /> Preferensi Wisata{" "}
                <span className="font-normal text-gray-400">(pilih beberapa)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {PREFERENCES.map((p) => {
                  const Icon = PREF_ICONS[p];
                  const active = preferences.includes(p);
                  return (
                    <button
                      key={p}
                      onClick={() => togglePref(p)}
                      className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition border ${
                        active
                          ? "gradient-bg text-white border-transparent shadow-md shadow-sky-200"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                      }`}
                    >
                      {Icon && <Icon size={13} />} {p}
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full gradient-bg text-white font-black py-4 rounded-2xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-lg shadow-sky-200 text-sm"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> Mencari destinasi terbaik...</>
              ) : (
                <><Search size={18} /> Temukan Destinasi Ideal</>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Loading Skeleton */}
      {loading && (
        <section className="px-4 pb-8">
          <div className="max-w-3xl mx-auto">
            <SkeletonCard />
          </div>
        </section>
      )}

      {/* Results */}
      {results && !loading && (
        <div ref={resultRef} className="slide-in">
          {/* Main Result */}
          <section className="px-4 pb-8">
            <div className="max-w-3xl mx-auto">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle size={18} className="text-emerald-500" />
                <h2 className="font-display font-black text-xl text-gray-900">
                  Rekomendasi Terbaik Untukmu
                </h2>
              </div>
              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                {/* Destination header */}
                <div className="gradient-bg p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-5xl mb-3">{results.main.image}</div>
                      <h3 className="font-display font-black text-2xl text-white">{results.main.name}</h3>
                      <p className="text-sky-100 text-sm mt-1">{results.main.city}, {results.main.province} · {results.main.distanceLabel}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-black text-white">
                        {fmt(results.main.estimatedCost[results.durationKey] || results.main.estimatedCost["2D1N"] || 0)}
                      </div>
                      <div className="text-sky-200 text-xs mt-1">estimasi total</div>
                      <div className="flex gap-1 flex-wrap justify-end mt-2">
                        {results.main.badges.map((b) => <Badge key={b} label={b} />)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="p-5 border-b border-gray-100">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Transport", value: results.main.transportCost, icon: "🚗" },
                      { label: "Hotel", value: results.main.hotelCost, icon: "🏨" },
                      { label: "Makan", value: results.main.foodCost, icon: "🍽️" },
                      { label: "Tiket", value: results.main.ticketCost, icon: "🎫" },
                    ].map((c) => (
                      <div key={c.label} className="bg-gray-50 rounded-2xl p-3 text-center">
                        <div className="text-xl mb-1">{c.icon}</div>
                        <div className="font-black text-sm text-gray-800">{fmt(c.value)}</div>
                        <div className="text-xs text-gray-400">{c.label}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Itinerary toggle */}
                <div className="p-5">
                  <button
                    onClick={() => setItineraryOpen(!itineraryOpen)}
                    className="w-full flex items-center justify-between bg-sky-50 hover:bg-sky-100 transition rounded-2xl px-4 py-3"
                  >
                    <span className="font-bold text-sky-700 text-sm">📍 Lihat Itinerary Lengkap</span>
                    <ChevronDown size={18} className={`text-sky-500 transition-transform ${itineraryOpen ? "rotate-180" : ""}`} />
                  </button>

                  {itineraryOpen && (
                    <div className="mt-4 slide-in">
                      {itineraryDays.length > 1 && (
                        <div className="flex gap-2 mb-4">
                          {itineraryDays.map((_, i) => (
                            <button
                              key={i}
                              onClick={() => setActiveDay(i)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                                activeDay === i ? "gradient-bg text-white" : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              Hari {i + 1}
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="space-y-3">
                        {(itineraryDays[activeDay] || itineraryDays[0] || []).map((item, idx) => (
                          <div key={idx} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sm shrink-0">
                                {item.icon}
                              </div>
                              {idx < (itineraryDays[activeDay]?.length ?? 0) - 1 && (
                                <div className="w-px flex-1 bg-gray-100 mt-1" />
                              )}
                            </div>
                            <div className="pb-3 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <span className="text-xs font-bold text-sky-500 mr-2">{item.time}</span>
                                  <span className="text-sm font-semibold text-gray-800">{item.activity}</span>
                                  <div className="text-xs text-gray-400 mt-0.5">📍 {item.location}</div>
                                </div>
                                {item.cost > 0 && (
                                  <span className="text-xs font-bold text-emerald-600 shrink-0">{fmt(item.cost)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Alternatives */}
          <section className="px-4 pb-8">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display font-black text-xl text-gray-900 mb-4">Pilihan Lainnya</h2>
              <div className="flex gap-2 mb-4 flex-wrap">
                {[
                  { key: "terbaik", label: "Alternatif Terbaik" },
                  { key: "murah", label: "💰 Lebih Hemat" },
                  { key: "mahal", label: "✨ Lebih Premium" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      activeTab === t.key
                        ? "gradient-bg text-white border-transparent"
                        : "bg-white text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              {currentTabDests.length > 0 ? (
                <div className="grid sm:grid-cols-3 gap-4">
                  {currentTabDests.map((dest) => (
                    <DestCard key={dest.id} dest={dest} durationKey={results.durationKey} />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-sm text-center py-6">Tidak ada pilihan di kategori ini.</p>
              )}
            </div>
          </section>

          {/* Insights */}
          <section className="px-4 pb-12">
            <div className="max-w-3xl mx-auto">
              <h2 className="font-display font-black text-xl text-gray-900 mb-4">Insight & Tips</h2>
              <div className="grid sm:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-3xl p-5 border border-amber-100">
                  <div className="w-10 h-10 bg-amber-400 rounded-2xl flex items-center justify-center mb-3">
                    <TrendingUp size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-2">💡 Saran Upgrade</h3>
                  <p className="text-gray-600 text-xs leading-relaxed">
                    {upgradeTips.find((t) => budget >= t.from && budget <= t.to)?.message ||
                      "Tambah Rp300.000 bisa dapat hotel lebih nyaman dan lebih dekat ke pantai."}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-3xl p-5 border border-emerald-100">
                  <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center mb-3">
                    <Zap size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-3">⚡ Tips Hemat</h3>
                  <ul className="space-y-1.5">
                    {savingTips.slice(0, 4).map((t, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-sm leading-none mt-0.5">{t.icon}</span>
                        <span className="leading-relaxed">{t.tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-5 border border-purple-100">
                  <div className="w-10 h-10 bg-purple-500 rounded-2xl flex items-center justify-center mb-3">
                    <Sparkles size={18} className="text-white" />
                  </div>
                  <h3 className="font-bold text-gray-800 text-sm mb-3">✨ Hidden Gem Sekitar</h3>
                  <ul className="space-y-2">
                    {results.main.hiddenGems.map((g, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-xs text-gray-600">
                        <span className="text-emerald-500 mt-0.5">◆</span>
                        <span className="leading-relaxed">{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      <Footer />

      {/* Mobile sticky CTA */}
      <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
        <button
          onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full py-3.5 gradient-bg text-white font-black text-sm rounded-2xl shadow-2xl shadow-sky-300 flex items-center justify-center gap-2"
        >
          <Search size={16} /> Rencanakan Liburanmu
        </button>
      </div>
    </div>
  );
}
