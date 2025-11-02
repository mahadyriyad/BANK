// ===================== GLOBAL VARIABLES =====================
let currentTheme = localStorage.getItem('theme') || 'light';
let chatMessages = [];
let isChatbotOpen = false;

// ===================== DARK MODE FUNCTIONALITY =====================
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');

    // Check for saved theme preference or use OS preference
    const savedTheme = localStorage.getItem('theme') || (prefersDarkScheme.matches ? 'dark' : 'light');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (darkModeToggle) darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }

    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            
            if (document.body.classList.contains('dark-mode')) {
                localStorage.setItem('theme', 'dark');
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
                currentTheme = 'dark';
            } else {
                localStorage.setItem('theme', 'light');
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
                currentTheme = 'light';
            }
        });
    }
}

// ===================== NOTIFICATION SYSTEM =====================
function initNotifications() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationDropdown = document.getElementById('notificationDropdown');

    if (notificationBell && notificationDropdown) {
        notificationBell.addEventListener('click', function(e) {
            e.stopPropagation();
            notificationDropdown.classList.toggle('show');
        });

        // Close notification dropdown when clicking outside
        document.addEventListener('click', function() {
            notificationDropdown.classList.remove('show');
        });
    }
}

// ===================== USER DROPDOWN =====================
function initUserDropdown() {
    const userDropdownToggle = document.getElementById('userDropdownToggle');
    const userDropdownMenu = document.getElementById('userDropdownMenu');

    if (userDropdownToggle && userDropdownMenu) {
        userDropdownToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdownMenu.classList.toggle('show');
        });

        // Close user dropdown when clicking outside
        document.addEventListener('click', function() {
            userDropdownMenu.classList.remove('show');
        });
    }
}

// ===================== SEARCH FUNCTIONALITY =====================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    const searchResults = document.getElementById('searchResults');

    if (!searchInput || !searchResults) return;

    // Sample search data
    const searchData = [
        { title: "Savings Accounts", desc: "High-interest savings accounts with flexible terms", url: "#services" },
        { title: "Home Loans", desc: "Competitive mortgage rates with flexible repayment options", url: "#services" },
        { title: "Credit Cards", desc: "Rewards, cashback, and low-interest credit cards", url: "#services" },
        { title: "Online Banking", desc: "Access your accounts anytime, anywhere", url: "#services" },
        { title: "Investment Services", desc: "Expert guidance and diverse investment options", url: "#services" },
        { title: "Contact Support", desc: "Get help from our customer service team", url: "#contact-section" },
        { title: "Bank Branches", desc: "Find our nearest branch locations", url: "#about" },
        { title: "Mobile Banking App", desc: "Download our secure mobile banking application", url: "#how-it-works" }
    ];

    searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        
        if (query.length === 0) {
            searchResults.classList.remove('show');
            return;
        }
        
        // Filter search results
        const filteredResults = searchData.filter(item => 
            item.title.toLowerCase().includes(query) || 
            item.desc.toLowerCase().includes(query)
        );
        
        // Display results
        if (filteredResults.length > 0) {
            searchResults.innerHTML = '';
            filteredResults.forEach(result => {
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.innerHTML = `
                    <div class="search-result-title">${result.title}</div>
                    <div class="search-result-desc">${result.desc}</div>
                `;
                resultItem.addEventListener('click', function() {
                    showNotification(`Navigating to: ${result.title}`, 'info');
                    searchResults.classList.remove('show');
                    searchInput.value = '';
                    // Scroll to section
                    const targetSection = document.querySelector(result.url);
                    if (targetSection) {
                        targetSection.scrollIntoView({ behavior: 'smooth' });
                    }
                });
                searchResults.appendChild(resultItem);
            });
            searchResults.classList.add('show');
        } else {
            searchResults.classList.remove('show');
        }
    });

    if (searchBtn) {
        searchBtn.addEventListener('click', function() {
            if (searchInput.value.trim().length > 0) {
                showNotification(`Searching for: ${searchInput.value}`, 'info');
                searchResults.classList.remove('show');
            }
        });
    }

    // Close search results when clicking outside
    document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.classList.remove('show');
        }
    });
}

// ===================== SOCIAL LOGIN =====================
function initSocialLogin() {
    document.querySelectorAll('.social-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const platform = this.classList.contains('facebook') ? 'Facebook' : 'Google';
            showNotification(`${platform} login would be implemented here.`, 'info');
        });
    });
}

// ===================== ENHANCED NAVIGATION =====================
function initEnhancedNavigation() {
    const navItems = document.querySelectorAll('.navbar-enhanced ul li');
    const marker = document.getElementById('marker');
    
    if (navItems.length === 0 || !marker) return;

    navItems.forEach(item => {
        item.addEventListener('click', function() {
            navItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            // Update marker position
            const index = Array.from(navItems).indexOf(this);
            marker.style.left = `${index * 100 / navItems.length}%`;
        });
    });

    // Set initial marker position
    const activeItem = document.querySelector('.navbar-enhanced ul li.active');
    if (activeItem) {
        const index = Array.from(navItems).indexOf(activeItem);
        marker.style.left = `${index * 100 / navItems.length}%`;
    }
}

// ===================== SECOND NAVBAR ACTIVE STATE =====================
function initSecondNavbar() {
    const secondNavLinks = document.querySelectorAll('.second-navbar .nav-link');
    
    secondNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            secondNavLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
}

// ===================== SMOOTH SCROLLING =====================
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ===================== GALLERY FUNCTIONALITY =====================
function initGallery() {
    const filterButtons = document.querySelectorAll('.gallery-filters .btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    
    if (filterButtons.length === 0) return;
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            const filterValue = this.getAttribute('data-filter');
            
            // Filter gallery items
            galleryItems.forEach(item => {
                if (filterValue === '*' || item.getAttribute('data-category') === filterValue) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 100);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.8)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });
    
    // Add click animation to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Show image in lightbox
            const imgSrc = this.querySelector('img').src;
            const caption = this.querySelector('.gallery-caption h4')?.textContent || 'Image';
            showImageLightbox(imgSrc, caption);
        });
    });
}

// ===================== LIGHTBOX FUNCTIONALITY =====================
function showImageLightbox(imgSrc, caption) {
    // Create lightbox element
    const lightbox = document.createElement('div');
    lightbox.className = 'lightbox';
    lightbox.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.9);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
    `;
    
    lightbox.innerHTML = `
        <div class="lightbox-content" style="max-width: 90%; max-height: 90%; position: relative;">
            <img src="${imgSrc}" alt="${caption}" style="max-width: 100%; max-height: 100%; border-radius: 10px;">
            <div class="lightbox-caption" style="color: white; text-align: center; margin-top: 15px; font-size: 1.2rem;">${caption}</div>
            <button class="lightbox-close" style="position: absolute; top: -40px; right: 0; background: none; border: none; color: white; font-size: 2rem; cursor: pointer;">×</button>
        </div>
    `;
    
    document.body.appendChild(lightbox);
    
    // Animate in
    setTimeout(() => {
        lightbox.style.opacity = '1';
    }, 10);
    
    // Close lightbox on click
    lightbox.addEventListener('click', function(e) {
        if (e.target === lightbox || e.target.classList.contains('lightbox-close')) {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                if (lightbox.parentNode) {
                    document.body.removeChild(lightbox);
                }
            }, 300);
        }
    });
    
    // Close on ESC key
    document.addEventListener('keydown', function closeLightbox(e) {
        if (e.key === 'Escape') {
            lightbox.style.opacity = '0';
            setTimeout(() => {
                if (lightbox.parentNode) {
                    document.body.removeChild(lightbox);
                }
            }, 300);
            document.removeEventListener('keydown', closeLightbox);
        }
    });
}

// ===================== HOW IT WORKS SECTION =====================
function initHowItWorks() {
    const steps = document.querySelectorAll('.works-step');
    
    if (steps.length === 0) return;
    
    // Add intersection observer for step animations
    const stepObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate step number
                const stepNumber = entry.target.querySelector('.step-number');
                if (stepNumber) {
                    stepNumber.style.animation = 'bounceIn 0.8s ease forwards';
                }
            }
        });
    }, { threshold: 0.3 });
    
    steps.forEach(step => {
        step.style.opacity = '0';
        step.style.transform = 'translateY(30px)';
        step.style.transition = 'all 0.6s ease';
        stepObserver.observe(step);
    });
    
    // Add hover effects to step content
    const stepContents = document.querySelectorAll('.step-content');
    stepContents.forEach(content => {
        content.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
        });
        
        content.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(-5px) scale(1)';
        });
    });
}

// ===================== PRICING SECTION =====================
function initPricing() {
    const pricingCards = document.querySelectorAll('.pricing-card');
    const pricingButtons = document.querySelectorAll('.pricing-cta .btn');
    const monthlyRadio = document.getElementById('monthly');
    const yearlyRadio = document.getElementById('yearly');
    
    if (pricingCards.length === 0) return;

    // Add hover animations to pricing cards
    pricingCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            if (!this.classList.contains('popular')) {
                this.style.transform = 'translateY(-15px) scale(1.03)';
            } else {
                this.style.transform = 'translateY(-15px) scale(1.08)';
            }
        });
        
        card.addEventListener('mouseleave', function() {
            if (!this.classList.contains('popular')) {
                this.style.transform = 'translateY(-10px) scale(1)';
            } else {
                this.style.transform = 'translateY(-10px) scale(1.05)';
            }
        });
    });
    
    // Add click handlers to pricing buttons
    pricingButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const card = this.closest('.pricing-card');
            const planName = card.querySelector('.pricing-title').textContent;
            const price = card.querySelector('.pricing-amount').textContent;
            
            // Show selection animation
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="loading-spinner"></div> Processing...';
            this.disabled = true;
            
            setTimeout(() => {
                this.innerHTML = 'Selected!';
                this.classList.remove('btn-primary', 'btn-outline-primary');
                this.classList.add('btn-success');
                
                // Show confirmation message
                showNotification(`You've selected the ${planName} plan for ${price} per month!`, 'success');
                
                // Reset button after delay
                setTimeout(() => {
                    this.innerHTML = originalHTML;
                    this.classList.remove('btn-success');
                    this.classList.add(originalHTML.includes('btn-outline-primary') ? 'btn-outline-primary' : 'btn-primary');
                    this.disabled = false;
                }, 2000);
            }, 1500);
        });
    });
    
    // Monthly/Yearly toggle functionality
    if (monthlyRadio && yearlyRadio) {
        monthlyRadio.addEventListener('change', updatePricing);
        yearlyRadio.addEventListener('change', updatePricing);
    }
    
    function updatePricing() {
        const isYearly = yearlyRadio.checked;
        const pricingAmounts = document.querySelectorAll('.pricing-amount');
        const pricingPeriods = document.querySelectorAll('.pricing-period');
        
        pricingAmounts.forEach(amount => {
            const monthlyPrice = parseFloat(amount.getAttribute('data-monthly'));
            if (isYearly) {
                const yearlyPrice = monthlyPrice * 12 * 0.8; // 20% discount
                amount.textContent = `৳${yearlyPrice.toLocaleString('en-BD')}`;
            } else {
                amount.textContent = `৳${monthlyPrice.toLocaleString('en-BD')}`;
            }
        });
        
        pricingPeriods.forEach(period => {
            period.textContent = isYearly ? '/year' : '/month';
        });
    }
    
    // Initialize pricing data
    document.querySelectorAll('.pricing-amount').forEach(amount => {
        const priceText = amount.textContent.replace('৳', '').replace(',', '');
        amount.setAttribute('data-monthly', parseFloat(priceText));
    });
}

// ===================== CONTACT FORM =====================
function initContactForm() {
    const contactForm = document.querySelector('.contact-form');
    const contactMethods = document.querySelectorAll('.contact-method');
    
    if (!contactForm) return;

    // Add hover animations to contact methods
    contactMethods.forEach(method => {
        method.addEventListener('mouseenter', function() {
            const icon = this.querySelector('.contact-icon');
            if (icon) {
                icon.style.transform = 'scale(1.1) rotate(5deg)';
                icon.style.background = 'var(--accent-color)';
            }
        });
        
        method.addEventListener('mouseleave', function() {
            const icon = this.querySelector('.contact-icon');
            if (icon) {
                icon.style.transform = 'scale(1) rotate(0)';
                icon.style.background = 'var(--primary-color)';
            }
        });
        
        // Add click functionality
        method.addEventListener('click', function() {
            const type = this.getAttribute('data-type');
            const valueElement = this.querySelector('.contact-details p');
            const value = valueElement ? valueElement.textContent : '';
            
            switch(type) {
                case 'phone':
                    showNotification(`Calling: ${value}`, 'info');
                    break;
                case 'email':
                    window.location.href = `mailto:${value}`;
                    break;
                case 'address':
                    showNotification(`Opening location: ${value}`, 'info');
                    break;
                case 'chat':
                    toggleChatbot();
                    break;
            }
        });
    });
    
    // Contact form handling
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const submitButton = this.querySelector('button[type="submit"]');
        
        // Show loading state
        const originalText = submitButton.innerHTML;
        submitButton.innerHTML = '<div class="loading-spinner"></div> Sending...';
        submitButton.disabled = true;
        
        // Simulate form submission
        setTimeout(() => {
            showNotification('Thank you for your message! We will get back to you soon.', 'success');
            contactForm.reset();
            
            // Reset button
            submitButton.innerHTML = originalText;
            submitButton.disabled = false;
        }, 2000);
    });
}

// ===================== CHATBOT FUNCTIONALITY =====================
function initChatbot() {
    const chatbotToggle = document.getElementById('chatbotToggle');
    const chatbotContainer = document.getElementById('chatbotContainer');
    const chatbotClose = document.getElementById('chatbotClose');
    const chatbotSend = document.getElementById('chatbotSend');
    const chatbotInput = document.getElementById('chatbotInput');
    const chatbotMessages = document.getElementById('chatbotMessages');

    if (!chatbotToggle || !chatbotContainer) return;

    chatbotToggle.addEventListener('click', toggleChatbot);
    
    if (chatbotClose) {
        chatbotClose.addEventListener('click', toggleChatbot);
    }

    if (chatbotSend && chatbotInput) {
        chatbotSend.addEventListener('click', sendChatbotMessage);
        chatbotInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                sendChatbotMessage();
            }
        });
    }

    function toggleChatbot() {
        chatbotContainer.classList.toggle('active');
        isChatbotOpen = chatbotContainer.classList.contains('active');
        
        if (isChatbotOpen) {
            // Stop pulsing animation when chatbot is open
            chatbotToggle.classList.remove('pulse');
            if (chatbotInput) chatbotInput.focus();
        } else {
            // Resume pulsing animation when chatbot is closed
            setTimeout(() => {
                chatbotToggle.classList.add('pulse');
            }, 1000);
        }
    }

    function sendChatbotMessage() {
        if (!chatbotInput || !chatbotMessages) return;
        
        const message = chatbotInput.value.trim();
        
        if (message === '') return;
        
        // Add user message
        addMessage(message, true);
        
        // Clear input
        chatbotInput.value = '';
        
        // Show typing indicator
        const typingIndicator = showTypingIndicator();
        
        // Simulate processing time
        setTimeout(() => {
            hideTypingIndicator(typingIndicator);
            
            // Get bot response
            const response = getChatbotResponse(message);
            addMessage(response);
        }, 1000 + Math.random() * 1000);
    }

    function addMessage(text, isUser = false) {
        if (!chatbotMessages) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
        messageDiv.textContent = text;
        chatbotMessages.appendChild(messageDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    function showTypingIndicator() {
        if (!chatbotMessages) return null;
        
        const typingDiv = document.createElement('div');
        typingDiv.className = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
        `;
        chatbotMessages.appendChild(typingDiv);
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
        return typingDiv;
    }

    function hideTypingIndicator(typingDiv) {
        if (typingDiv && typingDiv.parentNode) {
            typingDiv.parentNode.removeChild(typingDiv);
        }
    }

    function getChatbotResponse(message) {
        const lowerMessage = message.toLowerCase();
        
        if (lowerMessage.includes('hello') || lowerMessage.includes('hi')) {
            return "Hello! I'm Mr. Bank, your virtual banking assistant. How can I help you today?";
        } else if (lowerMessage.includes('account') || lowerMessage.includes('open account')) {
            return "To open an account, you can visit any of our branches or use our online application. Would you like me to guide you through the process?";
        } else if (lowerMessage.includes('loan') || lowerMessage.includes('mortgage')) {
            return "We offer various loan options including personal loans, home loans, and business loans. What type of loan are you interested in?";
        } else if (lowerMessage.includes('interest rate') || lowerMessage.includes('rate')) {
            return "Our current interest rates vary by product. For savings accounts, we offer up to 4.5% APY. Would you like specific information about a particular product?";
        } else if (lowerMessage.includes('contact') || lowerMessage.includes('support')) {
            return "You can reach our customer support team at 1-800-NEOVAULT or via email at support@neovault.com. Our representatives are available 24/7.";
        } else if (lowerMessage.includes('branch') || lowerMessage.includes('location')) {
            return "We have over 500 branches nationwide. You can find the nearest branch using our branch locator on our website. Would you like me to help you find one?";
        } else if (lowerMessage.includes('mobile') || lowerMessage.includes('app')) {
            return "Our mobile banking app is available for both iOS and Android. You can download it from the App Store or Google Play Store.";
        } else if (lowerMessage.includes('thank') || lowerMessage.includes('thanks')) {
            return "You're welcome! Is there anything else I can help you with today?";
        } else {
            return "I'm here to help with your banking needs. You can ask me about accounts, loans, interest rates, or our services. How can I assist you?";
        }
    }
}

// ===================== NOTIFICATION SYSTEM =====================
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type} alert-dismissible fade show`;
    
    notification.innerHTML = `
        <strong>${type.charAt(0).toUpperCase() + type.slice(1)}!</strong> ${message}
        <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
    `;
    
    // Add custom styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        border: none;
        border-radius: 10px;
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 5000);
}

// ===================== ANIMATIONS AND SCROLL EFFECTS =====================
function initAnimations() {
    const animatedElements = document.querySelectorAll('.gallery-item, .works-step, .pricing-card, .contact-method, .employee-card, .bank-goal, .service-card, .notice-item');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-in-up');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

// ===================== BUSINESS CARD FLIP ANIMATION =====================
function initBusinessCards() {
    const businessCards = document.querySelectorAll('.business-card');
    
    businessCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'rotateY(180deg)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'rotateY(0deg)';
        });
    });
}

// ===================== FORM VALIDATION =====================
function initFormValidation() {
    // Add form validation to all forms
    document.querySelectorAll('form').forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('is-invalid');
                    
                    // Add error message
                    if (!field.nextElementSibling || !field.nextElementSibling.classList.contains('invalid-feedback')) {
                        const errorDiv = document.createElement('div');
                        errorDiv.className = 'invalid-feedback';
                        errorDiv.textContent = 'This field is required';
                        field.parentNode.appendChild(errorDiv);
                    }
                } else {
                    field.classList.remove('is-invalid');
                    const errorDiv = field.nextElementSibling;
                    if (errorDiv && errorDiv.classList.contains('invalid-feedback')) {
                        errorDiv.remove();
                    }
                }
            });
            
            if (!isValid) {
                e.preventDefault();
                showNotification('Please fill all required fields', 'danger');
            }
        });
    });
}

// ===================== LOADING SPINNER =====================
function showLoading(element) {
    if (element) {
        const originalHTML = element.innerHTML;
        element.innerHTML = '<div class="loading-spinner"></div>';
        element.disabled = true;
        return originalHTML;
    }
    return null;
}

function hideLoading(element, originalHTML) {
    if (element && originalHTML) {
        element.innerHTML = originalHTML;
        element.disabled = false;
    }
}

// ===================== UTILITY FUNCTIONS =====================
function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// ===================== INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initDarkMode();
    initNotifications();
    initUserDropdown();
    initSearch();
    initSocialLogin();
    initEnhancedNavigation();
    initSecondNavbar();
    initSmoothScrolling();
    initGallery();
    initHowItWorks();
    initPricing();
    initContactForm();
    initChatbot();
    initAnimations();
    initBusinessCards();
    initFormValidation();
    
    // Add any additional initialization here
    
    console.log('NeoVault Bank JavaScript initialized successfully');
});

// ===================== GLOBAL EXPORTS =====================
// Make functions available globally
window.showNotification = showNotification;
window.toggleChatbot = toggleChatbot;
window.showImageLightbox = showImageLightbox;
window.formatCurrency = formatCurrency;
window.formatDate = formatDate;
window.showLoading = showLoading;
window.hideLoading = hideLoading;