import React from 'react';
import { Award, Clock, ArrowUpRight, Sparkles, CheckCircle2, Lock, Flame } from 'lucide-react';
import { ProgressSummary } from '../types';

interface MetricsOverviewProps {
  progressSummary: ProgressSummary | null;
  onExplainNext: () => void;
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  progressSummary,
  onExplainNext,
}) => {
  if (!progressSummary) return null;

  const {
    percentage,
    completedCount,
    totalCerts,
    availableCount,
    lockedCount,
    estimatedHoursCompleted,
    estimatedHoursRemaining,
    nextRecommendedCert,
  } = progressSummary;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        
        {/* Metric 1: Overall Completion & Radial Progress */}
        <div className="liquid-glass-card p-4 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider">Path Completion</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30">
                {percentage}%
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {completedCount} <span className="text-sm font-normal text-slate-400">of {totalCerts} Certifications</span>
            </div>
            <p className="text-xs text-slate-400">
              {availableCount} unlocked & ready to complete
            </p>
          </div>

          {/* Radial visual ring */}
          <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <path
                className="text-slate-800"
                strokeWidth="3.5"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
              <path
                className="text-cyan-400 transition-all duration-700 ease-out"
                strokeDasharray={`${percentage}, 100`}
                strokeWidth="3.5"
                strokeLinecap="round"
                stroke="currentColor"
                fill="none"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <Award className="w-6 h-6 text-cyan-400" />
            </div>
          </div>
        </div>

        {/* Metric 2: Estimated Study Hours */}
        <div className="liquid-glass-card p-4 flex items-center justify-between relative overflow-hidden group">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Effort Invested</span>
              <span className="text-xs px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                {estimatedHoursCompleted}h
              </span>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">
              {estimatedHoursRemaining} <span className="text-sm font-normal text-slate-400">Hours to Master</span>
            </div>
            <p className="text-xs text-slate-400">
              Total curriculum: {estimatedHoursCompleted + estimatedHoursRemaining} study hours
            </p>
          </div>

          <div className="w-12 h-12 rounded-2xl liquid-glass-pill liquid-glow-emerald flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6 text-emerald-400" />
          </div>
        </div>

        {/* Metric 3: Next Target Milestone & Gemini Advisor */}
        <div className="liquid-glass-card p-4 flex flex-col justify-between relative overflow-hidden group border-purple-500/30 bg-gradient-to-br from-slate-900/90 to-purple-950/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" /> Next Recommended Step
            </span>
            {nextRecommendedCert && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 font-semibold border border-purple-500/40">
                {nextRecommendedCert.code}
              </span>
            )}
          </div>

          {nextRecommendedCert ? (
            <div className="my-1.5 flex items-center justify-between gap-2">
              <div className="truncate">
                <div className="text-sm font-bold text-white truncate">
                  {nextRecommendedCert.title}
                </div>
                <div className="text-xs text-slate-400">
                  {nextRecommendedCert.level} • {nextRecommendedCert.estimated_hours}h estimated
                </div>
              </div>
              
              <button
                onClick={onExplainNext}
                className="liquid-glass-pill px-3 py-1.5 text-xs font-semibold text-purple-200 border-purple-400/50 hover:bg-purple-500/20 transition-all flex items-center gap-1 shrink-0 cursor-pointer"
                title="Get AI technical rationale for this next step"
              >
                <span>AI Rationale</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
              </button>
            </div>
          ) : (
            <div className="my-1 text-sm font-semibold text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              All certifications in this path completed!
            </div>
          )}

          {/* Mini status counts */}
          <div className="flex items-center gap-3 pt-1 border-t border-white/5 text-xs text-slate-400">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400" /> {completedCount} Done
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-cyan-400" /> {availableCount} Unlocked
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-slate-500" /> {lockedCount} Locked
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
