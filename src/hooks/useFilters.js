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

/**
 * Custom hook for filtering donations
 *
 * @param {Array} items - Array of items to filter
 * @param {Object} userLocation - User's location for distance filtering
 *
 * @returns {Object} Hook state and methods
 * @returns {Array} filteredItems - Filtered array of items
 * @returns {string} searchQuery - Current search query
 * @returns {Function} setSearchQuery - Update search query
 * @returns {string} selectedCategory - Currently selected category
 * @returns {Function} setSelectedCategory - Update category
 * @returns {Object} filters - Active filters (maxDistance, expiryDays)
 * @returns {Function} updateFilters - Update filter values
 * @returns {Function} clearFilters - Reset all filters
 * @returns {number} resultCount - Number of filtered results
 *
 * @example
 * ```javascript
 * function DonationList({ donations }) {
 *   const {
 *     filteredItems,
 *     searchQuery,
 *     setSearchQuery,
 *     selectedCategory,
 *     setSelectedCategory,
 *     clearFilters
 *   } = useFilters(donations, userLocation);
 *
 *   return (
 *     <>
 *       <SearchBar value={searchQuery} onChange={setSearchQuery} />
 *       <CategoryFilter value={selectedCategory} onChange={setSelectedCategory} />
 *       <DonationGrid items={filteredItems} />
 *     </>
 *   );
 * }
 * ```
 */
const useFilters = (items = [], userLocation = null) => {
  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [filters, setFilters] = useState({
    maxDistance: null, // Maximum distance in km
    expiryDays: null, // Items expiring within X days
  });

  /**
   * Search filter implementation
   *
   * Algorithm: Case-insensitive substring matching
   * - Converts both search query and item text to lowercase
   * - Searches in: name, description, category, location
   *
   * Time Complexity: O(n * m)
   * - n = number of items
   * - m = average string length
   *
   * Optimization: Early return for empty query
   * - Skips filtering if query is empty
   * - Prevents unnecessary iterations
   *
   * @param {Array} itemsToFilter - Items to search through
   * @param {string} query - Search query
   * @returns {Array} Filtered items
   */
  const applySearchFilter = useCallback((itemsToFilter, query) => {
    if (!query || query.trim() === '') {
      return itemsToFilter;
    }

    const lowerQuery = query.toLowerCase().trim();

    return itemsToFilter.filter((item) => {
      // Search fields
      const searchableText = [
        item.itemName || item.donationName || '',
        item.description || '',
        item.category || '',
        item.location?.address || '',
      ]
        .join(' ')
        .toLowerCase();

      return searchableText.includes(lowerQuery);
    });
  }, []);

  /**
   * Category filter implementation
   *
   * Algorithm: Exact match filtering
   * - Special case: 'all' returns all items
   * - Otherwise: exact category match
   *
   * Time Complexity: O(n)
   *
   * @param {Array} itemsToFilter - Items to filter
   * @param {string} category - Category to filter by
   * @returns {Array} Filtered items
   */
  const applyCategoryFilter = useCallback((itemsToFilter, category) => {
    if (!category || category === 'all') {
      return itemsToFilter;
    }

    return itemsToFilter.filter(
      (item) => item.category && item.category.toLowerCase() === category.toLowerCase(),
    );
  }, []);

  /**
   * Distance filter implementation
   *
   * Algorithm: Haversine formula for great-circle distance
   * - Calculates distance from user location to each item
   * - Filters items within specified radius
   *
   * Time Complexity: O(n)
   * - Each calculation is O(1)
   * - Linear scan through all items
   *
   * Prerequisites:
   * - Requires valid user location
   * - Requires items with valid coordinates
   *
   * Reference: See src/utils/location.js for distance calculation details
   *
   * @param {Array} itemsToFilter - Items to filter
   * @param {number} maxDistance - Maximum distance in km
   * @returns {Array} Filtered items
   */
  const applyDistanceFilter = useCallback(
    (itemsToFilter, maxDistance) => {
      if (!maxDistance || !userLocation) {
        return itemsToFilter;
      }

      return itemsToFilter.filter((item) => {
        if (!item.location?.latitude || !item.location?.longitude) {
          return false; // Exclude items without valid location
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

  /**
   * Expiry filter implementation
   *
   * Algorithm: Date comparison
   * - Calculates days until expiry
   * - Filters items expiring within specified days
   *
   * Time Complexity: O(n)
   *
   * Date Handling:
   * - Handles both Firestore Timestamps and JS Date objects
   * - Defensive programming: handles missing dates
   *
   * @param {Array} itemsToFilter - Items to filter
   * @param {number} expiryDays - Days until expiry threshold
   * @returns {Array} Filtered items
   */
  const applyExpiryFilter = useCallback((itemsToFilter, expiryDays) => {
    if (!expiryDays) {
      return itemsToFilter;
    }

    const now = new Date();
    const futureDate = new Date(now.getTime() + expiryDays * 24 * 60 * 60 * 1000);

    return itemsToFilter.filter((item) => {
      if (!item.expiryDate) {
        return true; // Include items without expiry date
      }

      // Handle Firestore Timestamp
      const expiryDate = item.expiryDate.toDate
        ? item.expiryDate.toDate()
        : new Date(item.expiryDate);

      return expiryDate <= futureDate;
    });
  }, []);

  /**
   * Apply all filters in sequence
   *
   * Pattern: Pipeline/Chain of Responsibility
   * - Each filter processes the output of the previous filter
   * - Order matters: more selective filters should run first
   * - Reference: "Design Patterns" by Gang of Four
   *
   * Performance Optimization: useMemo
   * - Memoizes result to prevent recalculation on every render
   * - Only recalculates when dependencies change
   * - Critical for large datasets
   *
   * Filter Order Rationale:
   * 1. Category (most selective, fastest)
   * 2. Distance (moderately selective, expensive calculation)
   * 3. Expiry (less selective, fast)
   * 4. Search (least selective, applied last for flexibility)
   *
   * Overall Time Complexity: O(n)
   * - Each filter is O(n)
   * - Sequential application doesn't compound complexity
   */
  const filteredItems = useMemo(() => {
    if (!Array.isArray(items)) {
      logger.warn('[useFilters] Items is not an array:', items);
      return [];
    }

    logger.info(`[useFilters] Applying filters to ${items.length} items`);

    let result = items;

    // Apply filters in order
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

  /**
   * Update filter values
   *
   * Pattern: Partial state updates
   * - Merges new filters with existing ones
   * - Allows updating individual filter values
   *
   * @param {Object} newFilters - Filter values to update
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  }, []);

  /**
   * Clear all filters
   *
   * UX Pattern: Reset functionality
   * - Returns to default state
   * - Useful for "Clear Filters" button
   */
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedCategory('all');
    setFilters({
      maxDistance: null,
      expiryDays: null,
    });
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
