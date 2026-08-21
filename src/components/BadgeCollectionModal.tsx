import React, { useState, useMemo } from 'react';
import { 
  X, 
  Award, 
  Trophy, 
  Sparkles, 
  Lock, 
  Check, 
  Compass, 
  Layers, 
  Cloud, 
  Crown, 
  GitMerge, 
  ShieldCheck, 
  Database, 
  Globe, 
  Flame, 
  Cpu
} from 'lucide-react';
import { BADGES_CATALOG, Badge, BadgeTier } from '../data/badgesData';
import { Certification } from '../types';
import { UserProfile } from '../hooks/useAuth';
import { BadgeCollection } from './BadgeCollection';

interface BadgeCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completedCertifications: Certification[];
  profile: UserProfile;
  onOpenCertificateGenerator?: () => void;
}

export const BadgeCollectionModal: React.FC<BadgeCollectionModalProps> = ({
  isOpen,
  onClose,
  completedCertifications,
  profile,
  onOpenCertificateGenerator,
}) => {
  const [selectedBadge, setSelectedBadge] = useState<Badge | null>(null);

  const totalHours = useMemo(() => {
    return completedCertifications.reduce((sum, c) => sum + c.estimated_hours, 0);
  }, [completedCertifications]);

  const domainsCovered = useMemo(() => {
    return Array.from(new Set(completedCertifications.map(c => c.domain)));
  }, [completedCertifications]);

  // Evaluate all badges
  const evaluatedBadges = useMemo(() => {
    return BADGES_CATALOG.map((badge) => {
      const evaluation = badge.checkUnlocked(completedCertifications, totalHours, domainsCovered);
      return {
        ...badge,
        isUnlocked: evaluation.isUnlocked,
        currentProgress: evaluation.currentProgress,
        maxProgress: evaluation.maxProgress,
        progressLabel: evaluation.progressLabel,
      };
    });
  }, [completedCertifications, totalHours, domainsCovered]);

  const unlockedCount = evaluatedBadges.filter(b => b.isUnlocked).length;
  const totalBadges = evaluatedBadges.length;
  const unlockPercentage = Math.round((unlockedCount / totalBadges) * 100);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Container */}
      <div className="liquid-glass-card w-full max-w-4xl max-h-[90vh] flex flex-col p-0 relative border-cyan-400/50 bg-slate-950/95 overflow-hidden shadow-2xl rounded-2xl">
        
        {/* Top Accent Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 liquid-glass-pill p-1.5 text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/60 shrink-0">
          <div className="flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl liquid-glass-pill liquid-glow-cyan flex items-center justify-center bg-amber-500/15 border-amber-400/40 text-amber-300 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300">
                  Visual Incentive Achievement System
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-semibold border border-cyan-500/30">
                  {unlockedCount} of {totalBadges} Unlocked
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
                Badge Collection & Trophy Showcase
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Earn verified digital badges as you master Microsoft cloud architecture and certification milestones.
              </p>
            </div>
          </div>

          {/* Quick Action Button for Certificate */}
          {onOpenCertificateGenerator && (
            <button
              onClick={() => {
                onClose();
                onOpenCertificateGenerator();
              }}
              className="liquid-glass-pill px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 border-amber-300 shadow-md shadow-amber-500/20 flex items-center gap-2 cursor-pointer shrink-0 transition-transform active:scale-95"
            >
              <Award className="w-4 h-4" />
              <span>Generate Diploma PNG</span>
            </button>
          )}
        </div>

        {/* Overall Progress Banner */}
        <div className="px-5 sm:px-6 py-3 bg-slate-900/80 border-b border-white/5 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-slate-300 font-semibold">Trophy Level Progress:</span>
            <div className="w-36 sm:w-48 h-2.5 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 transition-all duration-700 shadow-sm shadow-cyan-500/50"
                style={{ width: `${unlockPercentage}%` }}
              />
            </div>
            <span className="font-extrabold text-amber-300">{unlockPercentage}%</span>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Candidate: <strong className="text-slate-200">{profile.displayName}</strong></span>
            <span>&bull;</span>
            <span>Completed Certs: <strong className="text-cyan-300">{completedCertifications.length}</strong></span>
            <span>&bull;</span>
            <span>Study Hours: <strong className="text-emerald-300">~{totalHours}h</strong></span>
          </div>
        </div>

        {/* Badges Collection View */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <BadgeCollection
            completedCertifications={completedCertifications}
            profile={profile}
            compact={false}
            onOpenCertificateGenerator={onOpenCertificateGenerator}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs shrink-0">
          <span className="text-slate-400">
            Complete exam roadmap milestones to collect all 12 digital trophies.
          </span>
          <button
            onClick={onClose}
            className="liquid-glass-pill px-5 py-1.5 font-bold text-white border-white/20 hover:border-white/40 cursor-pointer"
          >
            Close Trophy Room
          </button>
        </div>

      </div>

    </div>
  );
};
