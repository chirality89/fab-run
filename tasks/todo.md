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

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
- Dead cards: a practice whose target pattern was already realized earlier on the route (e.g. `etchStopLayer` at the second dep visit) should be greyed out or hidden
- Tool wear: tool health stays at 100 in run.js; no rule yet for how much a room wears its tool
- Consumables: no engine code plays them yet (the starter qual wafer and spare part, and the unlocked bath analysis, fresh resist, implant monitor and oxide monitor). They are left off the Notebook page's "Unlocks" until they can be used (David, 26 Oct 2026)
