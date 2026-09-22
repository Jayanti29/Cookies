import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

let db: admin.firestore.Firestore;
let storage: admin.storage.Storage;
let auth: admin.auth.Auth;
let initialized = false;

function initFirebase(): void {
  if (initialized) return;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

    if (!projectId) {
      logger.warn({ service: 'firebase' }, 'FIREBASE_PROJECT_ID not set — Firestore operations will fail');
    }

    // Initialize with applicationDefault credential (works in GCP / with ADC locally)
    // Falls back to project-id-only app if no ADC available
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
        storageBucket,
      });
    } catch (credErr) {
      // If applicationDefault fails (e.g. no ADC set up locally), init without explicit cred
      // Firestore/Auth calls will fail at runtime but app won't crash at startup
      logger.warn(
        { service: 'firebase', error: String(credErr) },
        'applicationDefault credential unavailable — falling back to project-only init'
      );
      admin.initializeApp({ projectId, storageBucket });
    }

    db = admin.firestore();
    storage = admin.storage();
    auth = admin.auth();
    initialized = true;

    logger.info({ service: 'firebase', projectId }, 'Firebase Admin SDK initialized');
  } catch (err) {
    logger.error({ service: 'firebase', error: String(err) }, 'Firebase Admin initialization error');
    // Provide stub implementations so the rest of the app can import without crashing
    db = {} as admin.firestore.Firestore;
    storage = {} as admin.storage.Storage;
    auth = {} as admin.auth.Auth;
  }
}

initFirebase();

export { db, storage, auth };
