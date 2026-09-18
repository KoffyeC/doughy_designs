/* ==========================================================================
   designs-data.js
   The pre-made design catalog.

   Every entry is business-created artwork (see cookie-art.js). Customer
   uploads never appear here - the catalog is a fixed list shipped with the
   site, and nothing written by a customer is ever added to it.
   ========================================================================== */

(function (global) {
  "use strict";

  var PREMADE_PRICE = 2.0;

  var CATEGORIES = [
    { id: "all", label: "All" },
    { id: "birthday", label: "Birthday" },
    { id: "holiday", label: "Holiday" },
    { id: "sports", label: "Sports" },
    { id: "funny", label: "Funny" },
  ];

  var DESIGNS = [
    {
      id: "birthday-confetti",
      name: "Birthday Confetti",
      category: "birthday",
      art: "confetti",
      price: PREMADE_PRICE,
      blurb: "Celebrate with a custom design",
    },
    {
      id: "happy-birthday",
      name: "Happy Birthday",
      category: "birthday",
      art: "happyBirthday",
      price: PREMADE_PRICE,
      blurb: "The classic birthday saying",
    },
    {
      id: "balloon-bash",
      name: "Balloon Bash",
      category: "birthday",
      art: "balloons",
      price: PREMADE_PRICE,
      blurb: "Party balloons in icing",
    },
    {
      id: "holiday-theme",
      name: "Holiday Theme",
      category: "holiday",
      art: "snowflake",
      price: PREMADE_PRICE,
      blurb: "A frosty snowflake",
    },
    {
      id: "candy-cane-cheer",
      name: "Candy Cane Cheer",
      category: "holiday",
      art: "candy",
      price: PREMADE_PRICE,
      blurb: "Peppermint stripes",
    },
    {
      id: "winter-sprinkles",
      name: "Winter Sprinkles",
      category: "holiday",
      art: "sprinkles",
      price: PREMADE_PRICE,
      blurb: "Scattered holiday sprinkles",
    },
    {
      id: "game-day",
      name: "Game Day",
      category: "sports",
      art: "football",
      price: PREMADE_PRICE,
      blurb: "Game day, made sweeter",
    },
    {
      id: "hoop-dreams",
      name: "Hoop Dreams",
      category: "sports",
      art: "basketball",
      price: PREMADE_PRICE,
      blurb: "For the basketball crowd",
    },
    {
      id: "home-run",
      name: "Home Run",
      category: "sports",
      art: "baseball",
      price: PREMADE_PRICE,
      blurb: "Ballpark stitching",
    },
    {
      id: "just-because",
      name: "Just Because",
      category: "funny",
      art: "face",
      price: PREMADE_PRICE,
      blurb: "Put a funny face on a cookie",
    },
    {
      id: "woohoo",
      name: "Woohoo",
      category: "funny",
      art: "woohoo",
      price: PREMADE_PRICE,
      blurb: "A little good news",
    },
    {
      id: "silly-face",
      name: "Silly Face",
      category: "funny",
      art: "sillyFace",
      price: PREMADE_PRICE,
      blurb: "Tongue out, eyes crossed",
    },
  ];

  function byId(id) {
    for (var i = 0; i < DESIGNS.length; i++) {
      if (DESIGNS[i].id === id) return DESIGNS[i];
    }
    return null;
  }

  global.CatalogData = {
    PREMADE_PRICE: PREMADE_PRICE,
    CATEGORIES: CATEGORIES,
    DESIGNS: DESIGNS,
    byId: byId,
  };
})(window);
