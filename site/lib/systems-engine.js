/**
 * The systems map's rendering engine.
 *
 *   renderSystems(root, SYS, opts) -> { destroy }
 *
 * Deliberately a different grammar from the lifecycle map next door. That one is a pipeline
 * read left to right in columns; this one is a river with a single crossing point. Signal
 * enters on the left, everything passes through the Product OS in the middle, work lands in
 * the systems of record on the right, and the vault runs underneath the whole thing because
 * that is what it is: the floor, not a peer.
 *
 * The one rule the layout enforces visually is the one that matters: nothing on the left ever
 * touches anything on the right directly. Every wire goes through the middle.
 *
 * `root` must contain #sysmap (svg), #syslegend, #sysroutes, #sysdetail and #sysfoot.
 */

const NS = "http://www.w3.org/2000/svg";

/* The canvas is sized to roughly the shape of the stage it renders into, so a fitted map
   fills the space rather than sitting in a letterbox. Content sets the margins: nothing here
   is a round number for its own sake. */
const W = 236, H = 66;                       // system card
const SRC_X = 190, CORE_X = 770, REC_X = 1300;
const SRC_TOP = 140, SRC_GAP = 96;
const REC_TOP = 278, REC_GAP = 132;
const CORE_W = 250, CORE_H = 360, CORE_Y = 476;
const BRAIN_Y = 975, BRAIN_H = 84, BRAIN_PAD = 136;
const CANVAS_W = 1490, CANVAS_H = 1075;

const CORE_T = CORE_Y - CORE_H / 2, CORE_B = CORE_Y + CORE_H / 2;
const CORE_L = CORE_X - CORE_W / 2, CORE_R = CORE_X + CORE_W / 2;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

export function renderSystems(root, SYS, opts = {}) {
  const { systems: LIST, wires: WIRES, routes: ROUTES, kinds: KINDS } = SYS;
  const colour = (kind) => KINDS[kind]?.colour || "#7d8aa0";

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const svg = root.querySelector("#sysmap");
  const cleanups = [];
  const on = (t, ev, fn, o) => { t.addEventListener(ev, fn, o); cleanups.push(() => t.removeEventListener(ev, fn, o)); };

  /* ---- geometry ----------------------------------------------------------
     Rows come from the config; x and y are derived from the band, so adding a
     source is one config line rather than a coordinate someone has to nudge. */
  const by = {};
  LIST.forEach((s) => {
    const n = { ...s };
    if (s.band === "source") { n.x = SRC_X; n.y = SRC_TOP + s.row * SRC_GAP; n.w = W; n.h = H; }
    else if (s.band === "record") { n.x = REC_X; n.y = REC_TOP + s.row * REC_GAP; n.w = W; n.h = H; }
    else if (s.band === "core") { n.x = CORE_X; n.y = CORE_Y; n.w = CORE_W; n.h = CORE_H; }
    else { n.x = (SRC_X - BRAIN_PAD + REC_X + BRAIN_PAD) / 2; n.y = BRAIN_Y;
           n.w = (REC_X + BRAIN_PAD) - (SRC_X - BRAIN_PAD); n.h = BRAIN_H; }
    by[s.id] = n;
  });
  const srcMid = SRC_TOP + ((LIST.filter((s) => s.band === "source").length - 1) / 2) * SRC_GAP;
  const recMid = REC_TOP + ((LIST.filter((s) => s.band === "record").length - 1) / 2) * REC_GAP;

  // The core is shorter than the bands it joins, so arrivals are compressed onto its edge
  // rather than fanning past it. Without this the top and bottom wires enter through thin air.
  const onCore = (y, mid) => clamp(CORE_Y + (y - mid) * 0.42, CORE_T + 26, CORE_B - 26);

  function el(tag, attrs) {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    return e;
  }
  const curveH = (x1, y1, x2, y2) => {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  };
  const curveV = (x1, y1, x2, y2) => {
    const my = (y1 + y2) / 2;
    return `M${x1},${y1} C${x1},${my} ${x2},${my} ${x2},${y2}`;
  };

  /* A wire's two ends depend only on its kind, so the config never carries coordinates.
     Read and write between the same pair are offset by 9px so a two-way pipe reads as two
     arrows rather than one line with a marker at each end. */
  function geom(w) {
    const a = by[w.from], b = by[w.to];
    if (w.kind === "in")   return curveH(a.x + a.w / 2, a.y, CORE_L, onCore(a.y, srcMid));
    if (w.kind === "out")  return curveH(CORE_R, onCore(b.y, recMid) - 9, b.x - b.w / 2, b.y - 9);
    if (w.kind === "back") return curveH(a.x - a.w / 2, a.y + 9, CORE_R, onCore(a.y, recMid) + 9);
    if (w.from === "core") return curveV(CORE_X - 26, CORE_B, CORE_X - 26, BRAIN_Y - BRAIN_H / 2);
    if (w.to === "core")   return curveV(CORE_X + 26, BRAIN_Y - BRAIN_H / 2, CORE_X + 26, CORE_B);
    return curveV(b.x, BRAIN_Y - BRAIN_H / 2, b.x, b.y + b.h / 2);   // vault → its remote
  }

  /* ---- defs ---- */
  const defs = el("defs", {});
  const pat = el("pattern", { id: "sysdots", width: 26, height: 26, patternUnits: "userSpaceOnUse" });
  pat.appendChild(el("circle", { cx: 1.2, cy: 1.2, r: 1.2, fill: "#141b28" }));
  defs.appendChild(pat);
  const glow = el("filter", { id: "sysglow", x: "-60%", y: "-60%", width: "220%", height: "220%" });
  glow.appendChild(el("feGaussianBlur", { stdDeviation: "2.6", result: "b" }));
  const merge = el("feMerge", {});
  merge.appendChild(el("feMergeNode", { in: "b" }));
  merge.appendChild(el("feMergeNode", { in: "SourceGraphic" }));
  glow.appendChild(merge); defs.appendChild(glow);
  Object.keys(KINDS).forEach((k) => {
    const m = el("marker", { id: "sysarw-" + k, markerWidth: 8, markerHeight: 8, refX: 6.5, refY: 3, orient: "auto", markerUnits: "userSpaceOnUse" });
    m.appendChild(el("path", { d: "M0,0 L7,3 L0,6 Z", fill: colour(k) }));
    defs.appendChild(m);
  });
  svg.appendChild(defs);
  svg.appendChild(el("rect", { x: 0, y: 0, width: CANVAS_W, height: CANVAS_H, fill: "url(#sysdots)" }));

  const gWires = el("g", {}), gNodes = el("g", {}), gParts = el("g", { id: "sysparts" });
  [gWires, gNodes, gParts].forEach((g) => svg.appendChild(g));

  /* ---- band headers ---- */
  [["SIGNAL IN", SRC_X], ["THE PRODUCT OS", CORE_X], ["SYSTEMS OF RECORD", REC_X]].forEach(([t, x]) => {
    const h = el("text", { x, y: 88, "text-anchor": "middle", class: "sys-band" });
    h.textContent = t; gNodes.appendChild(h);
  });

  /* ---- wires ---- */
  const wireEls = {};
  WIRES.forEach((w) => {
    const from = by[w.from];
    const c = colour(from.kind || from.band);
    const d = geom(w);
    const g = el("g", { class: "swire", "data-f": w.from, "data-t": w.to });
    const p = el("path", { d, class: "sw", stroke: c, "marker-end": `url(#sysarw-${from.band})` });
    g.appendChild(p);
    g._d = d; g._c = c;

    if (w.label) {
      const probe = el("path", { d });
      const L = probe.getTotalLength ? probe.getTotalLength() : 0;
      const pt = L ? probe.getPointAtLength(L * 0.5) : { x: 0, y: 0 };
      const tw = w.label.length * 5.5 + 14;
      const lg = el("g", { class: "swlbl" });
      lg.appendChild(el("rect", { x: pt.x - tw / 2, y: pt.y - 17, width: tw, height: 14, rx: 4, fill: "#0b111a", stroke: c, "stroke-opacity": 0.4 }));
      const tt = el("text", { x: pt.x, y: pt.y - 6.8, "text-anchor": "middle", class: "sw-lbl", fill: "#aab5c8" });
      tt.textContent = w.label; lg.appendChild(tt);
      g.appendChild(lg);
    }
    gWires.appendChild(g);
    wireEls[w.from + ">" + w.to] = g;
  });

  /* ---- nodes ---- */
  function card(n) {
    const c = colour(n.band);
    const x = n.x - n.w / 2, y = n.y - n.h / 2;
    const g = el("g", { class: "snode", "data-id": n.id, tabindex: "0", role: "button" });
    const tip = el("title", {}); tip.textContent = `${n.label} — ${n.note}`; g.appendChild(tip);
    const box = el("g", { class: "sbox" });
    box.appendChild(el("rect", { x, y, width: n.w, height: n.h, rx: 11, fill: "#0e1420", stroke: c, "stroke-opacity": 0.5, "stroke-width": 1.4 }));
    box.appendChild(el("rect", { x, y, width: 4, height: n.h, rx: 2, fill: c }));

    // Three lines, each owning its full width. Sharing a line between the name and the stats
    // works until a system is called "Jira Product Discovery", and then it silently collides.
    const lab = el("text", { x: x + 15, y: y + 23, class: "sys-label" }); lab.textContent = n.label;
    const nt = el("text", { x: x + 15, y: y + 40, class: "sys-note" }); nt.textContent = n.note;
    box.appendChild(lab); box.appendChild(nt);

    const bw = n.cadence.length * 5.2 + 15;
    box.appendChild(el("rect", { x: x + 15, y: y + 48, width: bw, height: 13, rx: 6.5, fill: c, "fill-opacity": 0.14, stroke: c, "stroke-opacity": 0.55 }));
    const bt = el("text", { x: x + 15 + bw / 2, y: y + 57.5, "text-anchor": "middle", class: "sys-cad", fill: c });
    bt.textContent = n.cadence; box.appendChild(bt);

    // What moves it, and which way. The count is derived from the skills that actually name
    // this system, or reads INGEST for the two that no skill touches, so neither can go stale.
    // The direction is a glyph rather than words: spelled out it does not fit beside the
    // cadence, and the legend carries the key.
    const glyph = n.access === "read-write" ? "↔" : n.access === "read" ? "→" : "";
    const rt = el("text", { x: x + n.w - 14, y: y + 57.5, "text-anchor": "end", class: "sys-count" });
    rt.textContent = `${n.skillCount ? n.skillCount + " SKILLS" : "INGEST"}  ${glyph}`;
    box.appendChild(rt);

    g.appendChild(box);
    return g;
  }

  function coreCard(n) {
    const c = colour("core");
    const x = n.x - n.w / 2, y = n.y - n.h / 2;
    const g = el("g", { class: "snode score", "data-id": n.id, tabindex: "0", role: "button" });
    const tip = el("title", {}); tip.textContent = `${n.label} — ${n.note}`; g.appendChild(tip);
    const box = el("g", { class: "sbox" });
    if (!reduce) {
      // The one thing on the map that is always running, so it is the one thing that breathes.
      const halo = el("rect", { x: x - 7, y: y - 7, width: n.w + 14, height: n.h + 14, rx: 20, fill: "none", stroke: c, "stroke-width": 1.2, class: "corehalo" });
      box.appendChild(halo);
    }
    box.appendChild(el("rect", { x, y, width: n.w, height: n.h, rx: 16, fill: "#0c1620", stroke: c, "stroke-opacity": 0.75, "stroke-width": 1.8 }));

    const eyebrow = el("text", { x: n.x, y: y + 36, "text-anchor": "middle", class: "sys-cad", fill: c });
    eyebrow.textContent = "THE ONLY CROSSING"; box.appendChild(eyebrow);

    const t1 = el("text", { x: n.x, y: y + 80, "text-anchor": "middle", class: "core-title" });
    t1.textContent = "The Product OS"; box.appendChild(t1);
    const t2 = el("text", { x: n.x, y: y + 102, "text-anchor": "middle", class: "sys-note" });
    t2.textContent = n.note; box.appendChild(t2);

    const big = el("text", { x: n.x, y: y + 180, "text-anchor": "middle", class: "core-num", fill: c });
    big.textContent = String(opts.skills ?? n.skillCount); box.appendChild(big);
    const bl = el("text", { x: n.x, y: y + 202, "text-anchor": "middle", class: "sys-count" });
    bl.textContent = "SKILLS, ONE STANDARD"; box.appendChild(bl);

    ["Reads what the tools hold", "Writes only what a person approves", "Leaves every finding cited"].forEach((line, i) => {
      const t = el("text", { x: n.x, y: y + 254 + i * 22, "text-anchor": "middle", class: "core-line" });
      t.textContent = line; box.appendChild(t);
    });

    g.appendChild(box);
    return g;
  }

  function vaultCard(n) {
    const c = colour("vault");
    const x = n.x - n.w / 2, y = n.y - n.h / 2;
    const g = el("g", { class: "snode", "data-id": n.id, tabindex: "0", role: "button" });
    const tip = el("title", {}); tip.textContent = `${n.label} — ${n.note}`; g.appendChild(tip);
    const box = el("g", { class: "sbox" });
    box.appendChild(el("rect", { x, y, width: n.w, height: n.h, rx: 14, fill: "#131009", "fill-opacity": 0.85, stroke: c, "stroke-opacity": 0.5, "stroke-width": 1.4 }));
    box.appendChild(el("rect", { x, y, width: n.w, height: 3, rx: 1.5, fill: c }));

    const lab = el("text", { x: x + 26, y: y + 34, class: "core-title" }); lab.textContent = n.label;
    const nt = el("text", { x: x + 26, y: y + 54, class: "sys-note" }); nt.textContent = n.note;
    box.appendChild(lab); box.appendChild(nt);

    const line = el("text", { x: x + n.w - 26, y: y + 34, "text-anchor": "end", class: "core-line" });
    line.textContent = "Everything above compounds here, or it happened for one person once.";
    box.appendChild(line);
    const rt = el("text", { x: x + n.w - 26, y: y + 54, "text-anchor": "end", class: "sys-count" });
    rt.textContent = `${n.skillCount} SKILLS  ↔  READ AND WRITE`;
    box.appendChild(rt);

    g.appendChild(box);
    return g;
  }

  LIST.forEach((s) => {
    const n = by[s.id];
    gNodes.appendChild(s.band === "core" ? coreCard(n) : s.band === "vault" ? vaultCard(n) : card(n));
  });

  /* ---- ambient life ------------------------------------------------------
     One slow, dim particle per wire at rest. The map is a picture of something that is
     running whether or not anyone has the page open, and a still diagram says the opposite. */
  function particle(d, c, { r = 2.1, dur, opacity = 0.5, begin = "0s" }) {
    const dot = el("circle", { r, fill: c, class: "spart", "fill-opacity": opacity });
    const motion = el("animateMotion", { dur: dur + "s", repeatCount: "indefinite", path: d, begin });
    dot.appendChild(motion);
    return dot;
  }
  if (!reduce) {
    const amb = el("g", { id: "sysambient" });
    WIRES.forEach((w, i) => {
      const g = wireEls[w.from + ">" + w.to];
      amb.appendChild(particle(g._d, g._c, { dur: 5 + (i % 5) * 0.7, begin: `-${(i * 0.9).toFixed(1)}s` }));
    });
    svg.insertBefore(amb, gNodes);
    cleanups.push(() => amb.remove());
  }

  /* ---- legend / routes / footer ---- */
  root.querySelector("#syslegend").innerHTML =
    '<div class="lt">Reading the map</div><div class="row">' +
    Object.values(KINDS).map((v) => `<span class="k"><span class="dot" style="background:${v.colour}"></span>${esc(v.label)}</span>`).join("") +
    '</div><div class="row key"><span class="k">→ we only read it</span>' +
    '<span class="k">↔ we read and write it</span></div>';

  const getVar = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const routesBox = root.querySelector("#sysroutes");
  routesBox.innerHTML = "";
  ROUTES.forEach((r, i) => {
    const b = document.createElement("button");
    b.className = "flowbtn"; b.dataset.idx = String(i);
    b.style.setProperty("--accent-line", getVar(r.accent));
    b.innerHTML = `<span class="idx">0${i + 1}</span><span class="nm">${esc(r.name)}</span><span class="ct">${r.path.length}</span>`;
    on(b, "click", () => selectRoute(i));
    routesBox.appendChild(b);
  });

  const foot = root.querySelector("#sysfoot");
  if (foot) {
    const real = LIST.filter((s) => s.band !== "core").length;
    foot.innerHTML =
      `<span><b>${real}</b> systems</span><span><b>${WIRES.length}</b> data flows</span>` +
      `<span><b>${ROUTES.length}</b> routes</span>` +
      (opts.stamp ? `<span>GENERATED ${opts.stamp}</span>` : "");
  }

  /* ---- interaction ---- */
  const detail = root.querySelector("#sysdetail");
  const intro = detail.innerHTML;   // the overview copy the page ships with, kept to return to
  let route = -1;

  const clearParts = () => { const p = svg.querySelector("#sysparts"); if (p) p.innerHTML = ""; };
  function clearState() {
    svg.classList.remove("has-sel");
    root.querySelectorAll(".swire,.snode").forEach((e) => e.classList.remove("on", "hl"));
    clearParts();
  }
  const wireBetween = (a, b) => wireEls[a + ">" + b] || wireEls[b + ">" + a];

  function selectRoute(i) {
    clearState();
    route = i;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.toggle("on", +b.dataset.idx === i));
    const r = ROUTES[i];
    svg.classList.add("has-sel");
    r.path.forEach(([id]) => root.querySelector(`.snode[data-id="${id}"]`)?.classList.add("on"));
    for (let s = 0; s < r.path.length - 1; s++) {
      const g = wireBetween(r.path[s][0], r.path[s + 1][0]);
      if (!g) continue;
      g.classList.add("on");
      if (!reduce) {
        const parts = svg.querySelector("#sysparts");
        parts.appendChild(particle(g._d, g._c, { r: 3.2, dur: 1.7, opacity: 1 }));
        parts.appendChild(particle(g._d, g._c, { r: 1.9, dur: 1.7, opacity: 0.55, begin: "-0.28s" }));
      }
    }
    const ac = getVar(r.accent);
    detail.innerHTML =
      `<div class="shd">${esc(r.name)} · ${r.path.length} steps</div>` +
      r.path.map(([, label, text], s) =>
        `<div class="step"><div class="n" style="--sc:${ac}">${s + 1}</div>` +
        `<div><div class="b">${esc(label)}</div><div class="d">${esc(text)}</div></div></div>`).join("");
    detail.scrollTop = 0;
  }

  function selectSystem(id) {
    const n = by[id];
    if (!n) return;
    clearState();
    route = -1;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.remove("on"));
    svg.classList.add("has-sel");
    root.querySelector(`.snode[data-id="${id}"]`)?.classList.add("on");
    WIRES.forEach((w) => {
      if (w.from !== id && w.to !== id) return;
      wireEls[w.from + ">" + w.to]?.classList.add("on");
      const other = w.from === id ? w.to : w.from;
      root.querySelector(`.snode[data-id="${other}"]`)?.classList.add("on");
    });

    const c = colour(n.band);
    const list = (title, items) => items.length
      ? `<div class="sd-h">${title}</div><ul class="sd-l">${items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul>` : "";
    const skills = n.skills.length
      ? `<div class="sd-h">Skills that touch it · ${n.skills.length}</div>` +
        `<div class="sd-tags">${n.skills.map((s) => `<span>${esc(s)}</span>`).join("")}</div>`
      : `<div class="sd-h">What moves it</div><p class="sd-p">No skill talks to this one. It is moved by the nightly ingest and the vault's own sync, which run whether or not anyone opens Cowork.</p>`;

    detail.innerHTML =
      `<div class="shd">${esc(KINDS[n.band].label)}</div>` +
      `<div class="sd-t" style="--sc:${c}">${esc(n.label)}</div>` +
      `<div class="sd-meta"><span>${esc(n.cadence)}</span><span>${esc(n.access.toUpperCase())}</span></div>` +
      `<p class="sd-p">${esc(n.detail)}</p>` +
      list("What we read", n.reads) + list("What we write", n.writes) + skills +
      `<button class="sd-back" data-back>← Back to the routes</button>`;
    detail.scrollTop = 0;
    detail.querySelector("[data-back]")?.addEventListener("click", () => selectRoute(Math.max(route, 0)));
  }

  function hover(id, isOn) {
    if (!isOn) {
      root.querySelectorAll(".hl").forEach((e) => e.classList.remove("hl"));
      if (route < 0 && !root.querySelector(".snode.on")) svg.classList.remove("has-sel");
      return;
    }
    root.querySelector(`.snode[data-id="${id}"]`)?.classList.add("hl");
    WIRES.forEach((w) => {
      if (w.from !== id && w.to !== id) return;
      wireEls[w.from + ">" + w.to]?.classList.add("hl");
      const other = w.from === id ? w.to : w.from;
      root.querySelector(`.snode[data-id="${other}"]`)?.classList.add("hl");
    });
    if (route < 0 && !root.querySelector(".snode.on")) svg.classList.add("has-sel");
  }

  root.querySelectorAll(".snode").forEach((g) => {
    const id = g.getAttribute("data-id");
    on(g, "mouseenter", () => hover(id, true));
    on(g, "mouseleave", () => hover(id, false));
    on(g, "click", () => selectSystem(id));
    on(g, "keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectSystem(id); } });
  });

  const overview = root.querySelector("[data-overview]");
  if (overview) on(overview, "click", () => {
    clearState(); route = -1;
    root.querySelectorAll(".flowbtn").forEach((b) => b.classList.remove("on"));
    detail.innerHTML = intro;
  });

  /* ---- pan and zoom -------------------------------------------------------
     Same treatment as the lifecycle map: the canvas is wider than a phone, and shrinking it
     to fit makes it unreadable, so small screens get the real thing and a way to move around. */
  const view = { x: 0, y: 0, w: CANVAS_W, h: CANVAS_H };
  const MIN_W = CANVAS_W * 0.22, MAX_W = CANVAS_W;
  const apply = () => svg.setAttribute("viewBox", `${view.x} ${view.y} ${view.w} ${view.h}`);
  const clampView = () => {
    view.x = clamp(view.x, -40, CANVAS_W - view.w + 40);
    view.y = clamp(view.y, -40, CANVAS_H - view.h + 40);
  };
  function zoomTo(factor, cx, cy) {
    const w = clamp(view.w * factor, MIN_W, MAX_W);
    const ratio = w / view.w;
    view.x = cx - (cx - view.x) * ratio;
    view.y = cy - (cy - view.y) * ratio;
    view.w = w; view.h = CANVAS_H * (w / CANVAS_W);
    clampView(); apply();
  }
  const toUser = (cx, cy) => {
    const r = svg.getBoundingClientRect();
    return { x: view.x + ((cx - r.left) / r.width) * view.w, y: view.y + ((cy - r.top) / r.height) * view.h };
  };

  let userMoved = false;
  function defaultView() {
    if (userMoved) return;
    // The window, not the stage. At lg the sidebar sits beside the map and the stage is
    // always wide enough to fit; below it the sidebar drops underneath and the stage is a
    // strip, where a fitted 1,560px canvas would be unreadable. Measuring the stage instead
    // reads a laptop as a phone, because the sidebar has already taken 310px off it.
    const wide = window.innerWidth >= 1024;
    if (wide) { view.x = 0; view.y = 0; view.w = CANVAS_W; view.h = CANVAS_H; apply(); return; }
    view.w = CANVAS_W * 0.55; view.h = CANVAS_H * 0.55; view.x = 0; view.y = 60;
    clampView(); apply();
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
        zoomTo(clamp(pinchFrom.w * (pinchFrom.dist / dist), MIN_W, MAX_W) / view.w, mid.x, mid.y);
      }
      e.preventDefault();
      return;
    }
    if (dragFrom && view.w < CANVAS_W - 1) {
      userMoved = true;
      const now = toUser(e.clientX, e.clientY);
      view.x = dragFrom.x - (now.x - dragFrom.p.x);
      view.y = dragFrom.y - (now.y - dragFrom.p.y);
      clampView(); apply();
      e.preventDefault();
    }
  }, { passive: false });
  const release = (e) => { pointers.delete(e.pointerId); if (pointers.size < 2) pinchFrom = null; if (!pointers.size) dragFrom = null; };
  ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => on(svg, ev, release));

  root.querySelectorAll("[data-zoom]").forEach((btn) => {
    on(btn, "click", () => {
      const k = btn.getAttribute("data-zoom");
      if (k === "reset") { userMoved = false; defaultView(); return; }
      userMoved = true;
      zoomTo(k === "in" ? 0.72 : 1 / 0.72, view.x + view.w / 2, view.y + view.h / 2);
    });
  });

  /* Trace the first route shortly after mount, so the page arrives moving. */
  const timer = setTimeout(() => selectRoute(0), 1400);

  return {
    destroy() {
      clearTimeout(timer);
      cleanups.forEach((fn) => fn());
      svg.innerHTML = "";
    },
  };
}
