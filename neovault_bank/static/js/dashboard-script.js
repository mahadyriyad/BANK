function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const dashboardSidebar = document.querySelector('.dashboard-sidebar');
    
    if (mobileMenuToggle && dashboardSidebar) {
        if (window.innerWidth <= 768) {
            mobileMenuToggle.style.display = 'block';
            
            mobileMenuToggle.addEventListener('click', function() {
                dashboardSidebar.classList.toggle('mobile-open');
            });
            
            // Close sidebar when clicking outside
            document.addEventListener('click', function(e) {
                if (!dashboardSidebar.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
                    dashboardSidebar.classList.remove('mobile-open');
                }
            });
        }
        
        // Update mobile menu on resize
        window.addEventListener('resize', function() {
            if (window.innerWidth <= 768) {
                mobileMenuToggle.style.display = 'block';
            } else {
                mobileMenuToggle.style.display = 'none';
                dashboardSidebar.classList.remove('mobile-open');
            }
        });
    }
}

// ===================== DASHBOARD CHARTS =====================
function initDashboardCharts() {
   
    // Example: Balance trend chart
    const balanceChart = document.getElementById('balanceChart');
    if (balanceChart) {
        // Initialize chart using Chart.js or similar library
        console.log('Initializing balance chart...');
    }
    
    // Example: Spending by category chart
    const spendingChart = document.getElementById('spendingChart');
    if (spendingChart) {
        // Initialize chart
        console.log('Initializing spending chart...');
    }
}

// ===================== QUICK ACTIONS =====================
function initQuickActions() {
    const quickActionButtons = document.querySelectorAll('.action-card, .quick-action-btn');
    
    quickActionButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const actionText = this.querySelector('span')?.textContent || this.textContent;
            showNotification(`Initiating: ${actionText}`, 'info');
            
            // Add loading state
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="loading-spinner"></div>';
            
            setTimeout(() => {
                this.innerHTML = originalHTML;
                // Navigate to appropriate page or show modal
                handleQuickAction(actionText);
            }, 1000);
        });
    });
    
    function handleQuickAction(action) {
        switch(action.toLowerCase()) {
            case 'deposit':
                window.location.href = '/deposit/';
                break;
            case 'withdraw':
                window.location.href = '/withdraw/';
                break;
            case 'transfer':
                window.location.href = '/transfer/';
                break;
            case 'pay bills':
                window.location.href = '/bills/';
                break;
            case 'credit cards':
                window.location.href = '/credit-cards/';
                break;
            case 'savings goals':
                window.location.href = '/savings-goals/';
                break;
            default:
                // Default action
                break;
        }
    }
}

// ===================== TRANSACTION FILTERS =====================
function initTransactionFilters() {
    const filterButtons = document.querySelectorAll('.transaction-filter');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Filter transactions
            filterTransactions(filter);
        });
    });
    
    function filterTransactions(filter) {
        const transactions = document.querySelectorAll('.transaction-item');
        
        transactions.forEach(transaction => {
            if (filter === 'all') {
                transaction.style.display = 'flex';
            } else {
                const transactionType = transaction.classList.contains('withdrawal') ? 'withdrawal' : 'deposit';
                if (transactionType === filter) {
                    transaction.style.display = 'flex';
                } else {
                    transaction.style.display = 'none';
                }
            }
        });
    }
}

// ===================== ACCOUNT MANAGEMENT =====================
function initAccountManagement() {
    // Account balance toggle
    const balanceToggle = document.querySelector('.balance-toggle');
    if (balanceToggle) {
        balanceToggle.addEventListener('click', function() {
            const balanceElements = document.querySelectorAll('.balance, .account-balance');
            let isHidden = balanceElements[0]?.textContent.includes('***');
            
            balanceElements.forEach(element => {
                if (isHidden) {
                    // Show actual balance (in real app, this would come from backend)
                    element.textContent = element.getAttribute('data-balance') || '$1,234.56';
                } else {
                    // Hide balance
                    element.setAttribute('data-balance', element.textContent);
                    element.textContent = '***';
                }
            });
            
            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
    
    // Quick transfer between accounts
    const quickTransferForm = document.getElementById('quickTransferForm');
    if (quickTransferForm) {
        quickTransferForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalHTML = submitBtn.innerHTML;
            submitBtn.innerHTML = '<div class="loading-spinner"></div> Processing...';
            submitBtn.disabled = true;
            
            // Simulate transfer processing
            setTimeout(() => {
                showNotification('Transfer completed successfully!', 'success');
                this.reset();
                submitBtn.innerHTML = originalHTML;
                submitBtn.disabled = false;
            }, 2000);
        });
    }
}

// ===================== BILL PAYMENT =====================
function initBillPayment() {
    const payBillButtons = document.querySelectorAll('.pay-bill-btn');
    
    payBillButtons.forEach(button => {
        button.addEventListener('click', function() {
            const billId = this.getAttribute('data-bill-id');
            const billName = this.closest('.bill-item').querySelector('h5').textContent;
            const billAmount = this.closest('.bill-item').querySelector('.bill-amount').textContent;
            
            // Show payment confirmation
            if (confirm(`Pay ${billAmount} for ${billName}?`)) {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<div class="loading-spinner"></div>';
                this.disabled = true;
                
                // Simulate payment processing
                setTimeout(() => {
                    showNotification(`Payment of ${billAmount} for ${billName} completed successfully!`, 'success');
                    this.innerHTML = '<i class="fas fa-check"></i> Paid';
                    this.classList.remove('btn-success');
                    this.classList.add('btn-secondary');
                    this.disabled = true;
                }, 1500);
            }
        });
    });
}

// ===================== SAVINGS GOALS PROGRESS =====================
function initSavingsGoals() {
    const addFundsButtons = document.querySelectorAll('.add-funds-btn');
    
    addFundsButtons.forEach(button => {
        button.addEventListener('click', function() {
            const goalId = this.getAttribute('data-goal-id');
            const goalName = this.closest('.goal-item').querySelector('h5').textContent;
            
            // Show add funds modal or prompt
            const amount = prompt(`How much would you like to add to "${goalName}"?`);
            
            if (amount && !isNaN(parseFloat(amount))) {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<div class="loading-spinner"></div>';
                this.disabled = true;
                
                // Simulate adding funds
                setTimeout(() => {
                    showNotification(`Successfully added $${amount} to ${goalName}`, 'success');
                    this.innerHTML = originalHTML;
                    this.disabled = false;
                    
                    // In a real app, you would update the progress bar and amounts
                    updateGoalProgress(goalId, parseFloat(amount));
                }, 1000);
            }
        });
    });
    
    function updateGoalProgress(goalId, amount) {
        // This would update the UI to reflect the new progress
        const goalItem = document.querySelector(`[data-goal-id="${goalId}"]`).closest('.goal-item');
        const progressBar = goalItem.querySelector('.progress-bar');
        const currentAmountElement = goalItem.querySelector('.current-amount');
        
        // Update current amount (in real app, this would come from backend)
        const currentAmount = parseFloat(currentAmountElement.textContent.replace('$', '')) + amount;
        currentAmountElement.textContent = `$${currentAmount.toFixed(2)}`;
        
        // Update progress bar (in real app, calculate based on target)
        const newWidth = Math.min(100, (currentAmount / 1000) * 100); // Example calculation
        progressBar.style.width = `${newWidth}%`;
        progressBar.textContent = `${Math.round(newWidth)}%`;
    }
}

// ===================== CREDIT CARD MANAGEMENT =====================
function initCreditCardManagement() {
    // Card security toggle
    const cardLockButtons = document.querySelectorAll('.card-lock-btn');
    
    cardLockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardElement = this.closest('.credit-card');
            const isLocked = cardElement.classList.contains('locked');
            
            if (isLocked) {
                // Unlock card
                cardElement.classList.remove('locked');
                this.innerHTML = '<i class="fas fa-lock"></i>';
                showNotification('Card unlocked successfully', 'success');
            } else {
                // Lock card
                cardElement.classList.add('locked');
                this.innerHTML = '<i class="fas fa-lock-open"></i>';
                showNotification('Card locked successfully', 'warning');
            }
        });
    });
    
    // Credit limit increase request
    const limitIncreaseBtn = document.getElementById('limitIncreaseBtn');
    if (limitIncreaseBtn) {
        limitIncreaseBtn.addEventListener('click', function() {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="loading-spinner"></div> Requesting...';
            this.disabled = true;
            
            setTimeout(() => {
                showNotification('Credit limit increase request submitted for review', 'info');
                this.innerHTML = originalHTML;
                this.disabled = false;
            }, 2000);
        });
    }
}

// ===================== DASHBOARD WIDGETS =====================
function initDashboardWidgets() {
    // Refresh data button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', function() {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="loading-spinner"></div>';
            this.disabled = true;
            
            // Simulate data refresh
            setTimeout(() => {
                showNotification('Dashboard data updated', 'success');
                this.innerHTML = originalHTML;
                this.disabled = false;
                
                // In real app, you would fetch new data and update widgets
                updateDashboardData();
            }, 1500);
        });
    }
    
    // Widget customization
    const widgetSettings = document.querySelectorAll('.widget-settings');
    widgetSettings.forEach(setting => {
        setting.addEventListener('click', function(e) {
            e.stopPropagation();
            const widget = this.closest('.dashboard-widget');
            // Show widget settings modal or menu
            showNotification('Widget settings would open here', 'info');
        });
    });
}

function updateDashboardData() {
    // This function would update all dashboard widgets with new data
    console.log('Updating dashboard data...');
    
    // Update balance
    const balanceElement = document.querySelector('.total-balance');
    if (balanceElement) {
        // In real app, this would come from an API call
        balanceElement.textContent = formatCurrency(12345.67);
    }
    
    // Update recent transactions
    // This would refresh the transactions list
}

// ===================== EXPENSE CATEGORIZATION =====================
function initExpenseCategorization() {
    const transactions = document.querySelectorAll('.transaction-item');
    
    transactions.forEach(transaction => {
        transaction.addEventListener('dblclick', function() {
            const currentCategory = this.getAttribute('data-category') || 'uncategorized';
            const newCategory = prompt('Enter category for this transaction:', currentCategory);
            
            if (newCategory) {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<div class="loading-spinner"></div>';
                
                // Simulate category update
                setTimeout(() => {
                    this.setAttribute('data-category', newCategory);
                    const categoryBadge = this.querySelector('.transaction-category') || document.createElement('span');
                    categoryBadge.className = 'transaction-category badge bg-secondary ms-2';
                    categoryBadge.textContent = newCategory;
                    
                    if (!this.querySelector('.transaction-category')) {
                        this.querySelector('.transaction-info').appendChild(categoryBadge);
                    }
                    
                    this.innerHTML = originalHTML;
                    this.querySelector('.transaction-info').appendChild(categoryBadge);
                    
                    showNotification('Transaction categorized successfully', 'success');
                }, 1000);
            }
        });
    });
}

// ===================== DASHBOARD INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initDashboardCharts();
    initQuickActions();
    initTransactionFilters();
    initAccountManagement();
    initBillPayment();
    initSavingsGoals();
    initCreditCardManagement();
    initDashboardWidgets();
    initExpenseCategorization();
    
    console.log('Dashboard JavaScript initialized successfully');
});

// Make dashboard functions available globally
window.updateDashboardData = updateDashboardData;