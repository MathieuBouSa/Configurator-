# Visuals needed - BETA configurator

Neutral placeholders are already in place at the correct dimensions, with **fixed paths**: to drop a real
visual in, just **place the file at the same path with the same name** - no code to change. Keep the exact
name and extension listed below (a JPEG photo is fine if it is saved / renamed as `.png`).

General rule: light or cut-out background, no text burnt into the image (labels live in the interface).

## 1. Product photos - `assets/products/` - PNG - **800 x 800** - ratio 1:1 - <= 200 KB

Product cut out on a white or transparent background, three-quarter view, screen lit where there is one.

**Status: real photos in place, except `el600f.png`.** The 23 other files are the genuine Salus
cut-outs: transparent background, cropped on the product bounding box with a constant 5 % margin,
800 x 800, every one under 200 KB. Four entries still need a look:

| File | What is pending |
|---|---|
| `el600f.png` | Still the placeholder. The photo supplied showed the round iT800 thermostat, not a pilot-wire EL600F. |
| `rx30rf.png` | The photo supplied is an RX10RF. Confirm which reference the tool should carry. |
| `sq610b.png` | Uses the SQ610BRF photo: no wired-black shot was supplied, and the two are identical from the front. |
| `trv3rf-ab.png` | Uses the TRV3RF photo: no auto-balancing shot was supplied. |

| File | Product | Seen on |
|---|---|---|
| `ug800.png` | UG800 gateway with its network cable | Solution list, Other choice, documents |
| `trv3rf.png` | TRV3RF head fitted on a valve body | idem |
| `trv3rf-ab.png` | Auto-balancing head (variant) | Other choice, technical variant |
| `sq610.png` / `sq610b.png` | SQ610 thermostat white / black, front, screen lit | idem |
| `sq610rf.png` / `sq610brf.png` | SQ610RF white / black on its magnetic mount | idem |
| `rx30rf.png` | RX30RF receiver | idem |
| `cb12rf.png` | CB12RF wiring centre, cover open | idem |
| `cb500co.png` | CB500CO wiring centre | idem |
| `t30nc.png` | Thermal actuator on a manifold | idem |
| `thb.png` | Auto-balancing actuator | idem |
| `el600f.png` | EL600F pilot-wire thermostat | idem |
| `re600.png` | RE600 repeater plugged into a socket | idem |
| `sr600.png` | SR600 relay held between two fingers (for scale) | idem |
| `rs600.png` | RS600 shutter module | idem |
| `sw600.png` | Opening sensor fitted on a window | Packs |
| `ms610.png` | Presence sensor | Packs |
| `rt520.png` / `rt520rf.png` | RT520 alone / RT520RF kit with receiver | Solution list (single-zone journey) |
| `wq610.png` | WQ610 thermostat | idem |
| `it700.png` | iT700 kit: thermostat + receiver with built-in gateway | idem |
| `it800wifi.png` | iT800 WiFi and its receiver | idem |
| `rsq800wrf.png` | RSQ800WRF R-System thermostat | Ducted AC journey |

## 2. Question illustrations - `assets/questions/` - PNG - **600 x 400** - ratio 3:2 - <= 150 KB

A photo or illustration that reads instantly: the customer must recognise THEIR situation in one second.

| File | Screen (question) | What must be visible |
|---|---|---|
| `logement-maison.png` · `logement-appartement.png` · `logement-tertiaire.png` | My home - type | Detached house / residential block / office-retail building |
| `niveaux-plainpied.png` · `niveaux-1etage.png` · `niveaux-2etages.png` | My home - floors | Section or facade suggesting 1, 2, 3+ levels |
| `murs-standard.png` · `murs-epais.png` · `murs-inconnu.png` | My home - walls | Brick/plasterboard wall · thick stone wall · a plain question mark |
| `gen-gaz.png` | My heating - heat source | Wall-hung gas boiler |
| `gen-fioul.png` | idem | Floor-standing oil boiler with the tank suggested |
| `gen-pac-eau.png` | idem | Heat pump outdoor unit + hydraulic connection |
| `gen-pac-air.png` | idem | Outdoor unit + supply grille |
| `gen-electrique.png` | idem | Electric radiator + consumer unit |
| `gen-reseau.png` | idem | District heating substation / heat exchanger |
| `gen-bois.png` | idem | Pellet stove |
| `gen-inconnu.png` | idem | A plain question mark |
| `emit-radiateur-eau.png` | My heating - emitters | Steel radiator with a thermostatic valve |
| `emit-plancher-eau.png` | idem | Underfloor pipe loops + manifold |
| `emit-plancher-elec.png` | idem | Electric mat under tiles |
| `emit-radiateur-elec.png` | idem | Radiant panel on the wall |
| `emit-gainable.png` | idem | Ceiling supply grille + duct |
| `emit-ventilo.png` | idem | Fan coil console unit |
| `cables-oui.png` · `cables-non.png` | My heating - existing cables | Wall box with wires showing / bare wall (the 2 photos from workshop solution P5) |
| `zonage-multi.png` · `zonage-mono.png` | My heating - room by room | The "two houses" drawing: rooms at different temperatures / all the same (workshop solution P6) |

## 3. Real-life situations - `assets/situations/` - PNG - **800 x 500** - ratio 16:10 - <= 180 KB

Warm illustrations, one person in the situation (workshop solutions P12/P13).

| File | Situation illustrated |
|---|---|
| `situation-train.png` | Person on a train, phone in hand, home in the distance |
| `situation-gel.png` | Holiday house under snow + an alert notification |
| `situation-installateur.png` | Installer at a desk adjusting a system remotely |
| `situation-voiture.png` | Driver parked, app open |

## 4. Room pictograms - `assets/pieces/` - PNG - **400 x 400** - ratio 1:1 - <= 80 KB

One consistent pictogram style (same stroke, same brand colours).
`piece-sejour.png`, `piece-cuisine.png`, `piece-chambre.png`, `piece-bureau.png`, `piece-sdb.png`, `piece-autre.png`.

## 5. Landing page - `assets/hero/`

| File | Format / dimensions | Max weight | Description |
|---|---|---|---|
| `logo-salus.png` | Transparent PNG - **480 x 120** (4:1) | 50 KB | Official Salus Controls logo |
| `profil-particulier.png` | PNG/JPG - **800 x 450** (16:9) | 250 KB | A family in their living room, warm feel |
| `profil-installateur.png` | PNG/JPG - **800 x 450** (16:9) | 250 KB | An installer working on a boiler |

## 6. To plan for later (no placeholder file yet)

| Item | Format | Use |
|---|---|---|
| Icon library for the system diagram | Vector SVG, one file per block: heat source, pump, valve, manifold, wiring centre, thermostat, TRV head, gateway, internet router, outdoor sensor | Replaces the placeholder icons drawn in `js/schematic.js` - also plan ~10 reference diagrams drawn by hand as models (workshop solution P18) |
| Short choice videos (<= 1 min) and installation videos (per step) | MP4 H.264 960 x 540 + PNG thumbnail | Replace the "placeholder video" blocks; to be attached to a product and a moment in the journey (P17) |
