# Fab Run — Task Tracker

## Current: M1 item 1 — the seeded generator (`src/engine/rng.js`)

**Status: plan, waiting for David's OK. No code written yet.**

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
- [ ] `normalizeSeed(n)`: checks a seed is a whole number from 0 to 4,294,967,295; returns it or `null`. (Reading `?seed=` from the address bar and picking a clock seed are browser jobs, so they wait for `src/ui/` in M2.)
- [ ] `nextRandom(rngState)` → `{ value, rngState }`: the mulberry32 step, copied from FabSim2.
- [ ] `randomInt(rngState, min, max)` → `{ value, rngState }`: a whole number from min to max, both included.
- [ ] `pick(rngState, list)` → `{ value, rngState }`: one item from a list.
- [ ] `shuffle(rngState, list)` → `{ value, rngState }`: a shuffled **copy** of a list (Fisher–Yates). This is what deals the 5-card hand (O6). The original list is left alone.
- Not yet: `gauss()` (bell-curve scatter). FabSim2 has one; we'll port it with `lot.js` (M1 item 2), when scatter is first needed.

The seed and `rngState` will live in the run state (`state.seed`, `state.rngState`) once `run.js` exists. This step only builds the generator.

### Tests: `tests/rng.test.js` (run by `npm test`)
- [ ] **Faithful port:** seed 123456 gives 0.38233304349705577, 0.7972629074938595, 0.9965302373748273, and seed 0 gives 0.26642920868471265 first. These are FabSim2's own outputs, computed by running FabSim2's `rand()` as it is.
- [ ] **Same seed, same sequence:** two runs of 1,000 numbers from one seed match; a different seed gives a different sequence.
- [ ] **Range:** 10,000 values all satisfy 0 ≤ value < 1, none are `NaN`.
- [ ] **Nothing changes behind your back:** calling a function twice with the same `rngState` gives the same answer; `shuffle` doesn't change the list it was given.
- [ ] `randomInt` stays within min..max and hits both ends; `pick` always returns an item from the list; `shuffle` returns the same items in a different order.
- [ ] `normalizeSeed` accepts 0 and 4294967295, rejects -1, 1.5, 2**32 and `'abc'`.
- [ ] Repo check: no `Math.random` anywhere in `src/`.

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
