// Dashboard Analytics Script
document.addEventListener('DOMContentLoaded', async () => {
    // Get user ID from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('id') || 'demo';
    
    // Initialize dashboard with user data
    await initializeDashboard(userId);
});

async function initializeDashboard(userId) {
    try {
        // Show loading state
        showLoadingState();

        // Fetch user data and analytics
        const userData = await fetchUserData(userId);
        const analyticsData = await fetchAnalyticsData(userId);

        // Update UI with data
        updateUserInfo(userData);
        updateStatistics(analyticsData);
        initializeCharts(analyticsData);
        updateRecentActivity(analyticsData.recentActivity);

        // Hide loading state
        hideLoadingState();
    } catch (error) {
        console.error('Error initializing dashboard:', error);
        showErrorState();
    }
}

function showLoadingState() {
    // Show skeleton loaders or spinner
    console.log('Loading dashboard...');
}

function hideLoadingState() {
    console.log('Dashboard loaded');
}

function showErrorState() {
    Swal.fire({
        icon: 'error',
        title: 'Error Loading Dashboard',
        text: 'Unable to load your analytics. Please try again later.',
        background: 'linear-gradient(145deg, rgb(23, 7, 2), rgb(37, 42, 15), rgb(23, 2, 4))',
        color: '#fff'
    });
}

async function fetchUserData(userId) {
    // For demo purposes, return mock data
    // In production, this would fetch from Google Sheets API
    if (userId === 'demo') {
        return {
            name: 'John Doe',
            email: 'john@example.com',
            link: 'johndoe',
            plan: 'Standard'
        };
    }

    // TODO: Integrate with actual Google Sheets API
    // const response = await fetch(`YOUR_GOOGLE_SCRIPT_URL?action=getUserData&id=${userId}`);
    // return await response.json();
    
    return {
        name: 'User',
        email: 'user@example.com',
        link: 'user',
        plan: 'Standard'
    };
}

async function fetchAnalyticsData(userId) {
    // For demo purposes, return mock analytics data
    // In production, this would fetch from Google Sheets API or analytics service
    
    if (userId === 'demo') {
        return generateMockAnalytics();
    }

    // TODO: Integrate with actual analytics backend
    return generateMockAnalytics();
}

function generateMockAnalytics() {
    return {
        totalViews: 1247,
        totalClicks: 342,
        contactSaves: 89,
        engagementRate: 27.4,
        viewsOverTime: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            data: [45, 62, 58, 73, 91, 67, 84]
        },
        topLinks: {
            labels: ['LinkedIn', 'Website', 'Email', 'Phone', 'Portfolio'],
            data: [85, 72, 54, 43, 28]
        },
        recentActivity: [
            {
                type: 'view',
                message: 'Profile viewed from New York, USA',
                timestamp: '2 hours ago',
                icon: 'fa-eye',
                color: 'blue'
            },
            {
                type: 'click',
                message: 'LinkedIn link clicked',
                timestamp: '3 hours ago',
                icon: 'fa-mouse-pointer',
                color: 'purple'
            },
            {
                type: 'save',
                message: 'Contact saved to phone',
                timestamp: '5 hours ago',
                icon: 'fa-download',
                color: 'yellow'
            },
            {
                type: 'view',
                message: 'Profile viewed from London, UK',
                timestamp: '8 hours ago',
                icon: 'fa-eye',
                color: 'blue'
            },
            {
                type: 'click',
                message: 'Website link clicked',
                timestamp: '1 day ago',
                icon: 'fa-mouse-pointer',
                color: 'purple'
            }
        ]
    };
}

function updateUserInfo(userData) {
    const userName = document.getElementById('userName');
    const profileLink = document.getElementById('profileLink');
    
    if (userName) {
        userName.textContent = userData.name;
    }
    
    if (profileLink && userData.link) {
        profileLink.href = `https://card.tccards.tn/profile/@${userData.link}`;
    }
}

function updateStatistics(analyticsData) {
    // Update stat cards with smooth counting animation
    animateValue('totalViews', 0, analyticsData.totalViews, 1500);
    animateValue('totalClicks', 0, analyticsData.totalClicks, 1500);
    animateValue('contactSaves', 0, analyticsData.contactSaves, 1500);
    
    const engagementRate = document.getElementById('engagementRate');
    if (engagementRate) {
        animateValue('engagementRate', 0, analyticsData.engagementRate, 1500, '%');
    }
}

function animateValue(elementId, start, end, duration, suffix = '') {
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        element.textContent = Math.round(current) + suffix;
    }, 16);
}

function initializeCharts(analyticsData) {
    // Initialize Views Chart
    const viewsCtx = document.getElementById('viewsChart');
    if (viewsCtx) {
        new Chart(viewsCtx, {
            type: 'line',
            data: {
                labels: analyticsData.viewsOverTime.labels,
                datasets: [{
                    label: 'Profile Views',
                    data: analyticsData.viewsOverTime.data,
                    borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: 'rgb(59, 130, 246)',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 5,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(59, 130, 246, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }

    // Initialize Links Chart
    const linksCtx = document.getElementById('linksChart');
    if (linksCtx) {
        new Chart(linksCtx, {
            type: 'bar',
            data: {
                labels: analyticsData.topLinks.labels,
                datasets: [{
                    label: 'Clicks',
                    data: analyticsData.topLinks.data,
                    backgroundColor: [
                        'rgba(147, 51, 234, 0.7)',
                        'rgba(168, 85, 247, 0.7)',
                        'rgba(192, 132, 252, 0.7)',
                        'rgba(216, 180, 254, 0.7)',
                        'rgba(233, 213, 255, 0.7)'
                    ],
                    borderColor: [
                        'rgb(147, 51, 234)',
                        'rgb(168, 85, 247)',
                        'rgb(192, 132, 252)',
                        'rgb(216, 180, 254)',
                        'rgb(233, 213, 255)'
                    ],
                    borderWidth: 2,
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(147, 51, 234, 0.5)',
                        borderWidth: 1
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    },
                    x: {
                        ticks: {
                            color: 'rgba(255, 255, 255, 0.6)'
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        }
                    }
                }
            }
        });
    }
}

function updateRecentActivity(activities) {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    activityList.innerHTML = '';

    activities.forEach((activity, index) => {
        const activityItem = document.createElement('div');
        activityItem.className = 'flex items-center space-x-4 p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-colors animate-fade-in';
        activityItem.style.animationDelay = `${index * 0.1}s`;
        activityItem.style.opacity = '0';
        
        const colorMap = {
            blue: 'text-blue-400 bg-blue-500/20',
            purple: 'text-purple-400 bg-purple-500/20',
            yellow: 'text-yellow-400 bg-yellow-500/20',
            green: 'text-green-400 bg-green-500/20'
        };
        
        activityItem.innerHTML = `
            <div class="flex-shrink-0 w-12 h-12 ${colorMap[activity.color]} rounded-full flex items-center justify-center">
                <i class="fas ${activity.icon}"></i>
            </div>
            <div class="flex-grow">
                <p class="text-white font-medium">${activity.message}</p>
                <p class="text-gray-400 text-sm">${activity.timestamp}</p>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

// Export functions for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        initializeDashboard,
        updateStatistics,
        initializeCharts,
        updateRecentActivity
    };
}
