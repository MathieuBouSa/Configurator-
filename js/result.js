/* ============================================================
   SALUS Configurator BETA - "My solution" screen (result)
   ------------------------------------------------------------
   Two parts (P7): the room-by-room view of the home on top, the
   product list below, each line with its "Other choice" button.
   Essential / Comfort / Premium levels calculated by rules (P5),
   separate packs (P24), generated diagram (P18), savings as a
   range (P20), filtered documents (P14), three final actions
   (P8).
   ============================================================ */

(function () {
  const { h, cx, eur, Icon, IconTile, PriceTag, Btn, ChoiceCard, SectionTitle, Modal, VideoPlaceholder, InfoBox, Stepper } = window.UI;
  const { useState, useMemo } = React;
  const E = window.SalusEngine;
  const CAT = window.SALUS_CATALOG;
  const COPY = window.SALUS_COPY;
  const CRM = window.SalusCRM;

  const LEVEL_META = {
    essential: { name: "Essential", tag: "The essentials", color: "border-slate-300" },
    comfort: { name: "Comfort", tag: "Most chosen", color: "border-salus-cyan", popular: true },
    premium: { name: "Premium", tag: "Room by room, no compromise", color: "border-salus-navy" }
  };

  /* Deliberately "missing" documents: the matrix must show an
     absent document as absent (rule P14), never hide it. */
  const MISSING_DOCS = { WQ610: ["video_install"], THB: ["fiche"], "TRV3RF-AB": ["notice_user"] };

  /* ---------- Effective selection (level + variants + swaps + packs) ---------- */
  function useEffectiveItems(answers, selection) {
    return useMemo(() => {
      const levels = E.buildLevels(answers);
      const base = levels[selection.level] || levels.comfort;
      let items = base.items.map(it => ({ ...it }));

      if (selection.trvAB) items = items.map(it => it.ref === "TRV3RF" ? { ...it, ref: "TRV3RF-AB", reason: it.reason + " Auto-balancing version chosen." } : it);
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

  /* ---------- Level cards + budget (P5 / P24) ---------- */
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
          meta.popular && h("span", { className: "absolute -top-3 left-4 bg-salus-cyan text-white text-[10px] font-bold rounded-full px-2.5 py-1 uppercase tracking-wide" }, "Most chosen"),
          selected && h("span", { className: "absolute -top-2 -right-2 w-7 h-7 rounded-full bg-salus-cyan text-white text-sm font-bold flex items-center justify-center shadow" }, "✓"),
          h("div", { className: "font-ubuntu font-bold text-lg text-salus-navy" }, meta.name),
          h("div", { className: "text-xs text-slate-500 mb-3" }, meta.tag),
          h(PriceTag, { value: lvl.total, size: "lg" }),
          h("div", { className: "text-xs text-slate-500 mt-1" }, lvl.deviceCount + " devices"),
          over && h("div", { className: "mt-2 text-xs font-semibold text-amber-700 bg-amber-50 rounded-lg px-2 py-1.5" },
            "+" + eur(lvl.total - budget) + " above your budget - your call."),
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
      if (hasRad) out.push("Every radiator controlled by its own connected head - 0 room thermostat.");
      if (hasUfh) out.push("Every underfloor zone with its own thermostat.");
    }
    if (id === "comfort") {
      out.push("Like Essential + a room thermostat in the main living room.");
    }
    if (id === "premium") {
      if (hasRad) out.push("A room thermostat in every room.");
      if (hasUfh) out.push("Auto-balancing actuators on the manifold.");
    }
    return out;
  }

  /* ---------- Side-by-side comparison (covers P22 - flagged addition) ---------- */
  function CompareTable({ answers, levels }) {
    const rows = [
      ["Total price (fictional - BETA)", l => eur(levels[l].total)],
      ["Devices", l => levels[l].deviceCount],
      ["Room-by-room control", l => answers.perRoomControl === "yes" ? "\u2713" : "-"],
      ["Room thermostat", l => l === "essential" ? (answers.perRoomControl === "yes" ? "-" : "1") : l === "comfort" ? "Living room" : "Every room"],
      ["Estimated savings*", l => { const s = E.savings(answers, l); return s.pctLow + " - " + s.pctHigh + " %"; }],
      ["Remote control", l => levels[l].items.some(it => ["UG800"].includes(it.ref) || (CAT.products[it.ref] || {}).integratedGateway) ? "\u2713" : "-"]
    ];
    return h("div", { className: "overflow-x-auto rounded-2xl border border-slate-200 bg-white" },
      h("table", { className: "w-full text-sm" },
        h("thead", null, h("tr", { className: "bg-salus-navy text-white" },
          h("th", { className: "text-left px-4 py-2.5 font-semibold rounded-tl-2xl" }, ""),
          ["essential", "comfort", "premium"].map((l, i) => h("th", { key: l, className: cx("px-4 py-2.5 font-ubuntu", i === 2 && "rounded-tr-2xl") }, LEVEL_META[l].name)))),
        h("tbody", null, rows.map(([label, fn], ri) => h("tr", { key: ri, className: ri % 2 ? "bg-slate-50" : "" },
          h("td", { className: "px-4 py-2.5 text-slate-600" }, label),
          ["essential", "comfort", "premium"].map(l => h("td", { key: l, className: "px-4 py-2.5 text-center font-semibold text-salus-navy" }, fn(l))))))),
      h("div", { className: "px-4 py-2 text-[11px] text-slate-400" }, "* Fictional estimate range (BETA) - EN 15232 method, see the Savings card.")
    );
  }

  /* ---------- Room-by-room view of the home (P7 + P22) ---------- */
  function RoomsView({ answers, items }) {
    const rooms = answers.rooms || [];
    const byRoom = {};
    items.forEach(it => { if (it.roomId != null) (byRoom[it.roomId] = byRoom[it.roomId] || []).push(it); });
    const floors = [...new Set(rooms.map(r => r.floor || 0))].sort((a, b) => b - a);
    return h("div", { className: "space-y-4" },
      floors.map(f => h("div", { key: f },
        floors.length > 1 && h("div", { className: "text-xs font-bold uppercase tracking-wide text-slate-400 mb-2" }, f === 0 ? "Ground floor" : "Floor " + f),
        h("div", { className: "grid sm:grid-cols-2 lg:grid-cols-3 gap-3" },
          rooms.filter(r => (r.floor || 0) === f).map(room => {
            const t = COPY.roomTypes.find(x => x.id === room.type) || {};
            const benefit = (COPY.roomBenefits[room.type] || COPY.roomBenefits.autre)((room.name || t.label || "room").toLowerCase());
            return h("div", { key: room.id, className: "rounded-2xl border border-slate-200 bg-white p-4" },
              h("div", { className: "flex items-center gap-2.5 mb-2" },
                h(IconTile, { name: t.icon, className: "w-9 h-9 rounded-lg shrink-0", size: "w-5 h-5" }),
                h("div", null,
                  h("div", { className: "font-semibold text-salus-navy text-sm" }, room.name),
                  h("div", { className: "text-[11px] text-slate-400" }, emitterLabel(room.emitter)))),
              h("div", { className: "flex flex-wrap gap-1.5 mb-2" },
                (byRoom[room.id] || []).map((it, i) => h("span", { key: i, className: "text-[11px] bg-salus-cyan/10 text-salus-navy font-semibold rounded-full px-2 py-0.5" },
                  (it.qty > 1 ? it.qty + " × " : "") + (CAT.products[it.ref] || {}).ref)),
                !(byRoom[room.id] || []).length && h("span", { className: "text-[11px] text-slate-400" }, "whole-home control")),
              h("p", { className: "text-xs text-slate-600 italic leading-snug" }, "\u201c" + benefit + "\u201d")
            );
          }))
      ))
    );
  }

  function emitterLabel(id) {
    return (window.SALUS_MARKETS.emitters[id] || {}).label || "-";
  }

  /* ---------- Product list + Other choice (P2 / P7) ---------- */
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
              p.refToConfirm && h("span", { className: "text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold uppercase" }, "ref. to confirm"),
              line.auto && h("span", { className: "text-[9px] bg-salus-teal/15 text-salus-teal rounded px-1.5 py-0.5 font-semibold uppercase" }, "added by the configurator")),
            h("div", { className: "text-sm text-slate-600" }, p.name),
            h("div", { className: "text-xs text-slate-400 mt-0.5 leading-snug" }, isPro ? p.descPro : p.solution)),
          h("div", { className: "flex items-center gap-3 shrink-0" },
            h(PriceTag, { value: p.price * line.qty }),
            alts.length > 0 && h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs", onClick: () => setAltFor(line) }, "Other choice"),
            line.removable && h(Btn, {
              kind: "subtle", className: "!px-3 !py-1.5 !text-xs",
              onClick: () => setSelection(s => ({ ...s, removedRefs: [...(s.removedRefs || []), line.ref] }))
            }, "Remove"))
        );
      }),
      h("div", { className: "p-4 flex items-center justify-between bg-slate-50 rounded-b-2xl" },
        h("span", { className: "font-semibold text-salus-navy" }, "Total for your solution"),
        h(PriceTag, { value: eff.total, size: "lg" })),
      h(AltModal, { line: altFor, onClose: () => setAltFor(null), answers, eff, setSelection })
    );
  }

  /* Alternatives: compatible first, incompatible GREYED OUT with
     the reason in one sentence - never hidden (P1). */
  function AltModal({ line, onClose, answers, eff, setSelection }) {
    if (!line) return null;
    const alts = E.alternativesFor(answers, eff.all, { ref: line.ref, qty: line.qty });
    const cur = CAT.products[line.ref];
    return h(Modal, { open: true, onClose, title: "Other choice - " + cur.ref, wide: true },
      h("p", { className: "text-sm text-slate-500 mb-4" }, "Only products with the same role, checked against the rest of your configuration. Incompatible products stay visible, with the reason."),
      h("div", { className: "space-y-2.5" },
        h("div", { className: "rounded-xl border-2 border-salus-cyan bg-salus-cyan/5 p-3.5 flex items-center gap-3" },
          h("img", { src: cur.img, className: "w-11 h-11 rounded-lg bg-white object-cover" }),
          h("div", { className: "flex-1" },
            h("div", { className: "font-bold text-salus-navy text-sm" }, cur.ref + " - your current choice"),
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
              a.refToConfirm && h("span", { className: "text-[9px] bg-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-semibold uppercase" }, "ref. to confirm")),
            h("div", { className: "text-xs text-slate-500 mt-0.5" }, a.functionDelta),
            (a.state !== "ok") && h("div", { className: cx("text-xs mt-1 font-medium", a.state === "no" ? "text-slate-500" : "text-amber-700") },
              (a.state === "no" ? "\u2715 " : "\u26a0 ") + a.reason)),
          a.state !== "no"
            ? h(Btn, {
                kind: a.state === "limit" ? "warn" : "primary", className: "!px-3 !py-1.5 !text-xs shrink-0",
                onClick: () => { setSelection(s => ({ ...s, swaps: { ...(s.swaps || {}), [line.ref]: a.ref } })); onClose(); }
              }, "Choose")
            : a.missingRef
              ? h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs shrink-0", disabled: true }, "Add " + a.missingRef)
              : null
        ))
      )
    );
  }

  /* ---------- Technical variant (Mathieu rule: TRV -> auto-balancing) ---------- */
  function VariantCard({ answers, selection, setSelection, eff }) {
    const trvCount = eff.items.filter(it => it.ref === "TRV3RF" || it.ref === "TRV3RF-AB").reduce((s, it) => s + it.qty, 0);
    if (!trvCount) return null;
    const delta = (CAT.products["TRV3RF-AB"].price - CAT.products.TRV3RF.price) * trvCount;
    return h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 flex flex-col sm:flex-row sm:items-center gap-3" },
      h("div", { className: "flex-1" },
        h("div", { className: "font-semibold text-salus-navy text-sm" }, "Technical variant - auto-balancing heads"),
        h("div", { className: "text-xs text-slate-500 mt-0.5" },
          "Your " + trvCount + " heads share the flow between radiators by themselves: no more balancing the circuit by hand. ",
          h("span", { className: "text-slate-400" }, "(ref. to confirm - BETA)")),
        h("div", { className: "text-xs font-semibold text-salus-navy mt-1" }, (delta >= 0 ? "+" : "") + eur(delta) + " on your solution")),
      h(Btn, {
        kind: selection.trvAB ? "navy" : "ghost", className: "!text-xs shrink-0",
        onClick: () => setSelection(s => ({ ...s, trvAB: !s.trvAB }))
      }, selection.trvAB ? "\u2713 Variant on - go back" : "Switch the variant on")
    );
  }

  /* ---------- Packs (P5 / Mathieu rules) ---------- */
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
            }, on ? "\u2713 Added" : "Add")),
          h("div", { className: "mt-2.5 flex items-center justify-between" },
            h("div", { className: "text-xs text-slate-500" },
              p.items.map(pi => pi.qty + " × " + (CAT.products[pi.ref] || {}).ref).join(" + ")),
            h(PriceTag, { value: p.total })),
          h("div", { className: "text-[11px] text-slate-400 mt-1.5" }, p.note));
      })
    );
  }

  /* ---------- Savings (P20) ---------- */
  function SavingsCard({ answers, selection }) {
    const [method, setMethod] = useState(false);
    const s = E.savings(answers, selection.level);
    return h("div", { className: "rounded-2xl bg-salus-navy text-white p-5 relative overflow-hidden" },
      h("div", { className: "absolute -right-16 -top-16 w-56 h-56 rounded-full border border-salus-cyan/25", style: { boxShadow: "0 0 0 24px rgba(0,174,239,.06), 0 0 0 60px rgba(0,174,239,.04)" } }),
      h("div", { className: "text-xs uppercase tracking-wide text-salus-cyan font-bold mb-1" }, "Estimated savings"),
      h("div", { className: "font-ubuntu text-3xl font-bold" }, s.pctLow + " - " + s.pctHigh + " %"),
      h("div", { className: "text-sm text-white/80 mt-1" },
        "that is " + eur(s.eurLow) + " to " + eur(s.eurHigh) + " per year ",
        h("span", { className: "text-[10px] bg-amber-400/20 text-amber-200 rounded px-1.5 py-0.5 font-semibold uppercase align-middle ml-1" }, "fictional estimate / beta")),
      h("div", { className: "text-xs text-white/50 mt-2" }, "Basis: " + s.basis),
      h("button", { onClick: () => setMethod(true), className: "mt-3 text-xs font-semibold text-salus-cyan hover:underline" }, "See the method \u2192"),
      h(Modal, { open: method, onClose: () => setMethod(false), title: "Estimation method" },
        h("div", { className: "space-y-3 text-sm text-slate-600" },
          h("div", { className: "font-semibold text-salus-navy" }, COPY.savingsMethod.standard),
          h("p", null, COPY.savingsMethod.text),
          h(InfoBox, { tone: "warn" }, COPY.savingsMethod.betaNote)))
    );
  }

  /* ---------- Documents (P14 + P21) ---------- */
  function DocsSection({ answers, eff, projectCode, isPro }) {
    const agg = E.aggregate(eff.all);
    const dl = (fn) => { try { fn(); } catch (e) { alert("PDF generation unavailable: " + e.message); } };
    return h("div", { className: "space-y-4" },
      h(InfoBox, { tone: "info", title: "Only the documents for YOUR configuration" },
        "The documentation matrix is queried with your " + agg.length + " products: nothing else is shown. A real document that is missing appears as missing - it is never quietly left out."),
      h("div", { className: "grid sm:grid-cols-2 gap-3" },
        agg.map(line => {
          const p = CAT.products[line.ref] || {};
          const missing = MISSING_DOCS[line.ref] || [];
          return h("div", { key: line.ref, className: "rounded-2xl border border-slate-200 bg-white p-4" },
            h("div", { className: "flex items-center justify-between mb-2" },
              h("span", { className: "font-bold text-salus-navy text-sm" }, p.ref),
              h("button", {
                className: "text-xs font-semibold text-salus-cyan hover:underline",
                onClick: () => dl(() => window.SalusDocs.productSheet(line.ref).save("SALUS_BETA_product_sheet_" + p.ref + ".pdf"))
              }, "Sheet PDF \u2193")),
            h("div", { className: "flex flex-wrap gap-1.5" },
              (p.docs || []).map(d => missing.includes(d)
                ? h("span", { key: d, className: "text-[10px] rounded-full px-2 py-1 bg-red-50 text-red-500 border border-dashed border-red-300 font-semibold" }, COPY.docLabels[d] + " - missing")
                : h("span", { key: d, className: "text-[10px] rounded-full px-2 py-1 bg-slate-100 text-slate-600 font-medium" }, COPY.docLabels[d]))));
        })),
      h("div", { className: "flex flex-wrap gap-3" },
        h(Btn, {
          kind: "navy",
          onClick: () => dl(() => window.SalusDocs.installGuide(answers, eff.all, { projectCode }).save("SALUS_BETA_installation_guide_" + projectCode + ".pdf"))
        }, "\u2b07 System installation guide (PDF)"),
        h(Btn, {
          kind: "ghost",
          onClick: () => dl(() => window.SalusDocs.docPack(agg.map(l => l.ref), { projectCode }).save("SALUS_BETA_documentation_pack_" + projectCode + ".pdf"))
        }, "\u2b07 Full documentation pack (PDF)")),
      h("div", { className: "grid sm:grid-cols-2 gap-3" },
        h(VideoPlaceholder, { label: "Pairing the gateway - step by step", duration: "1:20" }),
        h(VideoPlaceholder, { label: isPro ? "Wiring the heat source receiver" : "Your system day to day (app)", duration: "0:45" }))
    );
  }

  /* ---------- Final actions (P8 / P10 / P19 / P25 / P26) ---------- */
  function ActionsSection({ answers, selection, eff, projectCode, onOpenBackstage }) {
    const [modal, setModal] = useState(null); // 'email' | 'quote' | 'contact'
    const [email, setEmail] = useState("");
    const [sent, setSent] = useState(false);
    const isPro = answers.profile === "installer";
    const agg = E.aggregate(eff.all);

    const doQuote = () => {
      const { doc, num, total } = window.SalusDocs.quote(answers, { items: agg }, { projectCode, level: selection.level });
      doc.save("SALUS_BETA_quote_" + num + ".pdf");
      CRM.logEvent("quote", "Quote " + num + " generated (" + total + " € fictional)",
        CRM.quotePayload(answers, { items: agg }, { projectCode, level: selection.level }), CRM.flows.quote);
      setModal("quote");
    };
    const doEmail = () => {
      CRM.logEvent("resume", "List sent + resume link (simulated email)",
        CRM.leadPayload(answers, { projectCode, level: selection.level, total: eff.total }), CRM.flows.resume);
      setSent(true);
    };
    const doContact = () => {
      CRM.logEvent("lead", "Contact request sent (simulated)",
        CRM.leadPayload(answers, { projectCode, level: selection.level, total: eff.total }), CRM.flows.lead);
      setModal("contact");
    };

    return h("div", null,
      h("div", { className: "grid md:grid-cols-3 gap-3" },
        h(ActionCard, {
          icon: "\u2709", title: "Email me my list",
          desc: "The full list + the link to pick your project up where you left it.",
          cta: "Send it", onClick: () => { setSent(false); setModal("email"); }
        }),
        h(ActionCard, {
          icon: "\ud83e\uddfe", title: isPro ? "Create the customer quote" : "Create my quote",
          desc: isPro ? "Quote at recommended retail price, to present to your Salus distributor." : "PDF quote at recommended retail price, ready to share.",
          cta: "Generate the PDF", onClick: doQuote, primary: true
        }),
        h(ActionCard, {
          icon: "\ud83e\udd1d", title: isPro ? "Get a call from Salus" : "Get put in touch",
          desc: isPro ? "Your area sales rep takes over the file." : "Club Pro installers in your area, members first.",
          cta: "View", onClick: doContact
        })),

      /* --- Email + resume link modal (P23/P26) --- */
      h(Modal, { open: modal === "email", onClose: () => setModal(null), title: "Your list by email (simulation)" },
        !sent ? h("div", { className: "space-y-3" },
          h("p", { className: "text-sm text-slate-600" }, "In production this email carries the product list, the total and the resume link for project ", h("b", null, projectCode), ". The address also feeds the CRM (automatic reminder after 48 h if the project stays on hold)."),
          h("input", {
            type: "email", value: email, onChange: e => setEmail(e.target.value),
            placeholder: "you@email.com (nothing is sent - BETA)",
            className: "w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm focus:outline-none focus:border-salus-cyan"
          }),
          h(Btn, { onClick: doEmail, className: "w-full" }, "Simulate sending")) :
          h("div", { className: "space-y-3" },
            h(InfoBox, { tone: "ok", title: "Simulated email - nothing was sent" }, "Here is what the customer would receive:"),
            h("div", { className: "rounded-xl border border-slate-200 p-4 text-sm bg-slate-50" },
              h("div", { className: "text-xs text-slate-400 mb-2" }, "From: Salus Configurator / Subject: Your solution " + projectCode),
              h("p", { className: "mb-2" }, "Hello, here is your solution (" + eur(eff.total) + " - fictional BETA prices, " + agg.length + " references)."),
              h("p", { className: "mb-2" }, "\u2192 Continue your configuration where you left it: ",
                h("span", { className: "text-salus-cyan font-semibold" }, "configurateur.salus.fr/reprise/" + projectCode)),
              h("p", { className: "text-xs text-slate-400" }, "If we hear nothing within 48 h, an automatic reminder will be sent.")),
            h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "See what would go to Zoho CRM \u2192"))),

      /* --- Generated quote modal --- */
      h(Modal, { open: modal === "quote", onClose: () => setModal(null), title: "Quote generated" },
        h("div", { className: "space-y-3" },
          h(InfoBox, { tone: "ok", title: "PDF downloaded" }, "The placeholder quote is in your downloads - fictional recommended retail prices, BETA notice on every page."),
          isPro && h(InfoBox, { tone: "info", title: "The distributor's role is protected" },
            "The quote stays at retail price: present it to your Salus distributor (" + COPY.distributors.join(", ") + ") for your trade discount. No net price in the tool."),
          h("p", { className: "text-sm text-slate-600" }, "In production this quote would be produced by Zoho CRM (single template, national numbering) and attached to the file."),
          h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "See the simulated Zoho payload \u2192"))),

      /* --- Contact modal (P10/P19) --- */
      h(Modal, { open: modal === "contact", onClose: () => setModal(null), title: isPro ? "Taken over by your sales rep" : "Installers in your area" },
        h("div", { className: "space-y-3" },
          isPro
            ? h(InfoBox, { tone: "info", title: "File sent (simulation)" },
                "Your full configuration goes to the Salus sales rep for area " + (answers.postalCode || "-") + ", who directs you to the distributor able to supply everything.")
            : h(React.Fragment, null,
                h("p", { className: "text-sm text-slate-600" }, "Area " + (answers.postalCode || "-") + " - Club Pro members receive configurator requests first."),
                COPY.clubPro.map((i, k) => h("div", { key: k, className: "rounded-xl border border-slate-200 p-3.5 flex items-center gap-3" },
                  h("div", { className: "w-10 h-10 rounded-full bg-salus-navy/5 flex items-center justify-center text-lg" }, "🔧"),
                  h("div", { className: "flex-1" },
                    h("div", { className: "text-sm font-semibold text-salus-navy flex items-center gap-2" }, i.name,
                      h("span", { className: "text-[9px] bg-salus-cyan text-white rounded-full px-1.5 py-0.5 font-bold uppercase" }, i.badge)),
                    h("div", { className: "text-xs text-slate-400" }, i.city + " / " + i.rating + " - fictional BETA data")),
                  h(Btn, { kind: "ghost", className: "!px-3 !py-1.5 !text-xs", onClick: () => alert("BETA: the quote request would go to this installer through the CRM.") }, "Ask for a quote"))),
                h(InfoBox, { tone: "info" }, "Not a member yet? \u201cJoin the Club Pro to receive the requests from your area.\u201d")),
          h(Btn, { kind: "ghost", className: "w-full", onClick: onOpenBackstage }, "See the simulated CRM routing \u2192")))
    );
  }

  function ActionCard({ icon, title, desc, cta, onClick, primary }) {
    return h("div", { className: cx("rounded-2xl border-2 p-4 bg-white flex flex-col", primary ? "border-salus-cyan" : "border-slate-200") },
      h("div", { className: "text-2xl mb-1.5" }, icon),
      h("div", { className: "font-semibold text-salus-navy text-sm" }, title),
      h("p", { className: "text-xs text-slate-500 mt-1 mb-3 flex-1 leading-snug" }, desc),
      h(Btn, { kind: primary ? "primary" : "ghost", onClick, className: "!text-xs" }, cta));
  }

  /* ---------- Full result view ---------- */
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

      /* Header */
      h("div", { className: "pt-6 flex flex-wrap items-start justify-between gap-3" },
        h("div", null,
          h("h1", { className: "font-ubuntu text-2xl md:text-3xl font-bold text-salus-navy" }, "Your solution"),
          h("p", { className: "text-sm text-slate-500 mt-1" }, CRM.describeProject(answers)),
          h("p", { className: "text-xs text-slate-400 mt-0.5" }, "Project ", h("b", { className: "text-salus-navy" }, projectCode), " - your answers are kept in this browser.")),
        h("div", { className: "flex gap-2" },
          h(Btn, { kind: "ghost", className: "!text-xs", onClick: onEdit }, "\u2190 Change my answers"),
          h(Btn, { kind: "subtle", className: "!text-xs", onClick: onRestart }, "Start again"))),

      /* Completeness (P1) */
      eff.missing.length > 0 && h(InfoBox, { tone: "warn", title: "Something is missing for the system to work" },
        eff.missing.map((m, i) => h("div", { key: i, className: "flex items-center justify-between gap-2 py-1" },
          h("span", null, m.reason),
          h(Btn, {
            kind: "warn", className: "!px-3 !py-1 !text-xs",
            onClick: () => setSelection(s => ({ ...s, removedRefs: (s.removedRefs || []).filter(r => r !== m.ref) }))
          }, "Add " + m.ref)))),

      /* Levels */
      h("section", null,
        h(SectionTitle, { sub: "Three levels calculated for your home - never a choice you cannot make. The optional packs are separate, further down." }, "Choose your level"),
        h(LevelCards, { answers, selection, setSelection, levels: eff.levels }),
        h("div", { className: "mt-3 text-right" },
          h("button", { onClick: () => setCompare(!compare), className: "text-sm font-semibold text-salus-cyan hover:underline" },
            compare ? "Hide the comparison" : "Compare the three levels \u2192")),
        compare && h("div", { className: "mt-3 fadeUp" }, h(CompareTable, { answers, levels: eff.levels }))),

      /* Radio range warning (P11) */
      rep.needed && h(InfoBox, { tone: repIn ? "info" : "warn", title: "Radio range" },
        rep.reasons.join(" "), repIn ? " An RE600 repeater is already in your solution - you can remove it in the list below." : " Repeater removed from your solution: range is at your own risk."),

      /* Home view */
      h("section", null,
        h(SectionTitle, { sub: "Every room you entered, with its devices and what it changes day to day." }, "Your home, room by room"),
        h(RoomsView, { answers, items: eff.all })),

      /* Product list */
      h("section", null,
        h(SectionTitle, { sub: "Every line explains what the product is for. \u201cOther choice\u201d only opens products with the same role, compatible with the rest." }, "Your solution in detail"),
        h(ProductList, { answers, selection, setSelection, eff, isPro }),
        h("div", { className: "mt-3" }, h(VariantCard, { answers, selection, setSelection, eff }))),

      /* Packs */
      h("section", null,
        h(SectionTitle, { sub: "Options added on top of your level - never mixed into it." }, "Optional packs"),
        h(PacksSection, { selection, setSelection, eff })),

      /* Diagram + savings */
      h("section", { className: "grid lg:grid-cols-[1fr_320px] gap-4 items-start" },
        h("div", { className: "rounded-2xl border border-slate-200 bg-white p-4 overflow-x-auto" },
          h(SectionTitle, { sub: "Generated automatically from your configuration - solid line: wired, dotted: radio." }, "Your system diagram"),
          h("div", { className: "min-w-[640px]", dangerouslySetInnerHTML: { __html: svg } })),
        h(SavingsCard, { answers, selection })),

      /* Documents */
      h("section", null,
        h(SectionTitle, { sub: "Placeholder documents generated from your configuration: real structure, test content." }, "Your documents"),
        h(DocsSection, { answers, eff, projectCode, isPro })),

      /* Actions */
      h("section", null,
        h(SectionTitle, { sub: "In production these three actions feed Zoho CRM - the \u201cCRM backstage\u201d panel shows exactly what would go out." }, "What happens next?"),
        h(ActionsSection, { answers, selection, eff, projectCode, onOpenBackstage }))
    );
  }

  window.SalusResult = { Result, useEffectiveItems, LEVEL_META, MISSING_DOCS };
})();
