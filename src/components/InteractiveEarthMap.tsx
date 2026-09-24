import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Region } from '../types';
import { Compass, Search, Filter, Plus, Globe, Layers, Download, ExternalLink } from 'lucide-react';
import { getVitalityStatus } from '../services/restorationEngine';
import { toxicity_class } from '../services/earthDatabase';

interface InteractiveEarthMapProps {
  regions: Region[];
  selectedRegion: Region | null;
  onSelectRegion: (region: Region) => void;
  onOpenAddRegionWithCoords: (lat: number, lng: number) => void;
}

export const InteractiveEarthMap: React.FC<InteractiveEarthMapProps> = ({
  regions,
  selectedRegion,
  onSelectRegion,
  onOpenAddRegionWithCoords
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'contaminated' | 'stressed' | 'resilient'>('all');
  const [mapLayer, setMapLayer] = useState<'obsidian' | 'satellite' | 'topo'>('satellite');
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [20, 0],
      zoom: 2.5,
      minZoom: 2,
      maxZoom: 17,
      zoomControl: true,
      attributionControl: false
    });

    // Default to Satellite / Google Earth Pro view
    const initialTile = L.tileLayer(
      'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
      {
        maxZoom: 18,
      }
    ).addTo(map);

    tileLayerRef.current = initialTile;
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;
    mapInstanceRef.current = map;

    // Click on map to capture latitude & longitude
    map.on('click', (e: L.LeafletMouseEvent) => {
      const lat = parseFloat(e.latlng.lat.toFixed(4));
      const lng = parseFloat(e.latlng.lng.toFixed(4));
      setClickedCoords({ lat, lng });
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Switch Tile Layer (Satellite vs Obsidian vs Topo)
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;

    tileLayerRef.current.remove();

    let newUrl = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
    let subdomains = 'abc';

    if (mapLayer === 'obsidian') {
      newUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
      subdomains = 'abcd';
    } else if (mapLayer === 'topo') {
      newUrl = 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
    }

    const nextTile = L.tileLayer(newUrl, {
      maxZoom: 18,
      subdomains,
    }).addTo(mapInstanceRef.current);

    tileLayerRef.current = nextTile;
  }, [mapLayer]);

  // Sync markers when regions, filter, or search changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return;

    markersLayerRef.current.clearLayers();

    const filtered = regions.filter(region => {
      const matchesSearch =
        region.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.biome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        region.country.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (region.contamination_type && region.contamination_type.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (filterMode === 'contaminated') return region.is_contaminated || region.ecosystem_score < 30;
      if (filterMode === 'stressed') return region.ecosystem_score < 70;
      if (filterMode === 'resilient') return region.ecosystem_score >= 80;
      return true;
    });

    filtered.forEach(region => {
      const tox = toxicity_class(region.ecosystem_score);
      const isSelected = selectedRegion?.id === region.id;
      const isContaminated = region.is_contaminated || region.ecosystem_score < 30;

      // Custom marker matching user color specification:
      // ☣️ EXTREME  = flashing crimson (animate-ping)
      // 🔴 CRITICAL = red
      // 🟠 HIGH     = orange
      // 🟡 MODERATE = yellow
      // 🟢 HEALTHY  = green
      let markerHtml = '';

      if (tox.flashing) {
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group" style="width: 36px; height: 36px;">
            <div class="absolute inset-0 rounded-full animate-ping" style="background-color: #ef4444; opacity: 0.75; animation-duration: 1.2s;"></div>
            <div class="relative w-8 h-8 rounded-full flex items-center justify-center font-mono text-[10px] font-bold text-white shadow-[0_0_18px_rgba(239,68,68,0.9)] border-2 ${
              isSelected ? 'border-yellow-300 ring-4 ring-rose-500 scale-125' : 'border-rose-300'
            }" style="background-color: #dc2626;">
              <span class="mr-0.5">☣</span>${region.ecosystem_score}
            </div>
          </div>
        `;
      } else {
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer" style="width: 32px; height: 32px;">
            <div class="absolute inset-0 rounded-full animate-pulse" style="background-color: ${tox.color}; opacity: 0.35;"></div>
            <div class="relative w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] font-bold text-slate-950 shadow-lg border-2 ${
              isSelected ? 'border-white ring-2 ring-emerald-400 scale-125' : 'border-slate-900'
            }" style="background-color: ${tox.color};">
              ${region.ecosystem_score}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: 'custom-earth-marker',
        html: markerHtml,
        iconSize: tox.flashing ? [36, 36] : [32, 32],
        iconAnchor: tox.flashing ? [18, 18] : [16, 16]
      });

      const marker = L.marker([region.latitude, region.longitude], { icon: customIcon });

      const contaminationBadge = (isContaminated || region.threat_level === 'CRITICAL') ? `
        <div style="background: rgba(220, 38, 38, 0.25); border: 1px solid #ef4444; border-radius: 4px; padding: 5px 8px; margin: 6px 0; font-size: 11px; color: #fca5a5;">
          <div style="font-weight: bold; display: flex; align-items: center; justify-content: space-between; color: #f87171;">
            <span>${tox.badge}</span>
            <span style="font-family: monospace; font-size: 10px; background: rgba(239,68,68,0.3); padding: 1px 4px; border-radius: 2px;">Tox: ${region.toxicity_index ?? (100 - region.ecosystem_score)}/100</span>
          </div>
          <div style="margin-top: 3px; font-size: 10px; color: #fecaca;">
            <b>Status:</b> ${region.remediation_status || 'Remediation Planning'}
          </div>
          ${region.contamination_type ? `
            <div style="margin-top: 2px; font-size: 10px; color: #fecaca;">
              <b>Type:</b> ${region.region_type || 'Industrial Area'} &bull; ${region.contamination_type}
            </div>
          ` : ''}
          ${region.primary_contaminants ? `
            <div style="margin-top: 4px; font-size: 9px; font-family: monospace; color: #fca5a5;">
              Toxins: ${region.primary_contaminants.join(', ')}
            </div>
          ` : ''}
        </div>
      ` : `
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 4px; padding: 4px 6px; margin: 6px 0; font-size: 11px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span style="color: ${tox.color}; font-weight: bold;">${tox.badge}</span>
            <span style="font-size: 10px; color: #94a3b8; font-family: monospace;">Type: ${region.region_type || 'Bioregion'}</span>
          </div>
        </div>
      `;

      const riskScore = region.risk_score ?? (isContaminated ? (100 - region.ecosystem_score) : Math.max(10, 100 - region.ecosystem_score));
      const sourceTag = region.source || (isContaminated ? "EPA Superfund / TRI & Sentinel-5P" : "NASA Earthdata & USGS NWIS");

      const popupContent = `
        <div style="font-family: 'Plus Jakarta Sans', sans-serif; min-width: 250px; padding: 4px; color: #f8fafc;">
          <div style="font-size: 10px; text-transform: uppercase; color: #94a3b8; font-family: monospace; display: flex; justify-content: space-between;">
            <span>${region.latitude > 0 ? region.latitude.toFixed(2) + '°N' : Math.abs(region.latitude).toFixed(2) + '°S'}, 
            ${region.longitude > 0 ? region.longitude.toFixed(2) + '°E' : Math.abs(region.longitude).toFixed(2) + '°W'}</span>
            <span style="color: ${region.threat_level === 'CRITICAL' ? '#ef4444' : '#34d399'}; font-weight: bold;">Threat: ${region.threat_level || 'LOW'}</span>
          </div>
          <div style="font-weight: 700; font-size: 15px; color: #f8fafc; margin-top: 2px;">
            ${region.name}
          </div>
          <div style="font-size: 12px; color: #34d399; margin-bottom: 4px;">
            ${region.biome} (${region.country})
          </div>
          ${contaminationBadge}
          <div style="display: flex; gap: 6px; margin: 6px 0;">
            <div style="flex: 1; background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); border-radius: 4px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Health Score</div>
              <div style="font-weight: 800; font-size: 13px; color: #34d399;">${region.ecosystem_score}%</div>
            </div>
            <div style="flex: 1; background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); border-radius: 4px; padding: 4px; text-align: center;">
              <div style="font-size: 9px; color: #94a3b8; text-transform: uppercase;">Risk Score</div>
              <div style="font-weight: 800; font-size: 13px; color: #f87171;">${Math.round(riskScore)}/100</div>
            </div>
          </div>
          <div style="font-size: 10px; font-family: monospace; color: #38bdf8; margin-bottom: 6px; background: rgba(56,189,248,0.1); padding: 3px 6px; border-radius: 3px; border: 1px solid rgba(56,189,248,0.2);">
            🛰️ Source: ${sourceTag}
          </div>
          <div style="font-size: 11px; font-style: italic; color: #cbd5e1; margin-bottom: 8px; border-left: 2px solid ${tox.color}; padding-left: 6px;">
            "${region.earth_spirit.voice}"
          </div>
          <button id="btn-select-${region.id}" style="width: 100%; background: ${tox.color}; color: #022c22; font-weight: 700; font-size: 11px; padding: 6px 10px; border-radius: 4px; border: none; cursor: pointer; text-transform: uppercase;">
            ${isContaminated ? 'Deploy Remediation Swarm' : 'Inspect Ecosystem'}
          </button>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        onSelectRegion(region);
      });

      marker.on('popupopen', () => {
        const btn = document.getElementById(`btn-select-${region.id}`);
        if (btn) {
          btn.onclick = () => {
            onSelectRegion(region);
            const panel = document.getElementById('inspector-panel');
            if (panel) panel.scrollIntoView({ behavior: 'smooth' });
          };
        }
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [regions, filterMode, searchQuery, selectedRegion, onSelectRegion]);

  // Center on selected region when it changes
  useEffect(() => {
    if (selectedRegion && mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([selectedRegion.latitude, selectedRegion.longitude], 6, {
        duration: 1.2
      });
    }
  }, [selectedRegion]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([20, 0], 2.5, { duration: 1.5 });
    }
  };

  const handleExportGoogleEarthKML = () => {
    let placemarks = '';
    regions.forEach(r => {
      placemarks += `
    <Placemark>
      <name>${r.name} [Vitality: ${r.ecosystem_score}%]</name>
      <description><![CDATA[
        <h3>Ms. Heavy Metal Leaf Planetary Restoration Node</h3>
        <p><b>Biome:</b> ${r.biome}</p>
        <p><b>Country:</b> ${r.country}</p>
        <p><b>Vitality Index:</b> ${r.ecosystem_score}%</p>
        <ul>
          <li>Forest Health: ${r.forest_health}%</li>
          <li>Soil Carbon: ${r.soil_health}%</li>
          <li>Water Systems: ${r.water_health}%</li>
          <li>Biodiversity: ${r.biodiversity}%</li>
        </ul>
        <p><i>Spirit Voice: "${r.earth_spirit.voice}"</i></p>
      ]]></description>
      <Point>
        <coordinates>${r.longitude},${r.latitude},0</coordinates>
      </Point>
    </Placemark>`;
    });

    const kml = `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
  <Document>
    <name>Ms. Heavy Metal Leaf - Planetary Restoration Nodes</name>
    <description>Living Database Coordinates for Google Earth Pro (2025-2050)</description>
    ${placemarks}
  </Document>
</kml>`;

    const blob = new Blob([kml], { type: 'application/vnd.google-earth.kml+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ms_heavy_metal_leaf_google_earth_pro_${Date.now()}.kml`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportCSV = () => {
    const headers = [
      "id", "name", "latitude", "longitude", "ecosystem_score", "risk_score",
      "threat_level", "contamination_type", "source", "last_updated",
      "forest_health", "soil_health", "water_health", "biodiversity",
      "air_quality", "forest_loss_pct", "temperature_c", "rainfall_mm",
      "remediation_status"
    ];
    const rows = regions.map(r => [
      r.id,
      `"${r.name.replace(/"/g, '""')}"`,
      r.latitude,
      r.longitude,
      r.ecosystem_score,
      r.risk_score ?? (r.is_contaminated ? 85 : 20),
      r.threat_level || (r.ecosystem_score < 40 ? 'CRITICAL' : 'MODERATE'),
      `"${(r.contamination_type || '').replace(/"/g, '""')}"`,
      `"${(r.source || 'NASA / EPA / USGS').replace(/"/g, '""')}"`,
      r.last_updated || '2026-09-23',
      r.forest_health,
      r.soil_health,
      r.water_health,
      r.biodiversity,
      r.air_quality ?? 75,
      r.forest_loss ?? 0.2,
      r.temperature ?? 21.0,
      r.rainfall ?? 1200,
      `"${(r.remediation_status || 'Active Swarm Deployed').replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "heavy_metal_leaf_v2.1.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const contaminatedCount = regions.filter(r => r.is_contaminated || r.ecosystem_score < 30).length;

  const handleFlyToMostContaminated = () => {
    const sorted = [...regions].sort((a, b) => a.ecosystem_score - b.ecosystem_score);
    const worst = sorted[0];
    if (worst && mapInstanceRef.current) {
      onSelectRegion(worst);
      mapInstanceRef.current.flyTo([worst.latitude, worst.longitude], 6, { duration: 1.5 });
    }
  };

  return (
    <div className="relative w-full h-[620px] bg-[#070b0e] overflow-hidden rounded-xl">
      {/* Top Map Toolbar: Search, Filters, Earth Layer Switcher */}
      <div className="absolute top-4 left-4 right-4 z-[1000] flex flex-wrap items-center justify-between gap-3 pointer-events-none">
        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-2 bg-[#0b1015]/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 pointer-events-auto shadow-2xl">
          <div className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              type="text"
              placeholder="Search biome, toxin, country..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="bg-[#070b0e] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-44 sm:w-56 font-mono"
            />
          </div>

          <div className="flex items-center gap-1 bg-[#070b0e] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterMode === 'all' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All World ({regions.length})
            </button>
            <button
              onClick={() => {
                setFilterMode('contaminated');
                handleFlyToMostContaminated();
              }}
              title="Highlight and focus on the world's most toxic and contaminated places"
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all cursor-pointer ${
                filterMode === 'contaminated'
                  ? 'bg-rose-600 text-white font-bold shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                  : 'text-rose-400 hover:text-rose-200 hover:bg-rose-950/40'
              }`}
            >
              <span>☣️ Contaminated ({contaminatedCount})</span>
            </button>
            <button
              onClick={() => setFilterMode('stressed')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterMode === 'stressed' ? 'bg-amber-500/20 text-amber-300 font-semibold' : 'text-slate-400 hover:text-amber-300'
              }`}
            >
              Stressed (&lt;70)
            </button>
            <button
              onClick={() => setFilterMode('resilient')}
              className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                filterMode === 'resilient' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-emerald-300'
              }`}
            >
              Resilient (&ge;80)
            </button>
          </div>

          {/* Quick World Sector Jump */}
          <div className="hidden lg:flex items-center gap-1 border-l border-slate-800 pl-2">
            <button
              onClick={() => handleRecenter()}
              title="Fly to Whole World Global View"
              className="px-2 py-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-800/40 rounded transition-colors"
            >
              🌍 Whole World
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([42, -100], 3.5, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Americas
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([52, 18], 4, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Europe
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([2, 22], 3.5, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Africa
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([35, 95], 3.5, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Asia
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([-25, 135], 4, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Oceania
            </button>
            <button
              onClick={() => mapInstanceRef.current?.flyTo([-75, 160], 3, { duration: 1.2 })}
              className="px-1.5 py-1 text-[10px] font-mono text-slate-400 hover:text-slate-200"
            >
              Polar
            </button>
          </div>
        </div>

        {/* Google Earth Pro & Satellite Controls */}
        <div className="flex items-center gap-2 bg-[#0b1015]/90 backdrop-blur-md p-2 rounded-xl border border-slate-800 pointer-events-auto shadow-2xl">
          {/* Layer switcher */}
          <div className="flex items-center gap-1 bg-[#070b0e] border border-slate-800 rounded-lg p-0.5 text-xs font-mono">
            <button
              onClick={() => setMapLayer('satellite')}
              title="Google Earth / Satellite high-resolution imagery"
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                mapLayer === 'satellite' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              Earth Satellite
            </button>
            <button
              onClick={() => setMapLayer('obsidian')}
              title="Deep Space Obsidian dark vector map"
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition-colors ${
                mapLayer === 'obsidian' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-emerald-400" />
              Obsidian
            </button>
          </div>

          {/* Export CSV v2.1 */}
          <button
            onClick={handleExportCSV}
            title="Download .CSV file of all planetary nodes with Phase 2 real environmental telemetry"
            className="px-2.5 py-1.5 bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-500/40 text-emerald-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>

          {/* Export to Google Earth Pro */}
          <button
            onClick={handleExportGoogleEarthKML}
            title="Download .KML file to open all coordinates in Google Earth Pro desktop"
            className="px-2.5 py-1.5 bg-blue-950/60 hover:bg-blue-900/70 border border-blue-500/40 text-blue-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Google Earth Pro (.KML)</span>
          </button>

          {/* Recenter */}
          <button
            onClick={handleRecenter}
            title="Reset to global view"
            className="p-1.5 bg-[#070b0e] border border-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Click-to-Add Coordinate Floating Banner */}
      {clickedCoords && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-[#0b1015]/95 backdrop-blur-md border border-emerald-500/40 p-3 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in">
          <div className="text-xs font-mono">
            <span className="text-slate-400 block text-[10px] uppercase">Coordinate Pinned:</span>
            <span className="text-emerald-400 font-bold">
              {clickedCoords.lat}° N, {clickedCoords.lng}° E
            </span>
          </div>
          <button
            onClick={() => {
              onOpenAddRegionWithCoords(clickedCoords.lat, clickedCoords.lng);
              setClickedCoords(null);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Ecosystem Here
          </button>
          <button
            onClick={() => setClickedCoords(null)}
            className="text-slate-500 hover:text-slate-300 text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Google Earth Web Direct 3D Link for Selected Region */}
      {selectedRegion && (
        <div className="absolute bottom-4 right-4 z-[1000] bg-[#0b1015]/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-xl hidden sm:flex items-center gap-2 text-xs font-mono">
          <span className="text-slate-400">{selectedRegion.name}</span>
          <a
            href={`https://earth.google.com/web/@${selectedRegion.latitude},${selectedRegion.longitude},2000a,35y,0h,0t,0r`}
            target="_blank"
            rel="noopener noreferrer"
            className="px-2 py-1 bg-blue-950/60 hover:bg-blue-900 border border-blue-500/30 text-blue-300 rounded flex items-center gap-1 transition-colors"
          >
            <Globe className="w-3 h-3 text-blue-400" />
            Open in Google Earth 3D
            <ExternalLink className="w-2.5 h-2.5 ml-0.5" />
          </a>
        </div>
      )}
    </div>
  );
};
