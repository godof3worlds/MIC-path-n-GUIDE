import { Certification } from '../types';

export type BadgeTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';
export type BadgeCategory = 'Foundations' | 'Domain Mastery' | 'Expertise' | 'Achievements';

export interface Badge {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  tier: BadgeTier;
  category: BadgeCategory;
  iconName: string;
  accentColor: string;
  requirementDescription: string;
  checkUnlocked: (completedCerts: Certification[], totalHours: number, domainsCovered: string[]) => {
    isUnlocked: boolean;
    currentProgress: number;
    maxProgress: number;
    progressLabel: string;
  };
}

export const BADGES_CATALOG: Badge[] = [
  {
    id: 'first-step',
    title: 'First Milestone',
    subtitle: 'Cloud Explorer',
    description: 'Awarded for achieving your first Microsoft Certification credential.',
    tier: 'Bronze',
    category: 'Foundations',
    iconName: 'Compass',
    accentColor: '#38bdf8',
    requirementDescription: 'Complete at least 1 certification exam.',
    checkUnlocked: (certs) => ({
      isUnlocked: certs.length >= 1,
      currentProgress: Math.min(certs.length, 1),
      maxProgress: 1,
      progressLabel: `${Math.min(certs.length, 1)}/1 Certs`,
    }),
  },
  {
    id: 'foundations-master',
    title: 'Foundations Vanguard',
    subtitle: 'Fundamental Knowledge',
    description: 'Mastered 2 or more Microsoft 900-series foundational certifications (AZ-900, AI-900, DP-900, SC-900, PL-900).',
    tier: 'Silver',
    category: 'Foundations',
    iconName: 'Layers',
    accentColor: '#818cf8',
    requirementDescription: 'Earn 2 Fundamentals level certifications.',
    checkUnlocked: (certs) => {
      const count = certs.filter(c => c.level === 'Fundamentals').length;
      return {
        isUnlocked: count >= 2,
        currentProgress: Math.min(count, 2),
        maxProgress: 2,
        progressLabel: `${Math.min(count, 2)}/2 Fundamentals`,
      };
    },
  },
  {
    id: 'azure-cloud-specialist',
    title: 'Azure Cloud Sentinel',
    subtitle: 'Infrastructure Champion',
    description: 'Demonstrated hands-on mastery in core Azure compute, networking, and security governance.',
    tier: 'Silver',
    category: 'Domain Mastery',
    iconName: 'Cloud',
    accentColor: '#0ea5e9',
    requirementDescription: 'Complete AZ-104 (Azure Administrator) or AZ-900.',
    checkUnlocked: (certs) => {
      const hasAZ104 = certs.some(c => c.code === 'AZ-104' || c.code === 'AZ-900');
      return {
        isUnlocked: hasAZ104,
        currentProgress: hasAZ104 ? 1 : 0,
        maxProgress: 1,
        progressLabel: hasAZ104 ? 'Completed' : '0/1 Certs',
      };
    },
  },
  {
    id: 'solutions-architect-elite',
    title: 'Architectural Virtuoso',
    subtitle: 'Enterprise Solutions',
    description: 'Attained the prestigious AZ-305 Solutions Architect certification for designing resilient multi-tier cloud architectures.',
    tier: 'Diamond',
    category: 'Expertise',
    iconName: 'Crown',
    accentColor: '#f59e0b',
    requirementDescription: 'Complete AZ-305 (Azure Solutions Architect Expert).',
    checkUnlocked: (certs) => {
      const hasAZ305 = certs.some(c => c.code === 'AZ-305');
      return {
        isUnlocked: hasAZ305,
        currentProgress: hasAZ305 ? 1 : 0,
        maxProgress: 1,
        progressLabel: hasAZ305 ? 'Mastered' : '0/1 AZ-305',
      };
    },
  },
  {
    id: 'devops-continuous-delivery',
    title: 'DevOps Automation Hero',
    subtitle: 'CI/CD & GitOps',
    description: 'Mastered automated release pipelines, infrastructure as code, and site reliability engineering.',
    tier: 'Gold',
    category: 'Expertise',
    iconName: 'GitMerge',
    accentColor: '#10b981',
    requirementDescription: 'Complete AZ-400 (DevOps Engineer Expert).',
    checkUnlocked: (certs) => {
      const hasAZ400 = certs.some(c => c.code === 'AZ-400');
      return {
        isUnlocked: hasAZ400,
        currentProgress: hasAZ400 ? 1 : 0,
        maxProgress: 1,
        progressLabel: hasAZ400 ? 'Mastered' : '0/1 AZ-400',
      };
    },
  },
  {
    id: 'ai-cognitive-master',
    title: 'AI Intelligence Architect',
    subtitle: 'GenAI & Cognitive Services',
    description: 'Earned AI-900 or AI-102 validating expertise in neural networks, computer vision, and generative AI models.',
    tier: 'Gold',
    category: 'Domain Mastery',
    iconName: 'Sparkles',
    accentColor: '#a855f7',
    requirementDescription: 'Complete AI-900 or AI-102 certification.',
    checkUnlocked: (certs) => {
      const aiCount = certs.filter(c => c.domain === 'ai' || c.code.startsWith('AI-')).length;
      return {
        isUnlocked: aiCount >= 1,
        currentProgress: Math.min(aiCount, 1),
        maxProgress: 1,
        progressLabel: `${Math.min(aiCount, 1)}/1 AI Certs`,
      };
    },
  },
  {
    id: 'security-guardian',
    title: 'Zero Trust Guardian',
    subtitle: 'Cybersecurity & IAM',
    description: 'Demonstrated mastery in Microsoft Entra ID, Microsoft Sentinel SIEM, and Defender XDR threat protection.',
    tier: 'Gold',
    category: 'Domain Mastery',
    iconName: 'ShieldCheck',
    accentColor: '#ec4899',
    requirementDescription: 'Complete SC-900 or SC-200 security certification.',
    checkUnlocked: (certs) => {
      const secCount = certs.filter(c => c.domain === 'security' || c.code.startsWith('SC-')).length;
      return {
        isUnlocked: secCount >= 1,
        currentProgress: Math.min(secCount, 1),
        maxProgress: 1,
        progressLabel: `${Math.min(secCount, 1)}/1 Security Certs`,
      };
    },
  },
  {
    id: 'data-lakehouse-pioneer',
    title: 'Data Fabric Alchemist',
    subtitle: 'Analytics & Big Data',
    description: 'Validated enterprise data engineering across Azure Synapse, Microsoft Fabric, and Cosmos DB.',
    tier: 'Gold',
    category: 'Domain Mastery',
    iconName: 'Database',
    accentColor: '#06b6d4',
    requirementDescription: 'Complete DP-900, DP-203, or DP-600 certification.',
    checkUnlocked: (certs) => {
      const dataCount = certs.filter(c => c.domain === 'data' || c.code.startsWith('DP-')).length;
      return {
        isUnlocked: dataCount >= 1,
        currentProgress: Math.min(dataCount, 1),
        maxProgress: 1,
        progressLabel: `${Math.min(dataCount, 1)}/1 Data Certs`,
      };
    },
  },
  {
    id: 'multi-track-polymath',
    title: 'Multi-Cloud Polymath',
    subtitle: 'Cross-Domain Mastery',
    description: 'Expanded expertise across 3 or more distinct Microsoft cloud domains.',
    tier: 'Diamond',
    category: 'Achievements',
    iconName: 'Globe',
    accentColor: '#3b82f6',
    requirementDescription: 'Complete credentials across 3 distinct domain tracks.',
    checkUnlocked: (certs) => {
      const uniqueDomains = new Set(certs.map(c => c.domain)).size;
      return {
        isUnlocked: uniqueDomains >= 3,
        currentProgress: Math.min(uniqueDomains, 3),
        maxProgress: 3,
        progressLabel: `${Math.min(uniqueDomains, 3)}/3 Tracks`,
      };
    },
  },
  {
    id: 'century-scholar',
    title: 'Century Study Scholar',
    subtitle: '100+ Hours Dedicated',
    description: 'Logged over 100 estimated curriculum study hours in successfully mastered certifications.',
    tier: 'Gold',
    category: 'Achievements',
    iconName: 'Flame',
    accentColor: '#f97316',
    requirementDescription: 'Accumulate 100+ hours of certified study effort.',
    checkUnlocked: (certs) => {
      const hours = certs.reduce((sum, c) => sum + c.estimated_hours, 0);
      return {
        isUnlocked: hours >= 100,
        currentProgress: Math.min(hours, 100),
        maxProgress: 100,
        progressLabel: `${hours}/100 Hours`,
      };
    },
  },
  {
    id: 'grandmaster-5-certs',
    title: 'Microsoft Grandmaster',
    subtitle: '5+ Certified Milestones',
    description: 'Completed 5 or more official Microsoft certifications, placing you in the top tier of technical cloud professionals.',
    tier: 'Diamond',
    category: 'Achievements',
    iconName: 'Trophy',
    accentColor: '#eab308',
    requirementDescription: 'Earn 5 or more total certifications.',
    checkUnlocked: (certs) => ({
      isUnlocked: certs.length >= 5,
      currentProgress: Math.min(certs.length, 5),
      maxProgress: 5,
      progressLabel: `${Math.min(certs.length, 5)}/5 Certs`,
    }),
  },
  {
    id: 'power-platform-automator',
    title: 'Low-Code Automator',
    subtitle: 'Power Platform & Apps',
    description: 'Mastered automated business processes, Power BI reporting, and Power Apps solutions.',
    tier: 'Silver',
    category: 'Domain Mastery',
    iconName: 'Cpu',
    accentColor: '#14b8a6',
    requirementDescription: 'Complete PL-900 or Power Platform certification.',
    checkUnlocked: (certs) => {
      const plCount = certs.filter(c => c.domain === 'power' || c.code.startsWith('PL-')).length;
      return {
        isUnlocked: plCount >= 1,
        currentProgress: Math.min(plCount, 1),
        maxProgress: 1,
        progressLabel: `${Math.min(plCount, 1)}/1 PL Certs`,
      };
    },
  },
];
