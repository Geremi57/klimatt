import Dexie, { type Table } from 'dexie';

export interface Crop {
  id?: number;
  name: string;
  variety: string;
  plantedDate: string;
  location: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface Pest {
  id?: number;
  cropId: number;
  cropName: string;
  symptom: string;
  possiblePests: string[];
  treatments: string[];
  severity: 'low' | 'medium' | 'high';
  dateDetected: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface MarketPrice {
  id?: number;
  cropName: string;
  price: number;
  currency: string;
  date: string;
  location: string;
  source: string;
  trend: 'up' | 'down' | 'stable';
  createdAt: string;
  synced: boolean;
}

export interface DiaryEntry {
  id?: number;
  date: string;
  title: string;
  content: string;
  cropIds: number[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
  synced: boolean;
}

export interface SyncQueue {
  id?: number;
  type: 'crop' | 'pest' | 'price' | 'diary';
  action: 'create' | 'update' | 'delete';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
  timestamp: string;
  retries: number;
  lastError?: string;
}

export class FarmAssistDB extends Dexie {
  crops!: Table<Crop>;
  pests!: Table<Pest>;
  marketPrices!: Table<MarketPrice>;
  diaryEntries!: Table<DiaryEntry>;
  syncQueue!: Table<SyncQueue>;

  constructor() {
    super('FarmAssistDB');
    this.version(1).stores({
      crops: '++id, &name, plantedDate',
      pests: '++id, cropId, dateDetected',
      marketPrices: '++id, cropName, date',
      diaryEntries: '++id, date',
      syncQueue: '++id, timestamp, type',
    });
  }
}

export const db = new FarmAssistDB();
