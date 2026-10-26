# Min-maxer — seed 42

Plan going in (from 123456): DUV resist, PM the flagged Etch before litho, Timed over-etch, copper bath + PM plating, no pad conditioner, no metrology, take cash events.

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/minmaxer/42-00-map.png
I see: Same 9 rooms in the same order as 123456 (same "Inlaid Cu line"). Different side stops between rooms. SPC flags on Wet clean (room 1 and 5) and Etch. Cash 1500.
I think: Same line, same rooms, so my 123456 spreadsheet carries over directly. Corridor 1 has BUY and PM, corridor 2 has PM — so this seed lets me both buy DUV and PM Etch. Better seed than 123456.
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean (flagged)
Screenshot: none
I see: Forecast 1.0. SPC "Out of control: the particle adders may be shifting." No cards. Actual 100.0 → 99.1.
I think: Flagged tool, and it cost exactly what the unflagged one cost on 123456 (0.9). The red SPC tag here is noise. Nothing on the map tells me which flags matter.
I try: Run, then Procurement.
Mood: bored

### Step 3 — Procurement (corridor 1)
Screenshot: none
I see: Inline metrology 500, DUV resist 140, Three-additive copper bath 200.
I think: Metrology 500 is the trap. DUV worth ~2.4 points last seed, bath ~4 with PM. Buy both in one stop — the shop lets me buy as many as I want for one 10-min stop, so one shop visit per run is all I need.
I try: Buy DUV + bath. 1500 → 1160.
Mood: curious

### Step 4 — Room 2 → PM / DOE (corridor 2)
Screenshot: docs/playtest/shots/minmaxer/42-10-pm.png
I see: Dep 99.1 → 97.9. PM/DOE screen: three DOEs on top (Timed over-etch, Measure all 25 sites, Strip and re-expose — the last one with numbers "cd error ×0.2 · particles ×1.2"), then PM cards for Litho, Etch (out of control), Wet clean (out of control), Deposition (now out of control too), Plating, CMP. Every PM button just says "PM this tool".
I think: I hit the wrong "PM this tool" — I PM'd Litho instead of Etch. All six buttons have identical words and the tool name is far above the button. In etch I saw "27.0 points" forecast and no "Just PM'd". My mistake, but the screen set it up.
I try: Reload. Replayed the whole route (deterministic, same numbers), this time PM'd Etch. The "undo by reload" trick works perfectly for any mistake, at the cost of replaying.
Mood: annoyed

### Step 5 — Litho → Etch (PM'd)
Screenshot: docs/playtest/shots/minmaxer/42-14-etch.png
I see: Litho with DUV: forecast 4.4, actual 97.9 → 93.7. Etch forecast 23.5 after PM (27.0 without), over-etch → 20.3, actual 93.7 → 73.4 (20.4).
I think: Same as 123456: PM on the screaming tool buys ~3.5 points, over-etch ~3. And then the room still eats 20 points regardless. There's a ~20-point etch tax that no card, item or PM touches. Spec is 70; I'm at 73.4 with four rooms left that cost ~13 points together. The run is decided and it's lost.
I try: Continue. Event in corridor 4.
Mood: about to quit

### Step 6 — Event: Quality audit (again)
Screenshot: none
I see: Same audit as 123456: Walk them through (+30 min, Wet clean tool serviced) or −100 cash.
I think: Wet clean is flagged and next, so service is free value. Took it.
I try: Walk them through.
Mood: curious

### Step 7 — Room 5: Wet clean after "service"
Screenshot: docs/playtest/shots/minmaxer/42-20-wetclean-after-audit.png
I see: SPC STILL says "Out of control … A point beyond the upper control limit." No PM mark. Forecast 0.7, actual 73.4 → 72.6.
I think: Did the service do anything? Chart doesn't show it. Room cost the same 0.7–0.8 it always costs. Either way it was worth nothing.
I try: Go straight (Q-time corridor).
Mood: annoyed

### Step 8 — Room 6, PM plating, Room 7
Screenshot: none
I see: Dep (flagged): forecast 3.9, actual 72.6 → 69.3. Below spec. PM'd plating; plating with bath + PM: forecast 2.1, actual 69.3 → 67.0.
I think: Bath + PM consistently ~2 points vs ~6 without. That's the best purchase in the game. Still dead.
I try: Event.
Mood: bored

### Step 9 — Hot lot event → CMP
Screenshot: none
I see: Run it hot: −30 min, +150 cash, +0.02 risk. Took it. Cash 1160 → 1310. CMP forecast 9.4, actual 67.0 → 57.6.
I think: CMP was 6.7 on the do-nothing replay of this seed and 7.1 on 123456. 9.4 here. If that's the hot lot's "random dots", the 150 cash cost me ~2.7 yield points. Not free after all — but the card only said "+0.02 risk", not "about 3 points at CMP".
I try: Last corridor: Event.
Mood: annoyed

### Step 10 — Event: "A quiet shift"
Screenshot: docs/playtest/shots/minmaxer/42-34-quiet-event.png
I see: "Event cost 10 min of cycle time. A quiet shift: nothing that matters for this lot comes up."
I think: Paid 10 min for literally nothing. Fine since cycle time doesn't score, but it's filler.
I try: Continue, run metrology (skipped the 150 Measure card), ship.
Mood: bored

### Step 11 — Ship report
Screenshot: docs/playtest/shots/minmaxer/42-37-report.png
I see: Rejected 57.6%. Cost per good die 6.08. Lot cost 2190 ÷ 360.1. Cycle time 248 min. Diagnose: Underlayer attack / Etch residue / Q-time oxide / Removal-rate drift.
I think: Lot cost 2190 = 2000 + 340 spent − 150 hot-lot fee. So income lowers lot cost. Diagnosed Underlayer attack (I over-etched) — "Diagnosed... Written in your notebook", same unlock text as before, "start to count in a later update". Over-etch is both my best etch card and the thing the game blames. That's the loop: the card that saves 3 points is always the diagnosis.
I try: Replay, test scrap.
Mood: annoyed

### Step 12 — Scrap test
Screenshot: docs/playtest/shots/minmaxer/42-43-scrap.png, docs/playtest/shots/minmaxer/42-44-scrapped.png
I see: After room 1, "Scrap the lot" asks "Scrap this lot? The run ends, and everything spent on it is lost." Yes → "Scrapped by you before step 2 at 99.1% yield. Cost per good die: none. No good die shipped. Lot cost 2000, all lost." Cycle time 10 min. "This lot lost too little to tell what hurt it."
I think: Cheapest way to lose: 2 taps, 10 minutes. Same "result" as a rejected ship — both lose all 2000 — except a rejected lot at least gets a diagnosis. Scrap is never better than shipping a bad lot.
I try: Replay, do-nothing line.
Mood: bored

### Step 13 — Do-nothing line (go straight everywhere, play no cards, buy nothing)
Screenshot: none
I see: 99.1 / 97.9 / 91.7 (litho 6.2) / 64.3 (etch 27.5) / 63.6 / 60.7 / 54.6 (plating 6.1) / 47.9 (CMP 6.7). Rejected 47.9%. Cost per good die 6.68. Cycle time 133 min.
I think: Best effort: 57.6% for 6.08. Zero effort: 47.9% for 6.68. All my optimisation is worth ~10 points and neither line gets near 70. Both "Not paid". If spec is unreachable, the only score that changes is cost per good die on a lot nobody pays for.
I try: Seed 777.
Mood: about to quit
