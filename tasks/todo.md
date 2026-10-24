# Fab Run — Task Tracker

## Current: M0 — Move in

### Task: confirm the kit works and settle the M1 decisions
- [ ] GitHub Pages on; placeholder loads on desktop and phone
- [ ] `npm test` passes
- [ ] Decide D7, O2, O4, O5, O6 with David; move them to Settled in `docs/decisions.md`

**Acceptance criteria:**
- The live page shows the title, the room key and the content counts, with no console errors
- `docs/decisions.md` has no open decision that blocks M1

### Plan: roadmap item 1, GitHub Pages (approved Oct 24; Pages switched on by David)

Claude can't switch Pages on (it's a repo setting) and this cloud session can't open `github.io`, so the work is split.

1. **David:** Settings → Pages → Source "Deploy from a branch" → branch `main`, folder `/ (root)` → Save. Wait 1–2 minutes for the first build.
2. **David:** open `https://chirality89.github.io/fab-run/` on desktop and on phone. Check: the title, 9 colored room tiles, the content counts (5 practice/item/failure-mode boxes), and no red error line.
3. **Claude, in parallel:** serve the repo locally (`python3 -m http.server`) and load it in the browser that comes with this session (no npm install, nothing added to `package.json`). Screenshots at 1280×800 and 375×812, console errors captured. This proves the page itself is fine, so if the live site is broken it's a Pages setting, not the code.
4. **Claude:** add a `.nojekyll` file at the repo root, so Pages serves the files exactly as they are and doesn't run them through its default site builder (Jekyll). This matters later: Jekyll skips any folder or file whose name starts with `_`.
5. Tick the roadmap box once David confirms step 2. Commit, PR.

**Acceptance criteria:**
- [x] Local screenshots (desktop and phone) show the title, the room key and the counts, with no console errors (Oct 24: 9 tiles, counts 10/5/4/4/9, no errors, no sideways scroll at 375 px)
- [ ] David confirms the live URL on desktop and phone
- [ ] `.nojekyll` is on `main` (added on the branch; lands with the PR)

## NEEDS NEW LOGIC

Content in `src/content/content.js` that needs engine behavior beyond the eight effect operations:

- `when: { lot: 'tightCD' | 'deepEtch' | 'narrowFeatures' }`: lot-type properties, set in `lotTypes.js` (M1)
- `when: { lot: 'delayBeforeBake' }`: needs a timer between the litho expose and bake practices
- `when: { lot: 'lastStepWasLitho' }`: needs route history in the lot state
- `when: { lot: 'rightPartChosen' }` and `needsTarget: 'faultType'`: the spare part asks the player to pick a fault
- `resets: { slot, field, fraction }`: fresh resist and bath analysis reset a material's shelf life or decay
- `limit: { perLayer: 1 }`: strip and re-expose once per layer
- `shelfLife`: counts rooms visited; at 0 the material stops helping
