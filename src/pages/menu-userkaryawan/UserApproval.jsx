import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UserApproval.css';
import { formatJamMenit } from '../../utils/formatTime';
import Pagination from '../../components/Pagination';

const UserApproval = () => {
  const [listAbsensi, setListAbsensi] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [error, setError] = useState(null);
  const [filterTanggal, setFilterTanggal] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchAllData = useCallback(async () => {
    setError(null);
    try {
      const res = await axios.get(
        'http://localhost:3000/absensi/hrd/pending-user'
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

  useEffect(() => {
    let data = [...listAbsensi];

    if (filterTanggal) {
      data = data.filter((item) => {
        const itemDate = new Date(item.tanggal).toLocaleDateString('en-CA');
        return itemDate === filterTanggal;
      });
    }

    setFilteredData(data);
    setCurrentPage(1);
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
      await axios.put('http://localhost:3000/absensi/hrd/approve-user', {
        id_data_absensi: id,
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

  // Slice paginated data
  const paginatedData = useMemo(() => {
    if (pageSize === 'Semua') return filteredData;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredData.slice(start, start + size);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="hrd-approval-container">
      <div className="header">
        <h2>Monitoring & Persetujuan Atasan (Absensi)</h2>
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
              <th>Tipe Kerja</th>
              <th>Tanggal</th>
              <th>Jam Kerja</th>
              <th>Keterangan</th>
              <th>Status Atasan</th>
              <th>Tindakan</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => {
                const hasCheckedOut =
                  item.jam_keluar &&
                  item.jam_keluar !== '00:00:00' &&
                  item.jam_keluar !== '-';

                return (
                  <tr key={item.id_data_absensi}>
                    <td>
                      <strong>{item.nama}</strong>
                    </td>
                    <td>
                      <span
                        className={`badge ${
                          item.tipe_kerja === 'shift'
                            ? 'bg-warning text-dark'
                            : 'bg-info text-dark'
                        }`}
                      >
                        {item.tipe_kerja
                          ? item.tipe_kerja.toUpperCase()
                          : 'NON-SHIFT'}
                      </span>
                    </td>
                    <td>
                      {new Date(item.tanggal).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      {item.jam_masuk} - {item.jam_keluar || '--:--'}
                    </td>
                    <td>
                      <small className="txt-late">
                        T: {item.keterlambatan}m
                      </small>
                      <br />
                      <small className="txt-overtime">
                        L: {formatJamMenit(item.lembur)}
                      </small>
                    </td>
                    <td>
                      <span className={`badge-status ${item.status_user}`}>
                        {item.status_user.toUpperCase()}
                      </span>
                    </td>
                    <td>
                      {item.status_user === 'pending' ? (
                        <div className="action-group">
                          {!hasCheckedOut && (
                            <span className="badge bg-danger text-white mb-1 d-block">
                              Belum Check-Out
                            </span>
                          )}
                          <button
                            onClick={() =>
                              handleAction(item.id_data_absensi, 'approved')
                            }
                            className="btn btn-approve"
                            disabled={!hasCheckedOut}
                            title={
                              !hasCheckedOut
                                ? 'Tidak dapat disetujui sebelum karyawan Check-Out'
                                : ''
                            }
                          >
                            Setuju
                          </button>
                          <button
                            onClick={() =>
                              handleAction(item.id_data_absensi, 'rejected')
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
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="empty-state">
                  🚫 Tidak ada data yang sesuai filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredData.length}
        pageSize={pageSize}
        onPageChange={(page) => setCurrentPage(page)}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setCurrentPage(1);
        }}
      />
    </div>
  );
};

export default UserApproval;
