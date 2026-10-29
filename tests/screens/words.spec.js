// words.spec.js — screen tests for the Words page (glossary.js), in a real
// browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), seed 123456.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { GLOSSARY } from '../../src/content/glossary.js';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const STEP_COUNT = 9;
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
const goButton = page => page.locator('.go-button');
const runButton = page => page.locator('.run-button');
const wordsButton = page => page.locator('.words-button');
const topBackButton = page => page.locator('.back-button').first();
const button = (page, name) => page.getByRole('button', { name });

// Rooms with nothing to play run by themselves and open on their result,
// so press Run only if it is there.
async function runUnlessItRanByItself(page) {
  await page.locator('.run-button, .skipped-text').first().waitFor();
  if (await page.locator('.skipped-text').count() === 0) await pressAfterChange(page, runButton(page));
}

// Opens the Words page and checks it lists every term, A to Z.
async function openWords(page) {
  await expectTouchSize(wordsButton(page));
  await pressAfterChange(page, wordsButton(page));
  await expect(title(page)).toHaveText('Words');
  await expect(page.locator('.words-entry .card-name')).toHaveText(GLOSSARY.map(entry => entry.term));
}

test('Words opens from the floor plan, lists every term, and Back returns there', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await expect(title(page)).toHaveText('Floor plan');
  await openWords(page);
  await expectTouchSize(topBackButton(page));
  await expectNoSidewaysScroll(page);
  await screenshot(page, '40-words-page');
  await pressAfterChange(page, topBackButton(page));
  await expect(title(page)).toHaveText('Floor plan');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('Words opens from a room and its result, and Back returns with the played card still played', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  const roomName = await title(page).textContent();
  const playable = page.locator('.card-button:not([disabled])').first();
  await pressAfterChange(page, playable);
  const timeAfterPlay = await page.locator('.time-panel .meter-text').textContent();
  await openWords(page);
  await pressAfterChange(page, topBackButton(page));
  await expect(title(page)).toHaveText(roomName);
  await expect(page.locator('.time-panel .meter-text')).toHaveText(timeAfterPlay);
  await screenshot(page, '41-room-words-button');
  // The room's result screen has the Words button too, and Back returns to it.
  await pressAfterChange(page, runButton(page));
  await expect(button(page, 'Continue to the corridor')).toBeVisible();
  await openWords(page);
  await pressAfterChange(page, topBackButton(page));
  await expect(button(page, 'Continue to the corridor')).toBeVisible();
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('Words opens from the ship report, and Back returns there', async ({ page }) => {
  test.slow();   // walks the whole route: triple the usual 30 s limit
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  for (let step = 1; step < STEP_COUNT; step++) {
    await runUnlessItRanByItself(page);
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    await expect(title(page)).toHaveText('Floor plan');
    await pressAfterChange(page, goButton(page));
  }
  await pressAfterChange(page, button(page, 'See the ship report'));
  await expect(title(page)).toHaveText('Ship report');
  await openWords(page);
  await pressAfterChange(page, page.locator('.back-button').last());
  await expect(title(page)).toHaveText('Ship report');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
