# Salus Configurator - BETA

A working mock-up of the unified Salus Controls configurator, built for an **internal demonstration**.
This is **not a production tool**: its only purpose is to make the concept tangible - to show how the
configurator would work, what it would produce, and what it could be worth to Salus.

One journey only: **My home -> My heating -> My habits -> My solution.**
Every feature traces back to the Problems / Solutions workshop - see [WORKSHOP-MAPPING.md](WORKSHOP-MAPPING.md)
and the "About" page inside the tool.

**Live demo:** https://effulgent-pie-e51188.netlify.app/
(Netlify auto-deploys `main`. The site name is still Netlify's generated one - rename it under
Site configuration -> Site details -> Change site name.)

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
| **Estimated savings** | A range calculated with **fictional coefficients and energy prices** (method inspired by EN 15232, readable in the tool). | Validated EN 15232 coefficients, current energy prices. |
| **Videos** | Placeholders positioned at the right moments of the journey. | Real videos: short ones to choose (<= 1 min), step-by-step ones to install. |
| **Visuals** | **Real**, on both fronts: 23 of the 24 product photos are the genuine Salus cut-outs, and every pictogram is an Iconify vector icon bundled offline. Two files left: `el600f.png` and the logo (see [VISUALS.md](VISUALS.md)). | The last two files, plus the official Salus icon library for the system diagram. |
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
assets/               Product photo placeholders + logo (fixed paths - see VISUALS.md)
vendor/               React, jsPDF, compiled Tailwind CSS, Iconify icon bundle
build/                CSS recompilation, Iconify bundler, product photo pipeline
tests/                Engine tests (plain node, no dependencies)
```

## Open items

Carried over, in priority order:

1. **Three product references need validating.** Shown in the tool as "ref. to confirm":
   `TRV3RF-AB` (auto-balancing head), `T30NC` (loop actuator), `THB` (auto-balancing actuator).
   Every other reference comes from the existing Salus configurators.
2. **Visuals - two files left.** 23 of the 24 product photos are the real cut-outs, and the 41
   question / situation / room / profile placeholders are gone: those are Iconify vector icons now.
   What remains is `el600f.png` (still a placeholder - the photo supplied was the round iT800) and
   `assets/hero/logo-salus.png`. See [VISUALS.md](VISUALS.md).
   Three photos are stand-ins worth revisiting: `rx30rf.png` holds an RX10RF, while `sq610b.png`
   and `trv3rf-ab.png` reuse a neighbouring product's shot.
3. **Two assets that have no placeholder**: the vector icon library for the system diagram
   (plus ~10 hand-drawn reference diagrams) - the Iconify route used for the pictograms is a
   candidate here too - and the videos. Also in VISUALS.md.
4. **Netlify site name** is still the generated one. Rename under
   Site configuration -> Site details -> Change site name.
5. **GitHub Pages** is optional and one toggle away: Settings -> Pages -> Source: GitHub Actions.
   The workflow is already committed; until then its Pages job is non-blocking and the test job is
   the real build signal.
6. **`main` is not the repository default branch** (the feature branch became default when it was
   the only one). Switch it under Settings -> General -> Default branch if you want tidy PRs.

## Test

- Engine: `node tests/test-engine.js` (33 assertions, nothing to install).
- The **"Demo scenario - mixed house"** button on the landing page: a pre-filled journey in one click
  (underfloor downstairs + radiators upstairs + gas boiler), for the 5-minute presentation.
