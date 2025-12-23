'use client';

/**
 * Statistics Dashboard
 * Shows insights about user's reading and watching habits
 */

import { useUserData } from '@/hooks/useUserData';
import { useMemo } from 'react';

export default function StatisticsPage() {
  const { userData, isLoading } = useUserData();

  const stats = useMemo(() => {
    const books = userData.readBooks;
    const shows = userData.watchedShows;

    // Calculate reading velocity
    const currentYear = new Date().getFullYear();
    const booksThisYear = books.filter(b => {
      if (!b.finishDate) return false;
      const finishYear = new Date(b.finishDate).getFullYear();
      return finishYear === currentYear;
    });
    const pagesThisYear = booksThisYear.reduce((sum, b) => sum + (b.pagesRead || 0), 0);
    const daysInYear = Math.floor((Date.now() - new Date(currentYear, 0, 1).getTime()) / (1000 * 60 * 60 * 24));
    const pagesPerDay = daysInYear > 0 ? pagesThisYear / daysInYear : 0;
    const booksPerMonth = booksThisYear.length / (new Date().getMonth() + 1);

    // Calculate time analysis
    const booksWithDates = books.filter(b => b.startDate && b.finishDate);
    const averageReadingTime = booksWithDates.length > 0
      ? booksWithDates.reduce((sum, b) => {
          const days = (b.finishDate! - b.startDate!) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / booksWithDates.length
      : 0;

    // Completion rate
    const startedBooks = books.filter(b => b.status === 'reading' || b.status === 'read' || b.status === 'dropped').length;
    const completedBooks = books.filter(b => b.status === 'read').length;
    const completionRate = startedBooks > 0 ? (completedBooks / startedBooks) * 100 : 0;

    // Book statistics
    const bookStats = {
      total: books.length,
      byStatus: {
        'want-to-read': books.filter(b => b.status === 'want-to-read').length,
        'reading': books.filter(b => b.status === 'reading').length,
        'read': books.filter(b => b.status === 'read').length,
        'dropped': books.filter(b => b.status === 'dropped').length,
      },
      withRatings: books.filter(b => b.rating).length,
      averageRating: books.filter(b => b.rating).length > 0
        ? books.filter(b => b.rating).reduce((sum, b) => sum + (b.rating || 0), 0) / books.filter(b => b.rating).length
        : 0,
      genres: books.reduce((acc, { book }) => {
        book.genres.forEach(genre => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      topGenres: [] as { genre: string; count: number }[],
      // Enhanced stats
      pagesRead: books.reduce((sum, b) => sum + (b.pagesRead || 0), 0),
      booksThisYear: booksThisYear.length,
      pagesThisYear,
      pagesPerDay,
      booksPerMonth,
      averageReadingTime,
      completionRate,
      withReviews: books.filter(b => b.review).length,
      withNotes: books.filter(b => b.notes && b.notes.length > 0).length,
      rereads: books.filter(b => (b.rereadCount || 0) > 0).length,
    };

    // Show statistics
    const showsThisYear = shows.filter(s => {
      if (!s.finishDate) return false;
      const finishYear = new Date(s.finishDate).getFullYear();
      return finishYear === currentYear;
    });
    const episodesWatched = shows.reduce((sum, s) => sum + (s.episodesWatched || 0), 0);
    const showsWithDates = shows.filter(s => s.startDate && s.finishDate);
    const averageWatchingTime = showsWithDates.length > 0
      ? showsWithDates.reduce((sum, s) => {
          const days = (s.finishDate! - s.startDate!) / (1000 * 60 * 60 * 24);
          return sum + days;
        }, 0) / showsWithDates.length
      : 0;

    const showStats = {
      total: shows.length,
      byStatus: {
        'want-to-watch': shows.filter(s => s.status === 'want-to-watch').length,
        'watching': shows.filter(s => s.status === 'watching').length,
        'watched': shows.filter(s => s.status === 'watched').length,
        'dropped': shows.filter(s => s.status === 'dropped').length,
      },
      withRatings: shows.filter(s => s.rating).length,
      averageRating: shows.filter(s => s.rating).length > 0
        ? shows.filter(s => s.rating).reduce((sum, s) => sum + (s.rating || 0), 0) / shows.filter(s => s.rating).length
        : 0,
      genres: shows.reduce((acc, { show }) => {
        show.genres.forEach(genre => {
          acc[genre] = (acc[genre] || 0) + 1;
        });
        return acc;
      }, {} as Record<string, number>),
      topGenres: [] as { genre: string; count: number }[],
      // Enhanced stats
      episodesWatched,
      showsThisYear: showsThisYear.length,
      averageWatchingTime,
      withReviews: shows.filter(s => s.review).length,
      withNotes: shows.filter(s => s.notes && s.notes.length > 0).length,
      rewatches: shows.filter(s => (s.rewatchCount || 0) > 0).length,
    };

    // Calculate top genres
    bookStats.topGenres = Object.entries(bookStats.genres)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    showStats.topGenres = Object.entries(showStats.genres)
      .map(([genre, count]) => ({ genre, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Reading streak
    const streak = userData.readingStreak || { currentStreak: 0, longestStreak: 0 };

    return { books: bookStats, shows: showStats, streak };
  }, [userData]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Statistics
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Your reading and watching insights
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Books Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📚 Books
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Books</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.books.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Want to Read</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.books.byStatus['want-to-read']}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Reading</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.books.byStatus.reading}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Read</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.books.byStatus.read}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dropped</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.books.byStatus.dropped}</span>
            </div>
            {stats.books.averageRating > 0 && (
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  ⭐ {stats.books.averageRating.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Shows Overview */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            📺 TV Shows
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Total Shows</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.shows.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Want to Watch</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.shows.byStatus['want-to-watch']}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Watching</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.shows.byStatus.watching}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Watched</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.shows.byStatus.watched}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Dropped</span>
              <span className="font-semibold text-gray-900 dark:text-gray-100">{stats.shows.byStatus.dropped}</span>
            </div>
            {stats.shows.averageRating > 0 && (
              <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                <span className="text-gray-600 dark:text-gray-400">Average Rating</span>
                <span className="font-semibold text-yellow-600 dark:text-yellow-400">
                  ⭐ {stats.shows.averageRating.toFixed(1)}/5
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Genre Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Book Genres */}
        {stats.books.topGenres.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top Book Genres
            </h2>
            <div className="space-y-3">
              {stats.books.topGenres.map(({ genre, count }) => {
                const percentage = (count / stats.books.total) * 100;
                return (
                  <div key={genre}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{genre}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Top Show Genres */}
        {stats.shows.topGenres.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Top TV Show Genres
            </h2>
            <div className="space-y-3">
              {stats.shows.topGenres.map(({ genre, count }) => {
                const percentage = (count / stats.shows.total) * 100;
                return (
                  <div key={genre}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-300">{genre}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{count}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Statistics */}
      {stats.books.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Reading Velocity */}
          {stats.books.pagesPerDay > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Reading Velocity
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pages per day</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.pagesPerDay.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Books per month</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.booksPerMonth.toFixed(1)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Books this year</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.booksThisYear}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Pages this year</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.pagesThisYear.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Time Analysis */}
          {stats.books.averageReadingTime > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Time Analysis
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Avg. reading time</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.averageReadingTime.toFixed(1)} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Total pages read</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.pagesRead.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Completion Rate */}
          {stats.books.completionRate > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Completion Rate
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Completion rate</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.books.completionRate.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-green-500 h-2 rounded-full transition-all"
                    style={{ width: `${stats.books.completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Reading Streak */}
          {stats.streak.currentStreak > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Reading Streak
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Current streak</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {stats.streak.currentStreak} days
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Longest streak</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.streak.longestStreak} days
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Engagement Stats */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Engagement
            </h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Books with reviews</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.books.withReviews}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Books with notes</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.books.withNotes}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Rereads</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {stats.books.rereads}
                </span>
              </div>
            </div>
          </div>

          {/* Show Engagement */}
          {stats.shows.total > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Show Engagement
              </h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Episodes watched</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.shows.episodesWatched.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Shows with reviews</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.shows.withReviews}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Rewatches</span>
                  <span className="font-semibold text-gray-900 dark:text-gray-100">
                    {stats.shows.rewatches}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {stats.books.total === 0 && stats.shows.total === 0 && (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400">
            Add some books and shows to see your statistics!
          </p>
        </div>
      )}
    </div>
  );
}

