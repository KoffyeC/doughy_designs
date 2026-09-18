/* ==========================================================================
   main.js
   Shared behaviour for every page: mobile navigation, the cookie-count pill
   in the header, and the footer year.
   ========================================================================== */

(function () {
  "use strict";

  /* ------------------------------------------------------- mobile nav ---- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");

  function isMobile() {
    return window.matchMedia("(max-width: 720px)").matches;
  }

  function setNavVisible(visible) {
    if (!nav || !toggle) return;
    nav.hidden = !visible;
    toggle.setAttribute("aria-expanded", visible ? "true" : "false");
  }

  function syncNav() {
    if (!nav) return;
    if (isMobile()) {
      setNavVisible(false);
    } else {
      nav.hidden = false;
      if (toggle) toggle.setAttribute("aria-expanded", "false");
    }
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      setNavVisible(nav.hidden);
    });
    window.addEventListener("resize", syncNav);
    syncNav();
  }

  /* --------------------------------------------- cookie count in header -- */
  function updateCartPills() {
    var order = window.OrderState ? window.OrderState.load() : null;
    var count = order && order.designType ? Number(order.quantity) || 0 : 0;
    document.querySelectorAll("[data-cart-count]").forEach(function (el) {
      el.textContent = "Cart • " + count;
    });
  }

  updateCartPills();
  document.addEventListener("order:changed", updateCartPills);

  /* ------------------------------------------------------- footer year --- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
