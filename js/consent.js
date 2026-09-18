/* consent.js — the consent banner.
   The Consent Mode v2 DEFAULTS are not here. They must execute before the
   GTM snippet, so they live inline in index.html <head>. This file only
   handles the banner UI and the update call after a visitor chooses.
   ------------------------------------------------------------------ */
(function () {
  "use strict";

  var KEY = "mhh_consent";          // must match the inline block in index.html
  var bar = document.getElementById("consent-bar");
  if (!bar) return;

  function read()  { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function write(v){ try { localStorage.setItem(KEY, v); }    catch (e) {} }

  function show() {
    bar.hidden = false;
    /* Move focus to the banner so keyboard and screen-reader users meet the
       choice rather than tabbing past it. */
    var first = bar.querySelector("button");
    if (first) first.focus({ preventScroll: true });
  }

  function decide(state) {
    write(state);
    if (state === "granted" && typeof window.gtag === "function") {
      window.gtag("consent", "update", { analytics_storage: "granted" });
    }
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: "consent_update", consent_state: state });
    bar.hidden = true;
  }

  document.getElementById("consent-accept")
          .addEventListener("click", function () { decide("granted"); });
  document.getElementById("consent-decline")
          .addEventListener("click", function () { decide("denied"); });

  /* Withdrawing consent has to be as easy as giving it, so the footer link
     clears the stored choice and brings the banner back. */
  var reopen = document.getElementById("consent-reopen");
  if (reopen) {
    reopen.addEventListener("click", function (ev) {
      ev.preventDefault();
      try { localStorage.removeItem(KEY); } catch (e) {}
      show();
    });
  }

  if (!read()) show();
})();
