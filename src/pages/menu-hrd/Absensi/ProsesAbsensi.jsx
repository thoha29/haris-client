import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import './HrdApproval.css';

const ProsesAbsensi = () => {
  const [listUser, setListUser] = useState([]);
  const [idUser, setIdUser] = useState('');
  const [tanggalAwal, setTanggalAwal] = useState('');
  const [tanggalAkhir, setTanggalAkhir] = useState('');
  const [loading, setLoading] = useState(false);

  // Ambil data karyawan untuk dropdown
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get('/api/jadwal/list');
        setListUser(res.data);
      } catch (err) {
        console.error(err);
        Swal.fire('Error', 'Gagal mengambil data karyawan', 'error');
      }
    };

    fetchUser();
  }, []);

  // Handle submit proses
  const handleProses = async (e) => {
    e.preventDefault();

    if (!idUser || !tanggalAwal || !tanggalAkhir) {
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
        id_user: idUser,
      });

      Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: res.data.message || 'Proses absensi berhasil',
      });

      // reset form (optional)
      setIdUser('');
      setTanggalAwal('');
      setTanggalAkhir('');
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
        <h2>Proses Data Absensi</h2>
      </div>

      <form className="form-proses" onSubmit={handleProses}>
        {/* Dropdown Karyawan */}
        <div className="form-group">
          <label>Pilih Karyawan</label>
          <select value={idUser} onChange={(e) => setIdUser(e.target.value)}>
            <option value="">-- Pilih Karyawan --</option>
            {listUser.map((user) => (
              <option key={user.id_user} value={user.id_user}>
                {user.username}
              </option>
            ))}
          </select>
        </div>

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
          {loading ? 'Memproses...' : 'Proses Absensi'}
        </button>
      </form>
    </div>
  );
};

export default ProsesAbsensi;
