import React, { useState, useEffect, useCallback } from 'react';
import './HrdApproval.css';
import api from '../../../config/api';

const HrdApproval = () => {
  const [listData, setListData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/absensi/hrd/pending-hrd');
      setListData(res.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          'Gagal mengambil data monitoring.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  };

  return (
    <div className="hrd-approval-container">
      <div className="header">
        <h2>Monitoring Approval Absensi</h2>

        <button
          onClick={fetchData}
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
                <th>Jam Masuk</th>
                <th>Jam Keluar</th>
                <th>Status USER</th>
              </tr>
            </thead>

            <tbody>
              {listData.length > 0 ? (
                listData.map((item) => (
                  <tr key={item.id_data_absensi}>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>

                    <td>
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>

                    <td>{item.jam_masuk}</td>

                    <td>{item.jam_keluar || '--:--'}</td>

                    <td>
                      <span
                        className={`badge-status ${getBadgeClass(
                          item.status_user
                        )}`}
                      >
                        {item.status_user?.toUpperCase() || 'PENDING'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="empty-state">
                    Tidak ada data absensi.
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
