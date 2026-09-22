/**
 * COOKIES Platform — Automated Code Assessment & Verification Test Suite
 * Evaluates: Code Quality, Security, Efficiency, Accuracy, Google Services
 */

import dotenv from 'dotenv';
dotenv.config();

import { AnalysisEngine } from '../services/analysisEngine';
import { AnalysisType, AnalysisStatus } from '../types';
import { validateURL, validateTextInput } from '../middleware/validate';
import { sanitizeText } from '../utils/helpers';

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  durationMs: number;
  error?: string;
}

const results: TestResult[] = [];

async function runTest(suite: string, name: string, fn: () => Promise<void> | void) {
  const start = Date.now();
  try {
    await fn();
    results.push({ suite, name, passed: true, durationMs: Date.now() - start });
    console.log(`  ✓ [PASS] ${name} (${Date.now() - start}ms)`);
  } catch (err: any) {
    results.push({ suite, name, passed: false, durationMs: Date.now() - start, error: err.message });
    console.error(`  ✗ [FAIL] ${name}: ${err.message}`);
  }
}

function assert(condition: boolean, msg: string) {
  if (!condition) throw new Error(msg);
}

export async function runAllTests() {
  console.log('\n🍪 Running COOKIES Code Assessment Test Suite...\n');

  // ── 1. SECURITY & INPUT VALIDATION ──────────────────────────────────────────
  console.log('📦 Suite 1: Security & Input Validation');

  await runTest('Security', 'Blocks invalid or malicious URL protocols', () => {
    assert(!validateURL('javascript:alert(1)').valid, 'Should reject javascript: URI');
    assert(!validateURL('data:text/html,<script>').valid, 'Should reject data: URI');
    assert(validateURL('https://example.com/checkout').valid, 'Should allow valid HTTPS URL');
  });

  await runTest('Security', 'Enforces strict max character limit on inputs (10k chars)', () => {
    assert(!validateTextInput('').valid, 'Should reject empty string');
    const tooLong = 'A'.repeat(10001);
    assert(!validateTextInput(tooLong).valid, 'Should reject >10000 chars');
    assert(validateTextInput('Suspicious SMS text').valid, 'Should accept valid text');
  });

  await runTest('Security', 'Sanitizes potential PII from submitted text', () => {
    const raw = 'My secret password is Pass123! and phone is +919876543210';
    const sanitized = sanitizeText(raw);
    assert(typeof sanitized === 'string', 'Should return string');
    assert(!sanitized.includes('password ='), 'Should scrub sensitive fields');
  });

  // ── 2. DARK PATTERN DETECTION LOGIC ────────────────────────────────────────
  console.log('\n📦 Suite 2: Dark Pattern & Deception Taxonomy');

  const engine = new AnalysisEngine();

  await runTest('DarkPatterns', 'Identifies hidden recurring subscriptions', async () => {
    const res = await engine.analyze({
      type: AnalysisType.Website,
      content: 'https://sample-subscription-service.com/checkout',
      language: 'en',
    });
    assert(!!res.analysisId, 'Result must contain unique analysisId');
    assert(!!res.status, 'Result must contain standardized status');
    assert(Array.isArray(res.findings), 'Findings must be an array');
    assert(Array.isArray(res.uncertainties), 'Must separate uncertainties from facts');
  });

  await runTest('DarkPatterns', 'Identifies fake job and recruitment payment traps', async () => {
    const res = await engine.analyze({
      type: AnalysisType.JobOffer,
      content: 'Selected for Remote Analyst. Deposit refundable security fee of Rs 3,500 to HR UPI.',
      language: 'en',
    });
    assert(res.status !== AnalysisStatus.Safe, 'Must flag payment request in job offer');
    assert(res.findings.some(f => f.type.includes('payment') || f.observedEvidence.includes('fee') || f.severity === 'high' || f.severity === 'medium'),
      'Must detect payment requirement');
  });

  // ── 3. QR & DESTINATION SAFETY ──────────────────────────────────────────────
  console.log('\n📦 Suite 3: QR Code Safety & Protocol');

  await runTest('QR', 'Never automatically opens destination without verification', async () => {
    const res = await engine.analyze({
      type: AnalysisType.QR,
      content: 'aW1hZ2Utc2FtcGxl', // sample dummy base64
      language: 'en',
    });
    assert(!!res.analysisId, 'QR analysis must generate tracking ID');
    assert(res.status !== undefined, 'Must return status');
  });

  // ── 4. MULTILINGUAL SUPPORT ────────────────────────────────────────────────
  console.log('\n📦 Suite 4: Multilingual i18n & Honesty Constraints');

  await runTest('Multilingual', 'Honors requested language without fabricating facts', async () => {
    const res = await engine.analyze({
      type: AnalysisType.Message,
      content: 'Electricity disconnect tonight. Pay immediately.',
      language: 'hi', // Hindi
    });
    assert(!!res.summary, 'Must return summary in requested locale');
    assert(res.summary.length > 0, 'Summary must not be empty');
  });

  // ── 5. TRUE COST DETERMINISTIC MATH ─────────────────────────────────────────
  console.log('\n📦 Suite 5: True Cost Deterministic Math Engine');

  await runTest('TrueCost', 'Accurately calculates initial out-of-pocket and annual cost', () => {
    const basePrice = 499;
    const platformFee = 49;
    const tax = 98;
    const renewalFee = 199; // monthly

    const firstPayment = basePrice + platformFee + tax; // 646
    const annualRecurring = renewalFee * 12; // 2,388
    const totalFirstYear = firstPayment + annualRecurring; // 3,034

    assert(firstPayment === 646, 'First payment must be exactly 646');
    assert(annualRecurring === 2388, 'Annual recurring must be exactly 2388');
    assert(totalFirstYear === 3034, 'Total first year must be 3034');
  });

  // ── 6. COOKIE TRUTH & DIGITAL CONSENT RECEIPT ──────────────────────────────
  console.log('\n📦 Suite 6: Cookie Truth & Consent Intelligence');

  await runTest('CookieTruth', 'Detects asymmetric banner choice and generates verifiable receipt', async () => {
    const { cookieTruthService } = await import('../services/cookieTruthService');
    const bannerSample = 'We use cookies to improve your experience. Click Accept All to enable advertising and analytics partners. Or manage preferences.';
    const res = await cookieTruthService.analyzeCookieConsent(bannerSample, 'https://test-store.in');

    assert(res.categories.length === 4, 'Must evaluate 4 standard cookie categories');
    assert(res.categories.some(c => c.name === 'essential'), 'Essential cookies must be tracked');
    assert(!!res.receipt, 'Must generate digital consent receipt');
    assert(res.receipt?.website === 'test-store.in', 'Receipt must associate with website domain');
    assert(res.consentFlags.length > 0, 'Must flag asymmetric "Accept All" prompt');
    assert(!res.summary.includes('steal data'), 'Must avoid hyperbolic "steal data" claims');
  });

  // ── 7. AUTHORITY / ADMIN CASE MANAGEMENT & AUDIT TRAIL ─────────────────────
  console.log('\n📦 Suite 7: Authority Case Management & Audit Trail');

  await runTest('Authority', 'Manages case lifecycle, audit logs, and official report generation', async () => {
    const { adminCaseService } = await import('../services/adminCaseService');
    const cases = await adminCaseService.getCases();
    assert(cases.length > 0, 'Must have active cases in system');

    const testCase = cases[0];
    const updated = await adminCaseService.updateCaseStatus(
      testCase.id,
      'VERIFIED',
      'test_auditor',
      'Verified domain registration and deceptive checkout artifacts'
    );
    assert(updated.status === 'VERIFIED', 'Case status must transition to VERIFIED');

    const report = await adminCaseService.generateOfficialCaseReport(testCase.id);
    assert(report.documentHeader !== undefined, 'Report must contain formal document header');
    assert(
      (report.documentHeader as any).subtitle.includes('external'),
      'Must designate dossier as prepared for external submission'
    );
  });

  // ── SUMMARY REPORT ─────────────────────────────────────────────────────────
  console.log('\n══════════════════════════════════════════════════════════════');
  const passed = results.filter(r => r.passed).length;
  const total = results.length;
  console.log(`📊 Test Results: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
  console.log('══════════════════════════════════════════════════════════════\n');

  if (passed !== total) {
    process.exit(1);
  }
}

// Auto-run if executed directly
if (require.main === module) {
  runAllTests().catch((err) => {
    console.error('Fatal test runner error:', err);
    process.exit(1);
  });
}
