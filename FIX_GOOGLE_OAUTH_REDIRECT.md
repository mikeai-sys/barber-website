# Fix Google OAuth Redirect to Localhost Issue

## Problem
After deploying to Firebase, Google OAuth redirects back to `localhost` instead of your production domain.

## Root Cause
Supabase's site URL and authorized redirect URLs are still configured for localhost development.

## Solution: Update Supabase Configuration

### Step 1: Go to Supabase Dashboard
1. Open https://supabase.com/dashboard
2. Select your project: `vcoukinlerisnlpfauxy`
3. Go to **Authentication** → **URL Configuration**

### Step 2: Update Site URL
Replace the Site URL from:
```
http://localhost:5173
```

To your production domain:
```
https://YOUR-FIREBASE-DOMAIN.web.app
```
(or `https://YOUR-FIREBASE-DOMAIN.firebaseapp.com` or your custom domain)

### Step 3: Update Redirect URLs
In **Redirect URLs** section, add your production URLs:

**Add these URLs:**
```
https://YOUR-FIREBASE-DOMAIN.web.app
https://YOUR-FIREBASE-DOMAIN.web.app/**
https://YOUR-FIREBASE-DOMAIN.firebaseapp.com
https://YOUR-FIREBASE-DOMAIN.firebaseapp.com/**
```

**Keep localhost for development:**
```
http://localhost:5173
http://localhost:5173/**
```

### Step 4: Update Google OAuth Credentials
1. Go to https://console.cloud.google.com/apis/credentials
2. Find your OAuth 2.0 Client ID: `1065078894672-rmp5kp8vfjns5rn9kp5psfp16g691043.apps.googleusercontent.com`
3. Click to edit it
4. Under **Authorized redirect URIs**, add:
   ```
   https://vcoukinlerisnlpfauxy.supabase.co/auth/v1/callback
   ```
   (This should already be there, but verify it)

5. Under **Authorized JavaScript origins**, add your Firebase domain:
   ```
   https://YOUR-FIREBASE-DOMAIN.web.app
   https://YOUR-FIREBASE-DOMAIN.firebaseapp.com
   ```

### Step 5: Clear Browser Cache
After making these changes:
1. Clear your browser cache and cookies
2. Try logging in with Google OAuth again

## Quick Checklist

✅ **Supabase Dashboard:**
- [ ] Site URL updated to production domain
- [ ] Redirect URLs include production domain
- [ ] Localhost URLs kept for development

✅ **Google Cloud Console:**
- [ ] Authorized redirect URIs include Supabase callback URL
- [ ] Authorized JavaScript origins include Firebase domain

✅ **Browser:**
- [ ] Cache cleared
- [ ] Cookies cleared

## How to Find Your Firebase Domain

Run this command to see your deployed URL:
```bash
firebase hosting:channel:list
```

Or check the Firebase Console:
1. Go to https://console.firebase.google.com
2. Select your project
3. Go to **Hosting**
4. You'll see your domain(s) listed there

## Example Configuration

If your Firebase domain is `barberweb-abc123.web.app`:

**Supabase Site URL:**
```
https://barberweb-abc123.web.app
```

**Supabase Redirect URLs:**
```
https://barberweb-abc123.web.app
https://barberweb-abc123.web.app/**
https://barberweb-abc123.firebaseapp.com
https://barberweb-abc123.firebaseapp.com/**
http://localhost:5173
http://localhost:5173/**
```

**Google OAuth Authorized JavaScript Origins:**
```
https://barberweb-abc123.web.app
https://barberweb-abc123.firebaseapp.com
http://localhost:5173
```

**Google OAuth Authorized Redirect URIs:**
```
https://vcoukinlerisnlpfauxy.supabase.co/auth/v1/callback
```

## Environment Variables Note

Your `.env` file has old OAuth proxy variables that are no longer needed:
```
VITE_GOOGLE_CLIENT_ID=... (not used with Supabase native OAuth)
VITE_GOOGLE_AUTH_PROXY=... (not used with Supabase native OAuth)
```

These can be removed as you're now using Supabase's native Google OAuth which is configured directly in the Supabase dashboard under **Authentication** → **Providers** → **Google**.

## Testing

After configuration:
1. Visit your production site
2. Click "Continue with Google"
3. Authorize the app
4. You should be redirected back to your production domain, not localhost

## Still Having Issues?

Check the browser console (F12) for error messages. Common issues:
- **"redirect_uri_mismatch"**: The redirect URI in Google Console doesn't match
- **"Invalid redirect URL"**: Supabase redirect URLs not configured correctly
- **CORS errors**: JavaScript origins not added to Google OAuth credentials

---

**Last Updated:** 2026-07-21
