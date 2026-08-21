import fs from 'fs';
import path from 'path';
import { CERTIFICATIONS, DOMAINS } from '../src/data/certificationsData.js';
import { CertStatus, CertWithProgress, ProgressSummary } from '../src/types.js';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'user_progress.json');

// Interface for persisted user progress
interface UserProgressRecord {
  userId: string;
  certId: string;
  domain: string;
  completedAt: string;
}

interface UserProfileRecord {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGoogleUser: boolean;
  provider: string;
  updatedAt: string;
}

interface DatabaseSchema {
  users?: UserProfileRecord[];
  progress: UserProgressRecord[];
  updatedAt: string;
}

function ensureDbExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const initial: DatabaseSchema = {
      progress: [
        // Seed initial progress for default guest user for an engaging first load experience
        {
          userId: 'default-user',
          certId: 'az-900',
          domain: 'cloud',
          completedAt: new Date(Date.now() - 7 * 86400000).toISOString(),
        }
      ],
      updatedAt: new Date().toISOString(),
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf-8');
  }
}

function readDb(): DatabaseSchema {
  try {
    ensureDbExists();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (error) {
    console.error('Error reading database file:', error);
    return { progress: [], updatedAt: new Date().toISOString() };
  }
}

function writeDb(data: DatabaseSchema) {
  try {
    ensureDbExists();
    data.updatedAt = new Date().toISOString();
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing database file:', error);
  }
}

/**
 * Pure Deterministic Status Computation Engine
 * Rule:
 * 1. If cert is in user's completed list -> status = 'completed'
 * 2. If all prerequisites are in user's completed list (or prerequisites is empty) -> status = 'available'
 * 3. Otherwise -> status = 'locked'
 */
export function computeProgressForDomain(userId: string, domainId: string): ProgressSummary {
  const db = readDb();
  const domainCerts = CERTIFICATIONS.filter(c => c.domain === domainId)
    .sort((a, b) => a.order_rank - b.order_rank);

  // Set of all completed cert IDs for this user (across all domains in case of cross-domain prereqs)
  const userCompletedRecords = db.progress.filter(p => p.userId === userId);
  const completedCertIds = new Set(userCompletedRecords.map(p => p.certId));

  const certsWithProgress: CertWithProgress[] = domainCerts.map(cert => {
    const isCompleted = completedCertIds.has(cert.id);
    const completedRecord = userCompletedRecords.find(p => p.certId === cert.id);
    
    // Check prerequisites
    const missingPrerequisites: string[] = [];
    for (const prereqId of cert.prerequisites) {
      if (!completedCertIds.has(prereqId)) {
        missingPrerequisites.push(prereqId);
      }
    }

    let status: CertStatus;
    if (isCompleted) {
      status = 'completed';
    } else if (missingPrerequisites.length === 0) {
      status = 'available';
    } else {
      status = 'locked';
    }

    return {
      ...cert,
      status,
      completedAt: completedRecord ? completedRecord.completedAt : null,
      missingPrerequisites,
    };
  });

  const completedCount = certsWithProgress.filter(c => c.status === 'completed').length;
  const availableCount = certsWithProgress.filter(c => c.status === 'available').length;
  const lockedCount = certsWithProgress.filter(c => c.status === 'locked').length;
  const totalCerts = certsWithProgress.length;
  const percentage = totalCerts > 0 ? Math.round((completedCount / totalCerts) * 100) : 0;

  const estimatedHoursCompleted = certsWithProgress
    .filter(c => c.status === 'completed')
    .reduce((sum, c) => sum + c.estimated_hours, 0);

  const estimatedHoursRemaining = certsWithProgress
    .filter(c => c.status !== 'completed')
    .reduce((sum, c) => sum + c.estimated_hours, 0);

  // Find the first available cert as the next recommendation
  const nextRecommendedCert = certsWithProgress.find(c => c.status === 'available') || null;

  return {
    userId,
    domain: domainId,
    totalCerts,
    completedCount,
    availableCount,
    lockedCount,
    percentage,
    estimatedHoursCompleted,
    estimatedHoursRemaining,
    certifications: certsWithProgress,
    nextRecommendedCert,
  };
}

export function setCertCompletion(userId: string, certId: string, completed: boolean): ProgressSummary {
  const db = readDb();
  const cert = CERTIFICATIONS.find(c => c.id === certId);
  if (!cert) {
    throw new Error(`Certification with ID ${certId} not found`);
  }

  if (completed) {
    // Add if not already exists
    const exists = db.progress.some(p => p.userId === userId && p.certId === certId);
    if (!exists) {
      db.progress.push({
        userId,
        certId,
        domain: cert.domain,
        completedAt: new Date().toISOString(),
      });
      writeDb(db);
    }
  } else {
    // Remove completion
    db.progress = db.progress.filter(p => !(p.userId === userId && p.certId === certId));
    writeDb(db);
  }

  return computeProgressForDomain(userId, cert.domain);
}

export function resetUserProgress(userId: string, domainId?: string): ProgressSummary {
  const db = readDb();
  if (domainId) {
    // Remove only for this domain
    const domainCertIds = new Set(CERTIFICATIONS.filter(c => c.domain === domainId).map(c => c.id));
    db.progress = db.progress.filter(p => !(p.userId === userId && domainCertIds.has(p.certId)));
  } else {
    // Remove all for user
    db.progress = db.progress.filter(p => p.userId !== userId);
  }
  writeDb(db);
  return computeProgressForDomain(userId, domainId || 'cloud');
}

export function getAllDomains() {
  return DOMAINS;
}

export function getCertificationsByDomain(domainId: string) {
  return CERTIFICATIONS.filter(c => c.domain === domainId);
}

export function getCertificationById(certId: string) {
  return CERTIFICATIONS.find(c => c.id === certId);
}

export function syncUserProfile(profile: {
  id: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isGoogleUser?: boolean;
  provider?: string;
}) {
  const db = readDb();
  if (!db.users) {
    db.users = [];
  }

  const existingIdx = db.users.findIndex(u => u.id === profile.id);
  const userRecord: UserProfileRecord = {
    id: profile.id,
    email: profile.email || null,
    displayName: profile.displayName || 'Learner',
    photoURL: profile.photoURL || null,
    isGoogleUser: profile.isGoogleUser ?? true,
    provider: profile.provider || 'google.com',
    updatedAt: new Date().toISOString(),
  };

  if (existingIdx >= 0) {
    db.users[existingIdx] = userRecord;
  } else {
    db.users.push(userRecord);
  }

  writeDb(db);
  return userRecord;
}

export function getUserProfile(userId: string): UserProfileRecord | null {
  const db = readDb();
  return db.users?.find(u => u.id === userId) || null;
}

