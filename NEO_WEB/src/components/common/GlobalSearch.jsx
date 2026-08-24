// components/common/GlobalSearch.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  RiSearchLine,
  RiUserLine,
  RiCalendarLine,
  RiStethoscopeLine,
  RiFlaskLine,
  RiMedicineBottleLine,
  RiScanLine,
  RiArrowRightLine,
} from 'react-icons/ri';
import { mockSearchResults } from '../../data/mockData';
import { debounce } from '../../utils/helpers';

const CATEGORY_CONFIG = {
  patients:     { label: 'Patients',      icon: <RiUserLine />,            color: 'var(--color-primary)' },
  appointments: { label: 'Appointments',  icon: <RiCalendarLine />,        color: 'var(--color-secondary)' },
  doctors:      { label: 'Doctors',       icon: <RiStethoscopeLine />,     color: 'var(--color-info)' },
  labOrders:    { label: 'Lab Orders',    icon: <RiFlaskLine />,           color: 'var(--color-warning)' },
};

const GlobalSearch = () => {
  const [query, setQuery]     = useState('');
  const [open, setOpen]       = useState(false);
  const [results, setResults] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const doSearch = debounce((q) => {
    if (!q.trim()) {
      setResults(null);
      return;
    }
    const lower = q.toLowerCase();
    const filtered = {
      patients: mockSearchResults.patients.filter(
        p => p.name.toLowerCase().includes(lower) || p.id.toLowerCase().includes(lower)
      ),
      appointments: mockSearchResults.appointments.filter(
        a => a.id.toLowerCase().includes(lower) || a.patient.toLowerCase().includes(lower)
      ),
      doctors: mockSearchResults.doctors.filter(
        d => d.name.toLowerCase().includes(lower) || d.dept.toLowerCase().includes(lower)
      ),
      labOrders: mockSearchResults.labOrders.filter(
        l => l.id.toLowerCase().includes(lower) || l.patient.toLowerCase().includes(lower)
      ),
    };
    setResults(filtered);
  }, 200);

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setOpen(true);
    doSearch(val);
  };

  const totalResults = results
    ? Object.values(results).reduce((acc, arr) => acc + arr.length, 0)
    : 0;

  const hasResults = results && totalResults > 0;
  const isSearching = query.trim().length > 0;

  return (
    <div className="global-search" ref={wrapRef}>
      <div className="search-input-wrap">
        <RiSearchLine className="search-icon" />
        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          className="form-input global-search-input"
          placeholder="Search patient, appointment, doctor, prescription..."
          value={query}
          onChange={handleChange}
          onFocus={() => { if (query) setOpen(true); }}
          autoComplete="off"
          aria-label="Global search"
          aria-expanded={open}
          aria-haspopup="listbox"
        />
        {query && (
          <button
            className="search-clear-btn"
            onClick={() => { setQuery(''); setResults(null); setOpen(false); inputRef.current?.focus(); }}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {open && isSearching && (
        <div className="search-dropdown" role="listbox" aria-label="Search results">
          {!hasResults ? (
            <div className="search-empty">
              <RiSearchLine size={20} />
              <span>No results for "<strong>{query}</strong>"</span>
            </div>
          ) : (
            <>
              {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
                const items = results[key] || [];
                if (items.length === 0) return null;
                return (
                  <div key={key} className="search-group">
                    <div className="search-group-label">
                      <span style={{ color: config.color }}>{config.icon}</span>
                      {config.label}
                    </div>
                    {items.map((item, i) => (
                      <SearchResultItem key={i} category={key} item={item} config={config} onSelect={() => setOpen(false)} />
                    ))}
                  </div>
                );
              })}
              <div className="search-footer">
                <span>Press Enter to see all {totalResults} result{totalResults !== 1 ? 's' : ''}</span>
                <RiArrowRightLine size={14} />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const SearchResultItem = ({ category, item, config, onSelect }) => {
  const navigate = useNavigate();
  let primary = '';
  let secondary = '';
  let route = '/dashboard';

  switch (category) {
    case 'patients':
      primary   = `${item.id} – ${item.name}`;
      secondary = `Age ${item.age} · ${item.ward}`;
      route     = `/patients/${item.id}`;
      break;
    case 'appointments':
      primary   = `${item.id} · ${item.time}`;
      secondary = `${item.patient} → ${item.doctor}`;
      route     = '/appointments';
      break;
    case 'doctors':
      primary   = item.name;
      secondary = item.dept;
      route     = '/doctors';
      break;
    case 'labOrders':
      primary   = `${item.id} – ${item.test}`;
      secondary = item.patient;
      route     = '/laboratory';
      break;
    default:
      primary = item.id;
  }

  const handleClick = () => {
    if (onSelect) onSelect();
    navigate(route);
  };

  return (
    <button className="search-result-item" role="option" onClick={handleClick}>
      <span className="search-result-icon" style={{ color: config.color }}>
        {config.icon}
      </span>
      <span className="search-result-content">
        <span className="search-result-primary">{primary}</span>
        <span className="search-result-secondary">{secondary}</span>
      </span>
    </button>
  );
};

export default GlobalSearch;
