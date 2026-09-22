import { Router, Request, Response } from 'express';
import multer from 'multer';
import { db, storage } from '../config/firebase';
import { optionalAuth } from '../middleware/auth';
import { generateId } from '../utils/helpers';
import { logger } from '../utils/logger';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 },
});

// Use optionalAuth so guest/demo users can use the Evidence Vault
router.use(optionalAuth);

/**
 * Upload & Save Evidence
 * POST /api/evidence
 */
router.post('/', upload.single('file'), async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_vault_user';
    const { title, description, category, reportId, tags } = req.body;

    if (!req.file && !req.body.content) {
      res.status(400).json({ error: 'Validation Error', message: 'No file or content provided' });
      return;
    }

    const evidenceId = generateId();
    let fileUrl = '';
    let storagePath = '';
    let mimeType = 'text/plain';
    let size = 0;

    if (req.file) {
      mimeType = req.file.mimetype;
      size = req.file.size;
      storagePath = `evidence/${userId}/${evidenceId}_${req.file.originalname}`;

      if (storage && typeof (storage as any).bucket === 'function') {
        try {
          const bucket = (storage as any).bucket();
          const file = bucket.file(storagePath);
          await file.save(req.file.buffer, {
            metadata: { contentType: req.file.mimetype },
          });
          fileUrl = `gs://${bucket.name}/${storagePath}`;
        } catch {
          // In-memory / data URL fallback if Storage credentials not available locally
          fileUrl = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
        }
      } else {
        // In-memory fallback if Storage bucket not configured
        fileUrl = `data:${mimeType};base64,${req.file.buffer.toString('base64')}`;
      }
    }

    const evidenceDoc = {
      id: evidenceId,
      ownerId: userId,
      title: title || 'Saved Evidence',
      description: description || '',
      category: category || 'general',
      reportId: reportId || null,
      fileUrl,
      storagePath,
      mimeType,
      size,
      tags: tags ? (Array.isArray(tags) ? tags : [tags]) : [],
      isPrivate: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (db && typeof (db as any).collection === 'function') {
      await (db as any).collection('evidence').doc(evidenceId).set(evidenceDoc);
    }

    logger.info({ service: 'evidence', evidenceId, userId }, 'Evidence saved securely');
    res.status(201).json(evidenceDoc);
  } catch (err: any) {
    logger.error({ service: 'evidence', error: String(err) }, 'Failed to save evidence');
    res.status(500).json({ error: 'Storage Error', message: err.message || 'Could not save evidence' });
  }
});

/**
 * Get User's Evidence Vault Items
 * GET /api/evidence
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_vault_user';

    if (!db || typeof (db as any).collection !== 'function') {
      res.json([]);
      return;
    }

    const snapshot = await (db as any)
      .collection('evidence')
      .where('ownerId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();

    const items = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (err: any) {
    logger.error({ service: 'evidence', error: String(err) }, 'Failed to fetch evidence items');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not fetch evidence' });
  }
});

/**
 * Get Single Evidence Item (owner only)
 * GET /api/evidence/:id
 */
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_vault_user';
    const { id } = req.params;

    if (!db || typeof (db as any).collection !== 'function') {
      res.status(404).json({ error: 'Not Found', message: 'Evidence not found' });
      return;
    }

    const doc = await (db as any).collection('evidence').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Not Found', message: 'Evidence item not found' });
      return;
    }

    const data = doc.data();
    if (data.ownerId !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to view this evidence' });
      return;
    }

    res.json({ id: doc.id, ...data });
  } catch (err: any) {
    logger.error({ service: 'evidence', error: String(err) }, 'Failed to fetch evidence detail');
    res.status(500).json({ error: 'Database Error', message: err.message || 'Could not retrieve evidence' });
  }
});

/**
 * Delete Evidence (owner only)
 * DELETE /api/evidence/:id
 */
router.delete('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.uid || 'guest_vault_user';
    const { id } = req.params;

    if (!db || typeof (db as any).collection !== 'function') {
      res.json({ success: true });
      return;
    }

    const docRef = (db as any).collection('evidence').doc(id);
    const doc = await docRef.get();

    if (!doc.exists) {
      res.status(404).json({ error: 'Not Found', message: 'Evidence item not found' });
      return;
    }

    const data = doc.data();
    if (data.ownerId !== userId) {
      res.status(403).json({ error: 'Forbidden', message: 'You do not have permission to delete this evidence' });
      return;
    }

    // Delete from Firestore
    await docRef.delete();

    // Optionally delete from Storage
    if (data.storagePath && storage && typeof (storage as any).bucket === 'function') {
      try {
        await (storage as any).bucket().file(data.storagePath).delete();
      } catch {
        // Storage file deletion failure is non-fatal
      }
    }

    res.json({ success: true, message: 'Evidence deleted' });
  } catch (err: any) {
    logger.error({ service: 'evidence', error: String(err) }, 'Failed to delete evidence');
    res.status(500).json({ error: 'Delete Error', message: err.message || 'Could not delete evidence' });
  }
});

export default router;
