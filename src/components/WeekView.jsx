import SessionTypeBadge from './SessionTypeBadge.jsx';
import ExerciseList from './ExerciseList.jsx';
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

function WeekView({ config, data, actions }) {
  const today = new Date();
  const todayStart = startOfDay(today);
  const monday = getMondayOfWeek(today);

  const rows = WEEKDAY_ORDER.map((dayAbbr, index) => {
    const schedule = config.week.find((entry) => entry.day === dayAbbr);
    const dayDate = addDays(monday, index);
    const dayISO = toISODate(dayDate);
    const sessionLog = data.sessions.find((entry) => entry.date === dayISO);
    const status = statusForDay(dayDate, todayStart, sessionLog);
    const notes = sessionLog && sessionLog.notes ? sessionLog.notes : '';

    let completeButtonLabel = 'Mark complete';
    if (sessionLog && sessionLog.completed) {
      completeButtonLabel = 'Completed ✓';
    }
    let completeButtonClass = 'btn btn-outline';
    if (sessionLog && sessionLog.completed) {
      completeButtonClass = 'btn btn-success';
    }

    let exerciseSection = null;
    if (schedule.exercises && schedule.exercises.length > 0) {
      exerciseSection = (
        <ExerciseList
          exercises={schedule.exercises}
          session={sessionLog}
          onLogSet={(exerciseName, setIndex, values) =>
            actions.logSet(dayISO, dayAbbr, exerciseName, setIndex, values)
          }
        />
      );
    }

    return (
      <details className="week-day-details" key={dayAbbr}>
        <summary className="week-row">
          <div className="week-row-day">
            <span className="week-day-abbr">{schedule.day}</span>
            <span className="week-day-date">{dayDate.getDate()}</span>
          </div>
          <div className="week-row-body">
            <span className="week-session-name">{schedule.session}</span>
            <SessionTypeBadge type={schedule.type} />
          </div>
          <span className={`status-pill ${status.className}`}>{status.label}</span>
        </summary>
        <div className="week-day-panel">
          {exerciseSection}
          <button
            type="button"
            className={completeButtonClass}
            onClick={() => actions.toggleSessionComplete(dayISO, dayAbbr)}
          >
            {completeButtonLabel}
          </button>
          <textarea
            className="notes-input"
            placeholder="Notes — what did you actually do?"
            value={notes}
            onChange={(event) => actions.setSessionNotes(dayISO, dayAbbr, event.target.value)}
          />
        </div>
      </details>
    );
  });

  return (
    <div className="view">
      <div className="week-list">{rows}</div>

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
