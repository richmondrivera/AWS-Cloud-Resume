/**
 * Portfolio Website - JavaScript
 * Handles dark mode, visitor counter, form validation, and interactions
 */

// ============================================
// Initialization
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

function initializePage() {
    initTheme();
    initVisitorCounter();
    initNavigation();
    initFormHandling();
    initSmoothScrolling();
    initIntersectionObserver();
    initScrollAnimations();
    initResume();
}

// ============================================
// Dark Mode / Theme Toggle
// ============================================

function initTheme() {
    const themeToggle = document.getElementById('themeToggle');
    const htmlElement = document.documentElement;
    
    // Check saved theme or system preference
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const initialTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    // Set initial theme
    setTheme(initialTheme);
    
    // Toggle button listener
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = htmlElement.getAttribute('data-theme') || 'light';
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            setTheme(newTheme);
        });
    }
    
    // Listen for system theme changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
        if (!localStorage.getItem('theme')) {
            setTheme(e.matches ? 'dark' : 'light');
        }
    });
}

function setTheme(theme) {
    const htmlElement = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
    
    // Update toggle button icon
    if (themeToggle) {
        themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
    }
}

// ============================================
// Visitor Counter (LocalStorage)
// ============================================

/*
function initVisitorCounter() {
    const counterElement = document.getElementById('visitorCount');
    
    if (!counterElement) return;
    
    // Get current count from localStorage
    let visitCount = localStorage.getItem('visitCount');
    
    if (!visitCount) {
        // First visit
        visitCount = 1;
    } else {
        // Increment on each visit
        visitCount = parseInt(visitCount) + 1;
    }
    
    // Save updated count
    localStorage.setItem('visitCount', visitCount);
    
    // Update display with animation
    counterElement.textContent = visitCount;
    counterElement.style.animation = 'none';
    setTimeout(() => {
        counterElement.style.animation = 'pulse 0.5s ease-out';
    }, 10);
    
    // Log visitor milestone
    if (visitCount === 1) {
        console.log('👋 Welcome! First visit.');
    } else if (visitCount % 10 === 0) {
        console.log(`🎉 You've visited ${visitCount} times!`);
    }
    
    // Optional: Send to Lambda/DynamoDB
    // trackVisitor(visitCount);
}
*/
	/**
 * Track visitor count using Lambda function
 */

function trackVisitor() {
  fetch('', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    }
  })
  .then(response => response.json())
  .then(data => {
    // Update the counter display on your webpage
    const countElement = document.getElementById('visitorCount');
    if (countElement) {
      countElement.textContent = data.count;
    }
    console.log('Visitor count updated:', data.count);
  })
  .catch(error => {
    console.error('Error tracking visitor:', error);
    // Fallback display if API fails
    const countElement = document.getElementById('visitorCount');
    if (countElement) {
      countElement.textContent = '—';
    }
  });
}

// Call this function when the page loads
trackVisitor();


// ============================================
// Navigation
// ============================================

function initNavigation() {
    const mobileToggle = document.getElementById('mobileToggle');
    const navMenu = document.getElementById('navMenu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    // Mobile menu toggle
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close menu when link clicked
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                mobileToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Update active nav link on scroll
    updateActiveNavLink();
    window.addEventListener('scroll', updateActiveNavLink);
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        
        if (window.pageYOffset >= sectionTop - 200) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').slice(1) === currentSection) {
            link.classList.add('active');
        }
    });
}

// ============================================
// Smooth Scrolling
// ============================================

function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#' || !href) return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            if (!target) return;
            
            const navHeight = document.querySelector('.navbar').offsetHeight;
            const targetPosition = target.offsetTop - navHeight - 20;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        });
    });
}

// ============================================
// Form Handling
// ============================================

function initFormHandling() {
    const contactForm = document.getElementById('contactForm');
    
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', handleFormSubmit);
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formMessage = document.getElementById('formMessage');
    const submitButton = form.querySelector('button[type="submit"]');
    
    // Get form data
    const formData = {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        subject: document.getElementById('subject').value.trim(),
        message: document.getElementById('message').value.trim(),
    };
    
    // Validate form
    if (!validateForm(formData)) {
        showFormMessage('Please fill in all fields correctly.', 'error', formMessage);
        return;
    }
    
    // Disable button during submission
    const originalText = submitButton.textContent;
    submitButton.disabled = true;
    submitButton.textContent = 'Sending...';
    
    // Simulate form submission
    setTimeout(() => {
        handleFormSuccess(form, formMessage, submitButton, originalText);
    }, 1500);
    
    // Optional: Send to backend
    // sendFormToBackend(formData);
}

function validateForm(data) {
    if (!data.name || data.name.length < 2) {
        return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
        return false;
    }
    
    if (!data.subject || data.subject.length < 3) {
        return false;
    }
    
    if (!data.message || data.message.length < 10) {
        return false;
    }
    
    return true;
}

function handleFormSuccess(form, formMessage, submitButton, originalText) {
    // Show success message
    showFormMessage(
        '✓ Message sent successfully! I\'ll get back to you within 24 hours.',
        'success',
        formMessage
    );
    
    // Log form data
    console.log('Form submitted:', {
        name: form.name.value,
        email: form.email.value,
        subject: form.subject.value,
        message: form.message.value,
        timestamp: new Date().toISOString(),
    });
    
    // Reset form
    form.reset();
    
    // Re-enable button
    submitButton.disabled = false;
    submitButton.textContent = originalText;
    
    // Hide message after 5 seconds
    setTimeout(() => {
        formMessage.style.display = 'none';
    }, 5000);
}

function showFormMessage(message, type, element) {
    if (!element) return;
    
    element.textContent = message;
    element.className = `form-message ${type}`;
    element.style.display = 'block';
    
    // Scroll to message
    element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Optional: Send form data to backend
 * Uncomment and configure to integrate with your backend
 */
function sendFormToBackend(formData) {
    // Using Formspree (free email service)
    /*
    fetch('https://formspree.io/f/YOUR_FORM_ID', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => {
        if (data.ok) {
            console.log('Form sent successfully');
        }
    })
    .catch(error => console.error('Error:', error));
    */
    
    // Or using your own Lambda function
    /*
    fetch('https://your-lambda-function-url/contact', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
    })
    .then(response => response.json())
    .then(data => console.log('Success:', data))
    .catch(error => console.error('Error:', error));
    */
}

// ============================================
// Intersection Observer for Animations
// ============================================

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observe skill badges
    const skillBadges = document.querySelectorAll('.skill-badge');
    skillBadges.forEach(badge => {
        badge.style.opacity = '0';
        badge.style.transform = 'translateY(10px)';
        badge.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(badge);
    });
}

// ============================================
// Scroll-Based Animations
// ============================================

function initScrollAnimations() {
    const proficiencyBars = document.querySelectorAll('.proficiency-fill');
    
    if (proficiencyBars.length === 0) return;
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.transition = 'width 1s ease-out';
                // Width is already set in CSS, just trigger animation
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    proficiencyBars.forEach(bar => {
        observer.observe(bar);
    });
}

// ============================================
// Resume Download
// ============================================

function initResume() {
    const downloadButtons = document.querySelectorAll('#downloadResume, #downloadResumeButton');
    
    downloadButtons.forEach(button => {
        button.addEventListener('click', handleResumeDownload);
    });
}

function handleResumeDownload(e) {
    e.preventDefault();
    
    // This is a placeholder - implement actual PDF download
    const message = 'Resume download feature will be available soon! Check back later or contact me for a copy.';
    
    // Show alert
    alert(message);
    
    // Log download attempt
    console.log('Resume download requested at', new Date().toISOString());
    
    // Optional: Track download attempt
    // trackEvent('resume_download_clicked');
    
    // In production, implement one of these options:
    // 1. Create PDF on backend and serve via Lambda
    // 2. Use PDF library like jsPDF to generate on client-side
    // 3. Link to PDF file in S3
    
    /*
    // Example: Download PDF from S3
    const resumeUrl = 'https://your-s3-bucket.s3.amazonaws.com/resume.pdf';
    const link = document.createElement('a');
    link.href = resumeUrl;
    link.download = 'Alex_Chen_Resume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    */
}

// ============================================
// Analytics & Tracking (Optional)
// ============================================

function trackEvent(eventName, eventData = {}) {
    // Google Analytics
    if (window.gtag) {
        gtag('event', eventName, eventData);
    }
    
    // Custom tracking (e.g., send to Lambda)
    console.log(`Event: ${eventName}`, eventData);
}

// Track page view
window.addEventListener('load', function() {
    trackEvent('page_view', {
        page_title: document.title,
        page_location: window.location.href,
    });
});

// Track time on page
let timeOnPage = 0;
setInterval(() => {
    timeOnPage++;
}, 1000);

window.addEventListener('beforeunload', function() {
    if (timeOnPage > 10) { // Only track if spent > 10 seconds
        trackEvent('engagement', {
            time_on_page: timeOnPage,
            page: document.title,
        });
    }
});

// ============================================
// Keyboard Shortcuts
// ============================================

document.addEventListener('keydown', function(event) {
    // Skip if user is typing in form
    if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return;
    }
    
    // Ctrl/Cmd + K: Focus on navigation (for accessibility)
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const firstNavLink = document.querySelector('.nav-link');
        if (firstNavLink) firstNavLink.focus();
    }
    
    // Escape: Close mobile menu
    if (event.key === 'Escape') {
        const mobileToggle = document.getElementById('mobileToggle');
        const navMenu = document.getElementById('navMenu');
        if (mobileToggle && navMenu && navMenu.classList.contains('active')) {
            mobileToggle.classList.remove('active');
            navMenu.classList.remove('active');
        }
    }
});

// ============================================
// Performance Monitoring
// ============================================

// Log page load time
window.addEventListener('load', function() {
    if (window.performance && window.performance.timing) {
        const perfData = window.performance.timing;
        const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
        console.log('Page loaded in', pageLoadTime, 'ms');
        
        // Track performance
        trackEvent('page_load', {
            load_time: pageLoadTime,
        });
    }
});

// ============================================
// Utility Functions
// ============================================

/**
 * Copy text to clipboard
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => {
            console.log('Copied to clipboard');
            showNotification('Copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy:', err);
            showNotification('Failed to copy', 'error');
        });
}

/**
 * Show temporary notification
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'error' ? '#ef4444' : '#10b981'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideInUp 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

/**
 * Check if element is in viewport
 */
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Debounce function for scroll events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Throttle function for performance
 */
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// ============================================
// Error Handling
// ============================================

window.addEventListener('error', function(event) {
    console.error('Global error:', event.error);
    // Could send to error tracking service
});

window.addEventListener('unhandledrejection', function(event) {
    console.error('Unhandled promise rejection:', event.reason);
    // Could send to error tracking service
});

// ============================================
// Print Functionality
// ============================================

function printPage() {
    window.print();
}

// Make print function globally available
window.printPortfolio = printPage;

// ============================================
// Export Functions
// ============================================

// Make important functions available globally if needed
window.Portfolio = {
    setTheme: setTheme,
    copyToClipboard: copyToClipboard,
    trackEvent: trackEvent,
    printPage: printPage,
};

console.log('Portfolio website initialized successfully!');
console.log('Theme:', localStorage.getItem('theme') || 'default');
console.log('Visitor count:', localStorage.getItem('visitCount') || 1);
