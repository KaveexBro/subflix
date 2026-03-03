# Subflix Quick Start Guide

Get started with Subflix in 5 minutes.

## 1. Clone and Install

```bash
git clone https://github.com/YOUR_USERNAME/subflix.git
cd subflix
pnpm install
```

## 2. Configure Firebase

1. Create `.env.local` file
2. Add Firebase credentials from Firebase Console
3. See `FIREBASE_SETUP.md` for detailed instructions

```env
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_GOOGLE_CLIENT_ID=your_client_id
```

## 3. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## 4. Test Features

- Click "Sign in with Google" to authenticate
- Browse subtitles on home page
- Upload a test subtitle
- Rate a subtitle
- Check your profile

## 5. Deploy to Vercel

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

See `DEPLOYMENT.md` for detailed steps.

## Project Structure

```
client/
├── pages/        # Page components
├── components/   # Reusable components
├── contexts/     # React contexts
├── lib/          # Utilities and Firebase
└── index.css     # Global styles
```

## Common Commands

```bash
# Development
pnpm dev          # Start dev server
pnpm check        # Check TypeScript
pnpm build        # Build for production
pnpm preview      # Preview production build

# Formatting
pnpm format       # Format code with Prettier
```

## Key Files

| File | Purpose |
|------|---------|
| `client/src/App.tsx` | Main app component with routes |
| `client/src/lib/firebase.ts` | Firebase initialization |
| `client/src/lib/firestore.ts` | Database operations |
| `client/src/contexts/AuthContext.tsx` | Authentication state |
| `client/src/index.css` | Global styles and theme |

## Important Pages

| Route | Purpose |
|-------|---------|
| `/` | Browse subtitles |
| `/login` | Google OAuth login |
| `/upload` | Upload subtitles |
| `/subtitle/:id` | View subtitle details |
| `/profile` | User profile and subscription |
| `/admin` | Admin dashboard (admin only) |

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_API_KEY` | Firebase API key |
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `VITE_APP_NAME` | Application name |
| `VITE_APP_URL` | Application URL |

## Troubleshooting

### Port 3000 Already in Use
```bash
# Vite will automatically find next available port
# Or specify a different port:
pnpm dev -- --port 3001
```

### Firebase Connection Failed
- Check `.env.local` has correct credentials
- Verify Firebase project is created
- Check Firestore database exists

### Google OAuth Not Working
- Verify Google Client ID is correct
- Check authorized redirect URIs in Google Cloud Console
- Clear browser cookies

## Next Steps

1. Read `README.md` for full documentation
2. Check `FIREBASE_SETUP.md` for Firebase configuration
3. See `DEPLOYMENT.md` for deployment instructions
4. Review `DEVELOPER_GUIDE.md` for development best practices

## Support

- **Documentation**: See README.md and other .md files
- **Issues**: Check GitHub issues
- **Contact**: @KaveeshGimhan (Telegram)

---

**Ready to code?** Start with `pnpm dev` 🚀
