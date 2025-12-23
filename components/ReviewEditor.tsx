'use client';

import { useState } from 'react';
import { Review } from '@/types';

interface ReviewEditorProps {
  review?: Review;
  onSave: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
  maxLength?: number;
}

export default function ReviewEditor({ review, onSave, onCancel, maxLength = 10000 }: ReviewEditorProps) {
  const [content, setContent] = useState(review?.content || '');
  const [spoilerSection, setSpoilerSection] = useState(review?.spoilerSection || '');
  const [hasSpoilers, setHasSpoilers] = useState(review?.hasSpoilers || false);
  const [showSpoilerSection, setShowSpoilerSection] = useState(!!review?.spoilerSection);

  const handleSave = () => {
    onSave({
      content: content.trim(),
      spoilerSection: showSpoilerSection ? spoilerSection.trim() : undefined,
      hasSpoilers: hasSpoilers || showSpoilerSection,
      updatedAt: Date.now(),
    });
  };

  const remainingChars = maxLength - content.length;
  const spoilerRemainingChars = maxLength - spoilerSection.length;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Your Review
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Share your thoughts about this book/show..."
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 resize-y min-h-[200px]"
          maxLength={maxLength}
        />
        <div className="flex justify-between items-center mt-1">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {content.length} / {maxLength} characters
          </span>
          {remainingChars < 100 && (
            <span className={`text-xs ${remainingChars < 0 ? 'text-red-500' : 'text-yellow-600'}`}>
              {remainingChars} remaining
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="hasSpoilers"
          checked={hasSpoilers}
          onChange={(e) => setHasSpoilers(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="hasSpoilers" className="text-sm text-gray-700 dark:text-gray-300">
          Contains spoilers
        </label>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="showSpoilerSection"
          checked={showSpoilerSection}
          onChange={(e) => setShowSpoilerSection(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="showSpoilerSection" className="text-sm text-gray-700 dark:text-gray-300">
          Add separate spoiler section
        </label>
      </div>

      {showSpoilerSection && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Spoiler Section (optional)
          </label>
          <textarea
            value={spoilerSection}
            onChange={(e) => setSpoilerSection(e.target.value)}
            placeholder="Spoiler content goes here..."
            className="w-full px-4 py-3 border border-red-300 dark:border-red-600 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 resize-y min-h-[150px] bg-red-50 dark:bg-red-900/10"
            maxLength={maxLength}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-red-600 dark:text-red-400">
              ⚠️ Spoiler content
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {spoilerSection.length} / {maxLength} characters
            </span>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!content.trim() || content.length > maxLength}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {review ? 'Update Review' : 'Save Review'}
        </button>
        {onCancel && (
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

