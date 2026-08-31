/* ============================================================
   SALUS Configurateur BETA — Textes, bénéfices, équivalences
   ------------------------------------------------------------
   Contenus rédactionnels : phrases bénéfices pièce par pièce
   (P21), 4 situations vécues (P12/P13), table d'équivalence du
   module remplacement (P14), installateurs Club Pro fictifs
   (P18), méthode économies (P19). Tout contenu marqué [BETA]
   est factice.
   ============================================================ */

globalThis.SALUS_COPY = {

  /* --- 4 situations vécues (solution P13) — affichées au moment
     de la question connectivité, jamais dans une page à part --- */
  situations: [
    {
      id: "train",
      text: "Je rentre plus tôt que prévu : je relance le chauffage depuis le train.",
      img: "assets/situations/situation-train.png"
    },
    {
      id: "gel",
      text: "Ma maison de vacances descend sous 5 °C : je reçois une alerte avant que les canalisations ne gèlent.",
      img: "assets/situations/situation-gel.png"
    },
    {
      id: "installateur",
      text: "Mon installateur corrige mon programme sans se déplacer : pas de frais de déplacement.",
      img: "assets/situations/situation-installateur.png"
    },
    {
      id: "voiture",
      text: "Je pars en week-end et j'ai oublié de baisser : je le fais depuis la voiture.",
      img: "assets/situations/situation-voiture.png"
    }
  ],

  /* --- Bénéfices pièce par pièce (solution P22) — la phrase
     utilise la pièce déclarée par le client --- */
  roomBenefits: {
    sejour:   (name) => `Votre ${name} à 21 °C le soir, seulement quand vous y êtes.`,
    chambre:  (name) => `Votre ${name} à 18 °C la nuit et 20 °C au réveil.`,
    sdb:      (name) => `Votre ${name} chaude 30 minutes avant votre douche.`,
    cuisine:  (name) => `Votre ${name} tempérée aux heures des repas, sans chauffer pour rien.`,
    bureau:   (name) => `Votre ${name} à 20 °C en journée de télétravail, 17 °C le reste du temps.`,
    autre:    (name) => `Votre ${name} maintenue à 16 °C sans y penser.`
  },

  /* --- Module remplacement (solution P14) : table d'équivalence.
     from        : produit existant saisi par le client
     to          : équivalent Salus
     alsoNeeds   : produits additionnels nécessaires
     note        : ce qui change au quotidien --- */
  replacements: [
    {
      brand: "Delta Dore", from: "Tybox 1117", to: "RT520",
      alsoNeeds: [], wiring: "Le câblage existant est réutilisable tel quel.",
      note: "Même pose murale filaire ; la programmation passe de 2 à 6 périodes par jour."
    },
    {
      brand: "Delta Dore", from: "Tybox 5101", to: "RT520RF",
      alsoNeeds: [], wiring: "Le récepteur Salus remplace le récepteur Delta Dore près de la chaudière.",
      note: "Portée radio équivalente, écran rétroéclairé en plus."
    },
    {
      brand: "Netatmo", from: "Thermostat Netatmo", to: "IT700",
      alsoNeeds: [], wiring: "Le relais Netatmo est remplacé par le récepteur iT700 (passerelle intégrée).",
      note: "Le pilotage depuis le téléphone est conservé, l'abonnement en moins."
    },
    {
      brand: "Tado", from: "Tado V3+", to: "IT800WIFI",
      alsoNeeds: [], wiring: "Le bridge Tado disparaît : la passerelle est intégrée au récepteur.",
      note: "Géolocalisation et historique conservés, sans abonnement."
    },
    {
      brand: "Tado", from: "Tête Tado SRT", to: "TRV3RF",
      alsoNeeds: ["UG800"], wiring: "Même filetage M30 : la tête se remplace en 2 minutes.",
      note: "Nécessite la passerelle UG800 pour le pilotage à distance."
    },
    {
      brand: "Honeywell", from: "T6R", to: "IT700",
      alsoNeeds: [], wiring: "Le récepteur Honeywell est remplacé par le récepteur iT700.",
      note: "Application Salus en remplacement de Resideo."
    },
    {
      brand: "Honeywell", from: "evohome", to: "UG800",
      alsoNeeds: ["TRV3RF", "SQ610RF"], wiring: "Chaque tête evohome est remplacée par une TRV3RF, le contrôleur par l'UG800.",
      note: "Le multizone pièce par pièce est conservé ; devis selon le nombre de radiateurs."
    },
    {
      brand: "Salus (ancien)", from: "RT500RF", to: "RT520RF",
      alsoNeeds: [], wiring: "Le récepteur se câble sur les mêmes borniers.",
      note: "Remplacement direct de l'ancienne génération Salus."
    },
    {
      brand: "Salus (ancien)", from: "iT500", to: "IT800WIFI",
      alsoNeeds: [], wiring: "La passerelle iT500 disparaît : elle est intégrée au nouveau récepteur.",
      note: "Application modernisée, mêmes usages."
    },
    {
      brand: "Salus (ancien)", from: "SQ605", to: "SQ610",
      alsoNeeds: [], wiring: "Encastrement identique, câblage repris.",
      note: "Écran plus fin, fonction répéteur Zigbee en plus."
    }
  ],

  /* --- Installateurs Club Pro fictifs (solution P18) — routés
     par code postal. DONNÉES FICTIVES BETA. --- */
  clubPro: [
    { name: "Chauffage Martin & Fils", city: "Selon votre secteur", badge: "Club Pro", rating: "4,8/5" },
    { name: "Ets Thermiconfort",       city: "Selon votre secteur", badge: "Club Pro", rating: "4,7/5" },
    { name: "SARL Calor Habitat",      city: "Selon votre secteur", badge: "Club Pro", rating: "4,6/5" }
  ],
  distributors: ["Espace Aubade", "Algorel", "Richardson"],

  /* --- Méthode économies (solution P20) — EN 15232, FICTIF --- */
  savingsMethod: {
    standard: "EN 15232 — classes d'efficacité des systèmes de régulation",
    text: "L'estimation compare la classe de régulation actuelle de votre logement (déclarée dans vos réponses) à la classe atteinte avec la solution proposée, selon les facteurs d'efficacité de la norme EN 15232, appliqués à une consommation de chauffage estimée d'après la surface, la période de construction et l'énergie utilisée. Le résultat est une fourchette : la valeur réelle dépend de l'usage effectif du logement.",
    betaNote: "⚠ Version BETA : coefficients et prix de l'énergie fictifs, à des fins de démonstration uniquement."
  },

  /* Consommation estimée (kWh/m²/an) par période de construction — FICTIF */
  consumptionByPeriod: {
    avant1975: { label: "Avant 1975", kwhM2: 180 },
    p1975_1990: { label: "1975 – 1990", kwhM2: 150 },
    p1990_2005: { label: "1990 – 2005", kwhM2: 120 },
    p2005_2012: { label: "2005 – 2012", kwhM2: 90 },
    apres2012: { label: "Après 2012", kwhM2: 60 }
  },

  /* Prix de l'énergie €/kWh — FICTIF BETA */
  energyPrice: {
    gas_boiler: 0.11, oil_boiler: 0.13, heat_pump_aw: 0.08,
    heat_pump_aa: 0.08, electric: 0.25, district: 0.10, biomass: 0.07, unknown: 0.12
  },

  /* Fourchettes d'économies (%) selon le niveau — FICTIF, inspiré EN 15232 */
  savingsRange: {
    essential: [8, 14],
    comfort: [12, 18],
    premium: [15, 25],
    standalone: [10, 15]
  },

  /* --- Types de pièces (constructeur de pièces, étape Mon logement) --- */
  roomTypes: [
    { id: "sejour",  label: "Séjour / salon", living: true,  img: "assets/pieces/piece-sejour.png" },
    { id: "cuisine", label: "Cuisine",        living: false, img: "assets/pieces/piece-cuisine.png" },
    { id: "chambre", label: "Chambre",        living: true,  img: "assets/pieces/piece-chambre.png" },
    { id: "bureau",  label: "Bureau",         living: true,  img: "assets/pieces/piece-bureau.png" },
    { id: "sdb",     label: "Salle de bain",  living: false, img: "assets/pieces/piece-sdb.png" },
    { id: "autre",   label: "Autre pièce",    living: false, img: "assets/pieces/piece-autre.png" }
  ],

  /* --- Scénario démo (validé par Mathieu) : maison 5 pièces,
     plancher au RDC + radiateurs eau à l'étage, chaudière gaz,
     pilotage à distance --- */
  demoScenario: {
    label: "Scénario démo — maison mixte",
    description: "Maison 5 pièces · plancher chauffant au RDC · radiateurs eau à l'étage · chaudière gaz · pilotage à distance",
    answers: {
      profile: "user",
      homeType: "house",
      surface: 120,
      floors: 1,
      walls: "standard",
      windows: 8,
      wifiQuality: "weak_spots",
      rooms: [
        { id: 1, type: "sejour",  name: "Séjour",    floor: 0, emitter: "ufh_water" },
        { id: 2, type: "cuisine", name: "Cuisine",   floor: 0, emitter: "ufh_water" },
        { id: 3, type: "chambre", name: "Chambre 1", floor: 1, emitter: "water_radiators", radiators: 1 },
        { id: 4, type: "chambre", name: "Chambre 2", floor: 1, emitter: "water_radiators", radiators: 1 },
        { id: 5, type: "sdb",     name: "Salle de bain", floor: 1, emitter: "water_radiators", radiators: 1 }
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

  /* --- Étapes du parcours (solution P4) --- */
  steps: [
    { id: "home",     label: "Mon logement" },
    { id: "heating",  label: "Mon chauffage" },
    { id: "habits",   label: "Mes habitudes" },
    { id: "solution", label: "Ma solution" }
  ],

  /* --- Libellés des documents (matrice documentaire P14) --- */
  docLabels: {
    fiche: "Fiche produit",
    notice_pose: "Notice d'installation",
    notice_user: "Notice d'utilisation",
    schema_cablage: "Schéma de câblage",
    doc_conformite: "Déclaration de conformité",
    video_install: "Vidéo d'installation",
    video_choix: "Vidéo de présentation"
  }
};
