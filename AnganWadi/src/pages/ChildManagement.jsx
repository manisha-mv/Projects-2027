import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useLang } from "../context/LanguageContext";
import StatusBadge from "../components/StatusBadge";

export default function ChildManagement() {
  const { childrenData, setSelectedChildId, setPage } = useApp();
  const { t, formatName } = useLang();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filtered = childrenData.filter((c) => {
    const searchStr = c.name + (c.nameTa || "");
    const matchSearch = searchStr.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "all" || c.status === filter;
    return matchSearch && matchFilter;
  });

  function openDetails(id) {
    setSelectedChildId(id);
    setPage("childDetails");
  }

  const filterLabels = {
    all: t.all,
    normal: t.normal,
    attention: t.needsAttention,
    underweight: t.underweight,
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <h2 className="page-title">{t.childManagementTitle}</h2>
        <p className="page-subtitle">{t.childManagementSubtitle}</p>
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="search-input"
          placeholder={t.searchByName}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="filter-chips">
          {["all", "normal", "attention", "underweight"].map((f) => (
            <button
              key={f}
              className={`filter-chip ${filter === f ? "filter-chip--active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {filterLabels[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Card Grid */}
      <div className="children-grid">
        {filtered.length === 0 && (
          <div className="empty-state">{t.noChildrenFound}</div>
        )}
        {filtered.map((child) => (
          <div key={child._id || child.id} className={`child-card child-card--${child.status}`} onClick={() => openDetails(child._id || child.id)}>
            <div className="child-card-header">
              <div className="child-avatar-initial">
                {child.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="child-card-name">{formatName(child.name, child.nameTa)}</div>
                <div className="child-card-age">{child.age} {t.yrs} · {child.gender}</div>
              </div>
            </div>
            <div className="child-card-body">
              <div className="child-stat">
                <span>{t.height}</span>
                <strong>{child.height} cm</strong>
              </div>
              <div className="child-stat">
                <span>{t.heightLabel || "Weight"}</span>
                <strong>{child.weight} kg</strong>
              </div>
            </div>
            <div className="child-card-footer">
              <StatusBadge status={child.status} />
              {child.alerts.length > 0 && (
                <span className="alert-dot">{child.alerts.length} {child.alerts.length > 1 ? t.alerts : t.alert}</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
