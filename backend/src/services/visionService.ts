import axios from 'axios';
import { VisionResult, TextBlock } from '../types';
import { logger } from '../utils/logger';
import { stripDataURI } from '../utils/helpers';

const VISION_API_URL = 'https://vision.googleapis.com/v1/images:annotate';

export class VisionService {
  /**
   * Extract text from a base64-encoded image using Google Cloud Vision REST API.
   * Returns gracefully if the API key is missing or the call fails.
   */
  async extractText(imageBase64: string): Promise<VisionResult> {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      logger.warn({ service: 'vision' }, 'GOOGLE_CLOUD_API_KEY not set — OCR unavailable');
      return { text: '', blocks: [], available: false };
    }

    const cleanBase64 = stripDataURI(imageBase64);

    try {
      const response = await axios.post(
        `${VISION_API_URL}?key=${apiKey}`,
        {
          requests: [
            {
              image: { content: cleanBase64 },
              features: [{ type: 'DOCUMENT_TEXT_DETECTION', maxResults: 1 }],
            },
          ],
        },
        {
          timeout: 15000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const annotation = response.data?.responses?.[0]?.fullTextAnnotation;
      if (!annotation) {
        logger.info({ service: 'vision' }, 'Vision API returned no text annotation');
        return { text: '', blocks: [], available: true };
      }

      const text: string = annotation.text ?? '';
      const blocks: TextBlock[] = (annotation.pages ?? []).flatMap(
        (page: { blocks?: Array<{ paragraphs?: Array<{ words?: Array<{ symbols?: Array<{ text?: string }> }> }> }> }) =>
          (page.blocks ?? []).map((block) => ({
            text: (block.paragraphs ?? [])
              .flatMap((p) => (p.words ?? []))
              .flatMap((w) => (w.symbols ?? []))
              .map((s) => s.text ?? '')
              .join(''),
            confidence: undefined,
          }))
      );

      logger.info(
        { service: 'vision', textLength: text.length, blockCount: blocks.length },
        'Vision OCR completed'
      );

      return { text, blocks, available: true };
    } catch (err) {
      logger.error({ service: 'vision', error: String(err) }, 'Vision API call failed');
      return { text: '', blocks: [], available: false };
    }
  }
}

export const visionService = new VisionService();
