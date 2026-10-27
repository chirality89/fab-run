// seed.spec.js — a link with a seed that isn't one (M4.5 small fixes, Lane
// F issue 15). The game starts a fresh seed, as before, but now says so.
// Run with: npm run screens

import { test, expect } from '@playwright/test';

test('?seed=abc starts a fresh seed and says which', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(String(error)));
  await page.goto('/?seed=abc');
  const note = page.locator('.seed-note');
  await expect(note).toHaveText(/^"abc" is not a seed \(a whole number from 0 to 4294967295\), so this is seed \d+\.$/);
  // The seed named in the note is the one now in the address and on screen.
  const seed = (await note.textContent()).match(/seed (\d+)\.$/)[1];
  expect(new URL(page.url()).searchParams.get('seed')).toBe(seed);
  await page.screenshot({ path: `screenshots/${test.info().project.name}/40-bad-seed.png`, fullPage: true });
  expect(errors).toEqual([]);
});

test('a good seed shows no note', async ({ page }) => {
  await page.goto('/?seed=123456');
  await expect(page.locator('.room-name, h1').first()).toBeVisible();
  await expect(page.locator('.seed-note')).toHaveCount(0);
});
