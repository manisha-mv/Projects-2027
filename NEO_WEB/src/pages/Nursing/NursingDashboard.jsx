// pages/Nursing/NursingDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiNurseLine, RiHeartPulseLine, RiCheckLine, RiRefreshLine, RiAddLine, RiFileTextLine } from 'react-icons/ri';
import nursingService from '../../services/nursingService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function NursingDashboard() {
  const { addToast } = useToast();
  const [patients, setPatients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'tasks' | 'vitals' | 'notes'

  // Modal states
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  
  const [vitalsData, setVitalsData] = useState({ bp: '120/80', pulse: 72, temp: 98.6, spo2: 98, rr: 16, notes: '' });
  const [noteData, setNoteData] = useState({ note: '', shift: 'Morning', recordedBy: 'Staff Nurse' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patRes, taskRes, vitalsRes, notesRes] = await Promise.all([
        nursingService.getAssignedPatients(),
        nursingService.getMedicationTasks(),
        nursingService.getVitals(),
        nursingService.getNotes()
      ]);
      setPatients(patRes.patients || []);
      setTasks(taskRes.tasks || []);
      setVitals(vitalsRes.vitals || []);
      setNotes(notesRes.notes || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleCompleteTask = async (taskId) => {
    setActionLoading(true);
    try {
      await nursingService.completeTask(taskId);
      addToast({ type: 'success', title: 'Task Completed', message: 'Medication task marked as completed.' });
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRecordVitals = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      await nursingService.recordVitals({
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.patientName,
        ...vitalsData
      });
      addToast({ type: 'success', title: 'Vitals Recorded', message: `Vitals recorded for ${selectedPatient.patientName}` });
      setIsVitalsModalOpen(false);
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setActionLoading(true);
    try {
      await nursingService.addNote({
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.patientName,
        ...noteData
      });
      addToast({ type: 'success', title: 'Note Added', message: `Nursing note recorded for ${selectedPatient.patientName}` });
      setIsNoteModalOpen(false);
      setNoteData({ note: '', shift: 'Morning', recordedBy: 'Staff Nurse' });
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;
  const criticalVitalsCount = vitals.filter(v => v.isCritical).length;

  // Patient Table Columns
  const patientColumns = [
    {
      key: 'patientName',
      label: 'Inpatient Name',
      width: '220px',
      render: (val, row) => (
        <div className="table-patient-cell">
          <Avatar name={val} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">ID: {row.patientId}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'ward',
      label: 'Ward / Bed Location',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>🏥 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bed #{row.bed}</div>
        </div>
      ),
    },
    {
      key: 'pendingTasks',
      label: 'Medication Worklist',
      width: '160px',
      render: (val) => (
        <Badge variant={val > 0 ? 'warning' : 'success'}>
          {val > 0 ? `${val} Pending Task(s)` : 'All Given'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '240px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setSelectedPatient(row);
              setIsVitalsModalOpen(true);
            }}
          >
            <RiHeartPulseLine /> Vitals
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedPatient(row);
              setIsNoteModalOpen(true);
            }}
          >
            <RiFileTextLine /> Add Note
          </Button>
        </div>
      ),
    },
  ];

  // Task Table Columns
  const taskColumns = [
    {
      key: 'scheduledTime',
      label: 'Time',
      width: '100px',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Inpatient Name',
      width: '190px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{row.patientId}</div>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Ward & Bed',
      width: '150px',
      render: (_, row) => <span style={{ fontSize: '13px' }}>{row.ward} (Bed #{row.bed})</span>,
    },
    {
      key: 'medicine',
      label: 'Medication & Dosage',
      width: '220px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--color-primary-dark)' }}>💊 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Dosage: {row.dosage}</div>
        </div>
      ),
    },
    {
      key: 'route',
      label: 'Route',
      width: '110px',
      render: (val) => <Badge variant="secondary">{val}</Badge>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '110px',
      render: (val) => <Badge variant={val === 'Completed' ? 'success' : 'warning'}>{val}</Badge>,
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '130px',
      align: 'right',
      render: (_, row) => (
        row.status === 'Pending' ? (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handleCompleteTask(row.id)}
            disabled={actionLoading}
          >
            <RiCheckLine /> Mark Given
          </Button>
        ) : (
          <span style={{ fontSize: '12px', color: 'var(--color-success)', fontWeight: 600 }}>✓ Administered</span>
        )
      ),
    },
  ];

  // Vitals Table Columns
  const vitalsColumns = [
    {
      key: 'recordedAt',
      label: 'Time Recorded',
      width: '140px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {row.patientId}</div>
        </div>
      ),
    },
    {
      key: 'bp',
      label: 'BP (mmHg)',
      width: '100px',
      render: (val, row) => <span style={{ fontWeight: 600, color: row.isCritical ? 'var(--color-danger)' : 'inherit' }}>{val || '—'}</span>,
    },
    {
      key: 'pulse',
      label: 'Pulse Rate',
      width: '100px',
      render: (val) => <span>{val} bpm</span>,
    },
    {
      key: 'temp',
      label: 'Temp (°F)',
      width: '90px',
      render: (val) => <span>{val} °F</span>,
    },
    {
      key: 'spo2',
      label: 'SpO2',
      width: '90px',
      render: (val) => (
        <Badge variant={val < 92 ? 'danger' : 'success'}>
          {val}%
        </Badge>
      ),
    },
    {
      key: 'notes',
      label: 'Observations',
      render: (val, row) => (
        <div style={{ fontSize: '12px', color: row.isCritical ? 'var(--color-danger)' : 'var(--color-text-secondary)' }}>
          {row.isCritical && <strong style={{ marginRight: '4px' }}>🚨 [CRITICAL ALERT]</strong>}
          {val || 'Routine check intact'}
        </div>
      ),
    },
  ];

  // Notes Table Columns
  const notesColumns = [
    {
      key: 'recordedAt',
      label: 'Timestamp',
      width: '140px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{val ? new Date(val).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>ID: {row.patientId}</div>
        </div>
      ),
    },
    {
      key: 'shift',
      label: 'Shift',
      width: '100px',
      render: (val) => <Badge variant="secondary">{val || 'Morning'}</Badge>,
    },
    {
      key: 'note',
      label: 'Clinical Observation Note',
      render: (val) => <div style={{ fontSize: '13px', lineHeight: '1.4' }}>{val}</div>,
    },
    {
      key: 'recordedBy',
      label: 'Nurse',
      width: '140px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>👩‍⚕️ {val}</span>,
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Nursing Station & Clinical Worklist"
        description="Manage assigned patients, record vitals, clinical nursing notes, and scheduled medication tasks"
        primaryAction={
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Worklist
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
            <RiNurseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Assigned Inpatients</div>
            <div className="stat-pill-value">{patients.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
            <RiHeartPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending Med Tasks</div>
            <div className="stat-pill-value">{pendingTasksCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <RiCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Administered Meds</div>
            <div className="stat-pill-value">{completedTasksCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiHeartPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Critical Vitals Alerts</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{criticalVitalsCount}</div>
          </div>
        </div>
      </div>

      {/* Worklist Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          className={`tab-item ${activeTab === 'patients' ? 'active' : ''}`}
          onClick={() => setActiveTab('patients')}
        >
          Assigned Patients ({patients.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          Medication Tasks ({tasks.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'vitals' ? 'active' : ''}`}
          onClick={() => setActiveTab('vitals')}
        >
          Vitals Log ({vitals.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'notes' ? 'active' : ''}`}
          onClick={() => setActiveTab('notes')}
        >
          Nursing Notes ({notes.length})
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === 'patients' ? (
        <Table
          columns={patientColumns}
          rows={patients}
          loading={loading}
          emptyTitle="No assigned patients"
          emptyDescription="You currently have no assigned ward patients."
        />
      ) : activeTab === 'tasks' ? (
        <Table
          columns={taskColumns}
          rows={tasks}
          loading={loading}
          emptyTitle="No medication tasks"
          emptyDescription="All medication administration tasks for this shift are complete."
        />
      ) : activeTab === 'vitals' ? (
        <Table
          columns={vitalsColumns}
          rows={vitals}
          loading={loading}
          emptyTitle="No vitals recorded"
          emptyDescription="No vital signs recorded yet for this shift."
        />
      ) : (
        <Table
          columns={notesColumns}
          rows={notes}
          loading={loading}
          emptyTitle="No nursing notes"
          emptyDescription="No clinical notes entered for this shift."
        />
      )}

      {/* Record Vitals Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isVitalsModalOpen}
          onClose={() => setIsVitalsModalOpen(false)}
          title={`Record Vitals — ${selectedPatient.patientName}`}
        >
          <form onSubmit={handleRecordVitals} className="form-grid">
            <div className="form-group">
              <label className="form-label">Blood Pressure (mmHg)</label>
              <input
                className="form-input"
                placeholder="120/80"
                value={vitalsData.bp}
                onChange={(e) => setVitalsData({ ...vitalsData, bp: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Pulse Rate (bpm)</label>
              <input
                type="number"
                className="form-input"
                value={vitalsData.pulse}
                onChange={(e) => setVitalsData({ ...vitalsData, pulse: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Temperature (°F)</label>
              <input
                type="number"
                step="0.1"
                className="form-input"
                value={vitalsData.temp}
                onChange={(e) => setVitalsData({ ...vitalsData, temp: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">SpO2 (%)</label>
              <input
                type="number"
                className="form-input"
                value={vitalsData.spo2}
                onChange={(e) => setVitalsData({ ...vitalsData, spo2: parseInt(e.target.value, 10) || 0 })}
              />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Nursing Observations</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter clinical observations..."
                value={vitalsData.notes}
                onChange={(e) => setVitalsData({ ...vitalsData, notes: e.target.value })}
              />
            </div>
            <div className="modal-footer form-group-full">
              <button type="button" className="btn btn-ghost" onClick={() => setIsVitalsModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" /> : 'Save Vitals'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Add Nursing Note Modal */}
      {selectedPatient && (
        <Modal
          isOpen={isNoteModalOpen}
          onClose={() => setIsNoteModalOpen(false)}
          title={`Add Clinical Nursing Note — ${selectedPatient.patientName}`}
        >
          <form onSubmit={handleAddNote} className="form-grid">
            <div className="form-group">
              <label className="form-label">Shift</label>
              <select
                className="form-select"
                value={noteData.shift}
                onChange={(e) => setNoteData({ ...noteData, shift: e.target.value })}
              >
                <option value="Morning">Morning Shift</option>
                <option value="Afternoon">Afternoon Shift</option>
                <option value="Night">Night Shift</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Recorded By</label>
              <input
                className="form-input"
                value={noteData.recordedBy}
                onChange={(e) => setNoteData({ ...noteData, recordedBy: e.target.value })}
              />
            </div>
            <div className="form-group form-group-full">
              <label className="form-label">Clinical Observation Note</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder="Detailed shift progress notes, symptom progression, interventions..."
                value={noteData.note}
                onChange={(e) => setNoteData({ ...noteData, note: e.target.value })}
              />
            </div>
            <div className="modal-footer form-group-full">
              <button type="button" className="btn btn-ghost" onClick={() => setIsNoteModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" /> : 'Save Clinical Note'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
