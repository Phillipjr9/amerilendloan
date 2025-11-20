# Check Disbursement Tracking - API Reference

**Endpoint:** `disbursements.adminUpdateTracking`  
**Method:** Mutation (POST)  
**Access:** Admin only  
**Status:** ✅ Production Ready

---

## Endpoint Details

### Request

```typescript
disbursements.adminUpdateTracking({
  disbursementId: number,
  trackingNumber: string,
  trackingCompany: "USPS" | "UPS" | "FedEx" | "DHL" | "Other"
})
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `disbursementId` | number | Yes | ID of the disbursement to update |
| `trackingNumber` | string | Yes | Tracking number from carrier (non-empty) |
| `trackingCompany` | enum | Yes | Shipping company (USPS, UPS, FedEx, DHL, Other) |

### Response

**Success (200):**
```typescript
{
  success: true,
  message: "Tracking information updated: USPS #9400111899223456789"
}
```

**Error Responses:**
```typescript
// Not found
{ code: "NOT_FOUND", message: "Disbursement not found" }

// Forbidden (not admin)
{ code: "FORBIDDEN" }

// Validation error
{ code: "BAD_REQUEST", message: "[validation error details]" }
```

---

## Usage Examples

### React/TypeScript (tRPC)

```typescript
import { trpc } from "@/lib/trpc";

function UpdateTrackingForm({ disbursementId }: { disbursementId: number }) {
  const { mutate: updateTracking, isLoading, error } = 
    trpc.disbursements.adminUpdateTracking.useMutation();

  const handleSubmit = (data: any) => {
    updateTracking(
      {
        disbursementId,
        trackingNumber: data.trackingNumber,
        trackingCompany: data.trackingCompany,
      },
      {
        onSuccess: (result) => {
          console.log(result.message);
          toast.success("Tracking updated!");
          // Refresh disbursement data
        },
        onError: (error) => {
          console.error(error);
          toast.error(error.message);
        },
      }
    );
  };

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      handleSubmit({
        trackingNumber: e.currentTarget.trackingNumber.value,
        trackingCompany: e.currentTarget.trackingCompany.value,
      });
    }}>
      <input
        name="trackingNumber"
        type="text"
        placeholder="Enter tracking number"
        required
      />
      
      <select name="trackingCompany" required>
        <option value="">Select carrier</option>
        <option value="USPS">USPS</option>
        <option value="UPS">UPS</option>
        <option value="FedEx">FedEx</option>
        <option value="DHL">DHL</option>
        <option value="Other">Other</option>
      </select>
      
      <button type="submit" disabled={isLoading}>
        {isLoading ? "Updating..." : "Update Tracking"}
      </button>
      
      {error && <p className="error">{error.message}</p>}
    </form>
  );
}
```

### Direct API Call (cURL)

```bash
# Set variables
DISBURSEMENT_ID=42
TRACKING_NUMBER="9400111899223456789"
TRACKING_COMPANY="USPS"
JWT_TOKEN="your_jwt_token_here"

# Make request
curl -X POST http://localhost:3000/api/trpc/disbursements.adminUpdateTracking \
  -H "Content-Type: application/json" \
  -H "Cookie: app_session_id=$JWT_TOKEN" \
  -d "{
    \"json\": {
      \"disbursementId\": $DISBURSEMENT_ID,
      \"trackingNumber\": \"$TRACKING_NUMBER\",
      \"trackingCompany\": \"$TRACKING_COMPANY\"
    }
  }"
```

### Node.js/Fetch

```typescript
async function updateDisbursementTracking(
  disbursementId: number,
  trackingNumber: string,
  trackingCompany: string
) {
  const response = await fetch(
    `${process.env.VITE_API_URL || "http://localhost:3000"}/api/trpc/disbursements.adminUpdateTracking`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        json: {
          disbursementId,
          trackingNumber,
          trackingCompany,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to update tracking");
  }

  return response.json();
}

// Usage
try {
  const result = await updateDisbursementTracking(
    42,
    "9400111899223456789",
    "USPS"
  );
  console.log(result.message); // "Tracking information updated: USPS #..."
} catch (error) {
  console.error(error.message);
}
```

### Python

```python
import requests
import json

def update_disbursement_tracking(
    disbursement_id: int,
    tracking_number: str,
    tracking_company: str,
    jwt_token: str,
    api_url: str = "http://localhost:3000"
):
    url = f"{api_url}/api/trpc/disbursements.adminUpdateTracking"
    
    headers = {
        "Content-Type": "application/json",
        "Cookie": f"app_session_id={jwt_token}"
    }
    
    payload = {
        "json": {
            "disbursementId": disbursement_id,
            "trackingNumber": tracking_number,
            "trackingCompany": tracking_company
        }
    }
    
    response = requests.post(url, json=payload, headers=headers)
    response.raise_for_status()
    
    return response.json()

# Usage
result = update_disbursement_tracking(
    disbursement_id=42,
    tracking_number="9400111899223456789",
    tracking_company="USPS",
    jwt_token="your_jwt_token"
)
print(result["message"])  # "Tracking information updated: USPS #..."
```

---

## Tracking Company Reference

### USPS (United States Postal Service)

**Best for:** Standard domestic mail, flat-rate boxes  
**Tracking format:** 13-22 characters (e.g., `9400111899223456789`)  
**Website:** https://tools.usps.com/go/TrackConfirmAction

**Example:**
```
Disbursement ID: 42
Tracking Company: USPS
Tracking Number: 9400111899223456789
```

### UPS (United Parcel Service)

**Best for:** Packages, next-day services  
**Tracking format:** Starts with 1Z, 18-20 characters total (e.g., `1Z999AA10123456784`)  
**Website:** https://www.ups.com/track

**Example:**
```
Disbursement ID: 45
Tracking Company: UPS
Tracking Number: 1Z999AA10123456784
```

### FedEx (Federal Express)

**Best for:** Express delivery, international  
**Tracking format:** Usually 12 digits (e.g., `794625172838`)  
**Website:** https://tracking.fedex.com

**Example:**
```
Disbursement ID: 48
Tracking Company: FedEx
Tracking Number: 794625172838
```

### DHL (DHL Express)

**Best for:** International shipping  
**Tracking format:** Usually 10-11 digits (e.g., `1234567890`)  
**Website:** https://tracking.dhl.com

**Example:**
```
Disbursement ID: 51
Tracking Company: DHL
Tracking Number: 1234567890
```

### Other

**Use when:** Carrier is not in the list above  
**Best for:** Regional carriers, international couriers  
**Note:** Admin should provide tracking URL separately or in admin notes

**Example:**
```
Disbursement ID: 54
Tracking Company: Other
Tracking Number: CUSTOM123456
Admin Notes: Shipped via Regional Express, track at example.com
```

---

## Error Handling

### Common Errors

#### 1. Disbursement Not Found
**Cause:** Invalid disbursement ID  
**Status:** 404 NOT_FOUND  
**Solution:** Verify the disbursement ID is correct

```typescript
try {
  await updateTracking({ disbursementId: 99999, ... });
} catch (error) {
  if (error.data?.code === "NOT_FOUND") {
    console.log("Disbursement does not exist");
  }
}
```

#### 2. Access Denied (Not Admin)
**Cause:** User is not an admin  
**Status:** 403 FORBIDDEN  
**Solution:** Ensure user has admin role

```typescript
try {
  await updateTracking({ disbursementId: 42, ... });
} catch (error) {
  if (error.data?.code === "FORBIDDEN") {
    console.log("Only admins can update tracking");
  }
}
```

#### 3. Validation Error - Empty Tracking Number
**Cause:** Tracking number is empty string  
**Status:** 400 BAD_REQUEST  
**Solution:** Provide a non-empty tracking number

```typescript
// ❌ WRONG - Empty string
updateTracking({ 
  trackingNumber: "",  // Will fail
  trackingCompany: "USPS"
});

// ✅ CORRECT
updateTracking({ 
  trackingNumber: "9400111899223456789",
  trackingCompany: "USPS"
});
```

#### 4. Validation Error - Invalid Tracking Company
**Cause:** Tracking company not in enum  
**Status:** 400 BAD_REQUEST  
**Solution:** Use one of: USPS, UPS, FedEx, DHL, Other

```typescript
// ❌ WRONG - Not in enum
updateTracking({ 
  trackingCompany: "FedUp"  // Will fail
});

// ✅ CORRECT
updateTracking({ 
  trackingCompany: "FedEx"
});
```

---

## Database Schema

The tracking information is stored in the `disbursements` table:

```sql
-- Columns added to disbursements table
trackingNumber VARCHAR(255)  -- Nullable, can be NULL initially
trackingCompany VARCHAR(50)  -- Nullable, can be NULL initially

-- Example data
id: 42
trackingNumber: "9400111899223456789"
trackingCompany: "USPS"
updatedAt: 2024-11-20 14:30:00
```

---

## Data Flow

```
Admin Dashboard
    ↓
    [Click: Add Tracking]
    ↓
    [Form with Company Dropdown + Tracking Number]
    ↓
    [Submit]
    ↓
    API Call: disbursements.adminUpdateTracking
    ↓
    Database: Update disbursements table
    ↓
    Response: Success message
    ↓
    [Display: Tracking information saved]
    ↓
    Optional: Send email to user with tracking link
```

---

## Integration Checklist

- [ ] Import tRPC client in component
- [ ] Add form for tracking input
- [ ] Add carrier dropdown with enum values
- [ ] Handle loading state
- [ ] Handle error cases
- [ ] Display success message
- [ ] Refresh disbursement data after update
- [ ] Optional: Send email with tracking link
- [ ] Optional: Open tracking URL on click

---

## Performance Considerations

- ✅ Single database update query
- ✅ No N+1 queries
- ✅ Minimal payload (3 fields only)
- ✅ No cascading updates needed
- ✅ Fast response time (<100ms)

---

## Security Checklist

- ✅ Admin-only access enforced
- ✅ Input validation on all fields
- ✅ No SQL injection possible (parameterized queries)
- ✅ No sensitive data exposure
- ✅ Proper error messages (no system details)
- ✅ Rate limiting (via tRPC middleware)

---

## Related Endpoints

- `disbursements.adminInitiate` - Create new disbursement
- `disbursements.getByLoanId` - Get disbursement details
- `loanApplications.adminApprove` - Approve loan (prerequisite)

---

## Changelog

### Version 1.0 (Initial Release)
- ✅ Add tracking number support
- ✅ Support for USPS, UPS, FedEx, DHL, Other
- ✅ Admin-only access
- ✅ Full validation and error handling

---

**API Version:** 1.0  
**Last Updated:** 2024-11-20  
**Status:** ✅ Production Ready
