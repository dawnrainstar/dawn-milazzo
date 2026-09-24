import React, { useState } from 'react';
import { Volume2, VolumeX, Plus, Zap, Bot, LogIn, LogOut, CheckCircle2, ClipboardCheck, TrendingUp } from 'lucide-react';
import { planetaryAudio } from '../services/ambientAudio';
import { useAuth } from '../context/AuthContext';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  activeTab: 'map' | 'database' | 'drones' | 'management' | 'forecast' | 'python' | 'chat';
  setActiveTab: (tab: 'map' | 'database' | 'drones' | 'management' | 'forecast' | 'python' | 'chat') => void;
  onOpenAddRegion: () => void;
  onOpenDispatchSwarm: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenAddRegion,
  onOpenDispatchSwarm
}) => {
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const { currentUser, profile, signIn, signOut } = useAuth();
  const [isSigningIn, setIsSigningIn] = useState(false);

  const toggleAudio = () => {
    const playing = planetaryAudio.toggle();
    setIsAudioPlaying(playing);
  };

  const handleAuthAction = async () => {
    if (currentUser) {
      await signOut();
    } else {
      setIsSigningIn(true);
      try {
        await signIn();
      } catch (err) {
        console.error("Sign-in failed:", err);
      } finally {
        setIsSigningIn(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-3 bg-[#070b0e]/95 backdrop-blur-md border-b border-emerald-500/20">
      {/* Zone 1: Single Brand Wordmark in display face */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base shadow-[0_0_12px_rgba(16,185,129,0.25)]">
          🌿
        </div>
        <button
          onClick={() => setActiveTab('map')}
          className="text-left group cursor-pointer focus-visible:outline-none"
        >
          <span className="text-base sm:text-lg font-bold font-display tracking-wide text-slate-100 group-hover:text-emerald-400 transition-colors uppercase">
            Ms. Heavy Metal Leaf
          </span>
        </button>
      </div>

      {/* Zone 2: Navigation Links */}
      <nav className="hidden md:flex items-center gap-6 text-xs font-medium uppercase tracking-wider font-mono-code">
        <button
          onClick={() => setActiveTab('map')}
          className={`transition-colors relative py-1 cursor-pointer ${
            activeTab === 'map'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Living Map
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`transition-colors relative py-1 cursor-pointer ${
            activeTab === 'database'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Database
        </button>
        <button
          onClick={() => setActiveTab('drones')}
          className={`transition-colors relative py-1 cursor-pointer ${
            activeTab === 'drones'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Restoration Swarms
        </button>
        <button
          onClick={() => setActiveTab('management')}
          className={`transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'management'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <ClipboardCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>EMS & Compliance</span>
        </button>
        <button
          onClick={() => setActiveTab('forecast')}
          className={`transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'forecast'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          <span>2050 Forecast</span>
        </button>
        <button
          onClick={() => setActiveTab('python')}
          className={`transition-colors relative py-1 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'python'
              ? 'text-emerald-400 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Flask v2.1</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </button>
        <button
          onClick={() => setActiveTab('chat')}
          className={`transition-colors relative py-1 flex items-center gap-1.5 cursor-pointer ${
            activeTab === 'chat'
              ? 'text-emerald-300 font-semibold after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-emerald-400'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Bot className="w-3.5 h-3.5 text-emerald-400" />
          AI Intelligence
        </button>
      </nav>

      {/* Zone 3: Primary Actions & Firebase Auth */}
      <div className="flex items-center gap-2 sm:gap-2.5">
        {/* PWA Download / Install App */}
        <PWAInstallButton />

        {/* Audio synthesizer toggle */}
        <button
          onClick={toggleAudio}
          title={isAudioPlaying ? "Mute 432Hz Earth Resonance" : "Enable 432Hz Earth Resonance Synthesizer"}
          className={`px-2.5 py-1.5 rounded text-xs font-mono-code flex items-center gap-1.5 transition-colors border cursor-pointer ${
            isAudioPlaying
              ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
              : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          {isAudioPlaying ? <Volume2 className="w-3.5 h-3.5 text-emerald-400 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
          <span className="hidden sm:inline">432Hz</span>
        </button>

        <button
          onClick={onOpenDispatchSwarm}
          className="px-2.5 py-1.5 text-xs font-medium text-emerald-300 bg-emerald-950/50 border border-emerald-500/40 rounded hover:bg-emerald-900/60 transition-colors flex items-center gap-1.5 whitespace-nowrap"
        >
          <Zap className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Dispatch</span> Swarm
        </button>

        <button
          onClick={onOpenAddRegion}
          className="px-2.5 py-1.5 text-xs font-medium text-slate-950 bg-emerald-400 rounded hover:bg-emerald-300 transition-colors flex items-center gap-1.5 font-semibold whitespace-nowrap shadow-[0_0_12px_rgba(16,185,129,0.3)]"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Region
        </button>

        {/* Firebase Google Auth Button */}
        {currentUser ? (
          <div className="flex items-center gap-2 bg-[#0b1015] border border-slate-800 rounded-lg p-1 pl-2">
            {currentUser.photoURL ? (
              <img src={currentUser.photoURL} alt={currentUser.displayName || 'User'} className="w-6 h-6 rounded-full object-cover" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 text-xs flex items-center justify-center font-bold">
                {currentUser.displayName?.[0] || 'U'}
              </div>
            )}
            <span className="text-[11px] font-mono text-slate-300 max-w-[100px] truncate hidden lg:inline">
              {profile?.displayName || currentUser.displayName?.split(' ')[0] || 'Steward'}
            </span>
            <button
              onClick={handleAuthAction}
              title="Sign out of Firebase"
              className="p-1 text-slate-400 hover:text-rose-400 transition-colors rounded cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleAuthAction}
            disabled={isSigningIn}
            className="px-3 py-1.5 text-xs font-mono text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 rounded flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">{isSigningIn ? "Signing In..." : "Google Sign-In"}</span>
          </button>
        )}
      </div>
    </header>
  );
};
