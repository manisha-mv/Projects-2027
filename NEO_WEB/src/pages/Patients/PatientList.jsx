// pages/Patients/PatientList.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  RiUserAddLine,
  RiSearchLine,
  RiFilter3Line,
  RiRefreshLine,
  RiEyeLine,
  RiEditLine,
  RiUserHeartLine,
  RiVipCrownLine,
  RiHeartPulseLine,
  RiUserUnfollowLine,
} from 'react-icons/ri';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Avatar from '../../components/ui/Avatar';
import Toast from '../../components/ui/Toast';
import PatientFormModal from '../../components/patients/PatientFormModal';
import { patientService } from '../../services/patientService';
import { useAuth } from '../../contexts/AuthContext';

// Helper for status badge variant
const getStatusBadgeVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'success';
    case 'inpatient':
      return 'warning';
    case 'outpatient':
      return 'info';
    case 'discharged':
      return 'secondary';
    default:
      return 'neutral';
  }
};

const PatientList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // RBAC permission check for Add/Edit actions
  const userRole = user?.role ? user.role.toUpperCase() : 'RECEPTIONIST';
  const canAddEdit = ['ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'DOCTOR', 'NURSE'].includes(userRole);

  // Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGender, setSelectedGender] = useState('All');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Data State
  const [patients, setPatients] = useState([]);
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Modal & Toast State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientForEdit, setSelectedPatientForEdit] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState(null);

  // Fetch Patients
  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatients({
        search: searchQuery,
        gender: selectedGender,
        bloodGroup: selectedBloodGroup,
        status: selectedStatus,
        page: currentPage,
        limit: pageSize,
      });

      setPatients(res.patients || []);
      setTotalRecords(res.total || 0);
      setTotalPages(res.pages || 1);
      setIsLiveApi(Boolean(res.isLiveApi));
    } catch (err) {
      console.error('Failed to load patient directory', err);
      setToast({ type: 'error', message: 'Failed to fetch patients. Please refresh.' });
    } finally {
      setLoading(false);
    }
  }, [searchQuery, selectedGender, selectedBloodGroup, selectedStatus, currentPage]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  // Reset Filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedGender('All');
    setSelectedBloodGroup('All');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  // Open Modal for Add
  const handleOpenAddModal = () => {
    setSelectedPatientForEdit(null);
    setIsModalOpen(true);
  };

  // Open Modal for Edit
  const handleOpenEditModal = (patient) => {
    setSelectedPatientForEdit(patient);
    setIsModalOpen(true);
  };

  // Save Patient
  const handleFormSubmit = async (formData) => {
    setSubmitting(true);
    try {
      if (selectedPatientForEdit) {
        await patientService.updatePatient(selectedPatientForEdit.id || selectedPatientForEdit.patientId, formData);
        setToast({ type: 'success', message: `Patient ${formData.previewId} updated successfully.` });
      } else {
        await patientService.createPatient(formData);
        setToast({ type: 'success', message: `Patient registered successfully with ID: ${formData.previewId}` });
      }
      setIsModalOpen(false);
      loadPatients();
    } catch (err) {
      console.error('Error saving patient', err);
      setToast({ type: 'error', message: 'Error saving patient details. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Table Columns Setup
  const columns = [
    {
      key: 'patientId',
      label: 'Patient ID',
      width: '130px',
      render: (val, row) => (
        <span
          className="patient-id-badge"
          onClick={() => navigate(`/patients/${row.patientId || row.id}`)}
          title="Click to view patient profile"
        >
          {val || row.id}
        </span>
      ),
    },
    {
      key: 'name',
      label: 'Patient Name',
      width: '220px',
      render: (val, row) => {
        const displayName = val || `${row.firstName || ''} ${row.lastName || ''}`.trim() || 'Unknown';
        return (
          <div
            className="table-patient-cell"
            onClick={() => navigate(`/patients/${row.patientId || row.id}`)}
            style={{ cursor: 'pointer' }}
          >
            <Avatar name={displayName} size="sm" />
            <div>
              <div className="table-patient-name">{displayName}</div>
              <div className="table-patient-sub">{row.contact?.phone || row.phone || 'No phone'}</div>
            </div>
          </div>
        );
      },
    },
    {
      key: 'age',
      label: 'Age / Gender',
      width: '130px',
      render: (val, row) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-primary)' }}>
          {val != null ? `${val} yrs` : 'N/A'}, {row.gender || '—'}
        </span>
      ),
    },
    {
      key: 'contact',
      label: 'Phone Number',
      width: '160px',
      render: (val, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
          {row.contact?.phone || row.phone || '—'}
        </span>
      ),
    },
    {
      key: 'bloodGroup',
      label: 'Blood Group',
      width: '120px',
      render: (val) => (
        <Badge variant={val === 'Unknown' ? 'neutral' : 'error'} size="sm">
          {val || 'Unknown'}
        </Badge>
      ),
    },
    {
      key: 'lastVisit',
      label: 'Last Visit',
      width: '130px',
      render: (val) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {val || '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '130px',
      render: (val) => (
        <Badge variant={getStatusBadgeVariant(val)} size="sm">
          {val || 'Active'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <div style={{ display: 'flex', gap: 'var(--space-2)', justifyContent: 'flex-end' }}>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(`/patients/${row.patientId || row.id}`)}
            title="View Patient Profile"
          >
            <RiEyeLine size={16} />
            Profile
          </Button>
          {canAddEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleOpenEditModal(row)}
              title="Edit Patient Info"
            >
              <RiEditLine size={16} />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Patient Management Directory"
        description="Comprehensive central patient repository with medical profiles, emergency contacts, and RBAC tracking."
        primaryAction={
          canAddEdit && (
            <Button variant="primary" onClick={handleOpenAddModal}>
              <RiUserAddLine size={18} />
              Register New Patient
            </Button>
          )
        }
      />

      {/* KPI Stats Strip */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiUserHeartLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Directory Patients</div>
            <div className="stat-pill-value">{totalRecords}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiHeartPulseLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Inpatients (Admitted)</div>
            <div className="stat-pill-value">
              {patients.filter(p => p.status === 'Inpatient').length}
            </div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiVipCrownLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Active Outpatients</div>
            <div className="stat-pill-value">
              {patients.filter(p => p.status === 'Active' || p.status === 'Outpatient').length}
            </div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiUserUnfollowLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Data Mode</div>
            <div className="stat-pill-value" style={{ fontSize: '0.9rem', color: isLiveApi ? '#059669' : '#D97706' }}>
              {isLiveApi ? 'Live Backend REST' : 'Persistent Local API'}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Patient ID, Name, or Phone Number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          {/* Gender Filter */}
          <div className="filter-item">
            <span className="filter-label">Gender:</span>
            <select
              value={selectedGender}
              onChange={(e) => {
                setSelectedGender(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="All">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* Blood Group Filter */}
          <div className="filter-item">
            <span className="filter-label">Blood:</span>
            <select
              value={selectedBloodGroup}
              onChange={(e) => {
                setSelectedBloodGroup(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="All">All Blood Groups</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="filter-select"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Inpatient">Inpatient</option>
              <option value="Outpatient">Outpatient</option>
              <option value="Discharged">Discharged</option>
            </select>
          </div>

          {/* Reset Filters */}
          <Button variant="ghost" size="sm" onClick={handleResetFilters} title="Reset all search filters">
            <RiRefreshLine size={16} />
            Reset
          </Button>
        </div>
      </div>

      {/* Directory Data Table */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <Table
          columns={columns}
          rows={patients}
          loading={loading}
          emptyTitle="No patient records found matching your filters."
        />

        {/* Pagination Footer */}
        {!loading && totalRecords > 0 && (
          <div className="table-pagination-strip">
            <div className="pagination-info">
              Showing <strong>{((currentPage - 1) * pageSize) + 1}</strong> to <strong>{Math.min(currentPage * pageSize, totalRecords)}</strong> of <strong>{totalRecords}</strong> patients
            </div>

            <div className="pagination-controls">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              >
                Previous
              </Button>
              <span className="pagination-page-indicator">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Registration / Edit Modal */}
      <PatientFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialData={selectedPatientForEdit}
        isLoading={submitting}
      />

      {/* Toast Notification */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default PatientList;
