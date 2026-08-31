/* ============================================================
   SALUS Configurateur BETA — Générateurs & émetteurs par marché
   ------------------------------------------------------------
   Exigence Mathieu : pas de sélecteur de pays, mais le
   questionnaire couvre les générateurs (chaud & froid) et les
   émetteurs rencontrés sur les 5 marchés FR / UK / DE / RO / DK
   — y compris quand aucun produit Salus n'y répond encore :
   dans ce cas `covered:false` fait basculer le parcours vers le
   dossier qualifié (reprise humaine, solutions P9/P15).
   ============================================================ */

globalThis.SALUS_MARKETS = {

  countries: ["FR", "UK", "DE", "RO", "DK"],

  /* Générateurs de chaleur / froid.
     markets  : où ce générateur est courant (info coulisses)
     covered  : true = la BETA sait composer un système
     pilotVia : comment Salus pilote ce générateur */
  generators: {
    gas_boiler: {
      id: "gas_boiler", label: "Chaudière gaz",
      hint: "Murale ou au sol — la plus répandue en France et au Royaume-Uni.",
      markets: ["FR", "UK", "DE", "RO"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-gaz.png"
    },
    oil_boiler: {
      id: "oil_boiler", label: "Chaudière fioul",
      hint: "Encore fréquente en maison ancienne, surtout en Allemagne.",
      markets: ["FR", "DE"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-fioul.png"
    },
    heat_pump_aw: {
      id: "heat_pump_aw", label: "Pompe à chaleur air / eau",
      hint: "Chauffe l'eau des radiateurs ou du plancher.",
      markets: ["FR", "DE", "DK", "UK"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-pac-eau.png"
    },
    heat_pump_aa: {
      id: "heat_pump_aa", label: "Pompe à chaleur air / air (clim)",
      hint: "Souffle de l'air chaud ou froid — gainable ou splits.",
      markets: ["FR", "UK", "RO"], covered: true,
      pilotVia: "RSQ800WRF", img: "assets/questions/gen-pac-air.png"
    },
    electric: {
      id: "electric", label: "Tout électrique",
      hint: "Radiateurs électriques ou plancher électrique, sans chaudière.",
      markets: ["FR", "RO", "UK"], covered: true,
      pilotVia: null, img: "assets/questions/gen-electrique.png"
    },
    district: {
      id: "district", label: "Réseau de chaleur urbain",
      hint: "L'eau chaude arrive de l'extérieur (très courant au Danemark et en Roumanie).",
      markets: ["DK", "RO", "DE"], covered: true,
      pilotVia: "RX30RF", coveredNote: "Pilotage de la vanne d'arrivée et régulation pièce par pièce ; le raccordement primaire reste à valider par un technicien.",
      img: "assets/questions/gen-reseau.png"
    },
    biomass: {
      id: "biomass", label: "Poêle ou chaudière bois / granulés",
      hint: "Bois bûche, granulés, biomasse.",
      markets: ["FR", "DE", "RO", "DK"], covered: false,
      pilotVia: null,
      uncoveredNote: "Les générateurs biomasse demandent une validation au cas par cas (inertie, sécurité de décharge) : le configurateur prépare un dossier qualifié pour un technicien Salus.",
      img: "assets/questions/gen-bois.png"
    },
    unknown: {
      id: "unknown", label: "Je ne sais pas",
      hint: "Le configurateur s'adapte — une photo suffira plus tard.",
      markets: ["FR", "UK", "DE", "RO", "DK"], covered: true,
      pilotVia: null, img: "assets/questions/gen-inconnu.png"
    }
  },

  /* Émetteurs — ce qui diffuse le chaud (ou le froid) dans les pièces */
  emitters: {
    water_radiators: {
      id: "water_radiators", label: "Radiateurs à eau",
      hint: "Reliés à une chaudière, une PAC ou un réseau de chaleur.",
      markets: ["FR", "UK", "DE", "RO", "DK"], covered: true,
      img: "assets/questions/emit-radiateur-eau.png"
    },
    ufh_water: {
      id: "ufh_water", label: "Plancher chauffant à eau",
      hint: "Circuits d'eau chaude dans la dalle, avec un collecteur.",
      markets: ["FR", "DE", "DK"], covered: true,
      img: "assets/questions/emit-plancher-eau.png"
    },
    ufh_electric: {
      id: "ufh_electric", label: "Plancher chauffant électrique",
      hint: "Trame électrique sous le revêtement.",
      markets: ["FR", "UK", "RO"], covered: true,
      img: "assets/questions/emit-plancher-elec.png"
    },
    electric_radiators: {
      id: "electric_radiators", label: "Radiateurs électriques",
      hint: "Panneaux rayonnants, convecteurs, inertie — avec fil pilote.",
      markets: ["FR", "RO", "UK"], covered: true,
      img: "assets/questions/emit-radiateur-elec.png"
    },
    ducted_ac: {
      id: "ducted_ac", label: "Climatisation gainable",
      hint: "Air soufflé par des grilles, unité cachée dans les combles ou faux plafond.",
      markets: ["FR", "UK", "RO"], covered: true,
      img: "assets/questions/emit-gainable.png"
    },
    fan_coils: {
      id: "fan_coils", label: "Ventilo-convecteurs",
      hint: "Unités murales ou consoles à eau — fréquents en tertiaire.",
      markets: ["FR", "RO", "DE"], covered: false,
      uncoveredNote: "Les ventilo-convecteurs demandent une étude d'intégration : le configurateur prépare un dossier qualifié pour un technicien Salus.",
      img: "assets/questions/emit-ventilo.png"
    }
  },

  /* Critères qui sortent un projet du parcours automatique
     (solution P15 — jamais un blocage, toujours un dossier qualifié) */
  qualifiedFileTriggers: {
    maxAutoZones: 12,
    buildingTypes: ["tertiary"],
    notes: "Au-delà de 12 zones, bâtiment tertiaire / commercial, générateur ou émetteur non couvert, ou GTB existante : le configurateur prépare le dossier et un technicien Salus valide (rappel sous 48 h)."
  }
};
