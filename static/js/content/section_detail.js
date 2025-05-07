  document.addEventListener("DOMContentLoaded", function () {
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
    
    // Calculate and update section progress
    function updateCourseProgress() {
      // More specific selector to target only visible video items directly in the videos-list container
      const videoItems = document.querySelectorAll('.videos-list > .video-item');
      const totalVideos = videoItems.length;
      let completedVideos = 0;
      
      videoItems.forEach(item => {
        if (item.getAttribute('data-completed') === 'true') {
          completedVideos++;
        }
      });
      
      const progressPercentage = totalVideos > 0 ? Math.round((completedVideos / totalVideos) * 100) : 0;
      const progressFill = document.getElementById('courseProgressFill');
      const progressText = document.getElementById('courseProgressText');
      const progressPercentageText = document.getElementById('courseProgressPercentage');
      
      if (progressFill) {
        progressFill.style.width = `${progressPercentage}%`;
      }
      
      if (progressText) {
        progressText.textContent = `${completedVideos}/${totalVideos} completed`;
      }
      
      if (progressPercentageText) {
        progressPercentageText.textContent = `${progressPercentage}%`;
      }
    }
    
    // Initialize progress
    setTimeout(updateCourseProgress, 100); // Short delay to ensure DOM is fully processed
  });