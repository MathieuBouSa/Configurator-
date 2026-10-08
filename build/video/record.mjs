/* ============================================================
   SALUS Configurator - trade-show video recorder
   ------------------------------------------------------------
   Plays a scripted walkthrough of one of the configurators and
   records it as a looping 1920 x 1080 MP4 for a screen on a
   stand: the live site inside a browser window, a brand panel
   with the steps and a caption, a visible cursor, intro and
   outro cards. No sound - a stand screen plays muted.

       npm install --no-save playwright
       node build/video/record.mjs r-system
       node build/video/record.mjs configurator

   Scenarios live next to this file (build/video/<name>.mjs).
   Output goes to video/<name>-salon.mp4.

   Options
       --out <file>     output path (default video/<name>-salon.mp4)
       --fps <n>        frames per second (default 30)
       --crf <n>        x264 quality, lower is better (default 18)

   Needs ffmpeg on the PATH, Playwright's Chromium, and the npm
   registry once per run for the R-System page (its Tailwind CDN
   build is compiled locally, see tailwindShim below).

   How it stays smooth: the page is never filmed in real time.
   Every output frame is staged, then screenshotted. The script
   owns the clock: each frame it pauses every CSS animation and
   transition of the stage and the site and sets them to the
   frame's time, so a 0.35 s fade lasts exactly 0.35 s of video
   however slow the machine is. A frame where nothing moves is
   not screenshotted again, only repeated.
   ============================================================ */

import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname, extname, normalize, relative } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

/* ---------- arguments ---------- */

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const name = argv.find(a => !a.startsWith("--") && !argv[argv.indexOf(a) - 1]?.startsWith("--"));
if (!name || !existsSync(join(HERE, `${name}.mjs`))) {
  console.error("Usage: node build/video/record.mjs <r-system|configurator> [--out file] [--fps 30] [--crf 18]");
  process.exit(1);
}
const FPS = Number(opt("fps", 30));
const CRF = String(opt("crf", 18));
const OUT = join(ROOT, opt("out", `video/${name}-salon.mp4`));

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error("Playwright is missing: npm install --no-save playwright"); process.exit(1); }

const scenario = (await import(pathToFileURL(join(HERE, `${name}.mjs`)).href)).default;

/* ---------- local static server (the repository, as Netlify serves it) ---------- */

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".pdf": "application/pdf",
};

function serve() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://local").pathname);
    if (p.endsWith("/")) p += "index.html";
    const file = normalize(join(ROOT, p));
    if (relative(ROOT, file).startsWith("..") || !existsSync(file) || statSync(file).isDirectory()) {
      res.writeHead(404); res.end(); return;
    }
    res.writeHead(200, { "content-type": MIME[extname(file)] || "application/octet-stream" });
    res.end(readFileSync(file));
  });
  return new Promise(ok => srv.listen(0, "127.0.0.1", () => ok(srv)));
}

/* ---------- third-party scripts served from vendor/ ----------
   The R-System page loads React, jsPDF and Tailwind from CDNs. The
   recording swaps in the identical bundled copies, so a run does not
   depend on those hosts being up (or reachable from a CI box). */

const VENDOR = [
  [/^https:\/\/unpkg\.com\/react@18\/umd\/react\.production\.min\.js/, "vendor/react.min.js"],
  [/^https:\/\/unpkg\.com\/react-dom@18\/umd\/react-dom\.production\.min\.js/, "vendor/react-dom.min.js"],
  [/^https:\/\/cdnjs\.cloudflare\.com\/ajax\/libs\/jspdf\/2\.5\.1\/jspdf\.umd\.min\.js/, "vendor/jspdf.umd.min.js"],
];

/* The Tailwind Play CDN compiles classes in the browser. Same result,
   compiled once here with Tailwind 3 over the page's own source, then
   injected by a stand-in for the CDN script. */
function tailwindShim(page) {
  const dir = mkdtempSync(join(tmpdir(), "salus-video-"));
  try {
    writeFileSync(join(dir, "in.css"), "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n");
    execFileSync("npx", ["--yes", "tailwindcss@3", "-i", join(dir, "in.css"), "-o", join(dir, "out.css"),
      "--content", join(ROOT, page), "--minify"], { stdio: "pipe" });
    const css = readFileSync(join(dir, "out.css"), "utf8");
    return `(function(){var s=document.createElement("style");s.textContent=${JSON.stringify(css)};document.head.appendChild(s);})();`;
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

/* ---------- the clock ----------
   Runs inside the stage and inside the site. Every animation it has not
   seen yet is paused and stamped with the current video time; then each
   one is set to (now - stamp). Returns true while anything is moving
   (one extra frame, so the finished state is captured too). */

const SYNC_ANIMATIONS = ([t, dt]) => {
  const seen = window.__videoClock || (window.__videoClock = new WeakMap());
  let moving = false;
  for (const a of document.getAnimations()) {
    let t0 = seen.get(a);
    if (t0 === undefined) { t0 = t; seen.set(a, t0); a.pause(); }
    const end = a.effect ? a.effect.getComputedTiming().endTime : 0;
    const local = Math.max(0, t - t0);
    a.currentTime = Math.min(local, end);
    if (local < end + dt) moving = true;
  }
  return moving;
};

/* Finds an element of the site from a small spec: a CSS selector, then
   optionally the text it contains, the alt of an image inside it, and
   which match to take. Installed in every frame before any page script. */
const PICK = () => {
  window.__pick = (spec) => {
    let els = [...document.querySelectorAll(spec.css)];
    if (spec.text) els = els.filter(e => e.textContent.replace(/\s+/g, " ").includes(spec.text));
    if (spec.alt) els = els.filter(e => e.querySelector(`img[alt="${spec.alt}"]`));
    return els[spec.index || 0] || null;
  };
};

const BOX = (spec) => {
  const e = window.__pick(spec);
  if (!e) return null;
  const b = e.getBoundingClientRect();
  return {
    x: b.left, y: b.top, w: b.width, h: b.height,
    scrollY: window.scrollY, vh: window.innerHeight,
    max: document.documentElement.scrollHeight - window.innerHeight,
  };
};

const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);   // cubic in-out
const sine = p => -(Math.cos(Math.PI * p) - 1) / 2;                            // gentler, for long scrolls

class Recorder {
  constructor(page, site, ffmpeg) {
    Object.assign(this, { page, site, ffmpeg });
    this.dt = 1000 / FPS;
    this.t = 0;
    this.frames = 0;
    this.shots = 0;
    this.last = null;
    this.dirty = true;
    this.cx = 1180; this.cy = 640;
  }

  /* One output frame: settle the animations, screenshot if anything changed, write. */
  async tick() {
    const moving = await Promise.all([
      this.page.evaluate(SYNC_ANIMATIONS, [this.t, this.dt]),
      this.site.evaluate(SYNC_ANIMATIONS, [this.t, this.dt]),
    ]);
    if (this.dirty || moving[0] || moving[1] || !this.last) {
      this.last = await this.page.screenshot({ type: "png" });
      this.shots++;
    }
    if (!this.ffmpeg.stdin.write(this.last)) await new Promise(ok => this.ffmpeg.stdin.once("drain", ok));
    this.dirty = false;
    this.t += this.dt;
    this.frames++;
    if (this.frames % FPS === 0) process.stdout.write(`\r  ${(this.frames / FPS).toFixed(0).padStart(3)} s of video  (${this.shots} frames rendered)`);
  }

  /* `sec` seconds of frames; fn(progress) stages each one. */
  async animate(sec, fn) {
    const n = Math.max(1, Math.round(sec * FPS));
    for (let i = 1; i <= n; i++) {
      if (fn) { await fn(i / n); this.dirty = true; }
      await this.tick();
    }
  }
  wait(sec) { return this.animate(sec, null); }

  async stage(fn, arg) { await this.page.evaluate(fn, arg); this.dirty = true; }

  /* ----- panel and cards ----- */
  step(i, text) { return this.stage(([i, text]) => stage.step(i, text), [i, text]); }
  card(id, on) { return this.stage(([id, on]) => stage.card(id, on), [id, on]); }

  /* ----- cursor ----- */
  async cursorOn(on) {
    if (on) await this.stage(([x, y]) => stage.cursor(x, y), [this.cx, this.cy]);
    await this.stage(on => stage.cursorOn(on), on);
    if (!on) await this.page.mouse.move(200, 600);     // park the real mouse on the panel: no stray hover
  }
  async moveTo(x, y, sec = 0.9) {
    const x0 = this.cx, y0 = this.cy;
    const arc = Math.min(40, Math.hypot(x - x0, y - y0) * 0.08);
    await this.animate(sec, async p => {
      const e = ease(p);
      const nx = x0 + (x - x0) * e, ny = y0 + (y - y0) * e - Math.sin(Math.PI * p) * arc;
      this.cx = nx; this.cy = ny;
      await Promise.all([this.page.mouse.move(nx, ny), this.page.evaluate(([x, y]) => stage.cursor(x, y), [nx, ny])]);
    });
  }
  /* real: false only shows the click (for a <select>, whose native popup a screenshot cannot see). */
  async click({ real = true } = {}) {
    await this.stage(() => stage.press(true));
    await this.wait(0.12);
    await this.stage(([x, y]) => stage.ripple(x, y), [this.cx, this.cy]);
    if (real) { await this.page.mouse.down(); await this.page.mouse.up(); }
    await this.stage(() => stage.press(false));
  }

  /* ----- the site ----- */
  async box(spec) {
    const b = await this.site.evaluate(BOX, spec);
    if (!b) throw new Error("Element not found on the page: " + JSON.stringify(spec));
    return b;
  }
  async frameOrigin() {
    return this.page.evaluate(() => { const r = document.getElementById("site").getBoundingClientRect(); return { x: r.left, y: r.top }; });
  }
  /* Glide the cursor onto an element (at a fraction of its box). */
  async point(spec, { sec = 0.9, at = [0.5, 0.5] } = {}) {
    const b = await this.box(spec);
    const o = await this.frameOrigin();
    await this.moveTo(o.x + b.x + b.w * at[0], o.y + b.y + b.h * at[1], sec);
  }
  async clickOn(spec, opts = {}) {
    await this.point(spec, opts);
    await this.wait(opts.pause ?? 0.25);
    await this.click();
  }
  /* Pick an option of a <select>: the cursor clicks it, the value is set the way a person's choice would. */
  async choose(spec, value, opts = {}) {
    await this.point(spec, opts);
    await this.wait(0.2);
    await this.click({ real: false });
    await this.site.evaluate(([spec, value]) => {
      const el = window.__pick(spec);
      el.value = value;
      el.dispatchEvent(new Event("change", { bubbles: true }));
    }, [spec, value]);
    this.dirty = true;
  }
  /* Off camera only (behind a card): click without the cursor, reload the site. */
  async clickNow(spec) {
    await this.box(spec);
    await this.site.evaluate(spec => window.__pick(spec).click(), spec);
    this.dirty = true;
  }
  async reloadSite() {
    await this.site.evaluate(() => { try { localStorage.clear(); } catch (e) { /* storage blocked */ } });
    await this.site.goto(this.site.url());
    await siteReady(this.site);
    this.dirty = true;
  }

  async scrollTo(y, sec = 1.2, curve = ease) {
    const { y0, max } = await this.site.evaluate(() => ({ y0: window.scrollY, max: document.documentElement.scrollHeight - window.innerHeight }));
    const y1 = Math.max(0, Math.min(max, y));
    if (Math.abs(y1 - y0) < 1) return;
    await this.animate(sec, async p => {
      await this.site.evaluate(v => window.scrollTo({ top: v, behavior: "instant" }), y0 + (y1 - y0) * curve(p));
    });
  }
  /* Scroll so an element sits at `place` (0 = top, 0.5 = middle) of the window. */
  async reveal(spec, { sec = 1.2, place = 0.5, margin = 24 } = {}) {
    const b = await this.box(spec);
    const top = b.scrollY + b.y;
    const y = place === 0 ? top - margin : top - (b.vh - b.h) * place;
    await this.scrollTo(y, sec);
  }
  async scrollBy(dy, sec, curve = sine) { await this.scrollTo(await this.site.evaluate(() => window.scrollY) + dy, sec, curve); }
  async scrollToEnd(sec, curve = sine) { await this.scrollTo(1e6, sec, curve); }
}

async function siteReady(frame) {
  await frame.waitForFunction(() => document.getElementById("root")?.children.length > 0);
  await frame.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.complete ? null : new Promise(ok => { i.onload = i.onerror = ok; })));
  });
}

/* ---------- run ---------- */

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: scenario.lang || "fr-FR" });

await context.addInitScript(PICK);
for (const [pattern, file] of VENDOR) {
  await context.route(pattern, route => route.fulfill({ contentType: "text/javascript", body: readFileSync(join(ROOT, file)) }));
}
if (scenario.tailwindCdn) {
  console.log("Compiling Tailwind for " + scenario.tailwindCdn + " ...");
  const shim = tailwindShim(scenario.tailwindCdn);
  await context.route(/^https:\/\/cdn\.tailwindcss\.com/, route => route.fulfill({ contentType: "text/javascript", body: shim }));
}

const page = await context.newPage();
page.on("pageerror", e => console.error("\n[page error]", e.message));
await page.goto(`${base}/build/video/stage.html`, { waitUntil: "load" });
await page.evaluate(cfg => stage.init(cfg), { lang: scenario.lang, url: scenario.windowUrl, panel: scenario.panel, cards: scenario.cards });
await page.evaluate(src => new Promise(ok => {
  const f = document.getElementById("site");
  f.addEventListener("load", ok, { once: true });
  f.src = src;
}), base + scenario.url);
const site = page.frame({ name: "site" });
await siteReady(site);
await page.evaluate(async () => {
  await document.fonts.ready;
  await Promise.all([...document.images].map(i => i.complete ? null : new Promise(ok => { i.onload = i.onerror = ok; })));
});
await page.mouse.move(200, 600);

mkdirSync(dirname(OUT), { recursive: true });
const ffmpeg = spawn("ffmpeg", [
  "-y", "-loglevel", "error",
  "-f", "image2pipe", "-c:v", "png", "-framerate", String(FPS), "-i", "pipe:0",
  "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
  "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-profile:v", "high", "-level:v", "4.1",
  "-g", String(FPS * 2), "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709",
  "-movflags", "+faststart", "-an", OUT,
], { stdio: ["pipe", "inherit", "inherit"] });
const encoded = new Promise((ok, ko) => ffmpeg.on("close", c => (c === 0 ? ok() : ko(new Error("ffmpeg exited with " + c)))));

console.log(`Recording "${name}" at ${FPS} fps -> ${relative(ROOT, OUT)}`);
const rec = new Recorder(page, site, ffmpeg);
try {
  await scenario.run(rec);
} finally {
  ffmpeg.stdin.end();
  await encoded;
  await browser.close();
  server.close();
}
const mb = (statSync(OUT).size / 1048576).toFixed(1);
console.log(`\nDone: ${relative(ROOT, OUT)} - ${(rec.frames / FPS).toFixed(1)} s, 1920x1080, ${mb} MB`);
