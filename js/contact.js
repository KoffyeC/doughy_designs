/* ==========================================================================
   contact.js
   Contact form: name / email / message, basic validation and an on-page
   confirmation. Nothing is sent anywhere - this is a fictional class project.
   ========================================================================== */

(function () {
  "use strict";

  var form = document.getElementById("contact-form");
  if (!form) return;

  var name = document.getElementById("contact-name");
  var email = document.getElementById("contact-email");
  var message = document.getElementById("contact-message");
  var alertBox = document.getElementById("contact-alert");
  var successBox = document.getElementById("contact-success");

  FormUtils.clearOnInput([name, email, message]);

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    var problems = FormUtils.validate([
      {
        input: name,
        test: FormUtils.isFilled,
        message: "Please enter your name.",
      },
      {
        input: email,
        test: FormUtils.isFilled,
        message: "Please enter your email address.",
      },
      {
        input: email,
        test: function (v) {
          return !FormUtils.isFilled(v) || FormUtils.isEmail(v);
        },
        message: "Please enter a valid email address, like name@example.com.",
      },
      {
        input: message,
        test: FormUtils.isFilled,
        message: "Please enter a message.",
      },
    ]);

    if (problems.length) {
      successBox.hidden = true;
      alertBox.innerHTML =
        "<strong>Please fix the following:</strong><ul>" +
        problems
          .map(function (p) {
            return "<li>" + p + "</li>";
          })
          .join("") +
        "</ul>";
      alertBox.hidden = false;
      FormUtils.focusFirstError(form);
      return;
    }

    alertBox.hidden = true;
    successBox.innerHTML =
      "<strong>Thanks, " +
      escapeHtml(name.value.trim()) +
      "!</strong>Your message has been sent. We reply to every message within one business day at " +
      escapeHtml(email.value.trim()) +
      ".";
    successBox.hidden = false;
    form.reset();
    successBox.scrollIntoView({ behavior: "smooth", block: "center" });
  });

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
})();
