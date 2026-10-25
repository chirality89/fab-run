// events.js — which event an event side stop shows (M3 item 2e). Pure.
//
// The events themselves are data (src/content/events.js); choosing an
// option is run.js chooseEventOption. An event stop draws one event the
// lot has not seen yet this run (all three come up before any repeats),
// using its own generator: the seed mixed with a fixed constant, plus the
// corridor number. So the lot's random numbers are untouched.

import { EVENTS } from '../content/events.js';
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

// The id of the event an event stop in corridor `corridorIndex` shows.
export function drawEvent(state, corridorIndex) {
  const unseen = EVENTS.filter(event => !state.eventsSeen.includes(event.id));
  const pool = unseen.length > 0 ? unseen : EVENTS;   // all seen: start over
  return pick(eventSeed(state.seed, corridorIndex), pool).value.id;
}
