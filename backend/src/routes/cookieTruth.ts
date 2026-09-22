import { Router, Request, Response } from 'express';
import { cookieTruthService } from '../services/cookieTruthService';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

// Optional authentication
router.use(optionalAuth);

/**
 * Analyze Cookie Consent Banner & Privacy Notice
 * POST /api/cookie-truth/analyze
 */
router.post('/analyze', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, url, language } = req.body;

    if (!content && !url) {
      res.status(400).json({ error: 'Validation Error', message: 'Cookie banner content or website URL is required' });
      return;
    }

    const result = await cookieTruthService.analyzeCookieConsent(
      content || `Cookie banner for ${url}`,
      url,
      language || 'en'
    );

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'cookieTruthRoute', error: String(err) }, 'Failed to analyze cookie consent');
    res.status(500).json({ error: 'Analysis Error', message: err.message || 'Could not analyze cookie banner' });
  }
});

/**
 * Generate Digital Consent Receipt
 * POST /api/cookie-truth/receipt
 */
router.post('/receipt', async (req: Request, res: Response): Promise<void> => {
  try {
    const { website, categories, flags } = req.body;

    if (!website) {
      res.status(400).json({ error: 'Validation Error', message: 'Website domain is required' });
      return;
    }

    const receipt = cookieTruthService.generateReceipt(website, categories || [], flags || []);
    res.json(receipt);
  } catch (err: any) {
    logger.error({ service: 'cookieTruthRoute', error: String(err) }, 'Failed to generate consent receipt');
    res.status(500).json({ error: 'Receipt Error', message: err.message || 'Could not generate receipt' });
  }
});

export default router;
