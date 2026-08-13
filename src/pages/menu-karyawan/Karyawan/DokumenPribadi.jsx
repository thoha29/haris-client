import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './DokumenPribadi.css';
import SelectSearch from '../../../components/SelectSearch';

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
        `http://localhost:3000/api/dokumen/user/${idUser}`
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
      await axios.post('http://localhost:3000/api/dokumen/upload', formData);
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
          <SelectSearch
            options={[
              { value: 'KTP', label: 'KTP' },
              { value: 'NPWP', label: 'NPWP' },
              { value: 'Ijazah', label: 'Ijazah' },
              { value: 'KK', label: 'Kartu Keluarga (KK)' },
              { value: 'SIM', label: 'SIM' },
              { value: 'Buku Nikah', label: 'Buku Nikah' },
              { value: 'Akta Kelahiran', label: 'Akta Kelahiran' },
              { value: 'Paspor', label: 'Paspor' },
              { value: 'Lainnya', label: 'Lainnya' },
            ]}
            value={jenis}
            onChange={(e) => setJenis(e.value)}
            placeholder="-- Pilih Jenis Dokumen --"
            isClearable={true}
          />
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
                      // href={`http://localhost:3000${doc.file_path}`}
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
