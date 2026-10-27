# Fab Run — Task Tracker

## Planned: M4.5 item 4 — SPC flags that predict, and a flagged tool that costs more (issue 4, claim 9)

**Status: PLAN for David's OK (27 Oct 2026). No code is changed until you say yes. Questions Q1–Q3 are at the end.**

**Your calls already made (26 Oct 2026):** add the trend rule, 6 points in a row steadily rising or falling. Name verdicts by rule; one point past a limit is an excursion, not a shift.

### What the players hit (Lane F issue 4)
- A flagged wet clean cost 0.9 points, no more than a healthy one; an unflagged CMP cost 8.2. PM on a flagged tool "saved nothing measurable". Players learned to ignore red flags.
- A single spike is called a shift ("the etch rate may be shifting"), most flags don't name the rule, and the chart has no numbers on its axis.
- An audit "serviced" the wet clean, but its chart still read out of control.

### What I measured (3000 seeds, every monitored tool at the start of a run)
| Tool health | Drift cost in its room | Chart flagged |
|---|---|---|
| 90s | 0.0 points | 6% |
| 80s | 0.1 | 8% |
| 70s | 0.6 | 13% |
| 60s | 2.3 | 35% |
| 50s | 6.7 | 69% |

- **The flags already predict, on average.** A flagged tool costs 2.84 points of drift, against 0.65 for an unflagged one (4×), and a PM on a flagged tool saves 2.8 on average.
- **The player can't see it.** A room's total is mostly its own process risks (CMP's 8.2 is dishing and removal, not drift), so a 2-point drift share disappears inside it. A flagged wet clean whose drift costs 0.3 looks the same as a healthy one.
- **About 1 in 12 healthy tools is flagged anyway** (one point past 3σ, 2 of 3 past 2σ, or 8 in a row: ordinary false alarms over 11 points). That is real SPC, but the verdict calls every one of them a shift.
- The trend rule adds about 1.5% more flags (noise is large next to 5 health per lot, so 6 steadily rising points are rare). It adds little detection, but it names what an engineer looks for.

### The plan (Lane A: `tools.js`, `spcView.js`, `spcChart.js`, `view.js`, `render.js`)
1. **Trend rule** (`tools.js` `spcRules`): 6 points in a row each higher than the last, or each lower. Hand-made point lists in the tests, including 5 rising (no flag) and a run broken by a tie.
2. **Verdicts by rule** (`spcView.js`). The rule lines stay under the verdict; the verdict names the worst finding:
   - only a point past the control limit: "**Excursion**: one lot measured past the control limit. One point can be a bad measurement or a one-off; watch the next lot."
   - 2 of 3 past 2σ, or 8 on one side: "**Shift**: the etch rate has moved off centre. A shifted tool costs yield in this room until it is PM'd."
   - 6 steadily rising or falling: "**Trend**: the etch rate is moving lot by lot. It will cost more yield the further it goes."
   - Shift with a trend says both. No rule: "In control: …" as today.
3. **Numbers on the chart axis** (`spcChart.js`): the centre, control and spec lines get their values at the left edge (e.g. "300", "324", "332"), so a point can be read without the line of text below. Lane D may restyle it later.
4. **Show what the drift cost, after the room runs** (`view.js` `resultView`, `render.js`): "Of this, about 2.3 points came from the etch tool's drift (see its SPC chart)." Left out under 0.05. The engine notes the drift risk added on entering (`room.driftRisk`, beside `room.itemCash`), and the result splits that pattern's loss in proportion: a card that scales the pattern scales both parts alike, so the share holds. This keeps tool health hidden before you decide (you read the chart), and tells you afterwards whether the chart was right. Hand check: seed 123456, scatter off, etch tool fixed at health 60, nothing played: drift risk −ln(in-spec at 2σ ÷ in-spec on target) = 0.02295, worked by hand in the tracker before the test is written.
5. **A service restarts the chart** (Q2): a `toolHealth` effect that raises health (the audit's bath change, a spare part) puts a service mark on the chart, like a PM, so the rules look only at lots run since. The verdict before the next lot reads "Just serviced: no lots measured since yet." (today's PM text, reworded for both).

### Tests and checks
- Hand-made SPC point lists for the trend rule and each verdict; the result share hand-checked; the audit test checks the mark.
- Screen tests: the SPC panel's verdict and axis labels at both sizes, `--repeat-each=5` on the phone.
- `SAVE_VERSION` 6 if Q2 is yes (a service now adds a mark, so a saved run's chart would differ); no yield value changes in any existing test.
- `physics-reviewer` on the verdict texts; `npm test`, `npm run screens`, the bot.

**Q1 (should a flagged tool cost more than today?)** On average it already costs 4× an unflagged one, so I think the fix is to *show* it (step 4), not to change the numbers. A) keep the ±4σ spec limits (Cp 1.33) and show the drift cost after each room (my recommendation; balance waits for M7). B) also tighten the spec to ±3.5σ (Cp 1.17): drift at health 60 costs 6.6 points instead of 2.3, a flagged tool 7.5 on average, a PM saves 7.3, and a tool that starts at 50 costs 15.8 in its room. Runs get harder; the idle run's 58.5% would fall.

**Q2 (service marks).** Should a service by an item or event (the audit's +15 bath change) restart the chart like a PM? I'd say yes: the engineer would note the bath change and judge the next lots on their own. It changes what the existing `toolHealth` operation does (adds a mark), so it is a small engine change. If no, the audit's wording (Lane C) should say the chart will clear only as new lots come in.

**Q3 (wording).** Are "Excursion", "Shift" and "Trend", with the sentences above, the words you'd use on the floor?

---

## Done: M4.5 item 3 — etch-stop logic (claim 11), and the etch forecast says what is carried in

**Status: built 26 Oct 2026. David's answers: Q1 ×0.3; Q2 B (the stop card stays unlocked by the notebook, not a starter card); Q3 make the wording clearer.**

**What was built**
- `run.js`: a route step may carry `effects`, applied right after its risks enter (about 5 lines). `lotTypes.js`: etch has "underlayer attack ×0.3 with etch stop"; step 2 reads "Deposition (oxide)".
- `content.js` (told Lane C): over-etch's stop line ×0.5 → ×0.7, the DOE version ×0.5 → ×0.84 (both ×1.05 net on a stop); the two cards' texts.
- Forecast wording, made plainer than the plan: "About 6.8 of these points come from depth variation (etch depth differs center to edge). The film stack set how big this is before the lot got here: without an etch stop, trench depth follows the etch rate across the wafer." Each pattern's reason is data (`startRiskNotes` in `lotTypes.js`); CMP's says "The layout set how big this is: wide lines dish in any polish. Dummy fill at litho or a gentler polish here reduces it." Shown under the forecast (`.carried-in`); left out under 0.05 points. My first wording ("brought in from earlier steps; not added in this room") was false and `physics-reviewer` caught it (lesson added); the reviewer suggested these sentences, **for David to confirm**.
- Physics-review text fixes: DOE over-etch says it is the same as the plain card on a stop; the Cu line's physicsNote and `docs/process-primer.md` say the stop is optional.
- Hand checks (independent python model, seed 123456, scatter and drift off): stop + nothing 10.6861 points, yield after 0.834904; stop + over-etch 8.3540, 0.858225 (the DOE version gives the same); carried in 6.8 (no stop) and 2.8 (stop). Test value 0.075 → 0.105 as in the plan. `lotTypes.test.js` checks step effects.
- `SAVE_VERSION` 5.
- Checks: `npm test` 257/257, `npm run screens` 78/78 (etch spec 5 runs in a row), idle bot unchanged (58.5%, rejected), phone etch screenshot checked.

**Original plan below.**


**David's decision (26 Oct 2026):** the stop is a choice. The route label becomes "Deposition (oxide)", and the Etch-stop card adds the SiN stop. With the stop, etch adds much less underlayer attack, and over-etch on a stop is about ×1.05. The etch forecast says how much of its loss is carried in from the film stack.

### What it is today (the claim 11 defects)
- The route says "Deposition (SiN + oxide)", but only the "Deposit SiN etch stop" card sets the `etch_stop` flag.
- The stop does **nothing** to the base underlayer attack. Etch adds 0.03 attack whether or not the stop is there. Only the over-etch card looks at the flag.
- Timed over-etch multiplies attack by ×1.5, then ×0.5 more with a stop: **×0.75 net**, so etching longer on a stop *lowers* attack, which is backwards. The DOE version does the same (×1.25 × 0.5 = ×0.625).
- No engine path lets a choice made in one room (deposition) scale a risk that only enters later (at etch). That is the "new logic" the reviewer flagged.

### The engine change (small; this is the part that needs your OK, CLAUDE.md §6)
A route step in `lotTypes.js` gets an optional `effects` list. These are ordinary content effects, from the existing list of operations. `enterStep` applies them right after the step's own risks enter, and before drift, equipment and cards. Each effect's `when` is checked as for any card.

```
{ room: 'etch', label: 'Etch (trench)',
  adds: { particles: 0.01, residue: 0.04, underlayer_attack: 0.03, edge_ring: 0.03 },
  // An etch stop below the oxide: the etch reaches the nitride and slows
  // almost to a halt, so it attacks far less of the film below.
  effects: [ { op: 'defectMult', pattern: 'underlayer_attack', mult: 0.3, when: { flag: 'etch_stop' } } ],
  realizes: [...] }
```

- **No new effect operation**: it reuses `defectMult` and `when: { flag }`, which already exist. The only new thing is that a *route step* may carry effects, which is about 5 lines in `run.js` and one in the comment at the top of `lotTypes.js`.
- `tests/lotTypes.test.js` checks that every step effect uses a known operation and a known pattern.

### Content changes (Lane C's file; I make only these and tell Lane C)
- `lotTypes.js` step 2 label: "Deposition (SiN + oxide)" → **"Deposition (oxide)"**.
- `timedOveretch`: the etch-stop line goes ×0.5 → **×0.7**, so the net on a stop is ×1.5 × 0.7 = **×1.05**. It stays ×1.5 without a stop. The DOE version goes ×0.5 → **×0.84**, so ×1.25 × 0.84 = **×1.05** on a stop too. Its text "unless an etch stop is there" becomes "much less if an etch stop is there".
- `etchStopLayer` text: its tradeoff and physicsNote mention that the stop also protects the film below.
- `physics-reviewer` checks all of it before I call it done.

### What the numbers do (hand-computed, seed 123456, scatter and drift off; I reproduced today's values exactly first)

| At etch | Today | After |
|---|---|---|
| No stop, nothing played | 16.20 points lost | 16.20 (unchanged) |
| No stop, timed over-etch | 15.18 | 15.18 (unchanged) |
| With stop, nothing played | 12.42 (the stop only cut depth ×0.4) | **10.69** (attack 0.03 → 0.009 as well) |
| With stop, timed over-etch | 9.47 (×0.75 on 0.03) | **8.35** (0.009 × 1.05) |

- **Every test on a run without the stop keeps its values**, and that is most of them, including the idle run. The one test that checks the ×0.75 (`resolve.test.js`, "0.075 with it") changes to 0.105 (0.1 × 1.5 × 0.7). I'll show it to you before editing.
- **Side effect worth knowing:** without a stop, underlayer attack on a healthy etch is 2.96 points, just under the 3-point diagnosis line (`DIAGNOSE_MIN_POINTS`). So "Underlayer attack" counts as a right answer only after an over-etch (4.4 points) or on a worn tool. That is the physics the reviewer asked for (claim 11b: it used to be "right" on every run).

### The etch forecast split (David: "label it")
- *Today:* "This room will cost about 16.2 points of yield if nothing changes."
- *After:* "This room will cost about 16.2 points of yield if nothing changes. About 6.8 of them come from etch depth variation set before this room (the film stack)." Figures for seed 123456; the depth share is worked out by the existing per-pattern split in `lot.js`.
- Which patterns count as "set before this room" comes from data: the lot type's `startRisks` (depth variation and dishing, set by the stack and the layout). So CMP's forecast says the same about dishing. The text names the pattern from `PATTERNS`.
- If the carried-in share is under 0.05 points (for example, the stop cut it), the extra sentence is left out.

### Steps
- [ ] `run.js`: route step `effects`, applied after the step's risks. Engine test: with the flag, etch's attack is 0.009; without it, 0.03.
- [ ] `lotTypes.js`: the label and the etch step's effect. `content.js`: the two over-etch numbers and the text. `lotTypes.test.js`: step effects are valid.
- [ ] Hand-checked tests from the table above; `resolve.test.js` value per Q-approval.
- [ ] `view.js`: the forecast's carried-in sentence; a hand-checked test (6.81 of 16.20 on seed 123456).
- [ ] `SAVE_VERSION` 4 → 5 (a run with the stop would replay to a different yield).
- [ ] `physics-reviewer`; `npm test`, `npm run screens`, the bot; tracker, roadmap, lessons; tell Lane C about the `content.js` lines touched.

**Q1 (how much the stop protects).** ×0.3 on underlayer attack (a selective nitride stop cuts the attack to about a third)? Or a different factor? This is your physics call.

**Q2 (who can choose the stop).** Today the stop card is **not a starter card**: it is unlocked by diagnosing underlayer attack, which (see above) needs an over-etch first. Options: A) make "Deposit SiN etch stop" a starter card now, so the deposition room has a real decision from the first run (my recommendation; it is exactly the starter-deck decision you made, and it gives the dep room its card); B) leave it unlocked by the notebook, and let Lane C choose the dep room's starter card. Note: A changes the starter deck, so seed 123456's deposition rooms deal a card; tests that walk deposition doing nothing are unaffected, but tests that list the starter deck or DOE offers change (deck text only, no yield value).

**Q3 (forecast wording).** Is "About 6.8 of them come from etch depth variation set before this room (the film stack)." clear for a new player, or do you want other words?

---

## Done: M4.5 item 8 (part) — the small fixes (Lane F issues 8 labels, 9, 10, 13, 14, 15; 16 moved to its own item)

**Status: built 26 Oct 2026. David took the recommendations: Q1 round to nearest and relabel; Q2 A (leave the score for M7, only reword the cost tile); Q3 the glossary becomes its own roadmap item ("Words page").**

**What was built (one commit each)**
1. **Cash (issue 9).** The cash is taken when the lot *enters* the room (equipment acts on entering), so the note sits on the room screen, not the result as the plan said: "On entering, In-situ pad conditioner took 20 cash." under the room header. `run.js` `enterStep` notes each item's cash change in `room.itemCash` (a small engine change: two folders touched, about 10 lines). Hand check: with the pad conditioner, 1480 cash on entering CMP and that note; no note in earlier rooms.
2. **Bad seeds (issue 15).** `view.js` `badSeedText` and `render.js` `renderSeedNote`: '"abc" is not a seed (a whole number from 0 to 4294967295), so this is seed N.' Long values are cut at 20 characters. New screen test `seed.spec.js`. While checking its screenshot I found the floor-plan legend still listed "MET Metrology" (my miss in item 5); it now lists only the stops the map offers.
3. **Risk units (issue 10).** `effectsText.js` `riskText`: "+0.02 risk (about 2.0 points of yield): …", used by events and by `addRisk` effects. Hand checks: 0.02 → 1.98, 0.03 → 2.96, 0.04 → 3.92, 0.010 → 0.995.
4. **PM labels (issue 8).** Buttons read "PM the Etch tool". Before any choice the stop's exit reads "Leave without a PM or DOE: on to step 3, Litho (trench)", then "Continue to step 3: Litho (trench)".
5. **Wafer map (Q1).** Tiles round to the nearest percent and the legend reads "Each site: % of this die position expected good across the lot." The band still follows the printed number. Test values changed with David's OK: 0.8999 now prints 90 (pass, was 89 warn) and 0.6999 prints 70 (warn, was 69 fail); two new values cover 89 and 69.
6. **Cost tile (Q2 A).** It adds "For reference only: shipping at spec is what wins the run."
7. **Glossary (Q3).** Added to `ROADMAP.md` as its own M4.5 item.

**Checks:** `npm test` 250/250, `npm run screens` 78/78, the PM, seed and etch phone tests passed 5 runs in a row. I checked the screenshots: the room result and ship report on the phone, and the bad-seed note. No save version bump: no saved action or engine rule changed (`room.itemCash` is rebuilt on replay).

**Not done here:** phone layout (17) and the run-ending button spacing (8) are Lane D's, so the roadmap line stays open.

**Original plan below.**

Roadmap line: "Phone layout and run-ending buttons (issues 8, 17); small fixes (issues 9, 10, 13, 14, 15, 16)". The phone layout (17) and the spacing of run-ending buttons (8) are Lane D's look-and-feel work, so they are **not** in this plan. This plan is the Lane A part: words, numbers and messages. All of it is in `src/ui/` except where noted. No engine rule, no balance number and no saved action changes, so **no save version bump**.

### Fixes with no question (I build these on your OK)

**1. Cash that changes with no message (issue 9).**
- *Today:* the pad conditioner takes 20 cash every time the lot enters CMP (its `cashCost` effect). Nothing says so; the student saw 950 turn into 930.
- *Fix:* the room result says what the room cost in cash, and why: "Cash 950 → 930: In-situ pad conditioner −20." `resultView` compares cash before and after the room and names the equipment and material in that room that have a cash effect. A room with no cash change shows nothing new.
- *Tests:* hand check with the pad conditioner bought (scatter off): CMP result reads exactly that line; a room with no cash change has no cash line.

**2. A seed in the address that isn't a seed (issue 15).**
- *Today:* `?seed=abc`, `-5` or a 20-digit number silently start a random seed from the clock. The min-maxer used it as a free reroll; a player sharing a bad link never knows.
- *Fix:* the game still starts a fresh seed (there is no other sensible choice), but the first screen says so: "'abc' is not a seed (a whole number from 0 to 4294967295), so this is seed 1234567." The note sits where "Resumed seed …" sits today. A good seed or no seed shows nothing new.
- *Tests:* `parseSeed` cases already exist; add the note text for `abc`, `-5`, `1.5`, `99999999999`, and no note for `123456` or no seed. A screen test opens `?seed=abc` at both sizes.

**3. Risk numbers with no unit (issue 10, first half).**
- *Today:* an event says "+0.02 risk: random dots across the wafer". "Risk" is our exponent, which no player knows.
- *Fix:* say it in yield points too: "+0.02 risk (about 2.0 points of yield): random dots across the wafer". Points = 100 × (1 − e^−risk), worked out by the same rule as yield. It is the share of the lot, since even patterns hit every site alike; a shaped pattern (edge ring) is said the same way, which is right on average. Used in `eventView.js` and in `effectsText.js` (`addRisk`), so one helper.
- *Tests:* hand-computed: 0.02 → 1.98 → "about 2.0 points", 0.04 → 3.92 → "about 3.9 points".

**4. Six PM buttons that all say "PM this tool" (issue 8, label part).**
- *Today:* every PM button reads "PM this tool", with the tool name far above it. The min-maxer serviced litho instead of etch.
- *Fix:* the button reads "PM the Etch tool" (its screen-reader label already says that). The Continue button on a PM/DOE stop where nothing was chosen reads "Leave without a PM or DOE" so it is clear the 40 minutes are spent either way. That cost stays: taking the stop takes the tool time (decision O3).
- *Tests:* the PM screen tests find buttons by these names.

### Fixes that need your call

**5. Wafer map rounding and label (issues 13 and 10, second half; review claim 10).**
- *Today:* each tile rounds **down** (89.7 reads 89), so the map always reads lower than the headline yield (thirteen 99s and twelve 98s under a 99.1% headline). The label says "% of the 25 wafers still good there", but the number is an expected good fraction at that die position, not a count of wafers.
- *Proposed:* round to the nearest whole percent, and relabel "Each site: % of this die position expected good across the lot." The band (pass, warning, fail) still comes from the printed number, so a tile's number and colour always agree.
- The square 5×5 map stays for now. A round 21-site mask is your separate open call (claim 10) and Lane D's to draw.

**6. Buying makes the score worse, and rejected lots are not paid (issue 14).**
- *Today:* the ship report's score is cost per good die = (2000 + cash spent) ÷ good die. A 300-cash item has to raise yield by about 15% of what it is to pay for itself, so the rational move is to buy nothing. A rejected lot still shows a cost per die, with "Not paid".
- *This is an economy design question, not a small fix.* Options: A) leave it for the M7 balance pass, and only reword the tile so it doesn't read as the score (my recommendation: M4.5's exit test is about shipping, and the item prices are placeholders anyway); B) change the score now (for example to profit: a price per good die on a shipped lot, minus the lot cost), which is new balance numbers and needs your price.

**7. Nothing explains the words (issue 16).**
- *Today:* lot, PM, DOE, CMP, CD and SPC are never spelled out. The student listed 36 terms.
- *Proposed:* a **Words** page, opened like the Notebook page (a button in the floor plan and room headers), listing about 15 terms in one or two plain sentences each. The words would be data in a new `src/content/glossary.js` with `draft: true`, written by `content-drafter` and checked by `physics-reviewer`, then reviewed by you. That is Lane C content plus a Lane A page, so it is bigger than the others.

**Steps (after your OK)**
- [ ] Fixes 1–4, each with its tests, one commit each.
- [ ] Fixes 5–7 as you decide.
- [ ] `npm test`, `npm run screens` (the phone tests touched `--repeat-each=5`), the bot; screenshots checked.
- [ ] Tracker, roadmap box only if the whole line is done (it isn't: 17 and the button spacing are Lane D's), lessons.

**Q1 (map).** Round to nearest and relabel, as proposed?
**Q2 (score).** A (leave the score for M7, only reword) or B (change it now: then what does a good die sell for)?
**Q3 (glossary).** Build the Words page in this item, or make it its own item later?

---

## Done: M4.5 item 5 — show effects before you commit (issue 6); placeholders stop charging for nothing (issue 5)

**Status: built 26 Oct 2026. David took the recommendation on all three: Q1 show the points preview, Q2 A (metrology not offered until built), Q3 A (measure all not dealt until something is hidden).**

**What was built**
- `src/ui/effectsText.js` (new): every effect operation in plain words. `pmView.js` now uses it, and the DOE screen text is unchanged (its tests pass as they were).
- `view.js`: a card in the hand has `effectsText`, and a playable one has `pointsChange` and `pointsText` ("About 1.0 point less lost in this room."). Shop items have `effectsText`. `render.js`, `floorPlan.js` and `room.css` draw them in dark text (`--ink`), with no new colours.
- `map.js`: `SIDE_STOP_KINDS` leaves out any stop marked `placeholder` in `sideStops.js`, so metrology is never offered. A corridor now offers 2 or 3 of PM, procurement and event.
- `run.js`: `NOT_DEALT_YET = ['measureAll']`, kept out of the starter deck and `runDeck`. The card stays in `content.js` and in `fullPool()`, and it still works when a deck holds it (its tests give it one).
- `render.js`: removed "(Unlocks start to count in a later update.)" from the ship report.
- `SAVE_VERSION` 3 → 4 (`fabrun.run.v4`).

**Tests changed, and why (no expected yield or cash value changed)**
- The starter deck is now `['timedOveretch', 'reworkLitho']` (`run.test.js`), and the DOE offers on seed 123456 are `['timedOveretch', 'reworkLitho']` (`doe.test.js`). After CMP nothing is offered, since no dealt card is for metrology. Both follow directly from Q3.
- The `measureAll` tests and the illegal-card test now give the card a deck explicitly.
- `map.test.js`: the kinds test now says "only the built stops are offered", plus a new test: no metrology over 100 seeds.
- `storage.test.js` `takeEveryStop`: it now turns its preference (PM, procurement, event) with the corridor number. Every corridor now offers PM or an event, so the old "PM first" never shopped, and no seed bought anything.
- `saves.spec.js`: the "reload at a quiet stop" test used the metrology stop. It now uses the quiet event after CMP (no event matters that late).
- New: `tests/effectsText.test.js`, four `view.test.js` tests (hand check: over-etch saves 16.1976 − 15.1772 = 1.0204 points), and the etch screen checks the effects and points lines.

- `map.spec.js` "taking a side stop costs its minutes": it expected the placeholder text "comes in the next update". Seed 123456's first stop is now PM, so it checks only that the stop screen states its cost.

**Checks:** `npm test` 243/243, `npm run screens` 74/74, the etch and shop phone tests passed 5 runs in a row, and the bot ran clean on 200 runs (no metrology stop taken). I checked the screenshots: the etch room at both sizes and the phone shop show the new lines in dark text, with no sideways scroll.

**Noticed, not fixed (outside this item)**
- A DOE can be offered on "Strip and re-expose", which is never playable today, because nothing sets `lastStepWasLitho`. A DOE on it is 100 cash for nothing. This goes with the "decision in every room" item.
- The `floorPlan.js` "(coming in a later update)" text for placeholder stops can no longer show. I kept it for when a stop is marked placeholder again.

**Original plan below.**

This is the next M4.5 item that does not wait on a physics call from David. (Items 3 etch-stop and 7 starter deck wait on your answers; item 1 waits for PR #23.)

### Part A — show what a card or item does, before you commit (Lane F issue 6)

**What it is today**
- A card in the hand shows its name, minutes, cash and its `tradeoff` sentence. A shop item shows its price and `tradeoff`. Neither shows its numbers.
- The numbers exist only on the DOE screen (`pmView.js` `recipeText`, e.g. "4 min · residue ×0.3 · underlayer attack ×1.5"), and that helper only knows `defectMult`.
- Players priced items by replaying whole runs (the min-maxer measured the copper bath at about 4 points for 200 cash).

**What you'll see after this part**
- Under each card's tradeoff, one effects line, e.g. **"residue ×0.3 · underlayer attack ×1.5 (×0.5 with an etch stop)"**.
- On a playable card in the hand, also **"About 1.0 point less lost in this room"** (or "more"). It is worked out the same way as the existing "This room will cost about X" forecast, which the personas found accurate: play the card on a copy of the lot and compare.
- On each shop item, the same effects line, plus which room it acts in.

**Steps**
- [ ] New `src/ui/effectsText.js`: one effect in plain words, for every operation the content uses: `defectMult` ("residue ×0.3"), `setFlag` ("sets an etch stop"), `enables` ("lets you play Endpoint etch"), `reveal`, `timeCost`, `cashCost`, `toolHealth` (said as "services the tool", never a number, as David chose for events), `decayPerUse`, `addRisk`. An unknown operation shows its own name, so nothing is invented.
- [ ] `pmView.js` uses the shared helper instead of its own `recipeText`. The DOE screen's text stays identical (its tests prove it).
- [ ] `view.js`: `cardView` gets `effectsText` and `pointsChange`; `shopItemView` gets `effectsText`.
- [ ] `render.js` and `floorPlan.js`: draw the new line(s), with the existing `card-summary` style (no new colours).
- [ ] Tests: hand-written expected strings for timed over-etch, the endpoint detector, the copper bath; `pointsChange` for timed over-etch on seed 123456 equals the forecast difference already in `view.test.js` (16.1976 − 15.1772 = 1.0204, shown "about 1.0"). Screens at both sizes; phone tests `--repeat-each=5`, since the cards get taller.

### Part B — placeholders that cost (Lane F issue 5)

Three things charge the player for nothing:

1. **The Metrology side stop** says "(coming in a later update)" and still costs 20 minutes of cycle time, plus Q-time risk if it is in the Q-time corridor.
2. **"Measure all 25 sites"** costs 150 cash and 20 minutes and does nothing visible: it sets `room.revealed`, which no screen reads, and the wafer map already shows all 25 sites anyway.
3. **The ship report says** "(Unlocks start to count in a later update.)". That has been false since M4 item 4 (unlocks now join your next run).

**Steps**
- [ ] Remove the stale sentence in 3 (`render.js`). A plain bug fix, no question.
- [ ] 1 and 2 per your answers to Q2 and Q3.
- [ ] If the map's offers change (Q2 option A), the seeds draw different side stops, so `SAVE_VERSION` goes 3 → 4 and test helpers that *search* for a seed (they already allow this) may pick another seed. Expected values themselves stay the same; if any must change I show you old and new first.
- [ ] `npm test`, `npm run screens`, the bot; tick the box; lessons if anything surprises me.

**Q1 (the points preview).** Show "about N points less lost in this room" on playable cards (my recommendation; it reuses the forecast players already trust), or the multipliers only?

**Q2 (the Metrology side stop).** A) stop offering it on the map until it does something (my recommendation; a choice that only costs time is a trap); B) keep it, but it costs 0 minutes and says "nothing to measure yet"; C) build it now (what should it reveal? that is a design and physics call and probably belongs with the readable-diagnosis item).

**Q3 ("Measure all 25 sites").** A) take it out of the starter deck until the game hides something a measurement could reveal (my recommendation; a starter card that does nothing teaches players to ignore cards); B) keep it, but make it free; C) make it reveal something now (same design call as Q2 C). Note: taking it out leaves the metrology room with no card at all, which the "decision in every room" item (your starter deck answer) will fill.

---

## M4.5 items 1 and 2 — land the pending lane work (item 1, waits for PR #23 to merge); remove the fixed etch and litho yield tax (item 2, DONE 26 Oct 2026)

**Status: David OK'd the plan and the test-value changes. Item 2 is built and verified: `npm test` 233/233, `npm run screens` 74/74, bot clean on 200 runs, `physics-reviewer` passed all four numbers. Item 1 is still to do.**

**Item 2 done:** the five numbers are in `lotTypes.js`, the 15 test values were updated to the hand-computed ones in the table below, and `SAVE_VERSION` is 3 (`fabrun.run.v3`). One value not in the table: `view.test.js` run-etch yield band went from `warn` to `ok`, because the lot is now at 78.0% after etch, above the 70% spec. The reviewer's comment fix is in.

**Open from the physics review (for David):** etch still shows about 0.19 landing (0.11 of its own + the latent depth variation 0.08 from the stack), against 0.04 at litho. That can teach "etch is the dirty step" when the cause is upstream. Either the etch screen labels it as carried in from the stack, or 0.08 gets a smaller size. Goes with the etch-stop item.

### M4.5 item 1 — bring Lane F's reports and Lane D's commit onto `main`

**What it is today**
- `main` has neither. Lane F's playtest work is on `claude/lane-f-playtesting-tsdjsm` (7 commits, 223 files, docs only plus five persona agent files). Lane D's one commit (the "about 1 nm" native-oxide label on the pre-clean art plus its tracker) is on `claude/lane-d-look-feel-64k6zr`.
- I test-merged both onto `main`: **no conflicts**. Neither touches `src/engine/` or the tests.
- `origin/lane-f` is an older, smaller copy of Lane F (3 commits, an earlier `drive.mjs`). The newer branch contains the same work, so it is stale.
- `lane-b`, `lane-c` and `model-routing` and `trim-project-md` have nothing that `main` lacks.

**What you'll see after this item**
- `docs/playtest/` on `main`: the five persona reports, the 15 run logs, `summary.md` (the ranked issues) and `physics-review.md`.
- The five `persona-*` agents in `.claude/agents/`, so Lane F can rerun them after M4.5.
- The native-oxide label in the pre-clean art.

**Steps**
- [ ] Wait for PR #23 to merge. Then restart my branch from the new `main` (the same branch name, as the session rules say for a merged PR).
- [ ] Merge the two lane branches into it as two merge commits, so each lane's history stays visible. No file edits.
- [ ] Run `npm test` and `npm run screens` on the result (Lane D's change is an SVG, so the screen tests prove the art still loads).
- [ ] Open one PR for David: "Land Lane F reports and Lane D label".
- [ ] Do **not** delete any branch. I list the stale ones (`lane-f`, `lane-b`, `lane-c`, `model-routing`, `trim-project-md`, `ccr-*`) and David decides.

**Why this order:** the lane branches only add files, so they cannot break PR #23 either way. But merging them into PR #23 would put 223 files in a PR meant to be read in ten minutes.

**Q1 (size).** `docs/playtest/` is about 13 MB, mostly 70 screenshots. The repo is public and GitHub Pages serves the whole repo. Options: A) keep them all (the evidence stays with the repo; Pages gets heavier); B) keep the reports and logs and leave the screenshots out of `main` (the reports still link them by name, so the links would break). I recommend **A**: 13 MB is small, and the summary's evidence lines point at those files.

### M4.5 item 2 — remove the fixed etch and litho yield tax

**What it is today** (from `src/content/lotTypes.js` and Lane F's `physics-review.md` claim 8)
- Every lot pays a fixed risk at etch, whatever the player does: residue 0.10 + underlayer attack 0.05 + edge ring 0.05 + particles 0.01 = **0.21 now, plus the latent depth variation 0.08 = 0.29**. Yield is `e^−risk`, so that is about **25% of the lot** lost on a healthy etch.
- Litho adds a fixed `cd_error` 0.06 (about 6%), though the CD is centred.
- A do-nothing run on seed 123456: litho −7 points, **etch −22 points**. The best cards bring etch's exponent only to about 0.15, so every strategy lands within half a point of each other (Lane F issue 1).
- It also teaches something false: a well-centred timed etch already includes its over-etch, so large residue on a healthy tool is not physical (claim 8).
- The whole route's fixed risk adds to 0.67, i.e. **51% with no choices at all**. The spec is 70%, which is an exponent of 0.357 or less. So shrinking etch and litho alone is not enough to make the spec reachable, but it is the part that is unphysical, and it is the biggest single piece.

**The rule I will keep (CLAUDE.md §5 and §7):** only the placeholder risk sizes in `lotTypes.js` change. No physics rule, no effect operation and no content text changes. Tool health still adds drift risk exactly as today, so a worn etch tool costs more than a fresh one, which is what should decide the loss.

**Proposed new sizes (placeholders; I measure before settling)**

| Pattern at etch/litho | Now | Proposed | Reason |
|---|---|---|---|
| etch `residue` | 0.10 | 0.04 | A centred timed recipe clears the film; some residue remains in slow spots |
| etch `underlayer_attack` | 0.05 | 0.03 | Real, but small without over-etch (the etch-stop logic is item 3 of M4.5, not this item) |
| etch `edge_ring` | 0.05 | 0.03 | The starter set has no counter for it, so it should stay small |
| etch `particles`, latent `depth_variation` | 0.01, 0.08 | unchanged | Not part of claim 8's list; depth variation is shared with the etch-stop item |
| litho `cd_error` | 0.06 | 0.03 | The CD is centred; scatter, not a tax |

- Etch's fixed risk goes from 0.21 to 0.11, and litho's from 0.06 to 0.03. A do-nothing run's total fixed exponent goes from 0.67 to about 0.54, i.e. about **58%** instead of 51%, before drift.
- That is still below the 70% spec on purpose: after this item **do-nothing must fail** (exit test), and the cards must be what gets a lot over the line.

**Steps**
- [ ] First, measure, with a scratch script outside the repo: the per-step loss for the idle bot and for a "good play" script (the cards that already exist, a PM on a worn etch tool) on seeds 123456, 42 and 777, **before** the change. Write the numbers into this file.
- [ ] Change the five numbers in `lotTypes.js`. Update the comment above them.
- [ ] Measure again. If the best play ships below about 65% or above about 80%, or the best and worst strategies are less than 10 points apart, I adjust and tell you the numbers before settling. A strategy that is only 10 points apart because of the *other* rooms' fixed risks is reported, not hidden, and goes to the next items.
- [ ] Tests: `tests/run.test.js` lines 95–96 (residue 0.10, underlayer 0.05) and the `timedOveretch` test (line 115, residue 0.03) hold hand-computed values for these exact numbers. **CLAUDE.md §11 says never edit an expected value to make a test pass, so I will ask you before editing any of them.** I recompute each by hand from the new numbers and show you the old and new value side by side.
- [ ] `SAVE_VERSION` goes 2 → 3 (and the key to `fabrun.run.v3`), because an old save would replay to a different yield. The notebook is untouched (own key).
- [ ] The shop test seed (`tests/shopSeed.js`) and the screen tests that look at yield may move; their expected *items* stay the same, as before.
- [ ] `npm test`, `npm run screens` (phone tests with `--repeat-each=5`), and the bot on all three seeds.
- [ ] Update this tracker, the `ROADMAP.md` box, and a rule in `tasks/lessons.md` if anything surprises me.
- [ ] `physics-reviewer` checks the new sizes (a read-only pass), because the sizes are physical claims.

**What you'll see:** in the same run on seed 123456, etch costs about 10 points instead of 22, and litho about 3 instead of 7. The ship report's step breakdown shows it. A worn etch tool (red SPC flag) now visibly costs more than a fresh one.

**Answers (David, 26 Oct 2026):** Q1 keep all the screenshots; Q2 the numbers are fine (0.04 / 0.03 / 0.03 / 0.03); Q3 other rooms stay for now.

**Measured (scratch script, 200 seeds 1000–1199 plus seeds 123456 / 42 / 777). "Greedy" plays every legal card in every room, no side stops.**

| Play | Before | After |
|---|---|---|
| Do nothing (200 seeds, mean / best) | 46.4% / 54.1% | 52.7% / 61.0% |
| Do nothing, seeds 123456 / 42 / 777 | 51.8 / 47.9 / 50.6 | 58.5 / 54.8 / 57.3 |
| Greedy, starter deck (mean) | 48.9% | 53.8% |
| Greedy, full pool (mean, lots at or over 70%) | 62.0%, 2 of 200 | 67.0%, 53 of 200 |
| Random play, full pool (mean, lots at or over 70%) | 58.9%, 1 of 200 | 63.7%, 27 of 200 |

- Do-nothing still fails (best of 200 is 61%). The best and worst strategies are now about 14 points apart (52.7 vs 67.0), up from 0.7 to 3 points on the starter deck. **With the starter deck alone nothing reaches 70%** (best 62%), because the starter pool has almost no cards outside etch and litho. That is the "decision in every room" item, not this one.
- **Correction to the plan:** I wrote that etch would cost "about 10 points instead of 22". By hand it is **16.2 points** (from 22.9). Depth variation (0.08, latent, shared with the etch-stop item) and handling particles are still there. Litho goes from 7 to 3 points.

**Test values that change (hand-computed first, then checked against the engine).** I rebuilt the model by hand in a separate script. It gives the *old* numbers exactly (0.517954, 0.685321, 0.716865, 0.701607, 22.8610, 19.7066), so I trust it for the new ones.

| Test | Old expected | New expected | Hand working |
|---|---|---|---|
| lotTypes: idle route, centre / inner / outer sites | 0.588605 / 0.559898 / 0.492567 | 0.657047 / 0.625002 / 0.567295 | even exponent 0.42 (was 0.53); inner adds depth 0.08 × 0.625; outer adds depth 0.08 × 1.25 + edge ring 0.03 × 1.5625 |
| lotTypes, run, events, tools, run Q-time: whole idle yield | 0.517954 | 0.589352 | (1 × centre + 8 × inner + 16 × outer) / 25 |
| run: residue / underlayer attack on entering etch | 0.10 / 0.05 | 0.04 / 0.03 | the new sizes |
| run: after timed over-etch | residue 0.03, underlayer 0.075 | residue 0.012, underlayer 0.045 | ×0.3 and ×1.5 of the new sizes |
| doe: underlayer attack before playing | 0.05 | 0.03 | the new size |
| doe: DOE-centred over-etch yield ratio | × 1.012578 | × 1.007528 | e^(0.03 × (1.5 − 1.25)) |
| shop: yield after etch, with / without the detector | 0.701607 / 0.685321 | 0.798418 / 0.779789 | detector: depth 0.056 instead of 0.08 |
| view: yield on entering etch | 0.913931, shown 91.4 | 0.941765, shown 94.2 | e^(−0.06) |
| view: loss at etch, idle / after over-etch | 22.8610 / 19.7066 points (22.9 / 19.7) | 16.1976 / 15.1772 (16.2 / 15.2) | before minus after |
| view: yield after etch, idle / over-etch | 68.5% / 71.7% | 78.0% / 79.0% | 0.779789 / 0.789992 |
| events, tools: slurry / worn-CMP ratio | × 0.977312 | unchanged | only the idle yield beside it changes |
| run Q-time: ratio e^(−0.04) | 0.960789 | unchanged | unchanged |

**Q2 (the numbers).** Are 0.04 / 0.03 / 0.03 / 0.03 right, or do you want smaller (0.02 each) so that the tool state decides almost everything? This is your fab call.

**Q3 (other rooms).** Plating, CMP, barrier and strip also carry fixed risk (about 0.28 together). Lane F measured +11–15 points after etch with no decision. Do they stay for now (my proposal; the cards for those rooms come with the "decision in every room" item), or shrink in this same change?

---

## Done: M4 item 4 — starter pool vs unlocked pool; unlocked remedies appear in the deck and at procurement

**Status: done. David answered Q1–Q4 (26 Oct 2026), all as proposed: unlocked practices join the deck automatically, the save version goes to 2, the thin first-run shop is accepted, and consumables stay off the Notebook page until they are in the game. Built the same day.**

**Decisions settled:** O1 (diagnosing earns unlocks) is already settled. Q1–Q4 are answered above.

### Task: a diagnosed failure mode's remedies join every later run

**What it is today**
- Every item has `unlockedBy`: `null` for the starter pool, or the failure mode that unlocks it. Content and failure modes agree in both directions (checked: no mismatches).
- The starter pool is small: 3 practices (timed over-etch, measure all 25 sites, strip and re-expose), 1 piece of equipment (inline metrology), 2 resists, and 2 consumables.
- Every run's deck is the starter deck, so only etch and litho rooms ever deal cards.
- The shop sells **every** equipment and material, because `SHOP_SELLS_LOCKED_ITEMS = true` was set "until the notebook exists".

**What you'll see after this item**
- Diagnose Keyhole void. On every later run, the **Low-current start step** card is in your deck and turns up in the plating room's hand. The **additive bath** can be on sale at a procurement stop.
- Before any diagnosis, procurement only sells starter items (see Q3).
- The Notebook page now shows each entry's remedies: "Unlocks: Low-current start step, Additive bath". It lists only remedies the game can use (see Q4).

**Engine (`src/engine/`)**
- [x] `notebook.js`: `unlockedIds(notebook)` gives the ids that the notebook's failure modes unlock, in content order. Unknown ids are skipped.
- [x] `run.js`:
  - `createRun({ …, unlocked = [] })` keeps the list in `state.unlocked`.
  - `runDeck(unlocked)` gives the starter practices plus the unlocked practices, in content order (Q1).
  - The default stays `[]`, so the bot and the existing tests play exactly as before.
- [x] `shop.js`: an item is for sale if it is a starter item **or** is in `state.unlocked`. `SHOP_SELLS_LOCKED_ITEMS` becomes `false` in `balance.js`.

**Why the run keeps its own list (and a save-version bump)**
- A run's pool is fixed **when the run starts**. A diagnosis made in another tab mid-run must not change this run's deck. If it did, the same seed and the same actions would no longer give the same run (CLAUDE.md §8), and a resumed save would replay differently.
- So the run save stores the list: `{ version: 2, seed, unlocked, actions }`.
- `SAVE_VERSION` goes 1 → 2, so a run in progress when this ships is dropped once and starts fresh. **The notebook is not touched**: it has its own key, which is exactly what M4 item 2 was for.

**UI (`src/ui/`)**
- [x] `main.js`: `newRun(seed)` uses `unlockedIds(notebook)` for the deck and the shop. A resumed run uses the list saved with it.
- [x] `storage.js`: `saveRun` and `loadRun` carry `unlocked` (a list of text ids, else the save is junk).
- [x] `notebookView.js` and `notebookPage.js`: "Unlocks: …" under each entry (practices, equipment and materials only, Q4), or "No remedy yet." for etch residue.
- [x] `tasks/todo.md` NEEDS NEW LOGIC: consumables (starter and unlocked) are not played anywhere yet (Q4).

**Tests**
- [x] Hand-checked:
  - `unlockedIds` of {keyhole, edge ring} is `['slowStartPlate', 'eChuckUpgrade', 'additiveBath', …]` in content order;
  - an empty notebook unlocks nothing;
  - an unknown id is skipped.
- [x] `runDeck([])` equals the starter deck, and `runDeck` of the keyhole unlocks adds `slowStartPlate` only (the bath isn't a practice).
- [x] Shop:
  - with `unlocked: []`, no locked item is ever in stock (100 seeds, every corridor);
  - an unlocked item can be in stock.
  - `shopSeed.js` passes `unlocked` for its 3 test items, so the shop tests' expected items stay the same. Only the seed it finds may move, as its header comment already allows.
- [x] Saves:
  - `unlocked` round-trips;
  - a v1 save is ignored;
  - a resumed run uses its saved list even after the notebook grew.
- [x] Screens, desktop and phone:
  - with a stored notebook holding keyhole void, the plating room deals Low-current start;
  - with an empty one, it deals nothing there.
  - The shop screen tests store the notebook entries their items need (via `addInitScript`).
  - The phone tests run with `--repeat-each=5`.
- [x] Bot runs clean (unchanged default: `unlocked: []`).

**Size:** about 30 lines in `src/engine/`, 1 line in `balance.js`, about 40 in `src/ui/`, and about 180 lines of tests. **It touches `src/engine/`, `src/content/` and `src/ui/`, so this plan is the ask (CLAUDE.md §3).**

### Questions for David
- **Q1 how unlocked practices reach the deck.** The roadmap says "appear in drafts", but there is no draft yet.
  - **A (proposed):** every unlocked practice joins the deck of every later run, automatically. The hand is already drawn only from the cards legal in that room, so a bigger deck means more choice in that room, not clutter.
  - **B:** at the start of a run, pick a few of your unlocked practices (a new screen and a new action).
  - **C:** Spire-style: after a room, pick 1 of 3 cards to add. That's a new mechanic, better as its own roadmap item later.
- **Q2 the save-version bump:** a run in progress when this ships is dropped once; the notebook is kept. Proposed: OK.
- **Q3 procurement will be thin at first.** The only starter items it can sell are inline metrology and the thick resist (the i-line resist is already loaded). A first-run shop may offer 1–2 items, and late on the route, none. Options:
  - accept it, since diagnosing is how the shop fills up (proposed);
  - or move a few equipment items into the starter pool. That's a content call for you.
- **Q4 unlocked consumables** (bath analysis, fresh resist, implant monitor, oxide monitor) **can't be used anywhere yet**. No engine code plays consumables, not even the starter qual wafer and spare part.
  - Proposed: leave them out of "Unlocks: …" until consumables are in the game, and list them in NEEDS NEW LOGIC.

**For David (found while planning, not blocking)**
- On the Cu line, two items can never be unlocked:
  - **i-line → DUV resist (`resistCAR`)**: post-exposure delay T-top is never a right answer there, since no step waits before bake.
  - **fresh resist**: same reason.
- Other items wait on NMOS-only failure modes. That is fine, since NMOS is M5.

### Acceptance criteria
- After a right diagnosis, the next run's deck holds that failure mode's practices, and procurement can sell its equipment and materials. Before any diagnosis, neither does.
- A resumed run replays exactly, even if the notebook changed meanwhile.
- `npm test`, `npm run screens` and the bot pass; the phone tests pass 5 runs in a row; screenshots are checked.

**Progress notes:**
- 26 Oct 2026, the tests that relied on the shop selling everything. The shop, shop view and full-deck save tests now play as a player whose notebook unlocks what they need:
  - `tests/shopSeed.js` has `SHOP_TEST_NOTEBOOK` (removal-rate drift and T-top: the pad conditioner and the DUV resist; no practices, so the deck stays the starter deck);
  - and `FULL_NOTEBOOK_UNLOCKS` (every failure mode).
  - Their expected items didn't change. The shop test seed moved from 123717 to 123456, which `shopSeed.js` was written to allow.
  - The shop screen tests store `SHOP_TEST_NOTEBOOK` in the page before it loads.
- **David, please note:** the save tests' expected save now includes `unlocked: []` (for example `{ seed, unlocked: [], actions }`). That's the new save shape from this plan, not a value bent to make a test pass.
- Two expected names in a test I wrote this session were wrong: I guessed "Additive bath" and "Electrostatic chuck upgrade". They are now the real names, "Three-additive copper bath" and "Edge-tuned chuck". Lesson added.

**Result:** done.
- Diagnosed failure modes add their practices to every later run's deck, and their equipment and materials to the shop.
- Each run keeps its unlocked list, and the run save stores it (`SAVE_VERSION` 2).
- The Notebook page shows "Unlocks: …".
- npm test 233/233, npm run screens 74/74, the changed phone tests passed 5 runs in a row, the bot ran clean, and the screenshots were checked.

---

## Done: M4 item 3 — Notebook page: your diagnosed failure modes, their signatures and the seed each was found on

**Status: done. David answered Q1–Q4 (26 Oct 2026): Q1, Q2 and Q4 as proposed; Q3 changed: remedies stay hidden until the unlock pool (M4 item 4) makes them real. Built the same day.**

**Decisions settled:** none needed. O1 (diagnosing earns unlocks) is already settled. The tool-schematic art for notebook pages (S10) is an M6 item, so this page uses the plain panels the other screens use.

### Task: a page you can open to read your notebook

**What you'll see**
- A **Notebook** button in the header of the floor plan and of the ship report. The button shows the count, for example "Notebook (3)". Tapping it opens the Notebook page. **Back** returns to the screen you came from, exactly as it was. (Q1)
- The page lists the failure modes you have diagnosed, **newest first** (Q2). Each entry shows:
  - its **name** and **signature** (the same words as on the diagnose panel);
  - **"Found on seed 123456"**;
  - **No remedies yet** (Q3): what an entry unlocks appears on this page when the unlock pool is built (M4 item 4), so the page never lists something the game doesn't do yet.
- Under the list, with 3 found: **"14 failure modes still to find."** It gives the count only, never the names, so nothing is spoiled (Q4).
- An empty notebook says: "Nothing diagnosed yet. At the end of a run, name the failure mode that hurt the lot on the ship report."
- Entries whose failure mode is no longer in the content are skipped, as already agreed for M4 item 2 (Q3 there).

**What it does not do**
- Opening the notebook is **not a run action**. It doesn't change the run, isn't saved, and a reload brings back the screen behind it. No engine change.
- No button in the process rooms, to keep the room screen clear. (Q1)
- No art yet: the tool-schematic notebook pages are M6.

**Code (all in `src/ui/`, one folder)**
- [x] New `notebookView.js`, about 60 lines, pure (runs in Node like the other views): `notebookView(notebook)` gives `{ entries: [{ id, name, sig, seed }], stillToFind, emptyText }`.
  - `modeName` **moves here** from `shipView.js`, which then imports it. It's 1 line moved, not new logic, so both screens name failure modes the same way.
- [x] New `notebookPage.js`, about 60 lines: `renderNotebook(container, view, { onBack })`. It's a new file because `render.js` (372 lines) would pass 400 (CLAUDE.md §4).
- [x] `floorPlan.js` and `render.js`: a Notebook button (44 px, with the double-tap guard) in the map and ship-report headers, about 10 lines.
- [x] `main.js`, about 20 lines: `showNotebook(back)` draws the page, and Back calls `back` (`showMap` or `showShipReport`), so the screen comes back as it was, including a diagnosis already made.
- [x] `room.css`: a few rules for the entry list, using `tokens.css` colors only.

**Tests**
- [x] `tests/notebookView.test.js` (Node):
  - an empty notebook gives no entries and the empty text, and `stillToFind` equals the number of failure modes;
  - two entries come out newest first, with their names, signatures and seeds, and `stillToFind` goes down by 2;
  - an unknown id is skipped and doesn't change `stillToFind`.
- [x] `tests/screens/notebook.spec.js`, desktop and phone:
  - an empty notebook from the floor plan opens and shows the empty text; Back returns to the floor plan;
  - after a right diagnosis on seed 123456, the ship report button reads "Notebook (1)", the page shows that entry, and Back returns to the ship report with the diagnosis still shown;
  - no sideways scroll at 375 px and no console errors; a screenshot of each;
  - the phone tests pass with `--repeat-each=5`.

**Size:** about 140 lines of code in `src/ui/` and about 150 lines of tests. One `src/` folder. ROADMAP: this becomes M4 item 3, and the unlock pool moves to item 4.

### Questions for David (proposed answers; say if any is wrong)
- **Q1 where to open it:** from the floor plan and the ship report, not from inside a room. Back returns to where you were. Proposed: yes.
- **Q2 order:** newest first. Proposed: yes.
- **Q3 remedies on the page:** list them now, with a note that they join the game in the next item. Proposed: yes. (The other choice is to hide them until the unlock pool is built.) **David: hide them until built.**
- **Q4 undiscovered failure modes:** show only a count ("14 still to find"), never their names. The count includes the ones only an NMOS lot can show, which hints there's more to come. Proposed: yes.

### Acceptance criteria
- From the floor plan or the ship report, you can open the Notebook page and see each diagnosed failure mode with its signature and seed, and Back returns you to the same screen.
- `npm test` and `npm run screens` pass; the phone screen tests pass 5 runs in a row; screenshots are checked at both sizes.

**Progress notes:**
- 26 Oct 2026: the Notebook button lives in `render.js` (`notebookButton`), not in `notebookPage.js`, because `render.js` importing from `notebookPage.js`, which imports from `render.js`, would be a circular import. Now `render.js` is 379 lines.
- The line under the list says "1 failure mode" and "Every failure mode is in your notebook." where those fit, not "1 failure modes".

**Result:** done. New `notebookView.js` (the page's contents) and `notebookPage.js` (drawing). A "Notebook (n)" button sits in the floor-plan and ship-report headers, and Back returns to the same screen. `modeName` moved from `shipView.js` into `notebookView.js`. npm test 227/227, npm run screens 70/70, the new phone tests passed 5 runs in a row, and the screenshots were checked at both sizes.

---

## Done: M4 item 2 — the notebook is saved under its own key and survives a run-save version bump

**Status: done. Plan OK'd by David (26 Oct 2026): Q1–Q4 and Q6 as proposed; Q5 yes, the Notebook page is its own M4 item.**

### Task: keep the notebook between visits, safely, and never lose an entry

**What you'll see**
- Diagnose a failure mode right, close the tab, come back days later: it is still in your notebook. On the ship report, a candidate you already know shows "In your notebook", and a right answer you already have adds nothing.
- Nothing else on screen changes. Showing the notebook itself is not this item (see Q5).

**Why it needs care**
- The run save (`fabrun.run.v1`) is **thrown away** whenever `SAVE_VERSION` goes up, which it will often, after any rule or number change. The notebook is the player's long-term progress, so it must never be thrown away that way (CLAUDE.md §11).
- So the notebook gets **its own key with no version in its name**: `fabrun.notebook`. Its version lives inside the object (`{ version: 1, entries: [...] }`), so a later change can **upgrade** an old notebook instead of discarding it.

**Code (all in `src/ui/`, one folder)**
- [x] `storage.js`, about 50 lines, built on Lane B's `readJson` / `writeJson`:
  - `NOTEBOOK_KEY = 'fabrun.notebook'`.
  - `loadNotebook(storage)`: the saved notebook, or an empty one when there is none, it is junk, or storage is blocked. Never throws.
    - It keeps only well-formed entries (`{ id: text, seed: number }`) and drops duplicates.
    - It **keeps** entries whose failure mode no longer exists in `content.js` (renamed or removed), so they come back if the content does. The game ignores them (Q3).
    - A notebook with a **newer** version than this code knows is left untouched: the page plays with an empty notebook and never writes over it (Q2).
  - `saveNotebook(notebook, storage)`: first reads what is stored and **merges** the two (union of entries by id), then writes. Two open tabs then can't erase each other's entries (Q4). True if saved.
- [x] `main.js`, about 10 lines: load the notebook when the page opens; save it right after a right diagnosis. `clearRun` and starting a new run never touch it.

**Tests (`tests/storage.test.js`, pretend storage as Lane B's tests use)**
- [x] Save, then load: the same entries.
- [x] Blocked storage (every call throws): load gives an empty notebook, save returns false, nothing throws.
- [x] Junk under the key (not JSON, a number, entries not a list, bad entries): load gives what is usable, never throws.
- [x] **Version bump test:** save a run and a notebook, then load the run with a raised `SAVE_VERSION` (the run is ignored) and `clearRun`: the notebook is still there, unchanged.
- [x] Unknown failure-mode id: kept in storage after load and save, and `diagnosisFor` ignores it.
- [x] Newer notebook version: load gives empty, save leaves the stored value as it was.
- [x] Two tabs: tab A saves entry 1, tab B (loaded before) saves entry 2; the store holds both.
- [x] Screen test, desktop and phone: diagnose right on seed 123456, reload, check the stored notebook holds it, and the replayed lot offers a right answer not yet in the notebook (dishing instead of residue). Phone with `--repeat-each=5`.

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

**Progress notes:**
- 26 Oct 2026: brought in the plan branch (ccr-1a68d2ad), built it. The "unknown id is ignored" test first used a lot scrapped at the start, which has nothing to diagnose, so it passed without proving anything. It now plays the lot through and checks that there are choices.
- 26 Oct 2026: the screen test walks the route twice and took longer than the 30 s test limit; it now has `test.slow()` (90 s).
- The screen test shows the notebook was loaded in a visible way: after a reload, seed 123456 offers dishing instead of residue, because residue is already in the notebook.

**Result:** done. `storage.js` adds `loadNotebook` / `saveNotebook` under `fabrun.notebook`. `main.js` loads it when the page opens and saves it after a right diagnosis. npm test 222/222, npm run screens 66/66, and the new phone test passed 5 runs in a row.

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
- Consumables: no engine code plays them yet (the starter qual wafer and spare part, and the unlocked bath analysis, fresh resist, implant monitor and oxide monitor). They are left off the Notebook page's "Unlocks" until they can be used (David, 26 Oct 2026)
