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

export interface Finding {
  id: string;
  type: FindingType;
  severity: SeverityLevel;
  title: string;
  description: string;
  evidence: string;
  explanation: string;
  recommendation: string;
  whyItMatters: string;
  whatIsUncertain?: string;
  whatToVerify?: string;
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
