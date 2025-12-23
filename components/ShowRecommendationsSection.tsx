'use client';

import { useState, useEffect } from 'react';
import { TVShow, UserShow, Recommendation } from '@/types';
import { getPopularShows } from '@/utils/api';
import { recommendShows } from '@/lib/recommendationEngine';
import ShowCard from './ShowCard';
import SkeletonGrid from './SkeletonGrid';
import ErrorMessage from './ErrorMessage';

interface ShowRecommendationsSectionProps {
  userShows: UserShow[];
  addShow: (show: TVShow, status?: any) => void;
  hasShow: (showId: string) => boolean;
  getShowRating: (showId: string) => number | undefined;
  setShowRating: (showId: string, rating: number) => void;
  getShowStatus: (showId: string) => any;
  setShowStatus: (showId: string, status: any) => void;
  onShowClick: (show: TVShow) => void;
}

export default function ShowRecommendationsSection({
  userShows,
  addShow,
  hasShow,
  getShowRating,
  setShowRating,
  getShowStatus,
  setShowStatus,
  onShowClick,
}: ShowRecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    generateRecommendations();
  }, [userShows]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const popularShows = await getPopularShows(50);
      const recs = recommendShows(userShows, popularShows, 12);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonGrid type="show" count={6} />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={generateRecommendations} />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No recommendations available. Add some shows to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {recommendations.map((rec, index) => (
        <ShowCard
          key={rec.item.id}
          show={rec.item as TVShow}
          onAdd={addShow}
          onClick={onShowClick}
          isInList={hasShow(rec.item.id)}
          showReasons={rec.reasons}
          rating={hasShow(rec.item.id) ? getShowRating(rec.item.id) : undefined}
          onRatingChange={hasShow(rec.item.id) ? (rating) => setShowRating(rec.item.id, rating) : undefined}
          status={hasShow(rec.item.id) ? getShowStatus(rec.item.id) : undefined}
          onStatusChange={hasShow(rec.item.id) ? (status) => setShowStatus(rec.item.id, status) : undefined}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

