// hooks/useMarketplaceDB.ts
import { useState, useEffect, useCallback } from 'react';
import type { FarmerContactInfo, MarketplaceProduct } from '@/types/marketplace';

const DB_NAME = 'KlimatDB';
const DB_VERSION = 3; // Increment version for new stores
const PROFILE_STORE = 'farmerProfile';
const PRODUCTS_STORE = 'marketplaceProducts';

export function useMarketplaceDB() {
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
      console.log('✅ Marketplace IndexedDB initialized');
    };

    openDB.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Create farmer profile store (single record)
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        // const profileStore = db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
        console.log('👨‍🌾 Created farmer profile store');
      }

      // Create products store
      if (!db.objectStoreNames.contains(PRODUCTS_STORE)) {
        const productStore = db.createObjectStore(PRODUCTS_STORE, { keyPath: 'id', autoIncrement: true });
        productStore.createIndex('category', 'category', { unique: false });
        productStore.createIndex('farmerName', 'farmerName', { unique: false });
        productStore.createIndex('postedDate', 'postedDate', { unique: false });
        productStore.createIndex('price', 'price', { unique: false });
        console.log('📦 Created marketplace products store');
      }
    };

    return () => {
      if (db) {
        db.close();
      }
    };
  }, []);

  // ============ PROFILE OPERATIONS ============

  // Get farmer profile
  const getFarmerProfile = useCallback(async (): Promise<FarmerContactInfo | null> => {
    if (!db) return null;

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILE_STORE, 'readonly');
      const store = transaction.objectStore(PROFILE_STORE);
      const request = store.get('current');

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Save farmer profile
  const saveFarmerProfile = useCallback(async (profile: FarmerContactInfo): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILE_STORE, 'readwrite');
      const store = transaction.objectStore(PROFILE_STORE);
      
      const profileWithId = {
        id: 'current',
        ...profile,
        updatedAt: new Date().toISOString(),
      };
      
      const request = store.put(profileWithId);

      request.onsuccess = () => {
        console.log('✅ Farmer profile saved');
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Delete farmer profile
  const deleteFarmerProfile = useCallback(async (): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PROFILE_STORE, 'readwrite');
      const store = transaction.objectStore(PROFILE_STORE);
      const request = store.delete('current');

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // ============ PRODUCT OPERATIONS ============

  // Get all products
  const getAllProducts = useCallback(async (): Promise<MarketplaceProduct[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get products by category
  const getProductsByCategory = useCallback(async (category: string): Promise<MarketplaceProduct[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const index = store.index('category');
      const request = index.getAll(category);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Get products by farmer
  const getProductsByFarmer = useCallback(async (farmerName: string): Promise<MarketplaceProduct[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const index = store.index('farmerName');
      const request = index.getAll(farmerName);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Add a single product
  const addProduct = useCallback(async (product: Omit<MarketplaceProduct, 'id'>): Promise<number> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      
      const productWithMeta = {
        ...product,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        synced: false,
      };
      
      const request = store.add(productWithMeta);

      request.onsuccess = () => {
        console.log('✅ Product added with ID:', request.result);
        resolve(request.result as number);
      };
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Add multiple products (for seeding)
  const addProducts = useCallback(async (products: Omit<MarketplaceProduct, 'id'>[]): Promise<number[]> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const ids: number[] = [];

      products.forEach((product, index) => {
        const productWithMeta = {
          ...product,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          synced: false,
        };
        
        const request = store.add(productWithMeta);
        
        request.onsuccess = () => {
          ids.push(request.result as number);
          if (index === products.length - 1) {
            resolve(ids);
          }
        };
      });

      transaction.onerror = () => reject(transaction.error);
    });
  }, [db]);

  // Update a product
  const updateProduct = useCallback(async (id: number, updates: Partial<MarketplaceProduct>): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const product = getRequest.result;
        if (!product) {
          reject(new Error('Product not found'));
          return;
        }

        const updatedProduct = {
          ...product,
          ...updates,
          updatedAt: new Date().toISOString(),
          synced: false,
        };

        const putRequest = store.put(updatedProduct);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      };

      getRequest.onerror = () => reject(getRequest.error);
    });
  }, [db]);

  // Delete a product
  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
      const store = transaction.objectStore(PRODUCTS_STORE);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }, [db]);

  // Seed initial products if database is empty
  const seedInitialProducts = useCallback(async (initialProducts: Omit<MarketplaceProduct, 'id'>[]) => {
    if (!db) return;

    const existingProducts = await getAllProducts();
    if (existingProducts.length === 0) {
      console.log('🌱 Seeding initial marketplace products...');
      await addProducts(initialProducts);
      console.log('✅ Initial products seeded');
    }
  }, [db, getAllProducts, addProducts]);

  return {
    isReady,
    error,
    // Profile operations
    getFarmerProfile,
    saveFarmerProfile,
    deleteFarmerProfile,
    // Product operations
    getAllProducts,
    getProductsByCategory,
    getProductsByFarmer,
    addProduct,
    addProducts,
    updateProduct,
    deleteProduct,
    seedInitialProducts,
  };
}