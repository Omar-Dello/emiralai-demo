/** dashboard.js file
 * =============================================================================
 * DASHBOARD.JS
 * =============================================================================
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * =============================================================================
 * Description: Main JavaScript file for dashboard functionality with complete
 * user data integration from auth-popups.js localStorage.
 * 
 * TABLE OF CONTENTS:
 * =============================================================================
 * 1. USER DATA MANAGEMENT
 *    1.1 Configuration
 *    1.2 Load User Data
 *    1.3 Update Interface
 *    1.4 Session Management
 *    1.5 Logout Handling
 * 
 * 2. SIDEBAR FUNCTIONALITY
 *    2.1 Mobile Toggle
 *    2.2 Navigation
 *    2.3 Responsive Behavior
 * 
 * 3. DROPDOWN MENUS
 *    3.1 Notifications
 *    3.2 Help Menu
 *    3.3 User Menu
 * 
 * 4. CHART VISUALIZATION
 *    4.1 Chart Setup
 *    4.2 Data Management
 *    4.3 Period Switching
 * 
 * 5. PROJECT MANAGEMENT
 *    5.1 Filters
 *    5.2 Table Actions
 * 
 * 6. DATE RANGE PICKER
 *    6.1 Initialization
 *    6.2 Range Selection
 *    6.3 Custom Dates
 * 
 * 7. THEME INTEGRATION
 *    7.1 Chart Colors
 *    7.2 Theme Switching
 * 
 * 8. INITIALIZATION
 *    8.1 Setup Functions
 *    8.2 Event Listeners
 * =============================================================================
 */

document.addEventListener('DOMContentLoaded', function () {
    'use strict';

    // Global variables for chart instances
    let apiUsageChart = null;
    let performanceChart = null;
    let usageDistributionChart = null;

    /**
     * =============================================================================
     * 1. USER DATA MANAGEMENT
     * =============================================================================
     */

    /**
     * 1.1 User Data Configuration
     * IMPORTANT: This key MUST match the one used in auth-popups.js
     */
    const userDataConfig = {
        // LocalStorage key - MUST be same as in auth-popups.js
        storageKey: 'emiralai_user_data',

        // Default values if user data is not found
        defaults: {
            name: 'Guest User',
            email: 'guest@emiralai.com',
            profileImage: null, // Will be generated dynamically
            plan: 'Free Plan'
        },

        // DOM elements to update with user data
        elements: {
            // Sidebar elements
            sidebarUserName: '.sidebar-user .user-info h3',
            sidebarUserAvatar: '.sidebar-user .user-avatar img',
            sidebarUserPlan: '.sidebar-user .user-plan',

            // Header elements
            headerUserName: '.user-menu .user-name',
            headerUserAvatar: '.user-menu .user-avatar-small img',

            // Profile links
            profileLinks: 'a[href="user-profile.html"]'
        }
    };

    /**
 * Generate user avatar with initials
 * Consistent with other modules
 * @param {Object} userData - User data object
 * @returns {string} Data URL for avatar SVG
 */
    function generateUserAvatar(userData) {
        const name = userData?.name || 'Guest User';
        const email = userData?.email || 'user@example.com';

        // Extract initials
        let initials = 'U';
        if (name && name !== 'Guest User') {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                initials = parts[0][0] + parts[parts.length - 1][0];
            } else if (parts[0].length >= 2) {
                initials = parts[0].substring(0, 2);
            } else {
                initials = parts[0][0];
            }
        } else if (email && email !== 'user@example.com') {
            const emailName = email.split('@')[0];
            initials = emailName.substring(0, 2);
        }
        initials = initials.toUpperCase();

        // Generate consistent color based on email
        const str = (email || name || 'default').toLowerCase();
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }

        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1F2', '#F8B739', '#52C41A'
        ];

        const backgroundColor = colors[Math.abs(hash) % colors.length];

        // Create SVG
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
        <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
              font-size="40" font-weight="600" fill="#FFFFFF" text-anchor="middle" 
              dominant-baseline="middle">${initials}</text>
    </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    }

    /**
     * 1.2 Load User Data from LocalStorage
     * Retrieves user data saved by auth-popups.js
     * @returns {Object} User data with defaults for missing values
     */
    function loadUserData() {
        try {
            // First try centralized data manager
            if (window.EmiralUserData && typeof window.EmiralUserData.getUserData === 'function') {
                const centralData = window.EmiralUserData.getUserData();
                if (centralData) {
                    console.log('User data loaded from centralized manager:', centralData.email);

                    // Ensure avatar is generated if needed
                    if (!centralData.profileImage ||
                        centralData.profileImage.includes('emiral') ||
                        centralData.profileImage.includes('pexels') ||
                        centralData.profileImage.includes('default')) {
                        centralData.profileImage = generateUserAvatar(centralData);
                    }

                    return centralData;
                }
            }

            // Fallback to localStorage
            const storedData = localStorage.getItem(userDataConfig.storageKey);

            if (!storedData) {
                console.log('No user data found, using defaults');
                const defaultData = { ...userDataConfig.defaults };
                defaultData.profileImage = generateUserAvatar(defaultData);
                return defaultData;
            }

            const userData = JSON.parse(storedData);
            console.log('User data loaded from localStorage:', userData.email);

            // Generate avatar if needed
            if (!userData.profileImage ||
                userData.profileImage.includes('emiral') ||
                userData.profileImage.includes('pexels') ||
                userData.profileImage.includes('default')) {
                userData.profileImage = generateUserAvatar(userData);
            }

            // Merge with defaults to ensure all fields exist
            return {
                name: userData.name || userDataConfig.defaults.name,
                email: userData.email || userDataConfig.defaults.email,
                profileImage: userData.profileImage,
                plan: userData.plan || determinePlanFromData(userData),
                loginTime: userData.loginTime || null,
                sessionExpiry: userData.sessionExpiry || null
            };

        } catch (error) {
            console.error('Error loading user data:', error);
            const defaultData = { ...userDataConfig.defaults };
            defaultData.profileImage = generateUserAvatar(defaultData);
            return defaultData;
        }
    }

    /**
    * Determine user plan based on data
    * @param {Object} userData - User data object
    * @returns {string} User plan name
    */
    function determinePlanFromData(userData) {
        // Use actual plan data from storage
        const plan = userData.plan || 'Free Plan';
        return plan;
    }

    /**
     * 1.3 Update Interface with User Data
     * Updates all dashboard elements with loaded user data
     * @param {Object} userData - User data object
     */
    function updateUserInterface(userData) {
        try {
            // Update sidebar user name
            const sidebarUserName = document.querySelector(userDataConfig.elements.sidebarUserName);
            if (sidebarUserName) {
                sidebarUserName.textContent = userData.name;
                console.log('Updated sidebar name:', userData.name);
            }

            // Update sidebar avatar with error handling
            const sidebarUserAvatar = document.querySelector(userDataConfig.elements.sidebarUserAvatar);
            if (sidebarUserAvatar) {
                // First, set a loading state (optional)
                sidebarUserAvatar.style.opacity = '0.5';

                // Check if avatar needs to be generated
                let avatarUrl = userData.profileImage;
                if (!avatarUrl ||
                    avatarUrl.includes('emiral') ||
                    avatarUrl.includes('pexels') ||
                    avatarUrl.includes('default')) {
                    avatarUrl = generateUserAvatar(userData);
                }

                // Create new image to test if URL is valid
                const testImage = new Image();
                testImage.onload = function () {
                    // Image loaded successfully
                    sidebarUserAvatar.src = avatarUrl;
                    sidebarUserAvatar.alt = `${userData.name}'s Avatar`;
                    sidebarUserAvatar.style.opacity = '1';
                };
                testImage.onerror = function () {
                    // Image failed to load, generate new avatar
                    console.warn('Failed to load user avatar, generating new one');
                    sidebarUserAvatar.src = generateUserAvatar(userData);
                    sidebarUserAvatar.alt = 'User Avatar';
                    sidebarUserAvatar.style.opacity = '1';
                };
                testImage.src = avatarUrl;
            }

            // Update sidebar plan
            const sidebarUserPlan = document.querySelector(userDataConfig.elements.sidebarUserPlan);
            if (sidebarUserPlan) {
                sidebarUserPlan.textContent = userData.plan;

                // Add plan-specific styling
                sidebarUserPlan.className = 'user-plan';
                if (userData.plan && userData.plan.includes('Pro')) {
                    sidebarUserPlan.classList.add('pro-plan');
                }
            }

            // Update header user name
            const headerUserName = document.querySelector(userDataConfig.elements.headerUserName);
            if (headerUserName) {
                headerUserName.textContent = userData.name;
            }

            // Update header avatar
            const headerUserAvatar = document.querySelector(userDataConfig.elements.headerUserAvatar);
            if (headerUserAvatar) {
                let avatarUrl = userData.profileImage;
                if (!avatarUrl ||
                    avatarUrl.includes('emiral') ||
                    avatarUrl.includes('pexels') ||
                    avatarUrl.includes('default')) {
                    avatarUrl = generateUserAvatar(userData);
                }

                headerUserAvatar.src = avatarUrl;
                headerUserAvatar.alt = `${userData.name}'s Avatar`;

                headerUserAvatar.onerror = function () {
                    this.src = generateUserAvatar(userData);
                };
            }

            // Update any profile links with user email as parameter
            const profileLinks = document.querySelectorAll(userDataConfig.elements.profileLinks);
            profileLinks.forEach(link => {
                // Add user email as URL parameter for profile page
                const url = new URL(link.href, window.location.origin);
                url.searchParams.set('email', userData.email);
                link.href = url.toString();
            });

            console.log('User interface updated successfully');

        } catch (error) {
            console.error('Error updating user interface:', error);
        }
    }

    /**
     * 1.4 Check Session Validity
     * Verifies if user session is still valid
     * @param {Object} userData - User data object
     * @returns {boolean} True if session is valid
     */
    function isSessionValid(userData) {
        if (!userData.sessionExpiry) {
            // No expiry means permanent session
            return true;
        }

        const expiryDate = new Date(userData.sessionExpiry);
        const currentDate = new Date();

        if (currentDate >= expiryDate) {
            console.warn('User session has expired');
            return false;
        }

        // Optional: Warn if session is about to expire (within 1 hour)
        const oneHourFromNow = new Date(currentDate.getTime() + (60 * 60 * 1000));
        if (oneHourFromNow >= expiryDate) {
            console.warn('Session will expire soon');
            // You could show a notification here
        }

        return true;
    }

    /**
     * 1.5 Handle User Logout
     * Clears user data and redirects to home
     */
    function handleLogout() {
        try {
            // Show loading state (optional)
            const logoutBtns = document.querySelectorAll('.logout-link, .logout-btn');
            logoutBtns.forEach(btn => {
                btn.classList.add('loading');
                btn.style.pointerEvents = 'none';
            });

            // Clear user data through centralized manager if available
            if (window.EmiralUserData && typeof window.EmiralUserData.clearUserData === 'function') {
                window.EmiralUserData.clearUserData();
            } else {
                // Fallback: Clear localStorage directly
                localStorage.removeItem(userDataConfig.storageKey);
            }

            // Clear any other session data
            sessionStorage.clear();

            // Trigger logout event
            window.dispatchEvent(new Event('userLoggedOut'));

            console.log('User logged out successfully');

            // Redirect after short delay for better UX
            setTimeout(() => {
                window.location.href = 'main.html';
            }, 300);

        } catch (error) {
            console.error('Error during logout:', error);
            // Force redirect on error
            window.location.href = 'main.html';
        }
    }

    /**
     * Setup Logout Event Handlers
     * Attaches logout functionality to all logout elements
     */
    function setupLogoutHandlers() {
        const logoutElements = document.querySelectorAll('.logout-link, .logout-btn');

        logoutElements.forEach(element => {
            element.addEventListener('click', function (e) {
                e.preventDefault();

                // Optional: Add confirmation
                if (this.dataset.confirmLogout === 'true') {
                    const confirmed = confirm('Are you sure you want to logout?');
                    if (!confirmed) return;
                }

                handleLogout();
            });
        });
    }

    /**
     * Initialize User Data System
     * Main initialization function for user data management
     */
    function initializeUserData() {
        console.log('Initializing user data management...');

        // Load user data
        const userData = loadUserData();

        // Check session validity
        if (!isSessionValid(userData)) {
            handleLogout();
            return;
        }

        // Update UI
        updateUserInterface(userData);

        // Sync with centralized data manager
        if (window.EmiralUserData) {
            // Listen for user data updates
            window.addEventListener('userDataUpdated', function (event) {
                if (event.detail) {
                    const newUserData = loadUserData();
                    updateUserInterface(newUserData);
                }
            });
        }

        // Setup logout handlers
        setupLogoutHandlers();

        // Listen for storage changes (user logged out in another tab)
        window.addEventListener('storage', function (e) {
            if (e.key === userDataConfig.storageKey) {
                if (!e.newValue) {
                    // User data was removed (logged out)
                    console.log('User logged out in another tab');
                    window.location.href = 'main.html';
                } else {
                    // User data was updated
                    try {
                        const newUserData = JSON.parse(e.newValue);
                        updateUserInterface(newUserData);
                    } catch (error) {
                        console.error('Error parsing updated user data:', error);
                    }
                }
            }
        });

        // Listen for custom events
        window.addEventListener('userLoggedOut', function () {
            window.location.href = 'main.html';
        });
    }

    // Initialize user data immediately
    initializeUserData();

    /**
     * =============================================================================
     * 2. SIDEBAR FUNCTIONALITY
     * =============================================================================
     */

    // Elements
    const sidebar = document.querySelector('.dashboard-sidebar');
    const dashboardMain = document.querySelector('.dashboard-main');
    const dashboardHeader = document.querySelector('.dashboard-header');

    // Create mobile menu toggle button
    const mobileMenuToggle = document.createElement('button');
    mobileMenuToggle.className = 'mobile-menu-toggle';
    mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuToggle.setAttribute('aria-label', 'Toggle mobile menu');

    // Add mobile menu toggle to header
    if (dashboardHeader) {
        dashboardHeader.insertBefore(mobileMenuToggle, dashboardHeader.firstChild);
    }

    // Create sidebar backdrop for mobile
    const sidebarBackdrop = document.createElement('div');
    sidebarBackdrop.className = 'sidebar-backdrop';
    document.body.appendChild(sidebarBackdrop);

    // Toggle sidebar on mobile menu click
    mobileMenuToggle.addEventListener('click', function () {
        sidebar.classList.toggle('mobile-visible');

        // Update icon based on state
        if (sidebar.classList.contains('mobile-visible')) {
            mobileMenuToggle.innerHTML = '<i class="fas fa-times"></i>';
            sidebarBackdrop.classList.add('active');
        } else {
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            sidebarBackdrop.classList.remove('active');
        }
    });

    // Close sidebar when clicking on backdrop
    sidebarBackdrop.addEventListener('click', function () {
        sidebar.classList.remove('mobile-visible');
        sidebarBackdrop.classList.remove('active');
        mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
    });

    // Handle window resize
    window.addEventListener('resize', function () {
        if (window.innerWidth > 768) {
            sidebar.classList.remove('mobile-visible');
            sidebarBackdrop.classList.remove('active');
            mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });

    /**
     * =============================================================================
     * 2.2 NAVIGATION & SECTION SWITCHING
     * =============================================================================
     */

    // Handle navigation between dashboard sections
    const navLinks = document.querySelectorAll('.sidebar-nav a');

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            // Remove active class from all links and their parent li
            navLinks.forEach(item => {
                item.classList.remove('active');
                item.parentElement?.classList.remove('active');
            });

            // Add active class to clicked link and its parent li
            this.classList.add('active');
            this.parentElement?.classList.add('active');

            // Get section ID from data attribute
            const sectionId = this.getAttribute('data-section');

            // Hide all sections
            document.querySelectorAll('.dashboard-section').forEach(section => {
                section.classList.remove('active');
            });

            // Show selected section
            const targetSection = document.getElementById(sectionId);
            if (targetSection) {
                targetSection.classList.add('active');

                // Update URL hash without scrolling
                history.pushState(null, null, `#${sectionId}`);
            }

            // Close sidebar on mobile after navigation
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('mobile-visible');
                sidebarBackdrop.classList.remove('active');
                mobileMenuToggle.innerHTML = '<i class="fas fa-bars"></i>';
            }
        });
    });

    /**
     * =============================================================================
     * 3. DROPDOWN MENUS
     * =============================================================================
     */

    // Handle dropdown menus (notifications, help, user menu)
    const dropdownToggles = {
        '.notification-btn': '.notifications',
        '.help-btn': '.help-support',
        '.user-menu-btn': '.user-menu'
    };

    // Set up each dropdown toggle
    for (const [toggleSelector, parentSelector] of Object.entries(dropdownToggles)) {
        const toggleButton = document.querySelector(toggleSelector);
        const parentElement = document.querySelector(parentSelector);

        if (toggleButton && parentElement) {
            toggleButton.addEventListener('click', function (e) {
                e.stopPropagation();

                // Close other dropdowns
                for (const otherParentSelector of Object.values(dropdownToggles)) {
                    if (otherParentSelector !== parentSelector) {
                        document.querySelector(otherParentSelector)?.classList.remove('active');
                    }
                }

                // Toggle current dropdown
                parentElement.classList.toggle('active');
            });
        }
    }

    // Close dropdowns when clicking outside
    document.addEventListener('click', function () {
        for (const parentSelector of Object.values(dropdownToggles)) {
            document.querySelector(parentSelector)?.classList.remove('active');
        }
    });

    /**
     * =============================================================================
     * 4. CHART VISUALIZATION
     * =============================================================================
     */

    // Get the API Usage Chart canvas
    const apiUsageChartCanvas = document.getElementById('apiUsageChart');

    if (apiUsageChartCanvas) {
        // Chart configuration and data
        const labels = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        const currentYear = new Date().getFullYear();

        // Sample data - integrate with user data if available
        const apiData = {
            daily: generateRandomData(30),
            weekly: generateRandomData(12),
            monthly: [
                42500, 48200, 51300, 57600, 62100, 68400,
                71200, 69800, 72300, 75400, 68900, 75425
            ]
        };

        // If EmiralUserData is available, use real data
        if (window.EmiralUserData) {
            const userData = window.EmiralUserData.getUserData();
            if (userData && userData.usage) {
                // Use real API usage data if available
                if (userData.usage.monthlyApiCalls) {
                    apiData.monthly = userData.usage.monthlyApiCalls;
                }

                // update the API limit display
                const apiLimitElement = document.querySelector('.stat-value[data-stat="api-limit"]');
                if (apiLimitElement && userData.usage.apiLimit) {
                    const used = userData.usage.apiCallsUsed || 75425;
                    const limit = userData.usage.apiLimit || 100000;
                    apiLimitElement.textContent = `${used.toLocaleString()} / ${limit.toLocaleString()}`;
                }
            }
        }

        // Create chart with monthly data by default
        apiUsageChart = new Chart(apiUsageChartCanvas, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: `API Calls (${currentYear})`,
                    data: apiData.monthly,
                    fill: true,
                    backgroundColor: 'rgba(0, 162, 255, 0.2)',
                    borderColor: 'rgba(0, 162, 255, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(0, 162, 255, 1)',
                    pointBorderColor: '#fff',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    tension: 0.3
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'top',
                        labels: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        mode: 'index',
                        intersect: false,
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        padding: 10,
                        cornerRadius: 4,
                        caretSize: 5,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color'),
                            callback: function (value) {
                                if (value >= 1000) {
                                    return value / 1000 + 'k';
                                }
                                return value;
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });

        // Chart period toggle buttons
        const chartPeriodBtns = document.querySelectorAll('.chart-period-btn');

        chartPeriodBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                // Remove active class from all buttons
                chartPeriodBtns.forEach(item => {
                    item.classList.remove('active');
                });

                // Add active class to clicked button
                this.classList.add('active');

                // Get period from data attribute
                const period = this.getAttribute('data-period');

                // Update chart data based on period
                updateChartData(period);
            });
        });

        /**
         * Update chart data based on selected period
         * @param {string} period - Selected time period
         */
        function updateChartData(period) {
            let newLabels = labels;
            let newData = apiData.monthly;

            if (period === 'daily') {
                // Last 30 days
                newLabels = Array.from({ length: 30 }, (_, i) => {
                    const date = new Date();
                    date.setDate(date.getDate() - 29 + i);
                    return date.getDate();
                });
                newData = apiData.daily;
            } else if (period === 'weekly') {
                // Last 12 weeks
                newLabels = Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`);
                newData = apiData.weekly;
            }

            // Update chart data
            apiUsageChart.data.labels = newLabels;
            apiUsageChart.data.datasets[0].data = newData;

            // Update label
            if (period === 'daily') {
                apiUsageChart.data.datasets[0].label = 'API Calls (Last 30 Days)';
            } else if (period === 'weekly') {
                apiUsageChart.data.datasets[0].label = 'API Calls (Last 12 Weeks)';
            } else {
                apiUsageChart.data.datasets[0].label = `API Calls (${currentYear})`;
            }

            // Refresh chart
            apiUsageChart.update();
        }
    }

    /**
     * Generate random data for chart demo
     * @param {number} count - Number of data points
     * @returns {Array} Array of random numbers
     */
    function generateRandomData(count) {
        return Array.from({ length: count }, () => Math.floor(Math.random() * 80000) + 20000);
    }

    /**
     * =============================================================================
     * 5. PROJECT MANAGEMENT
     * =============================================================================
     */

    // Handle project filters
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            // Get the filter group
            const filterGroup = this.closest('.filter-group');

            // Remove active class from all buttons in this group
            filterGroup.querySelectorAll('.filter-btn').forEach(item => {
                item.classList.remove('active');
            });

            // Add active class to clicked button
            this.classList.add('active');

            // Filter logic would be implemented here
            console.log('Filter selected:', this.textContent);
        });
    });

    // Handle table row actions
    const actionButtons = document.querySelectorAll('.action-btn');

    actionButtons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            const actionType = this.getAttribute('aria-label');
            console.log(`Action: ${actionType}`);
        });
    });

    /**
     * =============================================================================
     * 6. DATE RANGE PICKER
     * =============================================================================
     */

    /**
     * Initialize Date Range Picker
     */
    function initializeDateRangePicker() {
        const dateRangePickers = document.querySelectorAll('.date-range-picker');
        dateRangePickers.forEach(picker => {
            setupDateRangePicker(picker);
        });
    }

    /**
     * Setup individual date range picker
     * @param {HTMLElement} picker - Date range picker element
     */
    function setupDateRangePicker(picker) {
        const btn = picker.querySelector('.date-range-btn');
        const dropdown = picker.querySelector('.date-range-dropdown');
        const dateOptions = picker.querySelectorAll('.date-option');
        const customSelect = picker.querySelector('.date-custom-select');
        const quickSelect = picker.querySelector('.date-quick-select');
        const cancelBtn = picker.querySelector('.date-cancel-btn');
        const applyBtn = picker.querySelector('.date-apply-btn');
        const dateFromInput = picker.querySelector('#date-from');
        const dateToInput = picker.querySelector('#date-to');

        if (!btn || !dropdown) return;

        let currentRange = 'last30days';

        // Toggle dropdown
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            picker.classList.toggle('active');
            btn.setAttribute('aria-expanded', picker.classList.contains('active'));
        });

        // Handle date option selection
        dateOptions.forEach(option => {
            option.addEventListener('click', function () {
                const range = this.getAttribute('data-range');

                if (range === 'custom') {
                    quickSelect.style.display = 'none';
                    customSelect.style.display = 'block';

                    const today = new Date();
                    const lastMonth = new Date();
                    lastMonth.setDate(lastMonth.getDate() - 30);

                    dateFromInput.value = formatDateForInput(lastMonth);
                    dateToInput.value = formatDateForInput(today);
                    dateFromInput.focus();
                } else {
                    dateOptions.forEach(opt => opt.classList.remove('active'));
                    this.classList.add('active');
                    currentRange = range;

                    const dateRange = calculateDateRange(range);
                    updateDateDisplay(picker, dateRange, range);

                    setTimeout(() => {
                        picker.classList.remove('active');
                    }, 300);
                }
            });
        });

        // Cancel custom date selection
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                customSelect.style.display = 'none';
                quickSelect.style.display = 'grid';
            });
        }

        // Apply custom date selection
        if (applyBtn) {
            applyBtn.addEventListener('click', () => {
                const startDate = new Date(dateFromInput.value);
                const endDate = new Date(dateToInput.value);

                if (startDate > endDate) {
                    alert('Start date must be before end date');
                    return;
                }

                const dateRange = { start: startDate, end: endDate };
                updateDateDisplay(picker, dateRange, 'custom');

                customSelect.style.display = 'none';
                quickSelect.style.display = 'grid';

                dateOptions.forEach(opt => opt.classList.remove('active'));
                picker.querySelector('[data-range="custom"]').classList.add('active');

                setTimeout(() => {
                    picker.classList.remove('active');
                }, 300);
            });
        }

        // Initialize with default range
        const defaultRange = calculateDateRange(currentRange);
        updateDateDisplay(picker, defaultRange, currentRange);
    }

    /**
     * Calculate date range
     * @param {string} range - Range identifier
     * @returns {Object} Start and end dates
     */
    function calculateDateRange(range) {
        const today = new Date();
        const start = new Date();
        const end = new Date();

        today.setHours(0, 0, 0, 0);
        start.setHours(0, 0, 0, 0);
        end.setHours(23, 59, 59, 999);

        switch (range) {
            case 'today':
                start.setTime(today.getTime());
                end.setTime(today.getTime());
                end.setHours(23, 59, 59, 999);
                break;
            case 'yesterday':
                start.setDate(today.getDate() - 1);
                end.setDate(today.getDate() - 1);
                end.setHours(23, 59, 59, 999);
                break;
            case 'last7days':
                start.setDate(today.getDate() - 6);
                break;
            case 'last30days':
                start.setDate(today.getDate() - 29);
                break;
            case 'thismonth':
                start.setDate(1);
                break;
            case 'lastmonth':
                start.setDate(1);
                start.setMonth(start.getMonth() - 1);
                end.setDate(0);
                break;
            case 'last3months':
                start.setMonth(today.getMonth() - 3);
                break;
            default:
                start.setDate(today.getDate() - 29);
        }

        return { start, end };
    }

    /**
     * Update date display
     * @param {HTMLElement} picker - Picker element
     * @param {Object} dateRange - Date range object
     * @param {string} rangeType - Range type
     */
    function updateDateDisplay(picker, dateRange, rangeType) {
        const dateRangeText = picker.querySelector('.date-range-text');
        const selectionText = picker.querySelector('.date-selection-text');

        const rangeLabels = {
            'today': 'Today',
            'yesterday': 'Yesterday',
            'last7days': 'Last 7 Days',
            'last30days': 'Last 30 Days',
            'thismonth': 'This Month',
            'lastmonth': 'Last Month',
            'last3months': 'Last 3 Months',
            'custom': `${formatDateShort(dateRange.start)} - ${formatDateShort(dateRange.end)}`
        };

        if (dateRangeText) {
            dateRangeText.textContent = rangeLabels[rangeType] || 'Select Range';
        }

        if (selectionText) {
            selectionText.innerHTML = `Showing data from <strong>${formatDateLong(dateRange.start)}</strong> to <strong>${formatDateLong(dateRange.end)}</strong>`;
        }
    }

    /**
     * Format date for input
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    function formatDateForInput(date) {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    /**
     * Format date short
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    function formatDateShort(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        return `${month}/${day}/${year}`;
    }

    /**
     * Format date long
     * @param {Date} date - Date object
     * @returns {string} Formatted date
     */
    function formatDateLong(date) {
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    }

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.date-range-picker')) {
            document.querySelectorAll('.date-range-picker').forEach(picker => {
                picker.classList.remove('active');
            });
        }
    });

    // Initialize date range pickers
    initializeDateRangePicker();

    /**
     * =============================================================================
     * 7. THEME INTEGRATION
     * =============================================================================
     */

    /**
     * Update chart colors based on theme
     */
    function updateChartColors() {
        const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color').trim();

        // Update API Usage Chart
        if (apiUsageChart) {
            apiUsageChart.options.plugins.legend.labels.color = textColor;
            apiUsageChart.options.scales.x.ticks.color = textColor;
            apiUsageChart.options.scales.y.ticks.color = textColor;
            apiUsageChart.update();
        }

        // Update Performance Chart
        if (performanceChart) {
            performanceChart.options.scales.x.ticks.color = textColor;
            performanceChart.options.scales.y.ticks.color = textColor;
            performanceChart.update();
        }

        // Update Usage Distribution Chart
        if (usageDistributionChart) {
            usageDistributionChart.options.plugins.legend.labels.color = textColor;
            usageDistributionChart.update();
        }
    }

    // Listen for theme changes
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function () {
            setTimeout(updateChartColors, 100);
        });
    }

    /**
     * =============================================================================
     * 8. INITIALIZATION
     * =============================================================================
     */

    // Set default active section
    const defaultSection = document.getElementById('overview-section');
    if (defaultSection) {
        defaultSection.classList.add('active');
    }

    // Set active nav link based on URL hash
    const hash = window.location.hash;
    if (hash) {
        const targetLink = document.querySelector(`.sidebar-nav a[href="${hash}"]`);
        if (targetLink) {
            targetLink.click();
        }
    }

    // Listen for date range changes
    document.addEventListener('dateRangeChanged', (e) => {
        console.log('Date range changed:', e.detail);
        // Update data based on new range
    });

    /**
     * =============================================================================
     * ADDITIONAL DASHBOARD FEATURES FOR NEW SECTIONS
     * Analytics Section Charts
     * API Section - Code Examples Tab Switching
     * 
     * Setting Form Handling
     * Dataset Upload Simulation
     * Model Training Progress Animation
     * Search Functionality for Datasets
     * Notification for Model Actions
     * =============================================================================
     */

    /**
     * Analytics Section Charts
     */

    // Performance Chart
    const performanceChartCanvas = document.getElementById('performanceChart');
    if (performanceChartCanvas) {
        performanceChart = new Chart(performanceChartCanvas, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Accuracy',
                    data: [92.3, 93.1, 94.2, 94.8, 95.2, 95.9, 96.4, 96.8, 97.1, 97.3, 97.5, 97.8],
                    borderColor: 'rgba(0, 162, 255, 1)',
                    backgroundColor: 'rgba(0, 162, 255, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
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
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.dataset.label + ': ' + context.parsed.y + '%';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 90,
                        max: 100,
                        ticks: {
                            callback: function (value) {
                                return value + '%';
                            },
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        },
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)'
                        }
                    },
                    x: {
                        ticks: {
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        },
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });

        // Handle metric toggle buttons
        const metricBtns = performanceChartCanvas.closest('.chart-container').querySelectorAll('.chart-period-btn');
        metricBtns.forEach(btn => {
            btn.addEventListener('click', function () {
                metricBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                // Update chart data based on selected metric
                const metric = this.textContent;
                let newData;

                switch (metric) {
                    case 'Precision':
                        newData = [91.5, 92.3, 93.1, 93.7, 94.2, 94.8, 95.3, 95.7, 96.1, 96.3, 96.5, 96.5];
                        break;
                    case 'Recall':
                        newData = [93.2, 93.8, 94.5, 95.1, 95.6, 96.2, 96.7, 97.1, 97.5, 97.8, 98.0, 98.2];
                        break;
                    default: // Accuracy
                        newData = [92.3, 93.1, 94.2, 94.8, 95.2, 95.9, 96.4, 96.8, 97.1, 97.3, 97.5, 97.8];
                }

                performanceChart.data.datasets[0].label = metric;
                performanceChart.data.datasets[0].data = newData;
                performanceChart.update();
            });
        });
    }

    // Usage Distribution Chart (Donut)
    const usageDistributionCanvas = document.getElementById('usageDistributionChart');
    if (usageDistributionCanvas) {
        usageDistributionChart = new Chart(usageDistributionCanvas, {
            type: 'doughnut',
            data: {
                labels: ['Classification', 'NLP', 'Computer Vision', 'Predictive Analytics', 'Other'],
                datasets: [{
                    data: [35, 25, 20, 15, 5],
                    backgroundColor: [
                        'rgba(0, 162, 255, 0.8)',
                        'rgba(139, 92, 246, 0.8)',
                        'rgba(236, 72, 153, 0.8)',
                        'rgba(251, 146, 60, 0.8)',
                        'rgba(148, 163, 184, 0.8)'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            padding: 15,
                            color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        padding: 12,
                        cornerRadius: 8,
                        callbacks: {
                            label: function (context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    /**
     * API Section - Code Examples Tab Switching
     */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const codeExamples = {
        'Python': `# Install the EmiralAI Python SDK
pip install emiralai

# Initialize the client
from emiralai import EmiralClient

client = EmiralClient(api_key='sk_live_4eC3..')

# Make a prediction
result = client.predict(
    model='customer-churn-v2',
    data={
        'customer_age': 35,
        'account_balance': 5000,
        'months_active': 24
    }
)

print(result)`,
        'JavaScript': `// Install the EmiralAI JavaScript SDK
npm install emiralai-js

// Initialize the client
import EmiralClient from 'emiralai-js';

const client = new EmiralClient({
    apiKey: 'sk_live_4eC3...'
});

// Make a prediction
const result = await client.predict({
    model: 'customer-churn-v2',
    data: {
        customer_age: 35,
        account_balance: 5000,
        months_active: 24
    }
});

console.log(result);`,
        'cURL': `# Make a prediction using cURL
curl -X POST https://api.emiralai.com/v1/predict \\
  -H "Authorization: Bearer sk_live_4eC3..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "customer-churn-v2",
    "data": {
      "customer_age": 35,
      "account_balance": 5000,
      "months_active": 24
    }
  }'`
    };

    tabButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            // Update active tab
            tabButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Update code example
            const language = this.textContent;
            const codeExample = document.querySelector('.code-example code');
            if (codeExample && codeExamples[language]) {
                codeExample.textContent = codeExamples[language];
            }
        });
    });

    /**
     * API Keys - Copy to Clipboard
     */
    document.querySelectorAll('td .action-btn[aria-label="Copy key"]').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            const codeElement = this.previousElementSibling;
            const apiKey = codeElement.textContent;

            // Copy to clipboard
            navigator.clipboard.writeText(apiKey).then(() => {
                // Show feedback
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';

                setTimeout(() => {
                    this.innerHTML = originalIcon;
                }, 2000);
            });
        });
    });

    /**
     * Settings Form Handling
     */
    document.querySelectorAll('.settings-form').forEach(form => {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Simulate save action
            const btn = this.querySelector('.primary-btn');
            const originalText = btn.innerHTML;

            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
            btn.disabled = true;

            setTimeout(() => {
                btn.innerHTML = '<i class="fas fa-check"></i> Saved!';

                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.disabled = false;
                }, 2000);
            }, 1000);
        });
    });

    /**
     * Dataset Upload Simulation
     */
    const uploadBtn = document.querySelector('#datasets-section .primary-btn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', function () {
            // Create file input
            const fileInput = document.createElement('input');
            fileInput.type = 'file';
            fileInput.accept = '.csv,.json,.xlsx';
            fileInput.multiple = true;

            fileInput.addEventListener('change', function (e) {
                const files = e.target.files;
                if (files.length > 0) {
                    // Show upload notification
                    console.log(`Uploading ${files.length} file(s)...`);

                    // You can add upload progress UI here
                    alert(`Selected ${files.length} file(s) for upload. This is a demo - no actual upload occurs.`);
                }
            });

            fileInput.click();
        });
    }

    /**
     * Model Training Progress Animation
     */
    function animateTrainingProgress() {
        const progressBars = document.querySelectorAll('#models-section .stat-progress .progress-bar');
        progressBars.forEach(bar => {
            const currentWidth = parseFloat(bar.style.width);
            if (currentWidth < 100) {
                // Simulate progress
                const newWidth = Math.min(currentWidth + Math.random() * 2, 100);
                bar.style.width = newWidth + '%';

                // Update related text if exists
                const card = bar.closest('.project-card');
                if (card) {
                    const progressMetric = card.querySelector('.metric-value');
                    if (progressMetric && progressMetric.textContent.includes('%')) {
                        progressMetric.textContent = Math.round(newWidth) + '%';
                    }
                }
            }
        });
    }

    // Run training progress animation every 5 seconds
    setInterval(animateTrainingProgress, 5000);

    /**
     * Search Functionality for Datasets
     */
    const datasetSearch = document.querySelector('#datasets-section .search-filter input');
    if (datasetSearch) {
        datasetSearch.addEventListener('input', function () {
            const searchTerm = this.value.toLowerCase();
            const rows = document.querySelectorAll('#datasets-section tbody tr');

            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    }

    /**
     * Notification for Model Actions
     */
    document.querySelectorAll('.project-card .action-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();

            const icon = this.querySelector('i');
            const action = icon.className.includes('play') ? 'Testing' :
                icon.className.includes('pause') ? 'Pausing' :
                    icon.className.includes('stop') ? 'Stopping' :
                        icon.className.includes('rocket') ? 'Deploying' :
                            icon.className.includes('download') ? 'Downloading' :
                                'Processing';

            // Show simple notification
            console.log(`${action} model...`);

            // Visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = '';
            }, 100);
        });
    });

    console.log('Dashboard initialized successfully');
});

/**
 * =============================================================================
 * USAGE GUIDE FOR THEMEFOREST BUYERS
 * =============================================================================
 * 
 * USER DATA INTEGRATION:
 * This dashboard automatically loads user data saved by auth-popups.js
 * 
 * CUSTOMIZATION:
 * 
 * 1. Change localStorage key:
 *    Update userDataConfig.storageKey to match your system
 * 
 * 2. Add custom user fields:
 *    - Add to loadUserData() function
 *    - Add corresponding DOM elements
 *    - Update updateUserInterface()
 * 
 * 3. Modify logout behavior:
 *    Edit handleLogout() function
 * 
 * 4. Add plan-specific features:
 *    Check userData.plan in your code:
 *    if (userData.plan === 'Pro Plan') {
 *        // Show Pro features
 *    }
 * 
 * 5. Customize session timeout:
 *    Modify isSessionValid() function
 * 
 * =============================================================================
 */