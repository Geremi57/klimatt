// app.js - SHARED across all pages
// Handles: IndexedDB, service worker, connection status, shared utilities

const APP_NAME = 'Klimat';
const DB_NAME = 'KlimatDB';
const DB_VERSION = 1;

// Global variables
let db = null;
let isOnline = navigator.onLine;

// ==================== INDEXEDDB SETUP ====================

/**
 * Initialize IndexedDB - creates all stores needed across the app
 * This runs once when the app first loads
 */
async function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = () => {
            console.error('IndexedDB error:', request.error);
            reject(request.error);
        };
        
        request.onsuccess = () => {
            db = request.result;
            console.log('✅ IndexedDB initialized');
            resolve(db);
        };
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            // ---------- Calendar/Tasks Store ----------
            if (!db.objectStoreNames.contains('tasks')) {
                const taskStore = db.createObjectStore('tasks', { keyPath: 'id' });
                taskStore.createIndex('dueDate', 'dueDate', { unique: false });
                taskStore.createIndex('cropId', 'cropId', { unique: false });
                taskStore.createIndex('status', 'status', { unique: false });
                taskStore.createIndex('synced', 'synced', { unique: false });
                console.log('📊 Created tasks store');
            }
            
            // ---------- Pests Store ----------
            if (!db.objectStoreNames.contains('pests')) {
                const pestStore = db.createObjectStore('pests', { keyPath: 'id' });
                pestStore.createIndex('crop', 'crops', { unique: false, multiEntry: true });
                pestStore.createIndex('name', 'name', { unique: false });
                console.log('🐛 Created pests store');
            }
            
            // ---------- Market Prices Store ----------
            if (!db.objectStoreNames.contains('prices')) {
                const priceStore = db.createObjectStore('prices', { keyPath: 'id' });
                priceStore.createIndex('marketId', 'marketId', { unique: false });
                priceStore.createIndex('product', 'product', { unique: false });
                priceStore.createIndex('date', 'date', { unique: false });
                console.log('💰 Created prices store');
            }
            
            // ---------- Markets Store ----------
            if (!db.objectStoreNames.contains('markets')) {
                const marketStore = db.createObjectStore('markets', { keyPath: 'id' });
                marketStore.createIndex('region', 'region', { unique: false });
                console.log('🏪 Created markets store');
            }
            
            // ---------- Calendar Data Store (master data) ----------
            if (!db.objectStoreNames.contains('calendar')) {
                db.createObjectStore('calendar', { keyPath: 'id' });
                console.log('📅 Created calendar store');
            }
            
            // ---------- Metadata Store (for sync timestamps, etc) ----------
            if (!db.objectStoreNames.contains('metadata')) {
                db.createObjectStore('metadata', { keyPath: 'key' });
                console.log('📋 Created metadata store');
            }
            
            // ---------- User Notes Store ----------
            if (!db.objectStoreNames.contains('notes')) {
                const noteStore = db.createObjectStore('notes', { keyPath: 'id', autoIncrement: true });
                noteStore.createIndex('taskId', 'taskId', { unique: false });
                noteStore.createIndex('timestamp', 'timestamp', { unique: false });
                noteStore.createIndex('synced', 'synced', { unique: false });
                console.log('📝 Created notes store');
            }
            
            // ---------- Photos Store ----------
            if (!db.objectStoreNames.contains('photos')) {
                const photoStore = db.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                photoStore.createIndex('taskId', 'taskId', { unique: false });
                photoStore.createIndex('synced', 'synced', { unique: false });
                console.log('📸 Created photos store');
            }
        };
    });
}

// ==================== GENERIC DB FUNCTIONS ====================

/**
 * Save data to any store
 * @param {string} storeName - Name of the store
 * @param {object|array} data - Data to save (single object or array)
 */
async function saveToDB(storeName, data) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        try {
            if (Array.isArray(data)) {
                data.forEach(item => store.put(item));
            } else {
                store.put(data);
            }
            
            tx.oncomplete = () => resolve(data);
            tx.onerror = (e) => reject(e.target.error);
        } catch (error) {
            reject(error);
        }
    });
}

/**
 * Get data from any store
 * @param {string} storeName - Name of the store
 * @param {string} [key] - Optional key to get specific item
 */
async function getFromDB(storeName, key = null) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        
        let request;
        if (key) {
            request = store.get(key);
        } else {
            request = store.getAll();
        }
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Query a store by index
 * @param {string} storeName - Name of the store
 * @param {string} indexName - Name of the index
 * @param {string} value - Value to query
 */
async function queryByIndex(storeName, indexName, value) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readonly');
        const store = tx.objectStore(storeName);
        const index = store.index(indexName);
        
        const request = index.getAll(value);
        
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

/**
 * Delete data from store
 */
async function deleteFromDB(storeName, key) {
    if (!db) await initDB();
    
    return new Promise((resolve, reject) => {
        const tx = db.transaction(storeName, 'readwrite');
        const store = tx.objectStore(storeName);
        
        const request = store.delete(key);
        
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e.target.error);
    });
}

// ==================== CONNECTION STATUS ====================

/**
 * Update connection status in UI
 * Looks for elements with class 'connection-status' or 'online-badge'
 */
function updateConnectionStatus() {
    isOnline = navigator.onLine;
    
    // Update all connection status elements
    const statusElements = document.querySelectorAll('.connection-status, .online-badge, .offline-badge');
    
    statusElements.forEach(el => {
        if (isOnline) {
            el.className = 'online-badge connection-status';
            el.innerHTML = '🟢 Online';
        } else {
            el.className = 'offline-badge connection-status';
            el.innerHTML = '🔴 Offline';
        }
    });
    
    // Also update any sync buttons
    const syncButtons = document.querySelectorAll('.sync-btn');
    syncButtons.forEach(btn => {
        btn.disabled = !isOnline;
    });
    
    return isOnline;
}

// ==================== SERVICE WORKER ====================

/**
 * Register service worker for offline support
 */
async function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        try {
            const registration = await navigator.serviceWorker.register('sw.js');
            console.log('✅ Service Worker registered');
            
            // Check for background sync support
            if ('SyncManager' in window) {
                console.log('📡 Background Sync supported');
            }
            
            return registration;
        } catch (error) {
            console.error('❌ Service Worker registration failed:', error);
        }
    }
}

// ==================== BACKGROUND SYNC ====================

/**
 * Register a background sync for pending data
 * @param {string} tag - Sync tag name
 */
async function registerSync(tag) {
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
            const registration = await navigator.serviceWorker.ready;
            await registration.sync.register(tag);
            console.log(`📡 Registered sync: ${tag}`);
        } catch (error) {
            console.error('Sync registration failed:', error);
        }
    }
}

// ==================== UTILITY FUNCTIONS ====================

/**
 * Format date to YYYY-MM-DD
 */
function formatDate(date = new Date()) {
    return date.toISOString().split('T')[0];
}

/**
 * Generate a random ID
 */
function generateId() {
    return Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Show a toast message
 */
function showToast(message, type = 'info') {
    // Check if toast container exists
    let toastContainer = document.querySelector('.toast-container');
    
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize the app - called by each page
 */
async function initializeApp() {
    console.log('🚀 Initializing Klimat...');
    
    // Initialize IndexedDB
    await initDB();
    
    // Register service worker
    await registerServiceWorker();
    
    // Set up connection status listeners
    updateConnectionStatus();
    window.addEventListener('online', updateConnectionStatus);
    window.addEventListener('offline', updateConnectionStatus);
    
    // Check if this is first run
    const setupComplete = await getFromDB('metadata', 'setup_complete');
    
    return {
        db,
        isOnline,
        setupComplete: !!setupComplete
    };
}

// Export functions for use in page-specific scripts
window.Klimat = {
    // Core
    initDB,
    saveToDB,
    getFromDB,
    queryByIndex,
    deleteFromDB,
    
    // Status
    isOnline: () => isOnline,
    updateConnectionStatus,
    
    // Sync
    registerSync,
    
    // Utils
    formatDate,
    generateId,
    showToast,
    
    // Initialize
    initializeApp
};

// Auto-initialize when script loads
document.addEventListener('DOMContentLoaded', () => {
    // Just prepare, don't block
    window.Klimat.initializeApp().then(app => {
        console.log('✅ Klimat ready');
    });
});