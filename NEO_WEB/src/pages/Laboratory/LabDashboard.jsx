// pages/Laboratory/LabDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiFlaskLine, RiTestTubeLine, RiCheckDoubleLine, RiTimeLine, RiAlertLine, RiAddLine, RiRefreshLine, RiSearchLine } from 'react-icons/ri';
import { laboratoryService, LAB_ORDER_STATUSES, URGENCY_TYPES } from '../../services/laboratoryService';
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

const STATUS_VARIANT = {
  'Pending': 'warning',
  'Sample Collected': 'info',
  'Processing': 'info',
  'Result Entered': 'secondary',
  'Verified': 'success',
  'Completed': 'success',
  'Cancelled': 'danger',
};

const URGENCY_VARIANT = {
  'Routine': 'secondary',
  'Urgent': 'warning',
  'STAT': 'danger',
};

export default function LabDashboard() {
  const { addToast } = useToast();
  const [orders, setOrders]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [search, setSearch]       = useState('');
  const [statusFilter, setStatus] = useState('');
  const [urgencyFilter, setUrgency] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [selectedOrder, setSelected] = useState(null);
  const [resultModal, setResultModal] = useState(false);
  const [resultText, setResultText]   = useState('');
  const [resultValue, setResultValue] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await laboratoryService.getLabOrders({ search, status: statusFilter, urgency: urgencyFilter });
      setOrders(res.orders || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, statusFilter, urgencyFilter]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const tabCounts = {
    all: orders.length,
    pending: orders.filter(o => o.status === 'Pending').length,
    collection: orders.filter(o => o.status === 'Sample Collected').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    entry: orders.filter(o => o.status === 'Result Entered').length,
    completed: orders.filter(o => ['Verified', 'Completed'].includes(o.status)).length,
  };

  const tabFiltered = activeTab === 'all' ? orders :
    activeTab === 'pending'     ? orders.filter(o => o.status === 'Pending') :
    activeTab === 'collection'  ? orders.filter(o => o.status === 'Sample Collected') :
    activeTab === 'processing'  ? orders.filter(o => o.status === 'Processing') :
    activeTab === 'entry'       ? orders.filter(o => o.status === 'Result Entered') :
    orders.filter(o => ['Verified', 'Completed'].includes(o.status));

  const handleCollect = async (order) => {
    setActionLoading(true);
    try {
      await laboratoryService.collectSample(order.id || order.orderId);
      addToast({ type: 'success', title: 'Sample Collected', message: `Sample collected for ${order.testName}` });
      fetchOrders();
    } catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
    finally { setActionLoading(false); }
  };

  const handleEnterResult = async () => {
    if (!resultText.trim() || !resultValue.trim()) { addToast({ type: 'warning', title: 'Required', message: 'Please enter result value and report.' }); return; }
    setActionLoading(true);
    try {
      await laboratoryService.enterResult(selectedOrder.id || selectedOrder.orderId, { value: resultValue, report: resultText });
      addToast({ type: 'success', title: 'Result Entered', message: `Result entered for ${selectedOrder.testName}` });
      setResultModal(false); setResultText(''); setResultValue('');
      fetchOrders();
    } catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async (order) => {
    setActionLoading(true);
    try {
      await laboratoryService.verifyResult(order.id || order.orderId);
      addToast({ type: 'success', title: 'Result Verified', message: `${order.testName} result verified` });
      fetchOrders();
    } catch (e) { addToast({ type: 'error', title: 'Error', message: e.message }); }
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
      key: 'testName',
      label: 'Diagnostic Test & Specimen',
      width: '240px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-dark)' }}>🧪 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Sample: {row.sampleType || 'Blood'}</div>
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
      render: (val) => <Badge variant={URGENCY_VARIANT[val] || 'secondary'}>{val}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
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
      width: '150px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          {row.status === 'Pending' && (
            <Button variant="outline" size="sm" onClick={() => handleCollect(row)} disabled={actionLoading}>
              Collect Sample
            </Button>
          )}
          {['Sample Collected', 'Processing'].includes(row.status) && (
            <Button variant="primary" size="sm" onClick={() => { setSelected(row); setResultModal(true); }} disabled={actionLoading}>
              Enter Result
            </Button>
          )}
          {row.status === 'Result Entered' && (
            <Button variant="secondary" size="sm" onClick={() => handleVerify(row)} disabled={actionLoading}>
              Verify Result
            </Button>
          )}
          {(row.status === 'Verified' || row.status === 'Completed') && (
            <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>
              View Result
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Laboratory"
        description="Manage test orders, sample collection, and result entry"
        primaryAction={
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
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
            <div className="stat-pill-label">Pending Orders</div>
            <div className="stat-pill-value">{tabCounts.pending}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiTestTubeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">In Progress</div>
            <div className="stat-pill-value">{tabCounts.collection + tabCounts.processing}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}>
            <RiFlaskLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Awaiting Verification</div>
            <div className="stat-pill-value">{tabCounts.entry}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Completed Today</div>
            <div className="stat-pill-value">{tabCounts.completed}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, test name, or order ID..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 160, height: 38 }} value={statusFilter} onChange={e => setStatus(e.target.value)}>
            <option value="">All Statuses</option>
            {LAB_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select className="form-select" style={{ width: 140, height: 38 }} value={urgencyFilter} onChange={e => setUrgency(e.target.value)}>
            <option value="">All Priorities</option>
            {URGENCY_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
      </div>

      {/* Worklist Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button className={`tab-item ${activeTab === 'all' ? 'active' : ''}`} onClick={() => setActiveTab('all')}>
          All ({tabCounts.all})
        </button>
        <button className={`tab-item ${activeTab === 'pending' ? 'active' : ''}`} onClick={() => setActiveTab('pending')}>
          Pending ({tabCounts.pending})
        </button>
        <button className={`tab-item ${activeTab === 'collection' ? 'active' : ''}`} onClick={() => setActiveTab('collection')}>
          Sample Collection ({tabCounts.collection})
        </button>
        <button className={`tab-item ${activeTab === 'processing' ? 'active' : ''}`} onClick={() => setActiveTab('processing')}>
          Processing ({tabCounts.processing})
        </button>
        <button className={`tab-item ${activeTab === 'entry' ? 'active' : ''}`} onClick={() => setActiveTab('entry')}>
          Result Entry ({tabCounts.entry})
        </button>
        <button className={`tab-item ${activeTab === 'completed' ? 'active' : ''}`} onClick={() => setActiveTab('completed')}>
          Completed ({tabCounts.completed})
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchOrders} />
      ) : (
        <Table
          columns={tableColumns}
          rows={tabFiltered}
          loading={loading}
          emptyTitle="No lab orders found"
          emptyDescription="No lab orders match the current filter selection."
        />
      )}

      {/* Result Entry Modal */}
      <Modal isOpen={resultModal} onClose={() => { setResultModal(false); setSelected(null); setResultText(''); setResultValue(''); }} title={`Enter Result — ${selectedOrder?.testName || ''}`}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Result Value *</label>
            <input className="form-input" placeholder="e.g. Normal, High, 182 mg/dL" value={resultValue} onChange={e => setResultValue(e.target.value)} />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Report / Findings *</label>
            <textarea className="form-textarea" rows={4} placeholder="Enter detailed findings…" value={resultText} onChange={e => setResultText(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setResultModal(false)}>Cancel</button>
          <button className="btn btn-primary" onClick={handleEnterResult} disabled={actionLoading}>
            {actionLoading ? <Spinner size="sm" /> : 'Submit Result'}
          </button>
        </div>
      </Modal>

      {/* View Result Modal */}
      {selectedOrder?.result && !resultModal && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelected(null)} title={`Result — ${selectedOrder.testName}`}>
          <div className="result-view">
            <div className="result-meta">
              <span><strong>Patient:</strong> {selectedOrder.patientName}</span>
              <span><strong>Doctor:</strong> {selectedOrder.doctorName}</span>
              <span><strong>Status:</strong> <Badge variant={STATUS_VARIANT[selectedOrder.status]}>{selectedOrder.status}</Badge></span>
            </div>
            <div className="result-value-badge">
              Result: <strong>{selectedOrder.result?.value}</strong>
            </div>
            <div className="result-report">
              <h4>Findings</h4>
              <p>{selectedOrder.result?.report}</p>
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
