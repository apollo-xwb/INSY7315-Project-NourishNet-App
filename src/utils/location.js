// Geographic utilities for distance calculations and location formatting

// Earth's mean radius in kilometers (for Haversine distance calculations)
const EARTH_RADIUS_KM = 6371;

// Calculates distance between two coordinates using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  // Convert degrees to radians
  const toRad = (degrees) => (degrees * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  // Haversine formula implementation
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 100) / 100;
};

// Formats distance as meters (< 1km) or kilometers (>= 1km) for display
export const formatDistance = (km) => {
  if (km < 1) {
    const meters = Math.round(km * 1000);
    return `${meters}m`;
  }
  return `${km.toFixed(1)}km`;
};

// Checks if a point is within the given radius of another point
export const isWithinRadius = (point1, point2, radiusKm) => {
  const distance = calculateDistance(
    point1.latitude,
    point1.longitude,
    point2.latitude,
    point2.longitude,
  );
  return distance <= radiusKm;
};

// Sorts items by distance from a reference point (nearest first)
export const sortByDistance = (items, referencePoint) => {
  if (!referencePoint || !referencePoint.latitude || !referencePoint.longitude) {
    return items;
  }

  const itemsWithDistance = items.map((item) => {
    if (!item.location || !item.location.latitude || !item.location.longitude) {
      return { ...item, distance: Infinity };
    }

    const distance = calculateDistance(
      referencePoint.latitude,
      referencePoint.longitude,
      item.location.latitude,
      item.location.longitude,
    );

    return { ...item, distance };
  });

  return itemsWithDistance.sort((a, b) => a.distance - b.distance);
};

// Calculates the center point (centroid) of multiple coordinates
export const getCenterPoint = (coordinates) => {
  if (!coordinates || coordinates.length === 0) {
    return null;
  }

  const sum = coordinates.reduce(
    (acc, coord) => ({
      latitude: acc.latitude + coord.latitude,
      longitude: acc.longitude + coord.longitude,
    }),
    { latitude: 0, longitude: 0 },
  );

  return {
    latitude: sum.latitude / coordinates.length,
    longitude: sum.longitude / coordinates.length,
  };
};

// Validates that coordinates are within valid ranges
export const isValidCoordinates = (latitude, longitude) => {
  return (
    typeof latitude === 'number' &&
    typeof longitude === 'number' &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180 &&
    !isNaN(latitude) &&
    !isNaN(longitude)
  );
};

export default {
  calculateDistance,
  formatDistance,
  isWithinRadius,
  sortByDistance,
  getCenterPoint,
  isValidCoordinates,
  EARTH_RADIUS_KM,
};
