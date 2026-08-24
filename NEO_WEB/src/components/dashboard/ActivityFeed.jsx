// components/dashboard/ActivityFeed.jsx
import React from 'react';
import {
  RiUserHeartLine,
  RiFlaskLine,
  RiLogoutBoxLine,
  RiMedicineBottleLine,
  RiCalendarCheckLine,
  RiFirstAidKitLine,
  RiScanLine,
} from 'react-icons/ri';

const TYPE_CONFIG = {
  admission:   { icon: RiUserHeartLine,     bg: 'var(--color-primary-light)',   color: 'var(--color-primary)',   label: 'Admission' },
  lab:         { icon: RiFlaskLine,          bg: 'var(--color-warning-light)',   color: 'var(--color-warning)',   label: 'Lab' },
  discharge:   { icon: RiLogoutBoxLine,      bg: 'var(--color-success-light)',   color: 'var(--color-success)',   label: 'Discharge' },
  pharmacy:    { icon: RiMedicineBottleLine, bg: 'var(--color-secondary-light)', color: 'var(--color-secondary)', label: 'Pharmacy' },
  appointment: { icon: RiCalendarCheckLine,  bg: 'var(--color-info-light)',      color: 'var(--color-info)',      label: 'Appt.' },
  emergency:   { icon: RiFirstAidKitLine,   bg: 'var(--color-emergency-light)', color: 'var(--color-emergency)', label: 'Emergency' },
  radiology:   { icon: RiScanLine,           bg: 'var(--color-border)',          color: 'var(--color-text-secondary)', label: 'Radiology' },
};

const ActivityFeed = ({ activities, maxItems = 7 }) => (
  <div className="activity-feed">
    {activities.slice(0, maxItems).map((act, i) => {
      const cfg = TYPE_CONFIG[act.type] || TYPE_CONFIG.appointment;
      const Icon = cfg.icon;
      return (
        <div
          key={act.id}
          className="activity-entry"
          style={{ borderBottom: i < Math.min(activities.length, maxItems) - 1 ? '1px solid var(--color-border)' : 'none' }}
        >
          {/* Timeline line */}
          <div className="activity-timeline">
            <div className="activity-icon" style={{ background: cfg.bg, color: cfg.color }}>
              <Icon size={12} />
            </div>
            {i < Math.min(activities.length, maxItems) - 1 && (
              <div className="activity-line" />
            )}
          </div>
          <div className="activity-body">
            <div className="activity-type-chip" style={{ background: cfg.bg, color: cfg.color }}>
              {cfg.label}
            </div>
            <p className="activity-text">{act.text}</p>
            <div className="activity-meta">
              <span className="activity-user">{act.user}</span>
              <span className="activity-time">{act.time}</span>
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

export default ActivityFeed;
