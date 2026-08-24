// components/ui/Tabs.jsx
import React from 'react';

const Tabs = ({ tabs = [], active, onChange, className = '' }) => (
  <div className={`tabs ${className}`} role="tablist">
    {tabs.map(tab => (
      <button
        key={tab.id}
        id={`tab-${tab.id}`}
        role="tab"
        aria-selected={active === tab.id}
        className={`tab-item ${active === tab.id ? 'active' : ''}`}
        onClick={() => onChange(tab.id)}
      >
        {tab.icon && <span style={{ marginRight: '6px' }}>{tab.icon}</span>}
        {tab.label}
        {tab.count !== undefined && (
          <span style={{
            marginLeft: '6px',
            fontSize: '11px',
            background: active === tab.id ? 'var(--color-primary-light)' : 'var(--color-bg)',
            color: active === tab.id ? 'var(--color-primary)' : 'var(--color-text-muted)',
            borderRadius: '10px',
            padding: '1px 6px',
          }}>
            {tab.count}
          </span>
        )}
      </button>
    ))}
  </div>
);

export default Tabs;
