// nmos.spec.js — screen tests for choosing the lot type and playing an NMOS
// lot, in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), seed 123456.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { LOT_TYPES } from '../../src/content/lotTypes.js';

const SEED = 123456;
const NMOS_STEPS = LOT_TYPES.nmos.route.length;   // 13
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms
const TOUCH = 44;                     // smallest touch target, px (CLAUDE.md §10)

async function press(page, locator) {
  if (test.info().project.use.hasTouch) await locator.tap();
  else await locator.click();
}

// Waits out the double-click window, then presses (tasks/lessons.md: a
// phone tap at the same spot right after a screen change is ignored).
async function pressAfterChange(page, locator) {
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, locator);
}

async function screenshot(page, name) {
  const project = test.info().project.name;
  const buffer = await page.screenshot({ path: `screenshots/${project}/${name}.png`, fullPage: true });
  expect(buffer.readUInt32BE(16), `${name}.png width (seed ${SEED})`).toBe(page.viewportSize().width);
}

function watchForErrors(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  return errors;
}

async function expectNoSidewaysScroll(page) {
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth, `page width (seed ${SEED})`).toBe(page.viewportSize().width);
}

async function expectTouchSize(locator) {
  const box = await locator.boundingBox();
  expect(box.height, `touch target height (seed ${SEED})`).toBeGreaterThanOrEqual(TOUCH);
}

const title = page => page.locator('.room-name');
const lineName = page => page.locator('.map-band .room-step');
const goButton = page => page.locator('.go-button');
const runButton = page => page.locator('.run-button');
const button = (page, name) => page.getByRole('button', { name });

// Rooms with nothing to play run by themselves and open on their result,
// so press Run only if it is there.
async function runUnlessItRanByItself(page) {
  await page.locator('.run-button, .skipped-text').first().waitFor();
  if (await page.locator('.skipped-text').count() === 0) await pressAfterChange(page, runButton(page));
}

test('at the door the player can switch to NMOS: same seed, 13 bays, lot in the address', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(`/?seed=${SEED}`);
  await expect(lineName(page)).toContainText('Inlaid Cu line');
  await expect(page.locator('.lot-current')).toHaveText('Inlaid Cu line: this lot');
  const switchButton = button(page, 'Run NMOS transistor instead');
  await expectTouchSize(switchButton);
  await pressAfterChange(page, switchButton);

  await expect(lineName(page)).toContainText('NMOS transistor');
  await expect(page.locator('.bay')).toHaveCount(NMOS_STEPS);
  await expect(page.locator('.seed')).toHaveText(`Seed ${SEED}`);
  expect(new URL(page.url()).searchParams.get('lot'), `seed ${SEED}`).toBe('nmos');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '42-nmos-floor-plan');

  // Once the lot is in a room, the choice is gone from the floor plan.
  await pressAfterChange(page, goButton(page));
  await runUnlessItRanByItself(page);
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await expect(title(page)).toHaveText('Floor plan');
  await expect(page.locator('.lot-choice')).toHaveCount(0);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('a reload mid-run resumes the NMOS lot where it was', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(`/?seed=${SEED}&lot=nmos`);
  await press(page, goButton(page));
  await runUnlessItRanByItself(page);
  // The save ends on the room's Run, so a reload reopens its result screen.
  await expect(page.locator('.room-step').first()).toHaveText(`Step 1 of ${NMOS_STEPS} · Wet clean`);

  // A reload of the plain address (no ?lot=) still finds the NMOS save.
  await page.goto(`/?seed=${SEED}`);
  await expect(page.locator('.room-step').first()).toHaveText(`Step 1 of ${NMOS_STEPS} · Wet clean`);
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await expect(lineName(page)).toContainText('NMOS transistor');
  await expect(page.locator('.bay')).toHaveCount(NMOS_STEPS);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('an NMOS lot plays to its ship report, which offers a new Cu line lot', async ({ page }) => {
  test.slow();   // walks all 13 rooms: triple the usual 30 s limit
  const errors = watchForErrors(page);
  await page.goto(`/?seed=${SEED}&lot=nmos`);
  await press(page, goButton(page));
  for (let step = 1; step < NMOS_STEPS; step++) {
    await runUnlessItRanByItself(page);
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    await expect(title(page)).toHaveText('Floor plan');
    await pressAfterChange(page, goButton(page));
  }
  // The last room (electrical test) has nothing to play: it ran by itself.
  await pressAfterChange(page, button(page, 'See the ship report'));
  await expect(title(page)).toHaveText('Ship report');
  await expect(page.locator('.map-band .room-step')).toHaveText('NMOS transistor');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '43-nmos-ship-report');

  await pressAfterChange(page, button(page, 'New Inlaid Cu line lot'));
  await expect(title(page)).toHaveText('Floor plan');
  await expect(lineName(page)).toContainText('Inlaid Cu line');
  const address = new URL(page.url()).searchParams;
  expect(address.get('lot'), 'the Cu line is the default, so it is left out').toBeNull();
  expect(address.get('seed'), 'a new lot gets a new seed').not.toBe(String(SEED));
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
