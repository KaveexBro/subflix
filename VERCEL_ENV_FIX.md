# Fix: Environment Variable References Secret That Does Not Exist

## Error Message
```
Environment Variable "VITE_FIREBASE_API_KEY" references Secret "firebase_api_key", which does not exist.
```

## What This Means
Vercel is trying to use a Secret that wasn't created. This usually happens when environment variables are set up incorrectly in the Vercel dashboard.

---

## Quick Fix (5 Minutes)

### Step 1: Go to Vercel Project Settings
1. Go to **https://vercel.com/dashboard**
2. Click on your **"subflix"** project
3. Click **"Settings"** (top menu)

### Step 2: Remove Broken Environment Variables
1. Go to **"Environment Variables"**
2. Look for any variables that reference "Secret"
3. **Delete all environment variables** that have errors
4. You should see a list - delete each one

### Step 3: Add Environment Variables Correctly
1. Click **"Add New"** button
2. For each variable below, enter:

| Name | Value | Environments |
|---|---|---|
| `VITE_FIREBASE_API_KEY` | `AIzaSyCP1qWAT4B4RjRdEsyV3mwhaRSb_2bXV6c` | Production, Preview, Development |
| `VITE_FIREBASE_AUTH_DOMAIN` | `subflixz.firebaseapp.com` | Production, Preview, Development |
| `VITE_FIREBASE_PROJECT_ID` | `subflixz` | Production, Preview, Development |
| `VITE_FIREBASE_STORAGE_BUCKET` | `subflixz.firebasestorage.app` | Production, Preview, Development |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | `200733878516` | Production, Preview, Development |
| `VITE_FIREBASE_APP_ID` | `1:200733878516:web:0230a3083361b54eec16a1` | Production, Preview, Development |
| `VITE_GOOGLE_CLIENT_ID` | `your_google_client_id_here` | Production, Preview, Development |
| `VITE_APP_NAME` | `Subflix` | Production, Preview, Development |
| `VITE_APP_URL` | `https://subflix.vercel.app` | Production, Preview, Development |

### Step 4: Redeploy
1. Go to **"Deployments"** (top menu)
2. Find your latest deployment
3. Click the **three dots** (...)
4. Click **"Redeploy"**
5. Wait for the build to complete

---

## Detailed Steps with Screenshots

### Step 1: Open Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Select Your Project
- Click on **"subflix"** project

### Step 3: Go to Settings
- Click **"Settings"** in the top navigation bar

### Step 4: Go to Environment Variables
- In the left sidebar, click **"Environment Variables"**

### Step 5: Delete Broken Variables
1. Look at the list of environment variables
2. If any show an error or reference a Secret, **click the trash icon** to delete
3. Delete ALL environment variables (start fresh)

### Step 6: Add Variables One by One
1. Click **"Add New"**
2. Enter the variable name (e.g., `VITE_FIREBASE_API_KEY`)
3. Enter the value (e.g., `AIzaSyCP1qWAT4B4RjRdEsyV3mwhaRSb_2bXV6c`)
4. Select all three environments:
   - ✅ Production
   - ✅ Preview
   - ✅ Development
5. Click **"Save"**
6. Repeat for each variable

### Step 7: Redeploy
1. Click **"Deployments"** in the top menu
2. Find the latest deployment (at the top)
3. Click the **three dots** (...)
4. Click **"Redeploy"**
5. Wait 2-5 minutes for the build

---

## Complete Environment Variables List

Copy and paste these values exactly:

```
VITE_FIREBASE_API_KEY = AIzaSyCP1qWAT4B4RjRdEsyV3mwhaRSb_2bXV6c
VITE_FIREBASE_AUTH_DOMAIN = subflixz.firebaseapp.com
VITE_FIREBASE_PROJECT_ID = subflixz
VITE_FIREBASE_STORAGE_BUCKET = subflixz.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID = 200733878516
VITE_FIREBASE_APP_ID = 1:200733878516:web:0230a3083361b54eec16a1
VITE_GOOGLE_CLIENT_ID = your_google_client_id_here
VITE_APP_NAME = Subflix
VITE_APP_URL = https://subflix.vercel.app
```

---

## Troubleshooting

### Issue: Still Getting the Same Error
**Solution**:
1. Delete ALL environment variables
2. Wait 5 minutes
3. Add them again one by one
4. Redeploy

### Issue: Build Still Fails
**Solution**:
1. Go to **Deployments**
2. Click on the failed deployment
3. Scroll down to see the error message
4. Copy the error and search for it in this guide

### Issue: Can't Find Environment Variables Section
**Solution**:
1. Make sure you're in **Settings** (not Deployments)
2. Look in the left sidebar for **"Environment Variables"**
3. If you don't see it, try refreshing the page

### Issue: Variables Appear But Build Still Fails
**Solution**:
1. Go to **Deployments**
2. Click the failed deployment
3. Look for the error message
4. Common errors:
   - `VITE_GOOGLE_CLIENT_ID` is empty or wrong
   - Firebase credentials are incorrect
   - Missing a required variable

---

## Verification Checklist

After adding all variables, verify:

- [ ] All 9 environment variables are added
- [ ] No variables show error messages
- [ ] All variables have "Production", "Preview", "Development" selected
- [ ] You clicked **"Save"** for each variable
- [ ] You clicked **"Redeploy"** after adding all variables
- [ ] Build completed without errors
- [ ] Website loads at https://subflix.vercel.app

---

## If Still Not Working

### Option 1: Clear Cache and Try Again
1. Go to **Settings**
2. Scroll down to **"Build & Development Settings"**
3. Click **"Clear Cache"**
4. Go to **Deployments**
5. Click **Redeploy**

### Option 2: Delete Project and Start Over
1. Go to **Settings**
2. Scroll to **"Danger Zone"**
3. Click **"Delete Project"**
4. Go back to dashboard
5. Click **"Add New" → "Project"**
6. Import your GitHub repository again
7. Add environment variables carefully
8. Deploy

### Option 3: Contact Vercel Support
If nothing works:
1. Go to **https://vercel.com/support**
2. Create a support ticket
3. Include:
   - Your project name: `subflix`
   - The error message
   - Screenshot of environment variables

---

## Why This Happened

Vercel sometimes creates "Secrets" instead of regular environment variables. Secrets are for sensitive data and work differently. We need regular environment variables for your Firebase config.

The fix is to:
1. Delete the broken Secrets
2. Add regular environment variables instead
3. Redeploy

---

## Success!

Once the build completes successfully, you'll see:
- ✅ Green checkmark on the deployment
- ✅ Your website loads at https://subflix.vercel.app
- ✅ No error messages

**Congratulations! Your Subflix app is now live!** 🚀
