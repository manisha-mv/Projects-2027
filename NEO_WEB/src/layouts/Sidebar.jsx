// layouts/Sidebar.jsx
import React, { useMemo } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  RiDashboardLine,
  RiUserHeartLine,
  RiCalendarLine,
  RiStethoscopeLine,
  RiFlaskLine,
  RiScanLine,
  RiMedicineBottleLine,
  RiNurseLine,
  RiHotelBedLine,
  RiFirstAidKitLine,
  RiScissorsLine,
  RiMoneyDollarCircleLine,
  RiShieldLine,
  RiBarChartBoxLine,
  RiAlertLine,
  RiSettings3Line,
  RiHeartPulseLine,
  RiArrowLeftSLine,
  RiArrowRightSLine,
  RiPulseLine,
  RiFileTextLine,
  RiDropLine,
  RiBuildingLine,
  RiTeamLine,
  RiShieldKeyholeLine,
  RiArchiveLine,
  RiSendPlane2Line,
  RiRouteLine,
  RiNotification3Line,
  RiUser3Line,
  RiSparklingFill,
} from 'react-icons/ri';
import { NeoLogoMark } from '../components/common/NeoLogo';
import { useAuth } from '../contexts/AuthContext';

const NAV_CONFIG = [
  // ─── PATIENT PORTAL ───────────────────────────────────────────────────────
  {
    label: 'Patient Portal',
    items: [
      { id: 'patient-portal',  label: 'My Health Portal',      path: '/patient-portal',    icon: RiUserHeartLine,         roles: ['PATIENT'] },
      { id: 'medical-records', label: 'My Medical Records',    path: '/medical-records',   icon: RiFileTextLine,          roles: ['PATIENT'] },
      { id: 'appointments',    label: 'My Appointments',       path: '/appointments',      icon: RiCalendarLine,          roles: ['PATIENT'] },
      { id: 'laboratory',       label: 'Lab & Diagnostics',     path: '/laboratory',        icon: RiFlaskLine,             roles: ['PATIENT'] },
      { id: 'traceability',    label: 'Treatment Progress',    path: '/traceability',      icon: RiRouteLine,             roles: ['PATIENT'] },
      { id: 'billing',         label: 'Invoices & Billing',    path: '/billing',           icon: RiMoneyDollarCircleLine, roles: ['PATIENT'] },
      { id: 'complaints',      label: 'Care Team Inquiries',   path: '/complaints',        icon: RiAlertLine,             roles: ['PATIENT'] },
    ],
  },

  // ─── CORE ─────────────────────────────────────────────────────────────────
  {
    label: 'Core',
    items: [
      { id: 'dashboard',    label: 'Dashboard',             path: '/dashboard',    icon: RiDashboardLine,         roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB', 'NURSE', 'BILLING', 'RADIOLOGY', 'INSURANCE', 'COMPLAINT_OFFICER'] },
      { id: 'patients',     label: 'Patients',              path: '/patients',     icon: RiUserHeartLine,         roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING'] },
      { id: 'appointments', label: 'Appointments',          path: '/appointments', icon: RiCalendarLine,          roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'] },
      { id: 'traceability', label: 'Treatment Traceability', path: '/traceability', icon: RiRouteLine,             roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING'] },
    ],
  },

  // ─── CLINICAL ─────────────────────────────────────────────────────────────
  {
    label: 'Clinical',
    items: [
      { id: 'doctors',      label: 'Doctors',       path: '/doctors',      icon: RiStethoscopeLine,       roles: ['ADMIN', 'RECEPTIONIST'] },
      { id: 'nursing',      label: 'Nursing',       path: '/nursing',      icon: RiNurseLine,             roles: ['ADMIN', 'NURSE', 'DOCTOR'] },
      { id: 'laboratory',   label: 'Laboratory',    path: '/laboratory',   icon: RiFlaskLine,             roles: ['ADMIN', 'LAB', 'DOCTOR'], badge: 3 },
      { id: 'radiology',    label: 'Radiology',     path: '/radiology',    icon: RiScanLine,              roles: ['ADMIN', 'RADIOLOGY', 'DOCTOR'] },
      { id: 'pharmacy',     label: 'Pharmacy',      path: '/pharmacy',     icon: RiMedicineBottleLine,    roles: ['ADMIN', 'PHARMACIST'], badge: 2 },
      { id: 'ipd',          label: 'IPD / Beds',    path: '/ipd',          icon: RiHotelBedLine,          roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
      { id: 'emergency',    label: 'Emergency',     path: '/emergency',    icon: RiFirstAidKitLine,       roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'], badge: 1 },
      { id: 'surgery',      label: 'Surgery / OT',  path: '/surgery',      icon: RiScissorsLine,          roles: ['ADMIN', 'DOCTOR', 'NURSE'] },
      { id: 'discharge',    label: 'Discharge',     path: '/discharge',    icon: RiSendPlane2Line,        roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
      { id: 'followup',     label: 'Follow-up',     path: '/followup',     icon: RiPulseLine,             roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'NURSE'] },
    ],
  },

  // ─── OPERATIONS ───────────────────────────────────────────────────────────
  {
    label: 'Operations',
    items: [
      { id: 'billing',              label: 'Billing',             path: '/billing',              icon: RiMoneyDollarCircleLine, roles: ['ADMIN', 'BILLING', 'RECEPTIONIST'] },
      { id: 'insurance',            label: 'Insurance',           path: '/insurance',            icon: RiShieldLine,            roles: ['ADMIN', 'BILLING', 'INSURANCE'] },
      { id: 'pharmacy-inventory',   label: 'Pharmacy Inventory',  path: '/pharmacy-inventory',   icon: RiArchiveLine,           roles: ['ADMIN', 'PHARMACIST'] },
      { id: 'blood-bank',           label: 'Blood Bank',          path: '/blood-bank',           icon: RiDropLine,              roles: ['ADMIN', 'LAB', 'DOCTOR', 'NURSE'] },
      { id: 'medical-records',      label: 'Medical Records',     path: '/medical-records',      icon: RiFileTextLine,          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST'] },
    ],
  },

  // ─── MANAGEMENT ───────────────────────────────────────────────────────────
  {
    label: 'Management',
    items: [
      { id: 'departments',  label: 'Departments',         path: '/departments',  icon: RiBuildingLine,          roles: ['ADMIN'] },
      { id: 'staff',        label: 'Staff',               path: '/staff',        icon: RiTeamLine,              roles: ['ADMIN'] },
      { id: 'reports',      label: 'Reports',             path: '/reports',      icon: RiBarChartBoxLine,       roles: ['ADMIN'] },
      { id: 'complaints',   label: 'Complaints',          path: '/complaints',   icon: RiAlertLine,             roles: ['ADMIN', 'COMPLAINT_OFFICER'] },
      { id: 'audit',        label: 'Audit / Activity Log',path: '/audit',        icon: RiShieldKeyholeLine,     roles: ['ADMIN'] },
      { id: 'notifications',label: 'Notifications',       path: '/notifications',icon: RiNotification3Line,     roles: ['ADMIN', 'DOCTOR', 'RECEPTIONIST', 'PHARMACIST', 'LAB', 'NURSE', 'BILLING', 'RADIOLOGY', 'INSURANCE', 'COMPLAINT_OFFICER'] },
      { id: 'settings',     label: 'Settings',            path: '/settings',     icon: RiSettings3Line,         roles: ['ADMIN'] },
    ],
  },
];

const Sidebar = ({ collapsed, onToggle, mobileOpen, onMobileClose }) => {
  const location = useLocation();
  const { user, role } = useAuth();

  // Filter navigation sections based on user role
  const filteredNav = useMemo(() => {
    if (!role) return [];
    
    return NAV_CONFIG.map(section => ({
      ...section,
      items: section.items.filter(item => item.roles.includes(role))
    })).filter(section => section.items.length > 0);
  }, [role]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        className={`sidebar-overlay ${mobileOpen ? '' : 'hidden'}`}
        onClick={onMobileClose}
        aria-hidden="true"
      />

      <aside
        className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}
        aria-label="Main navigation"
      >
        {/* Professional Brand Header */}
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">
            <NeoLogoMark size={28} animated />
          </div>
          <div className="sidebar-brand-text">
            <span className="sidebar-brand-name">NEO Care</span>
            <span className="sidebar-brand-tagline">HOSPITAL SYSTEM</span>
          </div>
          {/* Live indicator — only when expanded */}
          {!collapsed && (
            <div className="sidebar-live-pill" title="System connected & active">
              <span className="sidebar-live-dot" />
              <span className="sidebar-live-label">LIVE</span>
            </div>
          )}
        </div>

        {/* Professional Navigation Menu */}
        <nav className="sidebar-nav" aria-label="Primary navigation">
          {filteredNav.map(section => (
            <div key={section.label} className="sidebar-nav-section">
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path !== '/dashboard' && item.path !== '/patient-portal' && location.pathname.startsWith(item.path));

                return (
                  <NavLink
                    key={item.id}
                    to={item.path}
                    id={`nav-${item.id}`}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    onClick={onMobileClose}
                    aria-current={isActive ? 'page' : undefined}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className="sidebar-nav-icon">
                      <Icon />
                    </span>
                    <span className="sidebar-nav-label">{item.label}</span>
                    {item.badge && (
                      <span className="sidebar-nav-badge">{item.badge}</span>
                    )}
                    {/* Tooltip shown when collapsed */}
                    <span className="sidebar-nav-tooltip">{item.label}</span>
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>

        {/* Professional User Footer */}
        <div className="sidebar-user-footer">
          <div className="sidebar-user-avatar">
            {user?.name ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2) : <RiUser3Line size={16} />}
          </div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{user?.name || 'Authorized User'}</span>
            <span className="sidebar-user-role">
              {role === 'PATIENT' ? 'Patient Portal' : (user?.role || 'Staff Member')}
            </span>
          </div>
          {/* Collapse toggle inside user footer */}
          <button
            id="sidebar-collapse-btn"
            className="sidebar-collapse-btn"
            onClick={onToggle}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {collapsed ? <RiArrowRightSLine size={18} /> : <RiArrowLeftSLine size={18} />}
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;

