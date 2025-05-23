document.addEventListener("DOMContentLoaded", function () {
  // Handle form submission
  const form = document.getElementById("video-form");
  const lessonNumberInput = form.querySelector('input[name="lesson_number"]');
  const sectionSelect = form.querySelector('select[name="section"]');
  const bunnyVideoIdInput = document.querySelector(
    'input[name="bunny_video_id"]'
  );

  // Store current video's data for validation exceptions
  const currentVideoId = window.location.pathname
    .split("/")
    .filter(Boolean)
    .pop();
  const initialLessonNumber = lessonNumberInput.value;

  // Bunny.net video preview functionality
  const previewButton = document.getElementById("preview-bunny-btn");
  const previewContainer = document.querySelector(".bunny-preview");
  const previewIframe = document.getElementById("bunny-preview-iframe");

  previewButton?.addEventListener("click", function () {
    const videoId = bunnyVideoIdInput.value.trim();
    const libraryId = "421350"; // Default library ID

    if (videoId) {
      // Update the iframe src
      const embedUrl = `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
      previewIframe.src = embedUrl;

      // Show the preview container
      previewContainer.style.display = "block";

      // Change button text
      previewButton.innerHTML = '<i class="fas fa-sync"></i> Refresh Preview';
    } else {
      // Show error if no video ID
      showToast(
        "Error",
        "Please enter a Bunny.net video ID to preview",
        "error"
      );
    }
  });

  // Check if lesson number already exists (excluding the current video)
  lessonNumberInput?.addEventListener("blur", function (e) {
    const lessonNumber = this.value.trim();
    if (lessonNumber === "" || lessonNumber === initialLessonNumber) return;

    // Get the selected section ID
    const sectionId = sectionSelect.value;
    if (!sectionId) return;

    // Include the current video ID and section ID in the request
    fetch(
      `/content/api/check-lesson-number/?number=${lessonNumber}&section_id=${sectionId}&current_id=${currentVideoId}`
    )
      .then((response) => {
        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        if (data.exists) {
          // Show toast notification
          showToast(
            "Warning",
            `Lesson number ${lessonNumber} already exists in this section. Please choose a different number.`,
            "warning"
          );
          this.classList.add("error");
        } else {
          this.classList.remove("error");
        }
      })
      .catch((error) => {
        console.error("Error checking lesson number:", error);
        // Remove the error class in case of API errors to avoid blocking submission
        this.classList.remove("error");
      });
  });

  // Also check when section changes
  sectionSelect?.addEventListener("change", function() {
    // If there's a value in the lesson number field, validate it for the new section
    if (lessonNumberInput.value.trim() !== "" && 
        lessonNumberInput.value.trim() !== initialLessonNumber) {
      lessonNumberInput.dispatchEvent(new Event('blur'));
    }
  });

  // Form validation
  form?.addEventListener("submit", function (e) {
    // Check if lesson number has error class
    if (lessonNumberInput.classList.contains("error")) {
      e.preventDefault();
      showToast(
        "Error",
        "Please resolve the duplicate lesson number issue before submitting.",
        "error"
      );
      lessonNumberInput.focus();
      return;
    }

    // Validate that video ID is provided
    if (bunnyVideoIdInput && !bunnyVideoIdInput.value.trim()) {
      e.preventDefault();
      showToast("Error", "Please enter a Bunny.net video ID", "error");
      bunnyVideoIdInput.focus();
    }
  });

  // Delete confirmation modal functionality
  const deleteButton = document.getElementById("deleteButton");
  const deleteModal = document.getElementById("deleteModal");
  const cancelDelete = document.getElementById("cancelDelete");

  if (deleteButton && deleteModal && cancelDelete) {
    // Show the modal when delete button is clicked
    deleteButton.addEventListener("click", function () {
      deleteModal.classList.add("active");
    });

    // Hide the modal when cancel is clicked
    cancelDelete.addEventListener("click", function () {
      deleteModal.classList.remove("active");
    });

    // Close modal when clicking outside
    deleteModal.addEventListener("click", function (e) {
      if (e.target === deleteModal) {
        deleteModal.classList.remove("active");
      }
    });
  }

  // Helper function to show toast notifications
  function showToast(title, message, type = "info") {
    // Check if the toast function exists (might be defined elsewhere)
    if (typeof window.showToast === "function") {
      window.showToast(title, message, type);
    } else {
      // Simple fallback if custom toast function isn't available
      console.log(`${type.toUpperCase()}: ${title} - ${message}`);
      alert(`${title}: ${message}`);
    }
  }
});
