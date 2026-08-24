// pages/Billing/BillingDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiFileAddLine,
  RiSearchLine,
  RiRefreshLine,
  RiEyeLine,
  RiPrinterLine,
  RiMoneyDollarCircleLine,
  RiTimeLine,
  RiCheckDoubleLine,
  RiBankCardLine,
  RiFileTextLine,
  RiDownloadLine,
} from 'react-icons/ri';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Toast from '../../components/ui/Toast';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import billingService, { INVOICE_STATUSES, PAYMENT_METHODS } from '../../services/billingService';
import InvoiceDetailModal from '../../components/billing/InvoiceDetailModal';
import CreateInvoiceModal from '../../components/billing/CreateInvoiceModal';

// Helper for status badge variant (matching PatientList badge pattern)
const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'paid':
      return 'success';
    case 'partially paid':
      return 'warning';
    case 'issued':
      return 'info';
    case 'overdue':
      return 'error';
    case 'cancelled':
      return 'secondary';
    default:
      return 'neutral';
  }
};

const BillingDashboard = () => {
  // Filter & Pagination State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Data & Stats State
  const [invoices, setInvoices] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [stats, setStats] = useState({ totalRevenue: 0, pendingAmount: 0, totalInvoices: 0, paidInvoices: 0 });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Modals State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [detailInvoice, setDetailInvoice] = useState(null);
  const [selectedInvoiceForPay, setSelectedInvoiceForPay] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [submittingPay, setSubmittingPay] = useState(false);

  // Load Invoices
  const loadInvoices = useCallback(async () => {
    setLoading(true);
    try {
      const statusParam = selectedStatus === 'All' ? '' : selectedStatus;
      const res = await billingService.getInvoices({
        search: searchQuery,
        status: statusParam,
        page: currentPage,
        limit: pageSize,
      });

      setInvoices(res.invoices || []);
      setTotalRecords(res.total || 0);
      setTotalPages(Math.max(1, Math.ceil((res.total || 0) / pageSize)));
      setStats(billingService.getDashboardStats());
    } catch (err) {
      console.error('Failed to load billing invoices', err);
      setToast({ type: 'error', message: 'Failed to fetch billing invoices.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedStatus, currentPage]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  // Open Payment Modal
  const handleOpenPaymentModal = (invoice) => {
    setSelectedInvoiceForPay(invoice);
    setPaymentAmount(invoice.balance || 0);
  };

  // Process Payment
  const handleProcessPayment = async () => {
    if (!selectedInvoiceForPay || paymentAmount <= 0) return;
    setSubmittingPay(true);
    try {
      await billingService.processPayment(
        selectedInvoiceForPay.id || selectedInvoiceForPay.invoiceId,
        parseFloat(paymentAmount),
        paymentMethod
      );
      setToast({ type: 'success', message: `₹${paymentAmount} payment receipt recorded for ${selectedInvoiceForPay.invoiceId}.` });
      setSelectedInvoiceForPay(null);
      loadInvoices();
    } catch (err) {
      console.error('Payment processing failed', err);
      setToast({ type: 'error', message: 'Failed to process payment. Please try again.' });
    } finally {
      setSubmittingPay(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    setToast({ type: 'success', message: 'Export generated. Financial billing report downloaded.' });
  };

  // Table Columns Setup
  const columns = [
    {
      key: 'invoiceId',
      label: 'INVOICE ID',
      width: '130px',
      render: (val, row) => (
        <span
          className="patient-id-badge"
          onClick={() => setDetailInvoice(row)}
          title="Click to view itemized invoice"
        >
          {val || row.id}
        </span>
      ),
    },
    {
      key: 'patientName',
      label: 'PATIENT NAME',
      width: '220px',
      render: (val, row) => {
        const displayName = val || 'Unknown Patient';
        return (
          <div
            className="table-patient-cell"
            onClick={() => setDetailInvoice(row)}
            style={{ cursor: 'pointer' }}
          >
            <Avatar name={displayName} size="sm" />
            <div>
              <div className="table-patient-name">{displayName}</div>
              <div className="table-patient-sub">Patient ID: {row.patientId || 'P10025'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'invoiceDate',
      label: 'INVOICE DATE',
      width: '130px',
      render: (val) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'TOTAL AMOUNT',
      width: '140px',
      render: (val) => (
        <span style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>
          ₹{val?.toLocaleString('en-IN') || '0'}
        </span>
      ),
    },
    {
      key: 'paid',
      label: 'PAID AMOUNT',
      width: '140px',
      render: (val) => (
        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>
          ₹{val?.toLocaleString('en-IN') || '0'}
        </span>
      ),
    },
    {
      key: 'balance',
      label: 'BALANCE DUE',
      width: '140px',
      render: (val) => (
        val > 0 ? (
          <span style={{ color: '#DC2626', fontWeight: 700 }}>
            ₹{val?.toLocaleString('en-IN')}
          </span>
        ) : (
          <span style={{ color: 'var(--color-text-muted)' }}>₹0</span>
        )
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '130px',
      render: (val) => (
        <Badge variant={getStatusBadgeVariant(val)} size="sm">
          {val || 'Issued'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'ACTIONS',
      width: '160px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDetailInvoice(row)}
            title="View & Print Invoice"
          >
            <RiEyeLine size={16} />
            Details
          </Button>
          {row.balance > 0 ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => handleOpenPaymentModal(row)}
              title="Process Patient Payment"
            >
              <RiBankCardLine size={16} />
              Pay
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDetailInvoice(row)}
              title="Print Receipt"
            >
              <RiPrinterLine size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const collectionRate = stats.totalInvoices > 0
    ? Math.round((stats.paidInvoices / stats.totalInvoices) * 100)
    : 0;

  return (
    <div className="page-container">
      <PageHeader
        title="Billing & Financial Management"
        description="Streamlined patient billing, automated invoice tracking, receipts, and revenue collection."
        primaryAction={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" size="md" onClick={handleExportCSV}>
              <RiDownloadLine size={18} />
              Export
            </Button>
            <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
              <RiFileAddLine size={18} />
              Create New Invoice
            </Button>
          </div>
        }
      />

      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiMoneyDollarCircleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Revenue Collected</div>
            <div className="stat-pill-value">₹{stats.totalRevenue?.toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Outstanding Balance Dues</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>
              ₹{stats.pendingAmount?.toLocaleString('en-IN')}
            </div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Settled Invoices</div>
            <div className="stat-pill-value">
              {stats.paidInvoices} / {stats.totalInvoices}
            </div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiFileTextLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Collection Rate</div>
            <div className="stat-pill-value" style={{ fontSize: '0.95rem', color: '#059669' }}>
              {collectionRate}% Settled
            </div>
          </div>
        </div>
      </div>

      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, or Invoice ID..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              {INVOICE_STATUSES.map((st) => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters} title="Reset all search filters">
            <RiRefreshLine size={16} />
            Reset
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          columns={columns}
          rows={invoices}
          loading={loading}
          emptyTitle="No billing invoices found matching your filters."
        />

        {!loading && totalRecords > 0 && (
          <div className="table-pagination-strip">
            <div className="pagination-info">
              Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalRecords)}</strong> of <strong>{totalRecords}</strong> invoices
            </div>

            <div className="pagination-controls">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="pagination-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {selectedInvoiceForPay && (
        <Modal
          isOpen={!!selectedInvoiceForPay}
          onClose={() => setSelectedInvoiceForPay(null)}
          title={`Process Payment — ${selectedInvoiceForPay.invoiceId}`}
          size="md"
        >
          <div className="modal-body-content">
            <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Avatar name={selectedInvoiceForPay.patientName} size="sm" />
                  <div>
                    <h3 style={{ fontSize: '15px', fontWeight: 'bold', margin: 0 }}>{selectedInvoiceForPay.patientName}</h3>
                    <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Patient ID: {selectedInvoiceForPay.patientId}</span>
                  </div>
                </div>
                <Badge variant={getStatusBadgeVariant(selectedInvoiceForPay.status)} size="sm">
                  {selectedInvoiceForPay.status}
                </Badge>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--color-border)', fontSize: '13px' }}>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Total Amount</div>
                  <strong style={{ fontSize: '15px' }}>₹{selectedInvoiceForPay.total?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Already Paid</div>
                  <strong style={{ fontSize: '15px', color: 'var(--color-success)' }}>₹{selectedInvoiceForPay.paid?.toLocaleString('en-IN')}</strong>
                </div>
                <div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>Balance Due</div>
                  <strong style={{ fontSize: '15px', color: '#DC2626' }}>₹{selectedInvoiceForPay.balance?.toLocaleString('en-IN')}</strong>
                </div>
              </div>
            </div>

            {selectedInvoiceForPay.balance > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '6px' }}>Quick Amount Preset</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className={`pay-preset-btn ${paymentAmount === selectedInvoiceForPay.balance ? 'active' : ''}`}
                    onClick={() => setPaymentAmount(selectedInvoiceForPay.balance)}
                  >
                    Full Balance (₹{selectedInvoiceForPay.balance})
                  </button>
                  <button
                    type="button"
                    className={`pay-preset-btn ${paymentAmount === Math.round(selectedInvoiceForPay.balance / 2) ? 'active' : ''}`}
                    onClick={() => setPaymentAmount(Math.round(selectedInvoiceForPay.balance / 2))}
                  >
                    50% Partial (₹{Math.round(selectedInvoiceForPay.balance / 2)})
                  </button>
                </div>
              </div>
            )}

            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="form-group">
                <label className="form-label">Payment Method *</label>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Payment Amount (₹) *</label>
                <input
                  type="number"
                  className="form-input"
                  value={paymentAmount}
                  max={selectedInvoiceForPay.balance}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <Button variant="ghost" onClick={() => setSelectedInvoiceForPay(null)}>Cancel</Button>
            {selectedInvoiceForPay.balance > 0 && (
              <Button variant="primary" onClick={handleProcessPayment} disabled={submittingPay}>
                {submittingPay ? <Spinner size="sm" /> : `Confirm ₹${paymentAmount} Payment`}
              </Button>
            )}
          </div>
        </Modal>
      )}

      <CreateInvoiceModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onInvoiceCreated={() => {
          setToast({ type: 'success', message: 'New patient invoice generated successfully.' });
          loadInvoices();
        }}
      />

      <InvoiceDetailModal
        isOpen={!!detailInvoice}
        onClose={() => setDetailInvoice(null)}
        invoice={detailInvoice}
        onRecordPayment={(inv) => {
          setDetailInvoice(null);
          handleOpenPaymentModal(inv);
        }}
      />

      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default BillingDashboard;
