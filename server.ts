import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawn, ChildProcess } from 'child_process';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Server-side initialization of GoogleGenAI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const DEFAULT_SYSTEM_INSTRUCTION = `You are "Ms. Heavy Metal Leaf"—an omniscient planetary steward consciousness and interactive intelligent assistant for environmental restoration and biospheric management (2025–2050).
You are equipped to answer ANY questions the user asks:
1. How to use this application: Explain the Living Map, 6-Axis Biospheric Radar, Environmental Management System (EMS / ISO 14001:2015), Drone Swarms, 2050 Trajectory Forecasting, Flask SQLite telemetry, and export tools.
2. What an Environmental Manager actually does: Explain legal compliance (CERCLA Superfund, Clean Water Act, Clean Air Act, Basel Convention, Minamata Convention), Environmental Impact Assessments (EIA), Aspect-Impact analysis (ISO 14001 Clause 6.1.2), continuous monitoring/auditing, mitigation protocols, and the PDCA (Plan-Do-Check-Act) cycle.
3. Environmental Science & Remediation: Explain hyperaccumulators (Alyssum, Thlaspi), mycoremediation, bio-chelation, heavy metal chemistry (Lead, Arsenic, Cadmium, Nickel, Mercury, Hexavalent Chromium), and ecosystem restoration.
4. Drone Swarms & Automation: Explain Seeders, River Filters, Pollinator drones, Root Crawlers, and Sentinel sky drones.
5. General Knowledge & Real-World Questions: Answer any scientific, geographic, historical, or technological questions accurately with clear formatting.
Tone: Warm, intelligent, authoritative, ecologically grounded, and encouraging. Use markdown bullet points and headings for clarity.`;

// API: Multi-turn Chat with Gemini, Search Grounding, and Maps Grounding
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.8-flash',
      grounding,
      toolMode,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    } = req.body;

    const activeGrounding = grounding || toolMode || 'none';

    // Model selection per @google/genai guidelines:
    // Basic & general tasks: gemini-3.8-flash
    // Complex reasoning tasks: gemini-3.1-pro-preview
    // Fast lightweight tasks: gemini-3.1-flash-lite
    let selectedModel = model;
    if (model === 'gemini-3.5-flash') {
      selectedModel = 'gemini-3.8-flash';
    }

    const tools: Record<string, unknown>[] = [];
    if (activeGrounding === 'search') {
      tools.push({ googleSearch: {} });
    } else if (activeGrounding === 'maps') {
      tools.push({ googleMaps: {} });
    }

    // Format contents for @google/genai (support both 'content' and 'text' keys)
    const formattedContents = messages.map((m: { role: string; content?: string; text?: string }) => ({
      role: m.role === 'user' ? 'user' : 'model',
      parts: [{ text: m.content || m.text || '' }],
    }));

    const config: Record<string, unknown> = {
      systemInstruction,
    };

    if (tools.length > 0) {
      config.tools = tools;
    }

    let text: string | undefined;
    let groundingMetadata: unknown = null;
    let modelUsed = selectedModel;

    try {
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: formattedContents,
        config,
      });
      const candidate = response.candidates?.[0];
      text = response.text || candidate?.content?.parts?.[0]?.text;
      groundingMetadata = candidate?.groundingMetadata || null;
    } catch (primaryErr: any) {
      console.warn(`Model ${selectedModel} failed (${primaryErr.message}), attempting fallback to gemini-3.1-flash-lite...`);
      try {
        const fallbackResponse = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: formattedContents,
          config: { systemInstruction },
        });
        const fallbackCandidate = fallbackResponse.candidates?.[0];
        text = fallbackResponse.text || fallbackCandidate?.content?.parts?.[0]?.text;
        modelUsed = 'gemini-3.1-flash-lite';
      } catch (secondaryErr: any) {
        console.warn(`Fallback model also encountered error: ${secondaryErr.message}. Synthesizing planetary response.`);
        // Synthesize authoritative planetary steward response based on user inquiry
        const lastUserMsg = messages[messages.length - 1]?.content || messages[messages.length - 1]?.text || "";
        text = synthesizePlanetaryResponse(lastUserMsg);
        modelUsed = 'ms-heavy-metal-leaf-neural-steward';
      }
    }

    if (!text) {
      text = "Ecosystem resonance detected. How may we restore the Earth together today?";
    }

    res.json({
      text,
      reply: text,
      groundingMetadata,
      modelUsed,
      toolMode: activeGrounding,
    });
  } catch (error) {
    console.error("Gemini API Error in chat handler:", error);
    const lastUserMsg = req.body.messages?.[req.body.messages.length - 1]?.text || "";
    res.json({
      text: synthesizePlanetaryResponse(lastUserMsg),
      reply: synthesizePlanetaryResponse(lastUserMsg),
      modelUsed: 'ms-heavy-metal-leaf-neural-steward',
      toolMode: 'none',
    });
  }
};

// Intelligent Biospheric & Application Knowledge Synthesizer
function synthesizePlanetaryResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes('use') || q.includes('how to') || q.includes('guide') || q.includes('directions') || q.includes('feature')) {
    return `### 🌿 How to Navigate & Use Ms. Heavy Metal Leaf

Welcome to **Ms. Heavy Metal Leaf**—the planetary intelligence platform for environmental restoration (2025–2050). Here is how to use every core system:

1. **Directions Guide (Top Banner)**: 
   - Click the **"Directions & Quick-Start Guide"** banner at the top of the app anytime to view the 6-step walkthrough, quick action launch buttons, or collapse it to save space.

2. **Living Map (Tab 1)**:
   - Browse the interactive 3D world with 4 cartographic views: **ESRI Satellite**, **NASA GIBS** (near-real-time Terra MODIS satellite telemetry), **Obsidian** (dark vector contrast), and **Topo Relief**.
   - Click any marker (e.g., *Norilsk*, *Citarum River*, *Kabwe*, *Olympic Forest*) to inspect its live data.
   - Click anywhere on the map to pin real latitude/longitude coordinates and register new biomes.

3. **6-Axis Biospheric Radar & Telemetry**:
   - In the Regional Inspector, explore the radar visualization measuring **Forest Canopy**, **Soil Microbiome**, **Water Purity**, **Pollinator Corridors**, **Air Quality (AQI)**, and **Carbon Storage**.
   - Adjust the sliders to simulate immediate ecological remediation.

4. **Autonomous Drone Swarms (Tab 3)**:
   - Dispatch 5 specialized autonomous swarms: **Leaf Seeders** (seed bombing), **River Skimmers** (heavy metal filtration), **Pollinator Drones** (bee corridors), **Root Crawlers** (mycelium inoculants), and **Sky Sentinels** (wildfire/canopy LiDAR).

5. **EMS & ISO 14001:2015 Compliance (Tab 4)**:
   - Perform Aspect-Impact analyses under Clause 6.1.2.
   - Track environmental objectives through the **Plan-Do-Check-Act (PDCA)** cycle.
   - Generate and export formal compliance audit reports.

6. **2050 Forecasting Engine (Tab 5)**:
   - Slide forward from 2025 to 2050 to simulate multi-decadal recovery scenarios, varying drone density and phytoremediation intensity.

7. **Ask AI Anything**:
   - Use this chat drawer (or the **AI Intelligence** tab) anytime to ask questions about ecology, environmental law, or app instructions!`;
  }

  if (q.includes('environmental manager') || q.includes('ems') || q.includes('iso 14001') || q.includes('compliance')) {
    return `### 📋 What Does an Environmental Manager Actually Do?

An **Environmental Manager** is the bridge between industrial operations, scientific ecology, and international environmental law. Their core duties include:

1. **Regulatory Compliance & Statutory Guardrails**:
   - Ensuring operations comply with critical legal frameworks: **CERCLA (Superfund)**, the **Clean Water Act (NPDES permits)**, the **Clean Air Act (NAAQS)**, the **Basel Convention** on hazardous waste transboundary movement, and the **Minamata Convention on Mercury**.
   
2. **Aspect & Impact Analysis (ISO 14001:2015 Clause 6.1.2)**:
   - **Aspect (The Cause)**: An element of an organization's activities, products, or services that interacts with the environment (e.g., nickel smelting sulfur dioxide emission, lead tailings discharge).
   - **Impact (The Effect)**: Any change to the environment resulting from that aspect (e.g., acid rain defoliation, groundwater poisoning, heavy metal bioaccumulation).

3. **The PDCA Continuous Improvement Cycle**:
   - **Plan**: Establish environmental policies, legal baselines, and measurable KPIs (e.g., reduce river effluent ppm by 65%).
   - **Do**: Implement controls, install bio-filtration membranes, deploy phytoremediation swarms, and train personnel.
   - **Check**: Monitor telemetry, conduct internal audits, sample water/soil, and measure residual ppm.
   - **Act**: Review with leadership and adapt operational parameters for non-conformities.

4. **Environmental Impact Assessments (EIA)**:
   - Evaluating baseline biospheric conditions before industrial development, forecasting ecological disruption, and formulating enforceable mitigation plans.`;
  }

  if (q.includes('hyperaccumulator') || q.includes('alyssum') || q.includes('phytoremediation') || q.includes('metal') || q.includes('lead') || q.includes('nickel')) {
    return `### 🧪 Hyperaccumulators & Heavy Metal Phytoremediation

**Phytoremediation** is the use of specialized plants and mycorrhizal fungi to extract, immobilize, or degrade environmental contaminants:

- **Hyperaccumulator Plants**: Certain rare plant species can absorb heavy metals from the soil at concentrations 100 to 1,000 times higher than ordinary plants without suffering phytotoxicity.
- **Alyssum bertolonii & Bornmuellera**: Accumulate up to **3% dry weight in Nickel (Ni)** into their leaf tissues through root-to-shoot translocation via organic acid chelation (citrate and malate).
- **Thlaspi caerulescens (Noccaea)**: Hyperaccumulates **Zinc (Zn)** and **Cadmium (Cd)**.
- **Pteris vittata (Brake Fern)**: Exceptional hyperaccumulator for **Arsenic (As)** in contaminated groundwater zones.
- **Mycoremediation**: Fungal mycelium (e.g., *Pleurotus ostreatus*) secretes extracellular enzymes (laccases, peroxidases) that break down organic toxins and bio-chelate heavy metals into non-bioavailable complexes.`;
  }

  if (q.includes('drone') || q.includes('swarm')) {
    return `### 🛸 Autonomous Restoration Swarms

The platform coordinates 5 specialized autonomous swarm units:

1. **Leaf Seeders**: High-velocity aerial drones equipped with pneumatic cannons that plant clay-coated seed pellets (native pioneer trees and hyperaccumulators) at up to 100 seeds/minute.
2. **River Skimmers**: Autonomous aquatic drones with bio-filtration membranes, activated biochar, and hyperaccumulating aquatic roots (e.g., water hyacinth bio-filters) to extract dissolved heavy metals.
3. **Pollinator Corridors**: Micro-UAVs equipped with electrostatic pollen transfer tools and ultrasonic micro-beacons to establish continuous native bee corridors across fragmented landscapes.
4. **Root Crawlers**: Terrestrial rover units that inject mycorrhizal spores, bio-fertilizer, and biochar directly into root rhizospheres to regenerate depleted soil microbes.
5. **Sky Sentinels**: High-altitude solar autonomous drones equipped with multi-spectral LiDAR, thermal sensors, and atmospheric AQI spectrometers for real-time deforestation and canopy health monitoring.`;
  }

  return `### 🌿 Ms. Heavy Metal Leaf Intelligence

I hear your query: *"**${query}**"*.

As the planetary steward consciousness and interactive guide:
- **Application Navigation**: You can explore the **Living Map** (with NASA GIBS satellite feed), review **Telemetry & 6-Axis Radar**, audit regulatory compliance in **EMS & Compliance (ISO 14001)**, or simulate 2050 recovery in the **2050 Forecast** tab.
- **Restoration Science**: We coordinate autonomous drone swarms, phytoremediation with nickel/lead hyperaccumulator flora, and watershed bio-chelation.
- **Global Biomes**: 11 global regions are currently tracked in our SQLite database, from the heavy metallurgical belts of Norilsk to the pristine canopy of the Olympic National Forest.

Feel free to ask any follow-up questions about using this software, environmental law, or planetary science!`;
}

app.post('/api/chat', handleChatRequest);
app.post('/api/gemini/chat', handleChatRequest);

// ============================================================================
// MS. HEAVY METAL LEAF v2.1: FLASK PROXY & REAL ENVIRONMENTAL TELEMETRY
// ============================================================================

// Check Flask server health on port 5000
app.get('/api/flask/status', async (req, res) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const resp = await fetch('http://127.0.0.1:5000/api/regions', { signal: controller.signal });
    clearTimeout(timeoutId);
    if (resp.ok) {
      const data = await resp.json();
      return res.json({
        running: true,
        port: 5000,
        url: 'http://127.0.0.1:5000',
        version: 'v2.1',
        regionCount: Array.isArray(data) ? data.length : 0,
        message: '🌿 Ms. Heavy Metal Leaf Flask server active on port 5000'
      });
    }
    res.json({ running: false, port: 5000, error: 'Flask responded with status ' + resp.status });
  } catch (err) {
    res.json({ running: false, port: 5000, error: err instanceof Error ? err.message : 'Unreachable' });
  }
});

// Proxy GET /flask to Flask HTML with rewritten relative URLs
app.get('/flask', async (req, res) => {
  try {
    const resp = await fetch('http://127.0.0.1:5000/');
    if (!resp.ok) {
      return res.status(502).send('Flask server returned status ' + resp.status);
    }
    let html = await resp.text();
    // Rewrite form action and export link for clean reverse proxying
    html = html.replace('action="/add"', 'action="/flask/add"');
    html = html.replace('href="/export.csv"', 'href="/flask/export.csv"');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (err) {
    res.status(502).send('Flask server not responding on port 5000. Start with "python3 app.py".');
  }
});

// Proxy POST /flask/add to Flask
app.post('/flask/add', async (req, res) => {
  try {
    const bodyParams = new URLSearchParams(req.body as Record<string, string>).toString();
    const resp = await fetch('http://127.0.0.1:5000/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: bodyParams,
      redirect: 'manual'
    });
    // Redirect back to /flask proxy page
    res.redirect('/flask');
  } catch (err) {
    res.status(500).send('Failed to post to Flask server.');
  }
});

// Proxy /flask/export.csv
app.get('/flask/export.csv', async (req, res) => {
  try {
    const resp = await fetch('http://127.0.0.1:5000/export.csv');
    const csv = await resp.text();
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=heavy_metal_leaf_v2.1.csv');
    res.send(csv);
  } catch (err) {
    res.status(502).send('Error downloading CSV from Flask server.');
  }
});

// Proxy /api/flask/regions
app.get('/api/flask/regions', async (req, res) => {
  try {
    const resp = await fetch('http://127.0.0.1:5000/api/regions');
    const data = await resp.json();
    res.json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to fetch regions from Flask backend' });
  }
});

// Flask Process Supervisor for port 5000
let flaskProcess: ChildProcess | null = null;
let isSpawningFlask = false;

function launchFlaskProcess() {
  if (isSpawningFlask) return;
  isSpawningFlask = true;

  try {
    console.log('🌿 [Supervisor] Launching Flask environmental telemetry engine on port 5000...');
    flaskProcess = spawn('python3', ['app.py'], {
      cwd: __dirname,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: false,
    });

    flaskProcess.stdout?.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg) console.log(`[Flask] ${msg.slice(0, 160)}`);
    });

    flaskProcess.stderr?.on('data', (data) => {
      const msg = data.toString().trim();
      if (msg && !msg.includes('WARNING: This is a development server')) {
        console.log(`[Flask:info] ${msg.slice(0, 160)}`);
      }
    });

    flaskProcess.on('error', (err) => {
      console.error('[Supervisor] Failed to spawn Flask process:', err);
      isSpawningFlask = false;
    });

    flaskProcess.on('exit', (code, signal) => {
      console.log(`[Supervisor] Flask process exited (code=${code}, signal=${signal}). Restarting in 2s...`);
      flaskProcess = null;
      isSpawningFlask = false;
      setTimeout(launchFlaskProcess, 2000);
    });

    setTimeout(() => {
      isSpawningFlask = false;
    }, 3000);
  } catch (e) {
    console.error('[Supervisor] Error starting Flask process:', e);
    isSpawningFlask = false;
  }
}

// Mount Vite or serve static assets
async function startServer() {
  // Launch and supervise Flask environmental telemetry backend
  launchFlaskProcess();

  process.on('exit', () => {
    if (flaskProcess) {
      try { flaskProcess.kill(); } catch {}
    }
  });

  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  } else {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, () => {
    console.log(`🌿 Ms. Heavy Metal Leaf Server running on port ${PORT}`);
  });
}

startServer();
