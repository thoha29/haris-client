import React from 'react';

const TransportasiTable = ({ data, onEdit, onDelete, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Memuat data kendaraan...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted bg-light rounded border">
        <div className="fw-semibold mb-1">Belum ada data transportasi perusahaan.</div>
        <div className="small text-muted">Klik tombol "+ Tambah Kendaraan" untuk menambahkan kendaraan operasional baru.</div>
      </div>
    );
  }

  return (
    <div className="table-responsive">
      <table className="hrd-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No</th>
            <th>Nomor Polisi / Identitas Kendaraan</th>
            <th>Nama Kendaraan / Tipe</th>
            <th style={{ textAlign: 'center', width: '170px' }}>Status</th>
            <th style={{ width: '160px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id}>
              <td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                {index + 1}
              </td>
              <td>
                <span className="plate-code">{item.no_transportasi}</span>
              </td>
              <td style={{ fontWeight: '600', color: '#1e293b' }}>
                {item.nama_transportasi}
              </td>
              <td style={{ textAlign: 'center' }}>
                <span className={`badge-status ${item.status === 'occupied' ? 'pending' : 'approved'}`}>
                  {item.status === 'occupied' ? 'Occupied (Dipakai)' : 'Available (Tersedia)'}
                </span>
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
                  onClick={() => onDelete(item.id, item.nama_transportasi)}
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

export default TransportasiTable;
