import React, { useState, useMemo } from 'react';
import { 
  Trophy, 
  Award, 
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
  Cpu,
  ChevronRight,
  Zap,
  TrendingUp
} from 'lucide-react';
import { BADGES_CATALOG, Badge, BadgeTier } from '../data/badgesData';
import { Certification } from '../types';
import { UserProfile } from '../hooks/useAuth';

export interface BadgeCollectionProps {
  completedCertifications: Certification[];
  profile?: UserProfile;
  compact?: boolean;
  onOpenFullTrophyModal?: () => void;
  onOpenCertificateGenerator?: () => void;
}

export const BadgeCollection: React.FC<BadgeCollectionProps> = ({
  completedCertifications,
  profile,
  compact = false,
  onOpenFullTrophyModal,
  onOpenCertificateGenerator,
}) => {
  const [selectedTier, setSelectedTier] = useState<string>('All');
  const [hoveredBadge, setHoveredBadge] = useState<Badge | null>(null);

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

  const unlockedBadges = evaluatedBadges.filter(b => b.isUnlocked);
  const lockedBadges = evaluatedBadges.filter(b => !b.isUnlocked);
  const totalBadges = evaluatedBadges.length;
  const unlockPercentage = Math.round((unlockedBadges.length / totalBadges) * 100);

  // Next closest badge to unlock (incentive target)
  const nextTargetBadge = useMemo(() => {
    if (lockedBadges.length === 0) return null;
    return lockedBadges.reduce((prev, curr) => {
      const prevRatio = prev.currentProgress / prev.maxProgress;
      const currRatio = curr.currentProgress / curr.maxProgress;
      return currRatio > prevRatio ? curr : prev;
    }, lockedBadges[0]);
  }, [lockedBadges]);

  const filteredBadges = useMemo(() => {
    if (selectedTier === 'All') return evaluatedBadges;
    return evaluatedBadges.filter(b => b.tier === selectedTier);
  }, [evaluatedBadges, selectedTier]);

  const renderBadgeIcon = (iconName: string, className: string = 'w-5 h-5') => {
    switch (iconName) {
      case 'Compass': return <Compass className={className} />;
      case 'Layers': return <Layers className={className} />;
      case 'Cloud': return <Cloud className={className} />;
      case 'Crown': return <Crown className={className} />;
      case 'GitMerge': return <GitMerge className={className} />;
      case 'Sparkles': return <Sparkles className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Database': return <Database className={className} />;
      case 'Globe': return <Globe className={className} />;
      case 'Flame': return <Flame className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Cpu': return <Cpu className={className} />;
      default: return <Award className={className} />;
    }
  };

  const getTierColor = (tier: BadgeTier) => {
    switch (tier) {
      case 'Diamond': return 'text-amber-300 border-amber-400/50 bg-amber-500/15 shadow-amber-500/20';
      case 'Gold': return 'text-yellow-300 border-yellow-400/50 bg-yellow-500/15 shadow-yellow-500/20';
      case 'Silver': return 'text-slate-200 border-slate-300/50 bg-slate-400/15 shadow-slate-400/20';
      case 'Bronze': return 'text-orange-300 border-orange-400/50 bg-orange-500/15 shadow-orange-500/20';
    }
  };

  // Compact Mode (for Profile View & Quick Overviews)
  if (compact) {
    return (
      <div className="space-y-3.5">
        {/* Header & Incentive Summary */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500/20 to-yellow-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0 shadow-sm">
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span>Earned Digital Badges</span>
                <span className="text-[10px] font-extrabold px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {unlockedBadges.length}/{totalBadges}
                </span>
              </h3>
            </div>
          </div>

          {onOpenFullTrophyModal && (
            <button
              onClick={onOpenFullTrophyModal}
              className="text-[11px] font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-0.5 cursor-pointer group"
            >
              <span>View All 12</span>
              <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>

        {/* Progress Bar & Level */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-medium">Achievement Milestone Mastery</span>
            <span className="font-bold text-amber-300">{unlockPercentage}% Complete</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-white/10 overflow-hidden p-0.5">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-400 via-cyan-400 to-purple-500 transition-all duration-700 shadow-sm shadow-cyan-500/50"
              style={{ width: `${unlockPercentage}%` }}
            />
          </div>
        </div>

        {/* Badges Grid (Compact Visual Medals) */}
        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
          {evaluatedBadges.map((badge) => {
            const isUnlocked = badge.isUnlocked;
            const tierStyle = getTierColor(badge.tier);

            return (
              <div
                key={badge.id}
                onMouseEnter={() => setHoveredBadge(badge)}
                onMouseLeave={() => setHoveredBadge(null)}
                onClick={onOpenFullTrophyModal}
                className={`p-2 rounded-xl flex flex-col items-center justify-center text-center transition-all cursor-pointer relative group ${
                  isUnlocked
                    ? 'bg-slate-900/90 border border-cyan-400/40 shadow-md hover:border-cyan-300 hover:scale-105 hover:bg-slate-800'
                    : 'bg-slate-950/60 border border-white/5 opacity-50 hover:opacity-75'
                }`}
                title={`${badge.title} (${badge.tier} Tier): ${badge.description}`}
              >
                {/* Icon Medal */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1 transition-transform group-hover:scale-110 shadow-sm ${
                    isUnlocked
                      ? 'bg-gradient-to-tr from-cyan-500/20 to-amber-500/20 border border-cyan-400/40 text-cyan-300 shadow-cyan-500/20'
                      : 'bg-slate-900 border border-white/10 text-slate-500'
                  }`}
                  style={{ color: isUnlocked ? badge.accentColor : undefined }}
                >
                  {renderBadgeIcon(badge.iconName, 'w-4 h-4')}
                </div>

                <div className="text-[10px] font-bold text-slate-200 truncate w-full leading-tight">
                  {badge.title}
                </div>

                <div className="text-[9px] text-slate-500 truncate w-full">
                  {isUnlocked ? (
                    <span className="text-emerald-400 font-semibold flex items-center justify-center gap-0.5">
                      <Check className="w-2.5 h-2.5" /> Earned
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-0.5">
                      <Lock className="w-2 h-2" /> {badge.progressLabel}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Visual Incentive: Next Upcoming Badge Target */}
        {nextTargetBadge && (
          <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/30 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0"
              >
                {renderBadgeIcon(nextTargetBadge.iconName, 'w-4 h-4')}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold uppercase text-amber-300 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Next Achievement:
                  </span>
                  <span className="text-xs font-bold text-white truncate">{nextTargetBadge.title}</span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  {nextTargetBadge.requirementDescription} &bull; <strong className="text-amber-300">{nextTargetBadge.progressLabel}</strong>
                </div>
              </div>
            </div>

            {onOpenCertificateGenerator && unlockedBadges.length > 0 && (
              <button
                onClick={onOpenCertificateGenerator}
                className="liquid-glass-pill px-2.5 py-1 text-[10px] font-bold text-cyan-300 border-cyan-400/40 hover:bg-cyan-500/20 whitespace-nowrap cursor-pointer shrink-0"
              >
                Diploma PNG
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full / Expanded View
  return (
    <div className="space-y-4">
      {/* Tier Filter Tabs */}
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-slate-400 font-semibold">Filter Tier:</span>
          {['All', 'Diamond', 'Gold', 'Silver', 'Bronze'].map((tier) => (
            <button
              key={tier}
              onClick={() => setSelectedTier(tier)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                selectedTier === tier
                  ? 'bg-amber-400 text-slate-950 shadow-sm shadow-amber-400/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-white/10'
              }`}
            >
              {tier}
            </button>
          ))}
        </div>

        <div className="text-xs text-slate-400">
          Showing <strong className="text-cyan-300">{filteredBadges.length}</strong> trophies
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
        {filteredBadges.map((badge) => {
          const tierClass = getTierColor(badge.tier);

          return (
            <div
              key={badge.id}
              className={`p-4 rounded-xl transition-all relative overflow-hidden flex flex-col justify-between ${
                badge.isUnlocked
                  ? 'bg-slate-900/90 border border-white/15 hover:border-cyan-400/60 shadow-lg'
                  : 'bg-slate-950/70 border border-white/5 opacity-70'
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${tierClass}`}>
                  {badge.tier} Tier
                </span>

                {badge.isUnlocked ? (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                    <Check className="w-2.5 h-2.5" /> Unlocked
                  </span>
                ) : (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-white/10 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" /> Locked
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 my-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                    badge.isUnlocked
                      ? 'bg-gradient-to-tr from-cyan-500/20 via-blue-500/30 to-purple-500/20 border border-cyan-400/50 text-cyan-300 shadow-cyan-500/20'
                      : 'bg-slate-900 border border-white/10 text-slate-500'
                  }`}
                  style={{ color: badge.isUnlocked ? badge.accentColor : undefined }}
                >
                  {renderBadgeIcon(badge.iconName, 'w-6 h-6')}
                </div>

                <div>
                  <h4 className="text-sm font-bold text-white tracking-tight">
                    {badge.title}
                  </h4>
                  <div className="text-[11px] text-slate-400 font-medium">
                    {badge.subtitle}
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed mb-3">
                {badge.description}
              </p>

              <div className="pt-2 border-t border-white/10 space-y-1">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-400">{badge.requirementDescription}</span>
                  <span className="font-bold text-slate-200">{badge.progressLabel}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-950 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      badge.isUnlocked ? 'bg-gradient-to-r from-cyan-400 to-emerald-400' : 'bg-slate-700'
                    }`}
                    style={{ width: `${Math.min(100, Math.round((badge.currentProgress / badge.maxProgress) * 100))}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
