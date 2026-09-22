import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { logger } from '../utils/logger';

interface PaymentExtract {
  amount: string | null;
  currency: string;
  reason: string | null;
  sender: string | null;
  paymentMethod: string | null;
  urgencyPresent: boolean;
  collectRequestFlag: boolean;
}

const CURRENCY_MAP: Record<string, string> = {
  '₹': 'INR', 'rs': 'INR', 'inr': 'INR',
  '$': 'USD', 'usd': 'USD',
  '€': 'EUR', 'eur': 'EUR',
  '£': 'GBP', 'gbp': 'GBP',
};

function extractPaymentDetails(content: string): PaymentExtract {
  const lower = content.toLowerCase();

  // Amount
  const amountMatch = content.match(
    /(?:₹|rs\.?|inr|usd|\$|€|£)\s*([\d,]+(?:\.\d{1,2})?)/i
  );
  const amount = amountMatch ? amountMatch[0] : null;

  // Currency
  let currency = 'unknown';
  for (const [sym, code] of Object.entries(CURRENCY_MAP)) {
    if (lower.includes(sym)) { currency = code; break; }
  }

  // Reason
  const reasonMatch = content.match(
    /(?:for|reason|purpose|note|description)[\s:]+([^\n.]{3,80})/i
  );
  const reason = reasonMatch ? reasonMatch[1].trim() : null;

  // Sender
  const senderMatch = content.match(/(?:from|sender|by)[\s:]+([^\n,]{3,50})/i);
  const sender = senderMatch ? senderMatch[1].trim() : null;

  // Payment method
  let paymentMethod: string | null = null;
  if (/upi|vpa|@okaxis|@oksbi|@okicici|@ybl/i.test(content)) paymentMethod = 'UPI';
  else if (/card|credit|debit/i.test(content)) paymentMethod = 'Card';
  else if (/bank.*transfer|neft|rtgs|imps/i.test(content)) paymentMethod = 'Bank Transfer';
  else if (/crypto|bitcoin|usdt/i.test(content)) paymentMethod = 'Cryptocurrency';
  else if (/gift.*card|amazon.*card|google.*play.*card/i.test(content)) paymentMethod = 'Gift Card';

  const urgencyPresent = /urgent|immediately|now|24.*hours|asap|limited/i.test(content);
  const collectRequestFlag = /collect.*request|receive.*money.*enter.*pin|claim.*prize/i.test(lower);

  return { amount, currency, reason, sender, paymentMethod, urgencyPresent, collectRequestFlag };
}

export class PaymentAnalysisService {
  async analyze(
    content: string,
    imageBase64?: string,
    language = 'en'
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    logger.info({ service: 'payment' }, 'Analyzing payment request');

    const extract = extractPaymentDetails(content);

    const contextLines: string[] = [
      'PAYMENT REQUEST ANALYSIS',
      '─'.repeat(40),
      `Content:\n${content}`,
      '',
      'Extracted payment details:',
      `- Amount: ${extract.amount ?? 'Not found'}`,
      `- Currency: ${extract.currency}`,
      `- Reason/Purpose: ${extract.reason ?? 'Not stated'}`,
      `- Sender: ${extract.sender ?? 'Unknown'}`,
      `- Payment method: ${extract.paymentMethod ?? 'Unknown'}`,
      `- Urgency signals: ${extract.urgencyPresent ? 'YES' : 'No'}`,
      `- UPI Collect request indicator: ${extract.collectRequestFlag ? 'YES (high risk — entering PIN sends money, not receives)' : 'No'}`,
    ];

    if (imageBase64) {
      contextLines.push('\n[Screenshot of payment request also provided]');
    }

    const input: AnalysisInput = {
      type: AnalysisType.PaymentRequest,
      content: contextLines.join('\n'),
      language,
    };

    const result = await geminiService.analyzeContent(input);

    logger.info(
      { service: 'payment', duration: Date.now() - startTime, status: result.status },
      'Payment analysis complete'
    );

    result.metadata = { ...extract };

    return result;
  }
}

export const paymentAnalysisService = new PaymentAnalysisService();
