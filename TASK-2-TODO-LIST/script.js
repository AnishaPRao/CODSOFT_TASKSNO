/**
 * TASKFLOW TO-DO LIST APPLICATION
 * CodSoft Task 2 | Vanilla ES6 JavaScript Implementation
 */

document.addEventListener('DOMContentLoaded', () => {
    // --------------------------------------------------------------------------
    // 1. Initial State & Sample Seed Tasks
    // --------------------------------------------------------------------------
    const LOCAL_STORAGE_KEY = 'taskflow_tasks_data';
    const THEME_KEY = 'taskflow_theme';

    const defaultSeedTasks = [
        {
            id: 'task-seed-1',
            title: 'Complete CodSoft Task 2 Frontend Internship Project',
            category: 'Study',
            priority: 'High',
            dueDate: getFormattedDateOffset(1), // Tomorrow
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-seed-2',
            title: 'Review JavaScript LocalStorage & State Management logic',
            category: 'Study',
            priority: 'Medium',
            dueDate: getFormattedDateOffset(2),
            completed: true,
            createdAt: new Date().toISOString()
        },
        {
            id: 'task-seed-3',
            title: 'Design responsive UI mockup for mobile and desktop screens',
            category: 'Work',
            priority: 'Low',
            dueDate: getFormattedDateOffset(4),
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];

    let tasks = loadTasks();

    // --------------------------------------------------------------------------
    // 2. DOM Element Selectors
    // --------------------------------------------------------------------------
    // Theme & Header
    const htmlElement = document.documentElement;
    const themeToggleBtn = document.getElementById('theme-toggle');
    const currentDateEl = document.getElementById('current-date');

    // Stats Elements
    const statTotalEl = document.getElementById('stat-total');
    const statPendingEl = document.getElementById('stat-pending');
    const statCompletedEl = document.getElementById('stat-completed');

    // Add Task Form Elements
    const addTaskForm = document.getElementById('add-task-form');
    const titleInput = document.getElementById('task-title');
    const categorySelect = document.getElementById('task-category');
    const prioritySelect = document.getElementById('task-priority');
    const dueDateInput = document.getElementById('task-due-date');
    const titleErrorMsg = document.getElementById('title-error');

    // Controls Elements (Search & Filter)
    const searchInput = document.getElementById('search-input');
    const searchBox = document.querySelector('.search-box');
    const clearSearchBtn = document.getElementById('clear-search');
    const statusTabBtns = document.querySelectorAll('.tab-btn');
    const filterCategorySelect = document.getElementById('filter-category');
    const filterPrioritySelect = document.getElementById('filter-priority');
    const clearCompletedBtn = document.getElementById('clear-completed-btn');

    // Task List & Empty State Elements
    const taskListEl = document.getElementById('task-list');
    const emptyStateEl = document.getElementById('empty-state');
    const emptyTitleEl = document.getElementById('empty-title');
    const emptyDescEl = document.getElementById('empty-description');

    // Edit Modal Elements
    const editModal = document.getElementById('edit-modal');
    const editModalCloseBtn = document.getElementById('edit-modal-close');
    const editCancelBtn = document.getElementById('edit-cancel-btn');
    const editTaskForm = document.getElementById('edit-task-form');
    const editTaskIdInput = document.getElementById('edit-task-id');
    const editTitleInput = document.getElementById('edit-title');
    const editCategorySelect = document.getElementById('edit-category');
    const editPrioritySelect = document.getElementById('edit-priority');
    const editDueDateInput = document.getElementById('edit-due-date');
    const editTitleErrorMsg = document.getElementById('edit-title-error');

    // Filter State Variables
    let currentStatusFilter = 'all';
    let currentCategoryFilter = 'all';
    let currentPriorityFilter = 'all';
    let currentSearchQuery = '';

    // --------------------------------------------------------------------------
    // 3. Initialize App
    // --------------------------------------------------------------------------
    initTheme();
    initDateHeader();
    renderTasks();
    updateStats();

    // --------------------------------------------------------------------------
    // 4. LocalStorage Helpers
    // --------------------------------------------------------------------------
    function loadTasks() {
        try {
            const data = localStorage.getItem(LOCAL_STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (e) {
            console.error('Error loading tasks from localStorage', e);
        }
        // Save initial seed tasks if first time
        saveTasks(defaultSeedTasks);
        return defaultSeedTasks;
    }

    function saveTasks(tasksToSave = tasks) {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasksToSave));
        } catch (e) {
            console.error('Error saving tasks to localStorage', e);
        }
    }

    // --------------------------------------------------------------------------
    // 5. Add New Task Functionality
    // --------------------------------------------------------------------------
    addTaskForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const titleVal = titleInput.value.trim();
        const categoryVal = categorySelect.value;
        const priorityVal = prioritySelect.value;
        const dueDateVal = dueDateInput.value;

        // Validation: Block empty task title
        if (!titleVal) {
            const group = titleInput.closest('.form-group');
            group?.classList.add('error');
            showToast('Please enter a valid task title!', 'error');
            return;
        }

        // Clear error ring
        titleInput.closest('.form-group')?.classList.remove('error');

        const newTask = {
            id: 'task-' + Date.now(),
            title: titleVal,
            category: categoryVal,
            priority: priorityVal,
            dueDate: dueDateVal,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.unshift(newTask);
        saveTasks();
        renderTasks();
        updateStats();

        // Reset Form
        titleInput.value = '';
        dueDateInput.value = '';
        categorySelect.value = 'Work';
        prioritySelect.value = 'Medium';

        showToast('Task added successfully!', 'success');
    });

    titleInput?.addEventListener('input', () => {
        if (titleInput.value.trim()) {
            titleInput.closest('.form-group')?.classList.remove('error');
        }
    });

    // --------------------------------------------------------------------------
    // 6. Edit Task Functionality (Modal Dialog)
    // --------------------------------------------------------------------------
    function openEditModal(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;

        editTaskIdInput.value = task.id;
        editTitleInput.value = task.title;
        editCategorySelect.value = task.category || 'Work';
        editPrioritySelect.value = task.priority || 'Medium';
        editDueDateInput.value = task.dueDate || '';

        editTitleInput.closest('.form-group')?.classList.remove('error');

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
        if (e.target === editModal) {
            closeEditModal();
        }
    });

    editTaskForm?.addEventListener('submit', (e) => {
        e.preventDefault();

        const taskId = editTaskIdInput.value;
        const newTitle = editTitleInput.value.trim();
        const newCategory = editCategorySelect.value;
        const newPriority = editPrioritySelect.value;
        const newDueDate = editDueDateInput.value;

        if (!newTitle) {
            editTitleInput.closest('.form-group')?.classList.add('error');
            showToast('Task title cannot be empty!', 'error');
            return;
        }

        const taskIndex = tasks.findIndex(t => t.id === taskId);
        if (taskIndex !== -1) {
            // Update in-place without duplicating
            tasks[taskIndex].title = newTitle;
            tasks[taskIndex].category = newCategory;
            tasks[taskIndex].priority = newPriority;
            tasks[taskIndex].dueDate = newDueDate;

            saveTasks();
            renderTasks();
            updateStats();
            closeEditModal();
            showToast('Task updated successfully!', 'success');
        }
    });

    // --------------------------------------------------------------------------
    // 7. Toggle Completed & Delete Operations
    // --------------------------------------------------------------------------
    function toggleTaskStatus(taskId) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            task.completed = !task.completed;
            saveTasks();
            renderTasks();
            updateStats();

            const statusText = task.completed ? 'marked as completed' : 'marked as pending';
            showToast(`Task ${statusText}`, 'info');
        }
    }

    function deleteTask(taskId) {
        tasks = tasks.filter(t => t.id !== taskId);
        saveTasks();
        renderTasks();
        updateStats();
        showToast('Task deleted', 'info');
    }

    clearCompletedBtn?.addEventListener('click', () => {
        const completedCount = tasks.filter(t => t.completed).length;
        if (completedCount === 0) {
            showToast('No completed tasks to clear', 'info');
            return;
        }

        tasks = tasks.filter(t => !t.completed);
        saveTasks();
        renderTasks();
        updateStats();
        showToast(`Cleared ${completedCount} completed task(s)`, 'success');
    });

    // --------------------------------------------------------------------------
    // 8. Search & Filter Listeners
    // --------------------------------------------------------------------------
    // Live Search
    searchInput?.addEventListener('input', (e) => {
        currentSearchQuery = e.target.value.toLowerCase().trim();
        
        if (currentSearchQuery) {
            searchBox?.classList.add('has-value');
        } else {
            searchBox?.classList.remove('has-value');
        }

        renderTasks();
    });

    clearSearchBtn?.addEventListener('click', () => {
        if (searchInput) {
            searchInput.value = '';
            currentSearchQuery = '';
            searchBox?.classList.remove('has-value');
            renderTasks();
        }
    });

    // Status Filter Tabs
    statusTabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            statusTabBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            currentStatusFilter = btn.getAttribute('data-filter-status') || 'all';
            renderTasks();
        });
    });

    // Category Filter Dropdown
    filterCategorySelect?.addEventListener('change', (e) => {
        currentCategoryFilter = e.target.value;
        renderTasks();
    });

    // Priority Filter Dropdown
    filterPrioritySelect?.addEventListener('change', (e) => {
        currentPriorityFilter = e.target.value;
        renderTasks();
    });

    // --------------------------------------------------------------------------
    // 9. Render Tasks to DOM
    // --------------------------------------------------------------------------
    function renderTasks() {
        if (!taskListEl) return;

        // Filter Tasks matching Status, Category, Priority, and Search Query
        const filteredTasks = tasks.filter(task => {
            // Status Check
            if (currentStatusFilter === 'pending' && task.completed) return false;
            if (currentStatusFilter === 'completed' && !task.completed) return false;

            // Category Check
            if (currentCategoryFilter !== 'all' && task.category !== currentCategoryFilter) return false;

            // Priority Check
            if (currentPriorityFilter !== 'all' && task.priority !== currentPriorityFilter) return false;

            // Search Query Check
            if (currentSearchQuery && !task.title.toLowerCase().includes(currentSearchQuery)) return false;

            return true;
        });

        taskListEl.innerHTML = '';

        if (filteredTasks.length === 0) {
            emptyStateEl?.classList.remove('hidden');
            
            if (currentSearchQuery || currentStatusFilter !== 'all' || currentCategoryFilter !== 'all' || currentPriorityFilter !== 'all') {
                if (emptyTitleEl) emptyTitleEl.innerText = 'No matching tasks found';
                if (emptyDescEl) emptyDescEl.innerText = 'Try adjusting your search query or filters.';
            } else {
                if (emptyTitleEl) emptyTitleEl.innerText = 'No tasks yet';
                if (emptyDescEl) emptyDescEl.innerText = 'Create a new task above to get started!';
            }
        } else {
            emptyStateEl?.classList.add('hidden');

            filteredTasks.forEach(task => {
                const li = document.createElement('li');
                li.className = `task-item ${task.completed ? 'completed' : ''}`;
                li.setAttribute('data-id', task.id);

                const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
                const formattedDueDate = task.dueDate ? formatDateString(task.dueDate) : '';

                li.innerHTML = `
                    <div class="task-left">
                        <button type="button" class="checkbox-btn" aria-label="Toggle Complete">
                            <i class="fa-solid fa-check"></i>
                        </button>
                        <div class="task-details">
                            <span class="task-title-text">${escapeHTML(task.title)}</span>
                            <div class="task-meta">
                                <span class="badge-priority priority-${(task.priority || 'medium').toLowerCase()}">
                                    ${task.priority || 'Medium'}
                                </span>
                                <span class="tag-category">${task.category || 'Work'}</span>
                                ${formattedDueDate ? `
                                    <span class="meta-item ${isOverdue ? 'overdue-tag' : ''}">
                                        <i class="fa-regular fa-calendar"></i>
                                        ${isOverdue ? 'Overdue: ' : ''}${formattedDueDate}
                                    </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="task-actions">
                        <button type="button" class="action-btn edit-btn" aria-label="Edit Task">
                            <i class="fa-solid fa-pen"></i>
                        </button>
                        <button type="button" class="action-btn delete-btn" aria-label="Delete Task">
                            <i class="fa-solid fa-trash-can"></i>
                        </button>
                    </div>
                `;

                // Event Listeners for Task Card Buttons
                const checkboxBtn = li.querySelector('.checkbox-btn');
                const editBtn = li.querySelector('.edit-btn');
                const deleteBtn = li.querySelector('.delete-btn');

                checkboxBtn?.addEventListener('click', () => toggleTaskStatus(task.id));
                editBtn?.addEventListener('click', () => openEditModal(task.id));
                deleteBtn?.addEventListener('click', () => deleteTask(task.id));

                taskListEl.appendChild(li);
            });
        }
    }

    // --------------------------------------------------------------------------
    // 10. Update Summary Statistics
    // --------------------------------------------------------------------------
    function updateStats() {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;

        if (statTotalEl) statTotalEl.innerText = total;
        if (statPendingEl) statPendingEl.innerText = pending;
        if (statCompletedEl) statCompletedEl.innerText = completed;
    }

    // --------------------------------------------------------------------------
    // 11. Theme Engine & Date Utilities
    // --------------------------------------------------------------------------
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
        return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }

    function escapeHTML(str) {
        return str.replace(/[&<>'"]/g, 
            tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
        );
    }

    // --------------------------------------------------------------------------
    // 12. Toast Notification Manager
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
