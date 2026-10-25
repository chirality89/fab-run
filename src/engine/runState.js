// runState.js — small helpers shared by the engine files that change a run.
//
// They live here, not in run.js, so that run.js and sideStops.js can both
// use them without importing each other in a circle.

import { MATERIALS } from '../content/content.js';

// Looks up a content item by id, or throws naming it.
export function findItem(list, id, kind) {
  const item = list.find(entry => entry.id === id);
  if (!item) throw new Error(`Unknown ${kind}: ${id}`);
  return item;
}

// A material as it sits in a slot (the shape resolve.js expects). The decay
// factor starts at 1 and only grows with decayPerUse.
export function slotEntry(materialId) {
  const material = findItem(MATERIALS, materialId, 'material');
  return { id: material.id, shelfLife: material.shelfLife ?? null, decay: 1 };
}

// Adds one line to the run's log.
export function addLog(state, line) {
  return { ...state, log: [...state.log, line] };
}

// Every engine call on a finished run is a bug in the caller.
export function checkRunning(state, caller) {
  if (state.status !== 'running') throw new Error(`${caller}: the run is over (${state.status})`);
}
