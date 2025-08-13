// Create new file in GitHub called script.js
// Add this code:

function updateMetrics() {
    // Simulate real-time updates
    document.querySelector('.status-card:nth-child(1) p').innerHTML = 
        'Status: ' + (Math.random() > 0.5 ? 'Active' : 'Warning');
    
    // Update JVM Memory
    const jvmUsage = Math.floor(Math.random() * 100);
    document.querySelector('.status-card:nth-child(2) p').innerHTML = 
        `Usage: ${jvmUsage}%`;
}

// Update every 5 seconds
setInterval(updateMetrics, 5000);
