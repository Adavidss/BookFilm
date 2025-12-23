# Quick Start Guide

Get the ShowBook Recommender up and running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- A TMDB account (free) for TV show data

## Step-by-Step Setup

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Get TMDB API Key (2 minutes)

1. Go to https://www.themoviedb.org/signup
2. Create a free account
3. Go to Settings → API → Request API Key
4. Choose "Developer" option
5. Fill out the form (can use placeholder URL)
6. Copy your API key

### 3. Configure Environment (30 seconds)

```bash
# Copy example file
cp .env.example .env.local

# Edit .env.local and paste your API key
# NEXT_PUBLIC_TMDB_API_KEY=your_actual_key_here
```

### 4. Start Development Server (10 seconds)

```bash
npm run dev
```

Open http://localhost:3000 - you're done!

## First Steps

### Try the Discovery Page
1. Click "Discovery" in navigation
2. Make sure "TV Shows" is selected
3. You should see trending shows with posters

### Search for a TV Show
1. Go to "TV Shows" page
2. Search for "Breaking Bad" or "Stranger Things"
3. Click "Add to Watched" on a show you like

### Search for a Book
1. Go to "Books" page
2. Search for "Dune" or "1984"
3. Click "Add to Read" on books you've read

### View Your Lists
1. Click "My Books" or "My Shows" tabs
2. See your added content
3. Click "Remove" to delete items

## Optional: Google Books API Key

Books work without an API key, but may be rate-limited.

To add a key:
1. Go to https://console.cloud.google.com/
2. Create a project
3. Enable "Books API"
4. Create credentials (API Key)
5. Add to `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY=your_key_here
   ```

## What to Try Next

### Build Your Lists
- Add 5-10 books you've read
- Add 5-10 shows you've watched
- Mix different genres

### Explore Cross-Recommendations
- Go to "Cross-Recs" page
- Toggle between "Books from Shows" and "Shows from Books"
- See how the algorithm matches genres

### Customize the Code
- Edit colors in `tailwind.config.js`
- Adjust scoring weights in `lib/recommendationEngine.ts`
- Add new components in `components/`

## Troubleshooting

### "No search results" for TV shows
- Check that your TMDB API key is correctly set in `.env.local`
- Make sure the key has no extra spaces
- Restart the dev server after adding the key

### "No search results" for books
- Google Books API works without a key but may be slow
- Try a different search term (use full book titles)
- Add a Google Books API key (see above)

### Images not loading
- Make sure you have an internet connection
- Check browser console for errors
- Verify image domains in `next.config.js`

### Changes not appearing
- Make sure dev server is running
- Refresh the page (hard refresh: Cmd+Shift+R / Ctrl+Shift+R)
- Check terminal for build errors

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build
npm run lint         # Run linter

# Maintenance
rm -rf .next         # Clear Next.js cache
rm -rf node_modules  # Clear dependencies
npm install          # Reinstall dependencies
```

## Understanding the Code

### Want to change recommendation logic?
→ Edit `lib/recommendationEngine.ts`

### Want to add a new page?
→ Create file in `app/your-page/page.tsx`

### Want to modify a component?
→ Edit files in `components/`

### Want to add new API calls?
→ Edit `utils/api.ts`

### Want to change data structure?
→ Edit `types/index.ts`

## Next Steps

1. **Read the README**: Comprehensive feature overview
2. **Read ARCHITECTURE.md**: Understand the design decisions
3. **Customize the app**: Make it your own!
4. **Share with friends**: Get them to build their own

## Getting Help

- Check the README for detailed documentation
- Check ARCHITECTURE.md for technical details
- Look at code comments for inline explanations
- All APIs are real - check their official docs if needed

## Quick Tips

1. **Data persists in localStorage** - it stays even after closing the browser
2. **No account needed** - everything runs locally
3. **API keys are safe** - only you can use them (not shared with anyone)
4. **Recommendations improve** - the more items you add, the better
5. **It's hackable** - modify anything you want!

---

Enjoy your new recommender system! 🎬📚
