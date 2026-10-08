/* ============================================================
   SALUS Configurator - trade-show video recorder
   ------------------------------------------------------------
   Plays a scripted walkthrough of a site and records it as a
   looping 1920 x 1080 MP4 for a screen on a stand. No sound - a
   stand screen plays muted. Two layouts:
     - stage (the configurators): the page inside a browser window,
       next to a brand panel with the steps and a caption;
     - direct (an external site): the site full screen.
   Both get a visible cursor and intro / outro cards (overlay.js).

       npm install --no-save playwright
       node build/video/record.mjs r-system-site
       node build/video/record.mjs r-system
       node build/video/record.mjs configurator

   Scenarios live next to this file (build/video/<name>.mjs).
   Output goes to video/<name>-salon.mp4.

   Options
       --out <file>     output path (default video/<name>-salon.mp4)
       --url <url>      record another page with the same scenario
       --root <dir>     serve the site from this folder (a local checkout)
       --stills <dir>   also save one PNG per visit stop, to check the framing
       --clip <key>=<file>   a video file for one of the scenario's clips
                        (a thumbnail on the page that should play)
       --fps <n>        frames per second (default 30)
       --crf <n>        x264 quality, lower is better (default 18)

   Needs ffmpeg on the PATH, Playwright's Chromium, network access
   to an external site, and the npm registry once per run for the
   R-System configurator (its Tailwind CDN build is compiled
   locally, see tailwindShim below).

   How it stays smooth: the page is never filmed in real time.
   Every output frame is staged, then screenshotted. The script
   owns the clock: each frame it pauses every CSS animation and
   transition of the stage and the site and sets them to the
   frame's time, so a 0.35 s fade lasts exactly 0.35 s of video
   however slow the machine is; videos on the page are stepped the
   same way. A frame where nothing moves is not screenshotted
   again, only repeated.
   ============================================================ */

import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { join, dirname, extname, normalize, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath, pathToFileURL } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..");

/* ---------- arguments ---------- */

const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };
const name = argv.find(a => !a.startsWith("--") && !argv[argv.indexOf(a) - 1]?.startsWith("--"));
if (!name || !existsSync(join(HERE, `${name}.mjs`))) {
  console.error("Usage: node build/video/record.mjs <scenario> [--out file] [--url url] [--fps 30] [--crf 18]");
  process.exit(1);
}
const FPS = Number(opt("fps", 30));
const CRF = String(opt("crf", 18));
const OUT = join(ROOT, opt("out", `video/${name}-salon.mp4`));
const STILLS = opt("stills", null) && resolve(ROOT, opt("stills"));   // a PNG of every visit stop, to check the framing
/* --clip <key>=<file>, repeatable: the video files behind the scenario's clips. */
const CLIP_FILES = Object.fromEntries(argv.flatMap((a, i) => a === "--clip" && argv[i + 1] ? [argv[i + 1].split(/=(.*)/s).slice(0, 2)] : [])
  .map(([k, f]) => [k, resolve(process.cwd(), f)]));

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error("Playwright is missing: npm install --no-save playwright"); process.exit(1); }

const scenario = (await import(pathToFileURL(join(HERE, `${name}.mjs`)).href)).default;

/* ---------- local static server (the repository, as Netlify serves it) ----------
   --root serves another site (a local checkout of it); the stage itself
   always comes from this repository. */

const MIME = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8", ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg",
  ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2", ".pdf": "application/pdf",
};

const SITE_ROOT = resolve(ROOT, opt("root", "."));

function serve() {
  const srv = createServer((req, res) => {
    let p = decodeURIComponent(new URL(req.url, "http://local").pathname);
    if (p.endsWith("/")) p += "index.html";
    const root = p.startsWith("/build/video/") || p.startsWith("/assets/hero/") ? ROOT : SITE_ROOT;
    const file = normalize(join(root, p));
    if (relative(root, file).startsWith("..") || !existsSync(file) || statSync(file).isDirectory()) {
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

/* ---------- clips: a video playing where the page shows a thumbnail ----------
   A scenario lists clips { key, replace, start, length }: `replace` is the
   element holding the thumbnail, the file comes from --clip <key>=<file>.
   The excerpt is re-encoded for Chromium (VP9, every frame a keyframe so
   the clock can seek frame by frame), muted, served under /__clips/ and
   laid over the thumbnail; its play button and label are hidden. */

function prepareClip({ key, start = 0, length = 12 }) {
  const dir = mkdtempSync(join(tmpdir(), "salus-clip-"));
  try {
    const out = join(dir, "clip.webm");
    execFileSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(start), "-t", String(length), "-i", CLIP_FILES[key], "-an",
      "-vf", `fps=${FPS},scale=-2:'min(960,ih)'`, "-c:v", "libvpx-vp9", "-g", "1", "-crf", "33", "-b:v", "0",
      "-deadline", "good", "-cpu-used", "4", "-row-mt", "1", out]);
    return readFileSync(out);
  } finally { rmSync(dir, { recursive: true, force: true }); }
}

const LAY_CLIPS = (clips) => Promise.all(clips.map(c => new Promise(ok => {
  const host = document.querySelector(c.replace);
  if (!host) { ok(c.key + ": nothing matches " + c.replace); return; }
  const v = document.createElement("video");
  Object.assign(v, { muted: true, playsInline: true, preload: "auto", src: "/__clips/" + encodeURIComponent(c.key) + ".webm" });
  v.style.cssText = "position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:5;pointer-events:none";
  for (const k of host.children) if (k.tagName !== "IMG" && k.tagName !== "PICTURE") k.style.visibility = "hidden";
  if (getComputedStyle(host).position === "static") host.style.position = "relative";
  host.appendChild(v);
  v.addEventListener("loadeddata", () => ok(null), { once: true });
  v.addEventListener("error", () => ok(c.key + ": the clip does not play"), { once: true });
})));

/* Without its file, a clip's thumbnail still loses its play button and its
   label, and the picture drifts in a slow zoom: no dead button on a screen
   nobody can click. */
const STILL_CLIPS = (clips) => clips.map(c => {
  const host = document.querySelector(c.replace);
  if (!host) return c.key + ": nothing matches " + c.replace;
  for (const k of host.children) if (k.tagName !== "IMG" && k.tagName !== "PICTURE") k.style.visibility = "hidden";
  host.style.overflow = "hidden";
  host.dataset.videoFrame = "";
  const img = host.querySelector("img");
  if (img) img.animate([{ transform: "scale(1)" }, { transform: "scale(1.1)" }],
    { duration: 8000, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
  return null;
});

/* ---------- the clock ----------
   Runs inside the stage and inside the site. Every animation it has not
   seen yet is paused and stamped with the current video time; then each
   one is set to (now - stamp). Returns true while anything is moving
   (one extra frame, so the finished state is captured too). The
   overlay's shadow root is stepped too, and a <video> is paused and
   seeked the same way, looping, from the frame it first comes on screen. With `clock: true` the scenario also puts
   the page's JavaScript time (timers, requestAnimationFrame, Date) on
   the video clock, so a script-driven counter counts at the right speed. */

const SYNC_ANIMATIONS = async ([t, dt]) => {
  const seen = window.__videoClock || (window.__videoClock = new WeakMap());
  let moving = false;
  const animations = new Set(document.getAnimations());
  if (window.stage && window.stage.root) for (const a of window.stage.root.getAnimations()) animations.add(a);
  for (const a of animations) {
    let t0 = seen.get(a);
    if (t0 === undefined) { t0 = t; seen.set(a, t0); a.pause(); }
    const end = a.effect ? a.effect.getComputedTiming().endTime : 0;
    const local = Math.max(0, t - t0);
    a.currentTime = Math.min(local, end);
    if (local < end + dt) moving = true;
  }
  const seeks = [];
  for (const v of document.querySelectorAll("video")) {
    v.pause();
    const r = v.getBoundingClientRect();
    const onScreen = r.width > 0 && r.bottom > 0 && r.top < innerHeight;
    let t0 = seen.get(v);
    if (t0 === undefined) { if (!onScreen) continue; t0 = t; seen.set(v, t0); }   // starts when it comes on screen
    if (!(v.duration > 0)) continue;
    if (onScreen) moving = true;
    const at = ((t - t0) / 1000) % v.duration;
    if (Math.abs(v.currentTime - at) < 0.001) continue;
    v.currentTime = at;
    seeks.push(new Promise(ok => v.addEventListener("seeked", ok, { once: true })));
  }
  await Promise.all(seeks);                    // no timer here: the page's timers may be on the video clock
  if (window.__videoMutated) { window.__videoMutated = false; moving = true; }
  return moving;
};

/* Installed in every frame before any page script:
   - __pick finds an element of the site from a small spec: a CSS selector,
     then optionally the text it contains, the alt of an image inside it,
     and which match to take;
   - __videoMutated flags any DOM change, so a frame the page's own scripts
     changed (a counter, a scroll effect) is screenshotted again. */
const HELPERS = () => {
  window.__videoMutated = true;
  new MutationObserver(() => { window.__videoMutated = true; })
    .observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
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

/* Stops on headings: one per heading, one every ~0.9 window in long stretches. */
const HEADING_STOPS = ([css, place]) => {
  const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
  const heads = [...document.querySelectorAll(css)]
    .filter(e => e.getClientRects().length && getComputedStyle(e).visibility !== "hidden")
    .map(e => Math.round(e.getBoundingClientRect().top + scrollY - vh * place))
    .map(y => Math.max(0, Math.min(max, y)))
    .concat([0, max])
    .sort((a, b) => a - b);
  const out = [];
  for (const y of heads) {
    const last = out.length ? out[out.length - 1].y : null;
    if (last !== null && y - last < vh * 0.45) continue;
    if (last !== null) for (let k = last + vh * 0.9; k < y - vh * 0.45; k += vh * 0.9) out.push({ y: Math.round(k), head: false });
    out.push({ y, head: true });
  }
  return out;
};

/* Stops on sections. A section's content is the union of its text, media,
   controls and drawn boxes (bordered or filled, narrower than the section),
   its padding left out. Between two neighbours closer than a window, the
   window is centred on the gap, so both only show their padding. A section holding a sticky element is a scroll
   scene: one stop where the scene starts, one where it ends, the scroll in
   between showing it play; what follows the scene is planned on its own.
   The window is what the page's fixed header (and bottom bar) leave free. */
const SECTION_STOPS = ({ sections, header, bar, margin }) => {
  const vh = innerHeight, max = document.documentElement.scrollHeight - vh;
  const height = sel => { const e = sel && document.querySelector(sel); return e ? e.getBoundingClientRect().height : 0; };
  const H = height(header), W = vh - H - height(bar);
  const Y = r => ({ top: r.top + scrollY, bottom: r.bottom + scrollY });
  const LEAVES = "h1,h2,h3,h4,h5,h6,p,li,img,svg,video,iframe,canvas,button,a,figcaption,input,select,textarea,label,table,blockquote,dt,dd";
  const drawn = cs => (parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== "none")
    || (parseFloat(cs.borderBottomWidth) > 0 && cs.borderBottomStyle !== "none")
    || !/^(transparent|rgba\(0, 0, 0, 0\))$/.test(cs.backgroundColor) || cs.backgroundImage !== "none";
  /* content of a section between two page heights */
  const contentOf = (sec, from = -Infinity, to = Infinity) => {
    const sw = sec.getBoundingClientRect().width;
    let top = Infinity, bottom = -Infinity;
    for (const e of sec.querySelectorAll("*")) {
      const r = (e.closest("[data-video-frame]") || e).getBoundingClientRect();   // a zoomed still is measured by its frame
      if (!r.width || !r.height) continue;
      const a = Y(r);
      if (a.top < from || a.bottom > to) continue;
      const cs = getComputedStyle(e);
      const text = [...e.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (cs.visibility === "hidden" || !(text || e.matches(LEAVES) || (r.width < sw * 0.95 && drawn(cs)))) continue;
      top = Math.min(top, a.top); bottom = Math.max(bottom, a.bottom);
    }
    return top === Infinity ? null : { top, bottom };
  };
  const headsOf = (sec, from = -Infinity) => [...sec.querySelectorAll("h2, h3")]
    .filter(h => h.getClientRects().length).map(h => Y(h.getBoundingClientRect()).top).filter(t => t >= from).sort((a, b) => a - b);

  const blocks = [];
  for (const sec of document.querySelectorAll(sections)) {
    if (!sec.getClientRects().length) continue;
    const S = Y(sec.getBoundingClientRect());
    const sticky = [...sec.querySelectorAll("*")].find(e => getComputedStyle(e).position === "sticky");
    if (!sticky) { blocks.push({ C: contentOf(sec) || S, heads: headsOf(sec) }); continue; }
    const T = Y(sticky.parentElement.getBoundingClientRect());        // the track the scene plays along
    const pin = parseFloat(getComputedStyle(sticky).top) || 0, h = sticky.getBoundingClientRect().height;
    const before = contentOf(sec, -Infinity, T.top);
    blocks.push({ C: { top: before ? before.top : T.top, bottom: T.bottom }, scene: { start: T.top - pin, end: T.bottom - pin - h } });
    const after = contentOf(sec, T.bottom - 1);
    if (after) blocks.push({ C: after, heads: headsOf(sec, T.bottom - 1) });
  }

  const toY = ws => Math.round(Math.max(0, Math.min(max, ws - H)));   // window top -> scroll position
  const stops = [];
  let shown = null;                                                    // the window of the last stop
  /* need: the content a stop was placed for. A new stop close to the last one
     (under 0.2 window) that still shows all of it replaces it: no nudges. */
  const push = (y, head, slow, need) => {
    y = Math.round(Math.max(0, Math.min(max, y)));
    const last = stops[stops.length - 1];
    if (last && Math.abs(y - last.y) < 8) return;
    if (last && !slow && !last.slow && last.need && Math.abs(y - last.y) < W * 0.2
        && last.need.top >= y + H && last.need.bottom <= y + H + W) { stops.pop(); head = head || last.head; }
    stops.push({ y, head, slow: !!slow, need });
    shown = { top: y + H, bottom: y + H + W };
  };
  blocks.forEach(({ C, heads, scene }, i) => {
    if (scene) { push(scene.start, true); push(scene.end, false, true); return; }
    if (shown && C.top >= shown.top && C.bottom <= shown.bottom) return;   // already seen whole
    const lo = i > 0 ? blocks[i - 1].C.bottom : -Infinity;             // previous content stays out
    const hi = i < blocks.length - 1 ? blocks[i + 1].C.top : Infinity; // and so does the next one
    let top = C.top - margin, bottom = C.bottom + margin;
    if (bottom - top > W && C.bottom - C.top <= W) { top = C.top; bottom = C.bottom; }   // fits without the margin
    if (bottom - top <= W) {                                           // fits: centred, neighbours out
      const ws = hi - lo < W ? (lo + hi - W) / 2 : Math.max(Math.min(top - (W - (bottom - top)) / 2, hi - W), lo);
      push(toY(ws), true, false, C);
      return;
    }
    if (bottom - top - W < W * 0.12) { push(toY(Math.max(top, lo)), true); return; }   // a little too tall: one stop
    /* taller than the window: from its top, then down by at most 0.85 window,
       stopping earlier on a sub-heading the window would cut */
    const end = Math.min(bottom, hi);
    let ws = Math.max(top, lo), anchor = null;                         // anchor: the sub-heading the last stop is set on
    push(toY(ws), true);
    while (ws + W < end - 4) {
      let next = ws + W * 0.85, on = null;
      const cut = heads.find(t => t > ws + 40 && t + 140 > ws + W);
      // a sub-heading the window shows without its content: the next stop starts on it
      if (cut !== undefined && cut - margin > ws + W * 0.3 && cut - margin < ws + W) { next = cut - margin; on = cut; }
      next = Math.min(next, end - W);
      if (next <= ws + 8) break;
      if (next - ws < W * 0.2 && anchor !== null && next < anchor) {   // a last nudge that keeps the sub-heading in view:
        stops.pop();                                                   // the previous stop moves there instead
      }
      push(toY(next), false);
      ws = next; anchor = on;
    }
  });
  return stops;
};

const ease = p => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);   // cubic in-out
const sine = p => -(Math.cos(Math.PI * p) - 1) / 2;                            // gentler, for long scrolls

class Recorder {
  constructor(page, site, ffmpeg, mountOverlay) {
    Object.assign(this, { page, site, ffmpeg, mountOverlay });
    this.direct = site === page.mainFrame();
    this.shown = new Set(["intro"]);
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
    if (scenario.clock) await this.page.clock.runFor(Math.round(this.t + this.dt) - Math.round(this.t));
    const docs = this.direct ? [this.page] : [this.page, this.site];
    const moving = await Promise.all(docs.map(d => Promise.race([
      d.evaluate(SYNC_ANIMATIONS, [this.t, this.dt]),
      new Promise(ok => setTimeout(ok, 5000, true)),     // a video that never reports its seek
    ])));
    if (this.dirty || moving.includes(true) || !this.last) {
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
  card(id, on) {
    if (on) this.shown.add(id); else this.shown.delete(id);
    return this.stage(([id, on]) => stage.card(id, on), [id, on]);
  }

  /* ----- cursor ----- */
  async cursorOn(on) {
    if (on) await this.stage(([x, y]) => stage.cursor(x, y), [this.cx, this.cy]);
    await this.stage(on => stage.cursorOn(on), on);
    if (!on) await this.page.mouse.move(...PARK);       // park the real mouse where it hovers nothing
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
    if (this.direct) return { x: 0, y: 0 };
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
    await this.goto(this.site.url());
  }
  /* Another page of the site - behind a card. */
  async goto(url) {
    await this.site.goto(new URL(url, this.site.url()).href, { waitUntil: "load" });
    await siteReady(this.site);
    if (this.direct) await this.mountOverlay([...this.shown]);
    this.dirty = true;
  }
  /* The visit of a page, top to bottom. Two ways to place the stops:
     - sections (a selector): each stop frames the content of ONE section in
       the window left between the page's own fixed `header` and `bar`, and
       never shows the content of the next or previous one; a section too
       tall for the window gets several stops, from its top to its bottom,
       placed on its sub-headings; a scroll scene plays at `sceneSpeed`;
     - otherwise, headings (`css`): a stop on each, placed at `place` of the
       window, plus one every ~0.9 window in long stretches.
     The first stop of a section or a heading lasts `pause`, the others `pass`. */
  async tour({ css = "h1, h2", sections = null, header = null, bar = null, place = 0.18, margin = 28,
               pause = 2.2, pass = 1.4, speed = 380, sceneSpeed = 220, min = 1.2 } = {}) {
    const stops = sections
      ? await this.site.evaluate(SECTION_STOPS, { sections, header, bar, margin })
      : await this.site.evaluate(HEADING_STOPS, [css, place]);
    console.log(`\r  visit: ${stops.length} stops`);
    for (const [k, { y, head, slow }] of stops.entries()) {
      const y0 = await this.site.evaluate(() => window.scrollY);
      if (Math.abs(y - y0) >= 1) await this.scrollTo(y, Math.max(min, Math.abs(y - y0) / (slow ? sceneSpeed : speed)), sine);
      await this.wait(0.3);
      if (STILLS) writeFileSync(join(STILLS, `stop-${String(k + 1).padStart(2, "0")}.png`), this.last);
      await this.wait((head ? pause : pass) - 0.3);
    }
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

/* Off camera, before the clock stops: everything the page would load on the
   way down - lazy images, iframes armed on approach - is loaded now, without
   scrolling, so nothing scroll-triggered (a counter, a reveal) is spent. */
async function preload(frame) {
  await frame.evaluate(() => {
    document.querySelectorAll("img[loading=lazy]").forEach(i => { i.loading = "eager"; });
    document.querySelectorAll("iframe[data-src]:not([src])").forEach(f => { f.src = f.dataset.src; });
  });
  await frame.waitForFunction(() => [...document.images].every(i => i.complete)
    && [...document.querySelectorAll("iframe")].every(f => { try { return f.contentDocument.readyState === "complete"; } catch (e) { return true; } }),
    null, { polling: 100, timeout: 30000 });
  await frame.waitForTimeout(800);             // iframes report their height, the layout settles
}

async function siteReady(frame) {
  if (scenario.ready) await frame.waitForSelector(scenario.ready);
  await frame.evaluate(async () => {
    await document.fonts.ready;
    // a lazy image off screen never loads by itself: preload() takes care of those
    await Promise.all([...document.images].filter(i => i.loading !== "lazy")
      .map(i => i.complete ? null : new Promise(ok => { i.onload = i.onerror = ok; })));
  });
}

/* ---------- run ---------- */

const DIRECT = scenario.layout === "direct";
/* Where the real mouse rests when the cursor is hidden: on the panel, or on the page's right edge. */
const PARK = DIRECT ? [1279, 360] : [200, 600];
/* The cards' look: SALUS logo and configurator style unless the scenario sets its own (see overlay.js). */
const LOOK = {
  logo: "data:image/png;base64," + readFileSync(join(ROOT, "assets/hero/logo-salus.png")).toString("base64"),
  invertLogo: !(scenario.look && scenario.look.logo),      // the SALUS logo is navy: white on the cards
  ...scenario.look,
};
const OVERLAY = readFileSync(join(HERE, "overlay.js"), "utf8");

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const siteUrl = new URL(opt("url", scenario.url), base + "/").href;
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5, locale: scenario.lang || "fr-FR",
  bypassCSP: DIRECT,                              // the overlay's own styles and fonts, on someone else's page
});

await context.addInitScript(HELPERS);
if (scenario.beforeLoad) await context.addInitScript(scenario.beforeLoad);
if (scenario.clock) await context.clock.install();
for (const [pattern, file] of VENDOR) {
  await context.route(pattern, route => route.fulfill({ contentType: "text/javascript", body: readFileSync(join(ROOT, file)) }));
}
const CLIPS = (scenario.clips || []).filter(c => CLIP_FILES[c.key]);
const STILLS_ONLY = (scenario.clips || []).filter(c => !CLIP_FILES[c.key]);
for (const c of STILLS_ONLY) console.log(`clip ${c.key}: no file given (--clip ${c.key}=<file>), the thumbnail stays, in a slow zoom`);
if (CLIPS.length) {
  const data = {};
  for (const c of CLIPS) { console.log(`Preparing clip ${c.key} ...`); data[c.key] = prepareClip(c); }
  await context.route(/\/__clips\//, route => {
    const body = data[decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop()).replace(/\.webm$/, "")];
    if (!body) return route.fulfill({ status: 404 });
    const m = /bytes=(\d+)-(\d*)/.exec(route.request().headers().range || "");
    if (!m) return route.fulfill({ status: 200, contentType: "video/webm", headers: { "accept-ranges": "bytes" }, body });
    const a = +m[1], b = m[2] ? Math.min(+m[2], body.length - 1) : body.length - 1;
    return route.fulfill({ status: 206, contentType: "video/webm", body: body.subarray(a, b + 1),
      headers: { "accept-ranges": "bytes", "content-range": `bytes ${a}-${b}/${body.length}` } });
  });
}
if (scenario.tailwindCdn) {
  console.log("Compiling Tailwind for " + scenario.tailwindCdn + " ...");
  const shim = tailwindShim(scenario.tailwindCdn);
  await context.route(/^https:\/\/cdn\.tailwindcss\.com/, route => route.fulfill({ contentType: "text/javascript", body: shim }));
}

const page = await context.newPage();
page.on("pageerror", e => console.error("\n[page error]", e.message));
let site;
/* Direct layout: the overlay goes straight into the site's page, scrollbar hidden. */
const mountOverlay = async (shown) => {
  await page.evaluate(OVERLAY);
  await page.addStyleTag({ content: "html{scrollbar-width:none}::-webkit-scrollbar{display:none}" + (scenario.css || "") });
  await page.evaluate(([cards, look, shown]) => { stage.cards(cards, look, shown); return stage.ready; }, [scenario.cards, LOOK, shown]);
};

if (DIRECT) {
  await page.goto(siteUrl, { waitUntil: "load" });
  site = page.mainFrame();
  await siteReady(site);
  if (scenario.preload) await preload(site);
  if (CLIPS.length) for (const problem of await site.evaluate(LAY_CLIPS, CLIPS)) if (problem) console.log("clip " + problem);
  if (STILLS_ONLY.length) for (const problem of await site.evaluate(STILL_CLIPS, STILLS_ONLY)) if (problem) console.log("clip " + problem);
  await mountOverlay(["intro"]);
} else {
  await page.goto(`${base}/build/video/stage.html`, { waitUntil: "load" });
  await page.evaluate(cfg => stage.init(cfg), { lang: scenario.lang, url: scenario.windowUrl, panel: scenario.panel, cards: scenario.cards, look: LOOK });
  await page.evaluate(src => new Promise(ok => {
    const f = document.getElementById("site");
    f.addEventListener("load", ok, { once: true });
    f.src = src;
  }), siteUrl);
  site = page.frame({ name: "site" });
  await siteReady(site);
  await page.evaluate(async () => {
    await stage.ready;
    await document.fonts.ready;
    // a lazy image off screen never loads by itself: preload() takes care of those
    await Promise.all([...document.images].filter(i => i.loading !== "lazy")
      .map(i => i.complete ? null : new Promise(ok => { i.onload = i.onerror = ok; })));
  });
}
await page.mouse.move(...PARK);
if (scenario.clock) await page.clock.pauseAt(await page.evaluate(() => Date.now()) + 100);

mkdirSync(dirname(OUT), { recursive: true });
if (STILLS) mkdirSync(STILLS, { recursive: true });
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
const rec = new Recorder(page, site, ffmpeg, mountOverlay);
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
