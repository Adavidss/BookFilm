'use client';

import { useState } from 'react';
import { Challenge } from '@/types';
import DatePicker from './DatePicker';

interface ChallengeCreatorProps {
  onCreate: (challenge: Omit<Challenge, 'id' | 'createdAt' | 'current' | 'status'>) => void;
  onCancel?: () => void;
}

export default function ChallengeCreator({ onCreate, onCancel }: ChallengeCreatorProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Challenge['type']>('annual');
  const [target, setTarget] = useState('');
  const [genre, setGenre] = useState('');
  const [startDate, setStartDate] = useState<number>(Date.now());
  const [endDate, setEndDate] = useState<number>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() + 1);
    return date.getTime();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !target) return;

    onCreate({
      name: name.trim(),
      type,
      target: parseInt(target),
      genre: type === 'genre' ? genre.trim() : undefined,
      startDate,
      endDate,
    });

    // Reset form
    setName('');
    setTarget('');
    setGenre('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Challenge Name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., 2024 Reading Challenge"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Challenge Type
        </label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as Challenge['type'])}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="annual">Annual</option>
          <option value="monthly">Monthly</option>
          <option value="genre">Genre</option>
          <option value="pages">Pages</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      {type === 'genre' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Genre
          </label>
          <input
            type="text"
            value={genre}
            onChange={(e) => setGenre(e.target.value)}
            placeholder="e.g., Science Fiction"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
            required={type === 'genre'}
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Target
        </label>
        <input
          type="number"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          placeholder={type === 'pages' ? 'e.g., 10000' : 'e.g., 50'}
          min="1"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
          required
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {type === 'pages' ? 'Total pages to read' : 'Number of books/shows'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <DatePicker
          label="Start Date"
          value={startDate}
          onChange={(timestamp) => timestamp && setStartDate(timestamp)}
          maxDate={new Date(endDate)}
        />
        <DatePicker
          label="End Date"
          value={endDate}
          onChange={(timestamp) => timestamp && setEndDate(timestamp)}
          minDate={new Date(startDate)}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={!name.trim() || !target}
          className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Create Challenge
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

