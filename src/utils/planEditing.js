export function adjustSets(exercises, name, delta) {
  return exercises.map((exercise) => {
    if (exercise.name !== name) {
      return exercise;
    }
    return { ...exercise, sets: Math.max(1, exercise.sets + delta) };
  });
}

export function removeExercise(exercises, name) {
  return exercises.filter((exercise) => exercise.name !== name);
}

export function addExercise(exercises, name, sets, reps) {
  return [...exercises, { name, sets: Math.max(1, Number(sets) || 3), reps: reps || '' }];
}
