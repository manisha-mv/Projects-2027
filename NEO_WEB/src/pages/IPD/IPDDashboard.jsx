// pages/IPD/IPDDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiHotelBedLine, RiAddLine, RiSearchLine, RiRefreshLine } from 'react-icons/ri';
import ipdService, { WARD_TYPES } from '../../services/ipdService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import BedMap from '../../components/ipd/BedMap';

import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function IPDDashboard() {
  const { addToast } = useToast();
  const [admissions, setAdmissions] = useState([]);
  const [beds, setBeds]             = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [search, setSearch]         = useState('');
  const [wardFilter, setWardFilter] = useState('');
  const [activeTab, setActiveTab]   = useState('admissions'); // 'admissions' | 'beds' | 'map'
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [formData, setFormData]   = useState({
    patientId: 'P10025',
    patientName: 'Arun Kumar',
    ward: 'General Male Ward',
    bedId: 'B-101',
    doctorName: 'Dr. Priya Sharma',
    diagnosis: '',
    condition: 'Stable',
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [admRes, bedRes] = await Promise.all([
        ipdService.getAdmissions({ search, ward: wardFilter }),
        ipdService.getBeds({ ward: wardFilter }),
      ]);
      setAdmissions(admRes.admissions || []);
      setBeds(bedRes.beds || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, wardFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    if (!formData.patientName || !formData.diagnosis) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Patient name and diagnosis are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await ipdService.admitPatient(formData);
      addToast({ type: 'success', title: 'Admitted', message: `Patient ${formData.patientName} admitted successfully.` });
      setIsAdmitModalOpen(false);
      fetchData();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const bedStats = {
    total: beds.length,
    occupied: beds.filter(b => b.isOccupied).length,
    available: beds.filter(b => !b.isOccupied).length,
  };

  const admissionColumns = [
    {
      key: 'admissionId',
      label: 'Admission ID',
      width: '130px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
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
      label: 'Ward & Bed Location',
      width: '180px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>🏥 {val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Bed #{row.bedId}</div>
        </div>
      ),
    },
    {
      key: 'doctorName',
      label: 'Attending Physician',
      width: '170px',
      render: (val) => <span style={{ fontWeight: 500, fontSize: '13px' }}>{val}</span>,
    },
    {
      key: 'admitDate',
      label: 'Admission Date',
      width: '130px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{val}</span>,
    },
    {
      key: 'condition',
      label: 'Clinical Condition',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'Critical' ? 'danger' : val === 'Serious' ? 'warning' : 'success'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '120px',
      align: 'right',
      render: (_, row) => (
        <Button variant="outline" size="sm">
          Details
        </Button>
      ),
    },
  ];

  const bedColumns = [
    {
      key: 'bedId',
      label: 'Bed ID',
      width: '120px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'ward',
      label: 'Ward Location',
      width: '180px',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '13px' }}>🏥 {val}</span>,
    },
    {
      key: 'type',
      label: 'Bed Type',
      width: '140px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{val || 'Standard Ward'}</span>,
    },
    {
      key: 'status',
      label: 'Current Status',
      width: '140px',
      render: (val) => (
        <Badge variant={val === 'Available' ? 'success' : val === 'Occupied' ? 'warning' : 'secondary'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'patientName',
      label: 'Occupied By Inpatient',
      width: '240px',
      render: (val, row) => (
        val ? (
          <div className="table-patient-cell">
            <Avatar name={val} size="sm" />
            <div>
              <div className="table-patient-name">{val}</div>
              <div className="table-patient-sub">ID: {row.patientId || 'N/A'}</div>
            </div>
          </div>
        ) : <span style={{ color: 'var(--color-text-muted)', fontSize: '12px' }}>— Available —</span>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="IPD & Bed Management"
        description="Manage inpatient admissions, bed occupancy, ward transfers, and discharges"
        primaryAction={
          <Button variant="primary" onClick={() => setIsAdmitModalOpen(true)}>
            <RiAddLine size={17} /> Admit Patient
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Ward Beds</div>
            <div className="stat-pill-value">{bedStats.total}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Available Beds</div>
            <div className="stat-pill-value">{bedStats.available}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Occupied Beds</div>
            <div className="stat-pill-value">{bedStats.occupied}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6F4F3', color: '#0B9488' }}>
            <RiHotelBedLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Active Admissions</div>
            <div className="stat-pill-value">{admissions.length}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, admission ID, or ward..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 180, height: 38 }} value={wardFilter} onChange={(e) => setWardFilter(e.target.value)}>
            <option value="">All Wards</option>
            {WARD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
      </div>

      {/* Worklist Tabs */}
      <div className="tabs" style={{ marginBottom: 'var(--space-4)' }}>
        <button
          className={`tab-item ${activeTab === 'admissions' ? 'active' : ''}`}
          onClick={() => setActiveTab('admissions')}
        >
          Active Admissions ({admissions.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'beds' ? 'active' : ''}`}
          onClick={() => setActiveTab('beds')}
        >
          Bed Occupancy ({beds.length})
        </button>
        <button
          className={`tab-item ${activeTab === 'map' ? 'active' : ''}`}
          onClick={() => setActiveTab('map')}
        >
          🗺️ Visual Bed Map
        </button>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchData} />
      ) : activeTab === 'admissions' ? (
        <Table
          columns={admissionColumns}
          rows={admissions}
          loading={loading}
          emptyTitle="No active admissions"
          emptyDescription="No inpatient admissions match the selected ward filter."
        />
      ) : activeTab === 'beds' ? (
        <Table
          columns={bedColumns}
          rows={beds}
          loading={loading}
          emptyTitle="No beds found"
          emptyDescription="No ward beds found matching criteria."
        />
      ) : (
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
            Interactive Ward Floorplan & Bed Grid
          </h3>
          <BedMap
            beds={beds}
            onSelectBed={(bed) => {
              if (bed.status === 'Available') {
                setFormData({ ...formData, bedId: bed.bedId || bed.id, ward: bed.ward });
                setIsAdmitModalOpen(true);
              } else {
                addToast({ type: 'info', title: `Bed ${bed.bedId}`, message: `Status: ${bed.status}. Occupied by ${bed.patientName || 'Patient'}.` });
              }
            }}
          />
        </div>
      )}

      {/* Admit Modal */}
      <Modal
        isOpen={isAdmitModalOpen}
        onClose={() => setIsAdmitModalOpen(false)}
        title="Inpatient Admission Form"
      >
        <form onSubmit={handleAdmitSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Patient ID</label>
            <input
              className="form-input"
              value={formData.patientId}
              onChange={(e) => setFormData({ ...formData, patientId: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Patient Name *</label>
            <input
              className="form-input"
              value={formData.patientName}
              onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Ward *</label>
            <select
              className="form-select"
              value={formData.ward}
              onChange={(e) => setFormData({ ...formData, ward: e.target.value })}
            >
              {WARD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Bed ID *</label>
            <input
              className="form-input"
              value={formData.bedId}
              onChange={(e) => setFormData({ ...formData, bedId: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Attending Doctor</label>
            <input
              className="form-input"
              value={formData.doctorName}
              onChange={(e) => setFormData({ ...formData, doctorName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Diagnosis</label>
            <input
              className="form-input"
              value={formData.diagnosis}
              onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsAdmitModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Complete Admission'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
