import React from 'react';

const BulkActionPanel = ({
  selectedDates,
  handleBulkAssign,
  handleBulkDelete,
  onCancel,
}) => {
  if (!selectedDates || selectedDates.length <= 1) return null;

  return (
    <div className="bulk-action-panel animate-fade-in">
      <p>
        <strong>{selectedDates.length} Hari Terpilih</strong> (
        {selectedDates[0]} s/d {selectedDates[selectedDates.length - 1]})
      </p>
      <div className="btn-group-bulk">
        <button onClick={handleBulkAssign} className="btn-bulk-assign">
          Plot Shift Terpilih
        </button>
        <button onClick={handleBulkDelete} className="btn-bulk-delete">
          Hapus Shift Terpilih
        </button>
        <button onClick={onCancel} className="btn-bulk-cancel">
          Batal
        </button>
      </div>
    </div>
  );
};

export default BulkActionPanel;
