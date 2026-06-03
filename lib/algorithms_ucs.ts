import { NodePOI } from "./Registry";
import { haversineKm } from "./Algorithms";


interface UCSState {
  location:          NodePOI;
  time:              number;       
  visited:           Set<string>;
  budgetUsed:        number;
  cumulativeCost:    number;       
  path:              NodePOI[];    
}


function passesConstraintsUCS(
  poi:                  NodePOI,
  state:                UCSState,
  withFamily:           boolean,
  distanceFromLastKm:   number,
  dailyDistanceSoFar:   number
): boolean {
  const hour = Math.floor(state.time / 60);
  if (hour < (poi.openHour  ?? 8))  return false; 
  if (hour > (poi.closeHour ?? 21)) return false; 
  if (dailyDistanceSoFar + distanceFromLastKm > 50) return false; 
  if (withFamily && !poi.familyFriendly)            return false; 
  if (state.visited.has(poi.id))                    return false; 
  return true;
}


export interface UCSResult {
  route:             NodePOI[];
  totalCost:         number;
  nodesExplored:     number;       
  executionTimeMs:   number;      
}

export function ucsSearchDay(
  startPOI:      NodePOI,
  candidates:    NodePOI[],
  dailyBudget:   number,
  withFamily:    boolean,
  maxActivities: number
): UCSResult {
  const startTime = performance.now();
  let nodesExplored = 0;

 

  let frontier: UCSState[] = [{
    location:       startPOI,
    time:           8 * 60,      
    visited:        new Set([startPOI.id]),
    budgetUsed:     0,
    cumulativeCost: 0,          
    path:           [],
  }];

  let bestState: UCSState | null = null;
  let dailyDistanceSoFar = 0;

  
  for (let step = 0; step < maxActivities; step++) {
    if (frontier.length === 0) break;

    
    frontier.sort((a, b) => a.cumulativeCost - b.cumulativeCost);

    const current = frontier[0];
    frontier = frontier.slice(1); 

    const nextStates: UCSState[] = [];

    for (const poi of candidates) {
      nodesExplored++;

      const distKm = haversineKm(current.location, poi);
      if (!passesConstraintsUCS(poi, current, withFamily, distKm, dailyDistanceSoFar)) continue;

      const travelMinutes = (distKm / 40) * 60;
      const newTime       = current.time + travelMinutes + 90;
      const newBudget     = current.budgetUsed + poi.cost;

      if (newBudget > dailyBudget) continue;

    
      const newCumulativeCost = current.cumulativeCost + poi.cost;

      nextStates.push({
        location:       poi,
        time:           newTime,
        visited:        new Set([...current.visited, poi.id]),
        budgetUsed:     newBudget,
        cumulativeCost: newCumulativeCost,
        path:           [...current.path, poi],
      });
    }

    if (nextStates.length === 0) break;

    
    nextStates.sort((a, b) => a.cumulativeCost - b.cumulativeCost);
    bestState = nextStates[0];

    dailyDistanceSoFar += haversineKm(
      current.path.length > 0
        ? current.path[current.path.length - 1]
        : startPOI,
      bestState.location
    );

    
    frontier.push(...nextStates);
  }

  const executionTimeMs = performance.now() - startTime;

  return {
    route:           bestState?.path ?? [],
    totalCost:       bestState?.budgetUsed ?? 0,
    nodesExplored,
    executionTimeMs,
  };
}