/* ==========================================================================
   designs.js
   Design catalog page: category filters, the pre-made design grid, and the
   three design-type choices.

   Selecting anything here records the choice in OrderState and sends the
   customer on to the customize step, which Developer 2 owns.
   ========================================================================== */

(function () {
  "use strict";

  var grid = document.getElementById("design-grid");
  if (!grid) return;

  var filterRow = document.getElementById("filter-row");
  var emptyMsg = document.getElementById("catalog-empty");
  var bar = document.getElementById("selection-bar");
  var barText = document.getElementById("selection-text");
  var activeCategory = categoryFromUrl();

  /* The home page links straight to a category, e.g. designs.html?category=sports */
  function categoryFromUrl() {
    var requested = new URLSearchParams(window.location.search).get("category");
    var valid = CatalogData.CATEGORIES.some(function (cat) {
      return cat.id === requested;
    });
    return valid ? requested : "all";
  }

  /* ------------------------------------------------------------ filters -- */
  function renderFilters() {
    filterRow.innerHTML = CatalogData.CATEGORIES.map(function (cat) {
      return (
        '<button type="button" class="chip" data-category="' +
        cat.id +
        '" aria-pressed="' +
        (cat.id === activeCategory) +
        '">' +
        cat.label +
        "</button>"
      );
    }).join("");
  }

  filterRow.addEventListener("click", function (event) {
    var chip = event.target.closest("[data-category]");
    if (!chip) return;
    activeCategory = chip.getAttribute("data-category");
    renderFilters();
    renderGrid();
  });

  /* --------------------------------------------------------- design grid -- */
  function renderGrid() {
    var order = OrderState.load();
    var selectedId =
      order.designType === "premade" && order.design ? order.design.id : null;

    var list = CatalogData.DESIGNS.filter(function (design) {
      return activeCategory === "all" || design.category === activeCategory;
    });

    grid.innerHTML = list
      .map(function (design) {
        var isSelected = design.id === selectedId;
        return (
          '<article class="design-card' +
          (isSelected ? " is-selected" : "") +
          '" data-design-card="' +
          design.id +
          '">' +
          CookieArt.cookieSVG(design.art, design.name + " cookie design") +
          '<div class="design-card__body">' +
          '<span class="category">' +
          categoryLabel(design.category) +
          "</span>" +
          "<h3>" +
          design.name +
          "</h3>" +
          '<span class="price">' +
          OrderState.money(design.price) +
          "</span>" +
          '<button type="button" class="btn btn--primary btn--sm" data-select="' +
          design.id +
          '">' +
          (isSelected ? "Selected" : "Select") +
          "</button>" +
          "</div>" +
          "</article>"
        );
      })
      .join("");

    emptyMsg.hidden = list.length > 0;
  }

  function categoryLabel(id) {
    for (var i = 0; i < CatalogData.CATEGORIES.length; i++) {
      if (CatalogData.CATEGORIES[i].id === id) {
        return CatalogData.CATEGORIES[i].label;
      }
    }
    return "";
  }

  /* ----------------------------------------------------------- selection -- */
  grid.addEventListener("click", function (event) {
    var button = event.target.closest("[data-select]");
    if (!button) return;

    var design = CatalogData.byId(button.getAttribute("data-select"));
    if (!design) return;

    OrderState.save({
      designType: "premade",
      design: {
        id: design.id,
        name: design.name,
        category: design.category,
        art: design.art,
        price: design.price,
      },
    });
    document.dispatchEvent(new CustomEvent("order:changed"));

    renderGrid();
    showSelection();
    syncOptionCards();
  });

  /* Choosing custom writing or a custom image. The wording and the image
     itself are collected on the customize step (Developer 2) - here we only
     record which option the customer picked. */
  document.querySelectorAll("[data-design-type]").forEach(function (card) {
    card.addEventListener("click", function (event) {
      event.preventDefault();
      var type = card.getAttribute("data-design-type");
      OrderState.save({ designType: type, design: null });
      document.dispatchEvent(new CustomEvent("order:changed"));
      renderGrid();
      showSelection();
      syncOptionCards();
      window.location.href = card.getAttribute("href") || "customize.html";
    });
  });

  function syncOptionCards() {
    var order = OrderState.load();
    document.querySelectorAll("[data-design-type]").forEach(function (card) {
      card.classList.toggle(
        "is-selected",
        card.getAttribute("data-design-type") === order.designType
      );
    });
  }

  function showSelection() {
    var order = OrderState.load();
    if (!order.designType) {
      bar.hidden = true;
      return;
    }
    var detail =
      order.designType === "premade" && order.design
        ? order.design.name + " · " + OrderState.money(order.design.price) + " per cookie"
        : OrderState.typeLabel(order.designType) +
          " · " +
          OrderState.money(OrderState.BASE_PRICES[order.designType]) +
          " per cookie";

    barText.innerHTML =
      "<strong>" +
      OrderState.typeLabel(order.designType) +
      " selected</strong>" +
      detail;
    bar.hidden = false;
  }

  /* ------------------------------------------------------------- startup -- */
  renderFilters();
  renderGrid();
  syncOptionCards();
  showSelection();
})();
