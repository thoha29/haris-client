import React from 'react';

const SingleUserSelector = ({ selectedUser, setSelectedUser, karyawanList }) => {
  return (
    <div className="target-selection-card animate-fade-in">
      <div className="input-group">
        <label className="filter-label">Pilih 1 Karyawan</label>
        <select
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.target.value)}
          className="select-elite"
        >
          <option value="">-- Pilih Karyawan --</option>
          {karyawanList.map((k) => (
            <option key={k.id_user} value={k.id_user}>
              {k.username}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default SingleUserSelector;
