# Min-maxer — seed 777

Plan: buy everything that helped, DOE the over-etch this time to price DOE, PM whatever is flagged, skip metrology.

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/minmaxer/777-00-map.png
I see: Same "Inlaid Cu line", same 9 rooms in the same order, cash 1500. Only CMP is flagged SPC this time. Corridors: 1 PM/BUY, 2 PM/BUY/EVT, 3 BUY/EVT, 4 PM/BUY/EVT, 5 QT, 6 MET/BUY/EVT, 7 PM/BUY, 8 MET/PM/EVT.
I think: Third seed, third identical line. The seed only reshuffles the side-stop tags and which tool is red. My solve from the first two seeds applies unchanged.
I try: Enter step 1.
Mood: bored

### Step 2 — Room 1 → Procurement
Screenshot: docs/playtest/shots/minmaxer/777-04-shop.png
I see: Room 1: 100.0 → 98.6 (1.4, higher than the 0.9 on the other seeds). Shop: Edge-tuned chuck 450 (Equipment, Etch, "Better edge uniformity, more maintenance."), DUV resist 140, copper bath 200.
I think: An etch item! Etch is the 20-point room and seed 123456 blamed "Edge ring". This should be the fix. 450 is a third of my cash, but cash doesn't win anything and the lot is "not paid" when rejected anyway. Buy all three.
I try: Buy chuck, DUV, bath. 1500 → 710.
Mood: hooked

### Step 3 — Room 2 → PM / DOE (corridor 2)
Screenshot: none
I see: Dep 98.6 → 96.3 (2.3). PM/DOE: all tools in control except CMP. DOEs: Timed over-etch, Measure all 25 sites, Strip and re-expose.
I think: Nothing on the route ahead of me is flagged for etch, so the PM here is wasted. Spend it on the over-etch DOE (100 cash) to see what "underlayer attack ×1.5 → ×1.25" is worth.
I try: Run DOE on Timed over-etch. 710 → 610. "DOE done: this card plays its tuned recipe from now on".
Mood: curious

### Step 4 — Litho → Etch with chuck + DOE'd over-etch
Screenshot: docs/playtest/shots/minmaxer/777-18-etch.png
I see: Litho forecast 4.3, actual 96.3 → 92.5. Etch slot: Edge-tuned chuck. Forecast 21.5 with chuck and a healthy (in-control) tool. DOE'd over-etch → 17.2. Actual 92.5 → 75.8 (16.7).
I think: Best etch so far — 16.7 vs ~20 — but I can't split it between chuck (450), DOE (100) and a healthy tool. Even all-in, etch eats 17 points. 450 cash for maybe 2 points. And I'm at 75.8 with CMP flagged ahead. Dead again, and I can already see it.
I try: Corridor 4: PM CMP (flagged), skip plating PM to find out what the bath does alone.
Mood: about to quit

### Step 5 — Rooms 5 and 6
Screenshot: none
I see: Wet clean 75.8 → 74.5 (1.3). Deposition (barrier + seed) 74.5 → 68.7 (5.8!). Not flagged, nothing I could play.
I think: 5.8 points from a room with no cards, no flag, and no item for sale. On 42 it was 3.3, on 123456 3.8. That's the scatter, and it alone pushed me under spec. Nothing to decide.
I try: Event.
Mood: annoyed

### Step 6 — Hot lot event (declined)
Screenshot: none
I see: Same hot lot offer. Took "Keep its place in line" to test whether the hot lot was what blew up CMP on seed 42.
I think: Controlled experiment.
I try: Keep its place.
Mood: curious

### Step 7 — Plating (bath, no PM) → CMP (PM'd)
Screenshot: none
I see: Plating forecast 2.0, actual 68.7 → 66.9 (1.9). CMP after PM: forecast 8.2, actual 66.9 → 59.5 (7.4).
I think: Plating: bath alone gives ~2 points loss vs ~6 without. The plating PM on 123456/42 was worth nothing; the bath did all of it. 200 cash for ~4 points = best buy in the game. CMP: PM'd the red tool and it still cost 7.4 — more than the unflagged CMP on 123456 (7.1) and the do-nothing 42 (6.7). So the PM on a flagged CMP is worth nothing I can measure, and the hot lot is not obviously what hurt 42's CMP either. The CMP forecast swings 6–9 and I can't tell why.
I try: Straight to metrology, skip the Measure card, ship.
Mood: annoyed

### Step 8 — Ship report and diagnosis
Screenshot: docs/playtest/shots/minmaxer/777-38-report.png, docs/playtest/shots/minmaxer/777-39-diagnose.png
I see: Rejected 59.5%. Cost per good die 7.77 (Lot cost 2890 ÷ 372.0). Cycle time 228 min. Yield by step: 1.4 / 2.3 / 3.8 / 16.7 / 1.3 / 5.8 / 1.9 / 7.4 / 0. Diagnose: Edge ring, Keyhole void, PED T-top, Dishing. Guessed Edge ring (etch was the biggest loss again). Answer: "Dishing".
I think: Fine, CMP was flagged, Dishing is a CMP thing — but etch lost 16.7 and CMP 7.4, and "what hurt this lot" picks the smaller one. On 123456 it picked Edge ring with no edge pattern on the map. I can't find the rule. Also: best yield of the three seeds (59.5) and WORST cost per good die (7.77) because I spent 890. Score says don't shop.
I try: Seed tricks.
Mood: annoyed

### Step 9 — Seed tricks
Screenshot: none
I see: goto 0 and goto 1: valid runs, same line, different tags. goto 99999999999999999999, "abc", "-5": the URL silently changes to a new seed like 1972142063 / 1972143764 / 1972145428 (different every time) and a new run starts.
I think: Junk seed = free random reroll; any number = a fixed run I can replay forever. Combined with no save (reload = restart same seed, identical numbers), I can scout a seed once, then replay with perfect knowledge, or shop for a seed whose map puts BUY in corridor 1 and PM in corridor 2. None of that gets me to 70%, though.
I try: Stop. Three seeds, three rejections, best 59.5%.
Mood: about to quit
