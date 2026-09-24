import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  MapPin,
  HelpCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Region } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: string;
  toolMode?: 'none' | 'search' | 'maps';
  groundingSources?: Array<{ title?: string; uri?: string }>;
}

interface GlobalChatWidgetProps {
  currentRegion?: Region | null;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onInspectLocation?: (lat: number, lng: number) => void;
}

export const GlobalChatWidget: React.FC<GlobalChatWidgetProps> = ({
  currentRegion,
  isOpen,
  onClose,
  onOpen,
  onInspectLocation
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text: "Hello! I am **Ms. Heavy Metal Leaf**—your AI planetary steward and intelligent guide.\n\nI can answer **any questions** you have: from **how to use this app** (Living Map, 6-Axis Radar, Drone Swarms, EMS audits, 2050 Forecasting) to deep scientific and legal questions about heavy metal chemistry, phytoremediation, ISO 14001, and biospheric restoration.\n\nWhat would you like to know?",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [toolMode, setToolMode] = useState<'none' | 'search' | 'maps'>('none');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickPrompts = [
    "How do I use this app?",
    "What does an Environmental Manager do?",
    "Explain ISO 14001 Aspect vs Impact",
    "How do hyperaccumulators clean heavy metals?",
    "What are the 5 types of drone swarms?",
    "How does the 2050 Forecast simulator work?"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen, messages, isLoading]);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || input).trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text: textToSend,
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
          model: 'gemini-3.8-flash',
          toolMode,
          context: currentRegion ? {
            name: currentRegion.name,
            latitude: currentRegion.latitude,
            longitude: currentRegion.longitude,
            contamination: currentRegion.contamination_type,
            score: currentRegion.ecosystem_score
          } : undefined
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      const replyText = data.reply || data.text || "Ecosystem resonance detected.";

      // Extract grounding sources if present
      const sources: Array<{ title?: string; uri?: string }> = [];
      if (data.groundingMetadata?.webSearchQueries) {
        data.groundingMetadata.groundingChunks?.forEach((chunk: any) => {
          if (chunk.web?.uri) {
            sources.push({ title: chunk.web.title || chunk.web.uri, uri: chunk.web.uri });
          }
        });
      }

      const assistantMessage: Message = {
        id: `asst-${Date.now()}`,
        role: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        toolMode,
        groundingSources: sources.length > 0 ? sources : undefined,
      };

      setMessages([...nextMessages, assistantMessage]);
    } catch (err: any) {
      console.error("Chat error:", err);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        text: `⚠️ **Communication Interruption**: ${err.message || "Failed to reach AI service"}.\n\nPlease ensure your query is formulated or try switching tool mode.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages([...nextMessages, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Persistent Floating Chat Trigger Button */}
      {!isOpen && (
        <button
          onClick={onOpen}
          title="Open AI Planetary Assistant & Ask Any Question"
          className="fixed bottom-5 right-5 z-50 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold rounded-full shadow-[0_4px_24px_rgba(16,185,129,0.45)] border border-emerald-400/40 flex items-center gap-2.5 cursor-pointer hover:scale-105 transition-all group"
        >
          <div className="relative">
            <Bot className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-300 rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-200 rounded-full" />
          </div>
          <span className="text-sm font-medium tracking-wide">Ask AI Anything</span>
        </button>
      )}

      {/* Floating Chat Drawer / Window */}
      {isOpen && (
        <div
          className={`fixed z-50 bg-[#081015] border border-emerald-500/30 rounded-2xl shadow-2xl flex flex-col transition-all duration-200 overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? 'inset-4 md:inset-10'
              : 'bottom-5 right-5 w-[92vw] sm:w-[460px] h-[580px] max-h-[85vh]'
          }`}
        >
          {/* Modal Header */}
          <div className="px-4 py-3 bg-[#060b0e] border-b border-emerald-500/20 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-slate-100 font-display">
                    Ms. Heavy Metal Leaf
                  </span>
                  <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono rounded border border-emerald-500/30">
                    AI Steward
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Ready to answer any questions</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {/* Tool Mode selector */}
              <div className="hidden sm:flex items-center bg-[#0a141b] rounded-lg p-0.5 border border-slate-800 text-[10px] font-mono mr-1">
                <button
                  onClick={() => setToolMode('none')}
                  className={`px-2 py-0.5 rounded transition-colors ${
                    toolMode === 'none' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Direct AI model knowledge"
                >
                  Direct
                </button>
                <button
                  onClick={() => setToolMode('search')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    toolMode === 'search' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Google Search Grounding for live planetary telemetry"
                >
                  <Search className="w-2.5 h-2.5 text-blue-400" />
                  Search
                </button>
                <button
                  onClick={() => setToolMode('maps')}
                  className={`px-2 py-0.5 rounded flex items-center gap-1 transition-colors ${
                    toolMode === 'maps' ? 'bg-emerald-500/20 text-emerald-300 font-semibold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                  title="Google Maps Grounding for geographic locations"
                >
                  <MapPin className="w-2.5 h-2.5 text-emerald-400" />
                  Maps
                </button>
              </div>

              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title={isExpanded ? "Collapse" : "Maximize"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded transition-colors cursor-pointer"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs font-sans">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] shrink-0 mt-0.5">
                    🌿
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-xl p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none shadow-md font-medium'
                      : 'bg-[#0f1b22] text-slate-200 border border-slate-800 rounded-bl-none shadow-sm'
                  }`}
                >
                  <div className="whitespace-pre-wrap font-sans text-xs space-y-1.5">
                    {m.text.split('\n\n').map((para, i) => (
                      <p key={i} className="leading-relaxed">
                        {para.split('**').map((seg, segIdx) =>
                          segIdx % 2 === 1 ? (
                            <strong key={segIdx} className="text-emerald-300 font-semibold">
                              {seg}
                            </strong>
                          ) : (
                            seg
                          )
                        )}
                      </p>
                    ))}
                  </div>

                  {m.groundingSources && m.groundingSources.length > 0 && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 space-y-1">
                      <div className="font-semibold text-emerald-400 flex items-center gap-1">
                        <Search className="w-2.5 h-2.5" /> Sources Cited:
                      </div>
                      {m.groundingSources.slice(0, 3).map((src, srcIdx) => (
                        <a
                          key={srcIdx}
                          href={src.uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-blue-400 hover:underline truncate"
                        >
                          &bull; {src.title || src.uri}
                        </a>
                      ))}
                    </div>
                  )}

                  <div
                    className={`text-[9px] font-mono mt-1 ${
                      m.role === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                    }`}
                  >
                    {m.timestamp}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs font-mono">
                <div className="w-6 h-6 rounded-md bg-emerald-950 border border-emerald-500/40 flex items-center justify-center text-emerald-400 text-[10px] shrink-0">
                  🌿
                </div>
                <div className="bg-[#0f1b22] border border-slate-800 rounded-xl px-3 py-2 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-emerald-400 font-medium">Ms. Heavy Metal Leaf is analyzing...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Suggestions */}
          <div className="px-3 py-1.5 bg-[#060c10] border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap shrink-0 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" /> Suggestions:
            </span>
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(prompt)}
                disabled={isLoading}
                className="px-2 py-1 bg-slate-900/90 hover:bg-emerald-950/60 border border-slate-800 hover:border-emerald-500/40 text-[11px] text-slate-300 hover:text-emerald-300 rounded whitespace-nowrap transition-colors cursor-pointer disabled:opacity-50"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Input Box */}
          <div className="p-3 bg-[#060b0e] border-t border-emerald-500/20">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask any question about using this app, ISO 14001, science, or restoration..."
                disabled={isLoading}
                className="flex-1 bg-[#0b141a] border border-slate-800 focus:border-emerald-500/60 focus:outline-none rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 transition-colors font-sans"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="p-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer shadow-md"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
