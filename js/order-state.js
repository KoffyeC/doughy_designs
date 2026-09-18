/* ==========================================================================
   order-state.js
   The single hand-off point between steps of the ordering process.

   Developer 1 writes: design type, selected pre-made design, quantity and the
   customer's contact/shipping details. Developer 2 reads this object on the
   customize / review / confirmation steps and adds the fields it owns
   (custom writing text, uploaded image, image placement, order number).

   Stored in sessionStorage so nothing needs a server and nothing outlives the
   customer's browser session.
   ========================================================================== */

(function (global) {
  "use strict";

  var KEY = "doughyDesigns.order";

  /* Standard and bulk pricing from the project brief.
     Index 0 = 1-11 cookies, 1 = 12-23 cookies, 2 = 24+ cookies. */
  var PRICING = {
    premade: [2.0, 1.75, 1.5],
    writing: [2.5, 2.25, 2.0],
    image: [3.0, 2.75, 2.5],
  };

  var TYPE_LABELS = {
    premade: "Pre-made design",
    writing: "Custom writing",
    image: "Custom image",
  };

  var BASE_PRICES = { premade: 2.0, writing: 2.5, image: 3.0 };

  function emptyOrder() {
    return {
      designType: null, // "premade" | "writing" | "image"
      design: null, // { id, name, price, category, art } for pre-made
      quantity: 1,
      customer: {
        fullName: "",
        phone: "",
        email: "",
        address: "",
        city: "",
        state: "",
        zip: "",
      },
      pricing: null, // filled in when the customer details step is completed
    };
  }

  function load() {
    var order = emptyOrder();
    try {
      var raw = global.sessionStorage.getItem(KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === "object") {
          order.designType = saved.designType || null;
          order.design = saved.design || null;
          order.quantity = Number(saved.quantity) > 0 ? Number(saved.quantity) : 1;
          if (saved.customer) {
            Object.keys(order.customer).forEach(function (k) {
              if (typeof saved.customer[k] === "string") {
                order.customer[k] = saved.customer[k];
              }
            });
          }
          order.pricing = saved.pricing || null;
          /* keep any fields Developer 2 adds later (writing text, image, etc.) */
          Object.keys(saved).forEach(function (k) {
            if (!(k in order)) order[k] = saved[k];
          });
        }
      }
    } catch (err) {
      /* storage blocked or corrupt - fall back to a fresh order */
    }
    return order;
  }

  function save(patch) {
    var order = load();
    Object.keys(patch || {}).forEach(function (k) {
      if (k === "customer") {
        order.customer = Object.assign({}, order.customer, patch.customer);
      } else {
        order[k] = patch[k];
      }
    });
    try {
      global.sessionStorage.setItem(KEY, JSON.stringify(order));
    } catch (err) {
      /* nothing we can do without storage; the page still works in-session */
    }
    return order;
  }

  function clear() {
    try {
      global.sessionStorage.removeItem(KEY);
    } catch (err) {}
  }

  function tierIndex(quantity) {
    var q = Number(quantity) || 0;
    if (q >= 24) return 2;
    if (q >= 12) return 1;
    return 0;
  }

  function unitPrice(designType, quantity) {
    var table = PRICING[designType];
    if (!table) return 0;
    return table[tierIndex(quantity)];
  }

  /** Full price breakdown. Shipping is always free. */
  function priceOrder(designType, quantity) {
    var qty = Number(quantity) || 0;
    var unit = unitPrice(designType, qty);
    var subtotal = Math.round(unit * qty * 100) / 100;
    return {
      designType: designType,
      quantity: qty,
      unitPrice: unit,
      subtotal: subtotal,
      shipping: 0,
      total: subtotal,
    };
  }

  function money(value) {
    return "$" + (Number(value) || 0).toFixed(2);
  }

  function typeLabel(designType) {
    return TYPE_LABELS[designType] || "";
  }

  global.OrderState = {
    KEY: KEY,
    PRICING: PRICING,
    BASE_PRICES: BASE_PRICES,
    TYPE_LABELS: TYPE_LABELS,
    emptyOrder: emptyOrder,
    load: load,
    save: save,
    clear: clear,
    unitPrice: unitPrice,
    priceOrder: priceOrder,
    money: money,
    typeLabel: typeLabel,
  };
})(window);
