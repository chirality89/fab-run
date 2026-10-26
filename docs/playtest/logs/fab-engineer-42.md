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

(The game window closed on me here. Same seed, same choices: I reopened seed 42 and replayed the same taps. Everything came back identical — same yields, same charts. Good: that's how a fab should work too.)

### Step 4 — Deposition (SiN + oxide)
Screenshot: none
I see: Predicted 1.2, cost 1.2 points. 99.1% → 97.9%.
I think: Nothing to do here, again.
I try: Run, continue.
Mood: bored

### Step 5 — Corridor 2 → PM / DOE again
Screenshot: docs/playtest/shots/fab-engineer/42-06-s42-04-pm2-charts.png, docs/playtest/shots/fab-engineer/42-06-s42-05-pm2-dep.png
I see: Now a third DOE: Strip and re-expose "cd error ×0.2 · particles ×1.2" → "gentle strip" particles ×1.1. The deposition tool — the one that just ran my lot in control — is now "Out of control: may be shifting", but no rule is named and I can't see one on the chart: points wander both sides of centre, nothing past a limit. Wet clean still red from the old spike.
I think: Rework cutting CD error but adding particles is a fair tradeoff. The deposition flag: I can't find the reason on the chart. Sometimes the rule is named ("a point beyond the upper control limit"), sometimes not. If I can't see the rule I can't learn it.
I PM the deposition tool for step 6 (barrier + seed) — it cost me 3.8 points last run while in control. The wet clean spike already came back to centre.
I try: PM Deposition.
Mood: confused

### Step 6 — Litho bay
Screenshot: none
I see: CD 248.4 nm, in control. Predicted 6.6 points. Same greyed "Strip and re-expose — condition not met". Result 97.9% → 91.7%, 6.2 points.
I think: Same as run 1: litho takes ~6–7 points with a centred, in-control CD, every time, and gives me nothing to do. Whatever this loss is, it's a fixed tax. In a real fab, a centred litho step is not a 7% yield detractor on a 250 nm trench layer.
I try: Run, continue.
Mood: annoyed

### Step 7 — Procurement
Screenshot: docs/playtest/shots/fab-engineer/42-11-s42-06-procure.png
I see: Optical endpoint detector 600 ("expensive, and only helps when there is a clear film change to detect"), pad conditioner 350, three-additive bath 200.
I think: Endpoint text is correct — you need a film change, and oxide on SiN gives you one. That's my etch problem solved, I hope. Bought endpoint (600) and bath (200). Cash 1500 → 700.
I try: Buy both, go to etch.
Mood: hooked

### Step 8 — Etch
Screenshot: docs/playtest/shots/fab-engineer/42-14-s42-07-etch.png, docs/playtest/shots/fab-engineer/42-16-s42-08-etch-result.png
I see: Endpoint detector in the slot, tool freshly PM'd. Predicted 21.4 points (run 1, without endpoint: 23.0). Played timed over-etch → 18.1. Result 91.7% → 73.4%, 18.4 points. Map: edge ring again, centre 76–84, edge 63–71.
I think: I did everything an etch engineer would do: PM'd the drifting tool, added endpoint on a stack with a stop layer, over-etched into the stop. It bought me about 1.5 points over doing nothing smart. Still 18 points, still an edge ring. The game is telling me "trench etch always kills a fifth of the lot". That's false and I'd hate a new hire to believe it. If the edge ring is the cause, give me something that touches the edge (the "edge-tuned chuck" from my notebook — which doesn't count yet).
Also, I PM'd and spent 600 on an endpoint for 1.6 points. The 600 felt wasted.
I try: Continue.
Mood: about to quit

### Step 9 — Event: the same Quality audit
Screenshot: docs/playtest/shots/fab-engineer/42-18-s42-09-event.png
I see: Word-for-word the same auditor event as run 1. This time the wet clean really is flagged and is next.
I think: Already a repeat in run 2. At least now "a flagged tool gets fixed" fits.
I try: Walk them through (+30 min, wet clean serviced).
Mood: bored

### Step 10 — Resist strip + wet clean
Screenshot: none
I see: Predicted 0.7, cost 0.8. 73.4% → 72.6%. The chart STILL says "Out of control ... A point beyond the upper control limit", right after the auditor had it serviced. No PM mark on the chart.
I think: The tool was serviced and the chart doesn't show it. In real life you'd see a PM marker and the flag cleared by the next good reading. Here "serviced" left no trace.
I try: Run, continue.
Mood: confused

### Step 11 — Q-time corridor, barrier + seed
Screenshot: none
I see: Same Q-time warning. Went straight. Barrier + seed predicted 3.7 points, cost 3.1, on the tool I PM'd. 72.6% → 69.5% — under spec.
I think: Run 1, unPM'd and in control: 3.6 predicted. Run 2, PM'd: 3.7 predicted. The PM I spent 40 minutes on did nothing visible. So far a PM has never changed a prediction except at etch (by a couple of points).
I try: Continue.
Mood: about to quit

### Step 12 — Corridor → PM / DOE (my mistake)
Screenshot: none
I see: I went into PM / DOE meaning to PM the CMP tool, but hit the wrong button and ended up on "Continue" without doing a PM. The 40 minutes were charged anyway (cycle time 223 → 283 after plating and CMP, of which 40 was that stop).
I think: My fault for mis-tapping, but the screen let me leave a paid stop without doing anything and without a "you haven't chosen" check.
I try: Plating, then CMP.
Mood: annoyed

### Step 13 — Plating and CMP
Screenshot: none
I see: Plating with my three-additive bath: predicted 2.1 (run 1: 2.0), seam rate last 2.97% and still rising, "in control". Cost 2.4. CMP: removal rate 225.6, predicted 8.2, cost 8.2. 69.5 → 67.1 → 58.9.
I think: The bath bought nothing I can see. The seam-rate chart has climbed for ten lots and the game keeps calling it in control — a trend rule would have fired. CMP lost more than run 1 (I didn't buy the conditioner this time), so the conditioner was worth ~2 points. Fine, but I only learn that by comparing two runs.
I try: Straight to metrology, skip "measure all" (it did nothing last time), run, see report.
Mood: bored

### Step 14 — Ship report and diagnosis
Screenshot: docs/playtest/shots/fab-engineer/42-35-s42-10-report.png, docs/playtest/shots/fab-engineer/42-36-s42-12-diagnosis-cmp.png
I see: Rejected, 58.9%. Lot cost 2800 ÷ 368.3 good die = 7.60. Cycle 303 min. Diagnose options: Underlayer attack ("leakage on the dies with the most over-etch; the cross-section shows a notch in the film below"), Etch residue, Q-time oxide, Removal-rate drift. No edge ring option this time, though etch gave me an edge ring again. I picked Etch residue (biggest loss at etch, etch rate stepped down on SPC). Answer: "Not this one. What did hurt this lot: Underlayer attack."
I think: Lot cost: 2000 base + 800 I spent = 2800, so the base is 2000 — never shown anywhere. 625 × 58.9% = 368.1, matches.
Underlayer attack? I had a SiN etch stop under the oxide, the card text says the attack is reduced "with etch stop", I had an endpoint detector, and the clue says "the cross-section shows a notch". I was never shown a cross-section. Not once in two runs. "Leakage on the dies with the most over-etch" — which dies were those? The map doesn't show over-etch per site. This failure mode was undiagnosable from anything on screen. Worse, playing the over-etch card LOWERED the predicted loss, so the game's own numbers told me over-etch was helping. Then it blamed over-etch.
Also, a close look at the post-run etch chart: the low points before the PM sit just inside the lower control line, so I mis-read it earlier — but then the earlier "out of control" never named a rule. Without axis numbers I can't tell.
I'd quit here. Two runs, two rejects, both ~59%, and the biggest losses (litho ~6, etch ~18) don't respond to anything I do.
I try: One more seed because I was asked to.
Mood: about to quit
