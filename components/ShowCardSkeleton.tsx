/**
 * Skeleton loading component for ShowCard
 */

export default function ShowCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Poster Image Skeleton */}
      <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />

        {/* Rating/Year Skeleton */}
        <div className="flex items-center gap-2 mb-2">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>

        {/* Genres Skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
        </div>

        {/* Platforms Skeleton */}
        <div className="mb-3">
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-2" />
          <div className="flex gap-2">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          </div>
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center justify-end mt-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-28" />
        </div>
      </div>
    </div>
  );
}

