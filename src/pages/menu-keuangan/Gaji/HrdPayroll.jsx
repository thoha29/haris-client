import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './HrdPayroll.css';

const HrdPayroll = () => {
  const navigate = useNavigate();
  const [karyawan, setKaryawan] = useState([]);
  const [skemaGajiList, setSkemaGajiList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [previewGaji, setPreviewGaji] = useState(null);

  const [formData, setFormData] = useState({
    gaji_pokok: '',
    tunjangan_jabatan: '',
    uang_makan_transport: '',
    nomor_sppd: '',
    tujuan: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    bulan: new Date().getMonth() + 1,
    tahun: new Date().getFullYear(),
  });

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
    const fetchData = async () => {
      try {
        const [resKaryawan, resSkema] = await Promise.all([
          axios.get('http://localhost:3000/absensi/hrd/list-karyawan'),
          axios.get('http://localhost:3000/api/skemagaji'),
        ]);
        setKaryawan(resKaryawan.data);
        setSkemaGajiList(resSkema.data);
      } catch (err) {
        console.error('Gagal ambil data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSkemaChange = (e) => {
    const selectedId = e.target.value;
    if (!selectedId) {
      setFormData((prev) => ({ ...prev, gaji_pokok: '', id_skemagaji: '' }));
      return;
    }
    const skema = skemaGajiList.find(
      (s) => String(s.id_skemagaji) === selectedId
    );
    if (skema) {
      setFormData((prev) => ({
        ...prev,
        id_skemagaji: skema.id_skemagaji,
        gaji_pokok: skema.gaji_bulanan,
      }));
    }
  };

  const handleProsesGaji = async (e) => {
    e.preventDefault();
    try {
      // Mapping manual supaya sinkron sama nama kolom di Database / Controller
      const payload = {
        id_user: selectedUser.id_user,
        id_skemagaji: formData.id_skemagaji || null,
        periode_bulan: formData.bulan,
        periode_tahun: formData.tahun,
        gaji_pokok: formData.gaji_pokok,
        tunjangan_jabatan: formData.tunjangan_jabatan || 0,
        uang_makan_transport: formData.uang_makan_transport || 0,
        nomor_sppd: formData.nomor_sppd,
        tujuan: formData.tujuan,
        tanggal_mulai: formData.tanggal_mulai,
        tanggal_selesai: formData.tanggal_selesai,
      };

      const res = await axios.post(
        'http://localhost:3000/api/gaji/proses',
        payload
      );

      // Mengambil data balikan dari backend untuk ditampilkan di rincian slip
      setPreviewGaji({ ...res.data.data, username: selectedUser.username });
      Swal.fire('Berhasil!', 'Gaji berhasil terproses.', 'success');
    } catch (err) {
      Swal.fire(
        'Gagal',
        'Gagal proses gaji: ' + (err.response?.data?.error || err.message),
        'error'
      );
    }
  };

  const resetView = () => {
    setSelectedUser(null);
    setPreviewGaji(null);
    setFormData({
      ...formData,
      gaji_pokok: '',
      tunjangan_jabatan: '',
      uang_makan_transport: '',
      nomor_sppd: '',
      tujuan: '',
      tanggal_mulai: '',
      tanggal_selesai: '',
    });
  };

  return (
    <div className="payroll-wrapper">
      <div className="payroll-header">
        <h1>Sistem Penggajian PT. BSS</h1>
        <p>Manajemen Payroll & SPPD Terintegrasi</p>
      </div>

      {loading ? (
        <div className="loading-state">Memuat data karyawan...</div>
      ) : previewGaji ? (
        /* --- PREVIEW SLIP GAJI DIGITAL --- */
        <div className="preview-container">
          <div className="preview-card slip-digital">
            <div className="slip-header">
              <div className="company-info">
                <h2>PT. BANGGAI SENTRAL SULAWESI</h2>
                <p>
                  Slip Gaji - {namaBulan[previewGaji.bulan - 1]}{' '}
                  {previewGaji.tahun}
                </p>
              </div>
              <div className="status-badge-verified">DATA TERSIMPAN ✅</div>
            </div>

            <div className="slip-user-info">
              <div className="info-item">
                <span>NAMA KARYAWAN : </span>
                <strong>{previewGaji.username}</strong>
              </div>
              <div className="info-item">
                <span>ID USER</span>
                <strong>:{previewGaji.id_user}</strong>
              </div>
            </div>

            <div className="slip-details-grid">
              <div className="slip-section">
                <h4 className="section-title">PENERIMAAN</h4>
                <div className="detail-row">
                  <span>
                    Gaji Pokok ({previewGaji.total_hadir}/
                    {previewGaji.hari_kerja_per_bulan || '22'} Hari)
                  </span>
                  <span>
                    Rp {Number(previewGaji.gaji_pokok).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Tunjangan Jabatan</span>
                  <span>
                    Rp{' '}
                    {Number(previewGaji.tunjangan_jabatan).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>
                    Insentif Lembur ({previewGaji.total_jam_lembur} Jam)
                  </span>
                  <span>
                    Rp{' '}
                    {Number(previewGaji.insentif_lembur).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row highlight-blue">
                  <span>Uang Makan/Transport & SPPD</span>
                  <span>
                    Rp{' '}
                    {Number(previewGaji.uang_makan_transport).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
              </div>

              <div className="slip-section">
                <h4 className="section-title">POTONGAN</h4>
                <div className="detail-row">
                  <span>Terlambat ({previewGaji.total_jam_telat} Jam)</span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(previewGaji.potongan_terlambat).toLocaleString(
                      'id-ID'
                    )}
                  </span>
                </div>
                <div className="detail-row">
                  <span>Total Jam Kerja (Bln Ini)</span>
                  <span className="text-blue">
                    {previewGaji.total_jam_kerja} Jam
                  </span>
                </div>
                <div className="detail-row">
                  <span>Alpha</span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(previewGaji.potongan_alpha).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>BPJS (1%)</span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(previewGaji.potongan_bpjs).toLocaleString('id-ID')}
                  </span>
                </div>
                <div className="detail-row">
                  <span>PPh 21 / Lainnya</span>
                  <span className="text-red">
                    - Rp{' '}
                    {Number(previewGaji.potongan_lain).toLocaleString('id-ID')}
                  </span>
                </div>
              </div>
            </div>

            <div className="slip-footer-summary">
              <div className="thp-label">TOTAL GAJI BERSIH (TAKE HOME PAY)</div>
              <div className="thp-value">
                Rp {Number(previewGaji.gaji_bersih).toLocaleString('id-ID')}
              </div>
              <p className="keterangan-text">
                Catatan: {previewGaji.keterangan}
              </p>
            </div>

            <div className="preview-actions">
              <button className="btn-finish" onClick={resetView}>
                Selesai & Kembali
              </button>
            </div>
          </div>
        </div>
      ) : selectedUser ? (
        /* --- FORM INPUT --- */
        <div className="payroll-form-card">
          <div className="form-header">
            <h3>
              Proses Gaji: <span>{selectedUser.username}</span>
            </h3>
          </div>
          <form onSubmit={handleProsesGaji}>
            <div className="input-row-flex">
              <div className="input-group flex-2">
                <label>Bulan</label>
                <select
                  value={formData.bulan}
                  onChange={(e) =>
                    setFormData({ ...formData, bulan: e.target.value })
                  }
                >
                  {namaBulan.map((bulan, i) => (
                    <option key={i + 1} value={i + 1}>
                      {bulan}
                    </option>
                  ))}
                </select>
              </div>
              <div className="input-group flex-1">
                <label>Tahun</label>
                <input
                  type="number"
                  value={formData.tahun}
                  onChange={(e) =>
                    setFormData({ ...formData, tahun: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="input-group">
              <label>Golongan / Skema Gaji</label>
              <select
                value={formData.id_skemagaji || ''}
                onChange={handleSkemaChange}
              >
                <option value="">-- Pilih Golongan --</option>
                {skemaGajiList.map((s) => (
                  <option key={s.id_skemagaji} value={s.id_skemagaji}>
                    {s.nama_golongan} — Rp{' '}
                    {Number(s.gaji_bulanan).toLocaleString('id-ID')} (Rate: Rp{' '}
                    {Number(s.rate_per_jam).toLocaleString('id-ID')}/Jam)
                  </option>
                ))}
              </select>
            </div>

            <div className="input-group">
              <label>
                Gaji Pokok (Rp) — <small>Otomatis terisi dari Golongan</small>
              </label>
              <input
                type="number"
                value={formData.gaji_pokok}
                onChange={(e) =>
                  setFormData({ ...formData, gaji_pokok: e.target.value })
                }
                required
              />
            </div>

            <div className="input-group">
              <label>Tunjangan Jabatan (Rp)</label>
              <input
                type="number"
                value={formData.tunjangan_jabatan}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    tunjangan_jabatan: e.target.value,
                  })
                }
              />
            </div>

            <div className="sppd-section-box">
              <h4>DATA DINAS LUAR (SPPD)</h4>
              <div className="input-group">
                <label>Nomor SPPD</label>
                <input
                  type="text"
                  placeholder="Contoh: SPPD/001/2026"
                  value={formData.nomor_sppd}
                  onChange={(e) =>
                    setFormData({ ...formData, nomor_sppd: e.target.value })
                  }
                />
              </div>
              <div className="input-group">
                <label>Tujuan Dinas</label>
                <input
                  type="text"
                  placeholder="Fakfak / Maybrat"
                  value={formData.tujuan}
                  onChange={(e) =>
                    setFormData({ ...formData, tujuan: e.target.value })
                  }
                />
              </div>
              <div className="input-row-flex">
                <div className="input-group flex-1">
                  <label>Tgl Mulai</label>
                  <input
                    type="date"
                    value={formData.tanggal_mulai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_mulai: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="input-group flex-1">
                  <label>Tgl Selesai</label>
                  <input
                    type="date"
                    value={formData.tanggal_selesai}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        tanggal_selesai: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="input-group no-margin">
                <label>Uang Makan/Transport & SPPD (Rp)</label>
                <input
                  type="number"
                  value={formData.uang_makan_transport}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      uang_makan_transport: e.target.value,
                    })
                  }
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">
                Simpan Slip Gaji
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => setSelectedUser(null)}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="payroll-grid">
          {karyawan.map((user) => (
            <div key={user.id_user} className="payroll-card">
              <div className="payroll-card-body">
                <div className="payroll-info">
                  <h3>{user.username}</h3>
                  <span className="badge-role">{user.role}</span>
                </div>
              </div>
              <div className="payroll-card-footer">
                <button
                  className="btn-input-blue"
                  onClick={() => setSelectedUser(user)}
                >
                  Proses
                </button>
                <button
                  className="btn-input-gray"
                  onClick={() => navigate(`/riwayat-gaji/${user.id_user}`)}
                >
                  Riwayat
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HrdPayroll;
