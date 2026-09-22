import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

/**
 * Get Trending Safety Threats & Pattern Summary
 * GET /api/community/trending
 */
router.get('/trending', optionalAuth, async (_req: Request, res: Response): Promise<void> => {
  try {
    if (!db || typeof (db as any).collection !== 'function') {
      res.json({ trends: [], totalReports: 0 });
      return;
    }

    const reportsSnapshot = await (db as any)
      .collection('reports')
      .where('isPublic', '==', true)
      .limit(100)
      .get();

    const categoryCounts: Record<string, number> = {};
    reportsSnapshot.forEach((doc: any) => {
      const cat = doc.data()?.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const trends = Object.entries(categoryCounts)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    res.json({
      trends,
      totalReports: reportsSnapshot.size,
      updatedAt: new Date().toISOString(),
    });
  } catch (err: any) {
    logger.error({ service: 'community', error: String(err) }, 'Failed to fetch community trends');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch trends' });
  }
});

/**
 * Get Community Safety Profile for a Website Domain
 * GET /api/community/website/:domain
 */
router.get('/website/:domain', optionalAuth, async (req: Request, res: Response): Promise<void> => {
  try {
    const domain = req.params.domain.toLowerCase().replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0];

    if (!db || typeof (db as any).collection !== 'function') {
      res.json({
        domain,
        reportCount: 0,
        communityStatus: 'unknown',
        categories: [],
        lastReported: null,
      });
      return;
    }

    // Check if a precomputed profile exists
    const profileDoc = await (db as any).collection('websiteProfiles').doc(domain).get();
    if (profileDoc.exists) {
      res.json(profileDoc.data());
      return;
    }

    // Otherwise aggregate from public reports matching the domain
    const reportsSnapshot = await (db as any)
      .collection('reports')
      .where('isPublic', '==', true)
      .get();

    const domainReports = reportsSnapshot.docs
      .map((doc: any) => doc.data())
      .filter((r: any) => r.url && r.url.toLowerCase().includes(domain));

    const categoryCounts: Record<string, number> = {};
    domainReports.forEach((r: any) => {
      const cat = r.category || 'other';
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const profile = {
      domain,
      reportCount: domainReports.length,
      communityStatus: domainReports.length === 0 ? 'unknown' : (domainReports.length > 3 ? 'suspicious' : 'review'),
      categories: Object.keys(categoryCounts),
      lastReported: domainReports[0]?.createdAt || null,
    };

    res.json(profile);
  } catch (err: any) {
    logger.error({ service: 'community', error: String(err) }, 'Failed to fetch website profile');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch website profile' });
  }
});

export default router;
