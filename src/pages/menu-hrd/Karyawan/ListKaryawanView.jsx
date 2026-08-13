import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import api from '../../../config/api';
import SelectSearch from '../../../components/SelectSearch';
import Pagination from '../../../components/Pagination';
import './ListKaryawanView.css';

const ListKaryawanView = () => {
  const [listKaryawan, setListKaryawan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTipeKerja, setFilterTipeKerja] = useState('');
  const [selectedKaryawan, setSelectedKaryawan] = useState(null);

  const fetchVListKaryawan = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/karyawan/v-list');
      setListKaryawan(res.data || []);
    } catch (err) {
      console.error('Gagal memuat view list karyawan:', err);
      Swal.fire('Error', 'Gagal memuat data karyawan dari database.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVListKaryawan();
  }, []);

  // Helper untuk mengkalkulasi sisa kontrak
  const hitungSisaKontrak = (tglBerakhir) => {
    if (!tglBerakhir) return { text: 'Kontrak Tetap / Tidak Ada Limit', badge: 'bg-info' };
    const end = new Date(tglBerakhir);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isNaN(end.getTime())) return { text: '-', badge: 'bg-secondary' };

    const diffTime = end.getTime() - today.getTime();
    if (diffTime < 0) {
      return { text: 'Kontrak Berakhir (Expired)', badge: 'bg-danger' };
    }

    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (totalDays > 30) {
      const months = Math.floor(totalDays / 30);
      const days = totalDays % 30;
      return {
        text: `${months} Bulan ${days} Hari (${totalDays} hari)`,
        badge: 'bg-success',
      };
    }

    return {
      text: `${totalDays} Hari lagi`,
      badge: totalDays <= 7 ? 'bg-warning text-dark' : 'bg-primary',
    };
  };

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Filter data berdasarkan search & tipe kerja
  const filteredData = useMemo(() => {
    return listKaryawan.filter((item) => {
      const matchSearch =
        (item.nama_lengkap || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nik || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.nip || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.jabatan || '').toLowerCase().includes(searchTerm.toLowerCase());

      const tipeItem = (item.tipe_kerja || 'non-shift').toLowerCase();
      const matchTipe =
        filterTipeKerja === '' || tipeItem === filterTipeKerja.toLowerCase();

      return matchSearch && matchTipe;
    });
  }, [listKaryawan, searchTerm, filterTipeKerja]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterTipeKerja]);

  const paginatedData = useMemo(() => {
    if (pageSize === 'Semua') return filteredData;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredData.slice(start, start + size);
  }, [filteredData, currentPage, pageSize]);

  // Export excel seluruh karyawan
  const handleExportAll = async () => {
    try {
      const response = await api.get('/api/karyawan/export-excel/all', {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'Data_Keseluruhan_Karyawan.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export all error:', err);
      Swal.fire('Error', 'Gagal mendownload Excel keseluruhan karyawan', 'error');
    }
  };

  // Export excel detail 1 karyawan
  const handleExportDetail = async (id_user) => {
    try {
      const response = await api.get(`/api/karyawan/export-excel/detail/${id_user}`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Detail_Karyawan_${id_user}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export detail error:', err);
      Swal.fire('Error', 'Gagal mendownload Excel detail karyawan', 'error');
    }
  };

  const formatDate = (val) => {
    if (!val) return '-';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return val;
      return d.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    } catch {
      return val;
    }
  };

  return (
    <div className="vlist-karyawan-container">
      <div className="vlist-card">
        <div className="vlist-header">
          <div>
            <h2>Daftar Karyawan</h2>
            <p>Data Karyawan PT. Banggai Sentral Sulawesi</p>
          </div>
          <button className="btn-export-all" onClick={handleExportAll}>
            <i className="bi bi-file-earmark-excel-fill me-2"></i>Download Excel (Semua Karyawan)
          </button>
        </div>

        {/* Filter & Search Bar */}
        <div className="vlist-filter-bar">
          <div className="filter-item search-field">
            <label>Cari Karyawan:</label>
            <div className="search-input-box">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Ketik Nama, NIK, NIP, Jabatan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="form-control-custom"
              />
            </div>
          </div>

          <div className="filter-item select-field">
            <label>Filter Tipe Kerja:</label>
            <SelectSearch
              options={[
                { value: '', label: 'Semua Tipe Kerja (Shift & Non-Shift)' },
                { value: 'shift', label: 'Shift' },
                { value: 'non-shift', label: 'Non-Shift' },
              ]}
              value={filterTipeKerja}
              onChange={(e) => setFilterTipeKerja(e.value)}
              placeholder="-- Filter Tipe Kerja --"
              isClearable={true}
            />
          </div>

          <button
            className="btn-reset-filter"
            onClick={() => {
              setSearchTerm('');
              setFilterTipeKerja('');
            }}
          >
            Reset Filter
          </button>
        </div>

        {/* Tabel Simple List Karyawan */}
        <div className="table-responsive">
          <table className="vlist-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>No</th>
                <th>Nama Karyawan</th>
                <th>Sisa Kontrak</th>
                <th>Tipe Kerja</th>
                <th style={{ width: '120px', textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="spinner-border text-primary me-2" role="status"></div>
                    Memuat data karyawan dari `v_listKaryawan`...
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item, idx) => {
                  const sisa = hitungSisaKontrak(item.tanggal_kontrak_berakhir);
                  const displayIndex = pageSize === 'Semua' ? idx + 1 : (currentPage - 1) * Number(pageSize) + idx + 1;
                  return (
                    <tr key={item.id_data_pribadi || idx}>
                      <td>{displayIndex}</td>
                      <td>
                        <div className="fw-bold">{item.nama_lengkap || item.username || '-'}</div>
                        <small className="text-muted">
                          {item.nik ? `NIK: ${item.nik}` : ''} {item.jabatan ? `| ${item.jabatan}` : ''}
                        </small>
                      </td>
                      <td>
                        <span className={`sisa-badge ${sisa.badge}`}>{sisa.text}</span>
                        {item.tanggal_kontrak_berakhir && (
                          <div className="text-muted small mt-1">
                            s/d {formatDate(item.tanggal_kontrak_berakhir)}
                          </div>
                        )}
                      </td>
                      <td>
                        <span
                          className={`tipe-badge ${(item.tipe_kerja || 'non-shift')
                            .toLowerCase()
                            .replace('-', '')}`}
                        >
                          {(item.tipe_kerja || 'NON-SHIFT').toUpperCase()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="btn-lihat-detail"
                          onClick={() => setSelectedKaryawan(item)}
                          title="Lihat detail lengkap karyawan"
                        >
                          <i className="bi bi-eye-fill me-1"></i> Lihat
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">
                    Tidak ada data karyawan yang cocok dengan pencarian / filter.
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

      {/* Modal Detail Karyawan */}
      {selectedKaryawan && (
        <div className="vlist-modal-backdrop" onClick={() => setSelectedKaryawan(null)}>
          <div className="vlist-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="vlist-modal-header">
              <h3>
                <i className="bi bi-person-badge-fill me-2"></i>Detail Karyawan: {selectedKaryawan.nama_lengkap || selectedKaryawan.username}
              </h3>
              <button className="btn-close-modal" onClick={() => setSelectedKaryawan(null)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="vlist-modal-body">
              {/* Profile Bar */}
              <div className="modal-profile-card">
                <div className="avatar-big">
                  {(selectedKaryawan.nama_lengkap || selectedKaryawan.username || 'K').charAt(0).toUpperCase()}
                </div>
                <div>
                  <h4>{selectedKaryawan.nama_lengkap || selectedKaryawan.username}</h4>
                  <p className="mb-0 text-muted">
                    {selectedKaryawan.jabatan || 'Staf'} ({selectedKaryawan.divisi || 'Umum'})
                  </p>
                  <div className="mt-1">
                    <span className="badge bg-secondary me-2">Role: {selectedKaryawan.role || '-'}</span>
                    <span className="badge bg-primary me-2">Tipe: {(selectedKaryawan.tipe_kerja || 'NON-SHIFT').toUpperCase()}</span>
                    <span className="badge bg-success">Status: {selectedKaryawan.status_karyawan || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Grid 33 Fields */}
              <div className="detail-grid">
                <div className="detail-section-title">Identitas & Kepegawaian</div>
                <div className="detail-item"><span className="label">ID Data Pribadi:</span> <span className="val">{selectedKaryawan.id_data_pribadi || '-'}</span></div>
                <div className="detail-item"><span className="label">ID User:</span> <span className="val">{selectedKaryawan.id_user || '-'}</span></div>
                <div className="detail-item"><span className="label">NIK:</span> <span className="val">{selectedKaryawan.nik || '-'}</span></div>
                <div className="detail-item"><span className="label">NIP:</span> <span className="val">{selectedKaryawan.nip || '-'}</span></div>
                <div className="detail-item"><span className="label">Nama Lengkap:</span> <span className="val">{selectedKaryawan.nama_lengkap || '-'}</span></div>
                <div className="detail-item"><span className="label">Username:</span> <span className="val">{selectedKaryawan.username || '-'}</span></div>
                <div className="detail-item"><span className="label">Jabatan:</span> <span className="val">{selectedKaryawan.jabatan || '-'}</span></div>
                <div className="detail-item"><span className="label">Divisi:</span> <span className="val">{selectedKaryawan.divisi || '-'}</span></div>
                <div className="detail-item"><span className="label">Tipe Kerja:</span> <span className="val">{(selectedKaryawan.tipe_kerja || 'NON-SHIFT').toUpperCase()}</span></div>
                <div className="detail-item"><span className="label">Status Karyawan:</span> <span className="val">{selectedKaryawan.status_karyawan || '-'}</span></div>

                <div className="detail-section-title">Kontrak & Penempatan</div>
                <div className="detail-item"><span className="label">Tanggal Masuk:</span> <span className="val">{formatDate(selectedKaryawan.tanggal_masuk)}</span></div>
                <div className="detail-item"><span className="label">Tanggal Kontrak Berakhir:</span> <span className="val">{formatDate(selectedKaryawan.tanggal_kontrak_berakhir)}</span></div>
                <div className="detail-item"><span className="label">Atasan Langsung:</span> <span className="val">{selectedKaryawan.atasan_langsung || '-'}</span></div>
                <div className="detail-item"><span className="label">Nama Atasan:</span> <span className="val">{selectedKaryawan.nama_atasan || '-'}</span></div>
                <div className="detail-item"><span className="label">Lokasi Proyek:</span> <span className="val">{selectedKaryawan.lokasi_proyek || '-'}</span></div>
                <div className="detail-item"><span className="label">Lokasi Kerja:</span> <span className="val">{selectedKaryawan.lokasi_kerja || '-'}</span></div>

                <div className="detail-section-title">Biodata & Alamat</div>
                <div className="detail-item"><span className="label">Tempat Lahir:</span> <span className="val">{selectedKaryawan.tempat_lahir || '-'}</span></div>
                <div className="detail-item"><span className="label">Tanggal Lahir:</span> <span className="val">{formatDate(selectedKaryawan.tanggal_lahir)}</span></div>
                <div className="detail-item"><span className="label">Jenis Kelamin:</span> <span className="val">{selectedKaryawan.jenis_kelamin === 'L' ? 'Laki-laki' : selectedKaryawan.jenis_kelamin === 'P' ? 'Perempuan' : selectedKaryawan.jenis_kelamin || '-'}</span></div>
                <div className="detail-item"><span className="label">Agama:</span> <span className="val">{selectedKaryawan.agama || '-'}</span></div>
                <div className="detail-item"><span className="label">Status Perkawinan:</span> <span className="val">{selectedKaryawan.status_perkawinan || '-'}</span></div>
                <div className="detail-item"><span className="label">Kewarganegaraan:</span> <span className="val">{selectedKaryawan.kewarganegaraan || '-'}</span></div>
                <div className="detail-item full-width"><span className="label">Alamat:</span> <span className="val">{selectedKaryawan.alamat || '-'}</span></div>

                <div className="detail-section-title">Pendidikan & Kontak</div>
                <div className="detail-item"><span className="label">Jenjang Pendidikan:</span> <span className="val">{selectedKaryawan.jenjang_pendidikan || '-'}</span></div>
                <div className="detail-item"><span className="label">Institusi:</span> <span className="val">{selectedKaryawan.institusi || '-'}</span></div>
                <div className="detail-item"><span className="label">Jurusan:</span> <span className="val">{selectedKaryawan.jurusan || '-'}</span></div>
                <div className="detail-item"><span className="label">Tahun Lulus:</span> <span className="val">{selectedKaryawan.tahun_lulus || '-'}</span></div>
                <div className="detail-item"><span className="label">No HP:</span> <span className="val">{selectedKaryawan.no_hp || '-'}</span></div>
                <div className="detail-item"><span className="label">Email:</span> <span className="val">{selectedKaryawan.email || '-'}</span></div>
                <div className="detail-item"><span className="label">Jatah Cuti:</span> <span className="val">{selectedKaryawan.jatah_cuti !== undefined ? `${selectedKaryawan.jatah_cuti} Hari` : '-'}</span></div>
                <div className="detail-item"><span className="label">ID Skema Gaji:</span> <span className="val">{selectedKaryawan.id_skemagaji || '-'}</span></div>
              </div>
            </div>

            <div className="vlist-modal-footer">
              <button
                className="btn-download-detail-excel"
                onClick={() => handleExportDetail(selectedKaryawan.id_user)}
              >
                <i className="bi bi-file-earmark-excel-fill me-2"></i>Download Excel (Karyawan Ini)
              </button>
              <button className="btn-secondary-custom" onClick={() => setSelectedKaryawan(null)}>
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ListKaryawanView;
