import React, { useState, useEffect } from 'react';

const TransportasiModal = ({ show, onClose, onSave, editingData }) => {
  const [formData, setFormData] = useState({
    no_transportasi: '',
    nama_transportasi: '',
    status: 'available',
  });

  useEffect(() => {
    if (editingData) {
      setFormData({
        no_transportasi: editingData.no_transportasi || '',
        nama_transportasi: editingData.nama_transportasi || '',
        status: editingData.status || 'available',
      });
    } else {
      setFormData({
        no_transportasi: '',
        nama_transportasi: '',
        status: 'available',
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
            {editingData ? 'Edit Transportasi Perusahaan' : 'Tambah Kendaraan Baru'}
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
                NOMOR POLISI / IDENTITAS KENDARAAN <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control-clean"
                placeholder="Contoh: B 1234 ABC / Mobil Operasional 01"
                value={formData.no_transportasi}
                onChange={(e) => setFormData({ ...formData, no_transportasi: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                NAMA KENDARAAN / TIPE <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <input
                type="text"
                className="form-control-clean"
                placeholder="Contoh: Toyota Avanza Silver / Hiace Luxury"
                value={formData.nama_transportasi}
                onChange={(e) => setFormData({ ...formData, nama_transportasi: e.target.value })}
                required
              />
            </div>

            <div style={{ marginBottom: '6px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#334155', marginBottom: '6px' }}>
                STATUS KENDARAAN <span style={{ color: '#dc3545' }}>*</span>
              </label>
              <select
                className="form-control-clean"
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                required
              >
                <option value="available">Available (Tersedia)</option>
                <option value="occupied">Occupied (Sedang Dipakai)</option>
              </select>
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
              Simpan Kendaraan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TransportasiModal;
