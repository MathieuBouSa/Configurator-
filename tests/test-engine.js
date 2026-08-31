/* Tests rapides du moteur — exécutés sous node */
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

console.log("— Scénario démo (mixte plancher + radiateurs) —");
const levels = E.buildLevels(demo);
const agg = (l) => Object.fromEntries(E.aggregate(levels[l].items).map(x => [x.ref, x.qty]));
const ess = agg("essential"), com = agg("comfort"), pre = agg("premium");
console.log("essential:", ess, "total", levels.essential.total);
console.log("comfort:  ", com, "total", levels.comfort.total);
console.log("premium:  ", pre, "total", levels.premium.total);

check("Essential contient UG800", ess.UG800 === 1);
check("Essential: 3 TRV3RF (3 radiateurs étage)", ess.TRV3RF === 3);
check("Essential: CB12RF présent (plancher, pas de gaines)", ess.CB12RF === 1);
check("Essential: 2 SQ610RF (zones plancher séjour+cuisine)", ess.SQ610RF === 2);
check("Essential: 3 actionneurs T30NC (2 séjour + 1 cuisine)", ess.T30NC === 3);
check("Essential: répéteur RE600 ajouté (étage + wifi faible)", ess.RE600 >= 1);
check("Comfort: thermostat dans la 1re pièce à vivre à radiateurs", com.SQ610RF === 3);
check("Premium: THB remplace T30NC", pre.THB === 3 && !pre.T30NC);
check("Premium: SQ610RF partout (2 zones + 3 pièces radiateurs)", pre.SQ610RF === 5);
check("Totaux croissants", levels.essential.total < levels.comfort.total && levels.comfort.total < levels.premium.total,
  { e: levels.essential.total, c: levels.comfort.total, p: levels.premium.total });

console.log("— Parcours autonome (pas de zonage) —");
const solo = { ...demo, perRoomControl: "no", hasThermostatWiring: "no", rooms: demo.rooms };
const lsolo = E.buildLevels(solo);
const sagg = (l) => Object.fromEntries(E.aggregate(lsolo[l].items).map(x => [x.ref, x.qty]));
check("Essential = RT520RF", sagg("essential").RT520RF === 1, sagg("essential"));
check("Comfort = iT700", sagg("comfort").IT700 === 1, sagg("comfort"));
check("Premium = iT800 WiFi", sagg("premium").IT800WIFI === 1);
check("Pas d'UG800 (passerelle intégrée / autonome)", !sagg("premium").UG800 && !sagg("essential").UG800);

const soloWired = { ...solo, hasThermostatWiring: "yes" };
const lw = E.buildLevels(soloWired);
check("Filaire: Essential RT520, Comfort WQ610",
  lw.essential.items[0].ref === "RT520" && lw.comfort.items[0].ref === "WQ610");

console.log("— Compatibilité 3 états —");
const c1 = E.compatCheck(demo, [], "TRV3RF");
check("TRV sans passerelle → no + UG800 proposé", c1.state === "no" && c1.missingRef === "UG800");
const c2 = E.compatCheck(demo, [{ ref: "UG800", qty: 1 }], "SQ610");
check("SQ610 filaire sans câbles → limit", c2.state === "limit");
const c3 = E.compatCheck({ ...demo, rooms: Array.from({ length: 14 }, (_, i) => ({ id: i, emitter: "ufh_water", type: "autre" })) },
  [{ ref: "UG800", qty: 1 }], "CB12RF");
check("CB12RF avec 14 zones → limit", c3.state === "limit");

console.log("— Alternatives « Autre choix » —");
const alts = E.alternativesFor(demo, levels.comfort.items, { ref: "SQ610RF", qty: 1 });
check("Alternatives roomstat proposées", alts.length === 3);
check("SQ610 filaire signalé en limite (pas de câbles)", alts.find(a => a.ref === "SQ610").state === "limit");

console.log("— Complétude —");
const noGw = levels.comfort.items.filter(it => it.ref !== "UG800");
const miss = E.completeness(demo, noGw);
check("Passerelle manquante détectée", miss.some(m => m.ref === "UG800"));

console.log("— Dossier qualifié —");
check("Biomasse → dossier qualifié", E.qualifiedFileCheck({ ...demo, generator: "biomass" }).qualified);
check("Tertiaire → dossier qualifié", E.qualifiedFileCheck({ ...demo, homeType: "tertiary" }).qualified);
check("14 zones → dossier qualifié", E.qualifiedFileCheck({ ...demo, rooms: Array.from({ length: 14 }, (_, i) => ({ id: i })) }).qualified);
check("Démo standard → parcours auto", !E.qualifiedFileCheck(demo).qualified);

console.log("— Économies (fourchette) —");
const sv = E.savings(demo, "comfort");
check("Fourchette % et € cohérente", sv.pctLow < sv.pctHigh && sv.eurLow < sv.eurHigh && sv.eurLow > 0, sv);

console.log("— Estimation précoce —");
const early = E.earlyEstimate(demo);
check("Estimation précoce disponible", early && early.total > 0, early && { total: early.total, n: early.deviceCount });

console.log("— Remplacement (tolérance fautes) —");
check("« tybox 117 » → Tybox 1117", E.searchReplacement("tybox 117").some(r => r.from === "Tybox 1117"));
check("« netamo » → Netatmo", E.searchReplacement("netamo").some(r => r.brand === "Netatmo"));
check("« evohome » → Honeywell", E.searchReplacement("evohome").some(r => r.from === "evohome"));

console.log("— Packs —");
const packs = E.buildPacks(demo);
check("Pack pilotage générateur pré-coché (chaudière accessible)", packs.find(p => p.id === "boilerPilot").preChecked);
check("Pack sécurité: 8 OS600 (8 fenêtres) + 1 MS600", (() => {
  const s = packs.find(p => p.id === "security");
  return s.items.find(i => i.ref === "OS600").qty === 8 && s.items.find(i => i.ref === "MS600").qty === 1;
})());

console.log(failures === 0 ? "\nTOUS LES TESTS PASSENT" : `\n${failures} ÉCHEC(S)`);
process.exit(failures === 0 ? 0 : 1);
