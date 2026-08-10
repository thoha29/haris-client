import React from 'react';

const MultipleUserSelector = ({
  karyawanList,
  selectedUsers,
  setSelectedUsers,
  handleToggleUser,
  userSearchTerm,
  setUserSearchTerm,
}) => {
  const filteredList = karyawanList.filter((k) =>
    k.username.toLowerCase().includes(userSearchTerm.toLowerCase())
  );

  return (
    <div className="target-selection-card animate-fade-in">
      <div className="multi-user-header">
        <div>
          <label className="font-bold font-title">Pilih Beberapa Karyawan</label>
          <span className="badge-counter">
            {selectedUsers.length} dari {karyawanList.length} terpilih
          </span>
        </div>
        <div className="multi-user-actions">
          <button
            type="button"
            className="btn-select-action"
            onClick={() =>
              setSelectedUsers(karyawanList.map((k) => k.id_user))
            }
          >
            Pilih Semua
          </button>
          <button
            type="button"
            className="btn-select-action outline"
            onClick={() => setSelectedUsers([])}
          >
            Hapus Semua
          </button>
        </div>
      </div>
      <div className="search-box-wrapper">
        <input
          type="text"
          placeholder="🔍 Cari nama karyawan..."
          value={userSearchTerm}
          onChange={(e) => setUserSearchTerm(e.target.value)}
          className="search-input-elite"
        />
      </div>
      <div className="multi-user-grid">
        {filteredList.map((k) => {
          const isSelected = selectedUsers.includes(k.id_user);
          return (
            <div
              key={k.id_user}
              className={`user-chip ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggleUser(k.id_user)}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => {}}
                className="chip-checkbox"
              />
              <span className="chip-name">{k.username}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MultipleUserSelector;
