# Fab Run — Lane D tracker (look and feel)

Lane D owns: `src/theme/tokens.css`, `src/ui/cards.css` (new), `src/art/` (new, SVG files), `art-preview.html` (new).
Lane D does not touch: `src/ui/room.css`, `src/ui/render.js`, `src/ui/main.js`, `src/content/`, `ROADMAP.md`, `tasks/todo.md`, `tasks/lessons.md`, `package.json`.
Because `ROADMAP.md` and `tasks/lessons.md` are off limits, roadmap ticks and new lessons are written at the bottom of this file for David (or the lane that owns them) to copy over.

The game screens do not change in this lane. The new card frame lives only on `art-preview.html` until a later item (it needs `render.js`) puts it in the hand.

---

## Item 1: M6 "Card art setup" — per-room tint and shade tokens

### Task: add `--room-<name>-tint`, `-shade1`, `-shade2` for all 9 rooms, contrast checked
- [x] Add 27 tokens to `tokens.css` (values below), with a comment saying what each step is for
- [x] Add night-shift tints (shades stay the same: they are art faces, not page ground)
- [x] Put the contrast numbers in the `tokens.css` comment (the table also lives here; `docs/` isn't in my list, so `art-direction.md` is not updated)
- [x] Contrast test (see question Q2)
- [x] Skip the content `art` field (per David, later)

### What each step is for
- **tint**: pale backdrop wall behind art and behind `--ink` text. Must give `--ink` 4.5:1 or better (they all give 13:1 or better).
- **shade1**: first darker face (diorama side face, tool body). Allowed behind `--ink` text, so it must give 4.5:1 or better (lowest is etch, 4.9:1 after the fix below).
- **shade2**: second darker face. **Art only, never behind text** (some fall to 3.5:1 with ink and under 4.5:1 with white, so no text color is safe on all of them). Said in the token comment.
- shade1 is at least 1.35:1 darker than the base, shade2 at least 1.35:1 darker than shade1, so flat faces read as different without any gradient.
- Tint to base is only 1.15:1 or more: dep's base is so pale that even white is 1.28:1 above it (dep tint 1.19:1). So a tool drawn on its tint always gets an ink outline. (Found by the new test, 25 Oct.)

### Proposed values (computed by mixing the room color with white or `--ink`; numbers copied from the script output)

| Room | base | tint (ink) | shade1 (ink, vs base) | shade2 (vs shade1) | night tint (night ink) |
|---|---|---|---|---|---|
| clean | #5FD3E0 | #D2F3F6 (14.1) | #52B3BF (6.7, 1.39) | #438F9B (1.51) | #274854 (8.3) |
| litho | #FFC933 | #FFF0C6 (14.6) | #D5AB32 (7.6, 1.41) | #A68930 (1.55) | #4A462E (8.1) |
| etch | #6FA8F5 | #D7E7FC (13.1) | #5E8ECF (4.9, 1.38) | #4C74A8 (1.43) | #2A3F58 (9.1) |
| dep | #DDE4EC | #F5F7FA (15.4) | #B9C1C9 (9.1, 1.42) | #919AA3 (1.57) | #434C56 (7.4) |
| diff | #FF9A4D | #FFE3CD (13.4) | #D58447 (5.7, 1.38) | #A66C40 (1.50) | #4A3C33 (9.0) |
| implant | #B79CF7 | #EBE3FD (13.3) | #9A86D2 (5.3, 1.36) | #796DA9 (1.46) | #3A3C59 (9.0) |
| plate | #E09A63 | #F6E3D3 (13.2) | #BB8459 (5.2, 1.37) | #926C4E (1.47) | #433C38 (9.2) |
| cmp | #B7C2CC | #EBEEF1 (14.2) | #9AA5AF (6.6, 1.39) | #79848F (1.51) | #3A444F (8.3) |
| metro | #8ED6A8 | #DFF4E7 (14.3) | #78B592 (7.0, 1.40) | #609179 (1.52) | #314947 (8.2) |

Mix rules: tint = 72% toward white; shade1 = 18% toward `--ink`; shade2 = 38% toward `--ink`; night tint = 78% toward night `--surface`. Shades keep the room's hue, so a litho tool is still yellow (S11).

Watch: dep tint #F5F7FA is almost the page `--bg` #F3F6F9. That is fine for a backdrop inside a framed window, but it means the dep backdrop always needs its frame line. Noted in the comment.

**Acceptance criteria:** 27 light tokens + 9 night tints in `tokens.css`; the test (or the table, if Q2 is no) proves every text pairing is 4.5:1 or better; `npm test` passes; nothing on the game screens changes.

---

## Item 2: M6 "Shared card frame"

### Task: one card frame in `cards.css`, shown on `art-preview.html` with real cards from `content.js`
- [x] `cards.css`: the frame, 260 × 380 at 1×, scaled to 0.75× (195 × 285) under 400 px wide
- [x] Room band: room fill, ink text, room icon + room name (icon so color never works alone)
- [x] 9 small room icons as SVG in `src/art/icons/` (flat line icons, ink colored): clean (drop), litho (lens), etch (plasma bolt), dep (stacked layers), diff (furnace tube), implant (beam arrow), plate (bath), cmp (pad disc), metro (gauge)
- [x] Cost chip: ink pill, mono. Minutes for practices, cash for items (both if a card has both)
- [x] Art window 260 × 140; window style tells the kind:
  - practice: dark microscope window (`--view-dark`) with the cross-section
  - equipment: room-tint bay window with four bolt dots in the corners
  - material: bay window plus shelf-life ticks along the bottom edge
  - consumable: smaller window (about 260 × 100) plus a "single use" tag
  - Item art itself is a later roadmap item, so item windows show the plain room-tint backdrop for now
- [x] Kind and rarity: mono label, 11 px; rarity as 1–3 diamonds drawn with CSS (rotated squares, no glyph font needed) plus a hidden text label ("Rarity: advanced") for screen readers
- [x] Name: Barlow Condensed 600, 23 px, two lines at most
- [x] Effect: Barlow 13 px, plain words built from the effects list: "Residue ×0.3", "Underlayer attack ×1.5", "×0.5 with an etch stop", "Shows all 25 sites"
- [x] Tradeoff: always printed, under a hairline
- [x] Consumables have no room: band uses `--surface` with a line border and the label "Any room"
- [x] Unplayable look (dashed edge) and focus ring in `cards.css` too, so the hand can switch over later without new CSS
- [x] Night shift: frame uses `--surface`, `--ink`, `--line`; bay windows use the night tints
- [x] `art-preview.html`: a standalone page (not linked from the game) that imports `content.js` read-only and draws every practice, equipment, material and consumable in the new frame, plus a light/night toggle. A small script inside the page turns content entries into card HTML. Opened at `http://localhost:8000/art-preview.html`
- [x] Screenshots at 1280 × 800 and 375 × 812 (see Q2), checked by eye, sizes checked

**Acceptance criteria:** all 23 cards draw on `art-preview.html` at both sizes with no horizontal scroll at 375 px; every label readable (4.5:1); band, cost, window, kind, rarity, name, effect, tradeoff all present; kind is readable from the window alone; rarity from diamond count alone; no colors in `cards.css` except `var(--…)` tokens; no console errors.

---

## Item 3: M6 "Practice art" — microscope cross-sections

### Task: one SVG cross-section per practice (10), drawn from `--mat-*` tokens; physics-reviewer pass
- [x] One file per practice in `src/art/sections/<practiceId>.svg`, viewBox 260 × 140
- [x] **How the tokens reach the SVG:** shapes carry a class (`class="mat-si"`), not a color. `cards.css` maps each class to its token (`.mat-si { fill: var(--mat-si) }`). The preview page fetches the SVG text and puts it inside the card, so the page's CSS colors it. (A plain `<img>` can't see the page's CSS, so the colors would be lost.) No hex values in the SVG files.
- [x] Drawing rules (art direction): flat fills, crisp 1 px edges, films at least 6 px thick, void = red dashed outline only, small labels and a scale bar inside the art (changed by David's style sheet, see his answers); each SVG has a `<title>` describing it in words
- [x] Legend strip on the preview page (material swatch + name) so the colors can be checked
- [x] Run `physics-reviewer` on all 10; fix what it finds; ASK DAVID items come back to you

### Proposed picture for each practice (please correct any that are wrong)

| Practice | Room | What the cross-section shows |
|---|---|---|
| timedOveretch | etch | Resist mask on oxide; trench etched through the oxide and a notch cut into the SiN underlayer below (approved concept) |
| endpointEtch | etch | Same trench, stopped flat on the SiN; a small residue foot left in one bottom corner |
| measureAll | metro | Finished trench in oxide with measurement brackets: depth bar and width (CD) bar, drawn in oxide-light lines |
| reworkLitho | litho | Resist lines on oxide; one line's old, too-wide profile shown as a thin outline (stripped) with the new, correct line inside it; one or two small handling particles |
| preclean | dep | Si with a thin native oxide and particles on the left half; the right half clean and bare, ready for the film |
| etchStopLayer | dep | Stack: Si, SiN etch stop (new film, at least 6 px), oxide on top |
| dummyFill | litho | After CMP: one wide Cu line in oxide flanked by small dummy Cu squares; the top surface flat, no dish |
| slowStartPlate | plate | Narrow via in oxide: barrier lining, Cu seed, Cu filling from the bottom up, opening still wide; no void |
| n2Storage | clean | Contact opening in oxide down to Si; the Si at the bottom has only a very thin native oxide (thin film, the 6 px minimum, marked as "thin" by being half the oxide's usual weight) |
| spikeAnneal | diff | Si with a shallow implanted region (lighter Si), a few damage dots left, and the junction line only a little deeper than the as-implanted one (approved concept: damage heals, small junction shift) |

### Possible new material tokens (see Q3)
- `--mat-doped`: implanted Si, a lighter Si (for spikeAnneal)
- `--mat-particle`: particles (preclean, reworkLitho). Not red, because red means void or fail
- `--mat-junction`: the junction line on the dark window
All checked against `--view-dark` so they read on the microscope window (3:1 or better for shapes).

**Acceptance criteria:** 10 SVGs, each shows on its card on the preview page at both sizes; no hex colors in `src/art/`; physics-reviewer report has no open ISSUES (or each one is answered by David); screenshots checked.

---

## Order, commits, PRs
- Steps in the order above; `npm test` after each, commit after each working step.
- Branch: see Q1.
- Before each PR: `git fetch origin main` and rebase on it.
- PRs: see Q4.
- Before calling each item done: playtester steps (tests, screenshots at both sizes, no console errors), `code-explainer` on the diff, then David's 3-bullet summary.

## Questions for David
- **Q1, branch.** You said branch `lane-d`; this session was set up on `claude/lane-d-look-feel-64k6zr` (already exists on GitHub, nothing on it yet). Which one should I push to? I'll use `claude/lane-d-look-feel-64k6zr` unless you say `lane-d`.
- **Q2, tests outside my folders.** Two new test files would help and touch no other lane's files: `tests/tokens.test.js` (reads `tokens.css`, checks every text pairing in the table is 4.5:1 or better and that `src/art/` and `cards.css` have no hex colors) and `tests/screens/art-preview.spec.js` (screenshots the preview page at both sizes, checks no horizontal scroll and no console errors). OK to add them? If not, I check contrast with a throwaway script and take screenshots with a script in my scratch folder.
- **Q3, three new material tokens** (`--mat-doped`, `--mat-particle`, `--mat-junction`) for the cross-sections. OK, or should I draw those with the existing colors only?
- **Q4, PRs.** One PR per item (three PRs, each rebased on `main`), or one PR when all three are done? I'd suggest one per item so the tokens can land early for the other lanes.

## David's answers (25 Oct 2026)
- Q1 branch: not changed, so `claude/lane-d-look-feel-64k6zr`.
- Q2: yes, add `tests/tokens.test.js` and `tests/screens/art-preview.spec.js`.
- Q3: yes, add the new colors.
- Q4: one PR at the end.
- Style reference: David's "Fab Run Card Styles" sheet, style C (microscope window). What that changes in this plan:
  - Room band: icon + room name in uppercase condensed, letter-spaced; cost in an ink pill with light mono text on the right.
  - Card: white, 2 px ink edge, rounded corners.
  - **Labels inside the art after all** (resist, oxide, SiN, Si) in small mono, plus a "200 nm" style scale bar. Labels use `--on-fill` on light films and a new `--view-ink` on the dark window; never on Cu or barrier (too dark for either).
  - Implant damage as small × marks; junction as a dashed dark line with a label; particles as small pale dots; plasma ions as short light-blue dashes above an etch.
  - Material cards show shelf-life ticks next to the rarity diamonds.
  - Under the art: mono kind label left, diamonds right; name; effect; hairline; **Tradeoff** in bold then the text.
- New colors (contrast from the scratch script): `--mat-doped` #B4BCC0 (8.6:1 with ink, 1.5:1 vs Si), `--mat-particle` #E8E3C0 (13.4:1 on the window, 2.3:1 vs Si), `--mat-junction` #14202B (5.6:1 on Si), `--mat-plasma` #9CC4FA (9.7:1 on the window), `--view-ink` #E6EDF3 (14.7:1 on the window). `--mat-plasma` and `--view-ink` are two more than asked; both come straight from the style sheet.

**Progress notes:**
- 25 Oct 2026: read CLAUDE.md, PROJECT.md, lessons, art-direction, card-art-plan, content.js. Checked remote branches: `lane-b` (saves plan) and `ccr-c4267d03` (Pages) don't touch Lane D files. Contrast numbers computed with a scratch script.
- 25 Oct: item 1. The new contrast test failed twice on the first run, both real: etch shade1 was 1.345:1 from its base (my script printed it rounded as 1.35), so it moved from 18% to 19% toward ink (#5F90D1 → #5E8ECF, ink 4.9:1). And no tint can sit 1.35:1 above dep's nearly white base, so tint-to-base is 1.15:1 with an ink outline on tools. Proved the test fails on a bad color before trusting it.
- 25 Oct: item 2. Class names start with `frame-` so they never clash with `.card` in `room.css`. The screen test found the cards being squeezed narrower in a one-row hand (text overflowed); fixed with `flex: none`. Bolt dots were misplaced (CSS counted the ceiling and floor strips as bolts); bolts are now `<i>`.
- 25 Oct: item 3. 10 cross-sections written. physics-reviewer found 7 issues; all fixed except the ASK DAVID points below: rework now strips every line; low-current start shows conformal Cu with the mouth open (bottom-up fill is the additive bath's job, as its physicsNote says); dummy-fill trenches all land on SiN at the same depth and the wide line keeps a slight dish (×0.4, not ×0); N2 storage compares an air wait with a purge; spike anneal shows the as-implanted junction line; the etch stop compares a narrow and a wide trench; over-etch and endpoint got bigger, labelled differences.
- 25 Oct: code-explainer review: fixed cost chip `flex: none`, screenshot test now uses the real theme button, simpler `block()` in the test, color check also catches `rgb()`/`hsl()`, "art missing" note instead of a blank window, phone-hand cards named, no pointless `tabIndex`. Left for later: the card-text helpers in `art-preview.html` should move to `src/ui/view.js` with tests when the hand uses the frame (not a Lane D file).

**Open questions for David**
- **Answered 25 Oct: dummy fill.** David: the simplification is fine. Art and card stay as they are.
- ~~ASK DAVID (dummy fill):~~ at textbook level dummy fill mainly cuts density-driven *erosion*; dishing of one wide line depends mostly on its width (slotting is the usual fix). Is "dummy fill reduces dishing" an OK simplification for the card? The art shows a slight dish either way.
- **Answered 25 Oct: low-current start.** David: keep the art (conformal Cu, mouth open).
- ~~ASK DAVID (low-current start):~~ confirm the art should show conformal fill with the mouth kept open, not bottom-up fill. That's what the card's own physicsNote says.
- **Answered 25 Oct: measureAll wording.** David: the note is right. Normal sampling measures 3 of the 25 wafers; the card measures all 25 sites on those sampled wafers, not 25 sites on every wafer. No change.
- **Answered 25 Oct: phone text size.** David: keep 0.75× for now (labels about 8 px, body about 10 px). Revisit in the M6 phone layout pass if needed.

**Result:** 5 commits on `claude/lane-d-look-feel-64k6zr`: room tint/shade tokens + `tests/tokens.test.js`; the card frame (`src/ui/cards.css`, `src/art/icons/`, `art-preview.html`); 10 practice cross-sections (`src/art/sections/`) + `tests/screens/art-preview.spec.js`; physics-review fixes; code-review fixes. `npm test` 140/140, screen tests 30/30 at 1280×800 and 375×812.

## For David to copy over (Lane D can't edit these files)
- ROADMAP M6 ticks: "Card art setup" (tokens part; the content `art` field is still open), "Shared card frame", "Practice art".
- Lesson, **Rounded numbers hid a failing contrast step**: my contrast script printed 1.345 as "1.35", so etch shade1 looked like it met the 1.35:1 rule and didn't. Root cause: judged a limit from a rounded printout. Rule: ✅ compare raw ratios against limits in code (the test does), print rounded only for people. ✅ Never copy a "passes" judgement from rounded output.
- Lesson, **Cards shrank in a one-row hand**: a fixed-width card in a `nowrap` flex row was squeezed below 260 px and its text overflowed. Root cause: flex items shrink by default. Rule: ✅ fixed-size UI pieces get `flex: none`. ✅ The art-preview screen test checks no card text overflows.
