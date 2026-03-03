# Deployment Guide - Subflix

This guide walks you through deploying Subflix to Vercel with a custom domain.

## Prerequisites

- GitHub account with your Subflix repository
- Vercel account (free tier available)
- Firebase project configured
- Custom domain (optional but recommended)

## Step 1: Prepare Your Repository

### Initialize Git Repository

```bash
cd /home/ubuntu/subflix
git init
git add .
git commit -m "Initial commit: Subflix platform"
```

### Create GitHub Repository

1. Go to [GitHub](https://github.com/new)
2. Create a new repository named `subflix`
3. Choose **Private** for privacy
4. Click **"Create repository"**

### Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USERNAME/subflix.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel

### Connect Vercel to GitHub

1. Go to [Vercel](https://vercel.com)
2. Click **"New Project"**
3. Click **"Import Git Repository"**
4. Search for and select your `subflix` repository
5. Click **"Import"**

### Configure Build Settings

Vercel should auto-detect the settings, but verify:

- **Framework Preset**: Vite
- **Build Command**: `pnpm build`
- **Output Directory**: `dist`
- **Install Command**: `pnpm install`

### Add Environment Variables

1. In Vercel project settings, go to **Environment Variables**
2. Add all Firebase and Google OAuth credentials:

```
VITE_FIREBASE_API_KEY=your_value
VITE_FIREBASE_AUTH_DOMAIN=your_value
VITE_FIREBASE_PROJECT_ID=your_value
VITE_FIREBASE_STORAGE_BUCKET=your_value
VITE_FIREBASE_MESSAGING_SENDER_ID=your_value
VITE_FIREBASE_APP_ID=your_value
VITE_GOOGLE_CLIENT_ID=your_value
VITE_APP_NAME=Subflix
VITE_APP_URL=https://your-domain.vercel.app
```

3. Click **"Save"**

### Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Your app will be live at `https://subflix-YOUR_USERNAME.vercel.app`

## Step 3: Configure Firebase for Production

### Update Authorized Domains

1. Go to Firebase Console
2. Navigate to **Authentication** → **Settings**
3. Add your Vercel domain to **Authorized domains**:
   - `subflix-YOUR_USERNAME.vercel.app`
   - Your custom domain (if using)

### Update Google OAuth

1. Go to Google Cloud Console
2. Go to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client ID
4. Add authorized redirect URIs:
   - `https://subflix-YOUR_USERNAME.vercel.app`
   - `https://subflix-YOUR_USERNAME.vercel.app/login`
   - Your custom domain (if using)

## Step 4: Set Up Custom Domain (Optional)

### Add Domain to Vercel

1. In Vercel project settings, go to **Domains**
2. Click **"Add"**
3. Enter your domain name (e.g., `subflix.com`)
4. Choose your domain registrar type
5. Follow the DNS configuration instructions

### Configure DNS Records

Depending on your registrar:

**Option A: Using Vercel's Nameservers**
1. Update your domain registrar's nameservers to Vercel's:
   - `ns1.vercel.com`
   - `ns2.vercel.com`
   - `ns3.vercel.com`
   - `ns4.vercel.com`

**Option B: Using CNAME Records**
1. Add CNAME record:
   - Name: `www` or `@`
   - Value: `cname.vercel.com`

### Verify Domain

1. Vercel will automatically verify DNS configuration
2. Once verified, your app will be accessible at your custom domain
3. HTTPS will be automatically enabled

## Step 5: Continuous Deployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes locally
git add .
git commit -m "Your commit message"
git push origin main

# Vercel will automatically build and deploy
```

### Manual Deployment

1. In Vercel project, click **"Deployments"**
2. Click **"Redeploy"** on any previous deployment
3. Or push a new commit to trigger deployment

## Step 6: Monitoring and Maintenance

### View Deployment Logs

1. Go to Vercel project
2. Click **"Deployments"**
3. Click on a deployment to view logs
4. Check **"Build Logs"** and **"Runtime Logs"**

### Monitor Performance

1. Go to **Analytics** in Vercel
2. Monitor:
   - Page load times
   - Core Web Vitals
   - Traffic patterns
   - Error rates

### Set Up Alerts

1. Go to **Settings** → **Notifications**
2. Enable alerts for:
   - Failed deployments
   - Performance issues
   - Error thresholds

## Step 7: Production Checklist

Before going live, verify:

- [ ] Firebase Security Rules are in production mode
- [ ] All environment variables are set correctly
- [ ] Google OAuth is configured for your domain
- [ ] Firebase authorized domains include your production URL
- [ ] HTTPS is enabled (automatic with Vercel)
- [ ] Custom domain is configured (if using)
- [ ] Admin user is created in Firebase
- [ ] Firestore indexes are created
- [ ] Storage rules are configured
- [ ] Backups are enabled in Firebase
- [ ] Analytics tracking is enabled
- [ ] Error monitoring is set up (optional: Sentry, etc.)

## Troubleshooting Deployments

### Build Fails

**Check:**
1. Vercel build logs for errors
2. All dependencies are in `package.json`
3. Environment variables are set correctly
4. No TypeScript errors: `pnpm check`

**Solution:**
```bash
# Test build locally
pnpm build

# If it works locally but fails on Vercel:
# - Clear Vercel cache: Project Settings → Git → Clear Cache
# - Redeploy
```

### App Shows Blank Page

**Check:**
1. Browser console for errors
2. Network tab for failed requests
3. Firebase connection is working

**Solution:**
1. Check Firebase credentials in environment variables
2. Verify Firestore Security Rules
3. Check browser console for specific errors

### Google OAuth Not Working

**Check:**
1. Google Client ID is correct
2. Domain is in authorized redirect URIs
3. Cookies are enabled in browser

**Solution:**
1. Update Google OAuth credentials
2. Clear browser cache
3. Test in incognito window

### Firebase Quota Exceeded

**Check:**
1. Vercel Analytics for traffic spikes
2. Firebase usage dashboard

**Solution:**
1. Optimize Firestore queries
2. Add caching layer
3. Upgrade to Blaze plan if needed

## Rollback

If something goes wrong in production:

1. Go to Vercel **Deployments**
2. Find the last working deployment
3. Click **"Redeploy"**
4. Verify the rollback was successful

## Performance Optimization

### Reduce Bundle Size

```bash
# Analyze bundle
pnpm build

# Check what's included
ls -lh dist/
```

### Enable Caching

Vercel automatically caches:
- Static assets (images, fonts)
- JavaScript bundles
- CSS files

### Optimize Images

Use Firebase Storage CDN for images:
```typescript
// Instead of local images
<img src="https://storage.googleapis.com/..." />
```

## Security

### Protect Sensitive Data

- Never commit `.env.local` to Git
- Use `.env.local` for local development
- Use Vercel environment variables for production
- Rotate Firebase keys periodically

### Monitor Access

1. Enable Firebase Authentication logs
2. Monitor Vercel deployment access
3. Set up alerts for suspicious activity

## Scaling

### For High Traffic

1. **Upgrade Firebase Plan**: Blaze plan for unlimited reads/writes
2. **Add Caching**: Implement Redis or similar
3. **CDN**: Vercel includes global CDN
4. **Database Optimization**: Add Firestore indexes
5. **Load Testing**: Use tools like Apache JMeter

### Database Optimization

```javascript
// Good: Indexed query
db.collection('subtitles')
  .where('isVerified', '==', true)
  .orderBy('createdAt', 'desc')
  .limit(20)

// Bad: Unindexed query
db.collection('subtitles')
  .where('ratings', '>', 4.5)
  .where('downloads', '>', 100)
```

## Maintenance

### Regular Tasks

- **Weekly**: Monitor error logs and performance
- **Monthly**: Review Firebase usage and costs
- **Quarterly**: Update dependencies: `pnpm update`
- **Annually**: Security audit and penetration testing

### Backup Strategy

1. Enable Firebase automatic backups
2. Export Firestore data monthly
3. Keep GitHub repository as code backup
4. Document configuration changes

## Support and Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Firebase Deployment Guide](https://firebase.google.com/docs/hosting)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Pages Alternative](https://pages.github.com/)

## Next Steps

1. Deploy to Vercel
2. Test all features in production
3. Monitor performance and errors
4. Gather user feedback
5. Plan future enhancements

---

For deployment issues, contact: @KaveeshGimhan (Telegram)
