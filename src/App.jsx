import { useState } from 'react';
import Nav from './components/Nav.jsx';
import TodayView from './components/TodayView.jsx';
import WeekView from './components/WeekView.jsx';
import NutritionView from './components/NutritionView.jsx';
import TrackerView from './components/TrackerView.jsx';
import MeasurementLog from './components/MeasurementLog.jsx';
import ApiKeySettings from './components/ApiKeySettings.jsx';
import { useAppData } from './utils/useAppData.js';
import config from '../data/config.json';
import logsSeed from '../data/logs.json';
import mealsCatalog from '../data/meals.json';

function App() {
  const [activeTab, setActiveTab] = useState('today');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { data, logSet, toggleSessionComplete, setSessionNotes, addMeal, removeMeal } =
    useAppData(logsSeed);

  const actions = { logSet, toggleSessionComplete, setSessionNotes, addMeal, removeMeal };

  let activeView = <TodayView config={config} data={data} actions={actions} />;
  if (activeTab === 'week') {
    activeView = <WeekView config={config} data={data} actions={actions} />;
  }
  if (activeTab === 'food') {
    activeView = (
      <NutritionView config={config} mealsCatalog={mealsCatalog.meals} meals={data.meals} actions={actions} />
    );
  }
  if (activeTab === 'tracker') {
    activeView = <TrackerView config={config} data={data} />;
  }
  if (activeTab === 'stats') {
    activeView = <MeasurementLog data={data} />;
  }

  let settingsModal = null;
  if (settingsOpen) {
    settingsModal = <ApiKeySettings onClose={() => setSettingsOpen(false)} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">{config.block.name}</span>
        <button
          type="button"
          className="settings-button"
          aria-label="Settings"
          onClick={() => setSettingsOpen(true)}
        >
          ⚙
        </button>
      </header>
      <main className="app-main">{activeView}</main>
      <Nav activeTab={activeTab} onSelectTab={setActiveTab} />
      {settingsModal}
    </div>
  );
}

export default App;
