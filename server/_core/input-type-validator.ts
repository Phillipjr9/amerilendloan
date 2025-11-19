/**
 * Loan Calculation & Type Validation
 * Validates data types for amount, term, and interest_rate fields
 */

import { z } from "zod";

/**
 * Zod schemas for loan calculation fields
 */

// Amount validation: positive number in cents, between $10 and $100,000
export const amountSchema = z
  .number()
  .refine(
    (val) => Number.isFinite(val),
    "Amount must be a valid number"
  )
  .refine(
    (val) => val >= 1000, // $10 minimum
    "Amount must be at least $10.00 (1000 cents)"
  )
  .refine(
    (val) => val <= 10000000, // $100,000 maximum
    "Amount must not exceed $100,000.00 (10000000 cents)"
  )
  .refine(
    (val) => Number.isInteger(val),
    "Amount must be a whole number (cents)"
  );

// Term validation: number of months, between 3 and 84 months (7 years)
export const termSchema = z
  .number()
  .refine(
    (val) => Number.isFinite(val),
    "Term must be a valid number"
  )
  .refine(
    (val) => val >= 3,
    "Term must be at least 3 months"
  )
  .refine(
    (val) => val <= 84,
    "Term must not exceed 84 months (7 years)"
  )
  .refine(
    (val) => Number.isInteger(val),
    "Term must be a whole number (months)"
  );

// Interest rate validation: percentage between 0.1% and 35.99%
export const interestRateSchema = z
  .number()
  .refine(
    (val) => Number.isFinite(val),
    "Interest rate must be a valid number"
  )
  .refine(
    (val) => val >= 0.1,
    "Interest rate must be at least 0.1%"
  )
  .refine(
    (val) => val <= 35.99,
    "Interest rate must not exceed 35.99%"
  );

/**
 * Combined loan calculation input schema
 */
export const loanCalculationSchema = z.object({
  amount: amountSchema.describe("Loan amount in cents"),
  term: termSchema.describe("Loan term in months"),
  interestRate: interestRateSchema.describe("Annual interest rate as percentage (e.g., 5.5 for 5.5%)"),
});

export type LoanCalculationInput = z.infer<typeof loanCalculationSchema>;

/**
 * Validation error response type
 */
export interface ValidationErrorResponse {
  success: false;
  error: {
    code: "INVALID_INPUT_TYPE" | "VALIDATION_ERROR" | "INVALID_AMOUNT" | "INVALID_TERM" | "INVALID_INTEREST_RATE";
    message: string;
    details: {
      field: string;
      received: unknown;
      expectedType: string;
      constraints?: string[];
    }[];
  };
  meta: {
    timestamp: string;
  };
}

/**
 * Parse validation error details from Zod error
 */
export function parseValidationErrorDetails(
  error: z.ZodError
): ValidationErrorResponse["error"]["details"] {
  return error.issues.map((err: z.ZodIssue) => ({
    field: err.path.join("."),
    received: (err as any).received,
    expectedType: getExpectedType(err.code),
    constraints: [err.message],
  }));
}

/**
 * Determine expected type from Zod error code
 */
function getExpectedType(code: string): string {
  const typeMap: Record<string, string> = {
    "invalid_type": "Specific type mismatch",
    "invalid_enum": "One of specified enum values",
    "too_small": "Number too small (check minimum value)",
    "too_big": "Number too big (check maximum value)",
    "not_finite": "Finite number",
    "not_int": "Integer (whole number)",
    "invalid_string": "Valid string",
    "invalid_date": "Valid date",
    "default": "Valid input",
  };
  return typeMap[code] || typeMap["default"];
}

/**
 * Create a validation error response
 */
export function createValidationErrorResponse(
  zodError: z.ZodError
): ValidationErrorResponse {
  const details = parseValidationErrorDetails(zodError);

  return {
    success: false,
    error: {
      code: "VALIDATION_ERROR",
      message: `Input validation failed for ${details.length} field(s)`,
      details,
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };
}

/**
 * Validate amount type and value
 * Returns detailed error information if validation fails
 */
export function validateAmount(
  value: unknown
): { valid: true; value: number } | { valid: false; error: ValidationErrorResponse } {
  try {
    const validated = amountSchema.parse(value);
    return { valid: true, value: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: createValidationErrorResponse(error) };
    }
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "INVALID_AMOUNT",
          message: "Invalid amount: must be a positive number in cents",
          details: [
            {
              field: "amount",
              received: value,
              expectedType: "number (in cents)",
              constraints: ["Must be between 1000 and 10000000", "Must be integer"],
            },
          ],
        },
        meta: { timestamp: new Date().toISOString() },
      },
    };
  }
}

/**
 * Validate term type and value
 * Returns detailed error information if validation fails
 */
export function validateTerm(
  value: unknown
): { valid: true; value: number } | { valid: false; error: ValidationErrorResponse } {
  try {
    const validated = termSchema.parse(value);
    return { valid: true, value: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: createValidationErrorResponse(error) };
    }
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "INVALID_TERM",
          message: "Invalid term: must be a positive integer (months)",
          details: [
            {
              field: "term",
              received: value,
              expectedType: "number (months)",
              constraints: ["Must be between 3 and 84", "Must be integer"],
            },
          ],
        },
        meta: { timestamp: new Date().toISOString() },
      },
    };
  }
}

/**
 * Validate interest rate type and value
 * Returns detailed error information if validation fails
 */
export function validateInterestRate(
  value: unknown
): { valid: true; value: number } | { valid: false; error: ValidationErrorResponse } {
  try {
    const validated = interestRateSchema.parse(value);
    return { valid: true, value: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { valid: false, error: createValidationErrorResponse(error) };
    }
    return {
      valid: false,
      error: {
        success: false,
        error: {
          code: "INVALID_INTEREST_RATE",
          message: "Invalid interest rate: must be a number between 0.1 and 35.99",
          details: [
            {
              field: "interestRate",
              received: value,
              expectedType: "number (percentage)",
              constraints: ["Must be between 0.1 and 35.99"],
            },
          ],
        },
        meta: { timestamp: new Date().toISOString() },
      },
    };
  }
}

/**
 * Comprehensive validation for all three fields
 * Returns detailed errors for each invalid field
 */
export function validateLoanCalculationInputs(input: {
  amount?: unknown;
  term?: unknown;
  interestRate?: unknown;
}): { valid: true } | { valid: false; errors: ValidationErrorResponse } {
  const errors: ValidationErrorResponse["error"]["details"] = [];

  // Validate amount
  if (input.amount !== undefined) {
    const amountCheck = validateAmount(input.amount);
    if (!amountCheck.valid) {
      errors.push(...amountCheck.error.error.details);
    }
  } else {
    errors.push({
      field: "amount",
      received: undefined,
      expectedType: "number (in cents)",
      constraints: ["Amount is required"],
    });
  }

  // Validate term
  if (input.term !== undefined) {
    const termCheck = validateTerm(input.term);
    if (!termCheck.valid) {
      errors.push(...termCheck.error.error.details);
    }
  } else {
    errors.push({
      field: "term",
      received: undefined,
      expectedType: "number (months)",
      constraints: ["Term is required"],
    });
  }

  // Validate interest rate
  if (input.interestRate !== undefined) {
    const rateCheck = validateInterestRate(input.interestRate);
    if (!rateCheck.valid) {
      errors.push(...rateCheck.error.error.details);
    }
  } else {
    errors.push({
      field: "interestRate",
      received: undefined,
      expectedType: "number (percentage)",
      constraints: ["Interest rate is required"],
    });
  }

  if (errors.length > 0) {
    return {
      valid: false,
      errors: {
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: `Input validation failed for ${errors.length} field(s)`,
          details: errors,
        },
        meta: { timestamp: new Date().toISOString() },
      },
    };
  }

  return { valid: true };
}

/**
 * Type guard: check if value is a valid number
 */
export function isValidNumberType(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Type guard: check if value is a valid integer
 */
export function isValidIntegerType(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && Number.isFinite(value);
}

/**
 * Get detailed type information for error messages
 */
export function getDetailedTypeInfo(value: unknown): string {
  if (value === null) {
    return "null";
  }
  if (value === undefined) {
    return "undefined";
  }
  if (Array.isArray(value)) {
    return `array with ${value.length} elements`;
  }
  if (typeof value === "object") {
    return `object with keys: ${Object.keys(value).join(", ")}`;
  }
  if (typeof value === "number") {
    if (Number.isNaN(value)) {
      return "NaN (not a number)";
    }
    if (!Number.isFinite(value)) {
      return "Infinity (not finite)";
    }
    return `number: ${value}`;
  }
  if (typeof value === "string") {
    return `string: "${value}"`;
  }
  return `${typeof value}: ${value}`;
}

/**
 * Create detailed error response with type information
 */
export function createDetailedTypeErrorResponse(
  field: string,
  received: unknown,
  expectedType: string
): ValidationErrorResponse {
  return {
    success: false,
    error: {
      code: "INVALID_INPUT_TYPE",
      message: `Invalid type for '${field}': received ${typeof received}, expected ${expectedType}`,
      details: [
        {
          field,
          received,
          expectedType,
          constraints: [
            `Received type: ${typeof received}`,
            `Detailed value: ${getDetailedTypeInfo(received)}`,
          ],
        },
      ],
    },
    meta: { timestamp: new Date().toISOString() },
  };
}

/**
 * Middleware-friendly validation wrapper
 * Use this in API endpoints for consistent validation
 */
export function validateLoanCalcInput(input: unknown) {
  if (!input || typeof input !== "object") {
    return {
      valid: false,
      error: createDetailedTypeErrorResponse(
        "input",
        input,
        "object with amount, term, and interestRate properties"
      ),
    };
  }

  const obj = input as Record<string, unknown>;
  const validation = validateLoanCalculationInputs({
    amount: obj.amount,
    term: obj.term,
    interestRate: obj.interestRate,
  });

  if (!validation.valid) {
    return { valid: false, error: validation.errors };
  }

  return { valid: true };
}
