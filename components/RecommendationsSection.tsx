'use client';

import { useState, useEffect } from 'react';
import { Book, UserBook, Recommendation } from '@/types';
import { getPopularBooks, getBooksByGenre } from '@/utils/api';
import { recommendBooks } from '@/lib/recommendationEngine';
import BookCard from './BookCard';
import SkeletonGrid from './SkeletonGrid';
import ErrorMessage from './ErrorMessage';

interface RecommendationsSectionProps {
  userBooks: UserBook[];
  addBook: (book: Book, status?: any) => void;
  hasBook: (bookId: string) => boolean;
  getBookRating: (bookId: string) => number | undefined;
  setBookRating: (bookId: string, rating: number) => void;
  getBookStatus: (bookId: string) => any;
  setBookStatus: (bookId: string, status: any) => void;
  onBookClick: (book: Book) => void;
}

export default function RecommendationsSection({
  userBooks,
  addBook,
  hasBook,
  getBookRating,
  setBookRating,
  getBookStatus,
  setBookStatus,
  onBookClick,
}: RecommendationsSectionProps) {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    generateRecommendations();
  }, [userBooks]);

  const generateRecommendations = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const userGenres = new Set<string>();
      userBooks.forEach(ub => {
        ub.book.genres.forEach(g => userGenres.add(g));
      });

      const candidateBooks: Book[] = [];
      
      // If user has books with genres, fetch books by matching genres
      if (userGenres.size > 0) {
        // Get unique genres from user's books
        const uniqueGenres = Array.from(userGenres).slice(0, 3);
        if (uniqueGenres.length > 0) {
          const genreBooks = await getBooksByGenre(uniqueGenres, 30);
          candidateBooks.push(...genreBooks);
        }
      }

      // Always add popular books as fallback and for variety
      const popularBooks = await getPopularBooks(30);
      candidateBooks.push(...popularBooks);

      // Remove duplicates
      const uniqueBooks = Array.from(
        new Map(candidateBooks.map(book => [book.id, book])).values()
      );

      // Filter out books that are already in user's list
      const excludeIds = new Set(userBooks.map(ub => ub.book.id));
      const filteredBooks = uniqueBooks.filter(book => !excludeIds.has(book.id));

      const recs = recommendBooks(userBooks, filteredBooks, 12);
      setRecommendations(recs);
    } catch (error) {
      console.error('Error generating recommendations:', error);
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <SkeletonGrid type="book" count={6} />;
  }

  if (error) {
    return <ErrorMessage error={error} onRetry={generateRecommendations} />;
  }

  if (recommendations.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          No recommendations available. Add some books to get personalized recommendations!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {recommendations.map((rec, index) => (
        <BookCard
          key={rec.item.id}
          book={rec.item as Book}
          onAdd={addBook}
          onClick={onBookClick}
          isInList={hasBook(rec.item.id)}
          showReasons={rec.reasons}
          rating={hasBook(rec.item.id) ? getBookRating(rec.item.id) : undefined}
          onRatingChange={hasBook(rec.item.id) ? (rating) => setBookRating(rec.item.id, rating) : undefined}
          status={hasBook(rec.item.id) ? getBookStatus(rec.item.id) : undefined}
          onStatusChange={hasBook(rec.item.id) ? (status) => setBookStatus(rec.item.id, status) : undefined}
          priority={index < 4}
        />
      ))}
    </div>
  );
}

