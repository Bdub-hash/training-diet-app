import { useState } from 'react';
import BlockProgress from './BlockProgress.jsx';
import SessionTypeBadge from './SessionTypeBadge.jsx';
import ExerciseList from './ExerciseList.jsx';
import WhoopCheckIn from './WhoopCheckIn.jsx';
import { toISODate, getDayAbbr } from '../utils/dates.js';
import { adjustSets, removeExercise, addExercise } from '../utils/planEditing.js';

function TodayView({ config, data, actions }) {
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseSets, setNewExerciseSets] = useState('3');
  const [newExerciseReps, setNewExerciseReps] = useState('');

  const today = new Date();
  const todayISO = toISODate(today);
  const todayAbbr = getDayAbbr(today);
  const schedule = config.week.find((entry) => entry.day === todayAbbr);
  const session = data.sessions.find((entry) => entry.date === todayISO);
  const completed = Boolean(session && session.completed);
  const skipped = Boolean(session && session.skipped);
  const notes = session && session.notes ? session.notes : '';
  const effectiveExercises = session && session.plan ? session.plan : schedule.exercises;

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

  let skippedButtonLabel = 'Skipped';
  if (skipped) {
    skippedButtonLabel = 'Skipped ✓';
  }
  let skippedButtonClass = 'btn btn-outline';
  if (skipped) {
    skippedButtonClass = 'btn btn-warning';
  }

  function handleAdjustSets(exerciseName, delta) {
    actions.setExercisePlan(todayISO, todayAbbr, adjustSets(effectiveExercises, exerciseName, delta));
  }

  function handleRemoveExercise(exerciseName) {
    actions.setExercisePlan(todayISO, todayAbbr, removeExercise(effectiveExercises, exerciseName));
  }

  function handleAddExercise() {
    if (!newExerciseName.trim()) {
      return;
    }
    actions.setExercisePlan(
      todayISO,
      todayAbbr,
      addExercise(effectiveExercises, newExerciseName.trim(), newExerciseSets, newExerciseReps.trim())
    );
    setNewExerciseName('');
    setNewExerciseSets('3');
    setNewExerciseReps('');
  }

  let exerciseSection = null;
  if (effectiveExercises && effectiveExercises.length > 0) {
    exerciseSection = (
      <section className="card">
        <h3 className="card-title">Exercises</h3>
        <ExerciseList
          exercises={effectiveExercises}
          session={session}
          editable
          onLogSet={(exerciseName, setIndex, values) =>
            actions.logSet(todayISO, todayAbbr, exerciseName, setIndex, values)
          }
          onAdjustSets={handleAdjustSets}
          onRemoveExercise={handleRemoveExercise}
        />
        <div className="add-exercise-form">
          <input
            className="text-input"
            placeholder="Add exercise"
            value={newExerciseName}
            onChange={(event) => setNewExerciseName(event.target.value)}
          />
          <div className="estimate-fields">
            <input
              className="text-input"
              type="number"
              placeholder="Sets"
              value={newExerciseSets}
              onChange={(event) => setNewExerciseSets(event.target.value)}
            />
            <input
              className="text-input"
              placeholder="Reps (e.g. 8-10)"
              value={newExerciseReps}
              onChange={(event) => setNewExerciseReps(event.target.value)}
            />
          </div>
          <button type="button" className="btn btn-outline" onClick={handleAddExercise}>
            Add Exercise
          </button>
        </div>
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
        <div className="button-row">
          <button
            type="button"
            className={completeButtonClass}
            onClick={() => actions.toggleSessionComplete(todayISO, todayAbbr)}
          >
            {completeButtonLabel}
          </button>
          <button
            type="button"
            className={skippedButtonClass}
            onClick={() => actions.toggleSessionSkipped(todayISO, todayAbbr)}
          >
            {skippedButtonLabel}
          </button>
        </div>
        <textarea
          className="notes-input"
          placeholder="Notes — what did you actually do?"
          value={notes}
          onChange={(event) => actions.setSessionNotes(todayISO, todayAbbr, event.target.value)}
        />
      </section>

      <WhoopCheckIn
        date={todayISO}
        dayAbbr={todayAbbr}
        schedule={schedule}
        session={session}
        rules={config.rules}
        actions={actions}
      />

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
