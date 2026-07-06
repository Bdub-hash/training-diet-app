function ExerciseList({ exercises, session, onLogSet, editable, onAdjustSets, onRemoveExercise }) {
  if (!exercises || exercises.length === 0) {
    return null;
  }

  const blocks = exercises.map((exercise) => {
    const loggedExercise =
      session && session.exercises
        ? session.exercises.find((entry) => entry.name === exercise.name)
        : null;

    const setRows = [];
    for (let setIndex = 0; setIndex < exercise.sets; setIndex += 1) {
      const loggedSet =
        loggedExercise && loggedExercise.sets[setIndex] ? loggedExercise.sets[setIndex] : {};

      setRows.push(
        <div className="set-row" key={setIndex}>
          <span className="set-number">{setIndex + 1}</span>
          <input
            className="set-input"
            type="text"
            inputMode="numeric"
            placeholder={exercise.reps}
            value={loggedSet.reps || ''}
            onChange={(event) => onLogSet(exercise.name, setIndex, { reps: event.target.value })}
          />
          <input
            className="set-input"
            type="number"
            step="0.5"
            placeholder="kg"
            value={loggedSet.weight === undefined || loggedSet.weight === null ? '' : loggedSet.weight}
            onChange={(event) => onLogSet(exercise.name, setIndex, { weight: event.target.value })}
          />
        </div>
      );
    }

    let editControls = null;
    if (editable) {
      editControls = (
        <div className="exercise-edit-controls">
          <button
            type="button"
            className="stepper-button"
            onClick={() => onAdjustSets(exercise.name, -1)}
            aria-label={`Reduce sets for ${exercise.name}`}
          >
            −
          </button>
          <button
            type="button"
            className="stepper-button"
            onClick={() => onAdjustSets(exercise.name, 1)}
            aria-label={`Add a set for ${exercise.name}`}
          >
            +
          </button>
          <button
            type="button"
            className="remove-button"
            onClick={() => onRemoveExercise(exercise.name)}
            aria-label={`Remove ${exercise.name}`}
          >
            ×
          </button>
        </div>
      );
    }

    return (
      <div className="exercise-block" key={exercise.name}>
        <div className="exercise-header">
          <span className="exercise-name">{exercise.name}</span>
          <span className="exercise-target">
            {exercise.sets} × {exercise.reps}
          </span>
        </div>
        {editControls}
        <div className="set-row set-row-header">
          <span className="set-number" />
          <span className="set-label">Reps</span>
          <span className="set-label">Weight (kg)</span>
        </div>
        {setRows}
      </div>
    );
  });

  return <div className="exercise-list">{blocks}</div>;
}

export default ExerciseList;
