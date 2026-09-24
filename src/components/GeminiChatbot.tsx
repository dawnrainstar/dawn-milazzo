import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Sparkles, Search, MapPin, Zap, RefreshCw, ChevronDown, ExternalLink } from 'lucide-react';
import { Region } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  toolMode?: 'none' | 'search' | 'maps';
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

interface GeminiChatbotProps {
  currentRegion?: Region | null;
  onInspectLocation?: (lat: number, lng: number) => void;
}

export const GeminiChatbot: React.FC<GeminiChatbotProps> = ({ currentRegion, onInspectLocation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: "I am Ms. Heavy Metal Leaf—the planetary nervous system for regeneration (2025–2050). The rivers remember, the soil breathes, and every canopy speaks. How may we restore the Earth together today?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'gemini-3.8-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.8-flash');
  const [toolMode, setToolMode] = useState<'none' | 'search' | 'maps'>('maps');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || input).trim();
    if (!query || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: nextMessages.map(m => ({ role: m.role, text: m.text })),
          model,
          toolMode,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();

      // Extract search or maps grounding sources
      const sources: Array<{ title?: string; uri?: string }> = [];
      if (data.groundingMetadata?.groundingChunks) {
        data.groundingMetadata.groundingChunks.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({ title: chunk.web.title || 'Web Source', uri: chunk.web.uri });
          }
          if (chunk.maps?.placeName) {
            sources.push({ title: chunk.maps.placeName, uri: chunk.maps.mapsUrl });
          }
        });
      }

      const botMessage: Message = {
        id: `bot-${Date.now()}`,
        role: 'assistant',
        text: data.reply || "The forest network echoes softly. No direct signal received.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: data.modelUsed,
        toolMode: data.toolMode,
        groundingSources: sources.length > 0 ? sources : undefined,
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ Telemetry link interrupted: ${err.message || 'Check connection to Gemini server.'}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="bg-[#0b1015] border border-emerald-500/20 rounded-xl flex flex-col h-[650px] shadow-2xl text-slate-200 overflow-hidden">
      {/* Top Header & Model / Grounding Controls */}
      <div className="p-4 border-b border-slate-800 bg-[#070b0e] flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-white text-sm">
                Ms. Heavy Metal Leaf · AI Planetary Intelligence
              </h3>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Multi-Turn Autonomous Dialogue · Live Earth Memory
            </div>
          </div>
        </div>

        {/* Model & Tool Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Model selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
            <span className="text-slate-500 px-1">Model:</span>
            <select
              value={model}
              onChange={e => setModel(e.target.value as any)}
              className="bg-transparent text-emerald-300 font-semibold focus:outline-none cursor-pointer pr-2"
            >
              <option value="gemini-3.5-flash" className="bg-slate-900 text-slate-200">
                gemini-3.5-flash (General Stewardship)
              </option>
              <option value="gemini-3.1-pro-preview" className="bg-slate-900 text-slate-200">
                gemini-3.1-pro-preview (Complex Bio-Reasoning)
              </option>
              <option value="gemini-3.1-flash-lite" className="bg-slate-900 text-slate-200">
                gemini-3.1-flash-lite (Fast Swarm Sync)
              </option>
            </select>
          </div>

          {/* Grounding tool selector */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-lg p-1 text-[11px] font-mono">
            <button
              onClick={() => setToolMode('maps')}
              title="Google Maps Grounding for coordinates and places"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                toolMode === 'maps'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              Google Maps
            </button>
            <button
              onClick={() => setToolMode('search')}
              title="Google Search Grounding for live ecological telemetry"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                toolMode === 'search'
                  ? 'bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              Google Search
            </button>
            <button
              onClick={() => setToolMode('none')}
              className={`px-2 py-1 rounded transition-colors ${
                toolMode === 'none'
                  ? 'bg-slate-800 text-slate-200 font-bold'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Pure Voice
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable Messages Thread */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-2 mb-1 text-[10px] font-mono text-slate-500">
              <span>{msg.role === 'user' ? 'Planetary Steward' : 'Ms. Heavy Metal Leaf'}</span>
              <span>·</span>
              <span>{msg.timestamp}</span>
              {msg.modelUsed && (
                <>
                  <span>·</span>
                  <span className="text-emerald-400">{msg.modelUsed}</span>
                </>
              )}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-emerald-600/20 text-emerald-100 border border-emerald-500/30 rounded-tr-none'
                  : 'bg-[#0e151c] text-slate-200 border border-slate-800 rounded-tl-none font-sans'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Grounding Citations */}
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] font-mono uppercase text-emerald-400 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Grounding Sources:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundingSources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.uri}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-[10px] font-mono text-cyan-300 border border-slate-700/80 transition-colors"
                      >
                        <span>{src.title || 'Source'}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-[#0e151c] border border-slate-800 rounded-xl px-4 py-3 rounded-tl-none text-xs text-emerald-400 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>Querying planetary nervous system with {toolMode === 'maps' ? 'Google Maps Grounding' : toolMode === 'search' ? 'Google Search Grounding' : model}...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Quick Inquiries */}
      <div className="px-4 py-2 bg-[#070b0e] border-t border-slate-900 flex items-center gap-2 overflow-x-auto text-[11px] font-mono shrink-0">
        <span className="text-slate-500 uppercase text-[10px] shrink-0">Inquire:</span>
        <button
          onClick={() => handleSendMessage("What does the Olympic Peninsula need to restore wild salmon runs?")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 shrink-0 transition-colors"
        >
          Olympic Salmon Restoration
        </button>
        <button
          onClick={() => handleSendMessage("Search Google Maps for the Tapajós River basin in Brazil and provide current watershed coordinates.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 shrink-0 transition-colors"
        >
          Tapajós Coordinates (Maps)
        </button>
        <button
          onClick={() => handleSendMessage("Generate an autonomous Leaf Drone seed bombing schedule for Caledonian Forest.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 shrink-0 transition-colors"
        >
          Leaf Drone Fleet Schedule
        </button>
      </div>

      {/* Input Field */}
      <div className="p-3 bg-[#070b0e] border-t border-slate-800 flex items-center gap-2 shrink-0">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            toolMode === 'maps'
              ? "Ask about any location, river, or forest with Google Maps Grounding..."
              : toolMode === 'search'
              ? "Search real-time environmental news & NASA telemetry with Google Search Grounding..."
              : "Commune with Ms. Heavy Metal Leaf..."
          }
          className="flex-1 bg-[#0b1015] border border-slate-800 rounded-lg px-3.5 py-2.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 font-mono"
        />
        <button
          onClick={() => handleSendMessage()}
          disabled={isLoading || !input.trim()}
          className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-40 text-slate-950 font-bold rounded-lg transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
