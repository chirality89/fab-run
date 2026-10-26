// etch.spec.js — screen tests for the etch room, in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Playwright runs each test twice, at desktop size and at phone size
// (playwright.config.js). Every test uses seed 123456.
//
// Screenshots are saved to screenshots/desktop/ and screenshots/phone/ for
// a person to look at. They are not compared pixel by pixel with saved
// ones, because fonts draw slightly differently on every computer.

import { test, expect } from '@playwright/test';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms

// Taps on a phone, clicks on a desktop, so each size is used the way a
// person would use it.
async function press(page, locator) {
  if (test.info().project.use.hasTouch) await locator.tap();
  else await locator.click();
}

// The width of a PNG image, read from its header: bytes 16 to 19 hold the
// width as one big-endian number (the PNG file format puts it there).
function pngWidth(buffer) {
  return buffer.readUInt32BE(16);
}

// Saves a full-page screenshot and checks it really is the size we asked
// for. A phone shot that came out 1280 wide once went unnoticed (lessons).
async function screenshot(page, name) {
  const project = test.info().project.name;
  const buffer = await page.screenshot({ path: `screenshots/${project}/${name}.png`, fullPage: true });
  expect(pngWidth(buffer), `${name}.png width (seed ${SEED})`).toBe(page.viewportSize().width);
}

// Collects console errors and page crashes so each test can check none happened.
function watchForErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  return errors;
}

// The page must never scroll sideways: its full width equals the window's.
async function expectNoSidewaysScroll(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `page width (seed ${SEED})`).toBe(page.viewportSize().width);
}

const goButton = page => page.locator('.go-button');
const continueButton = page => page.getByRole('button', { name: 'Continue to the corridor' });

// From the start of the run, walks the lot into the etch room (step 4):
// enter step 1, then run each of steps 1–3 doing nothing and go straight on.
async function walkToEtch(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));                 // Enter step 1
  for (let step = 1; step <= 3; step++) {
    await press(page, page.locator('.run-button'));  // Run the room
    await press(page, continueButton(page));
    await press(page, goButton(page));               // straight on
  }
  await expect(page.locator('.room-name')).toHaveText('Etch');
  // The last tap ("go straight on") was a moment ago; on a phone it can sit
  // where the etch card now is. Two taps there within the double-click
  // window count as one double click, and the guard ignores the second
  // (tasks/lessons.md). Wait it out, as a person would after a new screen.
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
}

const card = page => page.locator('.card-button', { hasText: 'Timed over-etch' });
const timeText = page => page.locator('.time-panel .meter-text');
const runButton = page => page.getByRole('button', { name: 'Run etch' });

test('the etch room shows the seed and a playable card', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEtch(page);
  await expect(page.locator('.seed')).toHaveText(`Seed ${SEED}`);
  await expect(timeText(page)).toHaveText('8 of 8 min left');
  await expect(card(page)).toBeVisible();
  // What the card does, before you commit (M4.5 item 5). The points depend
  // on this seed's scatter and drift, so only their wording is checked.
  await expect(card(page).locator('.card-effects'))
    .toHaveText('residue ×0.3 · underlayer attack ×1.5 · underlayer attack ×0.5 with etch stop');
  await expect(card(page).locator('.card-points')).toHaveText(/^About \d+\.\d points? (less|more) lost in this room\.$/);
  await expect(runButton(page)).toBeVisible();
  // The tool's SPC chart: 11 earlier lots, the limits in words, a verdict.
  await expect(page.locator('.spc-panel .spc-title')).toHaveText('Etch rate (nm/min)');
  await expect(page.locator('.spc-chart .spc-point')).toHaveCount(11);
  await expect(page.locator('.spc-limits').first()).toContainText('Centre 300.0');
  await expect(page.locator('.spc-verdict')).toHaveText(/^(In control|Out of control)/);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '1-room');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('tapping timed over-etch plays it: 4 of 8 min left, hand empty', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEtch(page);
  await press(page, card(page));
  await expect(timeText(page)).toHaveText('4 of 8 min left');
  await expect(page.locator('.card-button')).toHaveCount(0);
  await expect(page.locator('.hand-empty')).toBeVisible();
  await expect(runButton(page)).toBeVisible();
  await expectNoSidewaysScroll(page);
  await screenshot(page, '2-played');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('Run etch shows the result; Replay brings back the same start', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEtch(page);
  const firstLoss = await page.locator('.expected-loss').textContent();

  await press(page, card(page));
  await press(page, runButton(page));
  await expect(page.locator('.outcome-text')).toHaveText('The lot moves on to step 5: Resist strip + wet clean.');
  await expect(page.locator('.yield-number')).toContainText('→');
  await expect(page.locator('.site')).toHaveCount(25);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '3-result');

  await press(page, page.getByRole('button', { name: 'Replay this seed' }));
  await expect(page.locator('.room-name')).toHaveText('Floor plan');   // a replay starts at the door
  expect(page.url()).toContain(`seed=${SEED}`);
  await walkToEtch(page);
  await expect(page.locator('.expected-loss')).toHaveText(firstLoss);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('a fast double tap plays the card once and does not run etch', async ({ page }) => {
  await walkToEtch(page);
  // Aim at the bottom of the card: after the first tap the screen redraws
  // and, at desktop size, the Run etch button slides up into that spot.
  // (Checked: with the double-click guard in render.js switched off, the
  // desktop run fails. On the phone the card wraps taller, so Run etch
  // lands below the tap; there this checks the card plays only once.) On a phone
  // the card starts below the bottom of the screen, so scroll to it first:
  // a raw tap at a spot off the screen hits nothing.
  await card(page).scrollIntoViewIfNeeded();
  const box = await card(page).boundingBox();
  // walkToEtch has already waited out the double-click window after its
  // last tap, so this starts as a fresh gesture.
  const x = box.x + box.width / 2;
  const y = box.y + box.height - 4;
  if (test.info().project.use.hasTouch) {
    await page.touchscreen.tap(x, y);
    await page.touchscreen.tap(x, y);
  } else {
    await page.mouse.dblclick(x, y);
  }
  await expect(timeText(page)).toHaveText('4 of 8 min left');
  await expect(runButton(page)).toBeVisible();   // still in the room
  await expect(page.locator('.outcome-text')).toHaveCount(0);
});
