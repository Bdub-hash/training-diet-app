import { getMondayOfWeek, toISODate, addDays } from './dates.js';

export function getWeekKey(date) {
  return toISODate(getMondayOfWeek(date));
}

export function summarizeWeek(weekStartISO, sessions, meals) {
  const weekStart = new Date(`${weekStartISO}T00:00:00`);
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const dayDate = addDays(weekStart, i);
    const dayISO = toISODate(dayDate);
    const dayMeals = meals.filter((meal) => meal.date === dayISO);
    const calories = dayMeals.reduce((sum, meal) => sum + Number(meal.calories || 0), 0);
    const session = sessions.find((entry) => entry.date === dayISO);
    days.push({
      date: dayISO,
      calories,
      completed: Boolean(session && session.completed),
    });
  }
  const sessionsCompleted = days.filter((day) => day.completed).length;
  const loggedDays = days.filter((day) => day.calories > 0);
  const avgCalories =
    loggedDays.length > 0
      ? Math.round(loggedDays.reduce((sum, day) => sum + day.calories, 0) / loggedDays.length)
      : 0;

  return {
    weekStart: weekStartISO,
    days,
    sessionsCompleted,
    avgCalories,
  };
}

export function summarizeRecentWeeks(sessions, meals, weekCount) {
  const currentWeekKey = getWeekKey(new Date());
  const weeks = [];
  for (let i = 0; i < weekCount; i += 1) {
    const weekStart = addDays(new Date(`${currentWeekKey}T00:00:00`), -7 * i);
    weeks.push(summarizeWeek(toISODate(weekStart), sessions, meals));
  }
  return weeks;
}
