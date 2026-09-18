   (function () {
    "use strict";
  
    /* NAMING: events are lower_snake_case, object then verb. Parameters are
       lower_snake_case nouns. GTM triggers match these strings exactly, so
       renaming one here breaks the container silently. */
    var EVENT  = "chart_interact";
    var PARAMS = { ID: "chart_id", NAME: "chart_name" };
  
    var dl = (window.dataLayer = window.dataLayer || []);
    var fired = {};
  
    document.querySelectorAll("figure").forEach(function (fig) {
      var svg = fig.querySelector("svg.chart");
      if (!svg) return;
  
      fig.addEventListener("mouseenter", function () {
        /* Once per chart per page. Hover fires constantly otherwise, and the
           useful signal is "did they engage with this chart at all", not how
           many times the pointer crossed it. */
        if (fired[svg.id]) return;
        fired[svg.id] = true;
  
        var title = fig.querySelector(".figtitle");
        var payload = { event: EVENT };
        payload[PARAMS.ID]   = svg.id;
        payload[PARAMS.NAME] = title ? title.textContent.trim() : svg.id;
        dl.push(payload);
      });
    });
  })();