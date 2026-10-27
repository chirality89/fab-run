# Student log, seed 777

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/student/777-00-floor.png
I see: Same Inlaid Cu line route. Only one red SPC badge this time: CMP (step 8). "Loading the floor plan…" flashed first again.
I think: I've diagnosed one thing, it said "Written in your notebook". Where's the notebook? Nothing on this screen mentions it. No help button, no glossary, no "?" anywhere. After two runs I still can't look up what CMP or DOE stand for.
I try: Enter step 1.
Mood: bored

### Step 2 — Wet clean
Screenshot: none
I see: In control. Cost 1.4. 100 -> 98.6.
I think: Healthy tool cost 1.4 this time; out-of-control tool last run cost 0.9. So much for red flags.
I try: Continue.
Mood: bored

### Step 3 — Procurement (early)
Screenshot: docs/playtest/shots/student/777-07-procurement.png
I see: Edge-tuned chuck 450 (Etch: "Better edge uniformity, more maintenance."), Chemically amplified DUV resist 140 (Litho: "Prints fine lines, but punishes any wait between expose and bake. Replaces the i-line positive resist"), copper bath 200.
I think: Edge-tuned chuck! Run 1 told me "Edge ring" hurt my lot at etch. So this is the counter. Feeling clever. DUV resist "punishes any wait between expose and bake" — and that's the T-top thing from the diagnose list, so I can link those two. "Chemically amplified" I can't explain but it sounds cool. Copper bath I know is worth ~4–5 points from my run-1 vs run-2 comparison.
I try: Buy all three (790). Cash 710.
Mood: hooked

### Step 4 — Deposition (SiN + oxide)
Screenshot: none
I see: Cost 2.3. 98.6 -> 96.3.
I think: More than the 0.9–1.2 of previous runs. No reason given.
I try: Continue.
Mood: bored

### Step 5 — PM / DOE
Screenshot: none
I see: A third DOE option now: "Strip and re-expose · cd error ×0.2 · particles ×1.2 -> gentle strip particles ×1.1".
I think: So "cd error" is a thing it fixes. Still no idea when that card becomes playable. DOE over-etch was worth ~4 points last time.
I try: DOE the over-etch (100).
Mood: curious

### Step 6 — Litho with DUV resist
Screenshot: docs/playtest/shots/student/777-13-litho.png
I see: Forecast 4.3 (vs 6.6–6.7 with i-line). Same dead "Strip and re-expose" card.
I think: The resist helped by ~2.5 points for 140 cash. Good, a purchase I can see working before I commit. I'll go straight to etch so there's no "wait between expose and bake" — though I don't actually know if a corridor stop counts as that wait, since the room said nothing about bake.
I try: Run litho (cost 3.8, 96.3 -> 92.5), straight to etch.
Mood: curious

### Step 7 — Etch with edge-tuned chuck
Screenshot: docs/playtest/shots/student/777-16-etch.png
I see: Tool in control, chuck in slot, DOE'd card. Forecast: "about 21.5 points".
I think: Are you kidding me. Three runs: PM'd tool 23, PM + endpoint detector 21.4, healthy tool + edge chuck 21.5. Etch costs ~21 no matter what I do. Either there's a thing I'm missing that the game never mentions, or etch is just a fixed 17-point tax and the "right" play doesn't exist. The card trims 4. That's it. This is the moment I'd quit if I were playing for fun: I've tried everything on offer for this room and it doesn't move.
I try: Play the card (21.5 -> 17.2), Run etch.
Mood: about to quit

### Step 8 — Etch result
Screenshot: docs/playtest/shots/student/777-18-etch-result.png
I see: 92.5 -> 75.8 (16.7). Map all beige 70–84, one red 68 corner. Edge row a bit lower than middle.
I think: 450 cash on a chuck and the result is the same as run 2 without it.
I try: Continue.
Mood: about to quit

### Step 9 — PM CMP, wet clean, deposition
Screenshot: none
I see: PM'd CMP (the one flagged tool). Wet clean 1.3 (74.5). Deposition barrier+seed 5.8 (68.7).
I think: Below spec at step 6 for the third time. Deposition barrier+seed varies 3.3–5.8 with nothing to play and nothing explained.
I try: Straight on.
Mood: about to quit

### Step 10 — Plating, CMP
Screenshot: docs/playtest/shots/student/777-31-cmp.png
I see: Plating with bath: 2.0 forecast, 1.9 lost. CMP: just PM'd, forecast 8.2, lost 7.4. 59.5% final. Rejected.
I think: I PM'd CMP and it cost MORE (7.4) than in run 1 when it wasn't flagged and I had the pad conditioner (6.2). So PM on a flagged tool doesn't visibly help, ever. I've stopped believing the SPC flags mean anything for my yield.
I try: See the ship report.
Mood: annoyed

### Step 11 — Ship report + Diagnose
Screenshot: docs/playtest/shots/student/777-36-ship-report.png, docs/playtest/shots/student/777-37-diagnosed.png
I see: 59.5%, 7.77 per good die, 218 min. Options: Edge ring / Keyhole void / Post-exposure delay T-top / Dishing ("Wide lines are thin and high-resistance; narrow lines are fine."). Final map is uniformly 52–67, no ring.
I think: Etch is again the big loss (16.7) and the edge row was a touch worse after etch, and run 1 taught me "etch loss = edge ring". CMP was flagged, though, and dishing sounds like polishing too much — but the description talks about wide vs narrow lines, and nothing on screen shows me line widths. The wafer map can't show "wide lines thin". I'm guessing Edge ring based on last time.
I try: Edge ring.
Result: "Not this one. What did hurt this lot: Dishing."
I think: Looking back at all three: the answer each time was the tool that had a red SPC badge on the floor plan at the start (etch -> edge ring, wet clean -> handling particles, CMP -> dishing). So the trick is "look at the starting badge", not "read the yield table". That's a pattern-match, not physics. And it contradicts the yield table every time: the "failure that hurt this lot" was never the room where I lost the most. I still can't tell a friend what dishing actually is or why a PM didn't stop it.
Mood: about to quit
