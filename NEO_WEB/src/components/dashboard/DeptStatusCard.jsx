// components/dashboard/DeptStatusCard.jsx
import React from 'react';

/**
 * Department status card showing bed occupancy, count, status, and on-call doctor.
 * Props: name, patients, occupancy, beds, available, onCall, status ('normal'|'warning'|'critical')
 */
const DeptStatusCard = ({ name, patients, occupancy, beds, available, onCall, status }) => {
  const fillColor =
    status === 'critical' ? 'var(--color-error)' :
    occupancy >= 85       ? 'var(--color-error)' :
    occupancy >= 70       ? 'var(--color-warning)' :
                            'var(--color-primary)';

  const statusBadgeClass =
    status === 'critical' ? 'dept-status-badge dept-badge-critical' :
    status === 'warning'  ? 'dept-status-badge dept-badge-warning' :
                            'dept-status-badge dept-badge-normal';

  return (
    <div className={`dept-status-card ${status === 'warning' ? 'dept-card-warning' : ''}`}>
      <div className="dept-card-header">
        <div className="dept-card-name">{name}</div>
        <div className={statusBadgeClass}>
          {status === 'warning' ? 'Near Full' : `${occupancy}%`}
        </div>
      </div>

      {/* Occupancy bar */}
      <div className="dept-occupancy-bar">
        <div
          className="dept-occupancy-fill"
          style={{ width: `${occupancy}%`, background: fillColor }}
        />
      </div>

      <div className="dept-card-stats">
        <div className="dept-stat">
          <span className="dept-stat-value">{patients}</span>
          <span className="dept-stat-label">Patients</span>
        </div>
        <div className="dept-stat">
          <span className="dept-stat-value" style={{ color: available <= 2 ? 'var(--color-error)' : 'var(--color-success)' }}>
            {available}
          </span>
          <span className="dept-stat-label">Avail.</span>
        </div>
        <div className="dept-stat dept-stat-doctor">
          <span className="dept-stat-value dept-on-call">{onCall}</span>
          <span className="dept-stat-label">On Call</span>
        </div>
      </div>
    </div>
  );
};

export default DeptStatusCard;
