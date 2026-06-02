import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
import Swal from 'sweetalert2';
import './HrdApproval.css';
import api from '../../../config/api';

const HrdApproval = () => {
  const [listPending, setListPending] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/absensi/hrd/pending-hrd');
      setListPending(res.data);
    } catch (err) {
      console.error('Error Detail:', err.response);
      const serverMsg = err.response?.data?.error || 'Gagal mengambil data.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const handleAction = async (id, status) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Yakin ingin ${status} absensi ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya',
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put('/absensi/hrd/approve-hrd', {
        id_data_absensi: id,
        status: status,
      });
      Swal.fire('Berhasil!', `Absensi berhasil di-${status}`, 'success');
      fetchPending();
    } catch (err) {
      Swal.fire(
        'Error',
        'Error: ' + (err.response?.data?.error || 'Gagal proses.'),
        'error'
      );
    }
  };

  return (
    <div className="hrd-approval-container">
      <div className="header">
        <h2>Panel Approval & Monitoring Karyawan</h2>
        <button
          onClick={fetchPending}
          className="btn-refresh"
          disabled={loading}
        >
          {loading ? 'Memuat...' : 'Refresh Data'}
        </button>
      </div>

      {error && (
        <div className="error-box">
          <strong>Error:</strong> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="table-wrapper">
          <table className="approval-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tanggal</th>
                <th>Masuk</th>
                <th>Keluar</th>
                <th>Status Atasan</th>
                <th>Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {listPending.length > 0 ? (
                listPending.map((item) => (
                  <tr key={item.id_data_absensi}>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>
                    <td>
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td>{item.jam_masuk}</td>
                    <td>{item.jam_keluar || '--:--'}</td>

                    <td className="text-center">
                      <span className={`badge-status ${item.status_user}`}>
                        {item.status_user
                          ? item.status_user.toUpperCase()
                          : 'N/A'}
                      </span>
                    </td>

                    <td>
                      <div className="action-group">
                        <button
                          onClick={() =>
                            handleAction(item.id_data_absensi, 'approved')
                          }
                          className="btn btn-approve"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() =>
                            handleAction(item.id_data_absensi, 'rejected')
                          }
                          className="btn btn-reject"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    🚫 Tidak ada pengajuan pending.
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

export default HrdApproval;
