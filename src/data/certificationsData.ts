import { Certification, DomainInfo } from '../types';

export const DOMAINS: DomainInfo[] = [
  {
    id: 'cloud',
    name: 'Cloud & Infrastructure',
    tagline: 'Azure Core, Administration & Solutions Architecture',
    description: 'Master enterprise cloud design, Azure management, hybrid networking, and scalable DevOps automation.',
    icon: 'Cloud',
    accentColor: 'from-cyan-500 to-blue-600',
    glowColor: 'rgba(6, 182, 212, 0.45)',
    badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
    totalCerts: 6,
  },
  {
    id: 'ai-data',
    name: 'AI & Data Engineering',
    tagline: 'Azure AI, OpenAI, Data Science & Analytics Fabric',
    description: 'Build enterprise cognitive search, generative AI solutions, Big Data pipelines, and analytics on Microsoft Fabric.',
    icon: 'BrainCircuit',
    accentColor: 'from-purple-500 to-pink-600',
    glowColor: 'rgba(192, 38, 211, 0.45)',
    badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
    totalCerts: 6,
  },
  {
    id: 'security',
    name: 'Security & Compliance',
    tagline: 'Zero-Trust, Identity, Threat Protection & Sentinel',
    description: 'Implement Zero-Trust access architecture, security operation centers, Microsoft Sentinel, and regulatory compliance.',
    icon: 'ShieldCheck',
    accentColor: 'from-emerald-500 to-teal-600',
    glowColor: 'rgba(16, 185, 129, 0.45)',
    badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
    totalCerts: 5,
  },
  {
    id: 'power-platform',
    name: 'Power Platform & Modern Work',
    tagline: 'Low-Code, Copilot Studio, Power BI & App Automation',
    description: 'Accelerate digital business workflows with Power Apps, Power BI dashboards, automated cloud flows, and Copilots.',
    icon: 'Zap',
    accentColor: 'from-amber-500 to-orange-600',
    glowColor: 'rgba(245, 158, 11, 0.45)',
    badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
    totalCerts: 5,
  }
];

export const CERTIFICATIONS: Certification[] = [
  // ----------------------------------------------------
  // CLOUD & INFRASTRUCTURE (AZURE)
  // ----------------------------------------------------
  {
    id: 'az-900',
    code: 'AZ-900',
    title: 'Microsoft Azure Fundamentals',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Fundamentals',
    prerequisites: [],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-fundamentals/',
    description: 'Foundational knowledge of cloud concepts, Azure architectural components, governance, identity, and compliance.',
    skills_measured: [
      'Describe cloud concepts (25-30%)',
      'Describe Azure architecture and services (35-40%)',
      'Describe Azure management and governance (30-35%)'
    ],
    exam_code: 'Exam AZ-900',
    estimated_hours: 18,
    badge_color: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/30',
    glow_color: 'rgba(6, 182, 212, 0.35)',
    order_rank: 1
  },
  {
    id: 'az-104',
    code: 'AZ-104',
    title: 'Microsoft Azure Administrator',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Associate',
    prerequisites: ['az-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-administrator/',
    description: 'Implement, manage, and monitor Azure identity, governance, storage, compute, and virtual networks in cloud environments.',
    skills_measured: [
      'Manage Azure identities and governance (20-25%)',
      'Implement and manage storage (15-20%)',
      'Deploy and manage compute resources (20-25%)',
      'Configure and manage virtual networking (20-25%)',
      'Monitor and maintain Azure resources (10-15%)'
    ],
    exam_code: 'Exam AZ-104',
    estimated_hours: 35,
    badge_color: 'border-blue-500/30 text-blue-300 bg-blue-950/30',
    glow_color: 'rgba(59, 130, 246, 0.35)',
    order_rank: 2
  },
  {
    id: 'az-204',
    code: 'AZ-204',
    title: 'Developing Solutions for Microsoft Azure',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Associate',
    prerequisites: ['az-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-developer/',
    description: 'Design, build, test, and maintain cloud applications, serverless Azure Functions, Cosmos DB, and containerized apps.',
    skills_measured: [
      'Develop Azure compute solutions (25-30%)',
      'Develop for Azure storage (15-20%)',
      'Implement Azure security (15-20%)',
      'Monitor, troubleshoot, and optimize solutions (10-15%)',
      'Connect to and consume Azure and 3rd-party services (20-25%)'
    ],
    exam_code: 'Exam AZ-204',
    estimated_hours: 40,
    badge_color: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/30',
    glow_color: 'rgba(99, 102, 241, 0.35)',
    order_rank: 3
  },
  {
    id: 'az-700',
    code: 'AZ-700',
    title: 'Designing and Implementing Azure Networking Solutions',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Associate',
    prerequisites: ['az-104'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-network-engineer-associate/',
    description: 'Planning, implementing, and maintaining Azure networking solutions including core routing, VPNs, ExpressRoute, and private endpoints.',
    skills_measured: [
      'Design and implement core networking infrastructure (20-25%)',
      'Design, implement, and manage connectivity services (20-25%)',
      'Design and implement application delivery services (20-25%)',
      'Design and implement private access to Azure services (15-20%)'
    ],
    exam_code: 'Exam AZ-700',
    estimated_hours: 30,
    badge_color: 'border-sky-500/30 text-sky-300 bg-sky-950/30',
    glow_color: 'rgba(14, 165, 233, 0.35)',
    order_rank: 4
  },
  {
    id: 'az-305',
    code: 'AZ-305',
    title: 'Designing Microsoft Azure Infrastructure Solutions (Expert)',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Expert',
    prerequisites: ['az-104'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/',
    description: 'High-level cloud solutions architecture: governance, compute, data storage, high availability, business continuity, and migrations.',
    skills_measured: [
      'Design identity, governance, and monitoring solutions (25-30%)',
      'Design data storage solutions (20-25%)',
      'Design business continuity solutions (15-20%)',
      'Design infrastructure solutions (30-35%)'
    ],
    exam_code: 'Exam AZ-305',
    estimated_hours: 50,
    badge_color: 'border-violet-500/30 text-violet-300 bg-violet-950/30',
    glow_color: 'rgba(139, 92, 246, 0.45)',
    order_rank: 5
  },
  {
    id: 'az-400',
    code: 'AZ-400',
    title: 'Designing and Implementing Microsoft DevOps Solutions (Expert)',
    domain: 'cloud',
    domainName: 'Cloud & Infrastructure',
    level: 'Expert',
    prerequisites: ['az-104', 'az-204'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/devops-engineer/',
    description: 'Combine people, process, and technologies to continuously deliver valuable products using Azure DevOps, GitHub Actions, and IaC.',
    skills_measured: [
      'Configure processes and communications (10-15%)',
      'Design and implement source control (15-20%)',
      'Design and implement build and release pipelines (40-45%)',
      'Develop a security and compliance plan (10-15%)',
      'Implement an instrumentation strategy (10-15%)'
    ],
    exam_code: 'Exam AZ-400',
    estimated_hours: 55,
    badge_color: 'border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-950/30',
    glow_color: 'rgba(217, 70, 239, 0.45)',
    order_rank: 6
  },

  // ----------------------------------------------------
  // AI & DATA ENGINEERING
  // ----------------------------------------------------
  {
    id: 'ai-900',
    code: 'AI-900',
    title: 'Microsoft Azure AI Fundamentals',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Fundamentals',
    prerequisites: [],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-fundamentals/',
    description: 'Fundamental principles of machine learning, computer vision, natural language processing, conversational AI, and responsible generative AI.',
    skills_measured: [
      'Describe Artificial Intelligence workloads and considerations (15-20%)',
      'Describe fundamental principles of machine learning on Azure (20-25%)',
      'Describe features of computer vision workloads on Azure (15-20%)',
      'Describe features of Natural Language Processing workloads (15-20%)',
      'Describe features of generative AI workloads on Azure (15-20%)'
    ],
    exam_code: 'Exam AI-900',
    estimated_hours: 15,
    badge_color: 'border-purple-500/30 text-purple-300 bg-purple-950/30',
    glow_color: 'rgba(168, 85, 247, 0.35)',
    order_rank: 1
  },
  {
    id: 'dp-900',
    code: 'DP-900',
    title: 'Microsoft Azure Data Fundamentals',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Fundamentals',
    prerequisites: [],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-fundamentals/',
    description: 'Foundational concepts of relational databases, non-relational storage (Cosmos DB), data warehouses, and analytics on Azure.',
    skills_measured: [
      'Describe core data concepts (25-30%)',
      'Identify considerations for relational data on Azure (20-25%)',
      'Describe considerations for working with non-relational data (15-20%)',
      'Describe an analytics workload on Azure (25-30%)'
    ],
    exam_code: 'Exam DP-900',
    estimated_hours: 18,
    badge_color: 'border-pink-500/30 text-pink-300 bg-pink-950/30',
    glow_color: 'rgba(236, 72, 153, 0.35)',
    order_rank: 2
  },
  {
    id: 'ai-102',
    code: 'AI-102',
    title: 'Designing and Implementing a Microsoft Azure AI Solution',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Associate',
    prerequisites: ['ai-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-ai-engineer/',
    description: 'Build enterprise AI applications utilizing Azure OpenAI Service, Cognitive Search, Azure AI Document Intelligence, and Vision API.',
    skills_measured: [
      'Plan and manage an Azure AI solution (15-20%)',
      'Implement content moderation, vision, and speech solutions (20-25%)',
      'Implement natural language processing solutions (15-20%)',
      'Implement knowledge mining and Azure AI Search (15-20%)',
      'Implement generative AI solutions with Azure OpenAI (25-30%)'
    ],
    exam_code: 'Exam AI-102',
    estimated_hours: 45,
    badge_color: 'border-violet-500/30 text-violet-300 bg-violet-950/30',
    glow_color: 'rgba(139, 92, 246, 0.35)',
    order_rank: 3
  },
  {
    id: 'dp-203',
    code: 'DP-203',
    title: 'Data Engineering on Microsoft Azure',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Associate',
    prerequisites: ['dp-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-engineer/',
    description: 'Integrate, transform, and consolidate data from various structured and unstructured systems using Azure Synapse, Databricks, and Data Factory.',
    skills_measured: [
      'Design and implement data storage (15-20%)',
      'Develop data processing (40-45%)',
      'Secure, monitor, and optimize data storage and processing (30-35%)'
    ],
    exam_code: 'Exam DP-203',
    estimated_hours: 42,
    badge_color: 'border-rose-500/30 text-rose-300 bg-rose-950/30',
    glow_color: 'rgba(244, 63, 94, 0.35)',
    order_rank: 4
  },
  {
    id: 'dp-600',
    code: 'DP-600',
    title: 'Implementing Analytics Solutions Using Microsoft Fabric',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Associate',
    prerequisites: ['dp-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/fabric-analytics-engineer-associate/',
    description: 'Create and deploy end-to-end analytics architectures with OneLake, Lakehouse tables, Direct Lake Power BI semantic models, and Data Factory.',
    skills_measured: [
      'Plan, implement, and manage a solution for data analytics (10-15%)',
      'Prepare and serve data (40-45%)',
      'Implement and manage semantic models (20-25%)',
      'Explore and analyze data (20-25%)'
    ],
    exam_code: 'Exam DP-600',
    estimated_hours: 38,
    badge_color: 'border-fuchsia-500/30 text-fuchsia-300 bg-fuchsia-950/30',
    glow_color: 'rgba(217, 70, 239, 0.35)',
    order_rank: 5
  },
  {
    id: 'dp-100',
    code: 'DP-100',
    title: 'Designing and Implementing a Data Science Solution on Azure',
    domain: 'ai-data',
    domainName: 'AI & Data Engineering',
    level: 'Associate',
    prerequisites: ['ai-900', 'dp-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-data-scientist/',
    description: 'Train, evaluate, and deploy machine learning models using Azure Machine Learning studio, MLflow, hyperparameter tuning, and pipelines.',
    skills_measured: [
      'Design and prepare a machine learning solution (20-25%)',
      'Explore data and train models (35-40%)',
      'Prepare a model for deployment (20-25%)',
      'Deploy and retrain a model (10-15%)'
    ],
    exam_code: 'Exam DP-100',
    estimated_hours: 48,
    badge_color: 'border-indigo-500/30 text-indigo-300 bg-indigo-950/30',
    glow_color: 'rgba(99, 102, 241, 0.45)',
    order_rank: 6
  },

  // ----------------------------------------------------
  // SECURITY, COMPLIANCE & IDENTITY
  // ----------------------------------------------------
  {
    id: 'sc-900',
    code: 'SC-900',
    title: 'Microsoft Security, Compliance, and Identity Fundamentals',
    domain: 'security',
    domainName: 'Security & Compliance',
    level: 'Fundamentals',
    prerequisites: [],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/security-compliance-and-identity-fundamentals/',
    description: 'Foundational concepts of security, compliance, identity solutions across cloud-based and related Microsoft services (Entra ID, Purview).',
    skills_measured: [
      'Describe the concepts of security, compliance, and identity (10-15%)',
      'Describe the capabilities of Microsoft Entra (25-30%)',
      'Describe the capabilities of Microsoft Security solutions (35-40%)',
      'Describe the capabilities of Microsoft compliance solutions (20-25%)'
    ],
    exam_code: 'Exam SC-900',
    estimated_hours: 15,
    badge_color: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/30',
    glow_color: 'rgba(16, 185, 129, 0.35)',
    order_rank: 1
  },
  {
    id: 'sc-200',
    code: 'SC-200',
    title: 'Microsoft Security Operations Analyst',
    domain: 'security',
    domainName: 'Security & Compliance',
    level: 'Associate',
    prerequisites: ['sc-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/security-operations-analyst/',
    description: 'Investigate, respond to, and hunt for threats using Microsoft Sentinel, Microsoft Defender for Cloud, and Microsoft Defender XDR.',
    skills_measured: [
      'Mitigate threats using Microsoft Defender XDR (25-30%)',
      'Mitigate threats using Microsoft Defender for Cloud (15-20%)',
      'Mitigate threats using Microsoft Sentinel (50-55%)'
    ],
    exam_code: 'Exam SC-200',
    estimated_hours: 36,
    badge_color: 'border-teal-500/30 text-teal-300 bg-teal-950/30',
    glow_color: 'rgba(20, 184, 166, 0.35)',
    order_rank: 2
  },
  {
    id: 'sc-300',
    code: 'SC-300',
    title: 'Microsoft Identity and Access Administrator',
    domain: 'security',
    domainName: 'Security & Compliance',
    level: 'Associate',
    prerequisites: ['sc-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/identity-and-access-administrator/',
    description: 'Design, implement, and operate an organization’s identity and access management systems by using Microsoft Entra ID.',
    skills_measured: [
      'Implement an identity management solution (25-30%)',
      'Implement an authentication and access management solution (25-30%)',
      'Implement access management for apps (15-20%)',
      'Plan and implement identity governance (25-30%)'
    ],
    exam_code: 'Exam SC-300',
    estimated_hours: 32,
    badge_color: 'border-cyan-500/30 text-cyan-300 bg-cyan-950/30',
    glow_color: 'rgba(6, 182, 212, 0.35)',
    order_rank: 3
  },
  {
    id: 'az-500',
    code: 'AZ-500',
    title: 'Microsoft Azure Security Technologies',
    domain: 'security',
    domainName: 'Security & Compliance',
    level: 'Associate',
    prerequisites: ['sc-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/azure-security-engineer/',
    description: 'Implement security controls and threat protection, manage identity and access, and protect data, applications, and networks in Azure.',
    skills_measured: [
      'Manage identity and access (25-30%)',
      'Secure networking (20-25%)',
      'Secure compute, storage, and databases (20-25%)',
      'Manage security operations (25-30%)'
    ],
    exam_code: 'Exam AZ-500',
    estimated_hours: 44,
    badge_color: 'border-emerald-500/30 text-emerald-300 bg-emerald-950/30',
    glow_color: 'rgba(16, 185, 129, 0.45)',
    order_rank: 4
  },
  {
    id: 'sc-100',
    code: 'SC-100',
    title: 'Microsoft Cybersecurity Architect (Expert)',
    domain: 'security',
    domainName: 'Security & Compliance',
    level: 'Expert',
    prerequisites: ['sc-200', 'sc-300'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/cybersecurity-architect-expert/',
    description: 'Design and evolve the cybersecurity strategy to protect an enterprise’s mission and business processes across Zero Trust architectures.',
    skills_measured: [
      'Design a Zero Trust strategy and architecture (20-25%)',
      'Evaluate Governance Risk Compliance (GRC) and security operations (20-25%)',
      'Design security for infrastructure (20-25%)',
      'Design a strategy for data and applications (20-25%)'
    ],
    exam_code: 'Exam SC-100',
    estimated_hours: 55,
    badge_color: 'border-green-500/30 text-green-300 bg-green-950/30',
    glow_color: 'rgba(34, 197, 94, 0.5)',
    order_rank: 5
  },

  // ----------------------------------------------------
  // POWER PLATFORM & MODERN WORKPLACE
  // ----------------------------------------------------
  {
    id: 'pl-900',
    code: 'PL-900',
    title: 'Microsoft Power Platform Fundamentals',
    domain: 'power-platform',
    domainName: 'Power Platform & Modern Work',
    level: 'Fundamentals',
    prerequisites: [],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-fundamentals/',
    description: 'Understand the business value and product capabilities of Power Apps, Power Automate, Power BI, Power Pages, and Copilot Studio.',
    skills_measured: [
      'Describe the business value of Power Platform (20-25%)',
      'Identify core components of Microsoft Power Platform (10-15%)',
      'Demonstrate capabilities of Power BI (10-15%)',
      'Demonstrate capabilities of Power Apps (20-25%)',
      'Demonstrate capabilities of Power Automate (15-20%)',
      'Demonstrate capabilities of Copilot Studio (10-15%)'
    ],
    exam_code: 'Exam PL-900',
    estimated_hours: 16,
    badge_color: 'border-amber-500/30 text-amber-300 bg-amber-950/30',
    glow_color: 'rgba(245, 158, 11, 0.35)',
    order_rank: 1
  },
  {
    id: 'pl-300',
    code: 'PL-300',
    title: 'Microsoft Power BI Data Analyst',
    domain: 'power-platform',
    domainName: 'Power Platform & Modern Work',
    level: 'Associate',
    prerequisites: ['pl-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-bi-data-analyst-associate/',
    description: 'Transform raw data into meaningful business insights using Power BI, DAX formulas, Power Query transformations, and interactive visuals.',
    skills_measured: [
      'Prepare the data (25-30%)',
      'Model the data (25-30%)',
      'Visualize and analyze the data (25-30%)',
      'Deploy and maintain assets (15-20%)'
    ],
    exam_code: 'Exam PL-300',
    estimated_hours: 35,
    badge_color: 'border-yellow-500/30 text-yellow-300 bg-yellow-950/30',
    glow_color: 'rgba(234, 179, 8, 0.35)',
    order_rank: 2
  },
  {
    id: 'pl-200',
    code: 'PL-200',
    title: 'Microsoft Power Platform Functional Consultant',
    domain: 'power-platform',
    domainName: 'Power Platform & Modern Work',
    level: 'Associate',
    prerequisites: ['pl-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-functional-consultant-associate/',
    description: 'Configure Dataverse tables, build model-driven apps, create custom business process flows, and integrate Copilot assistants.',
    skills_measured: [
      'Configure Microsoft Dataverse (20-25%)',
      'Create apps by using Microsoft Power Apps (15-20%)',
      'Create and manage process automation (15-20%)',
      'Describe Microsoft Copilot Studio (10-15%)',
      'Manage solutions and environments (15-20%)'
    ],
    exam_code: 'Exam PL-200',
    estimated_hours: 40,
    badge_color: 'border-orange-500/30 text-orange-300 bg-orange-950/30',
    glow_color: 'rgba(249, 115, 22, 0.35)',
    order_rank: 3
  },
  {
    id: 'pl-400',
    code: 'PL-400',
    title: 'Microsoft Power Platform Developer',
    domain: 'power-platform',
    domainName: 'Power Platform & Modern Work',
    level: 'Associate',
    prerequisites: ['pl-200'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-platform-developer-associate/',
    description: 'Design and build technical extensions using JavaScript client scripting, C# Dataverse plugins, custom Azure Functions, and PCF components.',
    skills_measured: [
      'Create a technical design (10-15%)',
      'Configure Microsoft Dataverse (15-20%)',
      'Create and configure Power Apps (10-15%)',
      'Extend the user experience (15-20%)',
      'Extend the platform (40-45%)'
    ],
    exam_code: 'Exam PL-400',
    estimated_hours: 46,
    badge_color: 'border-amber-600/30 text-amber-300 bg-amber-950/30',
    glow_color: 'rgba(217, 119, 6, 0.45)',
    order_rank: 4
  },
  {
    id: 'pl-500',
    code: 'PL-500',
    title: 'Microsoft Power Automate RPA Developer',
    domain: 'power-platform',
    domainName: 'Power Platform & Modern Work',
    level: 'Associate',
    prerequisites: ['pl-900'],
    microsoft_learn_url: 'https://learn.microsoft.com/en-us/credentials/certifications/power-automate-rpa-developer-associate/',
    description: 'Automate legacy software and modern processes using Power Automate Desktop, unattended bot machines, UI flows, and AI Builder OCR.',
    skills_measured: [
      'Design solutions (25-30%)',
      'Develop solutions (40-45%)',
      'Deploy and manage solutions (25-30%)'
    ],
    exam_code: 'Exam PL-500',
    estimated_hours: 38,
    badge_color: 'border-lime-500/30 text-lime-300 bg-lime-950/30',
    glow_color: 'rgba(132, 204, 22, 0.35)',
    order_rank: 5
  }
];
