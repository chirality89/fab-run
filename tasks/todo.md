# Fab Run — Task Tracker

Finished plans (M0 to M4.5 item 4) are in `docs/archive/todo-done.md`. The current plan is `tasks/plan-winnable.md`. Test comments that say "hand check in tasks/todo.md" point there.

## Current work

P0 and P1 of `tasks/plan-winnable.md` (branch `claude/winnable-p0-p1`):

- [x] P0: check the lane work is on `main`, tick the roadmap box, archive the finished sections of this file
- [x] P1: `smart` and `casual` bot policies (`tools/smartBot.js`, wired into `tools/bot.js`), and `npm run exit-check` (`tools/exit-check.js`), with tests in `tests/bot.test.js`

### P1 result (28 Oct 2026, seeds 1 to 30)

| Deck | idle | random | casual | smart |
|---|---|---|---|---|
| starter (what a new player has) | 0 ship, mean 52.2 | 0 ship, 51.6 | 0 ship, 57.2 | 0 ship, 58.1 (best 60.5) |
| full (every card) | 0 ship, 52.3 | 5 ship, 62.8 | 16 ship, 70.5 | 30 ship, 75.9 |

- **The starter deck is the blocker.** With every card, good play ships every lot and a casual player about half. With the starter deck even perfect play tops out near 60%. This confirms P2 (starter practices in every room) is the next job, before any balance pass.
- The smart bot knows the whole route (see the top of `tools/smartBot.js`), so it is an upper bound, not a first-time player.
- Decision for David: `exit-check` targets (idle 0%, random under 15%, smart 60-80% ship, smart beats idle by over 10 points) are in `tools/exit-check.js` `TARGETS`. Change them there.
- `npm test` now takes about 10 seconds instead of 1, because the smart bots try every option on copies of the run.

### P2 status (28 Oct 2026)

- [x] 2b (committed): a room with nothing to play runs on its own; the greyed-out Strip and re-expose says what it needs. Tests in `tests/skip.test.js`.
- [x] 2a (committed 28 Oct 2026; David approved the 7 unit-test edits; `npm test` 273 pass. The `doe.test.js` checks now use a fixed 2-card deck so their hand-computed values are unchanged, plus one new test for the real starter deck's offers): five starter practices `extraDiRinse`, `chamberPurge` (now "Pump-purge cycles before the run"), `doseTrimSpc`, `waferPrewet`, `padBreakIn` (now "Condition the pad before the lot"), with art in `src/art/sections/`. The physics review's wording and art fixes are applied. Open items:
  1. **7 old tests** hold the old 2-card starter deck: `run.test.js` "createRun defaults" (deck becomes the 7 starter cards) and "strip and re-expose is never legal yet" (hand `['reworkLitho','doseTrimSpc']`, legal `['doseTrimSpc']`); `doe.test.js` offers become `['reworkLitho','chamberPurge']`, and the 4 DOE tests that upgrade `timedOveretch` need `upgraded: ['timedOveretch']` set in the test state. No hand-computed yield value changes.
  2. **`doseTrimSpc`**: its flat cd_error ×0.8 also cuts the base scatter, which teaches the opposite of its own note (physics review). Keep out of the starter deck until an effect that acts only on drift exists (NEEDS NEW LOGIC), or accept it as a placeholder? Also: ×0.8 stacks with `sendAheadWafer` ×0.5 to ×0.4.
  3. **`chamberPurge`**: is particles ×1.1 a fair side effect?
  4. **`waferPrewet`**: reworded to the mechanism the model has (late bottom-up fill). Add a separate bubble-void cause later?
  5. **Balance**: with the 5 starter cards the smart bot's best starter-deck run is 63.4% (spec 70%); mean 60.2% (was 58.1%). Options for P3: first run is a hard learning run; or move the balance levers; or both (recommended).

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state. Until then the condition never holds, so `reworkLitho` can never be played (needs a greyed-out reason message)
- A drift-only `defectMult` (or `when: { toolShifted: room }`): so `doseTrimSpc` can act only on the part of cd_error that comes from a shifted tool, not on base scatter (physics review, 28 Oct 2026)
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
- Dead cards: a practice whose target pattern was already realized earlier on the route (e.g. `etchStopLayer` at the second dep visit) should be greyed out or hidden
- Tool wear: tool health stays at 100 in run.js; no rule yet for how much a room wears its tool
- Consumables: no engine code plays them yet (the starter qual wafer and spare part, and the unlocked bath analysis, fresh resist, implant monitor and oxide monitor). They are left off the Notebook page's "Unlocks" until they can be used (David, 26 Oct 2026)

### Screen tests after P2 (28 Oct 2026): fixed, all pass

David approved the edits. The last room (metrology) now runs by itself, so specs no longer press Run there; `map.spec` checks the skipped note. The plating spec expects the starter practice `Wafer pre-wet`. The DOE spec uses seed 5, whose DOE stop offers the over-etch (seed 123456 now offers other cards). The skipped-room result screen was checked on a phone screenshot.

### P3 balance pass (David chose option 3, 28 Oct 2026: first run winnable but tight, unlocks give margin)

`tools/exit-check.js` now has these targets (numbers proposed by Claude, David to confirm): starter deck: idle 0%, random under 5%, casual under 25%, smart 40-75%; full deck: smart at least 90% and over 15 points above idle.

Measured on seeds 1 to 100 (mean yield %, share shipped at spec 70% / 62% / 60%):

| Policy / deck | mean | 70% | 62% | 60% |
|---|---|---|---|---|
| idle / starter | 52.1 | 0 | 0 | 0 |
| random / starter | 53.2 | 0 | 0 | 6 |
| casual / starter | 58.9 | 0 | 4 | 30 |
| smart / starter | 60.2 | 0 | 8 | 62 |
| casual / full | 72.3 | 71 | 97 | 100 |
| smart / full | 76.9 | 100 | 100 | 100 |

- Yield barely varies from seed to seed (about 2 points), so the ship rate flips from near 0 to near 100 across a 4-point change of spec: the outcome is decided by the build, not by luck.
- Where smart/starter still loses yield (points): particles 7.7, depth variation 6.8, dishing 5.1, void 4.6, underlayer attack 3.9. Starter cards act on one room each, so each can recover only about 1 point.
- Levers: (a) spec 70 down to about 61; (b) scale down the base risks in `lotTypes.js` by about 15% (particles 0.01, stack risks 0.08); (c) more scatter between seeds. (a) and (b) both move hand-computed tests in `view.test.js`, `run.test.js` and others; each would be recomputed by hand and shown to David first.
