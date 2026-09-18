/* charts.js — every chart and the pipeline diagram.
   Chart DATA lives in each function as a plain array; change a number
   and the chart redraws. Colors come from CSS tokens via var(--...).
   ------------------------------------------------------------------ */
(function () {
  "use strict";
  var NS = "http://www.w3.org/2000/svg";
  function el(t, a) { var e = document.createElementNS(NS, t); for (var k in a) if (a[k] !== null) e.setAttribute(k, a[k]); return e; }
  function txt(x, y, s, o) {
    o = o || {};
    var t = el("text", { x: x, y: y, fill: o.fill || "var(--faint)", "font-size": o.size || 10.5,
      "font-family": o.family || "'JetBrains Mono', ui-monospace, monospace",
      "font-weight": o.weight || 400, "text-anchor": o.anchor || "start" });
    t.textContent = s; return t;
  }
  function hook(node, tip, box, px, py, html, W, H) {
    node.style.cursor = "pointer";
    node.addEventListener("mouseenter", function () {
      tip.innerHTML = html;
      var r = box.getBoundingClientRect();
      tip.style.left = (px / W * r.width) + "px";
      tip.style.top = (py / H * r.height) + "px";
      tip.classList.add("on");
    });
    node.addEventListener("mouseleave", function () { tip.classList.remove("on"); });
  }

  /* ── 1 · runtime line ─────────────────── */
  (function () {
    var svg = document.getElementById("c1"); if (!svg) return;
    var tip = document.getElementById("tip1"), box = svg.parentNode;
    var W = 540, H = 250, L = 46, R = 16, T = 16, B = 34;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var data = [372,341,408,286,355,423,318,196,14,11,9,12,9,8,9,9];
    var x = function (i) { return L + i / 15 * (W - L - R); };
    var y = function (v) { return T + (1 - v / 450) * (H - T - B); };
    [0,120,240,360].forEach(function (v) {
      svg.appendChild(el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: "var(--rule)", "stroke-width": 1 }));
      svg.appendChild(txt(L - 8, y(v) + 3.5, v, { anchor: "end" }));
    });
    svg.appendChild(txt(L - 8, y(450) - 6, "min", { anchor: "end" }));
    [0,3,7,11,15].forEach(function (i) { svg.appendChild(txt(x(i), H - B + 16, "w" + (i + 1), { anchor: "middle" })); });
    var ax = x(7.5);
    svg.appendChild(el("line", { x1: ax, x2: ax, y1: T, y2: H - B, stroke: "var(--s3)", "stroke-width": 1, "stroke-dasharray": "3 3" }));
    svg.appendChild(txt(ax + 6, T + 10, "automated", { fill: "var(--s3)" }));
    var d = data.map(function (v, i) { return (i ? "L" : "M") + x(i) + " " + y(v); }).join(" ");
    svg.appendChild(el("path", { d: d + " L" + x(15) + " " + y(0) + " L" + x(0) + " " + y(0) + " Z", fill: "var(--s1)", "fill-opacity": .1 }));
    svg.appendChild(el("path", { d: d, fill: "none", stroke: "var(--s1)", "stroke-width": 2, "stroke-linejoin": "round", "stroke-linecap": "round" }));
    svg.appendChild(el("circle", { cx: x(15), cy: y(9), r: 4, fill: "var(--s1)", stroke: "var(--panel)", "stroke-width": 2 }));
    svg.appendChild(txt(x(15) - 6, y(9) - 10, "9 min", { anchor: "end", fill: "var(--s1)", weight: 500, size: 11.5 }));
    svg.appendChild(txt(x(5), y(423) - 12, "6h 12m peak", { anchor: "middle", fill: "var(--muted)" }));
    data.forEach(function (v, i) {
      var h = el("circle", { cx: x(i), cy: y(v), r: 12, fill: "transparent" });
      var hh = Math.floor(v / 60), mm = v % 60;
      hook(h, tip, box, x(i), y(v), "Week " + (i + 1) + " &middot; " + (hh ? hh + "h " + mm + "m" : v + " min"), W, H);
      svg.appendChild(h);
    });
  })();

  /* ── 2 · quality bars ─────────────────── */
  (function () {
    var svg = document.getElementById("c2"); if (!svg) return;
    var tip = document.getElementById("tip2"), box = svg.parentNode;
    var W = 540, H = 250, L = 62, R = 46, T = 10, B = 28;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var names = ["Completeness","Validity","Freshness"], cols = ["var(--s1)","var(--s2)","var(--s3)"];
    var rows = [{ l: "Gold", v: [99.8,99.6,99.1] }, { l: "Silver", v: [98.4,96.2,97.8] }, { l: "Bronze", v: [94.1,81.5,99.4] }];
    var pW = W - L - R, pH = H - T - B, band = pH / 3, bh = 13, gap = 2;
    var x = function (v) { return L + (v - 75) / 25 * pW; };
    [75,85,95,100].forEach(function (v) {
      svg.appendChild(el("line", { x1: x(v), x2: x(v), y1: T, y2: T + pH, stroke: "var(--rule)", "stroke-width": 1 }));
      svg.appendChild(txt(x(v), T + pH + 16, v + "%", { anchor: "middle" }));
    });
    rows.forEach(function (row, ri) {
      var top = T + ri * band + (band - (bh * 3 + gap * 2)) / 2;
      svg.appendChild(txt(L - 10, top + (bh * 3 + gap * 2) / 2 + 4, row.l, { anchor: "end", fill: "var(--ink)", size: 11.5, weight: 500 }));
      row.v.forEach(function (v, si) {
        var by = top + si * (bh + gap), w = Math.max(x(v) - L, 2);
        var r = el("rect", { x: L, y: by, width: w, height: bh, rx: 3, fill: cols[si] });
        hook(r, tip, box, L + w, by, row.l + " &middot; " + names[si] + " &middot; " + v.toFixed(1) + "%", W, H);
        svg.appendChild(r);
        svg.appendChild(txt(L + w + 6, by + bh - 3, v.toFixed(1), { fill: "var(--muted)", size: 10 }));
      });
    });
    svg.appendChild(el("line", { x1: L, x2: L, y1: T, y2: T + pH, stroke: "var(--rule-hi)", "stroke-width": 1 }));
  })();

  /* ── 3 · Lorenz ───────────────────────── */
  (function () {
    var svg = document.getElementById("c3"); if (!svg) return;
    var tip = document.getElementById("tip3"), box = svg.parentNode;
    var W = 540, H = 270, L = 48, R = 18, T = 16, B = 40;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var cum = [0,0.1,0.3,0.6,1.2,2.4,5.1,10.3,20.6,41.4,70.8,100];
    var x = function (v) { return L + v / 100 * (W - L - R); };
    var y = function (v) { return T + (1 - v / 100) * (H - T - B); };
    [0,25,50,75,100].forEach(function (v) {
      svg.appendChild(el("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: "var(--rule)", "stroke-width": 1 }));
      svg.appendChild(txt(L - 8, y(v) + 3.5, v + "%", { anchor: "end" }));
      svg.appendChild(txt(x(v), H - B + 16, v + "%", { anchor: "middle" }));
    });
    svg.appendChild(txt(L, H - 6, "listings, least visible → most visible", { size: 10.5 }));
    svg.appendChild(txt(L - 8, y(100) - 8, "views", { anchor: "end" }));
    svg.appendChild(el("line", { x1: x(0), y1: y(0), x2: x(100), y2: y(100), stroke: "var(--rule-hi)", "stroke-width": 1.5, "stroke-dasharray": "4 4" }));
    svg.appendChild(txt(x(64), y(72), "even visibility", { anchor: "middle" }));
    var d = cum.map(function (c, i) { return (i ? "L" : "M") + x(i / 11 * 100) + " " + y(c); }).join(" ");
    svg.appendChild(el("path", { d: d + " L" + x(100) + " " + y(0) + " Z", fill: "var(--s1)", "fill-opacity": .12 }));
    svg.appendChild(el("path", { d: d, fill: "none", stroke: "var(--s1)", "stroke-width": 2, "stroke-linejoin": "round" }));
    svg.appendChild(el("line", { x1: x(50), x2: x(50), y1: y(1.2), y2: y(50), stroke: "var(--s3)", "stroke-width": 1, "stroke-dasharray": "3 3" }));
    svg.appendChild(el("circle", { cx: x(50), cy: y(1.2), r: 4, fill: "var(--s3)", stroke: "var(--panel)", "stroke-width": 2 }));
    svg.appendChild(txt(x(50) + 8, y(1.2) - 8, "bottom 50% = 1.2% of views", { fill: "var(--s3)" }));
    var g = el("g", {});
    g.appendChild(el("rect", { x: L + 8, y: T + 6, width: 96, height: 36, rx: 4, fill: "var(--panel)", stroke: "var(--rule)" }));
    g.appendChild(txt(L + 18, T + 22, "GINI", { size: 9.5 }));
    g.appendChild(txt(L + 18, T + 37, "0.71", { size: 16, fill: "var(--s1)", weight: 600, family: "'Fraunces', Georgia, serif" }));
    svg.appendChild(g);
    cum.forEach(function (c, i) {
      if (!i) return;
      var p = i / 11 * 100;
      var h = el("circle", { cx: x(p), cy: y(c), r: 11, fill: "transparent" });
      hook(h, tip, box, x(p), y(c), "Least-visible " + Math.round(p) + "% of listings<br>hold " + c.toFixed(1) + "% of views", W, H);
      svg.appendChild(h);
    });
  })();

  /* ── 4 · failure bars ─────────────────── */
  (function () {
    var svg = document.getElementById("c4"); if (!svg) return;
    var tip = document.getElementById("tip4"), box = svg.parentNode;
    var W = 540, H = 200, L = 132, R = 48, T = 12, B = 28;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var rows = [["Document upload",12.4],["Enterprise search",4.1],["Document analysis",2.8],["Chat",0.9]];
    var pW = W - L - R, pH = H - T - B, band = pH / 4, bh = 18;
    var x = function (v) { return L + v / 14 * pW; };
    [0,5,10].forEach(function (v) {
      svg.appendChild(el("line", { x1: x(v), x2: x(v), y1: T, y2: T + pH, stroke: "var(--rule)", "stroke-width": 1 }));
      svg.appendChild(txt(x(v), T + pH + 16, v + "%", { anchor: "middle" }));
    });
    rows.forEach(function (row, i) {
      var by = T + i * band + (band - bh) / 2, w = Math.max(x(row[1]) - L, 2);
      svg.appendChild(txt(L - 10, by + bh / 2 + 4, row[0], { anchor: "end", fill: "var(--ink)", size: 11.5 }));
      var r = el("rect", { x: L, y: by, width: w, height: bh, rx: 3, fill: i === 0 ? "var(--s3)" : "var(--s1)" });
      hook(r, tip, box, L + w, by, row[0] + " &middot; " + row[1] + "% of attempts", W, H);
      svg.appendChild(r);
      svg.appendChild(txt(L + w + 7, by + bh / 2 + 4, row[1] + "%", { fill: i === 0 ? "var(--s3)" : "var(--muted)", size: 11, weight: i === 0 ? 500 : 400 }));
    });
    svg.appendChild(el("line", { x1: L, x2: L, y1: T, y2: T + pH, stroke: "var(--rule-hi)", "stroke-width": 1 }));
  })();

  /* ── 5 · funnel ───────────────────────── */
  (function () {
    var svg = document.getElementById("c5"); if (!svg) return;
    var tip = document.getElementById("tip5"), box = svg.parentNode;
    var W = 540, H = 260, L = 108, R = 76, T = 16, B = 34;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var st = [["Sessions",2412000],["Requests sent",186400],["Received a quote",151300],["Paid job",41200]];
    var pW = W - L - R, bh = 32, gapY = 22;
    var lo = Math.log10(10000), hi = Math.log10(4000000);
    var x = function (v) { return L + (Math.log10(v) - lo) / (hi - lo) * pW; };
    function fmt(n) { return n >= 1e6 ? (n / 1e6).toFixed(2) + "M" : (n / 1e3).toFixed(1) + "k"; }
    var plotBottom = T + 4 * bh + 3 * gapY;
    [[10000,"10k"],[100000,"100k"],[1000000,"1M"]].forEach(function (t) {
      svg.appendChild(el("line", { x1: x(t[0]), x2: x(t[0]), y1: T, y2: plotBottom, stroke: "var(--rule)", "stroke-width": 1 }));
      svg.appendChild(txt(x(t[0]), plotBottom + 16, t[1], { anchor: "middle" }));
    });
    var shades = ["var(--q3)","var(--q4)","var(--q5)","var(--q6)"];
    st.forEach(function (s2, i) {
      var y0 = T + i * (bh + gapY);
      var w = Math.max(x(s2[1]) - L, 3);
      svg.appendChild(txt(L - 12, y0 + bh / 2 + 4, s2[0], { anchor: "end", fill: "var(--ink)", size: 11.5 }));
      var r = el("rect", { x: L, y: y0, width: w, height: bh, rx: 4, fill: shades[i] });
      hook(r, tip, box, L + w, y0, s2[0] + " &middot; " + s2[1].toLocaleString("en-GB"), W, H);
      svg.appendChild(r);
      svg.appendChild(txt(L + w + 9, y0 + bh / 2 + 4, fmt(s2[1]), { fill: "var(--ink)", size: 12, weight: 500 }));
      if (i < st.length - 1) {
        var pct = st[i + 1][1] / s2[1] * 100;
        svg.appendChild(txt(L + 4, y0 + bh + gapY / 2 + 4, "\u2193 " + pct.toFixed(1) + "%",
          { fill: pct < 10 ? "var(--s3)" : "var(--muted)", size: 10.5 }));
      }
    });
    svg.appendChild(el("line", { x1: L, x2: L, y1: T, y2: plotBottom, stroke: "var(--rule-hi)", "stroke-width": 1 }));
    svg.appendChild(txt(L, H - 4, "log scale; the drop spans two orders of magnitude", { size: 9.5 }));
  })();

  /* ── 6 · cohort heatmap ───────────────── */
  (function () {
    var svg = document.getElementById("c6"); if (!svg) return;
    var tip = document.getElementById("tip6"), box = svg.parentNode;
    var W = 540, H = 260, L = 64, T = 30;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var cohorts = ["Jan","Feb","Mar","Apr","May","Jun"];
    var data = [
      [100,48,36,30,27,25],[100,51,38,32,29,null],[100,46,34,29,null,null],
      [100,55,42,null,null,null],[100,58,null,null,null,null],[100,61,null,null,null,null]
    ];
    var cw = (W - L - 16) / 6, ch = 30, gap = 3;
    function shade(v) {
      if (v === null) return "transparent";
      if (v >= 90) return "var(--q6)"; if (v >= 55) return "var(--q5)";
      if (v >= 45) return "var(--q4)"; if (v >= 33) return "var(--q3)";
      if (v >= 27) return "var(--q2)"; return "var(--q1)";
    }
    for (var m = 0; m < 6; m++) svg.appendChild(txt(L + m * cw + cw / 2, T - 10, "M" + m, { anchor: "middle" }));
    data.forEach(function (row, ri) {
      svg.appendChild(txt(L - 10, T + ri * ch + ch / 2 + 4, cohorts[ri], { anchor: "end", fill: "var(--ink)", size: 11 }));
      row.forEach(function (v, ci) {
        if (v === null) {
          svg.appendChild(el("rect", { x: L + ci * cw, y: T + ri * ch, width: cw - gap, height: ch - gap, rx: 3,
            fill: "none", stroke: "var(--rule)", "stroke-width": 1, "stroke-dasharray": "2 3" }));
          return;
        }
        var r = el("rect", { x: L + ci * cw, y: T + ri * ch, width: cw - gap, height: ch - gap, rx: 3, fill: shade(v) });
        hook(r, tip, box, L + ci * cw + cw / 2, T + ri * ch, cohorts[ri] + " cohort &middot; month " + ci + " &middot; " + v + "%", W, H);
        svg.appendChild(r);
        svg.appendChild(txt(L + ci * cw + (cw - gap) / 2, T + ri * ch + ch / 2 + 4, v,
          { anchor: "middle", size: 10.5, fill: v >= 45 ? "var(--panel)" : "var(--muted)", weight: 500 }));
      });
    });
    var ly = T + 6 * ch + 18;
    svg.appendChild(txt(L - 10, ly + 9, "less", { anchor: "end", size: 9.5 }));
    ["var(--q1)","var(--q2)","var(--q3)","var(--q4)","var(--q5)","var(--q6)"].forEach(function (c, i) {
      svg.appendChild(el("rect", { x: L + i * 22, y: ly, width: 19, height: 11, rx: 2, fill: c }));
    });
    svg.appendChild(txt(L + 6 * 22 + 4, ly + 9, "more retained", { size: 9.5 }));
  })();

  /* ── 7 · diverging ────────────────────── */
  (function () {
    var svg = document.getElementById("c7"); if (!svg) return;
    var tip = document.getElementById("tip7"), box = svg.parentNode;
    var W = 540, H = 260, L = 92, R = 52, T = 22, B = 26;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var rows = [["Barcelona",9.4],["Madrid",6.1],["Valencia",2.8],["Alicante",0.7],
                ["Málaga",-1.9],["Murcia",-4.6],["Almería",-8.2],["Bilbao",-12.5]];
    var pW = W - L - R, pH = H - T - B, band = pH / 8, bh = 15, lim = 14;
    var x = function (v) { return L + (v + lim) / (lim * 2) * pW; };
    var zero = x(0);
    [-10,-5,0,5,10].forEach(function (v) {
      svg.appendChild(el("line", { x1: x(v), x2: x(v), y1: T, y2: T + pH,
        stroke: v === 0 ? "var(--rule-hi)" : "var(--rule)", "stroke-width": v === 0 ? 1.5 : 1 }));
      svg.appendChild(txt(x(v), T + pH + 16, (v > 0 ? "+" : "") + v, { anchor: "middle" }));
    });
    svg.appendChild(txt(zero, T - 8, "80% target", { anchor: "middle", fill: "var(--muted)", size: 10 }));
    rows.forEach(function (row, i) {
      var v = row[1], y0 = T + i * band + (band - bh) / 2;
      var x0 = v >= 0 ? zero : x(v), w = Math.abs(x(v) - zero);
      svg.appendChild(txt(L - 12, y0 + bh / 2 + 4, row[0], { anchor: "end", fill: "var(--ink)", size: 11 }));
      var r = el("rect", { x: x0, y: y0, width: Math.max(w, 2), height: bh, rx: 2.5,
        fill: v >= 0 ? "var(--d5)" : "var(--d1)" });
      hook(r, tip, box, v >= 0 ? x0 + w : x0, y0, row[0] + " &middot; " + (v > 0 ? "+" : "") + v + " pts vs target", W, H);
      svg.appendChild(r);
      svg.appendChild(txt(W - 10, y0 + bh / 2 + 4, (v > 0 ? "+" : "") + v,
        { anchor: "end", fill: v >= 0 ? "var(--d5)" : "var(--d1)", size: 10.5, weight: 500 }));
    });
  })();

  /* ── 8 · small multiples ──────────────── */
  (function () {
    var svg = document.getElementById("c8"); if (!svg) return;
    var W = 540, H = 300;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var mk = [
      ["Barcelona",[100,108,117,126,138,149,161]],["Madrid",[100,104,111,118,124,133,141]],
      ["Valencia",[100,103,105,110,114,119,126]],["Alicante",[100,99,102,104,107,111,115]],
      ["Málaga",[100,106,109,113,119,124,130]],["Murcia",[100,97,95,96,94,92,91]],
      ["Almería",[100,101,100,102,101,103,104]],["Bilbao",[100,112,128,141,157,172,188]]
    ];
    var cols = 4, cw = W / cols, chh = H / 2, pad = 10, top = 26;
    mk.forEach(function (m, i) {
      var cx = (i % cols) * cw, cy = Math.floor(i / cols) * chh;
      var pw = cw - pad * 2, ph = chh - top - 34;
      var vals = m[1], lo = 85, hi = 195;
      var x = function (j) { return cx + pad + j / (vals.length - 1) * pw; };
      var y = function (v) { return cy + top + (1 - (v - lo) / (hi - lo)) * ph; };
      svg.appendChild(txt(cx + pad, cy + 14, m[0], { fill: "var(--ink)", size: 10.5 }));
      svg.appendChild(el("line", { x1: cx + pad, x2: cx + pad + pw, y1: y(100), y2: y(100),
        stroke: "var(--rule-hi)", "stroke-width": 1, "stroke-dasharray": "2 3" }));
      var last = vals[vals.length - 1];
      var up = last >= 100;
      var d = vals.map(function (v, j) { return (j ? "L" : "M") + x(j) + " " + y(v); }).join(" ");
      svg.appendChild(el("path", { d: d, fill: "none", stroke: up ? "var(--s1)" : "var(--s3)",
        "stroke-width": 1.8, "stroke-linejoin": "round", "stroke-linecap": "round" }));
      svg.appendChild(el("circle", { cx: x(vals.length - 1), cy: y(last), r: 3, fill: up ? "var(--s1)" : "var(--s3)" }));
      svg.appendChild(txt(cx + pad, cy + top + ph + 17, (last >= 100 ? "+" : "") + (last - 100) + "%",
        { fill: up ? "var(--s1)" : "var(--s3)", size: 10.5, weight: 500 }));
    });
  })();

  /* ── pipeline diagram ─────────────────── */
  (function () {
    var svg = document.getElementById("pipe"); if (!svg) return;
    var W = 880, H = 230;
    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    var stages = [
      { t: "Sources", s: "Jira · APIs\nexports · apps", x: 10 },
      { t: "Ingest", s: "scheduled\nidempotent", x: 152 },
      { t: "Bronze", s: "raw, kept\nas received", x: 294 },
      { t: "Silver", s: "typed, cleaned\ndeduplicated", x: 436 },
      { t: "Gold", s: "modeled for\nreporting", x: 578 },
      { t: "Reports", s: "Power BI\nsemantic model", x: 720 }
    ];
    var bw = 130, bh = 74, by = 58;
    stages.forEach(function (st, i) {
      var isL = i >= 2 && i <= 4;
      svg.appendChild(el("rect", { x: st.x, y: by, width: bw, height: bh, rx: 5,
        fill: isL ? "var(--wash)" : "var(--sunk)", stroke: isL ? "var(--s1)" : "var(--rule-hi)", "stroke-width": 1 }));
      svg.appendChild(txt(st.x + bw / 2, by + 27, st.t, { anchor: "middle", fill: isL ? "var(--s1)" : "var(--ink)",
        size: 14, weight: 600, family: "'Fraunces', Georgia, serif" }));
      st.s.split("\n").forEach(function (line, li) {
        svg.appendChild(txt(st.x + bw / 2, by + 45 + li * 13, line, { anchor: "middle", size: 9.5 }));
      });
      if (i < stages.length - 1) {
        var ax = st.x + bw + 2, bx = stages[i + 1].x - 2, my = by + bh / 2;
        svg.appendChild(el("line", { x1: ax, x2: bx - 6, y1: my, y2: my, stroke: "var(--rule-hi)", "stroke-width": 1.5 }));
        svg.appendChild(el("path", { d: "M" + (bx - 6) + " " + (my - 4) + " L" + bx + " " + my + " L" + (bx - 6) + " " + (my + 4) + " Z", fill: "var(--rule-hi)" }));
        if (i >= 1 && i <= 4) {
          var gx = (ax + bx) / 2;
          svg.appendChild(el("circle", { cx: gx, cy: my, r: 8, fill: "var(--panel)", stroke: "var(--s3)", "stroke-width": 1.5 }));
          svg.appendChild(el("path", { d: "M" + (gx - 3.2) + " " + my + " l2.4 2.6 l4.2 -5", fill: "none",
            stroke: "var(--s3)", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
        }
      }
    });
    svg.appendChild(txt(10, 30, "SCHEDULED AT EVERY STEP, CHECKED AT EVERY HANDOFF", { size: 10 }));
    svg.appendChild(el("circle", { cx: 18, cy: 186, r: 8, fill: "var(--panel)", stroke: "var(--s3)", "stroke-width": 1.5 }));
    svg.appendChild(el("path", { d: "M14.8 186 l2.4 2.6 l4.2 -5", fill: "none", stroke: "var(--s3)", "stroke-width": 1.6, "stroke-linecap": "round", "stroke-linejoin": "round" }));
    svg.appendChild(txt(34, 190, "Quality gate — row counts, schema, nulls, freshness. A failed gate stops the run and alerts; it does not pass bad data downstream.",
      { size: 10.5, fill: "var(--muted)" }));
  })();
})();
