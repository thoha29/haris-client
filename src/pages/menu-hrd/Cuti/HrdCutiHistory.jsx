import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HrdCutiHistory.css';
import api from '../../../config/api';

const HrdCutiHistory = () => {
  const [karyawan, setKaryawan] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        // Endpoint ini akan mengambil seluruh data user tanpa filter role dari backend
        const res = await api.get('/absensi/hrd/list-karyawan');
        setKaryawan(res.data);
      } catch (err) {
        console.error('Gagal mengambil data karyawan:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchKaryawan();
  }, []);

  // Filter pencarian tetap jalan untuk mempermudah HRD mencari nama
  const filteredKaryawan = karyawan.filter((k) =>
    k.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="monitoring-wrapper">
      <div className="monitoring-header">
        <div>
          <h1>Monitoring Riwayat Cuti</h1>
          <p>PT. Banggai Sentral Sulawesi - Semua Divisi</p>
        </div>
        <div className="search-box">
          <input
            type="text"
            placeholder="Cari username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data seluruh karyawan...</div>
      ) : (
        <div className="employee-grid">
          {filteredKaryawan.length > 0 ? (
            filteredKaryawan.map((user) => (
              <div key={user.id_user} className="employee-card">
                <div className="card-profile">
                  {/* Avatar otomatis berubah warna berdasarkan role di CSS */}
                  <div
                    className={`avatar-circle role-${user.role?.toLowerCase()}`}
                  >
                    {user.username?.charAt(0).toUpperCase()}
                  </div>
                  <div className="info">
                    <h3>{user.username}</h3>
                    {/* Menampilkan role: karyawan, user, atau keuangan secara dinamis */}
                    <span className="role-text">
                      Role: {user.role?.toLowerCase()}
                    </span>
                  </div>
                </div>
                <div className="card-footer">
                  <button
                    className="btn-view-detail"
                    onClick={() =>
                      navigate(`/hrd/cuti/riwayat/${user.id_user}`)
                    }
                  >
                    Lihat Riwayat
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">Data tidak ditemukan.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default HrdCutiHistory;
