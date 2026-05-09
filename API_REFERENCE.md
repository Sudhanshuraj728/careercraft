# 🔐 Quick Reference - Premium System API

## Authentication Middleware

### `requireAuth()` - Must be logged in
```javascript
app.get('/api/protected', requireAuth, handler);
// Returns 401 if not authenticated
```

### `requirePremium()` - Must be premium
```javascript
app.get('/api/premium-feature', requirePremium, handler);
// Returns 401 if not authenticated
// Returns 403 if authenticated but not premium
```

### `requireAdmin()` - Must be admin
```javascript
app.get('/api/admin/endpoint', requireAdmin, handler);
// Returns 401 if not authenticated
// Returns 403 if not in ADMIN_EMAILS
```

---

## Endpoints Reference

### Public Endpoints (No Auth)
```
GET  /api/health                           ← System health check
GET  /api/companies                        ← List companies (free preview)
GET  /api/companies/search                 ← Search companies (free preview)
GET  /api/companies/:slug                  ← Company details (free preview)
GET  /api/companies/:slug/jobs             ← Job listings (free data)
POST /api/auth/register                    ← Create account
POST /api/auth/login                       ← Login
GET  /auth/google                          ← Google OAuth
GET  /auth/linkedin                        ← LinkedIn OAuth
POST /api/resumes/upload                   ← Upload resume
```

### Authenticated (Requires Login)
```
GET  /api/auth/user                        ← Current user info
POST /api/auth/logout                      ← Logout
GET  /api/subscription/status              ← Check subscription
POST /api/subscription/initiate-upgrade    ← Start upgrade
POST /api/subscription/confirm-upgrade     ← Confirm upgrade
GET  /api/linkedin/status                  ← Check LinkedIn connection
POST /api/contact                          ← Submit contact form
POST /api/resumes/analyze                  ← Analyze resume (quota'd)
```

### Premium Only
```
GET  /api/linkedin/company-employees/:name ← LinkedIn employee profiles
```

### Admin Only
```
GET  /api/admin/users                      ← All users
GET  /api/admin/companies                  ← All companies
GET  /api/admin/contacts                   ← Contact messages
GET  /api/admin/report                     ← System report
GET  /api/admin/export                     ← Export database
GET  /api/admin/logs                       ← System logs
GET  /api/admin/health                     ← System health
POST /api/subscription/reset               ← Reset subscriptions
```

---

## Response Codes Quick Reference

| Code | Meaning | Example Endpoint |
|------|---------|------------------|
| **200** | Success | `/api/companies/google` |
| **201** | Created | `POST /api/auth/register` |
| **400** | Bad request | Missing required field |
| **401** | Not authenticated | Premium endpoint without login |
| **403** | Not authorized | Free user accessing premium feature |
| **404** | Not found | Company doesn't exist |
| **429** | Rate limited | Too many requests |
| **500** | Server error | Internal error |

---

## Error Codes

```javascript
// Authentication errors
"AUTH_REQUIRED"              // 401 - User not logged in
"INVALID_CREDENTIALS"        // 401 - Wrong email/password
"SESSION_EXPIRED"            // 401 - Session timed out

// Authorization errors
"PREMIUM_REQUIRED"           // 403 - Free user accessing premium
"ADMIN_REQUIRED"             // 403 - Non-admin accessing admin endpoint
"INVALID_PAYMENT"            // 400 - Payment verification failed

// Business logic errors
"ALREADY_PREMIUM"            // 400 - User already has premium
"ANALYSIS_LIMIT_REACHED"     // 403 - Used all free analyses
"VERIFICATION_FAILED"        // 500 - Could not verify premium
```

---

## Subscription Payload

### Free User Response
```json
{
  "plan": "free",
  "analysesUsed": 3,
  "analysesLimit": 10,
  "remaining": 7,
  "isActive": true,
  "isPremium": false,
  "isGuest": false,
  "message": "7 free resume analyses remaining"
}
```

### Premium User Response
```json
{
  "plan": "premium",
  "analysesUsed": 5,
  "analysesLimit": 10,
  "remaining": "Unlimited",
  "isActive": true,
  "isPremium": true,
  "premiumEndDate": "2026-06-04T12:00:00.000Z",
  "message": "Premium active until 06/04/2026"
}
```

### Expired Premium Response
```json
{
  "plan": "free",
  "analysesUsed": 0,
  "analysesLimit": 10,
  "remaining": 10,
  "isActive": true,
  "isPremium": false,
  "premiumEndDate": "2026-03-04T12:00:00.000Z",
  "message": "10 free resume analyses remaining"
}
```

---

## Environment Variables

```bash
# Required
SESSION_SECRET=<32-char-random-string>        # For session encryption
NODE_ENV=production                           # development/production

# Admin configuration
ADMIN_EMAILS=admin@company.com,super@co.com  # Comma-separated

# Payment gateway (when ready)
PAYMENT_GATEWAY_KEY=xxx                       # Razorpay/Stripe key
PAYMENT_GATEWAY_SECRET=xxx                    # Razorpay/Stripe secret

# Database
MONGO_URI=mongodb://localhost:27017/careercraft
```

---

## Testing Common Scenarios

### Test 1: Free user gets quota limit
```bash
# Upload and analyze 10 times
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/resumes/analyze \
    -H "Cookie: connect.sid=<session>" \
    -d '{"filename": "resume.pdf", "companySlug": "google"}'
done

# 11th attempt returns 403
```

### Test 2: Admin endpoint protection
```bash
# Try without auth
curl http://localhost:3000/api/admin/users
# Returns: 401 Unauthorized

# Try with non-admin user
curl http://localhost:3000/api/admin/users \
  -H "Cookie: connect.sid=<user-session>"
# Returns: 403 Forbidden (admin required)

# Try with admin user
curl http://localhost:3000/api/admin/users \
  -H "Cookie: connect.sid=<admin-session>"
# Returns: 200 OK with users list
```

### Test 3: Premium feature access
```bash
# Free user tries LinkedIn feature
curl http://localhost:3000/api/linkedin/company-employees/Google \
  -H "Cookie: connect.sid=<free-user-session>"
# Returns: 403 Forbidden (premium required)

# Premium user accesses
curl http://localhost:3000/api/linkedin/company-employees/Google \
  -H "Cookie: connect.sid=<premium-user-session>"
# Returns: 200 OK with employee profiles
```

---

## Common Issues & Solutions

| Problem | Cause | Solution |
|---------|-------|----------|
| 401 on admin endpoint | Not logged in | Login first |
| 403 on admin endpoint | Not in ADMIN_EMAILS | Check .env config |
| 403 on premium feature | Free tier | Upgrade to premium |
| Subscription not updating | Server restart | No, subscriptions persist |
| Payment dialog not showing | Not logged in | Login first |
| Rate limit errors | Too many requests | Wait before retrying |

---

## Code Examples

### Check if user is premium (Frontend)
```javascript
function hasPremiumAccess() {
  return Boolean(
    (subscriptionStatus && subscriptionStatus.isPremium) ||
    (currentUser && currentUser.isPremium)
  );
}
```

### Verify subscription (Backend)
```javascript
async function requirePremium(req, res, next) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ error: 'Auth required' });
  }
  
  const subscription = await getOrCreateSubscription(req.user._id);
  
  if (!isPremiumActive(subscription)) {
    return res.status(403).json({
      error: 'Premium required',
      requiresSubscription: true,
      subscription: buildSubscriptionPayload(subscription)
    });
  }
  
  next();
}
```

### Upgrade flow (Frontend)
```javascript
// Step 1: Initiate
const initiate = await fetch('/api/subscription/initiate-upgrade', {
  method: 'POST',
  credentials: 'include'
});

// Step 2: Show payment UI
const orderData = (await initiate.json()).data;
showPaymentDialog(orderData);

// Step 3: Confirm
const confirm = await fetch('/api/subscription/confirm-upgrade', {
  method: 'POST',
  credentials: 'include',
  body: JSON.stringify({
    paymentId: 'pay_xxx',
    orderId: orderData.orderId
  })
});

if ((await confirm.json()).success) {
  // Premium activated!
  checkSubscriptionStatus();
}
```

---

## Admin Configuration

### Add admin user
```bash
# Update .env
ADMIN_EMAILS=admin@company.com,newadmin@company.com

# Restart server
```

### Check admin logs
```bash
# In logs/app.log
grep "Admin accessed" logs/app.log
# Output: Admin accessed users: admin@company.com
```

---

## Performance Tips

1. **Cache subscription for 1 minute** to reduce DB hits
2. **Use database indexes** on `userId` and `premiumEndDate`
3. **Pre-fetch subscription** on login for quick access
4. **Batch admin queries** when possible

---

## Security Reminders

✅ Always use `requirePremium` for premium endpoints  
✅ Always use `requireAdmin` for admin endpoints  
✅ Never trust client subscription state  
✅ Verify payment with gateway before upgrading  
✅ Log all sensitive operations  
✅ Use HTTPS in production  
✅ Rotate session secrets regularly  

---

## Quick Links

- **Detailed Security:** `SECURITY_AUDIT.md`
- **Deployment:** `PRODUCTION_READINESS.md`
- **Testing:** `TEST_CASES.md`
- **Full Guide:** `PREMIUM_SYSTEM_GUIDE.md`

---

**Last Updated:** May 5, 2026  
**Status:** ✅ Production Ready  
**Version:** 1.0

