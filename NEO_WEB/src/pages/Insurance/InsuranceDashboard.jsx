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
  RiUserHeartLine,
} from 'react-icons/ri';
import insuranceService, { CLAIM_STATUSES, INSURANCE_PROVIDERS } from '../../services/insuranceService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import ClaimDetailModal from '../../components/insurance/ClaimDetailModal';

export default function InsuranceDashboard() {
  const { addToast } = useToast();
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [providerFilter, setProviderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedClaim, setSelectedClaim] = useState(null);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: 'P10033',
    patientName: 'Sunita Iyer',
    provider: 'Star Health',
    policyNo: 'SH-2024-789012',
    claimAmount: 50000,
    notes: 'Hospitalization claim'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchClaims = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterStatus = statusFilter === 'All' ? '' : statusFilter;
      const res = await insuranceService.getClaims({ search, status: filterStatus });
      let list = res.claims || [];
      if (providerFilter !== 'All') {
        list = list.filter(c => c.provider === providerFilter);
      }
      setClaims(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, providerFilter]);

  useEffect(() => {
    fetchClaims();
  }, [fetchClaims]);

  const handleResetFilters = () => {
    setSearch('');
    setProviderFilter('All');
    setStatusFilter('All');
  };

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

  const approvedCount = claims.filter(c => c.status === 'Approved' || c.status === 'Paid').length;
  const pendingCount = claims.filter(c => c.status === 'Under Review' || c.status === 'Submitted').length;
  const totalClaimVal = claims.reduce((acc, c) => acc + (c.claimAmount || 0), 0);

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Insurance & Pre-Authorization"
        description="Manage health policies, TPA pre-authorization, claim approvals, and coverage logs."
        primaryAction={
          <Button variant="primary" onClick={() => setIsSubmitModalOpen(true)}>
            <RiAddLine size={18} />
            Submit New Claim
          </Button>
        }
      />

      {/* KPI Stats Strip (Matching Patients Page Screenshot 1) */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiShieldLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Claims Submitted</div>
            <div className="stat-pill-value">{claims.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending TPA Review</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{pendingCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiShieldCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Approved / Paid Claims</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{approvedCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiBuildingLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Claim Value</div>
            <div className="stat-pill-value" style={{ fontSize: '1rem' }}>₹{totalClaimVal.toLocaleString('en-IN')}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar (Matching Patients Page Screenshot 1) */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, or Policy Number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Provider:</span>
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Providers</option>
              {INSURANCE_PROVIDERS.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              {CLAIM_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Data Table (Matching Patients Page Screenshot 1) */}
      {loading ? (
        <div className="loading-center" style={{ minHeight: '240px' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchClaims} />
      ) : claims.length === 0 ? (
        <EmptyState icon={<RiShieldLine />} title="No Claims Found" subtitle="No insurance claims match your criteria." />
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>CLAIM ID</th>
                <th>PATIENT NAME</th>
                <th>PROVIDER</th>
                <th>POLICY NO</th>
                <th>CLAIM AMOUNT</th>
                <th>APPROVED AMOUNT</th>
                <th>STATUS</th>
                <th style={{ textAlign: 'right' }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((clm) => (
                <tr key={clm.id || clm.claimId}>
                  <td>
                    <span
                      className="patient-id-badge"
                      onClick={() => setSelectedClaim(clm)}
                      title="Click to view claim details"
                    >
                      {clm.claimId}
                    </span>
                  </td>
                  <td>
                    <div
                      className="table-patient-cell"
                      onClick={() => setSelectedClaim(clm)}
                      style={{ cursor: 'pointer' }}
                    >
                      <Avatar name={clm.patientName} size="sm" />
                      <div>
                        <div className="table-patient-name">{clm.patientName}</div>
                        <div className="table-patient-sub">ID: {clm.patientId}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{clm.provider}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '12px', background: 'var(--color-surface-alt)', padding: '2px 6px', borderRadius: '4px' }}>
                      {clm.policyNo}
                    </code>
                  </td>
                  <td style={{ fontWeight: 600 }}>₹{clm.claimAmount?.toLocaleString('en-IN')}</td>
                  <td style={{ color: clm.approvedAmount ? 'var(--color-success)' : 'var(--color-text-muted)', fontWeight: 600 }}>
                    {clm.approvedAmount ? `₹${clm.approvedAmount?.toLocaleString('en-IN')}` : '—'}
                  </td>
                  <td>
                    <Badge variant={clm.status === 'Approved' || clm.status === 'Paid' ? 'success' : clm.status === 'Under Review' ? 'warning' : 'info'} size="sm">
                      {clm.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedClaim(clm)}
                      >
                        <RiEyeLine size={16} /> Details
                      </Button>
                      {clm.status === 'Submitted' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleUpdateStatus(clm.id || clm.claimId, 'Under Review')}
                        >
                          Review
                        </Button>
                      )}
                      {clm.status === 'Under Review' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleUpdateStatus(clm.id || clm.claimId, 'Approved', clm.claimAmount)}
                        >
                          <RiCheckDoubleLine size={16} /> Approve
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Insurance Provider *</label>
            <select
              className="form-select"
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, policyNo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Claim Amount (₹) *</label>
            <input
              type="number"
              className="form-input"
              value={formData.claimAmount}
              onChange={(e) => setFormData({ ...formData, claimAmount: parseFloat(e.target.value) || 0 })}
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
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" onClick={() => setIsSubmitModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Submit Claim'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}



