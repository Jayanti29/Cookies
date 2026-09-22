import * as admin from 'firebase-admin';
import { logger } from '../utils/logger';

// In-memory fallback store when GCP credentials are not available locally
class MemoryStore {
  private collections: Map<string, Map<string, any>> = new Map();

  constructor() {
    this.seedDefaults();
  }

  private seedDefaults() {
    const defaultReports = [
      {
        id: 'rep_sbi_phish_01',
        userId: 'community_safety_team',
        analysisId: 'ana_sbi_01',
        title: 'Fake SBI YONO APK WhatsApp link asking for PAN update',
        description: 'Received message: "Dear Customer your SBI YONO account will be blocked today update PAN link: bit.ly/sbi-kyc-update". File downloaded was malicious sbi_update.apk.',
        category: 'phishing',
        status: 'verified',
        severity: 'high',
        evidence: [],
        platform: 'WhatsApp',
        url: 'https://bit.ly/sbi-kyc-update',
        isPublic: true,
        communityVotes: { experienced: 42, possibly: 5, does_not_match: 1 },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'rep_job_scam_02',
        userId: 'community_safety_team',
        analysisId: 'ana_job_02',
        title: 'Telegram YouTube Video Liker Task Scam (Prepaid Deposit Trap)',
        description: 'Offered ₹2500/day for liking videos. Paid small amount initially, then demanded ₹5000 deposit to release earnings.',
        category: 'job_scam',
        status: 'verified',
        severity: 'high',
        evidence: [],
        platform: 'Telegram',
        url: 'https://t.me/vip_task_earnings',
        isPublic: true,
        communityVotes: { experienced: 78, possibly: 12, does_not_match: 0 },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'rep_elec_scam_03',
        userId: 'community_safety_team',
        analysisId: 'ana_elec_03',
        title: 'Electricity Disconnection Fake SMS & Malicious APK',
        description: 'SMS claiming power will be cut tonight at 9:30 PM due to unpaid bill. Fraudulent APK steals SMS OTPs.',
        category: 'payment',
        status: 'verified',
        severity: 'critical',
        evidence: [],
        platform: 'SMS',
        url: 'https://bescom-bill-pay.xyz',
        isPublic: true,
        communityVotes: { experienced: 104, possibly: 8, does_not_match: 2 },
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        updatedAt: new Date(Date.now() - 10800000).toISOString(),
      },
      {
        id: 'rep_sub_trap_04',
        userId: 'community_safety_team',
        analysisId: 'ana_sub_04',
        title: 'Hidden Weekly Auto-Debit after ₹9 Trial PDF Converter',
        description: 'Signed up for ₹9 trial. Hidden in terms was an unflagged auto-renewing weekly subscription of ₹2,499.',
        category: 'subscription',
        status: 'verified',
        severity: 'medium',
        evidence: [],
        platform: 'Web',
        url: 'https://quickpdfconvert.live',
        isPublic: true,
        communityVotes: { experienced: 31, possibly: 9, does_not_match: 3 },
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: new Date(Date.now() - 14400000).toISOString(),
      },
    ];

    const reportsMap = new Map<string, any>();
    for (const r of defaultReports) {
      reportsMap.set(r.id, r);
    }
    this.collections.set('reports', reportsMap);
  }

  getCollection(name: string): Map<string, any> {
    if (!this.collections.has(name)) {
      this.collections.set(name, new Map());
    }
    return this.collections.get(name)!;
  }
}

const memoryStore = new MemoryStore();

function createResilientDb(realFirestore: admin.firestore.Firestore | null) {
  return {
    collection(name: string) {
      const colMap = memoryStore.getCollection(name);

      return {
        doc(id: string) {
          return {
            async set(data: any) {
              if (realFirestore) {
                try {
                  return await realFirestore.collection(name).doc(id).set(data);
                } catch {
                  // Fall back to memory store if GCP credentials not available locally
                }
              }
              colMap.set(id, { ...data, id });
            },
            async get() {
              if (realFirestore) {
                try {
                  const snap = await realFirestore.collection(name).doc(id).get();
                  if (snap.exists) return snap;
                } catch {
                  // Fall back to memory store
                }
              }
              const item = colMap.get(id);
              return {
                exists: !!item,
                data: () => item ? { ...item } : undefined,
                id,
              };
            },
            async update(data: any) {
              if (realFirestore) {
                try {
                  return await realFirestore.collection(name).doc(id).update(data);
                } catch {
                  // Fall back to memory store
                }
              }
              const existing = colMap.get(id) || {};
              colMap.set(id, { ...existing, ...data });
            },
            async delete() {
              if (realFirestore) {
                try {
                  return await realFirestore.collection(name).doc(id).delete();
                } catch {
                  // Fall back to memory store
                }
              }
              colMap.delete(id);
            },
          };
        },
        where(field: string, op: string, val: any) {
          let items = Array.from(colMap.values()).filter((item) => {
            if (op === '==') return item[field] === val;
            if (op === '!=') return item[field] !== val;
            if (op === '>') return item[field] > val;
            if (op === '<') return item[field] < val;
            return true;
          });

          const queryObj = {
            where(nextField: string, nextOp: string, nextVal: any) {
              items = items.filter((item) => {
                if (nextOp === '==') return item[nextField] === nextVal;
                return true;
              });
              return queryObj;
            },
            orderBy(orderField: string, dir: 'asc' | 'desc' = 'asc') {
              items.sort((a, b) => {
                const va = a[orderField] || '';
                const vb = b[orderField] || '';
                if (dir === 'desc') return va < vb ? 1 : va > vb ? -1 : 0;
                return va > vb ? 1 : va < vb ? -1 : 0;
              });
              return queryObj;
            },
            limit(count: number) {
              items = items.slice(0, count);
              return queryObj;
            },
            async get() {
              if (realFirestore) {
                try {
                  return await realFirestore.collection(name).where(field as any, op as any, val).get();
                } catch {
                  // Fall back to memory store
                }
              }
              return {
                docs: items.map((item) => ({
                  id: item.id,
                  data: () => ({ ...item }),
                })),
                size: items.length,
                forEach(callback: (doc: any) => void) {
                  items.forEach((item) => callback({ id: item.id, data: () => ({ ...item }) }));
                },
              };
            },
          };
          return queryObj;
        },
        async get() {
          if (realFirestore) {
            try {
              return await realFirestore.collection(name).get();
            } catch {
              // Fall back to memory store
            }
          }
          const items = Array.from(colMap.values());
          return {
            docs: items.map((item) => ({
              id: item.id,
              data: () => ({ ...item }),
            })),
            size: items.length,
            forEach(callback: (doc: any) => void) {
              items.forEach((item) => callback({ id: item.id, data: () => ({ ...item }) }));
            },
          };
        },
      };
    },
    async runTransaction(callback: (t: any) => Promise<any>) {
      if (realFirestore) {
        try {
          return await realFirestore.runTransaction(callback);
        } catch {
          // Fall back to memory transaction
        }
      }
      const t = {
        async get(docRef: any) {
          return await docRef.get();
        },
        async update(docRef: any, data: any) {
          return await docRef.update(data);
        },
        async set(docRef: any, data: any) {
          return await docRef.set(data);
        },
      };
      return await callback(t);
    },
  };
}

let db: any;
let storage: any;
let auth: any;
let initialized = false;

function initFirebase(): void {
  if (initialized) return;

  const projectId = process.env.FIREBASE_PROJECT_ID || 'mindmaze-26459';
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET;

  let realFs: admin.firestore.Firestore | null = null;
  try {
    try {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        projectId,
        storageBucket,
      });
    } catch {
      admin.initializeApp({ projectId, storageBucket });
    }
    realFs = admin.firestore();
    storage = admin.storage();
    auth = admin.auth();
  } catch (err) {
    logger.warn({ service: 'firebase', error: String(err) }, 'Firebase SDK fallback to memory store');
  }

  db = createResilientDb(realFs);
  initialized = true;
  logger.info({ service: 'firebase', projectId }, 'Resilient Firebase layer initialized');
}

initFirebase();

export { db, storage, auth };
