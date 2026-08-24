// NEO-HMS Utility Helpers

/**
 * Format a date as "DD MMM YYYY" e.g. "13 Aug 2026"
 */
export function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Get initials from a name string
 */
export function getInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(n => n[0].toUpperCase())
    .join('');
}

/**
 * Clamp a number between min and max
 */
export function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/**
 * Returns status badge class name for appointment/task status
 */
export function getStatusBadgeClass(status) {
  switch (status?.toLowerCase()) {
    case 'completed':    return 'badge-success';
    case 'confirmed':    return 'badge-primary';
    case 'in progress':  return 'badge-info';
    case 'pending':      return 'badge-warning';
    case 'cancelled':    return 'badge-error';
    case 'ready':        return 'badge-success';
    default:             return 'badge-neutral';
  }
}

/**
 * Pluralize a word
 */
export function pluralize(count, word) {
  return count === 1 ? `${count} ${word}` : `${count} ${word}s`;
}

/**
 * Debounce function
 */
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}
