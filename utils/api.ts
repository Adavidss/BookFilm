/**
 * API Integration Utilities
 *
 * Real API integrations with public metadata services:
 * - TMDb API for TV shows
 * - Google Books API for books
 * - JustWatch (via unofficial APIs) for streaming availability
 *
 * NO FAKE APIs - these are real, documented endpoints
 * API keys should be stored in .env.local (not committed)
 */

import { Book, TVShow, StreamingPlatform } from '@/types';
import { APIError, NetworkError, ConfigurationError, retryWithBackoff } from './errors';
import { getCached, setCached } from '@/lib/cache';

// ======================
// TMDB API (TV Shows)
// ======================
// Get your free API key at: https://www.themoviedb.org/settings/api
// Add to .env.local: NEXT_PUBLIC_TMDB_API_KEY=your_key_here

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p/w500';

// Enhanced TV show interface with ratings
interface TMDBShow {
  vote_average?: number;
  vote_count?: number;
}

export async function searchTVShows(query: string): Promise<TVShow[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError(
      'TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.'
    );
  }

  // Check cache first
  const cacheKey = `searchTVShows:${query}`;
  const cached = getCached<TVShow[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(
        `${TMDB_BASE_URL}/search/tv?api_key=${apiKey}&query=${encodeURIComponent(query)}`
      );
      
      if (!res.ok) {
        if (res.status === 401) {
          throw new APIError('Invalid TMDB API key. Please check your configuration.', 401, false);
        }
        if (res.status >= 500) {
          throw new APIError('TMDB service is temporarily unavailable. Please try again later.', res.status, true);
        }
        throw new APIError(`Failed to search TV shows: ${res.statusText}`, res.status, res.status >= 500);
      }
      
      return res;
    });

    const data = await response.json();

    if (data.errors) {
      throw new APIError(data.errors[0] || 'Failed to search TV shows', response.status);
    }

    if (!data.results || data.results.length === 0) {
      return [];
    }

    // Fetch detailed info for each show to get genres and ratings
    const showsWithDetails = await Promise.all(
      data.results.slice(0, 10).map(async (show: any) => {
        try {
          const details = await getShowDetails(`tv-${show.id}`);
          return details || {
            id: `tv-${show.id}`,
            title: show.name,
            genres: [],
            tags: [],
            description: show.overview,
            posterImage: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
            firstAirDate: show.first_air_date,
            platforms: [],
          };
        } catch (error) {
          // If details fail, return basic info
          return {
            id: `tv-${show.id}`,
            title: show.name,
            genres: [],
            tags: [],
            description: show.overview,
            posterImage: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
            firstAirDate: show.first_air_date,
            platforms: [],
          };
        }
      })
    );

    const result = showsWithDetails.filter((s): s is TVShow => s !== null);
    
    // Cache the result
    setCached(cacheKey, result, undefined, 6 * 60 * 60 * 1000); // 6 hours for search results
    
    return result;
  } catch (error) {
    if (error instanceof APIError || error instanceof ConfigurationError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to TMDB. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while searching TV shows', undefined, true);
  }
}

export async function getShowDetails(tmdbId: string): Promise<TVShow | null> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return null;

  try {
    const id = tmdbId.replace('tv-', '');

    // Fetch show details and external IDs in parallel
    const [showResponse, externalIdsResponse, watchProvidersResponse] = await Promise.all([
      fetch(`${TMDB_BASE_URL}/tv/${id}?api_key=${apiKey}&append_to_response=keywords`),
      fetch(`${TMDB_BASE_URL}/tv/${id}/external_ids?api_key=${apiKey}`),
      fetch(`${TMDB_BASE_URL}/tv/${id}/watch/providers?api_key=${apiKey}`)
    ]);

    const show = await showResponse.json();
    const externalIds = await externalIdsResponse.json();
    const watchProviders = await watchProvidersResponse.json();

    // Get US streaming providers
    const usProviders = watchProviders.results?.US;
    const platforms: StreamingPlatform[] = [];

    // Map of provider names to their search URLs
    const providerLinks: { [key: string]: (title: string) => string } = {
      'Netflix': (title) => `https://www.netflix.com/search?q=${encodeURIComponent(title)}`,
      'Amazon Prime Video': (title) => `https://www.amazon.com/s?k=${encodeURIComponent(title)}&i=instant-video`,
      'Hulu': (title) => `https://www.hulu.com/search?q=${encodeURIComponent(title)}`,
      'Disney Plus': (title) => `https://www.disneyplus.com/search?q=${encodeURIComponent(title)}`,
      'HBO Max': (title) => `https://play.max.com/search?q=${encodeURIComponent(title)}`,
      'Apple TV Plus': (title) => `https://tv.apple.com/search?q=${encodeURIComponent(title)}`,
      'Paramount Plus': (title) => `https://www.paramountplus.com/search/?query=${encodeURIComponent(title)}`,
      'Peacock': (title) => `https://www.peacocktv.com/search?q=${encodeURIComponent(title)}`,
    };

    if (usProviders?.flatrate) {
      platforms.push(...usProviders.flatrate.map((p: any) => ({
        name: p.provider_name,
        logo: `${TMDB_IMAGE_BASE}${p.logo_path}`,
        link: providerLinks[p.provider_name]?.(show.name),
      })));
    }

    return {
      id: `tv-${show.id}`,
      title: show.name,
      genres: show.genres.map((g: any) => g.name),
      tags: show.keywords?.results?.map((k: any) => k.name) || [],
      description: show.overview,
      posterImage: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
      firstAirDate: show.first_air_date,
      status: show.status,
      numberOfSeasons: show.number_of_seasons,
      platforms,
      tmdbRating: show.vote_average ? Number(show.vote_average.toFixed(1)) : undefined,
      imdbId: externalIds.imdb_id || undefined,
    };
  } catch (error) {
    console.error('Error fetching show details:', error);
    return null;
  }
}

export async function getTrendingShows(): Promise<TVShow[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError(
      'TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.'
    );
  }

  // Check cache first (trending changes daily, so cache for 12 hours)
  const cacheKey = 'getTrendingShows';
  const cached = getCached<TVShow[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${TMDB_BASE_URL}/trending/tv/week?api_key=${apiKey}`);
      if (!res.ok) {
        throw new APIError(`Failed to fetch trending shows: ${res.statusText}`, res.status, res.status >= 500);
      }
      return res;
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const showsWithDetails = await Promise.all(
      data.results.slice(0, 20).map(async (show: any) => {
        try {
          const details = await getShowDetails(`tv-${show.id}`);
          return details || {
            id: `tv-${show.id}`,
            title: show.name,
            genres: [],
            tags: [],
            description: show.overview,
            posterImage: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
            firstAirDate: show.first_air_date,
            platforms: [],
          };
        } catch (error) {
          return {
            id: `tv-${show.id}`,
            title: show.name,
            genres: [],
            tags: [],
            description: show.overview,
            posterImage: show.poster_path ? `${TMDB_IMAGE_BASE}${show.poster_path}` : undefined,
            firstAirDate: show.first_air_date,
            platforms: [],
          };
        }
      })
    );

    const result = showsWithDetails.filter((s): s is TVShow => s !== null);
    
    // Cache for 12 hours (trending updates daily)
    setCached(cacheKey, result, undefined, 12 * 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    if (error instanceof APIError || error instanceof ConfigurationError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to TMDB. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while fetching trending shows', undefined, true);
  }
}

// Fetch shows by genre for recommendations
export async function getShowsByGenre(genreIds: number[], limit: number = 20): Promise<TVShow[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) return [];

  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/discover/tv?api_key=${apiKey}&with_genres=${genreIds.join(',')}&sort_by=popularity.desc`
    );
    const data = await response.json();

    const shows = await Promise.all(
      data.results.slice(0, limit).map(async (show: any) => {
        const details = await getShowDetails(`tv-${show.id}`);
        return details;
      })
    );

    return shows.filter((s): s is TVShow => s !== null);
  } catch (error) {
    console.error('Error fetching shows by genre:', error);
    return [];
  }
}

// Get popular shows as recommendation candidates
export async function getPopularShows(limit: number = 30): Promise<TVShow[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError(
      'TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.'
    );
  }

  // Check cache first
  const cacheKey = `getPopularShows:${limit}`;
  const cached = getCached<TVShow[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${TMDB_BASE_URL}/tv/popular?api_key=${apiKey}`);
      if (!res.ok) {
        throw new APIError(`Failed to fetch popular shows: ${res.statusText}`, res.status, res.status >= 500);
      }
      return res;
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const shows = await Promise.all(
      data.results.slice(0, limit).map(async (show: any) => {
        try {
          const details = await getShowDetails(`tv-${show.id}`);
          return details;
        } catch (error) {
          return null;
        }
      })
    );

    const result = shows.filter((s): s is TVShow => s !== null);
    
    // Cache for 12 hours
    setCached(cacheKey, result, undefined, 12 * 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    if (error instanceof APIError || error instanceof ConfigurationError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to TMDB. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while fetching popular shows', undefined, true);
  }
}

// ======================
// Google Books API
// ======================
// No API key needed for basic usage (but rate limited)
// Optional: Add API key for higher limits

const GOOGLE_BOOKS_BASE = 'https://www.googleapis.com/books/v1';

export async function searchBooks(query: string): Promise<Book[]> {
  // Check cache first
  const cacheKey = `searchBooks:${query}`;
  const cached = getCached<Book[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    const response = await retryWithBackoff(async () => {
      const res = await fetch(
        `${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}${keyParam}`
      );
      
      if (!res.ok) {
        if (res.status === 429) {
          throw new APIError('Too many requests. Please wait a moment and try again.', 429, true);
        }
        if (res.status >= 500) {
          throw new APIError('Google Books service is temporarily unavailable. Please try again later.', res.status, true);
        }
        throw new APIError(`Failed to search books: ${res.statusText}`, res.status, res.status >= 500);
      }
      
      return res;
    });

    const data = await response.json();

    if (data.error) {
      throw new APIError(data.error.message || 'Failed to search books', data.error.code);
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const result = data.items.map((item: any) => {
      const volumeInfo = item.volumeInfo;

      // Get high-quality cover image
      let coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
      if (coverImage) {
        coverImage = coverImage
          .replace('zoom=1', 'zoom=3')
          .replace('&edge=curl', '')
          .replace('http://', 'https://');
      }

      // Get average rating from Google Books API
      const averageRating = volumeInfo.averageRating ? Number(volumeInfo.averageRating.toFixed(1)) : undefined;
      const ratingsCount = volumeInfo.ratingsCount || undefined;

      return {
        id: `book-${item.id}`,
        title: volumeInfo.title,
        authors: volumeInfo.authors || [],
        genres: volumeInfo.categories || [],
        tags: volumeInfo.subjects || [],
        description: volumeInfo.description,
        coverImage,
        publishedDate: volumeInfo.publishedDate,
        pageCount: volumeInfo.pageCount,
        amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors),
        kindleLink: generateKindleLink(volumeInfo.title, volumeInfo.authors),
        audibleLink: generateAudibleLink(volumeInfo.title, volumeInfo.authors),
        averageRating,
        ratingsCount,
      };
    });

    // Cache the result
    setCached(cacheKey, result, undefined, 6 * 60 * 60 * 1000); // 6 hours for search results
    
    return result;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to Google Books. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while searching books', undefined, true);
  }
}

export async function getBookDetails(googleBooksId: string): Promise<Book | null> {
  try {
    const id = googleBooksId.replace('book-', '');
    const response = await fetch(`${GOOGLE_BOOKS_BASE}/volumes/${id}`);
    const item = await response.json();
    const volumeInfo = item.volumeInfo;

    // Get high-quality cover image
    let coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
    if (coverImage) {
      coverImage = coverImage
        .replace('zoom=1', 'zoom=3')
        .replace('&edge=curl', '')
        .replace('http://', 'https://');
    }

    return {
      id: `book-${item.id}`,
      title: volumeInfo.title,
      authors: volumeInfo.authors || [],
      genres: volumeInfo.categories || [],
      tags: volumeInfo.subjects || [],
      description: volumeInfo.description,
      coverImage,
      publishedDate: volumeInfo.publishedDate,
      pageCount: volumeInfo.pageCount,
      amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors),
      kindleLink: generateKindleLink(volumeInfo.title, volumeInfo.authors),
      audibleLink: generateAudibleLink(volumeInfo.title, volumeInfo.authors),
    };
  } catch (error) {
    console.error('Error fetching book details:', error);
    return null;
  }
}

// Fetch books by genre for recommendations
export async function getBooksByGenre(genres: string[], limit: number = 20): Promise<Book[]> {
  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    // Map genre names to Google Books API subject terms
    const genreMap: { [key: string]: string } = {
      'Non-Fiction': 'nonfiction',
      'Science Fiction': 'science fiction',
      'Self-Help': 'self-help',
    };

    // Search for books in specific genres
    // Use OR logic: search for each genre separately and combine results
    // Google Books API: use | for OR, or search each genre separately
    let allBooks: Book[] = [];
    
    for (const genre of genres.slice(0, 3)) { // Limit to 3 genres to avoid too many API calls
      const mappedGenre = genreMap[genre] || genre.toLowerCase();
      const query = `subject:${mappedGenre}`;
      
      try {
        const response = await fetch(`${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}&maxResults=${Math.ceil(limit / genres.length)}${keyParam}`);
        
        if (!response.ok) {
          console.error(`Google Books API error for genre ${genre}: ${response.status} ${response.statusText}`);
          continue; // Try next genre
        }
        
        const data = await response.json();

        if (data.items && data.items.length > 0) {
          const books = data.items.map((item: any) => {
            const volumeInfo = item.volumeInfo;

            let coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
            if (coverImage) {
              coverImage = coverImage
                .replace('zoom=1', 'zoom=3')
                .replace('&edge=curl', '')
                .replace('http://', 'https://');
            }

            // Get average rating from Google Books API
            const averageRating = volumeInfo.averageRating ? Number(volumeInfo.averageRating.toFixed(1)) : undefined;
            const ratingsCount = volumeInfo.ratingsCount || undefined;

            return {
              id: `book-${item.id}`,
              title: volumeInfo.title,
              authors: volumeInfo.authors || [],
              genres: volumeInfo.categories || [],
              tags: volumeInfo.subjects || [],
              description: volumeInfo.description,
              coverImage,
              publishedDate: volumeInfo.publishedDate,
              pageCount: volumeInfo.pageCount,
              amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors),
              kindleLink: generateKindleLink(volumeInfo.title, volumeInfo.authors),
              audibleLink: generateAudibleLink(volumeInfo.title, volumeInfo.authors),
              averageRating,
              ratingsCount,
            };
          });
          
          allBooks.push(...books);
        }
      } catch (error) {
        console.error(`Error fetching books for genre ${genre}:`, error);
        continue; // Try next genre
      }
    }
    
    // Remove duplicates and limit results
    const uniqueBooks = Array.from(
      new Map(allBooks.map(book => [book.id, book])).values()
    ).slice(0, limit);
    
    return uniqueBooks;
  } catch (error) {
    console.error('Error fetching books by genre:', error);
    return [];
  }
}

// Get popular books as recommendation candidates
export async function getPopularBooks(limit: number = 30): Promise<Book[]> {
  // Check cache first
  const cacheKey = `getPopularBooks:${limit}`;
  const cached = getCached<Book[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_BOOKS_API_KEY || '';
    const keyParam = apiKey ? `&key=${apiKey}` : '';

    // Limit maxResults to 40 (Google Books API maximum)
    const maxResults = Math.min(limit, 40);
    
    // Use queries that target actual bestsellers and trending books
    // Search for recent popular fiction and non-fiction, excluding Library of Congress
    // We'll try multiple queries and combine results to get better variety
    const queries = [
      'subject:fiction+published:2022-2024', // Recent fiction (last 2-3 years for trending)
      'subject:nonfiction+published:2022-2024', // Recent non-fiction
      'subject:romance+published:2022-2024', // Popular genre
      'subject:mystery+published:2022-2024', // Popular genre
      'subject:thriller+published:2022-2024', // Popular genre
    ];
    
    let allBooks: Book[] = [];
    
    // Fetch from multiple queries to get variety
    for (const query of queries.slice(0, 3)) { // Use first 3 queries for better variety
      try {
        const url = `${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}&printType=books&orderBy=newest&maxResults=20${keyParam}`;
        
        const response = await retryWithBackoff(async () => {
          const res = await fetch(url);
          if (!res.ok) {
            if (res.status === 429) {
              throw new APIError('Too many requests. Please wait a moment and try again.', 429, true);
            }
            if (res.status >= 500) {
              throw new APIError('Google Books service is temporarily unavailable. Please try again later.', res.status, true);
            }
            // Skip 400 errors for individual queries, continue with others
            if (res.status === 400) {
              return null;
            }
            throw new APIError(`Failed to fetch popular books: ${res.statusText}`, res.status, res.status >= 500);
          }
          return res;
        });

        if (!response) continue; // Skip if query failed

        const data = await response.json();

        if (data.error) {
          continue; // Skip this query, try next one
        }

        if (data.items && data.items.length > 0) {
          const books = data.items.map((item: any) => {
            const volumeInfo = item.volumeInfo;

            // Filter out Library of Congress records
            // LOC records often have specific patterns in publisher or identifiers
            const publisher = volumeInfo.publisher?.toLowerCase() || '';
            const title = volumeInfo.title?.toLowerCase() || '';
            
            // Skip Library of Congress records
            if (publisher.includes('library of congress') || 
                publisher.includes('loc') ||
                title.includes('library of congress catalog') ||
                item.id?.includes('loc')) {
              return null;
            }

            // Skip if no cover image (likely not a real commercial book)
            // But allow some books without covers to ensure we have results
            // We'll filter this more leniently - only skip if it's clearly not a real book
            if (!volumeInfo.imageLinks?.thumbnail && !volumeInfo.imageLinks?.smallThumbnail) {
              // Only skip if it also lacks other important metadata
              if (!volumeInfo.authors || volumeInfo.authors.length === 0) {
                return null;
              }
              // Allow books without covers if they have good metadata
            }

            let coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
            if (coverImage) {
              coverImage = coverImage
                .replace('zoom=1', 'zoom=3')
                .replace('&edge=curl', '')
                .replace('http://', 'https://');
            }

            return {
              id: `book-${item.id}`,
              title: volumeInfo.title,
              authors: volumeInfo.authors || [],
              genres: volumeInfo.categories || [],
              tags: volumeInfo.subjects || [],
              description: volumeInfo.description,
              coverImage,
              publishedDate: volumeInfo.publishedDate,
              pageCount: volumeInfo.pageCount,
              amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors),
              kindleLink: generateKindleLink(volumeInfo.title, volumeInfo.authors),
              audibleLink: generateAudibleLink(volumeInfo.title, volumeInfo.authors),
            };
          }).filter((book: Book | null) => book !== null) as Book[];
          
          allBooks.push(...books);
        }
      } catch (error) {
        // Continue with next query if one fails
        console.warn(`Failed to fetch from query "${query}":`, error);
        continue;
      }
    }

    // Remove duplicates and limit results
    const uniqueBooks = Array.from(
      new Map(allBooks.map(book => [book.id, book])).values()
    ).slice(0, maxResults);

    // Cache for 24 hours (popular books don't change frequently)
    setCached(cacheKey, uniqueBooks, undefined, 24 * 60 * 60 * 1000);
    
    return uniqueBooks;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to Google Books. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while fetching popular books', undefined, true);
  }
}

// ======================
// Helper Functions
// ======================

function generateAmazonLink(title: string, authors?: string[]): string {
  const query = authors ? `${title} ${authors[0]}` : title;
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function generateKindleLink(title: string, authors?: string[]): string {
  const query = authors ? `${title} ${authors[0]} kindle` : `${title} kindle`;
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function generateAudibleLink(title: string, authors?: string[]): string {
  const query = authors ? `${title} ${authors[0]}` : title;
  return `https://www.audible.com/search?keywords=${encodeURIComponent(query)}`;
}

// ======================
// Streaming Availability
// ======================
export async function getStreamingAvailability(
  tmdbId: string
): Promise<StreamingPlatform[]> {
  // Handled in getShowDetails now
  return [];
}

// ======================
// Discovery Functions
// ======================

export async function getNewReleaseBooks(): Promise<Book[]> {
  // Check cache first
  const cacheKey = 'getNewReleaseBooks';
  const cached = getCached<Book[]>(cacheKey);
  if (cached) {
    return cached;
  }

  // Use a simple query - "subject:fiction" can cause 400 errors
  const query = `fiction`;

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${GOOGLE_BOOKS_BASE}/volumes?q=${encodeURIComponent(query)}&orderBy=newest&maxResults=20`);
      if (!res.ok) {
        if (res.status === 429) {
          throw new APIError('Too many requests. Please wait a moment and try again.', 429, true);
        }
        if (res.status >= 500) {
          throw new APIError('Google Books service is temporarily unavailable. Please try again later.', res.status, true);
        }
        throw new APIError(`Failed to fetch new books: ${res.statusText}`, res.status, res.status >= 500);
      }
      return res;
    });

    const data = await response.json();

    if (data.error) {
      throw new APIError(data.error.message || 'Failed to fetch new books', data.error.code);
    }

    if (!data.items || data.items.length === 0) {
      return [];
    }

    const result = data.items.slice(0, 20).map((item: any) => {
      const volumeInfo = item.volumeInfo;

      let coverImage = volumeInfo.imageLinks?.thumbnail || volumeInfo.imageLinks?.smallThumbnail;
      if (coverImage) {
        coverImage = coverImage
          .replace('zoom=1', 'zoom=3')
          .replace('&edge=curl', '')
          .replace('http://', 'https://');
      }

      return {
        id: `book-${item.id}`,
        title: volumeInfo.title,
        authors: volumeInfo.authors || [],
        genres: volumeInfo.categories || [],
        tags: [],
        description: volumeInfo.description,
        coverImage,
        publishedDate: volumeInfo.publishedDate,
        pageCount: volumeInfo.pageCount,
        amazonLink: generateAmazonLink(volumeInfo.title, volumeInfo.authors),
        kindleLink: generateKindleLink(volumeInfo.title, volumeInfo.authors),
        audibleLink: generateAudibleLink(volumeInfo.title, volumeInfo.authors),
      };
    });

    // Cache for 24 hours (new releases don't change daily)
    setCached(cacheKey, result, undefined, 24 * 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    if (error instanceof APIError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to Google Books. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while fetching new books', undefined, true);
  }
}

export async function getUpcomingShows(): Promise<TVShow[]> {
  const apiKey = process.env.NEXT_PUBLIC_TMDB_API_KEY;
  if (!apiKey) {
    throw new ConfigurationError(
      'TMDB API key is not configured. Please add NEXT_PUBLIC_TMDB_API_KEY to your .env.local file.'
    );
  }

  // Check cache first
  const cacheKey = 'getUpcomingShows';
  const cached = getCached<TVShow[]>(cacheKey);
  if (cached) {
    return cached;
  }

  try {
    const response = await retryWithBackoff(async () => {
      const res = await fetch(`${TMDB_BASE_URL}/tv/on_the_air?api_key=${apiKey}`);
      if (!res.ok) {
        throw new APIError(`Failed to fetch upcoming shows: ${res.statusText}`, res.status, res.status >= 500);
      }
      return res;
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return [];
    }

    const shows = await Promise.all(
      data.results.slice(0, 20).map(async (show: any) => {
        try {
          const details = await getShowDetails(`tv-${show.id}`);
          return details;
        } catch (error) {
          return null;
        }
      })
    );

    const result = shows.filter((s): s is TVShow => s !== null);
    
    // Cache for 12 hours
    setCached(cacheKey, result, undefined, 12 * 60 * 60 * 1000);
    
    return result;
  } catch (error) {
    if (error instanceof APIError || error instanceof ConfigurationError) {
      throw error;
    }
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Unable to connect to TMDB. Please check your internet connection.');
    }
    throw new APIError('An unexpected error occurred while fetching upcoming shows', undefined, true);
  }
}
