# Architecture Documentation

## Design Principles

This app follows these core architectural principles:

1. **Simplicity Over Complexity**: No unnecessary abstractions
2. **Explainability**: Every recommendation can be understood
3. **Hackability**: Easy to modify and extend
4. **No Backend Required**: Client-side only (can add backend later)
5. **Real APIs**: Uses legitimate public APIs, no fake data

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Browser                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │                    Next.js App                         │ │
│  │                                                        │ │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │ │
│  │  │  Pages   │  │Components│  │ Recommendation   │   │ │
│  │  │          │  │          │  │     Engine       │   │ │
│  │  │ - Books  │  │ - Cards  │  │                  │   │ │
│  │  │ - Shows  │  │ - Search │  │ - Genre Match    │   │ │
│  │  │ - Disc   │  │ - Layout │  │ - Tag Match      │   │ │
│  │  │ - Cross  │  │          │  │ - Scoring        │   │ │
│  │  └────┬─────┘  └────┬─────┘  └────────┬─────────┘   │ │
│  │       │             │                  │             │ │
│  │       └─────────────┼──────────────────┘             │ │
│  │                     │                                │ │
│  │              ┌──────▼───────┐                        │ │
│  │              │  User Data   │                        │ │
│  │              │    Hook      │                        │ │
│  │              │              │                        │ │
│  │              │ - addBook()  │                        │ │
│  │              │ - addShow()  │                        │ │
│  │              │ - userData   │                        │ │
│  │              └──────┬───────┘                        │ │
│  │                     │                                │ │
│  │              ┌──────▼───────┐                        │ │
│  │              │ localStorage │                        │ │
│  │              └──────────────┘                        │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  External API Calls:                                        │
│  ├─► TMDB API (TV Shows)                                   │
│  ├─► Google Books API (Books)                              │
│  └─► Watchmode API (Streaming - Optional)                  │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Searches for Content

```
User Input (Search Query)
    │
    ▼
SearchBar Component
    │
    ▼
Page Handler (onSearch)
    │
    ▼
API Utility (searchBooks / searchTVShows)
    │
    ▼
External API Request
    │
    ▼
Parse & Transform Response
    │
    ▼
Update Component State (setSearchResults)
    │
    ▼
Render Cards (BookCard / ShowCard)
```

### 2. User Adds Content to List

```
User Clicks "Add to Read/Watched"
    │
    ▼
Card Component (onAdd callback)
    │
    ▼
useUserData Hook (addBook / addShow)
    │
    ├─► Update State (setUserData)
    │
    └─► Save to localStorage
    │
    ▼
Re-render Components with Updated Data
    │
    ▼
Trigger Recommendation Re-generation (useEffect)
```

### 3. Generate Recommendations

```
User Data Changes (useEffect trigger)
    │
    ▼
Get User's Books/Shows
    │
    ▼
Fetch Candidate Items
    │
    ▼
Recommendation Engine
    │
    ├─► Extract Genres & Tags
    │
    ├─► Calculate Overlap
    │
    ├─► Score Each Candidate
    │
    ├─► Generate Reasons
    │
    └─► Sort by Score
    │
    ▼
Update Recommendations State
    │
    ▼
Display Recommendation Cards with Reasons
```

### 4. Cross-Recommendations

```
User's Books + Candidate Shows (or vice versa)
    │
    ▼
Cross-Recommendation Function
    │
    ├─► Match Genres (Books ↔ Shows)
    │
    ├─► Match Themes/Tags
    │
    ├─► Score Based on Overlap
    │
    └─► Prefix Reasons ("From your TV shows: ...")
    │
    ▼
Display Cross-Recommendations
```

## Component Hierarchy

```
RootLayout (app/layout.tsx)
│
└─► Layout Component
    │
    ├─► Header (Navigation)
    │   │
    │   ├─► Logo/Title
    │   └─► Nav Links (Books, Shows, Discovery, Cross-Recs)
    │
    ├─► Main Content
    │   │
    │   ├─► Page Component (Books / Shows / Discovery / Cross)
    │   │   │
    │   │   ├─► SearchBar
    │   │   │
    │   │   ├─► Tabs
    │   │   │
    │   │   └─► Content Grid
    │   │       │
    │   │       └─► Cards (BookCard / ShowCard)
    │   │           │
    │   │           ├─► Image
    │   │           ├─► Title & Metadata
    │   │           ├─► Genres/Tags
    │   │           ├─► Recommendation Reasons
    │   │           └─► Action Buttons
    │
    └─► Footer
```

## State Management

### Global State (useUserData Hook)

```typescript
{
  userData: {
    readBooks: UserBook[],
    watchedShows: UserShow[]
  },
  isLoading: boolean,

  // Actions
  addBook(book: Book): void,
  removeBook(bookId: string): void,
  addShow(show: TVShow): void,
  removeShow(showId: string): void,
  hasBook(bookId: string): boolean,
  hasShow(showId: string): boolean,
  clearAll(): void
}
```

### Page-Level State

Each page maintains local state for:
- Search results
- Recommendations
- Active tab
- Loading states

### Why No Global State Management Library?

- **Simple data model**: Only user lists + temporary search results
- **No complex updates**: Mostly append/remove operations
- **localStorage integration**: Direct hook ↔ storage connection
- **Avoids over-engineering**: useState + useEffect is sufficient

Can add Redux/Zustand later if needed.

## Recommendation Algorithm

### Scoring Formula

```
Total Score = Σ (matches × weight)

Where:
- Genre Match (exact):    10 points each
- Tag/Theme Match:         3 points each
- Popularity Bonus:        2 points (if available)
- Collaborative Signal:    5 points (future)
```

### Example Calculation

User has watched: **Breaking Bad** (Crime, Drama, Thriller)

Candidate: **Better Call Saul** (Crime, Drama, Legal)

```
Genre matches:
  - Crime:   10 points
  - Drama:   10 points
  Total:     20 points

Tag matches:
  - "Dark":           3 points
  - "Character study": 3 points
  Total:             6 points

Final Score: 26 points

Reasons:
  - "Shares genres: Crime, Drama"
  - "Similar themes: Dark, Character study"
```

### Why This Approach?

**Pros**:
- Deterministic and reproducible
- Explainable to users
- No training data required
- Works immediately with small user lists
- Easy to debug and tune

**Cons**:
- Less sophisticated than ML models
- Requires good genre/tag metadata
- May miss subtle preferences

**When to Upgrade**:
- You have 100+ user items
- You want personalized weighting
- You're willing to sacrifice explainability

## API Integration Strategy

### TMDB (TV Shows)

**Endpoints Used**:
- `/search/tv` - Search shows by title
- `/tv/{id}` - Get detailed show info
- `/trending/tv/week` - Trending shows
- `/tv/on_the_air` - Currently airing

**Why TMDB?**:
- Free tier is generous
- Excellent metadata coverage
- Regular updates
- Well-documented API

**Limitations**:
- No official streaming availability
- Rate limits on free tier
- Image CDN has occasional downtime

### Google Books

**Endpoints Used**:
- `/volumes?q={query}` - Search books
- `/volumes/{id}` - Get book details

**Why Google Books?**:
- Works without API key
- Comprehensive book database
- Good metadata quality
- Free tier sufficient for personal use

**Limitations**:
- Rate limited without API key
- Genre data sometimes sparse
- No "trending" endpoint

### Streaming Availability

**Current Status**: Not implemented

**Options**:
1. **Watchmode API**: Free tier available, covers most platforms
2. **JustWatch**: No official API (would need scraping)
3. **Manual Curation**: Maintain list of popular shows
4. **User Input**: Let users add platforms manually

**Recommendation**: Start with Watchmode API

## Performance Considerations

### Client-Side Rendering

- Uses Next.js App Router with `'use client'` directive
- Could switch to Server Components for:
  - API key hiding (move to server)
  - Better SEO (if needed)
  - Reduced client bundle

### Optimization Opportunities

1. **Code Splitting**: Lazy load recommendation engine
2. **Image Optimization**: Use Next.js Image component (already done)
3. **API Caching**: Cache search results locally
4. **Debounced Search**: Wait for user to finish typing
5. **Virtual Scrolling**: For large lists (100+ items)

### Current Bundle Size

Estimated:
- Main bundle: ~150KB (gzipped)
- Next.js runtime: ~80KB
- Tailwind CSS: ~10KB (purged)

Total: ~240KB - acceptable for personal use

## Security Considerations

### API Keys

**Current**: Exposed in client (NEXT_PUBLIC_*)

**Why**: Acceptable for personal use with free-tier APIs

**Better Approach** (if sharing publicly):
1. Move API calls to Next.js API routes
2. Store keys in server-side env vars
3. Add rate limiting per user

### User Data

**Current**: Stored in localStorage (client-side)

**Security**: Low risk - personal use, no sensitive data

**Considerations**:
- Data visible in browser DevTools
- Not encrypted
- Tied to single browser/device

**If Adding Backend**:
- Hash/encrypt user data
- Implement authentication
- Use secure session storage

## Extensibility Points

### Easy Extensions

1. **Add More APIs**:
   - Create new function in `utils/api.ts`
   - Map response to Book/TVShow type
   - Add to search/discovery

2. **New Recommendation Criteria**:
   - Add weight constant
   - Update scoring function
   - Add to reasons array

3. **UI Customization**:
   - Modify Tailwind config
   - Update component styles
   - Add new card layouts

### Moderate Extensions

1. **User Ratings**:
   - Extend UserBook/UserShow types
   - Add rating UI to cards
   - Weight recommendations by rating

2. **Filtering/Sorting**:
   - Add filter controls
   - Implement filter logic
   - Update display state

3. **Import/Export**:
   - Add JSON export function
   - Create import file picker
   - Validate imported data

### Complex Extensions

1. **Backend + Database**:
   - Set up PostgreSQL/MongoDB
   - Create API routes
   - Implement authentication
   - Migrate localStorage data

2. **Collaborative Filtering**:
   - Collect usage patterns
   - Build similarity matrix
   - Implement k-NN or ALS
   - Blend with content-based

3. **Social Features**:
   - Share lists with friends
   - Compare tastes
   - Aggregate recommendations

## Testing Strategy

### Recommended Tests

1. **Unit Tests** (Recommendation Engine):
   ```typescript
   test('scores exact genre match correctly', () => {
     const score = scoreItem([mockBook1], mockBook2);
     expect(score).toBeGreaterThan(0);
   });
   ```

2. **Integration Tests** (User Data Hook):
   ```typescript
   test('adds book to list and persists', () => {
     const { addBook, userData } = useUserData();
     addBook(mockBook);
     expect(userData.readBooks).toContain(mockBook);
   });
   ```

3. **E2E Tests** (Playwright/Cypress):
   ```typescript
   test('search and add flow', async () => {
     await page.fill('input', 'Dune');
     await page.click('button:has-text("Search")');
     await page.click('button:has-text("Add to Read")');
     // Verify added to list
   });
   ```

### Testing Setup

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom
```

Not included by default to keep the project lean.

## Future Improvements

### Short Term (Easy)
- [ ] Debounced search input
- [ ] Loading skeletons for cards
- [ ] Error boundary components
- [ ] Keyboard navigation
- [ ] Export/Import user data

### Medium Term (Moderate)
- [ ] User ratings for books/shows
- [ ] Filter recommendations by genre
- [ ] Sort options (date added, score, title)
- [ ] "Already seen/read" marking
- [ ] Similar items (collaborative data)

### Long Term (Complex)
- [ ] Backend with user accounts
- [ ] Share lists with friends
- [ ] Mobile app (React Native)
- [ ] Browser extension
- [ ] Aggregate friend recommendations

## Deployment Checklist

- [ ] Set environment variables in hosting platform
- [ ] Test API keys are working
- [ ] Verify image domains in next.config.js
- [ ] Test localStorage works on production domain
- [ ] Check console for errors
- [ ] Test on mobile devices
- [ ] Verify dark mode works
- [ ] Check accessibility (keyboard nav, screen readers)

---

**Design Philosophy**: Start simple, add complexity only when needed. Every line of code should earn its place.
