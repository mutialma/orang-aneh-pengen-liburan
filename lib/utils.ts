import { Destination } from "@/data/destinations";

export const fmt = (n: number) => `Rp${Number(n).toLocaleString("id-ID")}`;

export function filterDestinations(
  budget: number,
  preferences: string[],
  duration: string
) {
  let filtered = [...(require("@/data/destinations").destinations as Destination[])];

  if (budget < 500000) filtered = filtered.filter((d) => d.budgetCategory.includes("hemat"));
  else if (budget < 1500000)
    filtered = filtered.filter(
      (d) => d.budgetCategory.includes("hemat") || d.budgetCategory.includes("standar")
    );
  else
    filtered = filtered.filter(
      (d) => d.budgetCategory.includes("standar") || d.budgetCategory.includes("premium")
    );

  if (preferences.length > 0) {
    filtered = filtered.filter((d) => preferences.some((p) => d.tags.includes(p)));
  }

  filtered.sort((a, b) => {
    const aMatch = preferences.filter((p) => a.tags.includes(p)).length;
    const bMatch = preferences.filter((p) => b.tags.includes(p)).length;
    return bMatch - aMatch;
  });

  const durationKey =
    duration === "1 Hari" ? "1 Hari" : duration === "3D2N" ? "3D2N" : "2D1N";

  const main = filtered[0] || (require("@/data/destinations").destinations as Destination[])[0];
  const cheaper = (require("@/data/destinations").destinations as Destination[]).filter((d) => {
    const cost = d.estimatedCost[durationKey] || d.estimatedCost["2D1N"] || 0;
    const mainCost = main.estimatedCost[durationKey] || main.estimatedCost["2D1N"] || 0;
    return d.id !== main.id && cost < mainCost;
  }).slice(0, 3);
  const pricier = (require("@/data/destinations").destinations as Destination[]).filter((d) => {
    const cost = d.estimatedCost[durationKey] || d.estimatedCost["2D1N"] || 0;
    const mainCost = main.estimatedCost[durationKey] || main.estimatedCost["2D1N"] || 0;
    return d.id !== main.id && cost > mainCost;
  }).slice(0, 3);

  return { main, alternatives: filtered.slice(1, 4), cheaper, pricier, durationKey };
}

export function parseItineraryDays(items: Destination["itinerary"][string]) {
  const days: typeof items[] = [];
  let day: typeof items = [];
  items.forEach((item, i) => {
    if (i > 0 && day.length > 0) {
      const prevHour = parseInt(items[i - 1].time.split(":")[0]);
      const currHour = parseInt(item.time.split(":")[0]);
      if (currHour < prevHour - 2 && day.length >= 2) {
        days.push(day);
        day = [];
      }
    }
    day.push(item);
  });
  if (day.length > 0) days.push(day);
  return days;
}
