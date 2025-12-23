// Core type definitions for the app

export interface Book {
  id: string;
  title: string;
  authors: string[];
  genres: string[];
  tags: string[];
  description?: string;
  coverImage?: string;
  publishedDate?: string;
  pageCount?: number;
  // Availability
  amazonLink?: string;
  kindleLink?: string;
  audibleLink?: string;
  // Ratings from Google Books API
  averageRating?: number; // 1-5 star rating
  ratingsCount?: number; // Number of ratings
}

export interface TVShow {
  id: string;
  title: string;
  genres: string[];
  tags: string[];
  description?: string;
  posterImage?: string;
  firstAirDate?: string;
  status?: 'Returning Series' | 'Ended' | 'Canceled' | 'In Production';
  numberOfSeasons?: number;
  // Availability - array of streaming platforms
  platforms?: StreamingPlatform[];
  // Ratings
  tmdbRating?: number;
  imdbId?: string;
}

export interface StreamingPlatform {
  name: string;
  logo?: string;
  link?: string;
}

export type BookStatus = 'want-to-read' | 'reading' | 'read' | 'dropped';
export type ShowStatus = 'want-to-watch' | 'watching' | 'watched' | 'dropped';

export interface UserBook {
  book: Book;
  addedAt: number;
  rating?: number; // 1-5 star rating
  status?: BookStatus;
  // Progress tracking
  currentPage?: number;
  pagesRead?: number;
  progressPercentage?: number;
  // Date tracking
  startDate?: number; // timestamp
  finishDate?: number; // timestamp
  lastReadDate?: number; // timestamp
  // Custom tags
  customTags?: string[];
  // Review
  review?: Review;
  // Notes
  notes?: Note[];
  // Re-reading tracking
  rereadCount?: number;
  rereadDates?: number[]; // timestamps of finish dates
}

export interface UserShow {
  show: TVShow;
  addedAt: number;
  rating?: number; // 1-5 star rating
  status?: ShowStatus;
  // Progress tracking
  currentSeason?: number;
  currentEpisode?: number;
  episodesWatched?: number;
  progressPercentage?: number;
  // Date tracking
  startDate?: number; // timestamp
  finishDate?: number; // timestamp
  lastWatchedDate?: number; // timestamp
  // Custom tags
  customTags?: string[];
  // Review
  review?: Review;
  // Notes
  notes?: Note[];
  // Re-watching tracking
  rewatchCount?: number;
  rewatchDates?: number[]; // timestamps of finish dates
}

export interface Recommendation {
  item: Book | TVShow;
  score: number;
  reasons: string[]; // Explainable reasons for recommendation
}

// Review interface
export interface Review {
  id: string;
  content: string; // Review text
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
  hasSpoilers?: boolean;
  spoilerSection?: string; // Optional spoiler section
}

// Note interface
export interface Note {
  id: string;
  content: string;
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
  pageNumber?: number; // For books
  episodeNumber?: number; // For shows
  seasonNumber?: number; // For shows
  isQuote?: boolean; // If it's a highlighted quote
}

// Quote interface
export interface Quote {
  id: string;
  content: string;
  bookId?: string;
  showId?: string;
  author?: string;
  pageNumber?: number;
  createdAt: number; // timestamp
  tags?: string[];
}

// Shelf interface
export interface Shelf {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  bookIds: string[];
  showIds: string[];
  createdAt: number; // timestamp
  isDefault?: boolean; // For default shelves
}

// Challenge interface
export interface Challenge {
  id: string;
  name: string;
  type: 'annual' | 'monthly' | 'genre' | 'pages' | 'custom';
  target: number; // Target number (books, pages, etc.)
  current: number; // Current progress
  startDate: number; // timestamp
  endDate: number; // timestamp
  genre?: string; // For genre challenges
  status: 'active' | 'completed' | 'failed';
  createdAt: number; // timestamp
}

// Series interface
export interface Series {
  id: string;
  name: string;
  type: 'book' | 'show';
  items: Array<{ id: string; title: string; order: number }>;
  userProgress?: {
    currentItemId?: string;
    completedItems: string[];
  };
}

// List interface
export interface List {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  bookIds: string[];
  showIds: string[];
  order: number[]; // Ordered IDs
  createdAt: number; // timestamp
  updatedAt?: number; // timestamp
}

export interface UserData {
  readBooks: UserBook[];
  watchedShows: UserShow[];
  // New features
  shelves?: Shelf[];
  challenges?: Challenge[];
  quotes?: Quote[];
  series?: Series[];
  lists?: List[];
  // Reading goals
  readingGoals?: {
    dailyPages?: number;
    weeklyPages?: number;
    monthlyBooks?: number;
    yearlyBooks?: number;
  };
  // Streak tracking
  readingStreak?: {
    currentStreak: number; // days
    longestStreak: number; // days
    lastActivityDate?: number; // timestamp
  };
}

export type ContentType = 'book' | 'show';

export interface SearchResult {
  books: Book[];
  shows: TVShow[];
}

// Discovery modes
export type DiscoveryMode = 'personalized' | 'trending' | 'new' | 'upcoming';

// Filter/sort options
export interface FilterOptions {
  genres?: string[];
  minScore?: number;
}
