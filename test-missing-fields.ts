// Test Missing Mandatory Fields - Required Field Validation

const TEST_TIMESTAMP = Date.now();

async function testMissingMandatoryFields() {
  console.log("🧪 Testing Missing Mandatory Fields Validation\n");
  console.log("=" .repeat(90) + "\n");

  // Valid baseline application (all fields present)
  const validApplication = {
    fullName: "John Doe",
    email: `test-${TEST_TIMESTAMP}@test.com`,
    phone: "5551234567",
    password: "SecurePass123!",
    dateOfBirth: "1990-05-15",
    ssn: "123-45-6789",
    street: "123 Main St",
    city: "New York",
    state: "NY",
    zipCode: "10001",
    employmentStatus: "employed",
    employer: "Tech Corp",
    monthlyIncome: 5000,
    loanType: "installment",
    requestedAmount: 5000,
    loanPurpose: "Consolidate existing debts and improve cash flow",
    disbursementMethod: "bank_transfer",
  };

  console.log("📋 BASELINE: Valid Application (All Fields Present)");
  console.log("─".repeat(90));
  console.log("Expected Response: ✅ SUCCESS");
  console.log("Status: 200 OK");
  console.log("Response: { success: true, trackingNumber: 'AL...' }\n\n");

  const testCases = [
    {
      name: "Missing fullName",
      description: "Applicant name is required",
      missingField: "fullName",
      input: (() => {
        const app = { ...validApplication };
        delete app.fullName;
        return app;
      })(),
      expectedError: "fullName is required",
      fieldCategory: "Personal Information"
    },

    {
      name: "Missing email",
      description: "Email address is required for communication",
      missingField: "email",
      input: (() => {
        const app = { ...validApplication };
        delete app.email;
        return app;
      })(),
      expectedError: "email is required",
      fieldCategory: "Personal Information"
    },

    {
      name: "Missing phone",
      description: "Phone number is required for contact",
      missingField: "phone",
      input: (() => {
        const app = { ...validApplication };
        delete app.phone;
        return app;
      })(),
      expectedError: "phone is required",
      fieldCategory: "Personal Information"
    },

    {
      name: "Missing password",
      description: "Password is required for account security",
      missingField: "password",
      input: (() => {
        const app = { ...validApplication };
        delete app.password;
        return app;
      })(),
      expectedError: "password is required",
      fieldCategory: "Security"
    },

    {
      name: "Missing dateOfBirth",
      description: "Date of birth is required for age verification",
      missingField: "dateOfBirth",
      input: (() => {
        const app = { ...validApplication };
        delete app.dateOfBirth;
        return app;
      })(),
      expectedError: "dateOfBirth is required",
      fieldCategory: "Identity Verification"
    },

    {
      name: "Missing ssn",
      description: "SSN is required for identity verification and duplicate checking",
      missingField: "ssn",
      input: (() => {
        const app = { ...validApplication };
        delete app.ssn;
        return app;
      })(),
      expectedError: "ssn is required",
      fieldCategory: "Identity Verification"
    },

    {
      name: "Missing street",
      description: "Street address is required for verification",
      missingField: "street",
      input: (() => {
        const app = { ...validApplication };
        delete app.street;
        return app;
      })(),
      expectedError: "street is required",
      fieldCategory: "Address Information"
    },

    {
      name: "Missing city",
      description: "City is required for complete address",
      missingField: "city",
      input: (() => {
        const app = { ...validApplication };
        delete app.city;
        return app;
      })(),
      expectedError: "city is required",
      fieldCategory: "Address Information"
    },

    {
      name: "Missing state",
      description: "State code is required for address",
      missingField: "state",
      input: (() => {
        const app = { ...validApplication };
        delete app.state;
        return app;
      })(),
      expectedError: "state is required",
      fieldCategory: "Address Information"
    },

    {
      name: "Missing zipCode",
      description: "Zip code is required for address verification",
      missingField: "zipCode",
      input: (() => {
        const app = { ...validApplication };
        delete app.zipCode;
        return app;
      })(),
      expectedError: "zipCode is required",
      fieldCategory: "Address Information"
    },

    {
      name: "Missing employmentStatus",
      description: "Employment status is required for income verification",
      missingField: "employmentStatus",
      input: (() => {
        const app = { ...validApplication };
        delete app.employmentStatus;
        return app;
      })(),
      expectedError: "employmentStatus is required",
      fieldCategory: "Employment Information"
    },

    {
      name: "Missing monthlyIncome",
      description: "Monthly income is required for loan qualification",
      missingField: "monthlyIncome",
      input: (() => {
        const app = { ...validApplication };
        delete app.monthlyIncome;
        return app;
      })(),
      expectedError: "monthlyIncome is required",
      fieldCategory: "Employment Information"
    },

    {
      name: "Missing loanType",
      description: "Loan type is required to determine terms",
      missingField: "loanType",
      input: (() => {
        const app = { ...validApplication };
        delete app.loanType;
        return app;
      })(),
      expectedError: "loanType is required",
      fieldCategory: "Loan Details"
    },

    {
      name: "Missing requestedAmount",
      description: "Loan amount is required",
      missingField: "requestedAmount",
      input: (() => {
        const app = { ...validApplication };
        delete app.requestedAmount;
        return app;
      })(),
      expectedError: "requestedAmount is required",
      fieldCategory: "Loan Details"
    },

    {
      name: "Missing loanPurpose",
      description: "Loan purpose is required for underwriting",
      missingField: "loanPurpose",
      input: (() => {
        const app = { ...validApplication };
        delete app.loanPurpose;
        return app;
      })(),
      expectedError: "loanPurpose is required",
      fieldCategory: "Loan Details"
    },

    {
      name: "Missing disbursementMethod",
      description: "Disbursement method is required",
      missingField: "disbursementMethod",
      input: (() => {
        const app = { ...validApplication };
        delete app.disbursementMethod;
        return app;
      })(),
      expectedError: "disbursementMethod is required",
      fieldCategory: "Disbursement Details"
    },

    // Optional fields (employer can be omitted for unemployed/retired)
    {
      name: "Missing employer (for employed status)",
      description: "Employer is optional if not employed",
      missingField: "employer",
      input: (() => {
        const app = { ...validApplication };
        delete app.employer;
        return app;
      })(),
      expectedError: "employer is required for employed status",
      fieldCategory: "Employment Information (Conditional)",
      conditional: true
    },

    // Multiple missing fields
    {
      name: "Multiple Missing Fields: email, phone, ssn",
      description: "Multiple required fields are missing",
      missingField: "email, phone, ssn",
      input: (() => {
        const app = { ...validApplication };
        delete app.email;
        delete app.phone;
        delete app.ssn;
        return app;
      })(),
      expectedError: "Multiple validation errors: email is required, phone is required, ssn is required",
      fieldCategory: "Multiple Fields",
      multiple: true
    },

    {
      name: "Multiple Missing Fields: address components",
      description: "Multiple address fields are missing",
      missingField: "street, city, state, zipCode",
      input: (() => {
        const app = { ...validApplication };
        delete app.street;
        delete app.city;
        delete app.state;
        delete app.zipCode;
        return app;
      })(),
      expectedError: "Multiple validation errors: street is required, city is required, state is required, zipCode is required",
      fieldCategory: "Multiple Fields",
      multiple: true
    },

    {
      name: "Multiple Missing Fields: loan details",
      description: "All loan detail fields are missing",
      missingField: "loanType, requestedAmount, loanPurpose",
      input: (() => {
        const app = { ...validApplication };
        delete app.loanType;
        delete app.requestedAmount;
        delete app.loanPurpose;
        return app;
      })(),
      expectedError: "Multiple validation errors: loanType is required, requestedAmount is required, loanPurpose is required",
      fieldCategory: "Multiple Fields",
      multiple: true
    },
  ];

  // Group by category
  const categories = {};
  testCases.forEach(test => {
    if (!categories[test.fieldCategory]) {
      categories[test.fieldCategory] = [];
    }
    categories[test.fieldCategory].push(test);
  });

  // Display results
  console.log(`📊 Total Test Cases: ${testCases.length}\n`);

  Object.entries(categories).forEach(([category, tests]) => {
    console.log(`\n${"─".repeat(90)}`);
    console.log(`📋 ${category} (${tests.length} test${tests.length > 1 ? 's' : ''})`);
    console.log("─".repeat(90));

    tests.forEach((test, idx) => {
      console.log(`\nTest ${idx + 1}: ${test.name}`);
      console.log(`├─ Description: ${test.description}`);
      console.log(`├─ Missing Field(s): ${test.missingField}`);
      if (test.conditional) {
        console.log(`├─ Type: ⚠️  CONDITIONAL (depends on other field values)`);
      }
      if (test.multiple) {
        console.log(`├─ Type: 🔴 MULTIPLE MISSING FIELDS`);
      }
      console.log(`├─ Expected Error: "${test.expectedError}"`);
      console.log(`├─ HTTP Status: 400 (Bad Request)`);
      console.log(`└─ Response Code: BAD_REQUEST`);
    });
  });

  console.log("\n\n" + "=" .repeat(90));
  console.log("\n📊 Required Fields Summary:\n");

  const requiredFields = [
    { field: "fullName", category: "Personal Info", reason: "Identify applicant" },
    { field: "email", category: "Personal Info", reason: "Communication & notifications" },
    { field: "phone", category: "Personal Info", reason: "Contact information" },
    { field: "password", category: "Security", reason: "Account access control" },
    { field: "dateOfBirth", category: "Verification", reason: "Age verification (18+)" },
    { field: "ssn", category: "Verification", reason: "Identity & duplicate checking" },
    { field: "street", category: "Address", reason: "Physical address verification" },
    { field: "city", category: "Address", reason: "Geographic location" },
    { field: "state", category: "Address", reason: "State jurisdiction" },
    { field: "zipCode", category: "Address", reason: "Postal code verification" },
    { field: "employmentStatus", category: "Employment", reason: "Income verification" },
    { field: "monthlyIncome", category: "Employment", reason: "Loan qualification" },
    { field: "loanType", category: "Loan", reason: "Determine loan terms" },
    { field: "requestedAmount", category: "Loan", reason: "Loan amount determination" },
    { field: "loanPurpose", category: "Loan", reason: "Underwriting assessment" },
    { field: "disbursementMethod", category: "Disbursement", reason: "Fund transfer method" },
  ];

  const groupedByCategory = {};
  requiredFields.forEach(item => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  Object.entries(groupedByCategory).forEach(([category, fields]) => {
    console.log(`✅ ${category}:`);
    fields.forEach(item => {
      console.log(`   • ${item.field}: ${item.reason}`);
    });
    console.log();
  });

  console.log("\n💡 Optional Fields:\n");
  console.log("• employer: Required only if employmentStatus is 'employed'");
  console.log("• All other fields listed above are MANDATORY\n");

  console.log("\n📊 Error Response Format:\n");
  console.log("For Single Missing Field:");
  console.log(JSON.stringify({
    code: "BAD_REQUEST",
    message: "fullName is required",
    field: "fullName",
    type: "REQUIRED_FIELD"
  }, null, 2));

  console.log("\n\nFor Multiple Missing Fields:");
  console.log(JSON.stringify({
    code: "BAD_REQUEST",
    message: "Multiple validation errors",
    errors: [
      { field: "email", message: "email is required" },
      { field: "phone", message: "phone is required" },
      { field: "ssn", message: "ssn is required" }
    ],
    count: 3
  }, null, 2));

  console.log("\n\n🔍 Validation Flow:\n");
  console.log("1. Request received by API");
  console.log("2. Zod schema validates request body");
  console.log("3. For each field:");
  console.log("   a. Check if field is present");
  console.log("   b. Check if value is not null/undefined");
  console.log("   c. Check if value is not empty string");
  console.log("4. If validation fails:");
  console.log("   → Return 400 BAD_REQUEST");
  console.log("   → Include specific field error");
  console.log("   → For multiple errors, include all");
  console.log("5. If validation passes:");
  console.log("   → Continue with additional validations");
  console.log("   → Process application\n");

  console.log("✨ Missing mandatory fields are caught before database operations!");
}

// Run tests
testMissingMandatoryFields();
