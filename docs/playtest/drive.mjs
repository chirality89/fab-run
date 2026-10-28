// drive.mjs — the playtest personas' only way to touch the game.
//
// A persona runs this through Bash, one command at a time:
//
//   node docs/playtest/drive.mjs <persona> rules [--phone]   the shared persona rules (run first)
//   node docs/playtest/drive.mjs <persona> open <seed> [--phone]
//   node docs/playtest/drive.mjs <persona> look            what is on screen + numbered buttons
//   node docs/playtest/drive.mjs <persona> tap <n|"text">  tap a button by number or by its words
//   node docs/playtest/drive.mjs <persona> shot <name> [--full]
//   node docs/playtest/drive.mjs <persona> reload          reload the page (same address)
//   node docs/playtest/drive.mjs <persona> goto <seed>     change ?seed= in the address and load it
//   node docs/playtest/drive.mjs <persona> scroll <pixels> scroll down (negative = up)
//   node docs/playtest/drive.mjs <persona> url
//   node docs/playtest/drive.mjs <persona> close
//
// It shows only what a player sees: the words on the page, the buttons, and
// screenshots. It never reads the game's source.
//
// How it works: `open` starts a small background helper that owns one real
// browser. Later commands send it a message over a local port and print the
// answer. (Each command is a separate shell call, so the browser has to live
// in a process that stays alive between them.)
//
// Environment: PLAYTEST_URL is the served game (default http://localhost:8100).

import { createRequire } from 'node:module';
import { spawn } from 'node:child_process';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const SHOTS = path.join(HERE, 'shots');
const GAME_URL = process.env.PLAYTEST_URL ?? 'http://localhost:8100';
// A little more than Chrome's 500 ms double-click window (tasks/lessons.md):
// two taps closer than this count as one double tap and the second is ignored.
const DOUBLE_CLICK_WINDOW_MS = 600;
const PHONE = { width: 375, height: 812 };
const DESKTOP = { width: 1280, height: 800 };

// ---- which port belongs to which persona ---------------------------------

function portFor(persona) {
  let sum = 0;
  for (const letter of persona) sum += letter.charCodeAt(0);
  return 9300 + (sum % 500);
}

// ---- the helper process (owns the browser) --------------------------------

async function serve(persona, phone) {
  // Playwright is installed globally in the cloud container; try the repo
  // first (after `npm install`), then that location.
  const require = createRequire(import.meta.url);
  let playwright;
  try { playwright = require('playwright'); }
  catch { playwright = require('/opt/node-tools/node_modules/playwright'); }

  const browser = await playwright.chromium.launch();
  const context = await browser.newContext(
    phone
      ? { viewport: PHONE, isMobile: true, hasTouch: true }
      : { viewport: DESKTOP },
  );
  const page = await context.newPage();
  let step = 0;                 // counts taps, used in screenshot names
  let lastTapAt = 0;
  const personaDir = path.join(SHOTS, persona);
  fs.mkdirSync(personaDir, { recursive: true });

  // Every visible thing a finger could press, in reading order.
  async function buttons() {
    return page.evaluate(() => {
      const selector = 'button, a[href], [role="button"], input, select, summary';
      const found = [];
      for (const node of document.querySelectorAll(selector)) {
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        if (box.width === 0 || box.height === 0 || style.visibility === 'hidden' || style.display === 'none') continue;
        found.push({
          text: (node.innerText || node.value || node.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim(),
          disabled: node.disabled === true || node.getAttribute('aria-disabled') === 'true',
          width: Math.round(box.width),
          height: Math.round(box.height),
          onScreen: box.top >= 0 && box.bottom <= window.innerHeight,
        });
      }
      return found;
    });
  }

  async function look() {
    const text = await page.evaluate(() => document.body.innerText);
    const list = await buttons();
    const view = await page.evaluate(() => ({
      pageHeight: document.documentElement.scrollHeight,
      windowHeight: window.innerHeight,
      scrolled: Math.round(window.scrollY),
    }));
    const lines = list.map((b, i) => {
      const notes = [];
      if (b.disabled) notes.push('greyed out');
      if (!b.onScreen) notes.push('below/above the visible part');
      if (b.height < 44 || b.width < 44) notes.push(`small target ${b.width}x${b.height}px`);
      return `  [${i}] ${b.text || '(no words)'}${notes.length ? '   <' + notes.join('; ') + '>' : ''}`;
    });
    return [
      `URL: ${page.url()}`,
      `Screen ${page.viewportSize().width}x${page.viewportSize().height}; page is ${view.pageHeight}px tall, scrolled ${view.scrolled}px`,
      '--- words on the page ---',
      text.trim(),
      '--- buttons ---',
      ...lines,
    ].join('\n');
  }

  async function tap(which) {
    const list = await buttons();
    // Re-find the element in the page so we tap the live one.
    const all = await page.$$('button, a[href], [role="button"], input, select, summary');
    const visible = [];
    for (const handle of all) {
      if (await handle.isVisible()) visible.push(handle);
    }
    let index = /^\d+$/.test(which) ? Number(which) : -1;
    if (index < 0) {
      const wanted = which.toLowerCase();
      index = list.findIndex(b => b.text.toLowerCase() === wanted);
      if (index < 0) index = list.findIndex(b => b.text.toLowerCase().includes(wanted));
    }
    if (index < 0 || index >= visible.length) return `No button matches "${which}". Use look.`;
    // A person cannot tap faster than the double-click window.
    const wait = DOUBLE_CLICK_WINDOW_MS - (Date.now() - lastTapAt);
    if (wait > 0) await page.waitForTimeout(wait);
    const target = visible[index];
    await target.scrollIntoViewIfNeeded();
    if (phone) await target.tap(); else await target.click();
    lastTapAt = Date.now();
    step += 1;
    await page.waitForTimeout(400);
    return `Tapped [${index}] "${list[index].text}". Step is now ${step}.`;
  }

  async function shot(name, full) {
    const safeName = name.replace(/[^a-z0-9-]/gi, '-');
    const seed = new URL(page.url()).searchParams.get('seed') ?? 'noseed';
    const file = path.join(personaDir, `${seed}-${String(step).padStart(2, '0')}-${safeName}.png`);
    await page.screenshot({ path: file, fullPage: full });
    // Report the real pixel size: a phone shot must be 375 wide (tasks/lessons.md).
    const buffer = fs.readFileSync(file);
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return `${path.relative(path.join(HERE, '..', '..'), file)}  (${width}x${height}px)`;
  }

  const handlers = {
    look: () => look(),
    tap: args => tap(args.join(' ')),
    shot: args => shot(args.filter(a => a !== '--full')[0] ?? 'screen', args.includes('--full')),
    reload: async () => { await page.reload(); await page.waitForTimeout(400); return 'Reloaded.'; },
    goto: async args => {
      await page.goto(`${GAME_URL}/?seed=${args[0]}`, { waitUntil: 'networkidle' });
      await page.waitForTimeout(800);
      step = 0;
      return `Opened seed ${args[0]}.`;
    },
    scroll: async args => { await page.mouse.wheel(0, Number(args[0] ?? 400)); await page.waitForTimeout(200); return 'Scrolled.'; },
    url: async () => page.url(),
    close: async () => { setTimeout(() => process.exit(0), 100); await browser.close(); return 'Closed.'; },
  };

  const server = http.createServer((request, response) => {
    let body = '';
    request.on('data', chunk => { body += chunk; });
    request.on('end', async () => {
      const { command, args } = JSON.parse(body);
      let answer;
      try { answer = await handlers[command](args); }
      catch (error) { answer = `Problem: ${error.message}`; }
      response.end(String(answer));
    });
  });
  server.listen(portFor(persona), '127.0.0.1');
  return { page, goto: seed => handlers.goto([seed]) };
}

// ---- the command line (what the persona runs) -----------------------------

function send(persona, command, args) {
  return new Promise((resolve, reject) => {
    const request = http.request(
      { host: '127.0.0.1', port: portFor(persona), method: 'POST' },
      response => {
        let text = '';
        response.on('data', chunk => { text += chunk; });
        response.on('end', () => resolve(text));
      },
    );
    request.on('error', () => reject(new Error('No game is open for this persona. Run: open <seed>')));
    request.end(JSON.stringify({ command, args }));
  });
}

// `rules`: print the shared persona rules (docs/playtest/persona-rules.md)
// with this persona's name and screen size filled in. One file holds the
// rules for all five personas, so a change is made once.
function printRules(persona, phone) {
  const rulesPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'persona-rules.md');
  const template = fs.readFileSync(rulesPath, 'utf8')
    .replace(/^<!--[\s\S]*?-->\s*/, ''); // drop the note for editors at the top
  const open = phone
    ? '`open <seed> --phone`'
    : '`open <seed>` (desktop 1280x800)';
  const sizeCheck = phone
    ? 'Check the pixel size the driver prints. Phone shots must be 375 wide and 812 tall. If a shot is not 375 wide, the phone setup is broken: stop and say so in your report.'
    : 'Check the pixel size the driver prints. Desktop shots must be 1280 wide.';
  console.log(template
    .replaceAll('{persona}', persona)
    .replaceAll('{open}', open)
    .replaceAll('{sizeCheck}', sizeCheck));
}

async function main() {
  const [first, ...rest] = process.argv.slice(2);

  // Internal: the background helper starts itself with this flag.
  if (first === '--serve') {
    const [persona, seed, phoneFlag] = rest;
    const { goto } = await serve(persona, phoneFlag === 'phone');
    await goto(seed);
    return;
  }

  const persona = first;
  const [command, ...args] = rest;
  if (!persona || !command) {
    console.log('Usage: node docs/playtest/drive.mjs <persona> rules|open|look|tap|shot|reload|goto|scroll|url|close ...');
    return;
  }

  if (command === 'rules') {
    printRules(persona, args.includes('--phone'));
    return;
  }

  if (command === 'open') {
    const seed = args.find(a => /^\d+$/.test(a));
    if (!seed) { console.log('open needs a seed number.'); return; }
    await send(persona, 'close', []).catch(() => {});
    await new Promise(r => setTimeout(r, 300));
    const phone = args.includes('--phone') ? 'phone' : 'desktop';
    const helper = spawn(process.execPath, [fileURLToPath(import.meta.url), '--serve', persona, seed, phone], {
      detached: true,
      stdio: 'ignore',
    });
    helper.unref();
    // Wait until the helper answers.
    for (let tries = 0; tries < 40; tries++) {
      await new Promise(r => setTimeout(r, 250));
      let screen;
      try { screen = await send(persona, 'look', []); }
      catch { continue; }          // helper not up yet
      console.log(`Opened seed ${seed} (${phone}).`);
      console.log(screen);
      return;
    }
    console.log('The game did not open. Is the server running at ' + GAME_URL + '?');
    return;
  }

  try { console.log(await send(persona, command, args)); }
  catch (error) { console.log(error.message); }
}

main();
