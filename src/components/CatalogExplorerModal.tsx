import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  ExternalLink, 
  CheckCircle2, 
  Circle, 
  Sparkles, 
  BookOpen, 
  Layers, 
  ShieldCheck, 
  Database, 
  Cpu, 
  Zap, 
  LayoutGrid, 
  Table as TableIcon,
  RotateCw,
  Award,
  Calendar,
  Tag,
  Briefcase,
  AlertTriangle,
  Flame,
  Check
} from 'lucide-react';
import { CatalogCertification, CatalogResponse } from '../types';
import { UserProfile } from '../hooks/useAuth';

interface CatalogExplorerModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  completedCertIds?: string[];
  onToggleComplete?: (certId: string, completed: boolean) => void;
  onOpenStudyWithCert?: (certTitle: string, examCode: string) => void;
}

export const CatalogExplorerModal: React.FC<CatalogExplorerModalProps> = ({
  isOpen,
  onClose,
  profile,
  completedCertIds = [],
  onToggleComplete,
  onOpenStudyWithCert,
}) => {
  const [catalogData, setCatalogData] = useState<CatalogResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedLevel, setSelectedLevel] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'active' | 'retired' | 'completed'>('all');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'priority' | 'code' | 'title' | 'level'>('priority');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Selected Cert for Detail View
  const [detailCert, setDetailCert] = useState<CatalogCertification | null>(null);

  // Load catalog data from backend API
  const loadCatalog = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch('/api/catalog/certifications');
      if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch catalog`);
      const data: CatalogResponse = await res.json();
      setCatalogData(data);
    } catch (err: any) {
      console.error('Error loading catalog:', err);
      setFetchError(err.message || 'Failed to load Microsoft Catalog');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && !catalogData) {
      loadCatalog();
    }
  }, [isOpen, catalogData]);

  // Check if a cert is completed (matches by uid, id, or code)
  const isCompleted = (cert: CatalogCertification) => {
    const normId = cert.id.toLowerCase();
    const normUid = cert.uid.toLowerCase();
    const normCode = cert.code.toLowerCase();
    return completedCertIds.some(cId => {
      const low = cId.toLowerCase();
      return low === normId || low === normUid || low === normCode || low === normCode.replace('-', '');
    });
  };

  // Filter and Sort Certifications
  const filteredCertifications = useMemo(() => {
    if (!catalogData?.certifications) return [];

    return catalogData.certifications.filter(cert => {
      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = cert.title.toLowerCase().includes(q);
        const matchesCode = cert.code.toLowerCase().includes(q);
        const matchesDesc = cert.plain_description.toLowerCase().includes(q);
        const matchesCategory = cert.category.toLowerCase().includes(q);
        const matchesRole = cert.roles.some(r => r.toLowerCase().includes(q));
        const matchesExam = cert.exams.some(e => e.code.toLowerCase().includes(q) || e.title.toLowerCase().includes(q));
        if (!matchesTitle && !matchesCode && !matchesDesc && !matchesCategory && !matchesRole && !matchesExam) {
          return false;
        }
      }

      // Category filter
      if (selectedCategory !== 'All' && cert.category !== selectedCategory) {
        return false;
      }

      // Level filter
      if (selectedLevel !== 'All' && cert.level_label !== selectedLevel) {
        return false;
      }

      // Role filter
      if (selectedRole !== 'All' && !cert.roles.includes(selectedRole)) {
        return false;
      }

      // Status filter
      if (selectedStatus === 'active' && cert.is_retired) {
        return false;
      }
      if (selectedStatus === 'retired' && !cert.is_retired) {
        return false;
      }
      if (selectedStatus === 'completed' && !isCompleted(cert)) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'code') {
        return a.code.localeCompare(b.code);
      }
      if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'level') {
        const order: Record<string, number> = { Fundamentals: 1, Associate: 2, Expert: 3, Specialty: 4, General: 5 };
        return (order[a.level_label] || 99) - (order[b.level_label] || 99);
      }
      // Priority: Active first, then non-MOS/MCSA, then Fundamentals -> Associate -> Expert
      if (a.is_retired !== b.is_retired) return a.is_retired ? 1 : -1;
      const order: Record<string, number> = { Fundamentals: 1, Associate: 2, Expert: 3, Specialty: 4, General: 5 };
      return (order[a.level_label] || 99) - (order[b.level_label] || 99);
    });
  }, [catalogData, searchQuery, selectedCategory, selectedLevel, selectedRole, selectedStatus, sortBy, completedCertIds]);

  const completedTotalCount = useMemo(() => {
    if (!catalogData?.certifications) return 0;
    return catalogData.certifications.filter(c => isCompleted(c)).length;
  }, [catalogData, completedCertIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200">
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-7xl max-h-[92vh] flex flex-col rounded-3xl liquid-glass border border-cyan-500/30 shadow-2xl shadow-cyan-950/50 overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="relative px-6 py-5 border-b border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900/90 via-slate-900/60 to-slate-950/90">
          
          {/* Title & Badge */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center border border-cyan-400/40 bg-cyan-500/15 shadow-lg shadow-cyan-500/20">
              <Award className="w-6 h-6 text-cyan-300" />
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Official Microsoft Learn Catalog API
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-400/30">
                  All 151 Certifications
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 flex items-center gap-2">
                Microsoft Official Certification Catalog
                <span className="text-sm font-normal text-slate-400">({catalogData?.total || 151} Total Credentials)</span>
              </h2>
            </div>
          </div>

          {/* Quick Metrics & Close */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="hidden sm:flex items-center gap-3 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>{completedTotalCount} Completed</span>
              </div>
              <div className="w-px h-3 bg-white/10" />
              <div className="text-slate-400">
                <span>{catalogData?.activeCount || 0} Active</span>
              </div>
            </div>

            <button
              onClick={loadCatalog}
              disabled={isLoading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
              title="Refresh Catalog Data"
            >
              <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-cyan-400' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-red-500/20 hover:border-red-500/40 transition-all"
              title="Close Modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="px-6 py-3.5 border-b border-white/10 bg-slate-900/40 flex flex-col gap-3">
          
          {/* Top Filter Row: Search, Category, Level, Status, View Toggle */}
          <div className="flex flex-wrap items-center gap-3 justify-between">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px] max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search 151 certs (e.g. AZ-900, AI-102, DP-600, SC-200, Architect)..."
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/30 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Categories ({catalogData?.total || 151})</option>
              {catalogData?.categories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} ({cat.count})
                </option>
              ))}
            </select>

            {/* Level Dropdown */}
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="All">All Levels</option>
              <option value="Fundamentals">Fundamentals / Beginner</option>
              <option value="Associate">Associate / Intermediate</option>
              <option value="Expert">Expert / Advanced</option>
              <option value="Specialty">Specialty</option>
            </select>

            {/* Status Dropdown */}
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="completed">Completed by Me ({completedTotalCount})</option>
              <option value="retired">Retired / Archive</option>
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-slate-950/60 border border-white/15 text-xs font-medium text-slate-200 focus:outline-none focus:border-cyan-400"
            >
              <option value="priority">Sort: Recommended</option>
              <option value="code">Sort: Exam Code</option>
              <option value="title">Sort: Title (A-Z)</option>
              <option value="level">Sort: Level</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl bg-slate-950/60 border border-white/15 p-0.5">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                  viewMode === 'grid' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Grid Card View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs flex items-center gap-1 transition-all ${
                  viewMode === 'table' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Table Matrix View"
              >
                <TableIcon className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick Filter Badges / Result Counter */}
          <div className="flex items-center justify-between text-xs text-slate-400 flex-wrap gap-2 pt-1 border-t border-white/5">
            <div className="flex items-center gap-2 flex-wrap">
              <span>Showing <strong className="text-white">{filteredCertifications.length}</strong> of <strong>{catalogData?.total || 151}</strong> certifications</span>
              {(selectedCategory !== 'All' || selectedLevel !== 'All' || selectedStatus !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('All');
                    setSelectedLevel('All');
                    setSelectedStatus('all');
                    setSelectedRole('All');
                  }}
                  className="text-[11px] text-cyan-400 hover:text-cyan-300 underline underline-offset-2 ml-2"
                >
                  Reset all filters
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">
                Fetched live from Microsoft Catalog API: {catalogData?.fetchedAt ? new Date(catalogData.fetchedAt).toLocaleTimeString() : 'Syncing...'}
              </span>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-950/40">
          
          {isLoading ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4">
              <div className="w-12 h-12 rounded-2xl liquid-glass-pill flex items-center justify-center border border-cyan-500/40 bg-cyan-500/20 animate-spin">
                <RotateCw className="w-6 h-6 text-cyan-400" />
              </div>
              <p className="text-slate-300 font-medium text-sm">Querying Microsoft Learn Catalog API for all 151 Certifications...</p>
            </div>
          ) : fetchError ? (
            <div className="h-96 flex flex-col items-center justify-center gap-4 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <p className="text-red-300 font-medium">{fetchError}</p>
              <button
                onClick={loadCatalog}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Retry Fetch
              </button>
            </div>
          ) : filteredCertifications.length === 0 ? (
            <div className="h-96 flex flex-col items-center justify-center gap-3 text-center">
              <Search className="w-10 h-10 text-slate-500" />
              <p className="text-slate-300 font-medium text-base">No certifications match your criteria</p>
              <p className="text-slate-400 text-xs max-w-sm">Try broadening your search query or switching categories to see all 151 Microsoft certifications.</p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedLevel('All');
                  setSelectedStatus('all');
                }}
                className="mt-2 px-4 py-2 rounded-xl bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold hover:bg-cyan-500/30 transition-all"
              >
                Clear all filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCertifications.map((cert) => {
                const completed = isCompleted(cert);
                const isSpecialty = cert.level_label === 'Specialty';
                const isExpert = cert.level_label === 'Expert';
                const isAssociate = cert.level_label === 'Associate';
                const isFundamentals = cert.level_label === 'Fundamentals';

                return (
                  <div
                    key={cert.uid}
                    className={`group relative rounded-2xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                      completed
                        ? 'bg-emerald-950/25 border-emerald-500/40 shadow-lg shadow-emerald-950/30'
                        : cert.is_retired
                        ? 'bg-slate-900/30 border-white/5 opacity-75 hover:opacity-100'
                        : 'bg-slate-900/60 border-white/10 hover:border-cyan-500/40 hover:shadow-xl hover:shadow-cyan-950/30 hover:bg-slate-900/80'
                    }`}
                  >
                    
                    {/* Top Row: Code Badge, Level Tag, Complete Toggle */}
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Exam Code Pill */}
                          <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg border font-mono ${
                            isExpert
                              ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                              : isSpecialty
                              ? 'bg-amber-950/60 text-amber-300 border-amber-500/40'
                              : isAssociate
                              ? 'bg-cyan-950/60 text-cyan-300 border-cyan-500/40'
                              : 'bg-blue-950/60 text-blue-300 border-blue-500/40'
                          }`}>
                            {cert.code}
                          </span>

                          {/* Level Pill */}
                          <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                            isExpert
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/30'
                              : isSpecialty
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : isAssociate
                              ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30'
                              : 'bg-blue-500/10 text-blue-300 border-blue-500/30'
                          }`}>
                            {cert.level_label}
                          </span>

                          {/* Retired Badge */}
                          {cert.is_retired && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
                              Retired
                            </span>
                          )}
                        </div>

                        {/* Complete Toggle Button */}
                        {onToggleComplete && (
                          <button
                            onClick={() => onToggleComplete(cert.code || cert.id, !completed)}
                            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
                              completed
                                ? 'bg-emerald-500 text-white border-emerald-400 shadow-md shadow-emerald-500/30'
                                : 'bg-white/5 text-slate-400 border-white/10 hover:text-emerald-300 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                            }`}
                            title={completed ? 'Marked as Completed' : 'Mark as Completed'}
                          >
                            {completed ? <Check className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                          </button>
                        )}
                      </div>

                      {/* Icon & Title */}
                      <div className="flex items-start gap-3.5 mb-3">
                        <div className="w-12 h-12 shrink-0 rounded-xl bg-white/5 border border-white/10 p-1 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                          <img
                            src={cert.icon_url}
                            alt={cert.title}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                        </div>
                        <div>
                          <h3 
                            onClick={() => setDetailCert(cert)}
                            className="text-sm font-bold text-white leading-snug group-hover:text-cyan-300 transition-colors cursor-pointer line-clamp-2"
                          >
                            {cert.title}
                          </h3>
                          <span className="text-[11px] text-cyan-400/80 font-medium block mt-0.5">
                            {cert.category}
                          </span>
                        </div>
                      </div>

                      {/* Description snippet */}
                      <p className="text-xs text-slate-300 line-clamp-3 mb-4 leading-relaxed font-normal">
                        {cert.plain_description || 'Microsoft Certified professional credential validating technical proficiency and skills.'}
                      </p>

                      {/* Roles / Products tags */}
                      <div className="flex items-center gap-1.5 flex-wrap mb-4">
                        {cert.roles.slice(0, 2).map((r) => (
                          <span key={r} className="text-[10px] px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10">
                            {r}
                          </span>
                        ))}
                        {cert.roles.length > 2 && (
                          <span className="text-[10px] text-slate-400">+{cert.roles.length - 2}</span>
                        )}
                      </div>
                    </div>

                    {/* Footer Actions */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setDetailCert(cert)}
                        className="text-xs text-slate-300 hover:text-cyan-300 font-medium flex items-center gap-1 transition-colors"
                      >
                        <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                        Details
                      </button>

                      <div className="flex items-center gap-1.5">
                        {onOpenStudyWithCert && (
                          <button
                            onClick={() => onOpenStudyWithCert(cert.title, cert.code)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-cyan-500/15 border border-cyan-400/30 text-cyan-200 hover:bg-cyan-500/25 hover:text-white transition-all flex items-center gap-1"
                            title="Open Study Assistant AI with this certification"
                          >
                            <Sparkles className="w-3 h-3 text-cyan-400" />
                            Study AI
                          </button>
                        )}

                        <a
                          href={cert.url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                          title="View on Microsoft Learn"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                  </div>
                );
              })}
            </div>

          ) : (

            /* TABLE MATRIX VIEW */
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-slate-900/60">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-300 uppercase tracking-wider font-semibold border-b border-white/10">
                    <tr>
                      <th className="px-4 py-3 w-10">Done</th>
                      <th className="px-4 py-3">Exam Code</th>
                      <th className="px-4 py-3">Certification Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Level</th>
                      <th className="px-4 py-3">Primary Role</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-slate-200">
                    {filteredCertifications.map((cert) => {
                      const completed = isCompleted(cert);
                      return (
                        <tr
                          key={cert.uid}
                          className={`hover:bg-cyan-500/5 transition-colors ${
                            completed ? 'bg-emerald-950/20' : ''
                          }`}
                        >
                          <td className="px-4 py-3">
                            {onToggleComplete && (
                              <button
                                onClick={() => onToggleComplete(cert.code || cert.id, !completed)}
                                className={`cursor-pointer ${completed ? 'text-emerald-400' : 'text-slate-500 hover:text-slate-300'}`}
                              >
                                {completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                              </button>
                            )}
                          </td>
                          <td className="px-4 py-3 font-mono font-bold text-cyan-300">
                            {cert.code}
                          </td>
                          <td className="px-4 py-3 font-medium text-white max-w-xs truncate">
                            <span 
                              onClick={() => setDetailCert(cert)}
                              className="cursor-pointer hover:text-cyan-300 transition-colors"
                            >
                              {cert.title}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {cert.category}
                          </td>
                          <td className="px-4 py-3">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/5 border border-white/10 text-slate-300">
                              {cert.level_label}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-300">
                            {cert.roles[0] || 'Specialist'}
                          </td>
                          <td className="px-4 py-3">
                            {cert.is_retired ? (
                              <span className="text-[10px] text-red-400 font-semibold px-2 py-0.5 rounded bg-red-500/10 border border-red-500/20">Retired</span>
                            ) : (
                              <span className="text-[10px] text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20">Active</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              {onOpenStudyWithCert && (
                                <button
                                  onClick={() => onOpenStudyWithCert(cert.title, cert.code)}
                                  className="p-1 rounded text-cyan-300 hover:bg-cyan-500/20"
                                  title="Study AI"
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <a
                                href={cert.url}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1 rounded text-slate-400 hover:text-white hover:bg-white/10"
                                title="Open in Microsoft Learn"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          )}

        </div>

        {/* Footer Status */}
        <div className="px-6 py-3 border-t border-white/10 bg-slate-950/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">Microsoft Learn Catalog Integration</span>
            <span>•</span>
            <span>151 Official Certifications Live Database</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium transition-all"
          >
            Done
          </button>
        </div>

      </div>

      {/* DETAIL DRAWER / POPUP */}
      {detailCert && (
        <div 
          className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150"
          onClick={() => setDetailCert(null)}
        >
          <div 
            className="w-full max-w-2xl max-h-[85vh] flex flex-col rounded-3xl liquid-glass border border-cyan-400/40 shadow-2xl p-6 text-slate-100 overflow-y-auto custom-scrollbar"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/15 p-2 flex items-center justify-center shrink-0">
                  <img
                    src={detailCert.icon_url}
                    alt={detailCert.title}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-extrabold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                      {detailCert.code}
                    </span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                      {detailCert.level_label}
                    </span>
                    {detailCert.is_retired && (
                      <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                        Retired
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-black text-white mt-1">
                    {detailCert.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={() => setDetailCert(null)}
                className="p-1.5 rounded-xl bg-white/5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metadata tags */}
            <div className="py-4 border-b border-white/10 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Category</span>
                <span className="font-semibold text-white">{detailCert.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Certification Type</span>
                <span className="font-semibold text-white capitalize">{detailCert.certification_type}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Roles</span>
                <span className="font-semibold text-white">{detailCert.roles.join(', ') || 'Specialist'}</span>
              </div>
            </div>

            {/* Description */}
            <div className="py-4 border-b border-white/10">
              <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">Overview & Requirements</h4>
              <div 
                className="text-xs text-slate-300 leading-relaxed space-y-2 prose prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-5 [&_a]:text-cyan-400 [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: detailCert.html_description || detailCert.plain_description }}
              />
            </div>

            {/* Associated Exams */}
            {detailCert.exams && detailCert.exams.length > 0 && (
              <div className="py-4 border-b border-white/10">
                <h4 className="text-xs font-bold text-cyan-300 uppercase tracking-wider mb-2">Required Exams ({detailCert.exams.length})</h4>
                <div className="space-y-2">
                  {detailCert.exams.map((ex) => (
                    <div key={ex.uid} className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 text-xs">
                      <div>
                        <span className="font-mono font-bold text-cyan-300 mr-2">{ex.code}</span>
                        <span className="text-slate-200">{ex.title}</span>
                      </div>
                      {ex.url && (
                        <a
                          href={ex.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-cyan-400 hover:text-cyan-300 flex items-center gap-1 text-[11px]"
                        >
                          Exam Page <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-4 flex items-center justify-between gap-3">
              {onToggleComplete && (
                <button
                  onClick={() => {
                    const completed = isCompleted(detailCert);
                    onToggleComplete(detailCert.code || detailCert.id, !completed);
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    isCompleted(detailCert)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-white/10 text-white hover:bg-emerald-500/20 hover:text-emerald-300'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isCompleted(detailCert) ? 'Completed (Click to unmark)' : 'Mark as Completed'}
                </button>
              )}

              <div className="flex items-center gap-2">
                {onOpenStudyWithCert && (
                  <button
                    onClick={() => {
                      onOpenStudyWithCert(detailCert.title, detailCert.code);
                      setDetailCert(null);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Study with AI
                  </button>
                )}

                <a
                  href={detailCert.url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-1.5"
                >
                  Microsoft Learn <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
