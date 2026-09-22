import { db } from '../config/firebase';
import { AuthorityCase, CaseStatus, CasePriority, UserRole, CaseAction, AuditLog } from '../types';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

export class AdminCaseService {
  private casesCollection = 'authorityCases';
  private auditCollection = 'auditLogs';

  constructor() {
    this.seedDefaultCasesIfEmpty();
  }

  private async seedDefaultCasesIfEmpty() {
    try {
      const snap = await db.collection(this.casesCollection).limit(1).get();
      if (snap.size === 0) {
        const seedCases: AuthorityCase[] = [
          {
            id: 'CASE-2026-001',
            reportId: 'rep_sbi_phish_01',
            websiteDomain: 'sbi-kyc-update.xyz',
            category: 'phishing',
            priority: 'critical',
            status: 'ESCALATED',
            assignedTo: 'auth_reviewer_01',
            assignedRole: 'AUTHORITY_REVIEWER',
            reporterAnonymousId: 'anon_cit_912',
            title: 'Malicious Banking Impersonation APK & Fake KYC Domain',
            description: 'Fraudulent SMS prompting users to download an APK under the pretext of mandatory PAN-card linking for SBI YONO accounts.',
            evidenceList: ['evidence/sbi_sms_screenshot.png', 'evidence/apk_signature.txt'],
            triDimensionSummary: {
              money: { count: 2, items: ['Credential theft aimed at net-banking balances'] },
              data: { count: 3, items: ['SMS intercept permissions requested in malicious APK'] },
              manipulation: { count: 2, items: ['Immediate account suspension urgency'] },
            },
            communityVotes: { experienced: 142, possibly: 14, does_not_match: 1 },
            aiFindingsSummary: 'High confidence phishing domain using punycode and trademark infringement. Unofficial APK distribution observed.',
            internalNotes: [
              {
                id: 'note_1',
                author: 'Mod_Priya',
                text: 'Verified matching domain registrant against Indian CERT-In advisories.',
                createdAt: new Date(Date.now() - 86400000).toISOString(),
              },
            ],
            actionHistory: [
              {
                id: 'act_1',
                actionType: 'STATUS_CHANGE',
                performedBy: 'Mod_Priya',
                performedAt: new Date(Date.now() - 86400000).toISOString(),
                notes: 'Case escalated for domain takedown preparation.',
                previousStatus: 'UNDER_REVIEW',
                newStatus: 'ESCALATED',
              },
            ],
            createdAt: new Date(Date.now() - 172800000).toISOString(),
            updatedAt: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'CASE-2026-002',
            reportId: 'rep_sub_trap_04',
            websiteDomain: 'quickpdfconvert.live',
            category: 'subscription',
            priority: 'high',
            status: 'UNDER_REVIEW',
            assignedTo: 'admin_rajesh',
            assignedRole: 'ADMIN',
            reporterAnonymousId: 'anon_cit_431',
            title: 'Deceptive ₹9 Free Trial Auto-Billing Mandate Trap',
            description: 'Trial advertised at ₹9; hidden checkbox creates unflagged recurring mandate of ₹2,499 weekly without easy cancellation button.',
            evidenceList: ['evidence/checkout_step_1.png', 'evidence/bank_debit_sms.png'],
            triDimensionSummary: {
              money: { count: 3, items: ['Undisclosed weekly auto-debit of ₹2,499', 'Zero cancellation mechanism'] },
              data: { count: 1, items: ['Pre-selected marketing communications consent'] },
              manipulation: { count: 3, items: ['Forced continuity', 'Confirmshaming on exit attempt'] },
            },
            communityVotes: { experienced: 68, possibly: 9, does_not_match: 3 },
            aiFindingsSummary: 'Drip pricing and negative option billing detected in checkout CSS stylesheet analysis.',
            internalNotes: [
              {
                id: 'note_2',
                author: 'admin_rajesh',
                text: 'Attempted cancellation flow: requires calling international toll number.',
                createdAt: new Date(Date.now() - 43200000).toISOString(),
              },
            ],
            actionHistory: [
              {
                id: 'act_2',
                actionType: 'ASSIGN',
                performedBy: 'admin_rajesh',
                performedAt: new Date(Date.now() - 43200000).toISOString(),
                notes: 'Assigned to consumer protection research queue.',
                previousStatus: 'NEW',
                newStatus: 'UNDER_REVIEW',
              },
            ],
            createdAt: new Date(Date.now() - 120000000).toISOString(),
            updatedAt: new Date(Date.now() - 43200000).toISOString(),
          },
        ];

        for (const c of seedCases) {
          await db.collection(this.casesCollection).doc(c.id).set(c);
        }
      }
    } catch (err) {
      logger.warn({ service: 'adminCaseService', error: String(err) }, 'Seeding admin cases skipped');
    }
  }

  /**
   * Returns overview metrics for the Admin Dashboard
   */
  async getOverviewMetrics() {
    const snap = await db.collection(this.casesCollection).get();
    const cases: AuthorityCase[] = snap.docs.map((d: any) => d.data());

    const totalCases = cases.length;
    const pendingReview = cases.filter((c) => c.status === 'NEW' || c.status === 'UNDER_REVIEW').length;
    const underInvestigation = cases.filter((c) => c.status === 'UNDER_REVIEW' || c.status === 'MORE_INFORMATION_REQUIRED').length;
    const verifiedReports = cases.filter((c) => c.status === 'VERIFIED' || c.status === 'ESCALATED').length;
    const resolvedCases = cases.filter((c) => c.status === 'RESOLVED').length;
    const rejectedReports = cases.filter((c) => c.status === 'REJECTED').length;
    const highPriority = cases.filter((c) => c.priority === 'high' || c.priority === 'critical').length;

    // Aggregated Category Breakdown
    const byCategory: Record<string, number> = {};
    const byStatus: Record<string, number> = {};
    for (const c of cases) {
      byCategory[c.category] = (byCategory[c.category] || 0) + 1;
      byStatus[c.status] = (byStatus[c.status] || 0) + 1;
    }

    return {
      metrics: {
        totalCases,
        pendingReview,
        underInvestigation,
        verifiedReports,
        resolvedCases,
        rejectedReports,
        highPriority,
      },
      breakdowns: {
        byCategory,
        byStatus,
      },
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Retrieves all cases with optional filtering
   */
  async getCases(status?: CaseStatus, priority?: CasePriority): Promise<AuthorityCase[]> {
    await this.seedDefaultCasesIfEmpty();
    const snap = await db.collection(this.casesCollection).get();
    let cases: AuthorityCase[] = snap.docs.map((d: any) => d.data());

    if (status) {
      cases = cases.filter((c) => c.status === status);
    }
    if (priority) {
      cases = cases.filter((c) => c.priority === priority);
    }

    return cases.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Retrieves single case by ID
   */
  async getCaseById(caseId: string): Promise<AuthorityCase | null> {
    const doc = await db.collection(this.casesCollection).doc(caseId).get();
    if (!doc.exists) return null;
    return doc.data();
  }

  /**
   * Updates case status and logs an audit record
   */
  async updateCaseStatus(caseId: string, newStatus: CaseStatus, performedBy: string, notes: string): Promise<AuthorityCase> {
    const c = await this.getCaseById(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);

    const prevStatus = c.status;
    c.status = newStatus;
    c.updatedAt = new Date().toISOString();

    const action: CaseAction = {
      id: generateId(),
      actionType: 'STATUS_UPDATE',
      performedBy,
      performedAt: new Date().toISOString(),
      notes,
      previousStatus: prevStatus,
      newStatus,
    };

    c.actionHistory = [...(c.actionHistory || []), action];
    await db.collection(this.casesCollection).doc(caseId).set(c);

    await this.logAudit({
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: performedBy,
      userRole: 'ADMIN',
      action: `CASE_STATUS_${newStatus}`,
      targetType: 'case',
      targetId: caseId,
      details: `Transitioned from ${prevStatus} to ${newStatus}. Note: ${notes}`,
    });

    return c;
  }

  /**
   * Adds an internal note to the case
   */
  async addInternalNote(caseId: string, author: string, text: string): Promise<AuthorityCase> {
    const c = await this.getCaseById(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);

    const note = {
      id: generateId(),
      author,
      text,
      createdAt: new Date().toISOString(),
    };

    c.internalNotes = [...(c.internalNotes || []), note];
    c.updatedAt = new Date().toISOString();
    await db.collection(this.casesCollection).doc(caseId).set(c);

    await this.logAudit({
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: author,
      userRole: 'ADMIN',
      action: 'ADD_INTERNAL_NOTE',
      targetType: 'case',
      targetId: caseId,
      details: text.slice(0, 100),
    });

    return c;
  }

  /**
   * Records an administrative action (e.g. Escalate, Request More Evidence, Assign Reviewer)
   */
  async recordCaseAction(caseId: string, actionType: string, performedBy: string, notes: string): Promise<AuthorityCase> {
    const c = await this.getCaseById(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);

    const action: CaseAction = {
      id: generateId(),
      actionType,
      performedBy,
      performedAt: new Date().toISOString(),
      notes,
    };

    c.actionHistory = [...(c.actionHistory || []), action];
    c.updatedAt = new Date().toISOString();
    await db.collection(this.casesCollection).doc(caseId).set(c);

    await this.logAudit({
      id: generateId(),
      timestamp: new Date().toISOString(),
      userId: performedBy,
      userRole: 'ADMIN',
      action: actionType,
      targetType: 'case',
      targetId: caseId,
      details: notes,
    });

    return c;
  }

  /**
   * Generates a structured formal case dossier ("Prepared for external submission")
   */
  async generateOfficialCaseReport(caseId: string): Promise<Record<string, unknown>> {
    const c = await this.getCaseById(caseId);
    if (!c) throw new Error(`Case ${caseId} not found`);

    return {
      documentHeader: {
        title: 'DIGITAL CONSUMER PROTECTION CASE DOSSIER',
        subtitle: 'Prepared for external administrative and regulatory submission',
        disclaimer: 'Compiled by COOKIES Consumer Safety Platform. AI-generated analyses are strictly segregated from verified evidence.',
        generatedAt: new Date().toISOString(),
      },
      caseMetadata: {
        caseId: c.id,
        status: c.status,
        priority: c.priority,
        websiteDomain: c.websiteDomain,
        category: c.category,
        incidentDate: c.createdAt,
        lastUpdated: c.updatedAt,
      },
      observedEvidence: {
        title: c.title,
        description: c.description,
        attachedEvidenceCount: c.evidenceList.length,
        evidenceArtifacts: c.evidenceList,
      },
      triDimensionalAssessment: c.triDimensionSummary || {
        money: { count: 0, items: [] },
        data: { count: 0, items: [] },
        manipulation: { count: 0, items: [] },
      },
      communityVerificationRecord: {
        totalCommunityVotes: c.communityVotes.experienced + c.communityVotes.possibly + c.communityVotes.does_not_match,
        experienced: c.communityVotes.experienced,
        possibly: c.communityVotes.possibly,
        doesNotMatch: c.communityVotes.does_not_match,
      },
      aiModelFindings: {
        summary: c.aiFindingsSummary,
        attribution: 'Google Gemini 2.5 Flash Safety Analysis Engine',
        honestUncertaintyNotice: 'Inferences are limited to user-submitted interfaces. Internal website database architectures were not directly probed.',
      },
      administrativeAuditChain: c.actionHistory,
      recommendedAdministrativeAction: c.status === 'ESCALATED'
        ? 'Domain takedown notice to hosting registrar and referral to National Cyber Crime Reporting Portal (NCRP).'
        : 'Continued monitoring and evidence accumulation.',
    };
  }

  /**
   * Logs an audit record to the immutable audit trail
   */
  async logAudit(log: AuditLog) {
    try {
      await db.collection(this.auditCollection).doc(log.id).set(log);
    } catch (err) {
      logger.error({ service: 'adminCaseService', error: String(err) }, 'Failed to persist audit log');
    }
  }

  /**
   * Retrieves the system audit logs
   */
  async getAuditLogs(limit: number = 50): Promise<AuditLog[]> {
    const snap = await db.collection(this.auditCollection).limit(limit).get();
    const logs: AuditLog[] = snap.docs.map((d: any) => d.data());
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const adminCaseService = new AdminCaseService();
