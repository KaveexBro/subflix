# Subflix Developer Guide

This guide provides detailed information for developers working on the Subflix platform.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Setup](#development-setup)
3. [Project Structure](#project-structure)
4. [Key Technologies](#key-technologies)
5. [Development Workflow](#development-workflow)
6. [Code Style and Standards](#code-style-and-standards)
7. [Common Tasks](#common-tasks)
8. [Debugging](#debugging)
9. [Performance Optimization](#performance-optimization)
10. [Security Considerations](#security-considerations)

## Project Overview

**Subflix** is a full-stack web application for Sinhala subtitle enthusiasts. It provides a platform for users to browse, download, upload, and rate subtitles, with a subscription system for premium features and an earnings system for creators.

### Key Features
- Google OAuth authentication
- Subtitle browsing with ratings
- Subtitle upload (.srt format)
- Pro subscription (LKR 100/month)
- Creator earnings system
- Admin dashboard
- Real-time Firestore integration

### Tech Stack
- **Frontend**: React 19, Vite, TypeScript, TailwindCSS 4
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Deployment**: Vercel
- **Version Control**: Git/GitHub

## Development Setup

### Prerequisites
- Node.js 18+ and pnpm
- Firebase project configured
- Google OAuth credentials
- Git installed

### Step 1: Clone Repository

```bash
git clone https://github.com/YOUR_USERNAME/subflix.git
cd subflix
```

### Step 2: Install Dependencies

```bash
pnpm install
```

### Step 3: Configure Environment Variables

Create `.env.local` file:

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

### Step 4: Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000` in your browser.

## Project Structure

```
subflix/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # Browse subtitles page
│   │   │   ├── Login.tsx             # Authentication page
│   │   │   ├── Upload.tsx            # Upload subtitles page
│   │   │   ├── SubtitleDetail.tsx    # View subtitle details
│   │   │   ├── Profile.tsx           # User profile page
│   │   │   ├── Admin.tsx             # Admin dashboard
│   │   │   └── NotFound.tsx          # 404 page
│   │   ├── components/
│   │   │   ├── Header.tsx            # Navigation header
│   │   │   ├── GoogleLoginButton.tsx # Google OAuth button
│   │   │   ├── ProtectedRoute.tsx    # Route protection HOC
│   │   │   └── ui/                   # shadcn/ui components
│   │   ├── contexts/
│   │   │   ├── AuthContext.tsx       # Auth state management
│   │   │   └── ThemeContext.tsx      # Theme management
│   │   ├── lib/
│   │   │   ├── firebase.ts           # Firebase initialization
│   │   │   ├── firestore.ts          # Firestore CRUD operations
│   │   │   ├── types.ts              # TypeScript interfaces
│   │   │   └── utils.ts              # Utility functions
│   │   ├── App.tsx                   # Main app component
│   │   ├── main.tsx                  # React entry point
│   │   └── index.css                 # Global styles
│   ├── public/
│   │   ├── robots.txt                # SEO robots file
│   │   └── sitemap.xml               # SEO sitemap
│   └── index.html                    # HTML template
├── server/                           # Express server
├── shared/                           # Shared types
├── vite.config.ts                    # Vite configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies
├── README.md                         # Project README
├── FIREBASE_SETUP.md                 # Firebase setup guide
├── DEPLOYMENT.md                     # Deployment guide
├── FIREBASE_FUNCTIONS.md             # Cloud Functions guide
└── DEVELOPER_GUIDE.md                # This file
```

## Key Technologies

### React 19
- Latest React version with improved performance
- Use functional components with hooks
- Leverage React Context for state management

### Vite
- Lightning-fast development server
- Optimized production builds
- Tree-shaking and code splitting

### TypeScript
- Full type safety
- Better IDE support
- Catch errors at compile time

### TailwindCSS 4
- Utility-first CSS framework
- Dark mode support
- Responsive design utilities

### Firebase
- **Authentication**: Google OAuth
- **Firestore**: Real-time database
- **Storage**: File storage for subtitles

### shadcn/ui
- Accessible, unstyled components
- Built on Radix UI
- Fully customizable

## Development Workflow

### Creating a New Feature

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Implement the feature**
   - Create components in `client/src/components/`
   - Create pages in `client/src/pages/`
   - Add types in `client/src/lib/types.ts`
   - Add utilities in `client/src/lib/utils.ts`

3. **Test locally**
   ```bash
   pnpm dev
   ```

4. **Check TypeScript**
   ```bash
   pnpm check
   ```

5. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

6. **Push and create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

### Fixing a Bug

1. **Create a bug fix branch**
   ```bash
   git checkout -b fix/bug-description
   ```

2. **Locate and fix the issue**
3. **Test the fix**
4. **Commit with clear message**
   ```bash
   git commit -m "fix: describe the bug and how it was fixed"
   ```

### Updating Dependencies

```bash
# Check for updates
pnpm update --interactive

# Install specific version
pnpm add package-name@version

# Remove dependency
pnpm remove package-name
```

## Code Style and Standards

### TypeScript

- Use strict mode
- Always provide type annotations for function parameters
- Use interfaces for object types
- Avoid `any` type

```typescript
// ✓ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function getUser(id: string): Promise<User> {
  // ...
}

// ✗ Bad
function getUser(id) {
  // ...
}
```

### React Components

- Use functional components with hooks
- Keep components small and focused
- Use descriptive names
- Add JSDoc comments for complex components

```typescript
// ✓ Good
interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

/**
 * Reusable button component
 */
export function CustomButton({ onClick, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onClick} className={`btn btn-${variant}`}>
      {children}
    </button>
  );
}
```

### Naming Conventions

- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `User`, `Subtitle`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_FILE_SIZE`)

### File Organization

- One component per file
- Group related files together
- Use index.ts for exports
- Keep files under 300 lines

## Common Tasks

### Adding a New Page

1. Create file in `client/src/pages/NewPage.tsx`
2. Add route in `client/src/App.tsx`
3. Add navigation link in `client/src/components/Header.tsx`

```typescript
// In App.tsx
<Route path={"/new-page"}>
  {() => (
    <ProtectedRoute>
      <NewPage />
    </ProtectedRoute>
  )}
</Route>
```

### Adding a New Component

1. Create file in `client/src/components/NewComponent.tsx`
2. Export from component file
3. Import where needed

```typescript
// client/src/components/NewComponent.tsx
export function NewComponent() {
  return <div>Component content</div>;
}

// Usage in another file
import { NewComponent } from '@/components/NewComponent';
```

### Adding Firestore Operations

1. Add function to `client/src/lib/firestore.ts`
2. Use in components with proper error handling

```typescript
// In firestore.ts
export async function getSubtitles(): Promise<Subtitle[]> {
  const snapshot = await db
    .collection('subtitles')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as Subtitle));
}

// In component
const [subtitles, setSubtitles] = useState<Subtitle[]>([]);

useEffect(() => {
  getSubtitles()
    .then(setSubtitles)
    .catch((error) => toast.error('Failed to load subtitles'));
}, []);
```

### Adding Styles

Use TailwindCSS utilities directly in JSX:

```typescript
<div className="bg-background text-foreground p-4 rounded-lg shadow-md">
  <h1 className="text-2xl font-bold mb-2">Title</h1>
  <p className="text-muted-foreground">Description</p>
</div>
```

For custom styles, add to `client/src/index.css`:

```css
@layer components {
  .custom-class {
    @apply bg-background text-foreground p-4 rounded-lg;
  }
}
```

## Debugging

### Browser DevTools

1. Open DevTools (F12)
2. Check Console for errors
3. Use Network tab to inspect API calls
4. Use React DevTools extension

### Firebase Debugging

1. Go to Firebase Console
2. Check Firestore data in real-time
3. Monitor Authentication logs
4. Check Storage files

### Common Issues

**Issue**: User not authenticated
- Check Firebase credentials in `.env.local`
- Verify Google OAuth is enabled
- Check browser cookies

**Issue**: Firestore queries failing
- Check Security Rules
- Verify user has permission
- Check collection names

**Issue**: Storage upload failing
- Check Storage Rules
- Verify file size < 10MB
- Check file format is .srt

## Performance Optimization

### Code Splitting

Vite automatically handles code splitting. Routes are lazy-loaded:

```typescript
// Automatic with Vite
<Route path={"/page"} component={LazyPage} />
```

### Image Optimization

Use Firebase Storage CDN for images:

```typescript
<img 
  src="https://storage.googleapis.com/..." 
  alt="Description"
  loading="lazy"
/>
```

### Bundle Analysis

```bash
# Check bundle size
pnpm build
ls -lh dist/

# Analyze bundle
npm install -g webpack-bundle-analyzer
# Then configure in vite.config.ts
```

### Firestore Query Optimization

```typescript
// ✓ Good - Indexed query
db.collection('subtitles')
  .where('isVerified', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)

// ✗ Bad - Unindexed query
db.collection('subtitles')
  .where('ratings', '>', 4.5)
  .where('downloads', '>', 100)
```

## Security Considerations

### Environment Variables

- Never commit `.env.local`
- Use `.env.example` for template
- Rotate secrets regularly
- Use different keys for dev/prod

### Firebase Security

- Review Security Rules regularly
- Implement proper authentication checks
- Validate user permissions
- Use HTTPS in production

### Data Protection

- Encrypt sensitive data in transit
- Use HTTPS for all requests
- Validate user input
- Sanitize output to prevent XSS

### Code Security

- Keep dependencies updated
- Use npm audit to check vulnerabilities
- Review third-party packages
- Use security headers

## Resources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TypeScript Documentation](https://www.typescriptlang.org)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [Firebase Documentation](https://firebase.google.com/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)

## Getting Help

- Check existing issues on GitHub
- Read documentation files
- Contact: @KaveeshGimhan (Telegram)
- Review code comments and JSDoc

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

---

Happy coding! 🚀
