import React, { useState, useEffect, useMemo } from 'react';
// import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './HrdKaryawanDetail.css';
import api from '../../../config/api';

const HrdKaryawanDetail = () => {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- State untuk Filter ---
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const years = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - i);
  }, []);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/absensi/hrd/riwayat/${id_user}`);
      setRiwayat(res.data);
    } catch (err) {
      console.error('Gagal ambil riwayat:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
    // eslint-disable-next-line
  }, [id_user]);

  // --- Logic Filter Data ---
  const filteredRiwayat = useMemo(() => {
    return riwayat.filter((item) => {
      const date = new Date(item.tanggal);
      return (
        date.getMonth() === parseInt(selectedMonth) &&
        date.getFullYear() === parseInt(selectedYear)
      );
    });
  }, [riwayat, selectedMonth, selectedYear]);

  const handleEditClick = (item) => {
    setEditData({ ...item });
    setIsEditModalOpen(true);
  };

  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(
        `/absensi/hrd/edit-absensi/${editData.id_data_absensi}`,
        editData
      );
      Swal.fire('Berhasil!', 'Data absensi berhasil diperbarui!', 'success');
      setIsEditModalOpen(false);
      fetchDetail();
    } catch (error) {
      console.error('Gagal update absensi:', error);
      Swal.fire('Error', 'Gagal memperbarui data absensi', 'error');
    }
  };

  const handleDownloadExcel = () => {
    // Tips: Kamu bisa mengirim parameter bulan & tahun ke backend jika backend mendukung filter download
    window.open(
      `/absensi/hrd/download-excel/${id_user}?month=${
        parseInt(selectedMonth) + 1
      }&year=${selectedYear}`,
      '_blank'
    );
  };

  return (
    <div className="detail-wrapper">
      <div className="detail-header">
        <div className="header-left">
          <button onClick={() => navigate(-1)} className="btn-back">
            ⬅ Kembali
          </button>
          <div>
            <h2>Riwayat: {riwayat[0]?.username || 'Karyawan'}</h2>
            {riwayat.length > 0 && (
              <span className="role-indicator-small">
                Role:{' '}
                {riwayat[0].role?.toLowerCase() === 'user'
                  ? 'User (Bypass Atasan)'
                  : riwayat[0].role}
              </span>
            )}
          </div>
        </div>

        <div className="header-right" style={{ display: 'flex', gap: '10px' }}>
          {/* UI Filter Dropdown */}
          <div className="filter-group-hrd">
            <label>Filter Periode:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="filter-select-sm"
            >
              {months.map((m, i) => (
                <option key={i} value={i}>
                  {m}
                </option>
              ))}
            </select>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="filter-select-sm"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleDownloadExcel}
            className="btn-download"
            disabled={filteredRiwayat.length === 0}
          >
            Export Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data riwayat...</div>
      ) : (
        <div className="table-container">
          <table className="detail-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Jam Kerja</th>
                <th>Durasi</th>
                <th>Telat/Lembur</th>
                <th>Status HRD</th>
                <th>Hasil Final</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredRiwayat.length > 0 ? (
                filteredRiwayat.map((item, index) => (
                  <tr key={index}>
                    <td>
                      {new Date(item.tanggal).toLocaleDateString('id-ID', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td>
                      <small>In: {item.jam_masuk}</small>
                      <br />
                      <small>Out: {item.jam_keluar || '--:--'}</small>
                    </td>
                    <td>{item.total_jam_kerja || '--'}</td>
                    <td>
                      <small
                        style={{
                          color: item.keterlambatan > 0 ? '#d9534f' : 'inherit',
                        }}
                      >
                        T: {item.keterlambatan}m
                      </small>
                      <br />
                      <small
                        style={{
                          color: item.lembur > 0 ? '#5cb85c' : 'inherit',
                        }}
                      >
                        L: {item.lembur} Jam
                      </small>
                    </td>
                    <td>
                      <span
                        className={`badge-mini ${
                          item.status === 'Alpha'
                            ? 'alpha'
                            : item.status_hrd || 'pending'
                        }`}
                      >
                        {item.status === 'Alpha'
                          ? 'ALPHA'
                          : (item.status_hrd || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge-final ${
                          item.status === 'Alpha'
                            ? 'alpha'
                            : item.is_approved || 'pending'
                        }`}
                      >
                        {item.status === 'Alpha'
                          ? 'ALPHA'
                          : (item.is_approved || 'pending').toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-edit-sm"
                        onClick={() => handleEditClick(item)}
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="7"
                    className="text-center"
                    style={{ padding: '30px' }}
                  >
                    Tidak ada data absensi untuk periode{' '}
                    <strong>
                      {months[selectedMonth]} {selectedYear}
                    </strong>
                    .
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Edit tetap sama seperti sebelumnya */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Edit Data Absensi</h3>
            <form onSubmit={handleEditSubmit}>
              {/* ... (Isi form sama dengan kode awal kamu) ... */}
              <div className="form-group">
                <label>Jam Masuk:</label>
                <input
                  type="time"
                  name="jam_masuk"
                  value={editData?.jam_masuk || ''}
                  onChange={handleEditChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Jam Keluar:</label>
                <input
                  type="time"
                  name="jam_keluar"
                  value={editData?.jam_keluar || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Total Jam Kerja:</label>
                <input
                  type="text"
                  name="total_jam_kerja"
                  value={editData?.total_jam_kerja || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Keterlambatan (menit):</label>
                <input
                  type="number"
                  name="keterlambatan"
                  value={editData?.keterlambatan || 0}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Lembur (jam):</label>
                <input
                  type="number"
                  step="0.1"
                  name="lembur"
                  value={editData?.lembur || 0}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Status (Hadir/Alpha/Cuti dll):</label>
                <input
                  type="text"
                  name="status"
                  value={editData?.status || ''}
                  onChange={handleEditChange}
                />
              </div>
              <div className="form-group">
                <label>Status HRD:</label>
                <select
                  name="status_hrd"
                  value={editData?.status_hrd || 'pending'}
                  onChange={handleEditChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="form-group">
                <label>Hasil Final:</label>
                <select
                  name="is_approved"
                  value={editData?.is_approved || 'pending'}
                  onChange={handleEditChange}
                >
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-save">
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HrdKaryawanDetail;
