/* ============================================================
   SALUS Configurateur BETA — Catalogue produits
   ------------------------------------------------------------
   ⚠ TOUS LES PRIX SONT FICTIFS (version BETA, démonstration
   interne). Les références produits sont réelles.
   Chaque produit expose :
   - role        : rôle dans le système abstrait (voir engine.js)
   - protocol    : zigbee | rf | wifi | wired | none
   - needsGateway / integratedGateway / worksStandalone
   - zigbeeRepeater : le produit 230 V étend le maillage Zigbee
   - requires    : références nécessaires au fonctionnement
   - limits      : contraintes de quantité
   - solution    : « à quoi ça sert » en une phrase (exigence
                   Mathieu : tout ce qui passe par l'UG800 est
                   présenté sous forme de solution)
   ============================================================ */

globalThis.SALUS_CATALOG = {

  products: {

    /* ----- Cœur du système connecté ----- */
    UG800: {
      ref: "UG800", name: "Passerelle Zigbee / Wi-Fi",
      role: "gateway", price: 89,
      protocol: "zigbee", power: "230v",
      needsGateway: false, worksStandalone: true, zigbeeRepeater: true,
      limits: { maxDevices: 100 },
      img: "assets/products/ug800.png",
      solution: "Le cerveau de votre installation : elle relie tous vos appareils Salus à internet pour les piloter depuis votre téléphone, recevoir des alertes et partager l'accès.",
      descUser: "Petit boîtier branché à votre box internet. Sans elle, chaque appareil se règle à la main.",
      descPro: "Passerelle Zigbee 3.0 / Wi-Fi, jusqu'à 100 périphériques, appairage QR, API cloud Salus.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    TRV3RF: {
      ref: "TRV3RF", name: "Tête thermostatique connectée",
      role: "trv", price: 79,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/trv3rf.png",
      solution: "Remplace la tête de votre robinet de radiateur : chaque radiateur suit sa propre température, pièce par pièce.",
      descUser: "Se visse à la place de la tête actuelle (filetage standard M30). Fonctionne sur piles.",
      descPro: "Tête Zigbee M30×1,5, adaptateurs Danfoss RA/RAV/RAVL fournis, détection fenêtre ouverte.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install", "video_choix"]
    },

    "TRV3RF-AB": {
      ref: "TRV3RF-AB", name: "Tête thermostatique auto-équilibrante",
      refToConfirm: true,
      role: "trv", price: 99,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/trv3rf-ab.png",
      solution: "Comme la TRV3RF, mais elle répartit d'elle-même le débit entre les radiateurs : plus besoin d'équilibrer le réseau à la main.",
      descUser: "Idéale si certains radiateurs chauffent trop et d'autres pas assez.",
      descPro: "Équilibrage dynamique du débit par mesure de gradient — supprime l'équilibrage manuel au té de réglage.",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    SQ610: {
      ref: "SQ610", name: "Thermostat Quantum filaire",
      role: "roomstat", price: 119,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sq610.png",
      solution: "L'écran de contrôle d'une pièce : température ambiante mesurée et réglée au dixième de degré.",
      descUser: "Ultra-fin (10 mm), alimenté par le 230 V, se fixe au mur.",
      descPro: "Filaire / 230 V — sert de répéteur Zigbee. Sortie vers centre de câblage ou récepteur.",
      variantOf: null,
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    SQ610B: {
      ref: "SQ610B", name: "Thermostat Quantum filaire — noir",
      role: "roomstat", price: 119,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sq610b.png",
      solution: "Le même thermostat Quantum filaire, en coloris noir.",
      descUser: "Version noire du SQ610.",
      descPro: "Identique au SQ610, coloris noir.",
      variantOf: "SQ610",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    SQ610RF: {
      ref: "SQ610RF", name: "Thermostat Quantum sans fil",
      role: "roomstat", price: 129,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/sq610rf.png",
      solution: "Le thermostat de pièce qui se pose où l'on veut : rechargeable USB-C, support mural aimanté.",
      descUser: "Aucun câble à tirer : il se pose sur un meuble ou s'aimante au mur.",
      descPro: "Zigbee, batterie rechargeable USB-C, support aimanté, appairage direct UG800 ou CB12RF.",
      variantOf: null,
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite", "video_install"]
    },

    SQ610BRF: {
      ref: "SQ610BRF", name: "Thermostat Quantum sans fil — noir",
      role: "roomstat", price: 129,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/sq610brf.png",
      solution: "Le même thermostat Quantum sans fil, en coloris noir.",
      descUser: "Version noire du SQ610RF.",
      descPro: "Identique au SQ610RF, coloris noir.",
      variantOf: "SQ610RF",
      docs: ["fiche", "notice_pose", "notice_user", "doc_conformite"]
    },

    RX30RF: {
      ref: "RX30RF", name: "Récepteur chaudière / générateur",
      role: "boilerReceiver", price: 79,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/rx30rf.png",
      solution: "Le lien avec votre générateur : il démarre et coupe la chaudière, la PAC, le circulateur ou une vanne exactement quand vos pièces le demandent.",
      descUser: "Se pose près de la chaudière. Plus aucune chauffe inutile quand aucune pièce ne réclame de chaleur.",
      descPro: "Récepteur Zigbee contact sec — pilotage chaudière, PAC (contact démarrage), circulateur, vanne de zone.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    },

    /* ----- Plancher chauffant ----- */
    CB12RF: {
      ref: "CB12RF", name: "Centre de câblage plancher — radio",
      role: "wiringCentre", price: 249,
      protocol: "zigbee", power: "230v",
      needsGateway: false, worksStandalone: true, zigbeeRepeater: true,
      limits: { maxZones: 12 },
      img: "assets/products/cb12rf.png",
      solution: "Le chef d'orchestre du plancher chauffant : il ouvre et ferme chaque boucle du collecteur selon la demande de chaque pièce, sans fil vers les thermostats.",
      descUser: "S'installe près du collecteur du plancher. Chaque pièce devient réglable séparément.",
      descPro: "12 zones max, liaison radio vers thermostats, pilotage circulateur + chaudière intégré, extensible.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    },

    CB500CO: {
      ref: "CB500CO", name: "Centre de câblage plancher — filaire",
      role: "wiringCentre", price: 199,
      protocol: "wired", power: "230v",
      needsGateway: false, worksStandalone: true,
      limits: { maxZones: 8 },
      img: "assets/products/cb500co.png",
      solution: "La même orchestration du plancher chauffant, en version filaire : idéale quand les gaines existent déjà.",
      descUser: "Choisi quand des câbles relient déjà les thermostats au collecteur.",
      descPro: "Centre de câblage filaire, thermostats 230 V raccordés en direct, pilotage circulateur.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    T30NC: {
      ref: "T30NC", name: "Actionneur thermique de boucle",
      refToConfirm: true,
      role: "actuator", price: 25,
      protocol: "none", power: "230v",
      needsGateway: false,
      img: "assets/products/t30nc.png",
      solution: "Le muscle du collecteur : un actionneur par boucle ouvre ou ferme le circuit de la pièce correspondante.",
      descUser: "Petite pièce vissée sur le collecteur du plancher — une par circuit.",
      descPro: "Actionneur thermique 230 V NC, M30×1,5, monté sur le retour du collecteur.",
      docs: ["fiche", "notice_pose"]
    },

    THB: {
      ref: "THB", name: "Actionneur auto-équilibrant",
      refToConfirm: true,
      role: "actuator", price: 49,
      protocol: "none", power: "230v",
      needsGateway: false,
      img: "assets/products/thb.png",
      solution: "L'actionneur intelligent : il équilibre de lui-même le débit de chaque boucle du plancher — fini les pièces trop ou pas assez chauffées.",
      descUser: "Remplace l'actionneur standard pour un confort plus régulier.",
      descPro: "Actionneur auto-équilibrant : mesure du débit retour et ajustement continu, supprime l'équilibrage manuel.",
      docs: ["fiche", "notice_pose"]
    },

    /* ----- Électrique ----- */
    EL600F: {
      ref: "EL600F", name: "Thermostat chauffage électrique — fil pilote",
      role: "electricStat", price: 99,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/el600f.png",
      solution: "Chaque radiateur électrique ou zone de plancher électrique devient pilotable et programmable, via le fil pilote.",
      descUser: "Se raccorde au radiateur électrique existant (fil pilote).",
      descPro: "Thermostat Zigbee fil pilote 6 ordres, charge 16 A, plancher électrique ou panneau rayonnant.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    /* ----- Renfort réseau & relais ----- */
    RE600: {
      ref: "RE600", name: "Répéteur Zigbee",
      role: "repeater", price: 49,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/re600.png",
      solution: "Prolonge la portée radio de votre système : indispensable au-delà de 15 appareils, à travers des murs épais ou entre étages.",
      descUser: "Se branche sur une prise à mi-chemin entre la passerelle et les appareils éloignés.",
      descPro: "Répéteur Zigbee 230 V — 1 par étage à franchir ou par groupe de 15 appareils.",
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    SR600: {
      ref: "SR600", name: "Relais intelligent",
      role: "relay", price: 45,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/sr600.png",
      solution: "Transforme n'importe quelle prise ou appareil en équipement piloté : le relais se loge dans la prise elle-même — sèche-serviette, ballon, luminaire.",
      descUser: "Invisible une fois posé : c'est votre prise actuelle qui devient intelligente.",
      descPro: "Relais Zigbee 16 A encastrable (fond de boîte / prise), mesure de consommation, répéteur 230 V.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    RS600: {
      ref: "RS600", name: "Module volets roulants",
      role: "shutterRelay", price: 55,
      protocol: "zigbee", power: "230v",
      needsGateway: true, zigbeeRepeater: true,
      img: "assets/products/rs600.png",
      solution: "Vos volets participent au confort : fermeture automatique la nuit pour garder la chaleur, ou en été pour garder le frais.",
      descUser: "Un module par volet, caché derrière l'interrupteur existant.",
      descPro: "Module Zigbee volet roulant, encastrable, position favorite, scénarios chaleur/fraîcheur.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite"]
    },

    /* ----- Sécurité / capteurs ----- */
    OS600: {
      ref: "OS600", name: "Détecteur d'ouverture fenêtre / porte",
      role: "windowSensor", price: 35,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/os600.png",
      solution: "Alerte en cas de visite inattendue, et coupe le chauffage de la pièce dès qu'une fenêtre reste ouverte.",
      descUser: "Deux petites pièces collées sur la fenêtre et son cadre.",
      descPro: "Contact d'ouverture Zigbee, scénario natif « fenêtre ouverte = consigne hors gel »." ,
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    MS600: {
      ref: "MS600", name: "Détecteur de présence",
      refToConfirm: true,
      role: "presenceSensor", price: 45,
      protocol: "zigbee", power: "battery",
      needsGateway: true,
      img: "assets/products/ms600.png",
      solution: "Sait si quelqu'un est là : alerte en votre absence, et chauffage ajusté quand une pièce reste vide.",
      descUser: "Se pose en hauteur dans l'entrée ou le séjour.",
      descPro: "Détecteur de mouvement PIR Zigbee + luminosité, scénarios présence/absence.",
      docs: ["fiche", "notice_pose", "doc_conformite"]
    },

    /* ----- Thermostats autonomes (sans passerelle UG800) ----- */
    RT520: {
      ref: "RT520", name: "Thermostat programmable filaire",
      role: "standaloneWired", price: 69,
      protocol: "wired", power: "battery",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/rt520.png",
      solution: "Le remplacement direct d'un thermostat filaire existant : programmation simple, aucun réglage réseau.",
      descUser: "Reprend les deux fils de votre ancien thermostat. Posé en 15 minutes.",
      descPro: "Thermostat ON/OFF filaire programmable hebdo, contact sec 230 V, remplacement universel.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user"]
    },

    RT520RF: {
      ref: "RT520RF", name: "Thermostat programmable sans fil + récepteur",
      role: "standaloneRF", price: 89,
      protocol: "rf", power: "battery",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/rt520rf.png",
      solution: "Un thermostat qui se pose où l'on vit, un récepteur près de la chaudière : la régulation sans tirer un seul câble.",
      descUser: "Le boîtier récepteur est fourni : il se câble sur la chaudière, le thermostat reste mobile.",
      descPro: "Kit RF 868 MHz thermostat + récepteur chaudière, portée 60 m champ libre.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install"]
    },

    WQ610: {
      ref: "WQ610", name: "Thermostat chaudière filaire — modulant",
      role: "standaloneWired", price: 129,
      protocol: "wired", power: "230v",
      needsGateway: false, worksStandalone: true,
      img: "assets/products/wq610.png",
      solution: "Dialogue en direct avec les chaudières récentes (OpenTherm) : la flamme module au plus juste au lieu de faire du tout-ou-rien.",
      descUser: "Pour les chaudières compatibles : consommation plus fine, confort plus stable.",
      descPro: "Thermostat filaire OpenTherm / ON-OFF, algorithme modulant, écran LCD.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user"]
    },

    IT700: {
      ref: "iT700", name: "Thermostat connectable — passerelle intégrée",
      role: "standaloneRF", price: 149,
      protocol: "rf", power: "battery",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/it700.png",
      solution: "Le thermostat autonome qui peut devenir connecté : sa passerelle est déjà intégrée dans son récepteur chaudière — rien d'autre à acheter.",
      descUser: "Commencez simple ; activez le pilotage depuis le téléphone le jour où vous en avez envie.",
      descPro: "Kit thermostat + récepteur chaudière à passerelle intégrée — pas d'UG800 requis.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install"]
    },

    IT800WIFI: {
      ref: "iT800 WiFi", name: "Thermostat Wi-Fi premium — passerelle intégrée",
      role: "standaloneRF", price: 199,
      protocol: "wifi", power: "battery",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/it800wifi.png",
      solution: "Le haut de gamme autonome : application, géolocalisation, historique de consommation — la passerelle est dans son récepteur chaudière.",
      descUser: "Pilotage complet depuis le téléphone, sans aucun boîtier supplémentaire.",
      descPro: "Thermostat Wi-Fi premium, récepteur chaudière à passerelle intégrée, OpenTherm.",
      docs: ["fiche", "notice_pose", "schema_cablage", "notice_user", "video_install", "video_choix"]
    },

    /* ----- Climatisation gainable ----- */
    RSQ800WRF: {
      ref: "RSQ800WRF", name: "Thermostat R-System — gainable",
      role: "acController", price: 159,
      protocol: "rf", power: "230v",
      needsGateway: false, worksStandalone: true, integratedGateway: true,
      img: "assets/products/rsq800wrf.png",
      solution: "Pilote votre climatisation gainable pièce par pièce (Daikin, Mitsubishi, Toshiba) — chauffage et rafraîchissement dans la même application.",
      descUser: "Un thermostat par zone de soufflage, relié à l'unité gainable.",
      descPro: "R-System : contrôle zone par zone des gainables FBA (35→140), registres motorisés, app dédiée.",
      docs: ["fiche", "notice_pose", "schema_cablage", "doc_conformite", "video_install"]
    }
  },

  /* Alternatives proposées par le bouton « Autre choix » (même rôle).
     L'ordre est l'ordre d'affichage. */
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

  /* Niveaux — échelle thermostat autonome RF (règle Mathieu) */
  standaloneLadder: {
    rf:    { essential: "RT520RF", comfort: "IT700", premium: "IT800WIFI" },
    wired: { essential: "RT520",   comfort: "RT520", premium: "WQ610" }
  },

  /* Packs optionnels (jamais mélangés aux niveaux — règle P24) */
  packs: {
    security: {
      id: "security", name: "Pack sécurité",
      tagline: "Alerte en cas de visite, chauffage coupé si une fenêtre reste ouverte.",
      needsGateway: true
    },
    shutters: {
      id: "shutters", name: "Pack volets roulants",
      tagline: "Vos volets gardent la chaleur l'hiver et la fraîcheur l'été, automatiquement.",
      needsGateway: true
    },
    smartplug: {
      id: "smartplug", name: "Prise intelligente",
      tagline: "Le relais SR600 se loge dans la prise : sèche-serviette ou ballon piloté, prise inchangée.",
      needsGateway: true
    },
    boilerPilot: {
      id: "boilerPilot", name: "Pilotage du générateur",
      tagline: "Le RX30RF démarre et coupe chaudière, PAC, circulateur ou vanne à la demande des pièces.",
      needsGateway: true
    }
  }
};
