"use client";
import { useState, useRef } from "react";
import {
  Wallet, Compass, Sparkles, Clock, Search, ChevronDown,
  Loader2, MapPin, Users, Calendar, Car, Heart, Utensils, Info,
  TrendingUp, AlertTriangle, Star,
} from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import {
  SUPPORTED_REGIONS, CATEGORIES_LIST, VIBES_LIST, FOODS_LIST,
  TRANSPORTS, INTENSITIES, Category, Vibe, FoodType,
} from "@/data/pois";
import { buildItinerary, PlannerInput, ItineraryResult, DayPlan, ScheduledItem } from "@/lib/planner-ai";
import { attachNarrative } from "@/lib/itinerary-narrator";

const fmt = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;

export default function PlannerPage() {
  const [startRegion, setStartRegion] = useState<string>(SUPPORTED_REGIONS[0]);
  const [budget, setBudget] = useState(3_000_000);
  const [numDays, setNumDays] = useState(3);
  const [numPeople, setNumPeople] = useState(2);
  const [transport, setTransport] = useState<PlannerInput["transport"]>("rental-mobil");
  const [intensity, setIntensity] = useState<PlannerInput["intensity"]>("normal");
  const [categories, setCategories] = useState<Category[]>([]);
  const [vibe, setVibe] = useState<Vibe>("healing");
  const [foods, setFoods] = useState<FoodType[]>(["lokal", "halal"]);

  const [result, setResult] = useState<ItineraryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeDay, setActiveDay] = useState(0);
  const [showReasonings, setShowReasonings] = useState(false);
  const resultRef = useRef<HTMLDivElement>(null);

  function toggleString<T extends string>(arr: T[], value: T, setter: (v: T[]) => void) {
    setter(arr.includes(value) ? arr.filter((x) => x !== value) : [...arr, value]);
  }

  const handleSearch = () => {
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      const input: PlannerInput = {
        startRegion, totalBudget: budget, numDays, numPeople,
        transport, intensity, categories, vibe, foods,
      };
      const r = attachNarrative(buildItinerary(input));
      setResult(r);
      setLoading(false);
      setActiveDay(0);
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      <section className="py-10 px-4 text-center">
        <div className="inline-flex items-center gap-2 bg-sky-100 text-sky-700 text-xs font-bold px-3 py-1.5 rounded-full mb-3 border border-sky-200">
          <Sparkles size={12} /> A* AI Planner — Multi-Day Smart Itinerary
        </div>
        <h1 className="font-display text-3xl md:text-5xl font-black text-gray-900 mb-2">
          Bikin Itinerary <span className="gradient-text">Senatural Manusia</span>
        </h1>
        <p className="text-gray-500 max-w-xl mx-auto text-sm leading-relaxed">
          Isi preferensi lo, AI bakal racik urutan destinasi, jam, makan, dan penginapan yang masuk akal — bukan asal tempel.
        </p>
      </section>

      <section className="px-4 pb-8" id="planner">
        <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="gradient-bg px-6 py-4 flex items-center gap-3">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <Compass size={18} className="text-white" />
            </div>
            <div>
              <h2 className="font-display font-black text-lg text-white">AI Travel Planner</h2>
              <p className="text-sky-100 text-xs">Powered by A* search — optimal multi-day routing</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                  <MapPin size={14} className="text-sky-500" /> Lokasi Tujuan
                </label>
                <select value={startRegion} onChange={(e) => setStartRegion(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-sky-400 text-sm font-semibold"
                >
                  {SUPPORTED_REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                  <Calendar size={14} className="text-sky-500" /> Jumlah Hari
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button key={n} onClick={() => setNumDays(n)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition border ${
                        numDays === n ? "gradient-bg text-white border-transparent"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                      }`}
                    >{n}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-bold text-gray-700 mb-2">
                  <Users size={14} className="text-sky-500" /> Jumlah Orang
                </label>
                <input type="number" min="1" max="10" value={numPeople}
                  onChange={(e) => setNumPeople(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-sky-400 text-sm font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3">
                <Wallet size={16} className="text-sky-500" /> Total Budget
                <span className="ml-auto text-xs font-normal text-gray-500">untuk {numPeople} orang × {numDays} hari</span>
              </label>
              <div className="flex gap-2 mb-3 flex-wrap">
                {[
                  { label: "Hemat", value: 1_500_000 },
                  { label: "Standar", value: 3_500_000 },
                  { label: "Nyaman", value: 6_000_000 },
                  { label: "Premium", value: 10_000_000 },
                ].map((b) => (
                  <button key={b.value} onClick={() => setBudget(b.value)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                      budget === b.value ? "gradient-bg text-white border-transparent"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >{b.label}<span className="ml-1.5 opacity-70">{fmt(b.value)}</span></button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-gray-400">Rp</span>
                <input type="number" value={budget} onChange={(e) => setBudget(parseInt(e.target.value) || 0)}
                  className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sky-400 text-sm font-semibold"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <Car size={16} className="text-sky-500" /> Transportasi
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TRANSPORTS.map((t) => (
                    <button key={t.value} onClick={() => setTransport(t.value)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${
                        transport === t.value ? "gradient-bg text-white border-transparent"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                      }`}
                    >{t.label}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                  <TrendingUp size={16} className="text-sky-500" /> Intensitas
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {INTENSITIES.map((i) => (
                    <button key={i.value} onClick={() => setIntensity(i.value)}
                      className={`px-2 py-2 rounded-xl text-xs font-bold transition border ${
                        intensity === i.value ? "gradient-bg text-white border-transparent"
                          : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                      }`}
                    >{i.label}</button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Heart size={16} className="text-sky-500" /> Vibe Perjalanan
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {VIBES_LIST.map((v) => (
                  <button key={v.value} onClick={() => setVibe(v.value)}
                    className={`px-3 py-2.5 rounded-xl text-xs transition border text-left ${
                      vibe === v.value ? "gradient-bg text-white border-transparent"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:border-sky-300"
                    }`}
                  >
                    <div className="font-bold">{v.icon} {v.label}</div>
                    <div className={`text-[10px] mt-0.5 ${vibe === v.value ? "text-white/80" : "text-gray-500"}`}>{v.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Sparkles size={16} className="text-sky-500" /> Kategori Favorit
                <span className="font-normal text-gray-400 text-xs">(opsional, pilih beberapa)</span>
              </label>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES_LIST.map((c) => (
                  <button key={c.value} onClick={() => toggleString(categories, c.value, setCategories)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                      categories.includes(c.value) ? "gradient-bg text-white border-transparent"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >{c.icon} {c.label}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-2">
                <Utensils size={16} className="text-sky-500" /> Preferensi Makanan
              </label>
              <div className="flex flex-wrap gap-2">
                {FOODS_LIST.map((f) => (
                  <button key={f.value} onClick={() => toggleString(foods, f.value, setFoods)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition border ${
                      foods.includes(f.value) ? "gradient-bg text-white border-transparent"
                        : "bg-gray-50 text-gray-600 border-gray-200 hover:border-sky-300"
                    }`}
                  >{f.label}</button>
                ))}
              </div>
            </div>

            <button onClick={handleSearch} disabled={loading}
              className="w-full py-3.5 gradient-bg text-white font-black rounded-2xl shadow-lg shadow-sky-200 flex items-center justify-center gap-2 hover:opacity-95 transition disabled:opacity-60"
            >
              {loading ? (<><Loader2 size={18} className="animate-spin" /> Menyusun itinerary...</>)
                : (<><Search size={18} /> Generate Itinerary</>)}
            </button>
          </div>
        </div>
      </section>

      {loading && (
        <section className="px-4 pb-12">
          <div className="max-w-3xl mx-auto bg-white rounded-3xl p-8 shadow-lg border border-gray-100 text-center">
            <Loader2 size={32} className="text-sky-500 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-gray-700">A* engine sedang racik itinerary...</p>
            <p className="text-xs text-gray-400 mt-1">Mengevaluasi {numDays} hari × beam-search × constraints</p>
          </div>
        </section>
      )}

      {result && !loading && (
        <div ref={resultRef}>
          <section className="px-4 pb-6">
            <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
              <div className="gradient-bg px-6 py-5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <p className="text-sky-100 text-xs font-bold mb-1">ITINERARY {result.input.numDays} HARI</p>
                    <h3 className="font-display font-black text-xl text-white">{result.input.startRegion} — vibe {result.input.vibe}</h3>
                  </div>
                  <div className="text-right text-white">
                    <p className="text-xs text-sky-100">Total estimasi</p>
                    <p className="font-display font-black text-2xl">{fmt(result.totalCost)}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 divide-x divide-gray-100 border-b border-gray-100">
                <Stat icon="📍" value={`${result.totalDistanceKm.toFixed(0)} km`} label="Total Jarak" />
                <Stat icon="⏱️" value={`${Math.round(result.totalTravelMin / 60)} jam`} label="Waktu Perjalanan" />
                <Stat icon="🏨" value={result.lodging?.name.split(" ").slice(0, 2).join(" ") ?? "-"} label="Penginapan" />
              </div>

              <div className="p-5 bg-gradient-to-br from-sky-50 to-emerald-50 border-b border-gray-100">
                <p className="text-xs font-bold text-gray-600 mb-3">RINCIAN BIAYA</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <Row label="🎟️ Tiket destinasi" value={fmt(result.costBreakdown.tickets)} />
                  <Row label="🍽️ Makan" value={fmt(result.costBreakdown.meals)} />
                  <Row label="🏨 Penginapan" value={fmt(result.costBreakdown.lodging)} />
                  <Row label="🚗 Transport" value="hitung manual" subtle />
                </div>
              </div>

              {result.warnings.length > 0 && (
                <div className="p-4 bg-amber-50 border-b border-amber-100">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-amber-800">
                      <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="p-6">
                <p className="text-xs font-bold text-sky-600 mb-3 flex items-center gap-1.5">
                  <Sparkles size={12} /> KATA AI PLANNER
                </p>
                <div className="text-sm text-gray-700 leading-relaxed space-y-2">
                  {result.narrative.split("\n").map((line, i) =>
                    line.startsWith("**") ? (
                      <p key={i} className="font-bold text-gray-900 mt-3">
                        {line.replace(/\*\*/g, "")}
                      </p>
                    ) : line.trim() === "" ? null : (
                      <p key={i}>{line}</p>
                    )
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="px-4 pb-6">
            <div className="max-w-3xl mx-auto">
              {result.days.length > 1 && (
                <div className="flex gap-2 mb-4 flex-wrap">
                  {result.days.map((d, i) => (
                    <button key={i} onClick={() => setActiveDay(i)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition border ${
                        activeDay === i ? "gradient-bg text-white border-transparent shadow-md shadow-sky-200"
                          : "bg-white text-gray-700 border-gray-200 hover:border-sky-300"
                      }`}
                    >Hari {d.dayNumber} <span className="opacity-60">• {d.cluster}</span></button>
                  ))}
                </div>
              )}

              {result.days[activeDay] && <DayTimeline day={result.days[activeDay]} />}
            </div>
          </section>

          <section className="px-4 pb-12">
            <div className="max-w-3xl mx-auto">
              <button onClick={() => setShowReasonings(!showReasonings)}
                className="w-full flex items-center justify-between bg-white hover:bg-sky-50 transition rounded-2xl px-5 py-4 border border-gray-100 shadow-sm"
              >
                <span className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <Info size={16} className="text-sky-500" /> Kenapa AI pilih destinasi ini?
                </span>
                <ChevronDown size={18} className={`text-sky-500 transition-transform ${showReasonings ? "rotate-180" : ""}`} />
              </button>
              {showReasonings && (
                <div className="mt-3 bg-white rounded-2xl border border-gray-100 p-5 space-y-2 slide-in">
                  {result.reasonings.map((r, i) => (
                    <div key={i} className="text-xs">
                      <span className="font-bold text-gray-800">{r.poiName}</span>
                      <span className="text-gray-500"> — {r.reason}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      )}

      <Footer />

      <div className="fixed bottom-4 left-4 right-4 md:hidden z-40">
        <button onClick={() => document.getElementById("planner")?.scrollIntoView({ behavior: "smooth" })}
          className="w-full py-3.5 gradient-bg text-white font-black text-sm rounded-2xl shadow-2xl shadow-sky-300 flex items-center justify-center gap-2"
        >
          <Search size={16} /> Generate Ulang
        </button>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="p-4 text-center">
      <div className="text-xl mb-1">{icon}</div>
      <div className="font-black text-sm text-gray-800 truncate">{value}</div>
      <div className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">{label}</div>
    </div>
  );
}

function Row({ label, value, subtle = false }: { label: string; value: string; subtle?: boolean }) {
  return (
    <div className="flex justify-between items-center bg-white/70 px-3 py-2 rounded-lg">
      <span className="text-gray-600">{label}</span>
      <span className={`font-bold ${subtle ? "text-gray-400 italic" : "text-gray-900"}`}>{value}</span>
    </div>
  );
}

function DayTimeline({ day }: { day: DayPlan }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-gradient-to-br from-sky-50 to-emerald-50 border-b border-gray-100">
        <div className="flex items-center justify-between gap-2">
          <h4 className="font-display font-black text-lg text-gray-900">
            Hari {day.dayNumber} — {day.cluster}
          </h4>
          <span className="text-xs font-bold text-sky-700">{fmt(day.totalCost)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">{day.summary}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">
          {day.totalDistanceKm.toFixed(1)} km · {(day.totalTravelMin / 60).toFixed(1)} jam di jalan
        </p>
      </div>

      <div className="p-5 space-y-1">
        {day.items.map((item, idx) => (
          <TimelineItem key={idx} item={item} isLast={idx === day.items.length - 1} />
        ))}
      </div>
    </div>
  );
}

function TimelineItem({ item, isLast }: { item: ScheduledItem; isLast: boolean }) {
  const isTravel = item.type === "travel";
  const isMeal = item.type === "meal";
  const isLodging = item.type === "lodging";
  const isPoi = item.type === "poi";

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center pt-1">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm shrink-0 ${
          isTravel ? "bg-gray-100" : isMeal ? "bg-amber-100" : isLodging ? "bg-purple-100" : "bg-sky-100"
        }`}>{item.icon}</div>
        {!isLast && <div className="w-px flex-1 bg-gray-100 mt-1 min-h-[20px]" />}
      </div>

      <div className={`flex-1 pb-3 ${isTravel ? "opacity-70" : ""}`}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-sky-500">{item.startTime}–{item.endTime}</span>
              {isPoi && item.poi && (
                <span className="flex items-center gap-0.5 text-[10px] text-amber-600 font-bold">
                  <Star size={10} className="fill-amber-400 stroke-amber-400" /> {item.poi.rating.toFixed(1)}
                </span>
              )}
            </div>
            <p className={`text-sm mt-0.5 ${isTravel ? "text-gray-500 italic" : "font-semibold text-gray-800"}`}>
              {item.label}
            </p>
            {isPoi && item.poi && (
              <p className="text-[11px] text-gray-500 mt-0.5">📍 {item.poi.area} — {item.poi.blurb}</p>
            )}
            {isMeal && item.restaurant && (
              <p className="text-[11px] text-gray-500 mt-0.5">
                🍴 {item.restaurant.signature} · {item.restaurant.blurb}
              </p>
            )}
            {isLodging && item.lodging && (
              <p className="text-[11px] text-gray-500 mt-0.5">{item.lodging.blurb}</p>
            )}
            {item.reason && isPoi && (
              <p className="text-[11px] text-sky-600 mt-1 italic">💡 {item.reason}</p>
            )}
            {isTravel && (
              <p className="text-[11px] text-gray-400 mt-0.5">
                {item.distanceKm?.toFixed(1)} km · {item.travelMin} min
              </p>
            )}
          </div>
          {item.cost > 0 && (
            <span className="text-xs font-bold text-emerald-600 shrink-0">{fmt(item.cost)}</span>
          )}
        </div>
      </div>
    </div>
  );
}
