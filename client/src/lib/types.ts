// User document structure in Firestore
export interface User {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  isAdmin: boolean;
  isPro: boolean;
  proExpiresAt: Date | null;
  totalRatings: number;
  totalEarnings: number;
  createdAt: Date;
  updatedAt: Date;
}

// Subtitle document structure
export interface Subtitle {
  id: string;
  title: string;
  language: string; // 'sinhala'
  uploadedBy: string; // User UID
  uploaderName: string;
  uploaderPhotoURL: string | null;
  description: string;
  fileUrl: string; // External link (e.g. Google Drive) or Firebase Storage URL
  fileName: string; // Original .srt filename
  fileSize?: number; // in bytes (optional for external links)
  duration?: number; // in seconds (if available)
  posterUrl?: string; // Movie/TV show poster image URL
  movieTitle: string; // Movie/TV show name
  releaseYear: number;
  ratings: number; // Average rating
  totalRatings: number; // Number of ratings
  downloads: number;
  isVerified: boolean; // Verified by admin
  isEligibleForEarnings: boolean; // Uploader has ≥100 ratings
  createdAt: Date;
  updatedAt: Date;
}

// Rating document structure
export interface SubtitleRating {
  id: string;
  subtitleId: string;
  userId: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  updatedAt: Date;
}

// Subscription document structure
export interface Subscription {
  id: string;
  userId: string;
  plan: 'pro'; // Can extend for other plans
  price: number; // in LKR
  currency: string;
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiryDate: Date;
  stripePaymentId: string | null;
  paymentMethod: 'stripe' | 'manual' | 'payhere';
  createdAt: Date;
  updatedAt: Date;
}

// Admin earnings tracking
export interface CreatorEarnings {
  id: string;
  creatorId: string;
  creatorName: string;
  subtitleId: string;
  subtitleTitle: string;
  totalRatings: number;
  totalDownloads: number;
  earningsAmount: number; // in LKR
  period: string; // 'monthly', 'weekly'
  status: 'pending' | 'paid' | 'processing';
  createdAt: Date;
  updatedAt: Date;
}

// Admin log for tracking actions
export interface AdminLog {
  id: string;
  adminId: string;
  action: string;
  targetUserId?: string;
  targetSubtitleId?: string;
  details: Record<string, any>;
  createdAt: Date;
}
