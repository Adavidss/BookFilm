/**
 * TV Show Card Component
 * Displays a single TV show with poster, title, and streaming availability
 */

import { TVShow, ShowStatus } from '@/types';
import Image from 'next/image';
import StarRating from './StarRating';
import StatusSelector from './StatusSelector';
import AddButtonWithStatus from './AddButtonWithStatus';

interface ShowCardProps {
  show: TVShow;
  onAdd?: (show: TVShow, status?: ShowStatus) => void;
  onRemove?: (showId: string) => void;
  onClick?: (show: TVShow) => void;
  isInList?: boolean;
  showReasons?: string[];
  rating?: number;
  onRatingChange?: (rating: number) => void;
  status?: ShowStatus;
  onStatusChange?: (status: ShowStatus) => void;
  priority?: boolean;
}

export default function ShowCard({
  show,
  onAdd,
  onRemove,
  onClick,
  isInList = false,
  showReasons = [],
  rating,
  onRatingChange,
  status,
  onStatusChange,
  priority = false,
}: ShowCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      {/* Poster Image */}
      <div
        className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 cursor-pointer overflow-hidden rounded-t-lg"
        onClick={() => onClick?.(show)}
      >
        {show.posterImage ? (
          <Image
            src={show.posterImage}
            alt={show.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
            unoptimized
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
          onClick={() => onClick?.(show)}
        >
          {show.title}
        </h3>

        {/* Rating and Year */}
        <div className="flex items-center gap-2 mb-2">
          {show.tmdbRating && (
            <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900 px-2 py-0.5 rounded">
              <span className="text-yellow-600 dark:text-yellow-400 text-xs font-semibold">
                ⭐ {show.tmdbRating}
              </span>
            </div>
          )}
          {show.firstAirDate && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {new Date(show.firstAirDate).getFullYear()}
              {show.numberOfSeasons && ` • ${show.numberOfSeasons} season${show.numberOfSeasons > 1 ? 's' : ''}`}
            </p>
          )}
        </div>

        {/* Genres */}
        {show.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {show.genres.slice(0, 3).map(genre => (
              <span
                key={genre}
                className="px-2 py-1 text-xs bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Recommendation Reasons */}
        {showReasons.length > 0 && (
          <div className="mb-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs">
            {showReasons.map((reason, i) => (
              <div key={i} className="text-blue-700 dark:text-blue-300">
                • {reason}
              </div>
            ))}
          </div>
        )}

        {/* Rating */}
        {isInList && (
          <div className="mb-3">
            <StarRating
              rating={rating}
              onRatingChange={onRatingChange}
              readonly={!onRatingChange}
              size="sm"
              showLabel={true}
            />
          </div>
        )}

        {/* Status */}
        {isInList && onStatusChange && (
          <div className="mb-3">
            <StatusSelector
              type="show"
              currentStatus={status}
              onStatusChange={(newStatus) => onStatusChange(newStatus as ShowStatus)}
              size="sm"
            />
          </div>
        )}

        {/* Streaming Platforms */}
        {show.platforms && show.platforms.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Available on:
            </p>
            <div className="flex flex-wrap gap-1">
              {show.platforms.map(platform => (
                platform.link ? (
                  <a
                    key={platform.name}
                    href={platform.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {platform.name}
                  </a>
                ) : (
                  <span
                    key={platform.name}
                    className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                  >
                    {platform.name}
                  </span>
                )
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end mt-4">
          {isInList ? (
            <button
              onClick={() => onRemove?.(show.id)}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Remove
            </button>
          ) : (
            <AddButtonWithStatus
              type="show"
              onAdd={(status) => {
                if (onAdd) {
                  onAdd(show, status as ShowStatus);
                }
              }}
              className="inline-block"
            />
          )}
        </div>
      </div>
    </div>
  );
}
