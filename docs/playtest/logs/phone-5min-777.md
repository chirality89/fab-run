# Phone player with 5 minutes — seed 777 (NMOS transistor lot)

### Step 1 — Floor plan, switching lot type
Screenshot: docs/playtest/shots/phone-5min/777-00-s3-01-first.png, docs/playtest/shots/phone-5min/777-01-s3-02-nmos-start.png
I see: Same Inlaid Cu start. I tapped "Run NMOS transistor instead". The header now says "NMOS transistor", the map grew to 13 steps (Wet clean, Deposition, Litho, Etch, CMP, Wet clean, Diffusion, Deposition, Litho, Etch, Implant, Diffusion, Metrology). Only CMP (step 5) has a red SPC badge. The lot-type button swapped places: now "Run Inlaid Cu line instead" sits above the "this lot" line instead of below it.
I think: (0:00) New lot, new stuff, good — I'm bored of the copper one. But 13 steps instead of 9. If 9 took me 3.5-5 minutes, this is 6-7 minutes. Already over my budget before I start. Good thing it remembers me on reload.
I try: Enter step 1.
Mood: curious

### Step 2 — Wet clean
Screenshot: none
I see: Same wet clean, "about 1.2 points", rinse card "about 0.3 less".
I think: (0:15) Played it. 100 → 99.0.
I try: Rinse, Run, Continue.
Mood: curious

### Step 3 — Event: Quality audit (again)
Screenshot: docs/playtest/shots/phone-5min/777-06-s3-03-event.png
I see: The same quality auditor event I got on seed 123456, word for word.
I think: (0:25) Already seen it. Third run and the events are repeating. Walked them through — the wet clean is used again at step 6.
I try: Walk them through now, Continue.
Mood: bored

### Step 4 — Deposition (Pad oxide + SiN)
Screenshot: none
I see: "about 4.0 points". The pump-purge card that was useless last two runs now says "About 0.8 points less lost in this room."
I think: (0:40) Oh, so the same card is good here and useless there. That's sort of interesting — but I only know because of the "points less" line, not because I understand why. Played it. 99.0 → 95.8.
I try: Pump-purge, Run deposition, Continue.
Mood: curious

### Step 5 — Litho (active)
Screenshot: none
I see: Same two cards as always: the dead "Strip and re-expose — Can't play" and "Trim dose, about 0.3 less".
I think: (0:55) Third run, same dead card in my hand, same text. Trim, run. 95.8 → 94.0.
I try: Trim dose, Run.
Mood: bored

### Step 6 — PM the CMP tool, Etch (isolation trench)
Screenshot: none
I see: PM page; CMP says red "Shift". PM'd it. Etch: "about 3.9 points" (not 9 like copper!), and the over-etch card now says "About 1.4 points less lost".
I think: (1:20) First time a card does something meaningful: 1.4 points. Played it. 94.0 → 91.4.
I try: PM the CMP tool, Continue, Timed over-etch, Run etch.
Mood: curious

### Step 7 — CMP (auto)
Screenshot: none
I see: CMP opened already finished: "91.4% → 86.7%, cost 4.7 points... Nothing could be played here."
I think: (1:35) I PM'd this exact tool one stop ago and it still ate 4.7 points and I didn't get to touch it. The result doesn't even say how much the PM saved me. 5 of 13 rooms done.
I try: Continue.
Mood: annoyed

### Step 8 — Procurement
Screenshot: docs/playtest/shots/phone-5min/777-24-s3-04-shop.png
I see: The exact same three items as seed 123456: Radial gas-flow trim, Inline metrology, Thick resist.
I think: (1:50) Same shop, different lot. Cash 1440 and I still have no reason to spend it. Left with nothing.
I try: Continue to step 6.
Mood: bored

### Step 9 — Wet clean (pre-gate) and Q-time corridor
Screenshot: none
I see: Wet clean "about 0.6", rinse card "about 0.1 less". I skipped it (Q-time window coming, and it says "qtime oxide ×1.1"). 86.7 → 86.1. Then the Q-time corridor box again.
I think: (2:10) Going straight, I know the drill now.
I try: Run wet clean, Continue, Go straight.
Mood: bored

### Step 10 — Diffusion (Gate oxidation, auto)
Screenshot: docs/playtest/shots/phone-5min/777-28-s3-05-diffusion.png
I see: Orange DIFFUSION header, "Step 7 of 13". Already done: "86.1% → 82.6%, cost 3.4 points. Nothing could be played here." Wafer map mostly orange.
I think: (2:20) A brand new room type, the one thing I was curious about in this lot, and I don't even get to see inside it. It just eats 3.4 points. Six rooms left and I'm at 82.6. At 3-5 points a room I might not make 70.
I try: Continue.
Mood: annoyed

### Step 11 — PM / DOE with nothing to fix
Screenshot: none
I see: Opened PM/DOE. The PM list only shows Deposition, Litho, Etch — all "In control". No Implant or Diffusion tools listed. I'd already paid "+40 min" just to walk in.
I think: (2:35) I paid 40 minutes to look at a menu with nothing worth doing. Should have checked the map badges first. Left without doing anything.
I try: Leave without a PM or DOE.
Mood: annoyed

### Step 12 — Poly-Si deposition, Event (Hot lot again), Litho (gate)
Screenshot: none
I see: Deposition "about 5.4", pump-purge now "about 1.2 less". 82.6 → 78.5. Event: the same "Hot lot request" as seed 42, word for word. Litho: the same two cards, dead card again. 78.5 → 77.4.
I think: (3:20) Three runs, I've now seen only two events, and they repeat. Same shop, same dead card. It's the same 4 cards over and over. 77.4% with four rooms to go.
I try: Pump-purge, Run; Event, Keep its place in line; Trim dose, Run.
Mood: bored

### Step 13 — Gate etch, then a PM screen with nothing in it
Screenshot: docs/playtest/shots/phone-5min/777-43-s3-06-corridor-73.png, docs/playtest/shots/phone-5min/777-44-s3-07-pm-empty.png
I see: Gate etch "about 4.5 points", the over-etch card has no points line. Ran it plain: 77.4 → 72.9. Corridor. I tapped PM / DOE hoping to protect the last rooms: "No practice in your deck can be tuned here." and "No tool on the route ahead can be PM'd here." One button: Leave.
I think: (3:50) 72.9 with three rooms to go, 2.9 points of cushion. I go to the one place that might help and it's an empty room that still charged me 40 minutes. Why does the corridor even offer it? This is where I'd put the phone down if my stop came.
I try: Leave without a PM or DOE.
Mood: about to quit

### Step 14 — Implant (auto), Activation anneal (auto)
Screenshot: docs/playtest/shots/phone-5min/777-45-s3-08-implant.png, docs/playtest/shots/phone-5min/777-47-s3-09-anneal-below-spec.png
I see: Implant opened already done: 72.9 → 72.5. Corridor. Anneal (Diffusion) opened already done: "72.5% → 68.0%, cost 4.5 points. Nothing could be played here." The bar is now left of the Spec 70% tick.
I think: (4:10) And there it is. Lost the run in a room where I had no buttons, no cards, nothing. I didn't lose — the game lost for me. If I'd had any lever in the last four rooms I'd feel it was my fault and want to retry. Instead I feel cheated.
I try: Continue, Go straight to Electrical test.
Mood: about to quit

### Step 15 — Electrical test, Ship report: Rejected
Screenshot: docs/playtest/shots/phone-5min/777-50-s3-10-rejected.png
I see: "Lot rejected: shipped below the customer spec." Report: "Rejected: yield 68% is below the 70% customer spec. The customer sends the lot back." Cost per good die 4.96, "Not paid: the lot was rejected.." (double full stop). Cycle time 401 min. Diagnose: Unannealed implant damage, Front-end etch residue, Chamber flaking, Isolation oxide dishing — the last two are long sentences.
I think: (4:30) Run took about 4.5 minutes at speed, 13 rooms, around 45 taps. The two deposition rooms were the big ones I could see, 3.2 and 4.1, and "Chamber flaking" says deposition, so I picked that.
I try: Chamber flaking.
Mood: annoyed

### Step 16 — Diagnosed + Notebook
Screenshot: docs/playtest/shots/phone-5min/777-51-s3-11-diagnosed.png, docs/playtest/shots/phone-5min/777-52-s3-12-notebook.png
I see: (after scrolling down again because the page jumped to the top) "Diagnosed: Chamber flaking. Written in your notebook. It cost 6.4 yield points... Unlocks for later runs: Textured chamber shield kit." Notebook button now says (1). Notebook: one entry, "19 failure modes still to find."
I think: (4:45) Finally, a win! That felt good — the first time in three runs. But I got it by matching the word "deposition" in the answer to the room name in the table, not by reading any evidence. 19 more to find, at 1-in-3 runs... that's a long grind for a train game.
I try: Done. Closing.
Mood: curious
