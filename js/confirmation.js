(function () {
  "use strict";

  var order = OrderState.load();
  var card = document.getElementById("confirmation-card");
  var empty = document.getElementById("no-confirmation");
  if (!order.orderNumber) {
    card.hidden = true;
    empty.hidden = false;
    return;
  }

  document.getElementById("confirmation-number").textContent = "Order " + order.orderNumber;
  var details = document.getElementById("confirmation-details");

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

  var customization = "";
  if (order.designType === "premade") customization = order.design ? order.design.name : "—";
  if (order.designType === "writing") customization = '“' + (order.writingText || "") + '”';
  if (order.designType === "image") customization = order.customImage ? order.customImage.name : "—";
  var pricing = order.pricing || OrderState.priceOrder(order.designType, order.quantity);
  var address = [order.customer.address, order.customer.city, order.customer.state, order.customer.zip].filter(Boolean).join(", ");

  addDetail("Customer", order.customer.fullName);
  addDetail("Email", order.customer.email);
  addDetail("Phone", order.customer.phone);
  addDetail("Delivery address", address);
  addDetail("Design", OrderState.typeLabel(order.designType));
  addDetail("Customization", customization);
  if (order.designType === "image" && order.customImage) {
    var image = document.createElement("img");
    image.className = "review-image";
    image.src = order.customImage.dataUrl;
    image.alt = "Private preview of " + order.customImage.name;
    addDetail("Private image preview", "", image);
  }
  addDetail("Quantity", String(order.quantity));
  addDetail("Price", order.quantity + " × " + OrderState.money(pricing.unitPrice));
  addDetail("Shipping", "FREE");
  addDetail("Total", OrderState.money(pricing.total));
  addDetail("Status", order.status);

  document.getElementById("new-order").addEventListener("click", function () {
    OrderState.clear();
  });
})();
