import React from 'react';
import { Search, Sparkles, Filter, LayoutGrid, GitMerge, Check, SlidersHorizontal } from 'lucide-react';
import { CertLevel } from '../types';

interface LiquidGlassControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedLevel: 'All' | CertLevel;
  onLevelChange: (level: 'All' | CertLevel) => void;
  autoExplain: boolean;
  onAutoExplainToggle: (enabled: boolean) => void;
  viewMode: 'tree' | 'grid';
  onViewModeChange: (mode: 'tree' | 'grid') => void;
}

export const LiquidGlassControls: React.FC<LiquidGlassControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedLevel,
  onLevelChange,
  autoExplain,
  onAutoExplainToggle,
  viewMode,
  onViewModeChange,
}) => {
  const levels: Array<'All' | CertLevel> = ['All', 'Fundamentals', 'Associate', 'Expert'];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div className="liquid-glass-card p-3 sm:p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        
        {/* Left: Search pill component directly styled like the reference image text field */}
        <div className="flex-1 max-w-md">
          <div className="liquid-glass-pill px-3 py-1.5 flex items-center gap-2 border border-white/20 shadow-inner">
            <Search className="w-4 h-4 text-cyan-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search cert (e.g. AZ-900, AI, Security)..."
              className="bg-transparent text-sm text-slate-100 placeholder-slate-400 focus:outline-none w-full font-normal"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange('')}
                className="text-xs text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-white/10"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Center: Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {levels.map((lvl) => {
            const isSelected = selectedLevel === lvl;
            return (
              <button
                key={lvl}
                onClick={() => onLevelChange(lvl)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'liquid-glass-pill text-white liquid-glow-cyan border-cyan-400/60 bg-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 text-cyan-400" />}
                {lvl}
              </button>
            );
          })}
        </div>

        {/* Right: Liquid Glass Switch & Layout Switcher */}
        <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-white/10">
          
          {/* Liquid Glass Switch (Inspired by Switch in Reference Image) */}
          <div 
            onClick={() => onAutoExplainToggle(!autoExplain)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            title="Automatically generate Gemini AI technical rationale when a milestone is completed"
          >
            <span className="text-xs font-medium text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span className="hidden sm:inline">AI Auto-Explain</span>
            </span>
            
            {/* Pill Switch Track */}
            <div 
              className={`w-12 h-6 rounded-full p-0.5 transition-colors duration-300 liquid-glass-pill border ${
                autoExplain 
                  ? 'border-purple-400/60 bg-gradient-to-r from-purple-900/80 to-indigo-900/80 liquid-glow-purple' 
                  : 'border-white/15 bg-slate-900/90'
              }`}
            >
              {/* Pill Slider Knob */}
              <div 
                className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform duration-300 ${
                  autoExplain ? 'translate-x-6 bg-purple-100 shadow-purple-500/50' : 'translate-x-0 bg-slate-400'
                }`}
              />
            </div>
          </div>

          {/* View Mode Toggle Pill */}
          <div className="liquid-glass-pill p-1 flex items-center gap-1 border border-white/10">
            <button
              onClick={() => onViewModeChange('tree')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'tree'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Sequential Prerequisite Tree View"
            >
              <GitMerge className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Roadmap Flow</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`px-2.5 py-1 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-cyan-500/30 text-cyan-300 border border-cyan-400/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Grid Cards View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Catalog</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
