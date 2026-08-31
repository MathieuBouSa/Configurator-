/* ============================================================
   SALUS Configurateur BETA — Composants UI partagés
   ------------------------------------------------------------
   React 18 UMD sans build : h = React.createElement, dans la
   continuité des configurateurs Salus existants.
   ============================================================ */

(function () {
  const h = React.createElement;

  const cx = (...a) => a.filter(Boolean).join(" ");

  const eur = (n) => (n == null ? "—" : n.toLocaleString("fr-FR") + " €");

  /* Badge « prix fictif » — obligatoire à côté de CHAQUE prix (règle BETA) */
  function PriceTag({ value, size }) {
    return h("span", { className: "inline-flex items-baseline gap-1.5 whitespace-nowrap" },
      h("span", { className: cx("font-bold text-salus-navy", size === "lg" ? "text-2xl" : "text-base") }, eur(value)),
      h("span", { className: "text-[9px] uppercase tracking-wide bg-amber-100 text-amber-800 rounded px-1 py-0.5 font-semibold" }, "prix fictif · beta")
    );
  }

  function Btn({ onClick, kind, className, children, disabled, title }) {
    const base = "inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed";
    const kinds = {
      primary: "bg-salus-cyan text-white hover:bg-[#0098d4] shadow-sm",
      navy: "bg-salus-navy text-white hover:bg-[#2a3a77]",
      ghost: "bg-white text-salus-navy border border-slate-200 hover:border-salus-cyan",
      subtle: "bg-slate-100 text-salus-navy hover:bg-slate-200",
      warn: "bg-amber-100 text-amber-900 hover:bg-amber-200"
    };
    return h("button", { onClick, disabled, title, className: cx(base, kinds[kind || "primary"], className) }, children);
  }

  /* Carte-réponse cliquable avec image (une question par écran, P6) */
  function ChoiceCard({ label, hint, img, selected, onClick, badge, disabled, reason }) {
    return h("button", {
      onClick, disabled,
      className: cx(
        "tile relative text-left rounded-2xl border-2 bg-white p-4 w-full",
        selected ? "border-salus-cyan ring-2 ring-salus-cyan/30" : "border-slate-200",
        disabled && "opacity-50 cursor-not-allowed hover:transform-none"
      )
    },
      badge && h("span", { className: "absolute top-2 right-2 text-[10px] bg-salus-cyan/10 text-salus-cyan font-bold rounded-full px-2 py-0.5" }, badge),
      img && h("img", { src: img, alt: "", className: "w-full h-24 object-cover rounded-lg mb-3 bg-slate-100" }),
      h("div", { className: "font-semibold text-salus-navy leading-snug" }, label),
      hint && h("div", { className: "text-xs text-slate-500 mt-1 leading-snug" }, hint),
      reason && h("div", { className: "text-xs text-amber-700 mt-1 leading-snug" }, reason),
      selected && h("span", { className: "absolute -top-2 -left-2 w-6 h-6 rounded-full bg-salus-cyan text-white text-xs font-bold flex items-center justify-center shadow" }, "✓")
    );
  }

  function SectionTitle({ children, sub, id }) {
    return h("div", { className: "mb-4", id },
      h("h2", { className: "font-ubuntu text-xl md:text-2xl font-bold text-salus-navy" }, children),
      sub && h("p", { className: "text-sm text-slate-500 mt-1" }, sub)
    );
  }

  function Modal({ open, onClose, title, children, wide }) {
    if (!open) return null;
    return h("div", { className: "fixed inset-0 z-[70] flex items-center justify-center p-4" },
      h("div", { className: "absolute inset-0 bg-salus-navy/50 backdrop-blur-[2px]", onClick: onClose }),
      h("div", { className: cx("relative bg-white rounded-2xl shadow-2xl w-full max-h-[85vh] overflow-y-auto fadeUp", wide ? "max-w-3xl" : "max-w-xl") },
        h("div", { className: "sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-5 py-3.5 flex items-center justify-between rounded-t-2xl" },
          h("h3", { className: "font-ubuntu font-bold text-salus-navy" }, title),
          h("button", { onClick: onClose, className: "w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 font-bold" }, "✕")
        ),
        h("div", { className: "p-5" }, children)
      )
    );
  }

  /* Bloc vidéo placeholder (P17 : la vidéo au bon moment, jamais en bibliothèque) */
  function VideoPlaceholder({ label, duration }) {
    return h("div", { className: "relative rounded-xl overflow-hidden bg-salus-navy/90 text-white flex items-center justify-center h-36 select-none" },
      h("div", { className: "absolute inset-0 opacity-20", style: { background: "radial-gradient(400px 200px at 30% 20%, #00AEEF 0%, transparent 60%)" } }),
      h("div", { className: "text-center px-4" },
        h("div", { className: "w-11 h-11 mx-auto rounded-full bg-white/15 border border-white/40 flex items-center justify-center text-lg mb-2" }, "▶"),
        h("div", { className: "text-xs font-semibold" }, label),
        h("div", { className: "text-[10px] text-white/60 mt-0.5" }, (duration || "0:45") + " · vidéo de substitution — BETA")
      )
    );
  }

  /* Barre d'étapes nommées, toujours visible (P4) */
  function StepBar({ steps, current, onJump, maxReached }) {
    return h("div", { className: "flex items-center gap-1 md:gap-2 flex-wrap" },
      steps.map((s, i) => h(React.Fragment, { key: s.id },
        i > 0 && h("div", { className: cx("h-px w-4 md:w-8", i <= current ? "bg-salus-cyan" : "bg-slate-300") }),
        h("button", {
          onClick: () => i <= maxReached && onJump(i),
          className: cx("flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs md:text-sm font-semibold transition",
            i === current ? "bg-salus-navy text-white" :
            i <= maxReached ? "bg-salus-cyan/10 text-salus-navy hover:bg-salus-cyan/20" : "bg-slate-100 text-slate-400 cursor-default")
        },
          h("span", { className: cx("w-5 h-5 rounded-full text-[11px] flex items-center justify-center font-bold", i === current ? "bg-salus-cyan text-white" : i < current ? "bg-salus-cyan/80 text-white" : "bg-white text-slate-400 border border-slate-300") }, i < current ? "✓" : i + 1),
          h("span", { className: "hidden sm:inline" }, s.label)
        )
      ))
    );
  }

  function InfoBox({ tone, title, children }) {
    const tones = {
      info: "bg-salus-cyan/10 border-salus-cyan/40 text-salus-navy",
      warn: "bg-amber-50 border-amber-300 text-amber-900",
      ok: "bg-emerald-50 border-emerald-300 text-emerald-900"
    };
    return h("div", { className: cx("rounded-xl border px-4 py-3 text-sm leading-relaxed", tones[tone || "info"]) },
      title && h("div", { className: "font-bold mb-0.5" }, title),
      children
    );
  }

  function Stepper({ value, onChange, min, max }) {
    return h("div", { className: "inline-flex items-center gap-1 rounded-lg border border-slate-300 bg-white overflow-hidden" },
      h("button", { className: "px-2.5 py-1 hover:bg-slate-100 font-bold text-salus-navy", onClick: () => onChange(Math.max(min == null ? 0 : min, (value || 0) - 1)) }, "−"),
      h("span", { className: "w-8 text-center text-sm font-semibold" }, value || 0),
      h("button", { className: "px-2.5 py-1 hover:bg-slate-100 font-bold text-salus-navy", onClick: () => onChange(Math.min(max == null ? 99 : max, (value || 0) + 1)) }, "+")
    );
  }

  window.UI = { h, cx, eur, PriceTag, Btn, ChoiceCard, SectionTitle, Modal, VideoPlaceholder, StepBar, InfoBox, Stepper };
})();
