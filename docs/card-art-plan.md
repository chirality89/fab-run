# Card art plan (proposal, v0)

**Status: proposal for David to review.** Nothing here is built yet. It extends `docs/art-direction.md` and uses only the colors and fonts already in `src/theme/tokens.css`, plus a few art-only shades listed below.

Mockups of all four styles, animated, are on David's private design canvas "Fab Run Card Styles".

## The idea

**A real cleanroom, drawn flat and bright.** Every card uses one shared frame. The art inside the frame changes with what kind of card it is:

- a **practice** shows what happens to the wafer (a cross-section);
- an **item** (equipment, material, consumable) shows the tool, bath or bottle in its room.

So the art teaches the same physics the card's effect describes.

## Four styles explored

| | Style | What it looks like | Strength | Weakness |
|---|---|---|---|---|
| A | **Bay window** | Looking through the cleanroom glass: ceiling filter panels, a pod on the overhead rail, the tool in its room color, a lamp tower, perforated floor | Instantly reads as "a fab"; the room color is everywhere | Says little about the physics of a practice |
| B | **Tool schematic** | Blue line drawing on grid paper with labelled parts (gas, plasma, chuck, RF, pump); a scan line sweeps the chamber | Explains how the tool works | Busy at phone size; cool and technical rather than fun |
| C | **Microscope window** | Dark SEM-style cross-section in the material colors; the trench etches down, damage heals, a T-top forms | Teaches the card's own physics; matches the diagnose screen | Every practice needs its own cross-section |
| D | **Toy diorama** | Chunky isometric tool block on a floor tile, three flat shades, a small tech in a cleanroom suit | Friendly, board-game feel; great for a map | Tools look alike as blocks; least informative on a card |

## Recommendation: use each where it teaches best

- **C, microscope window**, on every **practice** card.
- **A, bay window**, on **equipment, material and consumable** cards.
- **B, tool schematic**, for the **inspect view** (tap and hold a card) and **notebook** pages.
- **D, toy diorama**, for the **floor-plan map** rooms, not cards.

## Card anatomy (260 × 380 px at 1×)

1. **Room band.** Room color fill, dark ink text, room icon and room name. Color never works alone.
2. **Cost chip.** Ink pill, mono font. Minutes for practices, cash for items.
3. **Art window.** 260 × 140. Its style tells the card kind (see below).
4. **Kind and rarity.** Mono label; rarity as 1–3 diamonds.
5. **Name.** Barlow Condensed 600, 23 px, two lines at most.
6. **Effect.** Barlow 13 px. Plain verbs and the multiplier: "Residue ×0.3".
7. **Tradeoff.** Always printed, under a hairline (locked rule 7).

**Kind by window:** practice = dark microscope window; equipment = bay window with four bolt dots in the corners; material = bay window plus shelf-life ticks; consumable = smaller window plus a "single use" tag.

**Rarity by shape count:** standard ◆, advanced ◆◆, emerging ◆◆◆. Never by color alone.

## Type

Three families, already in `tokens.css`: **Barlow Condensed 600** for names and big numbers, **Barlow** for effect and tradeoff text, **IBM Plex Mono** for costs, parameters, kind labels and the seed. On a card: name 23 px, body 13 px, labels 11 px (the minimum).

## Color

Ground, room key and material colors come from `tokens.css`. The art also needs, per room, **one pale tint** (backdrop wall) and **two darker steps** (flat side faces in the diorama and tool bodies). These would be added to `tokens.css` as `--room-<name>-tint`, `-shade1`, `-shade2` when the art is built. Still flat: no gradients, no glow.

## Motion ("slightly alive")

- One loop per card, 6 seconds or less, one moving thing.
- **Motion means something.** A pod on the rail is a lot moving. The lamp tower is tool state. A plasma or lamp pulse means the process is on.
- **Drift shows on the art.** When a room's tool is drifting, its lamp tower in equipment art turns amber (locked rule 5: chaos is announced).
- **Still in the hand, alive when lifted.** The loop plays on hover, focus or inspect, so a full hand stays calm and cheap to draw.
- **Reduced motion** shows a chosen key frame, not frame zero.
- CSS transforms and opacity only.

## How it would be built

- Inline SVG in code, built from a small kit: 9 room backdrops, about 12 tool bodies, one material stack. No image files and no new libraries.
- Practice cross-sections are drawn from the material tokens (`--mat-*`), so new practice content could get art from data instead of hand drawing.
- Cards scale to 0.75× in a 375 px phone hand.

## Open questions for David

1. Is the recommended split (C for practices, A for items, B for inspect, D for the map) right, or should cards use one style throughout?
2. Realism check on the cross-sections: over-etch into the SiN underlayer, implant damage healing with a small junction shift, and the T-top from a delay before bake.
3. In the litho bay, tools are drawn white under yellow light in style A, but in the room color in style D. Which reads better to a fab engineer?
4. Where does this land on the roadmap: M6 (look and feel) or earlier, with the M2 room screen?

## Research notes

- Deckbuilder convention: card type read at a glance by frame shape, rarity by the banner behind the name; cards built from layers (background, art, frame, banner).
- Flat puzzle and transit games: a small tonal palette, flat shapes, lots of white space, and the interactive thing set apart from the background.
- The litho bay is yellow because photoresist reacts to blue and UV light; the filtered light has none of those wavelengths.
