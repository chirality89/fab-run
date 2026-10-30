# Spire veteran — seed 777 (NMOS transistor, the lot type I had not played)

### Step 1 — Floor plan, Inlaid Cu default
Screenshot: docs/playtest/shots/spire-veteran/777-00-s777-01-start.png
I see: Inlaid Cu line again by default, one SPC flag (CMP). "Run NMOS transistor instead" button.
I think: Task for myself: try the other lot. If it's the same rooms with a new coat of paint, I'm done.
I try: Run NMOS transistor instead.
Mood: curious

### Step 2 — NMOS floor plan
Screenshot: docs/playtest/shots/spire-veteran/777-01-s777-02-nmos-start.png
I see: 13 rooms now: wet clean, deposition, litho, etch, CMP, wet clean, diffusion, deposition, litho, etch, implant, diffusion, metrology. QT window after room 6. CMP flagged.
I think: Longer act, two new room types (diffusion, implant). Still a single line, but the corridor stops differ: some gaps have no PM. That means if I want to fix CMP (room 5) I must PM in a gap that has a PM before it. That's routing, finally.
I try: Enter step 1.
Mood: hooked

### Step 3 — Room 1 + shop
Screenshot: docs/playtest/shots/spire-veteran/777-02-s777-03-room1.png ; docs/playtest/shots/spire-veteran/777-06-s777-04-shop.png
I see: Same rinse card (text still talks about "the barrier", which this lot doesn't have). 100 -> 99.0, 0.6 from drift. Shop: the exact same three items as the Cu runs. Trim works on "Etch (isolation trench)".
I think: Same starting card, same shop pool. New lot, same deck. I buy the trim because it should hit both etch rooms and I measured it as ~1 point of depth variation last time.
I try: Rinse, run, shop, buy trim.
Mood: curious

### Step 4 — Room 2: Pad oxide + SiN
Screenshot: docs/playtest/shots/spire-veteran/777-08-s777-05-room2.png
I see: Forecast 4.0. Pump-purge now "About 0.8 points less lost". The map had no SPC flag on deposition. Lost 3.2, "2.7 points came from the Deposition tool's drift".
I think: Finally pump-purge is worth playing, and the card told me so — good. But 2.7 points of drift on a tool the map said was fine? That's a hit I didn't see coming.
I try: Pump-purge, run.
Mood: confused

### Step 5 — PM stop after room 2
Screenshot: docs/playtest/shots/spire-veteran/777-12-s777-06-pm.png ; docs/playtest/shots/spire-veteran/777-12-s777-07-pm-charts.png
I see: Deposition chart: green "In control: no rule tripped in the last 12 lots", but the last point sits right on the dashed control line. CMP: red "Shift". Three DOE offers, all small (x0.75 -> x0.8 kinds of numbers, each with a downside).
I think: The green "in control" label just cost me 2.7 points. The chart did show the last dot at the line if I'd squinted, but the label told me I was safe. That's a lie by omission. Routing: the gap between 4 and 5 has no PM, so CMP has to be fixed NOW or never. That's a real map decision — first one I've felt.
I try: PM the CMP tool.
Mood: curious

### Step 6 — Litho, event, etch
Screenshot: docs/playtest/shots/spire-veteran/777-18-s777-08-event.png ; docs/playtest/shots/spire-veteran/777-20-s777-09-etch.png
I see: Litho: identical hand to the Cu lot (dead strip card again). 95.8 -> 94.0. Event: cheaper CMP slurry for +150 cash, CMP steps off target; or keep. Etch: forecast 4.3, over-etch "about 1.4 points less". Lost 2.9.
I think: Event is another "cash for yield" offer, cash is worthless, so: keep. Free pick again. Etch was way softer than the Cu lot's 9-point wall; over-etch worth 1.4 here. Played it.
I try: Keep slurry; over-etch; run. 94.0 -> 91.0.
Mood: curious

### Step 7 — Room 5: Oxide fill + CMP (auto)
Screenshot: docs/playtest/shots/spire-veteran/777-24-s777-10-cmp.png
I see: "Nothing could be played here." 91.0 -> 86.3 (-4.7), with the tool I PM'd.
I think: Spent a PM to fix this room and then didn't get to see whether it helped; it just ran. No forecast shown before, so I can't compare.
I try: Continue; shop (only metrology + the trap resist left); room 6 wet clean, skipped the rinse because the QT window comes right after. Lost 1.7, "1.2 from the Wet clean tool's drift" — tool the map showed as fine.
Mood: annoyed

### Step 8 — Q-time corridor, Room 7: Gate oxidation (auto)
Screenshot: docs/playtest/shots/spire-veteran/777-30-s777-11-diffusion.png
I see: QT box again, I went straight. Gate oxidation: new room type, "Nothing could be played here", 84.6 -> 81.2. Wafer map goes orange-dotted.
I think: First new room type for this lot, and it's a cutscene. No card, no item in the shop for it, no PM entry for it. The "new lot type" adds rooms I can't touch.
I try: Continue.
Mood: bored

### Step 9 — PM deposition, Room 8: Poly-Si deposition
Screenshot: none
I see: PM screen lists only deposition, litho, etch (no diffusion or implant tools). After PM, room 8 forecast 0.4 (room 2 was 4.0 on the same tool).
I think: OK, that PM was worth ~3 points. This is the one PM in three runs that clearly paid. Problem: I only knew to do it because room 2 burned me, not because the chart warned me.
I try: Run. 81.2 -> 80.8.
Mood: curious

### Step 10 — Hot lot event, Litho (gate), Gate etch
Screenshot: docs/playtest/shots/spire-veteran/777-37-s777-12-event2.png ; docs/playtest/shots/spire-veteran/777-43-s777-13-gate-etch.png
I see: Same hot-lot event as seed 42 (2 points of yield for cash). Litho: same hand. Gate etch forecast 4.9; over-etch card shows no estimate at all this time.
I think: The event pool is three events and I've now seen repeats. Over-etch with no number = I won't touch it. Lost 4.9. At 74.7 with two auto rooms left, I'm doing mental math: diffusion cost 3.4 last time, implant unknown. Tight.
I try: Keep place; trim dose; skip over-etch. 80.8 -> 79.6 -> 74.7.
Mood: annoyed

### Step 11 — Implant, Activation anneal (both auto)
Screenshot: docs/playtest/shots/spire-veteran/777-47-s777-14-implant.png ; docs/playtest/shots/spire-veteran/777-49-s777-15-anneal.png
I see: Implant: nothing to play, -0.4. Anneal: nothing to play, 74.3 -> 69.7. Yield bar turns brown, wafer map shows red crossed sites around the edge.
I think: I lost the run by 0.3 points in a room where I had no input and no forecast before it hit. That's the moment I'd close the tab. In Spire, when I die to a boss I saw the intent. Here I watched a progress bar.
I try: Straight to electrical test.
Mood: about to quit

### Step 12 — Ship report: Rejected 69.7%, Diagnose, Notebook
Screenshot: docs/playtest/shots/spire-veteran/777-52-s777-16-ship.png ; docs/playtest/shots/spire-veteran/777-53-s777-17-diagnose.png ; docs/playtest/shots/spire-veteran/777-54-s777-18-notebook.png
I see: Rejected. Diagnose: I picked Edge ring (outer sites red on the map, and I bought a trim that said "edge ring x1.25"). Correct: "cost 3.5 points: Etch step 4 (1.9), Etch step 10 (1.6). Unlocks: Edge-tuned chuck." Notebook: 1 entry, 19 to find.
I think: Funny and a bit good: the item I bought (radial gas-flow trim) caused the edge ring, and I lost by 0.3. My purchase killed the run. That's a real trade-off that bit me. But the shop never told me it would cost ~3.5 points; I only learn it at the autopsy. The unlock is the first "meta" hook I've seen. 19 to find is a carrot, but finding them means more runs of watching auto-rooms.
NMOS judgement: the choices are slightly more real than the Cu lot — the gap with no PM before CMP forced a routing call, pump-purge and over-etch actually changed value with tool state, and the etch wall was softer. But it's the same 5 cards, the same 3 shop items, the same events, and 4 of 13 rooms (CMP, gate ox, implant, anneal, test) have no hand. Longer, not deeper.
I try: Close.
Mood: about to quit
