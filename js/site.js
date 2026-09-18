/* site.js — page behavior that has nothing to do with measurement.
   Keep analytics out of this file; it belongs in analytics.js.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  /* External links open in a new tab.
     Set here rather than per-link so a link added later is covered
     automatically. Internal anchors (#work, #cv) are left alone, and
     mailto:/tel: never match the href filter. */
  document.querySelectorAll('a[href^="http"]').forEach(function (a) {
    if (a.hostname !== window.location.hostname) {
      a.target = "_blank";
      a.rel = "noopener";
    }
  });
})();
