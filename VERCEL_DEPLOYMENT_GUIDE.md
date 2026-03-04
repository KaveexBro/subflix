# Vercel Deployment Guide for Subflix

This guide walks you through deploying Subflix to Vercel directly from your GitHub repository.

---

## Prerequisites

Before deploying, make sure you have:
- ✅ GitHub repository created (`https://github.com/KaveexBro/subflix`)
- ✅ Firebase project set up
- ✅ Google OAuth credentials
- ✅ Vercel account (free tier available)

---

## Step 1: Create a Vercel Account

1. **Go to [Vercel](https://vercel.com/)**
2. **Click "Sign Up"**
3. **Choose "Continue with GitHub"**
4. **Authorize Vercel to access your GitHub account**

---

## Step 2: Import Your GitHub Repository

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "Add New..." → "Project"**
3. **Select "Import Git Repository"**
4. **Search for "subflix"** in your repositories
5. **Click "Import"**

---

## Step 3: Configure Project Settings

### Framework & Build Settings

Vercel should auto-detect the following:
- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

If not auto-detected, set them manually.

---

## Step 4: Add Environment Variables

This is the most important step! You need to add all your Firebase and Google OAuth credentials.

### Method 1: Add via Vercel Dashboard (Recommended)

1. **In the import dialog, scroll down to "Environment Variables"**
2. **Add each variable**:

| Variable Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCP1qWAT4B4RjRdEsyV3mwhaRSb_2bXV6c` |
| `VITE_FIREBASE_AUTH_DOMAIN` | `subflixz.firebaseapp.com` |
| `VITE_FIREBASE_PROJECT_ID` | `subflixz` |
| `VITE_FIREBASE_STORAGE_BUCKET` | `subflixz.firebasestorage.app` |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `200733878516` |
| `VITE_FIREBASE_APP_ID` | `1:200733878516:web:0230a3083361b54eec16a1` |
| `VITE_GOOGLE_CLIENT_ID` | `your_google_client_id_here` |
| `VITE_APP_NAME` | `Subflix` |
| `VITE_APP_URL` | `https://subflix.vercel.app` |

3. **Click "Deploy"**

### Method 2: Add After Deployment

If you missed adding environment variables:

1. **Go to your Vercel project**
2. **Click "Settings"**
3. **Go to "Environment Variables"**
4. **Add each variable** with the values above
5. **Go to "Deployments"**
6. **Click the three dots on the latest deployment**
7. **Select "Redeploy"**

---

## Step 5: Wait for Deployment

1. **Vercel will start building your project**
2. **You'll see a progress indicator**
3. **Once complete, you'll get a deployment URL** (e.g., `https://subflix.vercel.app`)

---

## Step 6: Test Your Deployment

### Test Firebase Connection

1. **Open your Vercel URL** in a browser
2. **Try to sign in with Google**
3. **Check if authentication works**
4. **Go to Firebase Console** and verify data is being saved

### Test Firestore

1. **Open Firebase Console**
2. **Go to Firestore Database**
3. **Check if collections are being created**
4. **Verify user data is being stored**

---

## Step 7: Configure Custom Domain (Optional)

### Add Your Own Domain

1. **Go to your Vercel project settings**
2. **Click "Domains"**
3. **Enter your domain** (e.g., `subflix.com`)
4. **Follow the DNS configuration instructions**
5. **Wait for DNS to propagate** (usually 24-48 hours)

### Use Vercel's Default Domain

Your app is automatically available at:
```
https://subflix.vercel.app
```

---

## Step 8: Set Up Automatic Deployments

### Enable Auto-Deploy on GitHub Push

1. **Go to your Vercel project**
2. **Click "Settings" → "Git"**
3. **Ensure "Deploy on Push" is enabled** (default)
4. **Now every push to `main` branch will auto-deploy**

---

## Step 9: Monitor Your Deployment

### View Logs

1. **Go to "Deployments"** in Vercel
2. **Click on a deployment**
3. **View build logs and errors**

### Check Performance

1. **Go to "Analytics"** in Vercel
2. **Monitor page load times**
3. **Check error rates**

---

## Troubleshooting

### Issue: "Build Failed"

**Check the logs**:
1. Go to Deployments
2. Click the failed deployment
3. Scroll to see error messages

**Common causes**:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Solution**:
- Add missing environment variables
- Fix TypeScript errors locally
- Push the fix to GitHub
- Vercel will auto-redeploy

### Issue: "Firebase is not initialized"

**Cause**: Missing or incorrect Firebase environment variables

**Solution**:
1. Go to Settings → Environment Variables
2. Verify all `VITE_FIREBASE_*` variables are correct
3. Redeploy the project

### Issue: "Google Login Not Working"

**Cause**: Google OAuth not configured for your domain

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Go to OAuth 2.0 credentials
3. Add your Vercel domain to authorized URIs:
   ```
   https://subflix.vercel.app
   https://subflix.vercel.app/
   ```
4. Redeploy on Vercel

### Issue: "Blank Page or 404"

**Cause**: Build output directory incorrect

**Solution**:
1. Go to Settings → Build & Development Settings
2. Verify Output Directory is `dist`
3. Redeploy

---

## Environment Variables Reference

### Required Variables

```env
# Firebase (Required)
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value

# Google OAuth (Required)
VITE_GOOGLE_CLIENT_ID=your_value
```

### Optional Variables

```env
# Stripe (Optional - for payments)
VITE_STRIPE_PUBLISHABLE_KEY=your_value
STRIPE_SECRET_KEY=your_value

# Analytics (Optional)
VITE_ANALYTICS_ENDPOINT=your_value
VITE_ANALYTICS_WEBSITE_ID=your_value

# App Config
VITE_APP_NAME=Subflix
VITE_APP_URL=https://subflix.vercel.app
```

---

## Post-Deployment Checklist

- [ ] Deployment completed successfully
- [ ] No build errors in logs
- [ ] Website loads without errors
- [ ] Google login works
- [ ] Firebase connection works
- [ ] Data is being saved to Firestore
- [ ] Custom domain configured (if applicable)
- [ ] Auto-deploy on push is enabled

---

## Next Steps

1. **Test all features** on production
2. **Set up Firebase Security Rules** for production
3. **Configure Stripe** for payment processing
4. **Set up monitoring** and error tracking
5. **Create backup strategy** for your database

---

## Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Firebase Hosting vs Vercel](https://firebase.google.com/docs/hosting)
- [Environment Variables in Vercel](https://vercel.com/docs/concepts/projects/environment-variables)

---

## Support

If you encounter issues:

1. **Check Vercel logs** for error messages
2. **Review this guide** for troubleshooting
3. **Check Firebase Console** for data issues
4. **Verify environment variables** are correct
5. **Test locally** with `pnpm dev` before pushing

---

**Your Subflix app is now live on Vercel! 🚀**
