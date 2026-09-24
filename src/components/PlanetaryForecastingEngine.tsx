import React, { useState, useEffect, useRef } from 'react';
import { Region } from '../types';
import {
  TrendingUp,
  Cpu,
  Sparkles,
  Calendar,
  Layers,
  Sliders,
  Download,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe
} from 'lucide-react';

interface PlanetaryForecastingEngineProps {
  regions: Region[];
  onSelectRegion?: (region: Region) => void;
}

export const PlanetaryForecastingEngine: React.FC<PlanetaryForecastingEngineProps> = ({
  regions
}) => {
  // Simulation Controls
  const [targetYear, setTargetYear] = useState<number>(2035);
  const [droneDensity, setDroneDensity] = useState<number>(4); // 1x to 10x
  const [phytoremediationRate, setPhytoremediationRate] = useState<number>(75); // % deployment
  const [industrialCurtailment, setIndustrialCurtailment] = useState<number>(60); // % reduction
  const [soilBioChelation, setSoilBioChelation] = useState<number>(50); // % coverage
  const [preset, setPreset] = useState<'moderate' | 'aggressive' | 'business_as_usual'>('aggressive');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Apply Presets
  const handleApplyPreset = (type: 'moderate' | 'aggressive' | 'business_as_usual') => {
    setPreset(type);
    if (type === 'business_as_usual') {
      setDroneDensity(1);
      setPhytoremediationRate(10);
      setIndustrialCurtailment(5);
      setSoilBioChelation(10);
    } else if (type === 'moderate') {
      setDroneDensity(3);
      setPhytoremediationRate(50);
      setIndustrialCurtailment(40);
      setSoilBioChelation(40);
    } else if (type === 'aggressive') {
      setDroneDensity(7);
      setPhytoremediationRate(85);
      setIndustrialCurtailment(80);
      setSoilBioChelation(75);
    }
  };

  // Base metrics
  const years = [2025, 2030, 2035, 2040, 2045, 2050];
  const baselineHealth = Math.round(
    regions.reduce((acc, r) => acc + r.ecosystem_score, 0) / (regions.length || 1)
  );

  // Calculate trajectory for each 5-year step
  const trajectoryData = years.map(yr => {
    const elapsed = yr - 2025;
    const progressFactor = elapsed / 25; // 0 to 1

    if (preset === 'business_as_usual') {
      // Degrades or stays flat
      const health = Math.max(15, Math.round(baselineHealth - elapsed * 0.4));
      const heavyMetalsPpm = Math.round(850 + elapsed * 12);
      const carbonDrawdownGt = Math.round(elapsed * 0.4);
      return { year: yr, health, heavyMetalsPpm, carbonDrawdownGt, ciLow: health - 4, ciHigh: health + 3 };
    }

    // Intervention strength
    const interventionMultiplier =
      (droneDensity * 0.25 + phytoremediationRate * 0.005 + industrialCurtailment * 0.005 + soilBioChelation * 0.004);

    const projectedGain = Math.min(
      100 - baselineHealth,
      (100 - baselineHealth) * (1 - Math.exp(-progressFactor * interventionMultiplier * 2.2))
    );

    const health = Math.min(98, Math.round(baselineHealth + projectedGain));
    const heavyMetalsPpm = Math.max(25, Math.round(850 * Math.exp(-progressFactor * interventionMultiplier * 1.8)));
    const carbonDrawdownGt = Math.round(elapsed * 2.8 * (droneDensity * 0.3));

    return {
      year: yr,
      health,
      heavyMetalsPpm,
      carbonDrawdownGt,
      ciLow: Math.max(0, health - Math.round(5 * (1 - progressFactor * 0.5))),
      ciHigh: Math.min(100, health + Math.round(4 * (1 - progressFactor * 0.5)))
    };
  });

  // Current year forecasted stats
  const currentStep = trajectoryData.find(d => d.year === targetYear) || trajectoryData[2];

  // Draw Trajectory Chart on Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.parentElement?.clientWidth || 600;
    const height = 220;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, width, height);

    const padding = { top: 20, right: 30, bottom: 35, left: 45 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    // Background horizontal grid lines
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.4)';
    ctx.lineWidth = 1;
    for (let p = 0; p <= 100; p += 25) {
      const y = padding.top + chartH - (p / 100) * chartH;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(padding.left + chartW, y);
      ctx.stroke();

      ctx.fillStyle = '#64748b';
      ctx.font = '10px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${p}%`, padding.left - 8, y + 3);
    }

    // Coordinates for year points
    const points = trajectoryData.map((d, idx) => {
      const x = padding.left + (idx / (years.length - 1)) * chartW;
      const y = padding.top + chartH - (d.health / 100) * chartH;
      const yLow = padding.top + chartH - (d.ciLow / 100) * chartH;
      const yHigh = padding.top + chartH - (d.ciHigh / 100) * chartH;
      return { x, y, yLow, yHigh, ...d };
    });

    // 95% Confidence Interval Area
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.yHigh);
      else ctx.lineTo(pt.x, pt.yHigh);
    });
    for (let i = points.length - 1; i >= 0; i--) {
      ctx.lineTo(points[i].x, points[i].yLow);
    }
    ctx.closePath();
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.fill();

    // Main Trajectory Curve
    ctx.beginPath();
    points.forEach((pt, i) => {
      if (i === 0) ctx.moveTo(pt.x, pt.y);
      else ctx.lineTo(pt.x, pt.y);
    });
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Year X-Axis Labels & Points
    points.forEach(pt => {
      const isTarget = pt.year === targetYear;

      // X-Axis text
      ctx.fillStyle = isTarget ? '#34d399' : '#94a3b8';
      ctx.font = isTarget ? 'bold 11px monospace' : '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(`${pt.year}`, pt.x, padding.top + chartH + 20);

      // Target Year Vertical Indicator Line
      if (isTarget) {
        ctx.beginPath();
        ctx.setLineDash([3, 3]);
        ctx.moveTo(pt.x, padding.top);
        ctx.lineTo(pt.x, padding.top + chartH);
        ctx.strokeStyle = '#34d399';
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Point circle
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, isTarget ? 6 : 4, 0, Math.PI * 2);
      ctx.fillStyle = isTarget ? '#34d399' : '#10b981';
      ctx.fill();
      ctx.strokeStyle = '#070b0e';
      ctx.lineWidth = 2;
      ctx.stroke();
    });

  }, [targetYear, droneDensity, phytoremediationRate, industrialCurtailment, soilBioChelation, preset, trajectoryData]);

  return (
    <div className="bg-[#0b1015] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5" />
              Planetary Engine v4.0
            </span>
            <span className="text-xs text-slate-400 font-mono">
              AI Restoration Forecasting & 2025–2050 Trajectory
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white mt-1 uppercase">
            Planetary Recovery Trajectory Simulator
          </h2>
          <p className="text-xs text-slate-300 max-w-2xl mt-1">
            Simulate the multi-decadal recovery curve across monitored bioregions as drone swarm density, hyperaccumulator deployment, and industrial effluent curtailment scale to 2050.
          </p>
        </div>

        {/* Presets */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <button
            onClick={() => handleApplyPreset('business_as_usual')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              preset === 'business_as_usual'
                ? 'bg-rose-950/80 border-rose-500 text-rose-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            No Intervention
          </button>
          <button
            onClick={() => handleApplyPreset('moderate')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              preset === 'moderate'
                ? 'bg-amber-950/80 border-amber-500 text-amber-300 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            Standard Plan
          </button>
          <button
            onClick={() => handleApplyPreset('aggressive')}
            className={`px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              preset === 'aggressive'
                ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 font-bold shadow-[0_0_12px_rgba(16,185,129,0.25)]'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            ⚡ Vanguard 2050
          </button>
        </div>
      </div>

      {/* Target Year Scrubber & Stat Callouts */}
      <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-300 font-bold">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Target Horizon Year: <b className="text-emerald-400 text-base">{targetYear}</b></span>
          </div>

          <div className="flex items-center gap-2">
            {years.map(yr => (
              <button
                key={yr}
                onClick={() => setTargetYear(yr)}
                className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition-all cursor-pointer ${
                  targetYear === yr
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </div>

        {/* 4 Forecasted Metric Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-slate-900/60 border border-emerald-500/20 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Global Health Score</span>
            <div className="text-xl font-bold font-mono text-emerald-400 flex items-center gap-1.5">
              <span>{currentStep.health}%</span>
              <span className="text-xs text-emerald-500">
                (+{currentStep.health - baselineHealth}%)
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">95% CI: [{currentStep.ciLow}% &bull; {currentStep.ciHigh}%]</span>
          </div>

          <div className="bg-slate-900/60 border border-blue-500/20 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Heavy Metals Residual</span>
            <div className="text-xl font-bold font-mono text-cyan-400 flex items-center gap-1.5">
              <span>{currentStep.heavyMetalsPpm} ppm</span>
            </div>
            <span className="text-[10px] text-slate-500 font-mono">From baseline 850 ppm</span>
          </div>

          <div className="bg-slate-900/60 border border-purple-500/20 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Carbon Sequestered</span>
            <div className="text-xl font-bold font-mono text-purple-300">
              {currentStep.carbonDrawdownGt} Gt CO₂e
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Taiga & Rainforest canopies</span>
          </div>

          <div className="bg-slate-900/60 border border-amber-500/20 rounded-lg p-3 space-y-1">
            <span className="text-[10px] font-mono uppercase text-slate-400 block">Watersheds Restored</span>
            <div className="text-xl font-bold font-mono text-amber-300">
              {Math.min(100, Math.round((currentStep.health / 95) * 100))}%
            </div>
            <span className="text-[10px] text-slate-500 font-mono">Potable riparian corridors</span>
          </div>
        </div>
      </div>

      {/* Trajectory Canvas Chart */}
      <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
          <span className="font-semibold text-slate-200">Ecosystem Vitality Trajectory Curve (2025–2050)</span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm" /> Mean Projected Vitality</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-emerald-500/20 rounded-sm" /> 95% Confidence Band</span>
          </div>
        </div>
        <div className="w-full overflow-hidden">
          <canvas ref={canvasRef} style={{ width: '100%', height: '220px' }} />
        </div>
      </div>

      {/* Intervention Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#070b0e] border border-slate-800 rounded-xl p-4">
        {/* Slider 1: Drone Density */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Drone Swarms</span>
            <span className="text-emerald-400 font-bold">{droneDensity}x Density</span>
          </div>
          <input
            type="range"
            min="1"
            max="10"
            value={droneDensity}
            onChange={(e) => setDroneDensity(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">Seed-bomber & River skimmers</span>
        </div>

        {/* Slider 2: Hyperaccumulators */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Phytoremediation</span>
            <span className="text-emerald-400 font-bold">{phytoremediationRate}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={phytoremediationRate}
            onChange={(e) => setPhytoremediationRate(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">Alyssum & mycoremediation</span>
        </div>

        {/* Slider 3: Industrial Curtailment */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Effluent Curtailment</span>
            <span className="text-emerald-400 font-bold">{industrialCurtailment}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={industrialCurtailment}
            onChange={(e) => setIndustrialCurtailment(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">Zero-discharge mandates</span>
        </div>

        {/* Slider 4: Soil Bio-Chelation */}
        <div className="space-y-1.5 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300 font-semibold">Bio-Chelation</span>
            <span className="text-emerald-400 font-bold">{soilBioChelation}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={soilBioChelation}
            onChange={(e) => setSoilBioChelation(parseInt(e.target.value))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <span className="text-[10px] text-slate-500 block">Mycorrhizal fungal networks</span>
        </div>
      </div>
    </div>
  );
};
