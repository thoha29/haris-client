import React, { useState, useEffect } from 'react';

const KomponenModal = ({ show, onClose, onSave, editingData }) => {
  const [formData, setFormData] = useState({
    nama_komponen: '',
    kategori: '',
    satuan: '',
    tipe_komponen: 'harian',
    status_komponen_rab: '1',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        nama_komponen: editingData.nama_komponen || '',
        kategori: editingData.kategori || '',
        satuan: editingData.satuan || '',
        tipe_komponen: editingData.tipe_komponen || 'harian',
        status_komponen_rab: editingData.status_komponen_rab || '1',
      });
    } else {
      setFormData({
        nama_komponen: '',
        kategori: '',
        satuan: '',
        tipe_komponen: 'harian',
        status_komponen_rab: '1',
      });
    }
  }, [editingData, show]);

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1060,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            padding: '16px 20px',
            backgroundColor: '#1f4e78',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>
            {editingData ? 'Edit Master Komponen RAB' : 'Tambah Komponen RAB Baru'}
          </h3>
          <button
            type="button"
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              fontSize: '1.3rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
            onClick={onClose}
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                NAMA KOMPONEN <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control-clean"
                placeholder="Contoh: Uang Saku Harian, Hotel, Tiket Pesawat"
                value={formData.nama_komponen}
                onChange={(e) => setFormData({ ...formData, nama_komponen: e.target.value })}
                required
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  KATEGORI <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control-clean"
                  placeholder="Contoh: Akomodasi, Konsumsi"
                  value={formData.kategori}
                  onChange={(e) => setFormData({ ...formData, kategori: e.target.value })}
                  required
                />
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  SATUAN <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control-clean"
                  placeholder="Contoh: Hari, Malam, Tiket"
                  value={formData.satuan}
                  onChange={(e) => setFormData({ ...formData, satuan: e.target.value })}
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginBottom: '6px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  TIPE KOMPONEN <span style={{ color: '#dc3545' }}>*</span>
                </label>
                <select
                  className="form-control-clean"
                  value={formData.tipe_komponen}
                  onChange={(e) => setFormData({ ...formData, tipe_komponen: e.target.value })}
                >
                  <option value="harian">Harian (Per Tanggal Dinas)</option>
                  <option value="sekali">Sekali (Lumpsum / Non-Harian)</option>
                </select>
              </div>

              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                  STATUS KOMPONEN
                </label>
                <select
                  className="form-control-clean"
                  value={formData.status_komponen_rab}
                  onChange={(e) => setFormData({ ...formData, status_komponen_rab: e.target.value })}
                >
                  <option value="1">Aktif (Dapat Dipilih)</option>
                  <option value="0">Non-Aktif (Disembunyikan)</option>
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: '14px 20px',
              backgroundColor: '#f8fafc',
              borderTop: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <button
              type="button"
              style={{
                backgroundColor: '#e2e8f0',
                color: '#334155',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '6px',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
              }}
              onClick={onClose}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary-custom"
            >
              Simpan Komponen
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default KomponenModal;
