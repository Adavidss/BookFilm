'use client';

import { Book, TVShow } from '@/types';
import Image from 'next/image';
import { useEffect } from 'react';

interface DetailModalProps {
  item: Book | TVShow | null;
  type: 'book' | 'show';
  onClose: () => void;
}

export default function DetailModal(props: DetailModalProps) {
  const { item, type, onClose } = props;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!item) return null;

  const isBook = type === 'book';
  const book = isBook ? (item as Book) : undefined;
  const show = !isBook ? (item as TVShow) : undefined;
  const coverImage = isBook ? book?.coverImage : show?.posterImage;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-shrink-0">
                <div className="relative w-full md:w-64 aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {coverImage ? (
                    <Image src={coverImage} alt={item.title} fill className="object-contain" sizes="256px" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h2>

                {isBook && book && book.authors.length > 0 && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">by {book.authors.join(', ')}</p>
                )}

                {!isBook && show && show.tmdbRating && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center bg-yellow-100 dark:bg-yellow-900 px-3 py-1 rounded">
                      <span className="text-yellow-800 dark:text-yellow-200 font-semibold">⭐ {show.tmdbRating}/10</span>
                    </div>
                    {show.imdbId && (
                      <a href={`https://www.imdb.com/title/${show.imdbId}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                        View on IMDB
                      </a>
                    )}
                  </div>
                )}

                {item.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    {item.genres.map(genre => (
                      <span key={genre} className={`px-3 py-1 text-sm rounded ${isBook ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'}`}>
                        {genre}
                      </span>
                    ))}
                  </div>
                )}

                {!isBook && show && show.platforms && show.platforms.length > 0 && (
                  <div className="mb-4">
                    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Watch on:</h3>
                    <div className="flex flex-wrap gap-2">
                      {show.platforms.map(platform => (
                        platform.link ? (
                          <a
                            key={platform.name}
                            href={platform.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                          >
                            {platform.name}
                          </a>
                        ) : (
                          <div key={platform.name} className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm font-medium text-gray-800 dark:text-gray-200">
                            {platform.name}
                          </div>
                        )
                      ))}
                    </div>
                  </div>
                )}

                {item.description && (
                  <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Synopsis</h3>
                    <div className="text-gray-700 dark:text-gray-300 leading-relaxed max-h-96 overflow-y-auto">
                      {item.description.replace(/<[^>]*>/g, '')}
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 mt-6">
                  {isBook && book && (
                    <>
                      {book.amazonLink && (
                        <a href={book.amazonLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors text-sm font-medium">Amazon</a>
                      )}
                      {book.kindleLink && (
                        <a href={book.kindleLink} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium">Kindle</a>
                      )}
                    </>
                  )}
                  {!isBook && show && show.imdbId && (
                    <a href={`https://www.imdb.com/title/${show.imdbId}`} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors text-sm font-medium">IMDB</a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
