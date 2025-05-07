document.addEventListener('DOMContentLoaded', function() {
    // Mobile drawer toggle
    const drawerToggle = document.getElementById('drawerToggle');
    const adminDrawer = document.getElementById('adminDrawer');
    
    drawerToggle?.addEventListener('click', function() {
        adminDrawer.classList.toggle('active');
    });

    // Activity Timeline Toggle
    const timeline = document.getElementById('activityTimeline');
    const timelineToggle = document.getElementById('timelineToggle');
    
    if (timeline && timelineToggle) {
        // Show toggle button only if content height exceeds max-height
        if (timeline.scrollHeight > 300) {
            timelineToggle.style.display = 'block';
            timelineToggle.addEventListener('click', function() {
                timeline.classList.toggle('expanded');
                this.textContent = timeline.classList.contains('expanded') ? 'Show Less' : 'Show More';
            });
        } else {
            timelineToggle.style.display = 'none';
        }
    }

    // Timeline toggle functionality
    const timelineItems = timeline?.querySelectorAll('.timeline-item');

    if (timelineToggle && timelineItems?.length > 3) {
        // Initially hide items beyond the first 3
        timelineItems.forEach((item, index) => {
            if (index >= 3) {
                item.style.display = 'none';
            }
        });

        // Toggle visibility on button click
        timelineToggle.addEventListener('click', function() {
            const isExpanded = timelineToggle.classList.contains('expanded');
            
            timelineItems.forEach((item, index) => {
                if (index >= 3) {
                    item.style.display = isExpanded ? 'none' : 'block';
                }
            });

            timelineToggle.textContent = isExpanded ? 'Show More' : 'Show Less';
            timelineToggle.classList.toggle('expanded');
        });
    }

    // Helper function to get CSRF token
    function getCsrfToken() {
        const csrfInput = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfInput) {
            return csrfInput.value;
        }
        // Fallback to cookie if token not found in form
        return document.cookie
            .split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];
    }

    // Access Button Handler (using ban functionality)
    const accessButton = document.querySelector('.action-button[data-action="access"]');
    accessButton?.addEventListener('click', async function() {
        const userId = this.dataset.userId;
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) {
                throw new Error('CSRF token not found');
            }

            const response = await fetch(`/admin-board/users/ban/${userId}/`, {
                method: 'POST',
                headers: {
                    'X-CSRFToken': csrfToken,
                    'Content-Type': 'application/json'
                }
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.status === 'success') {
                    // Toggle the button text since ban toggles access
                    const currentStatus = this.dataset.currentStatus === 'true';
                    this.dataset.currentStatus = (!currentStatus).toString();
                    this.innerHTML = currentStatus ? 
                        '<i class="fas fa-user-check"></i> Grant Access' : 
                        '<i class="fas fa-user-slash"></i> Revoke Access';
                        
                    // Show success message
                    showToast('Success', 'Access status updated successfully', 'success');
                }
            } else {
                throw new Error('Failed to update access status');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error', 'Failed to update access status', 'error');
        }
    });

    // Email Button Handler
    const emailButton = document.querySelector('.action-button[data-action="email"]');
    emailButton?.addEventListener('click', function() {
        const email = this.dataset.email;
        window.location.href = `mailto:${email}`;
    });

    // Helper function to show toast notifications
    function showToast(title, message, type = 'info') {
        // Implementation of showToast function
    }
});