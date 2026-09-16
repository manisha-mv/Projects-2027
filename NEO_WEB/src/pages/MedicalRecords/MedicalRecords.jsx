// pages/MedicalRecords/MedicalRecords.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiFileTextLine,
  RiSearchLine,
  RiCalendarEventLine,
  RiFlaskLine,
  RiScanLine,
  RiMedicineBottleLine,
  RiHotelBedLine,
  RiFolder2Line,
  RiUpload2Line,
  RiDownloadLine,
  RiEyeLine,
  RiRefreshLine,
  RiShieldCrossLine,
  RiUserHeartLine,
  RiHeartPulseLine,
} from 'react-icons/ri';
import emrService from '../../services/emrService';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';

const SAMPLE_PATIENTS = [
  { id: 'P10025', name: 'Arun Kumar' },
  { id: 'P10033', name: 'Sunita Iyer' },
  { id: 'P10041', name: 'Rahul Sharma' },
  { id: 'P10067', name: 'Rajesh Nair' },
  { id: 'P10089', name: 'Lakshmi Pillai' },
];

export default function MedicalRecords() {
  const { addToast } = useToast();
  const { user, role } = useAuth();
  const initialPatientId = (role === 'PATIENT' && (user?.patientId || user?.id)) ? (user?.patientId || user?.id) : 'P10025';
  const [patientIdInput, setPatientIdInput] = useState(initialPatientId);
  const [emrData, setEmrData]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState(null);
  const [activeTab, setActiveTab] = useState('appointments');

  const fetchEMR = useCallback(async (id) => {
    if (!id?.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await emrService.getPatientEMR(id.trim());
      setEmrData(res?.emr || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEMR(initialPatientId); }, [fetchEMR, initialPatientId]);

  const handleSearch = (e) => { e?.preventDefault(); fetchEMR(patientIdInput); };
  const handleQuickSelect = (id) => { setPatientIdInput(id); fetchEMR(id); };

  // ── Tab metadata ──────────────────────────────────────────────────────────
  const tabs = [
    { key: 'appointments',  label: 'Consultations',   icon: <RiCalendarEventLine />, count: emrData?.appointments?.length || 0 },
    { key: 'labs',          label: 'Lab Orders',       icon: <RiFlaskLine />,         count: emrData?.labOrders?.length || 0 },
    { key: 'radiology',     label: 'Radiology Scans',  icon: <RiScanLine />,          count: emrData?.radiologyOrders?.length || 0 },
    { key: 'prescriptions', label: 'Prescriptions',    icon: <RiMedicineBottleLine />,count: emrData?.prescriptions?.length || 0 },
    { key: 'admissions',    label: 'IPD Admissions',   icon: <RiHotelBedLine />,      count: emrData?.admissions?.length || 0 },
    { key: 'documents',     label: 'Documents',        icon: <RiFolder2Line />,       count: 3 },
  ];

  // ── Table column sets ─────────────────────────────────────────────────────
  const appointmentColumns = [
    {
      key: 'appointmentDate', label: 'DATE', width: '130px',
      render: (val) => <span style={{ fontWeight: 600, fontFamily: 'monospace' }}>{val}</span>,
    },
    {
      key: 'doctorName', label: 'ATTENDING PHYSICIAN', width: '210px',
      render: (val) => (
        <div className="table-patient-cell">
          <Avatar name={val || 'Doctor'} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">Consultant Specialist</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department', label: 'DEPARTMENT', width: '150px',
      render: (val) => <Badge variant="secondary" size="sm">{val}</Badge>,
    },
    { key: 'type', label: 'VISIT TYPE', width: '120px' },
    {
      key: 'status', label: 'STATUS', width: '110px',
      render: (val) => <Badge variant="success" size="sm">{val}</Badge>,
    },
  ];

  const labColumns = [
    {
      key: 'orderId', label: 'ORDER ID', width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'testName', label: 'TEST PANEL', width: '200px',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiFlaskLine style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <strong style={{ fontSize: '13px' }}>{val}</strong>
        </div>
      ),
    },
    {
      key: 'urgency', label: 'URGENCY', width: '100px',
      render: (val) => <Badge variant={val === 'STAT' ? 'danger' : val === 'Urgent' ? 'warning' : 'secondary'} size="sm">{val}</Badge>,
    },
    {
      key: 'result', label: 'RESULT', width: '150px',
      render: (val) => (
        <span style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
          {val?.value || 'Pending Labs'}
        </span>
      ),
    },
    {
      key: 'status', label: 'STATUS', width: '110px',
      render: (val) => <Badge variant="success" size="sm">{val}</Badge>,
    },
  ];

  const radiologyColumns = [
    {
      key: 'orderId', label: 'SCAN ID', width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'modality', label: 'MODALITY', width: '120px',
      render: (val) => <Badge variant="info" size="sm">{val}</Badge>,
    },
    { key: 'bodyPart', label: 'BODY REGION', width: '140px' },
    {
      key: 'impression', label: 'RADIOLOGIST IMPRESSION',
      render: (val) => <span style={{ fontSize: '13px', color: val ? 'inherit' : 'var(--color-text-muted)' }}>{val || 'Pending Imaging Report'}</span>,
    },
    {
      key: 'status', label: 'STATUS', width: '130px',
      render: (val) => <Badge variant="success" size="sm">{val}</Badge>,
    },
  ];

  const prescriptionColumns = [
    {
      key: 'prescriptionId', label: 'RX REF', width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    { key: 'prescribedDate', label: 'DATE', width: '120px' },
    {
      key: 'doctorName', label: 'PRESCRIBING DOCTOR', width: '190px',
      render: (val) => (
        <div className="table-patient-cell">
          <Avatar name={val || 'Doctor'} size="sm" />
          <span style={{ fontWeight: 600, fontSize: '13px' }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'medicines', label: 'MEDICINES & DOSAGE',
      render: (val) => (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
          {val?.map((m, i) => (
            <span key={i} style={{ background: 'var(--color-surface-alt)', border: '1px solid var(--color-border)', padding: '2px 8px', borderRadius: '5px', fontSize: '12px', fontWeight: 500 }}>
              💊 {m.name} ({m.dosage || '1-0-1'})
            </span>
          ))}
        </div>
      ),
    },
    {
      key: 'status', label: 'STATUS', width: '110px',
      render: (val) => <Badge variant="success" size="sm">{val}</Badge>,
    },
  ];

  const admissionColumns = [
    {
      key: 'admissionId', label: 'ADMISSION ID', width: '140px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'ward', label: 'WARD & BED', width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>🏥 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Bed #{row.bedId}</div>
        </div>
      ),
    },
    {
      key: 'admitDate', label: 'ADMITTED', width: '120px',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{val}</span>,
    },
    { key: 'diagnosis', label: 'DIAGNOSIS / REASON' },
    {
      key: 'status', label: 'STATUS', width: '110px',
      render: (val) => <Badge variant="warning" size="sm">{val}</Badge>,
    },
  ];

  const documentRows = [
    { name: 'Discharge_Summary_ArunKumar.pdf', category: 'Discharge Summary', date: '2026-08-14', size: '1.2 MB' },
    { name: 'Chest_XRay_DigitalScan.png', category: 'Radiology Imaging', date: '2026-08-12', size: '3.4 MB' },
    { name: 'Consent_Form_Signed.pdf', category: 'Legal Consent', date: '2026-08-10', size: '450 KB' },
  ];

  const documentColumns = [
    {
      key: 'name', label: 'DOCUMENT NAME',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <RiFileTextLine style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <strong style={{ fontSize: '13px' }}>{val}</strong>
        </div>
      ),
    },
    {
      key: 'category', label: 'CATEGORY', width: '160px',
      render: (val) => <Badge variant="primary" size="sm">{val}</Badge>,
    },
    { key: 'date', label: 'DATE', width: '120px' },
    { key: 'size', label: 'FILE SIZE', width: '100px' },
    {
      key: 'actions', label: 'ACTIONS', width: '170px', align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
          <Button variant="outline" size="sm" onClick={() => addToast({ type: 'info', title: 'Document View', message: `Opening ${row.name}...` })}>
            <RiEyeLine size={15} /> View
          </Button>
          <Button variant="ghost" size="sm" onClick={() => addToast({ type: 'success', title: 'Download Started', message: `Downloading ${row.name}...` })}>
            <RiDownloadLine size={15} /> Download
          </Button>
        </div>
      ),
    },
  ];

  const getTableProps = () => {
    switch (activeTab) {
      case 'appointments':  return { columns: appointmentColumns,   rows: emrData?.appointments || [],     emptyTitle: 'No consultation records' };
      case 'labs':          return { columns: labColumns,           rows: emrData?.labOrders || [],        emptyTitle: 'No lab orders on record' };
      case 'radiology':     return { columns: radiologyColumns,     rows: emrData?.radiologyOrders || [],  emptyTitle: 'No radiology scans on record' };
      case 'prescriptions': return { columns: prescriptionColumns,  rows: emrData?.prescriptions || [],    emptyTitle: 'No prescriptions on record' };
      case 'admissions':    return { columns: admissionColumns,     rows: emrData?.admissions || [],       emptyTitle: 'No IPD admissions on record' };
      case 'documents':     return { columns: documentColumns,      rows: documentRows,                    emptyTitle: 'No documents attached' };
      default:              return { columns: [], rows: [], emptyTitle: '' };
    }
  };

  const { columns, rows, emptyTitle } = getTableProps();

  return (
    <div className="module-page">
      {/* Page Header */}
      <PageHeader
        title="Central Medical Records (EMR)"
        description="Lifetime electronic health records, diagnostic reports, consultation history, and medical documents."
        primaryAction={
          <Button variant="outline" onClick={() => fetchEMR(patientIdInput)} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Reload EMR
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <RiCalendarEventLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Consultations</div>
            <div className="stat-pill-value">{emrData?.appointments?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
            <RiFlaskLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Lab Orders</div>
            <div className="stat-pill-value" style={{ color: '#F59E0B' }}>{emrData?.labOrders?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <RiScanLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Radiology Scans</div>
            <div className="stat-pill-value" style={{ color: '#16A34A' }}>{emrData?.radiologyOrders?.length || 0}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F3E8FF', color: '#7C3AED' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">IPD Admissions</div>
            <div className="stat-pill-value">{emrData?.admissions?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Search & Patient Selector Bar */}
      <div className="module-filter-bar">
        <form onSubmit={handleSearch} className="module-search-box" style={{ flex: 1 }}>
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Enter Patient ID (e.g. P10025, P10033)..."
            value={patientIdInput}
            onChange={e => setPatientIdInput(e.target.value)}
          />
        </form>
        <div className="module-filters-group">
          <select
            className="form-select"
            style={{ width: 200, height: 38 }}
            value={patientIdInput}
            onChange={e => handleQuickSelect(e.target.value)}
          >
            {SAMPLE_PATIENTS.map(p => (
              <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
            ))}
          </select>
          <Button variant="primary" size="sm" onClick={() => fetchEMR(patientIdInput)} disabled={loading}>
            {loading ? <Spinner size="sm" /> : <><RiSearchLine size={15} /> Load EMR</>}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => { setPatientIdInput('P10025'); fetchEMR('P10025'); }}>
            <RiRefreshLine size={15} /> Reset
          </Button>
        </div>
      </div>

      {/* Body */}
      {loading ? (
        <div className="loading-center" style={{ minHeight: 240 }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchEMR(patientIdInput)} />
      ) : !emrData?.patient ? (
        <EmptyState
          icon={<RiFileTextLine />}
          title="Patient EMR Not Found"
          subtitle="Enter a valid Patient ID above and click 'Load EMR' to view complete medical history."
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>

          {/* Patient Banner Card */}
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
                  <span><strong>Age / Gender:</strong> {emrData.patient.age != null ? `${emrData.patient.age} yrs` : 'N/A'}, {emrData.patient.gender}</span>
                  <span className="dot-sep">•</span>
                  <span><strong>Blood Group:</strong> <Badge variant="error" size="sm">{emrData.patient.bloodGroup || 'Unknown'}</Badge></span>
                  <span className="dot-sep">•</span>
                  <span><strong>Phone:</strong> {emrData.patient.contact?.phone || 'N/A'}</span>
                </div>
              </div>
            </div>
            <div className="patient-banner-emergency">
              <RiShieldCrossLine size={20} color="#DC2626" />
              <div>
                <div className="emergency-label">MEDICAL ALERT &amp; ALLERGIES</div>
                <div className="emergency-val" style={{ color: '#DC2626', fontWeight: 600 }}>
                  {emrData.patient.allergies?.map(a => a.substance).join(', ') || 'No known drug allergies'}
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {tabs.map(t => (
              <button
                key={t.key}
                className={`tab-item ${activeTab === t.key ? 'active' : ''}`}
                onClick={() => setActiveTab(t.key)}
              >
                {t.icon} {t.label} ({t.count})
              </button>
            ))}
          </div>

          {/* Document Upload Bar (only for Documents tab) */}
          {activeTab === 'documents' && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-surface-alt)', padding: '14px 18px', borderRadius: 'var(--radius-lg)', border: '1.5px dashed var(--color-border-strong)' }}>
              <div>
                <strong style={{ fontSize: '14px' }}>Upload External Medical Document</strong>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', margin: '3px 0 0' }}>
                  Attach lab scans, consent forms, discharge summaries (PDF, PNG, JPG — up to 10MB)
                </p>
              </div>
              <label className="btn btn-primary" style={{ cursor: 'pointer', gap: '6px' }}>
                <RiUpload2Line /> Upload Document
                <input
                  type="file"
                  style={{ display: 'none' }}
                  onChange={e => {
                    const file = e.target.files[0];
                    if (file) addToast({ type: 'success', title: 'File Uploaded', message: `Uploaded ${file.name} successfully.` });
                  }}
                />
              </label>
            </div>
          )}

          {/* Table */}
          <Table
            columns={columns}
            rows={rows}
            loading={false}
            emptyTitle={emptyTitle}
            emptyDescription="No records available for this section."
          />
        </div>
      )}
    </div>
  );
}
