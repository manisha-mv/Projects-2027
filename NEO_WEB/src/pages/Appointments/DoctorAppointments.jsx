// pages/Appointments/DoctorAppointments.jsx
// Phase 4 — Doctor's personal appointment view
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiCalendarCheckLine, RiUserHeartLine, RiStethoscopeLine, RiTimeLine,
  RiCheckboxCircleLine, RiEyeLine,
} from 'react-icons/ri';
import PageHeader from '../../components/common/PageHeader';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Button from '../../components/ui/Button';
import AppointmentDetailModal from '../../components/appointments/AppointmentDetailModal';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { appointmentService, getStatusVariant, toDateStr } from '../../services/appointmentService';

const StatusColumn = ({ status }) => (
  <Badge variant={getStatusVariant(status)}>{status}</Badge>
);

const DoctorAppointments = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const role = user?.role?.toUpperCase() || 'DOCTOR';

  // For demo: map logged-in doctor name to a doctor ID
  const doctorId = user?.name?.includes('Priya') ? 'D001'
    : user?.name?.includes('Kiran') ? 'D002'
    : user?.name?.includes('Ananya') ? 'D003'
    : null; // null = show all (for admin/generic doctor)

  const [todayApts, setTodayApts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApt, setSelectedApt] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadTodayApts = useCallback(async () => {
    setLoading(true);
    try {
      const list = await appointmentService.getTodayAppointments(doctorId);
      setTodayApts(list);
    } finally {
      setLoading(false);
    }
  }, [doctorId]);

  useEffect(() => { loadTodayApts(); }, [loadTodayApts]);

  const handleStatusUpdate = async (id, newStatus, notes) => {
    setSubmitting(true);
    try {
      await appointmentService.updateStatus(id, newStatus, notes);
      addToast({ type: 'success', title: 'Status Updated', message: `Appointment → ${newStatus}` });
      const updated = await appointmentService.getById(id);
      if (updated) setSelectedApt(updated);
      loadTodayApts();
    } catch (e) {
      addToast({ type: 'error', title: 'Failed', message: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // Categorise today's appointments
  const waiting    = todayApts.filter(a => ['Checked In', 'Waiting'].includes(a.status));
  const inProgress = todayApts.filter(a => a.status === 'In Consultation');
  const upcoming   = todayApts.filter(a => ['Scheduled', 'Confirmed'].includes(a.status));
  const completed  = todayApts.filter(a => a.status === 'Completed');
  const others     = todayApts.filter(a => ['Cancelled', 'No Show'].includes(a.status));

  const AptCard = ({ apt }) => (
    <div className="doctor-apt-card" onClick={() => { setSelectedApt(apt); setDetailOpen(true); }}>
      <div className="dac-time">{apt.timeSlot}</div>
      <div className="dac-body">
        <div className="dac-patient">
          <Avatar name={apt.patientName} size="sm" />
          <div>
            <div className="dac-name">{apt.patientName}</div>
            <div className="dac-sub">{apt.patientId} · {apt.type}</div>
          </div>
        </div>
        {apt.chiefComplaint && (
          <div className="dac-complaint">{apt.chiefComplaint}</div>
        )}
      </div>
      <StatusColumn status={apt.status} />
    </div>
  );

  const SectionHeader = ({ title, count, color }) => (
    <div className="doc-section-header" style={{ borderLeftColor: color }}>
      <span className="dsh-title">{title}</span>
      <span className="dsh-count" style={{ background: color }}>{count}</span>
    </div>
  );

  const stats = [
    { label: 'Total Today',    value: todayApts.length, bg: '#EFF6FF', color: '#1D4ED8' },
    { label: 'Waiting',        value: waiting.length,   bg: '#FEF3C7', color: '#D97706' },
    { label: 'In Progress',    value: inProgress.length,bg: '#EDE9FE', color: '#7C3AED' },
    { label: 'Completed',      value: completed.length, bg: '#D1FAE5', color: '#059669' },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="My Appointments — Today"
        description={`Welcome, ${user?.name || 'Doctor'}. Here are your appointments for ${toDateStr()}.`}
      />

      {/* Stats strip */}
      <div className="doctor-stats-strip">
        {stats.map(s => (
          <div key={s.label} className="stat-pill-card">
            <div className="stat-pill-icon" style={{ background: s.bg, color: s.color, fontSize: '1.4rem' }}>
              {s.value}
            </div>
            <div>
              <div className="stat-pill-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <span className="spinner" style={{ width: 32, height: 32, margin: '0 auto 12px', display: 'block' }} />
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading today's schedule…</p>
        </div>
      ) : todayApts.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '48px 0' }}>
          <RiCalendarCheckLine size={40} style={{ color: 'var(--color-text-muted)', marginBottom: 12 }} />
          <h3 style={{ color: 'var(--color-text-primary)' }}>No appointments today</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>Your schedule is clear for today.</p>
        </div>
      ) : (
        <div className="doctor-apts-layout">
          {/* Waiting / Checked In */}
          {waiting.length > 0 && (
            <div className="doctor-apt-section">
              <SectionHeader title="⏳ Waiting / Checked In" count={waiting.length} color="#D97706" />
              {waiting.map(a => <AptCard key={a.id} apt={a} />)}
            </div>
          )}

          {/* In Consultation */}
          {inProgress.length > 0 && (
            <div className="doctor-apt-section">
              <SectionHeader title="🩺 In Consultation" count={inProgress.length} color="#7C3AED" />
              {inProgress.map(a => <AptCard key={a.id} apt={a} />)}
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div className="doctor-apt-section">
              <SectionHeader title="📅 Upcoming" count={upcoming.length} color="#1D4ED8" />
              {upcoming.map(a => <AptCard key={a.id} apt={a} />)}
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div className="doctor-apt-section">
              <SectionHeader title="✅ Completed" count={completed.length} color="#059669" />
              {completed.map(a => <AptCard key={a.id} apt={a} />)}
            </div>
          )}

          {/* Cancelled / No Show */}
          {others.length > 0 && (
            <div className="doctor-apt-section">
              <SectionHeader title="❌ Cancelled / No Show" count={others.length} color="#DC2626" />
              {others.map(a => <AptCard key={a.id} apt={a} />)}
            </div>
          )}
        </div>
      )}

      <AppointmentDetailModal
        isOpen={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedApt(null); }}
        appointment={selectedApt}
        onStatusUpdate={handleStatusUpdate}
        isLoading={submitting}
        userRole={role}
      />
    </div>
  );
};

export default DoctorAppointments;
