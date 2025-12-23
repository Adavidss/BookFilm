# BookFilm (ShowBook Recommender)

A personal TV show and book recommender with Goodreads-like features. Built as a clean, hackable side project using Next.js and TypeScript. Features mobile-first design, cross-recommendations, and comprehensive tracking features.

🌐 **Live Demo**: [Deploy to Vercel](https://vercel.com) to get your app running in minutes!

## Features

### Core Functionality
- 📚 **Books Section**: Search books, maintain reading list with status tracking, get personalized recommendations
- 📺 **TV Shows Section**: Search shows, track watched list, get personalized recommendations
- 🔀 **Cross-Recommendations**: Get book suggestions from TV shows and vice versa (genre-based matching)
- 📱 **Mobile-First Design**: Bottom navigation bar, responsive grid layouts, touch-friendly interface

### Goodreads-Like Features
- ⭐ **Ratings**: Rate books and shows (1-5 stars)
- ✍️ **Reviews**: Write detailed reviews with spoiler tags
- 📊 **Progress Tracking**: Track reading progress (pages) and watching progress (seasons/episodes)
- 📅 **Date Tracking**: Record start dates, finish dates, and re-read dates
- 🏷️ **Custom Tags**: Add custom tags to organize your collection
- 📝 **Notes**: Add notes to books and shows (with page/episode references)
- 📚 **Reading Challenges**: Create and track annual/monthly reading goals
- 📈 **Statistics**: View reading and watching statistics
- 🎯 **Series Tracking**: Track book and TV series progress

### Smart Features
- Genre and theme-based matching with explainable recommendations
- Cross-recommendations between books and TV shows based on genre mapping
- Streaming platform availability (for shows)
- Book retailer links (Amazon, Kindle, Audible)
- Google Books ratings display
- Clean, minimal UI with dark mode support
- iOS "Add to Home Screen" support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Data APIs**:
  - [TMDB API](https://www.themoviedb.org/documentation/api) for TV shows
  - [Google Books API](https://developers.google.com/books) for books
- **Storage**: LocalStorage (client-side persistence)

## Project Structure

```
Book-TV-Recommender/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Books page (home)
│   ├── shows/page.tsx           # TV Shows page
│   ├── cross-recommendations/   # Cross-recommendations page
│   ├── challenges/page.tsx      # Reading challenges
│   ├── statistics/page.tsx      # Statistics dashboard
│   ├── settings/page.tsx        # Settings page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Layout.tsx               # Main layout with navigation
│   ├── BookCard.tsx             # Book display card
│   ├── ShowCard.tsx             # TV show display card
│   ├── EnhancedDetailModal.tsx  # Detailed view modal
│   ├── ReviewEditor.tsx         # Review editor
│   ├── ProgressTracker.tsx      # Progress tracking component
│   ├── ChallengeCard.tsx        # Challenge display
│   └── ...                      # Other components
├── lib/                         # Core logic
│   └── recommendationEngine.ts  # Recommendation algorithms
├── hooks/                       # React hooks
│   └── useUserData.ts          # User data management
├── utils/                       # Utilities
│   └── api.ts                  # API integration functions
└── types/                       # TypeScript types
    └── index.ts                # Type definitions
```

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Keys

Copy the example environment file:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your API keys:

#### Required: TMDB API Key (for TV shows)
1. Create account at [TMDB](https://www.themoviedb.org/signup)
2. Go to [API Settings](https://www.themoviedb.org/settings/api)
3. Request an API key (it's free)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_TMDB_API_KEY=your_key_here
   ```

#### Optional: Google Books API Key
Books work without a key but with rate limits. For better performance:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a project and enable Books API
3. Create credentials (API key)
4. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_key_here
   ```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3001](http://localhost:3001)

### 4. Build for Production

```bash
npm run build
npm start
```

## How It Works

### Recommendation Engine

The recommendation system (`lib/recommendationEngine.ts`) uses content-based filtering:

1. **Genre Matching**: Compares genres between items (exact matches score highest)
2. **Tag/Theme Matching**: Compares descriptive tags and themes
3. **Cross-Recommendations**: Maps TV show genres to book genres for cross-recommendations
4. **Score Calculation**: Weights matches and ranks candidates
5. **Explainable Reasons**: Generates human-readable explanations

### User Data Storage

All user data is stored in browser localStorage:
- No backend required
- Data persists across sessions
- Privacy-focused (data never leaves browser)

Data structure includes:
- Books and shows with ratings, reviews, progress, dates
- Custom tags and notes
- Reading challenges
- Series tracking
- Reading goals and streaks

### API Integration

**TV Shows** (`utils/api.ts`):
- Uses TMDB v3 API
- Search, popular, trending, genre-based endpoints
- Fetches genres, posters, metadata, ratings

**Books** (`utils/api.ts`):
- Uses Google Books API v1
- Search by title/author
- Genre-based searches
- Fetches genres, covers, descriptions, ratings

## Features in Detail

### Books & Shows Management
- Add items with status (want-to-read/want-to-watch, reading/watching, read/watched, dropped)
- Rate items with 1-5 star ratings
- Write detailed reviews with spoiler tags
- Track progress (pages for books, seasons/episodes for shows)
- Record dates (start, finish, re-read dates)
- Add custom tags and notes

### Cross-Recommendations
- Get book recommendations based on TV shows you've watched
- Get TV show recommendations based on books you've read
- Genre-based matching with intelligent mapping
- Shows multiple recommendations in a grid layout

### Challenges
- Create annual reading challenges (books or pages)
- Create monthly reading challenges
- Create genre-specific challenges
- Track progress and completion status

### Statistics
- View total books read and shows watched
- See reading/watching statistics
- Track reading streaks
- View genre distribution

## Mobile-First Design

The app features a mobile-first design with:
- Fixed bottom navigation bar on mobile
- Responsive grid layouts (2 columns on mobile, up to 5 on desktop)
- Touch-friendly tap targets
- Simplified UI optimized for mobile use
- iOS "Add to Home Screen" support

## Deployment

### ⚠️ Important: Environment Variables

**Before deploying, you MUST add your API keys to Vercel!**

See [VERCEL_SETUP.md](./VERCEL_SETUP.md) for detailed step-by-step instructions on adding environment variables to Vercel.

### Deploy to Vercel (Recommended - Free)

The easiest way to get your app live:

1. **Go to [Vercel](https://vercel.com)**
   - Sign up or log in with your GitHub account

2. **Import Your Repository**
   - Click "Add New Project" or "Import Project"
   - Select your `BookFilm` repository from GitHub
   - Click "Import"

3. **Configure Environment Variables**
   - In the project settings, go to "Environment Variables"
   - Add the following:
     - **Name**: `NEXT_PUBLIC_TMDB_API_KEY`
       **Value**: Your TMDB API key (get it from [TMDB API Settings](https://www.themoviedb.org/settings/api))
     - **Name**: `NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY`
       **Value**: Your Google Books API key (optional, but recommended)

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically:
     - Install dependencies
     - Build your Next.js app
     - Deploy it to a live URL
   - You'll get a URL like `https://bookfilm.vercel.app` or `https://bookfilm-[your-username].vercel.app`

5. **Automatic Updates**
   - Every time you push to GitHub, Vercel will automatically redeploy your app
   - You can also set up custom domains in the project settings

### Other Deployment Options

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions on:
- Vercel CLI deployment
- GitHub Pages (static export)
- Other hosting platforms (Netlify, Railway, Render, etc.)

## Troubleshooting

### No search results for TV shows
- Check that TMDB API key is set in `.env.local`
- Verify key is valid at [TMDB API Settings](https://www.themoviedb.org/settings/api)
- Check browser console for error messages

### No search results for books
- Google Books API works without key but may be rate-limited
- Try adding an API key (see setup instructions)
- Check network tab for API response errors

### Cross-recommendations not working
- Ensure you have at least one book or show in your list
- Check browser console for API errors
- Verify genre mapping is working correctly

### User data not persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for storage errors

## License

MIT - Use freely for personal or educational purposes

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for TV show metadata
- [Google Books](https://books.google.com/) for book metadata
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---

**Note**: This is a personal project for tracking books and TV shows with Goodreads-like features. All data is stored locally in your browser.
