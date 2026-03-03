# Subflix - Sinhala Subtitle Community Platform

A full-stack web application for Sinhala subtitle enthusiasts and creators. Browse, download, upload, and earn rewards for high-quality subtitles.

## Features

### For Users
- **Google Login Authentication**: Secure authentication with Google OAuth
- **Browse Subtitles**: Discover thousands of Sinhala subtitles with ratings and uploader info
- **Download Subtitles**: Fast downloads with Pro membership benefits
- **Rate & Review**: Share your feedback on subtitles
- **User Profile**: Manage your account and subscription status
- **Pro Subscription**: LKR 100/month for ad-free experience and faster downloads

### For Creators
- **Upload Subtitles**: Share your subtitle creations (.srt format)
- **Earn Rewards**: Get paid when you reach 100+ ratings
- **Track Performance**: Monitor downloads, ratings, and earnings
- **Eligibility System**: Transparent criteria for earning eligibility

### For Admins
- **User Management**: Manage users, assign admin roles, track subscriptions
- **Content Moderation**: Verify subtitles, delete inappropriate content
- **Analytics Dashboard**: Monitor platform statistics and earnings
- **Subscription Control**: Approve/manage Pro subscriptions

## Tech Stack

### Frontend
- **React 19** with **Vite** for fast development
- **TypeScript** for type safety
- **TailwindCSS 4** for responsive design
- **shadcn/ui** for accessible components
- **Wouter** for client-side routing
- **Zustand** for state management (optional)
- **Firebase SDK** for backend integration

### Backend
- **Firebase Authentication** for Google Login
- **Firestore** for real-time database
- **Firebase Storage** for subtitle file storage
- **Firebase Cloud Functions** for backend logic (optional)

### Design
- **Modern Minimalist** aesthetic with warm saffron accents
- **Dark theme** for reduced eye strain
- **Mobile-first** responsive design
- **Accessible** WCAG compliant components

## Project Structure

```
subflix/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Browse subtitles
│   │   │   ├── Login.tsx             # Google Login
│   │   │   ├── Upload.tsx            # Upload subtitles
│   │   │   ├── SubtitleDetail.tsx    # View & rate subtitles
│   │   │   ├── Profile.tsx           # User profile & subscription
│   │   │   ├── Admin.tsx             # Admin dashboard
│   │   │   └── NotFound.tsx          # 404 page
│   │   ├── components/
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── GoogleLoginButton.tsx # Google OAuth button
│   │   │   ├── ProtectedRoute.tsx    # Route protection
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx       # Authentication context
│   │   │   └── ThemeContext.tsx      # Theme management
│   │   ├── lib/
│   │   │   ├── firebase.ts           # Firebase config
│   │   │   ├── firestore.ts          # Firestore operations
│   │   │   ├── types.ts              # TypeScript types
│   │   │   └── utils.ts              # Utility functions
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # Entry point
│   │   └── index.css                 # Global styles
│   ├── public/                       # Static assets
│   └── index.html                    # HTML template
├── server/                           # Express server (static hosting)
├── package.json                      # Dependencies
└── vite.config.ts                    # Vite configuration
```

## Getting Started

### Prerequisites
- Node.js 18+ and pnpm
- Firebase project with Firestore, Authentication, and Storage enabled
- Google OAuth credentials for authentication

### 1. Firebase Setup

#### Create a Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a new project"
3. Name it "Subflix" and enable Google Analytics
4. Wait for project creation to complete

#### Enable Authentication
1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Enable **Google** as a sign-in provider
4. Add your domain to authorized domains (e.g., localhost:3000, your-domain.com)

#### Create Firestore Database
1. Go to **Firestore Database**
2. Click **Create database**
3. Start in **Production mode**
4. Choose a region close to your users
5. Click **Enable**

#### Set Up Storage
1. Go to **Storage**
2. Click **Get started**
3. Start in **Production mode**
4. Choose the same region as Firestore

#### Get Firebase Credentials
1. Go to **Project Settings** (gear icon)
2. Click **Your apps** section
3. Create a new Web app
4. Copy the Firebase config object
5. You'll need these values for environment variables

### 2. Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
5. Choose **Web application**
6. Add authorized redirect URIs:
   - `http://localhost:3000`
   - `http://localhost:3000/login`
   - Your production domain
7. Copy the **Client ID** for later use

### 3. Firestore Security Rules

Replace the default Firestore rules with these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection - only users can read/write their own profile
    match /users/{userId} {
      allow read: if request.auth.uid == userId || request.auth.uid != null;
      allow write: if request.auth.uid == userId;
      allow read: if resource.data.isAdmin == true && request.auth != null;
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

    // Subscriptions collection - users can read own, admins can read all
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

### 4. Firebase Storage Rules

Replace the default Storage rules:

```
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /subtitles/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if request.auth.uid == userId && 
                      request.resource.name.matches('.*\\.srt$') &&
                      request.resource.size < 10 * 1024 * 1024;
    }
  }
}
```

### 5. Environment Variables

Create a `.env.local` file in the project root:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Google OAuth
VITE_GOOGLE_CLIENT_ID=your_google_client_id

# Application
VITE_APP_NAME=Subflix
VITE_APP_URL=http://localhost:3000
```

### 6. Install Dependencies

```bash
pnpm install
```

### 7. Start Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

## Database Schema

### Users Collection
```typescript
{
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
```

### Subtitles Collection
```typescript
{
  id: string;
  title: string;
  language: 'sinhala';
  uploadedBy: string; // User UID
  uploaderName: string;
  uploaderPhotoURL: string | null;
  description: string;
  fileUrl: string; // Firebase Storage URL
  fileName: string;
  fileSize: number;
  duration: number;
  movieTitle: string;
  releaseYear: number;
  ratings: number; // Average rating
  totalRatings: number;
  downloads: number;
  isVerified: boolean;
  isEligibleForEarnings: boolean; // ≥100 ratings
  createdAt: Date;
  updatedAt: Date;
}
```

### Ratings Collection
```typescript
{
  id: string;
  subtitleId: string;
  userId: string;
  rating: number; // 1-5
  review: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Subscriptions Collection
```typescript
{
  id: string;
  userId: string;
  plan: 'pro';
  price: number; // 100 LKR
  currency: 'LKR';
  status: 'active' | 'expired' | 'cancelled';
  startDate: Date;
  expiryDate: Date;
  stripePaymentId: string | null;
  paymentMethod: 'stripe' | 'manual' | 'payhere';
  createdAt: Date;
  updatedAt: Date;
}
```

## Earnings System

### Eligibility Criteria
- Creators become eligible for earnings when they reach **≥100 user ratings**
- Only verified subtitles count towards earnings

### Earnings Calculation
- **Per Rating**: LKR 0.50
- **Per Download**: LKR 0.10

Example: A subtitle with 150 ratings and 500 downloads earns:
- Ratings: 150 × 0.50 = LKR 75
- Downloads: 500 × 0.10 = LKR 50
- **Total: LKR 125**

## Subscription Management

### Pro Features (LKR 100/month)
- Ad-free experience
- Faster downloads
- Priority support
- Advanced analytics

### Subscription Flow
1. User clicks "Upgrade to Pro"
2. Admin creates subscription record (manual approval)
3. User is notified to contact @KaveeshGimhan for payment
4. Admin verifies payment and activates Pro features
5. Subscription auto-expires after 30 days unless renewed

## Admin Dashboard

### Access
- Only users with `isAdmin: true` can access `/admin`
- Promote users to admin via Admin Dashboard

### Features
- **User Management**: View all users, assign admin roles, track subscriptions
- **Content Moderation**: Verify subtitles, delete inappropriate content
- **Analytics**: Monitor platform statistics
- **Earnings Tracking**: View creator earnings and payment status

### Admin Contact
For subscription approvals and user management: **@KaveeshGimhan** (Telegram)

## Deployment

### Deploy to Vercel

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/subflix.git
git push -u origin main
```

2. **Connect to Vercel**
   - Go to [Vercel](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select "Subflix" project

3. **Configure Environment Variables**
   - Add all Firebase and Google OAuth credentials
   - Set `VITE_APP_URL` to your Vercel domain

4. **Deploy**
   - Vercel will automatically build and deploy
   - Your app will be live at `https://your-project.vercel.app`

### Custom Domain
1. In Vercel project settings, go to **Domains**
2. Add your custom domain
3. Update DNS records as instructed
4. Update Firebase authorized domains

## Building for Production

```bash
# Build the project
pnpm build

# Preview production build locally
pnpm preview
```

## SEO Optimization

The project includes:
- Meta tags for title, description, keywords
- Open Graph tags for social sharing
- Twitter Card tags
- Structured data ready for schema markup
- Mobile-friendly viewport configuration
- Sitemap support (add `public/sitemap.xml`)

## Performance Optimization

- **Code Splitting**: Automatic with Vite
- **Image Optimization**: Use Firebase Storage CDN
- **Lazy Loading**: Route-based code splitting
- **Caching**: Browser cache headers configured
- **Database Optimization**: Indexed Firestore queries

## Security

- **Firebase Security Rules**: Enforce access control
- **Authentication**: Google OAuth with secure tokens
- **HTTPS**: Enforced in production
- **Data Validation**: Client and server-side
- **Rate Limiting**: Implement in Cloud Functions (optional)

## Troubleshooting

### Firebase Connection Issues
- Verify Firebase credentials in `.env.local`
- Check Firestore Security Rules
- Ensure authorized domains include your URL

### Google OAuth Issues
- Verify Google Client ID in environment variables
- Check authorized redirect URIs in Google Cloud Console
- Clear browser cache and cookies

### Deployment Issues
- Check Vercel build logs
- Verify all environment variables are set
- Ensure Firebase project is in the same region

## Future Enhancements

- Stripe/PayHere payment integration
- Cloud Functions for automatic subscription expiry
- Email notifications
- Advanced search with full-text indexing
- Subtitle editor in browser
- Community forums
- Creator analytics dashboard
- Batch subtitle upload
- API for third-party integrations

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- **Admin Contact**: @KaveeshGimhan (Telegram)
- **GitHub Issues**: Report bugs and feature requests
- **Email**: support@subflix.com (when available)

## Changelog

### v1.0.0 (Initial Release)
- Core platform features
- Google Login authentication
- Subtitle upload and download
- Rating system
- Pro subscription
- Admin dashboard
- Earnings tracking

---

**Subflix** - Celebrating Sinhala cinema, one subtitle at a time.
