# Visuals needed - BETA configurator

Two families of visuals, handled in two different ways:

- **Pictograms** (questions, situations, rooms, profiles) - **done**: they are now real vector icons
  from [Iconify](https://iconify.design) (Material Design Icons set, Apache-2.0), bundled offline.
  Nothing to supply. See [Pictograms](#pictograms-done---no-file-to-supply) below.
- **Product photos** - **done**: all 24 slots hold genuine Salus cut-outs. The logo is the only
  file left. See section 1.

General rule for the photos: light or cut-out background, no text burnt into the image (labels live
in the interface). Paths are **fixed**: to drop a real visual in, place the file at the same path with
the same name - no code to change. Keep the exact name and extension listed (a JPEG photo is fine if
it is saved / renamed as `.png`).

## 1. Product photos - `assets/products/` - PNG - **800 x 800** - ratio 1:1 - <= 200 KB

Product cut out on a white or transparent background, three-quarter view, screen lit where there is one.

**Status: done.** All 24 slots hold genuine Salus cut-outs: transparent background, cropped on the
product bounding box with a constant 5 % margin, 800 x 800, every one under 200 KB - verified with
`node build/product-photos.mjs --check`, which also confirms no code path points at a missing file
and no file sits unreferenced.

Four of them deliberately reuse a neighbouring product's shot, because the two products share the
same body. Confirmed product-side, so these are settled rather than pending:

| File | Reuses | Why |
|---|---|---|
| `el600f.png` | the iT800 shot | Same design. The frame keeps the iT800's receiver behind the dial: the receiver sits physically behind the thermostat, so no rectangular crop removes it without leaving a worse artefact. |
| `rx30rf.png` | an RX10 shot | Same design. |
| `sq610b.png` | the SQ610BRF shot | Same design; the two are identical from the front. |
| `trv3rf-ab.png` | the TRV3RF shot | Same design as the auto-balancing head. |

Replacing any of them later is a drop-in: same path, same name, then
`node build/product-photos.mjs` if the source needs conforming.

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

### Putting the photos in the right format

`build/product-photos.mjs` does the resizing, cropping, centring, compression and renaming, so
the only manual step is downloading the photos:

```
npm install --no-save sharp          # build-time only, nothing ships to the browser
# drop the raw downloads into build/photos-in/, named after each reference
node build/product-photos.mjs
```

It reads the 24 expected filenames from `js/data/catalog.js`, so the catalogue stays the single
source of truth. Each photo is trimmed of its uniform border, centred on an 800 x 800 square with a
4 % margin, flattened on white (`--transparent` keeps the alpha channel instead) and compressed
under 200 KB, quantising the palette only if it has to. Filename matching is forgiving:
`UG800.jpg`, `sq610-rf.png` and `TRV3RF AB.webp` all land in the right slot.

It tells you what it could not do: a source smaller than 800 px (upscaled, will look soft), a file
matching no product, and a photo still over 200 KB after quantising - which in practice means the
background is too busy and needs a cleaner cut-out.

`build/photos-in/` is git-ignored, because the raw downloads are inputs and only the conformed
output belongs in `assets/products/`. If you are handing the photos to someone else through the
repository, override it once with `git add -f build/photos-in/` (or drop them in through the GitHub
web UI, which ignores `.gitignore`), and delete them again in the commit that adds the outputs.

`node build/product-photos.mjs --check` audits `assets/products/` against the spec and writes
nothing. It needs no dependency, so it is the quick way to see what is still a placeholder.

## 2. Logo - `assets/hero/logo-salus.png`

Transparent PNG - **480 x 120** (4:1) - <= 50 KB - the official Salus Controls logo, landing page.

## Pictograms (done - no file to supply)

The question illustrations, the four real-life situations, the room pictograms and the two profile
cards used to be placeholder PNGs. They are now Iconify vector icons, which gives one consistent
stroke, the brand colour on every glyph (the SVG inherits `currentColor`), crispness at any size and
about 13 KB in total instead of forty PNG files.

**How it works**

- `build/icons.mjs` scans `js/` for icon references written `"mdi:<name>"`, pulls the matching set
  from npm (`@iconify-json/mdi`) and writes `vendor/icons.js` with **only the icons actually used**.
- `vendor/icons.js` is committed, so the demo stays 100 % static and works offline. The build script
  needs the network only on the run that regenerates it.
- `UI.Icon` renders one glyph; `UI.IconTile` renders the framed pictogram that stands in for a photo.

**Changing a pictogram**

1. Find a name on [icon-sets.iconify.design/mdi](https://icon-sets.iconify.design/mdi/).
2. Edit the `icon:` value in `js/data/markets.js`, `js/data/copy.js` or `js/app.js`.
3. Run `node build/icons.mjs` (it fails loudly on an unknown name), then recompile the CSS only if
   you also changed Tailwind classes - see `build/README-build.md`.

**Current mapping**

| Screen | Icons used |
|---|---|
| Home type | `home-variant` · `home-city` · `office-building` |
| Floors | `home-floor-g` · `home-floor-1` · `home-floor-2` |
| Walls | `bricks` · `wall` · `help-circle-outline` |
| Heat source | `gas-water-boiler` · `oil-barrel` · `heat-pump` · `sun-snowflake` · `lightning-bolt` · `pipe-valve` · `fireplace` · `help-circle-outline` |
| Emitters | `radiator` · `pipe` · `heating-coil` · `heat-wave` · `ventilation` · `fan` |
| Existing cables | `power-plug` · `wifi` |
| Room by room | `home-thermometer` · `thermostat` |
| Situations | `train` · `snowflake-alert` · `remote-desktop` · `car-connected` |
| Rooms | `sofa` · `stove` · `bed` · `desk` · `shower` · `door` |
| Profiles | `account-group` · `account-hard-hat` |

## To plan for later (no placeholder file yet)

| Item | Format | Use |
|---|---|---|
| Icon library for the system diagram | Vector SVG, one file per block: heat source, pump, valve, manifold, wiring centre, thermostat, TRV head, gateway, internet router, outdoor sensor | Replaces the placeholder icons drawn in `js/schematic.js` - the Iconify route above is a candidate here too. Also plan ~10 reference diagrams drawn by hand as models (workshop solution P18) |
| Short choice videos (<= 1 min) and installation videos (per step) | MP4 H.264 960 x 540 + PNG thumbnail | Replace the "placeholder video" blocks; to be attached to a product and a moment in the journey (P17) |
