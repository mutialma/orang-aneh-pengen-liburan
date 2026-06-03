import { NodePOI } from "./Registry";
import { haversineKm } from "./Algorithms";


interface BFSState {
  location:        NodePOI;
  time:            number;       
  visited:         Set<string>;
  budgetUsed:      number;
  path:            NodePOI[];    
  depth:           number;       
}


function passesConstraintsBFS(
  poi:                NodePOI,
  state:              BFSState,
  withFamily:         boolean,
  distanceFromLastKm: number,
  dailyDistanceSoFar: number
): boolean {
  const hour = Math.floor(state.time / 60);
  if (hour < (poi.openHour  ?? 8))                  return false; 
  if (hour > (poi.closeHour ?? 21))                 return false; 
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; 
  if (withFamily && !poi.familyFriendly)            return false; 
  if (state.visited.has(poi.id))                    return false; 
  return true;
}

export interface BFSResult {
  route:           NodePOI[];
  totalCost:       number;
  totalSteps:      number;       
  nodesExplored:   number;       
  executionTimeMs: number;       
}

export function bfsSearchDay(
  startPOI:      NodePOI,
  candidates:    NodePOI[],
  dailyBudget:   number,
  withFamily:    boolean,
  maxActivities: number
): BFSResult {
  const startTime = performance.now();
  let nodesExplored = 0;

  
  const queue: BFSState[] = [{
    location:  startPOI,
    time:      8 * 60,   
    visited:   new Set([startPOI.id]),
    budgetUsed: 0,
    path:      [],
    depth:     0,
  }];


  const completedPaths: BFSState[] = [];
  let dailyDistanceSoFar = 0;

  while (queue.length > 0) {
    
    const current = queue.shift()!;

    
    if (current.depth >= maxActivities) {
      if (current.path.length > 0) {
        completedPaths.push(current);
      }
      continue;
    }

    let hasChild = false;

    for (const poi of candidates) {
      nodesExplored++;

      const distKm = haversineKm(current.location, poi);
      if (!passesConstraintsBFS(poi, current, withFamily, distKm, dailyDistanceSoFar)) continue;

      const travelMinutes = (distKm / 40) * 60;
      const newTime       = current.time + travelMinutes + 90;
      const newBudget     = current.budgetUsed + poi.cost;

      if (newBudget > dailyBudget) continue;

      hasChild = true;

      
      queue.push({
        location:   poi,
        time:       newTime,
        visited:    new Set([...current.visited, poi.id]),
        budgetUsed: newBudget,
        path:       [...current.path, poi],
        depth:      current.depth + 1,
      });
    }

    
    if (!hasChild && current.path.length > 0) {
      completedPaths.push(current);
    }
  }

  const executionTimeMs = performance.now() - startTime;


  completedPaths.sort((a, b) => b.path.length - a.path.length || a.budgetUsed - b.budgetUsed);
  const best = completedPaths[0] ?? null;

  if (best && best.path.length > 1) {
    dailyDistanceSoFar = haversineKm(startPOI, best.path[best.path.length - 1]);
  }

  return {
    route:           best?.path ?? [],
    totalCost:       best?.budgetUsed ?? 0,
    totalSteps:      best?.depth ?? 0,
    nodesExplored,
    executionTimeMs,
  };
}