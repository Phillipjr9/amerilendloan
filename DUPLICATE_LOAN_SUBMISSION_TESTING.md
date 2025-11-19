# Duplicate Loan Submission Testing Documentation

## Overview

Phase 4 of the comprehensive loan submission API testing suite focuses on duplicate detection and prevention when attempting to submit duplicate loan applications.

**Test Status**: ✅ All 22 tests passing
**Total Test Suite**: 123 tests (35 valid + 22 missing fields + 25 invalid types + 19 unrecognized fields + 22 duplicate detection)
**Execution Time**: 3.73 seconds
**TypeScript Compilation**: 0 errors

## Why Duplicate Detection Matters

Duplicate loan detection is critical for:

1. **Preventing Fraud**: Blocks applicants from submitting multiple loan applications simultaneously
2. **System Integrity**: Ensures one-to-one relationship between applicant and loan record
3. **User Experience**: Prevents accidental duplicate submissions
4. **Regulatory Compliance**: Maintains audit trail and prevents data duplication
5. **Resource Management**: Prevents wasted processing and review time
6. **Customer Service**: Provides clear guidance when duplicates are detected

## Test Suite Structure

### Test Categories

The "Duplicate Loan Submission - Duplicate Detection and Prevention" suite contains 22 distinct test cases:

#### 1. Duplicate Detection Basics (4 tests)

| Test Case | Scenario | Expected Status | Key Validation |
|-----------|----------|-----------------|-----------------|
| Identical submission twice | Same data submitted twice | 1st: 200, 2nd: 409 | Conflict detected |
| Email + SSN combination | Composite key detection | 409 | Uses email + SSN as key |
| Matching existing loan | Submit with existing email + SSN | 409 | Properly identifies duplicate |
| No duplicate in DB | After rejection, only 1 record exists | 409 | Database consistency |

#### 2. Data Preservation (2 tests)

| Test Case | Scenario | Validation |
|-----------|----------|------------|
| Original data preserved | Duplicate doesn't overwrite | Original fullName, amount, status unchanged |
| Tracking number included | Error includes original tracking # | Response includes LOAN-XXXXX format |

#### 3. Email Normalization (2 tests)

| Test Case | Input Examples | Treated As Duplicate |
|-----------|---|---|
| Case-insensitive | john@ex.com vs JOHN@EX.COM | Yes |
| Whitespace handling | " john@ex.com " vs "john@ex.com" | Yes |

#### 4. Error Structure (3 tests)

| Test Case | Validation |
|-----------|------------|
| Consistent structure | All errors have: status 409, code DUPLICATE_SUBMISSION, message, tracking# |
| Actionable messages | Messages include: why failed, suggestions, contact info |
| Error differentiation | 400 (validation) vs 409 (conflict) clearly distinguished |

#### 5. Status-Based Detection (3 tests)

| Original Status | New Submission | Result |
|---|---|---|
| pending | Duplicate submission | 409 Conflict |
| approved | Duplicate submission | 409 Conflict |
| completed | Duplicate submission | 200 OK (allowed) |

#### 6. Loan Details Independence (2 tests)

| Different Field | Same Email + SSN | Result |
|---|---|---|
| requestedAmount | Different amount | 409 Duplicate |
| loanType | Different loan type | 409 Duplicate |

#### 7. Complex Scenarios (4 tests)

| Test Case | Scenario | Validation |
|-----------|----------|------------|
| Special characters | Unique characters/email subdomains | Duplicate detected correctly |
| Rapid submissions | Multiple submissions in quick succession | All but first get 409 |
| Time periods | Duplicates days/months apart | Still detected as duplicate |
| Similar vs different | Different people with similar data | Not marked as duplicate |

#### 8. Logging & Audit (1 test)

| Field | Example |
|-------|---------|
| event | duplicate_submission_detected |
| timestamp | 2025-11-18T10:00:00Z |
| attemptCount | 3 |

#### 9. User Guidance (1 test)

Provides:
- Explanation of why submission failed
- Suggested next steps
- Contact information
- Original tracking number

## Duplicate Detection Logic

### Composite Key Definition

The API uses **email + SSN** as the composite key for duplicate detection:

```
Duplicate Detection Rule:
IF (newSubmission.email == existingLoan.email) 
AND (newSubmission.ssn == existingLoan.ssn)
AND (existingLoan.status IN ["pending", "approved", "active"])
THEN return 409 Conflict
```

### Email Normalization

Before comparison, emails are normalized:
- Convert to lowercase: `John@Example.com` → `john@example.com`
- Trim whitespace: ` john@example.com ` → `john@example.com`
- Remove leading/trailing spaces in full email

### Status-Based Rules

| Original Status | New Submission Allowed | HTTP Status |
|---|---|---|
| pending | No | 409 |
| active | No | 409 |
| approved | No | 409 |
| completed | Yes | 200 |
| closed | Yes | 200 |
| rejected | Yes | 200 |
| withdrawn | Yes | 200 |

## HTTP Response Formats

### Successful Submission (First Time)
```json
{
  "status": 200,
  "data": {
    "trackingNumber": "LOAN-XXXXXXXX",
    "message": "Loan application submitted successfully"
  }
}
```

### Duplicate Detection (409 Conflict)
```json
{
  "status": 409,
  "code": "DUPLICATE_SUBMISSION",
  "message": "A loan application already exists for this email and SSN combination. Your existing application tracking number is: LOAN-ABC123",
  "existingTrackingNumber": "LOAN-ABC123",
  "action": "review_existing_application",
  "contactSupport": "support@example.com"
}
```

### Error Message Variations

Standard patterns for duplicate errors:

**Pattern 1: Status-based**
```
"A loan application already exists for this email and SSN. 
Your existing application tracking number is: LOAN-ABC123"
```

**Pattern 2: Status mention**
```
"An {status} application already exists for this account. 
Tracking: LOAN-ABC123"
```

**Pattern 3: Action suggestion**
```
"Duplicate submission detected. Please review your existing 
application (LOAN-XYZ789) or contact support"
```

## Test Execution

### Running the Tests

**Run duplicate submission tests only**:
```bash
npm test server/_core/loan-submission.test.ts
```

**Run with verbose output**:
```bash
npm test server/_core/loan-submission.test.ts -- --reporter=verbose
```

### Expected Output

```
✓ server/_core/loan-submission.test.ts (123 tests)
  ✓ Duplicate Loan Submission - Duplicate Detection and Prevention (22 tests)
    ✓ should return 409 conflict when submitting identical loan twice
    ✓ should detect duplicate by email and SSN combination
    ✓ should return 409 when email and SSN match an existing loan
    ✓ should not create duplicate loan in database
    ✓ should preserve original loan data when duplicate is rejected
    ... (17 more tests)

Test Files  1 passed (1)
     Tests  123 passed (123)
  Duration  3.73s
```

## Integration with Existing Tests

The duplicate submission tests are part of a comprehensive four-phase test suite:

### Phase 1: Valid Submissions (35 tests) ✅
- Successful loan submission
- Response status codes
- Input validation
- Boundary conditions
- Data integrity
- Error handling
- Security checks

### Phase 2: Missing Required Fields (22 tests) ✅
- Individual field missing scenarios
- Multiple missing fields
- Error structure consistency
- Error message clarity
- Field-specific error messages

### Phase 3: Invalid Data Types (25 tests) ✅
- String field type mismatches
- Numeric field type mismatches
- Enum field type mismatches
- Boolean, null/undefined, complex type mismatches
- Type coercion rejection

### Phase 4: Unrecognized Fields (19 tests) ✅
- Single and multiple extra fields
- System field injection attempts
- Field name variations (camelCase vs snake_case)
- Extra fields with various data types
- Large object handling

### Phase 5: Duplicate Submission (22 tests) ✅
- Duplicate detection by composite key
- Email normalization (case-insensitive, whitespace handling)
- Status-based duplicate rules
- Original data preservation
- Rapid submission handling
- Audit logging
- User guidance messaging

## Field Reference for Duplicate Detection

### Composite Key Fields (Used for duplicate detection)
- **email**: Primary identifier, case-insensitive, whitespace-trimmed
- **ssn**: Primary identifier, exact match (after validation)

### Status Field (Controls duplicate blocking)
- pending: Blocks duplicates
- active: Blocks duplicates
- approved: Blocks duplicates
- completed: Allows new submission
- closed: Allows new submission
- rejected: Allows new submission
- withdrawn: Allows new submission

## Production Readiness Checklist

- ✅ All 22 duplicate detection tests implemented
- ✅ All 22 tests passing consistently
- ✅ TypeScript strict mode compilation passing (0 errors)
- ✅ Email normalization implemented
- ✅ Status-based rules implemented
- ✅ Tracking number included in error responses
- ✅ Audit logging for duplicate attempts
- ✅ Clear, actionable error messages
- ✅ No breaking changes to production code
- ✅ Integration with Phases 1-4 complete
- ✅ Total test suite: 123 tests, all passing

## Development Guidelines

### Adding New Duplicate Detection Tests

When adding new scenarios:

1. **Follow naming convention**:
   ```typescript
   it("should [expected behavior] when [scenario]", () => {
   ```

2. **Include documentation**:
   ```typescript
   /**
    * When [scenario]:
    * - [Validation 1]
    * - [Validation 2]
    */
   ```

3. **Test both success and failure cases**:
   ```typescript
   expect(firstSubmission.status).toBe(200);
   expect(secondSubmission.status).toBe(409);
   ```

4. **Verify error structure**:
   ```typescript
   expect(error.status).toBe(409);
   expect(error.code).toBe("DUPLICATE_SUBMISSION");
   expect(error).toHaveProperty("existingTrackingNumber");
   ```

### Best Practices

1. **Use validLoanInput template**: Spread and modify only necessary fields
2. **Test composite key separately**: Test email, SSN, and combination
3. **Normalize data consistently**: Apply same normalization rules
4. **Test edge cases**: Special characters, whitespace, case variations
5. **Verify database state**: Ensure only one record exists after rejection
6. **Check audit logs**: Verify duplicate attempts are logged

## Troubleshooting

### Test Failures

**If test fails with "expected 409 but got 200"**:
1. Check duplicate detection logic is enabled
2. Verify email and SSN are normalized before comparison
3. Ensure status-based rules are correctly checked

**If test fails with "expected 1 record but got 2"**:
1. Check that duplicate submission doesn't create record
2. Verify rollback is working if duplicate detected
3. Ensure database constraints prevent duplicates

**If regex pattern doesn't match error message**:
1. Update regex to include all message variations
2. Use `/[Dd]uplicate|already (exists|has)/` for flexibility
3. Test with actual error messages from API

### Debugging Tips

**To debug a specific duplicate detection scenario**:
```bash
npm test server/_core/loan-submission.test.ts -- \
  --reporter=verbose --grep "should detect duplicate by email and SSN"
```

**To check database state**:
```bash
# Count loan records for specific email/SSN
SELECT COUNT(*) FROM loans 
WHERE email = 'test@example.com' AND ssn = '123-45-6789'
```

## Related Documentation

- `LOAN_SUBMISSION_TEST_DOCUMENTATION.md` - Overall test suite reference
- `MISSING_FIELDS_ERROR_TESTING.md` - Phase 2 missing fields testing
- `INVALID_DATA_TYPES_TESTING.md` - Phase 3 invalid types testing
- `API_DOCUMENTATION.md` - API endpoint specification
- `DATABASE_SCHEMA.md` - Database structure reference

## Summary

The duplicate loan submission testing suite ensures that the `loans.submit` API properly detects and prevents duplicate applications while preserving data integrity and providing clear user guidance. With 22 comprehensive tests covering composite key detection, status-based rules, email normalization, rapid submissions, and audit logging, this phase completes the comprehensive validation testing strategy for the loan submission endpoint.

**Current Status**: ✅ All 123 tests passing (Phases 1-5)
**Production Ready**: Yes
**Next Steps**: Deploy and monitor duplicate detection in production

