/* ==========================================================================
   home.js
   Renders the "Popular right now" examples on the home page from the same
   catalog data the Designs page uses, so the examples always match the
   catalog.
   ========================================================================== */

(function () {
  "use strict";

  var grid = document.getElementById("popular-grid");
  if (!grid) return;

  /* One example per category, in the order shown in the UI design. */
  var FEATURED = [
    { id: "birthday-confetti", title: "Birthday", category: "birthday" },
    { id: "just-because", title: "Funny Faces", category: "funny" },
    { id: "game-day", title: "Sports", category: "sports" },
  ];

  grid.innerHTML = FEATURED.map(function (item) {
    var design = CatalogData.byId(item.id);
    if (!design) return "";
    return (
      '<a class="card feature-card" href="designs.html?category=' +
      item.category +
      '">' +
      CookieArt.cookieSVG(design.art, design.name + " cookie design") +
      "<div>" +
      "<h3>" +
      item.title +
      "</h3>" +
      "<p>" +
      design.blurb +
      "</p>" +
      "</div>" +
      "</a>"
    );
  }).join("");
})();
