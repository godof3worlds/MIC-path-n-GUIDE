import React from 'react';
import { Sparkles, RotateCcw, CheckCircle2, UserCircle2, Bot, Trophy, Award, FileImage, Layers } from 'lucide-react';
import { DomainInfo, ProgressSummary } from '../types';
import { UserProfile } from '../hooks/useAuth';

interface HeaderProps {
  currentDomain: DomainInfo;
  progressSummary: ProgressSummary | null;
  onReset: () => void;
  profile: UserProfile;
  onOpenProfile: () => void;
  onOpenStudyChat?: () => void;
  onOpenBadges?: () => void;
  onOpenCertificateGenerator?: () => void;
  onOpenCatalog?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentDomain,
  progressSummary,
  onReset,
  profile,
  onOpenProfile,
  onOpenStudyChat,
  onOpenBadges,
  onOpenCertificateGenerator,
  onOpenCatalog,
}) => {
  const percentage = progressSummary?.percentage ?? 0;
  const completedCount = progressSummary?.completedCount ?? 0;
  const totalCerts = progressSummary?.totalCerts ?? 0;

  return (
    <header className="relative z-10 w-full pt-6 pb-4 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Logo & Title */}
        <div className="flex items-center gap-4">
          {/* Liquid Glass Capsule Logo */}
          <div className="relative group">
            <div className="w-14 h-14 rounded-2xl liquid-glass-pill flex items-center justify-center liquid-glow-cyan">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
                Microsoft Learn Catalog
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400">
                151 Certs Live Sync
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-200 bg-clip-text text-transparent mt-0.5">
              PETA PATH
            </h1>
          </div>
        </div>

        {/* Action Controls & Session Profile */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          
          {/* 151 Microsoft Certifications Catalog Explorer Button */}
          {onOpenCatalog && (
            <button
              onClick={onOpenCatalog}
              className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs border-cyan-400/60 bg-gradient-to-r from-cyan-500/20 via-blue-500/15 to-cyan-500/20 text-cyan-200 hover:text-white hover:bg-cyan-500/30 hover:border-cyan-300 transition-all cursor-pointer shadow-md group liquid-glow-cyan"
              title="Open Official Microsoft Learn 151 Certifications Catalog"
            >
              <div className="relative">
                <Layers className="w-4 h-4 text-cyan-300 group-hover:scale-110 transition-transform" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
              </div>
              <span className="font-extrabold tracking-tight">All 151 Certs</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-cyan-400/20 text-cyan-200 font-mono font-bold border border-cyan-400/40">151</span>
            </button>
          )}

          {/* AI Study Assistant Launcher Button */}
          {onOpenStudyChat && (
            <button
              onClick={onOpenStudyChat}
              className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs border-cyan-400/50 bg-cyan-500/10 text-cyan-200 hover:text-white hover:bg-cyan-500/20 hover:border-cyan-300 transition-all cursor-pointer shadow-sm group"
              title="Open Gemini AI Study Assistant"
            >
              <Bot className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-tight">Study AI</span>
              <Sparkles className="w-3 h-3 text-cyan-300" />
            </button>
          )}

          {/* Badge Collection & Trophy Room Button */}
          {onOpenBadges && (
            <button
              onClick={onOpenBadges}
              className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs border-purple-400/50 bg-purple-500/10 text-purple-200 hover:text-white hover:bg-purple-500/20 hover:border-purple-300 transition-all cursor-pointer shadow-sm group"
              title="View Badge Collection & Trophy Room"
            >
              <Trophy className="w-4 h-4 text-purple-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-tight">Badges</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">12</span>
            </button>
          )}

          {/* Generate Certificate PNG Button */}
          {onOpenCertificateGenerator && (
            <button
              onClick={onOpenCertificateGenerator}
              className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs border-amber-400/50 bg-gradient-to-r from-amber-500/15 via-yellow-500/10 to-amber-500/15 text-amber-200 hover:text-white hover:bg-amber-500/25 hover:border-amber-300 transition-all cursor-pointer shadow-sm group"
              title="Generate Certificate (PNG)"
            >
              <FileImage className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="font-bold tracking-tight">Certificate</span>
              <Sparkles className="w-3 h-3 text-amber-300" />
            </button>
          )}

          {/* Google Auth / Candidate Account Pill */}
          <button
            onClick={onOpenProfile}
            className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-2 text-xs border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-500/10 transition-all cursor-pointer group shadow-sm"
            title="Manage Google Account & Profile"
          >
            {profile.photoURL ? (
              <img
                src={profile.photoURL}
                alt={profile.displayName || 'Profile'}
                className="w-5 h-5 rounded-full object-cover border border-cyan-400/80 shrink-0"
                referrerPolicy="no-referrer"
              />
            ) : profile.isGoogleUser ? (
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
            ) : (
              <UserCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            )}

            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-slate-200 max-w-[130px] truncate">
                {profile.displayName || 'Sign in with Google'}
              </span>
              {profile.isGoogleUser && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Google Synced" />
              )}
            </div>
          </button>

          {/* Progress Summary Pill */}
          <div className="liquid-glass-pill px-4 py-1.5 flex items-center gap-2.5 liquid-glow-emerald">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span className="text-xs text-slate-300">
              <strong className="text-emerald-300 font-bold">{completedCount}</strong>/{totalCerts} Done ({percentage}%)
            </span>
          </div>

          {/* Reset Button */}
          <button
            onClick={onReset}
            className="liquid-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-xs text-slate-300 hover:text-rose-300 hover:border-rose-500/40 transition-colors cursor-pointer group"
            title="Reset progress for this domain"
          >
            <RotateCcw className="w-3.5 h-3.5 group-hover:rotate-180 transition-transform duration-500 text-slate-400 group-hover:text-rose-400" />
            <span>Reset Path</span>
          </button>

        </div>

      </div>
    </header>
  );
};
