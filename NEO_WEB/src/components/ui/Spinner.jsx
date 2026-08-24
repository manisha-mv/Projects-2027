// components/ui/Spinner.jsx
import React from 'react';

export const Spinner = ({ size = 'md' }) => (
  <span className={`spinner ${size === 'sm' ? 'spinner-sm' : size === 'lg' ? 'spinner-lg' : ''}`} aria-label="Loading" />
);

export const LoadingState = ({ text = 'Loading...' }) => (
  <div className="loading-overlay">
    <Spinner size="lg" />
    <p className="loading-text">{text}</p>
  </div>
);

export default Spinner;
