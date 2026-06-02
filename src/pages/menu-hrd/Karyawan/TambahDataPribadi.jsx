import React, { useState, useEffect } from 'react';
// import axios from 'axios';
import Swal from 'sweetalert2';
import './TambahDataPribadi.css';
import api from '../../../config/api';

const TambahDataPribadi = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);

  // State FULL sesuai kolom di database lu (18 Kolom)
  const [formData, setFormData] = useState({
    id_user: '',
    nik: '',
    nip: '',
    nama_lengkap: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'L',
    alamat: '',
    agama: '',
    status_perkawinan: '',
    kewarganegaraan: 'WNI',
    jabatan: '',
    divisi: '',
    status_karyawan: 'kontrak',
    jenjang_pendidikan: '',
    institusi: '',
    jurusan: '',
    tahun_lulus: '',
  });

  // Ambil token dari localStorage (Pastikan key-nya 'access_token')
  const token = localStorage.getItem('access_token');

  // 1. Ambil list user buat dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      if (!token) return;
      try {
        const res = await api.get('/api/data-pribadi/users/list', {
          headers: { Authorization: `Bearer ${token.trim()}` },
        });
        setUsers(res.data);
      } catch (err) {
        console.error('Gagal load dropdown:', err.response?.data);
        if (err.response?.status === 403) {
          Swal.fire(
            'Gagal',
            'Sesi abis atau token sampah, coba Logout terus Login lagi!',
            'error'
          );
        }
      }
    };
    fetchUsers();
  }, [token]);

  // 2. Logic Auto-fill pas pilih user
  const handleUserChange = async (e) => {
    const userId = e.target.value;
    setSelectedUser(userId);
    if (!userId) {
      resetForm();
      return;
    }

    try {
      const res = await api.get(`/api/data-pribadi/${userId}`, {
        headers: { Authorization: `Bearer ${token.trim()}` },
      });
      if (res.data) {
        setFormData(res.data);
        setIsEditMode(true);
      }
    } catch (err) {
      // Jika data belum ada, set id_user saja untuk input baru
      resetForm(userId);
      setIsEditMode(false);
    }
  };

  const resetForm = (id = '') => {
    setFormData({
      id_user: id,
      nik: '',
      nip: '',
      nama_lengkap: '',
      tempat_lahir: '',
      tanggal_lahir: '',
      jenis_kelamin: 'L',
      alamat: '',
      agama: '',
      status_perkawinan: '',
      kewarganegaraan: 'WNI',
      jabatan: '',
      divisi: '',
      status_karyawan: 'kontrak',
      jenjang_pendidikan: '',
      institusi: '',
      jurusan: '',
      tahun_lulus: '',
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Simpan atau Update Data
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${token.trim()}` } };
      const url = '/api/data-pribadi';

      if (isEditMode) {
        await api.put(`${url}/${formData.id_user}`, formData, config);
        Swal.fire('Berhasil!', 'Data berhasil diupdate!', 'success');
      } else {
        await api.post(url, formData, config);
        Swal.fire('Berhasil!', 'Data berhasil disimpan!', 'success');
        setIsEditMode(true);
      }
    } catch (error) {
      const msg = error.response?.data?.message || 'Terjadi kesalahan';
      Swal.fire('Error', 'Gagal: ' + msg, 'error');
    }
  };

  return (
    <div className="tambah-data-container">
      <h2 className="form-header">
        {isEditMode ? 'EDIT DATA PRIBADI' : ' DATA PRIBADI'}
      </h2>

      <div className="user-selector" style={{ marginBottom: '20px' }}>
        <label>Pilih Username Karyawan:</label>
        <select
          value={selectedUser}
          onChange={handleUserChange}
          className="login-input"
        >
          <option value="">-- Pilih User --</option>
          {users.map((u) => (
            <option key={u.id_user} value={u.id_user}>
              {u.username}
            </option>
          ))}
        </select>
      </div>

      <form onSubmit={handleSubmit} className="tambah-data-grid">
        <div className="section-divider">Identitas Utama</div>
        <div className="input-box">
          <label>NIK</label>
          <input
            type="text"
            name="nik"
            value={formData.nik}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-box">
          <label>NIP</label>
          <input
            type="text"
            name="nip"
            value={formData.nip}
            onChange={handleChange}
            required
          />
        </div>
        <div className="input-box">
          <label>Nama Lengkap</label>
          <input
            type="text"
            name="nama_lengkap"
            value={formData.nama_lengkap}
            onChange={handleChange}
            required
          />
        </div>

        <div className="section-divider">Kelahiran & Status</div>
        <div className="input-box">
          <label>Tempat Lahir</label>
          <input
            type="text"
            name="tempat_lahir"
            value={formData.tempat_lahir}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Tanggal Lahir</label>
          <input
            type="date"
            name="tanggal_lahir"
            value={formData.tanggal_lahir}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Jenis Kelamin</label>
          <select
            name="jenis_kelamin"
            value={formData.jenis_kelamin}
            onChange={handleChange}
          >
            <option value="L">Laki-laki</option>
            <option value="P">Perempuan</option>
          </select>
        </div>
        <div className="input-box">
          <label>Agama</label>
          <input
            type="text"
            name="agama"
            value={formData.agama}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Status Perkawinan</label>
          <input
            type="text"
            name="status_perkawinan"
            value={formData.status_perkawinan}
            onChange={handleChange}
          />
        </div>

        <div className="input-box full">
          <label>Alamat</label>
          <textarea
            name="alamat"
            rows="2"
            value={formData.alamat}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="section-divider">Pekerjaan & Pendidikan</div>
        <div className="input-box">
          <label>Jabatan</label>
          <input
            type="text"
            name="jabatan"
            value={formData.jabatan}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Divisi</label>
          <input
            type="text"
            name="divisi"
            value={formData.divisi}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Status Karyawan</label>
          <select
            name="status_karyawan"
            value={formData.status_karyawan}
            onChange={handleChange}
          >
            <option value="tetap">Tetap</option>
            <option value="kontrak">Kontrak</option>
            <option value="probation">Probation</option>
          </select>
        </div>
        <div className="input-box">
          <label>Institusi</label>
          <input
            type="text"
            name="institusi"
            value={formData.institusi}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Jurusan</label>
          <input
            type="text"
            name="jurusan"
            value={formData.jurusan}
            onChange={handleChange}
          />
        </div>
        <div className="input-box">
          <label>Tahun Lulus</label>
          <input
            type="number"
            name="tahun_lulus"
            value={formData.tahun_lulus}
            onChange={handleChange}
          />
        </div>

        <button
          type="submit"
          className={isEditMode ? 'btn-edit' : 'btn-simpan'}
          style={{ gridColumn: 'span 2' }}
        >
          {isEditMode ? 'UPDATE DATA KARYAWAN' : 'SIMPAN DATA BARU'}
        </button>
      </form>
    </div>
  );
};

export default TambahDataPribadi;
