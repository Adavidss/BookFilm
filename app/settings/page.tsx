'use client';

/**
 * Settings Page
 * Allows users to export/import their data and manage settings
 */

import { useState, useRef } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { useTheme } from '@/contexts/ThemeContext';

export default function SettingsPage() {
  const { userData, exportData, importData, clearAll, isLoading } = useUserData();
  const [importError, setImportError] = useState<string | null>(null);
  const [importSuccess, setImportSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Theme hook - safe for SSR
  let theme: 'light' | 'dark' = 'light';
  let toggleTheme: () => void = () => {};
  try {
    const themeContext = useTheme();
    theme = themeContext.theme;
    toggleTheme = themeContext.toggleTheme;
  } catch (e) {
    // Theme context not available during SSR, use default
  }

  const handleExport = () => {
    try {
      exportData();
    } catch (error) {
      console.error('Export failed:', error);
      setImportError('Failed to export data. Please try again.');
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError(null);
    setImportSuccess(false);

    try {
      await importData(file);
      setImportSuccess(true);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error: any) {
      setImportError(error.message || 'Failed to import data. Please check the file format.');
    }
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all your data? This cannot be undone.')) {
      clearAll();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  const bookCount = userData.readBooks.length;
  const showCount = userData.watchedShows.length;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
          Settings
        </h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage your data
        </p>
      </div>

      {/* Theme Toggle */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Appearance
        </h2>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Theme</p>
            <p className="text-xs text-gray-600 dark:text-gray-400">Switch between light and dark mode</p>
          </div>
          <button
            onClick={toggleTheme}
            className="relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 dark:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            role="switch"
            aria-checked={theme === 'dark'}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                theme === 'dark' ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          Current: {theme === 'dark' ? 'Dark' : 'Light'} mode
        </p>
      </div>

      {/* Data Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Your Data
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Books</p>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bookCount}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">TV Shows</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{showCount}</p>
          </div>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Export Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Download your reading and watching lists as a JSON file. You can use this to backup your data or import it later.
        </p>
        <button
          onClick={handleExport}
          disabled={bookCount === 0 && showCount === 0}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Export Data
        </button>
      </div>

      {/* Import Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
          Import Data
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Import your data from a previously exported JSON file. This will replace your current data.
        </p>
        
        {importError && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-sm text-red-700 dark:text-red-300">{importError}</p>
          </div>
        )}

        {importSuccess && (
          <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <p className="text-sm text-green-700 dark:text-green-300">
              Data imported successfully!
            </p>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
          id="import-file-input"
        />
        <label
          htmlFor="import-file-input"
          className="inline-block px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 cursor-pointer transition-colors"
        >
          Choose File to Import
        </label>
      </div>

      {/* Danger Zone */}
      <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-4">
          Danger Zone
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Permanently delete all your data. This action cannot be undone.
        </p>
        <button
          onClick={handleClearAll}
          disabled={bookCount === 0 && showCount === 0}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          Clear All Data
        </button>
      </div>
    </div>
  );
}

