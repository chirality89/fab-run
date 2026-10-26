# Playtest summary (Lane F)

Five simulated players, three seeds each (123456, 42, 777), 15 logs in `logs/`, screenshots in `shots/<persona>/`. Reports: `fab-engineer.md`, `spire-veteran.md`, `phone-5min.md`, `student.md`, `minmaxer.md`.

**Headline: no lot shipped in any run, by any persona.** Final yields were 47.9% (do nothing) to 59.5% (best play) against a 70% spec. All five quit at or just after Etch (seed 777 step 4 on the phone; seed 42 step 5 for the min-maxer). The phone persona said the same about its own timing: a newcomer needs 9–10 minutes for a run, which does not fit in five.

| Persona | Clarity | Real decisions | Another run |
|---|---|---|---|
| Fab engineer | 2 | 2 | 1 |
| Spire veteran | 3 | 1 | 1 |
| Phone, 5 minutes | 2 | 2 | 1 |
| Student | 2 | 2 | 2 |
| Min-maxer | 2 | 1 | 1 |

Lane tags: **A** run spine (engine, run flow, screens, economy), **C** content (cards, items, failure modes, text), **D** art (look, layout, hierarchy). "A/C" means both own part of the fix. Nothing here fits none of the three.

## Ranked issues

### Hit by all 5 personas

1. **The spec feels unreachable and the choices barely move the result. [A, with C for the numbers]**
   Etch costs 16–27 points in every run, whatever the player does: PM, over-etch card, 600-cash endpoint detector, 450-cash chuck, or nothing. All of them together move it by 0–5 points. Everything after etch adds 11–15 more points with no decision to make. Three different strategies ended at 58.9, 58.9 and 59.4. A do-nothing replay of seed 42 got 47.9%. The lot is already dead at step 4 of 9, and the player gets no sign of that or of what would help.
   Evidence: `shots/fab-engineer/777-15-s777-04-etch-result.png`, `shots/phone-5min/777-16-s777-03-etch-result.png`, `shots/student/777-16-etch.png`, `shots/spire-veteran/42-39-s42-07-report.png`, `shots/minmaxer/42-37-report.png`.
   The fab engineer adds that a flat tax teaches a new hire a false rule ("trench etch always kills a fifth of the lot").

2. **Diagnosis can't be worked out from the evidence, and the right answer is never explained. [C for the failure-mode signatures; A for the "why" on the result]**
   - Seed 123456: the etch chart matched "Etch residue" word for word. The game's answer was "Edge ring (inner sites are clean)", but the inner sites were red. (spire-veteran, student, minmaxer)
   - Seed 777: CMP was flagged all run, the answer was "Dishing", which is about line widths, and nothing on screen shows line widths. (spire-veteran)
   - Seed 42: "Underlayer attack" was the card the player had been handed and had played because it improved the forecast, so it felt like blame, not teaching. Its clue is a cross-section the player never saw. (fab-engineer, phone-5min)
   - A correct answer unlocks things the player already owns (SiN etch stop, endpoint detector on seed 42). (fab-engineer, spire-veteran)
   - After a guess the game gives a name only: no why, which step, or what to do instead. (student)
   - The student worked out that the answer was always the tool with a red flag on the opening floor plan, which is pattern-matching, not physics.
   - Seed 777 offered failure modes from rooms a scrapped lot never reached, so one persona won by elimination. (fab-engineer)
   Evidence: `shots/spire-veteran/123456-41-s123-22-diagnosed.png`, `shots/student/123456-40-diagnosed.png`, `shots/minmaxer/123456-45-diagnose-wrong.png`, `shots/fab-engineer/42-35-s42-10-report.png`, `shots/phone-5min/42-36-s42-11-diagnose.png`.

3. **Most rooms have no decision, and the one other card is greyed out without a reason. [C for the cards; A for the message]**
   6–7 of 9 rooms show "No practices left in your hand" when the player never had any. Only Etch gave a playable card. "Strip and re-expose" always says "Can't play: Its condition is not met" and never names the condition. The student played 4 cards in 27 room visits. Unspent room time is never used. In a card game the veteran never had a deck, a draw or a choice between two cards.
   Evidence: `shots/spire-veteran/123456-01-s123-02-room1.png`, `shots/spire-veteran/123456-12-s123-09-litho.png`, `shots/phone-5min/123456-12-s123456-11-litho-hand.png`, `shots/student/123456-11-litho.png`.

4. **The red SPC flags don't predict anything, so players learn to ignore them. [A, with C for tool data]**
   A flagged wet clean cost 0.9 points, the same as or less than a healthy one (1.4 on seed 777). An unflagged CMP cost 8.2. PM on a flagged CMP or deposition tool saved nothing measurable, and PM on a flagged etch tool saved 2–3 of ~20 points. The student saw an audit "service" a wet clean whose chart still read out of control. The fab engineer adds: a single spike is called a "shift", most flags don't name the rule, and the charts have no axis numbers.
   Evidence: `shots/fab-engineer/42-01-s42-02-wetclean-spc.png`, `shots/spire-veteran/42-01-s42-02-wetclean-spc.png`, `shots/student/42-01-room1-spc.png`, `shots/minmaxer/42-20-wetclean-after-audit.png`; seed 777 step 4 (phone-5min).

5. **Placeholders that still cost the player. [A]**
   The Metrology side stop says "coming in a later update" and still charges 20 minutes. "Measure all 25 sites" took 150 cash and showed nothing new. The notebook is mentioned on the ship report but can't be opened anywhere, and its unlocks "start to count in a later update". An unlock can even be for an item the player has already bought.
   Evidence: `shots/student/123456-21-metrology.png`, `shots/student/123456-37-measured.png`, `shots/spire-veteran/42-40-s42-08-diagnosed.png`, `shots/phone-5min/123456-03-s123456-05-corridor.png`.

### Hit by 4 personas

6. **Shop items and cards show no effect before the player commits. [C for item text; A for showing the numbers]**
   Prices and minutes are shown, effects are not. The only numbers (for example "residue ×0.3 · underlayer attack ×1.5") appear on the DOE screen. Players priced items by replaying whole runs. The min-maxer measured the copper bath at about 4 points for 200 cash, DUV resist 2.4 points for 140, the pad conditioner 0.9 for 350, and inline metrology at nothing for 500. (fab-engineer, spire-veteran, student, minmaxer)
   Evidence: `shots/spire-veteran/123456-09-s123-08-shop.png`, `shots/minmaxer/123456-12-shop1.png`; seed 42 step 14 (student).

### Hit by 3 personas

7. **Reload loses the whole run, and doubles as an undo. [A]**
   Reloading the page, or reopening the link, restarts the lot at 100% and 1500 cash. The phone persona lost about 3 minutes and called it the first real urge to quit. The min-maxer used the same behaviour as a free undo for a mis-tap and to scout every fork. (phone-5min, spire-veteran, minmaxer)
   Evidence: `shots/phone-5min/123456-13-s123456-12-reload.png` (seed 123456 step 12); seed 123456 step 6, seed 42 step 4 (minmaxer).

8. **Run-ending buttons sit right next to the main buttons, and PM buttons look identical. [A for labels; D for spacing and emphasis]**
   "Replay this seed" and "New seed" sit under "Continue" after every room, and "Scrap the lot" under "Go straight on". All six PM buttons read "PM this tool", with the tool name far above, and the min-maxer serviced litho instead of etch. A PM stop can be left without doing a PM and still charges 40 minutes. (fab-engineer, phone-5min, minmaxer)
   Evidence: `shots/phone-5min/123456-02-s123456-04-after1.png`, `shots/minmaxer/42-10-pm.png`; seed 42 step 12 (fab-engineer).

9. **Cash disappears with no message. [A]**
   20 cash vanished at CMP (seed 123456; the student saw 950 to 930). The player doesn't know why. (fab-engineer, student, minmaxer)
   Evidence: seed 123456 steps 20 and 24.

### Hit by 2 personas

10. **Numbers without units or scale. [C]** The hot lot's "+0.02 risk" has no unit (minmaxer). The site label "% of the 25 wafers still good there" can't give 98%, and SPC charts have no axis numbers (fab-engineer).
11. **The route and the events never vary. [C]** All three seeds had the same nine rooms in the same order and only two events appeared across three runs. Every event can be skipped for free with "Continue" (spire-veteran, minmaxer).
    Evidence: `shots/spire-veteran/42-29-s42-06-event.png`, `shots/minmaxer/42-34-quiet-event.png`.

### Hit by 1 persona (kept because the severity is high or the fix is cheap)

12. **Statements a new hire would take as true but are false or doubtful. [C, send to `physics-reviewer` before changing anything]** From the fab engineer, each from on-screen text:
    - "No SPC chart here: the metrology gauge is the reference." Gauges drift too.
    - "Post-exposure delay T-top" offered on an i-line positive resist lot (a chemically amplified resist problem).
    - "Keyhole void... on narrow vias" on a route with no vias.
    - "Native oxide" in the Q-time after trench etch, where nothing is bare silicon.
    - A "DOE" that only speeds up a metrology sampling plan.
    - An unqualified second-source slurry offered mid-lot as a normal choice.
    - An auditor walk-through that holds the lot for 30 minutes.
    Evidence: `shots/fab-engineer/123456-35-s123456-24-met.png` and the other shots named in `fab-engineer.md` problem 5.
13. **The wafer map and the headline yield disagree, and the map is a square. [A, with D for the map shape]** After step 1 on seed 123456 the map shows thirteen 99s and twelve 98s, which can't average to the 99.1% in the header. The map is a 5×5 square, not a round wafer (fab-engineer). Evidence: `shots/fab-engineer/123456-02-s123456-04-room1-result.png`.
14. **Shopping makes the score worse, and rejected lots are unpaid. [A]** Cost per good die was 5.97 with no purchases and 7.36–7.77 with them. The best yield (seed 777) had the worst cost score. The rational move is to buy nothing (minmaxer). Evidence: `shots/minmaxer/777-38-report.png`.
15. **Seeds that are not ordinary numbers silently become a random seed. [A]** "abc", -5 and a 20-digit number all give a free reroll (minmaxer).
16. **Nothing explains the game on the first screen, and nothing can be looked up. [C for text; A for a glossary or help screen]** A lot is never defined (the student found "25 wafers" in a caption); PM, DOE, CMP, CD and SPC are never spelled out; no word is tappable. The student's report has a 36-term jargon table (`student.md`). Evidence: `shots/student/123456-00-s123456-01-floor.png`.
17. **Phone layout. [D, with A for screen flow]** In most rooms the only button is below the fold on a page about twice the phone's height, with no hint it is there. The PM / DOE screen is about four phone screens tall. Evidence: `shots/phone-5min/123456-01-s123456-02-room1.png`, `shots/phone-5min/42-04-s42-02-pm.png`.

## What the personas liked (one each, all earned)
- The "this room will cost about X" forecast (spire-veteran, minmaxer): accurate within 0.2 every time. Fix the lever problem (issue 1) and this line already works.
- The route, Q-time placement, one- vs two-sided spec limits and item tradeoff text (fab-engineer).
- The Q-time corridor sentence about native oxide (student).
- The shop and events fit on one phone screen and state their tradeoff (phone-5min).

## Caveats
- These are simulated players reading only the screen. Issue 1 may be intended tuning that has not been balanced yet (the project says content numbers are placeholders until the bot balance pass); it is listed because every player hit it first.
- The diagnosis "contradictions" in issue 2 (edge ring with red inner sites) are things the screen showed the player. Whether the engine's scoring is wrong, or the signature text promises more than the map delivers, is for Lane C and A to check.
- The student's "Loading the floor plan…" screen was a timing gap in my own driver (it looked before the page had drawn), not a game bug. I fixed the driver and left it out.
- A rate limit stopped all five personas partway. Three of them reopened their seeds and replayed the same moves; they got identical results, which confirms a seed replays exactly.
- I could not check what the personas read beyond the commands in their transcripts. None touched `src/`, `tools/`, `tests/`, `tasks/` or `docs/` outside `docs/playtest/`.
