import React from 'react';

const HrdSppdTable = ({ data, onViewDetail, onReviewRab, loading }) => {
  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Memuat data pengajuan SPPD...</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="text-center py-5 text-muted bg-light rounded border">
        <div className="fw-semibold mb-1">Belum ada data perjalanan dinas (SPPD).</div>
      </div>
    );
  }

  const renderBadge = (status) => {
    const s = (status || 'pending').toLowerCase();
    return <span className={`badge-status ${s}`}>{status || 'PENDING'}</span>;
  };

  return (
    <div className="table-responsive">
      <table className="hrd-table">
        <thead>
          <tr>
            <th style={{ width: '50px', textAlign: 'center' }}>No</th>
            <th>No. SPPD & Karyawan</th>
            <th>Tujuan & Jadwal</th>
            <th style={{ textAlign: 'center' }}>Approval HRD</th>
            <th style={{ textAlign: 'center' }}>Status SPPD</th>
            <th style={{ textAlign: 'center' }}>Status RAB</th>
            <th style={{ width: '170px', textAlign: 'center' }}>Aksi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={item.id_sppd}>
              <td style={{ textAlign: 'center', fontWeight: '600', color: '#64748b' }}>
                {index + 1}
              </td>
              <td>
                <div style={{ fontWeight: '700', color: '#1f4e78', fontFamily: 'monospace' }}>
                  {item.nomor_sppd}
                </div>
                <div style={{ fontWeight: '600', color: '#1e293b', fontSize: '0.88rem' }}>
                  {item.nama_karyawan}
                </div>
                <small style={{ color: '#64748b' }}>Oleh: {item.nama_pembuat || 'Atasan'}</small>
              </td>
              <td>
                <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.alamat_tujuan}</div>
                <small style={{ color: '#64748b' }}>
                  {item.tanggal_mulai} s/d {item.tanggal_selesai} ({item.total_hari} hari)
                </small>
              </td>
              <td style={{ textAlign: 'center' }}>{renderBadge(item.status_hrd)}</td>
              <td style={{ textAlign: 'center' }}>{renderBadge(item.status_sppd)}</td>
              <td style={{ textAlign: 'center' }}>
                {item.id_rab ? (
                  <div>
                    {renderBadge(item.status_rab)}
                    {item.perubahan && item.perubahan !== 'none' && (
                      <div style={{ marginTop: '4px' }}>
                        <span style={{ fontSize: '0.72rem', color: '#b45309', fontWeight: '600' }}>
                          Rev: {item.perubahan}
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>Belum ada</span>
                )}
              </td>
              <td style={{ textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn-action-detail"
                  onClick={() => onViewDetail(item.id_sppd)}
                >
                  Detail
                </button>
                {item.id_rab && (
                  <button
                    type="button"
                    className="btn-action-rab"
                    onClick={() => onReviewRab(item.id_sppd)}
                  >
                    Review RAB
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HrdSppdTable;
