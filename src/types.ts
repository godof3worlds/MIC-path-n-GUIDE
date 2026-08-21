export type CertLevel = 'Fundamentals' | 'Associate' | 'Expert' | 'Specialty';

export type CertStatus = 'completed' | 'available' | 'locked';

export interface Certification {
  id: string;
  code: string;
  title: string;
  domain: string;
  domainName: string;
  level: CertLevel;
  prerequisites: string[]; // List of prerequisite cert IDs
  microsoft_learn_url: string;
  description: string;
  skills_measured: string[];
  exam_code: string;
  estimated_hours: number;
  badge_color: string;
  glow_color: string;
  order_rank: number;
}

export interface DomainInfo {
  id: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accentColor: string;
  glowColor: string;
  badgeColor: string;
  totalCerts: number;
}

export interface CertWithProgress extends Certification {
  status: CertStatus;
  completedAt?: string | null;
  missingPrerequisites?: string[]; // IDs of prerequisites not yet completed
}

export interface ProgressSummary {
  userId: string;
  domain: string;
  totalCerts: number;
  completedCount: number;
  availableCount: number;
  lockedCount: number;
  percentage: number;
  estimatedHoursRemaining: number;
  estimatedHoursCompleted: number;
  certifications: CertWithProgress[];
  nextRecommendedCert: CertWithProgress | null;
}

export interface ExplainRequest {
  current_step: {
    id: string;
    title: string;
    code: string;
    domain?: string;
  };
  completed_certs: Array<{
    id: string;
    title: string;
    code: string;
  }>;
}

export interface ExplainResponse {
  cert_id: string;
  explanation: string;
  is_fallback?: boolean;
  model?: string;
  suggested_focus_areas?: string[];
}

export interface CatalogExam {
  uid: string;
  title: string;
  code: string;
  url: string;
  icon_url?: string;
  pdf_download_url?: string;
}

export interface CatalogCertification {
  uid: string;
  id: string;
  title: string;
  code: string;
  exam_code: string;
  certification_type: string;
  levels: string[];
  level_label: 'Fundamentals' | 'Associate' | 'Expert' | 'Specialty' | 'General';
  roles: string[];
  products: string[];
  category: string;
  url: string;
  icon_url: string;
  is_retired: boolean;
  exams: CatalogExam[];
  plain_description: string;
  html_description: string;
  last_modified: string;
}

export interface CatalogResponse {
  total: number;
  activeCount: number;
  retiredCount: number;
  certifications: CatalogCertification[];
  categories: { id: string; name: string; count: number }[];
  roles: { id: string; name: string; count: number }[];
  levels: { id: string; name: string; count: number }[];
  certificationTypes: { id: string; name: string; count: number }[];
  fetchedAt: string;
  isLive: boolean;
}
