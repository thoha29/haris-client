import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../menu-karyawan/Dashboard/dashboard.css';

function DashboardKeuangan() {
  const namaKaryawan = localStorage.getItem('username') || 'Keuangan';
  const userId = localStorage.getItem('userId');
  const [jadwal, setJadwal] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJadwal = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await axios.get(
          `https://api1.ptbss.id/api/jadwal/detail/${userId}`
        );
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcoming = res.data
          .filter((item) => new Date(item.tanggal) >= today)
          .sort((a, b) => new Date(a.tanggal) - new Date(b.tanggal))
          .slice(0, 10);

        setJadwal(upcoming);
      } catch (error) {
        console.error('Gagal mengambil jadwal:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchJadwal();
  }, [userId]);

  const todayStr = new Date().toDateString();

  return (
    <div className="dash-wrap">
      <div className="dash-greeting">
        <h2>Selamat Datang, {namaKaryawan}</h2>
        <p>Berikut adalah jadwal shift Anda yang akan datang.</p>
      </div>

      <div className="dash-table-card">
        <div className="dash-table-header">
          <h4>Jadwal Shift Mendatang</h4>
        </div>

        {loading ? (
          <div className="dash-loading">Memuat jadwal...</div>
        ) : jadwal.length > 0 ? (
          <table className="dash-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Hari / Tanggal</th>
                <th>Nama Shift</th>
              </tr>
            </thead>
            <tbody>
              {jadwal.map((item, index) => {
                const dateObj = new Date(item.tanggal);
                const isToday = dateObj.toDateString() === todayStr;
                return (
                  <tr key={index} className={isToday ? 'row-today' : ''}>
                    <td>{index + 1}</td>
                    <td className="td-tanggal">
                      {dateObj.toLocaleDateString('id-ID', {
                        weekday: 'long',
                        day: '2-digit',
                        month: 'long',
                        year: 'numeric',
                      })}
                      {isToday && <span className="label-today">Hari Ini</span>}
                    </td>
                    <td>
                      <span className="shift-tag">{item.nama_skema}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        ) : (
          <div className="dash-empty">
            <p>Belum ada jadwal shift untuk Anda di hari-hari mendatang.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardKeuangan;
