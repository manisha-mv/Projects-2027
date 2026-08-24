// components/ui/Badge.jsx
import React from 'react';

import {
  RiCheckboxCircleLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiInformationLine,
  RiCheckDoubleLine
} from 'react-icons/ri';

const BADGE_ICONS = {
  success: <RiCheckboxCircleLine />,
  warning: <RiTimeLine />,
  error:   <RiErrorWarningLine />,
  info:    <RiInformationLine />,
  primary: <RiCheckDoubleLine />,
};

const Badge = ({ children, variant = 'neutral', dot, showIcon = true, className = '' }) => {
  return (
    <span className={`badge badge-${variant} ${className}`}>
      {dot && <span className={`badge-dot badge-dot-${variant}`} />}
      {showIcon && BADGE_ICONS[variant] && <span className="badge-icon">{BADGE_ICONS[variant]}</span>}
      {children}
    </span>
  );
};

export const StatusDot = ({ status = 'offline' }) => (
  <span className={`status-dot status-${status}`} />
);

export default Badge;
