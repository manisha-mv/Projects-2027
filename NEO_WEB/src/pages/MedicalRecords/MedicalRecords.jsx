// pages/MedicalRecords/MedicalRecords.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiFileTextLine,
  RiSearchLine,
  RiUserHeartLine,
  RiCalendarEventLine,
  RiFlaskLine,
  RiScanLine,
  RiMedicineBottleLine,
  RiHotelBedLine,
  RiFolder2Line,
  RiUpload2Line,
  RiAlertLine,
  RiDownloadLine,
  RiEyeLine,
  RiCheckDoubleLine,
  RiStethoscopeLine,
  RiPhoneLine,
  RiMailLine,
  RiShieldCrossLine,
  RiRefreshLine,
} from 'react-icons/ri';
import emrService from '../../services/emrService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import PageHeader from '../../components/common/PageHeader';

export default function MedicalRecords() {
  const { addToast } = useToast();
  const [patientIdInput, setPatientIdInput] = useState('P10025');
  const [emrData, setEmrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');

  const SAMPLE_PATIENTS = [
    { id: 'P10025', name: 'Arun Kumar' },
    { id: 'P10033', name: 'Sunita Iyer' },
    { id: 'P10041', name: 'Rahul Sharma' },
  ];

  const fetchEMR = useCallback(async (id) => {
    if (!id.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await emrService.getPatientEMR(id.trim());
      if (res && res.emr) {
        setEmrData(res.emr);
      } else {
        setEmrData(null);
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEMR('P10025');
  }, [fetchEMR]);

  const handleSearch = (e) => {
    e?.preventDefault();
    fetchEMR(patientIdInput);
  };

  const handleQuickSelect = (id) => {
    setPatientIdInput(id);
    fetchEMR(id);
  };

  const handleResetFilters = () => {
    setPatientIdInput('P10025');
    fetchEMR('P10025');
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Central Medical Records (EMR)"
        description="Lifetime electronic health records, diagnostic reports, and medical history."
        primaryAction={
          <Button variant="primary" onClick={() => fetchEMR(patientIdInput)}>
            <RiRefreshLine size={18} />
            Reload EMR
          </Button>
        }
      />

      {/* KPI Stats Strip (Matching Patients Page Screenshot 1) */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiCalendarEventLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Consultations</div>
            <div className="stat-pill-value">{emrData?.appointments?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiFlaskLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Lab Diagnostic Orders</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{emrData?.labOrders?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiScanLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Radiology Scans</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{emrData?.radiologyOrders?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Admissions Record</div>
            <div className="stat-pill-value">{emrData?.admissions?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar (Matching Patients Page Screenshot 1) */}
      <div className="patient-filter-bar">
        <form onSubmit={handleSearch} className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Enter Patient ID (e.g. P10025, P10033)..."
            value={patientIdInput}
            onChange={(e) => setPatientIdInput(e.target.value)}
            className="search-input"
          />
        </form>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Quick Patient:</span>
            <select
              value={patientIdInput}
              onChange={(e) => handleQuickSelect(e.target.value)}
              className="filter-select"
            >
              {SAMPLE_PATIENTS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.id})
                </option>
              ))}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="loading-center" style={{ minHeight: '240px' }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchEMR(patientIdInput)} />
      ) : !emrData || !emrData.patient ? (
        <EmptyState icon={<RiFileTextLine />} title="Patient EMR Not Found" subtitle="Enter a valid Patient ID to load complete medical history." />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Patient Overview Summary Banner (Patients Section Standard) */}
          <div className="patient-banner-card">
            <div className="patient-banner-main">
              <Avatar name={emrData.patient.name || 'Patient'} size="lg" />
              <div>
                <div className="patient-banner-title">
                  {emrData.patient.name}
                  <span className="patient-banner-id">{emrData.patient.patientId}</span>
                  <Badge variant={emrData.patient.status === 'Inpatient' ? 'warning' : 'success'} size="sm">
                    {emrData.patient.status || 'Active'}
                  </Badge>
                </div>

                <div className="patient-banner-meta">
                  <span><strong>Age/Gender:</strong> {emrData.patient.age != null ? `${emrData.patient.age} yrs` : 'N/A'}, {emrData.patient.gender}</span>
                  <span className="dot-sep">•</span>
                  <span><strong>Blood Group:</strong> <Badge variant="error" size="sm">{emrData.patient.bloodGroup || 'Unknown'}</Badge></span>
                  <span className="dot-sep">•</span>
                  <span><strong>Phone:</strong> {emrData.patient.contact?.phone || '+91 98765 43210'}</span>
                </div>
              </div>
            </div>

            {/* Quick Emergency & Allergy Alert Callout */}
            <div className="patient-banner-emergency">
              <RiShieldCrossLine size={20} color="#DC2626" />
              <div>
                <div className="emergency-label">MEDICAL ALERT & ALLERGIES</div>
                <div className="emergency-val" style={{ color: '#DC2626', fontWeight: 600 }}>
                  {emrData.patient.allergies?.map(a => a.substance).join(', ') || 'No known drug allergies'}
                </div>
              </div>
            </div>
          </div>

          {/* EMR Sub-tabs */}
          <div className="module-tabs">
            <button className={`module-tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
              <RiCalendarEventLine /> Consultations ({emrData.appointments?.length || 0})
            </button>
            <button className={`module-tab ${activeTab === 'labs' ? 'active' : ''}`} onClick={() => setActiveTab('labs')}>
              <RiFlaskLine /> Lab Orders ({emrData.labOrders?.length || 0})
            </button>
            <button className={`module-tab ${activeTab === 'radiology' ? 'active' : ''}`} onClick={() => setActiveTab('radiology')}>
              <RiScanLine /> Radiology Scans ({emrData.radiologyOrders?.length || 0})
            </button>
            <button className={`module-tab ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
              <RiMedicineBottleLine /> Prescriptions ({emrData.prescriptions?.length || 0})
            </button>
            <button className={`module-tab ${activeTab === 'admissions' ? 'active' : ''}`} onClick={() => setActiveTab('admissions')}>
              <RiHotelBedLine /> IPD Admissions ({emrData.admissions?.length || 0})
            </button>
            <button className={`module-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              <RiFolder2Line /> Attached Scans & Files (3)
            </button>
          </div>

          {/* EMR Tab Contents with Doctors Avatar and Patients Section Standards */}
          <div className="table-card">
            {activeTab === 'appointments' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>CONSULTATION DATE</th>
                    <th>ATTENDING PHYSICIAN</th>
                    <th>DEPARTMENT</th>
                    <th>VISIT TYPE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {emrData.appointments?.map(a => (
                    <tr key={a.id || a.appointmentId}>
                      <td style={{ fontWeight: 600 }}>{a.appointmentDate}</td>
                      <td>
                        <div className="table-patient-cell">
                          <Avatar name={a.doctorName || 'Doctor'} size="sm" />
                          <div>
                            <div className="table-patient-name">{a.doctorName}</div>
                            <div className="table-patient-sub">Consultant Specialist</div>
                          </div>
                        </div>
                      </td>
                      <td><Badge variant="secondary" size="sm">{a.department}</Badge></td>
                      <td>{a.type}</td>
                      <td><Badge variant="success" size="sm">{a.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'labs' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>LAB ORDER ID</th>
                    <th>TEST PANEL NAME</th>
                    <th>URGENCY LEVEL</th>
                    <th>TEST RESULT VALUE</th>
                    <th>ORDER STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {emrData.labOrders?.map(l => (
                    <tr key={l.id || l.orderId}>
                      <td><span className="patient-id-badge">{l.orderId}</span></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <RiFlaskLine style={{ color: 'var(--color-primary)' }} />
                          <strong>{l.testName}</strong>
                        </div>
                      </td>
                      <td>{l.urgency}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{l.result?.value || 'Pending Labs'}</td>
                      <td><Badge variant="success" size="sm">{l.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'radiology' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>SCAN ORDER ID</th>
                    <th>MODALITY</th>
                    <th>ANATOMICAL REGION</th>
                    <th>RADIOLOGIST CLINICAL IMPRESSION</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {emrData.radiologyOrders?.map(r => (
                    <tr key={r.id || r.orderId}>
                      <td><span className="patient-id-badge">{r.orderId}</span></td>
                      <td><Badge variant="info" size="sm">{r.modality}</Badge></td>
                      <td>{r.bodyPart}</td>
                      <td>{r.impression || 'Pending Imaging Report'}</td>
                      <td><Badge variant="success" size="sm">{r.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'prescriptions' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>RX REF ID</th>
                    <th>PRESCRIBED DATE</th>
                    <th>PRESCRIBING DOCTOR</th>
                    <th>MEDICINES & DOSAGE SCHEDULE</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {emrData.prescriptions?.map(p => (
                    <tr key={p.id || p.prescriptionId}>
                      <td><span className="patient-id-badge">{p.prescriptionId}</span></td>
                      <td>{p.prescribedDate}</td>
                      <td>
                        <div className="table-patient-cell">
                          <Avatar name={p.doctorName || 'Doctor'} size="sm" />
                          <span>{p.doctorName}</span>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          {p.medicines?.map((m, idx) => (
                            <span key={idx} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 500 }}>
                              {m.name} ({m.dosage || '1-0-1'})
                            </span>
                          ))}
                        </div>
                      </td>
                      <td><Badge variant="success" size="sm">{p.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'admissions' && (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>ADMISSION ID</th>
                    <th>WARD & BED UNIT</th>
                    <th>ADMIT DATE</th>
                    <th>DIAGNOSIS</th>
                    <th>STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {emrData.admissions?.map(adm => (
                    <tr key={adm.id || adm.admissionId}>
                      <td><span className="patient-id-badge">{adm.admissionId}</span></td>
                      <td><strong>{adm.ward}</strong> (Bed {adm.bedId})</td>
                      <td>{adm.admitDate}</td>
                      <td>{adm.diagnosis}</td>
                      <td><Badge variant="warning" size="sm">{adm.status}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === 'documents' && (
              <div>
                <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-alt)', padding: '16px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--color-border-strong)' }}>
                  <div>
                    <strong style={{ fontSize: '15px' }}>Upload External Medical Document</strong>
                    <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '2px 0 0 0' }}>Attach lab scans, consent forms, discharge summaries (PDF, PNG, JPG up to 10MB)</p>
                  </div>
                  <label className="btn btn-primary" style={{ cursor: 'pointer' }}>
                    <RiUpload2Line /> Upload Document
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          addToast({ type: 'success', title: 'File Uploaded', message: `Uploaded ${file.name} successfully.` });
                        }
                      }}
                    />
                  </label>
                </div>

                <table className="data-table">
                  <thead>
                    <tr>
                      <th>DOCUMENT NAME</th>
                      <th>CATEGORY</th>
                      <th>UPLOAD DATE</th>
                      <th>FILE SIZE</th>
                      <th style={{ textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Discharge_Summary_ArunKumar.pdf', category: 'Discharge Summary', date: '2026-08-14', size: '1.2 MB' },
                      { name: 'Chest_XRay_DigitalScan.png', category: 'Radiology Imaging', date: '2026-08-12', size: '3.4 MB' },
                      { name: 'Consent_Form_Signed.pdf', category: 'Legal Consent', date: '2026-08-10', size: '450 KB' },
                    ].map((doc, idx) => (
                      <tr key={idx}>
                        <td><strong>{doc.name}</strong></td>
                        <td><Badge variant="primary" size="sm">{doc.category}</Badge></td>
                        <td>{doc.date}</td>
                        <td>{doc.size}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'Document View', message: `Opening ${doc.name}...` })}>
                              <RiEyeLine size={16} /> View
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'success', title: 'Download Started', message: `Downloading ${doc.name}...` })}>
                              <RiDownloadLine size={16} /> Download
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}



