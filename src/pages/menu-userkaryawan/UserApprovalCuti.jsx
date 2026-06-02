import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './UserApproval.css';

const UserApprovalCuti = () => {
  const [listPengajuan, setListPengajuan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('');

  const fetchPendingUser = async () => {
    try {
      // Pastikan API ini mengirimkan data yang sedang diproses oleh user ini
      const res = await axios.get('https://api1.ptbss.id/cuti/pending-user');
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

  const hitungDurasi = (mulai, selesai) => {
    const tgl1 = new Date(mulai);
    const tgl2 = new Date(selesai);
    const diffTime = Math.abs(tgl2 - tgl1);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  };

  const filteredData = useMemo(() => {
    return listPengajuan.filter((item) => {
      const matchName = item.nama_karyawan
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchType = selectedType === '' || item.tipe === selectedType;
      return matchName && matchType;
    });
  }, [listPengajuan, searchTerm, selectedType]);

  // LOGIKA SINKRONISASI: Update state lokal setelah aksi
  const handleAction = async (id_cuti, statusBaru) => {
    const result = await Swal.fire({
      title: 'Konfirmasi',
      text: `Yakin ingin ${statusBaru} pengajuan ini?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Lanjutkan!',
      cancelButtonText: 'Batal',
    });
    if (!result.isConfirmed) return;

    try {
      const response = await axios.put(
        'https://api1.ptbss.id/cuti/approve-user',
        {
          id_cuti: id_cuti,
          status: statusBaru,
        }
      );

      if (response.status === 200) {
        // UPDATE STATE LOKAL: Cari item dan ubah statusnya di memori React
        // Ini yang bikin data tetep nempel di layar
        setListPengajuan((prevList) =>
          prevList.map((item) =>
            item.id_cuti === id_cuti
              ? { ...item, status_atasan: statusBaru } // Tambahkan field status_atasan
              : item
          )
        );
        Swal.fire('Berhasil!', `Pengajuan telah di-${statusBaru}`, 'success');
      }
    } catch (err) {
      Swal.fire(
        'Gagal',
        'Gagal update: ' + (err.response?.data?.message || 'Error'),
        'error'
      );
    }
  };

  return (
    <div className="hrd-container">
      <div className="hrd-card">
        <div className="hrd-header">
          <h2>Panel Persetujuan Atasan (Tahap 1)</h2>
          <p>Daftar pengajuan cuti yang memerlukan persetujuan Anda.</p>
        </div>

        <div className="filter-row">
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
          <div className="filter-group">
            <label>Tipe:</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="filter-input"
            >
              <option value="">Semua Tipe</option>
              <option value="Cuti">Cuti Tahunan</option>
              <option value="Izin">Izin</option>
              <option value="Cuti Meninggal">Cuti Meninggal</option>
              <option value="Cuti Melahirkan">Cuti Melahirkan</option>
            </select>
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
                <th>Tipe</th>
                <th>Durasi</th>
                <th>Alasan</th>
                <th>Status/Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center">
                    Memuat data...
                  </td>
                </tr>
              ) : filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id_cuti}>
                    <td className="emp-name">{item.nama_karyawan}</td>
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
                      {/* KONDISI: Jika sudah di-acc/tolak, tampilkan label. Jika belum, tampilkan tombol */}
                      {item.status_atasan ? (
                        <span className={`status-label ${item.status_atasan}`}>
                          {item.status_atasan === 'approved'
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
                  <td colSpan="5" className="text-center">
                    Tidak ada data yang ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalCuti;
