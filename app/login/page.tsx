"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Compass, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { useAuth } from "@/lib/auth-context";

function LoginPageInner() {
  const { user, login, register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"login" | "register">(
    searchParams.get("tab") === "register" ? "register" : "login"
  );

  // Form state
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (tab === "login") {
      const ok = await login(email, password);
      if (ok) {
        setSuccess("Berhasil masuk! Mengalihkan...");
        setTimeout(() => router.push("/dashboard"), 800);
      } else {
        setError("Email atau password salah. Coba: andi@demo.com / demo123");
      }
    } else {
      if (!name.trim()) { setError("Nama wajib diisi."); setLoading(false); return; }
      await register(name, email, password);
      setSuccess("Akun berhasil dibuat! Mengalihkan...");
      setTimeout(() => router.push("/dashboard"), 800);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-emerald-50 flex flex-col">
      {/* Back */}
      <div className="p-4">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-sky-600 transition font-semibold">
          <ArrowLeft size={16} /> Kembali ke Beranda
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
            {/* Header */}
            <div className="gradient-bg p-8 text-center">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Compass size={28} className="text-white" />
              </div>
              <h1 className="font-display font-black text-2xl text-white mb-1">
                LiburanPintar
              </h1>
              <p className="text-sky-100 text-sm">AI Travel Planner Indonesia</p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100">
              {(["login", "register"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(""); setSuccess(""); }}
                  className={`flex-1 py-3.5 text-sm font-bold transition ${
                    tab === t
                      ? "text-sky-600 border-b-2 border-sky-500"
                      : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t === "login" ? "Masuk" : "Daftar Gratis"}
                </button>
              ))}
            </div>

            {/* Form */}
            <div className="p-8">
              {/* Demo hint */}
              {tab === "login" && (
                <div className="bg-sky-50 border border-sky-200 rounded-2xl p-3 mb-5 text-xs text-sky-700">
                  <span className="font-bold">Demo:</span> andi@demo.com / demo123
                </div>
              )}

              {error && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-3 mb-5 text-sm">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" />
                  {error}
                </div>
              )}

              {success && (
                <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl p-3 mb-5 text-sm">
                  <CheckCircle size={16} className="mt-0.5 shrink-0" />
                  {success}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {tab === "register" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                      Nama Lengkap
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Andi Traveler"
                      required
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="kamu@email.com"
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-100 text-sm transition pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPass ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full gradient-bg text-white font-bold py-3.5 rounded-2xl hover:opacity-90 transition disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
                >
                  {loading ? (
                    <><Loader2 size={18} className="animate-spin" /> Memproses...</>
                  ) : tab === "login" ? (
                    "Masuk Sekarang"
                  ) : (
                    "Buat Akun Gratis"
                  )}
                </button>
              </form>

              {tab === "login" && (
                <p className="text-center text-xs text-gray-400 mt-4">
                  Belum punya akun?{" "}
                  <button
                    onClick={() => setTab("register")}
                    className="text-sky-600 font-semibold hover:underline"
                  >
                    Daftar gratis
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginPageInner />
    </Suspense>
  );
}
