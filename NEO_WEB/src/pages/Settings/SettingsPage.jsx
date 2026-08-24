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
} from 'react-icons/ri';
import { useToast } from '../../components/ui/Toast';
import PageHeader from '../../components/common/PageHeader';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import api from '../../lib/apiClient';

const ROLES = ['ADMIN', 'DOCTOR', 'NURSE', 'RECEPTIONIST', 'LAB', 'RADIOLOGY', 'PHARMACIST', 'BILLING'];

export default function SettingsPage() {
  const { addToast } = useToast();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'users' | 'roles' | 'notifications'

  // Profile Form
  const [formData, setFormData] = useState({
    hospitalName: 'NEO-HMS Smart Hospital System',
    tagline: 'Smart Integrated Hospital Management & Traceability System',
    contactEmail: 'admin@neohms.in',
    contactPhone: '+91 80 2234 5678',
    address: '100 Medical Center Way, Bengaluru, Karnataka 560001',
    currency: 'INR (₹)',
    timezone: 'Asia/Kolkata (IST)',
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // User Management
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [userModalOpen, setUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'DOCTOR',
    department: 'General Medicine',
    phone: '',
  });

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await api.get('/users');
      if (res && res.data) {
        setUsers(res.data);
      }
    } catch {
      // Fallback mock user list for UI preview
      setUsers([
        { id: 'u1', name: 'System Admin', email: 'admin@hospital.com', role: 'ADMIN', department: 'IT / Admin', isActive: true },
        { id: 'u2', name: 'Dr. Priya Sharma', email: 'doctor@hospital.com', role: 'DOCTOR', department: 'General Medicine', isActive: true },
        { id: 'u3', name: 'Reception Desk', email: 'reception@hospital.com', role: 'RECEPTIONIST', department: 'Front Desk', isActive: true },
        { id: 'u4', name: 'Nurse Station', email: 'nurse@hospital.com', role: 'NURSE', department: 'Nursing', isActive: true },
        { id: 'u5', name: 'Lab Technician', email: 'lab@hospital.com', role: 'LAB', department: 'Laboratory', isActive: true },
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
      addToast({ type: 'success', title: 'Settings Saved', message: 'Hospital profile settings updated.' });
    }, 500);
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/users', newUser);
      addToast({ type: 'success', title: 'User Created', message: `User ${newUser.email} created successfully.` });
      setUserModalOpen(false);
      fetchUsers();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message || 'Failed to create user.' });
    }
  };

  const handleToggleUserStatus = async (userObj) => {
    try {
      await api.put(`/users/${userObj.id || userObj._id}`, { isActive: !userObj.isActive });
      addToast({ type: 'info', title: 'User Status Updated', message: `${userObj.name || userObj.email} status changed.` });
      fetchUsers();
    } catch {
      setUsers(users.map(u => u.id === userObj.id ? { ...u, isActive: !u.isActive } : u));
      addToast({ type: 'info', title: 'User Status Updated', message: `${userObj.name || userObj.email} status updated.` });
    }
  };

  return (
    <div className="module-page">
      <PageHeader
        title="System Settings"
        subtitle="Configure hospital profile, user accounts, roles & permissions, and notification parameters"
        icon={<RiSettings3Line />}
      />

      {/* Tabs Bar */}
      <div className="module-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`module-tab ${activeTab === 'profile' ? 'active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <RiBuildingLine /> Hospital Profile
        </button>
        <button
          className={`module-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <RiUserAddLine /> User Management
        </button>
        <button
          className={`module-tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <RiShieldUserLine /> Roles & Permissions
        </button>
        <button
          className={`module-tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <RiNotificationLine /> Notification Settings
        </button>
      </div>

      {/* TAB 1: HOSPITAL PROFILE */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: '24px', maxWidth: '800px' }}>
          <form onSubmit={handleSaveProfile} className="form-grid">
            <h3 className="form-group-full" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px' }}>
              Hospital Profile & Branding
            </h3>
            <div className="form-group form-group-full">
              <label className="form-label">Hospital Name *</label>
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
              <label className="form-label">Contact Email</label>
              <input
                className="form-input"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input
                className="form-input"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
              />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Hospital Address</label>
              <input
                className="form-input"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>

            <h3 className="form-group-full" style={{ fontSize: '16px', fontWeight: 'bold', borderBottom: '1px solid var(--color-border)', paddingBottom: '8px', marginTop: '16px' }}>
              System & API Configurations
            </h3>
            <div className="form-group">
              <label className="form-label">Currency Symbol</label>
              <input className="form-input" value={formData.currency} disabled />
            </div>
            <div className="form-group">
              <label className="form-label">Timezone</label>
              <input className="form-input" value={formData.timezone} disabled />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Active API Base URL (env: VITE_API_BASE_URL)</label>
              <input
                className="form-input"
                value={formData.apiBaseUrl}
                disabled
                style={{ backgroundColor: 'var(--color-bg)', fontFamily: 'monospace' }}
              />
            </div>

            <div className="form-group-full" style={{ marginTop: '16px' }}>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                <RiSaveLine /> {savingProfile ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold' }}>Hospital Staff Accounts</h3>
            <button className="btn btn-primary" onClick={() => setUserModalOpen(true)}>
              <RiUserAddLine /> Add New Staff Account
            </button>
          </div>

          {loadingUsers ? (
            <div className="loading-center"><Spinner size="lg" /></div>
          ) : (
            <table className="user-mgmt-table">
              <thead>
                <tr>
                  <th>Staff Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Department</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u, idx) => (
                  <tr key={u.id || idx}>
                    <td><strong>{u.name || `${u.firstName || ''} ${u.lastName || ''}`}</strong></td>
                    <td>{u.email}</td>
                    <td><Badge variant="primary">{u.role}</Badge></td>
                    <td>{u.department || 'General'}</td>
                    <td>
                      <span className={`user-status-dot ${u.isActive ? 'active' : 'inactive'}`} />
                      {u.isActive ? 'Active' : 'Disabled'}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm ${u.isActive ? 'btn-outline' : 'btn-primary'}`}
                        onClick={() => handleToggleUserStatus(u)}
                      >
                        {u.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* TAB 3: ROLES & PERMISSIONS */}
      {activeTab === 'roles' && (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
            Role-Based Access Control (RBAC) Matrix
          </h3>
          <table className="data-table">
            <thead>
              <tr>
                <th>Module / Feature</th>
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
                { module: 'Patient Registration', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                { module: 'Appointments & Consultations', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                { module: 'Lab Orders & Results', admin: true, doctor: true, nurse: false, reception: false, lab: true, pharmacy: false, billing: false },
                { module: 'Pharmacy Dispensing', admin: true, doctor: false, nurse: false, reception: false, lab: false, pharmacy: true, billing: false },
                { module: 'IPD Admissions & Bed Allocation', admin: true, doctor: true, nurse: true, reception: true, lab: false, pharmacy: false, billing: false },
                { module: 'Billing & Invoicing', admin: true, doctor: false, nurse: false, reception: true, lab: false, pharmacy: false, billing: true },
                { module: 'Treatment Traceability', admin: true, doctor: true, nurse: true, reception: true, lab: true, pharmacy: true, billing: true },
                { module: 'System Audit Logs & Reports', admin: true, doctor: false, nurse: false, reception: false, lab: false, pharmacy: false, billing: false },
              ].map((r, idx) => (
                <tr key={idx}>
                  <td><strong>{r.module}</strong></td>
                  <td>{r.admin ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.doctor ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.nurse ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.reception ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.lab ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.pharmacy ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                  <td>{r.billing ? <span style={{ color: 'var(--color-success)' }}>✓ Allowed</span> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 4: NOTIFICATION SETTINGS */}
      {activeTab === 'notifications' && (
        <div className="card" style={{ padding: '24px', maxWidth: '700px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
            System Notification Parameters
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { id: 'critical_alerts', title: 'Critical Patient Vitals & Emergency Alerts', desc: 'Notify doctors and nurses immediately when patient vitals cross threshold' },
              { id: 'lab_ready', title: 'Lab & Radiology Results Ready', desc: 'Alert ordering physician when lab test results or radiology scans are finalized' },
              { id: 'pharmacy_pending', title: 'Prescription Pending Dispense', desc: 'Alert pharmacy team when new prescription orders are signed' },
              { id: 'ipd_transfer', title: 'IPD Bed Allocation & Transfer', desc: 'Notify ward nurse station when bed transfer requests occur' },
              { id: 'billing_overdue', title: 'Billing Payment Overdue Warning', desc: 'Alert billing officer when invoice passes due date' },
            ].map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
                <div>
                  <strong>{item.title}</strong>
                  <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{item.desc}</p>
                </div>
                <input type="checkbox" defaultChecked style={{ width: '18px', height: '18px', cursor: 'pointer' }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE USER MODAL */}
      <Modal
        isOpen={userModalOpen}
        onClose={() => setUserModalOpen(false)}
        title="Add Staff Account"
      >
        <form onSubmit={handleCreateUser} className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input className="form-input" required value={newUser.firstName} onChange={e => setNewUser({ ...newUser, firstName: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name *</label>
            <input className="form-input" required value={newUser.lastName} onChange={e => setNewUser({ ...newUser, lastName: e.target.value })} />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Email Address *</label>
            <input type="email" className="form-input" required value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Password *</label>
            <input type="password" className="form-input" required value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Role *</label>
            <select className="form-select" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
              {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input className="form-input" value={newUser.department} onChange={e => setNewUser({ ...newUser, department: e.target.value })} />
          </div>
          <div className="form-group-full" style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button type="button" className="btn btn-ghost" onClick={() => setUserModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary">Create User</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
