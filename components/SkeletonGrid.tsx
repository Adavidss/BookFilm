/**
 * Grid of skeleton cards for loading states
 */

import BookCardSkeleton from './BookCardSkeleton';
import ShowCardSkeleton from './ShowCardSkeleton';

interface SkeletonGridProps {
  type: 'book' | 'show';
  count?: number;
  className?: string;
}

export default function SkeletonGrid({ type, count = 8, className = '' }: SkeletonGridProps) {
  const SkeletonComponent = type === 'book' ? BookCardSkeleton : ShowCardSkeleton;

  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <SkeletonComponent key={index} />
      ))}
    </div>
  );
}

