'use client';

import { Series } from '@/types';

interface SeriesTrackerProps {
  series: Series;
  onUpdate?: (seriesId: string, updates: Partial<Series>) => void;
  onDelete?: (seriesId: string) => void;
}

export default function SeriesTracker({ series, onUpdate, onDelete }: SeriesTrackerProps) {
  const completedCount = series.userProgress?.completedItems.length || 0;
  const totalCount = series.items.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
  const currentItem = series.items.find(item => item.id === series.userProgress?.currentItemId);
  const nextItem = series.items.find(item => 
    !series.userProgress?.completedItems.includes(item.id) && 
    item.id !== series.userProgress?.currentItemId
  );

  const handleMarkComplete = (itemId: string) => {
    if (!onUpdate) return;
    const completed = series.userProgress?.completedItems || [];
    if (!completed.includes(itemId)) {
      onUpdate(series.id, {
        userProgress: {
          completedItems: [...completed, itemId],
          currentItemId: itemId === series.userProgress?.currentItemId ? undefined : series.userProgress?.currentItemId,
        },
      });
    }
  };

  const handleSetCurrent = (itemId: string) => {
    if (!onUpdate) return;
    onUpdate(series.id, {
      userProgress: {
        completedItems: series.userProgress?.completedItems || [],
        currentItemId: itemId,
      },
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
            {series.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {series.type === 'book' ? 'Book Series' : 'TV Series'}
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => {
              if (confirm('Delete this series?')) {
                onDelete(series.id);
              }
            }}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-4">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>Progress</span>
          <span>{completedCount} / {totalCount}</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {currentItem && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Currently {series.type === 'book' ? 'Reading' : 'Watching'}: {currentItem.title}
          </p>
        </div>
      )}

      {nextItem && (
        <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="text-sm font-medium text-green-700 dark:text-green-300">
            Next: {nextItem.title}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Series Items
        </h4>
        <div className="space-y-1">
          {series.items.map((item, index) => {
            const isCompleted = series.userProgress?.completedItems.includes(item.id);
            const isCurrent = series.userProgress?.currentItemId === item.id;
            
            return (
              <div
                key={item.id}
                className={`flex items-center gap-2 p-2 rounded ${
                  isCurrent ? 'bg-blue-100 dark:bg-blue-900' : 
                  isCompleted ? 'bg-gray-100 dark:bg-gray-700' : 
                  'bg-white dark:bg-gray-800'
                }`}
              >
                <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
                  {index + 1}.
                </span>
                <span className={`flex-1 text-sm ${
                  isCompleted ? 'line-through text-gray-500 dark:text-gray-400' : 
                  isCurrent ? 'font-semibold text-blue-700 dark:text-blue-300' :
                  'text-gray-900 dark:text-gray-100'
                }`}>
                  {item.title}
                </span>
                {onUpdate && (
                  <div className="flex gap-1">
                    {!isCompleted && (
                      <button
                        onClick={() => handleMarkComplete(item.id)}
                        className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        ✓
                      </button>
                    )}
                    {!isCurrent && (
                      <button
                        onClick={() => handleSetCurrent(item.id)}
                        className="text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Set Current
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

