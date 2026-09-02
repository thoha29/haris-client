import React from 'react';

const UserSppdDetailModal = ({
  show,
  onClose,
  sppd,
  onApproveSppd,
  onRejectSppd,
  onCancelSppd,
  onReviewRab,
  onApproveCancel,
  onRejectCancel,
}) => {
  if (!show || !sppd) return null;

  const isPendingAtasan = sppd.status_atasan === 'pending' || sppd.status_sppd === 'pending' || sppd.status_sppd === 'pending_atasan';
  const canCancel = ['approved_atasan', 'approved', 'active'].includes(sppd.status_sppd);

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
          maxWidth: '750px',
          maxHeight: '90vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
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
            Detail SPPD - No: {sppd.nomor_sppd}
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

        <div style={{ padding: '20px', overflowY: 'auto' }}>
          {/* Header Info */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', background: '#f8fafc', padding: '14px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Karyawan Pengaju</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{sppd.nama_karyawan}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Status SPPD</div>
              <div style={{ fontWeight: '700', color: sppd.status_sppd === 'rejected' ? '#dc2626' : sppd.status_sppd === 'cancelled' ? '#64748b' : '#0f5132' }}>
                {sppd.status_sppd?.toUpperCase() || 'PENDING'}
              </div>
            </div>
          </div>

          {/* Catatan Atasan jika ada */}
          {sppd.catatan_atasan && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: '#b45309', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-info-circle-fill"></i> Catatan Atasan:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#78350f' }}>{sppd.catatan_atasan}</div>
            </div>
          )}

          {/* Travel Details */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f4e78', marginBottom: '10px' }}>
            Rincian Penugasan
          </h4>
          <table className="table table-bordered table-sm" style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <th style={{ width: '200px', backgroundColor: '#f8fafc', color: '#475569' }}>Alamat Tujuan</th>
                <td style={{ fontWeight: '600' }}>{sppd.alamat_tujuan}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Tugas / Keperluan</th>
                <td>{sppd.tugas || '-'}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Tanggal Pelaksanaan</th>
                <td style={{ fontWeight: '600' }}>
                  {sppd.tanggal_mulai} s/d {sppd.tanggal_selesai} ({sppd.total_hari} Hari)
                </td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Penginapan</th>
                <td>{sppd.tempat_tinggal}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Konsumsi</th>
                <td>{sppd.konsumsi}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Transportasi</th>
                <td>
                  {sppd.nama_transportasi ? (
                    <span>Perusahaan: {sppd.nama_transportasi} ({sppd.no_transportasi})</span>
                  ) : sppd.transportasi_umum ? (
                    <span>Umum: {sppd.transportasi_umum}</span>
                  ) : '-'}
                </td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Barang Bawaan PT</th>
                <td>{sppd.barang_bawaan_pt ? `${sppd.barang_bawaan_pt} ${sppd.satuan_barang_pt || ''}` : '-'}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Barang Bawaan Karyawan</th>
                <td>{sppd.barang_bawaan_karyawan ? `${sppd.barang_bawaan_karyawan} ${sppd.satuan_barang_karyawan || ''}` : '-'}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Melapor Kepada</th>
                <td>{sppd.ditujuan_melapor_kepada || 'Atasan'}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Keterangan</th>
                <td>{sppd.keterangan || '-'}</td>
              </tr>
            </tbody>
          </table>

          {/* Approval Matrix */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f4e78', marginBottom: '10px' }}>
            Status Persetujuan
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '16px' }}>
            <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>PERSETUJUAN ATASAN</div>
              <div style={{ fontWeight: '700', color: sppd.status_atasan === 'approved' ? '#15803d' : sppd.status_atasan === 'rejected' ? '#dc2626' : '#d97706' }}>
                {sppd.status_atasan ? sppd.status_atasan.toUpperCase() : 'PENDING'}
              </div>
            </div>
            <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>VERIFIKASI FINAL HRD</div>
              <div style={{ fontWeight: '700', color: sppd.status_hrd === 'approved' ? '#15803d' : sppd.status_hrd === 'rejected' ? '#b91c1c' : '#b45309' }}>
                {sppd.status_hrd ? sppd.status_hrd.toUpperCase() : 'PENDING'}
              </div>
            </div>
          </div>

          {/* Cancellation section from employee request */}
          {sppd.pembatalan && sppd.pembatalan !== 'none' && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: '#92400e', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.92rem' }}>
                <i className="bi bi-exclamation-triangle-fill text-warning"></i> Permohonan Pembatalan SPPD oleh Karyawan
              </div>
              <div style={{ fontSize: '0.88rem', color: '#1e293b', marginBottom: '6px' }}>
                <strong>Alasan Pembatalan:</strong> {sppd.alasan_batal || '-'}
              </div>
              <div style={{ fontSize: '0.84rem', color: '#475569', marginBottom: '10px' }}>
                Status Proses Pembatalan: <strong style={{ textTransform: 'uppercase', color: '#1e293b' }}>{sppd.pembatalan}</strong>
              </div>

              {sppd.pembatalan === 'pending_atasan' && onApproveCancel && onRejectCancel && (
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: '1px dashed #fde68a' }}>
                  <button
                    type="button"
                    style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onApproveCancel(sppd.id_sppd)}
                  >
                    <i className="bi bi-check-circle-fill"></i> Setujui Pembatalan SPPD
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '7px 16px', borderRadius: '6px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => onRejectCancel(sppd.id_sppd)}
                  >
                    <i className="bi bi-x-circle-fill"></i> Tolak Pembatalan
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '10px',
          }}
        >
          {/* Action buttons for Atasan */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {isPendingAtasan && (
              <>
                <button
                  type="button"
                  style={{ backgroundColor: '#16a34a', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                  onClick={() => onApproveSppd(sppd.id_sppd)}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Setujui SPPD
                </button>
                <button
                  type="button"
                  style={{ backgroundColor: '#dc2626', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                  onClick={() => onRejectSppd(sppd.id_sppd)}
                >
                  <i className="bi bi-x-circle me-1"></i>
                  Tolak SPPD
                </button>
              </>
            )}

            {canCancel && onCancelSppd && (
              <button
                type="button"
                style={{ backgroundColor: '#991b1b', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => onCancelSppd(sppd.id_sppd)}
              >
                <i className="bi bi-slash-circle me-1"></i>
                Batalkan SPPD
              </button>
            )}

            {sppd.id_rab && onReviewRab && (
              <button
                type="button"
                style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                onClick={() => onReviewRab(sppd.id_sppd)}
              >
                <i className="bi bi-receipt me-1"></i>
                Review RAB
              </button>
            )}
          </div>

          <button
            type="button"
            style={{
              backgroundColor: '#6c757d',
              color: '#ffffff',
              border: 'none',
              padding: '8px 18px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.88rem',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSppdDetailModal;

