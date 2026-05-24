// lib/utils.ts

// ── Format rupiah ──────────────────────────────────────────────────────────
export function fmt(n: number): string {
  return `Rp${Math.round(n).toLocaleString("id-ID")}`;
}

// ── Parse itinerary flat array → array per hari ───────────────────────────
// Backend kirim flat array semua aktivitas, frontend perlu dikelompokkan per hari
// Penanda ganti hari: item pertama jam 08:00 setelah hari 1
export function parseItineraryDays(items: any[]): any[][] {
  if (!items || items.length === 0) return [];

  const days: any[][] = [];
  let currentDay: any[] = [];

  items.forEach((item, idx) => {
    if (idx === 0) {
      currentDay.push(item);
      return;
    }

    // Ganti hari kalau ketemu jam 08:00 lagi (tanda mulai hari baru)
    // dan hari sebelumnya sudah punya isi
    const isNewDayMarker =
      item.time === "08:00" &&
      currentDay.length > 0 &&
      (item.activity?.includes("Sarapan") || item.activity?.includes("Berangkat") === false);

    if (isNewDayMarker) {
      days.push(currentDay);
      currentDay = [item];
    } else {
      currentDay.push(item);
    }
  });

  if (currentDay.length > 0) days.push(currentDay);

  return days;
}