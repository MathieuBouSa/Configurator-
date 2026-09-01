/* ============================================================
   SALUS Configurator BETA — Product catalogue
   ------------------------------------------------------------
   /!\ ALL PRICES ARE FICTIONAL (BETA build, internal demo).
   Product references are real.
   Each product exposes:
   - role        : role in the abstract system (see engine.js)
   - protocol    : zigbee | rf | wifi | wired | none
   - needsGateway / integratedGateway / worksStandalone
   - zigbeeRepeater : the 230 V product extends the Zigbee mesh
   - limits      : quantity constraints
   - solution    : "what it is for" in one sentence (Mathieu's
                   rule: anything going through the UG800 is
                   presented as a solution, not a part number)
   ============================================================ */

globalThis.SALUS_CATALOG = {

  products: {

    /* ----- Core of the connected system ----- */
    UG800: {
      ref: "UG800", name: "Zigbee / Wi-Fi gateway",
      role: "gateway", price: 89,
      protocol: "zigbee", power: "230v",
      needsGateway: false, worksStandalone: true, zigbeeRepeater: true,
      limits: { maxDevices: 100 },
      img: "assets/products/ug800.png",
      solution: "The brain of your installation: it connects every Salus device to the internet so you can control them from your phone, get alerts and share access.",
      descUser: "A small box plugged into your internet router. Without it, every device is set by hand.",
      descPro: "Zigbee 3.0 / Wi-Fi gateway, up to 100 devices, QR pairing, Salus cloud API.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    TRV3RF: {
      ref: "TRV3RF", name: "Connected thermostatic head",
      role: "trv", price: 79,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/trv3rf.png",
      solution: "Replaces the head on your radiator valve: every radiator follows its own temperature, room by room.",
      descUser: "Screws on in place of the current head (standard M30 thread). Runs on batteries.",
      descPro: "Zigbee head M30x1.5, Danfoss RA/RAV/RAVL adapters supplied, open-window detection.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install", "video_choix"]
    },

    "TRV3RF-AB": {
      ref: "TRV3RF-AB", name: "Auto-balancing thermostatic head",
      refToConfirm: true,
      role: "trv", price: 99,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/trv3rf-ab.png",
      solution: "Same as the TRV3RF, but it shares the flow between radiators on its own: no more balancing the circuit by hand.",
      descUser: "Ideal if some radiators run too hot and others stay cold.",
      descPro: "Dynamic flow balancing by gradient measurement - removes manual balancing at the lockshield valve.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    SQ610: {
      ref: "SQ610", name: "Quantum wired thermostat",
      role: "roomstat", price: 119,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sq610.png",
      solution: "The control screen for a room: room temperature measured and set to a tenth of a degree.",
      descUser: "Ultra-slim (10 mm), powered by 230 V, fixed to the wall.",
      descPro: "Wired / 230 V - also acts as a Zigbee repeater. Output to wiring centre or receiver.",
      variantOf: null,
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    SQ610B: {
      ref: "SQ610B", name: "Quantum wired thermostat - black",
      role: "roomstat", price: 119,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sq610b.png",
      solution: "The same Quantum wired thermostat, in black.",
      descUser: "Black version of the SQ610.",
      descPro: "Identical to the SQ610, black finish.",
      variantOf: "SQ610",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    SQ610RF: {
      ref: "SQ610RF", name: "Quantum wireless thermostat",
      role: "roomstat", price: 129,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/sq610rf.png",
      solution: "The room thermostat you can put anywhere: USB-C rechargeable, magnetic wall mount.",
      descUser: "No cable to run: stands on a shelf or clips magnetically to the wall.",
      descPro: "Zigbee, USB-C rechargeable battery, magnetic mount, pairs directly with UG800 or CB12RF.",
      variantOf: null,
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    SQ610BRF: {
      ref: "SQ610BRF", name: "Quantum wireless thermostat - black",
      role: "roomstat", price: 129,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/sq610brf.png",
      solution: "The same Quantum wireless thermostat, in black.",
      descUser: "Black version of the SQ610RF.",
      descPro: "Identical to the SQ610RF, black finish.",
      variantOf: "SQ610RF",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    RX30RF: {
      ref: "RX30RF", name: "Boiler / heat source receiver",
      role: "boilerReceiver", price: 79,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/rx30rf.png",
      solution: "The link to your heat source: it starts and stops the boiler, the heat pump, the pump or a valve exactly when your rooms ask for it.",
      descUser: "Installed next to the boiler. No more heating for nothing when no room is calling.",
      descPro: "Zigbee volt-free receiver - boiler, heat pump (start contact), circulating pump, zone valve.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    },

    /* ----- Underfloor heating ----- */
    CB12RF: {
      ref: "CB12RF", name: "Underfloor wiring centre - wireless",
      role: "wiringCentre", price: 249,
      protocol: "zigbee", power: "230v",
      needsGateway: false, worksStandalone: true, zigbeeRepeater: true,
      limits: { maxZones: 12 },
      img: "assets/products/cb12rf.png",
      solution: "The conductor of the underfloor system: it opens and closes each manifold loop on demand from each room, with no wires to the thermostats.",
      descUser: "Installed near the underfloor manifold. Every room becomes adjustable on its own.",
      descPro: "12 zones max, wireless link to thermostats, built-in pump + boiler control, expandable.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    },

    CB500CO: {
      ref: "CB500CO", name: "Underfloor wiring centre - wired",
      role: "wiringCentre", price: 199,
      protocol: "wired", power: "230v",
      needsGateway: false, worksStandalone: true,
      limits: { maxZones: 8 },
      img: "assets/products/cb500co.png",
      solution: "The same underfloor orchestration, in a wired version: ideal when the conduits are already in place.",
      descUser: "Chosen when cables already run from the thermostats to the manifold.",
      descPro: "Wired wiring centre, 230 V thermostats connected directly, pump control.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    T30NC: {
      ref: "T30NC", name: "Thermal loop actuator",
      refToConfirm: true,
      role: "actuator", price: 25,
      protocol: "none", power: "230v",
      needsGateway: false,
      img: "assets/products/t30nc.png",
      solution: "The muscle of the manifold: one actuator per loop opens or closes the circuit for its room.",
      descUser: "A small part screwed onto the underfloor manifold - one per circuit.",
      descPro: "230 V NC thermal actuator, M30x1.5, mounted on the manifold return.",
      docs: ["fiche", "notice_pose"]
    },

    THB: {
      ref: "THB", name: "Auto-balancing actuator",
      refToConfirm: true,
      role: "actuator", price: 49,
      protocol: "none", power: "230v",
      needsGateway: false,
      img: "assets/products/thb.png",
      solution: "The smart actuator: it balances the flow of every underfloor loop by itself - no more rooms too hot or too cold.",
      descUser: "Replaces the standard actuator for steadier comfort.",
      descPro: "Auto-balancing actuator: return flow measurement and continuous adjustment, removes manual balancing.",
      docs: ["fiche", "notice_pose"]
    },

    /* ----- Electric heating ----- */
    EL600F: {
      ref: "EL600F", name: "Electric heating thermostat - pilot wire",
      role: "electricStat", price: 99,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/el600f.png",
      solution: "Every electric radiator or electric floor zone becomes controllable and programmable, through the pilot wire.",
      descUser: "Wired to your existing electric radiator (pilot wire).",
      descPro: "Zigbee pilot-wire thermostat, 6 orders, 16 A load, electric floor or radiant panel.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    /* ----- Network reinforcement & relays ----- */
    RE600: {
      ref: "RE600", name: "Zigbee repeater",
      role: "repeater", price: 49,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/re600.png",
      solution: "Extends the radio range of your system: needed beyond 15 devices, through thick walls or between floors.",
      descUser: "Plugs into a socket halfway between the gateway and the devices furthest away.",
      descPro: "230 V Zigbee repeater - 1 per floor to cross or per group of 15 devices.",
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    SR600: {
      ref: "SR600", name: "Smart relay",
      role: "relay", price: 45,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sr600.png",
      solution: "Turns any socket or appliance into a controlled device: the relay sits inside the socket itself - towel rail, water tank, lighting.",
      descUser: "Invisible once fitted: it is your existing socket that becomes smart.",
      descPro: "16 A Zigbee relay, flush-mounted (back box / socket), consumption metering, 230 V repeater.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    RS600: {
      ref: "RS600", name: "Roller shutter module",
      role: "shutterRelay", price: 55,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/rs600.png",
      solution: "Your shutters join in on comfort: closing automatically at night to keep the heat in, or in summer to keep the cool in.",
      descUser: "One module per shutter, hidden behind the existing switch.",
      descPro: "Zigbee roller shutter module, flush-mounted, favourite position, heat/cool scenarios.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    /* ----- Security / sensors ----- */
    OS600: {
      ref: "OS600", name: "Window / door opening sensor",
      role: "windowSensor", price: 35,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/os600.png",
      solution: "Alerts you to an unexpected visit, and cuts the heating in a room as soon as a window is left open.",
      descUser: "Two small parts stuck to the window and its frame.",
      descPro: "Zigbee opening contact, native 'window open = frost protection setpoint' scenario.",
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    MS600: {
      ref: "MS600", name: "Presence sensor",
      refToConfirm: true,
      role: "presenceSensor", price: 45,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/ms600.png",
      solution: "Knows whether someone is there: alerts you while you are away, and trims the heating when a room stays empty.",
      descUser: "Mounted high up in the hallway or living room.",
      descPro: "Zigbee PIR motion sensor + light level, presence/absence scenarios.",
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    /* ----- Standalone thermostats (no UG800 gateway) ----- */
    RT520: {
      ref: "RT520", name: "Wired programmable thermostat",
      role: "standaloneWired", price: 69,
      protocol: "wired", power: "battery",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/rt520.png",
      solution: "The direct replacement for an existing wired thermostat: simple programming, no network setup.",
      descUser: "Reuses the two wires of your old thermostat. Fitted in 15 minutes.",
      descPro: "Wired ON/OFF weekly programmable thermostat, 230 V volt-free contact, universal replacement.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user"]
    },

    RT520RF: {
      ref: "RT520RF", name: "Wireless programmable thermostat + receiver",
      role: "standaloneRF", price: 89,
      protocol: "rf", power: "battery",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/rt520rf.png",
      solution: "A thermostat you place where you live, a receiver next to the boiler: control without running a single cable.",
      descUser: "The receiver box is included: it wires to the boiler, the thermostat stays portable.",
      descPro: "868 MHz RF kit, thermostat + boiler receiver, 60 m open-field range.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install"]
    },

    WQ610: {
      ref: "WQ610", name: "Wired boiler thermostat - modulating",
      role: "standaloneWired", price: 129,
      protocol: "wired", power: "230v",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/wq610.png",
      solution: "Talks directly to recent boilers (OpenTherm): the flame modulates precisely instead of switching all-or-nothing.",
      descUser: "For compatible boilers: finer consumption, steadier comfort.",
      descPro: "Wired OpenTherm / ON-OFF thermostat, modulating algorithm, LCD display.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user"]
    },

    IT700: {
      ref: "iT700", name: "Connectable thermostat - built-in gateway",
      role: "standaloneRF", price: 149,
      protocol: "rf", power: "battery",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/it700.png",
      solution: "The standalone thermostat that can become connected: its gateway is already built into its boiler receiver - nothing else to buy.",
      descUser: "Start simple; switch on phone control the day you feel like it.",
      descPro: "Thermostat + boiler receiver kit with built-in gateway - no UG800 required.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install"]
    },

    IT800WIFI: {
      ref: "iT800 WiFi", name: "Premium Wi-Fi thermostat - built-in gateway",
      role: "standaloneRF", price: 199,
      protocol: "wifi", power: "battery",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/it800wifi.png",
      solution: "The standalone flagship: app, geolocation, consumption history - the gateway is inside its boiler receiver.",
      descUser: "Full phone control, with no extra box.",
      descPro: "Premium Wi-Fi thermostat, boiler receiver with built-in gateway, OpenTherm.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install", "video_choix"]
    },

    /* ----- Ducted air conditioning ----- */
    RSQ800WRF: {
      ref: "RSQ800WRF", name: "R-System thermostat - ducted",
      role: "acController", price: 159,
      protocol: "rf", power: "230v",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/rsq800wrf.png",
      solution: "Controls your ducted air conditioning room by room (Daikin, Mitsubishi, Toshiba) - heating and cooling in the same app.",
      descUser: "One thermostat per supply zone, connected to the ducted unit.",
      descPro: "R-System: zone-by-zone control of FBA ducted units (35 to 140), motorised dampers, dedicated app.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    }
  },

  /* Alternatives offered by the "Other choice" button (same role).
     Display order is the order below. */
  alternatives: {
    roomstat:        ["SQ610RF", "SQ610", "SQ610BRF", "SQ610B"],
    trv:             ["TRV3RF", "TRV3RF-AB"],
    wiringCentre:    ["CB12RF", "CB500CO"],
    actuator:        ["T30NC", "THB"],
    standaloneRF:    ["RT520RF", "IT700", "IT800WIFI"],
    standaloneWired: ["RT520", "WQ610"],
    electricStat:    ["EL600F"],
    boilerReceiver:  ["RX30RF"],
    gateway:         ["UG800"],
    repeater:        ["RE600"],
    relay:           ["SR600"],
    shutterRelay:    ["RS600"],
    windowSensor:    ["OS600"],
    presenceSensor:  ["MS600"],
    acController:    ["RSQ800WRF"]
  },

  /* Levels - standalone RF thermostat ladder (Mathieu's rule) */
  standaloneLadder: {
    rf:    { essential: "RT520RF", comfort: "IT700", premium: "IT800WIFI" },
    wired: { essential: "RT520",   comfort: "RT520", premium: "WQ610" }
  },

  /* Optional packs (never mixed with the levels - rule P24) */
  packs: {
    security: {
      id: "security", name: "Security pack",
      tagline: "Alerts you to a visit, cuts the heating if a window is left open.",
      needsGateway: true
    },
    shutters: {
      id: "shutters", name: "Roller shutter pack",
      tagline: "Your shutters keep the heat in winter and the cool in summer, automatically.",
      needsGateway: true
    },
    smartplug: {
      id: "smartplug", name: "Smart socket",
      tagline: "The SR600 relay sits inside the socket: towel rail or water tank controlled, socket unchanged.",
      needsGateway: true
    },
    boilerPilot: {
      id: "boilerPilot", name: "Heat source control",
      tagline: "The RX30RF starts and stops boiler, heat pump, pump or valve on demand from the rooms.",
      needsGateway: true
    }
  }
};
