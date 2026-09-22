// Core analysis types
export type AnalysisStatus = 'safe' | 'info' | 'review' | 'multiple_concerns' | 'high_concern';
export type AnalysisType = 'website' | 'image' | 'document' | 'message' | 'job' | 'qr' | 'payment' | 'phishing' | 'live';
export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';
export type FindingType =
  | 'dark_pattern'
  | 'hidden_fee'
  | 'suspicious_domain'
  | 'phishing_indicator'
  | 'fake_urgency'
  | 'job_scam'
  | 'malware_risk'
  | 'privacy_risk'
  | 'impersonation'
  | 'hidden_subscription'
  | 'qr_redirect'
  | 'generic';

export type DimensionCategory = 'money' | 'data' | 'manipulation';

export interface Finding {
  id: string;
  type: FindingType | string;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  whyItMatters: string;
  whatIsUncertain?: string;
  whatToVerify?: string;
  dimension?: DimensionCategory;
  interpretation?: string;
}

export interface TriDimensionSummary {
  money: { count: number; items: string[] };
  data: { count: number; items: string[] };
  manipulation: { count: number; items: string[] };
}

export interface AnalysisResult {
  id: string;
  status: AnalysisStatus;
  summary: string;
  analysisType: AnalysisType;
  findings: Finding[];
  totalFindings: number;
  isDemo: boolean;
  checkedAt: string;
  language: string;
  inputPreview?: string;
  confidence?: number;
  actions?: RecommendedAction[];
  triDimensionSummary?: TriDimensionSummary;
  consentReceipt?: ConsentReceipt;
}

export interface RecommendedAction {
  label: string;
  type: 'primary' | 'secondary' | 'danger';
  url?: string;
}

// User types
export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  language: string;
  simpleMode: boolean;
  createdAt: string;
}

// Report types
export type ReportCategory =
  | 'online_shopping'
  | 'job_scam'
  | 'phishing'
  | 'fake_website'
  | 'dark_pattern'
  | 'investment_fraud'
  | 'romance_scam'
  | 'lottery_scam'
  | 'impersonation'
  | 'hidden_subscription'
  | 'fake_app'
  | 'other';

export interface Report {
  id: string;
  category: ReportCategory;
  description: string;
  evidenceUrls: string[];
  occurredAt: string;
  submittedAt: string;
  status: 'pending' | 'reviewed' | 'actioned';
  userId?: string;
  upvotes: number;
  isAnonymous: boolean;
}

export interface ReportDraft {
  category: ReportCategory | null;
  description: string;
  evidenceFiles: File[];
  occurredAt: string;
}

// Evidence types
export interface EvidenceCase {
  id: string;
  caseNumber: string;
  category: ReportCategory;
  title: string;
  fileCount: number;
  fileUrls: string[];
  createdAt: string;
  updatedAt: string;
  userId: string;
  reportId?: string;
}

// Subscription types
export type BillingFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export interface TrackedSubscription {
  id: string;
  serviceName: string;
  amount: number;
  currency: string;
  frequency: BillingFrequency;
  renewalDate: string;
  reminderEnabled: boolean;
  userId: string;
  createdAt: string;
  category?: string;
  notes?: string;
}

// Dashboard types
export interface DashboardStats {
  sitesChecked: number;
  itemsAnalyzed: number;
  reportsSubmitted: number;
  subscriptionsTracked: number;
}

export interface ActivityItem {
  id: string;
  type: AnalysisType | 'report' | 'evidence';
  label: string;
  status?: AnalysisStatus;
  timestamp: string;
  resultId?: string;
}

// Community types
export interface TrendingReport {
  id: string;
  category: ReportCategory;
  title: string;
  count: number;
  region?: string;
  upvotes: number;
  lastSeen: string;
}

// Language types
export type SupportedLanguage = 'en' | 'hi' | 'kn' | 'ta' | 'te' | 'bn' | 'mr' | 'ml';

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
}

// TrueCost types
export interface TrueCostInputs {
  basePrice: string;
  platformFee: string;
  serviceFee: string;
  taxPercent: string;
  setupFee: string;
  renewalFee: string;
  frequency: BillingFrequency;
}

export interface TrueCostResult {
  firstPayment: number;
  monthlyEquivalent: number;
  annualCost: number;
  breakdown: { label: string; amount: number | null }[];
}

// API types
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
}

export interface AnalyzeWebsitePayload {
  url: string;
  language: string;
}

export interface AnalyzeMessagePayload {
  content: string;
  language: string;
}

export interface AnalyzeJobPayload {
  content: string;
  language: string;
}

export interface AnalyzePaymentPayload {
  content: string;
  language: string;
}

// ─── Cookie Truth & Digital Consent Receipt Types ────────────────────────────

export interface CookieCategoryStatus {
  name: 'essential' | 'analytics' | 'advertising' | 'preferences' | 'third_party';
  status: 'detected' | 'review' | 'not_detected';
  observableDetails: string;
}

export interface ConsentInterfaceFlag {
  type: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  observedEvidence: string;
}

export interface ConsentReceipt {
  receiptId: string;
  website: string;
  timestamp: string;
  observedChoices: {
    essential: boolean;
    analytics: boolean;
    advertising: boolean;
    thirdParty: boolean;
  };
  observedInterfaceFlags: string[];
  potentialImpact: string;
  verificationAdvice: string;
}

export interface CookieTruthResult {
  analysisId: string;
  url?: string;
  categories: CookieCategoryStatus[];
  consentFlags: ConsentInterfaceFlag[];
  summary: string;
  whyItMatters: string;
  receipt?: ConsentReceipt;
  createdAt: string;
}

// ─── Checkout Difference Types ────────────────────────────────────────────────

export interface PriceDifferenceItem {
  label: string;
  amountA?: number | string;
  amountB?: number | string;
  type: 'base_price' | 'service_fee' | 'platform_fee' | 'preselected_addon' | 'tax' | 'delivery' | 'renewal_term' | 'other';
  differenceNote: string;
}

export interface CheckoutDiffResult {
  analysisId: string;
  detectedPriceChange: boolean;
  advertisedPrice?: string;
  checkoutPrice?: string;
  currency?: string;
  differences: PriceDifferenceItem[];
  observedDarkPatterns: string[];
  summary: string;
  uncertainties: string[];
  verificationSteps: string[];
  createdAt: string;
}

// ─── Authority / Case Management Types ────────────────────────────────────────

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'AUTHORITY_REVIEWER' | 'USER';

export type CaseStatus = 
  | 'NEW'
  | 'UNDER_REVIEW'
  | 'MORE_INFORMATION_REQUIRED'
  | 'VERIFIED'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED';

export type CasePriority = 'low' | 'medium' | 'high' | 'critical';

export interface CaseAction {
  id: string;
  actionType: string;
  performedBy: string;
  performedAt: string;
  notes: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface AuthorityCase {
  id: string;
  reportId: string;
  websiteDomain: string;
  category: string;
  priority: CasePriority;
  status: CaseStatus;
  assignedTo?: string;
  assignedRole?: UserRole;
  reporterAnonymousId: string;
  title: string;
  description: string;
  evidenceList: string[];
  triDimensionSummary?: TriDimensionSummary;
  communityVotes: {
    experienced: number;
    possibly: number;
    does_not_match: number;
  };
  aiFindingsSummary: string;
  internalNotes: Array<{ id: string; author: string; text: string; createdAt: string }>;
  actionHistory: CaseAction[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userRole: string;
  action: string;
  targetType: 'case' | 'report' | 'evidence' | 'user' | 'system';
  targetId: string;
  details: string;
  ipAddress?: string;
}

// ─── AI Chatbot Assistant Types ───────────────────────────────────────────────

export interface ChatRequest {
  message: string;
  context?: {
    currentAnalysis?: Partial<AnalysisResult>;
    url?: string;
    language?: string;
  };
  language?: string;
}

export interface ChatResponse {
  reply: string;
  citedEvidence?: string[];
  uncertainties?: string[];
  recommendedVerifications?: string[];
}
