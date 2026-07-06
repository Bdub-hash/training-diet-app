import BlockProgress from './BlockProgress.jsx';
import SessionTypeBadge from './SessionTypeBadge.jsx';
import ExerciseList from './ExerciseList.jsx';
import { toISODate, getDayAbbr } from '../utils/dates.js';

function TodayView({ config, data, actions }) {
  const today = new Date();
  const todayISO = toISODate(today);
  const todayAbbr = getDayAbbr(today);
  const schedule = config.week.find((entry) => entry.day === todayAbbr);
  const session = data.sessions.find((entry) => entry.date === todayISO);
  const completed = Boolean(session && session.completed);
  const notes = session && session.notes ? session.notes : '';

  let measurementReminder = null;
  if (schedule.measurement_day) {
    measurementReminder = (
      <section className="card reminder-card">
        <p className="reminder-text">Measurement day — log waist and thigh measurements.</p>
      </section>
    );
  }

  let completeButtonLabel = 'Mark complete';
  if (completed) {
    completeButtonLabel = 'Completed ✓';
  }
  let completeButtonClass = 'btn btn-outline';
  if (completed) {
    completeButtonClass = 'btn btn-success';
  }

  let exerciseSection = null;
  if (schedule.exercises && schedule.exercises.length > 0) {
    exerciseSection = (
      <section className="card">
        <h3 className="card-title">Exercises</h3>
        <ExerciseList
          exercises={schedule.exercises}
          session={session}
          onLogSet={(exerciseName, setIndex, values) =>
            actions.logSet(todayISO, todayAbbr, exerciseName, setIndex, values)
          }
        />
      </section>
    );
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
        <button
          type="button"
          className={completeButtonClass}
          onClick={() => actions.toggleSessionComplete(todayISO, todayAbbr)}
        >
          {completeButtonLabel}
        </button>
        <textarea
          className="notes-input"
          placeholder="Notes — what did you actually do?"
          value={notes}
          onChange={(event) => actions.setSessionNotes(todayISO, todayAbbr, event.target.value)}
        />
      </section>

      {exerciseSection}

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
