import React from 'react';

const DistributionCards = ({ summary, periode }) => {
  const totalDays = periode?.total_days_in_month || 30;
  const totalHk = summary?.total_hk || 0;
  const shiftSiang = summary?.shift_siang || 0;
  const shiftMalam = summary?.shift_malam || 0;
  const cutiResmi = summary?.cuti_resmi || 0;
  const offMurni = summary?.off_murni || 0;
  const sakitIzinAlfa = summary?.sakit_izin_alfa || 0;

  return (
    <div className="distribution-section">
      <div className="distribution-header">
        <h4>REKAPITULASI DISTRIBUSI KEHADIRAN PERIODE (TOTAL: {totalHk}/{totalDays} HARI)</h4>
      </div>

      <div className="distribution-grid">
        <div className="dist-box">
          <span className="dist-title">Total HK</span>
          <strong className="dist-val text-blue">{totalHk} Hari</strong>
        </div>

        <div className="dist-box">
          <span className="dist-title">Shift Siang</span>
          <strong className="dist-val text-navy">{shiftSiang} Hari</strong>
        </div>

        <div className="dist-box">
          <span className="dist-title">Shift Malam</span>
          <strong className="dist-val text-purple">{shiftMalam} Hari</strong>
        </div>

        <div className="dist-box">
          <span className="dist-title">Cuti Resmi</span>
          <strong className="dist-val text-green">{cutiResmi} Hari</strong>
        </div>

        <div className="dist-box">
          <span className="dist-title">OFF Murni</span>
          <strong className="dist-val text-teal">{offMurni} Hari</strong>
        </div>

        <div className="dist-box">
          <span className="dist-title">Sakit / Izin / Alfa</span>
          <strong className="dist-val text-orange">{sakitIzinAlfa} Hari</strong>
        </div>
      </div>
    </div>
  );
};

export default DistributionCards;
