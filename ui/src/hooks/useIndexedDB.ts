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
const DB_VERSION = 3;  // CHANGE THIS FROM 2 TO 3 to match marketplace
const STORE_NAME = 'calendarEvents';

export function useIndexedDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    const openDB = indexedDB.open(DB_NAME, DB_VERSION);

    openDB.onerror = () => {
      setError('Failed to open database');
      console.error('IndexedDB error:', openDB.error);
    };

    openDB.onsuccess = () => {
      setDb(openDB.result);
      setIsReady(true);
      console.log('✅ IndexedDB initialized');
    };

    openDB.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // Create calendar events store if it doesn't exist
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        store.createIndex('date', 'date', { unique: false });
        store.createIndex('crop', 'crop', { unique: false });
        store.createIndex('type', 'type', { unique: false });
        store.createIndex('priority', 'priority', { unique: false });
        store.createIndex('completed', 'completed', { unique: false });
        store.createIndex('season', 'season', { unique: false });
        console.log('📅 Created calendarEvents store');
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // ... rest of your hook code remains the same

  // Get all events
  const getAllEvents = useCallback(async (): Promise<CalendarEvent[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get events by month and year
  const getEventsByMonth = useCallback(async (year: number, month: number): Promise<CalendarEvent[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const allEvents = request.result;
        const filtered = allEvents.filter(event => {
          const eventDate = new Date(event.date);
          return eventDate.getMonth() === month && eventDate.getFullYear() === year;
        });
        resolve(filtered);
      };
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get events by crop
  const getEventsByCrop = useCallback(async (crop: string): Promise<CalendarEvent[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('crop');
      const request = index.getAll(crop);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get events by type
  const getEventsByType = useCallback(async (type: string): Promise<CalendarEvent[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const index = store.index('type');
      const request = index.getAll(type);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Add a single event
  const addEvent = useCallback(async (event: Omit<CalendarEvent, 'id'>): Promise<number> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const eventWithMeta = {
        ...event,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      };

      const request = store.add(eventWithMeta);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Add multiple events (for initial seeding)
  const addEvents = useCallback(async (events: Omit<CalendarEvent, 'id'>[]): Promise<number[]> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
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
            resolve(ids);
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }, [db]);

  // Update an event
  const updateEvent = useCallback(async (id: number, updates: Partial<CalendarEvent>): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
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
    });
  }, [db]);

  // Delete an event
  const deleteEvent = useCallback(async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Seed initial data if database is empty
  const seedInitialData = useCallback(async (initialEvents: Omit<CalendarEvent, 'id'>[]) => {
    if (!db) return;

    const existingEvents = await getAllEvents();
    if (existingEvents.length === 0) {
      console.log('🌱 Seeding initial calendar events...');
      await addEvents(initialEvents);
      console.log('✅ Initial events seeded');
    }
  }, [db, getAllEvents, addEvents]);

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