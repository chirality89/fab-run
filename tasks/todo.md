# Fab Run — Task Tracker

## Current: M2 item 3 — Playwright set up; screenshots at 1280×800 and 375×812

### Task: screen tests and screenshots with Playwright
- [ ] Add `@playwright/test` as a **dev dependency** (pre-approved in CLAUDE.md §2), pinned to exactly `1.63.0`, the version whose browser is already installed here. Commit `package-lock.json`. It is only for checking the screen. The game itself still loads nothing from npm.
- [ ] `npm test` stays as it is: Node only, no install needed. A new `npm run screens` runs the screen tests.
- [ ] `playwright.config.js` (repo root):
  - It starts `python3 -m http.server 8000` by itself.
  - It runs every test at two sizes: **desktop** 1280×800, and **phone** with an explicit 375×812, touch on. No device-preset names (lesson: a wrong preset name silently gave desktop size).
  - Chromium only.
- [ ] `tests/screens/etch.spec.js`, seed 123456, at both sizes:
  - The etch room loads with no console errors and no sideways scroll.
  - A tap on timed over-etch leaves 4 of 8 min, the hand empties, and Run etch is still there.
  - **Run etch** shows the result screen. **Replay this seed** brings back the same starting numbers (same expected-loss line as the first load).
  - A fast double tap on the card plays it once and does **not** run etch.
  - Screenshots at each stage go to `screenshots/desktop/` and `screenshots/phone/`. The test checks each image's pixel width (1280 or 375) before anyone looks at it (lesson).
- [ ] Screenshots are files for looking at, not compared pixel by pixel against saved ones. Fonts render differently from machine to machine, and that would make tests fail for no reason. `screenshots/` is already in `.gitignore`, so they aren't committed.
- [ ] CLAUDE.md §11: one line saying `npm run screens` runs the screen tests. On a new computer it needs `npm install` and `npx playwright install chromium` first.
- [ ] Run it, look at every screenshot, then run `playtester`. Commit.

No game code changes.

**Decisions settled:** none needed.

**Acceptance criteria:**
- `npm run screens` passes: 2 sizes × the checks above, and every screenshot has the right width.
- `npm test` still passes with no `node_modules` present.
- The tap and Run etch buttons are now tested automatically, not only by eye.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.

**Result:**

## Done: M2 item 2 — playing a card calls the engine and redraws

(25 Oct 2026: the M1 and M2 item 1 work below was on an unmerged branch, PR #1; it is now merged with `main`.)

### Task: tap a card to play it; "Run etch" ends the room
- [x] `src/ui/main.js` keeps the current run state in one variable. A tap on a card calls the engine's `playCard`, stores the new state, and redraws. The screen never changes the state itself.
- [x] `src/ui/render.js`: playable cards become buttons (at least 44 px, keyboard focus shows). Unplayable cards stay greyed out and do nothing. A **Run etch** button under the hand.
- [x] **Run etch** calls the engine's `resolveStep`: the room's risks bite. The screen then shows the result: yield before → after, points lost, the new wafer map, and the end status if the lot was scrapped. Two buttons: **Replay this seed** (same `?seed=`) and **New seed**.
- [x] `src/ui/view.js`: a `resultView(before, after)` that turns the two states into display data, with no DOM, so Node can test it.
- [x] `src/ui/room.css`: button styles, tokens only.
- [x] Tests in `tests/view.test.js`. Seed 123456, scatter off, idle to etch:
  - After playing timed over-etch, the time left is 4 of 8 min and the card has left the hand.
  - The expected-loss line drops from 22.9 to **19.7** points (hand-computed, below).
  - `resultView` after Run etch with nothing played shows 91.4% → **68.5%**, 22.9 points lost; after the over-etch it shows 91.4% → **71.7%**, 19.7 points lost.
- [x] Throwaway screenshots at 1280×800 and 375×812, before and after a tap and after Run etch, checked by eye. Playwright proper is M2 item 3.
- [x] `npm test` passes; `code-explainer` reviews; commit.

Only `src/ui/` changes, plus its test. No engine change.

**Hand check (etch, seed 123456, scatter off).** Before etch, every site is at e^(−0.09) = 0.913931 (particles 0.01 × 3, cd_error 0.06).
- **Idle.** Even patterns: particles 0.01 + residue 0.10 + underlayer attack 0.05 = 0.16. Edge ring 0.05 × 1.5625 = 0.078125, outer ring only. Depth variation 0.08 × [0, 0.625, 1.25].
  - Center e^(−0.25), inner e^(−0.30), outer e^(−0.428125).
  - Average 0.685321: a loss of **22.9 points**.
- **Timed over-etch.** Residue × 0.3 = 0.03, underlayer attack × 1.5 = 0.075 (no etch stop on this lot), so the even part is 0.115.
  - Center e^(−0.205), inner e^(−0.255), outer e^(−0.383125).
  - Average 0.716865: a loss of **19.7 points**.
  - The card is worth 3.2 points here: clearing residue gains more than the extra attack on the film below costs.

**Decisions (David, 25 Oct 2026):** a tap plays the card at once, with no undo. The room ends with a **Run etch** button and a result screen. No `docs/decisions.md` items involved.

**Acceptance criteria:**
- On the page, tapping timed over-etch takes 4 minutes off and lowers the expected loss to 19.7. Run etch shows the result with the wafer map; Replay gives the same numbers again.
- Works at 375 px and with the keyboard; no console errors.

**Progress notes:**
- 2026-10-25: plan written; David OK'd it and checked the hand numbers.
- 2026-10-25: built. Screenshots at 1280×800 and 375×812 (light, plus dark on the phone), before and after a tap and after Run etch: fixed "No practices left" touching the Run button, and the result screen now opens at the top on a phone. No console errors, no sideways scroll.
- 2026-10-25: code-explainer fixes: a fast double tap no longer plays the card AND runs etch (the second click is ignored); after a play, focus goes to the card now in the same place; hand keeps its list role; Run button in its own function.
- Replay this seed restarts the seed fresh, with nothing played, so you can try another choice. Same seed gives the same starting numbers (checked: 22.8 then 68.1% idle, twice).
- The taps are checked by eye only; automated screen tests come with Playwright in M2 item 3.

**Result:** etch room is playable: tap to play, Run etch, result screen with Replay and New seed. 102/102 tests pass.

## Done: M2 item 1 — the etch room on screen (`src/ui/`)

**Status: done 24 Oct 2026. 97/97 tests pass. Desktop and 375 px screenshots checked by eye (light and dark). code-explainer fixes applied: yield colour from the raw fraction, map legend built from balance.js, a clock seed is written into the URL so reload keeps the run, site band from the printed percent, etch step found by room, a scrapped-before-etch message.**

### What it is, in plain words
The first real screen. Opening the site starts a seeded run (`?seed=123456`, or a random seed shown on screen), walks the lot through the three steps before etch with nothing played, and shows the **etch room**: the hand, the time budget, the slots, tool health, the yield bar and the wafer map. This item only **draws** the room. Tapping a card to play it is the next roadmap item, and the Playwright screenshots are the one after that.

### Files
- `src/ui/view.js` turns the run state into plain display data: yield %, the 25 sites, the cards (name, minutes, cash, short text, playable or the reason it isn't), slots, tool health, time left, seed. It has no DOM, so Node can test it.
- `src/ui/render.js` turns that display data into page elements. It doesn't hold any game logic.
- `src/ui/main.js` reads `?seed=`, builds the run with `run.js`, walks it to etch, and calls render.
- `src/ui/room.css` holds the layout, using only the tokens in `tokens.css`.
- `index.html` replaces the placeholder page and loads `main.js` and the CSS.
- Engine change (one line in `src/engine/`): export `whyIllegal` from `run.js` so the screen can say why a card is greyed out. That means touching two `src/` folders at once.

### Layout (one column at 375 px; at 1280 px the wafer map sits beside the hand)
1. Top bar: room name on its room-color band (etch, plasma blue) with an icon-free text label, step 4 of 9, seed in mono, cash.
2. Yield bar with its number, and marks at the scrap line (40%) and the spec (70%).
3. Wafer map: 5×5 sites.
4. Time budget: minutes left / minutes in this room.
5. Slots: the etch room's equipment, or "empty".
6. Tool health bar.
7. Hand: cards at least 44 px tall, showing name, minutes, cash, a one-line effect, and a reason when they can't be played.

### Tests (`tests/view.test.js`, Node, no browser)
- Seed 123456, idle to etch, scatter off: yield shown as **91.4%**: particles 0.01 in each of three steps, plus cd_error 0.06 at litho, gives e^(−0.09) = 0.913931. That was computed by hand and confirmed against the engine (0.9139311852712279).
- The hand has the etch cards from the deck; endpoint etch without the detector shows its reason.
- 25 sites, all within 0..1; the seed shown equals the run's seed.
- `?seed=` parsing: a number is used as is, anything else falls back to a fresh seed (the fresh seed comes from the date and time, the only place outside rng.js where a seed is born; noted in the code).

### Acceptance criteria
- `npm test` passes; the page loads with `python3 -m http.server 8000` and shows the etch room for a seed.
- I check desktop and 375 px phone views by eye with a throwaway screenshot from the pre-installed browser (not committed; Playwright proper is M2 item 3).
- `code-explainer` reviews readability and CLAUDE.md §10 (tokens only, contrast, 44 px targets).

### David's answers (24 Oct 2026)
- **Wafer map: bands and a number.** Each tile shows its % in text.
  - 90% or above: pass (pale green, dark green edge).
  - 70% to under 90%: warning (amber, dotted).
  - Below 70%: fail (red with a slash).
  - Pattern and lightness differ too, so color never carries the meaning alone. The 70% matches CUSTOMER_SPEC; the 90% band edge goes in `balance.js` as `SITE_GOOD_LINE`.
- **Screen run: starter deck, no tools.** The etch hand is timed over-etch only, and the etch slots show "empty".
- **Telegraph: expected loss only.** One line: "This room will cost about 22.9 points of yield if nothing changes." `view.js` works it out by realizing this step's patterns on a copy of the lot with no scatter. Hand check at etch, idle:
  - center e^(−0.09−0.16);
  - inner e^(−0.09−0.21);
  - outer e^(−0.09−0.338125);
  - average 0.685321, against 0.913931 now, a cost of **22.9 points**. Confirmed against the engine (0.2286102).
- Added test: the expected-loss line reads 22.9 at etch for seed 123456, idle, scatter off.

### Questions for David (answered)
1. Wafer map: our sites hold "fraction of the 25 wafers still good at this die position". How should one site look?
2. Which deck and equipment should the screen run use?
3. Should the room show what is about to bite (the pending risks)?

---

## Done: M1 item 6 — the bot (`src/engine/run.js` + `tools/bot.js`)

**Status: done 24 Oct 2026. 84/84 tests pass; 500 random-bot seeds with no exception and no NaN/Infinity.** David's answers (24 Oct 2026): i-line resist loaded free; bot plays both the starter deck and the full pool; report both minutes played and cycle time.**

### What it is, in plain words
A program that plays the Cu line from start to finish with no screen, using a fixed seed, and prints the final yield, cash and time. To have something to play, it needs the first, minimal version of `run.js`: the rules for walking the route, drawing a hand, playing a card and shipping. No map, side stops, procurement or saves yet (those are M3).

### `src/engine/run.js` (about 200 lines; pure functions, each returns a new state)
- `createRun({ seed, lotTypeId, deck, loadout, scatterStrength })` → the one state object: `seed`, `rngState`, `lotTypeId`, `stepIndex`, `lot` (start risks added), `cash`, `room`, `tools` (every room at health 100), `equipment`, `slots`, `enabled`, `lotTraits` (from the lot type), `deck`, `hand`, `minutesUsed`, `cycleTime`, `status` ('running' | 'scrapped' | 'shipped' | 'rejected'), `log`.
- `enterStep(state)`: add the step's risks → set `timeLeft` from `TIME_BUDGETS` → apply each equipment and material in this room once (`applyEffects`; the i-line resist's −5 min lands here) → add `timeLeft` to `cycleTime` → draw a hand of `HAND_SIZE` from the room-legal cards in the deck (seeded shuffle).
- `legalCards(state)`: cards in hand whose own `when` holds, whose time fits `timeLeft` and whose cash fits `cash` (the check carried from resolve.js).
- `playCard(state, cardId)`: refuses an illegal card (error naming it); pays the base time and cash, applies the effects, removes it from the hand.
- `resolveStep(state)`: roll scatter for the step's patterns (seeded), realize them, add the minutes used, scrap the lot if yield < `SCRAP_LINE`, else move to the next step. After the last step: shipped if yield ≥ `CUSTOMER_SPEC`, else rejected.
- Unspent time is lost. Tool health stays at 100: nothing wears it yet (there is no rule for how much, so it goes in NEEDS NEW LOGIC rather than being invented).

### `tools/bot.js` (outside `src/`, about 80 lines)
- `playRun(seed, policy, options)` drives run.js to the end. Two policies:
  - **idle**: plays nothing (the hand-checkable baseline);
  - **random**: plays random legal cards until none fits. Its choices use a separate seeded stream, so the bot never changes the lot's own random numbers.
- `npm run bot -- --seed 123456 --policy random` prints seed, status, final yield, cash, minutes played, cycle time and the cards played.

### Tests (`tests/run.test.js`, `tests/bot.test.js`)
- Idle bot with scatter off: yield **0.517954** (same hand value as lotTypes; cuLine is not `tightCD`, so the resist leaves cd_error alone), status `rejected`, cash 1500 (resist loaded free), minutes played 0, cycle time 10+15+35+8+10+15+10+10+20 = **133** (litho 30 + 5: timeCost −5 gives minutes back; first written as 123 by mistake, corrected with David's OK).
- An illegal card (wrong room, too expensive, `when` not met, e.g. `endpointEtch` without the detector) is refused.
- Playing `timedOveretch` in etch costs 4 minutes and scales residue as resolve.js does.
- Scrap: a run that drops below 0.40 mid-route stops there with status `scrapped`.
- Seeds 1–50 × {idle, random} × {starter deck, full pool}: no exception, no `NaN`/`Infinity` anywhere in the final state (a scan of every number), yield in 0..1, cash never below 0.
- Same seed + same policy → identical final state; a different seed → a different wafer map.

### Acceptance criteria
- `npm test` passes; `npm run bot` prints a result; `code-explainer` reviews the diff for readability; `playtester` runs the bot.

### Review results
- code-explainer: fixed `enables` being written but never read (a card some item enables is now refused until enabled, with a test); starting tool health moved to `balance.js` (`STARTING_TOOL_HEALTH`). Its "bath decays on every entry, not every use" is how we agreed it: one plating visit = one use of the bath. Left as is: a lot below the scrap line at the last step counts as scrapped (scrap wins); a card's own timeCost/cashCost effects are not part of the legality check (no card has them yet); splitting enterStep (it reads fine in its four numbered parts).
- playtester, 500 seeds random/full deck: yield 59.4–68.1% (median 65.4%), every run rejected, none shipped or scrapped. Never played: `endpointEtch` (needs the detector, no procurement yet), `spikeAnneal` (diffusion isn't on this route), `reworkLitho` (`lastStepWasLitho` never set). `measureAll` is played every run. **For David/M7:** the 70% spec is out of reach with today's cards, and the spread between seeds is narrow.

### Questions for David (answered)
1. Starting loadout: should the lot start with the starter i-line resist already in the litho slot?
2. The starter deck has only 3 practices (over-etch, measure all, re-expose). Should the bot also run with the full pool so every card gets exercised?
3. "Time" in the report: minutes of practices played, or the sum of the room budgets (the time the lot spends in each room whatever you play)?

---

## Done: M1 item 5 — the inlaid Cu line route (`src/content/lotTypes.js`)

**Status: done 24 Oct 2026. 62/62 tests pass; do-nothing yield 0.517954 matched the hand value first time.**

**David's answers (24 Oct 2026):** route and bite rooms as in the table; risk sizes OK as placeholders; traits: `narrowFeatures` only.

**Hand-computed do-nothing yield (scatter off):** even risks total 0.53; edge ring adds 0.078125 on the outer sites; depth variation adds 0.05 on the inner ring and 0.10 on the outer ring. Center e^(−0.53) = 0.588605, inner e^(−0.58) = 0.559898, outer e^(−0.708125) = 0.492567. Yield = (0.588605 + 8 × 0.559898 + 16 × 0.492567) / 25 = **0.517954**.

### What it is, in plain words
A lot type is data: the route (rooms in order), what risk each step adds, and which step makes each risk bite. It is the missing link between `lot.js` (risk → yield) and the cards (which scale risk). Data only, `draft: true`, with a `physicsNote`.

### Proposed shape
```js
export const LOT_TYPES = {
  cuLine: {
    id: 'cuLine', draft: true, name: 'Inlaid Cu line',
    traits: ['narrowFeatures'],                  // for when: { lot }
    startRisks: { depth_variation: 0.08, dishing: 0.08 },   // latent from the start
    route: [
      { room: 'clean', label: 'Clean', adds: { particles: 0.01 }, realizes: ['particles'] },
      ...
    ],
    physicsNote: '...',
  },
};
```
On entering a step: add its risks, then equipment and material effects, then cards. On resolving: realize its patterns.

### Proposed route (DESIGN.md §11): where each risk enters and where it bites
| # | Room | Adds on entry | Realizes (bites) | Why it bites here |
|---|---|---|---|---|
| start | | depth_variation 0.08, dishing 0.08 | | Latent: set by the stack and layout before any step. Etch stop (dep) and dummy fill (litho) scale them early |
| 1 | Wet clean | particles 0.01 | particles | |
| 2 | Deposition (SiN + oxide) | particles 0.01 | particles | Pre-clean scales the particles about to be buried |
| 3 | Litho (trench) | particles 0.01, cd_error 0.06 | particles, cd_error | Rework is the only fix, and only here |
| 4 | Etch (trench) | particles 0.01, residue 0.10, underlayer_attack 0.05, edge_ring 0.05 | particles, residue, underlayer_attack, edge_ring, depth_variation | The etch room's card choices |
| 5 | Wet clean (post-etch) | particles 0.01, qtime_oxide 0.04 | particles | N2 storage scales the oxide that grows while the lot waits |
| 6 | Deposition (barrier + seed) | particles 0.01 | particles, qtime_oxide | The oxide is trapped under the barrier |
| 7 | Plating | particles 0.01, void 0.08 | particles, void | |
| 8 | CMP | particles 0.01, rr_drift 0.04 | particles, dishing, rr_drift | |
| 9 | Metrology | none | none | Measure, then ship against the spec |

Total risk if you play nothing: 0.66, so yield is about e^(−0.66) ≈ **52%**. That's rejected (below the 70% spec) but not scrapped (above 40%). Good play should reach about 75–80%. These are placeholders for the M7 bot pass.

### Changes
- [x] `src/content/lotTypes.js` with `cuLine` as above
- [x] `tests/lotTypes.test.js`: every room is in `ROOMS`; every pattern is in `PATTERNS`; every risk that enters is realized at the same or a later step (nothing dangles), and nothing is realized before it enters; traits are among the static `when: { lot }` traits used in content; and a hand-computed do-nothing yield, run through `lot.js` with scatter off

### Acceptance criteria
- `npm test` passes; `physics-reviewer` checks the route and the risk placement.

### From physics-reviewer (route order and enter/bite placement: PASS)
Fixed now: comment says metrology adds no particles; post-etch step labelled "Resist strip + wet clean"; tradeoff says "dishing and erosion" (pad drift isn't Cu-specific); physicsNote names what is simplified away (anneal, cap, post-CMP clean).

For David:
1. **Q-time oxide under the barrier.** In a single-damascene line the barrier lands on dielectric, so there's nothing to grow native oxide on; the real Q-time risk is a via landing on Cu or a contact on Si. `physicsNote` and `fm_qtime` ("high contact resistance") may teach something false. Options: reword to residue/moisture/oxidized landing surface → via resistance, or say the trench lands on a lower Cu line.
2. **`resistThick` underlayer effect never fires on cuLine.** It scales `underlayer_attack` in litho, but that risk only enters at etch (and `deepEtch` isn't a cuLine trait). Fix later: give deep-etch lot types an `underlayer_attack` start risk, or move the effect to an etch item.
3. **`fm_keyhole` says "narrow vias"**; cuLine's void is a trench seam → "narrow lines/vias"? **`fm_rr_drift` "walks lot to lot"** needs SPC history from earlier lots on the CMP chart.

Carried to run.js / content tests:
- A test that every unconditional `defectMult` on pattern P in room R has a route step in R between P entering and P biting (would have caught #2).
- Cards whose target pattern is already realized (e.g. `etchStopLayer` at the second dep visit) are dead: grey them out (NEEDS NEW LOGIC).

---

## Done: M1 item 4 — balance numbers (`src/content/balance.js`)

**Status: done 24 Oct 2026.** `npm test` 55/55 (4 new balance tests). No behavior change: lot.js now reads the same 0.25 from balance.js.

**David's answers (24 Oct 2026):** cash 1500; scrap line 40%, spec 70%; time budgets as in the table.

### What it is, in plain words
One file that holds every tuning number, so balancing never means hunting through code (CLAUDE.md §7). Data only; no logic. All numbers are placeholders until the M7 bot balance pass.

### Numbers (confirmed by David)
| Name | Proposed | Why |
|---|---|---|
| `STARTING_CASH` | 1500 | One big tool (450–700) plus a material and a consumable or two; not everything |
| `HAND_SIZE` | 5 | O6 |
| `SCRAP_LINE` | 0.40 | Below 40% line yield the lot is scrapped mid-run |
| `CUSTOMER_SPEC` | 0.70 | Ship at or above 70% = shipped; below = rejected (O4) |
| `SCATTER_STRENGTH` | 0.5 | Site-to-site scatter for even patterns (lot.js) |
| `SHAPED_SCATTER_FRACTION` | 0.25 | Moved here from lot.js, where it was marked as a placeholder |

**Time budgets per room (minutes).** Set against the card costs so each room forces a choice:

| Room | Budget | Cards today (time) | The choice it forces |
|---|---|---|---|
| Wet clean | 10 | N2 storage (cash only) | (time matters once Q-time lands) |
| Deposition | 15 | pre-clean 10, SiN etch stop 12 | **one or the other, not both** |
| Litho | 30 | rework 30, dummy fill 0; i-line resist −5, thick resist +10 | rework fits only with a fast resist or nothing else |
| Etch | 8 | timed over-etch 4, endpoint etch 5 | two plays at most |
| Plating | 10 | low-current start 8 | |
| Diffusion | 20 | spike anneal 15 | (NMOS, later) |
| Implant | 15 | none yet | (NMOS, later) |
| CMP | 10 | none yet | |
| Metrology | 20 | measure all 25 sites 20 | spend the whole visit measuring, or don't |

### Changes
- [x] `src/content/balance.js` with the numbers above, each with a one-line comment
- [x] `lot.js` reads `SHAPED_SCATTER_FRACTION` from balance.js instead of its own constant (a 2-line change; no behavior change, since the value stays 0.25)
- [x] `tests/balance.test.js`: every number is finite and in range; `SCRAP_LINE < CUSTOMER_SPEC < 1`; every room in `ROOMS` has a time budget; every practice's time cost fits inside its room's budget (so no card can never be played)

### Acceptance criteria
- `npm test` passes; no other behavior changes.

---

## Done: M1 item 3 — card effects (`src/engine/resolve.js`)

**Status: done 24 Oct 2026.** `npm test` 51/51. physics-reviewer and code-explainer: no blocking issues. Fixed from their findings: number checks on every stored value (timeCost, cashCost, toolHealth, decay factor), decayPerUse refuses mult < 1 and a missing source, two dense lines split. Two new tests.

**David's answers (24 Oct 2026):** (1) `decayPerUse`: the slot keeps a decay factor starting at 1; each use multiplies the target pattern's risk by the factor, then the factor ×= mult (the bath gets worse each use). (2) Equipment and material effects apply once per visit to their room, on entering, before any cards (run.js will call `applyEffects`).

### What it is, in plain words
Every card, tool, material and consumable is a list of effects (`content.js`). This file is the one place that knows what each of the eight effect operations *does* to the game state, and when a `when` condition is true. It doesn't decide *when* a card is played or pay its base cost; that is the run's job (`run.js`, later). Keeping it that narrow means each operation has one small function and one test.

### The slice of state it touches
`run.js` doesn't exist yet, so this item fixes only the parts effects need. `run.js` will build the full state around them later.
```js
{
  lot,                        // from lot.js: sites, risks, flags
  cash,                       // may go below 0 (O4: that blocks buying, nothing else)
  room: { id, timeLeft, revealed: [] },
  tools: { etch: { health: 100 }, ... },   // 0..100
  equipment: ['oesEndpoint', ...],
  slots: { resist: { id, shelfLife, decay: 1 }, bath: { ... } },
  enabled: ['endpointEtch', ...],          // cards made playable by equipment
  lotTraits: ['narrowFeatures', ...],      // facts about this lot, for when: { lot }
}
```

### The eight operations
| Op | What it does | Edge rules |
|---|---|---|
| `defectMult` | `scaleRisk(lot, pattern, mult)` from lot.js | unknown pattern → error |
| `timeCost` | `room.timeLeft -= delta` (a negative delta gives time back, e.g. i-line resist −5) | may not go below 0; the run checks affordability before a card is played |
| `cashCost` | `cash -= delta` | may go below 0 (O4) |
| `setFlag` | adds the flag to `lot.flags` (once) | |
| `reveal` | adds `what` to `room.revealed`; the UI reads it in M2 | `'none'` does nothing |
| `toolHealth` | the room's tool health `+= delta` | kept within 0..100 |
| `enables` | adds the id to `enabled` (once) | |
| `decayPerUse` | `scaleRisk(target, slot.decay)`, then `slot.decay ×= mult`, on the slot holding `source` | source not in a slot → error |

**`when` conditions**, checked by one exported function `conditionMet(state, when)`:
- `{ flag }`: the lot has that flag. `{ equipment }`: it's installed. `{ material }`: some slot holds it.
- `{ lot }`: the trait is in `state.lotTraits`. Static traits (`tightCD`, `deepEtch`, `narrowFeatures`) will come from `lotTypes.js`. Dynamic ones (`delayBeforeBake`, `lastStepWasLitho`, `rightPartChosen`) stay in NEEDS NEW LOGIC: something has to set them later. Until then they are simply false.
- An unknown op or condition key → an error naming it, so a typo in content fails loudly.

### Functions (each returns a new state; nothing is changed in place)
- [x] `conditionMet(state, when)`
- [x] `applyEffect(state, effect, source)`: one effect. `source` is the item, needed by `decayPerUse`.
- [x] `applyEffects(state, item)`: all of an item's effects in order, skipping those whose `when` is false
- [x] One small private function per operation

### Tests (`tests/resolve.test.js`, hand-computed)
- [x] One test per operation, eight in all, including its edge rule.
- [x] `when`: each of the four kinds, true and false. Timed over-etch with and without `etch_stop`: underlayer_attack ×1.5 vs ×1.5×0.5 = ×0.75.
- [x] Unknown op and unknown condition key throw.
- [x] Nothing is changed in place. No NaN in the state after applying every item in `content.js`.

### Acceptance criteria
- `npm test` passes. `resolve.js` is pure and under ~150 lines.
- `physics-reviewer` checks the decayPerUse semantics; `code-explainer` checks readability.

### Carried to run.js (from physics-reviewer)
- `applyEffects` does not check an item's own top-level `when`. Before a card is played, run.js must check `conditionMet(state, card.when)`, plus `enabled` for cards that need equipment. Today that is `reworkLitho` (lastStepWasLitho), `endpointEtch` (oesEndpoint) and `spikeAnneal` (rta). Add a test for it there.
- The dynamic traits (`delayBeforeBake`, `lastStepWasLitho`, `rightPartChosen`) are always false until something sets them, so the CAR resist's delay penalty and the spare part's repair never fire yet. Matters for balance and playtests (already in NEEDS NEW LOGIC).

---

## Done: M1 item 2 — lot state and yield math (`src/engine/lot.js`)

**Status: done 24 Oct 2026.** `npm test` 35/35. physics-reviewer: no blocking issues; its overflow finding (risk → Infinity → NaN) fixed with a check on the stored result, plus tests. Its two map-shape suggestions are below for David.

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

### For David (from physics-reviewer, not blocking)
- Ten of twelve patterns are "even". Dishing is really a pattern-density effect, and CMP non-uniformity is often center-to-edge. Those failures will be diagnosed from SPC, metrology and the cross-section rather than the map. Fine for now.
- On a 5×5 map with high scatter, center-to-edge (0 / 0.625 / 1.25) can look like a mild edge ring. A small nonzero center weight would make them easier to tell apart.

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
- Dead cards: a practice whose target pattern was already realized earlier on the route (e.g. `etchStopLayer` at the second dep visit) should be greyed out or hidden
- Tool wear: tool health stays at 100 in run.js; no rule yet for how much a room wears its tool
