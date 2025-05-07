// Login page functionality

document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const loginForm = document.getElementById("login-form");
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const loginButton = document.querySelector(".login-button");

  // Password visibility toggle
  const toggleBtn = document.querySelector(".password-toggle");
  if (toggleBtn && passwordInput) {
    toggleBtn.addEventListener("click", function () {
      const type =
        passwordInput.getAttribute("type") === "password" ? "text" : "password";
      passwordInput.setAttribute("type", type);
      toggleBtn.querySelector("i").classList.toggle("fa-eye");
      toggleBtn.querySelector("i").classList.toggle("fa-eye-slash");
    });
  }

  // Form validation
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Clear any previous errors
      document.querySelectorAll(".input-container").forEach((container) => {
        container.classList.remove("error");
      });

      // Collect validation errors
      let errors = [];
      let isValid = true;

      if (!usernameInput.value.trim()) {
        highlightErrorField(usernameInput);
        errors.push("Username is required");
        isValid = false;
      }

      if (!passwordInput.value.trim()) {
        highlightErrorField(passwordInput);
        errors.push("Password is required");
        isValid = false;
      }

      // Show single toast with all errors if there are any
      if (errors.length > 0) {
        showValidationErrors(errors);
      }

      if (isValid) {
        // Show loading state
        loginButton.innerHTML = "<span>Signing in...</span>";
        loginButton.disabled = true;

        // Submit the form
        this.submit();
      }
    });
  }

  // Process Django messages - Make sure DOM is fully loaded
  // Use a small delay to ensure toast library is ready
  setTimeout(processMessages, 100);

  // Handle input events to remove error state
  document.querySelectorAll("input").forEach((input) => {
    input.addEventListener("input", function () {
      this.closest(".input-container").classList.remove("error");
    });
  });

  // Helper function to highlight error fields
  function highlightErrorField(input) {
    const container = input.closest(".input-container");
    container.classList.add("error");
  }

  // Helper function to show validation errors as a single toast
  function showValidationErrors(errors) {
    if (errors.length === 0) return;

    // If just one error, show it directly
    if (errors.length === 1) {
      showToastWhenReady("Validation Error", errors[0], "error", 5000);
      return;
    }

    // Format multiple errors as a list
    const errorsList = errors.map((error) => `• ${error}`).join("<br>");
    showToastWhenReady("Please Fix These Errors", errorsList, "error", 7000);
  }

  // Helper function to show toast only when DOM is ready
  function showToastWhenReady(title, message, type, timeout) {
    if (document.readyState === "complete") {
      showToast(title, message, type, timeout);
    } else {
      setTimeout(function () {
        showToast(title, message, type, timeout);
      }, 200);
    }
  }

  // Helper function to process Django messages
  function processMessages() {
    const messages = document.querySelectorAll(".messages .message");
    if (messages.length > 0) {
      messages.forEach((message) => {
        const messageText = message.textContent.trim();
        const messageType = message.classList.contains("message-error")
          ? "error"
          : message.classList.contains("message-success")
          ? "success"
          : message.classList.contains("message-warning")
          ? "warning"
          : "info";

        // Display toast notification with delay to ensure DOM is ready
        showToastWhenReady(
          "Authentication Error",
          messageText,
          messageType,
          5000
        );

        // Remove the original message elements
        message.remove();
      });

      // Remove the empty messages container
      const messagesContainer = document.querySelector(".messages");
      if (messagesContainer) {
        messagesContainer.remove();
      }
    }
  }
});
