import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './HrdMonitoring.css';
import api from '../../../config/api';

const HrdMonitoring = () => {
  const [karyawan, setKaryawan] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchKaryawan = async () => {
      try {
        const res = await api.get('/absensi/hrd/list-karyawan');
        setKaryawan(res.data);
      } catch (err) {
        console.error('Gagal ambil list karyawan', err);
      }
    };
    fetchKaryawan();
  }, []);

  const filteredKaryawan = karyawan.filter(
    (k) =>
      k.nama_lengkap?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      k.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="monitoring-wrapper">
      <div className="monitoring-header">
        <div>
          <h1>Monitoring Absensi Karyawan</h1>
          <p>Pilih karyawan untuk melihat detail riwayat absensi</p>
        </div>
        <div className="search-box">
          <i className="bi bi-search search-icon"></i>
          <input
            type="text"
            placeholder="Cari nama karyawan..."
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="employee-grid">
        {filteredKaryawan.map((user) => (
          <div key={user.id_user} className="employee-card">
            <div className="card-profile">
              <div className="avatar-circle">
                {(user.nama_lengkap || user.username || 'U')
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="info">
                <h3>{user.nama_lengkap || user.username}</h3>
                <span>{user.jabatan || 'Staff'}</span>
              </div>
            </div>
            <button
              className="btn-view-detail"
              onClick={() => navigate(`/hrd/riwayat/${user.id_user}`)}
            >
              Lihat Riwayat
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HrdMonitoring;
