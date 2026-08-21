import React from 'react';
import { GitMerge, ArrowDown, Sparkles, CheckCircle2, Lock, ShieldCheck } from 'lucide-react';
import { CertWithProgress } from '../types';
import { CertificationNodeCard } from './CertificationNodeCard';

interface PathVisualizerProps {
  certifications: CertWithProgress[];
  onToggleComplete: (certId: string, completed: boolean) => void;
  onExplain: (cert: CertWithProgress) => void;
  explainingCertId?: string | null;
}

export const PathVisualizer: React.FC<PathVisualizerProps> = ({
  certifications,
  onToggleComplete,
  onExplain,
  explainingCertId,
}) => {
  // Group certifications by Level hierarchy: Fundamentals -> Associate -> Expert / Specialty
  const fundamentals = certifications.filter(c => c.level === 'Fundamentals');
  const associates = certifications.filter(c => c.level === 'Associate');
  const experts = certifications.filter(c => c.level === 'Expert' || c.level === 'Specialty');

  const renderTier = (
    title: string,
    badgeText: string,
    tierCerts: CertWithProgress[],
    accentBorder: string,
    accentGlow: string
  ) => {
    if (tierCerts.length === 0) return null;

    return (
      <div className="relative space-y-4">
        {/* Tier Header Badge */}
        <div className="flex items-center gap-3">
          <div className={`liquid-glass-pill px-4 py-1.5 text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${accentBorder} ${accentGlow}`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>{title}</span>
            <span className="opacity-60 text-[11px]">({badgeText})</span>
          </div>
          <div className="flex-1 h-[1px] bg-gradient-to-r from-white/15 via-white/5 to-transparent" />
        </div>

        {/* Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tierCerts.map((cert) => (
            <CertificationNodeCard
              key={cert.id}
              cert={cert}
              allCerts={certifications}
              onToggleComplete={onToggleComplete}
              onExplain={onExplain}
              isExplaining={explainingCertId === cert.id}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
      
      {/* Tier 1: Fundamentals */}
      {renderTier(
        'Foundation Tier',
        'Starting Point • No Prerequisites',
        fundamentals,
        'border-cyan-400/50 text-cyan-300',
        'liquid-glow-cyan'
      )}

      {/* Connection Flow Divider */}
      {fundamentals.length > 0 && associates.length > 0 && (
        <div className="flex justify-center my-2">
          <div className="liquid-glass-pill px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-slate-300 border-white/20 bg-slate-900/90 shadow-lg">
            <ArrowDown className="w-4 h-4 text-cyan-400 animate-bounce" />
            <span>Unlocks Role-Based Associates</span>
          </div>
        </div>
      )}

      {/* Tier 2: Associate Tier */}
      {renderTier(
        'Role-Based Associate Tier',
        'Core Engineering & Implementation',
        associates,
        'border-blue-400/50 text-blue-300',
        'liquid-glow-cyan'
      )}

      {/* Connection Flow Divider to Expert */}
      {associates.length > 0 && experts.length > 0 && (
        <div className="flex justify-center my-2">
          <div className="liquid-glass-pill px-4 py-1.5 flex items-center gap-2 text-xs font-semibold text-purple-300 border-purple-400/40 bg-slate-900/90 shadow-lg liquid-glow-purple">
            <ArrowDown className="w-4 h-4 text-purple-400 animate-bounce" />
            <span>Prerequisites for Senior Solution Architect & Expert Certifications</span>
          </div>
        </div>
      )}

      {/* Tier 3: Expert & Advanced Tier */}
      {renderTier(
        'Expert Solutions Architecture Tier',
        'Mastery & Multi-Domain Strategy',
        experts,
        'border-purple-400/50 text-purple-300',
        'liquid-glow-purple'
      )}

    </div>
  );
};
