import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import {
  getPengaturanSkema,
  updatePengaturanSkema,
  getDaftarSkema,
} from './services/pengaturanSkemaService';
import '../MasterKomponenRab/MasterKomponenRab.css';
import './PengaturanSkema.css';

const PengaturanSkema = () => {
  const [settings, setSettings] = useState([]);
  const [skemaList, setSkemaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resSettings, resSkema] = await Promise.all([
        getPengaturanSkema(),
        getDaftarSkema(),
      ]);
      setSettings(resSettings.data || []);
      setSkemaList(resSkema.data || []);
    } catch (err) {
      console.error('Error fetching settings:', err);
      Swal.fire('Error', 'Gagal memuat pengaturan skema absensi', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChangeSkema = (key_setting, newIdSkema) => {
    setSettings((prev) =>
      prev.map((item) =>
        item.key_setting === key_setting
          ? { ...item, id_skema: Number(newIdSkema) }
          : item
      )
    );
  };

  const handleSaveSetting = async (item) => {
    try {
      setSavingKey(item.key_setting);
      await updatePengaturanSkema(item.key_setting, item.id_skema, item.keterangan);
      Swal.fire({
        icon: 'success',
        title: 'Tersimpan',
        text: `Pengaturan skema berhasil diperbarui!`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (err) {
      Swal.fire('Gagal', err.response?.data?.error || 'Gagal menyimpan pengaturan', 'error');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="hrd-page-container">
      <div className="hrd-card">
        {/* Header */}
        <div className="hrd-page-header">
          <div>
            <h2>Pengaturan Skema Otomatis (HRD)</h2>
            <p>
              Tentukan skema absensi yang secara otomatis akan di-assign saat karyawan ditugaskan dinas (SPPD) atau saat tipe kerja non-shift dipilih.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="mt-2 text-muted small">Memuat konfigurasi skema...</p>
          </div>
        ) : (
          <div className="row">
            {settings.map((item) => {
              const isDinas = item.key_setting === 'skema_dinas';
              const title = isDinas
                ? 'Skema Otomatis Perjalanan Dinas (SPPD)'
                : 'Skema Default Karyawan Non-Shift';

              return (
                <div className="col-md-6" key={item.key_setting}>
                  <div className="setting-box">
                    <h4>{title}</h4>
                    <p>
                      {item.keterangan ||
                        (isDinas
                          ? 'Skema yang akan otomatis diterapkan pada jadwal karyawan ketika surat perjalanan dinas (SPPD) disetujui.'
                          : 'Skema default yang digunakan saat penugasan jadwal harian karyawan tipe non-shift.')}
                    </p>

                    <label>Pilih Skema Yang Ditugaskan:</label>
                    <select
                      className="form-control-clean"
                      value={item.id_skema}
                      onChange={(e) => handleChangeSkema(item.key_setting, e.target.value)}
                    >
                      {skemaList.map((skema) => (
                        <option key={skema.id_skema} value={skema.id_skema}>
                          {skema.nama_skema} (Jam: {skema.jam_masuk || '00:00'} - {skema.jam_keluar || '00:00'})
                        </option>
                      ))}
                    </select>

                    <div className="setting-box-footer">
                      <small className="text-muted">
                        Setting key: <code style={{ color: '#1f4e78' }}>{item.key_setting}</code>
                      </small>
                      <button
                        type="button"
                        className="btn-primary-custom"
                        onClick={() => handleSaveSetting(item)}
                        disabled={savingKey === item.key_setting}
                      >
                        {savingKey === item.key_setting ? 'Menyimpan...' : 'Simpan Skema'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PengaturanSkema;
