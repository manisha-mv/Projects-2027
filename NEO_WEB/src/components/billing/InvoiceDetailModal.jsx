// components/billing/InvoiceDetailModal.jsx
import React, { useRef } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import { RiPrinterLine, RiDownloadLine, RiMoneyDollarCircleLine, RiUserHeartLine } from 'react-icons/ri';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function InvoiceDetailModal({ isOpen, onClose, invoice, onRecordPayment }) {
  const printRef = useRef();

  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Invoice_${invoice.invoiceId || invoice.id}.pdf`);
    } catch (e) {
      console.error('PDF Generation failed:', e);
      alert('Failed to generate PDF. You can use the Print option instead.');
    }
  };

  const statusVariant = {
    'Paid': 'success',
    'Partially Paid': 'info',
    'Issued': 'warning',
    'Overdue': 'danger',
    'Cancelled': 'secondary',
  };

  const items = invoice.items || [
    { description: 'OPD Consultation Fee', qty: 1, unitPrice: 500, amount: 500 },
    { description: 'CBC Lab Panel', qty: 1, unitPrice: 450, amount: 450 },
    { description: 'Chest X-Ray Digital', qty: 1, unitPrice: 800, amount: 800 },
    { description: 'Pharmacy Prescription Dispense', qty: 1, unitPrice: 650, amount: 650 },
  ];

  const subtotal = invoice.subtotal || items.reduce((sum, item) => sum + (item.amount || item.qty * item.unitPrice), 0);
  const tax = invoice.tax || Math.round(subtotal * 0.05);
  const discount = invoice.discount || 0;
  const grandTotal = invoice.total || (subtotal + tax - discount);
  const paidAmount = invoice.paidAmount || (invoice.status === 'Paid' ? grandTotal : 0);
  const balance = invoice.balance !== undefined ? invoice.balance : (grandTotal - paidAmount);
  const patientName = invoice.patientName || 'Arun Kumar';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Invoice #${invoice.invoiceId || invoice.id || 'INV-1001'}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="outline" onClick={handlePrint}>
              <RiPrinterLine /> Print Invoice
            </Button>
            <Button variant="outline" onClick={handleDownloadPDF}>
              <RiDownloadLine /> Download PDF
            </Button>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {balance > 0 && onRecordPayment && (
              <Button variant="primary" onClick={() => onRecordPayment(invoice)}>
                <RiMoneyDollarCircleLine /> Record Payment
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      }
    >
      <div ref={printRef} className="invoice-print-area">
        {/* Hospital Brand Header */}
        <div className="invoice-header">
          <div>
            <div className="invoice-hospital-name">NEO-HMS Smart Hospital</div>
            <div className="invoice-hospital-sub">100 Medical Center Way, Bengaluru 560001</div>
            <div className="invoice-hospital-sub">Phone: +91 80 2234 5678 | Email: billing@neohms.in</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="invoice-number">TAX INVOICE</div>
            <div style={{ marginTop: '4px' }}>
              <Badge variant={statusVariant[invoice.status] || 'primary'}>
                {invoice.status || 'Issued'}
              </Badge>
            </div>
          </div>
        </div>

        {/* Patient Profile Card (Matching Patient Detail Section Standard) */}
        <div style={{
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '16px',
          margin: '16px 0',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar name={patientName} size="md" />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <strong style={{ fontSize: '16px', color: 'var(--color-text-primary)' }}>{patientName}</strong>
                <span className="patient-id-badge" style={{ margin: 0 }}>
                  {invoice.patientId || 'P10025'}
                </span>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                Billed Account · Phone: +91 98765 43210
              </div>
            </div>
          </div>

          <div style={{ textAlign: 'right', fontSize: '13px' }}>
            <div style={{ color: 'var(--color-text-muted)', fontSize: '11px', fontWeight: 600 }}>INVOICE METADATA</div>
            <div>Date: <strong>{invoice.invoiceDate || new Date().toISOString().split('T')[0]}</strong></div>
            <div style={{ color: 'var(--color-text-secondary)', fontSize: '12px' }}>Due Date: {invoice.dueDate || 'Immediate'}</div>
          </div>
        </div>

        {/* Itemized Table */}
        <table className="invoice-items-table">
          <thead>
            <tr>
              <th style={{ width: '40px' }}>#</th>
              <th>Description / Service Rendered</th>
              <th style={{ textAlign: 'center', width: '60px' }}>Qty</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Unit Rate</th>
              <th style={{ textAlign: 'right', width: '120px' }}>Total Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td style={{ color: 'var(--color-text-muted)' }}>{idx + 1}</td>
                <td>
                  <strong>{item.description}</strong>
                </td>
                <td style={{ textAlign: 'center' }}>{item.qty || 1}</td>
                <td style={{ textAlign: 'right' }}>₹{(item.unitPrice || item.amount).toLocaleString('en-IN')}</td>
                <td style={{ textAlign: 'right', fontWeight: 600 }}>₹{(item.amount || (item.qty * item.unitPrice)).toLocaleString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals Breakdown */}
        <div className="invoice-totals">
          <div className="invoice-totals-row">
            <span>Subtotal:</span>
            <span>₹{subtotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="invoice-totals-row">
            <span>GST / Tax (5%):</span>
            <span>₹{tax.toLocaleString('en-IN')}</span>
          </div>
          {discount > 0 && (
            <div className="invoice-totals-row">
              <span>Discount Applied:</span>
              <span style={{ color: 'var(--color-success)' }}>-₹{discount.toLocaleString('en-IN')}</span>
            </div>
          )}
          <div className="invoice-totals-row grand-total">
            <span>Grand Total:</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
          <div className="invoice-totals-row" style={{ color: 'var(--color-success)', fontWeight: 'bold' }}>
            <span>Amount Paid:</span>
            <span>₹{paidAmount.toLocaleString('en-IN')}</span>
          </div>
          <div className="invoice-totals-row" style={{ color: balance > 0 ? '#DC2626' : 'var(--color-text-secondary)', fontWeight: 'bold' }}>
            <span>Balance Due:</span>
            <span>₹{balance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Payment History */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="invoice-payments-section">
            <div style={{ fontSize: '13px', fontWeight: 'bold', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
              Transaction Log & Payment Receipts
            </div>
            {invoice.payments.map((p, idx) => (
              <div key={idx} className="invoice-payment-row">
                <span>{p.date} · <strong>{p.method}</strong> (Ref: {p.reference || 'N/A'})</span>
                <strong style={{ color: 'var(--color-success)' }}>₹{p.amount?.toLocaleString('en-IN')}</strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

