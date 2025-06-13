/**payment.js file
 * ⚠️ IMPORTANT: Payment simulation for demo only
 * In production, integrate with real payment gateway
 * =============================================================================
 * EMIRALAI - PREMIUM PAYMENT SYSTEM
 * =============================================================================
* Version: 1.0.0
* Author:  Omar Dello
* License: ThemeForest Regular/Extended License
 * ============================================================================= 
 * Description: Complete payment system with full integration to centralized
 * user data manager, ensuring consistent plan definitions and data flow.
 * =============================================================================
 */

/**
 * =============================================================================
 * TABLE OF CONTENTS
 * =============================================================================
 * 
 * 1. CONFIGURATION & SETTINGS
 *    - Authentication Settings
 *    - Payment Settings
 *    - Redirect Settings
 *    - State Management
 * 
 * 2. PLAN DATA INTEGRATION
 *    - getPlanData() - Get Plan from Centralized Manager
 *    - getAvailablePlans() - Get All Purchase Plans
 *    - getPlanPrice() - Get Plan Pricing
 *    - getPlanDescription() - Get Plan Description
 *    - getSupportLevel() - Get Support Level
 * 
 * 3. USER AUTHENTICATION
 *    - checkAuthentication() - Verify User Login
 *    - handleUnauthenticated() - Handle Non-logged Users
 *    - showAuthenticationPopup() - Show Login Popup
 *    - redirectToLogin() - Redirect to Login Page
 * 
 * 4. PLAN MANAGEMENT
 *    - getSelectedPlan() - Get Selected Plan
 *    - updateUserSubscription() - Update Subscription Data
 *    - calculateNextBillingDate() - Calculate Billing Date
 * 
 * 5. INDEX PAGE INTEGRATION
 *    - initializeIndexPage() - Setup Index Page
 *    - checkPendingPlan() - Check Post-Login Plans
 *    - handlePlanSelection() - Handle Plan Selection
 * 
 * 6. PAYMENT PAGE FUNCTIONALITY
 *    - initializePaymentPage() - Setup Payment Page
 *    - loadPlanDetails() - Load Order Summary
 *    - displayUserInfo() - Display User Information
 *    - setupPaymentMethods() - Setup Payment Options
 * 
 * 7. FORM VALIDATION
 *    - setupFormValidation() - Setup Form Validation
 *    - validateInput() - Validate Individual Inputs
 *    - showInputError() - Show Validation Errors
 *    - setupCardFormatting() - Format Card Inputs
 * 
 * 8. PAYMENT PROCESSING
 *    - processPayment() - Process Payment
 *    - simulatePaymentProcessing() - Simulate API Call
 *    - Card Validation (Luhn Algorithm)
 *    - detectCardType() - Detect Card Brand
 * 
 * 9. SUCCESS HANDLING
 *    - handlePaymentSuccess() - Handle Success
 *    - showSuccessAnimation() - Show Success UI
 *    - handlePaymentError() - Handle Errors
 * 
 * 10. UTILITY FUNCTIONS
 *     - showNotification() - Show Notifications
 *     - isValidCardNumber() - Validate Card Number
 *     - Event Listeners & Storage Sync
 * 
 * 11. MODULE INITIALIZATION
 *     - init() - Initialize Module
 *     - Auto-initialization
 *     - Required Styles Injection
 * 
 * =============================================================================
 */

(function (window, document) {
    'use strict';

    /**
     * 1. CONFIGURATION & SETTINGS
     * ===========================
     */
    const EmiralPayment = {
        // Configuration
        config: {
            // Authentication settings
            auth: {
                requireLogin: true,
                redirectToLogin: true,
                showAuthPopup: true
            },

            // Payment settings
            payment: {
                currency: 'USD',
                taxRate: 0.1, // 10% tax
                processingTime: 2000, // Simulate processing time
                allowTestMode: true
            },

            // Success redirect settings
            redirect: {
                afterPayment: 'dashboard.html',
                afterLogin: null, // Will be set dynamically
                loginPage: 'main.html#login'
            }
        },

        // State management
        state: {
            isLoggedIn: false,
            currentUser: null,
            selectedPlan: null,
            paymentMethod: 'credit-card',
            isProcessing: false
        }
    };

    /**
     * Get plan data from centralized manager
     * This ensures consistency across all modules
     */
    EmiralPayment.getPlanData = function (planId) {
        // Check if centralized data manager is available
        if (window.EmiralUserData && window.EmiralUserData.config.plans[planId]) {
            const centralPlan = window.EmiralUserData.config.plans[planId];

            // Transform centralized plan data to payment format
            return {
                id: planId,
                name: centralPlan.name,
                price: this.getPlanPrice(planId),
                interval: 'month',
                description: this.getPlanDescription(planId),
                features: centralPlan.features || [],
                limits: {
                    apiCalls: centralPlan.apiLimit,
                    storage: centralPlan.storageLimit,
                    models: centralPlan.modelsLimit,
                    support: this.getSupportLevel(planId)
                }
            };
        }

        // Fallback if centralized manager not available
        console.warn('Centralized data manager not available, using fallback');
        return null;
    };

    /**
     * Get all available plans for purchase
     */
    EmiralPayment.getAvailablePlans = function () {
        const plans = {};

        // Get plans from centralized manager, excluding free plan
        if (window.EmiralUserData && window.EmiralUserData.config.plans) {
            const centralPlans = window.EmiralUserData.config.plans;

            for (const [planId, planData] of Object.entries(centralPlans)) {
                if (planId !== 'free') { // Exclude free plan from purchase options
                    plans[planId] = this.getPlanData(planId);
                }
            }
        }

        return plans;
    };

    /**
     * Get plan pricing (centralized plans don't have pricing, so we define it here)
     */
    EmiralPayment.getPlanPrice = function (planId) {
        const pricing = {
            basic: 499,
            pro: 999,
            enterprise: 'Custom'
        };

        return pricing[planId] || 'Custom';
    };

    /**
     * Get plan description
     */
    EmiralPayment.getPlanDescription = function (planId) {
        const descriptions = {
            basic: 'Perfect for startups and small businesses',
            pro: 'Ideal for growing companies',
            enterprise: 'For large organizations with unique needs'
        };

        return descriptions[planId] || 'Custom solution for your needs';
    };

    /**
     * Get support level description
     */
    EmiralPayment.getSupportLevel = function (planId) {
        const supportLevels = {
            basic: 'Business hours',
            pro: '24/7',
            enterprise: 'Dedicated team'
        };

        return supportLevels[planId] || 'Standard support';
    };

    /**
 * 2. USER AUTHENTICATION CHECK
 * ============================
 */
    EmiralPayment.checkAuthentication = function () {
        try {
            // Use centralized data manager if available
            if (window.EmiralUserData && typeof window.EmiralUserData.getUserData === 'function') {
                const userData = window.EmiralUserData.getUserData();

                if (userData) {
                    this.state.isLoggedIn = true;
                    this.state.currentUser = userData;
                    console.log('User authenticated via centralized manager:', userData.email);
                    return true;
                }
            }

            // Fallback to direct localStorage check
            const userData = localStorage.getItem('emiralai_user_data');

            if (!userData) {
                this.state.isLoggedIn = false;
                this.state.currentUser = null;
                return false;
            }

            const user = JSON.parse(userData);

            // Check session expiry
            if (user.sessionExpiry) {
                const expiryDate = new Date(user.sessionExpiry);
                if (new Date() >= expiryDate) {
                    console.warn('Session expired');
                    this.state.isLoggedIn = false;
                    this.state.currentUser = null;

                    // Use centralized logout if available
                    if (window.EmiralUserData && typeof window.EmiralUserData.clearUserData === 'function') {
                        window.EmiralUserData.clearUserData();
                    } else {
                        localStorage.removeItem('emiralai_user_data');
                    }

                    return false;
                }
            }

            this.state.isLoggedIn = true;
            this.state.currentUser = user;
            console.log('User authenticated via localStorage:', user.email);
            return true;

        } catch (error) {
            console.error('Error checking authentication:', error);
            return false;
        }
    };

    /**
     * Handle unauthenticated access
     */
    EmiralPayment.handleUnauthenticated = function (planId) {
        console.log('User not authenticated, handling redirect/popup');

        // Store intended plan for after login
        sessionStorage.setItem('emiralai_pending_plan', planId);

        // Check if we're on index page or payment page
        const isIndexPage = window.location.pathname.includes('main.html') ||
            window.location.pathname === '/' ||
            window.location.pathname === '';

        if (isIndexPage && this.config.auth.showAuthPopup) {
            // On index page - show auth popup
            this.showAuthenticationPopup();
        } else {
            // On payment page - redirect to login
            this.redirectToLogin();
        }
    };

    /**
     * Show authentication popup
     */
    EmiralPayment.showAuthenticationPopup = function () {
        // First, show a notification
        this.showNotification('Please login to purchase a plan', 'warning');

        // Trigger login popup if auth system is available
        setTimeout(() => {
            if (window.AuthPopups && typeof window.AuthPopups.show === 'function') {
                window.AuthPopups.show('login-popup');
            } else {
                // Fallback: try to click login button
                const loginBtn = document.querySelector('[data-auth-popup="login-popup"]');
                if (loginBtn) {
                    loginBtn.click();
                } else {
                    // Last resort: redirect to login
                    this.redirectToLogin();
                }
            }
        }, 500);
    };

    /**
     * Redirect to login page
     */
    EmiralPayment.redirectToLogin = function () {
        const returnUrl = encodeURIComponent(window.location.href);
        window.location.href = `${this.config.redirect.loginPage}?return=${returnUrl}`;
    };

    /**
     * 3. PLAN MANAGEMENT
     * ==================
     */

    /**
     * Get selected plan from URL or storage
     */
    EmiralPayment.getSelectedPlan = function () {
        // First, check URL parameter
        const urlParams = new URLSearchParams(window.location.search);
        let planId = urlParams.get('plan');

        // If no URL parameter, check session storage (for pending purchase)
        if (!planId) {
            planId = sessionStorage.getItem('emiralai_pending_plan');
        }

        // Validate plan exists
        const availablePlans = this.getAvailablePlans();
        if (planId && availablePlans[planId]) {
            this.state.selectedPlan = planId;
            return planId;
        }

        // Default to pro plan
        this.state.selectedPlan = 'pro';
        return 'pro';
    };

    /**
     * Update user subscription data using centralized manager
     */
    EmiralPayment.updateUserSubscription = function (planId, paymentDetails) {
        try {
            const plan = this.getPlanData(planId);

            // Save subscription data
            const subscription = {
                planId: planId,
                planName: plan.name,
                price: typeof plan.price === 'number' ? plan.price : 0,
                startDate: new Date().toISOString(),
                nextBillingDate: this.calculateNextBillingDate('month'),
                status: 'active',
                paymentMethod: this.state.paymentMethod,
                paymentDetails: paymentDetails,
                features: plan.features,
                limits: plan.limits
            };

            // Save to localStorage
            localStorage.setItem('emiralai_subscription', JSON.stringify(subscription));

            // Update user data
            const currentUserData = JSON.parse(localStorage.getItem('emiralai_user_data') || '{}');
            currentUserData.planId = planId;
            currentUserData.plan = plan.name;

            // Save updated user data
            localStorage.setItem('emiralai_user_data', JSON.stringify(currentUserData));

            // Update state
            this.state.currentUser = currentUserData;

            console.log('Subscription saved with planId:', planId);

        } catch (error) {
            console.error('Error updating subscription:', error);
        }
    };

    /**
     * Calculate next billing date based on interval
     */
    EmiralPayment.calculateNextBillingDate = function (interval) {
        const date = new Date();

        switch (interval) {
            case 'month':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'year':
                date.setFullYear(date.getFullYear() + 1);
                break;
            case 'custom':
                // Enterprise plans - set to null or far future
                return null;
            default:
                date.setMonth(date.getMonth() + 1);
        }

        return date.toISOString();
    };

    /**
     * 4. INDEX PAGE INTEGRATION
     * =========================
     */
    EmiralPayment.initializeIndexPage = function () {
        // Only run on index page
        const isIndexPage = window.location.pathname.includes('main.html') ||
            window.location.pathname === '/' ||
            window.location.pathname === '' ||
            window.location.pathname.endsWith('/');

        if (!isIndexPage) return;

        console.log('Initializing payment integration on index page');

        // Check authentication status once
        const isAuthenticated = this.checkAuthentication();

        // Check if user already has an active subscription
        let hasActiveSubscription = false;
        let currentPlanId = null;

        if (isAuthenticated && window.EmiralUserData) {
            const userData = window.EmiralUserData.getUserData();
            if (userData && userData.subscription && userData.subscription.status === 'active') {
                hasActiveSubscription = true;
                currentPlanId = userData.planId || userData.subscription.planId;
                console.log('User has active subscription:', currentPlanId);
            }
        }

        // Update pricing plan buttons
        const pricingCards = document.querySelectorAll('.pricing-card');

        if (pricingCards.length > 0) {
            // Map plan names to their IDs
            const planMap = {
                'Basic': 'basic',
                'Pro': 'pro',
                'Enterprise': 'enterprise'
            };

            // Process each pricing card
            pricingCards.forEach(card => {
                const planNameElement = card.querySelector('h3');
                if (!planNameElement) return;

                const planName = planNameElement.textContent.trim();
                let planId = planMap[planName];

                if (!planId) {
                    console.warn('Unknown plan:', planName);
                    return;
                }

                const button = card.querySelector('.pricing-btn');
                if (!button) return;

                // Store plan ID on button for easy access
                button.dataset.planId = planId;

                // Update button text based on auth state and subscription
                if (hasActiveSubscription) {
                    if (currentPlanId === planId) {
                        button.textContent = 'Current Plan';
                        button.classList.add('current-plan');
                    } else {
                        // Check if this is an upgrade or downgrade
                        const planHierarchy = ['free', 'basic', 'pro', 'enterprise'];
                        const currentIndex = planHierarchy.indexOf(currentPlanId);
                        const targetIndex = planHierarchy.indexOf(planId);

                        if (targetIndex > currentIndex) {
                            button.textContent = 'Upgrade';
                        } else {
                            button.textContent = 'Change Plan';
                        }
                    }
                } else if (isAuthenticated) {
                    button.textContent = 'Select Plan';
                } else {
                    button.textContent = 'Get Started';
                }

                // Remove ALL existing event listeners by cloning
                const newButton = button.cloneNode(true);
                button.parentNode.replaceChild(newButton, button);

                // Add new click handler
                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();

                    console.log('Plan button clicked:', planId);

                    // If user has the same plan, show notification
                    if (hasActiveSubscription && currentPlanId === planId) {
                        this.showNotification('You already have this plan active!', 'info');
                        return;
                    }

                    this.handlePlanSelection(planId);
                });

                // Also handle href clicks if button is a link
                if (newButton.tagName === 'A') {
                    newButton.href = '#';
                }
            });
        }

        // Also check for any existing data-plan buttons
        const planButtons = document.querySelectorAll('[data-plan]');
        planButtons.forEach(button => {
            let planId = button.getAttribute('data-plan');
            if (!planId) return;

            // Remove existing listeners
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);

            // Add handler
            newButton.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.handlePlanSelection(planId);
            });
        });

        // Check if returning from login with pending plan
        this.checkPendingPlan();
    };

    /**
     * Check for pending plan after login
     */
    EmiralPayment.checkPendingPlan = function () {
        const pendingPlan = sessionStorage.getItem('emiralai_pending_plan');

        if (pendingPlan && this.checkAuthentication()) {
            console.log('Found pending plan:', pendingPlan);

            // Clear pending plan
            sessionStorage.removeItem('emiralai_pending_plan');

            // Redirect to payment page
            setTimeout(() => {
                window.location.href = `payment.html?plan=${pendingPlan}`;
            }, 500);
        }
    };

    /**
     * Handle plan selection
     */
    EmiralPayment.handlePlanSelection = function (planId) {
        console.log('Plan selected:', planId);

        // Check authentication
        if (!this.checkAuthentication()) {
            console.log('User not authenticated, showing login');
            this.handleUnauthenticated(planId);
            return;
        }

        // All plans including Enterprise go to payment page
        console.log('Redirecting to payment page with plan:', planId);
        window.location.href = `payment.html?plan=${planId}`;
    };

    /**
     * 5. PAYMENT PAGE FUNCTIONALITY
     * =============================
     */
    EmiralPayment.initializePaymentPage = function () {
        // Only run on payment page
        if (!window.location.pathname.includes('payment.html')) return;

        console.log('Initializing payment page');

        // Check authentication first
        if (!this.checkAuthentication()) {
            this.showNotification('Please login to complete your purchase', 'warning');

            //If you want the user to return to the home page, just uncomment these lines.
            /** 
             * setTimeout(() => {
             * this.redirectToLogin();
             * }, 1500)
             * ;
             * return;
            */
            
        }

        // Get selected plan
        const selectedPlan = this.getSelectedPlan();

        // Load plan details
        this.loadPlanDetails(selectedPlan);

        // Setup payment methods
        this.setupPaymentMethods();

        // Setup form validation
        this.setupFormValidation();

        // Setup card formatting
        this.setupCardFormatting();

        // Display user info
        this.displayUserInfo();
    };

    /**
     * Load plan details into the order summary
     */
    EmiralPayment.loadPlanDetails = function (planId) {
        const plan = this.getPlanData(planId);
        if (!plan) {
            console.error('Plan not found:', planId);
            return;
        }

        const planDetailsContainer = document.getElementById('plan-details');
        const planFeaturesContainer = document.getElementById('plan-features');

        if (!planDetailsContainer || !planFeaturesContainer) return;

        // Clear containers
        planDetailsContainer.innerHTML = '';
        planFeaturesContainer.innerHTML = '';

        // Add plan header
        const existingHeader = planDetailsContainer.parentNode.querySelector('.plan-header');
        if (existingHeader) {
            existingHeader.remove();
        }

        const planHeader = document.createElement('div');
        planHeader.className = 'plan-header';
        planHeader.innerHTML = `
            <h3>${plan.name}</h3>
            <p>${plan.description}</p>
        `;
        planDetailsContainer.parentNode.insertBefore(planHeader, planDetailsContainer);

        // Add main plan
        planDetailsContainer.innerHTML += `
            <div class="order-item">
                <span>${plan.name} Subscription</span>
                <span>${typeof plan.price === 'number' ? '$' + plan.price.toFixed(2) : plan.price}</span>
            </div>
        `;

        // Calculate pricing
        let subtotal = typeof plan.price === 'number' ? plan.price : 0;

        // Add additional services for pro plan
        if (planId === 'pro') {
            planDetailsContainer.innerHTML += `
                <div class="order-item">
                    <span>Custom API Integration</span>
                    <span>$299.00</span>
                </div>
            `;
            subtotal += 299;
        }

        // Add pricing breakdown
        if (typeof plan.price === 'number') {
            const tax = subtotal * this.config.payment.taxRate;
            const total = subtotal + tax;

            planDetailsContainer.innerHTML += `
                <div class="order-divider"></div>
                <div class="order-item">
                    <span>Subtotal</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="order-item">
                    <span>Tax (${(this.config.payment.taxRate * 100).toFixed(0)}%)</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="order-total">
                    <span>Total</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
                <div class="order-recurring">
                    <i class="fas fa-info-circle"></i>
                    <span>Billed ${plan.interval === 'month' ? 'monthly' : plan.interval}</span>
                </div>
            `;
        } else {
            planDetailsContainer.innerHTML += `
                <div class="order-divider"></div>
                <div class="order-total">
                    <span>Total</span>
                    <span>Contact Sales</span>
                </div>
                <div class="order-recurring">
                    <i class="fas fa-info-circle"></i>
                    <span>Custom billing terms</span>
                </div>
            `;
        }

        // Add features
        plan.features.forEach(feature => {
            planFeaturesContainer.innerHTML += `
                <div class="order-feature">
                    <i class="fas fa-check-circle"></i>
                    <span>${feature}</span>
                </div>
            `;
        });
    };

    /**
     * Display user information
     */
    EmiralPayment.displayUserInfo = function () {
        if (!this.state.currentUser) return;

        // Pre-fill form fields with user data
        const emailInputs = document.querySelectorAll('input[type="email"]');
        emailInputs.forEach(input => {
            if (input && !input.value) {
                input.value = this.state.currentUser.email;
            }
        });

        const nameInputs = document.querySelectorAll('input[id*="name"], input[placeholder*="name" i]');
        nameInputs.forEach(input => {
            if (input && !input.value) {
                input.value = this.state.currentUser.name;
            }
        });

        // Add user info display
        const existingUserInfo = document.querySelector('.user-info-display');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }

        const userInfoElement = document.createElement('div');
        userInfoElement.className = 'user-info-display';
        userInfoElement.innerHTML = `
            <div class="user-info-header">
                <i class="fas fa-user-circle"></i>
                <span>Purchasing as: <strong>${this.state.currentUser.name}</strong></span>
            </div>
        `;

        const paymentForm = document.querySelector('.payment-form-container');
        if (paymentForm && paymentForm.firstChild) {
            paymentForm.insertBefore(userInfoElement, paymentForm.firstChild);
        }
    };

    /**
     * Setup payment method selection
     */
    EmiralPayment.setupPaymentMethods = function () {
        const paymentMethods = document.querySelectorAll('.payment-method');
        const paymentForms = document.querySelectorAll('.payment-form-wrapper');

        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                // Update active method
                paymentMethods.forEach(m => m.classList.remove('active'));
                method.classList.add('active');

                // Show corresponding form
                const methodId = method.getAttribute('data-method');
                this.state.paymentMethod = methodId;

                paymentForms.forEach(form => {
                    form.classList.remove('active');
                });

                const targetForm = document.getElementById(`${methodId}-form`);
                if (targetForm) {
                    targetForm.classList.add('active');
                }
            });
        });

        // Initialize credit card form as active
        const creditCardForm = document.getElementById('credit-card-form');
        if (creditCardForm) {
            creditCardForm.classList.add('active');
        }
    };

    /**
     * 6. FORM VALIDATION
     * ==================
     */
    EmiralPayment.setupFormValidation = function () {
        const forms = ['payment-form', 'paypal-payment-form', 'bank-transfer-form-element'];

        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (!form) return;

            form.addEventListener('submit', (e) => {
                e.preventDefault();

                if (this.state.isProcessing) return;

                const inputs = form.querySelectorAll('input[required]');
                let isValid = true;

                inputs.forEach(input => {
                    if (!this.validateInput(input)) {
                        isValid = false;
                    }
                });

                if (!isValid) {
                    this.showNotification('Please fix the errors in the form', 'error');
                    return;
                }

                // Process payment
                this.processPayment(form);
            });

            // Add real-time validation
            const inputs = form.querySelectorAll('input');
            inputs.forEach(input => {
                input.addEventListener('blur', () => {
                    this.validateInput(input);
                });

                input.addEventListener('input', () => {
                    if (input.classList.contains('is-invalid')) {
                        this.validateInput(input);
                    }
                });
            });
        });
    };

    /**
     * Validate individual input
     */
    EmiralPayment.validateInput = function (input) {
        // Remove existing error
        const errorMsg = input.parentElement.querySelector('.error-message');
        if (errorMsg) {
            errorMsg.remove();
        }

        input.classList.remove('is-invalid');

        // Check if empty
        if (!input.value.trim() && input.required) {
            this.showInputError(input, 'This field is required');
            return false;
        }

        // Email validation
        if (input.type === 'email') {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                this.showInputError(input, 'Please enter a valid email address');
                return false;
            }
        }

        // Card number validation
        if (input.id === 'card-number') {
            const cardNum = input.value.replace(/\s/g, '');
            if (cardNum.length < 13 || cardNum.length > 19) {
                this.showInputError(input, 'Please enter a valid card number');
                return false;
            }

            // Luhn algorithm check
            if (!this.isValidCardNumber(cardNum)) {
                this.showInputError(input, 'Invalid card number');
                return false;
            }
        }

        // Expiry validation
        if (input.id === 'card-expiry') {
            const expiry = input.value.split('/');
            if (expiry.length !== 2) {
                this.showInputError(input, 'Please enter MM/YY format');
                return false;
            }

            const month = parseInt(expiry[0], 10);
            const year = parseInt('20' + expiry[1], 10);
            const now = new Date();

            if (month < 1 || month > 12) {
                this.showInputError(input, 'Invalid month');
                return false;
            }

            const expiryDate = new Date(year, month - 1);
            if (expiryDate < now) {
                this.showInputError(input, 'Card has expired');
                return false;
            }
        }

        // CVV validation
        if (input.id === 'card-cvv') {
            const cvv = input.value.replace(/\D/g, '');
            if (cvv.length < 3 || cvv.length > 4) {
                this.showInputError(input, 'Invalid CVV');
                return false;
            }
        }

        input.classList.add('is-valid');
        return true;
    };

    /**
     * Show input error
     */
    EmiralPayment.showInputError = function (input, message) {
        input.classList.add('is-invalid');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        input.parentElement.appendChild(errorDiv);
    };

    /**
     * Setup card formatting
     */
    EmiralPayment.setupCardFormatting = function () {
        // Card number formatting
        const cardNumberInput = document.getElementById('card-number');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s/g, '');
                let formattedValue = '';

                for (let i = 0; i < value.length && i < 16; i++) {
                    if (i > 0 && i % 4 === 0) {
                        formattedValue += ' ';
                    }
                    formattedValue += value[i];
                }

                e.target.value = formattedValue;

                // Detect card type
                this.detectCardType(value);
            });
        }

        // Expiry date formatting
        const expiryInput = document.getElementById('card-expiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\D/g, '');

                if (value.length >= 2) {
                    value = value.substr(0, 2) + '/' + value.substr(2, 2);
                }

                e.target.value = value;
            });
        }

        // CVV formatting
        const cvvInput = document.getElementById('card-cvv');
        if (cvvInput) {
            cvvInput.addEventListener('input', (e) => {
                e.target.value = e.target.value.replace(/\D/g, '').substr(0, 4);
            });
        }
    };

    /**
     * 7. PAYMENT PROCESSING
     * =====================
     */
    EmiralPayment.processPayment = function (form) {
        if (this.state.isProcessing) return;

        this.state.isProcessing = true;

        // Get form data
        const formData = new FormData(form);
        const paymentData = {};

        formData.forEach((value, key) => {
            paymentData[key] = value;
        });

        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;

        const loadingDotsContainer = document.createElement('div');
        loadingDotsContainer.className = 'loading-dots';

        for (let i = 0; i < 3; i++) {
            const span = document.createElement('span');
            loadingDotsContainer.appendChild(span);
        }

        submitBtn.innerHTML = '';
        submitBtn.appendChild(loadingDotsContainer);
        submitBtn.disabled = true;

        // Simulate payment processing
        setTimeout(() => {
            // In production, this would be an actual API call
            const success = this.simulatePaymentProcessing(paymentData);

            if (success) {
                this.handlePaymentSuccess(paymentData);
            } else {
                this.handlePaymentError('Payment failed. Please try again.', submitBtn, originalText);
            }
        }, this.config.payment.processingTime);
    };

    /**
     * Simulate payment processing (replace with actual API in production)
     */
    EmiralPayment.simulatePaymentProcessing = function (paymentData) {
        // In test mode, always succeed
        if (this.config.payment.allowTestMode) {
            console.log('Processing payment in test mode:', paymentData);
            return true;
        }

        // Random success/failure for demo
        return Math.random() > 0.1;
    };

    /**
     * 8. SUCCESS HANDLING
     * ===================
     */
    EmiralPayment.handlePaymentSuccess = function (paymentData) {
        console.log('Payment successful!');

        // Update user subscription
        this.updateUserSubscription(this.state.selectedPlan, {
            last4: paymentData['card-number'] ? paymentData['card-number'].slice(-4) : '****',
            type: this.state.paymentMethod,
            timestamp: new Date().toISOString()
        });

        // Show success animation
        this.showSuccessAnimation();

        // Clear pending plan
        sessionStorage.removeItem('emiralai_pending_plan');
    };

    /**
     * Show success animation
     */
    EmiralPayment.showSuccessAnimation = function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        const formContainer = document.querySelector('.payment-form-container');
        if (!formContainer) return;

        // Fade out form
        formContainer.style.opacity = '0';

        setTimeout(() => {
            // Clear container
            formContainer.innerHTML = '';
            formContainer.style.opacity = '1';

            // Add success checkmark
            const successCheckmark = document.createElement('div');
            successCheckmark.className = 'success-checkmark';
            successCheckmark.style.display = 'block';
            formContainer.appendChild(successCheckmark);

            const checkIcon = document.createElement('div');
            checkIcon.className = 'check-icon';
            successCheckmark.appendChild(checkIcon);

            const lineTip = document.createElement('span');
            lineTip.className = 'icon-line line-tip';
            checkIcon.appendChild(lineTip);

            const lineLong = document.createElement('span');
            lineLong.className = 'icon-line line-long';
            checkIcon.appendChild(lineLong);

            const iconCircle = document.createElement('div');
            iconCircle.className = 'icon-circle';
            checkIcon.appendChild(iconCircle);

            const iconFix = document.createElement('div');
            iconFix.className = 'icon-fix';
            checkIcon.appendChild(iconFix);

            // Add success message
            const successMessage = document.createElement('div');
            successMessage.className = 'success-message-container';
            formContainer.appendChild(successMessage);

            const heading = document.createElement('h3');
            heading.textContent = 'Payment Successful!';
            successMessage.appendChild(heading);

            const plan = this.getPlanData(this.state.selectedPlan);
            const message = document.createElement('p');
            message.innerHTML = `
                Thank you for your payment, <strong>${this.state.currentUser.name}</strong>! 
                Your subscription to the <strong>${plan.name}</strong> has been activated. 
                You now have access to all premium features. We've sent a confirmation 
                email to <strong>${this.state.currentUser.email}</strong>.
            `;
            successMessage.appendChild(message);

            const dashboardBtn = document.createElement('a');
            dashboardBtn.href = this.config.redirect.afterPayment;
            dashboardBtn.className = 'payment-btn';
            dashboardBtn.innerHTML = '<i class="fas fa-tachometer-alt"></i> Go to Dashboard';
            successMessage.appendChild(dashboardBtn);

        }, 300);
    };

    /**
     * Handle payment error
     */
    EmiralPayment.handlePaymentError = function (message, button, originalText) {
        this.state.isProcessing = false;

        // Restore button
        button.innerHTML = originalText;
        button.disabled = false;

        // Show error notification
        this.showNotification(message, 'error');
    };

    /**
     * 9. UTILITY FUNCTIONS
     * ====================
     */

    /**
     * Luhn algorithm for card validation
     */
    EmiralPayment.isValidCardNumber = function (cardNumber) {
        let sum = 0;
        let isEven = false;

        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i], 10);

            if (isEven) {
                digit *= 2;
                if (digit > 9) {
                    digit -= 9;
                }
            }

            sum += digit;
            isEven = !isEven;
        }

        return sum % 10 === 0;
    };

    /**
     * Detect card type from number
     */
    EmiralPayment.detectCardType = function (cardNumber) {
        const cardTypeElement = document.querySelector('.card-type-icon');
        if (!cardTypeElement) return;

        let cardType = 'credit-card';

        if (/^4/.test(cardNumber)) {
            cardType = 'cc-visa';
        } else if (/^5[1-5]/.test(cardNumber)) {
            cardType = 'cc-mastercard';
        } else if (/^3[47]/.test(cardNumber)) {
            cardType = 'cc-amex';
        } else if (/^6(?:011|5)/.test(cardNumber)) {
            cardType = 'cc-discover';
        }

        cardTypeElement.innerHTML = `<i class="fab fa-${cardType}"></i>`;
    };

    /**
     * Show notification
     */
    EmiralPayment.showNotification = function (message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.payment-notification');
        existingNotifications.forEach(n => n.remove());

        const notification = document.createElement('div');
        notification.className = `payment-notification ${type}`;

        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };

        notification.innerHTML = `
            <i class="fas fa-${icons[type] || icons.info}"></i>
            <span>${message}</span>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        document.body.appendChild(notification);

        // Add close functionality
        const closeBtn = notification.querySelector('.notification-close');
        closeBtn.addEventListener('click', () => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        });

        // Auto-close after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.classList.add('fade-out');
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    };

    /**
     * Initialize module
     */
    EmiralPayment.init = function () {
        console.log('EmiralPayment module initializing...');

        // Get current page path
        const currentPath = window.location.pathname;
        console.log('Current page:', currentPath);

        // Check which page we're on
        const isPaymentPage = currentPath.includes('payment.html');
        const isIndexPage = currentPath.includes('main.html') ||
            currentPath === '/' ||
            currentPath === '' ||
            currentPath.endsWith('/');

        if (isPaymentPage) {
            console.log('Initializing payment page functionality');
            // Initialize payment page
            this.initializePaymentPage();
        } else if (isIndexPage) {
            console.log('Initializing index page functionality');
            // Initialize index page integration
            this.initializeIndexPage();
        } else {
            console.log('Not on index or payment page, skipping initialization');
        }

        // Listen for storage changes (login/logout in other tabs)
        window.addEventListener('storage', (e) => {
            if (e.key === 'emiralai_user_data' || e.key === 'emiralai_subscription') {
                location.reload();
            }
        });

        // Listen for user data updates from centralized manager
        window.addEventListener('emiralUserDataUpdated', (e) => {
            console.log('User data updated, refreshing authentication state');
            this.checkAuthentication();
        });
    };

    // Expose to global scope
    window.EmiralPayment = EmiralPayment;

})(window, document);

/**
 * Auto-initialize when DOM is ready
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        EmiralPayment.init();
    });
} else {
    EmiralPayment.init();
}

/**
 * Required styles for notifications and additional UI elements
 */
(function () {
    const styleId = 'emiral-payment-styles';
    if (document.getElementById(styleId)) return;

    const styles = `
        /* Payment Notifications */
        .payment-notification {
            position: fixed;
            top: 20px;
            right: 20px;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 300px;
            max-width: 500px;
            padding: 16px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
            font-family: inherit;
            font-size: 14px;
            line-height: 1.5;
            backdrop-filter: blur(10px);
            animation: slideIn 0.3s ease-out;
            z-index: 10000;
        }
        
        .payment-notification i {
            font-size: 20px;
            flex-shrink: 0;
        }
        
        .payment-notification span {
            flex: 1;
            color: #fff;
        }
        
        .payment-notification .notification-close {
            background: rgba(255, 255, 255, 0.2);
            border: none;
            border-radius: 5px;
            width: 28px;
            height: 28px;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s ease;
            flex-shrink: 0;
            color: #fff;
        }
        
        .payment-notification .notification-close:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: scale(1.1);
        }
        
        .payment-notification.success {
            background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
            color: #fff;
        }
        
        .payment-notification.error {
            background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
            color: #fff;
        }
        
        .payment-notification.warning {
            background: linear-gradient(135deg, #ff9800 0%, #fb8c00 100%);
            color: #fff;
        }
        
        .payment-notification.info {
            background: linear-gradient(135deg, #2196f3 0%, #1e88e5 100%);
            color: #fff;
        }
        
        .payment-notification.fade-out {
            animation: slideOut 0.3s ease-out;
            opacity: 0;
        }
        
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        /* User info display */
        .user-info-display {
            background: var(--glass-bg);
            border: 1px solid var(--glass-border);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
        }
        
        .user-info-header {
            display: flex;
            align-items: center;
            gap: 10px;
            color: var(--text-color);
        }
        
        .user-info-header i {
            font-size: 24px;
            color: var(--primary-color);
        }
        
        /* Plan header in payment page */
        .plan-header {
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 1px solid var(--glass-border);
        }
        
        .plan-header h3 {
            color: var(--primary-color);
            margin-bottom: 5px;
        }
        
        .plan-header p {
            color: var(--text-color-secondary);
            font-size: 14px;
        }
        
        /* Order divider */
        .order-divider {
            height: 1px;
            background: var(--glass-border);
            margin: 15px 0;
        }
        
        /* Order recurring info */
        .order-recurring {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 10px;
            color: var(--text-color-secondary);
            font-size: 14px;
        }
        
        .order-recurring i {
            color: var(--primary-color);
        }
        
        /* Card type icon */
        .card-type-icon {
            position: absolute;
            right: 15px;
            top: 50%;
            transform: translateY(-50%);
            font-size: 24px;
            color: var(--primary-color);
            opacity: 0.7;
        }
        
        /* Input validation states */
        input.is-valid {
            border-color: #4caf50 !important;
        }
        
        input.is-invalid {
            border-color: #f44336 !important;
        }
        
        .error-message {
            color: #f44336;
            font-size: 12px;
            margin-top: 5px;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .error-message::before {
            content: '\\f06a';
            font-family: 'Font Awesome 5 Free';
            font-weight: 900;
        }

        /* Current plan button styling */
        .pricing-btn.current-plan {
            background: var(--glass-bg) !important;
            color: var(--primary-color) !important;
            border: 2px solid var(--primary-color) !important;
            cursor: default !important;
            opacity: 0.8;
        }

        .pricing-btn.current-plan:hover {
            transform: none !important;
            box-shadow: none !important;
        }

        .pricing-btn.current-plan::before {
            content: '✓ ';
            margin-right: 5px;
        }
    `;

    const styleElement = document.createElement('style');
    styleElement.id = styleId;
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
})();

/**
 * =============================================================================
 * USAGE GUIDE FOR THEMEFOREST BUYERS - UPDATED
 * =============================================================================
 * 
 * CENTRALIZED DATA INTEGRATION:
 * - Payment system now fully integrated with EmiralUserData centralized manager
 * - No more duplicate plan definitions - all plans come from user-data-manager.js
 * - Consistent plan naming across all modules
 * 
 * AUTHENTICATION INTEGRATION:
 * - Uses centralized EmiralUserData.getUserData() when available
 * - Falls back to direct localStorage access if needed
 * - Automatic session validation
 * 
 * PLAN CONSISTENCY:
 * - Plans defined in user-data-manager.js: free, basic, pro, enterprise
 * - All plan data flows from centralized manager
 * 
 * CUSTOMIZATION:
 * 
 * 1. Add new plans:
 *    - Add to user-data-manager.js config.plans object
 *    - Add pricing in payment.js getPlanPrice() method
 *    - System automatically picks up new plans
 * 
 * 2. Change pricing:
 *    EmiralPayment.getPlanPrice = function(planId) {
 *        const pricing = {
 *            basic: 299,   
 *            pro: 799,      
 *            enterprise: 'Custom'
 *        };
 *        return pricing[planId] || 'Custom';
 *    };
 * 
 * 3. Modify tax rate:
 *    EmiralPayment.config.payment.taxRate = 0.15; // 15% tax
 * 
 * 4. Check user subscription:
 *    const userData = EmiralUserData.getUserData();
 *    if (userData && userData.subscription) {
 *        console.log('Active plan:', userData.subscription.planName);
 *        console.log('Next billing:', userData.subscription.nextBillingDate);
 *    }
 * 
 * 5. Test payment flow:
 *    - Login as any user
 *    - Click pricing button
 *    - Complete payment
 *    - Check localStorage for updated subscription data
 *    - Verify dashboard shows correct plan
 * 
 * PAYMENT API INTEGRATION:
 * Replace simulatePaymentProcessing() with your actual payment API:
 * 
 * EmiralPayment.simulatePaymentProcessing = async function(paymentData) {
 *     const response = await fetch('/api/process-payment', {
 *         method: 'POST',
 *         headers: { 
 *             'Content-Type': 'application/json',
 *             'Authorization': 'Bearer ' + YOUR_API_KEY
 *         },
 *         body: JSON.stringify({
 *             plan: this.state.selectedPlan,
 *             payment: paymentData,
 *             user: this.state.currentUser
 *         })
 *     });
 *     
 *     const result = await response.json();
 *     return result.success;
 * };
 * 
 * =============================================================================
 */