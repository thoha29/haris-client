import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './SlipGaji.css';

const SlipGaji = () => {
  const navigate = useNavigate();
  const [riwayat, setRiwayat] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSlip, setSelectedSlip] = useState(null);

  // Ambil data dari localStorage
  const id_user = localStorage.getItem('userId');
  const username = localStorage.getItem('username');

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
      if (!id_user) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Memanggil API yang sudah di-JOIN dengan tabel data_pribadi di backend
        const res = await axios.get(
          `http://localhost:3000/api/gaji/riwayat/${id_user}`
        );
        setRiwayat(res.data);
      } catch (err) {
        console.error('Gagal ambil riwayat gaji:', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchRiwayat();
  }, [id_user]);

  if (!id_user && !loading) {
    return (
      <div className="history-page-wrapper">
        <div
          className="error-box"
          style={{ textAlign: 'center', marginTop: '50px' }}
        >
          <h2>Sesi Berakhir</h2>
          <p>Silakan login kembali untuk melihat data gaji.</p>
          <button onClick={() => navigate('/login')} className="btn-print">
            Kembali ke Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-page-wrapper">
      {/* MODAL SLIP GAJI DENGAN DETAIL DATA PRIBADI HASIL JOIN */}
      {selectedSlip && (
        <div className="preview-overlay">
          <div className="preview-card slip-digital" id="printable-slip">
            <div className="slip-header-official">
              <h2>PT. BANGGAI SENTRAL SULAWESI</h2>
              <p>
                SLIP GAJI KARYAWAN -{' '}
                {namaBulan[selectedSlip.bulan - 1].toUpperCase()}{' '}
                {selectedSlip.tahun}
              </p>
            </div>

            {/* SECTION DATA KARYAWAN (Sudah terhubung dengan data_pribadi) */}
            <div className="employee-info-grid">
              <div className="info-col">
                <div className="info-row">
                  <span>Nama Lengkap</span>:{' '}
                  <strong>
                    {selectedSlip.nama_lengkap ||
                      selectedSlip.username ||
                      username}
                  </strong>
                </div>
                <div className="info-row">
                  <span>NIK</span>: {selectedSlip.nik || 'Belum di-input'}
                </div>
                <div className="info-row">
                  <span>NIP</span>: {selectedSlip.nip || 'Belum di-input'}
                </div>
              </div>
              <div className="info-col">
                <div className="info-row">
                  <span>Jabatan</span>: {selectedSlip.jabatan || 'Staff'}
                </div>
                <div className="info-row">
                  <span>Status</span>: {selectedSlip.status_karyawan || 'Aktif'}
                </div>
                <div className="info-row">
                  <span>ID User</span>: {id_user}
                </div>
              </div>
            </div>

            <div className="slip-details-grid">
              <div className="slip-section">
                <h4 className="section-title">PENERIMAAN ( + )</h4>
                <div className="detail-row">
                  <span>Gaji Pokok : </span>
                  <span>
                    Rp {Number(selectedSlip.gaji_pokok).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Tunjangan : </span>
                  <span>
                    Rp{' '}
                    {Number(selectedSlip.tunjangan_jabatan || 0).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Lembur ({selectedSlip.total_jam_lembur} Jam): </span>
                  <span>
                    Rp{' '}
                    {Number(selectedSlip.insentif_lembur || 0).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row highlight-blue">
                  <span>Makan/Transport & SPPD: </span>
                  <span>
                    Rp{' '}
                    {Number(
                      selectedSlip.uang_makan_transport || 0
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
              <div className="slip-section">
                <h4 className="section-title">POTONGAN ( - )</h4>
                <div className="detail-row">
                  <span>Terlambat ({selectedSlip.total_jam_telat} Jam): </span>
                  <span className="text-red">
                    Rp{' '}
                    {Number(
                      selectedSlip.potongan_terlambat || 0
                    ).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Alpha : </span>
                  <span className="text-red">
                    Rp{' '}
                    {Number(selectedSlip.potongan_alpha || 0).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>BPJS (1%) : </span>
                  <span className="text-red">
                    Rp{' '}
                    {Number(selectedSlip.potongan_bpjs || 0).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>PPh 21 / Lain : </span>
                  <span className="text-red">
                    Rp{' '}
                    {Number(selectedSlip.potongan_lain || 0).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="total-summary-box">
              <div className="thp-label">TOTAL GAJI BERSIH (TAKE HOME PAY)</div>
              <div className="thp-amount">
                Rp {Number(selectedSlip.gaji_bersih).toLocaleString('id-ID')}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontSize: '14px',
                  textAlign: 'right',
                  fontWeight: 'bold',
                  color:
                    selectedSlip.status_bayar === 'paid' ? 'green' : 'orange',
                }}
              >
                Status:{' '}
                {selectedSlip.status_bayar === 'paid' &&
                selectedSlip.tanggal_dibayar
                  ? `LUNAS PADA ${new Date(
                      selectedSlip.tanggal_dibayar
                    ).toLocaleDateString('id-ID')}`
                  : 'PENDING'}
              </div>
            </div>

            <div className="preview-actions">
              <button className="btn-print" onClick={() => window.print()}>
                Cetak Slip (PDF)
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

      <div className="history-header-simple">
        <h1>Arsip Slip Gaji Digital</h1>
        <p>Halo, {username}!</p>
      </div>

      {loading ? (
        <div
          className="loading-container"
          style={{ textAlign: 'center', padding: '50px' }}
        >
          <p>Sedang memuat data gaji...</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="styled-table">
            <thead>
              <tr>
                <th>Periode/Tahun</th>
                <th>Gaji Pokok</th>
                <th>Tunjangan</th>
                <th>Lembur/SPPD</th>
                <th>Potongan</th>
                <th>Total Bersih</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {riwayat.length > 0 ? (
                riwayat.map((h) => {
                  const totalPot =
                    (Number(h.potongan_bpjs) || 0) +
                    (Number(h.potongan_lain) || 0) +
                    (Number(h.potongan_terlambat) || 0) +
                    (Number(h.potongan_alpha) || 0);
                  const totalLemburSppd =
                    (Number(h.insentif_lembur) || 0) +
                    (Number(h.uang_makan_transport) || 0);
                  return (
                    <tr key={h.id_slip}>
                      <td>
                        <strong>{namaBulan[h.bulan - 1]}</strong> {h.tahun}
                      </td>
                      <td>{Number(h.gaji_pokok).toLocaleString('id-ID')}</td>
                      <td>
                        {Number(h.tunjangan_jabatan || 0).toLocaleString(
                          'id-ID'
                        )}
                      </td>
                      <td>{Number(totalLemburSppd).toLocaleString('id-ID')}</td>
                      <td>{Number(totalPot).toLocaleString('id-ID')}</td>
                      <td className="td-net">
                        <strong>
                          Rp {Number(h.gaji_bersih).toLocaleString('id-ID')}
                        </strong>
                      </td>
                      <td>
                        <span
                          style={{
                            fontWeight: 'bold',
                            color:
                              h.status_bayar === 'paid' ? 'green' : 'orange',
                          }}
                        >
                          {h.status_bayar === 'paid' && h.tanggal_dibayar
                            ? `Paid (${new Date(
                                h.tanggal_dibayar
                              ).toLocaleDateString('id-ID')})`
                            : 'Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn-open-slip"
                          onClick={() => setSelectedSlip(h)}
                        >
                          Buka Slip
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="8"
                    style={{ textAlign: 'center', padding: '20px' }}
                  >
                    Belum ada riwayat gaji tersedia.
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

export default SlipGaji;
