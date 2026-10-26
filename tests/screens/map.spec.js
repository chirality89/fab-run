// map.spec.js — screen tests for the floor plan and the walk through the
// whole route, in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), seed 123456.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const STEP_COUNT = 9;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms

async function press(page, locator) {
  if (test.info().project.use.hasTouch) await locator.tap();
  else await locator.click();
}

// Saves a full-page screenshot and checks its width (see etch.spec.js).
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

const title = page => page.locator('.room-name');
const goButton = page => page.locator('.go-button');
const runButton = page => page.locator('.run-button');
const continueButton = page => page.getByRole('button', { name: 'Continue to the corridor' });

// Runs the room the lot is in doing nothing, then continues to the corridor.
// Each tap after a screen change waits out the double-click window first
// (tasks/lessons.md), or a phone tap at the same spot is ignored.
async function runRoomAndContinue(page) {
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, runButton(page));
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, continueButton(page));
  await expect(title(page)).toHaveText('Floor plan');
}

test('the run starts on the floor plan: 9 bays, 8 corridors, enter step 1', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await expect(title(page)).toHaveText('Floor plan');
  await expect(page.locator('.seed')).toHaveText(`Seed ${SEED}`);
  await expect(page.locator('.bay')).toHaveCount(STEP_COUNT);
  await expect(page.locator('.corridor')).toHaveCount(STEP_COUNT - 1);
  await expect(page.locator('.bay-next')).toHaveCount(1);
  await expect(page.locator('.bay-next')).toContainText('Next');
  await expect(page.locator('.stop-button')).toHaveCount(0);   // no side stops before step 1
  await expect(goButton(page)).toHaveText('Enter step 1: Wet clean');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '4-map-start');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('between rooms the corridor offers 2–3 side stops or straight on', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  await expect(title(page)).toHaveText('Wet clean');
  await runRoomAndContinue(page);
  const offers = await page.locator('.stop-button').count();
  expect(offers === 2 || offers === 3, `${offers} offers (seed ${SEED})`).toBe(true);
  await expect(page.locator('.corridor-here')).toHaveCount(1);
  await expect(page.locator('.bay-done')).toHaveCount(1);
  await expect(goButton(page)).toHaveText('Go straight to step 2: Deposition (SiN + oxide)');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '5-map-corridor');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('taking a side stop costs its minutes, then continues to the next room', async ({ page }) => {
  await page.goto(PAGE);
  await press(page, goButton(page));
  await runRoomAndContinue(page);
  // The minutes printed on the stop's button, e.g. "+20 min" → 20.
  const stop = page.locator('.stop-button').first();
  const costText = await stop.locator('.card-cost').textContent();
  const minutes = Number(costText.match(/\+(\d+) min/)[1]);
  expect(minutes, `stop cost (seed ${SEED})`).toBeGreaterThan(0);
  await press(page, stop);
  // Seed 123456's first corridor offers PM and an event (metrology, the old
  // placeholder stop, is no longer offered since M4.5 item 5). Every stop
  // screen states what it cost.
  await expect(page.locator('body')).toContainText(`cost ${minutes} min of cycle time`);
  await screenshot(page, '6-side-stop');
  await press(page, goButton(page));
  await expect(title(page)).toHaveText('Deposition');
  await runRoomAndContinue(page);
  await expect(page.locator('.chip-taken')).toHaveCount(1);
});

test('the Q-time corridor after step 5 warns about waiting', async ({ page }) => {
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step <= 5; step++) {
    await runRoomAndContinue(page);
    if (step < 5) {
      await expect(page.locator('.qtime-warning')).toHaveCount(0);
      await press(page, goButton(page));
    }
  }
  await expect(page.locator('.qtime-warning')).toContainText('Q-time window');
  await expect(page.locator('.corridor-here.corridor-qtime')).toHaveCount(1);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '7-map-qtime');
});

test('going straight on through every room ends the run shipped or rejected', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step < STEP_COUNT; step++) {
    await runRoomAndContinue(page);
    await press(page, goButton(page));
  }
  await expect(page.locator('.room-step')).toContainText(`Step ${STEP_COUNT} of ${STEP_COUNT}`);
  await press(page, runButton(page));
  await expect(page.locator('.outcome-text')).toHaveText(/^Lot (shipped|rejected)/);
  await expect(continueButton(page)).toHaveCount(0);
  await screenshot(page, '8-run-end');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
