import React, { useState } from 'react';
import { 
  Sparkles, 
  X, 
  Check, 
  Copy, 
  Volume2, 
  VolumeX, 
  BrainCircuit, 
  ShieldCheck, 
  ExternalLink,
  BookOpen,
  CheckCircle2,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { ExplainResponse, CertWithProgress } from '../types';

interface AIExplanationModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetCert: CertWithProgress | null;
  completedCerts: CertWithProgress[];
  explanationData: ExplainResponse | null;
  isLoading: boolean;
  onRetry: () => void;
}

export const AIExplanationModal: React.FC<AIExplanationModalProps> = ({
  isOpen,
  onClose,
  targetCert,
  completedCerts,
  explanationData,
  isLoading,
  onRetry,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  if (!isOpen || !targetCert) return null;

  const handleCopy = () => {
    if (explanationData?.explanation) {
      navigator.clipboard.writeText(explanationData.explanation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    if (explanationData?.explanation) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(explanationData.explanation);
      utterance.rate = 1.0;
      utterance.pitch = 1.0;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
      setIsSpeaking(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn">
      
      {/* Liquid Glass Modal Card */}
      <div className="liquid-glass-card w-full max-w-2xl p-6 sm:p-8 relative liquid-glow-purple border-purple-500/40 bg-slate-900/95 overflow-hidden shadow-2xl">
        
        {/* Top Glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 liquid-glass-pill p-2 text-slate-400 hover:text-white border border-white/10 hover:border-white/30 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with Gemini Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl liquid-glass-pill liquid-glow-purple flex items-center justify-center bg-purple-950/60 border-purple-500/40">
            <Sparkles className="w-6 h-6 text-purple-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-300">
                Gemini Next-Step Rationale
              </span>
              {explanationData?.model ? (
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border flex items-center gap-1 ${
                  explanationData.model.includes('static-fallback')
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : explanationData.model.includes('nvidia')
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : explanationData.model.includes('lite')
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                }`}>
                  <BrainCircuit className="w-3 h-3" />
                  {explanationData.model.includes('nvidia')
                    ? `NVIDIA NIM (${explanationData.model.replace('nvidia-nim (', '').replace(')', '').replace('meta/', '').replace('nvidia/', '')})`
                    : explanationData.model.includes('gemini-3.7')
                    ? 'Gemini 3.7 Flash'
                    : explanationData.model.includes('gemini-2.5')
                    ? 'Gemini 2.5 Flash'
                    : explanationData.model.includes('gemini-2.0-flash-lite')
                    ? 'Gemini 2.0 Flash Lite (Auto-Failover)'
                    : explanationData.model.includes('gemini-2.0')
                    ? 'Gemini 2.0 Flash'
                    : 'Resilient Offline Fallback'}
                </span>
              ) : null}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Why Learn {targetCert.code}?
            </h2>
          </div>
        </div>

        {/* Target Milestone Highlight */}
        <div className="mb-5 p-3.5 rounded-xl bg-slate-950/70 border border-white/10 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-slate-400">Target Certification:</div>
            <div className="text-sm font-bold text-white">
              {targetCert.code}: {targetCert.title}
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-950/60 text-cyan-300 font-medium border border-cyan-500/40 shrink-0">
            {targetCert.level}
          </span>
        </div>

        {/* Completed Milestones Context */}
        <div className="mb-5">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Completed Foundations Evaluated:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {completedCerts.length > 0 ? (
              completedCerts.map((c) => (
                <span
                  key={c.id}
                  className="text-xs px-2.5 py-1 rounded-full bg-emerald-950/40 text-emerald-300 border border-emerald-500/30 font-medium flex items-center gap-1"
                >
                  <Check className="w-3 h-3 text-emerald-400" />
                  {c.code}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                First milestone in this roadmap track (Foundational onboarding)
              </span>
            )}
          </div>
        </div>

        {/* AI Rationale Content Box */}
        <div className="mb-6 relative">
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-950/90 to-purple-950/30 border border-purple-500/30 relative">
            
            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center gap-3 text-center">
                <RefreshCw className="w-8 h-8 text-purple-400 animate-spin" />
                <p className="text-sm text-purple-300 font-medium">
                  Consulting Gemini AI technical mentor...
                </p>
                <p className="text-xs text-slate-400">
                  Synthesizing prerequisite synergy and next-step career rationale
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-base text-slate-100 font-normal leading-relaxed">
                    {explanationData?.explanation}
                  </p>
                </div>

                {/* Audio & Copy Controls inside rationale box */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
                  <button
                    onClick={handleSpeak}
                    className="liquid-glass-pill px-3 py-1 text-xs text-slate-300 hover:text-white border-white/15 hover:border-white/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title={isSpeaking ? 'Stop reading' : 'Read rationale aloud'}
                  >
                    {isSpeaking ? (
                      <>
                        <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                        <span>Stop</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-3.5 h-3.5 text-slate-400" />
                        <span>Read Aloud</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleCopy}
                    className="liquid-glass-pill px-3 py-1 text-xs text-slate-300 hover:text-white border-white/15 hover:border-white/30 flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={onRetry}
                    className="liquid-glass-pill px-3 py-1 text-xs text-slate-300 hover:text-purple-300 border-white/15 hover:border-purple-400/40 flex items-center gap-1.5 cursor-pointer transition-colors"
                    title="Regenerate explanation"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-purple-400" />
                    <span>Regenerate</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <a
            href={targetCert.microsoft_learn_url}
            target="_blank"
            rel="noopener noreferrer"
            className="liquid-glass-pill px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white border-white/20 hover:border-white/40 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <span>Open Microsoft Learn Path</span>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </a>

          <button
            onClick={onClose}
            className="liquid-glass-pill px-5 py-2 text-xs font-bold text-white border-purple-400/50 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all shadow-lg shadow-purple-500/30 cursor-pointer"
          >
            Got it, Let's Learn!
          </button>
        </div>

      </div>

    </div>
  );
};
