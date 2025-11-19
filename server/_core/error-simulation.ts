/**
 * Error Simulation & Mock Service Provider
 * Enables testing of server errors, timeouts, and network failures
 * Usage: Enable specific error scenarios during testing
 */

import { ENV } from "./env";

/**
 * Error simulation configuration
 */
export interface ErrorSimulationConfig {
  enabled: boolean;
  errorType: ErrorSimulationType;
  statusCode?: number;
  errorCode?: string;
  errorMessage?: string;
  delayMs?: number;
  affectedEndpoints?: string[];
}

/**
 * Supported error types for simulation
 */
export type ErrorSimulationType =
  | "INTERNAL_SERVER_ERROR" // 500
  | "SERVICE_UNAVAILABLE" // 503
  | "BAD_GATEWAY" // 502
  | "GATEWAY_TIMEOUT" // 504
  | "RATE_LIMIT" // 429
  | "NETWORK_TIMEOUT"
  | "NETWORK_FAILURE"
  | "DATABASE_ERROR"
  | "PAYMENT_GATEWAY_ERROR"
  | "EMAIL_SERVICE_ERROR"
  | "SMS_SERVICE_ERROR"
  | "EXTERNAL_API_ERROR"
  | "VALIDATION_ERROR"
  | "AUTHENTICATION_ERROR"
  | "AUTHORIZATION_ERROR"
  | "NOT_FOUND"
  | "CUSTOM";

/**
 * Error simulation registry
 */
class ErrorSimulationRegistry {
  private config: Map<string, ErrorSimulationConfig> = new Map();
  private isEnabled: boolean = false;

  /**
   * Enable error simulation mode
   */
  enableSimulation(): void {
    if (!this.isTestEnvironment()) {
      console.warn(
        "[ErrorSimulation] Error simulation is only available in test environment"
      );
      return;
    }
    this.isEnabled = true;
    console.log("[ErrorSimulation] Error simulation ENABLED");
  }

  /**
   * Disable error simulation mode
   */
  disableSimulation(): void {
    this.isEnabled = false;
    this.config.clear();
    console.log("[ErrorSimulation] Error simulation DISABLED");
  }

  /**
   * Register error simulation for specific endpoint
   */
  registerErrorSimulation(
    endpointName: string,
    errorType: ErrorSimulationType,
    options?: {
      statusCode?: number;
      errorCode?: string;
      errorMessage?: string;
      delayMs?: number;
    }
  ): void {
    if (!this.isTestEnvironment()) {
      console.warn(
        "[ErrorSimulation] Cannot register error simulation outside test environment"
      );
      return;
    }

    const config: ErrorSimulationConfig = {
      enabled: true,
      errorType,
      statusCode: options?.statusCode || this.getDefaultStatusCode(errorType),
      errorCode: options?.errorCode || this.getDefaultErrorCode(errorType),
      errorMessage: options?.errorMessage || this.getDefaultErrorMessage(errorType),
      delayMs: options?.delayMs || 0,
      affectedEndpoints: [endpointName],
    };

    this.config.set(endpointName, config);
    console.log(
      `[ErrorSimulation] Registered ${errorType} for endpoint: ${endpointName}`
    );
  }

  /**
   * Unregister error simulation for specific endpoint
   */
  unregisterErrorSimulation(endpointName: string): void {
    if (this.config.has(endpointName)) {
      this.config.delete(endpointName);
      console.log(`[ErrorSimulation] Unregistered error simulation for: ${endpointName}`);
    }
  }

  /**
   * Check if error simulation should be applied for endpoint
   */
  shouldSimulateError(endpointName: string): boolean {
    if (!this.isEnabled) return false;
    return this.config.has(endpointName) && this.config.get(endpointName)!.enabled;
  }

  /**
   * Get error simulation config for endpoint
   */
  getErrorSimulation(endpointName: string): ErrorSimulationConfig | null {
    if (!this.shouldSimulateError(endpointName)) return null;
    return this.config.get(endpointName) || null;
  }

  /**
   * Get default HTTP status code for error type
   */
  private getDefaultStatusCode(errorType: ErrorSimulationType): number {
    const statusCodes: Record<ErrorSimulationType, number> = {
      INTERNAL_SERVER_ERROR: 500,
      SERVICE_UNAVAILABLE: 503,
      BAD_GATEWAY: 502,
      GATEWAY_TIMEOUT: 504,
      RATE_LIMIT: 429,
      NETWORK_TIMEOUT: 504,
      NETWORK_FAILURE: 503,
      DATABASE_ERROR: 500,
      PAYMENT_GATEWAY_ERROR: 502,
      EMAIL_SERVICE_ERROR: 503,
      SMS_SERVICE_ERROR: 503,
      EXTERNAL_API_ERROR: 502,
      VALIDATION_ERROR: 400,
      AUTHENTICATION_ERROR: 401,
      AUTHORIZATION_ERROR: 403,
      NOT_FOUND: 404,
      CUSTOM: 500,
    };
    return statusCodes[errorType];
  }

  /**
   * Get default error code for error type
   */
  private getDefaultErrorCode(errorType: ErrorSimulationType): string {
    const errorCodes: Record<ErrorSimulationType, string> = {
      INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
      SERVICE_UNAVAILABLE: "SERVICE_UNAVAILABLE",
      BAD_GATEWAY: "BAD_GATEWAY",
      GATEWAY_TIMEOUT: "GATEWAY_TIMEOUT",
      RATE_LIMIT: "RATE_LIMITED",
      NETWORK_TIMEOUT: "NETWORK_TIMEOUT",
      NETWORK_FAILURE: "NETWORK_FAILURE",
      DATABASE_ERROR: "DATABASE_ERROR",
      PAYMENT_GATEWAY_ERROR: "PAYMENT_GATEWAY_ERROR",
      EMAIL_SERVICE_ERROR: "EMAIL_SERVICE_ERROR",
      SMS_SERVICE_ERROR: "SMS_SERVICE_ERROR",
      EXTERNAL_API_ERROR: "EXTERNAL_API_ERROR",
      VALIDATION_ERROR: "VALIDATION_ERROR",
      AUTHENTICATION_ERROR: "AUTHENTICATION_ERROR",
      AUTHORIZATION_ERROR: "AUTHORIZATION_ERROR",
      NOT_FOUND: "NOT_FOUND",
      CUSTOM: "CUSTOM_ERROR",
    };
    return errorCodes[errorType];
  }

  /**
   * Get default error message for error type
   */
  private getDefaultErrorMessage(errorType: ErrorSimulationType): string {
    const messages: Record<ErrorSimulationType, string> = {
      INTERNAL_SERVER_ERROR: "An unexpected server error occurred. Please try again later.",
      SERVICE_UNAVAILABLE: "Service temporarily unavailable. Please try again in a few moments.",
      BAD_GATEWAY: "Bad gateway. The server is temporarily unavailable.",
      GATEWAY_TIMEOUT: "Gateway timeout. The request took too long to process.",
      RATE_LIMIT: "Too many requests. Please wait before trying again.",
      NETWORK_TIMEOUT: "Request timeout. The server did not respond in time.",
      NETWORK_FAILURE: "Network failure. Unable to reach the server.",
      DATABASE_ERROR: "Database error. Unable to process your request.",
      PAYMENT_GATEWAY_ERROR: "Payment gateway error. Please try again or contact support.",
      EMAIL_SERVICE_ERROR: "Email service unavailable. Please try again later.",
      SMS_SERVICE_ERROR: "SMS service unavailable. Please try again later.",
      EXTERNAL_API_ERROR: "External API error. Please try again later.",
      VALIDATION_ERROR: "Validation error. Please check your input.",
      AUTHENTICATION_ERROR: "Authentication failed. Please log in again.",
      AUTHORIZATION_ERROR: "You do not have permission to perform this action.",
      NOT_FOUND: "Resource not found.",
      CUSTOM: "An error occurred. Please try again.",
    };
    return messages[errorType];
  }

  /**
   * Check if running in test environment
   */
  private isTestEnvironment(): boolean {
    return process.env.NODE_ENV === "test" || process.env.VITEST === "true";
  }

  /**
   * Get all registered error simulations
   */
  getAllErrorSimulations(): Map<string, ErrorSimulationConfig> {
    return new Map(this.config);
  }

  /**
   * Clear all error simulations
   */
  clearAllErrorSimulations(): void {
    this.config.clear();
    console.log("[ErrorSimulation] All error simulations cleared");
  }

  /**
   * Check if simulation is active
   */
  isSimulationActive(): boolean {
    return this.isEnabled;
  }
}

/**
 * Global error simulation registry instance
 */
export const errorSimulationRegistry = new ErrorSimulationRegistry();

/**
 * Mock service provider for external dependencies
 */
export interface MockServiceConfig {
  failureRate?: number; // 0-1, percentage of requests that should fail
  delayMs?: number; // Simulate network delay
  throwError?: boolean; // Throw error instead of returning error response
}

/**
 * Base mock service
 */
export class MockService {
  private failureRate: number = 0;
  private delayMs: number = 0;
  private throwError: boolean = false;

  constructor(config?: MockServiceConfig) {
    this.failureRate = config?.failureRate || 0;
    this.delayMs = config?.delayMs || 0;
    this.throwError = config?.throwError || false;
  }

  /**
   * Apply delay simulation
   */
  protected async applyDelay(): Promise<void> {
    if (this.delayMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, this.delayMs));
    }
  }

  /**
   * Check if request should fail based on failure rate
   */
  protected shouldFail(): boolean {
    return Math.random() < this.failureRate;
  }

  /**
   * Handle simulated failure
   */
  protected async handleFailure<T>(
    errorMessage: string,
    errorCode: string = "SERVICE_ERROR"
  ): Promise<T> {
    await this.applyDelay();

    if (this.throwError) {
      throw new Error(`[${errorCode}] ${errorMessage}`);
    }

    return {
      success: false,
      error: {
        code: errorCode,
        message: errorMessage,
      },
    } as T;
  }

  /**
   * Set failure rate (0-1)
   */
  setFailureRate(rate: number): void {
    this.failureRate = Math.max(0, Math.min(1, rate));
  }

  /**
   * Set delay in milliseconds
   */
  setDelay(ms: number): void {
    this.delayMs = Math.max(0, ms);
  }

  /**
   * Set whether to throw errors
   */
  setThrowError(throwError: boolean): void {
    this.throwError = throwError;
  }
}

/**
 * Mock payment gateway
 */
export class MockPaymentGateway extends MockService {
  async processPayment(amount: number, token: string): Promise<{
    success: boolean;
    transactionId?: string;
    error?: { code: string; message: string };
  }> {
    if (this.shouldFail()) {
      return this.handleFailure(
        "Payment processing failed. Please try again.",
        "PAYMENT_PROCESSING_ERROR"
      );
    }

    await this.applyDelay();

    return {
      success: true,
      transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

/**
 * Mock email service
 */
export class MockEmailService extends MockService {
  async sendEmail(to: string, subject: string, html: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: { code: string; message: string };
  }> {
    if (this.shouldFail()) {
      return this.handleFailure(
        "Failed to send email. Please try again later.",
        "EMAIL_SEND_ERROR"
      );
    }

    await this.applyDelay();

    console.log(`[MockEmail] Sent to ${to}: ${subject}`);

    return {
      success: true,
      messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

/**
 * Mock SMS service
 */
export class MockSmsService extends MockService {
  async sendSms(phoneNumber: string, message: string): Promise<{
    success: boolean;
    messageId?: string;
    error?: { code: string; message: string };
  }> {
    if (this.shouldFail()) {
      return this.handleFailure(
        "Failed to send SMS. Please try again later.",
        "SMS_SEND_ERROR"
      );
    }

    await this.applyDelay();

    console.log(`[MockSMS] Sent to ${phoneNumber}: ${message.substring(0, 50)}...`);

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };
  }
}

/**
 * Mock database service
 */
export class MockDatabaseService extends MockService {
  async query<T>(sql: string, params?: any[]): Promise<{
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
  }> {
    if (this.shouldFail()) {
      return this.handleFailure(
        "Database query failed. Please try again.",
        "DATABASE_ERROR"
      );
    }

    await this.applyDelay();

    return {
      success: true,
      data: undefined,
    };
  }
}

/**
 * Mock external API service
 */
export class MockExternalApiService extends MockService {
  async callApi<T>(
    endpoint: string,
    method: string = "GET",
    data?: any
  ): Promise<{
    success: boolean;
    data?: T;
    error?: { code: string; message: string };
  }> {
    if (this.shouldFail()) {
      return this.handleFailure(
        "External API request failed. Please try again.",
        "EXTERNAL_API_ERROR"
      );
    }

    await this.applyDelay();

    return {
      success: true,
      data: undefined,
    };
  }
}

/**
 * Testing utilities
 */
export const errorTestingUtils = {
  /**
   * Simulate random API error
   */
  getRandomError(): {
    type: ErrorSimulationType;
    statusCode: number;
    message: string;
  } {
    const errorTypes: ErrorSimulationType[] = [
      "INTERNAL_SERVER_ERROR",
      "SERVICE_UNAVAILABLE",
      "BAD_GATEWAY",
      "RATE_LIMIT",
      "DATABASE_ERROR",
      "PAYMENT_GATEWAY_ERROR",
    ];

    const randomType = errorTypes[Math.floor(Math.random() * errorTypes.length)];
    const statusCode = errorSimulationRegistry
      .getErrorSimulation("test")?.statusCode || 500;
    const message = errorSimulationRegistry
      .getErrorSimulation("test")?.errorMessage || "Unknown error";

    return {
      type: randomType,
      statusCode,
      message,
    };
  },

  /**
   * Create error response
   */
  createErrorResponse(
    errorType: ErrorSimulationType,
    customMessage?: string
  ): {
    success: false;
    error: {
      code: string;
      message: string;
      details?: Record<string, any>;
    };
    meta: { timestamp: string };
  } {
    const config = errorSimulationRegistry as any;
    const statusCode = config["getDefaultStatusCode"](errorType);
    const errorCode = config["getDefaultErrorCode"](errorType);
    const message = customMessage || config["getDefaultErrorMessage"](errorType);

    return {
      success: false,
      error: {
        code: errorCode,
        message,
        details: {
          errorType,
          statusCode,
          retryable: statusCode >= 500,
        },
      },
      meta: {
        timestamp: new Date().toISOString(),
      },
    };
  },

  /**
   * Assert error response structure
   */
  assertErrorResponse(response: any): boolean {
    if (!response || typeof response !== "object") return false;
    if (response.success !== false) return false;
    if (!response.error || typeof response.error.code !== "string") return false;
    if (typeof response.error.message !== "string") return false;
    if (!response.meta || typeof response.meta.timestamp !== "string") return false;
    return true;
  },
};

export default {
  errorSimulationRegistry,
  MockService,
  MockPaymentGateway,
  MockEmailService,
  MockSmsService,
  MockDatabaseService,
  MockExternalApiService,
  errorTestingUtils,
};
