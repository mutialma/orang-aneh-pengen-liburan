import { Star } from "lucide-react";
import { Destination } from "@/data/destinations";
import { fmt } from "@/lib/utils";

// ── Badge ───────────────────────────────────────────────────────────────────
const BADGE_COLORS: Record<string, string> = {
  Dekat: "bg-emerald-100 text-emerald-700 border-emerald-200",
  Hemat: "bg-amber-100 text-amber-700 border-amber-200",
  Populer: "bg-sky-100 text-sky-700 border-sky-200",
  "Hidden Gem": "bg-purple-100 text-purple-700 border-purple-200",
  Premium: "bg-rose-100 text-rose-700 border-rose-200",
  Pantai: "bg-cyan-100 text-cyan-700 border-cyan-200",
  Alam: "bg-green-100 text-green-700 border-green-200",
  Keluarga: "bg-orange-100 text-orange-700 border-orange-200",
};

export function Badge({ label }: { label: string }) {
  return (
    <span
      className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
        BADGE_COLORS[label] ?? "bg-gray-100 text-gray-600 border-gray-200"
      }`}
    >
      {label}
    </span>
  );
}

// ── Stars ───────────────────────────────────────────────────────────────────
export function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={12}
          className={
            i <= Math.round(rating)
              ? "fill-amber-400 text-amber-400"
              : "text-gray-200 fill-gray-200"
          }
        />
      ))}
      <span className="text-xs font-semibold text-gray-600 ml-1">{rating}</span>
    </div>
  );
}

// ── SkeletonCard ─────────────────────────────────────────────────────────────
export function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl shadow-md p-6 space-y-4">
      <div className="h-6 shimmer rounded-xl w-2/3" />
      <div className="h-4 shimmer rounded-xl w-1/2" />
      <div className="h-20 shimmer rounded-2xl" />
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 shimmer rounded-xl" />
        ))}
      </div>
      <div className="h-10 shimmer rounded-2xl" />
    </div>
  );
}

// ── DestCard ─────────────────────────────────────────────────────────────────
type DestCardProps = {
  dest: Destination;
  durationKey: string;
  accent?: boolean;
};

export function DestCard({ dest, durationKey, accent = false }: DestCardProps) {
  const cost =
    dest.estimatedCost[durationKey] ||
    dest.estimatedCost["2D1N"] ||
    dest.estimatedCost["1 Hari"];

  return (
    <div
      className={`rounded-3xl p-5 border transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer ${
        accent
          ? "bg-gradient-to-br from-sky-500 to-cyan-400 text-white border-sky-400"
          : "bg-white border-gray-100 shadow-sm"
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-3xl">{dest.image}</div>
        <div className="flex gap-1 flex-wrap justify-end">
          {dest.badges.map((b) => (
            <Badge key={b} label={b} />
          ))}
        </div>
      </div>
      <h3 className={`font-bold text-base mb-0.5 ${accent ? "text-white" : "text-gray-900"}`}>
        {dest.name}
      </h3>
      <p className={`text-xs mb-3 ${accent ? "text-sky-100" : "text-gray-500"}`}>
        {dest.city}, {dest.province} · {dest.distanceLabel}
      </p>
      <div className={`text-lg font-black mb-1 ${accent ? "text-white" : "text-sky-600"}`}>
        {fmt(cost)}
      </div>
      <p className={`text-xs leading-relaxed mb-4 ${accent ? "text-sky-50" : "text-gray-500"}`}>
        {dest.matchReason}
      </p>
      <Stars rating={dest.rating} />
    </div>
  );
}
