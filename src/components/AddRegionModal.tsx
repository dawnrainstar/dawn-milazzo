import React, { useState, useEffect } from 'react';
import { calculateEcosystemScore } from '../services/restorationEngine';
import { X, Plus, MapPin, Sparkles } from 'lucide-react';

interface AddRegionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (regionData: {
    name: string;
    latitude: number;
    longitude: number;
    forest_health: number;
    soil_health: number;
    water_health: number;
    biodiversity: number;
    biome: string;
    country: string;
    carbon_storage_tons: number;
    canopy_cover_pct: number;
    wildfire_risk: 'LOW' | 'MODERATE' | 'SEVERE';
    earth_spirit: {
      name: string;
      title: string;
      voice: string;
      historic_memory: string;
    };
  }) => void;
  initialCoords?: { lat: number; lng: number } | null;
}

export const AddRegionModal: React.FC<AddRegionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialCoords
}) => {
  const [name, setName] = useState('');
  const [latitude, setLatitude] = useState<number>(0);
  const [longitude, setLongitude] = useState<number>(0);
  const [biome, setBiome] = useState('Temperate Rainforest');
  const [country, setCountry] = useState('Global Commons');
  const [forestHealth, setForestHealth] = useState(75);
  const [soilHealth, setSoilHealth] = useState(70);
  const [waterHealth, setWaterHealth] = useState(75);
  const [biodiversity, setBiodiversity] = useState(80);
  const [wildfireRisk, setWildfireRisk] = useState<'LOW' | 'MODERATE' | 'SEVERE'>('LOW');
  const [spiritName, setSpiritName] = useState('');
  const [spiritVoice, setSpiritVoice] = useState('');

  useEffect(() => {
    if (initialCoords) {
      setLatitude(initialCoords.lat);
      setLongitude(initialCoords.lng);
    }
  }, [initialCoords]);

  if (!isOpen) return null;

  const currentScore = calculateEcosystemScore(forestHealth, soilHealth, waterHealth, biodiversity);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSubmit({
      name: name.trim(),
      latitude,
      longitude,
      forest_health: forestHealth,
      soil_health: soilHealth,
      water_health: waterHealth,
      biodiversity: biodiversity,
      biome,
      country,
      carbon_storage_tons: 3500000,
      canopy_cover_pct: forestHealth,
      wildfire_risk: wildfireRisk,
      earth_spirit: {
        name: spiritName.trim() || `${name} Guardian`,
        title: `Planetary Consciousness Node (${biome})`,
        voice: spiritVoice.trim() || `The roots remember. Clean water flows once more.`,
        historic_memory: `Continuous observation logged by Ms. Heavy Metal Leaf.`
      }
    });

    onClose();
  };

  const handleApplyPreset = (preset: { name: string; lat: number; lng: number; biome: string; country: string; sName: string; sVoice: string }) => {
    setName(preset.name);
    setLatitude(preset.lat);
    setLongitude(preset.lng);
    setBiome(preset.biome);
    setCountry(preset.country);
    setSpiritName(preset.sName);
    setSpiritVoice(preset.sVoice);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto animate-in fade-in">
      <div className="bg-[#0b1015] border border-emerald-500/40 rounded-xl max-w-2xl w-full p-6 shadow-2xl text-slate-200 my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold font-display text-white uppercase tracking-wide">
              Add Ecosystem Region with Coordinates
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Presets Bar */}
        <div className="flex items-center gap-2 py-3 overflow-x-auto text-[11px] font-mono-code text-slate-400">
          <span className="shrink-0 uppercase text-slate-500">Fast Presets:</span>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              name: "Madagascar Baobab Valley",
              lat: -20.2500,
              lng: 44.4167,
              biome: "Spiny Dry Deciduous Forest",
              country: "Madagascar",
              sName: "Grandidier's Baobab Mother",
              sVoice: "A thousand rings of water hold back the red sand."
            })}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 shrink-0"
          >
            Madagascar Baobabs
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              name: "Borneo Peat Swamp Sanctuary",
              lat: -1.5000,
              lng: 114.0000,
              biome: "Tropical Peat Swamp Forest",
              country: "Indonesia",
              sName: "Orangutan Ironwood Warden",
              sVoice: "The peat burns low beneath the rain. Keep the swamp flooded."
            })}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 shrink-0"
          >
            Borneo Peat Swamp
          </button>
          <button
            type="button"
            onClick={() => handleApplyPreset({
              name: "Great Plains Prairie Corridor",
              lat: 41.5000,
              lng: -100.0000,
              biome: "Tallgrass Prairie & Riparian",
              country: "United States",
              sName: "Big Bluestem Root Mind",
              sVoice: "Our roots reach ten feet into black loam. Bring back the bison herds."
            })}
            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 shrink-0"
          >
            Great Plains Prairie
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs font-mono-code">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 uppercase text-[11px] mb-1">
                Ecosystem Region Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Valdivian Temperate Rainforest"
                className="w-full bg-[#070b0e] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>

            <div>
              <label className="block text-slate-400 uppercase text-[11px] mb-1">
                Biome / Habitat Classification
              </label>
              <input
                type="text"
                value={biome}
                onChange={e => setBiome(e.target.value)}
                placeholder="e.g. Subalpine Wetland, Boreal Taiga"
                className="w-full bg-[#070b0e] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Latitude & Longitude Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-[#070b0e] p-3 rounded-lg border border-emerald-500/30">
            <div>
              <label className="block text-emerald-400 uppercase text-[11px] mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Latitude (REAL, -90.0 to 90.0) *
              </label>
              <input
                type="number"
                step="0.0001"
                min="-90"
                max="90"
                required
                value={latitude}
                onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1015] border border-slate-800 rounded p-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-slate-500">e.g. 47.8021 for Olympic Forest</span>
            </div>

            <div>
              <label className="block text-emerald-400 uppercase text-[11px] mb-1 font-semibold flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                Longitude (REAL, -180.0 to 180.0) *
              </label>
              <input
                type="number"
                step="0.0001"
                min="-180"
                max="180"
                required
                value={longitude}
                onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                className="w-full bg-[#0b1015] border border-slate-800 rounded p-2 text-emerald-300 font-mono focus:outline-none focus:border-emerald-400"
              />
              <span className="text-[10px] text-slate-500">e.g. -123.6044 for Olympic Forest</span>
            </div>
          </div>

          {/* Health Telemetry Sliders */}
          <div className="border-t border-slate-800 pt-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-400 uppercase text-[11px]">Telemetry Health Scores (0 - 100)</span>
              <span className="text-emerald-400 font-bold">
                Computed Score: {currentScore}%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#070b0e] p-2.5 rounded border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Forest</span>
                  <span className="text-emerald-400 font-bold">{forestHealth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={forestHealth}
                  onChange={e => setForestHealth(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-500 h-1 bg-slate-800 rounded appearance-none"
                />
              </div>

              <div className="bg-[#070b0e] p-2.5 rounded border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Soil</span>
                  <span className="text-amber-400 font-bold">{soilHealth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={soilHealth}
                  onChange={e => setSoilHealth(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-500 h-1 bg-slate-800 rounded appearance-none"
                />
              </div>

              <div className="bg-[#070b0e] p-2.5 rounded border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Water</span>
                  <span className="text-cyan-400 font-bold">{waterHealth}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={waterHealth}
                  onChange={e => setWaterHealth(parseInt(e.target.value, 10))}
                  className="w-full accent-cyan-500 h-1 bg-slate-800 rounded appearance-none"
                />
              </div>

              <div className="bg-[#070b0e] p-2.5 rounded border border-slate-800">
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-slate-400">Bio</span>
                  <span className="text-purple-400 font-bold">{biodiversity}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={biodiversity}
                  onChange={e => setBiodiversity(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-500 h-1 bg-slate-800 rounded appearance-none"
                />
              </div>
            </div>
          </div>

          {/* Mythic Layer / Spirit Voice Inputs */}
          <div className="border-t border-slate-800 pt-3 space-y-3">
            <div className="flex items-center gap-1.5 text-amber-300 font-semibold text-[11px] uppercase">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              Mythic Nature Spirit Consciousness
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Spirit Guardian Name</label>
                <input
                  type="text"
                  value={spiritName}
                  onChange={e => setSpiritName(e.target.value)}
                  placeholder="e.g. Cedar Guardian, Ancient Lichen Host"
                  className="w-full bg-[#070b0e] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-400/50"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase text-[10px] mb-1">Spirit Voice Oracle</label>
                <input
                  type="text"
                  value={spiritVoice}
                  onChange={e => setSpiritVoice(e.target.value)}
                  placeholder="e.g. 'I remember salmon. I remember rain. Protect the roots.'"
                  className="w-full bg-[#070b0e] border border-slate-800 rounded p-2 text-slate-100 focus:outline-none focus:border-amber-400/50"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-2 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
            >
              <Plus className="w-3.5 h-3.5" />
              Commit Region to Living Database
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
