// components/appointments/AppointmentDetailModal.jsx
// Phase 4 — View Appointment Details + Update Status

import React, { useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Alert from '../ui/Alert';
import { getStatusVariant, getPriorityVariant, allowedTransitions } from '../../services/appointmentService';
import {
  RiUserHeartLine, RiStethoscopeLine, RiCalendarLine, RiTimeLine,
  RiMapPinLine, RiAlertLine, RiFileTextLine, RiCheckboxCircleLine,
} from 'react-icons/ri';

const AppointmentDetailModal = ({ isOpen, onClose, appointment, onStatusUpdate, isLoading, userRole }) => {
  const [selectedStatus, setSelectedStatus] = useState('');
  const [statusNotes, setStatusNotes] = useState('');
  const [showStatusForm, setShowStatusForm] = useState(false);

  if (!appointment) return null;

  const transitions = allowedTransitions(appointment.status, userRole);
  const canUpdateStatus = transitions.length > 0;

  const handleStatusSubmit = () => {
    if (!selectedStatus) return;
    onStatusUpdate(appointment.id || appointment.appointmentId, selectedStatus, statusNotes);
    setShowStatusForm(false);
    setSelectedStatus('');
    setStatusNotes('');
  };

  const statusVariant = getStatusVariant(appointment.status);
  const priorityVariant = getPriorityVariant(appointment.priority);

  // Quick check-in shortcut
  const canCheckIn = ['Scheduled', 'Confirmed'].includes(appointment.status) &&
    ['ADMIN', 'RECEPTIONIST'].includes(userRole?.toUpperCase());

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', gap: 8 }}>
      {canCheckIn && !showStatusForm && (
        <Button
          variant="secondary"
          onClick={() => onStatusUpdate(appointment.id || appointment.appointmentId, 'Checked In', '')}
          loading={isLoading}
        >
          <RiCheckboxCircleLine /> Quick Check-In
        </Button>
      )}
      <div style={{ display: 'flex', gap: 8, marginLeft: 'auto' }}>
        {canUpdateStatus && !showStatusForm && (
          <Button variant="outline" onClick={() => setShowStatusForm(true)}>
            Update Status
          </Button>
        )}
        <Button variant="ghost" onClick={onClose}>Close</Button>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Appointment — ${appointment.appointmentId}`}
      footer={footer}
    >
      <div className="apt-detail-layout">
        {/* Header Status Strip */}
        <div className="apt-detail-header">
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <Badge variant={statusVariant}>{appointment.status}</Badge>
            <Badge variant={priorityVariant} showIcon={false}>{appointment.priority}</Badge>
            <Badge variant="neutral" showIcon={false}>{appointment.type}</Badge>
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
            ID: <strong>{appointment.appointmentId}</strong>
          </div>
        </div>

        {/* Two-column Info */}
        <div className="apt-detail-grid">
          {/* Patient */}
          <div className="apt-detail-card">
            <div className="adc-label"><RiUserHeartLine /> Patient</div>
            <div className="adc-value">{appointment.patientName}</div>
            <div className="adc-sub">{appointment.patientId}</div>
            {appointment.patientPhone && <div className="adc-sub">📞 {appointment.patientPhone}</div>}
          </div>

          {/* Doctor */}
          <div className="apt-detail-card">
            <div className="adc-label"><RiStethoscopeLine /> Consulting Doctor</div>
            <div className="adc-value">{appointment.doctorName}</div>
            <div className="adc-sub">{appointment.department}</div>
          </div>

          {/* Date */}
          <div className="apt-detail-card">
            <div className="adc-label"><RiCalendarLine /> Appointment Date</div>
            <div className="adc-value">{appointment.appointmentDate}</div>
          </div>

          {/* Time */}
          <div className="apt-detail-card">
            <div className="adc-label"><RiTimeLine /> Time Slot</div>
            <div className="adc-value">{appointment.timeSlot}</div>
            {appointment.checkinTime && (
              <div className="adc-sub">
                Checked-in: {new Date(appointment.checkinTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            )}
          </div>
        </div>

        {/* Chief Complaint */}
        {appointment.chiefComplaint && (
          <div className="apt-detail-section">
            <div className="ads-label"><RiAlertLine /> Chief Complaint</div>
            <div className="ads-body">{appointment.chiefComplaint}</div>
          </div>
        )}

        {/* Notes */}
        {appointment.notes && (
          <div className="apt-detail-section">
            <div className="ads-label"><RiFileTextLine /> Notes</div>
            <div className="ads-body">{appointment.notes}</div>
          </div>
        )}

        {/* Status Update Panel */}
        {showStatusForm && (
          <div className="apt-status-update-panel">
            <div className="ads-label">Update Appointment Status</div>
            <div className="form-group mt-2">
              <label className="form-label required">New Status</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
                {transitions.map(s => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSelectedStatus(s)}
                    className={`status-transition-btn ${selectedStatus === s ? 'selected' : ''}`}
                  >
                    <Badge variant={getStatusVariant(s)} showIcon={false}>{s}</Badge>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group mt-3">
              <label className="form-label">Update Notes (Optional)</label>
              <input
                type="text"
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                placeholder="Any notes regarding this status change..."
                className="form-input"
              />
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 12, justifyContent: 'flex-end' }}>
              <Button variant="ghost" size="sm" onClick={() => { setShowStatusForm(false); setSelectedStatus(''); }}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleStatusSubmit} disabled={!selectedStatus} loading={isLoading}>
                Confirm Status Update
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default AppointmentDetailModal;
