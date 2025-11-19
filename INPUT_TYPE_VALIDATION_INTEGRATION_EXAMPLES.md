# Input Type Validation - Integration Examples

## Frontend Integration

### React Component with tRPC
```typescript
import { trpc } from "@/lib/trpc";
import { useState } from "react";

export function LoanCalculator() {
  const [inputs, setInputs] = useState({
    amount: 100000,
    term: 12,
    interestRate: 5.5,
  });

  const calculatePayment = trpc.loanCalculator.calculatePayment.useQuery(inputs, {
    enabled: false, // Manual trigger
  });

  const validateInputs = trpc.loanCalculator.validateInputs.useQuery(inputs, {
    enabled: false,
  });

  const handleCalculate = async () => {
    const result = await calculatePayment.refetch();
    
    if (result.data?.success) {
      console.log("Monthly payment:", result.data.data.monthlyPaymentDollars);
    } else if (result.data?.error) {
      console.error("Validation error:", result.data.error.message);
      result.data.error.details.forEach(detail => {
        console.error(`  ${detail.field}: ${detail.constraints?.join(", ")}`);
      });
    }
  };

  const handleValidate = async () => {
    const result = await validateInputs.refetch();
    
    if (result.data?.success) {
      console.log("All inputs valid");
    } else {
      console.error("Validation failures:", result.data?.error.details);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label>Loan Amount ($)</label>
        <input
          type="number"
          value={inputs.amount / 100}
          onChange={(e) => setInputs({
            ...inputs,
            amount: Math.round(parseFloat(e.target.value) * 100)
          })}
          placeholder="1000.00"
        />
      </div>

      <div>
        <label>Term (Months)</label>
        <input
          type="number"
          value={inputs.term}
          onChange={(e) => setInputs({
            ...inputs,
            term: parseInt(e.target.value)
          })}
          placeholder="12"
        />
      </div>

      <div>
        <label>Interest Rate (%)</label>
        <input
          type="number"
          step="0.1"
          value={inputs.interestRate}
          onChange={(e) => setInputs({
            ...inputs,
            interestRate: parseFloat(e.target.value)
          })}
          placeholder="5.5"
        />
      </div>

      <button onClick={handleValidate}>Validate</button>
      <button onClick={handleCalculate}>Calculate</button>

      {calculatePayment.data?.success && (
        <div className="bg-green-50 p-4 rounded">
          <h3>Results</h3>
          <p>Monthly Payment: ${calculatePayment.data.data.monthlyPaymentDollars}</p>
          <p>Total Interest: ${calculatePayment.data.data.totalInterestDollars}</p>
          <p>Total Payment: ${calculatePayment.data.data.totalPaymentDollars}</p>
        </div>
      )}

      {calculatePayment.data?.error && (
        <div className="bg-red-50 p-4 rounded">
          <h3>Error</h3>
          <p>{calculatePayment.data.error.message}</p>
          {calculatePayment.data.error.details.map((detail, i) => (
            <div key={i} className="text-sm text-gray-600 mt-2">
              <p><strong>{detail.field}:</strong> {detail.constraints?.join(", ")}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### Advanced React with Error Handling
```typescript
import { trpc } from "@/lib/trpc";
import { useCallback, useState } from "react";
import { ValidationErrorResponse } from "@/server/_core/input-type-validator";

export function LoanCalculatorAdvanced() {
  const [formData, setFormData] = useState({
    amount: "",
    term: "",
    interestRate: "",
  });

  const [validationState, setValidationState] = useState<{
    field: string;
    error: string;
  }[]>([]);

  const [result, setResult] = useState<any>(null);

  const calculateMutation = trpc.loanCalculator.calculatePayment.useQuery(
    {
      amount: parseInt(formData.amount) * 100 || 0,
      term: parseInt(formData.term) || 0,
      interestRate: parseFloat(formData.interestRate) || 0,
    },
    { enabled: false }
  );

  const validateMutation = trpc.loanCalculator.validateInputs.useQuery(
    {
      amount: formData.amount ? parseInt(formData.amount) * 100 : undefined,
      term: formData.term ? parseInt(formData.term) : undefined,
      interestRate: formData.interestRate ? parseFloat(formData.interestRate) : undefined,
    },
    { enabled: false }
  );

  const handleInputChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleValidate = useCallback(async () => {
    const response = await validateMutation.refetch();
    
    if (response.data?.success === false) {
      setValidationState(
        response.data.error.details.map(detail => ({
          field: detail.field,
          error: detail.constraints?.[0] || detail.field + " is invalid",
        }))
      );
    } else {
      setValidationState([]);
    }
  }, [validateMutation]);

  const handleCalculate = useCallback(async () => {
    // First validate
    await handleValidate();

    // Then calculate if valid
    const response = await calculateMutation.refetch();
    
    if (response.data?.success) {
      setResult(response.data.data);
    } else if (response.data?.error) {
      setValidationState([{
        field: response.data.error.code,
        error: response.data.error.message,
      }]);
    }
  }, [handleValidate, calculateMutation]);

  return (
    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); handleCalculate(); }}>
      {/* Amount Input */}
      <div className="space-y-1">
        <label htmlFor="amount" className="block font-medium">
          Loan Amount ($)
          <span className="text-red-500">*</span>
        </label>
        <input
          id="amount"
          type="number"
          step="10"
          min="10"
          max="100000"
          placeholder="1000.00"
          value={formData.amount}
          onChange={(e) => handleInputChange("amount", e.target.value)}
          className={`w-full px-3 py-2 border rounded ${
            validationState.find(v => v.field === "amount")
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />
        <p className="text-sm text-gray-500">
          Min: $10.00 | Max: $100,000.00
        </p>
        {validationState.find(v => v.field === "amount") && (
          <p className="text-sm text-red-500">
            {validationState.find(v => v.field === "amount")?.error}
          </p>
        )}
      </div>

      {/* Term Input */}
      <div className="space-y-1">
        <label htmlFor="term" className="block font-medium">
          Loan Term (Months)
          <span className="text-red-500">*</span>
        </label>
        <input
          id="term"
          type="number"
          step="1"
          min="3"
          max="84"
          placeholder="12"
          value={formData.term}
          onChange={(e) => handleInputChange("term", e.target.value)}
          className={`w-full px-3 py-2 border rounded ${
            validationState.find(v => v.field === "term")
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />
        <p className="text-sm text-gray-500">
          Min: 3 months | Max: 84 months (7 years)
        </p>
        {validationState.find(v => v.field === "term") && (
          <p className="text-sm text-red-500">
            {validationState.find(v => v.field === "term")?.error}
          </p>
        )}
      </div>

      {/* Interest Rate Input */}
      <div className="space-y-1">
        <label htmlFor="interestRate" className="block font-medium">
          Annual Interest Rate (%)
          <span className="text-red-500">*</span>
        </label>
        <input
          id="interestRate"
          type="number"
          step="0.1"
          min="0.1"
          max="35.99"
          placeholder="5.5"
          value={formData.interestRate}
          onChange={(e) => handleInputChange("interestRate", e.target.value)}
          className={`w-full px-3 py-2 border rounded ${
            validationState.find(v => v.field === "interestRate")
              ? "border-red-500"
              : "border-gray-300"
          }`}
        />
        <p className="text-sm text-gray-500">
          Min: 0.1% | Max: 35.99%
        </p>
        {validationState.find(v => v.field === "interestRate") && (
          <p className="text-sm text-red-500">
            {validationState.find(v => v.field === "interestRate")?.error}
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-white px-4 py-2 rounded font-medium"
        disabled={calculateMutation.isLoading}
      >
        {calculateMutation.isLoading ? "Calculating..." : "Calculate Payment"}
      </button>

      {result && (
        <div className="bg-green-50 border border-green-200 rounded p-4">
          <h3 className="font-semibold text-green-900 mb-3">Results</h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">Monthly Payment:</dt>
              <dd className="font-semibold">${result.monthlyPaymentDollars.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">Total Interest:</dt>
              <dd className="font-semibold text-orange-600">${result.totalInterestDollars.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between border-t pt-2">
              <dt className="text-gray-600">Total Payment:</dt>
              <dd className="font-semibold">${result.totalPaymentDollars.toFixed(2)}</dd>
            </div>
          </dl>
        </div>
      )}
    </form>
  );
}
```

## API Integration

### Direct API Calls
```typescript
// Fetch API
async function calculateLoan(amount: number, term: number, interestRate: number) {
  const params = new URLSearchParams({
    input: JSON.stringify({ amount, term, interestRate }),
  });

  const response = await fetch(
    `/api/trpc/loanCalculator.calculatePayment?${params}`,
    { method: "GET" }
  );

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error?.message || "Calculation failed");
  }

  return data;
}

// Usage
try {
  const result = await calculateLoan(100000, 12, 5.5);
  console.log("Monthly payment:", result.data.monthlyPaymentDollars);
} catch (error) {
  console.error("Error:", error.message);
}
```

### Axios Integration
```typescript
import axios from "axios";

const loanApi = axios.create({
  baseURL: "http://localhost:3000/api/trpc",
});

export const loanCalculatorApi = {
  calculatePayment: async (
    amount: number,
    term: number,
    interestRate: number
  ) => {
    const { data } = await loanApi.get("/loanCalculator.calculatePayment", {
      params: {
        input: JSON.stringify({ amount, term, interestRate }),
      },
    });
    return data;
  },

  validateInputs: async (
    amount: unknown,
    term: unknown,
    interestRate: unknown
  ) => {
    const { data } = await loanApi.get("/loanCalculator.validateInputs", {
      params: {
        input: JSON.stringify({ amount, term, interestRate }),
      },
    });
    return data;
  },
};

// Usage
const result = await loanCalculatorApi.calculatePayment(100000, 12, 5.5);
```

## Backend Integration

### Using in Other tRPC Procedures
```typescript
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const customRouter = router({
  getRecommendedLoans: publicProcedure
    .input(z.object({
      monthlyIncome: z.number(),
      desiredTerm: z.number(),
    }))
    .query(async ({ input }) => {
      // Example loan amounts based on income
      const loanAmounts = [
        input.monthlyIncome * 2 * 100,    // 2x monthly income
        input.monthlyIncome * 3 * 100,    // 3x monthly income
        input.monthlyIncome * 5 * 100,    // 5x monthly income
      ];

      const recommendations = [];

      for (const amount of loanAmounts) {
        // Calculate payment for each amount
        const monthlyPaymentCents = calculateMonthlyPayment(
          amount,
          input.desiredTerm,
          5.5  // Standard rate
        );

        const affordabilityRatio = (monthlyPaymentCents / 100) / (input.monthlyIncome / 100);

        if (affordabilityRatio <= 0.4) {  // Max 40% of monthly income
          recommendations.push({
            amount: amount / 100,
            monthlyPayment: monthlyPaymentCents / 100,
            affordability: affordabilityRatio,
          });
        }
      }

      return recommendations;
    }),
});
```

### Using in Database Operations
```typescript
import { db } from "./db";
import { calculateMonthlyPayment } from "./loan-calculations";

export async function createLoanOffer(userId: number, input: {
  requestedAmount: number;
  desiredTerm: number;
  interestRate: number;
}) {
  // Validate inputs using type validator
  const monthlyPaymentCents = calculateMonthlyPayment(
    input.requestedAmount,
    input.desiredTerm,
    input.interestRate
  );

  // Create offer in database
  const offer = await db.createLoanOffer({
    userId,
    amount: input.requestedAmount,
    term: input.desiredTerm,
    interestRate: input.interestRate,
    monthlyPayment: monthlyPaymentCents,
    totalInterest: (monthlyPaymentCents * input.desiredTerm) - input.requestedAmount,
  });

  return offer;
}
```

## Error Handling Patterns

### Try-Catch Pattern
```typescript
async function handleLoanCalculation(
  amount: number,
  term: number,
  interestRate: number
) {
  try {
    // Validate inputs first
    const validation = await trpc.loanCalculator.validateInputs.query({
      amount,
      term,
      interestRate,
    });

    if (!validation.success) {
      const fieldErrors = validation.error.details.reduce((acc, detail) => {
        acc[detail.field] = detail.constraints?.[0] || "Invalid";
        return acc;
      }, {} as Record<string, string>);

      return { success: false, errors: fieldErrors };
    }

    // Calculate if valid
    const result = await trpc.loanCalculator.calculatePayment.query({
      amount,
      term,
      interestRate,
    });

    return result;
  } catch (error) {
    console.error("Calculation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
```

### Promise Pattern
```typescript
trpc.loanCalculator.calculatePayment.query(inputs)
  .then(result => {
    if (result.success) {
      displayResults(result.data);
    } else {
      displayErrors(result.error.details);
    }
  })
  .catch(error => {
    console.error("Network error:", error);
  });
```

### React Hook Pattern
```typescript
import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";

export function useLoanCalculator() {
  const [inputs, setInputs] = useState({
    amount: 0,
    term: 0,
    interestRate: 0,
  });
  const [result, setResult] = useState(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculateQuery = trpc.loanCalculator.calculatePayment.useQuery(inputs, {
    enabled: false,
    onSuccess: (data) => {
      if (data.success) {
        setResult(data.data);
        setErrors({});
      } else {
        setErrors(
          data.error.details.reduce((acc, detail) => {
            acc[detail.field] = detail.constraints?.[0] || "Invalid";
            return acc;
          }, {} as Record<string, string>)
        );
        setResult(null);
      }
    },
  });

  const calculate = (newInputs: typeof inputs) => {
    setInputs(newInputs);
    calculateQuery.refetch();
  };

  return {
    calculate,
    result,
    errors,
    isLoading: calculateQuery.isLoading,
  };
}
```

## Testing

### Unit Test Example
```typescript
import { describe, it, expect } from "vitest";
import {
  validateAmount,
  validateTerm,
  validateInterestRate,
} from "@/server/_core/input-type-validator";

describe("Input Type Validator", () => {
  describe("validateAmount", () => {
    it("should accept valid amounts", () => {
      const result = validateAmount(100000);
      expect(result.valid).toBe(true);
      expect(result.value).toBe(100000);
    });

    it("should reject strings", () => {
      const result = validateAmount("100000");
      expect(result.valid).toBe(false);
      expect(result.error.error.code).toBe("INVALID_AMOUNT");
    });

    it("should reject decimals", () => {
      const result = validateAmount(100000.50);
      expect(result.valid).toBe(false);
    });

    it("should reject out-of-range values", () => {
      const tooSmall = validateAmount(500);
      const tooLarge = validateAmount(15000000);
      expect(tooSmall.valid).toBe(false);
      expect(tooLarge.valid).toBe(false);
    });
  });

  describe("validateTerm", () => {
    it("should accept valid terms", () => {
      const result = validateTerm(12);
      expect(result.valid).toBe(true);
    });

    it("should reject decimals", () => {
      const result = validateTerm(12.5);
      expect(result.valid).toBe(false);
    });

    it("should reject out-of-range values", () => {
      const tooSmall = validateTerm(2);
      const tooLarge = validateTerm(120);
      expect(tooSmall.valid).toBe(false);
      expect(tooLarge.valid).toBe(false);
    });
  });

  describe("validateInterestRate", () => {
    it("should accept valid rates", () => {
      const result = validateInterestRate(5.5);
      expect(result.valid).toBe(true);
    });

    it("should accept edge values", () => {
      const min = validateInterestRate(0.1);
      const max = validateInterestRate(35.99);
      expect(min.valid).toBe(true);
      expect(max.valid).toBe(true);
    });

    it("should reject out-of-range values", () => {
      const tooSmall = validateInterestRate(0.05);
      const tooLarge = validateInterestRate(50);
      expect(tooSmall.valid).toBe(false);
      expect(tooLarge.valid).toBe(false);
    });
  });
});
```

## See Also

- `INPUT_TYPE_VALIDATION_GUIDE.md` - Full technical documentation
- `INPUT_TYPE_VALIDATION_QUICK_REFERENCE.md` - Quick reference
- `server/_core/input-type-validator.ts` - Implementation source
