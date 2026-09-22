import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { verifyFirebaseToken, optionalAuth } from '../middleware/auth';
import { voteLimiter } from '../middleware/rateLimit';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Submit a Community Report
 * POST /api/reports
 */
router.post('/', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, title, description, url, evidence, platform, analysisId, severity } = req.body;
    const userId = req.user!.uid;

    if (!category || !description) {
      res.status(400).json({ error: 'Validation Error', message: 'Category and description are required' });
      return;
    }

    const reportId = generateId();
    const reportData = {
      id: reportId,
      userId,
      analysisId: analysisId || null,
      title: title || `${category} report`,
      description,
      category,
      status: 'submitted',
      severity: severity || 'medium',
      evidence: evidence || [],
      platform: platform || null,
      url: url || null,
      isPublic: true,
      communityVotes: {
        experienced: 0,
        possibly: 0,
        does_not_match: 0,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db && typeof (db as any).collection === 'function') {
      await (db as any).collection('reports').doc(reportId).set(reportData);
    }

    logger.info({ service: 'reports', reportId, userId }, 'New report submitted');
    res.status(201).json(reportData);
  } catch (err: any) {
    logger.error({ service: 'reports', error: String(err) }, 'Failed to submit report');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not save report' });
  }
});

/**
 * Get Authenticated User's Reports
 * GET /api/reports
 */
router.get('/', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.uid;

    if (!db || typeof (db as any).collection !== 'function') {
      res.json([]);
      return;
    }

    const snapshot = await (db as any)
      .collection('reports')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const reports = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(reports);
  } catch (err: any) {
    logger.error({ service: 'reports', error: String(err) }, 'Failed to fetch user reports');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch reports' });
  }
});

/**
 * Get Public Community Reports
 * GET /api/reports/community
 */
router.get('/community', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    if (!db || typeof (db as any).collection !== 'function') {
      res.json([]);
      return;
    }

    const limit = Math.min(Number(req.query.limit) || 20, 50);
    const snapshot = await (db as any)
      .collection('reports')
      .where('isPublic', '==', true)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    const reports = snapshot.docs.map((doc: any) => {
      const data = doc.data();
      // Anonymize: don't expose user IDs in community view
      const { userId, ...safeData } = data;
      return { id: doc.id, ...safeData };
    });

    res.json(reports);
  } catch (err: any) {
    logger.error({ service: 'reports', error: String(err) }, 'Failed to fetch community reports');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch community reports' });
  }
});

/**
 * Vote on a Report (experienced | possibly | does_not_match)
 * POST /api/reports/:id/vote
 */
router.post('/:id/vote', verifyFirebaseToken, voteLimiter, async (req: Request, res: Response): Promise<void> => {
  try {
    const reportId = req.params.id;
    const userId = req.user!.uid;
    const { vote } = req.body;

    if (!['experienced', 'possibly', 'does_not_match'].includes(vote)) {
      res.status(400).json({ error: 'Validation Error', message: 'Vote must be: experienced, possibly, or does_not_match' });
      return;
    }

    if (!db || typeof (db as any).collection !== 'function') {
      res.json({ success: true, message: 'Vote registered' });
      return;
    }

    const voteDocRef = (db as any).collection('communityVotes').doc(`${reportId}_${userId}`);
    const existingVote = await voteDocRef.get();

    if (existingVote.exists) {
      res.status(409).json({ error: 'Conflict', message: 'You have already voted on this report' });
      return;
    }

    // Save user's vote record to prevent duplicates
    await voteDocRef.set({
      reportId,
      userId,
      vote,
      votedAt: new Date().toISOString(),
    });

    // Increment count on report
    const reportRef = (db as any).collection('reports').doc(reportId);
    await db.runTransaction(async (transaction: any) => {
      const reportDoc = await transaction.get(reportRef);
      if (!reportDoc.exists) return;
      const currentVotes = reportDoc.data()?.communityVotes || { experienced: 0, possibly: 0, does_not_match: 0 };
      currentVotes[vote] = (currentVotes[vote] || 0) + 1;
      transaction.update(reportRef, { communityVotes: currentVotes });
    });

    res.json({ success: true, vote });
  } catch (err: any) {
    logger.error({ service: 'reports', error: String(err) }, 'Failed to vote on report');
    res.status(500).json({ error: 'Vote Error', message: err.message || 'Could not register vote' });
  }
});

export default router;
