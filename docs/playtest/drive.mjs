// drive.mjs — plays Fab Run one step at a time for the persona playtesters.
//
// This is a playtest helper, not part of the game. It lives in docs/playtest/
// because Lane F owns this folder (tasks/todo-f.md).
//
// A persona can't keep a browser open between its steps, so every call:
//   1. opens the served game at ?seed=N,
//   2. replays every action in the actions file, in order,
//   3. saves a screenshot and prints only what a player can see:
//      the page text, the buttons you can tap, and any errors.
// Same seed + same actions = same run (CLAUDE.md §8), so replaying is safe,
// and any problem can be reproduced from its seed and actions file.
//
// Usage (the game must be served: python3 -m http.server 8000):
//   node docs/playtest/drive.mjs --persona student --seed 42 --size phone
//
// The actions file is screenshots/playtest/<persona>/<seed>-<size>.actions
// (created empty if missing). One action per line:
//   click:Enter step 1: Wet clean   tap the button with this exact label
//   click:Buy@2                      the 2nd button with that label
//   doubletap:Run etch               two fast taps on one button (a double click)
//   reload                           reload the page
//   back                             the browser's back button
//   goto:?seed=777                   open another address on the game
//   wait:1000                        wait this many milliseconds
// Add one line, run again, and you see the screen after that action.

import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

// Playwright is loaded with require so it is found both after `npm install`
// (it comes with @playwright/test) and where it is installed system-wide.
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const GAME_URL = 'http://localhost:8000/';
const SIZES = {
  desktop: { viewport: { width: 1280, height: 800 } },
  phone: { viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true },
};
// A little more than Chrome's 500 ms, so two taps never count as a double
// click (tasks/lessons.md).
const DOUBLE_CLICK_WINDOW_MS = 600;
const SETTLE_MS = 300;

// Reads --name value pairs from the command line.
function readArgs() {
  const args = {};
  const list = process.argv.slice(2);
  for (let i = 0; i < list.length; i += 2) args[list[i].replace(/^--/, '')] = list[i + 1];
  if (!args.persona || !args.seed || !SIZES[args.size]) {
    console.error('Usage: node docs/playtest/drive.mjs --persona NAME --seed N --size desktop|phone');
    process.exit(2);
  }
  return args;
}

// Every tappable thing on the page, with its visible label, in page order.
// Labels that repeat get @2, @3… so each one can be named exactly.
async function tappables(page) {
  const found = await page.$$eval('button, a[href], [role="button"], input, select', (elements) =>
    elements
      .filter((el) => el.offsetParent !== null || el.getClientRects().length > 0)
      .map((el) => {
        const box = el.getBoundingClientRect();
        return {
          label: (el.innerText || el.value || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
          disabled: el.disabled === true || el.getAttribute('aria-disabled') === 'true',
          width: Math.round(box.width),
          height: Math.round(box.height),
          belowFold: box.top > window.innerHeight,
        };
      }));
  const seen = {};
  for (const item of found) {
    seen[item.label] = (seen[item.label] || 0) + 1;
    item.name = seen[item.label] > 1 ? `${item.label}@${seen[item.label]}` : item.label;
  }
  return found;
}

// Splits "Buy@2" into the label "Buy" and the index 2.
function parseTarget(target) {
  const match = target.match(/^(.*)@(\d+)$/);
  return match ? { label: match[1], index: Number(match[2]) } : { label: target, index: 1 };
}

async function tapByLabel(page, target, isPhone, times = 1) {
  const { label, index } = parseTarget(target);
  const handles = await page.$$('button, a[href], [role="button"], input, select');
  let count = 0;
  for (const handle of handles) {
    const text = (await handle.evaluate((el) =>
      (el.innerText || el.value || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim()));
    if (text !== label) continue;
    count += 1;
    if (count !== index) continue;
    await handle.scrollIntoViewIfNeeded();
    if (times === 2) await handle.dblclick();
    else if (isPhone) await handle.tap();
    else await handle.click();
    return;
  }
  throw new Error(`No button labelled "${target}" on this screen.`);
}

async function runAction(page, action, isPhone) {
  const colon = action.indexOf(':');
  const verb = colon === -1 ? action : action.slice(0, colon);
  const rest = colon === -1 ? '' : action.slice(colon + 1).trim();
  if (verb === 'click') await tapByLabel(page, rest, isPhone);
  else if (verb === 'doubletap') await tapByLabel(page, rest, isPhone, 2);
  else if (verb === 'reload') await page.reload();
  else if (verb === 'back') await page.goBack();
  else if (verb === 'goto') await page.goto(new URL(rest, GAME_URL).href);
  else if (verb === 'wait') await page.waitForTimeout(Number(rest));
  else throw new Error(`Unknown action "${action}".`);
  await page.waitForTimeout(DOUBLE_CLICK_WINDOW_MS);
}

async function main() {
  const args = readArgs();
  const isPhone = args.size === 'phone';
  const folder = path.join('screenshots', 'playtest', args.persona);
  fs.mkdirSync(folder, { recursive: true });
  const actionsFile = path.join(folder, `${args.seed}-${args.size}.actions`);
  if (!fs.existsSync(actionsFile)) fs.writeFileSync(actionsFile, '');
  const actions = fs.readFileSync(actionsFile, 'utf8').split('\n').map((l) => l.trim()).filter(Boolean);

  const browser = await chromium.launch();
  const page = await browser.newPage(SIZES[args.size]);
  const errors = [];
  page.on('pageerror', (error) => errors.push(`page error: ${error.message}`));
  page.on('console', (message) => {
    // A failed font request offline is not a game error.
    if (message.type() === 'error' && !/fonts\.(googleapis|gstatic)/.test(message.text())) {
      errors.push(`console error: ${message.text()}`);
    }
  });

  await page.goto(`${GAME_URL}?seed=${args.seed}`);
  await page.waitForTimeout(SETTLE_MS);
  for (let i = 0; i < actions.length; i += 1) {
    try {
      await runAction(page, actions[i], isPhone);
    } catch (error) {
      console.log(`ACTION ${i + 1} FAILED: ${actions[i]}\n${error.message}`);
      console.log('Fix or remove that line in', actionsFile);
      await browser.close();
      process.exit(1);
    }
  }
  await page.waitForTimeout(SETTLE_MS);

  const step = String(actions.length).padStart(3, '0');
  const shot = path.join(folder, `${args.seed}-${args.size}-${step}.png`);
  const fullShot = path.join(folder, `${args.seed}-${args.size}-${step}-full.png`);
  await page.screenshot({ path: shot });
  await page.screenshot({ path: fullShot, fullPage: true });

  const viewport = page.viewportSize();
  console.log(`SEED ${args.seed} · ${args.size} ${viewport.width}x${viewport.height} · step ${actions.length}`);
  console.log(`ADDRESS ${page.url()}`);
  console.log(`SCREENSHOT (what fits on screen) ${shot}`);
  console.log(`SCREENSHOT (whole page) ${fullShot}`);
  console.log('\n--- PAGE TEXT ---');
  console.log(await page.innerText('body'));
  console.log('\n--- BUTTONS (use the name after "click:") ---');
  for (const item of await tappables(page)) {
    const notes = [`${item.width}x${item.height}px`];
    if (item.disabled) notes.push('disabled');
    if (item.belowFold) notes.push('below the fold');
    console.log(`click:${item.name}   (${notes.join(', ')})`);
  }
  console.log('\n--- ERRORS ---');
  console.log(errors.length ? errors.join('\n') : 'none');
  await browser.close();
}

main();
