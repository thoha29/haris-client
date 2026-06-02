import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
import Swal from 'sweetalert2';
import './HrdApprovalCuti.css';
import api from '../../../config/api';

const HrdApprovalCuti = () => {
  const [listPengajuan, setListPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Mengambil data yang sudah di-ACC Atasan untuk diverifikasi HRD
  const fetchPendingHRD = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cuti/pending-hrd');
      setListPengajuan(res.data);
    } catch (err) {
      console.error('Gagal ambil data pengajuan HRD:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingHRD();
  }, []);

  const hitungDurasi = (mulai, selesai) => {
    const tgl1 = new Date(mulai);
    const tgl2 = new Date(selesai);
    const diffTime = Math.abs(tgl2 - tgl1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredData = useMemo(() => {
    return listPengajuan.filter((item) => {
      const matchName = item.nama_karyawan
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const dateObj = new Date(item.tanggal_mulai);
      const monthYear = `${dateObj.getFullYear()}-${String(
        dateObj.getMonth() + 1
      ).padStart(2, '0')}`;
      const matchMonth = selectedMonth === '' || monthYear === selectedMonth;
      const matchType = selectedType === '' || item.tipe === selectedType;

      return matchName && matchMonth && matchType;
    });
  }, [listPengajuan, searchTerm, selectedMonth, selectedType]);

  // Handle Action Final oleh HRD
  const handleAction = async (id_cuti, statusBaru) => {
    const result = await Swal.fire({
      title: 'Keputusan Final',
      text: `Berikan keputusan FINAL ${statusBaru} untuk pengajuan ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put('/cuti/approve-hrd', {
        id_cuti: id_cuti,
        status: statusBaru,
      });
      Swal.fire(
        'Berhasil!',
        `Keputusan HRD berhasil disimpan: ${statusBaru}`,
        'success'
      );
      fetchPendingHRD();
    } catch (err) {
      Swal.fire(
        'Error',
        'Gagal update status HRD: ' + (err.response?.data?.message || 'Error'),
        'error'
      );
    }
  };

  return (
    <div className="hrd-container">
      <div className="hrd-card">
        <div className="hrd-header">
          <h2>Panel Verifikasi Final HRD</h2>
          <p>
            Hanya menampilkan pengajuan yang sudah disetujui oleh Atasan (User).
          </p>
        </div>

        <div className="filter-row">
          <div className="filter-group">
            <label>Cari Nama:</label>
            <input
              type="text"
              placeholder="Ketik nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <label>Tipe:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-input"
            >
              <option value="">Semua Tipe</option>
              <option value="Cuti">Cuti Tahunan</option>
              <option value="Izin">Izin</option>
              <option value="Cuti Meninggal">Cuti Meninggal</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
            </select>
          </div>
          <div className="filter-group">
            <label>Bulan:</label>
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-input"
            />
          </div>
          <button
            className="btn-reset"
            onClick={() => {
              setSearchTerm('');
              setSelectedMonth('');
              setSelectedType('');
            }}
          >
            Reset
          </button>
        </div>

        <div className="table-responsive">
          <table className="hrd-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tipe</th>
                <th>Periode</th>
                <th>Alasan</th>
                <th>Status Atasan</th> {/* KOLOM BARU */}
                <th>Keputusan HRD</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Memuat data verifikasi...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id_cuti}>
                    <td className="emp-name">{item.nama_karyawan}</td>
                    <td>
                      <span
                        className={`type-badge type-${item.tipe
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {item.tipe}
                      </span>
                    </td>
                    <td>
                      <strong>
                        {hitungDurasi(item.tanggal_mulai, item.tanggal_selesai)}{' '}
                        Hari
                      </strong>
                      <br />
                      <small>
                        {new Date(item.tanggal_mulai).toLocaleDateString(
                          'id-ID'
                        )}{' '}
                        -{' '}
                        {new Date(item.tanggal_selesai).toLocaleDateString(
                          'id-ID'
                        )}
                      </small>
                    </td>
                    <td className="reason-cell">{item.alasan}</td>
                    <td>
                      {/* Badge Status Atasan */}
                      <span className={`status-pill ${item.status_user}`}>
                        {item.status_user?.toUpperCase()}
                      </span>
                    </td>
                    <td className="action-buttons">
                      {item.status_hrd === 'pending' && (
                        <>
                          <button
                            className="btn-acc"
                            onClick={() =>
                              handleAction(item.id_cuti, 'approved')
                            }
                          >
                            ACC FINAL
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() =>
                              handleAction(item.id_cuti, 'rejected')
                            }
                          >
                            REJECT
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center">
                    Tidak ada pengajuan yang perlu diverifikasi HRD saat ini.
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

export default HrdApprovalCuti;
