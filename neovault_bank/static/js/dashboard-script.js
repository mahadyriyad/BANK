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
function initializeDashboardCharts() {
    // Balance Trend Chart
    const balanceChart = document.getElementById('balanceChart');
    if (balanceChart) {
        const balanceCtx = balanceChart.getContext('2d');
        new Chart(balanceCtx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                datasets: [{
                    label: 'Account Balance',
                    data: [5000, 6500, 7200, 6800, 8500, 9200, 8800, 9500, 10200, 11000, 11500, 12000],
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
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Balance: ৳' + context.parsed.y.toLocaleString();
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            callback: function(value) {
                                return '৳' + value.toLocaleString();
                            }
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

    // Spending Chart
    const spendingChart = document.getElementById('spendingChart');
    if (spendingChart) {
        const spendingCtx = spendingChart.getContext('2d');
        new Chart(spendingCtx, {
            type: 'doughnut',
            data: {
                labels: ['Shopping', 'Bills', 'Food', 'Entertainment', 'Transport', 'Others'],
                datasets: [{
                    data: [25, 20, 18, 12, 10, 15],
                    backgroundColor: [
                        '#2563eb',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444',
                        '#8b5cf6',
                        '#6b7280'
                    ],
                    borderWidth: 0,
                    hoverOffset: 15
                }]
            },
            options: {
                responsive: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed + '%';
                            }
                        }
                    }
                }
            }
        });
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
            this.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';

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
                    // Show actual balance
                    element.textContent = element.getAttribute('data-balance') || '৳0.00';
                } else {
                    // Hide balance
                    element.setAttribute('data-balance', element.textContent);
                    element.textContent = '৳***';
                }
            });

            this.querySelector('i').classList.toggle('fa-eye');
            this.querySelector('i').classList.toggle('fa-eye-slash');
        });
    }
}

// ===================== BILL PAYMENT =====================
function initBillPayment() {
    const payBillButtons = document.querySelectorAll('.pay-bill-btn');

    payBillButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const billId = this.getAttribute('data-bill-id');
            const billItem = this.closest('.bill-item');
            const billName = billItem.querySelector('h5').textContent;
            const billAmount = billItem.querySelector('.bill-amount').textContent;

            // Show payment confirmation
            if (confirm(`Pay ${billAmount} for ${billName}?`)) {
                const originalHTML = this.innerHTML;
                this.innerHTML = '<div class="spinner-border spinner-border-sm"></div>';
                this.disabled = true;

                try {
                    const formData = new FormData();
                    formData.append('account_id', document.getElementById('paymentAccount')?.value || getFirstAccountId());

                    const response = await fetch(`/pay-bill/${billId}/`, {
                        method: 'POST',
                        headers: {
                            'X-CSRFToken': getCookie('csrftoken')
                        },
                        body: formData
                    });

                    const data = await response.json();

                    if (data.success) {
                        showNotification(data.message, 'success');
                        this.innerHTML = '<i class="fas fa-check"></i> Paid';
                        this.classList.remove('btn-success');
                        this.classList.add('btn-secondary');
                        this.disabled = true;
                        
                        // Update dashboard with new data
                        updateDashboardData(data);
                    } else {
                        showNotification(data.message, 'error');
                        this.innerHTML = originalHTML;
                        this.disabled = false;
                    }
                } catch (error) {
                    console.error('Error during bill payment:', error);
                    showNotification('An error occurred during bill payment.', 'error');
                    this.innerHTML = originalHTML;
                    this.disabled = false;
                }
            }
        });
    });
}

// ===================== SAVINGS GOALS PROGRESS =====================
function initSavingsGoals() {
    const addFundsButtons = document.querySelectorAll('.add-funds-btn');

    addFundsButtons.forEach(button => {
        button.addEventListener('click', async function() {
            const goalId = this.getAttribute('data-goal-id');
            const goalItem = this.closest('.savings-goal');
            const goalName = goalItem.querySelector('h4').textContent;

            // Show add funds modal
            const addFundsModalEl = document.getElementById('addFundsModal');
            if (addFundsModalEl) {
                const addFundsModal = new bootstrap.Modal(addFundsModalEl);
                
                // Set goal details in modal
                const currentAmount = goalItem.querySelector('.balance').textContent.split(' / ')[0];
                const targetAmount = goalItem.querySelector('.balance').textContent.split(' / ')[1];
                const progress = goalItem.querySelector('.progress-bar').style.width;

                document.getElementById('modalGoalName').value = goalName;
                document.getElementById('modalCurrentAmount').textContent = currentAmount;
                document.getElementById('modalTargetAmount').textContent = targetAmount;
                document.getElementById('modalProgressBar').style.width = progress;
                document.getElementById('modalProgressBar').textContent = progress;
                document.getElementById('modalGoalId').value = goalId;

                addFundsModal.show();
            }
        });
    });

    // Add funds form submission
    const addFundsForm = document.getElementById('addFundsForm');
    if (addFundsForm) {
        addFundsForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const goalId = document.getElementById('modalGoalId').value;
            const amount = document.getElementById('fundAmount').value;
            const accountId = document.getElementById('fundSource').value;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Adding...';
            submitBtn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('account_id', accountId);
                formData.append('amount', amount);

                const response = await fetch(`/add-savings-funds/${goalId}/`, {
                    method: 'POST',
                    headers: {
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: formData
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('addFundsModal')).hide();
                    this.reset();
                    
                    // Update dashboard with new data
                    updateDashboardData(data);
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Error adding funds to savings goal:', error);
                showNotification('An error occurred while adding funds.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ===================== CREDIT CARD MANAGEMENT =====================
function initCreditCardManagement() {
    // Card security toggle
    const cardLockButtons = document.querySelectorAll('.card-lock-btn');

    cardLockButtons.forEach(button => {
        button.addEventListener('click', function() {
            const cardId = this.getAttribute('data-card-id');
            const isLocked = this.classList.contains('locked');

            if (isLocked) {
                // Unlock card
                this.classList.remove('locked');
                this.innerHTML = '<i class="fas fa-lock me-1"></i>Lock';
                showNotification('Card unlocked successfully', 'success');
            } else {
                // Lock card
                this.classList.add('locked');
                this.innerHTML = '<i class="fas fa-lock-open me-1"></i>Unlock';
                showNotification('Card locked successfully', 'warning');
            }

            // In a real app, you would make an API call here to update the card status
        });
    });

    // Credit limit increase request
    const limitIncreaseBtn = document.getElementById('limitIncreaseBtn');
    if (limitIncreaseBtn) {
        limitIncreaseBtn.addEventListener('click', function() {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Requesting...';
            this.disabled = true;

            setTimeout(() => {
                showNotification('Credit limit increase request submitted for review', 'info');
                this.innerHTML = originalHTML;
                this.disabled = false;
            }, 2000);
        });
    }

    // Credit card payment
    const makePaymentBtn = document.getElementById('makePaymentBtn');
    if (makePaymentBtn) {
        makePaymentBtn.addEventListener('click', function() {
            const makePaymentModal = new bootstrap.Modal(document.getElementById('makePaymentModal'));
            makePaymentModal.show();
        });
    }

    // Credit card payment form
    const makePaymentForm = document.getElementById('makePaymentForm');
    if (makePaymentForm) {
        makePaymentForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const cardId = document.getElementById('paymentCardSelect').value;
            const amount = document.getElementById('paymentAmount').value;
            const accountId = document.getElementById('paymentAccount').value;

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
            submitBtn.disabled = true;

            try {
                const response = await fetch(`/credit-card-payment/${cardId}/`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({
                        account_id: accountId,
                        amount: amount
                    })
                });

                const data = await response.json();

                if (data.success) {
                    showNotification(data.message, 'success');
                    bootstrap.Modal.getInstance(document.getElementById('makePaymentModal')).hide();
                    this.reset();
                    
                    // Update dashboard with new data
                    updateDashboardData(data);
                } else {
                    showNotification(data.message, 'error');
                }
            } catch (error) {
                console.error('Error processing credit card payment:', error);
                showNotification('An error occurred during payment.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ===================== DASHBOARD WIDGETS =====================
function initDashboardWidgets() {
    // Refresh data button
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', async function() {
            const originalHTML = this.innerHTML;
            this.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div>';
            this.disabled = true;

            await fetchDashboardData();

            showNotification('Dashboard data updated', 'success');
            this.innerHTML = originalHTML;
            this.disabled = false;
        });
    }
}

// ===================== UTILITY FUNCTIONS =====================
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function getFirstAccountId() {
    const accountSelect = document.querySelector('select[id*="account"]');
    if (accountSelect && accountSelect.options.length > 0) {
        return accountSelect.options[0].value;
    }
    return null;
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('en-BD', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(amount);
}

// ===================== DASHBOARD DATA MANAGEMENT =====================
async function fetchDashboardData() {
    try {
        const response = await fetch('/dashboard_data/');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        updateDashboardData(data);
        return data;
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        showNotification('Failed to load dashboard data.', 'error');
        return null;
    }
}

function updateDashboardData(data) {
    console.log('Updating dashboard data with:', data);

    if (!data.success && data.message) {
        showNotification(data.message, 'error');
        return;
    }

    // Update total balance
    const totalBalanceElement = document.getElementById('totalBalance');
    if (totalBalanceElement && data.total_balance !== undefined) {
        const formattedBalance = `৳${formatCurrency(data.total_balance)}`;
        totalBalanceElement.textContent = formattedBalance;
        totalBalanceElement.setAttribute('data-balance', formattedBalance);
    }

    // Update account counts
    if (data.accounts_count !== undefined) {
        const accountsCountElement = document.getElementById('accountsCount');
        if (accountsCountElement) accountsCountElement.textContent = data.accounts_count;
    }

    if (data.cards_count !== undefined) {
        const cardsCountElement = document.getElementById('cardsCount');
        if (cardsCountElement) cardsCountElement.textContent = data.cards_count;
    }

    if (data.bills_count !== undefined) {
        const billsCountElement = document.getElementById('billsCount');
        if (billsCountElement) billsCountElement.textContent = data.bills_count;
    }

    if (data.goals_count !== undefined) {
        const goalsCountElement = document.getElementById('goalsCount');
        if (goalsCountElement) goalsCountElement.textContent = data.goals_count;
    }

    // Update individual account balances
    if (data.accounts) {
        data.accounts.forEach(account => {
            const accountBalanceElement = document.querySelector(`[data-account-id="${account.id}"] .account-balance`);
            if (accountBalanceElement) {
                const formattedBalance = `৳${formatCurrency(account.balance)}`;
                accountBalanceElement.textContent = formattedBalance;
                accountBalanceElement.setAttribute('data-balance', formattedBalance);
            }
        });
    }

    // Update recent transactions
    const transactionsContainer = document.querySelector('.transactions-list');
    if (transactionsContainer && data.transactions) {
        transactionsContainer.innerHTML = '';

        if (data.transactions.length === 0) {
            transactionsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-exchange-alt fa-3x text-muted mb-3"></i>
                    <h4>No Transactions Yet</h4>
                    <p class="text-muted">Your transaction history will appear here.</p>
                </div>
            `;
        } else {
            data.transactions.forEach(transaction => {
                const transactionItem = document.createElement('div');
                transactionItem.className = `transaction-item ${transaction.transaction_type}`;
                
                const isDeposit = transaction.transaction_type === 'deposit' || transaction.transaction_type === 'transfer_in';
                const amountClass = isDeposit ? 'text-success' : 'text-danger';
                const amountSign = isDeposit ? '+' : '-';
                
                transactionItem.innerHTML = `
                    <div class="transaction-icon">
                        <i class="fas fa-${transaction.icon || 'exchange-alt'}"></i>
                    </div>
                    <div class="transaction-info">
                        <h5>${transaction.description}</h5>
                        <p class="text-muted mb-0">${transaction.category || 'Transaction'}</p>
                        <small class="text-muted">${new Date(transaction.timestamp).toLocaleDateString()}</small>
                    </div>
                    <div class="transaction-amount ${amountClass}">
                        ${amountSign}৳${formatCurrency(transaction.amount)}
                    </div>
                `;
                
                transactionsContainer.appendChild(transactionItem);
            });
        }
    }

    // Update bills
    const billsContainer = document.querySelector('.bills-list');
    if (billsContainer && data.bills) {
        // This would update the bills list if needed
    }

    // Update savings goals progress
    if (data.savings_goals) {
        data.savings_goals.forEach(goal => {
            const goalElement = document.querySelector(`[data-goal-id="${goal.id}"]`);
            if (goalElement) {
                const progressBar = goalElement.querySelector('.progress-bar');
                const currentAmount = goalElement.querySelector('.current-amount');
                const progressText = goalElement.querySelector('.progress-percentage');
                
                if (progressBar) {
                    progressBar.style.width = `${goal.progress_percentage}%`;
                    progressBar.textContent = `${Math.round(goal.progress_percentage)}%`;
                }
                if (currentAmount) {
                    currentAmount.textContent = `৳${formatCurrency(goal.current_amount)}`;
                }
                if (progressText) {
                    progressText.textContent = `${Math.round(goal.progress_percentage)}%`;
                }
            }
        });
    }
}

// ===================== TRANSACTION HANDLING =====================
async function handleTransaction(endpoint, data) {
    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken')
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (result.success) {
            showNotification(result.message, 'success');
            // Update dashboard with new data
            await fetchDashboardData();
            return result;
        } else {
            showNotification(result.message, 'error');
            return null;
        }
    } catch (error) {
        console.error('Transaction error:', error);
        showNotification('An error occurred during the transaction.', 'error');
        return null;
    }
}

// Deposit handler
function initDepositHandlers() {
    const depositForm = document.getElementById('depositForm');
    if (depositForm) {
        depositForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const accountId = document.getElementById('depositAccount').value;
            const amount = document.getElementById('depositAmount').value;
            const description = document.getElementById('depositDescription').value || 'Deposit';

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
            submitBtn.disabled = true;

            try {
                const result = await handleTransaction('/deposit_api/', {
                    account_id: accountId,
                    amount: amount,
                    description: description
                });

                if (result) {
                    this.reset();
                    // Show success modal or redirect
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    if (successModal) successModal.show();
                }
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Withdraw handler
function initWithdrawHandlers() {
    const withdrawForm = document.getElementById('withdrawForm');
    if (withdrawForm) {
        withdrawForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const accountId = document.getElementById('withdrawAccount').value;
            const amount = document.getElementById('withdrawAmount').value;
            const description = document.getElementById('withdrawDescription').value || 'Withdrawal';

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
            submitBtn.disabled = true;

            try {
                const result = await handleTransaction('/withdraw_api/', {
                    account_id: accountId,
                    amount: amount,
                    description: description
                });

                if (result) {
                    this.reset();
                    // Show success modal or redirect
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    if (successModal) successModal.show();
                }
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// Transfer handler
function initTransferHandlers() {
    const transferForm = document.getElementById('transferForm');
    if (transferForm) {
        transferForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const fromAccountId = document.getElementById('fromAccount').value;
            const toAccountId = document.getElementById('toAccount').value;
            const amount = document.getElementById('transferAmount').value;
            const description = document.getElementById('transferDescription').value || 'Transfer';

            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;

            submitBtn.innerHTML = '<div class="spinner-border spinner-border-sm me-2"></div> Processing...';
            submitBtn.disabled = true;

            try {
                const result = await handleTransaction('/transfer_api/', {
                    from_account_id: fromAccountId,
                    to_account_id: toAccountId,
                    amount: amount,
                    description: description
                });

                if (result) {
                    this.reset();
                    // Show success modal or redirect
                    const successModal = new bootstrap.Modal(document.getElementById('successModal'));
                    if (successModal) successModal.show();
                }
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
}

// ===================== NOTIFICATION SYSTEM =====================
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.custom-notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `custom-notification alert alert-${type} alert-dismissible fade show`;
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    // Add styles for notification positioning
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// ===================== DASHBOARD INITIALIZATION =====================
function initDashboardPage() {
    // Fetch and update dashboard data on page load
    fetchDashboardData();

    // Balance toggle functionality
    const balanceToggle = document.getElementById('balanceToggle');
    const balanceElements = document.querySelectorAll('.total-balance, .account-balance');

    if (balanceToggle) {
        balanceToggle.addEventListener('click', function() {
            balanceElements.forEach(element => {
                if (element.textContent.includes('***')) {
                    element.textContent = element.getAttribute('data-balance');
                } else {
                    element.setAttribute('data-balance', element.textContent);
                    element.textContent = '৳***';
                }
            });

            const icon = this.querySelector('i');
            icon.classList.toggle('fa-eye');
            icon.classList.toggle('fa-eye-slash');
        });
    }

    // Initialize balance data attributes
    balanceElements.forEach(element => {
        if (!element.textContent.includes('***')) {
            element.setAttribute('data-balance', element.textContent);
        }
    });

    // Initialize charts
    if (document.getElementById('balanceChart') || document.getElementById('spendingChart')) {
        initializeDashboardCharts();
    }

    // Auto-refresh dashboard data every 30 seconds
    setInterval(fetchDashboardData, 30000);
}

// ===================== MAIN INITIALIZATION =====================
document.addEventListener('DOMContentLoaded', function() {
    initMobileMenu();
    initQuickActions();
    initTransactionFilters();
    initAccountManagement();
    initBillPayment();
    initSavingsGoals();
    initCreditCardManagement();
    initDashboardWidgets();
    initDashboardPage();
    
    // Initialize transaction handlers based on current page
    initDepositHandlers();
    initWithdrawHandlers();
    initTransferHandlers();

    console.log('Dashboard JavaScript initialized successfully');
});
// In your dashboard-script.js
const API_ENDPOINTS = {
    dashboard: '/dashboard_data/',
    deposit: '/deposit_api/',
    withdraw: '/withdraw_api/',
    transfer: '/transfer_api/',
    payBill: (billId) => `/pay_bill/${billId}/`,
    addSavings: (goalId) => `/add_savings_funds/${goalId}/`,
    creditCardPayment: (cardId) => `/credit_card_payment/${cardId}/`,
    profilePicture: '/update_profile_picture/'
};

// Make functions available globally
window.updateDashboardData = updateDashboardData;
window.fetchDashboardData = fetchDashboardData;
window.showNotification = showNotification;
window.handleTransaction = handleTransaction;