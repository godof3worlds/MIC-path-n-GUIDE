

NOTE: BEFORE START :
                THE MIC PYTON has the python version of the app, less power full

                the other stuff is code for the web app

# Microsoft Learning Path Tracker (Interactive Azure Certification Roadmap)

WEB APP LINK: https://microsoft-learning-path-tracker.ai.studio

A modern, high-performance web application and career roadmapping platform designed to help engineers, architects, and technical leaders navigate Microsoft certification paths (Azure, AI, Security, Data, DevOps, Power Platform). Built with a liquid-glass aesthetic, multi-tier server-side AI reasoning, Google authentication, digital trophy badges, a high-resolution certificate generator, and persistent cloud synchronization.

---

## 🌟 Key Features

### 1. Multi-Track Microsoft Certification Roadmaps
- **Specialized Domains**:
  - ☁️ **Azure Cloud & Infrastructure**: AZ-900 &rarr; AZ-104 &rarr; AZ-305 &rarr; AZ-400 / AZ-800
  - 🤖 **Azure AI & Applied Intelligence**: AI-900 &rarr; AI-102 &rarr; DP-600 &rarr; AI-050
  - 🔒 **Security, Compliance & Identity**: SC-900 &rarr; SC-200 &rarr; SC-300 &rarr; SC-100
  - 📊 **Azure Data & Modern Analytics**: DP-900 &rarr; DP-203 &rarr; DP-500 &rarr; DP-600
  - ⚡ **Power Platform & Automation**: PL-900 &rarr; PL-200 &rarr; PL-400 &rarr; PL-600
- **Smart Prerequisite Logic**: Visual node locking, unlock status tracking, dynamic prerequisite resolution, and sequential milestone guidance.
- **Dual Visual Modes**:
  - **Interactive Tree View**: Visual topological graph showing milestone connections, levels (Fundamentals, Associate, Expert, Specialty), and prerequisite chains.
  - **Grid Matrix View**: Structured card layout with deep skill measurements, exam codes, and quick actions.

### 2. Live Microsoft Learn Catalog Integration (All 151 Certifications)
- **Direct Microsoft Learn API Sync**: Real-time integration with the official Microsoft Learn Catalog API (`https://learn.microsoft.com/api/catalog/`) fetching all active Microsoft certifications.
- **Full 151 Certifications Explorer Modal (`CatalogExplorerModal`)**:
  - Search by exam code (e.g., `AZ-900`, `DP-600`, `SC-100`, `PL-400`, `MS-102`, `MB-800`), keyword, or role title.
  - Multi-category filtering: **Azure Cloud**, **AI & Machine Learning**, **Data & Fabric**, **Cybersecurity**, **Microsoft 365**, and **Power Platform & Dynamics**.
  - Level filtering: **Fundamentals**, **Associate**, **Expert**, and **Specialty**.
  - Interactive status toggles to mark any of the 151 exams as completed directly from the catalog.
  - Direct deep links to official Microsoft Learn credential pages.
  - Quick action to launch the Gemini AI Study Assistant loaded with the selected exam context.

### 3. Badge Collection & Digital Incentive System (`BadgeCollection`)
- **12 Unlockable Trophies & Badges**: Comprehensive achievement tiers (Diamond, Gold, Silver, Bronze) tracking exam completions, study effort, and cross-domain mastery:
  - 🧭 **First Milestone** *(Bronze)*: Awarded on completing your first Microsoft exam.
  - 📚 **Foundations Vanguard** *(Silver)*: Earning 2+ 900-series fundamentals certifications.
  - ☁️ **Azure Cloud Sentinel** *(Silver)*: Completing AZ-104 or AZ-900.
  - 👑 **Architectural Virtuoso** *(Diamond)*: Earning the prestigious AZ-305 Solutions Architect Expert.
  - 🔀 **DevOps Automation Hero** *(Gold)*: Completing AZ-400 DevOps Engineer Expert.
  - ✨ **AI Intelligence Architect** *(Gold)*: Earning AI-900 or AI-102 cognitive certifications.
  - 🛡️ **Zero Trust Guardian** *(Gold)*: Completing SC-900 or SC-200 cybersecurity certifications.
  - 🗄️ **Data Fabric Alchemist** *(Gold)*: Earning DP-900, DP-203, or DP-600 data engineering certifications.
  - 🌐 **Multi-Cloud Polymath** *(Diamond)*: Completing credentials across 3 distinct domain tracks.
  - 🔥 **Century Study Scholar** *(Gold)*: Accumulating 100+ hours of certified study effort.
  - 🏆 **Microsoft Grandmaster** *(Diamond)*: Mastering 5 or more total official certifications.
  - ⚙️ **Low-Code Automator** *(Silver)*: Completing PL-900 or Power Platform credentials.
- **Polymorphic UI Integration**:
  - **Profile View Compact Incentive Grid**: Embedded directly inside the `UserProfileModal` displaying unlocked badges, progress bars, and trophy completion statistics.
  - **Full Trophy Room Modal**: Accessible via the header or profile view for detailed badge inspection, milestone criteria, and next unlock goals.

### 3. High-Resolution Certificate Generator (PNG Export)
- **1920x1080 HD Diploma Rendering**: Generates official, high-resolution credentials certificates via HTML5 Canvas.
- **Verification Metadata**:
  - Candidate display name & Google user metadata.
  - Dynamic listing of all validated certifications with exam codes and study hour totals.
  - Unique cryptographic verification audit ID (e.g. `MSFT-LP-ALEX-VANC-...`).
  - Holographic authentic credential seal and official curriculum signatures.
- **Direct Download**: Instant one-click export to PNG formatted for LinkedIn portfolios, resumes, and technical documentation.

### 4. Multi-Tier AI Explanation Engine & Resilient Cascade
- **Context-Aware Career Rationale**: Analyzes user's completed certifications to provide tailored 1-2 sentence explanations of why the next milestone is strategically beneficial.
- **Failover Hierarchy**:
  1. `gemini-3.7-flash` (Primary Flagship Reasoning)
  2. `gemini-2.5-flash` (Secondary High-Speed Inference)
  3. `gemini-2.0-flash` (Balanced Standard Inference)
  4. `gemini-2.0-flash-lite` (Lightweight 2B Tier Failover)
  5. `NVIDIA NIM` (`meta/llama-3.1-8b-instruct`, `nvidia/llama-3.1-nemotron-70b-instruct`)
  6. `Resilient Static Fallback` (Zero-downtime offline deterministic career rationale)
- **Active Model Badge**: Real-time indicator displaying which AI engine served the explanation.

### 5. Floating Draggable Study Assistant AI Chat Window
- **Interactive Multi-Turn AI Tutor**: Chatbot loaded with domain-specific Microsoft exam knowledge and study guides.
- **Draggable Window**: Drag anywhere across the viewport with smooth pointer tracking and boundary clamping.
- **Markdown & Code Rendering**: Formatted exam tips, architecture patterns, and step-by-step revision guidance.

### 6. Google Authentication & Cloud State Sync
- **Google Sign-In**: Integration with Firebase Authentication (`GoogleAuthProvider`) for single-click sign-in and profile synchronization.
- **Learner Profile Modal**: Live tracking of completed credentials, avatar, verified email, recruiter role switching (e.g. Alex Vance, Taylor Morgan), and the compact Badge Collection incentive system.
- **Session Persistence**: Progress, milestones, and custom filters persist per-user across restarts and devices.

### 7. Interactive UX & Micro-interactions
- **Liquid Glass Visual Language**: Translucent glassmorphism with subtle glow shaders (`liquid-glow-cyan`, `liquid-glow-emerald`, `liquid-glow-purple`), backdrop blurs, and animated gradient mesh canvases.
- **Confetti Celebrations**: Dynamic canvas confetti triggering on single milestone completion and full track mastery.
- **Fast-Track Testing Toolbar**: Recruiter/developer utility toolbar allowing one-click foundation completion, simulated offline testing, progress reset, and real-time refresh.

---

## 🛠️ Technical Stack & Architecture

### Frontend
- **Framework**: React 18+ with TypeScript & Vite
- **Styling**: Tailwind CSS with custom ambient mesh & liquid glass shaders
- **Icons**: Lucide React
- **Rendering & Visuals**: HTML5 Canvas (High-Res 1080p Certificate Generator), `canvas-confetti`, `react-markdown`
- **Auth Client**: Firebase Client SDK v10+ (Google Auth Provider)

### Backend & API
- **Server**: Express.js with TypeScript (`tsx` in dev, `esbuild` CommonJS bundle in prod)
- **AI SDK**: `@google/genai` TypeScript SDK (Official modern SDK)
- **Failover Provider**: NVIDIA NIM API (`https://integrate.api.nvidia.com/v1/chat/completions`)
- **Database / Store**: Server-side JSON store with atomic writes (`/data/db.json`) supporting Cloud SQL PostgreSQL compatibility.

---

## 📡 API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/domains` | Retrieve all certification domains and metadata |
| `GET` | `/api/domains/:domainId/certifications` | Get certifications list for a specific track |
| `GET` | `/api/progress/:userId/:domainId` | Fetch user progress summary, unlocked nodes, and completion % |
| `POST` | `/api/progress/complete` | Mark a certification completed or incomplete |
| `POST` | `/api/progress/reset` | Reset certification progress for a given domain track |
| `POST` | `/api/explain` | Generate multi-tier AI career rationale for a step |
| `POST` | `/api/chat` | Multi-turn study assist conversation with Gemini / NVIDIA NIM fallback |
| `GET` | `/api/catalog/certifications` | Retrieve all 151 Microsoft certifications with search, category & level filters |
| `GET` | `/api/catalog/stats` | Retrieve aggregate counts, exams, and category breakdown for the Microsoft Catalog |
| `GET` | `/api/portfolio/:userId` | Retrieve verified portfolio data and completed credentials for certificate generation |
| `POST` | `/api/users/sync` | Sync user Google profile with server database |
| `GET` | `/api/users/:userId` | Get user profile information |

---

## ⚙️ Environment Variables

```env
# Google Gemini API Key (Server-side)
GEMINI_API_KEY=

# NVIDIA NIM API Key (Server-side fallback)
NVIDIA_API_KEY=

# Application URL (Auto-injected in Cloud Run)
APP_URL=

# Firebase Auth (Client-side)
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

---

## 🚀 Development & Build Scripts

- **Development**: `npm run dev` (Runs Express backend + Vite middleware on Port 3000)
- **Production Build**: `npm run build` (Builds Vite client assets and bundles `server.ts` into `dist/server.cjs`)
- **Production Start**: `npm start` (Runs standalone `node dist/server.cjs`)
- **Type Checking / Lint**: `npm run lint` (`tsc --noEmit`)
