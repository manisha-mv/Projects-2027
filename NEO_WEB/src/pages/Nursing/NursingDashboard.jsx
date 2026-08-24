// pages/Nursing/NursingDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiNurseLine, RiHeartPulseLine, RiCheckLine, RiRefreshLine, RiAddLine } from 'react-icons/ri';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('patients'); // 'patients' | 'tasks'

  // Vitals modal
  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [vitalsData, setVitalsData] = useState({ bp: '120/80', pulse: 72, temp: 98.6, spo2: 98, rr: 16, notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [patRes, taskRes] = await Promise.all([
        nursingService.getAssignedPatients(),
        nursingService.getMedicationTasks()
      ]);
      setPatients(patRes.patients || []);
      setTasks(taskRes.tasks || []);
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

  const pendingTasksCount = tasks.filter(t => t.status === 'Pending').length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completed').length;

  // Patient Table Columns
  const patientColumns = [
    {
      key: 'patientName',
      label: 'Inpatient Name',
      width: '240px',
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
      width: '180px',
      render: (val) => (
        <Badge variant={val > 0 ? 'warning' : 'success'}>
          {val > 0 ? `${val} Pending Task(s)` : 'All Given'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setSelectedPatient(row);
            setIsVitalsModalOpen(true);
          }}
        >
          <RiHeartPulseLine /> Record Vitals
        </Button>
      ),
    },
  ];

  // Task Table Columns
  const taskColumns = [
    {
      key: 'scheduledTime',
      label: 'Time',
      width: '110px',
      render: (val) => <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Inpatient Name',
      width: '200px',
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
      width: '120px',
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

  return (
    <div className="module-page">
      <PageHeader
        title="Nursing Station"
        description="Manage assigned patients, record vitals, nursing notes, and medication tasks"
        primaryAction={
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Worklist
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiNurseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Assigned Inpatients</div>
            <div className="stat-pill-value">{patients.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiHeartPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending Med Tasks</div>
            <div className="stat-pill-value">{pendingTasksCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Medications Administered</div>
            <div className="stat-pill-value">{completedTasksCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6F4F3', color: '#0B9488' }}>
            <RiNurseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Active Nurse Shift</div>
            <div className="stat-pill-value" style={{ fontSize: '14px', color: '#0B9488' }}>Morning Shift A</div>
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
      ) : (
        <Table
          columns={taskColumns}
          rows={tasks}
          loading={loading}
          emptyTitle="No medication tasks"
          emptyDescription="All medication administration tasks for this shift are complete."
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
              <label className="form-label">Nursing Notes</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Enter nursing observations..."
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
    </div>
  );
}
