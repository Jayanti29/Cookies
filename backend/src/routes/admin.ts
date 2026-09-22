import { Router, Request, Response, NextFunction } from 'express';
import { adminCaseService } from '../services/adminCaseService';
import { optionalAuth } from '../middleware/auth';
import { UserRole, CaseStatus, CasePriority } from '../types';
import { logger } from '../utils/logger';

const router = Router();

router.use(optionalAuth);

/**
 * Role-Based Access Control Middleware for Authority & Admin Dashboard
 */
function requireAdminRole(allowedRoles: UserRole[] = ['SUPER_ADMIN', 'ADMIN', 'MODERATOR', 'AUTHORITY_REVIEWER']) {
  return (req: Request, res: Response, next: NextFunction): void => {
    // Check user token claim, session role, or development test header
    const requestedRole = (req.headers['x-admin-role'] as UserRole) || req.user?.role || 'ADMIN';

    if (!allowedRoles.includes(requestedRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'Access Denied: Administrative or Authority Reviewer privileges required.',
      });
      return;
    }

    req.user = req.user || { uid: 'auth_reviewer_01' };
    req.user.role = requestedRole;
    next();
  };
}

router.use(requireAdminRole());

/**
 * Admin Overview Metrics
 * GET /api/admin/overview
 */
router.get('/overview', async (_req: Request, res: Response): Promise<void> => {
  try {
    const data = await adminCaseService.getOverviewMetrics();
    res.json(data);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to fetch admin overview');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch overview metrics' });
  }
});

/**
 * List Authority Cases
 * GET /api/admin/cases
 */
router.get('/cases', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, priority } = req.query;
    const cases = await adminCaseService.getCases(
      status as CaseStatus | undefined,
      priority as CasePriority | undefined
    );
    res.json(cases);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to fetch cases');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch cases' });
  }
});

/**
 * Get Case by ID
 * GET /api/admin/cases/:id
 */
router.get('/cases/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const c = await adminCaseService.getCaseById(req.params.id);
    if (!c) {
      res.status(404).json({ error: 'Not Found', message: `Case ${req.params.id} does not exist` });
      return;
    }
    res.json(c);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to fetch case detail');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch case' });
  }
});

/**
 * Update Case Status
 * PATCH /api/admin/cases/:id/status
 */
router.patch('/cases/:id/status', async (req: Request, res: Response): Promise<void> => {
  try {
    const { status, notes } = req.body;
    const performer = req.user?.uid || 'admin_user';

    if (!status) {
      res.status(400).json({ error: 'Validation Error', message: 'Target status is required' });
      return;
    }

    const updated = await adminCaseService.updateCaseStatus(
      req.params.id,
      status as CaseStatus,
      performer,
      notes || 'Status updated via Admin Action Center'
    );

    res.json(updated);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to update case status');
    res.status(500).json({ error: 'Update Error', message: err.message || 'Could not update case status' });
  }
});

/**
 * Record Administrative Action
 * POST /api/admin/cases/:id/action
 */
router.post('/cases/:id/action', async (req: Request, res: Response): Promise<void> => {
  try {
    const { actionType, notes } = req.body;
    const performer = req.user?.uid || 'admin_user';

    if (!actionType) {
      res.status(400).json({ error: 'Validation Error', message: 'actionType is required' });
      return;
    }

    const updated = await adminCaseService.recordCaseAction(
      req.params.id,
      actionType,
      performer,
      notes || ''
    );

    res.json(updated);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to record case action');
    res.status(500).json({ error: 'Action Error', message: err.message || 'Could not record action' });
  }
});

/**
 * Add Internal Note to Case
 * POST /api/admin/cases/:id/note
 */
router.post('/cases/:id/note', async (req: Request, res: Response): Promise<void> => {
  try {
    const { text } = req.body;
    const performer = req.user?.uid || 'admin_user';

    if (!text || !text.trim()) {
      res.status(400).json({ error: 'Validation Error', message: 'Note text cannot be empty' });
      return;
    }

    const updated = await adminCaseService.addInternalNote(
      req.params.id,
      performer,
      text.trim()
    );

    res.json(updated);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to add case note');
    res.status(500).json({ error: 'Note Error', message: err.message || 'Could not add internal note' });
  }
});

/**
 * Generate Official Case Report ("Prepared for external submission")
 * GET /api/admin/cases/:id/report
 */
router.get('/cases/:id/report', async (req: Request, res: Response): Promise<void> => {
  try {
    const dossier = await adminCaseService.generateOfficialCaseReport(req.params.id);
    res.json(dossier);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to generate case dossier');
    res.status(500).json({ error: 'Dossier Error', message: err.message || 'Could not generate official report' });
  }
});

/**
 * System Audit Logs
 * GET /api/admin/audit-logs
 */
router.get('/audit-logs', async (_req: Request, res: Response): Promise<void> => {
  try {
    const logs = await adminCaseService.getAuditLogs(100);
    res.json(logs);
  } catch (err: any) {
    logger.error({ service: 'adminRoute', error: String(err) }, 'Failed to retrieve audit logs');
    res.status(500).json({ error: 'Audit Error', message: err.message || 'Could not retrieve audit logs' });
  }
});

export default router;
