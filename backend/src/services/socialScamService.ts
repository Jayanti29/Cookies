import { AnalysisInput, AnalysisResult, AnalysisType } from '../types';
import { geminiService } from './geminiService';
import { logger } from '../utils/logger';

const GIVEAWAY_PATTERNS = [
  /giveaway/i, /win.*prize/i, /free.*iphone/i, /free.*gift/i, /lucky.*winner/i,
  /selected.*winner/i, /congratulations.*won/i, /claim.*prize/i,
];

const RECRUITMENT_SCAM_PATTERNS = [
  /high.*salary.*no.*experience/i, /earn.*daily.*from.*home/i,
  /part.*time.*work.*home.*\d+/i, /घर बैठे/i,
];

const FAKE_SPONSORSHIP_PATTERNS = [
  /sponsor.*deal/i, /brand.*collaboration/i, /paid.*partnership/i,
  /dm.*for.*collab/i, /influencer.*opportunity/i,
];

const PAYMENT_REQUEST_PATTERNS = [
  /delivery.*charge/i, /processing.*fee/i, /shipping.*fee/i,
  /claim.*pay/i, /send.*amount/i, /registration.*fee/i,
];

interface SocialScamSignals {
  giveawayIndicators: boolean;
  recruitmentScam: boolean;
  fakeSponsorship: boolean;
  paymentRequest: boolean;
  dataCollection: boolean;
}

function detectSocialSignals(content: string): SocialScamSignals {
  return {
    giveawayIndicators: GIVEAWAY_PATTERNS.some((p) => p.test(content)),
    recruitmentScam: RECRUITMENT_SCAM_PATTERNS.some((p) => p.test(content)),
    fakeSponsorship: FAKE_SPONSORSHIP_PATTERNS.some((p) => p.test(content)),
    paymentRequest: PAYMENT_REQUEST_PATTERNS.some((p) => p.test(content)),
    dataCollection: /share.*personal|send.*details|dm.*address|dm.*number/i.test(content),
  };
}

export class SocialScamService {
  async analyze(
    content: string,
    platform = 'unknown',
    imageBase64?: string,
    language = 'en'
  ): Promise<AnalysisResult> {
    const startTime = Date.now();
    logger.info({ service: 'socialScam', platform }, 'Analyzing social media content');

    const signals = detectSocialSignals(content);

    const contextLines: string[] = [
      `SOCIAL MEDIA SCAM ANALYSIS (Platform: ${platform})`,
      '─'.repeat(40),
      `Content:\n${content}`,
      '',
      'Pre-scan signals:',
      `- Giveaway/prize indicators: ${signals.giveawayIndicators ? 'YES' : 'No'}`,
      `- Recruitment scam patterns: ${signals.recruitmentScam ? 'YES' : 'No'}`,
      `- Fake sponsorship patterns: ${signals.fakeSponsorship ? 'YES' : 'No'}`,
      `- Payment request: ${signals.paymentRequest ? 'YES' : 'No'}`,
      `- Personal data collection: ${signals.dataCollection ? 'YES' : 'No'}`,
    ];

    if (imageBase64) {
      contextLines.push('\n[Visual content also provided — analyze for impersonation, fake verification badges, cloned profile indicators]');
    }

    const input: AnalysisInput = {
      type: AnalysisType.SocialMedia,
      content: contextLines.join('\n'),
      language,
      options: { platform },
    };

    const result = await geminiService.analyzeContent(input);

    logger.info(
      { service: 'socialScam', duration: Date.now() - startTime, status: result.status },
      'Social scam analysis complete'
    );

    result.metadata = { platform, signals };

    return result;
  }
}

export const socialScamService = new SocialScamService();
