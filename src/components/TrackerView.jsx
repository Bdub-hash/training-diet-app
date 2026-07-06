import { useState } from 'react';
import { summarizeRecentWeeks } from '../utils/weekly.js';
import { formatShortDate } from '../utils/dates.js';
import AnimatedNumber from './AnimatedNumber.jsx';

function TrackerView({ config, data }) {
  const [copyStatus, setCopyStatus] = useState('');
  const weeks = summarizeRecentWeeks(data.sessions, data.meals, 6);
  const currentWeek = weeks[0];

  const dayBars = currentWeek.days.map((day) => {
    const ratio = config.nutrition.calories > 0 ? day.calories / config.nutrition.calories : 0;
    const widthPercent = Math.min(ratio * 100, 100);
    let barClass = 'day-bar-fill';
    if (ratio > 1.1) {
      barClass = 'day-bar-fill day-bar-over';
    }

    let statusMark = null;
    if (day.completed) {
      statusMark = <span className="day-bar-check">✓</span>;
    } else if (day.skipped) {
      statusMark = <span className="day-bar-skip">–</span>;
    }

    let valueDisplay = '—';
    if (day.calories > 0) {
      valueDisplay = <AnimatedNumber value={day.calories} />;
    }

    return (
      <div className="day-bar-row" key={day.date}>
        <span className="day-bar-label">{formatShortDate(day.date)}</span>
        <div className="day-bar-track">
          <div className={barClass} style={{ width: `${widthPercent}%` }} />
        </div>
        <span className="day-bar-value">{valueDisplay}</span>
        {statusMark}
      </div>
    );
  });

  const historyRows = weeks.map((week) => (
    <li className="history-row" key={week.weekStart}>
      <span>{formatShortDate(week.weekStart)}</span>
      <span>{week.avgCalories || '—'} kcal avg</span>
      <span>
        {week.sessionsCompleted}/7 done · {week.sessionsSkipped} skipped
      </span>
    </li>
  ));

  function handleExport() {
    const json = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(json).then(
      () => setCopyStatus('Copied — paste this to Claude Code to update logs.json'),
      () => setCopyStatus('Copy failed — select the text manually below.')
    );
  }

  let copyStatusBlock = null;
  if (copyStatus) {
    copyStatusBlock = <p className="modal-status">{copyStatus}</p>;
  }

  return (
    <div className="view">
      <section className="card">
        <h3 className="card-title">This Week</h3>
        <div className="day-bar-list">{dayBars}</div>
        <p className="nutrition-notes">
          {currentWeek.sessionsCompleted} of 7 sessions completed · {currentWeek.sessionsSkipped} skipped
        </p>
      </section>

      <section className="card">
        <h3 className="card-title">Recent Weeks</h3>
        <ul className="history-list">{historyRows}</ul>
      </section>

      <section className="card">
        <h3 className="card-title">Export</h3>
        <p className="nutrition-notes">
          Copy the current log data to hand to Claude Code so it gets committed to logs.json.
        </p>
        <button type="button" className="btn btn-primary" onClick={handleExport}>
          Copy Data as JSON
        </button>
        {copyStatusBlock}
        <textarea className="export-textarea" readOnly value={JSON.stringify(data, null, 2)} />
      </section>
    </div>
  );
}

export default TrackerView;
