'use client';

/**
 * TV Shows Page - Simplified for Mobile
 */

import { useState, useEffect, useRef } from 'react';
import { TVShow, Recommendation } from '@/types';
import { useUserData } from '@/hooks/useUserData';
import { useDebounce } from '@/hooks/useDebounce';
import { searchTVShows, getPopularShows, getTrendingShows, getShowsByGenre } from '@/utils/api';
import { recommendShows } from '@/lib/recommendationEngine';
import SearchBar from '@/components/SearchBar';
import ShowCard from '@/components/ShowCard';
import DetailModal from '@/components/DetailModal';
import FilterBar from '@/components/FilterBar';
import ErrorMessage from '@/components/ErrorMessage';
import SkeletonGrid from '@/components/SkeletonGrid';
import ShowRecommendationsSection from '@/components/ShowRecommendationsSection';
import Pagination from '@/components/Pagination';

// TMDB Genre ID mapping
const GENRE_TO_ID: { [key: string]: number } = {
  'Action': 10759,
  'Adventure': 10759,
  'Comedy': 35,
  'Crime': 80,
  'Documentary': 99,
  'Drama': 18,
  'Fantasy': 10765,
  'Horror': 9648,
  'Mystery': 9648,
  'Romance': 10749,
  'Sci-Fi': 10765,
  'Thriller': 9648,
};

export default function ShowsPage() {
  const { userData, addShow, removeShow, hasShow, getShowRating, setShowRating, getShowStatus, setShowStatus, isLoading: userDataLoading } = useUserData();
  const [discoverShows, setDiscoverShows] = useState<TVShow[]>([]);
  const [currentRec, setCurrentRec] = useState<Recommendation | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [activeTab, setActiveTab] = useState<'my-shows' | 'discover' | 'recommendations'>('my-shows');
  const [selectedShow, setSelectedShow] = useState<TVShow | null>(null);
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
    if (activeTab === 'discover' && discoverMode === 'recommended') {
      generateSingleRecommendation();
    }
  }, [activeTab, userData.watchedShows]);

  const [fullyRandom, setFullyRandom] = useState(false);

  const generateSingleRecommendation = async () => {
    setIsLoadingRecs(true);
    setRecError(null);
    try {
      if (fullyRandom) {
        // Fully random: just get popular shows and pick one randomly
        const popularShows = await getPopularShows(50);
        const randomShow = popularShows[Math.floor(Math.random() * popularShows.length)];
        setCurrentRec({
          item: randomShow,
          score: 1,
          reasons: ['Random popular show'],
        });
      } else {
        // Semi-relevant: use recommendation engine
        const popularShows = await getPopularShows(50);
        const recs = recommendShows(userData.watchedShows, popularShows, 10);
        // Pick from top recommendations (not fully random)
        const randomRec = recs[Math.floor(Math.random() * Math.min(recs.length, 5))];
        setCurrentRec(randomRec || null);
      }
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
      setDiscoverShows([]);
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
    setSearchPage(1); // Reset to first page on new search

    try {
      const results = await searchTVShows(query);
      // Check if search was cancelled
      if (!searchAbortController.current?.signal.aborted) {
        setDiscoverShows(results);
      }
    } catch (error: any) {
      // Ignore abort errors
      if (error?.name === 'AbortError') {
        return;
      }
      console.error('Search error:', error);
      if (!searchAbortController.current?.signal.aborted) {
        setSearchError(error);
        setDiscoverShows([]);
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
      const trendingShows = await getTrendingShows();
      const popularShows = await getPopularShows(30);
      const allShows = [...trendingShows, ...popularShows];
      const shuffled = allShows.sort(() => Math.random() - 0.5);
      const randomRecs: Recommendation[] = shuffled.map(show => ({
        item: show,
        score: Math.random() * 10,
        reasons: ['Trending show recommendation'],
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
      const genreId = GENRE_TO_ID[genre];
      if (genreId) {
        const results = await getShowsByGenre([genreId], 30);
        setDiscoverShows(results);
      } else {
        setDiscoverShows([]);
      }
    } catch (error) {
      console.error('Filter error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleClearFilter = () => {
    setDiscoverShows([]);
  };

  if (userDataLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-6">
      {/* Simplified Header */}
      <div className="mb-4">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">
            TV Shows
          </h1>

        {/* Search Bar */}
        <div className="mb-3">
            <SearchBar
            placeholder="Search shows..."
              onChange={handleSearch}
              value={searchQuery}
              isLoading={isSearching}
            />
          </div>
      </div>

      {/* Simplified Tabs - Mobile Friendly */}
      <div className="border-b border-gray-200 dark:border-gray-700 mb-4">
        <nav className="-mb-px flex space-x-2 sm:space-x-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('my-shows')}
            className={`pb-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'my-shows'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            My Shows {userData.watchedShows.length > 0 && `(${userData.watchedShows.length})`}
          </button>
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`pb-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'recommendations'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`pb-2 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap transition-colors ${
              activeTab === 'discover'
                ? 'border-purple-500 text-purple-600 dark:text-purple-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Discover
          </button>
        </nav>
      </div>

      {/* Content */}
      <div>
        {/* My Shows Tab */}
        {activeTab === 'my-shows' && (
          <div className="space-y-8">
            {userData.watchedShows.length === 0 ? (
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
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                  No shows yet
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Search for TV shows and add them to your watched list
                </p>
              </div>
            ) : (
              <>
                {/* Want to Watch Section */}
                {userData.watchedShows.filter(s => s.status === 'want-to-watch').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Want to Watch ({userData.watchedShows.filter(s => s.status === 'want-to-watch').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userData.watchedShows
                        .filter(({ status }) => status === 'want-to-watch')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ show }) => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onRemove={removeShow}
                            onClick={setSelectedShow}
                            isInList={true}
                            rating={getShowRating(show.id)}
                            onRatingChange={(rating) => setShowRating(show.id, rating)}
                            status={getShowStatus(show.id)}
                            onStatusChange={(status) => setShowStatus(show.id, status)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Currently Watching Section */}
                {userData.watchedShows.filter(s => s.status === 'watching').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Currently Watching ({userData.watchedShows.filter(s => s.status === 'watching').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userData.watchedShows
                        .filter(({ status }) => status === 'watching')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ show }) => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onRemove={removeShow}
                            onClick={setSelectedShow}
                            isInList={true}
                            rating={getShowRating(show.id)}
                            onRatingChange={(rating) => setShowRating(show.id, rating)}
                            status={getShowStatus(show.id)}
                            onStatusChange={(status) => setShowStatus(show.id, status)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Watched Section */}
                {userData.watchedShows.filter(s => s.status === 'watched').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Watched ({userData.watchedShows.filter(s => s.status === 'watched').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userData.watchedShows
                        .filter(({ status }) => status === 'watched')
                        .sort((a, b) => {
                          if (sortBy === 'title') {
                            return a.show.title.localeCompare(b.show.title);
                          } else if (sortBy === 'rating') {
                            const ratingA = a.rating || 0;
                            const ratingB = b.rating || 0;
                            return ratingB - ratingA;
                          } else {
                            return b.addedAt - a.addedAt;
                          }
                        })
                        .map(({ show }) => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onRemove={removeShow}
                            onClick={setSelectedShow}
                            isInList={true}
                            rating={getShowRating(show.id)}
                            onRatingChange={(rating) => setShowRating(show.id, rating)}
                            status={getShowStatus(show.id)}
                            onStatusChange={(status) => setShowStatus(show.id, status)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Dropped Section */}
                {userData.watchedShows.filter(s => s.status === 'dropped').length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Dropped ({userData.watchedShows.filter(s => s.status === 'dropped').length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userData.watchedShows
                        .filter(({ status }) => status === 'dropped')
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ show }) => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onRemove={removeShow}
                            onClick={setSelectedShow}
                            isInList={true}
                            rating={getShowRating(show.id)}
                            onRatingChange={(rating) => setShowRating(show.id, rating)}
                            status={getShowStatus(show.id)}
                            onStatusChange={(status) => setShowStatus(show.id, status)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Shows without status */}
                {userData.watchedShows.filter(s => !s.status).length > 0 && (
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                      Other ({userData.watchedShows.filter(s => !s.status).length})
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {userData.watchedShows
                        .filter(({ status }) => !status)
                        .sort((a, b) => b.addedAt - a.addedAt)
                        .map(({ show }) => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onRemove={removeShow}
                            onClick={setSelectedShow}
                            isInList={true}
                            rating={getShowRating(show.id)}
                            onRatingChange={(rating) => setShowRating(show.id, rating)}
                            status={getShowStatus(show.id)}
                            onStatusChange={(status) => setShowStatus(show.id, status)}
                          />
                        ))}
                    </div>
                  </div>
                )}

                {/* Sort Options */}
                {userData.watchedShows.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Sort "Watched" section by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as 'date' | 'title' | 'rating')}
                      className="px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            <ShowRecommendationsSection
              userShows={userData.watchedShows}
              addShow={addShow}
              hasShow={hasShow}
              getShowRating={getShowRating}
              setShowRating={setShowRating}
              getShowStatus={getShowStatus}
              setShowStatus={setShowStatus}
              onShowClick={setSelectedShow}
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
                  <SkeletonGrid type="show" count={8} />
                ) : searchError ? (
                  <ErrorMessage error={searchError} onRetry={() => performSearch(searchQuery)} />
                ) : discoverShows.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No results. Try searching or using a filter!
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                      {discoverShows
                        .slice((searchPage - 1) * ITEMS_PER_PAGE, searchPage * ITEMS_PER_PAGE)
                        .map(show => (
                          <ShowCard
                            key={show.id}
                            show={show}
                            onAdd={addShow}
                            onClick={setSelectedShow}
                            isInList={hasShow(show.id)}
                            rating={hasShow(show.id) ? getShowRating(show.id) : undefined}
                            onRatingChange={hasShow(show.id) ? (rating) => setShowRating(show.id, rating) : undefined}
                            status={hasShow(show.id) ? getShowStatus(show.id) : undefined}
                            onStatusChange={hasShow(show.id) ? (status) => setShowStatus(show.id, status) : undefined}
                          />
                        ))}
                    </div>
                    {discoverShows.length > ITEMS_PER_PAGE && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={searchPage}
                          totalPages={Math.ceil(discoverShows.length / ITEMS_PER_PAGE)}
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
                    <SkeletonGrid type="show" count={1} className="max-w-md mx-auto" />
                  </div>
                ) : recError ? (
                  <ErrorMessage error={recError} onRetry={generateSingleRecommendation} />
                ) : !currentRec ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 dark:text-gray-300 font-medium mb-2 text-sm">
                      No recommendations available
                    </p>
                    <button
                      onClick={handleNextRecommendation}
                      className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium text-sm"
                    >
                      Generate Recommendation
                    </button>
                  </div>
                ) : (
                  <div className="max-w-md mx-auto space-y-4">
                    <ShowCard
                      show={currentRec.item as TVShow}
                      onAdd={addShow}
                      onClick={setSelectedShow}
                      isInList={hasShow(currentRec.item.id)}
                      showReasons={currentRec.reasons}
                      rating={hasShow(currentRec.item.id) ? getShowRating(currentRec.item.id) : undefined}
                      onRatingChange={hasShow(currentRec.item.id) ? (rating) => setShowRating(currentRec.item.id, rating) : undefined}
                      status={hasShow(currentRec.item.id) ? getShowStatus(currentRec.item.id) : undefined}
                      onStatusChange={hasShow(currentRec.item.id) ? (status) => setShowStatus(currentRec.item.id, status) : undefined}
                    />
                    <button
                      onClick={handleNextRecommendation}
                      className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors font-medium shadow-md hover:shadow-lg text-sm"
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
      {selectedShow && (
        <DetailModal
          item={selectedShow}
          type="show"
          onClose={() => setSelectedShow(null)}
        />
      )}
    </div>
  );
}
