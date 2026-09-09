import React, { useState, useEffect, useMemo } from 'react';
import Swal from 'sweetalert2';
import { getActiveMasterKomponen } from '../services/dinasService';

// Helper to generate array of dates between start and end date
const getDatesInRange = (startDateStr, endDateStr) => {
  const dates = [];
  if (!startDateStr || !endDateStr) return dates;

  const start = new Date(startDateStr);
  const end = new Date(endDateStr);

  const curr = new Date(start);
  while (curr <= end) {
    const yyyy = curr.getFullYear();
    const mm = String(curr.getMonth() + 1).padStart(2, '0');
    const dd = String(curr.getDate()).padStart(2, '0');
    dates.push(`${yyyy}-${mm}-${dd}`);
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
};

const formatDateLabel = (dateStr, dayIndex) => {
  const d = new Date(dateStr);
  const formatted = d.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  return `Hari ke-${dayIndex + 1} (${formatted})`;
};

const formatRupiah = (val) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(val || 0);
};

const RabFormModal = ({
  show,
  onClose,
  sppd,
  idSppd,
  masterKomponenList: initialMasterList,
  existingRab,
  existingDetails,
  onSubmitRab,
  onSubmit,
  isRevisi,
}) => {
  const [internalMasterList, setInternalMasterList] = useState(initialMasterList || []);

  useEffect(() => {
    if (initialMasterList && initialMasterList.length > 0) {
      setInternalMasterList(initialMasterList);
    } else if (show) {
      getActiveMasterKomponen()
        .then((res) => setInternalMasterList(res.data || []))
        .catch((err) => console.error('Error fetching active master komponen for RAB form:', err));
    }
  }, [show, initialMasterList]);

  // Dates in SPPD range
  const dates = useMemo(() => {
    if (!sppd) return [];
    return getDatesInRange(sppd.tanggal_mulai, sppd.tanggal_selesai);
  }, [sppd]);

  // Split master into Harian & Sekali
  const harianMaster = useMemo(() => {
    return (internalMasterList || []).filter((k) => (k.tipe_komponen || 'harian') === 'harian');
  }, [internalMasterList]);

  const sekaliMaster = useMemo(() => {
    return (internalMasterList || []).filter((k) => k.tipe_komponen === 'sekali');
  }, [internalMasterList]);

  // State: dailyItems: { [dateStr]: [ { id_komponen, nama_komponen, kategori, satuan, harga_satuan, selected } ] }
  const [dailyItems, setDailyItems] = useState({});

  // State: onceItems: [ { id_komponen, nama_komponen, kategori, satuan, harga_satuan, jumlah, selected } ]
  const [onceItems, setOnceItems] = useState([]);

  // Active Tab for daily view: selected date or 'all'
  const [activeDateTab, setActiveDateTab] = useState('');

  useEffect(() => {
    if (show && sppd && dates.length > 0) {
      const details =
        existingDetails ||
        existingRab?.details ||
        sppd.rab_details ||
        [];

      // Initialize daily items for each date
      const initialDaily = {};
      dates.forEach((d) => {
        initialDaily[d] = harianMaster.map((k) => {
          const matched = details.find(
            (det) =>
              Number(det.id_komponen) === Number(k.id) &&
              det.tanggal === d &&
              det.tipe_komponen !== 'sekali'
          );
          const price = matched ? parseFloat(matched.harga_satuan) || 0 : 0;
          return {
            id_komponen: k.id,
            nama_komponen: k.nama_komponen,
            kategori: k.kategori,
            satuan: k.satuan,
            harga_satuan: price,
            selected: price > 0 || !!matched,
          };
        });
      });
      setDailyItems(initialDaily);
      setActiveDateTab(dates[0] || '');

      // Initialize once items
      const initialOnce = sekaliMaster.map((k) => {
        const matched = details.find(
          (det) =>
            Number(det.id_komponen) === Number(k.id) &&
            (det.tipe_komponen === 'sekali' || (!det.tanggal && det.tipe_komponen !== 'harian'))
        );
        const price = matched ? parseFloat(matched.harga_satuan) || 0 : 0;
        const qty = matched ? Number(matched.jumlah) || 1 : 1;
        return {
          id_komponen: k.id,
          nama_komponen: k.nama_komponen,
          kategori: k.kategori,
          satuan: k.satuan,
          harga_satuan: price,
          jumlah: qty,
          selected: price > 0 || !!matched,
        };
      });
      setOnceItems(initialOnce);
    }
  }, [show, sppd, dates, harianMaster, sekaliMaster, existingDetails, existingRab]);

  if (!show || !sppd) return null;

  // Handle Daily Item change
  const handleDailyToggle = (dateStr, compId) => {
    setDailyItems((prev) => {
      const itemsForDate = prev[dateStr] || [];
      const updated = itemsForDate.map((item) =>
        item.id_komponen === compId ? { ...item, selected: !item.selected } : item
      );
      return { ...prev, [dateStr]: updated };
    });
  };

  const handleDailyPriceChange = (dateStr, compId, val) => {
    const num = parseFloat(val) || 0;
    setDailyItems((prev) => {
      const itemsForDate = prev[dateStr] || [];
      const updated = itemsForDate.map((item) =>
        item.id_komponen === compId
          ? { ...item, harga_satuan: num, selected: num > 0 ? true : item.selected }
          : item
      );
      return { ...prev, [dateStr]: updated };
    });
  };

  // Copy current day's values to all other days
  const handleCopyDayToAll = (fromDateStr) => {
    const currentValues = dailyItems[fromDateStr] || [];
    setDailyItems((prev) => {
      const updated = { ...prev };
      dates.forEach((d) => {
        updated[d] = currentValues.map((item) => ({ ...item }));
      });
      return updated;
    });

    Swal.fire({
      icon: 'success',
      title: 'Disalin',
      text: `Rincian biaya dari ${formatDateLabel(fromDateStr, dates.indexOf(fromDateStr))} berhasil disalin ke seluruh tanggal dinas!`,
      timer: 1500,
      showConfirmButton: false,
    });
  };

  // Handle Once Item change
  const handleOnceToggle = (compId) => {
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const handleOncePriceChange = (compId, val) => {
    const num = parseFloat(val) || 0;
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId
          ? { ...item, harga_satuan: num, selected: num > 0 ? true : item.selected }
          : item
      )
    );
  };

  const handleOnceQtyChange = (compId, val) => {
    const num = parseInt(val) || 1;
    setOnceItems((prev) =>
      prev.map((item) =>
        item.id_komponen === compId ? { ...item, jumlah: Math.max(1, num) } : item
      )
    );
  };

  // Calculate Subtotals
  let totalHarian = 0;
  Object.keys(dailyItems).forEach((d) => {
    const list = dailyItems[d] || [];
    list.forEach((item) => {
      if (item.selected && item.harga_satuan > 0) {
        totalHarian += item.harga_satuan;
      }
    });
  });

  let totalSekali = 0;
  onceItems.forEach((item) => {
    if (item.selected && item.harga_satuan > 0) {
      totalSekali += item.harga_satuan * (item.jumlah || 1);
    }
  });

  const grandTotal = totalHarian + totalSekali;

  const handleSubmit = (e) => {
    e.preventDefault();

    const payloadDetails = [];

    // Collect daily details
    Object.keys(dailyItems).forEach((dateStr) => {
      const list = dailyItems[dateStr] || [];
      list.forEach((item) => {
        if (item.selected && item.harga_satuan > 0) {
          payloadDetails.push({
            id_komponen: item.id_komponen,
            tanggal: dateStr,
            tipe_komponen: 'harian',
            jumlah: 1,
            harga_satuan: item.harga_satuan,
            total: item.harga_satuan,
            keterangan: `${item.nama_komponen}`,
          });
        }
      });
    });

    // Collect once details
    const firstDayDate = dates[0] || (sppd.tanggal_mulai ? sppd.tanggal_mulai.split('T')[0] : null);
    onceItems.forEach((item) => {
      if (item.selected && item.harga_satuan > 0) {
        const qty = item.jumlah || 1;
        payloadDetails.push({
          id_komponen: item.id_komponen,
          tanggal: firstDayDate,
          tipe_komponen: 'sekali',
          jumlah: qty,
          harga_satuan: item.harga_satuan,
          total: item.harga_satuan * qty,
          keterangan: item.nama_komponen,
        });
      }
    });

    if (payloadDetails.length === 0) {
      Swal.fire('Peringatan', 'Silakan pilih dan isi nominal setidaknya satu komponen anggaran!', 'warning');
      return;
    }

    const submitFn = onSubmitRab || onSubmit;
    if (submitFn) {
      submitFn(sppd.id_sppd || idSppd, payloadDetails);
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
          maxWidth: '920px',
          maxHeight: '92vh',
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
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
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '600' }}>
              {isRevisi || existingRab?.status === 'revisi_atasan'
                ? `Revisi Rencana Anggaran Biaya (RAB) - SPPD: ${sppd.nomor_sppd}`
                : `Pengisian Rencana Anggaran Biaya (RAB) - SPPD: ${sppd.nomor_sppd}`}
            </h3>
            <small style={{ color: '#cbd5e1' }}>
              Tujuan: {sppd.alamat_tujuan} | Periode: {sppd.tanggal_mulai} s/d {sppd.tanggal_selesai} ({sppd.total_hari} Hari)
            </small>
          </div>
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

        {/* Catatan Revisi dari Atasan Banner */}
        {(existingRab?.catatan_atasan || sppd?.catatan_atasan) && (
          <div
            style={{
              backgroundColor: '#fffbeb',
              borderBottom: '1px solid #fde68a',
              padding: '10px 20px',
              fontSize: '0.86rem',
              color: '#92400e',
            }}
          >
            <div style={{ fontWeight: '700', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <i className="bi bi-exclamation-triangle-fill" style={{ color: '#d97706' }}></i>
              <span>Catatan Revisi dari Atasan:</span>
            </div>
            <div style={{ color: '#78350f' }}>{existingRab?.catatan_atasan || sppd?.catatan_atasan}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          <div style={{ padding: '20px', overflowY: 'auto' }}>
            {/* Bagian 1: Biaya Harian Per Tanggal Dinas */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f4e78', margin: 0 }}>
                    1. Biaya Harian (Pencatatan Sepanjang Tanggal Dinas)
                  </h4>
                  <small style={{ color: '#64748b' }}>
                    Pilih dan isi komponen biaya per hari (Uang Saku, Uang Makan, Hotel, dll.)
                  </small>
                </div>
                {activeDateTab && (
                  <button
                    type="button"
                    style={{
                      backgroundColor: '#e0f2fe',
                      color: '#0369a1',
                      border: '1px solid #bae6fd',
                      padding: '5px 12px',
                      borderRadius: '5px',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                    onClick={() => handleCopyDayToAll(activeDateTab)}
                    title="Salin nominal hari ini ke seluruh tanggal dinas"
                  >
                    <i className="bi bi-copy me-1"></i> Terapkan ke Semua Hari
                  </button>
                )}
              </div>

              {/* Date Tabs */}
              <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '8px', marginBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
                {dates.map((d, idx) => {
                  const isActive = activeDateTab === d;
                  const dayItems = dailyItems[d] || [];
                  const activeCount = dayItems.filter((it) => it.selected && it.harga_satuan > 0).length;

                  return (
                    <button
                      key={d}
                      type="button"
                      style={{
                        padding: '6px 14px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: isActive ? '#1f4e78' : '#cbd5e1',
                        backgroundColor: isActive ? '#1f4e78' : '#ffffff',
                        color: isActive ? '#ffffff' : '#334155',
                        fontWeight: isActive ? '700' : '500',
                        fontSize: '0.82rem',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                      }}
                      onClick={() => setActiveDateTab(d)}
                    >
                      <span>{formatDateLabel(d, idx)}</span>
                      {activeCount > 0 && (
                        <span
                          style={{
                            backgroundColor: isActive ? '#ffffff' : '#e2e8f0',
                            color: isActive ? '#1f4e78' : '#475569',
                            fontSize: '0.72rem',
                            fontWeight: '700',
                            padding: '1px 6px',
                            borderRadius: '10px',
                          }}
                        >
                          {activeCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Daily Items Table for Active Date Tab */}
              {activeDateTab && (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                    <thead>
                      <tr style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>Pilih</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left' }}>Komponen Biaya Harian</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px' }}>Kategori</th>
                        <th style={{ padding: '8px 10px', textAlign: 'left', width: '90px' }}>Satuan</th>
                        <th style={{ padding: '8px 10px', textAlign: 'right', width: '180px' }}>Nomor / Estimasi Biaya (Rp)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(dailyItems[activeDateTab] || []).length === 0 ? (
                        <tr>
                          <td colSpan="5" className="text-center py-3 text-muted">
                            Belum ada master komponen harian yang aktif.
                          </td>
                        </tr>
                      ) : (
                        (dailyItems[activeDateTab] || []).map((item) => (
                          <tr
                            key={item.id_komponen}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: item.selected ? '#f0fdf4' : '#ffffff',
                            }}
                          >
                            <td style={{ textAlign: 'center', padding: '8px 10px' }}>
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleDailyToggle(activeDateTab, item.id_komponen)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>
                              {item.nama_komponen}
                            </td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{item.kategori}</td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{item.satuan}</td>
                            <td style={{ padding: '6px 10px' }}>
                              <input
                                type="number"
                                className="form-control-clean"
                                style={{ textAlign: 'right', fontWeight: '600', padding: '4px 8px' }}
                                placeholder="0"
                                value={item.harga_satuan || ''}
                                onChange={(e) => handleDailyPriceChange(activeDateTab, item.id_komponen, e.target.value)}
                                min="0"
                                step="1000"
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bagian 2: Biaya Sekali Pakai (Lump-sum) */}
            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ marginBottom: '12px' }}>
                <h4 style={{ fontSize: '1rem', fontWeight: '700', color: '#1f4e78', margin: 0 }}>
                  2. Biaya Sekali Pakai / Lumpsum
                </h4>
                <small style={{ color: '#64748b' }}>
                  Komponen biaya sekali pengeluaran selama perjalanan dinas (Tiket Pesawat, Tol, Bensin, dll.)
                </small>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#e2e8f0', color: '#334155', fontSize: '0.78rem', textTransform: 'uppercase' }}>
                      <th style={{ padding: '8px 10px', width: '40px', textAlign: 'center' }}>Pilih</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left' }}>Komponen Biaya</th>
                      <th style={{ padding: '8px 10px', textAlign: 'left', width: '120px' }}>Kategori</th>
                      <th style={{ padding: '8px 10px', textAlign: 'center', width: '90px' }}>Jumlah (Qty)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '170px' }}>Harga Satuan (Rp)</th>
                      <th style={{ padding: '8px 10px', textAlign: 'right', width: '150px' }}>Subtotal (Rp)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {onceItems.length === 0 ? (
                      <tr>
                        <td colSpan="6" className="text-center py-3 text-muted">
                          Belum ada master komponen sekali pakai yang aktif.
                        </td>
                      </tr>
                    ) : (
                      onceItems.map((item) => {
                        const itemTotal = (item.harga_satuan || 0) * (item.jumlah || 1);
                        return (
                          <tr
                            key={item.id_komponen}
                            style={{
                              borderBottom: '1px solid #f1f5f9',
                              backgroundColor: item.selected ? '#f0fdf4' : '#ffffff',
                            }}
                          >
                            <td style={{ textAlign: 'center', padding: '8px 10px' }}>
                              <input
                                type="checkbox"
                                checked={item.selected}
                                onChange={() => handleOnceToggle(item.id_komponen)}
                                style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                              />
                            </td>
                            <td style={{ padding: '8px 10px', fontWeight: '600', color: '#1e293b' }}>
                              {item.nama_komponen}
                            </td>
                            <td style={{ padding: '8px 10px', color: '#64748b' }}>{item.kategori}</td>
                            <td style={{ padding: '6px 8px' }}>
                              <input
                                type="number"
                                className="form-control-clean"
                                style={{ textAlign: 'center', padding: '4px 6px' }}
                                value={item.jumlah || 1}
                                min="1"
                                onChange={(e) => handleOnceQtyChange(item.id_komponen, e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                className="form-control-clean"
                                style={{ textAlign: 'right', fontWeight: '600', padding: '4px 8px' }}
                                placeholder="0"
                                value={item.harga_satuan || ''}
                                onChange={(e) => handleOncePriceChange(item.id_komponen, e.target.value)}
                                min="0"
                                step="1000"
                              />
                            </td>
                            <td style={{ textAlign: 'right', fontWeight: '700', color: '#1e293b' }}>
                              {formatRupiah(itemTotal)}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Grand Total Summary Box */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f1f5f9', border: '1px solid #cbd5e1', padding: '14px 20px', borderRadius: '8px', marginTop: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.85rem', color: '#475569' }}>
                    Subtotal Harian ({dates.length} Hari): <strong>{formatRupiah(totalHarian)}</strong> | Subtotal Sekali: <strong>{formatRupiah(totalSekali)}</strong>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155', marginRight: '10px' }}>Total Keseluruhan RAB:</span>
                  <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d' }}>{formatRupiah(grandTotal)}</span>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div
              style={{
                padding: '14px 20px',
                backgroundColor: '#f8fafc',
                borderTop: '1px solid #e2e8f0',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
              }}
            >
              <button
                type="button"
                style={{
                  backgroundColor: '#e2e8f0',
                  color: '#334155',
                  border: 'none',
                  padding: '8px 18px',
                  borderRadius: '6px',
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                }}
                onClick={onClose}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn-success-custom"
                style={{ backgroundColor: isRevisi || existingRab?.status === 'revisi_atasan' ? '#d97706' : '#198754' }}
              >
                {isRevisi || existingRab?.status === 'revisi_atasan'
                  ? 'Kirim Revisi RAB ke Atasan'
                  : 'Ajukan RAB ke Atasan'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RabFormModal;
