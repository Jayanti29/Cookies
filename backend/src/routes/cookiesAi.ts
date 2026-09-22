import { Router, Request, Response } from 'express';
import { cookiesAiService } from '../services/cookiesAiService';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();

router.use(optionalAuth);

/**
 * Ask COOKIES AI Safety Assistant
 * POST /api/ai/chat
 */
router.post('/chat', async (req: Request, res: Response): Promise<void> => {
  try {
    const { message, context, language } = req.body;

    if (!message || typeof message !== 'string' || !message.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'User message is required' });
      return;
    }

    const response = await cookiesAiService.chat({
      message: message.trim(),
      context,
      language: language || 'en',
    });

    res.json(response);
  } catch (err: any) {
    logger.error({ service: 'cookiesAiRoute', error: String(err) }, 'Failed to answer AI chat query');
    res.status(500).json({ error: 'AI Error', message: err.message || 'Could not process query' });
  }
});

export default router;
