# Environment Variables Setup Guide for Subflix

This guide walks you through creating and configuring all necessary environment variables for the Subflix application to work properly.

## Overview

Subflix requires environment variables for:
- **Firebase Configuration** (authentication, database, storage)
- **Google OAuth** (login functionality)
- **Stripe/PayHere** (payment processing - optional)
- **Analytics** (tracking user behavior)

---

## Step 1: Create `.env.local` File

### For Local Development

1. **Navigate to your project root**:
   ```bash
   cd subflix
   ```

2. **Create a `.env.local` file** in the root directory:
   ```bash
   touch .env.local
   ```

3. **Open the file** in your text editor and add the variables below.

### File Location
```
subflix/
├── .env.local          ← Create this file
├── .env.example        ← Reference template
├── client/
├── server/
└── ...
```

---

## Step 2: Firebase Configuration

### Get Your Firebase Credentials

1. **Go to [Firebase Console](https://console.firebase.google.com/)**
2. **Create a new project** or select an existing one
3. **Click "Add app"** and select **Web**
4. **Copy your Firebase config** - it will look like this:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyDxxxxxxxxxxxxxxxxxxxxxx",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Add to `.env.local`

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

**Note**: All Firebase variables must start with `VITE_` to be accessible in the browser.

---

## Step 3: Google OAuth Configuration

### Setup Google OAuth Credentials

1. **Go to [Google Cloud Console](https://console.cloud.google.com/)**
2. **Create a new project** (or select existing)
3. **Enable the Google+ API**:
   - Search for "Google+ API"
   - Click "Enable"

4. **Create OAuth 2.0 Credentials**:
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     http://localhost:3000
     http://localhost:3000/
     https://yourdomain.com
     https://yourdomain.com/
     ```
   - Copy your **Client ID**

5. **In Firebase Console**:
   - Go to **Authentication** → **Sign-in method**
   - Enable **Google**
   - Paste your Google Client ID

### Add to `.env.local`

```env
# Google OAuth
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

---

## Step 4: Stripe Configuration (Optional - for Payment Processing)

### Setup Stripe Account

1. **Create a [Stripe account](https://stripe.com)**
2. **Get your API keys**:
   - Go to **Developers** → **API keys**
   - Copy **Publishable key** and **Secret key**

### Add to `.env.local`

```env
# Stripe (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxx
```

---

## Step 5: Analytics Configuration (Optional)

### Setup Umami Analytics (or Google Analytics)

If using **Umami Analytics**:

```env
# Analytics
VITE_ANALYTICS_ENDPOINT=https://your-umami-instance.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id
```

If using **Google Analytics**:

```env
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

---

## Step 6: Complete `.env.local` Example

Here's a complete example with all variables:

```env
# ============================================
# FIREBASE CONFIGURATION
# ============================================
VITE_FIREBASE_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxx
VITE_FIREBASE_AUTH_DOMAIN=subflix-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=subflix-project-id
VITE_FIREBASE_STORAGE_BUCKET=subflix-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# ============================================
# GOOGLE OAUTH
# ============================================
VITE_GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com

# ============================================
# STRIPE (Optional - for payments)
# ============================================
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxx
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxxxx

# ============================================
# ANALYTICS (Optional)
# ============================================
VITE_ANALYTICS_ENDPOINT=https://your-umami-instance.com
VITE_ANALYTICS_WEBSITE_ID=your-website-id

# ============================================
# APP CONFIGURATION
# ============================================
VITE_APP_NAME=Subflix
VITE_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 7: Update `.env.example`

Keep `.env.example` as a template for other developers:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_firebase_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain_here
VITE_FIREBASE_PROJECT_ID=your_firebase_project_id_here
VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket_here
VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id_here
VITE_FIREBASE_APP_ID=your_firebase_app_id_here

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here

# Stripe (Optional)
VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key_here
STRIPE_SECRET_KEY=your_stripe_secret_key_here

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=your_analytics_endpoint_here
VITE_ANALYTICS_WEBSITE_ID=your_analytics_website_id_here

# App Configuration
VITE_APP_NAME=Subflix
VITE_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## Step 8: Load Environment Variables in Code

### In `client/src/lib/firebase.ts`

The Firebase configuration is already set up to use environment variables:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

### In `client/src/components/GoogleLoginButton.tsx`

Google OAuth Client ID is used:

```typescript
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
```

---

## Step 9: Verify Environment Variables

### Test in Development

1. **Start the development server**:
   ```bash
   pnpm dev
   ```

2. **Check the browser console** (F12):
   - Open DevTools → Console
   - Type: `console.log(import.meta.env.VITE_FIREBASE_PROJECT_ID)`
   - You should see your Firebase project ID

3. **Test Firebase connection**:
   - Try logging in with Google
   - Check if authentication works
   - Verify Firestore connection in Firebase Console

---

## Step 10: Environment Variables for Deployment

### For Vercel Deployment

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Select your Subflix project**
3. **Go to Settings → Environment Variables**
4. **Add each variable**:
   - Key: `VITE_FIREBASE_API_KEY`
   - Value: Your Firebase API key
   - Environments: Production, Preview, Development

5. **Repeat for all variables** (except `STRIPE_SECRET_KEY` which is backend-only)

### For Other Platforms (Railway, Render, etc.)

Similar process:
1. Go to project settings
2. Find "Environment Variables" section
3. Add each variable from your `.env.local`
4. Redeploy the application

---

## Step 11: Security Best Practices

### Do's ✅
- **Keep `.env.local` in `.gitignore`** (already configured)
- **Use different keys for development and production**
- **Rotate API keys regularly**
- **Use Firebase Security Rules** to restrict database access
- **Enable HTTPS** for production

### Don'ts ❌
- **Never commit `.env.local` to Git**
- **Never share API keys in public repositories**
- **Never use production keys in development**
- **Never hardcode secrets in code**

### Check `.gitignore`

Ensure your `.gitignore` includes:
```
.env.local
.env.*.local
.env
node_modules/
dist/
.DS_Store
```

---

## Step 12: Troubleshooting

### Issue: "Firebase is not initialized"
**Solution**: Check that all `VITE_FIREBASE_*` variables are correctly set in `.env.local`

### Issue: "Google login not working"
**Solution**: 
- Verify `VITE_GOOGLE_CLIENT_ID` is correct
- Check that your domain is in Google OAuth authorized URIs
- Clear browser cache and cookies

### Issue: "Environment variables not loading"
**Solution**:
- Restart the dev server: `pnpm dev`
- Check that `.env.local` is in the root directory
- Ensure variables start with `VITE_` for browser access

### Issue: "Firestore connection fails"
**Solution**:
- Verify Firebase project ID is correct
- Check Firestore security rules in Firebase Console
- Ensure Firestore is enabled in your Firebase project

---

## Next Steps

1. **Create `.env.local`** with all variables
2. **Test locally** by running `pnpm dev`
3. **Verify Firebase connection** by logging in
4. **Set up Vercel environment variables** for deployment
5. **Deploy and test** on production

---

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Stripe API Documentation](https://stripe.com/docs/api)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

**Questions?** Refer to the main README.md or FIREBASE_SETUP.md for more details.
