import React, { useState } from 'react';
import { Review, ReviewSource, ReviewStatus, Sentiment } from '../types';
import Loader from './Loader';
import Modal from './Modal';

// Simple Icon Components to avoid new dependencies
const IconWrapper: React.FC<{ children: React.ReactNode, className?: string }> = ({ children, className }) => (
    <div className={`w-5 h-5 ${className}`}>{children}</div>
);
const ThumbsUpIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M18 10h-5.41l.94-4.69a2 2 0 0 0-3.82-1.42l-2.7 7.11V22h10a2 2 0 0 0 2-1.87l1-7.22a2 2 0 0 0-2-2.13z"/></svg>;
const ThumbsDownIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14V2"/><path d="M6 14H.59l-.94 4.69a2 2 0 0 0 3.82 1.42l2.7-7.11V2H2a2 2 0 0 0-2 1.87l-1 7.22a2 2 0 0 0 2 2.13z"/></svg>;
const MehIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="8" y1="15" x2="16" y2="15"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>;
const CheckCircleIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>;
const EditIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>;
const Trash2Icon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>;
const CornerUpRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 14 20 9 15 4"/><path d="M4 20v-7a4 4 0 0 1 4-4h12"/></svg>;
const CpuIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="4" width="16" height="16" rx="2" ry="2"/><rect x="9" y="9" width="6" height="6"/><line x1="9" y1="1" x2="9" y2="4"/><line x1="15" y1="1" x2="15" y2="4"/><line x1="9" y1="20" x2="9" y2="23"/><line x1="15" y1="20" x2="15" y2="23"/><line x1="20" y1="9" x2="23" y2="9"/><line x1="20" y1="14" x2="23" y2="14"/><line x1="1" y1="9" x2="4" y2="9"/><line x1="1" y1="14" x2="4" y2="14"/></svg>;
const RefreshCwIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L20.49 10M3.51 14l-2.02 4.64A9 9 0 0 0 9.51 22.49"/></svg>;
const StarIcon = ({ filled }: { filled: boolean }) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400 w-5 h-5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;


interface ReviewCardProps {
  review: Review;
  isSelected: boolean;
  onSelect: (id: number, isSelected: boolean) => void;
  onAnalyze: () => Promise<void>;
  onGenerate: () => Promise<void>;
  onApprove: () => void;
  onEdit: (newResponse: string) => void;
  onDiscard: () => void;
  onRetry: () => void;
}

const SourceIcon: React.FC<{ source: ReviewSource }> = ({ source }) => {
  const iconProps = {
    className: "w-4 h-4 text-white",
    'aria-hidden': true,
  };
  switch (source) {
    case ReviewSource.Google:
      return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.76,4.73 16.04,5.7 17.09,6.62L19.27,4.59C17.22,2.67 14.86,1.5 12.19,1.5C7.22,1.5 3.31,5.33 3.31,12C3.31,18.67 7.22,22.5 12.19,22.5C17.09,22.5 21.5,18.88 21.5,12.23C21.5,11.64 21.45,11.37 21.35,11.1Z" /></svg>;
    case ReviewSource.Facebook:
      return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M17,2V2H17V6H15C14.31,6 14,6.81 14,7.5V10H17L16,14H14V22H9V14H7V10H9V6A4,4 0 0,1 13,2H17Z" /></svg>;
    case ReviewSource.Yelp:
      return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.3L14.12 8.7L21 9.77L16.25 14.23L17.5 20.9L12 17.5L6.5 20.9L7.75 14.23L3 9.77L9.88 8.7L12 2.3Z" /></svg>;
    case ReviewSource.AppStore:
      return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12,5.25L14.5,10.25L17,5.25L19.5,10.25L22,5.25L19.5,18.75H17L14.5,9L12,18.75H9.5L7,9L4.5,18.75H2L4.5,10.25L7,5.25L9.5,10.25L12,5.25Z" /></svg>;
    case ReviewSource.Trustpilot:
      return <svg {...iconProps} viewBox="0 0 24 24" fill="currentColor"><path d="M12,17.27L18.18,21L17,14.64L22,9.73L15.45,8.5L12,2.5L8.55,8.5L2,9.73L7,14.64L5.82,21L12,17.27Z" /></svg>;
    default:
      return null;
  }
};

const SourcePill: React.FC<{ source: ReviewSource }> = ({ source }) => {
  const sourceInfo = {
    [ReviewSource.Google]: { bgColor: 'bg-red-500' },
    [ReviewSource.Facebook]: { bgColor: 'bg-blue-600' },
    [ReviewSource.Yelp]: { bgColor: 'bg-red-600' },
    [ReviewSource.AppStore]: { bgColor: 'bg-blue-400' },
    [ReviewSource.Trustpilot]: { bgColor: 'bg-green-500' },
  };

  return (
    <div className={`inline-flex items-center space-x-1.5 px-2 py-1 text-xs font-bold text-white rounded ${sourceInfo[source].bgColor}`}>
      <SourceIcon source={source} />
      <span>{source}</span>
    </div>
  );
};

const sentimentIcons: { [key in Sentiment]: React.ReactNode } = {
    [Sentiment.Positive]: <IconWrapper className="text-green-400"><ThumbsUpIcon /></IconWrapper>,
    [Sentiment.Negative]: <IconWrapper className="text-red-400"><ThumbsDownIcon /></IconWrapper>,
    [Sentiment.Neutral]: <IconWrapper className="text-gray-400"><MehIcon /></IconWrapper>,
    [Sentiment.Unknown]: <IconWrapper className="text-gray-500"><MehIcon /></IconWrapper>,
};

const ReviewCard: React.FC<ReviewCardProps> = ({
  review,
  isSelected,
  onSelect,
  onAnalyze,
  onGenerate,
  onApprove,
  onEdit,
  onDiscard,
  onRetry,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleSaveEdit = (newText: string) => {
    onEdit(newText);
    setIsEditModalOpen(false);
  };
  
  const canBeSelected = [ReviewStatus.PendingAnalysis, ReviewStatus.PendingResponse].includes(review.status);

  const renderStatusPill = () => {
    switch (review.status) {
      case ReviewStatus.Approved:
        return <span className="text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-green-100 text-green-800">Approved</span>;
      case ReviewStatus.Error:
        return <span className="text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-red-100 text-red-800">Error</span>;
      default:
        return <span className="text-xs font-semibold inline-flex items-center px-2.5 py-0.5 rounded-full bg-yellow-100 text-yellow-800">Needs Action</span>;
    }
  };

  const renderActions = () => {
    switch (review.status) {
      case ReviewStatus.PendingAnalysis:
        return (
          <button onClick={onAnalyze} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-center text-white bg-brand-primary rounded-lg hover:bg-indigo-500 focus:ring-4 focus:outline-none focus:ring-indigo-300 transition">
            <IconWrapper><CpuIcon/></IconWrapper>
            <span>Analyze</span>
          </button>
        );
      case ReviewStatus.Analyzing:
      case ReviewStatus.Generating:
        return <Loader />;
      case ReviewStatus.PendingResponse:
        return (
           <button onClick={onGenerate} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-center text-white bg-brand-primary rounded-lg hover:bg-indigo-500 focus:ring-4 focus:outline-none focus:ring-indigo-300 transition">
            <IconWrapper><CornerUpRightIcon /></IconWrapper>
            <span>Generate Response</span>
          </button>
        );
      case ReviewStatus.PendingApproval:
        return (
          <div className="flex items-center space-x-2">
            <button onClick={onApprove} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-center text-white bg-green-600 rounded-lg hover:bg-green-700 transition">
                <IconWrapper><CheckCircleIcon /></IconWrapper>
                <span>Approve</span>
            </button>
            <button onClick={() => setIsEditModalOpen(true)} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-center text-gray-900 bg-white rounded-lg border border-gray-300 hover:bg-gray-100 transition">
                <IconWrapper><EditIcon/></IconWrapper>
                <span>Edit</span>
            </button>
            <button onClick={onDiscard} className="flex items-center space-x-2 p-2 text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition">
                <IconWrapper><Trash2Icon /></IconWrapper>
            </button>
          </div>
        );
      case ReviewStatus.Error:
        return (
           <button onClick={onRetry} className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-center text-white bg-yellow-500 rounded-lg hover:bg-yellow-600 focus:ring-4 focus:outline-none focus:ring-yellow-300 transition">
            <IconWrapper><RefreshCwIcon /></IconWrapper>
            <span>Retry</span>
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className={`bg-brand-surface rounded-lg shadow-md border border-gray-700/50 p-5 transition-all duration-300 hover:shadow-lg hover:border-gray-600 ${isSelected ? 'border-brand-primary' : ''}`}>
        <div className="flex items-start space-x-4">
            <div className="flex items-center h-5 pt-1">
                <input
                    id={`review-${review.id}`}
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => onSelect(review.id, e.target.checked)}
                    className={`w-4 h-4 text-brand-primary bg-gray-700 border-gray-600 rounded focus:ring-brand-primary focus:ring-2 transition-opacity ${canBeSelected ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                    disabled={!canBeSelected}
                />
            </div>
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3 flex-wrap">
                <SourcePill source={review.source} />
                <span className="font-bold text-lg text-brand-text">{review.author}</span>
                {review.businessName && <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-gray-600 text-gray-300">{review.businessName}</span>}
                <div className="flex items-center">
                    {[...Array(5)].map((_, i) => <StarIcon key={i} filled={i < review.rating} />)}
                </div>
              </div>
              <div className="text-sm text-brand-text-secondary flex-shrink-0 ml-4">{review.date}</div>
            </div>

            <p className="mt-3 text-brand-text-secondary">{review.text}</p>

            {review.analysis && (
              <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        {sentimentIcons[review.analysis.sentiment]}
                        <span className="font-semibold text-brand-text">{review.analysis.sentiment}</span>
                    </div>
                    <div className="border-l border-gray-600 h-5"></div>
                    <div className="flex items-center space-x-2">
                        <span className="text-sm text-brand-text-secondary">Intent:</span>
                        <span className="text-sm font-medium text-brand-text">{review.analysis.intent}</span>
                    </div>
                </div>
              </div>
            )}
            
            {review.response && (
                <div className="mt-4 p-4 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                    <p className="text-sm font-semibold text-indigo-300 mb-2">Generated Response:</p>
                    <p className="text-brand-text-secondary italic">"{review.response}"</p>
                </div>
            )}

            {review.errorMessage && (
                <div className="mt-4 p-3 bg-red-900/30 rounded-lg border border-red-500/40 text-red-300 text-sm">
                    <strong>Error:</strong> {review.errorMessage}
                </div>
            )}

            <div className="mt-4 flex justify-between items-center">
                {renderStatusPill()}
                <div className="flex-shrink-0">{renderActions()}</div>
            </div>
          </div>
        </div>
      </div>
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSaveEdit}
        initialText={review.response || ''}
      />
    </>
  );
};

export default ReviewCard;