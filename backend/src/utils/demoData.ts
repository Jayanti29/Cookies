import { AnalysisResult, AnalysisStatus, Finding } from '../types';
import { generateId } from './helpers';

// ─── Demo Data — pre-built realistic analysis results ─────────────────────────

const DEMO_ID_1 = generateId();
const DEMO_ID_2 = generateId();
const DEMO_ID_3 = generateId();
const DEMO_ID_4 = generateId();
const DEMO_ID_5 = generateId();
const DEMO_ID_6 = generateId();

/** 1. E-commerce hidden subscription */
export const demoHiddenSubscription: AnalysisResult = {
  analysisId: DEMO_ID_1,
  status: AnalysisStatus.MultipleConcerns,
  category: 'Dark Patterns / Hidden Subscription',
  summary:
    'This website shows multiple indicators of hidden subscription tactics. Carefully review the checkout flow before providing payment details.',
  findings: [
    {
      type: 'hidden_subscription',
      severity: 'high',
      observedEvidence:
        'Pre-selected checkbox in checkout labelled "Activate Premium Membership" in small grey text below the total',
      explanation:
        'Pre-selected subscription opt-ins are a common dark pattern that enrolls consumers in recurring charges without explicit awareness.',
      recommendedAction: 'Deselect the checkbox before completing checkout. Read all fine print near the payment button.',
      confidence: 0.91,
    },
    {
      type: 'hidden_fee',
      severity: 'medium',
      observedEvidence:
        'Final price shown at checkout (₹1,299) is higher than the advertised price (₹999) on the product page',
      explanation: 'A ₹300 "convenience & handling" fee was added only at the last checkout step.',
      recommendedAction: 'Compare the price at every checkout step. Abandon cart if unexplained fees appear.',
      confidence: 0.87,
    },
    {
      type: 'difficult_cancellation',
      severity: 'medium',
      observedEvidence: 'No visible "Cancel subscription" button in the account settings; only a "Pause" option is shown',
      explanation: 'Making cancellation difficult is a retention tactic that can lead to unwanted ongoing charges.',
      recommendedAction: 'Contact customer support via email to explicitly request cancellation and keep the confirmation.',
      confidence: 0.79,
    },
  ] as Finding[],
  uncertainties: [
    'Could not verify actual post-purchase charges without completing purchase',
    'Cancellation flow not fully tested — hidden cancel option may exist elsewhere in the account',
  ],
  recommendedActions: [
    'Do not complete checkout without unchecking the membership box',
    'Take screenshots of the advertised price and checkout total',
    'Read the full terms linked near the checkout button',
    'Pay with a credit card that offers chargeback protection',
  ],
  needsVerification: true,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** 2. Fake job offer */
export const demoFakeJobOffer: AnalysisResult = {
  analysisId: DEMO_ID_2,
  status: AnalysisStatus.HighConcern,
  category: 'Employment Scam / Fake Job Offer',
  summary:
    'This job offer contains several high-confidence indicators of a scam, including requests for upfront payments and use of a free email address for an official company.',
  findings: [
    {
      type: 'payment_request',
      severity: 'high',
      observedEvidence:
        'Message asks candidate to pay ₹2,500 for "training materials and background verification" before starting',
      explanation:
        'Legitimate employers never require upfront fees. This is the primary hallmark of advance-fee employment fraud.',
      recommendedAction: 'Do not send any money. Report the job posting to the platform.',
      confidence: 0.97,
    },
    {
      type: 'suspicious_sender',
      severity: 'high',
      observedEvidence: 'Offer letter sent from hr.globaltech2024@gmail.com rather than a corporate domain',
      explanation: 'Any legitimate company would communicate from its own domain (e.g. @globaltech.com).',
      recommendedAction: 'Verify the company independently by searching their official website and calling their listed number.',
      confidence: 0.94,
    },
    {
      type: 'salary_inconsistency',
      severity: 'medium',
      observedEvidence: 'Offer promises ₹1.5 Lakh/month work-from-home for "data entry" with no experience required',
      explanation: 'Unusually high salaries for no-skill roles are used to lure victims into the scam funnel.',
      recommendedAction: 'Compare with industry salary data for similar roles on reliable job platforms.',
      confidence: 0.82,
    },
  ] as Finding[],
  uncertainties: [
    'The company name mentioned could not be independently verified during demo',
    'Offer letter template may be copied from a real company',
  ],
  recommendedActions: [
    'Do NOT pay any upfront fees under any circumstances',
    'Search the company name + "scam" online',
    'Report to the National Cyber Crime portal (cybercrime.gov.in) if in India',
    'Block and report the sender',
  ],
  needsVerification: true,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** 3. Phishing message */
export const demoPhishingMessage: AnalysisResult = {
  analysisId: DEMO_ID_3,
  status: AnalysisStatus.HighConcern,
  category: 'Phishing / Credential Theft',
  summary:
    'This message has strong phishing indicators: it impersonates a bank, creates artificial urgency, and links to a suspicious URL to steal credentials.',
  findings: [
    {
      type: 'impersonation',
      severity: 'high',
      observedEvidence: 'Sender ID is "SBI-Alert" but the linked domain is sbi-secure-verify.net (not sbi.co.in)',
      explanation: 'Phishers spoof official-sounding sender IDs while directing victims to fraudulent sites.',
      recommendedAction: 'Never click links in unsolicited banking messages. Access your bank only via official app or known URL.',
      confidence: 0.96,
    },
    {
      type: 'fake_urgency',
      severity: 'high',
      observedEvidence: 'Message states "Your account will be blocked in 24 hours if you do not verify"',
      explanation: 'Artificial time pressure is used to prevent victims from pausing to verify legitimacy.',
      recommendedAction: 'Call your bank directly on the number on the back of your card to confirm.',
      confidence: 0.93,
    },
    {
      type: 'credential_request',
      severity: 'high',
      observedEvidence: 'Landing page requests ATM PIN, full card number, and CVV on first page',
      explanation: 'Banks NEVER ask for full card details or PIN via SMS or website links.',
      recommendedAction: 'Do not enter any information. Close the page immediately.',
      confidence: 0.99,
    },
  ] as Finding[],
  uncertainties: ['Actual destination URL not fully loaded in demo mode'],
  recommendedActions: [
    'Do NOT click the link',
    'Forward the SMS to 1930 (India Cyber Crime helpline)',
    'Report to your bank via the official app',
    'Enable transaction alerts via your official banking app',
  ],
  needsVerification: false,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** 4. Instagram giveaway scam */
export const demoInstagramGiveaway: AnalysisResult = {
  analysisId: DEMO_ID_4,
  status: AnalysisStatus.HighConcern,
  category: 'Social Media Scam / Fake Giveaway',
  summary:
    'This Instagram post appears to be a fake giveaway scam, using a cloned influencer account to collect personal data or advance fees.',
  findings: [
    {
      type: 'impersonation',
      severity: 'high',
      observedEvidence:
        'Account username is @virat.kohIi.official_ (capital I instead of lowercase l) — differs from verified account',
      explanation:
        'Scammers create near-identical usernames with subtle character substitutions to deceive followers.',
      recommendedAction: 'Check for the verified blue tick on the original account. Report the fake account.',
      confidence: 0.92,
    },
    {
      type: 'prize_scam',
      severity: 'high',
      observedEvidence:
        'Post claims winners must pay ₹500 "delivery charge" to claim prize',
      explanation:
        'Legitimate giveaways never charge winners. A fee demand is the defining indicator of a prize scam.',
      recommendedAction: 'Do not pay. Report the account and post to Instagram.',
      confidence: 0.98,
    },
    {
      type: 'data_harvesting',
      severity: 'medium',
      observedEvidence:
        'Entry requires sharing full name, phone, and home address in DMs',
      explanation: 'Excessive personal data collection via unverified accounts is used for identity theft or targeted scams.',
      recommendedAction: 'Never share personal details with unverified accounts.',
      confidence: 0.85,
    },
  ] as Finding[],
  uncertainties: [
    'Could not independently verify account follower history in demo mode',
    'Prize legitimacy could not be confirmed',
  ],
  recommendedActions: [
    'Report the account to Instagram as "Impersonation"',
    'Do not pay any delivery or processing fee',
    'Warn friends who may have shared the post',
    'Check haveibeenpwned.com if you submitted personal info',
  ],
  needsVerification: false,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** 5. QR code leading to suspicious site */
export const demoQRCode: AnalysisResult = {
  analysisId: DEMO_ID_5,
  status: AnalysisStatus.Review,
  category: 'QR Code / Suspicious Redirect',
  summary:
    'The QR code redirects to a URL that does not match the advertised merchant. Review before proceeding with any payment.',
  findings: [
    {
      type: 'url_mismatch',
      severity: 'high',
      observedEvidence:
        'QR code displayed on restaurant table redirects to pay-secure-india.xyz instead of the restaurant\'s registered payment page',
      explanation: 'QR codes in physical locations can be replaced by fraudulent stickers pointing to different payment accounts.',
      recommendedAction: 'Ask staff for their official payment QR code or pay using the POS terminal.',
      confidence: 0.88,
    },
    {
      type: 'suspicious_domain',
      severity: 'medium',
      observedEvidence: 'Destination domain pay-secure-india.xyz was registered 12 days ago (very new)',
      explanation: 'Very recently registered domains are a common indicator of fraudulent payment pages.',
      recommendedAction: 'Do not complete payment via this QR. Use an alternative payment method.',
      confidence: 0.81,
    },
  ] as Finding[],
  uncertainties: [
    'QR code physical tampering could not be confirmed remotely',
    'Website may be a redirect and final destination may differ',
  ],
  recommendedActions: [
    'Do not scan this QR code for payments',
    'Inform the merchant about possible QR tampering',
    'Report to local cybercrime if QR is posted in a public place',
    'Use UPI directly by searching verified merchant VPA',
  ],
  needsVerification: true,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** 6. Suspicious payment request */
export const demoPaymentRequest: AnalysisResult = {
  analysisId: DEMO_ID_6,
  status: AnalysisStatus.HighConcern,
  category: 'Payment Fraud / UPI Collect Scam',
  summary:
    'This payment request contains strong indicators of a UPI collect scam — money is being requested from you, not sent to you.',
  findings: [
    {
      type: 'collect_request_reversal',
      severity: 'high',
      observedEvidence:
        'User received a UPI "collect" request for ₹15,000 labelled "Prize Winnings" — this debits the recipient, not credits',
      explanation:
        'Scammers trick victims into approving UPI collect requests by labelling them as prize/refund receipts. Approving this takes money OUT of your account.',
      recommendedAction: 'Decline this request immediately. You cannot receive money by approving a collect request.',
      confidence: 0.99,
    },
    {
      type: 'social_engineering',
      severity: 'high',
      observedEvidence:
        'Accompanying message claims "Enter UPI PIN to receive your prize of ₹15,000 from KBC"',
      explanation: 'Your UPI PIN should only be used to SEND money, never to receive it.',
      recommendedAction: 'Never enter your UPI PIN for any supposed prize or refund.',
      confidence: 0.99,
    },
    {
      type: 'unsolicited_request',
      severity: 'medium',
      observedEvidence:
        'Request came from an unknown VPA (random@paytm) with no prior transaction history',
      explanation: 'Legitimate refunds and prizes are never sent via unsolicited UPI collect requests.',
      recommendedAction: 'Block the VPA and report within your UPI app.',
      confidence: 0.9,
    },
  ] as Finding[],
  uncertainties: ['VPA ownership could not be verified in demo mode'],
  recommendedActions: [
    'Decline the collect request immediately',
    'Block the sender in your UPI app',
    'Report to NPCI at https://www.npci.org.in/report-a-fraud',
    'Share with family members who may be targeted',
  ],
  needsVerification: false,
  isDemo: true,
  createdAt: new Date().toISOString(),
};

/** Get a demo result by index (0-5) or randomly */
export function getDemoResult(index?: number): AnalysisResult {
  const demos = [
    demoHiddenSubscription,
    demoFakeJobOffer,
    demoPhishingMessage,
    demoInstagramGiveaway,
    demoQRCode,
    demoPaymentRequest,
  ];
  if (index !== undefined && index >= 0 && index < demos.length) {
    return demos[index];
  }
  return demos[Math.floor(Math.random() * demos.length)];
}

/** Map analysis type to appropriate demo result */
export function getDemoResultForType(type: string): AnalysisResult {
  switch (type) {
    case 'website':
    case 'url':
      return demoHiddenSubscription;
    case 'job_offer':
      return demoFakeJobOffer;
    case 'message':
    case 'email':
    case 'text':
      return demoPhishingMessage;
    case 'social_media':
      return demoInstagramGiveaway;
    case 'qr':
      return demoQRCode;
    case 'payment_request':
      return demoPaymentRequest;
    default:
      return getDemoResult();
  }
}
