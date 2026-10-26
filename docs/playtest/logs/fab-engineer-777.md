# Fab engineer playtest log — seed 777

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/fab-engineer/777-00-s777-01-first.png
I see: Same route. Only CMP carries an SPC badge this time. Different arrangement of side stops.
I think: Two runs taught me litho costs ~6 and etch ~20 whatever I do. This run I'll test that: PM the flagged tool, keep my cash, and at etch I will NOT play over-etch, to see whether over-etch is what caused the "underlayer attack" that run 2 blamed.
I try: Enter step 1.
Mood: bored

### Step 2 — Wet clean
Screenshot: none
I see: In control, predicted 1.3 points, cost 1.4 (100.0 → 98.6).
I think: In-control wet clean costs 1.4 here; the OUT-of-control wet clean in seed 42 cost 0.9. The red SPC text clearly isn't what drives the loss. That breaks the one thing I'd want a new hire to take away from SPC.
I try: Run, continue.
Mood: annoyed

### Step 3 — PM / DOE: CMP flagged
Screenshot: docs/playtest/shots/fab-engineer/777-04-s777-02-pm-charts.png
I see: CMP removal rate: most of the last points sit above centre, none past a limit. "Out of control: the removal rate may be shifting." No rule named. All other tools in control.
I think: Plausibly a run rule (8 of 9 on one side). Again it doesn't say which. I PM it anyway.
I try: PM CMP. Then deposition (SiN + oxide): predicted 2.3, cost 2.3, 98.6 → 96.3.
Mood: curious

### Step 4 — Event: Supplier change
Screenshot: docs/playtest/shots/fab-engineer/777-09-s777-03-event.png
I see: "Purchasing offers a cheaper CMP slurry from a second supplier, available now." Switch now: +150 cash, CMP tool steps off target until re-tuned. Or keep the qualified slurry.
I think: This one is real. Second-source slurry shifting removal rate is exactly what happens. But in any fab I've worked in, you can't just "switch now" on a production lot — a material change goes through change control and qualification first. Offering it as a quick shift-floor decision teaches a bad habit. A line saying "unqualified" would fix the lesson.
I try: Keep the qualified slurry.
Mood: curious

### Step 5 — Litho
Screenshot: none
I see: CD 253.5 nm, in control, predicted 6.5, 96.3 → 90.6 (5.7 points). Same greyed rework card.
I think: Third time: litho is a flat 6-point tax and the rework card has never once been playable. I still don't know its condition.
I try: Go straight to etch.
Mood: bored

### Step 6 — Etch, no over-etch
Screenshot: docs/playtest/shots/fab-engineer/777-15-s777-04-etch-result.png
I see: Etch rate 302.7 nm/min, on target, in control. Predicted 22.7. I did NOT play over-etch. Result 90.6 → 68.2, 22.4 points. Edge-ring map again (edge 59–66, inner 71–84). Bar turns orange: under spec.
I think: That settles it. Healthy etcher, on target, no over-etch: 22 points. Run 1 with PM + over-etch: 19.6. Run 2 with PM + endpoint + over-etch: 18.4. Whatever I do, trench etch takes about a fifth of the lot as an edge ring. That's not a decision, it's a tax. A new hire would walk away believing etch always kills 20% of a lot. It doesn't.
Under spec at step 4 of 9 and yield never goes up. Five more rooms will only take it lower. This is where I'd quit — and in a fab, this is where I'd scrap.
I try: Scrap the lot.
Mood: about to quit

### Step 7 — Scrap
Screenshot: docs/playtest/shots/fab-engineer/777-17-s777-05-scrap.png, docs/playtest/shots/fab-engineer/777-18-s777-06-scrapped.png
I see: Confirmation "Scrap this lot? The run ends, and everything spent on it is lost." Then report: "Scrapped by you before step 5 ... at 68.2% yield." Lot cost 2000, all lost. Cycle time 118 min (10 + 40 PM + 15 + 10 event + 35 + 8 — adds up).
I think: Good — a confirmation and a straight verdict. The 2000 base lot cost finally shows up in words.
Diagnose options: Dishing, Keyhole void, Post-exposure delay T-top, Underlayer attack. The lot never reached plating or CMP, so dishing and keyhole void are impossible — they're free eliminations, which makes the "diagnosis" a guessing game, not reading evidence. Underlayer attack is the only etch option, even though I didn't over-etch.
I try: Underlayer attack.
Mood: annoyed

### Step 8 — Diagnosis
Screenshot: docs/playtest/shots/fab-engineer/777-19-s777-07-diagnosis.png
I see: "Diagnosed: Underlayer attack. Written in your notebook. Unlocks for later runs: Deposit SiN etch stop, Optical endpoint detector, Stop on endpoint."
I think: Right by elimination, not by evidence. And the unlocks contradict the run: step 2 is literally "Deposition (SiN + oxide)" — I already had a SiN etch stop every run. The optical endpoint detector was already sold to me in seed 42 and didn't stop the loss. So the fix the game teaches for underlayer attack is something I already had. And "attack" happened without any over-etch, while the clue says "dies with the most over-etch". Cause and effect don't line up.
Done. Three lots, two rejected at ~59%, one scrapped at 68%.
I try: Close.
Mood: about to quit
