// pages/Dashboard.jsx
import React, { useEffect, useState, useCallback } from 'react';
import {
  RiUserHeartLine,
  RiCalendarLine,
  RiHotelBedLine,
  RiTaskLine,
  RiArrowRightLine,
  RiFlaskLine,
  RiAlertFill,
  RiInformationLine,
  RiCheckLine,
  RiScanLine,
  RiMedicineBottleLine,
  RiMoneyDollarCircleLine,
  RiNurseLine,
  RiRefreshLine,
  RiUserAddLine,
} from 'react-icons/ri';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Toast from '../components/ui/Toast';
import { Card, CardHeader, CardBody } from '../components/ui/Card';
import KpiTile from '../components/dashboard/KpiTile';
import QuickActions from '../components/dashboard/QuickActions';
import ActivityFeed from '../components/dashboard/ActivityFeed';
import DeptStatusCard from '../components/dashboard/DeptStatusCard';
import Spinner from '../components/ui/Spinner';
import PatientFormModal from '../components/patients/PatientFormModal';
import dashboardService from '../services/dashboardService';
import { patientService } from '../services/patientService';
import {
  mockDashboardStats,
  mockTodayAppointments,
  mockActiveAdmissions,
  mockDepartments,
  mockActivities,
  mockPendingTasks,
  mockPendingLabOrders,
  mockCriticalAlerts,
  mockShiftInfo,
} from '../data/mockData';
import { useAuth } from '../contexts/AuthContext';

// ── KPI Icons ────────────────────────────────────────────────
const KPI_ICONS = [
  <RiUserHeartLine size={18} />,
  <RiCalendarLine size={18} />,
  <RiHotelBedLine size={18} />,
  <RiTaskLine size={18} />,
];

const APT_STATUS_VARIANT = {
  'Completed':   'success',
  'In Progress': 'info',
  'Confirmed':   'primary',
  'Pending':     'warning',
};

const CONDITION_CLASS = {
  'Stable':     'condition-stable',
  'Serious':    'condition-serious',
  'Critical':   'condition-critical',
  'Recovering': 'condition-recovering',
};

const LAB_STATUS_VARIANT = {
  'Ready':      'success',
  'Processing': 'info',
  'Pending':    'warning',
};

const ALERT_ICONS = {
  critical: <RiAlertFill size={14} />,
  warning:  <RiInformationLine size={14} />,
  info:     <RiInformationLine size={14} />,
};

// ════════════════════════════════════════════════════════════
// Section: Command Bar
// ════════════════════════════════════════════════════════════
const CommandBar = ({ censusData }) => {
  const c = censusData?.census || mockShiftInfo.census;
  const shift = censusData?.shift || mockShiftInfo.shift;
  const shiftStart = censusData?.shiftStart || mockShiftInfo.shiftStart;
  const shiftEnd = censusData?.shiftEnd || mockShiftInfo.shiftEnd;

  return (
    <div className="dashboard-command-bar">
      <div className="cmd-census-item">
        <span className="cmd-census-value">{c.totalInpatients}</span>
        <span className="cmd-census-label">Inpatients</span>
      </div>
      <div className="cmd-divider" />
      <div className="cmd-census-item">
        <span className="cmd-census-value" style={{ color: 'var(--color-success)' }}>{c.admittedToday}</span>
        <span className="cmd-census-label">Admitted</span>
      </div>
      <div className="cmd-census-item">
        <span className="cmd-census-value" style={{ color: 'var(--color-secondary)' }}>{c.dischargedToday}</span>
        <span className="cmd-census-label">Discharged</span>
      </div>
      <div className="cmd-census-item">
        <span className="cmd-census-value" style={{ color: 'var(--color-warning)' }}>{c.scheduledDischarges}</span>
        <span className="cmd-census-label">Sch. Discharge</span>
      </div>
      <div className="cmd-census-item">
        <span className="cmd-census-value" style={{ color: 'var(--color-info)' }}>{c.pendingAdmissions}</span>
        <span className="cmd-census-label">Pending Admit</span>
      </div>
      <div className="cmd-divider" />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        <div style={{ width: 80, height: 6, background: 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ width: `${c.occupancyPct}%`, height: '100%', background: 'var(--color-primary)', borderRadius: 99, transition: 'width 0.6s' }} />
        </div>
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 'var(--font-semibold)' }}>
          {c.occupancyPct}% occupied
        </span>
      </div>

      {mockCriticalAlerts.slice(0, 2).map(alert => (
        <button key={alert.id} className={`cmd-alert-banner ${alert.type}`}>
          {alert.type === 'critical' && (
            <div className="cmd-alert-count">!</div>
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 180 }}>
            {alert.text.slice(0, 48)}{alert.text.length > 48 ? '…' : ''}
          </span>
        </button>
      ))}

      <div className="cmd-bar-right">
        <span className="cmd-shift-label">Shift:</span>
        <span className="cmd-shift-value">{shift} · {shiftStart}–{shiftEnd}</span>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════
// Role Specific KPI Banners
// ════════════════════════════════════════════════════════════
const RoleKpiBanner = ({ role, apiStats }) => {
  const normRole = (role || 'ADMIN').toUpperCase();
  const d = apiStats || {};

  if (normRole === 'DOCTOR') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.myTodayApts ?? 12}</div><div className="role-kpi-label">Today's Consultations</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><RiFlaskLine /></div>
          <div><div className="role-kpi-value">{d.pendingResults ?? 4}</div><div className="role-kpi-label">Lab Results Pending Review</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}><RiHotelBedLine /></div>
          <div><div className="role-kpi-value">{d.myAdmissions ?? 5}</div><div className="role-kpi-label">My Inpatients</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.activeEmergencies ?? 2}</div><div className="role-kpi-label">Active Emergencies</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'NURSE') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#E6F4F3', color: '#0B9488' }}><RiNurseLine /></div>
          <div><div className="role-kpi-value">{d.assignedPatients ?? 18}</div><div className="role-kpi-label">Ward Patients</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.pendingVitals ?? 3}</div><div className="role-kpi-label">Critical Vitals Monitor</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#EFF6FF', color: '#1D4ED8' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.todayAppointments ?? 87}</div><div className="role-kpi-label">Shift Worklist Items</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'LAB' || normRole === 'LAB_TECHNICIAN') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><RiFlaskLine /></div>
          <div><div className="role-kpi-value">{d.pendingOrders ?? 14}</div><div className="role-kpi-label">Pending Lab Orders</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.statOrders ?? 2}</div><div className="role-kpi-label">STAT Orders</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#D1FAE5', color: '#059669' }}><RiCheckLine /></div>
          <div><div className="role-kpi-value">{d.resultsReady ?? 9}</div><div className="role-kpi-label">Results Ready</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'RADIOLOGY' || normRole === 'RADIOLOGIST') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#ECFEFF', color: '#0E7490' }}><RiScanLine /></div>
          <div><div className="role-kpi-value">{d.pendingOrders ?? 8}</div><div className="role-kpi-label">Requested Scans</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#EDE9FE', color: '#7C3AED' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.scheduled ?? 5}</div><div className="role-kpi-label">Scheduled Today</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#D1FAE5', color: '#059669' }}><RiCheckLine /></div>
          <div><div className="role-kpi-value">{d.reported ?? 11}</div><div className="role-kpi-label">Reports Finalized</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'PHARMACIST') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FFF7ED', color: '#C2410C' }}><RiMedicineBottleLine /></div>
          <div><div className="role-kpi-value">{d.pendingPrescriptions ?? 16}</div><div className="role-kpi-label">Prescriptions Pending</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#D1FAE5', color: '#059669' }}><RiCheckLine /></div>
          <div><div className="role-kpi-value">{d.dispensedToday ?? 42}</div><div className="role-kpi-label">Dispensed Today</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.partialOrders ?? 3}</div><div className="role-kpi-label">Partial Fulfillment</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'BILLING' || normRole === 'INSURANCE') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#D1FAE5', color: '#059669' }}><RiMoneyDollarCircleLine /></div>
          <div><div className="role-kpi-value">₹{(d.revenueToday ?? 142500).toLocaleString()}</div><div className="role-kpi-label">Today's Revenue</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF3C7', color: '#D97706' }}><RiTaskLine /></div>
          <div><div className="role-kpi-value">{d.pendingInvoices ?? 18}</div><div className="role-kpi-label">Pending Invoices</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.overdueInvoices ?? 5}</div><div className="role-kpi-label">Overdue Payments</div></div>
        </div>
      </div>
    );
  }

  return null;
};

// ════════════════════════════════════════════════════════════
// Section: Today's Appointments Worklist
// ════════════════════════════════════════════════════════════
const AppointmentsWorklist = () => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Today's Appointments</div>
        <div className="dash-card-sub">{mockTodayAppointments.length} scheduled</div>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
        View all <RiArrowRightLine size={13} />
      </button>
    </CardHeader>
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <table className="worklist-table">
        <thead>
          <tr>
            <th>Time</th>
            <th>Patient</th>
            <th>Doctor / Dept</th>
            <th>Type</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockTodayAppointments.map(apt => (
            <tr key={apt.id}>
              <td>
                <span className="worklist-time">{apt.time}</span>
              </td>
              <td>
                <div className="worklist-patient-cell">
                  <div className="worklist-patient-avatar">{apt.initials}</div>
                  <div>
                    <div className="worklist-patient-name">{apt.patient}</div>
                    <div className="worklist-patient-id">{apt.patientId}</div>
                  </div>
                </div>
              </td>
              <td>
                <div className="worklist-doctor">{apt.doctor}</div>
                <div className="worklist-dept">{apt.dept}</div>
              </td>
              <td>
                <span className="worklist-type-chip">{apt.type}</span>
              </td>
              <td>
                <Badge variant={APT_STATUS_VARIANT[apt.status] || 'secondary'}>
                  {apt.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ════════════════════════════════════════════════════════════
// Section: Active Inpatient Admissions
// ════════════════════════════════════════════════════════════
const ActiveAdmissions = () => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Active Admissions</div>
        <div className="dash-card-sub">{mockActiveAdmissions.length} inpatients</div>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
        View IPD <RiArrowRightLine size={13} />
      </button>
    </CardHeader>
    <div style={{ overflowX: 'auto', flex: 1 }}>
      <table className="worklist-table">
        <thead>
          <tr>
            <th>Bed</th>
            <th>Patient</th>
            <th>Diagnosis</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockActiveAdmissions.map(adm => (
            <tr key={adm.id}>
              <td>
                <span className="bed-chip">{adm.bed}</span>
              </td>
              <td>
                <div className="worklist-patient-name">{adm.patient}</div>
                <div className="worklist-dept">{adm.doctor}</div>
              </td>
              <td>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
                  {adm.diagnosis}
                </span>
              </td>
              <td>
                <span className={`condition-pill ${CONDITION_CLASS[adm.condition] || ''}`}>
                  {adm.condition}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ════════════════════════════════════════════════════════════
// Section: Pending Clinical Tasks
// ════════════════════════════════════════════════════════════
const PendingTasks = () => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Pending Clinical Tasks</div>
        <div className="dash-card-sub">{mockPendingTasks.length} tasks open</div>
      </div>
      <Badge variant="warning">
        {mockPendingTasks.filter(t => t.priority === 'critical').length} Critical
      </Badge>
    </CardHeader>
    <CardBody style={{ padding: 'var(--space-3) var(--space-4)' }}>
      <ul className="task-list">
        {mockPendingTasks.map(task => (
          <li key={task.id} className={`task-item ${task.priority}`}>
            <div className={`task-prio-bar ${task.priority}`} />
            <div className="task-content">
              <div className="task-text">{task.text}</div>
              <div className="task-meta">
                <span className="task-module">{task.module}</span>
                <span>•</span>
                <span>{task.time}</span>
                <span>•</span>
                <span>{task.assignee}</span>
              </div>
            </div>
            <button className="btn btn-ghost btn-icon btn-sm" title="Mark Done">
              <RiCheckLine size={15} />
            </button>
          </li>
        ))}
      </ul>
    </CardBody>
  </Card>
);

// ════════════════════════════════════════════════════════════
// Section: Lab Orders Queue Component
// ════════════════════════════════════════════════════════════
const LabQueue = () => (
  <Card>
    <CardHeader>
      <div>
        <div className="dash-card-title">Lab Orders Queue</div>
        <div className="dash-card-sub">Pending & Ready results</div>
      </div>
      <button className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
        Open Lab <RiArrowRightLine size={13} />
      </button>
    </CardHeader>
    <div style={{ overflowX: 'auto' }}>
      <table className="worklist-table">
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Test</th>
            <th>Patient</th>
            <th>Urgency</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {mockPendingLabOrders.map(lab => (
            <tr key={lab.id}>
              <td><span className="worklist-time">{lab.id}</span></td>
              <td>
                <div style={{ fontWeight: 'var(--font-medium)', fontSize: 'var(--text-xs)' }}>{lab.test}</div>
              </td>
              <td>
                <div className="worklist-patient-name">{lab.patient}</div>
              </td>
              <td>
                <span className={`urgency-pill ${lab.urgency}`}>{lab.urgency}</span>
              </td>
              <td>
                <Badge variant={LAB_STATUS_VARIANT[lab.status] || 'secondary'}>
                  {lab.status}
                </Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

// ════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ════════════════════════════════════════════════════════════
const Dashboard = () => {
  const { user, role } = useAuth();
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState(mockActivities);
  const [census, setCensus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientSubmitting, setPatientSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  const handleSavePatient = async (formData) => {
    setPatientSubmitting(true);
    try {
      await patientService.createPatient(formData);
      setToast({ type: 'success', message: `Patient ${formData.firstName} ${formData.lastName} registered successfully!` });
      setIsPatientModalOpen(false);
      loadData();
    } catch (err) {
      setToast({ type: 'error', message: 'Failed to register patient. Please try again.' });
    } finally {
      setPatientSubmitting(false);
    }
  };

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsRes, actRes, censusRes] = await Promise.all([
        dashboardService.getStats(),
        dashboardService.getActivity(),
        dashboardService.getCensus(),
      ]);

      if (statsRes && statsRes.data) {
        setStats(statsRes.data);
        setIsLive(statsRes.isLiveApi);
      }
      if (actRes) setActivities(actRes);
      if (censusRes) setCensus(censusRes);
    } catch {
      /* fallback to mock */
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Transform live stats or mock stats for tiles
  const getKpiTiles = () => {
    if (stats) {
      return [
        {
          id: 'S001',
          label: 'Total Patients',
          value: (stats.totalPatients ?? 1284).toLocaleString(),
          sub: 'Registered in database',
          trend: 'up',
          accent: '#0F52BA',
          iconBg: '#E6EEF9',
          iconColor: '#0F52BA',
        },
        {
          id: 'S002',
          label: 'Appointments Today',
          value: (stats.todayAppointments ?? 87).toString(),
          sub: 'Scheduled consultations',
          trend: 'up',
          accent: '#0B9488',
          iconBg: '#E6F4F3',
          iconColor: '#0B9488',
        },
        {
          id: 'S003',
          label: 'Available Beds',
          value: (stats.availableBeds ?? 43).toString(),
          sub: `${stats.occupancyPct ?? 62}% occupied`,
          trend: 'down',
          accent: '#059669',
          iconBg: '#D1FAE5',
          iconColor: '#059669',
        },
        {
          id: 'S004',
          label: 'Emergencies / Admissions',
          value: (stats.activeAdmissions ?? 6).toString(),
          sub: `${stats.activeEmergencies ?? 2} critical cases`,
          trend: 'up',
          accent: '#D97706',
          iconBg: '#FEF3C7',
          iconColor: '#D97706',
        },
      ];
    }
    return mockDashboardStats;
  };

  const kpiTiles = getKpiTiles();

  return (
    <div className="module-page">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* ── Page Header / Welcome ───────────────────────────── */}
      <div className="dash-header">
        <div>
          <h1 className="dash-welcome">
            Welcome back, {user?.name || 'Doctor'}
          </h1>
          <p className="dash-sub">
            Role: <Badge variant="primary">{role || 'ADMIN'}</Badge> · HMS Central Command & Monitoring
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', flexWrap: 'wrap' }}>
          {isLive && <Badge variant="success">● Live MongoDB</Badge>}
          <Button variant="primary" size="sm" onClick={() => setIsPatientModalOpen(true)}>
            <RiUserAddLine /> Add Patient
          </Button>
          <button className="btn btn-outline btn-sm" onClick={loadData} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh
          </button>
          <span className="dash-date-badge">
            {new Date().toLocaleDateString('en-US', {
              weekday: 'short',
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* ── Command / Census Bar ────────────────────────────── */}
      <CommandBar censusData={census} />

      {/* ── Role Specific KPI Banners ───────────────────────── */}
      <RoleKpiBanner role={role} apiStats={stats} />

      {/* ── Quick Actions ───────────────────────────────────── */}
      <QuickActions onRegisterPatient={() => setIsPatientModalOpen(true)} />

      {/* ── Main KPI Tiles ──────────────────────────────────── */}
      <div className="kpi-grid">
        {kpiTiles.map((stat, i) => (
          <KpiTile
            key={stat.id}
            label={stat.label}
            value={stat.value}
            sub={stat.sub}
            trend={stat.trend}
            trendPct={stat.trendPct}
            icon={KPI_ICONS[i]}
            iconBg={stat.iconBg}
            iconColor={stat.iconColor}
            accent={stat.accent}
          />
        ))}
      </div>

      {/* ── Main Worklist Grid: 3 columns ──────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1.4fr 1fr 1fr',
          gap: 'var(--space-4)',
          alignItems: 'start',
        }}
        className="dash-worklist-grid"
      >
        <AppointmentsWorklist />
        <ActiveAdmissions />
        <PendingTasks />
      </div>

      {/* ── Department Status ───────────────────────────────── */}
      <div>
        <div className="dash-section-title">Department Status — Bed Occupancy</div>
        <div className="dept-status-grid">
          {mockDepartments.map(dept => (
            <DeptStatusCard
              key={dept.name}
              name={dept.name}
              patients={dept.patients}
              occupancy={dept.occupancy}
              beds={dept.beds}
              available={dept.available}
              onCall={dept.onCall}
              status={dept.status}
            />
          ))}
        </div>
      </div>

      {/* ── Bottom Row: Activity Feed + Lab Queue ──────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 'var(--space-4)',
          alignItems: 'start',
        }}
        className="dash-bottom-grid"
      >
        {/* Activity Feed */}
        <Card>
          <CardHeader>
            <div>
              <div className="dash-card-title">Recent Activity</div>
              <div className="dash-card-sub">Latest hospital system events</div>
            </div>
            <button className="btn btn-ghost btn-sm" style={{ gap: 4 }}>
              View all <RiArrowRightLine size={13} />
            </button>
          </CardHeader>
          <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <ActivityFeed activities={activities} maxItems={7} />
          </CardBody>
        </Card>

        {/* Lab Queue */}
        <LabQueue />
      </div>

      {/* Patient Registration Modal */}
      <PatientFormModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSubmit={handleSavePatient}
        isLoading={patientSubmitting}
      />
    </div>
  );
};

export default Dashboard;
