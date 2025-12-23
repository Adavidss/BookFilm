'use client';

import { useState, KeyboardEvent } from 'react';

interface TagManagerProps {
  tags: string[];
  onAddTag: (tag: string) => void;
  onRemoveTag: (tag: string) => void;
  suggestions?: string[];
  maxTags?: number;
}

export default function TagManager({ 
  tags, 
  onAddTag, 
  onRemoveTag, 
  suggestions = [], 
  maxTags 
}: TagManagerProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);

  const filteredSuggestions = suggestions.filter(
    s => s.toLowerCase().includes(inputValue.toLowerCase()) && !tags.includes(s)
  );

  const handleInputKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      if (!maxTags || tags.length < maxTags) {
        onAddTag(inputValue.trim());
        setInputValue('');
        setShowSuggestions(false);
      }
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      onRemoveTag(tags[tags.length - 1]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => 
        prev < filteredSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (!maxTags || tags.length < maxTags) {
      onAddTag(suggestion);
      setInputValue('');
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border border-gray-300 dark:border-gray-600 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent dark:bg-gray-800">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded text-sm"
          >
            {tag}
            <button
              onClick={() => onRemoveTag(tag)}
              className="text-blue-500 hover:text-blue-700 dark:hover:text-blue-200"
            >
              ×
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
            setSelectedSuggestionIndex(-1);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleInputKeyDown}
          placeholder={maxTags && tags.length >= maxTags ? 'Max tags reached' : 'Add tag...'}
          disabled={maxTags ? tags.length >= maxTags : false}
          className="flex-1 min-w-[100px] bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-400"
        />
      </div>

      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-40 overflow-y-auto">
          {filteredSuggestions.map((suggestion, index) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => handleSuggestionClick(suggestion)}
              onMouseEnter={() => setSelectedSuggestionIndex(index)}
              className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                index === selectedSuggestionIndex ? 'bg-gray-100 dark:bg-gray-700' : ''
              }`}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {maxTags && (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {tags.length} / {maxTags} tags
        </p>
      )}
    </div>
  );
}

