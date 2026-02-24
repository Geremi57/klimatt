// calendar.js - Crop Calendar specific code

// State
let currentDate = new Date();
let tasks = [];
let crops = [];
let selectedTaskForNote = null;

/**
 * Initialize the calendar page
 */
async function initCalendarPage() {
    console.log('📅 Initializing Calendar page');
    
    // Format and display current date
    updateDateDisplay();
    
    // Load tasks from IndexedDB
    await loadTasks();
    
    // Set up event listeners
    setupEventListeners();
    
    // Update online status display
    updateOnlineStatusDisplay();
}

/**
 * Update the date display
 */
function updateDateDisplay() {
    const options = { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    };
    document.getElementById('currentDateDisplay').textContent = 
        currentDate.toLocaleDateString(undefined, options);
}

/**
 * Load tasks from IndexedDB
 */
async function loadTasks() {
    try {
        // Get all tasks
        tasks = await window.Klimat.getFromDB('tasks') || [];
        
        // Get crops for reference
        const calendarData = await window.Klimat.getFromDB('calendar', 'master-calendar');
        if (calendarData && calendarData.data && calendarData.data.crops) {
            crops = Object.values(calendarData.data.crops);
        }
        
        // Update UI
        updateStats();
        renderTasks();
        
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

/**
 * Update statistics
 */
function updateStats() {
    const todayStr = formatDate(currentDate);
    const today = new Date(todayStr);
    
    // Count today's tasks
    const todayTasks = tasks.filter(task => 
        task.dueDate === todayStr && task.status !== 'done'
    );
    
    // Count overdue tasks
    const overdueTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate < today && task.status !== 'done';
    });
    
    // Count completed tasks
    const completedTasks = tasks.filter(task => task.status === 'done');
    
    // Update UI
    document.getElementById('todayCount').textContent = todayTasks.length;
    document.getElementById('overdueCount').textContent = overdueTasks.length;
    document.getElementById('completedCount').textContent = completedTasks.length;
}

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date) {
    return date.toISOString().split('T')[0];
}

/**
 * Render tasks for current date
 */
function renderTasks() {
    const container = document.getElementById('tasksContainer');
    const todayStr = formatDate(currentDate);
    
    // Get tasks for today
    const todayTasks = tasks.filter(task => task.dueDate === todayStr);
    
    // Get upcoming tasks (next 7 days)
    const nextWeek = new Date(currentDate);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate > currentDate && 
               taskDate <= nextWeek && 
               task.status !== 'done';
    });
    
    // Get overdue tasks
    const overdueTasks = tasks.filter(task => {
        const taskDate = new Date(task.dueDate);
        return taskDate < currentDate && task.status !== 'done';
    });
    
    if (tasks.length === 0) {
        // Show empty state with setup button
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🌱</div>
                <div class="empty-title">No tasks yet</div>
                <div class="empty-desc">Set up your farm to start tracking tasks</div>
                <button class="setup-btn" onclick="window.location.href='index.html'">
                    <span>⚙️</span> Set Up Farm
                </button>
            </div>
        `;
        return;
    }
    
    let html = '';
    
    // Overdue section
    if (overdueTasks.length > 0) {
        html += `
            <div class="section-title">
                <h3>⚠️ Overdue</h3>
            </div>
        `;
        overdueTasks.forEach(task => {
            html += renderTaskCard(task, true);
        });
    }
    
    // Today's tasks section
    html += `
        <div class="section-title">
            <h3>📌 Today (${todayTasks.length})</h3>
        </div>
    `;
    
    if (todayTasks.length === 0) {
        html += `
            <div class="empty-state" style="padding: 20px;">
                <div class="empty-icon">✅</div>
                <div class="empty-title">No tasks for today</div>
                <div class="empty-desc">Enjoy your day or plan ahead</div>
            </div>
        `;
    } else {
        todayTasks.forEach(task => {
            html += renderTaskCard(task);
        });
    }
    
    // Upcoming section
    if (upcomingTasks.length > 0) {
        html += `
            <div class="section-title">
                <h3>📅 Upcoming (next 7 days)</h3>
                <a href="#" class="view-all">View all →</a>
            </div>
        `;
        // Show only first 3 upcoming
        upcomingTasks.slice(0, 3).forEach(task => {
            html += renderTaskCard(task);
        });
    }
    
    container.innerHTML = html;
}

/**
 * Render a single task card
 */
function renderTaskCard(task, isOverdue = false) {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    const isToday = formatDate(dueDate) === formatDate(today);
    
    let badges = '';
    if (isOverdue) {
        badges += '<span class="task-badge badge-overdue">OVERDUE</span>';
    }
    if (isToday && !isOverdue) {
        badges += '<span class="task-badge badge-today">TODAY</span>';
    }
    if (task.recurring) {
        badges += '<span class="task-badge badge-recurring">RECURRING</span>';
    }
    
    // Check if task has notes
    const hasNotes = task.notes ? true : false;
    
    return `
        <div class="task-card ${task.priority || 'medium'} ${task.status === 'done' ? 'completed' : ''}" 
             data-task-id="${task.id}">
            <div class="task-header">
                <span class="task-icon">${task.icon || '🌱'}</span>
                <div class="task-info">
                    <div class="task-title">${task.name}</div>
                    <div class="task-crop">${task.cropName || 'General'}</div>
                </div>
                <div class="task-badges">
                    ${badges}
                </div>
            </div>
            
            <div class="task-desc">${task.description || ''}</div>
            
            <div class="task-actions">
                <button class="task-btn btn-complete" 
                        onclick="completeTask('${task.id}')"
                        ${task.status === 'done' ? 'disabled' : ''}>
                    ${task.status === 'done' ? '✓ Done' : '✅ Complete'}
                </button>
                <button class="task-btn btn-note" onclick="addNote('${task.id}')">
                    📝 Note
                </button>
                <button class="task-btn btn-photo" onclick="addPhoto('${task.id}')">
                    📸 Photo
                </button>
            </div>
            
            ${task.notes ? `
                <div class="task-note">
                    <strong>📝 Note:</strong> ${task.notes}
                </div>
            ` : ''}
            
            ${task.photos && task.photos.length > 0 ? `
                <div style="margin-top: 10px; padding-left: 52px;">
                    ${task.photos.map(photo => `
                        <img src="${photo.thumbnail || 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'%3E%3Crect width=\'50\' height=\'50\' fill=\'%23ddd\'/%3E%3Ctext x=\'10\' y=\'30\' font-size=\'20\'%3E📸%3C/text%3E%3C/svg%3E'}" 
                             class="photo-thumb" 
                             onclick="viewPhoto('${task.id}')"
                             alt="Task photo">
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Complete a task (works offline)
 */
async function completeTask(taskId) {
    try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.status = 'done';
        task.completedDate = new Date().toISOString();
        task.synced = false;
        
        // Save to IndexedDB
        await window.Klimat.saveToDB('tasks', task);
        
        // Update local tasks array
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = task;
        }
        
        // Show success message
        window.Klimat.showToast('✅ Task completed!', 'success');
        
        // Update UI
        updateStats();
        renderTasks();
        
        // Register for background sync
        await window.Klimat.registerSync('sync-tasks');
        
    } catch (error) {
        console.error('Error completing task:', error);
        window.Klimat.showToast('Failed to complete task', 'error');
    }
}

/**
 * Add note to task (works offline)
 */
async function addNote(taskId) {
    const note = prompt('Enter your note:');
    if (!note) return;
    
    try {
        const task = tasks.find(t => t.id === taskId);
        if (!task) return;
        
        task.notes = note;
        task.synced = false;
        
        // Save to IndexedDB
        await window.Klimat.saveToDB('tasks', task);
        
        // Update local tasks array
        const index = tasks.findIndex(t => t.id === taskId);
        if (index !== -1) {
            tasks[index] = task;
        }
        
        window.Klimat.showToast('📝 Note saved!', 'success');
        
        // Update UI
        renderTasks();
        
        // Register for background sync
        await window.Klimat.registerSync('sync-tasks');
        
    } catch (error) {
        console.error('Error adding note:', error);
        window.Klimat.showToast('Failed to save note', 'error');
    }
}

/**
 * Add photo to task (works offline)
 */
async function addPhoto(taskId) {
    // Simulate photo capture (in real app, would use camera API)
    const useCamera = confirm('Take photo? (OK to simulate, Cancel to select from gallery)');
    
    // Create a simulated photo
    const photo = {
        id: window.Klimat.generateId(),
        taskId: taskId,
        data: '📸', // Simulated photo
        thumbnail: 'data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'50\' height=\'50\'%3E%3Crect width=\'50\' height=\'50\' fill=\'%23' + Math.floor(Math.random()*16777215).toString(16) + '\'/%3E%3Ctext x=\'10\' y=\'30\' font-size=\'20\'%3E📸%3C/text%3E%3C/svg%3E',
        timestamp: new Date().toISOString(),
        synced: false
    };
    
    try {
        // Save photo to IndexedDB
        await window.Klimat.saveToDB('photos', photo);
        
        // Update task with photo reference
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            if (!task.photos) task.photos = [];
            task.photos.push(photo);
            task.synced = false;
            await window.Klimat.saveToDB('tasks', task);
        }
        
        window.Klimat.showToast('📸 Photo saved!', 'success');
        
        // Update UI
        renderTasks();
        
        // Register for background sync
        await window.Klimat.registerSync('sync-tasks');
        
    } catch (error) {
        console.error('Error adding photo:', error);
        window.Klimat.showToast('Failed to save photo', 'error');
    }
}

/**
 * View photo
 */
function viewPhoto(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task || !task.photos) return;
    
    // Simple view - in real app would show gallery
    alert(`📸 Task "${task.name}" has ${task.photos.length} photo(s)`);
}

/**
 * Navigate to previous day
 */
function previousDay() {
    currentDate.setDate(currentDate.getDate() - 1);
    updateDateDisplay();
    renderTasks();
}

/**
 * Navigate to next day
 */
function nextDay() {
    currentDate.setDate(currentDate.getDate() + 1);
    updateDateDisplay();
    renderTasks();
}

/**
 * Quick add menu
 */
function showQuickAdd() {
    const action = prompt('Quick add:\n1. 📝 Note\n2. 📸 Photo\n3. 🌱 New task');
    
    switch(action) {
        case '1':
            const taskId = prompt('Enter task ID (from console)');
            if (taskId) addNote(taskId);
            break;
        case '2':
            const photoTaskId = prompt('Enter task ID (from console)');
            if (photoTaskId) addPhoto(photoTaskId);
            break;
        case '3':
            alert('Use the Setup page to add new crops and tasks');
            break;
        default:
            break;
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    // Date navigation
    document.getElementById('prevDayBtn').addEventListener('click', previousDay);
    document.getElementById('nextDayBtn').addEventListener('click', nextDay);
    
    // Quick add button
    document.getElementById('quickAddBtn').addEventListener('click', showQuickAdd);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft') {
            previousDay();
        } else if (e.key === 'ArrowRight') {
            nextDay();
        }
    });
}

/**
 * Update online status display
 */
function updateOnlineStatusDisplay() {
    const badge = document.getElementById('onlineBadge');
    if (badge && window.Klimat) {
        if (window.Klimat.isOnline()) {
            badge.className = 'online-badge';
            badge.textContent = '🟢 Online';
        } else {
            badge.className = 'offline-badge';
            badge.textContent = '🔴 Offline';
        }
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Make sure Klimat is loaded
    if (window.Klimat) {
        initCalendarPage();
    } else {
        // Wait for Klimat to load
        const checkKlimat = setInterval(() => {
            if (window.Klimat) {
                clearInterval(checkKlimat);
                initCalendarPage();
            }
        }, 100);
    }
    
    // Update online status when it changes
    window.addEventListener('online', () => {
        updateOnlineStatusDisplay();
        // Could auto-sync here
    });
    window.addEventListener('offline', updateOnlineStatusDisplay);
});