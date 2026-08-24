// pages/BloodBank/BloodBankDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiDropLine,
  RiAddLine,
  RiRefreshLine,
  RiAlertLine,
  RiCheckDoubleLine,
  RiPulseLine,
  RiFlaskLine,
  RiSearchLine,
} from 'react-icons/ri';
import bloodBankService, { BLOOD_GROUPS } from '../../services/bloodBankService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';

export default function BloodBankDashboard() {
  const { addToast } = useToast();
  const [inventory, setInventory] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory'); // 'inventory' | 'requests'
  const [search, setSearch] = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('All');

  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patientId: 'P10033',
    patientName: 'Sunita Iyer',
    bloodGroup: 'AB+',
    units: 1,
    urgency: 'STAT',
    requestedBy: 'Dr. Kiran Rao',
    notes: ''
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, reqRes] = await Promise.all([
        bloodBankService.getInventory(),
        bloodBankService.getRequests()
      ]);
      setInventory(invRes.inventory || []);
      setRequests(reqRes.requests || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleResetFilters = () => {
    setSearch('');
    setUrgencyFilter('All');
  };

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.units) {
      addToast({ type: 'warning', title: 'Required', message: 'Patient name and units requested are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await bloodBankService.requestBlood(formData);
      addToast({ type: 'success', title: 'Request Created', message: 'Blood request submitted successfully.' });
      setIsRequestModalOpen(false);
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssueBlood = async (reqId) => {
    setActionLoading(true);
    try {
      await bloodBankService.issueBlood(reqId);
      addToast({ type: 'success', title: 'Blood Issued', message: 'Blood units issued to patient.' });
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const totalUnitsAvailable = inventory.reduce((sum, item) => sum + (item.available || 0), 0);
  const totalReserved = inventory.reduce((sum, item) => sum + (item.reserved || 0), 0);
  const pendingReqs = requests.filter(r => r.status === 'Pending');
  const statReqs = pendingReqs.filter(r => r.urgency === 'STAT');

  const filteredRequests = requests.filter(r => {
    const matchesSearch = !search || r.patientName.toLowerCase().includes(search.toLowerCase()) || r.requestId.toLowerCase().includes(search.toLowerCase());
    const matchesUrgency = urgencyFilter === 'All' || r.urgency === urgencyFilter;
    return matchesSearch && matchesUrgency;
  });

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Blood Bank & Transfusion Unit"
        description="Live blood group availability, reserved emergency stocks, and rapid issue workflow."
        primaryAction={
          <Button variant="danger" onClick={() => setIsRequestModalOpen(true)}>
            <RiAddLine size={18} />
            Request Blood Unit
          </Button>
        }
      />

      {/* KPI Stats Strip (Matching Patients Page Screenshot 1) */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiDropLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Available Units</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{totalUnitsAvailable} Units</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiAlertLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending Requisitions</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{pendingReqs.length} Orders</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#991B1B' }}>
            <RiPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Emergency STAT Orders</div>
            <div className="stat-pill-value" style={{ color: '#991B1B' }}>{statReqs.length} STAT</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiFlaskLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Reserved & Cross-matched</div>
            <div className="stat-pill-value">{totalReserved} Units</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar (Matching Patients Page Screenshot 1) */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search transfusion requests by patient name, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Urgency:</span>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Urgencies</option>
              <option value="STAT">⚡ STAT Emergency</option>
              <option value="Urgent">Urgent</option>
              <option value="Routine">Routine</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="module-tabs" style={{ marginBottom: '20px' }}>
        <button
          className={`module-tab ${activeTab === 'inventory' ? 'active' : ''}`}
          onClick={() => setActiveTab('inventory')}
        >
          <RiDropLine /> Blood Group Inventory Cards
        </button>
        <button
          className={`module-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <RiPulseLine /> Transfusion Requisitions ({filteredRequests.length})
          {statReqs.length > 0 && (
            <span className="badge badge-error" style={{ marginLeft: '6px', fontSize: '10px' }}>
              {statReqs.length} STAT
            </span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="loading-center" style={{ minHeight: '240px' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === 'inventory' ? (
        <div className="blood-group-grid">
          {inventory.map((item) => {
            const isLow = item.available <= 2;
            const isCritical = item.available === 0;
            const stockPct = Math.min(100, Math.round((item.available / 8) * 100));

            return (
              <div
                key={item.bloodGroup}
                className={`blood-group-card ${isCritical ? 'critical' : ''}`}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div className="blood-group-badge">{item.bloodGroup}</div>
                  <Badge variant={isCritical ? 'danger' : isLow ? 'warning' : 'success'} size="sm">
                    {item.available > 0 ? `${item.available} Available` : 'Out of Stock'}
                  </Badge>
                </div>

                <div className="stock-meter-bg">
                  <div
                    className={`stock-meter-fill ${isCritical ? 'low' : isLow ? 'moderate' : 'healthy'}`}
                    style={{ width: `${Math.max(6, stockPct)}%` }}
                  />
                </div>

                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
                  <span>Total Stock: <strong>{item.units}</strong></span>
                  <span>Reserved: <strong>{item.reserved}</strong></span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        filteredRequests.length === 0 ? (
          <EmptyState icon={<RiDropLine />} title="No Blood Requests" subtitle="No pending or past blood requisitions found." />
        ) : (
          <div className="table-card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>REQUEST ID</th>
                  <th>PATIENT NAME</th>
                  <th>BLOOD GROUP</th>
                  <th>UNITS</th>
                  <th>URGENCY</th>
                  <th>REQUESTED BY</th>
                  <th>STATUS</th>
                  <th style={{ textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((req) => (
                  <tr key={req.id || req.requestId} style={{ background: req.urgency === 'STAT' && req.status === 'Pending' ? '#FEF2F2' : 'transparent' }}>
                    <td>
                      <span className="patient-id-badge">{req.requestId}</span>
                    </td>
                    <td>
                      <div className="table-patient-cell">
                        <Avatar name={req.patientName} size="sm" />
                        <div>
                          <div className="table-patient-name">{req.patientName}</div>
                          <div className="table-patient-sub">ID: {req.patientId}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <Badge variant="error" size="sm">
                        {req.bloodGroup}
                      </Badge>
                    </td>
                    <td><strong>{req.units} Unit(s)</strong></td>
                    <td>
                      <Badge variant={req.urgency === 'STAT' ? 'danger' : req.urgency === 'Urgent' ? 'warning' : 'secondary'} size="sm">
                        {req.urgency === 'STAT' ? '⚡ STAT Emergency' : req.urgency}
                      </Badge>
                    </td>
                    <td>{req.requestedBy}</td>
                    <td>
                      <Badge variant={req.status === 'Issued' ? 'success' : 'warning'} size="sm">
                        {req.status}
                      </Badge>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {req.status === 'Pending' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleIssueBlood(req.id || req.requestId)}
                          disabled={actionLoading}
                        >
                          <RiCheckDoubleLine size={16} /> Issue Blood
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      )}

      {/* Blood Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Create Blood Transfusion Requisition"
        size="md"
      >
        <form onSubmit={handleRequestSubmit} className="form-grid">
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
            <label className="form-label">Blood Group *</label>
            <select
              className="form-select"
              value={formData.bloodGroup}
              onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
            >
              {BLOOD_GROUPS.map(bg => <option key={bg} value={bg}>{bg}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Units Required *</label>
            <input
              type="number"
              min={1}
              className="form-input"
              value={formData.units}
              onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value, 10) || 1 })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Urgency Level *</label>
            <select
              className="form-select"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
            >
              <option value="Routine">Routine</option>
              <option value="Urgent">Urgent</option>
              <option value="STAT">STAT (Immediate Emergency)</option>
            </select>
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Attending Doctor / Clinical Notes</label>
            <input
              className="form-input"
              placeholder="Requested by Dr. Kiran Rao..."
              value={formData.requestedBy}
              onChange={(e) => setFormData({ ...formData, requestedBy: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsRequestModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-danger" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Submit Blood Requisition'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

