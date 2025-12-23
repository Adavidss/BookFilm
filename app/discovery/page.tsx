'use client';

/**
 * Discovery Page
 *
 * Features:
 * - View trending books and shows
 * - Browse new releases
 * - Toggle between different discovery modes
 */

import { useState, useEffect } from 'react';
import { Book, TVShow, DiscoveryMode } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { getTrendingShows, getNewReleaseBooks } from '@/utils/api';
import BookCard from '@/components/BookCard';
import ShowCard from '@/components/ShowCard';
import ErrorMessage from '@/components/ErrorMessage';
import SkeletonGrid from '@/components/SkeletonGrid';

export default function DiscoveryPage() {
  const { addBook, addShow, hasBook, hasShow, getBookRating, getShowRating, setBookRating, setShowRating, getBookStatus, getShowStatus, setBookStatus, setShowStatus, isLoading: userDataLoading } = useUserData();
  const [contentType, setContentType] = useState<'books' | 'shows'>('shows');
  const [mode, setMode] = useState<DiscoveryMode>('trending');
  const [books, setBooks] = useState<Book[]>([]);
  const [shows, setShows] = useState<TVShow[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<unknown>(null);

  // Fetch content when mode or type changes
  useEffect(() => {
    fetchContent();
  }, [contentType, mode]);

  const fetchContent = async () => {
    setIsLoading(true);
    setError(null);
    try {
      if (contentType === 'shows') {
        if (mode === 'trending') {
          const results = await getTrendingShows();
          setShows(results);
        } else {
          // 'new' - same as trending for shows
          const results = await getTrendingShows();
          setShows(results);
        }
      } else {
        // Books
        if (mode === 'new') {
          const results = await getNewReleaseBooks();
          setBooks(results);
        } else {
          // For trending books, use new releases
          const results = await getNewReleaseBooks();
          setBooks(results);
        }
      }
    } catch (error) {
      console.error('Error fetching discovery content:', error);
      setError(error);
      setBooks([]);
      setShows([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (userDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Discovery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore trending and new content
        </p>
      </div>

      {/* Content Type Toggle */}
      <div className="flex justify-center">
        <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setContentType('books')}
            className={`px-6 py-2 text-sm font-medium rounded-l-lg ${
              contentType === 'books'
                ? 'bg-blue-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            Books
          </button>
          <button
            onClick={() => setContentType('shows')}
            className={`px-6 py-2 text-sm font-medium rounded-r-lg border-l border-gray-200 dark:border-gray-700 ${
              contentType === 'shows'
                ? 'bg-purple-500 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            TV Shows
          </button>
        </div>
      </div>

      {/* Discovery Mode Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 justify-center">
          <button
            onClick={() => setMode('trending')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              mode === 'trending'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Trending
          </button>
          <button
            onClick={() => setMode('new')}
            className={`pb-4 px-1 border-b-2 font-medium text-sm ${
              mode === 'new'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            New Releases
          </button>
        </nav>
      </div>

      {/* Content Grid */}
      <div>
        {isLoading ? (
          <SkeletonGrid type={contentType === 'books' ? 'book' : 'show'} count={8} />
        ) : error ? (
          <ErrorMessage error={error} onRetry={fetchContent} />
        ) : contentType === 'books' ? (
          <div>
            {books.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No books found. Make sure you have configured your API keys.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {books.map((book, index) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAdd={addBook}
                    isInList={hasBook(book.id)}
                    rating={hasBook(book.id) ? getBookRating(book.id) : undefined}
                    onRatingChange={hasBook(book.id) ? (rating) => setBookRating(book.id, rating) : undefined}
                    status={hasBook(book.id) ? getBookStatus(book.id) : undefined}
                    onStatusChange={hasBook(book.id) ? (status) => setBookStatus(book.id, status) : undefined}
                    priority={index < 4} // Priority for first 4 items (likely above fold)
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          <div>
            {shows.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No shows found. Make sure you have configured your TMDB API key.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {shows.map((show, index) => (
                  <ShowCard
                    key={show.id}
                    show={show}
                    onAdd={addShow}
                    isInList={hasShow(show.id)}
                    rating={hasShow(show.id) ? getShowRating(show.id) : undefined}
                    onRatingChange={hasShow(show.id) ? (rating) => setShowRating(show.id, rating) : undefined}
                    status={hasShow(show.id) ? getShowStatus(show.id) : undefined}
                    onStatusChange={hasShow(show.id) ? (status) => setShowStatus(show.id, status) : undefined}
                    priority={index < 4} // Priority for first 4 items (likely above fold)
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
