import React from 'react';

const PTKPTable = ({ data, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Memuat data PTKP...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted bg-light rounded border">
        <div className="fw-semibold mb-1">Belum ada data PTKP.</div>
        <div className="small text-muted">
          Klik tombol "+ Tambah PTKP" untuk menambahkan PTKP baru.
        </div>
      </div>
    );
  }

  // Format Helper
  const formatRp = (num) => {
    const val = Number(num) || 0;
    return `Rp ${val.toLocaleString('id-ID')}`;
  };

  return (
    <div className="table-responsive">
      <table className="hrd-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No</th>
            <th style={{ textAlign: 'center', width: '170px' }}>Status</th>
            <th>PTKP</th>
            <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id_ptkp}>
              <td
                style={{
                  textAlign: 'center',
                  fontWeight: '600',
                  color: '#64748b',
                }}
              >
                {index + 1}
              </td>
              <td>
                <span className="plate-code">{item.status}</span>
              </td>
              <td style={{ fontWeight: '600', color: '#1e293b' }}>
                {formatRp(item.ptkp)}
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
                  onClick={() => onDelete(item.id_ptkp, item.status)}
                >
                  Hapus
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PTKPTable;
