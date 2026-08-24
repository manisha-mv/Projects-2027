// components/ui/Table.jsx
import React from 'react';
import EmptyState from './EmptyState';

const Table = ({
  columns = [],
  rows = [],
  loading = false,
  emptyTitle = 'No records found',
  emptyDescription = 'There is no data to display right now.',
  className = '',
  onRowClick,
  compact = false,
  striped = false,
}) => (
  <div className={`table-wrap ${compact ? 'table-wrap-compact' : ''} ${className}`}>
    <table className={`table ${striped ? 'table-striped' : ''}`} role="table">
      <thead>
        <tr>
          {columns.map((col) => (
            <th
              key={col.key}
              style={{ width: col.width, textAlign: col.align || 'left' }}
              className={col.headerClassName || ''}
            >
              {col.label}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: 5 }).map((_, idx) => (
            <tr key={`skeleton-${idx}`} className="table-row-skeleton">
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  <div className="skeleton-line" style={{ width: col.width ? '70%' : '85%', height: 16 }} />
                </td>
              ))}
            </tr>
          ))
        ) : rows.length === 0 ? (
          <tr>
            <td colSpan={columns.length} style={{ padding: '36px 16px' }}>
              <EmptyState title={emptyTitle} description={emptyDescription} />
            </td>
          </tr>
        ) : (
          rows.map((row, i) => (
            <tr
              key={row.id ?? row.key ?? i}
              onClick={() => onRowClick && onRowClick(row)}
              className={onRowClick ? 'clickable-row' : ''}
            >
              {columns.map((col) => (
                <td key={col.key} style={{ textAlign: col.align || 'left' }}>
                  {col.render ? col.render(row[col.key], row) : (row[col.key] ?? '—')}
                </td>
              ))}
            </tr>
          ))
        )}
      </tbody>
    </table>
  </div>
);

export default Table;
