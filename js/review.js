(function () {
  "use strict";

  var form = document.getElementById("payment-form");
  if (!form) return;
  var order = OrderState.load();
  var details = document.getElementById("review-details");
  var missing = document.getElementById("missing-order");
  var paymentAlert = document.getElementById("payment-alert");
  var cardName = document.getElementById("demo-card-name");
  var cardNumber = document.getElementById("demo-card-number");
  var expiry = document.getElementById("demo-expiry");
  var cvv = document.getElementById("demo-cvv");

  function addDetail(label, value, node) {
    var row = document.createElement("div");
    var term = document.createElement("dt");
    var description = document.createElement("dd");
    term.textContent = label;
    if (node) description.appendChild(node);
    else description.textContent = value || "—";
    row.appendChild(term);
    row.appendChild(description);
    details.appendChild(row);
  }

  function customizationText() {
    if (order.designType === "premade") return order.design ? order.design.name : "No design selected";
    if (order.designType === "writing") return 'Message: “' + (order.writingText || "") + '”';
    if (order.designType === "image") return "Uploaded image: " + (order.customImage ? order.customImage.name : "Missing");
    return "No customization selected";
  }

  var pricing = OrderState.priceOrder(order.designType, order.quantity);
  OrderState.save({ pricing: pricing });
  document.getElementById("review-type").textContent = OrderState.typeLabel(order.designType) || "No design selected";
  document.getElementById("review-customization").textContent = customizationText();
  document.getElementById("review-price-line").textContent =
    order.quantity + (order.quantity === 1 ? " cookie × " : " cookies × ") + OrderState.money(pricing.unitPrice);
  document.getElementById("review-total").textContent = OrderState.money(pricing.total);

  addDetail("Customer", order.customer.fullName);
  addDetail("Contact", [order.customer.email, order.customer.phone].filter(Boolean).join(" · "));
  addDetail("Ship to", [order.customer.address, order.customer.city, order.customer.state, order.customer.zip].filter(Boolean).join(", "));
  addDetail("Design choice", OrderState.typeLabel(order.designType));
  addDetail("Customization", customizationText());
  if (order.designType === "image" && order.customImage) {
    var image = document.createElement("img");
    image.className = "review-image";
    image.src = order.customImage.dataUrl;
    image.alt = "Private preview of " + order.customImage.name;
    addDetail("Private image preview", "", image);
  }
  addDetail("Quantity", String(order.quantity));
  addDetail("Unit price", OrderState.money(pricing.unitPrice));
  addDetail("Shipping", "FREE");
  addDetail("Total", OrderState.money(pricing.total));

  var orderReady = Boolean(
    order.designType &&
    order.customer.fullName &&
    order.customer.email &&
    order.quantity > 0 &&
    !(order.designType === "premade" && !order.design) &&
    !(order.designType === "writing" && !(order.writingText || "").trim()) &&
    !(order.designType === "image" && !order.customImage)
  );
  if (!orderReady) {
    missing.innerHTML = "<strong>This order is incomplete.</strong> Return to the earlier steps and add the missing design or customer details.";
    missing.hidden = false;
    form.querySelector('button[type="submit"]').disabled = true;
  }

  cardNumber.addEventListener("input", function () {
    var digits = cardNumber.value.replace(/\D/g, "").slice(0, 16);
    cardNumber.value = digits.replace(/(.{4})/g, "$1 ").trim();
  });
  expiry.addEventListener("input", function () {
    var digits = expiry.value.replace(/\D/g, "").slice(0, 4);
    expiry.value = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
  });
  cvv.addEventListener("input", function () {
    cvv.value = cvv.value.replace(/\D/g, "").slice(0, 4);
  });

  function setError(input, message) {
    var field = input.closest(".field");
    field.classList.toggle("has-error", Boolean(message));
    field.querySelector(".error-text").textContent = message || "";
  }

  [cardName, cardNumber, expiry, cvv].forEach(function (input) {
    input.addEventListener("input", function () {
      setError(input, "");
      paymentAlert.hidden = true;
    });
  });

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var errors = [];
    var digits = cardNumber.value.replace(/\D/g, "");
    var checks = [
      [cardName, cardName.value.trim() ? "" : "Enter a fictional cardholder name."],
      [cardNumber, /^\d{16}$/.test(digits) ? "" : "Enter a 16-digit fictional card number."],
      [expiry, /^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry.value) ? "" : "Use MM/YY format."],
      [cvv, /^\d{3,4}$/.test(cvv.value) ? "" : "Enter a 3- or 4-digit fictional CVV."],
    ];
    checks.forEach(function (check) {
      setError(check[0], check[1]);
      if (check[1]) errors.push(check[1]);
    });
    if (errors.length) {
      paymentAlert.innerHTML = "<strong>Check the demo payment fields.</strong> No values have been saved.";
      paymentAlert.hidden = false;
      checks.filter(function (check) { return check[1]; })[0][0].focus();
      return;
    }

    var orderNumber = "DD-DEMO-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    cardName.value = "";
    cardNumber.value = "";
    expiry.value = "";
    cvv.value = "";
    OrderState.save({
      orderNumber: orderNumber,
      status: "Demo order confirmed",
      submittedAt: new Date().toISOString(),
      pricing: pricing,
    });
    window.location.href = "confirmation.html";
  });
})();
