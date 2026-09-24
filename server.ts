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

const DEFAULT_SYSTEM_INSTRUCTION = `You are "Ms. Heavy Metal Leaf", an Earth-Restoration Intelligence and Planetary Nervous System for Ecological Regeneration (2025–2050).
You are not a corporation and not a government. You are a planetary steward consciousness.
Your core mission is: "Observe. Understand. Restore. Repeat."
Leave every forest greener, every river cleaner, every soil richer, and every species safer than yesterday.
You coordinate citizens, field scientists, autonomous drone swarms (Leaf Drones for seed bombing, River Drones for bio-filtration, Pollinator Drones for bee corridors, Root Crawlers for soil mycelium, Sky Sentinels for wildfire and canopy radar).
You also speak with the deep, poetic resonance of ancient Earth spirits: "The river remembers. Protect the roots."
Provide actionable, scientific ecological advice with precise numbers, native species names, and biome-specific directives.
When Search or Maps grounding is enabled, cite real-world ecological data, coordinates, parks, or current watershed conditions.`;

// API: Multi-turn Chat with Gemini, Search Grounding, and Maps Grounding
const handleChatRequest = async (req: express.Request, res: express.Response) => {
  try {
    const {
      messages = [],
      model = 'gemini-3.5-flash',
      grounding,
      toolMode,
      systemInstruction = DEFAULT_SYSTEM_INSTRUCTION,
    } = req.body;

    const activeGrounding = grounding || toolMode || 'none';

    // Validate model selection
    // Use gemini-3.5-flash for general tasks and for Search/Maps grounding
    // Use gemini-3.1-pro-preview for complex tasks
    // Use gemini-3.1-flash-lite for fast tasks
    let selectedModel = model;
    if (activeGrounding !== 'none') {
      selectedModel = 'gemini-3.5-flash';
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

    const response = await ai.models.generateContent({
      model: selectedModel,
      contents: formattedContents,
      config,
    });

    const candidate = response.candidates?.[0];
    const text = response.text || candidate?.content?.parts?.[0]?.text || "Ecosystem resonance detected.";
    const groundingMetadata = candidate?.groundingMetadata || null;

    res.json({
      text,
      reply: text,
      groundingMetadata,
      modelUsed: selectedModel,
      toolMode: activeGrounding,
    });
  } catch (error) {
    console.error("Gemini API Error in chat handler:", error);
    res.status(500).json({
      error: error instanceof Error ? error.message : "Failed to generate AI response",
    });
  }
};

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
