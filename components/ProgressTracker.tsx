'use client';

import { useState } from 'react';
import { Book, TVShow } from '@/types';

interface ProgressTrackerProps {
  item: Book | TVShow;
  type: 'book' | 'show';
  currentProgress?: {
    currentPage?: number;
    currentSeason?: number;
    currentEpisode?: number;
    pagesRead?: number;
    episodesWatched?: number;
    progressPercentage?: number;
  };
  onUpdate: (progress: {
    currentPage?: number;
    currentSeason?: number;
    currentEpisode?: number;
    pagesRead?: number;
    episodesWatched?: number;
    progressPercentage?: number;
  }) => void;
}

export default function ProgressTracker({ 
  item, 
  type, 
  currentProgress, 
  onUpdate 
}: ProgressTrackerProps) {
  const [currentPage, setCurrentPage] = useState(currentProgress?.currentPage?.toString() || '');
  const [currentSeason, setCurrentSeason] = useState(currentProgress?.currentSeason?.toString() || '1');
  const [currentEpisode, setCurrentEpisode] = useState(currentProgress?.currentEpisode?.toString() || '1');

  const handleBookProgress = () => {
    const page = parseInt(currentPage);
    const totalPages = 'pageCount' in item ? item.pageCount : undefined;
    
    if (isNaN(page) || page < 0) return;
    
    const pagesRead = page;
    const progressPercentage = totalPages 
      ? Math.min(100, Math.round((page / totalPages) * 100))
      : undefined;

    onUpdate({
      currentPage: page,
      pagesRead,
      progressPercentage,
    });
  };

  const handleShowProgress = () => {
    const season = parseInt(currentSeason);
    const episode = parseInt(currentEpisode);
    
    if (isNaN(season) || isNaN(episode) || season < 1 || episode < 1) return;

    const totalSeasons = 'numberOfSeasons' in item ? item.numberOfSeasons : undefined;
    // Estimate episodes per season (typically 10-13 for most shows)
    const estimatedEpisodesPerSeason = 12;
    const totalEpisodes = totalSeasons ? totalSeasons * estimatedEpisodesPerSeason : undefined;
    
    // Rough calculation: assume each season has similar episode count
    const episodesWatched = (season - 1) * estimatedEpisodesPerSeason + episode;
    const progressPercentage = totalEpisodes
      ? Math.min(100, Math.round((episodesWatched / totalEpisodes) * 100))
      : undefined;

    onUpdate({
      currentSeason: season,
      currentEpisode: episode,
      episodesWatched,
      progressPercentage,
    });
  };

  if (type === 'book') {
    const book = item as Book;
    const totalPages = book.pageCount || 0;
    const progress = currentProgress?.progressPercentage || 0;
    const pagesRead = currentProgress?.pagesRead || 0;

    return (
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Current Page
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={currentPage}
              onChange={(e) => setCurrentPage(e.target.value)}
              placeholder="0"
              min="0"
              max={totalPages || undefined}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
            {totalPages > 0 && (
              <span className="px-3 py-2 text-gray-600 dark:text-gray-400">
                / {totalPages}
              </span>
            )}
            <button
              onClick={handleBookProgress}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Update
            </button>
          </div>
        </div>

        {progress > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {pagesRead} of {totalPages || '?'} pages read
            </div>
          </div>
        )}
      </div>
    );
  } else {
    const show = item as TVShow;
    const totalSeasons = show.numberOfSeasons || 0;
    const progress = currentProgress?.progressPercentage || 0;
    const episodesWatched = currentProgress?.episodesWatched || 0;

    return (
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Season
            </label>
            <input
              type="number"
              value={currentSeason}
              onChange={(e) => setCurrentSeason(e.target.value)}
              placeholder="1"
              min="1"
              max={totalSeasons || undefined}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Episode
            </label>
            <input
              type="number"
              value={currentEpisode}
              onChange={(e) => setCurrentEpisode(e.target.value)}
              placeholder="1"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
        <button
          onClick={handleShowProgress}
          className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
        >
          Update Progress
        </button>

        {progress > 0 && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-purple-500 h-2 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Season {currentProgress?.currentSeason || 1}, Episode {currentProgress?.currentEpisode || 1}
            </div>
          </div>
        )}
      </div>
    );
  }
}

