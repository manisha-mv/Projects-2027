// components/insurance/ClaimDetailModal.jsx
import React from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import {
  RiShieldCheckLine,
  RiBuildingLine,
  RiPrinterLine,
  RiCheckDoubleLine,
  RiTimeLine,
  RiFileTextLine,
  RiShieldCrossLine,
} from 'react-icons/ri';

export default function ClaimDetailModal({ isOpen, onClose, claim, onUpdateStatus }) {
  if (!claim) return null;

  const patientName = claim.patientName || 'Sunita Iyer';
  const patientId = claim.patientId || 'P10033';
  const status = claim.status || 'Under Review';

  const isApproved = status === 'Approved' || status === 'Paid';
  const isReview = status === 'Under Review';
  const isSubmitted = status === 'Submitted';

  const steps = [
    { title: 'Submitted', done: true, current: isSubmitted },
    { title: 'Under Review', done: isReview || isApproved, current: isReview },
    { title: 'Approved', done: isApproved, current: status === 'Approved' },
    { title: 'Paid / Settled', done: status === 'Paid', current: status === 'Paid' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Insurance Claim — ${claim.claimId || 'CLM-1001'}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <Button variant="outline" onClick={() => window.print()}>
            <RiPrinterLine /> Print Summary
          </Button>
          <div style={{ display: 'flex', gap: '8px' }}>
            {isSubmitted && onUpdateStatus && (
              <Button variant="outline" onClick={() => onUpdateStatus(claim.id || claim.claimId, 'Under Review')}>
                Mark Under Review
              </Button>
            )}
            {isReview && onUpdateStatus && (
              <Button variant="primary" onClick={() => onUpdateStatus(claim.id || claim.claimId, 'Approved', claim.claimAmount)}>
                <RiCheckDoubleLine /> Approve Full Claim
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>Close</Button>
          </div>
        </div>
      }
    >
      <div className="modal-body-content">
        {/* Patient Header Summary Card (Patients Section Standard) */}
        <div className="patient-banner-card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #0F1C2E 0%, #1E293B 100%)', padding: '18px' }}>
          <div className="patient-banner-main">
            <Avatar name={patientName} size="md" />
            <div>
              <div className="patient-banner-title">
                {patientName}
                <span className="patient-banner-id">{patientId}</span>
                <Badge variant={isApproved ? 'success' : isReview ? 'warning' : 'info'}>
                  {status}
                </Badge>
              </div>
              <div className="patient-banner-meta">
                <span><strong>Policy No:</strong> {claim.policyNo}</span>
                <span className="dot-sep">•</span>
                <span><strong>Provider:</strong> {claim.provider}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Claim Progress Step Tracker */}
        <div style={{ background: 'var(--color-surface-alt)', padding: '14px 18px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '10px' }}>
            CLAIM PROCESSING WORKFLOW
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
            {steps.map((step, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, zIndex: 1 }}>
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: step.done ? 'var(--color-success)' : 'var(--color-border)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px',
                  fontWeight: 700,
                  boxShadow: step.current ? '0 0 0 4px rgba(5, 150, 105, 0.2)' : 'none'
                }}>
                  {step.done ? '✓' : idx + 1}
                </div>
                <span style={{ fontSize: '11px', fontWeight: step.current ? 700 : 500, color: step.done ? 'var(--color-text-primary)' : 'var(--color-text-muted)', marginTop: '4px' }}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Info Grid (Patients Section Standard) */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <h3 className="card-title-with-icon" style={{ fontSize: '14px', marginBottom: '12px' }}>
            <RiBuildingLine /> Policy & Authorization Info
          </h3>
          <div className="info-grid-2">
            <div className="info-item">
              <span className="info-label">Insurance Provider</span>
              <span className="info-value">{claim.provider}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Policy Number</span>
              <span className="info-value font-mono">{claim.policyNo}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Claim Requisition ID</span>
              <span className="info-value font-mono">{claim.claimId || 'CLM-1001'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Coverage Type</span>
              <span className="info-value">Cashless Hospitalization</span>
            </div>
          </div>
        </div>

        {/* Financial Breakdown Summary */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 className="card-title-with-icon" style={{ fontSize: '14px', marginBottom: '12px' }}>
            <RiFileTextLine /> Financial Claim Settlement
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', textAlign: 'center' }}>
            <div style={{ background: 'var(--color-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Claimed Amount</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-text-primary)' }}>
                ₹{claim.claimAmount?.toLocaleString('en-IN')}
              </div>
            </div>
            <div style={{ background: '#E6F4F3', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-secondary-dark)' }}>Approved Amount</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--color-success)' }}>
                {claim.approvedAmount ? `₹${claim.approvedAmount?.toLocaleString('en-IN')}` : 'Pending'}
              </div>
            </div>
            <div style={{ background: 'var(--color-surface-alt)', padding: '12px', borderRadius: 'var(--radius-md)' }}>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Patient Co-pay Balance</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#DC2626' }}>
                ₹{((claim.claimAmount || 0) - (claim.approvedAmount || 0)).toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {claim.notes && (
            <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--color-text-secondary)', background: 'var(--color-surface-alt)', padding: '10px', borderRadius: '6px' }}>
              <strong>Clinical Notes / Remarks:</strong> {claim.notes}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
