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
  id: string; // formatted key (e.g. "az-900" or normalized uid)
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

// In-memory cache
let cachedCatalog: CatalogResponse | null = null;
let lastFetchTime = 0;
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// Mapping from catalog certification uid to primary standard exam code
const UID_TO_EXAM_CODE: Record<string, string> = {
  'certification.azure-fundamentals': 'AZ-900',
  'certification.azure-administrator': 'AZ-104',
  'certification.azure-developer': 'AZ-204',
  'certification.azure-solutions-architect': 'AZ-305',
  'certification.devops-engineer': 'AZ-400',
  'certification.azure-security-engineer': 'AZ-500',
  'certification.azure-network-engineer-associate': 'AZ-700',
  'certification.azure-for-sap-workloads-specialty': 'AZ-120',
  'certification.azure-virtual-desktop-specialty': 'AZ-140',
  'certification.azure-stack-hub-operator': 'AZ-600',
  'certification.azure-ai-fundamentals': 'AI-900',
  'certification.azure-ai-engineer': 'AI-102',
  'certification.azure-data-fundamentals': 'DP-900',
  'certification.azure-data-engineer': 'DP-203',
  'certification.azure-data-scientist': 'DP-100',
  'certification.fabric-analytics-engineer': 'DP-600',
  'certification.azure-cosmos-db-developer-specialty': 'DP-420',
  'certification.azure-enterprise-data-analyst-associate': 'DP-500',
  'certification.security-compliance-and-identity-fundamentals': 'SC-900',
  'certification.security-operations-analyst': 'SC-200',
  'certification.identity-and-access-administrator': 'SC-300',
  'certification.information-protection-and-compliance-administrator': 'SC-400',
  'certification.cybersecurity-architect': 'SC-100',
  'certification.power-platform-fundamentals': 'PL-900',
  'certification.power-bi-data-analyst': 'PL-300',
  'certification.power-platform-app-maker': 'PL-100',
  'certification.power-platform-developer': 'PL-400',
  'certification.power-automate-rpa-developer': 'PL-500',
  'certification.power-platform-solution-architect': 'PL-600',
  'certification.power-platform-functional-consultant-associate': 'PL-200',
  'certification.m365-fundamentals': 'MS-900',
  'certification.m365-administrator': 'MS-102',
  'certification.m365-endpoint-administrator': 'MD-102',
  'certification.m365-teams-administrator-associate': 'MS-700',
  'certification.m365-collaboration-communications-systems-engineer': 'MS-721',
  'certification.m365-security-administrator': 'MS-500',
  'certification.m365-messaging-administrator': 'MS-203',
  'certification.m365-developer-associate': 'MS-600',
  'certification.d365-fundamentals': 'MB-901',
  'certification.d365-fundamentals-crm': 'MB-910',
  'certification.d365-fundamentals-erp': 'MB-920',
  'certification.d365-business-central-functional-consultant': 'MB-800',
  'certification.d365-finance-functional-consultant': 'MB-310',
  'certification.d365-supply-chain-management-functional-consultant': 'MB-330',
  'certification.d365-sales-functional-consultant': 'MB-210',
  'certification.d365-customer-service-functional-consultant': 'MB-230',
  'certification.d365-field-service-functional-consultant': 'MB-240',
  'certification.d365-finance-and-operations-apps-developer': 'MB-500',
  'certification.d365-finance-and-operations-apps-solution-architect-expert': 'MB-700',
  'certification.d365-solutions-architect-expert': 'MB-600',
  'certification.copilot-for-sales-solution-architect': 'MS-400',
  'certification.windows-server-hybrid-administrator': 'AZ-800',
};

// Human-friendly role names
const ROLE_NAMES: Record<string, string> = {
  'administrator': 'Administrator',
  'ai-edge-engineer': 'AI Edge Engineer',
  'ai-engineer': 'AI Engineer',
  'auditor': 'Auditor',
  'business-analyst': 'Business Analyst',
  'business-leader': 'Business Leader',
  'business-owner': 'Business Owner',
  'business-user': 'Business User',
  'data-analyst': 'Data Analyst',
  'data-engineer': 'Data Engineer',
  'data-scientist': 'Data Scientist',
  'database-administrator': 'Database Administrator',
  'developer': 'Developer',
  'devops-engineer': 'DevOps Engineer',
  'functional-consultant': 'Functional Consultant',
  'identity-access-admin': 'Identity & Access Admin',
  'ip-admin': 'IP Admin',
  'maker': 'App Maker',
  'network-engineer': 'Network Engineer',
  'platform-engineer': 'Platform Engineer',
  'risk-practitioner': 'Risk Practitioner',
  'security-engineer': 'Security Engineer',
  'security-operations-analyst': 'Security Operations Analyst',
  'solution-architect': 'Solution Architect',
  'student': 'Student',
  'support-engineer': 'Support Engineer',
  'technology-manager': 'Technology Manager',
};

function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

function determineCategory(title: string, uid: string, type: string): string {
  const lower = (title + ' ' + uid).toLowerCase();
  
  if (type === 'mos' || lower.includes('office') || lower.includes('word') || lower.includes('excel') || lower.includes('powerpoint') || lower.includes('access') || lower.includes('outlook')) {
    return 'Microsoft Office Specialist (MOS)';
  }
  if (type === 'mcsa' || type === 'mcse' || type === 'mcsd' || type === 'mta') {
    return 'Legacy MCSA / MCSE / MTA';
  }
  if (lower.includes('ai-') || lower.includes('azure ai') || lower.includes('openai') || lower.includes('data scientist') || lower.includes('ai transformation') || lower.includes('machine learning')) {
    return 'AI & Machine Learning';
  }
  if (lower.includes('dp-') || lower.includes('data engineer') || lower.includes('fabric') || lower.includes('cosmos db') || lower.includes('data analyst') || lower.includes('sql server')) {
    return 'Data & Analytics (Fabric)';
  }
  if (lower.includes('sc-') || lower.includes('security') || lower.includes('sentinel') || lower.includes('identity') || lower.includes('compliance') || lower.includes('cybersecurity') || lower.includes('az-500')) {
    return 'Security, Compliance & Identity';
  }
  if (lower.includes('pl-') || lower.includes('power platform') || lower.includes('power bi') || lower.includes('power apps') || lower.includes('power automate') || lower.includes('app maker') || lower.includes('copilot studio')) {
    return 'Power Platform & Copilot';
  }
  if (lower.includes('mb-') || lower.includes('dynamics 365') || lower.includes('business central') || lower.includes('supply chain') || lower.includes('finance')) {
    return 'Dynamics 365 ERP & CRM';
  }
  if (lower.includes('ms-') || lower.includes('md-') || lower.includes('microsoft 365') || lower.includes('m365') || lower.includes('teams') || lower.includes('endpoint')) {
    return 'Microsoft 365 & Modern Work';
  }
  if (lower.includes('az-') || lower.includes('azure') || lower.includes('cloud') || lower.includes('devops') || lower.includes('sap') || lower.includes('virtual desktop')) {
    return 'Azure Cloud & Infrastructure';
  }
  
  return 'Microsoft Certified General';
}

function determineLevelLabel(levels: string[] = [], type: string): 'Fundamentals' | 'Associate' | 'Expert' | 'Specialty' | 'General' {
  if (type === 'fundamentals' || levels.includes('beginner')) {
    return 'Fundamentals';
  }
  if (type === 'specialty') {
    return 'Specialty';
  }
  if (levels.includes('advanced') || type === 'mcse' || type === 'mcsd') {
    return 'Expert';
  }
  if (levels.includes('intermediate') || type === 'role-based' || type === 'mcsa') {
    return 'Associate';
  }
  return 'General';
}

export async function fetchMicrosoftCatalog(): Promise<CatalogResponse> {
  const now = Date.now();
  if (cachedCatalog && now - lastFetchTime < CACHE_TTL_MS) {
    return cachedCatalog;
  }

  try {
    const res = await fetch('https://learn.microsoft.com/api/catalog/', {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'MicrosoftLearningPathTracker/2.5',
      },
    });

    if (!res.ok) {
      throw new Error(`Catalog API responded with status ${res.status}`);
    }

    const data: any = await res.json();
    const rawCerts: any[] = data.certifications || [];
    const rawExams: any[] = data.exams || [];

    // Map exams
    const examMap = new Map<string, CatalogExam>();
    rawExams.forEach((e: any) => {
      examMap.set(e.uid, {
        uid: e.uid,
        title: e.title || '',
        code: e.display_name || e.uid.replace('exam.', '').toUpperCase(),
        url: e.url || '',
        icon_url: e.icon_url,
        pdf_download_url: e.pdf_download_url,
      });
    });

    // Parse all certifications
    const parsedCerts: CatalogCertification[] = rawCerts.map((c: any) => {
      // Linked exams
      const linkedExams: CatalogExam[] = (c.exams || []).map((eUid: string) => {
        const found = examMap.get(eUid);
        if (found) return found;
        return {
          uid: eUid,
          title: eUid.replace('exam.', ''),
          code: eUid.replace('exam.', '').toUpperCase(),
          url: `https://learn.microsoft.com/en-us/credentials/certifications/exams/${eUid.replace('exam.', '')}/`,
        };
      });

      // Primary Code Resolution
      let code = UID_TO_EXAM_CODE[c.uid];
      if (!code && linkedExams.length > 0) {
        code = linkedExams[0].code;
      }
      if (!code) {
        const match = (c.title + ' ' + (c.subtitle || '')).match(/\b(AZ-\d{3}|AI-\d{3}|DP-\d{3}|SC-\d{3}|PL-\d{3}|MS-\d{3}|MD-\d{3}|MB-\d{3}|WS-\d{3}|70-\d{3}|98-\d{3}|MO-\d{3})\b/i);
        if (match) {
          code = match[1].toUpperCase();
        }
      }
      if (!code) {
        // Fallback short code based on title or type
        if (c.certification_type === 'mos') {
          code = 'MOS';
        } else if (c.certification_type === 'mcsa') {
          code = 'MCSA';
        } else if (c.certification_type === 'mcse') {
          code = 'MCSE';
        } else if (c.certification_type === 'mta') {
          code = 'MTA';
        } else {
          code = 'MS-CERT';
        }
      }

      const isRetired = (c.subtitle || '').toLowerCase().includes('retired') || (c.title || '').toLowerCase().includes('retired');
      const plainDesc = stripHtml(c.subtitle || '');
      const category = determineCategory(c.title || '', c.uid, c.certification_type);
      const levelLabel = determineLevelLabel(c.levels, c.certification_type);

      const rolesFormatted = (c.roles || []).map((r: string) => ROLE_NAMES[r] || r);
      const productsFormatted = (c.products || []).map((p: string) => p.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));

      return {
        uid: c.uid,
        id: c.uid.replace('certification.', ''),
        title: c.title || 'Untitled Certification',
        code,
        exam_code: code,
        certification_type: c.certification_type || 'role-based',
        levels: c.levels || [],
        level_label: levelLabel,
        roles: rolesFormatted,
        products: productsFormatted,
        category,
        url: c.url || 'https://learn.microsoft.com/en-us/credentials/',
        icon_url: c.icon_url || 'https://learn.microsoft.com/en-us/media/learn/certification/badges/microsoft-certified-associate-badge.svg',
        is_retired: isRetired,
        exams: linkedExams,
        plain_description: plainDesc,
        html_description: c.subtitle || '',
        last_modified: c.last_modified || new Date().toISOString(),
      };
    });

    // Compute aggregates
    const catMap = new Map<string, number>();
    const roleMap = new Map<string, number>();
    const levelMap = new Map<string, number>();
    const typeMap = new Map<string, number>();

    let activeCount = 0;
    let retiredCount = 0;

    parsedCerts.forEach(c => {
      if (c.is_retired) retiredCount++;
      else activeCount++;

      catMap.set(c.category, (catMap.get(c.category) || 0) + 1);
      levelMap.set(c.level_label, (levelMap.get(c.level_label) || 0) + 1);
      typeMap.set(c.certification_type, (typeMap.get(c.certification_type) || 0) + 1);

      c.roles.forEach(r => {
        roleMap.set(r, (roleMap.get(r) || 0) + 1);
      });
    });

    const response: CatalogResponse = {
      total: parsedCerts.length,
      activeCount,
      retiredCount,
      certifications: parsedCerts,
      categories: Array.from(catMap.entries()).map(([name, count]) => ({ id: name, name, count })).sort((a, b) => b.count - a.count),
      roles: Array.from(roleMap.entries()).map(([name, count]) => ({ id: name, name, count })).sort((a, b) => b.count - a.count),
      levels: Array.from(levelMap.entries()).map(([name, count]) => ({ id: name, name, count })).sort((a, b) => b.count - a.count),
      certificationTypes: Array.from(typeMap.entries()).map(([name, count]) => ({ id: name, name, count })).sort((a, b) => b.count - a.count),
      fetchedAt: new Date().toISOString(),
      isLive: true,
    };

    cachedCatalog = response;
    lastFetchTime = now;
    return response;
  } catch (err) {
    console.error('Error fetching Microsoft Catalog API:', err);
    if (cachedCatalog) {
      return { ...cachedCatalog, isLive: false };
    }
    throw err;
  }
}
