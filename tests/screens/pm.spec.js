// pm.spec.js — screen tests for the PM half of the PM/DOE stop and the
// map's SPC chip (M3 item 2c), in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size, seed 123456. For this seed the etch tool
// starts drifting (its chart trips "8 in a row"), and the corridor after
// step 2 offers PM/DOE.

import { test, expect } from '@playwright/test';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms (see etch.spec.js)

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
const pmCard = (page, roomName) =>
  page.locator('.pm-panel .shop-item').filter({ has: page.locator('.card-name', { hasText: roomName }) });

// Plays steps 1 and 2 doing nothing, then takes the PM/DOE stop.
async function walkToPm(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));
  await press(page, page.locator('.run-button'));
  await press(page, continueButton(page));
  await press(page, goButton(page));
  await press(page, page.locator('.run-button'));
  await press(page, continueButton(page));
  await press(page, page.locator('.stop-button', { hasText: 'PM / DOE' }));
  await expect(title(page)).toHaveText('PM / DOE');
}

test('the map marks the etch bay with an SPC chip', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  const etchBay = page.locator('.bay', { hasText: 'Etch' });
  await expect(etchBay.locator('.chip-spc')).toHaveText('SPC');
  await expect(etchBay).toHaveAttribute('aria-label', /SPC alarm/);
  await expect(page.locator('.map-key')).toContainText("SPC the tool's chart trips a rule");
  await expectNoSidewaysScroll(page);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('the PM stop lists the tools ahead with their charts; PM one, then continue', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToPm(page);
  await expect(page.locator('.pm-panel .shop-item')).toHaveCount(6);
  await expect(page.locator('.pm-panel .spc-chart')).toHaveCount(6);
  await expect(pmCard(page, 'CMP')).toContainText('Next used at step 8: CMP');
  await expect(page.locator('.pm-button')).toHaveCount(6);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '11-pm');

  await press(page, pmCard(page, 'Etch').locator('.pm-button'));
  await expect(pmCard(page, 'Etch')).toContainText('PM done');
  await expect(page.locator('.pm-button')).toHaveCount(0);   // one PM per stop
  await expect(pmCard(page, 'Etch').locator('.spc-pm-label')).toHaveText('PM');
  await expect(pmCard(page, 'Etch')).toContainText("Just PM'd");
  await screenshot(page, '12-pm-done');

  await press(page, goButton(page));
  await expect(title(page)).toHaveText('Litho bay');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

const doeOffer = (page, name) =>
  page.locator('.doe-panel .shop-item').filter({ has: page.locator('.card-name', { hasText: name }) });

test('the DOE section offers 2 practices; a DOE costs 100 and the card shows its tuned recipe', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToPm(page);
  await expect(page.locator('.doe-panel .shop-item')).toHaveCount(2);
  const overEtch = doeOffer(page, 'Timed over-etch (+20%)');
  await expect(overEtch).toContainText('Now: 4 min · residue ×0.3 · underlayer attack ×1.5');
  await expect(overEtch).toContainText('underlayer attack ×1.25');
  await expect(page.locator('.pm-cash')).toHaveText('Cash 1500');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '13-doe');

  await press(page, overEtch.locator('.doe-button'));
  await expect(page.locator('.pm-cash')).toHaveText('Cash 1400');
  await expect(overEtch).toContainText('DOE done');
  await expect(page.locator('.doe-button')).toHaveCount(0);
  await expect(page.locator('.pm-button')).toHaveCount(0);   // one choice per stop

  // On to etch (litho in between, doing nothing): the card is tuned. On a
  // phone "Run litho" sits where Continue was; wait out the double-click
  // window so the guard doesn't swallow the tap (tasks/lessons.md).
  await press(page, goButton(page));
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, page.locator('.run-button'));
  await press(page, continueButton(page));
  await press(page, goButton(page));
  await expect(title(page)).toHaveText('Etch');
  const card = page.locator('.card-button', { hasText: 'Timed over-etch, DOE-centred' });
  await expect(card.locator('.chip-doe')).toHaveText('DOE');
  await screenshot(page, '14-doe-card');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
