import { generateContentWithFailover } from '../config/gemini';
import { CookieTruthResult, ConsentReceipt, CookieCategoryStatus, ConsentInterfaceFlag } from '../types';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

export class CookieTruthService {
  /**
   * Analyzes observable cookie banners, consent notices, and privacy choices.
   * Adheres strictly to the honest reporting policy:
   * - Does NOT claim cookies automatically "steal data"
   * - Explains tracking, analytics, and advertising in balanced, clear language
   * - Flags observable UI manipulation (prominent Accept All, buried Reject)
   */
  async analyzeCookieConsent(content: string, url?: string, language: string = 'en'): Promise<CookieTruthResult> {
    const analysisId = generateId();
    const domain = url ? url.replace(/^(https?:\/\/)?(www\.)?/, '').split('/')[0] : 'observed-website.com';

    // Observable pattern heuristics
    const lower = content.toLowerCase();
    const hasProminentAccept = lower.includes('accept all') || lower.includes('agree') || lower.includes('allow all');
    const hasRejectOrManage = lower.includes('reject') || lower.includes('manage') || lower.includes('settings') || lower.includes('customize');
    const hasPreselected = lower.includes('pre-checked') || lower.includes('checked') || lower.includes('enabled by default');
    const mentionsAnalytics = lower.includes('analytic') || lower.includes('performance') || lower.includes('stat') || lower.includes('measurement');
    const mentionsAdvertising = lower.includes('advertis') || lower.includes('marketing') || lower.includes('promot') || lower.includes('target');
    const mentionsThirdParty = lower.includes('third party') || lower.includes('partners') || lower.includes('3rd party') || lower.includes('vendors');

    let categories: CookieCategoryStatus[] = [
      {
        name: 'essential',
        status: 'detected',
        observableDetails: 'Strictly necessary cookies for website operation, authentication, and security.',
      },
      {
        name: 'analytics',
        status: mentionsAnalytics ? 'review' : 'not_detected',
        observableDetails: mentionsAnalytics
          ? 'Notice indicates collection of usage metrics and website traffic analytics.'
          : 'No explicit analytics category observed in the provided snippet.',
      },
      {
        name: 'advertising',
        status: mentionsAdvertising ? 'review' : 'not_detected',
        observableDetails: mentionsAdvertising
          ? 'Notice mentions advertising, personalized offers, or marketing partners.'
          : 'No explicit advertising category observed in the provided snippet.',
      },
      {
        name: 'third_party',
        status: mentionsThirdParty ? 'review' : 'not_detected',
        observableDetails: mentionsThirdParty
          ? 'Notice indicates external partners or third-party service integration.'
          : 'No explicit external vendor list observed in the provided snippet.',
      },
    ];

    let consentFlags: ConsentInterfaceFlag[] = [];

    if (hasProminentAccept && (!hasRejectOrManage || lower.indexOf('accept') < lower.indexOf('manage'))) {
      consentFlags.push({
        type: 'asymmetric_choice',
        severity: 'medium',
        description: '"Accept All" is prominently presented, while rejecting or managing preferences requires additional interaction or is less visible.',
        observedEvidence: 'Notice provides an immediate one-click "Accept All" option, but preference management is secondary.',
      });
    }

    if (hasPreselected) {
      consentFlags.push({
        type: 'preselected_consent',
        severity: 'high',
        description: 'Optional tracking or marketing categories appear to be enabled or pre-selected by default.',
        observedEvidence: 'Terms or checkboxes indicate opt-out rather than explicit opt-in.',
      });
    }

    // AI Enrichment via failover chain (Gemini → Backup Gemini → Groq Key 1 → Groq Key 2)
    if (content.trim().length > 20) {
      try {
        const prompt = `You are COOKIES, an expert digital consent intelligence auditor.
Analyze the following observable cookie banner / consent notice from ${domain}.

CRITICAL ACCURACY RULES:
1. Do NOT claim cookies "steal data" or are automatically malicious.
2. Explain that cookies are tools used for functional operations, analytics, personalization, and targeted ads.
3. Identify observable interface biases (e.g. Accept All prominent, hidden Reject, pre-selected options).
4. Do NOT invent specific third-party tracker companies unless explicitly named in the text.
5. Answer in ${language}.

Text:
"${content.slice(0, 3000)}"

Return ONLY a JSON object with this schema:
{
  "summary": "1-2 sentence plain-language summary of what the user is asked to consent to",
  "whyItMatters": "Why this consent choice matters for the user's data and privacy",
  "hasAnalytics": boolean,
  "hasAdvertising": boolean,
  "hasThirdParty": boolean,
  "consentFlags": [
    {
      "type": "string",
      "severity": "low|medium|high",
      "description": "string",
      "observedEvidence": "string"
    }
  ]
}`;

        const text = await generateContentWithFailover(prompt);
        const cleaned = text.replace(/^```(?:json)?\n?/m, '').replace(/\n?```$/m, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.hasAnalytics !== undefined) {
          categories[1].status = parsed.hasAnalytics ? 'review' : 'not_detected';
        }
        if (parsed.hasAdvertising !== undefined) {
          categories[2].status = parsed.hasAdvertising ? 'review' : 'not_detected';
        }
        if (parsed.hasThirdParty !== undefined) {
          categories[3].status = parsed.hasThirdParty ? 'review' : 'not_detected';
        }
        if (Array.isArray(parsed.consentFlags) && parsed.consentFlags.length > 0) {
          consentFlags = parsed.consentFlags;
        }

        const receipt = this.generateReceipt(domain, categories, consentFlags);

        return {
          analysisId,
          url,
          categories,
          consentFlags,
          summary: parsed.summary || 'Cookie notice asks for tracking and operational consent.',
          whyItMatters: parsed.whyItMatters || 'Consenting allows the website to track your visits across sessions for measurement and marketing purposes.',
          receipt,
          createdAt: new Date().toISOString(),
        };
      } catch (err) {
        logger.warn({ service: 'cookieTruth', error: String(err) }, 'AI cookie analysis fallback to heuristic');
      }
    }

    const defaultSummary = consentFlags.length > 0
      ? 'This consent interface nudges visitors toward accepting all tracking categories with a single click.'
      : 'Standard cookie information observed. Review specific categories before accepting.';

    const defaultWhyItMatters = 'Cookies themselves are normal web technologies. However, accepting advertising and analytics cookies permits cross-site behavioral tracking and profile building.';

    const receipt = this.generateReceipt(domain, categories, consentFlags);

    return {
      analysisId,
      url,
      categories,
      consentFlags,
      summary: defaultSummary,
      whyItMatters: defaultWhyItMatters,
      receipt,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Generates a verifiable human-readable Digital Consent Receipt
   */
  generateReceipt(website: string, categories: CookieCategoryStatus[], flags: ConsentInterfaceFlag[]): ConsentReceipt {
    return {
      receiptId: `rcpt_${generateId().slice(0, 8)}`,
      website,
      timestamp: new Date().toISOString(),
      observedChoices: {
        essential: categories.some((c) => c.name === 'essential' && c.status === 'detected'),
        analytics: categories.some((c) => c.name === 'analytics' && c.status === 'review'),
        advertising: categories.some((c) => c.name === 'advertising' && c.status === 'review'),
        thirdParty: categories.some((c) => c.name === 'third_party' && c.status === 'review'),
      },
      observedInterfaceFlags: flags.map((f) => f.description),
      potentialImpact: 'You may be consenting to behavioral profile building, analytics recording, and marketing partner sharing across browsing sessions.',
      verificationAdvice: 'Open the website\'s "Manage Cookies" or "Preferences" modal to deselect marketing categories before clicking Accept.',
    };
  }
}

export const cookieTruthService = new CookieTruthService();
