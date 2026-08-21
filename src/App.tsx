import React, { useState, useEffect, useCallback, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { DOMAINS } from './data/certificationsData';
import { CertLevel, CertWithProgress, DomainInfo, ExplainResponse, ProgressSummary } from './types';
import { Header } from './components/Header';
import { DomainPicker } from './components/DomainPicker';
import { LiquidGlassControls } from './components/LiquidGlassControls';
import { MetricsOverview } from './components/MetricsOverview';
import { PathVisualizer } from './components/PathVisualizer';
import { CertificationNodeCard } from './components/CertificationNodeCard';
import { AIExplanationModal } from './components/AIExplanationModal';
import { DevTestingToolbar } from './components/DevTestingToolbar';
import { UserProfileModal } from './components/UserProfileModal';
import { StudyAssistChatWindow } from './components/StudyAssistChatWindow';
import { BadgeCollectionModal } from './components/BadgeCollectionModal';
import { CertificateGeneratorModal } from './components/CertificateGeneratorModal';
import { CatalogExplorerModal } from './components/CatalogExplorerModal';
import { useAuth } from './hooks/useAuth';
import { Sparkles, AlertCircle, Layers } from 'lucide-react';

export default function App() {
  const { 
    profile, 
    signInWithGoogle, 
    switchAccount, 
    logout 
  } = useAuth();

  const [domains, setDomains] = useState<DomainInfo[]>(DOMAINS);
  const [selectedDomainId, setSelectedDomainId] = useState<string>('cloud');
  const [progressSummary, setProgressSummary] = useState<ProgressSummary | null>(null);
  const [domainProgressMap, setDomainProgressMap] = useState<Record<string, { completed: number; total: number }>>({});
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevel, setSelectedLevel] = useState<'All' | CertLevel>('All');
  const [autoExplain, setAutoExplain] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'tree' | 'grid'>('tree');
  
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // User Profile Modal state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Badge Collection Trophy Room Modal state
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);

  // High-Resolution Certificate Generator Modal state
  const [isCertificateGeneratorOpen, setIsCertificateGeneratorOpen] = useState<boolean>(false);

  // 151 Microsoft Certifications Catalog Explorer Modal state
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState<boolean>(false);

  // AI Study Assistant Chatbot Window state
  const [isStudyChatOpen, setIsStudyChatOpen] = useState<boolean>(false);

  // AI Modal state
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [explainingCert, setExplainingCert] = useState<CertWithProgress | null>(null);
  const [explanationData, setExplanationData] = useState<ExplainResponse | null>(null);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Progress for current domain and compute summary for all domains
  const loadProgress = useCallback(async (domainId: string, currentUserId: string) => {
    setIsLoading(true);
    try {
      // 1. Fetch current domain progress
      const res = await fetch(`/api/progress/${encodeURIComponent(currentUserId)}/${encodeURIComponent(domainId)}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const data: ProgressSummary = await res.json();
      setProgressSummary(data);

      // 2. Fetch all other domains for progress map
      const domainMap: Record<string, { completed: number; total: number }> = {};
      await Promise.all(
        DOMAINS.map(async (d) => {
          if (d.id === domainId) {
            domainMap[d.id] = { completed: data.completedCount, total: data.totalCerts };
          } else {
            try {
              const dRes = await fetch(`/api/progress/${encodeURIComponent(currentUserId)}/${encodeURIComponent(d.id)}`);
              if (dRes.ok) {
                const dData: ProgressSummary = await dRes.json();
                domainMap[d.id] = { completed: dData.completedCount, total: dData.totalCerts };
              }
            } catch {
              domainMap[d.id] = { completed: 0, total: d.totalCerts };
            }
          }
        })
      );
      setDomainProgressMap(domainMap);
    } catch (err) {
      console.error('Failed to load progress from server:', err);
      showToast('Offline fallback: Computed progress using local data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initial load and whenever user or domain changes
  useEffect(() => {
    loadProgress(selectedDomainId, profile.id);
  }, [selectedDomainId, profile.id, loadProgress]);

  // Handle Mark Complete / Toggle
  const handleToggleComplete = async (certId: string, completed: boolean) => {
    try {
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: profile.id,
          certId,
          completed,
        }),
      });

      if (!res.ok) throw new Error('Failed to update status on server');
      const updated: ProgressSummary = await res.json();
      const previousCompletedCount = progressSummary?.completedCount ?? 0;
      setProgressSummary(updated);

      // Update domain map
      setDomainProgressMap(prev => ({
        ...prev,
        [selectedDomainId]: { completed: updated.completedCount, total: updated.totalCerts },
      }));

      if (completed) {
        // Confetti celebration
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#06b6d4', '#a855f7', '#10b981', '#ffffff'],
          });
        } catch {
          // ignore if confetti not loaded
        }

        const justCompletedCert = updated.certifications.find(c => c.id === certId);
        showToast(`Milestone Completed: ${justCompletedCert?.code || certId}`);

        // Check if all completed
        if (updated.completedCount === updated.totalCerts) {
          setTimeout(() => {
            confetti({
              particleCount: 120,
              spread: 100,
              origin: { y: 0.5 },
            });
            showToast('All certifications in this path mastered!');
          }, 300);
        }

        // Auto-explain newly unlocked cert if enabled
        if (autoExplain && updated.nextRecommendedCert && updated.completedCount > previousCompletedCount) {
          handleExplain(updated.nextRecommendedCert, updated);
        }
      } else {
        showToast('Marked as not completed');
      }
    } catch (err) {
      console.error('Error completing certification:', err);
      showToast('Failed to sync progress with server');
    }
  };

  // Handle Reset Path
  const handleReset = async () => {
    if (!window.confirm(`Are you sure you want to reset all progress for this domain?`)) {
      return;
    }
    try {
      const res = await fetch('/api/progress/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: profile.id, domain: selectedDomainId }),
      });
      if (res.ok) {
        const data: ProgressSummary = await res.json();
        setProgressSummary(data);
        setDomainProgressMap(prev => ({
          ...prev,
          [selectedDomainId]: { completed: data.completedCount, total: data.totalCerts },
        }));
        showToast('Path progress reset to beginning');
      }
    } catch (err) {
      console.error('Failed to reset path:', err);
    }
  };

  // Fast-track foundations helper (Recruiter testing tool)
  const handleFastTrackFoundations = async () => {
    if (!progressSummary) return;
    const foundations = progressSummary.certifications.filter(c => c.level === 'Fundamentals' && c.status !== 'completed');
    for (const f of foundations) {
      await handleToggleComplete(f.id, true);
    }
    showToast('Fast-tracked all foundation certifications!');
  };

  // Handle AI Explanation Trigger
  const handleExplain = async (cert: CertWithProgress, currentProgress = progressSummary) => {
    setExplainingCert(cert);
    setIsModalOpen(true);
    setIsAiLoading(true);
    setExplanationData(null);

    const completedList = (currentProgress?.certifications || [])
      .filter(c => c.status === 'completed')
      .map(c => ({
        id: c.id,
        code: c.code,
        title: c.title,
      }));

    // If simulated offline, demonstrate pure client fallback instantly
    if (isSimulatedOffline) {
      setTimeout(() => {
        setExplanationData({
          cert_id: cert.id,
          explanation: `[Simulated Offline Fallback]: After completing ${
            completedList.length > 0 ? completedList.map(c => c.code).join(', ') : 'foundational concepts'
          }, advancing to ${cert.code} (${cert.title}) reinforces core architecture competencies and empowers you to implement enterprise-scale Microsoft solutions.`,
          is_fallback: true,
          model: 'offline-resilient-fallback',
        });
        setIsAiLoading(false);
      }, 500);
      return;
    }

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          current_step: {
            id: cert.id,
            code: cert.code,
            title: cert.title,
            domain: cert.domain,
          },
          completed_certs: completedList,
        }),
      });

      if (!res.ok) throw new Error('API request failed');
      const data: ExplainResponse = await res.json();
      setExplanationData(data);
    } catch (err) {
      console.warn('AI Explain request failed, showing graceful fallback:', err);
      setExplanationData({
        cert_id: cert.id,
        explanation: `Pursuing ${cert.code} (${cert.title}) is the natural step to elevate your technical depth, bridging core Microsoft foundations to practical, production-ready engineering capabilities.`,
        is_fallback: true,
        model: 'static-fallback (network error recovery)',
      });
    } finally {
      setIsAiLoading(false);
    }
  };

  // Filtered certifications based on search & level
  const filteredCertifications = useMemo(() => {
    if (!progressSummary) return [];
    let list = progressSummary.certifications;

    if (selectedLevel !== 'All') {
      list = list.filter(c => c.level === selectedLevel);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.skills_measured.some(s => s.toLowerCase().includes(q))
      );
    }

    return list;
  }, [progressSummary, selectedLevel, searchQuery]);

  const currentDomainInfo = DOMAINS.find(d => d.id === selectedDomainId) || DOMAINS[0];
  const completedCerts = (progressSummary?.certifications || []).filter(c => c.status === 'completed');

  return (
    <div className="min-h-screen ambient-mesh relative text-slate-100 selection:bg-cyan-500 selection:text-white pb-16">
      
      {/* Background Decorative Gradient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute top-1/3 -right-32 w-96 h-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-32 left-1/3 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      {/* Main Content Area */}
      <div className="relative z-10">
        
        {/* Header */}
        <Header
          currentDomain={currentDomainInfo}
          progressSummary={progressSummary}
          onReset={handleReset}
          profile={profile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenStudyChat={() => setIsStudyChatOpen(true)}
          onOpenBadges={() => setIsBadgesModalOpen(true)}
          onOpenCertificateGenerator={() => setIsCertificateGeneratorOpen(true)}
          onOpenCatalog={() => setIsCatalogModalOpen(true)}
        />

        {/* Recruitment & Testing Toolbar */}
        <DevTestingToolbar
          onFastTrackAll={handleFastTrackFoundations}
          onResetTrack={handleReset}
          onRefresh={() => loadProgress(selectedDomainId, profile.id)}
          isSimulatedOffline={isSimulatedOffline}
          onToggleSimulatedOffline={setIsSimulatedOffline}
        />

        {/* Domain Track Picker */}
        <DomainPicker
          domains={domains}
          selectedDomainId={selectedDomainId}
          onSelectDomain={setSelectedDomainId}
          domainProgressMap={domainProgressMap}
        />

        {/* Quick Microsoft Catalog Live Callout Bar */}
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-2 mb-4">
          <div className="rounded-2xl liquid-glass border border-cyan-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-slate-900/80 via-cyan-950/20 to-slate-900/80 shadow-lg">
            <div className="flex items-center gap-3.5 text-left w-full sm:w-auto">
              <div className="w-10 h-10 rounded-xl liquid-glass-pill flex items-center justify-center border border-cyan-400/40 bg-cyan-500/15 text-cyan-300 shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-white">Explore All 151 Microsoft Certifications</h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40">Live Catalog</span>
                </div>
                <p className="text-xs text-slate-300">
                  Search, filter, and track exams across Azure, Fabric, Security, Power Platform, M365, and Dynamics.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCatalogModalOpen(true)}
              className="w-full sm:w-auto liquid-glass-pill px-4 py-2 flex items-center justify-center gap-2 text-xs font-bold text-cyan-200 border-cyan-400/60 bg-cyan-500/20 hover:bg-cyan-500/30 hover:text-white transition-all cursor-pointer whitespace-nowrap shadow-md group"
            >
              <span>Open 151 Certs Catalog</span>
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Progress & Metrics Dashboard */}
        <MetricsOverview
          progressSummary={progressSummary}
          onExplainNext={() => {
            if (progressSummary?.nextRecommendedCert) {
              handleExplain(progressSummary.nextRecommendedCert);
            }
          }}
        />

        {/* Liquid Glass Controls Bar (Search, Level Filter, AI Toggle, View Mode) */}
        <LiquidGlassControls
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedLevel={selectedLevel}
          onLevelChange={setSelectedLevel}
          autoExplain={autoExplain}
          onAutoExplainToggle={setAutoExplain}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

        {/* Certification Nodes View */}
        {viewMode === 'tree' ? (
          <PathVisualizer
            certifications={filteredCertifications}
            onToggleComplete={handleToggleComplete}
            onExplain={handleExplain}
            explainingCertId={explainingCert?.id}
          />
        ) : (
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertifications.map((cert) => (
                <CertificationNodeCard
                  key={cert.id}
                  cert={cert}
                  allCerts={progressSummary?.certifications || []}
                  onToggleComplete={handleToggleComplete}
                  onExplain={handleExplain}
                  isExplaining={explainingCert?.id === cert.id}
                />
              ))}
            </div>
          </div>
        )}

        {filteredCertifications.length === 0 && (
          <div className="w-full max-w-md mx-auto my-12 p-8 liquid-glass-card text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
            <h4 className="text-base font-bold text-white">No Certifications Match Filter</h4>
            <p className="text-xs text-slate-400">
              Try clearing your search query or choosing "All" level filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedLevel('All');
              }}
              className="liquid-glass-pill px-4 py-1.5 text-xs font-semibold text-cyan-300 border-cyan-500/40"
            >
              Reset Filters
            </button>
          </div>
        )}

      </div>

      {/* User Profile & Google Login Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        profile={profile}
        progressSummary={progressSummary}
        completedCertifications={completedCerts}
        onOpenBadges={() => setIsBadgesModalOpen(true)}
        onOpenCertificateGenerator={() => setIsCertificateGeneratorOpen(true)}
        onOpenCatalog={() => setIsCatalogModalOpen(true)}
        onSignInWithGoogle={async () => {
          const user = await signInWithGoogle();
          showToast(`Logged in as ${user?.displayName || user?.email || 'Google User'}`);
        }}
        onSwitchAccount={async (id, name, email) => {
          const user = await switchAccount(id, name, email);
          showToast(`Switched account to ${user.displayName}`);
        }}
        onLogout={async () => {
          await logout();
          showToast('Signed out of session');
        }}
      />

      {/* Badge Collection & Trophy Room Modal */}
      <BadgeCollectionModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
        completedCertifications={completedCerts}
        profile={profile}
        onOpenCertificateGenerator={() => {
          setIsBadgesModalOpen(false);
          setIsCertificateGeneratorOpen(true);
        }}
      />

      {/* High-Resolution Certificate Generator Modal */}
      <CertificateGeneratorModal
        isOpen={isCertificateGeneratorOpen}
        onClose={() => setIsCertificateGeneratorOpen(false)}
        profile={profile}
        completedCertifications={completedCerts}
      />

      {/* Official Microsoft Learn 151 Certifications Catalog Explorer Modal */}
      <CatalogExplorerModal
        isOpen={isCatalogModalOpen}
        onClose={() => setIsCatalogModalOpen(false)}
        profile={profile}
        completedCertIds={completedCerts.map(c => c.code || c.id)}
        onToggleComplete={handleToggleComplete}
        onOpenStudyWithCert={(certTitle, examCode) => {
          setIsCatalogModalOpen(false);
          setIsStudyChatOpen(true);
        }}
      />

      {/* AI Explanation Modal / Drawer */}
      <AIExplanationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        targetCert={explainingCert}
        completedCerts={completedCerts}
        explanationData={explanationData}
        isLoading={isAiLoading}
        onRetry={() => {
          if (explainingCert) {
            handleExplain(explainingCert);
          }
        }}
      />

      {/* All-Purpose Study Assist AI Chat Bot Window */}
      <StudyAssistChatWindow
        currentDomain={currentDomainInfo}
        progressSummary={progressSummary}
        isOpen={isStudyChatOpen}
        onToggleOpen={() => setIsStudyChatOpen(prev => !prev)}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="liquid-glass-pill px-4 py-2.5 flex items-center gap-2.5 text-xs font-semibold text-white liquid-glow-cyan border-cyan-400/50 bg-slate-900/95 shadow-2xl">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{toastMessage}</span>
          </div>
        </div>
      )}

    </div>
  );
}
