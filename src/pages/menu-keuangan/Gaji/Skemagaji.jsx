import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './Skemagaji.css';

const Skemagaji = () => {
  const [skemas, setSkemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentId, setCurrentId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    nama_golongan: '',
    gaji_bulanan: '',
    jam_kerja_per_hari: '9',
    hari_kerja_per_bulan: '22',
    rate_per_jam: '',
  });

  useEffect(() => {
    fetchSkemas();
  }, []);

  const fetchSkemas = async () => {
    setLoading(true);
    try {
      const res = await axios.get('https://api1.ptbss.id/api/skemagaji');
      setSkemas(res.data);
    } catch (error) {
      console.error('Gagal mengambil data skema gaji:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openAddMenu = () => {
    setFormData({
      nama_golongan: '',
      gaji_bulanan: '',
      jam_kerja_per_hari: '9',
      hari_kerja_per_bulan: '22',
      rate_per_jam: '',
    });
    setIsEditMode(false);
    setIsMenuOpen(true);
  };

  const openEditMenu = (skema) => {
    setFormData({
      nama_golongan: skema.nama_golongan,
      gaji_bulanan: skema.gaji_bulanan,
      jam_kerja_per_hari: skema.jam_kerja_per_hari,
      hari_kerja_per_bulan: skema.hari_kerja_per_bulan,
      rate_per_jam: skema.rate_per_jam,
    });
    setCurrentId(skema.id_skemagaji);
    setIsEditMode(true);
    setIsMenuOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEditMode) {
        await axios.put(
          `https://api1.ptbss.id/api/skemagaji/edit/${currentId}`,
          formData
        );
        Swal.fire(
          'Berhasil!',
          'Skema/Golongan berhasil diperbarui!',
          'success'
        );
      } else {
        await axios.post('https://api1.ptbss.id/api/skemagaji/add', formData);
        Swal.fire(
          'Berhasil!',
          'Skema/Golongan baru berhasil ditambahkan!',
          'success'
        );
      }
      setIsMenuOpen(false);
      fetchSkemas();
    } catch (error) {
      console.error('Gagal menyimpan skema gaji:', error);
      Swal.fire('Error', 'Terjadi kesalahan saat menyimpan data.', 'error');
    }
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Hapus Golongan',
      text: 'Apakah Anda yakin ingin menghapus Skema/Golongan ini?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`https://api1.ptbss.id/api/skemagaji/delete/${id}`);
        Swal.fire('Terhapus!', 'Skema/Golongan berhasil dihapus!', 'success');
        fetchSkemas();
      } catch (error) {
        console.error('Gagal menghapus:', error);
        Swal.fire('Error', 'Terjadi kesalahan saat menghapus data.', 'error');
      }
    }
  };

  return (
    <div className="skemagaji-container">
      <div className="skemagaji-header">
        <div className="header-text">
          <h2>Manajemen Golongan (Skema Gaji)</h2>
          <p>
            Atur gaji pokok, hari/jam kerja, dan kalkulasi tarif per jam (Rate)
            karyawan.
          </p>
        </div>
        <button className="btn-add-skemagaji" onClick={openAddMenu}>
          + Tambah Golongan Baru
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data skema...</div>
      ) : (
        <div className="skemagaji-table-wrapper">
          <table className="skemagaji-table">
            <thead>
              <tr>
                <th>Nama Golongan</th>
                <th>Gaji Bulanan</th>
                <th>Jam/Hari</th>
                <th>Hari/Bulan</th>
                <th>Tarif Lembur/Telat (Rate P/Jam)</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {skemas.length > 0 ? (
                skemas.map((item) => (
                  <tr key={item.id_skemagaji}>
                    <td>
                      <strong>{item.nama_golongan}</strong>
                    </td>
                    <td>
                      Rp {Number(item.gaji_bulanan).toLocaleString('id-ID')}
                    </td>
                    <td>{item.jam_kerja_per_hari} Jam</td>
                    <td>{item.hari_kerja_per_bulan} Hari</td>
                    <td>
                      <span className="rate-badge">
                        Rp {Number(item.rate_per_jam).toLocaleString('id-ID')} /
                        Jam
                      </span>
                    </td>
                    <td className="action-buttons">
                      <button
                        className="btn-edit-sg"
                        onClick={() => openEditMenu(item)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn-delete-sg"
                        onClick={() => handleDelete(item.id_skemagaji)}
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="empty-state">
                    Belum ada data Skema / Golongan Gaji.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {isMenuOpen && (
        <div className="skemagaji-modal-overlay">
          <div className="skemagaji-modal">
            <h3>
              {isEditMode
                ? 'Edit Skema/Golongan'
                : 'Tambah Skema/Golongan Baru'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group-sg">
                <label>Nama Golongan / Skema</label>
                <input
                  type="text"
                  name="nama_golongan"
                  placeholder="Contoh: Manager, Staff IT, Bulanan"
                  value={formData.nama_golongan}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row-sg">
                <div className="form-group-sg">
                  <label>Total Gaji Pokok Bulanan (Rp)</label>
                  <input
                    type="number"
                    name="gaji_bulanan"
                    placeholder="Contoh: 5000000"
                    value={formData.gaji_bulanan}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-row-sg">
                <div className="form-group-sg">
                  <label>Jam Kerja Per Hari</label>
                  <input
                    type="number"
                    name="jam_kerja_per_hari"
                    value={formData.jam_kerja_per_hari}
                    onChange={handleInputChange}
                    min="1"
                    max="24"
                    required
                  />
                </div>
                <div className="form-group-sg">
                  <label>Total Hari Kerja (Sebulan)</label>
                  <input
                    type="number"
                    name="hari_kerja_per_bulan"
                    value={formData.hari_kerja_per_bulan}
                    onChange={handleInputChange}
                    min="1"
                    max="31"
                    required
                  />
                </div>
              </div>

              <div className="form-group-sg info-box">
                <label>
                  Tarif / Rate Per Jam (Rp) - <i>(Opsional)</i>
                </label>
                <p className="help-text">
                  Jika dikosongkan, sistem akan menghitung otomatis menggunakan
                  rumus:
                  <br />
                  <strong>Gaji Bulanan ÷ (Jam Kerja × Hari Kerja)</strong>
                </p>
                <input
                  type="number"
                  name="rate_per_jam"
                  placeholder="Input Tarif Manual (Biarkan kosong untuk Autocalculate)"
                  value={formData.rate_per_jam}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-actions-sg">
                <button
                  type="button"
                  className="btn-cancel-sg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Batal
                </button>
                <button type="submit" className="btn-save-sg">
                  Simpan Skema
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Skemagaji;
