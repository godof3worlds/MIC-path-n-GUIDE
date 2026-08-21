import React from 'react';
import { Cloud, BrainCircuit, ShieldCheck, Zap, ArrowRight, CheckCircle } from 'lucide-react';
import { DomainInfo } from '../types';

interface DomainPickerProps {
  domains: DomainInfo[];
  selectedDomainId: string;
  onSelectDomain: (domainId: string) => void;
  domainProgressMap: Record<string, { completed: number; total: number }>;
}

export const DomainPicker: React.FC<DomainPickerProps> = ({
  domains,
  selectedDomainId,
  onSelectDomain,
  domainProgressMap,
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Cloud':
        return <Cloud className="w-5 h-5" />;
      case 'BrainCircuit':
        return <BrainCircuit className="w-5 h-5" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5" />;
      case 'Zap':
      default:
        return <Zap className="w-5 h-5" />;
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {domains.map((domain) => {
          const isSelected = domain.id === selectedDomainId;
          const progress = domainProgressMap[domain.id] || { completed: 0, total: domain.totalCerts };
          const isAllCompleted = progress.completed > 0 && progress.completed === progress.total;

          return (
            <button
              key={domain.id}
              onClick={() => onSelectDomain(domain.id)}
              className={`text-left p-4 rounded-2xl relative overflow-hidden transition-all duration-300 cursor-pointer group ${
                isSelected
                  ? 'liquid-glass-card liquid-glow-cyan border-cyan-400/50 scale-[1.02] bg-slate-900/90'
                  : 'liquid-glass-card hover:border-slate-400/30 hover:bg-slate-800/40 opacity-85 hover:opacity-100'
              }`}
            >
              {/* Active top highlight bar */}
              {isSelected && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500" />
              )}

              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                    isSelected
                      ? 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-md shadow-cyan-500/30'
                      : 'bg-white/5 border border-white/10 text-slate-300'
                  }`}
                >
                  {getIcon(domain.icon)}
                </div>

                <div className="flex items-center gap-1.5">
                  {isAllCompleted ? (
                    <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                      <CheckCircle className="w-3 h-3" /> Mastered
                    </span>
                  ) : (
                    <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                      {progress.completed}/{progress.total} Certs
                    </span>
                  )}
                </div>
              </div>

              <h3 className="font-bold text-base text-white tracking-tight mb-1 group-hover:text-cyan-200 transition-colors">
                {domain.name}
              </h3>
              
              <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                {domain.tagline}
              </p>

              {/* Progress mini indicator */}
              <div className="w-full bg-slate-800/80 rounded-full h-1.5 overflow-hidden border border-white/5">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    isSelected ? 'bg-gradient-to-r from-cyan-400 to-blue-500' : 'bg-slate-500'
                  }`}
                  style={{
                    width: `${Math.max(4, Math.round((progress.completed / Math.max(1, progress.total)) * 100))}%`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
