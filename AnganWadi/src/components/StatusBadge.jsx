import { useLang } from "../context/LanguageContext";

export default function StatusBadge({ status }) {
  const { t } = useLang();
  const map = {
    normal:      { label: t.statusNormal,      cls: "badge-normal"      },
    attention:   { label: t.statusAttention,   cls: "badge-attention"   },
    underweight: { label: t.statusUnderweight, cls: "badge-underweight" },
  };
  const { label, cls } = map[status] || map.normal;
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
