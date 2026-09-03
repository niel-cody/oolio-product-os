/**
 * The map's rendering engine, lifted from the original single-page version with its
 * drawing code unchanged. It stays imperative SVG on purpose: reimplementing it as React
 * components would be a rewrite, and a rewrite is how a design you like quietly drifts.
 *
 * The React component owns mounting and teardown. This owns everything inside the <svg>.
 *
 *   renderMap(root, MAP) -> { destroy }
 *
 * `root` must contain #map (svg), #legend, #flows, #steps and #foot.
 */

const SVGNS = "http://www.w3.org/2000/svg";
const NODE_W = 176, NODE_H = 62, LEFT = 150, COLGAP = 205, TOP = 225, ROWGAP = 175;

export function renderMap(root, MAP, opts = {}) {
  const { columns: COLUMNS, nodes: NODES, edges: EDGES, gates: GATES, loops: LOOPS,
          flows: FLOWS, typeColour: TYPE_COLOR, typeLabel: TYPE_LABEL } = MAP;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = root.querySelector("#map");
  const cleanups = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };

  const byId = {};
  NODES.forEach((n) => { n.cx = LEFT + n.col * COLGAP; n.cy = TOP + n.row * ROWGAP; byId[n.id] = n; });

  /* canvas sizes itself to the data, so adding a column or a loop never crops the map */
  const MAXROW = Math.max(...NODES.map((n) => n.row));
  const ROWS_BOTTOM = TOP + MAXROW * ROWGAP + NODE_H / 2;
  const LOOP_BASE = ROWS_BOTTOM + 75, LOOP_STEP = 42;
  const CANVAS_W = LEFT + (COLUMNS.length - 1) * COLGAP + NODE_W / 2 + 62;
  const CANVAS_H = LOOP_BASE + Math.max(0, LOOPS.length - 1) * LOOP_STEP + 58;

  function el(tag, attrs) {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }

  /* ---- defs ---- */
  const defs = el("defs", {});
  const pat = el("pattern", { id: "dots", width: 26, height: 26, patternUnits: "userSpaceOnUse" });
  pat.appendChild(el("circle", { cx: 1.2, cy: 1.2, r: 1.2, fill: "#131b28" }));
  defs.appendChild(pat);
  const f = el("filter", { id: "glow", x: "-40%", y: "-40%", width: "180%", height: "180%" });
  f.appendChild(el("feGaussianBlur", { stdDeviation: "2.4", result: "b" }));
  const fm = el("feMerge", {});
  fm.appendChild(el("feMergeNode", { in: "b" }));
  fm.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
  f.appendChild(fm); defs.appendChild(f);
  Object.entries(TYPE_COLOR).concat([["loop", "#f07eb3"]]).forEach(([k, c]) => {
    const m = el("marker", { id: "arw-" + k, markerWidth: 8, markerHeight: 8, refX: 6.5, refY: 3, orient: "auto", markerUnits: "userSpaceOnUse" });
    m.appendChild(el("path", { d: "M0,0 L7,3 L0,6 Z", fill: c }));
    defs.appendChild(m);
  });
  svg.appendChild(defs);
  svg.appendChild(el("rect", { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H, fill: "url(#dots)" }));

  const gLoops = el("g", {}), gEdges = el("g", {}), gGates = el("g", {}), gNodes = el("g", {}), gPart = el("g", { id: "parts" });
  [gLoops, gGates, gEdges, gNodes, gPart].forEach((g) => svg.appendChild(g));

  /* ---- column headers ---- */
  COLUMNS.forEach((c, i) => {
    const t = el("text", { x: LEFT + i * COLGAP, y: 172, "text-anchor": "middle", class: "colhead" });
    t.textContent = c.toUpperCase(); gNodes.appendChild(t);
  });

  /* ---- anchors + path builder ---- */
  function anchors(a, b) {
    const dx = b.cx - a.cx;
    if (dx > 1) return { x1: a.cx + NODE_W / 2, y1: a.cy, x2: b.cx - NODE_W / 2, y2: b.cy, dir: "fwd" };
    if (Math.abs(dx) <= 1) return { x1: a.cx + NODE_W / 2, y1: a.cy, x2: b.cx + NODE_W / 2, y2: b.cy, dir: "same" };
    return { x1: a.cx - NODE_W / 2, y1: a.cy, x2: b.cx + NODE_W / 2, y2: b.cy, dir: "back" };
  }
  function edgePath(a, b) {
    const k = anchors(a, b);
    if (k.dir === "fwd") {
      const mx = (k.x1 + k.x2) / 2;
      return `M${k.x1},${k.y1} C${mx},${k.y1} ${mx},${k.y2} ${k.x2},${k.y2}`;
    }
    if (k.dir === "same") {
      const bulge = Math.max(k.x1, k.x2) + 64;
      return `M${k.x1},${k.y1} C${bulge},${k.y1} ${bulge},${k.y2} ${k.x2},${k.y2}`;
    }
    const topY = Math.min(k.y1, k.y2) - 64;
    return `M${k.x1},${k.y1} C${k.x1 - 70},${topY} ${k.x2 + 70},${topY} ${k.x2},${k.y2}`;
  }
  function midpoint(d) {
    const tmp = el("path", { d }); const L = tmp.getTotalLength ? tmp.getTotalLength() : 0;
    if (L) { const pt = tmp.getPointAtLength(L * 0.5); return { x: pt.x, y: pt.y }; }
    return { x: 0, y: 0 };
  }

  /* ---- edges ---- */
  const edgeEls = {};
  EDGES.forEach((e, i) => {
    const a = byId[e.f], b = byId[e.t]; if (!a || !b) return;
    const col = TYPE_COLOR[a.type];
    const g = el("g", { class: "edge", "data-f": e.f, "data-t": e.t }); g.dataset.idx = i;
    const d = edgePath(a, b);
    const p = el("path", { d, class: "wire", stroke: col, "marker-end": "url(#arw-" + a.type + ")" });
    p.style.setProperty("--c", col);
    g.appendChild(p);
    g._path = d; g._color = col;
    if (e.lbl) {
      const mid = midpoint(d);
      const tg = el("g", {});
      const tw = e.lbl.length * 5.4 + 10;
      tg.appendChild(el("rect", { x: mid.x - tw / 2, y: mid.y - 14, width: tw, height: 13, rx: 3, fill: "#0e1521", stroke: col, "stroke-opacity": 0.5 }));
      const tt = el("text", { x: mid.x, y: mid.y - 4.5, "text-anchor": "middle", "font-family": "var(--font-mono),monospace", "font-size": 8, fill: "#b8c3d3" });
      tt.textContent = e.lbl; tg.appendChild(tt);
      g.appendChild(tg);
    }
    gEdges.appendChild(g);
    edgeEls[e.f + ">" + e.t] = g;
  });

  /* ---- loops (under the graph) ---- */
  const loopEls = {};
  LOOPS.forEach((lp, i) => {
    const a = byId[lp.f], b = byId[lp.t]; if (!a || !b) return;
    const depth = LOOP_BASE + i * LOOP_STEP;
    const x1 = a.cx, y1 = a.cy + NODE_H / 2, x2 = b.cx, y2 = b.cy + NODE_H / 2;
    const d = `M${x1},${y1} C${x1},${depth} ${x2},${depth} ${x2},${y2}`;
    const g = el("g", { class: "loop", "data-f": lp.f, "data-t": lp.t });
    g.appendChild(el("path", { d, class: "loopwire", "marker-end": "url(#arw-loop)" }));
    g._path = d; g._color = "#f07eb3";
    const midx = (x1 + x2) / 2;
    const lw = lp.label.length * 6.0 + 14;
    g.appendChild(el("rect", { x: midx - lw / 2, y: depth - 9, width: lw, height: 16, rx: 4, fill: "#0e1521", stroke: "#f07eb3", "stroke-opacity": 0.45 }));
    const tt = el("text", { x: midx, y: depth + 2.5, "text-anchor": "middle", class: "loop-txt" });
    tt.textContent = lp.label; g.appendChild(tt);
    gLoops.appendChild(g);
    loopEls[lp.f + ">" + lp.t] = g;
  });

  /* ---- gates ---- */
  GATES.forEach((gt) => {
    const x = LEFT + (gt.after + 0.5) * COLGAP;
    const g = el("g", {});
    g.appendChild(el("line", { x1: x, y1: 190, x2: x, y2: ROWS_BOTTOM + 20, stroke: "#fcbd30", "stroke-width": 1.4, "stroke-dasharray": "3 6", "stroke-opacity": 0.55 }));
    g.appendChild(el("circle", { cx: x, cy: 204, r: 9, fill: "#0e1521", stroke: "#fcbd30", "stroke-width": 1.4 }));
    g.appendChild(el("path", { d: `M${x - 4},${204} l3,3 l5,-6`, fill: "none", stroke: "#fcbd30", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    const t1 = el("text", { x, y: 232, "text-anchor": "middle", class: "gate-txt" }); t1.textContent = "⟡ " + gt.label;
    const t2 = el("text", { x, y: 246, "text-anchor": "middle", class: "gate-who" }); t2.textContent = gt.who;
    g.appendChild(t1); g.appendChild(t2);
    gGates.appendChild(g);
  });

  /* ---- nodes ---- */
  NODES.forEach((n) => {
    const c = TYPE_COLOR[n.type];
    const x = n.cx - NODE_W / 2, y = n.cy - NODE_H / 2;
    const g = el("g", { class: "node", "data-id": n.id });
    if (n.desc) { const tip = el("title", {}); tip.textContent = n.desc; g.appendChild(tip); }
    const box = el("g", { class: "nbox" });
    box.appendChild(el("rect", { x, y, width: NODE_W, height: NODE_H, rx: 11, fill: "#0d1420", stroke: c, "stroke-opacity": 0.55, "stroke-width": 1.4 }));
    box.appendChild(el("rect", { x, y, width: 4, height: NODE_H, rx: 2, fill: c }));
    const lab = el("text", { x: x + 15, y: y + 22, class: "node-label" }); lab.textContent = n.label; box.appendChild(lab);
    const nt = el("text", { x: x + 15, y: y + 37, class: "node-note" }); nt.textContent = n.note; box.appendChild(nt);
    const bw = n.badge.length * 5.1 + 14;
    const bg = el("g", {});
    bg.appendChild(el("rect", { x: x + 15, y: y + 43, width: bw, height: 13, rx: 6.5, fill: c, "fill-opacity": 0.15, stroke: c, "stroke-opacity": 0.6 }));
    const bt = el("text", { x: x + 15 + bw / 2, y: y + 52.5, "text-anchor": "middle", class: "badge-txt", fill: c });
    bt.textContent = n.badge; bg.appendChild(bt);
    box.appendChild(bg);
    g.appendChild(box);
    on(g, "mouseenter", () => hover(n.id, true));
    on(g, "mouseleave", () => hover(n.id, false));
    gNodes.appendChild(g);
  });

  /* ---- legend / flows / footer ---- */
  const legend = root.querySelector("#legend");
  legend.innerHTML =
    '<div class="lt">Executor</div><div class="row">' +
    Object.keys(TYPE_LABEL).map((k) => `<span class="k"><span class="dot" style="background:${TYPE_COLOR[k]}"></span>${TYPE_LABEL[k]}</span>`).join("") +
    "</div>";

  const getVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const flowsBox = root.querySelector("#flows");
  flowsBox.innerHTML = "";
  FLOWS.forEach((fl, i) => {
    const b = document.createElement("button");
    b.className = "flowbtn"; b.dataset.idx = String(i);
    // --accent-line, not --accent: shadcn already owns --accent as a surface colour
    b.style.setProperty("--accent-line", getVar(fl.accent));
    b.innerHTML = `<span class="idx">0${i + 1}</span><span class="nm">${fl.name}</span><span class="ct">${fl.path.length}</span>`;
    on(b, "click", () => selectFlow(i));
    flowsBox.appendChild(b);
  });

  const foot = root.querySelector("#foot");
  if (foot) {
    foot.innerHTML =
      `<span><b>${opts.skills ?? NODES.length}</b> skills</span><span><b>${EDGES.length}</b> connections</span>` +
      `<span><b>${GATES.length}</b> gates</span><span><b>${LOOPS.length}</b> loops</span>` +
      (opts.unplaced ? `<span style="color:#fd6560"><b>${opts.unplaced}</b> unplaced</span>` : "") +
      (opts.stamp ? `<span>GENERATED ${opts.stamp}</span>` : "");
  }

  /* ---- interaction ---- */
  let current = -1;
  const edgeKey = (f, t) => f + ">" + t;
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
  function clearState() {
    svg.classList.remove("has-sel");
    root.querySelectorAll(".edge,.loop,.node").forEach((e) => e.classList.remove("on", "hl"));
    clearParts();
  }
  function selectFlow(i) {
    clearState();
    current = i;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.toggle("on", +b.dataset.idx === i));
    const fl = FLOWS[i];
    svg.classList.add("has-sel");
    fl.path.forEach((p) => { const nd = root.querySelector(`.node[data-id="${p[0]}"]`); if (nd) nd.classList.add("on"); });
    pathLinks(fl).forEach((g) => { g.classList.add("on"); if (!reduce) addParticle(g._path, g._color); });
    renderSteps(fl);
  }
  function addParticle(d, color) {
    const parts = svg.querySelector("#parts");
    const c = el("circle", { r: 3.2, fill: color, class: "particle", filter: "url(#glow)" });
    const am = el("animateMotion", { dur: (1.6 + Math.random() * 0.8) + "s", repeatCount: "indefinite", path: d, rotate: "0" });
    c.appendChild(am); parts.appendChild(c);
    const c2 = el("circle", { r: 1.8, fill: color, class: "particle", "fill-opacity": 0.6 });
    const am2 = el("animateMotion", { dur: am.getAttribute("dur"), repeatCount: "indefinite", path: d, begin: "-0.25s" });
    c2.appendChild(am2); parts.appendChild(c2);
  }
  function renderSteps(fl) {
    const box = root.querySelector("#steps");
    const ac = getVar(fl.accent);
    let h = `<div class="shd">${fl.name} · ${fl.path.length} steps</div>`;
    fl.path.forEach((p, i) => {
      h += `<div class="step"><div class="n" style="--sc:${ac}">${i + 1}</div>` +
           `<div><div class="b">${p[1]}</div><div class="d">${p[2]}</div></div></div>`;
    });
    box.innerHTML = h;
  }
  function hover(id, isOn) {
    if (isOn) {
      const nd = root.querySelector(`.node[data-id="${id}"]`); if (nd) nd.classList.add("hl");
      root.querySelectorAll(`.edge[data-f="${id}"],.edge[data-t="${id}"]`).forEach((g) => {
        g.classList.add("hl");
        const ff = g.getAttribute("data-f"), tt = g.getAttribute("data-t");
        const other = ff === id ? tt : ff;
        const on2 = root.querySelector(`.node[data-id="${other}"]`); if (on2) on2.classList.add("hl");
      });
      root.querySelectorAll(`.loop[data-f="${id}"],.loop[data-t="${id}"]`).forEach((g) => g.classList.add("hl"));
      if (current < 0) svg.classList.add("has-sel");
    } else {
      root.querySelectorAll(".hl").forEach((e) => e.classList.remove("hl"));
      if (current < 0) svg.classList.remove("has-sel");
    }
  }

  /* ---- view: pan and zoom, so the map survives a phone -------------------
     The map is 2,700px wide because that is what makes it legible. Shrinking it
     to fit a phone makes it useless, so small screens get the real map and the
     means to move around it instead. */
  const view = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };
  const MIN_W = CANVAS_W * 0.18, MAX_W = CANVAS_W;
  const applyView = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);

  function fit() {
    view.x = 0; view.y = 0; view.w = CANVAS_W; view.h = CANVAS_H; applyView();
  }
  function zoomTo(factor, cx, cy) {
    const w = Math.min(MAX_W, Math.max(MIN_W, view.w * factor));
    const ratio = w / view.w;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.w = w; view.h = CANVAS_H * (w / CANVAS_W);
    clampView(); applyView();
  }
  function clampView() {
    view.x = Math.max(-40, Math.min(view.x, CANVAS_W - view.w + 40));
    view.y = Math.max(-40, Math.min(view.y, CANVAS_H - view.h + 40));
  }
  const toUser = (clientX, clientY) => {
    const r = svg.getBoundingClientRect();
    return { x: view.x + ((clientX - r.left) / r.width) * view.w,
             y: view.y + ((clientY - r.top) / r.height) * view.h };
  };

  // Start zoomed to the first stage on small screens, fitted everywhere else. Measure the
  // stage rather than the window, and keep re-deciding on resize until the reader takes
  // control, so rotating a phone or dragging a window does not strand them mid-map.
  let userMoved = false;
  function defaultView() {
    if (userMoved) return;
    const wide = (svg.getBoundingClientRect().width || window.innerWidth) >= 1024;
    if (wide) { fit(); return; }
    view.w = CANVAS_W * 0.34; view.h = CANVAS_H * 0.34; view.x = 0; view.y = 150;
    clampView(); applyView();
  }
  defaultView();
  const ro = new ResizeObserver(() => defaultView());
  ro.observe(svg);
  cleanups.push(() => ro.disconnect());

  const pointers = new Map();
  let dragFrom = null, pinchFrom = null;
  on(svg, "pointerdown", (e) => {
    pointers.set(e.pointerId, e);
    svg.setPointerCapture?.(e.pointerId);
    if (pointers.size === 1) dragFrom = { p: toUser(e.clientX, e.clientY), x: view.x, y: view.y };
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
    if (dragFrom && view.w < CANVAS_W - 1) {   // only pan when zoomed in; a fitted map has nowhere to go
      userMoved = true;
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

  root.querySelectorAll("[data-zoom]").forEach((btn) => {
    on(btn, "click", () => {
      const k = btn.getAttribute("data-zoom");
      if (k === "reset") { userMoved = false; defaultView(); return; }
      userMoved = true;
      zoomTo(k === "in" ? 0.7 : 1 / 0.7, view.x + view.w / 2, view.y + view.h / 2);
    });
  });

  /* auto-select the longest flow ~1s after mount */
  let longest = 0;
  FLOWS.forEach((fl, i) => { if (fl.path.length > FLOWS[longest].path.length) longest = i; });
  const timer = setTimeout(() => selectFlow(longest), 1000);

  return {
    destroy() {
      clearTimeout(timer);
      cleanups.forEach((fn) => fn());
      svg.innerHTML = "";
    },
  };
}
