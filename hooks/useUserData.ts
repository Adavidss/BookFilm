/**
 * User Data Storage Hook
 *
 * Manages user's read books and watched shows using localStorage.
 * Provides simple CRUD operations for user lists.
 */

import { useState, useEffect } from 'react';
import { Book, TVShow, UserBook, UserShow, UserData, BookStatus, ShowStatus, Review, Note, Quote, Shelf, Challenge, Series, List } from '@/types';

const STORAGE_KEY = 'showbook_user_data';

const defaultUserData: UserData = {
  readBooks: [],
  watchedShows: [],
  shelves: [],
  challenges: [],
  quotes: [],
  series: [],
  lists: [],
  readingGoals: {},
  readingStreak: {
    currentStreak: 0,
    longestStreak: 0,
  },
};

export function useUserData() {
  const [userData, setUserData] = useState<UserData>(defaultUserData);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure backward compatibility
        setUserData({
          readBooks: parsed.readBooks || [],
          watchedShows: parsed.watchedShows || [],
          shelves: parsed.shelves || [],
          challenges: parsed.challenges || [],
          quotes: parsed.quotes || [],
          series: parsed.series || [],
          lists: parsed.lists || [],
          readingGoals: parsed.readingGoals || {},
          readingStreak: parsed.readingStreak || {
            currentStreak: 0,
            longestStreak: 0,
          },
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      } catch (error) {
        console.error('Error saving user data:', error);
      }
    }
  }, [userData, isLoading]);

  // Add a book to read list
  const addBook = (book: Book, status: BookStatus = 'want-to-read') => {
    setUserData(prev => {
      // Check if already exists
      if (prev.readBooks.some(ub => ub.book.id === book.id)) {
        return prev;
      }

      return {
        ...prev,
        readBooks: [
          ...prev.readBooks,
          { book, addedAt: Date.now(), status }
        ],
      };
    });
  };

  // Remove a book from read list
  const removeBook = (bookId: string) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.filter(ub => ub.book.id !== bookId),
    }));
  };

  // Add a show to watched list
  const addShow = (show: TVShow, status: ShowStatus = 'want-to-watch') => {
    setUserData(prev => {
      // Check if already exists
      if (prev.watchedShows.some(us => us.show.id === show.id)) {
        return prev;
      }

      return {
        ...prev,
        watchedShows: [
          ...prev.watchedShows,
          { show, addedAt: Date.now(), status }
        ],
      };
    });
  };

  // Remove a show from watched list
  const removeShow = (showId: string) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.filter(us => us.show.id !== showId),
    }));
  };

  // Check if a book is in the user's list
  const hasBook = (bookId: string): boolean => {
    return userData.readBooks.some(ub => ub.book.id === bookId);
  };

  // Check if a show is in the user's list
  const hasShow = (showId: string): boolean => {
    return userData.watchedShows.some(us => us.show.id === showId);
  };

  // Get rating for a book
  const getBookRating = (bookId: string): number | undefined => {
    const userBook = userData.readBooks.find(ub => ub.book.id === bookId);
    return userBook?.rating;
  };

  // Get rating for a show
  const getShowRating = (showId: string): number | undefined => {
    const userShow = userData.watchedShows.find(us => us.show.id === showId);
    return userShow?.rating;
  };

  // Set rating for a book
  const setBookRating = (bookId: string, rating: number) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId ? { ...ub, rating } : ub
      ),
    }));
  };

  // Set rating for a show
  const setShowRating = (showId: string, rating: number) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId ? { ...us, rating } : us
      ),
    }));
  };

  // Get status for a book
  const getBookStatus = (bookId: string): BookStatus | undefined => {
    const userBook = userData.readBooks.find(ub => ub.book.id === bookId);
    return userBook?.status;
  };

  // Get status for a show
  const getShowStatus = (showId: string): ShowStatus | undefined => {
    const userShow = userData.watchedShows.find(us => us.show.id === showId);
    return userShow?.status;
  };

  // Set status for a book
  const setBookStatus = (bookId: string, status: BookStatus) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId ? { ...ub, status } : ub
      ),
    }));
  };

  // Set status for a show
  const setShowStatus = (showId: string, status: ShowStatus) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId ? { ...us, status } : us
      ),
    }));
  };

  // Export user data as JSON
  const exportData = () => {
    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `showbook-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Import user data from JSON
  const importData = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          
          // Validate imported data structure
          if (!imported || typeof imported !== 'object') {
            throw new Error('Invalid file format');
          }
          
          if (!Array.isArray(imported.readBooks) || !Array.isArray(imported.watchedShows)) {
            throw new Error('Invalid data structure. Expected readBooks and watchedShows arrays.');
          }

          // Validate each book/show structure
          const validateBook = (ub: any) => {
            return ub && ub.book && typeof ub.book.id === 'string' && typeof ub.addedAt === 'number';
          };
          
          const validateShow = (us: any) => {
            return us && us.show && typeof us.show.id === 'string' && typeof us.addedAt === 'number';
          };

          const validBooks = imported.readBooks.filter(validateBook);
          const validShows = imported.watchedShows.filter(validateShow);

          if (validBooks.length !== imported.readBooks.length || validShows.length !== imported.watchedShows.length) {
            console.warn('Some items were invalid and skipped during import');
          }

          // Merge with existing data structure to preserve new fields
          setUserData(prev => ({
            ...prev,
            readBooks: validBooks,
            watchedShows: validShows,
            // Preserve new features if they exist in imported data
            shelves: imported.shelves || prev.shelves || [],
            challenges: imported.challenges || prev.challenges || [],
            quotes: imported.quotes || prev.quotes || [],
            series: imported.series || prev.series || [],
            lists: imported.lists || prev.lists || [],
            readingGoals: imported.readingGoals || prev.readingGoals || {},
            readingStreak: imported.readingStreak || prev.readingStreak || { currentStreak: 0, longestStreak: 0 },
          }));
          
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  // Progress tracking for books
  const updateBookProgress = (bookId: string, progress: {
    currentPage?: number;
    pagesRead?: number;
    progressPercentage?: number;
  }) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId 
          ? { 
              ...ub, 
              ...progress,
              lastReadDate: Date.now(),
            } 
          : ub
      ),
    }));
  };

  // Progress tracking for shows
  const updateShowProgress = (showId: string, progress: {
    currentSeason?: number;
    currentEpisode?: number;
    episodesWatched?: number;
    progressPercentage?: number;
  }) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId 
          ? { 
              ...us, 
              ...progress,
              lastWatchedDate: Date.now(),
            } 
          : us
      ),
    }));
  };

  // Date tracking for books
  const updateBookDates = (bookId: string, dates: {
    startDate?: number;
    finishDate?: number;
  }) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub => {
        if (ub.book.id !== bookId) return ub;
        
        const updated = { ...ub, ...dates };
        
        // If finishing, increment reread count
        if (dates.finishDate && ub.status === 'reading') {
          updated.rereadCount = (ub.rereadCount || 0) + 1;
          updated.rereadDates = [...(ub.rereadDates || []), dates.finishDate];
        }
        
        return updated;
      }),
    }));
  };

  // Date tracking for shows
  const updateShowDates = (showId: string, dates: {
    startDate?: number;
    finishDate?: number;
  }) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us => {
        if (us.show.id !== showId) return us;
        
        const updated = { ...us, ...dates };
        
        // If finishing, increment rewatch count
        if (dates.finishDate && us.status === 'watching') {
          updated.rewatchCount = (us.rewatchCount || 0) + 1;
          updated.rewatchDates = [...(us.rewatchDates || []), dates.finishDate];
        }
        
        return updated;
      }),
    }));
  };

  // Review management
  const setBookReview = (bookId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub => {
        if (ub.book.id !== bookId) return ub;
        const reviewId = ub.review?.id || `review-${Date.now()}`;
        return {
          ...ub,
          review: {
            id: reviewId,
            ...review,
            createdAt: ub.review?.createdAt || Date.now(),
          },
        };
      }),
    }));
  };

  const getBookReview = (bookId: string): Review | undefined => {
    const userBook = userData.readBooks.find(ub => ub.book.id === bookId);
    return userBook?.review;
  };

  const deleteBookReview = (bookId: string) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId ? { ...ub, review: undefined } : ub
      ),
    }));
  };

  const setShowReview = (showId: string, review: Omit<Review, 'id' | 'createdAt'>) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us => {
        if (us.show.id !== showId) return us;
        const reviewId = us.review?.id || `review-${Date.now()}`;
        return {
          ...us,
          review: {
            id: reviewId,
            ...review,
            createdAt: us.review?.createdAt || Date.now(),
          },
        };
      }),
    }));
  };

  const getShowReview = (showId: string): Review | undefined => {
    const userShow = userData.watchedShows.find(us => us.show.id === showId);
    return userShow?.review;
  };

  const deleteShowReview = (showId: string) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId ? { ...us, review: undefined } : us
      ),
    }));
  };

  // Tags management
  const addBookTag = (bookId: string, tag: string) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub => {
        if (ub.book.id !== bookId) return ub;
        const tags = ub.customTags || [];
        if (tags.includes(tag)) return ub;
        return { ...ub, customTags: [...tags, tag] };
      }),
    }));
  };

  const removeBookTag = (bookId: string, tag: string) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId
          ? { ...ub, customTags: (ub.customTags || []).filter(t => t !== tag) }
          : ub
      ),
    }));
  };

  const addShowTag = (showId: string, tag: string) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us => {
        if (us.show.id !== showId) return us;
        const tags = us.customTags || [];
        if (tags.includes(tag)) return us;
        return { ...us, customTags: [...tags, tag] };
      }),
    }));
  };

  const removeShowTag = (showId: string, tag: string) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId
          ? { ...us, customTags: (us.customTags || []).filter(t => t !== tag) }
          : us
      ),
    }));
  };

  // Notes management
  const addBookNote = (bookId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub => {
        if (ub.book.id !== bookId) return ub;
        const notes = ub.notes || [];
        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random()}`,
          ...note,
          createdAt: Date.now(),
        };
        return { ...ub, notes: [...notes, newNote] };
      }),
    }));
  };

  const updateBookNote = (bookId: string, noteId: string, updates: Partial<Note>) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub => {
        if (ub.book.id !== bookId) return ub;
        const notes = (ub.notes || []).map(note =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: Date.now() }
            : note
        );
        return { ...ub, notes };
      }),
    }));
  };

  const deleteBookNote = (bookId: string, noteId: string) => {
    setUserData(prev => ({
      ...prev,
      readBooks: prev.readBooks.map(ub =>
        ub.book.id === bookId
          ? { ...ub, notes: (ub.notes || []).filter(n => n.id !== noteId) }
          : ub
      ),
    }));
  };

  const addShowNote = (showId: string, note: Omit<Note, 'id' | 'createdAt'>) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us => {
        if (us.show.id !== showId) return us;
        const notes = us.notes || [];
        const newNote: Note = {
          id: `note-${Date.now()}-${Math.random()}`,
          ...note,
          createdAt: Date.now(),
        };
        return { ...us, notes: [...notes, newNote] };
      }),
    }));
  };

  const updateShowNote = (showId: string, noteId: string, updates: Partial<Note>) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us => {
        if (us.show.id !== showId) return us;
        const notes = (us.notes || []).map(note =>
          note.id === noteId
            ? { ...note, ...updates, updatedAt: Date.now() }
            : note
        );
        return { ...us, notes };
      }),
    }));
  };

  const deleteShowNote = (showId: string, noteId: string) => {
    setUserData(prev => ({
      ...prev,
      watchedShows: prev.watchedShows.map(us =>
        us.show.id === showId
          ? { ...us, notes: (us.notes || []).filter(n => n.id !== noteId) }
          : us
      ),
    }));
  };

  // Shelves management
  const createShelf = (shelf: Omit<Shelf, 'id' | 'createdAt'>) => {
    const newShelf: Shelf = {
      ...shelf,
      id: `shelf-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    setUserData(prev => ({
      ...prev,
      shelves: [...(prev.shelves || []), newShelf],
    }));
    return newShelf.id;
  };

  const updateShelf = (shelfId: string, updates: Partial<Shelf>) => {
    setUserData(prev => ({
      ...prev,
      shelves: (prev.shelves || []).map(shelf =>
        shelf.id === shelfId ? { ...shelf, ...updates } : shelf
      ),
    }));
  };

  const deleteShelf = (shelfId: string) => {
    setUserData(prev => ({
      ...prev,
      shelves: (prev.shelves || []).filter(shelf => shelf.id !== shelfId),
    }));
  };

  const addToShelf = (shelfId: string, bookId?: string, showId?: string) => {
    setUserData(prev => ({
      ...prev,
      shelves: (prev.shelves || []).map(shelf => {
        if (shelf.id !== shelfId) return shelf;
        const updated = { ...shelf };
        if (bookId && !updated.bookIds.includes(bookId)) {
          updated.bookIds = [...updated.bookIds, bookId];
        }
        if (showId && !updated.showIds.includes(showId)) {
          updated.showIds = [...updated.showIds, showId];
        }
        return updated;
      }),
    }));
  };

  const removeFromShelf = (shelfId: string, bookId?: string, showId?: string) => {
    setUserData(prev => ({
      ...prev,
      shelves: (prev.shelves || []).map(shelf => {
        if (shelf.id !== shelfId) return shelf;
        return {
          ...shelf,
          bookIds: bookId ? shelf.bookIds.filter(id => id !== bookId) : shelf.bookIds,
          showIds: showId ? shelf.showIds.filter(id => id !== showId) : shelf.showIds,
        };
      }),
    }));
  };

  // Challenges management
  const createChallenge = (challenge: Omit<Challenge, 'id' | 'createdAt'>) => {
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
      current: 0,
      status: 'active',
    };
    setUserData(prev => ({
      ...prev,
      challenges: [...(prev.challenges || []), newChallenge],
    }));
    return newChallenge.id;
  };

  const updateChallenge = (challengeId: string, updates: Partial<Challenge>) => {
    setUserData(prev => ({
      ...prev,
      challenges: (prev.challenges || []).map(challenge => {
        if (challenge.id !== challengeId) return challenge;
        const updated = { ...challenge, ...updates };
        // Auto-update status based on progress
        if (updated.current >= updated.target) {
          updated.status = 'completed';
        }
        return updated;
      }),
    }));
  };

  const deleteChallenge = (challengeId: string) => {
    setUserData(prev => ({
      ...prev,
      challenges: (prev.challenges || []).filter(challenge => challenge.id !== challengeId),
    }));
  };

  // Quotes management
  const addQuote = (quote: Omit<Quote, 'id' | 'createdAt'>) => {
    const newQuote: Quote = {
      ...quote,
      id: `quote-${Date.now()}-${Math.random()}`,
      createdAt: Date.now(),
    };
    setUserData(prev => ({
      ...prev,
      quotes: [...(prev.quotes || []), newQuote],
    }));
    return newQuote.id;
  };

  const updateQuote = (quoteId: string, updates: Partial<Quote>) => {
    setUserData(prev => ({
      ...prev,
      quotes: (prev.quotes || []).map(quote =>
        quote.id === quoteId ? { ...quote, ...updates } : quote
      ),
    }));
  };

  const deleteQuote = (quoteId: string) => {
    setUserData(prev => ({
      ...prev,
      quotes: (prev.quotes || []).filter(quote => quote.id !== quoteId),
    }));
  };

  // Reading goals
  const updateReadingGoals = (goals: Partial<UserData['readingGoals']>) => {
    setUserData(prev => ({
      ...prev,
      readingGoals: { ...(prev.readingGoals || {}), ...goals },
    }));
  };

  // Update reading streak
  const updateReadingStreak = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTimestamp = today.getTime();

    setUserData(prev => {
      const streak = prev.readingStreak || { currentStreak: 0, longestStreak: 0 };
      const lastActivity = streak.lastActivityDate 
        ? new Date(streak.lastActivityDate)
        : null;
      
      if (lastActivity) {
        lastActivity.setHours(0, 0, 0, 0);
        const daysDiff = Math.floor((todayTimestamp - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff === 1) {
          // Consecutive day
          const newStreak = streak.currentStreak + 1;
          return {
            ...prev,
            readingStreak: {
              currentStreak: newStreak,
              longestStreak: Math.max(newStreak, streak.longestStreak),
              lastActivityDate: todayTimestamp,
            },
          };
        } else if (daysDiff > 1) {
          // Streak broken
          return {
            ...prev,
            readingStreak: {
              currentStreak: 1,
              longestStreak: streak.longestStreak,
              lastActivityDate: todayTimestamp,
            },
          };
        }
        // Same day, no update needed
        return prev;
      } else {
        // First activity
        return {
          ...prev,
          readingStreak: {
            currentStreak: 1,
            longestStreak: 1,
            lastActivityDate: todayTimestamp,
          },
        };
      }
    });
  };

  // Clear all data (for testing or reset)
  const clearAll = () => {
    setUserData(defaultUserData);
  };

  return {
    userData,
    isLoading,
    addBook,
    removeBook,
    addShow,
    removeShow,
    hasBook,
    hasShow,
    getBookRating,
    getShowRating,
    setBookRating,
    setShowRating,
    getBookStatus,
    getShowStatus,
    setBookStatus,
    setShowStatus,
    // Progress tracking
    updateBookProgress,
    updateShowProgress,
    // Date tracking
    updateBookDates,
    updateShowDates,
    // Reviews
    setBookReview,
    getBookReview,
    deleteBookReview,
    setShowReview,
    getShowReview,
    deleteShowReview,
    // Tags
    addBookTag,
    removeBookTag,
    addShowTag,
    removeShowTag,
    // Notes
    addBookNote,
    updateBookNote,
    deleteBookNote,
    addShowNote,
    updateShowNote,
    deleteShowNote,
    // Challenges
    createChallenge,
    updateChallenge,
    deleteChallenge,
    // Goals and streaks
    updateReadingGoals,
    updateReadingStreak,
    exportData,
    importData,
    clearAll,
  };
}
