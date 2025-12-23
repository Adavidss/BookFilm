'use client';

import { useState } from 'react';
import { Note } from '@/types';

interface NoteEditorProps {
  note?: Note;
  type: 'book' | 'show';
  onSave: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onCancel?: () => void;
}

export default function NoteEditor({ note, type, onSave, onCancel }: NoteEditorProps) {
  const [content, setContent] = useState(note?.content || '');
  const [pageNumber, setPageNumber] = useState(note?.pageNumber?.toString() || '');
  const [episodeNumber, setEpisodeNumber] = useState(note?.episodeNumber?.toString() || '');
  const [seasonNumber, setSeasonNumber] = useState(note?.seasonNumber?.toString() || '');
  const [isQuote, setIsQuote] = useState(note?.isQuote || false);

  const handleSave = () => {
    onSave({
      content: content.trim(),
      pageNumber: type === 'book' && pageNumber ? parseInt(pageNumber) : undefined,
      episodeNumber: type === 'show' && episodeNumber ? parseInt(episodeNumber) : undefined,
      seasonNumber: type === 'show' && seasonNumber ? parseInt(seasonNumber) : undefined,
      isQuote,
      updatedAt: Date.now(),
    });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Note Content
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={isQuote ? 'Enter quote...' : 'Enter your note...'}
          className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100 resize-y min-h-[150px]"
        />
      </div>

      {type === 'book' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Page Number (optional)
          </label>
          <input
            type="number"
            value={pageNumber}
            onChange={(e) => setPageNumber(e.target.value)}
            placeholder="e.g., 42"
            min="1"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Season
            </label>
            <input
              type="number"
              value={seasonNumber}
              onChange={(e) => setSeasonNumber(e.target.value)}
              placeholder="1"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Episode
            </label>
            <input
              type="number"
              value={episodeNumber}
              onChange={(e) => setEpisodeNumber(e.target.value)}
              placeholder="1"
              min="1"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            />
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isQuote"
          checked={isQuote}
          onChange={(e) => setIsQuote(e.target.checked)}
          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="isQuote" className="text-sm text-gray-700 dark:text-gray-300">
          Mark as quote
        </label>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleSave}
          disabled={!content.trim()}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {note ? 'Update Note' : 'Save Note'}
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

