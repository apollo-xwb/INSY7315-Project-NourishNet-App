/**
 * useFilters Hook
 *
 * Purpose: Produces a filtered list from a source array using:
 * - search text
 * - selected category
 * - max distance (km) from user location
 * - expiry window (days)
 * Exposes setters to update each filter and clear them.
 */

import { useState, useMemo, useCallback } from 'react';
import { calculateDistance } from '../utils/location';
import logger from '../utils/logger';

const useFilters = (items = [], userLocation = null) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    maxDistance: null,
    expiryDays: null,
  });

  const applySearchFilter = useCallback((itemsToFilter, query) => {
    if (!query) {
      return itemsToFilter;
    }

    const normalizedQuery = query.trim().toLowerCase();

    return itemsToFilter.filter((item) => {
      const fieldsToSearch = [
        item.itemName,
        item.description,
        item.category,
        item.location?.address,
      ]
        .filter(Boolean)
        .map((field) => field.toLowerCase());

      return fieldsToSearch.some((field) => field.includes(normalizedQuery));
    });
  }, []);

  const applyCategoryFilter = useCallback((itemsToFilter, category) => {
    if (!category || category === 'all') {
      return itemsToFilter;
    }

    return itemsToFilter.filter(
      (item) => item.category && item.category.toLowerCase() === category.toLowerCase(),
    );
  }, []);

  const applyDistanceFilter = useCallback(
    (itemsToFilter, maxDistance) => {
      if (!maxDistance || !userLocation) {
        return itemsToFilter;
      }

      return itemsToFilter.filter((item) => {
        if (!item.location?.latitude || !item.location?.longitude) {
          return false;
        }

        const distance = calculateDistance(
          userLocation.latitude,
          userLocation.longitude,
          item.location.latitude,
          item.location.longitude,
        );

        return distance <= maxDistance;
      });
    },
    [userLocation],
  );

  const applyExpiryFilter = useCallback((itemsToFilter, expiryDays) => {
    if (!expiryDays) {
      return itemsToFilter;
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    return itemsToFilter.filter((item) => {
      if (!item.expiryDate) {
        return true;
      }

      const expiryDate = item.expiryDate.toDate
        ? item.expiryDate.toDate()
        : new Date(item.expiryDate);

      return expiryDate <= futureDate;
    });
  }, []);

  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) {
      logger.warn('[useFilters] Items is not an array:', items);
      return [];
    }

    logger.info(`[useFilters] Applying filters to ${items.length} items`);

    let result = items;

    result = applyCategoryFilter(result, selectedCategory);
    result = applyDistanceFilter(result, filters.maxDistance);
    result = applyExpiryFilter(result, filters.expiryDays);
    result = applySearchFilter(result, searchQuery);

    logger.info(`[useFilters] Filtered to ${result.length} items`);

    return result;
  }, [
    items,
    searchQuery,
    selectedCategory,
    filters,
    applySearchFilter,
    applyCategoryFilter,
    applyDistanceFilter,
    applyExpiryFilter,
  ]);

  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({ maxDistance: null, expiryDays: null });
  }, []);

  return {
    filteredItems,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filters,
    updateFilters,
    clearFilters,
    resultCount: filteredItems.length,
  };
};

export default useFilters;
