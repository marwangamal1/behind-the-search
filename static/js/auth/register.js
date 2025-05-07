// Register page functionality

document.addEventListener("DOMContentLoaded", function () {
  // Get form elements
  const registerForm = document.getElementById("register-form");
  const passwordInput = document.getElementById("id_password1");
  const confirmPasswordInput = document.getElementById("id_password2");
  const registerButton = document.querySelector(".register-button");
  const strengthProgress = document.querySelector(".strength-progress");
  const termsCheckbox = document.getElementById("terms");
  const phoneInput = document.getElementById("id_phone_number");

  // Add phone number helper text and format guidance
  if (phoneInput) {
    // Add placeholder with format example if not already set
    if (
      !phoneInput.getAttribute("placeholder") ||
      phoneInput.getAttribute("placeholder") === "Phone Number"
    ) {
      phoneInput.setAttribute(
        "placeholder",
        "Phone Number (e.g., +201234567890)"
      );
    }

    // Add input event listener for phone formatting
    phoneInput.addEventListener("input", function (e) {
      let value = e.target.value.trim();

      // If user is starting to type and hasn't added +20, help them out
      if (value && !value.startsWith("+") && !value.startsWith("00")) {
        if (value.startsWith("20")) {
          // If they typed 20 without +, add the +
          e.target.value = "+" + value;
        } else if (!isNaN(value) && value.length > 0) {
          // If they started with just numbers, assume Egyptian number
          e.target.value = "+20" + value;
        }
      }

      // Replace 00 at start with + for international format
      if (value.startsWith("00")) {
        e.target.value = "+" + value.substring(2);
      }
    });

    // Add blur event to validate phone number format
    phoneInput.addEventListener("blur", function () {
      const value = this.value.trim();
      const container = this.closest(".input-container");

      // Basic validation for phone number format
      if (value && !isValidPhoneNumber(value)) {
        if (container) {
          container.classList.add("error");

          // Show specific toast for phone number format
          showToastWhenReady(
            "Invalid Phone Format",
            "Please enter a valid phone number with country code (e.g., +201234567890)",
            "error",
            5000
          );
        }
      }
    });
  }

  // Terms modal elements
  const termsModal = document.getElementById("termsModal");
  const openTermsModalBtn = document.getElementById("openTermsModal");
  const closeModalBtn = document.querySelector(".close-modal");
  const tabButtons = document.querySelectorAll(".tab-button");
  const tabContents = document.querySelectorAll(".tab-content");
  const modalAgreeCheckbox = document.getElementById("modalAgree");
  const confirmAgreementBtn = document.getElementById("confirmAgreement");

  // Track user interaction with tabs
  let tabsVisited = {
    terms: false,
    privacy: false,
  };
  let tabsScrolled = {
    terms: false,
    privacy: false,
  };

  // Terms modal functionality
  if (openTermsModalBtn && termsModal) {
    // Open modal when terms link is clicked
    openTermsModalBtn.addEventListener("click", function (e) {
      e.preventDefault();
      openTermsModal();
    });

    // Function to open terms modal
    function openTermsModal() {
      termsModal.classList.add("active");
      document.body.style.overflow = "hidden"; // Prevent scrolling behind modal

      // If the terms checkbox is already checked (somehow), uncheck it
      if (termsCheckbox && termsCheckbox.checked) {
        termsCheckbox.checked = false;
      }

      // Reset modal agree checkbox
      if (modalAgreeCheckbox) {
        modalAgreeCheckbox.checked = false;
        modalAgreeCheckbox.disabled = true; // Disable checkbox until requirements are met
      }

      // Disable confirm button
      if (confirmAgreementBtn) {
        confirmAgreementBtn.disabled = true;
      }

      // Set the first tab as visited
      const activeTab = document.querySelector(".tab-button.active");
      if (activeTab) {
        tabsVisited[activeTab.getAttribute("data-tab")] = true;
      }

      // Check scroll status for the active tab content
      checkScrollStatus();

      // Update checkbox status
      updateCheckboxStatus();
    }

    // Prevent direct checkbox interaction - must use the modal
    if (termsCheckbox) {
      termsCheckbox.addEventListener("click", function (e) {
        // If the user tries to check the box directly, prevent it and open the modal
        e.preventDefault();
        openTermsModal();
      });
    }

    // Close modal when close button is clicked
    closeModalBtn.addEventListener("click", function () {
      termsModal.classList.remove("active");
      document.body.style.overflow = "";
    });

    // Close modal when clicking outside of content
    termsModal.addEventListener("click", function (e) {
      if (e.target === termsModal) {
        termsModal.classList.remove("active");
        document.body.style.overflow = "";
      }
    });

    // Tab switching
    tabButtons.forEach((button) => {
      button.addEventListener("click", function () {
        const tabId = this.getAttribute("data-tab");

        // Mark this tab as visited
        tabsVisited[tabId] = true;

        // Update active tab button
        tabButtons.forEach((btn) => btn.classList.remove("active"));
        this.classList.add("active");

        // Show selected tab content
        tabContents.forEach((content) => {
          content.classList.remove("active");
          if (content.id === `${tabId}Tab`) {
            content.classList.add("active");

            // Check scroll status for newly activated tab
            setTimeout(checkScrollStatus, 100);
          }
        });

        // Update checkbox status
        updateCheckboxStatus();
      });
    });

    // Track scrolling in tab content
    tabContents.forEach((content) => {
      content.addEventListener("scroll", function () {
        const tabId = this.id.replace("Tab", "");
        const scrollableHeight = this.scrollHeight - this.clientHeight;

        // Consider scrolled if user has scrolled to 80% of the content
        if (this.scrollTop >= scrollableHeight * 0.8) {
          tabsScrolled[tabId] = true;
          updateCheckboxStatus();
        }
      });
    });

    // Function to check scroll status of active tab
    function checkScrollStatus() {
      const activeTabContent = document.querySelector(".tab-content.active");
      if (activeTabContent) {
        const tabId = activeTabContent.id.replace("Tab", "");
        // For very short content, mark as scrolled automatically
        if (activeTabContent.scrollHeight <= activeTabContent.clientHeight) {
          tabsScrolled[tabId] = true;
        }
      }
    }

    // Function to update checkbox status based on tab interactions
    function updateCheckboxStatus() {
      if (modalAgreeCheckbox) {
        // Enable checkbox only if all tabs are visited and scrolled
        const allTabsVisited = Object.values(tabsVisited).every(
          (value) => value
        );
        const allTabsScrolled = Object.values(tabsScrolled).every(
          (value) => value
        );

        modalAgreeCheckbox.disabled = !(allTabsVisited && allTabsScrolled);

        // If the checkbox is checked but requirements aren't met, uncheck it
        if (modalAgreeCheckbox.checked && modalAgreeCheckbox.disabled) {
          modalAgreeCheckbox.checked = false;
        }
      }
    }

    // Enable/disable confirm button based on checkbox
    if (modalAgreeCheckbox && confirmAgreementBtn) {
      modalAgreeCheckbox.addEventListener("change", function () {
        confirmAgreementBtn.disabled = !this.checked;
      });

      // Confirm agreement and close modal
      confirmAgreementBtn.addEventListener("click", function () {
        if (modalAgreeCheckbox.checked) {
          termsCheckbox.checked = true;
          termsModal.classList.remove("active");
          document.body.style.overflow = "";
        }
      });
    }
  }

  // Password visibility toggle
  const toggleBtns = document.querySelectorAll(".password-toggle");
  toggleBtns.forEach((btn) => {
    btn.addEventListener("click", function () {
      const targetId = this.getAttribute("data-target");
      const input = document.getElementById(`id_${targetId}`);

      if (input) {
        const type =
          input.getAttribute("type") === "password" ? "text" : "password";
        input.setAttribute("type", type);
        this.querySelector("i").classList.toggle("fa-eye");
        this.querySelector("i").classList.toggle("fa-eye-slash");
      }
    });
  });

  // Password strength meter
  if (passwordInput && strengthProgress) {
    passwordInput.addEventListener("input", function () {
      updatePasswordStrength(this.value);
    });
  }

  // Form validation
  if (registerForm) {
    registerForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Reset error states
      document.querySelectorAll(".input-container").forEach((container) => {
        container.classList.remove("error");
      });

      let isValid = true;
      const formData = new FormData(registerForm);
      // Collect all validation errors
      let errors = [];

      // Validate required fields
      for (const [name, value] of formData.entries()) {
        if (name === "terms") continue; // Skip checkbox validation here

        if (!value.trim()) {
          const field = registerForm.querySelector(`[name="${name}"]`);
          if (field) {
            const fieldName =
              name.charAt(0).toUpperCase() +
              name.slice(1).replace(/[_1-9]/g, "");
            highlightErrorField(field);
            errors.push(`${fieldName} is required`);
            isValid = false;
          }
        }
      }

      // Phone number validation
      const phoneNumber = formData.get("phone_number")?.trim();
      if (phoneNumber && !isValidPhoneNumber(phoneNumber)) {
        const field = registerForm.querySelector(`[name="phone_number"]`);
        if (field) {
          highlightErrorField(field);
          errors.push(
            "Please enter a valid phone number with country code (e.g., +201234567890)"
          );
          isValid = false;
        }
      }

      // Validate terms checkbox
      if (termsCheckbox && !termsCheckbox.checked) {
        const container = termsCheckbox.closest(".checkbox-field");
        container.classList.add("error");
        errors.push("You must accept the Terms of Service and Privacy Policy");
        isValid = false;
      }

      // Validate passwords match
      if (
        passwordInput &&
        confirmPasswordInput &&
        passwordInput.value &&
        confirmPasswordInput.value &&
        passwordInput.value !== confirmPasswordInput.value
      ) {
        highlightErrorField(confirmPasswordInput);
        errors.push("Passwords do not match");
        isValid = false;
      }

      // Validate password strength
      if (passwordInput && passwordInput.value) {
        const strength = calculatePasswordStrength(passwordInput.value);
        if (strength < 50) {
          highlightErrorField(passwordInput);
          errors.push("Password is too weak");
          isValid = false;
        }

        // Validate password complexity
        if (!isPasswordComplex(passwordInput.value)) {
          highlightErrorField(passwordInput);
          errors.push(
            "Password must contain at least one letter and cannot be only numbers"
          );
          isValid = false;
        }
      }

      // Show consolidated errors if any
      if (errors.length > 0) {
        showValidationErrors(errors);
      }

      // Submit form if valid
      if (isValid) {
        // Show loading state
        registerButton.innerHTML = "<span>Creating account...</span>";
        registerButton.disabled = true;

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
      const container =
        this.closest(".input-container") || this.closest(".checkbox-field");
      if (container) {
        container.classList.remove("error");
      }
    });
  });

  // Helper function to highlight error field
  function highlightErrorField(input) {
    const container =
      input.closest(".input-container") || input.closest(".checkbox-field");
    if (container) {
      container.classList.add("error");
    }
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
          "Registration Error",
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

  // Helper function to calculate password strength
  function calculatePasswordStrength(password) {
    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 25;

    // Character type checks
    if (/[A-Z]/.test(password)) strength += 25; // Uppercase
    if (/[0-9]/.test(password)) strength += 25; // Numbers
    if (/[^A-Za-z0-9]/.test(password)) strength += 25; // Special characters

    // Check if password is only numbers
    if (/^\d+$/.test(password)) {
      // Reset strength to very weak if only numbers
      strength = 10;
    }

    return strength;
  }

  // Helper function to validate password complexity
  function isPasswordComplex(password) {
    // Password should not be only numbers
    if (/^\d+$/.test(password)) {
      return false;
    }

    // Password should have at least 8 characters
    if (password.length < 8) {
      return false;
    }

    // Password should have at least one letter
    if (!/[a-zA-Z]/.test(password)) {
      return false;
    }

    // Get form values to compare with password
    const emailField = document.getElementById("id_email");
    const firstNameField = document.getElementById("id_first_name");
    const usernameField = document.getElementById("id_username");

    // Check if password contains email, username, or name (case insensitive)
    if (emailField && emailField.value) {
      // Get username part of email (before @)
      const emailUsername = emailField.value.split("@")[0].toLowerCase();
      const emailDomain = emailField.value.split("@")[1]?.toLowerCase();

      // Check if password contains email or parts of it
      if (
        password.toLowerCase() === emailField.value.toLowerCase() ||
        password.toLowerCase().includes(emailUsername) ||
        (emailDomain &&
          password.toLowerCase().includes(emailDomain.split(".")[0]))
      ) {
        return false;
      }
    }

    // Check if password is same as or contains first name
    if (
      firstNameField &&
      firstNameField.value &&
      firstNameField.value.length > 2 &&
      password.toLowerCase().includes(firstNameField.value.toLowerCase())
    ) {
      return false;
    }

    // Check if password is same as or contains username
    if (
      usernameField &&
      usernameField.value &&
      usernameField.value.length > 2 &&
      password.toLowerCase().includes(usernameField.value.toLowerCase())
    ) {
      return false;
    }

    return true;
  }

  // Helper function to update password strength meter
  function updatePasswordStrength(password) {
    const strength = calculatePasswordStrength(password);
    strengthProgress.style.width = `${strength}%`;

    // Update color based on strength
    if (strength <= 25) {
      strengthProgress.style.backgroundColor = "var(--Error)";
    } else if (strength <= 50) {
      strengthProgress.style.backgroundColor = "var(--Warning)";
    } else if (strength <= 75) {
      strengthProgress.style.backgroundColor = "var(--Primary)";
    } else {
      strengthProgress.style.backgroundColor = "var(--Success)";
    }
  }

  // Helper function to validate phone number format
  function isValidPhoneNumber(phone) {
    // Basic regex for international phone format
    // Requires + followed by at least 7 digits
    // This is a simple validation - the server will do full validation
    const phoneRegex = /^\+\d{7,15}$/;

    // Check if it's a valid Egyptian number starting with +20
    if (phone.startsWith("+20")) {
      // Egyptian numbers should have +20 followed by 10 digits
      // Total length should be 13 (+20 plus 10 digits)
      return phone.length === 13 && phoneRegex.test(phone);
    }

    // For other international numbers, just check the basic format
    return phoneRegex.test(phone);
  }
});
