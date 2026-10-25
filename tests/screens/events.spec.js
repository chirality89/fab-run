// events.spec.js — screen tests for the event side stop (M3 item 2e).
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Desktop and phone, seed 123456: the corridor after step 2 offers an
// event, and it draws the supplier change.

import { test, expect } from '@playwright/test';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms (tasks/lessons.md)

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
const continueButton = page => page.getByRole('button', { name: 'Continue to the corridor' });
const option = (page, label) =>
  page.locator('.event-panel .shop-item').filter({ has: page.locator('.card-name', { hasText: label }) });

// Each tap that follows a screen change waits out the double-click window
// first, so the guard never swallows it (tasks/lessons.md).
async function pressFresh(page, locator) {
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, locator);
}

async function walkToEvent(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));
  await pressFresh(page, page.locator('.run-button'));
  await pressFresh(page, continueButton(page));
  await pressFresh(page, goButton(page));
  await pressFresh(page, page.locator('.run-button'));
  await pressFresh(page, continueButton(page));
  await pressFresh(page, page.locator('.stop-button', { hasText: 'Event' }));
  await expect(title(page)).toHaveText('Supplier change');
}

test('an event shows its situation and two options with their consequences', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEvent(page);
  await expect(page.locator('.event-panel .shop-item')).toHaveCount(2);
  await expect(option(page, 'Switch now')).toContainText('+150 cash · +0.03 risk: polish rate wandering run to run');
  await expect(option(page, 'Keep the qualified slurry')).toContainText('Nothing changes');
  await expect(page.locator('.event-button')).toHaveCount(2);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '15-event');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('choosing an option shows its result, then Continue goes to the next room', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEvent(page);
  await pressFresh(page, option(page, 'Switch now').locator('.event-button'));
  await expect(page.locator('.event-cash')).toHaveText('Cash 1650');
  await expect(option(page, 'Switch now')).toContainText('Chosen');
  await expect(page.locator('.event-button')).toHaveCount(0);
  await expect(page.locator('.event-result')).toContainText('150 cash saved');
  await screenshot(page, '16-event-chosen');
  await pressFresh(page, goButton(page));
  await expect(title(page)).toHaveText('Litho bay');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
