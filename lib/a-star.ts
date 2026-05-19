// lib/a-star.ts
import { LocationNode, haversineDistance } from './haversine';

interface AStarNode {
  location: LocationNode;
  gCost: number; // Jarak aktual dari titik awal (g)
  hCost: number; // Jarak heuristik ke tujuan (h)
  fCost: number; // gCost + hCost (f)
  parent: AStarNode | null;
}

export function findOptimalRouteAStar(
  start: LocationNode,
  goal: LocationNode,
  allDestinations: LocationNode[]
): LocationNode[] {
  // Daftar node yang belum dievaluasi
  let openSet: AStarNode[] = [];
  // Daftar node yang sudah dievaluasi
  let closedSet: Set<string> = new Set();

  const startNode: AStarNode = {
    location: start,
    gCost: 0,
    hCost: haversineDistance(start, goal),
    fCost: haversineDistance(start, goal),
    parent: null,
  };

  openSet.push(startNode);

  while (openSet.length > 0) {
    // 1. Cari node dengan fCost terendah di openSet
    openSet.sort((a, b) => a.fCost - b.fCost);
    const currentNode = openSet.shift()!; // Ambil dan hapus node pertama (fCost terendah)

    // 2. Jika sudah sampai di tujuan, bangun rutenya
    if (currentNode.location.id === goal.id) {
      const path: LocationNode[] = [];
      let current: AStarNode | null = currentNode;
      while (current !== null) {
        path.unshift(current.location); // Masukkan ke awal array
        current = current.parent;
      }
      return path;
    }

    // 3. Masukkan node saat ini ke closedSet
    closedSet.add(currentNode.location.id);

    // 4. Cek semua tetangga (semua destinasi lain yang memungkinkan)
    for (const neighbor of allDestinations) {
      if (closedSet.has(neighbor.id) || neighbor.id === currentNode.location.id) {
        continue; // Lewati jika sudah dievaluasi atau node itu sendiri
      }

      // Hitung gCost baru: gCost saat ini + jarak dari node saat ini ke tetangga
      const tentativeGCost =
        currentNode.gCost + haversineDistance(currentNode.location, neighbor);

      // Cek apakah tetangga sudah ada di openSet
      let neighborNode = openSet.find((n) => n.location.id === neighbor.id);

      if (!neighborNode) {
        // Jika belum ada, buat node baru dan masukkan ke openSet
        const hCost = haversineDistance(neighbor, goal);
        neighborNode = {
          location: neighbor,
          gCost: tentativeGCost,
          hCost: hCost,
          fCost: tentativeGCost + hCost, // f(n) = g(n) + h(n)
          parent: currentNode,
        };
        openSet.push(neighborNode);
      } else if (tentativeGCost < neighborNode.gCost) {
        // Jika sudah ada TAPI rute yang baru ditemukan ini lebih cepat (gCost lebih kecil)
        // Perbarui cost dan parent-nya
        neighborNode.gCost = tentativeGCost;
        neighborNode.fCost = tentativeGCost + neighborNode.hCost;
        neighborNode.parent = currentNode;
      }
    }
  }

  // Jika openSet kosong dan tujuan tidak ditemukan
  return []; 
}