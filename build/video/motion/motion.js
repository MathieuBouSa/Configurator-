/* The R-System stand film: scenes, timeline and a clock that render.mjs
   drives. Nothing here runs on its own time: every animation is a paused
   Web Animation, and seek(t) sets them all, the counters and the film
   frames to second t. The same t always gives the same picture, so the
   render is frame-exact however slow the machine.

   One idea per scene, in the order of the landing: the site's messages,
   its photos, and the three films (installation, factory, app). */

const LANG = new URLSearchParams(location.search).get("lang") || "fr";
const T = window.TEXTS[LANG];
document.documentElement.lang = LANG;
const FPS = 30;
const EASE = "cubic-bezier(.2,.75,.2,1)";
const SITE = "/site/assets/visuels/";

/* ---------- timeline primitives ---------- */

const anims = [];                       // every Web Animation, paused
const tickers = [];                     // t => void, for what CSS cannot animate
const clips = [];                       // film panels showing extracted frames
const animated = new WeakSet();

/* An animation from `start` for `dur` seconds. The first one on an element
   also holds its first keyframe before it starts; later ones (exits) only
   act from their own start. */
function anim(el, keyframes, start, dur, easing = EASE) {
  const first = !animated.has(el);
  animated.add(el);
  const a = el.animate(keyframes, { duration: Math.max(1, dur * 1000), delay: start * 1000, fill: first ? "both" : "forwards", easing });
  a.pause();
  anims.push(a);
  return a;
}
const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const easeOut = p => 1 - Math.pow(1 - p, 3);

const FX = {
  rise:  [{ transform: "translateY(110%)" }, { transform: "translateY(0)" }],
  fade:  [{ opacity: 0 }, { opacity: 1 }],
  up:    [{ opacity: 0, transform: "translateY(40px)" }, { opacity: 1, transform: "translateY(0)" }],
  left:  [{ opacity: 0, transform: "translateX(-80px)" }, { opacity: 1, transform: "translateX(0)" }],
  right: [{ opacity: 0, transform: "translateX(120px)" }, { opacity: 1, transform: "translateX(0)" }],
  pop:   [{ opacity: 0, transform: "scale(.82)" }, { opacity: 1, transform: "scale(1)" }],
  grow:  [{ transform: "scaleX(0)" }, { transform: "scaleX(1)" }],
  panelR:[{ clipPath: "inset(0 0 0 100%)" }, { clipPath: "inset(0 0 0 0)" }],
  panelL:[{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }],
};

/* ---------- markup helpers ---------- */

function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") el.className = v;
    else if (k === "style") el.style.cssText = v;
    else if (k === "html") el.innerHTML = v;
    else el.setAttribute(k, v);
  }
  for (const k of kids.flat()) if (k != null) el.append(k.nodeType ? k : document.createTextNode(k));
  return el;
}
const line = (text, cls = "") => h("span", { class: "line" }, h("span", { class: cls }, text));
const img = (src, attrs = {}) => h("img", { src, alt: "", ...attrs });

/* eyebrow + title lines + optional text, each line rising in turn */
function heading(s, at, { eyebrow, lines, text, size = "" }) {
  const eb = h("p", { class: "eyebrow" }, h("i"), eyebrow);
  const title = h("h2", { class: "title " + size }, lines.map(([t, cls]) => line(t, cls)));
  const block = [eb, title];
  anim(eb.querySelector("i"), FX.grow, at, 0.6);
  anim(eb, FX.fade, at, 0.5);
  [...title.querySelectorAll(".line > span")].forEach((sp, i) => anim(sp, FX.rise, at + 0.15 + i * 0.12, 0.8));
  if (text) {
    const p = h("p", { class: "text" }, text);
    anim(p, FX.up, at + 0.45 + lines.length * 0.12, 0.8);
    block.push(p);
  }
  return block;
}

/* a film panel: frames of a clip, played from `from` seconds of it */
function filmPanel(side, key, start, from = 0, tag) {
  const im = img("");
  const panel = h("div", { class: "panel " + side }, im, tag ? h("span", { class: "tag" }, tag) : null);
  anim(panel, side === "right" ? FX.panelR : FX.panelL, start, 0.9);
  clips.push({ img: im, key, start, from });
  return panel;
}

/* slow push-in on a photo for the whole scene */
const kenBurns = (el, start, dur, to = 1.08) => anim(el, [{ transform: "scale(1)" }, { transform: `scale(${to})` }], start, dur, "linear");

/* a number counting up to `value` */
function counter(el, value, start, dur, suffix = "") {
  const fmt = new Intl.NumberFormat(LANG === "en" ? "en-GB" : LANG);
  tickers.push(t => { el.textContent = fmt.format(Math.round(value * easeOut(clamp((t - start) / dur)))) + suffix; });
}

/* ---------- scenes ---------- */

const film = document.getElementById("film");
const scenes = [];
/* A scene shows from `start` for `dur` s, fading out over its last 0.45 s. */
function scene(id, start, dur, build) {
  const el = h("section", { class: "scene", id });
  film.append(el);
  build(el, start);
  anim(el, FX.fade, start, 0.01, "linear");
  anim(el, [{ opacity: 1, transform: "translateY(0)" }, { opacity: 0, transform: "translateY(-24px)" }], start + dur - 0.45, 0.45, "ease-in");
  scenes.push({ id, start, dur });
}

const ICONS = {
  local: '<svg viewBox="0 0 24 24"><rect x="4" y="5" width="16" height="14" rx="2"/><circle cx="12" cy="12" r="2.5"/><path d="M12 2v3M12 19v3"/></svg>',
  wifi: '<svg viewBox="0 0 24 24"><path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0"/><circle cx="12" cy="19" r="1"/></svg>',
  ethernet: '<svg viewBox="0 0 24 24"><rect x="5" y="4" width="14" height="12" rx="1"/><path d="M8 16v4h8v-4M9 8v3M12 8v3M15 8v3"/></svg>',
  eco: [
    '<svg viewBox="0 0 24 24"><rect x="3" y="6" width="18" height="12" rx="2"/><path d="M7 6v12M11 6v12M15 6v12"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M3 5h18"/><path d="M5 11c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 4 0" opacity=".7"/><path d="M5 17c1.5-2 3.5-2 5 0s3.5 2 5 0 3.5-2 4 0"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M12 3c3 3.5 5 5.8 5 9a5 5 0 0 1-10 0c0-3.2 2-5.5 5-9z"/><path d="M12 12c1.2 1.3 2 2.3 2 3.6a2 2 0 0 1-4 0c0-1.3.8-2.3 2-3.6z"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="5" y="3" width="10" height="18" rx="1"/><circle cx="12.5" cy="12" r="1"/><path d="M18 8a7 7 0 0 1 3 4M19 5a10 10 0 0 1 2 2" opacity=".6"/></svg>',
    '<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="1"/><path d="M4 7h16M4 10h16M4 13h16"/></svg>',
    '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 1 4 10.5c-.8.7-1 1.5-1 2.5h-6c0-1-.2-1.8-1-2.5A6 6 0 0 1 12 3z"/></svg>',
  ],
};

/* 0 · Intro: the promise, on the cards' navy */
scene("intro", 0, 6, (el, s) => {
  const logo = img("/site/assets/logo/logo-r-system-navy-en-blanc.png", { class: "logo" });
  const head = heading(el, s + 0.6, { eyebrow: T.intro.eyebrow, size: "xl", lines: [[T.intro.l1], [T.intro.l2 + " ", ""], [T.intro.thin, "thin accent"]] });
  const chips = h("div", { class: "chips" }, T.intro.chips.map(c => h("span", { class: "chip" }, c)));
  [...chips.children].forEach((c, i) => anim(c, FX.up, s + 1.6 + i * 0.12, 0.6));
  anim(logo, FX.fade, s + 0.2, 0.8);
  const copy = h("div", { class: "copy center" }, h("div", { style: "margin-bottom:64px" }, logo), head, chips);
  el.append(copy);
});

/* 1 · On site: the installer at work, one outlet per room */
scene("pose", 6, 12, (el, s) => {
  el.append(filmPanel("right", "pose", s, 0));
  el.append(h("div", { class: "copy narrow" }, heading(el, s + 0.5, { eyebrow: T.pose.eyebrow, lines: [[T.pose.l1], [T.pose.l2], [T.pose.thin, "thin accent"]], text: T.pose.text })));
});

/* 2 · The plenum, assembled in Bordeaux */
scene("plenum", 18, 4.5, (el, s) => {
  const p = img(SITE + "r-system-plenum.png", { class: "product", style: "right:100px; top:560px; width:980px" });
  anim(p, FX.right, s + 0.2, 1.2);
  anim(p, [{ transform: "translateX(0)" }, { transform: "translateX(-40px)" }], s + 1.4, 3.1, "linear");
  el.append(p, h("div", { class: "copy", style: "top:150px; transform:none; width:1100px" }, heading(el, s + 0.3, { eyebrow: T.plenum.eyebrow, size: "xl", lines: [[T.plenum.l1], [T.plenum.thin, "thin accent"]], text: T.plenum.text })));
});

/* 3 · The factory: the laser photo, then the film, steps lit with the shots */
scene("usine", 22.5, 16, (el, s) => {
  const laser = h("div", { class: "panel left" }, img(SITE + "usine-bordeaux-laser-amada.webp"));
  anim(laser, FX.panelL, s, 0.9);
  kenBurns(laser.querySelector("img"), s, 2.4, 1.1);
  const film = filmPanel("left", "usine", s + 1.9, 0);
  anim(film, FX.fade, s + 1.9, 0.4, "linear");
  el.append(laser, film);
  const steps = h("ol", { class: "steps" }, T.usine.steps.map((st, i) => h("li", {}, h("b", {}, "0" + (i + 1)), h("span", {}, st))));
  [...steps.children].forEach((li, i) => anim(li, FX.up, s + 0.9 + i * 0.1, 0.6));
  /* the step lit follows the shots of the film: folding, water jet, assembly */
  const lit = [[0, s], [1, s + 1.9], [2, s + 1.9 + 2.6], [3, s + 1.9 + 6.75]];
  tickers.push(t => {
    let on = -1;
    for (const [i, at] of lit) if (t >= at) on = i;
    [...steps.children].forEach((li, i) => li.classList.toggle("on", i === on));
  });
  el.append(h("div", { class: "copy right", style: "width:940px" }, heading(el, s + 0.4, { eyebrow: T.usine.eyebrow, lines: [[T.usine.l1], [T.usine.thin, "thin"]] }), steps));
});

/* 4 · Belimo actuators */
scene("belimo", 38.5, 6.5, (el, s) => {
  const bench = h("div", { class: "photo right", style: "width:760px" }, img(SITE + "belimo-banc-essai-16x9.jpg"));
  anim(bench, FX.panelR, s, 0.9);
  kenBurns(bench.querySelector("img"), s, 6.5, 1.12);
  const motor = img(SITE + "r-system-moteur-belimo.png", { class: "product", style: "left:990px; top:270px; height:560px" });
  anim(motor, FX.up, s + 0.7, 1.0);
  const cap = h("p", { class: "caption", style: "right:48px; bottom:40px; background:var(--navy); padding:10px 18px" }, T.belimo.caption);
  anim(cap, FX.fade, s + 1.4, 0.6);
  el.append(bench, motor, cap, h("div", { class: "copy", style: "width:840px" }, heading(el, s + 0.3, { eyebrow: T.belimo.eyebrow, lines: [[T.belimo.l1], [T.belimo.thin, "thin accent"]], text: T.belimo.text })));
});

/* 5 · The control unit: the cover comes off, then the Intesis count */
scene("boitier", 45, 8, (el, s) => {
  const box = h("div", { style: "position:absolute; right:70px; top:270px; width:860px; height:507px" });
  const closed = img("/site/_sources/Version A/Visuel Boitier/r-system-boitier-ferme-master-2596.png", { style: "position:absolute; inset:0; width:100%" });
  const open = img("/site/_sources/Version A/Visuel Boitier/r-system-boitier-ouvert-master-2596.png", { style: "position:absolute; inset:0; width:100%" });
  const wl = h("div", { class: "wipe-line" });
  box.append(closed, open, wl);
  anim(box, FX.right, s + 0.2, 1.0);
  anim(open, [{ clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0 0 0)" }], s + 2.2, 1.6, "cubic-bezier(.6,0,.3,1)");
  anim(wl, [{ left: "0%", opacity: 1 }, { left: "100%", opacity: 1 }], s + 2.2, 1.6, "cubic-bezier(.6,0,.3,1)");
  anim(wl, [{ opacity: 1 }, { opacity: 0 }], s + 3.8, 0.3);
  const label = h("p", { class: "caption", style: "right:90px; top:820px" });
  tickers.push(t => { label.textContent = t < s + 3 ? T.boitier.closed : T.boitier.open; });
  anim(label, FX.fade, s + 1, 0.5);
  const count = h("div", { class: "counter sm" });
  counter(count, T.boitier.count, s + 4.4, 2.2, T.boitier.suffix);
  const countBlock = h("div", { style: "margin-top:56px" }, count, h("p", { class: "counter-label", style: "font-size:28px" }, T.boitier.countLabel));
  anim(countBlock, FX.up, s + 4.2, 0.7);
  el.append(box, label, h("div", { class: "copy", style: "width:860px" }, heading(el, s + 0.3, { eyebrow: T.boitier.eyebrow, size: "md", lines: [[T.boitier.l1], [T.boitier.thin, "thin accent"]], text: T.boitier.text }), countBlock));
});

/* 6 · Zigbee: a mesh drawing itself */
scene("zigbee", 53, 5.5, (el, s) => {
  const N = [[400, 400], [160, 220], [620, 170], [700, 470], [520, 700], [190, 620], [400, 90]];
  const L = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [1, 2], [2, 3], [3, 4], [4, 5], [5, 1], [1, 6], [6, 2]];
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 800 800"); svg.setAttribute("class", "mesh");
  L.forEach(([a, b], i) => {
    const l = document.createElementNS(ns, "line");
    const len = Math.hypot(N[b][0] - N[a][0], N[b][1] - N[a][1]);
    for (const [k, v] of Object.entries({ x1: N[a][0], y1: N[a][1], x2: N[b][0], y2: N[b][1], "stroke-dasharray": len })) l.setAttribute(k, v);
    svg.append(l);
    anim(l, [{ strokeDashoffset: len }, { strokeDashoffset: 0 }], s + 0.9 + i * 0.12, 0.6);
  });
  N.forEach(([x, y], i) => {
    const c = document.createElementNS(ns, "circle");
    for (const [k, v] of Object.entries({ cx: x, cy: y, r: i === 0 ? 30 : 20 })) c.setAttribute(k, v);
    if (i === 0) c.setAttribute("class", "hub");
    c.style.transformOrigin = `${x}px ${y}px`;
    svg.append(c);
    anim(c, FX.pop, s + 0.4 + i * 0.1, 0.5);
  });
  el.append(svg, h("div", { class: "copy", style: "width:880px" }, heading(el, s + 0.3, { eyebrow: T.zigbee.eyebrow, lines: [[T.zigbee.l1], [T.zigbee.thin, "thin accent"]], text: T.zigbee.text })));
});

/* 7 · The gateway, three ways to connect it */
scene("passerelle", 58.5, 5.5, (el, s) => {
  const gw = img(SITE + "r-system-passerelle-ug800.png", { class: "product", style: "right:140px; top:190px; width:700px" });
  anim(gw, FX.pop, s + 0.3, 1.0);
  const modes = h("div", { class: "modes" }, T.passerelle.modes.map((m, i) => h("div", { class: "mode", html: [ICONS.local, ICONS.wifi, ICONS.ethernet][i] }, h("b", {}, m))));
  [...modes.children].forEach((m, i) => anim(m, FX.up, s + 1.3 + i * 0.25, 0.6));
  el.append(gw, h("div", { class: "copy", style: "width:1000px" }, heading(el, s + 0.3, { eyebrow: T.passerelle.eyebrow, lines: [[T.passerelle.l1], [T.passerelle.thin, "thin accent"]], text: T.passerelle.text }), modes));
});

/* 8 · The scale behind SALUS */
scene("volume", 64, 5, (el, s) => {
  const n = h("div", { class: "counter" });
  counter(n, T.volume.count, s + 0.5, 2.6);
  const eb = h("p", { class: "eyebrow" }, h("i"), T.volume.eyebrow);
  anim(eb, FX.fade, s + 0.2, 0.5);
  const lab = h("p", { class: "counter-label" }, T.volume.label);
  anim(n, FX.pop, s + 0.3, 0.8);
  anim(lab, FX.up, s + 0.8, 0.7);
  el.append(h("div", { class: "copy center" }, eb, h("div", { style: "margin-top:40px" }, n), lab));
});

/* 9 · The slimmest thermostat */
scene("thermostat", 69, 7, (el, s) => {
  const front = img(SITE + "r-system-thermostat.png", { class: "product", style: "right:420px; top:270px; width:540px" });
  const side = img(SITE + "r-system-thermostat-profil.png", { class: "product", style: "right:200px; top:250px; height:580px" });
  anim(front, FX.up, s + 0.3, 1.0);
  anim(side, FX.right, s + 0.9, 1.0);
  const dim = h("div", { class: "dim", style: "right:190px; top:860px; width:56px" });
  const dl = h("p", { class: "dim-label", style: "right:150px; top:880px" }, "11 mm");
  anim(dim, FX.grow, s + 1.8, 0.5);
  anim(dl, FX.fade, s + 2.0, 0.5);
  const stats = h("div", { class: "stats" }, T.thermostat.stats.map(([b, sp]) => h("div", { class: "stat" }, h("b", {}, b), h("span", {}, sp))));
  [...stats.children].forEach((st, i) => anim(st, FX.up, s + 1.4 + i * 0.2, 0.6));
  el.append(front, side, dim, dl, h("div", { class: "copy", style: "width:900px" }, heading(el, s + 0.3, { eyebrow: T.thermostat.eyebrow, lines: [[T.thermostat.l1], [T.thermostat.thin, "thin accent"]] }), stats));
});

/* 10 · One move to change the setpoint */
scene("geste", 76, 5, (el, s) => {
  const ph = h("div", { class: "photo right", style: "width:900px" }, img(SITE + "r-system-changement-consigne.jpg"));
  anim(ph, FX.panelR, s, 0.9);
  kenBurns(ph.querySelector("img"), s, 5, 1.1);
  el.append(ph, h("div", { class: "copy", style: "width:860px" }, heading(el, s + 0.4, { eyebrow: T.geste.eyebrow, lines: [[T.geste.l1], [T.geste.thin, "thin accent"]] })));
});

/* 11 · The app film: the premium thermostat is your own screen, then the dampers */
scene("appli", 81, 15, (el, s) => {
  el.append(filmPanel("right", "appli", s, 0));
  const chips = h("div", { class: "chips" }, T.appli.chips.map(c => h("span", { class: "chip" }, c)));
  [...chips.children].forEach((c, i) => anim(c, FX.up, s + 1.3 + i * 0.12, 0.6));
  const a = h("div", { class: "copy narrow" }, heading(el, s + 0.5, { eyebrow: T.appli.eyebrow, lines: [[T.appli.l1], [T.appli.thin, "thin accent"]] }), chips);
  anim(a, [{ opacity: 1 }, { opacity: 0 }], s + 7.2, 0.4);
  const bHead = h("div", {});
  const b = h("div", { class: "copy narrow" }, bHead);
  bHead.append(...heading(el, s + 7.7, { eyebrow: T.appli.eyebrow, lines: [[T.appli.l1b], [T.appli.thinb, "thin accent"]], text: T.appli.textb }));
  el.append(a, b);
});

/* 12 · The installer account */
scene("compte", 96, 6, (el, s) => {
  const pic = img(SITE + "r-system-appli-ensemble.png", { class: "product", style: "right:20px; top:180px; width:960px" });
  anim(pic, FX.right, s + 0.3, 1.0);
  const items = h("div", { class: "items" }, T.compte.items.map(([b, sp]) => h("div", { class: "item" }, h("b", {}, b), h("span", {}, sp))));
  [...items.children].forEach((it, i) => anim(it, FX.left, s + 1.2 + i * 0.3, 0.7));
  el.append(pic, h("div", { class: "copy", style: "width:880px" }, heading(el, s + 0.3, { eyebrow: T.compte.eyebrow, size: "md", lines: [[T.compte.l1], [T.compte.thin, "thin accent"]] }), items));
});

/* 13 · The SALUS ecosystem */
scene("eco", 102, 6, (el, s) => {
  const grid = h("div", { class: "eco" }, T.eco.items.map((it, i) => h("div", { html: ICONS.eco[i] }, h("b", {}, it))));
  [...grid.children].forEach((g, i) => anim(g, FX.pop, s + 1.2 + i * 0.14, 0.6));
  el.append(h("div", { class: "copy center" }, heading(el, s + 0.3, { eyebrow: T.eco.eyebrow, lines: [[T.eco.l1], [T.eco.thin, "thin accent"]] }), grid));
});

/* 14 · A free app */
scene("gratuit", 108, 4.5, (el, s) => {
  const ph = img(SITE + "r-system-appli-en-main.png", { class: "product", style: "right:70px; top:250px; width:720px" });
  anim(ph, FX.up, s + 0.4, 1.0);
  el.append(ph, h("div", { class: "copy", style: "width:960px" }, heading(el, s + 0.3, { eyebrow: T.gratuit.eyebrow, size: "xl", lines: [[T.gratuit.l1], [T.gratuit.thin, "thin accent"]], text: T.gratuit.text })));
});

/* 15 · Outro, then a plain navy beat: the loop point */
const TOTAL = 120;
scene("outro", 112.5, 6.6, (el, s) => {
  const logo = img("/site/assets/logo/logo-r-system-navy-en-blanc.png", { class: "logo" });
  anim(logo, FX.fade, s + 0.2, 0.8);
  const url = h("p", { class: "url" }, T.outro.url);
  anim(url, FX.up, s + 1.1, 0.7);
  const chips = h("div", { class: "chips" }, T.outro.chips.map(c => h("span", { class: "chip" }, c)));
  [...chips.children].forEach((c, i) => anim(c, FX.up, s + 1.4 + i * 0.12, 0.6));
  el.append(h("div", { class: "copy center" }, h("div", { style: "margin-bottom:64px" }, logo), heading(el, s + 0.4, { eyebrow: T.outro.eyebrow, lines: [[T.outro.l1], [T.outro.thin, "thin accent"]] }), url, chips));
});

/* The rings drift on a cycle of exactly the film's length: the last frame
   meets the first. */
const rings = [...document.querySelectorAll("#rings circle")];
tickers.push(t => {
  const a = (t / TOTAL) * Math.PI * 2;
  rings.forEach((c, i) => {
    c.setAttribute("cx", 1500 + Math.sin(a + i) * 90);
    c.setAttribute("cy", 540 + Math.cos(a * 2 + i) * 50);
  });
});

/* ---------- the clock ---------- */

/* window.CLIP_FRAMES = { key: { base, count } }, set by render.mjs */
const frames = () => window.CLIP_FRAMES || {};

window.FILM = { total: TOTAL, fps: FPS, scenes };
window.seek = async function seek(t) {
  for (const a of anims) a.currentTime = t * 1000;
  for (const f of tickers) f(t);
  const waits = [];
  for (const c of clips) {
    const info = frames()[c.key];
    if (!info) continue;
    const n = clamp(Math.floor((t - c.start + c.from) * FPS), 0, info.count - 1);
    const src = `${info.base}${String(n + 1).padStart(4, "0")}.jpg`;
    if (c.img.getAttribute("src") !== src) { c.img.src = src; waits.push(c.img.decode().catch(() => {})); }
  }
  await Promise.all(waits);
};

/* In a browser: ?t=42 shows second 42, ?play plays in real time. */
const q = new URLSearchParams(location.search);
if (q.has("play")) { const t0 = performance.now(); const loop = () => { seek(((performance.now() - t0) / 1000) % TOTAL); requestAnimationFrame(loop); }; loop(); }
else seek(Number(q.get("t") || 0));
