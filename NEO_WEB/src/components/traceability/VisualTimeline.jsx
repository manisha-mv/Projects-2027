// components/traceability/VisualTimeline.jsx
import React from 'react';
import {
  RiRouteLine,
  RiTimeLine,
  RiFlaskLine,
  RiScanLine,
  RiMedicineBottleLine,
  RiHotelBedLine,
  RiScissorsLine,
  RiMoneyDollarCircleLine,
  RiSendPlane2Line,
  RiPulseLine,
  RiUser3Line,
  RiBuildingLine,
} from 'react-icons/ri';
import Badge from '../ui/Badge';

const EVENT_ICONS = {
  'Registration': <RiRouteLine />,
  'Appointment': <RiTimeLine />,
  'Check-In': <RiTimeLine />,
  'Consultation': <RiRouteLine />,
  'Lab Order': <RiFlaskLine />,
  'Lab Result': <RiFlaskLine />,
  'Radiology Order': <RiScanLine />,
  'Radiology Report': <RiScanLine />,
  'Prescription': <RiMedicineBottleLine />,
  'Pharmacy Dispense': <RiMedicineBottleLine />,
  'Admission': <RiHotelBedLine />,
  'Nursing Care': <RiPulseLine />,
  'Vitals Recorded': <RiPulseLine />,
  'Procedure': <RiScissorsLine />,
  'Surgery': <RiScissorsLine />,
  'Billing': <RiMoneyDollarCircleLine />,
  'Discharge': <RiSendPlane2Line />,
  'Follow-Up': <RiPulseLine />,
};

export default function VisualTimeline({ events = [] }) {
  if (!events || events.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
        No treatment timeline events logged for this patient yet.
      </div>
    );
  }

  return (
    <div className="timeline-wrapper">
      {events.map((evt, idx) => {
        const evtTypeClass = evt.type ? `evt-${evt.type.replace(/\s+/g, '-')}` : 'evt-default';
        const icon = EVENT_ICONS[evt.eventType || evt.type] || <RiPulseLine />;

        return (
          <div key={evt.id || idx} className="timeline-item">
            <div className="timeline-left">
              <div className={`timeline-icon-ring ${evtTypeClass}`}>
                {icon}
              </div>
              <div className="timeline-connector" />
            </div>

            <div className="timeline-body">
              <div className="timeline-card">
                <div className="timeline-card-header">
                  <div>
                    <span className="timeline-event-name">{evt.eventName || evt.action || evt.type}</span>
                    <Badge variant="primary" style={{ marginLeft: '8px', fontSize: '11px' }}>
                      {evt.department || evt.module || 'Clinical'}
                    </Badge>
                  </div>
                  <span className="timeline-time">
                    {evt.timestamp ? new Date(evt.timestamp).toLocaleString() : evt.time || 'Today'}
                  </span>
                </div>

                <div className="timeline-event-desc">
                  {evt.description || evt.details || 'Event recorded in treatment lifecycle.'}
                </div>

                <div className="timeline-meta">
                  <div className="timeline-meta-item">
                    <RiUser3Line />
                    <span>{evt.performedBy || evt.user || 'Staff User'} ({evt.role || 'STAFF'})</span>
                  </div>
                  <div className="timeline-meta-item">
                    <RiBuildingLine />
                    <span>Department: {evt.department || 'General'}</span>
                  </div>
                  <div className="timeline-meta-item">
                    <Badge variant={evt.status === 'Completed' ? 'success' : 'info'}>
                      {evt.status || 'Completed'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
