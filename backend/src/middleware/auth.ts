import { Request, Response, NextFunction } from 'express';
import { auth } from '../config/firebase';
import { logger } from '../utils/logger';

/** Extract Bearer token from Authorization header */
function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

/**
 * Strict auth middleware — rejects requests without a valid Firebase token.
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    res.status(401).json({ error: 'Unauthorized', message: 'Missing Bearer token' });
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
    next();
  } catch (err) {
    logger.warn({ service: 'auth', error: String(err) }, 'Firebase token verification failed');
    res.status(401).json({ error: 'Unauthorized', message: 'Invalid or expired token' });
  }
}

/**
 * Optional auth middleware — attaches user if token is present and valid,
 * but does NOT reject unauthenticated requests.
 */
export async function optionalAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const token = extractToken(req);

  if (!token) {
    next();
    return;
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { uid: decoded.uid, email: decoded.email };
  } catch {
    // Invalid token — proceed without user context
  }

  next();
}
