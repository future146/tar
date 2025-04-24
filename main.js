// Task management
let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

function saveTasksToStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    updateTaskCounts();
}

function createTask(title, startDate, endDate) {
    return {
        id: Date.now().toString(),
        title,
        startDate,
        endDate,
        completed: false,
        deleted: false,
        createdAt: new Date().toISOString()
    };
}

function addTask(title, startDate, endDate) {
    const task = createTask(title, startDate, endDate);
    tasks.unshift(task); // Add to beginning of array
    saveTasksToStorage();
    renderTasks();
    showToast('Task added successfully');
}

function completeTask(taskId) {
    tasks = tasks.map(task => 
        task.id === taskId 
            ? { ...task, completed: true }
            : task
    );
    saveTasksToStorage();
    renderTasks();
    showToast('Task completed!');
}

function deleteTask(taskId) {
    tasks = tasks.map(task =>
        task.id === taskId
            ? { ...task, deleted: true }
            : task
    );
    saveTasksToStorage();
    renderTasks();
    showToast('Task deleted');
}

// UI Rendering
function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
}

function updateTaskCounts() {
    const pendingCount = tasks.filter(t => !t.completed && !t.deleted).length;
    const completedCount = tasks.filter(t => t.completed && !t.deleted).length;
    const deletedCount = tasks.filter(t => t.deleted).length;

    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('deletedCount').textContent = deletedCount;
}

function showToast(message) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger reflow
    toast.offsetHeight;

    // Add visible class
    toast.classList.add('visible');

    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

function createTaskElement(task) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-item ${task.completed ? 'completed-task' : ''} ${task.deleted ? 'deleted-task' : ''}`;
    
    const taskInfo = document.createElement('div');
    taskInfo.className = 'task-info';
    
    const title = document.createElement('div');
    title.className = 'task-title';
    title.textContent = task.title;
    
    const dates = document.createElement('div');
    dates.className = 'task-dates';
    dates.innerHTML = `
        <div>From: ${formatDate(task.startDate)}</div>
        <div>To: ${formatDate(task.endDate)}</div>
    `;
    
    taskInfo.appendChild(title);
    taskInfo.appendChild(dates);
    taskElement.appendChild(taskInfo);
    
    if (!task.deleted) {
        const actions = document.createElement('div');
        actions.className = 'task-actions';
        
        if (!task.completed) {
            const completeBtn = document.createElement('button');
            completeBtn.className = 'task-btn complete-btn';
            completeBtn.textContent = 'Complete';
            completeBtn.onclick = () => completeTask(task.id);
            actions.appendChild(completeBtn);
        }
        
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'task-btn delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.onclick = () => deleteTask(task.id);
        actions.appendChild(deleteBtn);
        
        taskElement.appendChild(actions);
    }
    
    return taskElement;
}

function renderTasks() {
    const pendingTasks = document.getElementById('pendingTasks');
    const completedTasks = document.getElementById('completedTasks');
    const deletedTasks = document.getElementById('deletedTasks');
    
    pendingTasks.innerHTML = '';
    completedTasks.innerHTML = '';
    deletedTasks.innerHTML = '';
    
    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        
        if (task.deleted) {
            deletedTasks.appendChild(taskElement);
        } else if (task.completed) {
            completedTasks.appendChild(taskElement);
        } else {
            pendingTasks.appendChild(taskElement);
        }
    });
}

function updateDateDisplay() {
    const dateDisplay = document.querySelector('.date-display');
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = new Date().toLocaleDateString('en-US', options);
}

// Tab Navigation
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.dataset.tab;
            
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            button.classList.add('active');
            document.getElementById(tabName).classList.add('active');
        });
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupTabs();
    renderTasks();
    updateDateDisplay();
    updateTaskCounts();
    
    const addTaskBtn = document.getElementById('addTask');
    const taskTitleInput = document.getElementById('taskTitle');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    
    // Set default dates
    const today = new Date().toISOString().split('T')[0];
    const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    startDateInput.value = today;
    endDateInput.value = tomorrow;
    
    addTaskBtn.addEventListener('click', () => {
        const title = taskTitleInput.value.trim();
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        
        if (title && startDate && endDate) {
            addTask(title, startDate, endDate);
            taskTitleInput.value = '';
            startDateInput.value = today;
            endDateInput.value = tomorrow;
        }
    });

    // Add keyboard support
    taskTitleInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            addTaskBtn.click();
        }
    });
});
