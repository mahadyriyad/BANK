// ===================== PRINT AND EXPORT FUNCTIONALITY =====================

const PrintUtils = {
    // Print transaction receipt
    printTransactionReceipt: (transactionData) => {
        const receiptContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Transaction Receipt - NeoVault Bank</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        margin: 20px; 
                        line-height: 1.6;
                    }
                    .receipt { 
                        max-width: 400px; 
                        margin: 0 auto; 
                        border: 2px solid #333; 
                        padding: 20px; 
                    }
                    .header { 
                        text-align: center; 
                        border-bottom: 2px solid #333; 
                        padding-bottom: 10px; 
                        margin-bottom: 20px; 
                    }
                    .details { 
                        margin-bottom: 20px; 
                    }
                    .detail-row { 
                        display: flex; 
                        justify-content: space-between; 
                        margin-bottom: 8px; 
                    }
                    .footer { 
                        text-align: center; 
                        margin-top: 20px; 
                        padding-top: 10px; 
                        border-top: 1px solid #ccc; 
                        font-size: 0.9em; 
                        color: #666; 
                    }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="receipt">
                    <div class="header">
                        <h2>NeoVault Bank</h2>
                        <p>Transaction Receipt</p>
                    </div>
                    <div class="details">
                        <div class="detail-row">
                            <strong>Date:</strong>
                            <span>${transactionData.date || new Date().toLocaleString()}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Transaction ID:</strong>
                            <span>${transactionData.id || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Type:</strong>
                            <span>${transactionData.type || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Amount:</strong>
                            <span>${transactionData.amount || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>From Account:</strong>
                            <span>${transactionData.fromAccount || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>To Account:</strong>
                            <span>${transactionData.toAccount || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Description:</strong>
                            <span>${transactionData.description || 'N/A'}</span>
                        </div>
                        <div class="detail-row">
                            <strong>Status:</strong>
                            <span>${transactionData.status || 'Completed'}</span>
                        </div>
                    </div>
                    <div class="footer">
                        <p>Thank you for banking with NeoVault Bank</p>
                        <p>Customer Service: 1-800-NEOVAULT</p>
                        <p>${new Date().toLocaleString()}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(receiptContent);
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
        };
    },

    // Export transactions to CSV
    exportToCSV: (transactions, filename = 'transactions.csv') => {
        if (!transactions || transactions.length === 0) {
            showNotification('No transactions to export', 'warning');
            return;
        }

        const headers = ['Date', 'Description', 'Type', 'Amount', 'Balance', 'Category'];
        const csvContent = [
            headers.join(','),
            ...transactions.map(transaction => [
                `"${transaction.date || ''}"`,
                `"${transaction.description || ''}"`,
                `"${transaction.type || ''}"`,
                `"${transaction.amount || ''}"`,
                `"${transaction.balance || ''}"`,
                `"${transaction.category || ''}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showNotification('Transactions exported successfully', 'success');
    },

    // Export to PDF (placeholder - would use a PDF library in real implementation)
    exportToPDF: (elementId, filename = 'document.pdf') => {
        showNotification('PDF export functionality would be implemented with a PDF library', 'info');
        // In real implementation, you would use a library like jsPDF or pdfmake
    },

    // Print account statement
    printAccountStatement: (accountData, transactions) => {
        const statementContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Account Statement - NeoVault Bank</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 20px; }
                    .statement { max-width: 800px; margin: 0 auto; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .account-info { margin-bottom: 20px; }
                    .transaction-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                    .transaction-table th, .transaction-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                    .transaction-table th { background-color: #f2f2f2; }
                    .summary { margin-top: 30px; padding: 15px; background-color: #f9f9f9; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none !important; }
                    }
                </style>
            </head>
            <body>
                <div class="statement">
                    <div class="header">
                        <h1>NeoVault Bank</h1>
                        <h2>Account Statement</h2>
                        <p>Period: ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <div class="account-info">
                        <h3>Account Information</h3>
                        <p><strong>Account Number:</strong> ${accountData.number || 'N/A'}</p>
                        <p><strong>Account Type:</strong> ${accountData.type || 'N/A'}</p>
                        <p><strong>Statement Date:</strong> ${new Date().toLocaleDateString()}</p>
                    </div>
                    
                    <table class="transaction-table">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${transactions.map(transaction => `
                                <tr>
                                    <td>${transaction.date || ''}</td>
                                    <td>${transaction.description || ''}</td>
                                    <td>${transaction.type || ''}</td>
                                    <td>${transaction.amount || ''}</td>
                                    <td>${transaction.balance || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    
                    <div class="summary">
                        <h3>Summary</h3>
                        <p><strong>Opening Balance:</strong> ${accountData.openingBalance || 'N/A'}</p>
                        <p><strong>Closing Balance:</strong> ${accountData.closingBalance || 'N/A'}</p>
                        <p><strong>Total Deposits:</strong> ${accountData.totalDeposits || 'N/A'}</p>
                        <p><strong>Total Withdrawals:</strong> ${accountData.totalWithdrawals || 'N/A'}</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const printWindow = window.open('', '_blank');
        printWindow.document.write(statementContent);
        printWindow.document.close();
        
        printWindow.onload = function() {
            printWindow.print();
            setTimeout(() => printWindow.close(), 1000);
        };
    }
};

// Make print utilities available globally
window.PrintUtils = PrintUtils;