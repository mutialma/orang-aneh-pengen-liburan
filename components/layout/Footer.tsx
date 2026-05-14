import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white px-4 py-12">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 gradient-bg rounded-xl flex items-center justify-center">
                <Compass size={16} className="text-white" />
              </div>
              <span className="font-display text-xl font-black">
                Ple<span className="text-sky-400">nger</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              Perencana Liburan Efisien melalui Navigasi Graph dan Evaluasi Rute.
            </p>
            <Link
              href="/login?tab=register"
              className="inline-flex items-center gap-2 gradient-bg text-white font-bold text-xs px-4 py-2.5 rounded-2xl hover:opacity-90 transition"
            >
              <ArrowRight size={12} /> Mulai Gratis
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-8 text-sm">
            {[
              { title: "Produk", links: [{ label: "Planner AI", href: "/planner" }, { label: "Destinasi", href: "/destinations" }, { label: "Tips Hemat", href: "/tips" }, { label: "Komunitas", href: "#" }] },
              { title: "Perusahaan", links: [{ label: "Tentang Kami", href: "#" }, { label: "Blog", href: "#" }, { label: "Karir", href: "#" }, { label: "Kontak", href: "#" }] },
            ].map((col) => (
              <div key={col.title}>
                <div className="font-bold text-gray-200 mb-3">{col.title}</div>
                <ul className="space-y-2">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link href={l.href} className="text-gray-400 hover:text-sky-400 transition">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-gray-500">
          <span>© 2025 LiburanPintar. Dibuat dengan ❤️ untuk traveler Indonesia.</span>
          <div className="flex gap-4">
            <Link href="#" className="hover:text-sky-400 transition">Privasi</Link>
            <Link href="#" className="hover:text-sky-400 transition">Syarat Penggunaan</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
