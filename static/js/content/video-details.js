document.addEventListener("DOMContentLoaded", function () {
  // Handle mark as watched button
  const markAsWatchedBtn = document.getElementById("markAsWatched");
  if (markAsWatchedBtn) {
    markAsWatchedBtn.addEventListener("click", async function () {
      const videoId = this.dataset.videoId;
      const currentState = this.classList.contains("watched");
      const originalHtml = this.innerHTML;
      
      // Disable button while processing
      this.disabled = true;

      try {
        // Send AJAX request to update watched status
        const response = await fetch(`/content/api/videos/${videoId}/mark-watched/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCsrfToken(),
          },
          body: JSON.stringify({
            watched: !currentState,
          }),
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || "Failed to update watched status");
        }

        // Only update UI after successful server response
        if (data.success) {
          // Update button state based on server response
          if (data.watched) {
            this.classList.add("watched");
            this.innerHTML = '<i class="fas fa-check-circle"></i> Marked as Watched';
          } else {
            this.classList.remove("watched");
            this.innerHTML = '<i class="far fa-circle"></i> Mark as Watched';
          }

          // Update the status indicator at the top of the page if it exists
          const statusIndicator = document.querySelector('.video-detail-status');
          if (statusIndicator) {
            const iconSpan = statusIndicator.querySelector('i');
            const textSpan = statusIndicator.querySelector('span');
            
            if (data.watched) {
              iconSpan.className = 'fas fa-check-circle';
              textSpan.textContent = 'Completed';
            } else {
              iconSpan.className = 'far fa-circle';
              textSpan.textContent = 'Not yet completed';
            }
          }
        }
      } catch (error) {
        console.error("Error:", error);
        // Keep the original state on error
        this.innerHTML = originalHtml;
        this.classList.toggle("watched", currentState);
      } finally {
        // Re-enable button after processing
        this.disabled = false;
      }
    });
  }

  // Toggle description expand/collapse
  const toggleButton = document.getElementById("toggleDescription");
  const descriptionContent = document.getElementById("descriptionContent");

  if (toggleButton && descriptionContent) {
    toggleButton.addEventListener("click", function () {
      const isCollapsed = descriptionContent.classList.contains("collapsed");

      // Toggle classes
      descriptionContent.classList.toggle("collapsed");
      descriptionContent.classList.toggle("expanded");

      // Update button text and icon
      if (isCollapsed) {
        toggleButton.innerHTML = '<i class="fas fa-chevron-up"></i> Show Less';
      } else {
        toggleButton.innerHTML = '<i class="fas fa-chevron-down"></i> Show More';
      }
    });

    // Check if description is long enough to need the toggle button
    function checkDescriptionLength() {
      // Get the content height
      const contentHeight = descriptionContent.scrollHeight;

      // If content is shorter than our max height, don't need the toggle
      if (contentHeight <= 300) {
        toggleButton.style.display = "none";
        descriptionContent.classList.remove("collapsed");
        descriptionContent.classList.add("expanded");
      } else {
        toggleButton.style.display = "inline-flex";
      }
    }

    // Run on page load and window resize
    checkDescriptionLength();
    window.addEventListener("resize", checkDescriptionLength);
  }

  // Helper function to get CSRF token
  function getCsrfToken() {
    const csrfInput = document.querySelector("[name=csrfmiddlewaretoken]");
    if (csrfInput) {
      return csrfInput.value;
    }
    // Fallback to cookie if token not found in form
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith("csrftoken="))
      ?.split("=")[1];
  }
});
