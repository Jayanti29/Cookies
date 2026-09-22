import axios from 'axios';
import * as cheerio from 'cheerio';
import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { isValidURL, generateId, truncate } from '../utils/helpers';
import { logger } from '../utils/logger';

const SUBSCRIPTION_KEYWORDS = [
  'subscription', 'auto-renew', 'recurring', 'monthly fee', 'annual fee',
  'membership', 'free trial', 'cancel anytime', 'billing cycle', 'subscribe',
  'सदस्यता', 'ऑटो-नवीनीकरण',
];

const URGENCY_KEYWORDS = [
  'limited time', 'expires', 'hurry', 'act now', 'only left', 'last chance',
  'today only', 'flash sale', 'countdown', 'urgent', 'jaldi',
];

const CANCELLATION_KEYWORDS = [
  'cancel', 'unsubscribe', 'stop', 'end membership', 'terminate',
];

const REFUND_KEYWORDS = [
  'refund', 'money back', 'return policy', 'no refund', 'all sales final',
];

function extractMeta(html: string): {
  prices: string[];
  subscriptionFlags: string[];
  urgencyFlags: string[];
  cancellationInfo: string;
  refundInfo: string;
  textContent: string;
} {
  const $ = cheerio.load(html);

  // Remove script/style/nav elements to get meaningful text
  $('script, style, nav, footer, header').remove();

  const textContent = $('body').text().replace(/\s+/g, ' ').trim();

  const lower = textContent.toLowerCase();

  const prices: string[] = [];
  const priceRegex = /(?:₹|rs\.?|inr|usd|\$|€|£)\s*[\d,]+(?:\.\d{1,2})?/gi;
  let m: RegExpExecArray | null;
  while ((m = priceRegex.exec(textContent)) !== null) {
    prices.push(m[0]);
  }

  const subscriptionFlags = SUBSCRIPTION_KEYWORDS.filter((kw) => lower.includes(kw));
  const urgencyFlags = URGENCY_KEYWORDS.filter((kw) => lower.includes(kw));
  const hasCancellation = CANCELLATION_KEYWORDS.some((kw) => lower.includes(kw));
  const hasRefund = REFUND_KEYWORDS.some((kw) => lower.includes(kw));

  return {
    prices: [...new Set(prices)],
    subscriptionFlags,
    urgencyFlags,
    cancellationInfo: hasCancellation ? 'Cancellation terms found' : 'No cancellation terms visible',
    refundInfo: hasRefund ? 'Refund policy mentioned' : 'No refund policy found',
    textContent: truncate(textContent, 8000),
  };
}

export class WebsiteAnalysisService {
  async analyzeURL(url: string, language = 'en'): Promise<AnalysisResult> {
    if (!isValidURL(url)) {
      return {
        analysisId: generateId(),
        status: 'info',
        category: 'Invalid URL',
        summary: 'The provided URL is not a valid HTTP/HTTPS address.',
        findings: [],
        uncertainties: ['URL format is invalid'],
        recommendedActions: ['Ensure the URL starts with https:// or http://'],
        createdAt: new Date().toISOString(),
      };
    }

    let htmlContent = '';
    let fetchError = '';

    try {
      const response = await axios.get(url, {
        timeout: 10000,
        maxContentLength: 2 * 1024 * 1024, // 2 MB
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; COOKIES-SafetyBot/1.0; +https://cookies.app)',
          Accept: 'text/html,application/xhtml+xml',
        },
        responseType: 'text',
      });
      htmlContent = response.data as string;
    } catch (err) {
      fetchError = String(err);
      logger.warn({ service: 'website', url: url.split('?')[0], error: fetchError }, 'URL fetch failed');
    }

    let evidenceSummary: string;

    if (htmlContent) {
      const meta = extractMeta(htmlContent);
      evidenceSummary = [
        `URL: ${url}`,
        `Prices found: ${meta.prices.join(', ') || 'None'}`,
        `Subscription signals: ${meta.subscriptionFlags.join(', ') || 'None'}`,
        `Urgency signals: ${meta.urgencyFlags.join(', ') || 'None'}`,
        `Cancellation: ${meta.cancellationInfo}`,
        `Refund: ${meta.refundInfo}`,
        `\nPage text (truncated):\n${meta.textContent}`,
      ].join('\n');
    } else {
      evidenceSummary = [
        `URL: ${url}`,
        `Could not fetch page content: ${fetchError}`,
        'Analyze the URL structure and domain for suspicious indicators.',
      ].join('\n');
    }

    const input: AnalysisInput = {
      type: AnalysisType.Website,
      content: evidenceSummary,
      language,
    };

    const result = await geminiService.analyzeContent(input);
    result.metadata = { url, fetchSuccess: htmlContent.length > 0 };
    return result;
  }
}

export const websiteAnalysisService = new WebsiteAnalysisService();
