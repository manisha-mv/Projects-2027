// components/patients/PatientFormModal.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Alert from '../ui/Alert';
import { generateNextPatientId } from '../../services/patientService';

const INITIAL_FORM_STATE = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  gender: 'Male',
  bloodGroup: 'O+',
  phone: '',
  email: '',
  addressStreet: '',
  addressCity: 'Bengaluru',
  addressState: 'Karnataka',
  addressPostalCode: '',
  emergencyName: '',
  emergencyRelation: 'Spouse',
  emergencyPhone: '',
  allergiesString: '',
  medicalHistoryNotes: '',
  status: 'Active',
  notes: '',
};

const PatientFormModal = ({ isOpen, onClose, onSubmit, initialData = null, isLoading = false }) => {
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [errors, setErrors] = useState({});
  const [previewId, setPreviewId] = useState('');

  const isEdit = Boolean(initialData?.id || initialData?.patientId);

  useEffect(() => {
    if (isOpen) {
      setErrors({});
      if (initialData) {
        setFormData({
          firstName: initialData.firstName || initialData.name?.split(' ')[0] || '',
          lastName: initialData.lastName || initialData.name?.split(' ').slice(1).join(' ') || '',
          dateOfBirth: initialData.dateOfBirth || '',
          gender: initialData.gender || 'Male',
          bloodGroup: initialData.bloodGroup || 'O+',
          phone: initialData.contact?.phone || initialData.phone || '',
          email: initialData.contact?.email || initialData.email || '',
          addressStreet: initialData.contact?.address?.street || initialData.addressStreet || '',
          addressCity: initialData.contact?.address?.city || initialData.addressCity || 'Bengaluru',
          addressState: initialData.contact?.address?.state || initialData.addressState || 'Karnataka',
          addressPostalCode: initialData.contact?.address?.postalCode || initialData.addressPostalCode || '',
          emergencyName: initialData.emergencyContact?.name || initialData.emergencyName || '',
          emergencyRelation: initialData.emergencyContact?.relation || initialData.emergencyRelation || 'Spouse',
          emergencyPhone: initialData.emergencyContact?.phone || initialData.emergencyPhone || '',
          allergiesString: Array.isArray(initialData.allergies)
            ? initialData.allergies.map(a => a.substance || a).join(', ')
            : (initialData.allergiesString || ''),
          medicalHistoryNotes: Array.isArray(initialData.medicalHistory)
            ? initialData.medicalHistory.map(m => `${m.condition}${m.notes ? ` (${m.notes})` : ''}`).join('\n')
            : (initialData.medicalHistoryNotes || ''),
          status: initialData.status || 'Active',
          notes: initialData.notes || '',
        });
        setPreviewId(initialData.patientId || initialData.id);
      } else {
        setFormData(INITIAL_FORM_STATE);
        setPreviewId(generateNextPatientId());
      }
    }
  }, [isOpen, initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errs = {};

    // 1. Name validation
    if (!formData.firstName.trim()) {
      errs.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      errs.lastName = 'Last name is required';
    }

    // 2. Date of birth
    if (!formData.dateOfBirth) {
      errs.dateOfBirth = 'Date of birth is required';
    } else {
      const dob = new Date(formData.dateOfBirth);
      if (dob > new Date()) {
        errs.dateOfBirth = 'Date of birth cannot be in the future';
      }
    }

    // 3. Gender
    if (!formData.gender) {
      errs.gender = 'Gender is required';
    }

    // 4. Phone validation
    const cleanPhone = formData.phone.replace(/[^0-9]/g, '');
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (cleanPhone.length < 10) {
      errs.phone = 'Valid phone number required (min 10 digits)';
    }

    // 5. Email validation if provided
    if (formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errs.email = 'Invalid email address format';
      }
    }

    // 6. Emergency contact validation
    if (!formData.emergencyName.trim()) {
      errs.emergencyName = 'Emergency contact name is required';
    }
    if (!formData.emergencyPhone.trim()) {
      errs.emergencyPhone = 'Emergency contact phone is required';
    } else {
      const cleanEmPhone = formData.emergencyPhone.replace(/[^0-9]/g, '');
      if (cleanEmPhone.length < 10) {
        errs.emergencyPhone = 'Valid emergency contact phone required (min 10 digits)';
      }
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onSubmit({
      ...formData,
      previewId,
    });
  };

  const modalFooter = (
    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', width: '100%' }}>
      <Button variant="outline" onClick={onClose} disabled={isLoading}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} disabled={isLoading}>
        {isLoading ? 'Saving...' : (isEdit ? 'Update Patient' : 'Register Patient')}
      </Button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? `Edit Patient — ${previewId}` : 'New Patient Registration'}
      footer={modalFooter}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="patient-form">
        {/* Patient ID Banner */}
        <div style={{
          background: 'var(--color-surface-alt)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          padding: 'var(--space-3) var(--space-4)',
          marginBottom: 'var(--space-4)',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
              Generated Patient ID
            </span>
            <div style={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '1.1rem', color: 'var(--color-primary)' }}>
              {previewId}
            </div>
          </div>
          <span style={{
            fontSize: 'var(--text-xs)',
            background: 'var(--color-primary-light)',
            color: 'var(--color-primary)',
            padding: '2px 8px',
            borderRadius: 'var(--radius-full)',
            fontWeight: 500
          }}>
            NEO-HMS Auto ID
          </span>
        </div>

        {Object.keys(errors).length > 0 && (
          <Alert
            type="error"
            title="Validation Errors"
            message="Please fix the highlighted fields below before submitting."
            className="mb-4"
          />
        )}

        {/* Section 1: Basic Information */}
        <div className="form-section">
          <h3 className="form-section-title">1. Basic Information</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">First Name</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="e.g. Rahul"
                className={`form-input ${errors.firstName ? 'error' : ''}`}
              />
              {errors.firstName && <span className="field-error">{errors.firstName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Last Name</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="e.g. Sharma"
                className={`form-input ${errors.lastName ? 'error' : ''}`}
              />
              {errors.lastName && <span className="field-error">{errors.lastName}</span>}
            </div>
          </div>

          <div className="form-grid-3 mt-3">
            <div className="form-group">
              <label className="form-label required">Date of Birth</label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={`form-input ${errors.dateOfBirth ? 'error' : ''}`}
              />
              {errors.dateOfBirth && <span className="field-error">{errors.dateOfBirth}</span>}
            </div>

            <div className="form-group">
              <label className="form-label required">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Blood Group</label>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="form-select"
              >
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="Unknown">Unknown</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Contact Details */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">2. Contact Details</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label required">Primary Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="e.g. +91 98765 43210"
                className={`form-input ${errors.phone ? 'error' : ''}`}
              />
              {errors.phone && <span className="field-error">{errors.phone}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="e.g. patient@example.com"
                className={`form-input ${errors.email ? 'error' : ''}`}
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Street Address</label>
            <input
              type="text"
              name="addressStreet"
              value={formData.addressStreet}
              onChange={handleChange}
              placeholder="House/Flat No., Street, Area"
              className="form-input"
            />
          </div>

          <div className="form-grid-3 mt-3">
            <div className="form-group">
              <label className="form-label">City</label>
              <input
                type="text"
                name="addressCity"
                value={formData.addressCity}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input
                type="text"
                name="addressState"
                value={formData.addressState}
                onChange={handleChange}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Postal Code</label>
              <input
                type="text"
                name="addressPostalCode"
                value={formData.addressPostalCode}
                onChange={handleChange}
                placeholder="560001"
                className="form-input"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Emergency Contact */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">3. Emergency Contact Details</h3>
          <div className="form-grid-3">
            <div className="form-group">
              <label className="form-label required">Contact Person Name</label>
              <input
                type="text"
                name="emergencyName"
                value={formData.emergencyName}
                onChange={handleChange}
                placeholder="e.g. Sunita Sharma"
                className={`form-input ${errors.emergencyName ? 'error' : ''}`}
              />
              {errors.emergencyName && <span className="field-error">{errors.emergencyName}</span>}
            </div>

            <div className="form-group">
              <label className="form-label">Relationship</label>
              <select
                name="emergencyRelation"
                value={formData.emergencyRelation}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Spouse">Spouse</option>
                <option value="Parent">Parent</option>
                <option value="Child">Child</option>
                <option value="Sibling">Sibling</option>
                <option value="Guardian">Guardian</option>
                <option value="Friend/Relative">Friend / Relative</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label required">Emergency Phone</label>
              <input
                type="tel"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="+91 98765 00000"
                className={`form-input ${errors.emergencyPhone ? 'error' : ''}`}
              />
              {errors.emergencyPhone && <span className="field-error">{errors.emergencyPhone}</span>}
            </div>
          </div>
        </div>

        {/* Section 4: Clinical History & Status */}
        <div className="form-section mt-4">
          <h3 className="form-section-title">4. Medical Profile & Initial Status</h3>
          <div className="form-grid-2">
            <div className="form-group">
              <label className="form-label">Known Allergies (Comma-separated)</label>
              <input
                type="text"
                name="allergiesString"
                value={formData.allergiesString}
                onChange={handleChange}
                placeholder="e.g. Penicillin, Peanuts, Latex"
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label">Initial Patient Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="form-select"
              >
                <option value="Active">Active (OPD)</option>
                <option value="Inpatient">Inpatient (Admitted IPD)</option>
                <option value="Outpatient">Outpatient</option>
                <option value="Discharged">Discharged</option>
              </select>
            </div>
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Existing Medical History / Conditions</label>
            <textarea
              name="medicalHistoryNotes"
              value={formData.medicalHistoryNotes}
              onChange={handleChange}
              rows={2}
              placeholder="e.g. Hypertension (2021), Type 2 Diabetes (2023)"
              className="form-input"
            />
          </div>

          <div className="form-group mt-3">
            <label className="form-label">Administrative Notes</label>
            <input
              type="text"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Optional notes or ward assignment details"
              className="form-input"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
};

export default PatientFormModal;
