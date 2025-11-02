// Main Application JavaScript
class NeoVaultBank {
    constructor() {
        this.init();
    }

    init() {
        this.initLoading();
        this.initNotifications();
        this.initAnimations();
        this.initEventListeners();
        this.initCharts();
    }

    initLoading() {
        // Hide loading spinner after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                const spinner = document.getElementById('loadingSpinner');
                if (spinner) {
                    spinner.classList.add('hidden');
                    setTimeout(() => spinner.remove(), 500);
                }
            }, 1000);
        });
    }

    initNotifications() {
        // Notification system
        window.showNotification = (message, type = 'info', duration = 5000) => {
            const notification = document.createElement('div');
            notification.className = `notification ${type}`;
            notification.innerHTML = `
                <div class="d-flex align-items-center">
                    <i class="fas fa-${this.getNotificationIcon(type)} me-2"></i>
                    <span>${message}</span>
                </div>
            `;
            
            document.body.appendChild(notification);
            
            setTimeout(() => notification.classList.add('show'), 100);
            
            setTimeout(() => {
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }, duration);
        };

        // Auto-hide notifications on click
        document.addEventListener('click', (e) => {
            if (e.target.closest('.notification')) {
                const notification = e.target.closest('.notification');
                notification.classList.remove('show');
                setTimeout(() => notification.remove(), 300);
            }
        });
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    initAnimations() {
        // Add animation classes to elements
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                    observer.unobserve(entry.target);
                }
            });
        }, observerOptions);

        // Observe all cards and sections
        document.querySelectorAll('.card, .section, .operation-card').forEach(el => {
            observer.observe(el);
        });
    }

    initEventListeners() {
        // Global click handlers
        document.addEventListener('click', (e) => {
            // Print receipt buttons
            if (e.target.closest('.print-receipt')) {
                this.printReceipt(e);
            }
            
            // Export buttons
            if (e.target.closest('.export-data')) {
                this.exportData(e);
            }
            
            // Quick action buttons
            if (e.target.closest('.quick-action')) {
                this.handleQuickAction(e);
            }
        });

        // Form submissions
        document.addEventListener('submit', (e) => {
            if (e.target.matches('form')) {
                this.handleFormSubmit(e);
            }
        });
    }

    initCharts() {
        // Initialize dashboard charts if they exist
        const balanceChart = document.getElementById('balanceChart');
        if (balanceChart) {
            this.initBalanceChart();
        }

        const spendingChart = document.getElementById('spendingChart');
        if (spendingChart) {
            this.initSpendingChart();
        }
    }

    initBalanceChart() {
        const ctx = document.getElementById('balanceChart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                datasets: [{
                    label: 'Account Balance',
                    data: [5000, 6500, 7200, 6800, 8500, 9200],
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }

    initSpendingChart() {
        const ctx = document.getElementById('spendingChart').getContext('2d');
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Shopping', 'Bills', 'Food', 'Entertainment', 'Transport'],
                datasets: [{
                    data: [30, 25, 20, 15, 10],
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    printReceipt(e) {
        const button = e.target.closest('.print-receipt');
        const transactionData = {
            id: button.dataset.transactionId,
            type: button.dataset.transactionType,
            amount: button.dataset.amount,
            date: new Date().toLocaleString(),
            fromAccount: button.dataset.fromAccount,
            toAccount: button.dataset.toAccount,
            description: button.dataset.description
        };

        if (window.PrintUtils) {
            window.PrintUtils.printTransactionReceipt(transactionData);
        } else {
            showNotification('Print functionality is not available', 'warning');
        }
    }

    exportData(e) {
        const button = e.target.closest('.export-data');
        const dataType = button.dataset.type;
        const filename = button.dataset.filename;

        // Simulate data export
        showNotification(`Exporting ${dataType} data...`, 'info');
        
        setTimeout(() => {
            showNotification(`${dataType} data exported successfully as ${filename}`, 'success');
        }, 1500);
    }

    handleQuickAction(e) {
        const action = e.target.closest('.quick-action');
        const actionType = action.dataset.action;
        
        // Add loading animation
        const originalHTML = action.innerHTML;
        action.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
        action.disabled = true;

        setTimeout(() => {
            action.innerHTML = originalHTML;
            action.disabled = false;
            
            switch(actionType) {
                case 'deposit':
                    window.location.href = '/deposit/';
                    break;
                case 'withdraw':
                    window.location.href = '/withdraw/';
                    break;
                case 'transfer':
                    window.location.href = '/transfer/';
                    break;
                case 'bills':
                    window.location.href = '/bills/';
                    break;
                case 'credit-cards':
                    window.location.href = '/credit-cards/';
                    break;
                case 'savings-goals':
                    window.location.href = '/savings-goals/';
                    break;
            }
        }, 1000);
    }

    handleFormSubmit(e) {
        const form = e.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        
        // Add loading state
        const originalHTML = submitBtn.innerHTML;
        submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
        submitBtn.disabled = true;

        // Simulate API call
        setTimeout(() => {
            submitBtn.innerHTML = originalHTML;
            submitBtn.disabled = false;
            
            // Show success message
            showNotification('Transaction completed successfully!', 'success');
            
            // Reset form
            form.reset();
        }, 2000);
        
        e.preventDefault();
    }

    // Utility method to format currency
    formatCurrency(amount, currency = 'BDT') {
        return new Intl.NumberFormat('en-BD', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    // Utility method to generate random transaction ID
    generateTransactionId() {
        return 'NV' + Date.now() + Math.random().toString(36).substr(2, 9).toUpperCase();
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    window.NeoVaultApp = new NeoVaultBank();
    console.log('NeoVault Bank Application Initialized');
});

// Global utility functions
function showLoading(element) {
    if (element) {
        element.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
        element.disabled = true;
    }
}

function hideLoading(element, originalHTML) {
    if (element) {
        element.innerHTML = originalHTML;
        element.disabled = false;
    }
}

// AJAX utility function
function makeApiRequest(url, data, method = 'POST') {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // Simulate API response
            const response = {
                success: true,
                message: 'Operation completed successfully',
                data: {
                    transaction_id: 'NV' + Date.now(),
                    new_balance: Math.random() * 10000 + 1000,
                    timestamp: new Date().toISOString()
                }
            };
            resolve(response);
        }, 1500);
    });
}