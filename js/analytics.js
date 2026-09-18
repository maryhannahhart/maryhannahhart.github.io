/* analytics.js — the measurement layer.
   Everything pushed to the dataLayer is named here and nowhere else.
   Tags, triggers and variables are built in the GTM UI against these
   names, so renaming anything below breaks the container. Treat the
   EVENTS and PARAMS objects as the contract.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* ── NAMING CONVENTION ───────────────────────────────────────────
     Events : lower_snake_case, object_verb, past tense where natural
              ("resume_requested" not "clickResumeBtn").
     Params : lower_snake_case nouns. Reuse an existing param before
              inventing one — every new param costs a custom dimension
              registration in GA4.
     Never  : no PII, no email addresses, no free text a visitor typed.
     ---------------------------------------------------------------- */

  var EVENTS = {
    PAGE_READY:    "portfolio_ready",
    SECTION_VIEW:  "section_view",
    CHART_INTERACT:"chart_interact",
    SCROLL_DEPTH:  "scroll_depth",
    CTA_CLICK:     "cta_click",
    OUTBOUND:      "outbound_click",
    NAV_CLICK:     "nav_click"
  };

  var PARAMS = {
    SECTION:   "section_name",
    CHART_ID:  "chart_id",
    CHART_NAME:"chart_name",
    PERCENT:   "percent_scrolled",
    CTA_ID:    "cta_id",         // the element's id attribute
    LOCATION:  "btn_location",   // from data-btn-location
    LINK_URL:  "link_url",
    LINK_HOST: "link_domain",
    LINK_TEXT: "link_text",
    SCHEME:    "color_scheme",
    VIEWPORT:  "viewport_bucket"
  };

  var dl = (window.dataLayer = window.dataLayer || []);

  function push(event, params) {
    var payload = { event: event };
    if (params) for (var k in params) if (params[k] !== undefined) payload[k] = params[k];
    dl.push(payload);
  }

  /* ── context, once per page ─────────────────────────────────── */
  var prefersDark = window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches;
  var ctx = {};
  ctx[PARAMS.SCHEME]   = document.documentElement.getAttribute("data-theme") ||
                         (prefersDark ? "dark" : "light");
  ctx[PARAMS.VIEWPORT] = window.innerWidth < 760 ? "mobile"
                       : window.innerWidth < 1100 ? "tablet" : "desktop";
  push(EVENTS.PAGE_READY, ctx);

  /* ── which sections get read ────────────────────────────────── */
  var seen = {};
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting || seen[en.target.id]) return;
        seen[en.target.id] = true;
        var p = {}; p[PARAMS.SECTION] = en.target.id;
        push(EVENTS.SECTION_VIEW, p);
      });
    }, { threshold: 0, rootMargin: "-30% 0px -30% 0px" });
    /* A tall section never reaches a high threshold ratio, which is why
       this uses a middle-band rootMargin instead of threshold: 0.4. */
    document.querySelectorAll("section[id], footer[id]").forEach(function (n) { io.observe(n); });
  }

  /* ── charts: first hover each ───────────────────────────────── */
  var charted = {};
  document.querySelectorAll("figure").forEach(function (fig) {
    var svg = fig.querySelector("svg.chart");
    if (!svg) return;
    fig.addEventListener("mouseenter", function () {
      if (charted[svg.id]) return;
      charted[svg.id] = true;
      var t = fig.querySelector(".figtitle");
      var p = {};
      p[PARAMS.CHART_ID]   = svg.id;
      p[PARAMS.CHART_NAME] = t ? t.textContent.trim() : svg.id;
      push(EVENTS.CHART_INTERACT, p);
    });
  });

  /* ── scroll depth ───────────────────────────────────────────── */
  var marks = [25, 50, 75, 100], hit = {}, queued = false;
  function measure() {
    var h = document.documentElement;
    var max = h.scrollHeight - h.clientHeight;
    var pct = max > 0 ? (h.scrollTop / max) * 100 : 100;
    marks.forEach(function (m) {
      if (pct >= m && !hit[m]) {
        hit[m] = true;
        var p = {}; p[PARAMS.PERCENT] = m;
        push(EVENTS.SCROLL_DEPTH, p);
      }
    });
    queued = false;
  }
  window.addEventListener("scroll", function () {
    if (!queued) { queued = true; window.requestAnimationFrame(measure); }
  }, { passive: true });
  measure();

  /* ── clicks ─────────────────────────────────────────────────── */
  document.addEventListener("click", function (ev) {
    var a = ev.target.closest && ev.target.closest("a");
    if (!a) return;

    /* .closest() matters: the click target is often a child of the link,
       so reading attributes off ev.target alone misses roughly half of
       real clicks. */
    var href = a.getAttribute("href") || "";
    var p = {};
    p[PARAMS.CTA_ID]    = a.id || undefined;
    p[PARAMS.LOCATION]  = a.getAttribute("data-btn-location") || undefined;
    p[PARAMS.LINK_TEXT] = (a.textContent || "").trim().slice(0, 60);

    if (href.charAt(0) === "#") {
      push(EVENTS.NAV_CLICK, p);
    } else if (/^https?:/i.test(href) && a.hostname !== window.location.hostname) {
      p[PARAMS.LINK_URL]  = a.href;
      p[PARAMS.LINK_HOST] = a.hostname;
      push(EVENTS.OUTBOUND, p);
    } else {
      push(EVENTS.CTA_CLICK, p);
    }
  });
})();
