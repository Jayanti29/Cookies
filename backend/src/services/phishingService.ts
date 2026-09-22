import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { logger } from '../utils/logger';

const URGENCY_PATTERNS = [
  /urgent/i, /immediately/i, /account.*blocked/i, /suspend/i, /verify.*now/i,
  /expire/i, /24 hours/i, /48 hours/i, /action required/i, /जल्दी/i,
];

const CREDENTIAL_PATTERNS = [
  /enter.*pin/i, /atm pin/i, /otp/i, /password/i, /login.*detail/i,
  /card.*number/i, /cvv/i, /account.*number/i, /upi.*pin/i,
];

const PAYMENT_PATTERNS = [
  /send money/i, /transfer/i, /pay.*now/i, /click.*pay/i, /collect.*request/i,
  /wire.*transfer/i, /gift card/i,
];

const SUSPICIOUS_LINK_PATTERNS = [
  /bit\.ly/i, /tinyurl/i, /t\.co/i, /goo\.gl/i,
  /(?:secure|verify|account|login|update)-[a-z]+\./i,
  /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/, // IP address as domain
];

const IMPERSONATION_KEYWORDS = [
  'sbi', 'hdfc', 'icici', 'paytm', 'irdai', 'uidai', 'aadhaar',
  'amazon', 'flipkart', 'google', 'microsoft', 'apple', 'rbi',
  'income tax', 'tds', 'epfo', 'customs', 'police', 'court',
];

interface PhishingSignals {
  urgencyCount: number;
  credentialRequest: boolean;
  paymentRequest: boolean;
  suspiciousLinks: string[];
  impersonationTargets: string[];
  threatPresent: boolean;
}

function detectPhishingSignals(content: string): PhishingSignals {
  const lower = content.toLowerCase();

  const urgencyCount = URGENCY_PATTERNS.filter((p) => p.test(content)).length;
  const credentialRequest = CREDENTIAL_PATTERNS.some((p) => p.test(content));
  const paymentRequest = PAYMENT_PATTERNS.some((p) => p.test(content));

  // Extract URLs and flag suspicious ones
  const urlMatches = content.match(/https?:\/\/[^\s"'<>]+/g) ?? [];
  const suspiciousLinks = urlMatches.filter((url) =>
    SUSPICIOUS_LINK_PATTERNS.some((p) => p.test(url))
  );

  const impersonationTargets = IMPERSONATION_KEYWORDS.filter((kw) => lower.includes(kw));

  const threatPresent =
    /arrest|police|jail|legal action|fir|case.*filed|court.*notice/i.test(content);

  return {
    urgencyCount,
    credentialRequest,
    paymentRequest,
    suspiciousLinks,
    impersonationTargets,
    threatPresent,
  };
}

export class PhishingAnalysisService {
  async analyze(content: string, type = 'message', language = 'en'): Promise<AnalysisResult> {
    const startTime = Date.now();
    logger.info({ service: 'phishing', type }, 'Analyzing for phishing signals');

    const signals = detectPhishingSignals(content);

    const contextLines: string[] = [
      `PHISHING / MESSAGE ANALYSIS REQUEST (type: ${type})`,
      '─'.repeat(40),
      `Content:\n${content}`,
      '',
      'Pre-scan signals:',
      `- Urgency signals detected: ${signals.urgencyCount}`,
      `- Credential request: ${signals.credentialRequest ? 'YES' : 'No'}`,
      `- Payment request: ${signals.paymentRequest ? 'YES' : 'No'}`,
      `- Suspicious links: ${signals.suspiciousLinks.join(', ') || 'None'}`,
      `- Possible impersonation targets: ${signals.impersonationTargets.join(', ') || 'None'}`,
      `- Legal/arrest threats: ${signals.threatPresent ? 'YES' : 'No'}`,
    ];

    const input: AnalysisInput = {
      type: type === 'email' ? AnalysisType.Email : AnalysisType.Message,
      content: contextLines.join('\n'),
      language,
    };

    const result = await geminiService.analyzeContent(input);

    logger.info(
      { service: 'phishing', duration: Date.now() - startTime, status: result.status },
      'Phishing analysis complete'
    );

    result.metadata = {
      urgencyCount: signals.urgencyCount,
      credentialRequest: signals.credentialRequest,
      paymentRequest: signals.paymentRequest,
      suspiciousLinkCount: signals.suspiciousLinks.length,
      impersonationTargets: signals.impersonationTargets,
    };

    return result;
  }
}

export const phishingAnalysisService = new PhishingAnalysisService();
