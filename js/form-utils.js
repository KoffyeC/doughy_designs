/* ==========================================================================
   form-utils.js
   Small shared helpers for the two forms Developer 1 owns (contact form and
   order details form): field-level error messages and format checks.
   Errors are shown next to the field; nothing the customer typed is cleared.
   ========================================================================== */

(function (global) {
  "use strict";

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var ZIP_RE = /^\d{5}(-\d{4})?$/;

  function fieldOf(input) {
    return input.closest(".field");
  }

  function showError(input, message) {
    var field = fieldOf(input);
    if (!field) return;
    field.classList.add("has-error");
    var slot = field.querySelector(".error-text");
    if (slot) slot.textContent = message;
    input.setAttribute("aria-invalid", "true");
  }

  function clearError(input) {
    var field = fieldOf(input);
    if (!field) return;
    field.classList.remove("has-error");
    var slot = field.querySelector(".error-text");
    if (slot) slot.textContent = "";
    input.removeAttribute("aria-invalid");
  }

  function isEmail(value) {
    return EMAIL_RE.test(String(value).trim());
  }

  function isZip(value) {
    return ZIP_RE.test(String(value).trim());
  }

  /** 7-15 digits, allowing spaces, dashes, dots, parentheses and +. */
  function isPhone(value) {
    var raw = String(value).trim();
    if (!/^[\d\s()+.\-]+$/.test(raw)) return false;
    var digits = raw.replace(/\D/g, "").length;
    return digits >= 7 && digits <= 15;
  }

  function isFilled(value) {
    return String(value).trim().length > 0;
  }

  /**
   * Run a list of rules against a form.
   * @param {Array} rules  [{ input, test, message }]
   * @returns {Array} messages for the rules that failed, in order
   */
  function validate(rules) {
    var problems = [];
    rules.forEach(function (rule) {
      clearError(rule.input);
    });
    rules.forEach(function (rule) {
      if (fieldOf(rule.input) && fieldOf(rule.input).classList.contains("has-error")) {
        return; // only report the first problem per field
      }
      if (!rule.test(rule.input.value)) {
        showError(rule.input, rule.message);
        problems.push(rule.message);
      }
    });
    return problems;
  }

  /** Clear a field's error as soon as the customer starts fixing it. */
  function clearOnInput(inputs) {
    inputs.forEach(function (input) {
      input.addEventListener("input", function () {
        clearError(input);
      });
    });
  }

  function focusFirstError(form) {
    var bad = form.querySelector(".has-error input, .has-error textarea");
    if (bad) bad.focus();
  }

  global.FormUtils = {
    showError: showError,
    clearError: clearError,
    clearOnInput: clearOnInput,
    focusFirstError: focusFirstError,
    isEmail: isEmail,
    isZip: isZip,
    isPhone: isPhone,
    isFilled: isFilled,
    validate: validate,
  };
})(window);
