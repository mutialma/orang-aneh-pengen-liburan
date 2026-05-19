// ============================================================
// Itinerary Narrator
// Mengubah hasil A* planner jadi narasi bahasa Indonesia santai
// ============================================================
import { ItineraryResult, DayPlan, ScheduledItem } from "@/lib/planner-ai";

const fmtRp = (n: number) => `Rp${Math.round(n).toLocaleString("id-ID")}`;

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.abs(seed) % arr.length];
}

const OPENINGS = [
  "Oke, gue udah racik itinerary yang pas banget buat lo!",
  "Nih, gue udah susun rencana liburan yang feels right.",
  "Cus, ini dia rangkuman trip lo yang udah gue optimalkan.",
  "Beres! Itinerary lo udah jadi nih, dibikin se-natural mungkin.",
];

const VIBE_OPENERS: Record<string, string> = {
  healing: "Karena lo pilih vibe healing, gue prioritasin tempat yang tenang — alam, pantai, dan kafe estetik. Trip ini bakal soft, nggak buru-buru.",
  adventure: "Lo pilih adventure, jadi gue isi sama hiking, hidden gem, dan tempat-tempat yang bikin adrenalin naik. Siap basah-basahan dan kepanasan ya!",
  family: "Trip family — semua tempat udah gue filter yang ramah anak dan nggak bikin capek banget. Worry-free.",
  romantis: "Romantis mode on. Sunset point, view bagus, dan suasana intim udah masuk semua.",
  solo: "Solo trip yang chill. Banyak hidden gem, ritme santai, dan harga yang masih ramah dompet.",
  "kuliner-trip": "Kuliner trip! Setiap hari ada minimal 2 sesi makan di tempat terkenal area itu.",
};

const INTENSITY_NOTES: Record<string, string> = {
  santai: "Ritme dijaga santai: max 3 destinasi per hari plus istirahat panjang antar aktivitas.",
  normal: "Pace standar: 4 destinasi sehari, masih ada waktu napas dan ngopi santai.",
  padat:  "Pace padat: 5-6 spot per hari, lo bakal capek tapi puas. Pakai sepatu nyaman.",
};

/** Generate narrative paragraph utama */
export function narrate(result: ItineraryResult): string {
  if (result.days.length === 0) {
    return "Hmm, gue belum bisa nemu kombinasi destinasi yang pas dengan input lo. Coba longgarin filter, naikin budget dikit, atau ganti region — siapa tahu Bandung/Yogya/Bali/Malang/Bogor lebih cocok.";
  }

  const { input, days, totalCost, totalDistanceKm, totalTravelMin, lodging, costBreakdown } = result;
  const seed = days.length + input.numPeople + input.totalBudget;

  const intro = pick(OPENINGS, seed);
  const vibeLine = VIBE_OPENERS[input.vibe] ?? "";
  const intensityLine = INTENSITY_NOTES[input.intensity] ?? "";

  const peopleStr = input.numPeople === 1 ? "solo" : `${input.numPeople} orang`;
  const daysStr = `${input.numDays} hari`;

  const headerPara =
    `${intro} Lo bakal explore ${input.startRegion} selama ${daysStr} ` +
    `bareng ${peopleStr}, total budget ${fmtRp(input.totalBudget)}. ` +
    `${vibeLine}`;

  const pacePara = intensityLine;

  // Day-by-day storytelling
  const dayParas = days.map((day) => narrateDay(day, input.numDays));

  // Summary numbers
  const overBudget = totalCost > input.totalBudget;
  const budgetLine = overBudget
    ? `Estimasi totalnya ${fmtRp(totalCost)} — sedikit lebih ${fmtRp(totalCost - input.totalBudget)} dari budget lo. Bisa di-adjust dengan downgrade hotel atau skip 1 tiket berbayar.`
    : `Estimasi totalnya ${fmtRp(totalCost)}, masih dalam budget ${fmtRp(input.totalBudget)}. Sisa ${fmtRp(input.totalBudget - totalCost)} bisa buat oleh-oleh atau buffer kalau ada surprise expense.`;

  const distLine = `Total jarak yang ditempuh ${totalDistanceKm.toFixed(1)} km, dengan waktu perjalanan ${formatDuration(totalTravelMin)} (akumulasi seluruh hari).`;

  // Lodging note
  const lodgingNote = lodging
    ? `Buat nginep gue pilihin ${lodging.name} (${lodging.type}, rating ${lodging.rating}) di ${lodging.area}. ${lodging.blurb} ${fmtRp(lodging.pricePerNight)}/malam per kamar.`
    : input.numDays === 1
      ? "Karena cuma 1 hari, no need lodging."
      : "Lodging belum kepilih — coba naikin budget bagian penginapan.";

  // Cost breakdown
  const breakdownLine =
    `Breakdown kasar: tiket destinasi ${fmtRp(costBreakdown.tickets)}, ` +
    `makan ${fmtRp(costBreakdown.meals)}, ` +
    `penginapan ${fmtRp(costBreakdown.lodging)}, ` +
    `transport disesuaikan sendiri tergantung pilihan lo (${transportLabel(input.transport)}).`;

  // Closing
  const closing = pickClosing(input.vibe, seed);

  // Warnings
  const warningPart = result.warnings.length > 0
    ? `\n\n⚠️ Catatan:\n${result.warnings.map((w) => `- ${w}`).join("\n")}`
    : "";

  return [
    headerPara,
    pacePara,
    "",
    ...dayParas,
    "",
    distLine,
    budgetLine,
    "",
    lodgingNote,
    "",
    breakdownLine,
    "",
    closing,
  ].join("\n") + warningPart;
}

// ============================================================
// Per-day narration
// ============================================================
function narrateDay(day: DayPlan, totalDays: number): string {
  const pois = day.items.filter((i) => i.type === "poi");
  const meals = day.items.filter((i) => i.type === "meal");

  const dayLabel = totalDays > 1 ? `Hari ${day.dayNumber}` : "Hari ini";
  const clusterLine = ` di area ${day.cluster}`;

  if (pois.length === 0) {
    return `**${dayLabel}**${clusterLine}: belum ada destinasi yang berhasil di-fit. Bisa jadi karena jam operasional atau jarak kejauhan.`;
  }

  const poiNames = pois.map((p) => p.poi!.name);
  const poiNarration = describePoiSequence(poiNames);

  const mealLine = meals.length > 0
    ? ` Buat makan, mampir ke ${meals.map((m) => m.restaurant!.name).join(" dan ")} — ${meals.map((m) => m.restaurant!.signature).join(", ")}.`
    : "";

  const distLine = ` Jarak hari ini ${day.totalDistanceKm.toFixed(1)} km (${formatDuration(day.totalTravelMin)} di jalan).`;

  return `**${dayLabel}**${clusterLine}: ${poiNarration}.${mealLine}${distLine}`;
}

function describePoiSequence(names: string[]): string {
  if (names.length === 1) return `cuma ke ${names[0]}, tapi explore-nya enak nggak diburu-buru`;
  if (names.length === 2) return `mulai dari ${names[0]}, lanjut ${names[1]}`;
  const head = names.slice(0, -1).join(", ");
  const last = names[names.length - 1];
  return `urutan: ${head}, dan tutup dengan ${last}`;
}

function formatDuration(min: number): string {
  if (min < 60) return `${min} menit`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m === 0 ? `${h} jam` : `${h} jam ${m} menit`;
}

function transportLabel(t: string): string {
  const map: Record<string, string> = {
    "mobil-pribadi": "mobil pribadi",
    "motor": "motor",
    "rental-mobil": "rental mobil",
    "umum": "transportasi umum",
  };
  return map[t] ?? t;
}

function pickClosing(vibe: string, seed: number): string {
  const generic = [
    "Anyway, ini cuma rangka — kalau ada hari yang mau dipadetin atau dikurangi, tinggal bilang.",
    "Selamat liburan! Don't forget to bring sunscreen dan power bank.",
    "Trip-nya udah gue susun rapi. Tinggal book hotel & transport, sisanya enjoy ride.",
  ];
  const vibeSpecific: Record<string, string[]> = {
    healing: ["Inget: tujuan healing itu istirahat, bukan ngejar konten. Slow down ya."],
    adventure: ["Pro tip: cek kondisi cuaca H-1, dan briefing safety pas hari H."],
    family: ["Bawa cemilan, mainan kecil, dan tissue basah ya. Anak-anak bakal happy."],
    romantis: ["Reserve dinner tempat fine dining H-3, sunset spot biasanya rame banget."],
    solo: ["Solo trip itu freedom maximum — jangan ragu skip itinerary kalau lagi mood lain."],
    "kuliner-trip": ["Datangin warung legendaris pas jam buka, antrian belum panjang."],
  };
  const pool = [...generic, ...(vibeSpecific[vibe] ?? [])];
  return pick(pool, seed);
}

// ============================================================
// Build the result with narrative attached
// ============================================================
export function attachNarrative(result: ItineraryResult): ItineraryResult {
  return { ...result, narrative: narrate(result) };
}
