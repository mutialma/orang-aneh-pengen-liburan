"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin, Wallet, Compass, Star, ArrowRight, Sparkles,
  LayoutDashboard, TrendingUp, Heart, Calendar, LogOut,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { destinations } from "@/data/destinations";
import { fmt } from "@/lib/utils";
import { Badge, Stars } from "@/components/ui/cards";

const SAVED_TRIPS = destinations.slice(0, 3);

const STATS = [
  { icon: <MapPin size={20} />, label: "Destinasi Dijelajahi", value: "3", color: "text-sky-600 bg-sky-50" },
  { icon: <Wallet size={20} />, label: "Total Budget Dihemat", value: "Rp1,2jt", color: "text-emerald-600 bg-emerald-50" },
  { icon: <Star size={20} />, label: "Rencana Tersimpan", value: "5", color: "text-amber-600 bg-amber-50" },
  { icon: <Heart size={20} />, label: "Destinasi Favorit", value: "2", color: "text-rose-600 bg-rose-50" },
];

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Welcome */}
        <div className="mb-8 slide-in">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Selamat datang kembali 👋</p>
              <h1 className="font-display text-3xl font-black text-gray-900">
                Halo, <span className="gradient-text">{user.name.split(" ")[0]}!</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">Siap merencanakan petualangan berikutnya?</p>
            </div>
            <Link
              href="/planner"
              className="flex items-center gap-2 gradient-bg text-white font-bold px-5 py-3 rounded-2xl hover:opacity-90 transition shadow-md shadow-sky-200"
            >
              <Sparkles size={16} /> Buat Rencana Baru
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {STATS.map((s, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm slide-in"
              style={{ animationDelay: `${i * 0.07}s` }}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
                {s.icon}
              </div>
              <div className="font-black text-xl text-gray-900">{s.value}</div>
              <div className="text-xs text-gray-400 font-medium leading-snug mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Saved trips */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-black text-lg text-gray-900">Rencana Tersimpan</h2>
              <Link href="/planner" className="text-xs text-sky-600 font-semibold hover:underline">
                Lihat semua →
              </Link>
            </div>
            <div className="space-y-3">
              {SAVED_TRIPS.map((dest, i) => (
                <div
                  key={dest.id}
                  className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition slide-in"
                  style={{ animationDelay: `${0.2 + i * 0.07}s` }}
                >
                  <div className="text-3xl w-12 h-12 bg-sky-50 rounded-xl flex items-center justify-center shrink-0">
                    {dest.image}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-gray-900 truncate">{dest.name}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{dest.city} · {dest.distanceLabel}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      {dest.badges.slice(0, 2).map((b) => <Badge key={b} label={b} />)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-black text-sky-600 text-sm">
                      {fmt(dest.estimatedCost["2D1N"] || Object.values(dest.estimatedCost)[0])}
                    </div>
                    <div className="text-xs text-gray-400">2D1N</div>
                    <Stars rating={dest.rating} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div>
            <h2 className="font-display font-black text-lg text-gray-900 mb-4">Aksi Cepat</h2>
            <div className="space-y-3">
              {[
                { icon: <Compass size={18} />, label: "Planner AI", desc: "Temukan destinasi baru", href: "/planner", color: "bg-sky-50 text-sky-600" },
                { icon: <MapPin size={18} />, label: "Semua Destinasi", desc: "Jelajahi pilihan wisata", href: "/destinations", color: "bg-emerald-50 text-emerald-600" },
                { icon: <TrendingUp size={18} />, label: "Tips Hemat", desc: "Cara liburan irit", href: "/tips", color: "bg-amber-50 text-amber-600" },
                { icon: <Calendar size={18} />, label: "Itinerary", desc: "Rencanamu yang tersimpan", href: "#", color: "bg-purple-50 text-purple-600" },
              ].map((a) => (
                <Link
                  key={a.label}
                  href={a.href}
                  className="flex items-center gap-3 bg-white rounded-2xl p-3.5 border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${a.color}`}>
                    {a.icon}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-sm text-gray-800">{a.label}</div>
                    <div className="text-xs text-gray-400">{a.desc}</div>
                  </div>
                  <ArrowRight size={15} className="text-gray-300" />
                </Link>
              ))}
            </div>

            {/* Profile card */}
            <div className="mt-4 bg-gradient-to-br from-sky-500 to-cyan-400 rounded-2xl p-4 text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-black text-lg">
                  {user.avatar}
                </div>
                <div>
                  <div className="font-bold text-sm">{user.name}</div>
                  <div className="text-sky-100 text-xs">{user.email}</div>
                </div>
              </div>
              <button
                onClick={() => { logout(); router.push("/"); }}
                className="w-full flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 transition rounded-xl py-2 text-sm font-semibold"
              >
                <LogOut size={14} /> Keluar
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
