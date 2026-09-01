/* ============================================================
   SALUS Configurateur BETA — Moteur de recommandation
   ------------------------------------------------------------
   Logique « besoins → système abstrait → produits » (P2) :
   1. Les réponses remplissent des attributs (jamais des codes).
   2. Le moteur compose un système cible par rôles.
   3. Chaque rôle est pourvu par un produit du catalogue au
      dernier moment (le catalogue peut changer sans toucher au
      questionnaire).
   Compatibilité à 3 états (P1) : ok / limit / no, avec la
   raison en une phrase et le produit manquant proposé.
   ============================================================ */

(function () {
  /* Les fichiers js/data/*.js définissent globalThis.SALUS_* et
     doivent être chargés avant ce module (navigateur comme node). */
  const CAT = globalThis.SALUS_CATALOG;
  const MKT = globalThis.SALUS_MARKETS;
  const COPY = globalThis.SALUS_COPY;

  const P = () => CAT.products;

  /* ---------- Utilitaires ---------- */

  function price(ref) { return P()[ref] ? P()[ref].price : 0; }

  function totalOf(items) {
    return items.reduce((s, it) => s + price(it.ref) * it.qty, 0);
  }

  /* Boucles de plancher estimées pour une pièce (BETA : 2 pour un
     séjour, 1 sinon — la vraie valeur viendrait du plan). */
  function loopsFor(room) {
    return room.type === "sejour" ? 2 : 1;
  }

  function mainLivingRoom(rooms) {
    return rooms.find(r => r.type === "sejour") ||
           rooms.find(r => (COPY.roomTypes.find(t => t.id === r.type) || {}).living) ||
           rooms[0];
  }

  /* ---------- 1. Système abstrait ---------- */

  /* Retourne la description en rôles, indépendante du catalogue. */
  function buildAbstractSystem(a) {
    const rooms = a.rooms || [];
    const sys = {
      profile: a.profile,
      perRoom: a.perRoomControl === "yes",
      connected: wantsConnected(a),
      zones: rooms.length,
      roles: [],           // [{role, roomId?, qty, why}]
      flags: []
    };

    if (!sys.perRoom) {
      // Une seule zone : thermostat autonome (échelle RT520RF / iT700 / iT800)
      sys.roles.push({
        role: a.hasThermostatWiring === "yes" ? "standaloneWired" : "standaloneRF",
        qty: 1, why: "Whole-home control, no zoning."
      });
      return sys;
    }

    rooms.forEach(room => {
      switch (room.emitter) {
        case "water_radiators":
          sys.roles.push({ role: "trv", roomId: room.id, qty: room.radiators || 1,
            why: "One head per radiator to control." });
          break;
        case "ufh_water":
          sys.roles.push({ role: "zonestat", roomId: room.id, qty: 1,
            why: "One thermostat per underfloor zone." });
          sys.roles.push({ role: "actuator", roomId: room.id, qty: loopsFor(room),
            why: "One actuator per manifold loop." });
          sys.needsWiringCentre = true;
          break;
        case "ufh_electric":
        case "electric_radiators":
          sys.roles.push({ role: "electricStat", roomId: room.id, qty: 1,
            why: "One pilot-wire thermostat per electric room." });
          break;
        case "ducted_ac":
        case "fan_coils":
          sys.roles.push({ role: "acController", roomId: room.id, qty: 1,
            why: "One R-System thermostat per supply zone." });
          break;
      }
    });

    return sys;
  }

  /* Connectivité : jamais demandée directement — conclusion des 3
     questions d'usage (P12). Un seul « oui » suffit. */
  function wantsConnected(a) {
    return a.remote === "yes" || a.alerts === "yes" || a.sharing === "yes";
  }

  /* ---------- 2. Niveaux Essential / Comfort / Premium ---------- */
  /* Règles Mathieu :
     TRV       — Essential : 0 thermostat ; Comfort : 1 thermostat
     pièce à vivre ; Premium : thermostat dans chaque pièce.
     Plancher  — mêmes niveaux ; Premium : actionneurs
     auto-équilibrants (choix BETA signalé dans le README).
     Mixte     — plancher au RDC → TRV proposées pour les autres
     pièces ; TRV proposées → option têtes auto-équilibrantes. */

  function buildLevel(a, levelId) {
    const rooms = a.rooms || [];
    const items = [];          // {ref, qty, roomId?, reason, auto?}
    const add = (ref, qty, roomId, reason, auto) => {
      if (qty > 0) items.push({ ref, qty, roomId: roomId || null, reason, auto: !!auto });
    };

    /* --- Parcours « une seule zone » : échelle autonome --- */
    if (a.perRoomControl !== "yes") {
      const ladder = a.hasThermostatWiring === "yes"
        ? { essential: "RT520", comfort: "WQ610", premium: "IT800WIFI" }
        : CAT.standaloneLadder.rf;
      add(ladder[levelId], 1, null, "Whole-home control.");
      return finalizeLevel(a, levelId, items);
    }

    const hasUfh = rooms.some(r => r.emitter === "ufh_water");
    const hasTrv = rooms.some(r => r.emitter === "water_radiators");

    /* Pièce qui reçoit le thermostat du niveau Comfort : la pièce à
       vivre principale PARMI les pièces à radiateurs (une zone
       plancher a déjà son thermostat). */
    const radRooms = rooms.filter(r => r.emitter === "water_radiators");
    const comfortRoom = radRooms.find(r => r.type === "sejour") ||
      radRooms.find(r => (COPY.roomTypes.find(t => t.id === r.type) || {}).living) ||
      radRooms[0];

    rooms.forEach(room => {
      switch (room.emitter) {
        case "water_radiators": {
          const n = room.radiators || 1;
          add("TRV3RF", n, room.id, "One head per radiator - the room follows its own temperature.");
          if (levelId === "premium" || (levelId === "comfort" && comfortRoom && room.id === comfortRoom.id)) {
            add("SQ610RF", 1, room.id, levelId === "premium"
              ? "Room thermostat in every room (Premium level)."
              : "Room thermostat in the main living room (Comfort level).");
          }
          break;
        }
        case "ufh_water": {
          add("SQ610RF", 1, room.id, "Zone thermostat for the underfloor heating.");
          add(levelId === "premium" ? "THB" : "T30NC", loopsFor(room), room.id,
            levelId === "premium"
              ? "Auto-balancing actuator: each loop adjusts its own flow (Premium level)."
              : "One actuator per manifold loop.");
          break;
        }
        case "ufh_electric":
        case "electric_radiators":
          add("EL600F", 1, room.id, "Pilot-wire thermostat for the room.");
          break;
        case "ducted_ac":
        case "fan_coils":
          add("RSQ800WRF", 1, room.id, "R-System thermostat for the supply zone.");
          break;
      }
    });

    /* Centre de câblage plancher : radio par défaut, filaire si gaines */
    if (hasUfh) {
      add(a.hasThermostatWiring === "yes" ? "CB500CO" : "CB12RF", 1, null,
        "The conductor of the underfloor system: it opens each loop on demand from its room.");
    }

    return finalizeLevel(a, levelId, items, { hasTrv, hasUfh });
  }

  function finalizeLevel(a, levelId, items, ctx) {
    ctx = ctx || {};
    /* Passerelle : requise dès qu'un produit needsGateway est présent
       — sauf passerelle intégrée (iT700 / iT800 / R-System). */
    const needsGw = items.some(it => P()[it.ref] && P()[it.ref].needsGateway);
    const hasIntegrated = items.some(it => P()[it.ref] && P()[it.ref].integratedGateway);
    if (needsGw && !hasIntegrated) {
      items.unshift({ ref: "UG800", qty: 1, roomId: null,
        reason: "The brain of the system: phone control, alerts, shared access.", auto: true });
    }

    /* Répéteur RE600 (règle Mathieu : >15 appareils / murs épais /
       étage à franchir / wifi faible) — ajouté d'office, retirable. */
    const rep = repeaterAdvice(a, items);
    if (rep.needed && items.some(it => it.ref === "UG800")) {
      items.push({ ref: "RE600", qty: rep.qty, roomId: null,
        reason: rep.reasons.join(" · "), auto: true, removable: true });
    }

    return {
      id: levelId,
      items,
      total: totalOf(items),
      deviceCount: items.reduce((s, it) => s + it.qty, 0)
    };
  }

  function buildLevels(a) {
    const levels = {};
    ["essential", "comfort", "premium"].forEach(l => { levels[l] = buildLevel(a, l); });
    return levels;
  }

  /* ---------- Options / packs (jamais mélangés aux niveaux, P24) ---------- */

  function buildPacks(a) {
    const packs = [];
    const rooms = a.rooms || [];
    const windows = a.windows || 0;

    /* Pilotage générateur — RX30RF (règle Mathieu : pour les deux
       univers, connecte circulateur / PAC / vannes). Pré-coché si le
       générateur est accessible. */
    const gen = MKT.generators[a.generator] || {};
    if (gen.pilotVia === "RX30RF") {
      packs.push({
        id: "boilerPilot", name: CAT.packs.boilerPilot.name,
        tagline: CAT.packs.boilerPilot.tagline,
        items: [{ ref: "RX30RF", qty: 1 }],
        total: price("RX30RF"),
        preChecked: a.boilerAccessible === "yes",
        note: a.boilerAccessible === "yes"
          ? "Your heat source is accessible: the receiver is straightforward to fit."
          : "To be confirmed depending on access to your heat source."
      });
    }

    /* Pack sécurité — détecteurs de fenêtre (nb fenêtres) + présence */
    if (windows > 0 || rooms.length > 0) {
      const qty = Math.max(windows, 1);
      packs.push({
        id: "security", name: CAT.packs.security.name,
        tagline: CAT.packs.security.tagline,
        items: [{ ref: "OS600", qty }, { ref: "MS600", qty: 1 }],
        total: price("OS600") * qty + price("MS600"),
        preChecked: false,
        note: `${qty} opening sensor${qty > 1 ? "s" : ""} (your ${windows || "?"} windows) + 1 presence sensor.`
      });
    }

    /* Pack volets roulants */
    packs.push({
      id: "shutters", name: CAT.packs.shutters.name,
      tagline: CAT.packs.shutters.tagline,
      items: [{ ref: "RS600", qty: Math.max(1, Math.min(rooms.length, 4)) }],
      total: price("RS600") * Math.max(1, Math.min(rooms.length, 4)),
      preChecked: false,
      note: "One module per shutter to motorise (quantity adjustable)."
    });

    /* Prise intelligente — relais SR600 dans la prise */
    packs.push({
      id: "smartplug", name: CAT.packs.smartplug.name,
      tagline: CAT.packs.smartplug.tagline,
      items: [{ ref: "SR600", qty: 1 }],
      total: price("SR600"),
      preChecked: false,
      note: "The relay sits inside the existing socket - the socket stays yours."
    });

    return packs;
  }

  /* ---------- Répéteur (règle Mathieu) ---------- */

  function repeaterAdvice(a, items) {
    const reasons = [];
    const zigbeeCount = (items || []).reduce((s, it) =>
      s + ((P()[it.ref] || {}).protocol === "zigbee" ? it.qty : 0), 0);
    if (zigbeeCount > 15) reasons.push(`more than 15 wireless devices (${zigbeeCount})`);
    if (a.walls === "thick") reasons.push("thick walls (stone / concrete)");
    if ((a.floors || 0) >= 1) reasons.push("a floor to cross");
    if (a.wifiQuality === "weak_spots" || a.wifiQuality === "has_repeaters")
      reasons.push("areas where wi-fi already struggles");
    const needed = reasons.length > 0;
    const qty = needed ? Math.max(a.floors || 0, Math.ceil(Math.max(zigbeeCount - 15, 0) / 15), 1) : 0;
    return { needed, qty, reasons: reasons.map(r => "Repeater advised: " + r + ".") };
  }

  /* ---------- Compatibilité 3 états (P1) ---------- */

  /* Vérifie un produit candidat contre la configuration courante.
     Retourne { state: "ok"|"limit"|"no", reason, missingRef? } */
  function compatCheck(a, items, candidateRef) {
    const prod = P()[candidateRef];
    if (!prod) return { state: "no", reason: "Reference not in the BETA catalogue." };

    const hasGateway = items.some(it => it.ref === "UG800") ||
                       items.some(it => (P()[it.ref] || {}).integratedGateway);

    if (prod.needsGateway && !hasGateway) {
      return {
        state: "no",
        reason: `This product needs a gateway to be controlled from your phone - add the UG800 or pick the standalone model.`,
        missingRef: "UG800"
      };
    }
    if (prod.power === "230v" && prod.role === "roomstat" && a.hasThermostatWiring !== "yes") {
      return {
        state: "limit",
        reason: "Wired version: a 230 V supply is needed at the wall - otherwise prefer the wireless version."
      };
    }
    if (prod.ref === "CB500CO" && a.hasThermostatWiring !== "yes") {
      return {
        state: "limit",
        reason: "Wired centre: conduits must run from the thermostats to the manifold - otherwise prefer the wireless CB12RF."
      };
    }
    if (prod.limits && prod.limits.maxZones && (a.rooms || []).length > prod.limits.maxZones) {
      return {
        state: "limit",
        reason: `Limited to ${prod.limits.maxZones} zones - your project has ${(a.rooms || []).length}.`
      };
    }
    return { state: "ok", reason: "" };
  }

  /* Alternatives « Autre choix » (P7) : même rôle, compatibles,
     avec écart de prix et de fonction en une ligne. */
  function alternativesFor(a, items, item) {
    const prod = P()[item.ref];
    if (!prod) return [];
    const list = CAT.alternatives[prod.role] || [];
    return list.filter(ref => ref !== item.ref).map(ref => {
      const alt = P()[ref];
      const check = compatCheck(a, items, ref);
      const delta = (alt.price - prod.price) * item.qty;
      return {
        ref, name: alt.name, price: alt.price, delta,
        deltaLabel: delta === 0 ? "same price" : (delta > 0 ? `+${delta} €` : `${delta} €`),
        functionDelta: alt.descUser,
        state: check.state, reason: check.reason, missingRef: check.missingRef,
        img: alt.img, refToConfirm: alt.refToConfirm
      };
    });
  }

  /* ---------- Complétude (P1) : le système peut-il fonctionner ? ---------- */

  function completeness(a, items) {
    const missing = [];
    const hasGateway = items.some(it => it.ref === "UG800") ||
                       items.some(it => (P()[it.ref] || {}).integratedGateway);
    if (items.some(it => (P()[it.ref] || {}).needsGateway) && !hasGateway) {
      missing.push({
        ref: "UG800",
        reason: "Your connected devices need the UG800 gateway to work together."
      });
    }
    const hasUfhStat = items.some(it => it.roomId && (P()[it.ref] || {}).role === "roomstat" &&
      (a.rooms || []).some(r => r.id === it.roomId && r.emitter === "ufh_water"));
    const hasWc = items.some(it => (P()[it.ref] || {}).role === "wiringCentre");
    if (hasUfhStat && !hasWc) {
      missing.push({
        ref: "CB12RF",
        reason: "Underfloor heating needs its wiring centre to open and close the loops."
      });
    }
    return missing;
  }

  /* ---------- Dossier qualifié (P9 / P15) ---------- */

  function qualifiedFileCheck(a) {
    const reasons = [];
    if (a.homeType === "tertiary")
      reasons.push("Commercial building: sizing to be validated by a technician.");
    if ((a.rooms || []).length > MKT.qualifiedFileTriggers.maxAutoZones)
      reasons.push(`More than ${MKT.qualifiedFileTriggers.maxAutoZones} zones: beyond the automatic journey.`);
    const gen = MKT.generators[a.generator];
    if (gen && gen.covered === false)
      reasons.push(gen.uncoveredNote || `Heat source "${gen.label}": human validation required.`);
    (a.rooms || []).forEach(r => {
      const em = MKT.emitters[r.emitter];
      if (em && em.covered === false && !reasons.some(x => x.includes(em.label)))
        reasons.push(em.uncoveredNote || `Emitter "${em.label}": human validation required.`);
    });
    if (a.hasBMS === "yes")
      reasons.push("A BMS (building management system) is in place: the integration must be studied.");
    return { qualified: reasons.length > 0, reasons };
  }

  /* ---------- Économies (P20) — fourchette, jamais un chiffre unique ---------- */

  function savings(a, levelId) {
    const surface = a.surface || 100;
    const period = COPY.consumptionByPeriod[a.constructionPeriod] || COPY.consumptionByPeriod.p1990_2005;
    const eurKwh = COPY.energyPrice[a.generator] != null ? COPY.energyPrice[a.generator] : 0.12;
    const rangeKey = a.perRoomControl === "yes" ? levelId : "standalone";
    const [lo, hi] = COPY.savingsRange[rangeKey] || COPY.savingsRange.comfort;
    const annualCost = surface * period.kwhM2 * eurKwh;
    return {
      pctLow: lo, pctHigh: hi,
      eurLow: Math.round(annualCost * lo / 100 / 10) * 10,
      eurHigh: Math.round(annualCost * hi / 100 / 10) * 10,
      annualCost: Math.round(annualCost / 10) * 10,
      basis: `${surface} m² · ${period.label} · ${period.kwhM2} kWh/m²/an · ${eurKwh.toFixed(2)} €/kWh`
    };
  }

  /* ---------- Estimation précoce (P8) : dès l'étape Mon chauffage ---------- */

  function earlyEstimate(a) {
    if (!a.rooms || !a.rooms.length || !a.rooms.some(r => r.emitter)) return null;
    const guess = Object.assign({
      perRoomControl: "yes", remote: "yes", alerts: "no", sharing: "no"
    }, a);
    const lvl = buildLevel(guess, "comfort");
    return { total: lvl.total, deviceCount: lvl.deviceCount, items: lvl.items };
  }

  /* ---------- Agrégation d'affichage ---------- */

  function aggregate(items) {
    const map = new Map();
    items.forEach(it => {
      const k = it.ref;
      if (!map.has(k)) map.set(k, { ref: k, qty: 0, reasons: [], auto: it.auto, removable: it.removable, rooms: [] });
      const e = map.get(k);
      e.qty += it.qty;
      if (it.reason && !e.reasons.includes(it.reason)) e.reasons.push(it.reason);
      if (it.roomId) e.rooms.push(it.roomId);
    });
    return Array.from(map.values());
  }

  /* ---------- Recherche remplacement (P14) — tolérante aux fautes ---------- */

  function levenshtein(s, t) {
    s = s.toLowerCase(); t = t.toLowerCase();
    const m = s.length, n = t.length;
    if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++)
      for (let j = 1; j <= n; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
          d[i - 1][j - 1] + (s[i - 1] === t[j - 1] ? 0 : 1));
    return d[m][n];
  }

  function searchReplacement(query) {
    if (!query || query.trim().length < 2) return [];
    const qTokens = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return COPY.replacements
      .map(r => {
        const hTokens = (r.brand + " " + r.from).toLowerCase().split(/\s+/);
        let score = 0, ok = true;
        qTokens.forEach(qt => {
          let best = Infinity;
          hTokens.forEach(ht => {
            const d = (ht.includes(qt) || qt.includes(ht)) ? 0 : levenshtein(qt, ht);
            if (d < best) best = d;
          });
          if (best > (qt.length <= 3 ? 1 : 2)) ok = false;
          score += best;
        });
        return { r, ok, score };
      })
      .filter(x => x.ok)
      .sort((a, b) => a.score - b.score)
      .map(x => x.r);
  }

  const Engine = {
    buildAbstractSystem, wantsConnected, buildLevel, buildLevels, buildPacks,
    repeaterAdvice, compatCheck, alternativesFor, completeness,
    qualifiedFileCheck, savings, earlyEstimate, aggregate,
    searchReplacement, totalOf, price, loopsFor, mainLivingRoom
  };

  if (typeof window !== "undefined") window.SalusEngine = Engine;
  if (typeof module !== "undefined" && module.exports) module.exports = Engine;
})();
