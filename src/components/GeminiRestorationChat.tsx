import React, { useState, useRef, useEffect } from 'react';
import { Bot, Send, Search, MapPin, Sparkles, User, RefreshCw, Globe, ExternalLink, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  groundingMetadata?: {
    webSearchQueries?: string[];
    groundingChunks?: Array<{
      web?: { uri: string; title: string };
      maps?: { title?: string; address?: string; uri?: string };
    }>;
    searchEntryPoint?: { renderedContent?: string };
  } | null;
}

export const GeminiRestorationChat: React.FC = () => {
  const { currentUser, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content: `🌿 I am Ms. Heavy Metal Leaf—the planetary nervous system for regeneration.

"The river remembers. Protect the roots."

Ask me about any forest, river, watershed, or soil biome on Earth. I can dispatch restoration protocols, query up-to-date Google Search ecological intelligence, or ground locations via Google Maps.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [model, setModel] = useState<'gemini-3.5-flash' | 'gemini-3.1-pro-preview' | 'gemini-3.1-flash-lite'>('gemini-3.5-flash');
  const [grounding, setGrounding] = useState<'none' | 'search' | 'maps'>('search');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          model,
          grounding,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: ChatMessage = {
        id: `model-${Date.now()}`,
        role: 'model',
        content: data.text || "Planetary resonance received.",
        groundingMetadata: data.groundingMetadata,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages(prev => [...prev, modelMsg]);
    } catch (err) {
      console.error("Chat error:", err);
      const errMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'model',
        content: "⚠️ The planetary nervous system encountered a telemetry lag. Ensure your GEMINI_API_KEY is configured in AI Studio Secrets.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'model',
        content: `🌿 Conversation reset. Ms. Heavy Metal Leaf listening on all frequency bands. What does this place need to become healthier?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <div className="bg-[#0b1015] border border-emerald-500/20 rounded-xl shadow-2xl flex flex-col h-[750px] overflow-hidden text-slate-200">
      {/* Top Header Bar */}
      <div className="px-5 py-4 border-b border-slate-800 bg-[#070b0e] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold font-display uppercase tracking-wider text-white">
                Ms. Heavy Metal Leaf Intelligence
              </h2>
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block animate-pulse" />
            </div>
            <div className="text-[11px] font-mono text-slate-400">
              Multi-Turn Ecological AI · Gemini 3.5 & Grounding
            </div>
          </div>
        </div>

        {/* Model & Grounding Controls */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          {/* Model Selector */}
          <div className="flex items-center gap-1 bg-[#0b1015] border border-slate-800 rounded px-2 py-1">
            <span className="text-slate-500 text-[10px] uppercase">Model:</span>
            <select
              value={model}
              onChange={e => setModel(e.target.value as any)}
              className="bg-transparent text-emerald-400 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="gemini-3.5-flash" className="bg-[#0b1015] text-slate-200">gemini-3.5-flash (Balanced + Grounding)</option>
              <option value="gemini-3.1-pro-preview" className="bg-[#0b1015] text-slate-200">gemini-3.1-pro-preview (Complex Tasks)</option>
              <option value="gemini-3.1-flash-lite" className="bg-[#0b1015] text-slate-200">gemini-3.1-flash-lite (Fast Tasks)</option>
            </select>
          </div>

          {/* Grounding Selector */}
          <div className="flex items-center gap-1 bg-[#0b1015] border border-slate-800 rounded p-0.5">
            <button
              onClick={() => setGrounding('none')}
              className={`px-2 py-1 rounded transition-colors ${
                grounding === 'none' ? 'bg-slate-800 text-slate-200 font-semibold' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              Raw
            </button>
            <button
              onClick={() => setGrounding('search')}
              title="Ground responses with real-time Google Search ecological data"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                grounding === 'search' ? 'bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Search className="w-3 h-3 text-emerald-400" />
              Google Search
            </button>
            <button
              onClick={() => setGrounding('maps')}
              title="Ground responses with real-world Google Maps geographic locations"
              className={`px-2 py-1 rounded flex items-center gap-1 transition-colors ${
                grounding === 'maps' ? 'bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <MapPin className="w-3 h-3 text-cyan-400" />
              Google Maps
            </button>
          </div>

          <button
            onClick={clearChat}
            title="Clear Chat Thread"
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-[#0b1015] border border-slate-800 rounded"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grounding Status Indicator Strip */}
      <div className="px-5 py-2 bg-[#090d11] border-b border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-2">
          {grounding === 'search' && (
            <span className="flex items-center gap-1 text-emerald-400">
              <Globe className="w-3 h-3" />
              Search Grounding Active: Fetching live ecology telemetry & satellite indices
            </span>
          )}
          {grounding === 'maps' && (
            <span className="flex items-center gap-1 text-cyan-400">
              <MapPin className="w-3 h-3" />
              Maps Grounding Active: Querying real-world coordinates, parks & river watersheds
            </span>
          )}
          {grounding === 'none' && (
            <span className="text-slate-500">
              Standard Planetary Nervous System Model Direct Inference
            </span>
          )}
        </div>
        {currentUser && (
          <span className="text-emerald-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            Authenticated as {profile?.displayName || currentUser.email}
          </span>
        )}
      </div>

      {/* Scrollable Chat Thread */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4 font-sans text-sm">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
          >
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                msg.role === 'user'
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
              }`}
            >
              {msg.role === 'user' ? (
                currentUser?.photoURL ? (
                  <img src={currentUser.photoURL} alt="User" className="w-full h-full rounded-lg object-cover" />
                ) : (
                  <User className="w-4 h-4" />
                )
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`max-w-[82%] rounded-xl p-4 shadow-lg leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#121c26] border border-blue-500/30 text-slate-100'
                  : 'bg-[#0e161e] border border-emerald-500/20 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 mb-1.5 pb-1 border-b border-slate-800">
                <span className="font-semibold text-slate-300">
                  {msg.role === 'user' ? (profile?.displayName || 'User Steward') : 'Ms. Heavy Metal Leaf'}
                </span>
                <span>{msg.timestamp}</span>
              </div>

              {/* Message text with newline formatting */}
              <div className="whitespace-pre-wrap font-sans text-xs sm:text-sm">
                {msg.content}
              </div>

              {/* Grounding Citations & Sources */}
              {msg.groundingMetadata && (
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-2 text-xs font-mono">
                  {/* Web search query chips */}
                  {msg.groundingMetadata.webSearchQueries && msg.groundingMetadata.webSearchQueries.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] uppercase text-slate-500">Searched:</span>
                      {msg.groundingMetadata.webSearchQueries.map((q, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-slate-900 border border-slate-800 rounded text-[11px] text-emerald-300"
                        >
                          "{q}"
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Grounding sources / web links */}
                  {msg.groundingMetadata.groundingChunks && msg.groundingMetadata.groundingChunks.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase text-slate-500 block">Verified Real-World Sources:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.groundingMetadata.groundingChunks.map((chunk, idx) => {
                          if (chunk.web) {
                            return (
                              <a
                                key={idx}
                                href={chunk.web.uri}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#090d11] hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded text-[11px] text-slate-300 hover:text-emerald-300 transition-colors"
                              >
                                <ExternalLink className="w-3 h-3 text-emerald-400" />
                                <span className="max-w-[200px] truncate">{chunk.web.title || chunk.web.uri}</span>
                              </a>
                            );
                          }
                          if (chunk.maps) {
                            return (
                              <a
                                key={idx}
                                href={chunk.maps.uri || `https://maps.google.com/?q=${encodeURIComponent(chunk.maps.title || '')}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-1 bg-[#090d11] hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded text-[11px] text-slate-300 hover:text-cyan-300 transition-colors"
                              >
                                <MapPin className="w-3 h-3 text-cyan-400" />
                                <span className="max-w-[200px] truncate">{chunk.maps.title || chunk.maps.address}</span>
                              </a>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="bg-[#0e161e] border border-emerald-500/20 rounded-xl p-3.5 text-xs font-mono text-emerald-400/90 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span>Querying planetary nervous system telemetry & grounding sources...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="px-5 py-2 bg-[#090d11] border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px] font-mono text-slate-400">
        <span className="shrink-0 text-slate-500 uppercase">Suggested Prompts:</span>
        <button
          onClick={() => handleSend("What does the Olympic Peninsula need to restore native salmon runs?")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-emerald-300 shrink-0 transition-colors"
        >
          Salmon Runs in Olympic Peninsula
        </button>
        <button
          onClick={() => handleSend("Where are the highest-priority soil re-carbonization and mycorrhizal recovery zones in North America?")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-emerald-300 shrink-0 transition-colors"
        >
          Soil Carbon & Mycorrhizae
        </button>
        <button
          onClick={() => handleSend("Plan an autonomous drone swarm deployment for river bio-filtration in the Amazon Tapajós basin.")}
          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 rounded border border-slate-800 text-slate-300 hover:text-emerald-300 shrink-0 transition-colors"
        >
          Amazon Drone Swarm Plan
        </button>
      </div>

      {/* Input Form */}
      <div className="p-4 bg-[#070b0e] border-t border-slate-800">
        <div className="relative flex items-center">
          <textarea
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask Ms. Heavy Metal Leaf about any forest, river, soil patch, or restoration mission... (Press Enter to send)"
            className="w-full bg-[#0b1015] border border-slate-800 rounded-lg pl-3 pr-14 py-2.5 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500/50 resize-none font-sans"
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isLoading}
            className="absolute right-2.5 p-2 rounded-md bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
