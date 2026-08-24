import React from 'react';
import Breadcrumb from '../../layouts/Breadcrumb';

const PageHeader = ({
  title,
  description,
  primaryAction,
  secondaryAction,
  stats = [],
  showBreadcrumb = true,
}) => {
  return (
    <div className="page-header" style={{ marginBottom: 'var(--space-5)' }}>
      <div className="page-header-left">
        {showBreadcrumb && <Breadcrumb />}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <h1 className="page-header-title">{title}</h1>
          {stats.map((stat, idx) => (
            <span key={idx} className={`badge badge-${stat.variant || 'primary'}`} style={{ fontSize: '12px', fontWeight: 600 }}>
              {stat.label}: <strong>{stat.value}</strong>
            </span>
          ))}
        </div>
        {description && <p className="page-header-subtitle">{description}</p>}
      </div>
      <div className="page-header-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {secondaryAction}
        {primaryAction}
      </div>
    </div>
  );
};

export default PageHeader;
