// hooks/useMarketplaceDB.ts
import { useState, useEffect, useCallback } from 'react';
import type { FarmerContactInfo, MarketplaceProduct } from '@/types/marketplace';

const DB_NAME = 'KlimatDB';
const DB_VERSION = 7; // CHANGE FROM 4 TO 6
const PROFILE_STORE = 'farmerProfile';
const PRODUCTS_STORE = 'marketplaceProducts';

export function useMarketplaceDB() {
  const [db, setDb] = useState<IDBDatabase | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize IndexedDB
  useEffect(() => {
    console.log('🔄 Opening Marketplace IndexedDB with version:', DB_VERSION);
    
    const openDB = indexedDB.open(DB_NAME, DB_VERSION);

    openDB.onerror = () => {
      console.error('IndexedDB error:', openDB.error);
      setError('Failed to open database');
    };

    openDB.onsuccess = () => {
      console.log('✅ Marketplace DB opened successfully');
      setDb(openDB.result);
      setIsReady(true);
    };

    openDB.onupgradeneeded = (event) => {
      console.log('🆙 Marketplace DB upgrade from', event.oldVersion, 'to', event.newVersion);
      const db = (event.target as IDBOpenDBRequest).result;
      
      // Check if stores already exist before creating them
      
      // Create farmer profile store (single record)
      if (!db.objectStoreNames.contains(PROFILE_STORE)) {
        db.createObjectStore(PROFILE_STORE, { keyPath: 'id' });
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

      console.log('📋 Stores after upgrade:', Array.from(db.objectStoreNames));
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
    if (!db) {
      console.error('Database not initialized');
      return null;
    }

    // Check if store exists
    if (!db.objectStoreNames.contains(PROFILE_STORE)) {
      console.error(`Store ${PROFILE_STORE} does not exist. Available stores:`, Array.from(db.objectStoreNames));
      return null;
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(PROFILE_STORE, 'readonly');
        const store = transaction.objectStore(PROFILE_STORE);
        const request = store.get('current');

        request.onsuccess = () => {
          console.log('✅ Profile loaded:', request.result);
          resolve(request.result || null);
        };
        
        request.onerror = () => {
          console.error('Error loading profile:', request.error);
          reject(request.error);
        };
      } catch (error) {
        console.error('Transaction error:', error);
        reject(error);
      }
    });
  }, [db]);

  // Save farmer profile
  const saveFarmerProfile = useCallback(async (profile: FarmerContactInfo): Promise<void> => {
    if (!db) {
      console.error('Database not initialized');
      throw new Error('Database not initialized');
    }

    // Check if store exists
    if (!db.objectStoreNames.contains(PROFILE_STORE)) {
      console.error(`Store ${PROFILE_STORE} does not exist. Available stores:`, Array.from(db.objectStoreNames));
      throw new Error(`Store ${PROFILE_STORE} does not exist`);
    }

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(PROFILE_STORE, 'readwrite');
        const store = transaction.objectStore(PROFILE_STORE);
        
        const profileWithId = {
          id: 'current',
          ...profile,
          updatedAt: new Date().toISOString(),
        };
        
        console.log('💾 Saving profile:', profileWithId);
        const request = store.put(profileWithId);

        request.onsuccess = () => {
          console.log('✅ Farmer profile saved');
          resolve();
        };
        
        request.onerror = () => {
          console.error('Error saving profile:', request.error);
          reject(request.error);
        };

        transaction.oncomplete = () => {
          console.log('✅ Transaction complete');
        };

        transaction.onerror = (e) => {
          console.error('Transaction error:', e);
        };
      } catch (error) {
        console.error('Transaction creation error:', error);
        reject(error);
      }
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
      try {
        const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
        const store = transaction.objectStore(PRODUCTS_STORE);
        const request = store.getAll();

        request.onsuccess = () => {
          console.log(`📦 Loaded ${request.result.length} products`);
          resolve(request.result);
        };
        
        request.onerror = () => reject(request.error);
      } catch (error) {
        console.error('Error getting products:', error);
        reject(error);
      }
    });
  }, [db]);

  // Get products by category
  const getProductsByCategory = useCallback(async (category: string): Promise<MarketplaceProduct[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
        const store = transaction.objectStore(PRODUCTS_STORE);
        const index = store.index('category');
        const request = index.getAll(category);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Get products by farmer
  const getProductsByFarmer = useCallback(async (farmerName: string): Promise<MarketplaceProduct[]> => {
    if (!db) return [];

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(PRODUCTS_STORE, 'readonly');
        const store = transaction.objectStore(PRODUCTS_STORE);
        const index = store.index('farmerName');
        const request = index.getAll(farmerName);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Add a single product
  const addProduct = useCallback(async (product: Omit<MarketplaceProduct, 'id'>): Promise<number> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Add multiple products (for seeding)
  const addProducts = useCallback(async (products: Omit<MarketplaceProduct, 'id'>[]): Promise<number[]> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Update a product
  const updateProduct = useCallback(async (id: number, updates: Partial<MarketplaceProduct>): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      try {
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
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Delete a product
  const deleteProduct = useCallback(async (id: number): Promise<void> => {
    if (!db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      try {
        const transaction = db.transaction(PRODUCTS_STORE, 'readwrite');
        const store = transaction.objectStore(PRODUCTS_STORE);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      } catch (error) {
        reject(error);
      }
    });
  }, [db]);

  // Seed initial products if database is empty
  const seedInitialProducts = useCallback(async (initialProducts: Omit<MarketplaceProduct, 'id'>[]) => {
    if (!db) return;

    try {
      const existingProducts = await getAllProducts();
      if (existingProducts.length === 0) {
        console.log('🌱 Seeding initial marketplace products...');
        await addProducts(initialProducts);
        console.log('✅ Initial products seeded');
      } else {
        console.log(`📦 Database already has ${existingProducts.length} products`);
      }
    } catch (error) {
      console.error('Error seeding products:', error);
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