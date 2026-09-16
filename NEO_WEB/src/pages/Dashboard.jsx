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
import { useNavigate, Navigate } from 'react-router-dom';
import { NeoLogoMark } from '../components/common/NeoLogo';
import PatientPortal from './PatientPortal/PatientPortal';

// â”€â”€ KPI Icons â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Section: Command Bar
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
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
            {alert.text.slice(0, 48)}{alert.text.length > 48 ? 'â€¦' : ''}
          </span>
        </button>
      ))}

      <div className="cmd-bar-right">
        <span className="cmd-shift-label">Shift:</span>
        <span className="cmd-shift-value">{shift} Â· {shiftStart}â€“{shiftEnd}</span>
      </div>
    </div>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Role Specific KPI Banners
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const RoleKpiBanner = ({ role, apiStats }) => {
  const normRole = (role || 'ADMIN').toUpperCase();
  const d = apiStats || {};

  if (normRole === 'DOCTOR') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.myTodayApts ?? 12}</div><div className="role-kpi-label">Today's Consultations</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}><RiFlaskLine /></div>
          <div><div className="role-kpi-value">{d.pendingResults ?? 4}</div><div className="role-kpi-label">Lab Results Pending Review</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}><RiHotelBedLine /></div>
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
          <div className="role-kpi-icon" style={{ background: '#CCFBF1', color: '#0F766E' }}><RiNurseLine /></div>
          <div><div className="role-kpi-value">{d.assignedPatients ?? 18}</div><div className="role-kpi-label">Ward Patients</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.pendingVitals ?? 3}</div><div className="role-kpi-label">Critical Vitals Monitor</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#DBEAFE', color: '#1D4ED8' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.todayAppointments ?? 87}</div><div className="role-kpi-label">Shift Worklist Items</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'LAB' || normRole === 'LAB_TECHNICIAN') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}><RiFlaskLine /></div>
          <div><div className="role-kpi-value">{d.pendingOrders ?? 14}</div><div className="role-kpi-label">Pending Lab Orders</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.statOrders ?? 2}</div><div className="role-kpi-label">STAT Orders</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><RiCheckLine /></div>
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
          <div className="role-kpi-icon" style={{ background: '#E0F2FE', color: '#0284C7' }}><RiCalendarLine /></div>
          <div><div className="role-kpi-value">{d.scheduled ?? 5}</div><div className="role-kpi-label">Scheduled Today</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><RiCheckLine /></div>
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
          <div className="role-kpi-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><RiCheckLine /></div>
          <div><div className="role-kpi-value">{d.dispensedToday ?? 42}</div><div className="role-kpi-label">Dispensed Today</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}><RiAlertFill /></div>
          <div><div className="role-kpi-value">{d.partialOrders ?? 3}</div><div className="role-kpi-label">Partial Fulfillment</div></div>
        </div>
      </div>
    );
  }

  if (normRole === 'BILLING' || normRole === 'INSURANCE') {
    return (
      <div className="role-kpi-row">
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}><RiMoneyDollarCircleLine /></div>
          <div><div className="role-kpi-value">â‚¹{(d.revenueToday ?? 142500).toLocaleString()}</div><div className="role-kpi-label">Today's Revenue</div></div>
        </div>
        <div className="role-kpi-card">
          <div className="role-kpi-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}><RiTaskLine /></div>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Section: Today's Appointments Worklist
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const AppointmentsWorklist = ({ onNavigate }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Today's Appointments</div>
        <div className="dash-card-sub">{mockTodayAppointments.length} scheduled</div>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ gap: 4, cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/appointments')}
        id="view-all-appointments-btn"
      >
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Section: Active Inpatient Admissions
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const ActiveAdmissions = ({ onNavigate }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Active Admissions</div>
        <div className="dash-card-sub">{mockActiveAdmissions.length} inpatients</div>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ gap: 4, cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/ipd')}
        id="view-all-ipd-btn"
      >
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Section: Pending Clinical Tasks
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const PendingTasks = ({ onNavigate }) => {
  const [tasks, setTasks] = useState(mockPendingTasks);

  const toggleTask = (id) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const openTasks = tasks.filter(t => !t.done);

  return (
    <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <CardHeader>
        <div>
          <div className="dash-card-title">Pending Tasks</div>
          <div className="dash-card-sub">{openTasks.length} open tasks</div>
        </div>
        <button
          className="btn btn-ghost btn-sm"
          style={{ gap: 4, cursor: 'pointer' }}
          onClick={() => onNavigate && onNavigate('/nursing')}
          id="view-all-tasks-btn"
        >
          View all <RiArrowRightLine size={13} />
        </button>
      </CardHeader>
      <CardBody style={{ padding: 'var(--space-3) var(--space-4)', flex: 1 }}>
        <ul className="task-list">
          {tasks.map(task => (
            <li
              key={task.id}
              className={`task-item ${task.priority} ${task.done ? 'task-done' : ''}`}
              style={{ opacity: task.done ? 0.5 : 1, transition: 'all 0.2s ease' }}
            >
              <div className={`task-prio-bar ${task.priority}`} />
              <div className="task-content">
                <div className="task-text" style={{ textDecoration: task.done ? 'line-through' : 'none' }}>
                  {task.text}
                </div>
                <div className="task-meta">
                  <span className="task-module">{task.module}</span>
                  <span>â€¢</span>
                  <span>{task.time}</span>
                  <span>â€¢</span>
                  <span>{task.assignee}</span>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                title={task.done ? "Mark Pending" : "Mark Done"}
                onClick={() => toggleTask(task.id)}
                style={{ cursor: 'pointer', color: task.done ? 'var(--color-success)' : 'inherit' }}
              >
                <RiCheckLine size={16} />
              </button>
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// Section: Lab Orders Queue Component
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const LabQueue = ({ onNavigate }) => (
  <Card style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
    <CardHeader>
      <div>
        <div className="dash-card-title">Lab Orders Queue</div>
        <div className="dash-card-sub">Pending & Ready results</div>
      </div>
      <button
        className="btn btn-ghost btn-sm"
        style={{ gap: 4, cursor: 'pointer' }}
        onClick={() => onNavigate && onNavigate('/laboratory')}
        id="view-all-lab-btn"
      >
        Open Lab <RiArrowRightLine size={13} />
      </button>
    </CardHeader>
    <div style={{ overflowX: 'auto', flex: 1 }}>
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

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// MAIN DASHBOARD COMPONENT
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
const Dashboard = () => {
  const navigate = useNavigate();
  const { user, role } = useAuth();

  if (role === 'PATIENT') {
    return <Navigate to="/patient-portal" replace />;
  }

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
          trendPct: '4.2%',
          accent: '#5B21B6',
          iconBg: '#F3E8FF',
          iconColor: '#5B21B6',
        },
        {
          id: 'S002',
          label: 'Appointments Today',
          value: (stats.todayAppointments ?? 87).toString(),
          sub: 'Scheduled consultations',
          trend: 'up',
          trendPct: '8.7%',
          accent: '#0D9488',
          iconBg: '#CCFBF1',
          iconColor: '#0D9488',
        },
        {
          id: 'S003',
          label: 'Available Beds',
          value: (stats.availableBeds ?? 43).toString(),
          sub: `${stats.occupancyPct ?? 62}% occupied`,
          trend: 'down',
          trendPct: '3.1%',
          accent: '#0891B2',
          iconBg: '#CFFAFE',
          iconColor: '#0891B2',
        },
        {
          id: 'S004',
          label: 'Emergencies / Admissions',
          value: (stats.activeAdmissions ?? 6).toString(),
          sub: `${stats.activeEmergencies ?? 2} critical cases`,
          trend: 'up',
          trendPct: '12.0%',
          accent: '#F43F5E',
          iconBg: '#FEE2E2',
          iconColor: '#E11D48',
        },
      ];
    }
    return mockDashboardStats.map((item, idx) => {
      const brandColors = [
        { accent: '#5B21B6', iconBg: '#F3E8FF', iconColor: '#5B21B6' },
        { accent: '#0D9488', iconBg: '#CCFBF1', iconColor: '#0D9488' },
        { accent: '#0891B2', iconBg: '#CFFAFE', iconColor: '#0891B2' },
        { accent: '#F43F5E', iconBg: '#FEE2E2', iconColor: '#E11D48' },
      ];
      return { ...item, ...brandColors[idx % 4] };
    });
  };

  const kpiTiles = getKpiTiles();

  // Census shorthand
  const c = census?.census || mockShiftInfo.census;
  const shift = census?.shift || mockShiftInfo.shift;
  const shiftStart = census?.shiftStart || mockShiftInfo.shiftStart;
  const shiftEnd = census?.shiftEnd || mockShiftInfo.shiftEnd;

  return (
    <div className="module-page">
      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}

      {/* â”€â”€ Compact Logo Hero Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className="dashboard-hero-banner" style={{ padding: '14px 24px', minHeight: 'unset' }}>
        <div className="dashboard-hero-left" style={{ gap: 16 }}>
          {/* Logo */}
          <div
            className="dashboard-logo-showcase"
            title="NEO Care Hospital Official Logo"
            style={{ width: 72, height: 72, borderRadius: 16, padding: 6 }}
          >
            <NeoLogoMark size={60} />
          </div>

          <div className="dashboard-hero-brand-info" style={{ gap: 4 }}>
            <h1 className="dashboard-brand-title" style={{ fontSize: '1.3rem', gap: 8 }}>
              NEO<span className="highlight-teal">Care</span> HOSPITAL
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'rgba(255,255,255,0.6)', marginLeft: 6 }}>
                Central Operations Dashboard
              </span>
            </h1>
            <div className="dashboard-hero-welcome" style={{ fontSize: '12px' }}>
              <span>Welcome, <strong style={{ color: '#fff' }}>{user?.name || 'Staff'}</strong></span>
              <span>•</span>
              <span style={{ background: 'rgba(255,255,255,0.15)', padding: '1px 8px', borderRadius: 99, color: '#2DD4BF', fontSize: '10px', fontWeight: 700 }}>
                {role || 'ADMIN'}
              </span>
              {isLive && <span style={{ color: '#4ADE80', fontSize: '11px' }}>● Live</span>}
            </div>
            {/* Census mini-bar embedded in hero */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 4, flexWrap: 'wrap' }}>
              {[
                { label: 'Inpatients', value: c.totalInpatients, color: '#fff' },
                { label: 'Admitted', value: c.admittedToday, color: '#4ADE80' },
                { label: 'Discharged', value: c.dischargedToday, color: '#2DD4BF' },
                { label: 'Pending', value: c.pendingAdmissions, color: '#FACC15' },
                { label: 'Occupancy', value: `${c.occupancyPct}%`, color: '#A78BFA' },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: item.color, lineHeight: 1 }}>{item.value}</span>
                  <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{item.label}</span>
                </div>
              ))}
              <div style={{ width: 60, height: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 99, overflow: 'hidden' }}>
                <div style={{ width: `${c.occupancyPct}%`, height: '100%', background: 'linear-gradient(90deg, #2DD4BF, #A78BFA)', borderRadius: 99 }} />
              </div>
              <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.55)' }}>
                {shift} · {shiftStart}–{shiftEnd}
              </span>
              {mockCriticalAlerts.slice(0, 1).map(alert => (
                <span key={alert.id} style={{ background: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.4)', color: '#FCA5A5', fontSize: '10px', padding: '2px 8px', borderRadius: 99, maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  ⚠ {alert.text.slice(0, 42)}{alert.text.length > 42 ? '…' : ''}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="dashboard-hero-right" style={{ gap: 10 }}>
          <div className="dashboard-live-badge">
            <span className="dashboard-live-dot-pulse" />
            <span>ONLINE</span>
          </div>
          <div style={{ fontSize: '11px', color: '#E2E8F0', textAlign: 'right' }}>
            {new Date().toLocaleDateString('en-IN', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
          </div>
          <div className="dashboard-hero-actions">
            <button
              className="dashboard-hero-btn-primary"
              onClick={() => setIsPatientModalOpen(true)}
              id="dash-hero-add-patient-btn"
              style={{ padding: '7px 14px', fontSize: '12px' }}
            >
              <RiUserAddLine size={14} /> Register
            </button>
            <button
              className="dashboard-hero-btn-secondary"
              onClick={loadData}
              disabled={loading}
              id="dash-hero-refresh-btn"
              style={{ padding: '6px 12px', fontSize: '12px' }}
            >
              <RiRefreshLine size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      <RoleKpiBanner role={role} apiStats={stats} />

      {/* ── 1. KPI Tiles ─────────────────────────────────────── */}
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

      {/* ── 2. Quick Actions ─────────────────────────────────── */}
      <QuickActions onRegisterPatient={() => setIsPatientModalOpen(true)} />

      {/* ── 3. Today's Appointments — FULL PAGE WIDTH ────────── */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 24, background: 'var(--color-primary)', borderRadius: 4 }} />
            <div>
              <div className="dash-card-title" style={{ fontSize: '1.1rem' }}>Today's Appointments</div>
              <div className="dash-card-sub">{mockTodayAppointments.length} patient consultations scheduled for today</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ gap: 4, cursor: 'pointer' }}
            onClick={() => navigate('/appointments')}
            id="view-all-appointments-btn"
          >
            View all appointments <RiArrowRightLine size={13} />
          </button>
        </CardHeader>
        <div style={{ overflowX: 'auto' }}>
          <table className="worklist-table dash-apt-table" style={{ width: '100%' }}>
            <thead>
              <tr>
                <th style={{ width: 90 }}>Time</th>
                <th style={{ minWidth: 180 }}>Patient Name &amp; ID</th>
                <th style={{ minWidth: 160 }}>Assigned Doctor</th>
                <th style={{ minWidth: 130 }}>Department</th>
                <th style={{ minWidth: 120 }}>Visit Type</th>
                <th style={{ minWidth: 120 }}>Status</th>
                <th style={{ width: 100, textAlign: 'right' }}>Action</th>
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
                  </td>
                  <td>
                    <div className="worklist-dept" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                      {apt.dept}
                    </div>
                  </td>
                  <td>
                    <span className="worklist-type-chip">{apt.type}</span>
                  </td>
                  <td>
                    <Badge variant={APT_STATUS_VARIANT[apt.status] || 'secondary'}>
                      {apt.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '11px', padding: '3px 10px', cursor: 'pointer' }}
                      onClick={() => navigate('/appointments')}
                    >
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ── 4. Active Admissions & Pending Tasks (2 Columns) ── */}
      <div className="dash-mid-grid">
        <ActiveAdmissions onNavigate={navigate} />
        <PendingTasks onNavigate={navigate} />
      </div>

      {/* ── 5. Department Status — Bed Occupancy Card ─────────── */}
      <Card>
        <CardHeader>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 8, height: 24, background: 'var(--color-secondary)', borderRadius: 4 }} />
            <div>
              <div className="dash-card-title" style={{ fontSize: '1.1rem' }}>Department Status &amp; Bed Occupancy</div>
              <div className="dash-card-sub">Real-time bed availability &amp; on-call specialist deployment</div>
            </div>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            style={{ gap: 4, cursor: 'pointer' }}
            onClick={() => navigate('/departments')}
            id="view-all-depts-btn"
          >
            View all departments <RiArrowRightLine size={13} />
          </button>
        </CardHeader>
        <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
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
                onClick={() => navigate('/departments')}
              />
            ))}
          </div>
        </CardBody>
      </Card>

      {/* ── 6. Recent Activity & Lab Orders Queue (2 Columns) ── */}
      <div className="dash-bottom-grid">
        <Card style={{ display: 'flex', flexDirection: 'column' }}>
          <CardHeader>
            <div>
              <div className="dash-card-title">Recent Activity</div>
              <div className="dash-card-sub">Latest hospital system events</div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ gap: 4, cursor: 'pointer' }}
              onClick={() => navigate('/audit')}
              id="view-all-activity-btn"
            >
              View all <RiArrowRightLine size={13} />
            </button>
          </CardHeader>
          <CardBody style={{ padding: 'var(--space-4) var(--space-5)' }}>
            <ActivityFeed activities={activities} maxItems={6} />
          </CardBody>
        </Card>

        <LabQueue onNavigate={navigate} />
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
