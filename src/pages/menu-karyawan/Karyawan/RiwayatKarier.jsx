import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './RiwayatKarier.css';

const RiwayatKarier = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nama_perusahaan: '',
    jabatan: '',
    tanggal_masuk: '',
    tanggal_keluar: '',
  });
  const [file, setFile] = useState(null);

  const userId = localStorage.getItem('userId') || 1;

  // 1. Ambil data riwayat karier (Fungsi dipindah ke dalam useEffect buat hindari warning ESLint)
  useEffect(() => {
    const fetchRiwayat = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3000/api/career/riwayat?id_user=${userId}`
        );
        setRiwayat(response.data);
      } catch (error) {
        console.error('Gagal mengambil data:', error);
      }
    };
    fetchRiwayat();
  }, [userId]);

  // 2. Handle Input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // 3. Simpan Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const data = new FormData();
    data.append('id_user', userId);
    data.append('nama_perusahaan', formData.nama_perusahaan);
    data.append('jabatan', formData.jabatan);
    data.append('tanggal_masuk', formData.tanggal_masuk);
    data.append('tanggal_keluar', formData.tanggal_keluar);
    data.append('foto_bukti', file);

    try {
      await axios.post(
        'http://localhost:3000/api/career/riwayat/simpan',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      Swal.fire('Berhasil!', 'Data berhasil disimpan', 'success');

      // Reset Form & Refresh Data
      setFormData({
        nama_perusahaan: '',
        jabatan: '',
        tanggal_masuk: '',
        tanggal_keluar: '',
      });
      setFile(null);
      if (document.getElementById('fileInput'))
        document.getElementById('fileInput').value = '';

      // Panggil ulang data setelah simpan
      const response = await axios.get(
        `http://localhost:3000/api/career/riwayat?id_user=${userId}`
      );
      setRiwayat(response.data);
    } catch (error) {
      Swal.fire(
        'Error',
        error.response?.data?.message || 'Gagal menyimpan data.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  const formatPeriode = (tgl) => {
    return new Date(tgl).toLocaleDateString('id-ID', {
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="container mt-4 mb-5">
      <div className="mb-4">
        <h2 className="fw-bold">Riwayat Karier</h2>
      </div>

      {/* CARD INPUT DATA */}
      <div className="card mb-5 border-0 shadow-sm">
        <div className="card-header bg-primary text-white py-3">
          <span className="fw-bold">Form Pengalaman Kerja</span>
        </div>
        <div className="card-body p-4">
          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Perusahaan</label>
                <input
                  type="text"
                  name="nama_perusahaan"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.nama_perusahaan}
                  placeholder="PT. Example Indonesia"
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label fw-bold">Jabatan</label>
                <input
                  type="text"
                  name="jabatan"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.jabatan}
                  placeholder="Staff / Manager"
                  required
                />
              </div>
            </div>
            <div className="row">
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Masuk</label>
                <input
                  type="date"
                  name="tanggal_masuk"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.tanggal_masuk}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Keluar</label>
                <input
                  type="date"
                  name="tanggal_keluar"
                  className="form-control"
                  onChange={handleChange}
                  value={formData.tanggal_keluar}
                  required
                />
              </div>
              <div className="col-md-4 mb-3">
                <label className="form-label fw-bold">Bukti Dokumen</label>
                <input
                  type="file"
                  id="fileInput"
                  className="form-control"
                  onChange={handleFileChange}
                  accept="image/*,.pdf"
                  required
                />
              </div>
            </div>
            <div className="mt-2">
              <button
                type="submit"
                className="btn btn-success px-5"
                disabled={loading}
              >
                {loading ? 'Sedang Menyimpan...' : 'Simpan Data'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* TABEL DATA */}
      <div className="card border-0 shadow-sm">
        <div className="card-header bg-secondary text-white py-3">
          <span className="fw-bold">Daftar Riwayat Karier</span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="px-4">Nama Perusahaan</th>
                  <th>Jabatan</th>
                  <th>Periode</th>
                  <th className="text-center">Dokumen</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {riwayat.length > 0 ? (
                  riwayat.map((item) => (
                    <tr key={item.id_riwayat}>
                      <td className="px-4 fw-bold text-dark">
                        {item.nama_perusahaan}
                      </td>
                      <td>{item.jabatan}</td>
                      <td>
                        {formatPeriode(item.tanggal_masuk)} -{' '}
                        {formatPeriode(item.tanggal_keluar)}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn btn-sm p-0 border-0 bg-transparent text-primary"
                          title="Lihat Dokumen"
                          onClick={() =>
                            window.open(
                              `http://localhost:3000/uploads/riwayat/${item.foto_bukti}`,
                              '_blank'
                            )
                          }
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            viewBox="0 0 16 16"
                          >
                            <path d="M10.5 8a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0z" />
                            <path d="M0 8s3-5.5 8-5.5S16 8 16 8s-3 5.5-8 5.5S0 8 0 8zm8 3.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
                          </svg>
                        </button>
                      </td>
                      <td className="text-center">
                        <span className="bg-lock">Verified</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-muted">
                      Belum ada riwayat kerja.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiwayatKarier;
