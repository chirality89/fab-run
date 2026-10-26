# Fab engineer, not a gamer

## Where I would quit, and why
Seed 777, step 6, the etch result. The etcher was healthy, on target and in control, and I didn't over-etch. The room still took 22 points and dropped me under the customer spec at step 4 of 9. In seed 42 I PM'd the tool, bought an endpoint detector and over-etched into a SiN stop. That still cost 18 points. Nothing I do changes the two biggest losses (litho about 6, etch about 20), and yield can't come back. After etch the rest of the run is just pressing "Run" on a lot that's already dead. I'd come back if the big losses depended on what the screen shows me and what I choose.

## Problems
1. **Etch and litho losses are a flat tax, not physics.** Etch cost 19.6, 18.4 and 22.4 points across three runs: drifting and PM'd, PM'd with endpoint and over-etch, and healthy with no over-etch. Litho cost 5.7 to 6.9 points every run with the CD centred and in control. A new hire would learn that trench etch always kills a fifth of the lot. That's false. As a player I felt punished for nothing. Evidence: docs/playtest/shots/fab-engineer/777-15-s777-04-etch-result.png, docs/playtest/shots/fab-engineer/42-16-s42-08-etch-result.png, docs/playtest/shots/fab-engineer/123456-12-s123456-11-litho-result.png.
2. **Diagnosis can't be done from the evidence on screen.** Seed 42 blamed "Underlayer attack". Its clue is "the cross-section shows a notch in the film below", and I was never shown a cross-section. The route has a SiN etch stop, and playing over-etch *lowered* the predicted loss. In seed 777 the same failure mode happened with no over-etch at all. It also unlocks "Deposit SiN etch stop" and "Optical endpoint detector", both of which I already had. Seed 777 offered Dishing and Keyhole void after a lot I scrapped before plating and CMP, so I won by ruling those out, not by reading the evidence. Evidence: docs/playtest/shots/fab-engineer/42-35-s42-10-report.png, docs/playtest/shots/fab-engineer/777-19-s777-07-diagnosis.png.
3. **SPC flags don't mean anything.** The out-of-control wet clean in seed 42 cost 0.9 points. The in-control one in seed 777 cost 1.4. A single spike past the upper control limit, back to centre on the next lot, is called "may be shifting". That's an excursion, not a shift, and a new hire would learn the wrong word. Some flags name the rule and most don't, and the charts have no axis numbers. The wet clean the auditor "serviced" still showed out of control, with no PM mark. Plating seam rate climbed for ten lots and stayed "in control". Evidence: docs/playtest/shots/fab-engineer/42-01-s42-02-wetclean-spc.png, docs/playtest/shots/fab-engineer/42-36-s42-12-diagnosis-cmp.png.
4. **The wafer map and line yield don't agree, and the site number has the wrong unit.** After step 1 in seed 123456 the map shows thirteen 99s and twelve 98s, which can't average above about 99.0, but the headline says 99.1%. The map reads low every time. The label "% of the 25 wafers still good there" can't give 98%, which would be 24.5 wafers. The map is also a 5x5 square, not a round wafer. Evidence: docs/playtest/shots/fab-engineer/123456-02-s123456-04-room1-result.png.
5. **False statements a new hire would absorb.**
   - "No SPC chart here: the metrology gauge is the reference." Gauges drift; we chart them and do gauge R&R. Evidence: docs/playtest/shots/fab-engineer/123456-35-s123456-24-met.png.
   - "Post-exposure delay T-top" is offered on an i-line positive resist lot. T-topping is a chemically amplified resist problem.
   - "Keyhole void ... on narrow vias" on a route that has no vias.
   - "Native oxide" in a Q-time after the trench etch, where nothing is bare silicon.
   - A "DOE" that just makes a metrology sampling plan faster.
   - Switching to an unqualified second-source slurry "now", mid-lot, offered as a normal choice.
   - An auditor's walk-through holding the lot for 30 minutes, and asking them to come back later earning you a written finding.
6. **Most rooms have no decision, and paid items do nothing I can see.** Wet clean, both deposition rooms, plating and CMP were "press Run" in every run. The litho rework card was greyed out every time with "Its condition is not met", and it never says which condition. "Measure all 25 sites" took 150 cash and showed nothing new. The three-additive bath (200 cash) changed plating from 2.0 to 2.1 predicted points. The endpoint detector (600 cash) saved about 1.6 points. A PM on the barrier/seed tool changed nothing (3.6 points predicted without it, 3.7 with it). Cash also dropped by 20 at CMP with no message. Evidence: seed 123456 steps 9, 19 and 20; seed 42 steps 8 and 11.
7. **A mis-tap can throw away a run or a stop.** "Replay this seed" and "New seed" sit next to Continue on every room result in the middle of a run. A PM/DOE stop let me leave without doing anything and still charged the 40 minutes. Evidence: seed 42 step 12.

## Compliment
The route, the Q-time placement, one-sided vs two-sided spec limits, and the tradeoff text on rework, bath aging, pad conditioning, endpoint and the slurry change are all right. Someone who knows the fab wrote those.

## Ratings (1 = bad, 5 = great)
- Clarity: 2 — I can read every label, but I can't trace a single loss back to a cause I can see.
- Real decisions: 2 — about four choices per run, and none of them moved the two losses that decide the run.
- Wanting another run: 1 — three runs, three dead lots at about the same step, whatever I did. I wouldn't put a new hire in front of this yet.
