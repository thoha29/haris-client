import React, { useState, useEffect } from 'react';
import { getMasterTransportasiList } from '../services/dinasService';

const FormSppdKaryawan = ({ show, onClose, onSubmit }) => {
  const today = new Date().toISOString().split('T')[0];
  const userId = localStorage.getItem('userId');
  const username = localStorage.getItem('username') || 'Karyawan';

  const [form, setForm] = useState({
    nomor_sppd: '',
    alamat_tujuan: '',
    tugas: '',
    tanggal_mulai: '',
    tanggal_selesai: '',
    transportasi_perusahaan: '',
    transportasi_umum: '',
    tempat_tinggal: '',
    konsumsi: '',
    barang_bawaan_pt: '',
    satuan_barang_pt: '',
    barang_bawaan_karyawan: '',
    satuan_barang_karyawan: '',
    ditujuan_melapor_kepada: 'Atasan',
    keterangan: '',
  });
  const [transportasiList, setTransportasiList] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getMasterTransportasiList()
      .then((res) => setTransportasiList(res.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.alamat_tujuan.trim()) return alert('Alamat tujuan wajib diisi');
    if (!form.tanggal_mulai || !form.tanggal_selesai) return alert('Tanggal wajib diisi');
    if (form.tanggal_selesai < form.tanggal_mulai) return alert('Tanggal selesai tidak boleh sebelum tanggal mulai');

    const start = new Date(form.tanggal_mulai);
    const end = new Date(form.tanggal_selesai);
    const total_hari = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;

    try {
      setSubmitting(true);
      await onSubmit({ ...form, total_hari });
    } finally {
      setSubmitting(false);
    }
  };

  if (!show) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-container"
        style={{ maxWidth: '680px', maxHeight: '90vh', overflowY: 'auto' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h3><i className="bi bi-airplane-fill me-2"></i>Ajukan Perjalanan Dinas</h3>
          <button className="btn-close-modal" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {/* Info karyawan */}
          <div className="form-group mb-3 p-2 rounded" style={{ background: '#f0f4ff', border: '1px solid #c7d7ff' }}>
            <small className="text-muted">Pengaju: <strong>{username}</strong> (ID: {userId})</small>
          </div>

          <div className="row g-3">
            <div className="col-md-6 form-group">
              <label>Nomor SPPD <small className="text-muted">(opsional, akan digenerate)</small></label>
              <input name="nomor_sppd" className="form-control" value={form.nomor_sppd} onChange={handleChange} placeholder="Contoh: SPPD/2025/001" />
            </div>
            <div className="col-md-6 form-group">
              <label>Melapor Kepada *</label>
              <input name="ditujuan_melapor_kepada" className="form-control" value={form.ditujuan_melapor_kepada} onChange={handleChange} required />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Alamat / Kota Tujuan *</label>
            <input name="alamat_tujuan" className="form-control" value={form.alamat_tujuan} onChange={handleChange} required placeholder="Contoh: Jakarta, Jl. Sudirman No. 1" />
          </div>

          <div className="form-group mt-3">
            <label>Tugas / Keperluan Dinas</label>
            <textarea name="tugas" className="form-control" rows={3} value={form.tugas} onChange={handleChange} placeholder="Jelaskan tujuan dan tugas perjalanan dinas..." />
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6 form-group">
              <label>Tanggal Mulai *</label>
              <input type="date" name="tanggal_mulai" className="form-control" value={form.tanggal_mulai} onChange={handleChange} min={today} required />
            </div>
            <div className="col-md-6 form-group">
              <label>Tanggal Selesai *</label>
              <input type="date" name="tanggal_selesai" className="form-control" value={form.tanggal_selesai} onChange={handleChange} min={form.tanggal_mulai || today} required />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6 form-group">
              <label>Transportasi Perusahaan</label>
              <select name="transportasi_perusahaan" className="form-control" value={form.transportasi_perusahaan} onChange={handleChange}>
                <option value="">-- Tidak Menggunakan --</option>
                {transportasiList.filter(t => t.status === 'available').map(t => (
                  <option key={t.id} value={t.id}>{t.nama_transportasi} ({t.no_transportasi})</option>
                ))}
              </select>
            </div>
            <div className="col-md-6 form-group">
              <label>Transportasi Umum</label>
              <input name="transportasi_umum" className="form-control" value={form.transportasi_umum} onChange={handleChange} placeholder="Contoh: Kereta, Pesawat" />
            </div>
          </div>

          <div className="row g-3 mt-1">
            <div className="col-md-6 form-group">
              <label>Tempat Tinggal Selama Dinas</label>
              <input name="tempat_tinggal" className="form-control" value={form.tempat_tinggal} onChange={handleChange} placeholder="Hotel / Rumah Dinas / dll" />
            </div>
            <div className="col-md-6 form-group">
              <label>Konsumsi</label>
              <input name="konsumsi" className="form-control" value={form.konsumsi} onChange={handleChange} placeholder="Contoh: Ditanggung perusahaan" />
            </div>
          </div>

          <div className="form-group mt-3">
            <label>Keterangan Tambahan</label>
            <textarea name="keterangan" className="form-control" rows={2} value={form.keterangan} onChange={handleChange} placeholder="Catatan tambahan bila ada..." />
          </div>

          <div className="modal-footer mt-4">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={submitting}>Batal</button>
            <button type="submit" className="btn-primary" disabled={submitting}>
              {submitting ? <><i className="bi bi-hourglass-split me-1"></i>Mengajukan...</> : <><i className="bi bi-send me-1"></i>Ajukan SPPD</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FormSppdKaryawan;
