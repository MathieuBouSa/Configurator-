/* ============================================================
   SALUS Configurator BETA - Iconify icon bundler
   ------------------------------------------------------------
   Scans js/ for icon references written "<prefix>:<name>",
   pulls the matching icon sets from npm (@iconify-json/<prefix>)
   and writes vendor/icons.js with ONLY the icons in use.

   Run it only when icon references change:
       node build/icons.mjs

   Needs network (npm registry) for that one run; vendor/icons.js
   is committed, so the demo itself stays fully offline.

   Iconify icon sets are open source - MDI is Apache-2.0.
   ============================================================ */

import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC_DIRS = [join(ROOT, "js"), join(ROOT, "js", "data")];
const OUT = join(ROOT, "vendor", "icons.js");

/* Prefixes we accept - keeps a stray "http:" or "mailto:" out of the scan. */
const ALLOWED_PREFIXES = ["mdi"];

/* ---------- 1. collect the icon names used in the sources ---------- */

function usedIcons() {
  const re = new RegExp(`["'](${ALLOWED_PREFIXES.join("|")}):([a-z0-9]+(?:-[a-z0-9]+)*)["']`, "g");
  const found = new Set();
  for (const dir of SRC_DIRS) {
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".js")) continue;
      const code = readFileSync(join(dir, f), "utf8");
      for (const m of code.matchAll(re)) found.add(`${m[1]}:${m[2]}`);
    }
  }
  return [...found].sort();
}

/* ---------- 2. fetch the icon sets from npm ---------- */

function fetchSet(prefix) {
  const dir = mkdtempSync(join(tmpdir(), `iconify-${prefix}-`));
  try {
    const out = execFileSync("npm", ["pack", `@iconify-json/${prefix}`, "--silent", "--pack-destination", dir], {
      encoding: "utf8", stdio: ["ignore", "pipe", "pipe"]
    });
    const tgz = out.trim().split("\n").pop().trim();
    execFileSync("tar", ["xzf", join(dir, tgz), "-C", dir, "--strip-components=1", "package/icons.json"]);
    return JSON.parse(readFileSync(join(dir, "icons.json"), "utf8"));
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

/* ---------- 3. resolve one icon (following alias chains) ---------- */

function resolve(set, name) {
  const chain = [];
  let cur = name;
  /* Aliases can point at other aliases; 12 hops is far more than MDI ever needs. */
  for (let i = 0; i < 12; i++) {
    if (set.icons[cur]) {
      const ico = set.icons[cur];
      let body = ico.body;
      const w = ico.width || set.width || 24;
      const h = ico.height || set.height || 24;
      /* Apply the transforms picked up along the alias chain, innermost first. */
      for (const t of chain.reverse()) {
        const parts = [];
        if (t.hFlip) parts.push(`translate(${w} 0) scale(-1 1)`);
        if (t.vFlip) parts.push(`translate(0 ${h}) scale(1 -1)`);
        const r = ((t.rotate || 0) % 4 + 4) % 4;
        if (r) {
          if (w !== h) throw new Error(`rotated alias on a non-square icon (${name}) is not supported`);
          parts.push([`translate(${h} 0) rotate(90)`, `translate(${w} ${h}) rotate(180)`, `translate(0 ${w}) rotate(270)`][r - 1]);
        }
        if (parts.length) body = `<g transform="${parts.join(" ")}">${body}</g>`;
      }
      return { body, vb: `${ico.left || 0} ${ico.top || 0} ${w} ${h}` };
    }
    const alias = (set.aliases || {})[cur];
    if (!alias) return null;
    if (alias.rotate || alias.hFlip || alias.vFlip) {
      chain.push({ rotate: alias.rotate, hFlip: alias.hFlip, vFlip: alias.vFlip });
    }
    cur = alias.parent;
  }
  throw new Error(`alias chain too deep for ${name}`);
}

/* ---------- 4. build ---------- */

const names = usedIcons();
if (!names.length) {
  console.error("No icon reference found in js/ - nothing to build.");
  process.exit(1);
}

const byPrefix = new Map();
for (const full of names) {
  const [prefix, name] = full.split(":");
  if (!byPrefix.has(prefix)) byPrefix.set(prefix, []);
  byPrefix.get(prefix).push(name);
}

const bundle = {};
const missing = [];
for (const [prefix, list] of byPrefix) {
  process.stderr.write(`Fetching @iconify-json/${prefix}...\n`);
  const set = fetchSet(prefix);
  for (const name of list) {
    const ico = resolve(set, name);
    if (!ico) { missing.push(`${prefix}:${name}`); continue; }
    bundle[`${prefix}:${name}`] = ico;
  }
}

if (missing.length) {
  console.error(`\nUnknown icon name(s):\n  ${missing.join("\n  ")}\n`);
  process.exit(1);
}

const lines = Object.keys(bundle).sort().map(k =>
  `  ${JSON.stringify(k)}: { vb: ${JSON.stringify(bundle[k].vb)}, body: ${JSON.stringify(bundle[k].body)} }`
);

writeFileSync(OUT, `/* ============================================================
   SALUS Configurator BETA - icon bundle (GENERATED FILE)
   ------------------------------------------------------------
   Do not edit by hand. Regenerate with:  node build/icons.mjs
   Source: Iconify icon sets (${[...byPrefix.keys()].join(", ")}) - Apache-2.0.
   ${lines.length} icons, bundled so the demo runs offline.
   ============================================================ */

globalThis.SALUS_ICONS = {
${lines.join(",\n")}
};
`);

const kb = (readFileSync(OUT).length / 1024).toFixed(1);
process.stderr.write(`\nvendor/icons.js - ${lines.length} icons, ${kb} KB\n`);
