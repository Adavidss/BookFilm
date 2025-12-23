/**
 * Book Card Component
 * Displays a single book with cover, title, authors, and actions
 */

import { Book, BookStatus } from '@/types';
import Image from 'next/image';
import StarRating from './StarRating';
import StatusSelector from './StatusSelector';
import AddButtonWithStatus from './AddButtonWithStatus';

interface BookCardProps {
  book: Book;
  onAdd?: (book: Book, status?: BookStatus) => void;
  onRemove?: (bookId: string) => void;
  onClick?: (book: Book) => void;
  isInList?: boolean;
  showReasons?: string[];
  rating?: number;
  onRatingChange?: (rating: number) => void;
  status?: BookStatus;
  onStatusChange?: (status: BookStatus) => void;
  priority?: boolean;
  // New features
  progressPercentage?: number;
  hasReview?: boolean;
  customTags?: string[];
}

export default function BookCard({
  book,
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
  progressPercentage,
  hasReview,
  customTags,
}: BookCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm hover:shadow-md transition-shadow relative">
      {/* Cover Image */}
      <div
        className="relative w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700 cursor-pointer overflow-hidden rounded-t-lg"
        onClick={() => onClick?.(book)}
      >
        {book.coverImage ? (
          <Image
            src={book.coverImage}
            alt={book.title}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={priority}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-gray-400">
            <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3
          className="font-semibold text-lg text-gray-900 dark:text-gray-100 line-clamp-2 mb-1 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          onClick={() => onClick?.(book)}
        >
          {book.title}
        </h3>

        {book.authors.length > 0 && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            {book.authors.join(', ')}
          </p>
        )}

        {/* Google Books Rating */}
        {book.averageRating && (
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
                <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
              </svg>
              <span className="ml-1 text-sm font-medium text-gray-700 dark:text-gray-300">
                {book.averageRating}
              </span>
            </div>
            {book.ratingsCount && (
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({book.ratingsCount.toLocaleString()} {book.ratingsCount === 1 ? 'rating' : 'ratings'})
              </span>
            )}
          </div>
        )}

        {/* Genres */}
        {book.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {book.genres.slice(0, 3).map(genre => (
              <span
                key={genre}
                className="px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded"
              >
                {genre}
              </span>
            ))}
          </div>
        )}

        {/* Recommendation Reasons */}
        {showReasons.length > 0 && (
          <div className="mb-3 p-2 bg-purple-50 dark:bg-purple-900/20 rounded text-xs">
            {showReasons.map((reason, i) => (
              <div key={i} className="text-purple-700 dark:text-purple-300">
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

        {/* Progress Bar */}
        {isInList && progressPercentage !== undefined && progressPercentage > 0 && (
          <div className="mb-3">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{Math.round(progressPercentage)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
              <div
                className="bg-blue-500 h-1.5 rounded-full transition-all"
                style={{ width: `${Math.min(100, progressPercentage)}%` }}
              />
            </div>
          </div>
        )}

        {/* Custom Tags */}
        {customTags && customTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {customTags.slice(0, 2).map(tag => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded"
              >
                {tag}
              </span>
            ))}
            {customTags.length > 2 && (
              <span className="px-2 py-0.5 text-xs text-gray-500 dark:text-gray-400">
                +{customTags.length - 2}
              </span>
            )}
          </div>
        )}

        {/* Review Indicator */}
        {hasReview && (
          <div className="mb-3">
            <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Reviewed
            </span>
          </div>
        )}

        {/* Status */}
        {isInList && onStatusChange && (
          <div className="mb-3">
            <StatusSelector
              type="book"
              currentStatus={status}
              onStatusChange={(newStatus) => onStatusChange(newStatus as BookStatus)}
              size="sm"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          {/* Availability Links */}
          <div className="flex space-x-2">
            {book.amazonLink && (
              <a
                href={book.amazonLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Amazon
              </a>
            )}
            {book.kindleLink && (
              <a
                href={book.kindleLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                Kindle
              </a>
            )}
          </div>

          {/* Add/Remove Button */}
          {isInList ? (
            <button
              onClick={() => onRemove?.(book.id)}
              className="px-3 py-1 text-sm bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
            >
              Remove
            </button>
          ) : (
            <AddButtonWithStatus
              type="book"
              onAdd={(status) => {
                if (onAdd) {
                  onAdd(book, status as BookStatus);
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
