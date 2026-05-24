```bash
# 1. npm install

# 2. npm run dev

# 3. Buka di browser
# http://localhost:3000
```

##  Struktur 

```
liburan-pintar/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout + AuthProvider
│   ├── globals.css             # Global styles
│   ├── page.tsx                #  Halaman Beranda
│   ├── login/
│   │   └── page.tsx            # Login & Register
│   ├── dashboard/
│   │   └── page.tsx            #  Dashboard (protected)
│   ├── planner/
│   │   └── page.tsx            # Planner AI
│   ├── destinations/
│   │   └── page.tsx            #  Browse Destinasi
│   └── tips/
│       └── page.tsx            #  Tips Hemat
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx          # Navigasi + user menu
│   │   └── Footer.tsx          # Footer
│   └── ui/
│       └── cards.tsx           # Badge, Stars, DestCard, SkeletonCard
│
├── data/
│   └── destinations.ts         # Data destinasi + tips + constants
│
└── lib/
    ├── auth-context.tsx        # Auth state (login/logout/register)
    └── utils.ts                # Helpers: fmt, filterDestinations, parseItineraryDays
```

## Fitur Login

- **Login** dengan akun demo: `andi@demo.com` / `demo123`
- **Register** membuat akun baru (in-memory, reset saat refresh)
- **Protected route**: `/dashboard` redirect ke login jika belum masuk
- User menu di navbar dengan avatar + logout

##  Fitur-Fitur

| Fitur | Route | Deskripsi |
|-------|-------|-----------|
| Beranda | `/` | Landing page + featured destinations |
| Login/Register | `/login` | Autentikasi user |
| Dashboard | `/dashboard` | Statistik + rencana tersimpan |
| Planner AI | `/planner` | Form + rekomendasi + itinerary |
| Destinasi | `/destinations` | Browse + search + filter |
| Tips Hemat | `/tips` | Tips perjalanan hemat |

## Tech Stack

- **Next.js 14** — App Router
- **TypeScript** — Type safety
- **Tailwind CSS** — Styling
- **lucide-react** — Icons
- **React Context** — Auth state management