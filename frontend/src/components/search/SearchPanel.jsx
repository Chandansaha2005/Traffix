import { AnimatePresence, motion } from 'framer-motion';
import { FiMapPin, FiNavigation, FiRadio, FiSearch } from 'react-icons/fi';
import { useGeolocation } from '../../hooks/useGeolocation';
import RouteSummary from '../route/RouteSummary';
import SearchBox from './SearchBox';

const modes = [
  { id: 'fastest', label: 'Fastest Route' },
  { id: 'shortest', label: 'Shortest Distance' },
];

export default function SearchPanel({
  destination,
  error,
  isTrafficRefreshing,
  isRouting,
  lastTrafficUpdate,
  mode,
  onDestinationChange,
  onModeChange,
  onRouteRequest,
  onSourceChange,
  route,
  source,
}) {
  const { detect, isDetecting } = useGeolocation(onSourceChange);
  const updateLabel = lastTrafficUpdate
    ? lastTrafficUpdate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : null;

  return (
    <motion.aside
      className="search-shell fixed inset-x-3 bottom-3 z-40 lg:bottom-auto lg:left-6 lg:right-auto lg:top-28 lg:w-[390px]"
      initial={{ opacity: 0, y: 34 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
    >
      <div className="glass-panel overflow-hidden rounded-[28px] p-4 shadow-glass lg:p-5">
        <div className="mx-auto mb-3 h-1.5 w-12 rounded-full bg-sage lg:hidden" />

        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.26em] text-clay/70">Route Planner</p>
          <h2 className="mt-1 text-2xl font-black leading-tight text-clay">Where to?</h2>
        </div>

        <div className="space-y-3">
          <SearchBox
            icon={<FiMapPin />}
            label="Source"
            onSelect={onSourceChange}
            placeholder="Search pickup point"
            value={source}
          />
          <SearchBox
            icon={<FiNavigation />}
            label="Destination"
            onSelect={onDestinationChange}
            placeholder="Search destination"
            value={destination}
          />
        </div>

        <button
          type="button"
          onClick={detect}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-linen px-4 py-3 text-sm font-black text-clay transition hover:bg-mint"
        >
          <FiRadio />
          {isDetecting ? 'Detecting location' : 'Use Current Location'}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-2 rounded-3xl bg-linen/70 p-1.5">
          {modes.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onModeChange(item.id)}
              className={`relative rounded-2xl px-3 py-3 text-sm font-black transition ${
                mode === item.id ? 'text-clay' : 'text-clay/60'
              }`}
            >
              {mode === item.id && (
                <motion.span
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-2xl bg-ivory shadow-panel"
                  transition={{ type: 'spring', stiffness: 330, damping: 32 }}
                />
              )}
              <span className="relative">{item.label}</span>
            </button>
          ))}
        </div>

        <motion.button
          type="button"
          onClick={onRouteRequest}
          disabled={isRouting}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-3xl bg-clay px-5 py-4 text-base font-black text-ivory shadow-panel transition disabled:opacity-60"
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.97 }}
        >
          <FiSearch />
          {isRouting ? (
            <span className="flex items-center gap-2">
              <motion.span
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
              >
                ⟳
              </motion.span>
              Analyzing route…
            </span>
          ) : (
            'Find Route'
          )}
        </motion.button>

        {route && (
          <motion.div
            className="mt-3 flex items-center justify-between rounded-2xl bg-mint/80 px-4 py-3 text-xs font-black text-clay"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
          >
            <span>{isTrafficRefreshing ? 'Refreshing traffic' : 'Traffic-aware route active'}</span>
            {updateLabel && <span>{updateLabel}</span>}
          </motion.div>
        )}

        <AnimatePresence>
          {error && (
            <motion.p
              className="mt-3 rounded-2xl bg-linen px-4 py-3 text-sm font-bold text-clay"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        <div className="mt-4 lg:hidden">
          <RouteSummary compact route={route} />
        </div>
      </div>
    </motion.aside>
  );
}
