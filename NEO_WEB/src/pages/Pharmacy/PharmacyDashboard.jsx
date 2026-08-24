// pages/Pharmacy/PharmacyDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { RiMedicineBottleLine, RiRefreshLine, RiSearchLine, RiCheckDoubleLine, RiTimeLine } from 'react-icons/ri';
import pharmacyService, { PRESCRIPTION_STATUSES } from '../../services/pharmacyService';
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

export default function PharmacyDashboard() {
  const { addToast } = useToast();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [dispenseMeds, setDispenseMeds] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchPrescriptions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await pharmacyService.getPrescriptions({ search, status: statusFilter });
      setPrescriptions(res.prescriptions || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchPrescriptions();
  }, [fetchPrescriptions]);

  const handleOpenDispenseModal = (rx) => {
    setSelectedPrescription(rx);
    setDispenseMeds(
      (rx.medicines || []).map(m => ({
        ...m,
        dispensedNow: (m.quantity || 0) - (m.dispensed || 0)
      }))
    );
  };

  const handleDispenseSubmit = async () => {
    if (!selectedPrescription) return;
    setActionLoading(true);
    try {
      const updatedMeds = dispenseMeds.map(m => ({
        name: m.name,
        dosage: m.dosage,
        frequency: m.frequency,
        duration: m.duration,
        quantity: m.quantity,
        dispensed: (m.dispensed || 0) + (parseInt(m.dispensedNow, 10) || 0)
      }));

      await pharmacyService.dispenseMedicine(selectedPrescription.id || selectedPrescription.prescriptionId, updatedMeds);
      addToast({ type: 'success', title: 'Dispensed', message: 'Medicines dispensed successfully.' });
      setSelectedPrescription(null);
      fetchPrescriptions();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const counts = {
    pending: prescriptions.filter(p => p.status === 'Pending').length,
    partially: prescriptions.filter(p => p.status === 'Partially Dispensed').length,
    dispensed: prescriptions.filter(p => p.status === 'Dispensed').length,
  };

  const tableColumns = [
    {
      key: 'prescriptionId',
      label: 'Rx ID',
      width: '120px',
      render: (val) => <span className="patient-id-badge">{val}</span>,
    },
    {
      key: 'patientName',
      label: 'Patient Name',
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
      key: 'doctorName',
      label: 'Prescribed By Doctor',
      width: '180px',
      render: (val) => <span style={{ fontWeight: 500, fontSize: '13px' }}>{val}</span>,
    },
    {
      key: 'prescribedDate',
      label: 'Prescription Date',
      width: '130px',
      render: (val) => <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{val}</span>,
    },
    {
      key: 'medicines',
      label: 'Prescribed Medicines',
      width: '260px',
      render: (val) => (
        <div style={{ fontSize: '12px', color: 'var(--color-text-primary)', fontWeight: 500 }}>
          💊 {val?.map(m => m.name).join(', ')}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '140px',
      render: (val) => (
        <Badge variant={val === 'Dispensed' ? 'success' : val === 'Partially Dispensed' ? 'info' : 'warning'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        row.status !== 'Dispensed' ? (
          <Button variant="primary" size="sm" onClick={() => handleOpenDispenseModal(row)}>
            <RiMedicineBottleLine /> Dispense
          </Button>
        ) : (
          <Button variant="ghost" size="sm" onClick={() => handleOpenDispenseModal(row)}>
            View Details
          </Button>
        )
      ),
    },
  ];

  return (
    <div className="module-page">
      <PageHeader
        title="Pharmacy Dashboard"
        description="Process prescriptions and dispense medications to patients"
        primaryAction={
          <Button variant="outline" onClick={fetchPrescriptions} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh Prescriptions
          </Button>
        }
      />

      {/* KPI Stats Strip */}
      <div className="module-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiTimeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Pending Prescriptions</div>
            <div className="stat-pill-value">{counts.pending}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiMedicineBottleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Partially Dispensed</div>
            <div className="stat-pill-value">{counts.partially}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Dispensed Today</div>
            <div className="stat-pill-value">{counts.dispensed}</div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="module-filter-bar">
        <div className="module-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            className="search-input"
            placeholder="Search patient, prescription ID, or doctor name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="module-filters-group">
          <select className="form-select" style={{ width: 180, height: 38 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            {PRESCRIPTION_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={fetchPrescriptions} />
      ) : (
        <Table
          columns={tableColumns}
          rows={prescriptions}
          loading={loading}
          emptyTitle="No prescriptions found"
          emptyDescription="No prescriptions match your current search or status filter."
        />
      )}

      {selectedPrescription && (
        <Modal
          isOpen={!!selectedPrescription}
          onClose={() => setSelectedPrescription(null)}
          title={`Prescription Details — ${selectedPrescription.prescriptionId}`}
        >
          <div className="modal-body-content">
            <p><strong>Patient:</strong> {selectedPrescription.patientName} ({selectedPrescription.patientId})</p>
            <p><strong>Doctor:</strong> {selectedPrescription.doctorName}</p>
            <p><strong>Notes:</strong> {selectedPrescription.notes || 'None'}</p>

            <h4 style={{ marginTop: '16px', marginBottom: '8px' }}>Medicines to Dispense</h4>
            <div className="table-card">
              <table className="data-table" style={{ fontSize: '13px' }}>
                <thead>
                  <tr>
                    <th>Medicine</th>
                    <th>Dosage / Freq</th>
                    <th>Prescribed Qty</th>
                    <th>Already Dispensed</th>
                    <th>Dispense Now</th>
                  </tr>
                </thead>
                <tbody>
                  {dispenseMeds.map((med, idx) => (
                    <tr key={idx}>
                      <td><strong>{med.name}</strong></td>
                      <td>{med.dosage} ({med.frequency})</td>
                      <td>{med.quantity}</td>
                      <td>{med.dispensed || 0}</td>
                      <td>
                        {selectedPrescription.status !== 'Dispensed' ? (
                          <input
                            type="number"
                            style={{ width: '70px', padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--color-border)' }}
                            value={med.dispensedNow}
                            min={0}
                            max={(med.quantity || 0) - (med.dispensed || 0)}
                            onChange={(e) => {
                              const val = parseInt(e.target.value, 10) || 0;
                              const updated = [...dispenseMeds];
                              updated[idx].dispensedNow = val;
                              setDispenseMeds(updated);
                            }}
                          />
                        ) : (
                          <span>0</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-ghost" onClick={() => setSelectedPrescription(null)}>Close</button>
            {selectedPrescription.status !== 'Dispensed' && (
              <button className="btn btn-primary" onClick={handleDispenseSubmit} disabled={actionLoading}>
                {actionLoading ? <Spinner size="sm" /> : 'Confirm Dispensing'}
              </button>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}
