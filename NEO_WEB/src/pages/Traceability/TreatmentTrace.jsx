// pages/Traceability/TreatmentTrace.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiRouteLine, RiSearchLine, RiTimeLine, RiFlaskLine, RiScanLine, RiMedicineBottleLine, RiHotelBedLine, RiScissorsLine, RiMoneyDollarCircleLine, RiSendPlane2Line, RiPulseLine } from 'react-icons/ri';
import { useAuth } from '../../contexts/AuthContext';
import traceabilityService from '../../services/traceabilityService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import PageHeader from '../../components/common/PageHeader';
import VisualTimeline from '../../components/traceability/VisualTimeline';

const ICON_MAP = {
  'Registration': <RiRouteLine />,
  'Appointment': <RiTimeLine />,
  'Check-In': <RiTimeLine />,
  'Consultation': <RiRouteLine />,
  'Lab Order': <RiFlaskLine />,
  'Lab Result': <RiFlaskLine />,
  'Radiology Order': <RiScanLine />,
  'Radiology Report': <RiScanLine />,
  'Prescription': <RiMedicineBottleLine />,
  'Pharmacy Dispense': <RiMedicineBottleLine />,
  'Admission': <RiHotelBedLine />,
  'Nursing Care': <RiPulseLine />,
  'Vitals Recorded': <RiPulseLine />,
  'Procedure': <RiScissorsLine />,
  'Surgery': <RiScissorsLine />,
  'Billing': <RiMoneyDollarCircleLine />,
  'Discharge': <RiSendPlane2Line />,
  'Follow-Up': <RiPulseLine />,
};

export default function TreatmentTrace() {
  const { user, role } = useAuth();
  const isPatient = role === 'PATIENT' || !!user?.patientId;
  const loggedInPatientId = user?.patientId || user?.id || 'P10025';

  const [patientIdInput, setPatientIdInput] = useState(loggedInPatientId);
  const [activePatientId, setActivePatientId] = useState(loggedInPatientId);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTimeline = useCallback(async (id) => {
    const targetId = isPatient ? loggedInPatientId : (id || loggedInPatientId);
    if (!targetId.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await traceabilityService.getPatientTimeline(targetId.trim());
      setTimelineEvents(res.events || []);
      setActivePatientId(targetId.trim());
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [isPatient, loggedInPatientId]);

  useEffect(() => {
    fetchTimeline(loggedInPatientId);
  }, [fetchTimeline, loggedInPatientId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchTimeline(patientIdInput);
  };

  const STEPS_SEQUENCE = [
    'Registration',
    'Appointment',
    'Check-in',
    'Consultation',
    'Lab',
    'Radiology',
    'Prescription',
    'Pharmacy',
    'Admission',
    'Nursing',
    'Procedure',
    'Billing',
    'Discharge',
    'Follow-up'
  ];

  return (
    <div className="module-page">
      <PageHeader
        title={isPatient ? "My Treatment Progress & Care Journey" : "Treatment Traceability System"}
        subtitle={isPatient ? "End-to-end clinical workflow sequence and verifiable care progress for logged-in patient." : "End-to-end verifiable clinical workflow sequence and patient audit trail"}
        icon={<RiRouteLine />}
      />

      {isPatient ? (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
          borderRadius: '12px',
          border: '1px solid #BFDBFE',
          marginBottom: '20px',
          display: 'flex',
          justify: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', color: '#1E40AF' }}>
              📍 Care Journey &amp; Treatment Progress: {user?.name || 'Logged-In Patient'}
            </div>
            <div style={{ fontSize: '13px', color: '#1E3A8A', marginTop: '2px' }}>
              Patient ID: <strong>{loggedInPatientId}</strong> • Displaying your step-by-step treatment lifecycle, doctor visits, and nursing care events.
            </div>
          </div>
          <span style={{ padding: '6px 14px', background: '#2563EB', color: '#FFF', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
            Patient Progress View
          </span>
        </div>
      ) : (
        /* Patient Search for Staff */
        <div className="filter-bar">
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', flex: 1 }}>
            <div className="search-box" style={{ flex: 1 }}>
              <RiSearchLine className="search-icon" />
              <input
                className="search-input"
                placeholder="Enter Patient ID (e.g. P10025, P10033, P10047)..."
                value={patientIdInput}
                onChange={(e) => setPatientIdInput(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary">
              Trace Treatment Journey
            </button>
          </form>
        </div>
      )}

      {/* Treatment Sequence Flow Diagram */}
      <div className="card" style={{ padding: '20px', overflowX: 'auto' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--color-text-secondary)', marginBottom: '16px' }}>
          PATIENT CARE PATHWAY SEQUENCE
        </h3>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', minWidth: '900px' }}>
          {STEPS_SEQUENCE.map((step, idx) => (
            <React.Fragment key={step}>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '8px 12px',
                borderRadius: '8px',
                backgroundColor: 'var(--color-bg)',
                border: '1px solid var(--color-border)',
                fontSize: '12px',
                fontWeight: '500',
                whiteSpace: 'nowrap'
              }}>
                <span style={{ fontSize: '10px', color: 'var(--color-text-muted)' }}>STEP {idx + 1}</span>
                {step}
              </div>
              {idx < STEPS_SEQUENCE.length - 1 && (
                <span style={{ color: 'var(--color-text-muted)', fontSize: '14px' }}>→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="loading-center"><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={() => fetchTimeline(patientIdInput)} />
      ) : timelineEvents.length === 0 ? (
        <EmptyState icon={<RiRouteLine />} title="No Trace Events Found" subtitle={`No recorded treatment events for patient ${activePatientId}.`} />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '20px' }}>
            Interactive Treatment Lifecycle for Patient #{activePatientId} ({timelineEvents.length} Events Logged)
          </h3>
          <VisualTimeline events={timelineEvents} />
        </div>
      )}
    </div>
  );
}
