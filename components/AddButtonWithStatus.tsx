'use client';

import { useState, useRef, useEffect } from 'react';
import { BookStatus, ShowStatus } from '@/types';

interface AddButtonWithStatusProps {
  type: 'book' | 'show';
  onAdd: (status?: BookStatus | ShowStatus) => void;
  className?: string;
}

const BOOK_STATUSES: { value: BookStatus; label: string }[] = [
  { value: 'want-to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'read', label: 'Read' },
  { value: 'dropped', label: 'Dropped' },
];

const SHOW_STATUSES: { value: ShowStatus; label: string }[] = [
  { value: 'want-to-watch', label: 'Want to Watch' },
  { value: 'watching', label: 'Currently Watching' },
  { value: 'watched', label: 'Watched' },
  { value: 'dropped', label: 'Dropped' },
];

export default function AddButtonWithStatus({ type, onAdd, className = '' }: AddButtonWithStatusProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const statuses = type === 'book' ? BOOK_STATUSES : SHOW_STATUSES;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleStatusSelect = (status: BookStatus | ShowStatus) => {
    onAdd(status);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors flex items-center gap-1"
      >
        Add
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[99]" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-[100] max-h-[200px] overflow-y-auto">
            <div className="py-1">
              {statuses.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleStatusSelect(value)}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

