/* ============================================================
   SALUS Configurator BETA - System diagram generator (P18)
   ------------------------------------------------------------
   The configurator does not draw freely: it first produces a
   structured description of the system (buildGraph), then places
   blocks following fixed rules:
   - heat source bottom left,
   - distribution (gateway, wiring centre, receivers) in the
     middle,
   - rooms on top.
   Wired links as solid lines, radio links as dotted lines.
   The icons are vector placeholders: the official Salus icon
   library will replace them (see VISUALS.md).
   ============================================================ */

(function () {
  const CAT = globalThis.SALUS_CATALOG;
  const MKT = globalThis.SALUS_MARKETS;

  const NAVY = "#1D2858", CYAN = "#00AEEF", TEAL = "#3FB8A5", GRAY = "#A8A8A9";

  /* ---------- 1. Structured description ---------- */
  /* items: raw list (with roomId) from an engine level */
  function buildGraph(answers, items) {
    const P = CAT.products;
    const rooms = (answers.rooms || []).map(r => ({
      id: r.id, name: r.name || r.type, floor: r.floor || 0, emitter: r.emitter, devices: []
    }));

    const dist = [];   // distribution nodes
    const links = [];  // {from, to, type: "wired"|"radio"|"water"}

    const gen = MKT.generators[answers.generator] || MKT.generators.unknown;
    const genNode = { id: "gen", label: gen.label, kind: "generator" };

    let gateway = null, wiringCentre = null, receiver = null, router = null;
    const repeaters = [];

    items.forEach(it => {
      const p = P[it.ref]; if (!p) return;
      if (p.role === "gateway") gateway = { id: "gw", label: p.ref, kind: "gateway" };
      else if (p.role === "wiringCentre") wiringCentre = { id: "wc", label: p.ref, kind: "wiringCentre", wired: p.protocol === "wired" };
      else if (p.role === "boilerReceiver") receiver = { id: "rx", label: p.ref, kind: "receiver" };
      else if (p.role === "repeater") repeaters.push({ id: "rep" + repeaters.length, label: p.ref, kind: "repeater" });
      else if (p.role === "standaloneRF" || p.role === "standaloneWired") {
        // standalone thermostat: shown as a single zone + receiver
        receiver = receiver || { id: "rx", label: "Receiver " + p.ref, kind: "receiver" };
        if (!rooms.length) rooms.push({ id: "z1", name: "Whole home", floor: 0, emitter: null, devices: [] });
        rooms[0].devices.push({ ref: p.ref, qty: it.qty, radio: p.protocol !== "wired" });
      }
      else if (it.roomId != null) {
        const room = rooms.find(r => r.id === it.roomId);
        if (room) {
          if (p.role === "actuator") {
            // actuators live at the manifold, not in the room
            wiringCentre = wiringCentre || { id: "wc", label: "Manifold", kind: "wiringCentre" };
            wiringCentre.actuators = (wiringCentre.actuators || 0) + it.qty;
          } else {
            room.devices.push({ ref: p.ref, qty: it.qty, radio: p.protocol !== "wired" });
          }
        }
      }
    });

    if (gateway) {
      router = { id: "net", label: "Internet router", kind: "router" };
      links.push({ from: "net", to: "gw", type: "wired" });
    }

    [gateway, wiringCentre, receiver, router, ...repeaters].forEach(n => { if (n) dist.push(n); });

    /* Links */
    rooms.forEach(room => {
      room.devices.forEach(d => {
        const p = P[d.ref] || {};
        const hub = (p.role === "roomstat" && wiringCentre && room.emitter === "ufh_water") ? "wc"
          : (p.role === "standaloneRF" || p.role === "standaloneWired") ? "rx"
          : gateway ? "gw" : (wiringCentre ? "wc" : null);
        if (hub) links.push({ from: "room" + room.id, to: hub, type: d.radio ? "radio" : "wired" });
      });
    });
    if (wiringCentre) links.push({ from: "wc", to: "gen", type: "water" });
    if (receiver) links.push({ from: "rx", to: "gen", type: "wired" });
    if (gateway && wiringCentre) links.push({ from: "wc", to: "gw", type: "radio" });
    repeaters.forEach(r => links.push({ from: r.id, to: "gw", type: "radio" }));

    return { generator: genNode, distribution: dist, rooms, links };
  }

  /* ---------- 2. Placeholder icons ---------- */
  function icon(kind, x, y, s) {
    const c = `translate(${x},${y}) scale(${s / 24})`;
    const paths = {
      generator: `<rect x="2" y="4" width="20" height="18" rx="2" fill="none" stroke="${NAVY}" stroke-width="1.6"/><path d="M12 8c-2.4 2.6-3.6 4.5-3.6 6a3.6 3.6 0 007.2 0c0-1.5-1.2-3.4-3.6-6z" fill="${CYAN}" opacity=".85"/>`,
      gateway: `<rect x="3" y="8" width="18" height="10" rx="2" fill="none" stroke="${NAVY}" stroke-width="1.6"/><circle cx="8" cy="13" r="1.4" fill="${CYAN}"/><path d="M12 6a7 7 0 016.2 3.6M13.5 3a10.5 10.5 0 018.3 5" stroke="${CYAN}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      wiringCentre: `<rect x="2" y="6" width="20" height="12" rx="2" fill="none" stroke="${NAVY}" stroke-width="1.6"/><path d="M6 6v12M10 6v12M14 6v12M18 6v12" stroke="${GRAY}" stroke-width="1.1"/>`,
      receiver: `<rect x="4" y="6" width="16" height="12" rx="2" fill="none" stroke="${NAVY}" stroke-width="1.6"/><circle cx="12" cy="12" r="2.6" fill="none" stroke="${CYAN}" stroke-width="1.5"/><path d="M12 12v-2" stroke="${CYAN}" stroke-width="1.5"/>`,
      router: `<rect x="3" y="12" width="18" height="7" rx="2" fill="none" stroke="${NAVY}" stroke-width="1.6"/><path d="M7 12V7M17 12V5" stroke="${NAVY}" stroke-width="1.5" stroke-linecap="round"/>`,
      repeater: `<circle cx="12" cy="14" r="4" fill="none" stroke="${NAVY}" stroke-width="1.6"/><path d="M6 8a8 8 0 0112 0" stroke="${CYAN}" stroke-width="1.5" fill="none" stroke-linecap="round"/>`,
      room: `<path d="M3 11l9-7 9 7" fill="none" stroke="${NAVY}" stroke-width="1.7" stroke-linecap="round"/><path d="M5 10v9h14v-9" fill="none" stroke="${NAVY}" stroke-width="1.7"/>`,
      stat: `<rect x="5" y="5" width="14" height="14" rx="3" fill="#fff" stroke="${NAVY}" stroke-width="1.4"/><text x="12" y="15" font-size="7" text-anchor="middle" fill="${CYAN}" font-family="sans-serif">21°</text>`,
      trv: `<circle cx="12" cy="9" r="5" fill="#fff" stroke="${NAVY}" stroke-width="1.4"/><rect x="10" y="14" width="4" height="6" fill="${GRAY}"/>`
    };
    return `<g transform="${c}">${paths[kind] || paths.room}</g>`;
  }

  /* ---------- 3. SVG rendering ---------- */
  function renderSVG(graph, opts) {
    opts = opts || {};
    const W = 920;
    const roomW = 148, roomH = 108, gap = 18;
    const perRow = Math.min(graph.rooms.length || 1, 5);
    const rowCount = Math.max(1, Math.ceil((graph.rooms.length || 1) / 5));
    const roomsH = rowCount * (roomH + gap);
    const H = roomsH + 210;

    const roomPos = {};
    let svgRooms = "";
    graph.rooms.forEach((room, i) => {
      const row = Math.floor(i / 5), col = i % 5;
      const rowLen = Math.min(graph.rooms.length - row * 5, 5);
      const startX = (W - rowLen * (roomW + gap) + gap) / 2;
      const x = startX + col * (roomW + gap), y = 16 + row * (roomH + gap);
      roomPos["room" + room.id] = { x: x + roomW / 2, y: y + roomH };
      const devices = room.devices.map((d, j) => {
        const p = CAT.products[d.ref] || {};
        const kind = p.role === "trv" ? "trv" : "stat";
        return icon(kind, x + 10 + j * 34, y + 42, 26) +
          (d.qty > 1 ? `<text x="${x + 34 + j * 34}" y="${y + 76}" font-size="10" fill="${NAVY}" font-family="sans-serif">×${d.qty}</text>` : "");
      }).join("");
      const emitterLabel = room.emitter === "ufh_water" ? "underfloor" :
        room.emitter === "water_radiators" ? "radiators" :
        room.emitter ? (MKT.emitters[room.emitter] || {}).label || "" : "";
      svgRooms += `
        <g>
          <rect x="${x}" y="${y}" width="${roomW}" height="${roomH}" rx="10" fill="#fff" stroke="${GRAY}" stroke-width="1"/>
          ${icon("room", x + 8, y + 6, 18)}
          <text x="${x + 30}" y="${y + 20}" font-size="12" font-weight="600" fill="${NAVY}" font-family="sans-serif">${esc(room.name)}</text>
          <text x="${x + 10}" y="${y + 36}" font-size="10" fill="${GRAY}" font-family="sans-serif">${esc(emitterLabel)}</text>
          ${devices}
        </g>`;
    });

    /* Distribution in the middle */
    const distY = roomsH + 46;
    const distNodes = graph.distribution;
    const dw = 120, dGap = 24;
    const dStart = (W - distNodes.length * (dw + dGap) + dGap) / 2;
    const distPos = {};
    let svgDist = "";
    distNodes.forEach((n, i) => {
      const x = dStart + i * (dw + dGap), y = distY;
      distPos[n.id] = { x: x + dw / 2, y: y, yBottom: y + 64 };
      svgDist += `
        <g>
          <rect x="${x}" y="${y}" width="${dw}" height="64" rx="10" fill="#fff" stroke="${NAVY}" stroke-width="1.3"/>
          ${icon(n.kind, x + dw / 2 - 13, y + 6, 26)}
          <text x="${x + dw / 2}" y="${y + 48}" font-size="11" font-weight="600" text-anchor="middle" fill="${NAVY}" font-family="sans-serif">${esc(n.label)}</text>
          ${n.actuators ? `<text x="${x + dw / 2}" y="${y + 60}" font-size="9" text-anchor="middle" fill="${GRAY}" font-family="sans-serif">${n.actuators} actuator${n.actuators > 1 ? "s" : ""}</text>` : ""}
        </g>`;
    });

    /* Heat source bottom left */
    const genY = distY + 106;
    const genPos = { x: 110, y: genY };
    const svgGen = `
      <g>
        <rect x="40" y="${genY}" width="150" height="64" rx="10" fill="#fff" stroke="${NAVY}" stroke-width="1.5"/>
        ${icon("generator", 52, genY + 6, 30)}
        <text x="${40 + 92}" y="${genY + 30}" font-size="11" font-weight="600" text-anchor="middle" fill="${NAVY}" font-family="sans-serif">
          ${esc(graph.generator.label).split(" ").slice(0, 2).join(" ")}
        </text>
        <text x="${40 + 92}" y="${genY + 44}" font-size="9" text-anchor="middle" fill="${GRAY}" font-family="sans-serif">heat source</text>
      </g>`;

    /* Links */
    const pos = (id) => id === "gen" ? { x: genPos.x + 40, y: genPos.y + 32 }
      : distPos[id] ? { x: distPos[id].x, y: distPos[id].y + 32 }
      : roomPos[id] || null;
    let svgLinks = "";
    const seen = new Set();
    graph.links.forEach(l => {
      const key = l.from + ">" + l.to + l.type;
      if (seen.has(key)) return; seen.add(key);
      const a = pos(l.from), b = pos(l.to);
      if (!a || !b) return;
      const stroke = l.type === "water" ? TEAL : l.type === "radio" ? CYAN : NAVY;
      const dash = l.type === "radio" ? ' stroke-dasharray="5 5"' : "";
      const midY = (a.y + b.y) / 2;
      svgLinks += `<path d="M${a.x},${a.y} C${a.x},${midY} ${b.x},${midY} ${b.x},${b.y}" fill="none" stroke="${stroke}" stroke-width="1.6"${dash} opacity="0.8"/>`;
    });

    const legend = `
      <g font-family="sans-serif" font-size="10" transform="translate(${W - 330},${H - 26})">
        <line x1="0" y1="0" x2="26" y2="0" stroke="${NAVY}" stroke-width="1.8"/><text x="32" y="3.5" fill="${NAVY}">wired link</text>
        <line x1="112" y1="0" x2="138" y2="0" stroke="${CYAN}" stroke-width="1.8" stroke-dasharray="5 5"/><text x="144" y="3.5" fill="${NAVY}">radio link</text>
        <line x1="222" y1="0" x2="248" y2="0" stroke="${TEAL}" stroke-width="1.8"/><text x="254" y="3.5" fill="${NAVY}">water circuit</text>
      </g>`;

    const betaTag = opts.noBetaTag ? "" :
      `<text x="12" y="${H - 12}" font-size="9" fill="${GRAY}" font-family="sans-serif">Diagram generated automatically - BETA placeholder icons (official library to come)</text>`;

    return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="System diagram">
      <rect x="0" y="0" width="${W}" height="${H}" rx="14" fill="#f5fbff"/>
      ${svgLinks}${svgRooms}${svgDist}${svgGen}${legend}${betaTag}
    </svg>`;
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  const Schematic = { buildGraph, renderSVG };
  if (typeof window !== "undefined") window.SalusSchematic = Schematic;
  if (typeof module !== "undefined" && module.exports) module.exports = Schematic;
})();
