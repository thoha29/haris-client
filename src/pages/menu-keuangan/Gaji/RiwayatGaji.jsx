import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import './RiwayatGaji.css';

const RiwayatGaji = () => {
  const { id_user } = useParams();
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userMeta, setUserMeta] = useState('');
  const [selectedSlip, setSelectedSlip] = useState(null); // State buat nampung slip yang mau di-print

  const namaBulan = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  useEffect(() => {
    const fetchRiwayat = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `http://localhost:3000/api/gaji/riwayat/${id_user}`
        );
        setRiwayat(res.data);
        if (res.data.length > 0 && res.data[0].username) {
          setUserMeta(res.data[0].username);
        }
      } catch (err) {
        console.error('Gagal ambil riwayat:', err);
      } finally {
        setLoading(false);
      }
    };

    if (id_user) {
      fetchRiwayat();
    }
  }, [id_user]);

  return (
    <div className="history-page-wrapper">
      {/* MODAL PREVIEW SLIP GAJI (MUNCUL PAS KLIK TOMBOL PDF) */}
      {selectedSlip && (
        <div className="preview-overlay">
          <div className="preview-card slip-digital" id="printable-slip">
            <div className="slip-header">
              <div className="company-info">
                <h2>PT. BANGGAI SENTRAL SULAWESI</h2>
                <p>
                  Slip Gaji - {namaBulan[selectedSlip.bulan - 1]}{' '}
                  {selectedSlip.tahun}
                </p>
              </div>
              <div className="status-badge-verified">ARSIP DIGITAL ✅</div>
            </div>

            <div className="slip-user-info">
              <div className="info-item">
                <span>NAMA KARYAWAN : </span>
                <strong>{userMeta}</strong>
              </div>
              <div className="info-item">
                <span>ID USER </span>
                <strong> : {id_user}</strong>
              </div>
            </div>

            <div className="slip-details-grid">
              <div className="slip-section">
                <h4 className="section-title">PENERIMAAN</h4>
                <div className="detail-row">
                  <span>Gaji Pokok : </span>
                  <span>
                    Rp {Number(selectedSlip.gaji_pokok).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Tunjangan Jabatan : </span>
                  <span>
                    Rp{' '}
                    {Number(selectedSlip.tunjangan_jabatan).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>
                    Insentif Lembur ({selectedSlip.total_jam_lembur} Jam) :{' '}
                  </span>
                  <span>
                    Rp{' '}
                    {Number(selectedSlip.insentif_lembur).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row highlight-blue">
                  <span>Makan/Transport/SPPD : </span>
                  <span>
                    Rp{' '}
                    {Number(selectedSlip.uang_makan_transport).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </div>
              <div className="slip-section">
                <h4 className="section-title">POTONGAN</h4>
                <div className="detail-row">
                  <span>Terlambat ({selectedSlip.total_jam_telat} Jam) : </span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(selectedSlip.potongan_terlambat).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Total Jam Kerja : </span>
                  <span className="text-blue">
                    {selectedSlip.total_jam_kerja} Jam
                  </span>
                </div>
                <div className="detail-row">
                  <span>Alpha : </span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(selectedSlip.potongan_alpha).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>BPJS (1%) : </span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(selectedSlip.potongan_bpjs).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>PPh 21 / Lainnya : </span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(selectedSlip.potongan_lain).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="slip-footer-summary">
              <div className="thp-label">TOTAL GAJI BERSIH (TAKE HOME PAY)</div>
              <div className="thp-value">
                Rp {Number(selectedSlip.gaji_bersih).toLocaleString('id-ID')}
              </div>
              <p className="keterangan-text">
                Catatan: {selectedSlip.keterangan}
              </p>
            </div>

            <div className="preview-actions">
              <button className="btn-print" onClick={() => window.print()}>
                {' '}
                Cetak / Simpan PDF
              </button>
              <button
                className="btn-close"
                onClick={() => setSelectedSlip(null)}
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="history-header-nav">
        <button
          className="btn-back-nav"
          onClick={() => navigate('/HrdPayroll')}
        >
          ← Kembali
        </button>
        <div className="header-title-area">
          <h1>Arsip Penggajian Digital</h1>
          <p>PT. Banggai Sentral Sulawesi</p>
        </div>
      </div>

      {/* SUMMARY CARD */}
      <div className="user-summary-card">
        <div className="user-badge">
          <div className="avatar-circle">
            {userMeta ? userMeta.charAt(0).toUpperCase() : '?'}
          </div>
          <div className="user-text">
            <h3>{userMeta || 'Karyawan'}</h3>
            <p>ID Karyawan : {id_user}</p>
          </div>
        </div>
        <div className="summary-stats">
          <div className="stat-box">
            <span className="stat-label">Total Slip Gaji : </span>
            <span className="stat-value">{riwayat.length}</span>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="loader-line"></div>
          <p>Mengsinkronisasi data...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th rowSpan="2">Periode</th>
                <th colSpan="3" className="th-group-info">
                  Kehadiran (Jam)
                </th>
                <th colSpan="3" className="th-group-income">
                  Pendapatan (Rp)
                </th>
                <th colSpan="4" className="th-group-deduction">
                  Potongan (Rp)
                </th>
                <th rowSpan="2">Bersih</th>
                <th rowSpan="2">Status</th>
                <th rowSpan="2">Aksi</th>
              </tr>
              <tr>
                <th>Kerja</th>
                <th>Lembur</th>
                <th>Telat</th>
                <th>Pokok</th>
                <th>Lembur</th>
                <th>Mkn/Trp</th>
                <th>BPJS</th>
                <th>Lain/Pjk</th>
                <th>Telat</th>
                <th>Alpha</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((h) => (
                  <tr key={h.id_slip}>
                    <td className="td-period">
                      <strong>{namaBulan[h.bulan - 1]}</strong>
                      <small>{h.tahun}</small>
                    </td>
                    <td>{h.total_jam_kerja}</td>
                    <td className="text-orange">{h.total_jam_lembur}</td>
                    <td className="text-red-light">{h.total_jam_telat}</td>

                    <td>{Number(h.gaji_pokok).toLocaleString('id-ID')}</td>
                    <td className="text-orange">
                      {Number(h.insentif_lembur).toLocaleString('id-ID')}
                    </td>
                    <td className="text-blue">
                      {Number(h.uang_makan_transport).toLocaleString('id-ID')}
                    </td>

                    <td className="text-red-light">
                      {Number(h.potongan_bpjs).toLocaleString('id-ID')}
                    </td>
                    <td className="text-red-light">
                      {Number(h.potongan_lain).toLocaleString('id-ID')}
                    </td>
                    <td className="text-red-light">
                      {Number(h.potongan_terlambat).toLocaleString('id-ID')}
                    </td>
                    <td className="text-red-light">
                      {Number(h.potongan_alpha).toLocaleString('id-ID')}
                    </td>

                    <td className="td-net">
                      <strong>
                        Rp {Number(h.gaji_bersih).toLocaleString('id-ID')}
                      </strong>
                    </td>
                    <td>
                      <span
                        className={`status-badge ${
                          h.status_bayar === 'paid' ? 'paid' : 'pending'
                        }`}
                      >
                        {h.status_bayar === 'paid' ? 'Lunas' : 'Pending'}
                      </span>
                    </td>
                    <td>
                      {/* KLIK TOMBOL INI BUAT MUNCULIN PREVIEW */}
                      <button
                        className="btn-icon-print"
                        title="Cetak Slip"
                        onClick={() => setSelectedSlip(h)}
                      >
                        <span>PDF</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="14" className="empty-cell">
                    Tidak ada data penggajian ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RiwayatGaji;
