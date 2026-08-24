import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserAddLine,
  RiCalendarCheckLine,
  RiHotelBedLine,
  RiFirstAidKitLine,
  RiFlaskLine,
  RiLogoutBoxLine,
  RiMedicineBottleLine,
  RiFileList3Line,
} from 'react-icons/ri';

const ACTIONS = [
  {
    id: 'qa-register',
    label: 'Register Patient',
    icon: RiUserAddLine,
    color: 'var(--color-primary)',
    bg: 'var(--color-primary-light)',
    path: '/patients',
  },
  {
    id: 'qa-book-appt',
    label: 'Book Appointment',
    icon: RiCalendarCheckLine,
    color: 'var(--color-secondary)',
    bg: 'var(--color-secondary-light)',
    path: '/appointments',
  },
  {
    id: 'qa-admit',
    label: 'New Admission',
    icon: RiHotelBedLine,
    color: 'var(--color-info)',
    bg: 'var(--color-info-light)',
    path: '/ipd',
  },
  {
    id: 'qa-emergency',
    label: 'Emergency Reg.',
    icon: RiFirstAidKitLine,
    color: 'var(--color-emergency)',
    bg: 'var(--color-emergency-light)',
    path: '/emergency',
  },
  {
    id: 'qa-lab',
    label: 'Lab Order',
    icon: RiFlaskLine,
    color: 'var(--color-warning)',
    bg: 'var(--color-warning-light)',
    path: '/laboratory',
  },
  {
    id: 'qa-discharge',
    label: 'Discharge',
    icon: RiLogoutBoxLine,
    color: 'var(--color-success)',
    bg: 'var(--color-success-light)',
    path: '/discharge',
  },
  {
    id: 'qa-pharmacy',
    label: 'Prescribe',
    icon: RiMedicineBottleLine,
    color: 'var(--color-critical)',
    bg: 'var(--color-critical-light)',
    path: '/pharmacy',
  },
  {
    id: 'qa-report',
    label: 'Generate Report',
    icon: RiFileList3Line,
    color: 'var(--color-text-secondary)',
    bg: 'var(--color-surface-alt)',
    path: '/reports',
  },
];

const QuickActions = ({ onRegisterPatient }) => {
  const navigate = useNavigate();
  return (
    <div className="quick-actions-panel">
      <div className="quick-actions-label">Quick Actions</div>
      <div className="quick-actions-grid">
        {ACTIONS.map(action => {
          const Icon = action.icon;
          const handleClick = () => {
            if (action.id === 'qa-register' && onRegisterPatient) {
              onRegisterPatient();
            } else {
              navigate(action.path);
            }
          };

          return (
            <button
              key={action.id}
              id={action.id}
              className="quick-action-tile"
              title={action.label}
              aria-label={action.label}
              onClick={handleClick}
            >
              <div
                className="quick-action-icon"
                style={{ background: action.bg, color: action.color }}
              >
                <Icon size={18} />
              </div>
              <span className="quick-action-label">{action.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default QuickActions;
