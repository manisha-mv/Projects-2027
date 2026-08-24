// components/ui/ErrorState.jsx
import React from 'react';
import { RiErrorWarningLine } from 'react-icons/ri';
import Button from './Button';

const ErrorState = ({
  icon = <RiErrorWarningLine />,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  onRetry,
  className = '',
}) => (
  <div className={`error-state ${className}`}>
    <span className="error-state-icon" style={{ color: 'var(--color-error)' }}>{icon}</span>
    <p className="error-state-title">{title}</p>
    {description && <p className="error-state-desc">{description}</p>}
    {onRetry && (
      <div style={{ marginTop: '12px' }}>
        <Button variant="outline" onClick={onRetry}>Try Again</Button>
      </div>
    )}
  </div>
);

export default ErrorState;
