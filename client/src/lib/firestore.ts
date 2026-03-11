import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  QueryConstraint,
  updateDoc,
  deleteDoc,
  addDoc,
  increment,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Subtitle, SubtitleRating, Subscription, CreatorEarnings } from './types';

// ============ USER OPERATIONS ============

export const createUserProfile = async (uid: string, email: string, displayName: string, photoURL: string | null) => {
  const userRef = doc(db, 'users', uid);
  const userData: Omit<User, 'uid'> = {
    email,
    displayName,
    photoURL,
    isAdmin: false,
    isPro: false,
    proExpiresAt: null,
    totalRatings: 0,
    totalEarnings: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    isUploader: false,
    isPendingUploader: false,
  };
  await setDoc(userRef, userData);
};

export const getUserProfile = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    return { uid, ...userSnap.data() } as User;
  }
  return null;
};

export const updateUserProfile = async (uid: string, updates: Partial<User>) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const activateProSubscription = async (uid: string, expiryDate: Date) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isPro: true,
    proExpiresAt: expiryDate,
    updatedAt: new Date(),
  });
};

export const deactivateProSubscription = async (uid: string) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isPro: false,
    proExpiresAt: null,
    updatedAt: new Date(),
  });
};

// ============ SUBTITLE OPERATIONS ============

export const uploadSubtitle = async (
  uploadedBy: string,
  uploaderName: string,
  uploaderPhotoURL: string | null,
  subtitle: Omit<Subtitle, 'id' | 'createdAt' | 'updatedAt'>
) => {
  const subtitlesRef = collection(db, 'subtitles');
  const docRef = await addDoc(subtitlesRef, {
    ...subtitle,
    uploadedBy,
    uploaderName,
    uploaderPhotoURL,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  return docRef.id;
};

export const getSubtitle = async (subtitleId: string): Promise<Subtitle | null> => {
  const subtitleRef = doc(db, 'subtitles', subtitleId);
  const subtitleSnap = await getDoc(subtitleRef);
  if (subtitleSnap.exists()) {
    return { id: subtitleId, ...subtitleSnap.data() } as Subtitle;
  }
  return null;
};

export const getSubtitles = async (
  constraints: QueryConstraint[] = [],
  pageSize: number = 20,
  lastDoc?: any
) => {
  const subtitlesRef = collection(db, 'subtitles');
  let q = query(
    subtitlesRef,
    orderBy('createdAt', 'desc'),
    ...constraints,
    limit(pageSize + 1)
  );

  if (lastDoc) {
    q = query(
      subtitlesRef,
      orderBy('createdAt', 'desc'),
      ...constraints,
      startAfter(lastDoc),
      limit(pageSize + 1)
    );
  }

  const querySnapshot = await getDocs(q);
  const subtitles: Subtitle[] = [];
  let nextLastDoc = null;

  querySnapshot.forEach((doc) => {
    if (subtitles.length < pageSize) {
      subtitles.push({ id: doc.id, ...doc.data() } as Subtitle);
    } else {
      nextLastDoc = doc;
    }
  });

  return { subtitles, nextLastDoc };
};

export const searchSubtitles = async (searchTerm: string, pageSize: number = 20) => {
  const subtitlesRef = collection(db, 'subtitles');
  const q = query(
    subtitlesRef,
    where('movieTitle', '>=', searchTerm),
    where('movieTitle', '<=', searchTerm + '\uf8ff'),
    orderBy('movieTitle'),
    orderBy('createdAt', 'desc'),
    limit(pageSize)
  );

  const querySnapshot = await getDocs(q);
  const subtitles: Subtitle[] = [];
  querySnapshot.forEach((doc) => {
    subtitles.push({ id: doc.id, ...doc.data() } as Subtitle);
  });

  return subtitles;
};

export const getEpisodesByShow = async (movieTitle: string) => {
  const subtitlesRef = collection(db, 'subtitles');
  const q = query(
    subtitlesRef,
    where('movieTitle', '==', movieTitle),
    where('type', '==', 'tv'),
    orderBy('season', 'asc'),
    orderBy('episode', 'asc')
  );

  const querySnapshot = await getDocs(q);
  const subtitles: Subtitle[] = [];
  querySnapshot.forEach((doc) => {
    subtitles.push({ id: doc.id, ...doc.data() } as Subtitle);
  });

  return subtitles;
};

export const getSubtitlesByUploader = async (uploaderId: string) => {
  const subtitlesRef = collection(db, 'subtitles');
  const q = query(
    subtitlesRef,
    where('uploadedBy', '==', uploaderId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const subtitles: Subtitle[] = [];
  querySnapshot.forEach((doc) => {
    subtitles.push({ id: doc.id, ...doc.data() } as Subtitle);
  });

  return subtitles;
};

export const updateSubtitle = async (subtitleId: string, updates: Partial<Subtitle>) => {
  const subtitleRef = doc(db, 'subtitles', subtitleId);
  await updateDoc(subtitleRef, {
    ...updates,
    updatedAt: new Date(),
  });
};

export const deleteSubtitle = async (subtitleId: string) => {
  const subtitleRef = doc(db, 'subtitles', subtitleId);
  await deleteDoc(subtitleRef);
};

export const incrementSubtitleDownloads = async (subtitleId: string) => {
  const subtitleRef = doc(db, 'subtitles', subtitleId);
  await updateDoc(subtitleRef, {
    downloads: increment(1),
  });
};

// ============ RATING OPERATIONS ============

export const rateSubtitle = async (
  subtitleId: string,
  userId: string,
  rating: number,
  review: string = ''
) => {
  const ratingsRef = collection(db, 'ratings');
  const docRef = await addDoc(ratingsRef, {
    subtitleId,
    userId,
    rating,
    review,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Update subtitle average rating
  const subtitleRef = doc(db, 'subtitles', subtitleId);
  const subtitleSnap = await getDoc(subtitleRef);
  if (subtitleSnap.exists()) {
    const currentData = subtitleSnap.data();
    const currentRatings = currentData.ratings || 0;
    const totalRatings = (currentData.totalRatings || 0) + 1;
    const newAverageRating = (currentRatings * (totalRatings - 1) + rating) / totalRatings;

    await updateDoc(subtitleRef, {
      ratings: newAverageRating,
      totalRatings: totalRatings,
    });

    // Update uploader's total ratings
    const uploaderRef = doc(db, 'users', currentData.uploadedBy);
    await updateDoc(uploaderRef, {
      totalRatings: increment(1),
    });

    // Check if uploader is now eligible for earnings
    if (totalRatings >= 100) {
      await updateDoc(subtitleRef, {
        isEligibleForEarnings: true,
      });
    }
  }

  return docRef.id;
};

export const getSubtitleRatings = async (subtitleId: string) => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(
    ratingsRef,
    where('subtitleId', '==', subtitleId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const ratings: SubtitleRating[] = [];
  querySnapshot.forEach((doc) => {
    ratings.push({ id: doc.id, ...doc.data() } as SubtitleRating);
  });

  return ratings;
};

export const getUserRating = async (subtitleId: string, userId: string) => {
  const ratingsRef = collection(db, 'ratings');
  const q = query(
    ratingsRef,
    where('subtitleId', '==', subtitleId),
    where('userId', '==', userId)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as SubtitleRating;
  }

  return null;
};

// ============ SUBSCRIPTION OPERATIONS ============

export const createSubscription = async (
  userId: string,
  plan: string,
  price: number,
  expiryDate: Date,
  paymentMethod: 'stripe' | 'manual' | 'payhere' = 'manual',
  stripePaymentId?: string
) => {
  const subscriptionsRef = collection(db, 'subscriptions');
  const docRef = await addDoc(subscriptionsRef, {
    userId,
    plan,
    price,
    currency: 'LKR',
    status: 'active',
    startDate: new Date(),
    expiryDate,
    stripePaymentId: stripePaymentId || null,
    paymentMethod,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  // Activate pro subscription for user
  await activateProSubscription(userId, expiryDate);

  return docRef.id;
};

export const getUserSubscription = async (userId: string): Promise<Subscription | null> => {
  const subscriptionsRef = collection(db, 'subscriptions');
  const q = query(
    subscriptionsRef,
    where('userId', '==', userId),
    where('status', '==', 'active'),
    orderBy('expiryDate', 'desc'),
    limit(1)
  );

  const querySnapshot = await getDocs(q);
  if (!querySnapshot.empty) {
    const doc = querySnapshot.docs[0];
    return { id: doc.id, ...doc.data() } as Subscription;
  }

  return null;
};

export const expireSubscription = async (subscriptionId: string, userId: string) => {
  const subscriptionRef = doc(db, 'subscriptions', subscriptionId);
  await updateDoc(subscriptionRef, {
    status: 'expired',
    updatedAt: new Date(),
  });

  // Deactivate pro subscription for user
  await deactivateProSubscription(userId);
};

// ============ ADMIN OPERATIONS ============

export const getAllUsers = async () => {
  const usersRef = collection(db, 'users');
  const querySnapshot = await getDocs(usersRef);
  const users: User[] = [];
  querySnapshot.forEach((doc) => {
    users.push({ uid: doc.id, ...doc.data() } as User);
  });
  return users;
};

export const setUserAsAdmin = async (uid: string, isAdmin: boolean) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isAdmin,
    updatedAt: new Date(),
  });
};

export const approveUploader = async (uid: string, isApproved: boolean) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, {
    isUploader: isApproved,
    isPendingUploader: false,
    updatedAt: new Date(),
  });
};

export const getCreatorEarnings = async (creatorId: string) => {
  const earningsRef = collection(db, 'earnings');
  const q = query(
    earningsRef,
    where('creatorId', '==', creatorId),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const earnings: CreatorEarnings[] = [];
  querySnapshot.forEach((doc) => {
    earnings.push({ id: doc.id, ...doc.data() } as CreatorEarnings);
  });

  return earnings;
};

export const calculateAndRecordEarnings = async (creatorId: string, period: string) => {
  // Get all subtitles by creator
  const subtitles = await getSubtitlesByUploader(creatorId);

  // Calculate earnings based on ratings and downloads
  let totalEarnings = 0;
  for (const subtitle of subtitles) {
    if (subtitle.isEligibleForEarnings) {
      // Example: LKR 0.50 per rating, LKR 0.10 per download
      const ratingEarnings = subtitle.totalRatings * 0.5;
      const downloadEarnings = subtitle.downloads * 0.1;
      totalEarnings += ratingEarnings + downloadEarnings;
    }
  }

  // Record earnings
  const earningsRef = collection(db, 'earnings');
  const totalRatings = subtitles.reduce((sum: number, s) => sum + s.totalRatings, 0);
  const totalDownloads = subtitles.reduce((sum: number, s) => sum + s.downloads, 0);
  const docRef = await addDoc(earningsRef, {
    creatorId,
    subtitles: subtitles.map((s) => ({ id: s.id, title: s.title })),
    totalRatings,
    totalDownloads,
    earningsAmount: totalEarnings,
    period,
    status: 'pending',
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  return docRef.id;
};
