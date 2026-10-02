/**
 * The map's rendering engine, second edition (2026-10-02).
 *
 * The first edition laid fourteen stages in one row, which was legible at thirty skills and
 * a strip of unreadable boxes at fifty-three. This one is a snake: the lifecycle runs left
 * to right across the top band, turns, and runs right to left along the bottom band, the
 * way a board game or a printed process poster does. A crowded stage packs its skills into
 * lanes rather than a tall column, so every stage plate is the same height and the whole
 * sheet is roughly the shape of the screen it is drawn on.
 *
 * Three things make it usable at any size, in order of importance:
 *   1. The overview is structure, not labels. Stage plates, their numbers, the gates and the
 *      coloured paths read at any scale; the tile labels are a bonus at fit.
 *   2. Everything zooms. Click a stage chip, a plate or a tile and the view glides to it.
 *   3. Detail is one click away in the side panel, and one more to the skill itself.
 *
 * Still imperative SVG on purpose: the React component owns mounting and teardown, and this
 * owns everything inside the <svg> and the panel. `root` must contain #map (svg), #stages,
 * #legend, #flows, #context, #foot and #tip.
 *
 *   renderMap(root, MAP, opts) -> { destroy }
 */

const SVGNS = "http://www.w3.org/2000/svg";

/* ---- geometry. Content sets the numbers; nothing here is round for its own sake. ---- */
const TILE_W = 176, TILE_H = 58, TILE_GAP = 10;
const LANE_GAP = 12, PLATE_PAD = 12, PLATE_HEAD = 38, PLATE_GAP = 34;
const MARGIN_X = 70, TOP = 96, CHANNEL = 170, BOTTOM = 120;
const BAND_SPLIT = 7;                 // columns 0..6 run left to right, 7.. run back
const LOOP_STEP = 30;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&lt;", '"': "&quot;" }[c]));
const lanesFor = (n) => (n <= 4 ? 1 : n <= 8 ? 2 : 3);
const firstSentence = (s) => (s || "").split(/(?<=\.)\s/)[0];

export function renderMap(root, MAP, opts = {}) {
  const { columns: COLUMNS, nodes: NODES, edges: EDGES, gates: GATES, loops: LOOPS,
          flows: FLOWS, typeColour: TYPE_COLOR, typeLabel: TYPE_LABEL } = MAP;
  const STAGES = opts.stages || [];

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = root.querySelector("#map");
  const cleanups = [];
  const timers = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };
  const later = (fn, ms) => { const id = setTimeout(fn, ms); timers.push(id); return id; };

  /* fill and stroke that name a CSS variable go through style: a presentation attribute is
     parsed before custom properties resolve in some browsers. */
  function el(tag, attrs = {}) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) {
      const v = attrs[k];
      if ((k === "fill" || k === "stroke") && typeof v === "string" && v.startsWith("var(")) e.style.setProperty(k, v);
      else e.setAttribute(k, v);
    }
    return e;
  }

  /* ------------------------------------------------------------- layout ------- */
  const byId = {};
  NODES.forEach((n) => { byId[n.id] = n; });

  const byCol = COLUMNS.map((_, i) => NODES.filter((n) => n.col === i).sort((a, b) => a.row - b.row));
  const bandOf = (col) => (col < BAND_SPLIT ? 0 : 1);
  const plates = COLUMNS.map((name, i) => {
    const list = byCol[i];
    const lanes = lanesFor(list.length);
    const perLane = Math.max(1, Math.ceil(list.length / lanes));
    list.forEach((n, k) => { n.lane = Math.floor(k / perLane); n.slot = k % perLane; });
    return { i, name, band: bandOf(i), lanes, rows: perLane, list,
             w: PLATE_PAD * 2 + lanes * TILE_W + (lanes - 1) * LANE_GAP };
  });
  const bandRows = [0, 1].map((b) => Math.max(1, ...plates.filter((p) => p.band === b).map((p) => p.rows)));
  const plateH = (b) => PLATE_HEAD + PLATE_PAD * 2 + bandRows[b] * TILE_H + (bandRows[b] - 1) * TILE_GAP;
  const bandW = [0, 1].map((b) => {
    const ps = plates.filter((p) => p.band === b);
    return ps.reduce((s, p) => s + p.w, 0) + (ps.length - 1) * PLATE_GAP;
  });
  const CANVAS_W = Math.max(...bandW) + MARGIN_X * 2;
  const bandY = [TOP, TOP + plateH(0) + CHANNEL];
  const CANVAS_H = bandY[1] + plateH(1) + BOTTOM;

  // Band 0 runs left to right from the left margin; band 1 runs right to left and is
  // flush with the right edge, so the turn between them is as tight as it can be.
  let x0 = MARGIN_X;
  plates.filter((p) => p.band === 0).forEach((p) => { p.x = x0; p.y = bandY[0]; p.h = plateH(0); x0 += p.w + PLATE_GAP; });
  let x1 = CANVAS_W - MARGIN_X;
  plates.filter((p) => p.band === 1).forEach((p) => { x1 -= p.w; p.x = x1; p.y = bandY[1]; p.h = plateH(1); x1 -= PLATE_GAP; });

  NODES.forEach((n) => {
    const p = plates[n.col];
    n.x = p.x + PLATE_PAD + n.lane * (TILE_W + LANE_GAP);
    n.y = p.y + PLATE_HEAD + PLATE_PAD + n.slot * (TILE_H + TILE_GAP);
    n.cx = n.x + TILE_W / 2; n.cy = n.y + TILE_H / 2;
    n.band = p.band;
  });

  const trackY = [bandY[0] + plateH(0) / 2 + PLATE_HEAD / 2, bandY[1] + plateH(1) / 2 + PLATE_HEAD / 2];
  const band0Right = plates.filter((p) => p.band === 0).at(-1);
  const band1Start = plates.filter((p) => p.band === 1)[0];

  /* --------------------------------------------------------------- defs ------- */
  svg.innerHTML = "";
  const defs = el("defs");
  const colours = { ...TYPE_COLOR, loop: "var(--loop)" };
  Object.entries(colours).forEach(([k, c]) => {
    const m = el("marker", { id: "arw-" + k, markerWidth: 8, markerHeight: 8, refX: 6.5, refY: 3, orient: "auto", markerUnits: "userSpaceOnUse" });
    m.appendChild(el("path", { d: "M0,0 L7,3 L0,6 Z", fill: c }));
    defs.appendChild(m);
  });
  svg.appendChild(defs);

  const gBack = el("g", { class: "layer-back" }), gTrack = el("g"), gPlates = el("g"), gLoops = el("g"),
        gEdges = el("g"), gGates = el("g"), gNodes = el("g"), gPart = el("g", { id: "parts" });
  [gBack, gTrack, gPlates, gLoops, gEdges, gGates, gNodes, gPart].forEach((g) => svg.appendChild(g));

  // The sheet itself. Clicking it clears the selection.
  const sheet = el("rect", { x: -200, y: -200, width: CANVAS_W + 400, height: CANVAS_H + 400, fill: "transparent", class: "sheetbg" });
  gBack.appendChild(sheet);

  /* ------------------------------------------------------------- the track ---- */
  // A wide soft stroke that snakes through every stage. Drawn under the plates, so it only
  // shows between them: the path of the work, visible at any zoom.
  const endX = band0Right.x + band0Right.w;
  const startX1 = band1Start.x + band1Start.w;
  const turnR = Math.max(60, (startX1 - endX) / 2 + 40);
  const track = el("path", {
    d: `M${MARGIN_X - 30},${trackY[0]} L${endX},${trackY[0]} ` +
       `C${endX + turnR},${trackY[0]} ${startX1 + turnR},${trackY[1]} ${startX1},${trackY[1]} ` +
       `L${MARGIN_X - 30},${trackY[1]}`,
    class: "track",
  });
  gTrack.appendChild(track);

  /* ---------------------------------------------------------------- plates ---- */
  plates.forEach((p) => {
    const g = el("g", { class: "plate", "data-stage": p.i });
    g.appendChild(el("rect", { x: p.x, y: p.y, width: p.w, height: p.h, rx: 14, class: "plate-bg" }));
    g.appendChild(el("line", { x1: p.x + PLATE_PAD, y1: p.y + PLATE_HEAD - 2, x2: p.x + p.w - PLATE_PAD, y2: p.y + PLATE_HEAD - 2, class: "plate-rule" }));
    const num = el("text", { x: p.x + PLATE_PAD + 2, y: p.y + 23, class: "plate-num" });
    num.textContent = String(p.i + 1).padStart(2, "0");
    const nm = el("text", { x: p.x + PLATE_PAD + 26, y: p.y + 23, class: "plate-name" });
    nm.textContent = p.name.toUpperCase();
    const ct = el("text", { x: p.x + p.w - PLATE_PAD - 2, y: p.y + 23, "text-anchor": "end", class: "plate-count" });
    ct.textContent = String(p.list.length);
    g.appendChild(num); g.appendChild(nm); g.appendChild(ct);
    on(g, "click", (e) => { e.stopPropagation(); selectStage(p.i); });
    gPlates.appendChild(g);
  });

  /* --------------------------------------------------------------- wiring ----- */
  // Which way the reader is moving in this band. Forward is x increasing in band 0 and
  // x decreasing in band 1, and every anchor is chosen relative to that.
  const dir = (band) => (band === 0 ? 1 : -1);
  const side = (n, s) => ({ x: n.cx + (s * TILE_W) / 2, y: n.cy });
  const top = (n) => ({ x: n.cx, y: n.y });
  const bottom = (n) => ({ x: n.cx, y: n.y + TILE_H });

  function edgePath(a, b) {
    if (a.band !== b.band) {
      // Across the channel. Band 0 leaves from the bottom, band 1 from the top.
      const p = a.band === 0 ? bottom(a) : top(a);
      const q = a.band === 0 ? top(b) : bottom(b);
      const my = (p.y + q.y) / 2;
      return `M${p.x},${p.y} C${p.x},${my} ${q.x},${my} ${q.x},${q.y}`;
    }
    const d = dir(a.band);
    if (a.col === b.col) {
      if (a.lane !== b.lane) {
        const s = Math.sign(b.x - a.x);
        const p = side(a, s), q = side(b, -s);
        const mx = (p.x + q.x) / 2;
        return `M${p.x},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`;
      }
      if (Math.abs(b.slot - a.slot) === 1) {
        const p = b.y > a.y ? bottom(a) : top(a), q = b.y > a.y ? top(b) : bottom(b);
        return `M${p.x + 6},${p.y} L${q.x + 6},${q.y}`;
      }
      // Same lane, not neighbours: a short bulge out of the plate's reading side.
      const p = side(a, d), q = side(b, d);
      const bx = p.x + d * 36;
      return `M${p.x},${p.y} C${bx},${p.y} ${bx},${q.y} ${q.x},${q.y}`;
    }
    const forward = (b.cx - a.cx) * d > 0;
    if (forward) {
      const p = side(a, d), q = side(b, -d);
      const mx = (p.x + q.x) / 2;
      return `M${p.x},${p.y} C${mx},${p.y} ${mx},${q.y} ${q.x},${q.y}`;
    }
    // Backwards within a band: a hump over the top of the plates.
    const p = top(a), q = top(b);
    const hy = plates[a.col].y - 44;
    return `M${p.x},${p.y} C${p.x},${hy} ${q.x},${hy} ${q.x},${q.y}`;
  }

  function midpoint(d) {
    const tmp = el("path", { d });
    const L = tmp.getTotalLength ? tmp.getTotalLength() : 0;
    if (!L) return { x: 0, y: 0 };
    const pt = tmp.getPointAtLength(L * 0.5);
    return { x: pt.x, y: pt.y };
  }

  const edgeEls = {};
  EDGES.forEach((e, i) => {
    const a = byId[e.f], b = byId[e.t]; if (!a || !b) return;
    const col = TYPE_COLOR[a.type];
    const g = el("g", { class: "edge", "data-f": e.f, "data-t": e.t }); g.dataset.idx = i;
    const d = edgePath(a, b);
    g.appendChild(el("path", { d, class: "wire", stroke: col, "marker-end": "url(#arw-" + a.type + ")" }));
    g._path = d; g._color = col;
    if (e.lbl) {
      const mid = midpoint(d);
      const tw = e.lbl.length * 5.6 + 12;
      const lg = el("g", { class: "wire-lbl" });
      lg.appendChild(el("rect", { x: mid.x - tw / 2, y: mid.y - 8, width: tw, height: 16, rx: 4, class: "wire-lbl-bg", stroke: col }));
      const tt = el("text", { x: mid.x, y: mid.y + 3.5, "text-anchor": "middle", class: "wire-lbl-txt" });
      tt.textContent = e.lbl; lg.appendChild(tt);
      g.appendChild(lg);
    }
    gEdges.appendChild(g);
    edgeEls[e.f + ">" + e.t] = g;
  });

  /* ---------------------------------------------------------------- loops ----- */
  // Learning returning upstream. Most of them cross the channel, which is where the eye
  // expects a return to run; the one that stays in a band swings under it.
  const loopEls = {};
  const channelMid = bandY[0] + plateH(0) + CHANNEL / 2;
  LOOPS.forEach((lp, i) => {
    const a = byId[lp.f], b = byId[lp.t]; if (!a || !b) return;
    let d, lx, ly;
    if (a.band !== b.band) {
      const p = a.band === 1 ? top(a) : bottom(a), q = b.band === 0 ? bottom(b) : top(b);
      const yy = channelMid + (i - (LOOPS.length - 1) / 2) * LOOP_STEP;
      d = `M${p.x},${p.y} C${p.x},${yy} ${q.x},${yy} ${q.x},${q.y}`;
      const m = midpoint(d); lx = m.x; ly = m.y;
    } else {
      const p = bottom(a), q = bottom(b);
      const yy = plates[a.col].y + plates[a.col].h + 56 + i * 6;
      d = `M${p.x},${p.y} C${p.x},${yy} ${q.x},${yy} ${q.x},${q.y}`;
      const m = midpoint(d); lx = m.x; ly = m.y;
    }
    const g = el("g", { class: "loop", "data-f": lp.f, "data-t": lp.t });
    g.appendChild(el("path", { d, class: "loopwire", "marker-end": "url(#arw-loop)" }));
    g._path = d; g._color = "var(--loop)";
    const lw = lp.label.length * 6.1 + 18;
    g.appendChild(el("rect", { x: lx - lw / 2, y: ly - 9, width: lw, height: 18, rx: 9, class: "loop-lbl-bg" }));
    const tt = el("text", { x: lx, y: ly + 3.5, "text-anchor": "middle", class: "loop-txt" });
    tt.textContent = lp.label; g.appendChild(tt);
    gLoops.appendChild(g);
    loopEls[lp.f + ">" + lp.t] = g;
  });

  /* ---------------------------------------------------------------- gates ----- */
  GATES.forEach((gt) => {
    const p = plates[gt.after], next = plates[gt.after + 1];
    const g = el("g", { class: "gate" });
    let x, y, y1, y2;
    if (p.band === 0 && next && next.band === 1) {
      // The turn: the gate stands in the bend between the bands.
      x = endX + turnR * 0.72; y = channelMid;
      g.appendChild(el("line", { x1: x, y1: y - 56, x2: x, y2: y + 56, class: "gate-rule" }));
    } else {
      x = p.band === 0 ? p.x + p.w + PLATE_GAP / 2 : p.x - PLATE_GAP / 2;
      y1 = p.y + 10; y2 = p.y + p.h - 10;
      y = p.y + PLATE_HEAD / 2 + 2;
      g.appendChild(el("line", { x1: x, y1, x2: x, y2, class: "gate-rule" }));
    }
    g.appendChild(el("circle", { cx: x, cy: y, r: 11, class: "gate-bead" }));
    g.appendChild(el("path", { d: `M${x - 4.5},${y} l3.2,3.2 l5.6,-6.4`, class: "gate-tick" }));
    const t1 = el("text", { x, y: y - 20, "text-anchor": "middle", class: "gate-txt" }); t1.textContent = gt.label;
    const t2 = el("text", { x, y: y + 28, "text-anchor": "middle", class: "gate-who" }); t2.textContent = gt.who;
    g.appendChild(t1); g.appendChild(t2);
    gGates.appendChild(g);
  });

  /* ---------------------------------------------------------------- tiles ----- */
  NODES.forEach((n) => {
    const c = TYPE_COLOR[n.type];
    const g = el("g", { class: "node", "data-id": n.id, tabindex: 0, role: "button" });
    g.setAttribute("aria-label", `${n.label}. ${n.note}`);
    const box = el("g", { class: "nbox" });
    box.appendChild(el("rect", { x: n.x, y: n.y, width: TILE_W, height: TILE_H, rx: 9, class: "tile" }));
    const dot = el("circle", { cx: n.x + 14, cy: n.y + 17, r: 4.2, fill: c, class: "tile-dot" });
    if (n.type === "human") dot.classList.add("tile-dot-gate");
    box.appendChild(dot);
    const lab = el("text", { x: n.x + 25, y: n.y + 21, class: "node-label" }); lab.textContent = n.label; box.appendChild(lab);
    const nt = el("text", { x: n.x + 25, y: n.y + 35.5, class: "node-note" }); nt.textContent = n.note; box.appendChild(nt);
    const bt = el("text", { x: n.x + 25, y: n.y + 49, class: "badge-txt" }); bt.textContent = n.badge; box.appendChild(bt);
    g.appendChild(box);
    on(g, "mouseenter", (e) => { hover(n.id, true); showTip(n, e); });
    on(g, "mousemove", (e) => moveTip(e));
    on(g, "mouseleave", () => { hover(n.id, false); hideTip(); });
    on(g, "click", (e) => { e.stopPropagation(); selectNode(n.id); });
    on(g, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectNode(n.id); } });
    gNodes.appendChild(g);
  });

  /* ----------------------------------------------------------- HTML bits ------ */
  const legend = root.querySelector("#legend");
  if (legend) {
    legend.innerHTML =
      '<div class="lt">Who runs it</div><div class="row">' +
      Object.keys(TYPE_LABEL).map((k) => `<span class="k"><span class="dot" style="background:${TYPE_COLOR[k]}"></span>${esc(TYPE_LABEL[k])}</span>`).join("") +
      `<span class="k"><span class="dot dot-gate"></span>Gate</span><span class="k"><span class="dash"></span>Loop</span></div>`;
  }

  const strip = root.querySelector("#stages");
  if (strip) {
    strip.innerHTML = "";
    plates.forEach((p) => {
      const b = document.createElement("button");
      b.className = "stagechip"; b.type = "button"; b.dataset.stage = String(p.i);
      b.innerHTML = `<span class="n">${String(p.i + 1).padStart(2, "0")}</span><span class="nm">${esc(p.name)}</span>`;
      on(b, "click", () => selectStage(p.i));
      strip.appendChild(b);
    });
  }

  const getVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const flowsBox = root.querySelector("#flows");
  flowsBox.innerHTML = "";
  FLOWS.forEach((fl, i) => {
    const b = document.createElement("button");
    b.className = "flowbtn"; b.type = "button"; b.dataset.idx = String(i);
    b.style.setProperty("--accent-line", getVar(fl.accent));
    b.innerHTML = `<span class="idx">0${i + 1}</span><span class="nm">${esc(fl.name)}</span><span class="ct">${fl.path.length}</span>`;
    on(b, "click", () => (current === i ? clearFlow() : selectFlow(i)));
    flowsBox.appendChild(b);
  });

  const foot = root.querySelector("#foot");
  if (foot) {
    foot.innerHTML =
      `<span><b>${opts.skills ?? NODES.length}</b> skills</span><span><b>${COLUMNS.length}</b> stages</span>` +
      `<span><b>${EDGES.length}</b> connections</span><span><b>${GATES.length}</b> gates</span><span><b>${LOOPS.length}</b> loops</span>` +
      (opts.unplaced ? `<span class="alarm"><b>${opts.unplaced}</b> unplaced</span>` : "") +
      (opts.stamp ? `<span>GENERATED ${esc(opts.stamp)}</span>` : "");
  }

  /* --------------------------------------------------------------- tooltip ---- */
  const tip = root.querySelector("#tip");
  function showTip(n, e) {
    if (!tip || selectedNode === n.id) return;
    tip.innerHTML = `<div class="t-h"><span class="dot" style="background:${TYPE_COLOR[n.type]}"></span>${esc(n.label)}</div>` +
      `<div class="t-n">${esc(n.note)}</div>` + (n.desc ? `<div class="t-d">${esc(firstSentence(n.desc))}</div>` : "");
    tip.hidden = false; moveTip(e);
  }
  function moveTip(e) {
    if (!tip || tip.hidden) return;
    const r = root.querySelector(".mapstage").getBoundingClientRect();
    let x = e.clientX - r.left + 16, y = e.clientY - r.top + 18;
    if (x + 280 > r.width) x = e.clientX - r.left - 296;
    if (y + 120 > r.height) y = e.clientY - r.top - 128;
    tip.style.transform = `translate(${x}px, ${y}px)`;
  }
  const hideTip = () => { if (tip) tip.hidden = true; };

  /* ------------------------------------------------------------ interaction --- */
  let current = -1, selectedNode = null, selectedStage = -1;
  const edgeKey = (f, t) => f + ">" + t;
  const ctx = root.querySelector("#context");

  function pathLinks(fl) {
    const out = [];
    for (let i = 0; i < fl.path.length - 1; i++) {
      const a = fl.path[i][0], b = fl.path[i + 1][0];
      const g = edgeEls[edgeKey(a, b)] || edgeEls[edgeKey(b, a)] || loopEls[edgeKey(a, b)] || loopEls[edgeKey(b, a)];
      if (g) out.push(g);
    }
    return out;
  }
  const clearParts = () => { const p = svg.querySelector("#parts"); if (p) p.innerHTML = ""; };
  function clearMarks() {
    svg.classList.remove("has-sel");
    root.querySelectorAll(".edge,.loop,.node,.plate").forEach((e) => e.classList.remove("on", "hl", "dim"));
    clearParts();
  }
  function clearFlow() {
    current = -1;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.remove("on"));
    clearMarks();
    renderContext();
  }
  function selectFlow(i) {
    selectedNode = null; selectedStage = -1;
    clearMarks();
    current = i;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.toggle("on", +b.dataset.idx === i));
    root.querySelectorAll(".stagechip").forEach((b) => b.classList.remove("on"));
    const fl = FLOWS[i];
    svg.classList.add("has-sel");
    fl.path.forEach((p) => { const nd = root.querySelector(`.node[data-id="${p[0]}"]`); if (nd) nd.classList.add("on"); });
    pathLinks(fl).forEach((g) => { g.classList.add("on"); if (!reduce) addParticle(g._path, g._color, true); });
    renderContext();
    if (view.w < CANVAS_W - 1) animateTo(fitView());
  }
  function selectNode(id) {
    const n = byId[id]; if (!n) return;
    hideTip();
    if (selectedNode === id) { clearNode(); return; }
    current = -1; selectedStage = -1;
    root.querySelectorAll(".flowbtn,.stagechip").forEach((b) => b.classList.remove("on"));
    clearMarks();
    selectedNode = id;
    svg.classList.add("has-sel");
    markNeighbourhood(id, "on");
    renderContext();
    // Glide to the tile's neighbourhood so the selection is readable, without losing the
    // plate it sits in.
    const p = plates[n.col];
    animateTo(rectView({ x: p.x - 120, y: p.y - 60, w: p.w + 240, h: p.h + 120 }));
  }
  function clearNode() { selectedNode = null; clearMarks(); renderContext(); }
  function selectStage(i) {
    hideTip();
    current = -1; selectedNode = null;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.remove("on"));
    clearMarks();
    selectedStage = i;
    root.querySelectorAll(".stagechip").forEach((b) => b.classList.toggle("on", +b.dataset.stage === i));
    const p = plates[i];
    root.querySelector(`.plate[data-stage="${i}"]`)?.classList.add("on");
    renderContext();
    animateTo(rectView({ x: p.x - 70, y: p.y - 70, w: p.w + 140, h: p.h + 140 }));
  }
  function markNeighbourhood(id, cls) {
    const nd = root.querySelector(`.node[data-id="${id}"]`); if (nd) nd.classList.add(cls);
    root.querySelectorAll(`.edge[data-f="${id}"],.edge[data-t="${id}"],.loop[data-f="${id}"],.loop[data-t="${id}"]`).forEach((g) => {
      g.classList.add(cls);
      const ff = g.getAttribute("data-f"), tt = g.getAttribute("data-t");
      const other = root.querySelector(`.node[data-id="${ff === id ? tt : ff}"]`); if (other) other.classList.add(cls);
    });
  }
  function hover(id, isOn) {
    if (isOn) {
      markNeighbourhood(id, "hl");
      if (current < 0 && !selectedNode) svg.classList.add("has-sel");
    } else {
      root.querySelectorAll(".hl").forEach((e) => e.classList.remove("hl"));
      if (current < 0 && !selectedNode) svg.classList.remove("has-sel");
    }
  }
  on(sheet, "click", () => { if (selectedNode) clearNode(); else if (selectedStage >= 0) { selectedStage = -1; root.querySelectorAll(".stagechip").forEach((b) => b.classList.remove("on")); clearMarks(); renderContext(); } });
  on(window, "keydown", (e) => { if (e.key === "Escape") { if (selectedNode) clearNode(); else if (current >= 0) clearFlow(); } });

  function addParticle(d, color, persistent) {
    const parts = svg.querySelector("#parts");
    const dur = 1.8 + Math.random() * 0.9;
    const c = el("circle", { r: 3.2, fill: color, class: "particle" });
    const am = el("animateMotion", { dur: dur + "s", repeatCount: persistent ? "indefinite" : "1", path: d, rotate: "0" });
    c.appendChild(am); parts.appendChild(c);
    const c2 = el("circle", { r: 1.8, fill: color, class: "particle", "fill-opacity": 0.6 });
    const am2 = el("animateMotion", { dur: dur + "s", repeatCount: persistent ? "indefinite" : "1", path: d, begin: "-0.25s" });
    c2.appendChild(am2); parts.appendChild(c2);
    if (!persistent) later(() => { c.remove(); c2.remove(); }, dur * 1000 + 100);
  }

  // The sheet is alive even when nobody is tracing a path: every couple of seconds one
  // bead travels one wire and fades. Agents thinking, connecting, handing on.
  function ambient() {
    if (reduce || document.hidden) { later(ambient, 2400); return; }
    if (current < 0 && !selectedNode) {
      const pool = Object.values(edgeEls).concat(Object.values(loopEls));
      const g = pool[Math.floor(Math.random() * pool.length)];
      if (g) addParticle(g._path, g._color, false);
    }
    later(ambient, 1400 + Math.random() * 1400);
  }
  later(ambient, 1200);

  /* ---------------------------------------------------------------- panel ----- */
  function connectionsOf(id) {
    const from = [], to = [];
    EDGES.forEach((e) => { if (e.t === id && byId[e.f]) from.push(byId[e.f]); if (e.f === id && byId[e.t]) to.push(byId[e.t]); });
    return { from, to };
  }
  const chip = (n) => `<button type="button" class="ctxchip" data-node="${esc(n.id)}"><span class="dot" style="background:${TYPE_COLOR[n.type]}"></span>${esc(n.label)}</button>`;

  function renderContext() {
    if (!ctx) return;
    let h = "";
    if (selectedNode) {
      const n = byId[selectedNode];
      const { from, to } = connectionsOf(n.id);
      const isSkill = !n.id.startsWith("art-");
      h += `<div class="ctxcard">
        <div class="ctxeyebrow"><span class="dot" style="background:${TYPE_COLOR[n.type]}"></span>${esc(TYPE_LABEL[n.type] || n.type)} · ${esc(COLUMNS[n.col])}</div>
        <h3 class="ctxtitle">${esc(n.label)}</h3>
        <div class="ctxnote">${esc(n.note)}<span class="ctxbadge">${esc(n.badge)}</span></div>
        ${n.desc ? `<p class="ctxdesc">${esc(n.desc)}</p>` : ""}
        ${isSkill ? `<a class="ctxlink" href="/skills?skill=${encodeURIComponent(n.id)}">Open the skill <span aria-hidden>→</span></a>` : ""}
        ${from.length ? `<div class="ctxrow"><span class="shd">Comes from</span><div class="ctxchips">${from.map(chip).join("")}</div></div>` : ""}
        ${to.length ? `<div class="ctxrow"><span class="shd">Hands on to</span><div class="ctxchips">${to.map(chip).join("")}</div></div>` : ""}
      </div>`;
    } else if (selectedStage >= 0) {
      const p = plates[selectedStage];
      const st = STAGES.find((s) => s.name === p.name);
      h += `<div class="ctxcard">
        <div class="ctxeyebrow">Stage ${String(p.i + 1).padStart(2, "0")} of ${COLUMNS.length}</div>
        <h3 class="ctxtitle">${esc(p.name)}</h3>
        ${st?.purpose ? `<p class="ctxdesc">${esc(st.purpose)}</p>` : ""}
        <div class="ctxrow"><span class="shd">${p.list.length} on this plate</span><div class="ctxlist">${p.list.map((n) =>
          `<button type="button" class="ctxitem" data-node="${esc(n.id)}"><span class="dot" style="background:${TYPE_COLOR[n.type]}"></span><span class="b">${esc(n.label)}</span><span class="d">${esc(n.note)}</span></button>`).join("")}</div></div>
      </div>`;
    } else if (current >= 0) {
      const fl = FLOWS[current];
      const ac = getVar(fl.accent);
      h += `<div class="shd">${esc(fl.name)} · ${fl.path.length} steps</div>`;
      fl.path.forEach((p, i) => {
        h += `<button type="button" class="step" data-node="${esc(p[0])}"><div class="n" style="--sc:${ac}">${i + 1}</div>` +
             `<div><div class="b">${esc(p[1])}</div><div class="d">${esc(p[2])}</div></div></button>`;
      });
    } else {
      h += `<div class="ctxhint"><div class="shd">Reading the map</div>
        <p>Left to right along the top, then back along the bottom: fourteen stages, signal to shipped to learned. The coloured dot is who runs a step. The round beads are the gates, where a person decides. The dashed returns are the loops.</p>
        <p>Pick a path above to trace it, or click a stage or a tile to look closer.</p></div>`;
    }
    ctx.innerHTML = h;
    ctx.querySelectorAll("[data-node]").forEach((b) => on(b, "click", () => selectNode(b.dataset.node)));
  }

  /* ----------------------------------------------------------- view: pan/zoom - */
  const view = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };
  const MIN_W = CANVAS_W * 0.12, MAX_W = CANVAS_W * 1.15;
  let anim = null;

  function stageAspect() {
    const r = svg.getBoundingClientRect();
    return r.width && r.height ? r.width / r.height : CANVAS_W / CANVAS_H;
  }
  function applyView() {
    svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
    const r = svg.getBoundingClientRect();
    const scale = r.width ? r.width / view.w : 1;   // screen px per canvas unit
    svg.classList.toggle("lod-far", scale < 0.6);
    svg.classList.toggle("lod-near", scale >= 0.95);
  }
  /* The view that fits a canvas rectangle into the stage at the stage's aspect. */
  function rectView(r) {
    const a = stageAspect();
    let w = r.w, h = r.h;
    if (w / h < a) w = h * a; else h = w / a;
    w = Math.min(MAX_W, Math.max(MIN_W, w)); h = w / a;
    return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h };
  }
  const fitView = () => rectView({ x: 0, y: 0, w: CANVAS_W, h: CANVAS_H });
  function setView(v) { view.x = v.x; view.y = v.y; view.w = v.w; view.h = v.h; applyView(); }
  function animateTo(target) {
    if (anim) cancelAnimationFrame(anim);
    if (reduce) { setView(target); return; }
    const from = { ...view }, t0 = performance.now(), D = 620;
    const ease = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
    const step = (now) => {
      const k = ease(Math.min(1, (now - t0) / D));
      setView({ x: from.x + (target.x - from.x) * k, y: from.y + (target.y - from.y) * k,
                w: from.w + (target.w - from.w) * k, h: from.h + (target.h - from.h) * k });
      if (k < 1) anim = requestAnimationFrame(step); else anim = null;
    };
    anim = requestAnimationFrame(step);
  }
  function zoomTo(factor, cx, cy) {
    const a = stageAspect();
    const w = Math.min(MAX_W, Math.max(MIN_W, view.w * factor));
    const ratio = w / view.w;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.w = w; view.h = w / a;
    clampView(); applyView();
  }
  function clampView() {
    view.x = Math.max(-view.w * 0.5, Math.min(view.x, CANVAS_W - view.w * 0.5));
    view.y = Math.max(-view.h * 0.5, Math.min(view.y, CANVAS_H - view.h * 0.5));
  }
  const toUser = (clientX, clientY) => {
    const r = svg.getBoundingClientRect();
    return { x: view.x + ((clientX - r.left) / r.width) * view.w,
             y: view.y + ((clientY - r.top) / r.height) * view.h };
  };

  // Fitted on a wide stage; on a phone, start on the first stage and let the chips carry
  // the reader along. Re-decided on resize until the reader takes control.
  let userMoved = false;
  function defaultView() {
    if (userMoved) return;
    // The lg breakpoint, which is where the panel moves beside the stage rather than
    // under it. Measured on the window, not the stage: the stage is narrower than 1024
    // on a 1280 screen once the panel has taken its share.
    const wide = window.innerWidth >= 1024;
    if (wide) { setView(fitView()); return; }
    const p = plates[0];
    setView(rectView({ x: p.x - 40, y: p.y - 80, w: p.w + 80, h: p.h + 160 }));
  }
  defaultView();
  const ro = new ResizeObserver(() => defaultView());
  ro.observe(svg);
  cleanups.push(() => ro.disconnect());

  const pointers = new Map();
  let dragFrom = null, pinchFrom = null, moved = false;
  on(svg, "pointerdown", (e) => {
    pointers.set(e.pointerId, e);
    svg.setPointerCapture?.(e.pointerId);
    moved = false;
    if (pointers.size === 1) dragFrom = { p: toUser(e.clientX, e.clientY), x: view.x, y: view.y, sx: e.clientX, sy: e.clientY };
    if (pointers.size === 2) {
      const [a, b] = [...pointers.values()];
      pinchFrom = { dist: Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY), w: view.w };
      dragFrom = null;
    }
  });
  on(svg, "pointermove", (e) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, e);
    if (pointers.size === 2 && pinchFrom) {
      const [a, b] = [...pointers.values()];
      const dist = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY);
      if (dist > 0) {
        userMoved = true;
        const mid = toUser((a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2);
        const target = Math.min(MAX_W, Math.max(MIN_W, pinchFrom.w * (pinchFrom.dist / dist)));
        zoomTo(target / view.w, mid.x, mid.y);
      }
      e.preventDefault();
      return;
    }
    if (dragFrom) {
      if (Math.hypot(e.clientX - dragFrom.sx, e.clientY - dragFrom.sy) > 4) moved = true;
      if (!moved) return;
      userMoved = true;
      if (anim) { cancelAnimationFrame(anim); anim = null; }
      const now = toUser(e.clientX, e.clientY);
      view.x = dragFrom.x - (now.x - dragFrom.p.x);
      view.y = dragFrom.y - (now.y - dragFrom.p.y);
      clampView(); applyView();
      e.preventDefault();
    }
  }, { passive: false });
  const release = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchFrom = null; if (!pointers.size) dragFrom = null; };
  on(svg, "pointerup", release);
  on(svg, "pointercancel", release);
  on(svg, "pointerleave", release);
  // A drag must not count as a click on whatever the pointer landed on.
  on(svg, "click", (e) => { if (moved) { e.stopPropagation(); moved = false; } }, true);
  on(svg, "wheel", (e) => {
    if (!e.ctrlKey && !e.metaKey) return;   // plain scroll keeps scrolling the page
    e.preventDefault();
    userMoved = true;
    const u = toUser(e.clientX, e.clientY);
    zoomTo(Math.exp(e.deltaY * 0.0022), u.x, u.y);
  }, { passive: false });

  root.querySelectorAll("[data-zoom]").forEach((btn) => {
    on(btn, "click", () => {
      const k = btn.getAttribute("data-zoom");
      if (k === "reset") { userMoved = false; selectedStage = -1; root.querySelectorAll(".stagechip").forEach((b) => b.classList.remove("on")); animateTo(fitView()); return; }
      userMoved = true;
      zoomTo(k === "in" ? 0.72 : 1 / 0.72, view.x + view.w / 2, view.y + view.h / 2);
    });
  });

  /* ------------------------------------------------------------- deep links --- */
  renderContext();
  const params = new URLSearchParams(window.location.search);
  const want = params.get("skill") || params.get("node");
  const wantStage = params.get("stage");
  if (want && byId[want]) later(() => selectNode(want), 350);
  else if (wantStage) {
    const i = COLUMNS.findIndex((c) => c.toLowerCase() === wantStage.toLowerCase());
    if (i >= 0) later(() => selectStage(i), 350);
  } else {
    // Trace the longest path a moment after mount, so the first thing seen is movement.
    let longest = 0;
    FLOWS.forEach((fl, i) => { if (fl.path.length > FLOWS[longest].path.length) longest = i; });
    later(() => { if (current < 0 && !selectedNode && selectedStage < 0) selectFlow(longest); }, 1100);
  }

  return {
    destroy() {
      timers.forEach(clearTimeout);
      if (anim) cancelAnimationFrame(anim);
      cleanups.forEach((fn) => fn());
      svg.innerHTML = "";
    },
  };
}
