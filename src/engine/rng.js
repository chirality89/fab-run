// rng.js — the one seeded random number generator in the game (mulberry32).
//
// It starts from a seed, so the same seed always gives the same sequence of
// numbers. Same seed + same choices = same run. Never use Math.random().
//
// Ported from FabSim2 (index.html, section "1b. RNG"). The arithmetic is the
// same. The difference: FabSim2's rand() changed a global game object. Here
// nothing is changed. Each function takes the generator's current number
// (rngState) and RETURNS the result plus the next number:
//
//   const { value, rngState } = nextRandom(state.rngState);
//
// The caller stores the new rngState in the next version of the run state.

const MAX_SEED = 2 ** 32 - 1;   // the generator's memory is one 32-bit whole number

// Returns the seed if it is a whole number from 0 to 4,294,967,295, else null.
export function normalizeSeed(n) {
  return Number.isInteger(n) && n >= 0 && n <= MAX_SEED ? n : null;
}

// One step of mulberry32. Returns a value from 0 up to (not including) 1.
// The bit-mixing lines are copied exactly from FabSim2; they scramble the
// number so that neighbouring seeds give unrelated sequences.
export function nextRandom(rngState) {
  const next = (rngState + 0x6D2B79F5) >>> 0;
  let t = next;
  t = Math.imul(t ^ (t >>> 15), t | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, rngState: next };
}

// A whole number from min to max, both ends included.
export function randomInt(rngState, min, max) {
  const step = nextRandom(rngState);
  const value = min + Math.floor(step.value * (max - min + 1));
  return { value, rngState: step.rngState };
}

// One item from a list, chosen at random.
export function pick(rngState, list) {
  const step = randomInt(rngState, 0, list.length - 1);
  return { value: list[step.value], rngState: step.rngState };
}

// A shuffled COPY of a list (Fisher–Yates: walk from the end, swapping each
// item with a random earlier-or-same one). The list passed in is not changed.
// Dealing a hand = shuffle the room-legal cards, then take the first 5.
export function shuffle(rngState, list) {
  const copy = [...list];
  let state = rngState;
  for (let i = copy.length - 1; i > 0; i--) {
    const step = randomInt(state, 0, i);
    state = step.rngState;
    [copy[i], copy[step.value]] = [copy[step.value], copy[i]];
  }
  return { value: copy, rngState: state };
}
