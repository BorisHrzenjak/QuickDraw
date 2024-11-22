import { useQuery } from '@tanstack/react-query';

const CACHE_PREFIX = 'img_cache_';

// Function to get cached image from localStorage
const getCachedImage = (key: string): string | null => {
  try {
    return localStorage.getItem(CACHE_PREFIX + key);
  } catch {
    return null;
  }
};

// Function to set cached image in localStorage
const setCachedImage = (key: string, value: string) => {
  try {
    localStorage.setItem(CACHE_PREFIX + key, value);
  } catch {
    // Handle localStorage errors (e.g., quota exceeded)
    console.warn('Failed to cache image in localStorage');
  }
};

export const useImageCache = (imageData: string | undefined) => {
  return useQuery({
    queryKey: ['image', imageData],
    queryFn: async () => {
      if (!imageData) return null;

      // Check localStorage cache first
      const cachedData = getCachedImage(imageData);
      if (cachedData) {
        return cachedData;
      }

      // If not in cache, store it
      setCachedImage(imageData, `data:image/png;base64,${imageData}`);
      return `data:image/png;base64,${imageData}`;
    },
    enabled: !!imageData,
    staleTime: 24 * 60 * 60 * 1000, // Cache for 24 hours
    cacheTime: 24 * 60 * 60 * 1000, // Keep in memory for 24 hours
  });
};
