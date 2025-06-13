//START CONTACT-FAQ JS AND FORMSPREE
/*
* Version: 1.0.0
* Author:  Omar Dello
* License: ThemeForest Regular/Extended License
*/
// JavaScript for FAQ accordion functionality
document.addEventListener('DOMContentLoaded', function () {
    const faqItems = document.querySelectorAll('.faq-item');

    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');

        question.addEventListener('click', () => {
            // Toggle active class on clicked item
            item.classList.toggle('active');

            // Optional: Close other open items
            faqItems.forEach(otherItem => {
                if (otherItem !== item && otherItem.classList.contains('active')) {
                    otherItem.classList.remove('active');
                }
            });
        });
    });
});


// newsletter form
document.addEventListener('DOMContentLoaded', function () {
    const newsletterForm = document.querySelector('.newsletter-form');

    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const emailInput = this.querySelector('.newsletter-input').value;

            if (emailInput && emailInput.includes('@')) {
                // Here you would typically send this to your backend
                alert('Thank you for subscribing!');
                this.querySelector('.newsletter-input').value = '';
            } else {
                alert('Please enter a valid email address.');
            }
        });
    }
});

/*
 * RROR AND SUCCESS MESSAGE SENDING USING FORSPREE
*/
document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById('contact-form');
    const successMsg = document.getElementById('success-message');
    const errorMsg = document.getElementById('error-message');

    function hideMessages() {
        successMsg.classList.remove('show');
        errorMsg.classList.remove('show');
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
    }

    function showMessage(element) {
        element.style.display = 'block';
        setTimeout(() => element.classList.add('show'), 10);

// Hide after 5 seconds automatically
        setTimeout(() => {
            element.classList.remove('show');
            setTimeout(() => element.style.display = 'none', 400);
        }, 5000);
    }

    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            hideMessages(); // Hide any existing message

            const formData = new FormData(form);
            const data = {};
            formData.forEach((value, key) => data[key] = value);

            fetch('https://formspree.io/f/YOUR_FORM_ID_HERE', {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
                .then(response => {
                    if (response.ok) {
                        showMessage(successMsg);
                        form.reset();
                    } else {
                        return response.json().then(data => {
                            console.warn("Form Error:", data);
                            showMessage(errorMsg);
                        });
                    }
                })
                .catch(error => {
                    console.error("Fetch Error:", error);
                    showMessage(errorMsg);
                });
        });
    }
});

