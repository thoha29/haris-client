import React from 'react';

const SummaryCards = ({ summary }) => {
  const totalJamKerja = summary?.total_jam_kerja ?? 0;
  const totalLemburAktual = summary?.total_lembur_aktual ?? 0;
  const totalLemburKonversi = summary?.total_lembur_konversi ?? 0;

  return (
    <div className="report-summary-cards">
      <div className="summary-card card-jam-kerja">
        <span className="card-label">TOTAL JAM KERJA</span>
        <h2 className="card-value">{Number(totalJamKerja).toFixed(1)} Jam</h2>
      </div>

      <div className="summary-card card-lembur-aktual">
        <span className="card-label">TOTAL LEMBUR AKTUAL</span>
        <h2 className="card-value">{Number(totalLemburAktual).toFixed(1)} Jam</h2>
      </div>

      <div className="summary-card card-lembur-konversi">
        <span className="card-label">TOTAL LEMBUR KONVERSI</span>
        <h2 className="card-value text-blue">{Number(totalLemburKonversi).toFixed(1)} Jam</h2>
      </div>
    </div>
  );
};

export default SummaryCards;
