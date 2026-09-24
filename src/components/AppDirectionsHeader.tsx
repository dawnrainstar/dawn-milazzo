import React, { useState, useEffect } from 'react';
import {
  Compass,
  MapPin,
  Activity,
  Zap,
  ClipboardCheck,
  TrendingUp,
  Bot,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Layers,
  X
} from 'lucide-react';

interface AppDirectionsHeaderProps {
  onNavigateTab: (tab: 'map' | 'database' | 'drones' | 'management' | 'forecast' | 'python' | 'chat') => void;
  onOpenChat: () => void;
}

export const AppDirectionsHeader: React.FC<AppDirectionsHeaderProps> = ({
  onNavigateTab,
  onOpenChat
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(() => {
    const saved = localStorage.getItem('heavy_metal_leaf_directions_expanded');
    return saved !== null ? saved === 'true' : true;
  });

  const toggleExpanded = () => {
    setIsExpanded(prev => {
      const next = !prev;
      localStorage.setItem('heavy_metal_leaf_directions_expanded', String(next));
      return next;
    });
  };

  const steps = [
    {
      num: '01',
      title: 'Explore & Inspect',
      badge: 'Living Map',
      desc: 'Browse 11+ global toxic epicenters (Norilsk, Citarum, Kabwe) and pristine baselines. Toggle ESRI Satellite, NASA GIBS, or Obsidian layers. Click on the map to pin new coordinates.',
      actionTab: 'map' as const,
      icon: <Layers className="w-4 h-4 text-emerald-400" />
    },
    {
      num: '02',
      title: 'Diagnose Telemetry',
      badge: '6-Axis Radar',
      desc: 'Inspect real-time Forest, Soil, Water, Pollinators, AQI, and Carbon Storage. Adjust interactive sliders to simulate local bio-protocols and see target baselines.',
      actionTab: 'database' as const,
      icon: <Activity className="w-4 h-4 text-cyan-400" />
    },
    {
      num: '03',
      title: 'Deploy Drone Swarms',
      badge: 'Autonomous Swarms',
      desc: 'Dispatch autonomous Leaf Seeders, River Skimmers, Pollinator Drones, Root Crawlers, and Sky Sentinels with custom phytoremediation payloads.',
      actionTab: 'drones' as const,
      icon: <Zap className="w-4 h-4 text-amber-400" />
    },
    {
      num: '04',
      title: 'EMS & ISO 14001 Audits',
      badge: 'Compliance & EIA',
      desc: 'Analyze Aspect-Impact matrices (ISO 14001 Clause 6.1.2), progress Plan-Do-Check-Act cycles, and generate certified Markdown/PDF audit reports.',
      actionTab: 'management' as const,
      icon: <ClipboardCheck className="w-4 h-4 text-emerald-400" />
    },
    {
      num: '05',
      title: 'Forecast to 2050',
      badge: 'Planetary Simulator',
      desc: 'Scrub the 2025–2050 timeline. Scale hyperaccumulators, effluent bans, and swarm density to model recovery curves with 95% confidence intervals.',
      actionTab: 'forecast' as const,
      icon: <TrendingUp className="w-4 h-4 text-purple-400" />
    },
    {
      num: '06',
      title: 'Ask AI Chatbot',
      badge: 'Any Question',
      desc: 'Ask our Gemini planetary steward anything: from app tutorials and ISO 14001 regulations to hyperaccumulator chemistry and drone logistics.',
      actionTab: 'chat' as const,
      icon: <Bot className="w-4 h-4 text-emerald-300" />
    }
  ];

  return (
    <div className="bg-gradient-to-r from-[#070e12] via-[#091518] to-[#0a1216] border-b border-emerald-500/20 text-slate-200 transition-all duration-200">
      {/* Top Banner Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-semibold text-[11px] uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
            Directions & Quick-Start Guide
          </span>
          <span className="text-slate-300 font-medium truncate hidden md:inline">
            Learn how to navigate the Living Map, run ISO 14001 audits, dispatch drone swarms, and simulate 2050 restoration.
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenChat}
            className="px-2.5 py-1 rounded-md bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Ask any question to the AI Chatbot"
          >
            <Bot className="w-3.5 h-3.5 text-emerald-400" />
            <span>Ask Chatbot</span>
          </button>

          <button
            onClick={toggleExpanded}
            className="px-2 py-1 rounded bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-slate-300 text-xs font-mono flex items-center gap-1 transition-colors cursor-pointer"
            aria-expanded={isExpanded}
          >
            <span>{isExpanded ? 'Hide Guide' : 'Show Directions'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Step-by-Step Directions Container */}
      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {steps.map((step) => (
              <div
                key={step.num}
                className="bg-[#0b1319]/90 border border-slate-800/90 hover:border-emerald-500/40 rounded-xl p-3.5 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-500/30">
                        {step.num}
                      </span>
                      <span className="text-xs font-bold text-slate-100 group-hover:text-emerald-300 transition-colors">
                        {step.title}
                      </span>
                    </div>
                    <div className="p-1 rounded bg-slate-900 border border-slate-800">
                      {step.icon}
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans mt-1">
                    {step.desc}
                  </p>
                </div>

                <div className="pt-2.5 mt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-slate-400 uppercase">
                    {step.badge}
                  </span>
                  <button
                    onClick={() => {
                      if (step.actionTab === 'chat') {
                        onOpenChat();
                      } else {
                        onNavigateTab(step.actionTab);
                      }
                    }}
                    className="text-[11px] font-mono font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <span>Launch</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick FAQ / Prompt Chips Bar */}
          <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="text-slate-400 font-semibold flex items-center gap-1 text-[11px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Quick Questions to Ask:
            </span>
            <button
              onClick={() => onOpenChat()}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
            >
              "How do I add a new ecosystem with coordinates?"
            </button>
            <button
              onClick={() => onOpenChat()}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
            >
              "What does an Environmental Manager actually do?"
            </button>
            <button
              onClick={() => onOpenChat()}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
            >
              "How do Alyssum plants extract nickel from soil?"
            </button>
            <button
              onClick={() => onOpenChat()}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 text-slate-300 rounded text-[11px] transition-colors cursor-pointer"
            >
              "Explain ISO 14001 Aspect vs Impact"
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
