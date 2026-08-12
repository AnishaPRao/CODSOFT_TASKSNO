/**
 * PAYPULSE EXPENSE TRACKER APPLICATION
 * CodSoft Task 3 | Vanilla ES6 JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Initial State & Category Configurations
    // --------------------------------------------------------------------------
    const LOCAL_STORAGE_KEY = 'paypulse_transactions_data';
    const THEME_KEY = 'paypulse_theme';

    const CATEGORIES = {
        income: [
            'Salary',
            'Freelance',
            'Investment',
            'Gift',
            'Other Income'
        ],
        expense: [
            'Food & Dining',
            'Transportation',
            'Utilities & Bills',
            'Shopping',
            'Entertainment',
            'Health & Medical',
            'Education',
            'Other Expense'
        ]
    };

    const defaultSeedTransactions = [
        {
            id: 'tx-seed-1',
            type: 'income',
            title: 'Monthly Tech Internship Stipend',
            amount: 15000.00,
            category: 'Salary',
            date: getFormattedDateOffset(-2),
            createdAt: new Date().toISOString()
        },
        {
            id: 'tx-seed-2',
            type: 'expense',
            title: 'Grocery & Supermarket Supplies',
            amount: 2450.50,
            category: 'Food & Dining',
            date: getFormattedDateOffset(-1),
            createdAt: new Date().toISOString()
        },
        {
            id: 'tx-seed-3',
            type: 'expense',
            title: 'Electricity & High-Speed Internet Bill',
            amount: 1800.00,
            category: 'Utilities & Bills',
            date: getFormattedDateOffset(0), // Today
            createdAt: new Date().toISOString()
        },
        {
            id: 'tx-seed-4',
            type: 'income',
            title: 'Freelance Web Design Project',
            amount: 6500.00,
            category: 'Freelance',
            date: getFormattedDateOffset(-5),
            createdAt: new Date().toISOString()
        }
    ];

    let transactions = loadTransactions();
    let deletingTxId = null;

    // --------------------------------------------------------------------------
    // 2. DOM Element Selectors
    // --------------------------------------------------------------------------
    // Header & Theme
    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentDateEl = document.getElementById('current-date');

    // Financial Summary Elements
    const totalIncomeEl = document.getElementById('total-income');
    const totalExpensesEl = document.getElementById('total-expenses');
    const currentBalanceEl = document.getElementById('current-balance');

    // Add Form Elements
    const transactionForm = document.getElementById('transaction-form');
    const typeBtnExpense = document.getElementById('type-btn-expense');
    const typeBtnIncome = document.getElementById('type-btn-income');
    const titleInput = document.getElementById('tx-title');
    const amountInput = document.getElementById('tx-amount');
    const categorySelect = document.getElementById('tx-category');
    const dateInput = document.getElementById('tx-date');
    const titleErrorMsg = document.getElementById('title-error');
    const amountErrorMsg = document.getElementById('amount-error');

    // Search & Filter Elements
    const searchInput = document.getElementById('search-input');
    const searchBox = document.querySelector('.search-box');
    const clearSearchBtn = document.getElementById('clear-search');
    const typeTabBtns = document.querySelectorAll('.tab-btn');
    const filterCategorySelect = document.getElementById('filter-category');
    const clearAllBtn = document.getElementById('clear-all-btn');

    // List & Empty State Elements
    const transactionListEl = document.getElementById('transaction-list');
    const emptyStateEl = document.getElementById('empty-state');
    const emptyTitleEl = document.getElementById('empty-title');
    const emptyDescEl = document.getElementById('empty-description');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editModalCloseBtn = document.getElementById('edit-modal-close');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const editTxForm = document.getElementById('edit-tx-form');
    const editTxIdInput = document.getElementById('edit-tx-id');
    const editTitleInput = document.getElementById('edit-title');
    const editAmountInput = document.getElementById('edit-amount');
    const editCategorySelect = document.getElementById('edit-category');
    const editDateInput = document.getElementById('edit-date');
    const editTypeBtnExpense = document.getElementById('edit-type-btn-expense');
    const editTypeBtnIncome = document.getElementById('edit-type-btn-income');

    // Delete Modal Elements
    const deleteModal = document.getElementById('delete-modal');
    const deleteModalCloseBtn = document.getElementById('delete-modal-close');
    const deleteCancelBtn = document.getElementById('delete-cancel-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const deleteTxInfoEl = document.getElementById('delete-tx-info');

    // Filter Variables
    let currentTypeFilter = 'all';
    let currentCategoryFilter = 'all';
    let currentSearchQuery = '';
    let currentAddType = 'expense';
    let currentEditType = 'expense';

    // --------------------------------------------------------------------------
    // 3. Initialize Application
    // --------------------------------------------------------------------------
    initTheme();
    initDateHeader();
    dateInput.value = new Date().toISOString().split('T')[0];
    populateCategories(categorySelect, 'expense');
    populateFilterCategories();
    renderTransactions();
    updateFinancialSummary();

    // --------------------------------------------------------------------------
    // 4. LocalStorage Helpers
    // --------------------------------------------------------------------------
    function loadTransactions() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading transactions from localStorage', e);
        }
        saveTransactions(defaultSeedTransactions);
        return defaultSeedTransactions;
    }

    function saveTransactions(dataToSave = transactions) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (e) {
            console.error('Error saving transactions to localStorage', e);
        }
    }

    // --------------------------------------------------------------------------
    // 5. Category Population & Type Toggle Logic
    // --------------------------------------------------------------------------
    function populateCategories(selectEl, type, selectedCategory = '') {
        if (!selectEl) return;
        selectEl.innerHTML = '';

        const catList = CATEGORIES[type] || [];
        catList.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            if (cat === selectedCategory) option.selected = true;
            selectEl.appendChild(option);
        });
    }

    function populateFilterCategories() {
        if (!filterCategorySelect) return;
        filterCategorySelect.innerHTML = '<option value="all">All Categories</option>';

        const allCats = [...CATEGORIES.income, ...CATEGORIES.expense];
        allCats.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            filterCategorySelect.appendChild(option);
        });
    }

    // Add Form Type Toggle Listeners
    typeBtnExpense?.addEventListener('click', () => {
        typeBtnExpense.classList.add('active');
        typeBtnIncome.classList.remove('active');
        currentAddType = 'expense';
        populateCategories(categorySelect, 'expense');
    });

    typeBtnIncome?.addEventListener('click', () => {
        typeBtnIncome.classList.add('active');
        typeBtnExpense.classList.remove('active');
        currentAddType = 'income';
        populateCategories(categorySelect, 'income');
    });

    // Edit Form Type Toggle Listeners
    editTypeBtnExpense?.addEventListener('click', () => {
        editTypeBtnExpense.classList.add('active');
        editTypeBtnIncome.classList.remove('active');
        currentEditType = 'expense';
        populateCategories(editCategorySelect, 'expense');
    });

    editTypeBtnIncome?.addEventListener('click', () => {
        editTypeBtnIncome.classList.add('active');
        editTypeBtnExpense.classList.remove('active');
        currentEditType = 'income';
        populateCategories(editCategorySelect, 'income');
    });

    // --------------------------------------------------------------------------
    // 6. Add Transaction Functionality
    // --------------------------------------------------------------------------
    transactionForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleVal = titleInput.value.trim();
        const amountVal = parseFloat(amountInput.value);
        const categoryVal = categorySelect.value;
        const dateVal = dateInput.value;

        let hasError = false;

        // Title Validation
        if (!titleVal) {
            titleInput.closest('.form-group')?.classList.add('error');
            hasError = true;
        } else {
            titleInput.closest('.form-group')?.classList.remove('error');
        }

        // Amount Validation (Must be a positive number)
        if (isNaN(amountVal) || amountVal <= 0) {
            amountInput.closest('.form-group')?.classList.add('error');
            hasError = true;
        } else {
            amountInput.closest('.form-group')?.classList.remove('error');
        }

        if (hasError) {
            showToast('Please fix errors before submitting!', 'error');
            return;
        }

        const newTransaction = {
            id: 'tx-' + Date.now(),
            type: currentAddType,
            title: titleVal,
            amount: amountVal,
            category: categoryVal,
            date: dateVal || new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString()
        };

        transactions.unshift(newTransaction);
        saveTransactions();
        renderTransactions();
        updateFinancialSummary();

        // Reset Form
        titleInput.value = '';
        amountInput.value = '';
        dateInput.value = new Date().toISOString().split('T')[0];

        showToast(`${currentAddType === 'income' ? 'Income' : 'Expense'} added successfully!`, 'success');
    });

    titleInput?.addEventListener('input', () => {
        if (titleInput.value.trim()) titleInput.closest('.form-group')?.classList.remove('error');
    });

    amountInput?.addEventListener('input', () => {
        if (parseFloat(amountInput.value) > 0) amountInput.closest('.form-group')?.classList.remove('error');
    });

    // --------------------------------------------------------------------------
    // 7. Edit Transaction Functionality
    // --------------------------------------------------------------------------
    function openEditModal(txId) {
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return;

        editTxIdInput.value = tx.id;
        editTitleInput.value = tx.title;
        editAmountInput.value = tx.amount;
        editDateInput.value = tx.date;
        currentEditType = tx.type;

        if (tx.type === 'income') {
            editTypeBtnIncome.classList.add('active');
            editTypeBtnExpense.classList.remove('active');
        } else {
            editTypeBtnExpense.classList.add('active');
            editTypeBtnIncome.classList.remove('active');
        }

        populateCategories(editCategorySelect, tx.type, tx.category);

        editTitleInput.closest('.form-group')?.classList.remove('error');
        editAmountInput.closest('.form-group')?.classList.remove('error');

        editModal?.classList.add('open');
        editModal?.setAttribute('aria-hidden', 'false');
    }

    function closeEditModal() {
        editModal?.classList.remove('open');
        editModal?.setAttribute('aria-hidden', 'true');
    }

    editModalCloseBtn?.addEventListener('click', closeEditModal);
    editCancelBtn?.addEventListener('click', closeEditModal);
    editModal?.addEventListener('click', (e) => {
        if (e.target === editModal) closeEditModal();
    });

    editTxForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const txId = editTxIdInput.value;
        const newTitle = editTitleInput.value.trim();
        const newAmount = parseFloat(editAmountInput.value);
        const newCategory = editCategorySelect.value;
        const newDate = editDateInput.value;

        let hasError = false;

        if (!newTitle) {
            editTitleInput.closest('.form-group')?.classList.add('error');
            hasError = true;
        } else {
            editTitleInput.closest('.form-group')?.classList.remove('error');
        }

        if (isNaN(newAmount) || newAmount <= 0) {
            editAmountInput.closest('.form-group')?.classList.add('error');
            hasError = true;
        } else {
            editAmountInput.closest('.form-group')?.classList.remove('error');
        }

        if (hasError) {
            showToast('Please fix errors before saving!', 'error');
            return;
        }

        const txIndex = transactions.findIndex(t => t.id === txId);
        if (txIndex !== -1) {
            transactions[txIndex].type = currentEditType;
            transactions[txIndex].title = newTitle;
            transactions[txIndex].amount = newAmount;
            transactions[txIndex].category = newCategory;
            transactions[txIndex].date = newDate;

            saveTransactions();
            renderTransactions();
            updateFinancialSummary();
            closeEditModal();
            showToast('Transaction updated successfully!', 'success');
        }
    });

    // --------------------------------------------------------------------------
    // 8. Delete Transaction & Confirmation Modal
    // --------------------------------------------------------------------------
    function openDeleteModal(txId) {
        const tx = transactions.find(t => t.id === txId);
        if (!tx) return;

        deletingTxId = txId;
        if (deleteTxInfoEl) {
            deleteTxInfoEl.innerText = `"${tx.title}" — ₹${formatCurrency(tx.amount)}`;
        }

        deleteModal?.classList.add('open');
        deleteModal?.setAttribute('aria-hidden', 'false');
    }

    function closeDeleteModal() {
        deleteModal?.classList.remove('open');
        deleteModal?.setAttribute('aria-hidden', 'true');
        deletingTxId = null;
    }

    deleteModalCloseBtn?.addEventListener('click', closeDeleteModal);
    deleteCancelBtn?.addEventListener('click', closeDeleteModal);
    deleteModal?.addEventListener('click', (e) => {
        if (e.target === deleteModal) closeDeleteModal();
    });

    confirmDeleteBtn?.addEventListener('click', () => {
        if (deletingTxId) {
            transactions = transactions.filter(t => t.id !== deletingTxId);
            saveTransactions();
            renderTransactions();
            updateFinancialSummary();
            closeDeleteModal();
            showToast('Transaction deleted', 'info');
        }
    });

    clearAllBtn?.addEventListener('click', () => {
        if (transactions.length === 0) {
            showToast('History is already clear', 'info');
            return;
        }

        if (confirm('Are you sure you want to clear all transaction history?')) {
            transactions = [];
            saveTransactions();
            renderTransactions();
            updateFinancialSummary();
            showToast('All transaction history cleared', 'info');
        }
    });

    // --------------------------------------------------------------------------
    // 9. Search & Filter Handlers
    // --------------------------------------------------------------------------
    // Search
    searchInput?.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        if (currentSearchQuery) {
            searchBox?.classList.add('has-value');
        } else {
            searchBox?.classList.remove('has-value');
        }
        renderTransactions();
    });

    clearSearchBtn?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            currentSearchQuery = '';
            searchBox?.classList.remove('has-value');
            renderTransactions();
        }
    });

    // Type Filter Tabs
    typeTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentTypeFilter = btn.getAttribute('data-filter-type') || 'all';
            renderTransactions();
        });
    });

    // Category Dropdown Filter
    filterCategorySelect?.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        renderTransactions();
    });

    // --------------------------------------------------------------------------
    // 10. Render Transactions to DOM
    // --------------------------------------------------------------------------
    function renderTransactions() {
        if (!transactionListEl) return;

        const filteredTx = transactions.filter(tx => {
            // Type Check
            if (currentTypeFilter !== 'all' && tx.type !== currentTypeFilter) return false;

            // Category Check
            if (currentCategoryFilter !== 'all' && tx.category !== currentCategoryFilter) return false;

            // Search Check
            if (currentSearchQuery && !tx.title.toLowerCase().includes(currentSearchQuery)) return false;

            return true;
        });

        transactionListEl.innerHTML = '';

        if (filteredTx.length === 0) {
            emptyStateEl?.classList.remove('hidden');
            if (currentSearchQuery || currentTypeFilter !== 'all' || currentCategoryFilter !== 'all') {
                if (emptyTitleEl) emptyTitleEl.innerText = 'No matching transactions';
                if (emptyDescEl) emptyDescEl.innerText = 'Try adjusting your search query or filters.';
            } else {
                if (emptyTitleEl) emptyTitleEl.innerText = 'No transactions recorded';
                if (emptyDescEl) emptyDescEl.innerText = 'Add a new income or expense transaction above to get started!';
            }
        } else {
            emptyStateEl?.classList.add('hidden');

            filteredTx.forEach(tx => {
                const li = document.createElement('li');
                li.className = `transaction-item tx-item-${tx.type}`;
                li.setAttribute('data-id', tx.id);

                const iconClass = getCategoryIcon(tx.category);
                const sign = tx.type === 'income' ? '+' : '-';
                const formattedDate = formatDateString(tx.date);

                li.innerHTML = `
                    <div class="tx-left">
                        <div class="tx-icon-box">
                            <i class="fa-solid ${iconClass}"></i>
                        </div>
                        <div class="tx-details">
                            <span class="tx-title-text">${escapeHTML(tx.title)}</span>
                            <div class="tx-meta">
                                <span class="tag-category">${tx.category || 'General'}</span>
                                <span class="meta-item text-muted">
                                    <i class="fa-regular fa-calendar"></i> ${formattedDate}
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="tx-right">
                        <div class="tx-amount-box">
                            <div class="tx-amount">${sign}₹${formatCurrency(tx.amount)}</div>
                            <span class="tx-type-badge">${tx.type}</span>
                        </div>
                        <div class="tx-actions">
                            <button type="button" class="action-btn edit-btn" aria-label="Edit Transaction">
                                <i class="fa-solid fa-pen"></i>
                            </button>
                            <button type="button" class="action-btn delete-btn" aria-label="Delete Transaction">
                                <i class="fa-solid fa-trash-can"></i>
                            </button>
                        </div>
                    </div>
                `;

                // Event Listeners for Action Buttons
                const editBtn = li.querySelector('.edit-btn');
                const deleteBtn = li.querySelector('.delete-btn');

                editBtn?.addEventListener('click', () => openEditModal(tx.id));
                deleteBtn?.addEventListener('click', () => openDeleteModal(tx.id));

                transactionListEl.appendChild(li);
            });
        }
    }

    // --------------------------------------------------------------------------
    // 11. Calculate Financial Summary (Income, Expenses, Balance)
    // --------------------------------------------------------------------------
    function updateFinancialSummary() {
        let incomeTotal = 0;
        let expenseTotal = 0;

        transactions.forEach(tx => {
            if (tx.type === 'income') {
                incomeTotal += parseFloat(tx.amount) || 0;
            } else if (tx.type === 'expense') {
                expenseTotal += parseFloat(tx.amount) || 0;
            }
        });

        const netBalance = incomeTotal - expenseTotal;

        if (totalIncomeEl) totalIncomeEl.innerText = `₹${formatCurrency(incomeTotal)}`;
        if (totalExpensesEl) totalExpensesEl.innerText = `₹${formatCurrency(expenseTotal)}`;
        if (currentBalanceEl) {
            const prefix = netBalance < 0 ? '-₹' : '₹';
            currentBalanceEl.innerText = `${prefix}${formatCurrency(Math.abs(netBalance))}`;
            currentBalanceEl.style.color = netBalance < 0 ? 'var(--expense)' : 'var(--text-primary)';
        }
    }

    // --------------------------------------------------------------------------
    // 12. Utilities & Icons
    // --------------------------------------------------------------------------
    function getCategoryIcon(cat) {
        switch (cat) {
            case 'Salary': return 'fa-money-bill-wave';
            case 'Freelance': return 'fa-laptop-code';
            case 'Investment': return 'fa-chart-line';
            case 'Gift': return 'fa-gift';
            case 'Food & Dining': return 'fa-utensils';
            case 'Transportation': return 'fa-car';
            case 'Utilities & Bills': return 'fa-file-invoice-dollar';
            case 'Shopping': return 'fa-bag-shopping';
            case 'Entertainment': return 'fa-film';
            case 'Health & Medical': return 'fa-heart-pulse';
            case 'Education': return 'fa-graduation-cap';
            default: return 'fa-receipt';
        }
    }

    function formatCurrency(val) {
        return (val || 0).toLocaleString('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY) || 'dark';
        htmlElement.setAttribute('data-theme', savedTheme);

        themeToggleBtn?.addEventListener('click', () => {
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

            htmlElement.setAttribute('data-theme', newTheme);
            localStorage.setItem(THEME_KEY, newTheme);
            showToast(`Switched to ${newTheme} theme`, 'info');
        });
    }

    function initDateHeader() {
        if (!currentDateEl) return;
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        currentDateEl.innerText = new Date().toLocaleDateString('en-US', options);
    }

    function getFormattedDateOffset(daysOffset) {
        const d = new Date();
        d.setDate(d.getDate() + daysOffset);
        return d.toISOString().split('T')[0];
    }

    function formatDateString(dateStr) {
        if (!dateStr) return '';
        const parts = dateStr.split('-');
        if (parts.length !== 3) return dateStr;
        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // --------------------------------------------------------------------------
    // 13. Toast Notifications
    // --------------------------------------------------------------------------
    function showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        let iconClass = 'fa-info-circle';
        if (type === 'success') iconClass = 'fa-circle-check';
        if (type === 'error') iconClass = 'fa-triangle-exclamation';

        toast.innerHTML = `
            <i class="fa-solid ${iconClass} toast-icon"></i>
            <span>${message}</span>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-30px)';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
});
