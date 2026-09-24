import React, { useState } from 'react';
import { Region } from '../types';
import { X, Sparkles, Trees, Droplets, Volume2 } from 'lucide-react';
import { planetaryAudio } from '../services/ambientAudio';

interface SpiritCommunionModalProps {
  isOpen: boolean;
  onClose: () => void;
  region: Region | null;
}

export const SpiritCommunionModal: React.FC<SpiritCommunionModalProps> = ({
  isOpen,
  onClose,
  region
}) => {
  const [isPlayingHum, setIsPlayingHum] = useState(false);
  const [communionResponse, setCommunionResponse] = useState<string | null>(null);

  if (!isOpen || !region) return null;

  const handleDeepListening = () => {
    if (!planetaryAudio.getIsPlaying()) {
      planetaryAudio.start();
      setIsPlayingHum(true);
    }
    setCommunionResponse(
      `"The fungal network responds to your intent. Across ${region.carbon_storage_tons.toLocaleString()} tons of stored terrestrial carbon, the mycorrhizal hyphae pulse in harmonic coherence. In seven years, root recovery will be complete."`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in">
      <div className="bg-[#090e13] border border-amber-500/40 rounded-xl max-w-xl w-full p-6 shadow-2xl text-slate-200 relative overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-3 border-b border-amber-950/80">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold font-display text-amber-200 uppercase tracking-wide">
              Earth Spirit Communion · Mythic Nervous System
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-100 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="my-5 space-y-4">
          <div className="text-center space-y-1">
            <div className="text-xs uppercase font-mono tracking-widest text-amber-400/90">
              Ancient Ecological Consciousness
            </div>
            <h2 className="text-2xl font-bold font-display text-white">
              {region.earth_spirit.name}
            </h2>
            <div className="text-xs font-mono text-slate-400">
              {region.earth_spirit.title} · {region.name}
            </div>
          </div>

          {/* Voice Oracle Card */}
          <div className="bg-amber-950/20 border border-amber-500/30 p-5 rounded-lg text-center space-y-3 shadow-inner">
            <div className="text-sm sm:text-base italic font-serif text-amber-100/95 leading-relaxed">
              "{region.earth_spirit.voice}"
            </div>
          </div>

          {/* Historic Ecological Memory */}
          <div className="bg-[#0e151c] border border-slate-800 p-4 rounded-lg text-xs font-sans text-slate-300 space-y-2">
            <div className="flex items-center gap-1.5 text-slate-400 uppercase font-mono text-[10px] tracking-wider">
              <Trees className="w-3 h-3 text-emerald-400" />
              Living Memory of this Biome:
            </div>
            <p className="leading-relaxed italic text-slate-200">
              {region.earth_spirit.historic_memory}
            </p>
          </div>

          {communionResponse && (
            <div className="bg-emerald-950/30 border border-emerald-500/40 p-4 rounded-lg text-xs font-mono text-emerald-300 animate-in fade-in leading-relaxed">
              <div className="text-[10px] uppercase text-emerald-400 font-semibold mb-1">
                Planetary Consensus Echo:
              </div>
              {communionResponse}
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={handleDeepListening}
              className="w-full sm:w-auto px-4 py-2 text-xs font-mono text-amber-300 bg-amber-950/50 border border-amber-500/40 hover:bg-amber-900/60 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <Volume2 className="w-4 h-4 text-amber-400" />
              Listen to Deep Resonance
            </button>

            <button
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2 text-xs font-mono font-semibold text-slate-900 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors"
            >
              Close Oracle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
