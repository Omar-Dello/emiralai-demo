/**
 * Portfolio.js - EmiralAI Template
 * ============================================================================== 
 * Version: 1.0.0
 * Author:  Omar Dello
 * License: ThemeForest Regular/Extended License
 * ============================================================================ 
 * This file contains JavaScript functionality specific to the portfolio page:
 * 1. Portfolio filtering system
 * 2. Testimonial slider
 * 3. Animation effects for portfolio items
 */

document.addEventListener('DOMContentLoaded', function () {
    // Initialize all portfolio page functionality
    initPortfolioFilters();
    initTestimonialSlider();
    animatePortfolioItems();
});

/**
 * Initialize portfolio filtering functionality
 * Allows users to filter portfolio items by category
 */
function initPortfolioFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    // Add click event to each filter button
    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));

            // Add active class to clicked button
            this.classList.add('active');

            // Get filter value
            const filterValue = this.getAttribute('data-filter');

            // Filter the portfolio items
            portfolioItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                // Remove both classes first
                item.classList.remove('show');
                item.classList.remove('hide');

                // Add appropriate class based on filter
                if (filterValue === 'all' || filterValue === itemCategory) {
                    item.classList.add('show');

                    // Use setTimeout to ensure smooth transition
                    setTimeout(() => {
                        item.style.display = 'block';
                    }, 300);
                } else {
                    item.classList.add('hide');

                    // Use setTimeout to ensure smooth transition
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // Make sure "All Projects" is active by default
    if (filterButtons.length > 0) {
        filterButtons[0].click();
    }
}

/**
 * Initialize testimonial slider
 * Creates a simple carousel/slider for testimonials
 */
function initTestimonialSlider() {
    const slides = document.querySelectorAll('.testimonial-slide');
    const dots = document.querySelectorAll('.dot');
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');

    // Return if elements don't exist
    if (!slides.length || !dots.length || !prevBtn || !nextBtn) return;

    let currentSlide = 0;
    let slideInterval;
    const intervalTime = 5000; // 5 seconds

    // Hide all slides except the first one
    slides.forEach((slide, index) => {
        if (index !== 0) {
            slide.style.display = 'none';
        }
    });

    // Function to show a specific slide
    function showSlide(n) {
        // Hide all slides
        slides.forEach(slide => {
            slide.style.display = 'none';
            slide.classList.remove('active');
        });

        // Remove active class from all dots
        dots.forEach(dot => {
            dot.classList.remove('active');
        });

        // Show the selected slide
        slides[n].style.display = 'block';
        slides[n].classList.add('active');

        // Add active class to the current dot
        dots[n].classList.add('active');

        // Update current slide index
        currentSlide = n;
    }

    // Function to advance to the next slide
    function nextSlide() {
        let next = currentSlide + 1;
        if (next >= slides.length) {
            next = 0;
        }
        showSlide(next);
    }

    // Function to go back to the previous slide
    function prevSlide() {
        let prev = currentSlide - 1;
        if (prev < 0) {
            prev = slides.length - 1;
        }
        showSlide(prev);
    }

    // Add click event to dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            // Reset interval timer when user clicks
            clearInterval(slideInterval);
            showSlide(index);
            startSlideInterval();
        });
    });

    // Add click event to prev button
    prevBtn.addEventListener('click', () => {
        // Reset interval timer when user clicks
        clearInterval(slideInterval);
        prevSlide();
        startSlideInterval();
    });

    // Add click event to next button
    nextBtn.addEventListener('click', () => {
        // Reset interval timer when user clicks
        clearInterval(slideInterval);
        nextSlide();
        startSlideInterval();
    });

    // Function to start automatic slide interval
    function startSlideInterval() {
        slideInterval = setInterval(nextSlide, intervalTime);
    }

    // Start the automatic slide interval
    startSlideInterval();
}

/**
 * Animate portfolio items on page load
 * Creates a staggered reveal effect for the portfolio grid
 */
function animatePortfolioItems() {
    const portfolioItems = document.querySelectorAll('.portfolio-item');

    portfolioItems.forEach((item, index) => {
        // Add initial hidden state
        item.style.opacity = '0';
        item.style.transform = 'translateY(20px)';
        item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        // Animate in with staggered delay
        setTimeout(() => {
            item.style.opacity = '1';
            item.style.transform = 'translateY(0)';
        }, 100 * index); // Staggered delay based on index
    });
}