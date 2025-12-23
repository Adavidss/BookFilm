'use client';

import { Review } from '@/types';
import { useState } from 'react';

interface ReviewCardProps {
  review: Review;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

export default function ReviewCard({ review, onEdit, onDelete, showActions = false }: ReviewCardProps) {
  const [showSpoilers, setShowSpoilers] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const shouldTruncate = review.content.length > 500;
  const displayContent = isExpanded || !shouldTruncate 
    ? review.content 
    : review.content.substring(0, 500) + '...';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-3">
      <div className="flex justify-between items-start">
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {formatDate(review.createdAt)}
          {review.updatedAt && review.updatedAt !== review.createdAt && (
            <span className="ml-2">(edited)</span>
          )}
        </div>
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-2">
            {onEdit && (
              <button
                onClick={onEdit}
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
              >
                Edit
              </button>
            )}
            {onDelete && (
              <button
                onClick={onDelete}
                className="text-sm text-red-600 dark:text-red-400 hover:underline"
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>

      <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
        {displayContent}
      </div>

      {shouldTruncate && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {review.hasSpoilers && review.spoilerSection && (
        <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-red-600 dark:text-red-400">
              ⚠️ Spoilers
            </span>
            <button
              onClick={() => setShowSpoilers(!showSpoilers)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showSpoilers ? 'Hide spoilers' : 'Show spoilers'}
            </button>
          </div>
          {showSpoilers && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
              {review.spoilerSection}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

