# Physics review of the fab engineer's claims

The fab engineer (`fab-engineer.md`) flagged on-screen statements as false or misleading. `physics-reviewer` checked each against the game's content and text (read-only; `npm test` 197/197 at the time). All fixes belong to **Lane C** (content) or **Lane A** (code); Lane F changed nothing. "ASK DAVID" marks a decision the reviewer could not make.

Verdict: **10 of 11 claims are real defects, 1 is mostly placeholder tuning that teaches a false lesson as tuned.** None was a persona misread.

| # | Claim | Verdict | Where | Proposed fix |
|---|---|---|---|---|
| 1 | "The metrology gauge is the reference" | Real defect | `src/ui/spcChart.js:93`; header of `src/content/toolMonitors.js` | "No tool chart here: the gauge is checked against reference standards (not modelled yet)." Real gauges drift and get gauge R&R. |
| 2 | T-top failure on an i-line resist lot | Real defect | `fm_ped_ttop` (condition `lot: 'delayBeforeBake'` that no lot type has) | It can never be the right answer yet `notebook.js` still offers it as a wrong choice on any litho route. Offer it only when a chemically amplified resist is in the slot (new diagnosis rule → NEEDS NEW LOGIC). ASK DAVID: diagnosing a CAR-only problem unlocks the CAR resist, which is circular. |
| 3 | "Keyhole void on narrow vias" with no vias | Real defect | `fm_keyhole` signature | "Opens on the narrowest lines only; seam rate climbs on the plating SPC chart." The "seam in the middle" wording needs a cross-section the game doesn't show. |
| 4 | "Native oxide" in the Q-time after trench etch | Real defect | `qtime_oxide` pattern, `fm_qtime`, `cuLine` physicsNote, Q-time hint at `src/ui/view.js:294` | After an etch that stops on SiN nothing bare is exposed. ASK DAVID for the mechanism. A textbook candidate: the dielectric takes up moisture while it waits and outgasses under the barrier, so the barrier adheres poorly. |
| 5 | A "DOE" that only speeds a sampling plan | Real defect (minor) | `measureAll.upgrade` | That is recipe optimisation, not a designed experiment. Cycle time already counts the whole room budget (`run.js` enterStep), so saving 8 metrology minutes changes nothing. Drop it from DOE offers or rename it "tuned recipe". |
| 6 | Unqualified slurry swapped in mid-lot | Real defect (framing) | `events.js` `slurrySupplier` | Physics text is right, but offering it with no change control teaches a bad habit. "Run this lot on the second-source slurry under a signed engineering deviation." ASK DAVID. |
| 7 | Audit holds the lot 30 min; "come back later" earns a finding | Real defect | `events.js` `audit` | An audit walk-through doesn't hold product. The service adds no PM mark, so the wet-clean chart still reads out of control. "Auditor finds the wet bench past its bath-change interval: change the bath now (lot waits 30 min) or run on a logged deviation (corrective-action cost)." ASK DAVID. |
| 8 | Etch (~20) and litho (~6) losses are the same whatever the player does | Mostly placeholder sizes, but teaches a false lesson as tuned | `lotTypes.js` etch and litho step risks | The model is fine (Poisson, losses multiply, never heals). But etch always adds ~0.29 of fixed risk (residue 0.10, depth 0.08 latent, underlayer 0.05, edge ring 0.05, particles 0.01), about 25% loss on a healthy centred tool. Drift adds at most ~0.07 at health 50, and the best cards bring the exponent only to ~0.15. A centred recipe already includes its over-etch, so a big residue loss on a healthy timed etch is false. Edge ring has no counter in the starter set. Litho has a fixed `cd_error` 0.06 with CD centred. Make the fixed amounts small and let drift and choices drive the loss. |
| 9 | "May be shifting" on one spike; rules not named; no axis numbers | Real defect | `src/ui/spcView.js` verdictText; `floorPlan.js:258`; `render.js:301` | One point past a limit is an excursion; only rules 2 and 3 suggest a shift. Word the verdict by rule. Rule texts show only in the room panel, not the corridor card. The chart has only text limits. There is no trend rule, so a 10-lot climb can stay "in control" (ASK DAVID). |
| 10 | Wafer map lower than the headline; "% of the 25 wafers" can't be 98%; map is square | Real defect | `src/ui/view.js` sitePercent | It rounds down on purpose, so the map always reads lower. The value is an expected surviving fraction, not a wafer count. Round to nearest and relabel "% of this die position expected good across the lot". The 5x5 square and square "edge ring" are simplifications (ASK DAVID: a round 21-site mask?). |
| 11 | "Underlayer attack" diagnosis | Real defect, several parts | `content.js`, `lotTypes.js`, `fm_underlayer`, `fm_dishing` | (a) Route label "Deposition (SiN + oxide)" and primer step 2 imply the stop is there, but the `etch_stop` flag comes only from the `etchStopLayer` card. (b) `underlayer_attack` 0.05 is added on every etch, about 5 points, above `DIAGNOSE_MIN_POINTS` 3, so it is always a "right" answer even with no over-etch. (c) With a stop, `timedOveretch` multiplies attack by 1.5 × 0.5 = 0.75; more etch time cannot reduce attack on the film below. The stop should cut the base risk, and over-etch on a stop should be about ×1.0–1.1; the engine can't do that from the deposition room, so it needs new logic. (d) `fm_underlayer` relies on a cross-section and "dies with most over-etch", neither on screen, which breaks rule 6; `fm_dishing` has the same problem (no line resistance shown). (e) It unlocks items the player already owns because the shop still sells locked items. UNCLEAR: fine for now, but say "already in your pool". |

No real company, vendor or brand names, and nothing that looks like non-public process data.

## Most important fixes (reviewer's order)
1. Shrink the fixed etch and litho risks so tool state and choices decide the loss (claim 8). This is also the top playtest issue.
2. Fix the etch-stop logic: the route already shows SiN, and over-etch must not lower attack (claim 11, needs new logic).
3. Make every failure signature readable from evidence on screen (cross-section or line-resistance data, or rewrite the signatures), and offer only failure modes whose cause could have been present (claims 2, 3, 11).
4. Replace the native-oxide Q-time mechanism (claim 4, ASK DAVID).
5. Word SPC verdicts by rule; round and relabel the site map (claims 9, 10).
6. Reframe the gauge, audit and slurry text (claims 1, 6, 7).

## Decisions only David can make
- Claim 2: the circular unlock for CAR-only failure modes.
- Claim 4: the physical mechanism for the Q-time warning.
- Claims 6, 7: the framing of the slurry and audit events.
- Claim 9: whether to add a trend rule to SPC.
- Claim 10: a round 21-site wafer mask or the square 5x5.
