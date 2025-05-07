// Function to fetch dashboard statistics
async function fetchDashboardStats() {
    try {
        const response = await fetch('/admin-board/api/stats/');
        const data = await response.json();
        
        // Update statistics
        document.getElementById('totalUsers').textContent = data.active_users;
        document.getElementById('totalVideos').textContent = data.total_videos;
        document.getElementById('totalSections').textContent = data.total_sections;
        document.getElementById('waitingUsers').textContent = data.waiting_users;
        
        // Update percentages
        const totalUsers = data.total_users;
        const activeUsersPercentage = ((data.active_users / totalUsers) * 100).toFixed(0);
        document.getElementById('activeUsersPercentage').textContent = `${activeUsersPercentage}% of total users`;
        
    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
    }
}

// Refresh stats every 30 seconds
document.addEventListener('DOMContentLoaded', function() {
    fetchDashboardStats();
    setInterval(fetchDashboardStats, 30000);
});