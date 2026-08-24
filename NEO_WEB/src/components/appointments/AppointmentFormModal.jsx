// components/appointments/AppointmentFormModal.jsx
// Phase 4 — Book / Edit Appointment
import React, { useState, useEffect, useMemo } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import {
  DEPARTMENTS, VISIT_TYPES, PRIORITIES, TIME_SLOTS,
  appointmentService, toDateStr,
} from '../../services/appointmentService';
import { patientService } from '../../services/patientService';

const EMPTY_FORM = {
  patientSearch: '',
  patientId: '',
  patientName: '',
  patientPhone: '',
  department: '',
  doctorId: '',
  appointmentDate: '',
  timeSlot: '',
  type: 'New Visit',
  priority: 'Routine',
  chiefComplaint: '',
  notes: '',
};

const AppointmentFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [form, setForm]             = useState(EMPTY_FORM);
  const [errors, setErrors]         = useState({});
  const [patientResults, setPatientResults] = useState([]);
  const [searchingPatient, setSearchingPatient] = useState(false);
  const [bookedSlots, setBookedSlots] = useState([]);

  const isEdit = Boolean(initialData?.id || initialData?.appointmentId);
  const doctors = useMemo(() => appointmentService.getDoctorsByDept(form.department), [form.department]);
  const minDate = toDateStr(); // Prevent past dates

  // Populate form when editing
  useEffect(() => {
    if (!isOpen) return;
    setErrors({});
    if (initialData) {
      setForm({
        patientSearch: initialData.patientName || '',
        patientId:     initialData.patientId || '',
        patientName:   initialData.patientName || '',
        patientPhone:  initialData.patientPhone || '',
        department:    initialData.department || '',
        doctorId:      initialData.doctorId || '',
        appointmentDate: initialData.appointmentDate || '',
        timeSlot:      initialData.timeSlot || '',
        type:          initialData.type || 'New Visit',
        priority:      initialData.priority || 'Routine',
        chiefComplaint: initialData.chiefComplaint || '',
        notes:         initialData.notes || '',
      });
    } else {
      setForm({ ...EMPTY_FORM, appointmentDate: toDateStr() });
      setPatientResults([]);
    }
  }, [isOpen, initialData]);

  // Load booked slots when doctor + date change
  useEffect(() => {
    if (form.doctorId && form.appointmentDate) {
      const booked = appointmentService.getBookedSlots(form.doctorId, form.appointmentDate);
      // If editing, exclude own slot from booked list
      const editSlot = isEdit ? initialData?.timeSlot : null;
      setBookedSlots(booked.filter(s => s !== editSlot));
    } else {
      setBookedSlots([]);
    }
  }, [form.doctorId, form.appointmentDate, isEdit, initialData]);

  const setField = (name, value) => {
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    // Reset downstream fields
    if (name === 'department') setForm(prev => ({ ...prev, department: value, doctorId: '', timeSlot: '' }));
    if (name === 'doctorId')   setForm(prev => ({ ...prev, doctorId: value, timeSlot: '' }));
    if (name === 'appointmentDate') setForm(prev => ({ ...prev, appointmentDate: value, timeSlot: '' }));
  };

  // Patient live search
  const handlePatientSearch = async (val) => {
    setForm(prev => ({ ...prev, patientSearch: val, patientId: '', patientName: '', patientPhone: '' }));
    if (errors.patientId) setErrors(prev => ({ ...prev, patientId: null }));
    if (!val.trim() || val.length < 2) { setPatientResults([]); return; }
    setSearchingPatient(true);
    try {
      const res = await patientService.getPatients({ search: val, limit: 6 });
      setPatientResults(res.patients || []);
    } finally {
      setSearchingPatient(false);
    }
  };

  const handleSelectPatient = (p) => {
    setForm(prev => ({
      ...prev,
      patientSearch: p.name || `${p.firstName} ${p.lastName}`.trim(),
      patientId:     p.patientId || p.id,
      patientName:   p.name || `${p.firstName} ${p.lastName}`.trim(),
      patientPhone:  p.contact?.phone || p.phone || '',
    }));
    setPatientResults([]);
    if (errors.patientId) setErrors(prev => ({ ...prev, patientId: null }));
  };

  const validate = () => {
    const e = {};
    if (!form.patientId)       e.patientId       = 'Select a patient from the search results';
    if (!form.department)      e.department      = 'Select a department';
    if (!form.doctorId)        e.doctorId        = 'Select a doctor';
    if (!form.appointmentDate) e.appointmentDate = 'Select an appointment date';
    else if (form.appointmentDate < toDateStr()) e.appointmentDate = 'Appointment date cannot be in the past';
    if (!form.timeSlot)        e.timeSlot        = 'Select an available time slot';
    if (!form.chiefComplaint.trim()) e.chiefComplaint = 'Reason for visit is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit({ ...form });
  };

  const footer = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', width: '100%' }}>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>Cancel</Button>
      <Button variant="primary" onClick={handleSubmit} loading={isLoading}>
        {isEdit ? 'Update Appointment' : 'Book Appointment'}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit — ${initialData?.appointmentId}` : 'Book New Appointment'}
      footer={footer}
      size="lg"
    >
      <div className="apt-form">
        {Object.keys(errors).length > 0 && (
          <Alert type="error" title="Please fix the errors below before submitting." className="mb-4" />
        )}

        {/* ── Section 1: Patient ── */}
        <div className="form-section">
          <h3 className="form-section-title">1. Patient</h3>

          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label required">Search & Select Patient</label>
            <input
              type="text"
              value={form.patientSearch}
              onChange={e => handlePatientSearch(e.target.value)}
              placeholder="Type Patient ID, name, or phone..."
              className={`form-input ${errors.patientId ? 'error' : ''}`}
              autoComplete="off"
            />
            {searchingPatient && (
              <span style={{ position: 'absolute', right: 10, top: 32, fontSize: 12, color: 'var(--color-text-muted)' }}>
                Searching…
              </span>
            )}
            {patientResults.length > 0 && (
              <div className="patient-search-dropdown">
                {patientResults.map(p => {
                  const name = p.name || `${p.firstName} ${p.lastName}`.trim();
                  return (
                    <div key={p.id || p.patientId} className="patient-search-option" onClick={() => handleSelectPatient(p)}>
                      <span className="pso-id">{p.patientId || p.id}</span>
                      <span className="pso-name">{name}</span>
                      <span className="pso-meta">{p.age} yrs · {p.gender} · {p.bloodGroup}</span>
                    </div>
                  );
                })}
              </div>
            )}
            {errors.patientId && <span className="field-error">{errors.patientId}</span>}
          </div>

          {form.patientId && (
            <div className="apt-selected-patient-chip">
              <span className="chip-id">{form.patientId}</span>
              <span className="chip-name">{form.patientName}</span>
              {form.patientPhone && <span className="chip-phone">{form.patientPhone}</span>}
              <button className="chip-clear" onClick={() => setForm(prev => ({ ...prev, patientSearch: '', patientId: '', patientName: '', patientPhone: '' }))}>✕</button>
            </div>
          )}
        </div>

        {/* ── Section 2: Doctor & Department ── */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">2. Department & Doctor</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Department</label>
              <select
                value={form.department}
                onChange={e => setField('department', e.target.value)}
                className={`form-select ${errors.department ? 'error' : ''}`}
              >
                <option value="">— Select Department —</option>
                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
              {errors.department && <span className="field-error">{errors.department}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Consulting Doctor</label>
              <select
                value={form.doctorId}
                onChange={e => setField('doctorId', e.target.value)}
                className={`form-select ${errors.doctorId ? 'error' : ''}`}
                disabled={!form.department}
              >
                <option value="">— Select Doctor —</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id} disabled={!d.available}>
                    {d.name}{!d.available ? ' (Unavailable)' : ''}
                  </option>
                ))}
              </select>
              {errors.doctorId && <span className="field-error">{errors.doctorId}</span>}
            </div>
          </div>
        </div>

        {/* ── Section 3: Date & Time ── */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">3. Date & Time Slot</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Appointment Date</label>
              <input
                type="date"
                value={form.appointmentDate}
                min={minDate}
                onChange={e => setField('appointmentDate', e.target.value)}
                className={`form-input ${errors.appointmentDate ? 'error' : ''}`}
              />
              {errors.appointmentDate && <span className="field-error">{errors.appointmentDate}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Available Time Slot</label>
              <div className="time-slot-grid">
                {TIME_SLOTS.map(slot => {
                  const booked = bookedSlots.includes(slot);
                  const selected = form.timeSlot === slot;
                  return (
                    <button
                      key={slot}
                      type="button"
                      disabled={booked || !form.doctorId}
                      onClick={() => { if (!booked) setField('timeSlot', slot); }}
                      className={`time-slot-btn ${selected ? 'selected' : ''} ${booked ? 'booked' : ''}`}
                      title={booked ? 'Already booked' : `Select ${slot}`}
                    >
                      {slot}
                    </button>
                  );
                })}
              </div>
              {errors.timeSlot && <span className="field-error">{errors.timeSlot}</span>}
            </div>
          </div>
        </div>

        {/* ── Section 4: Visit Details ── */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">4. Visit Details</h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label required">Visit Type</label>
              <select
                value={form.type}
                onChange={e => setField('type', e.target.value)}
                className="form-select"
              >
                {VISIT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                value={form.priority}
                onChange={e => setField('priority', e.target.value)}
                className="form-select"
              >
                {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label required">Chief Complaint / Reason for Visit</label>
            <textarea
              value={form.chiefComplaint}
              onChange={e => setField('chiefComplaint', e.target.value)}
              rows={2}
              placeholder="Describe the patient's chief complaint or reason for this appointment..."
              className={`form-input ${errors.chiefComplaint ? 'error' : ''}`}
            />
            {errors.chiefComplaint && <span className="field-error">{errors.chiefComplaint}</span>}
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Additional Notes (Optional)</label>
            <input
              type="text"
              value={form.notes}
              onChange={e => setField('notes', e.target.value)}
              placeholder="Any special instructions or additional information..."
              className="form-input"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AppointmentFormModal;
