import { formatShortDate } from '../utils/dates.js';

function formatValue(value) {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${value}`;
}

function formatDelta(current, previous) {
  if (current === null || current === undefined) {
    return null;
  }
  if (previous === null || previous === undefined) {
    return null;
  }
  const delta = Math.round((current - previous) * 10) / 10;
  if (delta === 0) {
    return { text: '±0', className: 'delta-flat' };
  }
  if (delta < 0) {
    return { text: `${delta}`, className: 'delta-down' };
  }
  return { text: `+${delta}`, className: 'delta-up' };
}

function MeasurementLog({ logs }) {
  const sorted = [...logs.measurements].sort((a, b) => (a.date < b.date ? -1 : 1));

  const rows = sorted.map((entry, index) => {
    const previous = index > 0 ? sorted[index - 1] : null;
    const waistDelta = formatDelta(entry.waist_cm, previous ? previous.waist_cm : null);

    let waistDeltaBlock = null;
    if (waistDelta) {
      waistDeltaBlock = <span className={`delta ${waistDelta.className}`}>{waistDelta.text}</span>;
    }

    return (
      <li key={entry.date} className="measurement-row">
        <div className="measurement-row-date">{formatShortDate(entry.date)}</div>
        <div className="measurement-row-waist">
          <span className="stat-value">{formatValue(entry.waist_cm)}</span>
          <span className="stat-label">waist cm</span>
          {waistDeltaBlock}
        </div>
        <div className="measurement-row-thighs">
          <span className="thigh-value">L {formatValue(entry.left_thigh_cm)}</span>
          <span className="thigh-value">R {formatValue(entry.right_thigh_cm)}</span>
        </div>
      </li>
    );
  });

  return (
    <div className="view">
      <section className="card">
        <h3 className="card-title">Measurements</h3>
        <ul className="measurement-list">{rows}</ul>
      </section>
    </div>
  );
}

export default MeasurementLog;
