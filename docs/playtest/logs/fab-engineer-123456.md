# Fab engineer playtest log — seed 123456

### Step 1 — Floor plan (first screen)
Screenshot: docs/playtest/shots/fab-engineer/123456-00-s123456-01-first.png
I see: "Inlaid Cu line", yield 100.0%, cash 1500, cycle time 0 min. Nine rooms snaked across a grid: wet clean, deposition, litho, etch, wet clean, deposition, plating, CMP, metrology. Little tags between rooms (MET, PM, BUY, EVT, QT). Etch already has a red "SPC" badge. One button: enter step 1.
I think: That is a sensible single-damascene flow: clean, dielectric dep, pattern, etch the trench, clean, barrier/seed, ECP, CMP, measure. Good. Q-time between the post-etch clean and barrier/seed is exactly where I'd put one. Etch already flagged on SPC before I've touched anything — fine, that's a warning, I'll look at it when I get there. I don't know what the tags between rooms do yet or whether I get to choose them.
I try: Enter step 1.
Mood: curious

### Step 2 — Wet clean room
Screenshot: docs/playtest/shots/fab-engineer/123456-01-s123456-02-room1.png, docs/playtest/shots/fab-engineer/123456-01-s123456-03-room1-spc.png
I see: Line yield 100.0% with a bar marked scrap 40% and spec 70%. "This room will cost about 1.0 points of yield if nothing changes." A 5x5 grid of 100s called the wafer map. Time budget 10 of 10 min. Slots: empty. Tool SPC: particle adders per wafer, centre 20, control 8–32, spec up to 36. Hand: "No practices left in your hand." One button: Run wet clean.
I think: The wafer map is a square. A wafer is round; edge die exist and they behave differently. A 5x5 square of "sites" will not show me an edge ring or a centre-to-edge pattern the way a real map does. Hold that thought.
Particle adder chart: one-sided upper spec, correct direction — adders are only bad when high. The lower control limit of 8 is statistically fine but nobody acts on "too few particles". The chart has no y-axis numbers, so I have to read the caption to know the scale.
"No practices LEFT in your hand" on the very first room — I never had any. Left from what? Is something broken, or does wet clean just have no decisions? If it's the latter, say so.
"Cost about 1.0 points of yield" — points, i.e. percentage points of line yield? Fine.
I try: Run wet clean — it's the only thing I can press.
Mood: curious

### Step 3 — Wet clean result
Screenshot: docs/playtest/shots/fab-engineer/123456-02-s123456-04-room1-result.png
I see: 100.0% → 99.1%, "This room cost 0.9 points of yield." Wafer map now 98s and 99s. Buttons: Continue to the corridor, Replay this seed, New seed.
I think: I check the map. Thirteen sites read 99, twelve read 98. Even if every 99 is really 99.49 and every 98 is really 98.49, the average can't get above about 99.0. The headline says 99.1. So either line yield isn't the average of the map, or the map is lying. On the first room I already can't reconcile the two numbers that matter. Also, "% of the 25 wafers still good there" — with 25 wafers, a site can be 96% or 100%, not 98%. 98% of 25 wafers is 24.5 wafers. Either it's an expected yield, not a count, or the label is wrong. A new hire would learn a wrong idea of what a wafer map number means.
And why do I get "Replay this seed / New seed" in the middle of a run, right next to Continue? One mis-tap throws the run away.
I try: Continue to the corridor.
Mood: annoyed

### Step 4 — Corridor after step 1
Screenshot: docs/playtest/shots/fab-engineer/123456-03-s123456-05-corridor.png
I see: Cycle time now 10 min. Side stops: Metrology +20 min "reveals hidden values (coming in a later update)", Event +10 min "A choice with a tradeoff". Go straight to step 2. Scrap the lot.
I think: Metrology that does nothing yet — then why offer it? I won't waste 20 min on a placeholder. The wet clean took 10 minutes of cycle time for the lot. Cycle time in a fab is days; a whole lot through a wet bench in 10 min is short but it's a game, I'll let it go. I don't know what the minutes cost me yet — is there a cycle-time spec? Nothing tells me. Let me try the event to see what it is.
I try: Event.
Mood: curious

### Step 5 — Event: Quality audit
Screenshot: docs/playtest/shots/fab-engineer/123456-04-s123456-06-event.png
I see: "A quality auditor ... wants to walk the line your lot is on." Option A: walk them through, +30 min cycle time, wet clean tool serviced, "a flagged tool gets fixed". Option B: ask them to come back later, −100 cash, "a written finding costs corrective-action work". Also a Continue button already live.
I think: The cause and effect here is backwards. An auditor walking the line doesn't make my lot wait 30 minutes — the lot keeps moving, the auditor walks. And asking an auditor to come back later doesn't by itself produce a written finding; you'd get a finding for what they find, not for scheduling. "A flagged tool gets fixed" — but the wet clean tool isn't flagged. Etch is the one with the SPC badge. The text on choosing says the auditor flagged the wet bench as overdue — OK, that half-works, but I couldn't know that beforehand. It reads like corporate flavour, not a real decision. Also the screen says "Choose one option" but the Continue button lets me skip it — can I?
I try: Walk them through now (wet clean comes up again at step 5, so a serviced bench might help).
Mood: confused

### Step 6 — Deposition (SiN + oxide) room and result
Screenshot: docs/playtest/shots/fab-engineer/123456-06-s123456-07-dep.png
I see: Same layout as wet clean. 15 min budget, empty slots, particle-adder SPC (centre 15, spec up to 31), "No practices left in your hand." Only button: Run deposition. Result 99.1% → 98.2%, 0.9 points.
I think: Two rooms in and I still haven't made a decision inside a room. The deposition room's chart is particles only — for a dielectric stack I'd want thickness or RI, but particles is the yield killer, so fine as a simplification. 99.1 × 0.991 = 98.2, so the losses do multiply. Good. Cycle time jumped to 65 min: 10 wet clean + 10 event + 30 audit + 15 dep. Adds up.
I try: Run deposition, then continue to the corridor.
Mood: bored

### Step 7 — Corridor after step 2
Screenshot: none
I see: Side stops: PM / DOE +40 min, Procurement +10 min, Event +10 min. Or go straight to Litho (trench).
I think: Etch has had an SPC flag since the start. That's the obvious use of a PM.
I try: PM / DOE.
Mood: curious

### Step 8 — PM / DOE stop
Screenshot: docs/playtest/shots/fab-engineer/123456-09-s123456-08-pm.png, docs/playtest/shots/fab-engineer/123456-09-s123456-09-pm-charts.png
I see: Two DOE offers (100 cash each): "Timed over-etch (+20%)" for etch — DOE drops underlayer attack ×1.5 to ×1.25; "Measure all 25 sites" for metrology — DOE takes it from 20 to 12 min. Then six SPC charts for the tools ahead, each with a PM button. Etch rate: "Out of control: the etch rate may be shifting." All others in control. PM returns a tool to 75–95% health.
I think: Charts: litho CD, etch rate and CMP removal rate have limits on both sides; particle adders and plating seam rate only on top. That's the right direction for each one. Credit where due.
The etch chart: no point outside the limits, no red square, but it says out of control. I count most of the recent points sitting just below centre — a run rule, I assume. It should say which rule. A new hire needs to learn "9 in a row on one side" as a named thing, not "may be shifting".
CMP removal rate is creeping down toward the lower control limit and plating seam rate is creeping up, but both are "in control". Is that the telegraph? If so, it's subtle, which I like.
"DOE" on a metrology sampling plan to make it faster — that's not a DOE, that's a sampling-plan change. Wince. The over-etch DOE is legitimate: find the minimum over-etch that clears.
PM with no qual afterwards — "the next lots run on a restored tool". In real life you'd run a qual/seasoning wafer before releasing. Acceptable simplification.
I try: PM the etch tool.
Mood: hooked

### Step 9 — Litho bay (trench)
Screenshot: docs/playtest/shots/fab-engineer/123456-11-s123456-10-litho.png
I see: Cash still 1500 (so the PM was free, only time). 35 min budget. Slot already holds "i-line positive resist (material)". Monitor CD centre 250 nm, spec 234–266, last 252.2, in control. "This room will cost about 6.7 points of yield if nothing changes." One practice in hand: "Strip and re-expose, 30 min · 150 cash. Saves a bad exposure, but only before etch, and each strip adds handling particles." Greyed: "Can't play: Its condition is not met".
I think: i-line at 250 nm — that's pushing it but published i-line work goes there, OK. Strip-and-rework before etch, particles from handling — correct, that's exactly the real tradeoff. Good card text.
But: CD in control, last reading 2 nm off target, and the game says this room will eat 6.7 points. Why? Nothing on screen tells me where 6.7 comes from. Litho with an in-control CD shouldn't be the biggest yield hit on the line. And the one card I have says "its condition is not met" without telling me which condition. Is it "the exposure has to be bad first"? Then why is it in my hand before exposure?
Map check again: the averages of the map keep landing below the headline yield. Same story as wet clean.
I try: Run litho bay — nothing else to press.
Mood: confused

### Step 10 — Litho result
Screenshot: docs/playtest/shots/fab-engineer/123456-12-s123456-11-litho-result.png
I see: 98.2% → 91.2%, "cost 6.9 points". Map now scattered 86–96, a handful of dotted "warning" sites, top row mostly 87–88.
I think: 7 points gone at a step where my monitor CD was in control and I had no choices. The map is scattered with a slightly weak top row. If you showed me this map in a yield meeting I'd ask: is it litho at all? A top-row (one-side) loss looks like a focus/tilt or a handling issue. Nothing on screen links it to anything. Rule 6 of my trade: if you can't see a cause, you don't charge a loss to that step. As a player I feel punished for nothing.
I try: Continue.
Mood: annoyed

### Step 11 — Corridor after litho, Procurement
Screenshot: docs/playtest/shots/fab-engineer/123456-14-s123456-12-procure.png
I see: Cycle time 140 min (65 + 40 PM + 35 litho — adds up, and litho charged the full 35 min budget even though I played nothing). Procurement: Inline metrology 500 (shows drift sooner, used at step 9), In-situ pad conditioner 350 (CMP, "stable polish rate, but pads are consumed faster"), Three-additive copper bath 200 (bottom-up fill, "ages every lot and needs watching").
I think: The bath and the conditioner descriptions are right — accelerator/suppressor/leveller superfill and bath aging are real, and in-situ conditioning does trade pad life for rate stability. Inline metrology that "shows drift sooner" but sits at step 9, the last step — sooner than what? It's after everything it could warn me about.
CMP removal rate was creeping down and plating seam rate creeping up on the PM screen, so I'll buy for those two.
I try: Buy the bath (200) and the pad conditioner (350). Cash 1500 → 950. Continue to etch.
Mood: hooked

### Step 12 — Etch (trench)
Screenshot: docs/playtest/shots/fab-engineer/123456-17-s123456-13-etch.png, docs/playtest/shots/fab-engineer/123456-18-s123456-14-etch-played.png
I see: "This room will cost about 23.0 points of yield if nothing changes." Etch rate chart: "PM", "Just PM'd", last 296 nm/min vs 300 centre. 8 min budget. One card: Timed over-etch (+20%), 4 min, "clears residue but attacks the film below, unless an etch stop is there". After playing it: 19.7 points predicted. Hand empty, 4 min left. Nothing on screen shows the card was played or what it did, apart from the number.
I think: 23 points?! On a tool I just PM'd, etch rate 1% off target. Where does that come from? There's no explanation anywhere on this screen. I deposited SiN + oxide at step 2 — the SiN is the etch stop, so over-etch is the textbook move. It took 3.3 points off a 23-point loss. What is the other 19.7? Residue? Profile? Something from litho? I can't tell. I'm not diagnosing anything; I'm watching a number.
I try: Run etch.
Mood: confused

### Step 13 — Etch result
Screenshot: docs/playtest/shots/fab-engineer/123456-19-s123456-15-etch-result.png
I see: 91.2% → 71.6%, "cost 19.6 points". Map turned to red (fail) sites with a diagonal stripe and dotted (warning) sites: outer ring 63–69, centre site 87.
I think: Now that is a real pattern: edge ring low, centre high. Textbook etch edge non-uniformity, or edge-bead/edge exclusion. A new hire would look at that and say "etch uniformity at the edge". Good — finally a map that means something. But the game doesn't tell me if that was the cause, and the tool was just PM'd and centred. If a just-PM'd, on-target etcher still kills 20% of my lot as an edge ring, the lesson is "etch is just bad", which is false.
Also: the map average is about 71.1, the headline says 71.6. Same gap every time — the map always reads lower.
Line yield now 71.6, spec 70. One more bad room and I'm below spec.
I try: Continue.
Mood: annoyed

### Step 14 — Resist strip + wet clean
Screenshot: docs/playtest/shots/fab-engineer/123456-21-s123456-16-strip.png
I see: Same wet clean room. Predicted 0.7 points (was 1.0 at step 1 — the audit service helped a little). No practices. Result 71.6% → 71.0%.
I think: "Resist strip + wet clean" in a wet clean room — fine, could be a plasma ash plus wet, simplification is OK. The 30-minute audit bought me about 0.3 points. Not nothing, not much.
I try: Run, continue.
Mood: bored

### Step 15 — Corridor in the Q-time window
Screenshot: docs/playtest/shots/fab-engineer/123456-23-s123456-17-corridor-qt.png
I see: "Q-time window: native oxide keeps growing until the barrier goes on. Every minute the lot waits at a side stop here adds oxide risk." Metrology "+0.020 oxide risk", Event "+0.010 oxide risk".
I think: Good that Q-time is shown before I commit. But what oxidises here? After the trench etch and clean, the trench sits in oxide on a SiN stop. "Native oxide" is the term for silicon. If the trench lands on underlying copper it's Cu oxidation; if it's a low-k dielectric the real Q-time worry is moisture uptake. And "+0.020 oxide risk" — risk of what, in what unit? 0.02 of a point? 2%? I can't weigh it.
I try: Go straight to barrier + seed.
Mood: curious

### Step 16 — Deposition (barrier + seed)
Screenshot: docs/playtest/shots/fab-engineer/123456-24-s123456-18-barrier.png, docs/playtest/shots/fab-engineer/123456-25-s123456-19-barrier-result.png
I see: Predicted 3.6 points, particle SPC in control (12.7, below centre). No practices. Result 71.0% → 67.2%. Now under the 70% spec.
I think: I went straight through the Q-time with zero wait, the tool is in control, and still 3.8 points gone, four times the first dep room. Why? No evidence. Barrier/seed coverage on the trench sidewalls would be the real concern, but nothing on screen measures it. I'm now under spec and there's no way back — the game told me yield never goes up.
I try: Run, continue.
Mood: annoyed

### Step 17 — Event: Hot lot request
Screenshot: docs/playtest/shots/fab-engineer/123456-27-s123456-20-event2.png
I see: Run it hot: −30 min cycle time, +150 cash, "+0.02 risk: random dots across the wafer" (hand-carrying and manual loading add particles). Or keep its place in line.
I think: Hot lot = handling risk is believable. Expedite fee paid to me as cash is a stretch but fine for a game. That "+0.02 risk" unit again — I don't know if that's big.
I try: Keep its place in line. I'm under spec already; I don't want more particles.
Mood: bored

### Step 18 — Plating (Cu fill)
Screenshot: docs/playtest/shots/fab-engineer/123456-29-s123456-21-plating.png
I see: Bath slot holds the three-additive bath I bought. Seam rate centre 2.00%, last 2.53%. Predicted 2.0 points. No practices. Result 67.2% → 65.0%.
I think: I can't tell what the bath bought me — no "with/without" shown. Seam rate has been rising lot after lot and the chart still says in control. No anneal step between plating and CMP; real Cu gets annealed before CMP so the grains settle. Missing, but a simplification I'd accept.
I try: Run, continue, straight to CMP.
Mood: bored

### Step 19 — CMP
Screenshot: docs/playtest/shots/fab-engineer/123456-32-s123456-22-cmp.png, docs/playtest/shots/fab-engineer/123456-33-s123456-23-cmp-result.png
I see: Cash dropped 950 → 930 on entering, no message why. Pad conditioner in slot. Removal rate 226.9 vs 250 centre, control 220–280. Predicted 6.6 points. Result 65.0% → 58.8%.
I think: 20 cash vanished — I guess pad consumption from the conditioner, but nobody told me. Removal rate down 9% from target and near the lower control limit, with a conditioner I paid for to keep the rate stable, and it's still "in control" while costing me 6 points. Low removal rate → copper residue → shorts; that's real. But again no practice, no choice.
I try: Run, straight to metrology.
Mood: annoyed

### Step 20 — Metrology
Screenshot: docs/playtest/shots/fab-engineer/123456-35-s123456-24-met.png, docs/playtest/shots/fab-engineer/123456-36-s123456-25-met-played.png
I see: "No SPC chart here: the metrology gauge is the reference." One practice: Measure all 25 sites, 20 min, 150 cash. Played it: cash 930 → 780, time 0 left. Nothing new appeared on screen.
I think: "The gauge is the reference" is false and a new hire must not learn it. Gauges drift; we run gauge monitors and control charts on metrology tools and do gauge R&R. Then I paid 150 for "full information" and got no information. The wafer map already showed all 25 sites for free the whole run.
I try: Run metrology.
Mood: annoyed

### Step 21 — End: lot rejected, ship report
Screenshot: docs/playtest/shots/fab-engineer/123456-37-s123456-26-end.png, docs/playtest/shots/fab-engineer/123456-38-s123456-27-report.png, docs/playtest/shots/fab-engineer/123456-39-s123456-29-report-spc.png
I see: "Rejected: yield 58.8% is below the 70% customer spec." Cost per good die 7.41 = lot cost 2720 ÷ 367.3 good die. Cycle time 233 min. Yield-by-step table. Diagnose: Edge ring / Keyhole void / Etch residue / Post-exposure delay T-top. Post-run SPC charts.
I think: Maths: 625 die × 58.8% ≈ 367.5, matches 367.3. 2720 ÷ 367.3 = 7.41, right. But where's 2720 from? I spent 720; the other 2000 is never shown. 213 + 20 metrology = 233 min, adds up.
Diagnosis options: "Post-exposure delay T-top" on an i-line positive resist lot. T-topping from post-exposure delay is a chemically amplified resist problem (airborne amines poisoning the acid). Classic i-line novolac resist doesn't do that. As a distractor on this lot it teaches the wrong resist chemistry. "Keyhole void: opens on narrow vias" — this route has no vias, it's a trench line.
Edge ring: "only the outer ring fails; inner sites are clean." My inner sites read 56–64 — not clean. The description doesn't match the only map I was given, but etch made an edge ring and it's the best fit.
The step table says litho cost 6.9 and CMP 6.2 with nothing pointing at why. Only etch had a visible signature.
I try: Edge ring.
Mood: confused

### Step 22 — Diagnosis result
Screenshot: docs/playtest/shots/fab-engineer/123456-39-s123456-28-diagnosis.png
I see: "Diagnosed: Edge ring. Written in your notebook. Unlocks for later runs: Edge-tuned chuck. (Unlocks start to count in a later update.)"
I think: Right answer, but it doesn't tell me if I was right or wrong, or what actually happened. I want the real root cause back: "etch tool edge rate low because X". Without that the notebook is just a list of my guesses. And the unlock doesn't do anything yet.
Run summary: I made about four real decisions (PM etch, buy two items, one event, one over-etch card). Most rooms were "press Run". Lost 30% of the lot at litho + etch, most of it unexplained.
I try: Next seed.
Mood: annoyed
