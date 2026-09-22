import { geminiModel } from '../config/gemini';
import { AnalysisInput, AnalysisResult, AnalysisStatus, Finding } from '../types';
import { generateId, stripDataURI, mimeFromDataURI } from '../utils/helpers';
import { logger } from '../utils/logger';

// ─── System instruction for the COOKIES safety analyst persona ────────────────

const SYSTEM_INSTRUCTION = `You are COOKIES, a consumer digital-safety analysis assistant.
Analyze ONLY the evidence provided.
Separate: (1) directly observed evidence (2) reasonable interpretation (3) uncertainty.
NEVER invent external facts, company info, URLs, or verification results.
Prefer phrases like: 'potentially suspicious', 'review before proceeding', 'possible indicators'.
NEVER say an item is definitely a scam without clear, unambiguous evidence.
Explain in simple language suitable for a general consumer. Give practical verification steps.
Return ONLY valid JSON matching the requested schema — no markdown, no prose, just the JSON object.`;

// ─── Expected JSON schema for Gemini responses ────────────────────────────────

const RESPONSE_SCHEMA_DESC = `{
  "status": "safe|info|review|multiple_concerns|high_concern",
  "category": "string (short label, e.g. 'Dark Pattern' or 'Phishing Attempt')",
  "summary": "string (1-2 plain-language sentences for a general consumer)",
  "findings": [
    {
      "dimension": "money|data|manipulation",
      "type": "string (e.g. 'hidden_fee', 'cookie_consent_trap', 'fake_urgency')",
      "severity": "low|medium|high",
      "observedEvidence": "string (exactly what was seen in the content)",
      "interpretation": "string (reasonable inference without speculation)",
      "whyItMatters": "string (why the consumer should care)",
      "whatIsUncertain": "string (what cannot be verified from the interface alone)",
      "whatToVerify": "string (concrete step the consumer can check)",
      "explanation": "string (1-line overview)",
      "recommendedAction": "string (what the consumer should do)",
      "confidence": 0.85
    }
  ],
  "uncertainties": ["string"],
  "needsVerification": true,
  "recommendedActions": ["string"]
}`;

// ─── Prompt builders ──────────────────────────────────────────────────────────

function buildPrompt(input: AnalysisInput): string {
  const lang = input.language && input.language !== 'en' ? `\nRespond in ${input.language}.` : '';
  const baseInstruction = `${SYSTEM_INSTRUCTION}${lang}\n\nReturn ONLY a JSON object matching this schema:\n${RESPONSE_SCHEMA_DESC}\n\n`;

  switch (input.type) {
    case 'website':
    case 'url':
      return `${baseInstruction}Analyze this website content for dark patterns, subscription traps, hidden fees, misleading UI, and consumer safety issues.\n\nWebsite content:\n${input.content}`;

    case 'message':
    case 'email':
    case 'text':
      return `${baseInstruction}Analyze this message/email for phishing indicators, impersonation, urgency tactics, suspicious links, credential requests, and payment fraud.\n\nMessage content:\n${input.content}`;

    case 'job_offer':
      return `${baseInstruction}Analyze this job offer for employment scam indicators: payment requests, suspicious email domains, unrealistic salaries, vague job descriptions, and advance-fee fraud patterns.\n\nJob offer content:\n${input.content}`;

    case 'social_media':
      return `${baseInstruction}Analyze this social media content for giveaway scams, fake sponsorships, impersonation, prize fraud, recruitment scams, and data harvesting tactics.\n\nSocial media content:\n${input.content}`;

    case 'payment_request':
      return `${baseInstruction}Analyze this payment request for fraud indicators: unsolicited collect requests, UPI scams, wire fraud, advance fee fraud, suspicious amounts and senders.\n\nPayment request content:\n${input.content}`;

    case 'image':
    case 'screenshot':
    case 'document':
    case 'camera_frame':
      return `${baseInstruction}Analyze the provided image/document for any scam, fraud, phishing, or consumer safety concerns. Describe everything you observe that could indicate risk.\n\nExtracted text / context:\n${input.content}`;

    case 'qr':
      return `${baseInstruction}Analyze this QR code destination and context for safety concerns: suspicious domains, payment fraud, phishing redirects.\n\nQR code context:\n${input.content}`;

    default:
      return `${baseInstruction}Analyze this content for any consumer safety, scam, or fraud indicators.\n\nContent:\n${input.content}`;
  }
}

// ─── Response parser ──────────────────────────────────────────────────────────

function parseGeminiResponse(text: string): Partial<AnalysisResult> {
  // Strip markdown code fences if present
  const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();

  try {
    const parsed = JSON.parse(cleaned);
    return parsed as Partial<AnalysisResult>;
  } catch {
    // Attempt to extract JSON object from surrounding text
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as Partial<AnalysisResult>;
      } catch {
        // Fall through to error result
      }
    }
    throw new Error(`Failed to parse Gemini response as JSON: ${cleaned.slice(0, 200)}`);
  }
}

function fallbackResult(reason: string): AnalysisResult {
  return {
    analysisId: generateId(),
    status: AnalysisStatus.Info,
    category: 'Analysis Unavailable',
    summary: 'AI analysis service temporarily unavailable. Please try again shortly.',
    findings: [],
    uncertainties: [reason],
    recommendedActions: ['Try again in a few moments', 'Contact support if the problem persists'],
    needsVerification: true,
  };
}

// ─── GeminiService class ──────────────────────────────────────────────────────

export class GeminiService {
  async analyzeContent(input: AnalysisInput): Promise<AnalysisResult> {
    if (!geminiModel) {
      logger.warn({ service: 'gemini' }, 'Gemini model not initialized — returning fallback');
      return fallbackResult('Gemini API key not configured');
    }

    const startTime = Date.now();

    try {
      const prompt = buildPrompt(input);

      // Build the parts array — include image if content looks like base64
      const parts: Array<{ text: string } | { inlineData: { mimeType: string; data: string } }> = [];

      // Check if content is a base64 image (data URI or raw base64 with image context)
      const isImageType = ['image', 'screenshot', 'document', 'camera_frame', 'qr'].includes(input.type);
      const isBase64 = input.content.includes('base64,') || (isImageType && /^[A-Za-z0-9+/]+=*$/.test(input.content.slice(0, 100)));

      if (isImageType && isBase64 && input.content.length > 100) {
        const mimeType = mimeFromDataURI(input.content) || 'image/jpeg';
        const data = stripDataURI(input.content);
        parts.push({ inlineData: { mimeType, data } });
        parts.push({ text: buildPrompt({ ...input, content: '[See attached image]' }) });
      } else {
        parts.push({ text: prompt });
      }

      const result = await geminiModel.generateContent({
        contents: [{ role: 'user', parts }],
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      const responseText = result.response.text();
      const parsed = parseGeminiResponse(responseText);

      const rawFindings = (parsed.findings as Finding[]) ?? [];
      const triSummary = {
        money: { count: 0, items: [] as string[] },
        data: { count: 0, items: [] as string[] },
        manipulation: { count: 0, items: [] as string[] },
      };

      const findings = rawFindings.map((f) => {
        let dim = f.dimension;
        if (!dim) {
          const t = (f.type || '').toLowerCase();
          if (t.includes('fee') || t.includes('subscription') || t.includes('price') || t.includes('cost') || t.includes('payment') || t.includes('billing')) {
            dim = 'money';
          } else if (t.includes('cookie') || t.includes('tracking') || t.includes('privacy') || t.includes('data') || t.includes('consent')) {
            dim = 'data';
          } else {
            dim = 'manipulation';
          }
        }
        if (triSummary[dim]) {
          triSummary[dim].count++;
          triSummary[dim].items.push(f.explanation || f.type);
        }
        return { ...f, dimension: dim };
      });

      const analysisResult: AnalysisResult = {
        analysisId: generateId(),
        status: parsed.status ?? AnalysisStatus.Info,
        category: parsed.category ?? 'General Analysis',
        summary: parsed.summary ?? 'Analysis complete.',
        findings,
        triDimensionSummary: triSummary,
        uncertainties: parsed.uncertainties ?? [],
        recommendedActions: parsed.recommendedActions ?? [],
        needsVerification: parsed.needsVerification ?? true,
        createdAt: new Date().toISOString(),
      };

      logger.info(
        { service: 'gemini', duration: Date.now() - startTime, status: analysisResult.status },
        'Gemini analysis completed'
      );

      return analysisResult;
    } catch (err) {
      logger.error(
        { service: 'gemini', duration: Date.now() - startTime, error: String(err) },
        'Gemini analysis failed'
      );
      return fallbackResult(String(err));
    }
  }
}

export const geminiService = new GeminiService();
