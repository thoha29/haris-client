import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './DataKaryawan.css';

const DataKaryawan = () => {
  const [karyawanList, setKaryawanList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'karyawan',
  });
  const [editId, setEditId] = useState(null);

  const API_URL = 'https://api1.ptbss.id/api/karyawan';

  useEffect(() => {
    fetchKaryawan();
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

  const filteredKaryawan = karyawanList.filter((k) =>
    k.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
    });
    window.scrollTo(0, 0);
  };

  const handleReset = () => {
    setEditId(null);
    setFormData({ username: '', password: '', role: 'karyawan' });
  };

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
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="karyawan">Karyawan</option>
                  <option value="hrd">HRD</option>
                  <option value="pimpinan">Pimpinan</option>
                  <option value="keuangan">Keuangan</option> {/* Role Baru */}
                  <option value="user">User Umum</option> {/* Role Baru */}
                </select>
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
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" className="text-center">
                      Memuat data...
                    </td>
                  </tr>
                ) : filteredKaryawan.length > 0 ? (
                  filteredKaryawan.map((k) => (
                    <tr key={k.id_user}>
                      <td>{k.id_user}</td>
                      <td>{k.username}</td>
                      <td>
                        {/* Class badge otomatis menyesuaikan k.role */}
                        <span className={`badge role-${k.role}`}>{k.role}</span>
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
                    <td colSpan="4" className="text-center">
                      Data tidak ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataKaryawan;
