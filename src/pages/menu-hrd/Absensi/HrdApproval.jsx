import React, { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
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
     const res = await api.get('/absensi');
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





  return (
    <div className="hrd-approval-container">
      <div className="header">
       <h2>Monitoring Absensi Karyawan</h2>
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
              <th>Status Approval</th>
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
                    <span className={`badge-status ${item.is_approved}`}>
                      {item.is_approved
                        ? item.is_approved.toUpperCase()
                        : 'N/A'}
                    </span>
                  </td>

     
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
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
