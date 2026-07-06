import { useCallback, useState } from 'react';
import { loadData, persistData } from './storage.js';

function cloneData(data) {
  return JSON.parse(JSON.stringify(data));
}

function findOrCreateSession(data, date, dayAbbr) {
  let session = data.sessions.find((entry) => entry.date === date);
  if (!session) {
    session = { date, day: dayAbbr, completed: false, notes: '', exercises: [] };
    data.sessions.push(session);
  }
  if (!session.exercises) {
    session.exercises = [];
  }
  return session;
}

export function useAppData(seed) {
  const [data, setData] = useState(() => loadData(seed));

  const mutate = useCallback((mutator) => {
    setData((prev) => {
      const next = cloneData(prev);
      mutator(next);
      persistData(next);
      return next;
    });
  }, []);

  const logSet = useCallback(
    (date, dayAbbr, exerciseName, setIndex, values) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        let exercise = session.exercises.find((entry) => entry.name === exerciseName);
        if (!exercise) {
          exercise = { name: exerciseName, sets: [] };
          session.exercises.push(exercise);
        }
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], ...values };
      });
    },
    [mutate]
  );

  const toggleSessionComplete = useCallback(
    (date, dayAbbr) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        session.completed = !session.completed;
        if (session.completed) {
          session.skipped = false;
        }
      });
    },
    [mutate]
  );

  const toggleSessionSkipped = useCallback(
    (date, dayAbbr) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        session.skipped = !session.skipped;
        if (session.skipped) {
          session.completed = false;
        }
      });
    },
    [mutate]
  );

  const setExercisePlan = useCallback(
    (date, dayAbbr, plan) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        session.plan = plan;
      });
    },
    [mutate]
  );

  const setWhoopCheckIn = useCallback(
    (date, dayAbbr, whoop) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        session.whoop = whoop;
      });
    },
    [mutate]
  );

  const setSessionNotes = useCallback(
    (date, dayAbbr, notes) => {
      mutate((next) => {
        const session = findOrCreateSession(next, date, dayAbbr);
        session.notes = notes;
      });
    },
    [mutate]
  );

  const addMeal = useCallback(
    (meal) => {
      mutate((next) => {
        next.meals.push(meal);
      });
    },
    [mutate]
  );

  const removeMeal = useCallback(
    (date, mealIndexForDate) => {
      mutate((next) => {
        const mealsForDate = next.meals.filter((meal) => meal.date === date);
        const target = mealsForDate[mealIndexForDate];
        if (target) {
          next.meals.splice(next.meals.indexOf(target), 1);
        }
      });
    },
    [mutate]
  );

  return {
    data,
    logSet,
    toggleSessionComplete,
    toggleSessionSkipped,
    setSessionNotes,
    setExercisePlan,
    setWhoopCheckIn,
    addMeal,
    removeMeal,
  };
}
