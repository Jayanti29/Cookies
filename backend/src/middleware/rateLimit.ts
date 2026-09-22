import rateLimit from 'express-rate-limit';

/** General rate limiter: 100 requests per 15 minutes */
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Rate limit exceeded. Please wait 15 minutes before retrying.',
    retryAfter: '15 minutes',
  },
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise IP
    return req.user?.uid ?? req.ip ?? 'unknown';
  },
});

/** Stricter analysis rate limiter: 20 requests per 15 minutes */
export const analysisLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Analysis rate limit exceeded. You can perform 20 analyses per 15 minutes.',
    retryAfter: '15 minutes',
  },
  keyGenerator: (req) => {
    return req.user?.uid ?? req.ip ?? 'unknown';
  },
});

/** Vote rate limiter: 50 votes per hour to prevent vote stuffing */
export const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too Many Requests',
    message: 'Vote limit exceeded. Please try again later.',
  },
  keyGenerator: (req) => req.user?.uid ?? req.ip ?? 'unknown',
});
