import BlockProgress from './BlockProgress.jsx';
import SessionTypeBadge from './SessionTypeBadge.jsx';
import { toISODate, getDayAbbr } from '../utils/dates.js';

function TodayView({ config, logs }) {
  const today = new Date();
  const todayISO = toISODate(today);
  const todayAbbr = getDayAbbr(today);
  const schedule = config.week.find((entry) => entry.day === todayAbbr);
  const sessionLog = logs.sessions.find((entry) => entry.date === todayISO);

  let measurementReminder = null;
  if (schedule.measurement_day) {
    measurementReminder = (
      <section className="card reminder-card">
        <p className="reminder-text">Measurement day — log waist and thigh measurements.</p>
      </section>
    );
  }

  let completedStatus = <span className="status-pill status-pending">Not logged</span>;
  if (sessionLog && sessionLog.completed) {
    completedStatus = <span className="status-pill status-done">Completed</span>;
  }

  let notesBlock = null;
  if (sessionLog && sessionLog.notes) {
    notesBlock = <p className="session-notes">{sessionLog.notes}</p>;
  }

  return (
    <div className="view">
      <BlockProgress block={config.block} />

      <section className="card session-card">
        <div className="session-card-header">
          <span className="session-day">{schedule.day}</span>
          <SessionTypeBadge type={schedule.type} />
        </div>
        <h2 className="session-name">{schedule.session}</h2>
        {completedStatus}
        {notesBlock}
      </section>

      <section className="card nutrition-card">
        <h3 className="card-title">Today's Targets</h3>
        <div className="nutrition-grid">
          <div className="nutrition-stat">
            <span className="stat-value">{config.nutrition.calories}</span>
            <span className="stat-label">Calories</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">
              {config.nutrition.protein_g_min}–{config.nutrition.protein_g_max}g
            </span>
            <span className="stat-label">Protein</span>
          </div>
          <div className="nutrition-stat">
            <span className="stat-value">{config.nutrition.tdee}</span>
            <span className="stat-label">TDEE</span>
          </div>
        </div>
        <p className="nutrition-notes">{config.nutrition.notes}</p>
      </section>

      {measurementReminder}
    </div>
  );
}

export default TodayView;
