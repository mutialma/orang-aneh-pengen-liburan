import { estimateTransportCost } from "./transport";

// =========================================================================
// ESTIMASI TOTAL BIAYA
// Dipakai di scoring (layer 1) supaya konsisten dengan output aktual
// =========================================================================
export function estimateTotalCost(
  item: { costPerDay: number },
  distanceKm: number,
  totalDays: number
): number {
  const hotel     = item.costPerDay * Math.max(0, totalDays - 1);
  const transport = estimateTransportCost(distanceKm);
  const food      = Math.floor((150000 + item.costPerDay * 0.05) * totalDays);
  const ticket    = Math.floor((100000 + item.costPerDay * 0.05) * totalDays);
  return hotel + transport + food + ticket;
}

// =========================================================================
// BREAKDOWN BIAYA AKTUAL (dipakai di response)
// =========================================================================
export function calcCostBreakdown(
  item: { costPerDay: number },
  transportCost: number,
  totalDays: number
): { hotelCost: number; foodCost: number; ticketCost: number } {
  return {
    hotelCost:  Math.floor(item.costPerDay * Math.max(0, totalDays - 1)),
    foodCost:   Math.floor((150000 + item.costPerDay * 0.05) * totalDays),
    ticketCost: Math.floor((100000 + item.costPerDay * 0.05) * totalDays),
  };
}