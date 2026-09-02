import React from 'react';

const HrdSppdTable = ({ data, onViewDetail, onReviewRab, onApproveCancel, onRejectCancel, loading }) => {
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
            <th style={{ minWidth: '190px', textAlign: 'center' }}>Aksi</th>
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
              <td style={{ textAlign: 'center' }}>
                {renderBadge(item.status_sppd)}
                {item.pembatalan === 'pending_hrd' && (
                  <div>
                    <span className="badge-cancel-box" title={`Alasan Batal: ${item.alasan_batal || '-'}`}>
                      <i className="bi bi-exclamation-circle-fill"></i> Req Batal Karyawan
                    </span>
                  </div>
                )}
                {item.pembatalan === 'pending_atasan' && (
                  <div>
                    <span className="badge-cancel-box" style={{ background: '#e0e7ff', color: '#3730a3', borderColor: '#c7d2fe' }}>
                      <i className="bi bi-clock-history"></i> Batal: Menunggu Atasan
                    </span>
                  </div>
                )}
                {item.pembatalan === 'rejected' && (
                  <div>
                    <span className="badge-cancel-box" style={{ background: '#fee2e2', color: '#991b1b', borderColor: '#fecaca' }}>
                      <i className="bi bi-x-circle"></i> Batal Ditolak
                    </span>
                  </div>
                )}
              </td>
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
                <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: item.pembatalan === 'pending_hrd' ? '6px' : '0' }}>
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
                </div>

                {item.pembatalan === 'pending_hrd' && onApproveCancel && onRejectCancel && (
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px dashed #e2e8f0' }}>
                    <button
                      type="button"
                      className="btn-action-cancel-approve"
                      title="Setujui Pembatalan (Teruskan ke Atasan)"
                      onClick={() => onApproveCancel(item.id_sppd)}
                    >
                      <i className="bi bi-check-circle"></i> Setujui Batal
                    </button>
                    <button
                      type="button"
                      className="btn-action-cancel-reject"
                      title="Tolak Pembatalan SPPD"
                      onClick={() => onRejectCancel(item.id_sppd)}
                    >
                      <i className="bi bi-x-circle"></i> Tolak Batal
                    </button>
                  </div>
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
