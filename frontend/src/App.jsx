import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FiDownload, FiRefreshCw, FiWifi, FiZap } from 'react-icons/fi';
import NavigationMap from './components/map/NavigationMap';
import SearchPanel from './components/search/SearchPanel';
import RouteSummary from './components/route/RouteSummary';
import TrafficLegend from './components/route/TrafficLegend';
import { calculateRoute } from './services/routeApi';

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629, name: 'India' };

export default function App() {
  const [source, setSource] = useState(null);
  const [destination, setDestination] = useState(null);
  const [mode, setMode] = useState('fastest');
  const [route, setRoute] = useState(null);
  const [isRouting, setIsRouting] = useState(false);
  const [isTrafficRefreshing, setIsTrafficRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [lastTrafficUpdate, setLastTrafficUpdate] = useState(null);
  const [visualizationSpeed, setVisualizationSpeed] = useState('medium');

  useEffect(() => {
    const handler = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const mapFocus = useMemo(() => source || destination || DEFAULT_CENTER, [source, destination]);

  useEffect(() => {
    setRoute(null);
    setLastTrafficUpdate(null);
  }, [source?.id, destination?.id]);

  const handleRouteRequest = useCallback(async (nextMode = mode, options = {}) => {
    if (!source || !destination) {
      setError('Choose a source and destination first.');
      return;
    }

    setError('');
    if (options.background) {
      setIsTrafficRefreshing(true);
    } else {
      setIsRouting(true);
    }

    try {
      const data = await calculateRoute({ source, destination, mode: nextMode });
      setRoute(data);
      setLastTrafficUpdate(new Date());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsRouting(false);
      setIsTrafficRefreshing(false);
    }
  }, [destination, mode, source]);

  useEffect(() => {
    if (!route || !source || !destination) return undefined;

    const timer = window.setInterval(() => {
      handleRouteRequest(mode, { background: true });
    }, 45000);

    return () => window.clearInterval(timer);
  }, [destination, handleRouteRequest, mode, route, source]);

  async function handleModeChange(nextMode) {
    setMode(nextMode);
    if (source && destination) {
      await handleRouteRequest(nextMode);
    }
  }

  async function handleInstall() {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-ivory text-clay">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <NavigationMap
        center={mapFocus}
        destination={destination}
        route={route}
        source={source}
        visualizationSpeed={visualizationSpeed}
      />

      <motion.header
        className="pointer-events-none fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-4 py-4 sm:px-6"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: 'easeOut' }}
      >
        <div className="pointer-events-auto glass-panel flex items-center gap-3 rounded-full px-4 py-3">
          <span className="grid h-10 w-10 place-items-center rounded-full bg-sage text-ivory shadow-panel">
            T
          </span>
          <div>
            <p className="text-lg font-black leading-none tracking-normal">Traffix</p>
            <p className="text-xs font-semibold text-clay/75">Smart navigation</p>
          </div>
        </div>

        <motion.button
          type="button"
          onClick={handleInstall}
          disabled={!installPrompt}
          className="pointer-events-auto icon-button"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.94 }}
          title="Install Traffix"
          aria-label="Install Traffix"
        >
          <FiDownload />
        </motion.button>
      </motion.header>

      <section className="pointer-events-none fixed inset-x-0 top-24 z-20 mx-auto hidden max-w-3xl px-4 lg:block">
        <motion.div
          className="mx-auto text-center"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="text-5xl font-black leading-tight text-clay xl:text-6xl">Traffix</h1>
          <p className="mx-auto mt-3 max-w-2xl text-base font-semibold leading-7 text-clay/80">
            Premium smart navigation with real road routing and traffic-aware pathfinding.
          </p>
        </motion.div>
      </section>

      <SearchPanel
        destination={destination}
        error={error}
        isRouting={isRouting}
        mode={mode}
        onDestinationChange={setDestination}
        onModeChange={handleModeChange}
        onRouteRequest={() => handleRouteRequest()}
        onSourceChange={setSource}
        isTrafficRefreshing={isTrafficRefreshing}
        lastTrafficUpdate={lastTrafficUpdate}
        route={route}
        source={source}
      />

      <AnimatePresence>
        {route && (
          <motion.aside
            className="fixed bottom-6 right-4 z-30 hidden w-[360px] lg:block"
            initial={{ opacity: 0, x: 28 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 28 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
          >
            <RouteSummary route={route} />
          </motion.aside>
        )}
      </AnimatePresence>

      <div className="fixed bottom-6 left-[440px] z-30 hidden items-center gap-3 xl:flex">
        <TrafficLegend />
        {route && (
          <motion.div
            className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-clay"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiZap />
            Animation
          </motion.div>
        )}
        {route && (
          <div className="glass-panel flex items-center gap-2 rounded-full px-4 py-2">
            {['slow', 'medium', 'fast'].map((speed) => (
              <motion.button
                key={speed}
                type="button"
                onClick={() => setVisualizationSpeed(speed)}
                className={`rounded-full px-3 py-1 text-xs font-black uppercase transition-all ${
                  visualizationSpeed === speed
                    ? 'bg-sage text-ivory shadow-panel'
                    : 'text-clay hover:bg-sage/20'
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {speed}
              </motion.button>
            ))}
          </div>
        )}
        {route && (
          <motion.button
            type="button"
            onClick={() => handleRouteRequest()}
            className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-sm font-black text-clay"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.96 }}
          >
            <FiRefreshCw />
            Refresh traffic
          </motion.button>
        )}
        {route && (
          <motion.div
            className="glass-panel flex items-center gap-2 rounded-full px-4 py-3 text-xs font-black uppercase tracking-[0.18em] text-clay"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <FiWifi />
            {isTrafficRefreshing ? 'Updating' : 'Live traffic'}
          </motion.div>
        )}
      </div>
    </main>
  );
}
