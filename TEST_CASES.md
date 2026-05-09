# CareerCraft Premium System - Test Cases & Validation Guide

## Manual Testing Checklist

### 1. Free User Workflow

#### 1.1 Company Details Access
- [ ] Login as free user
- [ ] Search for company (e.g., "Google")
- [ ] Click on company card
- [ ] Verify: Company modal shows lock badge "🔒 Premium Locked"
- [ ] Verify: Basic info visible (name, industry, location, size)
- [ ] Verify: Description and features section shows upgrade prompt
- [ ] Verify: "Upgrade to Premium" button present
- [ ] Click upgrade button → Verify subscription modal opens

#### 1.2 Resume Analysis Quota
- [ ] Upload resume file
- [ ] Select company
- [ ] Analyze resume
- [ ] Verify: Analysis works (1/10 used)
- [ ] Repeat 9 more times
- [ ] On 11th attempt → Verify: 403 error with "Analysis limit reached"
- [ ] Verify: Upgrade prompt appears
- [ ] Verify: Subscription banner shows "0 free analyses remaining" in red

#### 1.3 LinkedIn Employee Insights
- [ ] Complete resume analysis
- [ ] Verify: LinkedIn section shows lock icon
- [ ] Verify: Message: "Upgrade to Premium to view LinkedIn employee insights"
- [ ] Verify: "Upgrade to Premium" button present
- [ ] Don't click upgrade, instead try direct API call:
  ```bash
  curl http://localhost:3000/api/linkedin/company-employees/Google \
    -H "Cookie: connect.sid=<your-session-id>"
  ```
- [ ] Verify: Response is 403 with `requiresSubscription: true`

#### 1.4 Admin Endpoint Access
- [ ] Try to access admin endpoints as free user:
  ```bash
  curl http://localhost:3000/api/admin/users
  ```
- [ ] Verify: 401 Unauthorized (no authentication)
- [ ] Now login as free user, then try again
- [ ] Verify: 403 Forbidden (authenticated but not admin)
- [ ] Check response includes: `code: "ADMIN_REQUIRED"`

---

### 2. Premium User Workflow

#### 2.1 Company Details Access
- [ ] Upgrade to premium (demo: `DEMO_PAY_001`)
- [ ] Verify: Subscription status shows "premium"
- [ ] Search for company
- [ ] Click company card
- [ ] Verify: NO lock badge
- [ ] Verify: Full description visible
- [ ] Verify: Features section shows all features
- [ ] Verify: No upgrade prompt

#### 2.2 Unlimited Resume Analysis
- [ ] Upload resume
- [ ] Analyze for company (1/unlimited)
- [ ] Analyze again (2/unlimited)
- [ ] Repeat 20+ times
- [ ] Verify: All analyses work without limit errors
- [ ] Verify: Subscription banner shows "Unlimited" access
- [ ] Verify: Banner is green (not red)

#### 2.3 LinkedIn Employee Access
- [ ] Complete resume analysis as premium
- [ ] Verify: LinkedIn section loads with employee profiles
- [ ] Verify: Employee cards show names, roles, photos
- [ ] Verify: "Connect" button or profile link present
- [ ] Click employee → Verify: LinkedIn profile opens

#### 2.4 Premium Feature Full Access
- [ ] Verify: No geolocation restrictions
- [ ] Verify: Advanced filters available
- [ ] Verify: Save favorite companies works
- [ ] Verify: All premium badges show "Premium" not "Premium Locked"

---

### 3. Expired Premium Workflow

#### 3.1 Setup Expired Subscription
```bash
# Via MongoDB directly (development only)
db.subscriptions.updateOne(
  { userId: ObjectId("your-user-id") },
  { $set: { premiumEndDate: new Date("2020-01-01") } }
)
```

#### 3.2 Verify Expiry Handling
- [ ] Logout and login as that user
- [ ] Verify: Subscription status shows `isPremium: false`
- [ ] Try to access premium feature
- [ ] Verify: 403 Forbidden (expired = free tier)
- [ ] Verify: Upgrade prompt appears
- [ ] Verify: Message shows "upgrade to continue"

#### 3.3 Expiry Countdown (Premium)
- [ ] Upgrade user with 5-day premium
  ```bash
  db.subscriptions.updateOne(
    { userId: ObjectId("your-user-id") },
    { $set: { premiumEndDate: new Date(Date.now() + 5*24*60*60*1000) } }
  )
  ```
- [ ] Login as that user
- [ ] Verify: Subscription banner shows "5 days remaining"
- [ ] Verify: Countdown is accurate

---

### 4. Authentication & Session Tests

#### 4.1 Session Hijacking Prevention
- [ ] Get session ID from browser cookies
- [ ] Open new incognito window
- [ ] Manually set cookie with fake session ID
- [ ] Try to access premium feature
- [ ] Verify: 401 Unauthorized (session not valid)

#### 4.2 DevTools Console Attacks
- [ ] Open DevTools console as free user
- [ ] Try to manually set premium state:
  ```javascript
  localStorage.setItem('isPremium', 'true');
  localStorage.setItem('subscriptionPlan', 'premium');
  ```
- [ ] Try to access premium feature
- [ ] Verify: Still blocked (server doesn't trust localStorage)
- [ ] Make API call from console:
  ```javascript
  fetch('/api/linkedin/company-employees/Google').then(r => r.json()).then(console.log)
  ```
- [ ] Verify: 403 Forbidden response

#### 4.3 Token Expiration
- [ ] Premium user completes analysis
- [ ] Wait for session timeout (default: 7 days or server restart)
- [ ] Try to analyze again
- [ ] Verify: 401 Unauthorized → Sign-in modal appears
- [ ] Login again
- [ ] Verify: Premium access restored

---

### 5. Upgrade Flow Tests

#### 5.1 Initiate Upgrade
```bash
curl -X POST http://localhost:3000/api/subscription/initiate-upgrade \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<your-session-id>"
```
- [ ] Verify: Response includes `orderId`, `amount: 14900`, currency
- [ ] Verify: Plan details included

#### 5.2 Confirm Upgrade (Demo Payment)
```bash
curl -X POST http://localhost:3000/api/subscription/confirm-upgrade \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<your-session-id>" \
  -d '{
    "paymentId": "DEMO_PAY_001",
    "orderId": "ORDER_xxx",
    "signature": "test"
  }'
```
- [ ] Verify: Response shows `plan: "premium"`
- [ ] Verify: `premiumEndDate` set to 30 days from now
- [ ] Verify: User can now access premium features

#### 5.3 Double Upgrade Prevention
- [ ] Upgrade to premium (create premium subscription)
- [ ] Try to upgrade again while premium:
  ```bash
  curl -X POST http://localhost:3000/api/subscription/initiate-upgrade \
    -H "Cookie: connect.sid=<your-session-id>"
  ```
- [ ] Verify: Response error "You are already a premium member"
- [ ] Verify: Correct premium end date in response

#### 5.4 Manual Upgrade Prevention (Security Test)
```bash
# Try old endpoint (should fail)
curl -X POST http://localhost:3000/api/subscription/upgrade \
  -H "Content-Type: application/json" \
  -H "Cookie: connect.sid=<your-session-id>" \
  -d '{"transactionId": "test"}'
```
- [ ] Verify: Response error "Invalid payment token"
- [ ] Verify: No subscription is created or upgraded

---

### 6. Admin Access Tests

#### 6.1 Admin User Tests
- [ ] Set `ADMIN_EMAILS=admin@test.com` in .env
- [ ] Register/login as admin@test.com
- [ ] Access admin endpoints:
  ```bash
  curl http://localhost:3000/api/admin/users \
    -H "Cookie: connect.sid=<admin-session-id>"
  ```
- [ ] Verify: 200 OK with users list

#### 6.2 Non-Admin Access Denied
- [ ] Register as regular user
- [ ] Try to access admin endpoint
- [ ] Verify: 403 Forbidden with `code: "ADMIN_REQUIRED"`

#### 6.3 Admin Operations
- [ ] Access `/api/admin/report` → Verify full report returns
- [ ] Access `/api/admin/export` → Verify download works
- [ ] Check server logs for audit trail
  ```bash
  grep "Admin accessed" logs/app.log
  ```
- [ ] Verify: Admin actions are logged with email and timestamp

---

### 7. Error Handling Tests

#### 7.1 Proper Error Codes
- [ ] Unauthenticated request to premium feature:
  - [ ] Status: 401
  - [ ] Response includes: `code: "AUTH_REQUIRED"`
- [ ] Authenticated free user to premium feature:
  - [ ] Status: 403
  - [ ] Response includes: `code: "PREMIUM_REQUIRED"`
- [ ] Admin access by non-admin:
  - [ ] Status: 403
  - [ ] Response includes: `code: "ADMIN_REQUIRED"`

#### 7.2 User-Friendly Messages
- [ ] All 403/401 responses include `message` field
- [ ] Messages are clear and actionable:
  - [ ] "Please sign in to access this feature"
  - [ ] "Upgrade to Premium to unlock this feature"
  - [ ] "Admin access required"

#### 7.3 Subscription Info in Error Response
```javascript
// 403 response should include current subscription status
{
  "success": false,
  "error": "Premium required",
  "subscription": {
    "plan": "free",
    "remaining": 3,
    "analysesUsed": 7,
    "isPremium": false
  }
}
```
- [ ] Verify: Frontend can use this to show smart prompts

---

### 8. Rate Limiting Tests

#### 8.1 Resume Analysis Rate Limit
- [ ] Analyze resume 10 times rapidly
- [ ] Verify: Works up to limit
- [ ] 11th request within time window
- [ ] Verify: 429 Too Many Requests (if rate limiting enabled)

#### 8.2 Login Rate Limit
- [ ] Try 10 failed logins in a row
- [ ] Verify: Error message after 5 attempts
- [ ] 6th attempt
- [ ] Verify: Rate limited (429 or cooldown message)

---

### 9. API Integration Tests

#### 9.1 Response Format Consistency
- [ ] Check all successful responses have `success: true`
- [ ] Check all error responses have `success: false`
- [ ] Check all premium checks return `isPremium` boolean
- [ ] Check error responses include `code` field

#### 9.2 Subscription Payload Consistency
```javascript
// Free user subscription payload:
{
  plan: "free",
  remaining: 10,
  analysesUsed: 0,
  analysesLimit: 10,
  isPremium: false,
  isGuest: false,
  message: "10 free resume analyses remaining"
}

// Premium user subscription payload:
{
  plan: "premium",
  remaining: "Unlimited",
  analysesUsed: 2,
  analysesLimit: 10,
  isPremium: true,
  premiumEndDate: "2026-06-04T...",
  message: "Premium active until 06/04/2026"
}
```
- [ ] Verify: All endpoints return this exact format

---

### 10. Database-Level Tests

#### 10.1 Subscription State Integrity
```javascript
// Check subscription data:
db.subscriptions.findOne({ userId: ObjectId("...") })

// Should have:
// - userId (required)
// - plan: 'free' | 'premium'
// - isActive: boolean
// - premiumStartDate: Date (if premium)
// - premiumEndDate: Date (if premium)
// - resumeAnalysesUsed: Number
// - freeAnalysesLimit: Number
// - paymentHistory: Array
```
- [ ] Verify: All subscriptions have required fields
- [ ] Verify: No orphaned subscriptions
- [ ] Verify: Payment history accurate

#### 10.2 Subscription Cleanup
```javascript
// After testing, verify no duplicate subscriptions per user:
db.subscriptions.aggregate([
  { $group: { _id: "$userId", count: { $sum: 1 } } },
  { $match: { count: { $gt: 1 } } }
])
```
- [ ] Verify: Result is empty (no duplicates)

---

## Automated Testing Scripts

### cURL Test Suite

```bash
#!/bin/bash
# save as test-premium-system.sh

BASE_URL="http://localhost:3000"
ADMIN_EMAIL="admin@test.com"
FREE_EMAIL="free@test.com"
PREMIUM_EMAIL="premium@test.com"

echo "=== Premium System Tests ==="

# Test 1: Free user cannot access admin endpoint
echo "Test 1: Admin endpoint protection"
curl -s -c cookies.txt -b cookies.txt \
  -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$FREE_EMAIL\", \"password\": \"password123\"}"

curl -s -b cookies.txt $BASE_URL/api/admin/users | jq .

# Test 2: Free user gets premium locked response
echo -e "\nTest 2: Company details gating"
curl -s -b cookies.txt $BASE_URL/api/companies/google | jq .

# Test 3: Premium user access
echo -e "\nTest 3: Premium user access"
curl -s -c premium-cookies.txt -b premium-cookies.txt \
  -X POST $BASE_URL/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$PREMIUM_EMAIL\", \"password\": \"password123\"}"

curl -s -b premium-cookies.txt $BASE_URL/api/linkedin/company-employees/Google | jq .

echo -e "\n=== Tests Complete ==="
```

---

## Regression Testing

After any changes to premium system:

1. [ ] Run free user workflow (section 1)
2. [ ] Run premium user workflow (section 2)
3. [ ] Run admin tests (section 6)
4. [ ] Run error handling tests (section 7)
5. [ ] Check server logs for errors
6. [ ] Verify no new security warnings

---

## Performance Testing

### Load Test: Premium Requests

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -H "Cookie: connect.sid=<premium-session>" \
  http://localhost:3000/api/companies/google

# Expected:
# - Response time < 200ms
# - Success rate: 100%
# - No 500 errors
```

### Subscription Verification Speed

```bash
# Time taken for premium access check
time curl -s -b cookies.txt \
  http://localhost:3000/api/linkedin/company-employees/Google
```

- [ ] Verify: < 100ms for subscription lookup
- [ ] Verify: < 500ms for full LinkedIn search

---

## Sign-Off

- [ ] All manual tests passed
- [ ] All error codes correct
- [ ] All security tests passed
- [ ] Admin endpoints protected
- [ ] Rate limiting works
- [ ] Payment flow ready
- [ ] Logging complete
- [ ] Documentation complete

**Ready for Production:** _________ (Date)  
**Tested By:** ____________  
**Approved By:** ____________

