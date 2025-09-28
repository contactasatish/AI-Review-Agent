import React, { useState, useMemo } from 'react';
import { Review, ReviewSource, ReviewStatus, Sentiment, Business } from '../types';
import ReviewCard from './ReviewCard';
import BatchActionBar from './BatchActionBar';

interface DashboardProps {
  reviews: Review[];
  businesses: Business[];
  onAnalyze: (id: number) => Promise<void>;
  onGenerate: (id: number) => Promise<void>;
  onApprove: (id: number) => void;
  onEdit: (id: number, newResponse: string) => void;
  onDiscard: (id: number) => void;
  onRetry: (id: number) => void;
}

const FilterButton: React.FC<{
  label: string;
  isActive: boolean;
  onClick: () => void;
  className?: string;
}> = ({ label, isActive, onClick, className = '' }) => (
  <button
    onClick={onClick}
    className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-brand-primary text-white shadow'
        : 'bg-brand-surface-light text-brand-text-secondary hover:bg-gray-600'
    } ${className}`}
  >
    {label}
  </button>
);

const Dashboard: React.FC<DashboardProps> = ({
  reviews,
  businesses,
  onAnalyze,
  onGenerate,
  onApprove,
  onEdit,
  onDiscard,
  onRetry,
}) => {
  const [selectedReviewIds, setSelectedReviewIds] = useState<Set<number>>(new Set());
  const [activeBusiness, setActiveBusiness] = useState<string | 'All'>('All');
  const [activeSource, setActiveSource] = useState<ReviewSource | 'All'>('All');
  const [activeRating, setActiveRating] = useState<number | 'All'>('All');
  const [activeSentiment, setActiveSentiment] = useState<Sentiment | 'All'>('All');

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
      const businessMatch = activeBusiness === 'All' || review.businessName === activeBusiness;
      const sourceMatch = activeSource === 'All' || review.source === activeSource;
      const ratingMatch = activeRating === 'All' || review.rating === activeRating;
      const sentimentMatch =
        activeSentiment === 'All' ||
        (review.analysis && review.analysis.sentiment === activeSentiment);
      return businessMatch && sourceMatch && ratingMatch && sentimentMatch;
    });
  }, [reviews, activeBusiness, activeSource, activeRating, activeSentiment]);

  const handleSelectReview = (id: number, isSelected: boolean) => {
    setSelectedReviewIds(prev => {
      const newSet = new Set(prev);
      if (isSelected) {
        newSet.add(id);
      } else {
        newSet.delete(id);
      }
      return newSet;
    });
  };

  const handleSelectAll = (isSelected: boolean) => {
    if (isSelected) {
      const selectableIds = filteredReviews
        .filter(r => [ReviewStatus.PendingAnalysis, ReviewStatus.PendingResponse].includes(r.status))
        .map(r => r.id);
      setSelectedReviewIds(new Set(selectableIds));
    } else {
      setSelectedReviewIds(new Set());
    }
  };

  const clearSelection = () => {
    setSelectedReviewIds(new Set());
  };

  const businessNames = ['All', ...businesses.map(b => b.name)];
  const reviewSources = ['All', ...Object.values(ReviewSource)];
  const starRatings = ['All', 5, 4, 3, 2, 1];
  const sentiments = ['All', Sentiment.Positive, Sentiment.Negative, Sentiment.Neutral];


  return (
    <div className="mt-2">
       <div className="bg-brand-surface border border-gray-700/50 rounded-lg p-4 mb-4 space-y-3">
        {/* Business Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm text-brand-text-secondary w-20">Business:</span>
          {businessNames.map(name => (
            <FilterButton key={name} label={name} isActive={activeBusiness === name} onClick={() => setActiveBusiness(name)} />
          ))}
        </div>
        <div className="border-t border-gray-700/50 my-3"></div>
        {/* Source Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm text-brand-text-secondary w-20">Source:</span>
          {reviewSources.map(source => (
            <FilterButton key={source} label={source} isActive={activeSource === source} onClick={() => setActiveSource(source as ReviewSource | 'All')} />
          ))}
        </div>
        {/* Rating Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm text-brand-text-secondary w-20">Rating:</span>
          {starRatings.map(rating => (
            <FilterButton key={rating} label={rating === 'All' ? 'All' : `${rating} ★`} isActive={activeRating === rating} onClick={() => setActiveRating(rating as number | 'All')} />
          ))}
        </div>
        {/* Sentiment Filter */}
        <div className="flex items-center flex-wrap gap-2">
          <span className="font-semibold text-sm text-brand-text-secondary w-20">Sentiment:</span>
           {sentiments.map(sentiment => (
            <FilterButton key={sentiment} label={sentiment} isActive={activeSentiment === sentiment} onClick={() => setActiveSentiment(sentiment as Sentiment | 'All')} />
          ))}
        </div>
      </div>

      <BatchActionBar
        reviews={filteredReviews}
        selectedReviewIds={Array.from(selectedReviewIds)}
        onAnalyzeSelected={onAnalyze}
        onGenerateSelected={onGenerate}
        onSelectAll={handleSelectAll}
        clearSelection={clearSelection}
      />
      <div className="space-y-4 mt-4">
        {filteredReviews.length > 0 ? (
          filteredReviews.map(review => (
            <ReviewCard
              key={review.id}
              review={review}
              isSelected={selectedReviewIds.has(review.id)}
              onSelect={handleSelectReview}
              onAnalyze={() => onAnalyze(review.id)}
              onGenerate={() => onGenerate(review.id)}
              onApprove={() => onApprove(review.id)}
              onEdit={(newResponse) => onEdit(review.id, newResponse)}
              onDiscard={() => onDiscard(review.id)}
              onRetry={() => onRetry(review.id)}
            />
          ))
        ) : (
          <div className="text-center py-16 bg-brand-surface rounded-lg border-2 border-dashed border-gray-700/50">
            <svg className="mx-auto h-12 w-12 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-4 text-lg font-semibold text-brand-text">No Reviews Found</h3>
            <p className="mt-1 text-sm text-brand-text-secondary">Try adjusting your filters to find what you're looking for.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;