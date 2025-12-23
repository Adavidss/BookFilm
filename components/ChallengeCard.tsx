'use client';

import { Challenge } from '@/types';

interface ChallengeCardProps {
  challenge: Challenge;
  onUpdate?: (challengeId: string, updates: Partial<Challenge>) => void;
  onDelete?: (challengeId: string) => void;
}

export default function ChallengeCard({ challenge, onUpdate, onDelete }: ChallengeCardProps) {
  const progress = challenge.target > 0 ? (challenge.current / challenge.target) * 100 : 0;
  const remaining = Math.max(0, challenge.target - challenge.current);
  const isCompleted = challenge.status === 'completed';
  const isFailed = challenge.status === 'failed';

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getChallengeTypeLabel = () => {
    switch (challenge.type) {
      case 'annual': return 'Annual';
      case 'monthly': return 'Monthly';
      case 'genre': return 'Genre';
      case 'pages': return 'Pages';
      default: return 'Custom';
    }
  };

  const getTargetLabel = () => {
    switch (challenge.type) {
      case 'annual':
      case 'monthly':
      case 'genre':
        return challenge.genre ? `${challenge.target} ${challenge.genre} books` : `${challenge.target} books`;
      case 'pages':
        return `${challenge.target.toLocaleString()} pages`;
      default:
        return `${challenge.target} items`;
    }
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 ${
      isCompleted ? 'border-2 border-green-500' : isFailed ? 'border-2 border-red-500' : ''
    }`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {challenge.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {getChallengeTypeLabel()} Challenge
          </p>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(challenge.id)}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          >
            ×
          </button>
        )}
      </div>

      <div className="mb-3">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
          <span>{challenge.current} / {challenge.target}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all ${
              isCompleted 
                ? 'bg-green-500' 
                : isFailed 
                ? 'bg-red-500' 
                : 'bg-blue-500'
            }`}
            style={{ width: `${Math.min(100, progress)}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {remaining} remaining
        </p>
      </div>

      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>Goal: {getTargetLabel()}</p>
        <p>
          {formatDate(challenge.startDate)} - {formatDate(challenge.endDate)}
        </p>
        {challenge.genre && (
          <p>Genre: {challenge.genre}</p>
        )}
      </div>

      {isCompleted && (
        <div className="mt-3 p-2 bg-green-50 dark:bg-green-900/20 rounded text-sm text-green-700 dark:text-green-300">
          ✓ Challenge completed!
        </div>
      )}
    </div>
  );
}

