import React, { useState } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import { useNavigate } from 'react-router-dom';
import './HrdApproval.css';

const ProsesAbsensi = () => {
  // const [listUser, setListUser] = useState([]);
  const navigate = useNavigate();
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil data karyawan untuk dropdown
  // useEffect(() => {
  //   const fetchUser = async () => {
  //     try {
  //       const res = await api.get('/api/jadwal/list');
  //       setListUser(res.data);
  //     } catch (err) {
  //       console.error(err);
  //       Swal.fire('Error', 'Gagal mengambil data karyawan', 'error');
  //     }
  //   };

  //   fetchUser();
  // }, []);

  // Handle submit proses
  const handleProses = async (e) => {
    e.preventDefault();

    if (!tanggalAwal || !tanggalAkhir) {
      return Swal.fire('Warning', 'Semua field wajib diisi', 'warning');
    }

    if (tanggalAwal > tanggalAkhir) {
      return Swal.fire(
        'Warning',
        'Tanggal awal tidak boleh lebih besar',
        'warning'
      );
    }

    setLoading(true);

    try {
      const res = await api.post('/absensi/proses-absensi', {
        tanggal: tanggalAwal,
        tanggal_keluar: tanggalAkhir,
      });

      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: res.data.message || 'Proses absensi berhasil',
        timer: 1500,
        showConfirmButton: false,
      });

      // Setelah SweetAlert selesai, pindah halaman
      navigate('/Daftar-Gaji');
    } catch (err) {
      console.error(err);

      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Terjadi kesalahan',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hrd-approval-container">
      <div className="header">
        <h2>Proses Data Gaji</h2>
      </div>

      <form className="form-proses" onSubmit={handleProses}>
        {/* Tanggal Awal */}
        <div className="form-group">
          <label>Tanggal Awal</label>
          <input
            type="date"
            value={tanggalAwal}
            onChange={(e) => setTanggalAwal(e.target.value)}
          />
        </div>

        {/* Tanggal Akhir */}
        <div className="form-group">
          <label>Tanggal Akhir</label>
          <input
            type="date"
            value={tanggalAkhir}
            onChange={(e) => setTanggalAkhir(e.target.value)}
          />
        </div>

        {/* Button */}
        <button
          type="submit"
          className="btn btn-success w-100"
          disabled={loading}
        >
          {loading ? 'Memproses...' : 'Proses Data'}
        </button>
      </form>
    </div>
  );
};

export default ProsesAbsensi;
