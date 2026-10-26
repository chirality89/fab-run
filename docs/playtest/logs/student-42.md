# Student log, seed 42

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/student/42-00-floor.png, docs/playtest/shots/student/42-00-floor2.png
I see: First shot caught "Loading the floor plan…" with nothing else for a moment. Then the same floor plan as before, but now three rooms have red SPC badges: Wet clean (step 1), Etch (4), Wet clean (5).
I think: Same factory, same route — it's always Inlaid Cu line? OK. More red flags this time. Last time etch was the killer, so my plan is: do everything I can for etch.
I try: Enter step 1.
Mood: curious

### Step 2 — Wet clean (out of control)
Screenshot: docs/playtest/shots/student/42-01-room1-spc.png
I see: SPC chart with a red square above the dashed line. "Out of control: the particle adders may be shifting. A shifted tool costs yield in this room. • A point beyond the upper control limit." But the forecast says "about 1.0 points" — the same as the healthy wet clean in my first run.
I think: Nice, the chart and the red square and the rule text all line up — I actually learned what "out of control" means: a point outside the dashed lines. But the scary red text says it costs yield, and the forecast number is identical to a healthy tool. So is the warning real or not? Also: "the last lot measured: 17.0" is right in the middle; the red square is an older point. So which one matters?
I try: Run wet clean. Result 100 -> 99.1, same as last run. The red flag cost me nothing.
Mood: confused

### Step 3 — Corridor, PM/DOE
Screenshot: none
I see: PM / DOE offered right after step 1 this time. Etch, wet clean (step 5) and deposition (step 6) all show "Out of control".
I think: Learning from run 1: PM on etch did not stop the 20-point loss. So this time I'll try the DOE on the over-etch card instead, and PM etch at the next stop.
I try: Run this DOE (Timed over-etch), 100 cash.
Mood: curious

### Step 4 — Deposition (SiN + oxide)
Screenshot: none
I see: Cost 1.2. No cards. 99.1 -> 97.9.
I think: Nothing to do. Again.
I try: Run, continue.
Mood: bored

### Step 5 — Corridor, PM etch
Screenshot: none
I see: PM / DOE again. Etch out of control.
I think: Now PM etch.
I try: PM the Etch tool. "PM done: the next lots run on a restored tool".
Mood: curious

### Step 6 — Litho
Screenshot: none
I see: Cost about 6.6. Same unplayable "Strip and re-expose: Can't play: Its condition is not met".
I think: Two runs, same dead card. I still don't know what its condition is. Litho costs ~6–7 every time no matter what; I've never been offered anything to change that.
I try: Run litho. 97.9 -> 91.7.
Mood: bored

### Step 7 — Procurement
Screenshot: none
I see: "Optical endpoint detector, 600 cash, Equipment · Etch. Expensive, and only helps when there is a clear film change to detect." Also pad conditioner and copper bath.
I think: Endpoint detection — sounds like it watches the light from the plasma and stops when you break through to the next layer. That I can kind of picture, and it's a real "oh neat" idea. Do I have "a clear film change"? I put down SiN + oxide, so maybe? The game doesn't say if my stack qualifies. Buying it because etch is the monster.
I try: Buy the endpoint detector (cash 1400 -> 800).
Mood: hooked

### Step 8 — Etch
Screenshot: docs/playtest/shots/student/42-16-etch.png
I see: Endpoint detector in slot. PM mark on chart. DOE'd card "Timed over-etch, DOE-centred". Forecast: "about 21.4 points".
I think: I threw a PM, a DOE, and 600 cash at this room, and it still predicts 21 points?? Last time with only a PM it said 23. So my 700 cash bought ~2 points. What is the actual cause? The game isn't telling me, and I've now done every single thing it offered for etch.
I try: Play the DOE card: forecast 21.4 -> 17.2. Run etch.
Mood: annoyed

### Step 9 — Etch result
Screenshot: docs/playtest/shots/student/42-18-etch-result.png
I see: 91.7 -> 74.3, cost 17.4. Map mostly beige 70–84, two red sites (65, 66) top-left area.
I think: Better than last time (19.6 -> 17.4) but it's mostly the card, not my 600-cash detector. 4 points above spec with 5 rooms to go. Last time those 5 rooms cost ~13 points. I'm going to fail again unless something changes, and I can see it coming. That's a kind of clarity, but not fun.
I try: Continue.
Mood: about to quit

### Step 10 — Event after etch: quality audit again
Screenshot: none
I see: Same quality-audit event as run 1. Walk through (+30 min, wet clean tool serviced) or -100 cash.
I think: This time wet clean (step 5) IS flagged, so servicing it makes sense. Nice that the same event means something different depending on the flags.
I try: Walk them through now.
Mood: curious

### Step 11 — Resist strip + wet clean
Screenshot: docs/playtest/shots/student/42-22-wetclean5.png
I see: Chart still says "Out of control … A point beyond the upper control limit". No PM mark. Forecast 0.7. Ran: 74.3 -> 73.5.
I think: The auditor "serviced" this tool, but the chart doesn't show it, unlike the PM which drew a PM line. Did the service happen? And again the red warning costs basically nothing (0.8 vs 0.6 last run on a healthy tool). I'm learning to ignore red SPC text on wet clean, which is probably the wrong lesson.
I try: Continue.
Mood: confused

### Step 12 — Q-time corridor, Deposition (barrier + seed)
Screenshot: none
I see: Q-time text again. Went straight on. Deposition forecast 4.0, cost 3.3. 73.5 -> 70.2.
I think: Barrier + seed deposition is always 3–4 points with nothing to play. I'm at 70.2 with plating and CMP to go.
I try: Continue.
Mood: about to quit

### Step 13 — Procurement before plating (deliberately bought nothing)
Screenshot: none
I see: Same three items. I bought nothing this time to compare with run 1.
I think: Experiment: last run plating with the copper bath cost 2.2.
I try: Continue to plating.
Mood: curious

### Step 14 — Plating without the bath
Screenshot: docs/playtest/shots/student/42-30-plating-result.png
I see: Forecast "about 6.2 points" with an empty slot. Cost 7.1. 70.2 -> 63.1.
I think: So the 200-cash bath was worth about 4–5 points. I only found that out by running a controlled experiment across two runs. The shop never says "without this, plating costs ~6". I learned something real-ish though: the additives make the fill work. I'd tell a friend "copper plating needs special additives so trenches fill from the bottom".
I try: Continue.
Mood: curious

### Step 15 — CMP and Metrology
Screenshot: none
I see: CMP forecast 7.7 with no conditioner (last run 6.6 with it, so the 350-cash conditioner was worth ~1 point). Cost 7.7. 63.1 -> 55.4. Metrology: nothing to play this time, 0 points. "Lot rejected".
I think: Two runs, two rejections, both basically decided at etch. The browser died on me here; I reopened the same seed and redid exactly the same moves and got exactly the same 55.4%, so at least it's fair and repeatable.
I try: See the ship report.
Mood: annoyed

### Step 16 — Ship report + Diagnose
Screenshot: docs/playtest/shots/student/42-37-ship-report.png, docs/playtest/shots/student/42-37-ship-spc.png, docs/playtest/shots/student/42-38-diagnosed.png
I see: 55.4%, cost per good die 7.79, 273 min. A different set of four failure modes than last time: Handling particles / Etch residue / Post-exposure delay T-top / Removal-rate drift. Edge ring is not offered. SPC after the run: Wet clean has the red square; Deposition says "Out of control" but I can't see any red square on its chart; Etch rate dipped low before my PM.
I think: Wet clean was red-flagged at step 1 and step 5 and the option says "particle adders climb on the wet clean SPC chart", so I guess Handling particles. But honestly the etch chart also shows the rate dropping before my PM, which is what "Etch residue" describes, and etch was where I lost 17 points. Wet clean cost me under 1 point each time. So whichever one is "right", the game's yield numbers don't point at it. Deposition says out of control with no visible bad point — what rule tripped? It doesn't list one like wet clean did.
I try: Handling particles.
Result: "Diagnosed: Handling particles. Written in your notebook. Unlocks for later runs: Pre-deposition clean. (Unlocks start to count in a later update.)"
I think: I got it right, but it feels like I guessed by matching words ("wet clean SPC chart") to the red badge, not by understanding. And the lot lost ~45 points; this failure mode explains maybe 2 of them. "Which failure mode hurt this lot" — it's the thing that hurt it LEAST. No explanation of what handling particles are, where they come from, or what I should have done. The reward ("Pre-deposition clean") doesn't count yet. And I still don't know where the notebook is; there's no button for it.
Mood: confused
