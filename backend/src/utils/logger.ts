// ─── Structured logger — never logs passwords, OTPs, or sensitive content ─────

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  service?: string;
  requestId?: string;
  userId?: string;
  duration?: number;
  status?: number | string;
  error?: string;
  [key: string]: unknown;
}

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (process.env.LOG_LEVEL as LogLevel) ?? (process.env.NODE_ENV === 'production' ? 'info' : 'debug');

/** Redact sensitive fields before logging */
function redact(ctx: LogContext): LogContext {
  const SENSITIVE_KEYS = ['password', 'otp', 'token', 'apiKey', 'secret', 'ssn', 'creditCard', 'cvv'];
  const safe: LogContext = { ...ctx };
  for (const key of SENSITIVE_KEYS) {
    if (key in safe) {
      safe[key] = '[REDACTED]';
    }
  }
  return safe;
}

function emit(level: LogLevel, ctx: LogContext, message: string): void {
  if (LEVEL_PRIORITY[level] < LEVEL_PRIORITY[currentLevel]) return;

  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...redact(ctx),
  };

  const out = JSON.stringify(entry);

  if (level === 'error') {
    console.error(out);
  } else if (level === 'warn') {
    console.warn(out);
  } else {
    console.log(out);
  }
}

export const logger = {
  debug: (ctx: LogContext, message: string) => emit('debug', ctx, message),
  info: (ctx: LogContext, message: string) => emit('info', ctx, message),
  warn: (ctx: LogContext, message: string) => emit('warn', ctx, message),
  error: (ctx: LogContext, message: string) => emit('error', ctx, message),
};
