import React from 'react';

const DailyWorkersTable = ({
  selectedDate,
  fetchDailyWorkers,
  dailyWorkers,
}) => {
  return (
    <div className="animate-fade-in">
      <div className="table-controls">
        <div className="input-group">
          <label>Pilih Tanggal Monitoring</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => fetchDailyWorkers(e.target.value)}
            className="date-input-elite"
          />
        </div>
      </div>

      <div className="table-wrapper">
        <table className="daily-table">
          <thead>
            <tr>
              <th>No</th>
              <th>Nama Karyawan</th>
              <th>Nama Shift</th>
              <th>Jam Masuk</th>
              <th>Jam Keluar</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {dailyWorkers.length > 0 ? (
              dailyWorkers.map((w, idx) => (
                <tr key={idx}>
                  <td>{idx + 1}</td>
                  <td className="font-bold">{w.username}</td>
                  <td>
                    <span className="badge-shift">{w.nama_skema}</span>
                  </td>
                  <td>{w.jam_masuk.substring(0, 5)}</td>
                  <td>{w.jam_keluar.substring(0, 5)}</td>
                  <td>
                    <span className="status-pill active">Terjadwal</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center no-data">
                  Tidak ada karyawan yang dijadwalkan pada tanggal ini.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyWorkersTable;
