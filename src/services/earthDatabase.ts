import { Region, DroneSwarm, PlanetaryMetrics } from '../types';
import { INITIAL_REGIONS, INITIAL_SWARMS } from '../data/initialRegions';
import { calculateEcosystemScore, generateRecommendations } from './restorationEngine';

const STORAGE_KEY = 'ms_heavy_metal_leaf_regions_v1';
const SWARMS_KEY = 'ms_heavy_metal_leaf_swarms_v1';
const METRICS_KEY = 'ms_heavy_metal_leaf_metrics_v1';

export function toxicity_class(score: number): {
  label: string;
  badge: string;
  color: string;
  iconColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  flashing: boolean;
} {
  if (score < 20) {
    return {
      label: "EXTREME",
      badge: "☣️ EXTREME",
      color: "#ef4444",
      iconColor: "red",
      bgClass: "bg-rose-950/80",
      borderClass: "border-rose-500",
      textClass: "text-rose-400",
      flashing: true // flashing crimson
    };
  } else if (score < 40) {
    return {
      label: "CRITICAL",
      badge: "🔴 CRITICAL",
      color: "#f43f5e",
      iconColor: "red",
      bgClass: "bg-red-950/60",
      borderClass: "border-red-500",
      textClass: "text-red-400",
      flashing: false
    };
  } else if (score < 60) {
    return {
      label: "HIGH",
      badge: "🟠 HIGH",
      color: "#f97316",
      iconColor: "orange",
      bgClass: "bg-orange-950/60",
      borderClass: "border-orange-500",
      textClass: "text-orange-400",
      flashing: false
    };
  } else if (score < 75) {
    return {
      label: "MODERATE",
      badge: "🟡 MODERATE",
      color: "#eab308",
      iconColor: "yellow",
      bgClass: "bg-amber-950/60",
      borderClass: "border-amber-500",
      textClass: "text-amber-400",
      flashing: false
    };
  }
  return {
    label: "HEALTHY",
    badge: "🟢 HEALTHY",
    color: "#10b981",
    iconColor: "green",
    bgClass: "bg-emerald-950/60",
    borderClass: "border-emerald-500",
    textClass: "text-emerald-400",
    flashing: false
  };
}

export function remediation_matrix(contamination_type?: string): string[] {
  const actions: string[] = [];
  const text = (contamination_type || "").toLowerCase();

  if (text.includes("lead")) {
    actions.push(
      "🌱 Deploy Alyssum hyperaccumulators",
      "🍄 Mycoremediation fungi",
      "⚡ Soil bio-chelation"
    );
  }

  if (text.includes("microplastic") || text.includes("plastic")) {
    actions.push(
      "🧹 Mechanical filtration",
      "🦠 Plastic-degrading microbes"
    );
  }

  if (text.includes("radioactive") || text.includes("cesium") || text.includes("radiochem")) {
    actions.push(
      "☢️ Long-term containment",
      "🌲 Phytostabilization buffer zones"
    );
  }

  if (text.includes("nickel") || text.includes("copper") || text.includes("smelt")) {
    actions.push(
      "🌱 Sow heavy metal Brassica bioaccumulators",
      "⚡ Neutralize sulfuric acidity with bio-calcium"
    );
  }

  if (text.includes("textile") || text.includes("dye") || text.includes("chromium")) {
    actions.push(
      "💧 Dispatch River Drone flocculation centrifuges",
      "🦠 Phanerochaete chrysosporium enzymatic dye degradation"
    );
  }

  if (text.includes("oil") || text.includes("petroleum") || text.includes("hydrocarbon")) {
    actions.push(
      "🦠 Bio-augmentation with Alcanivorax crude-consuming bacteria",
      "💧 Deploy oleophilic absorbent bio-foam skimmers"
    );
  }

  if (actions.length === 0) {
    actions.push(
      "🌱 Sow native hyperaccumulator seed mix",
      "💧 Riparian wetland bio-swale filtration",
      "🍄 Soil mycorrhizal biochar capping"
    );
  }

  return actions;
}

export class EarthDatabaseManager {
  private regions: Region[] = [];
  private swarms: DroneSwarm[] = [];
  private metrics: PlanetaryMetrics = {
    overallHealthScore: 74,
    treesPlantedToday: 3482111,
    riversRestoredBasins: 76,
    hectaresSoilInoculated: 142890,
    speciesRecoveringCount: 214,
    activeSwarmUnits: 1420,
    totalCarbonSinkTons: 76500000
  };
  private subscribers: Array<() => void> = [];

  constructor() {
    this.loadState();
  }

  private loadState() {
    try {
      const storedRegions = localStorage.getItem(STORAGE_KEY);
      if (storedRegions) {
        const loaded: Region[] = JSON.parse(storedRegions);
        const initialMap = new Map(INITIAL_REGIONS.map(ir => [ir.id, ir]));
        
        // Merge with defaults to ensure threat_level, toxicity_index, etc. exist
        const updatedLoaded = loaded.map(r => {
          const init = initialMap.get(r.id);
          return {
            ...r,
            threat_level: r.threat_level || init?.threat_level || (r.ecosystem_score < 40 ? 'CRITICAL' : r.ecosystem_score < 60 ? 'HIGH' : 'LOW'),
            toxicity_index: r.toxicity_index ?? init?.toxicity_index ?? (100 - r.ecosystem_score),
            remediation_status: r.remediation_status || init?.remediation_status || 'Active Swarm Deployed',
            region_type: r.region_type || init?.region_type || 'Forest Canopy',
            last_updated: r.last_updated || init?.last_updated || '2026-09-23'
          };
        });

        // Ensure newly added initial regions (such as global worldwide zones) are present
        const loadedIds = new Set(updatedLoaded.map(r => r.id));
        const missing = INITIAL_REGIONS.filter(ir => !loadedIds.has(ir.id));
        this.regions = [...updatedLoaded, ...missing];
        this.saveRegions();
      } else {
        this.regions = [...INITIAL_REGIONS];
        this.saveRegions();
      }

      const storedSwarms = localStorage.getItem(SWARMS_KEY);
      if (storedSwarms) {
        this.swarms = JSON.parse(storedSwarms);
      } else {
        this.swarms = [...INITIAL_SWARMS];
        this.saveSwarms();
      }

      const storedMetrics = localStorage.getItem(METRICS_KEY);
      if (storedMetrics) {
        this.metrics = JSON.parse(storedMetrics);
      } else {
        this.recalculateMetrics();
      }
    } catch {
      this.regions = [...INITIAL_REGIONS];
      this.swarms = [...INITIAL_SWARMS];
    }
  }

  public subscribe(cb: () => void) {
    this.subscribers.push(cb);
    return () => {
      this.subscribers = this.subscribers.filter(s => s !== cb);
    };
  }

  private notify() {
    this.subscribers.forEach(cb => cb());
  }

  private saveRegions() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.regions));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  private saveSwarms() {
    try {
      localStorage.setItem(SWARMS_KEY, JSON.stringify(this.swarms));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  private saveMetrics() {
    try {
      localStorage.setItem(METRICS_KEY, JSON.stringify(this.metrics));
    } catch (e) {
      console.warn("Storage quota exceeded", e);
    }
  }

  public getRegions(): Region[] {
    return [...this.regions];
  }

  public getRegionById(id: number): Region | undefined {
    return this.regions.find(r => r.id === id);
  }

  public getSwarms(): DroneSwarm[] {
    return [...this.swarms];
  }

  public getMetrics(): PlanetaryMetrics {
    return { ...this.metrics };
  }

  public addRegion(data: Omit<Region, 'id' | 'ecosystem_score' | 'restoration_tasks' | 'active_drones_count' | 'last_satellite_pass'> & { id?: number }): Region {
    const nextId = data.id ?? (this.regions.length > 0 ? Math.max(...this.regions.map(r => r.id)) + 1 : 1);
    const score = calculateEcosystemScore(data.forest_health, data.soil_health, data.water_health, data.biodiversity);
    const tasks = generateRecommendations(data.soil_health, data.water_health, data.biodiversity, data.forest_health, data.biome);

    const newRegion: Region = {
      ...data,
      id: nextId,
      ecosystem_score: score,
      restoration_tasks: tasks,
      active_drones_count: 12,
      last_satellite_pass: 'Just now'
    };

    this.regions.push(newRegion);
    this.saveRegions();
    this.recalculateMetrics();
    this.notify();
    return newRegion;
  }

  public updateRegion(id: number, partial: Partial<Region>): Region | null {
    const idx = this.regions.findIndex(r => r.id === id);
    if (idx === -1) return null;

    const current = this.regions[idx];
    const forest = partial.forest_health ?? current.forest_health;
    const soil = partial.soil_health ?? current.soil_health;
    const water = partial.water_health ?? current.water_health;
    const bio = partial.biodiversity ?? current.biodiversity;
    const score = calculateEcosystemScore(forest, soil, water, bio);
    const tasks = generateRecommendations(soil, water, bio, forest, partial.biome ?? current.biome);

    this.regions[idx] = {
      ...current,
      ...partial,
      forest_health: forest,
      soil_health: soil,
      water_health: water,
      biodiversity: bio,
      ecosystem_score: score,
      restoration_tasks: tasks,
      last_satellite_pass: '1m ago'
    };

    this.saveRegions();
    this.recalculateMetrics();
    this.notify();
    return this.regions[idx];
  }

  public deleteRegion(id: number): boolean {
    const initialLen = this.regions.length;
    this.regions = this.regions.filter(r => r.id !== id);
    if (this.regions.length !== initialLen) {
      this.saveRegions();
      this.recalculateMetrics();
      this.notify();
      return true;
    }
    return false;
  }

  public resetToDefaults() {
    this.regions = [...INITIAL_REGIONS];
    this.swarms = [...INITIAL_SWARMS];
    this.metrics = {
      overallHealthScore: 74,
      treesPlantedToday: 3482111,
      riversRestoredBasins: 76,
      hectaresSoilInoculated: 142890,
      speciesRecoveringCount: 214,
      activeSwarmUnits: 1420,
      totalCarbonSinkTons: 76500000
    };
    this.saveRegions();
    this.saveSwarms();
    this.saveMetrics();
    this.notify();
  }

  public recalculateMetrics() {
    if (this.regions.length === 0) return;
    const avgScore = Math.round(
      this.regions.reduce((acc, r) => acc + r.ecosystem_score, 0) / this.regions.length
    );
    const totalCarbon = this.regions.reduce((acc, r) => acc + (r.carbon_storage_tons || 0), 0);
    const totalDrones = this.regions.reduce((acc, r) => acc + (r.active_drones_count || 0), 0) + 1200;

    this.metrics = {
      ...this.metrics,
      overallHealthScore: avgScore,
      totalCarbonSinkTons: totalCarbon,
      activeSwarmUnits: totalDrones
    };
    this.saveMetrics();
  }

  public dispatchSwarm(params: {
    regionId: number;
    type: DroneSwarm['type'];
    units: number;
    customMission?: string;
  }): DroneSwarm {
    const region = this.getRegionById(params.regionId);
    const regionName = region ? region.name : 'Global Coordinate';

    const missionMap: Record<DroneSwarm['type'], string> = {
      leaf: "Dispense native mycorrhizal seed-capsules and aerial canopy mist",
      river: "Aero-bio filtration of microparticulates and dissolved oxygen replenishment",
      pollinator: "Establish native pollinator waystation corridors and floral mapping",
      root: "Underground hyphal network impedance scanning and subsoil moisture tracking",
      sentinel: "High-altitude multispectral thermal surveillance for wildfire ignition risks"
    };

    const newSwarm: DroneSwarm = {
      id: `SWARM-${params.type.toUpperCase().slice(0, 1)}-${Math.floor(10 + Math.random() * 90)}`,
      name: `${params.type.toUpperCase()} Swarm Unit ${Math.floor(100 + Math.random() * 900)}`,
      type: params.type,
      regionId: params.regionId,
      regionName,
      units: params.units,
      mission: params.customMission || missionMap[params.type],
      efficiency_rate: params.type === 'leaf' ? `${params.units * 7} seeds/min` : `${params.units * 420} L/hr`,
      status: 'ACTIVE',
      progress: 5,
      dispatched_at: 'Just now'
    };

    this.swarms.unshift(newSwarm);
    this.saveSwarms();

    // Increment planetary counters
    if (region) {
      const droneInc = params.units;
      let forestBump = 0;
      let soilBump = 0;
      let waterBump = 0;
      let bioBump = 0;

      if (params.type === 'leaf') {
        forestBump = 3;
        this.metrics.treesPlantedToday += params.units * 140;
      } else if (params.type === 'river') {
        waterBump = 4;
        this.metrics.riversRestoredBasins += 1;
      } else if (params.type === 'root') {
        soilBump = 4;
        this.metrics.hectaresSoilInoculated += params.units * 25;
      } else if (params.type === 'pollinator') {
        bioBump = 3;
        this.metrics.speciesRecoveringCount += 1;
      } else {
        forestBump = 1;
        soilBump = 1;
      }

      this.updateRegion(region.id, {
        forest_health: Math.min(100, region.forest_health + forestBump),
        soil_health: Math.min(100, region.soil_health + soilBump),
        water_health: Math.min(100, region.water_health + waterBump),
        biodiversity: Math.min(100, region.biodiversity + bioBump),
        active_drones_count: region.active_drones_count + droneInc
      });
    }

    this.saveMetrics();
    this.notify();
    return newSwarm;
  }

  // Live SQL Engine that parses standard queries against the regions database
  public executeSQL(sql: string): {
    success: boolean;
    rows?: Record<string, unknown>[];
    rowCount?: number;
    message?: string;
  } {
    const trimmed = sql.trim();
    if (!trimmed) {
      return { success: false, message: "Empty SQL query." };
    }

    try {
      // 1. SELECT queries
      if (/^SELECT/i.test(trimmed)) {
        let result = this.regions.map(r => ({
          id: r.id,
          name: r.name,
          latitude: r.latitude,
          longitude: r.longitude,
          forest_health: r.forest_health,
          soil_health: r.soil_health,
          water_health: r.water_health,
          biodiversity: r.biodiversity,
          ecosystem_score: r.ecosystem_score,
          biome: r.biome,
          country: r.country
        }));

        // WHERE condition
        const whereMatch = trimmed.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (whereMatch) {
          const condition = whereMatch[1];
          // Support ecosystem_score < 70, ecosystem_score > 80, etc.
          const scoreLess = condition.match(/ecosystem_score\s*<\s*(\d+)/i);
          const scoreGreater = condition.match(/ecosystem_score\s*>\s*(\d+)/i);
          const soilLess = condition.match(/soil_health\s*<\s*(\d+)/i);
          const waterLess = condition.match(/water_health\s*<\s*(\d+)/i);
          const nameLike = condition.match(/name\s+LIKE\s+['"]%?([^'"]+)%?['"]/i);

          if (scoreLess) {
            const val = parseInt(scoreLess[1], 10);
            result = result.filter(r => r.ecosystem_score < val);
          } else if (scoreGreater) {
            const val = parseInt(scoreGreater[1], 10);
            result = result.filter(r => r.ecosystem_score > val);
          } else if (soilLess) {
            const val = parseInt(soilLess[1], 10);
            result = result.filter(r => r.soil_health < val);
          } else if (waterLess) {
            const val = parseInt(waterLess[1], 10);
            result = result.filter(r => r.water_health < val);
          } else if (nameLike) {
            const term = nameLike[1].toLowerCase();
            result = result.filter(r => r.name.toLowerCase().includes(term));
          }
        }

        // ORDER BY
        const orderMatch = trimmed.match(/ORDER\s+BY\s+(\w+)(?:\s+(ASC|DESC))?/i);
        if (orderMatch) {
          const col = orderMatch[1] as keyof (typeof result)[0];
          const isDesc = (orderMatch[2] || '').toUpperCase() === 'DESC';
          result.sort((a, b) => {
            const valA = a[col] ?? 0;
            const valB = b[col] ?? 0;
            if (valA < valB) return isDesc ? 1 : -1;
            if (valA > valB) return isDesc ? -1 : 1;
            return 0;
          });
        }

        return {
          success: true,
          rows: result,
          rowCount: result.length,
          message: `Query returned ${result.length} rows.`
        };
      }

      // 2. INSERT INTO regions (...) VALUES (...)
      if (/^INSERT\s+INTO\s+regions/i.test(trimmed)) {
        // Parse values
        const valuesMatch = trimmed.match(/VALUES\s*\((.+?)\)/i);
        if (!valuesMatch) {
          return { success: false, message: "Syntax error: VALUES (...) clause missing or malformed." };
        }

        const rawValues = valuesMatch[1].split(',').map(s => s.trim().replace(/^['"]|['"]$/g, ''));
        // If 8 values: name, lat, lon, forest, soil, water, bio, [score]
        const name = rawValues[0] || 'Unknown Sanctuary';
        const lat = parseFloat(rawValues[1]) || 0;
        const lon = parseFloat(rawValues[2]) || 0;
        const forest = parseInt(rawValues[3], 10) || 75;
        const soil = parseInt(rawValues[4], 10) || 75;
        const water = parseInt(rawValues[5], 10) || 75;
        const bio = parseInt(rawValues[6], 10) || 75;

        const newReg = this.addRegion({
          name,
          latitude: lat,
          longitude: lon,
          forest_health: forest,
          soil_health: soil,
          water_health: water,
          biodiversity: bio,
          biome: "Global Restoration Zone",
          country: "Planetary Commons",
          carbon_storage_tons: 2500000,
          canopy_cover_pct: forest,
          wildfire_risk: "LOW",
          earth_spirit: {
            name: `${name} Spirit`,
            title: "Newly Connected Ecosystem Node",
            voice: "Our coordinates have joined the living planetary neural network.",
            historic_memory: "Restoration drones and local stewards begin the harmonic healing."
          }
        });

        return {
          success: true,
          rows: [{ id: newReg.id, name: newReg.name, score: newReg.ecosystem_score }],
          rowCount: 1,
          message: `1 row inserted into regions (ID: ${newReg.id}, Ecosystem Score: ${newReg.ecosystem_score}).`
        };
      }

      // 3. UPDATE regions SET ...
      if (/^UPDATE\s+regions/i.test(trimmed)) {
        const setMatch = trimmed.match(/SET\s+(.+?)(?:\s+WHERE\s+(.+)|$)/i);
        if (setMatch) {
          const assignments = setMatch[1].split(',').map(s => s.trim());
          const whereClause = setMatch[2];
          let targetId: number | null = null;
          if (whereClause) {
            const idMatch = whereClause.match(/id\s*=\s*(\d+)/i);
            if (idMatch) targetId = parseInt(idMatch[1], 10);
          }

          const updates: Partial<Region> = {};
          assignments.forEach(assign => {
            const [k, v] = assign.split('=').map(s => s.trim());
            const key = k.toLowerCase();
            const num = parseFloat(v);
            if (key === 'forest_health') updates.forest_health = num;
            if (key === 'soil_health') updates.soil_health = num;
            if (key === 'water_health') updates.water_health = num;
            if (key === 'biodiversity') updates.biodiversity = num;
          });

          if (targetId) {
            const updated = this.updateRegion(targetId, updates);
            return {
              success: true,
              rows: updated ? [{ id: updated.id, name: updated.name, score: updated.ecosystem_score }] : [],
              rowCount: updated ? 1 : 0,
              message: updated ? `Updated region #${targetId}.` : `Region #${targetId} not found.`
            };
          } else {
            // Update all
            this.regions.forEach(r => this.updateRegion(r.id, updates));
            return {
              success: true,
              rowCount: this.regions.length,
              message: `Updated all ${this.regions.length} regions.`
            };
          }
        }
      }

      // 4. CREATE TABLE / other statements
      if (/^CREATE\s+TABLE/i.test(trimmed)) {
        return {
          success: true,
          rowCount: 0,
          message: "Table 'regions' checked / verified with columns: id, name, latitude, longitude, forest_health, soil_health, water_health, biodiversity, ecosystem_score."
        };
      }

      return {
        success: false,
        message: "Unsupported SQL syntax. Supported statements: SELECT ... FROM regions [WHERE ... ORDER BY ...], INSERT INTO regions ... VALUES (...), UPDATE regions SET ... WHERE id = X."
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return { success: false, message: `SQL Execution Error: ${errorMsg}` };
    }
  }

  // Runs the Python prototype code directly and returns terminal console outputs
  public runPythonPrototype(code: string): { output: string[]; addedRegion?: Region } {
    const logs: string[] = [];
    logs.push(">>> python3 heavy_metal_leaf_prototype.py");
    logs.push("🌿 Initializing connection to heavy_metal_leaf.db...");
    logs.push("✓ SQLite schema verified: table 'regions' (id, name, latitude, longitude, forest, soil, water, bio, score)");

    // Look for name, lat, lon, forest, soil, water, bio in the python code
    const nameMatch = code.match(/name\s*=\s*['"]([^'"]+)['"]/i) || code.match(/"([^"]+)"\s*,\s*forest/i);
    const latMatch = code.match(/latitude\s*=\s*([-\d.]+)/i) || code.match(/lat\s*=\s*([-\d.]+)/i);
    const lonMatch = code.match(/longitude\s*=\s*([-\d.]+)/i) || code.match(/lon\s*=\s*([-\d.]+)/i);
    const forestMatch = code.match(/forest\s*=\s*(\d+)/i);
    const soilMatch = code.match(/soil\s*=\s*(\d+)/i);
    const waterMatch = code.match(/water\s*=\s*(\d+)/i);
    const bioMatch = code.match(/bio\s*=\s*(\d+)/i);

    const name = nameMatch ? nameMatch[1] : "Cascade Foothills Bio-Haven";
    const lat = latMatch ? parseFloat(latMatch[1]) : 46.8523;
    const lon = lonMatch ? parseFloat(lonMatch[1]) : -121.7603;
    const forest = forestMatch ? parseInt(forestMatch[1], 10) : 82;
    const soil = soilMatch ? parseInt(soilMatch[1], 10) : 68;
    const water = waterMatch ? parseInt(waterMatch[1], 10) : 74;
    const bio = bioMatch ? parseInt(bioMatch[1], 10) : 80;

    const score = calculateEcosystemScore(forest, soil, water, bio);
    const tasks = generateRecommendations(soil, water, bio, forest);

    logs.push(`>> cur.execute("INSERT INTO regions (name, latitude, longitude, forest_health, soil_health, water_health, biodiversity, ecosystem_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")`);
    logs.push(`>> conn.commit()`);
    logs.push(`[STDOUT] Region added: "${name}" [Lat: ${lat.toFixed(4)}, Lon: ${lon.toFixed(4)}]`);
    logs.push(`[STDOUT] Ecosystem Score: ${score}% (Forest: ${forest}%, Soil: ${soil}%, Water: ${water}%, Bio: ${bio}%)`);
    logs.push(`[STDOUT] Active Restoration Tasks generated by Engine:`);
    tasks.forEach(t => logs.push(`   - ${t}`));

    // Add to real db
    const added = this.addRegion({
      name,
      latitude: lat,
      longitude: lon,
      forest_health: forest,
      soil_health: soil,
      water_health: water,
      biodiversity: bio,
      biome: "Temperate Conifer / Riparian",
      country: "United States",
      carbon_storage_tons: 3100000,
      canopy_cover_pct: forest,
      wildfire_risk: "LOW",
      earth_spirit: {
        name: `${name} Guardian`,
        title: "Regenerative Mycorrhizal Hub",
        voice: "The stream returns to its gravel bed. The young willows take root.",
        historic_memory: "Rainfall records logged. Earth and code synchronize."
      }
    });

    logs.push(`✓ Database synchronized in-memory and local storage. New Region ID: #${added.id}`);
    return { output: logs, addedRegion: added };
  }

  public exportSQL(): string {
    let sql = `-- ========================================================\n`;
    sql += `-- MS. HEAVY METAL LEAF: GLOBAL EARTH RESTORATION DATABASE\n`;
    sql += `-- Generated: ${new Date().toISOString()}\n`;
    sql += `-- Target: SQLite / PostgreSQL (2025-2050 Planetary Nervous System)\n`;
    sql += `-- ========================================================\n\n`;
    sql += `CREATE TABLE IF NOT EXISTS regions (\n`;
    sql += `    id INTEGER PRIMARY KEY AUTOINCREMENT,\n`;
    sql += `    name TEXT NOT NULL,\n`;
    sql += `    latitude REAL NOT NULL,\n`;
    sql += `    longitude REAL NOT NULL,\n`;
    sql += `    forest_health INTEGER CHECK(forest_health BETWEEN 0 AND 100),\n`;
    sql += `    soil_health INTEGER CHECK(soil_health BETWEEN 0 AND 100),\n`;
    sql += `    water_health INTEGER CHECK(water_health BETWEEN 0 AND 100),\n`;
    sql += `    biodiversity INTEGER CHECK(biodiversity BETWEEN 0 AND 100),\n`;
    sql += `    ecosystem_score INTEGER CHECK(ecosystem_score BETWEEN 0 AND 100),\n`;
    sql += `    threat_level TEXT,\n`;
    sql += `    remediation_status TEXT,\n`;
    sql += `    last_updated TEXT,\n`;
    sql += `    toxicity_index INTEGER,\n`;
    sql += `    region_type TEXT,\n`;
    sql += `    contamination_type TEXT,\n`;
    sql += `    is_contaminated INTEGER DEFAULT 0,\n`;
    sql += `    source TEXT,\n`;
    sql += `    forest_loss REAL,\n`;
    sql += `    air_quality REAL,\n`;
    sql += `    temperature REAL,\n`;
    sql += `    rainfall REAL,\n`;
    sql += `    risk_score REAL\n`;
    sql += `);\n\n`;

    this.regions.forEach(r => {
      const threat = r.threat_level || (r.ecosystem_score < 40 ? 'CRITICAL' : 'MODERATE');
      const toxIdx = r.toxicity_index ?? (100 - r.ecosystem_score);
      const status = r.remediation_status || 'Active Swarm Deployed';
      const updated = r.last_updated || '2026-09-23';
      const rType = r.region_type || 'Bioregion';
      const contam = (r.contamination_type || '').replace(/'/g, "''");
      const isC = r.is_contaminated ? 1 : 0;
      const source = (r.source || 'NASA Earthdata / EPA TRI').replace(/'/g, "''");
      const forestLoss = r.forest_loss ?? 0.2;
      const airQ = r.air_quality ?? 75.0;
      const temp = r.temperature ?? 21.0;
      const rain = r.rainfall ?? 1200.0;
      const risk = r.risk_score ?? (isC ? 85.0 : 20.0);

      sql += `INSERT INTO regions (id, name, latitude, longitude, forest_health, soil_health, water_health, biodiversity, ecosystem_score, threat_level, remediation_status, last_updated, toxicity_index, region_type, contamination_type, is_contaminated, source, forest_loss, air_quality, temperature, rainfall, risk_score)\n`;
      sql += `VALUES (${r.id}, '${r.name.replace(/'/g, "''")}', ${r.latitude}, ${r.longitude}, ${r.forest_health}, ${r.soil_health}, ${r.water_health}, ${r.biodiversity}, ${r.ecosystem_score}, '${threat}', '${status.replace(/'/g, "''")}', '${updated}', ${toxIdx}, '${rType.replace(/'/g, "''")}', '${contam}', ${isC}, '${source}', ${forestLoss}, ${airQ}, ${temp}, ${rain}, ${risk});\n`;
    });

    return sql;
  }
}

export const earthDB = new EarthDatabaseManager();
