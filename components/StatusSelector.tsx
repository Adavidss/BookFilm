'use client';

import { BookStatus, ShowStatus } from '@/types';

interface StatusSelectorProps {
  type: 'book' | 'show';
  currentStatus?: BookStatus | ShowStatus;
  onStatusChange: (status: BookStatus | ShowStatus) => void;
  size?: 'sm' | 'md';
}

const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Reading' },
  { value: 'read', label: 'Read' },
  { value: 'dropped', label: 'Dropped' },
];

const SHOW_STATUSES: { value: ShowStatus; label: string }[] = [
  { value: 'want-to-watch', label: 'Want to Watch' },
  { value: 'watching', label: 'Watching' },
  { value: 'watched', label: 'Watched' },
  { value: 'dropped', label: 'Dropped' },
];

export default function StatusSelector({
  type,
  currentStatus,
  onStatusChange,
  size = 'sm',
}: StatusSelectorProps) {
  const statuses = type === 'book' ? BOOK_STATUSES : SHOW_STATUSES;
  const defaultStatus = type === 'book' ? 'want-to-read' : 'want-to-watch';
  const status = currentStatus || defaultStatus;

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-2',
  };

  return (
    <select
      value={status}
      onChange={(e) => onStatusChange(e.target.value as BookStatus | ShowStatus)}
      className={`${sizeClasses[size]} bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500`}
    >
      {statuses.map(({ value, label }) => (
        <option key={value} value={value}>
          {label}
        </option>
      ))}
    </select>
  );
}

