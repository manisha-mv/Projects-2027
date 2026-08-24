// layouts/Breadcrumb.jsx
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { RiArrowRightSLine, RiHome4Line } from 'react-icons/ri';

const ROUTE_LABELS = {
  dashboard:    'Dashboard',
  patients:     'Patients',
  appointments: 'Appointments',
  doctors:      'Doctors',
  laboratory:   'Laboratory',
  radiology:    'Radiology',
  pharmacy:     'Pharmacy',
  nursing:      'Nursing',
  ipd:          'IPD / Beds',
  emergency:    'Emergency',
  surgery:      'Surgery',
  billing:      'Billing',
  insurance:    'Insurance',
  reports:      'Reports',
  complaints:   'Complaints',
  settings:     'Settings',
};

const Breadcrumb = () => {
  const { pathname } = useLocation();
  const segments = pathname.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const crumbs = segments.map((seg, i) => ({
    label: ROUTE_LABELS[seg] ?? seg.charAt(0).toUpperCase() + seg.slice(1),
    path:  '/' + segments.slice(0, i + 1).join('/'),
  }));

  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/dashboard" className="breadcrumb-item" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <RiHome4Line size={13} />
      </Link>
      {crumbs.map((crumb, i) => (
        <React.Fragment key={crumb.path}>
          <RiArrowRightSLine className="breadcrumb-sep" size={14} />
          <span className="breadcrumb-item">
            {i === crumbs.length - 1 ? (
              <span className="breadcrumb-current">{crumb.label}</span>
            ) : (
              <Link to={crumb.path}>{crumb.label}</Link>
            )}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
};

export default Breadcrumb;
