/* ==========================================================================
   cookie-art.js
   Business-created cookie artwork, drawn as inline SVG.
   Every catalog image on the site comes from this file, so the catalog only
   ever shows designs the business owns - never a customer's uploaded image.
   ========================================================================== */

(function (global) {
  "use strict";

  var DOUGH = "#e0a458";
  var DOUGH_EDGE = "#c98b3e";
  var ICING = "#3e2020";
  var PINK = "#ec1a6f";
  var MINT = "#4fb286";
  var BLUE = "#4a7fd4";
  var YELLOW = "#f2c14e";
  var WHITE = "#ffffff";

  /* Decoration layers, keyed by the "art" value on a design. */
  var ART = {
    face:
      '<circle cx="74" cy="86" r="8" fill="' + ICING + '"/>' +
      '<circle cx="126" cy="86" r="8" fill="' + ICING + '"/>' +
      '<path d="M70 126 H130" stroke="' + ICING + '" stroke-width="7" stroke-linecap="round"/>',

    sillyFace:
      '<circle cx="74" cy="82" r="8" fill="' + ICING + '"/>' +
      '<path d="M116 82 l20 0 M126 72 l0 20" stroke="' + ICING + '" stroke-width="7" stroke-linecap="round"/>' +
      '<path d="M72 118 q28 30 56 0" stroke="' + ICING + '" stroke-width="7" fill="none" stroke-linecap="round"/>' +
      '<path d="M96 134 q10 18 20 0 z" fill="' + PINK + '"/>',

    confetti:
      '<g stroke-linecap="round" stroke-width="7">' +
      '<path d="M62 74 l16 16" stroke="' + PINK + '"/>' +
      '<path d="M124 62 l14 -8" stroke="' + MINT + '"/>' +
      '<path d="M138 96 l14 10" stroke="' + BLUE + '"/>' +
      '<path d="M66 132 l-14 10" stroke="' + YELLOW + '"/>' +
      '<path d="M104 140 l6 18" stroke="' + PINK + '"/>' +
      '<path d="M92 66 l-4 -18" stroke="' + BLUE + '"/>' +
      "</g>" +
      '<circle cx="100" cy="102" r="10" fill="' + PINK + '"/>' +
      '<circle cx="72" cy="108" r="6" fill="' + MINT + '"/>' +
      '<circle cx="132" cy="128" r="6" fill="' + YELLOW + '"/>',

    balloons:
      '<ellipse cx="82" cy="86" rx="20" ry="25" fill="' + PINK + '"/>' +
      '<ellipse cx="122" cy="94" rx="17" ry="22" fill="' + BLUE + '"/>' +
      '<path d="M82 111 q6 22 -6 34 M122 116 q-4 18 6 28" stroke="' + ICING + '" stroke-width="4" fill="none" stroke-linecap="round"/>',

    snowflake:
      '<g stroke="' + WHITE + '" stroke-width="7" stroke-linecap="round">' +
      '<path d="M100 52 V148 M58 76 L142 124 M142 76 L58 124"/>' +
      '<path d="M100 70 l-12 -12 M100 70 l12 -12 M100 130 l-12 12 M100 130 l12 12"/>' +
      "</g>" +
      '<circle cx="100" cy="100" r="9" fill="' + BLUE + '"/>',

    candy:
      '<path d="M84 142 V96 a22 22 0 0 1 44 0" stroke="' + WHITE + '" stroke-width="18" fill="none" stroke-linecap="round"/>' +
      '<path d="M84 142 V96 a22 22 0 0 1 44 0" stroke="' + PINK + '" stroke-width="18" fill="none" stroke-linecap="round" stroke-dasharray="10 14"/>',

    sprinkles:
      '<g stroke-width="8" stroke-linecap="round">' +
      '<path d="M66 82 l14 -10" stroke="' + WHITE + '"/>' +
      '<path d="M106 66 l12 12" stroke="' + PINK + '"/>' +
      '<path d="M132 100 l-14 8" stroke="' + BLUE + '"/>' +
      '<path d="M78 122 l14 8" stroke="' + MINT + '"/>' +
      '<path d="M112 138 l12 -10" stroke="' + YELLOW + '"/>' +
      '<path d="M62 108 l-2 16" stroke="' + PINK + '"/>' +
      "</g>",

    football:
      '<ellipse cx="100" cy="100" rx="50" ry="31" fill="#8a5a2b" stroke="' + ICING + '" stroke-width="5"/>' +
      '<path d="M78 100 H122 M88 90 V110 M100 88 V112 M112 90 V110" stroke="' + WHITE + '" stroke-width="5" stroke-linecap="round"/>',

    basketball:
      '<circle cx="100" cy="100" r="44" fill="#e2751f" stroke="' + ICING + '" stroke-width="5"/>' +
      '<path d="M56 100 H144 M100 56 V144 M68 68 q32 32 0 64 M132 68 q-32 32 0 64" stroke="' + ICING + '" stroke-width="4" fill="none"/>',

    baseball:
      '<circle cx="100" cy="100" r="44" fill="' + WHITE + '" stroke="' + ICING + '" stroke-width="5"/>' +
      '<path d="M72 68 q14 32 0 64 M128 68 q-14 32 0 64" stroke="' + PINK + '" stroke-width="4" fill="none"/>' +
      '<path d="M78 78 l-8 4 M78 96 l-9 0 M78 114 l-8 -4 M122 78 l8 4 M122 96 l9 0 M122 114 l8 -4" stroke="' + PINK + '" stroke-width="4" stroke-linecap="round"/>',

    star:
      '<path d="M100 56 l13 30 33 3 -25 22 8 32 -29 -17 -29 17 8 -32 -25 -22 33 -3 z" fill="' + YELLOW + '" stroke="' + ICING + '" stroke-width="5" stroke-linejoin="round"/>',
  };

  /* Text-based designs: short sayings iced onto the cookie. */
  var SAYINGS = {
    happyBirthday: ["HAPPY", "BIRTHDAY"],
    woohoo: ["WOOHOO!"],
    thankYou: ["THANK", "YOU"],
    congrats: ["CONGRATS"],
  };

  function sayingLayer(lines) {
    var size = lines.length > 1 ? 22 : 24;
    var startY = 100 - ((lines.length - 1) * size * 0.62) + 8;
    var out = "";
    for (var i = 0; i < lines.length; i++) {
      out +=
        '<text x="100" y="' + (startY + i * size * 1.24).toFixed(1) + '"' +
        ' text-anchor="middle" font-family="Poppins, Avenir Next, Segoe UI, sans-serif"' +
        ' font-size="' + size + '" font-weight="700" fill="' + ICING + '">' +
        lines[i] +
        "</text>";
    }
    return out;
  }

  /**
   * Build the SVG markup for one cookie.
   * @param {string} art  key from ART or SAYINGS
   * @param {string} label accessible description of the design
   */
  function cookieSVG(art, label) {
    var layer = ART[art] || (SAYINGS[art] ? sayingLayer(SAYINGS[art]) : "");
    return (
      '<svg class="cookie-art" viewBox="0 0 200 200" role="img" aria-label="' +
      String(label || "Cookie design").replace(/"/g, "&quot;") +
      '">' +
      '<circle cx="100" cy="100" r="78" fill="' + DOUGH + '" stroke="' + DOUGH_EDGE + '" stroke-width="6"/>' +
      layer +
      "</svg>"
    );
  }

  /** The plain cookie used for previews and the hero illustration. */
  function plainCookieSVG(label) {
    return cookieSVG("", label || "Sugar cookie");
  }

  global.CookieArt = {
    cookieSVG: cookieSVG,
    plainCookieSVG: plainCookieSVG,
  };
})(window);
