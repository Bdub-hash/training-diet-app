import { useState } from 'react';
import { loadApiKey, saveApiKey } from '../utils/storage.js';

function ApiKeySettings({ onClose }) {
  const [key, setKey] = useState(() => loadApiKey());
  const [savedMessage, setSavedMessage] = useState('');

  function handleSave() {
    saveApiKey(key.trim());
    setSavedMessage('Saved');
  }

  function handleClear() {
    setKey('');
    saveApiKey('');
    setSavedMessage('Cleared');
  }

  function handleChange(event) {
    setKey(event.target.value);
    setSavedMessage('');
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <h3 className="card-title">Anthropic API Key</h3>
        <p className="modal-description">
          Used only to estimate calories from meal photos, sent directly from your browser to
          Anthropic. Stored only on this device — never committed to the repo.
        </p>
        <input
          className="text-input"
          type="password"
          placeholder="sk-ant-..."
          value={key}
          onChange={handleChange}
        />
        <div className="modal-actions">
          <button type="button" className="btn btn-outline" onClick={handleClear}>
            Clear
          </button>
          <button type="button" className="btn btn-primary" onClick={handleSave}>
            Save
          </button>
        </div>
        {savedMessage ? <p className="modal-status">{savedMessage}</p> : null}
        <button type="button" className="btn btn-text" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default ApiKeySettings;
