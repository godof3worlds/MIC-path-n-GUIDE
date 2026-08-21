import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Lock, 
  Sparkles, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Clock, 
  Award, 
  BookOpen, 
  Check, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { CertWithProgress } from '../types';

interface CertificationNodeCardProps {
  cert: CertWithProgress;
  allCerts: CertWithProgress[];
  onToggleComplete: (certId: string, completed: boolean) => void;
  onExplain: (cert: CertWithProgress) => void;
  isExplaining?: boolean;
}

export const CertificationNodeCard: React.FC<CertificationNodeCardProps> = ({
  cert,
  allCerts,
  onToggleComplete,
  onExplain,
  isExplaining = false,
}) => {
  const [expanded, setExpanded] = useState(false);

  const isCompleted = cert.status === 'completed';
  const isAvailable = cert.status === 'available';
  const isLocked = cert.status === 'locked';

  // Find prerequisite names for missing ones
  const missingPrereqCerts = (cert.missingPrerequisites || [])
    .map(id => allCerts.find(c => c.id === id))
    .filter(Boolean);

  const prereqCerts = (cert.prerequisites || [])
    .map(id => allCerts.find(c => c.id === id))
    .filter(Boolean);

  return (
    <div
      className={`liquid-glass-card p-5 sm:p-6 transition-all duration-300 relative group overflow-hidden ${
        isCompleted
          ? 'liquid-glow-emerald border-emerald-500/40 bg-slate-900/90'
          : isAvailable
          ? 'liquid-glow-cyan border-cyan-400/50 bg-slate-900/90 shadow-xl'
          : 'border-white/10 opacity-70 bg-slate-950/70'
      }`}
    >
      {/* Top Accent Rim Highlight */}
      <div
        className={`absolute top-0 left-0 right-0 h-1 transition-colors ${
          isCompleted
            ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-green-500'
            : isAvailable
            ? 'bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500'
            : 'bg-slate-700/50'
        }`}
      />

      {/* Card Header: Level, Exam Code & Status Badge */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 mb-3">
        <div className="flex items-center gap-2">
          {/* Level Pill */}
          <span
            className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              cert.level === 'Expert'
                ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                : cert.level === 'Associate'
                ? 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                : 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
            }`}
          >
            {cert.level}
          </span>

          <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-slate-300">
            {cert.exam_code}
          </span>
        </div>

        {/* Status Indicator Pill */}
        <div>
          {isCompleted && (
            <span className="liquid-glass-pill px-3 py-1 text-xs font-semibold text-emerald-300 border-emerald-400/50 flex items-center gap-1.5 liquid-glow-emerald">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed</span>
            </span>
          )}

          {isAvailable && (
            <span className="liquid-glass-pill px-3 py-1 text-xs font-semibold text-cyan-300 border-cyan-400/50 flex items-center gap-1.5 liquid-glow-cyan animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Unlocked & Ready</span>
            </span>
          )}

          {isLocked && (
            <span className="liquid-glass-pill px-3 py-1 text-xs font-medium text-slate-400 border-slate-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-slate-500" />
              <span>Prerequisites Required</span>
            </span>
          )}
        </div>
      </div>

      {/* Certification Code & Title */}
      <div className="mb-2">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-0.5">
          {cert.code}
        </div>
        <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-cyan-200 transition-colors tracking-tight">
          {cert.title}
        </h3>
      </div>

      {/* Description */}
      <p className="text-sm text-slate-300 leading-relaxed mb-4">
        {cert.description}
      </p>

      {/* Prerequisites Section */}
      {prereqCerts.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
          <div className="text-xs font-medium text-slate-400 mb-1.5 flex items-center gap-1">
            <BookOpen className="w-3 h-3 text-slate-400" />
            <span>Path Dependencies:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {prereqCerts.map((prereq) => {
              const isPrereqDone = prereq?.status === 'completed';
              return (
                <span
                  key={prereq?.id}
                  className={`text-xs px-2.5 py-1 rounded-full font-medium flex items-center gap-1 border ${
                    isPrereqDone
                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/30'
                      : 'bg-rose-950/40 text-rose-300 border-rose-500/30'
                  }`}
                >
                  {isPrereqDone ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Lock className="w-3 h-3 text-rose-400" />
                  )}
                  <span>{prereq?.code}</span>
                  <span className="text-[10px] opacity-75">({prereq?.title})</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Missing Prerequisites Warning if Locked */}
      {isLocked && missingPrereqCerts.length > 0 && (
        <div className="mb-4 p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-2 text-xs text-amber-200">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Locked by Prerequisites:</span> Complete{' '}
            {missingPrereqCerts.map(c => c?.code).join(', ')} first to unlock this milestone.
          </div>
        </div>
      )}

      {/* Expandable Skills Measured */}
      <div className="mb-4">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs text-slate-400 hover:text-cyan-300 flex items-center gap-1 transition-colors cursor-pointer py-1 font-medium"
        >
          <span>{expanded ? 'Hide Exam Skills Measured' : 'View Exam Skills Measured'}</span>
          {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>

        {expanded && (
          <div className="mt-2 p-3 rounded-xl bg-black/40 border border-white/10 space-y-1.5 animate-fadeIn">
            <div className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Curriculum & Weighting
            </div>
            <ul className="space-y-1">
              {cert.skills_measured.map((skill, index) => (
                <li key={index} className="text-xs text-slate-300 flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                  <span>{skill}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Bottom Action Controls (Inspired by Liquid Glass Showcase Pills) */}
      <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
        
        {/* Estimated study hours */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>~{cert.estimated_hours} hours study</span>
        </div>

        {/* Button Actions */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* External Microsoft Learn Link */}
          <a
            href={cert.microsoft_learn_url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-pill px-3 py-1.5 text-xs text-slate-300 hover:text-white border-white/15 hover:border-white/30 transition-colors flex items-center gap-1 cursor-pointer"
            title="Open official Microsoft Learn curriculum"
          >
            <span>Learn Docs</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>

          {/* AI Explanation Button */}
          {(isAvailable || isCompleted) && (
            <button
              onClick={() => onExplain(cert)}
              disabled={isExplaining}
              className="liquid-glass-pill px-3 py-1.5 text-xs font-semibold text-purple-300 border-purple-500/40 hover:bg-purple-500/20 transition-all flex items-center gap-1 cursor-pointer group/ai"
              title="Generate technical AI rationale explaining why this is the logical next step"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400 group-hover/ai:rotate-12 transition-transform" />
              <span>{isExplaining ? 'Analyzing...' : 'AI Rationale'}</span>
            </button>
          )}

          {/* Complete / Toggle Action Button */}
          {isAvailable && (
            <button
              onClick={() => onToggleComplete(cert.id, true)}
              className="liquid-glass-pill px-4 py-1.5 text-xs font-bold text-white border-cyan-400/60 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/30 flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Mark Completed</span>
            </button>
          )}

          {isCompleted && (
            <button
              onClick={() => onToggleComplete(cert.id, false)}
              className="liquid-glass-pill px-3 py-1.5 text-xs font-medium text-emerald-300 hover:text-rose-300 border-emerald-500/30 hover:border-rose-500/30 transition-colors flex items-center gap-1 cursor-pointer"
              title="Click to unmark as completed"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Completed (Undo)</span>
            </button>
          )}

          {isLocked && (
            <div className="liquid-glass-pill px-3 py-1.5 text-xs font-medium text-slate-500 border-slate-800 flex items-center gap-1 cursor-not-allowed select-none opacity-60">
              <Lock className="w-3 h-3" />
              <span>Locked</span>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
