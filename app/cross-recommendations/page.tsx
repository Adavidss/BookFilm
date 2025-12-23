'use client';

import { useState, useEffect, useCallback } from 'react';
import { Book, TVShow, Recommendation, BookStatus, ShowStatus } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { getPopularBooks, getPopularShows, getBooksByGenre, getShowsByGenre, searchBooks } from '@/utils/api';
import { recommendBooksFromShows, recommendShowsFromBooks } from '@/lib/recommendationEngine';
import BookCard from '@/components/BookCard';
import ShowCard from '@/components/ShowCard';
import EnhancedDetailModal from '@/components/EnhancedDetailModal';

export default function CrossRecommendationsPage() {
  const {
    userData, addBook, addShow, hasBook, hasShow, getBookRating, getShowRating,
    setBookRating, setShowRating, getBookStatus, getShowStatus, setBookStatus, setShowStatus,
    getBookReview, getShowReview, setBookReview, setShowReview, deleteBookReview, deleteShowReview,
    updateBookProgress, updateShowProgress, updateBookDates, updateShowDates,
    addBookNote, updateBookNote, deleteBookNote,
    addShowNote, updateShowNote, deleteShowNote,
    addBookTag, removeBookTag,
    addShowTag, removeShowTag,
    isLoading: userDataLoading
  } = useUserData();
  const [direction, setDirection] = useState<'books-from-shows' | 'shows-from-books'>('books-from-shows');
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Book | TVShow | null>(null);
  const [selectedType, setSelectedType] = useState<'book' | 'show'>('book');

  const handleItemClick = useCallback((item: Book | TVShow, type: 'book' | 'show') => {
    setSelectedItem(item);
    setSelectedType(type);
  }, []);

  // Helper to get all props for BookCard
  const getBookCardProps = useCallback((book: Book) => {
    const isInList = hasBook(book.id);
    const userBook = userData.readBooks.find(ub => ub.book.id === book.id);
    const review = getBookReview(book.id);

    return {
      book,
      onAdd: addBook,
      onRemove: undefined, // Not removing from cross-rec view
      onClick: (b: Book) => handleItemClick(b, 'book'),
      isInList,
      rating: isInList ? getBookRating(book.id) : undefined,
      onRatingChange: isInList ? (rating: number) => setBookRating(book.id, rating) : undefined,
      status: isInList ? getBookStatus(book.id) : undefined,
      onStatusChange: isInList ? (status: BookStatus) => setBookStatus(book.id, status) : undefined,
      progressPercentage: userBook?.progressPercentage,
      hasReview: !!review,
      customTags: userBook?.customTags,
    };
  }, [addBook, hasBook, getBookRating, setBookRating, getBookStatus, setBookStatus, getBookReview, handleItemClick, userData.readBooks]);

  // Helper to get all props for ShowCard
  const getShowCardProps = useCallback((show: TVShow) => {
    const isInList = hasShow(show.id);
    const userShow = userData.watchedShows.find(us => us.show.id === show.id);
    const review = getShowReview(show.id);

    return {
      show,
      onAdd: addShow,
      onRemove: undefined, // Not removing from cross-rec view
      onClick: (s: TVShow) => handleItemClick(s, 'show'),
      isInList,
      rating: isInList ? getShowRating(show.id) : undefined,
      onRatingChange: isInList ? (rating: number) => setShowRating(show.id, rating) : undefined,
      status: isInList ? getShowStatus(show.id) : undefined,
      onStatusChange: isInList ? (status: ShowStatus) => setShowStatus(show.id, status) : undefined,
      progressPercentage: userShow?.progressPercentage,
      hasReview: !!review,
      customTags: userShow?.customTags,
    };
  }, [addShow, hasShow, getShowRating, setShowRating, getShowStatus, setShowStatus, getShowReview, handleItemClick, userData.watchedShows]);

  useEffect(() => {
    // Generate recommendations even if user has no saved items (will show popular content)
    generateCrossRecommendation();
  }, [userData, direction]);

  const generateCrossRecommendation = async () => {
    setIsLoading(true);
    setRecommendations([]); // Clear previous recommendations
    try {
      if (direction === 'books-from-shows') {
        // Get genres from user's watched shows
        const userGenres = new Set<string>();
        userData.watchedShows.forEach(us => {
          us.show.genres.forEach(g => userGenres.add(g));
        });

        const candidateBooks: Book[] = [];
        
        // If user has shows with genres, get books by matching genres
        if (userGenres.size > 0) {
          // Map TV show genres to book genres (some overlap)
          // Note: TV show genres come from TMDB and may include variations
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
            'War & Politics': ['History', 'Non-Fiction'],
            'Western': ['Westerns', 'Fiction'],
            'Animation': ['Fiction', 'Children'],
            'Family': ['Fiction', 'Children'],
            'Kids': ['Fiction', 'Children'],
          };

          const bookGenres: string[] = [];
          userGenres.forEach(tvGenre => {
            const mapped = genreMap[tvGenre] || ['Fiction'];
            bookGenres.push(...mapped);
          });

          // Get unique genres and fetch books
          const uniqueBookGenres = Array.from(new Set(bookGenres)).slice(0, 3);
          console.log('Mapped book genres:', uniqueBookGenres);
          if (uniqueBookGenres.length > 0) {
            try {
              const genreBooks = await getBooksByGenre(uniqueBookGenres, 30);
              console.log('Genre books fetched:', genreBooks?.length || 0);
              if (genreBooks && genreBooks.length > 0) {
                candidateBooks.push(...genreBooks);
              } else {
                console.warn('getBooksByGenre returned empty array for genres:', uniqueBookGenres);
              }
            } catch (error) {
              console.error('Error fetching books by genre:', error);
              // Continue even if genre fetch fails
            }
          }
        }

        // Always add popular books as fallback
        try {
          const popularBooks = await getPopularBooks(30);
          console.log('Popular books fetched:', popularBooks?.length || 0);
          if (popularBooks && popularBooks.length > 0) {
            candidateBooks.push(...popularBooks);
          } else {
            console.warn('getPopularBooks returned empty array, trying simple query...');
            // Fallback: try a simple query that's more likely to work
            try {
              const simpleBooks = await getBooksByGenre(['Fiction'], 20);
              console.log('Simple query books fetched:', simpleBooks?.length || 0);
              if (simpleBooks && simpleBooks.length > 0) {
                candidateBooks.push(...simpleBooks);
                console.log('Added simple query books to candidates');
              }
            } catch (fallbackError) {
              console.error('Fallback query also failed:', fallbackError);
            }
          }
        } catch (error) {
          console.error('Error fetching popular books:', error);
          // If popular books also fails, try a simple fallback
          try {
            const simpleBooks = await getBooksByGenre(['Fiction'], 20);
            if (simpleBooks && simpleBooks.length > 0) {
              candidateBooks.push(...simpleBooks);
            }
          } catch (fallbackError) {
            console.error('All book fetching methods failed:', fallbackError);
          }
        }

        // Remove duplicates
        const uniqueBooks = Array.from(
          new Map(candidateBooks.map(book => [book.id, book])).values()
        );

        console.log('Candidate books found:', uniqueBooks.length);
        console.log('User has shows:', userData.watchedShows.length);
        console.log('Total candidate books before dedup:', candidateBooks.length);

        // Only use recommendation engine if user has shows
        let recs: Recommendation[] = [];
        if (userData.watchedShows.length > 0 && uniqueBooks.length > 0) {
          try {
            recs = recommendBooksFromShows(userData.watchedShows, uniqueBooks, 20);
            console.log('Recommendations from engine:', recs.length);
          } catch (error) {
            console.error('Error in recommendation engine:', error);
            // Continue to fallback
          }
        }
        
        // Always show recommendations - use engine results if available, otherwise show popular from genres
        if (recs.length > 0) {
          // Show top recommendations (up to 20)
          setRecommendations(recs.slice(0, 20));
        } else if (uniqueBooks.length > 0) {
          // Show popular books from the genre-matched books (randomize to show different books)
          const shuffled = [...uniqueBooks].sort(() => Math.random() - 0.5);
          const popularFromGenres = shuffled.slice(0, 20).map(book => ({
            item: book,
            score: 1,
            reasons: userGenres.size > 0 
              ? [`Popular ${Array.from(userGenres).slice(0, 2).join(' and ')} book`]
              : ['Popular recommendation'],
          }));
          setRecommendations(popularFromGenres);
        } else {
          console.error('No books available to recommend - API calls may have failed');
          // Final fallback: try a simple search query
          try {
            console.log('Attempting final fallback with searchBooks...');
            const fallbackBooks = await searchBooks('bestseller');
            console.log('Fallback search results:', fallbackBooks?.length || 0);
            if (fallbackBooks && fallbackBooks.length > 0) {
              setRecommendations(fallbackBooks.slice(0, 20).map(book => ({
                item: book,
                score: 1,
                reasons: ['Popular recommendation'],
              })));
            } else {
              setRecommendations([]);
            }
          } catch (fallbackError) {
            console.error('Final fallback also failed:', fallbackError);
            setRecommendations([]);
          }
        }
      } else {
        // Get genres from user's read books
        const userGenres = new Set<string>();
        userData.readBooks.forEach(ub => {
          ub.book.genres.forEach(g => userGenres.add(g));
        });

        const candidateShows: TVShow[] = [];
        
        // If user has books with genres, get shows by matching genres
        if (userGenres.size > 0) {
          // Map book genres to TV show genres (TMDB genre IDs)
          const genreMap: { [key: string]: number[] } = {
            'Fiction': [18], // Drama
            'Mystery': [9648], // Mystery
            'Thriller': [53], // Thriller
            'Romance': [10749], // Romance
            'Science Fiction': [10765], // Sci-Fi & Fantasy
            'Fantasy': [10765], // Sci-Fi & Fantasy
            'Horror': [27], // Horror
            'History': [99], // Documentary
            'Biography': [99], // Documentary
            'Non-Fiction': [99], // Documentary
          };

          // TMDB genre IDs
          const tmdbGenreIds: number[] = [];
          userGenres.forEach(bookGenre => {
            const mapped = genreMap[bookGenre] || [18]; // Default to Drama
            tmdbGenreIds.push(...mapped);
          });

          // Get unique genre IDs
          const uniqueGenreIds = Array.from(new Set(tmdbGenreIds)).slice(0, 3);
          if (uniqueGenreIds.length > 0) {
            const genreShows = await getShowsByGenre(uniqueGenreIds, 30);
            candidateShows.push(...genreShows);
          }
        }

        // Always add popular shows as fallback
        const popularShows = await getPopularShows(30);
        candidateShows.push(...popularShows);

        // Remove duplicates
        const uniqueShows = Array.from(
          new Map(candidateShows.map(show => [show.id, show])).values()
        );

        const recs = recommendShowsFromBooks(userData.readBooks, uniqueShows, 20);
        
        // If no recommendations from engine (user has no books), show popular shows from matched genres
        if (recs.length === 0 && uniqueShows.length > 0) {
          // Show popular shows from the genre-matched shows
          const popularFromGenres = uniqueShows.slice(0, 20).map(show => ({
            item: show,
            score: 1,
            reasons: userGenres.size > 0
              ? [`Popular ${Array.from(userGenres).slice(0, 2).join(' and ')} show`]
              : ['Popular recommendation'],
          }));
          setRecommendations(popularFromGenres);
        } else {
          // Show top recommendations (up to 20)
          setRecommendations(recs.length > 0 ? recs.slice(0, 20) : []);
        }
      }
    } catch (error) {
      console.error('Error generating cross-recommendation:', error);
    } finally {
      setIsLoading(false);
    }
  };


  if (userDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
          Cross-Recommendations
        </h1>
      </div>

      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => setDirection('books-from-shows')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium ${
              direction === 'books-from-shows'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Books from Shows
          </button>
          <button
            onClick={() => setDirection('shows-from-books')}
            className={`flex-1 sm:flex-none px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium border-l border-gray-200 dark:border-gray-700 ${
              direction === 'shows-from-books'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Shows from Books
          </button>
        </div>
      </div>

      <div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
          </div>
        ) : recommendations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-300 font-medium mb-2">
              No recommendations available
            </p>
            <button
              onClick={generateCrossRecommendation}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium text-sm"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {direction === 'books-from-shows' 
                  ? `Books Recommended from Your Shows (${recommendations.length})`
                  : `Shows Recommended from Your Books (${recommendations.length})`}
              </h2>
              <button
                onClick={generateCrossRecommendation}
                className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium text-sm shadow-md hover:shadow-lg"
              >
                🔄 Refresh
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {recommendations.map((rec) => (
                direction === 'books-from-shows' ? (
                  <BookCard
                    key={rec.item.id}
                    {...getBookCardProps(rec.item as Book)}
                    showReasons={rec.reasons}
                  />
                ) : (
                  <ShowCard
                    key={rec.item.id}
                    {...getShowCardProps(rec.item as TVShow)}
                    showReasons={rec.reasons}
                  />
                )
              ))}
            </div>
          </div>
        )}
      </div>

      {selectedItem && (() => {
        const isInList = selectedType === 'book' ? hasBook(selectedItem.id) : hasShow(selectedItem.id);
        const userBook = selectedType === 'book' ? userData.readBooks.find(ub => ub.book.id === selectedItem.id) : undefined;
        const userShow = selectedType === 'show' ? userData.watchedShows.find(us => us.show.id === selectedItem.id) : undefined;
        
        return (
          <EnhancedDetailModal
            item={selectedItem}
            type={selectedType}
            onClose={() => setSelectedItem(null)}
            isInList={isInList}
            rating={selectedType === 'book' 
              ? (isInList ? getBookRating(selectedItem.id) : undefined)
              : (isInList ? getShowRating(selectedItem.id) : undefined)
            }
            onRatingChange={selectedType === 'book'
              ? (isInList ? (rating: number) => setBookRating(selectedItem.id, rating) : undefined)
              : (isInList ? (rating: number) => setShowRating(selectedItem.id, rating) : undefined)
            }
            status={selectedType === 'book'
              ? (isInList ? getBookStatus(selectedItem.id) : undefined)
              : (isInList ? getShowStatus(selectedItem.id) : undefined)
            }
            onStatusChange={selectedType === 'book'
              ? (isInList ? (status: any) => setBookStatus(selectedItem.id, status as BookStatus) : undefined)
              : (isInList ? (status: any) => setShowStatus(selectedItem.id, status as ShowStatus) : undefined)
            }
            progress={selectedType === 'book' && userBook
              ? {
                  currentPage: userBook.currentPage,
                  pagesRead: userBook.pagesRead,
                  progressPercentage: userBook.progressPercentage,
                }
              : selectedType === 'show' && userShow
              ? {
                  currentSeason: userShow.currentSeason,
                  currentEpisode: userShow.currentEpisode,
                  episodesWatched: userShow.episodesWatched,
                  progressPercentage: userShow.progressPercentage,
                }
              : undefined
            }
            onProgressUpdate={selectedType === 'book'
              ? (progress) => updateBookProgress(selectedItem.id, progress)
              : (progress) => updateShowProgress(selectedItem.id, progress)
            }
            dates={selectedType === 'book' && userBook
              ? {
                  startDate: userBook.startDate,
                  finishDate: userBook.finishDate,
                }
              : selectedType === 'show' && userShow
              ? {
                  startDate: userShow.startDate,
                  finishDate: userShow.finishDate,
                }
              : undefined
            }
            onDatesUpdate={selectedType === 'book'
              ? (dates) => updateBookDates(selectedItem.id, dates)
              : (dates) => updateShowDates(selectedItem.id, dates)
            }
            review={selectedType === 'book'
              ? getBookReview(selectedItem.id)
              : getShowReview(selectedItem.id)
            }
            onReviewSave={selectedType === 'book'
              ? (review) => setBookReview(selectedItem.id, review)
              : (review) => setShowReview(selectedItem.id, review)
            }
            onReviewDelete={selectedType === 'book'
              ? () => deleteBookReview(selectedItem.id)
              : () => deleteShowReview(selectedItem.id)
            }
            notes={selectedType === 'book'
              ? userBook?.notes
              : userShow?.notes
            }
            onNoteAdd={selectedType === 'book'
              ? (note) => addBookNote(selectedItem.id, note)
              : (note) => addShowNote(selectedItem.id, note)
            }
            onNoteUpdate={selectedType === 'book'
              ? (noteId, updates) => updateBookNote(selectedItem.id, noteId, updates)
              : (noteId, updates) => updateShowNote(selectedItem.id, noteId, updates)
            }
            onNoteDelete={selectedType === 'book'
              ? (noteId) => deleteBookNote(selectedItem.id, noteId)
              : (noteId) => deleteShowNote(selectedItem.id, noteId)
            }
            customTags={selectedType === 'book'
              ? userBook?.customTags
              : userShow?.customTags
            }
            onTagAdd={selectedType === 'book'
              ? (tag) => addBookTag(selectedItem.id, tag)
              : (tag) => addShowTag(selectedItem.id, tag)
            }
            onTagRemove={selectedType === 'book'
              ? (tag) => removeBookTag(selectedItem.id, tag)
              : (tag) => removeShowTag(selectedItem.id, tag)
            }
          />
        );
      })()}
    </div>
  );
}
