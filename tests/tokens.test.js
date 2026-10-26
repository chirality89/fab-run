// tokens.test.js — checks the colors in src/theme/tokens.css.
// Run with: npm test
//
// It reads the CSS file as text, pulls out every "--name: #RRGGBB" pair,
// and checks the contrast rules from CLAUDE.md §10 and docs/card-art-plan.md:
// text colors are 4.5:1 or better on what they sit on, and the room art
// steps (tint, shade1, shade2) differ enough to read as flat faces.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { PRACTICES } from '../src/content/content.js';

const CSS = readFileSync(new URL('../src/theme/tokens.css', import.meta.url), 'utf8');
const ROOMS = ['clean', 'litho', 'etch', 'dep', 'diff', 'implant', 'plate', 'cmp', 'metro'];

// Returns the text between the "{" after `start` and its matching "}".
// It counts braces so a block inside a block (the night-shift one sits
// inside @media) is returned whole.
function block(start) {
  const at = CSS.indexOf(start);
  assert.notEqual(at, -1, `tokens.css has no block starting "${start}"`);
  const open = CSS.indexOf('{', at);
  let depth = 0;
  for (let i = open; i < CSS.length; i++) {
    if (CSS[i] === '{') depth = depth + 1;
    if (CSS[i] === '}') depth = depth - 1;
    if (depth === 0) return CSS.slice(open + 1, i);
  }
  throw new Error(`block "${start}" never closes`);
}

// Turns "--ink: #14202B; ..." into { '--ink': '#14202B', ... }.
function colors(text) {
  const found = {};
  for (const match of text.matchAll(/(--[\w-]+):\s*(#[0-9A-Fa-f]{6})\b/g)) found[match[1]] = match[2];
  return found;
}

const LIGHT = colors(block(':root {'));
const FORCED_NIGHT = { ...LIGHT, ...colors(block(':root[data-theme="dark"]')) };
const SYSTEM_NIGHT = { ...LIGHT, ...colors(block(':root:not([data-theme="light"])')) };

// Relative luminance and contrast ratio, as defined in WCAG 2.
function luminance(hex) {
  // "#RRGGBB": red is characters 1–2, green 3–4, blue 5–6. Each becomes 0 to 1.
  const channels = [1, 3, 5].map(start => parseInt(hex.slice(start, start + 2), 16) / 255);
  // Screens don't show brightness in a straight line; this undoes that curve.
  const linear = channels.map(value => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2];
}
function contrast(hexA, hexB) {
  const [high, low] = [luminance(hexA), luminance(hexB)].sort((a, b) => b - a);
  return (high + 0.05) / (low + 0.05);
}

// Fails with both names, both values and the ratio, so the message says what to fix.
function assertContrast(theme, front, back, minimum) {
  assert.ok(theme[front], `missing ${front}`);
  assert.ok(theme[back], `missing ${back}`);
  const ratio = contrast(theme[front], theme[back]);
  assert.ok(ratio >= minimum,
    `${front} ${theme[front]} on ${back} ${theme[back]} is ${ratio.toFixed(2)}:1, needs ${minimum}:1`);
}

test('night shift is the same whether forced or from the system setting', () => {
  assert.deepEqual(SYSTEM_NIGHT, FORCED_NIGHT);
});

test('every room has a tint, shade1 and shade2', () => {
  for (const room of ROOMS) {
    for (const step of ['tint', 'shade1', 'shade2']) {
      assert.ok(LIGHT[`--room-${room}-${step}`], `missing --room-${room}-${step}`);
    }
    assert.ok(FORCED_NIGHT[`--room-${room}-tint`] !== LIGHT[`--room-${room}-tint`],
      `--room-${room}-tint has no night-shift version`);
  }
});

test('ink text is 4.5:1 or better on every room fill, tint and shade1', () => {
  for (const room of ROOMS) {
    assertContrast(LIGHT, '--ink', `--room-${room}`, 4.5);
    assertContrast(LIGHT, '--on-fill', `--room-${room}`, 4.5);
    assertContrast(LIGHT, '--ink', `--room-${room}-tint`, 4.5);
    assertContrast(LIGHT, '--ink', `--room-${room}-shade1`, 4.5);
    // Night shift: --ink turns light and the tints turn dark.
    assertContrast(FORCED_NIGHT, '--ink', `--room-${room}-tint`, 4.5);
    // The room fill itself stays light at night, so the band keeps --on-fill.
    assertContrast(FORCED_NIGHT, '--on-fill', `--room-${room}`, 4.5);
  }
});

test('the art steps differ enough to read as separate flat faces', () => {
  const MIN_STEP = 1.35;
  for (const room of ROOMS) {
    const base = `--room-${room}`;
    // Tint to base can't reach MIN_STEP for dep: its base is so pale that
    // even pure white is only 1.28:1 above it. Tools on a tint always get an
    // ink outline (card-art-plan style), so 1.15:1 is enough here.
    assertContrast(LIGHT, `${base}-tint`, base, 1.15);
    assertContrast(LIGHT, base, `${base}-shade1`, MIN_STEP);
    assertContrast(LIGHT, `${base}-shade1`, `${base}-shade2`, MIN_STEP);
  }
});

test('labels on the microscope window and on light films are 4.5:1 or better', () => {
  assertContrast(LIGHT, '--view-ink', '--view-dark', 4.5);
  for (const film of ['--mat-si', '--mat-oxide', '--mat-nitride', '--mat-resist',
    '--mat-seed', '--mat-doped', '--mat-particle']) {
    assertContrast(LIGHT, '--on-fill', film, 4.5);
  }
});

test('cross-section shapes stand out from the dark window and from Si', () => {
  // Shapes, not text, so the WCAG 3:1 rule for graphics applies.
  for (const shape of ['--mat-si', '--mat-oxide', '--mat-nitride', '--mat-resist', '--mat-seed',
    '--mat-cu', '--mat-doped', '--mat-particle', '--mat-plasma', '--mat-void']) {
    assertContrast(LIGHT, shape, '--view-dark', 3);
  }
  assertContrast(LIGHT, '--mat-junction', '--mat-si', 3);
  assertContrast(LIGHT, '--mat-junction', '--mat-doped', 3);
  assertContrast(LIGHT, '--mat-particle', '--mat-si', 2);   // pale dots on grey Si
  assertContrast(LIGHT, '--mat-doped', '--mat-si', 1.35);   // a step, like the art faces
});

// --- Card files use tokens only ---------------------------------------------

const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const ART_FILES = ['icons', 'sections'].flatMap(folder =>
  readdirSync(new URL(`../src/art/${folder}/`, import.meta.url)).map(name => `src/art/${folder}/${name}`));
const CARDS_CSS = read('src/ui/cards.css');

// A written-in color: hex like #1F5FBF, or rgb(...) / hsl(...). Comments are
// skipped first, so a note that mentions a color can't trip the check
// (tasks/lessons.md). Named colors (red, white) are not searched for: words
// like "white" appear in ordinary text and the check would cry wolf.
function hexColorsIn(text) {
  const noComments = text.replace(/\/\*[\s\S]*?\*\//g, '').replace(/<!--[\s\S]*?-->/g, '');
  return noComments.match(/#[0-9A-Fa-f]{3,8}\b|\b(?:rgba?|hsla?)\(/g) || [];
}

test('cards.css, art-preview.html and the art files have no hard-coded colors', () => {
  for (const path of ['src/ui/cards.css', 'art-preview.html', ...ART_FILES]) {
    assert.deepEqual(hexColorsIn(read(path)), [], `${path} has hard-coded colors`);
  }
  // Prove the check can fail (tasks/lessons.md).
  assert.deepEqual(hexColorsIn('a { fill: #8E989D; } /* #FFFFFF */'), ['#8E989D']);
  assert.deepEqual(hexColorsIn('b { color: rgb(0, 0, 0); }'), ['rgb(']);
});

test('every practice has a cross-section, and every class it uses has a CSS rule', () => {
  for (const practice of PRACTICES) {
    const path = `src/art/sections/${practice.id}.svg`;
    assert.ok(ART_FILES.includes(path), `no art for ${practice.id} (${path})`);
    const svg = read(path);
    assert.match(svg, /<title>[^<]{20,}<\/title>/, `${path} needs a <title> that describes it`);
    for (const [, className] of svg.matchAll(/class="([\w-]+)"/g)) {
      assert.ok(CARDS_CSS.includes(`.${className} `), `${path} uses .${className}, which cards.css never styles`);
    }
  }
});
