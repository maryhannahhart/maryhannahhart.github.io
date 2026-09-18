/* analytics.js — the only events the page pushes itself.
   ------------------------------------------------------------------
   Deliberately small. GTM handles clicks, scroll depth and page views
   from the DOM, so hard-coding them here would duplicate work and mean
   a code deploy every time a trigger needs changing.

   What stays here: chart interaction. GTM has no hover trigger, and
   "which chart did they look at" needs the figure's own title, so this
   is the one thing the page is better placed to report than the
   container.

   Handled in GTM instead — don't re-add them here:
     page views      → the Google Tag on Initialization / All Pages
     scroll depth    → built-in Scroll Depth trigger (25/50/75/100)
     button clicks   → Click trigger on {{Click ID}} / data-btn-location
     outbound links  → Just Links trigger, Click URL doesn't contain host
     nav clicks      → Just Links trigger, Click URL contains "#"
     consent state   → pushed by js/consent.js
   ------------------------------------------------------------------ */
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
