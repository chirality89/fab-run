# Fab engineer playtest log — seed 42

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/fab-engineer/42-00-s42-01-first.png
I see: Same 9-step inlaid Cu route. This time SPC badges on wet clean (steps 1 and 5, same tool) and etch. Different side-stop tags in the corridors. No lot modifiers shown — same as last time.
I think: From run 1 I know: rooms are mostly "press Run", etch is where the lot dies, PM costs time not cash, and the only real levers are the corridor stops. Plan: PM etch first chance I get. The wet clean is flagged at step 1 and I can't PM before step 1 — so I eat it.
I try: Enter step 1.
Mood: curious

### Step 2 — Wet clean (flagged)
Screenshot: docs/playtest/shots/fab-engineer/42-01-s42-02-wetclean-spc.png
I see: Particle adders chart with one red square above the upper control limit two lots ago, last lot back at 17.0. "Out of control: the particle adders may be shifting." Bullet: "A point beyond the upper control limit". Predicted cost 1.0 points — the same as the in-control wet clean in run 1. Result 0.9 points, identical to run 1.
I think: Good that it names the rule this time. Bad that the reading of it is wrong: one point beyond the limit, then right back to centre, is a spike — an excursion — not a "shift". A shift is a run of points on one side. New hire learns to call any single outlier a shift. And then the out-of-control tool cost me exactly the same as the in-control one last run. So the red text was a scare with no consequence. Why should I trust the next red text?
I try: Run, continue.
Mood: annoyed

### Step 3 — Corridor 1 → PM / DOE
Screenshot: docs/playtest/shots/fab-engineer/42-04-s42-03-pm-charts.png
I see: Etch rate chart: eight points around centre, then the last three stepped down, sitting on or under the lower dashed control line — but drawn as ordinary blue dots, no red squares. Wet clean chart shows the red square spike. Plating seam rate trending up again, CMP removal rate last point dropping.
I think: The etch chart is the textbook picture of a shift — a step change down, sustained. That's a real signal and I'd hold the tool. But the key says "a red square is beyond control", and these points look beyond the lower control line with no red square. Either I'm misreading the scale (there are no axis numbers) or the chart contradicts its own key. Etch rate dropping → under-etch → residue at the trench bottom. That's what I'll expect if I don't PM.
Only one stop per corridor, so etch now, and I hope there's another PM stop before step 5 for the wet clean.
I try: PM the etch tool. Cash stays 1500.
Mood: hooked
