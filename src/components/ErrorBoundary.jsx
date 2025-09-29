// src/components/ErrorBoundary.jsx
import React, { useState, createContext, useContext } from 'react';

const ErrorContext = createContext();

const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};

const ErrorProvider = ({ children }) => {
  const [error, setError] = useState(null);

  const showError = (message) => {
    setError(message);
    // Auto-hide after 5 seconds
    setTimeout(() => setError(null), 5000);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ showError, clearError, useError }}>
      {children}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-4 rounded-lg shadow-lg z-50 max-w-md">
          <div className="flex justify-between items-start">
            <div>
              <div className="font-semibold">Connection Error</div>
              <div className="text-sm mt-1">{error}</div>
            </div>
            <button
              onClick={clearError}
              className="ml-4 text-white hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </ErrorContext.Provider>
  );
};

export default ErrorProvider;