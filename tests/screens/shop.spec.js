// shop.spec.js — screen tests for the procurement stop, in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Runs at desktop and phone size (playwright.config.js), on the first seed
// from 123456 up whose corridor after step 2 offers procurement and sells the
// pad conditioner, the DUV resist and the thick resist to a player whose
// notebook unlocks them (tests/shopSeed.js).
// Searched, so new equipment or materials in content.js can't break it.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { seedSellingTestItems, SHOP_TEST_NOTEBOOK } from '../shopSeed.js';

const SEED = seedSellingTestItems();
const PAGE = `/?seed=${SEED}`;

// Since M4 item 4 the shop sells only starter and unlocked items. Each page
// starts with the notebook the seed search assumed (tests/shopSeed.js), so
// the page's shop has the same stock. It is stored before the page loads.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(notebook => {
    localStorage.setItem('fabrun.notebook', JSON.stringify(notebook));
  }, SHOP_TEST_NOTEBOOK);
});

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
// The item whose NAME is `name` (another item's "Replaces the …" line may
// mention it too).
const shopItem = (page, name) => page.locator('.shop-item').filter({ has: page.locator('.card-name', { hasText: name }) });

// Plays steps 1 and 2 doing nothing, then takes the procurement stop.
async function walkToShop(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));                       // Enter step 1
  await press(page, page.locator('.run-button'));
  await press(page, continueButton(page));
  await press(page, goButton(page));                       // straight on to step 2
  await press(page, page.locator('.run-button'));
  await press(page, continueButton(page));
  await press(page, page.locator('.stop-button', { hasText: 'Procurement' }));
  await expect(title(page)).toHaveText('Procurement');
}

test('the procurement stop shows 3 items with prices, tradeoffs and where they act', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToShop(page);
  await expect(page.locator('.shop-item')).toHaveCount(3);
  await expect(page.locator('.shop-cash')).toHaveText('Cash 1500');
  await expect(shopItem(page, 'In-situ pad conditioner')).toContainText('350 cash');
  await expect(shopItem(page, 'In-situ pad conditioner')).toContainText('Next used at step 8: CMP');
  await expect(shopItem(page, 'Chemically amplified DUV resist')).toContainText('Replaces the i-line positive resist');
  await expect(page.locator('.buy-button')).toHaveCount(3);
  await expect(goButton(page)).toHaveText('Continue to step 3: Litho (trench)');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '9-shop');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('buying takes the cash, marks the item Bought, and it shows in the room', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToShop(page);
  const resist = shopItem(page, 'Chemically amplified DUV resist');
  await press(page, resist.locator('.buy-button'));
  await expect(page.locator('.shop-cash')).toHaveText('Cash 1360');
  await expect(resist.locator('.shop-bought')).toHaveText('Bought');
  await expect(resist.locator('.buy-button')).toHaveCount(0);
  await expect(page.locator('.buy-button')).toHaveCount(2);
  await expect(shopItem(page, 'Thick resist for deep etch')).toContainText('Replaces the Chemically amplified DUV resist');
  await expectNoSidewaysScroll(page);
  await screenshot(page, '10-shop-bought');

  await press(page, goButton(page));
  await expect(title(page)).toHaveText('Litho bay');
  await expect(page.locator('.slots-panel')).toContainText('Chemically amplified DUV resist');
  await expect(page.locator('.cash')).toHaveText('Cash 1360');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
