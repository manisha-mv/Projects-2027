// pages/Complaints/ComplaintDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiAlertLine,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiEyeLine,
  RiCheckDoubleLine,
  RiTimeLine,
  RiErrorWarningLine,
  RiFileTextLine,
} from 'react-icons/ri';
import complaintService, { COMPLAINT_STATUSES, COMPLAINT_CATEGORIES } from '../../services/complaintService';
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

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'resolved': return 'success';
    case 'escalated': return 'error';
    case 'under review': return 'warning';
    case 'open': return 'info';
    default: return 'neutral';
  }
};

const getPriorityVariant = (priority) => {
  switch (priority?.toLowerCase()) {
    case 'critical': return 'error';
    case 'high': return 'error';
    case 'medium': return 'warning';
    case 'low': return 'secondary';
    default: return 'neutral';
  }
};

export default function ComplaintDashboard() {
  const { addToast } = useToast();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: 'Arun Kumar',
    category: 'Waiting Time',
    priority: 'Medium',
    subject: '',
    description: ''
  });

  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [resolutionText, setResolutionText] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await complaintService.getComplaints({ search, status: statusFilter });
      setComplaints(res.complaints || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  const handleReset = () => {
    setSearch('');
    setStatusFilter('');
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.description) {
      addToast({ type: 'warning', title: 'Required', message: 'Subject and description are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await complaintService.createComplaint(formData);
      addToast({ type: 'success', title: 'Submitted', message: 'New complaint logged successfully.' });
      setIsAddModalOpen(false);
      fetchComplaints();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolve = async () => {
    if (!selectedComplaint || !resolutionText.trim()) return;
    setActionLoading(true);
    try {
      await complaintService.updateComplaint(selectedComplaint.id || selectedComplaint.complaintId, {
        status: 'Resolved',
        resolution: resolutionText
      });
      addToast({ type: 'success', title: 'Resolved', message: 'Complaint has been resolved.' });
      setSelectedComplaint(null);
      setResolutionText('');
      fetchComplaints();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // KPI counts
  const openCount = complaints.filter(c => c.status === 'Open').length;
  const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
  const escalatedCount = complaints.filter(c => c.status === 'Escalated').length;

  const columns = [
    {
      key: 'complaintId',
      label: 'COMPLAINT ID',
      width: '140px',
      render: (val, row) => (
        <span className="patient-id-badge" onClick={() => setSelectedComplaint(row)} style={{ cursor: 'pointer' }} title="Click to investigate">
          {val}
        </span>
      ),
    },
    {
      key: 'patientName',
      label: 'REPORTED BY',
      width: '200px',
      render: (val, row) => (
        <div className="table-patient-cell" onClick={() => setSelectedComplaint(row)} style={{ cursor: 'pointer' }}>
          <Avatar name={val || 'Anonymous'} size="sm" />
          <div>
            <div className="table-patient-name">{val || 'Anonymous'}</div>
            <div className="table-patient-sub">{row.category}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'COMPLAINT SUBJECT',
      render: (val) => (
        <span style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>{val}</span>
      ),
    },
    {
      key: 'priority',
      label: 'PRIORITY',
      width: '110px',
      render: (val) => <Badge variant={getPriorityVariant(val)} size="sm">{val}</Badge>,
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '130px',
      render: (val) => <Badge variant={getStatusVariant(val)} size="sm">{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '160px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedComplaint(row)} title="Investigate complaint">
            <RiEyeLine size={16} /> View
          </Button>
          {row.status !== 'Resolved' && (
            <Button variant="primary" size="sm" onClick={() => setSelectedComplaint(row)} title="Resolve complaint">
              <RiCheckDoubleLine size={16} /> Resolve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Complaint Management"
        description="Track, investigate, and resolve patient and staff feedback and grievances."
        primaryAction={
          <Button variant="primary" onClick={() => setIsAddModalOpen(true)}>
            <RiAddLine size={18} /> Log New Complaint
          </Button>
        }
      />

      {/* KPI Strip */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiFileTextLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Complaints</div>
            <div className="stat-pill-value">{complaints.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Open / Pending</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{openCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Resolved</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{resolvedCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiErrorWarningLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Escalated</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{escalatedCount}</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by patient name, complaint subject..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="">All Statuses</option>
              {COMPLAINT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleReset} title="Reset filters">
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchComplaints} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            rows={complaints}
            loading={loading}
            emptyTitle="No complaint tickets found matching your criteria."
          />
        </div>
      )}

      {/* Log Complaint Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Log New Patient Complaint"
        size="md"
      >
        <form onSubmit={handleAddSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Patient Name</label>
            <input
              className="form-input"
              placeholder="e.g. Arun Kumar"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Complaint Category</label>
            <select
              className="form-select"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            >
              {COMPLAINT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Complaint Subject *</label>
            <input
              className="form-input"
              placeholder="Brief one-line summary of the complaint"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              required
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Detailed Description *</label>
            <textarea
              className="form-textarea"
              rows={4}
              placeholder="Describe the complaint in detail..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" type="button" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Submit Complaint'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Investigate / Resolve Modal */}
      {selectedComplaint && (
        <Modal
          isOpen={!!selectedComplaint}
          onClose={() => { setSelectedComplaint(null); setResolutionText(''); }}
          title={`Investigate — ${selectedComplaint.complaintId}`}
          size="md"
        >
          <div className="modal-body-content">
            <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={selectedComplaint.patientName || 'Anonymous'} size="sm" />
                  <div>
                    <strong style={{ fontSize: '14px' }}>{selectedComplaint.patientName || 'Anonymous'}</strong>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{selectedComplaint.category}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <Badge variant={getPriorityVariant(selectedComplaint.priority)} size="sm">{selectedComplaint.priority}</Badge>
                  <Badge variant={getStatusVariant(selectedComplaint.status)} size="sm">{selectedComplaint.status}</Badge>
                </div>
              </div>
              <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '8px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Subject:</div>
                <div style={{ fontSize: '13px', marginBottom: '12px' }}>{selectedComplaint.subject}</div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px' }}>Description:</div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{selectedComplaint.description}</div>
              </div>
              {selectedComplaint.resolution && (
                <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px', marginTop: '12px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '4px', color: 'var(--color-success)' }}>Resolution Applied:</div>
                  <div style={{ fontSize: '13px' }}>{selectedComplaint.resolution}</div>
                </div>
              )}
            </div>

            {selectedComplaint.status !== 'Resolved' && (
              <div className="form-group">
                <label className="form-label">Resolution Details *</label>
                <textarea
                  className="form-textarea"
                  rows={4}
                  placeholder="Enter corrective action taken, resolution steps..."
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                />
              </div>
            )}
          </div>

          <div className="modal-footer">
            <Button variant="ghost" onClick={() => { setSelectedComplaint(null); setResolutionText(''); }}>Close</Button>
            {selectedComplaint.status !== 'Resolved' && (
              <Button variant="primary" onClick={handleResolve} disabled={actionLoading || !resolutionText.trim()}>
                {actionLoading ? <Spinner size="sm" /> : <><RiCheckDoubleLine size={16} /> Mark as Resolved</>}
              </Button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
