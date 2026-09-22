import axios from 'axios';
import { auth } from '../config/firebase';
import { AnalysisResult } from '../types';

const defaultHost = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const API_BASE_URL = import.meta.env.VITE_API_URL || `http://${defaultHost}:3001`;

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 45000,
});

// Attach Firebase auth token to requests if available
apiClient.interceptors.request.use(async (config) => {
  try {
    const user = auth.currentUser;
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.warn('Could not attach auth token:', err);
  }
  return config;
});

// Normalizes backend AnalysisResult into frontend expected schema
function normalizeAnalysisResult(data: any): AnalysisResult {
  const rawFindings = data.findings || [];
  const triSummary = data.triDimensionSummary || {
    money: { count: 0, items: [] },
    data: { count: 0, items: [] },
    manipulation: { count: 0, items: [] },
  };

  const findings = rawFindings.map((f: any, idx: number) => {
    let dim = f.dimension;
    if (!dim) {
      const t = (f.type || '').toLowerCase();
      if (t.includes('fee') || t.includes('subscription') || t.includes('price') || t.includes('cost') || t.includes('payment')) {
        dim = 'money';
      } else if (t.includes('cookie') || t.includes('tracking') || t.includes('privacy') || t.includes('data')) {
        dim = 'data';
      } else {
        dim = 'manipulation';
      }
    }
    return {
      id: String(idx),
      type: f.type || 'generic',
      severity: f.severity || 'medium',
      title: f.type ? f.type.replace(/_/g, ' ').toUpperCase() : 'Finding',
      description: f.explanation || '',
      evidence: f.observedEvidence || '',
      explanation: f.explanation || '',
      recommendation: f.recommendedAction || '',
      whyItMatters: f.whyItMatters || f.explanation || 'May impact your privacy or billing transparency.',
      whatIsUncertain: f.whatIsUncertain || (data.uncertainties && data.uncertainties[0]) || 'Internal website data collection cannot be verified from client UI alone.',
      whatToVerify: f.whatToVerify || f.recommendedAction || 'Review website terms and privacy policy before accepting.',
      dimension: dim,
      interpretation: f.interpretation || f.explanation || '',
    };
  });

  return {
    id: data.analysisId || data.id || Math.random().toString(36).substring(7),
    status: data.status || 'review',
    summary: data.summary || 'Analysis complete.',
    analysisType: data.category || 'website',
    findings,
    triDimensionSummary: triSummary,
    consentReceipt: data.consentReceipt,
    totalFindings: findings.length,
    isDemo: Boolean(data.isDemo),
    checkedAt: data.createdAt || new Date().toISOString(),
    language: data.language || 'en',
    confidence: data.findings?.[0]?.confidence || 0.85,
    actions: (data.recommendedActions || []).map((a: string) => ({
      label: a,
      type: 'primary',
    })),
  };
}

export const api = {
  // Universal analyze
  async analyze(formData: FormData): Promise<AnalysisResult> {
    const response = await apiClient.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return normalizeAnalysisResult(response.data);
  },

  // Check website
  async checkWebsite(url: string, language: string = 'en'): Promise<AnalysisResult> {
    const response = await apiClient.post('/analyze/website', { url, language });
    return normalizeAnalysisResult(response.data);
  },

  // Check message
  async checkMessage(content: string, platform?: string, language: string = 'en'): Promise<AnalysisResult> {
    const response = await apiClient.post('/analyze/message', { content, platform, language });
    return normalizeAnalysisResult(response.data);
  },

  // Check job offer
  async checkJob(content: string, language: string = 'en'): Promise<AnalysisResult> {
    const response = await apiClient.post('/analyze/job', { content, language });
    return normalizeAnalysisResult(response.data);
  },

  // Check payment
  async checkPayment(content: string, language: string = 'en'): Promise<AnalysisResult> {
    const response = await apiClient.post('/analyze/payment', { content, language });
    return normalizeAnalysisResult(response.data);
  },

  // Check QR
  async checkQR(file: File): Promise<AnalysisResult> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post('/analyze/qr', formData);
    return normalizeAnalysisResult(response.data);
  },

  // Reports
  async submitReport(data: any): Promise<any> {
    const response = await apiClient.post('/reports', data);
    return response.data;
  },

  async getMyReports(): Promise<any[]> {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  async getCommunityReports(): Promise<any[]> {
    const response = await apiClient.get('/reports/community');
    return response.data;
  },

  async voteReport(id: string, vote: string): Promise<any> {
    const response = await apiClient.post(`/reports/${id}/vote`, { vote });
    return response.data;
  },

  // Evidence
  async uploadEvidence(formData: FormData): Promise<any> {
    const response = await apiClient.post('/evidence', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async getEvidence(): Promise<any[]> {
    const response = await apiClient.get('/evidence');
    return response.data;
  },

  async deleteEvidence(id: string): Promise<void> {
    await apiClient.delete(`/evidence/${id}`);
  },

  // Subscriptions
  async getSubscriptions(): Promise<any[]> {
    const response = await apiClient.get('/subscriptions');
    return response.data;
  },

  async addSubscription(data: any): Promise<any> {
    const response = await apiClient.post('/subscriptions', data);
    return response.data;
  },

  async updateSubscription(id: string, data: any): Promise<any> {
    const response = await apiClient.put(`/subscriptions/${id}`, data);
    return response.data;
  },

  async deleteSubscription(id: string): Promise<void> {
    await apiClient.delete(`/subscriptions/${id}`);
  },

  // Community trends
  async getTrending(): Promise<any> {
    const response = await apiClient.get('/community/trending');
    return response.data;
  },

  async getWebsiteProfile(domain: string): Promise<any> {
    const response = await apiClient.get(`/community/website/${domain}`);
    return response.data;
  },

  // Cookie Truth Scanner
  async analyzeCookieConsent(content: string, url?: string, language: string = 'en'): Promise<any> {
    const response = await apiClient.post('/cookie-truth/analyze', { content, url, language });
    return response.data;
  },

  async generateConsentReceipt(website: string, categories: any[], flags: any[]): Promise<any> {
    const response = await apiClient.post('/cookie-truth/receipt', { website, categories, flags });
    return response.data;
  },

  // Checkout Difference Detector
  async compareCheckouts(formData: FormData): Promise<any> {
    const response = await apiClient.post('/checkout-diff', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // COOKIES AI Assistant
  async askCookiesAi(message: string, context?: any, language: string = 'en'): Promise<any> {
    const response = await apiClient.post('/ai/chat', { message, context, language });
    return response.data;
  },

  // Authority & Admin Case Management
  async getAdminOverview(role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.get('/admin/overview', {
      headers: { 'x-admin-role': role },
    });
    return response.data;
  },

  async getAdminCases(status?: string, priority?: string, role: string = 'ADMIN'): Promise<any[]> {
    const response = await apiClient.get('/admin/cases', {
      params: { status, priority },
      headers: { 'x-admin-role': role },
    });
    return response.data;
  },

  async getAdminCase(id: string, role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.get(`/admin/cases/${id}`, {
      headers: { 'x-admin-role': role },
    });
    return response.data;
  },

  async updateAdminCaseStatus(id: string, status: string, notes?: string, role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.patch(
      `/admin/cases/${id}/status`,
      { status, notes },
      { headers: { 'x-admin-role': role } }
    );
    return response.data;
  },

  async recordAdminAction(id: string, actionType: string, notes?: string, role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.post(
      `/admin/cases/${id}/action`,
      { actionType, notes },
      { headers: { 'x-admin-role': role } }
    );
    return response.data;
  },

  async addAdminNote(id: string, text: string, role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.post(
      `/admin/cases/${id}/note`,
      { text },
      { headers: { 'x-admin-role': role } }
    );
    return response.data;
  },

  async getAdminOfficialReport(id: string, role: string = 'ADMIN'): Promise<any> {
    const response = await apiClient.get(`/admin/cases/${id}/report`, {
      headers: { 'x-admin-role': role },
    });
    return response.data;
  },

  async getAdminAuditLogs(role: string = 'ADMIN'): Promise<any[]> {
    const response = await apiClient.get('/admin/audit-logs', {
      headers: { 'x-admin-role': role },
    });
    return response.data;
  },
};
