import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './DokumenPribadi.css';

const DokumenPribadi = ({ idUser }) => {
  const [file, setFile] = useState(null);
  const [jenis, setJenis] = useState('');
  const [listDokumen, setListDokumen] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fungsi untuk mengambil daftar dokumen
  const fetchDokumen = useCallback(async () => {
    if (!idUser) return;
    try {
      const res = await axios.get(
        `https://api1.ptbss.id/api/dokumen/user/${idUser}`
      );
      setListDokumen(res.data);
    } catch (err) {
      console.error('Gagal mengambil daftar dokumen', err);
    }
  }, [idUser]);

  useEffect(() => {
    fetchDokumen();
  }, [fetchDokumen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!idUser || idUser === 'undefined') {
      Swal.fire('Error', 'ID User tidak valid.', 'error');
      return;
    }
    if (!file || !jenis) {
      Swal.fire('Peringatan', 'Lengkapi data!', 'warning');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_user', idUser);
    formData.append('nama_dokumen', jenis);

    try {
      await axios.post('https://api1.ptbss.id/api/dokumen/upload', formData);
      Swal.fire('Berhasil!', 'Berhasil diunggah!', 'success');
      setFile(null);
      setJenis('');
      fetchDokumen(); // Refresh daftar setelah upload
    } catch (error) {
      Swal.fire('Error', 'Gagal upload.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dokumen-container">
      <h3 className="dokumen-title">Upload Dokumen Pribadi</h3>
      {/* Form Upload */}
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="form-group">
          <label className="form-label">Jenis Dokumen</label>
          <select
            className="form-select"
            value={jenis}
            onChange={(e) => setJenis(e.target.value)}
          >
            <option value="">-- Pilih --</option>
            <option value="KTP">KTP</option>
            <option value="NPWP">NPWP</option>
            <option value="Ijazah">Ijazah</option>
            <option value="KK">Kartu Keluarga</option>
            <option value="SIM">SIM</option>
            <option value="Buku Nikah">Buku Nikah</option>
            <option value="Akta Kelahiran">Akta Kelahiran</option>
            <option value="Paspor">Paspor</option>
            <option value="Lainnya">Lainnya</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Pilih File</label>
          <input
            type="file"
            className="form-input"
            onChange={(e) => setFile(e.target.files[0])}
          />
        </div>
        <button type="submit" className="btn-upload" disabled={loading}>
          {loading ? 'Mengunggah...' : 'Simpan Dokumen'}
        </button>
      </form>

      <hr className="my-6" />

      {/* Tabel Daftar Dokumen */}
      <div className="mt-6">
        <h4 className="font-bold mb-3">Daftar Dokumen Anda</h4>
        <table className="w-full text-sm text-left border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Jenis</th>
              <th className="p-2 border">Nama File</th>
              <th className="p-2 border">Tanggal Upload </th>
            </tr>
          </thead>
          <tbody>
            {listDokumen.length > 0 ? (
              listDokumen.map((doc) => (
                <tr key={doc.id_dokumen}>
                  <td className="p-2 border">{doc.nama_dokumen}</td>
                  <td className="p-2 border text-blue-600">
                    <a
                      href={`http://localhost:3000${doc.file_path}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Lihat File
                    </a>
                  </td>
                  <td className="p-2 border">
                    <span className="text-gray-400 text-xs">
                      {new Date(doc.uploaded_at).toLocaleDateString()}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="p-4 text-center text-gray-500">
                  Belum ada dokumen yang diunggah.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DokumenPribadi;
