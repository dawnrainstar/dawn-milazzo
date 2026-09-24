import React, { useState } from 'react';
import { Download, CheckCircle2, Apple, Laptop } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already installed, show status badge
  if (isInstalled) {
    return (
      <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-[11px] font-mono text-emerald-300">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
        <span>Installed App</span>
      </div>
    );
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      await install();
    } else {
      setShowGuide(true);
    }
  };

  return (
    <>
      <button
        onClick={handleInstallClick}
        title="Download and install Ms. Heavy Metal Leaf for offline field operation"
        className="px-2.5 py-1.5 text-xs font-mono font-semibold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-500/50 rounded-lg flex items-center gap-1.5 transition-all shadow-[0_0_12px_rgba(16,185,129,0.2)] cursor-pointer"
      >
        <Download className="w-3.5 h-3.5 text-emerald-400 animate-bounce" />
        <span>Download App</span>
      </button>

      {/* Installation Guide Modal (for iOS or browsers where prompt requires manual bookmark/install) */}
      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-xl bg-[#0b1015] border border-emerald-500/30 p-6 shadow-2xl text-slate-200 font-sans">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                <Download className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-display text-white uppercase tracking-wider">
                  Download & Install Ms. Heavy Metal Leaf
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  Autonomous Offline Planetary Nervous System
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed font-sans border-y border-slate-800 py-4 my-3">
              {isIOS ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <Apple className="w-4 h-4" />
                    <span>Install on iPhone / iPad (Safari):</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-400">
                    <li>Tap the <strong className="text-white">Share</strong> button (box with arrow) in Safari.</li>
                    <li>Scroll down the actions and tap <strong className="text-white">Add to Home Screen</strong>.</li>
                    <li>Launch anytime with full offline map cache and sensor logging.</li>
                  </ol>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-emerald-300 font-semibold">
                    <Laptop className="w-4 h-4" />
                    <span>Install on Chrome, Edge, or Android:</span>
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 pl-1 text-slate-400">
                    <li>Click the <strong className="text-white">Install / App Available</strong> icon in your browser address bar.</li>
                    <li>Or open browser menu (⋮) and select <strong className="text-white">Install Ms. Heavy Metal Leaf...</strong></li>
                    <li>Run in full standalone mode with offline satellite & telemetry caching!</li>
                  </ol>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] font-mono text-emerald-400">✓ PWA Service Worker Registered</span>
              <button
                onClick={() => setShowGuide(false)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-white transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
