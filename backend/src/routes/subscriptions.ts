import { Router, Request, Response } from 'express';
import { db } from '../config/firebase';
import { optionalAuth } from '../middleware/auth';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const router = Router();

// Subscriptions route with optionalAuth support
router.use(optionalAuth);

/**
 * Add a Subscription to Watchdog
 * POST /api/subscriptions
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_subscriptions_user';
    const { serviceName, amount, currency, billingFrequency, renewalDate, reminderDays, notes } = req.body;

    if (!serviceName || amount === undefined || !renewalDate) {
      res.status(400).json({ error: 'Validation Error', message: 'serviceName, amount, and renewalDate are required' });
      return;
    }

    const subId = generateId();
    const subscription = {
      id: subId,
      userId,
      serviceName,
      amount: Number(amount),
      currency: currency || 'INR',
      billingFrequency: billingFrequency || 'monthly',
      renewalDate,
      reminderDays: Number(reminderDays) || 3,
      notes: notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db && typeof (db as any).collection === 'function') {
      await (db as any).collection('subscriptions').doc(subId).set(subscription);
    }

    logger.info({ service: 'subscriptions', subId, userId }, 'Subscription tracked');
    res.status(201).json(subscription);
  } catch (err: any) {
    logger.error({ service: 'subscriptions', error: String(err) }, 'Failed to add subscription');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not save subscription' });
  }
});

/**
 * Get User's Subscriptions
 * GET /api/subscriptions
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_subscriptions_user';

    if (!db || typeof (db as any).collection !== 'function') {
      res.json([]);
      return;
    }

    const snapshot = await (db as any)
      .collection('subscriptions')
      .where('userId', '==', userId)
      .orderBy('renewalDate', 'asc')
      .get();

    const subs = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(subs);
  } catch (err: any) {
    logger.error({ service: 'subscriptions', error: String(err) }, 'Failed to fetch subscriptions');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not retrieve subscriptions' });
  }
});

/**
 * Update Subscription
 * PUT /api/subscriptions/:id
 */
router.put('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_subscriptions_user';
    const { id } = req.params;

    if (!db || typeof (db as any).collection !== 'function') {
      res.json({ id, ...req.body });
      return;
    }

    const docRef = (db as any).collection('subscriptions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Not Found', message: 'Subscription not found' });
      return;
    }

    if (doc.data()?.userId !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
      return;
    }

    const updates = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };
    delete updates.id;
    delete updates.userId;

    await docRef.update(updates);
    res.json({ id, ...doc.data(), ...updates });
  } catch (err: any) {
    logger.error({ service: 'subscriptions', error: String(err) }, 'Failed to update subscription');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not update subscription' });
  }
});

/**
 * Delete Subscription
 * DELETE /api/subscriptions/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_subscriptions_user';
    const { id } = req.params;

    if (!db || typeof (db as any).collection !== 'function') {
      res.json({ success: true });
      return;
    }

    const docRef = (db as any).collection('subscriptions').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Not Found', message: 'Subscription not found' });
      return;
    }

    if (doc.data()?.userId !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'Unauthorized' });
      return;
    }

    await docRef.delete();
    res.json({ success: true, message: 'Subscription deleted' });
  } catch (err: any) {
    logger.error({ service: 'subscriptions', error: String(err) }, 'Failed to delete subscription');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not delete subscription' });
  }
});

export default router;
