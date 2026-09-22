import { db } from '../config/firebase';
import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { visionService } from './visionService';
import { websiteAnalysisService } from './websiteService';
import { jobGuardService } from './jobGuardService';
import { phishingAnalysisService } from './phishingService';
import { socialScamService } from './socialScamService';
import { paymentAnalysisService } from './paymentService';
import { qrService } from './qrService';
import { getDemoResultForType } from '../utils/demoData';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const DEMO_MODE = process.env.DEMO_MODE === 'true';

export class AnalysisEngine {
  /**
   * Central orchestrator — routes analysis requests to the appropriate service
   * based on input.type, adds analysisId, and optionally persists to Firestore.
   */
  async analyze(input: AnalysisInput): Promise<AnalysisResult> {
    const requestId = generateId();
    const startTime = Date.now();

    logger.info(
      { service: 'analysisEngine', requestId, type: input.type },
      'Analysis started'
    );

    // ── Demo mode ─────────────────────────────────────────────────────────────
    if (DEMO_MODE) {
      const demo = getDemoResultForType(input.type);
      logger.info({ service: 'analysisEngine', requestId, type: input.type }, 'Returning demo result');
      return { ...demo, analysisId: generateId() };
    }

    let result: AnalysisResult;

    try {
      result = await this.route(input, requestId);
    } catch (err) {
      logger.error(
        { service: 'analysisEngine', requestId, type: input.type, error: String(err) },
        'Analysis routing error'
      );
      result = {
        analysisId: generateId(),
        status: 'info',
        category: 'Analysis Error',
        summary: 'An error occurred during analysis. Please try again.',
        findings: [],
        uncertainties: [String(err)],
        recommendedActions: ['Try again in a moment'],
        createdAt: new Date().toISOString(),
      };
    }

    // Ensure analysisId is always set
    if (!result.analysisId) {
      result.analysisId = generateId();
    }
    result.createdAt = result.createdAt ?? new Date().toISOString();

    const duration = Date.now() - startTime;

    logger.info(
      {
        service: 'analysisEngine',
        requestId,
        type: input.type,
        duration,
        status: result.status,
        success: true,
      },
      'Analysis completed'
    );

    // ── Persist to Firestore if requested ─────────────────────────────────────
    if (input.options?.saveResult && input.userId) {
      this.saveToFirestore(input.userId, result).catch((err) => {
        logger.error(
          { service: 'analysisEngine', requestId, error: String(err) },
          'Failed to save analysis to Firestore'
        );
      });
    }

    return result;
  }

  private async route(input: AnalysisInput, requestId: string): Promise<AnalysisResult> {
    const type = input.type as AnalysisType | string;
    const lang = input.language ?? 'en';

    switch (type) {
      // ── Website / URL ──────────────────────────────────────────────────────
      case AnalysisType.Website:
      case AnalysisType.URL:
      case 'website':
      case 'url':
        return websiteAnalysisService.analyzeURL(input.content, lang);

      // ── Image types — OCR then Gemini ──────────────────────────────────────
      case AnalysisType.Image:
      case AnalysisType.Screenshot:
      case AnalysisType.CameraFrame:
      case 'image':
      case 'screenshot':
      case 'camera_frame': {
        const visionResult = await visionService.extractText(input.content);
        const analysisInput: AnalysisInput = {
          ...input,
          content: visionResult.available && visionResult.text
            ? `Extracted text:\n${visionResult.text}\n\nOriginal image also provided.`
            : input.content,
        };
        return geminiService.analyzeContent(analysisInput);
      }

      // ── Document — OCR then Gemini ─────────────────────────────────────────
      case AnalysisType.Document:
      case 'document': {
        const visionResult = await visionService.extractText(input.content);
        const analysisInput: AnalysisInput = {
          ...input,
          content: visionResult.available && visionResult.text
            ? `Document text:\n${visionResult.text}`
            : input.content,
        };
        return geminiService.analyzeContent(analysisInput);
      }

      // ── Message / Email / Text → Phishing service ──────────────────────────
      case AnalysisType.Message:
      case AnalysisType.Email:
      case AnalysisType.Text:
      case 'message':
      case 'email':
      case 'text':
        return phishingAnalysisService.analyze(input.content, type, lang);

      // ── Job Offer ──────────────────────────────────────────────────────────
      case AnalysisType.JobOffer:
      case 'job_offer':
        return jobGuardService.analyzeJobOffer(input.content, undefined, lang);

      // ── QR Code → decode → website analysis ───────────────────────────────
      case AnalysisType.QR:
      case 'qr': {
        const qrResult = await qrService.decodeQR(input.content);
        if (qrResult.destination) {
          logger.info(
            { service: 'analysisEngine', requestId, destination: qrResult.destination },
            'QR decoded, analyzing destination'
          );
          // If QR points to a URL, analyze it; otherwise treat as text
          if (/^https?:\/\//i.test(qrResult.destination)) {
            const urlResult = await websiteAnalysisService.analyzeURL(qrResult.destination, lang);
            urlResult.metadata = {
              ...urlResult.metadata,
              qrDestination: qrResult.destination,
              qrDecoded: true,
            };
            return urlResult;
          } else {
            return phishingAnalysisService.analyze(
              `QR code content: ${qrResult.destination}`,
              'text',
              lang
            );
          }
        } else {
          // Could not decode — analyze image visually
          const analysisInput: AnalysisInput = {
            ...input,
            content: 'QR code image provided. Could not automatically decode — please visually inspect.',
          };
          return geminiService.analyzeContent(analysisInput);
        }
      }

      // ── Payment Request ────────────────────────────────────────────────────
      case AnalysisType.PaymentRequest:
      case 'payment_request':
        return paymentAnalysisService.analyze(input.content, undefined, lang);

      // ── Social Media ───────────────────────────────────────────────────────
      case AnalysisType.SocialMedia:
      case 'social_media': {
        const platform = input.options?.platform ?? 'unknown';
        return socialScamService.analyze(input.content, platform, undefined, lang);
      }

      // ── Default — generic Gemini analysis ─────────────────────────────────
      default:
        logger.warn(
          { service: 'analysisEngine', requestId, type },
          'Unknown analysis type — using generic Gemini analysis'
        );
        return geminiService.analyzeContent(input);
    }
  }

  /** Persist analysis result to Firestore (fire-and-forget) */
  private async saveToFirestore(userId: string, result: AnalysisResult): Promise<void> {
    if (!db || typeof (db as any).collection !== 'function') {
      logger.warn({ service: 'analysisEngine' }, 'Firestore not available — skipping persist');
      return;
    }

    await (db as any)
      .collection('analyses')
      .doc(result.analysisId)
      .set({
        ...result,
        userId,
        savedAt: new Date().toISOString(),
      });

    logger.info(
      { service: 'analysisEngine', analysisId: result.analysisId },
      'Analysis persisted to Firestore'
    );
  }
}

export const analysisEngine = new AnalysisEngine();
