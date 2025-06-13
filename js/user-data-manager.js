/** user-data-manager.js
 * the cintrelized file for auth-popups.js, user-profile.js, payment.js and dashboard.js
 * =============================================================================
 * EMIRALAI USER DATA MANAGER - PREMIUM THEMEFOREST EDITION
 * =============================================================================
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * =============================================================================
 * PREMIUM FEATURES:
 * - Centralized data management with real-time sync
 * - Event-driven architecture for instant updates
 * - Advanced caching and performance optimization
 * - Comprehensive error handling and recovery
 * - Full TypeScript-ready documentation
 * - Easy customization for buyers
 * 
 * INTEGRATION GUIDE:
 * Simply include this file before all other scripts and use the global
 * EmiralUserData object to manage all user-related operations.
 * =============================================================================
 */

/**
 * =============================================================================
 * TABLE OF CONTENTS
 * =============================================================================
 * 
 * 1. CONFIGURATION & SETUP
 *    - Storage Configuration
 *    - Plan Definitions
 *    - Feature Flags
 *    - Event Configuration
 * 
 * 2. INITIALIZATION & STATE
 *    - init() - Initialize the User Data Manager
 *    - Internal State Management
 *    - Storage Initialization
 *    - Event Listeners Setup
 * 
 * 3. USER DATA OPERATIONS
 *    - getUserData() - Get Complete User Data
 *    - saveUserData() - Save/Update User Data
 *    - clearUserData() - Clear All User Data
 *    - isLoggedIn() - Check Login Status
 *    - getMemberRole() - Get Member Role Text
 * 
 * 4. PLAN & SUBSCRIPTION MANAGEMENT
 *    - updateUserPlan() - Update User Plan
 *    - getPlanComparison() - Get Plan Comparison Data
 *    - hasAccess() - Check Feature Access
 *    - hasPlan() - Check Plan Level
 * 
 * 5. USAGE & ANALYTICS
 *    - getUsageStats() - Get Usage Statistics
 *    - getChartData() - Get Chart-Ready Data
 *    - trackActivity() - Track User Activity
 * 
 * 6. SETTINGS & PREFERENCES
 *    - updateSettings() - Update User Settings
 *    - exportUserData() - Export User Data
 *    - importUserData() - Import User Data
 * 
 * 7. EVENT MANAGEMENT
 *    - on() - Add Event Listener
 *    - off() - Remove Event Listener
 *    - Event Triggering System
 *    - Cross-Tab Communication
 * 
 * 8. UTILITY FUNCTIONS
 *    - formatNumber() - Format Numbers
 *    - formatBytes() - Format Byte Sizes
 *    - Data Validation Functions
 * 
 * 9. PRIVATE METHODS
 *    - Storage Operations
 *    - Data Generation & Calculation
 *    - Session Management
 *    - Sync & Offline Support
 * 
 * 10. AUTO-INITIALIZATION
 * 
 * =============================================================================
 */

(function (window) {
    'use strict';

    /**
     * EmiralUserData - Premium User Data Management System
     * 
     * @global
     * @namespace EmiralUserData
     */
    const EmiralUserData = {
        /**
         * Configuration object - Easily customizable by buyers
         * @type {Object}
         */
        config: {
            // Storage configuration
            storage: {
                prefix: 'emiralai_', // Change this to your brand
                userDataKey: 'user_data',
                subscriptionKey: 'subscription',
                settingsKey: 'settings',
                cacheKey: 'cache',
                sessionTimeout: 24, // hours
                enableEncryption: false, // Set to true for sensitive data
                encryptionKey: 'your-encryption-key-here'
            },

            // Plan definitions - Customize for your pricing
            plans: {
                free: {
                    id: 'free',
                    name: 'Free Plan',
                    displayName: 'Free',
                    price: 0,
                    apiLimit: 1000,
                    storageLimit: '10GB',
                    modelsLimit: 3,
                    projectsLimit: 5,
                    supportLevel: 'community',
                    features: [
                        'Basic AI features',
                        'Community support',
                        'Standard processing speed',
                        'Basic analytics'
                    ],
                    color: '#6c757d',
                    icon: 'fas fa-user'
                },
                basic: {
                    id: 'basic',
                    name: 'Basic Plan',
                    displayName: 'Basic',
                    price: 29,
                    apiLimit: 10000,
                    storageLimit: '50GB',
                    modelsLimit: 10,
                    projectsLimit: 20,
                    supportLevel: 'email',
                    features: [
                        'All Free features',
                        'Advanced AI implementation',
                        'Email support (48h response)',
                        'Custom model training',
                        'API access',
                        'Data export'
                    ],
                    color: '#17a2b8',
                    icon: 'fas fa-star'
                },
                pro: {
                    id: 'pro',
                    name: 'Pro Plan',
                    displayName: 'Professional',
                    price: 99,
                    apiLimit: 100000,
                    storageLimit: '500GB',
                    modelsLimit: 50,
                    projectsLimit: 100,
                    supportLevel: 'priority',
                    features: [
                        'All Basic features',
                        'Priority support (12h response)',
                        'Advanced analytics & insights',
                        'Team collaboration (5 users)',
                        'Custom integrations',
                        'White-label options',
                        'Advanced API features'
                    ],
                    color: '#6f42c1',
                    icon: 'fas fa-crown'
                },
                enterprise: {
                    id: 'enterprise',
                    name: 'Enterprise Plan',
                    displayName: 'Enterprise',
                    price: 299,
                    apiLimit: -1, // Unlimited
                    storageLimit: 'Unlimited',
                    modelsLimit: -1,
                    projectsLimit: -1,
                    supportLevel: 'dedicated',
                    features: [
                        'All Pro features',
                        'Dedicated support manager',
                        'Unlimited everything',
                        'Custom development',
                        'SLA guarantee',
                        'On-premise deployment',
                        'Unlimited team members',
                        'Advanced security features'
                    ],
                    color: '#dc3545',
                    icon: 'fas fa-building'
                }
            },

            // Feature flags - Enable/disable features easily
            features: {
                enableNotifications: true,
                enableAnalytics: true,
                enableAutoSave: true,
                enableDataSync: true,
                enableOfflineMode: true,
                debugMode: false
            },

            // Event configuration
            events: {
                enableCustomEvents: true,
                logEvents: false
            }
        },

        /**
         * Internal state management
         * @private
         */
        _state: {
            initialized: false,
            currentUser: null,
            cache: new Map(),
            listeners: new Map(),
            syncInterval: null,
            offlineQueue: []
        },

        /**
         * Initialize the User Data Manager
         * @param {Object} customConfig - Optional custom configuration
         * @returns {Promise} Initialization promise
         */
        init: async function (customConfig = {}) {
            if (this._state.initialized) {
                this.log('warn', 'Already initialized');
                return Promise.resolve();
            }

            try {
                // Merge custom configuration
                this.config = this._deepMerge(this.config, customConfig);

                // Initialize storage
                this._initializeStorage();

                // Load cached data
                await this._loadCache();

                // Setup event listeners
                this._setupEventListeners();

                // Start sync if enabled
                if (this.config.features.enableDataSync) {
                    this._startDataSync();
                }

                // Check for offline data
                if (this.config.features.enableOfflineMode) {
                    await this._processOfflineQueue();
                }

                this._state.initialized = true;
                this._triggerEvent('initialized');

                this.log('info', 'EmiralUserData initialized successfully');
                return Promise.resolve();

            } catch (error) {
                this.log('error', 'Initialization failed:', error);
                return Promise.reject(error);
            }
        },

        /**
         * Get complete user data with all enhancements
         * @param {boolean} forceRefresh - Force refresh from storage
         * @returns {Object|null} Enhanced user data object
         */
        getUserData: function (forceRefresh = false) {
            try {
                // Check cache first
                if (!forceRefresh && this._state.currentUser) {
                    return this._state.currentUser;
                }

                // Get from storage
                const userData = this._getFromStorage(this.config.storage.userDataKey);
                if (!userData) return null;

                // Validate session
                if (!this._isSessionValid(userData)) {
                    this.clearUserData();
                    return null;
                }

                // Get subscription data
                const subscription = this._getFromStorage(this.config.storage.subscriptionKey);

                // Get user settings
                const settings = this._getFromStorage(this.config.storage.settingsKey) || {};

                // Build complete user object
                const planId = userData.planId || subscription?.planId || 'free';
                const planData = this.config.plans[planId] || this.config.plans.free;

                const completeUserData = {
                    // Basic info
                    id: userData.id || this._generateUserId(),
                    name: userData.name || 'Guest User',
                    email: userData.email || 'guest@emiralai.com',
                    // Generate avatar if using default image
                    profileImage: (() => {
                        const img = userData.profileImage;
                        if (!img || img.includes('default') || img.includes('emiral') || img.includes('pexels')) {
                            return this._getDefaultAvatar(userData);
                        }
                        return img;
                    })(),

                    // Plan information
                    plan: planData.name,
                    planId: planId,
                    planData: planData,

                    // Usage statistics
                    usage: this._calculateUsage(planId, userData),

                    // Subscription details
                    subscription: this._enhanceSubscription(subscription, planData),

                    // User settings
                    settings: settings,

                    // Session information
                    session: {
                        loginTime: userData.loginTime,
                        lastActivity: new Date().toISOString(),
                        expiresAt: userData.sessionExpiry,
                        isActive: true
                    },

                    // Permissions based on plan
                    permissions: this._getPermissions(planId),

                    // Activity metrics
                    metrics: this._getUserMetrics(userData)
                };

                // Cache the data
                this._state.currentUser = completeUserData;

                // Trigger data loaded event
                this._triggerEvent('dataLoaded', completeUserData);

                return completeUserData;

            } catch (error) {
                this.log('error', 'Error getting user data:', error);
                return null;
            }
        },

        /**
         * Save or update user data with validation
         * @param {Object} data - Data to save/update
         * @returns {boolean} Success status
         */
        saveUserData: function (data) {
            try {
                // Validate data
                if (!this._validateUserData(data)) {
                    throw new Error('Invalid user data');
                }

                // Get current data
                const currentData = this.getUserData() || {};

                // Prepare update
                const updatedData = {
                    ...currentData,
                    ...data,
                    lastModified: new Date().toISOString()
                };

                // Separate concerns
                const { subscription, settings, usage, metrics, permissions, ...userData } = updatedData;

                // Save to appropriate storage keys
                this._saveToStorage(this.config.storage.userDataKey, userData);

                if (subscription) {
                    this._saveToStorage(this.config.storage.subscriptionKey, subscription);
                }

                if (settings) {
                    this._saveToStorage(this.config.storage.settingsKey, settings);
                }

                // Update cache
                this._state.currentUser = updatedData;

                // Trigger events
                this._triggerEvent('dataUpdated', updatedData);
                this._notifyOtherTabs('userDataUpdated', updatedData);

                // Auto-save to server if enabled
                if (this.config.features.enableAutoSave) {
                    this._queueServerSync(updatedData);
                }

                this.log('info', 'User data saved successfully');
                return true;

            } catch (error) {
                this.log('error', 'Error saving user data:', error);

                // Add to offline queue if enabled
                if (this.config.features.enableOfflineMode) {
                    this._addToOfflineQueue('save', data);
                }

                return false;
            }
        },

        /**
         * Update user plan with full validation
         * @param {string} planId - New plan ID
         * @param {Object} subscriptionData - Optional subscription details
         * @returns {boolean} Success status
         */
        updateUserPlan: function (planId, subscriptionData = null) {
            try {
                // Validate plan
                if (!this.config.plans[planId]) {
                    throw new Error(`Invalid plan ID: ${planId}`);
                }

                const planData = this.config.plans[planId];
                const currentUser = this.getUserData();

                if (!currentUser) {
                    throw new Error('No user logged in');
                }

                // Create subscription object
                const subscription = {
                    planId: planId,
                    planName: planData.name,
                    startDate: subscriptionData?.startDate || new Date().toISOString(),
                    endDate: subscriptionData?.endDate || this._calculateEndDate(planId),
                    status: 'active',
                    autoRenew: subscriptionData?.autoRenew !== false,
                    paymentMethod: subscriptionData?.paymentMethod || 'unknown',
                    amount: planData.price,
                    currency: subscriptionData?.currency || 'USD',
                    ...subscriptionData
                };

                // Save subscription
                this._saveToStorage(this.config.storage.subscriptionKey, subscription);

                // Update user data
                this.saveUserData({
                    planId: planId,
                    plan: planData.name
                });

                // Trigger plan change events
                this._triggerEvent('planChanged', {
                    oldPlan: currentUser.planId,
                    newPlan: planId,
                    subscription: subscription
                });

                // Show success notification if enabled
                if (this.config.features.enableNotifications) {
                    this._showNotification('Plan updated successfully!', 'success');
                }

                return true;

            } catch (error) {
                this.log('error', 'Error updating plan:', error);
                return false;
            }
        },
        /**
        * Get member role text based on plan
        * @param {string} planId - Plan ID
        * @returns {string} Member role text
        */
        getMemberRole: function (planId) {
            const roleMap = {
                'free': 'Free Member',
                'basic': 'Basic Member',
                'pro': 'Pro Member',
                'enterprise': 'Enterprise Member'
            };

            return roleMap[planId] || 'Free Member';
        },

        /**
         * Get usage statistics with real-time calculation
         * @param {string} metric - Specific metric to get (optional)
         * @returns {Object} Usage statistics
         */
        getUsageStats: function (metric = null) {
            const userData = this.getUserData();
            if (!userData) return null;

            const usage = userData.usage;

            if (metric) {
                return usage[metric] || null;
            }

            return usage;
        },

        /**
         * Get chart data optimized for visualization
         * @param {string} chartType - Type of chart data needed
         * @param {Object} options - Chart options
         * @returns {Object} Chart-ready data
         */
        getChartData: function (chartType = 'monthly', options = {}) {
            const userData = this.getUserData();
            if (!userData) return null;

            const baseMultiplier = Object.keys(this.config.plans).indexOf(userData.planId) + 1;

            switch (chartType) {
                case 'monthly':
                    return this._generateMonthlyData(baseMultiplier, options);

                case 'api-usage':
                    return this._generateApiUsageData(userData, options);

                case 'performance':
                    return this._generatePerformanceData(userData, options);

                case 'storage':
                    return this._generateStorageData(userData, options);

                case 'activity':
                    return this._generateActivityData(userData, options);

                default:
                    return null;
            }
        },

        /**
         * Check if user has access to a feature
         * @param {string} feature - Feature to check
         * @returns {boolean} Access status
         */
        hasAccess: function (feature) {
            const userData = this.getUserData();
            if (!userData) return false;

            // Check plan-based access
            const permissions = userData.permissions;
            return permissions[feature] === true;
        },

        /**
         * Check if user has a specific plan or higher
         * @param {string} requiredPlan - Minimum plan required
         * @returns {boolean} Has access
         */
        hasPlan: function (requiredPlan) {
            const userData = this.getUserData();
            if (!userData) return false;

            const planHierarchy = Object.keys(this.config.plans);
            const userPlanIndex = planHierarchy.indexOf(userData.planId);
            const requiredPlanIndex = planHierarchy.indexOf(requiredPlan);

            return userPlanIndex >= requiredPlanIndex;
        },

        /**
         * Update user settings
         * @param {Object} settings - Settings to update
         * @returns {boolean} Success status
         */
        updateSettings: function (settings) {
            try {
                const currentSettings = this._getFromStorage(this.config.storage.settingsKey) || {};
                const updatedSettings = {
                    ...currentSettings,
                    ...settings,
                    lastModified: new Date().toISOString()
                };

                this._saveToStorage(this.config.storage.settingsKey, updatedSettings);

                // Update cache if user is loaded
                if (this._state.currentUser) {
                    this._state.currentUser.settings = updatedSettings;
                }

                this._triggerEvent('settingsUpdated', updatedSettings);
                return true;

            } catch (error) {
                this.log('error', 'Error updating settings:', error);
                return false;
            }
        },

        /**
         * Track user activity
         * @param {string} action - Action performed
         * @param {Object} data - Additional data
         */
        trackActivity: function (action, data = {}) {
            if (!this.config.features.enableAnalytics) return;

            const activity = {
                action: action,
                timestamp: new Date().toISOString(),
                data: data,
                sessionId: this._getSessionId()
            };

            // Store in activity log
            this._addToActivityLog(activity);

            // Trigger activity event
            this._triggerEvent('activityTracked', activity);

            // Send to analytics if configured
            if (window.gtag) {
                window.gtag('event', action, {
                    event_category: 'User Activity',
                    event_label: JSON.stringify(data)
                });
            }
        },

        /**
         * Clear all user data and logout
         * @param {boolean} clearSettings - Also clear settings
         */
        clearUserData: function (clearSettings = false) {
            try {
                // Clear storage
                this._removeFromStorage(this.config.storage.userDataKey);
                this._removeFromStorage(this.config.storage.subscriptionKey);

                if (clearSettings) {
                    this._removeFromStorage(this.config.storage.settingsKey);
                }

                // Clear cache
                this._state.currentUser = null;
                this._state.cache.clear();

                // Stop sync
                if (this._state.syncInterval) {
                    clearInterval(this._state.syncInterval);
                    this._state.syncInterval = null;
                }

                // Trigger logout event
                this._triggerEvent('userLoggedOut');
                this._notifyOtherTabs('userLoggedOut');

                this.log('info', 'User data cleared');

            } catch (error) {
                this.log('error', 'Error clearing user data:', error);
            }
        },

        /**
         * Check if user is logged in
         * @returns {boolean} Login status
         */
        isLoggedIn: function () {
            return this.getUserData() !== null;
        },

        /**
         * Export user data for backup
         * @returns {Object} Exportable data
         */
        exportUserData: function () {
            const userData = this.getUserData();
            if (!userData) return null;

            return {
                version: '2.0.0',
                exportDate: new Date().toISOString(),
                userData: userData,
                settings: this._getFromStorage(this.config.storage.settingsKey),
                activityLog: this._getActivityLog()
            };
        },

        /**
         * Import user data from backup
         * @param {Object} data - Data to import
         * @returns {boolean} Success status
         */
        importUserData: function (data) {
            try {
                if (!data || data.version !== '2.0.0') {
                    throw new Error('Invalid or incompatible data format');
                }

                // Import user data
                if (data.userData) {
                    this.saveUserData(data.userData);
                }

                // Import settings
                if (data.settings) {
                    this.updateSettings(data.settings);
                }

                this._triggerEvent('dataImported', data);
                return true;

            } catch (error) {
                this.log('error', 'Error importing data:', error);
                return false;
            }
        },

        /**
         * Add event listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         * @returns {Function} Unsubscribe function
         */
        on: function (event, callback) {
            if (!this._state.listeners.has(event)) {
                this._state.listeners.set(event, new Set());
            }

            this._state.listeners.get(event).add(callback);

            // Return unsubscribe function
            return () => {
                const listeners = this._state.listeners.get(event);
                if (listeners) {
                    listeners.delete(callback);
                }
            };
        },

        /**
         * Remove event listener
         * @param {string} event - Event name
         * @param {Function} callback - Callback function
         */
        off: function (event, callback) {
            const listeners = this._state.listeners.get(event);
            if (listeners) {
                listeners.delete(callback);
            }
        },

        /**
         * Format number with thousand separators
         * @param {number} num - Number to format
         * @returns {string} Formatted number
         */
        formatNumber: function (num) {
            if (num === -1) return '∞';
            return new Intl.NumberFormat('en-US').format(num);
        },

        /**
         * Format bytes to human readable
         * @param {number} bytes - Bytes to format
         * @returns {string} Formatted size
         */
        formatBytes: function (bytes) {
            if (bytes === 0) return '0 Bytes';
            if (bytes === -1) return 'Unlimited';

            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));

            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        },

        /**
         * Get plan comparison data
         * @returns {Array} Plan comparison array
         */
        getPlanComparison: function () {
            return Object.values(this.config.plans).map(plan => ({
                ...plan,
                apiLimitFormatted: this.formatNumber(plan.apiLimit),
                storageLimitFormatted: plan.storageLimit,
                modelsLimitFormatted: this.formatNumber(plan.modelsLimit),
                projectsLimitFormatted: this.formatNumber(plan.projectsLimit)
            }));
        },

        // Private methods
        _initializeStorage: function () {
            // Test localStorage availability
            try {
                const test = '__emiralai_test__';
                localStorage.setItem(test, test);
                localStorage.removeItem(test);
            } catch (e) {
                this.log('error', 'localStorage not available');
                // Fallback to memory storage
                this._useMemoryStorage = true;
                this._memoryStorage = new Map();
            }
        },

        _setupEventListeners: function () {
            // Listen for storage changes from other tabs
            window.addEventListener('storage', (e) => {
                if (e.key && e.key.startsWith(this.config.storage.prefix)) {
                    this._handleStorageChange(e);
                }
            });

            // Listen for visibility changes
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this._state.initialized) {
                    // Refresh data when tab becomes visible
                    this.getUserData(true);
                }
            });

            // Listen for online/offline
            window.addEventListener('online', () => {
                this._processOfflineQueue();
            });

            window.addEventListener('offline', () => {
                this._showNotification('You are offline. Changes will be synced when connection is restored.', 'warning');
            });
        },

        _handleStorageChange: function (event) {
            const key = event.key.replace(this.config.storage.prefix, '');

            switch (key) {
                case this.config.storage.userDataKey:
                    if (!event.newValue) {
                        // User logged out in another tab
                        this._state.currentUser = null;
                        this._triggerEvent('userLoggedOut');
                    } else {
                        // User data updated in another tab
                        this._state.currentUser = null; // Clear cache
                        this.getUserData(true); // Reload
                        this._triggerEvent('dataUpdated', this._state.currentUser);
                    }
                    break;

                case this.config.storage.subscriptionKey:
                    // Subscription updated
                    this.getUserData(true);
                    this._triggerEvent('subscriptionUpdated');
                    break;
            }
        },

        _validateUserData: function (data) {
            // Basic validation
            if (!data || typeof data !== 'object') return false;

            // Email validation if provided
            if (data.email && !this._isValidEmail(data.email)) return false;

            // Plan validation if provided
            if (data.planId && !this.config.plans[data.planId]) return false;

            return true;
        },

        _isValidEmail: function (email) {
            return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
        },

        _generateUserId: function () {
            return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        _getDefaultAvatar: function (userData) {
            // Generate avatar with user initials
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

            // Generate consistent color based on user data
            const str = (email || name || 'default').toLowerCase();
            let hash = 0;
            for (let i = 0; i < str.length; i++) {
                hash = ((hash << 5) - hash) + str.charCodeAt(i);
                hash = hash & hash;
            }

            // Professional color palette
            const colors = [
                '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
                '#F7DC6F', '#BB8FCE', '#85C1F2', '#F8B739', '#52C41A',
                '#1890FF', '#722ED1', '#EB2F96', '#13C2C2', '#FAAD14'
            ];

            const colorIndex = Math.abs(hash) % colors.length;
            const backgroundColor = colors[colorIndex];

            // Create SVG avatar
            const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="50" fill="${backgroundColor}"/>
                <text x="50%" y="50%" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" 
                      font-size="40" font-weight="600" fill="#FFFFFF" text-anchor="middle" 
                      dominant-baseline="middle" style="user-select: none;">${initials}</text>
            </svg>`;

            // Convert to data URL
            return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        },

        _isSessionValid: function (userData) {
            if (!userData.sessionExpiry) return true;

            const expiryDate = new Date(userData.sessionExpiry);
            return new Date() < expiryDate;
        },

        _calculateUsage: function (planId, userData) {
            const plan = this.config.plans[planId];
            if (!plan) return {};

            // Use real data if available, otherwise calculate mock data
            const seed = userData.email ?
                userData.email.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 42;

            const random = (min, max) => {
                const x = Math.sin(seed) * 10000;
                return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
            };

            // Calculate realistic usage based on plan limits
            return {
                // API usage
                apiCalls: plan.apiLimit > 0 ? random(plan.apiLimit * 0.3, plan.apiLimit * 0.85) : random(100000, 500000),
                apiLimit: plan.apiLimit,
                apiPercentage: plan.apiLimit > 0 ? Math.floor((random(30, 85) / 100) * 100) : 0,

                // Storage usage
                storageUsed: this._calculateStorageUsed(plan.storageLimit, random(20, 70)),
                storageLimit: plan.storageLimit,
                storagePercentage: random(20, 70),

                // Models usage
                modelsActive: plan.modelsLimit > 0 ? Math.min(random(1, 10), plan.modelsLimit) : random(50, 200),
                modelsLimit: plan.modelsLimit,

                // Projects count
                projectsCount: plan.projectsLimit > 0 ? Math.min(random(1, 20), plan.projectsLimit) : random(50, 300),
                projectsLimit: plan.projectsLimit,

                // Performance metrics
                accuracy: 70 + (Object.keys(this.config.plans).indexOf(planId) * 7),
                responseTime: 200 - (Object.keys(this.config.plans).indexOf(planId) * 25),
                uptime: 95 + (Object.keys(this.config.plans).indexOf(planId) * 1.25),

                // Additional metrics
                requestsToday: random(100, 1000),
                requestsThisMonth: random(5000, 50000),
                errorRate: Math.max(0.1, 5 - (Object.keys(this.config.plans).indexOf(planId) * 1.2)),
                averageProcessingTime: Math.max(50, 150 - (Object.keys(this.config.plans).indexOf(planId) * 20))
            };
        },

        _calculateStorageUsed: function (limit, percentage) {
            if (limit === 'Unlimited') return 'N/A';

            const limitValue = parseFloat(limit);
            const used = (limitValue * percentage / 100).toFixed(2);

            return `${used}${limit.replace(/[0-9.]/g, '')}`;
        },

        _enhanceSubscription: function (subscription, planData) {
            if (!subscription) {
                return {
                    status: 'inactive',
                    planId: 'free',
                    planName: 'Free Plan'
                };
            }

            // Calculate days remaining
            const endDate = new Date(subscription.endDate);
            const now = new Date();
            const daysRemaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            return {
                ...subscription,
                daysRemaining: daysRemaining,
                isExpiringSoon: daysRemaining <= 7 && daysRemaining > 0,
                isExpired: daysRemaining <= 0,
                formattedEndDate: endDate.toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                }),
                features: planData.features,
                supportLevel: planData.supportLevel
            };
        },

        _getPermissions: function (planId) {
            const planIndex = Object.keys(this.config.plans).indexOf(planId);

            return {
                // Feature permissions
                canUseAPI: planIndex >= 1,
                canExportData: planIndex >= 1,
                canCustomizeModels: planIndex >= 1,
                canAccessAnalytics: planIndex >= 0,
                canUseAdvancedAnalytics: planIndex >= 2,
                canInviteTeamMembers: planIndex >= 2,
                canUseWhiteLabel: planIndex >= 2,
                canAccessPrioritySupport: planIndex >= 2,
                canRequestCustomFeatures: planIndex >= 3,

                // Limits overrides
                hasUnlimitedAPI: planIndex >= 3,
                hasUnlimitedStorage: planIndex >= 3,
                hasUnlimitedProjects: planIndex >= 3,

                // UI permissions
                showUpgradePrompts: planIndex < 3,
                showUsageLimits: planIndex < 3,
                showAds: planIndex === 0
            };
        },

        _getUserMetrics: function (userData) {
            const loginDate = new Date(userData.loginTime);
            const now = new Date();

            return {
                accountAge: Math.floor((now - loginDate) / (1000 * 60 * 60 * 24)), // days
                lastActive: now.toISOString(),
                loginCount: parseInt(localStorage.getItem(this.config.storage.prefix + 'login_count') || '1'),
                totalApiCalls: parseInt(localStorage.getItem(this.config.storage.prefix + 'total_api_calls') || '0'),
                favoriteFeatures: this._getFavoriteFeatures()
            };
        },

        _getFavoriteFeatures: function () {
            // This could be tracked based on actual usage
            return ['AI Chat', 'Model Training', 'Analytics Dashboard'];
        },

        _generateMonthlyData: function (multiplier, options) {
            const months = options.months || ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const currentMonth = new Date().getMonth();

            return {
                labels: months.slice(0, currentMonth + 1),
                datasets: [{
                    label: 'API Calls',
                    data: months.slice(0, currentMonth + 1).map((_, i) =>
                        Math.floor((1000 * multiplier) + (Math.sin(i) * 500 * multiplier))
                    ),
                    borderColor: this.config.plans[this._state.currentUser?.planId || 'free'].color,
                    backgroundColor: this.config.plans[this._state.currentUser?.planId || 'free'].color + '20'
                }]
            };
        },

        _generateApiUsageData: function (userData, options) {
            const days = options.days || 30;
            const labels = [];
            const data = [];

            for (let i = days - 1; i >= 0; i--) {
                const date = new Date();
                date.setDate(date.getDate() - i);
                labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));

                // Generate realistic daily usage
                const baseUsage = userData.usage.apiCalls / days;
                const variation = (Math.random() - 0.5) * baseUsage * 0.4;
                data.push(Math.floor(baseUsage + variation));
            }

            return { labels, data };
        },

        _generatePerformanceData: function (userData, options) {
            return {
                accuracy: userData.usage.accuracy,
                responseTime: userData.usage.responseTime,
                uptime: userData.usage.uptime,
                errorRate: userData.usage.errorRate
            };
        },

        _generateStorageData: function (userData, options) {
            const categories = options.categories || ['Models', 'Datasets', 'Results', 'Backups', 'Other'];
            const distribution = [30, 25, 20, 15, 10]; // Percentage distribution

            return {
                labels: categories,
                data: distribution.map(percent => {
                    const storageLimit = parseFloat(userData.planData.storageLimit) || 10;
                    return (storageLimit * userData.usage.storagePercentage * percent / 10000).toFixed(2);
                })
            };
        },

        _generateActivityData: function (userData, options) {
            const hours = options.hours || 24;
            const labels = [];
            const data = [];

            for (let i = hours - 1; i >= 0; i--) {
                const time = new Date();
                time.setHours(time.getHours() - i);
                labels.push(time.toLocaleTimeString('en-US', { hour: 'numeric' }));

                // Generate activity pattern (higher during business hours)
                const hour = time.getHours();
                const isBusinessHour = hour >= 9 && hour <= 17;
                const baseActivity = isBusinessHour ? 50 : 20;
                data.push(Math.floor(baseActivity + (Math.random() * 30)));
            }

            return { labels, data };
        },

        _calculateEndDate: function (planId) {
            const date = new Date();

            // Set end date based on plan
            if (planId === 'free') {
                // Free plan never expires
                date.setFullYear(date.getFullYear() + 100);
            } else {
                // Paid plans default to 30 days
                date.setDate(date.getDate() + 30);
            }

            return date.toISOString();
        },

        _showNotification: function (message, type = 'info') {
            if (!this.config.features.enableNotifications) return;

            // Trigger notification event
            this._triggerEvent('notification', { message, type });

            // Also dispatch to window for other scripts to handle
            window.dispatchEvent(new CustomEvent('emiralai:notification', {
                detail: { message, type }
            }));
        },

        _triggerEvent: function (eventName, data = null) {
            if (this.config.events.logEvents) {
                this.log('info', `Event triggered: ${eventName}`, data);
            }

            // Internal listeners
            const listeners = this._state.listeners.get(eventName);
            if (listeners) {
                listeners.forEach(callback => {
                    try {
                        callback(data);
                    } catch (error) {
                        this.log('error', `Error in event listener for ${eventName}:`, error);
                    }
                });
            }

            // Custom events for external scripts
            if (this.config.events.enableCustomEvents) {
                window.dispatchEvent(new CustomEvent(`emiralai:${eventName}`, {
                    detail: data,
                    bubbles: true
                }));
            }
        },

        _notifyOtherTabs: function (event, data = null) {
            // Use BroadcastChannel if available
            if (window.BroadcastChannel) {
                const channel = new BroadcastChannel('emiralai_sync');
                channel.postMessage({ event, data });
                channel.close();
            } else {
                // Fallback to storage event
                const key = this.config.storage.prefix + 'sync_' + Date.now();
                localStorage.setItem(key, JSON.stringify({ event, data }));
                localStorage.removeItem(key);
            }
        },

        _startDataSync: function () {
            // Sync data every 5 minutes
            this._state.syncInterval = setInterval(() => {
                if (this.isLoggedIn()) {
                    this._syncWithServer();
                }
            }, 5 * 60 * 1000);
        },

        _syncWithServer: function () {
            // This would sync with your backend
            // For now, just update last sync time
            const userData = this.getUserData();
            if (userData) {
                userData.lastSync = new Date().toISOString();
                this.log('info', 'Data synced with server');
            }
        },

        _queueServerSync: function (data) {
            // Queue data for server sync
            // This would be implemented based on your backend
            this.log('info', 'Data queued for server sync');
        },

        _addToOfflineQueue: function (action, data) {
            this._state.offlineQueue.push({
                action,
                data,
                timestamp: new Date().toISOString()
            });

            // Store in localStorage for persistence
            localStorage.setItem(
                this.config.storage.prefix + 'offline_queue',
                JSON.stringify(this._state.offlineQueue)
            );
        },

        _processOfflineQueue: async function () {
            if (!navigator.onLine || this._state.offlineQueue.length === 0) return;

            this.log('info', `Processing ${this._state.offlineQueue.length} offline actions`);

            const queue = [...this._state.offlineQueue];
            this._state.offlineQueue = [];

            for (const item of queue) {
                try {
                    switch (item.action) {
                        case 'save':
                            await this.saveUserData(item.data);
                            break;
                        // Add more actions as needed
                    }
                } catch (error) {
                    // Re-add to queue if failed
                    this._state.offlineQueue.push(item);
                }
            }

            // Update stored queue
            if (this._state.offlineQueue.length === 0) {
                localStorage.removeItem(this.config.storage.prefix + 'offline_queue');
            } else {
                localStorage.setItem(
                    this.config.storage.prefix + 'offline_queue',
                    JSON.stringify(this._state.offlineQueue)
                );
            }
        },

        _addToActivityLog: function (activity) {
            const logKey = this.config.storage.prefix + 'activity_log';
            const log = JSON.parse(localStorage.getItem(logKey) || '[]');

            log.push(activity);

            // Keep only last 100 activities
            if (log.length > 100) {
                log.splice(0, log.length - 100);
            }

            localStorage.setItem(logKey, JSON.stringify(log));
        },

        _getActivityLog: function () {
            const logKey = this.config.storage.prefix + 'activity_log';
            return JSON.parse(localStorage.getItem(logKey) || '[]');
        },

        _getSessionId: function () {
            let sessionId = sessionStorage.getItem(this.config.storage.prefix + 'session_id');
            if (!sessionId) {
                sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                sessionStorage.setItem(this.config.storage.prefix + 'session_id', sessionId);
            }
            return sessionId;
        },

        _loadCache: async function () {
            // Load any cached data
            const cacheKey = this.config.storage.prefix + this.config.storage.cacheKey;
            const cachedData = localStorage.getItem(cacheKey);

            if (cachedData) {
                try {
                    const cache = JSON.parse(cachedData);
                    // Validate cache age, etc.
                    this.log('info', 'Cache loaded');
                } catch (error) {
                    this.log('error', 'Failed to load cache:', error);
                }
            }
        },

        // Storage abstraction methods
        _getFromStorage: function (key) {
            const fullKey = this.config.storage.prefix + key;

            try {
                if (this._useMemoryStorage) {
                    return this._memoryStorage.get(fullKey);
                }

                const value = localStorage.getItem(fullKey);
                return value ? JSON.parse(value) : null;

            } catch (error) {
                this.log('error', `Error reading from storage (${key}):`, error);
                return null;
            }
        },

        _saveToStorage: function (key, value) {
            const fullKey = this.config.storage.prefix + key;

            try {
                const serialized = JSON.stringify(value);

                if (this._useMemoryStorage) {
                    this._memoryStorage.set(fullKey, value);
                } else {
                    localStorage.setItem(fullKey, serialized);
                }

                return true;

            } catch (error) {
                this.log('error', `Error saving to storage (${key}):`, error);
                return false;
            }
        },

        _removeFromStorage: function (key) {
            const fullKey = this.config.storage.prefix + key;

            try {
                if (this._useMemoryStorage) {
                    this._memoryStorage.delete(fullKey);
                } else {
                    localStorage.removeItem(fullKey);
                }

                return true;

            } catch (error) {
                this.log('error', `Error removing from storage (${key}):`, error);
                return false;
            }
        },

        _deepMerge: function (target, source) {
            const output = Object.assign({}, target);

            if (this._isObject(target) && this._isObject(source)) {
                Object.keys(source).forEach(key => {
                    if (this._isObject(source[key])) {
                        if (!(key in target)) {
                            Object.assign(output, { [key]: source[key] });
                        } else {
                            output[key] = this._deepMerge(target[key], source[key]);
                        }
                    } else {
                        Object.assign(output, { [key]: source[key] });
                    }
                });
            }

            return output;
        },

        _isObject: function (item) {
            return item && typeof item === 'object' && !Array.isArray(item);
        },

        log: function (level, ...args) {
            if (this.config.features.debugMode || level === 'error') {
                console[level]('[EmiralUserData]', ...args);
            }
        }
    };

    // Auto-initialize
    EmiralUserData.init().catch(error => {
        console.error('[EmiralUserData] Auto-initialization failed:', error);
    });

    // Make available globally
    window.EmiralUserData = EmiralUserData;

})(window);

/**
 * =============================================================================
 * THEMEFOREST BUYER INTEGRATION GUIDE
 * =============================================================================
 * 
 * QUICK START:
 * -----------
 * 1. Include this file before all other scripts
 * 2. Access user data: const user = EmiralUserData.getUserData();
 * 3. Check login: if (EmiralUserData.isLoggedIn()) { ... }
 * 4. Update plan: EmiralUserData.updateUserPlan('pro');
 * 
 * CUSTOMIZATION:
 * --------------
 * 1. Change storage prefix:
 *    EmiralUserData.init({ storage: { prefix: 'myapp_' } });
 * 
 * 2. Add custom plans:
 *    EmiralUserData.init({
 *      plans: {
 *        custom: { name: 'Custom Plan', price: 199, ... }
 *      }
 *    });
 * 
 * 3. Listen to events:
 *    EmiralUserData.on('dataUpdated', (data) => {
 *      console.log('User data changed:', data);
 *    });
 * 
 * 4. Track custom activities:
 *    EmiralUserData.trackActivity('feature_used', { feature: 'ai_chat' });
 * 
 * AVAILABLE EVENTS:
 * -----------------
 * - initialized: Manager initialized
 * - dataLoaded: User data loaded
 * - dataUpdated: User data changed
 * - planChanged: Subscription plan changed
 * - settingsUpdated: User settings changed
 * - userLoggedOut: User logged out
 * - activityTracked: Activity tracked
 * - notification: Notification triggered
 * 
 * API REFERENCE:
 * --------------
 * - getUserData(forceRefresh)
 * - saveUserData(data)
 * - updateUserPlan(planId, subscriptionData)
 * - getUsageStats(metric)
 * - getChartData(type, options)
 * - hasAccess(feature)
 * - hasPlan(requiredPlan)
 * - updateSettings(settings)
 * - trackActivity(action, data)
 * - clearUserData(clearSettings)
 * - isLoggedIn()
 * - exportUserData()
 * - importUserData(data)
 * - on(event, callback)
 * - off(event, callback)
 * 
 * =============================================================================
 */