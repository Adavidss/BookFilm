/**
 * Skeleton loading component for BookCard
 */

export default function BookCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      {/* Cover Image Skeleton */}
      <div className="w-full aspect-[2/3] bg-gray-200 dark:bg-gray-700" />

      {/* Content Skeleton */}
      <div className="p-4">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-3/4" />

        {/* Author Skeleton */}
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-3 w-1/2" />

        {/* Genres Skeleton */}
        <div className="flex gap-2 mb-3">
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-16" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-14" />
        </div>

        {/* Actions Skeleton */}
        <div className="flex items-center justify-between mt-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-24" />
        </div>
      </div>
    </div>
  );
}

