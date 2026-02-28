// hooks/useIndexedDB.ts
import { useState, useEffect, useCallback } from 'react';

export interface CalendarEvent {
  id: number;
  date: string;
  crop: string;
  event: string;
  type: 'planting' | 'maintenance' | 'harvest' | 'preparation';
  details: string;
  completed: boolean;
  priority: 'critical' | 'high' | 'medium' | 'low';
  season: 'long-rains' | 'short-rains' | 'dry';
  createdAt?: string;
  updatedAt?: string;
  synced?: boolean;
}

const DB_NAME = 'KlimatDB';
const DB_VERSION = 8; // Increment to 7 to force upgrade
const STORE_NAME = 'calendarEvents';

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    console.log('🔄 Opening IndexedDB with version:', DB_VERSION);
    const openDB = indexedDB.open(DB_NAME, DB_VERSION);

    openDB.onerror = () => {
      console.error('IndexedDB error:', openDB.error);
      setError('Failed to open database');
    };

    openDB.onsuccess = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      console.log('✅ IndexedDB opened successfully');
      console.log('📋 Available stores:', Array.from(database.objectStoreNames));
      
      // Check if our store exists
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        console.error(`❌ Store ${STORE_NAME} not found!`);
        setError(`Store ${STORE_NAME} not found`);
      } else {
        setDb(database);
        setIsReady(true);
      }
    };

    openDB.onupgradeneeded = (event) => {
      console.log('🆙 Database upgrade needed from version', event.oldVersion, 'to', event.newVersion);
      const database = (event.target as IDBOpenDBRequest).result;

      // Create calendar events store if it doesn't exist
      if (!database.objectStoreNames.contains(STORE_NAME)) {
        console.log('📅 Creating calendarEvents store...');
        const store = database.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('crop', 'crop', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
        store.createIndex('season', 'season', { unique: false });
        console.log('✅ calendarEvents store created with indexes');
      } else {
        console.log('📅 calendarEvents store already exists');
      }

      // Log all stores after upgrade
      console.log('📋 Stores after upgrade:', Array.from(database.objectStoreNames));
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // Helper to check if store exists before operations
  const ensureStoreExists = useCallback(() => {
    if (!db) {
      throw new Error('Database not initialized');
    }
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      throw new Error(`Store ${STORE_NAME} does not exist. Available stores: ${Array.from(db.objectStoreNames).join(', ')}`);
    }
  }, [db]);

  // Get all events
  const getAllEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!db) return [];
    
    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          console.log(`📦 Loaded ${request.result.length} events`);
          resolve(request.result);
        };
        request.onerror = () => {
          console.error('Error loading events:', request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Get events by month and year
  const getEventsByMonth = useCallback(async (year: number, month: number): Promise<CalendarEvent[]> => {
    if (!db) return [];

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const allEvents = request.result;
          const filtered = allEvents.filter(event => {
            const eventDate = new Date(event.date);
            return eventDate.getMonth() === month && eventDate.getFullYear() === year;
          });
          console.log(`📅 Found ${filtered.length} events for ${month + 1}/${year}`);
          resolve(filtered);
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Get events by crop
  const getEventsByCrop = useCallback(async (crop: string): Promise<CalendarEvent[]> => {
    if (!db) return [];

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('crop');
        const request = index.getAll(crop);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Get events by type
  const getEventsByType = useCallback(async (type: string): Promise<CalendarEvent[]> => {
    if (!db) return [];

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      return [];
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const index = store.index('type');
        const request = index.getAll(type);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Add a single event
  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>): Promise<number> => {
    if (!db) throw new Error('Database not initialized');

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const eventWithMeta = {
          ...event,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          synced: false,
        };

        console.log('💾 Adding event:', eventWithMeta);
        const request = store.add(eventWithMeta);

        request.onsuccess = () => {
          console.log('✅ Event added with ID:', request.result);
          resolve(request.result as number);
        };
        request.onerror = () => {
          console.error('Error adding event:', request.error);
          reject(request.error);
        };

        transaction.oncomplete = () => {
          console.log('✅ Transaction complete');
        };

        transaction.onerror = (e) => {
          console.error('Transaction error:', e);
        };
      } catch (error) {
        console.error('Error in addEvent:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Add multiple events (for initial seeding)
  const addEvents = useCallback(async (events: Omit<CalendarEvent, 'id'>[]): Promise<number[]> => {
    if (!db) throw new Error('Database not initialized');

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const ids: number[] = [];

        events.forEach((event, index) => {
          const eventWithMeta = {
            ...event,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            synced: false,
          };

          const request = store.add(eventWithMeta);

          request.onsuccess = () => {
            ids.push(request.result as number);
            if (index === events.length - 1) {
              console.log(`✅ Added ${ids.length} events`);
              resolve(ids);
            }
          };
        });

        transaction.onerror = () => reject(transaction.error);
      } catch (error) {
        console.error('Error in addEvents:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Update an event
  const updateEvent = useCallback(async (id: number, updates: Partial<CalendarEvent>): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);

        const getRequest = store.get(id);

        getRequest.onsuccess = () => {
          const event = getRequest.result;
          if (!event) {
            reject(new Error('Event not found'));
            return;
          }

          const updatedEvent = {
            ...event,
            ...updates,
            updatedAt: new Date().toISOString(),
            synced: false,
          };

          const putRequest = store.put(updatedEvent);
          putRequest.onsuccess = () => resolve();
          putRequest.onerror = () => reject(putRequest.error);
        };

        getRequest.onerror = () => reject(getRequest.error);
      } catch (error) {
        console.error('Error in updateEvent:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Delete an event
  const deleteEvent = useCallback(async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      throw e;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(STORE_NAME, 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
          console.log(`✅ Deleted event ${id}`);
          resolve();
        };
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Error in deleteEvent:', error);
        reject(error);
      }
    });
  }, [db, ensureStoreExists]);

  // Seed initial data if database is empty
  const seedInitialData = useCallback(async (initialEvents: Omit<CalendarEvent, 'id'>[]) => {
    if (!db) return;

    try {
      ensureStoreExists();
    } catch (e) {
      console.error(e);
      return;
    }

    try {
      const existingEvents = await getAllEvents();
      if (existingEvents.length === 0) {
        console.log('🌱 Seeding initial calendar events...');
        await addEvents(initialEvents);
        console.log('✅ Initial events seeded');
      } else {
        console.log(`📅 Database already has ${existingEvents.length} events`);
      }
    } catch (error) {
      console.error('Error seeding data:', error);
    }
  }, [db, getAllEvents, addEvents, ensureStoreExists]);

  return {
    isReady,
    error,
    getAllEvents,
    getEventsByMonth,
    getEventsByCrop,
    getEventsByType,
    addEvent,
    addEvents,
    updateEvent,
    deleteEvent,
    seedInitialData,
  };
}