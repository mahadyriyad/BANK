// ===================== UTILITY FUNCTIONS =====================

// Date and Time Utilities
const DateUtils = {
    formatDate: (date, format = 'short') => {
        const options = {
            short: { year: 'numeric', month: 'short', day: 'numeric' },
            long: { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' },
            time: { hour: '2-digit', minute: '2-digit' }
        };
        
        return new Date(date).toLocaleDateString('en-US', options[format] || options.short);
    },
    
    formatRelativeTime: (date) => {
        const now = new Date();
        const diffTime = Math.abs(now - new Date(date));
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return `${Math.floor(diffDays / 30)} months ago`;
    },
    
    isToday: (date) => {
        const today = new Date();
        const checkDate = new Date(date);
        return today.toDateString() === checkDate.toDateString();
    }
};

// Number and Currency Utilities
const NumberUtils = {
    formatCurrency: (amount, currency = 'USD', locale = 'en-US') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency
        }).format(amount);
    },
    
    formatNumber: (number, decimals = 2) => {
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(number);
    },
    
    abbreviateNumber: (number) => {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(1) + 'M';
        }
        if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    },
    
    generateAccountNumber: () => {
        return 'NV' + Date.now().toString().slice(-8) + Math.floor(Math.random() * 100).toString().padStart(2, '0');
    }
};

// Validation Utilities
const ValidationUtils = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    phone: (phone) => {
        const re = /^[\+]?[1-9][\d]{0,15}$/;
        return re.test(phone.replace(/[\s\-\(\)]/g, ''));
    },
    
    password: (password) => {
        // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
        const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return re.test(password);
    },
    
    creditCard: (number) => {
        // Luhn algorithm implementation
        let sum = 0;
        let isEven = false;
        
        for (let i = number.length - 1; i >= 0; i--) {
            let digit = parseInt(number.charAt(i), 10);
            
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
    }
};

// Local Storage Utilities
const StorageUtils = {
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error saving to localStorage:', error);
            return false;
        }
    },
    
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return defaultValue;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// API Utilities
const ApiUtils = {
    request: async (url, options = {}) => {
        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            ...options
        };
        
        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            return { success: true, data };
        } catch (error) {
            console.error('API request failed:', error);
            return { success: false, error: error.message };
        }
    },
    
    get: (url, options = {}) => {
        return ApiUtils.request(url, { ...options, method: 'GET' });
    },
    
    post: (url, data, options = {}) => {
        return ApiUtils.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    },
    
    put: (url, data, options = {}) => {
        return ApiUtils.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    },
    
    delete: (url, options = {}) => {
        return ApiUtils.request(url, { ...options, method: 'DELETE' });
    }
};

// DOM Utilities
const DomUtils = {
    createElement: (tag, classes = '', content = '') => {
        const element = document.createElement(tag);
        if (classes) element.className = classes;
        if (content) element.innerHTML = content;
        return element;
    },
    
    show: (element) => {
        if (element) element.style.display = '';
    },
    
    hide: (element) => {
        if (element) element.style.display = 'none';
    },
    
    toggle: (element) => {
        if (element) {
            element.style.display = element.style.display === 'none' ? '' : 'none';
        }
    },
    
    addClass: (element, className) => {
        if (element) element.classList.add(className);
    },
    
    removeClass: (element, className) => {
        if (element) element.classList.remove(className);
    },
    
    toggleClass: (element, className) => {
        if (element) element.classList.toggle(className);
    }
};

// Animation Utilities
const AnimationUtils = {
    fadeIn: (element, duration = 300) => {
        if (!element) return;
        
        element.style.opacity = '0';
        element.style.display = '';
        
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            }
        }
        
        window.requestAnimationFrame(step);
    },
    
    fadeOut: (element, duration = 300) => {
        if (!element) return;
        
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - progress / duration, 0);
            
            element.style.opacity = opacity.toString();
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.display = 'none';
            }
        }
        
        window.requestAnimationFrame(step);
    },
    
    slideDown: (element, duration = 300) => {
        if (!element) return;
        
        element.style.maxHeight = '0';
        element.style.overflow = 'hidden';
        element.style.display = '';
        
        const targetHeight = element.scrollHeight + 'px';
        
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.min(progress / duration, 1);
            
            element.style.maxHeight = (percentage * parseInt(targetHeight)) + 'px';
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.maxHeight = '';
                element.style.overflow = '';
            }
        }
        
        window.requestAnimationFrame(step);
    },
    
    slideUp: (element, duration = 300) => {
        if (!element) return;
        
        const startHeight = element.scrollHeight + 'px';
        element.style.maxHeight = startHeight;
        element.style.overflow = 'hidden';
        
        let start = null;
        function step(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const percentage = Math.max(1 - progress / duration, 0);
            
            element.style.maxHeight = (percentage * parseInt(startHeight)) + 'px';
            
            if (progress < duration) {
                window.requestAnimationFrame(step);
            } else {
                element.style.display = 'none';
                element.style.maxHeight = '';
                element.style.overflow = '';
            }
        }
        
        window.requestAnimationFrame(step);
    }
};

// Export utilities to global scope
window.DateUtils = DateUtils;
window.NumberUtils = NumberUtils;
window.ValidationUtils = ValidationUtils;
window.StorageUtils = StorageUtils;
window.ApiUtils = ApiUtils;
window.DomUtils = DomUtils;
window.AnimationUtils = AnimationUtils;