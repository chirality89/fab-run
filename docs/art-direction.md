# Art direction (v0)

**Highly stylized and bright, but a real cleanroom.** White and cool blue everywhere, with each process area in its own saturated color. Flat shapes, crisp outlines, no gradients, no glow, no emoji.

All values live in `src/theme/tokens.css`.

## Ground

| Token | Hex | Use |
|---|---|---|
| `--bg` | #F3F6F9 | Page: cleanroom white |
| `--surface` | #FFFFFF | Cards, panels |
| `--ink` | #14202B | Text |
| `--muted` | #4F5D6B | Secondary text |
| `--line` | #D3DCE5 | Borders, dividers |
| `--blue` | #1F5FBF | Primary actions |

Night shift (dark mode) swaps these; see the tokens file.

## The room key

| Room | Color | Hex | Why |
|---|---|---|---|
| Litho | Yellow | #FFC933 | The litho bay really is yellow: filtered light keeps the resist from exposing |
| Etch | Plasma blue | #6FA8F5 | Plasma glow |
| Wet clean | Cyan | #5FD3E0 | Water and chemistry |
| Deposition | White-silver | #DDE4EC | Thin films, chamber metal |
| Diffusion | Orange | #FF9A4D | Hot furnace tubes |
| Implant | Violet | #B79CF7 | Ion beam |
| Plating | Copper | #E09A63 | The metal itself |
| CMP | Grey | #B7C2CC | Slurry and pads |
| Metrology | Mint | #8ED6A8 | "Measured and OK" |

Rules: room colors are **fills behind dark text** (all 6.7:1 or better with `--ink`). Rooms of similar lightness (clean, etch, metrology) also get an icon and a label. Color alone never carries meaning.

## Signals

Pass `--ok` #1B7F4E, warning `--warn` #A15C00, fail `--bad` #C8362D. Red only means fail. The yield bar always shows its number, not just a color.

## Cross-section and wafer views

Inside the bright UI, cross-sections sit in a dark "microscope window" (`--view-dark`), drawn like an SEM image, with the material colors from the Cross Section art direction: Si #8E989D, oxide #D6E0E4, nitride #9DB38A, resist #F2B000, barrier #3E474C, seed #E3A472, Cu #B8733A. A void is a red dashed outline. Thin films are drawn at least 6 px wide even when they'd be thinner to scale.

The wafer map uses 25 sites. Pass: pale green with a dark green edge. Fail: red with a diagonal slash, so pass and fail differ in lightness and pattern too.

## Type

Barlow Condensed 600 for titles, numbers and card names. Barlow for body text. IBM Plex Mono for step parameters and the seed. All from Google Fonts; the game must work with the fallback fonts.

## Card art

Proposal: `docs/card-art-plan.md` (four styles, recommended split, card anatomy, motion rules).

## Reference boards (David's private Claude artifacts)

- Cross Section art style: palette, type, cross-section rendering rules, components
- Cross Section storyboard map: journey map, storyboard frames, decision register (from the puzzle concept; the frames still apply to room encounters)
