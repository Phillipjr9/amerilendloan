/**
 * Structured logger for server-side logging.
 *
 * Usage:
 *   import { logger } from "./_core/logger";
 *   logger.info("Payment processed", { userId: 42, amount: 100 });
 *   logger.error("Failed to send email", error);
 *
 * In production the output is newline-delimited JSON (easy to ingest by
 * log aggregators like Datadog, CloudWatch, etc.).  In development the
 * output is human-readable with colour.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const isProduction = process.env.NODE_ENV === "production";
const minLevel: LogLevel = isProduction ? "info" : "debug";

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[minLevel];
}

function formatError(err: unknown): Record<string, unknown> {
  if (err instanceof Error) {
    return {
      message: err.message,
      name: err.name,
      stack: isProduction ? undefined : err.stack,
    };
  }
  return { message: String(err) };
}

function log(level: LogLevel, message: string, meta?: Record<string, unknown> | unknown) {
  if (!shouldLog(level)) return;

  const timestamp = new Date().toISOString();

  // Normalise meta — if it's an Error, wrap it
  let metaObj: Record<string, unknown> | undefined;
  if (meta instanceof Error) {
    metaObj = { error: formatError(meta) };
  } else if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    metaObj = meta as Record<string, unknown>;
    // If meta contains an `error` key that is an Error, format it
    if (metaObj.error instanceof Error) {
      metaObj = { ...metaObj, error: formatError(metaObj.error) };
    }
  } else if (meta !== undefined) {
    metaObj = { data: meta };
  }

  if (isProduction) {
    // Structured JSON output for log aggregators
    const entry = { timestamp, level, message, ...metaObj };
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    fn(JSON.stringify(entry));
  } else {
    // Human-readable coloured output for development
    const colours: Record<LogLevel, string> = {
      debug: "\x1b[90m",   // grey
      info: "\x1b[36m",    // cyan
      warn: "\x1b[33m",    // yellow
      error: "\x1b[31m",   // red
    };
    const reset = "\x1b[0m";
    const prefix = `${colours[level]}[${level.toUpperCase()}]${reset}`;
    const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.log;
    if (metaObj && Object.keys(metaObj).length > 0) {
      fn(`${prefix} ${message}`, metaObj);
    } else {
      fn(`${prefix} ${message}`);
    }
  }
}

export const logger = {
  debug: (message: string, meta?: Record<string, unknown> | unknown) => log("debug", message, meta),
  info: (message: string, meta?: Record<string, unknown> | unknown) => log("info", message, meta),
  warn: (message: string, meta?: Record<string, unknown> | unknown) => log("warn", message, meta),
  error: (message: string, meta?: Record<string, unknown> | unknown) => log("error", message, meta),
};
