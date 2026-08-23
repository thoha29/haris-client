import React, { useState } from 'react';

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

const UserRabReviewModal = ({ show, onClose, rab }) => {
  const [activeTab, setActiveTab] = useState('komparasi'); // 'komparasi' | 'komponen_summary'

  if (!show || !rab) return null;

  const details = rab.details || [];
  const summaryPerKomponen = rab.summary_per_komponen || [];

  const grandTotalAtasan = rab.grand_total_atasan || details.reduce((acc, curr) => acc + (parseFloat(curr.total) || 0), 0);
  const grandTotalHrd = rab.grand_total_hrd || details.reduce((acc, curr) => {
    const qHrd = curr.jumlah_hrd !== null && curr.jumlah_hrd !== undefined ? Number(curr.jumlah_hrd) : (Number(curr.jumlah) || 1);
    const hHrd = curr.harga_satuan_hrd !== null && curr.harga_satuan_hrd !== undefined ? parseFloat(curr.harga_satuan_hrd) : (parseFloat(curr.harga_satuan) || 0);
    return acc + (curr.total_hrd !== null && curr.total_hrd !== undefined ? parseFloat(curr.total_hrd) : (qHrd * hHrd));
  }, 0);
  const selisihGrandTotal = grandTotalHrd - grandTotalAtasan;

  const isApproved = rab.status === 'approved';
  const isRejected = rab.status === 'rejected_hrd';

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
            padding: '12px 20px',
            backgroundColor: '#0f172a',
            color: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div>
            <div style={{ fontSize: '1.05rem', fontWeight: '700', letterSpacing: '0.2px' }}>
              Rencana Anggaran Biaya (RAB) - {rab.nomor_sppd}
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              Karyawan: <span style={{ color: '#f8fafc', fontWeight: '600' }}>{rab.nama_karyawan}</span> | Jadwal: {rab.tanggal_mulai} s/d {rab.tanggal_selesai} ({rab.total_hari} Hari)
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
        <div style={{ padding: '10px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Pengajuan Awal Atasan</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginTop: '2px' }}>
                {formatRupiah(grandTotalAtasan)}
              </div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Akhir Disetujui HRD</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                {formatRupiah(grandTotalHrd)}
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Status & Deviasi Biaya</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span style={{
                  padding: '2px 8px',
                  borderRadius: '4px',
                  fontSize: '0.76rem',
                  fontWeight: '700',
                  backgroundColor: isApproved ? '#dcfce7' : isRejected ? '#fee2e2' : '#fef3c7',
                  color: isApproved ? '#15803d' : isRejected ? '#b91c1c' : '#92400e',
                }}>
                  {isApproved ? 'Disetujui HRD' : isRejected ? 'Ditolak HRD' : 'Menunggu Review HRD'}
                </span>
                {selisihGrandTotal !== 0 && (
                  <span style={{ fontSize: '0.84rem', fontWeight: '700', color: selisihGrandTotal > 0 ? '#b45309' : '#15803d' }}>
                    {selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Catatan HRD Alert if any */}
          {rab.catatan_hrd && (
            <div
              style={{
                marginTop: '8px',
                padding: '6px 12px',
                backgroundColor: isRejected ? '#fef2f2' : '#f0f9ff',
                border: `1px solid ${isRejected ? '#fecaca' : '#bae6fd'}`,
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: isRejected ? '#991b1b' : '#0369a1',
              }}
            >
              <strong>Catatan / Alasan HRD:</strong> {rab.catatan_hrd}
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 20px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('komparasi')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'komparasi' ? '#ffffff' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'komparasi' ? '#cbd5e1 #cbd5e1 #ffffff #cbd5e1' : 'transparent',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                color: activeTab === 'komparasi' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'komparasi' ? '700' : '600',
                cursor: 'pointer',
                fontSize: '0.84rem',
                marginBottom: '-1px',
              }}
            >
              Tabel Komparasi Rincian (Atasan vs HRD)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('komponen_summary')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'komponen_summary' ? '#ffffff' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'komponen_summary' ? '#cbd5e1 #cbd5e1 #ffffff #cbd5e1' : 'transparent',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                color: activeTab === 'komponen_summary' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'komponen_summary' ? '700' : '600',
                cursor: 'pointer',
                fontSize: '0.84rem',
                marginBottom: '-1px',
              }}
            >
              Total Akumulasi per Komponen ({summaryPerKomponen.length} Komponen)
            </button>
          </div>
        </div>

        {/* Body Content */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          {activeTab === 'komparasi' ? (
            <div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.74rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '6px 10px', width: '35px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left' }}>Komponen & Jadwal</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: '110px' }}>Kategori</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '20%' }}>Pengajuan Awal Atasan</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '20%' }}>Persetujuan Final HRD</th>
                      <th style={{ padding: '6px 10px', textAlign: 'right', width: '15%' }}>Selisih Biaya</th>
                      <th style={{ padding: '6px 10px', textAlign: 'left', width: '15%' }}>Keterangan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {details.map((item, idx) => {
                      const qAtasan = Number(item.jumlah) || 1;
                      const pAtasan = parseFloat(item.harga_satuan) || 0;
                      const totAtasan = parseFloat(item.total) || (qAtasan * pAtasan);

                      const qHrd = item.jumlah_hrd !== null && item.jumlah_hrd !== undefined ? Number(item.jumlah_hrd) : qAtasan;
                      const pHrd = item.harga_satuan_hrd !== null && item.harga_satuan_hrd !== undefined ? parseFloat(item.harga_satuan_hrd) : pAtasan;
                      const totHrd = item.total_hrd !== null && item.total_hrd !== undefined ? parseFloat(item.total_hrd) : (qHrd * pHrd);

                      const selisih = totHrd - totAtasan;
                      const isAdjusted = selisih !== 0 || qHrd !== qAtasan || pHrd !== pAtasan;

                      return (
                        <tr key={item.id || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: isAdjusted ? '#fffbeb' : idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                          <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                          <td style={{ padding: '6px 10px' }}>
                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{item.nama_komponen}</div>
                            <div style={{ fontSize: '0.72rem', color: '#64748b' }}>
                              {item.tipe_komponen === 'sekali' ? (
                                <>
                                  <span style={{ color: '#d97706', fontWeight: '600' }}>Sekali Pakai</span>
                                  {item.tanggal && (
                                    <span style={{ color: '#64748b', fontWeight: '400' }}>
                                      {' '}({formatDateLabel(item.tanggal)})
                                    </span>
                                  )}
                                </>
                              ) : (
                                item.tanggal ? `${formatDateLabel(item.tanggal)}` : 'Harian'
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{item.kategori || 'Umum'}</span>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                            <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{qAtasan} × {formatRupiah(pAtasan)}</div>
                            <div style={{ fontWeight: '700', color: '#334155' }}>{formatRupiah(totAtasan)}</div>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', backgroundColor: '#f0fdf4' }}>
                            <div style={{ fontSize: '0.74rem', color: '#166534' }}>{qHrd} × {formatRupiah(pHrd)}</div>
                            <div style={{ fontWeight: '800', color: '#15803d' }}>{formatRupiah(totHrd)}</div>
                          </td>
                          <td style={{ padding: '6px 10px', textAlign: 'right', fontWeight: '700' }}>
                            {selisih === 0 ? (
                              <span style={{ color: '#64748b' }}>Sesuai</span>
                            ) : selisih > 0 ? (
                              <span style={{ color: '#b45309' }}>+{formatRupiah(selisih)}</span>
                            ) : (
                              <span style={{ color: '#16a34a' }}>{formatRupiah(selisih)}</span>
                            )}
                          </td>
                          <td style={{ padding: '6px 10px' }}>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{item.keterangan || '-'}</div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr style={{ backgroundColor: '#e2e8f0', fontWeight: '800', borderTop: '2px solid #cbd5e1' }}>
                      <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.84rem', color: '#0f172a' }}>TOTAL KESELURUHAN:</td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: '#334155' }}>
                        {formatRupiah(grandTotalAtasan)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.94rem', color: '#15803d' }}>
                        {formatRupiah(grandTotalHrd)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b' }}>
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
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px', width: '35px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Nama Komponen Biaya</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '130px' }}>Tipe / Kategori</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '20%' }}>Total Pengajuan Awal</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '20%' }}>Total Disetujui HRD</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '16%' }}>Selisih Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryPerKomponen.map((comp, idx) => (
                      <tr key={comp.id_komponen || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                        <td style={{ padding: '6px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '6px 10px' }}>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{comp.nama_komponen}</div>
                          <div style={{ fontSize: '0.72rem', color: '#64748b' }}>Satuan: {comp.satuan || '-'}</div>
                        </td>
                        <td style={{ padding: '6px 10px' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.72rem',
                            fontWeight: '600',
                            backgroundColor: comp.tipe_komponen === 'harian' ? '#e0f2fe' : '#fef3c7',
                            color: comp.tipe_komponen === 'harian' ? '#0369a1' : '#92400e',
                          }}>
                            {comp.tipe_komponen === 'harian' ? 'Harian' : 'Sekali'}
                          </span>{' '}
                          <span style={{ fontSize: '0.72rem', color: '#64748b' }}>({comp.kategori})</span>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>{comp.total_jumlah_atasan} {comp.satuan || ''}</div>
                          <div style={{ fontWeight: '700', color: '#334155' }}>
                            {formatRupiah(comp.total_biaya_atasan)}
                          </div>
                        </td>
                        <td style={{ padding: '6px 10px', textAlign: 'right', backgroundColor: '#f0fdf4' }}>
                          <div style={{ fontSize: '0.74rem', color: '#166534' }}>{comp.total_jumlah_hrd} {comp.satuan || ''}</div>
                          <div style={{ fontWeight: '800', color: '#15803d' }}>
                            {formatRupiah(comp.total_biaya_hrd)}
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
                        {formatRupiah(grandTotalHrd)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b' }}>
                        {selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '12px 20px',
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
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
        </div>
      </div>
    </div>
  );
};

export default UserRabReviewModal;
