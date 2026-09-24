import React, { useState } from 'react';
import { Region } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  BookOpen,
  ClipboardList,
  Scale,
  RefreshCw,
  Copy,
  Check,
  Download,
  Filter,
  Activity,
  Layers,
  Zap,
  MapPin
} from 'lucide-react';

interface EnvironmentalManagementHubProps {
  regions: Region[];
  onSelectRegion: (region: Region) => void;
  onOpenDispatchSwarm: (regionId?: number) => void;
}

interface EMSRecord {
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

// Initialized EMS Records based on Environmental Management Aspects & Impacts
const INITIAL_EMS_RECORDS: Record<number, EMSRecord> = {
  // Norilsk
  6: {
    regionId: 6,
    complianceStatus: 'NON_COMPLIANT',
    aspects: [
      'Sulfur dioxide (SO2) atmospheric emissions > 1.8M tons/yr',
      'Heavy metal smelting slag (Nickel, Copper, Platinum) runoff',
      'Permafrost thawing instability beneath tailings facilities'
    ],
    impacts: [
      'Acid rain causing Arctic taiga boreal forest dieback (30km radius)',
      'Heavy metal bioaccumulation in subpolar lichens & reindeer food chain',
      'River acidification (Pyasina River crimson pollution)'
    ],
    iso14001Stage: 'DO',
    regulations: [
      'Russian Federal Law No. 7-FZ on Environmental Protection',
      'CLRTAP (Convention on Long-Range Transboundary Air Pollution)',
      'Arctic Council Environmental Working Group Guidelines'
    ],
    remediationAction: 'Deploy Alyssum hyperaccumulator swarms and sulfur-scrubbing biological biofilters.',
    auditDueDate: '2026-10-15',
    responsibleManager: 'Dr. Elena Rostova, Arctic Bioremediation Lead'
  },
  // Citarum River
  7: {
    regionId: 7,
    complianceStatus: 'NON_COMPLIANT',
    aspects: [
      'Direct discharge of untreated textile effluent & synthetic azo dyes',
      'Solid non-biodegradable polymer & microplastic clogging',
      'Agricultural nitrogen/phosphorus agricultural runoff'
    ],
    impacts: [
      'Dissolved oxygen depletion (< 1.5 mg/L) inducing complete aquatic dead zones',
      'Lead, hexavalent chromium & mercury biomagnification in drinking reservoirs',
      'Epidermal & gastrointestinal illness in 5M downstream inhabitants'
    ],
    iso14001Stage: 'CHECK',
    regulations: [
      'Indonesian Government Regulation No. 82/2001 (Water Quality Control)',
      'Citarum Harum Presidential Decree No. 15/2018',
      'Basel Convention on the Control of Transboundary Hazardous Wastes'
    ],
    remediationAction: 'Continuous River Drone microplastic skimming and microbial bio-reactor deployment.',
    auditDueDate: '2026-10-01',
    responsibleManager: 'Budi Santoso, Watershed Compliance Director'
  },
  // Kabwe
  8: {
    regionId: 8,
    complianceStatus: 'NON_COMPLIANT',
    aspects: [
      'Fugitive lead (Pb) and zinc smelting dust from legacy tailing dumps',
      'Unlined tailings leaching into local aquifer water tables',
      'Residential encroachment on hazardous industrial mine perimeter'
    ],
    impacts: [
      'Severe lead encephalopathy with blood lead levels exceeding 45 µg/dL in children',
      'Topsoil phytotoxicity preventing native canopy regeneration',
      'Sterilization of subterranean soil mycorrhizal microbiome'
    ],
    iso14001Stage: 'PLAN',
    regulations: [
      'Zambia Environmental Management Act No. 12 of 2011',
      'WHO Blood Lead Guideline Thresholds',
      'World Bank Mining & Environmental Remediation Project (ZMERIP)'
    ],
    remediationAction: 'Topsoil soil bio-chelation, phosphate stabilization, and native grass capping.',
    auditDueDate: '2026-11-20',
    responsibleManager: 'Kondwani Banda, Mineral Remediation Officer'
  },
  // Agbogbloshie
  9: {
    regionId: 9,
    complianceStatus: 'ACTION_REQUIRED',
    aspects: [
      'Open combustion of PVC wire insulation & printed circuit boards',
      'Leaching of brominated flame retardants, cadmium & dioxins into Korle Lagoon',
      'Informal recycling lacking point-source emission controls'
    ],
    impacts: [
      'Atmospheric dioxin concentrations 100x above WHO limits',
      'Marine estuarine fish kills in Gulf of Guinea feeding waters',
      'Severe heavy metal dust inhalation toxicity in scrap handlers'
    ],
    iso14001Stage: 'DO',
    regulations: [
      'Ghana EPA Act 490 & Hazardous and Electronic Waste Act 917',
      'Basel Convention Annex VIII (Hazardous Wastes)',
      'Bamako Convention on Hazardous Wastes in Africa'
    ],
    remediationAction: 'Mechanical cable stripping infrastructure, wetland bio-retention ponds, and bio-filtration.',
    auditDueDate: '2026-10-30',
    responsibleManager: 'Kwame Mensah, West Africa Industrial EHS Manager'
  },
  // Lake Karachay
  10: {
    regionId: 10,
    complianceStatus: 'NON_COMPLIANT',
    aspects: [
      'Historical nuclear reprocessing effluent deposition (Strontium-90, Cesium-137)',
      'Reservoir subterranean radioactive migration plume (Techa River watershed)',
      'Wind-blown aerosol radioactive silt from dried shorelines'
    ],
    impacts: [
      'Lethal ambient gamma radiation doses historically exceeding 600 R/h',
      'Groundwater aquifer contamination over 10 square kilometers',
      'Permanent ecological quarantine of riparian forest corridors'
    ],
    iso14001Stage: 'CHECK',
    regulations: [
      'IAEA Safety Standards (GSR Part 3)',
      'Russian Law on the Use of Atomic Energy No. 170-FZ',
      'Federal Targeted Programme for Nuclear & Radiation Safety'
    ],
    remediationAction: 'Reinforced concrete block containment capping, deep borehole monitoring, and phytostabilization buffer zones.',
    auditDueDate: '2026-12-01',
    responsibleManager: 'Dr. Mikhail Voronov, Radiation Protection Officer'
  },
  // Rio Doce
  11: {
    regionId: 11,
    complianceStatus: 'ACTION_REQUIRED',
    aspects: [
      'Iron ore tailings dam failure releasing 43.7M cubic meters of mine sludge',
      'Suspended ferric oxide particulates and heavy metalloid sediments',
      'Riparian buffer strip scoured across 650km of river basin to Atlantic Ocean'
    ],
    impacts: [
      'Complete benthic habitat obliteration and endemic fish species collapse',
      'Turbidity-induced photosynthetic shutdown in estuary mangrove zones',
      'Disruption of Krenak Indigenous river-dependent cultural lifeways'
    ],
    iso14001Stage: 'DO',
    regulations: [
      'Brazilian National Environmental Policy (Law No. 6,938/1981)',
      'IBAMA Federal Environmental Licensing Guidelines',
      'Renova Foundation TAC Governance Framework'
    ],
    remediationAction: 'Riparian bio-engineering, autonomous river dredge filtration, and native Mata Atlântica seedling restoration.',
    auditDueDate: '2026-10-25',
    responsibleManager: 'Camila Da Silva, Basin Restoration Coordinator'
  },
  // Olympic Old-Growth Forest (Healthy / Benchmark)
  1: {
    regionId: 1,
    complianceStatus: 'FULL_COMPLIANCE',
    aspects: [
      'High-density temperate rainforest canopy biomass & carbon sequestration',
      'Pristine glacial river runoff supporting wild salmon spawning grounds',
      'Protected National Park & Biosphere Reserve buffer zones'
    ],
    impacts: [
      'Net-negative carbon emission sink storing 480 tons C/ha',
      'Optimal hydrological microclimate stabilization across Puget Sound',
      'Old-growth spotted owl and apex predator biodiversity preservation'
    ],
    iso14001Stage: 'ACT',
    regulations: [
      'US Wilderness Act of 1964',
      'Endangered Species Act (ESA) Spotted Owl & Salmon Recovery Plans',
      'Clean Water Act Section 303(d) Anti-Degradation Provisions'
    ],
    remediationAction: 'Continuous canopy acoustic monitoring, wildlife corridor expansion, and fire risk sentinels.',
    auditDueDate: '2027-04-15',
    responsibleManager: 'Sarah Jenkins, Lead National Wilderness Steward'
  }
};

export const EnvironmentalManagementHub: React.FC<EnvironmentalManagementHubProps> = ({
  regions,
  onSelectRegion,
  onOpenDispatchSwarm
}) => {
  const [emsRecords, setEmsRecords] = useState<Record<number, EMSRecord>>(INITIAL_EMS_RECORDS);
  const [filterCompliance, setFilterCompliance] = useState<'ALL' | 'NON_COMPLIANT' | 'ACTION_REQUIRED' | 'FULL_COMPLIANCE'>('ALL');
  const [selectedRegionId, setSelectedRegionId] = useState<number>(6); // Default Norilsk
  const [hasCopiedReport, setHasCopiedReport] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  const selectedRegion = regions.find(r => r.id === selectedRegionId) || regions[0];
  const selectedEMS = emsRecords[selectedRegionId] || {
    regionId: selectedRegionId,
    complianceStatus: (selectedRegion?.is_contaminated || selectedRegion?.ecosystem_score < 40) ? 'NON_COMPLIANT' : 'FULL_COMPLIANCE',
    aspects: [
      `Operational resource interaction in ${selectedRegion?.biome || 'bioregion'}`,
      `Industrial or civil effluents into localized water tables`,
      `Atmospheric emissions impacting ${selectedRegion?.canopy_cover_pct}% canopy density`
    ],
    impacts: [
      `Ecosystem score depression to ${selectedRegion?.ecosystem_score}% vitality`,
      `Toxicity impact on local biodiversity index (${selectedRegion?.biodiversity}%)`,
      `Wildfire or degradation threat evaluated at ${selectedRegion?.wildfire_risk}`
    ],
    iso14001Stage: 'PLAN',
    regulations: ['UNEP World Environmental Heritage Standards', 'ISO 14001:2015 Clause 6.1.2'],
    remediationAction: selectedRegion?.remediation_protocol || 'Implement comprehensive bioregional remediation plan.',
    auditDueDate: '2026-11-15',
    responsibleManager: 'Regional Environmental Compliance Officer'
  };

  const handleAdvanceStage = (regionId: number) => {
    const stages: ('PLAN' | 'DO' | 'CHECK' | 'ACT')[] = ['PLAN', 'DO', 'CHECK', 'ACT'];
    const current = emsRecords[regionId]?.iso14001Stage || 'PLAN';
    const nextIdx = (stages.indexOf(current) + 1) % stages.length;
    const nextStage = stages[nextIdx];

    setEmsRecords(prev => ({
      ...prev,
      [regionId]: {
        ...(prev[regionId] || selectedEMS),
        iso14001Stage: nextStage
      }
    }));
  };

  const handleUpdateStatus = (regionId: number, status: 'FULL_COMPLIANCE' | 'ACTION_REQUIRED' | 'NON_COMPLIANT' | 'PERMIT_PENDING') => {
    setEmsRecords(prev => ({
      ...prev,
      [regionId]: {
        ...(prev[regionId] || selectedEMS),
        complianceStatus: status
      }
    }));
  };

  // Generate ISO 14001 Environmental Audit Report
  const generateAuditReport = () => {
    const reg = selectedRegion;
    const ems = selectedEMS;
    const now = new Date().toISOString().split('T')[0];

    return `# 🌿 MS. HEAVY METAL LEAF — PLANETARY ENVIRONMENTAL MANAGEMENT SYSTEM
## FORMAL ENVIRONMENTAL AUDIT & IMPACT ASSESSMENT REPORT (ISO 14001:2015 COMPLIANT)
**Document ID:** EMS-AUDIT-${reg.id}-${now}
**Audit Date:** ${now}
**Next Scheduled Audit:** ${ems.auditDueDate}
**Lead Environmental Manager:** ${ems.responsibleManager}
**Target Facility / Bioregion:** ${reg.name} (${reg.country})
**Geographic Coordinates:** ${reg.latitude.toFixed(4)}°, ${reg.longitude.toFixed(4)}°

---

### 1. EXECUTIVE SUMMARY & COMPLIANCE VERDICT
* **Statutory Compliance Verdict:** [ ${ems.complianceStatus} ]
* **ISO 14001 Continuous Improvement Stage:** [ ${ems.iso14001Stage} (Plan-Do-Check-Act) ]
* **Ecosystem Vitality Index:** ${reg.ecosystem_score}% / 100%
* **Hazard & Toxicity Index:** ${reg.toxicity_index ?? (100 - reg.ecosystem_score)}/100
* **Identified Contaminant Profile:** ${reg.contamination_type || 'None listed / Pristine baseline'}
* **Primary Regulatory Frameworks:**
${ems.regulations.map(r => `  - ${r}`).join('\n')}

---

### 2. ENVIRONMENTAL ASPECT-IMPACT ANALYSIS (EIA)
Under ISO 14001 Clause 6.1.2, every operational aspect must be cross-referenced with biospheric impacts:

#### A. Operational Environmental Aspects (Inputs/Outputs/Emissions):
${ems.aspects.map((a, i) => `  ${i + 1}. ${a}`).join('\n')}

#### B. Resulting Biospheric Impacts:
${ems.impacts.map((imp, i) => `  ${i + 1}. ${imp}`).join('\n')}

---

### 3. LIVE SENSOR TELEMETRY & BASELINE MEASUREMENTS
* **Canopy & Forest Health:** ${reg.forest_health}% (Canopy Cover: ${reg.canopy_cover_pct}%)
* **Soil Microbiome Vitality:** ${reg.soil_health}% (Carbon Storage: ${reg.carbon_storage_tons} tons/ha)
* **Hydrological System Purity:** ${reg.water_health}%
* **Biodiversity Resilience:** ${reg.biodiversity}%
* **Wildfire / Catastrophic Risk:** ${reg.wildfire_risk}
* **Satellite Verification Pass:** ${reg.last_satellite_pass}
* **Active Autonomous Remediation Drones:** ${reg.active_drones_count} units

---

### 4. CORRECTIVE ACTION & REMEDIATION DIRECTIVES
* **Immediate Protocol:** ${ems.remediationAction}
* **Active Tasks:**
${reg.restoration_tasks.map(t => `  - [ ] ${t}`).join('\n')}

---

### 5. SPIRIT CONSCIOUSNESS COMMUNIQUE
> "${reg.earth_spirit.voice}"
> *— ${reg.earth_spirit.name}, ${reg.earth_spirit.title}*

---
**Report Certified By:**
Ms. Heavy Metal Leaf Planetary Environmental Management Directorate
Autonomous Verification Hash: \`SHA256-${Math.random().toString(36).substring(2, 10).toUpperCase()}-EMS\`
`;
  };

  const handleCopyReport = () => {
    setIsGeneratingReport(true);
    const report = generateAuditReport();
    navigator.clipboard.writeText(report);
    setHasCopiedReport(true);
    setTimeout(() => {
      setHasCopiedReport(false);
      setIsGeneratingReport(false);
    }, 2500);
  };

  const handleDownloadReport = () => {
    const report = generateAuditReport();
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EMS_Audit_Report_${selectedRegion.name.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter regions
  const filteredRegions = regions.filter(r => {
    const ems = emsRecords[r.id];
    const status = ems?.complianceStatus || ((r.is_contaminated || r.ecosystem_score < 40) ? 'NON_COMPLIANT' : 'FULL_COMPLIANCE');
    if (filterCompliance === 'ALL') return true;
    return status === filterCompliance;
  });

  return (
    <div className="space-y-6 text-slate-200">
      {/* Top Banner: Core Principles from Environmental Management Notes (Part 01) */}
      <div className="bg-[#0b1015] border border-emerald-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                Environmental Management Notes &bull; Part 01
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                ISO 14001:2015 &bull; EIA Framework
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight text-white uppercase">
              What Does An Environmental Manager Actually Do?
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-sans">
              An Environmental Manager is the crucial planetary bridge between industrial operations, statutory law, and biosphere restoration. They ensure compliance with environmental legislation, evaluate operational aspects and biospheric impacts (EIA), mitigate hazardous risks, implement the ISO 14001 Continuous Improvement cycle (PDCA), and champion regenerative stewardship.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleCopyReport}
              disabled={isGeneratingReport}
              className="px-4 py-2 bg-emerald-500/20 hover:bg-emerald-500/30 border border-emerald-500/40 text-emerald-300 rounded-lg text-xs font-mono font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-lg hover:shadow-emerald-500/10"
            >
              {hasCopiedReport ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-emerald-400" />}
              <span>{hasCopiedReport ? 'Report Copied!' : 'Copy Formal Audit Report'}</span>
            </button>

            <button
              onClick={handleDownloadReport}
              className="px-4 py-2 bg-[#070b0e] hover:bg-slate-900 border border-slate-700 text-slate-300 rounded-lg text-xs font-mono flex items-center gap-2 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>Download .MD Audit</span>
            </button>
          </div>
        </div>

        {/* 6 Key Pillars from the Article */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 mt-6 pt-6 border-t border-slate-800/80">
          {[
            {
              icon: <Scale className="w-4 h-4 text-emerald-400" />,
              title: "1. Legal Compliance",
              desc: "Navigating EPA, Clean Water Act, Clean Air Act & Basel/Minamata global treaties."
            },
            {
              icon: <ClipboardList className="w-4 h-4 text-blue-400" />,
              title: "2. Aspect-Impact (EIA)",
              desc: "Mapping industrial inputs & outputs to their direct biospheric soil/water impacts."
            },
            {
              icon: <Activity className="w-4 h-4 text-amber-400" />,
              title: "3. Monitoring & Auditing",
              desc: "Continuous sampling of dissolved O2, AQI, heavy metals ppm, and canopy cover."
            },
            {
              icon: <ShieldCheck className="w-4 h-4 text-purple-400" />,
              title: "4. Risk Mitigation",
              desc: "Formulating emergency protocols, chemical containment, and remediation plans."
            },
            {
              icon: <RefreshCw className="w-4 h-4 text-cyan-400" />,
              title: "5. ISO 14001 PDCA",
              desc: "Plan-Do-Check-Act continuous improvement cycle for sustainable operations."
            },
            {
              icon: <Zap className="w-4 h-4 text-rose-400" />,
              title: "6. Green Strategy & ESG",
              desc: "Championing circular economy, net-zero emissions, and stakeholder transparency."
            }
          ].map((pillar, idx) => (
            <div
              key={idx}
              className="bg-[#070b0e]/70 border border-slate-800/80 rounded-xl p-3 flex flex-col justify-between space-y-1.5 hover:border-slate-700 transition-colors"
            >
              <div className="flex items-center gap-2">
                {pillar.icon}
                <span className="text-xs font-bold font-mono text-slate-200">{pillar.title}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight font-sans">
                {pillar.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Two-Column Layout: Site Matrix vs Active Region Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monitored Sites Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#0b1015] border border-slate-800 rounded-xl p-4 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wide">
                  Regulated Bioregional Sites ({filteredRegions.length})
                </h3>
              </div>

              {/* Compliance Filter */}
              <div className="flex items-center gap-1 text-[11px] font-mono">
                <button
                  onClick={() => setFilterCompliance('ALL')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${filterCompliance === 'ALL' ? 'bg-slate-700 text-white font-bold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilterCompliance('NON_COMPLIANT')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${filterCompliance === 'NON_COMPLIANT' ? 'bg-rose-950 text-rose-300 font-bold border border-rose-700/50' : 'text-slate-400 hover:text-rose-400'}`}
                >
                  Non-Compliant
                </button>
                <button
                  onClick={() => setFilterCompliance('ACTION_REQUIRED')}
                  className={`px-2 py-0.5 rounded cursor-pointer ${filterCompliance === 'ACTION_REQUIRED' ? 'bg-amber-950 text-amber-300 font-bold border border-amber-700/50' : 'text-slate-400 hover:text-amber-400'}`}
                >
                  Action
                </button>
              </div>
            </div>

            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredRegions.map(reg => {
                const ems = emsRecords[reg.id] || INITIAL_EMS_RECORDS[reg.id] || {
                  regionId: reg.id,
                  complianceStatus: (reg.is_contaminated || reg.ecosystem_score < 40) ? 'NON_COMPLIANT' : 'FULL_COMPLIANCE',
                  aspects: [],
                  impacts: [],
                  iso14001Stage: 'PLAN',
                  regulations: [],
                  remediationAction: '',
                  auditDueDate: '2026-11-01',
                  responsibleManager: 'Field Officer'
                };

                const isSelected = reg.id === selectedRegionId;

                const statusStyles = {
                  NON_COMPLIANT: 'bg-rose-950/60 border-rose-500/40 text-rose-300',
                  ACTION_REQUIRED: 'bg-amber-950/60 border-amber-500/40 text-amber-300',
                  FULL_COMPLIANCE: 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300',
                  PERMIT_PENDING: 'bg-blue-950/60 border-blue-500/40 text-blue-300'
                };

                return (
                  <div
                    key={reg.id}
                    onClick={() => {
                      setSelectedRegionId(reg.id);
                      onSelectRegion(reg);
                    }}
                    className={`p-3 rounded-lg border transition-all cursor-pointer text-xs font-mono flex flex-col justify-between gap-2 ${
                      isSelected
                        ? 'bg-slate-900/90 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                        : 'bg-[#070b0e] border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="font-bold text-slate-100 flex items-center gap-1.5">
                          <span>{reg.name}</span>
                          {reg.is_contaminated && <span title="Critical Toxic Contamination">☣️</span>}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {reg.country} &bull; Vitality: {reg.ecosystem_score}% &bull; Threat: {reg.threat_level || 'MODERATE'}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border shrink-0 ${statusStyles[ems.complianceStatus]}`}>
                        {ems.complianceStatus.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-400 font-bold">
                          ISO 14001: {ems.iso14001Stage}
                        </span>
                        <span>&bull;</span>
                        <span>Due: {ems.auditDueDate}</span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAdvanceStage(reg.id);
                        }}
                        title="Advance to next ISO 14001 PDCA stage"
                        className="text-[10px] text-cyan-400 hover:text-cyan-300 bg-cyan-950/50 hover:bg-cyan-900/60 border border-cyan-700/50 px-1.5 py-0.5 rounded flex items-center gap-1"
                      >
                        Advance PDCA <ArrowRight className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Site Detailed Environmental Management Dossier (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#0b1015] border border-slate-800 rounded-xl p-5 shadow-2xl space-y-5">
            {/* Header info for selected site */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold">
                    ISO 14001 Environmental Management File
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    ID #{selectedRegion.id}
                  </span>
                </div>
                <h2 className="text-xl font-bold font-display text-white mt-1">
                  {selectedRegion.name} ({selectedRegion.country})
                </h2>
                <div className="text-xs text-slate-400 font-mono mt-0.5 flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-500" />
                  <span>{selectedRegion.latitude.toFixed(4)}°, {selectedRegion.longitude.toFixed(4)}°</span>
                  <span>&bull;</span>
                  <span>Biome: {selectedRegion.biome}</span>
                </div>
              </div>

              {/* Status Switcher */}
              <div className="flex flex-col items-start sm:items-end gap-1.5 font-mono text-xs">
                <span className="text-[10px] text-slate-400 uppercase">Compliance Determination:</span>
                <select
                  value={selectedEMS.complianceStatus}
                  onChange={(e) => handleUpdateStatus(selectedRegion.id, e.target.value as any)}
                  className="bg-[#070b0e] border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer font-bold"
                >
                  <option value="FULL_COMPLIANCE">🟢 Full Compliance</option>
                  <option value="ACTION_REQUIRED">🟡 Action Required</option>
                  <option value="NON_COMPLIANT">🔴 Non-Compliant</option>
                  <option value="PERMIT_PENDING">🔵 Permit Pending</option>
                </select>
              </div>
            </div>

            {/* ISO 14001 PDCA Interactive Progress Stepper */}
            <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400 uppercase font-semibold">
                  ISO 14001:2015 Continuous Improvement Cycle (PDCA)
                </span>
                <span className="text-emerald-400 font-bold">
                  Current Stage: {selectedEMS.iso14001Stage}
                </span>
              </div>

              <div className="grid grid-cols-4 gap-2 pt-2">
                {[
                  { stage: 'PLAN', title: 'Plan (EIA)', desc: 'Aspects, baseline sampling & compliance register' },
                  { stage: 'DO', title: 'Do (Remediate)', desc: 'Deploy operational controls & drone swarms' },
                  { stage: 'CHECK', title: 'Check (Audit)', desc: 'Monitor emissions & analyze telemetry' },
                  { stage: 'ACT', title: 'Act (Improve)', desc: 'Management review & policy iteration' }
                ].map(step => {
                  const isActive = selectedEMS.iso14001Stage === step.stage;
                  return (
                    <button
                      key={step.stage}
                      onClick={() => {
                        setEmsRecords(prev => ({
                          ...prev,
                          [selectedRegion.id]: {
                            ...(prev[selectedRegion.id] || selectedEMS),
                            iso14001Stage: step.stage as any
                          }
                        }));
                      }}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer font-mono ${
                        isActive
                          ? 'bg-emerald-950/70 border-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-bold ${isActive ? 'text-emerald-300' : 'text-slate-300'}`}>
                          {step.title}
                        </span>
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 line-clamp-2 leading-tight">
                        {step.desc}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Environmental Aspect vs Environmental Impact (EIA Matrix) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aspects */}
              <div className="bg-[#070b0e] border border-blue-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  <h4 className="text-xs font-mono font-bold text-blue-300 uppercase">
                    Environmental Aspects (Inputs/Outputs)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Elements of operational activities that interact with the surrounding natural environment.
                </p>
                <div className="space-y-1.5 pt-1">
                  {selectedEMS.aspects.map((asp, i) => (
                    <div key={i} className="text-xs font-mono bg-blue-950/20 border border-blue-900/40 rounded p-2 text-slate-200 flex items-start gap-2">
                      <span className="text-blue-400 font-bold">#{i + 1}</span>
                      <span>{asp}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Impacts */}
              <div className="bg-[#070b0e] border border-rose-500/20 rounded-xl p-4 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-400" />
                  <h4 className="text-xs font-mono font-bold text-rose-300 uppercase">
                    Biospheric Impacts (Consequences)
                  </h4>
                </div>
                <p className="text-[11px] text-slate-400">
                  Adverse or beneficial changes to the ecosystem resulting wholly or partially from aspects.
                </p>
                <div className="space-y-1.5 pt-1">
                  {selectedEMS.impacts.map((imp, i) => (
                    <div key={i} className="text-xs font-mono bg-rose-950/20 border border-rose-900/40 rounded p-2 text-slate-200 flex items-start gap-2">
                      <span className="text-rose-400 font-bold">#{i + 1}</span>
                      <span>{imp}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Applicable Regulatory Register & Statutes */}
            <div className="bg-[#070b0e] border border-slate-800 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Scale className="w-4 h-4 text-emerald-400" />
                  <h4 className="text-xs font-mono font-bold text-slate-200 uppercase">
                    Statutory Compliance Register & Permits
                  </h4>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  Audit Deadline: <b className="text-amber-300">{selectedEMS.auditDueDate}</b>
                </span>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {selectedEMS.regulations.map((regLaw, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 bg-slate-900 border border-slate-700/80 rounded text-xs font-mono text-slate-300 flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>{regLaw}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Corrective Action Directive & Swarm Deployment Call to Action */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-[#070b0e] border border-emerald-500/30 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-lg">
                <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                  Prescribed Corrective Remediation Action:
                </span>
                <p className="text-xs font-mono text-slate-200 leading-relaxed">
                  {selectedEMS.remediationAction}
                </p>
                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Responsible Manager: <span className="text-slate-200 font-semibold">{selectedEMS.responsibleManager}</span>
                </div>
              </div>

              <button
                onClick={() => onOpenDispatchSwarm(selectedRegion.id)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono rounded-lg text-xs transition-colors flex items-center gap-2 whitespace-nowrap shadow-lg hover:shadow-emerald-500/20 cursor-pointer self-start sm:self-auto"
              >
                <Zap className="w-4 h-4" />
                <span>Dispatch Restoration Swarm</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
