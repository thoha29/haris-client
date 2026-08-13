import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import SelectSearch from '../../../components/SelectSearch';
import Pagination from '../../../components/Pagination';
import './HrdRiwayatPengajuanCuti.css';

const HrdRiwayatPengajuanCuti = () => {
  const [listCuti, setListCuti] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');

  // Ambil SELURUH data cuti (select * from cuti)
  const fetchAllCutiHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/cuti/riwayat-semua');
      setListCuti(res.data || []);
    } catch (err) {
      console.error('Gagal mengambil riwayat cuti HRD:', err);
      Swal.fire('Error', 'Gagal memuat data riwayat cuti.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCutiHistory();
  }, []);

  const hitungDurasi = (mulai, selesai) => {
    if (!mulai || !selesai) return 0;
    const tgl1 = new Date(mulai);
    const tgl2 = new Date(selesai);
    const diffTime = Math.abs(tgl2 - tgl1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const filteredData = useMemo(() => {
    return listCuti.filter((item) => {
      const matchName = (item.nama_karyawan || '')
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
        (item.alasan || '').toLowerCase().includes(searchTerm.toLowerCase());

      const matchType = selectedType === '' || item.tipe === selectedType;
      const matchStatus =
        selectedStatus === '' ||
        (item.status || 'pending').toLowerCase() === selectedStatus.toLowerCase();

      return matchName && matchType && matchStatus;
    });
  }, [listCuti, searchTerm, selectedType, selectedStatus]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType, selectedStatus]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'Semua') return filteredData;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredData.slice(start, start + size);
  }, [filteredData, currentPage, pageSize]);

  // Handle perubahan status ke 'pending', 'approved', atau 'rejected'
  const handleUpdateStatus = async (id_cuti, statusBaru) => {
    const statusLabel = statusBaru.toUpperCase();
    const result = await Swal.fire({
      title: 'Ubah Status Pengajuan',
      text: `Apakah Anda yakin ingin mengubah status pengajuan cuti ini menjadi '${statusLabel}'?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: statusBaru === 'approved' ? '#198754' : statusBaru === 'rejected' ? '#dc3545' : '#ffc107',
      cancelButtonColor: '#6c757d',
      confirmButtonText: `Ya, Ubah ke ${statusLabel}`,
      cancelButtonText: 'Batal',
    });

    if (!result.isConfirmed) return;

    try {
      await api.put('/cuti/update-status-global', {
        id_cuti: id_cuti,
        status: statusBaru,
      });

      Swal.fire(
        'Berhasil!',
        `Status pengajuan cuti telah diperbarui menjadi: ${statusLabel}`,
        'success'
      );
      fetchAllCutiHistory();
    } catch (err) {
      console.error('Gagal update status cuti:', err);
      Swal.fire(
        'Error',
        'Gagal memperbarui status: ' + (err.response?.data?.error || err.message),
        'error'
      );
    }
  };

  return (
    <div className="hrd-riwayat-cuti-container">
      <div className="hrd-cuti-card">
        <div className="hrd-cuti-header">
          <div>
            <h2><i className="bi bi-calendar-check-fill me-2"></i>Riwayat Pengajuan Cuti (HRD)</h2>
            <p>Kelola dan update status seluruh riwayat pengajuan cuti & izin karyawan</p>
          </div>
        </div>

        {/* Filter Row dengan SelectSearch */}
        <div className="cuti-filter-row">
          <div className="filter-group search-group">
            <label>Cari Karyawan / Alasan:</label>
            <input
              type="text"
              placeholder="Ketik nama atau alasan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input-text"
            />
          </div>

          <div className="filter-group select-group">
            <label>Filter Tipe Cuti:</label>
            <SelectSearch
              options={[
                { value: '', label: 'Semua Tipe Cuti' },
                { value: 'Cuti Tahunan', label: 'Cuti Tahunan' },
                { value: 'Izin', label: 'Izin' },
                { value: 'Sakit', label: 'Sakit' },
                { value: 'Cuti Meninggal', label: 'Cuti Meninggal' },
                { value: 'Cuti Melahirkan', label: 'Cuti Melahirkan' },
              ]}
              value={selectedType}
              onChange={(e) => setSelectedType(e.value)}
              placeholder="-- Pilih Tipe --"
              isClearable={true}
            />
          </div>

          <div className="filter-group select-group">
            <label>Filter Status:</label>
            <SelectSearch
              options={[
                { value: '', label: 'Semua Status' },
                { value: 'pending', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.value)}
              placeholder="-- Pilih Status --"
              isClearable={true}
            />
          </div>

          <button
            className="btn-reset-cuti"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
              setSelectedStatus('');
            }}
          >
            Reset Filter
          </button>
        </div>

        {/* Tabel Riwayat Cuti */}
        <div className="table-responsive">
          <table className="hrd-cuti-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>No</th>
                <th>Karyawan</th>
                <th>Tipe</th>
                <th>Periode & Durasi</th>
                <th>Alasan</th>
                <th>Status Saat Ini</th>
                <th style={{ textAlign: 'center', width: '260px' }}>Edit Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">
                    <div className="spinner-border text-primary me-2" role="status"></div>
                    Memuat seluruh data pengajuan cuti...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const currentStatus = (item.status || 'pending').toLowerCase();
                  const displayIndex = pageSize === 'Semua' ? idx + 1 : (currentPage - 1) * Number(pageSize) + idx + 1;
                  return (
                    <tr key={item.id_cuti || idx}>
                      <td>{displayIndex}</td>
                      <td className="emp-name">{item.nama_karyawan || item.id_user}</td>
                      <td>
                        <span className="badge-tipe-cuti">{item.tipe}</span>
                      </td>
                      <td>
                        <strong>{hitungDurasi(item.tanggal_mulai, item.tanggal_selesai)} Hari</strong>
                        <br />
                        <small className="text-muted">
                          {formatDate(item.tanggal_mulai)} s/d {formatDate(item.tanggal_selesai)}
                        </small>
                      </td>
                      <td className="reason-cell">{item.alasan || '-'}</td>
                      <td>
                        <span className={`status-badge-pill status-${currentStatus}`}>
                          {currentStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="action-buttons-cell">
                        <div className="btn-group-status">
                          <button
                            className={`btn-enum btn-enum-pending ${currentStatus === 'pending' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(item.id_cuti, 'pending')}
                            title="Set Status Pending"
                          >
                            Pending
                          </button>
                          <button
                            className={`btn-enum btn-enum-approved ${currentStatus === 'approved' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(item.id_cuti, 'approved')}
                            title="Set Status Approved"
                          >
                            Approve
                          </button>
                          <button
                            className={`btn-enum btn-enum-rejected ${currentStatus === 'rejected' ? 'active' : ''}`}
                            onClick={() => handleUpdateStatus(item.id_cuti, 'rejected')}
                            title="Set Status Rejected"
                          >
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">
                    Tidak ada pengajuan cuti yang ditemukan.
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
    </div>
  );
};

export default HrdRiwayatPengajuanCuti;
