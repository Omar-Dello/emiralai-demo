/** user-profile.js file
 * =============================================================================
 * EMIRALAI - PREMIUM USER PROFILE JAVASCRIPT
 * =============================================================================
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * =============================================================================
 * Description: Professional user profile management system with AI chat integration
 * and complete localStorage user data integration.
 * =============================================================================
 * TABLE OF CONTENTS:
 * =============================================================================
 * 1. CONFIGURATION & SETTINGS
 * 2. USER DATA MANAGEMENT
 *    2.1. Load User Data
 *    2.2. Update Interface
 *    2.3. Handle Login State
 *    2.4. Avatar Upload
 * 3. INITIALIZATION
 * 4. TAB MANAGEMENT
 * 5. API KEY MANAGEMENT
 * 6. CHART SYSTEMS
 *    6.1. Circular Progress Charts
 *    6.2. Gauge Charts
 *    6.3. Performance Line Chart
 *    6.4. Analytics Charts (NEW)
 * 7. AI CHAT ASSISTANT
 *    7.1. Core Chat Functions
 *    7.2. Message Handling
 *    7.3. AI Integration
 * 8. NOTIFICATION SYSTEM
 * 9. ANIMATION UTILITIES
 * 10. THEME INTEGRATION
 * 11. ERROR HANDLING
 * 12. EVENT LISTENERS
 * 13. NEW FEATURES
 *     13.1. Activity History
 *     13.2. Account Settings
 *     13.3. Billing Management
 * 14. PUBLIC API
 * =============================================================================
 */

(function (window, document) {
    'use strict';

    // Constants for better maintainability
    const STORAGE_KEY = 'emiralai_user_data';
    const CHAT_STORAGE_KEY = 'Emiralprofile_chat_messages';
    const MAX_CHAT_MESSAGES = 50;
    const CHART_UPDATE_DELAY = 100;

    const PLAN_HIERARCHY = {
        'free': { name: 'Free Plan', role: 'Free Member', next: 'Basic' },
        'basic': { name: 'Basic Plan', role: 'Basic Member', next: 'Pro' },
        'pro': { name: 'Pro Plan', role: 'Pro Member', next: 'Enterprise' },
        'enterprise': { name: 'Enterprise Plan', role: 'Enterprise Member', next: null }
    };

    const PLAN_STATS = {
        'Free Plan': { projects: 12, efficiency: 72, models: 3 },
        'Basic Plan': { projects: 50, efficiency: 75, models: 5 },
        'Pro Plan': { projects: 128, efficiency: 84, models: 15 },
        'Enterprise Plan': { projects: 500, efficiency: 98, models: 100 }
    };

    /**
     * 1. CONFIGURATION & SETTINGS
     * ===========================
     */
    const EmiralProfile = {
        // User data configuration
        userDataConfig: {
            storageKey: STORAGE_KEY,
            defaults: {
                name: 'Guest User',
                email: 'guest@emiralai.com',
                profileImage: null,
                plan: 'Free Plan',
                role: 'Guest',
                stats: { projects: 0, efficiency: 0, models: 0 }
            },
            elements: {
                userName: '.profile-details h1',
                userRole: '.profile-role',
                userAvatar: '.profile-avatar img',
                navLoginBtn: '.nav-btn',
                welcomeName: '.welcome-text .glow-text',
                projectCount: '.profile-stat:nth-child(1) .stat-value',
                efficiency: '.profile-stat:nth-child(2) .stat-value',
                modelCount: '.profile-stat:nth-child(3) .stat-value'
            }
        },

        // Default configuration
        config: {
            animations: { enabled: true, duration: 1000, easing: 'easeOutQuart' },
            updates: { usage: 5000, resources: 3000, performance: 10000 },
            chat: {
                enabled: true,
                apiEndpoint: '',
                apiKey: '',
                typingDelay: 1000,
                maxMessageLength: 500,
                enableSuggestions: true,
                closeOnOutsideClick: true,
                showNotifications: true,
                persistMessages: false,
                customResponses: {}
            },
            notifications: {
                enabled: true,
                duration: 3000,
                position: 'top-right',
                animations: true
            },
            theme: {
                autoDetect: true,
                charts: {
                    colors: {
                        primary: '#00a2ff',
                        secondary: '#9000ff',
                        tertiary: '#ff6b6b',
                        success: '#4caf50',
                        warning: '#ff9800',
                        danger: '#f44336'
                    }
                }
            },
            debug: false,
            errorReporting: true
        },

        // Internal state management
        state: {
            initialized: false,
            isLoggedIn: false,
            currentUser: null,
            charts: {
                performance: null,
                usage: {},
                resources: {},
                analytics: {} // NEW: For analytics charts
            },
            chat: {
                isOpen: false,
                isMinimized: false,
                messageCount: 0,
                messages: [],
                isTyping: false
            },
            theme: 'light',
            updateIntervals: {},
            activeTab: 'my-dashboard' // Updated default tab
        },

        // Chart data storage
        data: {
            usage: { monthly: 76, apiCredits: 42, accuracy: 93 },
            resources: { cpu: 70, memory: 55, storage: 35 },
            performance: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
                accuracy: [89.5, 91.2, 92.8, 94.1, 95.7],
                responseTime: [175, 160, 148, 135, 124]
            },
            // NEW: Analytics data
            analytics: {
                modelTrends: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        {
                            label: 'Accuracy',
                            data: [88, 90, 92, 95]
                        },
                        {
                            label: 'Speed',
                            data: [85, 87, 89, 92]
                        }
                    ]
                },
                responseTime: {
                    labels: ['00:00', '06:00', '12:00', '18:00', '24:00'],
                    data: [120, 135, 145, 124, 115]
                }
            }
        }
    };

    /**
     * 2. USER DATA MANAGEMENT
     * =======================
     */

    /**
     * Helper function to get user data from centralized manager or localStorage
     */
    EmiralProfile.getUserDataFromSource = function () {
        // Try centralized data manager first
        if (window.EmiralUserData?.getUserData) {
            return window.EmiralUserData.getUserData();
        }

        // Fallback to localStorage
        const storedData = localStorage.getItem(this.userDataConfig.storageKey);
        return storedData ? JSON.parse(storedData) : null;
    };

    /**
     * 2.1. Load User Data from LocalStorage
     */
    EmiralProfile.loadUserData = function () {
        try {
            const userData = this.getUserDataFromSource();

            if (!userData) {
                console.log('No user data found, user not logged in');
                return null;
            }

            // Check session expiry
            if (userData.sessionExpiry && new Date() >= new Date(userData.sessionExpiry)) {
                console.warn('User session expired');
                this.handleLogout();
                return null;
            }

            console.log('User data loaded:', userData.email);

            // Generate avatar if needed
            if (!userData.profileImage || this.isDefaultAvatar(userData.profileImage)) {
                userData.profileImage = this.generateUserAvatar(userData);
            }

            // Update state
            this.state.isLoggedIn = true;
            this.state.currentUser = userData;

            // Complete user data
            return {
                ...userData,
                plan: userData.plan || this.determinePlan(userData),
                role: userData.role || this.determineRole(userData),
                stats: this.calculateUserStats(userData)
            };

        } catch (error) {
            console.error('Error loading user data:', error);
            return null;
        }
    };

    /**
     * Check if avatar is a default one
     */
    EmiralProfile.isDefaultAvatar = function (url) {
        return !url ||
            url.includes('stefanstefancik') ||
            url.includes('pexels') ||
            url.includes('default');
    };

    /**
     * Determine user plan and role
     */
    EmiralProfile.determinePlan = function (userData) {
        return userData.plan || 'Free Plan';
    };

    EmiralProfile.determineRole = function (userData) {
        // Try centralized manager first
        if (window.EmiralUserData?.getMemberRole) {
            return window.EmiralUserData.getMemberRole(userData.planId || 'free');
        }

        // Use plan hierarchy
        const planId = userData.planId || 'free';
        return PLAN_HIERARCHY[planId]?.role || 'Free Member';
    };

    /**
     * Calculate user statistics based on plan
     */
    EmiralProfile.calculateUserStats = function (userData) {
        // Check centralized data first
        if (window.EmiralUserData?.getUserData) {
            const fullData = window.EmiralUserData.getUserData();
            if (fullData?.usage) {
                return {
                    projects: fullData.usage.projectsCount || 0,
                    efficiency: Math.round(fullData.usage.accuracy) || 0,
                    models: fullData.usage.modelsActive || 0
                };
            }
        }

        // Fallback to plan-based stats
        const plan = this.determinePlan(userData);
        return PLAN_STATS[plan] || PLAN_STATS['Free Plan'];
    };

    /**
     * 2.2. Update Interface with User Data
     */
    EmiralProfile.updateUserInterface = function (userData) {
        if (!userData) {
            this.showLoginPrompt();
            return;
        }

        try {
            const elements = this.userDataConfig.elements;

            // Update text elements
            this.updateElement(elements.userName, userData.name);
            this.updateElement(elements.userRole, this.getRoleHTML(userData));
            this.updateElement(elements.welcomeName, userData.name.split(' ')[0]);

            // Update avatar
            this.updateAvatar(userData);

            // Update stats with animation
            this.updateStats(userData.stats);

            // Hide login button
            this.hideElement(elements.navLoginBtn);

            // Update plan features
            this.updatePlanFeatures(userData.plan);
            this.updatePlanInfoDisplay();

            // Update state
            this.state.isLoggedIn = true;
            this.state.currentUser = userData;

            console.log('User interface updated successfully');

        } catch (error) {
            console.error('Error updating user interface:', error);
        }
    };

    /**
     * Helper functions for UI updates
     */
    EmiralProfile.updateElement = function (selector, content) {
        const element = document.querySelector(selector);
        if (element) {
            element.innerHTML = content;
        }
    };

    EmiralProfile.hideElement = function (selector) {
        const element = document.querySelector(selector);
        if (element) {
            element.style.display = 'none';
        }
    };

    EmiralProfile.getRoleHTML = function (userData) {
        const isVerified = userData.plan !== 'Free Plan';
        return `${userData.role} ${isVerified ? '<span class="verified-badge"><i class="fas fa-check"></i></span>' : ''}`;
    };

    EmiralProfile.updateAvatar = function (userData) {
        const avatarElement = document.querySelector(this.userDataConfig.elements.userAvatar);
        if (!avatarElement) return;

        avatarElement.style.opacity = '0.5';
        const avatarUrl = this.isDefaultAvatar(userData.profileImage)
            ? this.generateUserAvatar(userData)
            : userData.profileImage;

        const img = new Image();
        img.onload = () => {
            avatarElement.src = avatarUrl;
            avatarElement.alt = `${userData.name}'s Avatar`;
            avatarElement.style.opacity = '1';
        };
        img.onerror = () => {
            avatarElement.src = this.generateUserAvatar(userData);
            avatarElement.style.opacity = '1';
        };
        img.src = avatarUrl;
    };

    EmiralProfile.updateStats = function (stats) {
        if (!stats) return;

        const elements = this.userDataConfig.elements;
        const animate = this.config.animations.enabled;
        const duration = this.config.animations.duration;

        // Update each stat
        this.updateStatValue(elements.projectCount, stats.projects, animate, duration);
        this.updateStatValue(elements.efficiency, stats.efficiency, animate, duration, '%');
        this.updateStatValue(elements.modelCount, stats.models, animate, duration);
    };

    EmiralProfile.updateStatValue = function (selector, value, animate, duration, suffix = '') {
        const element = document.querySelector(selector);
        if (!element) return;

        if (animate) {
            this.animateValue(element, 0, value, duration, suffix);
        } else {
            element.textContent = value + suffix;
        }
    };

    /**
     * Update plan info display
     */
    EmiralProfile.updatePlanInfoDisplay = function () {
        const userData = this.state.currentUser;
        if (!userData) return;

        this.updateElement('.plan-info .plan-name', userData.plan || 'Free Plan');

        const expiryElement = document.querySelector('.plan-info .plan-expiry');
        if (expiryElement) {
            expiryElement.textContent = this.getPlanExpiryText(userData);
        }
    };

    EmiralProfile.getPlanExpiryText = function (userData) {
        if (userData.planId === 'free') {
            return 'No expiration';
        }

        if (userData.subscription?.daysRemaining !== undefined) {
            const days = userData.subscription.daysRemaining;
            if (days > 0) return `Renews in ${days} days`;
            if (days === 0) return 'Expires today';
            return 'Expired';
        }

        return 'Active subscription';
    };

    /**
     * Generate user avatar with initials
     */
    EmiralProfile.generateUserAvatar = function (userData) {
        const name = userData?.name || 'Guest User';
        const email = userData?.email || 'user@example.com';

        // Extract initials
        const initials = this.extractInitials(name, email);

        // Generate color based on email
        const color = this.generateColorFromString(email || name);

        // Create SVG
        return this.createAvatarSVG(initials, color);
    };

    EmiralProfile.extractInitials = function (name, email) {
        if (name && name !== 'Guest User') {
            const parts = name.trim().split(/\s+/);
            if (parts.length >= 2) {
                return parts[0][0] + parts[parts.length - 1][0];
            }
            return parts[0].substring(0, 2);
        }

        if (email && email !== 'user@example.com') {
            return email.split('@')[0].substring(0, 2);
        }

        return 'U';
    };

    EmiralProfile.generateColorFromString = function (str) {
        const colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
            '#F7DC6F', '#BB8FCE', '#85C1F2', '#F8B739', '#52C41A'
        ];

        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash = hash & hash;
        }

        return colors[Math.abs(hash) % colors.length];
    };

    EmiralProfile.createAvatarSVG = function (initials, backgroundColor) {
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
            <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                  font-size="40" font-weight="600" fill="#FFFFFF" text-anchor="middle" 
                  dominant-baseline="middle">${initials.toUpperCase()}</text>
        </svg>`;

        return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
    };

    /**
     * Sync with centralized user data manager
     */
    EmiralProfile.syncWithCentralManager = function () {
        if (!window.EmiralUserData) return;

        // Listen for user data updates
        window.addEventListener('userDataUpdated', (event) => {
            if (event.detail) {
                const userData = this.loadUserData();
                this.updateUserInterface(userData);
            }
        });

        // Listen for logout
        window.addEventListener('userLoggedOut', () => {
            this.handleLogout();
        });
    };

    /**
     * 2.3. Handle Login State
     */
    EmiralProfile.showLoginPrompt = function () {
        const navLoginBtn = document.querySelector(this.userDataConfig.elements.navLoginBtn);
        if (navLoginBtn) {
            navLoginBtn.style.display = 'inline-flex';
            navLoginBtn.textContent = 'Login / SignUp';
        }

        if (this.config.notifications.enabled) {
            setTimeout(() => {
                this.showNotification('Please login to access all features', 'info');
            }, 1000);
        }

        this.state.isLoggedIn = false;
        this.state.currentUser = null;

        // Use default data with generated avatar
        const defaultData = {
            ...this.userDataConfig.defaults,
            profileImage: this.generateUserAvatar(this.userDataConfig.defaults)
        };

        this.updateUserInterface(defaultData);
    };

    EmiralProfile.handleLogout = function () {
        try {
            localStorage.removeItem(this.userDataConfig.storageKey);
            sessionStorage.clear();
            this.showNotification('Logging out...', 'info');

            setTimeout(() => {
                window.location.href = 'main.html';
            }, 1000);

        } catch (error) {
            console.error('Error during logout:', error);
            window.location.href = 'main.html';
        }
    };

    /**
     * Update plan-specific features
     */
    EmiralProfile.updatePlanFeatures = function (plan) {
        const upgradeBtn = document.querySelector('.profile-actions .btn:first-child');
        if (upgradeBtn) {
            const planInfo = Object.values(PLAN_HIERARCHY).find(p => p.name === plan);
            if (planInfo?.next) {
                upgradeBtn.innerHTML = `<i class="fas fa-crown"></i> Upgrade to ${planInfo.next}`;
                upgradeBtn.style.display = 'inline-flex';
            } else {
                upgradeBtn.style.display = 'none';
            }
        }

        // Update API section for free plan
        if (plan === 'Free Plan') {
            const apiKeyDisplay = document.querySelector('.api-integration .api-key-display');
            if (apiKeyDisplay) {
                apiKeyDisplay.innerHTML = '<p class="upgrade-notice">Upgrade to Basic or higher to access API features</p>';
            }
        }
    };

    /**
     * 2.4. Enhanced Avatar Upload
     */
    EmiralProfile.initializeAvatarUpload = function () {
        const avatarEdit = document.querySelector('.profile-avatar-edit');
        if (!avatarEdit) return;

        avatarEdit.addEventListener('click', () => {
            if (!this.state.isLoggedIn) {
                this.showNotification('Please login to change your avatar', 'warning');
                return;
            }

            this.handleAvatarUpload();
        });
    };

    EmiralProfile.handleAvatarUpload = function () {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const validation = this.validateImageFile(file);
            if (!validation.valid) {
                this.showNotification(validation.message, 'error');
                return;
            }

            this.processAvatarFile(file);
        });

        fileInput.click();
    };

    EmiralProfile.processAvatarFile = function (file) {
        const reader = new FileReader();

        reader.onload = (e) => {
            const avatarImg = document.querySelector('.profile-avatar img');
            if (avatarImg) {
                avatarImg.src = e.target.result;
                this.updateUserAvatar(e.target.result);
                this.showNotification('Avatar updated successfully!', 'success');
                this.triggerEvent('Emiralprofile:avatar:updated', { file });
            }
        };

        reader.onerror = () => {
            this.showNotification('Failed to read image file', 'error');
        };

        reader.readAsDataURL(file);
    };

    EmiralProfile.updateUserAvatar = function (avatarData) {
        if (!this.state.currentUser) return;

        this.state.currentUser.profileImage = avatarData;

        // Update using centralized manager if available
        if (window.EmiralUserData?.updateUserData) {
            window.EmiralUserData.updateUserData({ profileImage: avatarData });
        } else {
            this.updateStoredUserData({ profileImage: avatarData });
        }
    };

    /**
     * Update stored user data
     */
    EmiralProfile.updateStoredUserData = function (updates) {
        try {
            const storedData = localStorage.getItem(this.userDataConfig.storageKey);
            if (!storedData) return;

            const userData = JSON.parse(storedData);
            const updatedData = { ...userData, ...updates };

            localStorage.setItem(this.userDataConfig.storageKey, JSON.stringify(updatedData));

            // Trigger storage event
            window.dispatchEvent(new StorageEvent('storage', {
                key: this.userDataConfig.storageKey,
                newValue: JSON.stringify(updatedData),
                url: window.location.href
            }));

            console.log('User data updated in localStorage');

        } catch (error) {
            console.error('Error updating stored user data:', error);
        }
    };

    /**
     * 3. INITIALIZATION
     * =================
     */
    EmiralProfile.init = function (customConfig = {}) {
        if (this.state.initialized) {
            this.log('warn', 'EmiralProfile already initialized');
            return;
        }

        // Merge custom configuration
        this.config = this.deepMerge(this.config, customConfig);

        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    };

    EmiralProfile.initialize = function () {
        try {
            this.setupErrorHandling();

            // Load user data first
            const userData = this.loadUserData();
            this.updateUserInterface(userData);
            this.syncWithCentralManager();

            // Initialize all components
            this.initializeComponents();

            // Start animations and updates
            if (this.config.animations.enabled) {
                this.animateOnLoad();
            }
            this.startDataUpdates();

            // Setup event listeners
            this.setupEventListeners();

            // Mark as initialized
            this.state.initialized = true;
            this.triggerEvent('Emiralprofile:initialized');
            this.log('info', 'EmiralProfile initialized successfully');

        } catch (error) {
            this.handleError('Initialization failed', error);
        }
    };

    EmiralProfile.initializeComponents = function () {
        this.initializeTabs();
        this.initializeAPIKeyManagement();
        this.initializeCharts();
        this.initializeAvatarUpload();
        this.initializeThemeIntegration();

        // Initialize new features
        this.initializeActivityHistory();
        this.initializeAccountSettings();
        this.initializeBillingManagement();

        if (this.config.chat.enabled) {
            this.initializeAIChat();
        }
    };

    EmiralProfile.setupEventListeners = function () {
        // Logout handlers
        window.addEventListener('userLoggedOut', () => this.handleLogout());

        // Storage changes
        window.addEventListener('storage', (e) => {
            if (e.key === this.userDataConfig.storageKey) {
                this.handleStorageChange(e);
            }
        });
    };

    EmiralProfile.handleStorageChange = function (event) {
        if (!event.newValue) {
            this.handleLogout();
        } else {
            try {
                const newUserData = JSON.parse(event.newValue);

                // Merge with existing data
                const currentData = this.state.currentUser || {};
                const mergedData = { ...currentData, ...newUserData };

                // Ensure the basic data is present
                if (mergedData.name && mergedData.email) {
                    this.updateUserInterface(mergedData);
                } else {
                    console.warn('Incomplete user data, skipping update');
                }
            } catch (error) {
                console.error('Error parsing updated user data:', error);
            }
        }
    };

    /**
     * 4. TAB MANAGEMENT
     * =================
     */
    EmiralProfile.initializeTabs = function () {
        const tabButtons = document.querySelectorAll('.profile-tab');
        const tabContents = document.querySelectorAll('.profile-tab-content');

        if (!tabButtons.length) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const tabId = button.getAttribute('data-tab');
                this.switchTab(tabId, tabButtons, tabContents);
            });
        });

        // Check URL hash for specific tab
        const hash = window.location.hash.replace('#', '');
        if (hash && document.getElementById(hash)) {
            this.switchTab(hash);
        }
    };

    EmiralProfile.switchTab = function (tabId, buttons, contents) {
        // Get elements if not provided
        buttons = buttons || document.querySelectorAll('.profile-tab');
        contents = contents || document.querySelectorAll('.profile-tab-content');

        // Update active states
        buttons.forEach(btn => btn.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        // Activate new tab
        const button = Array.from(buttons).find(btn => btn.getAttribute('data-tab') === tabId);
        const content = document.getElementById(tabId);

        if (button && content) {
            button.classList.add('active');
            content.classList.add('active');
            this.state.activeTab = tabId;

            // Update URL hash without scrolling
            history.replaceState(null, null, `#${tabId}`);

            this.triggerEvent('Emiralprofile:tabchange', { tabId });
            this.onTabChange(tabId);
        }
    };

    EmiralProfile.onTabChange = function (tabId) {
        // Initialize tab-specific features
        switch (tabId) {
            case 'my-dashboard':
                this.refreshChartsInTab(tabId);
                break;
            case 'personal-analytics':
                this.initializeAnalyticsCharts();
                break;
            case 'activity-history':
                this.loadActivityHistory();
                break;
            case 'account-settings':
                this.loadAccountSettings();
                break;
            case 'billing-plans':
                this.loadBillingInfo();
                break;
        }
    };

    /**
     * 5. API KEY MANAGEMENT
     * =====================
     */
    EmiralProfile.initializeAPIKeyManagement = function () {
        const elements = {
            toggle: document.querySelector('.toggle-visibility-btn'),
            input: document.querySelector('.api-key-display input'),
            copy: document.querySelector('.copy-btn'),
            copyCode: document.querySelector('.copy-code-btn'),
            regenerate: document.querySelector('.regenerate-btn')
        };

        // Generate API key for logged-in user
        if (elements.input && this.state.currentUser) {
            elements.input.value = this.generateAPIKey(this.state.currentUser.email);
        }

        // Setup event handlers
        this.setupAPIKeyHandlers(elements);
    };

    EmiralProfile.generateAPIKey = function (email) {
        const userHash = btoa(email).substr(0, 8);
        const randomPart = Math.random().toString(36).substr(2, 9);
        return `Emiral_ai_${userHash}_${randomPart}`;
    };

    EmiralProfile.setupAPIKeyHandlers = function (elements) {
        // Toggle visibility
        if (elements.toggle && elements.input) {
            elements.toggle.addEventListener('click', () => {
                const isPassword = elements.input.type === 'password';
                elements.input.type = isPassword ? 'text' : 'password';
                elements.toggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
                this.triggerEvent('Emiralprofile:apikey:visibility', { visible: isPassword });
            });
        }

        // Copy handlers
        if (elements.copy && elements.input) {
            elements.copy.addEventListener('click', () => {
                this.copyToClipboard(elements.input.value, elements.copy);
            });
        }

        if (elements.copyCode) {
            const codeSnippet = document.querySelector('.code-snippet pre code');
            if (codeSnippet) {
                elements.copyCode.addEventListener('click', () => {
                    this.copyToClipboard(codeSnippet.textContent, elements.copyCode);
                });
            }
        }

        // Regenerate API key
        if (elements.regenerate && elements.input) {
            elements.regenerate.addEventListener('click', () => {
                if (confirm('Are you sure you want to regenerate your API key? The old key will stop working.')) {
                    const newKey = this.generateAPIKey(this.state.currentUser.email);
                    elements.input.value = newKey;
                    this.showNotification('API key regenerated successfully', 'success');
                    this.triggerEvent('Emiralprofile:apikey:regenerated', { newKey });
                }
            });
        }
    };

    /**
     * 6. CHART SYSTEMS
     * ================
     */
    EmiralProfile.initializeCharts = function () {
        try {
            this.initializeCircularCharts();
            this.initializeGaugeCharts();
            this.initializePerformanceChart();
            setTimeout(() => this.fixChartDisplay(), CHART_UPDATE_DELAY);
        } catch (error) {
            this.log('error', 'Chart initialization failed:', error);
        }
    };

    /**
     * 6.1. Circular Progress Charts
     */
    EmiralProfile.initializeCircularCharts = function () {
        const containers = document.querySelectorAll('.usage-charts .chart-container');
        const chartData = [
            { value: this.data.usage.monthly, color: 'primary', name: 'monthly' },
            { value: this.data.usage.apiCredits, color: 'secondary', name: 'apiCredits' },
            { value: this.data.usage.accuracy, color: 'tertiary', name: 'accuracy' }
        ];

        containers.forEach((container, index) => {
            if (chartData[index]) {
                this.updateCircularChart(container, chartData[index]);
            }
        });
    };

    EmiralProfile.updateCircularChart = function (container, data) {
        const svg = container.querySelector('.circular-chart');
        const circle = svg?.querySelector('.circle');
        const percentageElement = container.querySelector('.percentage-value');

        if (!circle || !percentageElement) return;

        const radius = 15.9155;
        const circumference = 2 * Math.PI * radius;
        const offset = circumference - (data.value / 100) * circumference;

        circle.style.strokeDashoffset = offset;
        circle.setAttribute('class', `circle ${data.color}`);

        if (this.config.animations.enabled) {
            this.animateValue(percentageElement, 0, data.value, this.config.animations.duration, '%');
        } else {
            percentageElement.textContent = `${Math.round(data.value)}%`;
        }

        this.state.charts.usage[data.name] = { container, data };
    };

    /**
     * 6.2. Gauge Charts
     */
    EmiralProfile.initializeGaugeCharts = function () {
        const containers = document.querySelectorAll('.resource-gauge');
        const gaugeData = [
            { value: this.data.resources.cpu, color: 'primary', name: 'cpu' },
            { value: this.data.resources.memory, color: 'secondary', name: 'memory' },
            { value: this.data.resources.storage, color: 'tertiary', name: 'storage' }
        ];

        containers.forEach((container, index) => {
            if (gaugeData[index]) {
                this.updateGaugeChart(container, gaugeData[index]);
            }
        });
    };

    EmiralProfile.updateGaugeChart = function (container, data) {
        const svg = container.querySelector('.gauge');
        const gaugeValue = svg?.querySelector('.gauge-value');
        const textElement = svg?.querySelector('.gauge-text');

        if (!gaugeValue || !textElement) return;

        const radius = 54;
        const circumference = 2 * Math.PI * radius;
        const maxDegrees = 270;
        const offset = (data.value / 100) * (maxDegrees / 360) * circumference;

        gaugeValue.style.strokeDasharray = `${offset} ${circumference}`;
        gaugeValue.setAttribute('class', `gauge-value ${data.color}`);

        if (this.config.animations.enabled) {
            this.animateValue(textElement, 0, data.value, this.config.animations.duration, '%');
        } else {
            textElement.textContent = `${Math.round(data.value)}%`;
        }

        this.state.charts.resources[data.name] = { container, data };
    };

    /**
     * 6.3. Performance Line Chart
     */
    EmiralProfile.initializePerformanceChart = function () {
        const canvas = document.getElementById('performanceChart');
        if (!canvas || typeof Chart === 'undefined') return;

        const ctx = canvas.getContext('2d');
        const colors = this.getThemeColors();

        this.state.charts.performance = new Chart(ctx, {
            type: 'line',
            data: this.getPerformanceChartData(),
            options: this.getChartOptions(colors)
        });
    };

    /**
     * 6.4. Analytics Charts (NEW)
     */
    EmiralProfile.initializeAnalyticsCharts = function () {
        // Model Trends Chart
        const modelTrendsCanvas = document.getElementById('modelTrendsChart');
        if (modelTrendsCanvas && typeof Chart !== 'undefined') {
            const ctx = modelTrendsCanvas.getContext('2d');

            if (!this.state.charts.analytics.modelTrends) {
                this.state.charts.analytics.modelTrends = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: this.data.analytics.modelTrends.labels,
                        datasets: this.data.analytics.modelTrends.datasets.map((dataset, index) => ({
                            label: dataset.label,
                            data: dataset.data,
                            borderColor: index === 0 ? this.config.theme.charts.colors.primary : this.config.theme.charts.colors.secondary,
                            backgroundColor: index === 0
                                ? this.hexToRgba(this.config.theme.charts.colors.primary, 0.1)
                                : this.hexToRgba(this.config.theme.charts.colors.secondary, 0.1),
                            tension: 0.4,
                            fill: true
                        }))
                    },
                    options: this.getChartOptions(this.getThemeColors())
                });
            }
        }

        // Response Time Chart
        const responseTimeCanvas = document.getElementById('responseTimeChart');
        if (responseTimeCanvas && typeof Chart !== 'undefined') {
            const ctx = responseTimeCanvas.getContext('2d');

            if (!this.state.charts.analytics.responseTime) {
                this.state.charts.analytics.responseTime = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: this.data.analytics.responseTime.labels,
                        datasets: [{
                            label: 'Response Time (ms)',
                            data: this.data.analytics.responseTime.data,
                            backgroundColor: this.config.theme.charts.colors.primary,
                            borderColor: this.config.theme.charts.colors.primary,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                display: false
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: {
                                    callback: function (value) {
                                        return value + 'ms';
                                    }
                                }
                            }
                        }
                    }
                });
            }
        }
    };

    EmiralProfile.getPerformanceChartData = function () {
        return {
            labels: this.data.performance.labels,
            datasets: [{
                label: 'Accuracy',
                data: this.data.performance.accuracy,
                borderColor: this.config.theme.charts.colors.primary,
                backgroundColor: this.hexToRgba(this.config.theme.charts.colors.primary, 0.1),
                tension: 0.4,
                fill: true
            }, {
                label: 'Response Time (ms)',
                data: this.data.performance.responseTime,
                borderColor: this.config.theme.charts.colors.secondary,
                backgroundColor: this.hexToRgba(this.config.theme.charts.colors.secondary, 0.1),
                tension: 0.4,
                fill: true,
                yAxisID: 'y1'
            }]
        };
    };

    EmiralProfile.getChartOptions = function (colors) {
        return {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: colors.text,
                        font: { size: 12 },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#333',
                    borderWidth: 1,
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true,
                    callbacks: {
                        label: (context) => {
                            const label = context.dataset.label || '';
                            const suffix = context.dataset.yAxisID === 'y1' ? 'ms' : '%';
                            const value = context.parsed.y !== null
                                ? (context.dataset.yAxisID === 'y1' ? context.parsed.y : context.parsed.y.toFixed(1))
                                : '';
                            return label ? `${label}: ${value}${suffix}` : '';
                        }
                    }
                }
            },
            scales: this.getChartScales(colors)
        };
    };

    EmiralProfile.getChartScales = function (colors) {
        return {
            y: {
                beginAtZero: false,
                min: 85,
                max: 100,
                grid: { color: colors.grid, drawBorder: false },
                ticks: {
                    color: colors.text,
                    font: { size: 11 },
                    callback: value => value + '%'
                },
                title: {
                    display: true,
                    text: 'Accuracy (%)',
                    color: colors.text
                }
            },
            y1: {
                position: 'right',
                beginAtZero: false,
                min: 100,
                max: 200,
                grid: { drawOnChartArea: false },
                ticks: {
                    color: colors.text,
                    font: { size: 11 },
                    callback: value => value + 'ms'
                },
                title: {
                    display: true,
                    text: 'Response Time (ms)',
                    color: colors.text
                }
            },
            x: {
                grid: { color: colors.grid, drawBorder: false },
                ticks: { color: colors.text, font: { size: 11 } }
            }
        };
    };

    EmiralProfile.fixChartDisplay = function () {
        // Fix circular charts
        const circles = document.querySelectorAll('.circular-chart .circle');
        circles.forEach(circle => {
            const percentage = parseFloat(circle.style.strokeDashoffset || 0);
            const circumference = 100.53;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = percentage;
        });

        // Fix gauge charts
        Object.values(this.state.charts.resources).forEach(({ container, data }) => {
            const gauge = container?.querySelector('.gauge-value');
            if (gauge) {
                const radius = 54;
                const circumference = 2 * Math.PI * radius;
                const gaugeCircumference = circumference * 0.75;
                const filledLength = (data.value / 100) * gaugeCircumference;
                gauge.style.strokeDasharray = `${filledLength} ${circumference}`;
            }
        });
    };

    /**
     * 7. AI CHAT ASSISTANT
     * ====================
     */

    /**
     * 7.1. Core Chat Functions
     */
    EmiralProfile.initializeAIChat = function () {
        const elements = {
            button: document.querySelector('.ai-assistant-status .small-btn'),
            window: document.getElementById('aiChatWindow'),
            closeBtn: document.querySelector('.chat-close-btn'),
            minimizeBtn: document.querySelector('.chat-minimize-btn'),
            minimizedBtn: document.getElementById('chatMinimizedBtn'),
            form: document.getElementById('chatForm'),
            input: document.getElementById('chatInput'),
            messages: document.getElementById('chatMessages'),
            suggestions: document.querySelectorAll('.suggestion-chip'),
            suggestionsContainer: document.querySelector('.chat-suggestions')
        };

        if (!elements.button || !elements.window) {
            this.log('warn', 'AI Chat elements not found');
            return;
        }

        this.chatElements = elements;
        this.addSuggestionsToggle();
        this.setupChatEventListeners();

        if (this.config.chat.persistMessages) {
            this.loadChatMessages();
        }

        if (this.state.currentUser) {
            this.personalizeChatWelcome();
        }
    };

    /**
     * Personalize chat welcome message
     */
    EmiralProfile.personalizeChatWelcome = function () {
        const welcomeMessage = this.chatElements.messages?.querySelector('.ai-message .message-bubble p');
        if (welcomeMessage && this.state.currentUser) {
            const firstName = this.state.currentUser.name.split(' ')[0];
            welcomeMessage.textContent = `Hello ${firstName}! I'm your EmiralAI Assistant. How can I help you today?`;
        }
    };

    EmiralProfile.addSuggestionsToggle = function () {
        const { suggestionsContainer } = this.chatElements;
        if (!suggestionsContainer) return;

        let toggleBtn = document.querySelector('.suggestions-toggle-btn');
        if (!toggleBtn) {
            toggleBtn = this.createSuggestionsToggleButton();
            const chatFooter = document.querySelector('.chat-footer');
            if (chatFooter) {
                chatFooter.appendChild(toggleBtn);
            }
        }

        this.chatElements.toggleSuggestionsBtn = toggleBtn;
        this.setupSuggestionsToggle(toggleBtn, suggestionsContainer);
    };

    EmiralProfile.createSuggestionsToggleButton = function () {
        const button = document.createElement('button');
        button.className = 'suggestions-toggle-btn';
        button.innerHTML = '<i class="fas fa-lightbulb"></i>';
        button.title = 'Toggle suggestions';
        return button;
    };

    EmiralProfile.setupSuggestionsToggle = function (button, container) {
        container.dataset.hidden = 'false';

        // Replace button to remove old listeners
        const newButton = button.cloneNode(true);
        button.parentNode.replaceChild(newButton, button);
        this.chatElements.toggleSuggestionsBtn = newButton;

        newButton.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            const isHidden = container.dataset.hidden === 'true';
            container.style.display = isHidden ? 'flex' : 'none';
            container.dataset.hidden = isHidden ? 'false' : 'true';
            newButton.classList.toggle('active', isHidden);
        });
    };

    EmiralProfile.setupChatEventListeners = function () {
        const {
            button, closeBtn, minimizeBtn, minimizedBtn,
            form, input, suggestions
        } = this.chatElements;

        // Chat window controls
        button?.addEventListener('click', (e) => {
            e.preventDefault();
            this.openChat();
        });

        closeBtn?.addEventListener('click', () => this.closeChat());
        minimizeBtn?.addEventListener('click', () => this.minimizeChat());
        minimizedBtn?.addEventListener('click', () => this.restoreChat());

        // Message handling
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleChatSubmit(input.value.trim());
        });

        // Suggestions
        suggestions?.forEach(chip => {
            chip.addEventListener('click', () => {
                this.sendMessage(chip.textContent.trim());
            });
        });

        // Keyboard shortcuts
        this.setupChatKeyboardShortcuts();
    };

    EmiralProfile.setupChatKeyboardShortcuts = function () {
        const { input, form } = this.chatElements;

        input?.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                form.dispatchEvent(new Event('submit'));
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.state.chat.isOpen) {
                this.closeChat();
            }
        });

        // Click outside to close
        if (this.config.chat.closeOnOutsideClick) {
            document.addEventListener('click', (e) => {
                if (this.shouldCloseOnClick(e.target)) {
                    this.closeChat();
                }
            });
        }
    };

    EmiralProfile.shouldCloseOnClick = function (target) {
        const { window: chatWindow, button, minimizedBtn } = this.chatElements;
        return this.state.chat.isOpen &&
            !chatWindow.contains(target) &&
            !button.contains(target) &&
            !minimizedBtn?.contains(target);
    };

    EmiralProfile.handleChatSubmit = function (message) {
        if (!message || message.length > this.config.chat.maxMessageLength) {
            if (message.length > this.config.chat.maxMessageLength) {
                this.showNotification(`Message too long. Maximum ${this.config.chat.maxMessageLength} characters.`, 'warning');
            }
            return;
        }
        this.sendMessage(message);
    };

    /**
     * 7.2. Message Handling
     */
    EmiralProfile.openChat = function () {
        const { window: chatWindow, minimizedBtn, input } = this.chatElements;

        chatWindow.classList.add('active');
        minimizedBtn.style.display = 'none';
        this.state.chat.isOpen = true;
        this.state.chat.isMinimized = false;

        setTimeout(() => input?.focus(), 100);
        this.triggerEvent('Emiralprofile:chat:opened');
    };

    EmiralProfile.closeChat = function () {
        const { window: chatWindow, minimizedBtn } = this.chatElements;

        this.hideTypingIndicator();
        chatWindow.classList.remove('active');
        minimizedBtn.style.display = 'flex';
        this.state.chat.isOpen = false;
        this.state.chat.isMinimized = false;

        if (this.config.chat.persistMessages) {
            this.saveChatMessages();
        }

        this.triggerEvent('Emiralprofile:chat:closed');
    };

    EmiralProfile.minimizeChat = function () {
        const { window: chatWindow, minimizedBtn } = this.chatElements;

        chatWindow.classList.remove('active');
        minimizedBtn.style.display = 'flex';
        this.state.chat.isOpen = false;
        this.state.chat.isMinimized = true;

        this.triggerEvent('Emiralprofile:chat:minimized');
    };

    EmiralProfile.restoreChat = function () {
        const { window: chatWindow, minimizedBtn } = this.chatElements;

        chatWindow.classList.add('active');
        minimizedBtn.style.display = 'none';
        this.state.chat.isOpen = true;
        this.state.chat.isMinimized = false;
        this.state.chat.messageCount = 0;

        // Clear notification badge
        const badge = minimizedBtn.querySelector('.chat-notification-badge');
        if (badge) {
            badge.style.display = 'none';
        }

        this.triggerEvent('Emiralprofile:chat:restored');
    };

    EmiralProfile.sendMessage = function (message) {
        if (!message.trim() || this.state.chat.isTyping) return;

        const { input, messages } = this.chatElements;

        // Add user message
        const userMessage = this.createMessageElement(message, 'user');
        messages.appendChild(userMessage);

        // Store message
        this.state.chat.messages.push({
            type: 'user',
            content: message,
            timestamp: new Date()
        });

        // Clear input and scroll
        input.value = '';
        this.scrollChatToBottom();

        // Get AI response (typing indicator will be shown in getAIResponse)
        this.getAIResponse(message);

        this.triggerEvent('Emiralprofile:chat:message:sent', { message });
    };

    EmiralProfile.createMessageElement = function (content, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}-message fade-in`;

        const time = new Date().toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        });
        const icon = type === 'user' ? 'user' : 'brain';

        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <p>${this.escapeHtml(content)}</p>
                </div>
                <span class="message-time">${time}</span>
            </div>
        `;

        return messageDiv;
    };

    /**
     * 7.3. AI Integration
     */
    EmiralProfile.getAIResponse = function (userMessage) {
        const isValidAPI = this.isValidAPIConfig();

        if (isValidAPI) {
            this.getAIResponseFromAPI(userMessage);
        } else {
            this.getBuiltInAIResponse(userMessage);
        }
    };

    EmiralProfile.isValidAPIConfig = function () {
        const { apiEndpoint, apiKey } = this.config.chat;
        return typeof apiEndpoint === 'string' &&
            apiEndpoint.startsWith('https://') &&
            typeof apiKey === 'string' &&
            apiKey.length > 10;
    };

    EmiralProfile.getAIResponseFromAPI = async function (userMessage) {
        try {
            // Auto-detect API format
            const isOpenAIFormat = this.config.chat.apiEndpoint.includes('openai.com') ||
                this.config.chat.apiEndpoint.includes('together.xyz') ||
                this.config.chat.apiEndpoint.includes('deepseek.com') ||
                this.config.chat.apiEndpoint.includes('openrouter.ai') ||
                this.config.chat.apiEndpoint.includes('anthropic.com');

            let requestBody;

            if (isOpenAIFormat) {
                // Modern API format
                requestBody = {
                    model: this.config.chat.model || 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful AI assistant.'
                        },
                        {
                            role: 'user',
                            content: userMessage
                        }
                    ],
                    max_tokens: 500,
                    temperature: 0.7
                };
            } else {
                // Simple format for custom APIs
                requestBody = { message: userMessage };
            }

            const response = await fetch(this.config.chat.apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.config.chat.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            // Extract response
            let aiResponse;
            if (data.choices && data.choices[0]) {
                aiResponse = data.choices[0].message.content;
            } else {
                aiResponse = data.response || data.message || data.text || 'No response';
            }

            this.displayAIResponse(aiResponse);

        } catch (error) {
            this.log('error', 'AI API Error:', error);
            this.hideTypingIndicator();
            this.getBuiltInAIResponse(userMessage);

            if (this.config.chat.showNotifications) {
                this.showNotification('AI service temporarily unavailable. Using offline mode.', 'warning');
            }
        }
    };

    EmiralProfile.getBuiltInAIResponse = function (userMessage) {
        const delay = this.config.chat.typingDelay + Math.random() * 1000;

        // Ensure typing indicator is shown
        setTimeout(() => {
            this.showTypingIndicator();
        }, 50);

        setTimeout(() => {
            try {
                const response = this.generateAIResponse(userMessage);
                this.displayAIResponse(response);
            } catch (error) {
                console.error('Error generating AI response:', error);
                this.hideTypingIndicator();
                this.showNotification('Sorry, I encountered an error. Please try again.', 'error');
            }
        }, delay);
    };

    EmiralProfile.displayAIResponse = function (response) {
        const { messages } = this.chatElements;

        // Hide typing indicator
        this.hideTypingIndicator();

        // Create and add AI message
        const aiMessage = this.createMessageElement(response, 'ai');
        messages.appendChild(aiMessage);

        // Store message
        this.state.chat.messages.push({
            type: 'ai',
            content: response,
            timestamp: new Date()
        });

        this.scrollChatToBottom();

        // Show notification if minimized
        if (this.state.chat.isMinimized && this.config.chat.showNotifications) {
            this.showChatNotificationBadge();
        }

        this.triggerEvent('Emiralprofile:chat:message:received', { message: response });
    };

    EmiralProfile.generateAIResponse = function (userMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // Check for personalized responses first
        if (this.state.currentUser) {
            const personalizedResponse = this.getPersonalizedResponse(lowerMessage);
            if (personalizedResponse) return personalizedResponse;
        }

        // Check custom responses
        for (const [pattern, response] of Object.entries(this.config.chat.customResponses)) {
            if (lowerMessage.includes(pattern.toLowerCase())) {
                return response;
            }
        }

        // Built-in responses
        const builtInResponse = this.getBuiltInResponse(lowerMessage);
        if (builtInResponse) return builtInResponse;

        // Default response
        return `I understand you're asking about "${userMessage}". Let me help you with that. Could you please provide more details about what you'd like to know?`;
    };

    EmiralProfile.getPersonalizedResponse = function (message) {
        const userData = this.state.currentUser;

        const responseMap = {
            'my name|who am i': () => `You are ${userData.name}, and you're currently on the ${userData.plan}.`,
            'my plan|subscription': () => this.getPlanResponse(userData),
            'api usage|usage': () => this.getUsageResponse(userData),
            'performance': () => this.getPerformanceResponse(userData),
            'pricing': () => this.getPricingResponse(userData)
        };

        for (const [pattern, responseFunc] of Object.entries(responseMap)) {
            if (new RegExp(pattern).test(message)) {
                return responseFunc();
            }
        }

        return null;
    };

    EmiralProfile.getPlanResponse = function (userData) {
        const plan = userData.plan;
        const subscription = userData.subscription;

        if (plan === 'Free Plan') {
            return 'You\'re currently on the Free Plan. Would you like to explore our Basic, Pro, or Enterprise plans for advanced features?';
        }

        let response = `You're on the ${plan}, which includes premium features and priority support.`;

        if (subscription?.daysRemaining !== undefined) {
            if (subscription.daysRemaining > 0) {
                response += ` Your subscription renews in ${subscription.daysRemaining} days.`;
            } else if (subscription.daysRemaining === 0) {
                response += ' Your subscription expires today. Please renew to continue enjoying premium features.';
            } else {
                response += ' Your subscription has expired. Please renew to restore access to premium features.';
            }
        }

        return response;
    };

    EmiralProfile.getUsageResponse = function (userData) {
        if (!userData.usage) return null;

        const { apiPercentage = 0, apiCalls = 0, apiLimit = 0 } = userData.usage;
        const remaining = apiLimit > 0 ? apiLimit - apiCalls : 'unlimited';

        let response = `Your current API usage is at ${apiPercentage}% (${this.formatNumber(apiCalls)} / ${this.formatNumber(apiLimit)} calls).`;

        if (apiLimit > 0) {
            response += ` You have ${this.formatNumber(remaining)} calls remaining this month.`;
            if (userData.subscription?.daysRemaining > 0) {
                response += ` Your plan renews in ${userData.subscription.daysRemaining} days.`;
            }
        } else {
            response += ' You have unlimited API calls with your Enterprise plan!';
        }

        return response;
    };

    EmiralProfile.getPerformanceResponse = function (userData) {
        if (!userData.usage) return null;

        const { accuracy = 0, responseTime = 0, uptime = 0 } = userData.usage;

        return `Your models are performing excellently:\n• Average accuracy: ${accuracy}%\n• Response time: ${responseTime}ms\n• Uptime: ${uptime}%\n\nCheck the Performance tab for detailed metrics.`;
    };

    EmiralProfile.getPricingResponse = function (userData) {
        const planDetails = userData.planData;
        if (!planDetails) return null;

        let response = `Your current ${planDetails.name} includes:\n`;
        response += `• ${this.formatNumber(planDetails.apiLimit)} API calls/month\n`;
        response += `• ${this.formatNumber(planDetails.projectsLimit)} concurrent projects\n`;
        response += `• ${planDetails.storageLimit} storage\n`;
        response += `• ${planDetails.supportLevel.charAt(0).toUpperCase() + planDetails.supportLevel.slice(1)} support\n\n`;

        if (userData.planId !== 'enterprise') {
            response += 'Would you like to explore upgrade options?';
        }

        return response;
    };

    EmiralProfile.getBuiltInResponse = function (message) {
        const responses = {
            'hello': 'Hello! How can I assist you today?',
            'hi': 'Hi there! What can I help you with?',
            'how are you': "I'm functioning perfectly! Ready to help you with your AI projects.",
            'help': 'I can help you with:\n• Creating new AI projects\n• Monitoring your API usage\n• Training models\n• Analyzing performance\n• Managing datasets\n\nWhat would you like to know more about?',
            'create project': 'To create a new project:\n1. Go to the AI Projects tab\n2. Click "New Project"\n3. Select your project type\n4. Configure your model settings\n5. Upload your dataset\n\nWould you like me to guide you through this process?',
            'train model': 'To train a model:\n1. Select your project from the dashboard\n2. Upload your training data\n3. Configure hyperparameters\n4. Click "Start Training"\n\nTraining typically takes 2-4 hours depending on your dataset size.',
            'thanks': "You're welcome! Is there anything else I can help you with?",
            'bye': 'Goodbye! Feel free to reach out anytime you need assistance.'
        };

        for (const [key, response] of Object.entries(responses)) {
            if (message.includes(key)) {
                return response;
            }
        }

        return null;
    };

    // Helper function
    EmiralProfile.formatNumber = function (num) {
        if (num === -1) return 'unlimited';
        if (num === undefined || num === null) return '0';
        return new Intl.NumberFormat('en-US').format(num);
    };

    EmiralProfile.showTypingIndicator = function () {
        let typingIndicator = document.getElementById('typingIndicator');
        const messagesContainer = document.getElementById('chatMessages');

        if (!messagesContainer) return;

        // Create typing indicator if it doesn't exist
        if (!typingIndicator) {
            typingIndicator = this.createTypingIndicator();
            document.body.appendChild(typingIndicator);
        }

        // Remove from current position if exists
        if (typingIndicator.parentNode) {
            typingIndicator.parentNode.removeChild(typingIndicator);
        }

        // Append to messages container
        messagesContainer.appendChild(typingIndicator);
        typingIndicator.classList.add('active');
        typingIndicator.style.display = 'flex';
        this.state.chat.isTyping = true;

        // Scroll to show indicator
        setTimeout(() => this.scrollChatToBottom(), 10);
    };

    EmiralProfile.createTypingIndicator = function () {
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'chat-message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-brain"></i>
            </div>
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        return indicator;
    };

    EmiralProfile.hideTypingIndicator = function () {
        const typingIndicator = document.getElementById('typingIndicator');
        if (typingIndicator) {
            typingIndicator.classList.remove('active');
            typingIndicator.style.display = 'none';
            // Don't remove from DOM, just hide it
            this.state.chat.isTyping = false;
        }
    };

    EmiralProfile.showChatNotificationBadge = function () {
        const badge = this.chatElements.minimizedBtn?.querySelector('.chat-notification-badge');
        if (badge) {
            this.state.chat.messageCount++;
            badge.textContent = this.state.chat.messageCount > 9 ? '9+' : this.state.chat.messageCount;
            badge.style.display = 'flex';
        }
    };

    EmiralProfile.scrollChatToBottom = function () {
        const { messages } = this.chatElements;
        if (messages) {
            requestAnimationFrame(() => {
                messages.scrollTop = messages.scrollHeight;
            });
        }
    };

    EmiralProfile.saveChatMessages = function () {
        try {
            const messages = this.state.chat.messages.slice(-MAX_CHAT_MESSAGES);
            localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(messages));
        } catch (error) {
            this.log('warn', 'Failed to save chat messages:', error);
        }
    };

    EmiralProfile.loadChatMessages = function () {
        try {
            const saved = localStorage.getItem(CHAT_STORAGE_KEY);
            if (saved) {
                const messages = JSON.parse(saved);
                this.state.chat.messages = messages;

                // Display messages
                messages.forEach(msg => {
                    const element = this.createMessageElement(msg.content, msg.type);
                    this.chatElements.messages?.appendChild(element);
                });
            }
        } catch (error) {
            this.log('warn', 'Failed to load chat messages:', error);
        }
    };

    /**
     * 8. NOTIFICATION SYSTEM
     * ======================
     */
    EmiralProfile.showNotification = function (message, type = 'info') {
        if (!this.config.notifications.enabled) return;

        const notification = this.createNotification(message, type);
        this.positionNotification(notification);
        document.body.appendChild(notification);

        // Setup close functionality
        this.setupNotificationClose(notification);

        // Auto-close
        if (this.config.notifications.duration > 0) {
            setTimeout(() => this.closeNotification(notification), this.config.notifications.duration);
        }

        this.triggerEvent('Emiralprofile:notification:show', { message, type });
    };

    EmiralProfile.createNotification = function (message, type) {
        const notification = document.createElement('div');
        notification.className = `Emiral-notification ${type} ${this.config.notifications.animations ? 'animated' : ''}`;

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        notification.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info}"></i>
            <span class="notification-message">${this.escapeHtml(message)}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        return notification;
    };

    EmiralProfile.positionNotification = function (notification) {
        const positions = {
            'top-right': { top: '20px', right: '20px' },
            'top-left': { top: '20px', left: '20px' },
            'bottom-right': { bottom: '20px', right: '20px' },
            'bottom-left': { bottom: '20px', left: '20px' }
        };

        const position = positions[this.config.notifications.position] || positions['top-right'];
        Object.assign(notification.style, {
            position: 'fixed',
            ...position,
            zIndex: '9999'
        });
    };

    EmiralProfile.setupNotificationClose = function (notification) {
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn?.addEventListener('click', () => this.closeNotification(notification));
    };

    EmiralProfile.closeNotification = function (notification) {
        if (this.config.notifications.animations) {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        } else {
            notification.remove();
        }
    };

    /**
     * 9. ANIMATION UTILITIES
     * ======================
     */
    EmiralProfile.animateValue = function (element, start, end, duration, suffix = '') {
        if (!element) return;

        const startTime = performance.now();
        const isFloat = !Number.isInteger(end);

        const update = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const ease = this.easingFunctions[this.config.animations.easing] || this.easingFunctions.easeOutQuart;
            const eased = ease(progress);

            const current = start + (end - start) * eased;
            element.textContent = (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        };

        requestAnimationFrame(update);
    };

    EmiralProfile.easingFunctions = {
        linear: t => t,
        easeInQuad: t => t * t,
        easeOutQuad: t => t * (2 - t),
        easeInOutQuad: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
        easeInCubic: t => t * t * t,
        easeOutCubic: t => (--t) * t * t + 1,
        easeInOutCubic: t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
        easeInQuart: t => t * t * t * t,
        easeOutQuart: t => 1 - (--t) * t * t * t,
        easeInOutQuart: t => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t
    };

    EmiralProfile.animateOnLoad = function () {
        const progressBars = document.querySelectorAll('.progress');
        progressBars.forEach((bar, index) => {
            const targetWidth = bar.style.width;
            bar.style.width = '0%';

            setTimeout(() => {
                bar.style.transition = `width ${this.config.animations.duration}ms ${this.config.animations.easing}`;
                bar.style.width = targetWidth;
            }, 100 * index);
        });
    };

    /**
     * 10. THEME INTEGRATION
     * =====================
     */
    EmiralProfile.initializeThemeIntegration = function () {
        this.detectTheme();

        // Listen for theme toggle
        const themeToggle = document.getElementById('theme-toggle');
        if (themeToggle) {
            themeToggle.addEventListener('click', () => {
                setTimeout(() => this.onThemeChange(), 100);
            });
        }

        // Watch for theme attribute changes
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-theme') {
                    this.onThemeChange();
                }
            });
        });

        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    };

    EmiralProfile.detectTheme = function () {
        const htmlElement = document.documentElement;
        this.state.theme = htmlElement.getAttribute('data-theme') || 'light';

        // Auto-detect if enabled
        if (this.config.theme.autoDetect && !htmlElement.getAttribute('data-theme')) {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            this.state.theme = prefersDark ? 'dark' : 'light';
        }
    };

    EmiralProfile.onThemeChange = function () {
        this.detectTheme();
        this.updateChartTheme();
        this.triggerEvent('Emiralprofile:theme:changed', { theme: this.state.theme });
    };

    EmiralProfile.updateChartTheme = function () {
        // Update all charts with new theme colors
        const charts = [
            this.state.charts.performance,
            this.state.charts.analytics.modelTrends,
            this.state.charts.analytics.responseTime
        ];

        charts.forEach(chart => {
            if (chart) {
                const colors = this.getThemeColors();
                chart.options = this.getChartOptions(colors);
                chart.update();
            }
        });
    };

    EmiralProfile.getThemeColors = function () {
        const styles = getComputedStyle(document.documentElement);
        return {
            text: styles.getPropertyValue('--text-color').trim() || '#333',
            grid: 'rgba(128, 128, 128, 0.1)',
            background: styles.getPropertyValue('--bg-color').trim() || '#fff'
        };
    };

    /**
     * 11. ERROR HANDLING
     * ==================
     */
    EmiralProfile.setupErrorHandling = function () {
        if (!this.config.errorReporting) return;

        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('user-profile')) {
                this.handleError('Runtime error', event.error);
            }
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.handleError('Unhandled promise rejection', event.reason);
        });
    };

    EmiralProfile.handleError = function (message, error) {
        this.log('error', message, error);

        if (this.config.debug) {
            console.error('EmiralProfile Error:', message, error);
        }

        if (this.config.notifications.enabled) {
            this.showNotification('An error occurred. Please try again or contact support.', 'error');
        }

        this.triggerEvent('Emiralprofile:error', { message, error });
    };

    /**
     * 12. EVENT LISTENERS & UTILITIES
     * ================================
     */
    EmiralProfile.startDataUpdates = function () {
        const intervals = [
            { key: 'usage', method: 'updateUsageData' },
            { key: 'resources', method: 'updateResourceData' },
            { key: 'performance', method: 'updatePerformanceData' }
        ];

        intervals.forEach(({ key, method }) => {
            if (this.config.updates[key] > 0) {
                this.state.updateIntervals[key] = setInterval(() => {
                    this[method]();
                }, this.config.updates[key]);
            }
        });
    };

    EmiralProfile.updateUsageData = function () {
        // Simulate small changes - replace with real API calls
        Object.keys(this.data.usage).forEach(key => {
            const change = key === 'accuracy' ? (Math.random() - 0.5) * 2 : (Math.random() - 0.5) * 5;
            this.data.usage[key] = Math.min(100, Math.max(0, this.data.usage[key] + change));
        });

        this.initializeCircularCharts();
    };

    EmiralProfile.updateResourceData = function () {
        // Simulate resource fluctuations - replace with real API calls
        const changeFactors = { cpu: 10, memory: 8, storage: 3 };

        Object.keys(this.data.resources).forEach(key => {
            const change = (Math.random() - 0.5) * changeFactors[key];
            this.data.resources[key] = Math.min(100, Math.max(0, this.data.resources[key] + change));
        });

        this.initializeGaugeCharts();
    };

    EmiralProfile.updatePerformanceData = function () {
        if (!this.state.charts.performance) return;

        const chart = this.state.charts.performance;
        const currentMonth = new Date().toLocaleString('default', { month: 'short' });

        // Update labels
        chart.data.labels.push(currentMonth);
        if (chart.data.labels.length > 6) {
            chart.data.labels.shift();
        }

        // Update datasets
        chart.data.datasets.forEach((dataset, index) => {
            const lastValue = dataset.data[dataset.data.length - 1];
            const newValue = this.calculateNewValue(lastValue, index);

            dataset.data.push(newValue);
            if (dataset.data.length > 6) {
                dataset.data.shift();
            }
        });

        chart.update();
    };

    EmiralProfile.calculateNewValue = function (lastValue, datasetIndex) {
        if (datasetIndex === 0) { // Accuracy
            return Math.max(85, Math.min(100, lastValue + (Math.random() - 0.5) * 4));
        } else { // Response Time
            return Math.max(100, Math.min(200, lastValue + (Math.random() - 0.5) * 20));
        }
    };

    EmiralProfile.refreshChartsInTab = function (tabId) {
        if (tabId === 'my-dashboard' && this.state.charts.performance) {
            setTimeout(() => {
                this.state.charts.performance.resize();
            }, 100);
        } else if (tabId === 'personal-analytics') {
            this.initializeAnalyticsCharts();
        }
    };

    EmiralProfile.copyToClipboard = function (text, button) {
        const copyToClipboard = async (text) => {
            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                    return true;
                } else {
                    // Fallback method
                    const textarea = document.createElement('textarea');
                    textarea.value = text;
                    textarea.style.position = 'fixed';
                    textarea.style.opacity = '0';
                    document.body.appendChild(textarea);
                    textarea.select();
                    const success = document.execCommand('copy');
                    document.body.removeChild(textarea);
                    return success;
                }
            } catch (err) {
                this.log('error', 'Copy failed:', err);
                return false;
            }
        };

        copyToClipboard(text).then(success => {
            if (success) {
                this.showCopyFeedback(button);
                this.triggerEvent('Emiralprofile:clipboard:copy', { text });
            } else {
                this.showNotification('Failed to copy to clipboard', 'error');
            }
        });
    };

    EmiralProfile.showCopyFeedback = function (button) {
        const originalHTML = button.innerHTML;
        const originalBg = button.style.background;

        button.innerHTML = '<i class="fas fa-check"></i>';
        button.style.background = this.config.theme.charts.colors.success;
        button.disabled = true;

        setTimeout(() => {
            button.innerHTML = originalHTML;
            button.style.background = originalBg;
            button.disabled = false;
        }, 1500);
    };

    /**
     * 13. NEW FEATURES
     * ================
     */

    /**
     * 13.1. Activity History
     */
    EmiralProfile.initializeActivityHistory = function () {
        // Set up filter buttons
        const filterButtons = document.querySelectorAll('.activity-filters .filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.filterActivityHistory(btn.textContent.toLowerCase());
            });
        });

        // Load more button
        const loadMoreBtn = document.querySelector('.load-more-container .btn');
        if (loadMoreBtn) {
            loadMoreBtn.addEventListener('click', () => {
                this.loadMoreActivityHistory();
            });
        }
    };

    EmiralProfile.loadActivityHistory = function () {
        // This would typically fetch from an API
        // For now, we'll just trigger the loaded event
        this.triggerEvent('Emiralprofile:activity:loaded');
    };

    EmiralProfile.filterActivityHistory = function (filter) {
        // Implementation for filtering activity history
        console.log('Filtering activity by:', filter);
        this.triggerEvent('Emiralprofile:activity:filtered', { filter });
    };

    EmiralProfile.loadMoreActivityHistory = function () {
        // Load more activity items
        this.showNotification('Loading more activities...', 'info');

        // Simulate API call
        setTimeout(() => {
            this.showNotification('Activities loaded successfully', 'success');
        }, 1000);
    };

    /**
     * 13.2. Account Settings
     */
    EmiralProfile.initializeAccountSettings = function () {
        // Profile form
        const profileForm = document.querySelector('#account-settings .settings-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileSettings(new FormData(profileForm));
            });
        }

        // Security form
        const securityForm = document.querySelectorAll('#account-settings .settings-form')[1];
        if (securityForm) {
            securityForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveSecuritySettings(new FormData(securityForm));
            });
        }

        // Notification toggles
        const toggles = document.querySelectorAll('.toggle-input');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.updateNotificationSettings(toggle);
            });
        });

        // Danger zone actions
        const exportBtn = document.querySelector('.danger-actions .secondary-btn');
        const deleteBtn = document.querySelector('.danger-actions .danger-btn');

        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportAccountData());
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.confirmAccountDeletion());
        }
    };

    EmiralProfile.loadAccountSettings = function () {
        // Load current settings into forms
        if (this.state.currentUser) {
            const fullNameInput = document.getElementById('fullName');
            const emailInput = document.getElementById('email');
            const companyInput = document.getElementById('company');
            const roleInput = document.getElementById('role');

            if (fullNameInput) fullNameInput.value = this.state.currentUser.name || '';
            if (emailInput) emailInput.value = this.state.currentUser.email || '';
            if (companyInput) companyInput.value = this.state.currentUser.company || '';
            if (roleInput) roleInput.value = this.state.currentUser.role || '';
        }
    };

    EmiralProfile.saveProfileSettings = function (formData) {
        // Validate and save profile settings
        this.showNotification('Saving profile settings...', 'info');

        // Simulate API call
        setTimeout(() => {
            this.showNotification('Profile updated successfully', 'success');
            this.triggerEvent('Emiralprofile:settings:profile:saved');
        }, 1000);
    };

    EmiralProfile.saveSecuritySettings = function (formData) {
        // Validate passwords
        const currentPassword = formData.get('currentPassword');
        const newPassword = formData.get('newPassword');
        const confirmPassword = formData.get('confirmPassword');

        if (!currentPassword) {
            this.showNotification('Please enter your current password', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword && newPassword.length < 8) {
            this.showNotification('Password must be at least 8 characters long', 'error');
            return;
        }

        this.showNotification('Updating security settings...', 'info');

        // Simulate API call
        setTimeout(() => {
            this.showNotification('Security settings updated successfully', 'success');
            this.triggerEvent('Emiralprofile:settings:security:saved');
        }, 1000);
    };

    EmiralProfile.updateNotificationSettings = function (toggle) {
        const settingName = toggle.closest('.notification-item').textContent.trim();
        const enabled = toggle.checked;

        this.showNotification(`${settingName} ${enabled ? 'enabled' : 'disabled'}`, 'success');
        this.triggerEvent('Emiralprofile:settings:notification:changed', { settingName, enabled });
    };

    EmiralProfile.exportAccountData = function () {
        this.showNotification('Preparing your data export...', 'info');

        // Simulate data export
        setTimeout(() => {
            const data = {
                user: this.state.currentUser,
                settings: this.config,
                exportDate: new Date().toISOString()
            };

            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `emiralai-export-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);

            this.showNotification('Data exported successfully', 'success');
            this.triggerEvent('Emiralprofile:account:exported');
        }, 1500);
    };

    EmiralProfile.confirmAccountDeletion = function () {
        if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            if (confirm('This will permanently delete all your data, projects, and models. Are you absolutely sure?')) {
                this.showNotification('Processing account deletion...', 'warning');

                // Simulate account deletion
                setTimeout(() => {
                    this.handleLogout();
                }, 2000);
            }
        }
    };

    /**
     * 13.3. Billing Management
     */
    EmiralProfile.initializeBillingManagement = function () {
        // Plan management buttons
        const changePlanBtn = document.querySelector('.plan-actions .secondary-btn');
        const cancelSubBtn = document.querySelector('.plan-actions .danger-btn');

        if (changePlanBtn) {
            changePlanBtn.addEventListener('click', () => {
                window.location.href = 'main.html#pricing';
            });
        }

        if (cancelSubBtn) {
            cancelSubBtn.addEventListener('click', () => {
                this.confirmSubscriptionCancellation();
            });
        }

        // Payment method actions
        const paymentEditBtns = document.querySelectorAll('.card-actions .small-btn:first-child');
        const paymentRemoveBtns = document.querySelectorAll('.card-actions .danger-btn');
        const addPaymentBtn = document.querySelector('.add-payment-btn');

        paymentEditBtns.forEach(btn => {
            btn.addEventListener('click', () => this.editPaymentMethod());
        });

        paymentRemoveBtns.forEach(btn => {
            btn.addEventListener('click', () => this.removePaymentMethod());
        });

        if (addPaymentBtn) {
            addPaymentBtn.addEventListener('click', () => this.addPaymentMethod());
        }

        // Invoice downloads
        const downloadLinks = document.querySelectorAll('.download-link');
        downloadLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadInvoice(link);
            });
        });
    };

    EmiralProfile.loadBillingInfo = function () {
        // Load billing information
        // This would typically fetch from an API
        this.triggerEvent('Emiralprofile:billing:loaded');
    };

    EmiralProfile.confirmSubscriptionCancellation = function () {
        if (confirm('Are you sure you want to cancel your subscription? You will lose access to premium features.')) {
            this.showNotification('Processing cancellation...', 'warning');

            setTimeout(() => {
                this.showNotification('Subscription cancelled. You have access until the end of the billing period.', 'info');
                this.triggerEvent('Emiralprofile:subscription:cancelled');
            }, 1500);
        }
    };

    EmiralProfile.editPaymentMethod = function () {
        this.showNotification('Payment method editor coming soon', 'info');
    };

    EmiralProfile.removePaymentMethod = function () {
        if (confirm('Are you sure you want to remove this payment method?')) {
            this.showNotification('Payment method removed', 'success');
            this.triggerEvent('Emiralprofile:payment:removed');
        }
    };

    EmiralProfile.addPaymentMethod = function () {
        this.showNotification('Add payment method feature coming soon', 'info');
    };

    EmiralProfile.downloadInvoice = function (link) {
        this.showNotification('Downloading invoice...', 'info');

        // Simulate invoice download
        setTimeout(() => {
            this.showNotification('Invoice downloaded successfully', 'success');
            this.triggerEvent('Emiralprofile:invoice:downloaded');
        }, 1000);
    };

    // Utility functions
    EmiralProfile.triggerEvent = function (eventName, detail = {}) {
        const event = new CustomEvent(eventName, {
            detail,
            bubbles: true,
            cancelable: true
        });
        document.dispatchEvent(event);
    };

    EmiralProfile.log = function (level, ...args) {
        if (this.config.debug || level === 'error') {
            console[level]('[EmiralProfile]', ...args);
        }
    };

    EmiralProfile.escapeHtml = function (text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };

    EmiralProfile.deepMerge = function (target, source) {
        const output = Object.assign({}, target);

        if (this.isObject(target) && this.isObject(source)) {
            Object.keys(source).forEach(key => {
                if (this.isObject(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = this.deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }

        return output;
    };

    EmiralProfile.isObject = function (item) {
        return item && typeof item === 'object' && !Array.isArray(item);
    };

    EmiralProfile.hexToRgba = function (hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    EmiralProfile.validateImageFile = function (file) {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

        if (!allowedTypes.includes(file.type)) {
            return {
                valid: false,
                message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
            };
        }

        if (file.size > maxSize) {
            return {
                valid: false,
                message: 'File size must be less than 5MB'
            };
        }

        return { valid: true };
    };

    /**
     * 14. PUBLIC API
     * ==============
     */
    EmiralProfile.destroy = function () {
        // Clear all intervals
        Object.values(this.state.updateIntervals).forEach(clearInterval);

        // Destroy chart instances
        if (this.state.charts.performance) {
            this.state.charts.performance.destroy();
        }

        // Destroy analytics charts
        if (this.state.charts.analytics.modelTrends) {
            this.state.charts.analytics.modelTrends.destroy();
        }

        if (this.state.charts.analytics.responseTime) {
            this.state.charts.analytics.responseTime.destroy();
        }

        // Reset state
        this.state = {
            initialized: false,
            isLoggedIn: false,
            currentUser: null,
            charts: { performance: null, usage: {}, resources: {}, analytics: {} },
            chat: { isOpen: false, isMinimized: false, messageCount: 0, messages: [], isTyping: false },
            theme: 'light',
            updateIntervals: {},
            activeTab: 'my-dashboard'
        };

        this.log('info', 'EmiralProfile destroyed');
    };

    EmiralProfile.updateChartData = function (chartType, data) {
        const updateMethods = {
            'usage': () => {
                Object.assign(this.data.usage, data);
                this.initializeCircularCharts();
            },
            'resources': () => {
                Object.assign(this.data.resources, data);
                this.initializeGaugeCharts();
            },
            'performance': () => {
                Object.assign(this.data.performance, data);
                if (this.state.charts.performance) {
                    this.state.charts.performance.data = this.getPerformanceChartData();
                    this.state.charts.performance.update();
                }
            },
            'analytics': () => {
                Object.assign(this.data.analytics, data);
                this.initializeAnalyticsCharts();
            }
        };

        const updateMethod = updateMethods[chartType];
        if (updateMethod) {
            updateMethod();
        }
    };

    // Public methods
    EmiralProfile.addChatResponse = function (pattern, response) {
        this.config.chat.customResponses[pattern] = response;
    };

    EmiralProfile.setAIEndpoint = function (endpoint, apiKey, model) {
        this.config.chat.apiEndpoint = endpoint;
        this.config.chat.apiKey = apiKey;
        if (model) {
            this.config.chat.model = model;
        }
    };

    EmiralProfile.getState = function () {
        return { ...this.state };
    };

    EmiralProfile.getConfig = function () {
        return { ...this.config };
    };

    EmiralProfile.getUserData = function () {
        return this.state.currentUser;
    };

    EmiralProfile.isLoggedIn = function () {
        return this.state.isLoggedIn;
    };

    // Navigation helper
    EmiralProfile.navigateToTab = function (tabId) {
        this.switchTab(tabId);
    };

    // Expose to global scope
    window.EmiralProfile = EmiralProfile;

})(window, document);

/**
 * AUTO-INITIALIZATION
 * ===================
 * Automatically initialize with default settings
 * Can be prevented by setting window.Emiral_MANUAL_INIT = true
 */
if (!window.Emiral_MANUAL_INIT) {
    EmiralProfile.init();
}

/**
 * =============================================================================
 * USAGE GUIDE FOR THEMEFOREST BUYERS
 * =============================================================================
 * 
 * USER DATA INTEGRATION:
 * This profile page automatically loads user data saved by auth-popups.js
 * 
 * CUSTOMIZATION:
 * 
 * 1. Change localStorage key:
 *    EmiralProfile.userDataConfig.storageKey = 'your_key';
 * 
 * 2. Customize default values:
 *    EmiralProfile.userDataConfig.defaults = {
 *        name: 'Your Default Name',
 *        email: 'default@email.com',
 *        profileImage: 'path/to/default/image.jpg'
 *    };
 * 
 * 3. Add custom AI responses:
 *    EmiralProfile.addChatResponse('pattern', 'response');
 * 
 * 4. Enable API chat:
 *    
 *    Add this code in USER-PROFILE.HTML file (before </body>):
 *     This 
 *    form here -->
 *     <script>
 *        window.addEventListener('load', function () {
 *           setTimeout(function () {
 *               if (typeof EmiralProfile !== 'undefined') {
 *
 *                   EmiralProfile.setAIEndpoint(
 *                       "https://api.together.xyz/v1/chat/completions",
 *                      "YOUR-API-KEY-HERE",
 *                       "mistralai/Mistral-7B-Instruct-v0.2"
 *                   );
 *
 *                   // Optional: For testing only, remove in production
                // console.log('✅ AI Chat activated successfully!');
 *              }
 *           }, 1000);
 *      });
 *   </script> 
 *    to here
 * 
 *    Supported AI Providers:
 *    - Together AI: $25 free credit
 *    - OpenRouter: $1 + free models
 *    
 *    Get API Key:
 *    - OpenRouter: https://openrouter.ai/
 *    -Together: https://api.together.xyz
 * 
 * # TROUBLESHOOTING:
 * - Chat not working? Check console for errors (F12)
 * - 401 Error: Invalid API key
 * - 403 Error: Out of credits
 * - 400 Error: Wrong model name or format
 * 
 * 5. Check login status:
 *    if (EmiralProfile.isLoggedIn()) {
 *        // User is logged in
 *    }
 * 
 * 6. Get user data:
 *    const userData = EmiralProfile.getUserData();
 * 
 * 7. Update chart data:
 *    EmiralProfile.updateChartData('usage', {
 *        monthly: 85,
 *        apiCredits: 65,
 *        accuracy: 97
 *    });
 * 
 * 8. Navigate to specific tab:
 *    EmiralProfile.navigateToTab('account-settings');
 * 
 * 
 * 
 * =============================================================================
 */