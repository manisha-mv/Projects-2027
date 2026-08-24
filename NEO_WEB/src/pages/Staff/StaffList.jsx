// pages/Staff/StaffList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiTeamLine,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiEditLine,
  RiUserHeartLine,
  RiCheckboxCircleLine,
  RiTimeLine,
  RiShieldLine,
} from 'react-icons/ri';
import staffService, { STAFF_ROLES, STAFF_STATUSES } from '../../services/staffService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/common/PageHeader';

const getRoleBadgeVariant = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'primary';
    case 'DOCTOR': return 'info';
    case 'NURSE': return 'success';
    case 'LAB': return 'warning';
    case 'PHARMACIST': return 'secondary';
    default: return 'neutral';
  }
};

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'on leave': return 'warning';
    case 'inactive': return 'secondary';
    default: return 'neutral';
  }
};

export default function StaffList() {
  const { addToast } = useToast();
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Administration',
    role: 'ADMIN',
    designation: 'Administrator',
    shift: 'General',
    status: 'Active'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await staffService.getStaff({ search, role: roleFilter });
      setStaffList(res.staff || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter]);

  useEffect(() => {
    fetchStaff();
  }, [fetchStaff]);

  const handleOpenModal = (staff = null) => {
    if (staff) {
      setEditingStaff(staff);
      setFormData({
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        department: staff.department,
        role: staff.role,
        designation: staff.designation || '',
        shift: staff.shift || 'General',
        status: staff.status || 'Active'
      });
    } else {
      setEditingStaff(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Administration',
        role: 'ADMIN',
        designation: 'Administrator',
        shift: 'General',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      addToast({ type: 'warning', title: 'Required', message: 'Name and email are required.' });
      return;
    }
    setActionLoading(true);
    try {
      if (editingStaff) {
        await staffService.updateStaff(editingStaff.id || editingStaff.staffId, formData);
        addToast({ type: 'success', title: 'Updated', message: 'Staff member updated.' });
      } else {
        await staffService.createStaff(formData);
        addToast({ type: 'success', title: 'Created', message: 'New staff member added.' });
      }
      setIsModalOpen(false);
      fetchStaff();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = () => {
    setSearch('');
    setRoleFilter('');
  };

  const activeCount = staffList.filter(s => s.status === 'Active').length;
  const onLeaveCount = staffList.filter(s => s.status === 'On Leave').length;
  const roleCount = new Set(staffList.map(s => s.role)).size;

  const columns = [
    {
      key: 'staffId',
      label: 'STAFF ID',
      width: '110px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'name',
      label: 'STAFF MEMBER',
      width: '220px',
      render: (val, row) => (
        <div className="table-patient-cell" onClick={() => handleOpenModal(row)} style={{ cursor: 'pointer' }}>
          <Avatar name={val} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'SYSTEM ROLE',
      width: '140px',
      render: (val) => <Badge variant={getRoleBadgeVariant(val)} size="sm">{val}</Badge>,
    },
    {
      key: 'department',
      label: 'DEPARTMENT',
      width: '170px',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{val}</span>
          <div className="table-patient-sub">{row.designation}</div>
        </div>
      ),
    },
    {
      key: 'phone',
      label: 'CONTACT',
      width: '150px',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {val || row.email || '—'}
        </span>
      ),
    },
    {
      key: 'shift',
      label: 'SHIFT',
      width: '110px',
      render: (val) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{val || 'General'}</span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '110px',
      render: (val) => <Badge variant={getStatusVariant(val)} size="sm">{val || 'Active'}</Badge>,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit Staff Member">
            <RiEditLine size={16} /> Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Staff Directory"
        description="Manage hospital employees, system roles, department assignments, and shift schedules."
        primaryAction={
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <RiAddLine size={18} /> Add Staff Member
          </Button>
        }
      />

      {/* KPI Strip */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiTeamLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Staff Members</div>
            <div className="stat-pill-value">{staffList.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckboxCircleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Currently Active</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{activeCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">On Leave</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{onLeaveCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiShieldLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Distinct Roles</div>
            <div className="stat-pill-value">{roleCount} roles</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by name, staff ID, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Role:</span>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Roles</option>
              {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleReset} title="Reset filters">
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchStaff} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            rows={staffList}
            loading={loading}
            emptyTitle="No staff members found matching your search."
          />
        </div>
      )}

      {/* Staff Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStaff ? `Edit — ${editingStaff.name}` : 'Add New Staff Member'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Dr. Arun Kumar"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-input"
              placeholder="staff@neohms.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">System Role *</label>
            <select
              className="form-select"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            >
              {STAFF_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Department</label>
            <input
              className="form-input"
              placeholder="e.g. Cardiology"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Designation</label>
            <input
              className="form-input"
              placeholder="e.g. Senior Consultant"
              value={formData.designation}
              onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input
              className="form-input"
              placeholder="+91 98765 43210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : (editingStaff ? 'Update Staff Member' : 'Add Staff Member')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
