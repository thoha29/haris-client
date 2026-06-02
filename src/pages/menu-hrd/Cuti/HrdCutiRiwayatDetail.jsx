import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './HrdCutiRiwayatDetail.css';
import api from '../../../config/api';

const HrdCutiRiwayatDetail = () => {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCuti = async () => {
      try {
        // Mengambil riwayat berdasarkan id_user
        const res = await api.get(`/cuti/status/${id_user}`);
        setRiwayat(res.data);
      } catch (err) {
        console.error('Gagal ambil detail cuti:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCuti();
  }, [id_user]);

  const handleExportExcel = () => {
    // Memanggil rute export excel yang sudah dibuat di backend
    window.open(`/cuti/laporan/excel/${id_user}`, '_blank');
  };

  return (
    <div className="detail-wrapper">
      <div
        className="detail-header"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <button onClick={() => navigate(-1)} className="btn-back">
            ⬅ Kembali
          </button>
          <h2>Detail Cuti Karyawan </h2>
        </div>
        <button
          className="btn-download"
          onClick={handleExportExcel}
          disabled={riwayat.length === 0}
        >
          Export Excel
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data...</div>
      ) : (
        <div className="table-container">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Tipe</th>
                <th>Mulai</th>
                <th>Selesai</th>
                <th>Alasan</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((item) => (
                  <tr key={item.id_cuti}>
                    <td>
                      <strong>{item.tipe}</strong>
                    </td>
                    <td>
                      {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      {new Date(item.tanggal_selesai).toLocaleDateString(
                        'id-ID'
                      )}
                    </td>
                    <td>{item.alasan}</td>
                    <td>
                      <span className={`badge ${item.status.toLowerCase()}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>
                    Belum ada riwayat cuti/izin.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HrdCutiRiwayatDetail;
