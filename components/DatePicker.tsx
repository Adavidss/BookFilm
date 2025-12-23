'use client';

import { useState } from 'react';

interface DatePickerProps {
  label: string;
  value?: number; // timestamp
  onChange: (timestamp: number | undefined) => void;
  maxDate?: Date;
  minDate?: Date;
}

export default function DatePicker({ label, value, onChange, maxDate, minDate }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  const dateValue = value ? new Date(value) : null;
  const dateString = dateValue ? dateValue.toISOString().split('T')[0] : '';

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateStr = e.target.value;
    if (dateStr) {
      const date = new Date(dateStr);
      onChange(date.getTime());
    } else {
      onChange(undefined);
    }
  };

  const handleClear = () => {
    onChange(undefined);
  };

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="date"
          value={dateString}
          onChange={handleDateChange}
          max={maxDate?.toISOString().split('T')[0]}
          min={minDate?.toISOString().split('T')[0]}
          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-gray-100"
        />
        {value && (
          <button
            onClick={handleClear}
            className="px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            Clear
          </button>
        )}
      </div>
      {dateValue && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {dateValue.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      )}
    </div>
  );
}

