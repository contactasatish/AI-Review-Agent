import React, { useState } from 'react';
import { Business } from '../types';
import Loader from './Loader';

interface AdminProps {
  businesses: Business[];
  onAddBusiness: (name: string) => Promise<void>;
  isFetching: boolean;
}

const Admin: React.FC<AdminProps> = ({ businesses, onAddBusiness, isFetching }) => {
  const [businessName, setBusinessName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (businessName.trim()) {
      onAddBusiness(businessName.trim());
      setBusinessName('');
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-2">
      <div className="bg-brand-surface border border-gray-700/50 rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Manage Businesses</h2>
        <p className="text-brand-text-secondary mb-6">
          Add a business name to begin tracking and sourcing its reviews from various platforms.
        </p>
        
        <form onSubmit={handleSubmit} className="flex items-center space-x-3">
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Enter business name"
            className="flex-grow bg-brand-surface-light border border-gray-600 rounded-md p-2.5 text-brand-text focus:ring-2 focus:ring-brand-primary focus:border-brand-primary outline-none transition"
            required
          />
          <button
            type="submit"
            disabled={isFetching}
            className="px-5 py-2.5 bg-brand-primary text-white font-semibold rounded-lg hover:bg-indigo-500 transition duration-200 disabled:opacity-50 disabled:cursor-wait"
          >
            {isFetching ? 'Fetching...' : 'Add Business'}
          </button>
        </form>
        {isFetching && (
            <div className="mt-4 flex justify-center">
                <div className="flex flex-col items-center space-y-2">
                    <Loader />
                    <p className="text-sm text-brand-text-secondary">Simulating review scraping for "{businesses[businesses.length - 1]?.name}"...</p>
                </div>
            </div>
        )}
      </div>

      <div className="mt-8 bg-brand-surface border border-gray-700/50 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Tracked Businesses</h3>
          {businesses.length > 0 ? (
            <ul className="space-y-3">
              {businesses.map(business => (
                <li key={business.id} className="p-3 bg-brand-surface-light rounded-md border border-gray-700">
                  {business.name}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-brand-text-secondary">No businesses are being tracked yet.</p>
          )}
      </div>
    </div>
  );
};

export default Admin;