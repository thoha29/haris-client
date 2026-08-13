import React from 'react';
import SelectSearch from '../../../../components/SelectSearch';

const SingleUserSelector = ({ selectedUser, setSelectedUser, karyawanList }) => {
  const options = (karyawanList || []).map((k) => ({
    value: k.id_user,
    label: k.username,
  }));

  return (
    <div className="target-selection-card animate-fade-in">
      <div className="input-group">
        <label className="filter-label">Pilih 1 Karyawan</label>
        <SelectSearch
          options={options}
          value={selectedUser}
          onChange={(e) => setSelectedUser(e.value)}
          placeholder="-- Pilih Karyawan --"
          searchPlaceholder="Cari karyawan..."
          isClearable={true}
        />
      </div>
    </div>
  );
};

export default SingleUserSelector;
