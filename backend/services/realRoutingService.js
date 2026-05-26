/**
 * Real routing service using OSRM (Open Source Routing Machine)
 * 
 * OSRM returns actual road geometry, distances, and durations.
 * This replaces the fake graph system with real routing data.
 */

const fetch = require('node-fetch');
const { haversineDistance } = require('../utils/geo');

const OSRM_URL = 'https://router.project-osrm.org';

/**
 * Fetch route from OSRM
 * Supports multiple profiles: car, bike, foot
 * Returns actual road geometry and metrics
 */
async function fetchOSRMRoute(source, destination, profile = 'car') {
  const coordinates = `${source.lng},${source.lat};${destination.lng},${destination.lat}`;
  const url = `${OSRM_URL}/route/v1/${profile}/${coordinates}?geometries=geojson&steps=true&alternatives=2&annotations=distance,duration,speed`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`OSRM request failed: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(`Failed to fetch route from OSRM: ${error.message}`);
  }
}

/**
 * Convert OSRM route to Traffix route format
 * Includes coordinates, segments, and metrics
 */
function parseOSRMRoute(osrmData, source, destination, profile = 'car') {
  if (!osrmData.routes || osrmData.routes.length === 0) {
    throw new Error('No route found from OSRM');
  }

  // Use first route (shortest by default)
  const route = osrmData.routes[0];
  const geometry = route.geometry.coordinates;
  
  // Convert to [lat, lng] format for Leaflet
  const coordinates = geometry.map(([lng, lat]) => [lat, lng]);
  
  // Convert to meters and seconds
  const distanceMeters = route.distance;
  const durationSeconds = route.duration;
  const distanceKm = distanceMeters / 1000;
  const durationMinutes = durationSeconds / 60;

  // Parse route steps into segments
  const segments = [];
  let stepIndex = 0;

  if (route.legs && route.legs[0].steps) {
    route.legs[0].steps.forEach((step, idx) => {
      const stepGeometry = step.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
      segments.push({
        id: `segment-${idx}`,
        coordinates: stepGeometry,
        distanceKm: (step.distance / 1000),
        durationSeconds: step.duration,
        name: step.name || 'Road',
        maneuver: step.maneuver?.type || 'straight',
      });
    });
  } else {
    // Fallback: create single segment if steps not available
    segments.push({
      id: 'segment-0',
      coordinates,
      distanceKm,
      durationSeconds,
      name: `${source.name} to ${destination.name}`,
      maneuver: 'straight',
    });
  }

  return {
    coordinates,
    segments,
    metrics: {
      distanceKm: Number(distanceKm.toFixed(2)),
      durationSeconds: Math.round(durationSeconds),
      durationMinutes: Math.round(durationMinutes),
      profile,
    },
    allRoutes: osrmData.routes,
  };
}

/**
 * Get shortest route (optimized for distance)
 */
async function getShortestRoute(source, destination) {
  const osrmData = await fetchOSRMRoute(source, destination, 'car');
  return parseOSRMRoute(osrmData, source, destination, 'car');
}

/**
 * Get fastest route (optimized for time, considering traffic-like preferences)
 * Currently uses OSRM alternatives to find different routes and selects fastest
 */
async function getFastestRoute(source, destination) {
  const osrmData = await fetchOSRMRoute(source, destination, 'car');
  
  if (osrmData.routes.length > 1) {
    // Sort routes by duration/distance ratio to find fastest
    const routesWithScore = osrmData.routes.map((r, idx) => ({
      index: idx,
      duration: r.duration,
      distance: r.distance,
      score: r.duration / (r.distance / 1000), // time per km
    }));
    
    routesWithScore.sort((a, b) => a.score - b.score);
    
    // Use fastest route
    osrmData.routes = [osrmData.routes[routesWithScore[0].index]];
  }
  
  return parseOSRMRoute(osrmData, source, destination, 'car');
}

/**
 * Get route with specified mode (shortest or fastest)
 */
async function getRoute(source, destination, mode = 'fastest') {
  if (mode === 'shortest') {
    return getShortestRoute(source, destination);
  }
  return getFastestRoute(source, destination);
}

module.exports = {
  getRoute,
  getShortestRoute,
  getFastestRoute,
  fetchOSRMRoute,
  parseOSRMRoute,
};
