// events.js — which event an event side stop shows (M3 item 2e). Pure.
//
// The events themselves are data (src/content/events.js); choosing an
// option is run.js chooseEventOption. An event stop draws one event the
// lot has not seen yet this run (all three come up before any repeats),
// using its own generator: the seed mixed with a fixed constant, plus the
// corridor number. So the lot's random numbers are untouched.

import { EVENTS } from '../content/events.js';
import { LOT_TYPES } from '../content/lotTypes.js';
import { normalizeSeed, pick } from './rng.js';

// Any fixed number works; it differs from the other generators' constants.
const EVENT_SEED_MIX = 0xD3A2646C;

function eventSeed(seed, corridorIndex) {
  const mixed = (seed ^ EVENT_SEED_MIX) >>> 0;
  return normalizeSeed((mixed + corridorIndex) >>> 0);
}

// Looks up an event by id, or throws naming it.
export function findEvent(eventId) {
  const event = EVENTS.find(entry => entry.id === eventId);
  if (!event) throw new Error(`Unknown event: ${eventId}`);
  return event;
}

// Does this event still matter after corridor `corridorIndex`? Its room, or
// a room that realizes its pattern, must still be ahead on the route.
function matters(state, event, corridorIndex) {
  const stepsAhead = LOT_TYPES[state.lotTypeId].route.slice(corridorIndex + 1);
  const need = event.mattersFor;
  if (need.room) return stepsAhead.some(step => step.room === need.room);
  return stepsAhead.some(step => step.realizes.includes(need.pattern));
}

// The id of the event an event stop in corridor `corridorIndex` shows, or
// null if no event matters any more (a quiet shift).
export function drawEvent(state, corridorIndex) {
  const relevant = EVENTS.filter(event => matters(state, event, corridorIndex));
  if (relevant.length === 0) return null;
  const unseen = relevant.filter(event => !state.eventsSeen.includes(event.id));
  const pool = unseen.length > 0 ? unseen : relevant;   // all seen: start over
  return pick(eventSeed(state.seed, corridorIndex), pool).value.id;
}
