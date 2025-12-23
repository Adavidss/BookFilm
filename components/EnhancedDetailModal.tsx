'use client';

import { useState } from 'react';
import { Book, TVShow, Review, Note } from '@/types';
import Image from 'next/image';
import { useEffect } from 'react';
import ReviewEditor from './ReviewEditor';
import ReviewCard from './ReviewCard';
import ProgressTracker from './ProgressTracker';
import DatePicker from './DatePicker';
import NoteEditor from './NoteEditor';
import TagManager from './TagManager';
import StarRating from './StarRating';
import StatusSelector from './StatusSelector';

interface EnhancedDetailModalProps {
  item: Book | TVShow | null;
  type: 'book' | 'show';
  onClose: () => void;
  // User data
  isInList: boolean;
  rating?: number;
  onRatingChange?: (rating: number) => void;
  status?: 'want-to-read' | 'reading' | 'read' | 'dropped' | 'want-to-watch' | 'watching' | 'watched';
  onStatusChange?: (status: 'want-to-read' | 'reading' | 'read' | 'dropped' | 'want-to-watch' | 'watching' | 'watched') => void;
  // Progress
  progress?: {
    currentPage?: number;
    currentSeason?: number;
    currentEpisode?: number;
    pagesRead?: number;
    episodesWatched?: number;
    progressPercentage?: number;
  };
  onProgressUpdate?: (progress: any) => void;
  // Dates
  dates?: {
    startDate?: number;
    finishDate?: number;
  };
  onDatesUpdate?: (dates: { startDate?: number; finishDate?: number }) => void;
  // Review
  review?: Review;
  onReviewSave?: (review: Omit<Review, 'id' | 'createdAt'>) => void;
  onReviewDelete?: () => void;
  // Notes
  notes?: Note[];
  onNoteAdd?: (note: Omit<Note, 'id' | 'createdAt'>) => void;
  onNoteUpdate?: (noteId: string, updates: Partial<Note>) => void;
  onNoteDelete?: (noteId: string) => void;
  // Tags
  customTags?: string[];
  onTagAdd?: (tag: string) => void;
  onTagRemove?: (tag: string) => void;
  tagSuggestions?: string[];
}

export default function EnhancedDetailModal({
  item,
  type,
  onClose,
  isInList,
  rating,
  onRatingChange,
  status,
  onStatusChange,
  progress,
  onProgressUpdate,
  dates,
  onDatesUpdate,
  review,
  onReviewSave,
  onReviewDelete,
  notes = [],
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
  customTags = [],
  onTagAdd,
  onTagRemove,
  tagSuggestions = [],
}: EnhancedDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'review' | 'progress' | 'notes' | 'tags'>('details');
  const [editingReview, setEditingReview] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [showNoteEditor, setShowNoteEditor] = useState(false);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!item) return null;

  const isBook = type === 'book';
  const coverImage = isBook ? (item as Book).coverImage : (item as TVShow).posterImage;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-75 transition-opacity" onClick={onClose} />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              <div className="flex-shrink-0">
                <div className="relative w-full md:w-48 aspect-[2/3] bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
                  {coverImage ? (
                    <Image src={coverImage} alt={item.title} fill className="object-contain" sizes="192px" />
                  ) : (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <svg className="w-16 h-16" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">{item.title}</h2>
                
                {isBook && (item as Book).authors.length > 0 && (
                  <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">
                    by {(item as Book).authors.join(', ')}
                  </p>
                )}

                {isInList && (
                  <div className="space-y-3 mb-4">
                    {onRatingChange && (
                      <div>
                        <StarRating
                          rating={rating}
                          onRatingChange={onRatingChange}
                          size="md"
                          showLabel={true}
                        />
                      </div>
                    )}
                    {onStatusChange && (
                      <div>
                        <StatusSelector
                          type={type}
                          currentStatus={status}
                          onStatusChange={onStatusChange}
                          size="md"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 mb-6">
              {['details', 'review', 'progress', 'notes', 'tags'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                    activeTab === tab
                      ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'details' && (
                <div className="space-y-4">
                  {item.genres.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {item.genres.map(genre => (
                          <span key={genre} className={`px-3 py-1 text-sm rounded ${isBook ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'}`}>
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {item.description && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</h3>
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {item.description.replace(/<[^>]*>/g, '')}
                      </p>
                    </div>
                  )}

                  {!isBook && (item as TVShow).platforms && (item as TVShow).platforms!.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Watch on</h3>
                      <div className="flex flex-wrap gap-2">
                        {(item as TVShow).platforms!.map(platform => (
                          <a
                            key={platform.name}
                            href={platform.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600"
                          >
                            {platform.name}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'review' && (
                <div className="space-y-4">
                  {editingReview || !review ? (
                    onReviewSave && (
                      <ReviewEditor
                        review={review}
                        onSave={(reviewData) => {
                          onReviewSave(reviewData);
                          setEditingReview(false);
                        }}
                        onCancel={() => {
                          setEditingReview(false);
                          if (!review) onClose();
                        }}
                      />
                    )
                  ) : (
                    <div>
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Your Review</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => setEditingReview(true)}
                            className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                          >
                            Edit
                          </button>
                          {onReviewDelete && (
                            <button
                              onClick={() => {
                                if (confirm('Delete this review?')) {
                                  onReviewDelete();
                                }
                              }}
                              className="text-sm text-red-600 dark:text-red-400 hover:underline"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <ReviewCard review={review} showActions={false} />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'progress' && (
                <div className="space-y-6">
                  {onProgressUpdate && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Reading Progress</h3>
                      <ProgressTracker
                        item={item}
                        type={type}
                        currentProgress={progress}
                        onUpdate={onProgressUpdate}
                      />
                    </div>
                  )}

                  {onDatesUpdate && (
                    <div className="grid grid-cols-2 gap-4">
                      <DatePicker
                        label="Start Date"
                        value={dates?.startDate}
                        onChange={(timestamp) => onDatesUpdate?.({ ...dates, startDate: timestamp })}
                        maxDate={dates?.finishDate ? new Date(dates.finishDate) : undefined}
                      />
                      <DatePicker
                        label="Finish Date"
                        value={dates?.finishDate}
                        onChange={(timestamp) => onDatesUpdate?.({ ...dates, finishDate: timestamp })}
                        minDate={dates?.startDate ? new Date(dates.startDate) : undefined}
                      />
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'notes' && (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Notes</h3>
                    {onNoteAdd && (
                      <button
                        onClick={() => setShowNoteEditor(true)}
                        className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                      >
                        + Add Note
                      </button>
                    )}
                  </div>

                  {showNoteEditor && onNoteAdd && (
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                      <NoteEditor
                        type={type}
                        note={editingNote || undefined}
                        onSave={(noteData) => {
                          if (editingNote && onNoteUpdate) {
                            onNoteUpdate(editingNote.id, noteData);
                            setEditingNote(null);
                          } else if (onNoteAdd) {
                            onNoteAdd(noteData);
                          }
                          setShowNoteEditor(false);
                        }}
                        onCancel={() => {
                          setShowNoteEditor(false);
                          setEditingNote(null);
                        }}
                      />
                    </div>
                  )}

                  {notes.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No notes yet. Add one to get started!
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {notes.map(note => (
                        <div key={note.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {note.pageNumber && `Page ${note.pageNumber}`}
                              {note.seasonNumber && note.episodeNumber && `S${note.seasonNumber}E${note.episodeNumber}`}
                              {note.isQuote && <span className="ml-2 text-blue-600 dark:text-blue-400">Quote</span>}
                            </div>
                            <div className="flex gap-2">
                              {onNoteUpdate && (
                                <button
                                  onClick={() => {
                                    setEditingNote(note);
                                    setShowNoteEditor(true);
                                  }}
                                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                >
                                  Edit
                                </button>
                              )}
                              {onNoteDelete && (
                                <button
                                  onClick={() => onNoteDelete(note.id)}
                                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                          </div>
                          <p className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{note.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'tags' && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
                  {onTagAdd && onTagRemove && (
                    <TagManager
                      tags={customTags}
                      onAddTag={onTagAdd}
                      onRemoveTag={onTagRemove}
                      suggestions={tagSuggestions}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

