// pages/Discharge/DischargeDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiSendPlane2Line, RiRefreshLine, RiSearchLine } from 'react-icons/ri';
import dischargeService, { DISCHARGE_STATUSES } from '../../services/dischargeService';
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

export default function DischargeDashboard() {
  const { addToast } = useToast();
  const [discharges, setDischarges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedDischarge, setSelectedDischarge] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDischarges = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await dischargeService.getDischarges({ search, status: statusFilter });
      setDischarges(res.discharges || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchDischarges();
  }, [fetchDischarges]);

  const handleCompleteDischarge = async () => {
    if (!selectedDischarge) return;
    setActionLoading(true);
    try {
      await dischargeService.updateDischarge(selectedDischarge.id || selectedDischarge.dischargeId, { status: 'Completed' });
      addToast({ type: 'success', title: 'Discharge Completed', message: 'Patient discharge cleared and summary issued.' });
      setSelectedDischarge(null);
      fetchDischarges();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingCount = discharges.filter(d => d.status === 'Pending' || d.status === 'In Progress').length;
  const completedCount = discharges.filter(d => d.status === 'Completed').length;

  const tableColumns = [
    {
      key: 'dischargeId',
      label: 'Discharge ID',
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
      key: 'ward',
      label: 'Ward & Bed Location',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>🏥 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bed #{row.bed}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Attending Doctor',
      width: '180px',
      render: (val) => <span style={{ fontWeight: 500, fontSize: '13px' }}>{val}</span>,
    },
    {
      key: 'diagnosis',
      label: 'Primary Diagnosis',
      width: '220px',
      render: (val) => <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{val}</span>,
    },
    {
      key: 'scheduledDate',
      label: 'Discharge Date',
      width: '130px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (val) => (
        <Badge variant={val === 'Completed' ? 'success' : val === 'In Progress' ? 'info' : 'warning'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <Button variant="primary" size="sm" onClick={() => setSelectedDischarge(row)}>
          View Summary
        </Button>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Discharge Management"
        description="Process pending discharges, issue treatment summaries, and discharge instructions"
        primaryAction={
          <Button variant="outline" onClick={fetchDischarges} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Discharges
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiSendPlane2Line size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Discharge Cases</div>
            <div className="stat-pill-value">{discharges.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiSendPlane2Line size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending Clearances</div>
            <div className="stat-pill-value">{pendingCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiSendPlane2Line size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Discharged Today</div>
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
            placeholder="Search patient, diagnosis, or discharge ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 170, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {DISCHARGE_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchDischarges} />
      ) : (
        <Table
          columns={tableColumns}
          rows={discharges}
          loading={loading}
          emptyTitle="No discharge records"
          emptyDescription="No patient discharge records match your current criteria."
        />
      )}

      {selectedDischarge && (
        <Modal
          isOpen={!!selectedDischarge}
          onClose={() => setSelectedDischarge(null)}
          title={`Discharge Summary — ${selectedDischarge.patientName}`}
        >
          <div className="modal-body-content">
            <p><strong>Diagnosis:</strong> {selectedDischarge.diagnosis}</p>
            <p><strong>Treatment Given:</strong> {selectedDischarge.treatment}</p>
            <p><strong>Discharge Instructions:</strong> {selectedDischarge.instructions}</p>
            <h4 style={{ marginTop: '12px' }}>Discharge Medications</h4>
            <ul>
              {selectedDischarge.medications?.map((m, idx) => (
                <li key={idx}><strong>{m.name}</strong> — {m.dosage} ({m.frequency}) for {m.duration}</li>
              ))}
            </ul>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setSelectedDischarge(null)}>Close</button>
            {selectedDischarge.status !== 'Completed' && (
              <button className="btn btn-success" onClick={handleCompleteDischarge} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" /> : 'Finalize Discharge'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
