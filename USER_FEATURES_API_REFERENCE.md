# User Features API Quick Reference

## Overview
All procedures are type-safe and return `{ success: boolean, ... }` by default. All require authentication via `protectedProcedure`.

## Devices Router
**Location:** `userFeatures.devices`

### Create Device
```typescript
// POST /api/trpc/userFeatures.devices.create
create({
  deviceName: string,
  userAgent: string,
  ipAddress: string,
})
// Returns: { success: true }
```

### List Devices
```typescript
// GET /api/trpc/userFeatures.devices.list
list()
// Returns: Device[]
```

### Remove Device
```typescript
// DELETE /api/trpc/userFeatures.devices.remove
remove({ deviceId: number })
// Returns: { success: true }
```

---

## Preferences Router
**Location:** `userFeatures.preferences`

### Get Preferences
```typescript
// GET /api/trpc/userFeatures.preferences.get
get()
// Returns: UserPreferences
```

### Update Preferences
```typescript
// PATCH /api/trpc/userFeatures.preferences.update
update({
  communicationPreferences?: Record<string, any>,
  notificationSettings?: Record<string, any>,
  marketingOptIn?: boolean,
})
// Returns: { success: true }
```

---

## Bank Accounts Router
**Location:** `userFeatures.bankAccounts`

### Add Bank Account
```typescript
// POST /api/trpc/userFeatures.bankAccounts.add
add({
  accountHolderName: string,
  bankName: string,
  accountNumber: string,
  routingNumber: string,
  accountType: "checking" | "savings",
})
// Returns: { success: true }
```

### List Bank Accounts
```typescript
// GET /api/trpc/userFeatures.bankAccounts.list
list()
// Returns: BankAccount[]
```

### Remove Bank Account
```typescript
// DELETE /api/trpc/userFeatures.bankAccounts.remove
remove({ accountId: number })
// Returns: { success: true }
```

---

## KYC Router
**Location:** `userFeatures.kyc`

### Get KYC Status
```typescript
// GET /api/trpc/userFeatures.kyc.getStatus
getStatus()
// Returns: KYCVerification
```

### Upload Document
```typescript
// POST /api/trpc/userFeatures.kyc.uploadDocument
uploadDocument({
  documentType: "drivers_license" | "passport" | "ssn" | "income_verification",
  documentUrl: string,
  expiryDate?: string,
})
// Returns: { success: true }
```

### Get Documents
```typescript
// GET /api/trpc/userFeatures.kyc.getDocuments
getDocuments()
// Returns: UploadedDocument[]
```

---

## Loan Offers Router
**Location:** `userFeatures.loanOffers`

### List Loan Offers
```typescript
// GET /api/trpc/userFeatures.loanOffers.list
list()
// Returns: LoanOffer[]
```

### Accept Loan Offer
```typescript
// POST /api/trpc/userFeatures.loanOffers.accept
accept({ offerId: number })
// Returns: { success: true }
```

---

## Payments Router
**Location:** `userFeatures.payments`

### Get Payment Schedule
```typescript
// GET /api/trpc/userFeatures.payments.get
get({ loanApplicationId: number })
// Returns: PaymentSchedule[]
```

### Get Autopay Settings
```typescript
// GET /api/trpc/userFeatures.payments.autopaySettings.get
autopaySettings.get({ loanApplicationId: number })
// Returns: AutopaySettings | null
```

### Update Autopay Settings
```typescript
// PATCH /api/trpc/userFeatures.payments.autopaySettings.update
autopaySettings.update({
  loanApplicationId: number,
  isEnabled: boolean,
  paymentDay?: number,
  bankAccountId?: number,
})
// Returns: { success: true }
```

---

## Notifications Router
**Location:** `userFeatures.notifications`

### List Notifications
```typescript
// GET /api/trpc/userFeatures.notifications.list
list({ limit?: number })
// Returns: UserNotification[]
```

### Mark as Read
```typescript
// POST /api/trpc/userFeatures.notifications.markAsRead
markAsRead({ notificationId: number })
// Returns: { success: true }
```

---

## Support Router
**Location:** `userFeatures.support`

### Create Ticket
```typescript
// POST /api/trpc/userFeatures.support.createTicket
createTicket({
  subject: string,
  description: string,
  category: "billing" | "technical" | "account" | "loan" | "other",
})
// Returns: { success: true, result: any }
```

### List Tickets
```typescript
// GET /api/trpc/userFeatures.support.listTickets
listTickets()
// Returns: SupportTicket[]
```

### Get Ticket Messages
```typescript
// GET /api/trpc/userFeatures.support.getMessages
getMessages({ ticketId: number })
// Returns: TicketMessage[]
```

### Add Message
```typescript
// POST /api/trpc/userFeatures.support.addMessage
addMessage({
  ticketId: number,
  message: string,
})
// Returns: { success: true }
```

---

## Referrals Router
**Location:** `userFeatures.referrals`

### List Referrals
```typescript
// GET /api/trpc/userFeatures.referrals.list
list()
// Returns: ReferralProgram[]
```

### Get Rewards Balance
```typescript
// GET /api/trpc/userFeatures.referrals.getRewardsBalance
getRewardsBalance()
// Returns: UserRewardsBalance
```

---

## Usage Examples

### React Query (Recommended)
```typescript
import { useQuery, useMutation } from '@tanstack/react-query';
import { trpc } from '@/lib/trpc';

// Get user devices
const { data: devices } = useQuery({
  queryKey: ['userFeatures.devices'],
  queryFn: () => trpc.userFeatures.devices.list.query(),
});

// Add new device
const { mutate: addDevice } = useMutation({
  mutationFn: (data) => trpc.userFeatures.devices.create.mutate(data),
});

// Usage
addDevice({
  deviceName: 'My Phone',
  userAgent: navigator.userAgent,
  ipAddress: '192.168.1.1',
});
```

### Direct TRPC
```typescript
// Query
const devices = await trpc.userFeatures.devices.list.query();

// Mutation
const result = await trpc.userFeatures.devices.create.mutate({
  deviceName: 'Laptop',
  userAgent: navigator.userAgent,
  ipAddress: '192.168.1.1',
});
```

---

## Error Handling

All procedures return errors in the format:
```typescript
// On error
throw new TRPCError({
  code: "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "BAD_REQUEST" | "INTERNAL_SERVER_ERROR",
  message: "Human-readable error message"
});
```

### Example Error Handling
```typescript
try {
  const result = await trpc.userFeatures.devices.create.mutate(data);
} catch (error) {
  if (error.data?.code === 'BAD_REQUEST') {
    console.error('Invalid input:', error.message);
  } else if (error.data?.code === 'UNAUTHORIZED') {
    // Redirect to login
  }
}
```

---

## Common Patterns

### Fetch User Profile Info
```typescript
// Get all user data in one place
const [prefs, devices, bankAccounts, kyc] = await Promise.all([
  trpc.userFeatures.preferences.get.query(),
  trpc.userFeatures.devices.list.query(),
  trpc.userFeatures.bankAccounts.list.query(),
  trpc.userFeatures.kyc.getStatus.query(),
]);
```

### Update Multiple Settings
```typescript
// Use batch requests
const tasks = [
  trpc.userFeatures.preferences.update.mutate({
    marketingOptIn: true,
  }),
  trpc.userFeatures.devices.create.mutate({
    deviceName: 'New Device',
    userAgent: navigator.userAgent,
    ipAddress: '192.168.1.1',
  }),
];

await Promise.all(tasks);
```

### Real-time Notifications
```typescript
// Subscribe to notification updates
const pollNotifications = setInterval(async () => {
  const notifications = await trpc.userFeatures.notifications.list.query({
    limit: 10,
  });
  
  // Check for unread
  const unreadCount = notifications.filter(n => !n.isRead).length;
  updateBadge(unreadCount);
}, 5000);
```

---

## Response Types

### Device
```typescript
interface Device {
  id: number;
  userId: number;
  deviceName: string;
  userAgent: string;
  ipAddress: string;
  isTrusted: boolean;
  lastAccessedAt: Date;
}
```

### BankAccount
```typescript
interface BankAccount {
  id: number;
  userId: number;
  accountHolderName: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  accountType: 'checking' | 'savings';
  isVerified: boolean;
  isPrimary: boolean;
  createdAt: Date;
}
```

### PaymentSchedule
```typescript
interface PaymentSchedule {
  id: number;
  loanApplicationId: number;
  installmentNumber: number;
  dueDate: Date;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paidAt?: Date;
  paidAmount?: number;
}
```

### SupportTicket
```typescript
interface SupportTicket {
  id: number;
  userId: number;
  subject: string;
  description: string;
  category: 'billing' | 'technical' | 'account' | 'loan' | 'other';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  assignedTo?: number;
  priority?: string;
  createdAt: Date;
}
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 401 | Unauthorized (not authenticated) |
| 403 | Forbidden (not authorized) |
| 404 | Not Found |
| 500 | Internal Server Error |

---

## Environment Requirements

- **Node.js** 18+
- **PostgreSQL** 14+
- **JWT_SECRET** configured
- **DATABASE_URL** configured

---

## Performance Tips

1. **Use React Query** for automatic caching and refetching
2. **Batch requests** with Promise.all() when fetching multiple resources
3. **Implement infinite scroll** for lists with pagination limit parameter
4. **Cache notifications** locally to reduce server calls
5. **Use optimistic updates** for better UX on mutations

---

## Support

For API issues or questions:
1. Check error message for details
2. Review this reference guide
3. Check database logs in `server/db.ts`
4. Contact support team

---

**Last Updated:** 2024  
**API Version:** 1.0  
**Status:** Production Ready
