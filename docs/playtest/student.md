# Curious student

## Where I would quit, and why
Seed 777, step 7 (etch room). "I've now tried everything the game offered me for etch across three runs: PM'd the tool, DOE'd the card, bought a 600 endpoint detector, bought a 450 edge-tuned chuck. The forecast says about 21 points every single time. It never told me why etch costs that much, so there's nothing left for me to learn or try. From here I'm just pressing Run and watching myself fall under spec at step 6 again." In practice I'd have been close to quitting at seed 123456 step 21, the first time I dropped below spec with four rooms left and nothing to play in any of them.

## Problems
1. **Etch takes ~20 points and the game never says why.** Every run, etch was forecast at 21–23 points and took 16.7–19.6, whatever I did. PM, DOE, endpoint detector and edge chuck each moved it by 0–4 points. No text says what makes etch so lossy or what would fix it. I expected the biggest loss in the game to come with the biggest explanation. Instead it's a flat tax and all three runs failed the same way. Evidence: docs/playtest/shots/student/123456-17-etch.png, docs/playtest/shots/student/42-16-etch.png, docs/playtest/shots/student/777-16-etch.png.
2. **The diagnosis is a quiz with the answer key withheld.** You get one guess, then just a name ("What did hurt this lot: Edge ring"). There's no why, no step, no "you should have…". Worse, the answer never matched the yield table. Handling particles was "right" on seed 42, but wet clean cost me under 1 point a room, while etch took 17. The edge-ring card says "inner sites are clean", but my inner sites were 56–64 and red. I worked out that the answer is just whichever tool had a red SPC badge on the opening floor plan. That's a pattern-match. I didn't learn any physics from it. Evidence: docs/playtest/shots/student/123456-40-diagnosed.png, docs/playtest/shots/student/123456-39-ship-report-lower.png, docs/playtest/shots/student/777-37-diagnosed.png.
3. **The first screen doesn't say what the game is.** Nothing says what a lot is (I learned "25 wafers" from a caption under the wafer map), what I'm trying to do, or how I lose. The scrap line and spec only appear once I'm inside a room. The legend explains abbreviations with abbreviations ("PM PM / DOE"). PM, DOE, CMP, CD and SPC are never spelled out anywhere in three runs. Evidence: docs/playtest/shots/student/123456-00-s123456-01-floor.png.
4. **No way to look anything up.** I tried tapping "i-line positive resist", "Strip and re-expose" and "CD". Nothing is tappable, and there's no glossary, help or "?" anywhere. The game says it writes diagnoses "in your notebook", but there's no notebook to open on any screen. Evidence: seed 123456 step 11, seed 777 step 1.
5. **Red SPC warnings don't match what happens.** "Out of control … A shifted tool costs yield in this room" on wet clean cost 0.9, the same as or less than a healthy wet clean (1.4 on seed 777). PM'ing a flagged CMP tool was followed by a bigger loss (7.4) than an unflagged CMP the run before (6.2). An auditor "serviced" wet clean, but its chart still said out of control. Deposition said "out of control" with no red point I could see. After three runs I learned to ignore the warnings, and that has to be the wrong lesson. Evidence: docs/playtest/shots/student/42-01-room1-spc.png, docs/playtest/shots/student/42-22-wetclean5.png, docs/playtest/shots/student/42-37-ship-spc.png, docs/playtest/shots/student/777-31-cmp.png.
6. **The cards are missing or dead.** Most rooms say "No practices left in your hand" when I never had any. The only litho card always says "Can't play: Its condition is not met" and never says which condition. Out of 27 room visits I played 4 cards. Evidence: docs/playtest/shots/student/123456-01-room1.png, docs/playtest/shots/student/123456-11-litho.png.
7. **Paid features that do nothing.** The Metrology side stop costs 20 min and says "comes in the next update". "Measure all 25 sites" took 150 cash and changed nothing I could see. The notebook unlock says "Unlocks start to count in a later update." Each one felt like being charged for a placeholder. Evidence: docs/playtest/shots/student/123456-21-metrology.png, docs/playtest/shots/student/123456-37-measured.png, docs/playtest/shots/student/42-38-diagnosed.png.
8. **Shop items don't say what they're worth.** I only found out the copper bath saves ~4–5 points on plating by skipping it on purpose in run 2 and comparing. CMP and deposition losses also changed from run to run (deposition 3.3–5.8) with no reason shown. Cash also dropped 950 to 930 at CMP with no message. Evidence: seed 42 step 14, seed 123456 step 24.

## Compliment
The Q-time corridor text ("native oxide keeps growing until the barrier goes on") taught me a real fact in one sentence, the kind of thing I'd tell a friend. It only came at step 5 of my first run, though.

## Ratings (1 = bad, 5 = great)
- Clarity: 2 — the yield bar, per-room forecast and yield-by-step table are clear, but the main terms and the biggest loss are never explained.
- Real decisions: 2 — shop, DOE and events are real choices, but most rooms are a single Run button and etch ignores what I pick.
- Wanting another run: 2 — three runs failed the same way at the same room, and I can't see what I'd do differently.

## Jargon I hit
| Term | First seen at seed+step | Explained? |
|---|---|---|
| Lot | 123456 step 1 | late (wafer-map caption implies 25 wafers, step 2) |
| Yield / line yield | 123456 step 1 | late (bar with scrap/spec at step 2) |
| Inlaid Cu line | 123456 step 1 | no |
| MET / Metrology | 123456 step 1 | no (and the stop does nothing) |
| PM | 123456 step 1 | no (guessed preventive maintenance) |
| DOE | 123456 step 1 | late, partly ("tunes one practice's recipe", step 9); never spelled out |
| EVT / BUY | 123456 step 1 | yes (legend) |
| QT / Q-time | 123456 step 1 | late (123456 step 20, corridor text) |
| SPC | 123456 step 1 | no (chart key explains lines, never the term) |
| CMP | 123456 step 1 | no (guessed polishing from "pad" and "removal rate") |
| Litho / Etch / Deposition / Plating | 123456 step 1 | no (guessable from names) |
| Wafer map / site | 123456 step 2 | yes (caption) |
| Particle adders | 123456 step 2 | no (guessable) |
| Control limits / spec limits | 123456 step 2 | yes (chart key) |
| Practice / hand | 123456 step 2 | no |
| Time budget | 123456 step 2 | no (never had enough cards to spend it) |
| Slots | 123456 step 2 | late (procurement text, step 14) |
| Cycle time | 123456 step 4 | late (ship report: "room time, side stops and events"); never said if it matters |
| SiN + oxide | 123456 step 4 | no (guessable from chemistry) |
| Wet bench | 123456 step 6 | no (guessed = wet clean tool) |
| Underlayer attack / etch stop / residue | 123456 step 9 | partly (card text) |
| CD / Monitor CD | 123456 step 9 | no |
| Seam rate on fill monitor | 123456 step 9 | no |
| i-line positive resist | 123456 step 11 | no |
| Strip and re-expose / "condition" | 123456 step 11 | no |
| Trench | 123456 step 11 | no (guessable) |
| In-situ pad conditioner | 123456 step 14 | partly ("stable polish rate") |
| Three-additive bath / bottom-up fill | 123456 step 14 | partly (one line) |
| Native oxide / barrier + seed | 123456 step 20 | yes (Q-time text), seed not explained |
| Hot lot | 123456 step 22 | yes (event text) |
| Cost per good die | 123456 step 27 | yes (formula shown) |
| Edge ring / keyhole void / T-top / etch residue | 123456 step 27 | partly (one-line descriptions, no explanation after) |
| Notebook | 123456 step 27 | no (mentioned, never shown) |
| Endpoint detector | 42 step 7 | partly ("film change to detect") |
| Handling particles / removal-rate drift | 42 step 16 | partly (one line) |
| Edge-tuned chuck | 777 step 3 | partly ("better edge uniformity") |
| Chemically amplified DUV resist | 777 step 3 | partly (tradeoff only) |
| Dishing | 777 step 11 | partly (one line, unrelated to anything on screen) |
