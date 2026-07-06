import { useState } from 'react';
import { evaluateRecovery, evaluateSleepCaution, buildAdjustedPlan } from '../utils/trainerRules.js';
import { getTrainerGuidance } from '../utils/aiCoach.js';
import { loadApiKey } from '../utils/storage.js';

function WhoopCheckIn({ date, dayAbbr, schedule, session, rules, actions }) {
  const savedWhoop = session && session.whoop ? session.whoop : {};
  const [sleepHours, setSleepHours] = useState(savedWhoop.sleep_hours ?? '');
  const [recoveryPct, setRecoveryPct] = useState(savedWhoop.recovery_pct ?? '');
  const [strain, setStrain] = useState(savedWhoop.strain ?? '');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');
  const [aiResult, setAiResult] = useState(null);

  const hasExercises = Boolean(schedule.exercises && schedule.exercises.length > 0);
  const verdict = recoveryPct !== '' ? evaluateRecovery(recoveryPct) : null;
  const sleepCaution = sleepHours !== '' ? evaluateSleepCaution(sleepHours) : null;

  function handleSaveCheckIn() {
    actions.setWhoopCheckIn(date, dayAbbr, {
      sleep_hours: sleepHours === '' ? null : Number(sleepHours),
      recovery_pct: recoveryPct === '' ? null : Number(recoveryPct),
      strain: strain === '' ? null : Number(strain),
    });
  }

  function handleApplyAdjustment() {
    if (!verdict || !hasExercises) {
      return;
    }
    actions.setExercisePlan(date, dayAbbr, buildAdjustedPlan(schedule.exercises, verdict.zone));
  }

  function handleResetPlan() {
    actions.setExercisePlan(date, dayAbbr, null);
  }

  async function handleAskTrainer() {
    const apiKey = loadApiKey();
    if (!apiKey) {
      setAiError('Add your Anthropic API key in Settings first.');
      return;
    }
    setAiLoading(true);
    setAiError('');
    try {
      const result = await getTrainerGuidance({
        whoop: { sleep_hours: sleepHours, recovery_pct: recoveryPct, strain },
        schedule,
        rules,
        apiKey,
      });
      setAiResult(result);
    } catch (err) {
      setAiError(err.message || 'Could not reach the trainer.');
    } finally {
      setAiLoading(false);
    }
  }

  function handleApplyAiPlan() {
    if (!aiResult || !aiResult.exercises) {
      return;
    }
    const plan = aiResult.exercises
      .filter((exercise) => exercise.action !== 'remove')
      .map((exercise) => ({ name: exercise.name, sets: exercise.sets, reps: exercise.reps }));
    actions.setExercisePlan(date, dayAbbr, plan);
  }

  let verdictBlock = null;
  if (verdict) {
    let sleepCautionBlock = null;
    if (sleepCaution) {
      sleepCautionBlock = <p className="verdict-caution">{sleepCaution}</p>;
    }
    let applyButton = null;
    if (verdict.zone !== 'green' && hasExercises) {
      applyButton = (
        <button type="button" className="btn btn-outline" onClick={handleApplyAdjustment}>
          Apply Trainer Adjustment
        </button>
      );
    }
    verdictBlock = (
      <div className={`verdict-card verdict-${verdict.zone}`}>
        <span className="verdict-label">{verdict.label}</span>
        <p className="verdict-summary">{verdict.summary}</p>
        {sleepCautionBlock}
        {applyButton}
      </div>
    );
  }

  let aiErrorBlock = null;
  if (aiError) {
    aiErrorBlock = <p className="form-error">{aiError}</p>;
  }

  let aiResultBlock = null;
  if (aiResult) {
    const exerciseRows = (aiResult.exercises || []).map((exercise) => (
      <li className="ai-exercise-row" key={exercise.name}>
        <span className="ai-exercise-action">{exercise.action}</span>
        <span>
          {exercise.name} — {exercise.sets}×{exercise.reps}
        </span>
      </li>
    ));
    aiResultBlock = (
      <div className="ai-result">
        <p className="verdict-summary">{aiResult.summary}</p>
        <ul className="ai-exercise-list">{exerciseRows}</ul>
        <button type="button" className="btn btn-primary" onClick={handleApplyAiPlan}>
          Apply This Plan
        </button>
      </div>
    );
  }

  let askTrainerButtonLabel = 'Ask Trainer for Detailed Guidance';
  if (aiLoading) {
    askTrainerButtonLabel = 'Asking…';
  }

  let resetButton = null;
  if (session && session.plan) {
    resetButton = (
      <button type="button" className="btn btn-text" onClick={handleResetPlan}>
        Reset to Planned Session
      </button>
    );
  }

  return (
    <section className="card">
      <h3 className="card-title">WHOOP Check-in</h3>
      <div className="whoop-fields">
        <label className="whoop-field">
          <span className="set-label">Sleep (h)</span>
          <input
            className="text-input"
            type="number"
            step="0.1"
            value={sleepHours}
            onChange={(event) => setSleepHours(event.target.value)}
          />
        </label>
        <label className="whoop-field">
          <span className="set-label">Recovery %</span>
          <input
            className="text-input"
            type="number"
            value={recoveryPct}
            onChange={(event) => setRecoveryPct(event.target.value)}
          />
        </label>
        <label className="whoop-field">
          <span className="set-label">Strain</span>
          <input
            className="text-input"
            type="number"
            step="0.1"
            value={strain}
            onChange={(event) => setStrain(event.target.value)}
          />
        </label>
      </div>
      <button type="button" className="btn btn-outline" onClick={handleSaveCheckIn}>
        Save Check-in
      </button>

      {verdictBlock}

      <button type="button" className="btn btn-text" onClick={handleAskTrainer} disabled={aiLoading}>
        {askTrainerButtonLabel}
      </button>
      {aiErrorBlock}
      {aiResultBlock}
      {resetButton}
    </section>
  );
}

export default WhoopCheckIn;
