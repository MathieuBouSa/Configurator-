/* ============================================================
   SALUS Configurator BETA — Copy, benefits, equivalences
   ------------------------------------------------------------
   Editorial content: room-by-room benefit sentences (P21), the
   4 real-life situations (P12/P13), the replacement equivalence
   table (P14), fictional Club Pro installers (P18), savings
   method (P19). Anything marked [BETA] is fictional.
   ============================================================ */

globalThis.SALUS_COPY = {

  /* --- 4 real-life situations (solution P13) - shown at the
     moment the connectivity questions come up, never on a
     separate information page --- */
  situations: [
    {
      id: "train",
      text: "I'm coming home earlier than planned, so I start the heating from the train.",
      icon: "mdi:train"
    },
    {
      id: "gel",
      text: "My holiday house drops below 5 C and I get an alert before the pipes freeze.",
      icon: "mdi:snowflake-alert"
    },
    {
      id: "installateur",
      text: "My installer fixes my schedule without coming out, so there is no call-out fee.",
      icon: "mdi:remote-desktop"
    },
    {
      id: "voiture",
      text: "I leave for the weekend having forgotten to turn it down, so I do it from the car.",
      icon: "mdi:car-connected"
    }
  ],

  /* --- Room-by-room benefits (solution P22) - the sentence uses
     the room the customer entered himself --- */
  roomBenefits: {
    sejour:   (name) => `Your ${name} at 21 C in the evening, only when you are in it.`,
    chambre:  (name) => `Your ${name} at 18 C overnight and 20 C when you wake up.`,
    sdb:      (name) => `Your ${name} warm 30 minutes before your shower.`,
    cuisine:  (name) => `Your ${name} tempered around mealtimes, without heating for nothing.`,
    bureau:   (name) => `Your ${name} at 20 C on working-from-home days, 17 C the rest of the time.`,
    autre:    (name) => `Your ${name} held at 16 C without you thinking about it.`
  },

  /* --- Replacement module (solution P14): equivalence table.
     from        : product already installed, typed by the customer
     to          : Salus equivalent
     alsoNeeds   : additional products required
     note        : what changes in daily use --- */
  replacements: [
    {
      brand: "Delta Dore", from: "Tybox 1117", to: "RT520",
      alsoNeeds: [], wiring: "The existing wiring can be reused as it is.",
      note: "Same wired wall mounting; programming goes from 2 to 6 periods per day."
    },
    {
      brand: "Delta Dore", from: "Tybox 5101", to: "RT520RF",
      alsoNeeds: [], wiring: "The Salus receiver replaces the Delta Dore receiver next to the boiler.",
      note: "Equivalent radio range, with a backlit screen on top."
    },
    {
      brand: "Netatmo", from: "Netatmo Thermostat", to: "IT700",
      alsoNeeds: [], wiring: "The Netatmo relay is replaced by the iT700 receiver (built-in gateway).",
      note: "Phone control is kept, the subscription is gone."
    },
    {
      brand: "Tado", from: "Tado V3+", to: "IT800WIFI",
      alsoNeeds: [], wiring: "The Tado bridge disappears: the gateway is built into the receiver.",
      note: "Geolocation and history kept, with no subscription."
    },
    {
      brand: "Tado", from: "Tado SRT head", to: "TRV3RF",
      alsoNeeds: ["UG800"], wiring: "Same M30 thread: the head is swapped in 2 minutes.",
      note: "Needs the UG800 gateway for remote control."
    },
    {
      brand: "Honeywell", from: "T6R", to: "IT700",
      alsoNeeds: [], wiring: "The Honeywell receiver is replaced by the iT700 receiver.",
      note: "Salus app instead of Resideo."
    },
    {
      brand: "Honeywell", from: "evohome", to: "UG800",
      alsoNeeds: ["TRV3RF", "SQ610RF"], wiring: "Each evohome head is replaced by a TRV3RF, the controller by the UG800.",
      note: "Room-by-room multizone is kept; quote depends on the number of radiators."
    },
    {
      brand: "Salus (legacy)", from: "RT500RF", to: "RT520RF",
      alsoNeeds: [], wiring: "The receiver wires onto the same terminals.",
      note: "Direct replacement of the previous Salus generation."
    },
    {
      brand: "Salus (legacy)", from: "iT500", to: "IT800WIFI",
      alsoNeeds: [], wiring: "The iT500 gateway disappears: it is built into the new receiver.",
      note: "Modernised app, same day-to-day use."
    },
    {
      brand: "Salus (legacy)", from: "SQ605", to: "SQ610",
      alsoNeeds: [], wiring: "Identical back box, wiring reused.",
      note: "Slimmer screen, plus a Zigbee repeater function."
    }
  ],

  /* --- Fictional Club Pro installers (solution P18) - routed by
     postcode. FICTIONAL BETA DATA. --- */
  clubPro: [
    { name: "Chauffage Martin & Fils", city: "In your area", badge: "Club Pro", rating: "4.8/5" },
    { name: "Ets Thermiconfort",       city: "In your area", badge: "Club Pro", rating: "4.7/5" },
    { name: "SARL Calor Habitat",      city: "In your area", badge: "Club Pro", rating: "4.6/5" }
  ],
  distributors: ["Espace Aubade", "Algorel", "Richardson"],

  /* --- Savings method (solution P20) - EN 15232, FICTIONAL --- */
  savingsMethod: {
    standard: "EN 15232 - efficiency classes of control systems",
    text: "The estimate compares your home's current control class (from your answers) with the class reached by the proposed solution, using the efficiency factors of the EN 15232 standard, applied to a heating consumption estimated from floor area, construction period and energy used. The result is a range: the real figure depends on how the home is actually used.",
    betaNote: "/!\\ BETA build: fictional coefficients and energy prices, for demonstration only."
  },

  /* Estimated consumption (kWh/m2/year) by construction period - FICTIONAL */
  consumptionByPeriod: {
    avant1975: { label: "Before 1975", kwhM2: 180 },
    p1975_1990: { label: "1975 - 1990", kwhM2: 150 },
    p1990_2005: { label: "1990 - 2005", kwhM2: 120 },
    p2005_2012: { label: "2005 - 2012", kwhM2: 90 },
    apres2012: { label: "After 2012", kwhM2: 60 }
  },

  /* Energy price EUR/kWh - FICTIONAL BETA */
  energyPrice: {
    gas_boiler: 0.11, oil_boiler: 0.13, heat_pump_aw: 0.08,
    heat_pump_aa: 0.08, electric: 0.25, district: 0.10, biomass: 0.07, unknown: 0.12
  },

  /* Savings ranges (%) by level - FICTIONAL, inspired by EN 15232 */
  savingsRange: {
    essential: [8, 14],
    comfort: [12, 18],
    premium: [15, 25],
    standalone: [10, 15]
  },

  /* --- Room types (room builder, My home step) --- */
  roomTypes: [
    { id: "sejour",  label: "Living room",  living: true,  icon: "mdi:sofa" },
    { id: "cuisine", label: "Kitchen",      living: false, icon: "mdi:stove" },
    { id: "chambre", label: "Bedroom",      living: true,  icon: "mdi:bed" },
    { id: "bureau",  label: "Study",        living: true,  icon: "mdi:desk" },
    { id: "sdb",     label: "Bathroom",     living: false, icon: "mdi:shower" },
    { id: "autre",   label: "Other room",   living: false, icon: "mdi:door" }
  ],

  /* --- Demo scenario: 5-room house,
     underfloor downstairs + water radiators upstairs, gas
     boiler, remote control --- */
  demoScenario: {
    label: "Demo scenario - mixed house",
    description: "5-room house / underfloor heating downstairs / water radiators upstairs / gas boiler / remote control",
    answers: {
      profile: "user",
      homeType: "house",
      surface: 120,
      floors: 1,
      walls: "standard",
      windows: 8,
      wifiQuality: "weak_spots",
      rooms: [
        { id: 1, type: "sejour",  name: "Living room", floor: 0, emitter: "ufh_water" },
        { id: 2, type: "cuisine", name: "Kitchen",     floor: 0, emitter: "ufh_water" },
        { id: 3, type: "chambre", name: "Bedroom 1",   floor: 1, emitter: "water_radiators", radiators: 1 },
        { id: 4, type: "chambre", name: "Bedroom 2",   floor: 1, emitter: "water_radiators", radiators: 1 },
        { id: 5, type: "sdb",     name: "Bathroom",    floor: 1, emitter: "water_radiators", radiators: 1 }
      ],
      generator: "gas_boiler",
      boilerAccessible: "yes",
      hasThermostatWiring: "no",
      perRoomControl: "yes",
      remote: "yes", alerts: "yes", sharing: "no",
      presence: "away_weekdays",
      constructionPeriod: "p1990_2005",
      currentControl: "single_stat",
      budget: null,
      postalCode: "69100"
    }
  },

  /* --- Journey steps (solution P4) --- */
  steps: [
    { id: "home",     label: "My home" },
    { id: "heating",  label: "My heating" },
    { id: "habits",   label: "My habits" },
    { id: "solution", label: "My solution" }
  ],

  /* --- Document labels (documentation matrix P14) --- */
  docLabels: {
    fiche: "Product sheet",
    notice_pose: "Installation manual",
    notice_user: "User manual",
    schema_cablage: "Wiring diagram",
    doc_conformite: "Declaration of conformity",
    video_install: "Installation video",
    video_choix: "Overview video"
  }
};
