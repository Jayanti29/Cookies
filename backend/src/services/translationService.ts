import axios from 'axios';
import { logger } from '../utils/logger';

const TRANSLATION_API_URL = 'https://translation.googleapis.com/language/translate/v2';

const SUPPORTED_LANGUAGES = ['en', 'hi', 'kn', 'ta', 'te', 'bn', 'mr', 'ml', 'gu', 'pa', 'ur'];

export class TranslationService {
  /**
   * Translate text to the target language using Google Cloud Translation REST API.
   * Falls back to returning the original text on any failure.
   */
  async translate(text: string, targetLang: string): Promise<string> {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;

    if (!apiKey) {
      logger.warn({ service: 'translation' }, 'GOOGLE_CLOUD_API_KEY not set — translation unavailable');
      return text;
    }

    if (!SUPPORTED_LANGUAGES.includes(targetLang)) {
      logger.warn({ service: 'translation', targetLang }, 'Unsupported target language');
      return text;
    }

    if (!text || text.trim().length === 0) return text;

    // Truncate to 5000 chars (API limit per request)
    const truncated = text.slice(0, 5000);

    try {
      const response = await axios.post(
        `${TRANSLATION_API_URL}?key=${apiKey}`,
        {
          q: truncated,
          target: targetLang,
          format: 'text',
        },
        {
          timeout: 10000,
          headers: { 'Content-Type': 'application/json' },
        }
      );

      const translated: string =
        response.data?.data?.translations?.[0]?.translatedText ?? text;

      logger.info(
        { service: 'translation', targetLang, inputLen: text.length },
        'Translation completed'
      );

      return translated;
    } catch (err) {
      logger.error({ service: 'translation', error: String(err) }, 'Translation API call failed');
      return text;
    }
  }

  /** Detect the language of a string */
  async detectLanguage(text: string): Promise<string | null> {
    const apiKey = process.env.GOOGLE_CLOUD_API_KEY;
    if (!apiKey) return null;

    try {
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2/detect?key=${apiKey}`,
        { q: text.slice(0, 500) },
        { timeout: 8000 }
      );

      return response.data?.data?.detections?.[0]?.[0]?.language ?? null;
    } catch {
      return null;
    }
  }
}

export const translationService = new TranslationService();
