'use client';

import { useState } from 'react';

interface FilterBarProps {
  type: 'book' | 'show';
  onFilter: (genre: string) => void;
  onClear: () => void;
}

const BOOK_GENRES = [
  'Fiction', 'Non-Fiction', 'Mystery', 'Thriller', 'Romance', 'Science Fiction',
  'Fantasy', 'Horror', 'Biography', 'History', 'Self-Help', 'Business'
];

const SHOW_GENRES = [
  'Action', 'Adventure', 'Comedy', 'Crime', 'Documentary', 'Drama',
  'Fantasy', 'Horror', 'Mystery', 'Romance', 'Sci-Fi', 'Thriller'
];

export default function FilterBar({ type, onFilter, onClear }: FilterBarProps) {
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [isOpen, setIsOpen] = useState(false);

  const genres = type === 'book' ? BOOK_GENRES : SHOW_GENRES;

  const handleGenreSelect = (genre: string) => {
    setSelectedGenre(genre);
    onFilter(genre);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelectedGenre('');
    onClear();
    setIsOpen(false);
  };

  return (
    <div className="relative w-full sm:w-auto">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full sm:w-auto px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-between gap-2"
      >
        <span className="flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {selectedGenre || 'Filter by Genre'}
        </span>
        <svg className={`w-4 h-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-2 w-full sm:w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            {selectedGenre && (
              <button
                onClick={handleClear}
                className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-200 dark:border-gray-700"
              >
                Clear Filter
              </button>
            )}
            {genres.map(genre => (
              <button
                key={genre}
                onClick={() => handleGenreSelect(genre)}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  selectedGenre === genre
                    ? 'bg-blue-50 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
