import React, { useState } from 'react';
import { 
  X, 
  Check, 
  ShieldCheck, 
  LogOut, 
  UserCheck, 
  Sparkles, 
  Database,
  ArrowRight,
  RefreshCw,
  Mail,
  Trophy,
  Award,
  Layers,
  User as UserIcon
} from 'lucide-react';
import { UserProfile } from '../hooks/useAuth';
import { ProgressSummary, Certification } from '../types';
import { BadgeCollection } from './BadgeCollection';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  progressSummary: ProgressSummary | null;
  completedCertifications?: Certification[];
  onSignInWithGoogle: () => Promise<any>;
  onSwitchAccount: (id: string, name: string, email: string) => Promise<any>;
  onLogout: () => Promise<void>;
  onOpenBadges?: () => void;
  onOpenCertificateGenerator?: () => void;
  onOpenCatalog?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  profile,
  progressSummary,
  completedCertifications = [],
  onSignInWithGoogle,
  onSwitchAccount,
  onLogout,
  onOpenBadges,
  onOpenCertificateGenerator,
  onOpenCatalog,
}) => {
  const [loading, setLoading] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmail, setCustomEmail] = useState('');

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await onSignInWithGoogle();
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleCustomSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;
    setLoading(true);
    try {
      const email = customEmail.trim() || `${customName.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;
      const id = 'user_' + customName.toLowerCase().replace(/[^a-z0-9]/g, '_');
      await onSwitchAccount(id, customName.trim(), email);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const completedCount = progressSummary?.completedCount ?? 0;
  const totalCerts = progressSummary?.totalCerts ?? 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      
      {/* Modal Card */}
      <div className="liquid-glass-card w-full max-w-xl max-h-[92vh] flex flex-col p-0 relative border-cyan-400/40 bg-slate-900/95 overflow-hidden shadow-2xl rounded-2xl">
        
        {/* Top Gradient Highlight */}
        <div className="h-1.5 bg-gradient-to-r from-amber-400 via-cyan-400 to-indigo-600 shrink-0" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 liquid-glass-pill p-1.5 text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-white/10 flex items-center gap-3 bg-slate-900/60 shrink-0">
          <div className="w-12 h-12 rounded-2xl liquid-glass-pill liquid-glow-cyan flex items-center justify-center bg-cyan-950/60 border-cyan-500/40 shrink-0">
            <UserCheck className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                Google Authentication & Credentials
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-semibold border border-emerald-500/30 flex items-center gap-1">
                <Database className="w-2.5 h-2.5" /> Cloud Synced
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Learner Profile & Achievement Badges
            </h2>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Active Profile Banner */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-blue-950/40 border border-white/15 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {profile.photoURL ? (
                <img
                  src={profile.photoURL}
                  alt={profile.displayName || 'User Avatar'}
                  className="w-12 h-12 rounded-full border-2 border-cyan-400/60 object-cover shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {(profile.displayName || 'G').charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white text-base">{profile.displayName || 'Guest Learner'}</span>
                  {profile.isGoogleUser && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-semibold border border-blue-500/40 flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-blue-400" /> Google Verified
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <Mail className="w-3 h-3 text-slate-500" />
                  <span>{profile.email || 'No email associated (Guest)'}</span>
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-[11px] text-slate-400">Current Track</div>
              <div className="text-sm font-extrabold text-emerald-300">
                {completedCount}/{totalCerts} Done
              </div>
            </div>
          </div>

          {/* Visual Incentive System: Badge Collection Showcase in Profile */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-cyan-500/30">
            <BadgeCollection
              completedCertifications={completedCertifications}
              profile={profile}
              compact={true}
              onOpenFullTrophyModal={() => {
                onClose();
                if (onOpenBadges) onOpenBadges();
              }}
              onOpenCertificateGenerator={() => {
                onClose();
                if (onOpenCertificateGenerator) onOpenCertificateGenerator();
              }}
            />
          </div>

          {/* Action: Open 151 Microsoft Certifications Catalog */}
          {onOpenCatalog && (
            <button
              onClick={() => {
                onClose();
                onOpenCatalog();
              }}
              className="w-full liquid-glass-pill p-3 flex items-center justify-between text-xs font-bold text-cyan-200 border-cyan-400/40 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 transition-all cursor-pointer shadow-sm group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center border border-cyan-400/40 text-cyan-300">
                  <Layers className="w-4 h-4" />
                </div>
                <span>Explore All 151 Microsoft Certifications</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-400/20 text-cyan-200 border border-cyan-400/30">151 Total</span>
            </button>
          )}

          {/* Action: Google Sign In Button */}
          <div className="space-y-4">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full liquid-glass-pill p-3.5 flex items-center justify-center gap-3 text-sm font-bold text-white border-cyan-400/50 bg-gradient-to-r from-blue-600/30 via-slate-800/80 to-blue-600/30 hover:border-cyan-400 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer shadow-lg group"
            >
              {/* Google Icon */}
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
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
              <span>{loading ? 'Connecting Google Account...' : 'Continue with Google Account'}</span>
            </button>

            {/* Quick Candidate Presets */}
            <div className="pt-1">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Or Switch Candidate Role:
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={async () => {
                    await onSwitchAccount('alex-cloud', 'Alex Vance', 'alex.vance@gmail.com');
                    onClose();
                  }}
                  className="liquid-glass-pill p-2.5 text-left border-white/10 hover:border-cyan-400/50 hover:bg-cyan-500/10 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-white">Alex Vance</div>
                  <div className="text-[11px] text-cyan-300">Cloud Solutions Engineer</div>
                </button>

                <button
                  onClick={async () => {
                    await onSwitchAccount('taylor-ai', 'Taylor Morgan', 'taylor.morgan@gmail.com');
                    onClose();
                  }}
                  className="liquid-glass-pill p-2.5 text-left border-white/10 hover:border-purple-400/50 hover:bg-purple-500/10 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-white">Taylor Morgan</div>
                  <div className="text-[11px] text-purple-300">Azure AI Specialist</div>
                </button>
              </div>
            </div>

            {/* Custom Account Form */}
            <form onSubmit={handleCustomSubmit} className="pt-1 space-y-2">
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Enter Custom Learner Name:
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="e.g. Sarah Connor"
                  className="flex-1 bg-slate-950/80 border border-white/15 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <button
                  type="submit"
                  disabled={!customName.trim() || loading}
                  className="liquid-glass-pill px-4 py-2 text-xs font-bold text-cyan-300 border-cyan-500/40 hover:bg-cyan-500/20 disabled:opacity-40 cursor-pointer"
                >
                  Switch
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-white/10 bg-slate-900/80 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={async () => {
              await onLogout();
              onClose();
            }}
            className="text-slate-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors cursor-pointer py-1"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out / Clear Session</span>
          </button>

          <button
            onClick={onClose}
            className="liquid-glass-pill px-5 py-1.5 text-xs font-bold text-white border-white/20 hover:border-white/40 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>

    </div>
  );
};

