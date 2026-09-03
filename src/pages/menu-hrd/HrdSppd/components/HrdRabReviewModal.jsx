import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0);
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const HrdRabReviewModal = ({
  show,
  onClose,
  rab,
  onReviewSubmit,
}) => {
  const [catatan, setCatatan] = useState('');
  const [activeTab, setActiveTab] = useState('komparasi'); // 'komparasi' | 'summary'

  useEffect(() => {
    if (rab) {
      setCatatan(rab.catatan_hrd || '');
    } else {
      setCatatan('');
    }
  }, [rab, show]);

  if (!show || !rab) return null;

  const details = rab.details || [];
  const summaryPerKomponen = rab.summary_per_komponen || [];

  const grandTotalAtasan =
    rab.grand_total_atasan ||
    details.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);

  const grandTotalFinal =
    rab.grand_total_final ||
    details.reduce((acc, curr) => {
      const qFinal =
        curr.jumlah_final !== null && curr.jumlah_final !== undefined
          ? Number(curr.jumlah_final)
          : Number(curr.jumlah) || 1;
      const hFinal =
        curr.harga_satuan_final !== null && curr.harga_satuan_final !== undefined
          ? parseFloat(curr.harga_satuan_final)
          : parseFloat(curr.harga_satuan) || 0;
      const tFinal =
        curr.total_final !== null && curr.total_final !== undefined
          ? parseFloat(curr.total_final)
          : qFinal * hFinal;
      return acc + tFinal;
    }, 0);

  const selisihGrandTotal = grandTotalFinal - grandTotalAtasan;
  const isApproved = rab.status === 'approved';

  const handleApprove = () => {
    Swal.fire({
      title: 'Konfirmasi Persetujuan Final',
      text: 'Apakah Anda yakin menyetujui RAB dan SPPD ini secara final?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#16a34a',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Setujui',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        onReviewSubmit(rab.id, catatan);
      }
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 1060,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '1020px',
          maxHeight: '94vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid #cbd5e1',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.2px' }}>
              Persetujuan Final Rencana Anggaran Biaya (RAB)
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              SPPD: <span style={{ color: '#f8fafc', fontWeight: '600' }}>{rab.nomor_sppd}</span> | Karyawan:{' '}
              <span style={{ color: '#f8fafc', fontWeight: '600' }}>{rab.nama_karyawan}</span> | Periode:{' '}
              {rab.tanggal_mulai} s/d {rab.tanggal_selesai} ({rab.total_hari} Hari)
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: '#334155',
              border: 'none',
              color: '#ffffff',
              borderRadius: '6px',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              lineHeight: 1,
            }}
          >
            ✕
          </button>
        </div>

        {/* Top Summary Banner */}
        <div style={{ padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          {/* Catatan Revisi dari Atasan jika ada */}
          {rab.catatan_atasan && (
            <div
              style={{
                marginBottom: '10px',
                padding: '8px 14px',
                backgroundColor: '#fffbeb',
                border: '1px solid #fde68a',
                borderRadius: '6px',
                fontSize: '0.84rem',
                color: '#92400e',
              }}
            >
              <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <i className="bi bi-exclamation-triangle-fill" style={{ color: '#d97706' }}></i>
                <span>Catatan Revisi dari Atasan:</span>
              </div>
              <div style={{ color: '#78350f' }}>{rab.catatan_atasan}</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>
                Total Pengajuan Awal
              </div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginTop: '2px' }}>
                {formatRupiah(grandTotalAtasan)}
              </div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>
                Total Persetujuan Final
              </div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                {formatRupiah(grandTotalFinal)}
              </div>
            </div>
            <div
              style={{
                backgroundColor: selisihGrandTotal !== 0 ? '#fffbeb' : '#f8fafc',
                border: `1px solid ${selisihGrandTotal !== 0 ? '#fde68a' : '#e2e8f0'}`,
                borderRadius: '6px',
                padding: '8px 12px',
              }}
            >
              <div
                style={{
                  fontSize: '0.7rem',
                  color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b',
                  fontWeight: '700',
                  textTransform: 'uppercase',
                }}
              >
                Selisih Total
              </div>
              <div
                style={{
                  fontSize: '1.05rem',
                  fontWeight: '800',
                  color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b',
                  marginTop: '2px',
                }}
              >
                {selisihGrandTotal === 0 ? 'Sesuai' : selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', backgroundColor: '#f1f5f9', padding: '0 20px' }}>
          <button
            type="button"
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === 'komparasi' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: activeTab === 'komparasi' ? '700' : '500',
              color: activeTab === 'komparasi' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.84rem',
            }}
            onClick={() => setActiveTab('komparasi')}
          >
            Tabel Komparasi Rincian ({details.length} item)
          </button>
          <button
            type="button"
            style={{
              padding: '10px 16px',
              border: 'none',
              borderBottom: activeTab === 'summary' ? '2px solid #2563eb' : '2px solid transparent',
              backgroundColor: 'transparent',
              fontWeight: activeTab === 'summary' ? '700' : '500',
              color: activeTab === 'summary' ? '#2563eb' : '#64748b',
              cursor: 'pointer',
              fontSize: '0.84rem',
            }}
            onClick={() => setActiveTab('summary')}
          >
            Ringkasan per Komponen
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          {details.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: '#64748b' }}>
              <i className="bi bi-folder-x" style={{ fontSize: '2.5rem', color: '#94a3b8', display: 'block', marginBottom: '8px' }}></i>
              <div style={{ fontWeight: '700', fontSize: '0.96rem', color: '#334155' }}>Belum Ada Rincian Komponen RAB</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
                Pengajuan SPPD ini belum memiliki rincian estimasi biaya dinas.
              </div>
            </div>
          ) : activeTab === 'komparasi' ? (
            <div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 10px', width: '35px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left' }}>Komponen & Jadwal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: '110px' }}>Kategori</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '20%' }}>Pengajuan Awal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '20%' }}>Persetujuan Final</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '15%' }}>Selisih Biaya</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: '15%' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((item, idx) => {
                      const qAtasan = Number(item.jumlah) || 1;
                      const pAtasan = parseFloat(item.harga_satuan) || 0;
                      const totAtasan = parseFloat(item.total) || (qAtasan * pAtasan);

                      const qFinal =
                        item.jumlah_final !== null && item.jumlah_final !== undefined
                          ? Number(item.jumlah_final)
                          : qAtasan;
                      const pFinal =
                        item.harga_satuan_final !== null && item.harga_satuan_final !== undefined
                          ? parseFloat(item.harga_satuan_final)
                          : pAtasan;
                      const totFinal =
                        item.total_final !== null && item.total_final !== undefined
                          ? parseFloat(item.total_final)
                          : qFinal * pFinal;

                      const selisih = totFinal - totAtasan;
                      const isAdjusted = selisih !== 0 || qFinal !== qAtasan || pFinal !== pAtasan;

                      return (
                        <tr
                          key={item.id || idx}
                          style={{
                            borderBottom: '1px solid #f1f5f9',
                            backgroundColor: isAdjusted ? '#fffbeb' : idx % 2 === 1 ? '#f8fafc' : '#ffffff',
                          }}
                        >
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.nama_komponen}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {item.tipe_komponen === 'sekali' ? (
                                <>
                                  <span style={{ color: '#d97706', fontWeight: '600' }}>Sekali Pakai</span>
                                  {item.tanggal && (
                                    <span style={{ color: '#64748b', fontWeight: '400' }}>
                                      {' '}
                                      ({formatDateLabel(item.tanggal)})
                                    </span>
                                  )}
                                </>
                              ) : item.tanggal ? (
                                `${formatDateLabel(item.tanggal)}`
                              ) : (
                                'Harian'
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.kategori || 'Umum'}</span>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                              {qAtasan} × {formatRupiah(pAtasan)}
                            </div>
                            <div style={{ fontWeight: '700', color: '#334155' }}>{formatRupiah(totAtasan)}</div>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', backgroundColor: '#f0fdf4' }}>
                            <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                              {qFinal} × {formatRupiah(pFinal)}
                            </div>
                            <div style={{ fontWeight: '800', color: '#15803d' }}>{formatRupiah(totFinal)}</div>
                          </td>
                          <td
                            style={{
                              padding: '6px 10px',
                              textAlign: 'right',
                              fontWeight: '700',
                              color: selisih > 0 ? '#b45309' : selisih < 0 ? '#15803d' : '#64748b',
                            }}
                          >
                            {selisih === 0 ? 'Sesuai' : selisih > 0 ? `+${formatRupiah(selisih)}` : formatRupiah(selisih)}
                          </td>
                          <td style={{ padding: '6px 10px', fontSize: '0.76rem', color: '#475569' }}>
                            {item.keterangan || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.84rem', color: '#0f172a' }}>
                        GRAND TOTAL KESELURUHAN:
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: '#334155' }}>
                        {formatRupiah(grandTotalAtasan)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.94rem', color: '#15803d' }}>
                        {formatRupiah(grandTotalFinal)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontSize: '0.86rem',
                          color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b',
                        }}
                      >
                        {selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
                      </td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 10px', width: '35px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left' }}>Nama Komponen Biaya</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: '130px' }}>Tipe / Kategori</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '22%' }}>Total Pengajuan Awal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '22%' }}>Total Persetujuan Final</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '18%' }}>Selisih Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryPerKomponen.map((comp, idx) => (
                      <tr
                        key={comp.id_komponen || idx}
                        style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}
                      >
                        <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 10px' }}>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{comp.nama_komponen}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Satuan: {comp.satuan || '-'}</div>
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontSize: '0.72rem',
                              fontWeight: '600',
                              backgroundColor: comp.tipe_komponen === 'harian' ? '#e0f2fe' : '#fef3c7',
                              color: comp.tipe_komponen === 'harian' ? '#0369a1' : '#92400e',
                            }}
                          >
                            {comp.tipe_komponen === 'harian' ? 'Harian' : 'Sekali'}
                          </span>{' '}
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({comp.kategori})</span>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                            {comp.total_jumlah_atasan} {comp.satuan || ''}
                          </div>
                          <div style={{ fontWeight: '700', color: '#334155' }}>
                            {formatRupiah(comp.total_biaya_atasan)}
                          </div>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', backgroundColor: '#f0fdf4' }}>
                          <div style={{ fontSize: '0.74rem', color: '#166534' }}>
                            {comp.total_jumlah_final !== undefined ? comp.total_jumlah_final : comp.total_jumlah_atasan} {comp.satuan || ''}
                          </div>
                          <div style={{ fontWeight: '800', color: '#15803d' }}>
                            {formatRupiah(comp.total_biaya_final !== undefined ? comp.total_biaya_final : comp.total_biaya_atasan)}
                          </div>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700' }}>
                          {comp.selisih_biaya === 0 ? (
                            <span style={{ color: '#64748b' }}>Sesuai</span>
                          ) : comp.selisih_biaya > 0 ? (
                            <span style={{ color: '#b45309' }}>+{formatRupiah(comp.selisih_biaya)}</span>
                          ) : (
                            <span style={{ color: '#16a34a' }}>{formatRupiah(comp.selisih_biaya)}</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.84rem', color: '#0f172a' }}>
                        GRAND TOTAL KESELURUHAN:
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: '#334155' }}>
                        {formatRupiah(grandTotalAtasan)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.94rem', color: '#15803d' }}>
                        {formatRupiah(grandTotalFinal)}
                      </td>
                      <td
                        style={{
                          padding: '8px 10px',
                          textAlign: 'right',
                          fontSize: '0.86rem',
                          color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b',
                        }}
                      >
                        {selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}

          {/* Catatan HRD Section */}
          {/* <div style={{ marginTop: '16px' }}>
            <label style={{ fontSize: '0.8rem', fontWeight: '700', color: '#475569', marginBottom: '4px', display: 'block' }}>
              Catatan / Keterangan Persetujuan Final (Opsional):
            </label>
            <textarea
              className="form-control"
              rows="2"
              placeholder={isApproved ? '-' : 'Masukkan catatan persetujuan jika ada...'}
              value={catatan}
              disabled={isApproved}
              onChange={(e) => setCatatan(e.target.value)}
              style={{ fontSize: '0.84rem', backgroundColor: isApproved ? '#f8fafc' : '#ffffff' }}
            />
          </div> */}
        </div>

        {/* Footer Buttons */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <button
            type="button"
            style={{
              backgroundColor: '#64748b',
              color: '#ffffff',
              border: 'none',
              padding: '8px 20px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            Tutup
          </button>

          <div>
            {isApproved ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  backgroundColor: '#dcfce7',
                  color: '#15803d',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                }}
              >
                <i className="bi bi-check-circle-fill"></i>
                Sudah Disetujui (Approved)
              </span>
            ) : (
              <button
                type="button"
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 24px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
                onClick={handleApprove}
              >
                <i className="bi bi-check-lg"></i>
                Setujui Final RAB & SPPD
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HrdRabReviewModal;
