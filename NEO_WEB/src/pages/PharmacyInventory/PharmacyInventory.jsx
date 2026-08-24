// pages/PharmacyInventory/PharmacyInventory.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiArchiveLine,
  RiAddLine,
  RiSearchLine,
  RiAlertLine,
  RiRefreshLine,
  RiEyeLine,
  RiMedicineBottleLine,
  RiCheckDoubleLine,
} from 'react-icons/ri';
import inventoryService from '../../services/inventoryService';
import { useToast } from '../../components/ui/Toast';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import PageHeader from '../../components/common/PageHeader';
import MedicineDetailModal from '../../components/inventory/MedicineDetailModal';
import Table from '../../components/ui/Table';

export default function PharmacyInventory() {
  const { addToast } = useToast();
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  const [selectedMed, setSelectedMed] = useState(null);
  const [isAddMedModalOpen, setIsAddMedModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cardiovascular',
    manufacturer: '',
    supplier: '',
    batchNo: '',
    quantity: 100,
    minStock: 20,
    unitPrice: 10.0,
    mrp: 15.0,
    expiryDate: '2027-12-31',
    location: 'Shelf A-01',
    unit: 'Tablets'
  });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchInventory = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const filterCategory = categoryFilter === 'All' ? '' : categoryFilter;
      const filterStatus = statusFilter === 'All' ? '' : statusFilter;
      const res = await inventoryService.getMedicines({ search, category: filterCategory, status: filterStatus });
      setMedicines(res.medicines || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, statusFilter]);

  useEffect(() => {
    fetchInventory();
  }, [fetchInventory]);

  const handleResetFilters = () => {
    setSearch('');
    setCategoryFilter('All');
    setStatusFilter('All');
  };

  const handleUpdateStock = async (medId, stockAddQty) => {
    if (!medId || stockAddQty === 0) return;
    setActionLoading(true);
    try {
      await inventoryService.updateStock(medId, parseInt(stockAddQty, 10));
      addToast({ type: 'success', title: 'Stock Updated', message: `Stock level updated successfully.` });
      fetchInventory();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddMedicineSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.batchNo) {
      addToast({ type: 'warning', title: 'Required Fields', message: 'Medicine name and batch number are required.' });
      return;
    }
    setActionLoading(true);
    try {
      await inventoryService.addMedicine(formData);
      addToast({ type: 'success', title: 'Added', message: 'New medicine added to inventory.' });
      setIsAddMedModalOpen(false);
      fetchInventory();
    } catch (e) {
      addToast({ type: 'error', title: 'Error', message: e.message });
    } finally {
      setActionLoading(false);
    }
  };

  const lowStockCount = medicines.filter(m => m.status === 'Low Stock').length;
  const expiredCount = medicines.filter(m => m.status === 'Expired').length;
  const inStockCount = medicines.filter(m => m.status === 'In Stock').length;

  return (
    <div className="page-container">
      {/* Page Header */}
      <PageHeader
        title="Pharmacy Inventory & Stock"
        description="Real-time pharmaceutical stock management, batch control, and low stock notifications."
        primaryAction={
          <Button variant="primary" onClick={() => setIsAddMedModalOpen(true)}>
            <RiAddLine size={18} />
            Add Medicine Item
          </Button>
        }
      />

      {/* KPI Stats Strip (Matching Patients Page Screenshot 1) */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiArchiveLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Catalog Items</div>
            <div className="stat-pill-value">{medicines.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckDoubleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Healthy Stock Items</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{inStockCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <RiAlertLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Low Stock Alerts</div>
            <div className="stat-pill-value" style={{ color: '#D97706' }}>{lowStockCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiAlertLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Expired / Quarantine</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{expiredCount}</div>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar (Matching Patients Page Screenshot 1) */}
      <div className="patient-filter-bar">
        <div className="patient-search-box">
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search by Medicine Name, Batch No, Category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group">
          <div className="filter-item">
            <span className="filter-label">Category:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Categories</option>
              <option value="Cardiovascular">Cardiovascular</option>
              <option value="Antidiabetic">Antidiabetic</option>
              <option value="Respiratory">Respiratory</option>
              <option value="Neurology">Neurology</option>
              <option value="Antiemetic">Antiemetic</option>
              <option value="Analgesic">Analgesic</option>
              <option value="Antibiotic">Antibiotic</option>
              <option value="Vitamins">Vitamins</option>
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Stock:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="filter-select"
            >
              <option value="All">All Stock States</option>
              <option value="In Stock">In Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleResetFilters}>
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Data Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchInventory} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={[
              {
                key: 'batchNo',
                label: 'BATCH NO',
                width: '130px',
                render: (val, row) => (
                  <span className="patient-id-badge" onClick={() => setSelectedMed(row)} title="Click to view medicine details" style={{ cursor: 'pointer' }}>
                    {val}
                  </span>
                ),
              },
              {
                key: 'name',
                label: 'MEDICINE NAME',
                width: '220px',
                render: (val, row) => (
                  <div className="table-patient-cell" onClick={() => setSelectedMed(row)} style={{ cursor: 'pointer' }}>
                    <Avatar name={val} size="sm" />
                    <div>
                      <div className="table-patient-name">{val}</div>
                      <div className="table-patient-sub">{row.manufacturer}</div>
                    </div>
                  </div>
                ),
              },
              {
                key: 'category',
                label: 'CATEGORY',
                width: '130px',
                render: (val) => <Badge variant="secondary" size="sm">{val}</Badge>,
              },
              {
                key: 'quantity',
                label: 'STOCK LEVEL',
                width: '170px',
                render: (val, row) => {
                  const stockRatio = Math.min(100, Math.round((val / (row.minStock * 4 || 100)) * 100));
                  const isLow = row.status === 'Low Stock';
                  const isExpired = row.status === 'Expired';
                  return (
                    <div style={{ minWidth: '140px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <strong>{val} {row.unit}</strong>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>Min: {row.minStock}</span>
                      </div>
                      <div className="stock-meter-bg">
                        <div className={`stock-meter-fill ${isExpired ? 'low' : isLow ? 'moderate' : 'healthy'}`} style={{ width: `${Math.max(8, stockRatio)}%` }} />
                      </div>
                    </div>
                  );
                },
              },
              {
                key: 'expiryDate',
                label: 'EXPIRY DATE',
                width: '120px',
                render: (val, row) => (
                  <span style={{ color: row.status === 'Expired' ? '#DC2626' : 'inherit', fontWeight: row.status === 'Expired' ? 600 : 400, fontSize: 'var(--text-sm)' }}>
                    {val}
                  </span>
                ),
              },
              {
                key: 'mrp',
                label: 'MRP',
                width: '90px',
                render: (val) => <span style={{ fontWeight: 600 }}>₹{val}</span>,
              },
              {
                key: 'location',
                label: 'LOCATION',
                width: '110px',
                render: (val) => <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>{val}</span>,
              },
              {
                key: 'status',
                label: 'STATUS',
                width: '110px',
                render: (val) => (
                  <Badge variant={val === 'In Stock' ? 'success' : val === 'Low Stock' ? 'warning' : 'error'} size="sm">{val}</Badge>
                ),
              },
              {
                key: 'actions',
                label: 'ACTIONS',
                width: '150px',
                align: 'right',
                render: (_, row) => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <Button variant="outline" size="sm" onClick={() => setSelectedMed(row)}>
                      <RiEyeLine size={16} /> Details
                    </Button>
                  </div>
                ),
              },
            ]}
            rows={medicines}
            loading={loading}
            emptyTitle="No medicines found matching your search."
          />
        </div>
      )}

      {/* Medicine Detail Modal matching Patients Section Standard */}
      <MedicineDetailModal
        isOpen={!!selectedMed}
        onClose={() => setSelectedMed(null)}
        medicine={selectedMed}
        onUpdateStock={handleUpdateStock}
      />

      {/* Add Medicine Modal */}
      <Modal
        isOpen={isAddMedModalOpen}
        onClose={() => setIsAddMedModalOpen(false)}
        title="Add New Medicine to Inventory"
        size="lg"
      >
        <form onSubmit={handleAddMedicineSubmit} className="form-grid">
          <div className="form-group">
            <label className="form-label">Medicine Name *</label>
            <input
              className="form-input"
              placeholder="e.g. Amoxicillin 500mg"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Category *</label>
            <input
              className="form-input"
              placeholder="e.g. Antibiotic"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Batch No *</label>
            <input
              className="form-input"
              placeholder="e.g. BAT-2026-99"
              value={formData.batchNo}
              onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Quantity</label>
            <input
              type="number"
              className="form-input"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Min Stock Threshold</label>
            <input
              type="number"
              className="form-input"
              value={formData.minStock}
              onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value, 10) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">MRP (₹)</label>
            <input
              type="number"
              step="0.1"
              className="form-input"
              value={formData.mrp}
              onChange={(e) => setFormData({ ...formData, mrp: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Expiry Date</label>
            <input
              type="date"
              className="form-input"
              value={formData.expiryDate}
              onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Location / Shelf</label>
            <input
              className="form-input"
              placeholder="e.g. Shelf B-12"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="modal-footer form-group-full">
            <Button variant="ghost" onClick={() => setIsAddMedModalOpen(false)}>Cancel</Button>
            <Button variant="primary" type="submit" disabled={actionLoading}>
              {actionLoading ? <Spinner size="sm" /> : 'Save Medicine to Catalog'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}



