import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UserApprovalCuti.css';
import SelectSearch from '../../components/SelectSearch';
import Pagination from '../../components/Pagination';

const UserApprovalCuti = () => {
  const [listPengajuan, setListPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchPendingUser = async () => {
    try {
      const res = await axios.get('http://localhost:3000/cuti/pending-user');
      setListPengajuan(res.data);
    } catch (err) {
      console.error('Gagal ambil data pengajuan atasan:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUser();
  }, []);

  const handleAction = async (id, status) => {
    const actionText = status === 'approved' ? 'MENYETUJUI' : 'MENOLAK';
    const result = await Swal.fire({
      title: 'Konfirmasi Atasan',
      text: `Apakah Anda yakin ingin ${actionText} pengajuan ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#00b894',
      cancelButtonColor: '#d63031',
      confirmButtonText: 'Ya, Proses!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.put('http://localhost:3000/cuti/approve-user', {
          id_cuti: id,
          status: status,
        });

        Swal.fire({
          title: 'Berhasil!',
          text: `Pengajuan berhasil di-${status === 'approved' ? 'setujui' : 'tolak'}.`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        });

        fetchPendingUser();
      } catch (err) {
        Swal.fire('Gagal!', 'Terjadi kesalahan sistem.', 'error');
      }
    }
  };

  const filteredData = useMemo(() => {
    return listPengajuan.filter((item) => {
      const matchSearch = item.nama_karyawan
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchType = selectedType ? item.tipe === selectedType : true;
      return matchSearch && matchType;
    });
  }, [listPengajuan, searchTerm, selectedType]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedType]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'Semua') return filteredData;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredData.slice(start, start + size);
  }, [filteredData, currentPage, pageSize]);

  const hitungDurasi = (tglMulai, tglSelesai) => {
    const start = new Date(tglMulai);
    const end = new Date(tglSelesai);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  return (
    <div className="hrd-container">
      <div className="hrd-card">
        <div className="hrd-header">
          <h2>Approval Pengajuan Cuti & Izin (Atasan)</h2>
          <p>Persetujuan tahap pertama oleh Atasan Langsung</p>
        </div>

        <div className="filter-container">
          <div className="filter-group">
            <label>Cari Nama:</label>
            <input
              type="text"
              placeholder="Ketik nama..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="filter-input"
            />
          </div>
          <div className="filter-group" style={{ minWidth: '200px' }}>
            <label>Tipe:</label>
            <SelectSearch
              options={[
                { value: '', label: 'Semua Tipe' },
                { value: 'Cuti', label: 'Cuti Tahunan' },
                { value: 'Izin', label: 'Izin' },
                { value: 'Cuti Meninggal', label: 'Cuti Meninggal' },
                { value: 'Cuti Melahirkan', label: 'Cuti Melahirkan' },
              ]}
              value={selectedType}
              onChange={(e) => setSelectedType(e.value)}
              placeholder="Semua Tipe"
              isClearable={true}
            />
          </div>
          <button
            className="btn-reset"
            onClick={() => {
              setSearchTerm('');
              setSelectedType('');
            }}
          >
            Reset Filter
          </button>
        </div>

        <div className="table-responsive">
          <table className="hrd-table">
            <thead>
              <tr>
                <th>Karyawan</th>
                <th>Tipe Kerja</th>
                <th>Tipe</th>
                <th>Durasi</th>
                <th>Alasan</th>
                <th>Status/Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id_cuti}>
                    <td className="emp-name">{item.nama_karyawan}</td>
                    <td>
                      <span className={`badge ${item.tipe_kerja === 'shift' ? 'bg-warning text-dark' : 'bg-info text-dark'}`}>
                        {item.tipe_kerja ? item.tipe_kerja.toUpperCase() : 'NON-SHIFT'}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`type-badge type-${item.tipe
                          .toLowerCase()
                          .replace(/\s+/g, '-')}`}
                      >
                        {item.tipe}
                      </span>
                    </td>
                    <td className="text-center">
                      <strong>
                        {hitungDurasi(item.tanggal_mulai, item.tanggal_selesai)}{' '}
                        Hari
                      </strong>
                      <br />
                      <small>
                        {new Date(item.tanggal_mulai).toLocaleDateString(
                          'id-ID'
                        )}{' '}
                        -{' '}
                        {new Date(item.tanggal_selesai).toLocaleDateString(
                          'id-ID'
                        )}
                      </small>
                    </td>
                    <td className="reason-cell">{item.alasan}</td>
                    <td className="action-buttons">
                      {item.status_user && item.status_user !== 'pending' ? (
                        <span className={`status-label ${item.status_user}`}>
                          {item.status_user === 'approved'
                            ? '✅ Disetujui Atasan'
                            : '❌ Ditolak Atasan'}
                        </span>
                      ) : (
                        <>
                          <button
                            className="btn-acc"
                            onClick={() =>
                              handleAction(item.id_cuti, 'approved')
                            }
                          >
                            Setuju
                          </button>
                          <button
                            className="btn-reject"
                            onClick={() =>
                              handleAction(item.id_cuti, 'rejected')
                            }
                          >
                            Tolak
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center empty-state">
                    Belum ada pengajuan yang membutuhkan persetujuan.
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

export default UserApprovalCuti;
