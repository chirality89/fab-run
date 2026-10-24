# Fab Run — Task Tracker

## Current: M1 — Engine core, no screen

Next: plan `src/engine/rng.js`. Settle O2, O4, O5, O6 with David in that planning step.

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
