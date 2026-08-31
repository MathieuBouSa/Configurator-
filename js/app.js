/* ============================================================
   SALUS Configurateur BETA — Application (parcours unifié)
   ------------------------------------------------------------
   Un seul parcours : Mon logement → Mon chauffage → Mes
   habitudes → Ma solution (P4). Une question par écran, cartes
   cliquables, vocabulaire adapté au profil (P6). Proposition
   précoce mise à jour en direct (P8). Reprise par code projet
   (P24). Dossier qualifié pour les cas hors parcours (P9/P16).
   ============================================================ */

(function () {
  const { h, cx, eur, PriceTag, Btn, ChoiceCard, SectionTitle, Modal, VideoPlaceholder, StepBar, InfoBox, Stepper } = window.UI;
  const { useState, useEffect, useMemo, useRef } = React;
  const E = window.SalusEngine;
  const CAT = window.SALUS_CATALOG;
  const MKT = window.SALUS_MARKETS;
  const COPY = window.SALUS_COPY;
  const CRM = window.SalusCRM;

  const LS_KEY = "salus_beta_state_v1";

  /* ---------- Bandeau BETA permanent (règle absolue) ---------- */
  function BetaBanner({ onAbout, onBackstage }) {
    return h("div", { className: "fixed top-0 inset-x-0 z-[60] bg-amber-400 text-salus-navy" },
      h("div", { className: "max-w-6xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] md:text-xs font-semibold" },
        h("span", { className: "flex items-center gap-2 min-w-0" },
          h("span", { className: "bg-salus-navy text-amber-300 rounded px-1.5 py-0.5 font-bold tracking-wider shrink-0" }, "BETA"),
          h("span", { className: "truncate" }, "Démonstration interne — prix fictifs · documents de test · CRM simulé. Aucune donnée n'est envoyée.")),
        h("span", { className: "flex items-center gap-3 shrink-0" },
          h("button", { onClick: onBackstage, className: "underline underline-offset-2 hover:opacity-70" }, "Coulisses CRM"),
          h("button", { onClick: onAbout, className: "underline underline-offset-2 hover:opacity-70" }, "À propos"))));
  }

  /* ---------- Panneau « Coulisses CRM » (P26/P27) ---------- */
  function Backstage({ open, onClose, answers, projectCode, selection }) {
    const [tab, setTab] = useState("flux");
    if (!open) return null;
    const payload = CRM.leadPayload(answers || {}, { projectCode, level: selection && selection.level });
    const log = CRM.getLog();
    return h("div", { className: "fixed inset-0 z-[80]" },
      h("div", { className: "absolute inset-0 bg-salus-navy/50", onClick: onClose }),
      h("div", { className: "absolute right-0 top-0 h-full w-full max-w-xl bg-white shadow-2xl overflow-y-auto fadeUp" },
        h("div", { className: "sticky top-0 bg-salus-navy text-white px-5 py-4 z-10" },
          h("div", { className: "flex items-center justify-between" },
            h("div", null,
              h("h3", { className: "font-ubuntu font-bold" }, "Coulisses — ce qui se passerait côté CRM"),
              h("p", { className: "text-xs text-white/60 mt-0.5" }, "Zoho CRM · simulation BETA — rien ne quitte votre navigateur")),
            h("button", { onClick: onClose, className: "w-8 h-8 rounded-full hover:bg-white/10 font-bold" }, "✕")),
          h("div", { className: "flex gap-1.5 mt-3" },
            [["flux", "Les flux réels"], ["payload", "Payload en direct"], ["journal", "Journal (" + log.length + ")"]].map(([id, label]) =>
              h("button", {
                key: id, onClick: () => setTab(id),
                className: cx("rounded-full px-3 py-1 text-xs font-semibold", tab === id ? "bg-salus-cyan text-white" : "bg-white/10 text-white/70 hover:bg-white/20")
              }, label)))),
        h("div", { className: "p-5 space-y-4" },
          tab === "flux" && Object.entries(CRM.flows).map(([id, f]) => h(FlowCard, { key: id, flow: f })),
          tab === "payload" && h("div", null,
            h("p", { className: "text-sm text-slate-600 mb-2" }, "Le lead tel qu'il partirait ", h("b", null, "maintenant"), ", avec vos réponses actuelles :"),
            h("div", { className: "text-xs text-slate-400 mb-1 font-mono" }, payload.endpoint),
            h("pre", { className: "bg-salus-navy text-emerald-300 text-[11px] leading-relaxed rounded-xl p-4 overflow-x-auto" },
              JSON.stringify(payload.data[0], null, 2))),
          tab === "journal" && (log.length
            ? log.map((e, i) => h(JournalEntry, { key: i, e }))
            : h("p", { className: "text-sm text-slate-400" }, "Aucun événement pour l'instant — avancez dans le parcours, générez un devis ou envoyez la liste par email.")))));
  }

  function FlowCard({ flow }) {
    const [openF, setOpenF] = useState(false);
    return h("div", { className: "rounded-xl border border-slate-200" },
      h("button", { onClick: () => setOpenF(!openF), className: "w-full text-left px-4 py-3 flex items-center justify-between" },
        h("span", { className: "font-semibold text-salus-navy text-sm" }, flow.title),
        h("span", { className: "text-slate-400" }, openF ? "−" : "+")),
      openF && h("div", { className: "px-4 pb-4 space-y-2 text-sm text-slate-600" },
        h("p", null, flow.what),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Données envoyées : "), flow.dataSent),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Enregistrement : "), flow.record),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Notifications : "),
          h("ul", { className: "list-disc ml-5 mt-1 space-y-0.5" }, flow.notifications.map((n, i) => h("li", { key: i }, n)))),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Et ensuite : "), flow.next)));
  }

  function JournalEntry({ e }) {
    const [openJ, setOpenJ] = useState(false);
    return h("div", { className: "rounded-xl border border-slate-200 px-4 py-3" },
      h("div", { className: "flex items-center justify-between gap-2" },
        h("div", null,
          h("div", { className: "text-sm font-semibold text-salus-navy" }, e.title),
          h("div", { className: "text-[10px] text-slate-400" }, new Date(e.at).toLocaleTimeString("fr-FR") + " · module " + (e.payload && e.payload.module))),
        h("button", { onClick: () => setOpenJ(!openJ), className: "text-xs font-semibold text-salus-cyan hover:underline shrink-0" }, openJ ? "masquer" : "payload")),
      openJ && h("pre", { className: "mt-2 bg-salus-navy text-emerald-300 text-[10px] leading-relaxed rounded-lg p-3 overflow-x-auto" },
        JSON.stringify(e.payload, null, 2)));
  }

  /* ---------- Attribution des émetteurs aux pièces ---------- */
  function assignEmitters(a) {
    if (!a.rooms) return a;
    const rooms = a.rooms.map(r => {
      const em = (r.floor || 0) === 0 ? a.emitterMain
        : (a.emitterUpper === "same" || !a.emitterUpper) ? a.emitterMain : a.emitterUpper;
      const radiators = (em === "water_radiators" || em === "electric_radiators") ? (r.radiators || 1) : undefined;
      return { ...r, emitter: em || r.emitter, radiators };
    });
    return { ...a, rooms };
  }

  /* ---------- Définition des questions (une par écran) ---------- */
  function buildQuestions(isPro) {
    const t = (user, pro) => (isPro && pro) ? pro : user;
    const yesNo = (a, set, key, yesLabel, noLabel, extra) => h("div", { className: "grid sm:grid-cols-2 gap-3" },
      h(ChoiceCard, { label: yesLabel || "Oui", selected: a[key] === "yes", onClick: () => set({ [key]: "yes" }, true) }),
      h(ChoiceCard, { label: noLabel || "Non", selected: a[key] === "no", onClick: () => set({ [key]: "no" }, true) }),
      extra);

    return [
      /* ============ ÉTAPE 1 — MON LOGEMENT ============ */
      {
        id: "homeType", step: 0,
        title: t("Où se passe votre projet ?", "Type de bâtiment du chantier ?"),
        sub: t("Le parcours s'adapte : un bâtiment professionnel part vers une étude dédiée — jamais un blocage.", "Le tertiaire sort du parcours automatique et prépare un dossier qualifié."),
        valid: a => !!a.homeType,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Une maison", img: "assets/questions/logement-maison.png", selected: a.homeType === "house", onClick: () => set({ homeType: "house" }, true) }),
          h(ChoiceCard, { label: "Un appartement", img: "assets/questions/logement-appartement.png", selected: a.homeType === "flat", onClick: () => set({ homeType: "flat" }, true) }),
          h(ChoiceCard, { label: "Un bâtiment professionnel", hint: "Bureaux, commerce, collectif…", img: "assets/questions/logement-tertiaire.png", selected: a.homeType === "tertiary", onClick: () => set({ homeType: "tertiary" }, true) }))
      },
      {
        id: "surface", step: 0,
        title: "Quelle surface à chauffer, environ ?",
        sub: "Une valeur approximative suffit — elle sert au calcul d'économies et à la portée radio.",
        valid: a => a.surface > 0,
        render: (a, set) => h("div", null,
          h("div", { className: "flex flex-wrap gap-2 mb-4" },
            [60, 90, 120, 160, 200, 300].map(v => h("button", {
              key: v, onClick: () => set({ surface: v }),
              className: cx("rounded-full px-4 py-2 text-sm font-semibold border-2 transition", a.surface === v ? "border-salus-cyan bg-salus-cyan/10 text-salus-navy" : "border-slate-200 bg-white text-slate-500 hover:border-salus-cyan/50")
            }, v + " m²"))),
          h("div", { className: "flex items-center gap-3" },
            h("input", {
              type: "number", min: 10, max: 2000, value: a.surface || "",
              onChange: e => set({ surface: parseInt(e.target.value, 10) || 0 }),
              placeholder: "ou saisissez…",
              className: "w-40 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-salus-cyan"
            }), h("span", { className: "text-sm text-slate-500" }, "m²")))
      },
      {
        id: "floors", step: 0,
        title: "Sur combien de niveaux ?",
        sub: "Un étage à franchir peut demander un répéteur radio — le configurateur y pensera pour vous.",
        valid: a => a.floors != null,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Plain-pied", img: "assets/questions/niveaux-plainpied.png", selected: a.floors === 0, onClick: () => set({ floors: 0 }, true) }),
          h(ChoiceCard, { label: "Un étage", img: "assets/questions/niveaux-1etage.png", selected: a.floors === 1, onClick: () => set({ floors: 1 }, true) }),
          h(ChoiceCard, { label: "Deux étages ou plus", img: "assets/questions/niveaux-2etages.png", selected: a.floors === 2, onClick: () => set({ floors: 2 }, true) }))
      },
      {
        id: "walls", step: 0,
        title: t("Vos murs, plutôt ?", "Nature des parois (portée radio) ?"),
        sub: "Des murs épais freinent les ondes radio : mieux vaut le savoir maintenant.",
        valid: a => !!a.walls,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: t("Classiques", "Cloisons standard"), hint: "Brique, parpaing, placo…", img: "assets/questions/murs-standard.png", selected: a.walls === "standard", onClick: () => set({ walls: "standard" }, true) }),
          h(ChoiceCard, { label: t("Épais ou anciens", "Maçonnerie lourde"), hint: "Pierre, béton épais…", img: "assets/questions/murs-epais.png", selected: a.walls === "thick", onClick: () => set({ walls: "thick" }, true) }),
          h(ChoiceCard, { label: "Je ne sais pas", img: "assets/questions/murs-inconnu.png", selected: a.walls === "unknown", onClick: () => set({ walls: "unknown" }, true) }))
      },
      {
        id: "rooms", step: 0,
        title: "Quelles pièces voulez-vous chauffer (ou rafraîchir) ?",
        sub: "Ajoutez vos pièces : la solution sera calculée pièce par pièce, et vos bénéfices aussi.",
        valid: a => (a.rooms || []).length > 0,
        render: (a, set) => h(RoomBuilder, { a, set })
      },
      {
        id: "windows", step: 0,
        title: "Combien de fenêtres, environ ?",
        sub: "Utile pour le pack sécurité : alerte en cas d'ouverture et chauffage coupé si une fenêtre reste ouverte.",
        valid: () => true,
        render: (a, set) => h("div", { className: "flex items-center gap-4" },
          h(Stepper, { value: a.windows || 0, onChange: v => set({ windows: v }), min: 0, max: 40 }),
          h("span", { className: "text-sm text-slate-500" }, "fenêtres"))
      },
      {
        id: "wifiQuality", step: 0,
        title: "Le wifi passe-t-il bien partout chez vous ?",
        sub: "Si le wifi peine, la radio de vos futurs appareils peinera sans doute aussi — un répéteur sera peut-être conseillé.",
        valid: a => !!a.wifiQuality,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Oui, partout", selected: a.wifiQuality === "good", onClick: () => set({ wifiQuality: "good" }, true) }),
          h(ChoiceCard, { label: "Des zones où ça passe mal", selected: a.wifiQuality === "weak_spots", onClick: () => set({ wifiQuality: "weak_spots" }, true) }),
          h(ChoiceCard, { label: "J'utilise des répéteurs wifi", hint: "Signe que la maison est difficile pour les ondes.", selected: a.wifiQuality === "has_repeaters", onClick: () => set({ wifiQuality: "has_repeaters" }, true) }))
      },

      /* ============ ÉTAPE 2 — MON CHAUFFAGE ============ */
      {
        id: "generator", step: 1,
        title: t("Qu'est-ce qui produit la chaleur (ou le froid) chez vous ?", "Générateur en place ?"),
        sub: "Tous les cas se présentent selon les pays (France, Royaume-Uni, Allemagne, Roumanie, Danemark) — même sans produit adapté, le configurateur prépare la suite.",
        valid: a => !!a.generator,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" },
          Object.values(MKT.generators).map(g => h(ChoiceCard, {
            key: g.id, label: g.label, hint: g.hint, img: g.img,
            badge: g.covered === false ? "étude dédiée" : null,
            selected: a.generator === g.id, onClick: () => set({ generator: g.id }, true)
          })))
      },
      {
        id: "emitterMain", step: 1,
        title: a => (a.floors > 0 ? "Comment la chaleur est-elle diffusée au rez-de-chaussée ?" : "Comment la chaleur est-elle diffusée dans votre logement ?"),
        sub: "C'est l'émetteur qui décide de la façon de réguler chaque pièce.",
        valid: a => !!a.emitterMain,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          Object.values(MKT.emitters).map(em => h(ChoiceCard, {
            key: em.id, label: em.label, hint: em.hint, img: em.img,
            badge: em.covered === false ? "étude dédiée" : null,
            selected: a.emitterMain === em.id, onClick: () => set({ emitterMain: em.id }, true)
          })))
      },
      {
        id: "emitterUpper", step: 1,
        applicable: a => (a.floors || 0) > 0,
        title: "Et à l'étage ?",
        sub: "Le mixte est fréquent : plancher en bas, radiateurs en haut — le configurateur combine les deux.",
        valid: a => !!a.emitterUpper,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Comme en bas", hint: "Le même émetteur partout.", selected: a.emitterUpper === "same", onClick: () => set({ emitterUpper: "same" }, true) }),
          Object.values(MKT.emitters).map(em => h(ChoiceCard, {
            key: em.id, label: em.label, img: em.img,
            badge: em.covered === false ? "étude dédiée" : null,
            selected: a.emitterUpper === em.id, onClick: () => set({ emitterUpper: em.id }, true)
          })))
      },
      {
        id: "radiators", step: 1,
        applicable: a => (assignEmitters(a).rooms || []).some(r => r.emitter === "water_radiators" || r.emitter === "electric_radiators"),
        title: "Combien de radiateurs dans chaque pièce ?",
        sub: "Une tête ou un module par radiateur à réguler.",
        valid: () => true,
        render: (a, set) => {
          const rooms = assignEmitters(a).rooms.filter(r => r.emitter === "water_radiators" || r.emitter === "electric_radiators");
          return h("div", { className: "space-y-2.5 max-w-md" },
            rooms.map(r => h("div", { key: r.id, className: "flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-2.5" },
              h("span", { className: "text-sm font-semibold text-salus-navy" }, r.name),
              h(Stepper, {
                value: r.radiators || 1, min: 1, max: 8,
                onChange: v => set({ rooms: a.rooms.map(x => x.id === r.id ? { ...x, radiators: v } : x) })
              }))));
        }
      },
      {
        id: "boilerAccessible", step: 1,
        applicable: a => ["gas_boiler", "oil_boiler", "heat_pump_aw", "district", "biomass", "unknown"].includes(a.generator),
        title: t("Votre générateur est-il facilement accessible ?", "Accès au générateur pour le récepteur ?"),
        sub: "S'il l'est, un récepteur peut le démarrer et le couper exactement quand vos pièces le demandent.",
        valid: a => !!a.boilerAccessible,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Oui", hint: t("Chaudière ou PAC visible et approchable.", "Câblage possible au générateur."), selected: a.boilerAccessible === "yes", onClick: () => set({ boilerAccessible: "yes" }, true) }),
          h(ChoiceCard, { label: "Non / difficile", selected: a.boilerAccessible === "no", onClick: () => set({ boilerAccessible: "no" }, true) }),
          h(ChoiceCard, { label: "Je ne sais pas", selected: a.boilerAccessible === "unknown", onClick: () => set({ boilerAccessible: "unknown" }, true) }))
      },
      {
        id: "hasThermostatWiring", step: 1,
        title: t("Des câbles arrivent-ils déjà là où seraient les thermostats ?", "Bus / gaines disponibles vers les points de régulation ?"),
        sub: t("Regardez l'emplacement de votre ancien thermostat, ou entre le collecteur et les pièces.", "Conditionne filaire vs radio (CB500CO vs CB12RF, SQ610 vs SQ610RF)."),
        valid: a => !!a.hasThermostatWiring,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Oui, des câbles existent", img: "assets/questions/cables-oui.png", selected: a.hasThermostatWiring === "yes", onClick: () => set({ hasThermostatWiring: "yes" }, true) }),
          h(ChoiceCard, { label: "Non, rien", img: "assets/questions/cables-non.png", hint: "Le sans-fil évite tous les travaux.", selected: a.hasThermostatWiring === "no", onClick: () => set({ hasThermostatWiring: "no" }, true) }),
          h(ChoiceCard, { label: "Je ne sais pas", selected: a.hasThermostatWiring === "unknown", onClick: () => set({ hasThermostatWiring: "unknown" }, true) }))
      },
      {
        id: "perRoomControl", step: 1,
        title: "Voulez-vous régler chaque pièce séparément ?",
        sub: "C'est la question qui change tout : une température pour tout le logement, ou chaque pièce sa température.",
        valid: a => !!a.perRoomControl,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 gap-3" },
          h(ChoiceCard, { label: "Oui, pièce par pièce", hint: "18 °C dans les chambres, 21 °C au salon…", img: "assets/questions/zonage-multi.png", selected: a.perRoomControl === "yes", onClick: () => set({ perRoomControl: "yes" }, true) }),
          h(ChoiceCard, { label: "Non, une seule température", hint: "Un thermostat général pilote tout.", img: "assets/questions/zonage-mono.png", selected: a.perRoomControl === "no", onClick: () => set({ perRoomControl: "no" }, true) }))
      },
      {
        id: "hasBMS", step: 1,
        applicable: (a, isProQ) => isProQ && a.homeType === "tertiary",
        title: "Une GTB (gestion technique du bâtiment) existe-t-elle ?",
        sub: "Une GTB en place impose une étude d'intégration — dossier qualifié.",
        valid: a => !!a.hasBMS,
        render: (a, set) => yesNo(a, set, "hasBMS")
      },

      /* ============ ÉTAPE 3 — MES HABITUDES ============ */
      {
        id: "remote", step: 2,
        title: "Voulez-vous pouvoir agir sur votre chauffage à distance ?",
        sub: "Deux situations vécues, plutôt qu'une fiche technique :",
        valid: a => !!a.remote,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["train", "voiture"] }),
          yesNo(a, set, "remote", "Oui, depuis mon téléphone", "Non, sur place suffit"))
      },
      {
        id: "alerts", step: 2,
        title: "Voulez-vous être alerté s'il y a un problème ?",
        valid: a => !!a.alerts,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["gel"] }),
          yesNo(a, set, "alerts", "Oui, je veux savoir", "Non merci"))
      },
      {
        id: "sharing", step: 2,
        title: "Voulez-vous partager l'accès — famille ou installateur ?",
        valid: a => !!a.sharing,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["installateur"] }),
          yesNo(a, set, "sharing", "Oui, partager l'accès", "Non"))
      },
      {
        id: "connectivityConclusion", step: 2, isConclusion: true,
        title: a => E.wantsConnected(a) ? "Votre solution sera connectée" : "Votre solution peut rester non connectée",
        sub: "Vous n'avez pas eu à choisir « connecté ou pas » : c'est la conclusion de vos trois réponses.",
        valid: () => true,
        render: (a) => h("div", { className: "space-y-4" },
          h("div", { className: "grid sm:grid-cols-2 gap-3" },
            h("div", { className: cx("rounded-2xl border-2 p-4", E.wantsConnected(a) ? "border-salus-cyan bg-salus-cyan/5" : "border-slate-200 bg-white opacity-70") },
              h("div", { className: "font-bold text-salus-navy text-sm mb-1" }, "Avec la passerelle"),
              h("p", { className: "text-xs text-slate-600 leading-relaxed" }, "Vous gardez le contrôle à distance, recevez les alertes, et votre installateur peut vous aider sans se déplacer.")),
            h("div", { className: cx("rounded-2xl border-2 p-4", !E.wantsConnected(a) ? "border-salus-cyan bg-salus-cyan/5" : "border-slate-200 bg-white opacity-70") },
              h("div", { className: "font-bold text-salus-navy text-sm mb-1" }, "Sans la passerelle"),
              h("p", { className: "text-xs text-slate-600 leading-relaxed" }, "Chaque réglage se fait sur l'appareil lui-même. Rien n'est perdu : la passerelle peut s'ajouter plus tard."))),
          h(VideoPlaceholder, { label: "L'application Salus en usage réel", duration: "0:40" }))
      },
      {
        id: "presence", step: 2,
        title: "En semaine, vous êtes plutôt…",
        sub: "Le programme proposé s'adapte à votre rythme réel.",
        valid: a => !!a.presence,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Souvent à la maison", selected: a.presence === "home_days", onClick: () => set({ presence: "home_days" }, true) }),
          h(ChoiceCard, { label: "Absent en journée", selected: a.presence === "away_weekdays", onClick: () => set({ presence: "away_weekdays" }, true) }),
          h(ChoiceCard, { label: "Horaires variables", selected: a.presence === "variable", onClick: () => set({ presence: "variable" }, true) }))
      },
      {
        id: "constructionPeriod", step: 2,
        title: "Votre logement date de quand, environ ?",
        sub: "Sert uniquement à estimer vos économies — une fourchette, jamais un chiffre unique.",
        valid: a => !!a.constructionPeriod,
        render: (a, set) => h("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3" },
          Object.entries(COPY.consumptionByPeriod).map(([id, p]) => h(ChoiceCard, {
            key: id, label: p.label, selected: a.constructionPeriod === id, onClick: () => set({ constructionPeriod: id }, true)
          })))
      },
      {
        id: "currentControl", step: 2,
        title: "Comment votre chauffage est-il régulé aujourd'hui ?",
        valid: a => !!a.currentControl,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" },
          h(ChoiceCard, { label: "Aucune régulation", hint: "Ça chauffe, point.", selected: a.currentControl === "none", onClick: () => set({ currentControl: "none" }, true) }),
          h(ChoiceCard, { label: "Un seul thermostat", selected: a.currentControl === "single_stat", onClick: () => set({ currentControl: "single_stat" }, true) }),
          h(ChoiceCard, { label: "Robinets thermostatiques manuels", selected: a.currentControl === "trv_manual", onClick: () => set({ currentControl: "trv_manual" }, true) }),
          h(ChoiceCard, { label: "Déjà pièce par pièce", selected: a.currentControl === "multi", onClick: () => set({ currentControl: "multi" }, true) }))
      },
      {
        id: "budget", step: 2,
        title: "Avez-vous un budget en tête ?",
        sub: "Un niveau au-dessus de votre budget restera visible, avec l'écart affiché — à vous de décider.",
        valid: () => true,
        render: (a, set) => h("div", { className: "max-w-md space-y-4" },
          h("label", { className: "flex items-center gap-2 text-sm text-slate-600 cursor-pointer" },
            h("input", { type: "checkbox", checked: a.budget == null, onChange: e => set({ budget: e.target.checked ? null : 900 }), className: "accent-[#00AEEF] w-4 h-4" }),
            "Pas de budget défini"),
          a.budget != null && h("div", null,
            h("input", {
              type: "range", min: 200, max: 3000, step: 50, value: a.budget,
              onChange: e => set({ budget: parseInt(e.target.value, 10) }),
              className: "w-full accent-[#00AEEF]"
            }),
            h("div", { className: "text-center font-ubuntu text-2xl font-bold text-salus-navy mt-1" }, eur(a.budget))))
      },
      {
        id: "postalCode", step: 2,
        title: "Votre code postal ?",
        sub: t("Pour vous proposer les installateurs Club Pro de votre secteur.", "Pour le routage vers le commercial et les Club Pro du secteur."),
        valid: a => (a.postalCode || "").length >= 4,
        render: (a, set) => h("input", {
          type: "text", inputMode: "numeric", maxLength: 5, value: a.postalCode || "",
          onChange: e => set({ postalCode: e.target.value.replace(/\D/g, "") }),
          placeholder: "69100",
          className: "w-40 rounded-xl border border-slate-300 px-4 py-3 text-lg font-semibold tracking-widest focus:outline-none focus:border-salus-cyan"
        })
      }
    ];
  }

  function SituationsRow({ ids }) {
    return h("div", { className: "grid sm:grid-cols-2 gap-3 mb-4" },
      COPY.situations.filter(s => ids.includes(s.id)).map(s =>
        h("div", { className: "flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3" },
          h("img", { src: s.img, alt: "", className: "w-16 h-16 rounded-xl object-cover bg-slate-100 shrink-0" }),
          h("p", { className: "text-sm text-slate-600 italic leading-snug" }, "« " + s.text + " »"))));
  }

  /* ---------- Constructeur de pièces ---------- */
  function RoomBuilder({ a, set }) {
    const rooms = a.rooms || [];
    const nextId = rooms.reduce((m, r) => Math.max(m, r.id), 0) + 1;
    const addRoom = (type) => {
      const t = COPY.roomTypes.find(x => x.id === type);
      const count = rooms.filter(r => r.type === type).length;
      set({
        rooms: [...rooms, {
          id: nextId, type, name: t.label.split(" /")[0] + (count ? " " + (count + 1) : ""),
          floor: 0, radiators: 1
        }]
      });
    };
    return h("div", null,
      h("div", { className: "flex flex-wrap gap-2 mb-4" },
        COPY.roomTypes.map(t => h("button", {
          key: t.id, onClick: () => addRoom(t.id),
          className: "rounded-full border-2 border-slate-200 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-600 hover:border-salus-cyan hover:text-salus-navy transition"
        }, "+ " + t.label))),
      rooms.length === 0 && h("p", { className: "text-sm text-slate-400 italic" }, "Ajoutez au moins une pièce avec les boutons ci-dessus."),
      h("div", { className: "space-y-2" },
        rooms.map(r => h("div", { key: r.id, className: "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5" },
          h("img", { src: (COPY.roomTypes.find(t => t.id === r.type) || {}).img, className: "w-8 h-8 rounded-lg object-cover bg-slate-100", alt: "" }),
          h("input", {
            value: r.name, onChange: e => set({ rooms: rooms.map(x => x.id === r.id ? { ...x, name: e.target.value } : x) }),
            className: "flex-1 min-w-0 rounded-lg border border-transparent hover:border-slate-200 focus:border-salus-cyan px-2 py-1 text-sm font-semibold text-salus-navy focus:outline-none bg-transparent"
          }),
          (a.floors || 0) > 0 && h("select", {
            value: r.floor || 0, onChange: e => set({ rooms: rooms.map(x => x.id === r.id ? { ...x, floor: parseInt(e.target.value, 10) } : x) }),
            className: "rounded-lg border border-slate-200 text-xs px-2 py-1.5 text-slate-600 bg-white"
          },
            h("option", { value: 0 }, "RDC"),
            Array.from({ length: a.floors }, (_, i) => h("option", { key: i + 1, value: i + 1 }, "Étage " + (i + 1)))),
          h("button", {
            onClick: () => set({ rooms: rooms.filter(x => x.id !== r.id) }),
            className: "w-7 h-7 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 font-bold shrink-0"
          }, "✕")))));
  }

  /* ---------- Proposition précoce (P8) ---------- */
  function EarlyEstimateBar({ answers, visible, onSee }) {
    const est = useMemo(() => visible ? E.earlyEstimate(assignEmitters(answers)) : null, [answers, visible]);
    if (!est) return null;
    return h("div", { className: "fixed bottom-0 inset-x-0 z-[50] pointer-events-none" },
      h("div", { className: "max-w-3xl mx-auto px-4 pb-4" },
        h("div", { className: "pointer-events-auto rounded-2xl bg-salus-navy text-white shadow-2xl px-5 py-3.5 flex items-center justify-between gap-3 fadeUp" },
          h("div", null,
            h("div", { className: "text-[10px] uppercase tracking-wider text-salus-cyan font-bold" }, "Votre solution se construit"),
            h("div", { className: "text-sm font-semibold flex items-baseline gap-2" },
              "≈ " + eur(est.total),
              h("span", { className: "text-[9px] uppercase bg-amber-400/20 text-amber-200 rounded px-1.5 py-0.5 font-bold" }, "prix fictif · beta"),
              h("span", { className: "text-white/50 text-xs" }, "· " + est.deviceCount + " appareils — s'affine à chaque réponse"))),
          onSee && h(Btn, { kind: "primary", className: "!py-2 !text-xs shrink-0", onClick: onSee }, "Voir"))));
  }

  /* ---------- Écran d'accueil ---------- */
  function Landing({ onStart, onDemo, onReplace, onAbout, saved, onResume }) {
    return h("div", { className: "relative overflow-hidden" },
      h("div", { className: "arcs absolute inset-0 pointer-events-none" }),
      h("div", { className: "max-w-5xl mx-auto px-4 pt-12 pb-20 relative" },
        h("div", { className: "text-center max-w-2xl mx-auto mb-10 fadeUp" },
          h("img", { src: "assets/hero/logo-salus.png", alt: "SALUS Controls", className: "h-10 mx-auto mb-6" }),
          h("h1", { className: "font-ubuntu text-3xl md:text-4xl font-bold text-salus-navy leading-tight" },
            "Du besoin à la solution, ", h("span", { className: "text-salus-cyan" }, "en moins de dix questions")),
          h("p", { className: "text-slate-500 mt-3 text-sm md:text-base" },
            "Décrivez votre logement et vos habitudes : le configurateur compose le système Salus complet — produits, prix, schéma, documents — sans jamais vous montrer un catalogue.")),

        saved && h("div", { className: "max-w-xl mx-auto mb-8 fadeUp" },
          h(InfoBox, { tone: "info", title: "Un projet vous attend — " + saved.projectCode },
            h("div", { className: "flex items-center justify-between gap-3 mt-1" },
              h("span", { className: "text-xs" }, "Vos réponses sont conservées : reprenez exactement où vous vous étiez arrêté."),
              h(Btn, { className: "!py-1.5 !text-xs shrink-0", onClick: onResume }, "Reprendre")))),

        h("div", { className: "max-w-3xl mx-auto mb-4 text-center" },
          h("h2", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, "Qui êtes-vous ?"),
          h("p", { className: "text-xs text-slate-500 mt-1 mb-5" },
            "On vous le demande pour adapter les mots et le niveau de détail : un particulier voit des questions simples et illustrées, un installateur va plus vite avec le vocabulaire du métier — et des outils en plus (pré-visite, devis, docs techniques).")),
        h("div", { className: "grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto" },
          h("button", { onClick: () => onStart("user"), className: "tile text-left rounded-3xl border-2 border-slate-200 bg-white p-6 hover:border-salus-cyan" },
            h("img", { src: "assets/hero/profil-particulier.png", alt: "", className: "w-full h-36 object-cover rounded-2xl mb-4 bg-slate-100" }),
            h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, "Je suis particulier"),
            h("p", { className: "text-sm text-slate-500 mt-1" }, "Des questions simples, en images. Votre solution en trois niveaux, expliquée pièce par pièce."),
            h("div", { className: "mt-3 text-salus-cyan font-bold text-sm" }, "Commencer →")),
          h("button", { onClick: () => onStart("installer"), className: "tile text-left rounded-3xl border-2 border-slate-200 bg-white p-6 hover:border-salus-cyan" },
            h("img", { src: "assets/hero/profil-installateur.png", alt: "", className: "w-full h-36 object-cover rounded-2xl mb-4 bg-slate-100" }),
            h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy flex items-center gap-2" }, "Je suis installateur",
              h("span", { className: "text-[9px] bg-salus-navy text-white rounded-full px-2 py-0.5 uppercase tracking-wide" }, "Espace pro")),
            h("p", { className: "text-sm text-slate-500 mt-1" }, "Vocabulaire métier, questionnaire de pré-visite client, devis prêt pour votre distributeur."),
            h("div", { className: "mt-3 text-salus-cyan font-bold text-sm" }, "Commencer →"))),

        h("div", { className: "flex flex-wrap justify-center gap-3 mt-8" },
          h(Btn, { kind: "navy", onClick: onDemo }, "▶ " + COPY.demoScenario.label),
          h(Btn, { kind: "ghost", onClick: onReplace }, "Remplacer un produit existant"),
          h(Btn, { kind: "ghost", onClick: onAbout }, "À propos de cette BETA")),
        h("p", { className: "text-center text-[11px] text-slate-400 mt-3" }, COPY.demoScenario.description)));
  }

  /* ---------- Module remplacement (P15) ---------- */
  function ReplaceView({ onBack, onStartConfig }) {
    const [q, setQ] = useState("");
    const results = useMemo(() => E.searchReplacement(q), [q]);
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "← Accueil"),
      h(SectionTitle, { sub: "Saisissez le produit déjà en place — même un produit concurrent, même avec une faute de frappe. Le configurateur propose l'équivalent Salus et ce qu'il faut en plus." }, "Remplacer un produit existant"),
      h("div", { className: "flex gap-2 mb-2" },
        h("input", {
          value: q, onChange: e => setQ(e.target.value), placeholder: "Ex. : Tybox 1117, Netatmo, evohome, RT500RF…",
          className: "flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-salus-cyan"
        }),
        h(Btn, { kind: "ghost", onClick: () => alert("BETA : en production, une photo de l'étiquette suffirait — reconnaissance du modèle incluse.") }, "📷 Photo de l'étiquette")),
      h("p", { className: "text-[11px] text-slate-400 mb-5" }, "Couverts en priorité : Delta Dore, Netatmo, Honeywell, Tado — et les anciennes gammes Salus. (Table BETA : 10 équivalences.)"),
      q.length >= 2 && results.length === 0 && h(InfoBox, { tone: "warn", title: "Pas trouvé dans la table BETA" }, "En production, la saisie partirait en demande qualifiée : un technicien Salus identifierait l'équivalence et elle enrichirait la table."),
      h("div", { className: "space-y-3" },
        results.map((r, i) => {
          const p = CAT.products[r.to] || {};
          return h("div", { key: i, className: "rounded-2xl border border-slate-200 bg-white p-4 fadeUp" },
            h("div", { className: "flex items-center gap-3 flex-wrap" },
              h("span", { className: "text-sm text-slate-500" }, r.brand + " " + r.from),
              h("span", { className: "text-salus-cyan font-bold" }, "→"),
              h("img", { src: p.img, className: "w-10 h-10 rounded-lg bg-slate-100 object-cover", alt: "" }),
              h("div", { className: "flex-1 min-w-[140px]" },
                h("div", { className: "font-bold text-salus-navy text-sm" }, p.ref),
                h("div", { className: "text-xs text-slate-500" }, p.name)),
              h(PriceTag, { value: p.price })),
            r.alsoNeeds.length > 0 && h("div", { className: "text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mt-2.5" },
              "Nécessite en plus : " + r.alsoNeeds.map(ref => (CAT.products[ref] || {}).ref || ref).join(", ")),
            h("div", { className: "text-xs text-slate-600 mt-2.5" }, h("b", null, "Câblage : "), r.wiring),
            h("div", { className: "text-xs text-slate-600 mt-1" }, h("b", null, "Ce qui change : "), r.note));
        })),
      h("div", { className: "mt-8 text-center" },
        h("p", { className: "text-sm text-slate-500 mb-3" }, "Le remplacement est aussi l'occasion de repenser le système complet :"),
        h(Btn, { onClick: onStartConfig }, "Configurer ma solution complète →")));
  }

  /* ---------- Pré-visite installateur (P9) ---------- */
  function PrevisitView({ onBack, onLoadPrefilled }) {
    const [stage, setStage] = useState(0);
    const link = "configurateur.salus.fr/previsite/SC-" + (1000 + Math.floor(Math.random() * 0) + 4821);
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "← Retour"),
      h(SectionTitle, { sub: "Le client répond chez lui, avec photos ; vous arrivez sur site avec le matériel déjà chiffré." }, "Préparer une visite"),
      stage === 0 && h("div", { className: "space-y-4" },
        h("p", { className: "text-sm text-slate-600" }, "Un lien unique part au client. Il répond aux questions du parcours particulier et envoie trois photos demandées explicitement : ",
          h("b", null, "le générateur"), ", ", h("b", null, "un radiateur avec sa vanne"), ", ", h("b", null, "le tableau électrique"), "."),
        h(Btn, { onClick: () => { setStage(1); CRM.logEvent("previsit", "Lien de pré-visite créé (simulation)", CRM.leadPayload({ profile: "installer" }, {}), CRM.flows.previsit); } }, "Créer le lien de pré-visite")),
      stage >= 1 && h("div", { className: "space-y-4" },
        h(InfoBox, { tone: "ok", title: "Lien créé (simulation)" },
          h("div", { className: "flex items-center justify-between gap-2 flex-wrap" },
            h("code", { className: "text-xs bg-white rounded px-2 py-1 border border-emerald-200" }, link),
            h(Btn, { kind: "ghost", className: "!py-1 !text-xs", onClick: () => alert("BETA : lien fictif copié — en production, envoi par SMS ou email.") }, "Copier"))),
        stage === 1 && h(Btn, { kind: "navy", onClick: () => setStage(2) }, "▶ Simuler : le client a répondu"),
        stage >= 2 && h("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 space-y-4 fadeUp" },
          h("div", { className: "flex items-center gap-2" },
            h("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }),
            h("span", { className: "text-sm font-bold text-salus-navy" }, "Réponse reçue lundi 21 h 04 — configuration pré-remplie")),
          h("ul", { className: "text-sm text-slate-600 space-y-1" },
            h("li", null, "• Maison des années 1990, 120 m², 5 pièces, un étage"),
            h("li", null, "• Plancher chauffant au RDC, 3 radiateurs eau à l'étage — filetage de vanne standard visible sur photo"),
            h("li", null, "• Chaudière gaz murale, accessible"),
            h("li", null, "• Souhaite le pilotage à distance")),
          h("div", { className: "grid grid-cols-3 gap-2.5" },
            ["photo-generateur", "photo-radiateur-vanne", "photo-tableau"].map(id =>
              h("div", { key: id, className: "rounded-xl bg-slate-100 h-24 flex items-center justify-center text-[10px] text-slate-400 border border-dashed border-slate-300 text-center px-2" },
                "[ " + id + ".jpg — photo client simulée ]"))),
          h(Btn, { className: "w-full", onClick: onLoadPrefilled }, "Ouvrir la configuration pré-remplie → valider ou corriger"))));
  }

  /* ---------- Dossier qualifié (P9/P16) ---------- */
  function QualifiedView({ answers, reasons, projectCode, onBack, onBackstage }) {
    useEffect(() => {
      CRM.logEvent("qualified", "Dossier qualifié préparé et transmis (simulation)",
        CRM.qualifiedFilePayload(answers, reasons, { projectCode }), CRM.flows.qualified);
    }, []);
    const est = E.earlyEstimate(assignEmitters(answers));
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h("div", { className: "text-center mb-8" },
        h("div", { className: "w-16 h-16 mx-auto rounded-full bg-salus-cyan/10 flex items-center justify-center text-3xl mb-3" }, "🧑‍🔧"),
        h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy" }, "Votre projet mérite une validation humaine"),
        h("p", { className: "text-sm text-slate-500 mt-2 max-w-xl mx-auto" },
          "Rien n'est bloqué : le configurateur a préparé un dossier complet avec sa recommandation, et un technicien Salus vous rappelle ", h("b", null, "sous 48 h"), ". C'est un service, pas une impasse.")),
      h(InfoBox, { tone: "info", title: "Pourquoi une validation ?" },
        h("ul", { className: "list-disc ml-4 space-y-1 mt-1" }, reasons.map((r, i) => h("li", { key: i }, r)))),
      est && h("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 mt-4" },
        h("div", { className: "text-xs uppercase tracking-wide text-slate-400 font-bold mb-2" }, "Recommandation préparée pour le technicien (base de travail)"),
        h("div", { className: "flex items-baseline gap-2" },
          h(PriceTag, { value: est.total, size: "lg" }),
          h("span", { className: "text-xs text-slate-400" }, "· " + est.deviceCount + " appareils · hypothèses à confirmer")),
        h("p", { className: "text-xs text-slate-500 mt-2" }, "Chaque correction du technicien devient une règle du configurateur : c'est ainsi que l'outil apprend.")),
      h("div", { className: "flex flex-wrap gap-3 mt-6 justify-center" },
        h(Btn, { kind: "navy", onClick: onBackstage }, "Voir le dossier qui partirait (coulisses) →"),
        h(Btn, { kind: "ghost", onClick: onBack }, "← Modifier mes réponses")));
  }

  /* ---------- À propos de la BETA ---------- */
  function AboutView({ onBack }) {
    const rows = [
      ["Parcours en 4 étapes nommées, une question par écran", "P3, P5"],
      ["Besoins → système abstrait → produits (jamais de catalogue d'abord)", "P2"],
      ["Compatibilité 3 états, produits grisés avec raison, complétude vérifiée", "P1"],
      ["Proposition précoce mise à jour en direct + 3 actions finales", "P7"],
      ["3 niveaux Essential / Comfort / Premium calculés par règles + variantes + packs", "P4, P24"],
      ["Vue logement pièce par pièce + « Autre choix » par ligne", "P6"],
      ["Connectivité conclue des usages, jamais demandée + 4 situations vécues", "P11, P12"],
      ["Règles de portée radio → répéteur ajouté, jamais de blocage", "P10"],
      ["Module remplacement (concurrents + anciens Salus), tolérant aux fautes", "P14"],
      ["Dossier qualifié : tertiaire, >12 zones, générateur non couvert", "P9, P15"],
      ["Vidéos attachées au bon moment du parcours", "P16"],
      ["Schéma système généré (filaire plein / radio pointillé)", "P17"],
      ["Prix live, prix public conseillé, Club Pro par code postal", "P18"],
      ["Économies en fourchette, méthode EN 15232 consultable", "P19"],
      ["Guide d'installation unique en 5 séquences, généré en PDF", "P20"],
      ["Bénéfices pièce par pièce depuis VOS pièces déclarées", "P21"],
      ["Code projet + reprise exacte + lien email (alimente le CRM)", "P23"],
      ["Budget : niveau au-dessus visible et grisé avec l'écart", "P24"],
      ["Devis Zoho au prix public + message distributeur", "P25"],
      ["Chaque configuration = un enregistrement Zoho (voir Coulisses)", "P26"],
      ["Pré-visite installateur : lien client + 3 photos + config pré-remplie", "P8"],
      ["Docs filtrés sur la configuration, les manquants affichés manquants", "P13"]
    ];
    const additions = [
      "Écran de comparaison des niveaux (couvre P22, seul problème sans solution dans le fichier atelier)",
      "Bouton scénario démo (présentation interne en un clic)",
      "Cette page « À propos » elle-même"
    ];
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "← Retour"),
      h(SectionTitle, { sub: "Chaque écran de cette maquette vient d'un problème identifié par l'équipe dans l'atelier (fichier Problems / Solutions)." }, "À propos de cette BETA"),
      h(InfoBox, { tone: "warn", title: "Ce qui est simulé dans cette version" },
        "Prix (fictifs, mention sur chacun) · documents (substitution, structure réelle) · CRM Zoho (payloads visibles en coulisses, rien n'est envoyé) · emails et SMS · photos de pré-visite · installateurs Club Pro · visuels (placeholders). Les références produits sont réelles ; celles marquées « réf. à confirmer » sont à valider."),
      h("div", { className: "rounded-2xl border border-slate-200 bg-white overflow-hidden mt-4" },
        h("table", { className: "w-full text-sm" },
          h("thead", null, h("tr", { className: "bg-salus-navy text-white text-left" },
            h("th", { className: "px-4 py-2.5 font-semibold" }, "Fonctionnalité de la maquette"),
            h("th", { className: "px-4 py-2.5 font-semibold w-24" }, "Atelier"))),
          h("tbody", null, rows.map(([f, p], i) => h("tr", { key: i, className: i % 2 ? "bg-slate-50" : "" },
            h("td", { className: "px-4 py-2 text-slate-600" }, f),
            h("td", { className: "px-4 py-2 font-bold text-salus-cyan" }, p)))))),
      h("div", { className: "mt-4" },
        h(InfoBox, { tone: "info", title: "Ajouts hors atelier (validés par Mathieu)" },
          h("ul", { className: "list-disc ml-4 space-y-0.5 mt-1" }, additions.map((x, i) => h("li", { key: i }, x))))));
  }

  /* ---------- Application ---------- */
  function App() {
    const [state, setState] = useState(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY));
        if (saved && saved.answers) return { ...saved, view: "landing", backstage: false, _saved: saved };
      } catch (e) { /* stockage indisponible : on démarre à vide */ }
      return { view: "landing", answers: {}, pos: 0, maxPos: 0, selection: { level: "comfort" }, projectCode: null, backstage: false };
    });
    const { view, answers, pos, selection, projectCode, backstage } = state;
    const maxPos = Math.max(state.maxPos || 0, pos);
    const isPro = answers.profile === "installer";
    const questions = useMemo(() => buildQuestions(isPro), [isPro]);
    const applicable = questions.filter(q => !q.applicable || q.applicable(answers, isPro));

    /* Persistance (P23) */
    useEffect(() => {
      if (!projectCode) return;
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ answers, pos, maxPos, selection, projectCode, view: view === "landing" ? "wizard" : view, savedAt: Date.now() }));
      } catch (e) { /* quota / navigation privée */ }
    }, [answers, pos, selection, projectCode, view]);

    const update = (patch) => setState(s => ({ ...s, ...patch }));

    const setAnswers = (patch, autoNext) => setState(s => {
      let a = { ...s.answers, ...patch };
      if ("emitterMain" in patch || "emitterUpper" in patch || "floors" in patch) a = assignEmitters(a);
      const code = s.projectCode || ("SC-" + (1000 + Math.floor(Math.random() * 9000)));
      if (!s.projectCode) CRM.logEvent("lead", "Lead créé à la première réponse — " + code,
        CRM.leadPayload(a, { projectCode: code }), CRM.flows.lead);
      const next = autoNext ? s.pos + 1 : s.pos;
      return { ...s, answers: a, projectCode: code, pos: next, maxPos: Math.max(s.maxPos || 0, next) };
    });

    const start = (profile) => {
      update({ view: "wizard", pos: 0 });
      setAnswers({ profile });
    };

    const goResult = () => {
      const a = assignEmitters(answers);
      const qf = E.qualifiedFileCheck(a);
      CRM.logEvent("lead", "Parcours terminé — étape « Ma solution » atteinte",
        CRM.leadPayload(a, { projectCode, level: selection.level }), CRM.flows.lead);
      update({ answers: a, maxPos: applicable.length - 1, view: qf.qualified ? "qualified" : "result", qualifiedReasons: qf.reasons });
    };

    const loadDemo = () => {
      const a = assignEmitters({ ...COPY.demoScenario.answers });
      const code = "SC-4821";
      CRM.logEvent("lead", "Scénario démo chargé — " + code, CRM.leadPayload(a, { projectCode: code, level: "comfort" }), CRM.flows.lead);
      setState(s => ({ ...s, answers: a, projectCode: code, selection: { level: "comfort" }, pos: applicable.length - 1, maxPos: applicable.length - 1, view: "result", demo: true }));
    };

    const restart = () => {
      try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignoré */ }
      CRM.logEvent("lead", "Projet réinitialisé", { module: "Leads", note: "En production : le lead resterait, marqué « abandonné » — relance à 48 h." }, CRM.flows.lead);
      setState({ view: "landing", answers: {}, pos: 0, maxPos: 0, selection: { level: "comfort" }, projectCode: null, backstage: false });
    };

    /* --- Assistant (wizard) --- */
    const q = applicable[Math.min(pos, applicable.length - 1)];
    const stepOfQ = q ? q.step : 3;
    const maxStepReached = Math.max(...applicable.slice(0, Math.min(maxPos, applicable.length - 1) + 1).map(x => x.step), 0);
    const showEstimate = view === "wizard" && (stepOfQ >= 2 || (stepOfQ === 1 && !!answers.emitterMain));

    const wizardNext = () => {
      if (pos >= applicable.length - 1) { goResult(); return; }
      const prevStep = applicable[pos].step, nextStep = applicable[pos + 1].step;
      if (nextStep !== prevStep) CRM.logEvent("lead", "Étape « " + COPY.steps[prevStep].label + " » complétée — lead mis à jour",
        CRM.leadPayload(answers, { projectCode, abandonStep: COPY.steps[nextStep].label }), CRM.flows.lead);
      update({ pos: pos + 1, maxPos: Math.max(maxPos, pos + 1) });
    };
    const wizardBack = () => {
      if (pos === 0) { update({ view: "landing" }); return; }
      update({ pos: pos - 1 });
    };
    const jumpToStep = (stepIdx) => {
      const idx = applicable.findIndex(x => x.step === stepIdx);
      if (idx >= 0) update({ pos: idx, view: "wizard" });
    };

    const wizard = q && h("div", { className: "max-w-3xl mx-auto px-4 pb-28" },
      h("div", { className: "sticky top-[34px] z-[40] -mx-4 px-4 py-3 bg-[#f5fbff]/90 backdrop-blur border-b border-slate-200/60 mb-8 flex items-center justify-between gap-2" },
        h(StepBar, { steps: COPY.steps, current: stepOfQ, maxReached: maxStepReached, onJump: jumpToStep }),
        isPro && h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-[11px] shrink-0", onClick: () => update({ view: "previsit" }) }, "Préparer une visite")),
      h("div", { key: q.id, className: "fadeUp" },
        h("div", { className: "text-[11px] font-bold uppercase tracking-wider text-salus-cyan mb-2" },
          COPY.steps[q.step].label + " · question " + (applicable.filter(x => x.step === q.step).indexOf(q) + 1) + "/" + applicable.filter(x => x.step === q.step).length),
        h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy mb-1.5" },
          typeof q.title === "function" ? q.title(answers) : q.title),
        q.sub && h("p", { className: "text-sm text-slate-500 mb-6" }, typeof q.sub === "function" ? q.sub(answers) : q.sub),
        q.render(answers, setAnswers),
        h("div", { className: "flex items-center justify-between mt-8" },
          h(Btn, { kind: "subtle", onClick: wizardBack }, "← Précédent"),
          h(Btn, { onClick: wizardNext, disabled: !q.valid(answers) },
            pos >= applicable.length - 1 ? "Voir ma solution →" : (q.isConclusion ? "Continuer →" : "Suivant →")))));

    return h(React.Fragment, null,
      h(BetaBanner, { onAbout: () => update({ view: "about", _backView: view }), onBackstage: () => update({ backstage: true }) }),
      h("div", { className: "pt-[34px] min-h-screen" },
        view === "landing" && h(Landing, {
          onStart: start, onDemo: loadDemo,
          onReplace: () => update({ view: "replace" }),
          onAbout: () => update({ view: "about", _backView: "landing" }),
          saved: state._saved && state._saved.projectCode ? state._saved : null,
          onResume: () => setState(s => ({ ...s, ...s._saved, view: s._saved.view || "wizard", backstage: false, _saved: null }))
        }),
        view === "wizard" && wizard,
        view === "result" && h(window.SalusResult.Result, {
          answers, selection,
          setSelection: (fn) => setState(s => ({ ...s, selection: typeof fn === "function" ? fn(s.selection) : fn })),
          projectCode,
          onOpenBackstage: () => update({ backstage: true }),
          onRestart: restart,
          onEdit: () => update({ view: "wizard", pos: 0 })
        }),
        view === "qualified" && h(QualifiedView, {
          answers, reasons: state.qualifiedReasons || [], projectCode,
          onBack: () => update({ view: "wizard", pos: 0 }),
          onBackstage: () => update({ backstage: true })
        }),
        view === "replace" && h(ReplaceView, { onBack: () => update({ view: "landing" }), onStartConfig: () => start(answers.profile || "user") }),
        view === "previsit" && h(PrevisitView, {
          onBack: () => update({ view: answers.profile ? "wizard" : "landing" }),
          onLoadPrefilled: () => {
            const a = assignEmitters({ ...COPY.demoScenario.answers, profile: "installer" });
            CRM.logEvent("previsit", "Configuration pré-remplie ouverte par l'installateur (simulation)", CRM.leadPayload(a, { projectCode: "SC-4821" }), CRM.flows.previsit);
            setState(s => ({ ...s, answers: a, projectCode: "SC-4821", selection: { level: "comfort" }, view: "result" }));
          }
        }),
        view === "about" && h(AboutView, { onBack: () => update({ view: state._backView || "landing" }) })),
      h(EarlyEstimateBar, { answers, visible: showEstimate, onSee: stepOfQ >= 2 ? goResult : null }),
      view === "result" && h("button", {
        onClick: () => update({ backstage: true }),
        className: "fixed bottom-5 right-5 z-[55] rounded-full bg-salus-navy text-white shadow-2xl px-4 py-3 text-xs font-bold flex items-center gap-2 hover:bg-[#2a3a77] transition"
      }, "⚙ Coulisses CRM"),
      h(Backstage, { open: backstage, onClose: () => update({ backstage: false }), answers, projectCode, selection }));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
