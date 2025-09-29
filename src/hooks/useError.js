// src/hooks/useError.js
import { useContext } from 'react';
import ErrorProvider from '../components/ErrorBoundary';

export const useError = () => {
  const context = useContext(ErrorProvider);
  if (!context) {
    throw new Error('useError must be used within ErrorProvider');
  }
  return context;
};