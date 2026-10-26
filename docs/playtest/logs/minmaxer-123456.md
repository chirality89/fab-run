# Min-maxer — seed 123456

### Step 1 — Floor plan (start)
Screenshot: docs/playtest/shots/minmaxer/123456-00-s123456-01-map.png
I see: Blue header "FLOOR PLAN", "Inlaid Cu line · yield 100.0%", Seed 123456, Cash 1500, Cycle time 0 min. A 9-room snake: Wet clean, Deposition, Litho bay, Etch (red SPC tag already), Wet clean, Deposition, Plating, CMP, Metrology. Between rooms, little side-stop tags: MET, PM, BUY, EVT, one QT between 5 and 6. One button: "Enter step 1: Wet clean".
I think: 1500 cash, cycle time counts up. So two currencies: cash and minutes. Etch already flagged SPC before I start — that's the telegraph, noted. Side stops between every pair of rooms; I want to know whether they're optional and what they cost. No choice on this screen besides "go".
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/minmaxer/123456-01-room1.png
I see: Line yield 100.0% bar with Scrap 40% and Spec 70% marks. "This room will cost about 1.0 points of yield if nothing changes." 5x5 wafer map all 100. Time budget 10 of 10 min, slots empty, SPC for particle adders (last lot 21.4, in control). Hand: "No practices left in your hand." One button: Run wet clean.
I think: "No practices LEFT" — I never had any. Zero decisions in room 1. 10 minutes of budget and nothing to spend them on. Fine, the cost is 1.0 point; the only move is to run it. Noting the forecast so I can check it against the actual.
I try: Run wet clean. Before: yield 100.0, cash 1500.
Mood: curious

### Step 3 — Room 1 result
Screenshot: none
I see: "100.0% → 99.1%", "This room cost 0.9 points of yield." Wafer map now 98s and 99s. Buttons: Continue to the corridor, Replay this seed, New seed.
I think: Forecast said ~1.0, actual 0.9. So there's scatter but small. Cash unchanged (1500). Room 1 took 10 min (cycle time now 10). "Replay this seed" is offered *mid-run*, after every room? That is a reroll button if anything about the run varies. Filing that away to abuse.
I try: Continue to the corridor.
Mood: curious

### Step 4 — Corridor after step 1
Screenshot: docs/playtest/shots/minmaxer/123456-03-corridor1.png
I see: "Take one side stop": Metrology +20 min "Measure: reveals hidden values (coming in a later update)", Event +10 min "A choice with a tradeoff". Or "Go straight to step 2". Also "Scrap the lot". Cycle time 10 min, cash 1500, yield 99.1%.
I think: Metrology literally says it's not in the game yet, and still costs 20 minutes. That's a trap. Event is a mystery box for 10 min. I don't know yet what cycle time is worth — nothing on screen says cycle time is scored or limited. If cycle time is free, I should take every side stop. Testing Event to see what it gives.
I try: Event.
Mood: curious

### Step 5 — Event: Quality audit
Screenshot: docs/playtest/shots/minmaxer/123456-04-event1.png
I see: "The event stop cost 10 min of cycle time. Choose one option." A: Walk them through now, +30 min cycle time, Wet clean tool serviced. B: Ask them to come back later, −100 cash. Below both: a big "Continue to step 2" button.
I think: The Wet clean tool wasn't flagged — "serviced" a healthy tool is worth zero to me right now. And there's a third option nobody mentions: just hit Continue. If that's free it dominates both.
I try: Reload first, to see if reload saves my place.
Mood: curious

### Step 6 — Reload test
Screenshot: none
I see: After reload: back at the START floor plan, yield 100.0%, cash 1500, cycle time 0.
I think: No save at all. Reload = full restart of the same seed. I replayed room 1: exactly 100.0 → 99.1 again. So it's deterministic and reload is a free "undo everything". Not a precise undo, but on a 9-room run I can just replay to the fork and take the other branch. Seed abuse confirmed: complete information by replaying.
I try: Replay to the event, then tap Continue without choosing.
Mood: hooked (on the exploit, not the game)

### Step 7 — Event skipped via Continue → Room 2: Deposition
Screenshot: none
I see: Deposition room. Yield 99.1%, cash still 1500. Forecast ~1.0 points. Time budget 15 of 15 min. Slots empty. SPC in control. Hand: "No practices left in your hand." again.
I think: Confirmed: the event's "choose one option" is a lie, you can decline both for free. The event stop is 10 min for nothing if you skip. And again, zero cards. Two rooms, zero decisions.
I try: Run deposition.
Mood: bored

### Step 8 — Room 2 result → Corridor after step 2
Screenshot: none
I see: 99.1 → 98.2, "This room cost 0.9 points". Corridor: PM / DOE +40 min, Procurement +10 min, Event +10 min, or go straight on.
I think: Again forecast 1.0, actual 0.9. Every room so far is a fixed tax. Only one side stop allowed. Shop is the only thing that touches cash, so try it.
I try: Procurement.
Mood: curious

### Step 9 — Procurement
Screenshot: docs/playtest/shots/minmaxer/123456-12-shop1.png
I see: Cash 1500. In-situ pad conditioner 350 (Equipment, CMP, "Stable polish rate, but pads are consumed faster", next used step 8). Chemically amplified DUV resist 140 (resist slot, "Prints fine lines, but punishes any wait between expose and bake", replaces i-line positive resist). Thick resist for deep etch 90 ("Survives long etches (TSVs) at the cost of resolution and bake time").
I think: Zero numbers on what any of these does. "Stable polish rate" — by how much? Worth 350 of 1500? I can't price it. Both resists go in the same slot, so buying both is pure waste — but the shop happily sells me both. Thick resist's text is about TSVs, which this lot doesn't have, so it's a trap here. I'll buy conditioner + DUV now and measure them against a no-buy replay later (reload is free).
I try: Buy pad conditioner (1500 → 1150), buy DUV resist (1150 → 1010). Continue.
Mood: curious

### Step 10 — Room 3: Litho bay
Screenshot: docs/playtest/shots/minmaxer/123456-15-litho.png
I see: Cash 1010, yield 98.2%. Forecast: "about 4.5 points of yield". Time budget 30 of 30. Slot: Chemically amplified DUV resist. SPC monitor CD 252.2 nm, in control. Hand: one card, Strip and re-expose, 30 min · 150 cash, "Can't play: Its condition is not met".
I think: First card of the game and it's greyed out with "its condition is not met" — which condition? It doesn't tell me. Forecast 4.5 with DUV in. I need the no-buy number to know if the resist did anything. Room again plays itself.
I try: Run litho bay.
Mood: annoyed

### Step 11 — Litho result → Corridor after step 3
Screenshot: none
I see: 98.2 → 93.5, "cost 4.6 points" (forecast 4.5). Corridor: Metrology (still "coming in a later update"), Procurement, Event.
I think: The display says 98.2 → 93.5 but "4.6 points" — 98.2 minus 93.5 is 4.7. Rounding, whatever, but I'm counting. Next room is the Etch that's been flagged SPC since the start. No PM stop in this corridor — the PM was in the last corridor and I spent it shopping. Damn. Event it is.
I try: Event.
Mood: curious

### Step 12 — Event: Hot lot request
Screenshot: docs/playtest/shots/minmaxer/123456-19-event-hot.png
I see: Run it hot: −30 min cycle time · +150 cash · +0.02 risk: random dots across the wafer. Keep its place in line: nothing changes. Continue button too.
I think: This event has a NEGATIVE time cost: 10 min to stop, −30 back, net −20 min, plus 150 cash. The "risk" is 0.02 of something with no unit. Free money. Taking it.
I try: Run it hot. Cash 1010 → 1160.
Mood: hooked

### Step 13 — Room 4: Etch (SPC flagged)
Screenshot: docs/playtest/shots/minmaxer/123456-20-etch.png
I see: Yield 93.5%. "This room will cost about 25.1 points of yield if nothing changes." Time budget 8 min. SPC: etch rate out of control, "8 points in a row below the centre line", last lot 296.0 (inside control limits). Hand: Timed over-etch (+20%), 4 min, "Clears residue but attacks the film below, unless an etch stop is there."
I think: 25 points! Every other room has been ~1. This is the whole run. The card text says over-etch attacks the film below — sounds bad — but the tool is etching slow, so +20% should compensate. Forecast will tell me.
I try: Play Timed over-etch. Forecast 25.1 → 21.7, time 8 → 4 min. Then Run etch.
Mood: hooked

### Step 14 — Etch result
Screenshot: docs/playtest/shots/minmaxer/123456-22-etch-result.png
I see: 93.5 → 71.8, "This room cost 21.7 points". Wafer map goes from all green to red (crossed out) and dotted-beige: lots of 63–69 sites, a few 80s.
I think: Over-etch was worth 3.4 points for 4 min of a budget I'd otherwise waste — free. But I'm at 71.8 with spec at 70 and five rooms to go at ~1 point each. I'm already dead on spec. The real decision was two corridors ago: PM/DOE before a flagged tool. Nothing on the PM tag told me it would be the last chance before etch, but the map did show it. My mistake, and the game will let me replay it for free.
I try: Continue, finish the run to see the ending.
Mood: annoyed

### Step 15 — Corridor after etch → PM / DOE
Screenshot: docs/playtest/shots/minmaxer/123456-24-pm.png
I see: PM/DOE (+40 min). DOE section: "Measure all 25 sites" (Metrology) Now 20 min · 150 cash → after DOE 12 min · 150 cash, DOE costs 100 cash. PM section: Wet clean, Deposition, Plating, CMP with mini SPC charts, all "In control". "PM one tool: it comes back to between 75 and 95 percent health, never perfect." No PM option for Etch — it's behind me.
I think: The DOE is for a card I've never held. The PM menu only lists tools ahead, and they're all in control. Plating's chart creeps up a bit at the right end, so I PM'd it. PM costs no cash — only the 40 min. Since nothing on screen says cycle time hurts me, PM is effectively free.
I try: PM Plating. Cash stays 1160.
Mood: curious

### Step 16 — Room 5 (Resist strip + wet clean) and Q-time corridor
Screenshot: none
I see: forecast 0.8, actual 0.7 (71.8 → 71.1). Corridor: "Q-time window: native oxide keeps growing until the barrier goes on." Metrology +0.020 oxide risk, Event +0.010 oxide risk.
I think: Finally a corridor that tells me why to skip. Went straight on.
I try: Go straight to step 6.
Mood: bored

### Step 17 — Room 6: Deposition (barrier + seed)
Screenshot: none
I see: Forecast 3.6, actual 3.8 (71.1 → 67.3). No cards. SPC in control.
I think: Now under the 70% spec with three rooms left. Run is lost; I'm only here to measure.
I try: Run deposition, then Procurement.
Mood: bored

### Step 18 — Procurement #2
Screenshot: none
I see: Inline metrology 500 (Equipment, Metrology, "Shows drift sooner; does not fix anything by itself", next used step 9 = last room). Three-additive copper bath 200 (bath slot, Plating).
I think: Inline metrology for the LAST room of the run, 500 cash, does nothing by itself. Pure trap. The bath: no numbers. Bought it to measure.
I try: Buy bath (1160 → 960). Continue.
Mood: annoyed

### Step 19 — Room 7: Plating
Screenshot: docs/playtest/shots/minmaxer/123456-34-plating.png
I see: Slot: Three-additive copper bath. Forecast 2.0, actual 2.2 (67.3 → 65.1). SPC shows PM marker. No cards.
I think: No idea what the bath or PM bought me. Need a control run.
I try: Run plating, then Event.
Mood: bored

### Step 20 — Event: cheaper CMP slurry → CMP
Screenshot: none
I see: Switch now: +150 cash, CMP tool steps off target. Keep: nothing. I hit Continue. Entering CMP: Cash 940 — it was 960. Forecast 6.6, actual 6.2 (65.1 → 58.9). Slot: In-situ pad conditioner.
I think: 20 cash vanished between the shop and CMP and nothing told me why. Pad conditioner "pads consumed faster"? If so, say so on screen. CMP cost 6.2 points WITH the 350 conditioner. Was that good? I can't tell.
I try: Run CMP, go straight to step 9.
Mood: annoyed

### Step 21 — Room 9: Metrology
Screenshot: none
I see: Forecast 0.0. Card: Measure all 25 sites, 20 min · 150 cash, "Full information, but slow and paid for." Run metrology.
I think: 150 cash for "full information" at the very end of the run when nothing can be changed. Played it anyway to see. Cash 940 → 790. Revealed nothing new I could see.
I try: Measure all 25 sites, Run metrology.
Mood: bored

### Step 22 — End: Lot rejected / Ship report
Screenshot: docs/playtest/shots/minmaxer/123456-43-end.png, docs/playtest/shots/minmaxer/123456-44-report.png
I see: "Rejected: yield 58.9% is below the 70% customer spec." Cost per good die 7.36 (Lot cost 2710 ÷ 368.3 good die, not paid). Cycle time 188 min. Yield-by-step table; etch was 21.7 of the 41.1 points lost. Diagnose: Edge ring / Keyhole void / Etch residue ("Opens spread evenly across the whole wafer after etch, while the etch rate falls on the etch SPC chart") / Post-exposure delay T-top.
I think: So there IS a score: cost per good die, and lot cost = 2000 + what I spent (1500 − 790 = 710 → 2710). Cash spent is a direct penalty; unspent cash is good. Cycle time is shown but doesn't seem to enter the score. Diagnosis is easy — etch rate fell on the etch chart, 8 points below centre, 21.7 points lost at etch. Etch residue.
I try: Etch residue.
Mood: curious

### Step 23 — Diagnosis answer
Screenshot: docs/playtest/shots/minmaxer/123456-45-diagnose-wrong.png
I see: "Not this one. What did hurt this lot: Edge ring. It is not written in your notebook: diagnose it on a later run to earn it."
I think: What? The final map is 51–63 everywhere with one 72 in the middle. "Inner sites are clean" — they are not. The etch SPC chart was flagged the whole run, etch ate 21.7 points, and the description of Etch residue matches the screen word for word. And the game says Edge ring. Either the evidence is lying or the answer is. Also: it just TOLD me the answer for this seed. Same seed is deterministic. Replay 123456, guess Edge ring, free notebook entry. That's the seed leak.
I try: Replay this seed, take PM before etch this time.
Mood: annoyed

### Step 24 — Replay 123456: control run (no shopping, no events, PM Etch at corridor 2)
Screenshot: docs/playtest/shots/minmaxer/123456-60-etch-afterPM.png
I see: Same start, room 1 again 99.1, room 2 again 98.2 — identical. Corridor 2 PM/DOE now lists Litho, Etch (Out of control), Wet clean, Deposition, Plating, CMP. DOE list now shows Timed over-etch WITH numbers: "residue ×0.3 · underlayer attack ×1.5 · underlayer attack ×0.5 with etch stop"; after DOE "underlayer attack ×1.25".
I think: So the numbers exist — they just only appear on the DOE screen, never on the card in my hand or in the shop. PM'd Etch.
Numbers (control vs run 1):
- Litho with i-line (no DUV): forecast 6.7, actual 98.2 → 91.2 (7.0). With DUV: 4.6. → DUV resist ≈ +2.4 points for 140 cash.
- Etch after PM: forecast 23.0, with over-etch 19.7, actual 19.6 (91.2 → 71.6). Run 1 without PM: 21.7. → PM on a red-flagged tool ≈ 2 points. The tool everyone screams about was only ~10% of the etch loss. Over-etch again −3.3 forecast, free.
- Plating, no bath, no PM: 6.4 points (67.1 → 60.7). Run 1 with bath + PM: 2.2. → bath/PM worth ~4 points.
- CMP, no conditioner: 7.1 (60.7 → 53.6). With 350 conditioner: 6.2. → 350 cash for ~0.9 points. Overpriced.
- Cash stayed at 1500 into CMP this time, so the mystery −20 in run 1 came from something I bought (bath or conditioner), never shown.
I try: Finish, ship.
Mood: hooked (on the spreadsheet)

### Step 25 — Control run ship report + diagnosis
Screenshot: docs/playtest/shots/minmaxer/123456-76-diagnose-leak.png, docs/playtest/shots/minmaxer/123456-77-diagnose-right.png
I see: Rejected, 53.6%. Cost per good die 5.97 (Lot cost 2000 ÷ 334.8). Cycle time 173 min. Diagnose choices are DIFFERENT this time: Underlayer attack / PED T-top / Etch residue / Chamber flaking. No Edge ring. Guessed Underlayer attack: "Diagnosed... Written in your notebook. Unlocks: Deposit SiN etch stop, Optical endpoint detector, Stop on endpoint. (Unlocks start to count in a later update.)"
I think: Big one: cost per good die was BETTER (5.97) with a worse yield (53.6 vs 58.9) because I spent nothing. Every cash purchase is added to lot cost. The shop is a score tax. On a rejected lot nothing matters anyway. Second: my "Edge ring" leak didn't work because the answer depends on what I did — with PM'd etch and over-etch, the culprit became underlayer attack. Third: I'm under spec on both lines; 70% looks unreachable on this seed with what's offered. And unlocks "start to count in a later update" — so the notebook is a trophy shelf for now.
I try: Move on to seed 42 with the best line: DUV resist, PM Etch, over-etch, take hot lot if offered, bath for plating, no conditioner.
Mood: annoyed
