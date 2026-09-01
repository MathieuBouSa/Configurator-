/* ============================================================
   SALUS Configurator BETA — Heat sources & emitters by market
   ------------------------------------------------------------
   Mathieu's requirement: no country selector, but the
   questionnaire covers the heat sources (hot & cold) and the
   emitters found across the 5 markets FR / UK / DE / RO / DK -
   including those Salus has no product for yet: in that case
   `covered:false` sends the journey to the qualified file
   (human takeover, workshop solutions P9/P15).
   ============================================================ */

globalThis.SALUS_MARKETS = {

  countries: ["FR", "UK", "DE", "RO", "DK"],

  /* Heat / cold sources.
     markets  : where this source is common (backstage info)
     covered  : true = the BETA can compose a system
     pilotVia : how Salus controls this source */
  generators: {
    gas_boiler: {
      id: "gas_boiler", label: "Gas boiler",
      hint: "Wall-hung or floor-standing - the most common in France and the UK.",
      markets: ["FR", "UK", "DE", "RO"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-gaz.png"
    },
    oil_boiler: {
      id: "oil_boiler", label: "Oil boiler",
      hint: "Still frequent in older houses, especially in Germany.",
      markets: ["FR", "DE"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-fioul.png"
    },
    heat_pump_aw: {
      id: "heat_pump_aw", label: "Air-to-water heat pump",
      hint: "Heats the water in your radiators or underfloor circuits.",
      markets: ["FR", "DE", "DK", "UK"], covered: true,
      pilotVia: "RX30RF", img: "assets/questions/gen-pac-eau.png"
    },
    heat_pump_aa: {
      id: "heat_pump_aa", label: "Air-to-air heat pump (AC)",
      hint: "Blows warm or cool air - ducted or split units.",
      markets: ["FR", "UK", "RO"], covered: true,
      pilotVia: "RSQ800WRF", img: "assets/questions/gen-pac-air.png"
    },
    electric: {
      id: "electric", label: "All electric",
      hint: "Electric radiators or electric floor, no boiler.",
      markets: ["FR", "RO", "UK"], covered: true,
      pilotVia: null, img: "assets/questions/gen-electrique.png"
    },
    district: {
      id: "district", label: "District heating",
      hint: "Hot water arrives from outside (very common in Denmark and Romania).",
      markets: ["DK", "RO", "DE"], covered: true,
      pilotVia: "RX30RF", coveredNote: "Inlet valve control and room-by-room regulation; the primary connection still needs a technician to validate it.",
      img: "assets/questions/gen-reseau.png"
    },
    biomass: {
      id: "biomass", label: "Wood or pellet stove / boiler",
      hint: "Logs, pellets, biomass.",
      markets: ["FR", "DE", "RO", "DK"], covered: false,
      pilotVia: null,
      uncoveredNote: "Biomass heat sources need case-by-case validation (thermal inertia, heat dump safety): the configurator prepares a qualified file for a Salus technician.",
      img: "assets/questions/gen-bois.png"
    },
    unknown: {
      id: "unknown", label: "I don't know",
      hint: "The configurator adapts - a photo will be enough later on.",
      markets: ["FR", "UK", "DE", "RO", "DK"], covered: true,
      pilotVia: null, img: "assets/questions/gen-inconnu.png"
    }
  },

  /* Emitters - what spreads the heat (or the cool) into the rooms */
  emitters: {
    water_radiators: {
      id: "water_radiators", label: "Water radiators",
      hint: "Connected to a boiler, a heat pump or district heating.",
      markets: ["FR", "UK", "DE", "RO", "DK"], covered: true,
      img: "assets/questions/emit-radiateur-eau.png"
    },
    ufh_water: {
      id: "ufh_water", label: "Water underfloor heating",
      hint: "Hot water circuits in the slab, with a manifold.",
      markets: ["FR", "DE", "DK"], covered: true,
      img: "assets/questions/emit-plancher-eau.png"
    },
    ufh_electric: {
      id: "ufh_electric", label: "Electric underfloor heating",
      hint: "Electric mat under the floor covering.",
      markets: ["FR", "UK", "RO"], covered: true,
      img: "assets/questions/emit-plancher-elec.png"
    },
    electric_radiators: {
      id: "electric_radiators", label: "Electric radiators",
      hint: "Radiant panels, convectors, storage heaters - with pilot wire.",
      markets: ["FR", "RO", "UK"], covered: true,
      img: "assets/questions/emit-radiateur-elec.png"
    },
    ducted_ac: {
      id: "ducted_ac", label: "Ducted air conditioning",
      hint: "Air blown through grilles, unit hidden in the loft or false ceiling.",
      markets: ["FR", "UK", "RO"], covered: true,
      img: "assets/questions/emit-gainable.png"
    },
    fan_coils: {
      id: "fan_coils", label: "Fan coil units",
      hint: "Wall or console water units - frequent in commercial buildings.",
      markets: ["FR", "RO", "DE"], covered: false,
      uncoveredNote: "Fan coil units need an integration study: the configurator prepares a qualified file for a Salus technician.",
      img: "assets/questions/emit-ventilo.png"
    }
  },

  /* Criteria that take a project out of the automatic journey
     (solution P15 - never a dead end, always a qualified file) */
  qualifiedFileTriggers: {
    maxAutoZones: 12,
    buildingTypes: ["tertiary"],
    notes: "Beyond 12 zones, a commercial building, an uncovered heat source or emitter, or an existing BMS: the configurator prepares the file and a Salus technician validates it (call back within 48 h)."
  }
};
