# Loan Application Form - Remaining Sections to Add

## Instructions
The following three sections need to be added to `ApplyLoan.tsx`:

1. **Step 4: Banking Information** (insert BEFORE current "Step 4: Loan Details")
2. **Step 5: Enhanced Loan Details** (REPLACE current "Step 4: Loan Details", change currentStep from 4 to 5)
3. **Step 6: References & Emergency Contact** (add AFTER the enhanced Loan Details section)

---

## Step 4: Banking Information
**Location: Insert before line 1111 (current "Step 4: Loan Details")**

```tsx
{/* Step 4: Banking Information */}
{currentStep === 4 && (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
        Banking Information
      </h2>
      <p className="text-gray-600">
        We need your bank account information for loan disbursement and repayment.
      </p>
    </div>

    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="bankName">Bank Name *</Label>
        <Input
          id="bankName"
          value={formData.bankName}
          onChange={(e) => updateFormData("bankName", e.target.value)}
          placeholder="e.g., Chase, Bank of America, Wells Fargo"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountType">Account Type *</Label>
        <Select
          value={formData.accountType}
          onValueChange={(value) => updateFormData("accountType", value)}
          required
        >
          <SelectTrigger id="accountType">
            <SelectValue placeholder="Select account type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="checking">Checking Account</SelectItem>
            <SelectItem value="savings">Savings Account</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="routingNumber">Routing Number *</Label>
          <Input
            id="routingNumber"
            value={formData.routingNumber}
            onChange={(e) => updateFormData("routingNumber", e.target.value)}
            placeholder="9-digit routing number"
            maxLength={9}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="accountNumber">Account Number *</Label>
          <Input
            id="accountNumber"
            type="password"
            value={formData.accountNumber}
            onChange={(e) => updateFormData("accountNumber", e.target.value)}
            placeholder="Account number"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountHolderName">Account Holder Name *</Label>
        <Input
          id="accountHolderName"
          value={formData.accountHolderName}
          onChange={(e) => updateFormData("accountHolderName", e.target.value)}
          placeholder="Name on account"
          required
        />
        <p className="text-xs text-gray-500">
          Must match the name on your bank account
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="accountOpenDuration">How Long Has This Account Been Open? *</Label>
        <Select
          value={formData.accountOpenDuration}
          onValueChange={(value) => updateFormData("accountOpenDuration", value)}
          required
        >
          <SelectTrigger id="accountOpenDuration">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="less_than_6_months">Less than 6 months</SelectItem>
            <SelectItem value="6_to_12_months">6 to 12 months</SelectItem>
            <SelectItem value="1_to_3_years">1 to 3 years</SelectItem>
            <SelectItem value="3_plus_years">3+ years</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <div className="text-sm text-gray-700">
            <p className="font-semibold text-[#0033A0] mb-1">Your information is secure</p>
            <p>We use bank-level encryption to protect your financial information. This account will be used for loan disbursement and automatic repayment.</p>
          </div>
        </div>
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <Button
        type="button"
        onClick={prevStep}
        variant="outline"
        className="border-[#0033A0] text-[#0033A0]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={saveForLater}
          className="border-gray-300 text-gray-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Save for Later
        </Button>
        <Button
          type="button"
          onClick={nextStep}
          className="bg-[#FFA500] hover:bg-[#FF8C00] text-white px-8"
        >
          Continue
        </Button>
      </div>
    </div>
  </div>
)}
```

---

## Step 5: Enhanced Loan Details  
**Action: Change current `{currentStep === 4 &&` to `{currentStep === 5 &&` and add new fields**

Add these new fields after `requestedAmount`:

```tsx
<div className="space-y-2">
  <Label htmlFor="desiredTerm">Desired Repayment Term *</Label>
  <Select
    value={formData.desiredTerm}
    onValueChange={(value) => updateFormData("desiredTerm", value)}
    required
  >
    <SelectTrigger id="desiredTerm">
      <SelectValue placeholder="Select loan term" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="6">6 months</SelectItem>
      <SelectItem value="12">12 months</SelectItem>
      <SelectItem value="18">18 months</SelectItem>
      <SelectItem value="24">24 months</SelectItem>
      <SelectItem value="36">36 months</SelectItem>
      <SelectItem value="48">48 months</SelectItem>
      <SelectItem value="60">60 months</SelectItem>
    </SelectContent>
  </Select>
</div>
```

Add before `loanPurpose`:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div className="space-y-2">
    <Label htmlFor="monthlyDebts">Total Monthly Debt Payments</Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        $
      </span>
      <Input
        id="monthlyDebts"
        type="number"
        step="0.01"
        value={formData.monthlyDebts}
        onChange={(e) => updateFormData("monthlyDebts", e.target.value)}
        placeholder="500.00"
        className="pl-7"
      />
    </div>
    <p className="text-xs text-gray-500">
      Include credit cards, car loans, etc.
    </p>
  </div>
  <div className="space-y-2">
    <Label htmlFor="outstandingLoans">Outstanding Loan Balance</Label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
        $
      </span>
      <Input
        id="outstandingLoans"
        type="number"
        step="0.01"
        value={formData.outstandingLoans}
        onChange={(e) => updateFormData("outstandingLoans", e.target.value)}
        placeholder="0.00"
        className="pl-7"
      />
    </div>
    <p className="text-xs text-gray-500">
      Total of all existing loans
    </p>
  </div>
</div>

<div className="space-y-2">
  <Label htmlFor="creditScore">Estimated Credit Score Range (Optional)</Label>
  <Select
    value={formData.creditScore}
    onValueChange={(value) => updateFormData("creditScore", value)}
  >
    <SelectTrigger id="creditScore">
      <SelectValue placeholder="Select range if known" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="below_580">Below 580 (Poor)</SelectItem>
      <SelectItem value="580_669">580-669 (Fair)</SelectItem>
      <SelectItem value="670_739">670-739 (Good)</SelectItem>
      <SelectItem value="740_799">740-799 (Very Good)</SelectItem>
      <SelectItem value="800_plus">800+ (Excellent)</SelectItem>
      <SelectItem value="unknown">Don't Know</SelectItem>
    </SelectContent>
  </Select>
</div>
```

---

## Step 6: References & Emergency Contact
**Location: Add AFTER the enhanced Step 5 (Loan Details) section, BEFORE the terms/conditions**

```tsx
{/* Step 6: References & Emergency Contact */}
{currentStep === 6 && (
  <div className="space-y-6">
    <div>
      <h2 className="text-2xl font-bold text-[#0033A0] mb-2">
        References & Emergency Contact
      </h2>
      <p className="text-gray-600">
        Please provide contact information for two references and an emergency contact.
      </p>
    </div>

    <div className="space-y-6">
      {/* Reference 1 */}
      <div className="border-b pb-4">
        <h3 className="font-semibold text-[#0033A0] mb-4">Reference 1 *</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference1Name">Full Name *</Label>
            <Input
              id="reference1Name"
              value={formData.reference1Name}
              onChange={(e) => updateFormData("reference1Name", e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference1Phone">Phone Number *</Label>
              <Input
                id="reference1Phone"
                type="tel"
                value={formData.reference1Phone}
                onChange={(e) => updateFormData("reference1Phone", e.target.value)}
                placeholder="(555) 123-4567"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference1Relationship">Relationship *</Label>
              <Input
                id="reference1Relationship"
                value={formData.reference1Relationship}
                onChange={(e) => updateFormData("reference1Relationship", e.target.value)}
                placeholder="Friend, Colleague, etc."
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Reference 2 */}
      <div className="border-b pb-4">
        <h3 className="font-semibold text-[#0033A0] mb-4">Reference 2 *</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reference2Name">Full Name *</Label>
            <Input
              id="reference2Name"
              value={formData.reference2Name}
              onChange={(e) => updateFormData("reference2Name", e.target.value)}
              placeholder="Jane Smith"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference2Phone">Phone Number *</Label>
              <Input
                id="reference2Phone"
                type="tel"
                value={formData.reference2Phone}
                onChange={(e) => updateFormData("reference2Phone", e.target.value)}
                placeholder="(555) 987-6543"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reference2Relationship">Relationship *</Label>
              <Input
                id="reference2Relationship"
                value={formData.reference2Relationship}
                onChange={(e) => updateFormData("reference2Relationship", e.target.value)}
                placeholder="Family, Neighbor, etc."
                required
              />
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="font-semibold text-[#0033A0] mb-4">Emergency Contact *</h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="emergencyContactName">Full Name *</Label>
            <Input
              id="emergencyContactName"
              value={formData.emergencyContactName}
              onChange={(e) => updateFormData("emergencyContactName", e.target.value)}
              placeholder="Emergency Contact Name"
              required
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="emergencyContactPhone">Phone Number *</Label>
              <Input
                id="emergencyContactPhone"
                type="tel"
                value={formData.emergencyContactPhone}
                onChange={(e) => updateFormData("emergencyContactPhone", e.target.value)}
                placeholder="(555) 111-2222"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContactRelationship">Relationship *</Label>
              <Input
                id="emergencyContactRelationship"
                value={formData.emergencyContactRelationship}
                onChange={(e) => updateFormData("emergencyContactRelationship", e.target.value)}
                placeholder="Spouse, Parent, etc."
                required
              />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <h4 className="font-semibold text-[#0033A0] mb-2">Before You Submit</h4>
      <ul className="space-y-1 text-sm text-gray-700">
        <li className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>Review all information for accuracy</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>You'll receive a decision within 24 hours</span>
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
          <span>3.5% processing fee applies upon approval (paid via card or crypto before disbursement)</span>
        </li>
      </ul>
    </div>

    {/* Terms and Conditions - MOVE FROM CURRENT STEP 4 TO HERE */}
    <div className="space-y-4 border-t pt-4">
      <h4 className="font-semibold text-[#0033A0]">Required Agreements</h4>
      
      <div className="flex items-start space-x-3">
        <Checkbox
          id="termsAccepted"
          checked={formData.termsAccepted}
          onCheckedChange={(checked) => updateFormData("termsAccepted", checked as boolean)}
          required
        />
        <label
          htmlFor="termsAccepted"
          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
        >
          I have read and agree to the{" "}
          <a
            href="/legal/terms-of-service.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0033A0] underline hover:text-[#FF8C00]"
          >
            Terms of Service
          </a>{" "}
          and{" "}
          <a
            href="/legal/loan-agreement.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0033A0] underline hover:text-[#FF8C00]"
          >
            Loan Agreement
          </a>
          . *
        </label>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="privacyAccepted"
          checked={formData.privacyAccepted}
          onCheckedChange={(checked) => updateFormData("privacyAccepted", checked as boolean)}
          required
        />
        <label
          htmlFor="privacyAccepted"
          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
        >
          I acknowledge that I have reviewed the{" "}
          <a
            href="/legal/privacy-policy.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0033A0] underline hover:text-[#FF8C00]"
          >
            Privacy Policy
          </a>
          . *
        </label>
      </div>

      <div className="flex items-start space-x-3">
        <Checkbox
          id="esignAccepted"
          checked={formData.esignAccepted}
          onCheckedChange={(checked) => updateFormData("esignAccepted", checked as boolean)}
          required
        />
        <label
          htmlFor="esignAccepted"
          className="text-sm text-gray-700 leading-relaxed cursor-pointer"
        >
          I consent to conduct this transaction electronically and agree to the{" "}
          <a
            href="/legal/esign-consent.md"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0033A0] underline hover:text-[#FF8C00]"
          >
            E-Sign Consent Agreement
          </a>
          . *
        </label>
      </div>
    </div>

    <div className="flex justify-between pt-4">
      <Button
        type="button"
        onClick={prevStep}
        variant="outline"
        className="border-[#0033A0] text-[#0033A0]"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back
      </Button>
      <Button
        type="submit"
        disabled={submitMutation.isPending}
        className="bg-[#0033A0] hover:bg-[#002080] text-white px-8"
      >
        {submitMutation.isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Submitting...
          </>
        ) : (
          "Submit Application"
        )}
      </Button>
    </div>
  </div>
)}
```

---

## Summary of Changes

### ✅ Already Complete:
- Form state includes all 50+ new fields
- Progress bar updated to 6 steps
- Step 1: ID verification, housing, military status
- Step 2: Monthly rent/mortgage
- Step 3: Employer details, pay frequency, additional income

### 📋 Manual Integration Needed:
1. Insert Step 4 (Banking) code before current Step 4
2. Change current Step 4's `currentStep === 4` to `currentStep === 5`
3. Add desired term, monthly debts, outstanding loans, credit score to Step 5
4. Add Step 6 (References) code after Step 5
5. Move terms/conditions checkboxes from current Step 4 to Step 6
6. Change Submit button from Step 4 to Step 6

All code is ready to copy-paste from this document into `ApplyLoan.tsx`.
