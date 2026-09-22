import { v4 as uuidv4 } from 'uuid';

// ─── ID Generation ─────────────────────────────────────────────────────────────

/** Generate a UUID v4 string */
export function generateId(): string {
  return uuidv4();
}

// ─── URL Validation ────────────────────────────────────────────────────────────

const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/i;

/** Check whether a string is a valid HTTP/HTTPS URL */
export function isValidURL(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return URL_REGEX.test(url);
  }
}

/** Extract the hostname/domain from a URL */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return url;
  }
}

// ─── Base64 Helpers ────────────────────────────────────────────────────────────

/** Convert a base64 string (with or without data-URI prefix) to a Buffer */
export function base64ToBuffer(base64: string): Buffer {
  const clean = base64.replace(/^data:[^;]+;base64,/, '');
  return Buffer.from(clean, 'base64');
}

/** Convert a Buffer to a base64 string */
export function bufferToBase64(buffer: Buffer): string {
  return buffer.toString('base64');
}

/** Strip data-URI prefix and return raw base64 string */
export function stripDataURI(base64: string): string {
  return base64.replace(/^data:[^;]+;base64,/, '');
}

/** Extract MIME type from a data URI, defaulting to image/jpeg */
export function mimeFromDataURI(dataURI: string): string {
  const match = dataURI.match(/^data:([^;]+);base64,/);
  return match ? match[1] : 'image/jpeg';
}

// ─── Text Sanitisation ─────────────────────────────────────────────────────────

const PII_PATTERNS: Array<{ pattern: RegExp; replacement: string }> = [
  // Credit/debit card numbers (13-19 digits, with optional separators)
  { pattern: /\b(?:\d[ -]?){13,19}\b/g, replacement: '[CARD_NUMBER]' },
  // Social Security Numbers
  { pattern: /\b\d{3}[- ]\d{2}[- ]\d{4}\b/g, replacement: '[SSN]' },
  // Indian Aadhaar
  { pattern: /\b\d{4}[\s-]\d{4}[\s-]\d{4}\b/g, replacement: '[AADHAAR]' },
  // Email addresses
  { pattern: /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g, replacement: '[EMAIL]' },
  // Phone numbers (various formats)
  { pattern: /(?:\+?\d[\s.-]?){7,15}/g, replacement: '[PHONE]' },
  // Passwords (common label patterns)
  { pattern: /password\s*[:=]\s*\S+/gi, replacement: 'password: [REDACTED]' },
  { pattern: /otp\s*[:=]\s*\d+/gi, replacement: 'otp: [REDACTED]' },
];

/** Remove common PII patterns from text before logging or processing */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== 'string') return '';
  let sanitized = text;
  for (const { pattern, replacement } of PII_PATTERNS) {
    sanitized = sanitized.replace(pattern, replacement);
  }
  return sanitized;
}

// ─── Misc Helpers ──────────────────────────────────────────────────────────────

/** Truncate a string to maxLength characters */
export function truncate(text: string, maxLength: number): string {
  if (!text) return '';
  return text.length > maxLength ? text.slice(0, maxLength) + '…' : text;
}

/** Sleep for ms milliseconds */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Format bytes to human readable string */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}
