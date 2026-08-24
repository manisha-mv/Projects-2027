// components/ui/Avatar.jsx
import React from 'react';
import { getInitials } from '../../utils/helpers';

const Avatar = ({ name = '', size = 'md', src, className = '' }) => {
  const sizeClass = size === 'sm' ? 'avatar-sm' : size === 'lg' ? 'avatar-lg' : size === 'xl' ? 'avatar-xl' : '';
  const initials = getInitials(name);

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`avatar ${sizeClass} ${className}`}
        style={{ objectFit: 'cover' }}
      />
    );
  }

  return (
    <span className={`avatar ${sizeClass} ${className}`} aria-label={name}>
      {initials}
    </span>
  );
};

export default Avatar;
