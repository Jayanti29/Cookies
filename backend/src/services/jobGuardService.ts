import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'rediffmail.com',
  'yopmail.com', 'mailinator.com', 'tempmail.com',
];

const PAYMENT_KEYWORDS = [
  'pay', 'fee', 'deposit', 'advance', 'registration fee', 'training fee',
  'background check fee', 'kit fee', 'uniform fee', 'security deposit',
  'paytm', 'gpay', 'upi',
];

const URGENCY_KEYWORDS = [
  'urgent', 'immediately', 'asap', 'today', 'limited seats', 'offer expires',
  'don\'t miss', 'last date',
];

interface JobOfferExtract {
  senderEmail: string | null;
  freeDomainFlag: boolean;
  salaryMention: string | null;
  paymentRequest: boolean;
  urgencySignals: string[];
  companyName: string | null;
  isRemote: boolean;
}

function extractJobIndicators(content: string): JobOfferExtract {
  const lower = content.toLowerCase();

  // Email extraction
  const emailMatch = content.match(/[a-zA-Z0-9._%+\-]+@([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})/);
  const senderEmail = emailMatch ? emailMatch[0] : null;
  const senderDomain = emailMatch ? emailMatch[1].toLowerCase() : '';
  const freeDomainFlag = FREE_EMAIL_DOMAINS.includes(senderDomain);

  // Salary
  const salaryMatch = content.match(/(?:salary|ctc|pay|lpa|lakh|per month|monthly|₹|rs\.?)[\s:]*[\d,.]+(?:\s*(?:lakh|lac|k|L|per month))?/i);
  const salaryMention = salaryMatch ? salaryMatch[0] : null;

  // Payment request
  const paymentRequest = PAYMENT_KEYWORDS.some((kw) => lower.includes(kw));

  // Urgency
  const urgencySignals = URGENCY_KEYWORDS.filter((kw) => lower.includes(kw));

  // Company name (simple heuristic)
  const companyMatch = content.match(/(?:company|organization|firm|employer)[\s:]+([A-Za-z &.]+?)(?:\.|,|\n)/i);
  const companyName = companyMatch ? companyMatch[1].trim() : null;

  // Remote work
  const isRemote = lower.includes('work from home') || lower.includes('remote') || lower.includes('wfh');

  return { senderEmail, freeDomainFlag, salaryMention, paymentRequest, urgencySignals, companyName, isRemote };
}

export class JobGuardService {
  async analyzeJobOffer(
    content: string,
    imageBase64?: string,
    language = 'en'
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    logger.info({ service: 'jobGuard' }, 'Analyzing job offer');

    const extract = extractJobIndicators(content);

    const contextLines: string[] = [
      'JOB OFFER ANALYSIS REQUEST',
      '─'.repeat(40),
      `Content:\n${content}`,
      '',
      'Automated pre-checks:',
      `- Sender email: ${extract.senderEmail ?? 'Not found'}`,
      `- Free email domain used: ${extract.freeDomainFlag ? 'YES (suspicious for official company)' : 'No'}`,
      `- Salary mention: ${extract.salaryMention ?? 'Not found'}`,
      `- Payment request detected: ${extract.paymentRequest ? 'YES (very suspicious)' : 'No'}`,
      `- Urgency signals: ${extract.urgencySignals.join(', ') || 'None'}`,
      `- Company name (guessed): ${extract.companyName ?? 'Unknown'}`,
      `- Remote/WFH role: ${extract.isRemote ? 'Yes' : 'No'}`,
    ];

    const input: AnalysisInput = {
      type: AnalysisType.JobOffer,
      content: contextLines.join('\n'),
      language,
    };

    // If an image was also provided, add extracted context
    if (imageBase64) {
      input.content += '\n\n[Note: An image of the offer letter was also provided for visual analysis]';
      // We'll let gemini handle image separately through vision service if needed
    }

    const result = await geminiService.analyzeContent(input);

    logger.info(
      { service: 'jobGuard', duration: Date.now() - startTime, status: result.status },
      'Job offer analysis complete'
    );

    if (extract.paymentRequest) {
      if (result.status === 'safe' || result.status === 'info') {
        result.status = 'multiple_concerns';
      }
      if (!result.findings.some((f) => f.type.includes('payment'))) {
        result.findings.unshift({
          type: 'job_payment_demand',
          severity: 'high',
          observedEvidence: 'Offer letter requests payment, registration fee, or security deposit.',
          explanation: 'Legitimate employers never ask candidates to pay for interviews, equipment dispatch, or training.',
          recommendedAction: 'Never transfer funds to secure employment. Verify the vacancy on the official company careers page.',
          confidence: 0.95,
        });
      }
    }

    result.metadata = {
      freeDomainFlag: extract.freeDomainFlag,
      paymentRequestDetected: extract.paymentRequest,
      urgencySignals: extract.urgencySignals,
    };

    return result;
  }
}

export const jobGuardService = new JobGuardService();
