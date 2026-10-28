# Fab Run — Task Tracker

Finished plans (M0 to M4.5 item 4) are in `docs/archive/todo-done.md`. The current plan is `tasks/plan-winnable.md`. Test comments that say "hand check in tasks/todo.md" point there.

## Current work

### Task: M4.5 "A real decision in every room" (issue 3), plan approved 28 Oct 2026
Most of it was already built on `claude/winnable-p0-p1` (P1 bots, P2 starter practices and skipped rooms); this session brings that in and closes the gaps.
- [x] 1. Fast-forward this branch to `claude/winnable-p0-p1`; plan copied here
- [x] 2. Check: `npm test` 278 pass, `npm run screens` 78 pass (plating and etch phone shots look right), `exit-check` 100 seeds all PASS, no `Math.random`
- [x] 3. Fair smart bot: side-stop kinds and PM choices are scored on 4 imagined runs with made-up dice (`tools/smartBot.js` `IMAGINED_SEEDS`), so it no longer sees a stop's contents or a PM's roll before choosing. (Correction to the plan: drift was not a leak; wear is a fixed amount per lot and scatter is off in the make-believe runs.)
- [x] 4. exit-check target added (`minStarterSpreadPoints: 10`). **It fails: 8.5 points** (seeds 1–100). Waiting for David's choice of lever; nothing tuned.
- [x] 5. Test in `tests/skip.test.js`: with the starter deck, every Cu-line room deals a playable practice except metrology (`ROOMS_THAT_RUN_THEMSELVES`). Checked it fails if CMP's card is taken out.
- [ ] 6. David's calls on `doseTrimSpc`, `chamberPurge` (particles ×1.1), `waferPrewet`; then `physics-reviewer`
- [ ] 7. playtester, code-explainer, lesson, tick ROADMAP, 3-bullet summary; ask about a PR (check together with PR #26 first)

**Decisions settled:** none open for this item (Q2 "both", 26 Oct).
**David, 28 Oct 2026:** (1) first-run gap: try A first (starter cards with a visible downside). (2) `doseTrimSpc` stays as a placeholder. (3) `chamberPurge` particles ×1.1 is fair. (5) exit-check targets approved. (6) slow bots on fewer seeds (done: casual and smart 1–5 per deck, the beats-idle checks on 10 seeds; `npm test` about 40 s). (4) `waferPrewet` bubble-void cause: not answered, left for later.

**Acceptance criteria:**
- `npm test`, `npm run screens` pass; bots have no NaN/Infinity
- `exit-check --seeds 100` all PASS, or David has options
- Smart (no peeking, starter deck) beats idle by over 10 points, or David has decided what to change
- A test proves every process room has a decision or runs itself

**Progress notes:**
- 28 Oct 2026, card values (seeds 1–60, starter deck, walking straight on, yield points gained by playing the card, by whether the room's SPC chart flags a rule): chamberPurge flagged median +0.47 / quiet −0.01; extraDiRinse +0.56 / +0.11; doseTrimSpc +0.65 / +0.28; padBreakIn +0.63 / +0.38; timedOveretch +1.30 / +0.63; waferPrewet +0.96 / +0.70. A flagged chart roughly doubles a card's worth, but only chamberPurge and extraDiRinse can lose. The others never do, because one card per room means their minutes are free.
- 28 Oct 2026, step 4 finding (seeds 1–30, starter deck): the smart bot plays `extraDiRinse`, `doseTrimSpc`, `timedOveretch`, `waferPrewet` and `padBreakIn` in **30 of 30** lots, and `chamberPurge` in 1 of 30. It never buys from the shop and takes a PM at almost every corridor. So with the starter deck, 5 of the 6 cards are "always play" (no real decision), and `chamberPurge` is almost never worth it. Points still lost with smart play: particles 6.0, depth variation 5.0, dishing 4.0, void 3.6, underlayer attack 2.9, Q-time 2.3, CD error 2.0.
- 28 Oct 2026, step 3: the old bot changed its stop choice in 17 of 240 corridors (seeds 1–30) when only the hidden dice changed; the fair bot in 0 of 240. The new test fails on the old bot and passes on the new one. Peeking was worth almost nothing: exit-check 100 seeds, smart/starter 69.6 → 69.5 (49 ship both), casual 68.2 → 67.7 (20 → 19), smart/full 82.4 (100). Cost: `npm test` went from about 15 s to about 78 s.
- 28 Oct 2026, step 2: exit-check 100 seeds (before step 3): starter idle 61.1 (0 ship), random 61.5 (3), casual 68.2 (20), smart 69.6 (49); full smart 82.4 (100).
- 28 Oct 2026: before this session, exit-check on seeds 1–40: starter idle 61.1, random 60.2, casual 67.9, smart 69.6 (22/40 ship); full smart 82.6 (40/40).

**Result:**

P0 and P1 of `tasks/plan-winnable.md` (branch `claude/winnable-p0-p1`):

- [x] P0: check the lane work is on `main`, tick the roadmap box, archive the finished sections of this file
- [x] P1: `smart` and `casual` bot policies (`tools/smartBot.js`, wired into `tools/bot.js`), and `npm run exit-check` (`tools/exit-check.js`), with tests in `tests/bot.test.js`

### P4 diagnosis explains itself (28 Oct 2026)

- [x] Wrong choices now come only from causes that could have been there: the pattern is on the route and the mode's `when` holds (`notebook.js`). The old fallback to off-route modes is gone.
- [x] Each step now records `lostAfter` (yield lost per pattern so far). `stepsThatLost()` turns that into "which step cost how many points". Saves replay actions, so no save bump.
- [x] After a guess, right or wrong, the Diagnose panel adds a line: where the yield went, and how to spot that failure mode (its signature).
- [ ] Still open: signatures that can be read from the screen (keyhole void, dishing, underlayer attack) need `content-drafter` and `physics-reviewer`; the wafer map and cross-section may need hints. Not started.

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

### P3 applied (28 Oct 2026)

David approved the recomputed test values. Applied: all base risks in `lotTypes.js` × 0.7 (`tasks/p3-test-changes.md`, `tasks/p3-risk70.patch`); 27 hand-computed tests recomputed from an independent Python model (it reproduced every old value first). Extra values checked the same way while editing: shop endpoint-detector yield 0.798418 → 0.854045 and 0.779789 → 0.839977 (the same 0.779789 → 0.839977 and 0.789992 → 0.847656 in the etch result test). The T-top test now adds 0.02 CD-error risk at the start so CD error still costs 3 points.

`npm run exit-check -- --seeds 100`: all six targets pass (idle 0%, random 3%, casual 20%, smart with starter deck 49%, smart with every card 100%, 21.4 points over idle).

Open for David: the exit-check targets are proposals (see `tools/exit-check.js`); P4 (diagnosis explains itself) and P5 (simulated and real playtests) are next.
