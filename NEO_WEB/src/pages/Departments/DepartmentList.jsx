// pages/Departments/DepartmentList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiBuildingLine,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiEditLine,
  RiTeamLine,
  RiHotelBedLine,
  RiCheckboxCircleLine,
  RiPhoneLine,
} from 'react-icons/ri';
import departmentService from '../../services/departmentService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/common/PageHeader';

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active': return 'success';
    case 'inactive': return 'secondary';
    case 'maintenance': return 'warning';
    default: return 'neutral';
  }
};

export default function DepartmentList() {
  const { addToast } = useToast();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    head: 'Dr. Priya Sharma',
    beds: 20,
    phone: '+91 80 2234 0099',
    status: 'Active'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDepartments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await departmentService.getDepartments({ search });
      setDepartments(res.departments || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const handleOpenModal = (dept = null) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        head: dept.head,
        beds: dept.beds || 0,
        phone: dept.phone || '',
        status: dept.status || 'Active'
      });
    } else {
      setEditingDept(null);
      setFormData({ name: '', head: 'Dr. Priya Sharma', beds: 20, phone: '+91 80 2234 0099', status: 'Active' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name) {
      addToast({ type: 'warning', title: 'Required', message: 'Department name is required.' });
      return;
    }
    setActionLoading(true);
    try {
      if (editingDept) {
        await departmentService.updateDepartment(editingDept.id, formData);
        addToast({ type: 'success', title: 'Updated', message: 'Department updated successfully.' });
      } else {
        await departmentService.createDepartment(formData);
        addToast({ type: 'success', title: 'Created', message: 'New department created.' });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const activeDepts = departments.filter(d => d.status === 'Active').length;
  const totalBeds = departments.reduce((s, d) => s + (d.beds || 0), 0);
  const totalOccupied = departments.reduce((s, d) => s + (d.occupied || 0), 0);
  const totalStaff = departments.reduce((s, d) => s + (d.staffCount || 0), 0);

  const columns = [
    {
      key: 'id',
      label: 'DEPT ID',
      width: '110px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'name',
      label: 'DEPARTMENT NAME',
      width: '200px',
      render: (val, row) => (
        <div>
          <div className="table-patient-name">{val}</div>
          <div className="table-patient-sub">{row.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'head',
      label: 'DEPARTMENT HEAD',
      width: '190px',
      render: (val) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)', fontWeight: 500 }}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'staffCount',
      label: 'STAFF COUNT',
      width: '120px',
      render: (val) => (
        <span style={{ fontWeight: 600 }}>{val ?? 0} members</span>
      ),
    },
    {
      key: 'beds',
      label: 'BED CAPACITY',
      width: '130px',
      render: (val, row) => (
        <div>
          <span style={{ fontWeight: 600 }}>{val > 0 ? `${val} beds` : 'N/A'}</span>
          {val > 0 && (
            <div className="table-patient-sub">{row.occupied || 0} occupied</div>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '110px',
      render: (val) => (
        <Badge variant={getStatusVariant(val)} size="sm">{val || 'Active'}</Badge>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => handleOpenModal(row)} title="Edit Department">
            <RiEditLine size={16} /> Edit
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Hospital Departments"
        description="Manage clinical and administrative departments, heads, bed capacities, and staff assignments."
        primaryAction={
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <RiAddLine size={18} /> Add Department
          </Button>
        }
      />

      {/* KPI Strip */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiBuildingLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Departments</div>
            <div className="stat-pill-value">{departments.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckboxCircleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Active Departments</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{activeDepts}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTeamLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Staff Assigned</div>
            <div className="stat-pill-value">{totalStaff}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Bed Occupancy</div>
            <div className="stat-pill-value">{totalOccupied} / {totalBeds}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search department name or department head..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="patient-filters-group">
          <Button variant="ghost" size="sm" onClick={() => setSearch('')} title="Reset filters">
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchDepartments} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            rows={departments}
            loading={loading}
            emptyTitle="No departments found matching your search."
          />
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDept ? `Edit — ${editingDept.name}` : 'Add New Department'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Department Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Cardiology, Orthopaedics"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department Head</label>
            <input
              className="form-input"
              placeholder="e.g. Dr. Priya Sharma"
              value={formData.head}
              onChange={(e) => setFormData({ ...formData, head: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Bed Capacity</label>
            <input
              type="number"
              className="form-input"
              value={formData.beds}
              onChange={(e) => setFormData({ ...formData, beds: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input
              className="form-input"
              placeholder="+91 80 2234 0099"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : (editingDept ? 'Update Department' : 'Create Department')}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
