import React, { useState } from 'react';
import Swal from 'sweetalert2';

const DinasSppdDetailModal = ({
  show,
  onClose,
  sppd,
  onCancelRequest,
  onViewRab,
  onSubmitRab,
}) => {
  const [alasanBatal, setAlasanBatal] = useState('');
  const [showCancelInput, setShowCancelInput] = useState(false);

  if (!show || !sppd) return null;

  const canRequestCancel =
    (!sppd.pembatalan || sppd.pembatalan === 'none') &&
    sppd.status_sppd !== 'completed' &&
    sppd.status_sppd !== 'cancelled' &&
    sppd.status_sppd !== 'rejected';

  const isRevisiAtasan = sppd.status_rab === 'revisi_atasan';

  const handleSendCancel = () => {
    if (!alasanBatal.trim()) {
      Swal.fire('Peringatan', 'Silakan isi alasan pembatalan!', 'warning');
      return;
    }
    onCancelRequest(sppd.id_sppd, alasanBatal);
    setShowCancelInput(false);
    setAlasanBatal('');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
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
            Rincian Tugas Dinas - No: {sppd.nomor_sppd}
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
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Diajukan Oleh</div>
              <div style={{ fontWeight: '600', color: '#1e293b' }}>{sppd.nama_karyawan || 'Saya'}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase' }}>Status SPPD</div>
              <div style={{ fontWeight: '700', color: '#0f5132' }}>{sppd.status_sppd?.toUpperCase() || 'PENDING'}</div>
            </div>
          </div>

          {/* Catatan Atasan jika ada revisi / penolakan */}
          {sppd.catatan_atasan && (
            <div style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '12px 14px', borderRadius: '8px', marginBottom: '16px' }}>
              <div style={{ fontWeight: '700', color: '#b45309', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-exclamation-triangle-fill"></i> Catatan dari Atasan:
              </div>
              <div style={{ fontSize: '0.9rem', color: '#78350f' }}>{sppd.catatan_atasan}</div>
            </div>
          )}

          {/* Travel Details */}
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#1f4e78', marginBottom: '10px' }}>
            Rincian Penugasan & Akomodasi
          </h4>
          <table className="table table-bordered table-sm" style={{ fontSize: '0.88rem', marginBottom: '16px' }}>
            <tbody>
              <tr>
                <th style={{ width: '200px', backgroundColor: '#f8fafc', color: '#475569' }}>Alamat Tujuan</th>
                <td style={{ fontWeight: '600' }}>{sppd.alamat_tujuan}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Tugas / Maksud Dinas</th>
                <td>{sppd.tugas || '-'}</td>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#f8fafc', color: '#475569' }}>Periode Pelaksanaan</th>
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

          {/* Cancellation Section */}
          {sppd.pembatalan && sppd.pembatalan !== 'none' && (
            <div style={{ background: '#e0f2fe', border: '1px solid #bae6fd', padding: '12px', borderRadius: '6px', marginBottom: '14px' }}>
              <div style={{ fontWeight: '700', color: '#0369a1', marginBottom: '4px' }}>Status Pengajuan Pembatalan</div>
              <div style={{ fontSize: '0.88rem', marginBottom: '4px' }}>Alasan Anda: {sppd.alasan_batal}</div>
              <div style={{ fontSize: '0.82rem' }}>Proses: <strong>{sppd.pembatalan}</strong></div>
            </div>
          )}

          {canRequestCancel && (
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', padding: '14px', borderRadius: '6px', marginBottom: '14px' }}>
              {!showCancelInput ? (
                <button
                  type="button"
                  style={{ backgroundColor: '#dc3545', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontSize: '0.85rem', fontWeight: '600', cursor: 'pointer' }}
                  onClick={() => setShowCancelInput(true)}
                >
                  Ajukan Permohonan Pembatalan SPPD
                </button>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: '#991b1b', marginBottom: '6px' }}>
                    Alasan Permohonan Pembatalan SPPD:
                  </label>
                  <textarea
                    className="form-control-clean"
                    rows="2"
                    placeholder="Tulis alasan pembatalan..."
                    value={alasanBatal}
                    onChange={(e) => setAlasanBatal(e.target.value)}
                    style={{ marginBottom: '10px' }}
                  ></textarea>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      style={{ backgroundColor: '#dc3545', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                      onClick={handleSendCancel}
                    >
                      Kirim Permohonan
                    </button>
                    <button
                      type="button"
                      style={{ backgroundColor: '#6c757d', color: '#ffffff', border: 'none', padding: '6px 14px', borderRadius: '5px', fontWeight: '600', fontSize: '0.85rem', cursor: 'pointer' }}
                      onClick={() => setShowCancelInput(false)}
                    >
                      Batal
                    </button>
                  </div>
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
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {sppd.id_rab ? (
              <>
                <button
                  type="button"
                  style={{ backgroundColor: '#198754', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                  onClick={() => onViewRab(sppd.id_sppd)}
                >
                  <i className="bi bi-receipt me-1"></i>
                  Lihat Rincian Biaya (RAB)
                </button>
                {isRevisiAtasan && onSubmitRab && (
                  <button
                    type="button"
                    style={{ backgroundColor: '#d97706', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                    onClick={() => onSubmitRab(sppd.id_sppd)}
                  >
                    <i className="bi bi-pencil-square me-1"></i>
                    Revisi / Edit RAB
                  </button>
                )}
              </>
            ) : (
              onSubmitRab && (
                <button
                  type="button"
                  style={{ backgroundColor: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 18px', borderRadius: '6px', fontWeight: '600', fontSize: '0.88rem', cursor: 'pointer' }}
                  onClick={() => onSubmitRab(sppd.id_sppd)}
                >
                  <i className="bi bi-plus-circle me-1"></i>
                  Buat Rincian Biaya (RAB)
                </button>
              )
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

export default DinasSppdDetailModal;

