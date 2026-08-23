import React from 'react';

const KomponenTable = ({ data, onEdit, onDelete, onToggleStatus, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Memuat data master komponen...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted bg-light rounded border">
        <div className="fw-semibold mb-1">Belum ada data komponen RAB.</div>
        <div className="small text-muted">Klik tombol "+ Tambah Komponen" untuk menambahkan data baru.</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="hrd-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No</th>
            <th>Nama Komponen</th>
            <th>Kategori</th>
            <th>Satuan</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Tipe</th>
            <th style={{ width: '120px', textAlign: 'center' }}>Status</th>
            <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => {
            const isHarian = item.tipe_komponen === 'harian';
            return (
              <tr key={item.id}>
                <td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                  {index + 1}
                </td>
                <td style={{ fontWeight: '600', color: '#1e293b' }}>
                  {item.nama_komponen}
                </td>
                <td>
                  <span className="badge-kategori">{item.kategori}</span>
                </td>
                <td style={{ color: '#475569', fontWeight: '500' }}>
                  {item.satuan}
                </td>
                <td style={{ textAlign: 'center' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '0.78rem',
                      fontWeight: '700',
                      backgroundColor: isHarian ? '#e0f2fe' : '#fef3c7',
                      color: isHarian ? '#0369a1' : '#b45309',
                      border: `1px solid ${isHarian ? '#bae6fd' : '#fde68a'}`,
                    }}
                  >
                    {isHarian ? 'Harian' : 'Sekali'}
                  </span>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className={`btn-status-toggle ${item.status_komponen_rab === '1' ? 'active' : 'inactive'}`}
                    onClick={() => onToggleStatus(item.id)}
                    title="Klik untuk ubah status"
                  >
                    {item.status_komponen_rab === '1' ? 'Aktif' : 'Non-Aktif'}
                  </button>
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn-action-edit"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className="btn-action-delete"
                    onClick={() => onDelete(item.id, item.nama_komponen)}
                  >
                    Hapus
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default KomponenTable;
