/**customize.js file
 * =============================================================================
 * EmiralAI THEME - MAIN JAVASCRIPT
 * =============================================================================
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * =============================================================================
 * Description: Professional theme framework with extensive customization options.
 * Built for easy modification and extension by theme buyers.
 * 
 * CUSTOMIZATION GUIDE:
 * - All settings are in the CONFIG object below
 * - Public API available via window.EmiralAI
 * - Event hooks for extending functionality
 * - Modular structure for easy feature toggle
 * 
 * TABLE OF CONTENTS:
 * =============================================================================
 * 1. CONFIGURATION & SETTINGS
 * 2. CORE FRAMEWORK
 * 3. NAVIGATION MODULE
 * 4. THEME TOGGLE MODULE
 * 5. VIDEO GRID MODULE
 * 6. PARTNERS MARQUEE MODULE
 * 7. CHARTS MODULE
 * 8. UI EFFECTS MODULE
 * 9. PUBLIC API
 * 10. INITIALIZATION
 * =============================================================================
 */

(function () {
    'use strict';

    /* =============================================================================
       1. CONFIGURATION & SETTINGS
       ============================================================================= */

    /**
     * Main configuration object - Customize all theme settings here
     */
    const CONFIG = {
        // Feature toggles - Enable/disable modules
        features: {
            navigation: true,
            themeToggle: true,
            videoGrid: true,
            partnersMarquee: true,
            charts: true,
            uiEffects: true,
            lazyLoading: true,
            scrollAnimations: true
        },

        // Navigation settings
        navigation: {
            mobileBreakpoint: 768,
            scrollThreshold: 50,
            animationDuration: 500,
            hamburgerAnimationDelay: 0.3
        },

        // Theme settings
        theme: {
            defaultTheme: 'dark', // 'dark' or 'light'
            savePreference: true,
            transitionDuration: 300
        },

        // Video grid settings
        videoGrid: {
            autoplay: false,
            defaultVideoType: 'local', // 'local', 'youtube', 'vimeo'
            showControls: true,
            animationDuration: 300,
            thumbnailFadeSpeed: 200
        },

        // Partners marquee settings
        marquee: {
            speed: 30, // pixels per second
            pauseOnHover: true,
            autoScroll: true,
            dragEnabled: true,
            resetDelay: 3000,
            cloneMultiplier: 2
        },

        // Chart settings
        charts: {
            animationDuration: 2000,
            animationDelay: 300,
            animationEasing: 'easeOutQuart',
            tooltipEnabled: true,
            hoverEffects: true
        },

        // UI effects settings
        effects: {
            rippleEnabled: true,
            rippleDuration: 600,
            parallaxSpeed: 0.5,
            scrollAnimationThreshold: 0.1,
            scrollAnimationDelay: 50
        },

        // Performance settings
        performance: {
            debounceDelay: 250,
            throttleDelay: 100,
            lazyLoadOffset: 50
        },

        // Debug mode
        debug: false
    };

    /* =============================================================================
       2. CORE FRAMEWORK
       ============================================================================= */

    /**
     * Core utilities and helper functions
     */
    const Utils = {
        /**
         * Safe query selector with error handling
         * @param {string} selector - CSS selector
         * @param {Element} parent - Parent element (optional)
         * @returns {Element|null} Found element or null
         */
        $(selector, parent = document) {
            try {
                return parent.querySelector(selector);
            } catch (e) {
                this.log('warn', `Invalid selector: ${selector}`);
                return null;
            }
        },

        /**
         * Safe query selector all
         * @param {string} selector - CSS selector
         * @param {Element} parent - Parent element (optional)
         * @returns {NodeList} Found elements
         */
        $$(selector, parent = document) {
            try {
                return parent.querySelectorAll(selector);
            } catch (e) {
                this.log('warn', `Invalid selector: ${selector}`);
                return [];
            }
        },

        /**
         * Debounce function
         * @param {Function} func - Function to debounce
         * @param {number} wait - Wait time in ms
         * @returns {Function} Debounced function
         */
        debounce(func, wait = CONFIG.performance.debounceDelay) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        },

        /**
         * Throttle function
         * @param {Function} func - Function to throttle
         * @param {number} limit - Time limit in ms
         * @returns {Function} Throttled function
         */
        throttle(func, limit = CONFIG.performance.throttleDelay) {
            let inThrottle;
            return function (...args) {
                if (!inThrottle) {
                    func.apply(this, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            };
        },

        /**
         * Console logging with debug mode check
         * @param {string} type - Log type (log, warn, error)
         * @param {*} message - Message to log
         */
        log(type = 'log', ...message) {
            if (CONFIG.debug) {
                console[type]('[EmiralAI]', ...message);
            }
        },

        /**
         * Trigger custom event
         * @param {string} eventName - Event name
         * @param {*} detail - Event detail data
         */
        trigger(eventName, detail = {}) {
            const event = new CustomEvent(`Emiralai:${eventName}`, { detail });
            document.dispatchEvent(event);
            this.log('log', `Event triggered: ${eventName}`, detail);
        }
    };

    /* =============================================================================
       3. NAVIGATION MODULE
       ============================================================================= */

    /**
     * Navigation module - Handles header and mobile menu
     */
    const Navigation = {
        elements: {},
        isInitialized: false,

        /**
         * Initialize navigation
         * @returns {boolean} Success status
         */
        init() {
            if (!CONFIG.features.navigation || this.isInitialized) return false;

            // Cache elements
            this.elements = {
                header: Utils.$('header'),
                hamburger: Utils.$('.hamburger'),
                navLinks: Utils.$('.nav-links'),
                navItems: Utils.$$('.nav-links li')
            };

            // Check if required elements exist
            if (!this.elements.hamburger || !this.elements.navLinks) {
                Utils.log('warn', 'Navigation elements not found');
                return false;
            }

            this.setupEventListeners();
            this.isInitialized = true;
            Utils.trigger('navigation:initialized');
            return true;
        },

        /**
         * Setup all event listeners
         */
        setupEventListeners() {
            // Hamburger menu toggle
            this.elements.hamburger.addEventListener('click', () => this.toggleMenu());

            // Close menu on link click
            this.elements.navItems.forEach(item => {
                item.addEventListener('click', () => this.closeMenu());
            });

            // Header scroll effect
            if (this.elements.header) {
                window.addEventListener('scroll', Utils.throttle(() => this.handleScroll()));
            }

            // Close menu on ESC key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.isMenuOpen()) {
                    this.closeMenu();
                }
            });
        },

        /**
         * Toggle mobile menu
         */
        toggleMenu() {
            const isOpen = this.elements.navLinks.classList.toggle('active');
            this.elements.hamburger.classList.toggle('toggle');

            // Animate menu items
            this.animateMenuItems(isOpen);

            // Update aria attributes
            this.elements.hamburger.setAttribute('aria-expanded', isOpen);

            Utils.trigger('navigation:toggled', { isOpen });
        },

        /**
         * Close mobile menu
         */
        closeMenu() {
            if (!this.isMenuOpen()) return;

            this.elements.navLinks.classList.remove('active');
            this.elements.hamburger.classList.remove('toggle');
            this.animateMenuItems(false);

            Utils.trigger('navigation:closed');
        },

        /**
         * Check if menu is open
         * @returns {boolean} Menu open state
         */
        isMenuOpen() {
            return this.elements.navLinks.classList.contains('active');
        },

        /**
         * Animate menu items
         * @param {boolean} show - Show or hide animation
         */
        animateMenuItems(show) {
            this.elements.navItems.forEach((item, index) => {
                if (show) {
                    const delay = (index / 7 + CONFIG.navigation.hamburgerAnimationDelay);
                    item.style.animation = `navLinkFade ${CONFIG.navigation.animationDuration}ms ease forwards ${delay}s`;
                } else {
                    item.style.animation = '';
                }
            });
        },

        /**
         * Handle scroll event for header
         */
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const shouldAddClass = scrollTop > CONFIG.navigation.scrollThreshold;

            this.elements.header.classList.toggle('header-scrolled', shouldAddClass);
        }
    };

    /* =============================================================================
       4. THEME TOGGLE MODULE
       ============================================================================= */

    /**
     * Theme toggle module - Handles dark/light mode switching
     */
    const ThemeToggle = {
        button: null,
        currentTheme: CONFIG.theme.defaultTheme,

        /**
         * Initialize theme toggle
         * @returns {boolean} Success status
         */
        init() {
            if (!CONFIG.features.themeToggle) return false;

            this.button = Utils.$('#theme-toggle');
            if (!this.button) {
                Utils.log('warn', 'Theme toggle button not found');
                return false;
            }

            this.loadSavedTheme();
            this.setupEventListeners();

            Utils.trigger('theme:initialized', { theme: this.currentTheme });
            return true;
        },

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            this.button.addEventListener('click', () => this.toggle());

            // Keyboard accessibility
            this.button.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle();
                }
            });
        },

        /**
         * Load saved theme from localStorage
         */
        loadSavedTheme() {
            if (CONFIG.theme.savePreference) {
                const savedTheme = localStorage.getItem('Emiralai-theme');
                if (savedTheme) {
                    this.currentTheme = savedTheme;
                }
            }
            this.applyTheme(this.currentTheme);
        },

        /**
         * Toggle between themes
         */
        toggle() {
            this.currentTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
            this.applyTheme(this.currentTheme);

            if (CONFIG.theme.savePreference) {
                localStorage.setItem('Emiralai-theme', this.currentTheme);
            }

            Utils.trigger('theme:changed', { theme: this.currentTheme });
        },

        /**
         * Apply theme to document
         * @param {string} theme - Theme name ('dark' or 'light')
         */
        applyTheme(theme) {
            const root = document.documentElement;
            const isDark = theme === 'dark';

            if (isDark) {
                root.removeAttribute('data-theme');
                this.button.innerHTML = '<i class="fas fa-sun"></i>';
                this.button.setAttribute('aria-label', 'Switch to light mode');
            } else {
                root.setAttribute('data-theme', 'light');
                this.button.innerHTML = '<i class="fas fa-moon"></i>';
                this.button.setAttribute('aria-label', 'Switch to dark mode');
            }
        },

        /**
         * Get current theme
         * @returns {string} Current theme name
         */
        getTheme() {
            return this.currentTheme;
        },

        /**
         * Set theme programmatically
         * @param {string} theme - Theme name
         */
        setTheme(theme) {
            if (theme === 'dark' || theme === 'light') {
                this.currentTheme = theme;
                this.applyTheme(theme);

                if (CONFIG.theme.savePreference) {
                    localStorage.setItem('Emiralai-theme', theme);
                }
            }
        }
    };

    /* =============================================================================
       5. VIDEO GRID MODULE
       ============================================================================= */

    /**
     * Video grid module - Handles video playback and grid layout
     */
    const VideoGrid = {
        grids: [],

        /**
         * Initialize video grids
         * @returns {boolean} Success status
         */
        init() {
            if (!CONFIG.features.videoGrid) return false;

            const gridElements = Utils.$$('.video-grid');
            if (gridElements.length === 0) return false;

            gridElements.forEach(grid => this.setupGrid(grid));

            Utils.trigger('videogrid:initialized', { grids: this.grids.length });
            return true;
        },

        /**
         * Setup individual video grid
         * @param {Element} grid - Grid container element
         */
        setupGrid(grid) {
            const frames = grid.querySelectorAll('.video-frame');
            if (frames.length === 0) return;

            // Add grid to tracking
            this.grids.push({
                element: grid,
                frames: frames,
                activeFrame: null
            });

            // Add video count class
            grid.classList.add(`video-count-${frames.length}`);

            // Setup each frame
            frames.forEach(frame => this.setupFrame(frame, grid));
        },

        /**
         * Setup individual video frame
         * @param {Element} frame - Video frame element
         * @param {Element} grid - Parent grid element
         */
        setupFrame(frame, grid) {
            const playBtn = frame.querySelector('.play-btn');
            const thumbnail = frame.querySelector('.video-thumbnail');

            if (!playBtn) return;

            // Initialize frame data
            this.initializeFrame(frame);

            // Add event listeners
            playBtn.addEventListener('click', () => this.playVideo(frame, grid));

            if (thumbnail) {
                thumbnail.addEventListener('click', () => playBtn.click());
                thumbnail.style.cursor = 'pointer';
            }

            // Keyboard accessibility
            playBtn.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.playVideo(frame, grid);
                }
            });
        },

        /**
         * Initialize video frame
         * @param {Element} frame - Video frame element
         */
        initializeFrame(frame) {
            const videoType = frame.dataset.videoType || CONFIG.videoGrid.defaultVideoType;
            const videoSrc = frame.dataset.videoSrc;
            const posterUrl = frame.dataset.poster;

            // Add thumbnail if needed
            if (posterUrl && !frame.querySelector('.video-thumbnail')) {
                const thumbnail = document.createElement('img');
                thumbnail.className = 'video-thumbnail';
                thumbnail.src = posterUrl;
                thumbnail.alt = 'Video thumbnail';
                frame.appendChild(thumbnail);
            }

            // Create video element for local videos
            if ((videoType === 'local' || videoType === 'url') && videoSrc && !frame.querySelector('video')) {
                const video = document.createElement('video');
                video.className = 'actual-video';
                video.controls = false;
                video.preload = 'metadata';
                video.style.opacity = '0';

                const source = document.createElement('source');
                source.src = videoSrc;
                source.type = 'video/mp4';

                video.appendChild(source);
                frame.insertBefore(video, frame.firstChild);
            }
        },

        /**
         * Play video
         * @param {Element} frame - Video frame element
         * @param {Element} grid - Parent grid element
         */
        playVideo(frame, grid) {
            // Stop all other videos
            this.stopAllVideos(grid);

            // Mark as playing
            frame.classList.add('playing');
            grid.classList.add('has-active-video');

            // Hide thumbnail
            const thumbnail = frame.querySelector('.video-thumbnail');
            if (thumbnail) {
                thumbnail.style.display = 'none';
            }

            // Play based on type
            const videoType = frame.dataset.videoType || CONFIG.videoGrid.defaultVideoType;

            switch (videoType) {
                case 'local':
                case 'url':
                    this.playLocalVideo(frame);
                    break;
                case 'youtube':
                    this.playYouTubeVideo(frame);
                    break;
                case 'vimeo':
                    this.playVimeoVideo(frame);
                    break;
            }

            Utils.trigger('video:play', { frame, videoType });
        },

        /**
         * Play local video
         * @param {Element} frame - Video frame element
         */
        playLocalVideo(frame) {
            const video = frame.querySelector('video');
            if (!video) return;

            video.controls = CONFIG.videoGrid.showControls;
            video.style.opacity = '1';

            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    Utils.log('warn', 'Video play failed:', error);
                });
            }

            // Add event listeners
            video.addEventListener('ended', () => this.stopVideo(frame));
            video.addEventListener('pause', () => {
                if (!video.ended) this.stopVideo(frame);
            });
        },

        /**
         * Play YouTube video
         * @param {Element} frame - Video frame element
         */
        playYouTubeVideo(frame) {
            const videoId = frame.dataset.videoId;
            if (!videoId) {
                Utils.log('error', 'YouTube video ID not provided');
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.className = 'actual-video';
            iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;

            frame.insertBefore(iframe, frame.firstChild);
        },

        /**
         * Play Vimeo video
         * @param {Element} frame - Video frame element
         */
        playVimeoVideo(frame) {
            const videoId = frame.dataset.videoId;
            if (!videoId) {
                Utils.log('error', 'Vimeo video ID not provided');
                return;
            }

            const iframe = document.createElement('iframe');
            iframe.className = 'actual-video';
            iframe.src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
            iframe.allow = 'autoplay; fullscreen; picture-in-picture';
            iframe.allowFullscreen = true;

            frame.insertBefore(iframe, frame.firstChild);
        },

        /**
         * Stop all videos in grid
         * @param {Element} grid - Grid container element
         */
        stopAllVideos(grid) {
            const frames = grid.querySelectorAll('.video-frame');
            frames.forEach(frame => this.stopVideo(frame));
        },

        /**
         * Stop individual video
         * @param {Element} frame - Video frame element
         */
        stopVideo(frame) {
            frame.classList.remove('playing');

            // Show thumbnail
            const thumbnail = frame.querySelector('.video-thumbnail');
            if (thumbnail) {
                thumbnail.style.display = '';
            }

            // Stop local video
            const video = frame.querySelector('video');
            if (video) {
                video.pause();
                video.currentTime = 0;
                video.style.opacity = '0';
            }

            // Remove iframe
            const iframe = frame.querySelector('iframe');
            if (iframe) {
                iframe.remove();
            }

            // Update grid state
            const grid = frame.closest('.video-grid');
            if (grid) {
                const hasActive = grid.querySelector('.video-frame.playing');
                if (!hasActive) {
                    grid.classList.remove('has-active-video');
                }
            }

            Utils.trigger('video:stop', { frame });
        }
    };

    /* =============================================================================
       6. PARTNERS MARQUEE MODULE
       ============================================================================= */

    /**
     * Partners marquee module - Handles scrolling partner logos
     */
    const PartnersMarquee = {
        track: null,
        marquee: null,
        animationId: null,
        isPaused: false,
        position: 0,
        trackWidth: 0,
        isDragging: false,
        startX: 0,
        startPosition: 0,

        /**
         * Initialize partners marquee
         */
        init() {
            if (!CONFIG.features.partnersMarquee) return false;

            this.track = Utils.$('#partnersTrack');
            this.marquee = Utils.$('#partnersMarquee');

            if (!this.track || !this.marquee) return false;

            // Clone items for seamless loop
            const items = this.track.querySelectorAll('.partner-item');
            if (items.length > 0) {
                items.forEach(item => {
                    const clone = item.cloneNode(true);
                    this.track.appendChild(clone);
                });
            }

            // Calculate track width
            this.trackWidth = this.track.scrollWidth / 2;

            this.setupEventListeners();
            this.startAnimation();

            return true;
        },

        /**
         * Setup event listeners
         */
        setupEventListeners() {
            // Pause on hover
            if (CONFIG.marquee.pauseOnHover) {
                this.marquee.addEventListener('mouseenter', () => this.pause());
                this.marquee.addEventListener('mouseleave', () => this.resume());
            }

            // Navigation buttons
            const prevBtn = Utils.$('.partners-prev');
            const nextBtn = Utils.$('.partners-next');

            if (prevBtn) prevBtn.addEventListener('click', () => this.move(-200));
            if (nextBtn) nextBtn.addEventListener('click', () => this.move(200));

            // Drag functionality
            if (CONFIG.marquee.dragEnabled) {
                const handleStart = (e) => {
                    if (this.isDragging) return;
                    this.isDragging = true;
                    this.startX = e.pageX || e.touches[0].pageX;
                    this.startPosition = this.position;
                    this.pause();
                    this.track.classList.add('dragging');
                    document.body.style.cursor = 'grabbing';

                    // Disable pointer events on partner items during drag
                    const partnerItems = this.track.querySelectorAll('.partner-item');
                    partnerItems.forEach(item => {
                        item.style.pointerEvents = 'none';
                    });
                };

                const handleMove = (e) => {
                    if (!this.isDragging) return;
                    e.preventDefault();
                    const x = e.pageX || e.touches[0].pageX;
                    const delta = x - this.startX;
                    this.position = this.startPosition + delta;
                    this.updatePosition();
                };

                const handleEnd = () => {
                    if (!this.isDragging) return;
                    this.isDragging = false;
                    this.track.classList.remove('dragging');
                    document.body.style.cursor = '';

                    // Re-enable pointer events on partner items
                    const partnerItems = this.track.querySelectorAll('.partner-item');
                    partnerItems.forEach(item => {
                        item.style.pointerEvents = '';
                    });

                    setTimeout(() => this.resume(), CONFIG.marquee.resetDelay);
                };

                // Mouse events
                this.marquee.addEventListener('mousedown', handleStart);
                document.addEventListener('mousemove', handleMove);
                document.addEventListener('mouseup', handleEnd);
                document.addEventListener('mouseleave', handleEnd);

                // Touch events
                this.marquee.addEventListener('touchstart', handleStart, { passive: false });
                this.marquee.addEventListener('touchmove', handleMove, { passive: false });
                this.marquee.addEventListener('touchend', handleEnd);
                this.marquee.addEventListener('touchcancel', handleEnd);
            }
        },

        /**
         * Start marquee animation
         */
        startAnimation() {
            const animate = () => {
                if (!this.isPaused) {
                    this.position -= CONFIG.marquee.speed / 60;

                    // Reset position when we've scrolled half the track width
                    if (Math.abs(this.position) >= this.trackWidth) {
                        this.position = 0;
                    }

                    this.updatePosition();
                }
                this.animationId = requestAnimationFrame(animate);
            };
            animate();
        },

        /**
         * Update track position
         */
        updatePosition() {
            this.track.style.transform = `translateX(${this.position}px)`;
        },

        /**
         * Pause marquee
         */
        pause() {
            this.isPaused = true;
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }
            this.track.classList.add('paused');
        },

        /**
         * Resume marquee
         */
        resume() {
            this.isPaused = false;
            this.track.classList.remove('paused');
            if (!this.animationId) {
                this.startAnimation();
            }
        },

        /**
         * Move marquee by distance
         */
        move(distance) {
            this.position += distance;
            this.updatePosition();
        }
    };

    /* =============================================================================
       7. CHARTS MODULE
       ============================================================================= */

    /**
 * Charts module - Handles Chart.js integrations
 */
    const Charts = {
        instances: [],

        /**
         * Initialize charts
         * @returns {boolean} Success status
         */
        init() {
            if (!CONFIG.features.charts) return false;

            // Check if Chart.js is loaded
            if (typeof Chart === 'undefined') {
                Utils.log('warn', 'Chart.js library not loaded');
                return false;
            }

            this.setDefaults();
            this.createCharts();

            Utils.trigger('charts:initialized', { count: this.instances.length });
            return true;
        },

        /**
         * Set Chart.js defaults
         */
        setDefaults() {
            Chart.defaults.color = getComputedStyle(document.documentElement)
                .getPropertyValue('--auth-text-primary') || '#ffffff';
            Chart.defaults.font.family = "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif";
            Chart.defaults.responsive = true;
            Chart.defaults.maintainAspectRatio = false;
        },

        /**
         * Create all charts
         */
        createCharts() {
            const chartConfigs = [
                {
                    id: 'aiEfficiencyChart',
                    data: [86, 14],
                    colors: ['rgba(0, 223, 255, 0.9)', 'rgba(255, 255, 255, 0.05)'],
                    borderColors: ['rgba(0, 223, 255, 1)', 'rgba(255, 255, 255, 0.1)'],
                    label: 'AI Efficiency',
                    labels: ['Automated Tasks', 'Manual Processing']
                },
                {
                    id: 'customerSatisfactionChart',
                    data: [93, 7],
                    colors: ['rgba(149, 97, 226, 0.9)', 'rgba(255, 255, 255, 0.05)'],
                    borderColors: ['rgba(149, 97, 226, 1)', 'rgba(255, 255, 255, 0.1)'],
                    label: 'Customer Satisfaction',
                    labels: ['Satisfied Customers', 'Needs Improvement']
                },
                {
                    id: 'decisionAccuracyChart',
                    data: [78, 22],
                    colors: ['rgba(255, 106, 0, 0.9)', 'rgba(255, 255, 255, 0.05)'],
                    borderColors: ['rgba(255, 106, 0, 1)', 'rgba(255, 255, 255, 0.1)'],
                    label: 'Decision Accuracy',
                    labels: ['Accurate Decisions', 'Error Rate']
                }
            ];

            chartConfigs.forEach((config, index) => {
                this.createChart(config, index * CONFIG.charts.animationDelay);
            });
        },

        /**
         * Create individual chart
         * @param {Object} config - Chart configuration
         * @param {number} delay - Animation delay
         */
        createChart(config, delay) {
            const canvas = Utils.$(`#${config.id}`);
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: config.labels || ['Value', 'Remaining'], // Use labels if provided
                    datasets: [{
                        data: config.data,
                        backgroundColor: config.colors,
                        borderColor: config.borderColors,
                        borderWidth: 2,
                        cutout: '75%'
                    }]
                },
                options: {
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            enabled: CONFIG.charts.tooltipEnabled,
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            titleColor: '#ffffff',
                            bodyColor: '#ffffff',
                            padding: 12,
                            cornerRadius: 8,
                            callbacks: {
                                label: function (context) {
                                    // Get the correct data using context
                                    const label = context.label || '';
                                    const value = context.parsed || 0;
                                    const percentage = config.data[context.dataIndex];

                                    // Show label + percentage
                                    return `${label}: ${percentage}%`;
                                }
                            }
                        }
                    },
                    animation: {
                        animateScale: true,
                        animateRotate: true,
                        duration: CONFIG.charts.animationDuration,
                        easing: CONFIG.charts.animationEasing,
                        delay: delay
                    }
                }
            });

            this.instances.push(chart);
        },

        /**
         * Update all charts
         */
        update() {
            this.instances.forEach(chart => chart.update());
        },

        /**
         * Destroy all charts
         */
        destroy() {
            this.instances.forEach(chart => chart.destroy());
            this.instances = [];
        }
    };

    /* =============================================================================
       8. UI EFFECTS MODULE
       ============================================================================= */

    /**
     * UI Effects module - Handles animations and visual effects
     */
    const UIEffects = {
        observers: {},

        /**
         * Initialize UI effects
         * @returns {boolean} Success status
         */
        init() {
            if (!CONFIG.features.uiEffects) return false;

            if (CONFIG.effects.rippleEnabled) this.setupRippleEffects();
            if (CONFIG.features.scrollAnimations) this.setupScrollAnimations();
            if (CONFIG.features.lazyLoading) this.setupLazyLoading();

            Utils.trigger('uieffects:initialized');
            return true;
        },

        /**
         * Setup ripple effects on buttons
         */
        setupRippleEffects() {
            const buttons = Utils.$$('.btn, .nav-btn, .pricing-btn, button');

            buttons.forEach(button => {
                button.addEventListener('click', this.createRipple);
            });
        },

        /**
         * Create ripple effect
         * @param {Event} e - Click event
         */
        createRipple(e) {
            const button = e.currentTarget;
            const rect = button.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            const ripple = document.createElement('span');
            ripple.className = 'ripple-effect';
            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: rgba(255, 255, 255, 0.5);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple ${CONFIG.effects.rippleDuration}ms linear;
                pointer-events: none;
            `;

            button.style.position = 'relative';
            button.style.overflow = 'hidden';
            button.appendChild(ripple);

            setTimeout(() => ripple.remove(), CONFIG.effects.rippleDuration);
        },

        /**
         * Setup scroll animations
         */
        setupScrollAnimations() {
            const options = {
                threshold: CONFIG.effects.scrollAnimationThreshold,
                rootMargin: `0px 0px -${CONFIG.effects.scrollAnimationDelay}px 0px`
            };

            this.observers.scroll = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        this.observers.scroll.unobserve(entry.target);
                    }
                });
            }, options);

            const elements = Utils.$$('.glass-card, .feature-card, .tech-card, .testimonial-card');
            elements.forEach(el => {
                el.classList.add('animate-on-scroll');
                this.observers.scroll.observe(el);
            });
        },

        /**
         * Setup lazy loading
         */
        setupLazyLoading() {
            if (!('IntersectionObserver' in window)) return;

            const options = {
                rootMargin: `${CONFIG.performance.lazyLoadOffset}px 0px`
            };

            this.observers.lazy = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const el = entry.target;
                        if (el.dataset.src) {
                            el.src = el.dataset.src;
                            el.removeAttribute('data-src');
                            el.classList.add('loaded');
                        }
                        this.observers.lazy.unobserve(el);
                    }
                });
            }, options);

            const elements = Utils.$$('img[data-src], video[data-src]');
            elements.forEach(el => this.observers.lazy.observe(el));
        },

        /**
         * Cleanup observers
         */
        cleanup() {
            Object.values(this.observers).forEach(observer => {
                if (observer) observer.disconnect();
            });
        }
    };

    /* =============================================================================
       9. PUBLIC API
       ============================================================================= */

    /**
     * Public API - Expose methods for external use
     */
    const EmiralAI = {
        // Version info
        version: '2.0.0',

        // Configuration
        config: CONFIG,

        // Modules
        navigation: Navigation,
        theme: ThemeToggle,
        video: VideoGrid,
        marquee: PartnersMarquee,
        charts: Charts,
        effects: UIEffects,

        // Utility methods
        utils: Utils,

        /**
         * Initialize all modules
         */
        init() {
            // Initialize enabled modules
            const modules = {
                navigation: Navigation,
                themeToggle: ThemeToggle,
                videoGrid: VideoGrid,
                partnersMarquee: PartnersMarquee,
                charts: Charts,
                uiEffects: UIEffects
            };

            Object.entries(modules).forEach(([name, module]) => {
                if (CONFIG.features[name] !== false) {
                    module.init();
                }
            });

            Utils.trigger('Emiralai:initialized');
        },

        /**
         * Reinitialize specific module
         * @param {string} moduleName - Module to reinitialize
         */
        reinit(moduleName) {
            const module = this[moduleName];
            if (module && typeof module.init === 'function') {
                module.init();
            }
        },

        /**
         * Update configuration
         * @param {Object} newConfig - New configuration object
         */
        configure(newConfig) {
            Object.assign(CONFIG, newConfig);
            Utils.trigger('config:updated', newConfig);
        },

        /**
         * Subscribe to events
         * @param {string} eventName - Event name (without 'Emiralai:' prefix)
         * @param {Function} callback - Callback function
         */
        on(eventName, callback) {
            document.addEventListener(`Emiralai:${eventName}`, callback);
        },

        /**
         * Unsubscribe from events
         * @param {string} eventName - Event name (without 'Emiralai:' prefix)
         * @param {Function} callback - Callback function
         */
        off(eventName, callback) {
            document.removeEventListener(`Emiralai:${eventName}`, callback);
        },

        /**
         * Enable debug mode
         * @param {boolean} enable - Enable or disable debug
         */
        debug(enable = true) {
            CONFIG.debug = enable;
            Utils.log('log', `Debug mode ${enable ? 'enabled' : 'disabled'}`);
        }
    };

    /* =============================================================================
       10. INITIALIZATION
       ============================================================================= */

    /**
     * Add ripple animation styles
     */
    function addRippleStyles() {
        if (document.getElementById('Emiralai-ripple-styles')) return;

        const style = document.createElement('style');
        style.id = 'Emiralai-ripple-styles';
        style.textContent = `
            @keyframes ripple {
                to {
                    transform: scale(4);
                    opacity: 0;
                }
            }
            .ripple-effect {
                position: absolute;
                border-radius: 50%;
                transform: scale(0);
                animation: ripple 0.6s linear;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    /**
     * Initialize when DOM is ready
     */
    function domReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    /**
     * Main initialization
     */
    domReady(() => {
        // Add required styles
        addRippleStyles();

        // Initialize EmiralAI
        EmiralAI.init();

        // Make available globally
        window.EmiralAI = EmiralAI;

        // Log initialization
        Utils.log('log', 'EmiralAI initialized successfully');
    });

    /**
     * Handle window resize
     */
    window.addEventListener('resize', Utils.debounce(() => {
        // Update charts if available
        if (Charts.instances.length > 0) {
            Charts.update();
        }

        Utils.trigger('window:resized');
    }));

    document.addEventListener('DOMContentLoaded', () => {
        PartnersMarquee.init();
    });

    /**
     * Handle visibility change
     */
    document.addEventListener('visibilitychange', () => {
        const isVisible = !document.hidden;

        // Pause/resume marquee
        if (PartnersMarquee.marquee) {
            isVisible ? PartnersMarquee.resume() : PartnersMarquee.pause();
        }

        Utils.trigger('visibility:changed', { isVisible });
    });

})();

/**
 * =============================================================================
 * USAGE EXAMPLES
 * =============================================================================
 * 
 * 1. Configure settings:
 *    EmiralAI.configure({
 *        theme: { defaultTheme: 'light' },
 *        marquee: { speed: 100 }
 *    });
 * 
 * 2. Listen to events:
 *    EmiralAI.on('theme:changed', (e) => {
 *        console.log('Theme changed to:', e.detail.theme);
 *    });
 * 
 * 3. Control modules:
 *    EmiralAI.theme.setTheme('dark');
 *    EmiralAI.marquee.pause();
 *    EmiralAI.video.stopAllVideos();
 * 
 * 4. Enable debug mode:
 *    EmiralAI.debug(true);
 * 
 * 5. Reinitialize module:
 *    EmiralAI.reinit('charts');
 * 
 * =============================================================================
 */