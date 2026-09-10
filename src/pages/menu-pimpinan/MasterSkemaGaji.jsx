import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import './MasterSkemaGaji.css';
import Pagination from '../../components/Pagination';

const MasterSkemaGaji = () => {
  const [skemas, setSkemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Form states
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    nama_golongan: '',
    upah_pokok: '',
    tunjangan_up: '',
    gaji_bulanan: '',
    jam_kerja_per_hari: '9',
    hari_kerja_per_bulan: '22',
    rate_per_jam: '',
  });

  const formRef = useRef(null);
  const API_URL = 'http://localhost:3000/api/skemagaji';

  const fetchSkemas = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      const data = Array.isArray(res.data) ? res.data : [];
      setSkemas(data);
    } catch (error) {
      console.error('Gagal mengambil data skema gaji:', error);
      Swal.fire('Error', 'Gagal memuat daftar skema gaji dari server.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkemas();
  }, []);

  // Handle Input Changes & Auto-Sum Gaji Bulanan
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto hitung total gaji bulanan jika user mengubah upah_pokok atau tunjangan_up
      if (name === 'upah_pokok' || name === 'tunjangan_up') {
        const uPokok = name === 'upah_pokok' ? parseFloat(value) || 0 : parseFloat(prev.upah_pokok) || 0;
        const tUp = name === 'tunjangan_up' ? parseFloat(value) || 0 : parseFloat(prev.tunjangan_up) || 0;
        if (uPokok > 0 || tUp > 0) {
          updated.gaji_bulanan = (uPokok + tUp).toString();
        }
      }

      return updated;
    });
  };

  // Kalkulasi Live Rate per Jam
  const liveCalculatedRate = useMemo(() => {
    const totalGaji = parseFloat(formData.gaji_bulanan) || 0;
    const jamHari = parseInt(formData.jam_kerja_per_hari) || 0;
    const hariBulan = parseInt(formData.hari_kerja_per_bulan) || 0;
    const totalJam = jamHari * hariBulan;
    if (totalGaji > 0 && totalJam > 0) {
      return Math.round(totalGaji / totalJam);
    }
    return 0;
  }, [formData.gaji_bulanan, formData.jam_kerja_per_hari, formData.hari_kerja_per_bulan]);

  // Total jam sebulan
  const liveTotalJam = useMemo(() => {
    const jamHari = parseInt(formData.jam_kerja_per_hari) || 0;
    const hariBulan = parseInt(formData.hari_kerja_per_bulan) || 0;
    return jamHari * hariBulan;
  }, [formData.jam_kerja_per_hari, formData.hari_kerja_per_bulan]);

  // Form Reset
  const handleResetForm = () => {
    setEditId(null);
    setEditingItem(null);
    setFormData({
      nama_golongan: '',
      upah_pokok: '',
      tunjangan_up: '',
      gaji_bulanan: '',
      jam_kerja_per_hari: '9',
      hari_kerja_per_bulan: '22',
      rate_per_jam: '',
    });
    setShowForm(false);
  };

  // Open Form for New
  const handleAddNew = () => {
    handleResetForm();
    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Open Form for Edit
  const handleEdit = (item) => {
    setEditId(item.id_skemagaji);
    setEditingItem(item);

    const uPokok = item.upah_pokok && parseFloat(item.upah_pokok) > 0 ? item.upah_pokok : '';
    const tUp = item.tunjangan_up && parseFloat(item.tunjangan_up) > 0 ? item.tunjangan_up : '';
    let gBulanan = item.gaji_bulanan && parseFloat(item.gaji_bulanan) > 0 ? item.gaji_bulanan : '';

    if (!gBulanan && (uPokok || tUp)) {
      gBulanan = ((parseFloat(uPokok) || 0) + (parseFloat(tUp) || 0)).toString();
    }

    setFormData({
      nama_golongan: item.nama_golongan || '',
      upah_pokok: uPokok,
      tunjangan_up: tUp,
      gaji_bulanan: gBulanan,
      jam_kerja_per_hari: (item.jam_kerja_per_hari || 9).toString(),
      hari_kerja_per_bulan: (item.hari_kerja_per_bulan || 22).toString(),
      rate_per_jam: item.rate_per_jam && parseFloat(item.rate_per_jam) > 0 ? item.rate_per_jam : '',
    });

    setShowForm(true);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Submit Handler dengan Konfirmasi Khusus untuk Mode Edit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nama_golongan.trim()) {
      return Swal.fire('Peringatan', 'Nama Golongan / Skema wajib diisi.', 'warning');
    }

    const gBulananVal = parseFloat(formData.gaji_bulanan) || 0;
    const uPokokVal = parseFloat(formData.upah_pokok) || 0;
    if (gBulananVal <= 0 && uPokokVal <= 0) {
      return Swal.fire('Peringatan', 'Gaji Pokok / Total Gaji Bulanan wajib diisi dan lebih dari 0.', 'warning');
    }

    // KONFIRMASI KHUSUS SAAT EDIT JIKA SKEMA INI SEDANG DIGUNAKAN KARYAWAN
    if (editId) {
      const karyawanCount = editingItem?.total_karyawan || 0;
      let warningHtml = `Apakah Anda yakin ingin menyimpan perubahan pada skema <strong>"${formData.nama_golongan}"</strong>?`;

      if (karyawanCount > 0) {
        warningHtml = `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <p>Skema gaji <strong>"${editingItem.nama_golongan}"</strong> saat ini sedang digunakan oleh <strong>${karyawanCount} karyawan aktif</strong>.</p>
            <div style="background-color: #fff3cd; color: #856404; padding: 12px; border-radius: 8px; border: 1px solid #ffeeba; margin: 12px 0;">
              <i class="bi bi-exclamation-triangle-fill" style="margin-right: 6px;"></i>
              <strong>Perhatian Pimpinan:</strong> Mengubah nominal gaji pokok atau jam kerja pada skema ini akan mempengaruhi perhitungan slip gaji/payroll karyawan yang terdaftar pada golongan ini.
            </div>
            <p style="margin-bottom: 0;">Apakah Anda tetap ingin melanjutkan proses penyimpanan perubahan ini?</p>
          </div>
        `;
      }

      const confirmEdit = await Swal.fire({
        title: 'Konfirmasi Perubahan Skema',
        html: warningHtml,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#2563eb',
        cancelButtonColor: '#64748b',
        confirmButtonText: 'Ya, Lanjutkan Simpan',
        cancelButtonText: 'Batal Periksa Kembali',
      });

      if (!confirmEdit.isConfirmed) {
        return;
      }
    }

    try {
      if (editId) {
        // UPDATE
        await axios.put(`${API_URL}/update/${editId}`, formData);
        Swal.fire({
          title: 'Berhasil Diperbarui!',
          text: `Skema gaji "${formData.nama_golongan}" berhasil diperbarui.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      } else {
        // TAMBAH
        await axios.post(`${API_URL}/tambah`, formData);
        Swal.fire({
          title: 'Berhasil Ditambahkan!',
          text: `Skema gaji baru "${formData.nama_golongan}" berhasil dibuat.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
      }

      handleResetForm();
      fetchSkemas();
    } catch (error) {
      console.error('Error simpan skema:', error);
      const errMsg = error.response?.data?.error || 'Terjadi kesalahan saat memproses data skema gaji.';
      Swal.fire('Gagal Menyimpan', errMsg, 'error');
    }
  };

  // Delete Handler dengan Proteksi Karyawan Aktif
  const handleDelete = async (item) => {
    // Cek jika skema sedang digunakan
    if (item.total_karyawan > 0) {
      return Swal.fire({
        title: 'Tidak Dapat Dihapus!',
        html: `
          <div style="text-align: left; font-size: 14px; line-height: 1.6;">
            <p>Skema golongan <strong>"${item.nama_golongan}"</strong> tidak dapat dihapus karena masih digunakan oleh <strong>${item.total_karyawan} karyawan</strong>.</p>
            <div style="background-color: #fee2e2; color: #b91c1c; padding: 12px; border-radius: 8px; border: 1px solid #fecaca; margin: 10px 0;">
              <i class="bi bi-shield-slash-fill" style="margin-right: 6px;"></i>
              Untuk menjaga integritas data penggajian, silakan alihkan skema gaji karyawan terkait ke golongan lain terlebih dahulu di menu <strong>Tambah User Karyawan</strong>.
            </div>
          </div>
        `,
        icon: 'error',
        confirmButtonColor: '#2563eb',
        confirmButtonText: 'Mengerti',
      });
    }

    // Jika tidak digunakan, minta konfirmasi biasa
    const result = await Swal.fire({
      title: 'Hapus Skema Gaji?',
      text: `Apakah Anda yakin ingin menghapus skema golongan "${item.nama_golongan}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal',
    });

    if (result.isConfirmed) {
      try {
        await axios.delete(`${API_URL}/hapus/${item.id_skemagaji}`);
        Swal.fire({
          title: 'Terhapus!',
          text: `Skema gaji "${item.nama_golongan}" berhasil dihapus.`,
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
        });
        fetchSkemas();
      } catch (error) {
        console.error('Gagal hapus skema:', error);
        const errMsg = error.response?.data?.error || 'Gagal menghapus data skema gaji.';
        Swal.fire('Error', errMsg, 'error');
      }
    }
  };

  // Hitung KPI Ringkasan
  const kpiData = useMemo(() => {
    const totalGolongan = skemas.length;
    let totalKaryawan = 0;
    let maxGaji = 0;
    let totalNominalGaji = 0;

    skemas.forEach((s) => {
      totalKaryawan += parseInt(s.total_karyawan) || 0;
      const g = parseFloat(s.gaji_bulanan) || (parseFloat(s.upah_pokok) || 0) + (parseFloat(s.tunjangan_up) || 0);
      if (g > maxGaji) maxGaji = g;
      totalNominalGaji += g;
    });

    const rataGaji = totalGolongan > 0 ? Math.round(totalNominalGaji / totalGolongan) : 0;

    return {
      totalGolongan,
      totalKaryawan,
      maxGaji,
      rataGaji,
    };
  }, [skemas]);

  // Filtering
  const filteredSkemas = useMemo(() => {
    return skemas.filter((item) =>
      (item.nama_golongan || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [skemas, searchTerm]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Pagination
  const paginatedSkemas = useMemo(() => {
    if (pageSize === 'Semua') return filteredSkemas;
    const size = Number(pageSize);
    const start = (currentPage - 1) * size;
    return filteredSkemas.slice(start, start + size);
  }, [filteredSkemas, currentPage, pageSize]);

  // Format Helper
  const formatRp = (num) => {
    const val = Number(num) || 0;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="master-skemagaji-container">
      {/* Header Halaman */}
      <div className="page-header-box">
        <div className="header-title-group">
          <h1>
            <i className="bi bi-wallet2 text-primary"></i> Master Skema Gaji
          </h1>
          <p>
            Konfigurasi level golongan, upah pokok, tunjangan, parameter jam kerja, dan kalkulasi tarif rate lembur/terlambat per jam.
          </p>
        </div>
        <button
          className="btn-toggle-form"
          onClick={() => {
            if (showForm && !editId) {
              setShowForm(false);
            } else {
              handleAddNew();
            }
          }}
        >
          <i className={`bi ${showForm && !editId ? 'bi-x-lg' : 'bi-plus-lg'}`}></i>
          {showForm && !editId ? 'Tutup Form' : 'Tambah Golongan Baru'}
        </button>
      </div>

      {/* KPI Cards Ringkasan */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-icon blue">
            <i className="bi bi-layers-fill"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Total Golongan / Skema</span>
            <span className="kpi-value">{kpiData.totalGolongan} Golongan</span>
          </div>
        </div>

        <div className="kpi-card green">
          <div className="kpi-icon green">
            <i className="bi bi-people-fill"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Karyawan Terhubung</span>
            <span className="kpi-value">{kpiData.totalKaryawan} Karyawan</span>
          </div>
        </div>

        <div className="kpi-card purple">
          <div className="kpi-icon purple">
            <i className="bi bi-cash-stack"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Gaji Pokok Tertinggi</span>
            <span className="kpi-value">{formatRp(kpiData.maxGaji)}</span>
          </div>
        </div>

        <div className="kpi-card orange">
          <div className="kpi-icon orange">
            <i className="bi bi-calculator-fill"></i>
          </div>
          <div className="kpi-info">
            <span className="kpi-label">Rata-rata Gaji Pokok</span>
            <span className="kpi-value">{formatRp(kpiData.rataGaji)}</span>
          </div>
        </div>
      </div>

      {/* Form Tambah / Edit Skema */}
      {showForm && (
        <div className={`form-card ${editId ? 'edit-mode' : ''}`} ref={formRef}>
          <div className="form-header-bar">
            <h2 className="form-title">
              <i className={`bi ${editId ? 'bi-pencil-square text-warning' : 'bi-plus-circle text-primary'}`}></i>
              {editId ? `Edit Skema Gaji: ${editingItem?.nama_golongan}` : 'Tambah Skema / Golongan Gaji Baru'}
            </h2>
            {editId && (
              <span className="edit-badge-warning">
                <i className="bi bi-info-circle me-1"></i>
                Digunakan oleh {editingItem?.total_karyawan || 0} karyawan
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid-sg">
              <div className="form-group-sg">
                <label>
                  Nama Golongan / Skema Jabatan <span className="req">*</span>
                </label>
                <input
                  type="text"
                  name="nama_golongan"
                  value={formData.nama_golongan}
                  onChange={handleInputChange}
                  className="form-input-sg"
                  placeholder="Contoh: Grade A, Staff IT, Supervisor"
                  required
                />
              </div>

              <div className="form-group-sg">
                <label>Upah Pokok (Rp)</label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rp</span>
                  <input
                    type="number"
                    name="upah_pokok"
                    value={formData.upah_pokok}
                    onChange={handleInputChange}
                    className="form-input-sg has-prefix"
                    placeholder="Contoh: 3500000"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group-sg">
                <label>Tunjangan Tetap / UP (Rp)</label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rp</span>
                  <input
                    type="number"
                    name="tunjangan_up"
                    value={formData.tunjangan_up}
                    onChange={handleInputChange}
                    className="form-input-sg has-prefix"
                    placeholder="Contoh: 1000000"
                    min="0"
                  />
                </div>
              </div>

              <div className="form-group-sg">
                <label>
                  Total Gaji Pokok Bulanan (Rp) <span className="req">*</span>
                </label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rp</span>
                  <input
                    type="number"
                    name="gaji_bulanan"
                    value={formData.gaji_bulanan}
                    onChange={handleInputChange}
                    className="form-input-sg has-prefix"
                    placeholder="Contoh: 4500000"
                    required
                    min="1"
                  />
                </div>
              </div>

              <div className="form-group-sg">
                <label>
                  Jam Kerja / Hari <span className="req">*</span>
                </label>
                <input
                  type="number"
                  name="jam_kerja_per_hari"
                  value={formData.jam_kerja_per_hari}
                  onChange={handleInputChange}
                  className="form-input-sg"
                  placeholder="9"
                  min="1"
                  max="24"
                  required
                />
              </div>

              <div className="form-group-sg">
                <label>
                  Hari Kerja / Bulan <span className="req">*</span>
                </label>
                <input
                  type="number"
                  name="hari_kerja_per_bulan"
                  value={formData.hari_kerja_per_bulan}
                  onChange={handleInputChange}
                  className="form-input-sg"
                  placeholder="22"
                  min="1"
                  max="31"
                  required
                />
              </div>

              {/* <div className="form-group-sg">
                <label>Tarif / Rate Per Jam Khusus (Rp) - Opsional</label>
                <div className="input-with-icon">
                  <span className="input-prefix">Rp</span>
                  <input
                    type="number"
                    name="rate_per_jam"
                    value={formData.rate_per_jam}
                    onChange={handleInputChange}
                    className="form-input-sg has-prefix"
                    placeholder="Biarkan kosong untuk kalkulasi otomatis"
                    min="0"
                  />
                </div>
              </div> */}
            </div>

            {/* Box Preview Perhitungan Rate per Jam */}
            <div className="rate-calc-box">
              <div className="rate-calc-text">
                <h4>
                  <i className="bi bi-calculator"></i> Kalkulasi Otomatis Tarif Rate Per Jam
                </h4>
                <p>
                  Rumus: <strong>Gaji Bulanan ÷ ({formData.jam_kerja_per_hari || 0} Jam × {formData.hari_kerja_per_bulan || 0} Hari)</strong> = Total {liveTotalJam} Jam Kerja/Bulan.
                </p>
              </div>
              <div className="rate-calc-badge">
                <i className="bi bi-clock-history"></i>
                <span>
                  {formData.rate_per_jam
                    ? `${formatRp(formData.rate_per_jam)} / Jam (Manual)`
                    : `${formatRp(liveCalculatedRate)} / Jam (Auto)`}
                </span>
              </div>
            </div>

            <div className="button-group-sg">
              <button
                type="button"
                onClick={handleResetForm}
                className="btn-sg btn-sg-secondary"
              >
                <i className="bi bi-x-circle"></i> Batal
              </button>
              <button
                type="submit"
                className={`btn-sg ${editId ? 'btn-sg-warning' : 'btn-sg-primary'}`}
              >
                <i className={`bi ${editId ? 'bi-check2-circle' : 'bi-save'}`}></i>
                {editId ? 'Simpan Perubahan Skema' : 'Simpan Skema Baru'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tabel Data Master Skema Gaji */}
      <div className="table-card">
        <div className="table-header-box">
          <h2 className="table-title">Daftar Skema & Golongan Gaji</h2>
          <div className="table-controls">
            <div className="search-box-sg">
              <i className="bi bi-search search-icon"></i>
              <input
                type="text"
                placeholder="Cari nama golongan..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input-sg"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="loading-state-sg">
            <div className="spinner-border text-primary me-2" role="status"></div>
            Memuat data skema gaji...
          </div>
        ) : (
          <>
            <div className="table-responsive-sg">
              <table className="data-table-sg">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Golongan / Skema</th>
                    <th>Gaji Pokok Bulanan</th>
                    <th>Jam / Hari</th>
                    <th>Hari / Bulan</th>
                    <th>Total Jam / Bln</th>
                    {/* <th>Tarif Rate / Jam</th> */}
                    <th>Karyawan Terkait</th>
                    <th style={{ textAlign: 'center' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedSkemas.length > 0 ? (
                    paginatedSkemas.sort((a, b) => Number(a.id_skemagaji) - Number(b.id_skemagaji)).map((item, index) => {
                      const totalJam = (parseInt(item.jam_kerja_per_hari) || 0) * (parseInt(item.hari_kerja_per_bulan) || 0);
                      const nominalGaji = parseFloat(item.gaji_bulanan) || ((parseFloat(item.upah_pokok) || 0) + (parseFloat(item.tunjangan_up) || 0));
                      const rateVal = parseFloat(item.rate_per_jam) || (totalJam > 0 ? Math.round(nominalGaji / totalJam) : 0);
                      const totalKaryawanNum = parseInt(item.total_karyawan) || 0;
                      const rowNumber = pageSize === 'Semua' ? index + 1 : (currentPage - 1) * Number(pageSize) + index + 1;

                      return (
                        <tr key={item.id_skemagaji}>
                          <td>{rowNumber}</td>
                          <td>
                            <span className="golongan-name">{item.nama_golongan}</span>
                            <span className="gaji-breakdown">ID: #{item.id_skemagaji}</span>
                          </td>
                          <td>
                            <span className="gaji-amount">{formatRp(nominalGaji)}</span>
                            {(parseFloat(item.upah_pokok) > 0 || parseFloat(item.tunjangan_up) > 0) && (
                              <div className="gaji-breakdown">
                                Pokok: {formatRp(item.upah_pokok)} | UP: {formatRp(item.tunjangan_up)}
                              </div>
                            )}
                          </td>
                          <td>{item.jam_kerja_per_hari || 9} Jam</td>
                          <td>{item.hari_kerja_per_bulan || 22} Hari</td>
                          <td>{totalJam} Jam</td>
                          {/* <td>
                            <span className="badge-rate">
                              {formatRp(rateVal)} / Jam
                            </span>
                          </td> */}
                          <td>
                            <span className={`badge-karyawan ${totalKaryawanNum > 0 ? 'active' : 'zero'}`}>
                              <i className="bi bi-people-fill"></i>
                              {totalKaryawanNum} Karyawan
                            </span>
                          </td>
                          <td>
                            <div className="table-actions" style={{ justifyContent: 'center' }}>
                              <button
                                className="btn-action btn-action-edit"
                                onClick={() => handleEdit(item)}
                                title="Edit Skema Gaji"
                              >
                                <i className="bi bi-pencil-fill"></i> Edit
                              </button>
                              <button
                                className="btn-action btn-action-delete"
                                onClick={() => handleDelete(item)}
                                title={totalKaryawanNum > 0 ? 'Tidak dapat dihapus karena digunakan karyawan' : 'Hapus Skema Gaji'}
                              >
                                <i className="bi bi-trash-fill"></i> Hapus
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="9" className="empty-state-sg">
                        <div className="empty-icon">
                          <i className="bi bi-inbox"></i>
                        </div>
                        <p style={{ margin: 0 }}>
                          {searchTerm
                            ? `Tidak ada skema gaji yang cocok dengan pencarian "${searchTerm}".`
                            : 'Belum ada data Skema / Golongan Gaji yang terdaftar.'}
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <Pagination
              currentPage={currentPage}
              totalItems={filteredSkemas.length}
              pageSize={pageSize}
              onPageChange={(page) => setCurrentPage(page)}
              onPageSizeChange={(size) => {
                setPageSize(size);
                setCurrentPage(1);
              }}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default MasterSkemaGaji;
