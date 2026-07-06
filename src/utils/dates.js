const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function toISODate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayAbbr(date) {
  return DAY_ABBR[date.getDay()];
}

export function startOfDay(date) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function addDays(date, amount) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + amount);
  return copy;
}

export function daysBetween(from, to) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(to) - startOfDay(from)) / msPerDay);
}

export function getMondayOfWeek(date) {
  const dayIndex = date.getDay();
  const offsetFromMonday = dayIndex === 0 ? 6 : dayIndex - 1;
  return addDays(startOfDay(date), -offsetFromMonday);
}

export function formatShortDate(isoDate) {
  const date = new Date(`${isoDate}T00:00:00`);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
