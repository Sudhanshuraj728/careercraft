# LinkedIn OAuth Setup Guide

## Problem
LinkedIn deprecated the old API scopes (`r_liteprofile`, `r_emailaddress`) and now requires OpenID Connect.

## Solution - Update Your LinkedIn App

### Step 1: Go to LinkedIn Developer Portal
1. Visit: https://www.linkedin.com/developers/apps
2. Click on your app (Client ID: **86e12mjchpju2t**)

### Step 2: Update Products
1. Go to the **"Products"** tab
2. **Remove** the old "Sign In with LinkedIn" product (if present)
3. **Add** the **"Sign In with LinkedIn using OpenID Connect"** product
4. Click "Request access" and wait for approval (usually instant for personal apps)

### Step 3: Verify OAuth Settings
1. Go to the **"Auth"** tab
2. Make sure these redirect URLs are added:
   - Development: `http://localhost:3000/auth/linkedin/callback`
   - Production: `https://yourdomain.com/auth/linkedin/callback` (when deployed)

### Step 4: Test the Integration
1. Make sure the server is running: `node server.js`
2. Go to http://localhost:3000
3. Click "Link LinkedIn" or "Sign in with LinkedIn"
4. You should see a LinkedIn login page
5. After login, you'll be redirected back to the app

## New Scopes Used
✅ `openid` - Required for OpenID Connect  
✅ `profile` - User's basic profile info (name, picture)  
✅ `email` - User's email address  

## Old Scopes (No Longer Valid)
❌ `r_liteprofile` - Deprecated  
❌ `r_emailaddress` - Deprecated  

## API Endpoints Used
- Authorization: `https://www.linkedin.com/oauth/v2/authorization`
- Token Exchange: `https://www.linkedin.com/oauth/v2/accessToken`
- User Info: `https://api.linkedin.com/v2/userinfo` (OpenID Connect endpoint)

## Troubleshooting

### Error: "invalid_scope_error"
**Cause:** Your LinkedIn app hasn't been updated to use OpenID Connect  
**Fix:** Follow Step 2 above to add the OpenID Connect product

### Error: "redirect_uri_mismatch"
**Cause:** The callback URL doesn't match what's registered in your LinkedIn app  
**Fix:** Add `http://localhost:3000/auth/linkedin/callback` to your app's redirect URLs

### Error: "linkedin_no_email"
**Cause:** Email scope not granted or user doesn't have a verified email  
**Fix:** Make sure you requested the `email` scope and the user has a verified LinkedIn email

## Important Notes
1. **LinkedIn People Search API** requires partnership access and is not available by default
2. The app currently provides networking suggestions with direct LinkedIn search URLs as a fallback
3. Access tokens typically expire after 60 days
4. Make sure your `.env` file has the correct credentials:
   ```
   LINKEDIN_CLIENT_ID=86e12mjchpju2t
   LINKEDIN_CLIENT_SECRET=WPL_AP1.EDO4kXsHmqbqry5p.t0rucw==
   LINKEDIN_CALLBACK_URL=http://localhost:3000/auth/linkedin/callback
   ```

## Need Help?
- LinkedIn Developer Portal: https://www.linkedin.com/developers/
- OpenID Connect Docs: https://learn.microsoft.com/en-us/linkedin/consumer/integrations/self-serve/sign-in-with-linkedin-v2
