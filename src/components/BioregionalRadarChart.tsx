import React, { useEffect, useRef } from 'react';
import { Region } from '../types';

interface BioregionalRadarChartProps {
  region: Region;
  size?: number;
}

export const BioregionalRadarChart: React.FC<BioregionalRadarChartProps> = ({
  region,
  size = 280
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // High-DPI screen scaling
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, size, size);

    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.38;

    // 6 Ecological Axes
    const axes = [
      { label: 'Forest', value: region.forest_health },
      { label: 'Soil', value: region.soil_health },
      { label: 'Water', value: region.water_health },
      { label: 'Biodiversity', value: region.biodiversity },
      { label: 'Air Quality', value: region.air_quality ?? Math.round(region.ecosystem_score * 0.9) },
      { label: 'Carbon Sink', value: Math.min(100, Math.round((region.carbon_storage_tons / 500) * 100)) }
    ];

    const totalAxes = axes.length;
    const angleStep = (Math.PI * 2) / totalAxes;

    // Draw background concentric grid polygons (20%, 40%, 60%, 80%, 100%)
    const levels = [0.2, 0.4, 0.6, 0.8, 1.0];
    levels.forEach(level => {
      ctx.beginPath();
      for (let i = 0; i < totalAxes; i++) {
        const angle = i * angleStep - Math.PI / 2;
        const x = centerX + Math.cos(angle) * radius * level;
        const y = centerY + Math.sin(angle) * radius * level;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.strokeStyle = level === 1.0 ? 'rgba(16, 185, 129, 0.25)' : 'rgba(51, 65, 85, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw radial axis lines
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;

      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(x, y);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.5)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Axis text labels
      const labelDistance = radius + 20;
      const labelX = centerX + Math.cos(angle) * labelDistance;
      const labelY = centerY + Math.sin(angle) * labelDistance;

      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(axes[i].label, labelX, labelY);
    }

    // Benchmark Target Polygon (Pristine 90% benchmark)
    ctx.beginPath();
    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const r = radius * 0.9;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.strokeStyle = 'rgba(52, 211, 153, 0.25)';
    ctx.setLineDash([3, 3]);
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]); // Reset line dash

    // Current State Polygon
    const isContaminated = !!region.contamination_type;
    const polyStroke = isContaminated ? '#f87171' : '#10b981';
    const polyFill = isContaminated ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)';

    ctx.beginPath();
    const dataPoints: { x: number; y: number; val: number }[] = [];

    for (let i = 0; i < totalAxes; i++) {
      const angle = i * angleStep - Math.PI / 2;
      const normalizedVal = Math.max(0.08, Math.min(1.0, axes[i].value / 100));
      const r = radius * normalizedVal;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      dataPoints.push({ x, y, val: axes[i].value });

      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = polyFill;
    ctx.fill();
    ctx.strokeStyle = polyStroke;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw vertex node points and value badges
    dataPoints.forEach((pt) => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = polyStroke;
      ctx.fill();
      ctx.strokeStyle = '#070b0e';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });

  }, [region, size]);

  return (
    <div className="flex flex-col items-center justify-center p-2 bg-[#070b0e] border border-slate-800 rounded-xl relative group">
      <div className="w-full flex items-center justify-between text-[11px] font-mono px-2 mb-1">
        <span className="text-slate-400 uppercase font-semibold">6-Axis Biospheric Radar</span>
        <span className="text-emerald-400 font-bold">
          {region.ecosystem_score}% Vitality
        </span>
      </div>

      <div style={{ width: size, height: size }} className="relative flex items-center justify-center">
        <canvas
          ref={canvasRef}
          style={{ width: size, height: size }}
          className="block"
        />
      </div>

      <div className="flex items-center gap-4 text-[10px] font-mono text-slate-400 mt-1">
        <div className="flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${region.contamination_type ? 'bg-rose-500' : 'bg-emerald-500'}`} />
          <span>Current Measured State</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-0.5 border-t border-dashed border-emerald-400" />
          <span>Pristine Baseline (90%)</span>
        </div>
      </div>
    </div>
  );
};
