/* German, for the trade-show video only. The landing and its configurator
   exist in French and English; the German video is recorded from the
   English landing and the configurator, translated as they are served.
   Nothing here is published: these texts have not been reviewed by a
   German speaker, see README.

   landing.json   every text of the English landing (en/index.html), one
                  text node each, English -> German
   configurateur.js   the configurator's German text table, inserted into
                  its TEXTES next to "fr" and "en" */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));

export const landing = JSON.parse(readFileSync(join(HERE, "landing.json"), "utf8"));

/* The configurator's extra text tables: German here, Spanish in ../es/. */
const TABLE = ["configurateur.js", "../es/configurateur.js"].map(f => readFileSync(join(HERE, f), "utf8").trimEnd()).join("\n");
const PICK_EN = '.toLowerCase() === "en" ? "en" : "fr"';
const PICK_ANY = '.toLowerCase().replace(/^(?!(?:en|de|es)$).*$/, "fr")';

/* configurateur/index.html, served with ?lang=de and ?lang=es understood.
   Throws if the page changed shape, rather than recording a French
   configurator. */
export function configurateur(html) {
  const end = html.indexOf("\n};\n\n/* Un identifiant de langue");
  if (end < 0 || !html.includes(PICK_EN)) throw new Error("de: configurateur/index.html changed, update build/video/de/index.mjs");
  return (html.slice(0, end) + "\n" + TABLE + html.slice(end)).replace(PICK_EN, PICK_ANY);
}
