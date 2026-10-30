# Min-maxer — seed 42 (Inlaid Cu line, repeating the best line from 123456)

### Step 1 — Floor plan
Screenshot: docs/playtest/shots/minmaxer/42-00-s42-01-floor.png
I see: Same 9-room Inlaid Cu route, cash 1500, notebook (1). SPC flags on Wet clean (1), Deposition (2 and 6), Wet clean (5), Etch (4). Corridors differ from 123456: corridor 3 and 4 have no BUY; Q-time corridor still after step 5.
I think: Same route, different flags, different corridor tags. Plan: PM Deposition at c1, shop at c2 (gas trim), PM Etch at c3, PM Wet clean at c4, straight through Q-time, PM Plating at c6, PM CMP at c7. Unlocked plating card in hand.
I try: Enter step 1.
Mood: curious

### Step 2 — Room 1: Wet clean
Screenshot: docs/playtest/shots/minmaxer/42-01-s42-02-room1.png
I see: Forecast 0.7. SPC "Excursion: one lot past the control limit ... if a one-off, the next lots come back". Last lot 17.0, inside. Same single rinse card, 0.2 less.
I think: The red SPC flag on the map is a one-off that already came back. Map flag scared me for nothing — the map doesn't tell excursion from shift. Can't PM before step 1 anyway.
I try: Rinse (1500 -> 1490), run: 100 -> 99.5.
Mood: curious

### Step 3 — PM / DOE stop, corridor 1
Screenshot: docs/playtest/shots/minmaxer/42-05-s42-03-pm1.png
I see: DOEs on offer are different this seed: Low-current start step (8 min void x0.5 -> 10 min void x0.4) and Extra rinse (particles 0.75 -> 0.8, oxide 1.1 -> 1.05). 100 cash each. Deposition and Etch charts "Shift".
I think: The low-current DOE is the first DOE that's not obviously bad: 0.5 -> 0.4 on a card worth 1.8 points is maybe +0.4 points for 100 cash, which is free money since cash isn't scored. But it costs the PM slot, and a PM on a shifted tool is worth more. PM wins again.
I try: PM Deposition. Room 2 forecast 0.7, pump-purge "0.1 more lost" — skip. 99.5 -> 98.8.
Mood: curious

### Step 4 — Procurement, corridor 2
Screenshot: docs/playtest/shots/minmaxer/42-10-s42-04-shop.png
I see: Identical stock to 123456: gas trim 200, inline metrology 500, thick resist 90.
I think: The shop is fixed across seeds. No "random offers" at all. Trim it is.
I try: Buy trim (1490 -> 1290).
Mood: bored

### Step 5 — Litho, corridor 3, Etch
Screenshot: none
I see: Litho forecast 2.7 even with the tool in control; trim dose still claims 0.4. Litho 98.8 -> 96.8. PM Etch at c3. Etch forecast 8.9, "2.9 from depth variation" — same as 123456 with trim. Over-etch again "+0.1 more lost". Etch 96.8 -> 88.2 (8.6).
I think: Trim dose card text says it only fixes a steady shift — but my litho chart is in control and it still saves 0.4. So it's just always-on. Etch is the same toll every time.
I try: Continue.
Mood: bored

### Step 6 — Corridor 4, room 5, Q-time corridor, barrier dep
Screenshot: docs/playtest/shots/minmaxer/42-26-s42-05-barrier.png
I see: PM Wet clean at c4. Step 5 forecast 0.6, skipped rinse (oxide). 88.2 -> 87.6. Q-time corridor: same +0.040 / +0.010 / +0.010 oxide risk. Straight on. Barrier dep forecast 3.1, actual 3.5 (87.6 -> 84.1).
I think: Same numbers as last seed, almost to the decimal. These seeds aren't really different lots, they're the same lot with a different red flag.
I try: PM Plating at c6.
Mood: bored

### Step 7 — Plating, PM CMP, last event
Screenshot: docs/playtest/shots/minmaxer/42-39-s42-06-event.png
I see: Plating forecast 4.3, Low-current card 1.8 less. Played: 84.1 -> 81.4. PM CMP at c7, CMP 81.4 -> 74.9 (6.4). Event after CMP: "A quiet shift: nothing that matters for this lot comes up." Cost 10 min.
I think: An event stop that can be empty. Good to know: the last event slot is dead.
I try: Ship report.
Mood: bored

### Step 8 — Ship report, best line
Screenshot: docs/playtest/shots/minmaxer/42-41-s42-07-ship.png
I see: Shipped 74.9%. Lot cost 2240 (2000 + 240 spent), 4.78 per good die, cycle 353 min. Diagnose: Chamber flaking / Handling particles / Removal-rate drift / Keyhole void ("In notebook").
I think: Line holds: 74.1 on 123456, 74.9 here. Last time "Handling particles" was the answer on a clean run, and nothing big went wrong this time either. Guessing it from the meta, not the evidence.
I try: Handling particles.
Mood: curious

### Step 9 — Diagnosis
Screenshot: docs/playtest/shots/minmaxer/42-42-s42-08-diag.png
I see: "Diagnosed: Handling particles. Written in your notebook. 4.8 points, 0.5-0.7 in every room. Unlocks: Pre-deposition clean, Megasonic clean."
I think: Right answer from pattern, not from reading. When you play clean, the answer is the background particle tax.
I try: Replay, do nothing.
Mood: hooked

### Step 10 — Do-nothing replay of 42
Screenshot: docs/playtest/shots/minmaxer/42-68-s42-09-donothing.png
I see: Rooms: 0.7, 1.3, 2.4, 18.5 (!), 0.6, 4.0, 4.5, 5.4, 0. REJECTED 62.6%. Cost/die 5.11, "rejected.." typo again.
I think: Here the free PM on Etch was worth ~10 points. On 123456 the same PM was worth 1.4. Same "Shift" label on both charts. So "do nothing" isn't safe; "PM every shifted tool, skip everything else" is the real baseline. That's still close to do nothing: 4 taps.
I try: Diagnose. Options: Chamber flaking, Overhang void, Q-time oxide, Dose offset. None of them is an etch failure, yet etch ate 18.5 points.
Mood: confused

### Step 11 — Diagnosis on the do-nothing run
Screenshot: docs/playtest/shots/minmaxer/42-69-s42-10-diag2.png
I see: Guessed Chamber flaking. "Not this one. What did hurt this lot: Overhang void, 4.0 points, Plating." Table shows "98%", "77%", "68%" next to "99.3%" — mixed decimals.
I think: The thing that killed this lot (18.5 points in etch) isn't even a choice. I'm asked to name a 4-point plating void. The "diagnosis" is a quiz about a side detail.
I try: Replay, do nothing again, answer Overhang void.
Mood: annoyed

### Step 12 — Farmed diagnosis
Screenshot: docs/playtest/shots/minmaxer/42-96-s42-11-farmed.png
I see: Rejected again 62.6% (identical). "Diagnosed: Overhang void. Written in your notebook. Unlocks: Ionized PVD seed, Pulse-reverse plating supply."
I think: Confirmed on a second seed: fail -> read answer -> replay -> collect. Works even on a rejected lot. Notebook is 3/20 for zero reading. I'd farm the remaining 17 the same way.
I try: Seed 777, and take the NMOS lot.
Mood: hooked
