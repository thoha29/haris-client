import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UserApproval.css';

const UserApprovalLembur = () => {
  const [listAbsensi, setListAbsensi] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);

  // Hanya menyisakan filter tanggal sesuai permintaan terakhir
  const [filterTanggal, setFilterTanggal] = useState('');

  const fetchAllData = useCallback(async () => {
    setError(null);
    try {
      const res = await axios.get(
        'http://localhost:3000/absensi-lembur/hrd/pending-user'
      );
      setListAbsensi(res.data);
      setFilteredData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Gagal mengambil data.');
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Logika Filter Presisi
  useEffect(() => {
    let data = [...listAbsensi];

    if (filterTanggal) {
      data = data.filter((item) => {
        // Konversi tanggal database ke format YYYY-MM-DD
        const itemDate = new Date(item.tanggal).toLocaleDateString('en-CA');
        return itemDate === filterTanggal;
      });
    }

    setFilteredData(data);
  }, [filterTanggal, listAbsensi]);

  const handleAction = async (id, status) => {
    const actionText = status === 'approved' ? 'MENYETUJUI' : 'MENOLAK';
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Yakin ingin ${actionText} absensi ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;

    try {
      await axios.put('http://localhost:3000/absensi-lembur/hrd/approve-user', {
        id_absensi_lembur: id,
        status: status,
      });
      Swal.fire(
        status === 'approved' ? 'Disetujui!' : 'Ditolak!',
        status === 'approved' ? 'Berhasil disetujui!' : 'Absensi ditolak.',
        'success'
      );
      fetchAllData();
    } catch (err) {
      Swal.fire(
        'Gagal',
        'Gagal proses: ' + (err.response?.data?.error || err.message),
        'error'
      );
    }
  };

  return (
    <div className="hrd-approval-container">
      <div className="header">
        <h2>Monitoring & Persetujuan Atasan</h2>
        <div className="filter-group">
          <input
            type="date"
            value={filterTanggal}
            className="filter-input"
            onChange={(e) => setFilterTanggal(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="error-box">{error}</div>}

      <div className="table-wrapper">
        <table className="approval-table">
          <thead>
            <tr>
              <th>Karyawan</th>
              <th>Tanggal</th>
              <th>Jam Kerja</th>
              <th>Keterangan</th>
              <th>Status Atasan</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.length > 0 ? (
              filteredData.map((item) => (
                <tr key={item.id_absensi_lembur}>
                  <td>
                    <strong>{item.nama}</strong>
                  </td>
                  <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                  <td>
                    {item.jam_masuk} - {item.jam_keluar || '--:--'}
                  </td>
                  <td>
                    <small className="txt-late">T: {item.keterlambatan}m</small>
                    <br />
                    <small className="txt-overtime">L: {item.lembur} Jam</small>
                  </td>
                  <td>
                    <span className={`badge-status ${item.status_user}`}>
                      {item.status_user.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    {item.status_user === 'pending' ? (
                      <div className="action-group">
                        <button
                          onClick={() =>
                            handleAction(item.id_absensi_lembur, 'approved')
                          }
                          className="btn btn-approve"
                        >
                          Setuju
                        </button>
                        <button
                          onClick={() =>
                            handleAction(item.id_absensi_lembur, 'rejected')
                          }
                          className="btn btn-reject"
                        >
                          Tolak
                        </button>
                      </div>
                    ) : (
                      <span className="status-done">SELESAI</span>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="empty-state">
                  🚫 Tidak ada data yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserApprovalLembur;
