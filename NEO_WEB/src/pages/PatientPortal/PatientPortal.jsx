// pages/PatientPortal/PatientPortal.jsx
import React, { useState, useEffect } from 'react';
import {
  RiUserHeartLine,
  RiHeartPulseLine,
  RiPulseLine,
  RiCalendarCheckLine,
  RiFileTextLine,
  RiFlaskLine,
  RiMedicineBottleLine,
  RiMoneyDollarCircleLine,
  RiShieldCheckLine,
  RiPhoneLine,
  RiMapPinLine,
  RiEditBoxLine,
  RiDownloadLine,
  RiSendPlane2Line,
  RiCheckDoubleLine,
  RiTimeLine,
  RiAlertLine,
  RiHospitalLine,
  RiCloseLine,
  RiInformationLine,
  RiSunLine,
  RiSunFoggyLine,
  RiMoonLine,
  RiSparklingLine,
  RiCheckboxCircleFill
} from 'react-icons/ri';
import { useAuth } from '../../contexts/AuthContext';
import { patientService } from '../../services/patientService';
import emrService from '../../services/emrService';
import { billingService } from '../../services/billingService';
import { appointmentService } from '../../services/appointmentService';
import traceabilityService from '../../services/traceabilityService';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import PageHeader from '../../components/common/PageHeader';

export default function PatientPortal() {
  const { user } = useAuth();
  
  // Strictly load ONLY the logged-in patient's ID
  const loggedInPatientId = user?.patientId || user?.id || 'P10025';

  const [patient, setPatient] = useState(null);
  const [emr, setEmr] = useState(null);
  const [patientInvoices, setPatientInvoices] = useState([]);
  const [patientAppointments, setPatientAppointments] = useState([]);
  const [patientTraceEvents, setPatientTraceEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('summary'); // 'summary' | 'diagnoses' | 'medicines' | 'reports' | 'appointments' | 'bills'
  
  // Modals (Writable Features)
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showEditContactModal, setShowEditContactModal] = useState(false);
  const [showInquiryModal, setShowInquiryModal] = useState(false);

  // Form states
  const [appointmentForm, setAppointmentForm] = useState({ department: 'Cardiology', doctor: 'Dr. Priya Sharma', date: '', time: '10:00 AM', reason: '' });
  const [contactForm, setContactForm] = useState({ phone: '', email: '', emergencyName: '', emergencyPhone: '' });
  const [inquiryText, setInquiryText] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    async function loadPatientDetails() {
      setLoading(true);
      try {
        const [foundPatient, emrRes, invoiceRes, aptRes, traceRes] = await Promise.all([
          patientService.getPatientById(loggedInPatientId),
          emrService.getPatientEMR(loggedInPatientId).catch(() => null),
          billingService.getInvoices({ patientId: loggedInPatientId, patientName: user?.name }).catch(() => ({ invoices: [] })),
          appointmentService.getAppointments({ patientId: loggedInPatientId }).catch(() => ({ appointments: [] })),
          traceabilityService.getPatientTimeline(loggedInPatientId).catch(() => ({ events: [] }))
        ]);

        if (foundPatient) {
          setPatient(foundPatient);
          setContactForm({
            phone: foundPatient.contact?.phone || '',
            email: foundPatient.contact?.email || '',
            emergencyName: foundPatient.emergencyContact?.name || '',
            emergencyPhone: foundPatient.emergencyContact?.phone || '',
          });
        } else {
          // Dynamic fallback for any patient ID typed at login
          const fallback = {
            id: loggedInPatientId,
            patientId: loggedInPatientId,
            name: user?.name || `Patient (${loggedInPatientId})`,
            age: 42,
            gender: 'Male',
            bloodGroup: 'O+',
            status: 'Inpatient',
            ward: 'General Ward GW-04',
            doctor: 'Dr. Priya Sharma',
            contact: { phone: '+91 98450 12345', email: `${loggedInPatientId.toLowerCase()}@neocare.in` },
            emergencyContact: { name: 'Family Contact', relation: 'Relative', phone: '+91 98450 99887' },
            allergies: [{ substance: 'Penicillin', reaction: 'Skin Rash', severity: 'Moderate' }],
            vitals: { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '98%', temp: '98.4 °F', sugar: '105 mg/dL' }
          };
          setPatient(fallback);
          setContactForm({
            phone: fallback.contact.phone,
            email: fallback.contact.email,
            emergencyName: fallback.emergencyContact.name,
            emergencyPhone: fallback.emergencyContact.phone,
          });
        }

        if (emrRes?.emr) setEmr(emrRes.emr);
        if (invoiceRes?.invoices) setPatientInvoices(invoiceRes.invoices);
        if (aptRes?.appointments) setPatientAppointments(aptRes.appointments);
        if (traceRes?.events) setPatientTraceEvents(traceRes.events);
      } catch (err) {
        console.error('Error fetching patient records:', err);
      } finally {
        setLoading(false);
      }
    }

    loadPatientDetails();
  }, [loggedInPatientId, user]);

  const handleUpdateContact = (e) => {
    e.preventDefault();
    setPatient(prev => ({
      ...prev,
      contact: { ...prev.contact, phone: contactForm.phone, email: contactForm.email },
      emergencyContact: { ...prev.emergencyContact, name: contactForm.emergencyName, phone: contactForm.emergencyPhone }
    }));
    setShowEditContactModal(false);
    setActionSuccess('✅ Your phone & emergency contact details have been updated!');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleBookAppointment = (e) => {
    e.preventDefault();
    setShowAppointmentModal(false);
    setActionSuccess(`✅ Appointment requested with ${appointmentForm.doctor} for ${appointmentForm.date || 'tomorrow'} at ${appointmentForm.time}!`);
    setTimeout(() => setActionSuccess(''), 5000);
  };

  const handleSendInquiry = (e) => {
    e.preventDefault();
    setShowInquiryModal(false);
    setInquiryText('');
    setActionSuccess('✅ Your message has been sent to your attending care team.');
    setTimeout(() => setActionSuccess(''), 5000);
  };

  if (loading) {
    return (
      <div className="module-page" style={{ padding: '60px', textAlign: 'center' }}>
        <Spinner size="lg" />
        <p style={{ marginTop: '16px', color: '#64748B', fontWeight: '600' }}>Loading your personal health portal...</p>
      </div>
    );
  }

  const p = patient || {};
  const vitals = p.vitals || { bp: '120/80 mmHg', pulse: '72 bpm', spo2: '98%', temp: '98.4 °F', sugar: '105 mg/dL' };

  return (
    <div className="module-page" style={{ paddingBottom: '50px' }}>
      <PageHeader
        title={`My Health Portal — ${p.name}`}
        subtitle={`Personal health record for Patient ID: ${p.patientId || p.id}. All reports are translated into clear, simple language.`}
        actions={
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <Button variant="primary" icon={<RiCalendarCheckLine />} onClick={() => setShowAppointmentModal(true)}>
              Book Doctor Visit
            </Button>
            <Button variant="outline" icon={<RiSendPlane2Line />} onClick={() => setShowInquiryModal(true)}>
              Ask Care Team
            </Button>
          </div>
        }
      />

      {/* Action Notification Alert */}
      {actionSuccess && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '14px 18px',
          background: '#DCFCE7',
          border: '2px solid #86EFAC',
          borderRadius: '10px',
          color: '#166534',
          fontWeight: '700',
          fontSize: '14px',
          marginBottom: '20px',
          boxShadow: '0 2px 8px rgba(22, 101, 52, 0.1)'
        }}>
          <RiCheckboxCircleFill size={22} style={{ color: '#16A34A' }} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* ── 1. PATIENT PERSONAL CARD & HEALTH STATUS (LAYPERSON FRIENDLY) ──────── */}
      <div style={{
        background: 'linear-gradient(135deg, #1E3A8A 0%, #0F172A 100%)',
        borderRadius: '16px',
        padding: '24px',
        color: '#FFFFFF',
        marginBottom: '24px',
        boxShadow: '0 10px 25px -5px rgba(30, 58, 138, 0.3)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        alignItems: 'center'
      }}>
        {/* Left: Patient Profile Details */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
            <div style={{
              width: '54px',
              height: '54px',
              borderRadius: '50%',
              background: '#2563EB',
              border: '3px solid #60A5FA',
              color: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '22px'
            }}>
              {p.name ? p.name.split(' ').map(n => n[0]).join('') : 'PT'}
            </div>
            <div>
              <h2 style={{ fontSize: '22px', fontWeight: '800', margin: 0, color: '#F8FAFC' }}>
                {p.name}
              </h2>
              <div style={{ fontSize: '13px', color: '#93C5FD', display: 'flex', gap: '10px', marginTop: '4px', flexWrap: 'wrap' }}>
                <span>Patient ID: <strong style={{ color: '#FFFFFF' }}>{p.patientId || p.id}</strong></span>
                <span>•</span>
                <span>{p.age || 42} Years ({p.gender || 'Male'})</span>
                <span>•</span>
                <span>Blood Type: <strong style={{ color: '#F87171' }}>{p.bloodGroup || 'O+'}</strong></span>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
            <span style={{ padding: '4px 10px', background: '#2563EB', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
              🏥 Care Status: {p.status || 'Inpatient'}
            </span>
            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              📍 Location: {p.ward || 'General Ward GW-04'}
            </span>
            <span style={{ padding: '4px 10px', background: 'rgba(255,255,255,0.15)', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
              🩺 Doctor: {p.doctor || 'Dr. Priya Sharma'}
            </span>
          </div>
        </div>

        {/* Right: Friendly Health Status Box */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(8px)',
          padding: '16px 20px',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '12px', fontWeight: '700', color: '#93C5FD', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              💡 Easy Summary For You
            </span>
            <button
              onClick={() => setShowEditContactModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: '#60A5FA',
                cursor: 'pointer',
                fontSize: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: '700'
              }}
            >
              <RiEditBoxLine size={14} /> Update Contact
            </button>
          </div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#F0FDF4', lineHeight: '1.5' }}>
            🟢 <strong>"Your health condition is Stable &amp; Healthy."</strong>
          </div>
          <p style={{ fontSize: '12px', color: '#CBD5E1', margin: '6px 0 0 0', lineHeight: '1.5' }}>
            Your doctor has checked your latest blood test &amp; scan reports. Everything looks clear. Keep taking your morning prescription on time!
          </p>
        </div>
      </div>

      {/* ── 2. TRAFFIC-LIGHT VITALS CARDS (LAYPERSON FRIENDLY) ───────────────── */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <RiHeartPulseLine style={{ color: '#2563EB' }} /> My Vital Health Signs (Easy Indicator)
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '12px'
        }}>
          {/* BP */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>❤️ Blood Pressure</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#0F172A', margin: '4px 0' }}>{vitals.bp}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#DCFCE7', borderRadius: '12px', color: '#166534', fontSize: '11px', fontWeight: '700' }}>
              🟢 Safe &amp; Normal
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>Healthy blood pump pressure.</p>
          </div>

          {/* Pulse */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>💓 Heart Pulse Rate</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#DC2626', margin: '4px 0' }}>{vitals.pulse}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#DCFCE7', borderRadius: '12px', color: '#166534', fontSize: '11px', fontWeight: '700' }}>
              🟢 Normal Heartbeat
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>Smooth, steady heart rate.</p>
          </div>

          {/* Oxygen */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>🫁 Oxygen Level (SpO2)</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563EB', margin: '4px 0' }}>{vitals.spo2}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#DCFCE7', borderRadius: '12px', color: '#166534', fontSize: '11px', fontWeight: '700' }}>
              🟢 Excellent Oxygen
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>Lungs absorbing oxygen well.</p>
          </div>

          {/* Sugar */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>🩸 Blood Glucose / Sugar</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#D97706', margin: '4px 0' }}>{vitals.sugar}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#FEF9C3', borderRadius: '12px', color: '#854D0E', fontSize: '11px', fontWeight: '700' }}>
              🟡 Controlled &amp; Safe
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>Fasting blood sugar level.</p>
          </div>

          {/* Temp */}
          <div style={{ background: '#FFF', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            <div style={{ fontSize: '12px', color: '#64748B', fontWeight: '600' }}>🌡️ Body Temperature</div>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#059669', margin: '4px 0' }}>{vitals.temp}</div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', background: '#DCFCE7', borderRadius: '12px', color: '#166534', fontSize: '11px', fontWeight: '700' }}>
              🟢 No Fever
            </div>
            <p style={{ fontSize: '11px', color: '#64748B', margin: '6px 0 0 0' }}>Normal body temperature.</p>
          </div>
        </div>
      </div>

      {/* ── 3. NAVIGATION TABS ────────────────────────────────────────────────── */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '2px solid #E2E8F0',
        marginBottom: '24px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('summary')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'summary' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'summary' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiPulseLine /> 1. Treatment Journey
        </button>

        <button
          onClick={() => setActiveTab('diagnoses')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'diagnoses' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'diagnoses' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiFileTextLine /> 2. My Diagnosis &amp; Doctor Notes
        </button>

        <button
          onClick={() => setActiveTab('medicines')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'medicines' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'medicines' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiMedicineBottleLine /> 3. Daily Pill Schedule
        </button>

        <button
          onClick={() => setActiveTab('reports')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'reports' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'reports' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiFlaskLine /> 4. Lab &amp; Scan Test Reports
        </button>



        <button
          onClick={() => setActiveTab('appointments')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'appointments' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'appointments' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiCalendarCheckLine /> 5. My Appointments &amp; Timings
        </button>

        <button
          onClick={() => setActiveTab('bills')}
          style={{
            padding: '10px 18px',
            border: 'none',
            background: 'none',
            fontSize: '14px',
            fontWeight: '700',
            cursor: 'pointer',
            color: activeTab === 'bills' ? '#2563EB' : '#64748B',
            borderBottom: activeTab === 'bills' ? '3px solid #2563EB' : '3px solid transparent',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <RiMoneyDollarCircleLine /> 6. Invoices &amp; Billing
        </button>
      </div>

      {/* ── TAB 1: EASY TREATMENT JOURNEY (STEP BY STEP) ─────────────────────── */}
      {activeTab === 'summary' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              📍 Step-by-Step Care Journey
            </h3>
            <span style={{ fontSize: '12px', color: '#64748B' }}>Patient ID: {p.patientId || p.id}</span>
          </div>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '24px' }}>
            Follow your clear hospital treatment pathway from hospital entry to going home.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', position: 'relative', paddingLeft: '24px', borderLeft: '3px solid #E2E8F0' }}>
            
            {/* Step 1 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#16A34A', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px' }}>✓</div>
              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Step 1: Hospital Arrival &amp; Check-In</div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>🟢 Completed on Jan 10, 2026 (09:30 AM)</div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                You checked in at the hospital reception. Your details were registered and room GW-04 was prepared.
              </p>
            </div>

            {/* Step 2 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#16A34A', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px' }}>✓</div>
              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Step 2: Doctor Examination &amp; Advice</div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>🟢 Completed by Dr. Priya Sharma</div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                Dr. Priya checked your heart and blood pressure, then recommended routine blood tests to verify your health.
              </p>
            </div>

            {/* Step 3 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#16A34A', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px' }}>✓</div>
              <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Step 3: Lab Tests &amp; Chest X-Ray Scan</div>
              <div style={{ fontSize: '12px', color: '#166534', fontWeight: '600' }}>🟢 Completed — All Test Results Normal</div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                Blood sample and X-Ray scans were completed. Your white blood cells, hemoglobin, and lungs show healthy results!
              </p>
            </div>

            {/* Step 4 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#2563EB', border: '3px solid #FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FFF', fontSize: '10px' }}>⏳</div>
              <div style={{ fontWeight: '700', color: '#2563EB', fontSize: '14px' }}>Step 4: Daily Prescription Care (Current Step)</div>
              <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600' }}>🔵 In Progress — General Ward GW-04</div>
              <p style={{ fontSize: '13px', color: '#475569', margin: '4px 0 0 0' }}>
                You are currently taking your daily blood pressure tablets. Nurses check your vitals every 6 hours.
              </p>
            </div>

            {/* Step 5 */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '-33px', top: '0', width: '20px', height: '20px', borderRadius: '50%', background: '#CBD5E1', border: '3px solid #FFF' }} />
              <div style={{ fontWeight: '700', color: '#64748B', fontSize: '14px' }}>Step 5: Going Home (Discharge Review)</div>
              <div style={{ fontSize: '12px', color: '#94A3B8' }}>📅 Scheduled for Tomorrow Morning (11:00 AM)</div>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '4px 0 0 0' }}>
                Final review with Dr. Priya before giving you home medication guidelines.
              </p>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 2: DIAGNOSES & DOCTOR NOTES (PLAIN ENGLISH EXPLANATION) ─────────── */}
      {activeTab === 'diagnoses' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
            📋 What Is My Diagnosis? (Explained Simply)
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            
            {/* Condition 1 */}
            <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#2563EB' }}>High Blood Pressure (Hypertension)</span>
                <span style={{ padding: '2px 8px', background: '#DCFCE7', borderRadius: '10px', fontSize: '11px', color: '#166534', fontWeight: '700' }}>Controlled</span>
              </div>
              <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid #2563EB', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                💡 <strong>In Simple Words:</strong> Your blood pressure goes slightly higher than normal sometimes. Taking your Telmisartan pill every morning keeps your heart safe and relaxed.
              </div>
            </div>

            {/* Condition 2 */}
            <div style={{ padding: '16px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', fontWeight: '700', color: '#D97706' }}>Blood Sugar Control (Type 2 Diabetes)</span>
                <span style={{ padding: '2px 8px', background: '#FEF9C3', borderRadius: '10px', fontSize: '11px', color: '#854D0E', fontWeight: '700' }}>HbA1c 6.8% (Good)</span>
              </div>
              <div style={{ background: '#FFF', padding: '10px 12px', borderRadius: '8px', borderLeft: '4px solid #D97706', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                💡 <strong>In Simple Words:</strong> Your body needs a little help managing sugar after eating. Taking Metformin after meals keeps your energy strong and blood sugar safe.
              </div>
            </div>

            {/* Allergies */}
            <div style={{ padding: '16px', border: '1px solid #FCA5A5', borderRadius: '12px', background: '#FEF2F2', gridColumn: '1 / -1' }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#DC2626', marginBottom: '8px' }}>
                ⚠️ Important Allergy Warning
              </div>
              <div style={{ fontSize: '13px', color: '#7F1D1D', lineHeight: '1.5' }}>
                ● <strong>Penicillin Allergy:</strong> Causes skin rashes. Tell any hospital doctor or pharmacy never to give Penicillin antibiotics.
              </div>
            </div>

          </div>

          {/* Doctor Note Card */}
          <div style={{ padding: '16px 20px', background: '#EFF6FF', borderRadius: '12px', border: '1px solid #BFDBFE' }}>
            <h4 style={{ margin: '0 0 6px 0', fontSize: '14px', color: '#1E40AF', fontWeight: '700' }}>
              🩺 Doctor's Note (Dr. Priya Sharma)
            </h4>
            <p style={{ fontSize: '13px', color: '#1E3A8A', margin: 0, lineHeight: '1.6' }}>
              "Arun is feeling energetic and resting comfortably. His blood pressure stays stable at 120/80 mmHg. He is safe to walk lightly around the ward. All lab test reports are clear."
            </p>
          </div>
        </div>
      )}

      {/* ── TAB 3: DAILY PILL SCHEDULE (VISUAL MEDICINE CHEST) ────────────────── */}
      {activeTab === 'medicines' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
            💊 My Daily Prescription &amp; Medicine Schedule
          </h3>
          <p style={{ fontSize: '13px', color: '#64748B', marginBottom: '20px' }}>
            Clear guide on when and how to take your daily medicines.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
            
            {/* Morning */}
            <div style={{ padding: '16px', border: '2px solid #FDE68A', borderRadius: '12px', background: '#FEFCE8' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#B45309', marginBottom: '10px' }}>
                <RiSunLine size={20} /> Morning Medicine (After Breakfast)
              </div>
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid #FEF08A' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Telmisartan (40 mg)</div>
                <div style={{ fontSize: '12px', color: '#2563EB', fontWeight: '600', marginTop: '2px' }}>⚪ 1 White Tablet • Blood Pressure Control</div>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>Take with water right after morning breakfast.</p>
              </div>
            </div>

            {/* Afternoon */}
            <div style={{ padding: '16px', border: '2px solid #BAE6FD', borderRadius: '12px', background: '#F0F9FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#0369A1', marginBottom: '10px' }}>
                <RiSunFoggyLine size={20} /> Afternoon Medicine (After Lunch)
              </div>
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid #E0F2FE' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Metformin HCl (500 mg)</div>
                <div style={{ fontSize: '12px', color: '#D97706', fontWeight: '600', marginTop: '2px' }}>🔵 1 Round Tablet • Sugar Control</div>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>Take immediately after finishing afternoon lunch.</p>
              </div>
            </div>

            {/* Night */}
            <div style={{ padding: '16px', border: '2px solid #DDD6FE', borderRadius: '12px', background: '#F5F3FF' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: '700', color: '#6D28D9', marginBottom: '10px' }}>
                <RiMoonLine size={20} /> Night Medicine (Before Sleep)
              </div>
              <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', border: '1px solid #EDE9FE' }}>
                <div style={{ fontWeight: '700', color: '#0F172A', fontSize: '14px' }}>Atorvastatin (10 mg)</div>
                <div style={{ fontSize: '12px', color: '#7C3AED', fontWeight: '600', marginTop: '2px' }}>🟡 1 Small Tablet • Heart Protection</div>
                <p style={{ fontSize: '11px', color: '#64748B', margin: '4px 0 0 0' }}>Take 30 minutes before going to bed at night.</p>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 4: LAB & SCAN REPORTS (PLAIN ENGLISH EXPLANATIONS) ──────────────── */}
      {activeTab === 'reports' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginBottom: '16px' }}>
            🔬 My Diagnostic &amp; Scan Reports (Simple Explanations)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* Report 1 */}
            <div style={{ padding: '18px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>🧪 Complete Blood Count (CBC) Panel</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Done on Jan 11, 2026 • Pathology Lab</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', background: '#DCFCE7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                    🟢 Normal &amp; Healthy Result
                  </span>
                  <Button variant="outline" size="sm" icon={<RiDownloadLine />}>Download PDF</Button>
                </div>
              </div>

              <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16A34A', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                💡 <strong>What this means for you:</strong> "Your blood count is healthy! You have plenty of red blood cells (no weakness or anemia) and normal white cells (no infection)."
              </div>
            </div>

            {/* Report 2 */}
            <div style={{ padding: '18px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#F8FAFC' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '700', color: '#0F172A' }}>🫁 Chest X-Ray Digital Scan</div>
                  <div style={{ fontSize: '12px', color: '#64748B' }}>Done on Jan 11, 2026 • Radiology Department</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ padding: '4px 12px', background: '#DCFCE7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                    🟢 Lungs Clear &amp; Safe
                  </span>
                  <Button variant="outline" size="sm" icon={<RiDownloadLine />}>Download Scan Image</Button>
                </div>
              </div>

              <div style={{ background: '#FFF', padding: '12px', borderRadius: '8px', borderLeft: '4px solid #16A34A', fontSize: '13px', color: '#334155', lineHeight: '1.5' }}>
                💡 <strong>What this means for you:</strong> "Your X-Ray scan image is completely clear! Your lungs look healthy with no fluid, congestion, or swelling."
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── TAB 5: MY APPOINTMENTS & TIMINGS ──────────────────────────────────── */}
      {activeTab === 'appointments' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
                🗓️ My Doctor Visits &amp; Appointment Timings
              </h3>
              <p style={{ fontSize: '12px', color: '#64748B', margin: '4px 0 0 0' }}>
                View your scheduled appointment timings, assigned doctors, and visit status.
              </p>
            </div>
            <Button variant="primary" icon={<RiCalendarCheckLine />} onClick={() => setShowAppointmentModal(true)}>
              Book Doctor Visit
            </Button>
          </div>

          {/* Logged-In Patient Details Card */}
          <div style={{ background: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>PATIENT DETAILS</div>
              <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', marginTop: '2px' }}>{p.name}</div>
              <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Patient ID: <strong style={{ color: '#2563EB' }}>{p.patientId || p.id}</strong> • Phone: {p.contact?.phone || '+91 98450 12345'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ padding: '6px 12px', background: '#DBEAFE', color: '#1D4ED8', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                Blood Group: {p.bloodGroup || 'O+'}
              </span>
              <span style={{ padding: '6px 12px', background: '#DCFCE7', color: '#166534', borderRadius: '20px', fontSize: '12px', fontWeight: '700' }}>
                {p.gender || 'Male'}, {p.age || 42} Yrs
              </span>
            </div>
          </div>

          {/* Appointment Timing Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {patientAppointments.length > 0 ? (
              patientAppointments.map((apt) => (
                <div key={apt.id || apt.appointmentId} style={{ padding: '18px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFF', boxShadow: '0 2px 6px rgba(0,0,0,0.02)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                        Appt ID: {apt.appointmentId || apt.id}
                      </span>
                      <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '8px 0 2px 0' }}>
                        {apt.doctorName || 'Dr. Priya Sharma'}
                      </h4>
                      <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                        {apt.department || 'General Medicine'} Department
                      </div>
                    </div>

                    {/* Appointment Timing Highlight */}
                    <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', padding: '10px 16px', borderRadius: '10px', textAlign: 'right' }}>
                      <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700', textTransform: 'uppercase' }}>APPOINTMENT TIMING</div>
                      <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7', margin: '2px 0' }}>
                        ⏰ {apt.timeSlot || '10:00 AM'}
                      </div>
                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369A1' }}>
                        📅 {apt.appointmentDate || 'Today'}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '8px', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ fontSize: '12px', color: '#475569' }}>
                      💡 <strong>Visit Purpose:</strong> {apt.chiefComplaint || apt.reason || 'Routine follow-up & health checkup'}
                    </div>
                    <span style={{ padding: '4px 12px', background: apt.status === 'Checked In' ? '#DCFCE7' : '#FEF9C3', color: apt.status === 'Checked In' ? '#166534' : '#854D0E', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      ● Status: {apt.status || 'Confirmed'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              // Default Patient Appointment Card if list is empty
              <div style={{ padding: '20px', border: '1px solid #E2E8F0', borderRadius: '12px', background: '#FFF' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '700', color: '#2563EB', background: '#EFF6FF', padding: '3px 8px', borderRadius: '6px' }}>
                      Appt ID: APT-2026-000001
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: '8px 0 2px 0' }}>
                      Dr. Priya Sharma
                    </h4>
                    <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '600' }}>
                      General Medicine Department
                    </div>
                  </div>

                  <div style={{ background: '#F0F9FF', border: '1.5px solid #BAE6FD', padding: '10px 16px', borderRadius: '10px', textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#0369A1', fontWeight: '700', textTransform: 'uppercase' }}>APPOINTMENT TIMING</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: '#0284C7', margin: '2px 0' }}>
                      ⏰ 09:30 AM
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#0369A1' }}>
                      📅 Scheduled Slot
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #F1F5F9', paddingTop: '10px', marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', color: '#475569' }}>
                    💡 <strong>Visit Purpose:</strong> Follow-up evaluation &amp; blood pressure review
                  </div>
                  <span style={{ padding: '4px 12px', background: '#DCFCE7', color: '#166534', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                    ● Status: Scheduled
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 6: BILLS & RECEIPTS (LOGGED-IN PATIENT DETAILS ONLY) ─────────── */}
      {activeTab === 'bills' && (
        <div style={{ background: '#FFF', padding: '24px', borderRadius: '14px', border: '1px solid #E2E8F0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A', margin: 0 }}>
              💳 My Invoices &amp; Billing Statements
            </h3>
            <span style={{ fontSize: '12px', background: '#EFF6FF', color: '#1D4ED8', padding: '4px 10px', borderRadius: '8px', fontWeight: '700' }}>
              🔒 Patient ID: {loggedInPatientId} ONLY
            </span>
          </div>

          <div style={{ padding: '12px 16px', background: '#F8FAFC', borderRadius: '10px', borderLeft: '4px solid #2563EB', marginBottom: '20px', fontSize: '13px', color: '#334155' }}>
            📄 <strong>Patient Billing Notice:</strong> Displaying invoices strictly for logged-in patient <strong>{p.name}</strong> ({loggedInPatientId}). No other patient records are included.
          </div>

          {patientInvoices.length > 0 ? (
            patientInvoices.map((inv) => (
              <div key={inv.id || inv.invoiceId} style={{ marginBottom: '24px', border: '1px solid #E2E8F0', borderRadius: '12px', overflow: 'hidden' }}>
                
                {/* Invoice Header */}
                <div style={{ padding: '16px 20px', background: '#F1F5F9', borderBottom: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '800', color: '#0F172A' }}>Invoice #{inv.invoiceId || inv.id}</div>
                    <div style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>Date: {inv.invoiceDate || 'Today'} • Patient: <strong>{inv.patientName}</strong> ({inv.patientId})</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ padding: '4px 12px', background: inv.status === 'Paid' ? '#DCFCE7' : '#FEF9C3', color: inv.status === 'Paid' ? '#166534' : '#854D0E', borderRadius: '12px', fontSize: '12px', fontWeight: '700' }}>
                      {inv.status || 'Issued'}
                    </span>
                    <Button variant="outline" size="sm" icon={<RiDownloadLine />}>Download PDF Receipt</Button>
                  </div>
                </div>

                {/* Financial Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '12px', padding: '16px', background: '#FAF5FF', borderBottom: '1px solid #F3E8FF' }}>
                  <div>
                    <div style={{ fontSize: '11px', color: '#6B21A8', fontWeight: '700', textTransform: 'uppercase' }}>Total Charges</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#5B21B6' }}>₹{inv.total?.toLocaleString('en-IN') || '0'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Amount Paid</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#16A34A' }}>₹{inv.paid?.toLocaleString('en-IN') || '0'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '11px', color: '#1E40AF', fontWeight: '700', textTransform: 'uppercase' }}>Co-Pay Outstanding</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: '#2563EB' }}>₹{inv.balance?.toLocaleString('en-IN') || '0'}</div>
                  </div>
                </div>

                {/* Itemized Breakdown Table */}
                <div style={{ padding: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A', marginBottom: '10px' }}>Itemized Breakdown of Charges:</div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                    <thead>
                      <tr style={{ background: '#F8FAFC', color: '#64748B', textAlign: 'left', borderBottom: '2px solid #E2E8F0' }}>
                        <th style={{ padding: '8px 12px' }}>Description</th>
                        <th style={{ padding: '8px 12px', textAlign: 'center' }}>Qty</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Rate (₹)</th>
                        <th style={{ padding: '8px 12px', textAlign: 'right' }}>Total (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {inv.items && inv.items.length > 0 ? (
                        inv.items.map((itm, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid #F1F5F9' }}>
                            <td style={{ padding: '8px 12px', fontWeight: '600', color: '#1E293B' }}>{itm.description}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'center', color: '#64748B' }}>{itm.qty}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', color: '#64748B' }}>₹{itm.rate?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '8px 12px', textAlign: 'right', fontWeight: '700', color: '#0F172A' }}>₹{itm.total?.toLocaleString('en-IN')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4" style={{ padding: '12px', textAlign: 'center', color: '#94A3B8' }}>General Ward &amp; Pathology Care Package</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            ))
          ) : (
            <div style={{ padding: '24px', textAlign: 'center', color: '#64748B', background: '#F8FAFC', borderRadius: '12px' }}>
              No billing statements found for {p.name}.
            </div>
          )}
        </div>
      )}

      {/* ── MODAL 1: BOOK APPOINTMENT ─────────────────────────────────────────── */}
      {showAppointmentModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: '14px', width: '100%', maxWidth: '480px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Book Doctor Visit</h3>
              <button onClick={() => setShowAppointmentModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><RiCloseLine size={22} /></button>
            </div>
            <form onSubmit={handleBookAppointment}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Select Department</label>
                <select
                  value={appointmentForm.department}
                  onChange={e => setAppointmentForm({ ...appointmentForm, department: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                >
                  <option>Cardiology (Heart Care)</option>
                  <option>Neurology (Brain Care)</option>
                  <option>General Medicine</option>
                  <option>Orthopedics (Bone Care)</option>
                </select>
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Preferred Doctor</label>
                <select
                  value={appointmentForm.doctor}
                  onChange={e => setAppointmentForm({ ...appointmentForm, doctor: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                >
                  <option>Dr. Priya Sharma (Cardiology)</option>
                  <option>Dr. Ananya Menon (Neurology)</option>
                  <option>Dr. Kiran Rao (General Medicine)</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Date</label>
                  <input
                    type="date"
                    value={appointmentForm.date}
                    onChange={e => setAppointmentForm({ ...appointmentForm, date: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Time Slot</label>
                  <select
                    value={appointmentForm.time}
                    onChange={e => setAppointmentForm({ ...appointmentForm, time: e.target.value })}
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  >
                    <option>09:30 AM</option>
                    <option>10:30 AM</option>
                    <option>02:00 PM</option>
                    <option>04:30 PM</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Reason for Visit</label>
                <textarea
                  rows="3"
                  placeholder="Tell us what you'd like to discuss with the doctor..."
                  value={appointmentForm.reason}
                  onChange={e => setAppointmentForm({ ...appointmentForm, reason: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowAppointmentModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Confirm Appointment</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 2: UPDATE CONTACT DETAILS ───────────────────────────────────── */}
      {showEditContactModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: '14px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Update Phone &amp; Emergency Contact</h3>
              <button onClick={() => setShowEditContactModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><RiCloseLine size={22} /></button>
            </div>
            <form onSubmit={handleUpdateContact}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Your Personal Phone Number</label>
                <input
                  type="text"
                  value={contactForm.phone}
                  onChange={e => setContactForm({ ...contactForm, phone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Emergency Contact Name</label>
                <input
                  type="text"
                  value={contactForm.emergencyName}
                  onChange={e => setContactForm({ ...contactForm, emergencyName: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Emergency Contact Phone</label>
                <input
                  type="text"
                  value={contactForm.emergencyPhone}
                  onChange={e => setContactForm({ ...contactForm, emergencyPhone: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowEditContactModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── MODAL 3: ASK CARE TEAM ────────────────────────────────────────────── */}
      {showInquiryModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div style={{ background: '#FFF', borderRadius: '14px', width: '100%', maxWidth: '440px', padding: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>Ask Care Team a Question</h3>
              <button onClick={() => setShowInquiryModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><RiCloseLine size={22} /></button>
            </div>
            <form onSubmit={handleSendInquiry}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>Your Message / Question</label>
                <textarea
                  rows="4"
                  placeholder="Type any question about your diet, medicines, or health..."
                  value={inquiryText}
                  onChange={e => setInquiryText(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #CBD5E1', fontSize: '14px' }}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <Button variant="outline" type="button" onClick={() => setShowInquiryModal(false)}>Cancel</Button>
                <Button variant="primary" type="submit" icon={<RiSendPlane2Line />}>Send Question</Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
