"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Compass, ArrowRight, Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

const NAV_LINKS = [
  { label: "Beranda", href: "/" },
  { label: "Planner", href: "/planner" },
  { label: "Destinasi", href: "/destinations" },
  { label: "Tips Hemat", href: "/tips" },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/");
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
            <Compass size={16} className="text-white" />
          </div>
          <span className="font-display font-black text-lg text-gray-900">
            Ple<span className="gradient-text">nger</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-500">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`hover:text-sky-600 transition-colors ${
                pathname === l.href ? "text-sky-600" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Desktop right actions */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 transition rounded-2xl px-3 py-2"
              >
                <div className="w-7 h-7 gradient-bg rounded-xl flex items-center justify-center text-white text-xs font-bold">
                  {user.avatar}
                </div>
                <span className="text-sm font-semibold text-gray-700">{user.name.split(" ")[0]}</span>
              </button>
              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 fade-in">
                  <Link
                    href="/dashboard"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-sky-50 hover:text-sky-600 transition"
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition"
                  >
                    <LogOut size={15} /> Keluar
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-semibold text-gray-600 hover:text-sky-600 transition">
                Masuk
              </Link>
              <Link
                href="/login?tab=register"
                className="flex items-center gap-1.5 gradient-bg text-white text-sm font-bold px-4 py-2 rounded-2xl hover:opacity-90 transition shadow-md shadow-sky-200"
              >
                Mulai Gratis <ArrowRight size={14} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-gray-100 transition"
        >
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 space-y-1 fade-in">
          {NAV_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 px-2 rounded-xl text-sm font-semibold transition ${
                pathname === l.href
                  ? "text-sky-600 bg-sky-50"
                  : "text-gray-600 hover:text-sky-600 hover:bg-gray-50"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <div className="border-t border-gray-100 pt-3 mt-2">
            {user ? (
              <>
                <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 py-2.5 px-2 text-sm font-semibold text-gray-700">
                  <LayoutDashboard size={15} /> Dashboard
                </Link>
                <button onClick={() => { handleLogout(); setMenuOpen(false); }} className="flex items-center gap-2 py-2.5 px-2 text-sm font-semibold text-red-500">
                  <LogOut size={15} /> Keluar
                </button>
              </>
            ) : (
              <div className="flex gap-3">
                <Link href="/login" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-gray-100">
                  Masuk
                </Link>
                <Link href="/login?tab=register" onClick={() => setMenuOpen(false)} className="flex-1 text-center py-2.5 rounded-xl text-sm font-bold text-white gradient-bg">
                  Daftar
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
