/**
 * Standardized API Response Handler
 * Ensures all API responses follow a consistent JSON structure
 */

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
};

export type DuplicateCheckResponse = {
  hasDuplicate: boolean;
  isDuplicate?: boolean;
  status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
  trackingNumber?: string;
  maskedEmail?: string;
  message: string;
  canApply: boolean;
};

/**
 * Create a successful response
 */
export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create an error response
 */
export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, any>
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Create a duplicate detection response
 */
export function duplicateResponse(
  hasDuplicate: boolean,
  data?: {
    status?: 'pending' | 'approved' | 'rejected' | 'cancelled';
    trackingNumber?: string;
    maskedEmail?: string;
    message?: string;
    canApply?: boolean;
  }
): DuplicateCheckResponse {
  return {
    hasDuplicate,
    isDuplicate: hasDuplicate, // Alternative property name for compatibility
    status: data?.status,
    trackingNumber: data?.trackingNumber,
    maskedEmail: data?.maskedEmail,
    message: data?.message || (hasDuplicate ? 'Existing application found' : 'No existing applications found'),
    canApply: data?.canApply !== undefined ? data.canApply : !hasDuplicate,
  };
}

/**
 * HTTP Status Codes
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409, // For duplicate entries
  UNPROCESSABLE_ENTITY: 422,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
} as const;

/**
 * Error Codes
 */
export const ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INVALID_OTP: 'INVALID_OTP',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  ACCOUNT_LOCKED: 'ACCOUNT_LOCKED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;
