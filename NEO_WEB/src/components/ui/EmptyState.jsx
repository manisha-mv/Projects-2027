// components/ui/EmptyState.jsx
import React from 'react';
import { RiFileList3Line } from 'react-icons/ri';

const EmptyState = ({
  icon = <RiFileList3Line />,
  title = 'No data found',
  description = 'There is nothing to display here yet.',
  action,
  className = '',
}) => (
  <div className={`empty-state ${className}`}>
    <span className="empty-state-icon">{icon}</span>
    <p className="empty-state-title">{title}</p>
    {description && <p className="empty-state-desc">{description}</p>}
    {action && <div style={{ marginTop: '12px' }}>{action}</div>}
  </div>
);

export default EmptyState;
