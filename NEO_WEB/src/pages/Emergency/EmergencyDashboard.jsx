// pages/Emergency/EmergencyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiFirstAidKitLine, RiAddLine, RiSearchLine, RiRefreshLine, RiAlertLine } from 'react-icons/ri';
import emergencyService, { TRIAGE_LEVELS, EMERGENCY_STATUSES } from '../../services/emergencyService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function EmergencyDashboard() {
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [triageFilter, setTriageFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isRegModalOpen, setIsRegModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientName: '',
    age: 30,
    gender: 'Male',
    triage: 'P1 - Resuscitation',
    chiefComplaint: '',
    assignedDoctor: 'Dr. Vikram Seth',
    bedId: 'ER-01',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEmergencyCases = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await emergencyService.getCases({ search, triage: triageFilter, status: statusFilter });
      setPatients(res.cases || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, triageFilter, statusFilter]);

  useEffect(() => {
    fetchEmergencyCases();
  }, [fetchEmergencyCases]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.chiefComplaint) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Patient name and chief complaint are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await emergencyService.registerCase(formData);
      addToast({ type: 'success', title: 'Registered', message: `Emergency case registered for ${formData.patientName}.` });
      setIsRegModalOpen(false);
      fetchEmergencyCases();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setActionLoading(true);
    try {
      await emergencyService.updateCaseStatus(id, status);
      addToast({ type: 'success', title: 'Updated', message: `Case status updated to ${status}.` });
      fetchEmergencyCases();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const criticalCount = patients.filter(p => p.triage?.includes('P1')).length;
  const urgentCount = patients.filter(p => p.triage?.includes('P2')).length;

  const tableColumns = [
    {
      key: 'emergencyId',
      label: 'Emergency ID',
      width: '130px',
      render: (val) => <span className="patient-id-badge" style={{ background: '#FEE2E2', color: '#991B1B' }}>{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient Name & Demographics',
      width: '230px',
      render: (val, row) => (
        <div className="table-patient-cell">
          <Avatar name={val} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">{row.gender}, {row.age} yrs</div>
          </div>
        </div>
      ),
    },
    {
      key: 'triage',
      label: 'Triage Level',
      width: '160px',
      render: (val) => (
        <Badge variant={val?.includes('P1') ? 'danger' : val?.includes('P2') ? 'warning' : 'secondary'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'chiefComplaint',
      label: 'Chief Complaint',
      width: '220px',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '13px', color: '#991B1B' }}>🚨 {val}</span>,
    },
    {
      key: 'assignedDoctor',
      label: 'Doctor & Bed',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 500, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bed: {row.bedId || 'Unassigned'}</div>
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (val) => (
        <Badge variant={val === 'Under Treatment' ? 'warning' : val === 'Discharged' ? 'success' : 'info'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '170px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {row.status !== 'Discharged' && row.status !== 'Admitted' && (
            <>
              <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(row.id || row.emergencyId, 'Under Treatment')}>
                Treat
              </Button>
              <Button variant="secondary" size="sm" onClick={() => handleUpdateStatus(row.id || row.emergencyId, 'Discharged')}>
                Discharge
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Emergency Department"
        description="Manage emergency registrations, triage priority queue, and critical care cases"
        primaryAction={
          <Button variant="primary" onClick={() => setIsRegModalOpen(true)}>
            <RiAddLine size={17} /> Register Emergency Case
          </Button>
        }
      />

      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <RiAlertLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">P1 Critical Cases</div>
            <div className="stat-pill-value">{criticalCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiFirstAidKitLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">P2 Urgent Cases</div>
            <div className="stat-pill-value">{urgentCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiFirstAidKitLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Active Cases</div>
            <div className="stat-pill-value">{patients.length}</div>
          </div>
        </div>
      </div>

      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, complaint, or emergency ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 170, height: 38 }} value={triageFilter} onChange={(e) => setTriageFilter(e.target.value)}>
            <option value="">All Triage Levels</option>
            {TRIAGE_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <select className="form-select" style={{ width: 150, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {EMERGENCY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchEmergencyCases} />
      ) : (
        <Table
          columns={tableColumns}
          rows={patients}
          loading={loading}
          emptyTitle="No emergency cases"
          emptyDescription="No emergency patients match the current search or triage criteria."
        />
      )}

      <Modal
        isOpen={isRegModalOpen}
        onClose={() => setIsRegModalOpen(false)}
        title="Emergency Case Registration"
      >
        <form onSubmit={handleRegisterSubmit} className="form-grid">
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
            <label className="form-label">Age</label>
            <input
              type="number"
              className="form-input"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Triage Priority *</label>
            <select
              className="form-select"
              value={formData.triage}
              onChange={(e) => setFormData({ ...formData, triage: e.target.value })}
            >
              {TRIAGE_LEVELS.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Emergency Bed</label>
            <input
              className="form-input"
              value={formData.bedId}
              onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Chief Complaint *</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={formData.chiefComplaint}
              onChange={(e) => setFormData({ ...formData, chiefComplaint: e.target.value })}
              required
            />
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsRegModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Register Case'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
