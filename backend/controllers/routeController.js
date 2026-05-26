const { getRoute } = require('../services/realRoutingService');
const { applyTrafficToSegments } = require('../services/trafficService');
const { getTravelProfiles } = require('../services/travelTimeService');

const SUPPORTED_MODES = new Set(['shortest', 'fastest']);

function parseLocation(value, label) {
  const lat = Number(value?.lat);
  const lng = Number(value?.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    const error = new Error(`${label} location must include valid lat and lng values.`);
    error.status = 400;
    throw error;
  }

  return {
    name: value?.name || label,
    lat,
    lng,
  };
}

async function calculateRoute(req, res, next) {
  try {
    const mode = SUPPORTED_MODES.has(req.body?.mode) ? req.body.mode : 'fastest';
    const source = parseLocation(req.body?.source, 'Source');
    const destination = parseLocation(req.body?.destination, 'Destination');

    // Get real route from OSRM instead of building fake graph
    const realRoute = await getRoute(source, destination, mode);
    
    // Apply traffic simulation to segments
    const trafficSegments = applyTrafficToSegments(realRoute.segments);
    
    // Calculate total metrics
    const totalDistanceKm = trafficSegments.reduce((sum, seg) => sum + seg.distanceKm, 0);
    const totalTrafficAdjustedMinutes = trafficSegments.reduce((sum, seg) => sum + seg.trafficAdjustedMinutes, 0);

    // Build response
    res.json({
      mode,
      algorithm: 'OSRM-Based Real Routing',
      source,
      destination,
      route: {
        coordinates: realRoute.coordinates,
        segments: trafficSegments.map((segment) => ({
          id: segment.id,
          name: segment.name,
          coordinates: segment.coordinates,
          traffic: segment.traffic,
          distanceKm: Number(segment.distanceKm.toFixed(3)),
          durationSeconds: segment.durationSeconds,
          trafficAdjustedMinutes: segment.trafficAdjustedMinutes,
          maneuver: segment.maneuver,
        })),
      },
      trafficSegments: trafficSegments.map((segment) => ({
        id: segment.id,
        coordinates: segment.coordinates,
        traffic: segment.traffic,
        distanceKm: Number(segment.distanceKm.toFixed(3)),
      })),
      metrics: {
        distanceKm: Number(totalDistanceKm.toFixed(2)),
        carMinutes: Math.max(1, Math.round(totalTrafficAdjustedMinutes)),
        travelTimes: getTravelProfiles(totalDistanceKm, totalTrafficAdjustedMinutes),
        optimizationBasis: mode === 'shortest' ? 'distance' : 'traffic-adjusted travel time',
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
}

module.exports = { calculateRoute };
