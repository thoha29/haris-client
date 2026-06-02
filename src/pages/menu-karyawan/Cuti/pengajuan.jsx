import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
import Swal from 'sweetalert2';
import './pengajuan.css';
import api from '../../../config/api';

const PengajuanCuti = () => {
  const [formData, setFormData] = useState({
    tanggal_mulai: '',
    tanggal_selesai: '',
    alasan: '',
    tipe: 'Cuti',
  });

  // Inisialisasi sisaCuti dengan ketiga nilainya agar bisa dirender sebelum fetch
  const [sisaCuti, setSisaCuti] = useState({
    total_jatah: 0,
    terpakai: 0,
    sisa_cuti: 0,
  });

  const userId = localStorage.getItem('userId');

  const fetchSisaCuti = useCallback(async () => {
    if (!userId) return;
    try {
      // Memanggil endpoint sinkron yang hanya mengembalikan sisa_cuti murni
      const res = await api.get(`/cuti/sisa/${userId}`);
      setSisaCuti(res.data);
    } catch (err) {
      console.error('Gagal load sisa jatah:', err);
    }
  }, [userId]);

  useEffect(() => {
    fetchSisaCuti();
  }, [fetchSisaCuti]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // VALIDASI JATAH: Menggunakan sisa_cuti murni dari database
    if (formData.tipe === 'Cuti' && sisaCuti.sisa_cuti <= 0) {
      Swal.fire('Gagal!', 'Jatah cuti tahunan Anda sudah habis.', 'error');
      return;
    }

    const hariIni = new Date();
    hariIni.setHours(0, 0, 0, 0);
    const tglMulai = new Date(formData.tanggal_mulai);

    const selisihWaktu = tglMulai.getTime() - hariIni.getTime();
    const selisihHari = Math.ceil(selisihWaktu / (1000 * 3600 * 24));

    if (selisihHari < 0) {
      Swal.fire(
        'Gagal!',
        'Tidak bisa mengajukan untuk tanggal yang sudah lewat.',
        'error'
      );
      return;
    }

    // Validasi H-30 khusus Cuti Tahunan
    if (formData.tipe === 'Cuti' && selisihHari < 30) {
      Swal.fire(
        'Gagal!',
        'Pengajuan Cuti tahunan minimal harus dilakukan H-30.',
        'error'
      );
      return;
    }

    if (!userId) {
      Swal.fire('Gagal!', 'Sesi habis, silakan login ulang!', 'error');
      return;
    }

    try {
      const response = await api.post('/cuti/ajukan', {
        id_user: userId,
        ...formData,
      });
      Swal.fire('Berhasil!', response.data.message, 'success');
      fetchSisaCuti(); // Update jatah setelah pengajuan sukses
      setFormData({
        tanggal_mulai: '',
        tanggal_selesai: '',
        alasan: '',
        tipe: 'Cuti',
      });
    } catch (err) {
      Swal.fire(
        'Error',
        err.response?.data?.message || 'Terjadi kesalahan server',
        'error'
      );
    }
  };

  return (
    <div className="pengajuan-container">
      <div className="sisa-cuti-row">
        <div className="sisa-card">
          <p>Total Jatah Tahunan</p>
          <h3 style={{ color: '#0984e3' }}>{sisaCuti.total_jatah} Hari</h3>
        </div>
        <div className="sisa-card taken">
          <p>Cuti Terpakai</p>
          <h3 style={{ color: '#d63031' }}>{sisaCuti.terpakai} Hari</h3>
        </div>
        <div className="sisa-card balance">
          <p>Sisa Jatah Cuti</p>
          <h3 style={{ color: '#00b894' }}>{sisaCuti.sisa_cuti} Hari</h3>
        </div>
      </div>

      <div className="pengajuan-card">
        <h2>Form Pengajuan {formData.tipe}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Tipe Pengajuan</label>
            <select
              name="tipe"
              value={formData.tipe}
              onChange={handleChange}
              className="form-control"
            >
              <option value="Cuti">Cuti Tahunan</option>
              <option value="Izin">Izin (Sakit/Mendesak)</option>
              <option value="Cuti Meninggal">Cuti Meninggal</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
            </select>
          </div>

          <div className="form-group">
            <label>Tanggal Mulai</label>
            <input
              type="date"
              name="tanggal_mulai"
              value={formData.tanggal_mulai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Tanggal Selesai</label>
            <input
              type="date"
              name="tanggal_selesai"
              value={formData.tanggal_selesai}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Alasan / Keterangan</label>
            <textarea
              name="alasan"
              value={formData.alasan}
              onChange={handleChange}
              placeholder="Berikan keterangan singkat..."
              required
            />
          </div>

          <button
            type="submit"
            className="btn-ajukan"
            disabled={formData.tipe === 'Cuti' && sisaCuti.sisa_cuti <= 0}
          >
            {formData.tipe === 'Cuti' && sisaCuti.sisa_cuti <= 0
              ? 'Jatah Habis'
              : `Ajukan ${formData.tipe}`}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PengajuanCuti;
