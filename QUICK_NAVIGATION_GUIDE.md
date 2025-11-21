# Quick Navigation & Testing Guide

## 🚀 Get Started

### Start the Development Server
```powershell
cd c:\Users\USER\Downloads\Amerilendloan.com
npm run dev
```
Server will run on: `http://localhost:3000`

### Access the Admin Interface
Once server is running, navigate to:
- **User Management:** http://localhost:3000/admin/users
- **KYC Review:** http://localhost:3000/admin/kyc
- **Support Tickets:** http://localhost:3000/admin/support

---

## 📁 File Locations

### New Admin Components (Created This Session)
```
client/src/pages/
├── AdminUserManagement.tsx     (345 lines) - /admin/users
├── AdminKYCManagement.tsx      (350 lines) - /admin/kyc
└── AdminSupportManagement.tsx  (355 lines) - /admin/support
```

### Routes Configuration
```
client/src/App.tsx               - All routes defined here (added 3 new routes)
```

### Integration Tests
```
integration-tests.mjs            - Run with: node integration-tests.mjs
```

### Configuration
```
drizzle.config.ts                - Database config
tsconfig.json                    - TypeScript config
package.json                     - Dependencies
```

---

## 🧪 Testing

### Build Verification
```powershell
npm run build
```
Expected result: ✅ 504.8 KB, 0 errors

### Type Checking
```powershell
npm run check
```
Expected result: ✅ No TypeScript errors

### Run Integration Tests
```powershell
node integration-tests.mjs
```
Expected result: Tests for 10+ TRPC endpoints

---

## 📊 Component Testing Checklist

### User Management Page (`/admin/users`)
- [ ] Page loads without errors
- [ ] Search box filters users by name/email
- [ ] Status filter (All/Active/Pending/Suspended) works
- [ ] Statistics cards show correct counts
- [ ] Click user card to expand details
- [ ] Action buttons visible (View/Suspend/Delete)

### KYC Management Page (`/admin/kyc`)
- [ ] Page loads without errors
- [ ] Status filter (All/Pending/Approved/Rejected) works
- [ ] Statistics cards show submission counts
- [ ] Click ticket to view document details
- [ ] Admin notes textarea is editable
- [ ] Approval/Rejection buttons work for pending items
- [ ] Status badges display correctly

### Support Management Page (`/admin/support`)
- [ ] Page loads without errors
- [ ] Status filter (All/Open/In Progress/Resolved) works
- [ ] Statistics cards show ticket counts
- [ ] Click ticket to view conversation thread
- [ ] Message history displays in correct order
- [ ] Reply textarea is functional
- [ ] Send Reply button works
- [ ] Save & Close Ticket button works

---

## 🔌 TRPC Integration Points

### When Connecting Real Data

**AdminUserManagement needs:**
```typescript
userFeatures.users.list(filters)      // GET list of users
userFeatures.users.getDetail(userId)  // GET user details
userFeatures.users.suspend(userId)    // POST suspend action
```

**AdminKYCManagement needs:**
```typescript
userFeatures.kyc.listPendingVerifications(filters)  // GET KYC list
userFeatures.kyc.approveVerification(kycId, notes)  // POST approval
userFeatures.kyc.rejectVerification(kycId, reason)  // POST rejection
userFeatures.kyc.addAdminNotes(kycId, notes)        // POST notes
```

**AdminSupportManagement needs:**
```typescript
userFeatures.support.listTickets(filters)           // GET tickets
userFeatures.support.getTicketDetail(ticketId)      // GET ticket & messages
userFeatures.support.addResponse(ticketId, message) // POST reply
userFeatures.support.updateStatus(ticketId, status) // POST status update
```

---

## 🛠️ Development Commands

| Command | Purpose | Time |
|---------|---------|------|
| `npm run dev` | Start dev server | <5 sec |
| `npm run build` | Full production build | ~1 min |
| `npm run check` | Type checking | ~10 sec |
| `node integration-tests.mjs` | Test endpoints | ~5 sec |
| `npm run db:push` | Apply DB migrations | ~15 sec |

---

## 🐛 Troubleshooting

### Dev Server won't start
```
Error: EADDRINUSE :::3000
Solution: Kill existing process on port 3000 or use different port
```

### TypeScript errors after editing
```
Run: npm run check
This will show exact line numbers and errors
```

### Build fails
```
Run: npm run check first to identify issues
Then: npm run build
```

### Database connection fails
```
Check: DATABASE_URL environment variable is set
Check: PostgreSQL is running
Check: Credentials are correct
```

---

## 📋 Component Mock Data

Each admin component includes mock data that demonstrates the expected data structure:

### AdminUserManagement
```typescript
mockTickets = [
  {
    id: "USR-001",
    userId: "USR-001",
    userName: "John Smith",
    userEmail: "john.smith@example.com",
    accountStatus: "active",
    kycStatus: "verified",
    loanCount: 2,
    totalBorrowed: 15000,
    // ... more fields
  },
  // ... 3 more sample users
]
```

### AdminKYCManagement
```typescript
mockTickets = [
  {
    id: "KYC-001",
    userId: "USR-001",
    userName: "Sarah Johnson",
    status: "pending",
    documents: [
      {
        id: "DOC-001",
        type: "id",
        status: "pending",
        // ... document details
      },
      // ... more documents
    ],
    // ... more fields
  },
  // ... 2 more sample submissions
]
```

### AdminSupportManagement
```typescript
mockTickets = [
  {
    id: "TKT-001",
    userId: "USR-001",
    status: "in-progress",
    messages: [
      {
        id: "MSG-001",
        senderRole: "user",
        message: "I have a question...",
        sentAt: "2024-01-20 10:30",
      },
      // ... more messages
    ],
    // ... more fields
  },
  // ... 2 more sample tickets
]
```

When connecting to TRPC, replace these mock data arrays with actual API calls using React Query's `useQuery` hook.

---

## 🎯 Success Criteria

### Build Success
- ✅ `npm run build` completes without errors
- ✅ Output size is ~500 KB
- ✅ No TypeScript errors
- ✅ `dist/index.js` is created

### Server Success
- ✅ `npm run dev` starts without errors
- ✅ Server listens on port 3000
- ✅ Terminal shows "✅ Server is ready to accept connections"
- ✅ http://localhost:3000 opens in browser

### Component Success
- ✅ All 3 admin pages load without console errors
- ✅ Mock data displays correctly
- ✅ Search/filter functionality works
- ✅ Detail panels expand/collapse
- ✅ Buttons are clickable

### Database Success
- ✅ `npm run db:push` shows "No schema changes"
- ✅ 35 tables confirmed in database
- ✅ All 15 new tables present
- ✅ Schema matches `drizzle/schema.ts`

---

## 📚 Documentation Files

**In This Session:**
- `TIER_1_COMPLETION_SUMMARY.md` - Comprehensive session summary
- `QUICK_NAVIGATION_GUIDE.md` - This file

**Existing Documentation:**
- `API_DOCUMENTATION.md` - TRPC procedure documentation
- `DATABASE_SCHEMA.md` - Database table definitions
- `DEPLOYMENT_GUIDE.md` - Production deployment steps
- `LEGAL_DOCUMENTS_GUIDE.md` - Legal flow documentation
- `PAYMENT_INTEGRATION_GUIDE.md` - Payment system details
- `OTP_AUTHENTICATION_GUIDE.md` - Auth system details

---

## 🎓 Architecture Overview

```
App.tsx
├── Routes
│   ├── User Pages
│   │   ├── /user-dashboard → UserDashboard
│   │   ├── /user-profile → UserProfile
│   │   ├── /loans/:id → LoanDetail
│   │   ├── /notifications → NotificationCenter
│   │   ├── /support → SupportCenter
│   │   ├── /payment-history → PaymentHistory
│   │   ├── /referrals → ReferralsAndRewards
│   │   └── /bank-accounts → BankAccountManagement
│   │
│   └── Admin Pages (NEW)
│       ├── /admin/users → AdminUserManagement
│       ├── /admin/kyc → AdminKYCManagement
│       └── /admin/support → AdminSupportManagement
│
├── React Query
│   └── TRPC Client (40+ procedures)
│
└── UI Library
    ├── shadcn/ui components
    ├── Tailwind CSS
    └── lucide-react icons

Backend
├── Express.js
├── TRPC Server (40+ procedures)
├── Drizzle ORM
└── PostgreSQL (35 tables)
```

---

## 💾 Backup & Git

### Check Current Changes
```powershell
git status
```

### View Recent Commits
```powershell
git log --oneline -10
```

### Create Backup Before Major Changes
```powershell
git commit -m "Backup before [feature name]"
git push origin main
```

---

## 🔍 Debugging Tips

### Check Component Errors
Look in browser console (F12) for:
- React errors
- TRPC call failures
- TypeScript compilation issues

### Check Server Logs
Terminal output shows:
- Database connection status
- TRPC endpoint registration
- Vite build progress
- Runtime errors

### Test Individual Components
Edit `App.tsx` to navigate directly to a component for isolated testing

### Use Browser DevTools
- F12 to open Developer Tools
- Network tab to inspect API calls
- Console tab for JavaScript errors
- React DevTools extension for component inspection

---

## 📞 Support

### Common Issues & Solutions

**"Cannot find module"**
- Run: `npm install`
- Check import paths use `@/` for client imports
- Check import paths use `@shared/*` for shared imports

**"Database connection refused"**
- Verify PostgreSQL is running
- Check DATABASE_URL in environment
- Check credentials in .env file

**"Port 3000 already in use"**
- Kill existing process: `lsof -i :3000`
- Or use different port by modifying `index.ts`

**"TRPC endpoint not found"**
- Check procedure name matches `server/routers.ts`
- Check router nesting (e.g., `userFeatures.users.list`)
- Restart dev server after adding new procedures

---

## ✅ Session Completion Checklist

- [x] Database schema migrated and verified
- [x] Dev server started and running
- [x] 3 admin components created (1,050 lines)
- [x] Routes integrated into App.tsx
- [x] Full build successful (504.8 KB, 0 errors)
- [x] Integration test suite created
- [x] Comprehensive documentation written
- [x] All code compiles without errors
- [x] Ready for TRPC integration testing

**Status: 🎉 TIER 1 COMPLETE**

Next: Connect mock data to TRPC endpoints and run full integration tests.
