// pages/Appointments/AppointmentList.jsx
// Phase 4 — Main Appointments Page (RECEPTIONIST + ADMIN view)
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiCalendarCheckLine, RiAddLine, RiSearchLine, RiRefreshLine,
  RiEyeLine, RiEditLine, RiCheckboxCircleLine,
  RiUserHeartLine, RiTimeLine, RiLoader4Line, RiCloseLine,
} from 'react-icons/ri';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import AppointmentFormModal from '../../components/appointments/AppointmentFormModal';
import AppointmentDetailModal from '../../components/appointments/AppointmentDetailModal';
import CalendarView from '../../components/appointments/CalendarView';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';
import {
  appointmentService, getStatusVariant, getPriorityVariant,
  DEPARTMENTS, toDateStr,
} from '../../services/appointmentService';

// ─── Reception Dashboard ─────────────────────────────────────────────────────
const ReceptionDashboard = ({ todayApts, userRole }) => {
  const counts = {
    total:         todayApts.length,
    scheduled:     todayApts.filter(a => a.status === 'Scheduled').length,
    confirmed:     todayApts.filter(a => a.status === 'Confirmed').length,
    checkedIn:     todayApts.filter(a => a.status === 'Checked In').length,
    waiting:       todayApts.filter(a => a.status === 'Waiting').length,
    inConsult:     todayApts.filter(a => a.status === 'In Consultation').length,
    completed:     todayApts.filter(a => a.status === 'Completed').length,
    cancelled:     todayApts.filter(a => a.status === 'Cancelled').length,
    noShow:        todayApts.filter(a => a.status === 'No Show').length,
    emergency:     todayApts.filter(a => a.priority === 'Emergency').length,
  };

  const tiles = [
    { label: "Today's Total",    value: counts.total,     bg: '#EFF6FF', color: '#1D4ED8', icon: '📅' },
    { label: 'Scheduled',        value: counts.scheduled, bg: '#F1F5F9', color: '#475569', icon: '🗓️' },
    { label: 'Waiting',          value: counts.waiting,   bg: '#FEF3C7', color: '#D97706', icon: '⏳' },
    { label: 'In Consultation',  value: counts.inConsult, bg: '#EDE9FE', color: '#7C3AED', icon: '🩺' },
    { label: 'Completed',        value: counts.completed, bg: '#D1FAE5', color: '#059669', icon: '✅' },
    { label: 'Cancelled',        value: counts.cancelled, bg: '#FEE2E2', color: '#DC2626', icon: '❌' },
    { label: 'No Show',          value: counts.noShow,    bg: '#FFF7ED', color: '#C2410C', icon: '👻' },
    { label: 'Emergency',        value: counts.emergency, bg: '#FEE2E2', color: '#991B1B', icon: '🚨' },
  ];

  return (
    <div className="reception-dashboard">
      <div className="reception-kpi-grid">
        {tiles.map(t => (
          <div key={t.label} className="reception-kpi-tile">
            <div className="rkt-icon" style={{ background: t.bg, color: t.color }}>{t.icon}</div>
            <div>
              <div className="rkt-value" style={{ color: t.color }}>{t.value}</div>
              <div className="rkt-label">{t.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Waiting Queue strip */}
      {counts.waiting + counts.checkedIn > 0 && (
        <div className="waiting-queue-strip">
          <span className="wqs-title">
            <RiTimeLine /> Waiting Queue ({counts.checkedIn} checked-in · {counts.waiting} waiting)
          </span>
          <div className="wqs-patients">
            {todayApts
              .filter(a => ['Checked In', 'Waiting'].includes(a.status))
              .sort((a, b) => (a.timeSlot || '').localeCompare(b.timeSlot || ''))
              .map(a => (
                <div key={a.id} className={`wqs-chip ${a.status === 'Waiting' ? 'wqs-waiting' : 'wqs-checkedin'}`}>
                  <span className="wqs-slot">{a.timeSlot}</span>
                  <span className="wqs-name">{a.patientName}</span>
                  <Badge variant={getStatusVariant(a.status)} showIcon={false} className="wqs-badge">{a.status}</Badge>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────
const AppointmentList = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const role = user?.role?.toUpperCase() || 'RECEPTIONIST';

  const canBook   = ['ADMIN', 'RECEPTIONIST', 'DOCTOR'].includes(role);
  const canEdit   = ['ADMIN', 'RECEPTIONIST'].includes(role);

  // ── State ──
  const [appointments, setAppointments] = useState([]);
  const [todayApts, setTodayApts]       = useState([]);
  const [total, setTotal]               = useState(0);
  const [totalPages, setTotalPages]     = useState(1);
  const [currentPage, setCurrentPage]   = useState(1);
  const [loading, setLoading]           = useState(true);
  const PAGE_SIZE = 10;

  // Filters
  const [search, setSearch]         = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Modals
  const [bookModalOpen, setBookModalOpen]     = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen]     = useState(false);
  const [selectedApt, setSelectedApt]         = useState(null);
  const [submitting, setSubmitting]           = useState(false);

  const doctors = appointmentService.getDoctors();

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    try {
      const res = await appointmentService.getAppointments({
        search, date: filterDate, doctorId: filterDoctor,
        department: filterDept, status: filterStatus,
        page: currentPage, limit: PAGE_SIZE,
      });
      setAppointments(res.appointments);
      setTotal(res.total);
      setTotalPages(res.pages);
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: 'Failed to load appointments.' });
    } finally {
      setLoading(false);
    }
  }, [search, filterDate, filterDoctor, filterDept, filterStatus, currentPage, addToast]);

  const loadTodayApts = useCallback(async () => {
    const list = await appointmentService.getTodayAppointments();
    setTodayApts(list);
  }, []);

  useEffect(() => { loadAppointments(); }, [loadAppointments]);
  useEffect(() => { loadTodayApts(); }, [loadTodayApts]);

  const resetFilters = () => {
    setSearch(''); setFilterDate(''); setFilterDoctor('');
    setFilterDept(''); setFilterStatus(''); setCurrentPage(1);
  };

  // ── Book Appointment ──
  const handleBook = async (formData) => {
    setSubmitting(true);
    try {
      await appointmentService.createAppointment(formData);
      addToast({ type: 'success', title: 'Appointment Booked', message: `${formData.patientName} → ${formData.doctorName} at ${formData.timeSlot} on ${formData.appointmentDate}.` });
      setBookModalOpen(false);
      loadAppointments();
      loadTodayApts();
    } catch (e) {
      addToast({ type: 'error', title: 'Booking Failed', message: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Edit Appointment ──
  const handleEdit = async (formData) => {
    setSubmitting(true);
    try {
      await appointmentService.updateAppointment(selectedApt.id || selectedApt.appointmentId, formData);
      addToast({ type: 'success', title: 'Appointment Updated', message: 'Appointment details saved successfully.' });
      setEditModalOpen(false);
      setSelectedApt(null);
      loadAppointments();
      loadTodayApts();
    } catch (e) {
      addToast({ type: 'error', title: 'Update Failed', message: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Status Update ──
  const handleStatusUpdate = async (id, newStatus, notes) => {
    setSubmitting(true);
    try {
      await appointmentService.updateStatus(id, newStatus, notes);
      addToast({ type: 'success', title: 'Status Updated', message: `Appointment status → ${newStatus}` });
      // Refresh selected appointment
      const updated = await appointmentService.getById(id);
      if (updated) setSelectedApt(updated);
      loadAppointments();
      loadTodayApts();
    } catch (e) {
      addToast({ type: 'error', title: 'Status Update Failed', message: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Quick Check-In from table row ──
  const handleQuickCheckIn = async (apt) => {
    setSubmitting(true);
    try {
      await appointmentService.updateStatus(apt.id || apt.appointmentId, 'Checked In', '');
      addToast({ type: 'success', title: 'Patient Checked In', message: `${apt.patientName} checked in at ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.` });
      loadAppointments();
      loadTodayApts();
    } catch (e) {
      addToast({ type: 'error', title: 'Check-In Failed', message: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  // ── Table columns ──
  const columns = [
    {
      key: 'appointmentId', label: 'Appt ID', width: '140px',
      render: (val) => <span className="apt-id-badge">{val}</span>,
    },
    {
      key: 'patientName', label: 'Patient', width: '200px',
      render: (val, row) => (
        <div className="table-patient-cell" style={{ cursor: 'pointer' }} onClick={() => { setSelectedApt(row); setDetailModalOpen(true); }}>
          <Avatar name={val || '?'} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">{row.patientId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'doctorName', label: 'Doctor / Department', width: '200px',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--color-text-primary)' }}>{val}</div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{row.department}</div>
        </div>
      ),
    },
    {
      key: 'appointmentDate', label: 'Date', width: '120px',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600, color: val === toDateStr() ? 'var(--color-primary)' : 'var(--color-text-primary)' }}>
            {val === toDateStr() ? '🟢 Today' : val}
          </div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{row.timeSlot}</div>
        </div>
      ),
    },
    {
      key: 'type', label: 'Type', width: '120px',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>{val}</div>
          <Badge variant={getPriorityVariant(row.priority)} showIcon={false} className="mt-1" style={{ fontSize: '10px' }}>{row.priority}</Badge>
        </div>
      ),
    },
    {
      key: 'status', label: 'Status', width: '140px',
      render: (val) => <Badge variant={getStatusVariant(val)}>{val}</Badge>,
    },
    {
      key: 'actions', label: 'Actions', width: '160px', align: 'right',
      render: (_, row) => {
        const canCheckIn = ['Scheduled', 'Confirmed'].includes(row.status) && ['ADMIN', 'RECEPTIONIST'].includes(role);
        return (
          <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
            <Button variant="ghost" size="sm" onClick={() => { setSelectedApt(row); setDetailModalOpen(true); }} title="View Details">
              <RiEyeLine size={15} />
            </Button>
            {canEdit && !['Completed', 'Cancelled', 'No Show'].includes(row.status) && (
              <Button variant="outline" size="sm" onClick={() => { setSelectedApt(row); setEditModalOpen(true); }} title="Edit">
                <RiEditLine size={15} />
              </Button>
            )}
            {canCheckIn && (
              <Button variant="secondary" size="sm" onClick={() => handleQuickCheckIn(row)} title="Check In Patient">
                <RiCheckboxCircleLine size={15} />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const [viewMode, setViewMode] = useState('table'); // 'table' | 'calendar'

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Appointments & Reception"
        description="Manage today's appointments, patient check-ins, and doctor schedules."
        primaryAction={
          <div style={{ display: 'flex', gap: '8px' }}>
            <div className="cal-view-toggle">
              <button
                className={`cal-view-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table
              </button>
              <button
                className={`cal-view-btn ${viewMode === 'calendar' ? 'active' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                Calendar
              </button>
            </div>
            {canBook && (
              <Button variant="primary" onClick={() => setBookModalOpen(true)}>
                <RiAddLine size={17} /> Book Appointment
              </Button>
            )}
          </div>
        }
      />

      {/* Reception Dashboard */}
      <ReceptionDashboard todayApts={todayApts} userRole={role} />

      {/* ── Filters Bar ── */}
      <div className="apt-filter-bar">
        {/* Search */}
        <div className="patient-search-box" style={{ minWidth: 260 }}>
          <RiSearchLine className="search-icon" size={17} />
          <input
            type="text"
            placeholder="Search by patient, doctor, or appointment ID..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="search-input"
          />
        </div>

        {/* Date */}
        <div className="filter-item">
          <span className="filter-label">Date:</span>
          <input
            type="date"
            value={filterDate}
            onChange={e => { setFilterDate(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          />
        </div>

        {/* Doctor */}
        <div className="filter-item">
          <span className="filter-label">Doctor:</span>
          <select
            value={filterDoctor}
            onChange={e => { setFilterDoctor(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Doctors</option>
            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
        </div>

        {/* Department */}
        <div className="filter-item">
          <span className="filter-label">Dept:</span>
          <select
            value={filterDept}
            onChange={e => { setFilterDept(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="filter-item">
          <span className="filter-label">Status:</span>
          <select
            value={filterStatus}
            onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}
            className="filter-select"
          >
            <option value="">All Statuses</option>
            {['Scheduled','Confirmed','Checked In','Waiting','In Consultation','Completed','Cancelled','No Show'].map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <Button variant="ghost" size="sm" onClick={resetFilters} title="Reset filters">
          <RiRefreshLine size={16} /> Reset
        </Button>
      </div>

      {/* ── Table or Calendar View ── */}
      {viewMode === 'calendar' ? (
        <div className="card" style={{ padding: '24px' }}>
          <CalendarView
            appointments={appointments}
            onSelectAppointment={(apt) => {
              setSelectedApt(apt);
              setDetailModalOpen(true);
            }}
            onCreateAppointment={(dateStr) => {
              setBookModalOpen(true);
            }}
          />
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            rows={appointments}
            loading={loading}
            emptyTitle="No appointments found matching your filters."
          />

          {/* Pagination */}
          {!loading && total > 0 && (
            <div className="table-pagination-strip">
              <div className="pagination-info">
                Showing <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong>–<strong>{Math.min(currentPage * PAGE_SIZE, total)}</strong> of <strong>{total}</strong> appointments
              </div>
              <div className="pagination-controls">
                <Button variant="outline" size="sm" disabled={currentPage <= 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</Button>
                <span className="pagination-page-indicator">Page {currentPage} of {totalPages}</span>
                <Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Modals ── */}
      <AppointmentFormModal
        isOpen={bookModalOpen}
        onClose={() => setBookModalOpen(false)}
        onSubmit={handleBook}
        isLoading={submitting}
      />

      <AppointmentFormModal
        isOpen={editModalOpen}
        onClose={() => { setEditModalOpen(false); setSelectedApt(null); }}
        onSubmit={handleEdit}
        initialData={selectedApt}
        isLoading={submitting}
      />

      <AppointmentDetailModal
        isOpen={detailModalOpen}
        onClose={() => { setDetailModalOpen(false); setSelectedApt(null); }}
        appointment={selectedApt}
        onStatusUpdate={handleStatusUpdate}
        isLoading={submitting}
        userRole={role}
      />
    </div>
  );
};

export default AppointmentList;
