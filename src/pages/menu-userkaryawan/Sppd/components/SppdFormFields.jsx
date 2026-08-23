import React from 'react';
import SelectSearch from '../../../../components/SelectSearch';

const SppdFormFields = ({ formData, setFormData, karyawanList, transportasiList }) => {
  const handleChange = (field, rawValue) => {
    let scalarValue = rawValue;
    if (rawValue && typeof rawValue === 'object') {
      if (rawValue.value !== undefined) {
        scalarValue = rawValue.value;
      } else if (rawValue.target && rawValue.target.value !== undefined) {
        scalarValue = rawValue.target.value;
      }
    }

    const updated = { ...formData, [field]: scalarValue };

    // Auto calculate total_hari if tanggal_mulai or tanggal_selesai changed
    if (field === 'tanggal_mulai' || field === 'tanggal_selesai') {
      const tglMulai = field === 'tanggal_mulai' ? scalarValue : formData.tanggal_mulai;
      const tglSelesai = field === 'tanggal_selesai' ? scalarValue : formData.tanggal_selesai;

      if (tglMulai && tglSelesai) {
        const start = new Date(tglMulai);
        const end = new Date(tglSelesai);
        if (end >= start) {
          const diff = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) + 1;
          updated.total_hari = diff;
        }
      }
    }

    setFormData(updated);
  };

  return (
    <div>
      {/* Bagian 1: Data Karyawan & Surat */}
      <div className="sppd-form-section">
        <h4>1. Informasi Penugasan & Karyawan</h4>
        <div className="row">
          <div className="col-md-6 form-group-custom">
            <label>
              Pilih Karyawan Yang Ditugaskan <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <SelectSearch
              value={formData.id_user}
              onChange={(e) => {
                const val = e && typeof e === 'object' ? (e.value !== undefined ? e.value : e.target?.value) : e;
                handleChange('id_user', val || '');
              }}
              options={karyawanList.map((k) => ({
                value: (k.id_user || k.id || '').toString(),
                label: `${k.username || k.name || 'Karyawan'} (${k.role || 'Karyawan'} - ${k.lokasi_kerja || 'Kantor'})`,
              }))}
              placeholder="-- Pilih Karyawan --"
              className="form-control-clean"
              isClearable
              required
            />
          </div>

          <div className="col-md-6 form-group-custom">
            <label>
              Nomor SPPD <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Masukkan nomor SPPD"
              value={formData.nomor_sppd}
              onChange={(e) => handleChange('nomor_sppd', e.target.value)}
              required
            />
          </div>

          <div className="col-md-6 form-group-custom">
            <label>
              Alamat / Kota Tujuan <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <textarea
              className="form-control-clean"
              rows="2"
              placeholder="Alamat lengkap tujuan perjalanan dinas"
              value={formData.alamat_tujuan}
              onChange={(e) => handleChange('alamat_tujuan', e.target.value)}
              required
            ></textarea>
          </div>

          <div className="col-md-6 form-group-custom">
            <label>Tugas / Maksud Penugasan</label>
            <textarea
              className="form-control-clean"
              rows="2"
              placeholder="Jelaskan rincian agenda tugas dinas"
              value={formData.tugas}
              onChange={(e) => handleChange('tugas', e.target.value)}
            ></textarea>
          </div>
        </div>
      </div>

      {/* Bagian 2: Tanggal & Akomodasi */}
      <div className="sppd-form-section">
        <h4>2. Jadwal, Penginapan & Konsumsi</h4>
        <div className="row">
          <div className="col-md-4 form-group-custom">
            <label>
              Tanggal Mulai <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="date"
              className="form-control-clean"
              value={formData.tanggal_mulai}
              onChange={(e) => handleChange('tanggal_mulai', e.target.value)}
              required
            />
          </div>

          <div className="col-md-4 form-group-custom">
            <label>
              Tanggal Selesai <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <input
              type="date"
              className="form-control-clean"
              value={formData.tanggal_selesai}
              min={formData.tanggal_mulai}
              onChange={(e) => handleChange('tanggal_selesai', e.target.value)}
              required
            />
          </div>

          <div className="col-md-4 form-group-custom">
            <label>Total Hari</label>
            <input
              type="number"
              className="form-control-clean"
              style={{ backgroundColor: '#e9ecef', fontWeight: '700' }}
              value={formData.total_hari}
              readOnly
            />
          </div>

          <div className="col-md-6 form-group-custom">
            <label>
              Tempat Tinggal / Penginapan <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <select
              className="form-control-clean"
              value={formData.tempat_tinggal}
              onChange={(e) => handleChange('tempat_tinggal', e.target.value)}
              required
            >
              <option value="Mess">Mess</option>
              <option value="Losmen">Losmen</option>
              <option value="Hotel">Hotel</option>
              <option value="Rumah Sendiri/Kel">Rumah Sendiri / Keluarga</option>
              <option value="Nota/Kwitansi">Nota / Kwitansi Reimburse</option>
            </select>
          </div>

          <div className="col-md-6 form-group-custom">
            <label>
              Konsumsi <span style={{ color: '#dc3545' }}>*</span>
            </label>
            <select
              className="form-control-clean"
              value={formData.konsumsi}
              onChange={(e) => handleChange('konsumsi', e.target.value)}
              required
            >
              <option value="Dapur Umum">Dapur Umum</option>
              <option value="Tanggungan Karyawan">Tanggungan Karyawan</option>
              <option value="Nota/Kwitansi">Nota / Kwitansi Reimburse</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bagian 3: Transportasi & Logistik */}
      <div className="sppd-form-section">
        <h4>3. Transportasi & Logistik Barang</h4>
        <div className="row">
          <div className="col-md-6 form-group-custom">
            <label>Transportasi Perusahaan (Opsional)</label>
            <select
              className="form-control-clean"
              value={formData.transportasi_perusahaan}
              onChange={(e) => handleChange('transportasi_perusahaan', e.target.value)}
            >
              <option value="">-- Tidak Menggunakan Kendaraan PT --</option>
              {transportasiList
                .filter((t) => !t.status || t.status === 'available')
                .map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama_transportasi} ({t.no_transportasi})
                  </option>
                ))}
            </select>
          </div>

          <div className="col-md-6 form-group-custom">
            <label>Transportasi Umum (Opsional)</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Contoh: Pesawat Garuda / Kereta Argo / Travel"
              value={formData.transportasi_umum}
              onChange={(e) => handleChange('transportasi_umum', e.target.value)}
            />
          </div>

          <div className="col-md-3 form-group-custom">
            <label>Barang Bawaan PT (Jumlah)</label>
            <input
              type="number"
              className="form-control-clean"
              placeholder="0"
              value={formData.barang_bawaan_pt}
              onChange={(e) => handleChange('barang_bawaan_pt', e.target.value)}
              min="0"
            />
          </div>

          <div className="col-md-3 form-group-custom">
            <label>Satuan Barang PT</label>
            <select
              className="form-control-clean"
              value={formData.satuan_barang_pt}
              onChange={(e) => handleChange('satuan_barang_pt', e.target.value)}
            >
              <option value="">- Pilih -</option>
              <option value="KG">KG</option>
              <option value="KOLI">KOLI</option>
            </select>
          </div>

          <div className="col-md-3 form-group-custom">
            <label>Barang Bawaan Karyawan</label>
            <input
              type="number"
              className="form-control-clean"
              placeholder="0"
              value={formData.barang_bawaan_karyawan}
              onChange={(e) => handleChange('barang_bawaan_karyawan', e.target.value)}
              min="0"
            />
          </div>

          <div className="col-md-3 form-group-custom">
            <label>Satuan Barang Karyawan</label>
            <select
              className="form-control-clean"
              value={formData.satuan_barang_karyawan}
              onChange={(e) => handleChange('satuan_barang_karyawan', e.target.value)}
            >
              <option value="">- Pilih -</option>
              <option value="KG">KG</option>
              <option value="KOLI">KOLI</option>
            </select>
          </div>

          <div className="col-md-6 form-group-custom">
            <label>Di Tempat Tujuan Melapor Kepada</label>
            <select
              className="form-control-clean"
              value={formData.ditujuan_melapor_kepada}
              onChange={(e) => handleChange('ditujuan_melapor_kepada', e.target.value)}
            >
              <option value="Atasan">Atasan Setempat</option>
              <option value="HRD">HRD Setempat</option>
              <option value="Lainnya">Lainnya / PIC Lapangan</option>
            </select>
          </div>

          <div className="col-md-6 form-group-custom">
            <label>Keterangan Tambahan (Opsional)</label>
            <input
              type="text"
              className="form-control-clean"
              placeholder="Catatan tambahan bila ada..."
              value={formData.keterangan}
              onChange={(e) => handleChange('keterangan', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SppdFormFields;
