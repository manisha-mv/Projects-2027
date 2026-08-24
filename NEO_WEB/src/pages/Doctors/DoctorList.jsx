// pages/Doctors/DoctorList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiStethoscopeLine, RiAddLine, RiSearchLine, RiRefreshLine, RiMailLine, RiPhoneLine } from 'react-icons/ri';
import doctorService from '../../services/doctorService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';

export default function DoctorList() {
  const { addToast } = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: 'General Medicine',
    qualification: '',
    specialization: '',
    experience: 5,
    schedule: 'Mon-Fri 09:00-17:00',
    status: 'Active'
  });
  const [saving, setSaving] = useState(false);

  const fetchDoctors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await doctorService.getDoctors({ search, department: deptFilter, status: statusFilter });
      setDoctors(res.doctors || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, deptFilter, statusFilter]);

  useEffect(() => {
    fetchDoctors();
  }, [fetchDoctors]);

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        firstName: doctor.firstName || doctor.name?.split(' ')[0] || '',
        lastName: doctor.lastName || doctor.name?.split(' ').slice(1).join(' ') || '',
        email: doctor.email || '',
        phone: doctor.phone || '',
        department: doctor.department || 'General Medicine',
        qualification: doctor.qualification || '',
        specialization: doctor.specialization || '',
        experience: doctor.experience || 5,
        schedule: doctor.schedule || 'Mon-Fri 09:00-17:00',
        status: doctor.status || 'Active'
      });
    } else {
      setEditingDoctor(null);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        department: 'General Medicine',
        qualification: '',
        specialization: '',
        experience: 5,
        schedule: 'Mon-Fri 09:00-17:00',
        status: 'Active'
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.firstName || !formData.qualification) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'First name and qualification are required.' });
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...formData,
        name: `Dr. ${formData.firstName} ${formData.lastName}`.trim()
      };
      if (editingDoctor) {
        await doctorService.updateDoctor(editingDoctor.id || editingDoctor.doctorId, payload);
        addToast({ type: 'success', title: 'Updated', message: 'Doctor profile updated.' });
      } else {
        await doctorService.createDoctor(payload);
        addToast({ type: 'success', title: 'Added', message: 'Doctor registered successfully.' });
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setSaving(false);
    }
  };

  const activeCount = doctors.filter(d => d.status === 'Active').length;
  const onLeaveCount = doctors.filter(d => d.status === 'On Leave').length;
  const deptsCount = new Set(doctors.map(d => d.department)).size;

  const tableColumns = [
    {
      key: 'doctorId',
      label: 'Doctor ID',
      width: '120px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'name',
      label: 'Doctor Name & Schedule',
      width: '240px',
      render: (val, row) => (
        <div className="table-patient-cell">
          <Avatar name={val || 'Doctor'} size="sm" />
          <div>
            <div className="table-patient-name">{val}</div>
            <div className="table-patient-sub">⏰ {row.schedule || 'Mon-Fri'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'department',
      label: 'Department',
      width: '160px',
      render: (val) => <Badge variant="primary">{val}</Badge>,
    },
    {
      key: 'qualification',
      label: 'Qualification & Spec.',
      width: '220px',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: '13px' }}>{val}</div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{row.specialization}</div>
        </div>
      ),
    },
    {
      key: 'contact',
      label: 'Contact Details',
      width: '180px',
      render: (_, row) => (
        <div style={{ fontSize: '12px' }}>
          <div><RiMailLine style={{ verticalAlign: 'middle', marginRight: 4 }} />{row.email || '—'}</div>
          <div style={{ color: 'var(--color-text-muted)', marginTop: 2 }}><RiPhoneLine style={{ verticalAlign: 'middle', marginRight: 4 }} />{row.phone || '—'}</div>
        </div>
      ),
    },
    {
      key: 'experience',
      label: 'Experience',
      width: '110px',
      render: (val) => <span style={{ fontWeight: 600, fontSize: '13px' }}>{val} yrs</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'success' : 'warning'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <Button variant="outline" size="sm" onClick={() => handleOpenModal(row)}>
          Edit
        </Button>
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Doctor Directory"
        description="Manage hospital doctors, specializations, qualifications, and schedules"
        primaryAction={
          <Button variant="primary" onClick={() => handleOpenModal()}>
            <RiAddLine size={17} /> Add Doctor
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiStethoscopeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Doctors</div>
            <div className="stat-pill-value">{doctors.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiStethoscopeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Active On Duty</div>
            <div className="stat-pill-value">{activeCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6F4F3', color: '#0B9488' }}>
            <RiStethoscopeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Specialist Depts</div>
            <div className="stat-pill-value">{deptsCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiStethoscopeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">On Leave</div>
            <div className="stat-pill-value">{onLeaveCount}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search doctor by name, ID, qualification, or specialization..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 180, height: 38 }} value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}>
            <option value="">All Departments</option>
            <option value="General Medicine">General Medicine</option>
            <option value="Cardiology">Cardiology</option>
            <option value="Neurology">Neurology</option>
            <option value="Maternity & Gynaecology">Maternity & Gynaecology</option>
            <option value="Orthopaedics">Orthopaedics</option>
            <option value="Paediatrics">Paediatrics</option>
            <option value="Dermatology">Dermatology</option>
            <option value="ENT">ENT</option>
            <option value="Ophthalmology">Ophthalmology</option>
            <option value="Emergency & Trauma">Emergency & Trauma</option>
          </select>
          <select className="form-select" style={{ width: 140, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="On Leave">On Leave</option>
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchDoctors} />
      ) : (
        <Table
          columns={tableColumns}
          rows={doctors}
          loading={loading}
          emptyTitle="No doctors found"
          emptyDescription="Try adjusting search query or department filters."
        />
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDoctor ? `Edit ${editingDoctor.name}` : 'Add New Doctor'}
      >
        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">First Name *</label>
            <input
              className="form-input"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Last Name</label>
            <input
              className="form-input"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Department *</label>
            <select
              className="form-select"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            >
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Neurology">Neurology</option>
              <option value="Maternity & Gynaecology">Maternity & Gynaecology</option>
              <option value="Orthopaedics">Orthopaedics</option>
              <option value="Paediatrics">Paediatrics</option>
              <option value="Dermatology">Dermatology</option>
              <option value="ENT">ENT</option>
              <option value="Ophthalmology">Ophthalmology</option>
              <option value="Emergency & Trauma">Emergency & Trauma</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Qualification *</label>
            <input
              className="form-input"
              placeholder="e.g. MBBS, MD"
              value={formData.qualification}
              onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization</label>
            <input
              className="form-input"
              placeholder="e.g. Internal Medicine"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Experience (Years)</label>
            <input
              type="number"
              className="form-input"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-input"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone</label>
            <input
              className="form-input"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Schedule</label>
            <input
              className="form-input"
              placeholder="e.g. Mon-Fri 09:00-17:00"
              value={formData.schedule}
              onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active</option>
              <option value="On Leave">On Leave</option>
            </select>
          </div>
          <div className="modal-footer form-group-full">
            <button type="button" className="btn btn-ghost" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <Spinner size="sm" /> : 'Save Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
