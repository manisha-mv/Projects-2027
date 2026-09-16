// pages/Reports/ReportsDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiBarChartBoxLine, RiPrinterLine, RiRefreshLine, RiDownloadLine,
  RiUserHeartLine, RiCalendarCheckLine, RiStethoscopeLine, RiBuildingLine,
  RiFlaskLine, RiScanLine, RiMedicineBottleLine, RiMoneyDollarCircleLine,
  RiHotelBedLine, RiLogoutBoxLine, RiAlertLine, RiShieldCheckLine,
  RiRouterLine, RiArrowRightSLine, RiCheckDoubleLine,
} from 'react-icons/ri';
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import reportService, { REPORT_TYPES } from '../../services/reportService';
import Spinner from '../../components/ui/Spinner';
import ErrorState from '../../components/ui/ErrorState';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import PageHeader from '../../components/common/PageHeader';
import Table from '../../components/ui/Table';

// ── Report type meta (icon + color) ──────────────────────────────────────────
const REPORT_META = {
  patients:     { icon: <RiUserHeartLine size={22} />,         color: '#2563EB', bg: '#DBEAFE', group: 'Clinical' },
  appointments: { icon: <RiCalendarCheckLine size={22} />,     color: '#0D9488', bg: '#CCFBF1', group: 'Clinical' },
  doctors:      { icon: <RiStethoscopeLine size={22} />,       color: '#7C3AED', bg: '#EDE9FE', group: 'Clinical' },
  departments:  { icon: <RiBuildingLine size={22} />,          color: '#0284C7', bg: '#E0F2FE', group: 'Clinical' },
  laboratory:   { icon: <RiFlaskLine size={22} />,             color: '#F59E0B', bg: '#FEF9C3', group: 'Diagnostic' },
  radiology:    { icon: <RiScanLine size={22} />,              color: '#06B6D4', bg: '#CFFAFE', group: 'Diagnostic' },
  pharmacy:     { icon: <RiMedicineBottleLine size={22} />,    color: '#8B5CF6', bg: '#EDE9FE', group: 'Pharmacy' },
  billing:      { icon: <RiMoneyDollarCircleLine size={22} />, color: '#16A34A', bg: '#DCFCE7', group: 'Finance' },
  admissions:   { icon: <RiHotelBedLine size={22} />,          color: '#0F766E', bg: '#CCFBF1', group: 'IPD' },
  discharge:    { icon: <RiLogoutBoxLine size={22} />,         color: '#475569', bg: '#F1F5F9', group: 'IPD' },
  complaints:   { icon: <RiAlertLine size={22} />,             color: '#DC2626', bg: '#FEE2E2', group: 'Quality' },
  audit:        { icon: <RiShieldCheckLine size={22} />,       color: '#92400E', bg: '#FEF3C7', group: 'Quality' },
  traceability: { icon: <RiRouterLine size={22} />,            color: '#1D4ED8', bg: '#DBEAFE', group: 'Quality' },
};

const GROUPS = ['Clinical', 'Diagnostic', 'Pharmacy', 'Finance', 'IPD', 'Quality'];

const CHART_COLORS = ['#2563EB', '#0D9488', '#F59E0B', '#DC2626', '#8B5CF6', '#06B6D4'];

const MONTHLY_DATA = [
  { month: 'Jan', patients: 120, revenue: 320000 },
  { month: 'Feb', patients: 140, revenue: 380000 },
  { month: 'Mar', patients: 165, revenue: 420000 },
  { month: 'Apr', patients: 150, revenue: 390000 },
  { month: 'May', patients: 190, revenue: 490000 },
  { month: 'Jun', patients: 210, revenue: 540000 },
  { month: 'Jul', patients: 185, revenue: 510000 },
  { month: 'Aug', patients: 225, revenue: 580000 },
];

const DEPT_DATA = [
  { name: 'Gen Med',     vol: 145 },
  { name: 'Cardiology',  vol: 98 },
  { name: 'Neurology',   vol: 64 },
  { name: 'Orthopaedics',vol: 72 },
  { name: 'Maternity',   vol: 55 },
  { name: 'Radiology',   vol: 88 },
];

const GENDER_DATA = [
  { name: 'Male',   value: 48 },
  { name: 'Female', value: 42 },
  { name: 'Other',  value: 10 },
];

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '10px 14px', boxShadow: 'var(--shadow-md)', fontSize: 12 }}>
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontWeight: 600 }}>{p.name}: {typeof p.value === 'number' && p.value > 999 ? `₹${p.value.toLocaleString('en-IN')}` : p.value}</div>
      ))}
    </div>
  );
};

export default function ReportsDashboard() {
  const [selected, setSelected] = useState('patients');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fromDate, setFromDate] = useState('2026-01-01');
  const [toDate, setToDate]     = useState('2026-12-31');

  const fetchReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await reportService.getReport(selected, { from: fromDate, to: toDate });
      setReportData(res.report || null);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [selected, fromDate, toDate]);

  useEffect(() => { fetchReport(); }, [fetchReport]);

  const handleExportCSV = () => {
    if (!reportData?.data?.length) return;
    const headers = Object.keys(reportData.data[0]).join(',');
    const rows = reportData.data.map(r =>
      Object.values(r).map(v => (typeof v === 'object' ? JSON.stringify(v) : `"${v}"`)).join(',')
    );
    const uri = 'data:text/csv;charset=utf-8,' + encodeURIComponent([headers, ...rows].join('\n'));
    const a = document.createElement('a');
    a.href = uri;
    a.download = `NEO_HMS_${selected}_report.csv`;
    a.click();
  };

  const selectedMeta = REPORT_META[selected] || REPORT_META.patients;
  const selectedType = REPORT_TYPES.find(r => r.id === selected);

  // ── Table columns for data rows ───────────────────────────────────────────
  const dataColumns = [
    {
      key: 'id', label: 'RECORD ID', width: '140px',
      render: (val, row) => (
        <span className="patient-id-badge">
          {row.patientId || row.invoiceId || row.orderId || row.id || `#${Math.random().toString(36).slice(2,7).toUpperCase()}`}
        </span>
      ),
    },
    {
      key: 'name', label: 'NAME / DETAILS', width: '220px',
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600, fontSize: 13 }}>{row.patientName || row.name || row.testName || row.subject || 'Record'}</div>
          {(row.department || row.status) && (
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>{row.department || ''}</div>
          )}
        </div>
      ),
    },
    {
      key: 'date', label: 'DATE', width: '120px',
      render: (_, row) => (
        <span style={{ fontFamily: 'monospace', fontSize: 13 }}>
          {row.registeredDate || row.invoiceDate || row.orderedDate || row.submittedDate || row.appointmentDate || '—'}
        </span>
      ),
    },
    {
      key: 'status', label: 'STATUS', width: '120px',
      render: (_, row) => (
        <Badge variant={
          row.status === 'Active' || row.status === 'Paid' || row.status === 'Completed' ? 'success' :
          row.status === 'Pending' ? 'warning' : 'secondary'
        } size="sm">{row.status || 'Active'}</Badge>
      ),
    },
  ];

  return (
    <div className="module-page">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <PageHeader
        title="Reports & Analytics"
        description="Hospital-wide statistical reports, financial summaries, and operational analytics"
        primaryAction={
          <div style={{ display: 'flex', gap: 8 }}>
            <Button variant="outline" onClick={handleExportCSV}>
              <RiDownloadLine size={16} /> Export CSV
            </Button>
            <Button variant="outline" onClick={() => window.print()}>
              <RiPrinterLine size={16} /> Print
            </Button>
            <Button variant="primary" onClick={fetchReport} disabled={loading}>
              <RiRefreshLine className={loading ? 'spin' : ''} size={16} /> Generate
            </Button>
          </div>
        }
      />

      {/* ── Date Range Bar ────────────────────────────────────────────── */}
      <div className="module-filter-bar" style={{ flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <RiBarChartBoxLine size={18} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-text-primary)', whiteSpace: 'nowrap' }}>Date Range:</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>From</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 155, height: 36, fontSize: 13 }}
              value={fromDate}
              onChange={e => setFromDate(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text-secondary)', fontWeight: 600 }}>To</label>
            <input
              type="date"
              className="form-input"
              style={{ width: 155, height: 36, fontSize: 13 }}
              value={toDate}
              onChange={e => setToDate(e.target.value)}
            />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 'auto' }}>
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            Viewing: <strong style={{ color: 'var(--color-primary)' }}>{selectedType?.label}</strong>
          </span>
        </div>
      </div>

      {/* ── Report Category Selector ──────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {GROUPS.map(group => {
          const groupTypes = REPORT_TYPES.filter(rt => REPORT_META[rt.id]?.group === group);
          if (!groupTypes.length) return null;
          return (
            <div key={group}>
              {/* Group Label */}
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--color-text-muted)', marginBottom: 8, paddingLeft: 2 }}>
                {group}
              </div>
              {/* Cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 10 }}>
                {groupTypes.map(rt => {
                  const meta = REPORT_META[rt.id] || {};
                  const isActive = selected === rt.id;
                  return (
                    <button
                      key={rt.id}
                      onClick={() => setSelected(rt.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: 12,
                        padding: '14px 16px',
                        textAlign: 'left',
                        cursor: 'pointer',
                        background: isActive ? meta.color : 'var(--color-surface)',
                        border: isActive ? `2px solid ${meta.color}` : '1.5px solid var(--color-border)',
                        borderRadius: 'var(--radius-lg)',
                        transition: 'all 0.18s ease',
                        transform: isActive ? 'translateY(-1px)' : 'none',
                        boxShadow: isActive ? `0 4px 14px ${meta.color}33` : 'var(--shadow-xs)',
                        outline: 'none',
                        width: '100%',
                      }}
                    >
                      {/* Icon */}
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: isActive ? 'rgba(255,255,255,0.2)' : meta.bg,
                        color: isActive ? '#fff' : meta.color,
                      }}>
                        {meta.icon}
                      </div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontWeight: 700, fontSize: 13, color: isActive ? '#fff' : 'var(--color-text-primary)', lineHeight: 1.3, marginBottom: 3 }}>
                          {rt.label}
                        </div>
                        <div style={{ fontSize: 11, color: isActive ? 'rgba(255,255,255,0.8)' : 'var(--color-text-muted)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {rt.description}
                        </div>
                      </div>
                      {isActive && (
                        <RiCheckDoubleLine size={16} style={{ marginLeft: 'auto', flexShrink: 0, color: 'rgba(255,255,255,0.9)' }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Report Content Panel ──────────────────────────────────────── */}
      {loading ? (
        <div className="loading-center" style={{ minHeight: 240 }}><Spinner size="lg" /></div>
      ) : error ? (
        <ErrorState message={error} onRetry={fetchReport} />
      ) : !reportData ? (
        <div style={{ textAlign: 'center', padding: '48px 0', color: 'var(--color-text-muted)', fontSize: 14 }}>
          No data available for this report type.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>

          {/* ── Report Title Bar ───────────────────────────────────────── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '16px 20px',
            background: selectedMeta.bg,
            borderRadius: 'var(--radius-lg)',
            border: `1.5px solid ${selectedMeta.color}22`,
          }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: selectedMeta.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', flexShrink: 0 }}>
              {selectedMeta.icon}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 17, color: selectedMeta.color }}>{selectedType?.label} — Analytics Overview</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>{selectedType?.description} · Period: {fromDate} → {toDate}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexShrink: 0 }}>
              <Button variant="outline" size="sm" onClick={handleExportCSV}><RiDownloadLine size={14} /> CSV</Button>
              <Button variant="outline" size="sm" onClick={() => window.print()}><RiPrinterLine size={14} /> Print</Button>
            </div>
          </div>

          {/* ── KPI Summary Strip ──────────────────────────────────────── */}
          <div className="module-stats-strip">
            <div className="stat-pill-card">
              <div className="stat-pill-icon" style={{ background: selectedMeta.bg, color: selectedMeta.color }}>
                {selectedMeta.icon}
              </div>
              <div>
                <div className="stat-pill-label">Total Records</div>
                <div className="stat-pill-value">{reportData.total || reportData.data?.length || 0}</div>
              </div>
            </div>

            {reportData.totalRevenue !== undefined && (
              <div className="stat-pill-card">
                <div className="stat-pill-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
                  <RiMoneyDollarCircleLine size={20} />
                </div>
                <div>
                  <div className="stat-pill-label">Total Revenue</div>
                  <div className="stat-pill-value" style={{ color: '#16A34A', fontSize: '0.95rem' }}>
                    ₹{(reportData.totalRevenue || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {reportData.pendingAmount !== undefined && (
              <div className="stat-pill-card">
                <div className="stat-pill-icon" style={{ background: '#FEF9C3', color: '#F59E0B' }}>
                  <RiAlertLine size={20} />
                </div>
                <div>
                  <div className="stat-pill-label">Pending Balance</div>
                  <div className="stat-pill-value" style={{ color: '#F59E0B', fontSize: '0.95rem' }}>
                    ₹{(reportData.pendingAmount || 0).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
            )}

            {reportData.active !== undefined && (
              <div className="stat-pill-card">
                <div className="stat-pill-icon" style={{ background: '#DBEAFE', color: '#2563EB' }}>
                  <RiHotelBedLine size={20} />
                </div>
                <div>
                  <div className="stat-pill-label">Currently Active</div>
                  <div className="stat-pill-value" style={{ color: '#2563EB' }}>{reportData.active}</div>
                </div>
              </div>
            )}
          </div>

          {/* ── Charts Row ─────────────────────────────────────────────── */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>

            {/* Area Chart — Monthly Trend */}
            <div className="card" style={{ padding: '20px 20px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: 'var(--color-text-primary)' }}>
                📈 Monthly Volume Trend
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={MONTHLY_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={selectedMeta.color} stopOpacity={0.25} />
                      <stop offset="95%" stopColor={selectedMeta.color} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="patients" name="Patients" stroke={selectedMeta.color} strokeWidth={2.5} fill="url(#areaFill)" dot={{ r: 3, fill: selectedMeta.color }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Bar Chart — Department */}
            <div className="card" style={{ padding: '20px 20px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: 'var(--color-text-primary)' }}>
                🏥 Department-wise Volume
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={DEPT_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="vol" name="Volume" radius={[5, 5, 0, 0]}>
                    {DEPT_DATA.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Pie Chart — Demographic */}
            <div className="card" style={{ padding: '20px 20px 12px' }}>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 14, color: 'var(--color-text-primary)' }}>
                👥 Patient Demographics
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={GENDER_DATA} dataKey="value" nameKey="name" cx="50%" cy="45%" innerRadius={50} outerRadius={80} paddingAngle={4} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {GENDER_DATA.map((_, i) => (
                      <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend iconType="circle" iconSize={10} wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Data Table ──────────────────────────────────────────────── */}
          {reportData.data && reportData.data.length > 0 ? (
            <div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
                <RiArrowRightSLine style={{ color: selectedMeta.color }} />
                Detailed Records
                <span style={{ fontSize: 12, color: 'var(--color-text-muted)', fontWeight: 400 }}>
                  ({Math.min(20, reportData.data.length)} of {reportData.data.length} shown)
                </span>
              </div>
              <Table
                columns={dataColumns}
                rows={reportData.data.slice(0, 20)}
                loading={false}
                emptyTitle="No records"
              />
            </div>
          ) : (
            <div style={{
              textAlign: 'center', padding: '32px 0',
              background: 'var(--color-surface-alt)',
              borderRadius: 'var(--radius-lg)',
              border: '1.5px dashed var(--color-border)',
              color: 'var(--color-text-muted)', fontSize: 14,
            }}>
              {reportData.message || 'No detailed line records available. Connect to a live database to view records.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
