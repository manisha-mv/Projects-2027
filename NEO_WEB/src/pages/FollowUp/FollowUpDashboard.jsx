// pages/FollowUp/FollowUpDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiPulseLine, RiAddLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri';
import followupService, { FOLLOWUP_STATUSES } from '../../services/followupService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';

import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function FollowUpDashboard() {
  const { addToast } = useToast();
  const [followups, setFollowups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: 'P10025',
    patientName: 'Arun Kumar',
    doctorId: 'D001',
    doctorName: 'Dr. Priya Sharma',
    department: 'General Medicine',
    scheduledDate: new Date().toISOString().split('T')[0],
    reason: 'Routine BP follow-up'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchFollowups = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await followupService.getFollowups({ search, status: statusFilter });
      setFollowups(res.followups || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.reason) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Patient name and reason are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await followupService.createFollowup(formData);
      addToast({ type: 'success', title: 'Follow-up Scheduled', message: 'Follow-up appointment scheduled.' });
      setIsAddModalOpen(false);
      fetchFollowups();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkComplete = async (id) => {
    setActionLoading(true);
    try {
      await followupService.markComplete(id);
      addToast({ type: 'success', title: 'Completed', message: 'Follow-up marked as completed.' });
      fetchFollowups();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const scheduledCount = followups.filter(f => f.status === 'Scheduled').length;
  const overdueCount = followups.filter(f => f.status === 'Overdue').length;
  const completedCount = followups.filter(f => f.status === 'Completed').length;

  const tableColumns = [
    {
      key: 'followupId',
      label: 'Follow-up ID',
      width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient Name',
      width: '220px',
      render: (val, row) => (
        <div className="table-patient-cell">
          <Avatar name={val} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">ID: {row.patientId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Doctor & Department',
      width: '200px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Scheduled Date',
      width: '130px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)', fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'reason',
      label: 'Follow-up Reason',
      width: '240px',
      render: (val) => <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-primary-dark)' }}>📋 {val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'Completed' ? 'success' : val === 'Overdue' ? 'danger' : 'info'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '150px',
      align: 'right',
      render: (_, row) => (
        row.status !== 'Completed' ? (
          <Button variant="secondary" size="sm" onClick={() => handleMarkComplete(row.id || row.followupId)} disabled={actionLoading}>
            Mark Done
          </Button>
        ) : (
          <Button variant="ghost" size="sm" disabled>
            Completed
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Patient Follow-up"
        description="Track upcoming, overdue, and completed patient follow-up appointments"
        primaryAction={
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <RiAddLine size={17} /> Schedule Follow-up
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Follow-ups</div>
            <div className="stat-pill-value">{followups.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Scheduled</div>
            <div className="stat-pill-value">{scheduledCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <RiPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Overdue</div>
            <div className="stat-pill-value">{overdueCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Completed</div>
            <div className="stat-pill-value">{completedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, reason, or doctor..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 170, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {FOLLOWUP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchFollowups} />
      ) : (
        <Table
          columns={tableColumns}
          rows={followups}
          loading={loading}
          emptyTitle="No follow-ups found"
          emptyDescription="No follow-up records match the current criteria."
        />
      )}

      {/* Schedule Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Schedule Follow-up Appointment"
      >
        <form onSubmit={handleAddSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input
              className="form-input"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Doctor Name</label>
            <input
              className="form-input"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Scheduled Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Reason *</label>
            <input
              className="form-input"
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              required
            />
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsAddModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
