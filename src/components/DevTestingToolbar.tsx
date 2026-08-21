import React, { useState } from 'react';
import { Terminal, Wifi, WifiOff, RefreshCw, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

interface DevTestingToolbarProps {
  onFastTrackAll: () => void;
  onResetTrack: () => void;
  onRefresh: () => void;
  isSimulatedOffline: boolean;
  onToggleSimulatedOffline: (offline: boolean) => void;
}

export const DevTestingToolbar: React.FC<DevTestingToolbarProps> = ({
  onFastTrackAll,
  onResetTrack,
  onRefresh,
  isSimulatedOffline,
  onToggleSimulatedOffline,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="liquid-glass-card p-3 border-slate-700/50 bg-slate-950/60 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        <div className="flex items-center gap-2">
          <div className="liquid-glass-pill p-1.5 bg-slate-900 border-white/10 text-cyan-400">
            <Terminal className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="font-bold text-slate-200">Recruiter & Testing Tools</span>
            <span className="text-slate-400 hidden sm:inline"> — verify Phase 4 persistence and AI fallback logic</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          
          {/* Simulated Offline Toggle for Gemini Fallback Testing */}
          <button
            onClick={() => onToggleSimulatedOffline(!isSimulatedOffline)}
            className={`liquid-glass-pill px-3 py-1 font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              isSimulatedOffline
                ? 'border-amber-500/60 bg-amber-950/60 text-amber-300 liquid-glow-amber'
                : 'border-white/15 text-slate-300 hover:text-white'
            }`}
            title="Simulate offline network condition to test Gemini fallback rationale"
          >
            {isSimulatedOffline ? (
              <>
                <WifiOff className="w-3.5 h-3.5 text-amber-400" />
                <span>Simulated Offline Mode (Fallback active)</span>
              </>
            ) : (
              <>
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live Gemini Mode</span>
              </>
            )}
          </button>

          {/* Complete Foundations Fast-Track */}
          <button
            onClick={onFastTrackAll}
            className="liquid-glass-pill px-3 py-1 font-medium text-cyan-300 hover:text-cyan-200 border-cyan-500/30 hover:bg-cyan-500/10 transition-colors cursor-pointer"
            title="Complete all fundamental prerequisites in this path"
          >
            <span>Fast-Track Foundations</span>
          </button>

          {/* Sync / Refresh */}
          <button
            onClick={onRefresh}
            className="liquid-glass-pill px-2.5 py-1 text-slate-400 hover:text-white border-white/10 hover:border-white/20 transition-colors cursor-pointer"
            title="Re-fetch and verify database state"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

        </div>

      </div>
    </div>
  );
};
