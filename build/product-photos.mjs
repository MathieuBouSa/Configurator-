/* ============================================================
   SALUS Configurator BETA - product photo pipeline
   ------------------------------------------------------------
   Conforms raw product photos to the spec in VISUALS.md section 1:
   800 x 800 PNG, ratio 1:1, <= 200 KB, product centred on a white
   or transparent background.

   Drop the raw downloads (any size, JPEG / PNG / WebP / HEIC) into
   build/photos-in/ naming each file after its product reference -
   "UG800.jpg", "sq610-rf.png", "TRV3RF AB.webp" all match - then:

       npm install --no-save sharp
       node build/product-photos.mjs

   Options
       --check          audit assets/products/ against the spec, write nothing
       --in <dir>       source folder (default build/photos-in)
       --transparent    keep the alpha channel instead of flattening on white
       --margin <pct>   breathing space around the product (default 4)
       --force          overwrite a target even if it already looks conformant

   Target filenames are read from js/data/catalog.js, so the catalogue
   stays the single source of truth: add a product there and its photo
   slot appears here.
   ============================================================ */

import { readFileSync, readdirSync, writeFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { join, dirname, extname, basename, isAbsolute, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = join(ROOT, "assets", "products");
const SIZE = 800;
const MAX_BYTES = 200 * 1024;

/* ---------- arguments ---------- */

const argv = process.argv.slice(2);
const flag = (n) => argv.includes(`--${n}`);
const opt = (n, d) => { const i = argv.indexOf(`--${n}`); return i >= 0 && argv[i + 1] ? argv[i + 1] : d; };

const CHECK_ONLY = flag("check");
const TRANSPARENT = flag("transparent");
const FORCE = flag("force");
const MARGIN = Math.max(0, Math.min(20, Number(opt("margin", 4))));
const inArg = opt("in", join("build", "photos-in"));
const IN_DIR = isAbsolute(inArg) ? inArg : join(ROOT, inArg);
const shortPath = (p) => (p.startsWith(ROOT) ? relative(ROOT, p) : p);

/* ---------- sharp is a build-time-only dependency ---------- */

let sharp;
if (!CHECK_ONLY) {
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.error(
      "This script needs sharp, which is not installed.\n\n" +
      "    npm install --no-save sharp\n\n" +
      "Nothing ships to the browser: sharp is only used here, at build time.\n" +
      "Run with --check to audit the existing photos without it."
    );
    process.exit(1);
  }
}

/* ---------- 1. the photo slots the catalogue expects ---------- */

function expectedStems() {
  const code = readFileSync(join(ROOT, "js", "data", "catalog.js"), "utf8");
  const stems = new Set();
  for (const m of code.matchAll(/img:\s*"assets\/products\/([a-z0-9-]+)\.png"/g)) stems.add(m[1]);
  return [...stems].sort();
}

/* "SQ610 RF.jpg" / "sq610_rf.png" / "sq610rf" all collapse to "sq610rf" */
const key = (s) => basename(s, extname(s)).toLowerCase().replace(/[^a-z0-9]/g, "");

/* ---------- 2. audit mode ---------- */

function audit(stems) {
  const rows = [];
  for (const stem of stems) {
    const p = join(OUT_DIR, `${stem}.png`);
    if (!existsSync(p)) { rows.push({ stem, state: "MISSING" }); continue; }
    const buf = readFileSync(p);
    /* PNG header: width and height are big-endian uint32 at bytes 16 and 20. */
    const png = buf.length > 24 && buf.readUInt32BE(1) === 0x504e470d;
    const w = png ? buf.readUInt32BE(16) : null;
    const h = png ? buf.readUInt32BE(20) : null;
    const problems = [];
    if (!png) problems.push("not a PNG");
    else {
      if (w !== SIZE || h !== SIZE) problems.push(`${w}x${h}, expected ${SIZE}x${SIZE}`);
      if (buf.length > MAX_BYTES) problems.push(`${(buf.length / 1024).toFixed(0)} KB > 200 KB`);
    }
    rows.push({ stem, state: problems.length ? problems.join("; ") : "ok", bytes: buf.length, w, h });
  }
  const ok = rows.filter(r => r.state === "ok").length;
  const missing = rows.filter(r => r.state === "MISSING").length;
  console.log(`\nassets/products - ${rows.length} slots from the catalogue\n`);
  for (const r of rows) {
    const mark = r.state === "ok" ? "  ok  " : r.state === "MISSING" ? " MISS " : " FIX  ";
    console.log(`${mark} ${r.stem.padEnd(12)} ${r.state === "ok" ? `${r.w}x${r.h}, ${(r.bytes / 1024).toFixed(0)} KB` : r.state}`);
  }
  console.log(`\n${ok} conformant / ${missing} missing / ${rows.length - ok - missing} to fix\n`);
  return rows;
}

/* ---------- 3. conform one photo ---------- */

async function conform(srcPath) {
  const img = sharp(srcPath, { failOn: "error" });
  const meta = await img.metadata();
  const warnings = [];
  if (Math.max(meta.width || 0, meta.height || 0) < SIZE) {
    warnings.push(`source is only ${meta.width}x${meta.height} - upscaled, will look soft`);
  }

  /* Trim a uniform border so the product fills the frame predictably,
     then pad back to a square with the requested margin. A photo with
     no uniform border simply comes back unchanged. */
  let pipeline = sharp(srcPath, { failOn: "error" });
  try {
    pipeline = pipeline.trim({ threshold: 12 });
    await pipeline.clone().toBuffer();
  } catch {
    warnings.push("nothing to trim (no uniform border)");
    pipeline = sharp(srcPath, { failOn: "error" });
  }

  const inner = Math.round(SIZE * (1 - MARGIN / 100 * 2));
  const background = TRANSPARENT ? { r: 0, g: 0, b: 0, alpha: 0 } : { r: 255, g: 255, b: 255, alpha: 1 };

  pipeline = pipeline
    .resize(inner, inner, { fit: "contain", background, withoutEnlargement: false })
    .extend({
      top: Math.floor((SIZE - inner) / 2), bottom: Math.ceil((SIZE - inner) / 2),
      left: Math.floor((SIZE - inner) / 2), right: Math.ceil((SIZE - inner) / 2),
      background
    });

  if (!TRANSPARENT) pipeline = pipeline.flatten({ background });

  /* Encode, then step the compression down until the 200 KB budget is met.
     Palette quantisation is plenty for a cut-out product shot. */
  const attempts = [
    { palette: false },
    { palette: true, colours: 256 },
    { palette: true, colours: 128 },
    { palette: true, colours: 64 },
    { palette: true, colours: 32 }
  ];
  let buf = null, used = null;
  for (const a of attempts) {
    const out = await pipeline.clone().png({
      compressionLevel: 9, palette: a.palette, colours: a.colours, effort: 10
    }).toBuffer();
    /* Quantising does not always shrink a photographic shot - keep the smallest. */
    if (!buf || out.length < buf.length) { buf = out; used = a; }
    if (out.length <= MAX_BYTES) { buf = out; used = a; break; }
  }
  const overBudget = buf.length > MAX_BYTES;
  if (overBudget) {
    warnings.push(
      `${(buf.length / 1024).toFixed(0)} KB - over the 200 KB budget even quantised. ` +
      `A busy or textured background is usually the cause: a cleaner cut-out on white will fit.`
    );
  } else if (used.palette) {
    warnings.push(`quantised to ${used.colours} colours to fit the 200 KB budget`);
  }
  return { buf, warnings, overBudget };
}

/* ---------- 4. run ---------- */

const stems = expectedStems();
if (!stems.length) {
  console.error("No product photo slot found in js/data/catalog.js.");
  process.exit(1);
}

if (CHECK_ONLY) {
  const rows = audit(stems);
  process.exit(rows.some(r => r.state !== "ok") ? 1 : 0);
}

if (!existsSync(IN_DIR)) {
  mkdirSync(IN_DIR, { recursive: true });
  console.error(
    `Created ${shortPath(IN_DIR)} - it is empty.\n\n` +
    `Drop the raw product photos in there, one per product, each named after its\n` +
    `reference. The ${stems.length} slots the catalogue is waiting for:\n\n  ` +
    stems.join("  ") + "\n"
  );
  process.exit(1);
}

const inputs = readdirSync(IN_DIR).filter(f => /\.(jpe?g|png|webp|avif|heic|heif|tiff?)$/i.test(f));
if (!inputs.length) {
  console.error(`No image found in ${shortPath(IN_DIR)}.`);
  process.exit(1);
}

const byKey = new Map(stems.map(s => [key(s), s]));
const done = [], skipped = [], unmatched = [];

for (const file of inputs) {
  const stem = byKey.get(key(file));
  if (!stem) { unmatched.push(file); continue; }
  const target = join(OUT_DIR, `${stem}.png`);
  if (!FORCE && existsSync(target)) {
    const buf = readFileSync(target);
    const conformant = buf.length > 24 && buf.readUInt32BE(16) === SIZE
      && buf.readUInt32BE(20) === SIZE && buf.length <= MAX_BYTES;
    /* The shipped placeholders are already 800x800, so only --force
       distinguishes "already a real photo" from "still a placeholder".
       Placeholders are replaced on the first run regardless. */
    if (conformant && FORCE) { skipped.push(stem); continue; }
  }
  const { buf, warnings, overBudget } = await conform(join(IN_DIR, file));
  writeFileSync(target, buf);
  done.push({ file, stem, kb: (buf.length / 1024).toFixed(0), warnings, overBudget });
}

console.log("");
for (const d of done) {
  console.log(`  ${d.file.padEnd(24)} -> assets/products/${d.stem}.png  ${SIZE}x${SIZE}, ${d.kb} KB`);
  for (const w of d.warnings) console.log(`      note: ${w}`);
}
if (skipped.length) console.log(`\n  left alone (already conformant, no --force): ${skipped.join(", ")}`);
if (unmatched.length) {
  console.log(`\n  no catalogue slot matches these files:\n      ${unmatched.join("\n      ")}`);
  console.log(`  rename them after a product reference. Slots still empty:`);
  const filled = new Set(done.map(d => d.stem));
  console.log(`      ${stems.filter(s => !filled.has(s)).join("  ")}`);
}
const over = done.filter(d => d.overBudget);
if (over.length) {
  console.log(`\n  OVER THE 200 KB BUDGET - reshoot or re-cut these: ${over.map(d => d.stem).join(", ")}`);
}
console.log(`\n${done.length} photo(s) written to assets/products/\n`);
process.exit(over.length ? 1 : 0);
