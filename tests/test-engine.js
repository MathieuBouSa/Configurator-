/* Quick engine tests - run under node */
require(__dirname + "/../js/data/catalog.js");
require(__dirname + "/../js/data/markets.js");
require(__dirname + "/../js/data/copy.js");
const E = require(__dirname + "/../js/engine.js");

let failures = 0;
function check(label, cond, extra) {
  if (cond) console.log("  OK  " + label);
  else { failures++; console.log("  FAIL " + label + (extra ? " — " + JSON.stringify(extra) : "")); }
}

const demo = globalThis.SALUS_COPY.demoScenario.answers;

console.log("- Demo scenario (mixed underfloor + radiators) -");
const levels = E.buildLevels(demo);
const agg = (l) => Object.fromEntries(E.aggregate(levels[l].items).map(x => [x.ref, x.qty]));
const ess = agg("essential"), com = agg("comfort"), pre = agg("premium");
console.log("essential:", ess, "total", levels.essential.total);
console.log("comfort:  ", com, "total", levels.comfort.total);
console.log("premium:  ", pre, "total", levels.premium.total);

check("Essential contains UG800", ess.UG800 === 1);
check("Essential: 3 TRV3RF (3 upstairs radiators)", ess.TRV3RF === 3);
check("Essential: CB12RF present (underfloor, no conduits)", ess.CB12RF === 1);
check("Essential: 2 SQ610RF (underfloor zones living+kitchen)", ess.SQ610RF === 2);
check("Essential: 3 T30NC actuators (2 living + 1 kitchen)", ess.T30NC === 3);
check("Essential: RE600 repeater added (floor + weak wi-fi)", ess.RE600 >= 1);
check("Comfort: thermostat in the first radiator living room", com.SQ610RF === 3);
check("Premium: THB replaces T30NC", pre.THB === 3 && !pre.T30NC);
check("Premium: SQ610RF everywhere (2 zones + 3 radiator rooms)", pre.SQ610RF === 5);
check("Totals increase", levels.essential.total < levels.comfort.total && levels.comfort.total < levels.premium.total,
  { e: levels.essential.total, c: levels.comfort.total, p: levels.premium.total });

console.log("- Standalone journey (no zoning) -");
const solo = { ...demo, perRoomControl: "no", hasThermostatWiring: "no", rooms: demo.rooms };
const lsolo = E.buildLevels(solo);
const sagg = (l) => Object.fromEntries(E.aggregate(lsolo[l].items).map(x => [x.ref, x.qty]));
check("Essential = RT520RF", sagg("essential").RT520RF === 1, sagg("essential"));
check("Comfort = iT700", sagg("comfort").IT700 === 1, sagg("comfort"));
check("Premium = iT800 WiFi", sagg("premium").IT800WIFI === 1);
check("No UG800 (built-in gateway / standalone)", !sagg("premium").UG800 && !sagg("essential").UG800);

const soloWired = { ...solo, hasThermostatWiring: "yes" };
const lw = E.buildLevels(soloWired);
check("Wired: Essential RT520, Comfort WQ610",
  lw.essential.items[0].ref === "RT520" && lw.comfort.items[0].ref === "WQ610");

console.log("- 3-state compatibility -");
const c1 = E.compatCheck(demo, [], "TRV3RF");
check("TRV with no gateway -> no + UG800 offered", c1.state === "no" && c1.missingRef === "UG800");
const c2 = E.compatCheck(demo, [{ ref: "UG800", qty: 1 }], "SQ610");
check("Wired SQ610 with no cables -> limit", c2.state === "limit");
const c3 = E.compatCheck({ ...demo, rooms: Array.from({ length: 14 }, (_, i) => ({ id: i, emitter: "ufh_water", type: "autre" })) },
  [{ ref: "UG800", qty: 1 }], "CB12RF");
check("CB12RF with 14 zones -> limit", c3.state === "limit");

console.log("- Other choice alternatives -");
const alts = E.alternativesFor(demo, levels.comfort.items, { ref: "SQ610RF", qty: 1 });
check("Roomstat alternatives offered", alts.length === 3);
check("Wired SQ610 flagged as limited (no cables)", alts.find(a => a.ref === "SQ610").state === "limit");

console.log("- Completeness -");
const noGw = levels.comfort.items.filter(it => it.ref !== "UG800");
const miss = E.completeness(demo, noGw);
check("Missing gateway detected", miss.some(m => m.ref === "UG800"));

console.log("- Qualified file -");
check("Biomass -> qualified file", E.qualifiedFileCheck({ ...demo, generator: "biomass" }).qualified);
check("Commercial -> qualified file", E.qualifiedFileCheck({ ...demo, homeType: "tertiary" }).qualified);
check("14 zones -> qualified file", E.qualifiedFileCheck({ ...demo, rooms: Array.from({ length: 14 }, (_, i) => ({ id: i })) }).qualified);
check("Standard demo -> automatic journey", !E.qualifiedFileCheck(demo).qualified);

console.log("- Savings (range) -");
const sv = E.savings(demo, "comfort");
check("Percentage and euro range consistent", sv.pctLow < sv.pctHigh && sv.eurLow < sv.eurHigh && sv.eurLow > 0, sv);

console.log("- Early estimate -");
const early = E.earlyEstimate(demo);
check("Early estimate available", early && early.total > 0, early && { total: early.total, n: early.deviceCount });

console.log("- Replacement (typo tolerance) -");
check("\"tybox 117\" -> Tybox 1117", E.searchReplacement("tybox 117").some(r => r.from === "Tybox 1117"));
check("\"netamo\" -> Netatmo", E.searchReplacement("netamo").some(r => r.brand === "Netatmo"));
check("\"evohome\" -> Honeywell", E.searchReplacement("evohome").some(r => r.from === "evohome"));

console.log("- Packs -");
const packs = E.buildPacks(demo);
check("Heat source pack pre-checked (boiler accessible)", packs.find(p => p.id === "boilerPilot").preChecked);
check("Security pack: 8 OS600 (8 windows) + 1 MS600", (() => {
  const s = packs.find(p => p.id === "security");
  return s.items.find(i => i.ref === "OS600").qty === 8 && s.items.find(i => i.ref === "MS600").qty === 1;
})());

console.log(failures === 0 ? "\nALL TESTS PASS" : `\n${failures} FAILURE(S)`);
process.exit(failures === 0 ? 0 : 1);
