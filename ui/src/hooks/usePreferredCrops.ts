import { useState, useCallback } from 'react';

const AVAILABLE_CROPS = [
  'Maize',
  'Wheat',
  'Rice',
  'Beans',
  'Potatoes',
  'Tomatoes',
  'Cabbage',
  'Onions',
  'Carrots',
  'Lettuce',
  'Spinach',
  'Sorghum',
  'Millet',
  'Barley',
  'Soybeans',
  'Peanuts',
  'Cotton',
  'Sugarcane',
];

export function usePreferredCrops() {
  const [preferredCrops, setPreferredCrops] = useState<string[]>([
    'Maize',
    'Beans',
  ]);

  const addCrop = useCallback((crop: string) => {
    setPreferredCrops((prev) => {
      if (!prev.includes(crop)) {
        return [...prev, crop];
      }
      return prev;
    });
  }, []);

  const removeCrop = useCallback((crop: string) => {
    setPreferredCrops((prev) => prev.filter((c) => c !== crop));
  }, []);

  const updateCrops = useCallback((crops: string[]) => {
    setPreferredCrops(crops);
  }, []);

  return {
    preferredCrops,
    addCrop,
    removeCrop,
    updateCrops,
    availableCrops: AVAILABLE_CROPS,
  };
}
