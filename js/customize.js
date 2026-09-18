(function () {
  "use strict";

  var preview = document.getElementById("cookie-preview");
  if (!preview) return;

  var typeButtons = document.querySelectorAll("[data-custom-type]");
  var premadeLayer = document.getElementById("premade-preview");
  var writingLayer = document.getElementById("writing-preview");
  var imageLayer = document.getElementById("image-preview");
  var emptyLayer = document.getElementById("empty-preview");
  var messageInput = document.getElementById("custom-message");
  var messageCount = document.getElementById("message-count");
  var fileInput = document.getElementById("image-file");
  var chooseImage = document.getElementById("choose-image");
  var replaceImage = document.getElementById("replace-image");
  var removeImage = document.getElementById("remove-image");
  var imageActions = document.getElementById("image-actions");
  var sizeField = document.getElementById("image-size-field");
  var sizeInput = document.getElementById("image-size");
  var imageError = document.getElementById("image-error");
  var pageError = document.getElementById("customize-error");
  var dragHelp = document.getElementById("drag-help");
  var selectedType;
  var imagePosition = { x: 50, y: 50, size: 75 };
  var dragging = false;

  function setType(type) {
    selectedType = type;
    typeButtons.forEach(function (button) {
      var selected = button.getAttribute("data-custom-type") === type;
      button.classList.toggle("is-selected", selected);
      button.setAttribute("aria-checked", selected ? "true" : "false");
    });
    ["premade", "writing", "image"].forEach(function (name) {
      document.getElementById(name + "-controls").hidden = name !== type;
    });
    OrderState.save({ designType: type, design: type === "premade" ? OrderState.load().design : null });
    document.dispatchEvent(new CustomEvent("order:changed"));
    render();
  }

  function applyImagePosition() {
    imageLayer.style.left = imagePosition.x + "%";
    imageLayer.style.top = imagePosition.y + "%";
    imageLayer.style.width = imagePosition.size + "%";
  }

  function render() {
    var order = OrderState.load();
    selectedType = selectedType || order.designType;
    premadeLayer.hidden = selectedType !== "premade";
    writingLayer.hidden = selectedType !== "writing";
    imageLayer.hidden = selectedType !== "image" || !order.customImage;
    emptyLayer.hidden = Boolean(
      (selectedType === "premade" && order.design) ||
      (selectedType === "writing" && order.writingText) ||
      (selectedType === "image" && order.customImage)
    );

    if (selectedType === "premade") {
      premadeLayer.innerHTML = order.design
        ? CookieArt.cookieSVG(order.design.art, order.design.name + " cookie design")
        : CookieArt.plainCookieSVG("Plain cookie");
      document.getElementById("premade-name").textContent = order.design
        ? order.design.name
        : "No pre-made design selected.";
    }

    writingLayer.textContent = order.writingText || "";
    messageInput.value = order.writingText || "";
    messageCount.textContent = messageInput.value.length;

    if (order.customImage) {
      imageLayer.src = order.customImage.dataUrl;
      imageLayer.alt = "Uploaded design: " + (order.customImage.name || "custom image");
      imageActions.hidden = false;
      sizeField.hidden = false;
      dragHelp.hidden = selectedType !== "image";
      chooseImage.hidden = true;
    } else {
      imageActions.hidden = true;
      sizeField.hidden = true;
      dragHelp.hidden = true;
      chooseImage.hidden = false;
    }

    var price = selectedType ? OrderState.priceOrder(selectedType, order.quantity) : null;
    document.getElementById("custom-summary-type").textContent =
      selectedType ? OrderState.typeLabel(selectedType) : "Not selected";
    document.getElementById("custom-summary-quantity").textContent = order.quantity;
    document.getElementById("custom-summary-total").textContent =
      OrderState.money(price ? price.total : 0);
    applyImagePosition();
  }

  typeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      setType(button.getAttribute("data-custom-type"));
    });
  });

  messageInput.addEventListener("input", function () {
    var text = messageInput.value.trimStart();
    messageCount.textContent = messageInput.value.length;
    OrderState.save({ writingText: text });
    writingLayer.textContent = text;
    writingLayer.hidden = selectedType !== "writing";
    emptyLayer.hidden = Boolean(text);
    pageError.hidden = true;
  });

  function openPicker() {
    fileInput.click();
  }
  chooseImage.addEventListener("click", openPicker);
  replaceImage.addEventListener("click", openPicker);

  fileInput.addEventListener("change", function () {
    var file = fileInput.files && fileInput.files[0];
    if (!file) return;
    imageError.hidden = true;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      imageError.textContent = "Choose a PNG, JPG, WebP, or GIF image.";
      imageError.hidden = false;
      fileInput.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      imageError.textContent = "That image is larger than 2 MB. Choose a smaller file.";
      imageError.hidden = false;
      fileInput.value = "";
      return;
    }
    var reader = new FileReader();
    reader.addEventListener("load", function () {
      imagePosition = { x: 50, y: 50, size: 75 };
      sizeInput.value = "75";
      OrderState.save({
        customImage: { name: file.name, type: file.type, dataUrl: reader.result },
        imagePlacement: imagePosition,
      });
      pageError.hidden = true;
      render();
    });
    reader.readAsDataURL(file);
  });

  removeImage.addEventListener("click", function () {
    OrderState.save({ customImage: null, imagePlacement: null });
    fileInput.value = "";
    render();
  });

  sizeInput.addEventListener("input", function () {
    imagePosition.size = Number(sizeInput.value);
    OrderState.save({ imagePlacement: imagePosition });
    applyImagePosition();
  });

  function moveImage(event) {
    if (!dragging) return;
    var rect = preview.getBoundingClientRect();
    imagePosition.x = Math.max(8, Math.min(92, ((event.clientX - rect.left) / rect.width) * 100));
    imagePosition.y = Math.max(8, Math.min(92, ((event.clientY - rect.top) / rect.height) * 100));
    applyImagePosition();
  }
  imageLayer.addEventListener("pointerdown", function (event) {
    dragging = true;
    imageLayer.setPointerCapture(event.pointerId);
    moveImage(event);
  });
  imageLayer.addEventListener("pointermove", moveImage);
  imageLayer.addEventListener("pointerup", function () {
    dragging = false;
    OrderState.save({ imagePlacement: imagePosition });
  });
  imageLayer.addEventListener("pointercancel", function () {
    dragging = false;
  });

  document.getElementById("continue-customize").addEventListener("click", function () {
    var order = OrderState.load();
    var problem = "";
    if (!selectedType) problem = "Choose a design type before continuing.";
    if (selectedType === "premade" && !order.design) problem = "Choose a pre-made design from the catalog before continuing.";
    if (selectedType === "writing" && !(order.writingText || "").trim()) problem = "Enter the message you want written on the cookie.";
    if (selectedType === "image" && !order.customImage) problem = "Choose an image before continuing.";
    if (problem) {
      pageError.textContent = problem;
      pageError.hidden = false;
      return;
    }
    OrderState.save({ pricing: OrderState.priceOrder(selectedType, order.quantity) });
    window.location.href = "order-details.html";
  });

  var initial = OrderState.load();
  selectedType = initial.designType || "premade";
  if (initial.imagePlacement) {
    imagePosition = {
      x: Number(initial.imagePlacement.x) || 50,
      y: Number(initial.imagePlacement.y) || 50,
      size: Number(initial.imagePlacement.size) || 75,
    };
    sizeInput.value = imagePosition.size;
  }
  setType(selectedType);
})();
