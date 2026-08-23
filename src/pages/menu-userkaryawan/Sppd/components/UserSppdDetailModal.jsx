import React from 'react';

const UserSppdDetailModal = ({ show, onClose, sppd, onApproveCancel, onRejectCancel }) => {
  if (!show || !sppd) return null;

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
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Karyawan Ditugaskan</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{sppd.nama_karyawan}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Status SPPD</div>
              <div style={{ fontWeight: '700', color: '#0f5132' }}>{sppd.status_sppd?.toUpperCase() || 'PENDING'}</div>
            </div>
          </div>

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
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>PEMBUAT (ATASAN)</div>
              <div style={{ fontWeight: '700', color: '#15803d' }}>{sppd.status_atasan ? sppd.status_atasan.toUpperCase() : 'APPROVED'}</div>
            </div>
            <div style={{ padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px', background: '#f8fafc' }}>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>VERIFIKASI FINAL HRD</div>
              <div style={{ fontWeight: '700', color: sppd.status_hrd === 'approved' ? '#15803d' : sppd.status_hrd === 'rejected' ? '#b91c1c' : '#b45309' }}>
                {sppd.status_hrd ? sppd.status_hrd.toUpperCase() : 'PENDING'}
              </div>
            </div>
          </div>

          {/* Cancellation section */}
          {sppd.pembatalan && sppd.pembatalan !== 'none' && (
            <div style={{ background: '#fff3cd', border: '1px solid #ffeeba', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: '#856404', marginBottom: '4px' }}>Permohonan Pembatalan SPPD</div>
              <div style={{ fontSize: '0.88rem', marginBottom: '6px' }}>Alasan: {sppd.alasan_batal || '-'}</div>
              <div style={{ fontSize: '0.82rem' }}>Status: <strong>{sppd.pembatalan}</strong></div>
              
              {sppd.pembatalan === 'pending_atasan' && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    style={{ backgroundColor: '#dc3545', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}
                    onClick={() => onApproveCancel(sppd.id_sppd)}
                  >
                    Setujui Pembatalan SPPD
                  </button>
                  <button
                    type="button"
                    style={{ backgroundColor: '#6c757d', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontWeight: '600', fontSize: '0.82rem', cursor: 'pointer' }}
                    onClick={() => onRejectCancel(sppd.id_sppd)}
                  >
                    Tolak Pembatalan
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
            justifyContent: 'flex-end',
          }}
        >
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
