import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import './UserApprovalRiwayat.css';
import Pagination from '../../components/Pagination';
import SelectSearch from '../../components/SelectSearch';

const UserApprovalRiwayat = () => {
  const [activeTab, setActiveTab] = useState('absensi'); // 'absensi', 'lembur', 'cuti'
  const [dataList, setDataList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipeKerja, setFilterTipeKerja] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let endpoint = 'http://localhost:3000/absensi/hrd/riwayat-user';
      if (activeTab === 'lembur') {
        endpoint = 'http://localhost:3000/absensi-lembur/hrd/riwayat-user';
      } else if (activeTab === 'cuti') {
        endpoint = 'http://localhost:3000/cuti/riwayat-user';
      }
      const res = await axios.get(endpoint);
      setDataList(res.data);
    } catch (err) {
      console.error('Gagal fetch riwayat approval:', err);
      setDataList([]);
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    fetchData();
    setCurrentPage(1);
  }, [fetchData]);

  const filteredData = useMemo(() => {
    return dataList.filter((item) => {
      const name = item.nama || item.nama_karyawan || '';
      const matchSearch = name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchTipe = filterTipeKerja
        ? (item.tipe_kerja || 'non-shift') === filterTipeKerja
        : true;
      return matchSearch && matchTipe;
    });
  }, [dataList, searchTerm, filterTipeKerja]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipeKerja]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'Semua') return filteredData;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredData.slice(start, start + size);
  }, [filteredData, currentPage, pageSize]);

  return (
    <div className="user-approval-riwayat-container">
      <div className="riwayat-header">
        <h2>Riwayat Approval Atasan</h2>
        <p>Daftar seluruh pengajuan absensi, lembur, dan cuti/izin yang telah diproses oleh Atasan</p>
      </div>

      {/* Navigation Tabs */}
      <div className="riwayat-tabs">
        <button
          className={`tab-btn ${activeTab === 'absensi' ? 'active' : ''}`}
          onClick={() => setActiveTab('absensi')}
        >
          <i className="bi bi-calendar-check me-2"></i> Riwayat Absensi
        </button>
        <button
          className={`tab-btn ${activeTab === 'lembur' ? 'active' : ''}`}
          onClick={() => setActiveTab('lembur')}
        >
          <i className="bi bi-clock-history me-2"></i> Riwayat Absensi Lembur
        </button>
        <button
          className={`tab-btn ${activeTab === 'cuti' ? 'active' : ''}`}
          onClick={() => setActiveTab('cuti')}
        >
          <i className="bi bi-journal-check me-2"></i> Riwayat Cuti / Izin
        </button>
      </div>

      {/* Filter Header */}
      <div className="riwayat-filter-bar">
        <div className="filter-item">
          <label>Cari Karyawan:</label>
          <input
            type="text"
            className="filter-input"
            placeholder="Cari nama karyawan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-item" style={{ minWidth: '180px' }}>
          <label>Tipe Kerja:</label>
          <SelectSearch
            options={[
              { value: '', label: 'Semua Tipe Kerja' },
              { value: 'non-shift', label: 'Non-Shift' },
              { value: 'shift', label: 'Shift' },
            ]}
            value={filterTipeKerja}
            onChange={(e) => setFilterTipeKerja(e.value)}
            placeholder="Semua Tipe Kerja"
            isClearable={true}
          />
        </div>
      </div>

      {/* Table Content */}
      <div className="table-responsive">
        <table className="riwayat-table">
          <thead>
            {activeTab === 'cuti' ? (
              <tr>
                <th>Karyawan</th>
                <th>Tipe Kerja</th>
                <th>Tipe Izin</th>
                <th>Tanggal Periode</th>
                <th>Alasan</th>
                <th>Status Atasan</th>
                <th>Status Final HRD</th>
              </tr>
            ) : (
              <tr>
                <th>Karyawan</th>
                <th>Tipe Kerja</th>
                <th>Tanggal</th>
                <th>Jam Masuk - Keluar</th>
                <th>Keterangan</th>
                {activeTab === 'lembur' && <th>Jenis Lembur</th>}
                <th>Status Atasan</th>
                <th>Status Final</th>
              </tr>
            )}
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="text-center py-4">Memuat data riwayat...</td>
              </tr>
            ) : paginatedData.length > 0 ? (
              paginatedData.map((item, idx) => {
                const isCuti = activeTab === 'cuti';
                const isLembur = activeTab === 'lembur';

                return (
                  <tr key={item.id_data_absensi || item.id_absensi_lembur || item.id_cuti || idx}>
                    <td>
                      <strong>{item.nama || item.nama_karyawan}</strong>
                    </td>
                    <td>
                      <span className={`badge ${item.tipe_kerja === 'shift' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {item.tipe_kerja ? item.tipe_kerja.toUpperCase() : 'NON-SHIFT'}
                      </span>
                    </td>

                    {isCuti ? (
                      <>
                        <td>
                          <span className={`type-badge type-${(item.tipe || '').toLowerCase().replace(/\s+/g, '-')}`}>
                            {item.tipe}
                          </span>
                        </td>
                        <td>
                          <small>
                            {new Date(item.tanggal_mulai).toLocaleDateString('id-ID')} - {new Date(item.tanggal_selesai).toLocaleDateString('id-ID')}
                          </small>
                        </td>
                        <td>{item.alasan}</td>
                        <td>
                          <span className={`badge ${item.status_user === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                            {(item.status_user || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${item.status_hrd === 'approved' ? 'bg-success' : item.status_hrd === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>
                            {(item.status_hrd || item.status || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{new Date(item.tanggal).toLocaleDateString('id-ID')}</td>
                        <td>
                          {item.jam_masuk} - {item.jam_keluar || '--:--'}
                        </td>
                        <td>
                          <small className="text-muted">T: {item.keterlambatan || 0}m | L: {item.lembur || 0}j</small>
                        </td>
                        {isLembur && (
                          <td>
                            <span className={`badge ${item.id_skema === 0 ? 'bg-success' : 'bg-primary'}`}>
                              {item.id_skema === 0 ? 'HARI KERJA' : 'HARI LIBUR'}
                            </span>
                          </td>
                        )}
                        <td>
                          <span className={`badge ${item.status_user === 'approved' ? 'bg-success' : 'bg-danger'}`}>
                            {(item.status_user || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${item.is_approved === 'approved' ? 'bg-success' : item.is_approved === 'rejected' ? 'bg-danger' : 'bg-secondary'}`}>
                            {(item.is_approved || item.status || 'PENDING').toUpperCase()}
                          </span>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="text-center py-4 text-muted">
                  🚫 Belum ada riwayat approval.
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

export default UserApprovalRiwayat;
