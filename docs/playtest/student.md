# Curious student

## Where I would quit, and why
Seed 42, step 33 (CMP result, just before the ship report). "I played that run completely differently: PM'd other tools, got a free service, skipped the rinse before the barrier, never waited in Q-time. I finished at 72.5%. Last run I finished at 72.4%. My choices moved the result by 0.1 points. Plating, CMP and metrology don't even let me in; the lot just goes through and loses 4 to 6 points. Why am I clicking?" I kept going because I was there to learn, and the notebook unlock (dummy fill) pulled me back in on seed 777. If the NMOS run hadn't given me a CMP screen that explained dishing and a readable edge-ring map, I'd have stopped after run 2.

## Problems
1. **My choices barely change the outcome** — Two Cu-line runs with very different PM, rinse and event choices ended at 72.4% and 72.5%. The big losses (etch about 10 points, CMP about 6, plating 4 to 5) were the same every time. I expected PMs and cards to move the result by several points. Instead they move tenths, and the run feels like a fixed tax with flavour text. Evidence: seed 123456 step 41 and seed 42 step 36 (yield-by-step tables, docs/playtest/shots/student/123456-41-s1-27-ship-evidence.png).
2. **Rooms I never get to play** — Plating, CMP (Cu line), Metrology, Diffusion (both), Implant and Electrical test jump straight to "Nothing could be played here, so the lot went straight through", often with a 3 to 6 point loss and no breakdown. The new NMOS rooms I most wanted to learn about (diffusion, implant) are the ones I only watch. On seed 777 the anneal took 4.6 points and left me at 70.2% with nothing to do. Evidence: docs/playtest/shots/student/123456-34-s1-22-plating.png, docs/playtest/shots/student/777-36-s3-10-diffusion.png, seed 777 step 53.
3. **Green SPC charts that still cost me points** — Seed 777: deposition chart "In control", then "about 2.7 points came from the Deposition tool's drift". Same run: the wet clean was "In control", then 1.3 points from drift. The game teaches me to read charts and then punishes me for trusting them. On seed 42 etch was PM'd and its chart stayed down near 277 after the PM. Evidence: seed 777 steps 10 and 33; docs/playtest/shots/student/42-36-s2-10-ship-charts.png.
4. **First diagnosis felt like a trap, not a lesson** — Seed 123456: etch cost 9.8 points, its chart fell, "Etch residue" matched the symptom word for word. Answer: keyhole void, 3.2 points in plating, a room I couldn't enter. The options mention cross-sections, vias, leakage, line resistance, none of which are on screen. "How to spot it" just repeats the option. The edge-ring diagnosis on seed 777 was the opposite: I could read it off the map. Evidence: docs/playtest/shots/student/123456-42-s1-29-diagnosis.png vs docs/playtest/shots/student/777-56-s3-16-ship-map.png.
5. **The game hints at levers I can't reach** — Cu-line etch: "The film stack set how big this is before the lot got here: without an etch stop..." I never saw an etch-stop choice in two runs. I felt blamed for a decision I wasn't given. Evidence: docs/playtest/shots/student/123456-19-s1-15-etch.png.
6. **Card text and the preview number disagree** — Trim dose says it "only fixes a steady shift, not scatter" but shows "0.4 points less" on an in-control tool. Over-etch says "on a steady tool the attack costs about what it saves" but shows "1.4 points less" on a steady tool. Pump-purge says it does almost nothing on a healthy chamber but shows "0.8 less" on a green chart. The rinse card talks about "the barrier" in the transistor flow. I stopped trusting either the text or the number. Evidence: seed 42 step 12; seed 777 steps 4, 10 and 23.
7. **Nobody tells me the goal on the first screen** — The first screen doesn't say what yield, spec or scrap mean, or what the 70% target is. I found out from the "Words" button, which I only pressed because I press everything, and from the yield bar inside room 1. The fact that cash and cycle time don't count toward winning only shows on the ship report. So for a whole run I worried about 40 minutes and 200 cash for nothing. Evidence: docs/playtest/shots/student/123456-00-s1-01-first.png, docs/playtest/shots/student/123456-41-s1-26-ship.png.
8. **Glossary is missing the room names** — The Words list explains SPC, PM, Q-time and CD well, but not litho, etch, deposition, plating, diffusion, implant, NMOS, resist, SiN, poly-Si, etch stop or anneal. Those are exactly what I came to learn. Words in card text can't be tapped. Evidence: seed 777 step 2 (Words list checked against the NMOS floor plan).
9. **Tapping a card plays it instantly** — I wanted to see what the over-etch would do to the forecast before I chose it. Tapping it spent it, with no undo. Evidence: seed 777 step 48.

## Compliment
The Words screen's "real meaning / In the game" pairs, and the seed-777 CMP line naming dishing, where it was set, and both fixes, taught me real things.

## Ratings (1 = bad, 5 = great)
- Clarity: 3 — great glossary and loss attribution in places, but goal and win condition are hidden, room names are never explained, and card text contradicts its own numbers.
- Real decisions: 2 — the rinse-before-Q-time and dummy-fill choices are real; almost everything else changes the result by tenths, and a third of the rooms have no choices at all.
- Wanting another run: 3 — the notebook and unlocks pull me back; being a passenger for the biggest losses pushes me away.

## Jargon I hit

| Term | First seen at seed+step | Explained? |
|---|---|---|
| Yield | 123456 step 0 | yes (Words) |
| Lot | 123456 step 0 | yes (Words) |
| Inlaid Cu line | 123456 step 0 | no |
| NMOS transistor | 123456 step 0 | no |
| Cycle time | 123456 step 0 | yes (Words) |
| PM | 123456 step 0 (map legend "PM PM / DOE") | yes (Words); legend is circular |
| DOE | 123456 step 0 | yes (Words) |
| SPC | 123456 step 0 | yes (Words) |
| Q-time / QT | 123456 step 0 | yes (Words, and corridor text) |
| Wet clean | 123456 step 0 | no (guessable) |
| Deposition | 123456 step 0 | no |
| Litho / litho bay | 123456 step 0 | no |
| Etch | 123456 step 0 | no |
| Plating | 123456 step 0 | no |
| CMP | 123456 step 0 | yes (Words) |
| Metrology | 123456 step 0 | yes (Words) |
| Scrap line / Spec | 123456 step 3 | yes (Words) |
| Particle adders | 123456 step 3 | no (guessable) |
| Control limits | 123456 step 3 | yes (Words + chart key) |
| DI water | 123456 step 3 | no |
| Strip clean | 123456 step 3 | no |
| Barrier | 123456 step 3 | no |
| qtime oxide | 123456 step 3 | late (Q-time corridor, step 27) |
| Drift | 123456 step 5 | yes (Words) |
| Over-etch | 123456 step 7 | no (guessable) |
| Underlayer attack | 123456 step 7 | no (guessable) |
| Etch stop | 123456 step 7 | no |
| Residue | 123456 step 7 | no (guessable) |
| CD / Monitor CD | 123456 step 7 | yes (Words) |
| Shift (SPC rule) | 123456 step 7 | late (etch room, step 19: "8 points in a row below the centre line") |
| Seam rate on fill monitor | 123456 step 7 | no |
| Removal rate | 123456 step 7 | no (guessable) |
| Flakes | 123456 step 9 | late (card text) |
| Endpoint detector | 123456 step 12 | no |
| TSV | 123456 step 12 | no |
| i-line positive resist | 123456 step 12 | no |
| Edge ring | 123456 step 12 | late (seed 777 diagnosis) |
| Depth variation | 123456 step 12 | late (etch room, step 19) |
| Dose | 123456 step 13 | no |
| Hot lot | 123456 step 16 | yes (event text) |
| Slurry | 123456 step 32 | yes (Words, under CMP) |
| Native oxide | 123456 step 27 | yes (corridor text) |
| Seed (Cu seed layer) | 123456 step 28 | no |
| Keyhole void | 123456 step 41 | late (after wrong answer, symptom only) |
| Via | 123456 step 41 | no |
| Cross-section | 123456 step 41 | no (never shown) |
| Cost per good die / Die | 123456 step 41 | yes (Words) |
| Excursion | 42 step 1 | yes (Words + chart text) |
| Dishing | 42 step 36 | yes (Words under CMP; seed 777 CMP room) |
| Chamber flaking | 42 step 36 | no |
| Dummy fill | 42 step 37 | late (seed 777 CMP room) |
| Pad oxide + SiN | 777 step 1 | no |
| Diffusion | 777 step 0 | no |
| Implant / S/D implant | 777 step 0 | no |
| Gate oxide / gate oxidation | 777 step 35 | no |
| Poly-Si | 777 step 36 | no |
| Isolation trench | 777 step 14 | late (CMP room, step 27) |
| Activation anneal | 777 step 52 | no |
| Stringers | 777 step 56 | no |
| Junction leakage | 777 step 56 | no |
| Chuck (edge-tuned) | 777 step 57 | no |
