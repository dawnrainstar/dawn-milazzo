import React, { useState } from 'react';
import { Region } from '../types';
import { getVitalityStatus } from '../services/restorationEngine';
import { remediation_matrix, toxicity_class } from '../services/earthDatabase';
import { BioregionalRadarChart } from './BioregionalRadarChart';
import { Zap, Trees, Droplets, Bug, Mountain, Sparkles, CheckCircle2, ShieldAlert, Cpu, Activity, Clock, ClipboardCheck } from 'lucide-react';

interface RegionDetailPanelProps {
  region: Region;
  onUpdateRegionHealth: (id: number, fields: { forest_health?: number; soil_health?: number; water_health?: number; biodiversity?: number }) => void;
  onDispatchSwarm: (regionId: number) => void;
  onCommuneWithSpirit: (region: Region) => void;
  onNavigateToEMS?: () => void;
}

export const RegionDetailPanel: React.FC<RegionDetailPanelProps> = ({
  region,
  onUpdateRegionHealth,
  onDispatchSwarm,
  onCommuneWithSpirit,
  onNavigateToEMS
}) => {
  const status = getVitalityStatus(region.ecosystem_score);
  const tox = toxicity_class(region.ecosystem_score);
  const [isApplyingInterventions, setIsApplyingInterventions] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const dynamicRemediationActions = remediation_matrix(
    `${region.contamination_type || ''} ${(region.primary_contaminants || []).join(' ')} ${region.biome}`
  );

  const handleSliderChange = (
    key: 'forest_health' | 'soil_health' | 'water_health' | 'biodiversity',
    val: number
  ) => {
    onUpdateRegionHealth(region.id, { [key]: val });
  };

  const handleDeployInterventions = () => {
    setIsApplyingInterventions(true);
    setTimeout(() => {
      // Apply restorative increments
      const nextForest = Math.min(100, region.forest_health + 4);
      const nextSoil = Math.min(100, region.soil_health + 5);
      const nextWater = Math.min(100, region.water_health + 5);
      const nextBio = Math.min(100, region.biodiversity + 4);

      onUpdateRegionHealth(region.id, {
        forest_health: nextForest,
        soil_health: nextSoil,
        water_health: nextWater,
        biodiversity: nextBio
      });

      setIsApplyingInterventions(false);
      setSuccessMessage("✓ Restoration protocols initiated: soil mycelium inoculated, riparian buffers seeded.");
      setTimeout(() => setSuccessMessage(null), 4000);
    }, 600);
  };

  return (
    <div className="bg-[#0b1015] border border-emerald-500/20 rounded-xl p-5 shadow-2xl text-slate-200">
      {/* Top Header: Location, Coordinates & Vitality Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800/80 gap-3">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-wider">
            <span>{region.country}</span>
            <span>·</span>
            <span>{region.biome}</span>
          </div>
          <h2 className="text-2xl font-bold font-display tracking-tight text-white mt-0.5">
            {region.name}
          </h2>
          {/* Coordinates Notation */}
          <div className="text-xs font-mono text-emerald-400 mt-1 flex items-center gap-2">
            <span>LAT: {region.latitude > 0 ? `${region.latitude.toFixed(4)}° N` : `${Math.abs(region.latitude).toFixed(4)}° S`}</span>
            <span className="text-slate-600">|</span>
            <span>LON: {region.longitude > 0 ? `${region.longitude.toFixed(4)}° E` : `${Math.abs(region.longitude).toFixed(4)}° W`}</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Canopy: {region.canopy_cover_pct}%</span>
          </div>
        </div>

        {/* Vitality Score Badge */}
        <div className="flex items-center gap-4 bg-slate-900/90 border border-slate-800 rounded-lg p-3 shrink-0">
          <div className="text-right">
            <div className="text-[10px] uppercase font-mono tracking-wider text-slate-400">
              Ecosystem Vitality
            </div>
            <div className={`text-xs font-mono font-semibold ${status.textColor}`}>
              {status.label}
            </div>
          </div>
          <div
            className="w-14 h-14 rounded-full flex flex-col items-center justify-center font-display font-bold text-xl border-2"
            style={{
              borderColor: status.color,
              backgroundColor: `${status.color}15`,
              color: status.color,
              boxShadow: `0 0 16px ${status.color}30`
            }}
          >
            <span>{region.ecosystem_score}</span>
            <span className="text-[9px] -mt-1 font-mono">%</span>
          </div>
        </div>
      </div>

      {/* Planetary Nervous System Extended Telemetry Grid */}
      <div className="my-3 grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-[#070b0e] border border-slate-800 font-mono text-xs">
        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" /> Threat Level:
          </span>
          <span className={`font-bold mt-0.5 ${
            region.threat_level === 'CRITICAL' ? 'text-rose-400 animate-pulse' :
            region.threat_level === 'HIGH' ? 'text-orange-400' :
            region.threat_level === 'MODERATE' ? 'text-amber-400' : 'text-emerald-400'
          }`}>
            {region.threat_level || (region.ecosystem_score < 40 ? 'CRITICAL' : 'MODERATE')}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <Activity className="w-3 h-3 text-amber-400" /> Toxicity Index:
          </span>
          <span className="font-bold text-slate-200 mt-0.5">
            <span className={region.toxicity_index && region.toxicity_index > 70 ? 'text-rose-400 font-extrabold' : 'text-slate-300'}>
              {region.toxicity_index ?? (100 - region.ecosystem_score)}
            </span>
            <span className="text-[10px] text-slate-500 ml-1">/ 100</span>
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <Cpu className="w-3 h-3 text-cyan-400" /> Status:
          </span>
          <span className="font-semibold text-cyan-300 mt-0.5 truncate" title={region.remediation_status || "Remediation Planning"}>
            {region.remediation_status || (region.is_contaminated ? "Remediation Planning" : "Active Swarm Deployed")}
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] uppercase text-slate-500 flex items-center gap-1">
            <Mountain className="w-3 h-3 text-emerald-400" /> Type:
          </span>
          <span className="font-semibold text-emerald-300 mt-0.5 truncate">
            {region.region_type || "River Basin"}
          </span>
        </div>
      </div>

      {/* Contamination Alert & Heavy Metal Remediation Matrix */}
      {(region.is_contaminated || region.ecosystem_score < 45 || region.threat_level === 'CRITICAL') && (
        <div className="my-4 bg-gradient-to-r from-rose-950/40 via-red-950/30 to-amber-950/20 border-2 border-rose-500/50 rounded-xl p-4 shadow-[0_0_24px_rgba(239,68,68,0.2)]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-rose-500/30 pb-2.5 mb-3">
            <div className="flex items-center gap-2">
              <span className="text-xl animate-bounce">☣️</span>
              <div>
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-300 flex items-center gap-2">
                  <span>Critical Contamination Hotspot Detected</span>
                  <span className="px-1.5 py-0.2 rounded bg-rose-900/90 text-[10px] border border-rose-500">
                    {tox.badge}
                  </span>
                </span>
                <span className="text-[11px] text-rose-200 block font-sans">
                  {region.contamination_type || "Heavy industrial effluent & toxic mineral leaching"}
                </span>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded bg-rose-900/80 border border-rose-400 text-rose-200 text-[10px] font-mono font-bold tracking-widest uppercase shrink-0">
              PRIORITY LEVEL 1 REMEDIATION
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-[11px] uppercase font-mono text-slate-400 block mb-1">
                Primary Contaminants Identified:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(region.primary_contaminants || ["Lead (Pb)", "Arsenic (As)", "Sulfur Dioxide (SO2)"]).map((toxin, i) => (
                  <span key={i} className="px-2 py-0.5 rounded bg-rose-950 border border-rose-500/40 font-mono text-[11px] text-rose-200">
                    {toxin}
                  </span>
                ))}
              </div>
              <div className="mt-2 text-slate-300 font-sans leading-relaxed">
                <span className="text-emerald-400 font-mono text-[11px]">Protocol: </span>
                {region.remediation_protocol || "Phytoremediation with biochar barriers and chelation mycelium."}
              </div>
            </div>

            {/* Dynamic Remediation Matrix Actions */}
            <div className="flex flex-col justify-between gap-2">
              <span className="text-[11px] uppercase font-mono text-emerald-400 font-semibold flex items-center gap-1">
                <span>Remediation Matrix Protocols:</span>
              </span>
              <div className="space-y-1.5">
                {dynamicRemediationActions.map((action, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      const boostWater = Math.min(100, region.water_health + 8);
                      const boostSoil = Math.min(100, region.soil_health + 8);
                      const boostBio = Math.min(100, region.biodiversity + 6);
                      onUpdateRegionHealth(region.id, {
                        water_health: boostWater,
                        soil_health: boostSoil,
                        biodiversity: boostBio
                      });
                      setSuccessMessage(`✓ Executed: ${action}`);
                      setTimeout(() => setSuccessMessage(null), 4000);
                    }}
                    className="w-full text-left px-3 py-1.5 rounded bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-700/80 hover:border-emerald-500/60 text-slate-200 hover:text-emerald-300 font-mono text-[11px] transition-all flex items-center justify-between cursor-pointer group"
                  >
                    <span>{action}</span>
                    <span className="text-[10px] text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity">Deploy &rarr;</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid: 4 Core Vitality Pillars (Interactive Telemetry Sliders) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-5">
        {/* Forest Health */}
        <div className="bg-[#0e151c] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Trees className="w-3.5 h-3.5 text-emerald-400" />
              Forest Health
            </span>
            <span className="font-mono text-emerald-400 font-bold tabular-nums">
              {region.forest_health}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={region.forest_health}
            onChange={e => handleSliderChange('forest_health', parseInt(e.target.value, 10))}
            className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-400">
            Canopy density & tree species
          </div>
        </div>

        {/* Soil Health */}
        <div className="bg-[#0e151c] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Mountain className="w-3.5 h-3.5 text-amber-400" />
              Soil Health
            </span>
            <span className="font-mono text-amber-400 font-bold tabular-nums">
              {region.soil_health}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={region.soil_health}
            onChange={e => handleSliderChange('soil_health', parseInt(e.target.value, 10))}
            className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-400">
            Microbial diversity & carbon
          </div>
        </div>

        {/* Water Systems */}
        <div className="bg-[#0e151c] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              Water Systems
            </span>
            <span className="font-mono text-cyan-400 font-bold tabular-nums">
              {region.water_health}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={region.water_health}
            onChange={e => handleSliderChange('water_health', parseInt(e.target.value, 10))}
            className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-400">
            River quality & aquifer flow
          </div>
        </div>

        {/* Biodiversity */}
        <div className="bg-[#0e151c] border border-slate-800 rounded-lg p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium flex items-center gap-1.5">
              <Bug className="w-3.5 h-3.5 text-purple-400" />
              Pollinators & Bio
            </span>
            <span className="font-mono text-purple-400 font-bold tabular-nums">
              {region.biodiversity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={region.biodiversity}
            onChange={e => handleSliderChange('biodiversity', parseInt(e.target.value, 10))}
            className="w-full accent-purple-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
          />
          <div className="text-[11px] font-mono text-slate-400">
            Endangered fauna & bee corridors
          </div>
        </div>
      </div>

      {/* Three Column Layout: Restoration Engine Tasks vs 6-Axis Radar vs Mythic Spirit Voice */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">
        {/* Left Column: Restoration Recommendations */}
        <div className="bg-[#090e13] border border-emerald-500/20 rounded-lg p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-emerald-400 flex items-center gap-2">
                <Zap className="w-3.5 h-3.5" />
                Restoration Engine Directives
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {region.restoration_tasks.length} Active Prescriptions
              </span>
            </div>

            <div className="space-y-2 mt-3">
              {region.restoration_tasks.map((task, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-900/60 border border-slate-800/80 p-2 rounded"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                  <span>{task}</span>
                </div>
              ))}
            </div>

            {successMessage && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 p-2.5 rounded mt-3">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2 pt-3">
            <button
              onClick={handleDeployInterventions}
              disabled={isApplyingInterventions}
              className="w-full py-2 px-3 text-xs font-medium text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Zap className="w-3.5 h-3.5" />
              {isApplyingInterventions ? "Deploying Bio-Protocols..." : "Apply Restoration Interventions"}
            </button>

            <button
              onClick={() => onDispatchSwarm(region.id)}
              className="w-full py-2 px-3 text-xs font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 hover:bg-emerald-900/40 rounded transition-colors whitespace-nowrap cursor-pointer text-center"
            >
              Dispatch Swarms ({region.active_drones_count} Active)
            </button>

            {onNavigateToEMS && (
              <button
                onClick={onNavigateToEMS}
                className="w-full py-2 px-3 text-xs font-mono text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 hover:bg-cyan-900/40 rounded transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ClipboardCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>EMS / ISO 14001 File &rarr;</span>
              </button>
            )}
          </div>
        </div>

        {/* Center Column: 6-Axis Biospheric Radar Chart */}
        <div className="flex flex-col justify-center">
          <BioregionalRadarChart region={region} size={280} />
        </div>

        {/* Right Column: Mythic Earth Spirit Profile (Rainstar's Vision) */}
        <div className="bg-[#090e13] border border-amber-500/20 rounded-lg p-4 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xs uppercase font-mono tracking-wider font-semibold text-amber-300 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Mythic Earth Spirit Layer
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                Planetary Consciousness
              </span>
            </div>

            <div className="mt-2">
              <div className="text-sm font-bold text-amber-200">
                {region.earth_spirit.name}
              </div>
              <div className="text-xs font-mono text-slate-400">
                {region.earth_spirit.title}
              </div>
            </div>

            <div className="my-3 p-3 bg-amber-950/20 border-l-2 border-amber-400/80 rounded-r text-xs text-amber-100/90 italic font-serif leading-relaxed">
              "{region.earth_spirit.voice}"
            </div>

            <div className="text-xs text-slate-400 leading-relaxed font-sans">
              <span className="text-slate-300 font-medium">Ancient Memory: </span>
              {region.earth_spirit.historic_memory}
            </div>
          </div>

          <button
            onClick={() => onCommuneWithSpirit(region)}
            className="w-full mt-3 py-2 px-3 text-xs font-mono text-amber-300 bg-amber-950/30 border border-amber-500/30 hover:bg-amber-900/40 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Commune With {region.earth_spirit.name}
          </button>
        </div>
      </div>
    </div>
  );
};
