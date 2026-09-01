# Traceability - workshop -> BETA configurator

Source of truth: the `Configurator_Brainstorm_Solutions_1.xlsx` file (**Problems** and **Solutions** tabs).
Every feature in the mock-up is linked to the problem (P#) and the Solutions row that justify it.
This table is also visible inside the tool ("About this BETA" page).

| P# | Problem (summary) | Solutions row | Feature in the BETA | Treatment |
|---|---|---|---|---|
| P1 | Identifying compatible devices | row 2 | 3-state compatibility engine (compatible / **greyed with the reason in one sentence** / with a limitation), completeness check, missing product offered with an add button | Working |
| P2 | Matching needs with available devices | row 3 | **Needs -> abstract system (roles) -> products** logic; no catalogue shown before the recommendation; the questionnaire survives catalogue changes | Working |
| P3 | Unclear customer journey | row 4 | 4 named steps "My home / My heating / My habits / My solution", bar always visible, going back loses nothing | Working |
| P4 | Customers unsure which devices suit them | row 5 | "Your solution" in 3 levels **Essential / Comfort / Premium** computed from composition rules + technical variant (auto-balancing heads) + separate packs | Working |
| P5 | Journey not intuitive | row 6 | One question per screen, clickable illustrated cards, Homeowner / Installer profile chosen up front (with the reason explained), vocabulary adapted | Working |
| P6 | Seeing all available options | row 7 | Result screen in 2 parts: home room by room on top, list below, **"Other choice"** on every line (same role, compatible, price + function difference in one line) | Working |
| P7 | Too many steps before purchase | row 8 | **Early proposal** from the end of My heating, updated live with every answer; 3 final actions (list by email, quote, get put in touch) | Working (actions simulated) |
| P8 | Installer must be on site to specify | row 9 | Pro area: **pre-visit** - link sent to the customer, 3 photos asked for explicitly, configuration pre-filled and ready to validate | Simulated (fictional link + customer reply) |
| P9 | No single supplier for everything | row 10 | Postcode routing to the area sales rep, with a clear message ("this is a service, not a dead end") | Simulated (payload visible in backstage) |
| P10 | System may not suit the location | row 11 | Context questions (walls, floors, area, wi-fi) + radio range rules -> **RE600 repeater added by default, removable**, warning, never a block | Working |
| P11 | Choosing between online and offline | row 12 | Never asked: 3 usage questions, then the **conclusion** "your solution will be connected" + a comparison card shown exactly once | Working |
| P12 | Benefits of remote access unclear | row 13 | **4 real-life situations** in one sentence + image, placed exactly at the connectivity questions | Working |
| P13 | Installers drowning in documentation | row 14 | Documentation matrix queried with the selected products: blocks per product, **a missing document shown as missing**, full pack in one click | Working (test documents) |
| P14 | Finding a replacement for an existing product | row 15 | Replacement module: **typo-tolerant** search, competitors covered (Delta Dore, Netatmo, Honeywell, Tado) plus legacy Salus, additional products listed, label photo (simulated) | Working (10-entry table) |
| P15 | Market configurators too limited | row 16 | **Qualified file**: commercial building, > 12 zones, uncovered heat source or emitter, BMS -> the configurator prepares the file with its partial recommendation, call back within 48 h; every human correction becomes a rule to add | Simulated (Zoho Deals in backstage) |
| P16 | No guided videos | row 17 | Videos attached to a product **and** to a moment (understand before / install after), never in an isolated library | Positioned placeholders |
| P17 | System hard to visualise | row 18 | **Diagram generated automatically** from the configuration: heat source bottom left, distribution in the middle, rooms on top, solid lines for wired, dotted for radio, colour for water | Working (placeholder icons) |
| P18 | Total price hard to work out | row 19 | Live total, line-by-line detail, recommended retail price everywhere (no net price), **Club Pro installers by postcode**, members first | Working (fictional prices, labelled) |
| P19 | Savings hard to estimate | row 20 | Calculator: 4 inputs the customer knows, result as a **range** (% and EUR/year), "see the method" (EN 15232), calculation stored with the configuration | Working (fictional coefficients) |
| P20 | No step-by-step guide for the whole system | row 21 | **Single guide generated as a PDF** in the real order of the job: preparation, wiring (wired products only), ordered pairing, commissioning, final test; diagram on page 1 | Working (test content) |
| P21 | Benefits poorly explained | row 22 | Benefits expressed **room by room**, generated from the rooms the customer declared | Working |
| P22 | Comparing options (savings, etc.) | - *(no Solutions row)* | **Addition outside the workshop, approved by Mathieu**: side-by-side comparison of the 3 levels (price, devices, savings, remote control) | Working |
| P23 | Having to start over every visit | row 23 | **Project code** from the first answer, exact resume at the step left (localStorage), resume link by email (the email also feeds the CRM - P26 answered at the same time), 48 h reminder | Working (email simulated) |
| P24 | Finding the right system within a budget | row 24 | Budget slider; a level above the budget stays **visible and greyed with the gap shown**; one naming (Essential/Comfort/Premium) everywhere; packs never mixed into the levels | Working |
| P25 | Turning a configuration into a quote | row 25 | Quote generated (single template, simulated national numbering) at the **recommended retail price**; installer message "present this quote to your Salus distributor (Espace Aubade, Algorel, Richardson)" - no net price | Working (test PDF, Zoho simulated) |
| P26 | Configurator not connected to the CRM | row 26 | Every configuration creates / updates a Lead (profile, postcode, project, zones, level, amount, drop-off step); **"CRM backstage"** panel: explained flows, live payload, event log | Fully simulated (BETA requirement) |

## Additions outside the workshop file (flagged, approved by Mathieu)

1. **Level comparison screen** - covers P22, the only problem with no solution row.
2. **"Demo scenario - mixed house" button** - a pre-filled journey for the 5-minute internal presentation.
3. **"About this BETA" page** - this table, inside the tool.

The BETA banner, the "fictional price" labels, the backstage panel and the README come from the BETA brief,
not from the workshop file.

## Product rules specified by Mathieu (outside the file)

- TRV levels: Essential = 0 thermostats / Comfort = 1 thermostat in the main living room / Premium = a thermostat in every room.
- RX30RF offered in both worlds (boiler, heat pump, pump, valves), pre-checked when the heat source is accessible.
- Mixed setups: underfloor downstairs -> TRVs offered for the rooms with radiators; TRVs offered -> auto-balancing heads as an option.
- RE600 advised beyond 15 wireless devices, thick walls, a floor to cross, or where wi-fi already struggles (proxy question asked).
- Standalone RF thermostats: Essential RT520RF / Comfort iT700 / Premium iT800 WiFi - the **gateway is built into their boiler receiver** (no UG800 added). Wired ON/OFF: RT520, WQ610.
- UG800 for everything else that is connected; every product that goes through the UG800 is presented "as a solution: what it is for".
- Security pack (window sensors based on the number of windows asked for + presence sensor), roller shutter pack (RS600), smart socket via the **SR600 relay inside the socket**.
