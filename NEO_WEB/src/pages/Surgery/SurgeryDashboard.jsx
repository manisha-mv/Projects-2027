// pages/Surgery/SurgeryDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiScissorsLine, RiAddLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri';
import surgeryService, { SURGERY_STATUSES, OT_ROOMS } from '../../services/surgeryService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';

import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function SurgeryDashboard() {
  const { addToast } = useToast();
  const [surgeries, setSurgeries] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [formData, setFormData]   = useState({
    patientName: '',
    patientId: 'P10028',
    procedure: 'Laparoscopic Cholecystectomy',
    surgeonName: 'Dr. Vikram Seth',
    otRoom: 'OT 1 - Major General',
    scheduledDate: new Date().toISOString().split('T')[0],
    scheduledTime: '10:00 AM'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchSurgeries = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await surgeryService.getSurgeries({ search, status: statusFilter });
      setSurgeries(res.surgeries || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchSurgeries();
  }, [fetchSurgeries]);

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.procedure) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Patient name and procedure are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await surgeryService.scheduleSurgery(formData);
      addToast({ type: 'success', title: 'Scheduled', message: 'Surgery scheduled successfully.' });
      setIsScheduleModalOpen(false);
      fetchSurgeries();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (surgeryId, status) => {
    setActionLoading(true);
    try {
      await surgeryService.updateStatus(surgeryId, status);
      addToast({ type: 'success', title: 'Updated', message: `Surgery status changed to ${status}.` });
      fetchSurgeries();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const scheduledCount = surgeries.filter(s => s.status === 'Scheduled').length;
  const inProgressCount = surgeries.filter(s => s.status === 'In Progress').length;
  const completedCount = surgeries.filter(s => s.status === 'Completed').length;

  const tableColumns = [
    {
      key: 'surgeryId',
      label: 'Surgery ID',
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
      key: 'procedure',
      label: 'Surgical Procedure',
      width: '240px',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-dark)' }}>✂️ {val}</span>,
    },
    {
      key: 'surgeonName',
      label: 'Surgeon & OT Room',
      width: '200px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Location: {row.otRoom}</div>
        </div>
      ),
    },
    {
      key: 'scheduledDate',
      label: 'Date & Slot',
      width: '150px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '12px' }}>{val}</div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{row.scheduledTime}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'Completed' ? 'success' : val === 'In Progress' ? 'warning' : 'info'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {row.status === 'Scheduled' && (
            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(row.id || row.surgeryId, 'In Progress')}>
              Start Procedure
            </Button>
          )}
          {row.status === 'In Progress' && (
            <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(row.id || row.surgeryId, 'Completed')}>
              Complete
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Surgery / OT Management"
        description="Schedule and track surgical procedures, OT room allocations, and pre/post-op care"
        primaryAction={
          <Button variant="primary" onClick={() => setIsScheduleModalOpen(true)}>
            <RiAddLine size={17} /> Schedule Surgery
          </Button>
        }
      />

      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiScissorsLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Procedures</div>
            <div className="stat-pill-value">{surgeries.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiScissorsLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Scheduled Today</div>
            <div className="stat-pill-value">{scheduledCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
            <RiScissorsLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">In Progress (OT)</div>
            <div className="stat-pill-value">{inProgressCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiScissorsLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Completed Today</div>
            <div className="stat-pill-value">{completedCount}</div>
          </div>
        </div>
      </div>

      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search procedure, patient, or surgeon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 170, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {SURGERY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchSurgeries} />
      ) : (
        <Table
          columns={tableColumns}
          rows={surgeries}
          loading={loading}
          emptyTitle="No surgeries found"
          emptyDescription="No surgical procedures match the selected search or status criteria."
        />
      )}

      <Modal
        isOpen={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule Surgery"
      >
        <form onSubmit={handleScheduleSubmit} className="form-grid">
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
            <label className="form-label">Procedure *</label>
            <input
              className="form-input"
              value={formData.procedure}
              onChange={(e) => setFormData({ ...formData, procedure: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Surgeon *</label>
            <input
              className="form-input"
              value={formData.surgeonName}
              onChange={(e) => setFormData({ ...formData, surgeonName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">OT Room</label>
            <select
              className="form-select"
              value={formData.otRoom}
              onChange={(e) => setFormData({ ...formData, otRoom: e.target.value })}
            >
              {OT_ROOMS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.scheduledDate}
              onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Time</label>
            <input
              type="time"
              className="form-input"
              value={formData.scheduledTime}
              onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsScheduleModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Schedule Surgery'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
