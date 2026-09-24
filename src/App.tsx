import React, { useState, useEffect } from 'react';
import { Region, DroneSwarm, PlanetaryMetrics } from './types';
import { earthDB } from './services/earthDatabase';
import { Header } from './components/Header';
import { PlanetaryVitalityBar } from './components/PlanetaryVitalityBar';
import { InteractiveEarthMap } from './components/InteractiveEarthMap';
import { RegionDetailPanel } from './components/RegionDetailPanel';
import { DatabaseExplorer } from './components/DatabaseExplorer';
import { DroneSwarmCommand } from './components/DroneSwarmCommand';
import { EnvironmentalManagementHub } from './components/EnvironmentalManagementHub';
import { PlanetaryForecastingEngine } from './components/PlanetaryForecastingEngine';
import { GeminiChatbot } from './components/GeminiChatbot';
import { AppDirectionsHeader } from './components/AppDirectionsHeader';
import { GlobalChatWidget } from './components/GlobalChatWidget';
import { AddRegionModal } from './components/AddRegionModal';
import { DispatchSwarmModal } from './components/DispatchSwarmModal';
import { SpiritCommunionModal } from './components/SpiritCommunionModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db, handleFirestoreError, OperationType } from './services/firebase';
import { doc, setDoc } from 'firebase/firestore';

import emblemImg from './assets/images/heavy_metal_leaf_emblem_1790212038132.jpg';
import satelliteImg from './assets/images/planetary_restoration_satellite_1790212049388.jpg';
import droneImg from './assets/images/restoration_swarm_drone_1790212064894.jpg';

function MainApp() {
  const [regions, setRegions] = useState<Region[]>(() => earthDB.getRegions());
  const [swarms, setSwarms] = useState<DroneSwarm[]>(() => earthDB.getSwarms());
  const [metrics, setMetrics] = useState<PlanetaryMetrics>(() => earthDB.getMetrics());
  const { currentUser } = useAuth();

  const [activeTab, setActiveTab] = useState<'map' | 'database' | 'drones' | 'management' | 'forecast' | 'python' | 'chat'>('map');
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(() => regions[0] || null);

  // Modals state
  const [isAddRegionOpen, setIsAddRegionOpen] = useState(false);
  const [clickedCoordsForAdd, setClickedCoordsForAdd] = useState<{ lat: number; lng: number } | null>(null);
  const [isDispatchSwarmOpen, setIsDispatchSwarmOpen] = useState(false);
  const [dispatchTargetRegionId, setDispatchTargetRegionId] = useState<number | undefined>(undefined);
  const [isSpiritCommunionOpen, setIsSpiritCommunionOpen] = useState(false);
  const [spiritCommunionRegion, setSpiritCommunionRegion] = useState<Region | null>(null);
  const [isGlobalChatOpen, setIsGlobalChatOpen] = useState(false);

  // Subscribe to live earth database changes
  useEffect(() => {
    const unsubscribe = earthDB.subscribe(() => {
      const updatedRegions = earthDB.getRegions();
      setRegions(updatedRegions);
      setSwarms(earthDB.getSwarms());
      setMetrics(earthDB.getMetrics());

      // Update selected region reference
      if (selectedRegion) {
        const fresh = updatedRegions.find(r => r.id === selectedRegion.id);
        if (fresh) setSelectedRegion(fresh);
      }
    });

    return () => unsubscribe();
  }, [selectedRegion]);

  const handleUpdateRegionHealth = async (
    id: number,
    fields: { forest_health?: number; soil_health?: number; water_health?: number; biodiversity?: number }
  ) => {
    earthDB.updateRegion(id, fields);

    // Sync to Firestore if authenticated
    if (currentUser) {
      try {
        await setDoc(doc(db, 'regions', String(id)), {
          ...fields,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `regions/${id}`);
      }
    }
  };

  const handleOpenAddRegionWithCoords = (lat: number, lng: number) => {
    setClickedCoordsForAdd({ lat, lng });
    setIsAddRegionOpen(true);
  };

  const handleOpenDispatchForRegion = (regionId: number) => {
    setDispatchTargetRegionId(regionId);
    setIsDispatchSwarmOpen(true);
  };

  const handleOpenSpiritCommunion = (region: Region) => {
    setSpiritCommunionRegion(region);
    setIsSpiritCommunionOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070b0e] text-slate-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* 3-Zone Top Navigation Contract */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddRegion={() => {
          setClickedCoordsForAdd(null);
          setIsAddRegionOpen(true);
        }}
        onOpenDispatchSwarm={() => {
          setDispatchTargetRegionId(selectedRegion?.id);
          setIsDispatchSwarmOpen(true);
        }}
      />

      {/* Real-time Planetary Metric Ticker: "How much life did we restore today?" */}
      <PlanetaryVitalityBar metrics={metrics} />

      {/* Directions for using this app at the top */}
      <AppDirectionsHeader
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenChat={() => setIsGlobalChatOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1520px] w-full mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Tab 1: Living Map & Regional Inspector */}
        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* Interactive World Map */}
            <div className="rounded-xl overflow-hidden shadow-2xl border border-emerald-500/20">
              <InteractiveEarthMap
                regions={regions}
                selectedRegion={selectedRegion}
                onSelectRegion={reg => setSelectedRegion(reg)}
                onOpenAddRegionWithCoords={handleOpenAddRegionWithCoords}
              />
            </div>

            {/* Selected Ecosystem Inspector */}
            {selectedRegion && (
              <div id="inspector-panel" className="scroll-mt-6">
                <RegionDetailPanel
                  region={selectedRegion}
                  onUpdateRegionHealth={handleUpdateRegionHealth}
                  onDispatchSwarm={handleOpenDispatchForRegion}
                  onCommuneWithSpirit={handleOpenSpiritCommunion}
                  onNavigateToEMS={() => setActiveTab('management')}
                />
              </div>
            )}

            {/* Vision & Autonomous Swarms Feature Spotlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Card 1: Planetary Vision */}
              <div className="bg-[#0b1015] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-mono tracking-widest text-emerald-400">
                    Planetary Architecture 2025–2050
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    Not a Corporation. Not a Government.
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    A planetary nervous system for regeneration. Ms. Heavy Metal Leaf continuously asks:
                    <span className="text-emerald-300 font-medium block my-1">
                      "What does this place need to become healthier?"
                    </span>
                    Connecting citizens, scientists, drone swarms, soil sensors, and restoration crews into one living intelligence.
                  </p>
                </div>
                <div className="h-36 rounded-lg overflow-hidden border border-slate-800 relative">
                  <img
                    src={satelliteImg}
                    alt="Planetary Satellite Observation Network"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1015] via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-emerald-300 bg-black/60 px-2 py-0.5 rounded">
                    Google Earth & Satellite Telemetry
                  </span>
                </div>
              </div>

              {/* Card 2: Autonomous Drone Swarms */}
              <div className="bg-[#0b1015] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-mono tracking-widest text-cyan-400">
                    Robotic Restoration Swarms
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    Leaf, River, Pollinator & Root Fleets
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    Autonomous bio-restoration swarms disperse mycorrhizal seed pods, filter microplastics from riverbeds, and map subterranean root mycelium in real-time.
                  </p>
                </div>
                <div className="h-36 rounded-lg overflow-hidden border border-slate-800 relative">
                  <img
                    src={droneImg}
                    alt="Autonomous Seed Drone in Rainforest"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1015] via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-cyan-300 bg-black/60 px-2 py-0.5 rounded">
                    Leaf Drone Seed Bomber
                  </span>
                </div>
              </div>

              {/* Card 3: Mythic Nature Spirit */}
              <div className="bg-[#0b1015] border border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="text-[11px] uppercase font-mono tracking-widest text-amber-400">
                    Mythic Consciousness Layer
                  </div>
                  <h3 className="text-lg font-bold font-display text-white">
                    The Database As A Conversation
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed font-sans">
                    "The river remembers." Every biome carries an ancient spirit voice—from the Olympic Cedar Guardian to the Bengal Sundari Root Mother.
                  </p>
                </div>
                <div className="h-36 rounded-lg overflow-hidden border border-slate-800 relative">
                  <img
                    src={emblemImg}
                    alt="Ms. Heavy Metal Leaf Insignia"
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b1015] via-transparent to-transparent" />
                  <span className="absolute bottom-2 left-2 text-[10px] font-mono text-amber-300 bg-black/60 px-2 py-0.5 rounded">
                    Chlorophyll & Titanium Heart
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Global Database Explorer */}
        {activeTab === 'database' && (
          <DatabaseExplorer
            regions={regions}
            onSelectRegion={reg => {
              setSelectedRegion(reg);
              setActiveTab('map');
            }}
            onOpenAddRegion={() => setIsAddRegionOpen(true)}
            initialSubTab="table"
          />
        )}

        {/* Tab 3: Autonomous Drone Swarm Command */}
        {activeTab === 'drones' && (
          <DroneSwarmCommand
            swarms={swarms}
            regions={regions}
            onSelectRegion={reg => {
              setSelectedRegion(reg);
              setActiveTab('map');
            }}
            onOpenDispatchModal={() => {
              setDispatchTargetRegionId(selectedRegion?.id);
              setIsDispatchSwarmOpen(true);
            }}
          />
        )}

        {/* Tab 3.5: Environmental Management System (EMS & ISO 14001) */}
        {activeTab === 'management' && (
          <EnvironmentalManagementHub
            regions={regions}
            onSelectRegion={reg => {
              setSelectedRegion(reg);
            }}
            onOpenDispatchSwarm={regId => {
              setDispatchTargetRegionId(regId || selectedRegion?.id);
              setIsDispatchSwarmOpen(true);
            }}
          />
        )}

        {/* Tab 3.75: Planetary Forecasting Engine (2025–2050 Trajectory) */}
        {activeTab === 'forecast' && (
          <PlanetaryForecastingEngine
            regions={regions}
            onSelectRegion={reg => {
              setSelectedRegion(reg);
              setActiveTab('map');
            }}
          />
        )}

        {/* Tab 4: Python Prototype Runner */}
        {activeTab === 'python' && (
          <DatabaseExplorer
            regions={regions}
            onSelectRegion={reg => {
              setSelectedRegion(reg);
              setActiveTab('map');
            }}
            onOpenAddRegion={() => setIsAddRegionOpen(true)}
            initialSubTab="flask"
          />
        )}

        {/* Tab 5: AI Intelligence (Gemini Chatbot with Search & Maps Grounding) */}
        {activeTab === 'chat' && (
          <div className="space-y-4">
            <div className="bg-[#0b1015] border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 font-mono text-xs">
              <div>
                <span className="text-emerald-400 font-bold uppercase tracking-wider block">
                  Ms. Heavy Metal Leaf · Planetary Consciousness Hub
                </span>
                <span className="text-slate-400 text-[11px]">
                  Multi-turn dialogue grounded with Google Maps (spatial places & rivers) and Google Search (NASA satellite telemetry).
                </span>
              </div>
              {selectedRegion && (
                <div className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded text-[11px] text-slate-300">
                  Inspecting: <span className="text-emerald-300 font-semibold">{selectedRegion.name}</span> ({selectedRegion.latitude}°, {selectedRegion.longitude}°)
                </div>
              )}
            </div>

            <GeminiChatbot
              currentRegion={selectedRegion}
              onInspectLocation={(lat, lng) => {
                const found = regions.find(r => Math.abs(r.latitude - lat) < 1 && Math.abs(r.longitude - lng) < 1);
                if (found) {
                  setSelectedRegion(found);
                  setActiveTab('map');
                }
              }}
            />
          </div>
        )}
      </main>

      {/* Quiet Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05080b] py-6 px-6 mt-12 text-xs font-mono-code text-slate-500">
        <div className="max-w-[1520px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <span className="text-slate-400 font-semibold uppercase">Ms. Heavy Metal Leaf</span>
            <span className="mx-2">·</span>
            <span>Observe. Understand. Restore. Repeat.</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>2025–2050 Planetary Nervous System</span>
            <span>·</span>
            <button
              onClick={() => setActiveTab('chat')}
              className="text-emerald-400 hover:underline"
            >
              Commune with Intelligence
            </button>
          </div>
        </div>
      </footer>

      {/* Add Region Modal */}
      <AddRegionModal
        isOpen={isAddRegionOpen}
        onClose={() => {
          setIsAddRegionOpen(false);
          setClickedCoordsForAdd(null);
        }}
        onSubmit={async data => {
          const newReg = earthDB.addRegion(data);
          setSelectedRegion(newReg);
          setActiveTab('map');

          // Sync to Firestore if authenticated
          if (currentUser) {
            try {
              await setDoc(doc(db, 'regions', String(newReg.id)), {
                name: newReg.name,
                latitude: newReg.latitude,
                longitude: newReg.longitude,
                forest_health: newReg.forest_health,
                soil_health: newReg.soil_health,
                water_health: newReg.water_health,
                biodiversity: newReg.biodiversity,
                ecosystem_score: newReg.ecosystem_score,
                biome: newReg.biome,
                country: newReg.country,
                userId: currentUser.uid,
                createdAt: new Date().toISOString()
              });
            } catch (err) {
              handleFirestoreError(err, OperationType.CREATE, `regions/${newReg.id}`);
            }
          }
        }}
        initialCoords={clickedCoordsForAdd}
      />

      {/* Dispatch Drone Swarm Modal */}
      <DispatchSwarmModal
        isOpen={isDispatchSwarmOpen}
        onClose={() => setIsDispatchSwarmOpen(false)}
        regions={regions}
        initialRegionId={dispatchTargetRegionId}
      />

      {/* Mythic Spirit Communion Modal */}
      <SpiritCommunionModal
        isOpen={isSpiritCommunionOpen}
        onClose={() => {
          setIsSpiritCommunionOpen(false);
          setSpiritCommunionRegion(null);
        }}
        region={spiritCommunionRegion}
      />

      {/* Offline connectivity indicator */}
      <OfflineIndicator />

      {/* Global AI Chatbot Widget - Available everywhere to answer any questions */}
      <GlobalChatWidget
        currentRegion={selectedRegion}
        isOpen={isGlobalChatOpen}
        onClose={() => setIsGlobalChatOpen(false)}
        onOpen={() => setIsGlobalChatOpen(true)}
        onInspectLocation={(lat, lng) => {
          const found = regions.find(r => Math.abs(r.latitude - lat) < 1 && Math.abs(r.longitude - lng) < 1);
          if (found) {
            setSelectedRegion(found);
            setActiveTab('map');
          }
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
