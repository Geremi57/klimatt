# 🌱 Klimat - Offline-First Farming Companion

Klimat is a **Progressive Web App (PWA)** designed for smallholder farmers in areas with limited internet connectivity. It provides crop calendars, pest identification, and market prices - all working **offline-first**.

## 🎯 The Problem

Most apps assume:
- 📶 Constant internet connection
- ⚡ Unlimited data
- 📱 Personal devices
- 🔋 Stable power

But reality looks different:
- 📴 Connections drop in rural areas
- 💰 Data is expensive
- 🔌 Power goes out
- 🌾 Farmers work in fields with no signal

## 💡 Our Solution

Klimat downloads everything **once during setup**, then works **completely offline**. When internet returns, it syncs silently in the background.

## 🏗️ Architecture

### Service Worker - The Offline Engine

The service worker acts like a smart cache manager:

```javascript
// sw.js - Simplified example
self.addEventListener('install', event => {
  // Cache all HTML, CSS, JS files during install
  event.waitUntil(caches.addAll([
    '/', '/calendar.html', '/app.js', '/styles.css'
  ]));
});

self.addEventListener('fetch', event => {
  // Serve from cache first, then network
  event.respondWith(
    caches.match(event.request) 
      .then(response => response || fetch(event.request))
  );
});
```

What it does:

    📦 Caches all app files on first visit

    🚀 Loads instantly even with no internet

    🔄 Handles background sync when online returns

    💾 Manages version updates

IndexedDB - The Local Database

IndexedDB stores all your farming data locally:
javascript

### Storing data offline
await db.tasks.add({
  id: 'task_123',
  name: 'Plant Maize',
  dueDate: '2026-04-03',
  status: 'pending'
});

### Querying offline - ALWAYS works
const todayTasks = await db.tasks
  .where('dueDate')
  .equals('2026-04-03')
  .toArray();

What it stores:

    📅 Crop calendars - downloaded once

    🐛 Pest database - names, symptoms, quick treatments

    💰 Market prices - cached with timestamps

    📝 User notes & photos - created offline

    ✅ Task completions - synced when online

✨ Key Features
📅 Crop Calendar

    Personalized based on your region and crops

    Shows what to do and when

    Mark tasks complete offline

    Add voice notes and photos

🐛 Pest Detective

    Select crop and symptoms

    Get instant matches from local database

    Quick treatment actions

    Full details when online

💰 Market Prices

    Last known prices always available

    Clear "cached" timestamps

    Compare between markets

    Auto-updates when online

```
klimat/
├── backend/           # Go server
│   ├── main.go
│   └── data/          # JSON data files
│       ├── crop_data.json
│       ├── pest_data.json
│       └── market_data.json
├── frontend/          # PWA frontend
│   ├── app.js         # Shared code (IndexedDB, service worker)
│   ├── calendar.html  # Crop calendar page
│   ├── calendar.js    # Calendar logic
│   ├── pests.html     # Pest detective page
│   ├── pests.js       # Pest logic
│   ├── markets.html   # Market prices page
│   ├── markets.js     # Market logic
│   ├── sw.js          # Service worker
│   └── styles.css     # Shared styles
└── README.md
```