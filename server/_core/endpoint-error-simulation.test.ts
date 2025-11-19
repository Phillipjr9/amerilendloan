/**
 * Endpoint Error Simulation Integration Tests
 * Demonstrates error simulation usage with real API endpoints
 */

import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { errorSimulationRegistry } from "./error-simulation";

describe("Endpoint Error Simulation Integration", () => {
  beforeEach(() => {
    errorSimulationRegistry.enableSimulation();
  });

  afterEach(() => {
    errorSimulationRegistry.disableSimulation();
    errorSimulationRegistry.clearAllErrorSimulations();
  });

  describe("Loan Calculator Endpoints", () => {
    it("should simulate loan calculator timeout", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "GATEWAY_TIMEOUT",
        {
          delayMs: 5000,
          errorMessage: "Loan calculation service took too long to respond",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "loanCalculator.calculatePayment"
      );

      expect(config).toBeDefined();
      expect(config?.statusCode).toBe(504);
      expect(config?.delayMs).toBe(5000);
    });

    it("should simulate loan calculator service unavailable", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "SERVICE_UNAVAILABLE",
        {
          errorMessage: "Loan calculator is undergoing maintenance",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "loanCalculator.calculatePayment"
      );

      expect(config?.statusCode).toBe(503);
      expect(config?.errorCode).toBe("SERVICE_UNAVAILABLE");
    });

    it("should simulate validation endpoint database error", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.validateInputs",
        "DATABASE_ERROR"
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "loanCalculator.validateInputs"
      );

      expect(config?.statusCode).toBe(500);
      expect(config?.errorCode).toBe("DATABASE_ERROR");
    });
  });

  describe("Authentication Endpoints", () => {
    it("should simulate sign-in service error", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "INTERNAL_SERVER_ERROR",
        {
          errorMessage: "Authentication service is temporarily unavailable",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation("auth.supabaseSignIn");

      expect(config).toBeDefined();
      expect(config?.statusCode).toBe(500);
      expect(config?.errorMessage).toContain("temporarily unavailable");
    });

    it("should simulate sign-up rate limit", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignUp",
        "RATE_LIMIT",
        {
          errorMessage: "Too many sign-up attempts. Please try again in 15 minutes.",
          delayMs: 1000,
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation("auth.supabaseSignUp");

      expect(config?.statusCode).toBe(429);
      expect(config?.errorCode).toBe("RATE_LIMITED");
      expect(config?.delayMs).toBe(1000);
    });

    it("should simulate sign-in external API error", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "EXTERNAL_API_ERROR",
        {
          errorMessage: "Identity provider is currently unavailable",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation("auth.supabaseSignIn");

      expect(config?.statusCode).toBe(502);
      expect(config?.errorCode).toBe("EXTERNAL_API_ERROR");
    });
  });

  describe("Payment Endpoints", () => {
    it("should simulate payment gateway error", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "PAYMENT_GATEWAY_ERROR",
        {
          errorMessage: "Payment processor is temporarily unavailable",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "payments.createIntent"
      );

      expect(config?.statusCode).toBe(502);
      expect(config?.errorCode).toBe("PAYMENT_GATEWAY_ERROR");
    });

    it("should simulate payment service timeout", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "NETWORK_TIMEOUT",
        {
          delayMs: 8000,
          errorMessage: "Payment processing request timed out",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "payments.createIntent"
      );

      expect(config?.statusCode).toBe(504);
      expect(config?.delayMs).toBe(8000);
    });

    it("should simulate payment service unavailable", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "SERVICE_UNAVAILABLE",
        {
          errorMessage: "Payment service is undergoing scheduled maintenance",
        }
      );

      const config = errorSimulationRegistry.getErrorSimulation(
        "payments.createIntent"
      );

      expect(config?.statusCode).toBe(503);
    });
  });

  describe("Multiple Endpoint Errors", () => {
    it("should simulate errors across multiple endpoints", () => {
      // Simulate errors for multiple services
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "INTERNAL_SERVER_ERROR"
      );

      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "SERVICE_UNAVAILABLE"
      );

      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "PAYMENT_GATEWAY_ERROR"
      );

      // Verify all are registered
      expect(errorSimulationRegistry.shouldSimulateError("auth.supabaseSignIn")).toBe(true);
      expect(
        errorSimulationRegistry.shouldSimulateError("loanCalculator.calculatePayment")
      ).toBe(true);
      expect(errorSimulationRegistry.shouldSimulateError("payments.createIntent")).toBe(
        true
      );

      // Verify each has correct configuration
      const authConfig = errorSimulationRegistry.getErrorSimulation("auth.supabaseSignIn");
      const loanConfig = errorSimulationRegistry.getErrorSimulation(
        "loanCalculator.calculatePayment"
      );
      const paymentConfig = errorSimulationRegistry.getErrorSimulation(
        "payments.createIntent"
      );

      expect(authConfig?.statusCode).toBe(500);
      expect(loanConfig?.statusCode).toBe(503);
      expect(paymentConfig?.statusCode).toBe(502);
    });

    it("should selectively disable endpoint errors", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "INTERNAL_SERVER_ERROR"
      );
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "SERVICE_UNAVAILABLE"
      );
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "PAYMENT_GATEWAY_ERROR"
      );

      // Unregister one
      errorSimulationRegistry.unregisterErrorSimulation("auth.supabaseSignIn");

      // Verify status
      expect(errorSimulationRegistry.shouldSimulateError("auth.supabaseSignIn")).toBe(false);
      expect(
        errorSimulationRegistry.shouldSimulateError("loanCalculator.calculatePayment")
      ).toBe(true);
      expect(errorSimulationRegistry.shouldSimulateError("payments.createIntent")).toBe(
        true
      );
    });
  });

  describe("Endpoint Error Scenarios", () => {
    it("should simulate sign-in failure then sign-up failure scenario", () => {
      // User tries to sign in but service is down
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "SERVICE_UNAVAILABLE"
      );

      expect(
        errorSimulationRegistry.shouldSimulateError("auth.supabaseSignIn")
      ).toBe(true);

      // Service comes back up, add sign-up error instead
      errorSimulationRegistry.unregisterErrorSimulation("auth.supabaseSignIn");
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignUp",
        "RATE_LIMIT"
      );

      expect(
        errorSimulationRegistry.shouldSimulateError("auth.supabaseSignIn")
      ).toBe(false);
      expect(errorSimulationRegistry.shouldSimulateError("auth.supabaseSignUp")).toBe(
        true
      );
    });

    it("should test loan calculation retry scenario", () => {
      // First attempt fails with timeout
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "GATEWAY_TIMEOUT",
        { delayMs: 5000 }
      );

      const config1 = errorSimulationRegistry.getErrorSimulation(
        "loanCalculator.calculatePayment"
      );
      expect(config1?.statusCode).toBe(504);
      expect(config1?.delayMs).toBe(5000);

      // Simulate service recovery - remove error
      errorSimulationRegistry.unregisterErrorSimulation("loanCalculator.calculatePayment");

      // Verify retry would succeed
      expect(
        errorSimulationRegistry.shouldSimulateError("loanCalculator.calculatePayment")
      ).toBe(false);
    });

    it("should test payment with cascading service failures", () => {
      // Payment service fails
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "SERVICE_UNAVAILABLE"
      );

      // Authentication still works
      expect(errorSimulationRegistry.shouldSimulateError("auth.supabaseSignIn")).toBe(false);

      // Loan calculator still works
      expect(
        errorSimulationRegistry.shouldSimulateError("loanCalculator.calculatePayment")
      ).toBe(false);

      // But payment is down
      expect(errorSimulationRegistry.shouldSimulateError("payments.createIntent")).toBe(
        true
      );
    });
  });

  describe("Error Configuration Persistence", () => {
    it("should maintain error configurations across queries", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "INTERNAL_SERVER_ERROR",
        {
          errorMessage: "Custom error for testing",
          delayMs: 200,
        }
      );

      // Query multiple times
      for (let i = 0; i < 3; i++) {
        const config = errorSimulationRegistry.getErrorSimulation(
          "loanCalculator.calculatePayment"
        );

        expect(config?.errorMessage).toBe("Custom error for testing");
        expect(config?.delayMs).toBe(200);
        expect(config?.enabled).toBe(true);
      }
    });

    it("should retrieve all registered error simulations", () => {
      errorSimulationRegistry.registerErrorSimulation(
        "auth.supabaseSignIn",
        "INTERNAL_SERVER_ERROR"
      );
      errorSimulationRegistry.registerErrorSimulation(
        "loanCalculator.calculatePayment",
        "SERVICE_UNAVAILABLE"
      );
      errorSimulationRegistry.registerErrorSimulation(
        "payments.createIntent",
        "PAYMENT_GATEWAY_ERROR"
      );

      const allSimulations = errorSimulationRegistry.getAllErrorSimulations();

      expect(allSimulations.size).toBe(3);
      expect(allSimulations.has("auth.supabaseSignIn")).toBe(true);
      expect(allSimulations.has("loanCalculator.calculatePayment")).toBe(true);
      expect(allSimulations.has("payments.createIntent")).toBe(true);
    });
  });
});
