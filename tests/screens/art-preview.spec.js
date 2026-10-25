// art-preview.spec.js — screen tests for the card art preview page.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// art-preview.html draws every card in src/content/content.js in the shared
// card frame (src/ui/cards.css). Playwright runs each test at desktop size
// and at phone size (playwright.config.js). Screenshots go to
// screenshots/desktop/ and screenshots/phone/ for a person to look at.
// No seed: this page has no randomness.

import { test, expect } from '@playwright/test';
import { PRACTICES, EQUIPMENT, MATERIALS, CONSUMABLES } from '../../src/content/content.js';

const PAGE = '/art-preview.html';
const CARD_COUNT = PRACTICES.length + EQUIPMENT.length + MATERIALS.length + CONSUMABLES.length;
const HAND_COUNT = 3;   // the 0.75× phone-hand row at the bottom of the page

// The width of a PNG image, read from its header (bytes 16 to 19).
function pngWidth(buffer) {
  return buffer.readUInt32BE(16);
}

// Saves a full-page screenshot and checks it is the size we asked for
// (a phone shot once came out at desktop size: tasks/lessons.md).
async function screenshot(page, name) {
  const project = test.info().project.name;
  const buffer = await page.screenshot({ path: `screenshots/${project}/${name}.png`, fullPage: true });
  expect(pngWidth(buffer), `${name}.png width`).toBe(page.viewportSize().width);
}

// Opens the page and waits until every card is built. Collects console
// errors and page crashes on the way.
async function openPreview(page) {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto(PAGE);
  await expect(page.locator('body')).toHaveAttribute('data-ready', 'true');
  return errors;
}

test('every card draws in the frame with no errors', async ({ page }) => {
  const errors = await openPreview(page);
  await expect(page.locator('.frame')).toHaveCount(CARD_COUNT + HAND_COUNT);
  // Every card has all seven parts of the anatomy.
  for (const part of ['.frame-band', '.frame-cost', '.frame-window', '.frame-kind',
    '.frame-rarity', '.frame-name', '.frame-effect', '.frame-tradeoff']) {
    await expect(page.locator(`.frame ${part}`), part).toHaveCount(CARD_COUNT + HAND_COUNT);
  }
  expect(errors).toEqual([]);
});

test('no card text runs off the bottom of its card', async ({ page }) => {
  await openPreview(page);
  // The tradeoff is the last thing on a card; its bottom edge must sit
  // inside the card's body, and the body must not need to scroll.
  const overflowing = await page.locator('.frame').evaluateAll(cards => cards
    .filter(card => {
      const body = card.querySelector('.frame-body');
      return body.scrollHeight > body.clientHeight + 1;
    })
    .map(card => card.getAttribute('aria-label')));
  expect(overflowing).toEqual([]);
});

test('the page never scrolls sideways and the theme button is big enough to tap', async ({ page }) => {
  await openPreview(page);
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBe(page.viewportSize().width);
  const box = await page.locator('#theme').boundingBox();
  expect(box.height).toBeGreaterThanOrEqual(44);
  expect(box.width).toBeGreaterThanOrEqual(44);
});

test('screenshots in light and night shift', async ({ page }) => {
  await openPreview(page);
  // Use the page's own button: system → light → night.
  const themeButton = page.locator('#theme');
  await themeButton.click();
  await expect(themeButton).toHaveText('Theme: light');
  await screenshot(page, 'art-preview-light');
  await themeButton.click();
  await expect(themeButton).toHaveText('Theme: night');
  await screenshot(page, 'art-preview-night');
});
