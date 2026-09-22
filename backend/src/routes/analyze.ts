import { Router, Request, Response } from 'express';
import multer from 'multer';
import { analysisEngine } from '../services/analysisEngine';
import { AnalysisInput, AnalysisType } from '../types';
import { optionalAuth } from '../middleware/auth';
import { analysisLimiter } from '../middleware/rateLimit';
import { validateURL, validateTextInput } from '../middleware/validate';
import { logger } from '../utils/logger';

const router = Router();

// Setup multer in-memory storage (max 50MB)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Apply analysis rate limiting and optional auth to all analysis routes
router.use(analysisLimiter);
router.use(optionalAuth);

/**
 * Universal Analysis Endpoint
 * POST /api/analyze
 */
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { type, content, language, options } = req.body;
    let analysisContent = content;

    // If a file is uploaded, convert buffer to base64
    if (req.file) {
      analysisContent = req.file.buffer.toString('base64');
    }

    if (!analysisContent && !req.file) {
      res.status(400).json({ error: 'Validation Error', message: 'No content or file provided for analysis' });
      return;
    }

    const input: AnalysisInput = {
      type: type || (req.file ? AnalysisType.Image : AnalysisType.Text),
      content: analysisContent,
      language: language || 'en',
      options: typeof options === 'string' ? JSON.parse(options) : options,
      userId: req.user?.uid,
    };

    const result = await analysisEngine.analyze(input);
    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeRoute', error: String(err) }, 'Error in universal analyze endpoint');
    res.status(500).json({ error: 'Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Check Website / URL
 * POST /api/analyze/website
 */
router.post('/website', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, language } = req.body;
    const urlValidation = validateURL(url);
    if (!urlValidation.valid) {
      res.status(400).json({ error: 'Validation Error', message: urlValidation.error || 'Invalid URL' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.Website,
      content: url,
      language: language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeWebsite', error: String(err) }, 'Error analyzing website');
    res.status(500).json({ error: 'Website Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Alias for URL analysis
 * POST /api/analyze/url
 */
router.post('/url', async (req: Request, res: Response): Promise<void> => {
  try {
    const { url, language } = req.body;
    const urlValidation = validateURL(url);
    if (!urlValidation.valid) {
      res.status(400).json({ error: 'Validation Error', message: urlValidation.error || 'Invalid URL' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.URL,
      content: url,
      language: language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeURL', error: String(err) }, 'Error analyzing URL');
    res.status(500).json({ error: 'URL Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Image / Screenshot Upload Analysis
 * POST /api/analyze/image
 */
router.post('/image', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    let base64 = req.body.image;
    if (req.file) {
      base64 = req.file.buffer.toString('base64');
    }

    if (!base64) {
      res.status(400).json({ error: 'Validation Error', message: 'No image provided' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.Image,
      content: base64,
      language: req.body.language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeImage', error: String(err) }, 'Error analyzing image');
    res.status(500).json({ error: 'Image Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Message / Social / Phishing Check
 * POST /api/analyze/message
 */
router.post('/message', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, language, platform } = req.body;
    let messageContent = content;

    if (req.file) {
      messageContent = req.file.buffer.toString('base64');
    }

    if (!messageContent) {
      res.status(400).json({ error: 'Validation Error', message: 'No message content provided' });
      return;
    }

    const inputType = req.file ? AnalysisType.Screenshot : (platform ? AnalysisType.SocialMedia : AnalysisType.Message);

    const result = await analysisEngine.analyze({
      type: inputType,
      content: messageContent,
      language: language || 'en',
      options: { platform },
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeMessage', error: String(err) }, 'Error analyzing message');
    res.status(500).json({ error: 'Message Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Job Offer / Recruitment Check
 * POST /api/analyze/job
 */
router.post('/job', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, language } = req.body;
    let jobContent = content;

    if (req.file) {
      jobContent = req.file.buffer.toString('base64');
    }

    if (!jobContent) {
      res.status(400).json({ error: 'Validation Error', message: 'No job content or offer letter document provided' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.JobOffer,
      content: jobContent,
      language: language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeJob', error: String(err) }, 'Error analyzing job offer');
    res.status(500).json({ error: 'Job Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Suspicious Payment Request Check
 * POST /api/analyze/payment
 */
router.post('/payment', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, language } = req.body;
    let paymentContent = content;

    if (req.file) {
      paymentContent = req.file.buffer.toString('base64');
    }

    if (!paymentContent) {
      res.status(400).json({ error: 'Validation Error', message: 'No payment content provided' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.PaymentRequest,
      content: paymentContent,
      language: language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzePayment', error: String(err) }, 'Error analyzing payment request');
    res.status(500).json({ error: 'Payment Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * QR Code Check
 * POST /api/analyze/qr
 */
router.post('/qr', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    let qrImage = req.body.image;

    if (req.file) {
      qrImage = req.file.buffer.toString('base64');
    }

    if (!qrImage) {
      res.status(400).json({ error: 'Validation Error', message: 'No QR code image provided' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: AnalysisType.QR,
      content: qrImage,
      language: req.body.language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzeQR', error: String(err) }, 'Error analyzing QR code');
    res.status(500).json({ error: 'QR Analysis Failed', message: err.message || 'Internal server error' });
  }
});

/**
 * Dedicated Phishing Check
 * POST /api/analyze/phishing
 */
router.post('/phishing', async (req: Request, res: Response): Promise<void> => {
  try {
    const { content, type, language } = req.body;
    if (!content) {
      res.status(400).json({ error: 'Validation Error', message: 'No content provided' });
      return;
    }

    const result = await analysisEngine.analyze({
      type: type || AnalysisType.Message,
      content,
      language: language || 'en',
      userId: req.user?.uid,
    });

    res.json(result);
  } catch (err: any) {
    logger.error({ service: 'analyzePhishing', error: String(err) }, 'Error analyzing phishing content');
    res.status(500).json({ error: 'Phishing Analysis Failed', message: err.message || 'Internal server error' });
  }
});

export default router;
