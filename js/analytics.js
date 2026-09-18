/* analytics.js — the only events the page pushes itself.
   ------------------------------------------------------------------
   GTM handles clicks, scroll depth and page views from the DOM.
   This file exists for chart interaction only: GTM has no hover
   trigger, and the event needs the figure's own visible title.
   ------------------------------------------------------------------ */
   (function () {
    "use strict";
  
    var EVENT  = "chart_interact";
    var PARAMS = { ID: "chart_id", NAME: "chart_name" };
    var DWELL  = 500;   // ms the pointer must rest on a chart
  
    var dl = (window.dataLayer = window.dataLayer || []);
    var fired = {};
  
    /* Devices without a real pointer never "hover" — a tap would otherwise
       register as one. */
    if (window.matchMedia && !window.matchMedia("(hover: hover)").matches) return;
  
    /* mouseenter also fires when an element moves UNDER a stationary cursor,
       which happens on page load and on every scroll. Requiring one genuine
       pointer movement first filters those out. */
    var pointerMoved = false;
    window.addEventListener("mousemove", function onMove() {
      pointerMoved = true;
      window.removeEventListener("mousemove", onMove);
    }, { passive: true });
  
    document.querySelectorAll("figure").forEach(function (fig) {
      var svg = fig.querySelector("svg.chart");
      if (!svg) return;
      var timer = null;
  
      fig.addEventListener("mouseenter", function () {
        if (fired[svg.id] || !pointerMoved) return;
        /* Dwell: passing the cursor across a chart on the way somewhere else
           is not engagement. */
        timer = setTimeout(function () {
          if (fired[svg.id]) return;
          fired[svg.id] = true;
  
          var title = fig.querySelector(".figtitle");
          var payload = { event: EVENT };
          payload[PARAMS.ID]   = svg.id;
          payload[PARAMS.NAME] = title ? title.textContent.trim() : svg.id;
          dl.push(payload);
        }, DWELL);
      });
  
      fig.addEventListener("mouseleave", function () {
        clearTimeout(timer);
      });
    });
  })();