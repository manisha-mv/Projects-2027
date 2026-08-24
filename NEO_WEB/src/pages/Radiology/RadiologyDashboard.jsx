// pages/Radiology/RadiologyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiScanLine, RiFileTextLine, RiCheckLine, RiTimeLine, RiRefreshLine, RiSearchLine } from 'react-icons/ri';
import { radiologyService, RADIOLOGY_STATUSES, RADIOLOGY_MODALITIES } from '../../services/radiologyService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';

const STATUS_VARIANT = {
  'Ordered': 'secondary', 'Scheduled': 'info', 'In Progress': 'warning',
  'Scan Completed': 'secondary', 'Report Entered': 'primary', 'Verified': 'success', 'Cancelled': 'danger',
};

import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function RadiologyDashboard() {
  const { addToast } = useToast();
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [statusFilter, setStatus]   = useState('');
  const [modalityFilter, setModality] = useState('');
  const [activeTab, setActiveTab]   = useState('all');
  const [selectedOrder, setSelected] = useState(null);
  const [reportModal, setReportModal] = useState(false);
  const [report, setReport]         = useState('');
  const [impression, setImpression] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetch = useCallback(async () => {
    setLoading(true); setError(null);
    try { const res = await radiologyService.getOrders({ search, status: statusFilter, modality: modalityFilter }); setOrders(res.orders || []); }
    catch (e) { setError(e.message); } finally { setLoading(false); }
  }, [search, statusFilter, modalityFilter]);

  useEffect(() => { fetch(); }, [fetch]);

  const counts = {
    all: orders.length,
    ordered: orders.filter(o => o.status === 'Ordered').length,
    scheduled: orders.filter(o => o.status === 'Scheduled').length,
    inprogress: orders.filter(o => o.status === 'In Progress').length,
    completed: orders.filter(o => o.status === 'Scan Completed').length,
    report: orders.filter(o => o.status === 'Report Entered').length,
    verified: orders.filter(o => o.status === 'Verified').length,
  };

  const tabMap = { all: orders, ordered: 'Ordered', scheduled: 'Scheduled', inprogress: 'In Progress', completed: 'Scan Completed', report: 'Report Entered', verified: 'Verified' };
  const tabFiltered = activeTab === 'all' ? orders : orders.filter(o => o.status === tabMap[activeTab]);

  const handleStatusUpdate = async (order, status) => {
    setActionLoading(true);
    try {
      await radiologyService.updateStatus(order.id || order.orderId, status, status === 'Scan Completed' ? { completedAt: new Date().toISOString(), technician: 'Radiology Team' } : {});
      addToast({ type: 'success', title: 'Status Updated', message: `Order moved to: ${status}` });
      fetch();
    } catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
    finally { setActionLoading(false); }
  };

  const handleReport = async () => {
    if (!report.trim() || !impression.trim()) { addToast({ type: 'warning', title: 'Required', message: 'Please enter both report and impression.' }); return; }
    setActionLoading(true);
    try {
      await radiologyService.enterReport(selectedOrder.id || selectedOrder.orderId, report, impression);
      addToast({ type: 'success', title: 'Report Entered', message: 'Radiology report saved successfully.' });
      setReportModal(false); setReport(''); setImpression(''); fetch();
    } catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async (order) => {
    setActionLoading(true);
    try { await radiologyService.verifyReport(order.id || order.orderId, 'Radiologist'); addToast({ type: 'success', title: 'Verified', message: 'Report verified.' }); fetch(); }
    catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
    finally { setActionLoading(false); }
  };

  const tableColumns = [
    {
      key: 'orderId',
      label: 'Order ID',
      width: '120px',
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
      key: 'modality',
      label: 'Modality & Body Region',
      width: '220px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary)' }}>📷 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Region: {row.bodyPart || 'General'}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Requesting Doctor',
      width: '160px',
      render: (val) => <span style={{ fontSize: '13px', fontWeight: 500 }}>{val}</span>,
    },
    {
      key: 'urgency',
      label: 'Priority',
      width: '110px',
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
      label: 'Ordered Date',
      width: '120px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{val}</span>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '160px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
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
              Verify
            </Button>
          )}
          {row.report && (
            <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
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
        title="Radiology"
        description="Manage imaging orders, scheduling, and report entry"
        primaryAction={
          <Button variant="outline" onClick={fetch} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Orders
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending / Scheduled</div>
            <div className="stat-pill-value">{counts.ordered + counts.scheduled}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiScanLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">In Progress Scans</div>
            <div className="stat-pill-value">{counts.inprogress}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
            <RiFileTextLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Awaiting Report</div>
            <div className="stat-pill-value">{counts.report}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Verified Scans</div>
            <div className="stat-pill-value">{counts.verified}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, modality, body region, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 160, height: 38 }} value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {RADIOLOGY_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 150, height: 38 }} value={modalityFilter} onChange={e => setModality(e.target.value)}>
            <option value="">All Modalities</option>
            {RADIOLOGY_MODALITIES.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>

      {/* Worklist Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({counts.all})
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
        <ErrorState message={error} onRetry={fetch} />
      ) : (
        <Table
          columns={tableColumns}
          rows={tabFiltered}
          loading={loading}
          emptyTitle="No radiology orders"
          emptyDescription="No imaging orders match the current filters."
        />
      )}

      <Modal isOpen={reportModal} onClose={() => { setReportModal(false); setSelected(null); setReport(''); setImpression(''); }} title={`Enter Report — ${selectedOrder?.modality || ''} ${selectedOrder?.bodyPart || ''}`}>
        <div className="form-grid">
          <div className="form-group form-group-full"><label className="form-label">Report / Findings *</label><textarea className="form-textarea" rows={5} placeholder="Detailed findings…" value={report} onChange={e => setReport(e.target.value)} /></div>
          <div className="form-group form-group-full"><label className="form-label">Impression / Conclusion *</label><textarea className="form-textarea" rows={3} placeholder="Clinical impression…" value={impression} onChange={e => setImpression(e.target.value)} /></div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setReportModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleReport} disabled={actionLoading}>{actionLoading ? <Spinner size="sm" /> : 'Submit Report'}</button>
        </div>
      </Modal>

      {selectedOrder?.report && !reportModal && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelected(null)} title={`Report — ${selectedOrder.modality} ${selectedOrder.bodyPart}`}>
          <div className="result-view">
            <div className="result-meta"><span><strong>Patient:</strong> {selectedOrder.patientName}</span><span><strong>Status:</strong> <Badge variant={STATUS_VARIANT[selectedOrder.status]}>{selectedOrder.status}</Badge></span></div>
            <div className="result-report"><h4>Findings</h4><p>{selectedOrder.report}</p><h4 style={{marginTop: 12}}>Impression</h4><p>{selectedOrder.impression}</p></div>
          </div>
          <div className="modal-footer"><button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button></div>
        </Modal>
      )}
    </div>
  );
}
