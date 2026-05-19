// lib/haversine.ts

export interface LocationNode {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

/**
 * Menghitung jarak antara dua koordinat menggunakan formula Haversine.
 * Ini bertindak sebagai fungsi h(n) atau g(n) dalam A*.
 */
export function haversineDistance(
  nodeA: LocationNode,
  nodeB: LocationNode
): number {
  const R = 6371; // Radius bumi dalam kilometer
  const dLat = (nodeB.lat - nodeA.lat) * (Math.PI / 180);
  const dLon = (nodeB.lng - nodeA.lng) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(nodeA.lat * (Math.PI / 180)) *
      Math.cos(nodeB.lat * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Hasil dalam kilometer
}