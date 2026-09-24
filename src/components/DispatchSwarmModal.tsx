import React, { useState } from 'react';
import { Region, DroneType } from '../types';
import { earthDB } from '../services/earthDatabase';
import { X, Zap, Plane, Droplets, Bug, Mountain, Eye } from 'lucide-react';

interface DispatchSwarmModalProps {
  isOpen: boolean;
  onClose: () => void;
  regions: Region[];
  initialRegionId?: number;
}

export const DispatchSwarmModal: React.FC<DispatchSwarmModalProps> = ({
  isOpen,
  onClose,
  regions,
  initialRegionId
}) => {
  const [selectedRegionId, setSelectedRegionId] = useState<number>(
    initialRegionId || (regions[0]?.id ?? 1)
  );
  const [droneType, setDroneType] = useState<DroneType>('leaf');
  const [units, setUnits] = useState<number>(32);
  const [customMission, setCustomMission] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    earthDB.dispatchSwarm({
      regionId: selectedRegionId,
      type: droneType,
      units,
      customMission: customMission.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#0b1015] border border-emerald-500/40 rounded-xl max-w-lg w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold font-display text-white uppercase tracking-wide">
              Dispatch Autonomous Swarm Fleet
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-4 text-xs font-mono-code">
          {/* Target Region */}
          <div>
            <label className="block text-slate-400 uppercase text-[11px] mb-1">
              Target Restoration Region
            </label>
            <select
              value={selectedRegionId}
              onChange={e => setSelectedRegionId(parseInt(e.target.value, 10))}
              className="w-full bg-[#070b0e] border border-slate-800 rounded p-2.5 text-slate-100 focus:outline-none focus:border-emerald-500/50"
            >
              {regions.map(r => (
                <option key={r.id} value={r.id}>
                  {r.name} (Score: {r.ecosystem_score}%, Lat: {r.latitude.toFixed(2)}, Lon: {r.longitude.toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {/* Drone Swarm Classification */}
          <div>
            <label className="block text-slate-400 uppercase text-[11px] mb-2">
              Select Autonomous Drone Architecture
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDroneType('leaf')}
                className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-colors ${
                  droneType === 'leaf'
                    ? 'bg-emerald-950/60 border-emerald-400 text-emerald-300'
                    : 'bg-[#070b0e] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Plane className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Leaf Drones</div>
                  <div className="text-[10px] text-slate-400">Canopy seed bombing & mycorrhizal drops</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDroneType('river')}
                className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-colors ${
                  droneType === 'river'
                    ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                    : 'bg-[#070b0e] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Droplets className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">River Drones</div>
                  <div className="text-[10px] text-slate-400">Aero-bio filtration & water quality</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDroneType('pollinator')}
                className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-colors ${
                  droneType === 'pollinator'
                    ? 'bg-purple-950/60 border-purple-400 text-purple-300'
                    : 'bg-[#070b0e] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Bug className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Pollinator Drones</div>
                  <div className="text-[10px] text-slate-400">Micro-habitat corridors & flora mapping</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDroneType('root')}
                className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-colors ${
                  droneType === 'root'
                    ? 'bg-amber-950/60 border-amber-400 text-amber-300'
                    : 'bg-[#070b0e] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Mountain className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Root Crawlers</div>
                  <div className="text-[10px] text-slate-400">Subterranean hyphal and moisture scan</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setDroneType('sentinel')}
                className={`p-2.5 rounded border text-left flex items-start gap-2.5 transition-colors sm:col-span-2 ${
                  droneType === 'sentinel'
                    ? 'bg-blue-950/60 border-blue-400 text-blue-300'
                    : 'bg-[#070b0e] border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <Eye className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-100">Sky Sentinels</div>
                  <div className="text-[10px] text-slate-400">Thermal fire prediction & illegal logging acoustic surveillance</div>
                </div>
              </button>
            </div>
          </div>

          {/* Unit size */}
          <div>
            <div className="flex justify-between text-[11px] mb-1">
              <span className="text-slate-400 uppercase">Fleet Unit Count</span>
              <span className="font-bold text-emerald-400">{units} Autonomous Drones</span>
            </div>
            <input
              type="range"
              min="8"
              max="128"
              step="8"
              value={units}
              onChange={e => setUnits(parseInt(e.target.value, 10))}
              className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Mission Objective override */}
          <div>
            <label className="block text-slate-400 uppercase text-[11px] mb-1">
              Mission Directives (Optional override)
            </label>
            <input
              type="text"
              value={customMission}
              onChange={e => setCustomMission(e.target.value)}
              placeholder="e.g. Inoculate western ridge with native alder & willow pods"
              className="w-full bg-[#070b0e] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500/50"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <Zap className="w-3.5 h-3.5" />
              Authorize & Launch Swarm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
