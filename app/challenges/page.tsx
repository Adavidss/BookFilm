'use client';

import { useState } from 'react';
import { useUserData } from '@/hooks/useUserData';
import { Challenge } from '@/types';
import ChallengeCard from '@/components/ChallengeCard';
import ChallengeCreator from '@/components/ChallengeCreator';

export default function ChallengesPage() {
  const { userData, createChallenge, updateChallenge, deleteChallenge, isLoading } = useUserData();
  const [showCreator, setShowCreator] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);

  const challenges = userData.challenges || [];

  const handleCreate = (challengeData: Omit<Challenge, 'id' | 'createdAt' | 'current' | 'status'>) => {
    createChallenge({
      ...challengeData,
      current: 0,
      status: 'active',
    });
    setShowCreator(false);
  };

  const handleUpdate = (challengeId: string, updates: Partial<Challenge>) => {
    updateChallenge(challengeId, updates);
    setEditingChallenge(null);
  };

  const handleDelete = (challengeId: string) => {
    if (confirm('Are you sure you want to delete this challenge?')) {
      deleteChallenge(challengeId);
    }
  };

  // Auto-update challenge progress based on user data
  const updateChallengeProgress = () => {
    challenges.forEach(challenge => {
      if (challenge.status === 'active') {
        let current = 0;

        if (challenge.type === 'annual' || challenge.type === 'monthly') {
          const startDate = challenge.startDate;
          const endDate = challenge.endDate;
          const completedBooks = userData.readBooks.filter(ub => {
            if (!ub.finishDate) return false;
            return ub.finishDate >= startDate && ub.finishDate <= endDate;
          });
          current = completedBooks.length;
        } else if (challenge.type === 'genre') {
          const startDate = challenge.startDate;
          const endDate = challenge.endDate;
          const genreBooks = userData.readBooks.filter(ub => {
            if (!ub.finishDate) return false;
            if (ub.finishDate < startDate || ub.finishDate > endDate) return false;
            return ub.book.genres.some(g => 
              g.toLowerCase().includes(challenge.genre?.toLowerCase() || '')
            );
          });
          current = genreBooks.length;
        } else if (challenge.type === 'pages') {
          const startDate = challenge.startDate;
          const endDate = challenge.endDate;
          const booksInPeriod = userData.readBooks.filter(ub => {
            if (!ub.finishDate) return false;
            return ub.finishDate >= startDate && ub.finishDate <= endDate;
          });
          current = booksInPeriod.reduce((sum, ub) => sum + (ub.pagesRead || 0), 0);
        }

        if (current !== challenge.current) {
          updateChallenge(challenge.id, { current });
        }
      }
    });
  };

  // Update progress when component mounts or user data changes
  useState(() => {
    if (challenges.length > 0) {
      updateChallengeProgress();
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100">
            Challenges
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Set goals and track progress
          </p>
        </div>
        <button
          onClick={() => setShowCreator(true)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
        >
          + New
        </button>
      </div>

      {showCreator && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Create New Challenge
          </h2>
          <ChallengeCreator
            onCreate={handleCreate}
            onCancel={() => setShowCreator(false)}
          />
        </div>
      )}

      {editingChallenge && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Edit Challenge
          </h2>
          <ChallengeCreator
            onCreate={(data) => handleUpdate(editingChallenge.id, {
              ...data,
              current: editingChallenge.current,
              status: editingChallenge.status,
            })}
            onCancel={() => setEditingChallenge(null)}
          />
        </div>
      )}

      {challenges.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            No challenges yet. Create one to get started!
          </p>
          <button
            onClick={() => setShowCreator(true)}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Create Your First Challenge
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {challenges.map(challenge => (
            <ChallengeCard
              key={challenge.id}
              challenge={challenge}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}

