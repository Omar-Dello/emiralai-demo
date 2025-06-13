/**auth-popups.js file
 * ⚠️ IMPORTANT: Authentication for demo only
 * In production, integrate with real Authentication
 * =============================================================================
 * AUTH POPUPS SCRIPT WITH HEADER USER DISPLAY - THEMEFOREST EDITION
 * =============================================================================
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * ============================================================================= 
 * Description: Complete authentication system with popup modals and header user
 * display functionality. Includes mobile-friendly user profile in hamburger menu.
 * 
 * Features:
 * - Authentication popup system
 * - Header user profile display
 * - Mobile hamburger menu user section
 * - Hero button dynamic update
 * - LocalStorage user persistence
 * - Smooth animations and transitions
 * - Full accessibility support
 * 
 * TABLE OF CONTENTS:
 * =============================================================================
 * 1. CONFIGURATION & SETTINGS
 * 2. USER DATA MANAGEMENT
 * 3. UTILITY FUNCTIONS
 * 4. VISUAL EFFECTS ENGINE
 * 5. POPUP MANAGEMENT SYSTEM
 * 6. FORM HANDLING ENGINE
 * 7. API INTEGRATION
 * 8. HEADER USER DISPLAY
 * 9. MOBILE MENU USER SECTION
 * 10. HERO BUTTON UPDATE
 * 11. EVENT MANAGEMENT
 * 12. PUBLIC API
 * 13. INITIALIZATION
 * =============================================================================
 */

(function () {
    'use strict';

    /**
     * =============================================================================
     * 1. CONFIGURATION & SETTINGS
     * =============================================================================
     */

    const config = {
        // Animation durations (in milliseconds)
        animations: {
            overlayFade: 400,
            popupEntry: 500,
            popupExit: 500,
            formSubmit: 2000,
            successDelay: 300,
            headerTransition: 300
        },

        // Visual effects configuration
        effects: {
            circuitPaths: 8,
            pulseEffects: 3,
            circuitDots: true,
            animateOnLoad: true
        },

        // Validation rules
        validation: {
            emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            passwordMinLength: 8,
            passwordRequireUppercase: false,
            passwordRequireNumber: false,
            passwordRequireSpecial: false
        },

        // Success messages
        messages: {
            'signup-form': 'Your account has been created successfully!',
            'login-form': 'Welcome back! You have been logged in successfully.',
            'forgot-form': 'Password reset instructions have been sent to your email.',
            'default': 'Operation completed successfully.'
        },

        // Error messages
        errorMessages: {
            network: 'Network error. Please check your connection and try again.',
            server: 'Server error. Please try again later.',
            validation: 'Please check your input and try again.',
            default: 'An error occurred. Please try again.'
        },

        // Header display settings
        headerDisplay: {
            showProfileImage: true,
            showUserName: true,
            defaultProfileImage: true,
            mobileMenuPosition: 'top' // 'top' or 'bottom'
        },

        // Hero section settings
        heroSection: {
            updateButton: true,
            loggedInButtonText: 'See your Dashboard',
            loggedOutButtonText: 'Get Started'
        },

        // Accessibility
        accessibility: {
            trapFocus: true,
            escapeClose: true,
            clickOutsideClose: true,
            announceToScreenReaders: true
        }
    };

    const apiConfig = {
        useRealAPI: false, //set to true for Production
        baseURL: 'https://your-api-domain.com/api',
        endpoints: {
            login: '/auth/login',
            signup: '/auth/signup',
            forgotPassword: '/auth/forgot-password'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };

    const userDataConfig = {
        storageKey: 'emiralai_user_data',
        defaultProfileImage: null, // Will be generated dynamically
        sessionDuration: 24,
        fieldsToStore: ['name', 'email', 'profileImage', 'loginTime']
    };

    const state = {
        currentPopup: null,
        popupOverlay: null,
        isAnimating: false,
        focusableElements: [],
        lastFocusedElement: null,
        isLoggedIn: false,
        currentUser: null,
        headerUserElement: null,
        mobileUserSection: null
    };

    /**
     * =============================================================================
     * 2. USER DATA MANAGEMENT
     * =============================================================================
     */

    const userDataManager = {
        saveUserData: (userData) => {
            try {
                // Use centralized data manager if available
                if (window.EmiralUserData && typeof window.EmiralUserData.saveUserData === 'function') {
                    // Generate avatar if needed before saving
                    if (!userData.profileImage || userData.profileImage === userDataConfig.defaultProfileImage) {
                        userData.profileImage = generateUserAvatar(userData);
                    }

                    // Save using centralized manager
                    const saved = window.EmiralUserData.saveUserData(userData);
                    if (saved) {
                        // Update local state from centralized data
                        const centralData = window.EmiralUserData.getUserData();
                        state.isLoggedIn = true;
                        state.currentUser = centralData;

                        // Update UI
                        headerUserDisplay.update();
                        mobileMenuUser.update();
                        heroButtonUpdate.update();

                        return true;
                    }
                }

                // Fallback to local storage if centralized manager not available
                const existingSubscription = localStorage.getItem('emiralai_subscription');
                let currentPlan = 'Free Plan';
                let currentPlanId = 'free';

                if (existingSubscription) {
                    try {
                        const subscription = JSON.parse(existingSubscription);
                        if (subscription.status === 'active') {
                            currentPlan = subscription.planName || 'Free Plan';
                            currentPlanId = subscription.planId || 'free';
                        }
                    } catch (e) {
                        console.warn('Error parsing subscription data:', e);
                    }
                }

                // Generate avatar instead of using default image
                let profileImage = userData.profileImage;
                if (!profileImage || profileImage === userDataConfig.defaultProfileImage) {
                    profileImage = generateUserAvatar(userData);
                }

                const dataToStore = {
                    name: userData.name || '',
                    email: userData.email || '',
                    profileImage: profileImage, // Use generated avatar
                    loginTime: new Date().toISOString(),
                    sessionExpiry: userDataConfig.sessionDuration > 0
                        ? new Date(Date.now() + userDataConfig.sessionDuration * 60 * 60 * 1000).toISOString()
                        : null,
                    plan: userData.plan || currentPlan,
                    planId: userData.planId || currentPlanId
                };

                localStorage.setItem(userDataConfig.storageKey, JSON.stringify(dataToStore));
                state.isLoggedIn = true;
                state.currentUser = dataToStore;

                // Update UI components
                headerUserDisplay.update();
                mobileMenuUser.update();
                heroButtonUpdate.update();

                window.dispatchEvent(new CustomEvent('userLoggedIn', { detail: dataToStore }));
                console.log('User data saved successfully:', dataToStore);
                return true;

            } catch (error) {
                console.error('Error saving user data:', error);
                return false;
            }
        },

        getUserData: () => {
            try {
                // Try centralized data manager first
                if (window.EmiralUserData && typeof window.EmiralUserData.getUserData === 'function') {
                    const centralData = window.EmiralUserData.getUserData();
                    if (centralData) {
                        return centralData;
                    }
                }

                // Fallback to local storage
                const storedData = localStorage.getItem(userDataConfig.storageKey);
                if (!storedData) return null;

                const userData = JSON.parse(storedData);

                // Check session validity
                if (userData.sessionExpiry) {
                    const expiryDate = new Date(userData.sessionExpiry);
                    if (expiryDate < new Date()) {
                        userDataManager.clearUserData();
                        return null;
                    }
                }

                // Generate avatar if using default image
                if (!userData.profileImage ||
                    userData.profileImage === userDataConfig.defaultProfileImage ||
                    userData.profileImage.includes('emiral') ||
                    userData.profileImage.includes('pexels')) {
                    userData.profileImage = generateUserAvatar(userData);
                }

                return userData;

            } catch (error) {
                console.error('Error retrieving user data:', error);
                return null;
            }
        },

        updateUserData: (updates) => {
            try {
                const currentData = userDataManager.getUserData();
                if (!currentData) return false;

                const updatedData = { ...currentData, ...updates };
                return userDataManager.saveUserData(updatedData);

            } catch (error) {
                console.error('Error updating user data:', error);
                return false;
            }
        },

        clearUserData: () => {
            try {
                localStorage.removeItem(userDataConfig.storageKey);
                state.isLoggedIn = false;
                state.currentUser = null;

                // Update header display
                headerUserDisplay.update();

                // Update mobile menu
                mobileMenuUser.update();

                window.dispatchEvent(new Event('userLoggedOut'));
                console.log('User data cleared successfully');

            } catch (error) {
                console.error('Error clearing user data:', error);
            }
        },

        checkUserSession: () => {
            const userData = userDataManager.getUserData();
            if (userData) {
                state.isLoggedIn = true;
                state.currentUser = userData;
                return true;
            }
            return false;
        }
    };

    /**
 * Generate user avatar with initials
 * Creates an SVG avatar with user's initials - consistent across all modules
 * @param {Object} userData - User data object
 * @returns {string} Base64 encoded SVG data URL
 */
    const generateUserAvatar = (userData) => {
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
    };

    /**
     * =============================================================================
     * 3. UTILITY FUNCTIONS
     * =============================================================================
     */

    const dom = {
        find: (selector, context = document) => {
            try {
                return context.querySelector(selector);
            } catch (e) {
                console.error('Invalid selector:', selector);
                return null;
            }
        },

        findAll: (selector, context = document) => {
            try {
                return context.querySelectorAll(selector);
            } catch (e) {
                console.error('Invalid selector:', selector);
                return [];
            }
        },

        create: (tag, options = {}) => {
            const element = document.createElement(tag);

            if (options.class) {
                element.className = options.class;
            }

            if (options.text) {
                element.textContent = options.text;
            }

            if (options.html) {
                element.innerHTML = options.html;
            }

            if (options.attributes) {
                Object.entries(options.attributes).forEach(([key, value]) => {
                    element.setAttribute(key, value);
                });
            }

            return element;
        }
    };

    const animation = {
        waitForAnimation: (element, animationName) => {
            return new Promise((resolve) => {
                const handler = (e) => {
                    if (e.animationName === animationName) {
                        element.removeEventListener('animationend', handler);
                        resolve();
                    }
                };
                element.addEventListener('animationend', handler);
            });
        },

        animate: (element, className) => {
            return new Promise((resolve) => {
                element.classList.add(className);
                element.addEventListener('animationend', () => {
                    element.classList.remove(className);
                    resolve();
                }, { once: true });
            });
        }
    };

    const validators = {
        isValidEmail: (email) => {
            return config.validation.emailRegex.test(email);
        },

        isValidPassword: (password) => {
            const result = { valid: true, message: '' };

            if (password.length < config.validation.passwordMinLength) {
                result.valid = false;
                result.message = `Password must be at least ${config.validation.passwordMinLength} characters long`;
                return result;
            }

            if (config.validation.passwordRequireUppercase && !/[A-Z]/.test(password)) {
                result.valid = false;
                result.message = 'Password must contain at least one uppercase letter';
                return result;
            }

            if (config.validation.passwordRequireNumber && !/\d/.test(password)) {
                result.valid = false;
                result.message = 'Password must contain at least one number';
                return result;
            }

            if (config.validation.passwordRequireSpecial && !/[!@#$%^&*]/.test(password)) {
                result.valid = false;
                result.message = 'Password must contain at least one special character';
                return result;
            }

            return result;
        }
    };

    const errorHandler = {
        handle: (error, context = '') => {
            console.error(`Error in ${context}:`, error);

            let message = config.errorMessages.default;

            if (typeof error === 'string') {
                message = error;
            } else if (error.message) {
                message = error.message;
            } else if (error.response && error.response.data && error.response.data.message) {
                message = error.response.data.message;
            }

            return message;
        }
    };

    /**
     * =============================================================================
     * 4. VISUAL EFFECTS ENGINE
     * =============================================================================
     */

    const circuitBoardGenerator = {
        createCircuitPaths: (container) => {
            for (let i = 0; i < config.effects.circuitPaths; i++) {
                const isHorizontal = i % 2 === 0;
                const path = dom.create('div', {
                    class: `circuit-path ${isHorizontal ? 'circuit-line-h' : 'circuit-line-v'}`
                });

                const posX = Math.random() * 100;
                const posY = Math.random() * 100;
                const length = 20 + Math.random() * 60;

                path.style.left = `${posX}%`;
                path.style.top = `${posY}%`;

                if (isHorizontal) {
                    path.style.width = `${length}px`;
                } else {
                    path.style.height = `${length}px`;
                }

                container.appendChild(path);

                if (config.effects.circuitDots) {
                    const dot = dom.create('div', { class: 'circuit-dot' });

                    if (isHorizontal) {
                        dot.style.left = `${posX + (length / window.innerWidth * 100)}%`;
                        dot.style.top = `${posY}%`;
                    } else {
                        dot.style.left = `${posX}%`;
                        dot.style.top = `${posY + (length / window.innerHeight * 100)}%`;
                    }

                    container.appendChild(dot);
                }
            }
        }
    };

    const pulseEffectsCreator = {
        createPulseEffects: (container) => {
            for (let i = 0; i < config.effects.pulseEffects; i++) {
                const pulse = dom.create('div', { class: 'pulse-effect' });

                const posX = 10 + Math.random() * 80;
                const posY = 10 + Math.random() * 80;
                const size = 50 + Math.random() * 100;
                const delay = Math.random() * 4;

                Object.assign(pulse.style, {
                    left: `${posX}%`,
                    top: `${posY}%`,
                    width: `${size}px`,
                    height: `${size}px`,
                    animationDelay: `${delay}s`
                });

                container.appendChild(pulse);
            }
        }
    };

    const animationController = {
        initializeEffects: (container) => {
            if (!config.effects.animateOnLoad) return;

            const aiGraphic = dom.find('.ai-graphic', container);
            if (!aiGraphic) return;

            aiGraphic.innerHTML = '';
            circuitBoardGenerator.createCircuitPaths(aiGraphic);
            pulseEffectsCreator.createPulseEffects(aiGraphic);
        }
    };

    /**
     * =============================================================================
     * 5. POPUP MANAGEMENT SYSTEM
     * =============================================================================
     */

    const popupCreator = {

        createOverlay: () => {
            if (state.popupOverlay) return state.popupOverlay;

            const overlay = dom.create('div', { class: 'auth-popup-overlay' });
            document.body.appendChild(overlay);

            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) {
                }
            });

            state.popupOverlay = overlay;
            return overlay;
        },

        cloneFromTemplate: (popupId) => {
            const template = dom.find(`#${popupId}`);
            if (!template) {
                console.error(`Template not found: ${popupId}`);
                return null;
            }

            const popup = template.content.cloneNode(true).querySelector('.auth-popup');
            if (!popup) {
                console.error(`Invalid template structure: ${popupId}`);
                return null;
            }

            return popup;
        }
    };

    const popupDisplay = {
        show: (popupId) => {
            if (state.isAnimating) return;
            state.isAnimating = true;

            state.lastFocusedElement = document.activeElement;

            const overlay = popupCreator.createOverlay();
            const popup = popupCreator.cloneFromTemplate(popupId);
            if (!popup) {
                state.isAnimating = false;
                return;
            }

            state.currentPopup = popup;
            popupSetup.initialize(popup);

            overlay.innerHTML = '';
            overlay.appendChild(popup);

            requestAnimationFrame(() => {
                overlay.classList.add('active');
                popup.classList.add('popup-enter');
                document.body.style.overflow = 'hidden';

                if (config.accessibility.trapFocus) {
                    focusManager.trap(popup);
                }

                setTimeout(() => {
                    state.isAnimating = false;
                }, config.animations.popupEntry);
            });
        }
    };

    const popupDestruction = {
        close: () => {
            if (!state.popupOverlay || !state.currentPopup || state.isAnimating) return;
            state.isAnimating = true;

            state.currentPopup.classList.add('popup-exit');
            state.currentPopup.classList.remove('popup-enter');
            state.popupOverlay.classList.remove('active');

            setTimeout(() => {
                state.popupOverlay.innerHTML = '';
                state.currentPopup = null;
                document.body.style.overflow = '';

                if (state.lastFocusedElement && state.lastFocusedElement.focus) {
                    state.lastFocusedElement.focus();
                }

                state.isAnimating = false;
            }, config.animations.popupExit);
        }
    };

    const popupNavigation = {
        switchTo: (targetPopupId) => {
            if (!state.currentPopup || state.isAnimating) return;

            state.currentPopup.classList.add('popup-exit');

            setTimeout(() => {
                popupDisplay.show(targetPopupId);
            }, 300);
        }
    };

    const popupManager = {
        show: popupDisplay.show,
        close: popupDestruction.close,
        switchTo: popupNavigation.switchTo
    };

    /**
     * =============================================================================
     * 6. FORM HANDLING ENGINE
     * =============================================================================
     */

    const formInitializer = {
        setup: (form) => {
            if (!form) return;

            form.addEventListener('submit', formHandlers.handleSubmit);

            const inputs = dom.findAll('input', form);
            inputs.forEach(input => {
                input.addEventListener('input', function () {
                    if (this.classList.contains('is-invalid')) {
                        formValidation.validateInput(this);
                    }
                });

                input.addEventListener('blur', function () {
                    formValidation.validateInput(this);
                });
            });
        }
    };

    const formValidation = {
        validateInput: (input) => {
            const type = input.getAttribute('type');
            const value = input.value.trim();
            const inputId = input.id;
            let isValid = true;

            errorDisplay.clearError(input);

            if (!input.required && !value) return true;

            switch (type) {
                case 'email':
                    if (!value) {
                        errorDisplay.showError(input, 'Email is required');
                        isValid = false;
                    } else if (!validators.isValidEmail(value)) {
                        errorDisplay.showError(input, 'Please enter a valid email address');
                        isValid = false;
                    }
                    break;

                case 'password':
                    if (!value) {
                        errorDisplay.showError(input, 'Password is required');
                        isValid = false;
                    } else if (value.length < config.validation.passwordMinLength && input === document.activeElement) {
                        isValid = false;
                    } else {
                        const passwordResult = validators.isValidPassword(value);
                        if (!passwordResult.valid) {
                            errorDisplay.showError(input, passwordResult.message);
                            isValid = false;
                        }
                    }
                    break;

                case 'text':
                    if (input.required && !value) {
                        errorDisplay.showError(input, 'This field is required');
                        isValid = false;
                    }
                    break;

                default:
                    if (input.required && !value) {
                        errorDisplay.showError(input, 'This field is required');
                        isValid = false;
                    }
            }

            if (inputId === 'signup-confirm-password') {
                const passwordInput = dom.find('#signup-password');

                if (passwordInput && input === document.activeElement) {
                    return true;
                }

                if (passwordInput && value !== passwordInput.value) {
                    errorDisplay.showError(input, 'Passwords do not match');
                    isValid = false;
                }
            }

            return isValid;
        },

        validateForm: (form) => {
            const inputs = dom.findAll('input', form);
            let isValid = true;

            inputs.forEach(input => {
                if (!formValidation.validateInput(input)) {
                    isValid = false;
                }
            });

            return isValid;
        }
    };

    const errorDisplay = {
        showError: (input, message) => {
            input.classList.add('is-invalid');

            const errorDiv = dom.create('div', {
                class: 'error-message',
                text: message
            });

            input.parentElement.appendChild(errorDiv);

            if (config.accessibility.announceToScreenReaders) {
                errorDiv.setAttribute('role', 'alert');
                errorDiv.setAttribute('aria-live', 'polite');
            }
        },

        clearError: (input) => {
            input.classList.remove('is-invalid');

            const existingError = dom.find('.error-message', input.parentElement);
            if (existingError) {
                existingError.remove();
            }
        },

        showFormError: (form, message) => {
            const formContent = form.closest('.auth-form-content');
            if (!formContent) return;

            const existingError = dom.find('.form-error-message', formContent);
            if (existingError) {
                existingError.remove();
            }

            const errorDiv = dom.create('div', {
                class: 'form-error-message',
                html: `<i class="fas fa-exclamation-circle"></i> ${message}`
            });

            formContent.insertBefore(errorDiv, form);

            setTimeout(() => {
                if (errorDiv.parentElement) {
                    errorDiv.remove();
                }
            }, 5000);
        }
    };

    const successHandler = {
        showSuccess: (form, userData = null) => {
            form.style.opacity = '0';

            setTimeout(() => {
                const formContent = form.closest('.auth-form-content');
                if (!formContent) return;

                formContent.innerHTML = '';

                const elements = successHandler.createSuccessElements(form.id, userData);
                formContent.appendChild(elements.checkmark);
                formContent.appendChild(elements.messageContainer);

                successHandler.animateSuccess();
            }, config.animations.successDelay);
        },

        createSuccessElements: (formId, userData = null) => {
            const checkmark = dom.create('div', {
                class: 'success-checkmark',
                attributes: { style: 'display: block;' }
            });

            const checkIcon = dom.create('div', { class: 'check-icon' });
            checkmark.appendChild(checkIcon);

            const elements = [
                { class: 'icon-line line-tip' },
                { class: 'icon-line line-long' },
                { class: 'icon-circle' },
                { class: 'icon-fix' }
            ];

            elements.forEach(el => {
                checkIcon.appendChild(dom.create('span', el));
            });

            const messageContainer = dom.create('div', {
                class: 'success-message-container'
            });

            messageContainer.appendChild(dom.create('h3', {
                text: 'Success!'
            }));

            let message = config.messages[formId] || config.messages.default;
            if (userData && userData.name && formId === 'signup-form') {
                message = `Welcome ${userData.name}! ${message}`;
            } else if (userData && userData.name && formId === 'login-form') {
                message = `Welcome back, ${userData.name}! ${message}`;
            }

            messageContainer.appendChild(dom.create('p', {
                text: message
            }));

            const continueBtn = dom.create('button', {
                class: 'auth-btn',
                html: '<span>Continue</span>'
            });

            continueBtn.addEventListener('click', () => {
                popupManager.close();
                if (window.location.pathname.includes('main.html') || window.location.pathname === '/') {
                    window.location.reload();
                }
            });

            messageContainer.appendChild(continueBtn);

            return { checkmark, messageContainer };
        },

        animateSuccess: () => {
            // Animation is handled by CSS
        }
    };

    /**
     * =============================================================================
     * 7. API INTEGRATION
     * =============================================================================
     */

    const apiHandler = {
        request: async (endpoint, data) => {
            try {
                if (!apiConfig.useRealAPI) {
                    return apiHandler.simulateAPIResponse(endpoint, data);
                }

                const response = await fetch(apiConfig.baseURL + endpoint, {
                    method: 'POST',
                    headers: apiConfig.headers,
                    body: JSON.stringify(data)
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || 'API request failed');
                }

                return result;

            } catch (error) {
                console.error('API request error:', error);
                throw error;
            }
        },

        simulateAPIResponse: (endpoint, data) => {
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    if (endpoint.includes('login')) {
                        if (data.email && data.password) {
                            resolve({
                                success: true,
                                user: {
                                    name: 'Demo User',
                                    email: data.email,
                                    profileImage: null
                                }
                            });
                        } else {
                            reject(new Error('Invalid credentials'));
                        }
                    } else if (endpoint.includes('signup')) {
                        if (data.name && data.email && data.password) {
                            resolve({
                                success: true,
                                user: {
                                    name: data.name,
                                    email: data.email,
                                    profileImage: null
                                }
                            });
                        } else {
                            reject(new Error('Please fill all required fields'));
                        }
                    } else if (endpoint.includes('forgot-password')) {
                        if (data.email) {
                            resolve({
                                success: true,
                                message: 'Password reset email sent'
                            });
                        } else {
                            reject(new Error('Email is required'));
                        }
                    }
                }, 1000);
            });
        },

        login: async (credentials) => {
            try {
                const response = await apiHandler.request(apiConfig.endpoints.login, credentials);

                if (response.success && response.user) {
                    userDataManager.saveUserData(response.user);
                }

                return response;
            } catch (error) {
                throw error;
            }
        },

        signup: async (userData) => {
            try {
                const response = await apiHandler.request(apiConfig.endpoints.signup, userData);

                if (response.success && response.user) {
                    userDataManager.saveUserData(response.user);
                }

                return response;
            } catch (error) {
                throw error;
            }
        },

        forgotPassword: async (email) => {
            try {
                const response = await apiHandler.request(apiConfig.endpoints.forgotPassword, { email });
                return response;
            } catch (error) {
                throw error;
            }
        }
    };

    const formHandlers = {
        handleSubmit: async function (e) {
            e.preventDefault();

            const form = e.target;

            if (!formValidation.validateForm(form)) {
                return;
            }

            loadingState.show(form);

            try {
                let response;
                let userData;

                switch (form.id) {
                    case 'signup-form':
                        const signupData = {
                            name: dom.find('#signup-name', form).value.trim(),
                            email: dom.find('#signup-email', form).value.trim(),
                            password: dom.find('#signup-password', form).value
                        };

                        response = await apiHandler.signup(signupData);
                        userData = response.user || signupData;
                        break;

                    case 'login-form':
                        const loginData = {
                            email: dom.find('#login-email', form).value.trim(),
                            password: dom.find('#login-password', form).value
                        };

                        response = await apiHandler.login(loginData);
                        userData = response.user;
                        break;

                    case 'forgot-form':
                        const email = dom.find('#forgot-email', form).value.trim();
                        response = await apiHandler.forgotPassword(email);
                        break;

                    default:
                        throw new Error('Unknown form type');
                }

                loadingState.hide(form);
                successHandler.showSuccess(form, userData);

            } catch (error) {
                loadingState.hide(form);
                const errorMessage = errorHandler.handle(error, 'Form submission');
                errorDisplay.showFormError(form, errorMessage);
            }
        }
    };

    const loadingState = {
        show: (form) => {
            const submitBtn = dom.find('button[type="submit"]', form);
            if (!submitBtn) return;

            submitBtn.dataset.originalText = submitBtn.textContent;

            const loadingDots = dom.create('div', {
                class: 'loading-dots',
                html: '<span></span><span></span><span></span>'
            });

            submitBtn.innerHTML = '';
            submitBtn.appendChild(loadingDots);
            submitBtn.disabled = true;
        },

        hide: (form) => {
            const submitBtn = dom.find('button[type="submit"]', form);
            if (!submitBtn || !submitBtn.dataset.originalText) return;

            submitBtn.textContent = submitBtn.dataset.originalText;
            submitBtn.disabled = false;
            delete submitBtn.dataset.originalText;
        }
    };

    /**
     * =============================================================================
     * 8. HEADER USER DISPLAY
     * =============================================================================
     */

    const headerUserDisplay = {
        /**
         * Initialize header user display functionality
         */
        init: () => {
            // Add necessary CSS styles
            headerUserDisplay.addStyles();

            // Initial update
            headerUserDisplay.update();
        },

        /**
 * Add required CSS styles for header user display
 * Updated to use external auth-popups.css file
 */
        addStyles: () => {
            if (dom.find('#header-user-styles')) return;

            // Link to external auth-popups.css file
            const linkElement = dom.create('link', {
                attributes: {
                    id: 'header-user-styles',
                    rel: 'stylesheet',
                    href: 'css/auth-popups.css', // Using auth-popups.css
                    type: 'text/css'
                }
            });

            document.head.appendChild(linkElement);
        },

        /**
         * Update header display based on login status
         */
        update: () => {
            const navLinks = dom.find('.nav-links');
            if (!navLinks) return;

            if (state.isLoggedIn && state.currentUser) {
                // Remove login button if exists
                const loginBtn = dom.find('[data-auth-popup="login-popup"]', navLinks);
                if (loginBtn && loginBtn.parentElement) {
                    loginBtn.parentElement.remove();
                }

                // Add user profile if not exists
                if (!dom.find('.header-user-profile', navLinks)) {
                    const userProfile = headerUserDisplay.createUserProfile();
                    navLinks.appendChild(userProfile);
                }
            } else {
                // Remove user profile if exists
                const userProfile = dom.find('.header-user-profile', navLinks);
                if (userProfile) {
                    userProfile.remove();
                }

                // Add login button if not exists
                if (!dom.find('[data-auth-popup="login-popup"]', navLinks)) {
                    const loginLi = dom.create('li', {
                        html: '<a href="#" data-auth-popup="login-popup" class="nav-btn">Login</a>'
                    });
                    navLinks.appendChild(loginLi);

                    // Re-attach event listener
                    const loginBtn = dom.find('[data-auth-popup="login-popup"]', loginLi);
                    if (loginBtn) {
                        loginBtn.addEventListener('click', eventHandlers.handleTriggerClick);
                    }
                }
            }
        },

        /**
         * Create user profile element for header
         */
        createUserProfile: () => {
            const profileDiv = dom.create('div', {
                class: 'header-user-profile',
                attributes: { 'aria-label': 'User menu' }
            });

            // Avatar
            const avatar = dom.create('div', { class: 'header-user-avatar' });
            const img = dom.create('img', {
                attributes: {
                    src: state.currentUser.profileImage || generateUserAvatar(state.currentUser),
                    alt: 'User avatar'
                }
            });
            avatar.appendChild(img);

            // Name
            const name = dom.create('span', {
                class: 'header-user-name',
                text: state.currentUser.name || 'User'
            });

            // Dropdown menu
            const dropdown = dom.create('div', { class: 'header-user-dropdown' });

            // Dashboard link
            const dashboardItem = dom.create('a', {
                class: 'header-user-dropdown-item',
                html: '<i class="fas fa-tachometer-alt"></i><span>Dashboard</span>',
                attributes: { href: 'dashboard.html' }
            });

            // Profile link
            const profileItem = dom.create('a', {
                class: 'header-user-dropdown-item',
                html: '<i class="fas fa-user"></i><span>Profile</span>',
                attributes: { href: 'user-profile.html' }
            });

            // Logout button
            const logoutItem = dom.create('div', {
                class: 'header-user-dropdown-item',
                html: '<i class="fas fa-sign-out-alt"></i><span>Logout</span>'
            });

            logoutItem.addEventListener('click', () => {
                AuthPopups.logout();
            });

            dropdown.appendChild(dashboardItem);
            dropdown.appendChild(profileItem);
            dropdown.appendChild(logoutItem);

            profileDiv.appendChild(avatar);
            if (config.headerDisplay.showUserName) {
                profileDiv.appendChild(name);
            }
            profileDiv.appendChild(dropdown);

            // Toggle dropdown on click
            profileDiv.addEventListener('click', (e) => {
                e.stopPropagation();
                profileDiv.classList.toggle('active');
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                profileDiv.classList.remove('active');
            });

            state.headerUserElement = profileDiv;
            return profileDiv;
        }
    };

    /**
     * =============================================================================
     * 9. MOBILE MENU USER SECTION
     * =============================================================================
     */

    const mobileMenuUser = {
        /**
         * Initialize mobile menu user section
         */
        init: () => {
            // Add necessary CSS styles
            mobileMenuUser.addStyles();

            // Initial update
            mobileMenuUser.update();
        },

        /**
         * Add required CSS styles for mobile menu user section
         */
        addStyles: () => {
            if (dom.find('#mobile-user-styles')) return;

            const styles = dom.create('style', {
                html: `
            /* Mobile Menu User Section Styles - Professional Responsive Design */
            .mobile-user-section {
                padding: 15px;
                margin: 15px;
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border-radius: 15px;
                border: 1px solid rgba(255, 255, 255, 0.1);
                opacity: 0;
                transform: translateY(20px);
                animation: mobileUserFadeIn 0.5s ease forwards;
                animation-delay: 0.3s;
            }

            @keyframes mobileUserFadeIn {
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            /* Responsive Avatar Container */
            .mobile-user-avatar {
                width: 60px;
                height: 60px;
                margin: 0 auto 12px;
                border-radius: 50%;
                overflow: hidden;
                border: 2px solid var(--primary-blue);
                box-shadow: 0 0 15px rgba(0, 162, 255, 0.4);
                position: relative;
                flex-shrink: 0;
            }

            .mobile-user-avatar img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }

            /* User Info - Always White Text */
            .mobile-user-name {
                font-size: 1.1rem;
                font-weight: 600;
                color: #ffffff !important;
                margin-bottom: 4px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                max-width: 100%;
            }

            .mobile-user-email {
                font-size: 0.85rem;
                color: rgba(255, 255, 255, 0.8) !important;
                margin-bottom: 15px;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                max-width: 100%;
            }

            /* Action Buttons Container */
            .mobile-user-actions {
                display: flex;
                flex-direction: column;
                gap: 8px;
            }

            .mobile-user-action {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 8px;
                padding: 10px 16px;
                background: rgba(255, 255, 255, 0.08);
                border: 1px solid rgba(255, 255, 255, 0.15);
                border-radius: 12px;
                color: #ffffff !important;
                text-decoration: none;
                transition: all 0.3s ease;
                cursor: pointer;
                font-size: 0.95rem;
                font-weight: 500;
            }

            .mobile-user-action:hover {
                background: rgba(0, 162, 255, 0.2);
                border-color: var(--primary-blue);
                transform: translateX(5px);
                box-shadow: 0 4px 12px rgba(0, 162, 255, 0.3);
            }

            .mobile-user-action i {
                font-size: 1rem;
                color: var(--primary-blue);
            }

            .mobile-user-logout {
                background: rgba(255, 0, 88, 0.1);
                border-color: rgba(255, 0, 88, 0.3);
            }

            .mobile-user-logout:hover {
                background: rgba(255, 0, 88, 0.2);
                border-color: var(--primary-red);
                box-shadow: 0 4px 12px rgba(255, 0, 88, 0.3);
            }

            .mobile-user-logout i {
                color: #ff0058;
            }

            /* Compact Layout for Smaller Screens */
            @media screen and (max-width: 375px) {
                .mobile-user-section {
                    padding: 12px;
                    margin: 10px;
                }

                .mobile-user-avatar {
                    width: 50px;
                    height: 50px;
                    margin-bottom: 10px;
                }

                .mobile-user-name {
                    font-size: 1rem;
                }

                .mobile-user-email {
                    font-size: 0.8rem;
                }

                .mobile-user-action {
                    padding: 8px 14px;
                    font-size: 0.9rem;
                }
            }

            /* Position Options */
            .mobile-user-section.position-top {
                order: -1;
            }

            .mobile-user-section.position-bottom {
                order: 999;
            }

            /* Hide on Desktop */
            @media screen and (min-width: 769px) {
                .mobile-user-section {
                    display: none;
                }
            }

            /* Force White Text in Mobile Menu - All Themes */
            .nav-links .mobile-user-section * {
                color: #ffffff !important;
            }
            
            [data-theme="light"] .nav-links .mobile-user-section * {
                color: #ffffff !important;
            }
            
            /* Ensure text remains visible */
            .nav-links .mobile-user-section .mobile-user-name,
            .nav-links .mobile-user-section .mobile-user-email,
            .nav-links .mobile-user-section .mobile-user-action span {
                color: #ffffff !important;
                opacity: 1 !important;
            }
        `,
                attributes: { id: 'mobile-user-styles' }
            });

            document.head.appendChild(styles);
        },

        /**
         * Update mobile menu based on login status
         */
        update: () => {
            const navLinks = dom.find('.nav-links');
            if (!navLinks) return;

            if (state.isLoggedIn && state.currentUser) {
                // Add user section if not exists
                if (!dom.find('.mobile-user-section', navLinks)) {
                    const userSection = mobileMenuUser.createUserSection();

                    if (config.headerDisplay.mobileMenuPosition === 'top') {
                        navLinks.insertBefore(userSection, navLinks.firstChild);
                    } else {
                        navLinks.appendChild(userSection);
                    }
                }
            } else {
                // Remove user section if exists
                const userSection = dom.find('.mobile-user-section', navLinks);
                if (userSection) {
                    userSection.remove();
                }
            }
        },

        /**
        * Create user section for mobile menu
        */
        createUserSection: () => {
            const section = dom.create('div', {
                class: `mobile-user-section position-${config.headerDisplay.mobileMenuPosition}`
            });

            // Create a flex container for better layout
            const userInfoContainer = dom.create('div', {
                attributes: {
                    style: 'display: flex; align-items: center; gap: 12px; margin-bottom: 15px;'
                }
            });

            // Avatar
            const avatar = dom.create('div', { class: 'mobile-user-avatar' });
            const img = dom.create('img', {
                attributes: {
                    src: state.currentUser.profileImage || generateUserAvatar(state.currentUser),
                    alt: 'User avatar',
                    loading: 'lazy'
                }
            });
            avatar.appendChild(img);

            // User text info container
            const textInfo = dom.create('div', {
                attributes: {
                    style: 'flex: 1; min-width: 0; text-align: left;'
                }
            });

            // Name
            const name = dom.create('div', {
                class: 'mobile-user-name',
                text: state.currentUser.name || 'User'
            });

            // Email
            const email = dom.create('div', {
                class: 'mobile-user-email',
                text: state.currentUser.email || ''
            });

            // Build user info section
            textInfo.appendChild(name);
            textInfo.appendChild(email);
            userInfoContainer.appendChild(avatar);
            userInfoContainer.appendChild(textInfo);

            // Actions container
            const actions = dom.create('div', { class: 'mobile-user-actions' });

            // Dashboard link
            const dashboardLink = dom.create('a', {
                class: 'mobile-user-action',
                html: '<i class="fas fa-tachometer-alt"></i><span>Dashboard</span>',
                attributes: { href: 'dashboard.html' }
            });

            // Profile link
            const profileLink = dom.create('a', {
                class: 'mobile-user-action',
                html: '<i class="fas fa-user"></i><span>Profile</span>',
                attributes: { href: 'user-profile.html' }
            });

            // Logout button
            const logoutBtn = dom.create('div', {
                class: 'mobile-user-action mobile-user-logout',
                html: '<i class="fas fa-sign-out-alt"></i><span>Logout</span>'
            });

            logoutBtn.addEventListener('click', () => {
                AuthPopups.logout();
            });

            // Assemble actions
            actions.appendChild(dashboardLink);
            actions.appendChild(profileLink);
            actions.appendChild(logoutBtn);

            // Assemble section
            section.appendChild(userInfoContainer);
            section.appendChild(actions);

            state.mobileUserSection = section;
            return section;
        }
    };

    /**
     * =============================================================================
     * 10. HERO BUTTON UPDATE
     * =============================================================================
     */

    const heroButtonUpdate = {
        /**
         * Initialize hero button update functionality
         */
        init: () => {
            heroButtonUpdate.update();
        },

        /**
         * Update hero button based on login status
         */
        update: () => {
            // Check if feature is enabled
            if (!config.heroSection.updateButton) return;

            // Find the Get Started button with signup popup trigger
            const heroButton = dom.find('.hero-btns [data-auth-popup="signup-popup"]');

            if (!heroButton) return;

            if (state.isLoggedIn) {
                // Change to Dashboard button
                heroButton.textContent = config.heroSection.loggedInButtonText;
                heroButton.removeAttribute('data-auth-popup');
                heroButton.setAttribute('href', 'dashboard.html');

                // Remove event listener and add click handler for navigation
                const newButton = heroButton.cloneNode(true);
                heroButton.parentNode.replaceChild(newButton, heroButton);

                newButton.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'dashboard.html';
                });
            } else {
                // Ensure it's the original Get Started button
                heroButton.textContent = config.heroSection.loggedOutButtonText;
                heroButton.setAttribute('data-auth-popup', 'signup-popup');
                heroButton.removeAttribute('href');

                // Re-attach popup trigger
                heroButton.addEventListener('click', eventHandlers.handleTriggerClick);
            }
        }
    };

    /**
     * =============================================================================
     * 11. EVENT MANAGEMENT
     * =============================================================================
     */

    const eventSetup = {
        initializeGlobalEvents: () => {
            if (config.accessibility.escapeClose) {
                document.addEventListener('keydown', eventHandlers.handleEscapeKey);
            }

            eventSetup.setupPopupTriggers();
        },

        setupPopupTriggers: () => {
            const triggers = dom.findAll('[data-auth-popup]');

            triggers.forEach(trigger => {
                trigger.addEventListener('click', eventHandlers.handleTriggerClick);
            });
        }
    };

    const keyboardNavigation = {
        handleTab: (e) => {
            if (!state.currentPopup || !config.accessibility.trapFocus) return;

            const isTabPressed = e.key === 'Tab';
            if (!isTabPressed) return;

            const focusableElements = focusManager.getFocusableElements(state.currentPopup);
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    };

    const eventHandlers = {
        handleEscapeKey: (e) => {
            if (e.key === 'Escape' && state.currentPopup) {
                popupManager.close();
            }
        },

        handleTriggerClick: function (e) {
            e.preventDefault();
            const popupId = this.getAttribute('data-auth-popup');
            if (popupId) {
                popupManager.show(popupId);
            }
        }
    };

    const focusManager = {
        getFocusableElements: (container) => {
            const focusableSelectors = [
                'a[href]',
                'button:not([disabled])',
                'input:not([disabled])',
                'select:not([disabled])',
                'textarea:not([disabled])',
                '[tabindex]:not([tabindex="-1"])'
            ];

            return Array.from(
                dom.findAll(focusableSelectors.join(','), container)
            ).filter(el => el.offsetParent !== null);
        },

        trap: (container) => {
            const focusableElements = focusManager.getFocusableElements(container);
            state.focusableElements = focusableElements;

            if (focusableElements.length > 0) {
                focusableElements[0].focus();
                document.addEventListener('keydown', keyboardNavigation.handleTab);
            }
        },

        release: () => {
            document.removeEventListener('keydown', keyboardNavigation.handleTab);
            state.focusableElements = [];
        }
    };

    const popupSetup = {
        initialize: (popup) => {
            const closeBtn = dom.find('.auth-close', popup);
            if (closeBtn) {
                closeBtn.addEventListener('click', popupManager.close);
            }

            popupSetup.setupNavigationLinks(popup);

            const form = dom.find('form', popup);
            if (form) {
                formInitializer.setup(form);
            }

            animationController.initializeEffects(popup);
        },

        setupNavigationLinks: (popup) => {
            const links = dom.findAll('[data-popup]', popup);

            links.forEach(link => {
                link.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetPopup = this.getAttribute('data-popup');
                    popupManager.switchTo(targetPopup);
                });
            });
        }
    };

    /**
     * =============================================================================
     * 12. PUBLIC API
     * =============================================================================
     */

    const AuthPopups = {
        // Version info
        version: '3.0.0',
        author: 'EmiralAI Theme',

        // Popup controls
        show: (popupId) => popupManager.show(popupId),
        close: () => popupManager.close(),

        // User data management
        getUserData: () => userDataManager.getUserData(),
        updateUserData: (updates) => userDataManager.updateUserData(updates),
        logout: () => {
            userDataManager.clearUserData();
            window.location.reload();
        },
        isLoggedIn: () => state.isLoggedIn,

        // Configuration
        configure: (newConfig) => {
            Object.assign(config, newConfig);
        },
        configureAPI: (newAPIConfig) => {
            Object.assign(apiConfig, newAPIConfig);
        },

        // Utilities
        isOpen: () => state.currentPopup !== null,
        getVersion: () => AuthPopups.version
    };

    /**
     * =============================================================================
     * 13. INITIALIZATION
     * =============================================================================
     */

    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initialize);
        } else {
            initialize();
        }
    }

    function initialize() {
        try {
            // Check user session
            userDataManager.checkUserSession();

            // Initialize header user display
            headerUserDisplay.init();

            // Initialize mobile menu user section
            mobileMenuUser.init();

            // Initialize hero button update
            heroButtonUpdate.init();

            // Setup global events
            eventSetup.initializeGlobalEvents();

            // Make API available globally
            window.AuthPopups = AuthPopups;

            // Legacy support
            window.showPopup = AuthPopups.show;
            window.closeCurrentPopup = AuthPopups.close;

            console.log(`AuthPopups v${AuthPopups.version} initialized successfully`);

            // Log current user status
            if (state.isLoggedIn) {
                console.log('User is logged in:', state.currentUser.email);
            }

        } catch (error) {
            console.error('AuthPopups initialization failed:', error);
        }
    }


    // Start initialization
    init();

})();

/**
 * =============================================================================
 * USAGE GUIDE FOR THEMEFOREST BUYERS
 * =============================================================================
 * 
 * This enhanced version includes automatic header user display and mobile menu
 * integration. No additional files needed!
 * 
 * 1. BASIC SETUP:
 *    Just include this script - it handles everything automatically
 * 
 * 2. CONFIGURE HEADER DISPLAY:
 *    AuthPopups.configure({
 *        headerDisplay: {
 *            showProfileImage: true,
 *            showUserName: true,
 *            mobileMenuPosition: 'top' // or 'bottom'
 *        },
 *        heroSection: {
 *            updateButton: true,
 *            loggedInButtonText: 'See your Dashboard',
 *            loggedOutButtonText: 'Get Started'
 *        }
 *    });
 * 
 * 3. CONFIGURE YOUR API:
 *    const apiConfig = {
        useRealAPI: false,  //Change false to true
        baseURL: 'https://your-api-domain.com/api',
        endpoints: {
            login: '/auth/login',
            signup: '/auth/signup',
            forgotPassword: '/auth/forgot-password'
        },
        headers: {
            'Content-Type': 'application/json'
        }
    };
 * 
 * 4. ACCESS USER DATA:
 *    const userData = AuthPopups.getUserData();
 *    console.log(userData.name, userData.email);
 * 
 * 5. CHECK LOGIN STATUS:
 *    if (AuthPopups.isLoggedIn()) {
 *        // User is logged in
 *    }
 * 
 * =============================================================================
 */