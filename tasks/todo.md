# Fab Run — Task Tracker

## Current: M1 item 2 — lot state and yield math (`src/engine/lot.js`)

**Status: built, awaiting physics review.**

**David's answers (24 Oct 2026):** risk is carried by the lot and realized in a named room; Poisson loss e^(−r × weight); 5×5 map and shape table as proposed; seeded scatter from the start.

### What it is, in plain words
The lot is the health bar. This file holds what the lot looks like (25 sites, the risks it carries) and the one rule that turns risk into lost yield. It doesn't play cards (that's `resolve.js`, item 3) or know the route (that's `lotTypes.js`, item 5); it gives them the tools.

### Model (confirmed by David)
1. **Risk is carried by the lot and bites in a named room.** The lot has a risk number per defect pattern. Cards scale it (via `resolve.js`) in any room; the room where that pattern shows up *realizes* it: turns it into yield loss, then sets it back to 0. Example: dummy fill in litho scales `dishing`; CMP realizes `dishing`. Which room realizes which pattern, and the starting risks, come from `lotTypes.js` (item 5).
2. **Risk = expected killer defects per die (Poisson, Y = e^(−D·A)).** Realizing risk *r* at a site multiplies that site's survival by e^(−r × weight). This is the textbook defect-limited yield model. It can never go below 0 and losses multiply by construction: e^(−a)·e^(−b) = e^(−(a+b)).
3. **The wafer map is a 5×5 grid in three rings:** center (1 site), inner ring (8), outer ring (16). Each site's value is the fraction of the lot's 25 wafers whose die at that position is still good. **Lot yield = the average of the 25 sites.**
4. **Each pattern has a shape**: a weight per site that averages 1, so a risk of 0.1 means the same amount of trouble whatever the shape, and only *where* it lands differs.

   | Shape | Weights (center / inner / outer) | Patterns |
   |---|---|---|
   | Even | 1 / 1 / 1 | particles, residue, cd_error, dishing, rr_drift, void, qtime_oxide, implant_damage, junction_spread, underlayer_attack |
   | Edge ring | 0 / 0 / 1.5625 | edge_ring |
   | Center-to-edge | 0 / 0.625 / 1.25 (grows with distance from center) | depth_variation |

5. **Scatter** (rule 4: randomness sets scatter, never the law). Optional: each site's weight is nudged by a seeded bell-curve number, never below 0. Even patterns get the most scatter, so particles look like random dots rather than flat shading. Spatial shapes get a little. Strength is passed in as a number (it moves to `balance.js` in item 4). Tests with hand-computed values use scatter 0.
6. **No healing.** Adding a negative risk or scaling by a negative number is refused with an error. Site survival can only go down. Rework (strip and re-expose) works by scaling a risk *before* it is realized, so it fits without breaking this.

### Functions (all return a new lot; nothing is changed in place)
- [x] `createLot()` → `{ sites: [25 × 1.0], risks: {}, flags: [] }`
- [x] `addRisk(lot, pattern, amount)`: amount ≥ 0
- [x] `scaleRisk(lot, pattern, mult)`: mult ≥ 0 (what `defectMult` will call)
- [x] `siteWeights(pattern)` → 25 weights from the shape table
- [x] `realizeRisks(lot, patterns, scatter)` → applies the losses and clears those risks
- [x] `rollScatter(rngState, patterns, strength)` → `{ value, rngState }`, the per-site nudges
- [x] `lotYield(lot)` → 0..1
- [x] Add `gauss()` to `rng.js` (ported from FabSim2, returning `{ value, rngState }` like the rest)
- Unknown pattern names throw an error that names the pattern.

### Hand-computed test values (David: please check these)
| Case | Expected |
|---|---|
| New lot | yield 1.000000 |
| Realize particles 0.1 (even) | every site e^(−0.1) = 0.904837; yield 0.904837 |
| …then edge_ring 0.16 | outer sites ×e^(−0.25) = 0.778801; yield 0.904837 × (9 + 16 × 0.778801)/25 = **0.776742** |
| particles 0.1 in two rooms | 0.818731, same as 0.2 in one room (losses multiply) |
| depth_variation 0.08 | center 1, inner 0.951229, outer 0.904837; yield 0.923489 |
| Scale by 0.4 then realize 0.1 | same as realizing 0.04 |
| Realize twice in a row | second time changes nothing (risk was cleared) |
| addRisk −0.1, scaleRisk −1 | error |
| Seeded scatter | same seed → same map; sites differ from each other; no NaN; all sites 0..1 |

Note: with a shaped pattern, the lot loses a bit *less* than e^(−r) (0.858 vs 0.852 for edge ring 0.16), because the already-dead edge sites can't die twice. That's the real behavior of clustered defects, not a bug.

### Acceptance criteria
- `npm test` passes, with a new `tests/lot.test.js` containing the values above once David confirms them.
- `lot.js` is pure (no DOM, no `Math.random`), under ~150 lines, and readable.
- A `physics-reviewer` pass on the yield model before calling it done.

---

## Done: M1 item 1 — the seeded generator (`src/engine/rng.js`)

**Status: done 24 Oct 2026.** David OK'd the plan. `npm test`: 16/16 pass (7 content + 9 rng).

### What it is, in plain words
Every random thing in the game (which cards you draw, scatter, which tool drifts) comes from one generator. It starts from a number (the **seed**) and produces the same sequence of numbers every time. Same seed + same choices = same run, which is what lets us replay bugs and let a bot test runs.

### Source
FabSim2 `index.html`, section "1b. RNG" (`rand()`, mulberry32). The arithmetic is copied exactly; only the packaging changes.

### The one change from FabSim2 (and why)
In FabSim2, `rand()` quietly changes a global game object `s`. Fab Run's engine must not do that (CLAUDE.md §4: functions take a state and return a new one). So each function here takes the generator's current number and **returns** the random result plus the next number, changing nothing:

```js
const { value, rngState } = nextRandom(state.rngState);   // value is 0 ≤ value < 1
```

### What goes in `src/engine/rng.js` (about 60 lines, comments included)
- [x] `normalizeSeed(n)`: checks a seed is a whole number from 0 to 4,294,967,295; returns it or `null`. (Reading `?seed=` from the address bar and picking a clock seed are browser jobs, so they wait for `src/ui/` in M2.)
- [x] `nextRandom(rngState)` → `{ value, rngState }`: the mulberry32 step, copied from FabSim2.
- [x] `randomInt(rngState, min, max)` → `{ value, rngState }`: a whole number from min to max, both included.
- [x] `pick(rngState, list)` → `{ value, rngState }`: one item from a list.
- [x] `shuffle(rngState, list)` → `{ value, rngState }`: a shuffled **copy** of a list (Fisher–Yates). This is what deals the 5-card hand (O6). The original list is left alone.
- Not yet: `gauss()` (bell-curve scatter). FabSim2 has one; we'll port it with `lot.js` (M1 item 2), when scatter is first needed.

The seed and `rngState` will live in the run state (`state.seed`, `state.rngState`) once `run.js` exists. This step only builds the generator.

### Tests: `tests/rng.test.js` (run by `npm test`)
- [x] **Faithful port:** seed 123456 gives 0.38233304349705577, 0.7972629074938595, 0.9965302373748273, and seed 0 gives 0.26642920868471265 first. These are FabSim2's own outputs, computed by running FabSim2's `rand()` as it is.
- [x] **Same seed, same sequence:** two runs of 1,000 numbers from one seed match; a different seed gives a different sequence.
- [x] **Range:** 10,000 values all satisfy 0 ≤ value < 1, none are `NaN`.
- [x] **Nothing changes behind your back:** calling a function twice with the same `rngState` gives the same answer; `shuffle` doesn't change the list it was given.
- [x] `randomInt` stays within min..max and hits both ends; `pick` always returns an item from the list; `shuffle` returns the same items in a different order.
- [x] `normalizeSeed` accepts 0 and 4294967295, rejects -1, 1.5, 2**32 and `'abc'`.
- [x] Repo check: no `Math.random` anywhere in `src/`.

### Acceptance criteria
- `npm test` passes (old content tests + new rng tests). No new dependencies.
- `rng.js` has no DOM, no `window`, no `Math.random`, and runs in Node.
- ROADMAP M1 item 1 ticked; David gets a 3-bullet summary.

### Open question for David
- None that blocks this. One heads-up: FabSim2's clock seed (`Date.now() % 1000000`) comes back in M2 with the UI.

---

## Done: M0 — Move in

### Task: confirm the kit works and settle the M1 decisions
- [x] GitHub Pages on; placeholder loads on desktop and phone
- [x] `npm test` passes
- [x] Decide D7, O2, O4, O5, O6 with David; move them to Settled in `docs/decisions.md` (O8 settled too)

**Progress notes:**
- 23 Oct 2026: `npm test` 7/7 pass. Served locally (`python3 -m http.server 8000`) and loaded in headless Chromium at 1280×800 and 375×812: 9 room tiles, counts 10/5/4/4/9, no console errors or warnings, no horizontal scroll at 375 px.
- 23 Oct 2026: David settled D7 = B (plain ES modules), O2 = A (time per room; cash for procurement only), O4 as proposed, O5 = A (inlaid Cu line), O6 = A (hand of 5), O8 = keep "Fab Run". CLAUDE.md §4 already matches D7, so no change there.
- 23 Oct 2026: David confirmed the live page at https://chirality89.github.io/fab-run/ looks right. M0 complete.

**Acceptance criteria:**
- The live page shows the title, the room key and the content counts, with no console errors
- `docs/decisions.md` has no open decision that blocks M1

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
