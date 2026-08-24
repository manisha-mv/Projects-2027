// components/ui/Button.jsx
import React from 'react';

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  iconRight,
  disabled = false,
  loading = false,
  onClick,
  type = 'button',
  className = '',
  ...rest
}) => {
  const variantClass = `btn-${variant}`;
  const sizeClass = size === 'sm' ? 'btn-sm' : size === 'lg' ? 'btn-lg' : '';

  return (
    <button
      type={type}
      className={`btn ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      onClick={onClick}
      {...rest}
    >
      {loading && <span className="spinner spinner-sm" />}
      {!loading && icon && <span className="btn-icon-left">{icon}</span>}
      {children}
      {!loading && iconRight && <span className="btn-icon-right">{iconRight}</span>}
    </button>
  );
};

export const IconButton = ({ icon, size = 'md', variant = 'ghost', tooltip, className = '', ...rest }) => (
  <button
    className={`btn-icon ${size === 'sm' ? 'btn-sm' : ''} ${variant === 'ghost' ? '' : `btn-${variant}`} ${className}`}
    title={tooltip}
    {...rest}
  >
    {icon}
  </button>
);

export default Button;
