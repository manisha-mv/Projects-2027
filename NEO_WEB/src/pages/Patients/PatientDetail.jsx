// pages/Patients/PatientDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  RiArrowLeftLine,
  RiEditLine,
  RiPrinterLine,
  RiUserHeartLine,
  RiPhoneLine,
  RiMailLine,
  RiMapPinLine,
  RiShieldCrossLine,
  RiAlertLine,
  RiMedicineBottleLine,
  RiCalendarCheckLine,
  RiStethoscopeLine,
  RiFlaskLine,
  RiFileList3Line,
  RiSyringeLine,
  RiHotelBedLine,
  RiMoneyDollarCircleLine,
  RiLogoutBoxRLine,
  RiHistoryLine,
  RiTimeLine,
} from 'react-icons/ri';
import Avatar from '../../components/ui/Avatar';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Tabs from '../../components/ui/Tabs';
import Toast from '../../components/ui/Toast';
import PatientFormModal from '../../components/patients/PatientFormModal';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../contexts/AuthContext';

const PROFILE_TABS = [
  { id: 'overview',          label: 'Overview',           icon: <RiUserHeartLine /> },
  { id: 'appointments',      label: 'Appointments',       icon: <RiCalendarCheckLine /> },
  { id: 'consultation',      label: 'Consultation',       icon: <RiStethoscopeLine /> },
  { id: 'laboratory',        label: 'Laboratory',          icon: <RiFlaskLine /> },
  { id: 'radiology',         label: 'Radiology',           icon: <RiFileList3Line /> },
  { id: 'pharmacy',          label: 'Pharmacy',            icon: <RiMedicineBottleLine /> },
  { id: 'nursing',           label: 'Nursing',             icon: <RiSyringeLine /> },
  { id: 'ipd',               label: 'IPD Ward',            icon: <RiHotelBedLine /> },
  { id: 'billing',           label: 'Billing',             icon: <RiMoneyDollarCircleLine /> },
  { id: 'discharge',         label: 'Discharge',           icon: <RiLogoutBoxRLine /> },
  { id: 'followup',          label: 'Follow-up',           icon: <RiCalendarCheckLine /> },
  { id: 'treatment-history', label: 'Treatment History',  icon: <RiHistoryLine /> },
  { id: 'activity-audit',    label: 'Activity & Audit',    icon: <RiTimeLine /> },
];

const PatientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Edit Modal & Toast
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const userRole = user?.role ? user.role.toUpperCase() : 'RECEPTIONIST';
  const canEdit = ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(userRole);

  const fetchPatientDetails = async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatientById(id);
      if (res && res.patient) {
        setPatient(res.patient);
      } else {
        setPatient(null);
      }
    } catch (err) {
      console.error('Error fetching patient details', err);
      setToast({ type: 'error', message: 'Failed to load patient record.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleUpdatePatient = async (formData) => {
    setSubmitting(true);
    try {
      await patientService.updatePatient(patient.id || patient.patientId, formData);
      setToast({ type: 'success', message: 'Patient profile updated successfully.' });
      setIsEditModalOpen(false);
      fetchPatientDetails();
    } catch (err) {
      console.error('Error updating patient', err);
      setToast({ type: 'error', message: 'Failed to update patient profile.' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '60px 0' }}>
        <span className="spinner" style={{ margin: '0 auto 16px', display: 'block', width: 32, height: 32 }} />
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading patient record...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="page-container">
        <Button variant="ghost" onClick={() => navigate('/patients')} className="mb-4">
          <RiArrowLeftLine size={18} /> Back to Patients Directory
        </Button>
        <div className="card text-center py-5">
          <h2 style={{ fontSize: '1.25rem', marginBottom: '8px', color: 'var(--color-text-primary)' }}>
            Patient Not Found
          </h2>
          <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
            No patient matching ID "{id}" was found in the hospital registry.
          </p>
          <Button variant="primary" onClick={() => navigate('/patients')}>
            Return to Patients Directory
          </Button>
        </div>
      </div>
    );
  }

  const patientName = patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim();
  const addressFormatted = patient.contact?.address
    ? `${patient.contact.address.street ? `${patient.contact.address.street}, ` : ''}${patient.contact.address.city || ''}, ${patient.contact.address.state || ''} ${patient.contact.address.postalCode || ''}`.trim()
    : 'Not provided';

  return (
    <div className="page-container">
      {/* Top Navigation Strip */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <Button variant="ghost" onClick={() => navigate('/patients')}>
          <RiArrowLeftLine size={18} /> Back to Patients Directory
        </Button>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <RiPrinterLine size={16} /> Print Profile
          </Button>
          {canEdit && (
            <Button variant="primary" size="sm" onClick={() => setIsEditModalOpen(true)}>
              <RiEditLine size={16} /> Edit Patient Record
            </Button>
          )}
        </div>
      </div>

      {/* Patient Header Summary Banner */}
      <div className="patient-banner-card">
        <div className="patient-banner-main">
          <Avatar name={patientName} size="lg" />
          <div>
            <div className="patient-banner-title">
              {patientName}
              <span className="patient-banner-id">{patient.patientId || patient.id}</span>
              <Badge variant={patient.status === 'Inpatient' ? 'warning' : 'success'}>
                {patient.status || 'Active'}
              </Badge>
            </div>

            <div className="patient-banner-meta">
              <span><strong>Age/Gender:</strong> {patient.age != null ? `${patient.age} yrs` : 'N/A'}, {patient.gender}</span>
              <span className="dot-sep">•</span>
              <span><strong>Blood Group:</strong> <Badge variant="error" size="sm">{patient.bloodGroup || 'Unknown'}</Badge></span>
              <span className="dot-sep">•</span>
              <span><strong>Registered:</strong> {patient.registeredDate || patient.createdAt?.slice(0, 10) || '2025-01-10'}</span>
            </div>
          </div>
        </div>

        {/* Quick Emergency Callout */}
        {patient.emergencyContact?.name && (
          <div className="patient-banner-emergency">
            <RiShieldCrossLine size={20} color="#DC2626" />
            <div>
              <div className="emergency-label">EMERGENCY CONTACT</div>
              <div className="emergency-val">
                {patient.emergencyContact.name} ({patient.emergencyContact.relation || 'Contact'}) —{' '}
                <a href={`tel:${patient.emergencyContact.phone}`} style={{ color: '#DC2626', fontWeight: 600 }}>
                  {patient.emergencyContact.phone}
                </a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="patient-tabs-wrapper mt-4">
        <Tabs tabs={PROFILE_TABS} active={activeTab} onChange={setActiveTab} />
      </div>

      {/* Tab Content Panel */}
      <div className="patient-tab-content mt-4">
        {activeTab === 'overview' ? (
          <div className="patient-overview-grid">
            {/* Left Column */}
            <div className="overview-left-col">
              {/* Personal Information */}
              <div className="card">
                <h3 className="card-title-with-icon">
                  <RiUserHeartLine size={18} /> Demographics & Basic Information
                </h3>
                <div className="info-grid-2 mt-3">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{patientName}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Patient ID</span>
                    <span className="info-value font-mono">{patient.patientId || patient.id}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Date of Birth</span>
                    <span className="info-value">{patient.dateOfBirth || 'Not specified'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Calculated Age</span>
                    <span className="info-value">{patient.age != null ? `${patient.age} years` : 'N/A'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{patient.gender}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Blood Group</span>
                    <span className="info-value">{patient.bloodGroup || 'Unknown'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Marital Status</span>
                    <span className="info-value">{patient.maritalStatus || 'Single'}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Occupation</span>
                    <span className="info-value">{patient.occupation || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {/* Known Allergies */}
              <div className="card mt-4">
                <h3 className="card-title-with-icon" style={{ color: '#DC2626' }}>
                  <RiAlertLine size={18} /> Known Allergies & Sensitivities
                </h3>
                {Array.isArray(patient.allergies) && patient.allergies.length > 0 ? (
                  <div className="allergies-list mt-3">
                    {patient.allergies.map((allergy, idx) => (
                      <div key={idx} className="allergy-chip">
                        <div>
                          <strong>{allergy.substance || allergy}</strong>
                          {allergy.reaction && <div className="allergy-sub">Reaction: {allergy.reaction}</div>}
                        </div>
                        <Badge variant={allergy.severity === 'Severe' ? 'error' : 'warning'} size="sm">
                          {allergy.severity || 'Moderate'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                    No known allergies or substance sensitivities documented for this patient.
                  </p>
                )}
              </div>

              {/* Medical History */}
              <div className="card mt-4">
                <h3 className="card-title-with-icon">
                  <RiStethoscopeLine size={18} /> Medical History & Chronic Conditions
                </h3>
                {Array.isArray(patient.medicalHistory) && patient.medicalHistory.length > 0 ? (
                  <div className="history-timeline mt-3">
                    {patient.medicalHistory.map((item, idx) => (
                      <div key={idx} className="history-timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-title">
                            {item.condition || item}
                            {item.since && <span className="timeline-since"> (Since {item.since})</span>}
                          </div>
                          {item.notes && <div className="timeline-notes">{item.notes}</div>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                    No prior chronic conditions recorded.
                  </p>
                )}
              </div>
            </div>

            {/* Right Column */}
            <div className="overview-right-col">
              {/* Contact Information */}
              <div className="card">
                <h3 className="card-title-with-icon">
                  <RiPhoneLine size={18} /> Contact & Residential Address
                </h3>
                <div className="contact-list mt-3">
                  <div className="contact-list-item">
                    <RiPhoneLine className="icon" />
                    <div>
                      <div className="label">Primary Phone</div>
                      <div className="val">{patient.contact?.phone || patient.phone || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="contact-list-item">
                    <RiMailLine className="icon" />
                    <div>
                      <div className="label">Email Address</div>
                      <div className="val">{patient.contact?.email || patient.email || 'Not provided'}</div>
                    </div>
                  </div>

                  <div className="contact-list-item">
                    <RiMapPinLine className="icon" />
                    <div>
                      <div className="label">Residential Address</div>
                      <div className="val">{addressFormatted}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact Card */}
              <div className="card mt-4 emergency-highlight-card">
                <h3 className="card-title-with-icon" style={{ color: '#991B1B' }}>
                  <RiShieldCrossLine size={18} /> Emergency Contact Person
                </h3>
                {patient.emergencyContact?.name ? (
                  <div className="mt-3">
                    <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#7F1D1D' }}>
                      {patient.emergencyContact.name}
                    </div>
                    <div style={{ fontSize: '0.85rem', color: '#991B1B', marginBottom: '8px' }}>
                      Relationship: <strong>{patient.emergencyContact.relation || 'Relative'}</strong>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.95rem', fontWeight: 600, color: '#B91C1C' }}>
                      <RiPhoneLine /> {patient.emergencyContact.phone}
                    </div>
                  </div>
                ) : (
                  <p className="text-muted mt-2" style={{ fontSize: 'var(--text-sm)' }}>
                    No emergency contact information specified.
                  </p>
                )}
              </div>

              {/* Admin Notes */}
              <div className="card mt-4">
                <h3 className="card-title-with-icon">
                  <RiFileList3Line size={18} /> Clinical & Admin Notes
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', marginTop: '8px' }}>
                  {patient.notes || 'No administrative notes attached to this record.'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Placeholder Coming Soon tab container for future phases */
          <div className="card text-center py-5">
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--color-primary-light)',
              color: 'var(--color-primary)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
              fontSize: '28px'
            }}>
              {PROFILE_TABS.find(t => t.id === activeTab)?.icon}
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {PROFILE_TABS.find(t => t.id === activeTab)?.label} Module Integration Pending
            </h3>
            <p style={{ maxWidth: '480px', margin: '0 auto 20px', color: 'var(--color-text-secondary)', fontSize: 'var(--text-sm)' }}>
              Patient records for <strong>{patientName} ({patient.patientId || patient.id})</strong> are linked. This section will automatically show real-time data when the {PROFILE_TABS.find(t => t.id === activeTab)?.label} module is connected in subsequent project phases.
            </p>
            <Badge variant="info">Phase Integration Placeholder</Badge>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <PatientFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdatePatient}
        initialData={patient}
        isLoading={submitting}
      />

      {/* Toast Notification */}
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

export default PatientDetail;
