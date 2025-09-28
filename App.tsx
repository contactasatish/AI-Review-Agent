import React, { useState, useEffect, useCallback } from 'react';
import { Review, ReviewStatus, Business, AnalysisResult } from './types';
import * as sheetService from './services/googleSheetsApiService';
import { SPREADSHEET_ID } from './services/googleSheetsApiService'; // Import the ID for debugging
import { analyzeReview, generateResponse } from './services/geminiService';
import Dashboard from './components/Dashboard';
import Header from './components/Header';
import Admin from './components/Admin';
import Loader from './components/Loader';

const App: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [route, setRoute] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Load data from Google Sheet on initial render
  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { reviews, businesses } = await sheetService.fetchData();
      setReviews(reviews);
      setBusinesses(businesses);
    } catch (error) {
        if (error instanceof Error) {
            setErrorMessage(error.message);
        } else {
            setErrorMessage("An unknown error occurred.");
        }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const updateReviewState = useCallback((id: number, updates: Partial<Review>) => {
    setReviews(prevReviews =>
      prevReviews.map(review =>
        review.id === id ? { ...review, ...updates } : review
      )
    );
  }, []);
  
  const updateAndSyncReview = async (id: number, updates: Partial<Review>) => {
      const originalReview = reviews.find(r => r.id === id);
      if (!originalReview || typeof originalReview.rowIndex === 'undefined') {
          console.error("Cannot update review without a rowIndex.");
          return;
      }

      // Optimistically update the UI
      updateReviewState(id, updates);

      try {
          await sheetService.updateReviewInSheet(originalReview.rowIndex, updates);
      } catch (error) {
          console.error("Sync failed:", error);
          alert("Failed to sync update with the backend. The change is being reverted.");
          
          const revertPayload: Partial<Review> = {};
          for (const key of Object.keys(updates)) {
              (revertPayload as any)[key] = originalReview[key as keyof Review];
          }
          
          updateReviewState(id, revertPayload);
      }
  };


  const handleAnalyze = useCallback(async (id: number) => {
    const reviewToAnalyze = reviews.find(r => r.id === id);
    if (!reviewToAnalyze) return;

    updateReviewState(id, { status: ReviewStatus.Analyzing, errorMessage: '' });
    try {
      const analysis = await analyzeReview(reviewToAnalyze.text);
      await updateAndSyncReview(id, { status: ReviewStatus.PendingResponse, analysis });
    } catch (error) {
      console.error(error);
      await updateAndSyncReview(id, {
        status: ReviewStatus.Error,
        errorMessage: 'Failed to analyze review.',
      });
    }
  }, [reviews, updateReviewState, updateAndSyncReview]);

  const handleGenerate = useCallback(async (id: number) => {
    const reviewToGenerate = reviews.find(r => r.id === id);
    if (!reviewToGenerate || !reviewToGenerate.analysis) return;

    updateReviewState(id, { status: ReviewStatus.Generating, errorMessage: '' });
    try {
      const response = await generateResponse(reviewToGenerate, reviewToGenerate.analysis);
      await updateAndSyncReview(id, { status: ReviewStatus.PendingApproval, response });
    } catch (error) {
      console.error(error);
      await updateAndSyncReview(id, {
        status: ReviewStatus.Error,
        errorMessage: 'Failed to generate response.',
      });
    }
  }, [reviews, updateReviewState, updateAndSyncReview]);

  const handleApprove = useCallback((id: number) => {
    updateAndSyncReview(id, { status: ReviewStatus.Approved });
  }, [updateAndSyncReview]);

  const handleEdit = useCallback((id: number, newResponse: string) => {
    updateAndSyncReview(id, { response: newResponse });
  }, [updateAndSyncReview]);
  
  const handleDiscard = useCallback((id: number) => {
    updateAndSyncReview(id, { status: ReviewStatus.PendingResponse, response: '' });
  }, [updateAndSyncReview]);
  
  const handleRetry = useCallback((id: number) => {
      const reviewToRetry = reviews.find(r => r.id === id);
      if (!reviewToRetry) return;

      // If there's no analysis, the failed step was analysis.
      if (!reviewToRetry.analysis) {
          handleAnalyze(id);
      } 
      // Otherwise, the failed step was generation.
      else {
          handleGenerate(id);
      }
  }, [reviews, handleAnalyze, handleGenerate]);

  const handleAddBusiness = async (businessName: string) => {
    if (businesses.some(b => b.name.toLowerCase() === businessName.toLowerCase())) {
        alert("Business with this name already exists.");
        return;
    }
    
    setIsSyncing(true);
    try {
        const allData = { reviews, businesses };
        const { newBusiness, newReviews } = await sheetService.addBusinessAndScrape(businessName, allData);
        setBusinesses(prev => [...prev, newBusiness]);
        setReviews(prev => [...prev, ...newReviews]);
    } catch (error) {
        alert("Failed to add new business.");
        console.error(error);
    } finally {
        setIsSyncing(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center pt-24">
            <Loader />
            <p className="mt-4 text-brand-text-secondary">Loading data from Google Sheets...</p>
        </div>
      );
    }
    
    if (errorMessage) {
      const apiKey = process.env.API_KEY || "Not Found";
      const truncatedApiKey = apiKey.length > 8 ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : apiKey;

      return (
        <div className="text-center py-10 px-4 sm:px-6 lg:px-8 bg-brand-surface rounded-lg border-2 border-dashed border-red-500/50 text-red-300">
             <h3 className="mt-2 text-2xl font-bold">Connection Error</h3>
             <p className="mt-2 text-md">{errorMessage}</p>
             <p className="mt-4 text-sm text-gray-400">This error comes directly from Google's servers. Please use the information below to verify your setup.</p>
             
             <div className="mt-6 text-left bg-brand-surface-light/50 border border-gray-600 rounded-lg p-4 max-w-lg mx-auto">
                 <h4 className="font-semibold text-lg text-white mb-3">Debugging Information</h4>
                 <div className="space-y-2 text-sm">
                     <div className="flex justify-between items-center">
                         <span className="text-gray-400 font-medium">Spreadsheet ID Used:</span>
                         <code className="text-yellow-300 bg-gray-900 px-2 py-1 rounded">{SPREADSHEET_ID}</code>
                     </div>
                     <div className="flex justify-between items-center">
                         <span className="text-gray-400 font-medium">API Key Used:</span>
                         <code className="text-yellow-300 bg-gray-900 px-2 py-1 rounded">{truncatedApiKey}</code>
                     </div>
                 </div>
             </div>

              <p className="mt-6 text-xs text-gray-500">Please confirm your API Key is enabled for the 'Google Sheets API' and your spreadsheet is shared with 'Anyone with the link'.</p>
        </div>
      );
    }

    if (route === '#/admin') {
      return <Admin businesses={businesses} onAddBusiness={handleAddBusiness} isFetching={isSyncing} />;
    } else {
      return (
        <Dashboard
          reviews={reviews}
          businesses={businesses}
          onAnalyze={handleAnalyze}
          onGenerate={handleGenerate}
          onApprove={handleApprove}
          onEdit={handleEdit}
          onDiscard={handleDiscard}
          onRetry={handleRetry}
        />
      );
    }
  };

  return (
    <div className="bg-brand-background min-h-screen font-sans text-brand-text">
      <main className="container mx-auto p-4 sm:p-6 md:p-8">
        <Header activeRoute={route} />
        {renderContent()}
      </main>
      <style>{`
        :root {
          --brand-background: #111827;
          --brand-surface: #1f2937;
          --brand-primary: #6366f1;
          --brand-secondary: #a78bfa;
          --brand-text: #f9fafb;
          --brand-text-secondary: #9ca3af;
        }
        body { background-color: var(--brand-background); }
      `}</style>
    </div>
  );
};

export default App;