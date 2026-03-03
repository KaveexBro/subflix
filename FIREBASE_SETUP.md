# Firebase Setup Guide for Subflix

This guide provides step-by-step instructions to set up Firebase for the Subflix platform.

## Prerequisites

- Google account
- Firebase project (free tier is sufficient)
- Node.js and pnpm installed

## Step 1: Create Firebase Project

1. Visit [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `Subflix`
4. Accept the terms and click **"Create project"**
5. Wait for project creation to complete (2-3 minutes)

## Step 2: Enable Authentication

### Google Sign-In Setup

1. In Firebase Console, navigate to **Authentication** (left sidebar)
2. Click **"Get Started"**
3. Click on **"Google"** provider
4. Toggle **"Enable"** to ON
5. Select your email as the project support email
6. Click **"Save"**

### Add Authorized Domains

1. Go to **Authentication** → **Settings** (gear icon)
2. Scroll to **Authorized domains**
3. Add these domains:
   - `localhost` (for development)
   - `your-domain.com` (your production domain)
   - `your-project.vercel.app` (if deploying to Vercel)

## Step 3: Create Firestore Database

1. In Firebase Console, go to **Firestore Database** (left sidebar)
2. Click **"Create database"**
3. Choose **"Start in production mode"**
4. Select a region:
   - For Asia: `asia-south1` (Mumbai) or `asia-southeast1` (Singapore)
   - For US: `us-central1`
5. Click **"Enable"**

### Create Collections

The collections will be created automatically when you first write data. However, you can pre-create them:

1. Click **"Start collection"**
2. Create the following collections:
   - `users`
   - `subtitles`
   - `ratings`
   - `subscriptions`
   - `earnings`

## Step 4: Set Up Cloud Storage

1. In Firebase Console, go to **Storage** (left sidebar)
2. Click **"Get Started"**
3. Choose **"Start in production mode"**
4. Select the same region as Firestore
5. Click **"Done"**

## Step 5: Configure Security Rules

### Firestore Security Rules

1. Go to **Firestore Database** → **Rules** tab
2. Replace the default rules with:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth != null;
      allow write: if request.auth.uid == userId;
    }

    // Subtitles collection - public read, authenticated write
    match /subtitles/{subtitleId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.uploadedBy == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.uploadedBy || 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Ratings collection
    match /ratings/{ratingId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null && request.resource.data.userId == request.auth.uid;
      allow update, delete: if request.auth.uid == resource.data.userId;
    }

    // Subscriptions collection
    match /subscriptions/{subscriptionId} {
      allow read: if request.auth.uid == resource.data.userId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow create, update: if request.auth.uid == resource.data.userId || 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }

    // Earnings collection
    match /earnings/{earningId} {
      allow read: if request.auth.uid == resource.data.creatorId || 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
      allow create, update: if get(/databases/$(database)/documents/users/$(request.auth.uid)).data.isAdmin == true;
    }
  }
}
```

3. Click **"Publish"**

### Storage Security Rules

1. Go to **Storage** → **Rules** tab
2. Replace the default rules with:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /subtitles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.name.matches('.*\\.srt$') &&
                      request.resource.size < 10 * 1024 * 1024;
      allow delete: if request.auth.uid == userId;
    }
  }
}
```

3. Click **"Publish"**

## Step 6: Get Firebase Credentials

1. In Firebase Console, click the **gear icon** (Project Settings)
2. Go to **Your apps** section
3. Click **"Web"** app (or create one if not exists)
4. Copy the Firebase config object:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

## Step 7: Set Up Google OAuth

### In Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Select your Firebase project
3. Go to **APIs & Services** → **Credentials**
4. Click **"Create Credentials"** → **"OAuth 2.0 Client ID"**
5. Choose **"Web application"**
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - `https://your-domain.com`
   - `https://your-domain.com/login`
7. Click **"Create"**
8. Copy the **Client ID**

## Step 8: Configure Environment Variables

Create `.env.local` file in your project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_MESSAGING_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID

# Google OAuth
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID

# Application
VITE_APP_NAME=Subflix
VITE_APP_URL=http://localhost:3000
```

## Step 9: Test Firebase Connection

1. Start the development server:
```bash
pnpm dev
```

2. Navigate to `http://localhost:3000`
3. Click "Sign in with Google"
4. Complete the Google OAuth flow
5. Check Firebase Console to verify user was created in `users` collection

## Step 10: Create First Admin User

1. In Firebase Console, go to **Firestore Database** → **Data**
2. Click on `users` collection
3. Find your user document
4. Click the document ID
5. Click **"Edit"** on the document
6. Add/update field: `isAdmin: true`
7. Click **"Update"**

## Firestore Indexes

For optimal query performance, create these indexes:

### Index 1: Subtitles by Creation Date
- Collection: `subtitles`
- Fields: `createdAt` (Descending)

### Index 2: Ratings by Subtitle
- Collection: `ratings`
- Fields: `subtitleId` (Ascending), `createdAt` (Descending)

### Index 3: Subscriptions by User
- Collection: `subscriptions`
- Fields: `userId` (Ascending), `expiryDate` (Descending)

Firestore will suggest creating these indexes when you run queries.

## Backup and Recovery

### Enable Automatic Backups

1. Go to **Firestore Database** → **Backups**
2. Click **"Create Schedule"**
3. Set backup frequency (daily recommended)
4. Choose retention period (30 days minimum)

### Manual Backup

1. Go to **Firestore Database** → **Backups**
2. Click **"Create Backup"**
3. Name it with date (e.g., `backup-2024-03-02`)
4. Click **"Create"**

## Monitoring and Quotas

### View Usage

1. Go to **Firestore Database** → **Usage**
2. Monitor:
   - Document reads
   - Document writes
   - Document deletes
   - Storage used

### Quotas (Free Tier)
- 50,000 reads/day
- 20,000 writes/day
- 20,000 deletes/day
- 1 GB storage

### Upgrade to Paid Plan

If you exceed free tier limits:
1. Go to **Billing** in Firebase Console
2. Click **"Upgrade to Blaze plan"**
3. Set daily budget limits
4. Add payment method

## Troubleshooting

### Issue: "Permission denied" errors

**Solution:**
- Check Firestore Security Rules
- Verify user is authenticated
- Check if user UID matches the rule conditions

### Issue: Firebase not initializing

**Solution:**
- Verify environment variables are correct
- Check `.env.local` file exists
- Restart development server: `pnpm dev`

### Issue: Google OAuth not working

**Solution:**
- Verify Google Client ID is correct
- Check authorized redirect URIs include your domain
- Clear browser cookies and cache
- Check Firebase Authentication is enabled

### Issue: Storage upload fails

**Solution:**
- Check Storage Security Rules
- Verify file is .srt format
- Verify file size < 10MB
- Check user is authenticated

## Next Steps

1. Configure your application with Firebase credentials
2. Create your first admin user
3. Test the authentication flow
4. Deploy to production (Vercel, etc.)
5. Update authorized domains in Firebase and Google Cloud

## Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/start)
- [Firebase Storage Rules](https://firebase.google.com/docs/storage/security)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)

---

For issues or questions, contact: @KaveeshGimhan (Telegram)
