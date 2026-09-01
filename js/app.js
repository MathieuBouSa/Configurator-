/* ============================================================
   SALUS Configurator BETA - Application (unified journey)
   ------------------------------------------------------------
   One journey only: My home -> My heating -> My habits -> My
   solution (P4). One question per screen, clickable cards,
   vocabulary matched to the profile (P6). Early proposal updated
   live (P8). Resume by project code (P23). Qualified file for
   cases outside the automatic path (P9/P15).
   ============================================================ */

(function () {
  const { h, cx, eur, Icon, IconTile, PriceTag, Btn, ChoiceCard, SectionTitle, Modal, VideoPlaceholder, StepBar, InfoBox, Stepper } = window.UI;
  const { useState, useEffect, useMemo, useRef } = React;
  const E = window.SalusEngine;
  const CAT = window.SALUS_CATALOG;
  const MKT = window.SALUS_MARKETS;
  const COPY = window.SALUS_COPY;
  const CRM = window.SalusCRM;

  const LS_KEY = "salus_beta_state_v1";

  /* ---------- Permanent BETA banner (absolute rule) ---------- */
  function BetaBanner({ onAbout, onBackstage }) {
    return h("div", { className: "fixed top-0 inset-x-0 z-[60] bg-amber-400 text-salus-navy" },
      h("div", { className: "max-w-6xl mx-auto px-3 py-1.5 flex items-center justify-between gap-2 text-[11px] md:text-xs font-semibold" },
        h("span", { className: "flex items-center gap-2 min-w-0" },
          h("span", { className: "bg-salus-navy text-amber-300 rounded px-1.5 py-0.5 font-bold tracking-wider shrink-0" }, "BETA"),
          h("span", { className: "truncate" }, "Internal demo - fictional prices / test documents / simulated CRM. No data is ever sent.")),
        h("span", { className: "flex items-center gap-3 shrink-0" },
          h("button", { onClick: onBackstage, className: "underline underline-offset-2 hover:opacity-70" }, "CRM backstage"),
          h("button", { onClick: onAbout, className: "underline underline-offset-2 hover:opacity-70" }, "About"))));
  }

  /* ---------- "CRM backstage" panel (P26) ---------- */
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
              h("h3", { className: "font-ubuntu font-bold" }, "Backstage - what would happen on the CRM side"),
              h("p", { className: "text-xs text-white/60 mt-0.5" }, "Zoho CRM / BETA simulation - nothing leaves your browser")),
            h("button", { onClick: onClose, className: "w-8 h-8 rounded-full hover:bg-white/10 font-bold" }, "✕")),
          h("div", { className: "flex gap-1.5 mt-3" },
            [["flux", "The real flows"], ["payload", "Live payload"], ["journal", "Log (" + log.length + ")"]].map(([id, label]) =>
              h("button", {
                key: id, onClick: () => setTab(id),
                className: cx("rounded-full px-3 py-1 text-xs font-semibold", tab === id ? "bg-salus-cyan text-white" : "bg-white/10 text-white/70 hover:bg-white/20")
              }, label)))),
        h("div", { className: "p-5 space-y-4" },
          tab === "flux" && Object.entries(CRM.flows).map(([id, f]) => h(FlowCard, { key: id, flow: f })),
          tab === "payload" && h("div", null,
            h("p", { className: "text-sm text-slate-600 mb-2" }, "The lead exactly as it would go out ", h("b", null, "right now"), ", with your current answers:"),
            h("div", { className: "text-xs text-slate-400 mb-1 font-mono" }, payload.endpoint),
            h("pre", { className: "bg-salus-navy text-emerald-300 text-[11px] leading-relaxed rounded-xl p-4 overflow-x-auto" },
              JSON.stringify(payload.data[0], null, 2))),
          tab === "journal" && (log.length
            ? log.map((e, i) => h(JournalEntry, { key: i, e }))
            : h("p", { className: "text-sm text-slate-400" }, "No events yet - move through the journey, generate a quote or email the list.")))));
  }

  function FlowCard({ flow }) {
    const [openF, setOpenF] = useState(false);
    return h("div", { className: "rounded-xl border border-slate-200" },
      h("button", { onClick: () => setOpenF(!openF), className: "w-full text-left px-4 py-3 flex items-center justify-between" },
        h("span", { className: "font-semibold text-salus-navy text-sm" }, flow.title),
        h("span", { className: "text-slate-400" }, openF ? "−" : "+")),
      openF && h("div", { className: "px-4 pb-4 space-y-2 text-sm text-slate-600" },
        h("p", null, flow.what),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Data sent: "), flow.dataSent),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Record: "), flow.record),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "Notifications: "),
          h("ul", { className: "list-disc ml-5 mt-1 space-y-0.5" }, flow.notifications.map((n, i) => h("li", { key: i }, n)))),
        h("div", null, h("b", { className: "text-salus-navy text-xs uppercase" }, "And then: "), flow.next)));
  }

  function JournalEntry({ e }) {
    const [openJ, setOpenJ] = useState(false);
    return h("div", { className: "rounded-xl border border-slate-200 px-4 py-3" },
      h("div", { className: "flex items-center justify-between gap-2" },
        h("div", null,
          h("div", { className: "text-sm font-semibold text-salus-navy" }, e.title),
          h("div", { className: "text-[10px] text-slate-400" }, new Date(e.at).toLocaleTimeString("en-GB") + " / module " + (e.payload && e.payload.module))),
        h("button", { onClick: () => setOpenJ(!openJ), className: "text-xs font-semibold text-salus-cyan hover:underline shrink-0" }, openJ ? "hide" : "payload")),
      openJ && h("pre", { className: "mt-2 bg-salus-navy text-emerald-300 text-[10px] leading-relaxed rounded-lg p-3 overflow-x-auto" },
        JSON.stringify(e.payload, null, 2)));
  }

  /* ---------- Assign emitters to rooms ---------- */
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

  /* ---------- Question definitions (one per screen) ---------- */
  function buildQuestions(isPro) {
    const t = (user, pro) => (isPro && pro) ? pro : user;
    const yesNo = (a, set, key, yesLabel, noLabel, extra) => h("div", { className: "grid sm:grid-cols-2 gap-3" },
      h(ChoiceCard, { label: yesLabel || "Yes", selected: a[key] === "yes", onClick: () => set({ [key]: "yes" }, true) }),
      h(ChoiceCard, { label: noLabel || "No", selected: a[key] === "no", onClick: () => set({ [key]: "no" }, true) }),
      extra);

    return [
      /* ============ STEP 1 - MY HOME ============ */
      {
        id: "homeType", step: 0,
        title: t("Where is your project?", "Building type on site?"),
        sub: t("The journey adapts: a commercial building goes to a dedicated study - never a dead end.", "Commercial buildings leave the automatic path and prepare a qualified file."),
        valid: a => !!a.homeType,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "A house", icon: "mdi:home-variant", selected: a.homeType === "house", onClick: () => set({ homeType: "house" }, true) }),
          h(ChoiceCard, { label: "A flat", icon: "mdi:home-city", selected: a.homeType === "flat", onClick: () => set({ homeType: "flat" }, true) }),
          h(ChoiceCard, { label: "A commercial building", hint: "Offices, retail, multi-dwelling...", icon: "mdi:office-building", selected: a.homeType === "tertiary", onClick: () => set({ homeType: "tertiary" }, true) }))
      },
      {
        id: "surface", step: 0,
        title: "Roughly what floor area needs heating?",
        sub: "A rough figure is enough - it feeds the savings estimate and the radio range check.",
        valid: a => a.surface > 0,
        render: (a, set) => h("div", null,
          h("div", { className: "flex flex-wrap gap-2 mb-4" },
            [60, 90, 120, 160, 200, 300].map(v => h("button", {
              key: v, onClick: () => set({ surface: v }),
              className: cx("rounded-full px-4 py-2 text-sm font-semibold border-2 transition", a.surface === v ? "border-salus-cyan bg-salus-cyan/10 text-salus-navy" : "border-slate-200 bg-white text-slate-500 hover:border-salus-cyan/50")
            }, v + " m2"))),
          h("div", { className: "flex items-center gap-3" },
            h("input", {
              type: "number", min: 10, max: 2000, value: a.surface || "",
              onChange: e => set({ surface: parseInt(e.target.value, 10) || 0 }),
              placeholder: "or type it in...",
              className: "w-40 rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-salus-cyan"
            }), h("span", { className: "text-sm text-slate-500" }, "m2")))
      },
      {
        id: "floors", step: 0,
        title: "Over how many floors?",
        sub: "A floor to cross may call for a radio repeater - the configurator will think of it for you.",
        valid: a => a.floors != null,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Single storey", icon: "mdi:home-floor-g", selected: a.floors === 0, onClick: () => set({ floors: 0 }, true) }),
          h(ChoiceCard, { label: "One upper floor", icon: "mdi:home-floor-1", selected: a.floors === 1, onClick: () => set({ floors: 1 }, true) }),
          h(ChoiceCard, { label: "Two or more", icon: "mdi:home-floor-2", selected: a.floors === 2, onClick: () => set({ floors: 2 }, true) }))
      },
      {
        id: "walls", step: 0,
        title: t("Your walls are mostly?", "Wall construction (radio range)?"),
        sub: "Thick walls slow radio signals down: better to know now.",
        valid: a => !!a.walls,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: t("Standard", "Standard partitions"), hint: "Brick, block, plasterboard...", icon: "mdi:bricks", selected: a.walls === "standard", onClick: () => set({ walls: "standard" }, true) }),
          h(ChoiceCard, { label: t("Thick or old", "Heavy masonry"), hint: "Stone, thick concrete...", icon: "mdi:wall", selected: a.walls === "thick", onClick: () => set({ walls: "thick" }, true) }),
          h(ChoiceCard, { label: "I don't know", icon: "mdi:help-circle-outline", selected: a.walls === "unknown", onClick: () => set({ walls: "unknown" }, true) }))
      },
      {
        id: "rooms", step: 0,
        title: "Which rooms do you want to heat (or cool)?",
        sub: "Add your rooms: the solution is calculated room by room, and so are your benefits.",
        valid: a => (a.rooms || []).length > 0,
        render: (a, set) => h(RoomBuilder, { a, set })
      },
      {
        id: "windows", step: 0,
        title: "Roughly how many windows?",
        sub: "Useful for the security pack: an alert when one opens, and heating cut if a window is left open.",
        valid: () => true,
        render: (a, set) => h("div", { className: "flex items-center gap-4" },
          h(Stepper, { value: a.windows || 0, onChange: v => set({ windows: v }), min: 0, max: 40 }),
          h("span", { className: "text-sm text-slate-500" }, "windows"))
      },
      {
        id: "wifiQuality", step: 0,
        title: "Does wi-fi reach everywhere in your home?",
        sub: "If wi-fi struggles, the radio of your future devices will probably struggle too - a repeater may be advised.",
        valid: a => !!a.wifiQuality,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Yes, everywhere", selected: a.wifiQuality === "good", onClick: () => set({ wifiQuality: "good" }, true) }),
          h(ChoiceCard, { label: "Some weak spots", selected: a.wifiQuality === "weak_spots", onClick: () => set({ wifiQuality: "weak_spots" }, true) }),
          h(ChoiceCard, { label: "I use wi-fi repeaters", hint: "A sign the house is hard on radio signals.", selected: a.wifiQuality === "has_repeaters", onClick: () => set({ wifiQuality: "has_repeaters" }, true) }))
      },

      /* ============ STEP 2 - MY HEATING ============ */
      {
        id: "generator", step: 1,
        title: t("What produces the heat (or the cool) in your home?", "Heat source in place?"),
        sub: "Every case appears, across France, the UK, Germany, Romania and Denmark - even with no matching product, the configurator prepares the next step.",
        valid: a => !!a.generator,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" },
          Object.values(MKT.generators).map(g => h(ChoiceCard, {
            key: g.id, label: g.label, hint: g.hint, icon: g.icon,
            badge: g.covered === false ? "dedicated study" : null,
            selected: a.generator === g.id, onClick: () => set({ generator: g.id }, true)
          })))
      },
      {
        id: "emitterMain", step: 1,
        title: a => (a.floors > 0 ? "How is the heat delivered on the ground floor?" : "How is the heat delivered in your home?"),
        sub: "The emitter is what decides how each room is controlled.",
        valid: a => !!a.emitterMain,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          Object.values(MKT.emitters).map(em => h(ChoiceCard, {
            key: em.id, label: em.label, hint: em.hint, icon: em.icon,
            badge: em.covered === false ? "dedicated study" : null,
            selected: a.emitterMain === em.id, onClick: () => set({ emitterMain: em.id }, true)
          })))
      },
      {
        id: "emitterUpper", step: 1,
        applicable: a => (a.floors || 0) > 0,
        title: "And upstairs?",
        sub: "Mixed setups are common: underfloor downstairs, radiators upstairs - the configurator combines both.",
        valid: a => !!a.emitterUpper,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Same as downstairs", hint: "The same emitter throughout.", selected: a.emitterUpper === "same", onClick: () => set({ emitterUpper: "same" }, true) }),
          Object.values(MKT.emitters).map(em => h(ChoiceCard, {
            key: em.id, label: em.label, icon: em.icon,
            badge: em.covered === false ? "dedicated study" : null,
            selected: a.emitterUpper === em.id, onClick: () => set({ emitterUpper: em.id }, true)
          })))
      },
      {
        id: "radiators", step: 1,
        applicable: a => (assignEmitters(a).rooms || []).some(r => r.emitter === "water_radiators" || r.emitter === "electric_radiators"),
        title: "How many radiators in each room?",
        sub: "One head or module per radiator to control.",
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
        title: t("Is your heat source easy to get to?", "Access to the heat source for the receiver?"),
        sub: "If it is, a receiver can start and stop it exactly when your rooms ask for heat.",
        valid: a => !!a.boilerAccessible,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Yes", hint: t("Boiler or heat pump visible and reachable.", "Wiring possible at the heat source."), selected: a.boilerAccessible === "yes", onClick: () => set({ boilerAccessible: "yes" }, true) }),
          h(ChoiceCard, { label: "No / difficult", selected: a.boilerAccessible === "no", onClick: () => set({ boilerAccessible: "no" }, true) }),
          h(ChoiceCard, { label: "I don't know", selected: a.boilerAccessible === "unknown", onClick: () => set({ boilerAccessible: "unknown" }, true) }))
      },
      {
        id: "hasThermostatWiring", step: 1,
        title: t("Do cables already run to where the thermostats would go?", "Bus / conduits available to the control points?"),
        sub: t("Look where your old thermostat sits, or between the manifold and the rooms.", "Drives wired vs wireless (CB500CO vs CB12RF, SQ610 vs SQ610RF)."),
        valid: a => !!a.hasThermostatWiring,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Yes, cables are there", icon: "mdi:power-plug", selected: a.hasThermostatWiring === "yes", onClick: () => set({ hasThermostatWiring: "yes" }, true) }),
          h(ChoiceCard, { label: "No, nothing", icon: "mdi:wifi", hint: "Wireless avoids all the building work.", selected: a.hasThermostatWiring === "no", onClick: () => set({ hasThermostatWiring: "no" }, true) }),
          h(ChoiceCard, { label: "I don't know", selected: a.hasThermostatWiring === "unknown", onClick: () => set({ hasThermostatWiring: "unknown" }, true) }))
      },
      {
        id: "perRoomControl", step: 1,
        title: "Do you want to set each room separately?",
        sub: "This is the question that changes everything: one temperature for the whole home, or a temperature per room.",
        valid: a => !!a.perRoomControl,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 gap-3" },
          h(ChoiceCard, { label: "Yes, room by room", hint: "18 C in the bedrooms, 21 C in the living room...", icon: "mdi:home-thermometer", selected: a.perRoomControl === "yes", onClick: () => set({ perRoomControl: "yes" }, true) }),
          h(ChoiceCard, { label: "No, one temperature", hint: "A single thermostat controls everything.", icon: "mdi:thermostat", selected: a.perRoomControl === "no", onClick: () => set({ perRoomControl: "no" }, true) }))
      },
      {
        id: "hasBMS", step: 1,
        applicable: (a, isProQ) => isProQ && a.homeType === "tertiary",
        title: "Is there a BMS (building management system)?",
        sub: "An existing BMS calls for an integration study - qualified file.",
        valid: a => !!a.hasBMS,
        render: (a, set) => yesNo(a, set, "hasBMS")
      },

      /* ============ STEP 3 - MY HABITS ============ */
      {
        id: "remote", step: 2,
        title: "Do you want to control your heating remotely?",
        sub: "Two real-life situations, rather than a spec sheet:",
        valid: a => !!a.remote,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["train", "voiture"] }),
          yesNo(a, set, "remote", "Yes, from my phone", "No, on the device is fine"))
      },
      {
        id: "alerts", step: 2,
        title: "Do you want to be alerted if something goes wrong?",
        valid: a => !!a.alerts,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["gel"] }),
          yesNo(a, set, "alerts", "Yes, I want to know", "No thanks"))
      },
      {
        id: "sharing", step: 2,
        title: "Do you want to share access - family or installer?",
        valid: a => !!a.sharing,
        render: (a, set) => h("div", null,
          h(SituationsRow, { ids: ["installateur"] }),
          yesNo(a, set, "sharing", "Yes, share access", "No"))
      },
      {
        id: "connectivityConclusion", step: 2, isConclusion: true,
        title: a => E.wantsConnected(a) ? "Your solution will be connected" : "Your solution can stay offline",
        sub: "You never had to choose \u201cconnected or not\u201d: it is the conclusion of your three answers.",
        valid: () => true,
        render: (a) => h("div", { className: "space-y-4" },
          h("div", { className: "grid sm:grid-cols-2 gap-3" },
            h("div", { className: cx("rounded-2xl border-2 p-4", E.wantsConnected(a) ? "border-salus-cyan bg-salus-cyan/5" : "border-slate-200 bg-white opacity-70") },
              h("div", { className: "font-bold text-salus-navy text-sm mb-1" }, "With the gateway"),
              h("p", { className: "text-xs text-slate-600 leading-relaxed" }, "You keep remote control, you get the alerts, and your installer can help without coming out.")),
            h("div", { className: cx("rounded-2xl border-2 p-4", !E.wantsConnected(a) ? "border-salus-cyan bg-salus-cyan/5" : "border-slate-200 bg-white opacity-70") },
              h("div", { className: "font-bold text-salus-navy text-sm mb-1" }, "Without the gateway"),
              h("p", { className: "text-xs text-slate-600 leading-relaxed" }, "Every setting is made on the device itself. Nothing is lost: the gateway can be added later."))),
          h(VideoPlaceholder, { label: "The Salus app in real use", duration: "0:40" }))
      },
      {
        id: "presence", step: 2,
        title: "During the week, you are usually...",
        sub: "The suggested schedule matches your real routine.",
        valid: a => !!a.presence,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-3 gap-3" },
          h(ChoiceCard, { label: "Often at home", selected: a.presence === "home_days", onClick: () => set({ presence: "home_days" }, true) }),
          h(ChoiceCard, { label: "Out during the day", selected: a.presence === "away_weekdays", onClick: () => set({ presence: "away_weekdays" }, true) }),
          h(ChoiceCard, { label: "Varying hours", selected: a.presence === "variable", onClick: () => set({ presence: "variable" }, true) }))
      },
      {
        id: "constructionPeriod", step: 2,
        title: "Roughly when was your home built?",
        sub: "Used only to estimate your savings - a range, never a single figure.",
        valid: a => !!a.constructionPeriod,
        render: (a, set) => h("div", { className: "grid grid-cols-2 sm:grid-cols-5 gap-3" },
          Object.entries(COPY.consumptionByPeriod).map(([id, p]) => h(ChoiceCard, {
            key: id, label: p.label, selected: a.constructionPeriod === id, onClick: () => set({ constructionPeriod: id }, true)
          })))
      },
      {
        id: "currentControl", step: 2,
        title: "How is your heating controlled today?",
        valid: a => !!a.currentControl,
        render: (a, set) => h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" },
          h(ChoiceCard, { label: "No control at all", hint: "It heats, full stop.", selected: a.currentControl === "none", onClick: () => set({ currentControl: "none" }, true) }),
          h(ChoiceCard, { label: "One single thermostat", selected: a.currentControl === "single_stat", onClick: () => set({ currentControl: "single_stat" }, true) }),
          h(ChoiceCard, { label: "Manual radiator valves", selected: a.currentControl === "trv_manual", onClick: () => set({ currentControl: "trv_manual" }, true) }),
          h(ChoiceCard, { label: "Already room by room", selected: a.currentControl === "multi", onClick: () => set({ currentControl: "multi" }, true) }))
      },
      {
        id: "budget", step: 2,
        title: "Do you have a budget in mind?",
        sub: "A level above your budget stays visible, with the gap shown - your call.",
        valid: () => true,
        render: (a, set) => h("div", { className: "max-w-md space-y-4" },
          h("label", { className: "flex items-center gap-2 text-sm text-slate-600 cursor-pointer" },
            h("input", { type: "checkbox", checked: a.budget == null, onChange: e => set({ budget: e.target.checked ? null : 900 }), className: "accent-[#00AEEF] w-4 h-4" }),
            "No budget set"),
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
        title: "Your postcode?",
        sub: t("So we can show you the Club Pro installers in your area.", "For routing to the area sales rep and the local Club Pro members."),
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
          h(IconTile, { name: s.icon, className: "w-16 h-16 rounded-xl shrink-0", size: "w-8 h-8" }),
          h("p", { className: "text-sm text-slate-600 italic leading-snug" }, "\u201c" + s.text + "\u201d"))));
  }

  /* ---------- Room builder ---------- */
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
      rooms.length === 0 && h("p", { className: "text-sm text-slate-400 italic" }, "Add at least one room using the buttons above."),
      h("div", { className: "space-y-2" },
        rooms.map(r => h("div", { key: r.id, className: "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5" },
          h(IconTile, { name: (COPY.roomTypes.find(t => t.id === r.type) || {}).icon, className: "w-8 h-8 rounded-lg shrink-0", size: "w-5 h-5" }),
          h("input", {
            value: r.name, onChange: e => set({ rooms: rooms.map(x => x.id === r.id ? { ...x, name: e.target.value } : x) }),
            className: "flex-1 min-w-0 rounded-lg border border-transparent hover:border-slate-200 focus:border-salus-cyan px-2 py-1 text-sm font-semibold text-salus-navy focus:outline-none bg-transparent"
          }),
          (a.floors || 0) > 0 && h("select", {
            value: r.floor || 0, onChange: e => set({ rooms: rooms.map(x => x.id === r.id ? { ...x, floor: parseInt(e.target.value, 10) } : x) }),
            className: "rounded-lg border border-slate-200 text-xs px-2 py-1.5 text-slate-600 bg-white"
          },
            h("option", { value: 0 }, "Ground"),
            Array.from({ length: a.floors }, (_, i) => h("option", { key: i + 1, value: i + 1 }, "Floor " + (i + 1)))),
          h("button", {
            onClick: () => set({ rooms: rooms.filter(x => x.id !== r.id) }),
            className: "w-7 h-7 rounded-full text-slate-400 hover:bg-red-50 hover:text-red-500 font-bold shrink-0"
          }, "✕")))));
  }

  /* ---------- Early proposal (P8) ---------- */
  function EarlyEstimateBar({ answers, visible, onSee }) {
    const est = useMemo(() => visible ? E.earlyEstimate(assignEmitters(answers)) : null, [answers, visible]);
    if (!est) return null;
    return h("div", { className: "fixed bottom-0 inset-x-0 z-[50] pointer-events-none" },
      h("div", { className: "max-w-3xl mx-auto px-4 pb-4" },
        h("div", { className: "pointer-events-auto rounded-2xl bg-salus-navy text-white shadow-2xl px-5 py-3.5 flex items-center justify-between gap-3 fadeUp" },
          h("div", null,
            h("div", { className: "text-[10px] uppercase tracking-wider text-salus-cyan font-bold" }, "Your solution is taking shape"),
            h("div", { className: "text-sm font-semibold flex items-baseline gap-2" },
              "~ " + eur(est.total),
              h("span", { className: "text-[9px] uppercase bg-amber-400/20 text-amber-200 rounded px-1.5 py-0.5 font-bold" }, "fictional price / beta"),
              h("span", { className: "text-white/50 text-xs" }, "/ " + est.deviceCount + " devices - refined with every answer"))),
          onSee && h(Btn, { kind: "primary", className: "!py-2 !text-xs shrink-0", onClick: onSee }, "View"))));
  }

  /* ---------- Landing screen ---------- */
  function Landing({ onStart, onDemo, onReplace, onAbout, saved, onResume }) {
    return h("div", { className: "relative overflow-hidden" },
      h("div", { className: "arcs absolute inset-0 pointer-events-none" }),
      h("div", { className: "max-w-5xl mx-auto px-4 pt-12 pb-20 relative" },
        h("div", { className: "text-center max-w-2xl mx-auto mb-10 fadeUp" },
          h("img", { src: "assets/hero/logo-salus.png", alt: "SALUS Controls", className: "h-10 mx-auto mb-6" }),
          h("h1", { className: "font-ubuntu text-3xl md:text-4xl font-bold text-salus-navy leading-tight" },
            "From need to solution, ", h("span", { className: "text-salus-cyan" }, "in under ten questions")),
          h("p", { className: "text-slate-500 mt-3 text-sm md:text-base" },
            "Describe your home and your habits: the configurator builds the complete Salus system - products, price, diagram, documents - without ever showing you a catalogue.")),

        saved && h("div", { className: "max-w-xl mx-auto mb-8 fadeUp" },
          h(InfoBox, { tone: "info", title: "A project is waiting for you - " + saved.projectCode },
            h("div", { className: "flex items-center justify-between gap-3 mt-1" },
              h("span", { className: "text-xs" }, "Your answers are kept: pick up exactly where you stopped."),
              h(Btn, { className: "!py-1.5 !text-xs shrink-0", onClick: onResume }, "Resume")))),

        h("div", { className: "max-w-3xl mx-auto mb-4 text-center" },
          h("h2", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, "Who are you?"),
          h("p", { className: "text-xs text-slate-500 mt-1 mb-5" },
            "We ask so we can match the wording and the level of detail: a homeowner gets simple, illustrated questions, while an installer moves faster with trade vocabulary - and extra tools (pre-visit, quote, technical docs).")),
        h("div", { className: "grid sm:grid-cols-2 gap-4 max-w-3xl mx-auto" },
          h("button", { onClick: () => onStart("user"), className: "tile text-left rounded-3xl border-2 border-slate-200 bg-white p-6 hover:border-salus-cyan" },
            h(IconTile, { name: "mdi:account-group", className: "w-full h-36 rounded-2xl mb-4", size: "w-20 h-20" }),
            h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, "I am a homeowner"),
            h("p", { className: "text-sm text-slate-500 mt-1" }, "Simple questions, with pictures. Your solution in three levels, explained room by room."),
            h("div", { className: "mt-3 text-salus-cyan font-bold text-sm" }, "Start \u2192")),
          h("button", { onClick: () => onStart("installer"), className: "tile text-left rounded-3xl border-2 border-slate-200 bg-white p-6 hover:border-salus-cyan" },
            h(IconTile, { name: "mdi:account-hard-hat", className: "w-full h-36 rounded-2xl mb-4", size: "w-20 h-20" }),
            h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy flex items-center gap-2" }, "I am an installer",
              h("span", { className: "text-[9px] bg-salus-navy text-white rounded-full px-2 py-0.5 uppercase tracking-wide" }, "Pro area")),
            h("p", { className: "text-sm text-slate-500 mt-1" }, "Trade vocabulary, customer pre-visit questionnaire, quote ready for your distributor."),
            h("div", { className: "mt-3 text-salus-cyan font-bold text-sm" }, "Start \u2192"))),

        h("div", { className: "flex flex-wrap justify-center gap-3 mt-8" },
          h(Btn, { kind: "navy", onClick: onDemo }, "▶ " + COPY.demoScenario.label),
          h(Btn, { kind: "ghost", onClick: onReplace }, "Replace an existing product"),
          h(Btn, { kind: "ghost", onClick: onAbout }, "About this BETA")),
        h("p", { className: "text-center text-[11px] text-slate-400 mt-3" }, COPY.demoScenario.description)));
  }

  /* ---------- Replacement module (P14) ---------- */
  function ReplaceView({ onBack, onStartConfig }) {
    const [q, setQ] = useState("");
    const results = useMemo(() => E.searchReplacement(q), [q]);
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "\u2190 Home"),
      h(SectionTitle, { sub: "Type in the product already installed - even a competitor product, even with a typo. The configurator offers the Salus equivalent plus what else is needed." }, "Replace an existing product"),
      h("div", { className: "flex gap-2 mb-2" },
        h("input", {
          value: q, onChange: e => setQ(e.target.value), placeholder: "e.g. Tybox 1117, Netatmo, evohome, RT500RF...",
          className: "flex-1 rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:border-salus-cyan"
        }),
        h(Btn, { kind: "ghost", onClick: () => alert("BETA: in production a photo of the label would be enough - model recognition included.") }, "\ud83d\udcf7 Photo of the label")),
      h("p", { className: "text-[11px] text-slate-400 mb-5" }, "Covered first: Delta Dore, Netatmo, Honeywell, Tado - and the legacy Salus ranges. (BETA table: 10 equivalences.)"),
      q.length >= 2 && results.length === 0 && h(InfoBox, { tone: "warn", title: "Not in the BETA table" }, "In production the entry would go out as a qualified request: a Salus technician would identify the equivalence and it would enrich the table."),
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
              "Also needs: " + r.alsoNeeds.map(ref => (CAT.products[ref] || {}).ref || ref).join(", ")),
            h("div", { className: "text-xs text-slate-600 mt-2.5" }, h("b", null, "Wiring: "), r.wiring),
            h("div", { className: "text-xs text-slate-600 mt-1" }, h("b", null, "What changes: "), r.note));
        })),
      h("div", { className: "mt-8 text-center" },
        h("p", { className: "text-sm text-slate-500 mb-3" }, "A replacement is also the moment to rethink the whole system:"),
        h(Btn, { onClick: onStartConfig }, "Configure my complete solution \u2192")));
  }

  /* ---------- Installer pre-visit (P8) ---------- */
  function PrevisitView({ onBack, onLoadPrefilled }) {
    const [stage, setStage] = useState(0);
    const link = "configurateur.salus.fr/previsite/SC-" + (1000 + Math.floor(Math.random() * 0) + 4821);
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "\u2190 Back"),
      h(SectionTitle, { sub: "The customer answers at home, with photos; you arrive on site with the material already priced." }, "Prepare a visit"),
      stage === 0 && h("div", { className: "space-y-4" },
        h("p", { className: "text-sm text-slate-600" }, "A unique link goes out to the customer. They answer the homeowner questions and send three photos asked for explicitly: ",
          h("b", null, "the heat source"), ", ", h("b", null, "one radiator with its valve"), ", ", h("b", null, "the electrical panel"), "."),
        h(Btn, { onClick: () => { setStage(1); CRM.logEvent("previsit", "Pre-visit link created (simulation)", CRM.leadPayload({ profile: "installer" }, {}), CRM.flows.previsit); } }, "Create the pre-visit link")),
      stage >= 1 && h("div", { className: "space-y-4" },
        h(InfoBox, { tone: "ok", title: "Link created (simulation)" },
          h("div", { className: "flex items-center justify-between gap-2 flex-wrap" },
            h("code", { className: "text-xs bg-white rounded px-2 py-1 border border-emerald-200" }, link),
            h(Btn, { kind: "ghost", className: "!py-1 !text-xs", onClick: () => alert("BETA: fictional link copied - in production it would be sent by SMS or email.") }, "Copy"))),
        stage === 1 && h(Btn, { kind: "navy", onClick: () => setStage(2) }, "\u25b6 Simulate: the customer has answered"),
        stage >= 2 && h("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 space-y-4 fadeUp" },
          h("div", { className: "flex items-center gap-2" },
            h("span", { className: "w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" }),
            h("span", { className: "text-sm font-bold text-salus-navy" }, "Answer received Monday 21:04 - configuration pre-filled")),
          h("ul", { className: "text-sm text-slate-600 space-y-1" },
            h("li", null, "\u2022 1990s house, 120 m2, 5 rooms, one upper floor"),
            h("li", null, "\u2022 Underfloor heating downstairs, 3 water radiators upstairs - standard valve thread visible on the photo"),
            h("li", null, "\u2022 Wall-hung gas boiler, accessible"),
            h("li", null, "\u2022 Wants remote control")),
          h("div", { className: "grid grid-cols-3 gap-2.5" },
            ["photo-generateur", "photo-radiateur-vanne", "photo-tableau"].map(id =>
              h("div", { key: id, className: "rounded-xl bg-slate-100 h-24 flex items-center justify-center text-[10px] text-slate-400 border border-dashed border-slate-300 text-center px-2" },
                "[ " + id + ".jpg - simulated customer photo ]"))),
          h(Btn, { className: "w-full", onClick: onLoadPrefilled }, "Open the pre-filled configuration \u2192 validate or correct"))));
  }

  /* ---------- Qualified file (P9/P15) ---------- */
  function QualifiedView({ answers, reasons, projectCode, onBack, onBackstage }) {
    useEffect(() => {
      CRM.logEvent("qualified", "Qualified file prepared and sent (simulation)",
        CRM.qualifiedFilePayload(answers, reasons, { projectCode }), CRM.flows.qualified);
    }, []);
    const est = E.earlyEstimate(assignEmitters(answers));
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h("div", { className: "text-center mb-8" },
        h("div", { className: "w-16 h-16 mx-auto rounded-full bg-salus-cyan/10 flex items-center justify-center text-3xl mb-3" }, "🧑‍🔧"),
        h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy" }, "Your project deserves a human check"),
        h("p", { className: "text-sm text-slate-500 mt-2 max-w-xl mx-auto" },
          "Nothing is blocked: the configurator has prepared a complete file with its recommendation, and a Salus technician will call you back ", h("b", null, "within 48 h"), ". This is a service, not a dead end.")),
      h(InfoBox, { tone: "info", title: "Why a check?" },
        h("ul", { className: "list-disc ml-4 space-y-1 mt-1" }, reasons.map((r, i) => h("li", { key: i }, r)))),
      est && h("div", { className: "rounded-2xl border border-slate-200 bg-white p-5 mt-4" },
        h("div", { className: "text-xs uppercase tracking-wide text-slate-400 font-bold mb-2" }, "Recommendation prepared for the technician (starting point)"),
        h("div", { className: "flex items-baseline gap-2" },
          h(PriceTag, { value: est.total, size: "lg" }),
          h("span", { className: "text-xs text-slate-400" }, "/ " + est.deviceCount + " devices / assumptions to confirm")),
        h("p", { className: "text-xs text-slate-500 mt-2" }, "Every correction the technician makes becomes a configurator rule: this is how the tool learns.")),
      h("div", { className: "flex flex-wrap gap-3 mt-6 justify-center" },
        h(Btn, { kind: "navy", onClick: onBackstage }, "See the file that would go out (backstage) \u2192"),
        h(Btn, { kind: "ghost", onClick: onBack }, "\u2190 Change my answers")));
  }

  /* ---------- About the BETA ---------- */
  function AboutView({ onBack }) {
    const rows = [
      ["4 named steps, one question per screen", "P3, P5"],
      ["Needs -> abstract system -> products (never a catalogue first)", "P2"],
      ["3-state compatibility, greyed products with the reason, completeness checked", "P1"],
      ["Early proposal updated live + 3 final actions", "P7"],
      ["3 levels Essential / Comfort / Premium by rules + variants + packs", "P4, P24"],
      ["Room-by-room home view + \u201cOther choice\u201d on every line", "P6"],
      ["Connectivity concluded from usage, never asked + 4 real-life situations", "P11, P12"],
      ["Radio range rules -> repeater added, never a dead end", "P10"],
      ["Replacement module (competitors + legacy Salus), typo tolerant", "P14"],
      ["Qualified file: commercial, >12 zones, uncovered heat source", "P9, P15"],
      ["Videos attached at the right moment of the journey", "P16"],
      ["Generated system diagram (solid wired / dotted radio)", "P17"],
      ["Live price, recommended retail price, Club Pro by postcode", "P18"],
      ["Savings as a range, EN 15232 method available", "P19"],
      ["Single installation guide in 5 sequences, generated as PDF", "P20"],
      ["Room-by-room benefits from YOUR declared rooms", "P21"],
      ["Project code + exact resume + email link (feeds the CRM)", "P23"],
      ["Budget: level above stays visible and greyed with the gap", "P24"],
      ["Zoho quote at retail price + distributor message", "P25"],
      ["Every configuration = one Zoho record (see Backstage)", "P26"],
      ["Installer pre-visit: customer link + 3 photos + pre-filled config", "P8"],
      ["Docs filtered on the configuration, missing ones shown as missing", "P13"]
    ];
    const additions = [
      "Level comparison screen (covers P22, the only problem with no solution row in the workshop file)",
      "Demo scenario button (internal presentation in one click)",
      "This \u201cAbout\u201d page itself"
    ];
    return h("div", { className: "max-w-3xl mx-auto px-4 py-8 fadeUp" },
      h(Btn, { kind: "subtle", className: "!text-xs mb-5", onClick: onBack }, "\u2190 Back"),
      h(SectionTitle, { sub: "Every screen in this mock-up comes from a problem the team identified in the workshop (Problems / Solutions file)." }, "About this BETA"),
      h(InfoBox, { tone: "warn", title: "What is simulated in this build" },
        "Prices (fictional, labelled on each one) / documents (placeholders, real structure) / Zoho CRM (payloads visible in the backstage panel, nothing is sent) / emails and SMS / pre-visit photos / Club Pro installers / visuals (placeholders). Product references are real; those marked \u201cref. to confirm\u201d still need validating."),
      h("div", { className: "rounded-2xl border border-slate-200 bg-white overflow-hidden mt-4" },
        h("table", { className: "w-full text-sm" },
          h("thead", null, h("tr", { className: "bg-salus-navy text-white text-left" },
            h("th", { className: "px-4 py-2.5 font-semibold" }, "Feature in the mock-up"),
            h("th", { className: "px-4 py-2.5 font-semibold w-24" }, "Workshop"))),
          h("tbody", null, rows.map(([f, p], i) => h("tr", { key: i, className: i % 2 ? "bg-slate-50" : "" },
            h("td", { className: "px-4 py-2 text-slate-600" }, f),
            h("td", { className: "px-4 py-2 font-bold text-salus-cyan" }, p)))))),
      h("div", { className: "mt-4" },
        h(InfoBox, { tone: "info", title: "Additions outside the workshop file" },
          h("ul", { className: "list-disc ml-4 space-y-0.5 mt-1" }, additions.map((x, i) => h("li", { key: i }, x))))));
  }

  /* ---------- Application ---------- */
  function App() {
    const [state, setState] = useState(() => {
      try {
        const saved = JSON.parse(localStorage.getItem(LS_KEY));
        if (saved && saved.answers) return { ...saved, view: "landing", backstage: false, _saved: saved };
      } catch (e) { /* storage unavailable: start empty */ }
      return { view: "landing", answers: {}, pos: 0, maxPos: 0, selection: { level: "comfort" }, projectCode: null, backstage: false };
    });
    const { view, answers, pos, selection, projectCode, backstage } = state;
    const maxPos = Math.max(state.maxPos || 0, pos);
    const isPro = answers.profile === "installer";
    const questions = useMemo(() => buildQuestions(isPro), [isPro]);
    const applicable = questions.filter(q => !q.applicable || q.applicable(answers, isPro));

    /* Persistence (P23) */
    useEffect(() => {
      if (!projectCode) return;
      try {
        localStorage.setItem(LS_KEY, JSON.stringify({ answers, pos, maxPos, selection, projectCode, view: view === "landing" ? "wizard" : view, savedAt: Date.now() }));
      } catch (e) { /* quota / private browsing */ }
    }, [answers, pos, selection, projectCode, view]);

    const update = (patch) => setState(s => ({ ...s, ...patch }));

    const setAnswers = (patch, autoNext) => setState(s => {
      let a = { ...s.answers, ...patch };
      if ("emitterMain" in patch || "emitterUpper" in patch || "floors" in patch) a = assignEmitters(a);
      const code = s.projectCode || ("SC-" + (1000 + Math.floor(Math.random() * 9000)));
      if (!s.projectCode) CRM.logEvent("lead", "Lead created on the first answer - " + code,
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
      CRM.logEvent("lead", "Journey completed - \u201cMy solution\u201d step reached",
        CRM.leadPayload(a, { projectCode, level: selection.level }), CRM.flows.lead);
      update({ answers: a, maxPos: applicable.length - 1, view: qf.qualified ? "qualified" : "result", qualifiedReasons: qf.reasons });
    };

    const loadDemo = () => {
      const a = assignEmitters({ ...COPY.demoScenario.answers });
      const code = "SC-4821";
      CRM.logEvent("lead", "Demo scenario loaded - " + code, CRM.leadPayload(a, { projectCode: code, level: "comfort" }), CRM.flows.lead);
      setState(s => ({ ...s, answers: a, projectCode: code, selection: { level: "comfort" }, pos: applicable.length - 1, maxPos: applicable.length - 1, view: "result", demo: true }));
    };

    const restart = () => {
      try { localStorage.removeItem(LS_KEY); } catch (e) { /* ignored */ }
      CRM.logEvent("lead", "Project reset", { module: "Leads", note: "In production the lead would stay, marked \u201cabandoned\u201d - reminder after 48 h." }, CRM.flows.lead);
      setState({ view: "landing", answers: {}, pos: 0, maxPos: 0, selection: { level: "comfort" }, projectCode: null, backstage: false });
    };

    /* --- Wizard --- */
    const q = applicable[Math.min(pos, applicable.length - 1)];
    const stepOfQ = q ? q.step : 3;
    const maxStepReached = Math.max(...applicable.slice(0, Math.min(maxPos, applicable.length - 1) + 1).map(x => x.step), 0);
    const showEstimate = view === "wizard" && (stepOfQ >= 2 || (stepOfQ === 1 && !!answers.emitterMain));

    const wizardNext = () => {
      if (pos >= applicable.length - 1) { goResult(); return; }
      const prevStep = applicable[pos].step, nextStep = applicable[pos + 1].step;
      if (nextStep !== prevStep) CRM.logEvent("lead", "Step \u201c" + COPY.steps[prevStep].label + "\u201d completed - lead updated",
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
        isPro && h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-[11px] shrink-0", onClick: () => update({ view: "previsit" }) }, "Prepare a visit")),
      h("div", { key: q.id, className: "fadeUp" },
        h("div", { className: "text-[11px] font-bold uppercase tracking-wider text-salus-cyan mb-2" },
          COPY.steps[q.step].label + " / question " + (applicable.filter(x => x.step === q.step).indexOf(q) + 1) + "/" + applicable.filter(x => x.step === q.step).length),
        h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy mb-1.5" },
          typeof q.title === "function" ? q.title(answers) : q.title),
        q.sub && h("p", { className: "text-sm text-slate-500 mb-6" }, typeof q.sub === "function" ? q.sub(answers) : q.sub),
        q.render(answers, setAnswers),
        h("div", { className: "flex items-center justify-between mt-8" },
          h(Btn, { kind: "subtle", onClick: wizardBack }, "\u2190 Back"),
          h(Btn, { onClick: wizardNext, disabled: !q.valid(answers) },
            pos >= applicable.length - 1 ? "See my solution \u2192" : (q.isConclusion ? "Continue \u2192" : "Next \u2192")))));

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
            CRM.logEvent("previsit", "Pre-filled configuration opened by the installer (simulation)", CRM.leadPayload(a, { projectCode: "SC-4821" }), CRM.flows.previsit);
            setState(s => ({ ...s, answers: a, projectCode: "SC-4821", selection: { level: "comfort" }, view: "result" }));
          }
        }),
        view === "about" && h(AboutView, { onBack: () => update({ view: state._backView || "landing" }) })),
      h(EarlyEstimateBar, { answers, visible: showEstimate, onSee: stepOfQ >= 2 ? goResult : null }),
      view === "result" && h("button", {
        onClick: () => update({ backstage: true }),
        className: "fixed bottom-5 right-5 z-[55] rounded-full bg-salus-navy text-white shadow-2xl px-4 py-3 text-xs font-bold flex items-center gap-2 hover:bg-[#2a3a77] transition"
      }, "\u2699 CRM backstage"),
      h(Backstage, { open: backstage, onClose: () => update({ backstage: false }), answers, projectCode, selection }));
  }

  ReactDOM.createRoot(document.getElementById("root")).render(h(App));
})();
