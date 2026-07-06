const DATA_KEY = 'trainingApp:data:v1';
const API_KEY_STORAGE_KEY = 'trainingApp:anthropicApiKey';

export function loadData(seed) {
  try {
    const raw = window.localStorage.getItem(DATA_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.targets = parsed.targets || {};
      return parsed;
    }
  } catch (err) {
    // corrupt storage — fall through and reseed
  }
  const seeded = {
    measurements: seed.measurements || [],
    sessions: seed.sessions || [],
    meals: seed.meals || [],
    targets: seed.targets || {},
  };
  persistData(seeded);
  return seeded;
}

export function persistData(data) {
  window.localStorage.setItem(DATA_KEY, JSON.stringify(data));
}

export function loadApiKey() {
  return window.localStorage.getItem(API_KEY_STORAGE_KEY) || '';
}

export function saveApiKey(key) {
  if (key) {
    window.localStorage.setItem(API_KEY_STORAGE_KEY, key);
  } else {
    window.localStorage.removeItem(API_KEY_STORAGE_KEY);
  }
}
