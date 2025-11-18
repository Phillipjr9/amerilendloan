/**
 * Response Formatter & Validator
 * Ensures all API responses are valid JSON with proper structure
 * Handles edge cases like null data, undefined, and empty responses
 */

import { Response } from "express";

export interface FormattedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  meta?: {
    timestamp: string;
    path?: string;
  };
}

/**
 * Safe JSON stringification
 * Prevents circular references and ensures JSON-serializable output
 */
export function safeStringify(obj: any, depth = 0, maxDepth = 5): any {
  if (depth > maxDepth) {
    return "[Circular Reference]";
  }

  if (obj === null || obj === undefined) {
    return null;
  }

  if (typeof obj !== "object") {
    return obj;
  }

  if (obj instanceof Date) {
    return obj.toISOString();
  }

  if (obj instanceof Error) {
    return {
      name: obj.name,
      message: obj.message,
      stack: process.env.NODE_ENV === "development" ? obj.stack : undefined,
    };
  }

  if (Array.isArray(obj)) {
    return obj.map(item => safeStringify(item, depth + 1, maxDepth));
  }

  if (typeof obj === "object") {
    const result: any = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        try {
          result[key] = safeStringify(obj[key], depth + 1, maxDepth);
        } catch {
          result[key] = null;
        }
      }
    }
    return result;
  }

  return obj;
}

/**
 * Format a successful response with data
 */
export function formatSuccessResponse<T>(
  data: T,
  options?: {
    path?: string;
    customTimestamp?: string;
  }
): FormattedResponse<T> {
  // Handle null, undefined, or empty data
  const safeData = data === undefined || data === null ? null : safeStringify(data);

  return {
    success: true,
    data: safeData,
    meta: {
      timestamp: options?.customTimestamp || new Date().toISOString(),
      ...(options?.path && { path: options.path }),
    },
  };
}

/**
 * Format an error response
 */
export function formatErrorResponse(
  code: string,
  message: string,
  details?: Record<string, any>,
  options?: {
    path?: string;
    customTimestamp?: string;
    statusCode?: number;
  }
): FormattedResponse {
  const safeDetails = details ? safeStringify(details) : undefined;

  return {
    success: false,
    error: {
      code,
      message: message || "An error occurred",
      ...(safeDetails && { details: safeDetails }),
    },
    meta: {
      timestamp: options?.customTimestamp || new Date().toISOString(),
      ...(options?.path && { path: options.path }),
    },
  };
}

/**
 * Format a not found response (empty result)
 */
export function formatNotFoundResponse(
  resourceType: string,
  options?: {
    path?: string;
    customTimestamp?: string;
  }
): FormattedResponse {
  return {
    success: true,
    data: null,
    meta: {
      timestamp: options?.customTimestamp || new Date().toISOString(),
      ...(options?.path && { path: options.path }),
    },
  };
}

/**
 * Format a list response (array or paginated data)
 */
export function formatListResponse<T>(
  items: T[],
  pagination?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  },
  options?: {
    path?: string;
    customTimestamp?: string;
  }
): FormattedResponse<{
  items: T[];
  pagination?: typeof pagination;
}> {
  return {
    success: true,
    data: {
      items: Array.isArray(items) ? items.map(item => safeStringify(item)) : [],
      ...(pagination && { pagination }),
    },
    meta: {
      timestamp: options?.customTimestamp || new Date().toISOString(),
      ...(options?.path && { path: options.path }),
    },
  };
}

/**
 * Safe JSON response sender
 * Ensures response is always valid JSON, even if there are serialization issues
 */
export function sendJsonResponse<T>(
  res: Response,
  data: T,
  statusCode: number = 200,
  options?: {
    path?: string;
  }
): Response {
  try {
    const response = formatSuccessResponse(data, {
      path: options?.path,
    });

    // Try to serialize the response
    const jsonString = JSON.stringify(response);

    // Send response
    return res.status(statusCode).set("Content-Type", "application/json").send(jsonString);
  } catch (error) {
    // Fallback for serialization errors
    const fallbackResponse = {
      success: false,
      error: {
        code: "SERIALIZATION_ERROR",
        message: "Failed to serialize response data",
        details:
          process.env.NODE_ENV === "development"
            ? {
                error: error instanceof Error ? error.message : String(error),
              }
            : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(options?.path && { path: options.path }),
      },
    };

    return res
      .status(500)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(fallbackResponse));
  }
}

/**
 * Safe JSON error response sender
 */
export function sendErrorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: Record<string, any>,
  options?: {
    path?: string;
  }
): Response {
  try {
    const response = formatErrorResponse(code, message, details, {
      statusCode,
      path: options?.path,
    });

    const jsonString = JSON.stringify(response);
    return res.status(statusCode).set("Content-Type", "application/json").send(jsonString);
  } catch (error) {
    // Fallback for serialization errors
    const fallbackResponse = {
      success: false,
      error: {
        code: "SERIALIZATION_ERROR",
        message: "Failed to serialize error response",
        details:
          process.env.NODE_ENV === "development"
            ? {
                error: error instanceof Error ? error.message : String(error),
              }
            : undefined,
      },
      meta: {
        timestamp: new Date().toISOString(),
        ...(options?.path && { path: options.path }),
      },
    };

    return res
      .status(500)
      .set("Content-Type", "application/json")
      .send(JSON.stringify(fallbackResponse));
  }
}

/**
 * Middleware to ensure response headers are set correctly
 */
export function ensureJsonHeaders(req: any, res: Response, next: any): void {
  // Override default res.json to ensure proper formatting
  const originalJson = res.json.bind(res);

  res.json = function (body: any): Response {
    try {
      // Ensure body is valid JSON
      const safeBody = safeStringify(body);
      const jsonString = JSON.stringify(safeBody);

      // Set headers and send
      return res.status(res.statusCode).set("Content-Type", "application/json").send(jsonString);
    } catch (error) {
      // Fallback response
      const fallback = {
        success: false,
        error: {
          code: "JSON_SERIALIZATION_ERROR",
          message: "Failed to serialize response",
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      return res
        .status(500)
        .set("Content-Type", "application/json")
        .send(JSON.stringify(fallback));
    }
  };

  next();
}

/**
 * Wrap data to handle edge cases
 */
export function wrapResponseData<T>(data: T | null | undefined): T | null {
  // Convert undefined to null for JSON compatibility
  if (data === undefined) {
    return null as any;
  }

  // Handle empty arrays
  if (Array.isArray(data) && data.length === 0) {
    return data;
  }

  // Handle empty objects
  if (typeof data === "object" && data !== null && Object.keys(data).length === 0) {
    return data;
  }

  return data;
}

/**
 * Create a response builder for fluent API
 */
export class ResponseBuilder {
  private statusCode: number = 200;
  private data: any = null;
  private error: { code: string; message: string; details?: any } | null = null;
  private path?: string;

  setStatus(code: number): this {
    this.statusCode = code;
    return this;
  }

  setData(data: any): this {
    this.data = data;
    this.error = null;
    return this;
  }

  setError(code: string, message: string, details?: any): this {
    this.error = { code, message, details };
    this.data = null;
    return this;
  }

  setPath(path: string): this {
    this.path = path;
    return this;
  }

  build(): FormattedResponse {
    if (this.error) {
      return formatErrorResponse(this.error.code, this.error.message, this.error.details, {
        path: this.path,
        statusCode: this.statusCode,
      });
    }

    return formatSuccessResponse(this.data, {
      path: this.path,
    });
  }

  send(res: Response): Response {
    const response = this.build();
    return sendJsonResponse(res, response, this.statusCode, {
      path: this.path,
    });
  }
}

/**
 * Type guard to check if response is valid
 */
export function isValidResponse(obj: any): obj is FormattedResponse {
  return (
    obj &&
    typeof obj === "object" &&
    typeof obj.success === "boolean" &&
    obj.meta &&
    typeof obj.meta.timestamp === "string"
  );
}

/**
 * Ensure response can be JSON serialized
 */
export function ensureJsonSerializable(obj: any): any {
  try {
    JSON.stringify(obj);
    return obj;
  } catch {
    return safeStringify(obj);
  }
}
