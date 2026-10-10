# Salus Configurator - BETA

A working mock-up of the unified Salus Controls configurator, built for an **internal demonstration**.
This is **not a production tool**: its only purpose is to make the concept tangible - to show how the
configurator would work, what it would produce, and what it could be worth to Salus.

One journey only: **My home -> My heating -> My habits -> My solution.**
Every feature traces back to the Problems / Solutions workshop - see [WORKSHOP-MAPPING.md](WORKSHOP-MAPPING.md)
and the "About" page inside the tool.

**Explaining it to someone else:** [how-it-works.html](how-it-works.html) is a standalone walkthrough -
five diagrams (the engine's needs-to-products seam, the three-state compatibility check, the journey with
its human takeover, the outputs of one configuration, the CRM loop) plus the 26 problems grouped by the
part of the mechanism that answers them, each tagged live / test content / simulated / placeholder.
Open the file directly, or reach it on the deployed site at `/how-it-works.html`.

**Presenting it (20 minutes):** [presentation.html](presentation.html) is a self-contained slide deck for the
internal presentation - where the 26 problems come from, the five groups that answer them, what is real in the
build, and what we need next. Arrow keys to move, `N` for speaker notes, `O` for all slides, and a 20-minute
timer in the footer. Each group slide carries its own live-demo cue, so the deck and the tool alternate.
The same deck is also committed as `Salus-Configurator-presentation.pptx`, for anyone who would rather
project from PowerPoint - speaker notes included.

**On a stand screen:** [video/r-system-salon-complet.mp4](video/r-system-salon-complet.mp4) is a silent 1920 x 1080
loop of about 2 min 45: first the public R-System site, https://r-system-by-salus.com/ (repository
`MathieuBouSa/rsystem-landing`), the installer landing full screen, scrolled top to bottom with a pause on each
section between an intro and an outro card in the site's own look; then, through a navy fade, the R-System
configurator filled in step by step. It ends on its first frame, so a screen set to repeat plays it with no visible
cut. Copy the MP4 to a USB stick for the TV's media player (H.264, plays on any screen), or open it full screen in a
browser. [video/r-system-site-salon.mp4](video/r-system-site-salon.mp4) is the site part alone (1 min 48).
The parts are recorded by `build/video/record.mjs` (`npm install --no-save playwright`, ffmpeg, a few minutes each):
`node build/video/record.mjs r-system-site` films the live site,
`node build/video/record.mjs r-system-site --root ../rsystem-landing --url /` films a local checkout of the landing
repository next to this one, offline, and `node build/video/record.mjs r-system` films the configurator. The site
visit follows the page's sections, so re-recording picks up any change of content. The site's two films show their
thumbnail in a slow zoom, without the play button; given the video files (`--clip presentation=<file>`,
`--clip usine=<file>`), an excerpt of each plays in its place instead. `node build/video/join.mjs <out> <site> <configurator>`
then joins the parts into one loop. A third scenario walks through the original configurator (`configurator`).

**In English and German:** [video/r-system-salon-complet-en.mp4](video/r-system-salon-complet-en.mp4) and
[video/r-system-salon-complet-de.mp4](video/r-system-salon-complet-de.mp4) are the same loop with the English landing
(`en/`) and the site's own configurator (`configurateur/?lang=en`), recorded with `--lang en`
(`r-system-site --root ../rsystem-landing --url /en/`, then `r-system-configurateur`). The site has no German
version: `--lang de` serves the English landing translated text by text, and the configurator with a German text
table added, as they are served, from `build/video/de/`. Nothing there is published, and the German texts have not
been reviewed by a German speaker yet: have them read before the video goes on a stand. The German outro points to
`r-system-by-salus.com/en`.

**The stand film:** [video/r-system-film-salon.mp4](video/r-system-film-salon.mp4) is a 2-minute motion design loop
for a stand screen, built from the landing's messages and photos, in the landing's order, and three films shot on
site (installation, the Bordeaux factory, the app). One idea per scene, large type, the films in full-height panels.
It is a page, `build/video/motion/index.html`, filmed frame by frame by `build/video/motion/render.mjs`
(`--lang fr|en|de`, texts in `texts.js`). The photos come from a checkout of `rsystem-landing` next to this one, the
films from `r-system-motion-design/assets/films/`, where they are versioned as masters. Open the page through the
renderer's server, or scrub it with `?t=<seconds>`.

**Live demo:** https://configurator-salus-test.netlify.app/
(Netlify auto-deploys `main`; every pull request gets a deploy preview at
`deploy-preview-<n>--configurator-salus-test.netlify.app`.)

> Interface language: **English**. The original French build is preserved in git history at commit `e2b2935`.

## Simulated vs real - in black and white

| Item | In this BETA | In production |
|---|---|---|
| **Prices** | **Fictional**, generated for the demo. Every price on screen carries a "fictional price / beta" label. | Recommended retail prices from the ERP / official price list. |
| **Product references** | **Real** (UG800, TRV3RF, SQ610..., RT520, WQ610, iT700, iT800 WiFi, CB12RF, CB500CO, RX30RF, RE600, SR600, RS600, SW600, MS610, RSQ800WRF). Those marked "ref. to confirm" (TRV3RF-AB, T30NC, THB) still need validating. | Full catalogue maintained, with availability per country. |
| **Compatibility rules** | Limited to the BETA catalogue (3 states: compatible / greyed with the reason / with a limitation; completeness checked). | Full matrix: protocol, power supply, role, quantities, firmware, country availability. |
| **Documents** (sheets, installation guide, quote, pack) | **Placeholder documents** generated dynamically as PDFs from the configuration: real structure, fictional content, "TEST DOCUMENT" watermark. | Documentation matrix fed by the real manuals, wiring diagrams and videos (a single owner of the file, a mandatory field whenever a product code is created). |
| **Zoho CRM** | **No connection.** The "CRM backstage" panel shows the exact JSON payloads (Leads / Quotes / Deals), the target service, the records created, the notifications and what follows for the sales rep and the installer. Nothing leaves the browser. | Real creation / update of Leads, Zoho quotes with national numbering, assignment by postcode, automatic 48 h reminder, dashboard. |
| **Emails / SMS** (list, resume link, pre-visit) | Simulated on screen (a preview of the email that would go out). | Real sends through the CRM. |
| **Project resume** | Real project code + **localStorage** in the browser. The email link is simulated. | Real resume link sent by email, synced to the CRM. |
| **Pre-visit photos** | Simulated slots. | Real upload of the 3 photos asked for explicitly (heat source, radiator + valve, electrical panel). |
| **Club Pro installers / distributors** | Fictional names, simulated area. | Real directory geolocated by postcode, Club Pro members served first. |
| **Estimated savings** | A range calculated with **fictional coefficients and energy prices** (degree-day method, readable in the tool). | Saving bands built from a degree-day model per market, with current energy prices. |
| **Videos** | Placeholders positioned at the right moments of the journey. | Real videos: short ones to choose (<= 1 min), step-by-step ones to install. |
| **Visuals** | **Real**, all of them: the 24 product photos are genuine Salus cut-outs, the logo is the official one, and every pictogram is an Iconify vector icon bundled offline (see [VISUALS.md](VISUALS.md)). | The official Salus icon library for the system diagram, and the videos. |
| **System diagram** | Genuinely generated as SVG from the configuration (fixed rules, solid = wired / dotted = radio) with **placeholder icons**. | The same generator with the official vector icon library plus a dozen reference drawings. |
| **Label recognition** (replacement module) | Button present, function simulated. Equivalence table limited to 10 entries (Delta Dore, Netatmo, Honeywell, Tado, legacy Salus). | OCR of the label, full equivalence table enriched by the requests that come back empty. |

## Deliberate BETA choices (open to review)

- **Premium level for underfloor heating** adds auto-balancing actuators (ref. THB to confirm) - an
  interpretation to validate, since the workshop rule only mentioned TRVs.
- **Bundled libraries** (`vendor/`: React 18, jsPDF, compiled Tailwind CSS) instead of the CDNs used by
  the earlier configurators: the demo runs **even with no internet** and depends on no third-party
  service. Same stack, zero build at deploy time (see `build/README-build.md` to recompile the CSS).
- **Connectivity**: room-by-room control of water radiators always goes through the UG800 gateway
  (a technical reality of TRVs); the comparison card explains this to the customer.

## Run / deploy

A 100% static site - no build, no dependencies.

- **Locally**: open `index.html`, or run `python3 -m http.server` and go to http://localhost:8000
- **Netlify**: the repository is linked to the site - every push triggers a deploy (`netlify.toml`: publish `.`)

## Structure

```
index.html            Entry point (permanent BETA banner)
how-it-works.html     Standalone walkthrough: 5 diagrams + the 26 problems, tagged by status
presentation.html     20-minute slide deck for the internal presentation (notes, timer, demo cues)
Salus-Configurator-presentation.pptx   The same deck as PowerPoint
js/data/catalog.js    Product catalogue (real) + prices (fictional) + rules
js/data/markets.js    Heat sources & emitters across FR / UK / DE / RO / DK
js/data/copy.js       Copy, room benefits, equivalences, demo scenario
js/engine.js          Engine: needs -> abstract system -> products, levels,
                      3-state compatibility, savings, qualified file
js/schematic.js       System diagram generator (SVG)
js/crm.js             Zoho CRM simulation: payloads, explained flows, log
js/docs.js            Placeholder PDF documents (jsPDF)
js/ui.js              Shared components  ·  js/result.js "My solution" screen
js/app.js             Journey, landing, replacement, pre-visit, backstage
assets/               Real product photos + logo (fixed paths - see VISUALS.md)
vendor/               React, jsPDF, compiled Tailwind CSS, Iconify icon bundle
build/                CSS recompilation, Iconify bundler, product photo pipeline
build/video/          Trade-show video recorder: stage page, overlay, one scenario per video; motion/ the stand film
video/                The trade-show loops: R-System site + configurator, and the site alone (1920 x 1080 MP4)
tests/                Engine tests (plain node, no dependencies)
```

## Open items

Carried over, in priority order:

1. **Three product references need validating.** Shown in the tool as "ref. to confirm":
   `TRV3RF-AB` (auto-balancing head), `T30NC` (loop actuator), `THB` (auto-balancing actuator).
   Every other reference comes from the existing Salus configurators.
2. **Visuals - done.** No placeholder left. All 24 product photos are the real Salus cut-outs, the
   landing page carries the real logo, and the 39 question / situation / room / profile placeholders
   are gone: those are Iconify vector icons now (27 questions, 6 rooms, 4 situations, 2 profiles).
   See [VISUALS.md](VISUALS.md), which also lists the four photos that deliberately reuse a
   neighbouring product's shot for a shared body (`el600f`, `rx30rf`, `sq610b`, `trv3rf-ab`) -
   confirmed product-side, not gaps.
   Worth shooting anyway when there is budget: the 4 situations and the 2 profile visuals. Those six
   carry emotion rather than information, which a glyph states but a photograph sells. The other 33
   are diagrammatic and read faster as icons.
3. **Two assets that have no placeholder**: the vector icon library for the system diagram
   (plus ~10 hand-drawn reference diagrams) - the Iconify route used for the pictograms is a
   candidate here too - and the videos. Also in VISUALS.md.
4. **Netlify site name - done.** The site is `configurator-salus-test.netlify.app`. The generated
   `effulgent-pie-e51188` name is gone and now answers a bare Netlify 404.
5. **GitHub Pages** is optional and one toggle away: Settings -> Pages -> Source: GitHub Actions.
   The workflow is already committed; until then its Pages job is non-blocking and the test job is
   the real build signal.
6. **Default branch - done.** `main` is the repository default branch since 2026-09-02. The former
   default, `claude/salus-configurator-beta-xju3qx`, only carries PR #5 and goes away with it.

## Test

- Engine: `node tests/test-engine.js` (33 assertions, nothing to install).
- The **"Demo scenario - mixed house"** button on the landing page: a pre-filled journey in one click
  (underfloor downstairs + radiators upstairs + gas boiler), for the 5-minute presentation.
