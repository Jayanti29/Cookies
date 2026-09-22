// ─── All TypeScript interfaces & enums for the COOKIES platform ───────────────

// ─── Enums ────────────────────────────────────────────────────────────────────

export enum AnalysisType {
  Website = 'website',
  URL = 'url',
  Image = 'image',
  Screenshot = 'screenshot',
  Document = 'document',
  Message = 'message',
  Email = 'email',
  JobOffer = 'job_offer',
  QR = 'qr',
  PaymentRequest = 'payment_request',
  SocialMedia = 'social_media',
  Text = 'text',
  CameraFrame = 'camera_frame',
}

export enum AnalysisStatus {
  Safe = 'safe',
  Info = 'info',
  Review = 'review',
  MultipleConcerns = 'multiple_concerns',
  HighConcern = 'high_concern',
}

export enum DarkPatternType {
  HiddenFee = 'hidden_fee',
  HiddenSubscription = 'hidden_subscription',
  Preselection = 'preselection',
  SneakIntoBasket = 'sneak_into_basket',
  FakeUrgency = 'fake_urgency',
  MisleadingCTA = 'misleading_cta',
  Confirmshaming = 'confirmshaming',
  ForcedContinuity = 'forced_continuity',
  DifficultCancellation = 'difficult_cancellation',
  HiddenTerms = 'hidden_terms',
  PriceChange = 'price_change',
  ForcedAccount = 'forced_account',
}

// ─── Core Analysis Types ──────────────────────────────────────────────────────

export interface AnalysisOptions {
  saveResult?: boolean;
  platform?: string;
  deepScan?: boolean;
  returnRaw?: boolean;
}

export interface AnalysisInput {
  type: AnalysisType | string;
  content: string;           // URL, text, base64 image, raw document text
  language?: string;         // ISO 639-1 language code, defaults to 'en'
  options?: AnalysisOptions;
  userId?: string;
}

export interface Finding {
  type: string;
  severity: 'low' | 'medium' | 'high';
  observedEvidence: string;
  explanation: string;
  recommendedAction: string;
  confidence: number;        // 0.0 – 1.0
}

export interface AnalysisResult {
  analysisId: string;
  status: AnalysisStatus | string;
  category: string;
  summary: string;
  findings: Finding[];
  uncertainties: string[];
  recommendedActions: string[];
  needsVerification?: boolean;
  isDemo?: boolean;
  metadata?: Record<string, unknown>;
  rawGeminiResponse?: unknown;
  createdAt?: string;
}

// ─── Firestore Collection Types ───────────────────────────────────────────────

export interface Report {
  id?: string;
  userId: string;
  analysisId?: string;
  title: string;
  description: string;
  category: string;
  status: string;
  severity: 'low' | 'medium' | 'high';
  evidence: string[];        // evidence document IDs
  platform?: string;
  url?: string;
  isPublic: boolean;
  communityVotes?: {
    experienced: number;
    possibly: number;
    does_not_match: number;
  };
  voterIds?: string[];       // uids who have voted
  createdAt: string;
  updatedAt: string;
}

export interface Evidence {
  id?: string;
  userId: string;
  reportId?: string;
  analysisId?: string;
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  storagePath: string;
  downloadUrl?: string;
  description?: string;
  createdAt: string;
}

export interface Subscription {
  id?: string;
  userId: string;
  serviceName: string;
  serviceUrl?: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'weekly' | 'one_time';
  nextBillingDate?: string;
  status: 'active' | 'cancelled' | 'paused';
  notes?: string;
  alerts?: boolean;
  darkPatternFlags?: DarkPatternType[];
  createdAt: string;
  updatedAt: string;
}

// ─── OCR / Vision Types ───────────────────────────────────────────────────────

export interface TextBlock {
  text: string;
  boundingPoly?: {
    vertices: Array<{ x: number; y: number }>;
  };
  confidence?: number;
}

export interface VisionResult {
  text: string;
  blocks: TextBlock[];
  available: boolean;
}

export interface QRDecodeResult {
  destination: string | null;
  available: boolean;
}

// ─── Translation ──────────────────────────────────────────────────────────────

export interface TranslationResult {
  translatedText: string;
  detectedSourceLanguage?: string;
}

// ─── Community ────────────────────────────────────────────────────────────────

export interface TrendData {
  category: string;
  count: number;
  percentChange?: number;
  topPlatforms?: string[];
}

export interface WebsiteSafetyProfile {
  domain: string;
  reportCount: number;
  averageSeverity: string;
  categories: string[];
  lastReported?: string;
  communityStatus: 'trusted' | 'suspicious' | 'unknown';
}

// ─── Request augmentations ────────────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: {
        uid: string;
        email?: string;
      };
      requestId?: string;
    }
  }
}
