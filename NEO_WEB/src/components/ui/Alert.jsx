// components/ui/Alert.jsx
import React from 'react';
import {
  RiCheckLine,
  RiErrorWarningLine,
  RiAlertLine,
  RiInformationLine,
  RiCloseLine,
} from 'react-icons/ri';

const ICONS = {
  success: <RiCheckLine size={16} />,
  error:   <RiErrorWarningLine size={16} />,
  warning: <RiAlertLine size={16} />,
  info:    <RiInformationLine size={16} />,
};

const Alert = ({ type = 'info', title, children, onClose, className = '' }) => (
  <div className={`alert alert-${type} ${className}`} role="alert">
    <span className="alert-icon">{ICONS[type]}</span>
    <div className="alert-content">
      {title && <div className="alert-title">{title}</div>}
      {children && <div>{children}</div>}
    </div>
    {onClose && (
      <button className="btn-icon btn-sm" onClick={onClose} aria-label="Close alert">
        <RiCloseLine size={15} />
      </button>
    )}
  </div>
);

export default Alert;
