import React, { useState, useEffect } from 'react';
import { Region } from '../types';
import { earthDB } from '../services/earthDatabase';
import { Play, Database, Terminal, Download, RefreshCw, Trash2, CheckCircle, Code, Plus, Globe, ExternalLink, Activity, FileSpreadsheet, Check } from 'lucide-react';

interface DatabaseExplorerProps {
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  onOpenAddRegion: () => void;
  initialSubTab?: 'flask' | 'table' | 'sql' | 'python' | 'cli';
}

const DEFAULT_PYTHON_CODE = `#!/usr/bin/env python3
"""
🌿 MS. HEAVY METAL LEAF (2025–2050)
Global Earth Restoration Intelligence & Planetary Database
Author: Rainstar / Planetary Nervous System

Observe. Understand. Restore. Repeat.
"""

import sys
import sqlite3
from datetime import datetime

DB_NAME = "heavy_metal_leaf.db"

CONTAMINATION_HOTSPOTS = [
    (
        "Norilsk Metallurgical Belt, Siberia",
        69.36,
        88.19,
        "Nickel and copper smelting pollution"
    ),
    (
        "Citarum River Basin, Indonesia",
        -6.91,
        107.61,
        "Industrial wastewater and heavy metals"
    ),
    (
        "Kabwe, Zambia",
        -14.45,
        28.45,
        "Lead contamination"
    ),
    (
        "Agbogbloshie, Ghana",
        5.55,
        -0.23,
        "Electronic waste pollution"
    ),
    (
        "Lake Karachay, Russia",
        55.69,
        60.80,
        "Radioactive contamination"
    ),
    (
        "Rio Doce Disaster Zone, Brazil",
        -19.87,
        -42.85,
        "Mining tailings contamination"
    )
]

def create_database():
    conn = sqlite3.connect(DB_NAME)
    cur = conn.cursor()

    cur.execute("""
    CREATE TABLE IF NOT EXISTS regions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL,
        forest_health INTEGER,
        soil_health INTEGER,
        water_health INTEGER,
        biodiversity INTEGER,
        ecosystem_score INTEGER,
        contamination_type TEXT,
        source TEXT,
        is_contaminated INTEGER DEFAULT 0,
        threat_level TEXT,
        remediation_status TEXT,
        last_updated TEXT,
        toxicity_index INTEGER,
        region_type TEXT
    )
    """)
    conn.commit()

    # User Migrations (ALTER TABLE):
    cur.execute("PRAGMA table_info(regions)")
    cols = [col[1] for col in cur.fetchall()]
    if "threat_level" not in cols:
        cur.execute("ALTER TABLE regions ADD COLUMN threat_level TEXT;")
    if "remediation_status" not in cols:
        cur.execute("ALTER TABLE regions ADD COLUMN remediation_status TEXT;")
    if "last_updated" not in cols:
        cur.execute("ALTER TABLE regions ADD COLUMN last_updated TEXT;")
    if "toxicity_index" not in cols:
        cur.execute("ALTER TABLE regions ADD COLUMN toxicity_index INTEGER;")
    if "region_type" not in cols:
        cur.execute("ALTER TABLE regions ADD COLUMN region_type TEXT;")
    conn.commit()
    conn.close()

def ecosystem_score(forest, soil, water, biodiversity):
    return round((forest + soil + water + biodiversity) / 4)

def toxicity_class(score):
    if score < 20:
        return "☣️ EXTREME"
    elif score < 40:
        return "🔴 CRITICAL"
    elif score < 60:
        return "🟠 HIGH"
    elif score < 75:
        return "🟡 MODERATE"
    return "🟢 HEALTHY"

def remediation_matrix(contamination_type):
    actions = []
    text = (contamination_type or "").lower()
    if "lead" in text:
        actions.extend([
            "🌱 Deploy Alyssum hyperaccumulators",
            "🍄 Mycoremediation fungi",
            "⚡ Soil bio-chelation"
        ])
    if "microplastic" in text or "plastic" in text:
        actions.extend([
            "🧹 Mechanical filtration",
            "🦠 Plastic-degrading microbes"
        ])
    if "radioactive" in text:
        actions.extend([
            "☢️ Long-term containment",
            "🌲 Phytostabilization buffer zones"
        ])
    return actions

create_database()
print("🌿 MS. HEAVY METAL LEAF — Planetary Restoration System Initialized")
print("✅ Database ready at 'heavy_metal_leaf.db'. Whole world synchronized.")
`;

export const DatabaseExplorer: React.FC<DatabaseExplorerProps> = ({
  regions,
  onSelectRegion,
  onOpenAddRegion,
  initialSubTab = 'flask'
}) => {
  const [subTab, setSubTab] = useState<'flask' | 'table' | 'sql' | 'python' | 'cli'>(initialSubTab || 'flask');

  // Flask v2.1 State
  const [flaskStatus, setFlaskStatus] = useState<{ running: boolean; regionCount?: number; message?: string } | null>(null);
  const [flaskIframeKey, setFlaskIframeKey] = useState(0);
  const [hasCopiedFlaskCommand, setHasCopiedFlaskCommand] = useState(false);

  useEffect(() => {
    const checkFlask = async () => {
      try {
        const res = await fetch('/api/flask/status');
        if (res.ok) {
          const data = await res.json();
          setFlaskStatus(data);
        } else {
          setFlaskStatus({ running: false, message: 'Offline' });
        }
      } catch {
        setFlaskStatus({ running: false, message: 'Offline' });
      }
    };
    checkFlask();
    const interval = setInterval(checkFlask, 10000);
    return () => clearInterval(interval);
  }, []);

  // SQL Console State
  const [sqlQuery, setSqlQuery] = useState("SELECT * FROM regions WHERE ecosystem_score < 75;");
  const [sqlResult, setSqlResult] = useState<{
    success: boolean;
    rows?: Record<string, unknown>[];
    rowCount?: number;
    message?: string;
  } | null>(null);

  const [hasCopiedPython, setHasCopiedPython] = useState(false);

  const handleCopyPythonCode = () => {
    navigator.clipboard.writeText(pythonCode);
    setHasCopiedPython(true);
    setTimeout(() => setHasCopiedPython(false), 3000);
  };

  const handleDownloadPythonFile = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ms_heavy_metal_leaf.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  // CLI Interactive Terminal Menu State
  const [cliLogs, setCliLogs] = useState<string[]>([
    "🌿 MS. HEAVY METAL LEAF — COMMAND LINE SYSTEM",
    "=====================================================",
    "1) Display All Monitored Regions",
    "2) Add New Region (with Map Coordinates: Lat / Lon)",
    "3) Test Recommendation Engine (Healthy vs Stressed)",
    "4) Commune with Earth Spirit Voice",
    "5) Seed Olympic Forest & Global Hotspots",
    "6) ☣️ Highlight Most Contaminated Places on Earth",
    "-----------------------------------------------------",
    "Select an option below or run python3 ms_heavy_metal_leaf.py --menu in your shell."
  ]);

  const handleCliOption = (opt: number) => {
    const newLogs = [...cliLogs, `\n> Option ${opt} selected`];
    if (opt === 1) {
      newLogs.push("=====================================================");
      newLogs.push("📍 MONITORED REGIONS TELEMETRY:");
      regions.forEach(r => {
        newLogs.push(
          `• [ID #${r.id}] ${r.name} | Coords: ${r.latitude.toFixed(4)}°, ${r.longitude.toFixed(4)}° | Score: ${r.ecosystem_score}% (F:${r.forest_health} S:${r.soil_health} W:${r.water_health} B:${r.biodiversity})`
        );
      });
      newLogs.push("=====================================================");
    } else if (opt === 2) {
      onOpenAddRegion();
      newLogs.push("➕ Add Region Modal opened with Latitude & Longitude inputs.");
    } else if (opt === 3) {
      newLogs.push("🔬 RESTORATION RECOMMENDATION ENGINE TESTS:");
      newLogs.push("--- TEST 1: Healthy Ecosystem (Olympic Forest 88, 79, 92, 84) ---");
      newLogs.push("Input: forest=88, soil=79, water=92, bio=84");
      newLogs.push("Result: ['Ecosystem is healthy. Continue monitoring and old-growth protection.']");
      newLogs.push("--- TEST 2: Degraded Watershed (40, 45, 35, 50) ---");
      newLogs.push("Input: forest=40, soil=45, water=35, bio=50");
      newLogs.push("Result:");
      newLogs.push(" • Plant native trees and protect existing forest canopy.");
      newLogs.push(" • Add compost, mulch, and native mycorrhizal ground cover.");
      newLogs.push(" • Restore stream habitat and improve water quality.");
      newLogs.push(" • Expand pollinator and wildlife corridors.");
    } else if (opt === 4) {
      newLogs.push("🪶 EARTH SPIRIT ORACLE:");
      newLogs.push(' "I remember salmon.');
      newLogs.push('  I remember rain.');
      newLogs.push('  Protect the roots.');
      newLogs.push('  Leave the soil richer than you found it."');
    } else if (opt === 5) {
      newLogs.push("🌱 Seeded Olympic Forest (47.8021, -123.6044) & Hotspot Nodes.");
    } else if (opt === 6) {
      newLogs.push("☣️ " + "=".repeat(50));
      newLogs.push("🚨 CRITICAL CONTAMINATION HOTSPOTS ON EARTH:");
      const toxic = regions.filter(r => r.is_contaminated || r.ecosystem_score < 30);
      toxic.forEach(t => {
        newLogs.push(`• [HOTSPOT #${t.id}] ${t.name} (${t.country})`);
        newLogs.push(`   Coords: ${t.latitude.toFixed(4)}°, ${t.longitude.toFixed(4)}° | Vitality: ${t.ecosystem_score}%`);
        newLogs.push(`   Contaminants: ${t.contamination_type || 'Industrial Effluent & Toxic Tailings'}`);
        if (t.remediation_protocol) {
          newLogs.push(`   Protocol: ${t.remediation_protocol}`);
        }
      });
      newLogs.push("☣️ " + "=".repeat(50));
    }
    setCliLogs(newLogs);
  };

  // Python Prototype State
  const [pythonCode, setPythonCode] = useState(DEFAULT_PYTHON_CODE);
  const [pythonLogs, setPythonLogs] = useState<string[]>([
    "System ready. Click 'Run Prototype Code' to execute against the live SQLite regions engine."
  ]);
  const [isRunningPython, setIsRunningPython] = useState(false);

  // Search filter
  const [tableSearch, setTableSearch] = useState('');

  const filteredRegions = regions.filter(r =>
    r.name.toLowerCase().includes(tableSearch.toLowerCase()) ||
    r.country.toLowerCase().includes(tableSearch.toLowerCase()) ||
    r.biome.toLowerCase().includes(tableSearch.toLowerCase())
  );

  const handleExecuteSQL = (queryToRun?: string) => {
    const q = queryToRun || sqlQuery;
    const res = earthDB.executeSQL(q);
    setSqlResult(res);
  };

  const handleRunPython = () => {
    setIsRunningPython(true);
    setTimeout(() => {
      const res = earthDB.runPythonPrototype(pythonCode);
      setPythonLogs(res.output);
      setIsRunningPython(false);
      if (res.addedRegion) {
        onSelectRegion(res.addedRegion);
      }
    }, 450);
  };

  const handleExportSQL = () => {
    const dump = earthDB.exportSQL();
    const blob = new Blob([dump], { type: 'text/sql' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ms_heavy_metal_leaf_database_${Date.now()}.sql`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetDefaults = () => {
    if (window.confirm("Reset global database to default prototype regions and drone swarms?")) {
      earthDB.resetToDefaults();
    }
  };

  return (
    <div className="bg-[#0b1015] border border-emerald-500/20 rounded-xl p-5 shadow-2xl text-slate-200">
      {/* Sub-navigation bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold font-display tracking-tight text-white uppercase">
            Global Data Bass & Prototype Engine
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Subtabs */}
          <div className="flex items-center gap-1 p-1 bg-[#070b0e] border border-slate-800 rounded-lg text-xs font-mono-code">
            <button
              onClick={() => setSubTab('flask')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 cursor-pointer ${
                subTab === 'flask' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/40' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              <span>Flask v2.1</span>
              <span className={`w-2 h-2 rounded-full ${flaskStatus?.running ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </button>
            <button
              onClick={() => setSubTab('table')}
              className={`px-3 py-1.5 rounded transition-colors ${
                subTab === 'table' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Table View ({regions.length})
            </button>
            <button
              onClick={() => setSubTab('sql')}
              className={`px-3 py-1.5 rounded transition-colors ${
                subTab === 'sql' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              SQL Console
            </button>
            <button
              onClick={() => setSubTab('python')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                subTab === 'python' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-emerald-400" />
              Python Script
            </button>
            <button
              onClick={() => setSubTab('cli')}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                subTab === 'cli' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5 text-emerald-400" />
              CLI Menu
            </button>
          </div>

          <button
            onClick={handleExportSQL}
            title="Export full .sql schema and insert dump"
            className="px-2.5 py-1.5 text-xs font-mono-code text-slate-300 bg-slate-900 border border-slate-800 rounded hover:border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            .SQL Dump
          </button>

          <button
            onClick={handleResetDefaults}
            title="Reset DB to initial seed records"
            className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-900 border border-slate-800 rounded transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Tab 0: Flask v2.1 Engine & Environmental Telemetry */}
      {subTab === 'flask' && (
        <div className="mt-4 space-y-4">
          {/* Header Status & Control Ribbon */}
          <div className="bg-[#070b0e] border border-emerald-500/30 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                <h3 className="text-sm font-bold font-mono text-emerald-300 uppercase tracking-wide">
                  MS. HEAVY METAL LEAF v2.1 — Flask Engine
                </h3>
                <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded font-mono">
                  http://127.0.0.1:5000
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Real-time Flask server with Leaflet layer control, live search, contamination filters, and authentic environmental sources.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText("pip install flask requests && python app.py");
                  setHasCopiedFlaskCommand(true);
                  setTimeout(() => setHasCopiedFlaskCommand(false), 2500);
                }}
                className="px-3 py-1.5 bg-[#0b1410] border border-emerald-500/40 hover:border-emerald-400 text-emerald-300 rounded text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Copy shell execution command"
              >
                {hasCopiedFlaskCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Terminal className="w-3.5 h-3.5 text-emerald-400" />}
                <span>{hasCopiedFlaskCommand ? 'Copied!' : 'pip install flask & run'}</span>
              </button>

              <a
                href="/flask/export.csv"
                download="heavy_metal_leaf_v2.1.csv"
                className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/50 text-emerald-300 rounded text-xs font-mono font-semibold flex items-center gap-1.5 transition-colors"
                title="Download CSV with all Phase 2 environmental fields"
              >
                <Download className="w-3.5 h-3.5 text-emerald-400" />
                <span>📥 Export CSV</span>
              </a>

              <button
                onClick={() => setFlaskIframeKey(k => k + 1)}
                className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded transition-colors"
                title="Reload Flask iframe"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>

              <a
                href="/flask"
                target="_blank"
                rel="noreferrer"
                className="p-1.5 text-slate-400 hover:text-emerald-400 bg-slate-900 border border-slate-800 rounded transition-colors"
                title="Open Flask app in standalone view"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Real Environmental Sources Grid (Phase 1) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {[
              { name: "NASA Earthdata", tag: "Satellite Imagery", desc: "Landsat & MODIS surface albedo", color: "text-blue-400 border-blue-500/30 bg-blue-950/20" },
              { name: "Global Forest Watch", tag: "Forest Loss", desc: "Tree canopy loss & alerts", color: "text-emerald-400 border-emerald-500/30 bg-emerald-950/20" },
              { name: "USGS NWIS", tag: "Water & Geology", desc: "Hydrologic toxic testing", color: "text-cyan-400 border-cyan-500/30 bg-cyan-950/20" },
              { name: "EPA Superfund / TRI", tag: "Toxic Pollution", desc: "Heavy metals & chemical leaks", color: "text-rose-400 border-rose-500/30 bg-rose-950/20" },
              { name: "GBIF Secretariat", tag: "Species Observations", desc: "Biodiversity & pollinator ranges", color: "text-amber-400 border-amber-500/30 bg-amber-950/20" },
              { name: "OpenStreetMap", tag: "Base Cartography", desc: "Global vector tiles & terrain", color: "text-purple-400 border-purple-500/30 bg-purple-950/20" }
            ].map(source => (
              <div key={source.name} className={`p-2.5 rounded-lg border text-xs font-mono flex flex-col justify-between ${source.color}`}>
                <div>
                  <div className="font-bold">{source.name}</div>
                  <div className="text-[10px] opacity-80 mt-0.5">{source.tag}</div>
                </div>
                <div className="text-[10px] text-slate-400 mt-2">{source.desc}</div>
              </div>
            ))}
          </div>

          {/* Embedded Live Flask Application (v2.1) */}
          <div className="border border-slate-800 rounded-xl overflow-hidden shadow-2xl bg-[#070e0a]">
            <div className="bg-[#0b1410] px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-slate-200 font-semibold">Live Flask v2.1 Frame (Port 5000)</span>
                <span className="text-slate-500 hidden sm:inline">&bull; Leaflet Layer Control &bull; Live Search &bull; Contamination Filter</span>
              </div>
              <span className="text-[11px] text-emerald-400/80">Active Engine</span>
            </div>

            <iframe
              key={flaskIframeKey}
              src="/flask"
              title="MS. HEAVY METAL LEAF v2.1 Flask Application"
              className="w-full h-[650px] border-0 bg-[#070e0a]"
            />
          </div>

          {/* Phase 5 Formula & SQLite Schema Inspector */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-emerald-400 uppercase mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                Phase 5: Environmental Health Score Formula
              </h4>
              <pre className="text-xs font-mono text-slate-300 bg-[#040806] p-3 rounded-lg border border-slate-800 overflow-x-auto">
{`def ecosystem_score(forest_cover, water_quality, biodiversity, air_quality):
    return round(
        (forest_cover + water_quality + biodiversity + air_quality) / 4
    )`}
              </pre>
              <div className="mt-3 text-xs text-slate-400 leading-relaxed font-mono">
                Evaluates balanced canopy density, hydrological purity, species resilience, and air particulate quality. Contaminated sites with scores &lt; 40 trigger automated remediation swarms.
              </div>
            </div>

            <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase mb-2 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
                Phase 2: Database Schema (heavy_metal_leaf.db)
              </h4>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold block">source TEXT</span>
                  Attribution: NASA / EPA / USGS
                </div>
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-emerald-400 font-bold block">last_updated TEXT</span>
                  Telemetry timestamp (YYYY-MM-DD)
                </div>
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-amber-400 font-bold block">forest_loss REAL</span>
                  Canopy loss percentage
                </div>
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-cyan-400 font-bold block">air_quality REAL</span>
                  Air Quality Index (0-100)
                </div>
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-rose-400 font-bold block">risk_score REAL</span>
                  Hazard index (0-100)
                </div>
                <div className="bg-[#040806] p-2 rounded border border-slate-800 text-slate-300">
                  <span className="text-purple-400 font-bold block">temperature / rain</span>
                  Microclimate parameters
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 1: Interactive Table View */}
      {subTab === 'table' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <input
              type="text"
              placeholder="Search table by name, country, or biome..."
              value={tableSearch}
              onChange={e => setTableSearch(e.target.value)}
              className="px-3 py-1.5 bg-[#070b0e] border border-slate-800 rounded text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 w-full sm:w-80"
            />
            <button
              onClick={onOpenAddRegion}
              className="px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Record with Lat/Long
            </button>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-left text-xs font-mono-code">
              <thead className="bg-[#070b0e] text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-3 py-2.5">ID</th>
                  <th className="px-3 py-2.5">Name</th>
                  <th className="px-3 py-2.5">Latitude</th>
                  <th className="px-3 py-2.5">Longitude</th>
                  <th className="px-3 py-2.5">Forest %</th>
                  <th className="px-3 py-2.5">Soil %</th>
                  <th className="px-3 py-2.5">Water %</th>
                  <th className="px-3 py-2.5">Bio %</th>
                  <th className="px-3 py-2.5">Score %</th>
                  <th className="px-3 py-2.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {filteredRegions.map(reg => (
                  <tr
                    key={reg.id}
                    onClick={() => onSelectRegion(reg)}
                    className="hover:bg-slate-900/60 transition-colors cursor-pointer"
                  >
                    <td className="px-3 py-2 text-slate-500 tabular-nums">#{reg.id}</td>
                    <td className="px-3 py-2 font-medium text-slate-100">{reg.name}</td>
                    <td className="px-3 py-2 text-emerald-400 tabular-nums">{reg.latitude.toFixed(4)}</td>
                    <td className="px-3 py-2 text-emerald-400 tabular-nums">{reg.longitude.toFixed(4)}</td>
                    <td className="px-3 py-2 tabular-nums">{reg.forest_health}%</td>
                    <td className="px-3 py-2 tabular-nums">{reg.soil_health}%</td>
                    <td className="px-3 py-2 tabular-nums">{reg.water_health}%</td>
                    <td className="px-3 py-2 tabular-nums">{reg.biodiversity}%</td>
                    <td className="px-3 py-2">
                      <span className={`font-bold tabular-nums ${
                        reg.ecosystem_score >= 80 ? 'text-emerald-400' :
                        reg.ecosystem_score >= 65 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {reg.ecosystem_score}%
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm(`Delete "${reg.name}" from planetary database?`)) {
                            earthDB.deleteRegion(reg.id);
                          }
                        }}
                        title="Delete record"
                        className="p-1 text-slate-500 hover:text-rose-400 transition-colors rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Live SQL Console */}
      {subTab === 'sql' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
            <span>Presets:</span>
            <button
              onClick={() => {
                setSqlQuery("SELECT * FROM regions WHERE ecosystem_score < 70;");
                handleExecuteSQL("SELECT * FROM regions WHERE ecosystem_score < 70;");
              }}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            >
              Stressed Zones (&lt; 70)
            </button>
            <button
              onClick={() => {
                setSqlQuery("SELECT * FROM regions ORDER BY ecosystem_score DESC;");
                handleExecuteSQL("SELECT * FROM regions ORDER BY ecosystem_score DESC;");
              }}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            >
              Order by Score DESC
            </button>
            <button
              onClick={() => {
                setSqlQuery("SELECT * FROM regions WHERE water_health < 70;");
                handleExecuteSQL("SELECT * FROM regions WHERE water_health < 70;");
              }}
              className="px-2 py-0.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800"
            >
              Water Crisis (&lt; 70)
            </button>
          </div>

          <div className="relative">
            <textarea
              rows={3}
              value={sqlQuery}
              onChange={e => setSqlQuery(e.target.value)}
              className="w-full bg-[#070b0e] border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500/50"
              placeholder="SELECT * FROM regions WHERE ...;"
            />
            <button
              onClick={() => handleExecuteSQL()}
              className="absolute bottom-3 right-3 px-3 py-1.5 text-xs font-semibold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute SQL
            </button>
          </div>

          {/* SQL Output Box */}
          {sqlResult && (
            <div className="bg-[#070b0e] border border-slate-800 rounded-lg p-3 text-xs font-mono-code space-y-2">
              <div className="flex items-center justify-between text-slate-400 text-[11px] border-b border-slate-800 pb-1.5">
                <span className={sqlResult.success ? 'text-emerald-400' : 'text-rose-400'}>
                  {sqlResult.message}
                </span>
                <span>Rows: {sqlResult.rowCount ?? 0}</span>
              </div>

              {sqlResult.rows && sqlResult.rows.length > 0 && (
                <div className="overflow-x-auto max-h-56">
                  <table className="w-full text-left">
                    <thead className="text-[10px] text-slate-500 uppercase border-b border-slate-800">
                      <tr>
                        {Object.keys(sqlResult.rows[0]).map(col => (
                          <th key={col} className="px-2 py-1">{col}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900">
                      {sqlResult.rows.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-900/50">
                          {Object.values(row).map((val, cIdx) => (
                            <td key={cIdx} className="px-2 py-1 text-slate-300 tabular-nums">
                              {String(val)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Runnable Python Prototype */}
      {subTab === 'python' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span>Standalone Python Script (SQLite + Contamination Remediation)</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyPythonCode}
                title="Copy entire Python code to clipboard"
                className={`px-3 py-1.5 text-xs font-mono rounded transition-colors flex items-center gap-1.5 cursor-pointer border ${
                  hasCopiedPython
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/60'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-200 border-slate-700'
                }`}
              >
                {hasCopiedPython ? (
                  <>
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied to Clipboard!</span>
                  </>
                ) : (
                  <>
                    <span>📋 Copy Full Code</span>
                  </>
                )}
              </button>

              <button
                onClick={handleDownloadPythonFile}
                title="Download ms_heavy_metal_leaf.py directly to your device"
                className="px-3 py-1.5 text-xs font-mono bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 rounded transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-blue-400" />
                <span>Download .py</span>
              </button>

              <button
                onClick={handleRunPython}
                disabled={isRunningPython}
                className="px-3.5 py-1.5 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded transition-colors flex items-center gap-1.5 shadow-[0_0_12px_rgba(16,185,129,0.3)] cursor-pointer disabled:opacity-50"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                {isRunningPython ? "Executing in Python Engine..." : "▶ Run Prototype"}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Left: Code Editor */}
            <div className="relative bg-[#070b0e] border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300">
              <div className="text-[10px] uppercase font-mono tracking-wider text-slate-500 mb-2 border-b border-slate-800/80 pb-1">
                heavy_metal_leaf_prototype.py
              </div>
              <textarea
                rows={18}
                value={pythonCode}
                onChange={e => setPythonCode(e.target.value)}
                className="w-full bg-transparent text-emerald-300/90 focus:outline-none resize-none font-mono-code leading-relaxed text-[11px]"
              />
            </div>

            {/* Right: Stdout Terminal */}
            <div className="bg-[#05080b] border border-emerald-500/30 rounded-lg p-3 font-mono text-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-emerald-400 border-b border-emerald-950 pb-1.5 mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
                    <span>STDOUT / SQLite Execution Terminal</span>
                  </div>
                  <span className="text-slate-500">heavy_metal_leaf.db</span>
                </div>

                <div className="space-y-1 text-slate-300 font-mono-code text-[11px] max-h-80 overflow-y-auto leading-relaxed">
                  {pythonLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={
                        log.startsWith('✓') ? 'text-emerald-400 font-semibold' :
                        log.startsWith('>>>') ? 'text-cyan-400 font-semibold' :
                        log.startsWith('[STDOUT]') ? 'text-amber-200' :
                        log.startsWith('🌿') ? 'text-emerald-300 font-bold' :
                        'text-slate-300'
                      }
                    >
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between text-[11px] text-slate-500">
                <span>SQLite DB In-Memory Engine Active</span>
                <span>Records in DB: {regions.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Interactive Command-Line Menu Simulator */}
      {subTab === 'cli' && (
        <div className="mt-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
            <div className="text-xs font-mono text-slate-400">
              Interactive Terminal Menu · <span className="text-emerald-400 font-semibold">python3 ms_heavy_metal_leaf.py --menu</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCliOption(3)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-xs font-mono"
              >
                Test Stressed vs Healthy
              </button>
              <button
                onClick={() => setCliLogs([
                  "🌿 MS. HEAVY METAL LEAF — COMMAND LINE SYSTEM",
                  "=====================================================",
                  "1) Display All Monitored Regions",
                  "2) Add New Region (with Map Coordinates: Lat / Lon)",
                  "3) Test Recommendation Engine (Healthy vs Stressed)",
                  "4) Commune with Earth Spirit Voice",
                  "5) Seed Olympic Forest & Global Hotspots",
                  "-----------------------------------------------------",
                  "Select an option below or run python3 ms_heavy_metal_leaf.py --menu in your shell."
                ])}
                className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 text-xs font-mono"
              >
                Clear Terminal
              </button>
            </div>
          </div>

          {/* Interactive Menu Action Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 font-mono text-xs">
            <button
              onClick={() => handleCliOption(1)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-bold">1) Regions</div>
              <div className="text-[10px] text-slate-500">List all + GPS</div>
            </button>
            <button
              onClick={() => handleCliOption(2)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-bold">2) Add Region</div>
              <div className="text-[10px] text-slate-500">Input GPS & Scores</div>
            </button>
            <button
              onClick={() => handleCliOption(3)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-bold">3) Test Engine</div>
              <div className="text-[10px] text-slate-500">Healthy vs Stressed</div>
            </button>
            <button
              onClick={() => handleCliOption(4)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded text-left transition-colors cursor-pointer"
            >
              <div className="text-amber-300 font-bold">4) Earth Spirit</div>
              <div className="text-[10px] text-slate-500">Mythic Voice</div>
            </button>
            <button
              onClick={() => handleCliOption(5)}
              className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-left transition-colors cursor-pointer"
            >
              <div className="text-emerald-400 font-bold">5) Quick Seed</div>
              <div className="text-[10px] text-slate-500">Olympic & Nodes</div>
            </button>
            <button
              onClick={() => handleCliOption(6)}
              className="p-2 bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/50 rounded text-left transition-colors cursor-pointer shadow-sm"
            >
              <div className="text-rose-300 font-bold">6) ☣️ Toxic Hotspots</div>
              <div className="text-[10px] text-rose-400/80">Most Contaminated</div>
            </button>
          </div>

          {/* Terminal Display */}
          <div className="bg-[#05080b] border border-emerald-500/30 rounded-lg p-4 font-mono text-xs text-slate-300 space-y-1 max-h-96 overflow-y-auto leading-relaxed shadow-inner">
            {cliLogs.map((log, idx) => (
              <div
                key={idx}
                className={
                  log.startsWith('>') ? 'text-emerald-400 font-bold' :
                  log.startsWith('🌿') ? 'text-emerald-300 font-bold' :
                  log.startsWith('📍') ? 'text-amber-300 font-semibold' :
                  log.startsWith('🪶') ? 'text-amber-200 font-bold' :
                  log.startsWith('🔬') ? 'text-cyan-300 font-bold' :
                  log.startsWith('---') ? 'text-slate-500' :
                  log.startsWith(' •') ? 'text-emerald-300 pl-2' :
                  'text-slate-300'
                }
              >
                {log}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
