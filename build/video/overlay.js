/* Overlay for the trade-show videos (see record.mjs): the cursor, the
   click ripple and the full-screen cards (intro, chapter breaks, outro).
   It sits in a shadow root above everything, so it looks the same over
   the stage page (the configurators) and over an external site opened
   directly (layout "direct"), whose own styles cannot reach it.
   Nothing here runs on its own: record.mjs calls window.stage.*. */
(() => {
  if (window.stage && window.stage.overlay) return;

  const FONTS = "https://fonts.googleapis.com/css2?family=Open+Sans:wght@400;600;700&family=Ubuntu:wght@500;700&display=swap";
  const CSS = `
    *{ box-sizing:border-box; }
    .layer{ position:absolute; inset:0; overflow:hidden; pointer-events:none; font-family:'Open Sans',system-ui,sans-serif; -webkit-font-smoothing:antialiased; }

    #cursor{ position:absolute; left:-60px; top:-60px; z-index:3; opacity:0; transition:opacity .3s ease; filter:drop-shadow(0 4px 6px rgba(0,0,0,.35)); }
    #cursor.on{ opacity:1; }
    #cursor svg{ display:block; margin:-2px 0 0 -2px; transform-origin:2px 2px; transition:transform .12s ease; }
    #cursor.press svg{ transform:scale(.8); }
    .ripple{
      position:absolute; z-index:2; width:60px; height:60px; margin:-30px 0 0 -30px; border-radius:50%;
      border:3px solid #00AEEF; background:rgba(0,174,239,.18);
      animation:ripple .65s ease-out forwards;
    }
    @keyframes ripple{ from{ transform:scale(.2); opacity:1; } to{ transform:scale(1.5); opacity:0; } }

    /* The look comes from the scenario (stage.cards): these are the defaults, SALUS configurator style. */
    .layer{ --bg:#1D2858; --accent:#00AEEF; --display:'Ubuntu',sans-serif; --display-weight:700; --tracking:0; --leading:1.1;
      --label:'Ubuntu',sans-serif; --body:'Open Sans',system-ui,sans-serif; --logo-h:46px; }
    .card{
      position:absolute; inset:0; z-index:4; overflow:hidden;
      display:flex; flex-direction:column; align-items:center; justify-content:center; text-align:center; color:#fff;
      font-family:var(--body);
      background:
        radial-gradient(900px 620px at -12% 112%, rgba(0,174,239,.24) 0%, transparent 60%),
        radial-gradient(760px 520px at 112% -12%, rgba(0,174,239,.15) 0%, transparent 60%),
        var(--bg);
      opacity:0; transition:opacity .7s ease;
    }
    .flat .card{ background:var(--bg); }
    .flat .card::before, .flat .card::after{ display:none; }
    .card::before, .card::after{
      content:""; position:absolute; border-radius:50%;
      border:1.5px solid rgba(0,174,239,.20);
      box-shadow:0 0 0 34px rgba(0,174,239,.05), 0 0 0 84px rgba(0,174,239,.035), 0 0 0 140px rgba(0,174,239,.02);
    }
    .card::before{ width:620px; height:620px; left:-300px; bottom:-330px; }
    .card::after{ width:520px; height:520px; right:-260px; top:-300px; }
    .card.show{ opacity:1; }
    .inner{ position:relative; z-index:1; display:flex; flex-direction:column; align-items:center; transform:translateY(14px); transition:transform 1s ease; }
    .card.show .inner{ transform:none; }
    .logo{ height:var(--logo-h); width:auto; }
    .invert .logo{ filter:brightness(0) invert(1); }
    .eyebrow{ margin-top:46px; font:700 14px/1 var(--label); letter-spacing:.16em; text-transform:uppercase; color:var(--accent); }
    h2{ margin:16px 0 0; max-width:980px; font:var(--display-weight) 54px/var(--leading) var(--display); letter-spacing:var(--tracking); }
    h2 .thin{ font-weight:200; }
    p{ margin:20px 0 0; max-width:820px; font-size:20px; line-height:1.5; color:rgba(255,255,255,.72); }
    .big{ margin-top:30px; font:var(--display-weight) 26px/1 var(--display); color:var(--accent); letter-spacing:.01em; }
    .chips{ display:flex; flex-wrap:wrap; justify-content:center; gap:10px; margin-top:34px; }
    .chip{ font-size:15px; font-weight:600; padding:9px 18px; border-radius:999px; background:rgba(255,255,255,.09); color:rgba(255,255,255,.82); }
    .flat .chip{ font:500 13px/1 var(--label); letter-spacing:.08em; text-transform:uppercase; border-radius:2px; border:1px solid rgba(255,255,255,.22); background:none; padding:10px 14px; }
  `;
  const CURSOR = `<svg width="28" height="34" viewBox="0 0 28 34"><path d="M2 2 L2 27 L8.6 20.8 L13.4 31.4 L17.8 29.4 L13.1 19.2 L22 19.2 Z" fill="#fff" stroke="#1D2858" stroke-width="2.2" stroke-linejoin="round"/></svg>`;

  /* The card fonts: the stage page already loads them, an external site does not. */
  const fontLink = [...document.querySelectorAll("link[href*='fonts.googleapis.com']")].find(l => l.href.includes("Ubuntu"));
  const linkLoaded = fontLink ? Promise.resolve() : new Promise(ok => {
    const l = Object.assign(document.createElement("link"), { rel: "stylesheet", href: FONTS, onload: ok, onerror: ok });
    document.head.appendChild(l);
  });

  const host = document.createElement("div");
  host.style.cssText = "position:fixed;inset:0;z-index:2147483647;pointer-events:none;";
  const root = host.attachShadow({ mode: "open" });
  root.innerHTML = `<style>${CSS}</style><div class="layer"><div id="cursor">${CURSOR}</div></div>`;
  document.documentElement.appendChild(host);
  const layer = root.querySelector(".layer");
  const $ = s => root.querySelector(s);

  window.stage = Object.assign(window.stage || {}, {
    overlay: true,
    root,                                  // record.mjs steps its animations: document.getAnimations() skips shadow trees
    ready: linkLoaded.then(() => Promise.all(["500 20px Ubuntu", "700 20px Ubuntu", "400 20px 'Open Sans'", "600 20px 'Open Sans'"]
      .map(f => document.fonts.load(f).catch(() => null)))),
    /* (Re)build the cards; those listed in `shown` start visible, without a fade.
       look: { logo, invertLogo, logoHeight, flat, bg, accent, display, displayWeight, tracking, leading, label, body } */
    cards(cards, look, shown = ["intro"]) {
      root.querySelectorAll(".card").forEach(c => c.remove());
      const vars = { bg: look.bg, accent: look.accent, display: look.display, "display-weight": look.displayWeight,
        tracking: look.tracking, leading: look.leading, label: look.label, body: look.body,
        "logo-h": look.logoHeight && look.logoHeight + "px" };
      for (const [k, v] of Object.entries(vars)) if (v != null) layer.style.setProperty("--" + k, v);
      layer.classList.toggle("flat", !!look.flat);
      layer.classList.toggle("invert", !!look.invertLogo);
      for (const [id, d] of Object.entries(cards)) {
        const card = document.createElement("div");
        card.id = id;
        card.className = "card" + (shown.includes(id) ? " show" : "");
        card.innerHTML = `<div class="inner">
          <img class="logo" src="${look.logo}" alt="" />
          ${d.eyebrow ? `<div class="eyebrow">${d.eyebrow}</div>` : ""}
          ${d.title ? `<h2>${d.title}</h2>` : ""}
          ${d.text ? `<p>${d.text}</p>` : ""}
          ${d.big ? `<div class="big">${d.big}</div>` : ""}
          ${d.chips && d.chips.length ? `<div class="chips">${d.chips.map(c => `<span class="chip">${c}</span>`).join("")}</div>` : ""}
        </div>`;
        layer.appendChild(card);
      }
    },
    card(id, on) { $("#" + id).classList.toggle("show", on); },
    cursor(x, y) { const c = $("#cursor"); c.style.left = x + "px"; c.style.top = y + "px"; },
    cursorOn(on) { $("#cursor").classList.toggle("on", on); },
    press(on) { $("#cursor").classList.toggle("press", on); },
    ripple(x, y) {
      root.querySelectorAll(".ripple").forEach(r => r.remove());
      const r = document.createElement("div");
      r.className = "ripple"; r.style.left = x + "px"; r.style.top = y + "px";
      layer.insertBefore(r, $("#cursor"));
    },
  });
})();
