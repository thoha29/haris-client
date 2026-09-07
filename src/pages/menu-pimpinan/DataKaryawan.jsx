import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './DataKaryawan.css';
import SelectSearch from '../../components/SelectSearch';
import Pagination from '../../components/Pagination';

const DataKaryawan = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [skemaGajiList, setSkemaGajiList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'karyawan',
    jatah_cuti: 12,
    id_skemagaji: '',
  });
  const [editId, setEditId] = useState(null);

  const API_URL = 'http://localhost:3000/api/karyawan';
  const SKEMA_URL = 'http://localhost:3000/api/skemagaji';

  useEffect(() => {
    fetchKaryawan();
    fetchSkemaGaji();
  }, []);

  const fetchKaryawan = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URL);
      setKaryawanList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal ambil data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchSkemaGaji = async () => {
    try {
      const response = await axios.get(SKEMA_URL);
      setSkemaGajiList(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Gagal ambil data skema gaji:', error.message);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await axios.put(`${API_URL}/update/${editId}`, formData);
        Swal.fire('Berhasil!', 'Data berhasil diupdate!', 'success');
      } else {
        await axios.post(`${API_URL}/tambah`, formData);
        Swal.fire('Berhasil!', 'Karyawan baru berhasil ditambah!', 'success');
      }
      handleReset();
      fetchKaryawan();
    } catch (error) {
      console.error('Error Detail:', error.response?.data || error.message);
      Swal.fire('Error', 'Gagal memproses data.', 'error');
    }
  };

  const handleHapus = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Karyawan',
      text: 'Yakin mau menghapus karyawan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/hapus/${id}`);
        Swal.fire('Terhapus!', 'Karyawan berhasil dihapus.', 'success');
        fetchKaryawan();
      } catch (error) {
        Swal.fire('Error', 'Gagal menghapus data.', 'error');
      }
    }
  };

  const handleEdit = (karyawan) => {
    setEditId(karyawan.id_user);
    setFormData({
      username: karyawan.username || '',
      password: '',
      role: karyawan.role || 'karyawan',
      jatah_cuti: karyawan.jatah_cuti !== undefined && karyawan.jatah_cuti !== null ? karyawan.jatah_cuti : 12,
      id_skemagaji: karyawan.id_skemagaji || '',
    });
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setEditId(null);
    setFormData({
      username: '',
      password: '',
      role: 'karyawan',
      jatah_cuti: 12,
      id_skemagaji: '',
    });
  };

  const filteredKaryawan = React.useMemo(() => {
    return karyawanList.filter((k) =>
      (k.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [karyawanList, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const paginatedKaryawan = React.useMemo(() => {
    if (pageSize === 'Semua') return filteredKaryawan;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredKaryawan.slice(start, start + size);
  }, [filteredKaryawan, currentPage, pageSize]);

  return (
    <div className="data-karyawan-container">
      <div className="content-wrapper">
        {/* SECTION 1: FORM INPUT */}
        <div className="form-card">
          <h2 className="form-title">
            {editId ? 'Edit Data Karyawan' : 'Tambah Karyawan Baru'}
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Masukkan username"
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder={
                    editId ? 'Kosongkan jika tidak diubah' : 'Masukkan password'
                  }
                  required={!editId}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Role Jabatan</label>
                <SelectSearch
                  options={[
                    { value: 'karyawan', label: 'Karyawan' },
                    { value: 'hrd', label: 'HRD' },
                    { value: 'pimpinan', label: 'Pimpinan' },
                    { value: 'keuangan', label: 'Keuangan' },
                    { value: 'user', label: 'User Umum' },
                  ]}
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.value })}
                  placeholder="Pilih Role Jabatan"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Jatah Cuti (Hari)</label>
                <input
                  type="number"
                  name="jatah_cuti"
                  value={formData.jatah_cuti}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Contoh: 12"
                  min="0"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Skema Gaji (Golongan)</label>
                <SelectSearch
                  options={skemaGajiList.map((item) => ({
                    value: item.id_skemagaji,
                    label: item.nama_golongan,
                  }))}
                  value={formData.id_skemagaji}
                  onChange={(e) => setFormData({ ...formData, id_skemagaji: e.value })}
                  placeholder="Pilih Skema Gaji"
                  isClearable
                />
              </div>
            </div>
            <div className="button-group">
              <button type="submit" className="btn btn-primary">
                {editId ? '✓ UPDATE' : '✓ SIMPAN'}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn btn-secondary"
                >
                  ✕ BATAL
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SECTION 2: TABLE */}
        <div className="table-card">
          <div className="table-header-box">
            <h2 className="table-title">Daftar Karyawan</h2>
            <div className="search-container">
              <input
                type="text"
                placeholder="Cari username..."
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID Karyawan</th>
                  <th>Nama Karyawan</th>
                  <th>Role</th>
                  <th>Jatah Cuti</th>
                  <th>Skema Gaji</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : paginatedKaryawan.length > 0 ? (
                  paginatedKaryawan.map((k) => (
                    <tr key={k.id_user}>
                      <td>{k.id_user}</td>
                      <td>{k.username}</td>
                      <td>
                        {/* Class badge otomatis menyesuaikan k.role */}
                        <span className={`badge role-${k.role}`}>{k.role}</span>
                      </td>
                      <td>
                        <span style={{ fontWeight: 500 }}>
                          {k.jatah_cuti !== null && k.jatah_cuti !== undefined ? `${k.jatah_cuti} Hari` : '-'}
                        </span>
                      </td>
                      <td>
                        {k.nama_golongan ? (
                          <span className="badge badge-skema">{k.nama_golongan}</span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: '13px', color: '#95a5a6' }}>
                            Belum diatur
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(k)}
                            className="btn-edit"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleHapus(k.id_user)}
                            className="btn-delete"
                            title="Hapus"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalItems={filteredKaryawan.length}
            pageSize={pageSize}
            onPageChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default DataKaryawan;
