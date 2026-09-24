export interface Region {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  forest_health: number; // 0-100
  soil_health: number;   // 0-100
  water_health: number;  // 0-100
  biodiversity: number;  // 0-100
  ecosystem_score: number; // round((forest + soil + water + bio) / 4)
  biome: string;
  country: string;
  carbon_storage_tons: number;
  canopy_cover_pct: number;
  wildfire_risk: 'LOW' | 'MODERATE' | 'HIGH' | 'SEVERE';
  earth_spirit: {
    name: string;
    title: string;
    voice: string;
    historic_memory: string;
  };
  restoration_tasks: string[];
  active_drones_count: number;
  last_satellite_pass: string;
  is_contaminated?: boolean;
  contamination_type?: string;
  contamination_level?: 'CRITICAL' | 'SEVERE' | 'MODERATE';
  primary_contaminants?: string[];
  remediation_protocol?: string;
  threat_level?: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  remediation_status?: 'Remediation Planning' | 'Active Swarm Deployed' | 'Stabilized' | 'Restored' | string;
  last_updated?: string;
  toxicity_index?: number; // 0 - 100
  region_type?: 'River Basin' | 'Forest Canopy' | 'Smelter Complex' | 'Wetland' | 'Nuclear Zone' | 'Savanna' | string;
  source?: string; // NASA Earthdata, Global Forest Watch, USGS, EPA, GBIF
  forest_loss?: number; // Percentage canopy loss
  air_quality?: number; // AQI index (0-100)
  temperature?: number; // Celsius
  rainfall?: number; // mm per year
  risk_score?: number; // Comprehensive risk score (0-100)
}

export type DroneType = 'leaf' | 'river' | 'pollinator' | 'root' | 'sentinel';

export interface DroneSwarm {
  id: string;
  name: string;
  type: DroneType;
  regionId: number;
  regionName: string;
  units: number;
  mission: string;
  efficiency_rate: string;
  status: 'ACTIVE' | 'DEPLOYING' | 'RECHARGING' | 'COMPLETED';
  progress: number;
  dispatched_at: string;
}

export interface EnvironmentalManagementRecord {
  regionId: number;
  complianceStatus: 'FULL_COMPLIANCE' | 'ACTION_REQUIRED' | 'NON_COMPLIANT' | 'PERMIT_PENDING';
  aspects: string[];
  impacts: string[];
  iso14001Stage: 'PLAN' | 'DO' | 'CHECK' | 'ACT';
  regulations: string[];
  remediationAction: string;
  auditDueDate: string;
  responsibleManager: string;
}

export interface PlanetaryMetrics {
  overallHealthScore: number;
  treesPlantedToday: number;
  riversRestoredBasins: number;
  hectaresSoilInoculated: number;
  speciesRecoveringCount: number;
  activeSwarmUnits: number;
  totalCarbonSinkTons: number;
}
