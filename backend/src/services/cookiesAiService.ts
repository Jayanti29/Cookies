import { geminiModel } from '../config/gemini';
import { ChatRequest, ChatResponse } from '../types';
import { logger } from '../utils/logger';

export class CookiesAiService {
  /**
   * Conversational consumer digital-safety assistant powered strictly by Google Gemini.
   */
  async chat(request: ChatRequest): Promise<ChatResponse> {
    const { message, context, language = 'en' } = request;

    if (!geminiModel) {
      return {
        reply: 'COOKIES AI assistant is currently running in offline fallback mode. Please check your safety settings or try again shortly.',
        uncertainties: ['Google Gemini connection not active locally.'],
        recommendedVerifications: ['Review the safety guidelines directly in the Learn section.'],
      };
    }

    try {
      let contextString = '';
      if (context?.currentAnalysis) {
        contextString = `\nActive Evidence Context:\n${JSON.stringify(context.currentAnalysis, null, 2)}`;
      }
      if (context?.url) {
        contextString += `\nTarget URL: ${context.url}`;
      }

      const prompt = `You are "COOKIES AI", an empathetic, honest consumer digital safety assistant.
Your mission is to help people understand: "What is this website asking me to give away — my MONEY, my DATA, or BOTH?"

RULES:
1. Ground answers strictly in user evidence and observable facts.
2. Clearly distinguish OBSERVED FACTS from INFERENCE and UNCERTAINTY.
3. NEVER claim something is 100% scam or 100% safe without definitive evidence.
4. Explain in simple, accessible language suitable for everyday consumers.
5. If asked to explain in an Indian language (e.g. Hindi, Tamil, Kannada, Telugu, Bengali, Marathi, Malayalam), respond fluently in that language.
6. Provide concrete, practical verification steps.

${contextString}

User Query: "${message}"

Return ONLY a JSON object matching this schema:
{
  "reply": "Your clear, empathetic answer to the consumer",
  "citedEvidence": ["string (facts directly observed from the context or query)"],
  "uncertainties": ["string (things that cannot be proven from interface alone)"],
  "recommendedVerifications": ["string (practical checks for the user)"]
}`;

      const response = await geminiModel.generateContent(prompt);
      const text = response.response.text();
      const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
      const parsed = JSON.parse(cleaned);

      return {
        reply: parsed.reply || 'I reviewed your query based on observed digital safety patterns.',
        citedEvidence: parsed.citedEvidence || [],
        uncertainties: parsed.uncertainties || ['Real website backend data practices cannot be verified from client interfaces alone.'],
        recommendedVerifications: parsed.recommendedVerifications || ['Inspect the final payment screen and privacy policy before proceeding.'],
      };
    } catch (err: any) {
      logger.error({ service: 'cookiesAi', error: String(err) }, 'Failed to generate AI chat response');
      return {
        reply: `I analyzed your question: "${message}". Always check whether the platform is requesting unexpected upfront money (like security deposits) or asking you to consent to broad data-sharing before you proceed.`,
        uncertainties: ['External live verification unavailable in offline mode.'],
        recommendedVerifications: ['Check official support portals and verify URLs carefully.'],
      };
    }
  }
}

export const cookiesAiService = new CookiesAiService();
