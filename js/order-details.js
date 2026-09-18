/* ==========================================================================
   order-details.js
   Order details step: quantity + the customer's contact and shipping
   information, validated, then handed to the review/checkout step.

   Developer 1 ends here. This file never touches payment, order numbers or
   confirmation - those belong to Developer 2.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("order-form");
  if (!form) return;

  var NEXT_STEP = "review.html"; // built by Developer 2

  var fields = {
    fullName: document.getElementById("full-name"),
    phone: document.getElementById("phone"),
    email: document.getElementById("email"),
    address: document.getElementById("address"),
    city: document.getElementById("city"),
    state: document.getElementById("state"),
    zip: document.getElementById("zip"),
  };
  var quantityInput = document.getElementById("quantity");

  var alertBox = document.getElementById("order-alert");
  var noDesignNotice = document.getElementById("no-design-notice");
  var summaryType = document.getElementById("summary-type");
  var summaryLine = document.getElementById("summary-line");
  var summaryTotal = document.getElementById("summary-total");
  var summaryDesign = document.getElementById("summary-design");

  /* ------------------------------------------------- restore saved work -- */
  var order = OrderState.load();

  Object.keys(fields).forEach(function (key) {
    if (fields[key] && order.customer[key]) {
      fields[key].value = order.customer[key];
    }
  });
  quantityInput.value = order.quantity > 0 ? order.quantity : 1;

  /* Save as the customer types so switching pages never loses their entries. */
  function persistCustomer() {
    var customer = {};
    Object.keys(fields).forEach(function (key) {
      customer[key] = fields[key] ? fields[key].value : "";
    });
    OrderState.save({ customer: customer });
  }

  var inputs = Object.keys(fields).map(function (k) {
    return fields[k];
  });
  FormUtils.clearOnInput(inputs);
  inputs.forEach(function (input) {
    input.addEventListener("change", persistCustomer);
    input.addEventListener("blur", persistCustomer);
  });

  /* ------------------------------------------------------------ summary -- */
  function currentQuantity() {
    var n = parseInt(quantityInput.value, 10);
    return isNaN(n) ? 0 : n;
  }

  function renderSummary() {
    var state = OrderState.load();
    var qty = currentQuantity();

    if (!state.designType) {
      noDesignNotice.hidden = false;
      summaryType.textContent = "No design chosen yet";
      summaryLine.textContent = "Choose a design to see your price.";
      summaryTotal.textContent = OrderState.money(0);
      if (summaryDesign) summaryDesign.hidden = true;
      return;
    }

    noDesignNotice.hidden = true;
    var price = OrderState.priceOrder(state.designType, qty > 0 ? qty : 0);

    summaryType.textContent = OrderState.typeLabel(state.designType);
    summaryLine.textContent =
      (qty > 0 ? qty : 0) +
      (qty === 1 ? " cookie × " : " cookies × ") +
      OrderState.money(price.unitPrice);
    summaryTotal.textContent = OrderState.money(price.total);

    if (summaryDesign) {
      if (state.designType === "premade" && state.design) {
        summaryDesign.textContent = "Design: " + state.design.name;
        summaryDesign.hidden = false;
      } else if (state.designType === "writing" && state.writingText) {
        summaryDesign.textContent = "Message: “" + state.writingText + "”";
        summaryDesign.hidden = false;
      } else if (state.designType === "image" && state.customImage) {
        summaryDesign.textContent = "Image: " + state.customImage.name;
        summaryDesign.hidden = false;
      } else {
        summaryDesign.hidden = true;
      }
    }
  }

  /* ---------------------------------------------------------- quantity --- */
  function setQuantity(next) {
    var value = Math.max(1, Math.floor(Number(next) || 1));
    quantityInput.value = value;
    FormUtils.clearError(quantityInput);
    OrderState.save({ quantity: value });
    document.dispatchEvent(new CustomEvent("order:changed"));
    renderSummary();
  }

  document.querySelectorAll("[data-qty-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      var step = parseInt(button.getAttribute("data-qty-step"), 10);
      setQuantity(currentQuantity() + step);
    });
  });

  quantityInput.addEventListener("input", function () {
    FormUtils.clearError(quantityInput);
    renderSummary();
  });

  quantityInput.addEventListener("change", function () {
    var n = currentQuantity();
    if (n >= 1) setQuantity(n);
  });

  /* ---------------------------------------------------------- validation -- */
  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var state = OrderState.load();
    var problems = [];

    /* An order cannot be created without a design selection. */
    if (!state.designType) {
      problems.push("Choose a design before placing your order.");
      noDesignNotice.hidden = false;
    }
    if (state.designType === "premade" && !state.design) {
      problems.push("Choose a pre-made design before placing your order.");
    }
    if (state.designType === "writing" && !(state.writingText || "").trim()) {
      problems.push("Enter your custom cookie message before placing your order.");
    }
    if (state.designType === "image" && !state.customImage) {
      problems.push("Upload a custom image before placing your order.");
    }

    problems = problems.concat(
      FormUtils.validate([
        {
          input: fields.fullName,
          test: FormUtils.isFilled,
          message: "Please enter your full name.",
        },
        {
          input: fields.phone,
          test: FormUtils.isFilled,
          message: "Please enter your phone number.",
        },
        {
          input: fields.phone,
          test: function (v) {
            return !FormUtils.isFilled(v) || FormUtils.isPhone(v);
          },
          message: "Please enter a valid phone number, like 555-0100.",
        },
        {
          input: fields.email,
          test: FormUtils.isFilled,
          message: "Please enter your email address.",
        },
        {
          input: fields.email,
          test: function (v) {
            return !FormUtils.isFilled(v) || FormUtils.isEmail(v);
          },
          message: "Please enter a valid email address, like name@example.com.",
        },
        {
          input: fields.address,
          test: FormUtils.isFilled,
          message: "Please enter your street address.",
        },
        {
          input: fields.city,
          test: FormUtils.isFilled,
          message: "Please enter your city.",
        },
        {
          input: fields.state,
          test: FormUtils.isFilled,
          message: "Please enter your state.",
        },
        {
          input: fields.zip,
          test: FormUtils.isFilled,
          message: "Please enter your ZIP code.",
        },
        {
          input: fields.zip,
          test: function (v) {
            return !FormUtils.isFilled(v) || FormUtils.isZip(v);
          },
          message: "ZIP code must be 5 digits, like 53092.",
        },
        {
          input: quantityInput,
          test: function (v) {
            var n = parseInt(v, 10);
            return !isNaN(n) && n >= 1 && String(v).trim() !== "";
          },
          message: "Quantity must be at least 1 cookie.",
        },
      ])
    );

    if (problems.length) {
      alertBox.innerHTML =
        "<strong>Please fix the following before continuing:</strong><ul>" +
        problems
          .map(function (p) {
            return "<li>" + p + "</li>";
          })
          .join("") +
        "</ul>";
      alertBox.hidden = false;
      alertBox.scrollIntoView({ behavior: "smooth", block: "center" });
      FormUtils.focusFirstError(form);
      return;
    }

    /* ------------------------------------------------------- hand off ---- */
    alertBox.hidden = true;
    var qty = currentQuantity();

    OrderState.save({
      quantity: qty,
      customer: {
        fullName: fields.fullName.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        address: fields.address.value.trim(),
        city: fields.city.value.trim(),
        state: fields.state.value.trim(),
        zip: fields.zip.value.trim(),
      },
      pricing: OrderState.priceOrder(state.designType, qty),
    });
    document.dispatchEvent(new CustomEvent("order:changed"));

    window.location.href = NEXT_STEP;
  });

  renderSummary();
})();
