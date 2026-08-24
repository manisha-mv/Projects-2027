// components/ipd/BedMap.jsx
import React from 'react';
import { RiHotelBedLine, RiUser3Line } from 'react-icons/ri';
import Badge from '../ui/Badge';

export default function BedMap({ beds = [], onSelectBed }) {
  if (!beds || beds.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '32px', color: 'var(--color-text-secondary)' }}>
        No ward bed data available.
      </div>
    );
  }

  // Group beds by Ward
  const wardMap = beds.reduce((acc, bed) => {
    const wardName = bed.ward || 'General Ward';
    if (!acc[wardName]) acc[wardName] = [];
    acc[wardName].push(bed);
    return acc;
  }, {});

  const statusVariant = {
    'Available': 'success',
    'Occupied': 'danger',
    'Reserved': 'warning',
    'Maintenance': 'secondary',
  };

  return (
    <div className="bed-map-wrapper">
      {/* Legend Bar */}
      <div className="bed-map-legend">
        <div className="bed-legend-item">
          <div className="bed-legend-dot" style={{ background: '#86EFAC' }} />
          <span>Available</span>
        </div>
        <div className="bed-legend-item">
          <div className="bed-legend-dot" style={{ background: '#FCA5A5' }} />
          <span>Occupied</span>
        </div>
        <div className="bed-legend-item">
          <div className="bed-legend-dot" style={{ background: '#FCD34D' }} />
          <span>Reserved</span>
        </div>
        <div className="bed-legend-item">
          <div className="bed-legend-dot" style={{ background: '#D1D5DB' }} />
          <span>Maintenance</span>
        </div>
      </div>

      {/* Ward Sections */}
      {Object.keys(wardMap).map((wardName) => {
        const wardBeds = wardMap[wardName];
        const availableCount = wardBeds.filter(b => b.status === 'Available').length;
        const occupiedCount = wardBeds.filter(b => b.status === 'Occupied').length;

        return (
          <div key={wardName} className="bed-map-section">
            <div className="bed-map-section-title">
              <RiHotelBedLine /> {wardName} ({availableCount} available / {occupiedCount} occupied)
            </div>

            <div className="bed-map-grid">
              {wardBeds.map((bed) => {
                const status = bed.status || 'Available';
                return (
                  <div
                    key={bed.id || bed.bedId}
                    className={`bed-card ${status}`}
                    onClick={() => onSelectBed && onSelectBed(bed)}
                    title={status === 'Occupied' ? `Occupied by ${bed.patientName || 'Patient'}` : `Bed ${bed.bedId} - ${status}`}
                  >
                    <div className="bed-icon"><RiHotelBedLine /></div>
                    <div className="bed-card-id">{bed.bedId || bed.id}</div>
                    <div className="bed-card-type">{bed.type || 'Standard'}</div>
                    <div className="bed-card-patient">
                      {status === 'Occupied' ? (bed.patientName || 'Occupied') : status}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
