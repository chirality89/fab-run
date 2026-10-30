# Min-maxer — seed 777 (switched to NMOS transistor lot, notebook 3)

### Step 1 — Floor plan, lot choice
Screenshot: docs/playtest/shots/minmaxer/777-00-s777-01-floor.png
I see: Inlaid Cu line offered by default, button "Run NMOS transistor instead". Notebook (3) from the farming on 123456/42.
I think: Haven't played NMOS. Swap. The swap is free and happens before step 1, so on any seed I get two lots to choose from — a free reroll.
I try: Run NMOS transistor instead.
Mood: curious

### Step 2 — NMOS floor plan
Screenshot: docs/playtest/shots/minmaxer/777-01-s777-02-nmos-floor.png
I see: 13 rooms: Wet clean, Deposition, Litho, Etch, CMP (SPC flag), Wet clean, Diffusion, Deposition, Litho, Etch, Implant, Diffusion, Metrology. URL gains "&lot=nmos". Q-time corridor after step 6. Corridor 1 has BUY/EVT but no PM.
I think: Longer route = more PM stops = more free yield. Only one red flag (CMP). Diffusion and Implant are new rooms — want to see if they have cards.
I try: Enter step 1.
Mood: curious

### Step 3 — Room 1: Wet clean, two cards
Screenshot: docs/playtest/shots/minmaxer/777-02-s777-03-room1.png
I see: Forecast 1.2. Megasonic clean (unlocked by my farmed "Handling particles"): 6 min 60 cash particles x0.5 "0.6 less". Rinse 3 min 10 cash "0.3 less". Budget 10.
I think: First real hand. 6 + 3 = 9 <= 10, so it's not a choice, I play both. Megasonic says "too much power can break fine features on patterned wafers" but no number shows any penalty. Megasonic first: forecast 1.2 -> 0.6, then rinse only worth 0.2 more (diminishing, fair). 
I try: Both. Cash 1500 -> 1430. 100 -> 99.6.
Mood: hooked

### Step 4 — Procurement, corridor 1
Screenshot: docs/playtest/shots/minmaxer/777-07-s777-04-shop.png
I see: Same three items as the Cu lot: gas trim 200, inline metrology 500 (used at step 13, the last), thick resist 90. My unlocked bath/plating items are not here (no plating on this route).
I think: Gas trim acts every time the lot enters Etch, and this route has two etches. Better value here. Same shop on every seed and both lots — zero variety.
I try: Buy trim (1430 -> 1230).
Mood: bored

### Step 5 — Room 2: Pad oxide + SiN, three cards
Screenshot: docs/playtest/shots/minmaxer/777-09-s777-05-dep.png
I see: Forecast 4.1. Pump-purge "0.8 less". Ionized PVD seed 9 min 90 cash "0.7 MORE lost" (it's a trench-fill seed; this is a flat pad oxide). Pre-deposition clean 10 min "0.2 less, starts a Q-time clock". Budget 15.
I think: Ionized PVD seed is a dead card in this room and the hand happily offers it. Pump-purge 5 + pre-dep 10 = 15, exactly the budget. "Starts a Q-time clock" — no number. Testing it.
I try: Pump-purge (forecast 4.1 -> 3.2), pre-dep clean (3.2 -> 3.0). Run: 99.6 -> 96.3, "about 2.9 points from the Deposition tool's drift".
Mood: annoyed

### Step 6 — PM stop, corridor 2
Screenshot: docs/playtest/shots/minmaxer/777-14-s777-06-pm-depchart.png
I see: Deposition chart says "In control: no rule tripped in the last 12 lots" — but it just cost me 2.9 points of drift, and the map never flagged it. Points sit mostly above centre, last one at the control line. CMP is "Shift". No PM was offered before step 2 at all.
I think: The one tool that actually hurt was labelled green. I couldn't PM it anyway (corridor 1 had no PM). So 2.9 points were unavoidable and unannounced. The "Q-time clock" from pre-dep clean never showed up anywhere afterwards.
I try: PM CMP (next used at step 5).
Mood: annoyed

### Step 7 — Litho, Event (slurry), Etch with over-etch
Screenshot: docs/playtest/shots/minmaxer/777-20-s777-07-event1.png
I see: Litho: trim dose "0.3 less" + the eternal dead "Strip and re-expose" card. 96.3 -> 94.8. Event: cheaper CMP slurry +150 cash. Etch (isolation trench): over-etch now says "1.4 points LESS" (there's an etch stop here). 94.8 -> 91.9.
I think: Over-etch flips from -0.1 to +1.4 with an etch stop — that's the first card whose value depends on the route in a way that matters. Slurry: cash is useless, no.
I try: Keep slurry. Play over-etch.
Mood: curious

### Step 8 — Event: Quality auditor
Screenshot: docs/playtest/shots/minmaxer/777-26-s777-09-auditor.png
I see: "Walk them through now: +30 min cycle time, Wet clean tool serviced." Or "come back later: -100 cash".
I think: Option 1 is a free PM bolted on to an Event slot, paid in cycle time, which nobody scores. Option 2 costs cash, which nobody scores either, but it gives nothing. Strictly dominated. Not a choice.
I try: Walk them through.
Mood: hooked

### Step 9 — CMP (auto-ran), PM Deposition, pre-gate clean
Screenshot: none
I see: CMP auto-resolved on arrival: 91.9 -> 86.6 (5.2) even after PM. PM Deposition at c5. Pre-gate clean: Megasonic "0.3 less", rinse "0.1 less". 86.6 -> 86.3 with megasonic only (skipped rinse before the Q-time corridor).
I think: Again a room that runs itself before I can read its forecast.
I try: Straight through the Q-time corridor.
Mood: bored

### Step 10 — Q-time corridor and Gate oxidation
Screenshot: docs/playtest/shots/minmaxer/777-36-s777-11-diffusion.png
I see: Same +0.040 / +0.010 / +0.010 oxide risk labels. Gate oxidation auto-ran: 86.3 -> 82.8 (3.5). "Nothing could be played here."
I think: Diffusion has no cards, no SPC, no PM option. 3.5 points of pure toll.
I try: Continue.
Mood: bored

### Step 11 — Poly dep, gate litho, gate etch
Screenshot: none
I see: PM Litho at c7. Poly dep: pre-dep clean 0.2 less, pump-purge no number, ionized PVD no number. 82.8 -> 82.5. PM Etch at c8. Gate litho trim dose 0.3: 82.5 -> 81.3. Shop at c9: only inline metrology — I bought it for 500 as a test (cash 1090 -> 590). Gate etch: over-etch back to "+0.1 more lost" even though the room is called "stop on gate oxide". 81.3 -> 76.4 (4.9).
I think: Gate etch has an etch stop in its name but over-etch is negative here. I don't get why, and the card doesn't say.
I try: Event at c10: the same Hot lot as on 123456. Keep place.
Mood: confused

### Step 12 — Implant, Activation anneal (both auto-ran)
Screenshot: docs/playtest/shots/minmaxer/777-57-s777-12-implant.png
I see: Implant 76.4 -> 76.0. Anneal 76.0 -> 71.3 (4.7). Both "Nothing could be played here."
I think: Last two big hits, no control. I'm sweating 1.3 points above spec and there's nothing to press.
I try: Straight to Electrical test.
Mood: bored

### Step 13 — Ship report
Screenshot: docs/playtest/shots/minmaxer/777-62-s777-13-ship.png
I see: Shipped 71.3%. Lot cost 2910, 6.53 per good die, cycle 461 min. Inline metrology (500) did nothing I could see at step 13 — "0.0 points". Yield table shows "76%" next to "76.4%".
I think: 500 cash for nothing, and it didn't matter because cash doesn't matter. "Buy everything" has no penalty except a number labelled "for reference only". Diagnose: guessed Too much thermal budget (anneal + oxidation lost 8.2).
I try: Too much thermal budget.
Mood: bored

### Step 14 — Diagnosis
Screenshot: docs/playtest/shots/minmaxer/777-63-s777-14-diag.png
I see: "Not this one. What did hurt this lot: Chamber flaking, 2.9 points, Deposition step 2."
I think: Fair, actually — that was the 2.9 drift on a chart labelled "in control". But I'd still just replay and type it in.
I try: Seed tests.
Mood: curious

### Step 15 — Seed and save tests
Screenshot: docs/playtest/shots/minmaxer/0-00-s777-15-seed0.png, docs/playtest/shots/minmaxer/2320430678-00-s777-16-hugeseed.png
I see: Replay 777 mid-run, then goto 777: "Resumed seed 777". goto 0: a fresh Inlaid Cu lot on seed 0. goto 777 again: fresh start, lot type back to Inlaid Cu — the run in progress is gone. goto 99999999999999999999: "not a seed (0 to 4294967295), so this is seed 2320430678". goto -5: seed 2320432243.
I think: One save slot. Visiting any other seed throws away the current run with no warning — that's a free "abandon" if a run goes bad, though Replay already gives you that. Bad seeds are handled politely. Everything is deterministic: same moves, same decimals, same diagnosis answer.
I try: Stop here.
Mood: bored
