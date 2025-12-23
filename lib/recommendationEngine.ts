/**
 * Recommendation Engine
 *
 * Simple, deterministic, explainable recommendation logic.
 * Uses content-based filtering with genre/tag matching.
 * NO LLMs, NO AI APIs - just clean heuristics.
 */

import { Book, TVShow, Recommendation, UserBook, UserShow } from '@/types';

// Scoring weights for different matching criteria
const WEIGHTS = {
  EXACT_GENRE_MATCH: 10,
  PARTIAL_GENRE_MATCH: 5,
  TAG_MATCH: 3,
  POPULARITY_BONUS: 2, // If we have popularity data
};

/**
 * Calculate similarity score between two sets of genres/tags
 */
function calculateOverlap(set1: string[], set2: string[]): number {
  const normalized1 = set1.map(s => s.toLowerCase());
  const normalized2 = set2.map(s => s.toLowerCase());

  const intersection = normalized1.filter(item => normalized2.includes(item));
  return intersection.length;
}

/**
 * Generate explainable reasons for a recommendation
 */
function generateReasons(
  userItem: Book | TVShow,
  candidateItem: Book | TVShow
): string[] {
  const reasons: string[] = [];

  // Check genre overlap
  const genreOverlap = calculateOverlap(userItem.genres, candidateItem.genres);
  if (genreOverlap > 0) {
    const sharedGenres = userItem.genres
      .filter(g => candidateItem.genres.map(cg => cg.toLowerCase()).includes(g.toLowerCase()))
      .slice(0, 3); // Show max 3 genres
    reasons.push(`Shares genres: ${sharedGenres.join(', ')}`);
  }

  // Check tag overlap
  const tagOverlap = calculateOverlap(userItem.tags, candidateItem.tags);
  if (tagOverlap > 0) {
    const sharedTags = userItem.tags
      .filter(t => candidateItem.tags.map(ct => ct.toLowerCase()).includes(t.toLowerCase()))
      .slice(0, 2);
    if (sharedTags.length > 0) {
      reasons.push(`Similar themes: ${sharedTags.join(', ')}`);
    }
  }

  // If similar title (could indicate series, adaptations, etc.)
  const titleSimilarity = calculateTitleSimilarity(userItem.title, candidateItem.title);
  if (titleSimilarity > 0.5) {
    reasons.push('Related series or adaptation');
  }

  return reasons;
}

/**
 * Simple title similarity check (for series detection)
 */
function calculateTitleSimilarity(title1: string, title2: string): number {
  const words1 = title1.toLowerCase().split(/\s+/);
  const words2 = title2.toLowerCase().split(/\s+/);

  const commonWords = words1.filter(w => words2.includes(w) && w.length > 3);
  return commonWords.length / Math.max(words1.length, words2.length);
}

/**
 * Score a candidate item based on user's preferences
 */
function scoreItem(
  userItems: (Book | TVShow)[],
  candidate: Book | TVShow,
  excludeIds: Set<string>
): { score: number; reasons: string[] } {
  // Skip if user already has this item
  if (excludeIds.has(candidate.id)) {
    return { score: 0, reasons: [] };
  }

  let totalScore = 0;
  const allReasons: string[] = [];

  for (const userItem of userItems) {
    // Genre matching
    const genreOverlap = calculateOverlap(userItem.genres, candidate.genres);
    totalScore += genreOverlap * WEIGHTS.EXACT_GENRE_MATCH;

    // Tag matching
    const tagOverlap = calculateOverlap(userItem.tags, candidate.tags);
    totalScore += tagOverlap * WEIGHTS.TAG_MATCH;

    // Collect reasons if there's any match
    if (genreOverlap > 0 || tagOverlap > 0) {
      const reasons = generateReasons(userItem, candidate);
      allReasons.push(...reasons);
    }
  }

  // Deduplicate reasons
  const uniqueReasons = Array.from(new Set(allReasons)).slice(0, 3);

  return { score: totalScore, reasons: uniqueReasons };
}

/**
 * Recommend books based on user's read books
 */
export function recommendBooks(
  readBooks: UserBook[],
  candidateBooks: Book[],
  limit: number = 20
): Recommendation[] {
  const userBooks = readBooks.map(ub => ub.book);
  const excludeIds = new Set(userBooks.map(b => b.id));

  const scored = candidateBooks.map(candidate => {
    const { score, reasons } = scoreItem(userBooks, candidate, excludeIds);
    return {
      item: candidate,
      score,
      reasons: reasons.length > 0 ? reasons : ['Based on your reading history'],
    };
  });

  // Filter out zero scores and sort by score descending
  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Recommend TV shows based on user's watched shows
 */
export function recommendShows(
  watchedShows: UserShow[],
  candidateShows: TVShow[],
  limit: number = 20
): Recommendation[] {
  const userShows = watchedShows.map(us => us.show);
  const excludeIds = new Set(userShows.map(s => s.id));

  const scored = candidateShows.map(candidate => {
    const { score, reasons } = scoreItem(userShows, candidate, excludeIds);
    return {
      item: candidate,
      score,
      reasons: reasons.length > 0 ? reasons : ['Based on your viewing history'],
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Map TV show genres to book genres/subjects
 */
function mapTVGenreToBookGenres(tvGenre: string): string[] {
  const genreMap: { [key: string]: string[] } = {
    'Drama': ['Fiction', 'Drama'],
    'Comedy': ['Fiction', 'Humor'],
    'Action': ['Fiction', 'Thriller', 'Adventure'],
    'Action & Adventure': ['Fiction', 'Thriller', 'Adventure'],
    'Adventure': ['Fiction', 'Adventure'],
    'Crime': ['Mystery', 'Thriller', 'Crime'],
    'Mystery': ['Mystery', 'Thriller'],
    'Thriller': ['Thriller', 'Mystery'],
    'Sci-Fi & Fantasy': ['Science Fiction', 'Fantasy'],
    'Sci-Fi': ['Science Fiction'],
    'Science Fiction': ['Science Fiction'],
    'Fantasy': ['Fantasy', 'Fiction'],
    'Horror': ['Horror', 'Thriller'],
    'Romance': ['Romance', 'Fiction'],
    'Documentary': ['Non-Fiction', 'History', 'Biography'],
    'History': ['History', 'Non-Fiction'],
    'War & Politics': ['History', 'Non-Fiction', 'Politics'],
    'Western': ['Westerns', 'Fiction'],
    'Animation': ['Fiction', 'Children'],
    'Family': ['Fiction', 'Children'],
    'Kids': ['Fiction', 'Children'],
  };
  
  return genreMap[tvGenre] || ['Fiction'];
}

/**
 * Score a book candidate based on TV show preferences with genre mapping
 */
function scoreBookFromShows(
  userShows: TVShow[],
  candidateBook: Book,
  excludeIds: Set<string>
): { score: number; reasons: string[] } {
  if (excludeIds.has(candidateBook.id)) {
    return { score: 0, reasons: [] };
  }

  let totalScore = 0;
  const allReasons: string[] = [];
  const matchedGenres = new Set<string>();

  for (const userShow of userShows) {
    // Map TV show genres to book genres
    for (const tvGenre of userShow.genres) {
      const mappedBookGenres = mapTVGenreToBookGenres(tvGenre);
      
      // Check if candidate book matches any mapped genre
      for (const mappedGenre of mappedBookGenres) {
        const normalizedMapped = mappedGenre.toLowerCase().trim();
        const bookGenresNormalized = candidateBook.genres.map(g => g.toLowerCase().trim());
        
        // Exact match
        if (bookGenresNormalized.includes(normalizedMapped)) {
          totalScore += WEIGHTS.EXACT_GENRE_MATCH;
          matchedGenres.add(mappedGenre);
        } else {
          // Partial match (e.g., "Science Fiction" matches "science fiction" or contains the words)
          const mappedWords = normalizedMapped.split(/\s+/);
          const hasPartialMatch = bookGenresNormalized.some(bg => {
            return mappedWords.some(word => word.length > 3 && bg.includes(word));
          });
          if (hasPartialMatch) {
            totalScore += WEIGHTS.PARTIAL_GENRE_MATCH;
            matchedGenres.add(mappedGenre);
          }
        }
      }
    }

    // Tag matching (direct comparison)
    const tagOverlap = calculateOverlap(userShow.tags, candidateBook.tags);
    totalScore += tagOverlap * WEIGHTS.TAG_MATCH;

    // Title similarity (for adaptations)
    const titleSimilarity = calculateTitleSimilarity(userShow.title, candidateBook.title);
    if (titleSimilarity > 0.5) {
      totalScore += WEIGHTS.POPULARITY_BONUS * 2; // Bonus for adaptations
      allReasons.push('Related to a show you watched');
    }
  }

  // Generate reasons from matched genres
  if (matchedGenres.size > 0) {
    const genreList = Array.from(matchedGenres).slice(0, 3);
    allReasons.push(`Similar genres: ${genreList.join(', ')}`);
  }

  // Deduplicate reasons
  const uniqueReasons = Array.from(new Set(allReasons)).slice(0, 3);

  return { score: totalScore, reasons: uniqueReasons };
}

/**
 * Cross-recommend: Books based on TV shows
 * Uses genre/tag matching between different content types with proper genre mapping
 */
export function recommendBooksFromShows(
  watchedShows: UserShow[],
  candidateBooks: Book[],
  limit: number = 15
): Recommendation[] {
  if (watchedShows.length === 0) {
    return [];
  }

  const userShows = watchedShows.map(us => us.show);
  const excludeIds = new Set<string>(); // No exclusions for cross-recommendations

  const scored = candidateBooks.map(candidate => {
    const { score, reasons } = scoreBookFromShows(userShows, candidate, excludeIds);
    return {
      item: candidate,
      score,
      reasons: reasons.length > 0
        ? reasons.map(r => `From your TV shows: ${r}`)
        : ['Based on shows you\'ve watched'],
    };
  });

  // If no books scored > 0, still return the top books (they'll get a default reason)
  const filtered = scored.filter(r => r.score > 0);
  if (filtered.length === 0 && scored.length > 0) {
    // Return top books even with zero score, but give them a minimal score
    return scored
      .map(r => ({ ...r, score: r.score || 0.1, reasons: r.reasons.length > 0 ? r.reasons : ['Based on shows you\'ve watched'] }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }
  
  return filtered
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Cross-recommend: TV shows based on books
 */
export function recommendShowsFromBooks(
  readBooks: UserBook[],
  candidateShows: TVShow[],
  limit: number = 15
): Recommendation[] {
  const userBooks = readBooks.map(ub => ub.book);
  const excludeIds = new Set<string>();

  const scored = candidateShows.map(candidate => {
    const { score, reasons } = scoreItem(userBooks, candidate, excludeIds);
    return {
      item: candidate,
      score,
      reasons: reasons.length > 0
        ? reasons.map(r => `From your books: ${r}`)
        : ['Based on books you\'ve read'],
    };
  });

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

/**
 * Collaborative filtering helper
 * This would use precomputed "users who liked X also liked Y" data
 * For now, returns empty - implement when you have usage data
 */
export function getCollaborativeRecommendations(
  itemId: string,
  contentType: 'book' | 'show',
  limit: number = 10
): string[] {
  // TODO: Implement when you have collaborative data
  // This could be populated from:
  // - Manual curation
  // - External "similar items" APIs
  // - Aggregated usage patterns from friends
  return [];
}
