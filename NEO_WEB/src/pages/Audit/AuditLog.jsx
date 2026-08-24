// pages/Audit/AuditLog.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiShieldKeyholeLine,
  RiSearchLine,
  RiRefreshLine,
  RiDownloadLine,
  RiCheckboxCircleLine,
  RiAlertLine,
  RiTimeLine,
  RiFileListLine,
} from 'react-icons/ri';
import auditService, { AUDIT_ACTIONS, AUDIT_MODULES, AUDIT_STATUSES } from '../../services/auditService';
import Spinner from '../../components/ui/Spinner';
import EmptyState from '../../components/ui/EmptyState';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Table from '../../components/ui/Table';
import PageHeader from '../../components/common/PageHeader';

const getStatusVariant = (status) => {
  switch (status?.toLowerCase()) {
    case 'success': return 'success';
    case 'failed': return 'error';
    case 'warning': return 'warning';
    default: return 'success';
  }
};

const getRoleBadgeVariant = (role) => {
  switch (role?.toUpperCase()) {
    case 'ADMIN': return 'primary';
    case 'DOCTOR': return 'info';
    case 'NURSE': return 'success';
    default: return 'secondary';
  }
};

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [moduleFilter, setModuleFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auditService.getLogs({
        search,
        module: moduleFilter,
        action: actionFilter,
        status: statusFilter,
        from: fromDate,
        to: toDate,
      });
      setLogs(res.logs || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [search, moduleFilter, actionFilter, statusFilter, fromDate, toDate]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleReset = () => {
    setSearch('');
    setModuleFilter('');
    setActionFilter('');
    setStatusFilter('');
    setFromDate('');
    setToDate('');
  };

  const handleExportCSV = () => {
    if (!logs || logs.length === 0) return;
    const headers = ['Timestamp', 'User', 'Role', 'Action', 'Module', 'Patient', 'IP Address', 'Status', 'Description'];
    const rows = logs.map(l => [
      `"${new Date(l.timestamp).toLocaleString()}"`,
      `"${l.userName || ''}"`,
      `"${l.role || ''}"`,
      `"${l.action || ''}"`,
      `"${l.module || ''}"`,
      `"${l.patientName || ''}"`,
      `"${l.ipAddress || ''}"`,
      `"${l.status || ''}"`,
      `"${(l.description || '').replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NEO_HMS_Audit_Logs_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // KPI stats
  const successCount = logs.filter(l => !l.status || l.status === 'Success').length;
  const failedCount = logs.filter(l => l.status === 'Failed').length;
  const uniqueModules = new Set(logs.map(l => l.module)).size;

  const columns = [
    {
      key: 'timestamp',
      label: 'TIMESTAMP',
      width: '160px',
      render: (val, row) => (
        <div>
          <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600 }}>
            {new Date(val || row.createdAt).toLocaleDateString()}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
            {new Date(val || row.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ),
    },
    {
      key: 'userName',
      label: 'USER',
      width: '190px',
      render: (val, row) => (
        <div className="table-patient-cell">
          <Avatar name={val || 'System'} size="sm" />
          <div>
            <div className="table-patient-name">{val || row.userEmail || 'System'}</div>
            <div className="table-patient-sub">{row.ipAddress || '127.0.0.1'}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'ROLE',
      width: '110px',
      render: (val, row) => (
        <Badge variant={getRoleBadgeVariant(val || row.userRole)} size="sm">
          {val || row.userRole || 'SYSTEM'}
        </Badge>
      ),
    },
    {
      key: 'action',
      label: 'ACTION',
      width: '130px',
      render: (val) => <strong style={{ fontSize: 'var(--text-sm)' }}>{val}</strong>,
    },
    {
      key: 'module',
      label: 'MODULE',
      width: '130px',
      render: (val) => (
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>{val}</span>
      ),
    },
    {
      key: 'patientName',
      label: 'PATIENT REF.',
      width: '160px',
      render: (val, row) => (
        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-muted)' }}>
          {val ? `${val} (${row.patientId})` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'STATUS',
      width: '100px',
      render: (val) => (
        <Badge variant={getStatusVariant(val)} size="sm">{val || 'Success'}</Badge>
      ),
    },
    {
      key: 'description',
      label: 'DETAILS',
      render: (val, row) => (
        <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
          {val || row.details || '—'}
        </span>
      ),
    },
  ];

  return (
    <div className="page-container">
      <PageHeader
        title="Audit & Activity Log"
        description="System-wide security audit trail, user actions, module operations, and access logs."
        primaryAction={
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="outline" onClick={handleExportCSV} disabled={logs.length === 0}>
              <RiDownloadLine size={18} /> Export CSV
            </Button>
            <Button variant="primary" onClick={fetchLogs} disabled={loading}>
              <RiRefreshLine size={18} className={loading ? 'spin' : ''} /> Refresh
            </Button>
          </div>
        }
      />

      {/* KPI Strip */}
      <div className="patient-stats-strip">
        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#E6EEF9', color: '#0F52BA' }}>
            <RiFileListLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Total Log Entries</div>
            <div className="stat-pill-value">{logs.length}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#D1FAE5', color: '#059669' }}>
            <RiCheckboxCircleLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Successful Actions</div>
            <div className="stat-pill-value" style={{ color: '#059669' }}>{successCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#FEE2E2', color: '#DC2626' }}>
            <RiAlertLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Failed / Error Events</div>
            <div className="stat-pill-value" style={{ color: '#DC2626' }}>{failedCount}</div>
          </div>
        </div>

        <div className="stat-pill-card">
          <div className="stat-pill-icon" style={{ background: '#F1F5F9', color: '#64748B' }}>
            <RiShieldKeyholeLine size={20} />
          </div>
          <div>
            <div className="stat-pill-label">Modules Covered</div>
            <div className="stat-pill-value">{uniqueModules} modules</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="patient-filter-bar" style={{ flexWrap: 'wrap', gap: 'var(--space-2)' }}>
        <div className="patient-search-box" style={{ minWidth: '240px', flex: 1 }}>
          <RiSearchLine className="search-icon" size={18} />
          <input
            type="text"
            placeholder="Search user, IP address, action description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="patient-filters-group" style={{ flexWrap: 'wrap' }}>
          <div className="filter-item">
            <span className="filter-label">From:</span>
            <input type="date" className="filter-select" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
          </div>

          <div className="filter-item">
            <span className="filter-label">To:</span>
            <input type="date" className="filter-select" value={toDate} onChange={(e) => setToDate(e.target.value)} />
          </div>

          <div className="filter-item">
            <span className="filter-label">Module:</span>
            <select className="filter-select" value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)}>
              <option value="">All Modules</option>
              {AUDIT_MODULES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Action:</span>
            <select className="filter-select" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
              <option value="">All Actions</option>
              {AUDIT_ACTIONS.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="filter-item">
            <span className="filter-label">Status:</span>
            <select className="filter-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {AUDIT_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <Button variant="ghost" size="sm" onClick={handleReset} title="Reset all filters">
            <RiRefreshLine size={16} /> Reset
          </Button>
        </div>
      </div>

      {/* Table */}
      {error ? (
        <ErrorState message={error} onRetry={fetchLogs} />
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <Table
            columns={columns}
            rows={logs}
            loading={loading}
            emptyTitle="No audit log entries found matching your filter criteria."
          />
        </div>
      )}
    </div>
  );
}
