// pages/Laboratory/LabDashboard.jsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  RiFlaskLine, RiTestTubeLine, RiCheckDoubleLine, RiTimeLine,
  RiRefreshLine, RiSearchLine, RiDownloadLine,
  RiHeartPulseLine, RiLoader4Line, RiCheckboxCircleFill, RiCloseCircleLine
} from 'react-icons/ri';
import { useAuth } from '../../contexts/AuthContext';
import { laboratoryService, LAB_ORDER_STATUSES, URGENCY_TYPES } from '../../services/laboratoryService';
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

const STATUS_VARIANT = {
  'Pending':          'warning',
  'Sample Collected': 'info',
  'Processing':       'info',
  'Result Entered':   'secondary',
  'Verified':         'success',
  'Completed':        'success',
  'Cancelled':        'danger',
};

const URGENCY_VARIANT = {
  'Routine': 'secondary',
  'Urgent':  'warning',
  'STAT':    'danger',
};

// -- Helpers ------------------------------------------------------------------
function StatusIcon({ status }) {
  if (['Verified','Completed'].includes(status))
    return <RiCheckboxCircleFill size={22} style={{ color: '#16A34A' }} />;
  if (status === 'Cancelled')
    return <RiCloseCircleLine size={22} style={{ color: '#DC2626' }} />;
  if (['Processing','Sample Collected','Result Entered'].includes(status))
    return <RiLoader4Line size={22} style={{ color: '#2563EB' }} />;
  return <RiTimeLine size={22} style={{ color: '#F59E0B' }} />;
}

function ResultBadge({ value }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const ok  = v.includes('normal') || v.includes('healthy') || v.includes('clear') || v.includes('controlled');
  const bad = v.includes('high') || v.includes('elevated') || v.includes('abnormal') || v.includes('low');
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', gap:4,
      padding:'3px 10px', borderRadius:12, fontSize:12, fontWeight:700,
      background: ok ? '#DCFCE7' : bad ? '#FEF2F2' : '#FEF9C3',
      color:      ok ? '#166534' : bad ? '#DC2626' : '#854D0E',
    }}>
      {ok ? '🟢' : bad ? '🔴' : '🟡'} {value}
    </span>
  );
}

// -- Patient View -------------------------------------------------------------
function PatientLabView({ orders, loading, error, onRetry, patientName, patientId }) {
  if (loading) return (
    <div style={{ textAlign:'center', padding:'60px 0' }}>
      <Spinner size="lg" />
      <p style={{ marginTop:12, color:'#64748B', fontWeight:600 }}>Loading your diagnostic reports...</p>
    </div>
  );
  if (error) return <ErrorState message={error} onRetry={onRetry} />;

  const completed  = orders.filter(o => ['Verified','Completed'].includes(o.status));
  const inProgress = orders.filter(o => ['Pending','Sample Collected','Processing','Result Entered'].includes(o.status));

  return (
    <div>
      {/* Patient Identity Banner */}
      <div style={{
        background:'linear-gradient(135deg, #1E3A8A 0%, #1D4ED8 100%)',
        borderRadius:14, padding:'20px 24px', marginBottom:24,
        display:'flex', justifyContent:'space-between', alignItems:'center',
        flexWrap:'wrap', gap:12, color:'#FFF',
        boxShadow:'0 8px 20px rgba(30,58,138,0.25)'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{
            width:48, height:48, borderRadius:'50%', background:'#3B82F6',
            border:'2px solid #93C5FD', display:'flex', alignItems:'center',
            justifyContent:'center', fontWeight:800, fontSize:18
          }}>
            {patientName ? patientName.split(' ').map(n => n[0]).join('').slice(0,2) : 'PT'}
          </div>
          <div>
            <div style={{ fontSize:16, fontWeight:800 }}>{patientName || 'Patient'}</div>
            <div style={{ fontSize:12, color:'#93C5FD', marginTop:2 }}>
              Patient ID: <strong style={{ color:'#FFF' }}>{patientId}</strong>
              &nbsp;•&nbsp;Only your personal diagnostic records are shown here.
            </div>
          </div>
        </div>
        <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
          <span style={{ padding:'6px 14px', background:'rgba(255,255,255,0.12)', borderRadius:20, fontSize:12, fontWeight:700 }}>
            🧪 Total Tests: {orders.length}
          </span>
          {completed.length > 0 && (
            <span style={{ padding:'6px 14px', background:'#059669', borderRadius:20, fontSize:12, fontWeight:700 }}>
              ✅ Completed: {completed.length}
            </span>
          )}
          {inProgress.length > 0 && (
            <span style={{ padding:'6px 14px', background:'#D97706', borderRadius:20, fontSize:12, fontWeight:700 }}>
              ⏳ In Progress: {inProgress.length}
            </span>
          )}
        </div>
      </div>

      {/* Treatment Progress Timeline */}
      {orders.length > 0 && (
        <div style={{ background:'#FFF', borderRadius:14, border:'1px solid #E2E8F0', padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:16, fontWeight:800, color:'#0F172A', marginBottom:4, display:'flex', alignItems:'center', gap:8 }}>
            <RiHeartPulseLine style={{ color:'#2563EB' }} /> Treatment Progress — Your Diagnostic Journey
          </h3>
          <p style={{ fontSize:12, color:'#64748B', marginBottom:20 }}>
            Step-by-step progress of each diagnostic test ordered by your doctor.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
            {orders.map((order, idx) => {
              const steps = [
                { label:'Test Ordered',     done:!!order.orderedDate,         time: order.orderedDate },
                { label:'Sample Collected', done:!!order.sampleCollectedAt,   time: order.sampleCollectedAt?.split('T')[1]?.slice(0,5) },
                { label:'Lab Processing',   done:['Result Entered','Verified','Completed'].includes(order.status), time: null },
                { label:'Result Ready',     done:['Verified','Completed'].includes(order.status), time: order.verifiedAt?.split('T')[1]?.slice(0,5) },
              ];
              const pct = Math.round((steps.filter(s => s.done).length / 4) * 100);

              return (
                <div key={`${order.id || order.orderId}-${idx}`} style={{ border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', background:'#FAFAFA' }}>
                  {/* Header */}
                  <div style={{
                    padding:'14px 20px', background:'#F1F5F9', borderBottom:'1px solid #E2E8F0',
                    display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10
                  }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                      <StatusIcon status={order.status} />
                      <div>
                        <div style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>🧪 {order.testName}</div>
                        <div style={{ fontSize:12, color:'#64748B' }}>
                          {order.orderId} &nbsp;•&nbsp; Sample: {order.sampleType || 'Blood'} &nbsp;•&nbsp; Ordered by: {order.doctorName}
                        </div>
                      </div>
                    </div>
                    <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
                      <Badge variant={URGENCY_VARIANT[order.urgency] || 'secondary'}>{order.urgency}</Badge>
                      <Badge variant={STATUS_VARIANT[order.status]  || 'secondary'}>{order.status}</Badge>
                      {order.result && <ResultBadge value={order.result.value} />}
                    </div>
                  </div>

                  {/* Progress bar + steps */}
                  <div style={{ padding:'14px 20px 10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                      <span style={{ fontSize:11, fontWeight:700, color:'#64748B' }}>Progress</span>
                      <span style={{ fontSize:11, fontWeight:700, color: pct === 100 ? '#16A34A' : '#2563EB' }}>{pct}%</span>
                    </div>
                    <div style={{ background:'#E2E8F0', borderRadius:8, height:7, overflow:'hidden' }}>
                      <div style={{
                        width:`${pct}%`, height:'100%', borderRadius:8, transition:'width 0.6s ease',
                        background: pct === 100 ? 'linear-gradient(90deg,#16A34A,#4ADE80)' : 'linear-gradient(90deg,#2563EB,#60A5FA)',
                      }} />
                    </div>
                    <div style={{ display:'flex', justifyContent:'space-between', marginTop:10, gap:4 }}>
                      {steps.map((step, si) => (
                        <div key={si} style={{ textAlign:'center', flex:1 }}>
                          <div style={{
                            width:24, height:24, borderRadius:'50%', margin:'0 auto 4px',
                            background: step.done ? '#16A34A' : '#E2E8F0',
                            border:`2px solid ${step.done ? '#16A34A' : '#CBD5E1'}`,
                            display:'flex', alignItems:'center', justifyContent:'center',
                            fontSize:10, color: step.done ? '#FFF' : '#94A3B8', fontWeight:800
                          }}>
                            {step.done ? '✓' : si + 1}
                          </div>
                          <div style={{ fontSize:10, color: step.done ? '#166534' : '#94A3B8', fontWeight:600, lineHeight:1.3 }}>
                            {step.label}
                          </div>
                          {step.time && <div style={{ fontSize:9, color:'#94A3B8', marginTop:1 }}>{step.time}</div>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Result or pending notice */}
                  {order.result ? (
                    <div style={{
                      margin:'0 16px 14px', padding:'12px 16px',
                      background:'#F0FDF4', border:'1px solid #A7F3D0', borderRadius:10, borderLeft:'4px solid #16A34A'
                    }}>
                      <div style={{ fontSize:12, fontWeight:700, color:'#065F46', marginBottom:6 }}>
                        📋 Your Result: &nbsp;<ResultBadge value={order.result.value} />
                      </div>
                      <p style={{ fontSize:12, color:'#065F46', margin:0, lineHeight:1.6 }}>{order.result.report}</p>
                    </div>
                  ) : !['Cancelled'].includes(order.status) && (
                    <div style={{
                      margin:'0 16px 14px', padding:'10px 16px',
                      background:'#FFFBEB', border:'1px solid #FDE68A', borderRadius:10
                    }}>
                      <div style={{ fontSize:12, color:'#92400E', fontWeight:600 }}>
                        ⏳ Your result is being prepared. It will appear here once verified by the lab.
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Completed Summary Cards */}
      {completed.length > 0 && (
        <div style={{ background:'#FFF', borderRadius:14, border:'1px solid #E2E8F0', padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#065F46', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <RiCheckDoubleLine style={{ color:'#16A34A' }} /> ✅ Completed Reports ({completed.length})
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
            {completed.map((order, idx) => (
              <div key={`${order.id || order.orderId}-${idx}`} style={{
                padding:'16px 18px', border:'1px solid #A7F3D0', borderRadius:12,
                background:'#F0FDF4', display:'flex', justifyContent:'space-between',
                alignItems:'flex-start', gap:16, flexWrap:'wrap'
              }}>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:14, fontWeight:700, color:'#065F46' }}>🧪 {order.testName}</div>
                  <div style={{ fontSize:12, color:'#059669', marginTop:2 }}>
                    {order.department} &nbsp;•&nbsp; Date: {order.orderedDate} &nbsp;•&nbsp; Doctor: {order.doctorName}
                  </div>
                  {order.result && (
                    <div style={{ marginTop:8, padding:'8px 12px', background:'#ECFDF5', borderRadius:8, borderLeft:'3px solid #16A34A' }}>
                      <span style={{ fontSize:12, color:'#065F46', fontWeight:600 }}>💡 Result: &nbsp;</span>
                      <ResultBadge value={order.result.value} />
                      <p style={{ fontSize:12, color:'#047857', margin:'4px 0 0 0', lineHeight:1.5 }}>{order.result.report}</p>
                    </div>
                  )}
                </div>
                <Button variant="outline" size="sm" icon={<RiDownloadLine />}>Download PDF</Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* In-Progress */}
      {inProgress.length > 0 && (
        <div style={{ background:'#FFF', borderRadius:14, border:'1px solid #E2E8F0', padding:24, marginBottom:24 }}>
          <h3 style={{ fontSize:15, fontWeight:800, color:'#92400E', marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
            <RiLoader4Line style={{ color:'#F59E0B' }} /> ⏳ Tests In Progress ({inProgress.length})
          </h3>
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {inProgress.map((order, idx) => (
              <div key={`${order.id || order.orderId}-${idx}`} style={{
                padding:'14px 18px', border:'1px solid #FDE68A', borderRadius:12,
                background:'#FFFBEB', display:'flex', justifyContent:'space-between',
                alignItems:'center', gap:12, flexWrap:'wrap'
              }}>
                <div>
                  <div style={{ fontSize:14, fontWeight:700, color:'#92400E' }}>🔬 {order.testName}</div>
                  <div style={{ fontSize:12, color:'#B45309', marginTop:2 }}>
                    {order.orderId} &nbsp;•&nbsp; {order.sampleType} &nbsp;•&nbsp; Priority: {order.urgency}
                  </div>
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <Badge variant={STATUS_VARIANT[order.status] || 'secondary'}>{order.status}</Badge>
                  <Badge variant={URGENCY_VARIANT[order.urgency] || 'secondary'}>{order.urgency}</Badge>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {orders.length === 0 && !loading && (
        <EmptyState title="No diagnostic tests found"
          description="No lab orders have been made for your account yet." />
      )}
    </div>
  );
}

// -- Staff Worklist View ------------------------------------------------------
function StaffLabView({ orders, loading, error, onRetry, onCollect, onVerify, onEnterResult, actionLoading }) {
  const [activeTab,     setActiveTab]     = useState('all');
  const [selectedOrder, setSelected]      = useState(null);
  const [resultModal,   setResultModal]   = useState(false);
  const [resultText,    setResultText]    = useState('');
  const [resultValue,   setResultValue]   = useState('');

  const tabCounts = {
    all:        orders.length,
    pending:    orders.filter(o => o.status === 'Pending').length,
    collection: orders.filter(o => o.status === 'Sample Collected').length,
    processing: orders.filter(o => o.status === 'Processing').length,
    entry:      orders.filter(o => o.status === 'Result Entered').length,
    completed:  orders.filter(o => ['Verified','Completed'].includes(o.status)).length,
  };

  const tabFiltered =
    activeTab === 'all'        ? orders :
    activeTab === 'pending'    ? orders.filter(o => o.status === 'Pending') :
    activeTab === 'collection' ? orders.filter(o => o.status === 'Sample Collected') :
    activeTab === 'processing' ? orders.filter(o => o.status === 'Processing') :
    activeTab === 'entry'      ? orders.filter(o => o.status === 'Result Entered') :
    orders.filter(o => ['Verified','Completed'].includes(o.status));

  const tableColumns = [
    { key:'orderId',     label:'Order ID',  width:'120px', render:(v) => <span className="patient-id-badge">{v}</span> },
    { key:'patientName', label:'Patient',   width:'200px', render:(v, row) => (
        <div className="table-patient-cell">
          <Avatar name={v} size="sm" />
          <div>
            <div className="table-patient-name">{v}</div>
            <div className="table-patient-sub">ID: {row.patientId}</div>
          </div>
        </div>
      )
    },
    { key:'testName',  label:'Test & Specimen', width:'220px', render:(v, row) => (
        <div>
          <div style={{ fontWeight:600, fontSize:'13px', color:'var(--color-primary-dark)' }}>🧪 {v}</div>
          <div style={{ fontSize:'12px', color:'var(--color-text-secondary)' }}>Sample: {row.sampleType || 'Blood'}</div>
        </div>
      )
    },
    { key:'doctorName', label:'Doctor',   width:'160px', render:(v) => <span style={{ fontSize:'13px', fontWeight:500 }}>{v}</span> },
    { key:'urgency',    label:'Priority', width:'100px', render:(v) => <Badge variant={URGENCY_VARIANT[v] || 'secondary'}>{v}</Badge> },
    { key:'status',     label:'Status',   width:'130px', render:(v) => <Badge variant={STATUS_VARIANT[v]  || 'secondary'}>{v}</Badge> },
    { key:'orderedDate',label:'Ordered',  width:'110px', render:(v) => <span style={{ fontSize:'12px', color:'var(--color-text-muted)' }}>{v}</span> },
    { key:'actions',    label:'Actions',  width:'150px', align:'right', render:(_, row) => (
        <div style={{ display:'flex', gap:6, justifyContent:'flex-end' }}>
          {row.status === 'Pending' && (
            <Button variant="outline" size="sm" onClick={() => onCollect(row)} disabled={actionLoading}>Collect Sample</Button>
          )}
          {['Sample Collected','Processing'].includes(row.status) && (
            <Button variant="primary" size="sm" disabled={actionLoading}
              onClick={() => { setSelected(row); setResultModal(true); }}>
              Enter Result
            </Button>
          )}
          {row.status === 'Result Entered' && (
            <Button variant="secondary" size="sm" onClick={() => onVerify(row)} disabled={actionLoading}>Verify</Button>
          )}
          {(row.status === 'Verified' || row.status === 'Completed') && (
            <Button variant="ghost" size="sm" onClick={() => setSelected(row)}>View Result</Button>
          )}
        </div>
      )
    },
  ];

  return (
    <>
      <div className="module-stats-strip">
        {[
          { icon:<RiTimeLine size={20}/>,        bg:'#FEF9C3', color:'#F59E0B', label:'Pending',          val: tabCounts.pending },
          { icon:<RiTestTubeLine size={20}/>,    bg:'#DBEAFE', color:'#2563EB', label:'In Progress',      val: tabCounts.collection + tabCounts.processing },
          { icon:<RiFlaskLine size={20}/>,       bg:'#E0F2FE', color:'#0284C7', label:'Awaiting Verify',  val: tabCounts.entry },
          { icon:<RiCheckDoubleLine size={20}/>, bg:'#DCFCE7', color:'#16A34A', label:'Completed',        val: tabCounts.completed },
        ].map((s, i) => (
          <div className="stat-pill-card" key={i}>
            <div className="stat-pill-icon" style={{ background:s.bg, color:s.color }}>{s.icon}</div>
            <div>
              <div className="stat-pill-label">{s.label}</div>
              <div className="stat-pill-value">{s.val}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="tabs" style={{ marginBottom:'var(--space-4)' }}>
        {[['all','All'],['pending','Pending'],['collection','Sample Collection'],
          ['processing','Processing'],['entry','Result Entry'],['completed','Completed']
        ].map(([key, label]) => (
          <button key={key} className={`tab-item ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}>
            {label} ({tabCounts[key]})
          </button>
        ))}
      </div>

      {error ? <ErrorState message={error} onRetry={onRetry} /> : (
        <Table columns={tableColumns} rows={tabFiltered} loading={loading}
          emptyTitle="No lab orders found"
          emptyDescription="No lab orders match the current filter selection." />
      )}

      <Modal isOpen={resultModal}
        onClose={() => { setResultModal(false); setSelected(null); setResultText(''); setResultValue(''); }}
        title={`Enter Result — ${selectedOrder?.testName || ''}`}>
        <div className="form-grid">
          <div className="form-group">
            <label className="form-label">Result Value *</label>
            <input className="form-input" placeholder="e.g. Normal, High, 182 mg/dL"
              value={resultValue} onChange={e => setResultValue(e.target.value)} />
          </div>
          <div className="form-group form-group-full">
            <label className="form-label">Report / Findings *</label>
            <textarea className="form-textarea" rows={4} placeholder="Enter detailed findings..."
              value={resultText} onChange={e => setResultText(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost" onClick={() => setResultModal(false)}>Cancel</button>
          <button className="btn btn-primary" disabled={actionLoading}
            onClick={() => onEnterResult(selectedOrder, resultValue, resultText, () => {
              setResultModal(false); setResultText(''); setResultValue('');
            })}>
            {actionLoading ? <Spinner size="sm" /> : 'Submit Result'}
          </button>
        </div>
      </Modal>

      {selectedOrder?.result && !resultModal && (
        <Modal isOpen={!!selectedOrder} onClose={() => setSelected(null)}
          title={`Result — ${selectedOrder.testName}`}>
          <div className="result-view">
            <div className="result-meta">
              <span><strong>Patient:</strong> {selectedOrder.patientName}</span>
              <span><strong>Doctor:</strong>  {selectedOrder.doctorName}</span>
              <span><strong>Status:</strong>  <Badge variant={STATUS_VARIANT[selectedOrder.status]}>{selectedOrder.status}</Badge></span>
            </div>
            <div className="result-value-badge">Result: <strong>{selectedOrder.result?.value}</strong></div>
            <div className="result-report"><h4>Findings</h4><p>{selectedOrder.result?.report}</p></div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-primary" onClick={() => setSelected(null)}>Close</button>
          </div>
        </Modal>
      )}
    </>
  );
}

// -- Main Export --------------------------------------------------------------
export default function LabDashboard() {
  const { user, role } = useAuth();
  const { addToast }   = useToast();
  const isPatient      = role === 'PATIENT' || !!user?.patientId;
  const loggedInPatientId = user?.patientId || user?.id || 'P10025';

  const [orders,        setOrders]       = useState([]);
  const [loading,       setLoading]      = useState(true);
  const [error,         setError]        = useState(null);
  const [search,        setSearch]       = useState('');
  const [statusFilter,  setStatusFilter] = useState('');
  const [urgencyFilter, setUrgency]      = useState('');
  const [actionLoading, setActionLoading]= useState(false);

  const fetchOrders = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { search, status: statusFilter, urgency: urgencyFilter };
      if (isPatient) { params.patientId = loggedInPatientId; params.patientName = user?.name || ''; }
      const res = await laboratoryService.getLabOrders(params);
      setOrders(res.orders || []);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  }, [search, statusFilter, urgencyFilter, isPatient, loggedInPatientId, user?.name]);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const handleCollect = async (order) => {
    setActionLoading(true);
    try {
      await laboratoryService.collectSample(order.id || order.orderId);
      addToast({ type:'success', title:'Sample Collected', message:`Sample collected for ${order.testName}` });
      fetchOrders();
    } catch (e) { addToast({ type:'error', title:'Error', message:e.message }); }
    finally { setActionLoading(false); }
  };

  const handleVerify = async (order) => {
    setActionLoading(true);
    try {
      await laboratoryService.verifyResult(order.id || order.orderId);
      addToast({ type:'success', title:'Verified', message:`${order.testName} result verified` });
      fetchOrders();
    } catch (e) { addToast({ type:'error', title:'Error', message:e.message }); }
    finally { setActionLoading(false); }
  };

  const handleEnterResult = async (order, value, report, onDone) => {
    if (!value?.trim() || !report?.trim()) {
      addToast({ type:'warning', title:'Required', message:'Please enter result value and report.' });
      return;
    }
    setActionLoading(true);
    try {
      await laboratoryService.enterResult(order.id || order.orderId, { value, report });
      addToast({ type:'success', title:'Result Entered', message:`Result entered for ${order.testName}` });
      onDone?.(); fetchOrders();
    } catch (e) { addToast({ type:'error', title:'Error', message:e.message }); }
    finally { setActionLoading(false); }
  };

  return (
    <div className="module-page">
      <PageHeader
        title={isPatient ? 'My Lab & Diagnostic Reports' : 'Laboratory & Diagnostics'}
        description={
          isPatient
            ? `Personal pathology tests, scan reports & diagnostic results for ${user?.name || 'you'}.`
            : 'Manage test orders, sample collection, and result entry.'
        }
        primaryAction={
          <Button variant="outline" onClick={fetchOrders} disabled={loading}>
            <RiRefreshLine className={loading ? 'spin' : ''} /> Refresh
          </Button>
        }
      />

      {!isPatient && (
        <div className="module-filter-bar">
          <div className="module-search-box">
            <RiSearchLine className="search-icon" size={18} />
            <input className="search-input" placeholder="Search patient, test name, or order ID..."
              value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="module-filters-group">
            <select className="form-select" style={{ width:160, height:38 }}
              value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">All Statuses</option>
              {LAB_ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select className="form-select" style={{ width:140, height:38 }}
              value={urgencyFilter} onChange={e => setUrgency(e.target.value)}>
              <option value="">All Priorities</option>
              {URGENCY_TYPES.map(u => <option key={u} value={u}>{u}</option>)}
            </select>
          </div>
        </div>
      )}

      {isPatient ? (
        <PatientLabView
          orders={orders} loading={loading} error={error} onRetry={fetchOrders}
          patientName={user?.name} patientId={loggedInPatientId}
        />
      ) : (
        <StaffLabView
          orders={orders} loading={loading} error={error} onRetry={fetchOrders}
          onCollect={handleCollect} onVerify={handleVerify}
          onEnterResult={handleEnterResult} actionLoading={actionLoading}
        />
      )}
    </div>
  );
}
