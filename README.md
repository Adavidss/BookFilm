# ShowBook Recommender

A personal TV show and book recommender built as a clean, hackable side project. Uses simple content-based filtering with explainable recommendations — no LLMs, no AI hype, just useful logic.

## Philosophy

- **Simple & Explainable**: Every recommendation has clear reasons (genre matches, theme overlap, etc.)
- **No Onboarding**: Goodreads-style interaction — search, add to list, get recommendations
- **Content-Based**: Deterministic recommendations based on genres, tags, and themes
- **Personal Use**: No social features, no tracking, no unnecessary complexity
- **Hackable**: Clean code structure, easy to extend and customize

## Features

### Core Functionality
- 📚 **Books Section**: Search books, maintain reading list, get recommendations
- 📺 **TV Shows Section**: Search shows, track watched list, get recommendations
- 🔍 **Discovery**: Browse trending, new releases, and upcoming content
- 🔀 **Cross-Recommendations**: Get book suggestions from TV shows and vice versa

### Smart Features
- Genre and theme-based matching
- Explainable recommendation reasons
- Streaming platform availability (for shows)
- Book retailer links (Amazon, Kindle, Audible)
- Clean, minimal UI with dark mode support

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Data APIs**:
  - [TMDB API](https://www.themoviedb.org/documentation/api) for TV shows
  - [Google Books API](https://developers.google.com/books) for books
  - Optional: Watchmode API for streaming availability
- **Storage**: LocalStorage (client-side persistence)

## Project Structure

```
showbook-recommender/
├── app/                          # Next.js App Router pages
│   ├── page.tsx                 # Books page (home)
│   ├── shows/page.tsx           # TV Shows page
│   ├── discovery/page.tsx       # Discovery page
│   ├── cross-recommendations/   # Cross-recommendations
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/                   # React components
│   ├── Layout.tsx               # Main layout with navigation
│   ├── SearchBar.tsx            # Search component
│   ├── BookCard.tsx             # Book display card
│   └── ShowCard.tsx             # TV show display card
├── lib/                         # Core logic
│   └── recommendationEngine.ts  # Recommendation algorithms
├── hooks/                       # React hooks
│   └── useUserData.ts          # User data management
├── utils/                       # Utilities
│   └── api.ts                  # API integration functions
├── types/                       # TypeScript types
│   └── index.ts                # Type definitions
└── data/                        # Optional data files
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

Open [http://localhost:3000](http://localhost:3000)

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
3. **Score Calculation**: Weights matches and ranks candidates
4. **Explainable Reasons**: Generates human-readable explanations

Example recommendation flow:
```typescript
// User has read "Dune" (sci-fi, space opera, politics)
// System finds "Foundation" (sci-fi, space opera, empire)
// Match: 2 genres + 1 theme = high score
// Reason: "Shares genres: sci-fi, space opera"
```

### User Data Storage

All user data is stored in browser localStorage:
- No backend required
- Data persists across sessions
- Easy to export/import (future feature)
- Privacy-focused (data never leaves browser)

Structure:
```json
{
  "readBooks": [
    {
      "book": { /* book object */ },
      "addedAt": 1234567890
    }
  ],
  "watchedShows": [
    {
      "show": { /* show object */ },
      "addedAt": 1234567890
    }
  ]
}
```

### API Integration

**TV Shows** (`utils/api.ts`):
- Uses TMDB v3 API
- Search, trending, upcoming endpoints
- Fetches genres, posters, metadata

**Books** (`utils/api.ts`):
- Uses Google Books API v1
- Search by title/author
- Fetches genres, covers, descriptions

**Streaming Availability**:
- Placeholder for Watchmode API integration
- Can be manually curated for popular shows
- See `utils/api.ts` for implementation notes

## Customization Guide

### Adding New Recommendation Criteria

Edit `lib/recommendationEngine.ts`:

```typescript
// Add a new scoring factor
const WEIGHTS = {
  EXACT_GENRE_MATCH: 10,
  TAG_MATCH: 3,
  AUTHOR_MATCH: 5,  // NEW: bonus for same author
};

// Update scoring function
function scoreItem(...) {
  // Add your logic
  if (userItem.authors.includes(candidate.author)) {
    totalScore += WEIGHTS.AUTHOR_MATCH;
  }
}
```

### Adding Collaborative Filtering

Implement `getCollaborativeRecommendations()` in `lib/recommendationEngine.ts`:

```typescript
export function getCollaborativeRecommendations(...) {
  // Option 1: Manual curation
  const similarItems = {
    'book-123': ['book-456', 'book-789'],
  };

  // Option 2: Import from external service
  // Option 3: Aggregate from friends' data

  return similarItems[itemId] || [];
}
```

### Adding More Data Sources

Create new API functions in `utils/api.ts`:

```typescript
// Example: Add OpenLibrary API
export async function searchBooksOpenLibrary(query: string): Promise<Book[]> {
  const response = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}`
  );
  const data = await response.json();
  return data.docs.map(doc => ({
    id: `ol-${doc.key}`,
    title: doc.title,
    authors: doc.author_name || [],
    genres: doc.subject?.slice(0, 3) || [],
    // ... map other fields
  }));
}
```

### Styling & Theming

Colors are defined in `tailwind.config.js`:

```javascript
theme: {
  extend: {
    colors: {
      primary: '#3b82f6',    // Blue
      secondary: '#8b5cf6',  // Purple
      accent: '#ec4899',     // Pink
    },
  },
}
```

## Advanced Features (Optional)

### Import/Export User Data

Add to `hooks/useUserData.ts`:

```typescript
const exportData = () => {
  const json = JSON.stringify(userData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Trigger download
};

const importData = (file: File) => {
  const reader = new FileReader();
  reader.onload = (e) => {
    const imported = JSON.parse(e.target.result);
    setUserData(imported);
  };
  reader.readAsText(file);
};
```

### Preload Popular Content

Create `data/popular-shows.json` and `data/popular-books.json`:

```json
[
  {
    "id": "tv-1234",
    "title": "Breaking Bad",
    "genres": ["Crime", "Drama", "Thriller"],
    "platforms": [{"name": "Netflix"}]
  }
]
```

Load in discovery page for faster initial experience.

### Add User Ratings

Extend types in `types/index.ts`:

```typescript
interface UserBook {
  book: Book;
  addedAt: number;
  rating?: 1 | 2 | 3 | 4 | 5;  // NEW
}
```

Use ratings to weight recommendations (higher-rated books influence more).

## Troubleshooting

### No search results for TV shows
- Check that TMDB API key is set in `.env.local`
- Verify key is valid at [TMDB API Settings](https://www.themoviedb.org/settings/api)
- Check browser console for error messages

### No search results for books
- Google Books API works without key but may be rate-limited
- Try adding an API key (see setup instructions)
- Check network tab for API response errors

### Images not loading
- Ensure `next.config.js` includes image domains:
  ```javascript
  images: {
    domains: ['image.tmdb.org', 'books.google.com'],
  }
  ```

### User data not persisting
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for storage errors

## Deployment

### Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Add environment variables in Vercel dashboard.

### Other Platforms

Build static export:
```bash
npm run build
```

Deploy the `.next` folder to any static host.

## Contributing

This is a personal project template, but feel free to:
- Fork and customize for your own use
- Submit issues for bugs
- Share improvements and extensions

## License

MIT - Use freely for personal or educational purposes

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for TV show metadata
- [Google Books](https://books.google.com/) for book metadata
- Built with [Next.js](https://nextjs.org/) and [Tailwind CSS](https://tailwindcss.com/)

---

**Remember**: This is a tool for personal use. Keep it simple, keep it hackable, keep it useful. No AI hype needed.
