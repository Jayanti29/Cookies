import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { logger } from '../utils/logger';

let geminiModel: GenerativeModel | null = null;

function initGemini(): void {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    logger.warn({ service: 'gemini' }, 'GEMINI_API_KEY not set — Gemini features will be unavailable');
    return;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    geminiModel = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 0.2,
        topP: 0.8,
        topK: 40,
        maxOutputTokens: 4096,
      },
    });
    logger.info({ service: 'gemini', model: 'gemini-1.5-flash' }, 'Gemini AI client initialized');
  } catch (err) {
    logger.error({ service: 'gemini', error: String(err) }, 'Gemini initialization error');
  }
}

initGemini();

export { geminiModel };
