import React from 'react';

const TargetModeSelector = ({ targetMode, setTargetMode }) => {
  return (
    <div className="target-mode-container">
      <label className="filter-label">Target Penugasan</label>
      <div className="target-mode-buttons">
        <button
          type="button"
          className={`mode-btn ${targetMode === 'single' ? 'active' : ''}`}
          onClick={() => setTargetMode('single')}
        >
          1 Karyawan
        </button>
        <button
          type="button"
          className={`mode-btn ${targetMode === 'multiple' ? 'active' : ''}`}
          onClick={() => setTargetMode('multiple')}
        >
          Beberapa Karyawan
        </button>
        <button
          type="button"
          className={`mode-btn ${targetMode === 'all' ? 'active' : ''}`}
          onClick={() => setTargetMode('all')}
        >
          Seluruh Karyawan
        </button>
      </div>
    </div>
  );
};

export default TargetModeSelector;
