// components/billing/CreateInvoiceModal.jsx
import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Spinner from '../ui/Spinner';
import { RiAddLine, RiDeleteBinLine, RiMoneyDollarCircleLine, RiUserHeartLine } from 'react-icons/ri';
import billingService from '../../services/billingService';

export default function CreateInvoiceModal({ isOpen, onClose, onInvoiceCreated }) {
  const [patientId, setPatientId] = useState('P10025');
  const [patientName, setPatientName] = useState('Arun Kumar');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState([
    { description: 'OPD Consultation Fee', qty: 1, rate: 600, total: 600 },
    { description: 'CBC Lab Panel Test', qty: 1, rate: 450, total: 450 },
  ]);
  const [taxPercent, setTaxPercent] = useState(5);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const samplePatients = [
    { id: 'P10025', name: 'Arun Kumar' },
    { id: 'P10033', name: 'Sunita Iyer' },
    { id: 'P10041', name: 'Rahul Sharma' },
    { id: 'P10052', name: 'Mohammed Aslam' },
  ];

  const handlePatientSelect = (e) => {
    const pId = e.target.value;
    setPatientId(pId);
    const found = samplePatients.find((p) => p.id === pId);
    if (found) setPatientName(found.name);
  };

  const handleAddItem = () => {
    setItems([...items, { description: '', qty: 1, rate: 0, total: 0 }]);
  };

  const handleRemoveItem = (index) => {
    if (items.length <= 1) return;
    setItems(items.filter((_, idx) => idx !== index));
  };

  const handleItemChange = (index, field, value) => {
    const updated = [...items];
    const item = { ...updated[index] };
    if (field === 'qty') {
      item.qty = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'rate') {
      item.rate = Math.max(0, parseFloat(value) || 0);
    } else {
      item[field] = value;
    }
    item.total = item.qty * item.rate;
    updated[index] = item;
    setItems(updated);
  };

  const subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const taxAmount = Math.round(subtotal * (taxPercent / 100));
  const grandTotal = Math.max(0, subtotal + taxAmount - discount);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!patientName.trim()) return;
    setSubmitting(true);
    try {
      const newInv = {
        patientId,
        patientName,
        dueDate,
        items,
        subtotal,
        tax: taxAmount,
        discount: parseFloat(discount) || 0,
        total: grandTotal,
        notes,
      };
      await billingService.createInvoice(newInv);
      onInvoiceCreated();
      onClose();
    } catch (err) {
      console.error('Error creating invoice', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Patient Tax Invoice"
      size="lg"
    >
      <form onSubmit={handleSubmit} className="form-grid">
        {/* Patient Selection Row */}
        <div className="form-group">
          <label className="form-label">Select Registered Patient *</label>
          <select className="form-select" value={patientId} onChange={handlePatientSelect}>
            {samplePatients.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.id})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Billed Patient Name *</label>
          <input
            type="text"
            className="form-input"
            value={patientName}
            onChange={(e) => setPatientName(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Payment Due Date *</label>
          <input
            type="date"
            className="form-input"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tax / GST Rate (%)</label>
          <input
            type="number"
            className="form-input"
            value={taxPercent}
            onChange={(e) => setTaxPercent(parseFloat(e.target.value) || 0)}
          />
        </div>

        {/* Itemized Line Items Table */}
        <div className="form-group-full mt-2">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
            <strong style={{ fontSize: '14px', color: 'var(--color-text-primary)' }}>
              Service Line Items & Procedure Fees
            </strong>
            <Button variant="outline" size="sm" type="button" onClick={handleAddItem}>
              <RiAddLine size={16} /> Add Service Line
            </Button>
          </div>

          <table className="data-table" style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)' }}>
            <thead>
              <tr>
                <th style={{ width: '45%' }}>Description / Procedure</th>
                <th style={{ width: '15%', textAlign: 'center' }}>Qty</th>
                <th style={{ width: '20%', textAlign: 'right' }}>Unit Rate (₹)</th>
                <th style={{ width: '15%', textAlign: 'right' }}>Total (₹)</th>
                <th style={{ width: '5%', textAlign: 'center' }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx}>
                  <td>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. ECG Diagnostic Scan"
                      value={item.description}
                      onChange={(e) => handleItemChange(idx, 'description', e.target.value)}
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ textAlign: 'center' }}
                      value={item.qty}
                      min="1"
                      onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      className="form-input"
                      style={{ textAlign: 'right' }}
                      value={item.rate}
                      min="0"
                      onChange={(e) => handleItemChange(idx, 'rate', e.target.value)}
                    />
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>
                    ₹{item.total?.toLocaleString('en-IN')}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        style={{ background: 'none', border: 'none', color: '#DC2626', cursor: 'pointer', padding: '4px' }}
                        title="Remove Line Item"
                      >
                        <RiDeleteBinLine size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Calculation Summary Box */}
        <div className="form-group-full" style={{ background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)', margin: '12px 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
            <span>Subtotal:</span>
            <strong>₹{subtotal.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px' }}>
            <span>GST Tax ({taxPercent}%):</span>
            <strong>₹{taxAmount.toLocaleString('en-IN')}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', fontSize: '13px' }}>
            <span>Discount Modifier (₹):</span>
            <input
              type="number"
              className="form-input"
              style={{ width: '120px', textAlign: 'right', height: '32px' }}
              value={discount}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', borderTop: '1px solid var(--color-border)', fontSize: '16px', fontWeight: 800, color: 'var(--color-primary)' }}>
            <span>Grand Total:</span>
            <span>₹{grandTotal.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="form-group form-group-full">
          <label className="form-label">Internal Notes / Remarks</label>
          <textarea
            className="form-textarea"
            rows={2}
            placeholder="Additional billing remarks or TPA pre-authorization reference..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <div className="modal-footer form-group-full">
          <Button variant="ghost" type="button" onClick={onClose}>Cancel</Button>
          <Button variant="primary" type="submit" disabled={submitting}>
            {submitting ? <Spinner size="sm" /> : <><RiMoneyDollarCircleLine size={18} /> Issue Invoice (₹{grandTotal.toLocaleString('en-IN')})</>}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
