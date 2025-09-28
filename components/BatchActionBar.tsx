import React from 'react';
import { Review, ReviewStatus } from '../types';

interface BatchActionBarProps {
  reviews: Review[]; // These are the filtered reviews
  selectedReviewIds: number[];
  onAnalyzeSelected: (id: number) => Promise<void>;
  onGenerateSelected: (id: number) => Promise<void>;
  onSelectAll: (isSelected: boolean) => void;
  clearSelection: () => void;
}

const BatchActionBar: React.FC<BatchActionBarProps> = ({
  reviews,
  selectedReviewIds,
  onAnalyzeSelected,
  onGenerateSelected,
  onSelectAll,
  clearSelection,
}) => {
  const selectableCount = reviews.filter(r => [ReviewStatus.PendingAnalysis, ReviewStatus.PendingResponse].includes(r.status)).length;
  const selectedCount = selectedReviewIds.length;
  
  const selectedReviews = reviews.filter(r => selectedReviewIds.includes(r.id));
  const canAnalyzeAny = selectedReviews.some(r => r.status === ReviewStatus.PendingAnalysis);
  const canGenerateAny = selectedReviews.some(r => r.status === ReviewStatus.PendingResponse);
  const numToAnalyze = selectedReviews.filter(r => r.status === ReviewStatus.PendingAnalysis).length;
  const numToGenerate = selectedReviews.filter(r => r.status === ReviewStatus.PendingResponse).length;


  const handleAnalyze = async () => {
    for (const id of selectedReviewIds) {
      const review = reviews.find(r => r.id === id);
      if (review && review.status === ReviewStatus.PendingAnalysis) {
        await onAnalyzeSelected(id);
      }
    }
    clearSelection();
  };
  
  const handleGenerate = async () => {
    for (const id of selectedReviewIds) {
      const review = reviews.find(r => r.id === id);
      if (review && review.status === ReviewStatus.PendingResponse) {
        await onGenerateSelected(id);
      }
    }
    clearSelection();
  };
  
  const isAllSelected = selectableCount > 0 && selectedCount === selectableCount;

  return (
    <div className="bg-brand-surface border border-gray-700/50 rounded-lg p-3 transition-all duration-300">
        <div className="flex items-center justify-between min-h-[38px]">
            <div className="flex items-center space-x-4">
                <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 text-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-primary focus:ring-2"
                    aria-label="Select all actionable reviews"
                    disabled={selectableCount === 0}
                />
                {selectedCount > 0 ? (
                    <>
                        <p className="text-sm font-medium text-brand-text">
                            {selectedCount} item(s) selected
                        </p>
                        <button onClick={clearSelection} className="text-sm text-brand-primary hover:underline">
                            Clear selection
                        </button>
                    </>
                ) : (
                    <p className="text-sm text-brand-text-secondary">
                        {selectableCount > 0 ? `${selectableCount} items need action. Select items or "Select All".` : "No actions pending for current filters."}
                    </p>
                )}
            </div>
            {selectedCount > 0 && (
                <div className="flex items-center space-x-3">
                    <button
                        onClick={handleAnalyze}
                        className="px-4 py-2 text-sm font-semibold text-white bg-brand-primary rounded-lg hover:bg-indigo-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canAnalyzeAny}
                    >
                        Analyze Selected ({numToAnalyze})
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!canGenerateAny}
                    >
                        Generate Selected ({numToGenerate})
                    </button>
                </div>
            )}
        </div>
    </div>
  );
};

export default BatchActionBar;
