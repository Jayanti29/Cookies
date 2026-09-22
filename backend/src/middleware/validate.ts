import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';

// ─── Zod schemas ──────────────────────────────────────────────────────────────

export const urlSchema = z
  .string()
  .max(2048, 'URL too long')
  .url('Must be a valid HTTP/HTTPS URL')
  .refine((u) => u.startsWith('http://') || u.startsWith('https://'), {
    message: 'Only HTTP and HTTPS protocols are permitted',
  });

export const textInputSchema = z
  .string()
  .min(1, 'Content must not be empty')
  .max(10000, 'Content exceeds maximum 10,000 characters');

export const fileMetaSchema = z.object({
  size: z.number().max(50 * 1024 * 1024, 'File must be under 50 MB'),
  mimetype: z.string().refine(
    (m) =>
      m.startsWith('image/') ||
      m === 'application/pdf' ||
      m.startsWith('text/'),
    'Accepted types: images, PDF, or plain text'
  ),
});

// ─── Validation helpers ───────────────────────────────────────────────────────

/** Validate a URL string */
export function validateURL(url: string): { valid: boolean; error?: string } {
  const result = urlSchema.safeParse(url);
  return result.success ? { valid: true } : { valid: false, error: result.error.issues[0]?.message };
}

/** Validate a text input */
export function validateTextInput(text: string): { valid: boolean; error?: string } {
  const result = textInputSchema.safeParse(text);
  return result.success ? { valid: true } : { valid: false, error: result.error.issues[0]?.message };
}

/** Validate file metadata (size, mimetype) from a multer file */
export function validateFileUpload(file: Express.Multer.File): { valid: boolean; error?: string } {
  const result = fileMetaSchema.safeParse({ size: file.size, mimetype: file.mimetype });
  return result.success ? { valid: true } : { valid: false, error: result.error.issues[0]?.message };
}

// ─── Express middleware factory ────────────────────────────────────────────────

/**
 * Creates an Express middleware that validates req.body against a Zod schema.
 * Returns 400 with validation errors if schema fails.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation Error',
        issues: result.error.issues.map((i) => ({
          field: i.path.join('.'),
          message: i.message,
        })),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
