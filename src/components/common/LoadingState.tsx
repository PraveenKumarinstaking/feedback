import React from 'react';

export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Loading evaluation data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] w-full p-8">
      <div className="relative w-12 h-12">
        <div className="w-12 h-12 rounded-full border-4 border-brand-200 border-t-brand-600 animate-spin"></div>
      </div>
      <p className="mt-4 text-sm font-medium text-gray-600">{message}</p>
    </div>
  );
};
