import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import './RiwayatPengajuan.css';
import api from '../../../config/api';

const RiwayatPengajuan = () => {
  const [listCuti, setListCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRiwayat = async () => {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.get(`/cuti/status/${userId}`);
        setListCuti(res.data);
      } catch (err) {
        console.error('Gagal mengambil riwayat:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  return (
    <div className="riwayat-container">
      <div className="riwayat-card">
        <div className="riwayat-header">
          <h2>Riwayat Pengajuan Cuti</h2>
          <p>Pantau status permohonan ijin dan cuti Anda secara real-time.</p>
        </div>

        <div className="table-wrapper">
          <table className="elite-table">
            <thead>
              <tr>
                {/* JANGAN ADA SPASI DI SINI */}
                <th>Tanggal Pengajuan</th>
                <th>Periode Cuti</th>
                <th>Alasan</th>
                <th>Status Final</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="4" className="text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : listCuti.length > 0 ? (
                listCuti.map((item) => {
                  const sFinal = item.status || 'pending';
                  return (
                    <tr key={item.id_cuti}>
                      <td>{formatDate(item.created_at)}</td>
                      <td>
                        {formatDate(item.tanggal_mulai)} -{' '}
                        {formatDate(item.tanggal_selesai)}
                      </td>
                      <td>{item.alasan}</td>
                      <td>
                        <span
                          className={`status-badge ${sFinal.toLowerCase()}`}
                        >
                          {sFinal.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="no-data">
                    🚫 Belum ada riwayat.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RiwayatPengajuan;
