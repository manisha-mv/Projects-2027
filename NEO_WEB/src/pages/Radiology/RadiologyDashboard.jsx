// pages/Radiology/RadiologyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiScanLine, RiFileTextLine, RiCheckLine, RiTimeLine, RiRefreshLine, RiSearchLine, RiAddLine } from 'react-icons/ri';
import { radiologyService, RADIOLOGY_STATUSES, RADIOLOGY_MODALITIES } from '../../services/radiologyService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

const STATUS_VARIANT = {
  'Ordered': 'secondary',
  'Scheduled': 'info',
  'In Progress': 'warning',
  'Scan Completed': 'secondary',
  'Report Entered': 'primary',
  'Verified': 'success',
  'Cancelled': 'danger',
};

export default function RadiologyDashboard() {
  const { addToast } = useToast();
  const [orders, setOrders]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modalityFilter, setModalityFilter] = useState('');
  const [activeTab, setActiveTab]       = useState('all');
  const [selectedOrder, setSelected]    = useState(null);
  const [reportModal, setReportModal]   = useState(false);
  const [report, setReport]             = useState('');
  const [impression, setImpression]     = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await radiologyService.getOrders({
        search,
        status: statusFilter,
        modality: modalityFilter,
        limit: 100,
      });
      setOrders(res.orders || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, modalityFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  // ── Tab counts ────────────────────────────────────────────────────────────
  const counts = {
    all:        orders.length,
    ordered:    orders.filter(o => o.status === 'Ordered').length,
    scheduled:  orders.filter(o => o.status === 'Scheduled').length,
    inprogress: orders.filter(o => o.status === 'In Progress').length,
    completed:  orders.filter(o => o.status === 'Scan Completed').length,
    report:     orders.filter(o => o.status === 'Report Entered').length,
    verified:   orders.filter(o => o.status === 'Verified').length,
    cancelled:  orders.filter(o => o.status === 'Cancelled').length,
  };

  const TAB_STATUS_MAP = {
    ordered: 'Ordered',
    scheduled: 'Scheduled',
    inprogress: 'In Progress',
    completed: 'Scan Completed',
    report: 'Report Entered',
    verified: 'Verified',
    cancelled: 'Cancelled',
  };

  const tabFiltered = activeTab === 'all'
    ? orders
    : orders.filter(o => o.status === TAB_STATUS_MAP[activeTab]);

  // ── Action handlers ───────────────────────────────────────────────────────
  const handleStatusUpdate = async (order, newStatus) => {
    setActionLoading(true);
    try {
      const extra = newStatus === 'Scan Completed'
        ? { completedAt: new Date().toISOString(), technician: 'Radiology Team' }
        : {};
      await radiologyService.updateStatus(order.id || order.orderId, newStatus, extra);
      addToast({ type: 'success', title: 'Status Updated', message: `Order moved to: ${newStatus}` });
      loadOrders();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleReport = async () => {
    if (!report.trim() || !impression.trim()) {
      addToast({ type: 'warning', title: 'Required', message: 'Please enter both report and impression.' });
      return;
    }
    setActionLoading(true);
    try {
      await radiologyService.enterReport(selectedOrder.id || selectedOrder.orderId, report, impression);
      addToast({ type: 'success', title: 'Report Entered', message: 'Radiology report saved successfully.' });
      setReportModal(false);
      setReport('');
      setImpression('');
      loadOrders();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerify = async (order) => {
    setActionLoading(true);
    try {
      await radiologyService.verifyReport(order.id || order.orderId, 'Dr. Vijay R');
      addToast({ type: 'success', title: 'Verified', message: 'Report verified and signed off.' });
      loadOrders();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  // ── Table columns ─────────────────────────────────────────────────────────
  const tableColumns = [
    {
      key: 'orderId',
      label: 'Order ID',
      width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '200px',
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
      key: 'modality',
      label: 'Modality & Region',
      width: '200px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>📷 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>🫀 {row.bodyPart || 'General'}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Requesting Doctor',
      width: '160px',
      render: (val) => <span style={{ fontSize: '13px', fontWeight: 500 }}>👨‍⚕️ {val}</span>,
    },
    {
      key: 'urgency',
      label: 'Priority',
      width: '100px',
      render: (val) => (
        <Badge variant={val === 'STAT' ? 'danger' : val === 'Urgent' ? 'warning' : 'secondary'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (val) => <Badge variant={STATUS_VARIANT[val] || 'secondary'}>{val}</Badge>,
    },
    {
      key: 'orderedDate',
      label: 'Date',
      width: '110px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{val}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '180px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
          {row.status === 'Ordered' && (
            <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(row, 'Scheduled')} disabled={actionLoading}>
              Schedule
            </Button>
          )}
          {row.status === 'Scheduled' && (
            <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(row, 'In Progress')} disabled={actionLoading}>
              Start Scan
            </Button>
          )}
          {row.status === 'In Progress' && (
            <Button variant="primary" size="sm" onClick={() => handleStatusUpdate(row, 'Scan Completed')} disabled={actionLoading}>
              Scan Done
            </Button>
          )}
          {row.status === 'Scan Completed' && (
            <Button variant="primary" size="sm" onClick={() => { setSelected(row); setReportModal(true); }} disabled={actionLoading}>
              Enter Report
            </Button>
          )}
          {row.status === 'Report Entered' && (
            <Button variant="secondary" size="sm" onClick={() => handleVerify(row)} disabled={actionLoading}>
              ✓ Verify
            </Button>
          )}
          {row.report && (
            <Button variant="ghost" size="sm" onClick={() => { setSelected(row); setReportModal(false); }}>
              View Report
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Radiology & Imaging"
        description="Manage imaging orders, scan scheduling, report entry and radiologist verification"
        primaryAction={
          <Button variant="outline" onClick={loadOrders} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Orders
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending / Scheduled</div>
            <div className="stat-pill-value">{counts.ordered + counts.scheduled}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <RiScanLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">In Progress Scans</div>
            <div className="stat-pill-value">{counts.inprogress}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}>
            <RiFileTextLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Awaiting Report Entry</div>
            <div className="stat-pill-value">{counts.completed + counts.report}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <RiCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Verified Reports</div>
            <div className="stat-pill-value">{counts.verified}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
            <RiScanLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Orders</div>
            <div className="stat-pill-value">{counts.all}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search by patient, order ID, modality or body region..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select
            className="form-select"
            style={{ width: 160, height: 38 }}
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            {RADIOLOGY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select
            className="form-select"
            style={{ width: 150, height: 38 }}
            value={modalityFilter}
            onChange={e => setModalityFilter(e.target.value)}
          >
            <option value="">All Modalities</option>
            {RADIOLOGY_MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Worklist Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All Orders ({counts.all})
        </button>
        <button className={`tab-item ${activeTab === 'ordered' ? 'active' : ''}`} onClick={() => setActiveTab('ordered')}>
          Ordered ({counts.ordered})
        </button>
        <button className={`tab-item ${activeTab === 'scheduled' ? 'active' : ''}`} onClick={() => setActiveTab('scheduled')}>
          Scheduled ({counts.scheduled})
        </button>
        <button className={`tab-item ${activeTab === 'inprogress' ? 'active' : ''}`} onClick={() => setActiveTab('inprogress')}>
          In Progress ({counts.inprogress})
        </button>
        <button className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Scan Done ({counts.completed})
        </button>
        <button className={`tab-item ${activeTab === 'report' ? 'active' : ''}`} onClick={() => setActiveTab('report')}>
          Report Entry ({counts.report})
        </button>
        <button className={`tab-item ${activeTab === 'verified' ? 'active' : ''}`} onClick={() => setActiveTab('verified')}>
          Verified ({counts.verified})
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={loadOrders} />
      ) : (
        <Table
          columns={tableColumns}
          rows={tabFiltered}
          loading={loading}
          emptyTitle="No radiology orders"
          emptyDescription="No imaging orders match the current filters."
        />
      )}

      {/* Enter Report Modal */}
      <Modal
        isOpen={reportModal}
        onClose={() => { setReportModal(false); setSelected(null); setReport(''); setImpression(''); }}
        title={`Enter Report — ${selectedOrder?.modality || ''} · ${selectedOrder?.bodyPart || ''}`}
      >
        <div className="form-grid">
          <div className="form-group form-group-full">
            <label className="form-label">Patient: {selectedOrder?.patientName} ({selectedOrder?.patientId})</label>
            <label className="form-label" style={{ marginTop: 12 }}>Report / Findings *</label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Detailed radiological findings…"
              value={report}
              onChange={e => setReport(e.target.value)}
            />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Impression / Conclusion *</label>
            <textarea
              className="form-textarea"
              rows={3}
              placeholder="Clinical impression and recommendation…"
              value={impression}
              onChange={e => setImpression(e.target.value)}
            />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setReportModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleReport} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" /> : 'Submit Report'}
          </button>
        </div>
      </Modal>

      {/* View Report Modal */}
      {selectedOrder?.report && !reportModal && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelected(null)}
          title={`Radiology Report — ${selectedOrder.modality} · ${selectedOrder.bodyPart}`}
        >
          <div className="result-view">
            <div className="result-meta" style={{ display: 'flex', gap: 24, marginBottom: 16, flexWrap: 'wrap' }}>
              <span><strong>Patient:</strong> {selectedOrder.patientName} ({selectedOrder.patientId})</span>
              <span><strong>Doctor:</strong> {selectedOrder.doctorName}</span>
              <span><strong>Date:</strong> {selectedOrder.orderedDate}</span>
              <span><strong>Status:</strong> <Badge variant={STATUS_VARIANT[selectedOrder.status]}>{selectedOrder.status}</Badge></span>
              {selectedOrder.radiologist && <span><strong>Radiologist:</strong> {selectedOrder.radiologist}</span>}
            </div>
            <div className="result-report">
              <h4 style={{ marginBottom: 8 }}>Findings</h4>
              <p style={{ lineHeight: 1.6, fontSize: '14px' }}>{selectedOrder.report}</p>
              <h4 style={{ marginTop: 16, marginBottom: 8 }}>Impression</h4>
              <p style={{ lineHeight: 1.6, fontSize: '14px', fontStyle: 'italic' }}>{selectedOrder.impression}</p>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
