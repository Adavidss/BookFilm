'use client';

/**
 * Books Page (Home) - Simplified for Mobile
 */

import { useState, useEffect, useRef } from 'react';
import { Book, Recommendation } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { useDebounce } from '@/hooks/useDebounce';
import { searchBooks, getPopularBooks, getBooksByGenre } from '@/utils/api';
import { recommendBooks } from '@/lib/recommendationEngine';
import SearchBar from '@/components/SearchBar';
import BookCard from '@/components/BookCard';
import DetailModal from '@/components/DetailModal';
import FilterBar from '@/components/FilterBar';
import ErrorMessage from '@/components/ErrorMessage';
import SkeletonGrid from '@/components/SkeletonGrid';
import RecommendationsSection from '@/components/RecommendationsSection';
import Pagination from '@/components/Pagination';

export default function BooksPage() {
  const { userData, addBook, removeBook, hasBook, getBookRating, setBookRating, getBookStatus, setBookStatus, getBookReview, isLoading: userDataLoading } = useUserData();
  
  // Helper to get user book data for BookCard props
  const getBookCardProps = (bookId: string) => {
    const userBook = userData.readBooks.find(ub => ub.book.id === bookId);
    if (!userBook) return {};
    
    return {
      progressPercentage: userBook.progressPercentage,
      hasReview: !!userBook.review,
      customTags: userBook.customTags,
    };
  };
  const [discoverBooks, setDiscoverBooks] = useState<Book[]>([]);
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-books' | 'discover' | 'recommendations'>('my-books');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [discoverMode, setDiscoverMode] = useState<'recommended' | 'search'>('recommended');
  const [searchError, setSearchError] = useState<unknown>(null);
  const [recError, setRecError] = useState<unknown>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const searchAbortController = useRef<AbortController | null>(null);
  const [searchPage, setSearchPage] = useState(1);
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'rating'>('date');
  const ITEMS_PER_PAGE = 20;

  // Generate recommendations when switching to discover tab
  useEffect(() => {
    if (activeTab === 'discover' && discoverMode === 'recommended' && userData.readBooks.length > 0) {
      generateSingleRecommendation();
    }
  }, [activeTab, userData.readBooks]);

  const generateSingleRecommendation = async () => {
    setIsLoadingRecs(true);
    setRecError(null);
    try {
        const userGenres = new Set<string>();
        userData.readBooks.forEach(ub => {
          ub.book.genres.forEach(g => userGenres.add(g));
        });

        const candidateBooks: Book[] = [];
        const popularBooks = await getPopularBooks(50);
        candidateBooks.push(...popularBooks);

        if (userGenres.size > 0) {
          const genreBooks = await getBooksByGenre(Array.from(userGenres).slice(0, 3), 20);
          candidateBooks.push(...genreBooks);
        }

        const uniqueBooks = Array.from(
          new Map(candidateBooks.map(book => [book.id, book])).values()
        );

      const shuffled = uniqueBooks.sort(() => Math.random() - 0.5);
      const recs = recommendBooks(userData.readBooks, shuffled, 10);
        const randomRec = recs[Math.floor(Math.random() * Math.min(recs.length, 5))];
        setCurrentRec(randomRec || null);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setRecError(error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleNextRecommendation = async () => {
    generateSingleRecommendation();
  };

  // Handle debounced search
  useEffect(() => {
    if (debouncedSearchQuery.trim()) {
      performSearch(debouncedSearchQuery.trim());
    } else if (debouncedSearchQuery === '' && discoverMode === 'search') {
      setDiscoverBooks([]);
      setIsSearching(false);
    }
  }, [debouncedSearchQuery]);

  const performSearch = async (query: string) => {
    // Cancel previous search if still in progress
    if (searchAbortController.current) {
      searchAbortController.current.abort();
    }
    
    searchAbortController.current = new AbortController();
    setIsSearching(true);
    setActiveTab('discover');
    setDiscoverMode('search');
    setSearchError(null);

    try {
      const results = await searchBooks(query);
      // Check if search was cancelled
      if (!searchAbortController.current?.signal.aborted) {
        setDiscoverBooks(results);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Search error:', error);
      if (!searchAbortController.current?.signal.aborted) {
        setSearchError(error);
        setDiscoverBooks([]);
      }
    } finally {
      if (!searchAbortController.current?.signal.aborted) {
        setIsSearching(false);
      }
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleRandomRecommendation = async () => {
    setIsLoadingRecs(true);
    setActiveTab('discover');
    setDiscoverMode('recommended');

    try {
      const randomBooks = await getPopularBooks(50);
      const shuffled = randomBooks.sort(() => Math.random() - 0.5);
      const randomRecs: Recommendation[] = shuffled.map(book => ({
        item: book,
        score: Math.random() * 10,
        reasons: ['Random popular recommendation'],
      }));
      const randomIndex = Math.floor(Math.random() * Math.min(randomRecs.length, 20));
      setCurrentRec(randomRecs[randomIndex] || null);
    } catch (error) {
      console.error('Error getting random recommendations:', error);
    } finally {
      setIsLoadingRecs(false);
    }
  };

  const handleFilter = async (genre: string) => {
    setActiveTab('discover');
    setDiscoverMode('search');
    setIsSearching(true);

    try {
      const results = await getBooksByGenre([genre], 30);
      setDiscoverBooks(results);
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilter = () => {
    setDiscoverBooks([]);
  };

  if (userDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Header */}
      <div className="flex flex-col gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-gray-100">
            Books
          </h1>
        </div>

        {/* Search Bar and Filter */}
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="flex-1">
            <SearchBar
              placeholder="Search for books..."
              onChange={handleSearch}
              value={searchQuery}
              isLoading={isSearching}
            />
          </div>
          <FilterBar
            type="book"
            onFilter={handleFilter}
            onClear={handleClearFilter}
          />
        </div>

        {/* Random Button */}
        <button
          onClick={handleRandomRecommendation}
          className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors font-medium shadow-md hover:shadow-lg text-sm"
        >
          🎲 Random Books
        </button>
      </div>

      {/* Simplified Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab('my-books')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'my-books'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Books ({userData.readBooks.length})
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'recommendations'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-3 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Discover
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* My Books Tab */}
        {activeTab === 'my-books' && (
          <div className="space-y-8">
            {userData.readBooks.length === 0 ? (
              <div className="text-center py-12">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No books yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Search for books and add them to your reading list
                </p>
              </div>
            ) : (
              <>
                {/* Want to Read Section */}
                {userData.readBooks.filter(b => b.status === 'want-to-read').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Want to Read ({userData.readBooks.filter(b => b.status === 'want-to-read').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {userData.readBooks
                        .filter(({ status }) => status === 'want-to-read')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ book }) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onRemove={removeBook}
                            onClick={setSelectedBook}
                            isInList={true}
                            rating={getBookRating(book.id)}
                            onRatingChange={(rating) => setBookRating(book.id, rating)}
                            status={getBookStatus(book.id)}
                            onStatusChange={(status) => setBookStatus(book.id, status)}
                            {...getBookCardProps(book.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Currently Reading Section */}
                {userData.readBooks.filter(b => b.status === 'reading').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Currently Reading ({userData.readBooks.filter(b => b.status === 'reading').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {userData.readBooks
                        .filter(({ status }) => status === 'reading')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ book }) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onRemove={removeBook}
                            onClick={setSelectedBook}
                            isInList={true}
                            rating={getBookRating(book.id)}
                            onRatingChange={(rating) => setBookRating(book.id, rating)}
                            status={getBookStatus(book.id)}
                            onStatusChange={(status) => setBookStatus(book.id, status)}
                            {...getBookCardProps(book.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Read Section */}
                {userData.readBooks.filter(b => b.status === 'read').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Read ({userData.readBooks.filter(b => b.status === 'read').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {userData.readBooks
                        .filter(({ status }) => status === 'read')
                        .sort((a, b) => {
                          if (sortBy === 'title') {
                            return a.book.title.localeCompare(b.book.title);
                          } else if (sortBy === 'rating') {
                            const ratingA = a.rating || 0;
                            const ratingB = b.rating || 0;
                            return ratingB - ratingA;
                          } else {
                            return b.addedAt - a.addedAt;
                          }
                        })
                        .map(({ book }) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onRemove={removeBook}
                            onClick={setSelectedBook}
                            isInList={true}
                            rating={getBookRating(book.id)}
                            onRatingChange={(rating) => setBookRating(book.id, rating)}
                            status={getBookStatus(book.id)}
                            onStatusChange={(status) => setBookStatus(book.id, status)}
                            {...getBookCardProps(book.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Dropped Section */}
                {userData.readBooks.filter(b => b.status === 'dropped').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Dropped ({userData.readBooks.filter(b => b.status === 'dropped').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {userData.readBooks
                        .filter(({ status }) => status === 'dropped')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ book }) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onRemove={removeBook}
                            onClick={setSelectedBook}
                            isInList={true}
                            rating={getBookRating(book.id)}
                            onRatingChange={(rating) => setBookRating(book.id, rating)}
                            status={getBookStatus(book.id)}
                            onStatusChange={(status) => setBookStatus(book.id, status)}
                            {...getBookCardProps(book.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Books without status */}
                {userData.readBooks.filter(b => !b.status).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Other ({userData.readBooks.filter(b => !b.status).length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {userData.readBooks
                        .filter(({ status }) => !status)
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ book }) => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onRemove={removeBook}
                            onClick={setSelectedBook}
                            isInList={true}
                            rating={getBookRating(book.id)}
                            onRatingChange={(rating) => setBookRating(book.id, rating)}
                            status={getBookStatus(book.id)}
                            onStatusChange={(status) => setBookStatus(book.id, status)}
                            {...getBookCardProps(book.id)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                {userData.readBooks.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort "Read" section by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'rating')}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="date">Date Added</option>
                      <option value="title">Title</option>
                      <option value="rating">Rating</option>
                    </select>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Recommendations Tab */}
        {activeTab === 'recommendations' && (
          <div>
            <RecommendationsSection
              userBooks={userData.readBooks}
              addBook={addBook}
              hasBook={hasBook}
              getBookRating={getBookRating}
              setBookRating={setBookRating}
              getBookStatus={getBookStatus}
              setBookStatus={setBookStatus}
              onBookClick={setSelectedBook}
            />
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            {discoverMode === 'search' ? (
              // Search/Filter Results
              <div>
                {isSearching ? (
                  <SkeletonGrid type="book" count={8} />
                ) : searchError ? (
                  <ErrorMessage error={searchError} onRetry={() => performSearch(searchQuery)} />
                ) : discoverBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No results. Try searching or using a filter!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
                      {discoverBooks
                        .slice((searchPage - 1) * ITEMS_PER_PAGE, searchPage * ITEMS_PER_PAGE)
                        .map(book => (
                          <BookCard
                            key={book.id}
                            book={book}
                            onAdd={addBook}
                            onClick={setSelectedBook}
                            isInList={hasBook(book.id)}
                            rating={hasBook(book.id) ? getBookRating(book.id) : undefined}
                            onRatingChange={hasBook(book.id) ? (rating) => setBookRating(book.id, rating) : undefined}
                            status={hasBook(book.id) ? getBookStatus(book.id) : undefined}
                            onStatusChange={hasBook(book.id) ? (status) => setBookStatus(book.id, status) : undefined}
                            {...(hasBook(book.id) ? getBookCardProps(book.id) : {})}
                          />
                        ))}
                    </div>
                    {discoverBooks.length > ITEMS_PER_PAGE && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={searchPage}
                          totalPages={Math.ceil(discoverBooks.length / ITEMS_PER_PAGE)}
                          onPageChange={setSearchPage}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            ) : (
              // Personalized Recommendations
              <div>
                {isLoadingRecs ? (
                  <div className="flex items-center justify-center py-12">
                    <SkeletonGrid type="book" count={1} className="max-w-md mx-auto" />
                  </div>
                ) : recError ? (
                  <ErrorMessage error={recError} onRetry={generateSingleRecommendation} />
                ) : userData.readBooks.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      Add some books to your list to get personalized recommendations
                    </p>
                  </div>
                ) : !currentRec ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-2 text-sm">
                      No recommendations available
                    </p>
                    <button
                      onClick={handleNextRecommendation}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors font-medium text-sm"
                    >
                      Generate Recommendation
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <BookCard
                      book={currentRec.item as Book}
                      onAdd={addBook}
                      onClick={setSelectedBook}
                      isInList={hasBook(currentRec.item.id)}
                      showReasons={currentRec.reasons}
                      rating={hasBook(currentRec.item.id) ? getBookRating(currentRec.item.id) : undefined}
                      onRatingChange={hasBook(currentRec.item.id) ? (rating) => setBookRating(currentRec.item.id, rating) : undefined}
                      status={hasBook(currentRec.item.id) ? getBookStatus(currentRec.item.id) : undefined}
                      onStatusChange={hasBook(currentRec.item.id) ? (status) => setBookStatus(currentRec.item.id, status) : undefined}
                      {...(hasBook(currentRec.item.id) ? getBookCardProps(currentRec.item.id) : {})}
                    />
                    <button
                      onClick={handleNextRecommendation}
                      className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:from-blue-600 hover:to-purple-600 transition-colors font-medium shadow-md hover:shadow-lg text-sm"
                    >
                      🔄 Next Recommendation
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {selectedBook && (
        <DetailModal
          item={selectedBook}
          type="book"
          onClose={() => setSelectedBook(null)}
        />
      )}
    </div>
  );
}
