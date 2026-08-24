// components/dashboard/KpiTile.jsx
import React from 'react';
import { RiArrowUpLine, RiArrowDownLine } from 'react-icons/ri';

/**
 * Compact enterprise KPI tile.
 * Props: label, value, sub, trend ('up'|'down'|null), trendPct, icon, iconBg, iconColor, accent
 */
const KpiTile = ({ label, value, sub, trend, trendPct, icon, iconBg, iconColor, accent }) => (
  <div className="kpi-tile">
    <div className="kpi-tile-accent" style={{ background: accent }} />
    <div className="kpi-tile-header">
      <div className="kpi-tile-icon" style={{ background: iconBg, color: iconColor }}>
        {icon}
      </div>
      {trend && trendPct && (
        <div className={`kpi-tile-trend ${trend === 'up' ? 'kpi-trend-up' : 'kpi-trend-down'}`}>
          {trend === 'up' ? <RiArrowUpLine size={11} /> : <RiArrowDownLine size={11} />}
          <span>{trendPct}</span>
        </div>
      )}
    </div>
    <div className="kpi-tile-value">{value}</div>
    <div className="kpi-tile-label">{label}</div>
    {sub && <div className="kpi-tile-sub">{sub}</div>}
  </div>
);

export default KpiTile;
