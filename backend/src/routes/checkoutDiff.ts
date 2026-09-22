import { Router, Request, Response } from 'express';
import multer from 'multer';
import { checkoutDiffService } from '../services/checkoutDiffService';
import { optionalAuth } from '../middleware/auth';
import { logger } from '../utils/logger';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 },
});

router.use(optionalAuth);

/**
 * Compare Product Page vs Final Checkout Page
 * POST /api/checkout-diff
 * Supports multipart (files 'screenshotA' and 'screenshotB') or JSON base64
 */
router.post(
  '/',
  upload.fields([
    { name: 'screenshotA', maxCount: 1 },
    { name: 'screenshotB', maxCount: 1 },
  ]),
  async (req: Request, res: Response): Promise<void> => {
    try {
      const files = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      let base64A = req.body.screenshotA;
      let base64B = req.body.screenshotB;
      let mimeA = 'image/jpeg';
      let mimeB = 'image/jpeg';

      if (files?.screenshotA?.[0]) {
        base64A = files.screenshotA[0].buffer.toString('base64');
        mimeA = files.screenshotA[0].mimetype;
      }
      if (files?.screenshotB?.[0]) {
        base64B = files.screenshotB[0].buffer.toString('base64');
        mimeB = files.screenshotB[0].mimetype;
      }

      if (!base64A || !base64B) {
        res.status(400).json({
          error: 'Validation Error',
          message: 'Both Screenshot A (Product Page) and Screenshot B (Checkout Page) are required',
        });
        return;
      }

      const language = req.body.language || 'en';
      const result = await checkoutDiffService.compareCheckouts(base64A, base64B, mimeA, mimeB, language);
      res.json(result);
    } catch (err: any) {
      logger.error({ service: 'checkoutDiffRoute', error: String(err) }, 'Failed checkout difference analysis');
      res.status(500).json({ error: 'Comparison Error', message: err.message || 'Could not complete comparison' });
    }
  }
);

export default router;
