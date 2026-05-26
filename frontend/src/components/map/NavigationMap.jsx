import L from 'leaflet';
import { useEffect, useRef } from 'react';

const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const TILE_ATTRIBUTION = '&copy; OpenStreetMap contributors';

// Visualization duration based on speed setting (in milliseconds)
const ANIMATION_DURATIONS = {
  slow: 4000,
  medium: 2000,
  fast: 800,
};

function createMarkerIcon(type) {
  const label = type === 'source' ? 'A' : 'B';

  return L.divIcon({
    className: `traffix-pin traffix-pin-${type}`,
    html: `<span>${label}</span>`,
    iconSize: [42, 42],
    iconAnchor: [21, 38],
  });
}

function addMarker(layer, location, type) {
  if (!location) return;

  L.marker([location.lat, location.lng], {
    icon: createMarkerIcon(type),
    riseOnHover: true,
  })
    .bindTooltip(location.name, {
      direction: 'top',
      offset: [0, -36],
      className: 'traffix-tooltip',
    })
    .addTo(layer);
}

export default function NavigationMap({ center, source, destination, route, visualizationSpeed = 'medium' }) {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markerLayerRef = useRef(null);
  const trafficLayerRef = useRef(null);
  const routeLayerRef = useRef(null);

  useEffect(() => {
    if (mapRef.current || !containerRef.current) return;

    mapRef.current = L.map(containerRef.current, {
      zoomControl: false,
      preferCanvas: true,
    }).setView([center.lat, center.lng], 6);

    L.tileLayer(TILE_URL, {
      attribution: TILE_ATTRIBUTION,
      maxZoom: 19,
    }).addTo(mapRef.current);

    L.control.zoom({ position: 'bottomleft' }).addTo(mapRef.current);
    markerLayerRef.current = L.layerGroup().addTo(mapRef.current);
    trafficLayerRef.current = L.layerGroup().addTo(mapRef.current);
    routeLayerRef.current = L.layerGroup().addTo(mapRef.current);
  }, [center.lat, center.lng]);

  useEffect(() => {
    if (!mapRef.current || source || destination || route) return;
    mapRef.current.flyTo([center.lat, center.lng], 6, { duration: 1.1 });
  }, [center, source, destination, route]);

  useEffect(() => {
    if (!markerLayerRef.current || !mapRef.current) return;

    markerLayerRef.current.clearLayers();
    addMarker(markerLayerRef.current, source, 'source');
    addMarker(markerLayerRef.current, destination, 'destination');

    const points = [source, destination].filter(Boolean).map((point) => [point.lat, point.lng]);
    if (points.length === 1) {
      mapRef.current.flyTo(points[0], 13, { duration: 1 });
    }
  }, [source, destination]);

  useEffect(() => {
    if (!mapRef.current || !trafficLayerRef.current || !routeLayerRef.current) return;

    trafficLayerRef.current.clearLayers();
    routeLayerRef.current.clearLayers();

    if (!route) return;

    // Render traffic segments with actual road geometry
    route.trafficSegments.forEach((segment) => {
      L.polyline(segment.coordinates, {
        color: segment.traffic.color,
        weight: segment.traffic.level === 'heavy' ? 7 : 5,
        opacity: segment.traffic.level === 'low' ? 0.5 : 0.72,
        lineCap: 'round',
        lineJoin: 'round',
        className: 'traffic-road',
      }).addTo(trafficLayerRef.current);
    });

    // Fit map bounds to route
    const coordinates = route.route.coordinates;
    const bounds = L.latLngBounds(coordinates);
    mapRef.current.fitBounds(bounds, { padding: [90, 90], maxZoom: 15, animate: true, duration: 0.8 });

    // Progressive route reveal animation based on visualization speed
    const animationDuration = ANIMATION_DURATIONS[visualizationSpeed] || ANIMATION_DURATIONS.medium;
    
    const glowLine = L.polyline([], {
      color: '#e9edc9',
      weight: 14,
      opacity: 0.7,
      lineCap: 'round',
      lineJoin: 'round',
      className: 'route-glow',
    }).addTo(routeLayerRef.current);

    const activeLine = L.polyline([], {
      color: '#d4a373',
      weight: 7,
      opacity: 1,
      lineCap: 'round',
      lineJoin: 'round',
      className: 'route-active',
    }).addTo(routeLayerRef.current);

    let frameId;
    const start = performance.now();

    function draw(now) {
      const progress = Math.min(1, (now - start) / animationDuration);
      const visibleCount = Math.max(2, Math.ceil(progress * coordinates.length));
      const visibleCoordinates = coordinates.slice(0, visibleCount);

      glowLine.setLatLngs(visibleCoordinates);
      activeLine.setLatLngs(visibleCoordinates);

      if (progress < 1) {
        frameId = requestAnimationFrame(draw);
      }
    }

    frameId = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frameId);
  }, [route, visualizationSpeed]);

  return <div ref={containerRef} className="absolute inset-0 z-0 h-full w-full" aria-label="Traffix map" />;
}
