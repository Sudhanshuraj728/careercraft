# 🔴 LinkedIn Setup Required!

## You're seeing this error because LinkedIn isn't configured yet.

**Error**: "The passed in client_id is invalid"

**Fix**: You need to get LinkedIn OAuth credentials (takes 5 minutes)

---

## ⚡ Quick Setup (5 Minutes)

### Step 1: Go to LinkedIn Developers (1 min)
🔗 https://www.linkedin.com/developers/apps

### Step 2: Create App (2 min)
1. Click **"Create app"**
2. Fill in:
   - **App name**: CareerCraft (or any name)
   - **LinkedIn Page**: Select or create a page
   - **Logo**: Upload any image (just for testing)
3. Accept terms
4. Click **"Create app"**

### Step 3: Get Credentials (30 sec)
1. Go to **"Auth"** tab
2. Copy **"Client ID"** (looks like: `86abc123xyz...`)
3. Click **"Show"** next to **"Client Secret"**
4. Copy **"Client Secret"** (looks like: `def456uvw...`)

### Step 4: Add Redirect URL (30 sec)
1. Still in **"Auth"** tab
2. Find **"Redirect URLs"** section
3. Click **"Add redirect URL"**
4. Type EXACTLY: `http://localhost:3000/auth/linkedin/callback`
5. Click **"Update"**

### Step 5: Request API Access (30 sec)
1. Go to **"Products"** tab
2. Find **"Sign In with LinkedIn using OpenID Connect"**
3. Click **"Request access"**
4. Wait for approval (usually instant)

### Step 6: Update .env File (1 min)
Open: `e:\careercraft\.env`

Find these lines:
```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret-here
```

Replace with your ACTUAL credentials:
```env
LINKEDIN_CLIENT_ID=86abc123xyz...
LINKEDIN_CLIENT_SECRET=def456uvw...
```

**IMPORTANT**: Remove the placeholder text completely!

### Step 7: Restart Server
```bash
node server.js
```

---

## ✅ Test It

1. Open: http://localhost:3000
2. Click **"Sign in with LinkedIn"**
3. Sign into LinkedIn
4. Authorize CareerCraft
5. **Success!** You're logged in! 🎉

---

## 📸 Visual Guide

### What Client ID Looks Like:
```
86abc123def456xyz789
```
(Around 15-20 characters)

### What Client Secret Looks Like:
```
abcDEF123xyz456
```
(Random alphanumeric string)

### Where to Find Them:
```
LinkedIn Developers → Your App → Auth Tab
- Client ID: Right at the top
- Client Secret: Click "Show" to reveal
```

---

## ❌ Common Mistakes

### ❌ DON'T:
```env
LINKEDIN_CLIENT_ID="86abc123..."  # No quotes!
LINKEDIN_CLIENT_ID=your-linkedin-client-id-here  # No placeholder!
```

### ✅ DO:
```env
LINKEDIN_CLIENT_ID=86abc123xyz789
LINKEDIN_CLIENT_SECRET=def456uvw321
```

---

## 🆘 Still Having Issues?

### Issue: "Invalid redirect_uri"
**Fix**: Make sure redirect URL in LinkedIn app is EXACTLY:
```
http://localhost:3000/auth/linkedin/callback
```
(No trailing slash, lowercase, exact match)

### Issue: "Unauthorized scope"
**Fix**: Request "Sign In with LinkedIn using OpenID Connect" product

### Issue: Still shows placeholder error
**Fix**: 
1. Check .env file was saved
2. Restart server: `node server.js`
3. Hard refresh browser: `Ctrl + Shift + R`

---

## 🎯 Why Do You Need This?

LinkedIn OAuth credentials allow your app to:
- ✅ Let users sign in with LinkedIn
- ✅ Get profile information (name, email, picture)
- ✅ Link LinkedIn accounts to existing users
- ✅ Auto-fill resume information

---

## ⏱️ Time Investment

- **Setup**: 5 minutes (one-time)
- **Testing**: 30 seconds
- **Benefits**: Forever! 🚀

---

## 🔐 Security

Your credentials are:
- ✅ Stored only in `.env` file (not in code)
- ✅ Never committed to Git (`.env` is in `.gitignore`)
- ✅ Only used server-side
- ✅ Protected by LinkedIn's OAuth 2.0

---

## 🎉 Once Set Up

After setup, users can:
1. Click **"Sign in with LinkedIn"**
2. Authorize on LinkedIn
3. Instantly create account + log in
4. No password needed!

**It's worth the 5 minutes!** 💪

---

**Need Help?**  
Check the detailed guide: `LINKEDIN-SETUP.md`
