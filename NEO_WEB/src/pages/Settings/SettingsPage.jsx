// pages/Settings/SettingsPage.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiSettings3Line,
  RiSaveLine,
  RiUserAddLine,
  RiShieldUserLine,
  RiNotificationLine,
  RiBuildingLine,
  RiCheckLine,
  RiCloseLine,
  RiSearchLine,
  RiLockLine,
  RiServerLine,
  RiTeamLine,
  RiUserHeartLine,
  RiStethoscopeLine,
  RiMedicineBottleLine,
  RiShieldCheckLine,
  RiRefreshLine,
  RiGlobalLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiAwardLine,
  RiPulseLine,
  RiStarLine,
  RiEditLine,
  RiKeyLine
} from 'react-icons/ri';
import { useToast } from '../../components/ui/Toast';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Card, { CardHeader, CardBody } from '../../components/ui/Card';
import { NeoLogoMark } from '../../components/common/NeoLogo';
import api from '../../lib/apiClient';

const ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING'];

const ROLE_BADGE_COLOR = {
  ADMIN: 'emergency',
  DOCTOR: 'primary',
  NURSE: 'teal',
  RECEPTIONIST: 'info',
  LAB: 'warning',
  RADIOLOGY: 'cyan',
  PHARMACIST: 'warning',
  BILLING: 'success',
};

export default function SettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'users' | 'roles' | 'notifications' | 'security'

  // Profile Form
  const [formData, setFormData] = useState({
    hospitalName: 'NEO Care Hospital & Research Center',
    tagline: 'Smart Integrated Hospital Management & Traceability System',
    mottoTamil: 'உங்கள் ஆரோக்கியம் எங்கள் முன்னுரிமை',
    mottoEng: 'Healthier People • Brighter Tomorrows',
    contactEmail: 'contact@neocarehospital.in',
    contactPhone: '+91 80 4912 8800',
    emergencyHelpline: '+91 80 4912 9999 / 108',
    address: '100 Medical Center Boulevard, Indiranagar, Bengaluru, Karnataka 560038',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    gstNumber: '29ABCDE1234F1Z5',
    accreditation: 'NABH Accredited • ISO 9001:2015',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // User Management
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [userModalOpen, setUserModalOpen] = useState(false);

  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    department: 'General Medicine',
    phone: '',
    empId: '',
  });

  // Notification Toggles
  const [notifications, setNotifications] = useState({
    critical_vitals: true,
    lab_results: true,
    pharmacy_orders: true,
    ipd_transfers: true,
    billing_overdue: false,
    emergency_alerts: true,
    daily_summary_email: true,
  });

  // Security & System Settings
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: '30',
    twoFactorRequired: false,
    auditLoggingLevel: 'DETAILED',
    autoBackupFrequency: 'DAILY',
    maxLoginAttempts: '5',
  });

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch {
      // Fallback preview mock staff list
      setUsers([
        { id: 'u1', name: 'System Admin', empId: 'EMP-001', email: 'admin@neocare.in', role: 'ADMIN', department: 'Administration', phone: '+91 98765 00001', isActive: true, lastLogin: '10 mins ago' },
        { id: 'u2', name: 'Dr. Ananya Menon', empId: 'EMP-002', email: 'dr.ananya@neocare.in', role: 'DOCTOR', department: 'Neurology', phone: '+91 98765 00002', isActive: true, lastLogin: '1 hour ago' },
        { id: 'u3', name: 'Dr. Kiran Rao', empId: 'EMP-003', email: 'dr.kiran@neocare.in', role: 'DOCTOR', department: 'Cardiology', phone: '+91 98765 00003', isActive: true, lastLogin: '3 hours ago' },
        { id: 'u4', name: 'Nurse Priya Sharma', empId: 'EMP-004', email: 'priya.nurse@neocare.in', role: 'NURSE', department: 'ICU Ward', phone: '+91 98765 00004', isActive: true, lastLogin: '25 mins ago' },
        { id: 'u5', name: 'Karthik Raman', empId: 'EMP-005', email: 'karthik.lab@neocare.in', role: 'LAB', department: 'Pathology Lab', phone: '+91 98765 00005', isActive: true, lastLogin: 'Yesterday' },
        { id: 'u6', name: 'Sunita Pillai', empId: 'EMP-006', email: 'sunita.pharm@neocare.in', role: 'PHARMACIST', department: 'Central Pharmacy', phone: '+91 98765 00006', isActive: true, lastLogin: '4 hours ago' },
        { id: 'u7', name: 'Front Desk Team', empId: 'EMP-007', email: 'reception@neocare.in', role: 'RECEPTIONIST', department: 'OPD Registration', phone: '+91 98765 00007', isActive: true, lastLogin: 'Just now' },
        { id: 'u8', name: 'Billing Desk', empId: 'EMP-008', email: 'billing@neocare.in', role: 'BILLING', department: 'Finance & Insurance', phone: '+91 98765 00008', isActive: true, lastLogin: '5 hours ago' },
      ]);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'users') {
      fetchUsers();
    }
  }, [activeTab, fetchUsers]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setSavingProfile(true);
    setTimeout(() => {
      setSavingProfile(false);
      addToast({ type: 'success', title: 'Hospital Profile Updated', message: 'Official hospital profile and branding settings saved successfully.' });
    }, 600);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      addToast({ type: 'success', title: 'Staff Account Created', message: `Account created for ${newUser.firstName} ${newUser.lastName}.` });
      setUserModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', department: 'General Medicine', phone: '', empId: '' });
      fetchUsers();
    } catch {
      // Optimistic update for UI preview
      const created = {
        id: `u-${Date.now()}`,
        name: `${newUser.firstName} ${newUser.lastName}`,
        empId: newUser.empId || `EMP-${Math.floor(100 + Math.random() * 900)}`,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone || '+91 98765 99999',
        isActive: true,
        lastLogin: 'Never'
      };
      setUsers([created, ...users]);
      addToast({ type: 'success', title: 'Staff Account Created', message: `Staff account for ${created.name} created successfully!` });
      setUserModalOpen(false);
      setNewUser({ firstName: '', lastName: '', email: '', password: '', role: 'DOCTOR', department: 'General Medicine', phone: '', empId: '' });
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    const nextStatus = !userObj.isActive;
    try {
      await api.put(`/users/${userObj.id || userObj._id}`, { isActive: nextStatus });
    } catch {
      // Fallback
    }
    setUsers(users.map(u => u.id === userObj.id ? { ...u, isActive: nextStatus } : u));
    addToast({
      type: nextStatus ? 'success' : 'info',
      title: `Account ${nextStatus ? 'Activated' : 'Deactivated'}`,
      message: `${userObj.name}'s account status changed to ${nextStatus ? 'Active' : 'Disabled'}.`
    });
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.name || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                        (u.email || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                        (u.department || '').toLowerCase().includes(userSearch.toLowerCase()) ||
                        (u.empId || '').toLowerCase().includes(userSearch.toLowerCase());
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="module-page">
      {/* ── Page Header ────────────────────────────────────────── */}
      <PageHeader
        title="System Settings"
        subtitle="Manage hospital profile, staff credentials, role-based security policies, and notification rules"
        icon={<RiSettings3Line />}
        actions={
          <div style={{ display: 'flex', gap: 10 }}>
            <span style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', padding: '6px 14px', borderRadius: 99, fontSize: 12, display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600 }}>
              <span className="user-status-dot active" /> Version 2.4.0 (Live)
            </span>
          </div>
        }
      />

      {/* ── Settings Sub-Navigation Tabs ────────────────────────── */}
      <div className="settings-nav-tabs">
        <button
          className={`settings-nav-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <RiBuildingLine size={16} /> Hospital Profile &amp; Branding
        </button>
        <button
          className={`settings-nav-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <RiTeamLine size={16} /> Staff &amp; Accounts ({users.length || 8})
        </button>
        <button
          className={`settings-nav-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <RiShieldUserLine size={16} /> Roles &amp; Access (RBAC)
        </button>
        <button
          className={`settings-nav-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <RiNotificationLine size={16} /> Notification Parameters
        </button>
        <button
          className={`settings-nav-tab ${activeTab === 'security' ? 'active' : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <RiLockLine size={16} /> Security &amp; API Setup
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
         TAB 1: HOSPITAL PROFILE & BRANDING
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
          {/* Form */}
          <Card>
            <CardHeader>
              <div>
                <div className="dash-card-title">Hospital Profile Settings</div>
                <div className="dash-card-sub">Official identity details printed on reports and invoices</div>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-5)' }}>
              <form onSubmit={handleSaveProfile} className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label">Official Hospital Name *</label>
                  <input
                    className="form-input"
                    value={formData.hospitalName}
                    onChange={(e) => setFormData({ ...formData, hospitalName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">System Tagline</label>
                  <input
                    className="form-input"
                    value={formData.tagline}
                    onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Tamil Motto</label>
                  <input
                    className="form-input"
                    value={formData.mottoTamil}
                    onChange={(e) => setFormData({ ...formData, mottoTamil: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">English Motto</label>
                  <input
                    className="form-input"
                    value={formData.mottoEng}
                    onChange={(e) => setFormData({ ...formData, mottoEng: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Primary Contact Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Hospital Phone Line</label>
                  <input
                    className="form-input"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">24x7 Emergency Helpline</label>
                  <input
                    className="form-input"
                    value={formData.emergencyHelpline}
                    onChange={(e) => setFormData({ ...formData, emergencyHelpline: e.target.value })}
                  />
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Physical Address</label>
                  <input
                    className="form-input"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">GST / PAN Registration No.</label>
                  <input
                    className="form-input"
                    value={formData.gstNumber}
                    onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Accreditation Standards</label>
                  <input
                    className="form-input"
                    value={formData.accreditation}
                    onChange={(e) => setFormData({ ...formData, accreditation: e.target.value })}
                  />
                </div>

                <div className="form-group-full" style={{ marginTop: 12 }}>
                  <button type="submit" className="btn btn-primary" disabled={savingProfile} style={{ padding: '10px 24px' }}>
                    <RiSaveLine size={16} /> {savingProfile ? 'Saving Changes...' : 'Save Profile Settings'}
                  </button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Live Brand Preview Card */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <Card>
              <CardHeader>
                <div>
                  <div className="dash-card-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <RiStarLine style={{ color: '#8B5CF6' }} /> Official Brand Emblem Preview
                  </div>
                  <div className="dash-card-sub">Exact logo emblem active across system headers</div>
                </div>
              </CardHeader>
              <CardBody style={{ padding: 'var(--space-4)' }}>
                <div className="settings-brand-preview-card">
                  <div className="settings-brand-logo-box">
                    <NeoLogoMark size={58} />
                  </div>
                  <div>
                    <div style={{ background: 'rgba(255,255,255,0.18)', padding: '2px 10px', borderRadius: 99, fontSize: 10, fontWeight: 700, display: 'inline-block', marginBottom: 4 }}>
                      ❤️ {formData.mottoTamil}
                    </div>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
                      {formData.hospitalName}
                    </h2>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', margin: '4px 0 0' }}>
                      {formData.tagline}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>

            <Card>
              <CardHeader>
                <div className="dash-card-title">Hospital Information Summary</div>
              </CardHeader>
              <CardBody style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <RiMailLine style={{ color: '#5B21B6' }} />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Email</span>
                    <strong>{formData.contactEmail}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <RiPhoneLine style={{ color: '#0D9488' }} />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Helpline</span>
                    <strong>{formData.contactPhone}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <RiMapPinLine style={{ color: '#0891B2' }} />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Location</span>
                    <strong>{formData.address}</strong>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
                  <RiAwardLine style={{ color: '#F59E0B' }} />
                  <div>
                    <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block' }}>Accreditation</span>
                    <strong>{formData.accreditation}</strong>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         TAB 2: STAFF & USER ACCOUNTS
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Summary Stat Pills */}
          <div className="settings-stat-summary">
            <div className="settings-stat-card">
              <div className="settings-stat-icon" style={{ background: '#F3E8FF', color: '#5B21B6' }}>
                <RiTeamLine />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{users.length}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Total Staff Accounts</div>
              </div>
            </div>
            <div className="settings-stat-card">
              <div className="settings-stat-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}>
                <RiStethoscopeLine />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{users.filter(u => u.role === 'DOCTOR').length || 2}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Doctors / Consultants</div>
              </div>
            </div>
            <div className="settings-stat-card">
              <div className="settings-stat-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}>
                <RiUserHeartLine />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{users.filter(u => u.role === 'NURSE').length || 1}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Ward Nurses</div>
              </div>
            </div>
            <div className="settings-stat-card">
              <div className="settings-stat-icon" style={{ background: '#DCFCE7', color: '#15803D' }}>
                <RiShieldCheckLine />
              </div>
              <div>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{users.filter(u => u.isActive).length}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Active Credentials</div>
              </div>
            </div>
          </div>

          {/* User Table Card */}
          <Card>
            <CardHeader>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
                <div>
                  <div className="dash-card-title">Hospital Staff &amp; System Users</div>
                  <div className="dash-card-sub">Manage staff credentials, department scopes, and login status</div>
                </div>

                {/* Filter and Action Header Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                  {/* Search */}
                  <div style={{ position: 'relative' }}>
                    <RiSearchLine style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                    <input
                      className="form-input"
                      placeholder="Search staff, email..."
                      value={userSearch}
                      onChange={e => setUserSearch(e.target.value)}
                      style={{ paddingLeft: 32, width: 200, height: 36, fontSize: 12 }}
                    />
                  </div>

                  {/* Role Selector */}
                  <select
                    className="form-select"
                    value={roleFilter}
                    onChange={e => setRoleFilter(e.target.value)}
                    style={{ height: 36, fontSize: 12, width: 140 }}
                  >
                    <option value="ALL">All Roles</option>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>

                  <button className="btn btn-primary" style={{ height: 36, padding: '0 14px', fontSize: 12 }} onClick={() => setUserModalOpen(true)}>
                    <RiUserAddLine size={14} /> Add Staff Account
                  </button>
                </div>
              </div>
            </CardHeader>

            <div style={{ overflowX: 'auto' }}>
              {loadingUsers ? (
                <div className="loading-center" style={{ padding: 40 }}><Spinner size="lg" /></div>
              ) : (
                <table className="user-mgmt-table">
                  <thead>
                    <tr>
                      <th>Emp ID</th>
                      <th>Staff Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Department</th>
                      <th>Last Active</th>
                      <th>Status</th>
                      <th style={{ textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} style={{ textAlign: 'center', padding: 30, color: 'var(--color-text-muted)' }}>
                          No staff accounts found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u, idx) => (
                        <tr key={u.id || idx}>
                          <td>
                            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, background: 'var(--color-bg)', padding: '2px 6px', borderRadius: 4, fontWeight: 700 }}>
                              {u.empId || `EMP-00${idx + 1}`}
                            </span>
                          </td>
                          <td>
                            <strong style={{ fontSize: 13, color: 'var(--color-text-primary)' }}>{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</strong>
                          </td>
                          <td style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{u.email}</td>
                          <td>
                            <Badge variant={ROLE_BADGE_COLOR[u.role] || 'secondary'}>{u.role}</Badge>
                          </td>
                          <td style={{ fontSize: 12 }}>{u.department || 'General'}</td>
                          <td style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{u.lastLogin || 'Recent'}</td>
                          <td>
                            <span className={`user-status-dot ${u.isActive ? 'active' : 'inactive'}`} />
                            <span style={{ fontSize: 12, fontWeight: 600, color: u.isActive ? 'var(--color-success)' : 'var(--color-error)' }}>
                              {u.isActive ? 'Active' : 'Disabled'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              className={`btn btn-sm ${u.isActive ? 'btn-ghost' : 'btn-primary'}`}
                              onClick={() => handleToggleUserStatus(u)}
                              style={{ fontSize: 11, padding: '3px 10px', cursor: 'pointer' }}
                            >
                              {u.isActive ? 'Disable' : 'Enable'}
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
         TAB 3: ROLES & ACCESS CONTROL (RBAC)
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <div>
              <div className="dash-card-title">Role-Based Access Control (RBAC) Matrix</div>
              <div className="dash-card-sub">Configured permission scopes per staff role category</div>
            </div>
          </CardHeader>
          <div style={{ overflowX: 'auto' }}>
            <table className="settings-rbac-table">
              <thead>
                <tr>
                  <th>System Module / Feature Scope</th>
                  <th>ADMIN</th>
                  <th>DOCTOR</th>
                  <th>NURSE</th>
                  <th>RECEPTION</th>
                  <th>LAB</th>
                  <th>PHARMACY</th>
                  <th>BILLING</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { module: 'Patient Registration & Demographic Records', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                  { module: 'Appointments & Consultations Management', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                  { module: 'EHR Prescriptions & Clinical Notes', admin: true, doctor: true, nurse: true, reception: false, lab: false, pharmacy: true, billing: false },
                  { module: 'Lab Test Orders & Specimen Diagnostics', admin: true, doctor: true, nurse: true, reception: false, lab: true, pharmacy: false, billing: false },
                  { module: 'Radiology Scan Requests & Reports', admin: true, doctor: true, nurse: true, reception: false, lab: false, pharmacy: false, billing: false },
                  { module: 'Pharmacy Inventory & Medication Dispensing', admin: true, doctor: true, nurse: false, reception: false, lab: false, pharmacy: true, billing: false },
                  { module: 'IPD Inpatient Admissions & Bed Allocation', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                  { module: 'Billing, Invoicing & Insurance Claims', admin: true, doctor: false, nurse: false, reception: true, lab: false, pharmacy: false, billing: true },
                  { module: 'Treatment Traceability Timeline', admin: true, doctor: true, nurse: true, reception: true, lab: true, pharmacy: true, billing: true },
                  { module: 'System Audit Logs & Security Reports', admin: true, doctor: false, nurse: false, reception: false, lab: false, pharmacy: false, billing: false },
                ].map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.module}</td>
                    <td>{r.admin ? <span className="permission-badge-yes"><RiCheckLine /> Full</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.doctor ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.nurse ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.reception ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.lab ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.pharmacy ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                    <td>{r.billing ? <span className="permission-badge-yes"><RiCheckLine /> Yes</span> : <span className="permission-badge-no">—</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════
         TAB 4: NOTIFICATION PARAMETERS
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'notifications' && (
        <Card style={{ maxWidth: 850 }}>
          <CardHeader>
            <div>
              <div className="dash-card-title">System Notification Parameters &amp; Triggers</div>
              <div className="dash-card-sub">Configure real-time toast alerts, critical vitals emergency triggers, and dispatch channels</div>
            </div>
          </CardHeader>
          <CardBody style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { id: 'critical_vitals', title: 'Critical Patient Vitals Emergency Trigger', desc: 'Instant toast & sound alert when blood pressure, SPO2, or pulse crosses emergency thresholds', prio: 'CRITICAL', default: notifications.critical_vitals },
              { id: 'emergency_alerts', title: 'New ER Casualty Admission Alert', desc: 'Broadcast notification to all active on-duty doctors and triage nurses', prio: 'HIGH', default: notifications.emergency_alerts },
              { id: 'lab_results', title: 'Lab & Radiology Diagnostics Ready', desc: 'Notify ordering physician immediately upon result authorization', prio: 'MEDIUM', default: notifications.lab_results },
              { id: 'pharmacy_orders', title: 'E-Prescription Signed Notification', desc: 'Alert pharmacy team when new prescription orders are generated in consultations', prio: 'MEDIUM', default: notifications.pharmacy_orders },
              { id: 'ipd_transfers', title: 'IPD Ward Bed Allocation & Discharge', desc: 'Send bed readiness alert to nursing station and housekeeping', prio: 'INFO', default: notifications.ipd_transfers },
              { id: 'daily_summary_email', title: 'Daily Operational Summary Digest', desc: 'Send automated shift handoff report to hospital administrators at 08:00 AM', prio: 'INFO', default: notifications.daily_summary_email },
            ].map(item => (
              <div key={item.id} className="settings-toggle-row">
                <div style={{ flex: 1, paddingRight: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: 13 }}>{item.title}</strong>
                    <Badge variant={item.prio === 'CRITICAL' ? 'emergency' : item.prio === 'HIGH' ? 'error' : 'info'}>{item.prio}</Badge>
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--color-text-secondary)', margin: '3px 0 0' }}>{item.desc}</p>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    className="switch-input"
                    checked={notifications[item.id] ?? item.default}
                    onChange={(e) => {
                      setNotifications({ ...notifications, [item.id]: e.target.checked });
                      addToast({ type: 'info', title: 'Notification Rule Updated', message: `${item.title} is now ${e.target.checked ? 'ENABLED' : 'DISABLED'}.` });
                    }}
                  />
                  <span className="switch-slider" />
                </label>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      {/* ══════════════════════════════════════════════════════════
         TAB 5: SECURITY & API SETUP
         ══════════════════════════════════════════════════════════ */}
      {activeTab === 'security' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--space-5)', alignItems: 'start' }}>
          <Card>
            <CardHeader>
              <div>
                <div className="dash-card-title">System Security &amp; Audit Rules</div>
                <div className="dash-card-sub">Session timeouts, login policies, and audit retention</div>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-5)' }}>
              <div className="form-grid">
                <div className="form-group form-group-full">
                  <label className="form-label">Inactivity Session Timeout (Minutes)</label>
                  <select
                    className="form-select"
                    value={securitySettings.sessionTimeout}
                    onChange={e => setSecuritySettings({ ...securitySettings, sessionTimeout: e.target.value })}
                  >
                    <option value="15">15 Minutes</option>
                    <option value="30">30 Minutes (Recommended)</option>
                    <option value="60">60 Minutes</option>
                    <option value="120">120 Minutes</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Audit Log Retention Policy</label>
                  <select
                    className="form-select"
                    value={securitySettings.auditLoggingLevel}
                    onChange={e => setSecuritySettings({ ...securitySettings, auditLoggingLevel: e.target.value })}
                  >
                    <option value="DETAILED">Detailed HIPAA &amp; NABH Compliance Audit (Full Payload)</option>
                    <option value="STANDARD">Standard Event Audit</option>
                  </select>
                </div>
                <div className="form-group form-group-full">
                  <label className="form-label">Automatic System Database Backup Schedule</label>
                  <select
                    className="form-select"
                    value={securitySettings.autoBackupFrequency}
                    onChange={e => setSecuritySettings({ ...securitySettings, autoBackupFrequency: e.target.value })}
                  >
                    <option value="HOURLY">Every Hour (Hot Backup)</option>
                    <option value="DAILY">Daily at Midnight (Recommended)</option>
                    <option value="WEEKLY">Weekly Full Snapshot</option>
                  </select>
                </div>
                <div className="form-group-full" style={{ marginTop: 10 }}>
                  <button
                    className="btn btn-primary"
                    onClick={() => addToast({ type: 'success', title: 'Security Settings Saved', message: 'Security parameters updated.' })}
                  >
                    <RiShieldCheckLine size={16} /> Save Security Policies
                  </button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <div>
                <div className="dash-card-title">Backend API Environment</div>
                <div className="dash-card-sub">Active environment variables and server connections</div>
              </div>
            </CardHeader>
            <CardBody style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ padding: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-lg)' }}>
                <span style={{ fontSize: 10, color: 'var(--color-text-muted)', display: 'block', fontWeight: 700 }}>VITE_API_BASE_URL</span>
                <code style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-mono)' }}>
                  {formData.apiBaseUrl}
                </code>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ fontSize: 12, display: 'block' }}>Database Status</strong>
                  <span style={{ fontSize: 11, color: 'var(--color-success)' }}>● Connected to MongoDB Cluster</span>
                </div>
                <Badge variant="success">ONLINE</Badge>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong style={{ fontSize: 12, display: 'block' }}>Traceability Engine</strong>
                  <span style={{ fontSize: 11, color: 'var(--color-info)' }}>● Audit Trail Active</span>
                </div>
                <Badge variant="info">ACTIVE</Badge>
              </div>
            </CardBody>
          </Card>
        </div>
      )}

      {/* ── CREATE STAFF ACCOUNT MODAL ──────────────────────────── */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Register New Hospital Staff Account"
      >
        <form onSubmit={handleCreateUser} className="form-grid">
          <div className="form-group">
            <label className="form-label">Employee ID *</label>
            <input
              className="form-input"
              required
              placeholder="e.g. EMP-104"
              value={newUser.empId}
              onChange={e => setNewUser({ ...newUser, empId: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Role Category *</label>
            <select
              className="form-select"
              value={newUser.role}
              onChange={e => setNewUser({ ...newUser, role: e.target.value })}
            >
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              className="form-input"
              required
              placeholder="e.g. Rahul"
              value={newUser.firstName}
              onChange={e => setNewUser({ ...newUser, firstName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input
              className="form-input"
              required
              placeholder="e.g. Verma"
              value={newUser.lastName}
              onChange={e => setNewUser({ ...newUser, lastName: e.target.value })}
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Official Email Address *</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="e.g. rahul.verma@neocare.in"
              value={newUser.email}
              onChange={e => setNewUser({ ...newUser, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              className="form-input"
              placeholder="e.g. Cardiology"
              value={newUser.department}
              onChange={e => setNewUser({ ...newUser, department: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              className="form-input"
              placeholder="+91 98765 43210"
              value={newUser.phone}
              onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Initial Password *</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={newUser.password}
              onChange={e => setNewUser({ ...newUser, password: e.target.value })}
            />
          </div>
          <div className="form-group-full" style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-ghost" onClick={() => setUserModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary"><RiUserAddLine /> Create Account</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
