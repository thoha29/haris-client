import React from 'react';

const DinasSppdCard = ({ sppd, onViewDetail, onViewRab, onSubmitRab }) => {
  if (!sppd) return null;

  const isRevisiAtasan = sppd.status_rab === 'revisi_atasan';

  const getStatusBadge = () => {
    const s = (sppd.status_sppd || 'pending').toLowerCase();
    const statusLabels = {
      pending_atasan: 'Menunggu Persetujuan Atasan',
      approved_atasan: 'Disetujui Atasan',
      approved: 'Disetujui Final (HRD)',
      active: 'Sedang Dinas',
      in_progress: 'Berlangsung',
      completed: 'Selesai',
      rejected: 'Ditolak',
      cancelled: 'Dibatalkan',
    };

    let badgeClass = 'pending';
    if (s === 'approved' || s === 'active') badgeClass = 'approved';
    if (s === 'approved_atasan') badgeClass = 'info';
    if (s === 'rejected' || s === 'cancelled') badgeClass = 'rejected';
    if (s === 'pending_atasan') badgeClass = 'pending';

    return (
      <span className={`badge-status ${badgeClass}`}>
        {statusLabels[s] || (sppd.status_sppd || 'PENDING').toUpperCase()}
      </span>
    );
  };

  const getRabBadge = () => {
    if (!sppd.id_rab) {
      return (
        <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: '500' }}>
          Belum Ada RAB
        </span>
      );
    }

    const rabStatus = (sppd.status_rab || 'draft').toLowerCase();
    const rabLabels = {
      pending_atasan: 'RAB: Menunggu Atasan',
      revisi_atasan: 'RAB: Perlu Direvisi',
      pending_hrd: 'RAB: Menunggu Persetujuan Final',
      approved: 'RAB: Disetujui Final ✓',
      cancelled: 'RAB: Dibatalkan',
      rejected: 'RAB: Ditolak',
    };

    let badgeClass = 'pending';
    if (rabStatus === 'approved') badgeClass = 'approved';
    if (rabStatus === 'revisi_atasan') badgeClass = 'warning';
    if (rabStatus === 'rejected' || rabStatus === 'cancelled') badgeClass = 'rejected';
    if (rabStatus === 'pending_hrd') badgeClass = 'info';

    return (
      <span className={`badge-status ${badgeClass}`} style={{ fontSize: '0.72rem', padding: '2px 8px' }}>
        {rabLabels[rabStatus] || `RAB: ${sppd.status_rab}`}
      </span>
    );
  };

  return (
    <div className="dinas-item-card">
      <div>
        {/* Card Header */}
        <div className="dinas-item-header">
          <div style={{ fontWeight: '700', color: '#1f4e78', fontFamily: 'monospace', fontSize: '0.95rem' }}>
            {sppd.nomor_sppd}
          </div>
          <div>{getStatusBadge()}</div>
        </div>

        {/* Card Body */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1.05rem', marginBottom: '6px' }}>
            <i className="bi bi-geo-alt-fill text-danger me-1"></i>
            {sppd.alamat_tujuan || '-'}
          </div>

          <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '10px', minHeight: '38px' }}>
            {sppd.tugas ? (
              sppd.tugas.length > 80 ? `${sppd.tugas.substring(0, 80)}...` : sppd.tugas
            ) : (
              <span className="text-muted fst-italic">Tidak ada deskripsi maksud tugas.</span>
            )}
          </div>

          {/* Date Range Badge */}
          <div
            style={{
              backgroundColor: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: '6px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              color: '#334155',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '10px',
            }}
          >
            <div>
              <i className="bi bi-calendar-event me-1 text-primary"></i>
              <strong>{sppd.tanggal_mulai}</strong> s/d <strong>{sppd.tanggal_selesai}</strong>
            </div>
            <span className="badge-kategori">{sppd.total_hari || 1} Hari</span>
          </div>

          {/* {sppd.pembatalan && sppd.pembatalan !== 'none' && (
            <div
              style={{
                backgroundColor: '#e0f2fe',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                padding: '6px 10px',
                fontSize: '0.78rem',
                color: '#0369a1',
                fontWeight: '600',
                marginBottom: '8px',
              }}
            >
              <i className="bi bi-info-circle-fill me-1"></i>
              Pengajuan Pembatalan: {sppd.pembatalan}
            </div>
          )} */}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>Status RAB:</span>
            {getRabBadge()}
          </div>
        </div>
      </div>

      {/* Card Footer / Action Buttons */}
      <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-primary-custom"
          style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem', textAlign: 'center', minWidth: '100px' }}
          onClick={() => onViewDetail(sppd.id_sppd)}
        >
          Detail
        </button>

        {sppd.id_rab ? (
          <button
            type="button"
            className="btn-success-custom"
            style={{ flex: 1, padding: '7px 10px', fontSize: '0.82rem', textAlign: 'center', minWidth: '100px' }}
            onClick={() => onViewRab(sppd.id_sppd)}
          >
            RAB & Biaya
          </button>
        ) : onSubmitRab ? (
          <button
            type="button"
            style={{
              flex: 1,
              padding: '7px 10px',
              fontSize: '0.82rem',
              textAlign: 'center',
              minWidth: '100px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: '700',
              cursor: 'pointer',
            }}
            onClick={() => onSubmitRab(sppd.id_sppd)}
          >
            + Buat RAB
          </button>
        ) : null}

        {isRevisiAtasan && onSubmitRab && (
          <button
            type="button"
            style={{
              flex: '1 0 100%',
              backgroundColor: '#d97706',
              color: '#ffffff',
              border: 'none',
              padding: '7px 10px',
              borderRadius: '6px',
              fontWeight: '700',
              fontSize: '0.82rem',
              textAlign: 'center',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
            onClick={() => onSubmitRab(sppd.id_sppd)}
          >
            <i className="bi bi-pencil-square"></i>
            Revisi / Edit RAB
          </button>
        )}
      </div>
    </div>
  );
};

export default DinasSppdCard;