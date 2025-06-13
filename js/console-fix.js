/**
 * console-fix.js file
 * Intelligently manages console output based on environment
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 */
(function () {
    'use strict';

    // Check if running in development environment
    const isDevelopment = window.location.hostname === 'localhost' ||
        window.location.hostname === '127.0.0.1' ||
        window.location.hostname.includes('.local') ||
        window.location.port === '5500'; // Live Server port

    // Store original console methods
    window._originalConsole = {
        log: console.log,
        warn: console.warn,
        error: console.error,
        info: console.info,
        debug: console.debug
    };

    // Only disable in production
    if (!isDevelopment) {
        console.log = function () { };
        console.warn = function () { };
        console.error = function () { };
        console.info = function () { };
        console.debug = function () { };

        // Notify about console status (using original method)
        window._originalConsole.log(
            '%c🔒 Console disabled for production. Type enableConsole() to activate',
            'color: #ff9800; font-style: italic'
        );
    } else {
        // Keep console active in development
        console.log(
            '%c🚀 Development mode - Console is active',
            'color: #4CAF50; font-weight: bold'
        );
    }

    // Provide method to toggle console
    window.enableConsole = function () {
        console.log = window._originalConsole.log;
        console.warn = window._originalConsole.warn;
        console.error = window._originalConsole.error;
        console.info = window._originalConsole.info;
        console.debug = window._originalConsole.debug;
        console.log('%c✅ Console has been enabled!', 'color: #4CAF50; font-weight: bold; font-size: 14px');
    };

    // Also provide disable method
    window.disableConsole = function () {
        console.log = function () { };
        console.warn = function () { };
        console.error = function () { };
        console.info = function () { };
        console.debug = function () { };
        window._originalConsole.log('%c🔒 Console has been disabled!', 'color: #f44336; font-weight: bold');
    };
})();