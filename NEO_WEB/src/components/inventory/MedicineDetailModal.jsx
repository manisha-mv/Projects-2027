// components/inventory/MedicineDetailModal.jsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Avatar from '../ui/Avatar';
import Spinner from '../ui/Spinner';
import {
  RiMedicineBottleLine,
  RiArchiveLine,
  RiStockLine,
  RiBuildingLine,
  RiCalendarEventLine,
  RiMapPinLine,
  RiPriceTag3Line,
  RiAlertLine,
} from 'react-icons/ri';

export default function MedicineDetailModal({ isOpen, onClose, medicine, onUpdateStock }) {
  const [stockAddQty, setStockAddQty] = useState(0);
  const [actionLoading, setActionLoading] = useState(false);

  if (!medicine) return null;

  const isLow = medicine.status === 'Low Stock';
  const isExpired = medicine.status === 'Expired';
  const stockRatio = Math.min(100, Math.round((medicine.quantity / (medicine.minStock * 4 || 100)) * 100));

  const handleSaveStock = async () => {
    if (stockAddQty === 0) return;
    setActionLoading(true);
    try {
      await onUpdateStock(medicine.id, parseInt(stockAddQty, 10));
      setStockAddQty(0);
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Medicine Details — ${medicine.name}`}
      size="lg"
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center' }}>
            Batch Ref: <code style={{ marginLeft: '4px', fontWeight: 600 }}>{medicine.batchNo}</code>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <Button variant="ghost" onClick={onClose}>Close</Button>
            {stockAddQty !== 0 && (
              <Button variant="primary" onClick={handleSaveStock} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" /> : 'Save Stock Adjustment'}
              </Button>
            )}
          </div>
        </div>
      }
    >
      <div className="modal-body-content">
        {/* Header Summary Banner (Matching Patients Section Standard) */}
        <div className="patient-banner-card" style={{ marginBottom: '16px', background: 'linear-gradient(135deg, #0F1C2E 0%, #1E293B 100%)', padding: '18px' }}>
          <div className="patient-banner-main">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '22px',
              color: '#FFFFFF'
            }}>
              <RiMedicineBottleLine />
            </div>
            <div>
              <div className="patient-banner-title">
                {medicine.name}
                <span className="patient-banner-id">{medicine.batchNo}</span>
                <Badge variant={isExpired ? 'danger' : isLow ? 'warning' : 'success'}>
                  {medicine.status}
                </Badge>
              </div>
              <div className="patient-banner-meta">
                <span><strong>Category:</strong> {medicine.category}</span>
                <span className="dot-sep">•</span>
                <span><strong>Mfr:</strong> {medicine.manufacturer || 'PharmaCorp Inc.'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Stock Gauge Bar */}
        <div style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', marginBottom: '16px', border: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-text-muted)' }}>CURRENT INVENTORY STOCK LEVEL</span>
            <strong style={{ fontSize: '16px', color: isExpired ? '#DC2626' : isLow ? '#D97706' : 'var(--color-success)' }}>
              {medicine.quantity} {medicine.unit} (Min Reorder: {medicine.minStock})
            </strong>
          </div>

          <div className="stock-meter-bg" style={{ height: '8px', margin: 0 }}>
            <div
              className={`stock-meter-fill ${isExpired ? 'low' : isLow ? 'moderate' : 'healthy'}`}
              style={{ width: `${Math.max(6, stockRatio)}%` }}
            />
          </div>

          {isLow && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: '#D97706', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <RiAlertLine /> Stock is below minimum threshold level ({medicine.minStock} {medicine.unit}). Reorder required.
            </div>
          )}
        </div>

        {/* Info Grid (Patients Section Standard) */}
        <div className="card" style={{ padding: '16px', marginBottom: '16px' }}>
          <h3 className="card-title-with-icon" style={{ fontSize: '14px', marginBottom: '12px' }}>
            <RiPriceTag3Line /> Commercial & Storage Information
          </h3>
          <div className="info-grid-2">
            <div className="info-item">
              <span className="info-label">Maximum Retail Price (MRP)</span>
              <span className="info-value font-mono">₹{medicine.mrp}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Hospital Purchase Cost</span>
              <span className="info-value font-mono">₹{medicine.unitPrice || (medicine.mrp * 0.7).toFixed(2)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Expiry Date</span>
              <span className="info-value" style={{ color: isExpired ? '#DC2626' : 'inherit', fontWeight: isExpired ? 700 : 500 }}>
                {medicine.expiryDate} {isExpired && '(Expired)'}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">Shelf / Bin Storage Location</span>
              <span className="info-value">{medicine.location || 'Shelf A-01'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Supplier Name</span>
              <span className="info-value">{medicine.supplier || 'Apollo Wholesale Pharma'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Packaging Unit</span>
              <span className="info-value">{medicine.unit || 'Tablets'}</span>
            </div>
          </div>
        </div>

        {/* Rapid Stock Adjustment Controls */}
        <div className="card" style={{ padding: '16px' }}>
          <h3 className="card-title-with-icon" style={{ fontSize: '14px', marginBottom: '12px' }}>
            <RiStockLine /> Rapid Stock Quantity Adjustment
          </h3>

          <div style={{ marginBottom: '12px' }}>
            <label className="form-label" style={{ marginBottom: '6px' }}>Preset Modifiers</label>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {[10, 50, 100, -10, -50].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  className={`pay-preset-btn ${stockAddQty === preset ? 'active' : ''}`}
                  onClick={() => setStockAddQty(preset)}
                >
                  {preset > 0 ? `+${preset}` : preset} {medicine.unit}
                </button>
              ))}
            </div>
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Custom Quantity Adjustment (Use negative numbers to deduct)</label>
            <input
              type="number"
              className="form-input"
              value={stockAddQty}
              onChange={(e) => setStockAddQty(e.target.value)}
            />
          </div>

          {stockAddQty !== 0 && (
            <div style={{ marginTop: '12px', fontSize: '13px', background: '#EFF6FF', padding: '10px 14px', borderRadius: '6px', color: '#1D4ED8', fontWeight: 500 }}>
              Updated stock after saving: <strong>{parseInt(medicine.quantity, 10) + parseInt(stockAddQty || 0, 10)} {medicine.unit}</strong>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
