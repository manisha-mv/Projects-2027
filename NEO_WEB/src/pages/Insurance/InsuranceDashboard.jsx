// pages/Insurance/InsuranceDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiShieldLine,
  RiAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiShieldCheckLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiBuildingLine,
  RiEyeLine,
  RiFileSearchLine,
  RiMoneyDollarCircleLine,
  RiCloseCircleLine,
} from 'react-icons/ri';
import insuranceService, { CLAIM_STATUSES, INSURANCE_PROVIDERS } from '../../services/insuranceService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import ClaimDetailModal from '../../components/insurance/ClaimDetailModal';

const STATUS_VARIANT = {
  'Submitted':    'info',
  'Under Review': 'warning',
  'Approved':     'success',
  'Paid':         'success',
  'Rejected':     'danger',
  'Cancelled':    'danger',
};

const TAB_STATUS_MAP = {
  submitted:    'Submitted',
  review:       'Under Review',
  approved:     'Approved',
  paid:         'Paid',
  rejected:     'Rejected',
};

export default function InsuranceDashboard() {
  const { addToast } = useToast();
  const [claims, setClaims]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [providerFilter, setProviderFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [activeTab, setActiveTab]       = useState('all');
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [formData, setFormData] = useState({
    patientId:   'P10033',
    patientName: 'Sunita Iyer',
    provider:    'Star Health',
    policyNo:    'SH-2024-789012',
    claimAmount: 50000,
    notes:       'Hospitalization claim',
  });

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await insuranceService.getClaims({ search, status: statusFilter });
      let list = res.claims || [];
      if (providerFilter) list = list.filter(c => c.provider === providerFilter);
      setClaims(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, providerFilter]);

  useEffect(() => { fetchClaims(); }, [fetchClaims]);

  // ── KPI counts ──────────────────────────────────────────────────────────────
  const counts = {
    all:       claims.length,
    submitted: claims.filter(c => c.status === 'Submitted').length,
    review:    claims.filter(c => c.status === 'Under Review').length,
    approved:  claims.filter(c => c.status === 'Approved').length,
    paid:      claims.filter(c => c.status === 'Paid').length,
    rejected:  claims.filter(c => c.status === 'Rejected').length,
  };

  const totalClaimVal    = claims.reduce((s, c) => s + (c.claimAmount || 0), 0);
  const approvedCount    = counts.approved + counts.paid;
  const pendingCount     = counts.submitted + counts.review;

  const tabFiltered = activeTab === 'all'
    ? claims
    : claims.filter(c => c.status === TAB_STATUS_MAP[activeTab]);

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleSubmitClaim = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.policyNo) {
      addToast({ type: 'warning', title: 'Required', message: 'Patient name and policy number are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await insuranceService.submitClaim(formData);
      addToast({ type: 'success', title: 'Claim Submitted', message: 'Insurance claim submitted successfully.' });
      setIsSubmitModalOpen(false);
      fetchClaims();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdateStatus = async (claimId, status, approvedAmount = null) => {
    setActionLoading(true);
    try {
      await insuranceService.updateClaimStatus(claimId, status, approvedAmount);
      addToast({ type: 'success', title: 'Status Updated', message: `Claim status changed to ${status}` });
      if (selectedClaim) setSelectedClaim(null);
      fetchClaims();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ────────────────────────────────────────────────────────────
  const tableColumns = [
    {
      key: 'claimId',
      label: 'CLAIM ID',
      width: '140px',
      render: (val, row) => (
        <span
          className="patient-id-badge"
          style={{ cursor: 'pointer' }}
          onClick={() => setSelectedClaim(row)}
          title="Click to view claim details"
        >
          {val}
        </span>
      ),
    },
    {
      key: 'patientName',
      label: 'PATIENT',
      width: '200px',
      render: (val, row) => (
        <div className="table-patient-cell" style={{ cursor: 'pointer' }} onClick={() => setSelectedClaim(row)}>
          <Avatar name={val} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">ID: {row.patientId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'provider',
      label: 'INSURANCE PROVIDER',
      width: '180px',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiBuildingLine style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'policyNo',
      label: 'POLICY NO.',
      width: '160px',
      render: (val) => (
        <code style={{ fontSize: '12px', background: 'var(--color-surface-alt)', padding: '3px 8px', borderRadius: '5px', fontWeight: 600 }}>
          {val}
        </code>
      ),
    },
    {
      key: 'claimAmount',
      label: 'CLAIM AMOUNT',
      width: '140px',
      render: (val) => <span style={{ fontWeight: 700, fontSize: '14px' }}>₹{val?.toLocaleString('en-IN')}</span>,
    },
    {
      key: 'approvedAmount',
      label: 'APPROVED AMT',
      width: '140px',
      render: (val) => (
        <span style={{ fontWeight: 600, color: val ? 'var(--color-success)' : 'var(--color-text-muted)' }}>
          {val ? `₹${val.toLocaleString('en-IN')}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '130px',
      render: (val) => <Badge variant={STATUS_VARIANT[val] || 'secondary'} size="sm">{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '190px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          <Button variant="ghost" size="sm" onClick={() => setSelectedClaim(row)}>
            <RiEyeLine size={15} /> Details
          </Button>
          {row.status === 'Submitted' && (
            <Button variant="outline" size="sm" onClick={() => handleUpdateStatus(row.id || row.claimId, 'Under Review')} disabled={actionLoading}>
              Review
            </Button>
          )}
          {row.status === 'Under Review' && (
            <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(row.id || row.claimId, 'Approved', row.claimAmount)} disabled={actionLoading}>
              <RiCheckDoubleLine size={15} /> Approve
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page">
      {/* Page Header */}
      <PageHeader
        title="Insurance & Pre-Authorization"
        description="Manage health policies, TPA pre-authorization, claim approvals, and coverage logs."
        primaryAction={
          <>
            <Button variant="outline" onClick={fetchClaims} disabled={loading}>
              <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh
            </Button>
            <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)}>
              <RiAddLine size={18} /> Submit New Claim
            </Button>
          </>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <RiShieldLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Claims</div>
            <div className="stat-pill-value">{counts.all}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending TPA Review</div>
            <div className="stat-pill-value" style={{ color: '#F59E0B' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <RiShieldCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Approved / Paid</div>
            <div className="stat-pill-value" style={{ color: '#16A34A' }}>{approvedCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiMoneyDollarCircleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Claim Value</div>
            <div className="stat-pill-value" style={{ fontSize: '0.95rem' }}>₹{totalClaimVal.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search by Patient name, Claim ID, Policy No..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select
            className="form-select"
            style={{ width: 170, height: 38 }}
            value={providerFilter}
            onChange={e => setProviderFilter(e.target.value)}
          >
            <option value="">All Providers</option>
            {INSURANCE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 160, height: 38 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {CLAIM_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setProviderFilter(''); setStatusFilter(''); }}>
            <RiRefreshLine size={15} /> Reset
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Claims ({counts.all})
        </button>
        <button className={`tab-item ${activeTab === 'submitted' ? 'active' : ''}`} onClick={() => setActiveTab('submitted')}>
          Submitted ({counts.submitted})
        </button>
        <button className={`tab-item ${activeTab === 'review' ? 'active' : ''}`} onClick={() => setActiveTab('review')}>
          Under Review ({counts.review})
        </button>
        <button className={`tab-item ${activeTab === 'approved' ? 'active' : ''}`} onClick={() => setActiveTab('approved')}>
          Approved ({counts.approved})
        </button>
        <button className={`tab-item ${activeTab === 'paid' ? 'active' : ''}`} onClick={() => setActiveTab('paid')}>
          Paid ({counts.paid})
        </button>
        <button className={`tab-item ${activeTab === 'rejected' ? 'active' : ''}`} onClick={() => setActiveTab('rejected')}>
          Rejected ({counts.rejected})
        </button>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchClaims} />
      ) : (
        <Table
          columns={tableColumns}
          rows={tabFiltered}
          loading={loading}
          emptyTitle="No claims found"
          emptyDescription="No insurance claims match the current filters."
        />
      )}

      {/* Claim Detail Modal */}
      <ClaimDetailModal
        isOpen={!!selectedClaim}
        onClose={() => setSelectedClaim(null)}
        claim={selectedClaim}
        onUpdateStatus={handleUpdateStatus}
      />

      {/* Submit Claim Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit New Insurance Claim"
        size="md"
      >
        <form onSubmit={handleSubmitClaim} className="form-grid">
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Sunita Iyer"
              value={formData.patientName}
              onChange={e => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Patient ID</label>
            <input
              className="form-input"
              placeholder="e.g. P10033"
              value={formData.patientId}
              onChange={e => setFormData({ ...formData, patientId: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Insurance Provider *</label>
            <select
              className="form-select"
              value={formData.provider}
              onChange={e => setFormData({ ...formData, provider: e.target.value })}
            >
              {INSURANCE_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Policy Number *</label>
            <input
              className="form-input"
              placeholder="e.g. SH-2024-789012"
              value={formData.policyNo}
              onChange={e => setFormData({ ...formData, policyNo: e.target.value })}
              required
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Claim Amount (₹) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.claimAmount}
              onChange={e => setFormData({ ...formData, claimAmount: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Diagnosis / Pre-Auth Notes</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Detail reasons for hospitalization claim..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" type="button" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
