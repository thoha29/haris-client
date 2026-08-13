import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import './TambahDataPribadi.css';
import api from '../../../config/api';
import SelectSearch from '../../../components/SelectSearch';

const TambahDataPribadi = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState();
  const [isEditMode, setIsEditMode] = useState(false);

  // State FULL sesuai kolom di database
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

    // DATA KEPEGAWAIAN
    tanggal_masuk: '',
    tanggal_kontrak_berakhir: '',
    atasan_langsung: '',
    nama_atasan: '',
    lokasi_proyek: '',
    lokasi_kerja: '',
    tipe_kerja: 'non-shift', // Enum: 'shift' / 'non-shift'
  });

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

  const formatDate = (date) => {
    if (!date) return '';
    return date.split('T')[0];
  };

  const normalizeData = (data) => ({
    ...data,
    tanggal_lahir: formatDate(data.tanggal_lahir),
    tanggal_masuk: formatDate(data.tanggal_masuk),
    tanggal_kontrak_berakhir: formatDate(data.tanggal_kontrak_berakhir),
    tipe_kerja: data.tipe_kerja || 'non-shift',
  });

  // 2. Logic Auto-fill pas pilih user
  const handleUserChange = async (val) => {
    const userId = typeof val === 'object' ? val.target.value : "pilih karyawan";
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
        setFormData(normalizeData(res.data));
        setIsEditMode(true);
      }
    } catch (err) {
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

      tanggal_masuk: '',
      tanggal_kontrak_berakhir: '',
      atasan_langsung: '',
      nama_atasan: '',
      lokasi_proyek: '',
      lokasi_kerja: '',
      tipe_kerja: 'non-shift',
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

      const cleanDate = (val) => (val === '' ? null : val);

      const payload = {
        ...formData,
        tanggal_lahir: cleanDate(formData.tanggal_lahir),
        tanggal_masuk: cleanDate(formData.tanggal_masuk),
        tanggal_kontrak_berakhir: cleanDate(formData.tanggal_kontrak_berakhir),
      };

      if (isEditMode) {
        const res = await api.put(`${url}/${formData.id_user}`, payload, config);
        Swal.fire('Berhasil!', res.data.message || 'Data berhasil diupdate!', 'success');
      } else {
        const res = await api.post(url, payload, config);
        Swal.fire('Berhasil!', res.data.message || 'Data berhasil disimpan!', 'success');
        setIsEditMode(true);
      }
    } catch (error) {
      console.error('FULL ERROR:', error);
      console.error('RESPONSE:', error.response?.data);

      Swal.fire(
        'Error',
        JSON.stringify(error.response?.data || error.message),
        'error'
      );
    }
  };

  const userOptions = users.map((u) => ({
    value: u.id_user,
    label: `${u.username}`,
  }));

  const tipeKerjaOptions = [
    { value: 'non-shift', label: 'Non-Shift (Jadwal Otomatis Skema 6)' },
    { value: 'shift', label: 'Shift' },
  ];

  return (
    <div className="tambah-data-container">
      <h2 className="form-header">
        {isEditMode ? 'EDIT DATA PRIBADI' : ' DATA PRIBADI'}
      </h2>

      <div className="user-selector" style={{ marginBottom: '20px' }}>
        <label>Pilih Username Karyawan:</label>
        <SelectSearch
          options={userOptions}
          value={selectedUser}
          onChange={handleUserChange}
          placeholder="Pilih User Karyawan"
          searchPlaceholder="Cari username..."
          isClearable={true}
        />
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
          <SelectSearch
            options={[
              { value: 'L', label: 'Laki-laki' },
              { value: 'P', label: 'Perempuan' },
            ]}
            value={formData.jenis_kelamin}
            onChange={(e) => setFormData({ ...formData, jenis_kelamin: e.value })}
            placeholder="-- Pilih Jenis Kelamin --"
          />
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
          <label>Tipe Kerja Karyawan (Shift / Non-Shift)</label>
          <SelectSearch
            options={tipeKerjaOptions}
            value={formData.tipe_kerja}
            onChange={(e) => setFormData({ ...formData, tipe_kerja: e.value })}
            placeholder="-- Pilih Tipe Kerja --"
          />
        </div>
        <div className="input-box">
          <label>Status Karyawan</label>
          <SelectSearch
            options={[
              { value: 'tetap', label: 'Tetap' },
              { value: 'kontrak', label: 'Kontrak' },
              { value: 'probation', label: 'Probation' },
            ]}
            value={formData.status_karyawan}
            onChange={(e) => setFormData({ ...formData, status_karyawan: e.value })}
            placeholder="-- Pilih Status Karyawan --"
          />
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
        <div className="input-box">
          <label>Tanggal Masuk (Awal Kontrak)</label>
          <input
            type="date"
            name="tanggal_masuk"
            value={formData.tanggal_masuk || ''}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Tanggal Kontrak Berakhir</label>
          <input
            type="date"
            name="tanggal_kontrak_berakhir"
            value={formData.tanggal_kontrak_berakhir || ''}
            onChange={handleChange}
          />
        </div>

        <div className="input-box">
          <label>Atasan Langsung</label>
          <input
            type="text"
            name="atasan_langsung"
            value={formData.atasan_langsung || ''}
            onChange={handleChange}
            placeholder="Manager Operasional"
          />
        </div>

        <div className="input-box">
          <label>Nama Atasan</label>
          <input
            type="text"
            name="nama_atasan"
            value={formData.nama_atasan || ''}
            onChange={handleChange}
            placeholder="Budi Santoso"
          />
        </div>

        <div className="input-box">
          <label>Lokasi Proyek</label>
          <input
            type="text"
            name="lokasi_proyek"
            value={formData.lokasi_proyek || ''}
            onChange={handleChange}
            placeholder="Site Morowali"
          />
        </div>

        <div className="input-box">
          <label>Lokasi Kerja</label>
          <input
            type="text"
            name="lokasi_kerja"
            value={formData.lokasi_kerja || ''}
            onChange={handleChange}
            placeholder="Jakarta"
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
