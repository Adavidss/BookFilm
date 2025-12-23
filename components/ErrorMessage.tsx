'use client';

import { getErrorMessage, isRetryable } from '@/utils/errors';

interface ErrorMessageProps {
  error: unknown;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorMessage({ error, onRetry, className = '' }: ErrorMessageProps) {
  const message = getErrorMessage(error);
  const canRetry = isRetryable(error) && onRetry;

  return (
    <div className={`text-center py-12 ${className}`}>
      <div className="max-w-md mx-auto">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          Something went wrong
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          {message}
        </p>
        {canRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  );
}

