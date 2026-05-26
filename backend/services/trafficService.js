const TRAFFIC = {
  low: {
    label: 'Low Traffic',
    multiplier: 1.05,
    color: '#22c55e',
  },
  medium: {
    label: 'Medium Traffic',
    multiplier: 1.55,
    color: '#facc15',
  },
  heavy: {
    label: 'Heavy Traffic',
    multiplier: 2.35,
    color: '#ef4444',
  },
};

/**
 * Hash a string to get a deterministic number for traffic simulation
 * Same route segment gets the same traffic level
 */
function hashString(value) {
  return value.split('').reduce((hash, character) => hash + character.charCodeAt(0), 0);
}

/**
 * Determine traffic level for a segment based on time and hash
 * This simulates realistic traffic patterns
 */
function getTrafficLevel(segmentId) {
  const hour = new Date().getHours();
  
  // Rush hour pressure increases traffic
  let rushHourPressure = 0;
  if ((hour >= 7 && hour <= 10) || (hour >= 16 && hour <= 20)) {
    rushHourPressure = 3;
  }
  
  // Simulate traffic that changes every 45 seconds
  const timeSlot = Math.floor(Date.now() / 45000);
  const seed = (hashString(segmentId) + rushHourPressure + timeSlot) % 10;

  if (seed <= 3) return 'low';
  if (seed >= 7) return 'heavy';
  return 'medium';
}

/**
 * Apply traffic conditions to route segments
 * Works with real OSRM route segments
 */
function applyTrafficToSegments(segments) {
  return segments.map((segment) => {
    const level = getTrafficLevel(segment.id);
    const traffic = TRAFFIC[level];
    
    // OSRM provides duration, adjust for traffic
    const baseDurationSeconds = segment.durationSeconds || 0;
    const trafficAdjustedDuration = baseDurationSeconds * traffic.multiplier;
    const trafficAdjustedMinutes = trafficAdjustedDuration / 60;

    return {
      ...segment,
      traffic: {
        level,
        label: traffic.label,
        multiplier: traffic.multiplier,
        color: traffic.color,
      },
      trafficAdjustedDuration,
      trafficAdjustedMinutes: Number(trafficAdjustedMinutes.toFixed(1)),
    };
  });
}

/**
 * Legacy function for backward compatibility with fake graph system
 * (kept if needed for gradual migration)
 */
function applyTrafficToEdges(edges) {
  return edges.map((edge) => {
    const level = getTrafficLevel(edge.id);
    const traffic = TRAFFIC[level];
    const baseSpeedKph = edge.roadType === 'express' ? 58 : edge.roadType === 'local' ? 26 : 42;
    const travelMinutes = (edge.distanceKm / (baseSpeedKph / traffic.multiplier)) * 60;

    return {
      ...edge,
      traffic: {
        level,
        label: traffic.label,
        multiplier: traffic.multiplier,
        color: traffic.color,
      },
      travelMinutes,
    };
  });
}

module.exports = { 
  applyTrafficToEdges,
  applyTrafficToSegments,
  getTrafficLevel,
  TRAFFIC,
};
