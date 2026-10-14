/* ============================================================
   R-System stand film - renderer
   ------------------------------------------------------------
   Films build/video/motion/index.html frame by frame into a silent
   1920 x 1080 loop: each frame, seek(t) sets every animation, counter
   and film frame to second t, then the page is screenshotted.

       node build/video/motion/render.mjs              -> video/r-system-film-salon.mp4
       node build/video/motion/render.mjs --lang en    -> video/r-system-film-salon-en.mp4

   Options
       --lang <fr|en|de>   language of the texts (texts.js)
       --out <file>        output path
       --landing <dir>     checkout of rsystem-landing, for the photos and
                           the font (default ../rsystem-landing)
       --films <dir>       the three source films (default
                           ../r-system-motion-design/assets/films)
       --from <s> --to <s> render only part of the film
       --stills <s,s,...>  only save PNGs at these seconds, to check a frame
       --fps <n>  --crf <n>

   The films are the masters of r-system-motion-design: their frames are
   extracted (720 x 1080, the panel's size) into a temporary folder.
   Needs ffmpeg and Playwright's Chromium.
   ============================================================ */

import { createRequire } from "node:module";
import { spawn, execFileSync } from "node:child_process";
import { createServer } from "node:http";
import { readFileSync, existsSync, statSync, mkdirSync, mkdtempSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { join, dirname, extname, normalize, relative, resolve } from "node:path";
import { tmpdir } from "node:os";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, "..", "..", "..");
const argv = process.argv.slice(2);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const LANG = opt("lang", "fr");
const FPS = Number(opt("fps", 30));
const CRF = String(opt("crf", 18));
const LANDING = resolve(ROOT, opt("landing", "../rsystem-landing"));
const FILMS = resolve(ROOT, opt("films", "../r-system-motion-design/assets/films"));
const OUT = resolve(ROOT, opt("out", `video/r-system-film-salon${LANG === "fr" ? "" : "-" + LANG}.mp4`));
const STILLS = opt("stills", null);

/* The three films: which part plays, and where the 720 x 1080 panel is cut
   from the 1080 x 1920 frame scaled to 720 x 1280 (y offset). */
const CLIPS = {
  pose:  { file: "pose-chantier.mov",  from: 0, length: 11.4, y: 100 },
  usine: { file: "usine-bordeaux.mov", from: 0, length: 14.05, y: 100 },
  appli: { file: "application.mov",    from: 0, length: 13.7, y: 110 },   // the film's last shot, an installer's van, is left out
};

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require("playwright")); }
catch { console.error("Playwright is missing: npm install --no-save playwright"); process.exit(1); }
for (const p of [LANDING, FILMS]) if (!existsSync(p)) { console.error("Missing: " + p); process.exit(1); }

/* ---------- film frames ---------- */
const TMP = mkdtempSync(join(tmpdir(), "salus-film-"));
const CLIP_FRAMES = {};
for (const [key, c] of Object.entries(CLIPS)) {
  const dir = join(TMP, key);
  mkdirSync(dir);
  console.log(`Extracting ${c.file} ...`);
  execFileSync("ffmpeg", ["-v", "error", "-ss", String(c.from), "-t", String(c.length), "-i", join(FILMS, c.file), "-an",
    "-vf", `fps=${FPS},scale=720:1280:flags=lanczos,crop=720:1080:0:${c.y}`, "-q:v", "2", join(dir, "%04d.jpg")]);
  CLIP_FRAMES[key] = { base: `/clips/${key}/`, count: readdirSync(dir).length };
}

/* ---------- server: the film page, the landing's assets, the frames ---------- */
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".png": "image/png",
  ".jpg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".woff2": "font/woff2" };
const server = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, "http://local").pathname);
  if (p === "/") p = "/index.html";
  const [root, rest] = p.startsWith("/site/") ? [LANDING, p.slice(5)] : p.startsWith("/clips/") ? [TMP, p.slice(6)] : [HERE, p];
  const file = normalize(join(root, rest));
  if (relative(root, file).startsWith("..") || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { "content-type": MIME[extname(file).toLowerCase()] || "application/octet-stream" });
  res.end(readFileSync(file));
});
await new Promise(ok => server.listen(0, "127.0.0.1", ok));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
page.on("pageerror", e => console.error("[page error]", e.message));
page.on("requestfailed", r => console.error("[missing]", r.url()));
page.on("response", r => { if (r.status() >= 400) console.error("[missing]", r.url()); });
await page.addInitScript(f => { window.CLIP_FRAMES = f; }, CLIP_FRAMES);
await page.goto(`${base}/index.html?lang=${LANG}`, { waitUntil: "load" });
await page.evaluate(async () => {
  await Promise.all(["300", "800"].map(w => document.fonts.load(`${w} 40px "Open Sans"`)));
  await document.fonts.ready;
  await Promise.all([...document.images].filter(i => i.getAttribute("src")).map(i => i.decode().catch(() => {})));
});
const TOTAL = await page.evaluate(() => window.FILM.total);

try {
  if (STILLS) {
    mkdirSync(dirname(OUT), { recursive: true });
    for (const s of STILLS.split(",").map(Number)) {
      await page.evaluate(t => window.seek(t), s);
      const f = OUT.replace(/\.mp4$/, "") + `-t${String(s).padStart(5, "0")}.png`;
      writeFileSync(f, await page.screenshot());
      console.log(relative(process.cwd(), f));
    }
  } else {
    const from = Number(opt("from", 0)), to = Math.min(TOTAL, Number(opt("to", TOTAL)));
    mkdirSync(dirname(OUT), { recursive: true });
    const ffmpeg = spawn("ffmpeg", ["-y", "-loglevel", "error", "-f", "image2pipe", "-c:v", "png", "-framerate", String(FPS), "-i", "pipe:0",
      "-vf", "scale=out_color_matrix=bt709:out_range=tv,format=yuv420p",
      "-c:v", "libx264", "-preset", "slow", "-crf", CRF, "-profile:v", "high", "-level:v", "4.1", "-g", String(FPS * 2),
      "-color_primaries", "bt709", "-color_trc", "bt709", "-colorspace", "bt709", "-movflags", "+faststart", "-an", OUT],
      { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((ok, ko) => ffmpeg.on("close", c => (c === 0 ? ok() : ko(new Error("ffmpeg exited with " + c)))));
    const n = Math.round((to - from) * FPS);
    for (let i = 0; i < n; i++) {
      await page.evaluate(t => window.seek(t), from + i / FPS);
      const png = await page.screenshot();
      if (!ffmpeg.stdin.write(png)) await new Promise(ok => ffmpeg.stdin.once("drain", ok));
      if (i % FPS === 0) process.stdout.write(`\r  ${(i / FPS).toFixed(0).padStart(3)} / ${(n / FPS).toFixed(0)} s`);
    }
    ffmpeg.stdin.end();
    await done;
    console.log(`\nDone: ${relative(ROOT, OUT)} - ${(n / FPS).toFixed(1)} s, ${(statSync(OUT).size / 1048576).toFixed(1)} MB`);
  }
} finally {
  await browser.close();
  server.close();
  rmSync(TMP, { recursive: true, force: true });
}
