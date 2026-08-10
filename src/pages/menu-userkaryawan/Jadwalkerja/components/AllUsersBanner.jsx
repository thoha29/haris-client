import React from 'react';

const AllUsersBanner = ({ totalKaryawan }) => {
  return (
    <div className="target-selection-card all-banner animate-fade-in">
      <div className="all-banner-content">
        <span className="all-banner-icon">🌐</span>
        <div>
          <strong>Penugasan Langsung Ke Seluruh User Role "Karyawan"</strong>
          <p>
            Shift yang dipilih akan diterapkan secara otomatis untuk seluruh{' '}
            {totalKaryawan} karyawan aktif yang terdaftar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AllUsersBanner;
