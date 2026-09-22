import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import axios from 'axios';
import { logger } from '../utils/logger';

let geminiModel: GenerativeModel | null = null;
let geminiBackupModel: GenerativeModel | null = null;

function initGemini(): void {
  const apiKey = process.env.GEMINI_API_KEY;
  const backupKey = process.env.GEMINI_API_KEY_BACKUP;

  if (apiKey) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      geminiModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });
      logger.info({ service: 'gemini', model: 'gemini-2.5-flash' }, 'Primary Gemini AI client initialized');
    } catch (err) {
      logger.error({ service: 'gemini', error: String(err) }, 'Primary Gemini initialization error');
    }
  }

  if (backupKey) {
    try {
      const backupGenAI = new GoogleGenerativeAI(backupKey);
      geminiBackupModel = backupGenAI.getGenerativeModel({
        model: 'gemini-3.6-flash',
        generationConfig: {
          temperature: 0.2,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: 4096,
        },
      });
      logger.info({ service: 'gemini', model: 'gemini-3.6-flash' }, 'Secondary Gemini AI client initialized');
    } catch (err) {
      logger.error({ service: 'gemini', error: String(err) }, 'Secondary Gemini initialization error');
    }
  }
}

initGemini();

/**
 * Executes AI generation with multi-key failover:
 * 1. Primary Gemini Key (gemini-2.5-flash)
 * 2. Secondary Gemini Key (gemini-3.6-flash)
 * 3. Groq API Key 1 (qwen/qwen3.8-27b)
 * 4. Groq API Key 2 (qwen/qwen3.8-27b) — final safety net
 */
export async function generateContentWithFailover(prompt: string, systemInstruction?: string): Promise<string> {
  // 1. Primary Gemini Call
  if (geminiModel) {
    try {
      const res = await geminiModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction,
      });
      return res.response.text();
    } catch (err: any) {
      logger.warn({ service: 'gemini', error: String(err?.message || err) }, 'Primary Gemini quota reached, rotating to secondary key');
    }
  }

  // 2. Secondary Gemini Call
  if (geminiBackupModel) {
    try {
      const res = await geminiBackupModel.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        systemInstruction,
      });
      logger.info({ service: 'gemini' }, 'Secondary Gemini key request succeeded');
      return res.response.text();
    } catch (err: any) {
      logger.warn({ service: 'gemini', error: String(err?.message || err) }, 'Secondary Gemini quota reached, rotating to Groq');
    }
  }

  // Helper: call a single Groq key
  async function tryGroq(apiKey: string, keyLabel: string): Promise<string | null> {
    try {
      logger.info({ service: 'aiFailover', key: keyLabel }, `Executing Groq failover inference with ${keyLabel}`);
      const messages: any[] = [];
      if (systemInstruction) {
        messages.push({ role: 'system', content: systemInstruction });
      }
      messages.push({ role: 'user', content: prompt });

      const response = await axios.post(
        'https://api.groq.com/openai/v1/chat/completions',
        {
          model: 'qwen/qwen3.8-27b',
          messages,
          temperature: 0.2,
          max_tokens: 4096,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          timeout: 25000,
        }
      );

      const content = response.data?.choices?.[0]?.message?.content;
      return content || null;
    } catch (err: any) {
      logger.warn({ service: 'aiFailover', key: keyLabel, error: String(err?.message || err) }, `${keyLabel} Groq call failed`);
      return null;
    }
  }

  // 3. Groq Key 1 Failover
  const groqKey1 = process.env.GROQ_API_KEY;
  if (groqKey1) {
    const result = await tryGroq(groqKey1, 'GROQ_KEY_1');
    if (result) return result;
  }

  // 4. Groq Key 2 Failover (final safety net)
  const groqKey2 = process.env.GROQ_API_KEY_2;
  if (groqKey2) {
    const result = await tryGroq(groqKey2, 'GROQ_KEY_2');
    if (result) return result;
  }

  throw new Error('All configured AI providers and keys reached their quota or limits.');
}

export { geminiModel, geminiBackupModel };
