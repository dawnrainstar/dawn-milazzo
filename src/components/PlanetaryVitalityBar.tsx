import React, { useEffect, useState } from 'react';
import { PlanetaryMetrics } from '../types';

interface PlanetaryVitalityBarProps {
  metrics: PlanetaryMetrics;
}

export const PlanetaryVitalityBar: React.FC<PlanetaryVitalityBarProps> = ({ metrics }) => {
  const [liveTreeCount, setLiveTreeCount] = useState(metrics.treesPlantedToday);

  // Gentle background increment for living simulation realism
  useEffect(() => {
    setLiveTreeCount(metrics.treesPlantedToday);
  }, [metrics.treesPlantedToday]);

  useEffect(() => {
    const timer = setInterval(() => {
      setLiveTreeCount(prev => prev + Math.floor(1 + Math.random() * 3));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="bg-[#0b1015] border-b border-emerald-950/60 px-6 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-y-2 gap-x-6 text-xs font-mono-code">
        {/* Core Question & System Status */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-emerald-400 font-semibold tracking-wider uppercase">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            <span>Planetary Nervous System Active</span>
          </div>
          <span className="text-slate-600 hidden sm:inline">|</span>
          <span className="text-slate-400 italic hidden lg:inline">
            "How much life did we restore today?"
          </span>
        </div>

        {/* Global Live Tickers */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-slate-300">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[11px]">Planet Health:</span>
            <span className="font-semibold text-emerald-400 font-mono tabular-nums">
              {metrics.overallHealthScore}%
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[11px]">Trees Planted:</span>
            <span className="font-semibold text-slate-100 font-mono tabular-nums">
              {liveTreeCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[11px]">Rivers Restored:</span>
            <span className="font-semibold text-cyan-400 font-mono tabular-nums">
              {metrics.riversRestoredBasins} basins
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[11px]">Soil Inoculated:</span>
            <span className="font-semibold text-amber-300 font-mono tabular-nums">
              {metrics.hectaresSoilInoculated.toLocaleString()} ha
            </span>
          </div>

          <div className="flex items-center gap-1.5 hidden xl:flex">
            <span className="text-slate-400 uppercase text-[11px]">Species Recovering:</span>
            <span className="font-semibold text-emerald-300 font-mono tabular-nums">
              {metrics.speciesRecoveringCount}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 uppercase text-[11px]">Active Drones:</span>
            <span className="font-semibold text-cyan-300 font-mono tabular-nums">
              {metrics.activeSwarmUnits.toLocaleString()} units
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
