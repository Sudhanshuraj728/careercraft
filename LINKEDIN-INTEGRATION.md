# LinkedIn Integration Setup Guide

## ✅ What's Been Implemented

Your CareerCraft application now has **LinkedIn OAuth integration**! Here's what happens:

### User Flow (NOT Logged In):
1. **User clicks "Sign in with LinkedIn"** button on homepage
2. **Redirects to LinkedIn** → User signs into LinkedIn
3. **User authorizes CareerCraft** on LinkedIn
4. **Returns to your app** → User is logged in automatically
5. **LinkedIn connected!** → Button shows "✓ LinkedIn Linked" (green)

### User Flow (Already Logged In):
1. **User clicks "Link LinkedIn"** button
2. **Redirects to LinkedIn** → User signs into LinkedIn
3. **User authorizes CareerCraft** on LinkedIn  
4. **Returns to your app** → LinkedIn profile is linked
5. **Success message** → "LinkedIn linked successfully!"

### User Flow (Already Linked):
1. **Button shows "✓ LinkedIn Linked"** (green)
2. **User clicks button** → Confirmation dialog
3. **Confirms unlink** → LinkedIn is disconnected
4. **Button returns to** "Sign in with LinkedIn" (blue)

### Button States:
- 🔵 **"Sign in with LinkedIn"** - Not logged in (blue)
- 🔵 **"Link LinkedIn"** - Logged in but not linked (blue)
- ✅ **"✓ LinkedIn Linked"** - Connected (green)
- Click when linked → Shows option to unlink

---

## 🔧 Setup Required

To make LinkedIn OAuth work, you need to create a LinkedIn app and get credentials:

### Step 1: Create LinkedIn App

1. Go to https://www.linkedin.com/developers/apps
2. Click **"Create app"**
3. Fill in the details:
   - **App name**: CareerCraft
   - **LinkedIn Page**: Your company page (or create one)
   - **App logo**: Upload your logo
   - **Legal agreement**: Check the box

### Step 2: Get Client Credentials

1. After creating the app, go to **"Auth"** tab
2. You'll see:
   - **Client ID**: Copy this
   - **Client Secret**: Click "Show" and copy

### Step 3: Add Redirect URL

1. Still in **"Auth"** tab
2. Under **"OAuth 2.0 settings"**
3. Click **"Add redirect URL"**
4. Add: `http://localhost:3000/auth/linkedin/callback`
5. Click **"Update"**

### Step 4: Request API Scopes

1. Go to **"Products"** tab
2. Request access to:
   - ✅ **Sign In with LinkedIn using OpenID Connect**
3. Wait for approval (usually instant for basic profile)

### Step 5: Update Your .env File

Open `e:\careercraft\.env` and replace:

```env
LINKEDIN_CLIENT_ID=your-linkedin-client-id-here
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret-here
```

With your actual credentials:

```env
LINKEDIN_CLIENT_ID=86xyz...  (your actual Client ID)
LINKEDIN_CLIENT_SECRET=abc123...  (your actual Client Secret)
```

### Step 6: Restart Server

```bash
node server.js
```

---

## 🧪 Testing

1. **Open**: http://localhost:3000
2. **Log in** with Google or sign up
3. **Click "Link LinkedIn"** button
4. **Authorize** on LinkedIn
5. **Redirected back** with success message
6. **Button shows** "✓ LinkedIn Linked" (green)

---

## 📊 What Data is Stored

When a user links LinkedIn, we store:

```javascript
linkedinProfile: {
    username: "john-doe",
    profileUrl: "https://www.linkedin.com/in/john-doe",
    headline: "Software Engineer at Google",
    summary: "Passionate developer...",
    pictureUrl: "https://...",
    linkedAt: Date (when linked)
}
```

---

## 🔒 Security Features

✅ **State parameter** for CSRF protection  
✅ **Requires login** before linking  
✅ **Secure token exchange**  
✅ **Environment variables** for credentials  
✅ **Session-based** authentication  

---

## 🎨 UI Features

### Before Linking:
- Blue LinkedIn button
- "Link LinkedIn" text
- Tooltip: "Log in to link LinkedIn"

### After Linking:
- Green LinkedIn button
- "✓ LinkedIn Linked" text with checkmark
- Tooltip: "Click to unlink LinkedIn"
- Click → Confirms and unlinks

### Not Logged In:
- Shows alert: "Please log in first"
- Opens login modal automatically

---

## 🔄 Unlinking LinkedIn

Users can unlink LinkedIn by:
1. Clicking the "✓ LinkedIn Linked" button
2. Confirming in the dialog
3. LinkedIn data is removed
4. Button returns to "Link LinkedIn" (blue)

---

## 🚀 Production Deployment

When deploying to production:

1. **Update redirect URL** in LinkedIn app:
   ```
   https://yoursite.com/auth/linkedin/callback
   ```

2. **Update .env** file:
   ```env
   LINKEDIN_CALLBACK_URL=https://yoursite.com/auth/linkedin/callback
   ```

3. **Verify** the app is approved by LinkedIn

---

## ❓ Troubleshooting

### Error: "Failed to connect LinkedIn"
- Check Client ID and Secret in .env
- Verify redirect URL matches exactly
- Check LinkedIn app status (approved?)

### Error: "Please log in first"
- User must be logged in before linking
- Google OAuth or signup required first

### Button doesn't change color
- Refresh the page
- Check browser console for errors
- Verify server is running

---

## 🎯 Next Steps

Now that LinkedIn is integrated, you can:

1. **Auto-fill resume** from LinkedIn profile
2. **Import work experience** automatically
3. **Sync skills** from LinkedIn
4. **Show LinkedIn profile** on user dashboard
5. **Use LinkedIn data** for better job matching

---

## 📝 Files Modified

✅ `models/User.js` - Added LinkedIn fields  
✅ `server.js` - Added OAuth routes  
✅ `index.js` - Added link/unlink functions  
✅ `index.html` - Updated button UI  
✅ `.env` - Added LinkedIn credentials  

---

## 🎉 You're All Set!

Once you add your LinkedIn credentials to `.env`, the feature is **fully functional**!

**Test it now:**
1. Get LinkedIn credentials (5 minutes)
2. Update .env file
3. Restart server
4. Link your LinkedIn! 🚀
