// calendar.js - Crop Calendar specific code

// State
let selectedCrops = [];
let tasks = [];
let isOnline = navigator.onLine;

/**
 * Initialize the calendar page
 */
async function initCalendarPage() {
    console.log('📅 Initializing Calendar page');
    
    // Check if already setup
    const calendarData = await Klimat.getFromDB('calendar', 'master-calendar');
    
    if (calendarData) {
        // Already have calendar, show tasks
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('calendarSection').style.display = 'block';
        await loadTasks();
    } else {
        // Need to setup
        document.getElementById('setupSection').style.display = 'block';
        document.getElementById('calendarSection').style.display = 'none';
        await loadSetupOptions();
    }
    
    // Set up event listeners
    setupEventListeners();
    
    // Update online status
    updateOnlineStatus();
    
    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
}

/**
 * Load setup options from API
 */
async function loadSetupOptions() {
    if (!Klimat.isOnline()) {
        document.getElementById('regionSelect').innerHTML = 
            '<option value="">⚠️ Need internet for setup</option>';
        document.getElementById('setupBtn').disabled = true;
        return;
    }
    
    try {
        // Load regions
        const regions = await fetch('/api/regions').then(r => r.json());
        const regionSelect = document.getElementById('regionSelect');
        regionSelect.innerHTML = '<option value="">Select your region...</option>';
        regions.forEach(region => {
            regionSelect.innerHTML += `<option value="${region.id}">${region.name}</option>`;
        });
        
        // Load crops
        const crops = await fetch('/api/crops').then(r => r.json());
        const cropsContainer = document.getElementById('cropsContainer');
        cropsContainer.innerHTML = '';
        crops.forEach(crop => {
            cropsContainer.innerHTML += `
                <label class="crop-checkbox-item">
                    <input type="checkbox" value="${crop.id}" class="crop-checkbox">
                    <span>${crop.name}</span>
                </label>
            `;
        });
        
        // Enable setup button when region selected and crops checked
        document.getElementById('regionSelect').addEventListener('change', checkSetupReady);
        document.querySelectorAll('.crop-checkbox').forEach(cb => {
            cb.addEventListener('change', checkSetupReady);
        });
        
    } catch (error) {
        console.error('Failed to load options:', error);
        Klimat.showToast('Failed to load setup options', 'error');
    }
}

/**
 * Check if setup is ready
 */
function checkSetupReady() {
    const regionSelected = document.getElementById('regionSelect').value;
    const cropsChecked = document.querySelectorAll('.crop-checkbox:checked').length > 0;
    document.getElementById('setupBtn').disabled = !(regionSelected && cropsChecked);
}

/**
 * Setup farm - download calendar data
 */
async function setupFarm() {
    const regionId = document.getElementById('regionSelect').value;
    const cropCheckboxes = document.querySelectorAll('.crop-checkbox:checked');
    const selectedCrops = Array.from(cropCheckboxes).map(cb => cb.value);
    
    const setupBtn = document.getElementById('setupBtn');
    setupBtn.disabled = true;
    setupBtn.innerHTML = '<span>⏳</span> Downloading...';
    
    try {
        // Call API to get calendar data
        const response = await fetch('/api/setup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                region_id: regionId,
                crops: selectedCrops
            })
        });
        
        const calendarData = await response.json();
        
        // Save to IndexedDB
        await Klimat.saveToDB('calendar', { 
            id: 'master-calendar', 
            data: calendarData,
            downloadedAt: new Date().toISOString()
        });
        
        // Generate tasks
        await generateTasks(calendarData, selectedCrops);
        
        // Show success
        Klimat.showToast('✅ Calendar downloaded! Works offline now', 'success');
        
        // Switch to calendar view
        document.getElementById('setupSection').style.display = 'none';
        document.getElementById('calendarSection').style.display = 'block';
        
        await loadTasks();
        
    } catch (error) {
        console.error('Setup failed:', error);
        Klimat.showToast('Setup failed. Check connection.', 'error');
        setupBtn.disabled = false;
        setupBtn.innerHTML = '<span>⬇️</span> Download Calendar & Setup Farm';
    }
}

/**
 * Generate tasks from calendar data
 */
async function generateTasks(calendarData, selectedCrops) {
    const today = new Date();
    const currentYear = today.getFullYear();
    const month = today.getMonth() + 1;
    const season = (month >= 3 && month <= 5) ? 'long_rains' : 
                   (month >= 10 && month <= 12) ? 'short_rains' : 'long_rains';
    
    const tasks = [];
    
    for (const cropId of selectedCrops) {
        const crop = calendarData.crops[cropId];
        if (!crop) continue;
        
        const seasonData = crop.seasons?.long_rains; // Simplified for demo
        if (!seasonData) continue;
        
        // Parse planting window
        const plantingStart = new Date(currentYear, 3, 25); // March 25
        
        // Generate tasks
        seasonData.tasks.forEach(template => {
            const taskDate = new Date(plantingStart);
            taskDate.setDate(plantingStart.getDate() + (template.days_from_planting || 0));
            
            tasks.push({
                id: `${cropId}_${template.id}_${Date.now()}_${Math.random()}`,
                cropId: cropId,
                cropName: crop.name,
                name: template.name,
                description: template.description,
                icon: template.icon || '🌱',
                priority: template.priority || 'medium',
                dueDate: taskDate.toISOString().split('T')[0],
                status: 'pending',
                notes: '',
                synced: false
            });
        });
    }
    
    // Save tasks
    await Klimat.saveToDB('tasks', tasks);
}

/**
 * Load tasks from IndexedDB
 */
async function loadTasks() {
    tasks = await Klimat.getFromDB('tasks') || [];
    
    // Get last sync time
    const metadata = await Klimat.getFromDB('metadata', 'tasks_last_sync');
    const lastSync = metadata ? new Date(metadata.value) : null;
    
    if (lastSync) {
        document.getElementById('lastSyncDate').textContent = 
            `Last sync: ${lastSync.toLocaleDateString()}`;
    }
    
    renderTasks();
    updateSyncStatus();
}

/**
 * Render tasks
 */
function renderTasks() {
    const container = document.getElementById('tasksList');
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's pending tasks
    const todayTasks = tasks.filter(t => t.dueDate === today && t.status !== 'done');
    
    if (todayTasks.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✅</div>
                <div class="empty-title">No tasks for today</div>
                <div class="empty-desc">Enjoy your day or check upcoming tasks</div>
            </div>
        `;
        return;
    }
    
    container.innerHTML = '';
    todayTasks.forEach(task => {
        container.innerHTML += renderTask(task);
    });
}

/**
 * Render a single task
 */
function renderTask(task) {
    return `
        <div class="task-card ${task.priority}" data-task-id="${task.id}">
            <div class="task-header">
                <span class="task-icon">${task.icon}</span>
                <div class="task-info">
                    <div class="task-title">${task.name}</div>
                    <div class="task-crop">${task.cropName}</div>
                </div>
                <span class="task-date">Due: ${task.dueDate}</span>
            </div>
            
            <div class="task-desc">${task.description || ''}</div>
            
            <div class="task-actions">
                <button class="task-btn btn-complete" onclick="completeTask('${task.id}')"
                        ${task.status === 'done' ? 'disabled' : ''}>
                    ${task.status === 'done' ? '✓ Done' : '✅ Complete'}
                </button>
                <button class="task-btn btn-note" onclick="addNote('${task.id}')">
                    📝 Note
                </button>
            </div>
            
            ${task.notes ? `
                <div class="task-note">
                    <strong>📝 Note:</strong> ${task.notes}
                </div>
            ` : ''}
        </div>
    `;
}

/**
 * Complete a task
 */
async function completeTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.status = 'done';
    task.completedDate = new Date().toISOString();
    task.synced = false;
    
    await Klimat.saveToDB('tasks', task);
    Klimat.showToast('✅ Task completed!', 'success');
    
    // Update UI
    await loadTasks();
    
    // Register for sync
    await Klimat.registerSync('sync-tasks');
}

/**
 * Add note to task
 */
async function addNote(taskId) {
    const note = prompt('Enter your note:');
    if (!note) return;
    
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    task.notes = note;
    task.synced = false;
    
    await Klimat.saveToDB('tasks', task);
    Klimat.showToast('📝 Note saved!', 'success');
    
    // Update UI
    await loadTasks();
    
    // Register for sync
    await Klimat.registerSync('sync-tasks');
}

/**
 * Update sync status
 */
async function updateSyncStatus() {
    const tasks = await Klimat.getFromDB('tasks') || [];
    const pending = tasks.filter(t => t.synced === false).length;
    
    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('syncBtn').disabled = pending === 0;
}

/**
 * Force sync (for demo)
 */
async function forceSync() {
    if (!Klimat.isOnline()) {
        Klimat.showToast('Cannot sync - you are offline', 'warning');
        return;
    }
    
    const syncBtn = document.getElementById('syncBtn');
    syncBtn.disabled = true;
    syncBtn.innerHTML = '⏳ Syncing...';
    
    try {
        // Get pending tasks
        const tasks = await Klimat.getFromDB('tasks') || [];
        const pendingTasks = tasks.filter(t => t.synced === false);
        
        // Simulate sync delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mark as synced
        for (const task of pendingTasks) {
            task.synced = true;
            await Klimat.saveToDB('tasks', task);
        }
        
        Klimat.showToast(`✓ Synced ${pendingTasks.length} items`, 'success');
        await updateSyncStatus();
        
    } catch (error) {
        console.error('Sync failed:', error);
        Klimat.showToast('Sync failed', 'error');
    } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = '🔄 Force Sync';
    }
}

/**
 * Set up event listeners
 */
function setupEventListeners() {
    document.getElementById('setupBtn').addEventListener('click', setupFarm);
    document.getElementById('goOfflineBtn').addEventListener('click', simulateOffline);
    document.getElementById('goOnlineBtn').addEventListener('click', simulateOnline);
    document.getElementById('syncBtn').addEventListener('click', forceSync);
}

/**
 * Update online status display
 */
function updateOnlineStatus() {
    isOnline = navigator.onLine;
    const badge = document.getElementById('onlineBadge');
    
    if (badge) {
        if (isOnline) {
            badge.className = 'online-badge';
            badge.textContent = '🟢 Online';
        } else {
            badge.className = 'offline-badge';
            badge.textContent = '🔴 Offline';
        }
    }
    
    document.getElementById('syncBtn').disabled = !isOnline;
}

/**
 * Simulate going offline (for demo)
 */
function simulateOffline() {
    document.getElementById('onlineBadge').className = 'offline-badge';
    document.getElementById('onlineBadge').textContent = '🔴 Offline (Demo)';
    document.getElementById('syncBtn').disabled = true;
    Klimat.showToast('📴 Offline mode - App still works with cached data!', 'info');
}

/**
 * Simulate coming online (for demo)
 */
function simulateOnline() {
    document.getElementById('onlineBadge').className = 'online-badge';
    document.getElementById('onlineBadge').textContent = '🟢 Online (Demo)';
    document.getElementById('syncBtn').disabled = false;
    Klimat.showToast('🟢 Online mode - You can sync now', 'info');
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (window.Klimat) {
        initCalendarPage();
    } else {
        const checkKlimat = setInterval(() => {
            if (window.Klimat) {
                clearInterval(checkKlimat);
                initCalendarPage();
            }
        }, 100);
    }
});