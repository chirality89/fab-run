# Fab engineer — seed 42 (second run, Inlaid Cu line again)

### Step 1 — Floor plan / start
Screenshot: docs/playtest/shots/fab-engineer/42-00-s42-01-start.png
I see: Same Inlaid Cu route, same nine rooms. This time SPC badges on Wet clean (1 and 5), Deposition (2 and 6), and Etch. Litho clean. Cash 1500, notebook 0.
I think: Wet clean is flagged in both room 1 and room 5, deposition in both 2 and 6 — confirms the game treats them as one tool each. Fine for wet benches maybe, wrong for oxide dep vs barrier/seed. No lot modifiers shown — no "tight spec" or "hot lot" warning, just the badges. Plan from last run: plating and CMP give me no cards, so the only levers there are PMs beforehand. And the diagnosis wants a mechanism, not the biggest-loss step. I'll watch the plating seam chart.
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean, with an excursion on the chart
Screenshot: docs/playtest/shots/fab-engineer/42-01-s42-02-room1-spc.png
I see: Particle chart with one red square above the UCL (just under spec), then the latest lot back at 17.0. Text: "Excursion: one lot measured past the control limit. Standard practice is to re-measure and check the tool. If it was a bad measurement or a one-off, the next lots come back inside the limits."
I think: That's a good lesson and correctly worded. One point out, next one back near centre: you check, you don't PM blindly. But the floor plan put a red "SPC" badge on this room exactly like it did for a real shift. A newcomer will treat both the same. Ran without the rinse: 100 → 99.3.
I try: Run wet clean, then PM / DOE in the corridor.
Mood: curious

### Step 3 — PM / DOE, seed 42
Screenshot: docs/playtest/shots/fab-engineer/42-04-s42-03-pm-charts.png
I see: Deposition "Shift" (adders above centre for a long run). Etch: a step down, two red squares below the LCL near the 268 spec, labelled only "Shift". Wet clean "Excursion" (still, though the chart has since come back). Plating rising steadily, last point ~3.2 just below UCL 3.5, "In control". CMP last point dropped to ~225.
I think: Etch is the real emergency — two points out of control, one step from spec. The label says "Shift", same word as the gentle deposition one; it should scream louder. Plating is the slow one that bit me last run, and it's further along this time. CMP dipping again. Deposition is used twice (steps 2 and 6), so a PM there pays double — that's a game-y reason, but real. Order: deposition now (before step 2), etch at the next stop (before step 4), plating at the stop after etch. 
I try: PM the Deposition tool.
Mood: hooked

### Step 4 — Room 2: Deposition (oxide), after PM
Screenshot: none
I see: Forecast 0.7, slots empty, pump-purge card now says "About 0.1 points more lost". Ran: 99.3 → 98.7.
I think: The PM'd room costs the same as a normal room. Fine, it's base loss. Still no option anywhere for an etch-stop layer in the dielectric stack, which the etch room told me last run was "set by the film stack".
I try: Run, corridor, PM / DOE → PM the Etch tool.
Mood: curious

### Step 5 — Room 3: Litho, centred tool
Screenshot: docs/playtest/shots/fab-engineer/42-11-s42-04-litho.png
I see: Litho in control, last lot 248.6 nm, nicely centred. Same hand: rework greyed with the same "no step on this route" message, and "Trim dose from the SPC trend ... only fixes a steady shift, not scatter ... About 0.4 points less lost in this room."
I think: The card's own text says it only fixes a steady shift. The chart shows no shift. And it still promises exactly 0.4 points, the same as last run on a just-PM'd tool. I played it to test: forecast 2.7 → 2.3, actual 2.0 lost. So it's a flat CD-error discount whatever the chart says. That's the false lesson in one card: "always apply APC, it always helps." In real life, trimming dose on a centred tool from noise just adds variance — that's the whole point of not tampering (Deming funnel). The text is right, the number is wrong.
I try: Played trim (to test), ran litho. 98.7 → 96.6.
Mood: annoyed

### Step 6 — Event: Hot lot request (again)
Screenshot: docs/playtest/shots/fab-engineer/42-15-s42-05-event.png
I see: Same hot-lot event as last run. This time I took it: "+150 cash, −30 min, +0.02 risk (about 2.0 points): random dots across the wafer."
I think: Same event twice in two runs. I took it to see whether "random dots" show up on the map and whether the diagnosis picks it up. Cash 1470 → 1620.
I try: Run it hot, continue to etch.
Mood: curious

### Step 7 — Room 4: Etch (trench)
Screenshot: docs/playtest/shots/fab-engineer/42-17-s42-06-etch.png, docs/playtest/shots/fab-engineer/42-18-s42-07-etch-result.png
I see: Forecast 11.3 points, 3.8 from depth variation "center to edge". PM'd tool, last pre-PM lot 277.7. Over-etch card has NO yield estimate this time. Effects line reads "underlayer attack ×2 · underlayer attack ×0.525 with etch stop". Ran it: 96.6 → 85.6, 11.1 points. Map 82–92, no obvious ring.
I think: 11 points in one etch step on a tool I just PM'd. The text says depth variation is centre-to-edge, but the map after etch doesn't show a centre-to-edge pattern at all — centre site 86, edges 82–85, a 92 off-centre. If the cause is radial, the map must be radial, otherwise what am I learning to read? Last run's edge ring came from the gas trim I bought, not from this. Two "underlayer attack" multipliers next to each other read like a typo. I still haven't seen where the hot-lot particles went — no separate line.
I try: Continue; PM the plating tool next.
Mood: confused

### Step 8 — PM plating, strip clean, Q-time, barrier/seed
Screenshot: none
I see: DOE list now offers the rinse and pump-purge. PM'd plating. Strip clean 85.6 → 85.0 (wet clean chart still shouting "Excursion" though the bad point is old news). Went straight through Q-time. Barrier/seed 85.0 → 81.5, 3.4 points, no breakdown again.
I think: The excursion label never clears. One point out, many lots back to normal — real SPC would close that out. Barrier/seed is a flat ~3.3 tax every run with no lever.
I try: Straight through; at the corridor before plating, PM CMP.
Mood: bored

### Step 9 — Plating and CMP (no cards again)
Screenshot: docs/playtest/shots/fab-engineer/42-30-s42-08-plating.png, docs/playtest/shots/fab-engineer/42-32-s42-09-procurement.png
I see: Plating after PM: 81.5 → 76.8, 4.7 points, only 0.1 from drift. Procurement before CMP: only Inline metrology for 500. CMP after PM, first lot 252.5 (centred): 76.8 → 70.8, 6.0 points.
I think: I PM'd both tools that bit me last run. Plating dropped from 4.4 to 4.7, CMP from 6.3 to 6.0. My PMs moved almost nothing — the losses in these rooms are fixed tax, and there are no cards to play. So the lesson the game teaches about plating/CMP is "nothing you do matters". Shipped by 0.8 points. Inline metrology still sits at the last step where it can't warn me of anything.
I try: Go straight, metrology, ship report.
Mood: annoyed

### Step 10 — Ship report + diagnosis
Screenshot: docs/playtest/shots/fab-engineer/42-36-s42-10-ship.png, docs/playtest/shots/fab-engineer/42-37-s42-11-diagnosis.png
I see: Shipped at 70.8%. Lot cost 1880 ÷ 442.8 = 4.25 per good die. Diagnose options: Chamber flaking, Dishing, Removal-rate drift, Q-time oxide. I picked Dishing → "Diagnosed: Dishing... cost 3.9 points at CMP. Unlocks: Add dummy fill to the mask, Low-pressure final polish."
I think: I got it right, but by elimination, not evidence: I'd PM'd deposition (rules out flaking), went straight through Q-time (rules out oxide), CMP removal rate centred after PM (rules out drift). The only evidence for dishing would be wide-line vs narrow-line resistance, and the game never shows me a line resistance or a cross-section. So "read the evidence" was really "read what you didn't do". Lot cost: 2000 + 30 trim − 150 hot-lot fee = 1880. The expedite fee is treated as a negative cost of the lot. Odd accounting but whatever. Unlocks are real-world fixes, good. Dummy fill is more of an erosion fix than a dishing fix (for wide-line dishing you slot the line), but close enough. The hot lot's 2 points of "random dots" never appeared anywhere I could see.
I try: Notebook.
Mood: curious

### Step 11 — Notebook
Screenshot: docs/playtest/shots/fab-engineer/42-38-s42-12-notebook.png
I see: One entry: Dishing, with its unlocks, "Found on seed 42". "19 failure modes still to find."
I think: 19 more. If they're all diagnosed by elimination like this, I'm not going to learn diagnosis, I'm going to learn the game's bookkeeping.
I try: Done with this run. Next: seed 777 on the NMOS lot.
Mood: curious
