# Fab Run — Task Tracker

## Current: M4 item 2 — the notebook is saved under its own key and survives a run-save version bump

**Status: plan OK'd by David (26 Oct 2026): Q1–Q4 and Q6 as proposed; Q5 yes, the Notebook page is its own M4 item. Building.**

### Task: keep the notebook between visits, safely, and never lose an entry

**What you'll see**
- Diagnose a failure mode right, close the tab, come back days later: it is still in your notebook. On the ship report, a candidate you already know shows "In your notebook", and a right answer you already have adds nothing.
- Nothing else on screen changes. Showing the notebook itself is not this item (see Q5).

**Why it needs care**
- The run save (`fabrun.run.v1`) is **thrown away** whenever `SAVE_VERSION` goes up, which it will often, after any rule or number change. The notebook is the player's long-term progress, so it must never be thrown away that way (CLAUDE.md §11).
- So the notebook gets **its own key with no version in its name**: `fabrun.notebook`. Its version lives inside the object (`{ version: 1, entries: [...] }`), so a later change can **upgrade** an old notebook instead of discarding it.

**Code (all in `src/ui/`, one folder)**
- [ ] `storage.js`, about 50 lines, built on Lane B's `readJson` / `writeJson`:
  - `NOTEBOOK_KEY = 'fabrun.notebook'`.
  - `loadNotebook(storage)`: the saved notebook, or an empty one when there is none, it is junk, or storage is blocked. Never throws.
    - It keeps only well-formed entries (`{ id: text, seed: number }`) and drops duplicates.
    - It **keeps** entries whose failure mode no longer exists in `content.js` (renamed or removed), so they come back if the content does. The game ignores them (Q3).
    - A notebook with a **newer** version than this code knows is left untouched: the page plays with an empty notebook and never writes over it (Q2).
  - `saveNotebook(notebook, storage)`: first reads what is stored and **merges** the two (union of entries by id), then writes. Two open tabs then can't erase each other's entries (Q4). True if saved.
- [ ] `main.js`, about 10 lines: load the notebook when the page opens; save it right after a right diagnosis. `clearRun` and starting a new run never touch it.

**Tests (`tests/storage.test.js`, pretend storage as Lane B's tests use)**
- [ ] Save, then load: the same entries.
- [ ] Blocked storage (every call throws): load gives an empty notebook, save returns false, nothing throws.
- [ ] Junk under the key (not JSON, a number, entries not a list, bad entries): load gives what is usable, never throws.
- [ ] **Version bump test:** save a run and a notebook, then load the run with a raised `SAVE_VERSION` (the run is ignored) and `clearRun`: the notebook is still there, unchanged.
- [ ] Unknown failure-mode id: kept in storage after load and save, and `diagnosisFor` ignores it.
- [ ] Newer notebook version: load gives empty, save leaves the stored value as it was.
- [ ] Two tabs: tab A saves entry 1, tab B (loaded before) saves entry 2; the store holds both.
- [ ] Screen test, desktop and phone: diagnose right on seed 123456, reload, check the stored notebook holds it and the ship report of a replayed run marks it as known. Phone with `--repeat-each=5`.

**Size:** about 60 lines of code in `src/ui/` and about 120 lines of tests. One `src/` folder. No engine change; `notebook.js` already uses `{ version: 1, entries: [{ id, seed }] }`.

### Questions for David (proposed answers; say if any is wrong)
- **Q1 key name:** `fabrun.notebook`, version inside the object. Proposed: yes.
- **Q2 newer version found** (a newer build was opened, then an older cached page): play with an empty notebook and don't overwrite it. Proposed: yes.
- **Q3 entries for failure modes no longer in the content:** keep them stored, ignore them in play. Proposed: yes.
- **Q4 two tabs:** merge on save, so no entry is ever lost. Proposed: yes.
- **Q5 notebook screen:** the playtests found the notebook is mentioned but can't be opened anywhere. A small "Notebook" page listing your diagnosed failure modes, with their signatures and the seed you found them on, is a natural next step. Add it to ROADMAP M4 as its own item before the unlock pool, or leave it for later?
- **Q6 reset:** no "erase my notebook" button for now. Testers can clear it from the browser's site data. Proposed: yes.

### Acceptance criteria
- `npm test` and `npm run screens` pass; the new phone test passes 5 runs in a row.
- A right diagnosis survives a reload and a `SAVE_VERSION` bump; blocked storage still plays.
- `tasks/lessons.md` gets any new rule; the ROADMAP box is ticked; David gets the 3-bullet summary.

---

## Done: M4 item 1 — diagnose screen: name a failure mode from the evidence; a right answer writes the notebook

**Decision O1 settled (David, 25 Oct 2026): B, diagnosing a failure mode earns its unlocks.** David also said yes to Q2 (a 3-point line), Q3 (reveal a right answer on a wrong guess) and Q4 (ship now, with the gaps listed below).

### Task: on the ship report, name one failure mode that hurt this lot; if right, it goes into the notebook

**What you'll see**
- A **Diagnose** panel on the ship report, under the verdict, for every finished run: shipped, rejected or scrapped. Scrapped lots are the ones most worth learning from.
- The evidence is the ship report itself:
  - yield by step (which room lost the lot);
  - the wafer map (an edge ring, a center-to-edge gradient or random dots);
  - **new: the SPC chart of each tool on the route**, so a drifting tool is visible after the run.
- **Four candidate failure modes**, each with its signature text from `content.js` (for example, "Only the outer ring of sites fails; inner sites are clean"). The seed picks the order, and the distractors come from the other failure modes.
- **You pick one.** Exactly one guess per run.
  - **Right:** "Diagnosed: keyhole void. Written in your notebook." The panel lists what it unlocks (low-current start, additive bath, bath analysis), with a note that unlocks take effect in M4 item 3.
  - **Wrong:** "Not this one." The panel then names a failure mode that did hurt this lot, but does **not** write it to the notebook. You learn it here and earn it on a later run (Q3).
  - **Already in the notebook:** marked as such, and choosing it adds nothing.

**What counts as right (Q2)**
- Idle runs on 5 seeds show several patterns costing about the same: residue, void, particles, dishing and depth variation each sit at 0.08–0.15 risk. So one single "the answer" would be arbitrary.
- Proposal: **any failure mode whose pattern cost at least `DIAGNOSE_MIN_POINTS` yield points this run** (new in `balance.js`, proposed 3 points) counts as right.
- The four candidates hold at least one right answer and up to three wrong ones. A wrong one is a failure mode whose pattern cost less than the line (0 points is fine).
- If nothing cost 3 points, there is nothing to diagnose. The panel says "This lot lost too little to tell what hurt it."

**Engine (`src/engine/`)**
- [x] `lot.js`: `realizeRisks` also adds up **kills per pattern**: `lot.kills[pattern] += mean over sites of risk × weight × nudge`.
  - This is the same exponent it already uses, so the yield math does not change.
  - Losses multiply, so the log-losses add, and each pattern's share of the yield lost is `kills[p] / Σ kills` (exact, not an approximation).
  - Points lost to a pattern = `(1 − yield) × 100 × share`.
- [x] New `src/engine/notebook.js`, pure:
  - `diagnosisFor(state, notebook)` returns `{ rightIds, candidates }` (four ids, in seeded order, using their own generator stream, so the lot's random numbers are untouched).
  - `diagnose(state, notebook, failureModeId)` returns `{ correct, notebook, revealed }`.
  - A notebook is a plain object: `{ version: 1, entries: [{ id, seed, date: null }] }`. No storage here; that is item 2.
- [x] `state.diagnosed` (null, then the id guessed) stops a second guess. Recorded as an action `['diagnose', id]` for Lane B's replay.

**UI (`src/ui/`)**
- [x] `shipView`: a `diagnose` section and the route's SPC charts (reusing `spcView` and `drawSpc`).
- [x] `render.js`: draws the Diagnose panel and the candidate buttons (44 px, with the double-tap guard).
- [x] `main.js`: holds `notebook` in memory for now. Item 2 saves it under its own key with Lane B's helpers.

**Tests**
- [x] Hand-computed, `lot.js`: particles 0.1 on even weights then edge ring 0.2 with no scatter. Kills = 0.1 and 0.2 × mean(edge weights) = 0.2 × 1 = 0.2, so the shares are 1/3 and 2/3.
- [x] `diagnosisFor` on an idle walk, seed 123456: every right id's pattern cost ≥ 3 points, every wrong one less, 4 distinct candidates, and the same seed gives the same order.
- [x] `diagnose`: right → added once; wrong → not added and names a right one; a second guess is refused; an id already in the notebook is not added twice.
- [x] Screens, desktop and phone: an idle run's ship report, pick a right answer, then New seed and the notebook still holds it (in memory); a wrong pick. Phone tests run with `--repeat-each=5`.

**Size:** about 15 lines in `lot.js`, about 80 in `notebook.js`, about 120 UI and about 150 tests. It touches `src/engine/`, `src/ui/` and `balance.js`, so this plan is the ask.

**Rule 6 check: what the screen can show today.** David, please check this table.

| Failure mode | Told apart by, today | Gap |
|---|---|---|
| fm_particles | random dots on the map + clean SPC | — |
| fm_chamber_flakes | loss at the dep steps + dep SPC | — |
| fm_residue | loss at etch + etch rate falling on etch SPC | — |
| fm_underlayer | loss at etch | **looks the same as residue** without a cross-section; only SPC tells them apart |
| fm_edge_ring | edge ring on the map | — |
| fm_dishing | loss at CMP | sig says "wide lines thin": needs metrology, not built yet |
| fm_rr_drift | CMP SPC walking | — |
| fm_keyhole | loss at plating | sig says "narrow vias, void in the fill": needs a cross-section |
| fm_qtime | loss after a long wait | the yield table plus cycle time partly show it |
| fm_implant_damage, fm_ped_ttop | not on the Cu line | never a right answer on this lot |

Proposal: build it now with this evidence, and add the gaps (metrology and cross-section views) to NEEDS NEW LOGIC. The yield-by-step table plus the signature text is enough to play. The gaps make some pairs (residue vs underlayer, dishing vs rr_drift) guesses until the metrology stop shows real data.

**Questions for David**
1. **O1:** unlocks come from diagnosing a failure mode (B). Confirm?
2. **What counts as right:** any failure mode that cost at least 3 yield points this run (my proposal), or only the single biggest one?
3. **A wrong guess:** reveal a right answer without writing it (my proposal), or reveal nothing?
4. **Rule 6 gaps above:** OK to ship with these gaps listed in NEEDS NEW LOGIC, or should the metrology stop show real data first? That would be its own item before this one.

**Changes from the plan after the physics review**
- **Loss is split site by site**, not by the mean over the wafer (`lot.lost` replaces `kills`).
  - At each site, the drop is shared in proportion to each pattern's part of that site's exponent, and the shares add up to the whole drop.
  - The whole-wafer mean under-credited a pattern sharing the wafer with one that saturates some sites. The reviewer's example: particles costing about 6.5 points were credited about 1.2, so a right diagnosis was graded wrong.
  - My own hand-check test (0.1 and 0.2 kills) was replaced by the new site-by-site hand check. It was written this session and no value David gave was changed.
- **Post-exposure delay T-top** is right only when the lot waited before bake (`when: { lot: 'delayBeforeBake' }`, the existing condition, so no new logic).
  - CD error also comes from the base litho risk and litho drift, so grading any CD loss as T-top taught something false.
  - On today's Cu line it is never a right answer.
- Wrong choices come first from patterns this route can make, so implant damage on a Cu line is not a giveaway.
- Failure modes got a `name` (draft). Entries without one fall back to the pattern's words.

**For David (found while building)**
1. **The 3-point line makes most guesses right.** On idle runs over 3 seeds, 6 of the 10 Cu-line failure modes clear 3 points (particles, residue, underlayer, edge ring, dishing, keyhole). The losses are spread evenly, so diagnosis is easy. The line is in `balance.js` (`DIAGNOSE_MIN_POINTS`).
   - Options: raise it to about 5 points;
   - or count only the top 2 patterns;
   - or leave it for the M7 balance pass.
2. **physics-reviewer, ASK DAVID:**
   - "Removal-rate drift" names a symptom, not a root cause (pad glazing, worn conditioning). Is that OK as a name?
   - "Handling particles": its sig points at the wet clean SPC chart, but particles are added at every step. Should it say "wet clean particles"?
   - Underlayer attack ("notch in the film below") and keyhole void ("seam in the fill") cite a cross-section the player can't see. Add a cross-section view later, or reword those two sigs to point at evidence on screen?

**NEEDS NEW LOGIC (noted, not built):** a cross-section view, and metrology showing real data (dishing on wide lines, CD per site), so every signature can be read on screen (rule 6).

**For Lane C:** the new failure modes need a `name` (they fall back to the pattern words until then). A second CD failure mode (fm_dose_offset) needs its own `when`, or it has the same problem T-top had.

**Result:** done. A Diagnose panel on the ship report: 4 failure modes, one guess per lot, and a right answer writes the in-memory notebook. The ship report also shows the SPC chart of each tool on the route. npm test 197/197, npm run screens 40/40, and the new phone tests pass 5 runs in a row. The screenshots were checked by eye. physics-reviewer: 2 must-fixes, both fixed; its 3 ASK DAVID points are above.

## Done: M3 item 3 — ship screen: yield against spec, cost per good die, cycle time; scrap and reject end states

### Task: when the run ends, a ship report shows how the lot did; the player can also scrap the lot

**What you'll see**
- After the last room (or when the lot falls below the scrap line), the result screen's button becomes **See the ship report**.
- The ship report shows:
  - **The verdict:** Shipped, Rejected or Scrapped, in one line with the reason ("Shipped yield 74.2%, spec 70%").
  - **The three numbers, side by side, with no combined score** (DESIGN.md §12):
    - shipped yield against the spec;
    - cost per good die;
    - cycle time in minutes.
  - **Yield by step:** a short table with each room's yield after it ran and the points it cost, so you can see where the lot was lost. It is evidence for M4's diagnose screen.
  - The final wafer map, plus **Replay this seed** and **New seed**.
- **Scrap the lot:** a new button on the map between rooms (O4: "or the player scraps it"). It asks once ("Scrap this lot? This ends the run."), then goes to the ship report as Scrapped. A scrapped lot ships no good die, so the report shows the money spent instead of a cost per good die.

**Engine (`src/engine/`)**
- [x] **Step 0: split `run.js`** (420 lines, over the ~400 rule). Move the side-stop functions into a new `src/engine/sideStops.js`:
  - `buyItem`, `whyCannotPm`/`pmTool`, `whyCannotDoe`/`doeCard`, `chooseEventOption`, `stopUsed`;
  - about 140 lines moved, no behavior change;
  - `run.js` re-exports them, so no import elsewhere changes.
  - All 178 tests must pass unchanged. Its own commit.
- [x] `state.stepYields`: after each room, push `{ stepIndex, roomId, yieldAfter }`. The report reads it. Nothing else changes.
- [x] `scrapLot(state)`: allowed only in a corridor while the run is running. It sets `status: 'scrapped'` and `scrappedBy: 'player'` (the yield scrap sets `'scrapLine'`). Refused anywhere else.
- [x] Bot: the random bot never scraps. A test scraps at step 3 and checks that the run is over.

**The money (David, please check; see Q1)**
- **Lot cost** = `LOT_BASE_COST` (new in `balance.js`: wafers plus routine processing, proposed 2000) + the cash spent during the run (STARTING_CASH − cash at the end; event income lowers it).
- **Good die** = shipped yield × 25 wafers × 25 sites = yield × 625.
- **Cost per good die** = lot cost ÷ good die, shown for Shipped and Rejected (a rejected lot is labelled "not paid: rejected").
- For Scrapped, the report shows lot cost and "no good die shipped".

**UI (`src/ui/`)**
- [x] `shipView(state)` in a new `src/ui/shipView.js`: pure, tested in Node (like `pmView`).
- [x] `renderShip` in `render.js`. `main.js` gets one `showShipReport()`: the single place where a run ends, which Lane B hooks to clear the save.
- [x] Scrap button and its confirm on the map (`floorPlan.js`, about 20 lines; it is at 347).

**Tests**
- [x] Unit, hand-computed: cost per good die for a fixed state, e.g. base 2000 + 300 spent = 2300; yield 0.74 → 462.5 good die → 4.97 per die.
- [x] Unit: `stepYields` has one entry per room on a full idle walk, and the last entry equals the final yield.
- [x] Unit: `scrapLot` is refused in a room and after the run ends.
- [x] Screens, desktop and phone: the ship report after an idle walk (seed 123456), plus a player scrap. Run with `--repeat-each=5` on the phone.

**Size**: about 60 engine lines + 140 moved; about 150 UI lines; about 150 test lines. It touches `src/engine/`, `src/ui/` and `src/content/balance.js`, so this plan is the ask (CLAUDE.md §3).

**For Lane B**
- A new action `['scrap']` must be replayable. `showShipReport()` is where the save gets cleared.

**Questions for David**
1. **Cost per good die:** is a base lot cost of 2000 plus cash spent the right model? Should the base be per wafer, or should each room charge a run cost?
2. **"Against your previous runs"** (DESIGN.md §12): saving past runs needs storage, which is Lane B's file. Should the report show this run only for now, with a best and last comparison added after Lane B merges?
3. **Player scrap:** in a corridor only (my proposal), or also inside a room before running it?
4. **Rejected lot:** keep cost per good die on screen marked "not paid", or show only the lot cost, like a scrap?

**David said "Build" without answering Q1–Q4, so the proposals above were built as defaults.** Each is one small change if David decides otherwise:
- Q1: `LOT_BASE_COST` 2000 + cash spent (`balance.js`, `shipView.js lotMoney`).
- Q2: this run only. Best and last runs come after Lane B's storage merges.
- Q3: scrap anywhere between rooms (the engine allows door, corridor and side stops; the button shows on the map in a corridor only).
- Q4: a rejected lot keeps its cost per good die, marked "Not paid".

**Result:** done. `run.js` was split first (420 → 319 lines, with `sideStops.js` and `runState.js`; no behavior change, 178/178 before any new code). After that: the ship report, yield by step, and the player's scrap with a confirm. npm test 188/188, npm run screens 36/36, and the new phone tests pass 5 runs in a row. The screenshots were checked by eye. Two label bugs were found there and fixed (lessons.md). Seed 123456 with an idle walk ends Rejected: 51.8%, cost 6.18 per good die, 133 min.

## Done: M3 item 2e — three events with a tradeoff each

### Task: the event side stop draws one of three events; you pick one of its two options

**What you'll see**
- Picking **Event** in a corridor (10 min, as now) opens an event screen. It shows a short situation in fab words, then two option buttons. Each button says what happens in plain numbers: cash, minutes, the risk it adds or the tool it changes.
- After you choose, a result line and **Continue to step N**.
- The event is drawn by the seed from those not seen yet this run (no repeat until all three have come up), with its own generator, so the lot's random numbers are untouched.

**Proposed events** (drafts: David, please rewrite anything that isn't how a fab works)

| Event | Option A | Option B |
|---|---|---|
| **Hot lot request**: a customer wants this lot early for a demo | **Run it hot**: −30 min cycle time and +150 cash (expedite fee), but +0.02 particle risk (rushed handling and skipped buffer waits) | **Keep its place**: nothing changes |
| **Quality audit**: an auditor is on the floor this shift | **Walk them through now**: +30 min (the lot waits; it counts as Q-time in a Q-time corridor), and the wet bench they flag gets serviced: clean tool +15 health | **Ask to come back later**: −100 cash (a finding written up for the missing records) |
| **Supplier change**: purchasing offers a cheaper CMP slurry | **Switch now**: +150 cash, but +0.03 polish-rate drift risk (a new slurry lot, not yet characterized on this tool) | **Keep the qualified slurry**: nothing changes |

Each option has a `tradeoff` and a `physicsNote`, as every content entry does.

**Engine (`src/engine/`) — an engine change; this is the ask (CLAUDE.md §6)**
- [x] One new effect operation, **`addRisk { pattern, amount }`**: a risk enters the lot now and bites when its room realizes it. (The existing `defectMult` only scales risk already there, and between rooms most risks are 0.) `amount` may not be negative: yield only goes down (rule 2).
- [x] `toolHealth` gets an optional `room`, so an event outside a room can name the tool. Today it always means the room the lot is in.
- [x] An option's `minutes` (negative allowed for the hot lot) changes cycle time. In a Q-time corridor, positive minutes also grow the Q-time pattern, like a side stop's wait. Cycle time never goes below 0.
- [x] New `src/engine/events.js`: `drawEvent(state, corridorIndex)`. `run.js`: the event stop opens `state.event = { corridor, eventId, chosen: null }`; new `chooseEventOption(state, optionIndex)` applies the option once, then the stop is done. Refused: no event open, already chosen, or a bad index.
- [x] Bot: the random bot picks an option at random.

**Content (`src/content/`)**
- [x] New `src/content/events.js`: the three events as data (`draft: true`).
- [x] content.js header: document `addRisk` and `toolHealth`'s `room`. `content.test.js` knows the new op.
- [x] `sideStops.js`: Event is no longer a placeholder.

**Screen (`src/ui/`)**
- [x] Event screen: the situation, two option cards with their effects in words and the tradeoff, then the result and Continue.

**Tests**
- [x] `tests/events.test.js`:
  - draws are seeded, with no repeat until all three are seen, and `rngState` is untouched;
  - each option applies its effects exactly once;
  - the refusals above;
  - `addRisk` refuses a negative amount;
  - `toolHealth` with `room` works outside a room.
- [x] **Hand check** (scatter off, drift off): take **Switch now** at an event before CMP.
  - Cash +150.
  - rr_drift reaches CMP at 0.04 + 0.03 = 0.07, so final yield = the idle run × e^(−0.03) = × **0.970446**.
  - The test finds the first seed from 123456 up that draws the supplier event before CMP.
- [x] Screen tests at both sizes, run 5 times on the phone (lessons.md); screenshots checked.
- [x] `physics-reviewer` on the events; `code-explainer`; `playtester`.

**Size:** content, engine and screen, about 300 lines plus 3 events. This plan is the ask, including the new op.

**Questions for David**
1. Are these three events and their options how it really goes? Rewrite freely.
2. OK to add the `addRisk` operation and `toolHealth`'s `room`?
3. Should an event's minutes count as Q-time waiting, as a side stop's do?
4. Seeded, with no repeat until all three are seen?
- Still open from the DOE item (see tasks/todo.md, M3 item 2d): starter DOE versions strictly better (OK?); the measure-all "3 of 25 wafers" wording; dummy fill against dishing or erosion; a thinner etch stop weakening underlayer protection (later).

**NEEDS NEW LOGIC (noted, not built):** a thinner DOE etch stop that weakens underlayer protection (David, 25 Oct 2026); the disposition desk event (Later in ROADMAP); events with three options or a delayed consequence; events that change a material.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.
- 2026-10-25: David said "Build", so the plan is OK'd as proposed: the three events, `addRisk`, `toolHealth` with a `room`, event minutes counting as Q-time waiting, and seeded draws with no repeat.
  - He also answered the DOE questions: the starter DOE versions are approved as strictly better; measure-all measures all 25 sites, and 3 of 25 wafers is the sampling (note fixed); dummy fill stays on dishing; a thinner etch stop weakening underlayer protection is noted for later (NEEDS NEW LOGIC).
- Engine and content built: `addRisk` in resolve.js, `toolHealth` with `room`, src/content/events.js, src/engine/events.js (`drawEvent`), and `chooseEventOption` in run.js. The random bot picks an option at random.
  - Hand check, seed 123456 (supplier change drawn in the corridor after step 2): Switch now gives × 0.970446 and +150 cash. Passes as computed.
- Screen built: eventView.js and renderEvent (floorPlan.js, now 347 lines; split it before it passes 400). Consequences are in plain words using each pattern's own description, and tool health is said as "tool serviced" (SPC only). The new screen spec waits out the double-click window at every screen change and passes 5 of 5 on the phone.
- physics-reviewer: two must-fixes, both fixed.
  - The slurry risk could not be diagnosed. David chose a step on the CMP chart: Switch now sets the CMP tool health −40 (a 2σ removal-rate step), shown on the CMP SPC chart and costing yield by Cpk. **Hand check changed with David's OK** from × 0.970446 to × 0.977312.
  - Events could cost nothing late in the route. Each event now has `mattersFor` (a room or a pattern still ahead); after CMP no event matters and the stop is a "quiet shift".
  - Also fixed: the hot lot physics note says hand-carrying and manual loading.
  - Questions for David: should an unqualified slurry be offered on a production lot at all, given change control? Can an audit be deferred, and does one lead to a bench being serviced?
- code-explainer: run.js is 418 lines, over the ~400 split line. Proposed to David: move the side-stop functions (walkCorridor, buyItem, pmTool, doeCard, chooseEventOption and their checks) into src/engine/sideStops.js. A deferred audit can take cash below 0, which O4 allows (purchases are then blocked).
- playtester: engine and bot clean (events in 18 of 20 random runs). The phone map test timed out: the double-click window again; map.spec now waits at each screen change.

**Result:** an event stop draws one of three events that still matters on the route ahead (seeded, no repeats). You pick one of two options, shown in plain words. Supplier change is a 2σ step on the CMP chart (× 0.977312). `npm test` 178/178, `npm run screens` 32/32.

## Done: M3 item 2d — DOE stop: upgrade one practice for the run

### Task: at a PM/DOE stop, choose a PM **or** a DOE that upgrades one practice

**What a DOE is, in game terms**
- In a fab, a DOE (design of experiments) tunes a recipe: it finds a centred process window instead of the safe default. The game version: each practice gets **one DOE version as data**. That version is a better-centred recipe that keeps its tradeoff (rule 7): nothing becomes strictly better than every alternative, it just gets a better balance.
- A DOE upgrades that card for the rest of the run. Each card can be upgraded once. In the hand, an upgraded card shows a **DOE** tag and its new numbers.
- Content stays data (CLAUDE.md §6): a practice gets an `upgrade` field holding only what changes (name, cost, effects, tradeoff, physicsNote). No new effect operation.

**Proposed DOE versions for the starter cards** (David to check the physics; content-drafter drafts the other 8, and physics-reviewer and David review them):

| Card | Now | DOE version | Why |
|---|---|---|---|
| Timed over-etch (+20%) | 4 min; residue ×0.3, underlayer attack ×1.5 | "Timed over-etch, DOE-centred": 4 min; residue ×0.3, underlayer attack ×1.25 | The DOE finds the shortest over-etch that still clears: same clearing, less punch-through |
| Measure all 25 sites | 20 min, 150 cash | 12 min, 150 cash | A tuned sampling recipe (fewer sites per wafer, same coverage of the lot) |
| Strip and re-expose | 30 min, 150 cash; CD error ×0.2, particles ×1.2 | particles ×1.1 | A tuned strip with gentler handling |

**The stop**
- [x] The PM/DOE screen gets two sections: **PM a tool** (as now) and **DOE a practice**.
- [x] One choice per stop: doing a PM closes the DOE section, and the other way round.
- [x] DOE lists every practice in your deck that has a DOE version, isn't upgraded yet, and whose room is still ahead. No random pick: the starter deck has only 3 practices.
- [x] Each DOE card shows the card now → after the DOE (cost and effects in words, plus the new tradeoff), and a **Run this DOE** button.

**Engine (`src/engine/`)**
- [x] `run.js`:
  - `state.upgraded = []`;
  - a card lookup that applies the `upgrade` when the card's id is in `state.upgraded`, used by `whyIllegal`, `playCard` and the dealing filter;
  - new `doeCard(state, cardId)` that refuses a card not in the deck, one already upgraded, one without a DOE version, one whose room is behind the lot, a stop already used, or no stop open;
  - `pmTool` and `doeCard` share the one-choice-per-stop rule (`state.pm.done`).
- [x] Bot: at a PM/DOE stop the random bot picks PM or DOE on a coin flip, then uses its PM rule or a random DOE.

**Content (`src/content/`)**
- [x] `upgrade` fields on the practices (all `draft: true` as part of their card).
- [x] `content.test.js`: every `upgrade` keeps a tradeoff and a physicsNote, uses only known effect ops and patterns, and changes something.
- [x] `sideStops.js`: PM / DOE says "PM one tool, or DOE one practice".

**Screen (`src/ui/`)**
- [x] The PM/DOE screen's DOE section; the DOE tag on cards in the hand.

**Tests**
- [x] `tests/doe.test.js`: the refusals above; one choice per stop; an upgraded card plays its DOE numbers; the lot's `rngState` is untouched.
- [x] **Hand check** (scatter off, drift off), seed 123456: DOE timed over-etch at the stop after step 2, then play it at etch.
  - Underlayer attack is 0.05 × 1.25 = 0.0625 instead of 0.05 × 1.5 = 0.075. That is an even pattern, so yield after etch = the non-DOE result × e^(0.0125) = × **1.012578**.
  - Everything else is the same, residue ×0.3 included.
- [x] Screen tests at both sizes; screenshots checked.
- [x] `content-drafter` for the 8 other upgrades; `physics-reviewer` on all 11; `code-explainer` and `playtester` before done.

**Size:** content, engine and screen, about 300 lines plus 11 data entries. This plan is the ask.

**Questions for David**
1. One choice per stop, PM or DOE?
2. Is the DOE rule right: one data-defined upgrade per card, once per run, keeping a tradeoff?
3. Are the three starter-card DOE versions above physically right?
4. Is it fine that DOE costs only the stop's 40 minutes and no cash (O2: cash is spent only at procurement)?
5. Should the DOE list every eligible card (proposed), or a random 2–3?

**NEEDS NEW LOGIC (noted, not built):** a DOE that needs qual wafers (a consumable); a DOE with an uncertain result.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.
- 2026-10-25: David answered:
  - one choice per stop;
  - the DOE rule is right, and the three starter versions are right;
  - a DOE costs cash for its extra tool time: `DOE_CASH_COST = 100`, a placeholder, with O2 amended in decisions.md;
  - random 2–3 offers (`DOE_OFFER_MIN`/`MAX`, drawn with the DOE's own generator).
- There are 10 practices, not 11: content-drafter drafted the 7 non-starter upgrades. All are drafts inside their card entries; physics-reviewer is next.
- Engine built: doe.js (`cardInRun`, `doeOffers`) and `doeCard`/`whyCannotDoe` in run.js, with one choice per stop shared with PM. The bot flips a coin between PM and DOE. Hand check × 1.012578 passes as computed (seed 123456, DOE after step 2, offers: timed over-etch, measure all).
- physics-reviewer on the 10 DOE versions: 4 pass as they are. Fixed: the tuned measure-all now saves time through its stage path and auto-focus, not by sampling less (it still reveals all 25 sites); the spike anneal note no longer says "soak"; the etch-stop note wording.
  - Questions for David: the base measure-all note says "3 of 25 wafers" on a card about 25 sites; should dummy fill fight dishing or erosion (slotting is the textbook dishing fix); and should the thinner etch stop weaken underlayer protection (it can't today without a new op: NEEDS NEW LOGIC)?
- Screen built: a DOE section first on the PM/DOE screen (now → after, the tuned tradeoff, Run this DOE), then the PM section; cash in the header; a DOE tag on upgraded cards in the hand.
- playtester: the engine and bot are clean (DOEs in 10 of 20 random runs). The phone DOE screen test failed every time: the double-click window again (lessons.md). Fixed with the wait and checked 5 of 5 with `--repeat-each=5`.
- code-explainer fixes:
  - content tests that a DOE version keeps every cost field and every flag/enables of its card, and adds no `enables`;
  - the "Can't run" line keys on the engine's reason, not the display text;
  - an unused import and a CSS selector removed;
  - named arguments for showPm.
- code-explainer raised that the three starter DOE versions are strictly better than the card as written. Their cost is paid at the stop (40 min + 100 cash), and David approved them, so they stay. Noted for David.

**Result:** a PM/DOE stop offers one choice: PM a tool, or a DOE on one of 2–3 seeded practices for 100 cash. The DOE'd card plays its tuned recipe for the rest of the run, with a DOE tag. All 10 practices have a DOE version. `npm test` 168/168, `npm run screens` 28/28.

## Done: M3 item 2c — PM/DOE stop, part 1: PM restores one tool

(Proposed split, for David to OK: the roadmap box "PM/DOE stop: restore a tool or upgrade one practice" becomes two. **PM** comes first, because worn tools now exist. **DOE** follows: upgrading a practice needs an upgraded version of each card written as data, drafted by content-drafter and reviewed by David and physics-reviewer.)

### Task: the PM/DOE side stop lets you PM one tool on the route ahead

**What you'll see**
- Picking **PM / DOE** in a corridor (40 min, as now) opens a PM screen.
  - It lists every tool the lot still has ahead on the route, each with a small SPC chart and its verdict ("In control" or "Out of control: 8 in a row below centre").
  - Tool health stays hidden (SPC only), so you choose from the charts as an engineer would.
- Tap **PM this tool** on one of them: its health goes back to 100. Then **Continue to step N**.
- You may PM **one** tool per stop. You can also leave without one; the 40 minutes are spent either way.
- On the room's chart, a PM'd tool shows a **PM** mark between points. The points after it sit back on target, a visible step change.
- **Telegraph on the map:** a bay whose tool's chart trips a rule gets an **SPC** chip, with words and a pattern, not color alone. You can see from the corridor which tools need a PM.

**Engine (`src/engine/`)**
- [x] `run.js`:
  - the PM stop in `walkCorridor` opens `state.pm = { corridor, choices, done: [] }`;
  - new `pmTool(state, roomId)` restores health to a seeded 75–95 (`PM_RESTORE_MIN`/`MAX`) and records `pmAt` (the SPC point count) on that tool. It refuses a room not ahead, a room without a monitored tool, a second PM at the same stop, or no PM stop open;
  - `enterStep` closes it, as it closes the shop.
- [x] `tools.js`: nothing new. Drift and wear already read `health`.
- [x] Bot: the random bot PMs the tool with the most rules tripped (ties broken by its own generator), or a random tool ahead if none trip.

**Content (`src/content/`)**
- [x] `balance.js`: `PM_RESTORES_TO = 100`, `PM_TOOLS_PER_STOP = 1`.
- [x] `sideStops.js`: PM / DOE is no longer a placeholder. The DOE half says "coming next".

**Screen (`src/ui/`)**
- [x] PM screen: tool cards with a small SPC chart (reusing spcChart.js), the verdict, and **PM this tool** buttons; a "PM done" state; Continue.
- [x] The room's SPC chart shows the PM mark.
- [x] Map: an SPC chip on bays whose tool trips a rule.

**Tests**
- [x] `run.test.js` / new `pm.test.js`: a PM restores 100; it refuses a tool behind the lot, metrology, a second PM, and no stop open; the stop closes on entering a room; the lot's `rngState` is untouched.
- [x] **Hand check:** scatter off, drift off (no wear), CMP starting at 60. With no PM, final yield is 0.517954 × 0.977312 (as in 2b). A PM on CMP at a stop before step 8 gives exactly **0.517954**, the healthy run, and +40 min of cycle time. The test uses the first seed from 123456 up that offers PM before CMP.
- [x] Screen tests at both sizes, including the map SPC chip; screenshots checked.
- [x] `code-explainer` on the diff and `playtester` before done. `physics-reviewer` only if PM effects beyond "health to 100" come up.

**Size:** engine, content and screen, about 300 lines with tests. This plan is the ask.

**Questions for David**
1. OK to split PM and DOE into two boxes?
2. Does PM restore a tool fully to 100?
3. Should a PM have a side effect? For example, the first lot after a chamber clean sees more particles while the chamber re-seasons. This is proposed as NEEDS NEW LOGIC for later, not now.
4. One PM per stop, any tool still ahead?
5. The SPC chip on the map's bays: yes or no?

**NEEDS NEW LOGIC (noted, not built):** post-PM seasoning effects; a PM that can fail (ties into O9, unexpected tool down); the metrology stop revealing tool health.

**After this item (M3, in order):** DOE upgrade (practice upgrades as data); three events with a tradeoff each; ship screen (yield against spec, cost per good die, cycle time; scrap and reject end states); save and resume (`SAVE_KEY`). Then M4, the notebook, which needs decision O1.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.
- 2026-10-25: David: split PM and DOE into two boxes (done in ROADMAP.md). A PM restores a tool to a random 75–95, not 100 (`PM_RESTORE_MIN`/`MAX`, drawn from the tools' generator). Side effects are noted for later. One PM per stop. Yes to the SPC chip.
- Engine built. Hand check, seed 123456: PM on CMP (starting at 60) in the corridor after step 2 draws health 84, a 0.8σ shift. Final yield = healthy × 0.999375, against × 0.977312 without the PM; +40 min. Passes as computed.
- Screen built: the PM screen (pmView.js, renderPm in floorPlan.js) shows a card per tool ahead with its SPC chart and verdict. The chart has a dotted PM mark, and the map has a red SPC chip with the word. On desktop the cards sit three to a row.
- From the screenshots: after a PM the etch chart still said "Out of control" from its old points. The rules now look only at lots measured since the last PM, as an engineer restarts the chart, and the verdict says "Just PM'd". The PM label no longer clips at the chart edge.
- code-explainer fixes:
  - a PM never lowers a tool already healthier than its roll (it keeps the higher; tested);
  - "75 and 95" on screen now comes from balance.js;
  - the "rules since the last PM" logic moved to the engine (`pointsSinceLastPm`), so the screen, the map chip and the bot agree;
  - a test for a monitored tool behind the lot;
  - plain if-statements for the verdict.
- playtester: pass. 157/157 tests; 45 bot runs with no errors (random bots PM 0–2 times a run); 26/26 screens, with nothing clipped or overflowing. Balance note for M7: still no bot run ships.

**Result:** a PM/DOE stop PMs one tool still ahead back to a seeded 75–95 health, never lowering it. Charts mark the PM and restart their rules, and the map flags tools whose chart trips a rule. `npm test` 159/159, `npm run screens` 26/26.

## Done: M3 item 2b — tool drift and wear, shown on SPC

(David, 25 Oct 2026: plan tool wear before the PM/DOE stop, as drift shown on SPC. An unexpected tool-down mechanic is wanted too, low chance but possible. It is designed later, once more of the framework exists: decision O9.)

### Task: every room's tool drifts and wears; SPC shows the drift before it bites

**The model, in fab terms (David to confirm; placeholders until M7)**
- Each room's tool has one **monitored parameter** with a target, a process sigma and a drift direction. Each one feeds one defect pattern the room already realizes:

  | Room | SPC parameter (proposed) | Drifts | Feeds pattern | Why |
  |---|---|---|---|---|
  | Wet clean | particle adders per wafer | up | particles | the bath loads up with contamination |
  | Deposition | particle adders per wafer | up | particles | film builds up on the chamber walls and flakes |
  | Litho | CD on the monitor wafer | up | cd_error | dose and focus drift |
  | Etch | etch rate | down | depth_variation | polymer builds up on the chamber walls (seasoning drift) |
  | Plating | fill (seam) inspection rate | up | void | the bath's additives break down |
  | CMP | removal rate | down | rr_drift | the pad glazes (matches fm_rr_drift: "walks steadily lot to lot on the SPC chart") |
  | Metrology | none | | | the gauge is the reference here |

- **Tool health → mean shift.** Health 100 means on target. Every `HEALTH_PER_SIGMA = 20` health lost shifts the mean by one sigma: health 80 = 1σ, 60 = 2σ, 40 = 3σ.
- **Shift → yield**, by process capability (textbook Cpk). Spec limits sit at ±4σ (`SPEC_LIMIT_SIGMA = 4`, a Cp 1.33 process). The fraction out of spec is P(δ) = Φ(−4−δ) + Φ(δ−4). The extra risk added to the pattern on entering the room is −ln[(1 − P(δ)) / (1 − P(0))]. That is zero for a healthy tool, so the yield factor is exactly (1 − P(δ)) / (1 − P(0)):

  | shift δ | health | yield factor in that room |
  |---|---|---|
  | 0 | 100 | 1 |
  | 1σ | 80 | 0.998713 |
  | 2σ | 60 | 0.977312 |
  | 2.5σ | 50 | 0.933252 |
  | 3σ | 40 | 0.841398 |

  So a small shift is cheap and a big one is expensive, as in a real fab.
- **Wear:** each time the lot runs a room, its tool loses `WEAR_PER_RUN = 5` health. The Cu line visits clean and deposition twice.
- **Starting health from the seed:** every tool starts a run at 50–100. That is the chaos: some runs begin with a tool overdue for PM. It is announced, because the SPC chart shows it from the first room.
- **Cards and equipment still act on the pattern.** Drift risk enters the pattern before items act, so the pad conditioner's ×0.4 on rr_drift also damps CMP drift, which is its physics.
- **Yield uses the true shift; SPC shows noisy measurements of it.** Laws are fixed and the situation is random (rule 4).

**SPC chart (the telegraph, rule 5)**
- Each tool has 12 points: 11 earlier lots plus this lot once it runs. Each point = target + (shift + noise) × sigma. The noise is a bell curve with spread 1, drawn from the tool's own seeded generator, so the lot's random numbers (`rngState`) are untouched. Earlier lots ran on a healthier tool (health + `WEAR_PER_RUN` per lot back, capped at 100), so the points walk towards the drift.
- Lines on the chart: centre (target), control limits ±3σ, spec limits ±4σ.
- **Western Electric rules**, flagged on the chart in words (proposed: these three):
  1. one point beyond 3σ;
  2. 2 of 3 in a row beyond 2σ on the same side;
  3. 8 in a row on one side of the centre.

  A small shift trips rule 3 first, then rule 2, then rule 1: an early warning that gets louder.

**Engine (`src/engine/`)**
- [x] New `src/engine/tools.js` (pure): `startingTools(seed)`, `driftShift(health)`, `outOfSpecFraction(shift)`, `driftRisk(health)`, `spcPoints(state, roomId)`, `spcRules(points)`; Φ by a standard textbook approximation (Abramowitz–Stegun 7.1.26, error under 1e-7).
- [x] `run.js`: `createRun` sets tools from the seed. `enterStep` adds the drift risk to the room's pattern. `resolveStep` wears the tool and records this lot's SPC point.
- [x] `createRun` option `toolDrift` (default on). Off, every tool stays at 100 and never wears, so drift adds nothing: the "hand-check mode", like `scatterStrength: 0`. The test helpers that turn scatter off also turn drift off. **No expected value changes**, but about 6 test setups change, and the assertion "tools start at 100" becomes "with drift off, tools start at 100". Option `startingHealth: { cmp: 60 }` lets a test fix one tool.

**Content (`src/content/`)**
- [x] `src/content/tools.js`: the table above as data (room, parameter name, unit, target, sigma, direction, pattern, tradeoff/physics note).
- [x] `balance.js`: `HEALTH_PER_SIGMA`, `SPEC_LIMIT_SIGMA`, `CONTROL_LIMIT_SIGMA = 3`, `WEAR_PER_RUN`, `STARTING_HEALTH_MIN = 50`, `SPC_HISTORY = 12`.

**Screen (`src/ui/`)**
- [x] In each room, an **SPC chart** (inline SVG drawn with tokens) takes the place of the "Tool health" meter. It shows the points, centre, control and spec lines, and the rules tripped in words ("8 in a row below centre: the removal rate is shifting").
- [x] Question for David: show the tool health number too, or only SPC? (Proposed: SPC only. Health becomes a hidden value the metrology stop can reveal later, as engineers read SPC, not a health bar.)
- [x] Screen tests at both sizes; screenshots checked.

**Tests**
- [x] `tests/tools.test.js`: Φ against table values; the yield-factor table above; rules on hand-made point lists (each rule trips, and does not trip just short); same seed → same starting health and points; the lot's `rngState` untouched.
- [x] **Hand check:** scatter off, nothing played, every tool at 100 except CMP at 60. The final yield is the all-at-100 run × **0.977312**, CMP's 2σ factor. rr_drift is an even pattern realized only at CMP, and the other tools wear identically in both runs.
- [x] Bot: no NaN; idle and random over seeds 1–50 still finish.
- [x] `physics-reviewer` on the model and the table, `code-explainer` on the diff, `playtester` before done.

**Size:** content, engine and screen folders, about 500 lines with tests: the biggest item yet. This plan is the ask. Three commits: engine and tests, the SPC screen, then docs.

**Not in this item (decision O9, NEEDS NEW LOGIC):** unexpected tool down; the PM/DOE stop that restores health (the next box); the metrology stop revealing health; the M6 amber lamp.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.
- 2026-10-25: David OK'd it: the table and model are fine for now (more detail later if needed); SPC only, no health number on screen; those three rules. Also settled: the Q-time failure mode says "via resistance" (changed in content.js).
- Engine built: tools.js, toolMonitors.js (named so it is not confused with tools/, the bot folder), the balance numbers. Hand check 0.977312 and the factor table pass as computed. The existing expected values are unchanged; their setups add `toolDrift: false`.
- The hand check runs with drift off and CMP fixed at 60, so no tool wears and the ratio is exactly CMP's 2σ factor.
- Screen built: spcView.js and spcChart.js are new files, so view.js stays under 400 lines. The SPC panel replaces the tool health meter. Seed 123456's etch tool starts at 73 and shows "8 in a row below the centre line" from the first visit.
- The verdict says the parameter "may be shifting": a healthy tool can trip a rule by chance (a false alarm), so the screen does not claim drift as a fact.
- physics-reviewer: the Cpk math, erf and the rules are correct; the physics notes are sound; all public. Fixed:
  - one-sided spec for particles and seams (no lower spec line, one tail in the yield math; one-sided factors 0.998682 / 0.977281 / 0.841371 at 1/2/3σ, tested);
  - fm_particles sig now points at the clean or deposition SPC chart;
  - fm_rr_drift sig now says removal rate, to match the chart;
  - litho note: focus and dose calibration drift;
  - sigma described as the parameter's spread;
  - the rule-numbering comment.
- Questions for David from it: etch rate drift feeds depth_variation (centre-to-edge), but a lower rate under a timed etch is more like residue across the whole wafer; "via resistance" may not fit a single-damascene trench that stops on SiN ("line resistance"?); should clean and deposition particles become two separate failure modes?
- code-explainer fixed:
  - `draft: true` on the monitors;
  - `el`/`panel` moved to `src/ui/dom.js`, ending the render.js ↔ spcChart.js import circle;
  - rules reported once per side, with named thresholds;
  - "Last lot measured" instead of "Latest lot".
- David, 25 Oct 2026: etch drift feeds residue, the Q-time sig says "line resistance", and particles are split into two modes. New pattern `flakes`, fed by deposition drift and realized at both deposition steps; new `fm_chamber_flakes`; new `fm_residue`, since rule 6 needs residue to be diagnosable. Both are drafts that unlock nothing yet. The route check in lotTypes.test.js now counts tool drift as a way a pattern enters. Realizing `flakes` draws scatter numbers, so seeds play slightly differently from before; no expected value changed.
- physics-reviewer on these: pass after two fixes (no invisible "larger defects" clue; fm_residue added). Asked David: native oxide under the barrier raises via or contact resistance more than line resistance, and this trench-only route has no via. Keep "line resistance", or add a via to the route later?
- - playtester: pass. 146/146 tests; 40 idle and random bot runs plus 4 full-deck runs with no errors; 22/22 screens; the chart is readable at both sizes. Balance note for M7: no bot run ships now (idle median about 47%), and the bots don't read SPC.

**Result:** every room's tool drifts and wears, starts each run at a seeded health, and costs yield by process capability. Each room shows an SPC chart with three Western Electric rules in words. `npm test` 149/149, `npm run screens` 22/22.

## Done: M3 item 2a — procurement stop: buy equipment and materials with cash

(M3 item 2 is split into three boxes in ROADMAP.md: procurement, PM/DOE, events. David, 25 Oct 2026.)

### Task: a procurement side stop that sells equipment and materials

**Content (`src/content/`)**
- [x] New `src/content/sideStops.js`: the side stops' names, short labels and one-line descriptions, moved out of `view.js` (`SIDE_STOP_INFO`). Data only.
- [x] `balance.js`:
  - `SHOP_OFFER_COUNT = 3`, the number of items one procurement stop offers.
  - `SHOP_SELLS_LOCKED_ITEMS = true`: until the notebook exists (M4), the shop sells every item, not only unlocked ones. M4 turns this off.

**Engine (`src/engine/`)**
- [x] New `src/engine/shop.js` (pure):
  - `shopStock(state, corridorIndex)` picks 3 items from equipment and materials, using its own generator: the seed mixed with the corridor number. So the lot's random numbers are untouched, and the same seed and the same purchases give the same stock.
  - Left out of the stock:
    - equipment you already own;
    - the material already in that slot;
    - items whose room isn't on this lot's route at all (for example the rapid thermal anneal tool, a diffusion room tool, on the Cu line).
- [x] `run.js`:
  - Taking the procurement stop in `walkCorridor` opens the shop: `state.shop = { stock, bought }`.
  - New `buyItem(state, itemId)`:
    - it pays `cost.cash`;
    - **equipment** is added to `state.equipment`, and from then on acts on entering its room, as it already does for loadout equipment;
    - a **material** replaces whatever is in its slot (`slotEntry`).
  - `buyItem` refuses an item not in stock, one already bought, or one you can't afford (cash may never go below 0 by buying; decision O4).
  - The shop closes when the lot enters the next room.
- [x] `tools/bot.js`: the random bot buys random items it can afford at a procurement stop. The idle bot never takes stops, so it never buys.

**Screen (`src/ui/`)**
- [x] A **procurement screen** after picking the stop:
  - cash at the top;
  - 3 item cards: name, kind (equipment or material), room, price, its `tradeoff` text, and where it next acts ("Next used at step 6: Deposition (barrier + seed)", or "Not used again on this route");
  - a **Buy** button, greyed out with the reason when you can't afford it;
  - **Continue to step N**.
- [x] The map's other three stops keep their placeholder.
- [x] Screen tests: open a procurement stop, buy something, see the cash drop and the item shown as bought, and see it in the room's Slots panel later.

**Tests**
- [x] `tests/shop.test.js`:
  - 3 items; none owned, none useless on this route; same seed → same stock; the lot's `rngState` is untouched;
  - buying pays the price, and refuses when not affordable, not in stock or already bought.
- [x] **Hand check** (scatter off, nothing played): buy the optical endpoint detector (600) at a procurement stop before etch.
  - Cash is 1500 − 600 = 900.
  - At etch, depth variation 0.08 × 0.7 = 0.056. So inner sites lose 0.015 less and outer sites 0.03 less: centre e^(−0.25), inner e^(−0.285), outer e^(−0.398125).
  - Yield after etch is **0.701607**, against 0.685321 without it.
  - Endpoint etch becomes legal in the etch room.
  - The test uses the first seed from 123456 up that offers procurement before etch with the detector in stock.
- [x] `physics-reviewer` is not needed: no content effect changes. `code-explainer` on the diff; `playtester` before done.

**Size:** content, engine and screen folders together, about 300 lines with tests. This plan is the ask (CLAUDE.md §3). Two commits: engine with tests, then screen.

**Decisions (David, 25 Oct 2026):**
- Split item 2 into three.
- The shop sells everything until M4.
- Equipment and materials only. Consumables get their own later item: they need an inventory and "use in a room".
- 3 items per stop, picked by the seed.

**NEEDS NEW LOGIC (noted, not built):** consumables (carry and use in a room); shelf life counting down; prices that change between stops.

**Acceptance criteria:**
- On the page, a procurement stop shows 3 items with prices and tradeoffs. Buying one takes the cash, and the item shows in its room's Slots panel when the lot gets there.
- The hand check above passes; `npm test` and `npm run screens` pass.

**Progress notes:**
- 2026-10-25: plan written; waiting for David's OK.
- 2026-10-25: David OK'd the plan ("Build"). Built in two commits: engine with tests, then the screen.
- The hand-check test searches from 123456 for a seed with procurement before etch selling the detector, then plays as planned: cash 900, depth variation 0.056, yield after etch 0.701607 against 0.685321, endpoint etch legal. All pass as computed.
- Seed 123456: the corridor after step 2 offers procurement, selling the pad conditioner, the DUV resist and the thick resist. The view and screen tests use it.
- The screen also says what a material would replace ("Replaces the i-line positive resist"), since a material swap is otherwise invisible until litho.
- A phone etch screen test broke because the map buttons got shorter (lessons.md). The walk-to-etch helper now waits out the double-click window.
- playtester: pass. 131/131 tests; 20 random-bot seeds and 4 full-deck seeds ran with no errors and never went below 0 cash; 22/22 screens, with no overflow and no sideways scroll.
- code-explainer: one must-fix. The shop could sell items for rooms the lot had already left (a resist after litho). The stock now only includes rooms still ahead, so a late shop may offer fewer than 3 (after CMP, only inline metrology). A new test covers it. Readability splits were also done in shop.js and floorPlan.js.
- The bot test asserted cash ≥ 0, but O4 lets running costs go below 0: seed 17 (random, full deck) ended at −20 after the pad conditioner charged at CMP. David chose to change the test. It now checks that cash is never below 0 right after a purchase.
- - view.js is now 384 lines, close to the ~400 split line. The map and shop views could move to their own file in M3 item 2b.

**Result:** a procurement stop opens a shop of up to 3 seeded items (equipment and materials) for rooms still ahead. Buying takes the cash, equipment acts in its room, and a material replaces its slot. `npm test` 132/132, `npm run screens` 22/22.

## Done: M3 item 1 — map of the Cu line route with side stops

### Task: the floor-plan map, corridors with side stops, and a walk through the whole route

**Engine (`src/engine/`)**
- [x] New `src/engine/map.js` (pure functions, no DOM):
  - `buildMap(seed, route)` makes one corridor after every route step except the last (8 corridors for the Cu line).
  - Each corridor offers 2 or 3 different side stops from the four kinds: metrology, PM/DOE, procurement, event.
  - The map is built from the seed alone, using its own generator (seed mixed with a fixed number, like the bot). So the map never uses up the lot's random numbers, and every existing seed keeps the same lot draws.
- [x] `run.js`:
  - `createRun` builds the map and puts it in the state, so the whole map is known and shown from the start (CLAUDE.md §5 rule 5: chaos is announced).
  - After a room resolves (and the lot is still running), the lot is **in a corridor**.
  - New `walkCorridor(state, stopKind)`: `stopKind` is one of that corridor's offers, or `null` to go straight on.
    - It adds the stop's minutes to cycle time and marks the stop as visited on the map.
    - In a **Q-time corridor** it also adds Q-time risk (below).
    - The stop does nothing else yet: its contents come in M3 item 2.
  - `enterStep` refuses to run while the lot is still standing in a corridor (an error naming the problem, like the other checks).
- [x] Q-time, as data:
  - In `lotTypes.js`, the "Resist strip + wet clean" step gets `qtime: 'qtime_oxide'`. That means waiting in the corridor after this step grows that pattern.
  - `walkCorridor` adds `QTIME_RISK_PER_MINUTE × the stop's minutes` to that pattern's risk.
  - Going straight on adds nothing beyond the 0.04 the route already adds.
- [x] `balance.js`:
  - `SIDE_STOP_MINUTES = { metrology: 20, pm: 40, procurement: 10, event: 10 }`.
  - `QTIME_RISK_PER_MINUTE = 0.001`, so a 40-minute PM stop doubles the Q-time oxide (0.04 → 0.08). Placeholder, tuned in M7.
- [x] `tools/bot.js`:
  - The idle bot always goes straight on.
  - The random bot picks a random offer or straight on, from its own generator.

**Screen (`src/ui/`)**
- [x] A **corridor screen** between rooms:
  - The floor plan: the 9 process bays drawn in route order as a snake of flat tiles, each in its room color. Done bays, the current position and the next bay are marked by more than color: a tick, an outline, a "you are here" label.
  - The side-stop alcoves along each corridor, with their kinds written out.
  - Below the plan: one button per offer, with name and minutes; the Q-time warning when it applies; and **Go straight to step N: label**.
  - Flat and simple for now. The toy-diorama look comes in M6.
- [x] The run starts on this map: "Enter step 1: Wet clean". It then plays the whole route: room → Run → result → **Continue** → corridor → next room …
- [x] After the last room: the result screen says shipped or rejected, with Replay and New seed. The real ship screen is M3 item 3.

**Tests**
- [x] `tests/map.test.js`:
  - 8 corridors, each with 2–3 different known kinds, the same for the same seed and different across seeds.
  - Building the map doesn't change `rngState`.
- [x] `tests/run.test.js`:
  - `walkCorridor` adds the right minutes, refuses a kind that isn't offered, and refuses when not in a corridor; `enterStep` refuses inside a corridor.
  - **Hand check:** seed 123456, scatter off, idle, going straight on everywhere gives the same final yield as today. Taking PM/DOE in the Q-time corridor instead gives that yield × e^(−0.04) = × **0.960789** (qtime_oxide 0.08 instead of 0.04, even pattern, weight 1 at every site), and +40 min of cycle time. If PM isn't offered there for this seed, the test picks a seed where it is.
- [x] Existing tests and the screen tests: their helpers that walk the route add a "go straight on" between rooms. No expected value changes. `etch.spec.js` reaches etch through the map.
- [x] Screen tests for the corridor at both sizes; screenshots checked by eye.
- [x] `physics-reviewer` on the Q-time rule; `code-explainer` on the diff; `playtester` before done.

**Size:** this touches `src/engine/`, `src/ui/` and `src/content/` together, probably 300–400 lines including tests. CLAUDE.md §3 says to ask before more than ~100 lines or more than one folder; **this plan is that ask.** I'll commit in steps: engine and tests first, then the screen.

**Decisions (David, 25 Oct 2026):**
- Skipping is allowed (go straight on, no extra time).
- Side-stop minutes: metrology 20, PM/DOE 40, procurement 10, event 10.
- Q-time grows with time spent in the Q-time corridor, built now.
- Side stops are placeholders in this item.
- O3 settled earlier today.

**Acceptance criteria:**
- The page starts on the floor-plan map for the seed and walks the whole Cu line: 9 rooms, 8 corridors, each corridor offering 2–3 stops or straight on, and the run ends shipped or rejected.
- A PM stop in the Q-time corridor costs 40 min and lowers final yield by the hand-checked factor.
- Same seed → same map → same run. `npm test` and `npm run screens` pass.

**Progress notes:**
- 2026-10-25: plan OK'd by David; built in two commits (engine, then screen).
- Seed 123456's Q-time corridor offers metrology and event, not PM, so the hand-check test uses the first seed from 123456 up that offers PM (123458). With scatter off the yield doesn't depend on the seed; the ratio is 0.960789 as computed.
- physics-reviewer: pass. Linear oxide growth is a fair first-order simplification at these small waits (most a stop can add is 0.04); an even pattern is reasonable. Its suggestions were done in the screen: the Q-time corridor is marked on the plan (QT), and the warning says "the lot waits". Two wording questions went to David.
- Screen: the first side-stop button showed a focus ring after a screen change, which looked pre-selected. New screens now focus the title instead.
- code-explainer fixes:
  - the side-stop screen test now checks the exact minutes;
  - fading on done bays and walked corridors removed (it dropped text below 4.5:1); they are marked by a "Done" word and solid or dashed edges instead;
  - 2–3 offers moved to `balance.js`;
  - a small Q-time helper in `view.js`, and a plain-words comment on the seed mixing.
- Left for M3 item 2: move the side-stop names and descriptions (`SIDE_STOP_INFO` in `view.js`) into `src/content/` when the stops become real entries.
- Known behavior: two taps at the same spot within about half a second count as a double click even across a screen change, so the second is ignored. The screen tests wait out that window.

**Result:** the page plays the whole Cu line: floor plan, 9 rooms, 8 corridors with side stops (placeholders) or straight on, Q-time growth in the Q-time corridor. `npm test` 118/118, `npm run screens` 18/18.

## Done: M2 item 3 — Playwright set up; screenshots at 1280×800 and 375×812

### Task: screen tests and screenshots with Playwright
- [x] Add `@playwright/test` as a **dev dependency** (pre-approved in CLAUDE.md §2), pinned to exactly `1.63.0`, the version whose browser is already installed here. Commit `package-lock.json`. It is only for checking the screen. The game itself still loads nothing from npm.
- [x] `npm test` stays as it is: Node only, no install needed. A new `npm run screens` runs the screen tests.
- [x] `playwright.config.js` (repo root):
  - It starts `python3 -m http.server 8000` by itself.
  - It runs every test at two sizes: **desktop** 1280×800, and **phone** with an explicit 375×812, touch on. No device-preset names (lesson: a wrong preset name silently gave desktop size).
  - Chromium only.
- [x] `tests/screens/etch.spec.js`, seed 123456, at both sizes:
  - The etch room loads with no console errors and no sideways scroll.
  - A tap on timed over-etch leaves 4 of 8 min, the hand empties, and Run etch is still there.
  - **Run etch** shows the result screen. **Replay this seed** brings back the same starting numbers (same expected-loss line as the first load).
  - A fast double tap on the card plays it once and does **not** run etch.
  - Screenshots at each stage go to `screenshots/desktop/` and `screenshots/phone/`. The test checks each image's pixel width (1280 or 375) before anyone looks at it (lesson).
- [x] Screenshots are files for looking at, not compared pixel by pixel against saved ones. Fonts render differently from machine to machine, and that would make tests fail for no reason. `screenshots/` is already in `.gitignore`, so they aren't committed.
- [x] CLAUDE.md §11: one line saying `npm run screens` runs the screen tests. On a new computer it needs `npm install` and `npx playwright install chromium` first.
- [x] Run it, look at every screenshot, then run `playtester`. Commit.

No game code changes.

**Decisions settled:** none needed.

**Acceptance criteria:**
- `npm run screens` passes: 2 sizes × the checks above, and every screenshot has the right width.
- `npm test` still passes with no `node_modules` present.
- The tap and Run etch buttons are now tested automatically, not only by eye.

**Progress notes:**
- 2026-10-25: plan OK'd by David; built.
- The phone double-tap test first failed because a raw tap landed below the screen (test bug, lesson added).
- With the double-click guard switched off, the desktop double-tap test fails, as it should. On the phone the card wraps taller, so Run etch lands below the tap and can't be hit by a double tap there.
- `npm test` checked with `node_modules` moved away: 102/102. (A folder renamed `node_modules.off` gets scanned by `node --test`; only the exact name `node_modules` is skipped.)
- Screenshots at 1280 and 375 checked by eye: room, after a tap, result. Nothing broken.

**Result:** `npm run screens`: 8 of 8 pass (4 checks × 2 sizes). `npm test`: 102 of 102.

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
