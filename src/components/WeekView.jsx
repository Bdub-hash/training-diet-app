import SessionTypeBadge from './SessionTypeBadge.jsx';
import { toISODate, getMondayOfWeek, addDays, startOfDay } from '../utils/dates.js';

const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function statusForDay(dayDate, todayStart, sessionLog) {
  if (sessionLog && sessionLog.completed) {
    return { label: 'Done', className: 'status-done' };
  }
  if (toISODate(dayDate) === toISODate(todayStart)) {
    return { label: 'Today', className: 'status-today' };
  }
  if (dayDate < todayStart) {
    return { label: 'Missed', className: 'status-missed' };
  }
  return { label: 'Upcoming', className: 'status-pending' };
}

function WeekView({ config, logs }) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const monday = getMondayOfWeek(today);

  const rows = WEEKDAY_ORDER.map((dayAbbr, index) => {
    const schedule = config.week.find((entry) => entry.day === dayAbbr);
    const dayDate = addDays(monday, index);
    const dayISO = toISODate(dayDate);
    const sessionLog = logs.sessions.find((entry) => entry.date === dayISO);
    const status = statusForDay(dayDate, todayStart, sessionLog);

    return (
      <li key={dayAbbr} className="week-row">
        <div className="week-row-day">
          <span className="week-day-abbr">{schedule.day}</span>
          <span className="week-day-date">{dayDate.getDate()}</span>
        </div>
        <div className="week-row-body">
          <span className="week-session-name">{schedule.session}</span>
          <SessionTypeBadge type={schedule.type} />
        </div>
        <span className={`status-pill ${status.className}`}>{status.label}</span>
      </li>
    );
  });

  return (
    <div className="view">
      <ul className="week-list">{rows}</ul>

      <section className="card rules-card">
        <h3 className="card-title">Rules</h3>
        <ul className="rules-list">
          {config.rules.map((rule) => (
            <li key={rule}>{rule}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default WeekView;
