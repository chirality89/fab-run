# Fab Run — Task Tracker

## Current: M1 — Engine core, no screen

### Task: `src/engine/rng.js`, the one seeded random number generator
- [ ] Write `src/engine/rng.js` with mulberry32 and four small functions:
  - `makeRng(seed)` turns a seed number into a starting generator state: `{ seed, state }` (the original seed, kept for display, and the one number mulberry32 steps forward). Any whole number works; it is folded into the 0 to 4,294,967,295 range.
  - `nextRandom(rng)` returns `{ value, rng }`: a number from 0 up to (not including) 1, plus the *new* generator state. It never changes the old state, so the run state stays one plain object that can be saved and replayed.
  - `randomInt(rng, min, max)` returns a whole number from min to max, both ends included (for "which card", "how much scatter").
  - `shuffle(rng, list)` returns a shuffled copy of a list (Fisher–Yates), for deck draws later.
- [ ] Write `tests/rng.test.js`:
  - Same seed gives the same sequence; a different seed gives a different one.
  - The first values for seed 123456 match numbers worked out separately (a Python copy of mulberry32, written out in the test as fixed numbers).
  - Values always fall in [0, 1); `randomInt` stays inside its range and hits both ends; `shuffle` keeps every item and leaves the original list alone.
  - Calling `nextRandom` twice on the same state gives the same value (proof that nothing is changed in place).
  - No `Math.random` anywhere in `src/` (a test reads the files and checks).
- [ ] `npm test` passes; commit.

**Decisions settled:** O2 → S14, O4 → S15, O5 → S16, O6 → S17 (Oct 25, 2026). None of them changes this item; they shape `lot.js`, `run.js` and `balance.js` later.

**Question for David:** I can't see FabSim2 from here. I'll use the standard published mulberry32 (constant `0x6D2B79F5`). If FabSim2's copy differs, paste it and I'll match it.

**Acceptance criteria:**
- `npm test` shows the new rng tests passing alongside the 7 content tests
- The same seed always gives the same numbers, in Node, with nothing installed

**Progress notes:**
- 2026-10-25: O2, O4, O5, O6 settled with David.

**Result:**

## Done

### Task: M0 — Move in
- [x] GitHub Pages on; placeholder loads on desktop and phone (checked by David)
- [x] `npm test` passes (7 of 7)
- [x] Settle D7 and O8; confirm CLAUDE.md §4

**Decisions settled:** D7 → S12 (plain ES modules), O8 → S13 ("Fab Run")

**Acceptance criteria:**
- The live page shows the title, the room key and the content counts, with no console errors
- `docs/decisions.md` has no open M0 decision

**Progress notes:**
- 2026-10-24: Pages confirmed by David. O2, O4, O5, O6 moved to M1 planning, where CLAUDE.md says they belong.

**Result:** M0 ticked in ROADMAP.md; no code changed.

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
