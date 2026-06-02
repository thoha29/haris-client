import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './ApprovalGaji.css';

const ApprovalGaji = () => {
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);

  const namaBulan = [
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

  const fetchRiwayat = async () => {
    try {
      setLoading(true);
      const res = await axios.get('https://api1.ptbss.id/api/gaji/all');
      setRiwayat(res.data);
    } catch (err) {
      console.error('Gagal ambil seluruh data gaji:', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRiwayat();
  }, []);

  const handleUpdateStatus = async (id_slip, newStatus) => {
    try {
      await axios.put(`https://api1.ptbss.id/api/gaji/status/${id_slip}`, {
        status_bayar: newStatus,
      });
      Swal.fire('Berhasil!', 'Status gaji berhasil diperbarui.', 'success');
      fetchRiwayat(); // Refresh data
    } catch (error) {
      Swal.fire('Error', 'Gagal memperbarui status gaji', 'error');
    }
  };

  const handleDelete = async (id_slip) => {
    const result = await Swal.fire({
      title: 'Hapus Data Gaji?',
      text: 'Data ini akan dihapus permanen dan tidak bisa dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://api1.ptbss.id/api/gaji/hapus/${id_slip}`);
        Swal.fire('Terhapus!', 'Data gaji berhasil dihapus.', 'success');
        fetchRiwayat();
      } catch (error) {
        Swal.fire(
          'Error',
          error.response?.data?.error || 'Gagal menghapus data gaji.',
          'error'
        );
      }
    }
  };

  return (
    <div className="history-page-wrapper">
      <div className="history-header-simple">
        <h1>Approval Gaji Karyawan</h1>
        <p>Ubah status gaji karyawan (Pending / Paid)</p>
      </div>

      {loading ? (
        <div
          className="loading-container"
          style={{ textAlign: 'center', padding: '50px' }}
        >
          <p>Sedang memuat data gaji...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Nama Karyawan</th>
                <th>Periode/Tahun</th>
                <th>Gaji Bersih</th>
                <th>Status Bayar</th>
                <th>Aksi Ubah Status</th>
                <th>Aksi Hapus</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((h) => (
                  <tr key={h.id_slip}>
                    <td>
                      <strong>{h.nama_lengkap || h.username}</strong>
                    </td>
                    <td>
                      {namaBulan[h.bulan - 1]} {h.tahun}
                    </td>
                    <td className="td-net">
                      <strong>
                        Rp {Number(h.gaji_bersih).toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          h.status_bayar === 'paid'
                            ? 'status-paid'
                            : 'status-pending'
                        }`}
                      >
                        {h.status_bayar.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      <select
                        value={h.status_bayar}
                        onChange={(e) =>
                          handleUpdateStatus(h.id_slip, e.target.value)
                        }
                        className="status-dropdown"
                      >
                        <option value="pending">Pending</option>
                        <option value="paid">Paid</option>
                      </select>
                    </td>
                    <td>
                      <button
                        onClick={() => handleDelete(h.id_slip)}
                        style={{
                          backgroundColor: '#e74c3c',
                          color: 'white',
                          border: 'none',
                          padding: '8px 12px',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: 'bold',
                        }}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    Belum ada data gaji tersedia.
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

export default ApprovalGaji;
