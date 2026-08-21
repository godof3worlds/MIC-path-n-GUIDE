import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import {
  computeProgressForDomain,
  getAllDomains,
  getCertificationsByDomain,
  resetUserProgress,
  setCertCompletion,
  syncUserProfile,
  getUserProfile,
} from './server/db.js';
import { explainNextStep, studyAssistChat } from './server/gemini.js';
import { fetchMicrosoftCatalog } from './server/catalog.js';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // ----------------------------------------------------
  // API ROUTES
  // ----------------------------------------------------
  
  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'Microsoft Learning Path Tracker API',
      timestamp: new Date().toISOString(),
      geminiConfigured: !!process.env.GEMINI_API_KEY,
    });
  });

  // Microsoft Official Catalog API (All 151 Certifications)
  app.get('/api/catalog/certifications', async (req, res) => {
    try {
      const catalog = await fetchMicrosoftCatalog();
      res.json(catalog);
    } catch (error) {
      console.error('Error in /api/catalog/certifications:', error);
      res.status(500).json({ error: 'Failed to fetch Microsoft Learn Catalog' });
    }
  });

  // Microsoft Official Catalog Stats
  app.get('/api/catalog/stats', async (req, res) => {
    try {
      const catalog = await fetchMicrosoftCatalog();
      res.json({
        total: catalog.total,
        activeCount: catalog.activeCount,
        retiredCount: catalog.retiredCount,
        categories: catalog.categories,
        roles: catalog.roles,
        levels: catalog.levels,
        certificationTypes: catalog.certificationTypes,
        fetchedAt: catalog.fetchedAt,
        isLive: catalog.isLive,
      });
    } catch (error) {
      console.error('Error in /api/catalog/stats:', error);
      res.status(500).json({ error: 'Failed to fetch catalog stats' });
    }
  });

  // Domains endpoint
  app.get('/api/domains', (req, res) => {
    try {
      const domains = getAllDomains();
      res.json({ domains });
    } catch (error) {
      console.error('Error fetching domains:', error);
      res.status(500).json({ error: 'Failed to fetch domains' });
    }
  });

  // Paths for domain endpoint
  app.get('/api/paths/:domain', (req, res) => {
    try {
      const { domain } = req.params;
      const certs = getCertificationsByDomain(domain);
      res.json({ domain, certifications: certs });
    } catch (error) {
      console.error('Error fetching path:', error);
      res.status(500).json({ error: 'Failed to fetch certifications for domain' });
    }
  });

  // Progress computation endpoint (Pure code status calculation)
  app.get('/api/progress/:userId/:domain', (req, res) => {
    try {
      const { userId, domain } = req.params;
      const progress = computeProgressForDomain(userId || 'default-user', domain || 'cloud');
      res.json(progress);
    } catch (error) {
      console.error('Error computing progress:', error);
      res.status(500).json({ error: 'Failed to compute progress' });
    }
  });

  // Mark Completed / Toggle progress endpoint
  app.post('/api/progress/complete', (req, res) => {
    try {
      const { userId = 'default-user', certId, completed = true } = req.body;
      if (!certId) {
        return res.status(400).json({ error: 'certId is required' });
      }

      const updatedProgress = setCertCompletion(userId, certId, completed);
      res.json(updatedProgress);
    } catch (error) {
      console.error('Error updating completion:', error);
      res.status(500).json({ error: (error as Error).message || 'Failed to update certification progress' });
    }
  });

  // User Profile Sync endpoint (Google Auth & Guest Sync)
  app.post('/api/users/sync', (req, res) => {
    try {
      const { id, email, displayName, photoURL, isGoogleUser, provider } = req.body;
      if (!id) {
        return res.status(400).json({ error: 'User id is required' });
      }
      const record = syncUserProfile({
        id,
        email,
        displayName,
        photoURL,
        isGoogleUser,
        provider,
      });
      res.json(record);
    } catch (error) {
      console.error('Error syncing user profile:', error);
      res.status(500).json({ error: 'Failed to sync user profile' });
    }
  });

  // Get User Profile endpoint
  app.get('/api/users/:userId', (req, res) => {
    try {
      const { userId } = req.params;
      const user = getUserProfile(userId);
      if (!user) {
        return res.json({
          id: userId,
          email: null,
          displayName: 'Candidate ' + userId,
          photoURL: null,
          isGoogleUser: false,
          provider: 'local',
        });
      }
      res.json(user);
    } catch (error) {
      console.error('Error getting user profile:', error);
      res.status(500).json({ error: 'Failed to get user profile' });
    }
  });

  // Reset progress endpoint
  app.post('/api/progress/reset', (req, res) => {
    try {
      const { userId = 'default-user', domain } = req.body;
      const progress = resetUserProgress(userId, domain);
      res.json(progress);
    } catch (error) {
      console.error('Error resetting progress:', error);
      res.status(500).json({ error: 'Failed to reset progress' });
    }
  });

  // AI Explanation Endpoint (Safe Gemini call with fallback)
  app.post('/api/explain', async (req, res) => {
    try {
      const { current_step, completed_certs = [] } = req.body;
      if (!current_step || !current_step.id || !current_step.title) {
        return res.status(400).json({ error: 'current_step with id and title is required' });
      }

      const result = await explainNextStep({
        currentStep: current_step,
        completedCerts: completed_certs,
      });

      res.json(result);
    } catch (error) {
      console.error('AI explanation route error:', error);
      // Even on outer exception, provide seamless fallback instead of 500 error
      res.json({
        cert_id: req.body?.current_step?.id || 'unknown',
        explanation: `Pursuing ${req.body?.current_step?.code || 'this certification'} deepens your Microsoft cloud expertise and establishes practical, production-ready capabilities for modern enterprise environments.`,
        is_fallback: true,
        model: 'fallback-emergency',
      });
    }
  });

  // All-Purpose Study Assist AI Chatbot Endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, context } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages array is required' });
      }

      const chatResult = await studyAssistChat({ messages, context });
      res.json(chatResult);
    } catch (error) {
      console.error('Study Assist chat endpoint error:', error);
      res.json({
        message: "I am ready to help you prepare for Microsoft exams! What topic, service, or certification (e.g. AZ-900, AZ-104, AZ-305, SC-900, DP-203) would you like to review?",
        model: "offline-study-assistant",
        is_fallback: true,
      });
    }
  });

  // ----------------------------------------------------
  // VITE / STATIC SERVING
  // ----------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Microsoft Learning Path Tracker running on port ${PORT}`);
  });
}

startServer();
