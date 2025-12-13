# ⚡ QUICK LOCALHOST TEST CHECKLIST

## Before Testing
- [ ] Dev server running: `npm run dev` (should say "Server running on http://localhost:3000/")
- [ ] Open browser to `http://localhost:3000`
- [ ] Open Developer Console (F12) to check for errors

---

## 🔴 CRITICAL: Must Test These Endpoints

### Payment Fee Processing
- [ ] Can user access `/payment/[loanId]` without error?
- [ ] Console shows no "Loan must be approved before payment" error?
- [ ] Payment form loads (card or crypto)?

### Chat Session Management  
- [ ] Can navigate to Live Chat page?
- [ ] Can close a chat session with rating/feedback?
- [ ] No type errors in console about "closeChatSession"?

### Account Closure
- [ ] Can access account settings/closure page?
- [ ] When trying to close account, does it check for active loans?
- [ ] Shows appropriate message about outstanding loans?

### E-Signature Documents
- [ ] Can create/upload e-signature documents?
- [ ] No "email is required" error when email exists?
- [ ] Documents sent for signing successfully?

### Campaign Analytics (Admin Only)
- [ ] Can view campaign performance with valid ID?
- [ ] No "Campaign ID is required" error with valid ID?

---

## 📋 Verification Commands

In browser console, check:

```javascript
// Check if errors are from our fixed code
console.log("Check for routers.ts errors in: ");
// - lines 3484 (payment fee status)
// - lines 7527 (chat closure)
// - lines 7386 (account closure)
// - lines 7567 (e-signature)
// - lines 7636 (campaign id)
```

---

## ✅ All Tests Passed?

If ALL checkboxes above are checked:

**Run:** 
```bash
git status
```

Then come back and say "Ready to commit" and I'll push to production!

---

## If Tests Fail

Describe the error:
- What feature failed?
- What error message appears?
- What should happen instead?

I'll investigate and fix!
