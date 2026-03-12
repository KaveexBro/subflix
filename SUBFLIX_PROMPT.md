# Subflix: Cinematic Subtitle Community Platform Prompt

**Objective:** Build a high-performance, cinematic subtitle sharing platform inspired by Netflix, utilizing a modern full-stack serverless architecture.

## 1. Tech Stack
- **Frontend:** React 19, Vite, Tailwind CSS 4 (with standard Netflix-inspired color palette: Background `#141414`, Primary/Red `#E50914`, Surface `#181818`).
- **State & Routing:** Wouter (routing), Context API (Auth/Theme), Lucide React (Icons).
- **Backend/DB:** Firebase (Authentication with Google, Firestore Database).
- **Security:** DOMPurify for sanitizing user-provided HTML descriptions.
- **UI Components:** Radix UI primitives, Shimmering Skeleton Loaders for data fetching states.

## 2. Core Features & Logic

### A. Membership & Monetization (Pro vs. Free)
- **Free Tier:** 15-second countdown timer before external download links appear; limit of 5 downloads per day (tracked via `dailyDownloadCount` and `lastDownloadResetDate` in Firestore).
- **Pro Tier:** Instant, unlimited downloads; special "PRO" badge in the header; access to "Bulk Download" features.

### B. Content Organization (Movies & TV Series)
- **TV Series Grouping:** Group episodes of the same show by `movieTitle` on the home page. Show a single card per show with a "Latest: SXX EXX" badge.
- **Series Details Page:** A dedicated view for each TV series listing all available seasons and episodes, allowing users to select and navigate between them.
- **Auto-fill Upload Form:** A debounced form that fetches existing show metadata (Poster URL, Year, Description) as the user types a title, reducing manual entry for TV series.

### C. Creator & Admin Ecosystem
- **Application Flow:** Users must apply via a form (Uploader Name, Bio, Social Links) to become creators.
- **Admin Dashboard:** Centralized panel for admins to approve/reject creator applications, manage subtitle verification, and view platform stats.
- **Public Profiles:** Public-facing creator pages (`/creator/:uid`) showcasing their portfolio of subtitles and average ratings.

### D. Cinematic UI/UX
- **Hero Section:** Full-bleed cinematic header featuring top-rated or featured content with dynamic background gradients.
- **Interactive Carousels:** Horizontal scrolling sections ("Top Rated", "Recently Added", "Movies") with hover-zoom effects on cards.
- **Posters:** Standardized 2:3 vertical poster aspect ratio for all content.
- **Rich Text:** Subtitle descriptions using a rich text editor (ReactQuill), rendered safely as HTML.

## 3. Performance & Deployment
- **Vercel Optimized:** Configured for Single Page Application (SPA) routing with `vercel.json` rewrites.
- **Lazy Loading:** Optimized image handling and component-based code splitting.
- **Performance:** Debounced search and metadata fetching to minimize Firestore read costs.
