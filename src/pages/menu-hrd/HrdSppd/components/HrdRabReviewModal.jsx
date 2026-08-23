import React, { useState, useEffect, useMemo } from 'react';
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
  masterKomponenList,
  onReviewSubmit,
}) => {
  const [items, setItems] = useState([]);
  const [catatan, setCatatan] = useState('');
  const [activeTab, setActiveTab] = useState('rincian'); // 'rincian' | 'komponen_summary'

  // Component add state
  const [newCompId, setNewCompId] = useState('');
  const [newCompDate, setNewCompDate] = useState('');

  useEffect(() => {
    if (rab && rab.details) {
      setItems(
        rab.details.map((d) => {
          const qAtasan = Number(d.jumlah) || 1;
          const pAtasan = parseFloat(d.harga_satuan) || 0;
          const tAtasan = parseFloat(d.total) || (qAtasan * pAtasan);

          const qHrd = d.jumlah_hrd !== null && d.jumlah_hrd !== undefined ? Number(d.jumlah_hrd) : qAtasan;
          const pHrd = d.harga_satuan_hrd !== null && d.harga_satuan_hrd !== undefined ? parseFloat(d.harga_satuan_hrd) : pAtasan;
          const tHrd = d.total_hrd !== null && d.total_hrd !== undefined ? parseFloat(d.total_hrd) : (qHrd * pHrd);

          return {
            id: d.id,
            id_komponen: d.id_komponen,
            nama_komponen: d.nama_komponen,
            kategori: d.kategori,
            satuan: d.satuan,
            tanggal: d.tanggal || null,
            tipe_komponen: d.tipe_komponen || 'harian',
            // Atasan values
            jumlah_atasan: qAtasan,
            harga_satuan_atasan: pAtasan,
            total_atasan: tAtasan,
            // HRD values (editable)
            jumlah_hrd: qHrd,
            harga_satuan_hrd: pHrd,
            total_hrd: tHrd,
            keterangan: d.keterangan || '',
          };
        })
      );
      setCatatan(rab.catatan_hrd || '');
      setNewCompDate(rab.tanggal_mulai || '');
    } else {
      setItems([]);
      setCatatan('');
    }
  }, [rab, show]);

  const canEditHrd = useMemo(() => {
    if (!rab) return false;
    const todayStr = new Date().toISOString().split('T')[0];
    const endStr = rab.tanggal_selesai || '';
    return endStr ? todayStr <= endStr : true;
  }, [rab]);

  // Component-level aggregation summary
  const summaryPerKomponen = useMemo(() => {
    const map = {};
    items.forEach((it) => {
      if (!map[it.id_komponen]) {
        map[it.id_komponen] = {
          id_komponen: it.id_komponen,
          nama_komponen: it.nama_komponen,
          kategori: it.kategori,
          satuan: it.satuan,
          tipe_komponen: it.tipe_komponen,
          total_qty_atasan: 0,
          total_biaya_atasan: 0,
          total_qty_hrd: 0,
          total_biaya_hrd: 0,
          selisih_biaya: 0,
        };
      }
      map[it.id_komponen].total_qty_atasan += Number(it.jumlah_atasan) || 0;
      map[it.id_komponen].total_biaya_atasan += parseFloat(it.total_atasan) || 0;
      map[it.id_komponen].total_qty_hrd += Number(it.jumlah_hrd) || 0;
      map[it.id_komponen].total_biaya_hrd += parseFloat(it.total_hrd) || 0;
      map[it.id_komponen].selisih_biaya = map[it.id_komponen].total_biaya_hrd - map[it.id_komponen].total_biaya_atasan;
    });
    return Object.values(map);
  }, [items]);

  if (!show || !rab) return null;

  // Date options for adding daily items
  const dateOptions = [];
  if (rab.tanggal_mulai && rab.tanggal_selesai) {
    const start = new Date(rab.tanggal_mulai);
    const end = new Date(rab.tanggal_selesai);
    const curr = new Date(start);
    while (curr <= end) {
      const yyyy = curr.getFullYear();
      const mm = String(curr.getMonth() + 1).padStart(2, '0');
      const dd = String(curr.getDate()).padStart(2, '0');
      dateOptions.push(`${yyyy}-${mm}-${dd}`);
      curr.setDate(curr.getDate() + 1);
    }
  }

  const handlePriceChange = (index, val) => {
    const num = parseFloat(val) || 0;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const qty = Number(item.jumlah_hrd) || 1;
          return { ...item, harga_satuan_hrd: num, total_hrd: num * qty };
        }
        return item;
      })
    );
  };

  const handleQtyChange = (index, val) => {
    const num = parseInt(val) || 1;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          const price = parseFloat(item.harga_satuan_hrd) || 0;
          return { ...item, jumlah_hrd: num, total_hrd: num * price };
        }
        return item;
      })
    );
  };

  const handleKeteranganChange = (index, val) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx === index) {
          return { ...item, keterangan: val };
        }
        return item;
      })
    );
  };

  const handleAddItem = () => {
    const compId = Number(newCompId);
    if (!compId) return;
    const found = (masterKomponenList || []).find((k) => k.id === compId);
    if (!found) return;

    const isHarian = (found.tipe_komponen || 'harian') === 'harian';
    const firstDay = rab.tanggal_mulai ? (typeof rab.tanggal_mulai === 'string' ? rab.tanggal_mulai.split('T')[0] : '') : null;
    const targetDate = isHarian ? (newCompDate || firstDay) : firstDay;

    setItems((prev) => [
      ...prev,
      {
        id_komponen: found.id,
        nama_komponen: found.nama_komponen,
        kategori: found.kategori,
        satuan: found.satuan,
        tanggal: targetDate,
        tipe_komponen: found.tipe_komponen || 'harian',
        jumlah_atasan: 0,
        harga_satuan_atasan: 0,
        total_atasan: 0,
        jumlah_hrd: 1,
        harga_satuan_hrd: 0,
        total_hrd: 0,
        keterangan: isHarian ? `Tambahan HRD (${targetDate})` : `Tambahan HRD (${firstDay || 'Hari ke-1'})`,
      },
    ]);

    setNewCompId('');
  };

  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Group items into daily vs once
  const dailyGrouped = {};
  const onceList = [];
  let totalPengajuanAtasan = 0;
  let totalPenyesuaianHrd = 0;

  items.forEach((it, idx) => {
    const itemWithIdx = { ...it, originalIndex: idx };
    totalPengajuanAtasan += it.total_atasan || 0;
    totalPenyesuaianHrd += it.total_hrd || 0;

    if (it.tipe_komponen === 'harian') {
      const tglKey = it.tanggal || 'Harian Umum';
      if (!dailyGrouped[tglKey]) dailyGrouped[tglKey] = [];
      dailyGrouped[tglKey].push(itemWithIdx);
    } else {
      onceList.push(itemWithIdx);
    }
  });

  const selisihGrandTotal = totalPenyesuaianHrd - totalPengajuanAtasan;

  // Handle Approve / Save
  const handleApprove = () => {
    if (!canEditHrd) {
      Swal.fire('Peringatan', 'Masa dinas telah berakhir. Rincian biaya tidak dapat diubah.', 'warning');
      return;
    }
    onReviewSubmit(rab.id, 'approved', catatan, items);
  };

  // Handle Reject with mandatory note
  const handleReject = async () => {
    const { value: alasanReject } = await Swal.fire({
      title: 'Tolak RAB & SPPD',
      text: 'Harap masukkan alasan penolakan rincian anggaran biaya ini:',
      input: 'textarea',
      inputPlaceholder: 'Tuliskan alasan penolakan...',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Tolak RAB',
      cancelButtonText: 'Batal',
      inputValidator: (val) => {
        if (!val || !val.trim()) {
          return 'Alasan penolakan wajib diisi oleh HRD!';
        }
      },
    });

    if (alasanReject) {
      onReviewSubmit(rab.id, 'rejected', alasanReject, items);
    }
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
          maxWidth: '1080px',
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
              Review & Penyesuaian Anggaran Biaya (RAB) - HRD
            </div>
            <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginTop: '2px' }}>
              SPPD: <span style={{ color: '#f8fafc', fontWeight: '600' }}>{rab.nomor_sppd}</span> | Karyawan: <span style={{ color: '#f8fafc', fontWeight: '600' }}>{rab.nama_karyawan}</span> | Periode: {rab.tanggal_mulai} s/d {rab.tanggal_selesai} ({rab.total_hari} Hari)
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
          {!canEditHrd ? (
            <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fef3c7', padding: '6px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.8rem', color: '#92400e' }}>
              <strong>Masa Dinas Berakhir ({rab.tanggal_selesai}):</strong> Rincian biaya terkunci (read-only) dan tidak dapat diubah kembali.
            </div>
          ) : (
            <div style={{ backgroundColor: '#f0f9ff', border: '1px solid #e0f2fe', padding: '6px 12px', borderRadius: '6px', marginBottom: '8px', fontSize: '0.8rem', color: '#0369a1' }}>
              <strong>Batas Waktu Penyesuaian:</strong> HRD dapat mengubah nominal biaya komponen sewaktu-waktu selama dinas berlangsung hingga <strong>{rab.tanggal_selesai}</strong>. Nilai awal atasan tetap tersimpan utuh di sistem.
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Total Pengajuan Atasan</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: '#334155', marginTop: '2px' }}>
                {formatRupiah(totalPengajuanAtasan)}
              </div>
            </div>
            <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>Total Penyesuaian HRD</div>
              <div style={{ fontSize: '1.15rem', fontWeight: '800', color: '#15803d', marginTop: '2px' }}>
                {formatRupiah(totalPenyesuaianHrd)}
              </div>
            </div>
            <div style={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '8px 12px' }}>
              <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Selisih / Deviasi</div>
              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b', marginTop: '2px' }}>
                {selisihGrandTotal === 0 ? 'Sesuai Pengajuan' : (selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal))}
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{ padding: '0 20px', backgroundColor: '#f1f5f9', borderBottom: '1px solid #cbd5e1' }}>
          <div style={{ display: 'flex', gap: '4px' }}>
            <button
              type="button"
              onClick={() => setActiveTab('rincian')}
              style={{
                padding: '8px 16px',
                background: activeTab === 'rincian' ? '#ffffff' : 'transparent',
                border: '1px solid',
                borderColor: activeTab === 'rincian' ? '#cbd5e1 #cbd5e1 #ffffff #cbd5e1' : 'transparent',
                borderTopLeftRadius: '6px',
                borderTopRightRadius: '6px',
                color: activeTab === 'rincian' ? '#0f172a' : '#64748b',
                fontWeight: activeTab === 'rincian' ? '700' : '600',
                cursor: 'pointer',
                fontSize: '0.84rem',
                marginBottom: '-1px',
              }}
            >
              Penyesuaian Biaya per Tanggal & Komponen
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

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          {activeTab === 'rincian' ? (
            <div>
              {/* Add New Component Bar */}
              {canEditHrd && (
                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', padding: '10px 14px', marginBottom: '14px' }}>
                  <div style={{ fontWeight: '700', fontSize: '0.84rem', color: '#334155', marginBottom: '6px' }}>
                    Tambah Komponen Biaya Baru (Tambahan HRD):
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr', gap: '10px', alignItems: 'center' }}>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.88rem', padding: '6px 12px', height: '38px', backgroundColor: '#fff', color: '#1e293b' }}
                      value={newCompId}
                      onChange={(e) => setNewCompId(e.target.value)}
                    >
                      <option value="">-- Pilih Master Komponen --</option>
                      {(masterKomponenList || []).map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama_komponen} ({k.tipe_komponen || 'harian'} - {k.kategori})
                        </option>
                      ))}
                    </select>
                    <select
                      className="form-select"
                      style={{ fontSize: '0.88rem', padding: '6px 12px', height: '38px', backgroundColor: '#fff', color: '#1e293b' }}
                      value={newCompDate}
                      onChange={(e) => setNewCompDate(e.target.value)}
                    >
                      <option value="">Komponen Sekali / Tanpa Tanggal</option>
                      {dateOptions.map((dStr) => (
                        <option key={dStr} value={dStr}>
                          {formatDateLabel(dStr)} ({dStr})
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      style={{
                        backgroundColor: newCompId ? '#0284c7' : '#64748b',
                        color: '#ffffff',
                        border: 'none',
                        height: '38px',
                        borderRadius: '6px',
                        fontSize: '0.86rem',
                        fontWeight: '700',
                        cursor: newCompId ? 'pointer' : 'not-allowed',
                      }}
                      onClick={handleAddItem}
                      disabled={!newCompId}
                    >
                      + Tambah ke Daftar
                    </button>
                  </div>
                </div>
              )}

              {/* Bagian A: Harian Grouped */}
              {Object.keys(dailyGrouped).length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    A. Rincian Biaya Harian
                  </div>
                  {Object.keys(dailyGrouped).map((dateKey) => (
                    <div
                      key={dateKey}
                      style={{
                        border: '1px solid #e2e8f0',
                        borderRadius: '6px',
                        marginBottom: '12px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: '#f1f5f9',
                          borderBottom: '1px solid #e2e8f0',
                          padding: '7px 12px',
                          fontWeight: '700',
                          fontSize: '0.84rem',
                          color: '#1e293b',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <span>{formatDateLabel(dateKey)} ({dateKey})</span>
                        <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: '600' }}>
                          {dailyGrouped[dateKey].length} Komponen
                        </span>
                      </div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                            <th style={{ padding: '8px 10px', textAlign: 'left', width: '22%' }}>Komponen</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', width: '18%' }}>Pengajuan Atasan</th>
                            <th style={{ padding: '8px 8px', textAlign: 'center', width: '9%' }}>Qty HRD</th>
                            <th style={{ padding: '8px 8px', textAlign: 'right', width: '16%' }}>Harga HRD (Rp)</th>
                            <th style={{ padding: '8px 10px', textAlign: 'right', width: '15%' }}>Total HRD (Rp)</th>
                            <th style={{ padding: '8px 8px', textAlign: 'left', width: '14%' }}>Keterangan HRD</th>
                            {canEditHrd && <th style={{ padding: '8px 6px', textAlign: 'center', width: '6%' }}>Aksi</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {dailyGrouped[dateKey].map((item) => (
                            <tr key={item.originalIndex} style={{ borderBottom: '1px solid #f1f5f9' }}>
                              <td style={{ padding: '8px 10px' }}>
                                <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.nama_komponen}</div>
                                <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Satuan: {item.satuan || '-'}</div>
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
                                <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{item.jumlah_atasan} × {formatRupiah(item.harga_satuan_atasan)}</div>
                                <div style={{ fontWeight: '700', color: '#334155' }}>{formatRupiah(item.total_atasan)}</div>
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <input
                                  type="number"
                                  className="form-control"
                                  style={{ fontSize: '0.86rem', textAlign: 'center', padding: '5px 8px' }}
                                  min="1"
                                  disabled={!canEditHrd}
                                  value={item.jumlah_hrd}
                                  onChange={(e) => handleQtyChange(item.originalIndex, e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <input
                                  type="number"
                                  className="form-control"
                                  style={{ fontSize: '0.86rem', textAlign: 'right', padding: '5px 8px' }}
                                  min="0"
                                  step="1000"
                                  disabled={!canEditHrd}
                                  value={item.harga_satuan_hrd}
                                  onChange={(e) => handlePriceChange(item.originalIndex, e.target.value)}
                                />
                              </td>
                              <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#16a34a' }}>
                                {formatRupiah(item.total_hrd)}
                              </td>
                              <td style={{ padding: '6px 8px' }}>
                                <input
                                  type="text"
                                  className="form-control"
                                  style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                                  placeholder="Catatan..."
                                  disabled={!canEditHrd}
                                  value={item.keterangan}
                                  onChange={(e) => handleKeteranganChange(item.originalIndex, e.target.value)}
                                />
                              </td>
                              {canEditHrd && (
                                <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                                  <button
                                    type="button"
                                    style={{
                                      backgroundColor: '#fee2e2',
                                      color: '#dc2626',
                                      border: '1px solid #fca5a5',
                                      borderRadius: '4px',
                                      padding: '4px 8px',
                                      fontSize: '0.78rem',
                                      fontWeight: '700',
                                      cursor: 'pointer',
                                    }}
                                    onClick={() => handleRemoveItem(item.originalIndex)}
                                    title="Hapus baris"
                                  >
                                    Hapus
                                  </button>
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              )}

              {/* Bagian B: Sekali Pakai */}
              {onceList.length > 0 && (
                <div style={{ marginBottom: '16px' }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                    B. Rincian Biaya Sekali Pakai / Logistik
                  </div>
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                          <th style={{ padding: '8px 10px', textAlign: 'left', width: '22%' }}>Komponen</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right', width: '18%' }}>Pengajuan Atasan</th>
                          <th style={{ padding: '8px 8px', textAlign: 'center', width: '9%' }}>Qty HRD</th>
                          <th style={{ padding: '8px 8px', textAlign: 'right', width: '16%' }}>Harga HRD (Rp)</th>
                          <th style={{ padding: '8px 10px', textAlign: 'right', width: '15%' }}>Total HRD (Rp)</th>
                          <th style={{ padding: '8px 8px', textAlign: 'left', width: '14%' }}>Keterangan HRD</th>
                          {canEditHrd && <th style={{ padding: '8px 6px', textAlign: 'center', width: '6%' }}>Aksi</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {onceList.map((item) => (
                          <tr key={item.originalIndex} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '8px 10px' }}>
                              <div style={{ fontWeight: '600', color: '#1e293b' }}>{item.nama_komponen}</div>
                              <div style={{ fontSize: '0.74rem', color: '#64748b' }}>
                                Satuan: {item.satuan || '-'}
                                {item.tanggal && (
                                  <span style={{ marginLeft: '6px', color: '#0284c7', fontWeight: '600' }}>
                                    • {formatDateLabel(item.tanggal)}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', backgroundColor: '#f8fafc' }}>
                              <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{item.jumlah_atasan} × {formatRupiah(item.harga_satuan_atasan)}</div>
                              <div style={{ fontWeight: '700', color: '#334155' }}>{formatRupiah(item.total_atasan)}</div>
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ fontSize: '0.86rem', textAlign: 'center', padding: '5px 8px' }}
                                min="1"
                                disabled={!canEditHrd}
                                value={item.jumlah_hrd}
                                onChange={(e) => handleQtyChange(item.originalIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                className="form-control"
                                style={{ fontSize: '0.86rem', textAlign: 'right', padding: '5px 8px' }}
                                min="0"
                                step="1000"
                                disabled={!canEditHrd}
                                value={item.harga_satuan_hrd}
                                onChange={(e) => handlePriceChange(item.originalIndex, e.target.value)}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700', color: '#ca8a04' }}>
                              {formatRupiah(item.total_hrd)}
                            </td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="text"
                                className="form-control"
                                style={{ fontSize: '0.82rem', padding: '5px 8px' }}
                                placeholder="Catatan..."
                                disabled={!canEditHrd}
                                value={item.keterangan}
                                onChange={(e) => handleKeteranganChange(item.originalIndex, e.target.value)}
                              />
                            </td>
                            {canEditHrd && (
                              <td style={{ padding: '6px 6px', textAlign: 'center' }}>
                                <button
                                  type="button"
                                  style={{
                                    backgroundColor: '#fee2e2',
                                    color: '#dc2626',
                                    border: '1px solid #fca5a5',
                                    borderRadius: '4px',
                                    padding: '4px 8px',
                                    fontSize: '0.78rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                  }}
                                  onClick={() => handleRemoveItem(item.originalIndex)}
                                  title="Hapus baris"
                                >
                                  Hapus
                                </button>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Catatan Tambahan HRD */}
              <div style={{ marginTop: '12px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.84rem', color: '#334155', marginBottom: '4px', display: 'block' }}>
                  Catatan / Instruksi HRD (Opsional):
                </label>
                <textarea
                  className="form-control"
                  style={{ fontSize: '0.84rem' }}
                  rows="2"
                  placeholder="Masukkan catatan atau instruksi penyesuaian biaya dinas bila ada..."
                  disabled={!canEditHrd}
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                ></textarea>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ border: '1px solid #e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#0f172a', color: '#ffffff', fontSize: '0.76rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px', width: '35px', textAlign: 'center' }}>No</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Nama Komponen Biaya</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '130px' }}>Tipe / Kategori</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '20%' }}>Total Pengajuan Atasan</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '20%' }}>Total Disetujui HRD</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '16%' }}>Selisih Biaya</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summaryPerKomponen.map((comp, idx) => (
                      <tr key={comp.id_komponen || idx} style={{ borderBottom: '1px solid #f1f5f9', backgroundColor: idx % 2 === 1 ? '#f8fafc' : '#ffffff' }}>
                        <td style={{ padding: '8px 10px', textAlign: 'center', color: '#64748b' }}>{idx + 1}</td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontWeight: '700', color: '#1e293b' }}>{comp.nama_komponen}</div>
                          <div style={{ fontSize: '0.74rem', color: '#64748b' }}>Satuan: {comp.satuan || '-'}</div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
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
                          <span style={{ fontSize: '0.74rem', color: '#64748b' }}>({comp.kategori})</span>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right' }}>
                          <div style={{ fontSize: '0.76rem', color: '#64748b' }}>{comp.total_qty_atasan} {comp.satuan || ''}</div>
                          <div style={{ fontWeight: '700', color: '#334155' }}>
                            {formatRupiah(comp.total_biaya_atasan)}
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', backgroundColor: '#f0fdf4' }}>
                          <div style={{ fontSize: '0.76rem', color: '#166534' }}>{comp.total_qty_hrd} {comp.satuan || ''}</div>
                          <div style={{ fontWeight: '800', color: '#15803d' }}>
                            {formatRupiah(comp.total_biaya_hrd)}
                          </div>
                        </td>
                        <td style={{ padding: '8px 10px', textAlign: 'right', fontWeight: '700' }}>
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
                      <td colSpan="3" style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.86rem', color: '#0f172a' }}>
                        GRAND TOTAL KESELURUHAN:
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.88rem', color: '#334155' }}>
                        {formatRupiah(totalPengajuanAtasan)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.96rem', color: '#15803d' }}>
                        {formatRupiah(totalPenyesuaianHrd)}
                      </td>
                      <td style={{ padding: '8px 10px', textAlign: 'right', fontSize: '0.88rem', color: selisihGrandTotal > 0 ? '#b45309' : selisihGrandTotal < 0 ? '#15803d' : '#64748b' }}>
                        {selisihGrandTotal > 0 ? `+${formatRupiah(selisihGrandTotal)}` : formatRupiah(selisihGrandTotal)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
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

          {canEditHrd && (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                style={{
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
                }}
                onClick={handleReject}
              >
                Tolak RAB & SPPD
              </button>
              <button
                type="button"
                style={{
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  border: 'none',
                  padding: '8px 22px',
                  borderRadius: '6px',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  boxShadow: '0 1px 3px rgba(22, 163, 74, 0.3)',
                }}
                onClick={handleApprove}
              >
                {rab.status === 'approved' ? 'Simpan Penyesuaian' : 'Setujui RAB'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HrdRabReviewModal;
