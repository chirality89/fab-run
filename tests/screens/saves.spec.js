// saves.spec.js — screen tests for save and resume (src/ui/storage.js and
// main.js), in a real browser.
// Run with: npm run screens   (needs npm install once; see CLAUDE.md §11)
//
// Each test starts with empty storage (Playwright gives every test a fresh
// browser profile). A reload (page.reload) must open on the same screen,
// with the lot exactly where it was.
// Screenshots go to screenshots/desktop/ and screenshots/phone/.

import { test, expect } from '@playwright/test';
import { createRun } from '../../src/engine/run.js';

const SEED = 123456;
const PAGE = `/?seed=${SEED}`;
const DOUBLE_CLICK_WINDOW_MS = 600;   // a little more than Chrome's 500 ms

// The first seed from SEED up whose last corridor (after CMP) offers an
// event. No event matters that late, so it is a quiet shift: a stop with
// nothing to choose, which shows the plain stop screen. (Until M4.5 item 5
// this test used the metrology stop, which the map no longer offers.)
const LAST_CORRIDOR = 7;
function seedWithQuietEventLast() {
  for (let seed = SEED; seed < SEED + 1000; seed++) {
    if (createRun({ seed }).map[LAST_CORRIDOR].offers.includes('event')) return seed;
  }
  throw new Error(`no seed from ${SEED} offers an event after CMP`);
}

// The first seed from SEED up whose corridor after step 2 offers procurement.
function seedWithProcurementSecond() {
  for (let seed = SEED; seed < SEED + 1000; seed++) {
    if (createRun({ seed }).map[1].offers.includes('procurement')) return seed;
  }
  throw new Error(`no seed from ${SEED} offers procurement after step 2`);
}

// Taps on a phone, clicks on a desktop.
async function press(page, locator) {
  if (test.info().project.use.hasTouch) await locator.tap();
  else await locator.click();
}

// Waits out the double-click window first, so a tap right after a screen
// change counts as a fresh tap (tasks/lessons.md).
async function pressAfterChange(page, locator) {
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
  await press(page, locator);
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
const button = (page, name) => page.getByRole('button', { name });
const resumedNote = page => page.locator('.resumed-note');
const etchCard = page => page.locator('.card-button', { hasText: 'Timed over-etch' });
const timeText = page => page.locator('.time-panel .meter-text');

// From the door, into the etch room (step 4), running steps 1–3 doing nothing.
async function walkToEtch(page) {
  await page.goto(PAGE);
  await press(page, goButton(page));                                   // Enter step 1
  for (let step = 1; step <= 3; step++) {
    await pressAfterChange(page, runButton(page));
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    await pressAfterChange(page, goButton(page));                      // straight on
  }
  await expect(title(page)).toHaveText('Etch');
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
}

test('reload in a room after playing a card: same room, same time left, hand still empty', async ({ page }) => {
  const errors = watchForErrors(page);
  await walkToEtch(page);
  await press(page, etchCard(page));
  await expect(timeText(page)).toHaveText('4 of 8 min left');
  const cashBefore = await page.locator('.cash').first().textContent();

  await page.reload();
  await expect(title(page)).toHaveText('Etch');
  await expect(resumedNote(page)).toHaveText(`Resumed seed ${SEED}`);
  await expect(timeText(page)).toHaveText('4 of 8 min left');
  await expect(etchCard(page)).toHaveCount(0);
  await expect(page.locator('.cash').first()).toHaveText(cashBefore);
  await expect(page).toHaveURL(new RegExp(`\\?seed=${SEED}$`));
  await expectNoSidewaysScroll(page);
  await screenshot(page, '30-resumed-room');

  // The run goes on from there; the note goes with the next screen.
  await pressAfterChange(page, button(page, 'Run etch'));
  await expect(button(page, 'Continue to the corridor')).toBeVisible();
  await expect(resumedNote(page)).toHaveCount(0);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

// "Continue to the corridor" only changes the screen, not the run, so it is
// not an action and isn't saved. A reload after Run therefore opens on the
// room's result again, even if the player had already gone on to the map:
// nothing is lost, it costs one more tap on Continue.
test('reload after Run shows the room result again; Continue leads to the map', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  await pressAfterChange(page, runButton(page));
  const outcome = await page.locator('.outcome-text').first().textContent();

  await page.reload();
  await expect(page.locator('.outcome-text').first()).toHaveText(outcome);
  await expect(resumedNote(page)).toHaveText(`Resumed seed ${SEED}`);
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await expect(title(page)).toHaveText('Floor plan');

  await page.reload();
  await expect(page.locator('.outcome-text').first()).toHaveText(outcome);
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await expect(title(page)).toHaveText('Floor plan');
  await expect(button(page, 'Scrap the lot')).toHaveCount(1);   // in a corridor, not at the door
  await expectNoSidewaysScroll(page);
  await screenshot(page, '31-resumed-map');
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('reload at a quiet side stop shows that stop again, with its Continue', async ({ page }) => {
  test.slow();   // walks the whole route to the last corridor
  const errors = watchForErrors(page);
  const seed = seedWithQuietEventLast();
  await page.goto(`/?seed=${seed}`);
  await press(page, goButton(page));                                     // Enter step 1
  for (let step = 1; step <= LAST_CORRIDOR + 1; step++) {
    await pressAfterChange(page, runButton(page));
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    if (step <= LAST_CORRIDOR) await pressAfterChange(page, goButton(page)); // straight on
  }
  await pressAfterChange(page, page.locator('.stop-button', { hasText: 'Event' }));
  await expect(page.locator('.outcome-text').first()).toContainText('quiet shift');
  const stopText = await page.locator('.outcome-text').first().textContent();

  await page.reload();
  await expect(page.locator('.outcome-text').first()).toHaveText(stopText);
  await pressAfterChange(page, goButton(page));
  await expect(page.locator('.room-step')).toContainText('Step 9');
  expect(errors, `console errors (seed ${seed})`).toEqual([]);
});

test('reload in the shop after buying: still open, item still bought, cash still paid', async ({ page }) => {
  const errors = watchForErrors(page);
  const seed = seedWithProcurementSecond();
  await page.goto(`/?seed=${seed}`);
  await press(page, goButton(page));                                     // Enter step 1
  for (let step = 1; step <= 2; step++) {
    await pressAfterChange(page, runButton(page));
    await pressAfterChange(page, button(page, 'Continue to the corridor'));
    if (step === 1) await pressAfterChange(page, goButton(page));          // straight on to step 2
  }
  await pressAfterChange(page, page.locator('.stop-button', { hasText: 'Procurement' }));
  await expect(title(page)).toHaveText('Procurement');
  await pressAfterChange(page, page.locator('.buy-button').first());
  await expect(page.locator('.shop-bought')).toHaveCount(1);
  const cash = await page.locator('.cash').first().textContent();

  await page.reload();
  await expect(title(page)).toHaveText('Procurement');
  await expect(page.locator('.shop-bought')).toHaveCount(1);
  await expect(page.locator('.cash').first()).toHaveText(cash);
  await expect(resumedNote(page)).toHaveText(`Resumed seed ${seed}`);
  await expectNoSidewaysScroll(page);
  await screenshot(page, '32-resumed-shop');
  expect(errors, `console errors (seed ${seed})`).toEqual([]);
});

test('a link to another seed starts that seed fresh instead of resuming', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  await pressAfterChange(page, runButton(page));

  const otherSeed = SEED + 1;
  await page.goto(`/?seed=${otherSeed}`);
  await expect(title(page)).toHaveText('Floor plan');
  await expect(page.locator('.seed')).toHaveText(`Seed ${otherSeed}`);
  await expect(resumedNote(page)).toHaveCount(0);
  await expect(button(page, 'Scrap the lot')).toHaveCount(0);   // at the door

  // The old save was replaced: going back to the first seed starts it fresh too.
  await page.goto(PAGE);
  await expect(resumedNote(page)).toHaveCount(0);
  await expect(button(page, 'Scrap the lot')).toHaveCount(0);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('a finished run is not resumed: reload after scrapping starts fresh', async ({ page }) => {
  const errors = watchForErrors(page);
  await page.goto(PAGE);
  await press(page, goButton(page));
  await pressAfterChange(page, runButton(page));
  await pressAfterChange(page, button(page, 'Continue to the corridor'));
  await pressAfterChange(page, button(page, 'Scrap the lot'));
  await pressAfterChange(page, button(page, 'Yes, scrap it'));
  await expect(title(page)).toHaveText('Ship report');

  await page.reload();
  await expect(title(page)).toHaveText('Floor plan');
  await expect(resumedNote(page)).toHaveCount(0);
  await expect(button(page, 'Scrap the lot')).toHaveCount(0);   // at the door
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});

test('with storage blocked the game still plays; a reload starts fresh', async ({ page }) => {
  // Every use of localStorage throws, as in a browser with storage blocked.
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() { throw new Error('storage is blocked'); },
    });
  });
  const errors = watchForErrors(page);
  await walkToEtch(page);
  const blocked = await page.evaluate(() => {
    try { window.localStorage; return false; } catch { return true; }
  });
  expect(blocked, 'localStorage should throw in this test').toBe(true);
  await press(page, etchCard(page));
  await expect(timeText(page)).toHaveText('4 of 8 min left');

  await page.reload();
  await expect(title(page)).toHaveText('Floor plan');
  await expect(resumedNote(page)).toHaveCount(0);
  await expect(page.locator('.error-box')).toHaveCount(0);
  expect(errors, `console errors (seed ${SEED})`).toEqual([]);
});
