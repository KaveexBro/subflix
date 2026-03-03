# Firebase Cloud Functions for Subflix

This guide explains the backend logic for subscription expiry and earnings tracking that should be implemented using Firebase Cloud Functions.

## Overview

Firebase Cloud Functions allow you to run backend code in response to events without managing servers. For Subflix, we'll use them for:

1. **Subscription Expiry**: Automatically mark subscriptions as expired
2. **Earnings Calculation**: Calculate creator earnings based on ratings and downloads
3. **User Stats Update**: Update user statistics in real-time
4. **Eligibility Check**: Automatically mark users as eligible for earnings when they reach 100 ratings

## Setup

### Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
firebase init functions
```

### Project Structure

```
functions/
├── src/
│   ├── index.ts              # Main entry point
│   ├── subscriptions.ts      # Subscription functions
│   ├── earnings.ts           # Earnings calculation
│   └── users.ts              # User statistics
├── package.json
└── tsconfig.json
```

## Implementation

### 1. Subscription Expiry Function

This function runs daily to check and expire subscriptions.

**File: `functions/src/subscriptions.ts`**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Daily function to check and expire subscriptions
 * Runs at 00:00 UTC every day
 */
export const expireSubscriptions = functions
  .pubsub.schedule('0 0 * * *')
  .timeZone('UTC')
  .onRun(async (context) => {
    try {
      const now = new Date();
      
      // Find all active subscriptions that have expired
      const expiredSubscriptions = await db
        .collection('subscriptions')
        .where('status', '==', 'active')
        .where('expiryDate', '<', now)
        .get();

      const batch = db.batch();
      let count = 0;

      // Update each expired subscription
      expiredSubscriptions.docs.forEach((doc) => {
        batch.update(doc.ref, {
          status: 'expired',
          updatedAt: now,
        });
        count++;
      });

      // Commit the batch
      if (count > 0) {
        await batch.commit();
        console.log(`Expired ${count} subscriptions`);
      }

      return { success: true, expiredCount: count };
    } catch (error) {
      console.error('Error expiring subscriptions:', error);
      throw error;
    }
  });

/**
 * Function triggered when a subscription is created
 * Updates user's Pro status
 */
export const onSubscriptionCreated = functions
  .firestore.document('subscriptions/{subscriptionId}')
  .onCreate(async (snap, context) => {
    try {
      const subscription = snap.data();
      const userId = subscription.userId;

      if (subscription.status === 'active') {
        // Update user's Pro status
        await db.collection('users').doc(userId).update({
          isPro: true,
          proExpiresAt: subscription.expiryDate,
          updatedAt: new Date(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  });

/**
 * Function triggered when a subscription expires
 * Removes Pro status from user
 */
export const onSubscriptionExpired = functions
  .firestore.document('subscriptions/{subscriptionId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check if subscription just expired
      if (before.status === 'active' && after.status === 'expired') {
        const userId = after.userId;

        // Update user's Pro status
        await db.collection('users').doc(userId).update({
          isPro: false,
          proExpiresAt: null,
          updatedAt: new Date(),
        });
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  });
```

### 2. Earnings Calculation Function

This function calculates creator earnings based on ratings and downloads.

**File: `functions/src/earnings.ts`**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

const EARNINGS_PER_RATING = 0.50; // LKR per rating
const EARNINGS_PER_DOWNLOAD = 0.10; // LKR per download

/**
 * Function triggered when a rating is created
 * Updates subtitle stats and creator earnings
 */
export const onRatingCreated = functions
  .firestore.document('ratings/{ratingId}')
  .onCreate(async (snap, context) => {
    try {
      const rating = snap.data();
      const subtitleId = rating.subtitleId;

      // Get the subtitle
      const subtitleSnap = await db
        .collection('subtitles')
        .doc(subtitleId)
        .get();

      if (!subtitleSnap.exists) {
        return { error: 'Subtitle not found' };
      }

      const subtitle = subtitleSnap.data()!;
      const uploaderId = subtitle.uploadedBy;

      // Calculate new average rating
      const totalRatings = subtitle.totalRatings + 1;
      const newAverageRating =
        (subtitle.ratings * subtitle.totalRatings + rating.rating) /
        totalRatings;

      // Check if creator is now eligible for earnings (≥100 ratings)
      const isEligibleForEarnings = totalRatings >= 100;

      // Update subtitle
      await db.collection('subtitles').doc(subtitleId).update({
        ratings: newAverageRating,
        totalRatings: totalRatings,
        isEligibleForEarnings: isEligibleForEarnings,
        updatedAt: new Date(),
      });

      // Update user's total ratings
      const userSnap = await db.collection('users').doc(uploaderId).get();
      if (userSnap.exists) {
        const user = userSnap.data()!;
        const newUserTotalRatings = (user.totalRatings || 0) + 1;

        await db.collection('users').doc(uploaderId).update({
          totalRatings: newUserTotalRatings,
          updatedAt: new Date(),
        });
      }

      // Calculate earnings for this rating
      const earningsAmount = EARNINGS_PER_RATING;

      // Update or create earnings record
      const earningsRef = db
        .collection('earnings')
        .doc(`${uploaderId}_${subtitleId}`);

      const earningsSnap = await earningsRef.get();
      if (earningsSnap.exists) {
        const earnings = earningsSnap.data()!;
        await earningsRef.update({
          totalEarnings: earnings.totalEarnings + earningsAmount,
          ratingCount: earnings.ratingCount + 1,
          updatedAt: new Date(),
        });
      } else {
        await earningsRef.set({
          creatorId: uploaderId,
          subtitleId: subtitleId,
          totalEarnings: earningsAmount,
          ratingCount: 1,
          downloadCount: 0,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      return { success: true, eligibleForEarnings: isEligibleForEarnings };
    } catch (error) {
      console.error('Error creating rating:', error);
      throw error;
    }
  });

/**
 * Function triggered when a subtitle is downloaded
 * Updates download count and creator earnings
 */
export const onSubtitleDownloaded = functions
  .firestore.document('subtitles/{subtitleId}')
  .onUpdate(async (change, context) => {
    try {
      const before = change.before.data();
      const after = change.after.data();

      // Check if download count increased
      if (after.downloads > before.downloads) {
        const downloadIncrease = after.downloads - before.downloads;
        const uploaderId = after.uploadedBy;
        const subtitleId = context.params.subtitleId;

        // Only calculate earnings if creator is eligible
        if (after.isEligibleForEarnings) {
          const earningsAmount = downloadIncrease * EARNINGS_PER_DOWNLOAD;

          // Update earnings record
          const earningsRef = db
            .collection('earnings')
            .doc(`${uploaderId}_${subtitleId}`);

          const earningsSnap = await earningsRef.get();
          if (earningsSnap.exists) {
            const earnings = earningsSnap.data()!;
            await earningsRef.update({
              totalEarnings: earnings.totalEarnings + earningsAmount,
              downloadCount: earnings.downloadCount + downloadIncrease,
              updatedAt: new Date(),
            });
          } else {
            await earningsRef.set({
              creatorId: uploaderId,
              subtitleId: subtitleId,
              totalEarnings: earningsAmount,
              ratingCount: 0,
              downloadCount: downloadIncrease,
              createdAt: new Date(),
              updatedAt: new Date(),
            });
          }
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Error updating downloads:', error);
      throw error;
    }
  });
```

### 3. User Statistics Function

This function maintains user statistics.

**File: `functions/src/users.ts`**

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const db = admin.firestore();

/**
 * Function triggered when a user is created
 * Initializes user statistics
 */
export const onUserCreated = functions
  .auth.user()
  .onCreate(async (user) => {
    try {
      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Anonymous',
        photoURL: user.photoURL || null,
        isAdmin: false,
        isPro: false,
        proExpiresAt: null,
        totalRatings: 0,
        totalEarnings: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.collection('users').doc(user.uid).set(userData);

      console.log(`User created: ${user.uid}`);
      return { success: true };
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  });

/**
 * Function triggered when a user is deleted
 * Cleans up user data
 */
export const onUserDeleted = functions
  .auth.user()
  .onDelete(async (user) => {
    try {
      const batch = db.batch();

      // Delete user profile
      batch.delete(db.collection('users').doc(user.uid));

      // Delete user's subtitles (optional - you might want to keep them)
      const subtitles = await db
        .collection('subtitles')
        .where('uploadedBy', '==', user.uid)
        .get();

      subtitles.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Delete user's subscriptions
      const subscriptions = await db
        .collection('subscriptions')
        .where('userId', '==', user.uid)
        .get();

      subscriptions.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      console.log(`User deleted: ${user.uid}`);
      return { success: true };
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  });
```

### 4. Main Entry Point

**File: `functions/src/index.ts`**

```typescript
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export * from './subscriptions';
export * from './earnings';
export * from './users';
```

## Deployment

### Deploy Functions

```bash
cd functions
firebase deploy --only functions
```

### Monitor Functions

```bash
# View logs
firebase functions:log

# View specific function logs
firebase functions:log --function=expireSubscriptions
```

## Testing Locally

### Install Emulator

```bash
firebase init emulators
firebase emulators:start
```

### Test Functions

```typescript
// Test subscription expiry
// Manually trigger or wait for scheduled time

// Test rating creation
// Create a rating document in Firestore emulator
```

## Monitoring and Alerts

### Set Up Monitoring

1. Go to Google Cloud Console
2. Navigate to **Cloud Functions**
3. Click on a function
4. Go to **Metrics** tab
5. Monitor execution time and errors

### Set Up Alerts

1. Go to **Monitoring** → **Alerting Policies**
2. Create alert for:
   - Function execution errors
   - High execution time
   - High memory usage

## Troubleshooting

### Function Not Triggering

- Check if trigger is properly configured
- Verify Firestore collection path matches
- Check Cloud Functions logs for errors

### Slow Execution

- Optimize Firestore queries
- Add indexes for frequently queried fields
- Consider batch operations

### High Costs

- Optimize number of function invocations
- Use batch operations to reduce calls
- Consider caching frequently accessed data

## Best Practices

1. **Error Handling**: Always wrap code in try-catch
2. **Logging**: Use console.log for debugging
3. **Timeouts**: Set appropriate timeout values
4. **Memory**: Allocate sufficient memory for functions
5. **Testing**: Test functions locally before deploying
6. **Monitoring**: Monitor function performance in production

## Future Enhancements

1. **Email Notifications**: Send emails for subscription expiry
2. **Payment Processing**: Integrate with Stripe/PayHere
3. **Batch Processing**: Process large datasets efficiently
4. **Caching**: Implement caching for frequently accessed data
5. **Analytics**: Track detailed user behavior

## Resources

- [Firebase Cloud Functions Documentation](https://firebase.google.com/docs/functions)
- [Firestore Triggers](https://firebase.google.com/docs/functions/firestore-events)
- [Pub/Sub Triggers](https://firebase.google.com/docs/functions/pubsub-events)
- [Cloud Scheduler](https://cloud.google.com/scheduler/docs)

---

For questions about Cloud Functions, contact: @KaveeshGimhan (Telegram)
