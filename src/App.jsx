import { useState } from 'react';
import Nav from './components/Nav.jsx';
import TodayView from './components/TodayView.jsx';
import WeekView from './components/WeekView.jsx';
import MeasurementLog from './components/MeasurementLog.jsx';
import config from '../data/config.json';
import logs from '../data/logs.json';

function App() {
  const [activeTab, setActiveTab] = useState('today');

  let activeView = <TodayView config={config} logs={logs} />;
  if (activeTab === 'week') {
    activeView = <WeekView config={config} logs={logs} />;
  }
  if (activeTab === 'log') {
    activeView = <MeasurementLog logs={logs} />;
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <span className="app-title">{config.block.name}</span>
      </header>
      <main className="app-main">{activeView}</main>
      <Nav activeTab={activeTab} onSelectTab={setActiveTab} />
    </div>
  );
}

export default App;
