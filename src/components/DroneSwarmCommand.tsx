import React, { useState } from 'react';
import { DroneSwarm, Region, DroneType } from '../types';
import { earthDB } from '../services/earthDatabase';
import { Plane, Droplets, Bug, Mountain, Eye, Zap, Radio, CheckCircle2 } from 'lucide-react';

interface DroneSwarmCommandProps {
  swarms: DroneSwarm[];
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  onOpenDispatchModal: () => void;
}

export const DroneSwarmCommand: React.FC<DroneSwarmCommandProps> = ({
  swarms,
  regions,
  onSelectRegion,
  onOpenDispatchModal
}) => {
  const [filterType, setFilterType] = useState<DroneType | 'all'>('all');

  const filteredSwarms = swarms.filter(s =>
    filterType === 'all' ? true : s.type === filterType
  );

  const getDroneIcon = (type: DroneType) => {
    switch (type) {
      case 'leaf':
        return <Plane className="w-4 h-4 text-emerald-400" />;
      case 'river':
        return <Droplets className="w-4 h-4 text-cyan-400" />;
      case 'pollinator':
        return <Bug className="w-4 h-4 text-purple-400" />;
      case 'root':
        return <Mountain className="w-4 h-4 text-amber-400" />;
      case 'sentinel':
        return <Eye className="w-4 h-4 text-blue-400" />;
    }
  };

  return (
    <div className="bg-[#0b1015] border border-emerald-500/20 rounded-xl p-5 shadow-2xl text-slate-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h2 className="text-xl font-bold font-display tracking-tight text-white uppercase">
              Autonomous Restoration Swarms (2025-2050)
            </h2>
          </div>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Planetary nervous system swarm robotics: Leaf Drones, River Drones, Pollinators, Root Crawlers, Sky Sentinels.
          </p>
        </div>

        <button
          onClick={onOpenDispatchModal}
          className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <Zap className="w-3.5 h-3.5" />
          Dispatch Swarm Fleet
        </button>
      </div>

      {/* Filter by drone category */}
      <div className="flex flex-wrap items-center gap-2 my-4">
        <span className="text-xs font-mono text-slate-500 uppercase mr-1">Filter Fleet:</span>
        <button
          onClick={() => setFilterType('all')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors ${
            filterType === 'all' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          All Units ({swarms.length})
        </button>
        <button
          onClick={() => setFilterType('leaf')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filterType === 'leaf' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Plane className="w-3.5 h-3.5 text-emerald-400" />
          Leaf Drones (Seed Dispersal)
        </button>
        <button
          onClick={() => setFilterType('river')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filterType === 'river' ? 'bg-cyan-500/20 text-cyan-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Droplets className="w-3.5 h-3.5 text-cyan-400" />
          River Drones (Bio-Filtration)
        </button>
        <button
          onClick={() => setFilterType('pollinator')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filterType === 'pollinator' ? 'bg-purple-500/20 text-purple-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bug className="w-3.5 h-3.5 text-purple-400" />
          Pollinator Drones
        </button>
        <button
          onClick={() => setFilterType('root')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filterType === 'root' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Mountain className="w-3.5 h-3.5 text-amber-400" />
          Root Crawlers (Myco Mapping)
        </button>
        <button
          onClick={() => setFilterType('sentinel')}
          className={`px-3 py-1 rounded text-xs font-mono transition-colors flex items-center gap-1.5 ${
            filterType === 'sentinel' ? 'bg-blue-500/20 text-blue-300 font-semibold' : 'bg-slate-900 text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-3.5 h-3.5 text-blue-400" />
          Sky Sentinels (Thermal Fire Radar)
        </button>
      </div>

      {/* Grid of active swarm units */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredSwarms.map(swarm => {
          const region = regions.find(r => r.id === swarm.regionId);
          return (
            <div
              key={swarm.id}
              className="bg-[#0e151c] border border-slate-800 hover:border-emerald-500/40 rounded-lg p-4 transition-colors space-y-3 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-slate-900 rounded border border-slate-800">
                      {getDroneIcon(swarm.type)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-100 font-display">
                        {swarm.name}
                      </div>
                      <div className="text-[10px] font-mono text-slate-500">
                        {swarm.id} · {swarm.units} units
                      </div>
                    </div>
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/30">
                    {swarm.status}
                  </span>
                </div>

                {/* Target Region */}
                <div className="mt-2 text-xs font-mono text-slate-400">
                  Target:{" "}
                  <button
                    onClick={() => region && onSelectRegion(region)}
                    className="text-emerald-400 hover:underline font-semibold"
                  >
                    {swarm.regionName}
                  </button>
                </div>

                {/* Mission Objective */}
                <div className="text-xs text-slate-300 mt-2 leading-relaxed">
                  {swarm.mission}
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>Rate: {swarm.efficiency_rate}</span>
                  <span className="text-slate-300 font-semibold">{swarm.progress}%</span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${swarm.progress}%` }}
                  />
                </div>
                <div className="text-[10px] font-mono text-slate-500 text-right">
                  Dispatched {swarm.dispatched_at}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
