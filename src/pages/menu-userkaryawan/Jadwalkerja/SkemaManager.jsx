import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './SkemaManager.css'; // Opsional untuk styling

const SkemaManager = () => {
  const [skemaList, setSkemaList] = useState([]);
  const [formData, setFormData] = useState({
    nama_skema: '',
    jam_masuk: '',
    jam_keluar: '',
    toleransi_menit: 0,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // 1. Ambil Data Skema
  const fetchSkema = async () => {
    try {
      const res = await axios.get('https://api1.ptbss.id/api/skema');
      setSkemaList(res.data);
    } catch (err) {
      Swal.fire('Error', 'Gagal mengambil data skema', 'error');
    }
  };

  useEffect(() => {
    fetchSkema();
  }, []);

  // 2. Handle Input Form
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 3. Simpan atau Update Skema
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await axios.put(
          `https://api1.ptbss.id/api/skema/edit/${currentId}`,
          formData
        );
        Swal.fire('Berhasil', 'Skema berhasil diperbarui', 'success');
      } else {
        await axios.post('https://api1.ptbss.id/api/skema/add', formData);
        Swal.fire('Berhasil', 'Skema baru berhasil ditambahkan', 'success');
      }
      setFormData({
        nama_skema: '',
        jam_masuk: '',
        jam_keluar: '',
        toleransi_menit: 0,
      });
      setIsEditing(false);
      fetchSkema();
    } catch (err) {
      Swal.fire('Gagal', 'Gagal menyimpan data', 'error');
    }
  };

  // 4. Set Form untuk Edit
  const handleEdit = (item) => {
    setIsEditing(true);
    setCurrentId(item.id_skema);
    setFormData({
      nama_skema: item.nama_skema,
      jam_masuk: item.jam_masuk,
      jam_keluar: item.jam_keluar,
      toleransi_menit: item.toleransi_menit,
    });
  };

  // 5. Hapus Skema
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: 'Yakin ingin menghapus skema ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://api1.ptbss.id/api/skema/delete/${id}`);
        Swal.fire('Dihapus!', 'Skema berhasil dihapus.', 'success');
        fetchSkema();
      } catch (err) {
        Swal.fire('Gagal', 'Gagal menghapus', 'error');
      }
    }
  };

  return (
    <div className="manager-container">
      <h2>Manajemen Skema Kerja (HRD)</h2>

      {/* Form Input */}
      <form onSubmit={handleSubmit} className="skema-form">
        <input
          name="nama_skema"
          placeholder="Nama Skema (Contoh: Shift Pagi)"
          value={formData.nama_skema}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="jam_masuk"
          value={formData.jam_masuk}
          onChange={handleChange}
          required
        />
        <input
          type="time"
          name="jam_keluar"
          value={formData.jam_keluar}
          onChange={handleChange}
          required
        />
        <input
          type="number"
          name="toleransi_menit"
          placeholder="Toleransi (Menit)"
          value={formData.toleransi_menit}
          onChange={handleChange}
        />
        <button type="submit" className="btn-save">
          {isEditing ? 'Update Skema' : 'Tambah Skema'}
        </button>
        {isEditing && (
          <button onClick={() => setIsEditing(false)}>Batal</button>
        )}
      </form>

      {/* Tabel Data */}
      <table className="skema-table">
        <thead>
          <tr>
            <th>Nama Skema</th>
            <th>Jam Masuk</th>
            <th>Jam Keluar</th>
            <th>Toleransi</th>
            <th>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {skemaList.map((item) => (
            <tr key={item.id_skema}>
              <td>{item.nama_skema}</td>
              <td>{item.jam_masuk}</td>
              <td>{item.jam_keluar}</td>
              <td>{item.toleransi_menit} Menit</td>
              <td>
                <button onClick={() => handleEdit(item)} className="btn-edit">
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(item.id_skema)}
                  className="btn-delete"
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SkemaManager;
