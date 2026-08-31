/* ============================================================
   SALUS Configurateur BETA — Écran « Ma solution » (résultat)
   ------------------------------------------------------------
   Deux parties (P7) : la vue du logement pièce par pièce en
   haut, la liste des produits en dessous, chaque ligne avec son
   bouton « Autre choix ». Niveaux Essential / Comfort / Premium
   calculés par règles (P5), packs séparés (P24), schéma généré
   (P18), économies en fourchette (P20), documents filtrés (P14),
   trois actions finales (P8).
   ============================================================ */

(function () {
  const { h, cx, eur, PriceTag, Btn, ChoiceCard, SectionTitle, Modal, VideoPlaceholder, InfoBox, Stepper } = window.UI;
  const { useState, useMemo } = React;
  const E = window.SalusEngine;
  const CAT = window.SALUS_CATALOG;
  const COPY = window.SALUS_COPY;
  const CRM = window.SalusCRM;

  const LEVEL_META = {
    essential: { name: "Essential", tag: "L'indispensable", color: "border-slate-300" },
    comfort: { name: "Comfort", tag: "Le plus choisi", color: "border-salus-cyan", popular: true },
    premium: { name: "Premium", tag: "Pièce par pièce, sans compromis", color: "border-salus-navy" }
  };

  /* Documents volontairement « manquants » : la matrice doit montrer
     un document absent comme absent (règle P14), jamais le taire. */
  const MISSING_DOCS = { WQ610: ["video_install"], THB: ["fiche"], "TRV3RF-AB": ["notice_user"] };

  /* ---------- Sélection effective (niveau + variantes + swaps + packs) ---------- */
  function useEffectiveItems(answers, selection) {
    return useMemo(() => {
      const levels = E.buildLevels(answers);
      const base = levels[selection.level] || levels.comfort;
      let items = base.items.map(it => ({ ...it }));

      if (selection.trvAB) items = items.map(it => it.ref === "TRV3RF" ? { ...it, ref: "TRV3RF-AB", reason: it.reason + " Version auto-équilibrante choisie." } : it);
      if (selection.swaps) items = items.map(it => selection.swaps[it.ref] ? { ...it, ref: selection.swaps[it.ref] } : it);
      if (selection.removedRefs && selection.removedRefs.length)
        items = items.filter(it => !selection.removedRefs.includes(it.ref));

      const packs = E.buildPacks(answers);
      const packItems = [];
      packs.forEach(p => {
        const on = selection.packsOn && selection.packsOn[p.id] != null ? selection.packsOn[p.id] : p.preChecked;
        if (on) p.items.forEach(pi => packItems.push({ ...pi, roomId: null, reason: p.name, pack: p.id }));
      });

      const all = items.concat(packItems);
      return { levels, base, items, packItems, all, packs, total: E.totalOf(all), missing: E.completeness(answers, all) };
    }, [answers, selection]);
  }

  /* ---------- Cartes de niveau + budget (P5 / P24) ---------- */
  function LevelCards({ answers, selection, setSelection, levels }) {
    const budget = answers.budget;
    return h("div", { className: "grid md:grid-cols-3 gap-4" },
      ["essential", "comfort", "premium"].map(id => {
        const lvl = levels[id], meta = LEVEL_META[id];
        const over = budget != null && lvl.total > budget;
        const selected = selection.level === id;
        return h("button", {
          key: id,
          onClick: () => setSelection(s => ({ ...s, level: id })),
          className: cx("tile relative text-left rounded-2xl border-2 bg-white p-5",
            selected ? "border-salus-cyan ring-2 ring-salus-cyan/30" : meta.color,
            over && !selected && "opacity-60")
        },
          meta.popular && h("span", { className: "absolute -top-3 left-4 bg-salus-cyan text-white text-[10px] font-bold rounded-full px-2.5 py-1 uppercase tracking-wide" }, "Le plus choisi"),
          selected && h("span", { className: "absolute -top-2 -right-2 w-7 h-7 rounded-full bg-salus-cyan text-white text-sm font-bold flex items-center justify-center shadow" }, "✓"),
          h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, meta.name),
          h("div", { className: "text-xs text-slate-500 mb-3" }, meta.tag),
          h(PriceTag, { value: lvl.total, size: "lg" }),
          h("div", { className: "text-xs text-slate-500 mt-1" }, lvl.deviceCount + " appareils"),
          over && h("div", { className: "mt-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5" },
            "+" + eur(lvl.total - budget) + " au-dessus de votre budget — à vous de décider."),
          h("ul", { className: "mt-3 space-y-1" },
            levelHighlights(answers, id).map((s, i) => h("li", { key: i, className: "text-xs text-slate-600 flex gap-1.5" },
              h("span", { className: "text-salus-cyan font-bold" }, "•"), s)))
        );
      })
    );
  }

  function levelHighlights(answers, id) {
    if (answers.perRoomControl !== "yes") {
      const ladder = answers.hasThermostatWiring === "yes"
        ? { essential: "RT520", comfort: "WQ610", premium: "IT800WIFI" } : CAT.standaloneLadder.rf;
      const p = CAT.products[ladder[id]];
      return [p.name, p.solution];
    }
    const hasRad = (answers.rooms || []).some(r => r.emitter === "water_radiators");
    const hasUfh = (answers.rooms || []).some(r => r.emitter === "ufh_water");
    const out = [];
    if (id === "essential") {
      if (hasRad) out.push("Chaque radiateur régulé par sa tête connectée — 0 thermostat d'ambiance.");
      if (hasUfh) out.push("Chaque zone de plancher avec son thermostat.");
    }
    if (id === "comfort") {
      out.push("Comme Essential + un thermostat d'ambiance dans la pièce à vivre.");
    }
    if (id === "premium") {
      if (hasRad) out.push("Un thermostat d'ambiance dans chaque pièce.");
      if (hasUfh) out.push("Actionneurs auto-équilibrants sur le collecteur.");
    }
    return out;
  }

  /* ---------- Comparaison côte à côte (couvre P22 — ajout signalé) ---------- */
  function CompareTable({ answers, levels }) {
    const rows = [
      ["Prix total (fictif — BETA)", l => eur(levels[l].total)],
      ["Appareils", l => levels[l].deviceCount],
      ["Réglage pièce par pièce", l => answers.perRoomControl === "yes" ? "✓" : "—"],
      ["Thermostat d'ambiance", l => l === "essential" ? (answers.perRoomControl === "yes" ? "—" : "1") : l === "comfort" ? "Pièce à vivre" : "Toutes les pièces"],
      ["Économies estimées*", l => { const s = E.savings(answers, l); return s.pctLow + " – " + s.pctHigh + " %"; }],
      ["Pilotage à distance", l => levels[l].items.some(it => ["UG800"].includes(it.ref) || (CAT.products[it.ref] || {}).integratedGateway) ? "✓" : "—"]
    ];
    return h("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white" },
      h("table", { className: "w-full text-sm" },
        h("thead", null, h("tr", { className: "bg-salus-navy text-white" },
          h("th", { className: "text-left px-4 py-2.5 font-semibold rounded-tl-2xl" }, ""),
          ["essential", "comfort", "premium"].map((l, i) => h("th", { key: l, className: cx("px-4 py-2.5 font-ubuntu", i === 2 && "rounded-tr-2xl") }, LEVEL_META[l].name)))),
        h("tbody", null, rows.map(([label, fn], ri) => h("tr", { key: ri, className: ri % 2 ? "bg-slate-50" : "" },
          h("td", { className: "px-4 py-2.5 text-slate-600" }, label),
          ["essential", "comfort", "premium"].map(l => h("td", { key: l, className: "px-4 py-2.5 text-center font-semibold text-salus-navy" }, fn(l))))))),
      h("div", { className: "px-4 py-2 text-[11px] text-slate-400" }, "* Fourchette d'estimation fictive (BETA) — méthode EN 15232, voir la carte Économies.")
    );
  }

  /* ---------- Vue du logement pièce par pièce (P7 + P22) ---------- */
  function RoomsView({ answers, items }) {
    const rooms = answers.rooms || [];
    const byRoom = {};
    items.forEach(it => { if (it.roomId != null) (byRoom[it.roomId] = byRoom[it.roomId] || []).push(it); });
    const floors = [...new Set(rooms.map(r => r.floor || 0))].sort((a, b) => b - a);
    return h("div", { className: "space-y-4" },
      floors.map(f => h("div", { key: f },
        floors.length > 1 && h("div", { className: "text-xs font-bold uppercase tracking-wide text-slate-400 mb-2" }, f === 0 ? "Rez-de-chaussée" : "Étage " + f),
        h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          rooms.filter(r => (r.floor || 0) === f).map(room => {
            const t = COPY.roomTypes.find(x => x.id === room.type) || {};
            const benefit = (COPY.roomBenefits[room.type] || COPY.roomBenefits.autre)((room.name || t.label || "pièce").toLowerCase());
            return h("div", { key: room.id, className: "rounded-2xl border border-slate-200 bg-white p-4" },
              h("div", { className: "flex items-center gap-2.5 mb-2" },
                h("img", { src: t.img, alt: "", className: "w-9 h-9 rounded-lg object-cover bg-slate-100" }),
                h("div", null,
                  h("div", { className: "font-semibold text-salus-navy text-sm" }, room.name),
                  h("div", { className: "text-[11px] text-slate-400" }, emitterLabel(room.emitter)))),
              h("div", { className: "flex flex-wrap gap-1.5 mb-2" },
                (byRoom[room.id] || []).map((it, i) => h("span", { key: i, className: "text-[11px] bg-salus-cyan/10 text-salus-navy font-semibold rounded-full px-2 py-0.5" },
                  (it.qty > 1 ? it.qty + " × " : "") + (CAT.products[it.ref] || {}).ref)),
                !(byRoom[room.id] || []).length && h("span", { className: "text-[11px] text-slate-400" }, "régulation générale")),
              h("p", { className: "text-xs text-slate-600 italic leading-snug" }, "« " + benefit + " »")
            );
          }))
      ))
    );
  }

  function emitterLabel(id) {
    return (window.SALUS_MARKETS.emitters[id] || {}).label || "—";
  }

  /* ---------- Liste produits + Autre choix (P2 / P7) ---------- */
  function ProductList({ answers, selection, setSelection, eff, isPro }) {
    const [altFor, setAltFor] = useState(null);
    const agg = E.aggregate(eff.all);
    return h("div", { className: "rounded-2xl border border-slate-200 bg-white divide-y divide-slate-100" },
      agg.map(line => {
        const p = CAT.products[line.ref] || { ref: line.ref, name: "?", price: 0 };
        const alts = E.alternativesFor(answers, eff.all, { ref: line.ref, qty: line.qty });
        return h("div", { key: line.ref + (line.pack || ""), className: "p-4 flex flex-col sm:flex-row sm:items-center gap-3" },
          h("img", { src: p.img, alt: p.ref, className: "w-14 h-14 rounded-xl object-cover bg-slate-100 shrink-0" }),
          h("div", { className: "flex-1 min-w-0" },
            h("div", { className: "flex items-center gap-2 flex-wrap" },
              h("span", { className: "font-bold text-salus-navy" }, line.qty + " × " + p.ref),
              p.refToConfirm && h("span", { className: "text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold uppercase" }, "réf. à confirmer"),
              line.auto && h("span", { className: "text-[9px] bg-salus-teal/15 text-salus-teal rounded px-1.5 py-0.5 font-semibold uppercase" }, "ajouté par le configurateur")),
            h("div", { className: "text-sm text-slate-600" }, p.name),
            h("div", { className: "text-xs text-slate-400 mt-0.5 leading-snug" }, isPro ? p.descPro : p.solution)),
          h("div", { className: "flex items-center gap-3 shrink-0" },
            h(PriceTag, { value: p.price * line.qty }),
            alts.length > 0 && h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs", onClick: () => setAltFor(line) }, "Autre choix"),
            line.removable && h(Btn, {
              kind: "subtle", className: "!px-3 !py-1.5 !text-xs",
              onClick: () => setSelection(s => ({ ...s, removedRefs: [...(s.removedRefs || []), line.ref] }))
            }, "Retirer"))
        );
      }),
      h("div", { className: "p-4 flex items-center justify-between bg-slate-50 rounded-b-2xl" },
        h("span", { className: "font-semibold text-salus-navy" }, "Total de votre solution"),
        h(PriceTag, { value: eff.total, size: "lg" })),
      h(AltModal, { line: altFor, onClose: () => setAltFor(null), answers, eff, setSelection })
    );
  }

  /* Alternatives : compatibles en premier, incompatibles GRISÉES avec la
     raison en une phrase — jamais cachées (P1). */
  function AltModal({ line, onClose, answers, eff, setSelection }) {
    if (!line) return null;
    const alts = E.alternativesFor(answers, eff.all, { ref: line.ref, qty: line.qty });
    const cur = CAT.products[line.ref];
    return h(Modal, { open: true, onClose, title: "Autre choix — " + cur.ref, wide: true },
      h("p", { className: "text-sm text-slate-500 mb-4" }, "Uniquement des produits du même rôle, vérifiés contre le reste de votre configuration. Les produits incompatibles restent visibles, avec la raison."),
      h("div", { className: "space-y-2.5" },
        h("div", { className: "rounded-xl border-2 border-salus-cyan bg-salus-cyan/5 p-3.5 flex items-center gap-3" },
          h("img", { src: cur.img, className: "w-11 h-11 rounded-lg bg-white object-cover" }),
          h("div", { className: "flex-1" },
            h("div", { className: "font-bold text-salus-navy text-sm" }, cur.ref + " — votre choix actuel"),
            h("div", { className: "text-xs text-slate-500" }, cur.descUser)),
          h(PriceTag, { value: cur.price })),
        alts.map(a => h("div", {
          key: a.ref,
          className: cx("rounded-xl border p-3.5 flex items-center gap-3",
            a.state === "no" ? "border-slate-200 bg-slate-50 opacity-70" :
            a.state === "limit" ? "border-amber-300 bg-amber-50/50" : "border-slate-200 bg-white")
        },
          h("img", { src: a.img, className: "w-11 h-11 rounded-lg bg-white object-cover" }),
          h("div", { className: "flex-1 min-w-0" },
            h("div", { className: "flex items-center gap-2 flex-wrap" },
              h("span", { className: "font-bold text-salus-navy text-sm" }, (CAT.products[a.ref] || {}).ref),
              h("span", { className: cx("text-[10px] font-bold rounded-full px-2 py-0.5",
                a.delta > 0 ? "bg-amber-100 text-amber-800" : a.delta < 0 ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500") }, a.deltaLabel),
              a.refToConfirm && h("span", { className: "text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold uppercase" }, "réf. à confirmer")),
            h("div", { className: "text-xs text-slate-500 mt-0.5" }, a.functionDelta),
            (a.state !== "ok") && h("div", { className: cx("text-xs mt-1 font-medium", a.state === "no" ? "text-slate-500" : "text-amber-700") },
              (a.state === "no" ? "✕ " : "⚠ ") + a.reason)),
          a.state !== "no"
            ? h(Btn, {
                kind: a.state === "limit" ? "warn" : "primary", className: "!px-3 !py-1.5 !text-xs shrink-0",
                onClick: () => { setSelection(s => ({ ...s, swaps: { ...(s.swaps || {}), [line.ref]: a.ref } })); onClose(); }
              }, "Choisir")
            : a.missingRef
              ? h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs shrink-0", disabled: true }, "Ajouter " + a.missingRef)
              : null
        ))
      )
    );
  }

  /* ---------- Variante technique (règle Mathieu : TRV → auto-équilibrantes) ---------- */
  function VariantCard({ answers, selection, setSelection, eff }) {
    const trvCount = eff.items.filter(it => it.ref === "TRV3RF" || it.ref === "TRV3RF-AB").reduce((s, it) => s + it.qty, 0);
    if (!trvCount) return null;
    const delta = (CAT.products["TRV3RF-AB"].price - CAT.products.TRV3RF.price) * trvCount;
    return h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3" },
      h("div", { className: "flex-1" },
        h("div", { className: "font-semibold text-salus-navy text-sm" }, "Variante technique — têtes auto-équilibrantes"),
        h("div", { className: "text-xs text-slate-500 mt-0.5" },
          "Vos " + trvCount + " têtes répartissent d'elles-mêmes le débit entre radiateurs : plus besoin d'équilibrer le réseau à la main. ",
          h("span", { className: "text-slate-400" }, "(réf. à confirmer — BETA)")),
        h("div", { className: "text-xs font-semibold text-salus-navy mt-1" }, (delta >= 0 ? "+" : "") + eur(delta) + " sur votre solution")),
      h(Btn, {
        kind: selection.trvAB ? "navy" : "ghost", className: "!text-xs shrink-0",
        onClick: () => setSelection(s => ({ ...s, trvAB: !s.trvAB }))
      }, selection.trvAB ? "✓ Variante activée — revenir" : "Activer la variante")
    );
  }

  /* ---------- Packs (P5 / règles Mathieu) ---------- */
  function PacksSection({ selection, setSelection, eff }) {
    return h("div", { className: "grid md:grid-cols-2 gap-3" },
      eff.packs.map(p => {
        const on = selection.packsOn && selection.packsOn[p.id] != null ? selection.packsOn[p.id] : p.preChecked;
        return h("div", { key: p.id, className: cx("rounded-2xl border-2 p-4 bg-white transition", on ? "border-salus-teal" : "border-slate-200") },
          h("div", { className: "flex items-start justify-between gap-2" },
            h("div", null,
              h("div", { className: "font-semibold text-salus-navy text-sm" }, p.name),
              h("div", { className: "text-xs text-slate-500 mt-0.5 leading-snug" }, p.tagline)),
            h(Btn, {
              kind: on ? "navy" : "ghost", className: "!px-3 !py-1.5 !text-xs shrink-0",
              onClick: () => setSelection(s => ({ ...s, packsOn: { ...(s.packsOn || {}), [p.id]: !on } }))
            }, on ? "✓ Ajouté" : "Ajouter")),
          h("div", { className: "mt-2.5 flex items-center justify-between" },
            h("div", { className: "text-xs text-slate-500" },
              p.items.map(pi => pi.qty + " × " + (CAT.products[pi.ref] || {}).ref).join(" + ")),
            h(PriceTag, { value: p.total })),
          h("div", { className: "text-[11px] text-slate-400 mt-1.5" }, p.note));
      })
    );
  }

  /* ---------- Économies (P20) ---------- */
  function SavingsCard({ answers, selection }) {
    const [method, setMethod] = useState(false);
    const s = E.savings(answers, selection.level);
    return h("div", { className: "rounded-2xl bg-salus-navy text-white p-5 relative overflow-hidden" },
      h("div", { className: "absolute -right-16 -top-16 w-56 h-56 rounded-full border border-salus-cyan/25", style: { boxShadow: "0 0 0 24px rgba(0,174,239,.06), 0 0 0 60px rgba(0,174,239,.04)" } }),
      h("div", { className: "text-xs uppercase tracking-wide text-salus-cyan font-bold mb-1" }, "Économies estimées"),
      h("div", { className: "font-ubuntu text-3xl font-bold" }, s.pctLow + " – " + s.pctHigh + " %"),
      h("div", { className: "text-sm text-white/80 mt-1" },
        "soit " + eur(s.eurLow) + " à " + eur(s.eurHigh) + " par an ",
        h("span", { className: "text-[10px] bg-amber-400/20 text-amber-200 rounded px-1.5 py-0.5 font-semibold uppercase align-middle ml-1" }, "estimation fictive · beta")),
      h("div", { className: "text-xs text-white/50 mt-2" }, "Base : " + s.basis),
      h("button", { onClick: () => setMethod(true), className: "mt-3 text-xs font-semibold text-salus-cyan hover:underline" }, "Voir la méthode →"),
      h(Modal, { open: method, onClose: () => setMethod(false), title: "Méthode d'estimation" },
        h("div", { className: "space-y-3 text-sm text-slate-600" },
          h("div", { className: "font-semibold text-salus-navy" }, COPY.savingsMethod.standard),
          h("p", null, COPY.savingsMethod.text),
          h(InfoBox, { tone: "warn" }, COPY.savingsMethod.betaNote)))
    );
  }

  /* ---------- Documents (P14 + P21) ---------- */
  function DocsSection({ answers, eff, projectCode, isPro }) {
    const agg = E.aggregate(eff.all);
    const dl = (fn) => { try { fn(); } catch (e) { alert("Génération PDF indisponible : " + e.message); } };
    return h("div", { className: "space-y-4" },
      h(InfoBox, { tone: "info", title: "Uniquement les documents de VOTRE configuration" },
        "La matrice documentaire est interrogée avec vos " + agg.length + " produits : rien d'autre n'est affiché. Un document réel manquant apparaît comme manquant — il n'est jamais passé sous silence."),
      h("div", { className: "grid sm:grid-cols-2 gap-3" },
        agg.map(line => {
          const p = CAT.products[line.ref] || {};
          const missing = MISSING_DOCS[line.ref] || [];
          return h("div", { key: line.ref, className: "rounded-2xl border border-slate-200 bg-white p-4" },
            h("div", { className: "flex items-center justify-between mb-2" },
              h("span", { className: "font-bold text-salus-navy text-sm" }, p.ref),
              h("button", {
                className: "text-xs font-semibold text-salus-cyan hover:underline",
                onClick: () => dl(() => window.SalusDocs.productSheet(line.ref).save("SALUS_BETA_fiche_" + p.ref + ".pdf"))
              }, "Fiche PDF ↓")),
            h("div", { className: "flex flex-wrap gap-1.5" },
              (p.docs || []).map(d => missing.includes(d)
                ? h("span", { key: d, className: "text-[10px] rounded-full px-2 py-1 bg-red-50 text-red-500 border border-dashed border-red-300 font-semibold" }, COPY.docLabels[d] + " — manquant")
                : h("span", { key: d, className: "text-[10px] rounded-full px-2 py-1 bg-slate-100 text-slate-600 font-medium" }, COPY.docLabels[d]))));
        })),
      h("div", { className: "flex flex-wrap gap-3" },
        h(Btn, {
          kind: "navy",
          onClick: () => dl(() => window.SalusDocs.installGuide(answers, eff.all, { projectCode }).save("SALUS_BETA_guide_installation_" + projectCode + ".pdf"))
        }, "⬇ Guide d'installation du système (PDF)"),
        h(Btn, {
          kind: "ghost",
          onClick: () => dl(() => window.SalusDocs.docPack(agg.map(l => l.ref), { projectCode }).save("SALUS_BETA_pack_documentaire_" + projectCode + ".pdf"))
        }, "⬇ Pack documentaire complet (PDF)")),
      h("div", { className: "grid sm:grid-cols-2 gap-3" },
        h(VideoPlaceholder, { label: "Appairage de la passerelle — pas à pas", duration: "1:20" }),
        h(VideoPlaceholder, { label: isPro ? "Câblage du récepteur générateur" : "Votre système au quotidien (application)", duration: "0:45" }))
    );
  }

  /* ---------- Actions finales (P8 / P10 / P19 / P25 / P26) ---------- */
  function ActionsSection({ answers, selection, eff, projectCode, onOpenBackstage }) {
    const [modal, setModal] = useState(null); // 'email' | 'quote' | 'contact'
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const isPro = answers.profile === "installer";
    const agg = E.aggregate(eff.all);

    const doQuote = () => {
      const { doc, num, total } = window.SalusDocs.quote(answers, { items: agg }, { projectCode, level: selection.level });
      doc.save("SALUS_BETA_devis_" + num + ".pdf");
      CRM.logEvent("quote", "Devis " + num + " généré (" + total + " € fictifs)",
        CRM.quotePayload(answers, { items: agg }, { projectCode, level: selection.level }), CRM.flows.quote);
      setModal("quote");
    };
    const doEmail = () => {
      CRM.logEvent("resume", "Liste envoyée + lien de reprise (email simulé)",
        CRM.leadPayload(answers, { projectCode, level: selection.level, total: eff.total }), CRM.flows.resume);
      setSent(true);
    };
    const doContact = () => {
      CRM.logEvent("lead", "Demande de mise en relation envoyée (simulée)",
        CRM.leadPayload(answers, { projectCode, level: selection.level, total: eff.total }), CRM.flows.lead);
      setModal("contact");
    };

    return h("div", null,
      h("div", { className: "grid md:grid-cols-3 gap-3" },
        h(ActionCard, {
          icon: "✉", title: "Recevoir ma liste par email",
          desc: "La liste complète + le lien pour reprendre votre projet où vous l'avez laissé.",
          cta: "Recevoir", onClick: () => { setSent(false); setModal("email"); }
        }),
        h(ActionCard, {
          icon: "🧾", title: isPro ? "Créer le devis client" : "Créer mon devis",
          desc: isPro ? "Devis au prix public conseillé, à présenter à votre distributeur Salus." : "Devis PDF au prix public conseillé, prêt à partager.",
          cta: "Générer le PDF", onClick: doQuote, primary: true
        }),
        h(ActionCard, {
          icon: "🤝", title: isPro ? "Être rappelé par Salus" : "Être mis en relation",
          desc: isPro ? "Votre commercial de secteur reprend le dossier." : "Installateurs Club Pro de votre secteur, membres en premier.",
          cta: "Voir", onClick: doContact
        })),

      /* --- Modale email + lien de reprise (P23/P26) --- */
      h(Modal, { open: modal === "email", onClose: () => setModal(null), title: "Votre liste par email (simulation)" },
        !sent ? h("div", { className: "space-y-3" },
          h("p", { className: "text-sm text-slate-600" }, "En production, cet email contient la liste des produits, le total et le lien de reprise du projet ", h("b", null, projectCode), ". L'adresse alimente aussi le CRM (relance automatique à 48 h si le projet reste en pause)."),
          h("input", {
            type: "email", value: email, onChange: e => setEmail(e.target.value),
            placeholder: "votre@email.fr (rien n'est envoyé — BETA)",
            className: "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-salus-cyan"
          }),
          h(Btn, { onClick: doEmail, className: "w-full" }, "Simuler l'envoi")) :
          h("div", { className: "space-y-3" },
            h(InfoBox, { tone: "ok", title: "Email simulé — rien n'est parti" }, "Voici ce que le client recevrait :"),
            h("div", { className: "rounded-xl border border-slate-200 p-4 text-sm bg-slate-50" },
              h("div", { className: "text-xs text-slate-400 mb-2" }, "De : Configurateur Salus · Objet : Votre solution " + projectCode),
              h("p", { className: "mb-2" }, "Bonjour, voici votre solution (" + eur(eff.total) + " — prix fictifs BETA, " + agg.length + " références)."),
              h("p", { className: "mb-2" }, "→ Continuez votre configuration où vous l'avez laissée : ",
                h("span", { className: "text-salus-cyan font-semibold" }, "configurateur.salus.fr/reprise/" + projectCode)),
              h("p", { className: "text-xs text-slate-400" }, "Sans retour de votre part sous 48 h, un rappel automatique vous sera envoyé.")),
            h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "Voir ce qui partirait vers Zoho CRM →"))),

      /* --- Modale devis généré --- */
      h(Modal, { open: modal === "quote", onClose: () => setModal(null), title: "Devis généré" },
        h("div", { className: "space-y-3" },
          h(InfoBox, { tone: "ok", title: "PDF téléchargé" }, "Le devis de substitution est dans vos téléchargements — prix publics conseillés fictifs, mention BETA sur chaque page."),
          isPro && h(InfoBox, { tone: "info", title: "Rôle du distributeur protégé" },
            "Le devis reste au prix public : présentez-le à votre distributeur Salus (" + COPY.distributors.join(", ") + ") pour votre remise professionnelle. Aucun prix net dans l'outil."),
          h("p", { className: "text-sm text-slate-600" }, "En production, ce devis serait produit par Zoho CRM (modèle unique, numérotation nationale) et rattaché au dossier."),
          h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "Voir le payload Zoho simulé →"))),

      /* --- Modale mise en relation (P10/P19) --- */
      h(Modal, { open: modal === "contact", onClose: () => setModal(null), title: isPro ? "Reprise par votre commercial" : "Installateurs de votre secteur" },
        h("div", { className: "space-y-3" },
          isPro
            ? h(InfoBox, { tone: "info", title: "Dossier transmis (simulation)" },
                "Votre configuration complète part au commercial Salus du secteur " + (answers.postalCode || "—") + ", qui vous oriente vers le distributeur capable de tout fournir.")
            : h(React.Fragment, null,
                h("p", { className: "text-sm text-slate-600" }, "Secteur " + (answers.postalCode || "—") + " — les membres du Club Pro reçoivent les demandes du configurateur en premier."),
                COPY.clubPro.map((i, k) => h("div", { key: k, className: "rounded-xl border border-slate-200 p-3.5 flex items-center gap-3" },
                  h("div", { className: "w-10 h-10 rounded-full bg-salus-navy/5 flex items-center justify-center text-lg" }, "🔧"),
                  h("div", { className: "flex-1" },
                    h("div", { className: "text-sm font-semibold text-salus-navy flex items-center gap-2" }, i.name,
                      h("span", { className: "text-[9px] bg-salus-cyan text-white rounded-full px-1.5 py-0.5 font-bold uppercase" }, i.badge)),
                    h("div", { className: "text-xs text-slate-400" }, i.city + " · " + i.rating + " — données fictives BETA")),
                  h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs", onClick: () => alert("BETA : la demande de devis partirait à cet installateur via le CRM.") }, "Demander un devis"))),
                h(InfoBox, { tone: "info" }, "Installateur non membre ? « Rejoignez le Club Pro pour recevoir les demandes de votre secteur. »")),
          h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "Voir le routage CRM simulé →")))
    );
  }

  function ActionCard({ icon, title, desc, cta, onClick, primary }) {
    return h("div", { className: cx("rounded-2xl border-2 p-4 bg-white flex flex-col", primary ? "border-salus-cyan" : "border-slate-200") },
      h("div", { className: "text-2xl mb-1.5" }, icon),
      h("div", { className: "font-semibold text-salus-navy text-sm" }, title),
      h("p", { className: "text-xs text-slate-500 mt-1 mb-3 flex-1 leading-snug" }, desc),
      h(Btn, { kind: primary ? "primary" : "ghost", onClick, className: "!text-xs" }, cta));
  }

  /* ---------- Vue résultat complète ---------- */
  function Result({ answers, selection, setSelection, projectCode, onOpenBackstage, onRestart, onEdit }) {
    const eff = useEffectiveItems(answers, selection);
    const [compare, setCompare] = useState(false);
    const isPro = answers.profile === "installer";
    const svg = useMemo(() => {
      const graph = window.SalusSchematic.buildGraph(answers, eff.all);
      return window.SalusSchematic.renderSVG(graph);
    }, [answers, eff.all]);
    const rep = E.repeaterAdvice(answers, eff.items);
    const repIn = eff.all.some(it => it.ref === "RE600");

    return h("div", { className: "max-w-5xl mx-auto px-4 pb-24 space-y-10 fadeUp" },

      /* En-tête */
      h("div", { className: "pt-6 flex flex-wrap items-start justify-between gap-3" },
        h("div", null,
          h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy" }, "Votre solution"),
          h("p", { className: "text-sm text-slate-500 mt-1" }, CRM.describeProject(answers)),
          h("p", { className: "text-xs text-slate-400 mt-0.5" }, "Projet ", h("b", { className: "text-salus-navy" }, projectCode), " — vos réponses sont conservées dans ce navigateur.")),
        h("div", { className: "flex gap-2" },
          h(Btn, { kind: "ghost", className: "!text-xs", onClick: onEdit }, "← Modifier mes réponses"),
          h(Btn, { kind: "subtle", className: "!text-xs", onClick: onRestart }, "Recommencer"))),

      /* Complétude (P1) */
      eff.missing.length > 0 && h(InfoBox, { tone: "warn", title: "Il manque un élément pour que le système fonctionne" },
        eff.missing.map((m, i) => h("div", { key: i, className: "flex items-center justify-between gap-2 py-1" },
          h("span", null, m.reason),
          h(Btn, {
            kind: "warn", className: "!px-3 !py-1 !text-xs",
            onClick: () => setSelection(s => ({ ...s, removedRefs: (s.removedRefs || []).filter(r => r !== m.ref) }))
          }, "Ajouter " + m.ref)))),

      /* Niveaux */
      h("section", null,
        h(SectionTitle, { sub: "Trois niveaux calculés pour votre logement — jamais un choix impossible à faire. Les packs d'options sont à part, plus bas." }, "Choisissez votre niveau"),
        h(LevelCards, { answers, selection, setSelection, levels: eff.levels }),
        h("div", { className: "mt-3 text-right" },
          h("button", { onClick: () => setCompare(!compare), className: "text-sm font-semibold text-salus-cyan hover:underline" },
            compare ? "Masquer la comparaison" : "Comparer les trois niveaux →")),
        compare && h("div", { className: "mt-3 fadeUp" }, h(CompareTable, { answers, levels: eff.levels }))),

      /* Avertissement portée radio (P11) */
      rep.needed && h(InfoBox, { tone: repIn ? "info" : "warn", title: "Portée radio" },
        rep.reasons.join(" "), repIn ? " Un répéteur RE600 est déjà dans votre solution — retirable dans la liste ci-dessous." : " Répéteur retiré de votre solution : à vos risques sur la portée."),

      /* Vue logement */
      h("section", null,
        h(SectionTitle, { sub: "Chaque pièce que vous avez déclarée, avec ses appareils et ce que ça change au quotidien." }, "Votre logement, pièce par pièce"),
        h(RoomsView, { answers, items: eff.all })),

      /* Liste produits */
      h("section", null,
        h(SectionTitle, { sub: "Chaque ligne explique à quoi sert le produit. « Autre choix » n'ouvre que des produits du même rôle, compatibles avec le reste." }, "Le détail de votre solution"),
        h(ProductList, { answers, selection, setSelection, eff, isPro }),
        h("div", { className: "mt-3" }, h(VariantCard, { answers, selection, setSelection, eff }))),

      /* Packs */
      h("section", null,
        h(SectionTitle, { sub: "Des options qui s'ajoutent par-dessus votre niveau — jamais mélangées avec." }, "Packs optionnels"),
        h(PacksSection, { selection, setSelection, eff })),

      /* Schéma + économies */
      h("section", { className: "grid lg:grid-cols-[1fr_320px] gap-4 items-start" },
        h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto" },
          h(SectionTitle, { sub: "Généré automatiquement depuis votre configuration — trait plein : filaire, pointillés : radio." }, "Le schéma de votre système"),
          h("div", { className: "min-w-[640px]", dangerouslySetInnerHTML: { __html: svg } })),
        h(SavingsCard, { answers, selection })),

      /* Documents */
      h("section", null,
        h(SectionTitle, { sub: "Documents de substitution générés depuis votre configuration : structure réelle, contenu de test." }, "Vos documents"),
        h(DocsSection, { answers, eff, projectCode, isPro })),

      /* Actions */
      h("section", null,
        h(SectionTitle, { sub: "En production, ces trois actions alimentent Zoho CRM — le panneau « Coulisses CRM » montre exactement ce qui partirait." }, "Et maintenant ?"),
        h(ActionsSection, { answers, selection, eff, projectCode, onOpenBackstage }))
    );
  }

  window.SalusResult = { Result, useEffectiveItems, LEVEL_META, MISSING_DOCS };
})();
